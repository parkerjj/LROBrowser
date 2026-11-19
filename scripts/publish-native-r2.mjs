import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { createHash, createPublicKey, verify } from 'node:crypto';
import { lstat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import { TextDecoder, parseArgs } from 'node:util';
import { fileURLToPath, URL } from 'node:url';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createR2Client } from './publish-r2.mjs';

const cdn = 'https://client.ltsd.ro/';
const desktopKey = 'native/latest.json';
const linuxKey = 'native/linux.json';
const textType = 'text/plain; charset=utf-8';
const jsonType = 'application/json; charset=utf-8';
const assetCache = 'public, max-age=31536000, immutable';
const feedCache = 'no-store, max-age=0';
const utf8 = new TextDecoder('utf-8', { fatal: true });

const packages = [
  { suffix: 'windows-x64-setup.exe', type: 'application/octet-stream', platforms: ['windows-x86_64'] },
  { suffix: 'macos-universal.dmg', type: 'application/x-apple-diskimage', platforms: [] },
  { suffix: 'macos-universal.app.tar.gz', type: 'application/gzip', platforms: ['darwin-aarch64', 'darwin-x86_64'] },
  { suffix: 'linux-amd64.deb', type: 'application/vnd.debian.binary-package', platforms: ['linux-x86_64-deb'] },
  { suffix: 'linux-arm64.deb', type: 'application/vnd.debian.binary-package', platforms: ['linux-aarch64-deb'] },
  { suffix: 'linux-x86_64.rpm', type: 'application/x-rpm', platforms: ['linux-x86_64-rpm'] },
  { suffix: 'linux-aarch64.rpm', type: 'application/x-rpm', platforms: ['linux-aarch64-rpm'] },
];

function versionParts(version) {
  // Keep every component within the Windows version-resource limit.
  if (typeof version !== 'string' || !/^(?:0|[1-9]\d{0,4})(?:\.(?:0|[1-9]\d{0,4})){2}$/.test(version)) {
    throw new Error('Invalid Native release version');
  }
  const parts = version.split('.').map(Number);
  if (parts.some(part => part > 65535)) throw new Error('Native release version exceeds the Windows limit');
  return parts;
}

function compareVersions(a, b) {
  const left = versionParts(a);
  const right = versionParts(b);
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

function base64(value, label, length) {
  const decoded = Buffer.from(value ?? '', 'base64');
  if (!decoded.length || decoded.toString('base64') !== value || (length !== undefined && decoded.length !== length)) {
    throw new Error(`Invalid ${label}`);
  }
  return decoded;
}

function loadPublicKey(contents) {
  const label = 'Native updater public key';
  const [comment, encoded, ...extra] = utf8.decode(base64(contents?.trim(), label)).trimEnd().split(/\r?\n/);
  if (!comment.startsWith('untrusted comment: ') || extra.length) throw new Error(`Invalid ${label}`);
  const bytes = base64(encoded, label, 42);
  if (!['Ed', 'ED'].includes(bytes.toString('ascii', 0, 2))) throw new Error(`Invalid ${label} algorithm`);
  // RFC 8410 SubjectPublicKeyInfo prefix for a 32-byte Ed25519 public key.
  const prefix = Buffer.from('302a300506032b6570032100', 'hex');
  const key = createPublicKey({ key: Buffer.concat([prefix, bytes.subarray(10)]), type: 'spki', format: 'der' });
  return { key, keyId: bytes.subarray(2, 10) };
}

function checkTauriSignature({ signature, bytes, publicKey, version, filename }) {
  // Tauri encodes a prehashed Minisign signature box as base64. Verify both
  // the payload and trusted comment with Node's Ed25519 implementation.
  const label = `Native updater signature for ${filename}`;
  const [comment, encoded, trustedLine, sealed, ...extra] = utf8.decode(base64(signature, label)).trimEnd().split(/\r?\n/);
  const trustedPrefix = 'trusted comment: ';
  if (!comment.startsWith('untrusted comment: ') || !trustedLine?.startsWith(trustedPrefix) || extra.length) {
    throw new Error(`Invalid ${label} format`);
  }
  const record = base64(encoded, label, 74);
  if (record.toString('ascii', 0, 2) !== 'ED' || !record.subarray(2, 10).equals(publicKey.keyId)) {
    throw new Error(`Invalid ${label} algorithm or key ID`);
  }
  const trusted = trustedLine.slice(trustedPrefix.length);
  const signedVersions = trusted.split('\t').filter(field => field.startsWith('version:'));
  if (signedVersions.length !== 1 || signedVersions[0] !== `version:${version}`) {
    throw new Error(`Wrong signed version in ${label}`);
  }
  const sig = record.subarray(10);
  const digest = createHash('blake2b512').update(bytes).digest();
  const global = base64(sealed, label, 64);
  if (!verify(null, digest, publicKey.key, sig)
    || !verify(null, Buffer.concat([sig, Buffer.from(trusted)]), publicKey.key, global)) {
    throw new Error(`Invalid ${label}`);
  }
}

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const jsonBytes = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);

