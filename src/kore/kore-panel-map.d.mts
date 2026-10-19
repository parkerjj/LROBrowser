export const MAP_COLORS: Readonly<Record<string, string>>;
export interface KoreMapEntity { kind: string; gid: number | null; name: string; x: number; y: number }
export interface KoreMapLayout { scale: number; width: number; height: number; offsetX: number; offsetY: number }
export interface KoreMapBlock { mapName?: string; width?: number; height?: number; walkability?: string; walkabilityBytes?: Uint8Array }
export function decodeWalkability(encoded: unknown, width: number, height: number): Uint8Array;
export function walkableAt(bytes: Uint8Array, width: number, x: number, y: number): boolean;
export function layoutMap(width: number, height: number, maxWidth: number, maxHeight: number): KoreMapLayout;
export function parsePoint(text: unknown): { x: number; y: number } | null;
export function parseEntityTable(result: unknown, kind: string): KoreMapEntity[];
export function mapEntities(results?: { monsters?: unknown; players?: unknown; npcs?: unknown; items?: unknown }): KoreMapEntity[];
export function drawMap(ctx: CanvasRenderingContext2D, options?: {
  map?: KoreMapBlock; entities?: KoreMapEntity[]; self?: { x: number; y: number } | null;
  targetGid?: number | null; maxWidth?: number; maxHeight?: number;
}): KoreMapLayout | null;
export function targetGidFromAi(result: unknown): number | null;
