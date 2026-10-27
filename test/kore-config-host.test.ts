import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { expect, test, vi } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { bridgeRecord, packageFixture, TestWorkerStub as WorkerStub } from './kore-fixture';

async function harness() {
  const fixture = packageFixture('lastro-20211103', { 'data/control/config.txt': 'attackAuto 2\n' }, 2); const worker = new WorkerStub();
  const page = Object.assign(new EventTarget(), { location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    indexedDB: new IDBFactory(), performance: { now: () => 1 }, crypto: globalThis.crypto });
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker }); await host.start();
  const init = worker.messages[0]!; worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, capabilities: { mapStream: true } });
  host.beginGameSession(7, 'prontera.gat', { aid: 11, cid: 22, nid: 33 }); host.beginMapConnection();
  return { host, worker, page, fixture };
}

test('raw configuration documents remain available through the Host store', async () => {
  const { host } = await harness();
  const identity = { profile: 'lastro-20211103', aid: 11, cid: 22, nid: 33 };
  await host.saveConfigDocument({ ...identity, fileName: 'config.txt', rawText: 'attackAuto 2\n' });
  await host.saveConfigDocument({ ...identity, fileName: 'timeouts.txt', rawText: 'ai_move_giveup 1\n' });
  const documents = await host.getConfigDocuments(identity) as Array<{ fileName: string; rawText: string }>;
  expect(documents.map(document => document.fileName).sort()).toEqual(['config.txt', 'timeouts.txt']);
  expect(documents.find(document => document.fileName === 'config.txt')?.rawText).toBe('attackAuto 2\n');
});

test('manual reload pulls LTSD and passes the complete profile to Rust as reload all', async () => {
  const { host, worker } = await ltsdHarness([{ status: 200, body: activeProfile }]);
  expect(host.reloadConfig('config.txt')).toBe(true);
  await vi.waitFor(() => expect(worker.messages.some(message => message.type === 'queue' && bridgeRecord(message).kind === 'command')).toBe(true));
  const command = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'command')!;
  expect(bridgeRecord(command).command).toBe('reload all');
  expect(bridgeRecord(command).documents).toHaveLength(5);
  expect(bridgeRecord(command).documents).toEqual(expect.arrayContaining([expect.objectContaining({ fileName: 'config.txt', rawText: 'attackAuto 2\n' })]));
  expect(bridgeRecord(command).profile).toBe('lastro-20211103');
  expect(bridgeRecord(command).aid).toBe(11);
  expect(bridgeRecord(command).cid).toBe(22);
  expect(bridgeRecord(command).nid).toBe(33);
});

test('packaged default TXT files are not written into IndexedDB on first read', async () => {
  const { host, page } = await harness();
  const documents = await host.getConfigDocuments({ profile: 'lastro-20211103', aid: 11, cid: 22, nid: 33 }) as unknown[];
  expect(documents).toEqual([]);
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = page.indexedDB.open('kore-config');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const count = await new Promise<number>((resolve, reject) => {
    const request = database.transaction('documents', 'readonly').objectStore('documents').count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  database.close();
  expect(count).toBe(0);
});

test('pending reload documents are discarded after the active character changes', async () => {
  const { host, worker } = await harness();
  let resolveDocuments: (documents: unknown[]) => void = () => {};
  const pendingDocuments = new Promise<unknown[]>(resolve => { resolveDocuments = resolve; });
  vi.spyOn(host, 'getConfigDocuments').mockReturnValue(pendingDocuments);
  const oldGameSessionId = host.state.gameSessionId;
  expect(host.reloadConfig('config.txt')).toBe(true);
  expect(host.endGameSession()).toBe(true);
  host.beginGameSession(8, 'geffen.gat', { aid: 33, cid: 44, nid: 55 });
  resolveDocuments([{ fileName: 'config.txt', rawText: 'old character config\n' }]);
  await pendingDocuments;
  await Promise.resolve();
  expect(host.state.gameSessionId).not.toBe(oldGameSessionId);
  expect(worker.messages.some(message => message.type === 'queue' && bridgeRecord(message).kind === 'command')).toBe(false);
});

test('configuration store does not expose route or AI controller methods', async () => {
  const { host } = await harness();
  expect('debugRouteGo' in host).toBe(false); expect('debugRoutePreview' in host).toBe(false); expect('aiPermit' in host).toBe(false);
});

const activeProfile = {
  profile_id: 12,
  name: '测试配置',
  files: {
    'config.txt': 'attackAuto 2\n',
    'mon_control.txt': '1002 1 0 0\n',
    'pickupitems.txt': 'all 1\n',
    'items_control.txt': 'all 0 1 0\n',
    'timeouts.txt': 'ai_move_giveup 1\n',
  },
};

async function ltsdHarness(responses: Array<{ status: number; body?: unknown }>) {
  const fixture = packageFixture('lastro-20211103', { 'data/control/config.txt': 'attackAuto 2\n' }, 2);
  const worker = new WorkerStub();
  const token = `ke1_${'a'.repeat(43)}`;
  const values = new Map([['kore-ltsd-token', JSON.stringify({ accessToken: token, expiresAt: Date.now() + 86_400_000 })]]);
  const localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  const fetch = vi.fn(async (input: URL) => {
    if (input.origin === 'https://ltsd.ro') {
      if (input.pathname.endsWith('/me')) return new Response(JSON.stringify({ user: { id: '10000', display_name: '测试账号' } }), { status: 200 });
      const next = responses.shift() ?? { status: 503 };
      return new Response(next.body == null ? null : JSON.stringify(next.body), { status: next.status });
    }
    return fixture.fetch(input);
  });
  const page = Object.assign(new EventTarget(), { location: { href: 'http://localhost/' }, fetch,
    indexedDB: new IDBFactory(), performance: { now: () => 1 }, crypto: globalThis.crypto, localStorage });
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, capabilities: { mapStream: true } });
  host.beginGameSession(7, 'prontera.gat', { aid: 11, cid: 22, nid: 33 });
  return { host, worker, fetch, localStorage, token };
}

