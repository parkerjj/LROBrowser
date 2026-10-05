// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { installLastroCardDeckUI } from '../scripts/lastro-card-deck-ui.mjs';
import { installLastroCardDeck } from '../scripts/lastro-card-deck.mjs';
import { installLastroCardState, type LastroCardStateData, type LastroCardStatePacket } from '../scripts/lastro-card-state.mjs';
import { setLastROInnerHTML } from '../src/runtime/lastro-trusted-dom.mjs';

interface Definition { id: number; tab: number; level: number; }
interface NativePanel {
  _tab: number; _level: number; _search: string; _page: number; _totalPages: number; _filter: string;
  _data: LastroCardStateData;
  getRoot(): HTMLElement;
  renderCards(): void;
  render(): string;
  renderDeck(): DocumentFragment;
  renderCategory(): DocumentFragment;
  handleBodyClick(event: Event): void;
  createCardNode(entry: { id: number; tab?: number; level?: number; name: string; state?: number }, options?: object): HTMLElement;
  init(): void;
  onRemove(): void;
  setStatus(message: string): void;
  setActivate(packet: { tab: number; level: number; state: number }): boolean;
  sendAction(action: string, values: { cardid: number; tab: number; level: number }): boolean;
  rechargeList(packet: object): boolean;
  updateList(packet: LastroCardStatePacket): boolean;
  cancelUpdate(packet: LastroCardStatePacket): boolean;
  switchTab(tab: number): void;
  cardName(id: number): string;
}
const nativeLibrary = readFileSync('vendor/v2/lastro-card-collection.mjs', 'utf8').replace(/^export /gm, '');
const nativeUI = readFileSync('vendor/v2/lastro-card-collection-ui.mjs', 'utf8').replace(/^export /gm, '');
const nativeStateDeps = new WeakMap<NativePanel, Parameters<typeof installLastroCardState>[1]>();
function nativePanel(root: HTMLElement, sendPacket = vi.fn<(packet: { id: number; tab: number; level: number; cardid: number }) => void>()) {
  class GUIComponent {
    static MouseMode = { STOP: 1 };
    getRoot() { return root; }
  }
  const context = vm.createContext({ document, GUIComponent,
    DB: { getItemInfo: (id: number) => ({ identifiedDisplayName: '卡片 ' + id }) }, Client: {},
    Configs: { get: () => 5 }, Network: { sendPacket }, PACKET: { CZ: {
      REQUEST_CARDCONNECTION_RECHARGE: class {}, REQUEST_CARDCONNECTION_ADDMYDECK: class {}, REQUEST_CARDCONNECTION_CANCEL: class {},
    } },
  });
  vm.runInContext(nativeLibrary + '\n' + nativeUI + `\nvar panel = createCardCollectionComponent({
    GUIComponent, DB, Client, Configs, Network, PACKET, CARD_CONNECTION_TABS,
    getCardConnectionData,listCardEntries,getCardDeckOverview,getCardLevelCount,
    buildCardConnectionAction,applyCardConnectionUpdate,applyCardConnectionCancelUpdate,
    applyCardConnectionActivateUpdate,applyCardConnectionEnableUpdate
  });`, context);
  const panel = context.panel as NativePanel;
  nativeStateDeps.set(panel, { document,
    CARD_CONNECTION_TABS: vm.runInContext('CARD_CONNECTION_TABS', context),
    listCardEntries: vm.runInContext('listCardEntries', context),
    resolveCategoryCardAction: vm.runInContext('resolveCategoryCardAction', context),
  } as Parameters<typeof installLastroCardState>[1]);
  setLastROInnerHTML(root, panel.render()); panel.init(); return panel;
}

