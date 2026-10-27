import { expect, test } from 'vitest';
import { mkdir, mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { packageRuntime } from '../vite.config';
import { packageFixture } from './kore-fixture';
import { minifyReleaseJavaScript } from '../scripts/minify-release-js.mjs';
import { loadKorePackage, validateKoreManifest } from '../src/kore/kore-integration.mjs';

test('M8 loader rejects an older package that ships a cleartext core WASM', async () => {
  const fixture = packageFixture('lastro-20211103', {}, 2, 1);
  await expect(validateKoreManifest(fixture.manifest)).rejects.toThrow('incompatible-package');
});

test('Web and IWA packaging preserve optional KE imports and WASM under their package directory', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'kore-build-'));
  try {
    const core = path.join(root, 'generated/core');
    await mkdir(core, { recursive: true });
    await writeFile(path.join(core, 'executable-assets.json'), '{"files":[]}');
    const fixture = packageFixture();
    for (const target of ['web', 'iwa'] as const) {
      const emitted = new Map<string, string | Uint8Array>();
      const plugin = packageRuntime(target, root);
      const hook = plugin.generateBundle as (this: unknown, options: unknown, bundle: unknown) => void;
      const context = { emitFile: (asset: { fileName: string; source: string | Uint8Array }) => emitted.set(asset.fileName, asset.source) };
      hook.call(context, {}, {});
      expect([...emitted.keys()]).toEqual(['core/executable-assets.json']);
      for (const [name, bytes] of fixture.files) {
        await mkdir(path.dirname(path.join(core, name)), { recursive: true });
        await writeFile(path.join(core, name), bytes);
      }
      await writeFile(path.join(core, 'executable-assets.json'), JSON.stringify(fixture.executable));
      emitted.clear();
      hook.call(context, {}, {});
      for (const [name, bytes] of fixture.files) expect(new Uint8Array(emitted.get('core/' + name) as Uint8Array)).toEqual(bytes);
      expect([...emitted.keys()].some(name => name.startsWith('runtime/kore'))).toBe(false);
      const dist = path.join(root, 'dist');
      for (const [name, bytes] of emitted) {
        await mkdir(path.dirname(path.join(dist, name)), { recursive: true });
        await writeFile(path.join(dist, name), bytes);
      }
      await minifyReleaseJavaScript(dist);
      const packagedManifest = JSON.parse(await readFile(path.join(dist, 'core/executable-assets.json'), 'utf8'));
      const loaded = await loadKorePackage({ manifest: packagedManifest, page: {
        location: { href: 'https://local.test/' },
        fetch: async (url: URL | string) => new Response(await readFile(path.join(dist, new URL(url).pathname))),
      } });
      expect(loaded?.manifest.packageId).toBe(fixture.manifest.packageId);
      for (const [name, bytes] of fixture.files) expect(new Uint8Array(await readFile(path.join(dist, 'core', name)))).toEqual(bytes);
      await writeFile(path.join(core, 'executable-assets.json'), '{"files":[]}');
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});

