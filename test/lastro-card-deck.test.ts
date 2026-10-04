// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installLastroCardDeck } from '../scripts/lastro-card-deck.mjs';
import { installLastroCardDeckShortcutDispatch } from '../scripts/lastro-card-deck-hotkeys.mjs';
import { installLastroCardState } from '../scripts/lastro-card-state.mjs';
import { createLastroChatMapLinks } from '../scripts/lastro-chat-map-links.mjs';
import type { LastroCardStateComponent, LastroCardStateData } from '../scripts/lastro-card-state.mjs';
import { setLastROInnerHTML } from '../src/runtime/lastro-trusted-dom.mjs';

const library = readFileSync('vendor/v2/lastro-card-collection.mjs', 'utf8').replace(/^export /gm, '');
const nativeUI = readFileSync('vendor/v2/lastro-card-collection-ui.mjs', 'utf8').replace(/^export /gm, '');
const prepared = readFileSync('generated/runtime/Online.js', 'utf8');
const messageHandlers = ['onPlayerMessage', 'onEntityTalkColor'] as const;
const messageSources = messageHandlers.map((name, index) => {
  const path = index === 0 ? 'src/Engine/MapEngine/Main.js' : 'src/Engine/MapEngine/Entity.js';
  const start = prepared.indexOf('//#region ' + path), end = prepared.indexOf('//#endregion', start);
  if (start < 0 || end < start) throw new Error('Missing prepared message region: ' + path);
  const file = ts.createSourceFile(path, prepared.slice(start, end), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const functions = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  if (functions.length !== 1) throw new Error('Missing prepared message handler: ' + name);
  return functions[0]!.getText(file);
});
interface Definition { id: number; tab: number; level: number; }
interface Preference { presets: Array<Definition[] | null>; activePreset: number | null; activeCards?: Definition[]; verifiedCards?: Array<Definition[] | null>; names?: string[]; save(): Promise<boolean | void>; }
type Component = LastroCardStateComponent & {
  render(): string; init(): void; prepare(): void; append(): void; onRemove(): void;
  setStatus(message: string): void;
  rechargeList(packet: object): boolean; sendAction(action: string, values: object): boolean;
  selectDeckPreset(index: number): boolean; switchDeckPreset(index: number, options?: { requireVerified?: boolean }): Promise<boolean> | boolean;
  saveDeckPreset(index: number): Promise<boolean>;
  renameDeckPreset(index: number, name: string): Promise<boolean>;
  activateDeckPreset(index: number): Promise<boolean> | boolean;
};
interface Packet { id: number; tab: number; level: number; cardid: number; }
const A = 4010, B = 4001, C = 4015;
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function definitions(data: LastroCardStateData, id: number): Definition[] {
  const values: Definition[] = [];
  for (const [tab, category] of Object.entries(data.data)) {
    if (Number(tab) === 0) continue;
    for (const [level, row] of Object.entries(category.data)) if (row.cards.includes(id)) values.push({ id, tab: Number(tab), level: Number(level) });
  }
  return values;
}
function unique(data: LastroCardStateData, id: number) {
  const matches = definitions(data, id);
  if (matches.length !== 1) throw new Error('Test requires one native card definition: ' + id);
  return matches[0]!;
}
function categoryCards(data: LastroCardStateData, tab: number, count: number) {
  const cards: Definition[] = [];
  for (const row of Object.values(data.data[tab]!.data)) {
    for (const id of row.cards) {
      if (id > 0 && definitions(data, id).length === 1 && !cards.some(card => card.id === id)) cards.push(unique(data, id));
      if (cards.length === count) return cards;
    }
  }
  throw new Error('Test requires ' + count + ' unique native definitions for category ' + tab);
}
function setState(data: LastroCardStateData, definition: Definition, state: number) {
  const row = data.data[definition.tab]!.data[definition.level]!;
  row.recharge[row.cards.indexOf(definition.id)] = state;
}
function setDeck(data: LastroCardStateData, cards: number[], definitionsToCharge?: Definition[]) {
  for (const [tab, category] of Object.entries(data.data)) {
    if (Number(tab) === 0) continue;
    for (const row of Object.values(category.data)) row.recharge = row.cards.map(() => 0);
  }
  for (const definition of definitionsToCharge ?? [A, B, C].map(id => unique(data, id))) setState(data, definition, cards.includes(definition.id) ? 2 : 1);
  data.data[0]!.data[1]!.cards = [...cards, ...Array(8 - cards.length).fill(0)];
}
function snapshot(data: LastroCardStateData) {
  const classInfos = Array.from({ length: 8 }, (_unused, tab) => {
    const category = data.data[tab];
    const rows = Object.values(category?.data ?? {}).map(row => ({ activate: row.activate ?? 0,
      ...Object.fromEntries(Array.from({ length: 8 }, (_value, index) => ['recharge' + index, (tab === 0 ? row.cards : row.recharge)[index] ?? 0])) }));
    return { level: rows.length, enable: category?.enable ?? 0, data: rows };
  });
  return { classNum: 8, classInfos };
}
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((onResolve, onReject) => { resolve = onResolve; reject = onReject; });
  return { promise, resolve, reject };
}
async function flush() { for (let index = 0; index < 6; index++) await Promise.resolve(); }
function fixture(options: { initial?: number[]; synchronized?: boolean; preferences?: Array<Definition[] | null>; activePreset?: number | null; activeCards?: Definition[]; verifiedCards?: Array<Definition[] | null>; names?: string[] } = {}) {
  vi.useFakeTimers();
  const sent = vi.fn<(packet: Packet) => void>();
  class GUIComponent {
    static MouseMode = { STOP: 1 };
    _host = document.createElement('div'); _root = document.createElement('div');
    constructor() { this._host.append(this._root); }
    getRoot() { return this._root; }
    prepare = vi.fn(); append = vi.fn(); remove = vi.fn(); focus = vi.fn();
  }
  const context = vm.createContext({ document, GUIComponent, sent });
  vm.runInContext(`${library}\n${nativeUI}\n
    var defaults = getCardConnectionData(5);
    var component = createCardCollectionComponent({
      GUIComponent, Network: { sendPacket: sent }, PACKET: { CZ: {
        REQUEST_CARDCONNECTION_RECHARGE: class {}, REQUEST_CARDCONNECTION_ADDMYDECK: class {}, REQUEST_CARDCONNECTION_CANCEL: class {}
      } }, DB: { INTERFACE_PATH: '', getItemInfo: id => ({ identifiedDisplayName: '卡片' + id }) },
      Client: { loadFile() {} }, Configs: { get: () => 5 }, CARD_CONNECTION_TABS,
      getCardConnectionData, listCardEntries, getCardDeckOverview, getCardLevelCount,
      buildCardConnectionAction, applyCardConnectionUpdate, applyCardConnectionCancelUpdate,
      applyCardConnectionActivateUpdate, applyCardConnectionEnableUpdate
    });
  `, context);
  const component = context.component as Component;
  const defaults = clone(context.defaults as LastroCardStateData);
  const stateDeps = { document,
    CARD_CONNECTION_TABS: vm.runInContext('CARD_CONNECTION_TABS', context),
    listCardEntries: vm.runInContext('listCardEntries', context),
    resolveCategoryCardAction: vm.runInContext('resolveCategoryCardAction', context),
  } as Parameters<typeof installLastroCardState>[1];
  expect(installLastroCardState(component, stateDeps)).toBe(true);
  const root = component.getRoot()!; setLastROInnerHTML(root, component.render()); component.init();
  const session: { key: string | null; connection: object | null; playing: boolean } = { key: 'server5/account1/character10', connection: {}, playing: true };
  const stores = new Map<string, Preference>();
  const persisted = new Map<string, { presets: Array<Definition[] | null>; activePreset: number | null; activeCards?: Definition[]; verifiedCards?: Array<Definition[] | null>; names?: string[] }>();
  const save = vi.fn<() => Promise<boolean | void>>(async () => true);
  const notify = vi.fn<(success: boolean, index: number, name: string, reason?: string) => void>();
  const loadPreferences = vi.fn((key: string): Preference => {
    let value = stores.get(key);
    if (!value) {
      value = { presets: clone(options.preferences ?? [null, null, null, null]), activePreset: options.activePreset ?? null,
        activeCards: options.activeCards ? clone(options.activeCards) : undefined, names: options.names ? [...options.names] : undefined,
        verifiedCards: options.verifiedCards ? clone(options.verifiedCards) : undefined,
        async save() {
          const result = await save();
          if (result !== false) {
            persisted.set(key, clone({ presets: this.presets, activePreset: this.activePreset, activeCards: this.activeCards, verifiedCards: this.verifiedCards, names: this.names })); stores.set(key, this);
          }
          return result;
        } };
      stores.set(key, value);
    }
    return value;
  });
  const api = installLastroCardDeck(component, {
    getSession: () => ({ ...session }), getDefaults: () => clone(defaults), loadPreferences, notify,
    setTimeout, clearTimeout,
  });
  const serverData = clone(defaults); setDeck(serverData, options.initial ?? [A]);
  const sync = (data = serverData) => component.rechargeList(snapshot(data));
  if (options.synchronized !== false) sync();
  const deck = () => component._data!.data[0]!.data[1]!.cards.filter(Boolean);
  const ack = (packet = sent.mock.calls.at(-1)?.[0], state?: number) => {
    if (!packet) throw new Error('No packet awaiting test acknowledgement');
    const value = { tab: packet.tab, level: packet.level, cardid: packet.cardid, state: state ?? (packet.id === 2787 ? 1 : 2) };
    return packet.id === 2787 ? component.cancelUpdate(value) : component.updateList(value);
  };
  const presets = (cards: number[][]) => cards.map(ids => ids.map(id => unique(defaults, id)));
  return { component, api, root, sent, defaults, serverData, session, save, stores, persisted, loadPreferences, notify, sync, deck, ack, presets,
    status: () => root.querySelector('[data-status]')!.textContent! };
}
afterEach(() => { vi.useRealTimers(); document.body.replaceChildren(); vi.restoreAllMocks(); });

