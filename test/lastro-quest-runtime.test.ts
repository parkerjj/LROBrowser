import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLastroQuestData } from '../scripts/lastro-quest-data.mjs';
import { installLastroQuestBridge } from '../scripts/lastro-quest-runtime.mjs';

type Goal = { huntID?: number; mobGID: number; huntCount: number; maxCount: number; };
type Quest = { questID: number; active: number; hunt_list: Record<string, Goal>; [key: string]: unknown; };
function fixture() {
  let quests: Record<string, Quest> = {}, ready = true;
  const query = vi.fn();
  const ui = {
    setQuestList: vi.fn((values: Record<string, Quest>) => { quests = values; }),
    addQuest: (value: Quest, id: number) => { quests[id] = value; },
    updateMissionHunt: (update: Partial<Goal>, id: number, huntID: number) => { Object.assign(quests[id]!.hunt_list[huntID]!, update); },
    removeQuest: (id: number) => { delete quests[id]; },
    onAppend: vi.fn(), onRemove: vi.fn(), clean: () => { quests = {}; }, toggle: vi.fn(), onShortCut: vi.fn(),
  };
  const data = createLastroQuestData({ getInfo: () => ({ Title: '任务', Description: ['任务信息'] }), getMonsterName: () => '波利', isLastro: true });
  const quest = installLastroQuestBridge(ui, { data, getQuests: () => quests, canRefresh: () => ready, queryHuntingList: query });
  return { quest, quests: () => quests, query, ready: (value: boolean) => { ready = value; } };
}
const snapshot = (count = 0) => ({ HuntingList: [{ questID: 30001, mobGID: 1002, maxCount: 80, count }] });
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1_800_000_000_000); });
afterEach(() => vi.useRealTimers());