function fixture(native = false, getEquipmentTab?: (card: Definition) => number | null) {
  const root = document.createElement('div'); document.body.append(root);
  const panel = native ? nativePanel(root) : null;
  const body = native ? root.querySelector<HTMLElement>('[data-body]')! : document.createElement('div');
  if (!native) { body.dataset.body = ''; root.append(body); }
  const state = { selected: 1, active: 1 as number | null, current: [1, 2], busy: false };
  const presets: Array<number[] | null> = [[1, 2], [3, 4], null, null];
  const names = ['卡册 1', '卡册 2', '卡册 3', '卡册 4'];
  const definitions: Definition[] = [1, 2, 3, 4].map(id => ({ id, tab: 1, level: 1 }));
  const drafts = presets.map(cards => (cards || []).map(id => ({ ...definitions[id - 1]! })));
  const component = Object.assign(panel || {
    getRoot: () => root, renderCards() { body.textContent = state.current.join(','); }, onRemove: vi.fn(),
  }, { setStatus: vi.fn<(message: string) => void>(panel ? panel.setStatus.bind(panel) : () => {}) });
  function syncActual() {
    if (!panel) return;
    panel._data.data[0]!.data[1]!.cards = [...state.current, ...Array(8 - state.current.length).fill(0)];
    const row = panel._data.data[1]!.data[1]!;
    row.cards = [1, 2, 3, 4, 0, 0, 0, 0];
    row.recharge = row.cards.map(id => !id ? 0 : state.current.includes(id) ? 2 : 1);
  }
  syncActual();
  const selection = vi.fn((index: number) => { state.selected = index; component.renderCards(); return true; });
  const activation = vi.fn((index: number) => {
    if (state.busy) return false;
    const cards = presets[index - 1] || [];
    state.current = [...cards]; state.active = index;
    drafts[index - 1] = cards.map(id => ({ ...definitions.find(card => card.id === id)! }));
    syncActual(); component.renderCards(); return true;
  });
  const rename = vi.fn(async (index: number, value: string) => {
    const name = value.trim();
    if (!name || [...name].length > 24) return false;
    names[index - 1] = name; component.renderCards(); return true;
  });
  const localAction = vi.fn((action: string, values: { cardid: number; tab: number; level: number }) => {
    const cards = drafts[state.selected - 1]!;
    if (action === 'cancel') drafts[state.selected - 1] = cards.filter(card => card.id !== values.cardid);
    else if (action === 'add-deck' && cards.length < 8 && !cards.some(card => card.id === values.cardid)) {
      cards.push({ id: values.cardid, tab: values.tab, level: values.level });
    } else return false;
    component.renderCards(); return true;
  });
  if (panel) panel.sendAction = localAction;
  const dirty = (index: number) => JSON.stringify(drafts[index - 1]!.map(card => card.id)) !== JSON.stringify(presets[index - 1]);
  const canEdit = (index = state.selected) => !state.busy && state.active === index && state.selected === index
    && JSON.stringify(drafts[index - 1]!.map(card => card.id)) === JSON.stringify(state.current);
  const api = installLastroCardDeckUI(component, {
    document, getPresets: () => presets, getNames: () => [...names], getSelected: () => state.selected, getActivePreset: () => state.active,
    getDraft: (index = state.selected) => drafts[index - 1]!.map(card => ({ ...card })), isDirty: dirty,
    canEdit, canSave: canEdit,
    getAvailableCards: () => definitions.map(card => ({ ...card, state: state.current.includes(card.id) ? 2 : 1 })),
    getCardState: card => state.current.includes(card.id) ? 2 : definitions.some(value => value.id === card.id) ? 1 : 0,
    getCardDefinition: id => definitions.find(card => card.id === id) || null,
    getEquipmentTab,
    isBusy: () => state.busy, isActive: cards => cards.length === state.current.length && cards.every(id => state.current.includes(id)),
    select: selection, activate: activation, rename,
    save(index) { presets[index - 1] = drafts[index - 1]!.map(card => card.id); component.renderCards(); },
  });
  component.renderCards();
  const button = (index: number) => root.querySelector<HTMLButtonElement>(`[data-preset="${index}"]`)!;
  const record = () => root.querySelector<HTMLButtonElement>('.preset-save')!.click();
  const activate = () => root.querySelector<HTMLButtonElement>('.preset-activate')!.click();
  const active = () => [...root.querySelectorAll<HTMLElement>('[data-preset].active')].map(el => Number(el.dataset.preset));
  const edit = (index: number) => {
    button(index).querySelector('.preset-name')!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
    return root.querySelector<HTMLInputElement>('[data-preset-name-input]')!;
  };
  return { root, state, presets, names, drafts, definitions, component, panel, api, button, record, activate, active, edit, selection, activation, rename, localAction };
}
async function flush() { for (let count = 0; count < 5; count++) await Promise.resolve(); }
function key(input: HTMLInputElement, value: string) {
  input.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
}
afterEach(() => { document.body.replaceChildren(); vi.useRealTimers(); });