async function activateCurrent(f: ReturnType<typeof fixture>) {
  expect(await f.component.activateDeckPreset(1)).toBe(true);
  f.save.mockClear(); f.notify.mockClear();
}

function add(f: ReturnType<typeof fixture>, card: Definition) {
  return f.component.sendAction('add-deck', { tab: card.tab, level: card.level, cardid: card.id });
}

function remove(f: ReturnType<typeof fixture>, id: number) {
  return f.component.sendAction('cancel', { tab: 0, level: 1, cardid: id });
}

function noticePackets(f: ReturnType<typeof fixture>, lastro = true) {
  const addText = vi.fn(), append = vi.fn(), set = vi.fn(), dialog = vi.fn();
  const onServerNotice = vi.spyOn(f.api, 'onServerNotice');
  const context = vm.createContext({
    CardConnection2: f.component, Configs: { get: () => lastro },
    LastROChatMapLinks: createLastroChatMapLinks({ setHtml: setLastROInnerHTML, showPrompt: vi.fn(), teleport: vi.fn() }),
    init_Announce: vi.fn(), Announce_default: { append, set },
    ChatBox_default: { addText, TYPE: { PUBLIC: 1, SELF: 2, ANNOUNCE: 4 }, FILTER: { PUBLIC_LOG: 1, PUBLIC_CHAT: 2 } },
    ChatRoom_default: { isOpen: false }, SessionStorage_default: { Entity: { dialog: { set: dialog } } },
    EntityManager: { get: () => ({ dialog: { set: dialog } }) },
  });
  vm.runInContext(messageSources.join('\n') + '\nvar handlers = { onPlayerMessage, onEntityTalkColor };', context);
  return { handlers: context.handlers as Record<typeof messageHandlers[number], (packet: { msg: string; accountID?: number; color?: number }) => unknown>,
    addText, append, set, dialog, onServerNotice, context };
}

describe('complete native LastRO refusal routing before the system message return', () => {
  it.each(messageHandlers.flatMap(handler => [0, 5000].map(delay => ({ handler, delay }))))(
    '$handler releases the rejected add at $delay ms without changing confirmed content', async ({ handler, delay }) => {
      const f = fixture({ preferences: [[{ id: A, tab: 1, level: 1 }], null, null, null], activePreset: 1 });
      const second = unique(f.defaults, 4112); setState(f.serverData, second, 1); f.sync();
      const before = clone(f.component._data), available = f.api.getAvailableCards(), packets = noticePackets(f);
      expect(add(f, second)).toBe(true); await vi.advanceTimersByTimeAsync(delay);
      expect(f.api.isBusy()).toBe(true);
      const reason = '卡组中已有1张头饰类卡片';
      expect(packets.handlers[handler]({ msg: '<msg>' + reason + '<msg>', accountID: 123, color: 0xffffff })).toBe(false);
      await flush();
      expect(packets.onServerNotice).toHaveBeenCalledExactlyOnceWith(reason);
      expect(packets.addText).toHaveBeenCalledExactlyOnceWith(reason, 4, 1);
      expect(packets.append).toHaveBeenCalledOnce();
      expect(packets.set).toHaveBeenCalledExactlyOnceWith(reason, '#FFFF00', { life: 5000 });
      expect(packets.dialog).not.toHaveBeenCalled();
      expect(f.component._data).toEqual(before); expect(f.api.getAvailableCards()).toEqual(available);
      expect(f.deck()).toEqual([A]); expect(f.api.getActivePreset()).toBe(1);
      expect(f.api.isBusy()).toBe(false); expect(f.api.canEdit()).toBe(true); expect(f.api.canSave()).toBe(true);
      expect(f.status()).toBe(reason); expect(f.save).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(10000); expect(f.api.isBusy()).toBe(false);
      expect(add(f, unique(f.defaults, B))).toBe(true); f.ack(); await flush();
      expect(f.deck()).toEqual([A, B]); expect(f.sent).toHaveBeenCalledTimes(2);
    });

  it.each(messageHandlers)('%s preserves the lock for unrelated system text, prefixed player chat and a different category refusal', async handler => {
    const f = fixture(); await activateCurrent(f); const second = unique(f.defaults, 4112);
    setState(f.serverData, second, 1); f.sync(); expect(add(f, second)).toBe(true);
    const packets = noticePackets(f);
    for (const text of ['<msg>添加成功<msg>', '<msg>操作失败<msg>', '<msg>卡组中已有1张铠甲类卡片<msg>',
      '玩家 : <msg>卡组中已有1张头饰类卡片<msg>']) {
      packets.handlers[handler]({ msg: text, accountID: 456, color: 0xffffff }); await flush();
      expect(f.api.isBusy()).toBe(true); expect(f.deck()).toEqual([A]); expect(f.api.getActivePreset()).toBe(1);
    }
    expect(f.sent).toHaveBeenCalledOnce(); expect(f.save).not.toHaveBeenCalled();
    f.ack(undefined, 1); await flush(); expect(f.api.isBusy()).toBe(false);
  });

  it.each(messageHandlers)('%s preserves ordinary chat when LastRO is disabled or the card component has not initialized', async handler => {
    const f = fixture(); await activateCurrent(f); const second = unique(f.defaults, 4112);
    setState(f.serverData, second, 1); f.sync(); expect(add(f, second)).toBe(true);
    const text = '<msg>卡组中已有1张头饰类卡片<msg>', other = noticePackets(f, false);
    other.handlers[handler]({ msg: text, accountID: 456, color: 0xffffff }); await flush();
    expect(f.api.isBusy()).toBe(true); expect(other.set).not.toHaveBeenCalled(); expect(other.dialog).toHaveBeenCalledWith(text);
    const packets = noticePackets(f); delete packets.context.CardConnection2;
    expect(() => packets.handlers[handler]({ msg: text, accountID: 456, color: 0xffffff })).not.toThrow();
    expect(packets.addText).toHaveBeenCalledExactlyOnceWith('卡组中已有1张头饰类卡片', 4, 1);
    expect(f.api.isBusy()).toBe(true); f.ack(undefined, 1); await flush();
  });
});

