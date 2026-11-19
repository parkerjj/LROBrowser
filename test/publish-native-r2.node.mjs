import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { URL } from 'node:url';
import { publishNativeRelease } from '../scripts/publish-native-r2.mjs';

const directories = [];
const commit = 'a'.repeat(40);
const publishedAt = '2026-11-19T08:00:00.000Z';
const desktopKey = 'native/latest.json';
const linuxKey = 'native/linux.json';
const filenames = [
  'windows-x64-setup.exe', 'macos-universal.dmg', 'macos-universal.app.tar.gz', 'linux-amd64.deb', 'linux-arm64.deb',
  'linux-x86_64.rpm', 'linux-aarch64.rpm',
];

afterEach(async () => {
  await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
});

async function fixture(version = '0.12.1', signedVersion = version) {
  await mkdir('generated', { recursive: true });
  const directory = await mkdtemp(path.resolve('generated/native-publisher-'));
  directories.push(directory);
  const keys = generateKeyPairSync('ed25519');
  const keyId = Buffer.alloc(8, 42);
  const rawKey = Buffer.concat([Buffer.from('Ed'), keyId, keys.publicKey.export({ format: 'der', type: 'spki' }).subarray(-32)]);
  const publicKey = Buffer.from(`untrusted comment: minisign test public key\n${rawKey.toString('base64')}\n`).toString('base64');
  for (const suffix of filenames) {
    const name = `LRO-Client-${version}-${suffix}`;
    const bytes = Buffer.from(suffix);
    await writeFile(path.join(directory, name), bytes);
    if (suffix.endsWith('.dmg')) continue;
    const trusted = `timestamp:1\tfile:${name}\tversion:${signedVersion}`;
    const signature = sign(null, createHash('blake2b512').update(bytes).digest(), keys.privateKey);
    const box = Buffer.concat([Buffer.from('ED'), keyId, signature]).toString('base64');
    const global = sign(null, Buffer.concat([signature, Buffer.from(trusted)]), keys.privateKey).toString('base64');
    const text = `untrusted comment: minisign test signature\n${box}\ntrusted comment: ${trusted}\n${global}\n`;
    await writeFile(path.join(directory, `${name}.sig`), Buffer.from(text).toString('base64'));
  }
  return { directory, version, commit, publishedAt, publicKey, bucket: 'test-bucket' };
}

function mockR2() {
  const store = new Map();
  const writes = [];
  const commands = [];
  let seq = 0;
  let beforePut = () => {};
  function put(key, bytes) {
    const value = { Body: bytes, ETag: `"${++seq}"` };
    store.set(key, value);
    return value;
  }
  return {
    store, writes, commands, put,
    onPut(callback) { beforePut = callback; },
    manifest(key) { return JSON.parse(String(store.get(key)?.Body)); },
    client: {
      async send(command) {
        commands.push(command);
        const { Key: key, Body: body, CacheControl, Metadata, IfMatch, IfNoneMatch } = command.input;
        const type = command.constructor.name;
        if (type === 'GetObjectCommand' || type === 'HeadObjectCommand') {
          const object = store.get(key);
          if (!object) throw Object.assign(new Error('absent'), { name: 'NoSuchKey' });
          return { ...object, ContentLength: object.Body.length, Body: { transformToString: async () => object.Body.toString('utf8') } };
        }
        if (type !== 'PutObjectCommand' || !body) throw new Error(`Unexpected command ${type}`);
        beforePut(key);
        const current = store.get(key);
        if ((IfNoneMatch === '*' && current) || (IfMatch && IfMatch !== current?.ETag)) {
          throw Object.assign(new Error('conditional conflict'), { name: 'PreconditionFailed' });
        }
        writes.push(key);
        Object.assign(put(key, Buffer.from(body)), { CacheControl, Metadata });
        return {};
      },
    },
  };
}

