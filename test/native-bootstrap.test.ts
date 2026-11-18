// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { getAvailableServerProfile } from '../src/servers/server-profiles';

vi.mock('/runtime/Online.js', () => ({}));
vi.mock('../src/network/lastro-login-http', () => ({
  prepareLastROLoginSession: vi.fn(async () => undefined),
  requestLastROPartyOverTLS: vi.fn(async () => ({})),
  sendLastROLoginPost: vi.fn(async () => undefined),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.clearAllMocks();
});

test('the native bootstrap installs its own transports before loading the game', async () => {
  vi.stubGlobal('__LASTRO_BUILD_TARGET__', 'native');
  vi.stubGlobal('__TAURI__', { core: { invoke: vi.fn(), Channel: class {} } });
  const fetcher = vi.fn<typeof fetch>(async (url) => String(url).endsWith('executable-assets.json')
    ? Response.json({ files: [] }) : new Response(null, { status: 404 }));
  vi.stubGlobal('fetch', fetcher);
  const { bootstrapV2Client } = await import('../src/runtime/client-bootstrap');
  const { prepareLastROLoginSession } = await import('../src/network/lastro-login-http');
  await bootstrapV2Client({ mount: document.body, profile: getAvailableServerProfile('lastro-2x'),
    credentials: { username: '', password: '' } });
  expect(globalThis.LastRONativeBuild).toBe(true);
  expect(globalThis.LastROWebBuild).toBe(false);
  expect(globalThis.LastRODirectSocketsSupported).toBe(true);
  expect(globalThis.LastRODirectSocketFactory).toBeTypeOf('function');
  expect(globalThis.LastRORelaySocketFactory).toBeTypeOf('function');
  expect(globalThis.LastROPartyHttpRequest).toBeTypeOf('function');
  expect(globalThis.LastROLoginRegistration).toBeTypeOf('function');
  expect(globalThis.LastROResourceRoots).toEqual(['https://game.lastro.cn/ro/client_re/', 'https://rodata.ltsd.ro/ro/client_re/']);
  expect(prepareLastROLoginSession).toHaveBeenCalledWith({ openStreams: expect.any(Function) });
  expect(fetcher.mock.calls.map(([url]) => String(url))).toContain('http://lro.localhost/official/ro/Online.js');
});

test('the IWA bootstrap continues to use its existing direct socket factory', async () => {
  vi.stubGlobal('__LASTRO_BUILD_TARGET__', 'iwa');
  vi.stubGlobal('LastRONativeBuild', undefined);
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ files: [] })));
  const { bootstrapV2Client } = await import('../src/runtime/client-bootstrap');
  const { createDirectSocket } = await import('../src/network/socket-factory');
  await bootstrapV2Client({ mount: document.body, profile: getAvailableServerProfile('lastro-2x'),
    credentials: { username: '', password: '' } });
  expect(globalThis.LastRONativeBuild).not.toBe(true);
  expect(globalThis.LastRODirectSocketFactory).toBe(createDirectSocket);
});