describe('explicit activation before server-confirmed editing', () => {
  it('selects an unsaved slot without opening or activating it, and rejects edit/save', async () => {
    const f = fixture(); expect(f.component.selectDeckPreset(2)).toBe(true);
    expect(f.api.getSelected()).toBe(2); expect(f.api.getActivePreset()).toBeNull();
    expect(f.api.canEdit()).toBe(false); expect(f.api.canSave()).toBe(false);
    expect(add(f, unique(f.defaults, B))).toBe(false); expect(remove(f, A)).toBe(false);
    expect(await f.component.saveDeckPreset(2)).toBe(false);
    expect(f.status()).toContain('激活'); expect(f.component.switchDeckPreset(2)).toBe(false);
    expect(f.deck()).toEqual([A]); expect(f.api.getPresets()).toEqual([null, null, null, null]);
    expect(f.sent).not.toHaveBeenCalled(); expect(f.save).not.toHaveBeenCalled(); expect(f.component.append).not.toHaveBeenCalled();
  });

  it('only selects a saved preset, retaining the previously confirmed active slot', async () => {
    const f = fixture({ preferences: [[{ id: A, tab: 1, level: 1 }], [{ id: B, tab: 2, level: 1 }], null, null], activePreset: 1 });
    expect(f.api.canEdit()).toBe(true); expect(f.component.selectDeckPreset(2)).toBe(true);
    expect(f.api.getSelected()).toBe(2); expect(f.api.getActivePreset()).toBe(1);
    expect(f.api.canEdit()).toBe(false); expect(f.api.canEdit(1)).toBe(false);
    expect(add(f, unique(f.defaults, C))).toBe(false); expect(await f.component.saveDeckPreset(2)).toBe(false);
    expect(f.deck()).toEqual([A]); expect(f.sent).not.toHaveBeenCalled(); expect(f.notify).not.toHaveBeenCalled();
  });

  it('seeds only slot one from reliable actual content and returns independent copies', () => {
    const f = fixture(); expect(f.api.getDraft(1)).toEqual([unique(f.defaults, A)]);
    expect(f.api.getDraft(2)).toEqual([]); expect(f.api.getDraft(3)).toEqual([]);
    const copy = f.api.getDraft(); copy[0]!.tab = 7; copy.push(unique(f.defaults, B));
    expect(f.api.getDraft()).toEqual([unique(f.defaults, A)]); expect(f.api.canEdit()).toBe(false);
  });

  it('does not copy actual cards to another unsaved slot merely because one preset exists', () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    expect(f.api.getDraft(1)).toEqual([]); expect(f.api.getDraft(2)).toEqual([unique(f.defaults, B)]);
    expect(f.api.getActivePreset()).toBeNull(); expect(f.sent).not.toHaveBeenCalled();
  });

  it('explicitly activates the initial actual content without saving an unsaved preset or granting shortcut eligibility', async () => {
    const f = fixture(); await activateCurrent(f);
    expect(f.api.getActivePreset()).toBe(1); expect(f.api.canEdit()).toBe(true); expect(f.api.canSave()).toBe(true);
    expect(f.api.getPresets()[0]).toBeNull(); expect(f.api.isVerified(1)).toBe(false);
    expect(f.persisted.get(f.session.key!)!.presets[0]).toBeNull();
    expect(f.component.switchDeckPreset(1, { requireVerified: true })).toBe(false); expect(f.sent).not.toHaveBeenCalled();
  });

  it('activates an empty unsaved slot by confirmed removals, then separately saves it', async () => {
    const f = fixture({ initial: [A, C] }); f.component.selectDeckPreset(3);
    const result = f.component.activateDeckPreset(3); await flush();
    expect(f.api.canEdit()).toBe(false); expect(f.api.canSave()).toBe(false); expect(f.deck()).toEqual([A, C]);
    f.ack(); await flush(); expect(f.deck()).toEqual([C]); expect(f.api.getPresets()[2]).toBeNull();
    f.ack(); expect(await result).toBe(true);
    expect(f.deck()).toEqual([]); expect(f.api.getActivePreset()).toBe(3); expect(f.api.canEdit()).toBe(true);
    expect(f.api.getPresets()[2]).toBeNull(); expect(f.api.isVerified(3)).toBe(false);
    expect(await f.component.saveDeckPreset(3)).toBe(true); expect(f.api.getPresets()[2]).toEqual([]);
    expect(f.api.isVerified(3)).toBe(true); expect(await f.component.switchDeckPreset(3, { requireVerified: true })).toBe(true);
    expect(f.sent).toHaveBeenCalledTimes(2);
  });

  it('marks only the explicitly activated slot in identical saved decks', async () => {
    const cards = [{ id: A, tab: 1, level: 1 }];
    const f = fixture({ preferences: [cards, cards, null, null], activePreset: 1 });
    expect(await f.component.activateDeckPreset(2)).toBe(true); expect(f.api.getActivePreset()).toBe(2);
    expect(f.persisted.get(f.session.key!)!.activePreset).toBe(2); expect(f.sent).not.toHaveBeenCalled();
    f.component.selectDeckPreset(1); expect(f.api.getActivePreset()).toBe(2); expect(f.api.canEdit()).toBe(false);
  });

  it('preserves active identity over a matching full snapshot, but exact native coordinates are required', () => {
    const id = 27118; const f = fixture({ synchronized: false });
    const choices = definitions(f.defaults, id), original = choices.find(card => card.tab === 4)!, replacement = choices.find(card => card.tab === 6)!;
    f.stores.get(f.session.key!)!.presets = [[original], null, null, null]; f.stores.get(f.session.key!)!.activePreset = 1;
    f.session.connection = {}; setDeck(f.serverData, [id], [original]); f.sync();
    expect(f.api.getActivePreset()).toBe(1); expect(f.api.canEdit()).toBe(true); f.sync(); expect(f.api.getActivePreset()).toBe(1);
    setDeck(f.serverData, [id], [replacement]); f.sync();
    expect(f.deck()).toEqual([id]); expect(f.api.getActivePreset()).toBeNull(); expect(f.api.canEdit()).toBe(false);
    setState(f.serverData, original, 2); f.sync(); expect(f.api.getActivePreset()).toBeNull();
  });

  it.each([0, 5, NaN])('rejects invalid slot %s without network or storage activity', async index => {
    const f = fixture(); expect(f.component.selectDeckPreset(index)).toBe(false);
    expect(await f.component.activateDeckPreset(index)).toBe(false); expect(await f.component.saveDeckPreset(index)).toBe(false);
    expect(f.api.canEdit(index)).toBe(false); expect(f.api.canSave(index)).toBe(false);
    expect(f.api.getSelected()).toBe(1); expect(f.sent).not.toHaveBeenCalled(); expect(f.save).not.toHaveBeenCalled();
  });
});