async function readPackage(file) {
  const stat = await lstat(file);
  if (!stat.isFile() || !stat.size) throw new Error(`Missing or empty Native release file: ${path.basename(file)}`);
  return readFile(file);
}

async function prepareRelease({ directory, version, commit, notes, publishedAt, publicKey }) {
  versionParts(version);
  if (typeof commit !== 'string' || !/^[a-f0-9]{40}$/.test(commit)) throw new Error('Invalid Native release commit');
  const date = new Date(publishedAt);
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid Native release timestamp');
  const common = { version, notes: notes ?? `LRO进阶客户端 ${version}`, pub_date: date.toISOString() };
  const desktop = { ...common, platforms: {} };
  const linux = { ...common, platforms: {} };
  const key = loadPublicKey(publicKey);
  const assets = [];
  const generated = {};
  const prefix = `native/${version}/`;

  for (const item of packages) {
    const filename = `LRO-Client-${version}-${item.suffix}`;
    const file = path.join(directory, filename);
    const bytes = await readPackage(file);
    const hash = sha256(bytes);
    const objectKey = `${prefix}${filename}`;
    assets.push({ objectKey, file, hash, size: bytes.length, type: item.type });
    const checksum = Buffer.from(`${hash}  ${filename}\n`);
    generated[`${filename}.sha256`] = checksum;
    assets.push({ objectKey: `${objectKey}.sha256`, bytes: checksum, type: textType });

    if (item.platforms.length) {
      const signature = (await readPackage(`${file}.sig`)).toString('utf8').trim();
      checkTauriSignature({ signature, bytes, publicKey: key, version, filename });
      assets.push({ objectKey: `${objectKey}.sig`, bytes: Buffer.from(signature), type: textType });
      const platform = { url: new URL(objectKey, cdn).href, signature, sha256: hash, size: bytes.length };
      const feed = item.suffix.startsWith('linux-') ? linux : desktop;
      for (const platformKey of item.platforms) feed.platforms[platformKey] = platform;
    }
  }

  for (const [filename, data] of [['latest.json', desktop], ['linux.json', linux]]) {
    const bytes = jsonBytes(data);
    generated[filename] = bytes;
    assets.push({ objectKey: `${prefix}${filename}`, bytes, type: jsonType });
  }
  assets.push({ objectKey: `${prefix}release.json`, bytes: jsonBytes({ version, commit, pub_date: common.pub_date }), type: jsonType });
  return { assets, generated, desktop, linux };
}

const missingObject = error => ['NoSuchKey', 'NotFound'].includes(error?.name) || error?.$metadata?.httpStatusCode === 404;
const rejectedWrite = error => ['PreconditionFailed', 'ConditionalRequestConflict'].includes(error?.name)
  || [409, 412].includes(error?.$metadata?.httpStatusCode);

async function putImmutable(client, bucket, asset) {
  const bytes = asset.bytes ?? await readPackage(asset.file);
  const hash = sha256(bytes);
  if (asset.hash && asset.hash !== hash) throw new Error(`Native release file changed after verification: ${asset.objectKey}`);
  const input = { Bucket: bucket, Key: asset.objectKey };
  try {
    await client.send(new PutObjectCommand({ ...input, Body: bytes, ContentType: asset.type,
      CacheControl: assetCache, Metadata: { sha256: hash }, IfNoneMatch: '*' }));
  } catch (error) {
    if (!rejectedWrite(error)) throw error;
    const object = await client.send(new HeadObjectCommand(input));
    if (object.Metadata?.sha256 !== hash || object.ContentLength !== bytes.length) {
      throw new Error(`Immutable Native release conflict: ${asset.objectKey}`);
    }
  }
}

