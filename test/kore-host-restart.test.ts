import { expect, test, vi } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { bridgeRecord, packageFixture, TestWorkerStub as WorkerStub } from './kore-fixture';

const FAST = { backoffMs: [0], resyncDelayMs: 0, resyncTimeoutMs: 5000 };

async function setup(restartPolicy: Record<string, unknown> = FAST) {
  const fixture = packageFixture('lastro-20211103', {}, 2);
  const workers: WorkerStub[] = [];
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch, performance: { now: () => 1 }, crypto: globalThis.crypto,
    KoreEngineNativeAction: vi.fn(() => true), KoreEngineCurrentMap: () => 'prontera.gat',
  });
  const host = createKoreIntegration({
    page, manifest: fixture.executable, restartPolicy,
    createWorker: () => { const worker = new WorkerStub(); workers.push(worker); return worker; },
  });
  await host.start();
  const sessionOf = (worker: WorkerStub) => worker.messages[0]!.runtimeSessionId as string;
  const ready = (worker: WorkerStub) => worker.reply({ runtimeSessionId: sessionOf(worker), type: 'ready', packageId: fixture.manifest.packageId, worldReady: false });
  ready(workers[0]!);
  return { fixture, workers, page, host, sessionOf, ready };
}

const records = (worker: WorkerStub) => worker.messages.filter(message => message.type === 'queue').map(bridgeRecord);

test('a retryable fault rebuilds the worker, terminates the old one and ignores its late messages', async () => {
  const { host, workers, sessionOf, ready } = await setup();
  const first = workers[0]!;
  const firstSession = sessionOf(first);
  first.reply({ runtimeSessionId: firstSession, type: 'fault', message: 'unreachable', fatal: true, retryable: true });

  expect(host.state.status).toBe('restarting');
  expect(first.terminated).toBe(true);
  await vi.waitFor(() => expect(workers).toHaveLength(2));
  const second = workers[1]!;
  expect(second.messages[0]).toMatchObject({ type: 'residentInit' });
  expect(sessionOf(second)).not.toBe(firstSession);

  first.reply({ runtimeSessionId: firstSession, type: 'fault', message: 'late' });
  ready(second);
  expect(host.state.status).toBe('runtime-ready');
  expect(host.state.degradedReason).toBeNull();
});

test('a non-retryable fault is not restarted automatically', async () => {
  const { host, workers, sessionOf } = await setup();
  workers[0]!.reply({ runtimeSessionId: sessionOf(workers[0]!), type: 'fault', message: 'package-incompatible', retryable: false });
  expect(host.state.status).toBe('failed');
  await new Promise(resolve => setTimeout(resolve, 20));
  expect(workers).toHaveLength(1);
});

test('automatic restarts stop after the budget is spent, and a manual retry still rebuilds', async () => {
  const { host, workers, sessionOf, ready } = await setup({ ...FAST, maxRestarts: 2 });
  host.beginGameSession(77, 'prontera.gat', { aid: 11, cid: 22, nid: 33 });
  for (let round = 1; round <= 2; round += 1) {
    const current = workers[round - 1]!;
    current.reply({ runtimeSessionId: sessionOf(current), type: 'fault', message: 'unreachable', retryable: true });
    await vi.waitFor(() => expect(workers).toHaveLength(round + 1));
    ready(workers[round]!);
  }
  const last = workers[2]!;
  last.reply({ runtimeSessionId: sessionOf(last), type: 'fault', message: 'unreachable', retryable: true });
  expect(host.state.status).toBe('failed');
  expect(host.state.logs.some(log => log.text.includes('不再重试'))).toBe(true);

  (host.state.authorization as { user: unknown }).user = { id: 'user-1' };
  expect(await host.retryAuthorization()).toBe(true);
  await vi.waitFor(() => expect(workers).toHaveLength(4));
});

test('a recovered worker error is logged without changing the runtime state', async () => {
  const { host, workers, sessionOf } = await setup();
  workers[0]!.reply({ runtimeSessionId: sessionOf(workers[0]!), type: 'workerError', recoverable: true, message: 'queue-record-too-large:status', messageType: 'drainOutputs' });
  expect(host.state.status).toBe('runtime-ready');
  expect(host.state.logs.some(log => log.text.includes('worker error (recovered)') && log.text.includes('queue-record-too-large'))).toBe(true);
  expect(workers).toHaveLength(1);
});