describe('card deck recording and current preset indicator', () => {
  it('requires activation before saving another slot and never saves through activation', () => {
    const f = fixture(); f.button(2).click(); f.activate();
    expect(f.active()).toEqual([2]);
    f.button(3).click();
    expect(f.active()).toEqual([2]); expect(f.button(3).getAttribute('aria-pressed')).toBe('true');
    f.record();
    expect(f.presets[2]).toBeNull(); expect(f.active()).toEqual([2]);
    f.activate(); expect(f.active()).toEqual([3]);
    expect(f.button(2).querySelector('small')!.textContent).toBe('2 张');
    expect(f.presets[2]).toBeNull(); expect(f.button(3).querySelector('small')!.textContent).toBe('使用中 · 未保存');
    f.record(); expect(f.presets[2]).toEqual([]); expect(f.active()).toEqual([3]);
    expect(f.button(3).querySelector('small')!.textContent).toBe('使用中');
    expect(f.root.querySelectorAll('[data-deck-presets]')).toHaveLength(1);
    expect(f.root.querySelectorAll('[data-deck-style]')).toHaveLength(1);
  });

  it('switches between saved identical presets without showing both as in use', () => {
    const f = fixture(); f.presets[2] = [1, 2]; f.drafts[2] = f.drafts[0]!.map(card => ({ ...card })); f.button(3).click(); f.activate();
    expect(f.active()).toEqual([3]);
    f.button(1).click(); expect(f.active()).toEqual([3]); f.activate(); expect(f.active()).toEqual([1]);
    f.button(3).click(); expect(f.active()).toEqual([1]); f.activate(); expect(f.active()).toEqual([3]);
  });

  it('marks acknowledged changes as unsaved and trusts controller invalidation', () => {
    const f = fixture(); f.drafts[0] = f.drafts[0]!.slice(1); f.state.current = [2]; f.component.renderCards();
    expect(f.active()).toEqual([1]); expect(f.button(1).querySelector('small')!.textContent).toBe('使用中 · 未保存');
    f.state.active = null; f.component.renderCards();
    expect(f.active()).toEqual([]);
  });

  it('retains the confirmed preset during an unconfirmed switch and disables concurrent recording', () => {
    const f = fixture(); f.state.selected = 2; f.state.busy = true; f.component.renderCards();
    expect(f.active()).toEqual([1]); expect(f.button(2).getAttribute('aria-pressed')).toBe('true');
    expect(f.button(2).disabled).toBe(true);
    expect(f.root.querySelector<HTMLButtonElement>('.preset-save')!.disabled).toBe(true);
    expect(f.root.querySelector<HTMLButtonElement>('.preset-activate')!.disabled).toBe(true);
    f.record(); expect(f.presets[1]).toEqual([3, 4]); expect(f.active()).toEqual([1]);
  });

  it('selects saved and empty slots without activating, with a separate equally sized activation button', () => {
    const f = fixture(); f.button(2).click();
    expect(f.selection).toHaveBeenCalledExactlyOnceWith(2);
    expect(f.activation).not.toHaveBeenCalled();
    expect(f.state.current).toEqual([1, 2]); expect(f.active()).toEqual([1]);
    expect(f.button(2).getAttribute('aria-pressed')).toBe('true');
    const use = f.root.querySelector<HTMLButtonElement>('.preset-activate')!;
    const record = f.root.querySelector<HTMLButtonElement>('.preset-save')!;
    expect(use.parentElement).toBe(record.parentElement);
    expect(getComputedStyle(use).height).toBe('32px');
    expect(getComputedStyle(record).height).toBe('32px');
    f.activate(); expect(f.activation).toHaveBeenCalledExactlyOnceWith(2);
    expect(f.active()).toEqual([2]); expect(f.state.current).toEqual([3, 4]);
    f.button(3).click(); expect(use.disabled).toBe(false); expect(use.textContent).toBe('激活');
    f.activate(); expect(f.activation).toHaveBeenCalledTimes(2); expect(f.active()).toEqual([3]);
    expect(f.state.current).toEqual([]);
  });

  it('opens an inline name editor on a real double-click sequence without activating or sending card changes', () => {
    const f = fixture(), name = f.button(2).querySelector('.preset-name')!;
    name.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    name.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 2 }));
    const input = f.edit(2);
    expect(input.value).toBe('卡册 2'); expect(input.maxLength).toBe(24);
    expect(input.parentElement).toBe(f.button(2).parentElement);
    expect(f.button(2).contains(input)).toBe(false);
    expect(document.activeElement).toBe(input);
    expect(f.activation).not.toHaveBeenCalled(); expect(f.rename).not.toHaveBeenCalled();
    expect(f.state.current).toEqual([1, 2]); expect(f.active()).toEqual([1]);
    expect(f.root.querySelector<HTMLButtonElement>('.preset-activate')!.disabled).toBe(true);
    expect(f.root.querySelector<HTMLButtonElement>('.preset-save')!.disabled).toBe(true);
  });

  it('saves a name exactly once on Enter, survives server rerenders, and keeps the current preset unchanged', async () => {
    const f = fixture(), input = f.edit(1);
    input.value = '  练级套卡  ';
    f.component.renderCards();
    expect(f.root.querySelector('[data-preset-name-input]')).toBe(input);
    expect(input.value).toBe('  练级套卡  ');
    key(input, 'Enter'); input.dispatchEvent(new Event('blur'));
    expect(f.rename).toHaveBeenCalledExactlyOnceWith(1, '  练级套卡  ');
    await flush();
    expect(f.names[0]).toBe('练级套卡');
    expect(f.button(1).querySelector('.preset-name')!.textContent).toBe('练级套卡');
    expect(f.root.querySelector('[data-preset-name-input]')).toBeNull();
    expect(f.activation).not.toHaveBeenCalled(); expect(f.active()).toEqual([1]);
  });

  it('commits on blur but cancels Escape and native panel removal without leaking keys to the game', async () => {
    const f = fixture(); let input = f.edit(2); input.value = '副本'; input.blur(); await flush();
    expect(f.rename).toHaveBeenCalledExactlyOnceWith(2, '副本');
    const globalKey = vi.fn(); window.addEventListener('keydown', globalKey);
    try {
      input = f.edit(2); input.value = '不会保存'; key(input, 'Escape'); await flush();
      expect(globalKey).not.toHaveBeenCalled();
      expect(f.rename).toHaveBeenCalledTimes(1); expect(f.names[1]).toBe('副本');
    } finally { window.removeEventListener('keydown', globalKey); }
    input = f.edit(3); input.value = '关闭时取消'; f.component.onRemove(); await flush();
    expect(f.rename).toHaveBeenCalledTimes(1);
    expect(f.root.querySelector('[data-preset-name-input]')).toBeNull();
  });

  it('waits for name persistence and leaves the original label after a failed save', async () => {
    const f = fixture(); let resolve!: (value: boolean) => void;
    f.rename.mockImplementation(() => new Promise<boolean>(finish => { resolve = finish; }));
    const input = f.edit(2); input.value = '等待保存'; key(input, 'Enter');
    expect(f.rename).toHaveBeenCalledExactlyOnceWith(2, '等待保存');
    expect(f.button(2).querySelector('.preset-name')!.textContent).toBe('卡册 2');
    expect(f.root.querySelector<HTMLButtonElement>('.preset-activate')!.disabled).toBe(true);
    f.activate(); f.button(1).click();
    expect(f.activation).not.toHaveBeenCalled(); expect(f.selection).not.toHaveBeenCalled();
    resolve(false); await flush();
    expect(f.button(2).querySelector('.preset-name')!.textContent).toBe('卡册 2');
    expect(f.component.setStatus).toHaveBeenCalledWith('套卡名称未保存，请检查名称或稍后重试');
    expect(f.root.querySelector<HTMLButtonElement>('.preset-activate')!.disabled).toBe(true);
    f.rename.mockRejectedValueOnce(new Error('storage'));
    const retry = f.edit(2); retry.value = '失败名称'; key(retry, 'Enter'); await flush();
    expect(f.component.setStatus).toHaveBeenCalledWith('套卡名称保存失败，请重试');
    expect(f.button(2).querySelector('.preset-name')!.textContent).toBe('卡册 2');
  });

  it('keeps IME composition open, skips unchanged names, and renders custom names as plain text', async () => {
    const f = fixture(), input = f.edit(1);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }));
    expect(f.root.querySelector('[data-preset-name-input]')).toBe(input);
    key(input, 'Enter'); await flush(); expect(f.rename).not.toHaveBeenCalled();
    f.names[0] = '<b>打怪</b>'; f.component.renderCards();
    expect(f.button(1).querySelector('.preset-name')!.textContent).toBe('<b>打怪</b>');
    expect(f.button(1).querySelector('b')).toBeNull();
    expect(f.root.querySelectorAll('[data-deck-presets]')).toHaveLength(1);
  });

  it('preserves the controller reason when a rejected name updates the native status text', async () => {
    const f = fixture(), status = document.createElement('span'); status.dataset.status = ''; status.textContent = '就绪';
    f.root.append(status);
    f.component.setStatus.mockImplementation((message: string) => { status.textContent = message; });
    f.rename.mockImplementation(async () => {
      f.component.setStatus('卡册名称不能为空，最多24个字符，请勿包含控制字符'); return false;
    });
    const input = f.edit(1); input.value = '   '; key(input, 'Enter'); await flush();
    expect(status.textContent).toBe('卡册名称不能为空，最多24个字符，请勿包含控制字符');
    expect(f.component.setStatus).toHaveBeenCalledTimes(1);
    expect(f.names[0]).toBe('卡册 1');
  });

  it('explains explicit preset activation while preserving equipment slot hints and an ongoing name edit', () => {
    const f = fixture();
    const rules = document.createElement('div'); rules.className = 'deck-rules';
    const slots = document.createElement('div'); slots.className = 'slots';
    const hint = document.createElement('span'); hint.textContent = '头饰 ×1'; slots.append(hint);
    rules.append(document.createTextNode('卡片加入卡组后，自动绑定指定类型装备并激活效果，无需手动激活。'), slots);
    f.root.querySelector('[data-body]')!.append(rules);
    f.api.sync();
    expect(rules.textContent).toContain('先激活卡册，再加入或移除卡片。操作经服务器确认后保存');
    expect(rules.textContent).toContain('部位及数量限制由服务器判断，双击名称可重命名');
    expect(rules.textContent).not.toContain('无需手动激活');
    expect(rules.querySelector('.slots')).toBe(slots);
    expect(slots.firstChild).toBe(hint);
    const instructions = rules.firstChild;
    const input = f.edit(2); input.value = '编辑中的名称';
    f.api.sync(); f.api.sync();
    expect(rules.firstChild).toBe(instructions);
    expect(f.root.querySelector('[data-preset-name-input]')).toBe(input);
    expect(input.value).toBe('编辑中的名称');
    expect(f.root.querySelectorAll('[data-deck-presets]')).toHaveLength(1);
    key(input, 'Escape');
  });
});