describe('native bounty snapshot bridge', () => {
  it('merges bounty snapshots with ordinary accepted quests and treats empty snapshots as removal', () => {
    const f = fixture();
    f.quest.setQuestList({ 7: { questID: 7, active: 0, hunt_list: {} } });
    f.quest.receiveHuntingList(snapshot(3));
    expect(f.quests()[30001]?.hunt_list[1002]).toMatchObject({ mobGID: 1002, huntCount: 3, maxCount: 80 });
    expect(f.quests()[7]?.active).toBe(0);
    f.quest.setQuestList({ 8: { questID: 8, active: 1, hunt_list: {} } });
    expect(Object.keys(f.quests())).toEqual(['8', '30001']);
    f.quest.receiveHuntingList({ HuntingList: [] });
    expect(Object.keys(f.quests())).toEqual(['8']);
  });

  it('keeps standard hunt identifiers separate from actual monster IDs and accepts zero progress', () => {
    const f = fixture();
    f.quest.setQuestList({ 7: { questID: 7, active: 1, hunt_list: { 9001: { huntID: 9001, mobGID: 1002, huntCount: 4, maxCount: 9 } } } });
    f.quest.receiveHuntingList(snapshot(8));
    f.quest.updateMissionHunt({ huntCount: 0 }, 30001, 1002);
    f.quest.updateMissionHunt({ huntCount: 0 }, 7, 9001);
    f.quest.addQuest({ questID: 8, active: 1, hunt_list: {} }, 8);
    expect(f.quests()[30001]?.hunt_list[1002]?.huntCount).toBe(0);
    expect(f.quests()[7]?.hunt_list[9001]).toMatchObject({ mobGID: 1002, huntID: 9001, huntCount: 0 });
  });

  it('does not resurrect a removed bounty on a later ordinary list rebuild', () => {
    const f = fixture(); f.quest.receiveHuntingList(snapshot()); f.quest.removeQuest(30001);
    f.quest.addQuest({ questID: 7, active: 1, hunt_list: {} }, 7);
    expect(Object.keys(f.quests())).toEqual(['7']);
  });

  it('does not copy ordinary progress into a private goal with the same quest and mob', () => {
    const f = fixture();
    f.quest.setQuestList({ 30001: { questID: 30001, active: 1, hunt_list: { 1002: { huntID: 1002, mobGID: 1002, huntCount: 4, maxCount: 9 } } } });
    f.quest.receiveHuntingList(snapshot(8));
    f.quest.updateMissionHunt({ huntCount: 0 }, 30001, 1002);
    f.quest.addQuest({ questID: 8, active: 1, hunt_list: {} }, 8);
    expect(f.quests()[30001]?.hunt_list[1002]?.huntCount).toBe(0);
    expect(f.quests()[30001]?.hunt_list['bounty:1002']).toMatchObject({ huntCount: 8, maxCount: 80 });
  });

  it('keeps progress when the native method resolves a hunt ID through its mobGID', () => {
    // The native patched method resolves huntID 17 to the bounty key 1002.
    const ui = {
      setQuestList: (values: Record<string, Quest>) => { current = values; },
      updateMissionHunt: (update: Partial<Goal>, id: number, huntID: number) => {
        expect(id).toBe(30001); expect(huntID).toBe(17);
        Object.assign(current[id]!.hunt_list[1002]!, update);
      },
      addQuest: (value: Quest, id: number) => { current[id] = value; }, removeQuest: () => {},
    };
    let current: Record<string, Quest> = {};
    const data = createLastroQuestData({ getInfo: () => ({}), getMonsterName: () => '波利', isLastro: true });
    const quest = installLastroQuestBridge(ui, { data, getQuests: () => current, canRefresh: () => false, queryHuntingList: vi.fn() });
    quest.receiveHuntingList(snapshot(4)); quest.updateMissionHunt({ mobGID: 1002, huntCount: 8 }, 30001, 17);
    quest.addQuest({ questID: 7, active: 1, hunt_list: {} }, 7);
    expect(current[30001]?.hunt_list[1002]?.huntCount).toBe(8);
  });

  it('ignores malformed packets without replacing accepted quests', () => {
    const f = fixture(); f.quest.receiveHuntingList(snapshot()); f.quest.receiveHuntingList({});
    expect(Object.keys(f.quests())).toEqual(['30001']);
  });

  it('bounds refresh requests, gates loading/logged-out state, and stops timers during map removal', () => {
    const f = fixture(); f.ready(false); f.quest.onAppend();
    expect(f.query).not.toHaveBeenCalled(); f.ready(true); vi.advanceTimersByTime(15000);
    expect(f.query).toHaveBeenCalledOnce(); f.quest.toggle(); f.quest.onShortCut({ cmd: 'TOGGLE' });
    expect(f.query).toHaveBeenCalledOnce(); vi.advanceTimersByTime(1000); f.quest.toggle();
    expect(f.query).toHaveBeenCalledTimes(2); f.quest.onRemove(); vi.advanceTimersByTime(60000);
    expect(f.query).toHaveBeenCalledTimes(2);
  });

  it('keeps a single interval after duplicate append and clears character state on logout', () => {
    const f = fixture(); f.quest.receiveHuntingList(snapshot()); f.quest.onAppend(); f.quest.onAppend();
    vi.advanceTimersByTime(30000); expect(f.query).toHaveBeenCalledTimes(3);
    f.quest.clean(); expect(f.quests()).toEqual({}); vi.advanceTimersByTime(60000);
    expect(f.query).toHaveBeenCalledTimes(3);
    f.quest.setQuestList({ 7: { questID: 7, active: 1, hunt_list: {} } });
    expect(Object.keys(f.quests())).toEqual(['7']); f.quest.onAppend(); expect(f.query).toHaveBeenCalledTimes(4);
  });

  it('recovers from a disconnected send rather than throwing in a polling callback', () => {
    const f = fixture(); f.query.mockImplementationOnce(() => { throw new Error('disconnected'); });
    expect(f.quest.refreshBounties()).toBe(false); vi.advanceTimersByTime(1000);
    expect(f.quest.refreshBounties()).toBe(true);
  });
});