describe('serialized native card add/remove confirmation and save qualification', () => {
  it('does not change actual content, active snapshot or draft before add acknowledgement', async () => {
    const f = fixture(); await activateCurrent(f); const card = unique(f.defaults, B);
    expect(add(f, card)).toBe(true); expect(f.sent).toHaveBeenCalledWith({ id: 2785, tab: card.tab, level: card.level, cardid: B });
    expect(f.api.isBusy()).toBe(true); expect(f.deck()).toEqual([A]); expect(f.api.getDraft().map(card => card.id)).toEqual([A]);
    expect(f.api.getActivePreset()).toBe(1); expect(f.api.canSave()).toBe(false); expect(await f.component.saveDeckPreset(1)).toBe(false);
    expect(f.component.selectDeckPreset(2)).toBe(false); expect(remove(f, A)).toBe(false); expect(add(f, unique(f.defaults, C))).toBe(false);
    expect(f.save).not.toHaveBeenCalled(); expect(f.sent).toHaveBeenCalledOnce();
    f.ack(); await flush(); expect(f.deck()).toEqual([A, B]); expect(f.api.getDraft().map(card => card.id)).toEqual([A, B]);
    expect(f.api.getActivePreset()).toBe(1); expect(f.api.canSave()).toBe(true); expect(f.api.isBusy()).toBe(false);
    expect(f.api.getPresets()[0]).toBeNull(); expect(f.api.isVerified(1)).toBe(false);
    expect(await f.component.saveDeckPreset(1)).toBe(true); expect(f.api.getPresets()[0]).toEqual([A, B]);
    expect(f.persisted.get(f.session.key!)!.verifiedCards?.[0]).toEqual([unique(f.defaults, A), card]);
    expect(f.api.isVerified(1)).toBe(true); expect(f.sent).toHaveBeenCalledOnce();
  });

  it('removes only after a cancel acknowledgement, keeps active identity, and requires saving new content', async () => {
    const original = [{ id: A, tab: 1, level: 1 }, { id: C, tab: 5, level: 1 }];
    const f = fixture({ initial: [A, C], preferences: [original, null, null, null], activePreset: 1 });
    expect(remove(f, A)).toBe(true); expect(f.deck()).toEqual([A, C]); expect(f.api.getDraft()).toEqual(original);
    f.ack(); await flush(); expect(f.deck()).toEqual([C]); expect(f.api.getDraft()).toEqual([unique(f.defaults, C)]);
    expect(f.api.getActivePreset()).toBe(1); expect(f.api.isDirty()).toBe(true); expect(f.api.isVerified(1)).toBe(false);
    expect(f.component.switchDeckPreset(1, { requireVerified: true })).toBe(false); expect(f.sent).toHaveBeenCalledOnce();
    expect(await f.component.saveDeckPreset(1)).toBe(true); expect(f.api.isVerified(1)).toBe(true); expect(f.api.isDirty()).toBe(false);
    expect(f.api.getActivePreset()).toBe(1); expect(f.persisted.get(f.session.key!)!.activeCards).toEqual([unique(f.defaults, C)]);
  });

  it.each(['add', 'cancel'] as const)('does not save or alter a confirmed draft after %s rejection', async action => {
    const original = [{ id: A, tab: 1, level: 1 }];
    const f = fixture({ preferences: [original, null, null, null], activePreset: 1 });
    expect(action === 'add' ? add(f, unique(f.defaults, B)) : remove(f, A)).toBe(true);
    f.ack(undefined, action === 'add' ? 1 : 2); await flush();
    expect(f.deck()).toEqual([A]); expect(f.api.getDraft()).toEqual(original); expect(f.api.getPresets()[0]).toEqual([A]);
    expect(f.api.isDirty()).toBe(false); expect(f.api.isBusy()).toBe(false); expect(f.api.getActivePreset()).toBe(1);
    expect(f.save).not.toHaveBeenCalled(); expect(f.status()).toContain('未确认'); expect(f.api.canSave()).toBe(true);
    expect(await f.component.saveDeckPreset(1)).toBe(true); expect(f.persisted.get(f.session.key!)!.presets[0]).toEqual(original);
  });

  it.each(['add', 'cancel'] as const)('preserves confirmed presentation on missing %s replies and reconciles an exact late reply without retrying', async action => {
    const f = fixture(); await activateCurrent(f);
    expect(action === 'add' ? add(f, unique(f.defaults, B)) : remove(f, A)).toBe(true);
    await vi.advanceTimersByTimeAsync(4999); expect(f.api.isBusy()).toBe(true); expect(f.sent).toHaveBeenCalledOnce();
    const available = f.api.getAvailableCards();
    await vi.advanceTimersByTimeAsync(1); expect(f.api.isBusy()).toBe(true); expect(f.api.canSave()).toBe(false);
    expect(f.api.canEdit()).toBe(false); expect(f.api.getActivePreset()).toBe(1); expect(await f.component.saveDeckPreset(1)).toBe(false);
    expect(f.api.getAvailableCards()).toEqual(available); expect(f.api.getDraft().map(card => card.id)).toEqual([A]);
    expect(add(f, unique(f.defaults, B))).toBe(false); expect(f.component.selectDeckPreset(2)).toBe(false);
    f.ack(); await flush(); expect(f.api.isBusy()).toBe(false); expect(f.api.canSave()).toBe(true);
    expect(f.api.getDraft().map(card => card.id)).toEqual(action === 'add' ? [A, B] : []);
    expect(f.api.getActivePreset()).toBe(1);
    expect(f.save).not.toHaveBeenCalled(); expect(f.sent).toHaveBeenCalledOnce();
  });

  it.each([0, 5000])('settles a chat-only quota rejection at %i ms without losing the active deck or charged catalogue', async delay => {
    const f = fixture({ preferences: [[{ id: A, tab: 1, level: 1 }], null, null, null], activePreset: 1 });
    const second = unique(f.defaults, 4112); setState(f.serverData, second, 1); f.sync();
    const available = f.api.getAvailableCards(), before = clone(f.component._data);
    expect(add(f, second)).toBe(true); await vi.advanceTimersByTimeAsync(delay);
    expect(f.api.onServerNotice('卡组中已有1张头饰类卡片\0')).toBe(true); await flush();
    expect(f.component._data).toEqual(before); expect(f.deck()).toEqual([A]); expect(f.api.getActivePreset()).toBe(1);
    expect(f.api.getDraft()).toEqual([{ id: A, tab: 1, level: 1 }]); expect(f.api.getAvailableCards()).toEqual(available);
    expect(f.api.isBusy()).toBe(false); expect(f.api.canEdit()).toBe(true); expect(f.api.canSave()).toBe(true);
    expect(f.status()).toBe('卡组中已有1张头饰类卡片'); expect(f.save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(10000); expect(f.api.getActivePreset()).toBe(1); expect(f.api.getAvailableCards()).toEqual(available);
    expect(add(f, unique(f.defaults, B))).toBe(true); f.ack(); await flush();
    expect(f.deck()).toEqual([A, B]); expect(f.api.canSave()).toBe(true); expect(f.sent).toHaveBeenCalledTimes(2);
  });

  it.each(['添加成功', '操作失败', '某玩家 : 卡组中已有1张头饰类卡片', '卡组中已有1张未知类卡片', '<b>卡组中已有1张头饰类卡片</b>', '卡组中已有1张头饰类卡片'])('never settles an armour request from unrelated, decorated or other-category text %j', async message => {
    const f = fixture(); await activateCurrent(f); expect(add(f, unique(f.defaults, B))).toBe(true);
    expect(f.api.onServerNotice(message)).toBe(false); await flush(); expect(f.api.isBusy()).toBe(true);
    expect(f.api.getActivePreset()).toBe(1); expect(f.api.canSave()).toBe(false); expect(f.sent).toHaveBeenCalledOnce();
    f.ack(); await flush(); expect(f.api.canSave()).toBe(true);
  });

  it.each(['cancel', 'recharge'] as const)('never settles a %s operation using an add quota notice', async action => {
    const f = fixture(); await activateCurrent(f);
    expect(action === 'cancel' ? remove(f, A) : f.component.sendAction('recharge', { tab: 2, level: 1, cardid: B })).toBe(true);
    expect(f.api.onServerNotice('卡组中已有1张头饰类卡片')).toBe(false); expect(f.api.isBusy()).toBe(true);
    f.ack(undefined, 1); await flush(); expect(f.api.isBusy()).toBe(false);
  });

  it('requires an exact late reply and keeps an unanswered operation quarantined across a same-socket map change', async () => {
    const f = fixture(); await activateCurrent(f); expect(add(f, unique(f.defaults, B))).toBe(true);
    await vi.advanceTimersByTimeAsync(5000); f.api.invalidate(false);
    expect(f.api.getActivePreset()).toBe(1); expect(f.api.isBusy()).toBe(true); expect(add(f, unique(f.defaults, B))).toBe(false);
    f.component.updateList({ tab: 2, level: 2, cardid: B, state: 1 }); await flush(); expect(f.api.isBusy()).toBe(true);
    f.ack(undefined, 1); await flush(); expect(f.api.isBusy()).toBe(false); expect(f.api.getActivePreset()).toBe(1);
    expect(f.api.canSave()).toBe(true); expect(f.sent).toHaveBeenCalledOnce();
  });

  it('does not classify a quota notice as this request rejection when another acknowledged packet already changed the deck', async () => {
    const f = fixture(); await activateCurrent(f); const second = unique(f.defaults, 4112);
    setState(f.serverData, second, 1); f.sync(); expect(add(f, second)).toBe(true);
    f.component.updateList({ tab: 2, level: 1, cardid: B, state: 2 });
    expect(f.api.onServerNotice('卡组中已有1张头饰类卡片')).toBe(false); expect(f.api.isBusy()).toBe(true);
    expect(f.save).not.toHaveBeenCalled(); f.api.invalidate();
  });

  it.each(['character', 'socket', 'logout'] as const)('ignores an old quota rejection after a %s change', async change => {
    const f = fixture(); await activateCurrent(f); expect(add(f, unique(f.defaults, B))).toBe(true);
    await vi.advanceTimersByTimeAsync(5000);
    if (change === 'character') f.session.key = 'another-character';
    if (change === 'socket') f.session.connection = {};
    if (change === 'logout') f.session.playing = false;
    expect(f.api.onServerNotice('卡组中已有1张铠甲类卡片')).toBe(false); expect(f.api.isBusy()).toBe(false);
    expect(f.api.getActivePreset()).toBeNull(); expect(f.save).not.toHaveBeenCalled();
  });

  it('waits for a slow exact reply and does not advance on another ID or repeat an earlier reply', async () => {
    const f = fixture(); await activateCurrent(f); expect(add(f, unique(f.defaults, B))).toBe(true);
    f.component.updateList({ tab: 5, level: 1, cardid: C, state: 1 }); await flush();
    await vi.advanceTimersByTimeAsync(4500); expect(f.api.isBusy()).toBe(true); expect(f.sent).toHaveBeenCalledOnce();
    const packet = f.sent.mock.calls[0]![0]; f.ack(packet); await flush(); expect(f.api.isBusy()).toBe(false);
    expect(remove(f, A)).toBe(true); f.ack(packet); await flush(); expect(f.api.isBusy()).toBe(true);
    expect(f.api.canSave()).toBe(false); f.ack(); await flush(); expect(f.api.canSave()).toBe(true);
    expect(f.api.getDraft().map(card => card.id)).toEqual([B]); expect(f.sent).toHaveBeenCalledTimes(2);
  });

  it.each(['false', 'reject'] as const)('keeps confirmed server content and previous saved content after storage %s', async failure => {
    const original = [{ id: A, tab: 1, level: 1 }];
    const f = fixture({ preferences: [original, null, null, null], activePreset: 1 });
    add(f, unique(f.defaults, B)); f.ack(); await flush();
    if (failure === 'false') f.save.mockResolvedValueOnce(false); else f.save.mockRejectedValueOnce(new Error('storage failed'));
    expect(await f.component.saveDeckPreset(1)).toBe(false);
    expect(f.deck()).toEqual([A, B]); expect(f.api.getDraft().map(card => card.id)).toEqual([A, B]);
    expect(f.api.getActivePreset()).toBe(1); expect(f.api.getPresets()[0]).toEqual([A]); expect(f.api.isVerified(1)).toBe(false);
    expect(f.component.switchDeckPreset(1, { requireVerified: true })).toBe(false); expect(f.sent).toHaveBeenCalledOnce();
    expect(await f.component.saveDeckPreset(1)).toBe(true); expect(f.api.isVerified(1)).toBe(true);
  });

  it('updates the saved preset only after persistence succeeds and locks every mutating control during save', async () => {
    const f = fixture(); await activateCurrent(f); const pending = deferred<boolean>(); f.save.mockReturnValueOnce(pending.promise);
    const result = f.component.saveDeckPreset(1);
    expect(f.api.getPresets()[0]).toBeNull(); expect(f.api.isVerified(1)).toBe(false); expect(f.api.isBusy()).toBe(true);
    expect(add(f, unique(f.defaults, B))).toBe(false); expect(f.component.selectDeckPreset(2)).toBe(false);
    expect(await f.component.renameDeckPreset(1, 'later')).toBe(false); expect(f.api.canSave()).toBe(false);
    pending.resolve(true); expect(await result).toBe(true); expect(f.api.getPresets()[0]).toEqual([A]); expect(f.api.isVerified(1)).toBe(true);
    expect(f.sent).not.toHaveBeenCalled(); expect(f.api.isBusy()).toBe(false);
  });

  it.each(['character', 'socket', 'logout', 'invalidate', 'snapshot'] as const)('does not apply a pending edit across %s boundary', async change => {
    const f = fixture(); await activateCurrent(f); add(f, unique(f.defaults, B)); const packet = f.sent.mock.calls[0]![0];
    if (change === 'character') f.session.key = 'server5/account1/character20';
    if (change === 'socket') f.session.connection = {};
    if (change === 'logout') f.session.playing = false;
    if (change === 'invalidate') f.api.invalidate();
    if (change === 'snapshot') f.sync();
    f.ack(packet); await flush(); expect(f.api.isBusy()).toBe(false); expect(f.api.canSave()).toBe(false);
    expect(f.api.getPresets()[0]).toBeNull(); expect(f.save).not.toHaveBeenCalled(); expect(f.sent).toHaveBeenCalledOnce();
  });
});

describe('equipment acceptance belongs to the server without new client quotas', () => {
  it.each([1, 2, 3, 4, 5, 6, 7])('sends a second charged native category %s card for the server to decide', async tab => {
    const f = fixture({ synchronized: false }); const cards = categoryCards(f.defaults, tab, 2);
    setDeck(f.serverData, [cards[0]!.id], cards); f.sync(); await activateCurrent(f);
    expect(add(f, cards[1]!)).toBe(true); expect(f.sent).toHaveBeenCalledWith({ id: 2785, tab: cards[1]!.tab, level: cards[1]!.level, cardid: cards[1]!.id });
    expect(f.deck()).toEqual([cards[0]!.id]); expect(f.api.getDraft()).toEqual([cards[0]]);
    f.ack(undefined, 1); await flush(); expect(f.deck()).toEqual([cards[0]!.id]); expect(f.api.getDraft()).toEqual([cards[0]]);
    expect(f.api.getPresets()[0]).toBeNull(); expect(f.api.isVerified(1)).toBe(false); expect(f.save).not.toHaveBeenCalled();
  });

  it('saves only the second same-category card that the real native ACK accepted, without applying local quota', async () => {
    const f = fixture({ synchronized: false }); const cards = categoryCards(f.defaults, 4, 2);
    setDeck(f.serverData, [cards[0]!.id], cards); f.sync(); await activateCurrent(f);
    expect(add(f, cards[1]!)).toBe(true); f.ack(); await flush();
    expect(f.api.getDraft()).toEqual(cards); expect(f.api.getActivePreset()).toBe(1); expect(f.api.isVerified(1)).toBe(false);
    expect(await f.component.saveDeckPreset(1)).toBe(true); expect(f.api.isVerified(1)).toBe(true);
    expect(f.persisted.get(f.session.key!)!.presets[0]).toEqual(cards);
  });

  it('delegates activating a legacy same-category saved combination to the server and stops on its rejection', async () => {
    const f = fixture({ synchronized: false }); const cards = categoryCards(f.defaults, 1, 2);
    f.stores.get(f.session.key!)!.presets = [null, cards, null, null]; f.session.connection = {};
    setDeck(f.serverData, [A], [unique(f.defaults, A), ...cards]); f.sync();
    const result = f.component.activateDeckPreset(2); await flush();
    if (f.sent.mock.calls[0]?.[0].id === 2787) { f.ack(); await flush(); }
    expect(f.sent.mock.calls.at(-1)?.[0].id).toBe(2785); f.ack(undefined, 1);
    expect(await result).toBe(false); expect(f.api.isVerified(2)).toBe(false); expect(f.save).not.toHaveBeenCalled();
  });

  it('keeps the verified equipment label correction informational and sends the native chimera coordinate unchanged', async () => {
    const f = fixture({ synchronized: false }); const chimera = unique(f.defaults, 4646), garment = unique(f.defaults, C);
    expect(chimera).toEqual({ id: 4646, tab: 6, level: 5 }); expect(f.api.getEquipmentTab(chimera)).toBe(5);
    setDeck(f.serverData, [C], [garment, chimera]); f.sync(); await activateCurrent(f);
    expect(add(f, chimera)).toBe(true); expect(f.sent).toHaveBeenCalledWith({ id: 2785, tab: 6, level: 5, cardid: 4646 });
    f.ack(); await flush(); expect(await f.component.saveDeckPreset(1)).toBe(true);
    expect(f.persisted.get(f.session.key!)!.presets[0]).toEqual([garment, chimera]);
  });

  it('retains fixed eight-slot and unique-ID safety without using equipment category quotas', async () => {
    const f = fixture({ synchronized: false }); const cards = [...categoryCards(f.defaults, 1, 6), ...categoryCards(f.defaults, 4, 2)];
    const extra = unique(f.defaults, B); setDeck(f.serverData, cards.map(card => card.id), [...cards, extra]); f.sync(); await activateCurrent(f);
    expect(add(f, extra)).toBe(false); expect(add(f, cards[0]!)).toBe(false); expect(f.sent).not.toHaveBeenCalled();
    expect(f.deck()).toEqual(cards.map(card => card.id)); expect(await f.component.saveDeckPreset(1)).toBe(true);
    expect(f.api.getPresets()[0]).toEqual(cards.map(card => card.id));
  });

  it('rejects unknown native coordinates or duplicate IDs without inventing an equipment classification', async () => {
    const f = fixture(); await activateCurrent(f);
    expect(add(f, { id: B, tab: 7, level: 1 })).toBe(false); expect(add(f, unique(f.defaults, A))).toBe(false);
    expect(f.sent).not.toHaveBeenCalled(); expect(f.api.getDraft().map(card => card.id)).toEqual([A]);
  });
});

describe('character-scoped card deck names', () => {
  const defaults = ['卡册 1', '卡册 2', '卡册 3', '卡册 4'];

  it('migrates old preferences without names and returns independent name arrays', () => {
    const f = fixture(); expect(f.api.getNames()).toEqual(defaults);
    const names = f.api.getNames(); names[0] = '外部修改'; expect(f.api.getNames()).toEqual(defaults);
  });

  it('trims and persists a renamed slot only after storage succeeds', async () => {
    const f = fixture(); const pending = deferred<boolean>(); f.save.mockReturnValueOnce(pending.promise);
    const result = f.component.renameDeckPreset(2, '  挂机套卡  ');
    expect(f.api.getNames()).toEqual(defaults); expect(f.api.isBusy()).toBe(true);
    pending.resolve(true); expect(await result).toBe(true);
    expect(f.api.getNames()).toEqual(['卡册 1', '挂机套卡', '卡册 3', '卡册 4']);
    expect(f.persisted.get(f.session.key!)!.names).toEqual(f.api.getNames());
    expect(f.api.getPresets()).toEqual([null, null, null, null]); expect(f.api.getActivePreset()).toBeNull();
    expect(f.sent).not.toHaveBeenCalled(); expect(f.api.isBusy()).toBe(false);
  });

  it.each(['false', 'reject'] as const)('keeps the previous name after a storage %s', async failure => {
    const f = fixture(); expect(await f.component.renameDeckPreset(1, '原套卡')).toBe(true);
    if (failure === 'false') f.save.mockResolvedValueOnce(false); else f.save.mockRejectedValueOnce(new Error('storage unavailable'));
    expect(await f.component.renameDeckPreset(1, '新套卡')).toBe(false);
    expect(f.api.getNames()[0]).toBe('原套卡'); expect(f.persisted.get(f.session.key!)!.names?.[0]).toBe('原套卡');
    expect(f.api.isBusy()).toBe(false); expect(f.sent).not.toHaveBeenCalled();
  });

  it.each(['', '   ', '\t\r\n', 'A'.repeat(25), '😀'.repeat(25), 'A\nB', 'A\tB', 'A\0B'])('rejects blank, oversized or control-containing names: %j', async name => {
    const f = fixture(); expect(await f.component.renameDeckPreset(1, name)).toBe(false);
    expect(f.api.getNames()).toEqual(defaults); expect(f.save).not.toHaveBeenCalled(); expect(f.sent).not.toHaveBeenCalled();
  });

  it.each(['A'.repeat(24), '😀'.repeat(24)])('accepts exactly 24 Unicode characters: %j', async name => {
    const f = fixture(); expect(await f.component.renameDeckPreset(4, name)).toBe(true);
    expect(f.api.getNames()[3]).toBe(name); expect([...f.api.getNames()[3]!]).toHaveLength(24);
  });

  it('preserves names as text and retains card coordinates, membership and active identity', async () => {
    const f = fixture({ preferences: [[{ id: A, tab: 1, level: 1 }], [{ id: B, tab: 2, level: 1 }], null, null], activePreset: 1 });
    await f.component.saveDeckPreset(1); const before = clone(f.persisted.get(f.session.key!)!.presets);
    f.component.selectDeckPreset(2);
    const name = '<战斗&卡组>'; expect(await f.component.renameDeckPreset(2, name)).toBe(true);
    expect(f.api.getNames()[1]).toBe(name); expect(f.persisted.get(f.session.key!)!.presets).toEqual(before);
    expect(f.api.getPresets()).toEqual([[A], [B], null, null]); expect(f.deck()).toEqual([A]);
    expect(f.api.getSelected()).toBe(2); expect(f.api.getActivePreset()).toBe(1); expect(f.sent).not.toHaveBeenCalled();
    await f.component.renameDeckPreset(3, '套卡三'); expect(f.persisted.get(f.session.key!)!.names?.[1]).toBe(name);
  });

  it('keeps names isolated per character and restores them when returning', async () => {
    const f = fixture(); const originalKey = f.session.key!;
    expect(await f.component.renameDeckPreset(1, '角色甲套卡')).toBe(true);
    f.session.key = 'server5/account1/character20'; expect(f.api.getNames()).toEqual(defaults); f.sync();
    expect(await f.component.renameDeckPreset(1, '角色乙套卡')).toBe(true);
    expect(f.api.getNames()[0]).toBe('角色乙套卡');
    f.session.key = originalKey; expect(f.api.getNames()[0]).toBe('角色甲套卡');
    expect(f.persisted.get(originalKey)!.names?.[0]).toBe('角色甲套卡');
    expect(f.persisted.get('server5/account1/character20')!.names?.[0]).toBe('角色乙套卡');
  });

  it('does not apply an old rename completion to another character', async () => {
    const f = fixture(); const pending = deferred<boolean>(); f.save.mockReturnValueOnce(pending.promise);
    const result = f.component.renameDeckPreset(1, '旧角色套卡');
    f.session.key = 'server5/account1/character20'; expect(f.api.getNames()).toEqual(defaults);
    pending.resolve(true); expect(await result).toBe(false);
    expect(f.api.getNames()).toEqual(defaults); expect(f.api.isBusy()).toBe(false);
    expect(f.persisted.get('server5/account1/character20')).toBeUndefined(); expect(f.sent).not.toHaveBeenCalled();
  });
});

describe('shared manual and hotkey card deck result notifications', () => {
  it('notifies one successful activation only after every server acknowledgement', async () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null], names: ['近战', '防御', '卡册 3', '卡册 4'] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush(); expect(f.notify).not.toHaveBeenCalled();
    f.ack(); await flush(); expect(f.notify).not.toHaveBeenCalled(); f.ack(); expect(await result).toBe(true);
    expect(f.notify).toHaveBeenCalledOnce(); expect(f.notify.mock.calls[0]?.slice(0, 3)).toEqual([true, 2, '防御']);
  });

  it('notifies an explicit server rejection once', async () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush(); f.ack(undefined, 2);
    expect(await result).toBe(false); expect(f.notify).toHaveBeenCalledOnce();
    expect(f.notify.mock.calls[0]?.slice(0, 3)).toEqual([false, 2, '卡册 2']);
    await vi.advanceTimersByTimeAsync(15000); expect(f.notify).toHaveBeenCalledOnce();
  });

  it('notifies a five-second acknowledgement timeout once', async () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    await vi.advanceTimersByTimeAsync(5000); expect(await result).toBe(false);
    expect(f.notify).toHaveBeenCalledOnce(); expect(f.notify.mock.calls[0]?.slice(0, 3)).toEqual([false, 2, '卡册 2']);
    f.ack(); await flush(); expect(f.notify).toHaveBeenCalledOnce();
  });

  it('notifies a synchronous unsaved-preset failure with its custom name once', () => {
    const f = fixture({ names: ['卡册 1', '卡册 2', '预留套卡', '卡册 4'] });
    expect(f.component.switchDeckPreset(3)).toBe(false); expect(f.notify).toHaveBeenCalledOnce();
    expect(f.notify.mock.calls[0]?.slice(0, 3)).toEqual([false, 3, '预留套卡']); expect(f.sent).not.toHaveBeenCalled();
    expect(f.component.append).not.toHaveBeenCalled();
  });

  it.each(['character', 'socket', 'logout'] as const)('suppresses old-session completion notifications after %s change', async change => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    if (change === 'character') f.session.key = 'server5/account1/character20';
    if (change === 'socket') f.session.connection = {};
    if (change === 'logout') f.session.playing = false;
    f.ack(); expect(await result).toBe(false); expect(f.notify).not.toHaveBeenCalled();
  });

  it('does not notify while hotkey input is being edited or recorded, then shares the controller completion notification', async () => {
    const cards = [null, [{ id: B, tab: 2, level: 1 }], null, null];
    const f = fixture({ preferences: cards, verifiedCards: cards });
    let active: HTMLElement | null = document.createElement('input'), capturing = false;
    const component = f.component as Component & { onShortCut?: (binding: { cmd: string }) => unknown };
    installLastroCardDeckShortcutDispatch(component, { getActiveElement: () => active, isCapturing: () => capturing });
    await component.onShortCut!({ cmd: 'SWITCH_DECK_2' }); active = null; capturing = true;
    await component.onShortCut!({ cmd: 'SWITCH_DECK_2' });
    expect(f.notify).not.toHaveBeenCalled(); expect(f.sent).not.toHaveBeenCalled();
    capturing = false; const result = component.onShortCut!({ cmd: 'SWITCH_DECK_2' }); await flush();
    f.ack(); await flush(); f.ack(); expect(await result).toBe(true);
    expect(f.notify).toHaveBeenCalledOnce(); expect(f.notify.mock.calls[0]?.slice(0, 3)).toEqual([true, 2, '卡册 2']);
  });
});

