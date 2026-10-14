export interface ExecutableFile { path: string; bytes: number; sha256: string; kind: string }
export interface ExecutableManifest { files: ExecutableFile[] }
export interface KoreManifest {
  schemaVersion: 1; engineVersion: string; bridgeApiVersion: 1; packetver: 20211103;
  profile: 'lastro-2x'; commitSha: string | null; sourceDirty: boolean; mode: 'debug' | 'release';
  toolVersions: { rust: string; wasmBindgen: string; binaryen: string | null };
  files: ExecutableFile[]; packageId: string;
}
export interface KorePointer { schemaVersion: 1; packageId: string; manifestPath: string }
export interface KorePage {
  location: { href: string };
  fetch: (url: URL, options?: RequestInit) => Promise<Response>;
  document?: EventTarget & { hidden: boolean };
  performance?: { now(): number };
  crypto?: Pick<Crypto, 'randomUUID'>;
  setInterval?: typeof globalThis.setInterval;
  clearInterval?: typeof globalThis.clearInterval;
  addEventListener?: EventTarget['addEventListener'];
  removeEventListener?: EventTarget['removeEventListener'];
}
export interface KoreWorker extends EventTarget { postMessage(message: unknown): void; terminate(): void }
export interface KoreState {
  status: 'absent' | 'loading' | 'runtime-ready' | 'failed' | 'disposed';
  packageId: string | null; mode: 'debug' | 'release' | null; tickCount: number; elapsedMs: number;
  worldReady: false; aiState: 'off'; logs: { level: string; text: string }[];
}
export interface KoreOptions {
  page?: KorePage; manifest: ExecutableManifest;
  createWorker?: (url: string) => KoreWorker; onWorkerReleased?: () => void; onChange?: (state: KoreState) => void;
}
export interface KoreIntegration { state: KoreState; start(): Promise<void>; dispose(): void; debugProbe(type: string): boolean }
export function sha256(bytes: BufferSource): Promise<string>;
export function safePackagePath(value: string): string;
export function packageKind(file: string): string;
export function validateKoreManifest(manifest: unknown): Promise<KoreManifest>;
export function validateKorePointer(pointer: unknown): KorePointer;
export function loadKorePackage(options: { page?: KorePage; manifest: ExecutableManifest; signal?: AbortSignal }): Promise<{ manifest: KoreManifest; workerUrl: string } | null>;
export function createKoreIntegration(options: KoreOptions): KoreIntegration;
export function startOptionalKore(options: Pick<KoreOptions, 'createWorker' | 'onWorkerReleased'>): KoreIntegration | null;