// Native server-confirmed editing integration follows.
interface Packet { id: number; tab: number; level: number; cardid: number; }
interface ServerPanel extends NativePanel {
  selectDeckPreset(index: number): boolean;
  activateDeckPreset(index: number): Promise<boolean> | boolean;
  saveDeckPreset(index: number): Promise<boolean> | boolean;
  switchDeckPreset(index: number, options?: { requireVerified: boolean }): Promise<boolean> | boolean;
}
const A = 4010, B = 4001, C = 4112, D = 4646;
function serverFixture() {
  vi.useFakeTimers();
  const root = document.createElement('div'); document.body.append(root);
  const sent = vi.fn<(packet: Packet) => void>();
  const component = nativePanel(root, sent) as ServerPanel;
  installLastroCardState(component, nativeStateDeps.get(component)!);
  const defaults = structuredClone(component._data), server = structuredClone(defaults);
  function definition(id: number): Definition {
    const matches: Definition[] = [];
    for (const [tab, category] of Object.entries(defaults.data)) {
      if (Number(tab) === 0) continue;
      for (const [level, row] of Object.entries(category.data)) {
        if (row.cards.includes(id)) matches.push({ id, tab: Number(tab), level: Number(level) });
      }
    }
    expect(matches).toHaveLength(1); return matches[0]!;
  }
  const definitions = [A, B, C, D].map(definition);
  function setState(data: LastroCardStateData, card: Definition, state: number) {
    const row = data.data[card.tab]!.data[card.level]!;
    row.recharge[row.cards.indexOf(card.id)] = state;
  }
  for (const card of definitions) setState(server, card, 1);
  setState(server, definition(A), 2); server.data[0]!.data[1]!.cards = [A, 0, 0, 0, 0, 0, 0, 0];
  const saved = vi.fn<() => Promise<boolean>>(async () => true);
  const preference = { presets: [[definition(A)], [definition(B)], null, null] as Array<Definition[] | null>,
    activePreset: 1, activeCards: [definition(A)], names: ['主卡册', '副卡册', '卡册 3', '卡册 4'], save: saved };
  const session = { key: 'server5/account1/character10', connection: {}, playing: true };
  const notify = vi.fn();
  const api = installLastroCardDeck(component, {
    getSession: () => ({ ...session }), getDefaults: () => structuredClone(defaults),
    loadPreferences: () => preference, setTimeout, clearTimeout, notify,
  });
  const ui = installLastroCardDeckUI(component, { document, ...api,
    select: index => component.selectDeckPreset(index), save: index => component.saveDeckPreset(index),
    activate: index => component.activateDeckPreset(index), rename: async () => true,
  });
  function sync() {
    const classInfos = Object.values(server.data).map((category, tab) => ({ enable: category.enable || 0,
      level: Object.keys(category.data).length, data: Object.values(category.data).map(row => ({ activate: row.activate || 0,
        ...Object.fromEntries(Array.from({ length: 8 }, (_, slot) => ['recharge' + slot, (tab === 0 ? row.cards : row.recharge)[slot] || 0])) })),
    }));
    component.rechargeList({ classNum: 8, classInfos });
  }
  sync();
  const button = (index: number) => root.querySelector<HTMLButtonElement>(`[data-preset="${index}"]`)!;
  const saveButton = () => root.querySelector<HTMLButtonElement>('.preset-save')!;
  const activateButton = () => root.querySelector<HTMLButtonElement>('.preset-activate')!;
  const cardNode = (id: number, selector = '.card') => [...root.querySelectorAll<HTMLElement>(selector)]
    .find(card => card.querySelector('.meta')?.textContent?.startsWith('ID: ' + id))!;
  const cardButton = (id: number, action: string) => root.querySelector<HTMLButtonElement>(`[data-cardid="${id}"][data-card-action="${action}"]`)!;
  const actual = () => component._data.data[0]!.data[1]!.cards.filter(Boolean);
  function ack(state?: number) {
    const packet = sent.mock.calls.at(-1)?.[0]; if (!packet) throw new Error('No pending server request');
    const value = state ?? (packet.id === 2787 ? 1 : packet.id === 2775 ? 1 : 2);
    const card = definition(packet.cardid), row = server.data[0]!.data[1]!;
    setState(server, card, value);
    if (packet.id === 2787 && value < 2) row.cards = row.cards.map(id => id === packet.cardid ? 0 : id);
    else if (value === 2 && !row.cards.includes(packet.cardid)) row.cards[row.cards.indexOf(0)] = packet.cardid;
    const reply = { tab: packet.tab, level: packet.level, cardid: packet.cardid, state: value };
    if (packet.id === 2787) component.cancelUpdate(reply); else component.updateList(reply);
  }
  async function activate(index: number) {
    button(index).click(); activateButton().click(); await flush();
    for (let count = 0; api.isBusy() && count < 20; count++) { ack(); await flush(); }
    expect(api.isBusy()).toBe(false); expect(api.getActivePreset()).toBe(index);
  }
  return { root, sent, saved, preference, component, api, ui, notify, session, definitions, definition,
    server, sync, button, saveButton, activateButton, cardNode, cardButton, actual, ack, activate };
}

