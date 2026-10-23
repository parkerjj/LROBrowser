export type KorePanelView = 'small' | 'fullscreen' | 'hidden';
export interface KorePollRegion { command: string; intervalMs: number; views: KorePanelView[]; tab?: string }
export interface KorePoller {
  results(name: string): unknown;
  errors(name: string): unknown;
  subscribe(listener: (name: string, result: unknown, error: unknown) => void): () => void;
  setView(view: KorePanelView): void;
  setTab(tab: string | null): void;
  request(name: string): boolean;
  start(): void;
  stop(): void;
  dispose(): void;
}
export const KORE_POLL_REGIONS: Readonly<Record<string, KorePollRegion>>;
export interface KorePollerHost {
  state?: { worldReady?: boolean; status?: string; logs?: unknown[] };
  sendCommandText?: (text: string, options?: { silent?: boolean }) => boolean;
  onCommandOutput?: (listener: (output: { command: string; result: unknown; silent: boolean }) => void) => () => void;
  onStateChange?: (listener: (state: unknown) => void) => () => void;
}
export function createKorePoller(options?: {
  host?: KorePollerHost;
  page?: { document?: { hidden?: boolean }; setInterval?: (fn: () => void, ms: number) => unknown; clearInterval?: (id: unknown) => void };
  regions?: Record<string, KorePollRegion>;
  setInterval?: (fn: () => void, ms: number) => unknown;
  clearInterval?: (id: unknown) => void;
  now?: () => number;
}): KorePoller;
