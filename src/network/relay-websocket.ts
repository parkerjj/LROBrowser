import type { makeTLSClient } from '@reclaimprotocol/tls';
import type { LegacyClientSocket } from './client-socket';
import { DirectTcpSocket } from './direct-tcp-socket';
import { officialWebHeaders, openEncryptedHttpStreams } from '../resources/direct-http-resource';

// 官方 WSS 中转只放行 Origin 为官网、UA 为浏览器的握手；IWA 里原生 WebSocket 的 Origin
// 固定是 isolated-app://，因此在 Direct TCP + 校验证书的 TLS 上自行完成 WebSocket 握手与分帧。
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const DEFAULT_OPEN_TIMEOUT_MS = 8_000;
const MAX_HANDSHAKE_BYTES = 16 * 1024;
const MAX_MESSAGE_BYTES = 16 * 1024 * 1024;
const OPCODE_CONTINUATION = 0x0;
const OPCODE_BINARY = 0x2;
const OPCODE_CLOSE = 0x8;
const OPCODE_PING = 0x9;
const OPCODE_PONG = 0xa;

export interface RelaySocketOptions {
  TCPSocket?: DirectTcpConstructor;
  userAgent?: string;
  openTimeoutMs?: number;
  /** Test seam; production uses the bundled browser WebCrypto TLS client. */
  tlsClientFactory?: typeof makeTLSClient;
}

type Streams = { readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> };
type Reader = ReadableStreamDefaultReader<Uint8Array>;
type Writer = WritableStreamDefaultWriter<Uint8Array>;

function parseRelayUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== 'wss:' || !(url.hostname === 'lastro.cn' || url.hostname.endsWith('.lastro.cn'))
    || url.username || url.password || url.search || url.hash) {
    throw new Error('中转连接必须使用官方 WSS');
  }
  return url;
}

function concat(left: Uint8Array, right: Uint8Array): Uint8Array {
  if (!left.byteLength) return right;
  const bytes = new Uint8Array(left.byteLength + right.byteLength);
  bytes.set(left);
  bytes.set(right, left.byteLength);
  return bytes;
}

function base64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function waitFor<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}

/** Client frames are always masked (RFC 6455 5.3). */
export function encodeFrame(opcode: number, payload: Uint8Array): Uint8Array {
  const length = payload.byteLength;
  const extended = length < 126 ? 0 : length <= 0xffff ? 2 : 8;
  const frame = new Uint8Array(2 + extended + 4 + length);
  const view = new DataView(frame.buffer);
  frame[0] = 0x80 | opcode;
  frame[1] = 0x80 | (extended === 0 ? length : extended === 2 ? 126 : 127);
  if (extended === 2) view.setUint16(2, length);
  else if (extended === 8) view.setBigUint64(2, BigInt(length));
  const maskOffset = 2 + extended;
  const mask = crypto.getRandomValues(frame.subarray(maskOffset, maskOffset + 4));
  for (let index = 0; index < length; index += 1) frame[maskOffset + 4 + index] = payload[index]! ^ mask[index & 3]!;
  return frame;
}

function decodeFrame(buffer: Uint8Array): { fin: boolean; opcode: number; payload: Uint8Array; size: number } | null {
  if (buffer.byteLength < 2) return null;
  if (buffer[0]! & 0x70) throw new Error('中转帧使用了未协商的扩展位');
  if (buffer[1]! & 0x80) throw new Error('中转发送了带掩码的帧');
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let length = buffer[1]! & 0x7f;
  let offset = 2;
  if (length === 126) {
    if (buffer.byteLength < 4) return null;
    length = view.getUint16(2);
    offset = 4;
  } else if (length === 127) {
    if (buffer.byteLength < 10) return null;
    const size = view.getBigUint64(2);
    if (size > BigInt(MAX_MESSAGE_BYTES)) throw new Error('中转帧过大');
    length = Number(size);
    offset = 10;
  }
  if (length > MAX_MESSAGE_BYTES) throw new Error('中转帧过大');
  if (buffer.byteLength < offset + length) return null;
  return { fin: (buffer[0]! & 0x80) !== 0, opcode: buffer[0]! & 0x0f, payload: buffer.subarray(offset, offset + length), size: offset + length };
}

