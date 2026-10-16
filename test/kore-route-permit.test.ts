/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { packageFixture } from './kore-fixture';

function worldReady(runtimeSessionId: string, gameSessionId: string | null, connectionGeneration: number, mapName = 'prontera.gat') {
  return {
    runtimeSessionId, type: 'worldState', gameSessionId, connectionGeneration,
    profile: 'lastro-20211103', streamStatus: 'world-ready', worldReady: true, mapName,
    selfActor: { gid: 7, x: 10, y: 11, kind: 'self' },
    visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 1 },
  };
}

test('route go issues only generation-bound native actions and cancel rejects late actions', async () => {
  const fixture = packageFixture();
  const sent: any[] = [];
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
    KoreEngineNativeRouteAction: (action: any) => { sent.push(action); return true; },
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    postMessage(message: any) { this.messages.push(message); }
    terminate() {}
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new Worker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker,
    mapResourceProvider: {
      handleResourceRequest: async (message: any) => ({ requestId: message.requestId, result: { kind: 'error', code: 'unused', message: 'unused' } }),
      handleResourceValidation: async (message: any) => ({ requestId: message.requestId, sourceRequestId: message.sourceRequestId, committedFiles: [], deletedFiles: [] }),
      close: async () => undefined,
    } });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  host.beginGameSession(7, 'prontera.gat');
  const generation = host.beginMapConnection();
  expect(generation).toBe(0);
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'prontera' });
  worker.reply(worldReady(init.runtimeSessionId, host.state.gameSessionId, generation!));
  expect(host.debugRoutePreview({ actions: [] })).toBe(true);
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'routePreview', route: [], canSend: false });
  expect(host.state.status).toBe('runtime-ready');
  expect(host.debugRouteGo({ actions: [{ type: 'MoveTo', x: 12, y: 13, expectedMap: 'prontera' }] })).toBe(true);
  const go = worker.messages.find(message => message.type === 'debugRouteGo');
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'routeAction', requestId: 700,
    action: { runtimeSessionId: init.runtimeSessionId, gameSessionId: host.state.gameSessionId, connectionGeneration: generation,
      controlGeneration: go.controlGeneration, routeId: go.routeId, requestId: 1, type: 'MoveTo', x: 12, y: 13, expectedMap: 'prontera' } });
  expect(sent).toHaveLength(1);
  expect(sent[0]).toMatchObject({ type: 'MoveTo', x: 12, y: 13, expectedMap: 'prontera' });
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'routeState', routeId: go.routeId, state: 'completed' });
  expect(host.state.status).toBe('runtime-ready');
  expect(host.debugRouteCancel()).toBe(false);
  expect(host.debugRouteGo({ actions: [{ type: 'MoveTo', x: 14, y: 15, expectedMap: 'prontera' }] })).toBe(true);
  const secondGo = worker.messages.filter(message => message.type === 'debugRouteGo').at(-1);
  expect(secondGo).toBeTruthy();
  expect(host.beginMapConnection()).toBe(1);
  expect(host.debugRouteCancel()).toBe(false);
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'routeAction', requestId: 701,
    action: { runtimeSessionId: init.runtimeSessionId, gameSessionId: host.state.gameSessionId, connectionGeneration: generation,
      controlGeneration: secondGo.controlGeneration, routeId: secondGo.routeId, requestId: 2, type: 'MoveTo', x: 14, y: 15, expectedMap: 'prontera' } });
  expect(sent).toHaveLength(1);
  host.dispose();
});

test('native route rejection revokes the current route permit', async () => {
  const fixture = packageFixture();
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
    KoreEngineNativeRouteAction: () => false,
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    postMessage(message: any) { this.messages.push(message); }
    terminate() {}
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new Worker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker,
    mapResourceProvider: {
      handleResourceRequest: async (message: any) => ({ requestId: message.requestId, result: { kind: 'error', code: 'unused', message: 'unused' } }),
      handleResourceValidation: async (message: any) => ({ requestId: message.requestId, sourceRequestId: message.sourceRequestId, committedFiles: [], deletedFiles: [] }),
      close: async () => undefined,
    } });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  host.beginGameSession(7, 'prontera.gat');
  const generation = host.beginMapConnection();
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'prontera' });
  worker.reply(worldReady(init.runtimeSessionId, host.state.gameSessionId, generation!));
  expect(host.debugRouteGo({ actions: [{ type: 'MoveTo', x: 12, y: 13, expectedMap: 'prontera' }] })).toBe(true);
  const go = worker.messages.find(message => message.type === 'debugRouteGo');
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'routeAction', requestId: 700,
    action: { runtimeSessionId: init.runtimeSessionId, gameSessionId: host.state.gameSessionId, connectionGeneration: generation,
      controlGeneration: go.controlGeneration, routeId: go.routeId, requestId: 1, type: 'MoveTo', x: 12, y: 13, expectedMap: 'prontera' } });
  expect(host.debugRouteCancel()).toBe(false);
  host.dispose();
});

