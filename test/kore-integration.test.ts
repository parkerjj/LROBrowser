import { expect, test, vi } from 'vitest';
import { createKoreIntegration, createKorePanel, loadKorePackage, validateKoreManifest } from '../src/kore/kore-integration.mjs';
import { bridgeRecord, packageFixture, TestWorkerStub as FakeWorker } from './kore-fixture';

function pageFor(fixture: ReturnType<typeof packageFixture>) {
  return Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 10 }, crypto: globalThis.crypto,
  });
}

async function readyHost() {
  const fixture = packageFixture('lastro-20211103', {}, 2);
  const worker = new FakeWorker();
  const page = pageFor(fixture);
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ runtimeSessionId: init.runtimeSessionId, requestId: init.requestId, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false });
  return { fixture, worker, page, host };
}

test('package validation accepts bridge v2 and rejects incompatible profiles', async () => {
  const fixture = packageFixture('lastro-20211103', {}, 2);
  await expect(validateKoreManifest(fixture.manifest)).resolves.toMatchObject({ schedulerCapabilities: ['fourQueues', 'oneShotDeadline', 'residentExecutor'] });
  await expect(validateKoreManifest(packageFixture('lastro-20211103', {}, 1).manifest)).rejects.toThrow('incompatible-package');
  await expect(validateKoreManifest({ ...fixture.manifest, profile: 'unknown' })).rejects.toThrow('incompatible-package');
  await expect(loadKorePackage({ page: pageFor(fixture), manifest: fixture.executable })).resolves.toBeTruthy();
});

test('absent package leaves the client independent', async () => {
  const host = createKoreIntegration({ page: { location: { href: 'http://localhost/' }, fetch: () => { throw Error('unexpected'); } }, manifest: { files: [] } });
  await host.start();
  expect(host.state.status).toBe('absent');
});

test('bootstrap and game data remain raw bridge transport', async () => {
  const { host, worker } = await readyHost();
  const gameId = host.beginGameSession(77, 'prontera.gat', { aid: 11, cid: 22 });
  const generation = host.beginMapConnection();
  expect(gameId).toBeTruthy();
  expect(generation).toBe(1);
  const lifecycle = worker.messages.filter(message => message.type === 'queue').map(message => bridgeRecord(message).kind);
  expect(lifecycle).toEqual(['gameSessionStarted', 'mapConnectionStarted']);
  expect(host.mirrorMapData(generation!, new Uint8Array([0x73, 0x00]))).toBe(true);
  const gameRecord = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'gameData');
  expect(bridgeRecord(gameRecord!).bytes).toBeInstanceOf(Uint8Array);
  expect(bridgeRecord(gameRecord!).context).toMatchObject({ gameSessionId: gameId, connectionGeneration: generation });
  expect(bridgeRecord(worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'mapConnectionStarted')!))
    .toMatchObject({ mapName: 'prontera.gat', serverFieldsFolder: 'EP15.1', resourceCycle: 1 });
});

test('resident backpressure does not advance received bytes for a rejected chunk', async () => {
  const { host, worker } = await readyHost();
  host.beginGameSession(77, 'prontera.gat');
  const generation = host.beginMapConnection();
  for (let index = 0; index < 512; index += 1) expect(host.mirrorMapData(generation!, new Uint8Array([index & 0xff]))).toBe(true);
  expect(host.mirrorMapData(generation!, new Uint8Array([0xaa]))).toBe(false);
  expect(host.state.receivedBytes).toBe(512);
  const firstGame = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'gameData');
  expect(bridgeRecord(firstGame!)).toMatchObject({ sequence: 0, byteOffset: 0 });
});

test('resident connection degradation survives a full ingress buffer', async () => {
  const { host, worker } = await readyHost();
  host.beginGameSession(77, 'prontera.gat');
  const generation = host.beginMapConnection();
  for (let index = 0; index < 512; index += 1) expect(host.mirrorMapData(generation!, new Uint8Array([index & 0xff]))).toBe(true);
  for (let index = 0; index < 1024; index += 1) host.debugCommand('ai auto');
  expect(host.degradeConnection('map-socket-closed')).toBe(true);

  const acknowledged = new Set<number>();
  for (let index = 0; index < worker.messages.length; index += 1) {
    const message = worker.messages[index]!;
    if (message.type !== 'queue' || acknowledged.has(message.requestId!)) continue;
    acknowledged.add(message.requestId!);
    worker.reply({ runtimeSessionId: message.runtimeSessionId, type: 'eventAccepted', requestId: message.requestId!, result: { kind: 'accepted' } });
  }
  expect(worker.messages.some(message => message.type === 'queue' && bridgeRecord(message).kind === 'connectionDegraded'
    && bridgeRecord(message).reason === 'map-socket-closed')).toBe(true);
});

