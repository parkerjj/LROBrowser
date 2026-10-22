import { describe, expect, it, vi } from 'vitest';
import { createDirectHttpFetch } from '../src/resources/direct-http-resource';
import type { makeTLSClient } from '@reclaimprotocol/tls';

// Exercise HTTP framing independently of TLS internals. A separate networked
// integration test verifies the real bundled TLS handshake over TCP/443.
const tlsCertificateVerification = vi.fn();
const transparentTls = ((opts: Parameters<typeof makeTLSClient>[0]) => {
  tlsCertificateVerification(opts.verifyServerCertificate);
  return ({
  async startHandshake() { opts.onHandshake?.(); },
  async handleReceivedBytes(data: Uint8Array) { opts.onApplicationData?.(data); },
  async write(data: Uint8Array) {
    await opts.write({ header: data, content: new Uint8Array() }, { type: 'plaintext' });
  },
  });
}) as typeof makeTLSClient;


function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((total, part) => total + part.byteLength, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.byteLength;
  }
  return result;
}

function ascii(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function responseBytes(statusLine: string, headers: string[], body: Uint8Array): Uint8Array {
  return concatBytes(ascii(`${statusLine}\r\n${headers.join('\r\n')}\r\n\r\n`), body);
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(yes => { resolve = yes; });
  return { promise, resolve };
}

interface HarnessOptions {
  response?: Uint8Array[];
  holdResponse?: boolean;
  closeResponse?: boolean;
  openTimeoutMs?: number;
  readTimeoutMs?: number;
  nativeFetch?: typeof globalThis.fetch;
  allowOfficialProfileScript?: boolean;
}

function harness(options: HarnessOptions = {}) {
  const opened = deferred<{ readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> }>();
  const closed = deferred<void>();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const requests: Uint8Array[] = [];
  const constructorArgs: unknown[][] = [];
  const readable = new ReadableStream<Uint8Array>({ start(value) { controller = value; } });
  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      requests.push(chunk.slice());
      if (!options.holdResponse) {
        for (const responseChunk of options.response ?? []) controller.enqueue(responseChunk);
        if (options.closeResponse !== false) controller.close();
      }
    },
  });
  const close = vi.fn(async () => closed.resolve());
  class Native {
    opened = opened.promise;
    closed = closed.promise;
    constructor(...args: unknown[]) { constructorArgs.push(args); }
    close = close;
  }
  const fetch = createDirectHttpFetch({
    TCPSocket: Native,
    tlsClientFactory: transparentTls,
    ...(options.openTimeoutMs === undefined ? {} : { openTimeoutMs: options.openTimeoutMs }),
    ...(options.readTimeoutMs === undefined ? {} : { readTimeoutMs: options.readTimeoutMs }),
    ...(options.nativeFetch === undefined ? {} : { nativeFetch: options.nativeFetch }),
    ...(options.allowOfficialProfileScript === undefined ? {} : { allowOfficialProfileScript: options.allowOfficialProfileScript }),
  });
  return { fetch, requests, constructorArgs, close, controller, opened, readable, writable };
}

