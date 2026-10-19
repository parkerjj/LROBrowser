import { expect, test, vi } from 'vitest';
import { createKoreIntegration, createKorePanel, formatKoreDiagnosticLine, formatKoreSections, loadKorePackage, validateKoreManifest } from '../src/kore/kore-integration.mjs';
import { bridgeRecord, packageFixture, TestWorkerStub as FakeWorker } from './kore-fixture';

function pageFor(fixture: ReturnType<typeof packageFixture>) {
  return Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 10 }, crypto: globalThis.crypto, console: { log() {} },
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

test('ready runtime reports the package mode for the debug panel', async () => {
  const { host, fixture } = await readyHost();
  expect(host.state).toMatchObject({ status: 'runtime-ready', packageId: fixture.manifest.packageId, mode: 'debug' });
});

test('rust disconnect intents reach the host socket hook', async () => {
  const { worker, page } = await readyHost();
  const disconnect = vi.fn(() => true);
  Object.assign(page, { KoreEngineDisconnect: disconnect });
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [{ kind: 'disconnect', reason: 'useSelf_item: 501 is empty (dcOnEmpty)' }] });
  expect(disconnect).toHaveBeenCalledWith('useSelf_item: 501 is empty (dcOnEmpty)');
  worker.reply({ runtimeSessionId, type: 'disconnect', reason: 'getAuto: 501 out of stock (dcOnEmpty)' });
  expect(disconnect).toHaveBeenLastCalledWith('getAuto: 501 out of stock (dcOnEmpty)');
});

test('private airship actions preserve coordinate transfers and reject partial coordinates', async () => {
  const { worker, page } = await readyHost();
  const native = vi.fn(() => true);
  Object.assign(page, { KoreEngineNativeAction: native });
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  const action = {
    requestId: 9002, runtimeSessionId, gameSessionId: 'game-a', connectionGeneration: 1, controlGeneration: 0,
    taskIntentGeneration: 1, type: 'PrivateAirship', destinationId: 'prontera', expectedMap: 'prontera',
  };
  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [{ kind: 'action', action: { ...action, x: 146, y: 89 } }] });
  expect(native).toHaveBeenCalledWith(expect.objectContaining({ type: 'PrivateAirship', x: 146, y: 89 }));

  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [{ kind: 'action', action: { ...action, requestId: 9003, x: 146 } }] });
  expect(native).toHaveBeenCalledTimes(1);
});

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
    { requestId: 2, runtimeSessionId, gameSessionId: gameId, connectionGeneration: generation, controlGeneration: 0, taskIntentGeneration: 1, type: 'UnknownAction' },
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
    degradedReason: null, logs: [{ level: 'info', text: 'ready', timestamp: 0 }], runtimeStatus: null, lastDiagnostic: null, lastCommandResult: null, configIdentity: null,
    lastWorldState: null, lastWorldStateAt: null, heartbeat: null, actions: [], diagnosticLog: [] });
  expect(view.consoleNode.value).toContain('[info] ready');
  view.clearButton.dispatchEvent(new Event('click'));
  expect(cleared).toEqual(['cleared']);
});

const baseState = {
  status: 'runtime-ready', packageId: null, mode: null, runtimeGeneration: 1, profile: 'lastro-20211103', gameSessionId: null,
  connectionGeneration: null, streamStatus: 'world-ready', worldReady: true, mapResourceState: 'ready', receivedBytes: 0, sentBytes: 0,
  degradedReason: null, logs: [], runtimeStatus: null, lastDiagnostic: null, lastCommandResult: null, configIdentity: null,
  lastWorldState: null, lastWorldStateAt: null, heartbeat: null, actions: [], diagnosticLog: [],
} as const;