test('resident action evidence survives a control-only full ingress buffer', async () => {
  const { host, worker, page } = await readyHost();
  const native = vi.fn(() => false);
  Object.assign(page, { KoreEngineNativeAction: native });
  const gameId = host.beginGameSession(77, 'prontera.gat');
  const generation = host.beginMapConnection();
  for (let index = 0; index < 1024; index += 1) host.debugCommand('ai auto');
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [{ kind: 'action', action: {
    requestId: 9001, runtimeSessionId, gameSessionId: gameId, connectionGeneration: generation,
    controlGeneration: 0, taskIntentGeneration: 1, type: 'Attack', targetGid: 7,
  } }] });
  expect(native).toHaveBeenCalledTimes(1);

  const acknowledged = new Set<number>();
  for (let index = 0; index < worker.messages.length; index += 1) {
    const message = worker.messages[index]!;
    if (message.type !== 'queue' || acknowledged.has(message.requestId!)) continue;
    acknowledged.add(message.requestId!);
    worker.reply({ runtimeSessionId: message.runtimeSessionId, type: 'eventAccepted', requestId: message.requestId!, result: { kind: 'accepted' } });
  }
  expect(worker.messages.some(message => message.type === 'queue' && bridgeRecord(message).kind === 'actionResult'
    && bridgeRecord(message).requestId === 9001 && bridgeRecord(message).accepted === false)).toBe(true);
});

test('raw command text and Rust action context cross the bridge unchanged', async () => {
  const { host, worker, page } = await readyHost();
  const native = vi.fn(() => true);
  Object.assign(page, { KoreEngineNativeAction: native });
  const gameId = host.beginGameSession(77, 'prontera.gat');
  const generation = host.beginMapConnection();
  expect(host.debugCommand('ai auto')).toBe(true);
  const command = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'command');
  expect(bridgeRecord(command!).command).toBe('ai auto');
  expect(bridgeRecord(command!).hostNetworkSnapshot).toMatchObject({ gameSessionId: gameId, bytesSent: 0 });
  const action = { requestId: 44, runtimeSessionId: worker.messages[0]!.runtimeSessionId, gameSessionId: gameId,
    connectionGeneration: generation, controlGeneration: 7, type: 'UseItem', inventoryIndex: 9, targetGid: 7, taskIntentGeneration: 12 };
  worker.reply({ runtimeSessionId: worker.messages[0]!.runtimeSessionId, type: 'outputs', outputs: [{ kind: 'action', action, taskIntentGeneration: 12 }] });
  expect(native).toHaveBeenCalledWith(expect.objectContaining({ requestId: 44, type: 'UseItem', taskIntentGeneration: 12 }));
  const result = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'actionResult');
  expect(bridgeRecord(result!)).toMatchObject({ requestId: 44, accepted: true, context: { gameSessionId: gameId, connectionGeneration: generation, controlGeneration: 7 } });
});

test('malformed action variants and unsupported capabilities are rejected before native send', async () => {
  const { host, worker, page } = await readyHost();
  const native = vi.fn(() => true); Object.assign(page, { KoreEngineNativeAction: native });
  const gameId = host.beginGameSession(77, 'prontera.gat'); const generation = host.beginMapConnection();
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  for (const action of [
    { requestId: 1, runtimeSessionId, gameSessionId: gameId, connectionGeneration: generation, controlGeneration: 0, taskIntentGeneration: 1, type: 'Attack' },
    { requestId: 2, runtimeSessionId, gameSessionId: gameId, connectionGeneration: generation, controlGeneration: 0, taskIntentGeneration: 1, type: 'Equip', inventoryIndex: 1 },
  ]) worker.reply({ runtimeSessionId, type: 'outputs', outputs: [{ kind: 'action', action }] });
  expect(native).not.toHaveBeenCalled();
  expect(worker.messages.filter(message => message.type === 'queue' && bridgeRecord(message).kind === 'actionResult').map(message => bridgeRecord(message).reason))
    .toEqual(['malformed-action', 'unsupported-action']);
});

test('native refusal is returned to Rust and Host exposes no route or recovery controller', async () => {
  const { host, worker, page } = await readyHost();
  Object.assign(page, { KoreEngineNativeAction: () => false });
  const gameId = host.beginGameSession(77, 'prontera.gat');
  const generation = host.beginMapConnection();
  const action = { requestId: 45, runtimeSessionId: worker.messages[0]!.runtimeSessionId, gameSessionId: gameId,
    connectionGeneration: generation, controlGeneration: 1, taskIntentGeneration: 1, type: 'MoveTo', x: 3, y: 4 };
  worker.reply({ runtimeSessionId: worker.messages[0]!.runtimeSessionId, type: 'outputs', outputs: [{ kind: 'action', action }] });
  const result = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'actionResult');
  expect(bridgeRecord(result!)).toMatchObject({ requestId: 45, accepted: false, reason: 'native-action-rejected' });
  expect('debugRouteGo' in host).toBe(false);
  expect('debugRoutePreview' in host).toBe(false);
  expect('recoveryMirror' in host).toBe(false);
});

