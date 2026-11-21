import { expect, test, vi } from 'vitest';
import { createNativeResourceFetch, nativeResourceBaseUrl } from '../src/resources/native-resource-fetch';

test.each([
  ['https:', 'https://lro.localhost/'],
  ['http:', 'http://lro.localhost/'],
  ['tauri:', 'lro://localhost/'],
])('uses the Tauri resource protocol for a %s app origin', (protocol, expected) => {
  expect(nativeResourceBaseUrl(protocol)).toBe(expected);
});

test('routes official passive resources and preserves UTF-8 and legacy byte encodings', async () => {
  const transport = vi.fn<typeof fetch>(async () => new Response('asset'));
  const fetchAsset = createNativeResourceFetch('https://lro.localhost/', transport);
  const signal = new AbortController().signal;
  await fetchAsset(new URL('https://game.lastro.cn/ro/client_re/data/中 文.spr'), { signal });
  await fetchAsset('https://rodata.ltsd.ro/ro/client_re/data/%C7%D1%20%B1%DB.act');
  expect(transport.mock.calls.map(([url]) => String(url))).toEqual([
    expect.stringMatching(/^https:\/\/lro\.localhost\/lastro\/data\/%E4%B8%AD%20%E6%96%87\.spr\?request=[0-9a-f]{32}$/),
    'https://lro.localhost/rodata/data/%C7%D1%20%B1%DB.act',
  ]);
  expect(transport.mock.calls[0]?.[1]).toMatchObject({ signal, credentials: 'omit', redirect: 'error' });
});

test('cancels the matching Rust download when the resolver aborts an outstanding request', async () => {
  const controller = new AbortController();
  const transport = vi.fn<typeof fetch>().mockReturnValueOnce(new Promise(() => {}))
    .mockResolvedValueOnce(new Response(null, { status: 204 }));
  const fetchAsset = createNativeResourceFetch('https://lro.localhost/', transport);
  void fetchAsset('https://game.lastro.cn/ro/client_re/data/prontera.gnd', { signal: controller.signal });
  const request = new URL(String(transport.mock.calls[0]?.[0]));
  controller.abort();
  expect(transport).toHaveBeenCalledTimes(2);
  expect(request.searchParams.get('request')).toMatch(/^[0-9a-f]{32}$/);
  expect(String(transport.mock.calls[1]?.[0])).toBe(`https://lro.localhost/cancel/${request.searchParams.get('request')}`);
  expect(transport.mock.calls[1]?.[1]?.signal).toBeUndefined();
});

test('can discard a completed response without sending a cancellation', async () => {
  const controller = new AbortController();
  const transport = vi.fn<typeof fetch>(async () => new Response('asset'));
  const fetchAsset = createNativeResourceFetch('lro://localhost/', transport);
  await fetchAsset('https://rodata.ltsd.ro/ro/client_re/data/icon.spr', { signal: controller.signal });
  controller.abort();
  expect(transport).toHaveBeenCalledTimes(1);
});

test.each([
  'https://example.invalid/ro/client_re/data/icon.spr',
  'http://game.lastro.cn/ro/client_re/data/icon.spr',
  'https://someone@game.lastro.cn/ro/client_re/data/icon.spr',
  'https://game.lastro.cn/ro/client_re/data/icon.spr?external=1',
  'https://game.lastro.cn/ro/client_re/data/icon.spr#fragment',
  'https://game.lastro.cn/ro/client_re/data/script.js',
  'https://rodata.ltsd.ro/ro/client_re/data/script.wasm',
  'https://game.lastro.cn/ro/Online.js',
])('rejects %s before sending a request', async (url) => {
  const transport = vi.fn<typeof fetch>();
  await expect(createNativeResourceFetch('lro://localhost/', transport)(url)).rejects.toThrow();
  expect(transport).not.toHaveBeenCalled();
});