test('host records native action outcomes and rejected commands for the debug panel', async () => {
  const { host, worker, page } = await readyHost();
  const native = vi.fn((action: { requestId: number }) => action.requestId === 1);
  Object.assign(page, { KoreEngineNativeAction: native });
  const gameId = host.beginGameSession(77, 'prontera.gat');
  const generation = host.beginMapConnection();
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  const action = (requestId: number, extra: object) => ({ requestId, runtimeSessionId, gameSessionId: gameId, connectionGeneration: generation, controlGeneration: 0, taskIntentGeneration: 1, ...extra });
  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [
    { kind: 'action', action: action(1, { type: 'MoveTo', x: 150, y: 180 }) },
    { kind: 'action', action: action(2, { type: 'Attack', targetGid: 9 }) },
    { kind: 'action', action: action(3, { type: 'MoveTo', x: 5000, y: 1 }) },
  ] });
  expect(host.state.actions.map(entry => [entry.requestId, entry.type, entry.detail, entry.accepted, entry.reason])).toEqual([
    [1, 'MoveTo', 'x=150 y=180', true, null],
    [2, 'Attack', 'targetGid=9', false, 'native-action-rejected'],
    [3, 'MoveTo', 'x=5000 y=1', false, 'malformed-action'],
  ]);
  const text = formatKoreSections(host.state).actions;
  expect(text).toContain('#1 MoveTo x=150 y=180 -> ACCEPTED');
  expect(text).toContain('#2 Attack targetGid=9 -> REJECTED(native-action-rejected)');
  expect(host.state.logs.some(entry => entry.level === 'warn' && entry.text.includes('action rejected: Attack #2'))).toBe(true);
  expect(host.debugCommand('   ')).toBe(false);
  expect(host.state.logs.at(-1)).toMatchObject({ level: 'warn', text: 'command not sent: empty-command' });
});

test('host reports commands that cannot be sent and echoes accepted ones with their result', async () => {
  const fixture = packageFixture('lastro-20211103', {}, 2);
  const cold = createKoreIntegration({ page: pageFor(fixture), manifest: fixture.executable, createWorker: () => new FakeWorker() });
  expect(cold.debugCommand('ai auto')).toBe(false);
  expect(cold.state.logs.at(-1)).toMatchObject({ level: 'warn', text: 'command not sent: runtime-not-ready' });

  const { host, worker } = await readyHost();
  expect(host.reloadConfig('all')).toBe(false);
  expect(host.state.logs.at(-1)!.text).toContain('reload not sent');
  host.beginGameSession(77, 'prontera.gat');
  expect(host.debugCommand('ai auto')).toBe(true);
  expect(host.state.logs.at(-1)).toMatchObject({ level: 'info', text: '> ai auto' });
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [{ kind: 'commandResult', result: { kind: 'error', code: 'ai-world-not-ready', message: 'World is not ready' } }] });
  expect(host.state.lastCommandResult).toMatchObject({ kind: 'error' });
  expect(host.state.logs.at(-1)).toMatchObject({ level: 'warn', text: '< ERROR ai-world-not-ready: World is not ready' });
  expect(formatKoreSections(host.state).command).toBe('ERROR ai-world-not-ready: World is not ready');
});

test('sendCommandText correlates silent outputs without writing the console', async () => {
  const { host, worker } = await readyHost();
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  host.beginGameSession(77, 'prontera.gat');
  const outputs: Array<{ command: string; result: unknown; silent: boolean }> = [];
  const unsubscribe = host.onCommandOutput(output => outputs.push(output));
  expect(host.sendCommandText('s', { silent: true })).toBe(true);
  const record = bridgeRecord(worker.messages.filter(message => message.type === 'queue').at(-1)!);
  expect(record.kind).toBe('command');
  expect(record.command).toBe('s');
  expect(typeof record.bridgeSequence).toBe('number');
  expect(host.state.logs.some(entry => entry.text === '> s')).toBe(false);

  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [{
    kind: 'commandResult', bridgeSequence: record.bridgeSequence,
    result: { kind: 'output', command: 's', ok: true, blocks: [{ type: 'text', domain: 'info', level: 'message', text: 'ok' }] },
  }] });
  expect(outputs).toHaveLength(1);
  expect(outputs[0]).toMatchObject({ command: 's', silent: true });
  expect(host.state.logs.some(entry => entry.text.includes('< '))).toBe(false);
  expect(host.state.lastCommandResult).toBeNull();
  unsubscribe();
});