test.each([2, 3] as const)('schema %i identity and same-package map/linker survive executable manifest and minification', async schema => {
  const fixture = packageFixture('lastro-20211103', {}, 2, schema);
  await expect(validateKoreManifest(fixture.manifest)).resolves.toBe(fixture.manifest);
  const loaded = await loadKorePackage({ manifest: fixture.executable, page: { location: { href: 'https://local.test/' }, fetch: fixture.fetch } });
  expect(loaded?.manifest.packageId).toBe(fixture.manifest.packageId);
  expect(Boolean(loaded?.mapResourceConfig)).toBe(schema === 2);
  if (schema === 3) {
    for (const name of ['map-data.wasm', 'map-linker.mjs', 'map-package.mjs']) {
      expect(fixture.executable.files.find(f => f.path === `ke/${fixture.manifest.packageId}/${name}`)).toBeTruthy();
    }
  }
});
test('runtime Host validates embedded map metadata without fetching or reading the WASM bytes', async () => {
  const fixture = packageFixture('lastro-20211103', {}, 2, 3);
  const requests: string[] = [];
  const loaded = await loadKorePackage({ manifest: fixture.executable, page: { location: { href: 'https://local.test/' }, fetch: async (url: URL | string) => {
    requests.push(new URL(url).pathname);
    return fixture.fetch(url);
  } } });
  expect(loaded?.manifest.packageId).toBe(fixture.manifest.packageId);
  expect(requests.some(url => url.endsWith('/map-data.wasm'))).toBe(false);
  expect(requests.some(url => url.endsWith('/map-linker.mjs'))).toBe(true);
});
test.each(['extra-capability', 'unknown-abi', 'wrong-version', 'oversize', 'zero', 'hash', 'length', 'filename', 'missing-linker', 'extra-wasm', 'legacy-map-data', 'legacy-map-chunk', 'new-legacy-index'])('strict map manifest rejects %s', async kind => {
  const schema = kind.startsWith('legacy-') ? 2 : 3;
  const f = packageFixture('lastro-20211103', kind === 'extra-wasm' ? { 'other.wasm': 'bytes' } : kind === 'new-legacy-index' ? { 'data/maps/aliases.json': '{bad' } : {}, 2, schema);
  const m = JSON.parse(JSON.stringify(f.manifest));
  if (kind === 'extra-capability') m.mapData.extra = 1;
  if (kind === 'unknown-abi') m.mapData.abiVersion = 2;
  if (kind === 'wrong-version') m.mapData.fieldpackVersion = '2.0.6';
  if (kind === 'oversize') m.chunks.map.bytes = 8388609;
  if (kind === 'zero') m.chunks.map.bytes = 0;
  if (kind === 'hash') m.chunks.map.sha256 = '0'.repeat(64);
  if (kind === 'length') m.chunks.map.bytes++;
  if (kind === 'filename') m.chunks.map.file = 'other.wasm';
  if (kind === 'missing-linker') m.files = m.files.filter((f: { path: string }) => f.path !== 'map-linker.mjs');
  if (kind === 'legacy-map-data') m.mapData = { abiVersion: 1, dataFormatVersion: 1, fieldpackVersion: '2.0.5' };
  if (kind === 'legacy-map-chunk') m.chunks.map = { file: 'map-data.wasm' };
  await expect(validateKoreManifest(m)).rejects.toThrow();
});
test('new map and linker stay byte-identical in both minified targets and new builds exclude only distribution fieldpack', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'kore-map-build-'));
  try {
    const fixture = packageFixture('lastro-20211103', {}, 2, 3);
    const core = path.join(root, 'generated/core');
    for (const [name, bytes] of fixture.files) {
      await mkdir(path.dirname(path.join(core, name)), { recursive: true }); await writeFile(path.join(core, name), bytes);
    }
    await writeFile(path.join(core, 'executable-assets.json'), JSON.stringify(fixture.executable));
    const publicMap = path.join(root, 'public/ke/map/fieldpack-2.0.5');
    await mkdir(publicMap, { recursive: true }); await writeFile(path.join(publicMap, 'tracked.fld2.gz'), 'compatibility-source');
    for (const target of ['iwa', 'web'] as const) {
      const dist = path.join(root, target);
      const emitted = new Map<string, string | Uint8Array>();
      const plugin = packageRuntime(target, root);
      const generate = plugin.generateBundle as (this: unknown, options: unknown, bundle: unknown) => void;
      generate.call({ emitFile: (a: { fileName: string; source: string | Uint8Array }) => emitted.set(a.fileName, a.source) }, {}, {});
      for (const [name, bytes] of emitted) { await mkdir(path.dirname(path.join(dist, name)), { recursive: true }); await writeFile(path.join(dist, name), bytes); }
      await mkdir(path.join(dist, 'ke/map'), { recursive: true }); await writeFile(path.join(dist, 'ke/map/copied.fld2.gz'), 'copy');
      await mkdir(path.join(dist, 'worldmap'), { recursive: true }); await writeFile(path.join(dist, 'worldmap/sources.json'), '{}');
      await writeFile(path.join(dist, 'index.html'), 'html');
      const hook = plugin.writeBundle as (options: { dir: string }) => Promise<void>;
      await hook({ dir: dist }); await minifyReleaseJavaScript(dist);
      const { access } = await import('node:fs/promises');
      await expect(access(path.join(dist, 'ke/map'))).rejects.toThrow();
      for (const name of ['map-data.wasm', 'map-linker.mjs', 'map-package.mjs']) expect(new Uint8Array(await readFile(path.join(dist, 'core/ke', fixture.manifest.packageId, name)))).toEqual(fixture.payload.get(name));
    }
    expect(await readFile(path.join(publicMap, 'tracked.fld2.gz'), 'utf8')).toBe('compatibility-source');
  } finally { await rm(root, { recursive: true, force: true }); }
});
