export interface KoreDebugHost {
  state?: Record<string, unknown> & {
    configIdentity?: { aid: number; cid: number } | null;
    profile?: string;
    actions?: unknown[];
    diagnosticLog?: Array<{ timestamp: number; text: string }>;
  };
  sendCommandText?: (text: string, options?: { silent?: boolean }) => boolean;
  onCommandOutput?: (listener: (output: { command: string; result: unknown; silent: boolean }) => void) => () => void;
  onStateChange?: (listener: (state: unknown) => void) => () => void;
  clearConsole?: () => void;
  debugMapRetry?: () => boolean;
  getConfigDocuments?: (identity: unknown) => Promise<Array<{ fileName: string; rawText: string; revision: number }>>;
  saveConfigDocument?: (document: Record<string, unknown>) => Promise<{ fileName: string; rawText: string; revision: number }>;
  reloadConfig?: (target?: string) => boolean;
}
export interface KoreDebugView {
  element: HTMLElement;
  show(tab?: string): void; hide(): void; update(): void;
  readonly visible: boolean;
  destroy(): void;
}
export function createKoreDebugView(options?: {
  page?: { document: Document };
  host?: KoreDebugHost;
}): KoreDebugView;