describe('shortcut eligibility follows the server-confirmed card content', () => {
  const presets = [[{ id: A, tab: 1, level: 1 }], [{ id: B, tab: 2, level: 1 }], null, null];

  it('migrates only the currently server-confirmed saved content and rejects other old presets without sending requests', async () => {
    const f = fixture({ preferences: presets, activePreset: 2, activeCards: presets[1]! });
    expect(f.api.isVerified(1)).toBe(true); expect(f.api.isVerified(2)).toBe(false);
    expect(await f.component.switchDeckPreset(2, { requireVerified: true })).toBe(false);
    expect(f.notify).toHaveBeenCalledWith(false, 2, '卡册 2', '请先手动激活，等待服务器确认并保存');
    expect(f.sent).not.toHaveBeenCalled(); expect(f.save).not.toHaveBeenCalled(); expect(f.deck()).toEqual([A]);
  });

  it('records every confirmed preset independently and restores qualification across login without requiring it to be the current deck', async () => {
    const f = fixture({ preferences: presets }); f.sent.mockImplementation(packet => f.ack(packet));
    expect(await f.component.activateDeckPreset(2)).toBe(true);
    expect(f.api.isVerified(1)).toBe(true); expect(f.api.isVerified(2)).toBe(true);
    const stored = f.persisted.get(f.session.key!)!;
    expect(stored.verifiedCards?.slice(0, 2)).toEqual(presets.slice(0, 2));
    const reopened = fixture({ preferences: stored.presets, verifiedCards: stored.verifiedCards, activePreset: stored.activePreset, activeCards: stored.activeCards });
    expect(reopened.deck()).toEqual([A]); expect(reopened.api.isVerified(2)).toBe(true);
    reopened.sent.mockImplementation(packet => reopened.ack(packet));
    expect(await reopened.component.switchDeckPreset(2, { requireVerified: true })).toBe(true);
    expect(reopened.deck()).toEqual([B]); expect(reopened.api.isVerified(1)).toBe(true);
  });

  it('preserves qualification on rename and grants changed content only after confirmed editing and saving', async () => {
    const f = fixture({ preferences: presets }); f.sent.mockImplementation(packet => f.ack(packet));
    expect(await f.component.activateDeckPreset(2)).toBe(true);
    expect(await f.component.renameDeckPreset(2, '挂机套')).toBe(true); expect(f.api.isVerified(2)).toBe(true);
    expect(remove(f, B)).toBe(true); await flush(); expect(add(f, unique(f.defaults, C))).toBe(true); await flush();
    expect(f.api.isVerified(2)).toBe(false); expect(f.api.getActivePreset()).toBe(2); expect(f.deck()).toEqual([C]);
    f.sent.mockClear(); f.notify.mockClear(); expect(f.component.switchDeckPreset(2, { requireVerified: true })).toBe(false);
    expect(f.sent).not.toHaveBeenCalled(); expect(f.notify.mock.calls[0]?.[0]).toBe(false);
    expect(await f.component.saveDeckPreset(2)).toBe(true); expect(f.api.isVerified(2)).toBe(true);
    expect(await f.component.switchDeckPreset(2, { requireVerified: true })).toBe(true); expect(f.sent).not.toHaveBeenCalled();
    expect(f.persisted.get(f.session.key!)!.verifiedCards?.[1]).toEqual([unique(f.defaults, C)]);
  });

  it('does not qualify a partial switch or a rejected add acknowledgement', async () => {
    const f = fixture({ preferences: presets });
    const result = f.component.activateDeckPreset(2); await flush();
    expect(f.api.isVerified(2)).toBe(false); f.ack(); await flush();
    expect(f.api.isVerified(2)).toBe(false); f.ack(undefined, 1); await flush();
    expect(await result).toBe(false); expect(f.api.isVerified(2)).toBe(false);
    expect(f.persisted.get(f.session.key!)?.verifiedCards?.[1]).toBeUndefined();
    f.sent.mockClear(); expect(await f.component.switchDeckPreset(2, { requireVerified: true })).toBe(false);
    expect(f.sent).not.toHaveBeenCalled();
  });

  it('does not reuse a verified ID snapshot with changed native coordinates or for another character', async () => {
    const f = fixture({ preferences: presets, verifiedCards: [null, [{ id: B, tab: 3, level: 1 }], null, null] });
    expect(f.api.isVerified(2)).toBe(false);
    f.sent.mockImplementation(packet => f.ack(packet)); expect(await f.component.activateDeckPreset(2)).toBe(true);
    expect(f.api.isVerified(2)).toBe(true);
    f.session.key = 'server5/account1/other-character'; f.sync();
    expect(f.api.isVerified(2)).toBe(false); f.sent.mockClear();
    expect(await f.component.switchDeckPreset(2, { requireVerified: true })).toBe(false); expect(f.sent).not.toHaveBeenCalled();
  });

  it('does not qualify a matching final ACK when a duplicate ID has conflicting confirmed native definitions', async () => {
    const f = fixture({ synchronized: false });
    const values = definitions(f.defaults, 27118), shield = values.find(card => card.tab === 4)!, shoe = values.find(card => card.tab === 6)!;
    f.stores.get(f.session.key!)!.presets = [null, [shield], null, null];
    f.session.connection = {}; setDeck(f.serverData, [A], [unique(f.defaults, A), ...values]); f.sync();
    const result = f.component.activateDeckPreset(2); await flush(); f.ack(); await flush();
    expect(f.sent.mock.calls.at(-1)?.[0]).toMatchObject({ id: 2785, tab: shield.tab, level: shield.level, cardid: 27118 });
    f.component.updateList({ tab: shoe.tab, level: shoe.level, cardid: 27118, state: 2 });
    expect(f.api.isVerified(2)).toBe(false); f.ack(); await flush();
    expect(await result).toBe(false); expect(f.api.isVerified(2)).toBe(false);
    expect(f.api.getActivePreset()).toBeNull(); expect(f.persisted.get(f.session.key!)?.verifiedCards?.[1]).toBeUndefined();
    expect(f.notify).toHaveBeenCalledWith(false, 2, '卡册 2', '服务器未确认切换');
  });
});

