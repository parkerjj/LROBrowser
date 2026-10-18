export interface ExecutableFile { path: string; bytes: number; sha256: string; kind: string }
export interface ExecutableManifest { files: ExecutableFile[] }
export interface KoreManifest {
  schemaVersion: 1; engineVersion: string; bridgeApiVersion: 2;
  schedulerCapabilities?: ('fourQueues' | 'oneShotDeadline' | 'residentExecutor')[];
  packetver: 20211103; profile: 'lastro-20211103' | 'lastro-2x'; commitSha: string | null;
  sourceDirty: boolean; mode: 'debug' | 'release';
  toolVersions: { rust: string; wasmBindgen: string; binaryen: string | null };
  files: ExecutableFile[]; packageId: string;
}
export interface KorePointer { schemaVersion: 1; packageId: string; manifestPath: string }
export interface KorePage {
  location: { href: string }; fetch: (url: URL, options?: RequestInit) => Promise<Response>;
  document?: EventTarget & { hidden: boolean }; performance?: { now(): number };
  crypto?: Pick<Crypto, 'randomUUID'>; setInterval?: typeof globalThis.setInterval;
  clearInterval?: typeof globalThis.clearInterval;
  KoreEngineDisconnect?: (reason: string) => unknown;
}
export interface KoreWorker extends EventTarget { postMessage(message: unknown, transfer?: Transferable[]): void; terminate(): void }
export interface KoreLog { level: string; text: string; timestamp: number }
export interface KoreActionRecord { timestamp: number; requestId: number | null; routeId: number | null; type: string; detail: string; accepted: boolean; reason: string | null }
export interface KoreState {
  status: 'absent' | 'loading' | 'runtime-ready' | 'failed' | 'unavailable' | 'disposed';
  packageId: string | null; mode: 'debug' | 'release' | null; runtimeGeneration: number;
  profile: 'lastro-20211103' | 'lastro-2x'; gameSessionId: string | null; connectionGeneration: number | null;
  streamStatus: 'idle' | 'awaiting-connection' | 'awaiting-sync' | 'world-ready' | 'degraded';
  worldReady: boolean; mapResourceState: 'idle' | 'loading' | 'retrying' | 'ready' | 'degraded';
  receivedBytes: number; sentBytes: number; degradedReason: string | null; logs: KoreLog[];
  runtimeStatus: unknown; lastDiagnostic: unknown; lastCommandResult: unknown;
  configIdentity: { aid: number; cid: number } | null;
  /** Display-only copies for the debug panel; the Host never decides gameplay from them. */
  lastWorldState: Record<string, unknown> | null; lastWorldStateAt: number | null;
  heartbeat: { at: number; nextDeadlineMs: number | null; queueDepth: unknown } | null;
  actions: KoreActionRecord[]; diagnosticLog: { timestamp: number; text: string }[];
}
export interface KoreOptions {
  page?: KorePage; manifest: ExecutableManifest;
  createWorker?: (url: string) => KoreWorker; onWorkerReleased?: () => void; onChange?: (state: KoreState) => void;
  mapResourceProvider?: import('./map-resource-provider.mjs').MapResourceProvider; serverFieldsFolder?: string;
}
export interface KoreIntegration {
  state: KoreState; start(): Promise<void>; dispose(): void;
  beginGameSession(characterGid: number, mapName: string, identity?: { aid?: number; cid?: number }): string | null;
  beginMapConnection(): number | null;
  mirrorMapData(connectionGeneration: number, data: ArrayBuffer | ArrayBufferView): boolean;
  degradeConnection(reason?: string): boolean;
  mirrorSentBytes(bytes: number, gameSessionId?: string | null): boolean;
  endGameSession(): boolean; clearConsole(): void; debugMapRetry(): boolean;
  saveConfigDocument(document: unknown): Promise<unknown>; getConfigDocuments(identity: unknown): Promise<unknown[]>;
  getConfigDefault(fileName: string): string | null;
  reloadConfig(target?: string): boolean; debugCommand(command: string): boolean; sendCommand(command: string): boolean;
}
export interface KoreNativePacketSocket { connected?: boolean; isZone?: boolean; handoffPending?: boolean; readyState?: number }
export interface KoreNativePacketPage extends Partial<KorePage> { console?: Console; KoreEngine?: { state?: { sentBytes?: number } } }
export interface KoreNativePacketSendOptions { page?: KoreNativePacketPage; sendPacket?: (packet: unknown) => unknown; socket?: KoreNativePacketSocket | null; refusalReason?: string | null }
export interface KorePanelSections { headline: string; host: string; world: string; decision: string; command: string; actions: string; console: string }
export interface KorePanelView { panel: HTMLElement; infoNode: HTMLTextAreaElement; worldNode: HTMLTextAreaElement; decisionNode: HTMLTextAreaElement; commandResultNode: HTMLTextAreaElement; actionsNode: HTMLTextAreaElement; consoleNode: HTMLTextAreaElement; editor: HTMLTextAreaElement; fileSelect: HTMLSelectElement; editorNote: HTMLElement; reloadResultNode: HTMLTextAreaElement; statusTab: HTMLButtonElement; editorTab: HTMLButtonElement; clearButton: HTMLButtonElement; commandInput: HTMLInputElement; commandButton: HTMLButtonElement; update(state: KoreState): void }
export const KORE_PROTOCOL_PROFILE: 'lastro-20211103';
export function createKorePanel(options: { page: { document: Document; navigator?: Navigator }; host: Pick<KoreIntegration, 'clearConsole' | 'debugCommand'> & Partial<Pick<KoreIntegration, 'reloadConfig' | 'debugMapRetry' | 'getConfigDocuments' | 'saveConfigDocument' | 'getConfigDefault'>> }): KorePanelView;
export function formatKoreSections(state: KoreState): KorePanelSections;
export function formatKoreCommandResult(result: unknown): string;
export function formatKoreDiagnosticLine(diagnostic: unknown): string;
export function sha256(bytes: BufferSource): Promise<string>;
export function safePackagePath(value: string): string;
export function packageKind(file: string): string;
export function validateKoreManifest(manifest: unknown): Promise<KoreManifest>;
export function validateKorePointer(pointer: unknown): KorePointer;
export function loadKorePackage(options: { page?: KorePage; manifest: ExecutableManifest; signal?: AbortSignal }): Promise<{
  manifest: KoreManifest; workerUrl: string;
  mapResourceConfig: { aliases: Record<string, string>; expectedSha256: Record<string, string> };
  configDefaults: Record<string, string>;
} | null>;
export function createKoreIntegration(options: KoreOptions): KoreIntegration;
export function startOptionalKore(options: Pick<KoreOptions, 'createWorker' | 'onWorkerReleased'>): KoreIntegration | null;
export function sendKoreNativePacket(action: unknown, packet: unknown, options?: KoreNativePacketSendOptions): boolean;
