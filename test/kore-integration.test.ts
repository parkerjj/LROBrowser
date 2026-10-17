import { afterEach, expect, test, vi } from 'vitest';
import { createKoreIntegration, createKorePanel, loadKorePackage, validateKoreManifest } from '../src/kore/kore-integration.mjs';
import { packageFixture } from './kore-fixture';
import { LASTRO_SERVER_PROFILES } from '../src/servers/server-profiles';

afterEach(() => vi.useRealTimers());

test('absent and corrupt packages do not block the independent client', async () => {
  const page = { location: { href: 'http://localhost/' }, fetch: () => { throw Error('unexpected KE request'); } };
  const absent = createKoreIntegration({ page, manifest: { files: [] } });
  await absent.start();
  expect(absent.state.status).toBe('absent');
  const fixture = packageFixture();
  fixture.files.set(`ke/${fixture.manifest.packageId}/kore_wasm_bg.wasm`, new Uint8Array([1]));
  const host = createKoreIntegration({ page: { ...page, fetch: fixture.fetch }, manifest: fixture.executable });
  const nativeStartup = Promise.resolve('client initialized');
  await host.start();
  expect(host.state.status).toBe('failed');
  expect(await nativeStartup).toBe('client initialized');
  await expect(loadKorePackage({ page: { ...page, fetch: fixture.fetch }, manifest: fixture.executable })).rejects.toThrow();
});

test('accepts the protocol-family package profile shared by all configured LastRO servers', async () => {
  const fixture = packageFixture();
  await expect(validateKoreManifest(fixture.manifest)).resolves.toMatchObject({ profile: 'lastro-20211103' });
  const legacyFixture = packageFixture('lastro-2x');
  await expect(validateKoreManifest(legacyFixture.manifest)).resolves.toMatchObject({ profile: 'lastro-2x' });
  await expect(validateKoreManifest({ ...fixture.manifest, profile: 'unknown-protocol' })).rejects.toThrow('incompatible-package');
  await expect(validateKoreManifest({ ...fixture.manifest, packetver: 20211104 })).rejects.toThrow('incompatible-package');
  expect(LASTRO_SERVER_PROFILES.filter(profile => profile.availability === 'available').map(profile => [profile.id, profile.packetver])).toEqual([
    ['lastro-3x', 20211103], ['lastro-2x', 20211103], ['lastro-app', 20211103],
  ]);
});

test('validates bridge v2 scheduler capabilities as part of the package id', async () => {
  const fixture = packageFixture('lastro-20211103', {}, 2);
  await expect(validateKoreManifest(fixture.manifest)).resolves.toMatchObject({
    bridgeApiVersion: 2,
    schedulerCapabilities: ['fourQueues', 'oneShotDeadline', 'recoverySnapshotV1', 'residentExecutor'],
  });
  await expect(validateKoreManifest({ ...fixture.manifest, schedulerCapabilities: ['residentExecutor'] }))
    .rejects.toThrow('incompatible-package');
});

test('renders selectable read-only textareas for status and Console output', () => {
  class FakeElement extends EventTarget {
    tagName: string;
    style: Record<string, string> = {};
    children: FakeElement[] = [];
    textContent = '';
    value = '';
    readOnly = false;
    rows = 0;
    wrap = '';
    type = '';
    constructor(tag: string) { super(); this.tagName = tag.toUpperCase(); }
    append(...nodes: FakeElement[]) { this.children.push(...nodes); }
    setAttribute() {}
    click() { this.dispatchEvent(new Event('click')); }
  }
  const document = { createElement: (tag: string) => new FakeElement(tag) } as unknown as Document;
  const cleared: string[] = [];
  const view = createKorePanel({ page: { document }, host: { clearConsole: () => cleared.push('cleared') } });
  expect((view.panel as HTMLDetailsElement).open).toBe(true);
  expect(view.panel.style.right).toBe('0');
  expect(view.panel.style.top).toBe('50%');
  expect(view.panel.style.transform).toBe('translateY(-50%)');
  expect(view.panel.style.width).toBe('840px');
  expect(view.panel.style.height).toBe('840px');
  expect(view.panel.style.maxWidth).toContain('100vw');
  expect(view.panel.style.maxHeight).toContain('100vh');
  expect(view.infoNode.tagName).toBe('TEXTAREA');
  expect(view.consoleNode.tagName).toBe('TEXTAREA');
  expect(view.infoNode.readOnly).toBe(true);
  expect(view.consoleNode.readOnly).toBe(true);
  view.update({
    status: 'runtime-ready', packageId: null, mode: null, tickCount: 0, elapsedMs: 0,
    profile: 'lastro-20211103', gameSessionId: null, connectionGeneration: 0, aiState: 'off',
    streamStatus: 'awaiting-sync',
    mapName: null, selfActor: null, visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
    receivedBytes: 12, worldReady: false, mapResourceState: 'idle',
    routeState: 'idle', routePreview: null,
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
    degradedReason: null, logs: [{ level: 'info', text: 'ready', timestamp: 0 }],
  });
  expect(view.infoNode.value).toContain('profile lastro-20211103');
  expect(view.consoleNode.value).toContain('[info] ready');
  view.clearButton.click();
  expect(cleared).toEqual(['cleared']);
});

