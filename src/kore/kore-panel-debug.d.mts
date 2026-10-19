import type { KoreIntegration } from './kore-integration.mjs';

export interface KoreDebugView {
  element: HTMLElement;
  show(tab?: string): void; hide(): void; update(): void;
  readonly visible: boolean;
  destroy(): void;
}
export function createKoreDebugView(options?: {
  page?: { document: Document };
  host?: Pick<KoreIntegration, 'state' | 'sendCommandText' | 'onCommandOutput' | 'onStateChange' | 'clearConsole' | 'debugMapRetry' | 'getConfigDocuments' | 'saveConfigDocument' | 'reloadConfig'>;
}): KoreDebugView;
