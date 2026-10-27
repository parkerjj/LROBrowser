// The only CLI that may build a user-selected private KE checkout.
import { mkdir, open, readFile, writeFile, rm, rename, readdir, lstat, cp, mkdtemp } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify, parseArgs, TextDecoder } from 'node:util';
import path from 'node:path';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath, URL } from 'node:url';
import { sha256, safePackagePath, validateKoreManifest, validateKorePointer, loadKorePackage } from '../src/kore/kore-integration.mjs';

const run = promisify(execFile);
export async function withKoreLock(repo, action) {
  const root = path.join(repo, 'generated/ke');
  await mkdir(root, { recursive: true });
  const lockPath = path.join(root, '.staging.lock');
  let lock;
  try { lock = await open(lockPath, 'wx'); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    // Never guess whether another preparation/build is still running.
    throw Error(`not-started:staging-locked (${lockPath}); inspect its PID and remove only after that process has stopped`);
  }
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }) + '\n');
    return await action();
  } finally { await lock.close(); await rm(lockPath, { force: true }); }
}
async function atomicJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = file + `.${process.pid}.tmp`;
  try { await writeFile(temporary, JSON.stringify(value, null, 2) + '\n'); await rename(temporary, file); }
  finally { await rm(temporary, { force: true }); }
}
async function filesUnder(root, prefix = '') {
  if (!(await lstat(root)).isDirectory()) throw Error('invalid-package-root');
  const files = [];
  for (const item of await readdir(root, { withFileTypes: true })) {
    const relative = safePackagePath(prefix + item.name);
    if (item.isDirectory()) files.push(...await filesUnder(path.join(root, item.name), relative + '/'));
    else if (item.isFile()) files.push(relative);
    else throw Error('invalid-package-entry-or-symlink');
  }
  return files.sort();
}
export async function validateLocalPackage(root) {
  const actual = await filesUnder(root);
  const manifest = await validateKoreManifest(JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8')));
  if (actual.join('\n') !== [...manifest.files.map(file => file.path), 'manifest.json'].sort().join('\n')) throw Error('package-file-set-mismatch');
  for (const file of manifest.files) {
    const bytes = await readFile(path.join(root, file.path));
    if (bytes.length !== file.bytes || await sha256(bytes) !== file.sha256) throw Error(`package-hash-mismatch:${file.path}`);
  }
  return manifest;
}
async function withdraw(repo) {
  await rm(path.join(repo, 'generated/ke/current.json'), { force: true });
  await rm(path.join(repo, 'generated/core/ke'), { recursive: true, force: true });
  const coreManifest = path.join(repo, 'generated/core/executable-assets.json');
  const manifest = await readFile(coreManifest, 'utf8').then(JSON.parse, error => { if (error.code !== 'ENOENT') throw error; return null; });
  if (manifest) {
    manifest.files = manifest.files.filter(file => !file.path.startsWith('ke/'));
    await atomicJson(coreManifest, manifest);
  }
}
export async function disableLocal({ repo }) {
  await withKoreLock(repo, () => withdraw(repo));
}
export async function enableLocal({ repo, source, mode }) {
  if (!path.isAbsolute(source ?? '') || !['debug', 'release'].includes(mode)) throw Error('absolute-source-and-mode-required');
  return withKoreLock(repo, async () => {
    await withdraw(repo);
    const temporary = await mkdtemp(path.join(repo, 'generated/ke/.local-build-'));
    const output = path.join(temporary, 'package');
    try {
      await run(process.execPath, [path.join(source, 'scripts/build-local.mjs'), '--mode', mode, '--out', output], { cwd: source, maxBuffer: 8 * 1024 * 1024 });
      const manifest = await validateLocalPackage(output);
      if (manifest.mode !== mode) throw Error('build-mode-mismatch');
      const staged = path.join(repo, 'generated/ke/packages', manifest.packageId);
      await mkdir(path.dirname(staged), { recursive: true });
      await rm(staged, { recursive: true, force: true });
      await cp(output, staged, { recursive: true });
      await validateLocalPackage(staged);
      const pointer = { schemaVersion: 1, packageId: manifest.packageId, manifestPath: `ke/${manifest.packageId}/manifest.json` };
      await atomicJson(path.join(repo, 'generated/ke/current.json'), pointer);
      return pointer;
    } catch (error) { await withdraw(repo); throw error; }
    finally { await rm(temporary, { recursive: true, force: true }); }
  });
}
// Caller holds the same lock around the *entire* core preparation.
export async function mergeKorePackage(repo, { required = process.env.KE_REQUIRE_PACKAGE === '1' } = {}) {
  const pointerPath = path.join(repo, 'generated/ke/current.json');
  try { await lstat(pointerPath); } catch (error) {
    if (error.code === 'ENOENT' && !required) return null;
    throw error;
  }
  try {
    if (!(await lstat(pointerPath)).isFile()) throw Error('invalid-pointer-file');
    const pointer = validateKorePointer(JSON.parse(await readFile(pointerPath, 'utf8')));
    const staged = path.join(repo, 'generated/ke/packages', pointer.packageId);
    const manifest = await validateLocalPackage(staged);
    if (manifest.packageId !== pointer.packageId) throw Error('staging-pointer-mismatch');
    const core = path.join(repo, 'generated/core');
    await rm(path.join(core, 'ke'), { recursive: true, force: true });
    await cp(staged, path.join(core, 'ke', pointer.packageId), { recursive: true });
    await atomicJson(path.join(core, 'ke/active.json'), pointer);
    const coreManifestPath = path.join(core, 'executable-assets.json');
    const coreManifest = JSON.parse(await readFile(coreManifestPath, 'utf8'));
    coreManifest.files = coreManifest.files.filter(file => !file.path.startsWith('ke/'));
    for (const file of [...manifest.files, { path: 'manifest.json', kind: 'data-json' }]) {
      const relative = `ke/${pointer.packageId}/${file.path}`;
      const bytes = await readFile(path.join(core, relative));
      coreManifest.files.push({ path: relative, bytes: bytes.length, sha256: await sha256(bytes), kind: file.kind });
    }
    const bytes = await readFile(path.join(core, 'ke/active.json'));
    coreManifest.files.push({ path: 'ke/active.json', bytes: bytes.length, sha256: await sha256(bytes), kind: 'data-json' });
    coreManifest.files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
    await atomicJson(coreManifestPath, coreManifest);
    return pointer;
  } catch (error) {
    await withdraw(repo);
    if (required) throw error;
    process.stderr.write(`[KoreEngine] optional staging rejected: ${String(error)}\n`);
    return null;
  }
}

const keApi = 'https://api.github.com/repos/parkerjj/KoreEngine';
const archiveName = 'kore-engine.tar.gz';
const maxArchiveBytes = 32 * 1024 * 1024;
const maxExpandedBytes = 128 * 1024 * 1024;
const maxMetadataBytes = 1024 * 1024;

function requireRelease(manifest, metadata) {
  if (manifest.mode !== 'release' || manifest.sourceDirty || !/^[a-f0-9]{40}$/.test(manifest.commitSha ?? '')
    || manifest.files.some(file => file.kind === 'wasm' && file.path !== 'kore_boot_bg.wasm' && !(manifest.schemaVersion === 3 && file.path === 'map-data.wasm'))
    || (metadata && (manifest.packageId !== metadata.packageId || manifest.commitSha !== metadata.commitSha || manifest.buildId !== metadata.buildId))) {
    throw Error('invalid-production-kore-package');
  }
}

async function responseBytes(response, maximum) {
  if (!response.ok || !response.body) throw Error(`ke-download-http-${response.status}`);
  const declared = response.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > maximum)) throw Error('ke-download-too-large');
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > maximum) throw Error('ke-download-too-large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Accept only the regular-file USTAR format emitted by KoreEngine, before writing any entry.
function parseArchive(archive, { legacy = false } = {}) {
  if (archive.length > maxArchiveBytes) throw Error('ke-download-too-large');
  const tar = gunzipSync(archive, { maxOutputLength: legacy ? 8 * 1024 * 1024 : maxExpandedBytes });
  if (tar.length % 512 || tar.length < 1024) throw Error('ke-invalid-tar');
  const entries = new Map();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const field = bytes => decoder.decode(bytes.subarray(0, bytes.indexOf(0) < 0 ? bytes.length : bytes.indexOf(0)));
  const octal = bytes => {
    const value = field(bytes).trim();
    if (!/^[0-7]+$/.test(value)) throw Error('ke-invalid-tar-number');
    return Number.parseInt(value, 8);
  };
  let ended = false;
  for (let offset = 0; offset < tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) {
      if (offset + 1024 > tar.length || !tar.subarray(offset).every(byte => byte === 0)) throw Error('ke-invalid-tar-end');
      ended = true; break;
    }
    const checksum = octal(header.subarray(148, 156));
    if (checksum !== header.reduce((sum, byte, index) => sum + (index >= 148 && index < 156 ? 32 : byte), 0)
      || field(header.subarray(257, 263)) !== 'ustar' || field(header.subarray(157, 257))) throw Error('ke-invalid-tar-header');
    const size = octal(header.subarray(124, 136));
    const type = header[156];
    if (![0, 48, 53].includes(type) || (type === 53 && size !== 0)) throw Error('ke-unsupported-tar-entry');
    const prefix = field(header.subarray(345, 500));
    let name = (prefix ? prefix + '/' : '') + field(header.subarray(0, 100));
    if (name.startsWith('./')) name = name.slice(2);
    if (type === 53 && name.endsWith('/')) name = name.slice(0, -1);
    if (!(type === 53 && (name === '' || name === '.'))) {
      safePackagePath(name);
      if (entries.has(name) || entries.size >= (legacy ? 1311 : 1024) || size > (legacy ? 1024 * 1024 : 64 * 1024 * 1024) || (legacy && type === 53)) throw Error('ke-invalid-tar-entry');
      entries.set(name, { directory: type === 53, bytes: tar.subarray(offset + 512, offset + 512 + size) });
    }
    offset += 512 + Math.ceil(size / 512) * 512;
    if (offset > tar.length) throw Error('ke-truncated-tar');
  }
  if (!ended || !entries.has(legacy ? 'fieldpack-2.0.5/manifest.json' : 'manifest.json')) throw Error('ke-incomplete-tar');
  for (const name of entries.keys()) {
    const parts = name.split('/');
    for (let i = 1; i < parts.length; i++) {
      const parent = entries.get(parts.slice(0, i).join('/'));
      if (parent && !parent.directory) throw Error('ke-tar-parent-conflict');
    }
  }
  return entries;
}
async function writeArchiveEntries(entries, destination) {
  if (await lstat(destination).catch(error => { if (error.code !== 'ENOENT') throw error; return null; })) throw Error('ke-extract-destination-exists');
  await mkdir(destination, { recursive: true });
  for (const [name, entry] of entries) {
    const target = path.join(destination, name);
    if (entry.directory) await mkdir(target, { recursive: true });
    else { await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, entry.bytes, { flag: 'wx' }); }
  }
}