test('Worker faults, post failures, stale responses and suspended probes stay isolated', async () => {
  vi.useFakeTimers();
  const fixture = packageFixture();
  const document = Object.assign(new EventTarget(), { hidden: false });
  let now = 100;
  const page = Object.assign(new EventTarget(), { location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    document, performance: { now: () => now }, setInterval, clearInterval, setTimeout, clearTimeout, crypto: globalThis.crypto });
  class ProbeWorker extends EventTarget {
    messages: Record<string, unknown>[] = [];
    terminated = false;
    failPost = false;
    postMessage(message: Record<string, unknown>) { if (this.failPost) throw Error('post failed'); this.messages.push(message); }
    terminate() { this.terminated = true; }
    reply(fields: Record<string, unknown>) { this.dispatchEvent(new MessageEvent('message', { data: fields })); }
  }
  let worker = new ProbeWorker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  const init = worker.messages[0]!;
  const ready = { ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off',
    capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } };
  worker.reply({ ...ready, runtimeSessionId: 'old-session' });
  expect(host.state.status).toBe('loading');
  worker.reply(ready);
  expect(host.state.status).toBe('runtime-ready');
  now += 1000; await vi.advanceTimersByTimeAsync(1000);
  const oldTick = worker.messages.at(-1)!;
  document.hidden = true; document.dispatchEvent(new Event('visibilitychange'));
  now += 60000; await vi.advanceTimersByTimeAsync(60000);
  expect(host.state.status).toBe('runtime-ready');
  document.hidden = false; document.dispatchEvent(new Event('visibilitychange'));
  worker.reply({ ...oldTick, type: 'tick', tickCount: 100, elapsedMs: 1 });
  expect(host.state.tickCount).toBe(0);
  now += 1000; await vi.advanceTimersByTimeAsync(1000);
  const tick = worker.messages.at(-1)!;
  worker.reply({ ...tick, type: 'tick', tickCount: 1, elapsedMs: 1000 });
  expect(host.state.tickCount).toBe(1);
  worker.dispatchEvent(new Event('error'));
  expect(host.state.status).toBe('failed');
  expect(worker.terminated).toBe(true);
  worker = new ProbeWorker();
  await host.start();
  worker.reply(ready);
  expect(host.state.status).toBe('loading');
  worker.reply({ ...ready, ...worker.messages[0], type: 'ready' });
  worker.failPost = true;
  now += 1000; await vi.advanceTimersByTimeAsync(1000);
  expect(host.state.status).toBe('failed');
  host.dispose();
  expect(host.state.status).toBe('disposed');
});

