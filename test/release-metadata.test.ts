import { describe, expect, it } from 'vitest';
import { compareIwaVersions, getReleaseMetadata, validateIwaVersion } from '../scripts/build-release-metadata.mjs';

describe('release metadata', () => {
  it('accepts numeric IWA versions and compares them numerically', () => {
    expect(() => validateIwaVersion('0.1.12')).not.toThrow();
    expect(compareIwaVersions('0.1.12', '0.1.9')).toBeGreaterThan(0);
    expect(() => validateIwaVersion('abc123')).toThrow();
  });
  it('derives deterministic release metadata from GitHub inputs', () => {
    expect(getReleaseMetadata({ commitCount: '12', commitDate: '261027', commitSha: 'a'.repeat(40), channel: 'default', updateManifestUrl: 'https://cdn.example.test/updates.json', bundleBaseUrl: 'https://cdn.example.test/releases/' })).toEqual(expect.objectContaining({ version: '1.12.261027', commitSha: 'a'.repeat(40), channel: 'default' }));
  });
  it('rejects a commit date that is not yyMMdd', () => {
    const input = { commitCount: '1', commitSha: 'a'.repeat(40), channel: 'default', updateManifestUrl: 'https://cdn.example.test/updates.json', bundleBaseUrl: 'https://cdn.example.test/releases/' };
    expect(() => getReleaseMetadata({ ...input, commitDate: '2026-10-27' })).toThrow('yyMMdd');
    expect(() => getReleaseMetadata({ ...input, commitDate: undefined as unknown as string })).toThrow('yyMMdd');
  });
  it('orders the new scheme above every 0.1.x release', () => {
    expect(compareIwaVersions('1.12.261027', '0.1.162')).toBeGreaterThan(0);
    expect(compareIwaVersions('1.13.261027', '1.12.261101')).toBeGreaterThan(0);
  });
  it('rejects malformed commit and non-HTTPS production URLs', () => {
    expect(() => getReleaseMetadata({ commitCount: '1', commitDate: '261027', commitSha: 'bad', channel: 'default', updateManifestUrl: 'https://cdn.example.test/updates.json', bundleBaseUrl: 'https://cdn.example.test/releases/' })).toThrow();
    expect(() => getReleaseMetadata({ commitCount: '1', commitDate: '261027', commitSha: 'a'.repeat(40), channel: 'default', updateManifestUrl: 'http://cdn.example.test/updates.json', bundleBaseUrl: 'https://cdn.example.test/releases/' })).toThrow();
  });
});
