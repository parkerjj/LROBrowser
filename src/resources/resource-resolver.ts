import { classifyResource, normalizeResourcePath } from './resource-policy';
import { createResourceCache, type ResourceCache } from './resource-cache';
import { validateMapBinary } from './map-binary-validation';

export const RESOURCE_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const MAP_RESOURCE_TIMEOUT_MS = 60_000;
export const RESOURCE_TIMEOUT_MS = 8_000;
export const RESOURCE_HEDGE_DELAY_MS = 350;
export const NEGATIVE_RESOURCE_CACHE_MS = 5 * 60 * 1000;

export const DEFAULT_RESOURCE_ROOTS = Object.freeze([
  'https://game.lastro.cn/ro/client_re/',
  'https://rodata.ltsd.ro/ro/client_re/'
] as const);
export const WEB_RESOURCE_ROOTS = Object.freeze([
  'https://rodata.ltsd.ro/ro/client_re/'
] as const);

/**
 * World-map backdrop artwork (referenced by worldviewdata_list.lub `BgImage`).
 * game.lastro.cn ships a localized variant with labels baked into the pixels
 * while rodata.ltsd.ro ships the clean artwork; DOM labels are rendered on top,
 * so the baked-in variant must never be used or labels double up.
 */
const WORLDMAP_BACKDROP_PATTERN = /(?:^|\/)(?:worldmap[^/]*|midgard_north|pasta|crack_of_dimension\d*|worldmap_isgard)\.(?:jpg|bmp)$/i;
const CLEAN_BACKDROP_ROOT = 'https://rodata.ltsd.ro/';

function isWorldMapBackdrop(path: string): boolean {
  return path.startsWith('data/texture/') && WORLDMAP_BACKDROP_PATTERN.test(path);
}

export class ResourceResolutionError extends Error {
  readonly path: string;
  readonly attempts: readonly ResourceAttempt[];

  constructor(path: string, attempts: ResourceAttempt[]) {
    super(`Unable to resolve resource (logical path): ${path}\nResolution attempts:\n${attempts.map(attempt => `${attempt.url} [${attempt.reason}]`).join('\n')}`);
    this.name = 'ResourceResolutionError';
    this.path = path;
    this.attempts = attempts;
  }
}

export interface ResourceAttempt {
  url: string;
  reason: string;
}

/**
 * Per-worker source measurements; a slow/failed server no longer has to be
 * contacted first for every sprite. This never adds a new trusted origin.
 */
export class ResourceSourceHealth {
  private readonly metrics = new Map<string, { latency: number; failures: number }>();

  order(roots: readonly string[]): string[] {
    return [...roots].sort((a, b) => this.score(a) - this.score(b));
  }

  private score(root: string): number {
    const metric = this.metrics.get(root);
    return metric ? metric.latency + metric.failures * 1_000 : 10_000;
  }

  success(root: string, durationMs: number): void {
    const old = this.metrics.get(root);
    this.metrics.set(root, {
      latency: old ? old.latency * 0.7 + durationMs * 0.3 : durationMs,
      failures: 0
    });
  }

  failure(root: string): void {
    const old = this.metrics.get(root);
    this.metrics.set(root, {
      latency: old?.latency ?? 8_000,
      failures: Math.min((old?.failures ?? 0) + 1, 10)
    });
  }
}

export interface ResolvePassiveResourceOptions {
  cache?: ResourceCache;
  fetch?: typeof globalThis.fetch;
  resourceRoots?: readonly string[];
  packageLookup?: (path: string) => Promise<ArrayBuffer | null>;
  primaryCharset?: string;
  fallbackCharset?: string;
  timeoutMs?: number;
  /** A second origin begins after this delay, or immediately after the first fails. */
  hedgeDelayMs?: number;
  sourceHealth?: ResourceSourceHealth;
  /** Per-worker, bounded cache of URLs which returned an actual HTTP 404. */
  notFoundUntil?: Map<string, number>;
}

function hasSingleByteMojibake(segment: string): boolean {
  let hasHighByte = false;
  for (const character of segment) {
    const code = character.charCodeAt(0);
    if (code > 255) return false;
    hasHighByte ||= code >= 128;
  }
  return hasHighByte && segment.length > 1;
}