test('host forwards Rust domain logs from both output and legacy log events', async () => {
  const { host, worker } = await readyHost();
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [
    { kind: 'log', level: 'message', domain: 'attackMon', text: '攻击目标 1002', timestamp: 5 },
  ] });
  expect(host.state.logs.at(-1)).toMatchObject({ level: 'message', domain: 'attackMon', text: '攻击目标 1002' });

  worker.reply({ runtimeSessionId, type: 'log', level: 'warning', domain: 'route', text: '路线 1 failed' });
  expect(host.state.logs.at(-1)).toMatchObject({ level: 'warning', domain: 'route', text: '路线 1 failed' });
});

test('host keeps Rust status and decision history apart from the heartbeat', async () => {
  const { host, worker } = await readyHost();
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  const diagnostic = (extra: object) => ({ kind: 'diagnostic', code: 'ai-state', message: 'ready', task: 'combat', nextAction: null, reason: null,
    targetGid: null, targetX: null, targetY: null, visibleMonsters: 0, eligibleMonsters: 0, decisionAction: null, decisionTrace: null, taskIntentGeneration: 1, ...extra });
  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [
    { kind: 'status', runtimeState: 'ready', revision: 3, worldReady: true, streamStatus: 'world-ready', nextDeadlineMs: 5, aiMode: 'auto', aiModeSynced: true },
    diagnostic({}), diagnostic({ visibleMonsters: 3 }), diagnostic({ reason: 'no-target', nextAction: 'MoveTo' }),
  ] });
  worker.reply({ runtimeSessionId, type: 'heartbeat', nextDeadlineMs: 9, queueDepth: { ingress: 0 } });
  expect(host.state.runtimeStatus).toMatchObject({ aiMode: 'auto', revision: 3 });
  expect(host.state.heartbeat).toMatchObject({ nextDeadlineMs: 9 });
  expect(host.state.diagnosticLog).toHaveLength(2);
  const sections = formatKoreSections(host.state);
  expect(sections.headline).toBe('[runtime-ready] stream=world-ready worldReady=true ai=auto');
  expect(sections.world).toContain('Rust retains WorldState');
  expect(sections.host).toContain('mode=auto synced');
  expect(sections.decision).toContain('ai-state task=combat next=MoveTo decided=- target=- why=no-target');
});

class PanelElement extends EventTarget {
  style: Record<string, string> = {}; children: PanelElement[] = []; textContent = ''; value = ''; readOnly = false; rows = 0; type = '';
  constructor(public tagName: string) { super(); this.tagName = tagName.toUpperCase(); }
  append(...nodes: PanelElement[]) { this.children.push(...nodes); }
  setAttribute() {}
}
const panelDocument = { createElement: (tag: string) => new PanelElement(tag) } as unknown as Document;
function descendants(root: PanelElement): PanelElement[] { return root.children.flatMap(child => [child, ...descendants(child)]); }
function buttonLabelled(view: { panel: HTMLElement }, label: string) {
  const found = descendants(view.panel as unknown as PanelElement).find(node => node.tagName === 'BUTTON' && node.textContent === label);
  if (!found) throw new Error(`no button ${label}`);
  return found;
}
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

test('panel quick commands go through the host and report unsent commands', () => {
  const debugCommand = vi.fn((command: string) => command !== 'ai off');
  const reloadConfig = vi.fn(() => true);
  const view = createKorePanel({ page: { document: panelDocument }, host: { clearConsole() {}, debugCommand, reloadConfig, debugMapRetry: () => false } });
  const click = (label: string) => buttonLabelled(view, label).dispatchEvent(new Event('click'));
  const note = () => (view.panel as unknown as PanelElement).children[2]!.textContent;
  click('ai auto');
  expect(debugCommand).toHaveBeenCalledWith('ai auto'); expect(note()).toBe('sent: ai auto');
  click('ai off');
  expect(note()).toBe('NOT sent: ai off - see console');
  click('reload all');
  expect(reloadConfig).toHaveBeenCalledWith('all');
  click('reload config');
  expect(reloadConfig).toHaveBeenLastCalledWith('config');
  view.commandInput.value = 'reload mon_control.txt';
  view.commandInput.dispatchEvent(Object.assign(new Event('keydown'), { key: 'Enter' }));
  expect(reloadConfig).toHaveBeenLastCalledWith('mon_control.txt');
  click('map retry');
  expect(note()).toContain('map retry NOT sent');
  view.update({ ...baseState, logs: [], actions: [], diagnosticLog: [] });
  expect(view.infoNode.value).toContain('worldReady=true');
});