export async function extractReleaseArchive(archive, destination) {
  await writeArchiveEntries(parseArchive(archive), destination);
}

const legacyManifestSha256 = 'd9dc87391ba459c181f704cb2db7262321c315be9a33060201ad8f1964273177';
const legacyArchiveName = 'ke-legacy-fieldpack-2.0.5.tar.gz';
async function validateLegacyEntries(entries) {
  const root = 'fieldpack-2.0.5/';
  const bytes = entries.get(root + 'manifest.json')?.bytes;
  if (!bytes || await sha256(bytes) !== legacyManifestSha256) throw Error('ke-legacy-manifest-mismatch');
  const manifest = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (manifest.schemaVersion !== 1 || manifest.fieldpackVersion !== '2.0.5'
    || manifest.source?.fileCount !== 1310 || manifest.source?.totalBytes !== 3306440
    || !manifest.files || Object.keys(manifest.files).length !== 1310) throw Error('ke-legacy-version-mismatch');
  const expected = ['manifest.json', ...Object.keys(manifest.files)].map(name => root + safePackagePath(name)).sort();
  if ([...entries.keys()].sort().join('\n') !== expected.join('\n')) throw Error('ke-legacy-file-set-mismatch');
  let total = 0;
  for (const [name, info] of Object.entries(manifest.files)) {
    const entry = entries.get(root + name);
    if (entry.directory || entry.bytes.length !== info.bytes || await sha256(entry.bytes) !== info.sha256) throw Error(`ke-legacy-hash-mismatch:${name}`);
    total += entry.bytes.length;
  }
  if (total !== manifest.source.totalBytes) throw Error('ke-legacy-total-mismatch');
  return manifest;
}
export async function validateLegacyFieldpack(root) {
  const entries = new Map();
  for (const name of await filesUnder(root)) entries.set('fieldpack-2.0.5/' + name, { directory: false, bytes: await readFile(path.join(root, name)) });
  return validateLegacyEntries(entries);
}
export async function extractLegacyArchive(archive, destination) {
  const entries = parseArchive(archive, { legacy: true });
  await validateLegacyEntries(entries);
  await writeArchiveEntries(entries, destination);
}