function decodeSegment(segment: string, charset: string): string {
  if (!charset || !hasSingleByteMojibake(segment)) return segment;
  try {
    const decoded = new TextDecoder(charset).decode(Uint8Array.from(segment, (character) => character.charCodeAt(0)));
    if (!decoded.includes('\ufffd')) return decoded;
  } catch { return segment; }
  return segment;
}

function decodeMixedSegment(segment: string, charset: string): string {
  if (!charset) return segment;
  return segment.replace(/[\u0080-\u00ff]+/g, (run) => decodeSegment(run, charset));
}

const legacyEncoderCache = new Map<string, Map<string, number[]> | null>();

function getLegacyEncoder(charset: string): Map<string, number[]> | null {
  if (legacyEncoderCache.has(charset)) return legacyEncoderCache.get(charset) ?? null;
  let decoder: TextDecoder;
  try { decoder = new TextDecoder(charset); } catch { legacyEncoderCache.set(charset, null); return null; }
  const encoder = new Map<string, number[]>();
  const bytes = new Uint8Array(2);
  for (let lead = 0x81; lead <= 0xfe; lead++) {
    bytes[0] = lead;
    for (let trail = 0x41; trail <= 0xfe; trail++) {
      bytes[1] = trail;
      const decoded = decoder.decode(bytes);
      if (decoded.length === 1 && !decoded.includes('\ufffd') && !encoder.has(decoded)) encoder.set(decoded, [lead, trail]);
    }
  }
  legacyEncoderCache.set(charset, encoder);
  return encoder;
}

function transcodeKoreanRuns(segment: string, sourceCharset: string, targetCharset: string): string {
  const korean = /[\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\uac00-\ud7ff]+/g;
  if (!korean.test(segment)) return segment;
  const encoder = getLegacyEncoder(sourceCharset);
  if (!encoder) throw new Error('Resource filename encoding unavailable');
  const decoder = new TextDecoder(targetCharset, { fatal: true });
  return segment.replace(korean, (run) => {
    const bytes: number[] = [];
    for (const character of run) {
      const encoded = encoder.get(character);
      if (!encoded) throw new Error('Resource filename cannot be encoded');
      bytes.push(...encoded);
    }
    return decoder.decode(Uint8Array.from(bytes));
  });
}

function encodeResourcePath(resourcePath: string): string {
  return resourcePath.replace(/[^/]+/g, (segment) => encodeURIComponent(segment));
}

function addLegacySpriteFallbacks(resourcePath: string): string[] {
  const fallback = resourcePath.replace(/_(?:검광|八堡)\.(spr|act)$/i, '.$1');
  return fallback === resourcePath ? [resourcePath] : [resourcePath, fallback];
}

export function buildResourcePathCandidates(resourcePath: string, primaryCharset = 'gbk', fallbackCharset = 'euc-kr'): string[] {
  // Published filenames are legacy Korean bytes decoded as GBK, across every
  // directory and basename. Do not restore Chinese names back to Korean URLs.
  const normalizedPath = resourcePath.replace(/\\/g, '/').split('/').map(segment =>
    transcodeKoreanRuns(decodeMixedSegment(segment, primaryCharset), fallbackCharset, primaryCharset)
  ).join('/');
  if (!normalizeResourcePath(normalizedPath)) throw new Error('Invalid encoded resource path');
  const variants = [normalizedPath];
  const candidates: string[] = [];
  const addCandidate = (value: string) => {
    const encoded = encodeResourcePath(value);
    if (candidates.length < 12 && !candidates.includes(encoded)) candidates.push(encoded);
  };
  const lowercaseExtension = (value: string) => value.replace(/([^/]+\.)([^/.]+)$/i, (_match, base, extension) => base + extension.toLowerCase());
  for (const variant of variants) addCandidate(variant);
  for (const variant of variants) addCandidate(lowercaseExtension(variant));
  if (/^data\/texture\/[^/]+\/item\/[a-z0-9_]+\.bmp$/i.test(normalizedPath)) {
    for (const variant of variants) addCandidate(variant.replace(/[^/]+$/, (filename) => filename.toLowerCase()));
  }
  for (const fallback of addLegacySpriteFallbacks(normalizedPath).slice(1)) addCandidate(fallback);
  for (const fallback of addLegacySpriteFallbacks(normalizedPath).slice(1)) addCandidate(lowercaseExtension(fallback));
  return candidates;
}

