export interface KoreItemRow { index: string; name: string; amount: string; category: string; location: string; id: string }
export interface KoreItemGroup { key: string; label: string; rows: KoreItemRow[] }
export interface KoreEquipmentSlot { key: string; label: string; item: KoreItemRow | null }
export interface KoreEarningItem { scope: string; id: string; name: string; amount: number }
export interface KoreEarnings {
  kv: Map<string, string>;
  baseLevel: string;
  jobLevel: string;
  monsters: Array<{ name: string; id: string; count: number }>;
  gained: KoreEarningItem[];
  consumed: KoreEarningItem[];
}
export const ITEM_GROUPS: ReadonlyArray<{ key: string; label: string; categories: string[] }>;
export const NOT_WORN: string;
export const EQUIP_SLOTS: ReadonlyArray<readonly [string, string]>;
export const EXP_ROWS: ReadonlyArray<readonly [string, string, string]>;
export function parseItemRows(result: unknown): KoreItemRow[] | null;
export function isWorn(row: KoreItemRow): boolean;
export function groupItems(rows: KoreItemRow[], query?: string): KoreItemGroup[];
export function equipmentView(rows: KoreItemRow[]): KoreEquipmentSlot[];
export function isBroken(name: string): boolean;
export function parseEarnings(result: unknown): KoreEarnings | null;
