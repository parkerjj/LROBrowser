interface LifeData { hp?: number; hp_max?: number; sp?: number; sp_max?: number; hunger?: number; hunger_max?: number; }
interface PartyEntity {
  objecttype: number;
  constructor: { TYPE_PC: number; TYPE_DISGUISED?: number };
  life: LifeData & { remove(): void };
}
interface Member { AID: number; characterName?: string; mapName?: string; state?: number; [key: string]: unknown; }
interface MiniMap { removePartyMemberMark(aid: number): void; clearPartyMemberMarks(): void; }
export function createLastroPartyState(deps: {
  session: { AID: number; GID: number; Entity: PartyEntity; hasParty: boolean; isPartyLeader: boolean };
  entityManager: {
    get(aid: number): PartyEntity | null | undefined;
    getLife(aid: number): LifeData | null | undefined;
    storeLife(aid: number, data: LifeData): unknown;
    removeLife(aid: number): void;
  };
  getMiniMaps(): Array<MiniMap | null | undefined>;
  worldMap: { updatePartyMembers(packet: { groupInfo: Member[] }): void };
}): {
  setRoster(members: Member[]): boolean;
  join(member: Member): boolean;
  leave(aid: number): void;
  canUpdate(aid: number): boolean;
  storeLife(aid: number, data: LifeData): void;
  reset(): void;
};
export function patchRuntimePartyState(source: string): string;