test('reload buttons live in the Editor tab, not the Status tab', () => {
  const view = createKorePanel({ page: { document: panelDocument }, host: { clearConsole() {}, debugCommand: () => true } });
  const [, , , , statusPane, editorPane] = (view.panel as unknown as PanelElement).children as PanelElement[];
  const labels = (pane: PanelElement) => descendants(pane).filter(node => node.tagName === 'BUTTON').map(node => node.textContent);
  expect(labels(statusPane!)).not.toEqual(expect.arrayContaining(['reload all']));
  expect(labels(editorPane!)).toEqual(expect.arrayContaining(['reload all', 'reload config', 'reload this file', 'Load', 'Save', 'Reset to default']));
  expect([statusPane!.style.display, editorPane!.style.display]).toEqual(['block', 'none']);
  view.editorTab.dispatchEvent(new Event('click'));
  expect([statusPane!.style.display, editorPane!.style.display]).toEqual(['none', 'block']);
});

test('control file editor loads, guards unsaved edits, saves, resets and reloads through the host', async () => {
  const owner = { profile: 'lastro-20211103', aid: 1, cid: 2 };
  const documents = [{ ...owner, fileName: 'config.txt', rawText: 'attackAuto 1\n', revision: 1 }, { ...owner, fileName: 'mon_control.txt', rawText: 'all 0 0 0\n', revision: 1 }];
  const debugCommand = vi.fn(() => true);
  const reloadConfig = vi.fn(() => true);
  const getConfigDocuments = vi.fn(async () => documents);
  const saveConfigDocument = vi.fn(async (document: typeof documents[number]) => ({ ...document, revision: 2 }));
  const view = createKorePanel({ page: { document: panelDocument }, host: { clearConsole() {}, debugCommand, reloadConfig, getConfigDocuments,
    saveConfigDocument, getConfigDefault: (fileName: string) => fileName === 'config.txt' ? 'default text\n' : null } });
  const editorNote = () => view.editorNote.textContent;

  view.editorTab.dispatchEvent(new Event('click'));
  await flush();
  expect(editorNote()).toContain('No verified aid/cid');
  expect(getConfigDocuments).not.toHaveBeenCalled();

  view.update({ ...baseState, configIdentity: { aid: 1, cid: 2 }, logs: [], actions: [], diagnosticLog: [] });
  buttonLabelled(view, 'Load').dispatchEvent(new Event('click'));
  await flush();
  expect(getConfigDocuments).toHaveBeenCalledWith(owner);
  expect(view.editor.value).toBe('attackAuto 1\n');
  expect(editorNote()).toBe('Loaded config.txt revision=1 lines=2');

  view.editor.value = 'attackAuto 0\n';
  view.fileSelect.value = 'mon_control.txt';
  view.fileSelect.dispatchEvent(new Event('change'));
  await flush();
  expect(view.fileSelect.value).toBe('config.txt');
  expect(view.editor.value).toBe('attackAuto 0\n');
  expect(editorNote()).toContain('unsaved changes');

  buttonLabelled(view, 'Save').dispatchEvent(new Event('click'));
  await flush();
  expect(saveConfigDocument).toHaveBeenCalledWith({ ...owner, fileName: 'config.txt', rawText: 'attackAuto 0\n' });
  expect(editorNote()).toContain('Saved config.txt revision=2');

  view.fileSelect.value = 'mon_control.txt';
  view.fileSelect.dispatchEvent(new Event('change'));
  await flush();
  expect(view.editor.value).toBe('all 0 0 0\n');

  buttonLabelled(view, 'Reset to default').dispatchEvent(new Event('click'));
  expect(editorNote()).toContain('No packaged default for mon_control.txt');
  view.fileSelect.value = 'config.txt';
  view.fileSelect.dispatchEvent(new Event('change'));
  await flush();
  buttonLabelled(view, 'Reset to default').dispatchEvent(new Event('click'));
  expect(view.editor.value).toBe('default text\n');

  buttonLabelled(view, 'Save + ai off + reload this file').dispatchEvent(new Event('click'));
  await flush();
  expect(debugCommand).toHaveBeenCalledWith('ai off');
  expect(reloadConfig).toHaveBeenCalledWith('config.txt');
  expect(saveConfigDocument).toHaveBeenLastCalledWith({ ...owner, fileName: 'config.txt', rawText: 'default text\n' });

  view.update({ ...baseState, lastCommandResult: { kind: 'error', code: 'reload-requires-ai-off', message: 'AI must be off' }, logs: [], actions: [], diagnosticLog: [] });
  expect(view.reloadResultNode.value).toBe('ERROR reload-requires-ai-off: AI must be off');
});

