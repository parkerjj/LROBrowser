import { makeTLSClient, setCryptoImplementation } from '@reclaimprotocol/tls';
import { webcryptoCrypto } from '@reclaimprotocol/tls/webcrypto';

const RESOURCE_ROOTS = new Map([
  ['https://game.lastro.cn', 'game.lastro.cn'],
  ['https://rodata.ltsd.ro', 'rodata.ltsd.ro'],
]);

const REQUEST_HEADERS = [
  ['Accept', '*/*'],
  ['Accept-Encoding', 'identity'],
];

const DEFAULT_OPEN_TIMEOUT_MS = 8_000;
const DEFAULT_READ_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_HEADER_BYTES = 64 * 1024;
const DEFAULT_MAX_BODY_BYTES = 128 * 1024 * 1024;
// game.lastro.cn throttles clients that open many short connections, so
// passive resources share a small pool of keep-alive TLS connections.
const DEFAULT_MAX_CONNECTIONS = 4;
const DEFAULT_IDLE_TIMEOUT_MS = 30_000;

interface DirectHttpOptions {
  TCPSocket?: DirectTcpConstructor;
  nativeFetch?: typeof globalThis.fetch;
  openTimeoutMs?: number;
  readTimeoutMs?: number;
  maxHeaderBytes?: number;
  maxBodyBytes?: number;
  maxConnections?: number;
  idleTimeoutMs?: number;
  /** Restrict the extra executable-text path to the reviewed metadata downloader. */
  allowOfficialProfileScript?: boolean;
  /** Test seam: production always uses the bundled TLS 1.2/1.3 client. */
  tlsClientFactory?: typeof makeTLSClient;
}

interface DirectHttpResponseParts {
  status: number;
  statusText: string;
  headers: Headers;
  body: ArrayBuffer;
}

function abortError(): DOMException {
  return new DOMException('The operation was aborted', 'AbortError');
}

class DirectHttpTimeoutError extends Error {}

function timeoutError(kind: 'open' | 'read'): Error {
  return new DirectHttpTimeoutError(`Direct HTTP ${kind} timeout`);
}

function asUrl(input: RequestInfo | URL): URL {
  if (typeof input === 'string') return new URL(input);
  if (input instanceof URL) return new URL(input.href);
  return new URL(input.url);
}

function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  const inputMethod = typeof input === 'object' && input !== null && 'method' in input
    ? String(input.method)
    : 'GET';
  return (init?.method ?? inputMethod).toUpperCase();
}

function requestSignal(input: RequestInfo | URL, init?: RequestInit): AbortSignal | undefined {
  if (init?.signal) return init.signal;
  if (typeof Request !== 'undefined' && input instanceof Request) return input.signal;
  return undefined;
}

function findBytes(bytes: Uint8Array, pattern: readonly number[], start = 0): number {
  outer: for (let offset = start; offset <= bytes.byteLength - pattern.length; offset += 1) {
    for (let index = 0; index < pattern.length; index += 1) {
      if (bytes[offset + index] !== pattern[index]) continue outer;
    }
    return offset;
  }
  return -1;
}

function ascii(bytes: Uint8Array): string {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return value;
}