async function readFeed(client, bucket, key) {
  try {
    const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!object.ETag || !object.Body) throw new Error(`Missing ETag or body for ${key}`);
    const body = await object.Body.transformToString();
    return { etag: object.ETag, version: JSON.parse(body).version, body };
  } catch (error) {
    if (missingObject(error)) return null;
    throw error;
  }
}

function feedCanAdvance(previous, manifest, body, key) {
  if (!previous) return true;
  const order = compareVersions(manifest.version, previous.version);
  if (order < 0) throw new Error(`Refusing older Native release for ${key}`);
  if (order > 0) return true;
  if (previous.body !== body.toString('utf8')) throw new Error(`Native release version conflict for ${key}`);
  return false;
}

async function publishFeed(client, bucket, key, manifest, bytes) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const previous = await readFeed(client, bucket, key);
    if (!feedCanAdvance(previous, manifest, bytes, key)) return;
    const condition = previous ? { IfMatch: previous.etag } : { IfNoneMatch: '*' };
    try {
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: jsonType,
        CacheControl: feedCache, ...condition }));
      return;
    } catch (error) {
      if (!rejectedWrite(error)) throw error;
    }
  }
  throw new Error(`Concurrent Native releases prevented publishing ${key}`);
}

export async function publishNativeRelease({ client, bucket, verifyArtifact, ...release }) {
  if (typeof bucket !== 'string' || !bucket.trim()) throw new Error('Missing Native release R2 bucket');
  const { assets, generated, desktop, linux } = await prepareRelease(release);
  const feeds = [[desktopKey, desktop, generated['latest.json']], [linuxKey, linux, generated['linux.json']]];
  for (const [key, manifest, bytes] of feeds) {
    feedCanAdvance(await readFeed(client, bucket, key), manifest, bytes, key);
  }
  for (const [name, bytes] of Object.entries(generated)) await writeFile(path.join(release.directory, name), bytes);
  for (const asset of assets) await putImmutable(client, bucket, asset);
  if (verifyArtifact) {
    await Promise.all(assets.filter(asset => asset.file).map(asset =>
      verifyArtifact({ url: new URL(asset.objectKey, cdn).href, size: asset.size })));
  }
  for (const [key, manifest, bytes] of feeds) {
    await publishFeed(client, bucket, key, manifest, bytes);
  }
  return { version: release.version, files: assets.length, feeds: [desktopKey, linuxKey] };
}

async function verifyPublicArtifact({ url, size }) {
  let lastError;
  for (const wait of [0, 1500, 3000, 6000, 12000]) {
    if (wait) await delay(wait);
    try {
      const response = await globalThis.fetch(url, {
        method: 'HEAD', redirect: 'error', signal: globalThis.AbortSignal.timeout(7500),
        headers: { 'accept-encoding': 'identity' },
      });
      const length = response.headers.get('content-length');
      if (response.status === 200 && length === String(size)) return;
      lastError = `HTTP ${response.status}, Content-Length ${length ?? 'missing'}, expected ${size}`;
    } catch (error) {
      lastError = error.message;
    }
  }
  throw new Error(`Native release artifact is not publicly downloadable: ${url} (${lastError})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: {
    'release-dir': { type: 'string' }, version: { type: 'string' }, commit: { type: 'string' },
    'notes-file': { type: 'string' }, 'published-at': { type: 'string' },
  } });
  if (!values['release-dir'] || !values.version || !/^[a-f0-9]{40}$/.test(values.commit ?? '')) {
    throw new Error('--release-dir, --version and --commit are required');
  }
  for (const name of ['R2_ACCOUNT_ID', 'R2_BUCKET', 'R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'NATIVE_UPDATER_PUBLIC_KEY']) {
    if (!process.env[name]?.trim()) throw new Error(`${name} is required`);
  }
  const publishedAt = values['published-at'] ?? execFileSync('git', ['show', '--no-patch', '--format=%cI', values.commit], { encoding: 'utf8' }).trim();
  const notes = values['notes-file'] ? await readFile(values['notes-file'], 'utf8') : undefined;
  const client = createR2Client({ accountId: process.env.R2_ACCOUNT_ID, endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY });
  const result = await publishNativeRelease({ client, bucket: process.env.R2_BUCKET, directory: values['release-dir'],
    version: values.version, commit: values.commit, publishedAt, notes, publicKey: process.env.NATIVE_UPDATER_PUBLIC_KEY,
    verifyArtifact: verifyPublicArtifact });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
