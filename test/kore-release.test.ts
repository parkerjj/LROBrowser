import { test, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, rm, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { packageFixture, digest } from './kore-fixture';
import { downloadRelease, importReleasePackage, validateDistribution, extractReleaseArchive, extractLegacyArchive, prepareLegacyFieldpack, mergeKorePackage, withKoreLock, verifyWebHosting } from '../scripts/kore-local.mjs';
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

test('explicit old release tag selects its own immutable release, never latest or a legacy attachment', async () => {
  const f = await fixture();
  try {
    const latest = { ...f.release, tag_name: 'ke-' + 'b'.repeat(40) + '-999-1' };
    const fetchImpl: typeof fetch = async (input, init) => String(input).endsWith('/releases/tags/' + tag) ? Response.json(f.release)
      : String(input).endsWith('/releases/latest') ? Response.json(latest) : f.fetchImpl(input, init);
    const metadata = await downloadRelease({ out: path.join(f.root, 'explicit'), token: 'x', releaseTag: tag, fetchImpl });
    expect(metadata.tag).toBe(tag); expect(f.requests.some(r => r.url.endsWith('/releases/latest'))).toBe(false);
    const missing: typeof fetch = async (input, init) => String(input).includes('/releases/tags/') ? new Response(null, { status: 404 }) : f.fetchImpl(input, init);
    await expect(downloadRelease({ out: path.join(f.root, 'missing-tag'), token: 'x', releaseTag: tag, fetchImpl: missing })).rejects.toThrow('http-404');
    await expect(prepareLegacyFieldpack({ repo: path.join(f.root, 'repo'), releaseTag: tag, token: 'x', fetchImpl })).rejects.toThrow('invalid-release-asset');
  } finally { await rm(f.root, { recursive: true, force: true }); }
});
function tarEntries(tar: Buffer): Buffer[] {
  const result = [];
  for (let offset = 0; offset < tar.length && tar[offset];) {
    const size = parseInt(tar.subarray(offset + 124, offset + 136).toString().replace(/\0.*$/, '').trim(), 8);
    const length = 512 + Math.ceil(size / 512) * 512;
    result.push(Buffer.from(tar.subarray(offset, offset + length))); offset += length;
  }
  return result;
}
function tarHeader(entry: Buffer, name?: string, type?: number) {
  const copy = Buffer.from(entry);
  if (name) { copy.fill(0, 0, 100); copy.fill(0, 345, 500); copy.write(name, 0); }
  if (type !== undefined) copy[156] = type;
  copy.fill(32, 148, 156);
  copy.write(copy.subarray(0, 512).reduce((sum, byte) => sum + byte, 0).toString(8).padStart(6, '0') + '\0 ', 148);
  return copy;
}
test('legacy USTAR completely verifies 1311 real files and rejects malicious archives before installation', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'ke-legacy-'));
  try {
    const archiveFile = path.join(root, 'legacy.tar.gz');
    const source = path.resolve('public/ke/map');
    // Match KE's canonical ordinary-file layout: no directory entries, exactly manifest + 1310 maps.
    const { readdir } = await import('node:fs/promises');
    const names: string[] = [];
    async function walk(relative: string) {
      for (const item of await readdir(path.join(source, relative), { withFileTypes: true })) {
        const name = relative + '/' + item.name;
        if (item.isDirectory()) await walk(name); else names.push(name);
      }
    }
    await walk('fieldpack-2.0.5');
    expect(names).toHaveLength(1311);
    execFileSync('tar', ['--format=ustar', '--no-recursion', '-czf', archiveFile, '-C', source, ...names.sort()]);
    const archive = await readFile(archiveFile);
    const out = path.join(root, 'complete');
    await extractLegacyArchive(archive, out);
    for (const name of names) expect(digest(await readFile(path.join(out, name)))).toBe(digest(await readFile(path.join(source, name))));
    const entries = tarEntries(gunzipSync(archive));
    const pack = (items: Buffer[]) => gzipSync(Buffer.concat([...items, Buffer.alloc(1024)]));
    const manifest = entries.findIndex(entry => entry.subarray(0, 100).toString().startsWith('fieldpack-2.0.5/manifest.json'));
    const corrupt = Buffer.from(entries[0]!); corrupt[512] = corrupt[512]! ^ 1;
    const invalidUtf8 = Buffer.from(entries[0]!); invalidUtf8[0] = 255;
    const variants = [
      [...entries, entries[0]!], entries.slice(1), [tarHeader(entries[0]!, '../escape'), ...entries.slice(1)],
      [tarHeader(entries[0]!, undefined, 50), ...entries.slice(1)], [corrupt, ...entries.slice(1)],
      [tarHeader(invalidUtf8), ...entries.slice(1)], [...entries, tarHeader(entries[0]!, 'extra.fld2.gz')],
      entries.map((entry, i) => i === manifest ? Buffer.concat([entry.subarray(0, 512), Buffer.alloc(entry.length - 512, 32)]) : entry),
      [tarHeader(entries[0]!, 'fieldpack-2.0.5'), ...entries.slice(1)],
    ];
    for (const [i, items] of variants.entries()) {
      const dest = path.join(root, 'bad-' + i);
      await expect(extractLegacyArchive(pack(items), dest)).rejects.toThrow();
      await expect(access(dest)).rejects.toThrow();
    }
    const repo = path.join(root, 'host');
    await expect(prepareLegacyFieldpack({ repo, source: 'relative' })).rejects.toThrow('explicit-legacy');
    await expect(prepareLegacyFieldpack({ repo })).rejects.toThrow('explicit-legacy');
    // Separate fixed legacy release has the resource even when the selected historical KE release does not.
    const f = await fixture();
    try {
      const fixedTag = 'ke-' + sha + '-999-1';
      const checksum = Buffer.from(digest(archive) + '  ke-legacy-fieldpack-2.0.5.tar.gz\n');
      const release = { ...f.release, tag_name: fixedTag, assets: [archive, checksum].map((bytes, i) => ({ id: 10 + i, name: 'ke-legacy-fieldpack-2.0.5.tar.gz' + (i ? '.sha256' : ''), state: 'uploaded', size: bytes.length, digest: 'sha256:' + digest(bytes) })) };
      const fetchImpl: typeof fetch = async input => String(input).includes('/releases/tags/') ? Response.json(release)
        : String(input).includes('/git/ref/tags/') ? Response.json({ object: { type: 'commit', sha } })
        : new Response(new Uint8Array(String(input).endsWith('/10') ? archive : checksum));
      await expect(prepareLegacyFieldpack({ repo, releaseTag: fixedTag, token: 'x', fetchImpl })).resolves.toMatchObject({ source: 'release', tag: fixedTag });
      const poisoned: typeof fetch = async (input, init) => String(input).endsWith('/10') ? new Response(new Uint8Array([1])) : fetchImpl(input, init);
      await expect(prepareLegacyFieldpack({ repo, releaseTag: fixedTag, token: 'x', fetchImpl: poisoned })).rejects.toThrow('asset-digest');
      await expect(access(path.join(repo, 'generated/ke/legacy'))).rejects.toThrow();
    } finally { await rm(f.root, { recursive: true, force: true }); }
  } finally { await rm(root, { recursive: true, force: true }); }
});
