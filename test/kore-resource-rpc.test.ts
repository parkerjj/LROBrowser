/* eslint-disable @typescript-eslint/no-explicit-any */
import 'fake-indexeddb/auto';
import { expect, test } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { createMapResourceProvider, FIELD_PACK_VERSION } from '../src/kore/map-resource-provider.mjs';
import { packageFixture } from './kore-fixture';

test('routes map resource RPC through Host validation and keeps resource state separate', async () => {
  const fixture = packageFixture();
  const provider = {
    handleResourceRequest: async (message: any) => ({
      requestId: message.requestId,
      result: {
        kind: 'fieldMap' as const,
        files: [{ role: 'field' as const, relativePath: 'EP15.1/prontera.fld2', sha256: 'a'.repeat(64), encoding: 'identity' as const, bytes: new Uint8Array([1, 2]).buffer }],
      },
    }),
    handleResourceValidation: async (message: any) => ({
      requestId: message.requestId,
      sourceRequestId: message.sourceRequestId,
      committedFiles: message.acceptedFiles,
      deletedFiles: [],
    }),
    close: async () => undefined,
  };
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
  });
  class ResourceWorker extends EventTarget {
    messages: Record<string, any>[] = [];
    postMessage(message: Record<string, any>) { this.messages.push(message); }
    terminate() {}
    reply(message: Record<string, any>) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new ResourceWorker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker, mapResourceProvider: provider });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  const gameSessionId = host.beginGameSession(7, 'prontera.gat');
  const generation = host.beginMapConnection();
  expect(gameSessionId).toBeTruthy();
  expect(generation).toBe(0);
  const requestId = 900;
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'resourceRequest', requestId, resourceType: 'fieldMap', mapName: 'prontera.gat', baseName: 'prontera', serverFieldsFolder: 'EP15.1', fieldpackVersion: '2.0.5', attempt: 0, cacheMode: 'prefer' });
  await Promise.resolve();
  const result = worker.messages.find(message => message.type === 'resourceResult');
  expect(result).toMatchObject({ requestId, result: { kind: 'fieldMap' } });
  expect(host.state.mapResourceState).toBe('loading');

  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'resourceValidation', requestId: 901, sourceRequestId: requestId,
    fieldRelativePath: 'EP15.1/prontera.fld2', acceptedFiles: ['EP15.1/prontera.fld2'], rejectedFiles: [] });
  await Promise.resolve();
  expect(worker.messages.find(message => message.type === 'resourceValidationResult')).toMatchObject({ sourceRequestId: requestId, committedFiles: ['EP15.1/prontera.fld2'] });
  expect(host.state.mapResourceState).toBe('loading');
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'prontera' });
  expect(host.state.mapResourceState).toBe('ready');

  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'degraded', mapName: 'prontera', reason: 'resource-retries-exhausted' });
  expect(host.state.mapResourceState).toBe('degraded');
  expect(host.state.status).toBe('runtime-ready');
  host.dispose();
});

test('keeps pending resource bytes intact when the Host transfers a Worker copy', async () => {
  const databaseName = 'kore-resource-rpc-transfer-test';
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
  const fixture = packageFixture();
  const fieldBytes = new Uint8Array([2, 0, 2, 0, 1, 1, 1, 1]);
  const provider = createMapResourceProvider({
    databaseName,
    indexedDBFactory: indexedDB,
    fetchImpl: async () => new Response(fieldBytes, { status: 200 }),
  });
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch, indexedDB,
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
  });
  class TransferWorker extends EventTarget {
    messages: Record<string, any>[] = [];
    postMessage(message: Record<string, any>, transfer: Transferable[] = []) {
      this.messages.push(structuredClone(message, { transfer }));
    }
    terminate() {}
    reply(message: Record<string, any>) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new TransferWorker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker, mapResourceProvider: provider });
  try {
    await host.start();
    const init = worker.messages[0]!;
    worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
      buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
    host.beginGameSession(7, 'prontera.gat');
    host.beginMapConnection();
    const requestId = 900;
    worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'resourceRequest', requestId, resourceType: 'fieldMap', mapName: 'prontera.gat', baseName: 'prontera', serverFieldsFolder: 'EP15.1', fieldpackVersion: FIELD_PACK_VERSION, attempt: 0, cacheMode: 'prefer' });
    await new Promise(resolve => setTimeout(resolve, 25));
    const result = worker.messages.find(message => message.type === 'resourceResult');
    expect(result, JSON.stringify(worker.messages)).toBeTruthy();
    if (!result || result.result.kind !== 'fieldMap') throw new Error('expected field map resource result');
    expect(result.result.files[0]?.bytes.byteLength).toBe(fieldBytes.byteLength);
    worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'resourceValidation', requestId: 901, sourceRequestId: requestId,
      acceptedFiles: ['EP15.1/prontera.fld2'], rejectedFiles: [] });
    await new Promise(resolve => setTimeout(resolve, 0));

    const offline = createMapResourceProvider({ databaseName, indexedDBFactory: indexedDB, fetchImpl: async () => { throw Error('offline'); } });
    const cached = await offline.handleResourceRequest({ requestId: 902, resourceType: 'fieldMap', mapName: 'prontera', baseName: 'prontera', serverFieldsFolder: 'EP15.1', fieldpackVersion: FIELD_PACK_VERSION, attempt: 0, cacheMode: 'prefer' });
    expect(cached.result.kind).toBe('fieldMap');
    if (cached.result.kind === 'fieldMap') expect(cached.result.files[0]?.bytes.byteLength).toBe(fieldBytes.byteLength);
    await offline.close();
  } finally {
    host.dispose();
    await provider.close();
    await new Promise<void>(resolve => {
      const request = indexedDB.deleteDatabase(databaseName);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  }
});
