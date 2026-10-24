import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import {
  archiveOnlineJs, buildArchiveName, downloadOnlineJs, shortHash, splitModules,
} from '../scripts/archive-online-js.mjs';

const PRETTY = [
  '"use strict";',
  'var requirejs = {};',
  'define("Core/Context", [], function () {',
  '  return { a: 1 };',
  '});',
  '(function (a) {',
  '  a.lib = 1;',
  '})(this);',
  'var UrlTools = 1;',
  'define(',
  '  "Core/Client",',
  '  "require Utils".split(" "),',
  '  function (a) {',
  '    return a;',
  '  },',
  ');',
  'define("text!UI/Box.html", [], function () {',
  '  return "<div></div>";',
  '});',
  'define("Core/Context", [], function () {});',
  'define("../../etc/evil", [], function () {});',
  'define("App/Online", function () {});',
  '',
].join('\n');

describe('Online.js archive', () => {
  it('names archives with a UTC hour stamp', () => {
    expect(buildArchiveName(new Date('2026-10-24T23:59:59Z'), 'abcdef012345')).toBe('onlinejs-2026102423-abcdef012345.js');
    expect(shortHash(new Uint8Array([1, 2, 3]))).toMatch(/^[0-9a-f]{12}$/);
  });

  it('splits top-level statements losslessly, one file per named define', () => {
    const parts = splitModules(PRETTY);
    expect(parts.map((p) => p.text).join('')).toBe(PRETTY);
    expect(parts.map((p) => p.file)).toEqual([
      '_other-001.js', 'Core/Context.js', '_other-002.js', 'Core/Client.js', 'text_UI/Box.html.js',
      'Core/Context~2.js', 'etc/evil.js', 'App/Online.js',
    ]);
    for (const { text } of parts) expect(() => new vm.Script(text)).not.toThrow();
  });

  it('rejects downloads that are not a plausible Online.js', async () => {
    const fake = (status: number, size: number) => (() => Promise.resolve(new Response(new Uint8Array(size), { status }))) as typeof fetch;
    await expect(downloadOnlineJs('https://example.test/a.js', { fetchImpl: fake(404, 2_000_000) })).rejects.toThrow(/HTTP 404/);
    await expect(downloadOnlineJs('https://example.test/a.js', { fetchImpl: fake(200, 10) })).rejects.toThrow(/size/);
    await expect(downloadOnlineJs('https://example.test/a.js', { fetchImpl: fake(200, 1_500_000) })).resolves.toHaveLength(1_500_000);
  });

  it('archives only when the hash changes and replaces stale modules', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'online-js-archive-'));
    try {
      const run = (body: string, now: string, format = () => PRETTY) =>
        archiveOnlineJs({ archiveDir: dir, now: new Date(now), download: () => Promise.resolve(new TextEncoder().encode(body)), format });

      const first = await run('v1', '2026-10-24T06:10:00Z');
      expect(first).toMatchObject({ changed: true, name: `onlinejs-2026102406-${shortHash(new TextEncoder().encode('v1'))}.js`, modules: 8 });
      expect(await readFile(path.join(dir, first.name!), 'utf8')).toBe('v1');

      expect((await run('v1', '2026-10-24T12:10:00Z')).changed).toBe(false);
      expect((await readdir(dir)).filter((f) => f.startsWith('onlinejs-'))).toHaveLength(1);

      const second = await run('v2', '2026-10-24T18:10:00Z', () => 'define("Only/New", [], function () {});\n');
      expect(second.changed).toBe(true);
      expect(await readdir(path.join(dir, 'modules'), { recursive: true })).toEqual(expect.arrayContaining(['Only', 'Only/New.js']));
      expect(await readdir(path.join(dir, 'modules'))).toEqual(['Only']);

      const reverted = await run('v1', '2026-10-25T00:10:00Z');
      expect(reverted.changed).toBe(true);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  it('keeps the raw archive when formatting fails', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'online-js-archive-'));
    try {
      const result = await archiveOnlineJs({
        archiveDir: dir, now: new Date('2026-10-24T06:00:00Z'),
        download: () => Promise.resolve(new TextEncoder().encode('v1')),
        format: () => { throw new Error('boom'); },
      });
      expect(result.changed).toBe(true);
      expect(result.formatError?.message).toBe('boom');
      expect((await readdir(dir)).filter((f) => f.startsWith('onlinejs-'))).toHaveLength(1);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  it('tracks the latest hash in state, not by filename order within one hour', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'online-js-archive-'));
    try {
      const run = (body: string) => archiveOnlineJs({
        archiveDir: dir, now: new Date('2026-10-24T06:10:00Z'),
        download: () => Promise.resolve(new TextEncoder().encode(body)), format: () => `define("V/${body}", [], function () {});\n`,
      });
      expect((await run('v2')).changed).toBe(true);
      expect((await run('v1')).changed).toBe(true);
      expect((await run('v2')).changed).toBe(true);
      expect(await readdir(path.join(dir, 'modules'), { recursive: true })).toEqual(expect.arrayContaining(['V/v2.js']));
      expect((await run('v2')).changed).toBe(false);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  it('retries module generation for an already archived hash without duplicating the raw file', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'online-js-archive-'));
    try {
      const download = () => Promise.resolve(new TextEncoder().encode('v1'));
      const failed = await archiveOnlineJs({ archiveDir: dir, now: new Date('2026-10-24T06:00:00Z'), download, format: () => { throw new Error('boom'); } });
      expect(failed.formatError).toBeDefined();
      const retried = await archiveOnlineJs({ archiveDir: dir, now: new Date('2026-10-24T12:00:00Z'), download, format: () => PRETTY });
      expect(retried).toMatchObject({ changed: true, name: undefined, modules: 8 });
      expect((await readdir(dir)).filter((f) => f.startsWith('onlinejs-'))).toHaveLength(1);
      expect((await archiveOnlineJs({ archiveDir: dir, download, format: () => PRETTY })).changed).toBe(false);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
});
