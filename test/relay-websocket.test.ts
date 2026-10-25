import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { makeTLSClient } from '@reclaimprotocol/tls';
import { createRelaySocket } from '../src/network/relay-websocket';

// Exercise the WebSocket handshake and framing independently of TLS internals;
// direct-tls-live.test.ts verifies the real relay over TCP/443.
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

const ascii = (value: string) => new TextEncoder().encode(value);
const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(parts.reduce((total, part) => total + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) { result.set(part, offset); offset += part.byteLength; }
  return result;
}

function serverFrame(opcode: number, payload: ArrayLike<number>, fin = true): Uint8Array {
  const body = Uint8Array.from(payload);
  const first = (fin ? 0x80 : 0) | opcode;
  const head = body.length < 126 ? [first, body.length] : [first, 126, body.length >> 8, body.length & 0xff];
  return concatBytes(Uint8Array.from(head), body);
}

function clientFrame(bytes: Uint8Array) {
  expect(bytes[1]! & 0x80).toBe(0x80);
  let length = bytes[1]! & 0x7f;
  let offset = 2;
  if (length === 126) { length = (bytes[2]! << 8) | bytes[3]!; offset = 4; }
  const mask = bytes.subarray(offset, offset + 4);
  const payload = [...bytes.subarray(offset + 4, offset + 4 + length)].map((byte, index) => byte ^ mask[index & 3]!);
  return { fin: (bytes[0]! & 0x80) !== 0, opcode: bytes[0]! & 0x0f, payload };
}

function upgradeResponse(request: string, accept?: string): Uint8Array {
  const key = /Sec-WebSocket-Key: (\S+)\r\n/.exec(request)![1]!;
  const expected = createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  return ascii(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: upgrade\r\nSec-WebSocket-Accept: ${accept ?? expected}\r\n\r\n`);
}

function harness(url = 'wss://port.lastro.cn/103.8.222.164:26569') {
  const writes: Uint8Array[] = [];
  const constructorArgs: unknown[][] = [];
  const released = { readable: false, writable: false };
  let server!: ReadableStreamDefaultController<Uint8Array>;
  class FakeTcp {
    readonly opened: Promise<{ readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> }>;
    readonly closed = new Promise<void>(() => undefined);
    close = vi.fn(async () => undefined);
    constructor(...args: unknown[]) {
      constructorArgs.push(args);
      const readable = new ReadableStream<Uint8Array>({
        start(controller) { server = controller; },
        cancel() { released.readable = true; },
      });
      const writable = new WritableStream<Uint8Array>({
        write(chunk) { writes.push(chunk.slice()); },
        abort() { released.writable = true; },
      });
      this.opened = Promise.resolve({ readable, writable });
    }
  }
  const socket = createRelaySocket(url, { TCPSocket: FakeTcp, tlsClientFactory: transparentTls, userAgent: 'Mozilla/5.0 Test Chrome' });
  socket.onComplete = vi.fn();
  socket.onMessage = vi.fn();
  socket.onClose = vi.fn();
  const request = async () => {
    await vi.waitFor(() => expect(writes.length).toBeGreaterThan(0));
    return text(writes[0]!);
  };
  const messages = () => vi.mocked(socket.onMessage!).mock.calls.map(call => [...new Uint8Array(call[0])]);
  return { socket, writes, constructorArgs, released, request, messages, send: (bytes: Uint8Array) => server.enqueue(bytes) };
}

describe('official relay WebSocket over Direct TCP + TLS', () => {
  it('upgrades with the official Origin and browser UA over verified TLS, then relays binary messages', async () => {
    const h = harness();
    const request = await h.request();
    expect(h.constructorArgs[0]!.slice(0, 2)).toEqual(['port.lastro.cn', 443]);
    expect(tlsCertificateVerification).toHaveBeenLastCalledWith(true);
    expect(request).toMatch(/^GET \/103\.8\.222\.164:26569 HTTP\/1\.1\r\n/);
    expect(request).toContain('Host: port.lastro.cn\r\n');
    expect(request).toContain('Upgrade: websocket\r\n');
    expect(request).toContain('Sec-WebSocket-Version: 13\r\n');
    expect(request).toContain('Origin: https://game.lastro.cn\r\n');
    expect(request).toContain('User-Agent: Mozilla/5.0 Test Chrome\r\n');
    // The first game bytes may share a TLS record with the upgrade response.
    h.send(concatBytes(upgradeResponse(request), serverFrame(2, [1, 2, 3])));
    await vi.waitFor(() => expect(h.socket.onComplete).toHaveBeenCalledExactlyOnceWith(true));
    await vi.waitFor(() => expect(h.messages()).toEqual([[1, 2, 3]]));
    h.socket.send(new Uint8Array([9, 8, 7]).buffer);
    await vi.waitFor(() => expect(h.writes).toHaveLength(2));
    expect(clientFrame(h.writes[1]!)).toEqual({ fin: true, opcode: 2, payload: [9, 8, 7] });
    h.socket.close();
  });

  it('reassembles split, extended-length and fragmented frames and answers ping', async () => {
    const h = harness();
    h.send(upgradeResponse(await h.request()));
    await vi.waitFor(() => expect(h.socket.connected).toBe(true));
    const large = Array.from({ length: 300 }, (_, index) => index & 0xff);
    const frame = serverFrame(2, large);
    h.send(frame.subarray(0, 3));
    h.send(frame.subarray(3));
    h.send(concatBytes(serverFrame(9, [5]), serverFrame(2, [1], false), serverFrame(0, [2])));
    await vi.waitFor(() => expect(h.messages()).toEqual([large, [1, 2]]));
    await vi.waitFor(() => expect(h.writes.map(clientFrameOrNull).filter(Boolean)).toContainEqual({ fin: true, opcode: 10, payload: [5] }));
    h.socket.close();
  });

  it('fails the open when the relay refuses the upgrade', async () => {
    const h = harness();
    await h.request();
    h.send(ascii('HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n'));
    await vi.waitFor(() => expect(h.socket.onComplete).toHaveBeenCalledExactlyOnceWith(false));
    expect(h.socket.connected).toBe(false);
    await vi.waitFor(() => expect(h.released).toEqual({ readable: true, writable: true }));
  });

  it('rejects a mismatched Sec-WebSocket-Accept', async () => {
    const h = harness();
    h.send(upgradeResponse(await h.request(), 'AAAAAAAAAAAAAAAAAAAAAAAAAAA='));
    await vi.waitFor(() => expect(h.socket.onComplete).toHaveBeenCalledExactlyOnceWith(false));
  });

  it('releases the TCP streams when the game closes the socket', async () => {
    const h = harness();
    h.send(upgradeResponse(await h.request()));
    await vi.waitFor(() => expect(h.socket.connected).toBe(true));
    h.socket.close();
    await vi.waitFor(() => expect(h.released).toEqual({ readable: true, writable: true }));
    expect(h.socket.connected).toBe(false);
  });

  it('only accepts official WSS relay URLs', () => {
    expect(() => createRelaySocket('ws://port.lastro.cn/103.8.222.164:26569')).toThrow('官方 WSS');
    expect(() => createRelaySocket('wss://attacker.invalid/103.8.222.164:26569')).toThrow('官方 WSS');
    expect(() => createRelaySocket('wss://lastro.cn.attacker.invalid/x')).toThrow('官方 WSS');
  });
});

function clientFrameOrNull(bytes: Uint8Array) {
  return text(bytes).startsWith('GET ') ? null : clientFrame(bytes);
}