describe('serial server-confirmed card deck switching', () => {
  it('repeatedly switches back and forth through the shortcut dispatcher after each acknowledged completion', async () => {
    const cards = [[{ id: A, tab: 1, level: 1 }], [{ id: B, tab: 2, level: 1 }], null, null];
    const f = fixture({ preferences: cards, verifiedCards: cards, activePreset: 1 });
    const component = f.component as Component & { onShortCut?: (binding: { cmd: string }) => unknown };
    installLastroCardDeckShortcutDispatch(component, { getActiveElement: () => null, isCapturing: () => false });
    f.sent.mockImplementation(packet => f.ack(packet));
    for (const index of [2, 1, 2, 1, 2, 1]) {
      expect(await component.onShortCut!({ cmd: 'SWITCH_DECK_' + index })).toBe(true);
      expect(f.deck()).toEqual(index === 1 ? [A] : [B]); expect(f.api.getActivePreset()).toBe(index);
      expect(f.api.isBusy()).toBe(false); expect(f.api.isDirty(index)).toBe(false);
    }
    expect(f.sent).toHaveBeenCalledTimes(12); expect(f.save).toHaveBeenCalledTimes(6);
    expect(f.notify).toHaveBeenCalledTimes(6); expect(f.notify.mock.calls.every(([success]) => success)).toBe(true);
  });

  it('preserves shared cards and removes/adds only the difference, waiting for every explicit acknowledgement', async () => {
    const f = fixture({ initial: [A, C], preferences: [null, [{ id: B, tab: 2, level: 1 }, { id: C, tab: 5, level: 1 }], null, null] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    expect(f.sent.mock.calls.map(([pkt]) => pkt)).toEqual([{ id: 2787, tab: 0, level: 1, cardid: A }]);
    expect(f.deck()).toEqual([A, C]); expect(f.api.isBusy()).toBe(true); expect(f.api.getActivePreset()).toBeNull();
    f.ack(); await flush();
    const definition = unique(f.defaults, B);
    expect(f.sent.mock.calls.at(-1)?.[0]).toEqual({ id: 2785, tab: definition.tab, level: definition.level, cardid: B });
    expect(f.deck()).toEqual([C]); expect(f.sent).toHaveBeenCalledTimes(2);
    f.ack(); expect(await result).toBe(true); expect(f.deck().sort()).toEqual([B, C].sort());
    expect(f.api.getActivePreset()).toBe(2); expect(f.api.isBusy()).toBe(false);
  });

  it('accepts an acknowledgement delivered synchronously during sendPacket', async () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    f.sent.mockImplementation(packet => { f.ack(packet); });
    expect(await f.component.switchDeckPreset(2)).toBe(true);
    expect(f.sent.mock.calls.map(([packet]) => packet.id)).toEqual([2787, 2785]);
    expect(f.deck()).toEqual([B]); expect(f.api.getActivePreset()).toBe(2);
  });

  it('accepts slow valid acknowledgements without retries or optimistic membership changes', async () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    await vi.advanceTimersByTimeAsync(4500); expect(f.sent).toHaveBeenCalledTimes(1); expect(f.deck()).toEqual([A]);
    f.ack(); await flush(); expect(f.sent).toHaveBeenCalledTimes(2); expect(f.deck()).toEqual([]);
    await vi.advanceTimersByTimeAsync(4500); expect(f.sent).toHaveBeenCalledTimes(2); expect(f.deck()).toEqual([]);
    f.ack(); expect(await result).toBe(true); expect(f.deck()).toEqual([B]);
  });

  it.each(['cancel', 'add'] as const)('stops after an explicit %s rejection and does not resend', async action => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    if (action === 'add') { f.ack(); await flush(); }
    f.ack(undefined, action === 'cancel' ? 2 : 1); expect(await result).toBe(false);
    expect(f.api.getActivePreset()).toBeNull(); expect(f.api.isBusy()).toBe(false);
    const count = f.sent.mock.calls.length; await vi.advanceTimersByTimeAsync(15000); expect(f.sent).toHaveBeenCalledTimes(count);
  });

  it.each(['false', 'reject'] as const)('keeps the acknowledged server deck when saving its active marker %s', async failure => {
    const f = fixture({ preferences: [[{ id: A, tab: 1, level: 1 }], [{ id: B, tab: 2, level: 1 }], null, null], activePreset: 1 });
    expect(await f.component.saveDeckPreset(1)).toBe(true);
    expect(f.persisted.get(f.session.key!)!.activePreset).toBe(1);
    if (failure === 'false') f.save.mockResolvedValueOnce(false); else f.save.mockRejectedValueOnce(new Error('storage unavailable'));
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush(); f.ack(); await flush(); f.ack();
    expect(await result).toBe(true); expect(f.deck()).toEqual([B]); expect(f.api.getActivePreset()).toBe(2);
    expect(f.api.isBusy()).toBe(false); expect(f.status()).toContain('活动标记保存失败');
    expect(f.persisted.get(f.session.key!)!.activePreset).toBe(1);
    expect(f.sent).toHaveBeenCalledTimes(2); await vi.advanceTimersByTimeAsync(15000); expect(f.sent).toHaveBeenCalledTimes(2);
    expect(f.deck()).toEqual([B]);
  });

  it('expires a missing acknowledgement after five seconds without a retry or late continuation', async () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    await vi.advanceTimersByTimeAsync(4999); expect(f.api.isBusy()).toBe(true); expect(f.sent).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1); expect(await result).toBe(false); expect(f.api.isBusy()).toBe(true);
    f.ack(); await flush(); expect(f.sent).toHaveBeenCalledTimes(1); expect(f.api.getActivePreset()).toBeNull(); expect(f.api.isBusy()).toBe(false);
  });

  it('does not advance on another card acknowledgement and ignores a repeated previous acknowledgement', async () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    f.component.cancelUpdate({ tab: 0, level: 1, cardid: C, state: 1 }); await flush(); expect(f.sent).toHaveBeenCalledTimes(1);
    const cancel = f.sent.mock.calls[0]![0]; f.ack(cancel); await flush(); expect(f.sent).toHaveBeenCalledTimes(2);
    f.ack(cancel); await flush(); expect(f.sent).toHaveBeenCalledTimes(2); expect(f.api.isBusy()).toBe(true);
    f.ack(); expect(await result).toBe(true); expect(f.deck()).toEqual([B]);
  });

  it('rejects overlapping switches, saves and native mutation requests while an acknowledgement is pending', async () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    expect(await f.component.switchDeckPreset(2)).toBe(false); expect(await f.component.saveDeckPreset(3)).toBe(false);
    expect(f.component.sendAction('add-deck', { tab: 2, level: 1, cardid: B })).toBe(false);
    expect(f.sent).toHaveBeenCalledTimes(1); f.api.invalidate(); expect(await result).toBe(false);
  });

  it('aborts when a new full snapshot arrives during a pending operation', async () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    const authoritative = clone(f.serverData); setDeck(authoritative, [C]); f.sync(authoritative);
    expect(await result).toBe(false); expect(f.deck()).toEqual([C]); expect(f.sent).toHaveBeenCalledTimes(1);
    f.ack(f.sent.mock.calls[0]![0]); await flush(); expect(f.sent).toHaveBeenCalledTimes(1);
  });

  it('validates the complete target before removing anything and never recharges unavailable cards', async () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const unavailable = clone(f.serverData); setState(unavailable, unique(f.defaults, B), 0); f.sync(unavailable);
    expect(await f.component.switchDeckPreset(2)).toBe(false); expect(f.deck()).toEqual([A]); expect(f.sent).not.toHaveBeenCalled();
  });

  it('waits for a pending native recharge action before accepting a preset switch', async () => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const card = { tab: 5, level: 1, cardid: C };
    expect(f.component.sendAction('recharge', card)).toBe(true); expect(f.api.isBusy()).toBe(true);
    expect(await f.component.switchDeckPreset(2)).toBe(false); expect(await f.component.saveDeckPreset(3)).toBe(false);
    expect(f.sent).toHaveBeenCalledTimes(1);
    f.component.updateList({ ...card, state: 1 });
    await flush(); expect(f.api.isBusy()).toBe(false);
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    expect(f.sent).toHaveBeenCalledTimes(2); f.api.invalidate(); expect(await result).toBe(false);
  });

  it.each([
    { cards: [{ id: B, tab: 2, level: 99 }] },
    { cards: [{ id: B, tab: 1, level: 1 }] },
    { cards: [{ id: 999999, tab: 2, level: 1 }] },
    { cards: [{ id: B, tab: 2, level: 1 }, { id: B, tab: 2, level: 1 }] },
  ])('rejects malformed or no-longer-valid saved coordinates before cancellation: %j', async ({ cards }) => {
    const f = fixture({ preferences: [null, cards, null, null] });
    expect(await f.component.switchDeckPreset(2)).toBe(false); expect(f.deck()).toEqual([A]); expect(f.sent).not.toHaveBeenCalled();
  });
});

