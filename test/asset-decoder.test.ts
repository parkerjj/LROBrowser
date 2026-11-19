import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { setImmediate } from 'node:timers/promises';
import { createContext, runInContext, runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { createAssetDecoder, preloadAssetDecoder, requiresAssetDecoder } from '../src/runtime/asset-decoder';
import { mapBinaryFixture } from './map-binary-fixture';
import { patchResourceHandler } from '../scripts/patch-resource-worker.mjs';

async function packagedDecoder() {
  const bytes = await readFile('generated/core/wasm/lro-asset-decode.wasm');
  const { instance } = await WebAssembly.instantiate(bytes);
  return createAssetDecoder(instance.exports as unknown as Parameters<typeof createAssetDecoder>[0]);
}

describe('packaged decoder', () => {
  it('waits for the packaged decoder before delivering converted file types', async () => {
    const handler = await readFile('vendor/v2/LastROThreadEventHandler.js', 'utf8');
    const expected = mapBinaryFixture('gat');
    let loaded!: () => void;
    const se = { lastroAssetDecoderReady: new Promise<void>(resolve => { loaded = resolve; }) } as {
      lastroAssetDecoderReady: Promise<void>,
      getHTTP: (name: string, callback: (bytes: ArrayBuffer) => void) => void,
    };
    runInNewContext(patchResourceHandler(handler), {
      URL, se, self: { location: { href: 'https://iwa.invalid/runtime/LastROThreadEventHandler.js' } }, importScripts() {},
      LastROResources: { createRuntimeResourceLoader: () => async () => expected, requiresAssetDecoder },
    });
    const map = vi.fn();
    const text = vi.fn();
    se.getHTTP('data/test.gat', map);
    se.getHTTP('data/test.txt', text);
    await setImmediate();
    expect(text).toHaveBeenCalledExactlyOnceWith(expected);
    expect(map).not.toHaveBeenCalled();
    loaded();
    await setImmediate();
    expect(map).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it('returns owned GAT vertices and rejects invalid dimensions', async () => {
    const decoder = await packagedDecoder();
    const bytes = mapBinaryFixture('gat', 3);
    const view = new DataView(bytes);
    for (let i = 0; i < 4; i++) view.setFloat32(14 + 4 * i, i + 1, true);
    const a = decoder.decodeGat(bytes);
    decoder.decodeGat(bytes);
    expect(a).toMatchObject({ width: 1, height: 1, version: 1.2 });
    expect([...a.cells]).toEqual([0.20000000298023224, 0.4000000059604645, 0.6000000238418579, 0.800000011920929, 14]);
    view.setUint32(6, 0xffffffff, true);
    expect(() => decoder.decodeGat(bytes)).toThrow('invalid-asset-gat');
  });

  it('decodes the packaged cursor into legacy indexed frames and blocks oversized frames', async () => {
    const decoder = await packagedDecoder();
    const cursor = await readFile('generated/core/data/sprite/cursors.spr');
    const result = decoder.decodeSpr(Uint8Array.from(cursor).buffer);
    expect(result.frames).toHaveLength(31);
    expect(result.indexed_count).toBe(31);
    expect(result.palette).toHaveLength(1024);
    const bytes = new Uint8Array(8 + 6 + 1024);
    bytes.set([83, 80, 1, 2, 1, 0, 0, 0, 255, 255, 255, 255]);
    expect(() => decoder.decodeSpr(bytes.buffer)).toThrow('invalid-asset-spr');
  });

  it('loads a map through the shipped Worker and transfers all compiled buffers', async () => {
    const [entry, handler, loader, wasm] = await Promise.all([
      readFile('generated/runtime/LastROThreadEventHandler.js', 'utf8'),
      readFile('generated/runtime/ThreadEventHandler.js', 'utf8'),
      readFile('generated/runtime/lastro-resource-loader.js', 'utf8'),
      readFile('generated/core/wasm/lro-asset-decode.wasm'),
    ]);
    const scene = mapBinaryFixture('rsw', 0, 2.1);
    new Uint8Array(scene).set(new TextEncoder().encode('fixture.gnd'), 46);
    new Uint8Array(scene).set(new TextEncoder().encode('fixture.gat'), 86);
    const files: Record<string, ArrayBuffer> = {
      'fixture.rsw': scene, 'fixture.gat': mapBinaryFixture('gat'), 'fixture.gnd': mapBinaryFixture('gnd'),
    };
    const events = new Map<string, { data: Record<string, unknown>, transfers: number }>();
    let complete!: (values: unknown[]) => void;
    const finished = new Promise<unknown[]>(resolve => { complete = resolve; });
    const scope = createContext({
      ArrayBuffer, Uint8Array, Float32Array, DataView, TextDecoder, TextEncoder, WebAssembly, URL, Response, console, crypto: webcrypto,
      location: new URL('https://iwa.invalid/runtime/LastROThreadEventHandler.js'),
      manifest: { files: [{ path: 'wasm/lro-asset-decode.wasm', kind: 'wasm', bytes: wasm.byteLength, sha256: 'a'.repeat(64) }] },
      fetch: async () => new Response(Uint8Array.from(wasm)),
      readFixture: (name: string) => files[name.split('\\').at(-1)!] ?? Uint8Array.of(1).buffer,
      postMessage: (message: { type?: string, uid?: number, arguments: unknown[], data: Record<string, unknown> }, moved: ArrayBuffer[] = []) => {
        const received = structuredClone(message, { transfer: moved });
        if (received.type) events.set(received.type, { data: received.data, transfers: moved.length });
        if (received.uid === 1) complete(received.arguments);
      },
    });
    scope.self = scope;
    scope.importScripts = (...scripts: string[]) => {
      for (const script of scripts) runInContext(String(script).endsWith('lastro-resource-loader.js') ? loader : handler, scope);
    };
    runInContext(entry, scope);
    runInContext(`
      onmessage({data:{type:'SET_EXECUTABLE_MANIFEST',data:manifest}});
      se.getHTTP = (name, done) => se.lastroAssetDecoderReady.then(() => done(readFixture(name)), e => done(null, e.message));
      onmessage({data:{type:'LOAD_MAP',uid:1,data:'fixture.rsw'}});
    `, scope);

    expect((await finished)[0]).toBe(true);
    expect(events.get('MAP_ALTITUDE')).toMatchObject({ data: { width: 1, height: 1 }, transfers: 1 });
    expect(events.get('MAP_GROUND')).toMatchObject({ data: { width: 1, height: 1, meshVertCount: 6 }, transfers: 5 });
    expect(events.get('MAP_MODELS')?.transfers).toBe(1);
  });

  it('only fetches the fixed path listed as WASM and allows a failed load to be retried', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error('asset unavailable'));
    const base = new URL('https://iwa.invalid/core/');
    await expect(preloadAssetDecoder([{ path: 'wasm/lro-asset-decode.wasm', kind: 'passive' }], base, fetcher))
      .rejects.toThrow('asset-decoder-missing-from-package');
    expect(fetcher).not.toHaveBeenCalled();
    const files = [{ path: 'wasm/lro-asset-decode.wasm', kind: 'wasm' }];
    await expect(preloadAssetDecoder(files, base, fetcher)).rejects.toThrow('asset unavailable');
    await expect(preloadAssetDecoder(files, base, fetcher)).rejects.toThrow('asset unavailable');
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenLastCalledWith(new URL('wasm/lro-asset-decode.wasm', base), { redirect: 'error', credentials: 'omit' });
  });
});
