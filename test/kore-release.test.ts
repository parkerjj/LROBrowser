import { test, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, rm, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { packageFixture, digest } from './kore-fixture';
import { downloadRelease, importReleasePackage, validateDistribution, extractReleaseArchive, mergeKorePackage, withKoreLock, verifyWebHosting } from '../scripts/kore-local.mjs';
const sha = 'a'.repeat(40), tag = 'ke-' + sha + '-123-1';
test('Web production requires hosting isolation headers and an allowed isolation permission', async () => {
  const response = (headers: Record<string, string>): typeof fetch => async () => new Response(null, { headers });
  await expect(verifyWebHosting({ fetchImpl: response({}) })).rejects.toThrow('web-hosting-not-isolated');
  const headers = { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'credentialless' };
  await expect(verifyWebHosting({ fetchImpl: response(headers) })).resolves.toMatchObject({ isolatedHeaders: true });
  await expect(verifyWebHosting({ fetchImpl: response({ ...headers, 'Permissions-Policy': 'cross-origin-isolated=()' }) })).rejects.toThrow('web-hosting-not-isolated');
});
function canonical(value: unknown): unknown { if (Array.isArray(value))
  return value.map(canonical); if (value && typeof value === 'object')
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)])); return value; }
async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'ke-release-import-')), pkg = path.join(root, 'source');
  await mkdir(pkg);
  const fixture = packageFixture();
  const manifest = { ...fixture.manifest, mode: 'release', sourceDirty: false, commitSha: sha, toolVersions: { rust: '1.99.0', wasmBindgen: '0.2.129', binaryen: '133' } };
  const { packageId: unused, ...metadata } = manifest;
  void unused;
  manifest.packageId = digest(JSON.stringify(canonical(metadata)));
  for (const [name, bytes] of fixture.payload)
    await writeFile(path.join(pkg, name), bytes);
  await writeFile(path.join(pkg, 'manifest.json'), JSON.stringify(manifest));
  const archiveFile = path.join(root, 'kore-engine.tar.gz');
  execFileSync('tar', ['--format=ustar', '-czf', archiveFile, '-C', pkg, '.']);
  const archive = await readFile(archiveFile);
  const payloads = new Map([[1, archive], [2, Buffer.from(digest(archive) + '  kore-engine.tar.gz\n')], [3, Buffer.from(JSON.stringify(manifest))], [4, Buffer.from(JSON.stringify({ [manifest.buildId!]: { chunk: 'core', sha256: manifest.chunks!.core.sha256 } }))]]);
  const names = ['kore-engine.tar.gz', 'kore-engine.tar.gz.sha256', 'manifest.json', 'ltsd-build-manifest.json'];
  const release = { id: 1, tag_name: tag, draft: false, prerelease: false, assets: names.map((name, i) => ({ id: i + 1, name, size: payloads.get(i + 1)!.length, state: 'uploaded', digest: 'sha256:' + digest(payloads.get(i + 1)!) })) };
  const requests: Array<{
    url: string;
    auth: string | null;
  }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    requests.push({ url, auth: new Headers(init?.headers).get('authorization') });
    if (url.endsWith('/releases/latest'))
      return Response.json(release);
    if (url.includes('/git/ref/tags/'))
      return Response.json({ object: { type: 'commit', sha } });
    if (url.includes('/commits?'))
      return Response.json([{ sha }], { headers: { link: `<https://api.github.com/repos/parkerjj/KoreEngine/commits?per_page=1&sha=${sha}&page=264>; rel="next", <https://api.github.com/repos/parkerjj/KoreEngine/commits?per_page=1&sha=${sha}&page=264>; rel="last"` } });
    const id = Number(url.split('/').at(-1));
    return new Response(new Uint8Array(payloads.get(id)!), { status: 200 });
  };
  return { root, pkg, archive, payloads, manifest, release, requests, fetchImpl };
}
test('one authenticated stable Release is validated, imported and required in the built distribution', async () => {
  const f = await fixture();
  try {
    const out = path.join(f.root, 'download');
    const meta = await downloadRelease({ out, token: 'test-read-token', fetchImpl: f.fetchImpl });
    expect(meta.packageId).toBe(f.manifest.packageId);
    expect(meta.commitCount).toBe(264);
    expect(f.requests.filter(r => r.url.endsWith('/releases/latest'))).toHaveLength(1);
    const host = path.join(f.root, 'host');
    await importReleasePackage({ repo: host, packageRoot: path.join(out, 'package'), metadata: meta });
    await mkdir(path.join(host, 'generated/core'), { recursive: true });
    await writeFile(path.join(host, 'generated/core/executable-assets.json'), '{"files":[]}');
    await withKoreLock(host, () => mergeKorePackage(host, { required: true }));
    await expect(validateDistribution({ dist: path.join(host, 'generated'), expectedPackageId: meta.packageId })).resolves.toMatchObject({ packageId: meta.packageId });
    await writeFile(path.join(host, 'generated/core/ke', meta.packageId, 'kore_wasm.js'), 'corrupt');
    await expect(validateDistribution({ dist: path.join(host, 'generated'), expectedPackageId: meta.packageId })).rejects.toThrow('hash-mismatch');
    await writeFile(path.join(host, 'generated/ke/packages', meta.packageId, 'kore_wasm.js'), 'corrupt');
    await expect(withKoreLock(host, () => mergeKorePackage(host, { required: true }))).rejects.toThrow();
  }
  finally {
    await rm(f.root, { recursive: true, force: true });
  }
});
test('missing token, bad checksum, prerelease and mismatching tag commit fail closed', async () => {
  const f = await fixture();
  try {
    await expect(downloadRelease({ out: path.join(f.root, 'missing'), token: '', fetchImpl: f.fetchImpl })).rejects.toThrow();
    f.release.prerelease = true;
    await expect(downloadRelease({ out: path.join(f.root, 'pre'), token: 'x', fetchImpl: f.fetchImpl })).rejects.toThrow();
    f.release.prerelease = false;
    const badFetch: typeof fetch = async (input, init) => String(input).includes('/git/ref/tags/') ? Response.json({ object: { type: 'commit', sha: 'b'.repeat(40) } }) : f.fetchImpl(input, init);
    await expect(downloadRelease({ out: path.join(f.root, 'tag'), token: 'x', fetchImpl: badFetch })).rejects.toThrow();
    const originalDigest = f.release.assets[0]!.digest;
    f.release.assets[0]!.digest = 'sha256:' + '0'.repeat(64);
    await expect(downloadRelease({ out: path.join(f.root, 'asset'), token: 'x', fetchImpl: f.fetchImpl })).rejects.toThrow('asset-digest-mismatch');
    f.release.assets[0]!.digest = originalDigest;
    f.payloads.set(2, Buffer.from('0'.repeat(64) + '  kore-engine.tar.gz\n'));
    f.release.assets[1]!.digest = 'sha256:' + digest(f.payloads.get(2)!);
    await expect(downloadRelease({ out: path.join(f.root, 'checksum'), token: 'x', fetchImpl: f.fetchImpl })).rejects.toThrow('checksum-mismatch');
    await expect(access(path.join(f.root, 'checksum/package'))).rejects.toThrow();
  }
  finally {
    await rm(f.root, { recursive: true, force: true });
  }
});
test('annotated tags resolve to the exact commit and unavailable releases fail', async () => {
  const f = await fixture();
  try {
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      if (url.includes('/git/ref/tags/')) return Response.json({ object: { type: 'tag', sha: 'c'.repeat(40) } });
      if (url.includes('/git/tags/')) return Response.json({ object: { type: 'commit', sha } });
      return f.fetchImpl(input, init);
    };
    await expect(downloadRelease({ out: path.join(f.root, 'annotated'), token: 'x', fetchImpl })).resolves.toMatchObject({ commitSha: sha });
    const missing: typeof fetch = async () => new Response('missing', { status: 404 });
    await expect(downloadRelease({ out: path.join(f.root, '404'), token: 'x', fetchImpl: missing })).rejects.toThrow('http-404');
  } finally { await rm(f.root, { recursive: true, force: true }); }
});
test('signed asset redirects strip authorization and unsafe redirect origins are refused', async () => {
  const f = await fixture();
  try {
    let stripped = false;
    const redirected: typeof fetch = async (input, init) => { if (String(input).endsWith('/releases/assets/1'))
      return new Response(null, { status: 302, headers: { location: 'https://release-assets.githubusercontent.com/audit' } }); if (String(input).startsWith('https://release-assets.githubusercontent.com/')) {
      stripped = !new Headers(init?.headers).has('authorization');
      return new Response(new Uint8Array(f.archive));
    } return f.fetchImpl(input, init); };
    await downloadRelease({ out: path.join(f.root, 'redirect'), token: 'secret', fetchImpl: redirected });
    expect(stripped).toBe(true);
    const unsafe: typeof fetch = async (input, init) => String(input).endsWith('/releases/assets/1') ? new Response(null, { status: 302, headers: { location: 'https://evil.invalid/file' } }) : f.fetchImpl(input, init);
    await expect(downloadRelease({ out: path.join(f.root, 'unsafe'), token: 'secret', fetchImpl: unsafe })).rejects.toThrow();
  }
  finally {
    await rm(f.root, { recursive: true, force: true });
  }
});
test('TAR extraction rejects traversal and symbolic links before writing files', async () => {
  const f = await fixture();
  try {
    const outside = path.join(f.root, 'outside');
    await writeFile(outside, 'private');
    const link = path.join(f.root, 'link.tar.gz');
    execFileSync('ln', ['-s', outside, path.join(f.pkg, 'symlink')]);
    execFileSync('tar', ['--format=ustar', '-czf', link, '-C', f.pkg, '.']);
    await expect(extractReleaseArchive(await readFile(link), path.join(f.root, 'link-out'))).rejects.toThrow();
    const tar = Buffer.alloc(2048);
    tar.write('../escape');
    tar.write('0000644\0', 100);
    tar.write('0000000\0', 108);
    tar.write('0000000\0', 116);
    tar.write('00000000000\0', 124);
    tar.write('00000000000\0', 136);
    tar.fill(32, 148, 156);
    tar[156] = 48;
    tar.write('ustar\0', 257);
    const sum = tar.subarray(0, 512).reduce((a, b) => a + b, 0);
    tar.write(sum.toString(8).padStart(6, '0') + '\0 ', 148);
    await expect(extractReleaseArchive(gzipSync(tar), path.join(f.root, 'traversal-out'))).rejects.toThrow();
  }
  finally {
    await rm(f.root, { recursive: true, force: true });
  }
});
test('required KE rejects missing staging and missing distribution', async () => { const root = await mkdtemp(path.join(tmpdir(), 'ke-required-')); try {
  await expect(mergeKorePackage(root, { required: true })).rejects.toThrow();
  await expect(validateDistribution({ dist: root, expectedPackageId: 'a'.repeat(64) })).rejects.toThrow();
}
finally {
  await rm(root, { recursive: true, force: true });
} });
