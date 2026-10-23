import { expect, test, vi } from 'vitest';
import { createKoreLtsdClient } from '../src/kore/kore-ltsd-client.mjs';

function createHarness(responses: Array<{ status: number; body?: unknown }>) {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  const calls: Array<{ input: URL; init: RequestInit }> = [];
  const fetchImpl = vi.fn(async (input: URL, init: RequestInit) => {
    calls.push({ input, init });
    const next = responses.shift() ?? { status: 204 };
    return new Response(next.body == null ? null : JSON.stringify(next.body), { status: next.status });
  });
  let now = 1_800_000_000_000;
  const client = createKoreLtsdClient({
    page: { localStorage: storage, fetch: fetchImpl } as never,
    now: () => now,
  });
  return { client, calls, fetchImpl, storage, setNow: (value: number) => { now = value; } };
}

test('starts device authorization without exposing or logging the device code', async () => {
  const deviceCode = 'd'.repeat(43);
  const harness = createHarness([{ status: 200, body: {
    device_code: deviceCode,
    user_code: 'BCDF-GHJK',
    verification_uri: 'https://ltsd.ro/ke/device',
    verification_uri_complete: 'https://ltsd.ro/ke/device?code=BCDF-GHJK',
    expires_in: 600,
    interval: 5,
  } }]);

  const result = await harness.client.beginDeviceAuthorization();

  expect(result).toMatchObject({ userCode: 'BCDF-GHJK', expiresAt: 1_800_000_600_000, interval: 5 });
  expect(JSON.stringify(result)).not.toContain(deviceCode);
  expect(harness.calls[0]?.input.href).toBe('https://ltsd.ro/api/v1/ke/device/code');
  expect(harness.calls[0]?.init).toMatchObject({ method: 'POST', credentials: 'omit', redirect: 'error' });
  expect(harness.calls[0]?.init.headers).toMatchObject({ 'content-type': 'application/json' });
  expect(harness.calls[0]?.init.body).toBe(JSON.stringify({ label: 'RoBrowser KoreEngine' }));
});

test('polls no sooner than five seconds and stores an approved token globally', async () => {
  const accessToken = `ke1_${'a'.repeat(43)}`;
  const harness = createHarness([
    { status: 200, body: { device_code: 'd'.repeat(43), user_code: 'BCDF-GHJK', verification_uri: 'https://ltsd.ro/ke/device', verification_uri_complete: 'https://ltsd.ro/ke/device?code=BCDF-GHJK', expires_in: 600, interval: 1 } },
    { status: 200, body: { status: 'pending', interval: 1 } },
    { status: 200, body: { status: 'approved', access_token: accessToken, token_type: 'Bearer', expires_at: 1_800_000_600_000 } },
  ]);
  await harness.client.beginDeviceAuthorization();
  harness.setNow(1_800_000_005_000);
  expect(await harness.client.pollDeviceAuthorization()).toMatchObject({ status: 'pending', interval: 5 });
  await expect(harness.client.pollDeviceAuthorization()).rejects.toThrow('device-poll-too-soon');
  harness.setNow(1_800_000_010_000);
  expect(await harness.client.pollDeviceAuthorization()).toEqual({ status: 'approved' });
  expect(harness.storage.getItem('kore-ltsd-token')).toContain(accessToken);
  expect(harness.calls[2]?.init.body).toBe(JSON.stringify({ device_code: 'd'.repeat(43) }));
});

test('a 401 clears the bearer token and never falls back inside the client', async () => {
  const harness = createHarness([{ status: 401, body: { error: { code: 'KE_AUTH_UNAUTHENTICATED' } } }]);
  harness.storage.setItem('kore-ltsd-token', JSON.stringify({ accessToken: `ke1_${'b'.repeat(43)}`, expiresAt: 1_900_000_000_000 }));

  const response = await harness.client.request('GET', '/api/v1/ke/me');

  expect(response).toMatchObject({ status: 401, ok: false, body: { error: { code: 'KE_AUTH_UNAUTHENTICATED' } } });
  expect(harness.storage.getItem('kore-ltsd-token')).toBeNull();
  expect(harness.calls[0]?.init.headers).toMatchObject({ authorization: `Bearer ke1_${'b'.repeat(43)}` });
  expect(harness.calls[0]?.init.credentials).toBe('omit');
});

test('rejects verification links outside the LTSD device approval page', async () => {
  const harness = createHarness([{ status: 200, body: {
    device_code: 'd'.repeat(43), user_code: 'BCDF-GHJK',
    verification_uri: 'https://ltsd.ro/ke/device',
    verification_uri_complete: 'https://evil.example/approve?code=BCDF-GHJK',
    expires_in: 600, interval: 5,
  } }]);

  await expect(harness.client.beginDeviceAuthorization()).rejects.toThrow('device-verification-url-invalid');
  expect(harness.storage.getItem('kore-ltsd-pending-device')).toBeNull();
});


test('every LTSD request carries a timeout signal so a hung network cannot leave the panel waiting forever', async () => {
  const harness = createHarness([{ status: 200, body: { device_code: 'd'.repeat(43), user_code: 'BCDF-GHJK',
    verification_uri: 'https://ltsd.ro/ke/device', verification_uri_complete: 'https://ltsd.ro/ke/device?code=BCDF-GHJK',
    expires_in: 600, interval: 5 } }]);

  await harness.client.beginDeviceAuthorization();

  expect(harness.calls[0]?.init.signal).toBeInstanceOf(AbortSignal);
});
