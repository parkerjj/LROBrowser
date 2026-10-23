import type { KoreIntegration } from './kore-integration.mjs';
import type { KoreConsoleModel } from './kore-panel-console.mjs';
import type { KorePoller } from './kore-panel-poller.mjs';

export interface KoreRenderToggleLike {
  available: boolean; enabled: boolean;
  setEnabled(value: boolean): void;
  onChange?(listener: () => void): () => void;
}
export interface KoreStatusModel {
  connected: boolean; worldReady: boolean;
  name: string; job: string; level: string;
  hp: { value: number | null; max: number | null; percent: number | null };
  sp: { value: number | null; max: number | null; percent: number | null };
  weight: string; zeny: string;
  mode: string; task: string; target: string; next: string; reason: string;
  map: string; position: string;
}
export interface KoreWindow {
  element: HTMLElement; update(): void; send(text: string): boolean; focus(): void; destroy(): void;
  readonly input: HTMLInputElement; readonly consoleNode: HTMLElement;
  readonly commandButtons: HTMLButtonElement[]; readonly renderCheckbox: HTMLInputElement;
  readonly fullscreenButton: HTMLButtonElement; readonly debugButton: HTMLButtonElement;
}
export const KORE_QUICK_COMMANDS: ReadonlyArray<{ label: string; command: string; mode?: 'AUTO' | 'MANUAL' | 'OFF'; title?: string }>;
export function kvPairs(result: unknown): Map<string, string>;
export function parseRatio(text: unknown): { value: number | null; max: number | null; percent: number | null };
export function statusModel(options: {
  status?: unknown; ai?: unknown; where?: unknown;
  state?: { status?: string; worldReady?: boolean } | null;
}): KoreStatusModel;
export function createKoreWindow(options?: {
  page?: { document: Document };
  host?: Pick<KoreIntegration, 'state' | 'sendCommandText' | 'onStateChange' | 'beginLtsdLogin'
    | 'openLtsdApproval' | 'cancelLtsdLogin' | 'logoutLtsd' | 'refreshConfiguration'>;
  poller?: Pick<KorePoller, 'results' | 'errors' | 'subscribe'>;
  consoleModel?: Pick<KoreConsoleModel, 'entries' | 'subscribe'>;
  renderToggle?: KoreRenderToggleLike | null;
  history?: string[];
  onFullscreen?: () => void; onDebug?: () => void;
}): KoreWindow;
