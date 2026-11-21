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

test.each([
  ['Content-Length: 10', '{"Type":1}'],
  ['Transfer-Encoding: chunked', 'a\r\n{"Type":1}\r\n0\r\n\r\n'],
])('native party replies complete by HTTP framing (%s)', async (header, body) => {
  vi.stubGlobal('__LASTRO_BUILD_TARGET__', 'native');
  const { requestLastROPartyOverTLS } = await import('../src/network/lastro-login-http');
  const chunks = [`HTTP/1.1 200 OK\r\n${header}\r`, `\n\r\n${body.slice(0, 5)}`, body.slice(5)];
  const openStreams = async () => ({
    readable: new ReadableStream<Uint8Array>({
      pull(controller) {
        const chunk = chunks.shift();
        if (chunk === undefined) controller.error(new Error('TLS peer closed without close_notify'));
        else controller.enqueue(new TextEncoder().encode(chunk));
      },
    }, { highWaterMark: 0 }),
    writable: new WritableStream<Uint8Array>(),
  });
  await expect(requestLastROPartyOverTLS(5, 'add', new FormData(), { openStreams })).resolves.toEqual({ Type: 1 });
});

test.each([
  ['Content-Length: 11\r\n', /ended before the full message/],
  ['', /no body framing/],
])('Native EOF alone cannot validate a party response (%s)', async (header, message) => {
  vi.stubGlobal('__LASTRO_BUILD_TARGET__', 'native');
  const { requestLastROPartyOverTLS } = await import('../src/network/lastro-login-http');
  const openStreams = async () => streams(`HTTP/1.1 200 OK\r\n${header}\r\n{"Type":1}`, () => {});
  await expect(requestLastROPartyOverTLS(5, 'info', new FormData(), { openStreams })).rejects.toThrow(message);
});