describe('Direct HTTP resource transport', () => {
  it('sends an allowlisted HTTPS request over TLS on port 443 and parses split binary responses', async () => {
    const body = new Uint8Array([0, 255, 1, 2]);
    const response = responseBytes('HTTP/1.1 200 OK', [
      'Content-Type: application/octet-stream',
      'Content-Length: 4',
      'ETag: "fixture"',
    ], body);
    const split = [response.slice(0, 17), response.slice(17, 63), response.slice(63)];
    const h = harness({ response: split });
    h.opened.resolve({ readable: h.readable, writable: h.writable });

    const result = await h.fetch('https://game.lastro.cn/ro/client_re/data/test.gat', {
      credentials: 'include', headers: { Authorization: 'fixture-secret', Cookie: 'fixture-secret' },
    });

    expect(result.status).toBe(200);
    expect(result.headers.get('etag')).toBe('"fixture"');
    expect(new Uint8Array(await result.arrayBuffer())).toEqual(body);
    expect(h.constructorArgs).toEqual([['game.lastro.cn', 443, { noDelay: true, keepAliveDelay: 60_000 }]]);
    expect(tlsCertificateVerification).toHaveBeenLastCalledWith(false);
    const request = new TextDecoder().decode(h.requests[0]);
    expect(request).toContain('GET /ro/client_re/data/test.gat HTTP/1.1\r\n');
    expect(request).toContain('Host: game.lastro.cn\r\n');
    expect(request).toContain('Accept-Encoding: identity\r\n');
    expect(request).not.toContain('Connection:');
    expect(request).not.toContain('Authorization:');
    expect(request).not.toContain('Cookie:');
    expect(request).not.toContain('fixture-secret');
  });

  it('returns a content-length response without waiting for TCP EOF', async () => {
    const body = new Uint8Array([0, 255, 1, 2]);
    const response = responseBytes('HTTP/1.1 200 OK', [
      'Content-Type: font/otf',
      'Content-Length: 4',
    ], body);
    const h = harness({ response: [response], closeResponse: false, readTimeoutMs: 50 });
    h.opened.resolve({ readable: h.readable, writable: h.writable });

    const result = await h.fetch('https://game.lastro.cn/ro/client_re/System/Font/Source%20Han%20Sans%20CN4.otf');

    expect(result.status).toBe(200);
    expect(new Uint8Array(await result.arrayBuffer())).toEqual(body);
    // The keep-alive connection stays pooled for the next request.
    expect(h.close).not.toHaveBeenCalled();
  });

  it('uses Chrome fetch for the HTTPS backup source instead of opening plaintext TCP', async () => {
    const body = new Uint8Array([9, 8, 7]).buffer;
    const nativeFetch = vi.fn<typeof globalThis.fetch>(async (...args) => {
      void args;
      return new Response(body, {
        status: 200,
        headers: { 'content-type': 'application/octet-stream' },
      });
    });
    const h = harness({ nativeFetch });

    const result = await h.fetch('https://rodata.ltsd.ro/ro/client_re/data/fallback.gat', {
      credentials: 'include', headers: { Authorization: 'fixture-secret', Cookie: 'fixture-secret' },
    });

    expect(result.status).toBe(200);
    expect(new Uint8Array(await result.arrayBuffer())).toEqual(new Uint8Array(body));
    expect(nativeFetch).toHaveBeenCalledOnce();
    expect(String(nativeFetch.mock.calls[0]?.[0])).toBe('https://rodata.ltsd.ro/ro/client_re/data/fallback.gat');
    expect(nativeFetch.mock.calls[0]?.[1]).toMatchObject({ method: 'GET', credentials: 'omit', redirect: 'error' });
    expect(nativeFetch.mock.calls[0]?.[1]).not.toHaveProperty('headers');
    expect(h.constructorArgs).toEqual([]);
  });

  it('decodes chunked binary bodies and preserves non-success statuses', async () => {
    const response = responseBytes('HTTP/1.1 404 Not Found', [
      'Content-Type: application/octet-stream',
      'Transfer-Encoding: chunked',
    ], concatBytes(
      ascii('3\r\n'), new Uint8Array([0, 255, 1]), ascii('\r\n'),
      ascii('1\r\n'), new Uint8Array([2]), ascii('\r\n'),
      ascii('0\r\nX-Fixture: yes\r\n\r\n'),
    ));
    const h = harness({ response: [response] });
    h.opened.resolve({ readable: h.readable, writable: h.writable });

    const result = await h.fetch('https://game.lastro.cn/ro/client_re/data/missing.gat');

    expect(result.status).toBe(404);
    expect(result.ok).toBe(false);
    expect(new Uint8Array(await result.arrayBuffer())).toEqual(new Uint8Array([0, 255, 1, 2]));
  });

  it('rejects conflicting content lengths instead of guessing a body boundary', async () => {
    const response = responseBytes('HTTP/1.1 200 OK', [
      'Content-Length: 2',
      'Content-Length: 3',
    ], new Uint8Array([1, 2, 3]));
    const h = harness({ response: [response] });
    h.opened.resolve({ readable: h.readable, writable: h.writable });

    await expect(h.fetch('https://game.lastro.cn/ro/client_re/data/bad.gat')).rejects.toThrow(/content-length/i);
  });

  it('rejects a response that combines content-length with chunked framing', async () => {
    const response = responseBytes('HTTP/1.1 200 OK', [
      'Content-Length: 4',
      'Transfer-Encoding: chunked',
    ], concatBytes(ascii('4\r\n'), new Uint8Array([1, 2, 3, 4]), ascii('\r\n0\r\n\r\n')));
    const h = harness({ response: [response] });
    h.opened.resolve({ readable: h.readable, writable: h.writable });

    await expect(h.fetch('https://game.lastro.cn/ro/client_re/data/bad.gat')).rejects.toThrow(/both.*content-length.*transfer-encoding/i);
    expect(h.close).toHaveBeenCalledOnce();
  });

  it('rejects transfer codings that the bounded parser cannot decode', async () => {
    const response = responseBytes('HTTP/1.1 200 OK', [
      'Transfer-Encoding: gzip, chunked',
    ], new Uint8Array());
    const h = harness({ response: [response] });
    h.opened.resolve({ readable: h.readable, writable: h.writable });

    await expect(h.fetch('https://game.lastro.cn/ro/client_re/data/bad.gat')).rejects.toThrow(/transfer encoding/i);
  });

  it('closes the native TLS socket when opening exceeds the timeout', async () => {
    const h = harness({ openTimeoutMs: 1 });

    await expect(h.fetch('https://game.lastro.cn/ro/client_re/data/slow.gat')).rejects.toThrow(/open timeout/i);
    expect(h.close).toHaveBeenCalledOnce();
  });

  it('closes the native socket when the caller aborts an in-flight request', async () => {
    const h = harness({ holdResponse: true });
    h.opened.resolve({ readable: h.readable, writable: h.writable });
    const signal = new AbortController();
    const pending = h.fetch('https://game.lastro.cn/ro/client_re/data/slow.gat', { signal: signal.signal });
    await vi.waitFor(() => expect(h.requests).toHaveLength(1));
    signal.abort();

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(h.close).toHaveBeenCalledOnce();
  });

  it('rejects unapproved origins before opening a socket', async () => {
    const h = harness({ response: [] });

    await expect(h.fetch('https://example.invalid/ro/client_re/data/test.gat')).rejects.toThrow(/approved resource origin/i);
    expect(h.constructorArgs).toEqual([]);
  });


  it('allows only the reviewed official script through the metadata-only downloader', async () => {
    const body = ascii('case 3:F=[{address:"103.8.222.164",port:28569,version:45,langtype:3}]');
    const response = responseBytes('HTTP/1.1 200 OK', [
      'Content-Type: text/javascript',
      'Content-Length: ' + body.length,
    ], body);
    const blocked = harness({ response: [response] });
    await expect(blocked.fetch('https://game.lastro.cn/ro/Online.js')).rejects.toThrow('passive resource paths');
    expect(blocked.constructorArgs).toHaveLength(0);

    const allowed = harness({ response: [response], allowOfficialProfileScript: true });
    allowed.opened.resolve({ readable: allowed.readable, writable: allowed.writable });
    const text = await (await allowed.fetch('https://game.lastro.cn/ro/Online.js')).text();
    expect(text).toContain('103.8.222.164');
    expect(new TextDecoder().decode(allowed.requests[0])).toContain('GET /ro/Online.js HTTP/1.1\r\n');
    expect(new TextDecoder().decode(allowed.requests[0])).toContain('Connection: close\r\n');
    expect(allowed.constructorArgs).toEqual([['game.lastro.cn', 443, { noDelay: true, keepAliveDelay: 60_000 }]]);
    expect(tlsCertificateVerification).toHaveBeenLastCalledWith(true);
    await expect(allowed.fetch('https://game.lastro.cn/ro/not-allowed.js')).rejects.toThrow('passive resource paths');
  });

  it('rejects URL credentials and non-GET resource requests before opening a socket', async () => {
    const h = harness({ response: [] });
    await expect(h.fetch('https://user:password@game.lastro.cn/ro/client_re/data/test.gat')).rejects.toThrow('credentials');
    await expect(h.fetch('https://game.lastro.cn/ro/client_re/data/test.gat', { method: 'POST', body: 'fixture' })).rejects.toThrow('GET');
    expect(h.constructorArgs).toEqual([]);
  });
});


