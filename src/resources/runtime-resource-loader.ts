import { createResourceCache } from './resource-cache';
import { createResourceScheduler, resourcePriority } from './resource-scheduler';
import { createDirectHttpFetch } from './direct-http-resource';
import { normalizeResourcePath } from './resource-policy';
import { resolvePassiveResource, ResourceSourceHealth, RESOURCE_HEDGE_DELAY_MS } from './resource-resolver';

export interface PackageResourceEntry { readonly path: string; readonly encoding?: string; }

export function snapshotPackageManifest(files: unknown): readonly PackageResourceEntry[] {
  if (!Array.isArray(files)) throw new Error('Invalid package resource manifest');
  return Object.freeze(files.map((file: unknown) => {
    if (!file || typeof file !== 'object' || !('path' in file) || typeof file.path !== 'string') {
      throw new Error('Invalid package resource entry');
    }
    return Object.freeze({ ...file, path: file.path });
  }));
}

interface RuntimeResourceOptions {
  packageBaseUrl: string;
  getManifest: () => readonly PackageResourceEntry[] | undefined;
  getCharset: () => string | undefined;
}

// Bundled as a classic worker script; all reads share one IndexedDB connection.
export function createRuntimeResourceLoader(options: RuntimeResourceOptions): (path: string) => Promise<ArrayBuffer> {
  const cache = createResourceCache();
  const directHttpFetch = createDirectHttpFetch({ nativeFetch: globalThis.fetch });
  const inFlight = new Map<string, Promise<ArrayBuffer>>();
  const schedule = createResourceScheduler(3);
  const sourceHealth = new ResourceSourceHealth();
  const notFoundUntil = new Map<string, number>();
  // Every resource request consults the manifest: index it once per manifest instead of scanning it.
  let indexedManifest: readonly PackageResourceEntry[] | undefined;
  let manifestIndex = new Map<string, PackageResourceEntry>();
  const findPackaged = (lowerPath: string) => {
    const manifest = options.getManifest();
    if (!manifest) return undefined;
    if (manifest !== indexedManifest) {
      indexedManifest = manifest;
      manifestIndex = new Map();
      for (const file of manifest) {
        const key = file.path.toLowerCase();
        if (!manifestIndex.has(key)) manifestIndex.set(key, file);
      }
    }
    return manifestIndex.get(lowerPath);
  };
  return (path) => {
    const normalizedPath = normalizeResourcePath(path);
    const charset = options.getCharset();
    // Invalid names must each reach the resolver's own rejection, not share an
    // empty normalization key with unrelated requests.
    const key = normalizedPath ? JSON.stringify([normalizedPath, charset]) : null;
    let loading = key ? inFlight.get(key) : undefined;
    if (!loading) {
      loading = schedule(() => resolvePassiveResource(path, {
        cache,
        fetch: directHttpFetch,
        hedgeDelayMs: RESOURCE_HEDGE_DELAY_MS,
        sourceHealth,
        notFoundUntil,
        primaryCharset: charset,
        packageLookup: async (normalizedPath) => {
          const entry = findPackaged(normalizedPath.toLowerCase());
          if (!entry && /^data\/sprite\/cursors\.(spr|act)$/i.test(normalizedPath)) {
            throw new Error(`Missing packaged cursor resource: ${normalizedPath}`);
          }
          if (!entry) return null;
          if (normalizeResourcePath(entry.path) !== entry.path) throw new Error('Invalid package resource path');
          if (entry.encoding !== undefined && entry.encoding !== 'gzip') throw new Error('Invalid package resource encoding');
          const gzip = entry.encoding === 'gzip';
          const encodedPath = entry.path.split('/').map(encodeURIComponent).join('/') + (gzip ? '.gz' : '');
          const response = await fetch(new URL(encodedPath, options.packageBaseUrl), { redirect: 'error', credentials: 'omit' });
          if (!response.ok) throw new Error(`Package resource failed (${response.status}): ${entry.path}`);
          // IWA builds store Lua/LUB gzip-compressed; Web Bundles carry no transfer encoding.
          const raw = await response.arrayBuffer();
          const bytes = gzip
            ? await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
            : raw;
          if (!bytes.byteLength || (response.headers.get('content-type') ?? '').includes('text/html')) {
            throw new Error(`Invalid package resource: ${entry.path}`);
          }
          return bytes;
        },
      }), resourcePriority(path));
      if (key) {
        loading = loading.finally(() => { inFlight.delete(key); });
        inFlight.set(key, loading);
      }
    }
    // Native worker callers may transfer their result. Never hand out the
    // shared request buffer, or one transfer would detach another caller's data.
    return loading.then(bytes => bytes.slice(0));
  };
}
