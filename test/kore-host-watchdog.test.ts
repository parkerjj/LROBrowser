/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, expect, test, vi } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { packageFixture } from './kore-fixture';

afterEach(() => vi.useRealTimers());

function createHarness(mapResourceProvider?: any) {
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
    mapResourceProvider,
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

test('resident ready starts a recovery handshake and bootstraps after a null snapshot', async () => {
  const harness = createHarness();
  await harness.host.start();
  const worker = harness.workers[0]!;
  ready(worker, harness.fixture);

  const hostRequest = worker.messages.find(message => message.type === 'recoverySnapshotRequest');
  expect(hostRequest).toMatchObject({ runtimeGeneration: 1, snapshotRevision: null });
  worker.reply({ runtimeSessionId: worker.messages[0].runtimeSessionId, runtimeGeneration: 1,
    type: 'recoverySnapshotRequest', requestId: hostRequest.requestId, snapshotRevision: null });

  const snapshot = worker.messages.find(message => message.type === 'recoverySnapshot');
  expect(snapshot).toMatchObject({ runtimeGeneration: 1, snapshot: null });
  worker.reply({ runtimeSessionId: worker.messages[0].runtimeSessionId, runtimeGeneration: 1,
    type: 'recoverySnapshotImported', result: { kind: 'recoveryAck', snapshotRevision: 0, worldReady: false } });

  const gameSessionId = harness.host.beginGameSession(7, 'prontera.gat');
  const connectionGeneration = harness.host.beginMapConnection();
  expect(gameSessionId).toBeTruthy();
  expect(connectionGeneration).toBe(0);
  const lifecycle = worker.messages.filter(message => message.type === 'queue');
  expect(lifecycle.map(message => message.record.kind)).toEqual(['gameSessionStarted', 'mapConnectionStarted']);
  expect(harness.host.mirrorMapData(connectionGeneration!, new Uint8Array([0x73, 0x00]))).toBe(true);
  expect(worker.messages.filter(message => message.type === 'queue').at(-1)?.record).toMatchObject({
    kind: 'gameData', sequence: 0, byteOffset: 0, bytes: new Uint8Array([0x73, 0x00]),
  });
  harness.host.dispose();
});

test('resident map connection requests, validates, commits, and publishes the field resource', async () => {
  const resourcePath = 'EP15.1/prontera.fld2';
  const provider = {
    handleResourceRequest: vi.fn(async (message: any) => ({ requestId: message.requestId, result: {
      kind: 'fieldMap', files: [{ role: 'field', relativePath: resourcePath, sha256: 'a'.repeat(64),
        encoding: 'identity', bytes: new Uint8Array([1, 2]).buffer }],
    } })),
    handleResourceValidation: vi.fn(async (message: any) => ({ requestId: message.requestId,
      sourceRequestId: message.sourceRequestId, committedFiles: message.acceptedFiles, deletedFiles: [] })),
    close: async () => undefined,
  };
  const harness = createHarness(provider);
  await harness.host.start();
  const worker = harness.workers[0]!;
  ready(worker, harness.fixture);
  const request = worker.messages.find(message => message.type === 'recoverySnapshotRequest');
  worker.reply({ runtimeSessionId: worker.messages[0].runtimeSessionId, runtimeGeneration: 1,
    type: 'recoverySnapshotRequest', requestId: request.requestId, snapshotRevision: null });
  worker.reply({ runtimeSessionId: worker.messages[0].runtimeSessionId, runtimeGeneration: 1,
    type: 'recoverySnapshotImported', result: { kind: 'recoveryAck', snapshotRevision: 0, worldReady: false } });
  harness.host.beginGameSession(7, 'prontera.gat');
  harness.host.beginMapConnection();
  await Promise.resolve();

  const resourceResult = worker.messages.find(message => message.type === 'resourceResult');
  expect(provider.handleResourceRequest).toHaveBeenCalledWith(expect.objectContaining({
    resourceType: 'fieldMap', mapName: 'prontera.gat', baseName: 'prontera', fieldpackVersion: '2.0.5',
    serverFieldsFolder: 'EP15.1', connectionGeneration: 0,
  }));
  expect(resourceResult?.result).toMatchObject({ kind: 'fieldMap', files: [{ relativePath: resourcePath }] });

  worker.reply({ runtimeSessionId: worker.messages[0].runtimeSessionId, type: 'resourceValidation',
    requestId: 901, sourceRequestId: resourceResult.requestId, resourceCycle: resourceResult.resourceCycle,
    fieldRelativePath: resourcePath, acceptedFiles: [resourcePath], rejectedFiles: [] });
  await Promise.resolve();

  expect(provider.handleResourceValidation).toHaveBeenCalledOnce();
  expect(worker.messages.find(message => message.type === 'resourceValidationResult'))
    .toMatchObject({ sourceRequestId: resourceResult.requestId, committedFiles: [resourcePath] });
  expect(worker.messages.filter(message => message.type === 'queue').at(-1)?.record)
    .toMatchObject({ kind: 'mapResource', mapName: 'prontera.gat', version: resourcePath, ready: true });
  expect(harness.host.state.mapResourceState).toBe('loading');
  harness.host.dispose();
});

test('resident recovery buffering enforces the pending game chunk limit before copying', async () => {
  const harness = createHarness();
  await harness.host.start();
  const worker = harness.workers[0]!;
  ready(worker, harness.fixture);
  harness.host.beginGameSession(7, 'prontera.gat');
  const connectionGeneration = harness.host.beginMapConnection();
  const copy = vi.spyOn(Uint8Array.prototype, 'slice');
  try {
    for (let index = 0; index < 256; index++) {
      expect(harness.host.mirrorMapData(connectionGeneration!, new Uint8Array([index]))).toBe(true);
    }
    expect(harness.host.mirrorMapData(connectionGeneration!, new Uint8Array([0xff]))).toBe(false);
    expect(copy).toHaveBeenCalledTimes(256);
  } finally {
    copy.mockRestore();
  }
  expect(harness.host.state.streamStatus).toBe('degraded');
  expect(harness.host.state.degradedReason).toBe('worker-startup-queue-overflow');
  harness.host.dispose();
});

test('resident recovery buffering enforces the pending game byte limit below the chunk limit', async () => {
  const harness = createHarness();
  await harness.host.start();
  const worker = harness.workers[0]!;
  ready(worker, harness.fixture);
  harness.host.beginGameSession(7, 'prontera.gat');
  const connectionGeneration = harness.host.beginMapConnection();
  const chunk = new Uint8Array(8192);
  for (let index = 0; index < 128; index++) {
    expect(harness.host.mirrorMapData(connectionGeneration!, chunk)).toBe(true);
  }
  expect(harness.host.mirrorMapData(connectionGeneration!, chunk)).toBe(false);
  expect(harness.host.state.streamStatus).toBe('degraded');
  expect(harness.host.state.degradedReason).toBe('worker-startup-queue-overflow');
  harness.host.dispose();
});

test('resident commands are output-driven without retaining request entries', async () => {
  const harness = createHarness();
  await harness.host.start();
  const worker = harness.workers[0]!;
  ready(worker, harness.fixture);
  const request = worker.messages.find(message => message.type === 'recoverySnapshotRequest');
  worker.reply({ runtimeSessionId: worker.messages[0].runtimeSessionId, runtimeGeneration: 1,
    type: 'recoverySnapshotRequest', requestId: request.requestId, snapshotRevision: null });
  worker.reply({ runtimeSessionId: worker.messages[0].runtimeSessionId, runtimeGeneration: 1,
    type: 'recoverySnapshotImported', result: { kind: 'recoveryAck', snapshotRevision: 0, worldReady: false } });
  harness.host.beginGameSession(7, 'prontera.gat');
  harness.host.beginMapConnection();
  worker.reply({ runtimeSessionId: worker.messages[0].runtimeSessionId, runtimeGeneration: 1, type: 'outputs',
    outputs: [{ kind: 'status', worldReady: true, aiMode: 'off', revision: 2 }] });

  for (let index = 0; index < 200; index++) {
    expect(harness.host.debugCommand(index % 2 ? 'ai off' : 'ai auto')).toBe(true);
  }
  const commands = worker.messages.filter(message => message.type === 'queue' && message.record.kind === 'command');
  expect(commands).toHaveLength(200);
  for (const command of commands) worker.reply({ runtimeSessionId: worker.messages[0].runtimeSessionId,
    runtimeGeneration: 1, type: 'eventAccepted', requestId: command.requestId, result: { kind: 'accepted' } });
  worker.reply({ runtimeSessionId: worker.messages[0].runtimeSessionId, runtimeGeneration: 1, type: 'outputs',
    outputs: [{ kind: 'status', worldReady: true, aiMode: 'auto', revision: 202 }] });
  worker.reply({ runtimeSessionId: worker.messages[0].runtimeSessionId, runtimeGeneration: 1, type: 'commandResult',
    requestId: commands.at(-1).record.context.bridgeSequence, result: { kind: 'aiState', aiMode: 'off', taskCount: 0 } });
  expect(harness.host.state.aiState).toBe('auto');
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
