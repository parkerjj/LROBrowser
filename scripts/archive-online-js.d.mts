export const ONLINE_JS_URL: string;
export const PRETTIER_VERSION: string;
export function shortHash(bytes: Uint8Array): string;
export function buildArchiveName(date: Date, hash: string): string;
export function latestArchivedHash(fileNames: string[]): string | null;
export function downloadOnlineJs(url?: string, options?: { fetchImpl?: typeof fetch }): Promise<Uint8Array>;
export function formatWithPrettier(bytes: Uint8Array): string;
export function splitModules(prettyText: string): { file: string; text: string }[];
export interface ArchiveResult { changed: boolean; hash: string; name?: string; modules?: number; formatError?: Error }
export function archiveOnlineJs(options: {
  archiveDir: string;
  url?: string;
  now?: Date;
  download?: (url: string) => Promise<Uint8Array>;
  format?: (bytes: Uint8Array) => string | Promise<string>;
}): Promise<ArchiveResult>;
