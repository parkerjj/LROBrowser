import { expect, test } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { auditDist } from '../scripts/audit-iwa-dist.mjs';

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
