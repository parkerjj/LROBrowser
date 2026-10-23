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
