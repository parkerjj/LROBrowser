export const KORE_CONFIG_FILES: readonly string[];
export interface ExecutableFile { path: string; bytes: number; sha256: string; kind: string }
export interface ExecutableManifest { files: ExecutableFile[] }
export interface KoreManifest {
  schemaVersion: 2; engineVersion: string; bridgeApiVersion: 2;
  schedulerCapabilities?: ('fourQueues' | 'oneShotDeadline' | 'residentExecutor')[];
  packetver: 20211103; profile: 'lastro-20211103' | 'lastro-2x'; commitSha: string | null;
  sourceDirty: boolean; mode: 'debug' | 'release';
  toolVersions: { rust: string; wasmBindgen: string; binaryen: string | null };
  buildId: string;
  chunks: { boot: { file: string; sha256: string; encrypted: false };
    core: { file: string; sha256: string; encrypted: true; keyVersion: number } };
  files: ExecutableFile[]; packageId: string;
}
export interface KorePointer { schemaVersion: 1; packageId: string; manifestPath: string }
export interface KorePage {
  location: { href: string }; fetch: (url: URL, options?: RequestInit) => Promise<Response>;
  document?: EventTarget & { hidden: boolean }; performance?: { now(): number };
  localStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>; open?: typeof globalThis.open;
  setTimeout?: typeof globalThis.setTimeout; clearTimeout?: typeof globalThis.clearTimeout;
  crypto?: Pick<Crypto, 'randomUUID'>; setInterval?: typeof globalThis.setInterval;
  clearInterval?: typeof globalThis.clearInterval;
  KoreEngineDisconnect?: (reason: string) => unknown;
  KoreEngineNativeAction?: (action: unknown) => unknown;
  KoreEngineCurrentMap?: () => string;
}
export interface KoreWorker extends EventTarget { postMessage(message: unknown, transfer?: Transferable[]): void; terminate(): void }
export interface KoreLog { level: string; domain?: string; text: string; timestamp: number; blocks?: unknown[]; command?: string }
export interface KoreActionRecord { timestamp: number; requestId: number | null; routeId: number | null; type: string; detail: string; accepted: boolean; reason: string | null }
export interface KoreDisconnectSummary {
  at: number; reason: string; closeCode: number | null; closeReason: string | null; wasClean: boolean | null;
  socketAgeMs: number | null; lastSendAgoMs: number | null; lastReceiveAgoMs: number | null;
  sendsLast1s: number; sendsLast10s: number; sendsLast60s: number; peakSendsPerSecond: number;
  topPacketsLast10s: { id: string; count: number }[]; sentBytes: number; receivedBytes: number;
}
export interface KoreState {
  status: 'absent' | 'loading' | 'restarting' | 'runtime-ready' | 'failed' | 'unavailable' | 'disposed';
  packageId: string | null; mode: 'debug' | 'release' | null; runtimeGeneration: number;
  profile: 'lastro-20211103' | 'lastro-2x'; gameSessionId: string | null; connectionGeneration: number | null;
  streamStatus: 'idle' | 'awaiting-connection' | 'awaiting-sync' | 'world-ready' | 'degraded';
  worldReady: boolean; mapResourceState: 'idle' | 'loading' | 'retrying' | 'ready' | 'degraded';
  receivedBytes: number; sentBytes: number; degradedReason: string | null; logs: KoreLog[];
  disconnect: KoreDisconnectSummary | null;
  runtimeStatus: unknown; lastDiagnostic: unknown; lastCommandResult: unknown;
  configIdentity: { aid: number; cid: number; nid: number } | null;
  bootSession?: { instanceId: string; publicKey: string; buildId: string; buildHash: string } | null;
  authorization?: {
    phase: string; user: { id: string; displayName: string } | null; userCode: string | null;
    verificationUriComplete: string | null; expiresAt: number | null; interval: number;
    profileUpdatedAt: number | null; error: string | null; stalled?: boolean;
  };
  /** Display-only copies for the debug panel; the Host never decides gameplay from them. */
  lastWorldState: Record<string, unknown> | null; lastWorldStateAt: number | null;
  heartbeat: { at: number; nextDeadlineMs: number | null; queueDepth: unknown } | null;
  actions: KoreActionRecord[]; diagnosticLog: { timestamp: number; text: string }[];
  /** Worker 自动重建与会话恢复进度（崩溃 → 重启 → 对齐收包流 → 飞艇换图 → 恢复 AI）。 */
  recovery?: { restarts: number; stage: 'idle' | 'restarting' | 'awaiting-alignment' | 'awaiting-world'; lastReason: string | null };
}
export interface KoreOptions {
  page?: KorePage; manifest: ExecutableManifest;
  createWorker?: (url: string) => KoreWorker; onWorkerReleased?: () => void; onChange?: (state: KoreState) => void;
  mapResourceProvider?: import('./map-resource-provider.mjs').MapResourceProvider;
  ltsdClient?: import('./kore-ltsd-client.mjs').KoreLtsdClient; serverFieldsFolder?: string;
  restartPolicy?: { maxRestarts?: number; windowMs?: number; backoffMs?: number[]; resyncDelayMs?: number; resyncTimeoutMs?: number };
}
export interface KoreCommandOutput { command: string; result: unknown; silent: boolean }
export interface KoreIntegration {
  state: KoreState; start(): Promise<void>; dispose(): void;
  beginGameSession(characterGid: number, mapName: string, identity?: { aid?: number; cid?: number; nid?: number;
    name?: string; baseLevel?: number; jobLevel?: number; jobId?: number; zeny?: number }): string | null;
  beginMapConnection(): number | null;
  mirrorMapData(connectionGeneration: number, data: ArrayBuffer | ArrayBufferView, options?: { aligned?: boolean }): boolean;
  degradeConnection(reason?: string, details?: { code?: number; reason?: string; wasClean?: boolean } | null): boolean;
  mirrorSentBytes(bytes: number, gameSessionId?: string | null, packetId?: number | null): boolean;
  endGameSession(): boolean; clearConsole(): void; debugMapRetry(): boolean;
  saveConfigDocument(document: unknown): Promise<unknown>; getConfigDocuments(identity: unknown): Promise<unknown[]>;
  getConfigDefault(fileName: string): string | null;
  refreshConfiguration(identity?: { profile: string; aid: number; cid: number; nid: number }): Promise<{ status: string; cached?: boolean; updatedAt?: number | null; error?: string | null }>;
  retryAuthorization(): Promise<boolean>;
  getAuthorizationDiagnostics(): string;
  beginLtsdLogin(): Promise<boolean>; openLtsdApproval(): boolean; cancelLtsdLogin(): void; logoutLtsd(): Promise<boolean>;
  reloadConfig(target?: string): boolean; debugCommand(command: string): boolean; sendCommand(command: string, extraFields?: Record<string, unknown>): boolean;
  sendCommandText(text: string, options?: { silent?: boolean }): boolean;
  onCommandOutput(listener: (output: KoreCommandOutput) => void): () => void;
  onStateChange(listener: (state: KoreState) => void): () => void;
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
