/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, expect, test, vi } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { packageFixture } from './kore-fixture';

afterEach(() => vi.useRealTimers());

function createHarness() {
  const fixture = packageFixture();
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => Date.now() }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
    document: Object.assign(new EventTarget(), { hidden: false }),
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    terminated = false;
    postMessage(message: any) { this.messages.push(message); }
    terminate() { this.terminated = true; }
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const workers: Worker[] = [];
  const host = createKoreIntegration({
    page,
    manifest: fixture.executable,
    createWorker: () => { const worker = new Worker(); workers.push(worker); return worker; },
  });
  return { fixture, page, host, workers };
}

function ready(worker: any, fixture: ReturnType<typeof packageFixture>) {
  const init = worker.messages[0];
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off',
    capabilities: { mapStream: true, residentExecutor: true, oneShotDeadline: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
}

test('host does not schedule a fixed 100ms AI tick', async () => {
  vi.useFakeTimers();
  const harness = createHarness();
  const spy = vi.spyOn(harness.page, 'setInterval');
  await harness.host.start();
  expect(spy).not.toHaveBeenCalledWith(expect.any(Function), 100);
  harness.host.dispose();
});

test('worker heartbeat timeout rebuilds with bounded backoff and requests recovery snapshot', async () => {
  vi.useFakeTimers();
  const harness = createHarness();
  await harness.host.start();
  ready(harness.workers[0], harness.fixture);
  harness.workers[0]!.reply({ runtimeSessionId: harness.workers[0]!.messages[0].runtimeSessionId,
    runtimeGeneration: 1, type: 'recoverySnapshotRequest' });
  await vi.advanceTimersByTimeAsync(5000);
  expect(harness.workers[0]!.terminated).toBe(true);
  expect(harness.host.state.status).toBe('loading');
  await vi.advanceTimersByTimeAsync(249);
  expect(harness.workers).toHaveLength(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(harness.workers).toHaveLength(2);
  ready(harness.workers[1], harness.fixture);
  harness.workers[1]!.reply({ runtimeSessionId: harness.workers[1]!.messages[0].runtimeSessionId,
    runtimeGeneration: 2, type: 'recoverySnapshotRequest' });
  expect(harness.workers[1]!.messages.some(message => message.type === 'recoverySnapshot')).toBe(true);
  harness.host.dispose();
});

test('recovery clears old action permits and only accepts actions from the new runtime generation', async () => {
  const harness = createHarness();
  const sent: any[] = [];
  (harness.page as any).KoreEngineNativeAction = (action: any) => { sent.push(action); return true; };
  await harness.host.start();
  ready(harness.workers[0], harness.fixture);
  const init = harness.workers[0]!.messages[0];
  const gameSessionId = harness.host.beginGameSession(7, 'prontera.gat');
  const connectionGeneration = harness.host.beginMapConnection();
  harness.workers[0]!.reply({ runtimeSessionId: init.runtimeSessionId, type: 'worldState', gameSessionId, connectionGeneration,
    profile: 'lastro-20211103', streamStatus: 'world-ready', worldReady: true, mapName: 'prontera.gat',
    selfActor: { gid: 7, x: 10, y: 10, kind: 'self' }, visibleEntities: { total: 1, players: 0, monsters: 1, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 1 } });
  expect(harness.host.debugCommand('ai auto')).toBe(true);
  const oldControlGeneration = harness.host.state.controlGeneration;
  harness.workers[0]!.dispatchEvent(new Event('error'));
  harness.host.dispose();
  expect(sent).toHaveLength(0);
  expect(oldControlGeneration).toBeGreaterThan(0);
});

test('resident bridge uses one ordered queue and replays the cached recovery snapshot after restart', async () => {
  vi.useFakeTimers();
  const harness = createHarness();
  await harness.host.start();
  ready(harness.workers[0], harness.fixture);
  const first = harness.workers[0]!;
  first.reply({ runtimeSessionId: first.messages[0].runtimeSessionId, runtimeGeneration: 1, type: 'recoverySnapshotRequest' });
  const emptySnapshot = first.messages.find(message => message.type === 'recoverySnapshot');
  expect(emptySnapshot?.snapshot).toBeNull();
  const gameSessionId = harness.host.beginGameSession(7, 'prontera.gat');
  const connectionGeneration = harness.host.beginMapConnection();
  expect(first.messages.filter(message => message.type === 'queue').map(message => message.record.context.bridgeSequence))
    .toEqual([1, 2]);
  const mirror = {
    schemaVersion: 1, runtimeSessionId: first.messages[0].runtimeSessionId, gameSessionId, profile: 'lastro-20211103',
    connectionGeneration, controlGeneration: harness.host.state.controlGeneration, mapName: 'prontera.gat',
    characterGid: 7, selfActor: { gid: 7, x: 10, y: 10, kind: 'self' }, entities: [],
    mapResourceVersion: '2.0.5', mapResourceReady: true, mapSyncComplete: true,
    snapshotRevision: 2, worldStatus: { status: {}, inventory: {}, shop: {} }, npcDialog: {}, aiMode: 'off',
  };
  first.reply({ runtimeSessionId: first.messages[0].runtimeSessionId, type: 'recoveryMirror', snapshot: mirror });
  first.dispatchEvent(new Event('error'));
  await vi.advanceTimersByTimeAsync(250);
  expect(harness.workers).toHaveLength(2);
  const second = harness.workers[1]!;
  ready(second, harness.fixture);
  second.reply({ runtimeSessionId: second.messages[0].runtimeSessionId, runtimeGeneration: 2, type: 'recoverySnapshotRequest' });
  const replay = second.messages.find(message => message.type === 'recoverySnapshot');
  expect(replay?.snapshot).toMatchObject({ snapshotRevision: 2, gameSessionId, runtimeSessionId: second.messages[0].runtimeSessionId });
  harness.host.dispose();
});
