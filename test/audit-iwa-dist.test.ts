import { expect, test } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { auditDist } from '../scripts/audit-iwa-dist.mjs';
import { packageFixture } from './kore-fixture';
import { packageRuntime } from '../vite.config';

async function auditUrl(reference: string) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'iwa-ltsd-origin-'));
  const dist = path.join(root, 'dist');
  const source = Buffer.from(`const endpoint = ${JSON.stringify(reference)}; export { endpoint };\n`);
  const sha256 = createHash('sha256').update(source).digest('hex');
  try {
    await mkdir(path.join(dist, '.well-known'), { recursive: true });
    await mkdir(path.join(dist, 'core'), { recursive: true });
    await writeFile(path.join(dist, '.well-known/manifest.webmanifest'), '{}\n');
    await writeFile(path.join(dist, 'core/ke-auth.mjs'), source);
    await writeFile(path.join(dist, 'core/executable-assets.json'), JSON.stringify({ files: [
      { path: 'ke-auth.mjs', bytes: source.length, sha256, kind: 'runtime' },
    ] }));
    return await auditDist(dist, path.join(root, 'report.json'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('IWA audit allows HTTPS LTSD root and subdomain origins', async () => {
  const root = await auditUrl('https://ltsd.ro/api/v1/ke/me');
  const subdomain = await auditUrl('https://api.ltsd.ro/api/v1/ke/me');
  expect(root.externalOrigins).toContain('https://ltsd.ro');
  expect(subdomain.externalOrigins).toContain('https://api.ltsd.ro');
});

test('IWA audit still rejects HTTP, unrelated and credential-bearing LTSD URLs', async () => {
  await expect(auditUrl('http://ltsd.ro/api/v1/ke/me')).rejects.toThrow('unapproved remote origins');
  await expect(auditUrl('https://evil.example/api/v1/ke/me')).rejects.toThrow('unapproved remote origins');
  await expect(auditUrl('https://user:secret@api.ltsd.ro/api/v1/ke/me')).rejects.toThrow('unapproved remote origins');
});

async function auditRuntimeCopies(copies: string[]) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'iwa-runtime-copy-'));
  const dist = path.join(root, 'dist');
  const source = Buffer.from('export const ready = true;\n');
  try {
    await mkdir(path.join(dist, '.well-known'), { recursive: true });
    await mkdir(path.join(dist, 'core/runtime'), { recursive: true });
    await mkdir(path.join(dist, 'runtime'), { recursive: true });
    await writeFile(path.join(dist, '.well-known/manifest.webmanifest'), '{}\n');
    for (const copy of copies) await writeFile(path.join(dist, copy), source);
    await writeFile(path.join(dist, 'core/executable-assets.json'), JSON.stringify({ files: [
      { path: 'runtime/lastro-ready.mjs', bytes: source.length, sha256: createHash('sha256').update(source).digest('hex'), kind: 'runtime' },
    ] }));
    return await auditDist(dist, path.join(root, 'report.json'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('IWA audit verifies runtime modules at their single /runtime/ location', async () => {
  await expect(auditRuntimeCopies(['runtime/lastro-ready.mjs'])).resolves.toMatchObject({ prohibitedPatternResults: [] });
  await expect(auditRuntimeCopies(['core/runtime/lastro-ready.mjs'])).rejects.toThrow('missing executable asset');
  await expect(auditRuntimeCopies(['runtime/lastro-ready.mjs', 'core/runtime/lastro-ready.mjs'])).rejects.toThrow('unlisted executable asset');
});

test('IWA packaging gzips Lua tables into an auditable .gz while Web keeps them plain', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'iwa-lua-gzip-'));
  const lua = Buffer.from('obj = { [500] = { slotCount = 0 } }\n'.repeat(50));
  try {
    await mkdir(path.join(root, 'generated/core/System'), { recursive: true });
    await writeFile(path.join(root, 'generated/core/System/itemInfo.lua'), lua);
    await writeFile(path.join(root, 'generated/core/executable-assets.json'), JSON.stringify({ files: [
      { path: 'System/itemInfo.lua', bytes: lua.length, sha256: createHash('sha256').update(lua).digest('hex'), kind: 'lua' },
    ] }));
    for (const target of ['iwa', 'web'] as const) {
      const emitted = new Map<string, string | Uint8Array>();
      const hook = packageRuntime(target, root).generateBundle as (this: unknown, options: unknown, bundle: unknown) => void;
      hook.call({ emitFile: (asset: { fileName: string; source: string | Uint8Array }) => emitted.set(asset.fileName, asset.source) }, {}, {});
      const manifest = JSON.parse(String(emitted.get('core/executable-assets.json')));
      if (target === 'web') {
        expect(manifest.files[0]).not.toHaveProperty('encoding');
        expect(Buffer.from(emitted.get('core/System/itemInfo.lua') as Uint8Array)).toEqual(lua);
        continue;
      }
      expect(manifest.files[0]).toMatchObject({ path: 'System/itemInfo.lua', encoding: 'gzip' });
      expect(emitted.has('core/System/itemInfo.lua')).toBe(false);
      expect(gunzipSync(emitted.get('core/System/itemInfo.lua.gz') as Uint8Array)).toEqual(lua);
      const dist = path.join(root, 'dist');
      await mkdir(path.join(dist, '.well-known'), { recursive: true });
      await writeFile(path.join(dist, '.well-known/manifest.webmanifest'), '{}\n');
      for (const [name, bytes] of emitted) {
        await mkdir(path.dirname(path.join(dist, name)), { recursive: true });
        await writeFile(path.join(dist, name), bytes);
      }
      await expect(auditDist(dist, path.join(root, 'report.json'))).resolves.toMatchObject({ prohibitedPatternResults: [] });
      await writeFile(path.join(dist, 'core/System/itemInfo.lua'), lua);
      await expect(auditDist(dist, path.join(root, 'report.json'))).rejects.toThrow('unlisted executable asset');
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each(['valid', 'unlisted-map', 'missing-map', 'corrupt-map', 'wrong-prefix', 'missing-linker', 'legacy-fieldpack', 'legacy-fieldpack-uppercase'])('IWA embedded map contract audits %s', async kind => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'iwa-embedded-map-'));
  try {
    const f = packageFixture('lastro-20211103', {}, 2, 3);
    await mkdir(path.join(root, '.well-known'), { recursive: true });
    await writeFile(path.join(root, '.well-known/manifest.webmanifest'), '{}');
    for (const [name, bytes] of f.files) {
      await mkdir(path.dirname(path.join(root, 'core', name)), { recursive: true });
      await writeFile(path.join(root, 'core', name), bytes);
    }
    const map = `ke/${f.manifest.packageId}/map-data.wasm`;
    if (kind === 'unlisted-map') f.executable.files = f.executable.files.filter(file => file.path !== map);
    if (kind === 'missing-map') await rm(path.join(root, 'core', map));
    if (kind === 'corrupt-map') await writeFile(path.join(root, 'core', map), 'broken');
    if (kind === 'wrong-prefix') f.executable.files.find(file => file.path === map)!.path = `ke/${'0'.repeat(64)}/map-data.wasm`;
    if (kind === 'missing-linker') f.executable.files = f.executable.files.filter(file => !file.path.endsWith('/map-linker.mjs'));
    if (kind === 'legacy-fieldpack') { await mkdir(path.join(root, 'ke/map'), { recursive: true }); await writeFile(path.join(root, 'ke/map/test.fld2.gz'), 'legacy'); }
    if (kind === 'legacy-fieldpack-uppercase') { await mkdir(path.join(root, 'assets/fieldpacks'), { recursive: true }); await writeFile(path.join(root, 'assets/fieldpacks/test.FLD2.GZ'), 'legacy'); }
    await writeFile(path.join(root, 'core/executable-assets.json'), JSON.stringify(f.executable));
    const audit = auditDist(root, path.join(root, 'report.json'));
    if (kind === 'valid') await expect(audit).resolves.toMatchObject({ prohibitedPatternResults: [] });
    else await expect(audit).rejects.toThrow();
  } finally { await rm(root, { recursive: true, force: true }); }
});
