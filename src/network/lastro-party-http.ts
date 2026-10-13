import { openEncryptedHttpStreams, readResponse } from '../resources/direct-http-resource';

const OFFICIAL_HOST = 'game.lastro.cn';
const PARTY_PATH = /^\/(?:webserver|webserver2)\/party\/(?:list|get|info|search|add|del)$/;
const MAX_REQUEST_BYTES = 32 * 1024;
const MAX_REPLY_BYTES = 1024 * 1024;
const TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('LastRO 募集网络连接超时')), ms);
    }),
  ]).finally(() => { if (timer) clearTimeout(timer); });
}

/**
 * IWA only. Direct Sockets + bundled TLS implement one narrowly scoped
 * multipart POST to LastRO's own recruitment service. No CORS or browser
 * cookies are involved; the caller supplies the in-game AuthToken via FormData.
 * Auth cookies / CSRF may need extending after testing the actual endpoint.
 */
export async function postLastROPartyRequest(path: string, fields: FormData): Promise<Record<string, unknown>> {
  if (!PARTY_PATH.test(path)) throw new Error('不允许访问未授权的募集 API 路径');
  if (typeof globalThis.TCPSocket !== 'function') throw new Error('当前浏览器不支持 Direct TCP');
  const payload = new Response(fields);
  const type = payload.headers.get('content-type');
  if (!type?.startsWith('multipart/form-data; boundary=')) throw new Error('募集请求编码失败');
  const bytes = new Uint8Array(await payload.arrayBuffer());
  if (bytes.byteLength > MAX_REQUEST_BYTES) throw new Error('募集请求内容超过大小限制');
  const header = new TextEncoder().encode([
    `POST ${path} HTTP/1.1`,
    `Host: ${OFFICIAL_HOST}`,
    'Accept: application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding: identity',
    'X-Requested-With: XMLHttpRequest',
    `Content-Type: ${type}`,
    `Content-Length: ${bytes.byteLength}`,
    'Connection: close', '', '',
  ].join('\r\n'));
  const request = new Uint8Array(header.byteLength + bytes.byteLength);
  request.set(header);
  request.set(bytes, header.byteLength);
  const native = new globalThis.TCPSocket(OFFICIAL_HOST, 443, { noDelay:true, keepAliveDelay:60000 });
  void native.closed.catch(() => undefined);
  try {
    const opened = await withTimeout(native.opened, TIMEOUT_MS);
    const encrypted = await openEncryptedHttpStreams(native, opened, OFFICIAL_HOST, {
      timeoutMs: TIMEOUT_MS, verifyServerCertificate: true,
    });
    const response = await readResponse(native, encrypted, request, {
      readTimeoutMs: TIMEOUT_MS,
      maxHeaderBytes: 32 * 1024,
      maxBodyBytes: MAX_REPLY_BYTES,
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`募集 HTTP 请求失败（${response.status}）`);
    }
    let parsed: unknown;
    try { parsed = JSON.parse(new TextDecoder().decode(response.body)); }
    catch { throw new Error('募集接口未返回合法 JSON'); }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('募集接口响应格式无效');
    }
    return parsed as Record<string, unknown>;
  } finally {
    try { await native.close(); } catch { /* readResponse already closes on success */ }
  }
}