test('Rust route actions use the action transport and preserve route result correlation', async () => {
  const { host, worker, page } = await readyHost();
  const native = vi.fn(() => true); Object.assign(page, { KoreEngineNativeAction: native });
  const gameId = host.beginGameSession(77, 'prontera.gat'); const generation = host.beginMapConnection();
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [{ kind: 'routeAction', routeId: 9, action: {
    runtimeSessionId, gameSessionId: gameId, connectionGeneration: generation, controlGeneration: 0, requestId: 55,
    expectedMap: 'prontera', waitForMap: null, action: { type: 'MoveTo', x: 3, y: 4 },
  } }] });
  expect(native).toHaveBeenCalledWith(expect.objectContaining({ type: 'MoveTo', x: 3, y: 4, routeId: 9 }));
  const result = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'actionResult');
  expect(bridgeRecord(result!)).toMatchObject({ requestId: 55, routeId: 9, accepted: true });
});

test('map connection degradation crosses the bridge and blocks further raw ingress', async () => {
  const { host, worker } = await readyHost();
  host.beginGameSession(77, 'prontera.gat');
  const generation = host.beginMapConnection();
  expect(host.degradeConnection('map-socket-closed')).toBe(true);
  expect(host.state.streamStatus).toBe('degraded');
  expect(host.mirrorMapData(generation!, new Uint8Array([1]))).toBe(false);
  expect(worker.messages.some(message => message.type === 'queue' && bridgeRecord(message).kind === 'connectionDegraded'
    && bridgeRecord(message).reason === 'map-socket-closed')).toBe(true);
});

test('resident action queue fallback wraps bare actions for the native adapter', async () => {
  const { host, worker, page } = await readyHost();
  const native = vi.fn(() => true); Object.assign(page, { KoreEngineNativeAction: native });
  const gameId = host.beginGameSession(77, 'prontera.gat'); const generation = host.beginMapConnection();
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  worker.reply({ runtimeSessionId, type: 'outputs', actions: [{ requestId: 21, runtimeSessionId, gameSessionId: gameId,
    connectionGeneration: generation, controlGeneration: 0, taskIntentGeneration: 1, type: 'Attack', targetGid: 7 }], status: [] });
  expect(native).toHaveBeenCalledWith(expect.objectContaining({ requestId: 21, type: 'Attack', targetGid: 7 }));
});

test('Rust status output updates the host stream status without retaining world state', async () => {
  const { host, worker } = await readyHost();
  worker.reply({ runtimeSessionId: worker.messages[0]!.runtimeSessionId, type: 'outputs', outputs: [{ kind: 'status',
    runtimeState: 'ready', revision: 5, worldReady: true, streamStatus: 'world-ready', nextDeadlineMs: null, aiMode: 'auto', aiModeSynced: true }] });
  expect(host.state.streamStatus).toBe('world-ready');
  expect(host.state.worldReady).toBe(true);
  expect('selfActor' in host.state).toBe(false);
});

test('new map connections restart raw stream sequence and byte offset', async () => {
  const { host, worker } = await readyHost();
  host.beginGameSession(77, 'prontera.gat');
  const first = host.beginMapConnection();
  expect(host.mirrorMapData(first!, new Uint8Array([1, 2]))).toBe(true);
  const second = host.beginMapConnection();
  expect(host.mirrorMapData(second!, new Uint8Array([3]))).toBe(true);
  const gameRecords = worker.messages.filter(message => message.type === 'queue' && bridgeRecord(message).kind === 'gameData');
  expect(bridgeRecord(gameRecords.at(-1)!)).toMatchObject({ sequence: 0, byteOffset: 0 });
});

test('panel only renders Rust diagnostics and raw command controls', () => {
  class FakeElement extends EventTarget {
    style: Record<string, string> = {}; children: FakeElement[] = []; textContent = ''; value = ''; readOnly = false; rows = 0; type = '';
    constructor(public tagName: string) { super(); this.tagName = tagName.toUpperCase(); }
    append(...nodes: FakeElement[]) { this.children.push(...nodes); }
    setAttribute() {}
  }
  const document = { createElement: (tag: string) => new FakeElement(tag) } as unknown as Document;
  const cleared: string[] = [];
  const view = createKorePanel({ page: { document }, host: { clearConsole: () => cleared.push('cleared'), debugCommand: () => false } });
  expect(view.panel.style.position).toBe('fixed');
  expect(Number(view.panel.style.zIndex)).toBeGreaterThan(1000);
  expect(view.panel.style.maxWidth).toBe('calc(100vw - 24px)');
  expect(view.infoNode.readOnly).toBe(true);
  expect(view.consoleNode.readOnly).toBe(true);
  view.update({ status: 'runtime-ready', packageId: null, mode: null, runtimeGeneration: 1, profile: 'lastro-20211103', gameSessionId: null,
    connectionGeneration: null, streamStatus: 'awaiting-sync', worldReady: false, mapResourceState: 'idle', receivedBytes: 0, sentBytes: 0,
    degradedReason: null, logs: [{ level: 'info', text: 'ready', timestamp: 0 }], runtimeStatus: null, lastDiagnostic: null, lastCommandResult: null, configIdentity: null });
  expect(view.consoleNode.value).toContain('[info] ready');
  view.clearButton.dispatchEvent(new Event('click'));
  expect(cleared).toEqual(['cleared']);
});
