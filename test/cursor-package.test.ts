import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRuntimeResourceLoader as iwaLoader } from '../src/resources/runtime-resource-loader';
import { createRuntimeResourceLoader as webLoader } from '../src/resources/runtime-resource-loader-web';

afterEach(() => vi.unstubAllGlobals());

describe.each([['IWA', iwaLoader], ['Web', webLoader]] as const)('%s startup cursor resources', (_name, createLoader) => {
  it.each(['data/sprite/cursors.spr', 'data\\sprite\\CURSORS.ACT'])('rejects an absent local cursor without network access: %s', async path => {
    const fetch = vi.fn(async () => new Response(new Uint8Array([1, 2, 3])));
    vi.stubGlobal('fetch', fetch);
    const load = createLoader({ packageBaseUrl: 'https://iwa.invalid/core/', getManifest: () => [], getCharset: () => 'gbk' });
    await expect(load(path)).rejects.toThrow(/cursor|光标/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('loads the cursor solely from the local package and does not fall back after a package error', async () => {
    const requests: string[] = [];
    let broken = false;
    vi.stubGlobal('fetch', async (input: URL | string) => {
      requests.push(String(input));
      return broken ? new Response(null, { status: 404 }) : new Response(new Uint8Array([83, 80]));
    });
    const load = createLoader({ packageBaseUrl: 'https://iwa.invalid/core/', getManifest: () => [{ path: 'data/sprite/cursors.spr' }], getCharset: () => 'gbk' });
    expect(new Uint8Array(await load('data/sprite/cursors.spr'))).toEqual(new Uint8Array([83, 80]));
    broken = true;
    await expect(load('data/sprite/cursors.spr')).rejects.toThrow('Package resource failed');
    expect(requests).toEqual(['https://iwa.invalid/core/data/sprite/cursors.spr', 'https://iwa.invalid/core/data/sprite/cursors.spr']);
  });
});
