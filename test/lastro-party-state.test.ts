// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { createLastroPartyState } from '../scripts/lastro-party-state.mjs';

const types = { TYPE_PC: 0, TYPE_DISGUISED: 1, TYPE_MOB: 5, TYPE_NPC: 6, TYPE_PET: 7, TYPE_MER: 8 };
interface LifeData { hp?: number; hp_max?: number; sp?: number; sp_max?: number; hunger?: number; hunger_max?: number; }
interface Life extends LifeData { hp: number; hp_max: number; display: boolean; canvas: HTMLCanvasElement; remove: Mock<() => void>; update(): void; }
interface Actor { GID: number; AID: number; objecttype: number; constructor: typeof types; life: Life; }
interface Member { AID: number; characterName: string; state: number; mapName: string; [key: string]: unknown; }
const member = (aid: number, map = 'prontera.gat', state = 0): Member => ({ AID: aid, characterName: '玩家' + aid, state, mapName: map });

function fixture() {
  const actors = new Map<number, Actor>(), cache = new Map<number, LifeData>();
  const overlay = document.createElement('div'); document.body.appendChild(overlay);
  function spawn(aid: number, objecttype = types.TYPE_PC) {
    const canvas = document.createElement('canvas'); canvas.className = 'entity-life';
    const life: Life = {
      hp: -1, hp_max: -1, display: false, canvas,
      remove: vi.fn(() => { life.display = false; canvas.remove(); }),
      update() { if (life.hp < 0 || life.hp_max < 0) life.remove(); else { life.display = true; overlay.appendChild(canvas); } },
    };
    // Native actor GID is the account ID; actor AID is a distinct character ID.
    const actor: Actor = { GID: aid, AID: aid + 10000, objecttype, constructor: types, life };
    actors.set(aid, actor);
    const cached = cache.get(aid);
    if (cached) { Object.assign(life, cached); life.update(); }
    return actor;
  }
  const self = spawn(10); self.life.hp = 90; self.life.hp_max = 100; self.life.update();
  const session = { AID: 10, GID: 9000, Entity: self, hasParty: true, isPartyLeader: true };
  const manager = {
    get: vi.fn((aid: number) => actors.get(aid)),
    getLife: vi.fn((aid: number) => cache.get(aid) ?? null),
    storeLife: vi.fn((aid: number, data: LifeData) => { cache.set(aid, Object.assign(cache.get(aid) ?? {}, data)); }),
    removeLife: vi.fn((aid: number) => { cache.delete(aid); }),
  };
  const makeMiniMap = () => {
    const party = new Map<number, [number, number]>(), guild = new Map([[777, [7, 7]]]), npc = new Map([[888, [8, 8]]]);
    return { party, guild, npc, addPartyMemberMark: vi.fn((aid: number, x: number, y: number) => { party.set(aid, [x, y]); }),
      removePartyMemberMark: vi.fn((aid: number) => { party.delete(aid); }), clearPartyMemberMarks: vi.fn(() => { party.clear(); }) };
  };
  const minimaps = [makeMiniMap(), makeMiniMap()];
  const worldMap = { updatePartyMembers: vi.fn<(packet: { groupInfo: Member[] }) => void>() };
  const state = createLastroPartyState({ session, entityManager: manager, getMiniMaps: () => minimaps, worldMap });
  function roster(members = [member(10), member(20), member(30, 'izlude.gat')]) {
    expect(state.setRoster(members)).toBe(true);
    for (const value of members) if (value.AID !== session.AID) for (const minimap of minimaps) minimap.addPartyMemberMark(value.AID, value.AID, value.AID + 1);
  }
  function partyHp(aid: number, hp = 50, hpMax = 100) {
    if (!state.canUpdate(aid)) return false;
    state.storeLife(aid, { hp, hp_max: hpMax });
    const actor = actors.get(aid);
    if (actor) { actor.life.hp = hp; actor.life.hp_max = hpMax; actor.life.update(); }
    return true;
  }
  function ordinaryHp(aid: number, hp = 25, hpMax = 200) {
    manager.storeLife(aid, { hp, hp_max: hpMax });
    const actor = actors.get(aid);
    if (actor) { actor.life.hp = hp; actor.life.hp_max = hpMax; actor.life.update(); }
  }
  function move(aid: number) {
    if (!state.canUpdate(aid)) return false;
    for (const minimap of minimaps) minimap.addPartyMemberMark(aid, 3, 4);
    return true;
  }
  return { state, session, self, actors, cache, manager, minimaps, worldMap, roster, spawn, partyHp, ordinaryHp, move };
}

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

