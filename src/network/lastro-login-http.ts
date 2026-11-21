import type { makeTLSClient } from '@reclaimprotocol/tls';
import { decodeChunkedBody, openEncryptedHttpStreams } from '../resources/direct-http-resource';
import { IS_NATIVE_BUILD } from '../runtime/build-target';

const LASTRO_LOGIN_HOST = 'game.lastro.cn';
const LASTRO_LOGIN_PORT = 443;
const LASTRO_LOGIN_BOOTSTRAP_PATH = '/?r=pc/index';
const DEFAULT_OPEN_TIMEOUT_MS = 8_000;
const DEFAULT_READ_TIMEOUT_MS = 8_000;
const MAX_RESPONSE_BYTES = 512 * 1024;

export type LastROLoginPhase = 'check' | 'checkin';

export interface LastROLoginRequest {
  host: string;
  port: number;
  path: string;
  body: string;
  bytes: Uint8Array;
}

export interface LastROLoginHttpOptions {
  TCPSocket?: DirectTcpConstructor;
  openStreams?: OpenLoginStreams;
  openTimeoutMs?: number;
  readTimeoutMs?: number;
  /** Test seam; production uses the bundled browser WebCrypto TLS client. */
  tlsClientFactory?: typeof makeTLSClient;
}

type OpenedLoginStreams = Awaited<ReturnType<typeof openEncryptedHttpStreams>>;
type OpenLoginStreams = (host: string, port: number, options: {
  timeoutMs: number;
  signal: AbortSignal;
}) => Promise<OpenedLoginStreams>;

interface LastROLoginSession {
  cookie: string;
  csrfToken: string;
}

interface RawHttpResponse {
  status: number;
  headers: Map<string, string[]>;
  body: Uint8Array;
}

const LOGIN_FIELDS: Readonly<Record<number, string>> = Object.freeze({
  3: 'Login_cn2',
  4: 'Login_ts',
  5: 'Login_debug',
});

const sessionCache = new WeakMap<DirectTcpConstructor, Promise<LastROLoginSession>>();

function waitFor<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(value => {
      clearTimeout(timer);
      resolve(value);
    }, error => {
      clearTimeout(timer);
      reject(error);
    });
  });
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
  if (size > maxBytes) throw new Error('LastRO login HTTP response is too large');
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

function parseResponse(bytes: Uint8Array, eof: boolean, requireFraming: boolean): RawHttpResponse | null {
  const separator = findBytes(bytes, [13, 10, 13, 10]);
  if (separator < 0) return null;
  const lines = ascii(bytes.subarray(0, separator)).split('\r\n');
  const statusLine = lines.shift();
  const statusMatch = statusLine ? /^HTTP\/1\.[01] ([1-5][0-9]{2})(?: (.*))?$/.exec(statusLine) : null;
  if (!statusMatch) throw new Error('LastRO login HTTP response status is invalid');
  const headers = new Map<string, string[]>();
  for (const line of lines) {
    const colon = line.indexOf(':');
    if (colon <= 0) throw new Error('LastRO login HTTP response header is invalid');
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    const values = headers.get(name) ?? [];
    values.push(value);
    headers.set(name, values);
  }
  const rawBody = bytes.subarray(separator + 4);
  const transferEncoding = headers.get('transfer-encoding')?.join(',').toLowerCase();
  const contentEncoding = headers.get('content-encoding')?.join(',').toLowerCase();
  const contentLengths = headers.get('content-length');
  if (contentEncoding && contentEncoding !== 'identity') {
    throw new Error(`LastRO login HTTP content encoding is unsupported: ${contentEncoding}`);
  }
  const status = Number(statusMatch[1]);
  if (status === 204 || status === 304) return { status, headers, body: new Uint8Array() };
  if (transferEncoding) {
    if (transferEncoding !== 'chunked' || contentLengths) throw new Error('LastRO login HTTP transfer encoding is invalid');
    const decoded = decodeChunkedBody(rawBody, MAX_RESPONSE_BYTES);
    if (!decoded) return null;
    if (decoded.consumed !== rawBody.byteLength) throw new Error('Unexpected bytes after LastRO login HTTP response');
    return { status, headers, body: decoded.body };
  }
  if (contentLengths) {
    const expectedText = contentLengths[0]!;
    if (!/^\d+$/.test(expectedText) || contentLengths.some(value => value !== expectedText)) {
      throw new Error('LastRO login HTTP content length is invalid');
    }
    const expected = Number(expectedText);
    if (!Number.isSafeInteger(expected) || expected > MAX_RESPONSE_BYTES || rawBody.byteLength > expected) {
      throw new Error('LastRO login HTTP content length does not match the response body');
    }
    if (rawBody.byteLength < expected) return null;
  } else {
    if (requireFraming) throw new Error('LastRO Native HTTP response has no body framing');
    if (!eof) return null;
  }
  return { status, headers, body: rawBody.slice() };
}

