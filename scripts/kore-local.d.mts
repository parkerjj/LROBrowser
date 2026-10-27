import type { KoreManifest, KorePointer } from '../src/kore/kore-integration.mjs';
export function withKoreLock<T>(repo: string, action: () => T | Promise<T>): Promise<T>;
export function validateLocalPackage(root: string): Promise<KoreManifest>;
export function disableLocal(options: { repo: string }): Promise<void>;
export function enableLocal(options: { repo: string; source: string; mode: 'debug' | 'release' }): Promise<KorePointer>;
export function mergeKorePackage(repo: string, options?: { required?: boolean }): Promise<KorePointer | null>;
export interface KoreReleaseMetadata { tag: string; releaseId: number; commitSha: string; buildId: string; packageId: string; archiveSha256: string }
export function downloadRelease(options: { out: string; token?: string; releaseTag?: string; fetchImpl?: typeof fetch }): Promise<KoreReleaseMetadata>;
export function extractReleaseArchive(archive: Uint8Array, destination: string): Promise<void>;
export function importReleasePackage(options: { repo: string; packageRoot: string; metadata: KoreReleaseMetadata }): Promise<KorePointer>;
export function validateDistribution(options: { dist: string; expectedPackageId: string }): Promise<{ packageId: string; buildId: string; commitSha: string }>;
export function verifyWebHosting(options?: { fetchImpl?: typeof fetch }): Promise<{ isolatedHeaders: boolean; coop: string; coep: string }>;

export function importLocalPackage(options: { repo: string; packageRoot: string }): Promise<KorePointer>;
export function validateLegacyFieldpack(root: string): Promise<unknown>;
export function extractLegacyArchive(archive: Uint8Array, destination: string): Promise<void>;
export function prepareLegacyFieldpack(options: { repo: string; source?: string; releaseTag?: string; token?: string; fetchImpl?: typeof fetch }): Promise<Record<string, unknown>>;
