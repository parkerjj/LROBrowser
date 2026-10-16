export const FIELD_PACK_VERSION = '2.0.5';
const DEFAULT_ROOT = 'https://rodata.ltsd.ro';
function hasControlCharacter(value) {
  return [...value].some(character => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  });
}

function normalizeMap(value) {
  const text = String(value ?? '').trim().replace(/\.(?:gat|rsw)$/i, '');
  if (!text || text.includes('/') || text.includes('\\') || text.includes('..') || hasControlCharacter(text)) return '';
  return text.toLowerCase();
}

function normalizeFolder(value) {
  const text = String(value ?? '').trim().replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
  if (!text || text.split('/').some(part => !part || part === '.' || part === '..' || hasControlCharacter(part))) return '';
  return text;
}

function cacheKey(version, relativePath) {
  return `${version}:${relativePath}`;
}

function cloneBytes(bytes) {
  return bytes.slice(0);
}

function isHtmlOrXml(bytes, contentType = '') {
  if (/text\/html|application\/xml|text\/xml/i.test(contentType)) return true;
  const sample = new globalThis.TextDecoder().decode(bytes.slice(0, 128)).trimStart().toLowerCase();
  return sample.startsWith('<!doctype html') || sample.startsWith('<html') || sample.startsWith('<?xml') || sample.startsWith('<error');
}

async function digest(bytes) {
  if (!globalThis.crypto?.subtle) throw new Error('sha256-unavailable');
  return [...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes))]
    .map(value => value.toString(16).padStart(2, '0')).join('');
}

class VersionedMapCache {
  constructor(databaseName, indexedDBFactory) {
    this.databaseName = databaseName;
    this.indexedDBFactory = indexedDBFactory;
    this.databasePromise = null;
  }

  async open() {
    if (this.databasePromise) return this.databasePromise;
    if (!this.indexedDBFactory) return null;
    this.databasePromise = new Promise((resolve, reject) => {
      const request = this.indexedDBFactory.open(this.databaseName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('maps', { keyPath: 'key' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('map-cache-open-failed'));
    });
    return this.databasePromise;
  }

  async get(version, relativePath) {
    const database = await this.open();
    if (!database) return null;
    const key = cacheKey(version, relativePath);
    return new Promise((resolve, reject) => {
      const request = database.transaction('maps', 'readonly').objectStore('maps').get(key);
      request.onsuccess = () => {
        const record = request.result;
        resolve(record ? { ...record, bytes: cloneBytes(record.bytes) } : null);
      };
      request.onerror = () => reject(request.error ?? new Error('map-cache-read-failed'));
    });
  }

  async put(version, relativePath, record) {
    const database = await this.open();
    if (!database) return;
    await new Promise((resolve, reject) => {
      const transaction = database.transaction('maps', 'readwrite');
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error ?? new Error('map-cache-write-failed'));
      transaction.onabort = () => reject(transaction.error ?? new Error('map-cache-write-aborted'));
      transaction.objectStore('maps').put({
        key: cacheKey(version, relativePath), version, relativePath,
        sha256: record.sha256, encoding: record.encoding, bytes: cloneBytes(record.bytes),
        savedAt: record.savedAt ?? Date.now(),
      });
    });
  }

  async delete(version, relativePath) {
    const database = await this.open();
    if (!database) return;
    await new Promise((resolve, reject) => {
      const transaction = database.transaction('maps', 'readwrite');
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error ?? new Error('map-cache-delete-failed'));
      transaction.onabort = () => reject(transaction.error ?? new Error('map-cache-delete-aborted'));
      transaction.objectStore('maps').delete(cacheKey(version, relativePath));
    });
  }

  async close() {
    const database = await this.open();
    database?.close();
    this.databasePromise = null;
  }
}