// A fake server per TCP connection, so reuse and reconnects are observable.
function poolHarness(
  respond: (conn: number, nth: number, request: string) => Uint8Array[] | 'close',
  extra: Partial<Parameters<typeof createDirectHttpFetch>[0]> = {},
) {
  const natives: { close: ReturnType<typeof vi.fn>; closeStream: () => void }[] = [];
  const requests: { conn: number; text: string }[] = [];
  class Native {
    opened: Promise<{ readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> }>;
    closed = new Promise<void>(() => {});
    close = vi.fn(async () => {});
    constructor() {
      const conn = natives.length;
      let controller!: ReadableStreamDefaultController<Uint8Array>;
      let nth = 0;
      const readable = new ReadableStream<Uint8Array>({ start(value) { controller = value; } });
      const writable = new WritableStream<Uint8Array>({
        write(chunk) {
          const text = new TextDecoder().decode(chunk);
          requests.push({ conn, text });
          const reply = respond(conn, nth++, text);
          if (reply === 'close') controller.close();
          else for (const part of reply) controller.enqueue(part);
        },
      });
      natives.push({ close: this.close, closeStream: () => controller.close() });
      this.opened = Promise.resolve({ readable, writable });
    }
  }
  const fetch = createDirectHttpFetch({ TCPSocket: Native, tlsClientFactory: transparentTls, ...extra });
  return { fetch, natives, requests };
}

