import { readFileSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';

// Bounded upstream regions/owners only; current-side tests read the actual vendor.
export function readHistoricalRuntime(name: string): Record<string, string> {
  return JSON.parse(readFileSync(new NodeURL(`../fixtures/runtime-consolidation/${name}.json`, import.meta.url), 'utf8'));
}