async function readResponse(
  native: { close(): void | Promise<void> },
  connection: OpenedLoginStreams,
  request: Uint8Array,
  readTimeoutMs: number,
  requireFraming = false,
): Promise<RawHttpResponse> {
  const reader = connection.readable.getReader();
  const writer = connection.writable.getWriter();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    await waitFor(writer.write(request), readTimeoutMs, 'LastRO login HTTP write timeout');
    while (true) {
      const result = await waitFor(reader.read(), readTimeoutMs, 'LastRO login HTTP read timeout');
      if (result.value?.byteLength) {
        total += result.value.byteLength;
        if (total > MAX_RESPONSE_BYTES) throw new Error('LastRO login HTTP response is too large');
        chunks.push(result.value.slice());
      }
      // LastRO can end TCP without a TLS close_notify. A framed response is
      // complete as soon as its declared length or final chunk arrives.
      const response = parseResponse(joinBytes(chunks, MAX_RESPONSE_BYTES), result.done, requireFraming);
      if (response) return response;
      if (result.done) throw new Error('LastRO login HTTP response ended before the full message arrived');
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
    await writer.abort().catch(() => undefined);
    writer.releaseLock();
    try { await native.close(); } catch { /* best effort */ }
  }
}

async function withNativeLoginStreams<T>(
  openStreams: OpenLoginStreams,
  options: LastROLoginHttpOptions,
  handle: (connection: OpenedLoginStreams, timeoutMs: number, close: () => void) => Promise<T>,
): Promise<T> {
  const lifetime = new AbortController();
  const close = () => lifetime.abort();
  try {
    const streams = await openStreams(LASTRO_LOGIN_HOST, LASTRO_LOGIN_PORT, {
      timeoutMs: Math.max(1, options.openTimeoutMs ?? DEFAULT_OPEN_TIMEOUT_MS), signal: lifetime.signal,
    });
    return await handle(streams, Math.max(1, options.readTimeoutMs ?? DEFAULT_READ_TIMEOUT_MS), close);
  } finally {
    close();
  }
}

const nativeSessionCache = /* @__PURE__ */ new WeakMap<OpenLoginStreams, Promise<LastROLoginSession>>();

function getNativeLoginSession(openStreams: OpenLoginStreams, options: LastROLoginHttpOptions): Promise<LastROLoginSession> {
  const cached = nativeSessionCache.get(openStreams);
  if (cached) return cached;
  const session = withNativeLoginStreams(openStreams, options, async (connection, timeout, close) => {
    const response = await readResponse({ close }, connection, buildBootstrapRequest(), timeout, true);
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`LastRO login HTTP bootstrap failed (${response.status})`);
    }
    return { cookie: parseCsrfCookie(response.headers), csrfToken: parseCsrfToken(response.body) };
  });
  nativeSessionCache.set(openStreams, session);
  void session.catch(() => nativeSessionCache.delete(openStreams));
  return session;
}

function buildBootstrapRequest(): Uint8Array {
  return new TextEncoder().encode([
    `GET ${LASTRO_LOGIN_BOOTSTRAP_PATH} HTTP/1.1`,
    `Host: ${LASTRO_LOGIN_HOST}`,
    'Accept: */*',
    'Accept-Encoding: identity',
    'Connection: close',
    '',
    '',
  ].join('\r\n'));
}