function joinBytes(chunks: readonly Uint8Array[], maxBytes: number): Uint8Array {
  const size = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  if (size > maxBytes) throw new Error('Direct HTTP response body is too large');
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/** Returns null while the chunked body is still incomplete; throws when it is invalid. */
function decodeChunkedBody(body: Uint8Array, maxBodyBytes: number): { body: Uint8Array; consumed: number } | null {
  const chunks: Uint8Array[] = [];
  let offset = 0;
  let total = 0;
  while (true) {
    const lineEnd = findBytes(body, [13, 10], offset);
    if (lineEnd < 0) return null;
    const sizeLine = ascii(body.subarray(offset, lineEnd));
    const sizeMatch = /^([0-9a-f]+)(?:;.*)?$/i.exec(sizeLine);
    if (!sizeMatch) throw new Error('Direct HTTP chunk size is invalid');
    const size = Number.parseInt(sizeMatch[1]!, 16);
    if (!Number.isSafeInteger(size)) throw new Error('Direct HTTP chunk size is invalid');
    offset = lineEnd + 2;
    if (size === 0) {
      if (body[offset] === 13 && body[offset + 1] === 10) return { body: joinBytes(chunks, maxBodyBytes), consumed: offset + 2 };
      const trailerEnd = findBytes(body, [13, 10, 13, 10], offset);
      if (trailerEnd < 0) return null;
      return { body: joinBytes(chunks, maxBodyBytes), consumed: trailerEnd + 4 };
    }
    if (size > maxBodyBytes - total) throw new Error('Direct HTTP response body is too large or incomplete');
    if (offset + size + 2 > body.byteLength) return null;
    chunks.push(body.slice(offset, offset + size));
    total += size;
    offset += size;
    if (body[offset] !== 13 || body[offset + 1] !== 10) throw new Error('Direct HTTP chunk terminator is missing');
    offset += 2;
  }
}

function parseChunkedBody(body: Uint8Array, maxBodyBytes: number): Uint8Array {
  const decoded = decodeChunkedBody(body, maxBodyBytes);
  if (!decoded) throw new Error('Direct HTTP response body is too large or incomplete');
  return decoded.body;
}

interface ParsedResponseHead {
  httpVersion: '1.0' | '1.1';
  status: number;
  statusText: string;
  headers: Headers;
  bodyStart: number;
  contentLength?: number;
  transferEncoding?: 'chunked';
}

function parseResponseHead(bytes: Uint8Array, maxHeaderBytes: number): ParsedResponseHead | null {
  const separator = findBytes(bytes, [13, 10, 13, 10]);
  if (separator < 0) {
    if (bytes.byteLength > maxHeaderBytes) throw new Error('Direct HTTP response headers are incomplete or too large');
    return null;
  }
  const headerBytes = separator + 4;
  if (headerBytes > maxHeaderBytes) throw new Error('Direct HTTP response headers are incomplete or too large');
  const lines = ascii(bytes.subarray(0, separator)).split('\r\n');
  const statusLine = lines.shift();
  const statusMatch = statusLine ? /^HTTP\/(1\.[01]) ([1-5][0-9]{2})(?: (.*))?$/.exec(statusLine) : null;
  if (!statusMatch) throw new Error('Direct HTTP response status is invalid');
  const headers = new Headers();
  let contentLength: number | undefined;
  let transferEncoding: 'chunked' | undefined;
  for (const line of lines) {
    const colon = line.indexOf(':');
    if (colon <= 0) throw new Error('Direct HTTP response header is invalid');
    const name = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name)) throw new Error('Direct HTTP response header is invalid');
    headers.append(name, value);
    if (name.toLowerCase() === 'content-length') {
      if (!/^\d+$/.test(value)) throw new Error('Direct HTTP content-length is invalid');
      const parsed = Number(value);
      if (!Number.isSafeInteger(parsed) || (contentLength !== undefined && contentLength !== parsed)) {
        throw new Error('Direct HTTP content-length is conflicting or too large');
      }
      contentLength = parsed;
    }
    if (name.toLowerCase() === 'transfer-encoding') {
      const encodings = value.split(',').map(encoding => encoding.trim().toLowerCase());
      if (transferEncoding !== undefined || encodings.length !== 1 || encodings[0] !== 'chunked') {
        throw new Error('Direct HTTP transfer encoding is unsupported');
      }
      transferEncoding = 'chunked';
    }
    if (name.toLowerCase() === 'content-encoding' && value && value.toLowerCase() !== 'identity') {
      throw new Error('Direct HTTP content encoding is unsupported');
    }
  }
  if (contentLength !== undefined && transferEncoding !== undefined) {
    throw new Error('Direct HTTP response has both content-length and transfer-encoding');
  }
  return {
    httpVersion: statusMatch[1] === '1.0' ? '1.0' : '1.1',
    status: Number(statusMatch[2]),
    statusText: statusMatch[3] ?? '',
    headers,
    bodyStart: headerBytes,
    ...(contentLength === undefined ? {} : { contentLength }),
    ...(transferEncoding === undefined ? {} : { transferEncoding }),
  };
}

