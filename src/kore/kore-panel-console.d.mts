import type { KoreLog } from './kore-integration.mjs';

export interface KoreOutputLine { text: string; domain: string; level: string; timestamp?: number }
export interface KoreConsoleBlock {
  type: string; domain?: string; level?: string; text?: string;
  pairs?: [string, string][]; columns?: string[]; rows?: string[][];
  mapName?: string; width?: number; height?: number;
}
export interface KoreConsoleResult { blocks?: KoreConsoleBlock[]; ok?: boolean; command?: string }
export interface KoreConsoleCategory { id: string; label: string; domains: string[]; hiddenByDefault?: boolean }
export interface KoreConsoleFilter {
  isVisible(domain?: string): boolean;
  isCategoryVisible(id: string): boolean;
  hiddenCount(): number;
  setCategoryVisible(id: string, visible: boolean): void;
  reset(): void;
  subscribe(listener: () => void): () => void;
}
export const KORE_CONSOLE_CATEGORIES: readonly KoreConsoleCategory[];
export function createConsoleFilter(options?: { storage?: Pick<Storage, 'getItem' | 'setItem'> | null }): KoreConsoleFilter;
export interface KoreConsoleModel {
  filter: KoreConsoleFilter;
  entries(): Array<KoreLog & { blocks?: KoreConsoleBlock[]; command?: string }>;
  clear(): void;
  subscribe(listener: (entries: ReturnType<KoreConsoleModel['entries']>) => void): () => void;
  dispose(): void;
}
export function consoleColor(domain?: string, level?: string): string;
export function tableText(columns?: string[], rows?: string[][]): string[];
export function outputBlockLines(block: KoreConsoleBlock): KoreOutputLine[];
export function outputLines(result: KoreConsoleResult): KoreOutputLine[];
export function logLines(entry: KoreLog & { blocks?: KoreConsoleBlock[]; command?: string }): KoreOutputLine[];
export function consoleLines(entries: Array<KoreLog & { blocks?: KoreConsoleBlock[]; command?: string }>): KoreOutputLine[];
export function createKoreConsoleModel(options: {
  host: { state?: { logs?: KoreLog[] }; onStateChange?: (listener: (state: unknown) => void) => () => void; clearConsole?: () => void };
  maxEntries?: number;
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null;
}): KoreConsoleModel;
export function renderConsole(
  container: HTMLElement | null,
  entries: Array<KoreLog & { blocks?: KoreConsoleBlock[]; command?: string }>,
  options?: { page?: { document?: Document }; maxLines?: number; filter?: KoreConsoleFilter | null },
): void;