function parseCsrfToken(body: Uint8Array): string {
  const html = new TextDecoder().decode(body);
  const inputPattern = /<input\b[^>]*\bname=["']_csrf["'][^>]*\bvalue=["']([^"']+)["'][^>]*>/i;
  const reversedPattern = /<input\b[^>]*\bvalue=["']([^"']+)["'][^>]*\bname=["']_csrf["'][^>]*>/i;
  const token = inputPattern.exec(html)?.[1] ?? reversedPattern.exec(html)?.[1];
  if (!token) throw new Error('LastRO login HTTP csrf token is missing');
  return token;
}

function parseCsrfCookie(headers: Map<string, string[]>): string {
  const setCookie = headers.get('set-cookie')?.find(value => /(?:^|;)\s*_csrf=/i.test(value));
  const cookie = setCookie?.match(/(?:^|;)\s*(_csrf=[^;]+)/i)?.[1];
  if (!cookie) throw new Error('LastRO login HTTP csrf cookie is missing');
  return cookie;
}

async function loadLastROLoginSession(
  constructorForSocket: DirectTcpConstructor,
  options: LastROLoginHttpOptions,
): Promise<LastROLoginSession> {
  const native = new constructorForSocket(LASTRO_LOGIN_HOST, LASTRO_LOGIN_PORT, { noDelay: true, keepAliveDelay: 60_000 });
  void native.closed.catch(() => undefined);
  let opened = false;
  try {
    const openTimeoutMs = Math.max(1, options.openTimeoutMs ?? DEFAULT_OPEN_TIMEOUT_MS);
    const readTimeoutMs = Math.max(1, options.readTimeoutMs ?? DEFAULT_READ_TIMEOUT_MS);
    const connection = await waitFor(native.opened, openTimeoutMs, 'LastRO login TLS bootstrap open timeout');
    opened = true;
    const encrypted = await openEncryptedHttpStreams(native, connection, LASTRO_LOGIN_HOST, {
      timeoutMs: openTimeoutMs,
      tlsClientFactory: options.tlsClientFactory,
      verifyServerCertificate: true,
    });
    const response = await readResponse(native, encrypted, buildBootstrapRequest(), readTimeoutMs);
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`LastRO login HTTP bootstrap failed (${response.status})`);
    }
    return { cookie: parseCsrfCookie(response.headers), csrfToken: parseCsrfToken(response.body) };
  } finally {
    if (!opened) {
      try { await native.close(); } catch { /* best effort */ }
    }
  }
}

function getLastROLoginSession(
  constructorForSocket: DirectTcpConstructor,
  options: LastROLoginHttpOptions,
): Promise<LastROLoginSession> {
  const cached = sessionCache.get(constructorForSocket);
  if (cached) return cached;
  const session = loadLastROLoginSession(constructorForSocket, options);
  sessionCache.set(constructorForSocket, session);
  session.catch(() => {
    if (sessionCache.get(constructorForSocket) === session) sessionCache.delete(constructorForSocket);
  });
  return session;
}

export async function prepareLastROLoginSession(options: LastROLoginHttpOptions = {}): Promise<void> {
  if (IS_NATIVE_BUILD && options.openStreams) {
    await getNativeLoginSession(options.openStreams, options);
    return;
  }
  const constructorForSocket = options.TCPSocket ?? globalThis.TCPSocket;
  if (!constructorForSocket) throw new Error('Direct TCP is unavailable');
  await getLastROLoginSession(constructorForSocket, options);
}

function encodeLoginField(field: string, username: string, password: string, session?: LastROLoginSession): string {
  const values: Array<[string, string]> = [];
  if (session) values.push(['_csrf', session.csrfToken]);
  values.push([`${field}[userid]`, username], [`${field}[user_pass]`, password]);
  return new URLSearchParams(values).toString();
}

export function buildLastROLoginRequest(
  phase: LastROLoginPhase,
  nid: number,
  username: string,
  password: string,
  session?: LastROLoginSession,
): LastROLoginRequest {
  if (phase !== 'check' && phase !== 'checkin') throw new Error('Invalid LastRO login phase');
  const field = LOGIN_FIELDS[nid];
  if (!field) throw new Error(`LastRO login HTTP does not support nid ${nid}`);
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new TypeError('LastRO login credentials must be strings');
  }
  const body = encodeLoginField(field, username, password, session);
  const path = `/?r=mg/${phase}&nid=${nid}`;
  const encodedBody = new TextEncoder().encode(body);
  const headers = [
    `POST ${path} HTTP/1.1`,
    `Host: ${LASTRO_LOGIN_HOST}`,
    'Accept: */*',
    'Accept-Language: en,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,zh-CN;q=0.6,et;q=0.5,de;q=0.4',
    'Cache-Control: no-cache',
    'Origin: https://game.lastro.cn',
    'Pragma: no-cache',
    'Referer: https://game.lastro.cn/ro/api.html?71.86',
    'DNT: 1',
    'Sec-Fetch-Dest: empty',
    'Sec-Fetch-Mode: cors',
    'Sec-Fetch-Site: same-origin',
    'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
    'sec-ch-ua: "Chromium";v="154", "Google Chrome";v="154", "Not A(Brand";v="99"',
    'sec-ch-ua-mobile: ?0',
    'sec-ch-ua-platform: "Linux"',
    'X-Requested-With: XMLHttpRequest',
    'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
    `Content-Length: ${encodedBody.byteLength}`,
    'Connection: close',
  ];
  if (session) headers.splice(2, 0, `Cookie: ${session.cookie}`);
  const bytes = new TextEncoder().encode([...headers, '', body].join('\r\n'));
  return { host: LASTRO_LOGIN_HOST, port: LASTRO_LOGIN_PORT, path, body, bytes };
}

