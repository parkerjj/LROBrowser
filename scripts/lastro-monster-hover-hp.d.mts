export interface LastroMonsterHoverEntity {
  GID: number;
  objecttype: number;
  constructor: { TYPE_MOB?: number };
}
export interface LastroMonsterHoverPacket { hp?: unknown; maxhp?: unknown }
export interface LastroMonsterHoverHp {
  update(gid: number, hp: unknown, maxhp: unknown): void;
  tiny(gid: number, units?: unknown): void;
  name(entity: LastroMonsterHoverEntity, rawName: unknown): void;
  spawn(entity: LastroMonsterHoverEntity, packet: LastroMonsterHoverPacket): void;
  remove(gid: number): void;
  clear(): void;
  text(entity: LastroMonsterHoverEntity): string;
}
export function createLastroMonsterHoverHp(options: {
  getEntity(gid: number): LastroMonsterHoverEntity | null | undefined;
  getLife(gid: number): object | null | undefined;
  now?(): number;
}): LastroMonsterHoverHp;
export function patchRuntimeMonsterHoverHp(source: string): string;