describe('Native R2 publisher', () => {
  it('publishes the complete version before announcing signed platform updates', async () => {
    const release = await fixture();
    const r2 = mockR2();
    const existingIwa = r2.put('updates.json', Buffer.from('IWA'));
    await publishNativeRelease({ ...release, client: r2.client });
    const prefix = `native/${release.version}/`;
    assert.deepEqual(r2.writes.slice(-2), [desktopKey, linuxKey]);
    assert.equal(r2.store.get('updates.json'), existingIwa);
    assert.ok(r2.commands.every(command => command.input.Key.startsWith('native/')));
    assert.match(r2.store.get(desktopKey)?.CacheControl, /no-store/);
    assert.match(r2.store.get(linuxKey)?.CacheControl, /no-store/);
    assert.ok(r2.commands.filter(command => command.constructor.name === 'PutObjectCommand').every(command => command.input.IfNoneMatch === '*'));
    const desktop = r2.manifest(desktopKey);
    const linux = r2.manifest(linuxKey);
    assert.equal(desktop.version, release.version);
    assert.equal(desktop.pub_date, publishedAt);
    assert.deepEqual(Object.keys(desktop.platforms).sort(), ['darwin-aarch64', 'darwin-x86_64', 'windows-x86_64']);
    assert.deepEqual(desktop.platforms['darwin-aarch64'], desktop.platforms['darwin-x86_64']);
    assert.deepEqual(Object.keys(linux.platforms).sort(), ['linux-aarch64-deb', 'linux-aarch64-rpm', 'linux-x86_64-deb', 'linux-x86_64-rpm']);
    for (const item of [...Object.values(desktop.platforms), ...Object.values(linux.platforms)]) {
      const url = new URL(item.url);
      assert.equal(url.origin, 'https://client.ltsd.ro');
      const artifact = r2.store.get(url.pathname.slice(1));
      assert.ok(url.pathname.slice(1).startsWith(prefix));
      assert.equal(item.signature, r2.store.get(`${url.pathname.slice(1)}.sig`)?.Body.toString());
      assert.equal(item.size, artifact?.Body.length);
      assert.equal(item.sha256, artifact?.Metadata?.sha256);
    }
    for (const suffix of filenames) {
      const name = `LRO-Client-${release.version}-${suffix}`;
      assert.equal(await readFile(path.join(release.directory, `${name}.sha256`), 'utf8'), r2.store.get(`${prefix}${name}.sha256`)?.Body.toString());
    }
    assert.deepEqual(JSON.parse(await readFile(path.join(release.directory, 'latest.json'), 'utf8')), desktop);
    assert.deepEqual(JSON.parse(await readFile(path.join(release.directory, 'linux.json'), 'utf8')), linux);
  });

  it('refuses missing packages, wrong signed versions, wrong keys and tampered files before R2 is touched', async () => {
    const missing = await fixture();
    const wrongVersion = await fixture('0.12.1', '0.12.0');
    const wrongKey = await fixture();
    const tampered = await fixture();
    const r2 = mockR2();
    await rm(path.join(missing.directory, 'LRO-Client-0.12.1-linux-arm64.deb'));
    await writeFile(path.join(tampered.directory, 'LRO-Client-0.12.1-windows-x64-setup.exe'), 'bad');
    await assert.rejects(publishNativeRelease({ ...missing, client: r2.client }), /linux-arm64\.deb/);
    await assert.rejects(publishNativeRelease({ ...wrongVersion, client: r2.client }), /signed version/i);
    await assert.rejects(publishNativeRelease({ ...wrongKey, publicKey: tampered.publicKey, client: r2.client }), /signature/i);
    await assert.rejects(publishNativeRelease({ ...tampered, client: r2.client }), /signature/i);
    assert.deepEqual(r2.commands, []);
  });

  it('promotes newer versions conditionally and rejects rollback or same-version byte replacement', async () => {
    const prior = await fixture('0.9.4');
    const next = await fixture('0.12.1');
    const r2 = mockR2();
    await publishNativeRelease({ ...prior, client: r2.client });
    await publishNativeRelease({ ...next, client: r2.client });
    const writes = r2.writes.slice();
    await publishNativeRelease({ ...next, client: r2.client });
    assert.deepEqual(r2.writes, writes);
    assert.ok(r2.commands.filter(command => command.constructor.name === 'PutObjectCommand' && command.input.Key === desktopKey).at(-1)?.input.IfMatch);
    await assert.rejects(publishNativeRelease({ ...prior, client: r2.client }), /older/i);
    await assert.rejects(publishNativeRelease({ ...next, notes: 'different release', client: r2.client }), /conflict/i);
    assert.deepEqual(r2.writes, writes);
  });

  it('promotes a shared IWA version from the original Native feed and advertises desktop installers', async () => {
    const release = await fixture('1.1025.261120');
    const r2 = mockR2();
    // The first public Native manifests had no installer links.
    for (const key of [desktopKey, linuxKey]) {
      r2.put(key, Buffer.from('{"version":"1.2.1"}'));
    }
    await publishNativeRelease({ ...release, client: r2.client });
    const desktop = r2.manifest(desktopKey);
    const linux = r2.manifest(linuxKey);
    assert.equal(desktop.version, release.version);
    assert.equal(linux.version, release.version);
    assert.equal(linux.installers, undefined);
    assert.deepEqual(Object.keys(desktop.installers).sort(), ['darwin-universal', 'windows-x86_64']);
    const { url, size, sha256 } = desktop.platforms['windows-x86_64'];
    assert.deepEqual(desktop.installers['windows-x86_64'], { url, size, sha256 });
    assert.match(desktop.platforms['darwin-aarch64'].url, /\.app\.tar\.gz$/);
    const dmg = desktop.installers['darwin-universal'];
    const dmgKey = `native/${release.version}/LRO-Client-${release.version}-macos-universal.dmg`;
    assert.deepEqual(dmg, {
      url: `https://client.ltsd.ro/${dmgKey}`,
      size: r2.store.get(dmgKey).Body.length,
      sha256: r2.store.get(dmgKey).Metadata.sha256,
    });
    assert.ok(r2.writes.indexOf(dmgKey) < r2.writes.indexOf(desktopKey));
  });

  it('will not replace a newer feed published concurrently', async () => {
    const release = await fixture();
    const r2 = mockR2();
    r2.onPut(key => {
      if (key === desktopKey) r2.put(desktopKey, Buffer.from('{"version":"0.13.1"}'));
    });
    await assert.rejects(publishNativeRelease({ ...release, client: r2.client }), /older/i);
    assert.equal(r2.manifest(desktopKey).version, '0.13.1');
    assert.equal(r2.store.has(linuxKey), false);
  });

  it('keeps immutable packages and current feeds when a staged object conflicts', async () => {
    const release = await fixture();
    const r2 = mockR2();
    const key = `native/${release.version}/LRO-Client-${release.version}-windows-x64-setup.exe`;
    const existing = r2.put(key, Buffer.from('different package'));
    await assert.rejects(publishNativeRelease({ ...release, client: r2.client }), /immutable Native release conflict/i);
    assert.equal(r2.store.get(key), existing);
    assert.deepEqual(r2.writes, []);
    assert.equal(r2.store.has(desktopKey), false);
  });

  it('checks every installer is public before promoting feeds and preserves prior feeds on failure', async () => {
    const prior = await fixture('0.9.4');
    const next = await fixture();
    const r2 = mockR2();
    await publishNativeRelease({ ...prior, client: r2.client });
    const checked = [];
    const verifyArtifact = ({ url, size }) => {
      checked.push(url);
      const parsed = new URL(url);
      assert.equal(parsed.origin, 'https://client.ltsd.ro');
      assert.equal(r2.store.get(parsed.pathname.slice(1))?.Body.length, size);
      assert.equal(r2.manifest(desktopKey).version, prior.version);
      assert.equal(r2.manifest(linuxKey).version, prior.version);
      if (url.endsWith('.dmg')) return Promise.reject(new Error('not public'));
    };
    await assert.rejects(publishNativeRelease({ ...next, client: r2.client, verifyArtifact }), /not public/);
    assert.equal(checked.length, 7);
    assert.equal(r2.manifest(desktopKey).version, prior.version);
    assert.equal(r2.manifest(linuxKey).version, prior.version);
  });
});