describe('card deck session boundaries and ambiguous card coordinates', () => {
  it.each(['character', 'socket', 'logout', 'invalidate'] as const)('stops a pending operation across %s change', async change => {
    const f = fixture({ preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush(); const packet = f.sent.mock.calls[0]![0];
    if (change === 'character') f.session.key = 'server5/account1/character20';
    if (change === 'socket') f.session.connection = {};
    if (change === 'logout') f.session.playing = false;
    if (change === 'invalidate') f.api.invalidate();
    f.ack(packet); expect(await result).toBe(false); expect(f.sent).toHaveBeenCalledTimes(1); expect(f.api.isBusy()).toBe(false);
    expect(f.api.getActivePreset()).toBeNull();
  });

  it('does not mark another character active after an old storage completion', async () => {
    const f = fixture(); await activateCurrent(f); const pending = deferred<boolean>(); f.save.mockReturnValueOnce(pending.promise);
    const result = f.component.saveDeckPreset(1); f.session.key = 'server5/account1/character20';
    f.api.getPresets(); pending.resolve(true); expect(await result).toBe(false);
    expect(f.api.getActivePreset()).toBeNull(); expect(f.api.getPresets()).toEqual([null, null, null, null]);
  });

  it('requires another full snapshot after invalidate or a connection replacement', async () => {
    const f = fixture(); await activateCurrent(f); await f.component.saveDeckPreset(1); f.api.invalidate();
    expect(await f.component.saveDeckPreset(2)).toBe(false); expect(await f.component.switchDeckPreset(1)).toBe(false);
    f.sync(); expect(await f.component.switchDeckPreset(1)).toBe(true);
    f.session.connection = {}; expect(await f.component.switchDeckPreset(1)).toBe(false); expect(f.sent).not.toHaveBeenCalled();
  });

  it('does not accept a partial native snapshot as complete server state', async () => {
    const f = fixture({ synchronized: false }); const packet = snapshot(f.serverData); packet.classInfos.pop();
    f.component.rechargeList(packet); expect(await f.component.saveDeckPreset(1)).toBe(false); expect(f.save).not.toHaveBeenCalled();
    f.sync(); expect(await f.component.activateDeckPreset(1)).toBe(true); expect(await f.component.saveDeckPreset(1)).toBe(true);
  });

  it.each(['class-count', 'page-count', 'missing-slot', 'bad-state'] as const)('rejects an invalid complete snapshot: %s', async kind => {
    const f = fixture({ synchronized: false, preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const packet = snapshot(f.serverData);
    if (kind === 'class-count') packet.classNum = 7;
    if (kind === 'page-count') packet.classInfos[1]!.data.pop();
    if (kind === 'missing-slot') delete (packet.classInfos[0]!.data[0]! as Record<string, unknown>).recharge7;
    if (kind === 'bad-state') (packet.classInfos[1]!.data[0]! as Record<string, unknown>).recharge0 = 3;
    f.component.rechargeList(packet);
    expect(await f.component.saveDeckPreset(1)).toBe(false); expect(await f.component.switchDeckPreset(2)).toBe(false);
    expect(f.save).not.toHaveBeenCalled(); expect(f.sent).not.toHaveBeenCalled();
    f.sync(); f.sent.mockImplementation(packet => f.ack(packet));
    expect(await f.component.activateDeckPreset(1)).toBe(true); expect(await f.component.saveDeckPreset(1)).toBe(true);
  });

  it('records the unique in-deck definition of ID 27118 rather than its first occurrence', async () => {
    const f = fixture({ synchronized: false }); const coordinates = definitions(f.defaults, 27118);
    expect(coordinates.map(value => value.tab)).toEqual([4, 6]);
    const chosen = coordinates.find(value => value.tab === 6)!;
    const charged = coordinates.find(value => value.tab === 4)!;
    setDeck(f.serverData, [27118], [chosen]); setState(f.serverData, charged, 1); f.sync();
    expect(await f.component.activateDeckPreset(1)).toBe(true); expect(await f.component.saveDeckPreset(1)).toBe(true);
    expect(f.persisted.get(f.session.key!)!.presets[0]).toEqual([chosen]);
  });

  it('uses saved coordinates for a duplicate ID and does not accept an acknowledgement from another category', async () => {
    const f = fixture({ synchronized: false, preferences: [null, [{ id: 27118, tab: 6, level: 7 }], null, null] }); const coordinates = definitions(f.defaults, 27118);
    const chosen = coordinates.find(value => value.tab === 6)!, other = coordinates.find(value => value.tab === 4)!;
    setDeck(f.serverData, [A], [unique(f.defaults, A), chosen, other]); f.sync();
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush(); f.ack(); await flush();
    expect(f.sent.mock.calls.at(-1)?.[0]).toEqual({ id: 2785, tab: chosen.tab, level: chosen.level, cardid: 27118 });
    f.component.updateList({ tab: other.tab, level: other.level, cardid: 27118, state: 1 }); await flush();
    expect(f.api.isBusy()).toBe(true); expect(f.api.getActivePreset()).toBeNull();
    f.ack(); expect(await result).toBe(true); expect(f.deck()).toEqual([27118]);
  });

  it('does not guess a default draft from server membership with ambiguous category definitions', async () => {
    const f = fixture({ synchronized: false }); const coordinates = definitions(f.defaults, 27118);
    setDeck(f.serverData, [27118], coordinates); f.sync();
    expect(f.api.getDraft(1)).toEqual([]); expect(f.api.getPresets()[0]).toBeNull(); expect(f.save).not.toHaveBeenCalled();
    expect(f.api.getAvailableCards().map(card => card.id)).not.toContain(27118);
  });

  it('refuses a switch before cancellation when the current card has two confirmed original definitions', async () => {
    const f = fixture({ synchronized: false, preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const coordinates = definitions(f.defaults, 27118);
    setDeck(f.serverData, [27118], coordinates); setState(f.serverData, unique(f.defaults, B), 1); f.sync();
    expect(await f.component.switchDeckPreset(2)).toBe(false); expect(f.sent).not.toHaveBeenCalled();
    expect(f.deck()).toEqual([27118]); expect(f.api.isBusy()).toBe(false); expect(f.api.getActivePreset()).toBeNull();
  });

  it('accepts a cancel acknowledgement at the unique confirmed original category and level', async () => {
    const f = fixture({ synchronized: false, preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const coordinates = definitions(f.defaults, 27118);
    const confirmed = coordinates.find(value => value.tab === 6)!, other = coordinates.find(value => value.tab === 4)!;
    setDeck(f.serverData, [27118], [confirmed, unique(f.defaults, B)]); setState(f.serverData, other, 1); f.sync();
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    expect(f.sent.mock.calls[0]![0]).toEqual({ id: 2787, tab: 0, level: 1, cardid: 27118 });
    f.component.cancelUpdate({ tab: other.tab, level: other.level, cardid: 27118, state: 1 }); await flush();
    expect(f.sent).toHaveBeenCalledTimes(1); expect(f.api.isBusy()).toBe(true);
    f.component.cancelUpdate({ tab: confirmed.tab, level: confirmed.level, cardid: 27118, state: 1 }); await flush();
    expect(f.sent.mock.calls.at(-1)?.[0]).toEqual({ id: 2785, tab: 2, level: 1, cardid: B });
    f.ack(); expect(await result).toBe(true); expect(f.deck()).toEqual([B]); expect(f.api.getActivePreset()).toBe(2);
  });

  it('accepts the unique charged original definition when the current deck has no state-2 category entry', async () => {
    const f = fixture({ synchronized: false, preferences: [null, [{ id: B, tab: 2, level: 1 }], null, null] });
    const origin = unique(f.defaults, A);
    setDeck(f.serverData, [A]); setState(f.serverData, origin, 1); f.sync();
    const result = Promise.resolve(f.component.switchDeckPreset(2)); await flush();
    expect(f.sent.mock.calls[0]![0]).toEqual({ id: 2787, tab: 0, level: 1, cardid: A });
    f.component.cancelUpdate({ tab: origin.tab, level: origin.level, cardid: A, state: 1 }); await flush();
    expect(f.sent.mock.calls.at(-1)?.[0]).toEqual({ id: 2785, tab: 2, level: 1, cardid: B });
    f.ack(); expect(await result).toBe(true); expect(f.deck()).toEqual([B]); expect(f.api.getActivePreset()).toBe(2);
  });
});