function normalizeRoot(root: string): string {
  if (!DEFAULT_RESOURCE_ROOTS.some(allowed => root === allowed)) throw new Error('Unapproved resource root');
  return root;
}

function header(response: Response, name: string): string | undefined {
  const value = response.headers?.get(name);
  return value || undefined;
}

async function fetchResource(url: string, options: ResolvePassiveResourceOptions, signal?: AbortSignal): Promise<{ bytes: ArrayBuffer; response: Response }> {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (!fetchImpl) throw new Error('fetch-unavailable');
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeoutMs = Math.max(1, options.timeoutMs ?? RESOURCE_TIMEOUT_MS);
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; abort(); }, timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, redirect: 'error', credentials: 'omit' });
    if (!response.ok) throw new Error(`http-${response.status}`);
    const contentType = header(response, 'content-type')?.toLowerCase() ?? '';
    if (contentType.includes('text/html')) throw new Error('html-response');
    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength) throw new Error('empty-response');
    const sample = new TextDecoder().decode(bytes.slice(0, 64)).trimStart().toLowerCase();
    if (sample.startsWith('<!doctype html') || sample.startsWith('<html')) throw new Error('html-response');
    return { bytes, response };
  } catch (error) {
    if (timedOut) throw new Error(`download-timeout-${timeoutMs}ms`);
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

export async function resolvePassiveResource(resourcePath: string, options: ResolvePassiveResourceOptions = {}): Promise<ArrayBuffer> {
  const normalizedPath = normalizeResourcePath(resourcePath);
  const classification = classifyResource(normalizedPath);
  const attempts: ResourceAttempt[] = [];
  if (classification === 'forbidden') throw new ResourceResolutionError(resourcePath, [{ url: resourcePath, reason: 'forbidden-resource' }]);
  if (options.packageLookup) {
    const packaged = await options.packageLookup(normalizedPath);
    if (packaged) {
      validateMapBinary(normalizedPath, packaged);
      return packaged.slice(0);
    }
  }
  if (classification === 'packaged-executable') throw new ResourceResolutionError(normalizedPath, [{ url: normalizedPath, reason: 'package-only-resource' }]);
  const cache = options.cache ?? createResourceCache();
  const backdropOnly = isWorldMapBackdrop(normalizedPath);
  const cached = await cache.match(normalizedPath).catch(() => null);
  if (cached) {
    const age = Date.now() - cached.savedAt;
    // Drop cached backdrops that came from the localized origin once.
    const staleBackdrop = backdropOnly && !cached.sourceUrl.startsWith(CLEAN_BACKDROP_ROOT);
    if (cached.bytes.byteLength && Number.isFinite(age) && age >= 0 && age <= RESOURCE_CACHE_MAX_AGE_MS && !staleBackdrop) {
      try {
        validateMapBinary(normalizedPath, cached.bytes);
        return cached.bytes.slice(0);
      } catch { /* Invalid map bytes must be fetched again instead of poisoning every load. */ }
    }
    await cache.delete(normalizedPath).catch(() => {});
  }
  const candidates = buildResourcePathCandidates(normalizedPath, options.primaryCharset, options.fallbackCharset);
  const allRoots = (options.resourceRoots ?? DEFAULT_RESOURCE_ROOTS).map(normalizeRoot);
  const isDefaultRoots = allRoots.join('|') === DEFAULT_RESOURCE_ROOTS.join('|');
  const isWebRoots = allRoots.join('|') === WEB_RESOURCE_ROOTS.join('|');
  if (!isDefaultRoots && !isWebRoots) throw new Error('Resource root order is fixed');
  const allowedRoots = backdropOnly ? allRoots.filter((root) => root.startsWith(CLEAN_BACKDROP_ROOT)) : allRoots;
  const roots = options.sourceHealth?.order(allowedRoots) ?? allowedRoots;
  const controller = new AbortController();
  const loadRoot = async (root: string) => {
    const failures: ResourceAttempt[] = [];
    const startedAt = Date.now();
    for (const candidate of candidates) {
      const url = root + candidate;
      const negativeExpiry = options.notFoundUntil?.get(url);
      if (negativeExpiry && negativeExpiry > Date.now()) {
        failures.push({ url, reason: 'http-404-cached' });
        continue;
      }
      if (negativeExpiry) options.notFoundUntil?.delete(url);
      try {
        const timeoutMs = options.timeoutMs ?? (/\.(?:gat|gnd|rsw|rsm2?|str)$/i.test(normalizedPath) ? MAP_RESOURCE_TIMEOUT_MS : RESOURCE_TIMEOUT_MS);
        const result = await fetchResource(url, { ...options, timeoutMs }, controller.signal);
        validateMapBinary(normalizedPath, result.bytes);
        options.sourceHealth?.success(root, Date.now() - startedAt);
        return { url, ...result };
      } catch (error) {
        if (controller.signal.aborted) throw error;
        const reason = error instanceof Error ? error.message : 'fetch-failed';
        failures.push({ url, reason });
        if (reason === 'http-404' && options.notFoundUntil) {
          if (options.notFoundUntil.size >= 2_048) {
            const oldest = options.notFoundUntil.keys().next().value;
            if (oldest) options.notFoundUntil.delete(oldest);
          }
          options.notFoundUntil.set(url, Date.now() + NEGATIVE_RESOURCE_CACHE_MS);
        }
        if (reason !== 'http-404' && reason !== 'html-response' && !reason.startsWith('invalid-map-')) break;
      }
    }
    options.sourceHealth?.failure(root);
    throw new ResourceResolutionError(normalizedPath, failures);
  };
  const save = async (result: Awaited<ReturnType<typeof loadRoot>>) => {
    const metadata = {
      sourceUrl: result.url,
      ...(header(result.response, 'etag') ? { etag: header(result.response, 'etag') } : {}),
      ...(header(result.response, 'last-modified') ? { lastModified: header(result.response, 'last-modified') } : {})
    };
    await cache.put(normalizedPath, result.bytes, metadata).catch(() => {});
    return result.bytes;
  };
  const isMapOrModel = /\.(?:gat|gnd|rsw|rsm2?|str)$/i.test(normalizedPath);
  if (isMapOrModel || (roots.length === 2 && options.hedgeDelayMs !== undefined)) {
    // Each origin advances through its candidates independently. For small assets
    // hedge after a short delay rather than imposing a full eight-second timeout
    // before trying the mirror. Map/model assets retain immediate racing.
    try {
      const candidates = isMapOrModel || roots.length < 2
        ? roots.map(loadRoot)
        : (() => {
          const primary = loadRoot(roots[0]!);
          const secondary = new Promise<Awaited<ReturnType<typeof loadRoot>>>((resolve, reject) => {
            let started = false;
            const start = () => {
              if (started) return;
              started = true;
              clearTimeout(timer);
              controller.signal.removeEventListener('abort', onAbort);
              if (controller.signal.aborted) { reject(new Error('hedge-cancelled')); return; }
              void loadRoot(roots[1]!).then(resolve, reject);
            };
            const onAbort = () => {
              if (!started) { clearTimeout(timer); reject(new Error('hedge-cancelled')); }
            };
            const timer = setTimeout(start, Math.max(0, options.hedgeDelayMs!));
            controller.signal.addEventListener('abort', onAbort, { once: true });
            void primary.catch(start);
          });
          return [primary, secondary];
        })();
      const result = await Promise.any(candidates);
      controller.abort();
      return await save(result);
    } catch (error) {
      if (!(error instanceof AggregateError)) throw error;
      for (const failure of error.errors as ResourceResolutionError[]) attempts.push(...failure.attempts);
    }
  } else {
    for (const root of roots) {
      try {
        return await save(await loadRoot(root));
      } catch (error) {
        if (!(error instanceof ResourceResolutionError)) throw error;
        attempts.push(...error.attempts);
      }
    }
  }
  throw new ResourceResolutionError(normalizedPath, attempts);
}
