// The only CLI that may build a user-selected private KE checkout.
import { mkdir, open, readFile, writeFile, rm, rename, readdir, lstat, cp, mkdtemp } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify, parseArgs } from 'node:util';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { sha256, safePackagePath, validateKoreManifest, validateKorePointer } from '../src/kore/kore-integration.mjs';

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
export async function mergeKorePackage(repo) {
  const pointerPath = path.join(repo, 'generated/ke/current.json');
  try { await lstat(pointerPath); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
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
    process.stderr.write(`[KoreEngine] optional staging rejected: ${String(error)}\n`);
    return null;
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { source: { type: 'string' }, mode: { type: 'string' }, disable: { type: 'boolean' } } });
    const repo = fileURLToPath(new URL('../', import.meta.url));
    if (values.disable) {
      if (values.source || values.mode) throw Error('disable-does-not-accept-source-or-mode');
      await disableLocal({ repo });
      process.stdout.write('KoreEngine local integration disabled; reload open clients.\n');
    } else {
      const pointer = await enableLocal({ repo, ...values });
      process.stdout.write(JSON.stringify(pointer) + '\n');
    }
  } catch (error) { process.stderr.write(String(error) + '\n'); process.exitCode = 1; }
}
