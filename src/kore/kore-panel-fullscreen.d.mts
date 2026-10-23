import type { KoreIntegration } from './kore-integration.mjs';
import type { KoreConsoleModel } from './kore-panel-console.mjs';
import type { KorePoller } from './kore-panel-poller.mjs';

export interface KoreFullscreen {
  element: HTMLElement;
  update(): void;
  close(): void;
  destroy(): void;
  readonly closed: boolean;
}
export function createKoreFullscreen(options?: {
  page?: { document: Document; setTimeout?: (fn: () => void, ms: number) => unknown; requestAnimationFrame?: (fn: () => void) => unknown; matchMedia?: (query: string) => { matches: boolean } };
  host?: Pick<KoreIntegration, 'state' | 'sendCommandText' | 'onCommandOutput' | 'onStateChange'>;
  poller?: Pick<KorePoller, 'results' | 'errors' | 'subscribe' | 'setView' | 'setTab' | 'request'>;
  consoleModel?: Pick<KoreConsoleModel, 'entries' | 'subscribe'>;
  history?: string[];
  onExit?: () => void;
}): KoreFullscreen;