function okResponse(body: string, extraHeaders: string[] = []): Uint8Array {
  const bytes = ascii(body);
  return responseBytes('HTTP/1.1 200 OK', ['Content-Type: application/octet-stream', `Content-Length: ${bytes.length}`, ...extraHeaders], bytes);
}

describe('Direct HTTP keep-alive connection pool', () => {
  const url = (name: string) => `https://game.lastro.cn/ro/client_re/data/${name}`;

  it('serves sequential requests over one TLS connection', async () => {
    const h = poolHarness((_conn, nth) => [okResponse(`body-${nth}`)]);

    expect(await (await h.fetch(url('a.spr'))).text()).toBe('body-0');
    expect(await (await h.fetch(url('b.spr'))).text()).toBe('body-1');
    expect(await (await h.fetch(url('c.spr'))).text()).toBe('body-2');

    expect(h.natives).toHaveLength(1);
    expect(h.requests.map(request => request.conn)).toEqual([0, 0, 0]);
    expect(h.requests[1]!.text).toContain('GET /ro/client_re/data/b.spr HTTP/1.1\r\n');
    expect(h.requests[1]!.text).not.toContain('Connection:');
    expect(h.natives[0]!.close).not.toHaveBeenCalled();
  });

  it('never opens more than the configured number of connections and queues the rest', async () => {
    const h = poolHarness((_conn, _nth, request) => [okResponse(request.split(' ')[1]!)], { maxConnections: 4 });

    const results = await Promise.all(Array.from({ length: 10 }, (_, i) => h.fetch(url(`f${i}.spr`)).then(r => r.text())));

    expect(results).toEqual(Array.from({ length: 10 }, (_, i) => `/ro/client_re/data/f${i}.spr`));
    expect(h.natives).toHaveLength(4);
    expect(h.requests).toHaveLength(10);
  });

  it('keeps chunked, split responses framed so the next response is not corrupted', async () => {
    const chunked = responseBytes('HTTP/1.1 200 OK', ['Transfer-Encoding: chunked'], concatBytes(
      ascii('3\r\nabc\r\n'), ascii('2\r\nde\r\n'), ascii('0\r\n\r\n'),
    ));
    const h = poolHarness((_conn, nth) => nth === 0
      ? [chunked.slice(0, 40), chunked.slice(40, chunked.length - 3), chunked.slice(chunked.length - 3)]
      : [okResponse('second')]);

    expect(await (await h.fetch(url('a.txt'))).text()).toBe('abcde');
    expect(await (await h.fetch(url('b.txt'))).text()).toBe('second');
    expect(h.natives).toHaveLength(1);
  });

  it('opens a new connection after the server says Connection: close', async () => {
    const h = poolHarness((_conn, nth) => [okResponse(`r${nth}`, nth === 0 ? ['Connection: close'] : [])]);

    expect(await (await h.fetch(url('a.spr'))).text()).toBe('r0');
    expect(h.natives[0]!.close).toHaveBeenCalledOnce();
    expect(await (await h.fetch(url('b.spr'))).text()).toBe('r0');
    expect(h.natives).toHaveLength(2);
  });

  it('replays a request when a reused idle connection was already closed by the server', async () => {
    const h = poolHarness((conn, nth) => {
      if (conn === 0 && nth === 1) return 'close'; // keep-alive timeout fired while idle
      return [okResponse(`c${conn}-${nth}`)];
    });

    expect(await (await h.fetch(url('a.spr'))).text()).toBe('c0-0');
    expect(await (await h.fetch(url('b.spr'))).text()).toBe('c1-0');
    expect(h.natives).toHaveLength(2);
    expect(h.natives[0]!.close).toHaveBeenCalled();
  });

  it('does not replay a request on a fresh connection that fails', async () => {
    const h = poolHarness(() => 'close');

    await expect(h.fetch(url('a.spr'))).rejects.toThrow(/closed before response headers/);
    expect(h.requests).toHaveLength(1);
  });

  it('drops a connection whose request was aborted and frees its slot', async () => {
    const h = poolHarness((conn) => conn === 0 ? [] : [okResponse('after')], { maxConnections: 1, readTimeoutMs: 1_000 });
    const abort = new AbortController();
    const pending = h.fetch(url('slow.spr'), { signal: abort.signal });
    await vi.waitFor(() => expect(h.requests).toHaveLength(1));
    abort.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });

    expect(await (await h.fetch(url('next.spr'))).text()).toBe('after');
    expect(h.natives).toHaveLength(2);
    expect(h.natives[0]!.close).toHaveBeenCalled();
  });

  it('lets an aborted queued request leave without taking a connection', async () => {
    const h = poolHarness((conn) => conn === 0 ? [] : [okResponse('ok')], { maxConnections: 1, readTimeoutMs: 50 });
    const first = h.fetch(url('hang.spr'));
    const abort = new AbortController();
    const queued = h.fetch(url('queued.spr'), { signal: abort.signal });
    abort.abort();

    await expect(queued).rejects.toMatchObject({ name: 'AbortError' });
    await expect(first).rejects.toThrow(/read timeout/);
    expect(h.requests).toHaveLength(1);
    expect(await (await h.fetch(url('later.spr'))).text()).toBe('ok');
  });

  it('closes connections that stay idle past the idle timeout', async () => {
    const h = poolHarness(() => [okResponse('x')], { idleTimeoutMs: 20 });
    await (await h.fetch(url('a.spr'))).arrayBuffer();

    await vi.waitFor(() => expect(h.natives[0]!.close).toHaveBeenCalled());
    await (await h.fetch(url('b.spr'))).arrayBuffer();
    expect(h.natives).toHaveLength(2);
  });

  it('does not treat a body-less 304 as a reason to drop the connection', async () => {
    const h = poolHarness((_conn, nth) => nth === 0
      ? [ascii('HTTP/1.1 304 Not Modified\r\nETag: "x"\r\n\r\n')]
      : [okResponse('next')]);

    expect((await h.fetch(url('a.spr'))).status).toBe(304);
    expect(await (await h.fetch(url('b.spr'))).text()).toBe('next');
    expect(h.natives).toHaveLength(1);
  });
});
