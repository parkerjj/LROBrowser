import { connect, type Socket } from 'node:net';
import { describe, expect, it } from 'vitest';
import { createDirectHttpFetch } from '../src/resources/direct-http-resource';
import { prepareLastROLoginSession } from '../src/network/lastro-login-http';

// This is a network integration test, separate from the hermetic CI suite.
// It uses Node's TCP socket ONLY as a transport test double; the TLS handshake
// itself is performed by the actual browser-compatible JavaScript TLS client.
class LiveSocketShim {
  private readonly socket: Socket;
  readonly opened: Promise<{ readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> }>;
  readonly closed: Promise<void>;

  constructor(host: string, port: number) {
    this.socket = connect({ host, port });
    this.closed = new Promise(resolve => this.socket.once('close', () => resolve()));
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    let ended = false;
    const readable = new ReadableStream<Uint8Array>({
      start(c) { controller = c; },
    });
    this.socket.on('data', (chunk) => {
      if (!ended) controller.enqueue(Uint8Array.from(chunk));
    });
    this.socket.on('end', () => {
      if (!ended) { ended = true; controller.close(); }
    });
    this.socket.on('error', (error) => {
      if (!ended) { ended = true; controller.error(error); }
    });
    const writable = new WritableStream<Uint8Array>({
      write: (bytes) => new Promise<void>((resolve, reject) => {
        this.socket.write(bytes, error => error ? reject(error) : resolve());
      }),
    });
    this.opened = new Promise((resolve, reject) => {
      this.socket.once('connect', () => resolve({ readable, writable }));
      this.socket.once('error', reject);
    });
  }

  async close(): Promise<void> {
    this.socket.destroy();
    await this.closed;
  }
}

describe('official HTTPS via raw TCP and JavaScript TLS', () => {
  const live = process.env.LASTRO_TLS_LIVE === '1';
  it.skipIf(!live)('performs a real TLS handshake, SNI and HTTP/1.1 request over port 443', async () => {
    const fetch = createDirectHttpFetch({
      TCPSocket: LiveSocketShim as unknown as NonNullable<Parameters<typeof createDirectHttpFetch>[0]>['TCPSocket'],
      openTimeoutMs: 12_000,
      readTimeoutMs: 12_000,
    });
    const response = await fetch('https://game.lastro.cn/ro/client_re/data/mp3nametable.txt');
    expect(response.status).toBe(200);
    const body = new Uint8Array(await response.arrayBuffer());
    expect(body.byteLength).toBeGreaterThan(4);
    const metadata = createDirectHttpFetch({
      TCPSocket: LiveSocketShim as unknown as NonNullable<Parameters<typeof createDirectHttpFetch>[0]>['TCPSocket'],
      allowOfficialProfileScript: true,
      maxBodyBytes: 4 * 1024 * 1024,
      openTimeoutMs: 12_000,
      readTimeoutMs: 12_000,
    });
    const online = await metadata('https://game.lastro.cn/ro/Online.js');
    expect(online.status).toBe(200);
    expect((await online.text()).length).toBeGreaterThan(1000);
  }, 30_000);

  it.skipIf(!live)('authenticates the official HTTPS certificate before bootstrap', async () => {
    await prepareLastROLoginSession({
      TCPSocket: LiveSocketShim as unknown as NonNullable<Parameters<typeof createDirectHttpFetch>[0]>['TCPSocket'],
      openTimeoutMs: 12_000,
      readTimeoutMs: 12_000,
    });
  }, 30_000);
});
