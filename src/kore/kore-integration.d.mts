export interface ExecutableFile { path: string; bytes: number; sha256: string; kind: string }
export interface ExecutableManifest { files: ExecutableFile[] }
export interface KoreManifest {
  schemaVersion: 1; engineVersion: string; bridgeApiVersion: 1; packetver: 20211103;
  profile: 'lastro-20211103' | 'lastro-2x'; commitSha: string | null; sourceDirty: boolean; mode: 'debug' | 'release';
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
export interface KoreWorker extends EventTarget { postMessage(message: unknown, transfer?: Transferable[]): void; terminate(): void }
export interface KoreActor { gid: number; x: number; y: number; kind: 'self' | 'player' | 'monster' | 'other' | 'unknown' }
export interface KoreVisibleEntities { total: number; players: number; monsters: number; other: number; unknown: number }
export interface KoreParserDiagnostics { bufferedBytes: number; pendingPacketId: number | null; pendingRequiredBytes: number | null; lastPacketId: number | null }
export interface KoreLog { level: string; text: string; timestamp: number }
export interface KoreState {
  status: 'absent' | 'loading' | 'runtime-ready' | 'failed' | 'disposed';
  packageId: string | null; mode: 'debug' | 'release' | null; tickCount: number; elapsedMs: number;
  profile: 'lastro-20211103' | 'lastro-2x'; gameSessionId: string | null; connectionGeneration: number | null;
  streamStatus: 'idle' | 'awaiting-connection' | 'awaiting-sync' | 'world-ready' | 'degraded';
  mapName: string | null; selfActor: KoreActor | null; visibleEntities: KoreVisibleEntities; parserDiagnostics: KoreParserDiagnostics;
  receivedBytes: number; degradedReason: string | null; worldReady: boolean; aiState: 'off'; logs: KoreLog[];
  mapResourceState: 'idle' | 'loading' | 'retrying' | 'ready' | 'degraded';
  routeState: 'idle' | 'running' | 'awaiting-map' | 'completed' | 'cancelled' | 'failed'; routePreview: unknown[] | null;
}
export interface KoreOptions {
  page?: KorePage; manifest: ExecutableManifest;
  createWorker?: (url: string) => KoreWorker; onWorkerReleased?: () => void; onChange?: (state: KoreState) => void;
  mapResourceProvider?: import('./map-resource-provider.mjs').MapResourceProvider;
  serverFieldsFolder?: string;
}
export interface KoreIntegration {
  state: KoreState; start(): Promise<void>; dispose(): void; debugProbe(type: string): boolean;
  beginGameSession(characterGid: number, mapName: string): string | null;
  beginMapConnection(): number | null;
  mirrorMapData(connectionGeneration: number, data: ArrayBuffer | ArrayBufferView): boolean;
  endGameSession(): void; clearConsole(): void; debugMapRetry(): boolean;
  debugRoutePreview(routeRequest: unknown): boolean; debugRouteGo(routeRequest: unknown): boolean; debugRouteCancel(): boolean;
  handleAirshipResponse(response: number): boolean;
  debugCommand(command: string, routeRequest?: unknown): boolean;
}
export interface KorePanelView {
  panel: HTMLElement; infoNode: HTMLTextAreaElement; routeNode: HTMLTextAreaElement; consoleNode: HTMLTextAreaElement; clearButton: HTMLButtonElement;
  update(state: KoreState): void;
}
export const KORE_PROTOCOL_PROFILE: 'lastro-20211103';
export function createKorePanel(options: { page: { document: Document }; host: Pick<KoreIntegration, 'clearConsole'> }): KorePanelView;
export function sha256(bytes: BufferSource): Promise<string>;
export function safePackagePath(value: string): string;
export function packageKind(file: string): string;
export function validateKoreManifest(manifest: unknown): Promise<KoreManifest>;
export function validateKorePointer(pointer: unknown): KorePointer;
export function loadKorePackage(options: { page?: KorePage; manifest: ExecutableManifest; signal?: AbortSignal }): Promise<{
  manifest: KoreManifest; workerUrl: string;
  mapResourceConfig: { aliases: Record<string, string>; expectedSha256: Record<string, string> };
} | null>;
export function createKoreIntegration(options: KoreOptions): KoreIntegration;
export function startOptionalKore(options: Pick<KoreOptions, 'createWorker' | 'onWorkerReleased'>): KoreIntegration | null;
