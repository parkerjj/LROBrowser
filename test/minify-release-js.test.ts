import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { minifyReleaseJavaScript } from '../scripts/minify-release-js.mjs';
import { auditDist } from '../scripts/audit-iwa-dist.mjs';

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'lastro-minify-'));
  const source = '// quest data\nglobalThis.quests = { title: "Quest", count: 1 + 2 };\n';
  const runtimeSource = '// runtime module\nexport const total = 1 + 2;\n';
  await mkdir(path.join(root, 'core/data/questinfo'), { recursive: true });
  await mkdir(path.join(root, 'runtime'));
  await mkdir(path.join(root, '.well-known'));
  await writeFile(path.join(root, '.well-known/manifest.webmanifest'), JSON.stringify({ version: '0.1.0' }));
  await writeFile(path.join(root, 'core/data/questinfo/QuestInfo.js'), source);
  await writeFile(path.join(root, 'runtime/lastro-total.mjs'), runtimeSource);
  await writeFile(path.join(root, 'core/executable-assets.json'), JSON.stringify({ files: [{
    path: 'data/questinfo/QuestInfo.js', kind: 'runtime', bytes: Buffer.byteLength(source),
    sha256: createHash('sha256').update(source).digest('hex'),
  }, {
    path: 'runtime/lastro-total.mjs', kind: 'runtime', bytes: Buffer.byteLength(runtimeSource),
    sha256: createHash('sha256').update(runtimeSource).digest('hex'),
  }] }));
  return { root, source, runtimeSource };
}

it('keeps minified quest data and the single packaged runtime copy valid for the IWA audit', async () => {
  const { root, source, runtimeSource } = await fixture();
  try {
    await minifyReleaseJavaScript(root);
    const bytes = await readFile(path.join(root, 'core/data/questinfo/QuestInfo.js'));
    expect(bytes.toString()).not.toBe(source);
    expect((await readFile(path.join(root, 'runtime/lastro-total.mjs'), 'utf8')).length).toBeLessThan(runtimeSource.length);
    await expect(auditDist(root, path.join(root, 'report.json'))).resolves.toMatchObject({ prohibitedPatternResults: [] });
    await writeFile(path.join(root, 'core/data/questinfo/QuestInfo.js'), 'globalThis.tampered = true;');
    await expect(auditDist(root, path.join(root, 'report.json'))).rejects.toThrow('integrity mismatch');
  } finally { await rm(root, { recursive: true, force: true }); }
});

it('refuses to bless an asset modified before minification', async () => {
  const { root } = await fixture();
  try {
    await writeFile(path.join(root, 'core/data/questinfo/QuestInfo.js'), 'globalThis.tampered = true;');
    await expect(minifyReleaseJavaScript(root)).rejects.toThrow('integrity mismatch');
  } finally { await rm(root, { recursive: true, force: true }); }
});
