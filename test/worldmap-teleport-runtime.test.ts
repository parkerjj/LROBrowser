import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { runInNewContext } from 'node:vm';
import { extractRuntimeNode } from './helpers/vendor-runtime';
import { mapBinaryFixture } from './map-binary-fixture';

const { buildPrivateAirshipRequest } = await import(new URL('../vendor/v2/lastro-v1-migration.mjs', import.meta.url).href);
const native = readFileSync('vendor/v2/Online.js', 'utf8');
const runtime = readFileSync('generated/runtime/Online.js', 'utf8');
const describeLastroMapLoadFailure = runInNewContext(`(${extractRuntimeNode(native, { kind: 'function', name: 'describeLastroMapLoadFailure' })})`);
const resolveLastroMapResourceName = runInNewContext(`(${extractRuntimeNode(native, { kind: 'function', name: 'resolveLastroMapResourceName' })})`);
const begin = runtime.indexOf('const lastroWorldMapPreflight =');
const installation = runtime.slice(begin, runtime.indexOf('WorldMap._lastroTeleport =', begin));
if (begin < 0 || !installation) throw new Error('Missing world map resource gate');

function resources() {
  const rsw = mapBinaryFixture('rsw');
  new Uint8Array(rsw).set(new TextEncoder().encode('terrain.gnd'), 51);
  new Uint8Array(rsw).set(new TextEncoder().encode('collision.gat'), 91);
  const gnd = mapBinaryFixture('gnd'); new DataView(gnd).setFloat32(14, 10, true);
  const gat = new ArrayBuffer(94);
  new Uint8Array(gat).set([71, 82, 65, 84, 1, 2]);
  new DataView(gat).setUint32(6, 2, true); new DataView(gat).setUint32(10, 2, true);
  return { 'data/ein_fild04.rsw': rsw, 'data/terrain.gnd': gnd, 'data/collision.gat': gat } as Record<string, ArrayBuffer | null>;
}

function fixture(files = resources()) {
  const packets: unknown[] = [], reads: string[] = [];
  const popup = vi.fn();
  const state = { currentMap: 'izlude.gat', loading: false };
  const api = new Function('Thread', 'DB', 'MapRenderer', 'Configs', 'PACKET', 'Network', 'buildPrivateAirshipRequest', 'normalizeLastROTeleportMap', 'UIManager', 'console', 'describeLastroMapLoadFailure', 'resolveLastroMapResourceName', `
    ${installation}
    return lastroWorldMapTeleport;
  `)({ send: (type: string, input: { filename: string }, callback: (bytes: ArrayBuffer | null, error?: string) => void) => {
    expect(type).toBe('GET_FILE'); reads.push(input.filename);
    queueMicrotask(() => callback(files[input.filename] ?? null, files[input.filename] ? undefined : 'http-404'));
  } }, { mapalias: {} }, state, { get: () => 5 }, { CZ: { PRIVATE_AIRSHIP_REQUEST: class {} } },
  { sendPacket: (packet: unknown) => packets.push(packet) }, buildPrivateAirshipRequest, (map: string) => map.replace(/\.gat$/i, ''),
  { showErrorBox: popup, showPromptBox: (_message: string, _yes: string, _no: string, approve: () => void) => { approve(); return {}; } },
  { warn: () => {} }, describeLastroMapLoadFailure, resolveLastroMapResourceName);
  return { api, packets, reads, popup, state };
}

describe('serialized world map teleport (preflight disabled)', () => {
  it('sends the original map-level packet once without reading any scene resources', async () => {
    const f = fixture();
    expect(await f.api.request('ein_fild04')).toBe(true);
    expect(f.reads).toEqual([]);
    expect(f.packets).toEqual([expect.objectContaining({ mapname: 'ein_fild04', type: 0, x: 0, y: 0, itemid: 14527 })]);
  });

  it('is not blocked by missing or invalid scene files because they are never fetched', async () => {
    const f = fixture({ 'data/terrain.gnd': new ArrayBuffer(100) });
    expect(await f.api.request('ein_fild04')).toBe(true);
    expect(f.reads).toEqual([]);
    expect(f.popup).not.toHaveBeenCalled();
    expect(f.packets).toHaveLength(1);
  });
});