function candidatePaths(request, aliases = {}) {
  const mapName = normalizeMap(request.mapName);
  const requestedBase = normalizeMap(request.baseName) || mapName;
  const alias = normalizeMap(aliases[mapName] ?? aliases[requestedBase]);
  const names = [...new Set([alias, requestedBase, mapName].filter(Boolean))];
  const folders = [...new Set([normalizeFolder(request.serverFieldsFolder), ''])];
  const paths = [];
  for (const folder of folders) {
    for (const name of names) {
      for (const extension of ['fld2', 'fld2.gz']) {
        paths.push({ relativePath: folder ? `${folder}/${name}.${extension}` : `${name}.${extension}`, encoding: extension.endsWith('.gz') ? 'gzip' : 'identity' });
      }
    }
  }
  return paths;
}

export function createMapResourceProvider({
  page = globalThis,
  fetchImpl = page.fetch?.bind(page) ?? globalThis.fetch?.bind(globalThis),
  indexedDBFactory = page.indexedDB ?? globalThis.indexedDB,
  databaseName = 'kore-map-resources',
  resourceRoot = DEFAULT_ROOT,
  aliases = {},
  expectedSha256 = {},
  requestTimeoutMs = 15_000,
} = {}) {
  const cache = new VersionedMapCache(databaseName, indexedDBFactory);
  const pending = new Map();
  let persistRequested = false;
  let resourceAliases = aliases;
  let resourceChecksums = expectedSha256;

  async function requestPersistentStorage() {
    if (persistRequested) return;
    persistRequested = true;
    try { await page.navigator?.storage?.persist?.(); } catch { /* persistence is best effort */ }
  }

  async function fetchCandidate(candidate, role = 'field') {
    if (!fetchImpl) throw new Error('fetch-unavailable');
    const url = new globalThis.URL(`/ke/map/fieldpack-${FIELD_PACK_VERSION}/${candidate.relativePath}`, resourceRoot);
    const controller = typeof globalThis.AbortController === 'function' ? new globalThis.AbortController() : null;
    const timeout = Number.isFinite(requestTimeoutMs) && requestTimeoutMs > 0
      ? globalThis.setTimeout(() => controller?.abort(), requestTimeoutMs) : null;
    let response;
    try {
      response = await fetchImpl(url, { method: 'GET', redirect: 'error', credentials: 'omit', signal: controller?.signal });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`http-${response.status}`);
      const contentType = response.headers?.get?.('content-type') ?? '';
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (!bytes.byteLength) throw new Error('empty-response');
      if (isHtmlOrXml(bytes, contentType)) throw new Error('invalid-response-content');
      const sha256 = await digest(bytes);
      const expected = expectedChecksum(candidate.relativePath);
      if (expected && expected !== sha256) throw new Error('sha256-mismatch');
      return {
        role, relativePath: candidate.relativePath, sha256,
        encoding: candidate.encoding, bytes: bytes.buffer,
      };
    } catch (error) {
      if (controller?.signal.aborted) throw new Error('network-timeout');
      throw error;
    } finally {
      if (timeout !== null) globalThis.clearTimeout(timeout);
    }
  }

  function auxiliaryCandidates(fieldPath, role) {
    const base = fieldPath.replace(/\.fld2(?:\.gz)?$/i, '');
    return [`${base}.${role}`, `${base}.${role}.gz`].map(relativePath => ({
      relativePath, encoding: relativePath.endsWith('.gz') ? 'gzip' : 'identity',
    }));
  }

  async function fetchAuxiliary(fieldPath, role) {
    for (const candidate of auxiliaryCandidates(fieldPath, role)) {
      try {
        const file = await fetchCandidate(candidate, role);
        if (file) return file;
      } catch {
        // Auxiliary data is optional; try its gzip/identity sibling before rebuilding.
      }
    }
    return null;
  }

  function expectedChecksum(relativePath) {
    return typeof resourceChecksums === 'function'
      ? resourceChecksums(relativePath)
      : resourceChecksums[relativePath];
  }

  async function validCachedFile(candidate, cached) {
    if (!cached || !['identity', 'gzip'].includes(cached.encoding)
      || !(cached.bytes instanceof ArrayBuffer) || typeof cached.sha256 !== 'string') return false;
    const actual = await digest(new Uint8Array(cached.bytes));
    const expected = expectedChecksum(candidate.relativePath);
    return actual === cached.sha256 && (!expected || expected === actual);
  }

  async function networkRequest(request, candidates) {
    let lastError = null;
    for (const candidate of candidates) {
      try {
        const file = await fetchCandidate(candidate);
        if (!file) continue;
        const files = [file];
        if (request.includeAuxiliary === true) {
          for (const role of ['dist', 'weight']) {
            const auxiliary = await fetchAuxiliary(file.relativePath, role);
            if (auxiliary) files.push(auxiliary);
          }
        }
        pending.set(request.requestId, { fieldpackVersion: request.fieldpackVersion, files });
        return { requestId: request.requestId, result: { kind: 'fieldMap', files } };
      } catch (error) {
        lastError = error;
        break;
      }
    }
    return {
      requestId: request.requestId,
      result: { kind: 'error', code: lastError?.message ?? 'resource-not-found', message: String(lastError?.message ?? 'field-map-not-found') },
    };
  }

  return {
    configure({ aliases: nextAliases = {}, expectedSha256: nextExpectedSha256 = {} } = {}) {
      resourceAliases = nextAliases;
      resourceChecksums = nextExpectedSha256;
    },
    async handleResourceRequest(request) {
      if (!request || request.resourceType !== 'fieldMap' || request.fieldpackVersion !== FIELD_PACK_VERSION) {
        return { requestId: request?.requestId ?? null, result: { kind: 'error', code: 'invalid-resource-request', message: 'unsupported fieldpack version or resource type' } };
      }
      await requestPersistentStorage();
      const candidates = candidatePaths(request, resourceAliases);
      if (request.cacheMode !== 'network') {
        for (const candidate of candidates) {
          const cached = await cache.get(request.fieldpackVersion, candidate.relativePath);
          if (cached) {
            if (!await validCachedFile(candidate, cached)) {
              await cache.delete(request.fieldpackVersion, candidate.relativePath);
              continue;
            }
            const files = [{ role: 'field', relativePath: candidate.relativePath, sha256: cached.sha256, encoding: cached.encoding, bytes: cached.bytes }];
            if (request.includeAuxiliary === true) {
              for (const role of ['dist', 'weight']) {
                for (const auxiliary of auxiliaryCandidates(candidate.relativePath, role)) {
                  const auxiliaryCached = await cache.get(request.fieldpackVersion, auxiliary.relativePath);
                  if (!auxiliaryCached) continue;
                  if (!await validCachedFile(auxiliary, auxiliaryCached)) {
                    await cache.delete(request.fieldpackVersion, auxiliary.relativePath);
                    continue;
                  }
                  files.push({ role, relativePath: auxiliary.relativePath, sha256: auxiliaryCached.sha256,
                    encoding: auxiliaryCached.encoding, bytes: auxiliaryCached.bytes });
                  break;
                }
              }
            }
            pending.set(request.requestId, { fieldpackVersion: request.fieldpackVersion, files, fromCache: true });
            return { requestId: request.requestId, result: { kind: 'fieldMap', files } };
          }
        }
      }
      return networkRequest(request, candidates);
    },

    async handleResourceValidation(message) {
      const source = pending.get(message.sourceRequestId);
      const committedFiles = [];
      const deletedFiles = [];
      if (source) {
        const accepted = new Set(message.acceptedFiles ?? []);
        const rejected = new Set((message.rejectedFiles ?? []).map(file => file.relativePath));
        for (const file of source.files) {
          if (accepted.has(file.relativePath)) {
            await cache.put(source.fieldpackVersion, file.relativePath, file);
            committedFiles.push(file.relativePath);
          } else if (rejected.has(file.relativePath)) {
            await cache.delete(source.fieldpackVersion, file.relativePath);
            deletedFiles.push(file.relativePath);
          }
        }
        pending.delete(message.sourceRequestId);
      }
      return { requestId: message.requestId, sourceRequestId: message.sourceRequestId, committedFiles, deletedFiles };
    },

    close() {
      return cache.close();
    },
  };
}

export { candidatePaths };