function parseResponse(bytes: Uint8Array, maxHeaderBytes: number, maxBodyBytes: number): DirectHttpResponseParts {
  const head = parseResponseHead(bytes, maxHeaderBytes);
  if (!head) throw new Error('Direct HTTP response headers are incomplete or too large');
  const rawBody = bytes.subarray(head.bodyStart);
  let body: Uint8Array;
  if (head.transferEncoding === 'chunked') {
    body = parseChunkedBody(rawBody, maxBodyBytes);
  } else if (head.contentLength !== undefined) {
    if (head.contentLength > maxBodyBytes || rawBody.byteLength !== head.contentLength) {
      throw new Error('Direct HTTP content-length does not match the response body');
    }
    body = rawBody.slice();
  } else {
    body = rawBody.slice();
    if (body.byteLength > maxBodyBytes) throw new Error('Direct HTTP response body is too large');
  }
  return {
    status: head.status,
    statusText: head.statusText,
    headers: head.headers,
    body: body.slice().buffer as ArrayBuffer,
  };
}

const nativeCloseTasks = new WeakMap<DirectTcpConnection, Promise<void>>();

/** Cancelling both sides of a TLS stream must not close one Direct Socket repeatedly. */
function closeNative(native: DirectTcpConnection): Promise<void> {
  const existing = nativeCloseTasks.get(native);
  if (existing) return existing;
  const closing = Promise.resolve().then(() => native.close()).then(
    () => undefined,
    () => undefined, // best effort; error is already surfaced through the fetch path
  );
  nativeCloseTasks.set(native, closing);
  return closing;
}

