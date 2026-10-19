import type { KorePoller } from './kore-panel-poller.mjs';

export type KoreShellMode = 'lastro' | 'kore';
export const KORE_SHELL_MODE_KEY: string;
export interface KoreShellHost {
  state?: { worldReady?: boolean; status?: string; logs?: unknown[] } & Record<string, unknown>;
  sendCommandText?: (text: string, options?: { silent?: boolean }) => boolean;
  onCommandOutput?: (listener: (output: { command: string; result: unknown; silent: boolean }) => void) => () => void;
  onStateChange?: (listener: (state: unknown) => void) => () => void;
  clearConsole?: () => void;
  debugMapRetry?: () => boolean;
}
export interface KoreShell {
  readonly mode: KoreShellMode;
  readonly host: KoreShellHost | null;
  readonly poller: KorePoller | null;
  readonly initialized: boolean;
  setMode(mode: KoreShellMode): void;
  setVisible(visible: boolean): void;
  openFullscreen(): void;
  openDebug(): void;
  focus(): void;
  dispose(): void;
}
export function createKoreShell(options?: {
  page?: Record<string, unknown>;
  container?: HTMLElement;
  getHost?: () => KoreShellHost | null | undefined;
  onModeChange?: (mode: KoreShellMode) => void;
  initialMode?: KoreShellMode | null;
  history?: string[];
}): KoreShell;
export function initializeKoreShell(options?: Parameters<typeof createKoreShell>[0]): KoreShell;
