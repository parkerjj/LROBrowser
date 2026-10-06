export const JOB_NAME_OVERRIDES: Record<string, string>;
export const RUNTIME_TEXT_REPLACEMENTS: Array<[string, string]>;
export const MESSAGE_FALLBACKS: Record<number, string>;
export const MAP_NAME_OVERRIDES: Record<string, string>;
export const MAP_TITLE_OVERRIDES: Record<string, string>;
export interface LastroMapInfo {
  displayName?: string;
  signName?: { mainTitle?: string | null; subTitle?: string | null };
  backgroundBmp?: string | null;
  notifyEnter?: boolean;
  [key: string]: unknown;
}
export function createLastroMapLocalization(names?: Record<string, string>, titles?: Record<string, string>): {
  normalize(value: unknown): string;
  rememberName(mapname: unknown, value: string | undefined): string | undefined;
  resolveName(mapname: unknown, fallback?: string): string | undefined;
  localizeInfo(mapname: unknown, info: LastroMapInfo | null, tableName?: string): LastroMapInfo | null;
};
export function patchRuntimeMapLocalization(source: string): string;
export function setLastroStatusTooltip(node: HTMLElement, value: string | null | undefined): void;
export function patchRuntimeStatusTooltips(source: string): string;
export function assertRuntimeLocalizationMount(source: string, baseline?: string): void;
export const SKILL_NAME_OVERRIDES: Record<string, string>;
export const SKILL_DESCRIPTION_OVERRIDES: Record<string, string>;
export function patchRuntimeUiText(source: string): string;
export interface UiMessageOverride { source: string; label: string; }
export type UiMessageTable = Record<number, string> | string[];
export const UI_MESSAGE_OVERRIDES: Readonly<Record<number, UiMessageOverride>>;
export interface LastroUiMessages {
  loadCsv(data: ArrayBuffer | Uint8Array, targetTable: UiMessageTable, decode: (bytes: Uint8Array) => string): boolean;
  resolveMessage(id: number | string, value: unknown, defaultText?: string): string | undefined;
}
export function createLastroUiMessages(overrides?: Readonly<Record<number, UiMessageOverride>>): LastroUiMessages;
export function patchRuntimeUiMessages(source: string): string;
export function lastroItemEnchantName(info: unknown, normalCardResource?: string): string;
export function patchRuntimeItemName(source: string): string;
export function patchRuntimeEmoticons(source: string): string;
export function patchRuntimeLocalization(source: string): string;
export function patchRuntimeJobLocalization(source: string): string;
export function patchRuntimeSkillLocalization(source: string): string;