test('keeps M0 packages alive without sending M1 map stream messages', async () => {
  const fixture = packageFixture('lastro-2x');
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
  });
  class LegacyWorker extends EventTarget {
    messages: Record<string, unknown>[] = [];
    postMessage(message: Record<string, unknown>) { this.messages.push(message); }
    terminate() {}
    reply(fields: Record<string, unknown>) { this.dispatchEvent(new MessageEvent('message', { data: fields })); }
  }
  const worker = new LegacyWorker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  try {
    await host.start();
    const init = worker.messages[0]!;
    worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off',
      buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });

    expect(host.state.status).toBe('runtime-ready');
    expect(host.beginGameSession(77, 'prontera.gat')).toBeNull();
    expect(host.beginMapConnection()).toBeNull();
    expect(host.state.streamStatus).toBe('degraded');
    expect(host.state.worldReady).toBe(false);
    expect(worker.messages.map(message => message.type)).toEqual(['init']);
  } finally {
    host.dispose();
  }
});

test('initialization timeout starts bounded recovery without foreground AI polling', async () => {
  vi.useFakeTimers();
  const fixture = packageFixture();
  let now = 0;
  const page = Object.assign(new EventTarget(), { location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    document: Object.assign(new EventTarget(), { hidden: false }), performance: { now: () => now },
    setInterval, clearInterval, setTimeout, clearTimeout, crypto: globalThis.crypto });
  const messages: Record<string, unknown>[] = [];
  const worker = Object.assign(new EventTarget(), { postMessage(message: Record<string, unknown>) { messages.push(message); }, terminate() {} });
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  for (let i = 0; i < 11; i++) { now += 1000; await vi.advanceTimersByTimeAsync(1000); }
  expect(host.state.status).toBe('loading');
  expect(messages.filter(message => message.type === 'init').length).toBeGreaterThan(1);
  expect(messages.some(message => message.type === 'tick')).toBe(false);
  host.dispose();
});

test('copies map bytes from the active view and queues ordered events until runtime-ready', async () => {
  const fixture = packageFixture();
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
  });
  class TransferWorker extends EventTarget {
    messages: Record<string, unknown>[] = [];
    postMessage(message: Record<string, unknown>, transfer: Transferable[] = []) {
      this.messages.push(transfer.length ? structuredClone(message, { transfer }) : structuredClone(message));
    }
    terminate() {}
    reply(fields: Record<string, unknown>) { this.dispatchEvent(new MessageEvent('message', { data: fields })); }
  }
  const worker = new TransferWorker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  const streamHost = host as typeof host & {
    beginGameSession(gid: number, mapName: string): string;
    beginMapConnection(): number;
    mirrorMapData(generation: number, data: ArrayBuffer | ArrayBufferView): boolean;
  };
  await host.start();
  const gameSessionId = streamHost.beginGameSession(0x12345678, 'prontera.gat');
  const connectionGeneration = streamHost.beginMapConnection();
  if (connectionGeneration === null) throw new Error('map connection did not start');
  const backing = new Uint8Array([0xaa, 0x73, 0x00, 0x11, 0xbb]);
  const input = backing.subarray(1, 4);
  expect(streamHost.mirrorMapData(connectionGeneration, input)).toBe(true);
  expect([...backing]).toEqual([0xaa, 0x73, 0x00, 0x11, 0xbb]);
  expect(worker.messages).toHaveLength(1);

  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off',
    capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  expect(host.state.status).toBe('runtime-ready');
  expect(worker.messages.map(message => message.type)).toEqual(['init', 'beginGameSession', 'beginMapConnection', 'gameData']);
  const event = worker.messages[3]!;
  expect(event.runtimeSessionId).toBe(init.runtimeSessionId);
  expect(event.gameSessionId).toBe(gameSessionId);
  expect(event.connectionGeneration).toBe(connectionGeneration);
  expect(event.sequence).toBe(0);
  expect(event.byteOffset).toBe(0);
  expect(event.receivedAtMs).toBe(42);
  expect('requestId' in event).toBe(false);
  expect(Array.from(event.bytes as Uint8Array)).toEqual([0x73, 0x00, 0x11]);
  expect([...backing]).toEqual([0xaa, 0x73, 0x00, 0x11, 0xbb]);
  expect([...input]).toEqual([0x73, 0x00, 0x11]);
  const next = new Uint8Array([0x44, 0x55]);
  expect(streamHost.mirrorMapData(connectionGeneration, next)).toBe(true);
  expect(worker.messages[4]?.sequence).toBe(1);
  expect(worker.messages[4]?.byteOffset).toBe(3);
  const nextGeneration = streamHost.beginMapConnection();
  if (nextGeneration === null) throw new Error('replacement map connection did not start');
  expect(nextGeneration).toBe(connectionGeneration + 1);
  expect(streamHost.mirrorMapData(connectionGeneration, next)).toBe(false);
  expect(streamHost.mirrorMapData(nextGeneration, next)).toBe(true);
  expect(worker.messages.at(-1)?.sequence).toBe(0);
  expect(worker.messages.at(-1)?.byteOffset).toBe(0);
  host.dispose();
});

