import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

function streams(response: string, write: (text: string) => void) {
  return {
    readable: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(response));
        controller.close();
      },
    }),
    writable: new WritableStream<Uint8Array>({ write(bytes) { write(new TextDecoder().decode(bytes)); } }),
  };
}

test('native login uses one TLS transport for the CSRF bootstrap and the form post', async () => {
  vi.stubGlobal('__LASTRO_BUILD_TARGET__', 'native');
  vi.stubGlobal('TCPSocket', undefined);
  const { prepareLastROLoginSession, sendLastROLoginPost } = await import('../src/network/lastro-login-http');
  const body = '<input name="_csrf" value="fixture-token">';
  const requests: string[] = [];
  const openStreams = vi.fn<(host: string, port: number, options: { signal: AbortSignal }) => Promise<ReturnType<typeof streams>>>(async () => streams(
    `HTTP/1.1 200 OK\r\nSet-Cookie: _csrf=fixture-cookie\r\nContent-Length: ${body.length}\r\n\r\n${body}`,
    request => requests.push(request),
  ));
  await prepareLastROLoginSession({ openStreams });
  await sendLastROLoginPost('checkin', 3, 'fixture-user', 'fixture-password', { openStreams });
  expect(openStreams).toHaveBeenCalledTimes(2);
  expect(openStreams.mock.calls.every(([host, port]) => host === 'game.lastro.cn' && port === 443)).toBe(true);
  expect(requests[0]).toMatch(/^GET \/\?r=pc\/index /);
  expect(requests[1]).toContain('Cookie: _csrf=fixture-cookie');
  expect(requests[1]).toContain('_csrf=fixture-token');
  expect(openStreams.mock.calls.every(([, , options]) => options.signal.aborted)).toBe(true);
});

test('native party requests can read a JSON response without a TCPSocket global', async () => {
  vi.stubGlobal('__LASTRO_BUILD_TARGET__', 'native');
  vi.stubGlobal('TCPSocket', undefined);
  const { requestLastROPartyOverTLS } = await import('../src/network/lastro-login-http');
  const body = '{"items":[]}';
  const write = vi.fn();
  const openStreams = async () => streams(`HTTP/1.1 200 OK\r\nContent-Length: ${body.length}\r\n\r\n${body}`, write);
  await expect(requestLastROPartyOverTLS(5, 'list', new FormData(), { openStreams })).resolves.toEqual({ items: [] });
  expect(write).toHaveBeenCalledWith(expect.stringMatching(/^POST \/webserver2\/party\/list /));
});
