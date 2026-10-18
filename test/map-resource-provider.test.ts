import { afterEach, beforeEach, expect, test } from 'vitest';
import { gzipSync } from 'node:zlib';
import 'fake-indexeddb/auto';
import {
  FIELD_PACK_VERSION,
  createMapResourceProvider,
} from '../src/kore/map-resource-provider.mjs';

const databaseName = 'kore-map-resource-test';
const fieldBytes = Uint8Array.from([2, 0, 2, 0, 1, 1, 1, 1]);
const providers: Array<{ close(): Promise<void> }> = [];

async function deleteDatabase() {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

beforeEach(deleteDatabase);
afterEach(async () => {
  await Promise.all(providers.splice(0).map(provider => provider.close()));
  await deleteDatabase();
});

test('tries server .fld2 then .fld2.gz before global candidates', async () => {
  const calls: string[] = [];
  const provider = createMapResourceProvider({
    databaseName,
    fetchImpl: async (url: URL) => {
      calls.push(url.pathname);
      if (url.pathname.endsWith('/EP15.1/prontera.fld2.gz')) {
        return new Response(gzipSync(fieldBytes), { status: 200 });
      }
      return new Response(null, { status: 404 });
    },
    retryDelaysMs: [],
  });
  providers.push(provider);

  const result = await provider.handleResourceRequest({
    requestId: 1,
    resourceType: 'fieldMap',
    mapName: 'prontera.gat',
    baseName: 'prontera',
    serverFieldsFolder: 'EP15.1',
    fieldpackVersion: FIELD_PACK_VERSION,
    attempt: 0,
    cacheMode: 'prefer',
  });

  expect(calls).toEqual([
    '/ke/map/fieldpack-2.0.5/EP15.1/prontera.fld2',
    '/ke/map/fieldpack-2.0.5/EP15.1/prontera.fld2.gz',
  ]);
  expect(result.result.kind).toBe('fieldMap');
  if (result.result.kind !== 'fieldMap') throw new Error('expected field map');
  expect(result.result.files[0]).toMatchObject({
    role: 'field',
    relativePath: 'EP15.1/prontera.fld2.gz',
    encoding: 'gzip',
  });
});

test('fetches optional dist and weight files beside the selected field file', async () => {
  const calls: string[] = [];
  const provider = createMapResourceProvider({
    databaseName: 'kore-map-resource-aux-test',
    fetchImpl: async (url: URL) => {
      calls.push(url.pathname);
      if (url.pathname.endsWith('/EP15.1/prontera.fld2')) return new Response(fieldBytes, { status: 200 });
      if (url.pathname.endsWith('/EP15.1/prontera.dist')) return new Response(fieldBytes, { status: 200 });
      if (url.pathname.endsWith('/EP15.1/prontera.weight.gz')) return new Response(gzipSync(fieldBytes), { status: 200 });
      return new Response(null, { status: 404 });
    },
  });
  providers.push(provider);
  const result = await provider.handleResourceRequest({
    requestId: 19, resourceType: 'fieldMap', mapName: 'prontera', baseName: 'prontera', serverFieldsFolder: 'EP15.1',
    fieldpackVersion: FIELD_PACK_VERSION, attempt: 0, cacheMode: 'network', includeAuxiliary: true,
  });
  expect(result.result.kind).toBe('fieldMap');
  if (result.result.kind === 'fieldMap') expect(result.result.files.map(file => file.role)).toEqual(['field', 'dist', 'weight']);
  expect(calls).toContain('/ke/map/fieldpack-2.0.5/EP15.1/prontera.dist');
  expect(calls).toContain('/ke/map/fieldpack-2.0.5/EP15.1/prontera.weight.gz');
});

test('persists only worker-accepted bytes and serves them offline', async () => {
  let fetchCount = 0;
  const provider = createMapResourceProvider({
    databaseName,
    fetchImpl: async () => {
      fetchCount += 1;
      return new Response(fieldBytes, { status: 200 });
    },
    retryDelaysMs: [],
  });
  providers.push(provider);
  const request = {
    requestId: 2,
    resourceType: 'fieldMap' as const,
    mapName: 'prontera',
    baseName: 'prontera',
    serverFieldsFolder: 'EP15.1',
    fieldpackVersion: FIELD_PACK_VERSION,
    attempt: 0,
    cacheMode: 'prefer' as const,
  };
  const first = await provider.handleResourceRequest(request);
  expect(fetchCount).toBe(1);
  await provider.handleResourceValidation({
    requestId: 3,
    sourceRequestId: 2,
    acceptedFiles: ['EP15.1/prontera.fld2'],
    rejectedFiles: [],
  });

  const offline = createMapResourceProvider({
    databaseName,
    fetchImpl: async () => { throw new Error('offline'); },
    retryDelaysMs: [],
  });
  providers.push(offline);
  const second = await offline.handleResourceRequest({ ...request, requestId: 4 });
  expect(fetchCount).toBe(1);
  expect(second.result.kind).toBe('fieldMap');
  expect(first.result.kind).toBe('fieldMap');
});

test('deletes a rejected cache entry and forces the next request to network', async () => {
  let fetchCount = 0;
  const provider = createMapResourceProvider({
    databaseName,
    fetchImpl: async () => {
      fetchCount += 1;
      return new Response(fieldBytes, { status: 200 });
    },
    retryDelaysMs: [],
  });
  providers.push(provider);
  const request = {
    requestId: 5,
    resourceType: 'fieldMap' as const,
    mapName: 'prontera',
    baseName: 'prontera',
    serverFieldsFolder: 'EP15.1',
    fieldpackVersion: FIELD_PACK_VERSION,
    attempt: 0,
    cacheMode: 'prefer' as const,
  };
  await provider.handleResourceRequest(request);
  await provider.handleResourceValidation({
    requestId: 6,
    sourceRequestId: 5,
    acceptedFiles: [],
    rejectedFiles: [{ relativePath: 'EP15.1/prontera.fld2', reason: 'length-mismatch' }],
  });
  const result = await provider.handleResourceRequest({ ...request, requestId: 7 });
  expect(fetchCount).toBe(2);
  expect(result.result.kind).toBe('fieldMap');
});

test('deletes a rejected cache hit before a network retry', async () => {
  let fetchCount = 0;
  const provider = createMapResourceProvider({
    databaseName,
    fetchImpl: async () => {
      fetchCount += 1;
      return new Response(fieldBytes, { status: 200 });
    },
    retryDelaysMs: [],
  });
  providers.push(provider);
  const request = {
    requestId: 8,
    resourceType: 'fieldMap' as const,
    mapName: 'prontera',
    baseName: 'prontera',
    serverFieldsFolder: 'EP15.1',
    fieldpackVersion: FIELD_PACK_VERSION,
    attempt: 0,
    cacheMode: 'prefer' as const,
  };
  await provider.handleResourceRequest(request);
  await provider.handleResourceValidation({ requestId: 9, sourceRequestId: 8, acceptedFiles: ['EP15.1/prontera.fld2'], rejectedFiles: [] });
  const cacheHit = await provider.handleResourceRequest({ ...request, requestId: 10 });
  expect(cacheHit.result.kind).toBe('fieldMap');
  await provider.handleResourceValidation({ requestId: 11, sourceRequestId: 10, acceptedFiles: [], rejectedFiles: [{ relativePath: 'EP15.1/prontera.fld2', reason: 'gzip-error' }] });
  await provider.handleResourceRequest({ ...request, requestId: 12 });
  expect(fetchCount).toBe(2);
});

test('rejects a fetched object when its expected SHA-256 does not match', async () => {
  const provider = createMapResourceProvider({
    databaseName,
    fetchImpl: async () => new Response(fieldBytes, { status: 200 }),
    expectedSha256: { 'EP15.1/prontera.fld2': '0'.repeat(64) },
    retryDelaysMs: [],
  });
  providers.push(provider);
  const result = await provider.handleResourceRequest({
    requestId: 13,
    resourceType: 'fieldMap',
    mapName: 'prontera',
    baseName: 'prontera',
    serverFieldsFolder: 'EP15.1',
    fieldpackVersion: FIELD_PACK_VERSION,
    attempt: 0,
    cacheMode: 'prefer',
  });
  expect(result.result).toMatchObject({ kind: 'error', code: 'sha256-mismatch' });
});

test('rejects a tampered cached object before serving it offline', async () => {
  const database = 'kore-map-resource-cache-integrity-test';
  const valid = Uint8Array.from([2, 0, 2, 0, 1, 1, 1, 1]);
  const tampered = Uint8Array.from([2, 0, 2, 0, 1, 1, 1, 0]);
  let fetchCount = 0;
  const provider = createMapResourceProvider({
    databaseName: database,
    fetchImpl: async () => { fetchCount += 1; return new Response(valid, { status: 200 }); },
    expectedSha256: { 'EP15.1/prontera.fld2': '0'.repeat(64) },
  });
  providers.push(provider);
  const request = {
    requestId: 14, resourceType: 'fieldMap' as const, mapName: 'prontera', baseName: 'prontera',
    serverFieldsFolder: 'EP15.1', fieldpackVersion: FIELD_PACK_VERSION, attempt: 0, cacheMode: 'prefer' as const,
  };
  const cache = await provider.handleResourceRequest({ ...request, requestId: 15 });
  expect(cache.result.kind).toBe('error');
  expect(fetchCount).toBeGreaterThan(0);
  await provider.handleResourceValidation({ requestId: 16, sourceRequestId: 15, acceptedFiles: [], rejectedFiles: [] });

  const offline = createMapResourceProvider({ databaseName: database, fetchImpl: async () => { throw Error('offline'); } });
  providers.push(offline);
  const databaseHandle = await new Promise<IDBDatabase>((resolve, reject) => {
    const open = indexedDB.open(database, 1);
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
  await new Promise<void>((resolve, reject) => {
    const put = databaseHandle.transaction('maps', 'readwrite').objectStore('maps').put({
      key: '2.0.5:EP15.1/prontera.fld2', version: FIELD_PACK_VERSION, relativePath: 'EP15.1/prontera.fld2',
      sha256: '0'.repeat(64), encoding: 'identity', bytes: tampered.buffer, savedAt: Date.now(),
    });
    put.onsuccess = () => resolve();
    put.onerror = () => reject(put.error);
  });
  databaseHandle.close();
  const result = await offline.handleResourceRequest({ ...request, requestId: 17 });
  expect(result.result).toMatchObject({ kind: 'error', code: 'offline' });
});

test('prefers the bundled fieldpack before the network root', async () => {
  const calls: string[] = [];
  const provider = createMapResourceProvider({
    databaseName: 'kore-map-resource-local-first-test',
    page: { location: { origin: 'https://app.test' } },
    fetchImpl: async (url: URL) => {
      calls.push(url.href);
      if (url.origin === 'https://app.test' && url.pathname.endsWith('/EP15.1/prontera.fld2.gz')) {
        return new Response(gzipSync(fieldBytes), { status: 200 });
      }
      return new Response(null, { status: 404 });
    },
    retryDelaysMs: [],
  });
  providers.push(provider);

  const result = await provider.handleResourceRequest({
    requestId: 21,
    resourceType: 'fieldMap',
    mapName: 'prontera',
    baseName: 'prontera',
    serverFieldsFolder: 'EP15.1',
    fieldpackVersion: FIELD_PACK_VERSION,
    attempt: 0,
    cacheMode: 'prefer',
  });

  expect(result.result.kind).toBe('fieldMap');
  expect(calls).toEqual([
    'https://app.test/ke/map/fieldpack-2.0.5/EP15.1/prontera.fld2',
    'https://rodata.ltsd.ro/ke/map/fieldpack-2.0.5/EP15.1/prontera.fld2',
    'https://app.test/ke/map/fieldpack-2.0.5/EP15.1/prontera.fld2.gz',
  ]);
});

test('falls back to the network root when the bundled fieldpack misses', async () => {
  const calls: string[] = [];
  const provider = createMapResourceProvider({
    databaseName: 'kore-map-resource-local-fallback-test',
    resourceRoots: ['https://app.test', 'https://rodata.test'],
    fetchImpl: async (url: URL) => {
      calls.push(url.href);
      if (url.origin === 'https://rodata.test' && url.pathname.endsWith('/EP15.1/prontera.fld2.gz')) {
        return new Response(gzipSync(fieldBytes), { status: 200 });
      }
      return new Response(null, { status: 404 });
    },
    retryDelaysMs: [],
  });
  providers.push(provider);

  const result = await provider.handleResourceRequest({
    requestId: 22,
    resourceType: 'fieldMap',
    mapName: 'prontera',
    baseName: 'prontera',
    serverFieldsFolder: 'EP15.1',
    fieldpackVersion: FIELD_PACK_VERSION,
    attempt: 0,
    cacheMode: 'prefer',
  });

  expect(result.result.kind).toBe('fieldMap');
  expect(calls).toEqual([
    'https://app.test/ke/map/fieldpack-2.0.5/EP15.1/prontera.fld2',
    'https://rodata.test/ke/map/fieldpack-2.0.5/EP15.1/prontera.fld2',
    'https://app.test/ke/map/fieldpack-2.0.5/EP15.1/prontera.fld2.gz',
    'https://rodata.test/ke/map/fieldpack-2.0.5/EP15.1/prontera.fld2.gz',
  ]);
});

test('turns a hanging fetch into a retryable timeout error', async () => {
  const provider = createMapResourceProvider({
    databaseName: 'kore-map-resource-timeout-test',
    requestTimeoutMs: 1,
    fetchImpl: async (_url: URL, options: RequestInit) => await new Promise<Response>((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true });
    }),
  });
  providers.push(provider);
  const result = await provider.handleResourceRequest({
    requestId: 18, resourceType: 'fieldMap', mapName: 'prontera', baseName: 'prontera', serverFieldsFolder: 'EP15.1',
    fieldpackVersion: FIELD_PACK_VERSION, attempt: 0, cacheMode: 'network',
  });
  expect(result.result).toMatchObject({ kind: 'error', code: 'network-timeout' });
});


test('times out a response whose headers arrived but body read hangs', async () => {
  const provider = createMapResourceProvider({
    databaseName: 'kore-map-resource-body-timeout-test',
    requestTimeoutMs: 5,
    fetchImpl: async (_url: URL, options: RequestInit) => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/octet-stream' }),
      arrayBuffer: () => new Promise<ArrayBuffer>((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true });
      }),
    } as Response),
  });
  providers.push(provider);
  const pending = provider.handleResourceRequest({
    requestId: 20, resourceType: 'fieldMap', mapName: 'prontera', baseName: 'prontera', serverFieldsFolder: 'EP15.1',
    fieldpackVersion: FIELD_PACK_VERSION, attempt: 0, cacheMode: 'network',
  });
  const result = await Promise.race([
    pending,
    new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 100)),
  ]);
  if (result === 'timeout') throw new Error('body-read-did-not-time-out');
  expect(result.result).toMatchObject({ kind: 'error', code: 'network-timeout' });
});
