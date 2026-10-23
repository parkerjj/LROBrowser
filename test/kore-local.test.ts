import { expect, test } from 'vitest';
import { mkdir, mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { enableLocal, disableLocal, mergeKorePackage, withKoreLock } from '../scripts/kore-local.mjs';
import { packageFixture } from './kore-fixture';

test('explicit staging preserves argv paths, rejects corruption and withdraws old packages on failure', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'kore host '));
  const source = path.join(root, 'private source with spaces');
  const fixture = packageFixture();
  try {
    await mkdir(path.join(source, 'scripts'), { recursive: true });
    const fixtureRoot = path.join(root, 'fixture');
    await mkdir(fixtureRoot);
    for (const [name, bytes] of fixture.payload) await writeFile(path.join(fixtureRoot, name), bytes);
    await writeFile(path.join(fixtureRoot, 'manifest.json'), JSON.stringify(fixture.manifest));
    await writeFile(path.join(source, 'scripts/build-local.mjs'), `import {cp} from 'node:fs/promises'; await cp(${JSON.stringify(fixtureRoot)}, process.argv[process.argv.indexOf('--out')+1], {recursive:true});`);
    await enableLocal({ repo: root, source, mode: 'debug' });
    const pointer = JSON.parse(await readFile(path.join(root, 'generated/ke/current.json'), 'utf8'));
    expect(pointer.packageId).toBe(fixture.manifest.packageId);
    const core = path.join(root, 'generated/core');
    await mkdir(core, { recursive: true });
    await writeFile(path.join(core, 'executable-assets.json'), '{"files":[]}');
    await withKoreLock(root, () => mergeKorePackage(root));
    await access(path.join(core, pointer.manifestPath));
    await writeFile(path.join(root, 'generated/ke/packages', pointer.packageId, 'kore_wasm.js'), 'corrupt');
    await withKoreLock(root, () => mergeKorePackage(root));
    expect(JSON.parse(await readFile(path.join(core, 'executable-assets.json'), 'utf8')).files).toHaveLength(0);
    await expect(access(path.join(root, 'generated/ke/current.json'))).rejects.toThrow();
    await enableLocal({ repo: root, source, mode: 'debug' });
    await writeFile(path.join(source, 'scripts/build-local.mjs'), 'process.exit(2)');
    await expect(enableLocal({ repo: root, source, mode: 'debug' })).rejects.toThrow();
    await expect(access(path.join(root, 'generated/ke/current.json'))).rejects.toThrow();
    await expect(withKoreLock(root, () => enableLocal({ repo: root, source, mode: 'debug' }))).rejects.toThrow();
    await disableLocal({ repo: root });
  } finally { await rm(root, { recursive: true, force: true }); }
});