test('after a crash the session is re-announced, the stream is re-aligned, the character resyncs by airship and AI resumes', async () => {
  const { host, workers, page, sessionOf, ready } = await setup();
  const first = workers[0]!;
  host.beginGameSession(77, 'prontera.gat', { aid: 11, cid: 22, nid: 33 });
  const generation = host.beginMapConnection()!;
  const oldGameId = host.state.gameSessionId;
  first.reply({ runtimeSessionId: sessionOf(first), type: 'outputs', outputs: [{ kind: 'status', aiMode: 'auto', worldReady: true }] });

  first.reply({ runtimeSessionId: sessionOf(first), type: 'fault', message: 'unreachable', fatal: true, retryable: true });
  await vi.waitFor(() => expect(workers).toHaveLength(2));
  const second = workers[1]!;
  ready(second);

  // 会话与地图连接重新告知新 Runtime；连接 generation 不变（Online.js 持有的就是它）
  const announced = records(second);
  expect(announced.map(record => record.kind)).toEqual(['gameSessionStarted', 'mapConnectionStarted']);
  expect(announced[0]).toMatchObject({ aid: 11, cid: 22, nid: 33, characterGid: 77 });
  expect(announced[1]!.context).toMatchObject({ connectionGeneration: generation });
  expect(host.state.gameSessionId).not.toBe(oldGameId);
  expect(host.state.recovery?.stage).toBe('awaiting-alignment');

  // 未对齐的数据块被丢弃；第一个对齐的块开始转发
  expect(host.mirrorMapData(generation, new Uint8Array([1, 2, 3]), { aligned: false })).toBe(false);
  expect(records(second).some(record => record.kind === 'gameData')).toBe(false);
  expect(host.mirrorMapData(generation, new Uint8Array([4, 5, 6]), { aligned: true })).toBe(true);
  expect(records(second).filter(record => record.kind === 'gameData')).toHaveLength(1);

  // 已经在 prontera，所以飞艇改去 payon
  await vi.waitFor(() => expect(page.KoreEngineNativeAction).toHaveBeenCalledWith(expect.objectContaining({ type: 'PrivateAirship', destinationId: 'payon' })));
  expect(host.state.recovery?.stage).toBe('awaiting-world');

  // 世界就绪 + 配置加载完成后才恢复 AI
  second.reply({ runtimeSessionId: sessionOf(second), type: 'outputs', outputs: [{ kind: 'status', aiMode: 'off', worldReady: true }] });
  expect(records(second).some(record => record.kind === 'command' && record.command === 'ai auto')).toBe(false);
  second.reply({ runtimeSessionId: sessionOf(second), type: 'authorizationStatus', phase: 'ready' });
  expect(records(second).some(record => record.kind === 'command' && record.command === 'ai auto')).toBe(true);
  expect(host.state.recovery?.stage).toBe('idle');
});

test('the resync airship goes to prontera when the character is elsewhere', async () => {
  const { host, workers, page, sessionOf, ready } = await setup();
  Object.assign(page, { KoreEngineCurrentMap: () => 'cmd_fild04.gat' });
  host.beginGameSession(77, 'cmd_fild04.gat', { aid: 11, cid: 22, nid: 33 });
  const generation = host.beginMapConnection()!;
  workers[0]!.reply({ runtimeSessionId: sessionOf(workers[0]!), type: 'fault', message: 'unreachable', retryable: true });
  await vi.waitFor(() => expect(workers).toHaveLength(2));
  ready(workers[1]!);
  host.mirrorMapData(generation, new Uint8Array([1]), { aligned: true });
  await vi.waitFor(() => expect(page.KoreEngineNativeAction).toHaveBeenCalledWith(expect.objectContaining({ destinationId: 'prontera' })));
});

test('a crash without an active map connection only re-announces the session', async () => {
  const { host, workers, page, sessionOf, ready } = await setup();
  host.beginGameSession(77, 'prontera.gat', { aid: 11, cid: 22, nid: 33 });
  workers[0]!.reply({ runtimeSessionId: sessionOf(workers[0]!), type: 'fault', message: 'unreachable', retryable: true });
  await vi.waitFor(() => expect(workers).toHaveLength(2));
  ready(workers[1]!);
  expect(records(workers[1]!).map(record => record.kind)).toEqual(['gameSessionStarted']);
  expect(host.state.recovery?.stage).toBe('idle');
  expect(page.KoreEngineNativeAction).not.toHaveBeenCalled();
});