describe('editing only the active server-confirmed card preset', () => {
  it('keeps manual activation and preset selection locked between server ACKs and during asynchronous completion saving', async () => {
    const f = serverFixture();
    const activate = vi.spyOn(f.component, 'activateDeckPreset'), select = vi.spyOn(f.component, 'selectDeckPreset');
    let finishSave!: (value: boolean) => void;
    f.saved.mockImplementationOnce(() => new Promise<boolean>(resolve => { finishSave = resolve; }));
    f.button(2).click(); f.activateButton().click();
    const switching = activate.mock.results[0]!.value;
    const assertLocked = () => {
      const requests = f.sent.mock.calls.length;
      expect(f.api.isBusy()).toBe(true); expect(f.activateButton().disabled).toBe(true);
      expect(f.saveButton().disabled).toBe(true);
      expect([...f.root.querySelectorAll<HTMLButtonElement>('[data-preset]')].every(button => button.disabled)).toBe(true);
      f.activateButton().click(); f.button(3).click(); f.saveButton().click();
      // A stale UI reference or synthetic click still meets the same guard.
      f.activateButton().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      f.button(3).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(activate).toHaveBeenCalledExactlyOnceWith(2); expect(select).toHaveBeenCalledExactlyOnceWith(2);
      expect(f.api.getSelected()).toBe(2); expect(f.sent).toHaveBeenCalledTimes(requests); expect(f.notify).not.toHaveBeenCalled();
    };
    assertLocked(); expect(f.sent).toHaveBeenCalledTimes(1);
    f.ack(); await flush(); assertLocked(); expect(f.sent).toHaveBeenCalledTimes(2);
    f.ack(); await flush(); assertLocked(); expect(f.saved).toHaveBeenCalledOnce();
    expect(f.actual()).toEqual([B]);
    finishSave(true); await flush(); expect(await switching).toBe(true);
    expect(f.api.isBusy()).toBe(false); expect(f.button(3).disabled).toBe(false);
    expect(f.notify.mock.calls).toEqual([[true, 2, '副卡册', undefined]]);
    f.button(1).click(); expect(f.activateButton().disabled).toBe(false); f.activateButton().click();
    f.ack(); await flush(); f.ack(); await flush();
    expect(await activate.mock.results[1]!.value).toBe(true); expect(f.actual()).toEqual([A]);
    expect(f.api.getActivePreset()).toBe(1); expect(f.notify.mock.calls.at(-1)?.slice(0, 3)).toEqual([true, 1, '主卡册']);
  });

  it('restores manual activation after a rejected ACK without ever enabling concurrent activation', async () => {
    const f = serverFixture(), activate = vi.spyOn(f.component, 'activateDeckPreset');
    f.button(2).click(); f.activateButton().click();
    f.button(3).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    f.activateButton().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(activate).toHaveBeenCalledOnce(); expect(f.sent).toHaveBeenCalledOnce(); expect(f.api.getSelected()).toBe(2);
    f.ack(2); await flush(); expect(await activate.mock.results[0]!.value).toBe(false);
    expect(f.api.isBusy()).toBe(false); expect(f.activateButton().disabled).toBe(false); expect(f.button(3).disabled).toBe(false);
    expect(f.actual()).toEqual([A]); expect(f.notify.mock.calls[0]?.slice(0, 3)).toEqual([false, 2, '副卡册']);
    f.activateButton().click(); f.ack(); await flush(); f.ack(); await flush();
    expect(await activate.mock.results[1]!.value).toBe(true); expect(f.actual()).toEqual([B]); expect(f.api.isBusy()).toBe(false);
  });

  it.each([0, 5000])('retains the charged list, active label and buttons after a chat-only rejection at %i ms', async delay => {
    const f = serverFixture(); await f.activate(3);
    f.cardButton(C, 'add-deck').click(); f.ack(); await flush();
    expect(f.api.getDraft(3).map(card => card.id)).toEqual([C]);
    const available = f.api.getAvailableCards();
    f.cardButton(A, 'add-deck').click(); await vi.advanceTimersByTimeAsync(delay);
    expect(f.button(3).querySelector('small')?.textContent).toBe('使用中 · 未保存');
    expect(f.root.querySelectorAll('.slot-grid + .sec-h + .card-grid .card')).toHaveLength(available.length);
    expect(f.activateButton().textContent).toBe('已激活');
    expect(f.api.onServerNotice('卡组中已有1张头饰类卡片')).toBe(true); await flush();
    expect(f.api.getActivePreset()).toBe(3); expect(f.api.isBusy()).toBe(false); expect(f.actual()).toEqual([C]);
    expect(f.api.getAvailableCards()).toEqual(available); expect(f.button(3).querySelector('small')?.textContent).toBe('使用中 · 未保存');
    expect(f.saveButton().disabled).toBe(false); expect(f.activateButton().disabled).toBe(true);
    expect(f.cardButton(A, 'add-deck').disabled).toBe(false); expect(f.cardButton(C, 'cancel').disabled).toBe(false);
    await vi.advanceTimersByTimeAsync(10000); expect(f.api.getAvailableCards()).toEqual(available);
    f.saveButton().click(); await flush(); expect(f.api.getPresets()[2]).toEqual([C]); expect(f.api.isVerified(3)).toBe(true);
  });

  it('browses inactive saved cards but prevents adding, removing and saving before activation', async () => {
    const f = serverFixture(); f.button(2).click();
    const before = JSON.stringify(f.component._data);
    expect(f.api.getSelected()).toBe(2); expect(f.api.getActivePreset()).toBe(1);
    expect(f.saveButton().disabled).toBe(true);
    expect(f.cardNode(B, '.slot-grid .card').querySelector<HTMLButtonElement>('button')!.disabled).toBe(true);
    expect(f.cardNode(C).querySelector<HTMLButtonElement>('button')!.textContent).toBe('先激活卡册');
    f.cardNode(C).querySelector<HTMLButtonElement>('button')!.click(); f.saveButton().click();
    expect(f.sent).not.toHaveBeenCalled(); expect(f.saved).not.toHaveBeenCalled();
    expect(JSON.stringify(f.component._data)).toBe(before);
    expect(f.root.querySelector('.deck-rules')?.textContent).toContain('部位及数量限制由服务器判断');
    expect(f.root.querySelector('.deck-rules')?.textContent).not.toContain('盾牌最多1');
    await f.activate(2);
    expect(f.actual()).toEqual([B]); expect(f.api.canEdit(2)).toBe(true);
    expect(f.api.getPresets()).toEqual([[A], [B], null, null]);
  });

  it('waits for each add acknowledgement and keeps card content unchanged until the server accepts it', async () => {
    const f = serverFixture(); await f.activate(1); f.sent.mockClear(); f.saved.mockClear();
    const before = f.api.getDraft(1), actualBefore = f.actual();
    f.cardButton(C, 'add-deck').click();
    expect(f.sent).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ id: 2785, cardid: C, tab: f.definition(C).tab, level: f.definition(C).level }));
    expect(f.api.getDraft(1)).toEqual(before); expect(f.actual()).toEqual(actualBefore);
    expect(f.api.isBusy()).toBe(true); expect(f.saveButton().disabled).toBe(true);
    expect([...f.root.querySelectorAll<HTMLButtonElement>('[data-preset]')].every(button => button.disabled)).toBe(true);
    f.saveButton().click(); f.button(2).click();
    expect(f.saved).not.toHaveBeenCalled(); expect(f.api.getSelected()).toBe(1);
    f.ack(); await flush();
    expect(f.actual().sort()).toEqual([A, C].sort()); expect(f.api.getDraft(1).map(card => card.id).sort()).toEqual([A, C].sort());
    expect(f.api.isDirty(1)).toBe(true); expect(f.api.canSave(1)).toBe(true);
    expect(f.button(1).querySelector('small')!.textContent).toBe('使用中 · 未保存');
    expect(f.activateButton().textContent).toBe('已激活'); expect(f.activateButton().disabled).toBe(true);
    f.saveButton().click(); await flush();
    expect(f.saved).toHaveBeenCalledOnce(); expect(f.api.isVerified(1)).toBe(true);
    expect(f.api.getPresets()[0]?.sort()).toEqual([A, C].sort());
  });

  it('sends same-class cards to the server and retains confirmed content when the server rejects them', async () => {
    const f = serverFixture(); await f.activate(1); f.sent.mockClear(); f.saved.mockClear();
    expect(f.definition(A).tab).toBe(1); expect(f.definition(C).tab).toBe(1);
    const before = f.api.getDraft(1);
    f.cardButton(C, 'add-deck').click(); expect(f.sent).toHaveBeenCalledOnce();
    f.ack(1); await flush();
    expect(f.actual()).toEqual([A]); expect(f.api.getDraft(1)).toEqual(before);
    expect(f.api.getPresets()[0]).toEqual([A]); expect(f.saved).not.toHaveBeenCalled();
    expect(f.root.querySelector('[data-status]')?.textContent).toMatch(/服务器|确认/);
  });

  it('removes a card only after a matching server acknowledgement, then saves the confirmed empty preset', async () => {
    const f = serverFixture(); await f.activate(1); f.sent.mockClear(); f.saved.mockClear();
    f.cardButton(A, 'cancel').click();
    expect(f.sent).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ id: 2787, tab: 0, level: 1, cardid: A }));
    expect(f.actual()).toEqual([A]); expect(f.saveButton().disabled).toBe(true);
    f.ack(); await flush();
    expect(f.actual()).toEqual([]); expect(f.api.getDraft(1)).toEqual([]); expect(f.api.canSave(1)).toBe(true);
    expect(f.saved).not.toHaveBeenCalled(); f.saveButton().click(); await flush();
    expect(f.api.getPresets()[0]).toEqual([]); expect(f.api.isVerified(1)).toBe(true);
  });

  it('activates an unsaved empty slot before it becomes editable and saves only after the server confirms activation', async () => {
    const f = serverFixture(); f.button(3).click();
    expect(f.api.getPresets()[2]).toBeNull(); expect(f.saveButton().disabled).toBe(true); expect(f.activateButton().textContent).toBe('激活');
    f.activateButton().click(); await flush();
    expect(f.actual()).toEqual([A]); expect(f.saveButton().disabled).toBe(true); expect(f.saved).not.toHaveBeenCalled();
    f.ack(); await flush(); expect(f.api.getActivePreset()).toBe(3);
    expect(f.actual()).toEqual([]); expect(f.api.canEdit(3)).toBe(true); expect(f.api.canSave(3)).toBe(true);
    expect(f.api.getPresets()[2]).toBeNull(); expect(f.button(3).querySelector('small')?.textContent).toBe('使用中 · 未保存');
    f.saveButton().click(); await flush();
    expect(f.api.getPresets()[2]).toEqual([]); expect(f.api.isVerified(3)).toBe(true);
  });

  it('preserves original protocol coordinates on category and search cards without letting an inactive preset edit them', async () => {
    const f = serverFixture(); f.button(2).click(); f.component.switchTab(6); f.component._level = 5; f.component.renderCards();
    expect(f.cardNode(D).querySelector<HTMLButtonElement>('button')!.disabled).toBe(true); expect(f.component._tab).toBe(6);
    await f.activate(2); f.component._search = String(D); f.component.renderCards();
    const add = f.cardButton(D, 'add-deck'); expect(add.dataset.tab).toBe('6'); expect(add.dataset.level).toBe('5');
    f.sent.mockClear(); add.click(); expect(f.sent).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ tab: 6, level: 5, cardid: D }));
    f.ack(); await flush(); expect(f.actual().sort()).toEqual([B, D].sort());
  });

  it('does not infer effect activation from saved preset state and follows the native server effect flag', async () => {
    const f = serverFixture(); await f.activate(1);
    const effect = () => f.root.querySelector('.deck-meta .meta-chip')!;
    expect(effect().textContent).toBe('效果状态未激活（服务器）');
    f.component.setActivate({ tab: 0, level: 1, state: 1 });
    expect(effect().textContent).toBe('效果状态已激活（服务器）'); expect(effect().classList.contains('on')).toBe(true);
    f.button(2).click(); expect(effect().textContent).toBe('效果状态未激活');
    expect(f.api.getActivePreset()).toBe(1); f.button(1).click();
    f.component.setActivate({ tab: 0, level: 1, state: 0 });
    expect(effect().textContent).toBe('效果状态未激活（服务器）'); expect(effect().classList.contains('on')).toBe(false);
  });

  it('disables editing and saving when synchronization is invalidated during a pending server operation', async () => {
    const f = serverFixture(); await f.activate(1); f.cardButton(C, 'add-deck').click();
    f.api.invalidate(); f.component.renderCards();
    expect(f.saveButton().disabled).toBe(true); expect(f.api.canEdit(1)).toBe(false);
    expect(f.root.querySelector('.slot-grid')?.textContent).not.toContain('卡册生效');
    f.saveButton().click(); await flush(); expect(f.saved).not.toHaveBeenCalled();
  });
});