async function waitFor<T>(promise: Promise<T>, timeoutMs: number, signal: AbortSignal | undefined, phase: 'open' | 'read'): Promise<T> {
  if (signal?.aborted) throw abortError();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abortHandler: (() => void) | undefined;
  try {
    return await new Promise<T>((resolve, reject) => {
      timer = setTimeout(() => reject(timeoutError(phase)), timeoutMs);
      abortHandler = () => reject(abortError());
      signal?.addEventListener('abort', abortHandler, { once: true });
      promise.then(resolve, reject);
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    if (abortHandler) signal?.removeEventListener('abort', abortHandler);
  }
}

async function readResponse(
  native: DirectTcpConnection,
  opened: { readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> },
  request: Uint8Array,
  options: Required<Pick<DirectHttpOptions, 'readTimeoutMs' | 'maxHeaderBytes' | 'maxBodyBytes'>> & { signal?: AbortSignal },
): Promise<DirectHttpResponseParts> {
  const reader = opened.readable.getReader();
  const writer = opened.writable.getWriter();
  const chunks: Uint8Array[] = [];
  const pendingHeader: Uint8Array[] = [];
  let total = 0;
  let head: ParsedResponseHead | null = null;
  try {
    await waitFor(writer.write(request), options.readTimeoutMs, options.signal, 'read');
    while (true) {
      const result = await waitFor(reader.read(), options.readTimeoutMs, options.signal, 'read');
      if (result.done) break;
      if (!result.value?.byteLength) continue;
      total += result.value.byteLength;
      if (total > options.maxHeaderBytes + options.maxBodyBytes) throw new Error('Direct HTTP response is too large');
      const chunk = result.value.slice();
      chunks.push(chunk);
      if (!head) {
        // Header parsing may span several TCP chunks, but its size is bounded.
        // Once found, NEVER rejoin all received body chunks on each read:
        // repeated joins used O(n^2) memory copies for large map files.
        pendingHeader.push(chunk);
        head = parseResponseHead(
          joinBytes(pendingHeader, options.maxHeaderBytes + options.maxBodyBytes),
          options.maxHeaderBytes,
        );
        if (head) pendingHeader.length = 0;
      }
      if (head?.contentLength !== undefined && total - head.bodyStart >= head.contentLength) {
        return parseResponse(
          joinBytes(chunks, options.maxHeaderBytes + options.maxBodyBytes),
          options.maxHeaderBytes,
          options.maxBodyBytes,
        );
      }
    }
    return parseResponse(joinBytes(chunks, options.maxHeaderBytes + options.maxBodyBytes), options.maxHeaderBytes, options.maxBodyBytes);
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
    await writer.abort().catch(() => undefined);
    writer.releaseLock();
    await closeNative(native);
  }
}

/**
 * A Direct Socket is raw TCP, never implicitly HTTPS. TLS is implemented at
 * this boundary only for the approved official host on port 443. Web builds
 * never include this module; they download from the CORS-enabled mirror.
 */
const SILENT_TLS_LOGGER = {
  info() {}, debug() {}, trace() {}, warn() {}, error() {},
};

type OpenedDirectSocket = { readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> };

export async function openEncryptedHttpStreams(
  native: DirectTcpConnection,
  opened: OpenedDirectSocket,
  host: string,
  options: { tlsClientFactory?: typeof makeTLSClient; timeoutMs: number; signal?: AbortSignal; verifyServerCertificate?: boolean },
): Promise<OpenedDirectSocket> {
  const networkReader = opened.readable.getReader();
  const networkWriter = opened.writable.getWriter();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let terminated = false;
  let streamCancelled = false;
  let handshakeFinished = false;
  let resolveHandshake!: () => void;
  let rejectHandshake!: (reason: Error) => void;
  const handshake = new Promise<void>((resolve, reject) => {
    resolveHandshake = resolve;
    rejectHandshake = reject;
  });
  // A closed/cancelled plaintext stream also closes the underlying native
  // socket. readResponse's existing finally block handles all other cleanup.
  const readable = new ReadableStream<Uint8Array>({
    start(value) { controller = value; },
    cancel() {
      streamCancelled = true;
      terminated = true;
      void closeNative(native);
    },
  });
  const fail = (error: Error) => {
    if (terminated || streamCancelled) return;
    terminated = true;
    rejectHandshake(error);
    controller.error(error);
  };
  if (!options.tlsClientFactory) setCryptoImplementation(webcryptoCrypto);
  const client = (options.tlsClientFactory ?? makeTLSClient)({
    host,
    // The connection is restricted to one public passive-resource hostname.
    // This does not authenticate its certificate (see documentation).
    verifyServerCertificate: options.verifyServerCertificate ?? false,
    supportedProtocolVersions: ['TLS1_3', 'TLS1_2'],
    applicationLayerProtocols: ['http/1.1'],
    logger: SILENT_TLS_LOGGER,
    async write({ header, content }) {
      await networkWriter.write(header);
      if (content.byteLength) await networkWriter.write(content);
    },
    onHandshake() {
      handshakeFinished = true;
      resolveHandshake();
    },
    onApplicationData(data) {
      if (!terminated) controller.enqueue(data.slice());
    },
    onTlsEnd(error) {
      if (error) fail(error);
      else if (!handshakeFinished) fail(new Error('TLS connection ended before handshake'));
      else if (!terminated && !streamCancelled) {
        terminated = true;
        controller.close();
      }
    },
  });
  // TLS records can be split or combined arbitrarily across TCP reads;
  // the library owns framing, decryption and key updates.
  void (async () => {
    try {
      while (!terminated) {
        const result = await networkReader.read();
        if (result.done) {
          if (!handshakeFinished) fail(new Error('TLS socket closed before handshake'));
          else if (!terminated && !streamCancelled) { terminated = true; controller.close(); }
          break;
        }
        if (result.value?.byteLength) await client.handleReceivedBytes(result.value);
      }
    } catch (error) {
      fail(error instanceof Error ? error : new Error(String(error)));
    } finally {
      networkReader.releaseLock();
      networkWriter.releaseLock();
    }
  })();
  try {
    await waitFor(client.startHandshake().then(() => handshake), options.timeoutMs, options.signal, 'open');
  } catch (error) {
    await closeNative(native);
    throw error;
  }
  const writable = new WritableStream<Uint8Array>({
    async write(bytes) { await client.write(bytes); },
    abort() { void closeNative(native); },
  });
  return { readable, writable };
}

/** A reused connection that died before returning any byte: the request is safe to replay. */
class StaleConnectionError extends Error {
  constructor(readonly reason: unknown) { super('Direct HTTP pooled connection was closed by the server'); }
}

interface PooledConnection {
  readonly native: DirectTcpConnection;
  readonly reader: ReadableStreamDefaultReader<Uint8Array>;
  readonly writer: WritableStreamDefaultWriter<Uint8Array>;
  served: number;
}

type ExchangeOptions = Required<Pick<DirectHttpOptions, 'readTimeoutMs' | 'maxHeaderBytes' | 'maxBodyBytes'>> & { signal?: AbortSignal };

function endsWithCrlfCrlf(bytes: Uint8Array): boolean {
  const n = bytes.byteLength;
  return n >= 4 && bytes[n - 4] === 13 && bytes[n - 3] === 10 && bytes[n - 2] === 13 && bytes[n - 1] === 10;
}

/**
 * Sends one request and reads exactly one response, leaving the connection
 * usable when the response is self-delimited and the server allows reuse.
 */
async function exchange(
  conn: PooledConnection,
  request: Uint8Array,
  options: ExchangeOptions,
): Promise<{ parts: DirectHttpResponseParts; reusable: boolean }> {
  const { readTimeoutMs, maxHeaderBytes, maxBodyBytes, signal } = options;
  const rawLimit = maxHeaderBytes + maxBodyBytes;
  let received = 0;
  const readChunk = async () => {
    while (true) {
      const result = await waitFor(conn.reader.read(), readTimeoutMs, signal, 'read');
      if (result.done) return null;
      if (result.value?.byteLength) {
        received += result.value.byteLength;
        if (received > rawLimit) throw new Error('Direct HTTP response is too large');
        return result.value.slice();
      }
    }
  };
  try {
    await waitFor(conn.writer.write(request), readTimeoutMs, signal, 'read');
    const headChunks: Uint8Array[] = [];
    let head: ParsedResponseHead | null = null;
    let bodyChunks: Uint8Array[] = [];
    let bodyTotal = 0;
    while (!head) {
      const chunk = await readChunk();
      if (!chunk) throw new Error('Direct HTTP connection closed before response headers');
      headChunks.push(chunk);
      const joined = joinBytes(headChunks, rawLimit);
      head = parseResponseHead(joined, maxHeaderBytes);
      if (head) {
        const rest = joined.subarray(head.bodyStart).slice();
        bodyChunks = [rest];
        bodyTotal = rest.byteLength;
      }
    }
    if (head.status < 200) throw new Error('Direct HTTP interim responses are unsupported');
    const connectionTokens = (head.headers.get('connection') ?? '').toLowerCase().split(',').map(token => token.trim());
    let reusable = head.httpVersion === '1.1' && !connectionTokens.includes('close');
    let body: Uint8Array;
    if (head.status === 204 || head.status === 304) {
      // No body by definition, regardless of any Content-Length header.
      body = new Uint8Array();
      if (bodyTotal) reusable = false;
    } else if (head.contentLength !== undefined) {
      if (head.contentLength > maxBodyBytes) throw new Error('Direct HTTP content-length does not match the response body');
      while (bodyTotal < head.contentLength) {
        const chunk = await readChunk();
        if (!chunk) throw new Error('Direct HTTP content-length does not match the response body');
        bodyChunks.push(chunk);
        bodyTotal += chunk.byteLength;
      }
      const joined = joinBytes(bodyChunks, rawLimit);
      if (joined.byteLength > head.contentLength) reusable = false; // unexpected pipelined bytes
      body = joined.slice(0, head.contentLength);
    } else if (head.transferEncoding === 'chunked') {
      let decoded: { body: Uint8Array; consumed: number } | null = null;
      while (!decoded) {
        // Only a terminating CRLF CRLF can complete the body: skip re-parsing on every read.
        const last = bodyChunks[bodyChunks.length - 1]!;
        if (last.byteLength < 4 || endsWithCrlfCrlf(last)) {
          const joined = joinBytes(bodyChunks, rawLimit);
          bodyChunks = [joined];
          decoded = decodeChunkedBody(joined, maxBodyBytes);
          if (decoded && decoded.consumed < joined.byteLength) reusable = false;
          if (decoded) break;
        }
        const chunk = await readChunk();
        if (!chunk) throw new Error('Direct HTTP response body is too large or incomplete');
        bodyChunks.push(chunk);
      }
      body = decoded.body;
    } else {
      // No framing: the body ends at EOF, so the connection cannot be reused.
      reusable = false;
      while (true) {
        const chunk = await readChunk();
        if (!chunk) break;
        bodyChunks.push(chunk);
      }
      body = joinBytes(bodyChunks, maxBodyBytes);
    }
    return {
      parts: { status: head.status, statusText: head.statusText, headers: head.headers, body: body.slice().buffer as ArrayBuffer },
      reusable,
    };
  } catch (error) {
    const gaveUp = error instanceof DirectHttpTimeoutError || (error instanceof DOMException && error.name === 'AbortError');
    if (conn.served > 0 && received === 0 && !gaveUp) throw new StaleConnectionError(error);
    throw error;
  }
}

/** Fixed-size pool of keep-alive connections; excess callers queue FIFO. */
class ConnectionPool {
  private readonly idle: { conn: PooledConnection; timer: ReturnType<typeof setTimeout> }[] = [];
  private readonly waiters: ((conn: PooledConnection | undefined) => void)[] = [];
  private total = 0; // idle + busy + opening

  constructor(
    private readonly maxSize: number,
    private readonly idleTimeoutMs: number,
    private readonly open: (signal: AbortSignal | undefined) => Promise<PooledConnection>,
  ) {}

  async acquire(signal: AbortSignal | undefined): Promise<PooledConnection> {
    if (signal?.aborted) throw abortError();
    const reused = this.idle.pop();
    if (reused) {
      clearTimeout(reused.timer);
      return reused.conn;
    }
    if (this.total < this.maxSize) return this.openReserved(signal);
    let waiter!: (conn: PooledConnection | undefined) => void;
    let onAbort!: () => void;
    const granted = await new Promise<PooledConnection | undefined>((resolve, reject) => {
      waiter = resolve;
      onAbort = () => {
        const index = this.waiters.indexOf(waiter);
        if (index >= 0) this.waiters.splice(index, 1);
        reject(abortError());
      };
      this.waiters.push(waiter);
      signal?.addEventListener('abort', onAbort, { once: true });
    }).finally(() => signal?.removeEventListener('abort', onAbort));
    // `undefined` hands over a reserved slot rather than a live connection.
    return granted ?? this.openReserved(signal, true);
  }

  release(conn: PooledConnection, reusable: boolean): void {
    if (!reusable) {
      this.discard(conn);
      return;
    }
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter(conn);
      return;
    }
    const timer = setTimeout(() => {
      const index = this.idle.findIndex(entry => entry.conn === conn);
      if (index >= 0) this.idle.splice(index, 1);
      this.discard(conn);
    }, this.idleTimeoutMs);
    (timer as { unref?: () => void }).unref?.();
    this.idle.push({ conn, timer });
  }

  discard(conn: PooledConnection): void {
    void conn.reader.cancel().catch(() => undefined);
    void conn.writer.abort().catch(() => undefined);
    void closeNative(conn.native);
    this.freeSlot();
  }

  private freeSlot(): void {
    this.total -= 1;
    const waiter = this.waiters.shift();
    if (waiter) {
      this.total += 1;
      waiter(undefined);
    }
  }

  private async openReserved(signal: AbortSignal | undefined, alreadyReserved = false): Promise<PooledConnection> {
    if (!alreadyReserved) this.total += 1;
    try {
      return await this.open(signal);
    } catch (error) {
      this.freeSlot();
      throw error;
    }
  }
}

export function createDirectHttpFetch(options: DirectHttpOptions = {}): typeof globalThis.fetch {
  const constructorForSocket = options.TCPSocket ?? globalThis.TCPSocket;
  const nativeFetch = options.nativeFetch ?? globalThis.fetch;
  const openTimeoutMs = Math.max(1, options.openTimeoutMs ?? DEFAULT_OPEN_TIMEOUT_MS);
  const readTimeoutMs = Math.max(1, options.readTimeoutMs ?? DEFAULT_READ_TIMEOUT_MS);
  const maxHeaderBytes = Math.max(1, options.maxHeaderBytes ?? DEFAULT_MAX_HEADER_BYTES);
  const maxBodyBytes = Math.max(1, options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES);
  const maxConnections = Math.max(1, options.maxConnections ?? DEFAULT_MAX_CONNECTIONS);
  const idleTimeoutMs = Math.max(1, options.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS);
  const buildRequest = (pathname: string, host: string, connection?: 'close') => new TextEncoder().encode([
    `GET ${pathname} HTTP/1.1`,
    `Host: ${host}`,
    ...REQUEST_HEADERS.map(([name, value]) => `${name}: ${value}`),
    ...(connection ? [`Connection: ${connection}`] : []),
    '',
    '',
  ].join('\r\n'));
  const openPooled = async (signal: AbortSignal | undefined): Promise<PooledConnection> => {
    const native = new constructorForSocket!('game.lastro.cn', 443, { noDelay: true, keepAliveDelay: 60_000 });
    void native.closed.catch(() => undefined);
    try {
      const connection = await waitFor(native.opened, openTimeoutMs, signal, 'open');
      // Keep TLS bundled in the IWA worker, never load code from a remote URL.
      const encrypted = await openEncryptedHttpStreams(native, connection, 'game.lastro.cn', {
        tlsClientFactory: options.tlsClientFactory,
        timeoutMs: openTimeoutMs,
        verifyServerCertificate: false,
        signal,
      });
      return { native, reader: encrypted.readable.getReader(), writer: encrypted.writable.getWriter(), served: 0 };
    } catch (error) {
      await closeNative(native);
      throw error;
    }
  };
  const pool = new ConnectionPool(maxConnections, idleTimeoutMs, openPooled);
  const fetchPooled = async (pathname: string, signal: AbortSignal | undefined): Promise<DirectHttpResponseParts> => {
    const request = buildRequest(pathname, 'game.lastro.cn');
    // Idle connections the server already closed are replayed on another one.
    for (let attempt = 0; ; attempt += 1) {
      const conn = await pool.acquire(signal);
      try {
        const { parts, reusable } = await exchange(conn, request, { readTimeoutMs, maxHeaderBytes, maxBodyBytes, signal });
        conn.served += 1;
        pool.release(conn, reusable);
        return parts;
      } catch (error) {
        pool.discard(conn);
        if (error instanceof StaleConnectionError) {
          if (attempt < maxConnections) continue;
          throw error.reason;
        }
        throw error;
      }
    }
  };
  return (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = asUrl(input);
    const host = RESOURCE_ROOTS.get(url.origin);
    if (!host) throw new Error('Direct HTTP only permits approved resource origins');
    if (url.username || url.password) throw new Error('Public resource requests cannot include credentials');
    const officialProfileRequest = options.allowOfficialProfileScript === true
      && url.origin === 'https://game.lastro.cn' && url.pathname === '/ro/Online.js';
    if ((!officialProfileRequest && !url.pathname.startsWith('/ro/client_re/')) || url.search || url.hash) {
      throw new Error('Direct HTTP only permits passive resource paths');
    }
    if (requestMethod(input, init) !== 'GET' || init?.body !== undefined) {
      throw new Error('Direct HTTP only supports GET requests');
    }
    const signal = requestSignal(input, init);
    if (url.origin === 'https://rodata.ltsd.ro') {
      if (!nativeFetch) throw new Error('HTTPS fetch is unavailable for the backup resource origin');
      return nativeFetch(url, {
        method: 'GET',
        signal,
        redirect: 'error',
        credentials: 'omit',
      });
    }
    if (!constructorForSocket) throw new Error('Direct TCP is unavailable');
    if (!officialProfileRequest) {
      const parsed = await fetchPooled(url.pathname, signal);
      const body = parsed.status === 204 || parsed.status === 205 || parsed.status === 304 ? null : parsed.body;
      return new Response(body, { status: parsed.status, statusText: parsed.statusText, headers: parsed.headers });
    }
    const native = new constructorForSocket(host, 443, { noDelay: true, keepAliveDelay: 60_000 });
    void native.closed.catch(() => undefined);
    let opened = false;
    try {
      const connection = await waitFor(native.opened, openTimeoutMs, signal, 'open');
      opened = true;
      const request = buildRequest(url.pathname, host, 'close');
      // Keep TLS bundled in the IWA worker, never load code from a remote URL.
      const encrypted = await openEncryptedHttpStreams(native, connection, host, {
        tlsClientFactory: options.tlsClientFactory,
        timeoutMs: openTimeoutMs,
        // Online.js contains server addresses and packet keys: unlike images,
        // metadata must be authenticated before influencing game connections.
        verifyServerCertificate: officialProfileRequest,
        signal,
      });
      const parsed = await readResponse(native, encrypted, request, { readTimeoutMs, maxHeaderBytes, maxBodyBytes, signal });
      const body = parsed.status === 204 || parsed.status === 205 || parsed.status === 304 ? null : parsed.body;
      return new Response(body, { status: parsed.status, statusText: parsed.statusText, headers: parsed.headers });
    } catch (error) {
      if (!opened) await closeNative(native);
      throw error;
    }
  }) as typeof globalThis.fetch;
}