async function releaseClient({ token, releaseTag, fetchImpl = globalThis.fetch }) {
  if (!token?.trim()) throw Error('KE_REPOSITORY_READ_TOKEN-required');

  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  const request = (url, requestHeaders) => fetchImpl(url, { headers: requestHeaders, redirect: 'manual', signal: globalThis.AbortSignal.timeout(60_000) });
  const json = async url => JSON.parse((await responseBytes(await request(url, headers), maxMetadataBytes)).toString('utf8'));
  if (releaseTag !== undefined && !/^ke-[a-f0-9]{40}-\d+-\d+$/.test(releaseTag)) throw Error('ke-invalid-release-tag');
  const release = await json(keApi + (releaseTag ? '/releases/tags/' + encodeURIComponent(releaseTag) : '/releases/latest'));
  if (releaseTag && release.tag_name !== releaseTag) throw Error('ke-release-tag-mismatch');
  const tag = /^ke-([a-f0-9]{40})-\d+-\d+$/.exec(release.tag_name ?? '');
  if (release.draft !== false || release.prerelease !== false || !tag || !Array.isArray(release.assets)) throw Error('ke-invalid-stable-release');
  let object = (await json(keApi + '/git/ref/tags/' + encodeURIComponent(release.tag_name))).object;
  for (let depth = 0; object?.type === 'tag' && depth < 4; depth++) {
    if (!/^[a-f0-9]{40}$/.test(object.sha ?? '')) throw Error('ke-invalid-release-tag');
    object = (await json(keApi + '/git/tags/' + object.sha)).object;
  }
  if (object?.type !== 'commit' || object.sha !== tag[1]) throw Error('ke-release-tag-commit-mismatch');
  const asset = async (name, maximum) => {
    const matches = release.assets.filter(item => item.name === name);
    const item = matches[0];
    if (matches.length !== 1 || !Number.isSafeInteger(item.id) || item.id < 1 || item.state !== 'uploaded'
      || !Number.isSafeInteger(item.size) || item.size < 1 || item.size > maximum || !/^sha256:[a-f0-9]{64}$/.test(item.digest ?? '')) throw Error('ke-invalid-release-asset');
    let response = await request(keApi + '/releases/assets/' + item.id, { ...headers, Accept: 'application/octet-stream' });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = new URL(response.headers.get('location') ?? '');
      if (location.protocol !== 'https:' || location.username || location.password || location.port
        || !['release-assets.githubusercontent.com', 'objects.githubusercontent.com'].includes(location.hostname)) throw Error('ke-invalid-asset-redirect');
      // Never forward private repository credentials to the signed asset origin.
      response = await request(location.href, { Accept: 'application/octet-stream' });
    }
    const bytes = await responseBytes(response, maximum);
    if (bytes.length !== item.size || 'sha256:' + await sha256(bytes) !== item.digest) throw Error('ke-release-asset-digest-mismatch');
    return bytes;
  };
  return { release, commitSha: tag[1], asset };
}
export async function downloadRelease({ out, token, releaseTag, fetchImpl = globalThis.fetch }) {
  if (!path.isAbsolute(out ?? '')) throw Error('absolute-release-out-required');
  const { release, commitSha, asset } = await releaseClient({ token, releaseTag, fetchImpl });
  const archive = await asset(archiveName, maxArchiveBytes);
  const checksum = (await asset(archiveName + '.sha256', maxMetadataBytes)).toString('utf8');
  const archiveSha256 = await sha256(archive);
  if (checksum.trim() !== `${archiveSha256}  ${archiveName}`) throw Error('ke-release-checksum-mismatch');
  const publishedManifest = await validateKoreManifest(JSON.parse((await asset('manifest.json', maxMetadataBytes)).toString('utf8')));
  const metadata = { tag: release.tag_name, releaseId: release.id, commitSha, buildId: publishedManifest.buildId, packageId: publishedManifest.packageId, archiveSha256 };
  requireRelease(publishedManifest, metadata);
  const ltsd = JSON.parse((await asset('ltsd-build-manifest.json', maxMetadataBytes)).toString('utf8'));
  const entry = ltsd[publishedManifest.buildId];
  if (Object.keys(ltsd).length !== 1 || !entry || Object.keys(entry).length !== 2 || entry.chunk !== 'core'
    || entry.sha256 !== publishedManifest.chunks.core.sha256) throw Error('ke-ltsd-fingerprint-mismatch');
  if (await lstat(out).catch(error => { if (error.code !== 'ENOENT') throw error; return null; })) throw Error('ke-release-output-exists');
  await mkdir(path.dirname(out), { recursive: true });
  const temporary = await mkdtemp(path.join(path.dirname(out), '.ke-release-'));
  try {
    const packageRoot = path.join(temporary, 'package');
    await extractReleaseArchive(archive, packageRoot);
    const manifest = await validateLocalPackage(packageRoot);
    requireRelease(manifest, metadata);
    await writeFile(path.join(temporary, 'release.json'), JSON.stringify(metadata, null, 2) + '\n');
    await rename(temporary, out);
    return metadata;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

// Explicit independent legacy source; never inferred from the selected old KE release.
export async function prepareLegacyFieldpack({ repo, source, releaseTag, token, fetchImpl = globalThis.fetch }) {
  if (Boolean(source) === Boolean(releaseTag) || (source && !path.isAbsolute(source))) throw Error('ke-explicit-legacy-source-required');
  return withKoreLock(repo, async () => {
    const destination = path.join(repo, 'generated/ke/legacy');
    await rm(destination, { recursive: true, force: true });
    const temporary = await mkdtemp(path.join(repo, 'generated/ke/.legacy-'));
    try {
      let provenance;
      if (source) {
        const root = path.join(source, 'data/maps/fieldpack-2.0.5');
        await validateLegacyFieldpack(root);
        await cp(root, path.join(temporary, 'fieldpack-2.0.5'), { recursive: true, dereference: false });
        provenance = { source: 'local', manifestSha256: legacyManifestSha256 };
      } else {
        const { release, commitSha, asset } = await releaseClient({ token, releaseTag, fetchImpl });
        const archive = await asset(legacyArchiveName, maxArchiveBytes);
        const archiveSha256 = await sha256(archive);
        if ((await asset(legacyArchiveName + '.sha256', maxMetadataBytes)).toString('utf8').trim() !== `${archiveSha256}  ${legacyArchiveName}`) throw Error('ke-release-checksum-mismatch');
        await extractLegacyArchive(archive, path.join(temporary, 'archive'));
        await rename(path.join(temporary, 'archive/fieldpack-2.0.5'), path.join(temporary, 'fieldpack-2.0.5'));
        await rm(path.join(temporary, 'archive'), { recursive: true });
        provenance = { source: 'release', tag: release.tag_name, releaseId: release.id, commitSha, archiveSha256, manifestSha256: legacyManifestSha256 };
      }
      await validateLegacyFieldpack(path.join(temporary, 'fieldpack-2.0.5'));
      await atomicJson(path.join(temporary, 'provenance.json'), provenance);
      await rename(temporary, destination);
      return provenance;
    } finally { await rm(temporary, { recursive: true, force: true }); }
  });
}
export async function importLocalPackage({ repo, packageRoot }) {
  return withKoreLock(repo, async () => {
    await withdraw(repo);
    try {
      const manifest = await validateLocalPackage(packageRoot);
      if (manifest.mode !== 'debug') throw Error('ke-local-import-requires-debug');
      const staged = path.join(repo, 'generated/ke/packages', manifest.packageId);
      await mkdir(path.dirname(staged), { recursive: true });
      await rm(staged, { recursive: true, force: true });
      await cp(packageRoot, staged, { recursive: true });
      await validateLocalPackage(staged);
      const pointer = { schemaVersion: 1, packageId: manifest.packageId, manifestPath: `ke/${manifest.packageId}/manifest.json` };
      await atomicJson(path.join(repo, 'generated/ke/current.json'), pointer);
      return pointer;
    } catch (error) { await withdraw(repo); throw error; }
  });
}

export async function importReleasePackage({ repo, packageRoot, metadata }) {
  if (!metadata || !/^[a-f0-9]{64}$/.test(metadata.packageId ?? '')) throw Error('ke-release-metadata-required');
  return withKoreLock(repo, async () => {
    await withdraw(repo);
    try {
      const manifest = await validateLocalPackage(packageRoot);
      requireRelease(manifest, metadata);
      const staged = path.join(repo, 'generated/ke/packages', manifest.packageId);
      await mkdir(path.dirname(staged), { recursive: true });
      await rm(staged, { recursive: true, force: true });
      await cp(packageRoot, staged, { recursive: true });
      requireRelease(await validateLocalPackage(staged), metadata);
      const pointer = { schemaVersion: 1, packageId: manifest.packageId, manifestPath: `ke/${manifest.packageId}/manifest.json` };
      await atomicJson(path.join(repo, 'generated/ke/current.json'), pointer);
      return pointer;
    } catch (error) { await withdraw(repo); throw error; }
  });
}

export async function verifyWebHosting({ fetchImpl = globalThis.fetch } = {}) {
  const response = await fetchImpl('https://game.ltsd.ro/', { method: 'HEAD', redirect: 'error', signal: globalThis.AbortSignal.timeout(30_000) });
  const coop = response.headers.get('cross-origin-opener-policy')?.trim();
  const coep = response.headers.get('cross-origin-embedder-policy')?.trim();
  const permission = /(?:^|,)\s*cross-origin-isolated\s*=\s*([^,]*)/i.exec(response.headers.get('permissions-policy') ?? '')?.[1]?.trim();
  const allowlist = permission?.replace(/^\(|\)$/g, '').trim().split(/\s+/) ?? [];
  if (!response.ok || coop !== 'same-origin' || !['require-corp', 'credentialless'].includes(coep)
    || (permission !== undefined && !allowlist.some(value => ['*', 'self', '"https://game.ltsd.ro"'].includes(value)))) {
    throw Error('web-hosting-not-isolated: configure COOP same-origin and COEP require-corp/credentialless for game.ltsd.ro before production release');
  }
  return { isolatedHeaders: true, coop, coep };
}

export async function validateDistribution({ dist, expectedPackageId }) {
  if (!/^[a-f0-9]{64}$/.test(expectedPackageId ?? '')) throw Error('ke-expected-package-required');
  const manifest = JSON.parse(await readFile(path.join(dist, 'core/executable-assets.json'), 'utf8'));
  const loaded = await loadKorePackage({ manifest, verifyEmbeddedMap: true, page: { location: { href: 'https://ke-build.invalid/' }, fetch: async url => {
    const relative = safePackagePath(decodeURIComponent(url.pathname).slice('/core/'.length));
    return new globalThis.Response(await readFile(path.join(dist, 'core', relative)));
  } } });
  if (!loaded || loaded.manifest.packageId !== expectedPackageId) throw Error('required-kore-package-missing-or-changed');
  requireRelease(loaded.manifest);
  if (loaded.manifest.schemaVersion === 3 && await lstat(path.join(dist, 'ke/map')).catch(error => { if (error.code !== 'ENOENT') throw error; return null; })) throw Error('embedded-map-package-carries-legacy-fieldpack');
  return { packageId: loaded.manifest.packageId, buildId: loaded.manifest.buildId, commitSha: loaded.manifest.commitSha };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { source: { type: 'string' }, mode: { type: 'string' }, disable: { type: 'boolean' },
      'download-release': { type: 'boolean' }, 'release-tag': { type: 'string' }, 'import-local-package': { type: 'string' },
      'legacy-source': { type: 'string' }, 'legacy-release-tag': { type: 'string' }, out: { type: 'string' }, 'import-package': { type: 'string' },
      'verify-dist': { type: 'string' }, 'release-metadata': { type: 'string' }, 'verify-web-hosting': { type: 'boolean' } } });
    const repo = fileURLToPath(new URL('../', import.meta.url));
    if (values['legacy-source'] || values['legacy-release-tag']) {
      process.stdout.write(JSON.stringify(await prepareLegacyFieldpack({ repo, source: values['legacy-source'], releaseTag: values['legacy-release-tag'], token: process.env.KE_REPOSITORY_READ_TOKEN })) + '\n');
    } else if (values['import-local-package']) {
      process.stdout.write(JSON.stringify(await importLocalPackage({ repo, packageRoot: path.resolve(values['import-local-package']) })) + '\n');
    } else if (values['verify-web-hosting']) {
      process.stdout.write(JSON.stringify(await verifyWebHosting()) + '\n');
    } else if (values['download-release']) {
      process.stdout.write(JSON.stringify(await downloadRelease({ out: values.out, releaseTag: values['release-tag'], token: process.env.KE_REPOSITORY_READ_TOKEN })) + '\n');
    } else if (values['import-package'] || values['verify-dist']) {
      const metadata = JSON.parse(await readFile(values['release-metadata'], 'utf8'));
      const result = values['import-package']
        ? await importReleasePackage({ repo, packageRoot: path.resolve(values['import-package']), metadata })
        : await validateDistribution({ dist: path.resolve(values['verify-dist']), expectedPackageId: metadata.packageId });
      process.stdout.write(JSON.stringify(result) + '\n');
    } else if (values.disable) {
      if (values.source || values.mode) throw Error('disable-does-not-accept-source-or-mode');
      await disableLocal({ repo });
      process.stdout.write('KoreEngine local integration disabled; reload open clients.\n');
    } else {
      const pointer = await enableLocal({ repo, ...values });
      process.stdout.write(JSON.stringify(pointer) + '\n');
    }
  } catch (error) { process.stderr.write(String(error) + '\n'); process.exitCode = 1; }
}