test('private AirShip waits for the expected map before resuming the route', async () => {
  const fixture = packageFixture();
  const sent: any[] = [];
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
    KoreEngineNativeRouteAction: (action: any) => { sent.push(action); return true; },
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    postMessage(message: any) { this.messages.push(message); }
    terminate() {}
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new Worker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker,
    mapResourceProvider: {
      handleResourceRequest: async (message: any) => ({ requestId: message.requestId, result: { kind: 'error', code: 'unused', message: 'unused' } }),
      handleResourceValidation: async (message: any) => ({ requestId: message.requestId, sourceRequestId: message.sourceRequestId, committedFiles: [], deletedFiles: [] }),
      close: async () => undefined,
    } });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  host.beginGameSession(7, 'prontera.gat');
  const firstGeneration = host.beginMapConnection();
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'prontera' });
  worker.reply(worldReady(init.runtimeSessionId, host.state.gameSessionId, firstGeneration!));
  expect(host.debugRouteGo({ actions: [
    { type: 'PrivateAirship', destinationId: 'izlude', expectedMap: 'izlude' },
    { type: 'MoveTo', x: 20, y: 21, expectedMap: 'izlude' },
  ] })).toBe(true);
  const go = worker.messages.find(message => message.type === 'debugRouteGo');
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'routeAction', requestId: 700,
    action: { runtimeSessionId: init.runtimeSessionId, gameSessionId: host.state.gameSessionId, connectionGeneration: firstGeneration,
      controlGeneration: go.controlGeneration, routeId: go.routeId, requestId: 1, type: 'PrivateAirship', destinationId: 'izlude', expectedMap: 'izlude' } });
  expect(sent).toHaveLength(1);
  expect(host.state.routeState).toBe('awaiting-map');
  worker.reply(worldReady(init.runtimeSessionId, host.state.gameSessionId, firstGeneration!, 'prontera.gat'));
  expect(worker.messages.find(message => message.type === 'routeMapConfirmed')).toBeUndefined();

  expect(host.beginMapConnection()).toBe(1);
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'worldState', gameSessionId: host.state.gameSessionId, connectionGeneration: 1,
    profile: 'lastro-20211103', streamStatus: 'world-ready', worldReady: true, mapName: 'izlude.gat',
    selfActor: { gid: 7, x: 10, y: 11, kind: 'self' },
    visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 1 } });
  expect(worker.messages.find(message => message.type === 'routeMapConfirmed')).toBeUndefined();
  expect(host.handleAirshipResponse(0)).toBe(true);
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'izlude' });
  expect(worker.messages.find(message => message.type === 'routeMapConfirmed')).toMatchObject({ expectedMap: 'izlude', connectionGeneration: 1 });
  expect(host.debugRouteCancel()).toBe(true);
  host.dispose();
});

test('AirShip response rejection revokes the permit without allowing a retry action', async () => {
  const fixture = packageFixture();
  const sent: any[] = [];
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
    KoreEngineNativeRouteAction: (action: any) => { sent.push(action); return true; },
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    postMessage(message: any) { this.messages.push(message); }
    terminate() {}
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new Worker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker,
    mapResourceProvider: {
      handleResourceRequest: async (message: any) => ({ requestId: message.requestId, result: { kind: 'error', code: 'unused', message: 'unused' } }),
      handleResourceValidation: async (message: any) => ({ requestId: message.requestId, sourceRequestId: message.sourceRequestId, committedFiles: [], deletedFiles: [] }),
      close: async () => undefined,
    } });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  host.beginGameSession(7, 'prontera.gat');
  const generation = host.beginMapConnection();
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'prontera' });
  worker.reply(worldReady(init.runtimeSessionId, host.state.gameSessionId, generation!));
  expect(host.debugRouteGo({ actions: [{ type: 'PrivateAirship', destinationId: 'izlude', expectedMap: 'izlude' }] })).toBe(true);
  const go = worker.messages.find(message => message.type === 'debugRouteGo');
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'routeAction', requestId: 700,
    action: { runtimeSessionId: init.runtimeSessionId, gameSessionId: host.state.gameSessionId, connectionGeneration: generation,
      controlGeneration: go.controlGeneration, routeId: go.routeId, requestId: 1, type: 'PrivateAirship', destinationId: 'izlude', expectedMap: 'izlude' } });
  expect(sent).toHaveLength(1);
  expect(host.handleAirshipResponse(3)).toBe(true);
  expect(host.state.routeState).toBe('failed');
  expect(host.debugRouteCancel()).toBe(false);
  host.dispose();
});