export async function sendLastROLoginPost(
  phase: LastROLoginPhase,
  nid: number,
  username: string,
  password: string,
  options: LastROLoginHttpOptions = {},
): Promise<void> {
  if (IS_NATIVE_BUILD && options.openStreams) {
    const session = await getNativeLoginSession(options.openStreams, options);
    const request = buildLastROLoginRequest(phase, nid, username, password, session);
    return withNativeLoginStreams(options.openStreams, options, async ({ writable }, timeout) => {
      const writer = writable.getWriter();
      try {
        await waitFor(writer.write(request.bytes), timeout, 'LastRO login TLS write timeout');
        await writer.close();
      } finally {
        writer.releaseLock();
      }
    });
  }
  const constructorForSocket = options.TCPSocket ?? globalThis.TCPSocket;
  if (!constructorForSocket) throw new Error('Direct TCP is unavailable');
  const session = await getLastROLoginSession(constructorForSocket, options);
  const request = buildLastROLoginRequest(phase, nid, username, password, session);
  const native = new constructorForSocket(request.host, request.port, { noDelay: true, keepAliveDelay: 60_000 });
  void native.closed.catch(() => undefined);
  try {
    const openTimeoutMs = Math.max(1, options.openTimeoutMs ?? DEFAULT_OPEN_TIMEOUT_MS);
    const connection = await waitFor(native.opened, openTimeoutMs, 'LastRO login TLS open timeout');
    const encrypted = await openEncryptedHttpStreams(native, connection, LASTRO_LOGIN_HOST, {
      timeoutMs: openTimeoutMs,
      tlsClientFactory: options.tlsClientFactory,
      verifyServerCertificate: true,
    });
    const writer = encrypted.writable.getWriter();
    try {
      await waitFor(writer.write(request.bytes), Math.max(1, options.readTimeoutMs ?? DEFAULT_READ_TIMEOUT_MS), 'LastRO login TLS write timeout');
      await writer.close();
    } finally {
      writer.releaseLock();
    }
  } finally {
    try {
      await native.close();
    } catch {
      // Registration is best effort; the game login must remain independent.
    }
  }
}

/**
 * POST the official LastRO adventurer recruitment board over verified TLS and
 * Direct TCPSocket, without exposing a new proxy or weakening passive GET rules.
 * Uses the same Yii CSRF cookie previously bootstrapped by the login flow.
 */
