const API_ROOT = 'https://ltsd.ro/api/v1/ke';
const REQUEST_TIMEOUT_MS = 15000;
export const LTSD_TOKEN_STORAGE_KEY = 'kore-ltsd-token';
const PENDING_DEVICE_STORAGE_KEY = 'kore-ltsd-pending-device';
const MIN_DEVICE_POLL_INTERVAL_SECONDS = 5;

function parseJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

function timestamp(value, fallback) {
  if (typeof value === 'string' && !/^\d+(?:\.\d+)?$/.test(value)) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
}

function retryAfter(body) {
  const action = body?.error?.action;
  if (typeof action !== 'string') return MIN_DEVICE_POLL_INTERVAL_SECONDS;
  try {
    const details = JSON.parse(action);
    return Number.isFinite(details?.retry_after)
      ? Math.max(MIN_DEVICE_POLL_INTERVAL_SECONDS, details.retry_after)
      : MIN_DEVICE_POLL_INTERVAL_SECONDS;
  } catch { return MIN_DEVICE_POLL_INTERVAL_SECONDS; }
}

function validApprovalUrl(value) {
  try {
    const url = new globalThis.URL(value);
    return url.protocol === 'https:' && url.origin === 'https://ltsd.ro'
      && url.pathname === '/ke/device' && !url.username && !url.password && !url.hash;
  } catch { return false; }
}