test('map retry cancels the Worker route with its route id', async () => {
  const fixture = packageFixture();
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    postMessage(message: any) { this.messages.push(message); }
    terminate() {}
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new Worker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker,
    mapResourceProvider: {
      handleResourceRequest: async (message: any) => ({ requestId: message.requestId, result: { kind: 'error', code: 'unused', message: 'unused' } }),
      handleResourceValidation: async (message: any) => ({ requestId: message.requestId, sourceRequestId: message.sourceRequestId, committedFiles: [], deletedFiles: [] }),
      close: async () => undefined,
    } });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  host.beginGameSession(7, 'prontera.gat');
  const generation = host.beginMapConnection();
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'prontera' });
  worker.reply(worldReady(init.runtimeSessionId, host.state.gameSessionId, generation!));
  expect(host.debugRouteGo({ actions: [{ type: 'MoveTo', x: 12, y: 13, expectedMap: 'prontera' }] })).toBe(true);
  const go = worker.messages.find(message => message.type === 'debugRouteGo');
  expect(host.debugMapRetry()).toBe(true);
  expect(worker.messages.find(message => message.type === 'debugRouteCancel')).toMatchObject({ routeId: go.routeId });
  host.dispose();
});


test('parser degraded state revokes the route permit before accepting late actions', async () => {
  const fixture = packageFixture();
  const sent: any[] = [];
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
    KoreEngineNativeRouteAction: (action: any) => { sent.push(action); return true; },
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    postMessage(message: any) { this.messages.push(message); }
    terminate() {}
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new Worker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker,
    mapResourceProvider: {
      handleResourceRequest: async (message: any) => ({ requestId: message.requestId, result: { kind: 'error', code: 'unused', message: 'unused' } }),
      handleResourceValidation: async (message: any) => ({ requestId: message.requestId, sourceRequestId: message.sourceRequestId, committedFiles: [], deletedFiles: [] }),
      close: async () => undefined,
    } });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  host.beginGameSession(7, 'prontera.gat');
  const generation = host.beginMapConnection();
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'prontera' });
  worker.reply(worldReady(init.runtimeSessionId, host.state.gameSessionId, generation!));
  expect(host.debugRouteGo({ actions: [{ type: 'MoveTo', x: 12, y: 13, expectedMap: 'prontera' }] })).toBe(true);
  const go = worker.messages.find(message => message.type === 'debugRouteGo');
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'worldState', gameSessionId: host.state.gameSessionId,
    connectionGeneration: generation, profile: 'lastro-20211103', streamStatus: 'degraded', worldReady: false,
    mapName: 'prontera.gat', selfActor: null, degradedReason: 'parser-degraded',
    visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 1 } });
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'routeAction', requestId: 700,
    action: { runtimeSessionId: init.runtimeSessionId, gameSessionId: host.state.gameSessionId, connectionGeneration: generation,
      controlGeneration: go.controlGeneration, routeId: go.routeId, requestId: 1, type: 'MoveTo', x: 12, y: 13, expectedMap: 'prontera' } });
  expect(sent).toHaveLength(0);
  expect(host.state.routeState).toBe('failed');
  host.dispose();
});

test('AirShip map sync waits for an explicit successful native response', async () => {
  const fixture = packageFixture();
  const sent: any[] = [];
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
    KoreEngineNativeRouteAction: (action: any) => { sent.push(action); return true; },
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    postMessage(message: any) { this.messages.push(message); }
    terminate() {}
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new Worker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker,
    mapResourceProvider: {
      handleResourceRequest: async (message: any) => ({ requestId: message.requestId, result: { kind: 'error', code: 'unused', message: 'unused' } }),
      handleResourceValidation: async (message: any) => ({ requestId: message.requestId, sourceRequestId: message.sourceRequestId, committedFiles: [], deletedFiles: [] }),
      close: async () => undefined,
    } });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  host.beginGameSession(7, 'prontera.gat');
  const firstGeneration = host.beginMapConnection();
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'prontera' });
  worker.reply(worldReady(init.runtimeSessionId, host.state.gameSessionId, firstGeneration!));
  expect(host.debugRouteGo({ actions: [{ type: 'PrivateAirship', destinationId: 'izlude', expectedMap: 'izlude' }] })).toBe(true);
  const go = worker.messages.find(message => message.type === 'debugRouteGo');
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'routeAction', requestId: 700,
    action: { runtimeSessionId: init.runtimeSessionId, gameSessionId: host.state.gameSessionId, connectionGeneration: firstGeneration,
      controlGeneration: go.controlGeneration, routeId: go.routeId, requestId: 1, type: 'PrivateAirship', destinationId: 'izlude', expectedMap: 'izlude' } });
  expect(sent).toHaveLength(1);
  expect(host.beginMapConnection()).toBe(1);
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'worldState', gameSessionId: host.state.gameSessionId, connectionGeneration: 1,
    profile: 'lastro-20211103', streamStatus: 'world-ready', worldReady: true, mapName: 'izlude.gat',
    selfActor: { gid: 7, x: 10, y: 11, kind: 'self' },
    visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 1 } });
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'izlude' });
  expect(worker.messages.find(message => message.type === 'routeMapConfirmed')).toBeUndefined();
  expect(host.handleAirshipResponse(0)).toBe(true);
  expect(worker.messages.find(message => message.type === 'routeMapConfirmed')).toMatchObject({ expectedMap: 'izlude', connectionGeneration: 1 });
  host.dispose();
});
