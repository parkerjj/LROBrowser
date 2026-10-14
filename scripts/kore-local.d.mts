import type { KoreManifest, KorePointer } from '../src/kore/kore-integration.mjs';
export function withKoreLock<T>(repo: string, action: () => T | Promise<T>): Promise<T>;
export function validateLocalPackage(root: string): Promise<KoreManifest>;
export function disableLocal(options: { repo: string }): Promise<void>;
export function enableLocal(options: { repo: string; source: string; mode: 'debug' | 'release' }): Promise<KorePointer>;
export function mergeKorePackage(repo: string): Promise<KorePointer | null>;