describe('party membership and map overlay cleanup', () => {
  it('clears every former teammate on self leave across both minimap versions without removing actors or guild/NPC marks', () => {
    const f = fixture(), first = f.spawn(20), second = f.spawn(30); f.roster(); f.partyHp(20); f.partyHp(30);
    for (const map of f.minimaps) map.party.set(99, [9, 9]); // Residue predating the tracked roster is party-only too.
    expect(first.life.canvas.isConnected).toBe(true); expect(second.life.canvas.isConnected).toBe(true);
    f.state.leave(f.session.AID);
    for (const map of f.minimaps) { expect(map.party.size).toBe(0); expect(map.guild.size).toBe(1); expect(map.npc.size).toBe(1); expect(map.clearPartyMemberMarks).toHaveBeenCalledTimes(1); }
    for (const actor of [first, second]) {
      expect(actor.life.display).toBe(false); expect(actor.life.canvas.isConnected).toBe(false);
      expect(actor.life.hp).toBe(-1); expect(actor.life.hp_max).toBe(-1); expect(f.cache.has(actor.GID)).toBe(false);
      expect(f.actors.get(actor.GID)).toBe(actor);
      actor.life.update(); expect(actor.life.canvas.isConnected).toBe(false);
    }
    expect(f.worldMap.updatePartyMembers).toHaveBeenLastCalledWith({ groupInfo: [] });
    expect(f.self.life.canvas.isConnected).toBe(true); expect(f.self.life.hp).toBe(90); expect(f.self.life.hp_max).toBe(100);
    expect(f.state.canUpdate(20)).toBe(false); expect(f.state.canUpdate(30)).toBe(false);
  });

  it('removes only a departing teammate and refreshes the world map while preserving the remaining party', () => {
    const f = fixture(), departing = f.spawn(20), remaining = f.spawn(30); f.roster(); f.partyHp(20); f.partyHp(30);
    f.state.leave(20);
    for (const map of f.minimaps) { expect(map.party.has(20)).toBe(false); expect(map.party.has(30)).toBe(true); }
    expect(departing.life.canvas.isConnected).toBe(false); expect(remaining.life.canvas.isConnected).toBe(true);
    expect(f.cache.has(20)).toBe(false); expect(f.cache.has(30)).toBe(true);
    expect(f.state.canUpdate(20)).toBe(false); expect(f.state.canUpdate(30)).toBe(true);
    expect(f.worldMap.updatePartyMembers.mock.lastCall?.[0].groupInfo.map(value => value.AID)).toEqual([10, 30]);
  });

  it('treats an empty authoritative roster as complete party cleanup', () => {
    const f = fixture(), actor = f.spawn(20); f.roster(); f.partyHp(20);
    expect(f.state.setRoster([])).toBe(true);
    expect(actor.life.canvas.isConnected).toBe(false); expect(f.cache.has(20)).toBe(false);
    expect(f.state.canUpdate(10)).toBe(false); expect(f.state.canUpdate(20)).toBe(false);
    for (const map of f.minimaps) expect(map.party.size).toBe(0);
    expect(f.worldMap.updatePartyMembers).toHaveBeenLastCalledWith({ groupInfo: [] });
  });

  it('cleans members omitted from a replacement roster and keeps unchanged members visible', () => {
    const f = fixture(), departed = f.spawn(20), retained = f.spawn(30); f.roster(); f.partyHp(20); f.partyHp(30);
    expect(f.state.setRoster([member(10), member(30, 'payon.gat')])).toBe(true);
    expect(departed.life.canvas.isConnected).toBe(false); expect(retained.life.canvas.isConnected).toBe(true);
    expect(f.cache.has(20)).toBe(false); expect(f.cache.has(30)).toBe(true);
    for (const map of f.minimaps) { expect(map.party.has(20)).toBe(false); expect(map.party.has(30)).toBe(true); }
    expect(f.worldMap.updatePartyMembers.mock.lastCall?.[0].groupInfo).toEqual([member(10), member(30, 'payon.gat')]);
  });

  it('rejects late party HP and position notifications after a member leaves', () => {
    const f = fixture(), actor = f.spawn(20); f.roster(); f.partyHp(20); f.state.leave(20);
    expect(f.partyHp(20, 90)).toBe(false); expect(f.move(20)).toBe(false);
    expect(actor.life.canvas.isConnected).toBe(false); expect(f.cache.has(20)).toBe(false);
    for (const map of f.minimaps) expect(map.party.has(20)).toBe(false);
  });

  it('rejects late updates for the whole former party after a self leave', () => {
    const f = fixture(); f.roster(); f.partyHp(20); f.state.leave(10);
    expect(f.move(20)).toBe(false); expect(f.move(30)).toBe(false); expect(f.partyHp(20)).toBe(false);
    expect(f.cache.size).toBe(0); for (const map of f.minimaps) expect(map.party.size).toBe(0);
  });

  it('clears offscreen party HP so a later entity spawn cannot restore a former teammate bar', () => {
    const f = fixture(); f.roster(); f.partyHp(20, 65, 130);
    expect(f.cache.get(20)).toEqual({ hp: 65, hp_max: 130 });
    f.state.leave(20); expect(f.cache.has(20)).toBe(false);
    const actor = f.spawn(20); expect(actor.life.hp).toBe(-1); expect(actor.life.hp_max).toBe(-1);
    expect(actor.life.canvas.isConnected).toBe(false); expect(f.partyHp(20)).toBe(false);
  });

  it('cleans a teammate that spawned after its party HP cache was created', () => {
    const f = fixture(); f.roster(); f.partyHp(20, 65, 130);
    const actor = f.spawn(20); expect(actor.life.canvas.isConnected).toBe(true);
    f.state.leave(20); expect(actor.life.canvas.isConnected).toBe(false); expect(actor.life.hp).toBe(-1); expect(f.cache.has(20)).toBe(false);
  });

  it('preserves offscreen general HP received after party HP and restores only that independent source on spawn', () => {
    const f = fixture(); f.roster(); f.partyHp(20); f.ordinaryHp(20, 45, 90); f.state.leave(20);
    const actor = f.spawn(20); expect(actor.life.hp).toBe(45); expect(actor.life.hp_max).toBe(90);
    expect(actor.life.canvas.isConnected).toBe(true); expect(f.cache.get(20)).toEqual({ hp: 45, hp_max: 90 });
  });

  it('allows a departed member to rejoin and receive fresh party HP/position updates', () => {
    const f = fixture(), actor = f.spawn(20); f.roster(); f.partyHp(20); f.state.leave(20);
    expect(f.state.join(member(20, 'geffen.gat'))).toBe(true); expect(f.state.canUpdate(20)).toBe(true);
    expect(f.partyHp(20, 70, 140)).toBe(true); expect(f.move(20)).toBe(true);
    expect(actor.life.hp).toBe(70); expect(actor.life.canvas.isConnected).toBe(true);
    expect(f.worldMap.updatePartyMembers.mock.lastCall?.[0].groupInfo.find(value => value.AID === 20)?.mapName).toBe('geffen.gat');
  });

  it('updates a joined member without duplicating the same account in world map data', () => {
    const f = fixture(); f.roster(); expect(f.state.join(member(20, 'geffen.gat', 1))).toBe(true);
    const members = f.worldMap.updatePartyMembers.mock.lastCall?.[0].groupInfo ?? [];
    expect(members.filter(value => value.AID === 20)).toEqual([member(20, 'geffen.gat', 1)]);
  });

  it('makes reset idempotent and permits a fresh reliable roster afterwards', () => {
    const f = fixture(), actor = f.spawn(20); f.roster(); f.partyHp(20); f.state.reset(); f.state.reset();
    expect(actor.life.canvas.isConnected).toBe(false); expect(f.cache.has(20)).toBe(false);
    expect(f.state.canUpdate(20)).toBe(false); for (const map of f.minimaps) expect(map.party.size).toBe(0);
    f.session.hasParty = true; expect(f.state.setRoster([member(10), member(20)])).toBe(true);
    expect(f.partyHp(20, 80)).toBe(true); expect(actor.life.canvas.isConnected).toBe(true);
  });

  it('does not remove an unrelated player bar or its general HP cache', () => {
    const f = fixture(), outsider = f.spawn(40); f.roster(); f.ordinaryHp(40); f.state.leave(10);
    expect(outsider.life.canvas.isConnected).toBe(true); expect(outsider.life.hp).toBe(25); expect(outsider.life.hp_max).toBe(200);
    expect(f.cache.get(40)).toEqual({ hp: 25, hp_max: 200 }); expect(outsider.life.remove).not.toHaveBeenCalled();
  });

  it('preserves a teammate bar replaced by a later non-party HP write', () => {
    const f = fixture(), actor = f.spawn(20); f.roster(); f.partyHp(20); f.ordinaryHp(20, 75, 300); f.state.leave(20);
    expect(actor.life.canvas.isConnected).toBe(true); expect(actor.life.hp).toBe(75); expect(actor.life.hp_max).toBe(300);
    expect(f.cache.get(20)).toEqual({ hp: 75, hp_max: 300 }); expect(actor.life.remove).not.toHaveBeenCalled();
  });

  it('preserves a later ordinary HP source even when its values equal the preceding party update', () => {
    const f = fixture(), actor = f.spawn(20); f.roster(); f.partyHp(20, 50, 100); f.ordinaryHp(20, 50, 100); f.state.leave(20);
    expect(actor.life.canvas.isConnected).toBe(true); expect(f.cache.get(20)).toEqual({ hp: 50, hp_max: 100 });
    expect(actor.life.remove).not.toHaveBeenCalled();
  });

  it.each([{ hp: 40 }, { hp_max: 200 }])('revokes party ownership for an independent partial HP write (%s)', data => {
    const f = fixture(), actor = f.spawn(20); f.roster(); f.partyHp(20);
    f.manager.storeLife(20, data); Object.assign(actor.life, data); actor.life.update(); f.state.leave(20);
    expect(actor.life.canvas.isConnected).toBe(true); expect(actor.life.remove).not.toHaveBeenCalled();
    expect(f.cache.get(20)).toEqual({ hp: 50, hp_max: 100, ...data });
  });

  it('does not overwrite a changed live entity while clearing its still-owned obsolete party cache', () => {
    const f = fixture(), actor = f.spawn(20); f.roster(); f.partyHp(20);
    actor.life.hp = 80; actor.life.hp_max = 160; actor.life.update(); f.state.leave(20);
    expect(actor.life.canvas.isConnected).toBe(true); expect(actor.life.hp).toBe(80); expect(actor.life.hp_max).toBe(160);
    expect(actor.life.remove).not.toHaveBeenCalled(); expect(f.cache.has(20)).toBe(false);
  });

  it('cleans party HP after an unrelated SP-only cache update without retaining a stale HP pair', () => {
    const f = fixture(), actor = f.spawn(20); f.roster(); f.partyHp(20);
    f.manager.storeLife(20, { sp: 33, sp_max: 66 }); f.state.leave(20);
    expect(actor.life.canvas.isConnected).toBe(false);
    expect(f.cache.get(20)?.hp ?? -1).toBeLessThan(0); expect(f.cache.get(20)?.hp_max ?? -1).toBeLessThan(0);
    expect(f.cache.get(20)?.sp).toBe(33); expect(f.cache.get(20)?.sp_max).toBe(66);
  });

  it('lets a later party update take ownership again after a general HP source', () => {
    const f = fixture(), actor = f.spawn(20); f.roster(); f.partyHp(20); f.ordinaryHp(20); f.partyHp(20, 80, 100); f.state.leave(20);
    expect(actor.life.canvas.isConnected).toBe(false); expect(f.cache.has(20)).toBe(false);
  });

  it('does not clear the local player HP/SP even if its party HP notification was processed', () => {
    const f = fixture(); f.roster(); f.self.life.sp = 20; f.self.life.sp_max = 40; f.partyHp(10, 80, 100);
    f.state.leave(10); expect(f.self.life.canvas.isConnected).toBe(true); expect(f.self.life.hp).toBe(80);
    expect(f.self.life.sp).toBe(20); expect(f.self.life.sp_max).toBe(40); expect(f.self.life.remove).not.toHaveBeenCalled();
  });

  it.each([types.TYPE_MOB, types.TYPE_NPC, types.TYPE_PET, types.TYPE_MER])('does not clear a non-player entity with a colliding numeric ID (type %s)', objecttype => {
    const f = fixture(), actor = f.spawn(20, objecttype); f.roster(); f.partyHp(20); f.state.leave(20);
    expect(actor.life.canvas.isConnected).toBe(true); expect(actor.life.hp).toBe(50); expect(actor.life.remove).not.toHaveBeenCalled();
  });

  it('cleans a disguised party player using its account ID while keeping a distinct character-ID collision intact', () => {
    const f = fixture(), disguised = f.spawn(20, types.TYPE_DISGUISED), other = f.spawn(10020); f.roster(); f.partyHp(20); f.ordinaryHp(10020);
    f.state.leave(20); expect(disguised.life.canvas.isConnected).toBe(false); expect(other.life.canvas.isConnected).toBe(true);
    expect(f.cache.has(20)).toBe(false); expect(f.cache.has(10020)).toBe(true);
  });

  it('cleans the old party source when a roster account changes to a different character name', () => {
    const f = fixture(), actor = f.spawn(20); f.roster(); f.partyHp(20);
    expect(f.state.setRoster([member(10), { ...member(20), characterName: '另一个角色' }])).toBe(true);
    expect(actor.life.canvas.isConnected).toBe(false); expect(f.cache.has(20)).toBe(false); expect(f.state.canUpdate(20)).toBe(true);
    expect(f.partyHp(20, 90, 180)).toBe(true); expect(actor.life.canvas.isConnected).toBe(true);
  });

  it('does not accept another account join after the local player has left', () => {
    const f = fixture(); f.roster(); f.state.leave(10);
    expect(f.state.join(member(40))).toBe(false); expect(f.state.canUpdate(40)).toBe(false); expect(f.move(40)).toBe(false);
  });

  it('can establish a new party from a self join after a full leave', () => {
    const f = fixture(); f.roster(); f.state.leave(10);
    expect(f.state.join(member(10))).toBe(true); expect(f.state.join(member(40))).toBe(true);
    expect(f.state.canUpdate(40)).toBe(true); expect(f.partyHp(40)).toBe(true);
  });

  it('leaves unrelated state untouched when a nonexistent member departure arrives', () => {
    const f = fixture(), actor = f.spawn(40); f.roster(); f.ordinaryHp(40); f.state.leave(99);
    expect(f.state.canUpdate(20)).toBe(true); expect(f.state.canUpdate(30)).toBe(true);
    expect(actor.life.canvas.isConnected).toBe(true); expect(f.cache.has(40)).toBe(true);
    for (const map of f.minimaps) expect([...map.party.keys()]).toEqual([20, 30]);
  });

  it('uses defensive roster snapshots so outside mutations cannot silently alter party cleanup identity', () => {
    const f = fixture(), actor = f.spawn(20), values = [member(10), member(20)]; f.roster(values); f.partyHp(20);
    values[1]!.AID = 999; values.push(member(30));
    expect(f.state.canUpdate(20)).toBe(true); expect(f.state.canUpdate(999)).toBe(false); expect(f.state.canUpdate(30)).toBe(false);
    f.state.leave(10); expect(actor.life.canvas.isConnected).toBe(false); expect(f.cache.has(20)).toBe(false);
  });
});