test('queues map events with the new runtime ID while package initialization is pending', async () => {
  const fixture = packageFixture();
  let releaseFetch!: () => void;
  const fetchGate = new Promise<void>(resolve => { releaseFetch = resolve; });
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' },
    fetch: async (url: URL | string) => { await fetchGate; return fixture.fetch(url); },
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
  });
  class TransferWorker extends EventTarget {
    messages: Record<string, unknown>[] = [];
    postMessage(message: Record<string, unknown>, transfer: Transferable[] = []) {
      this.messages.push(transfer.length ? structuredClone(message, { transfer }) : structuredClone(message));
    }
    terminate() {}
    reply(fields: Record<string, unknown>) { this.dispatchEvent(new MessageEvent('message', { data: fields })); }
  }
  const worker = new TransferWorker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  const start = host.start();
  host.beginGameSession(77, 'prontera.gat');
  const connectionGeneration = host.beginMapConnection();
  if (connectionGeneration === null) throw new Error('map connection did not start');
  expect(host.mirrorMapData(connectionGeneration, new Uint8Array([0x73, 0x00]))).toBe(true);

  releaseFetch();
  await start;
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off',
    capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  const event = worker.messages.find(message => message.type === 'gameData')!;
  expect(event.runtimeSessionId).toBe(init.runtimeSessionId);
  expect(worker.messages.map(message => message.type)).toEqual(['init', 'beginGameSession', 'beginMapConnection', 'gameData']);
  host.dispose();
});

test('startup queue overflow degrades only the current KE connection', async () => {
  const fixture = packageFixture();
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 1 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
  });
  class QueueWorker extends EventTarget {
    messages: Record<string, unknown>[] = [];
    postMessage(message: Record<string, unknown>, transfer: Transferable[] = []) {
      this.messages.push(transfer.length ? structuredClone(message, { transfer }) : structuredClone(message));
    }
    terminate() {}
    reply(fields: Record<string, unknown>) { this.dispatchEvent(new MessageEvent('message', { data: fields })); }
  }
  const worker = new QueueWorker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  const gameSessionId = host.beginGameSession(7, 'prontera.gat');
  const connectionGeneration = host.beginMapConnection();
  for (let index = 0; index < 256; index++) expect(host.mirrorMapData(connectionGeneration!, new Uint8Array([index]))).toBe(true);
  expect(host.mirrorMapData(connectionGeneration!, new Uint8Array([0xff]))).toBe(false);
  expect(host.state.status).toBe('loading');
  expect(host.state.streamStatus).toBe('degraded');
  expect(host.state.degradedReason).toBe('worker-startup-queue-overflow');
  worker.reply({ ...worker.messages[0], type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off',
    capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  expect(worker.messages.map(message => message.type)).toEqual(['init', 'beginGameSession', 'beginMapConnection', 'degradeConnection']);
  expect(worker.messages.some(message => message.type === 'gameData' && message.gameSessionId === gameSessionId)).toBe(false);
  host.dispose();
});