test('refreshes the active LTSD profile, atomically caches it and sends reload all', async () => {
  const { host, worker, fetch, token } = await ltsdHarness([{ status: 200, body: activeProfile }]);

  const result = await host.refreshConfiguration();

  expect(result).toMatchObject({ status: 'loaded', cached: false });
  expect(fetch).toHaveBeenCalledWith(expect.objectContaining({ href: 'https://ltsd.ro/api/v1/ke/profiles/active?aid=11&cid=22&nid=33' }), expect.objectContaining({
    method: 'GET', credentials: 'omit', headers: expect.objectContaining({ authorization: `Bearer ${token}` }),
  }));
  const command = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'command');
  expect(command && bridgeRecord(command)).toMatchObject({ command: 'reload all', aid: 11, cid: 22, nid: 33,
    documents: expect.arrayContaining([expect.objectContaining({ fileName: 'timeouts.txt', rawText: 'ai_move_giveup 1\n' })]) });
});

test('uses only the same identity cache after a temporary LTSD profile failure', async () => {
  const { host, worker } = await ltsdHarness([
    { status: 200, body: activeProfile },
    { status: 503, body: { error: { code: 'KE_UNAVAILABLE' } } },
  ]);
  await host.refreshConfiguration();

  const result = await host.refreshConfiguration();

  expect(result).toMatchObject({ status: 'loaded', cached: true });
  const commands = worker.messages.filter(message => message.type === 'queue' && bridgeRecord(message).kind === 'command');
  expect(commands).toHaveLength(2);
  expect(bridgeRecord(commands[1]!).command).toBe('reload all');
  expect(bridgeRecord(commands[1]!).documents).toEqual(expect.arrayContaining([
    expect.objectContaining({ aid: 11, cid: 22, nid: 33, fileName: 'config.txt', rawText: 'attackAuto 2\n' }),
  ]));
});

test('falls back to same identity cache for an unexpected LTSD 404', async () => {
  const { host, worker } = await ltsdHarness([
    { status: 200, body: activeProfile },
    { status: 404, body: { error: { code: 'ROUTE_NOT_FOUND' } } },
  ]);
  await host.refreshConfiguration();

  const result = await host.refreshConfiguration();

  expect(result).toMatchObject({ status: 'loaded', cached: true });
  const commands = worker.messages.filter(message => message.type === 'queue' && bridgeRecord(message).kind === 'command');
  expect(commands).toHaveLength(2);
  expect(bridgeRecord(commands[1]!).documents).toEqual(expect.arrayContaining([
    expect.objectContaining({ aid: 11, cid: 22, nid: 33, fileName: 'config.txt', rawText: 'attackAuto 2\n' }),
  ]));
});

test('a malformed LTSD profile falls back with cache provenance kept through reload', async () => {
  const { host, worker } = await ltsdHarness([
    { status: 200, body: activeProfile },
    { status: 200, body: { ...activeProfile, files: { 'config.txt': 'broken\n' } } },
  ]);
  await host.refreshConfiguration();

  const result = await host.refreshConfiguration();

  expect(result).toMatchObject({ status: 'loaded', cached: true, error: 'active-profile-response-invalid' });
  expect(host.state.authorization).toMatchObject({ phase: 'cache-fallback', configCached: true, error: 'active-profile-response-invalid' });
  expect(worker.messages.filter(message => message.type === 'queue' && bridgeRecord(message).kind === 'command')).toHaveLength(2);
});

test('does not apply cached configuration when LTSD returns 401 or KE_PROFILE_NOT_FOUND', async () => {
  const unauthorized = await ltsdHarness([
    { status: 200, body: activeProfile },
    { status: 401, body: { error: { code: 'KE_AUTH_UNAUTHENTICATED' } } },
  ]);
  await unauthorized.host.refreshConfiguration();
  expect(await unauthorized.host.refreshConfiguration()).toMatchObject({ status: 'unauthorized' });
  expect(unauthorized.localStorage.getItem('kore-ltsd-token')).toBeNull();
  expect(unauthorized.worker.messages.filter(message => message.type === 'queue' && bridgeRecord(message).kind === 'command')).toHaveLength(1);

  const missingProfile = await ltsdHarness([
    { status: 200, body: activeProfile },
    { status: 404, body: { error: { code: 'KE_PROFILE_NOT_FOUND' } } },
  ]);
  await missingProfile.host.refreshConfiguration();
  expect(await missingProfile.host.refreshConfiguration()).toMatchObject({ status: 'profile-missing' });
  expect(missingProfile.worker.messages.filter(message => message.type === 'queue' && bridgeRecord(message).kind === 'command')).toHaveLength(1);
});

test('an LTSD 401 revokes the Host token and tells Rust to clear its license', async () => {
  const { host, worker } = await ltsdHarness([{ status: 401, body: { error: { code: 'KE_AUTH_UNAUTHENTICATED' } } }]);
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;

  worker.reply({ runtimeSessionId, type: 'ltsdRequest', ltsdRequestId: 71, method: 'POST', endpoint: '/instances/instance-1/start', body: {} });
  await vi.waitFor(() => expect(worker.messages.some(message => message.type === 'ltsdResponse' && message.ltsdRequestId === 71)).toBe(true));

  expect(worker.messages).toContainEqual(expect.objectContaining({ type: 'authorizationUnavailable' }));
  expect(host.state.authorization).toMatchObject({ phase: 'signed-out', user: null });
});
