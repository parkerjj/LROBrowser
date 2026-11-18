import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import { afterEach, expect, test, vi } from 'vitest';
import { packageRuntime } from '../vite.config';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

test('runtime defaults to IWA when the build target is absent', async () => {
  vi.stubGlobal('__LASTRO_BUILD_TARGET__', undefined);
  const target = await import('../src/runtime/build-target');
  expect(target.CLIENT_BUILD_TARGET).toBe('iwa');
  expect(target.IS_WEB_BUILD).toBe(false);
  expect(target.IS_NATIVE_BUILD).toBe(false);
});

test('runtime recognizes the native build independently of the web build', async () => {
  vi.stubGlobal('__LASTRO_BUILD_TARGET__', 'native');
  const target = await import('../src/runtime/build-target');
  expect(target.CLIENT_BUILD_TARGET).toBe('native');
  expect(target.IS_WEB_BUILD).toBe(false);
  expect(target.IS_NATIVE_BUILD).toBe(true);
});

test('native packaging keeps the IWA executable inventory and official map sources without web metadata', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'lro-native-build-'));
  const inFixture = (relative: string) => path.join(root, relative);
  const sources = '[{"source":"https://game.lastro.cn/statics/imgs/map.png"}]\n';
  try {
    await mkdir(inFixture('public/.well-known'), { recursive: true });
    await mkdir(inFixture('public/worldmap'), { recursive: true });
    await mkdir(inFixture('generated/core/System'), { recursive: true });
    await writeFile(inFixture('index.html'), '<link rel="manifest" href="/.well-known/manifest.webmanifest"><main>Home</main>');
    await writeFile(inFixture('play.html'), '<main>Play</main>');
    await writeFile(inFixture('public/.well-known/manifest.webmanifest'), '{}');
    await writeFile(inFixture('public/worldmap/sources.json'), sources);
    await writeFile(inFixture('generated/core/System/example.lua'), 'return { 1, 2, 3 }\n');
    await writeFile(inFixture('generated/core/executable-assets.json'), JSON.stringify({
      files: [{ path: 'System/example.lua', kind: 'lua' }],
    }));

    for (const target of ['iwa', 'native'] as const) {
      await build({
        configFile: false,
        root,
        logLevel: 'silent',
        plugins: [packageRuntime(target, root)],
        build: {
          outDir: `dist-${target}`,
          rollupOptions: { input: [inFixture('index.html'), inFixture('play.html')] },
        },
      });
    }

    const native = (file: string) => readFile(inFixture(`dist-native/${file}`), 'utf8');
    expect(await native('index.html')).not.toContain('rel="manifest"');
    expect(await native('play.html')).toContain('Play');
    await expect(native('.well-known/manifest.webmanifest')).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(native('200.html')).rejects.toMatchObject({ code: 'ENOENT' });
    expect(await native('worldmap/sources.json')).toBe(sources);
    const inventory = await readFile(inFixture('dist-iwa/core/executable-assets.json'), 'utf8');
    expect(await native('core/executable-assets.json')).toBe(inventory);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