async function upgrade(reader: Reader, writer: Writer, url: URL, userAgent: string | undefined): Promise<Uint8Array> {
  const key = base64(crypto.getRandomValues(new Uint8Array(16)));
  await writer.write(new TextEncoder().encode([
    `GET ${url.pathname} HTTP/1.1`,
    `Host: ${url.host}`,
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Key: ${key}`,
    'Sec-WebSocket-Version: 13',
    ...officialWebHeaders(userAgent),
    '',
    '',
  ].join('\r\n')));
  let buffered: Uint8Array = new Uint8Array(0);
  let end: number;
  while ((end = new TextDecoder('latin1').decode(buffered).indexOf('\r\n\r\n')) < 0) {
    if (buffered.byteLength > MAX_HANDSHAKE_BYTES) throw new Error('中转握手响应过大');
    const result = await reader.read();
    if (result.done) throw new Error('中转在握手完成前关闭');
    buffered = concat(buffered, result.value);
  }
  const [statusLine = '', ...lines] = new TextDecoder('latin1').decode(buffered.subarray(0, end)).split('\r\n');
  if (!/^HTTP\/1\.1 101\b/.test(statusLine)) throw new Error(`中转拒绝握手：${statusLine.slice(0, 80)}`);
  const accept = lines.find(line => /^sec-websocket-accept\s*:/i.test(line))?.replace(/^[^:]*:/, '').trim();
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(key + WS_GUID));
  if (accept !== base64(new Uint8Array(digest))) throw new Error('中转握手校验失败');
  return buffered.slice(end + 4);
}

/** Expose binary message payloads as a byte stream, like a raw TCP socket. */
function messageStreams(reader: Reader, writer: Writer, initial: Uint8Array, shutdown: () => void): Streams {
  let buffered = initial;
  let fragments: Uint8Array[] = [];
  let fragmented = false;
  let finished = false;
  const finish = () => {
    finished = true;
    shutdown();
  };
  const readable = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (!finished) {
          const frame = decodeFrame(buffered);
          if (!frame) {
            const result = await reader.read();
            if (finished) return;
            if (result.done) { finish(); controller.close(); return; }
            buffered = concat(buffered, result.value);
            continue;
          }
          buffered = buffered.subarray(frame.size);
          if (frame.opcode === OPCODE_PING) {
            void writer.write(encodeFrame(OPCODE_PONG, frame.payload)).catch(() => undefined);
            continue;
          }
          if (frame.opcode === OPCODE_PONG) continue;
          if (frame.opcode === OPCODE_CLOSE) { finish(); controller.close(); return; }
          if (frame.opcode !== OPCODE_BINARY && frame.opcode !== OPCODE_CONTINUATION) {
            throw new Error(`中转发送了不支持的帧类型 ${frame.opcode}`);
          }
          if ((frame.opcode === OPCODE_CONTINUATION) !== fragmented) throw new Error('中转帧分片顺序无效');
          if (!frame.fin) {
            fragments.push(frame.payload);
            fragmented = true;
            if (fragments.reduce((total, part) => total + part.byteLength, 0) > MAX_MESSAGE_BYTES) throw new Error('中转消息过大');
            continue;
          }
          const message = fragmented ? [...fragments, frame.payload].reduce(concat, new Uint8Array(0)) : frame.payload;
          fragments = [];
          fragmented = false;
          if (message.byteLength) { controller.enqueue(message); return; }
        }
      } catch (error) {
        if (finished) return;
        finish();
        controller.error(error);
      }
    },
    cancel: finish,
  });
  const writable = new WritableStream<Uint8Array>({
    async write(chunk) {
      if (!finished) await writer.write(encodeFrame(OPCODE_BINARY, chunk));
    },
    close: finish,
    abort: finish,
  });
  return { readable, writable };
}

/** A DirectTcpConnection whose byte streams carry WebSocket binary messages over the official relay. */
class RelayWebSocketConnection implements DirectTcpConnection {
  readonly opened: Promise<Streams>;
  readonly closed: Promise<void>;
  private readonly native: DirectTcpConnection;
  private shutdown?: () => void;

  constructor(url: URL, options: RelaySocketOptions) {
    const constructorForSocket = options.TCPSocket ?? globalThis.TCPSocket;
    if (!constructorForSocket) throw new Error('Direct TCP 不受当前环境支持');
    this.native = new constructorForSocket(url.hostname, Number(url.port || 443), { noDelay: true, keepAliveDelay: 60_000 });
    this.closed = this.native.closed;
    this.opened = this.open(url, options);
  }

  async close(): Promise<void> {
    this.shutdown?.();
    await this.native.close().catch(() => undefined);
  }

  private async open(url: URL, options: RelaySocketOptions): Promise<Streams> {
    const timeoutMs = Math.max(1, options.openTimeoutMs ?? DEFAULT_OPEN_TIMEOUT_MS);
    const connection = await this.native.opened;
    // Login packets carry the account password: always authenticate the relay certificate.
    const tls = await openEncryptedHttpStreams(this.native, connection, url.hostname, {
      timeoutMs,
      tlsClientFactory: options.tlsClientFactory,
      verifyServerCertificate: true,
    });
    const reader = tls.readable.getReader();
    const writer = tls.writable.getWriter();
    let released = false;
    const shutdown = () => {
      if (released) return;
      released = true;
      void reader.cancel().catch(() => undefined);
      void writer.abort().catch(() => undefined);
    };
    this.shutdown = shutdown;
    try {
      const initial = await waitFor(upgrade(reader, writer, url, options.userAgent), timeoutMs, '中转握手超时');
      return messageStreams(reader, writer, initial, shutdown);
    } catch (error) {
      shutdown();
      throw error;
    }
  }
}

export function createRelaySocket(url: string, options: RelaySocketOptions = {}): LegacyClientSocket {
  const endpoint = parseRelayUrl(url);
  const Connection = RelayWebSocketConnection.bind(null, endpoint, options);
  return new DirectTcpSocket(endpoint.hostname, Number(endpoint.port || 443), { TCPSocket: Connection });
}
