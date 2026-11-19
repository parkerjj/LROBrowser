import {
  MAP_RESOURCE_MAX_TOTAL_MS,
  resolvePassiveResource as resolveFromSources,
  type ResolvePassiveResourceOptions,
} from './resource-resolver';

export { ResourceSourceHealth, RESOURCE_HEDGE_DELAY_MS } from './resource-resolver';

export function resolvePassiveResource(path: string, options: ResolvePassiveResourceOptions = {}): Promise<ArrayBuffer> {
  // Tauri resolves fetch only after Rust buffers the response. Rust enforces
  // stalls and JS keeps the existing five-minute absolute map deadline.
  const isMap = /\.(?:gat|gnd|rsw|rsm2?|str)$/i.test(path);
  const timeoutMs = options.timeoutMs ?? (isMap ? MAP_RESOURCE_MAX_TOTAL_MS : undefined);
  return resolveFromSources(path, { ...options, timeoutMs });
}