test('a browser Worker delivers each message to the host exactly once', async () => {
  // 浏览器的 Worker 会同时调用 addEventListener 监听器和 onmessage；Host 不能两处都注册。
  class BrowserLikeWorker extends FakeWorker {
    onmessage: ((event: MessageEvent) => void) | null = null;
    override reply(message: unknown) {
      const event = new MessageEvent('message', { data: message });
      this.dispatchEvent(event);
      this.onmessage?.(event);
    }
  }
  const fixture = packageFixture('lastro-20211103', {}, 2);
  const worker = new BrowserLikeWorker();
  const page = pageFor(fixture);
  const native = vi.fn(() => true);
  Object.assign(page, { KoreEngineNativeAction: native });
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  const runtimeSessionId = worker.messages[0]!.runtimeSessionId;
  worker.reply({ runtimeSessionId, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false });
  const gameId = host.beginGameSession(77, 'prontera.gat');
  const generation = host.beginMapConnection();
  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [
    { kind: 'commandResult', result: { kind: 'aiState', aiMode: 'auto', taskCount: 0 } },
    { kind: 'action', action: { requestId: 5, runtimeSessionId, gameSessionId: gameId, connectionGeneration: generation, controlGeneration: 0, taskIntentGeneration: 1, type: 'Attack', targetGid: 9 } },
  ] });
  expect(host.state.logs.filter(entry => entry.text.startsWith('< ai mode=auto'))).toHaveLength(1);
  expect(native).toHaveBeenCalledTimes(1);
  expect(host.state.actions).toHaveLength(1);
});

test('decision section shows the target class id and the name the monsters filter matches against', () => {
  const diagnostic = { kind: 'diagnostic', code: 'ai-state', message: 'ready', task: 'attack', nextAction: 'UseSkillOnTarget', reason: null,
    targetGid: 110031367, targetX: 31, targetY: 254, visibleMonsters: 2, eligibleMonsters: 2, decisionAction: 'UseSkill 20 lv3', decisionTrace: null,
    taskIntentGeneration: 1, targetClassId: 1242, targetName: '冰波利' };
  const sections = formatKoreSections({ ...baseState, lastDiagnostic: diagnostic, diagnosticLog: [], logs: [], actions: [] });
  expect(sections.decision).toContain('gid=110031367 at (31,254) class=1242 "冰波利"');
  expect(formatKoreDiagnosticLine(diagnostic)).toContain('target=110031367@(31,254) class=1242 "冰波利"');
  const unnamed = formatKoreSections({ ...baseState, lastDiagnostic: { ...diagnostic, targetClassId: 0, targetName: null }, diagnosticLog: [], logs: [], actions: [] });
  expect(unnamed.decision).toContain('class=0 (no name)');
});