export async function requestLastROPartyOverTLS(
  nid: number,
  action: 'list' | 'get' | 'info' | 'search' | 'add' | 'del',
  fields: FormData,
  options: LastROLoginHttpOptions = {},
): Promise<Record<string, unknown>> {
  if (!['list', 'get', 'info', 'search', 'add', 'del'].includes(action)) throw new Error('Unknown recruitment action');
  if (typeof FormData === 'undefined' || !(fields instanceof FormData)) throw new Error('Invalid recruitment multipart fields');
  const openStreams = IS_NATIVE_BUILD ? options.openStreams : undefined;
  const ctor = options.TCPSocket ?? globalThis.TCPSocket;
  if (!ctor && !openStreams) throw new Error('Direct TCP is unavailable for LastRO recruitment');
  const path = `/${nid === 5 ? 'webserver2' : 'webserver'}/party/${action}`;
  // Match the fields sent by LastRO's actual Online.js. The recruitment API
  // authenticates with AuthToken; adding unrelated Yii login CSRF state can
  // cause the endpoint to reject an otherwise valid request.
  const bodyFields = new FormData();
  for (const [key, value] of fields.entries()) bodyFields.append(key, value);
  const multipart = new Request('https://' + LASTRO_LOGIN_HOST + path, { method: 'POST', body: bodyFields });
  const contentType = multipart.headers.get('content-type');
  if (!contentType?.startsWith('multipart/form-data; boundary=')) throw new Error('Multipart boundary missing');
  const body = new Uint8Array(await multipart.arrayBuffer());
  if (body.byteLength > 128 * 1024) throw new Error('Recruitment request is too large');
  const headers = [
    `POST ${path} HTTP/1.1`,
    `Host: ${LASTRO_LOGIN_HOST}`,
    'Accept: application/json',
    'Accept-Encoding: identity',
    'X-Requested-With: XMLHttpRequest',
    `Content-Type: ${contentType}`,
    `Content-Length: ${body.byteLength}`,
    'Connection: close',
  ];
  headers.push('Origin: https://game.lastro.cn', 'Referer: https://game.lastro.cn/ro/api.html');
  const head = new TextEncoder().encode(headers.join('\r\n') + '\r\n\r\n');
  const bytes = new Uint8Array(head.length + body.length);
  bytes.set(head); bytes.set(body, head.length);
  if (IS_NATIVE_BUILD && openStreams) {
    return withNativeLoginStreams(openStreams, options, async (connection, timeout, close) =>
      parsePartyResponse(await readResponse({ close }, connection, bytes, timeout, true), action, nid));
  }
  const native = new ctor!(LASTRO_LOGIN_HOST, LASTRO_LOGIN_PORT, { noDelay: true, keepAliveDelay: 60_000 });
  void native.closed.catch(() => undefined);
  try {
    const openTimeout = Math.max(1, options.openTimeoutMs ?? DEFAULT_OPEN_TIMEOUT_MS);
    const readTimeout = Math.max(1, options.readTimeoutMs ?? DEFAULT_READ_TIMEOUT_MS);
    const opened = await waitFor(native.opened, openTimeout, 'LastRO recruitment TCP open timeout');
    const encrypted = await openEncryptedHttpStreams(native, opened, LASTRO_LOGIN_HOST, {
      timeoutMs: openTimeout,
      tlsClientFactory: options.tlsClientFactory,
      verifyServerCertificate: true,
    });
    const response = await readResponse(native, encrypted, bytes, readTimeout);
    if (response.status < 200 || response.status >= 300) {
      const detail = new TextDecoder().decode(response.body).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240);
      throw new Error(`LastRO recruitment HTTP ${response.status}${detail ? ': ' + detail : ''} (action=${action}, nid=${nid})`);
    }
    const data: unknown = JSON.parse(new TextDecoder().decode(response.body));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid recruitment JSON response');
    return data as Record<string, unknown>;
  } finally {
    try { await native.close(); } catch { /* readResponse handles normal close */ }
  }
}

function parsePartyResponse(response: RawHttpResponse, action: string, nid: number): Record<string, unknown> {
  if (response.status < 200 || response.status >= 300) {
    const detail = new TextDecoder().decode(response.body).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240);
    throw new Error(`LastRO recruitment HTTP ${response.status}${detail ? ': ' + detail : ''} (action=${action}, nid=${nid})`);
  }
  const data: unknown = JSON.parse(new TextDecoder().decode(response.body));
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid recruitment JSON response');
  return data as Record<string, unknown>;
}