test('rejects a single oversized startup chunk before copying its bytes', async () => {
  const fixture = packageFixture();
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 1 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
  });
  class QueueWorker extends EventTarget {
    messages: Record<string, unknown>[] = [];
    postMessage(message: Record<string, unknown>, transfer: Transferable[] = []) {
      this.messages.push(transfer.length ? structuredClone(message, { transfer }) : structuredClone(message));
    }
    terminate() {}
  }
  const worker = new QueueWorker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  const streamHost = host as typeof host & {
    beginGameSession(gid: number, mapName: string): string;
    beginMapConnection(): number;
    mirrorMapData(generation: number, data: ArrayBuffer | ArrayBufferView): boolean;
  };
  await host.start();
  streamHost.beginGameSession(7, 'prontera.gat');
  const connectionGeneration = streamHost.beginMapConnection();
  if (connectionGeneration === null) throw new Error('map connection did not start');

  const copy = vi.spyOn(Uint8Array.prototype, 'slice');
  try {
    expect(streamHost.mirrorMapData(connectionGeneration, new Uint8Array(1024 * 1024 + 1))).toBe(false);
    expect(copy).not.toHaveBeenCalled();
  } finally {
    copy.mockRestore();
  }
  expect(host.state.streamStatus).toBe('degraded');
  expect(host.state.degradedReason).toBe('worker-startup-queue-overflow');
  host.dispose();
});

test('consumes current-generation world state and clears only the Console view', async () => {
  const fixture = packageFixture();
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
  });
  class StateWorker extends EventTarget {
    messages: Record<string, unknown>[] = [];
    postMessage(message: Record<string, unknown>) { this.messages.push(message); }
    terminate() {}
    reply(fields: Record<string, unknown>) { this.dispatchEvent(new MessageEvent('message', { data: fields })); }
  }
  const worker = new StateWorker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off',
    capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  const gameSessionId = host.beginGameSession(77, 'prontera.gat');
  const connectionGeneration = host.beginMapConnection();
  if (connectionGeneration === null || gameSessionId === null) throw new Error('game connection did not start');
  expect(host.mirrorMapData(connectionGeneration, new Uint8Array([0x73, 0x00]))).toBe(true);
  expect(host.state.receivedBytes).toBe(2);
  const worldState = {
    runtimeSessionId: init.runtimeSessionId, type: 'worldState', gameSessionId, connectionGeneration,
    profile: 'lastro-20211103', mapName: 'prontera.gat', characterGid: 77,
    selfActor: { gid: 77, x: 10, y: 11, targetX: 12, targetY: 13, kind: 'player' },
    visibleEntities: { total: 2, players: 1, monsters: 1, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 0x0073 },
    worldReady: true, streamStatus: 'world-ready', degradedReason: null,
  };
  expect('requestId' in worldState).toBe(false);
  worker.reply(worldState);
  expect(host.state.worldReady).toBe(true);
  expect(host.state.mapName).toBe('prontera.gat');
  expect(host.state.selfActor).toMatchObject({ gid: 77, x: 10, y: 11 });
  expect(host.state.visibleEntities).toMatchObject({ total: 2, players: 1, monsters: 1 });

  worker.reply({ ...worldState, connectionGeneration: connectionGeneration + 1, mapName: 'stale.gat' });
  expect(host.state.mapName).toBe('prontera.gat');
  host.clearConsole();
  expect(host.state.logs).toHaveLength(0);
  expect(host.state.worldReady).toBe(true);
  expect(host.state.mapName).toBe('prontera.gat');

  worker.reply({ ...worldState, worldReady: false, streamStatus: 'degraded', selfActor: null, degradedReason: 'sequence-gap' });
  expect(host.state.streamStatus).toBe('degraded');
  expect(host.state.degradedReason).toBe('sequence-gap');
  expect(host.state.logs.at(-1)?.text).toContain('sequence-gap');
  host.dispose();
  expect(host.state.status).toBe('disposed');
  expect(host.state.gameSessionId).toBeNull();
  expect(host.state.connectionGeneration).toBeNull();
  expect(host.state.streamStatus).toBe('idle');
  expect(host.state.mapName).toBeNull();
  expect(host.state.selfActor).toBeNull();
  expect(host.state.visibleEntities).toEqual({ total: 0, players: 0, monsters: 0, other: 0, unknown: 0 });
  expect(host.state.receivedBytes).toBe(0);
  expect(host.state.degradedReason).toBeNull();
  expect(host.state.worldReady).toBe(false);
  const logCount = host.state.logs.length;
  await host.start();
  expect(host.state.logs.slice(logCount).some(entry => entry.level === 'warn')).toBe(true);
  host.dispose();
});