export function createKoreLtsdClient({
  page = globalThis,
  fetchImpl = page.fetch?.bind(page),
  storage = page.localStorage,
  now = () => Date.now(),
} = {}) {
  if (typeof fetchImpl !== 'function') throw Error('ltsd-fetch-unavailable');
  let pending = readPending();

  function readStoredToken() {
    try {
      const value = JSON.parse(storage?.getItem(LTSD_TOKEN_STORAGE_KEY) ?? 'null');
      if (typeof value?.accessToken !== 'string' || !/^ke1_[A-Za-z0-9_-]{43}$/.test(value.accessToken)
        || !Number.isFinite(value.expiresAt) || value.expiresAt <= now()) {
        storage?.removeItem(LTSD_TOKEN_STORAGE_KEY);
        return null;
      }
      return value;
    } catch {
      try { storage?.removeItem(LTSD_TOKEN_STORAGE_KEY); } catch { /* Storage is best effort only for cleanup. */ }
      return null;
    }
  }

  function readPending() {
    try {
      const value = JSON.parse(storage?.getItem(PENDING_DEVICE_STORAGE_KEY) ?? 'null');
      if (typeof value?.deviceCode !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(value.deviceCode)
        || !validApprovalUrl(value.verificationUriComplete) || value.expiresAt <= now()) {
        storage?.removeItem(PENDING_DEVICE_STORAGE_KEY);
        return null;
      }
      return { ...value, interval: Math.max(MIN_DEVICE_POLL_INTERVAL_SECONDS, value.interval), nextPollAt: value.nextPollAt ?? 0 };
    } catch {
      try { storage?.removeItem(PENDING_DEVICE_STORAGE_KEY); } catch { /* Storage is best effort only for cleanup. */ }
      return null;
    }
  }

  function savePending(value) {
    pending = value;
    try {
      storage?.setItem(PENDING_DEVICE_STORAGE_KEY, JSON.stringify({
        deviceCode: value.deviceCode,
        userCode: value.userCode,
        verificationUriComplete: value.verificationUriComplete,
        expiresAt: value.expiresAt,
        interval: value.interval,
        nextPollAt: value.nextPollAt,
      }));
    } catch { throw Error('ltsd-pending-storage-unavailable'); }
  }

  function clearPending() {
    pending = null;
    try { storage?.removeItem(PENDING_DEVICE_STORAGE_KEY); } catch { /* Pending grants expire after ten minutes. */ }
  }

  function clearToken() {
    try { storage?.removeItem(LTSD_TOKEN_STORAGE_KEY); } catch { /* The next request will fail closed. */ }
  }

  async function request(method, endpoint, { body, authenticated = true } = {}) {
    let url;
    const relativeEndpoint = endpoint.startsWith('/api/v1/ke/')
      ? endpoint.slice('/api/v1/ke/'.length) : endpoint.replace(/^\/+/, '');
    try { url = new globalThis.URL(relativeEndpoint, `${API_ROOT}/`); } catch { throw Error('ltsd-endpoint-invalid'); }
    if (url.origin !== 'https://ltsd.ro' || !url.pathname.startsWith('/api/v1/ke/')
      || url.username || url.password || url.hash) throw Error('ltsd-endpoint-invalid');
    const token = authenticated ? readStoredToken() : null;
    if (authenticated && !token) throw Error('ltsd-token-missing');
    const headers = { accept: 'application/json' };
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (token) headers.authorization = `Bearer ${token.accessToken}`;
    const response = await fetchImpl(url, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
      // 网络挂起时不能让授权流程无限等待；超时按“无法连接 LTSD”处理。
      signal: globalThis.AbortSignal?.timeout?.(REQUEST_TIMEOUT_MS),
    });
    const text = await response.text();
    const parsed = parseJson(text);
    if (response.status === 401 && authenticated) clearToken();
    return { status: response.status, ok: response.ok, body: parsed, bodyText: text };
  }

  async function beginDeviceAuthorization({ label = 'RoBrowser KoreEngine' } = {}) {
    clearPending();
    const response = await request('POST', '/device/code', { body: { label }, authenticated: false });
    const body = response.body;
    if (!response.ok || typeof body?.device_code !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.device_code)
      || typeof body.user_code !== 'string' || !/^[A-Z]{4}-[A-Z]{4}$/.test(body.user_code)
      || !validApprovalUrl(body.verification_uri_complete)) {
      if (response.ok && body?.verification_uri_complete) throw Error('device-verification-url-invalid');
      throw Error(body?.error?.code ?? 'device-code-request-failed');
    }
    const expiresAt = now() + Math.min(600, Math.max(1, Number(body.expires_in) || 600)) * 1000;
    const interval = Math.max(MIN_DEVICE_POLL_INTERVAL_SECONDS, Number(body.interval) || MIN_DEVICE_POLL_INTERVAL_SECONDS);
    savePending({
      deviceCode: body.device_code,
      userCode: body.user_code,
      verificationUriComplete: body.verification_uri_complete,
      expiresAt,
      interval,
      nextPollAt: now() + interval * 1000,
    });
    return {
      userCode: pending.userCode,
      verificationUriComplete: pending.verificationUriComplete,
      expiresAt: pending.expiresAt,
      interval: pending.interval,
    };
  }

  async function pollDeviceAuthorization() {
    if (!pending || pending.expiresAt <= now()) {
      clearPending();
      return { status: 'expired' };
    }
    if (now() < pending.nextPollAt) throw Error('device-poll-too-soon');
    const response = await request('POST', '/device/token', {
      body: { device_code: pending.deviceCode },
      authenticated: false,
    });
    if (response.status === 410 || response.body?.error?.code === 'KE_DEVICE_EXPIRED') {
      clearPending();
      return { status: 'expired' };
    }
    if (response.status === 403 && response.body?.error?.code === 'KE_DEVICE_DENIED') {
      clearPending();
      return { status: 'denied' };
    }
    if (response.status === 429) {
      pending.interval = retryAfter(response.body);
      pending.nextPollAt = now() + pending.interval * 1000;
      savePending(pending);
      return { status: 'slow-down', interval: pending.interval };
    }
    if (!response.ok) throw Error(response.body?.error?.code ?? 'device-token-request-failed');
    if (response.body?.status === 'pending') {
      pending.interval = Math.max(MIN_DEVICE_POLL_INTERVAL_SECONDS, Number(response.body.interval) || pending.interval);
      pending.nextPollAt = now() + pending.interval * 1000;
      savePending(pending);
      return { status: 'pending', interval: pending.interval };
    }
    if (response.body?.status !== 'approved' || response.body.token_type !== 'Bearer'
      || typeof response.body.access_token !== 'string' || !/^ke1_[A-Za-z0-9_-]{43}$/.test(response.body.access_token)) {
      throw Error('device-token-response-invalid');
    }
    const expiresAt = timestamp(response.body.expires_at, now() + 90 * 24 * 60 * 60 * 1000);
    try {
      storage?.setItem(LTSD_TOKEN_STORAGE_KEY, JSON.stringify({ accessToken: response.body.access_token, expiresAt }));
    } catch { throw Error('ltsd-token-storage-unavailable'); }
    clearPending();
    return { status: 'approved' };
  }

  function getPendingDeviceAuthorization() {
    if (!pending || pending.expiresAt <= now()) { clearPending(); return null; }
    return {
      userCode: pending.userCode,
      verificationUriComplete: pending.verificationUriComplete,
      expiresAt: pending.expiresAt,
      interval: pending.interval,
    };
  }

  async function getMe() {
    const response = await request('GET', '/me');
    if (!response.ok) return response;
    const user = response.body?.user;
    if (!user || (typeof user.id !== 'string' && !Number.isSafeInteger(user.id))
      || typeof user.display_name !== 'string') throw Error('ltsd-me-response-invalid');
    return { ...response, user: { id: String(user.id), displayName: user.display_name } };
  }

  async function revokeToken() {
    const response = await request('POST', '/token/revoke', { body: {} });
    if (response.ok || response.status === 204) clearToken();
    return response;
  }

  return {
    request,
    beginDeviceAuthorization,
    pollDeviceAuthorization,
    getPendingDeviceAuthorization,
    cancelDeviceAuthorization: clearPending,
    getMe,
    revokeToken,
    clearToken,
    hasToken() { return Boolean(readStoredToken()); },
  };
}
