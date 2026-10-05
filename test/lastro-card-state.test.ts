// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installLastroCardState } from '../scripts/lastro-card-state.mjs';
import type { LastroCardStateComponent, LastroCardStateData, LastroCardStateEntry, LastroCardStatePresentation } from '../scripts/lastro-card-state.mjs';
import { setLastROInnerHTML } from '../src/runtime/lastro-trusted-dom.mjs';

const library = readFileSync('vendor/v2/lastro-card-collection.mjs', 'utf8').replace(/^export /gm, '');
const nativeUI = readFileSync('vendor/v2/lastro-card-collection-ui.mjs', 'utf8').replace(/^export /gm, '');
const online = readFileSync('vendor/v2/Online.js', 'utf8');
const nativeInventoryFactory = online.slice(online.indexOf('function createInventory(config) {'), online.indexOf('var init_InventoryCommon'));
type Component = LastroCardStateComponent & { _host: HTMLElement; __active?: boolean; render(): string; init(): void; switchTab(tab: number): void; rechargeList(packet: object): boolean };
type Dependencies = Parameters<typeof installLastroCardState>[1];
type InventoryItem = { ITID: number; type: number; count: number; index: number };
type Inventory = {
  list: InventoryItem[];
  setItems(items: InventoryItem[]): void;
  addItem(item: InventoryItem): void;
  removeItem(index: number, count: number): InventoryItem | null;
  updateItem(index: number, count: number): void;
  onUpdateItem(id: number, count: number): void;
  onRemove(): void;
};
function inventoryFixture(items: InventoryItem[] = []) {
  class GUIComponent {
    _host = document.createElement('div');
    magnet = { TOP: false, BOTTOM: false, LEFT: false, RIGHT: false };
    getRoot() { return this._host; }
  }
  const context = vm.createContext({
    document, GUIComponent, requestAnimationFrame: vi.fn(),
    UIVersionManager: { getInventoryVersion: () => 0 },
    Preferences: { get: (_name: string, defaults: object) => ({ ...defaults, save: vi.fn() }) },
    UIManager: { addComponent: (component: unknown) => component },
    ItemType_default: { CARD: 6, AMMO: 10 },
    EquipmentController: { getUI: () => ({ getNumber: () => 0 }) },
    BasicInfoController: { getUI: () => ({}) },
  });
  vm.runInContext(`${nativeInventoryFactory}\nvar inventory = createInventory({name: 'InventoryV0', htmlText: '', cssText: '', defaultHeight: 3});`, context);
  const inventory = context.inventory as Inventory;
  inventory.setItems(items);
  return inventory;
}
const inventoryCard = (id: number, index = id, count = 1): InventoryItem => ({ ITID: id, index, count, type: 6 });
const inventoryFlush = async () => { await Promise.resolve(); };
function fixture(data?: LastroCardStateData, patched = true, overrides: Partial<Dependencies> = {}) {
  const sent = vi.fn();
  class GUIComponent {
    static MouseMode = { STOP: 1 };
    _host = document.createElement('div');
    _root = document.createElement('div');
    constructor() { this._host.appendChild(this._root); }
    getRoot() { return this._root; }
  }
  const context = vm.createContext({ document, GUIComponent, sent });
  vm.runInContext(`${library}\n${nativeUI}\n
    var deps = {
      GUIComponent,
      Network: { sendPacket: sent },
      PACKET: { CZ: {
        REQUEST_CARDCONNECTION_RECHARGE: class {},
        REQUEST_CARDCONNECTION_ADDMYDECK: class {},
        REQUEST_CARDCONNECTION_CANCEL: class {}
      } },
      DB: { INTERFACE_PATH: '', getItemInfo: id => ({ identifiedDisplayName: '卡片' + id }) },
      Client: { loadFile() {} },
      Configs: { get: () => 5 },
      CARD_CONNECTION_TABS, getCardConnectionData, listCardEntries,
      getCardDeckOverview, getCardLevelCount, buildCardConnectionAction,
      applyCardConnectionUpdate, applyCardConnectionCancelUpdate,
      applyCardConnectionActivateUpdate, applyCardConnectionEnableUpdate
    };
    var component = createCardCollectionComponent(deps);
  `, context);
  const component = context.component as Component;
  const defaultInventory = {
    list: Object.entries((data || dataFixture()).data).filter(([tab]) => tab !== '0')
      .flatMap(([, category]) => Object.values(category.data).flatMap(row => row.cards.map(id => inventoryCard(id)))),
  };
  const deps = {
    document,
    CARD_CONNECTION_TABS: vm.runInContext('CARD_CONNECTION_TABS', context) as Dependencies['CARD_CONNECTION_TABS'],
    listCardEntries: vm.runInContext('listCardEntries', context) as Dependencies['listCardEntries'],
    resolveCategoryCardAction: vm.runInContext('resolveCategoryCardAction', context) as (entry: LastroCardStateEntry) => LastroCardStatePresentation,
    getInventory: () => defaultInventory,
    ...overrides,
  };
  if (patched) expect(installLastroCardState(component, deps)).toBe(true);
  const root = component.getRoot()!;
  setLastROInnerHTML(root, component.render());
  document.body.appendChild(component._host);
  component.init();
  if (data) component._data = data;
  component.renderCards();
  const click = (selector: string) => {
    const button = root.querySelector<HTMLButtonElement>(selector);
    if (!button) throw new Error('Missing native card control: ' + selector);
    button.click(); return button;
  };
  const ids = () => [...root.querySelectorAll<HTMLElement>('[data-cardid]')].map(node => Number(node.dataset.cardid));
  return { component, root, sent, click, ids, deps };
}
function dataFixture(): LastroCardStateData {
  const row = (start: number, states: number[]) => ({
    cards: states.map((_state, index) => start + index), recharge: [...states], activate: 0, effect: '',
  });
  return {
    data: {
      0: { enable: 1, data: { 1: { cards: [4100, 0, 0, 0, 0, 0, 0, 0], recharge: Array(8).fill(0), activate: 1 } } },
      1: { data: {
        1: row(4000, Array(8).fill(1)),
        2: row(4100, [2, 1, 0, 0, 1, 0, 1, 0]),
        3: row(4200, Array(8).fill(0)),
        4: row(4300, [1]),
      } },
      2: { data: { 1: row(5000, [1, 0]) } },
    },
  };
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

describe('native card collection filtering', () => {
  it('reproduces native single-level filtering and shows every charged level with pagination after installation', () => {
    const native = fixture(dataFixture(), false); native.component.switchTab(1);
    native.click('[data-filter="charged"]');
    expect(native.ids()).toEqual([4000, 4001, 4002, 4003, 4004, 4005, 4006, 4007]);
    expect(native.root.querySelector('[data-pages]')!.textContent).toContain('第 1 / 4 页');
    const result = fixture(dataFixture()); result.component.switchTab(1);
    result.click('[data-filter="charged"]');
    expect(result.ids()).toEqual([4000, 4001, 4002, 4003, 4004, 4005, 4006, 4007]);
    expect(result.root.querySelector('[data-pages]')!.textContent).toBe('‹1 / 2›');
    result.click('[data-page-action="next"]');
    // The slotted card is shown with a disabled native action, not a second add.
    expect(result.ids()).toEqual([4101, 4104, 4106, 4300]);
    expect(result.root.querySelector('.card .nm')!.textContent).toBe('卡片4100');
    expect(result.root.querySelector('.card .acts button')!.hasAttribute('disabled')).toBe(true);
    expect(result.ids()).not.toContain(5000);
    expect(result.root.querySelector('[data-pages]')!.textContent).toBe('‹2 / 2›');
  });

  it('sends filtered card actions with their original native category and level', () => {
    const result = fixture(dataFixture()); result.component.switchTab(1);
    result.click('[data-filter="charged"]'); result.click('[data-page-action="next"]');
    result.click('[data-cardid="4300"]');
    expect(result.sent).toHaveBeenLastCalledWith(expect.objectContaining({ id: 2785, tab: 1, level: 4, cardid: 4300 }));
    result.click('[data-filter="can-charge"]');
    expect(result.component._page).toBe(1);
    expect(result.ids()).toEqual([4102, 4103, 4105, 4107, 4200, 4201, 4202, 4203]);
    result.click('[data-page-action="next"]');
    expect(result.ids()).toEqual([4204, 4205, 4206, 4207]);
    result.click('[data-cardid="4207"]');
    expect(result.sent).toHaveBeenLastCalledWith(expect.objectContaining({ id: 2775, tab: 1, level: 3, cardid: 4207 }));
    expect(result.root.querySelector('[data-cardid="4207"]')!.closest('.card')!.querySelector('.meta')!.textContent).toContain('第3页');
  });

  it('keeps native all-page navigation, deck view, and search behaviour', () => {
    const result = fixture(dataFixture()); result.component.switchTab(1);
    result.click('[data-step="1"]');
    expect(result.component._level).toBe(2);
    result.click('[data-filter="charged"]'); result.click('[data-page-action="next"]');
    result.click('[data-filter="all"]');
    expect(result.component._level).toBe(2);
    expect(result.root.querySelector('[data-pages]')!.textContent).toContain('第 2 / 4 页');
    expect(result.ids()).toContain(4102);
    result.component.switchTab(0);
    expect(result.root.querySelector('.slot-grid')).not.toBeNull();
    const search = result.root.querySelector<HTMLInputElement>('[data-search]')!;
    search.value = '5000'; result.click('[data-action="search"]');
    expect(result.ids()).toEqual([5000]);
    expect(result.root.querySelector('[data-view-title]')!.textContent).toBe('搜索结果');
  });

  it('clamps filtered pages after a real server update removes the last match', () => {
    const data = dataFixture(); data.data[1]!.data[2]!.recharge = Array(8).fill(0);
    const result = fixture(data); result.component.switchTab(1);
    result.click('[data-filter="charged"]'); result.click('[data-page-action="next"]');
    expect(result.ids()).toEqual([4300]);
    result.component.updateList({ tab: 1, level: 4, cardid: 4300, state: 0 });
    expect(result.component._page).toBe(1);
    expect(result.root.querySelector('[data-pages]')!.textContent).toBe('‹1 / 1›');
  });

  it('reports an empty category across all levels instead of an empty current level', () => {
    const data = dataFixture();
    for (const row of Object.values(data.data[1]!.data)) row.recharge.fill(0);
    const result = fixture(data); result.component.switchTab(1); result.click('[data-filter="charged"]');
    expect(result.ids()).toEqual([]);
    expect(result.root.querySelector('.empty-box')!.textContent).toBe('本分类没有符合筛选条件的卡片。');
    expect(result.root.querySelector<HTMLButtonElement>('[data-page-action="next"]')!.disabled).toBe(true);
  });
});

describe('native card charging inventory', () => {
  it('shows only positive card stacks by ITID before pagination, preserving server state and action coordinates', () => {
    const data = dataFixture(), before = JSON.stringify(data);
    const inventory = { list: [
      inventoryCard(4102, 1, 0), inventoryCard(4102, 2, 3), inventoryCard(4200),
      inventoryCard(4000), inventoryCard(4100), inventoryCard(5001),
      { ITID: 4103, type: 3, count: 1 }, { cardid: 4105, index: 4105, type: 6, count: 1 },
      { ITID: 4107, type: 6, count: 0 }, { ITID: 4201, type: 6, count: -1 },
      { ITID: 4202, type: 6, count: Number.NaN }, { ITID: 4203, type: 6, count: Number.POSITIVE_INFINITY },
      { ITID: 4204, type: 6 }, { ITID: 4205, count: 1 },
      { ITID: 4206.5, type: 6, count: 1 }, { ITID: -1, type: 6, count: 1 },
      { ITID: Number.MAX_SAFE_INTEGER + 1, type: 6, count: 1 },
    ] };
    const result = fixture(data, true, { getInventory: () => inventory });
    result.component.switchTab(1); result.click('[data-filter="can-charge"]');
    expect(result.ids()).toEqual([4102, 4200]);
    expect(result.root.querySelector('.lvl')!.textContent).toBe('可充能 · 2 张');
    expect(result.root.querySelector('[data-pages]')!.textContent).toBe('‹1 / 1›');
    result.click('[data-cardid="4200"]');
    expect(result.sent).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ id: 2775, tab: 1, level: 3, cardid: 4200 }));
    expect(JSON.stringify(data)).toBe(before);
  });

  it.each([null, undefined, {}, { list: [] }])('hides unowned charging cards when inventory is not ready: %#', inventory => {
    const result = fixture(dataFixture(), true, { getInventory: () => inventory });
    result.component.switchTab(1); result.click('[data-filter="can-charge"]');
    expect(result.ids()).toEqual([]);
    expect(result.root.querySelector('.lvl')!.textContent).toBe('可充能 · 0 张');
    expect(result.root.querySelector('[data-pages]')!.textContent).toBe('‹1 / 1›');
    expect(result.sent).not.toHaveBeenCalled();
  });

  it('does not infer ownership when the inventory dependency is omitted', () => {
    const result = fixture(dataFixture(), true, { getInventory: undefined });
    result.component.switchTab(1); result.click('[data-filter="can-charge"]');
    expect(result.ids()).toEqual([]);
    result.click('[data-filter="charged"]');
    expect(result.ids()).toEqual([4000, 4001, 4002, 4003, 4004, 4005, 4006, 4007]);
    result.click('[data-filter="all"]');
    expect(result.ids()).toEqual([4000, 4001, 4002, 4003, 4004, 4005, 4006, 4007]);
    result.click('[data-step="1"]'); expect(result.ids()).toContain(4102);
    const search = result.root.querySelector<HTMLInputElement>('[data-search]')!;
    search.value = '4200'; result.click('[data-action="search"]');
    expect(result.ids()).toEqual([4200]);
  });

  it('refreshes after native add, count update, replacement and removal without relying on shortcut callbacks', async () => {
    const inventory = inventoryFixture();
    const result = fixture(dataFixture(), true, { getInventory: () => inventory });
    result.component.switchTab(1); result.click('[data-filter="can-charge"]');
    const shortcut = vi.fn(); inventory.onUpdateItem = shortcut;
    const body = result.root.querySelector<HTMLElement>('[data-body]')!; body.scrollTop = 72;
    const render = vi.spyOn(result.component, 'renderCards');
    expect(inventory.addItem(inventoryCard(4102, 1))).toBeUndefined();
    await inventoryFlush();
    expect(result.ids()).toEqual([4102]); expect(body.scrollTop).toBe(72);
    expect(shortcut).toHaveBeenLastCalledWith(4102, 1);
    expect(inventory.updateItem(1, 0)).toBeUndefined(); await inventoryFlush();
    expect(result.ids()).toEqual([]); expect(shortcut).toHaveBeenLastCalledWith(4102, 0);
    inventory.setItems([inventoryCard(4200, 2)]); await inventoryFlush();
    expect(result.ids()).toEqual([4200]);
    render.mockClear();
    // Native replacement internally removes the old index before inserting the new one.
    inventory.setItems([inventoryCard(4103, 2)]); await inventoryFlush();
    expect(result.ids()).toEqual([4103]); expect(render).toHaveBeenCalledTimes(1);
    const removed = inventory.removeItem(2, 1);
    expect(removed?.ITID).toBe(4103); expect(removed?.count).toBe(0);
    await inventoryFlush(); expect(result.ids()).toEqual([]);
    expect(result.sent).not.toHaveBeenCalled();
  });

  it('counts only held entries and clamps the last page after native inventory consumption', async () => {
    const inventory = inventoryFixture([4102, 4103, 4105, 4107, 4200, 4201, 4202, 4203, 4204].map(id => inventoryCard(id)));
    const result = fixture(dataFixture(), true, { getInventory: () => inventory });
    result.component.switchTab(1); result.click('[data-filter="can-charge"]');
    expect(result.root.querySelector('.lvl')!.textContent).toBe('可充能 · 9 张');
    result.click('[data-page-action="next"]'); expect(result.ids()).toEqual([4204]);
    inventory.removeItem(4204, 1); await inventoryFlush();
    expect(result.component._page).toBe(1);
    expect(result.ids()).toEqual([4102, 4103, 4105, 4107, 4200, 4201, 4202, 4203]);
    expect(result.root.querySelector('[data-pages]')!.textContent).toBe('‹1 / 1›');
    expect(result.root.querySelector('.lvl')!.textContent).toBe('可充能 · 8 张');
  });

  it('isolates an asynchronous card render failure and keeps later refreshes and native return/throw behaviour', async () => {
    const inventory = inventoryFixture();
    const result = fixture(dataFixture(), true, { getInventory: () => inventory });
    result.component.switchTab(1); result.click('[data-filter="can-charge"]');
    const render = vi.spyOn(result.component, 'renderCards').mockImplementationOnce(() => { throw new Error('card render failed'); });
    // A card rendering error must not become a native inventory method failure or
    // an unhandled Promise rejection reported by Vitest after the test ends.
    expect(inventory.addItem(inventoryCard(4102))).toBeUndefined();
    await inventoryFlush(); expect(render).toHaveBeenCalledTimes(1);
    expect(inventory.list.map(item => item.ITID)).toEqual([4102]);
    expect(result.ids()).toEqual([]);
    inventory.addItem(inventoryCard(4200)); await inventoryFlush();
    expect(render).toHaveBeenCalledTimes(2); expect(result.ids()).toEqual([4102, 4200]);
    const nativeFailure = new Error('native shortcut callback failed');
    inventory.onUpdateItem = () => { throw nativeFailure; };
    expect(() => inventory.removeItem(4102, 1)).toThrow(nativeFailure);
    await inventoryFlush(); expect(result.ids()).toEqual([4200]);
    expect(result.sent).not.toHaveBeenCalled();
  });

  it.each(['ack-first', 'consume-first'])('uses the same authoritative result for charge ACK and inventory consumption order: %s', async order => {
    const inventory = inventoryFixture([inventoryCard(4200)]);
    const result = fixture(dataFixture(), true, { getInventory: () => inventory });
    result.component.switchTab(1); result.click('[data-filter="can-charge"]');
    expect(result.ids()).toEqual([4200]);
    const acknowledge = () => result.component.updateList({ tab: 1, level: 3, cardid: 4200, state: 1 });
    if (order === 'ack-first') {
      acknowledge(); expect(result.ids()).toEqual([]);
      inventory.removeItem(4200, 1); await inventoryFlush();
    } else {
      inventory.removeItem(4200, 1); await inventoryFlush(); expect(result.ids()).toEqual([]);
      expect(result.component._data!.data[1]!.data[3]!.recharge[0]).toBe(0);
      acknowledge();
    }
    expect(result.ids()).toEqual([]);
    expect(result.component._data!.data[1]!.data[3]!.recharge[0]).toBe(1);
    result.click('[data-filter="charged"]'); result.click('[data-page-action="next"]');
    expect(result.ids()).toContain(4200);
    expect(result.sent).not.toHaveBeenCalled();
  });

  it('observes a newly selected native inventory version once without mixing old inventory contents', async () => {
    const previous = inventoryFixture([inventoryCard(4102)]), next = inventoryFixture([inventoryCard(4200)]);
    let inventory: Inventory | null = previous;
    const result = fixture(dataFixture(), true, { getInventory: () => inventory });
    result.component.switchTab(1); result.click('[data-filter="can-charge"]');
    expect(result.ids()).toEqual([4102]);
    inventory = next; result.component.renderCards();
    expect(result.ids()).toEqual([4200]);
    const wrapped = next.addItem; result.component.renderCards(); expect(next.addItem).toBe(wrapped);
    const render = vi.spyOn(result.component, 'renderCards');
    previous.addItem(inventoryCard(4103)); await inventoryFlush();
    expect(result.ids()).toEqual([4200]); render.mockClear();
    next.addItem(inventoryCard(4103)); await inventoryFlush();
    expect(result.ids()).toEqual([4103, 4200]); expect(render).toHaveBeenCalledTimes(1);
    next.onRemove(); await inventoryFlush(); expect(result.ids()).toEqual([]);
    inventory = null; result.component.renderCards(); expect(result.ids()).toEqual([]);
    expect(result.sent).not.toHaveBeenCalled();
  });

  it('refreshes only visible active charging pages and reads latest inventory when browsing resumes', async () => {
    const inventory = inventoryFixture();
    const result = fixture(dataFixture(), true, { getInventory: () => inventory });
    result.component.switchTab(1); result.click('[data-filter="can-charge"]');
    const render = vi.spyOn(result.component, 'renderCards');
    result.component._host.style.display = 'none'; inventory.addItem(inventoryCard(4102)); await inventoryFlush();
    expect(render).not.toHaveBeenCalled();
    result.component._host.style.display = ''; result.component.__active = false;
    inventory.addItem(inventoryCard(4103)); await inventoryFlush(); expect(render).not.toHaveBeenCalled();
    result.component.__active = true; result.component.renderCards(); expect(result.ids()).toEqual([4102, 4103]);
    result.component._host.remove(); render.mockClear();
    inventory.addItem(inventoryCard(4105)); await inventoryFlush(); expect(render).not.toHaveBeenCalled();
    document.body.appendChild(result.component._host); result.component.renderCards();
    expect(result.ids()).toEqual([4102, 4103, 4105]);
    result.click('[data-filter="all"]'); render.mockClear();
    inventory.addItem(inventoryCard(4107)); await inventoryFlush(); expect(render).not.toHaveBeenCalled();
    result.click('[data-filter="can-charge"]');
    const search = result.root.querySelector<HTMLInputElement>('[data-search]')!;
    search.value = '4200'; result.click('[data-action="search"]'); render.mockClear();
    inventory.addItem(inventoryCard(4200)); await inventoryFlush(); expect(render).not.toHaveBeenCalled();
    expect(result.ids()).toEqual([4200]);
  });
});

describe('native server-confirmed card state', () => {
  it('reproduces duplicate native add acknowledgements and fixes them without predicting unsent actions', () => {
    const before = fixture(dataFixture(), false);
    before.component.updateList({ tab: 1, level: 2, cardid: 4100, state: 2 });
    expect(before.component._data!.data[0]!.data[1]!.cards.slice(0, 2)).toEqual([4100, 4100]);
    const result = fixture(dataFixture());
    const slots = result.component._data!.data[0]!.data[1]!.cards;
    result.component.updateList({ tab: 1, level: 2, cardid: 4100, state: 2 });
    result.component.updateList({ tab: 1, level: 2, cardid: 4100, state: 2 });
    expect(slots).toEqual([4100, 0, 0, 0, 0, 0, 0, 0]);
    result.component.updateList({ tab: 1, level: 1, cardid: 4000, state: 1 });
    expect(slots).not.toContain(4000);
    result.component.updateList({ tab: 1, level: 1, cardid: 4000, state: 2 });
    expect(slots.filter(id => id === 4000)).toHaveLength(1);
    expect(result.sent).not.toHaveBeenCalled();
  });

  it('repairs existing duplicate slots and handles tab-0 cancel replies through the original definition', () => {
    const result = fixture(dataFixture());
    const slots = result.component._data!.data[0]!.data[1]!.cards;
    slots[3] = 4100;
    result.component.updateList({ tab: 1, level: 2, cardid: 4100, state: 2 });
    expect(slots.filter(id => id === 4100)).toHaveLength(1);
    slots[6] = 4100;
    expect(result.component.cancelUpdate({ tab: 0, level: 1, cardid: 4100, state: 1 })).toBe(true);
    expect(slots).not.toContain(4100);
    expect(result.component._data!.data[1]!.data[2]!.recharge[0]).toBe(1);
    expect(result.root.querySelector('.slot-grid')!.textContent).not.toContain('卡片4100');
    expect([...result.root.querySelectorAll('.card-grid .nm')].map(node => node.textContent)).toContain('卡片4100');
  });

  it('also accepts explicit original-category cancellation and leaves confirmed state-2 membership intact', () => {
    const result = fixture(dataFixture());
    const row = result.component._data!.data[1]!.data[2]!;
    const slots = result.component._data!.data[0]!.data[1]!.cards;
    expect(result.component.cancelUpdate({ tab: 1, level: 2, cardid: 4100, state: 2 })).toBe(true);
    expect(slots).toContain(4100); expect(row.recharge[0]).toBe(2);
    expect(result.component.cancelUpdate({ tab: 1, level: 2, cardid: 4100, state: 0 })).toBe(true);
    expect(slots).not.toContain(4100); expect(row.recharge[0]).toBe(0);
  });

  it('uses the unique confirmed in-deck definition of a duplicated card ID', () => {
    const data = dataFixture();
    data.data[2]!.data[1]!.cards[0] = 4100; data.data[2]!.data[1]!.recharge[0] = 0;
    const result = fixture(data);
    result.component.cancelUpdate({ tab: 0, level: 1, cardid: 4100, state: 1 });
    expect(data.data[1]!.data[2]!.recharge[0]).toBe(1);
    expect(data.data[2]!.data[1]!.recharge[0]).toBe(0);
  });

  it('clears acknowledged deck membership without inventing a category when definitions are ambiguous', () => {
    const data = dataFixture();
    data.data[2]!.data[1]!.cards[0] = 4100; data.data[2]!.data[1]!.recharge[0] = 2;
    const result = fixture(data);
    expect(result.component.cancelUpdate({ tab: 0, level: 1, cardid: 4100, state: 1 })).toBe(true);
    expect(data.data[0]!.data[1]!.cards).not.toContain(4100);
    expect(data.data[1]!.data[2]!.recharge[0]).toBe(2);
    expect(data.data[2]!.data[1]!.recharge[0]).toBe(2);
  });

  it('supports repeated cancel acknowledgements and cards unknown to the static category table', () => {
    const result = fixture(dataFixture());
    expect(result.component.cancelUpdate({ tab: 0, level: 1, cardid: 4100, state: 1 })).toBe(true);
    expect(result.component.cancelUpdate({ tab: 0, level: 1, cardid: 4100, state: 1 })).toBe(true);
    const slots = result.component._data!.data[0]!.data[1]!.cards;
    slots[0] = 99999;
    expect(result.component.cancelUpdate({ tab: 0, level: 1, cardid: 99999, state: 1 })).toBe(true);
    expect(slots).not.toContain(99999);
  });

  it.each([
    { tab: 1, level: 2, cardid: 4100, state: 3 },
    { tab: 1, level: 2, cardid: 4100, state: -1 },
    { tab: 1, level: 2, cardid: 4100, state: null },
    { tab: 1, level: 2, cardid: 4100, state: '' },
    { tab: 1, level: 2, cardid: 4100, state: true },
    { tab: 1, level: 2, cardid: 4100 },
    { tab: 8, level: 2, cardid: 4100, state: 1 },
    { tab: 0, level: 2, cardid: 4100, state: 1 },
    { tab: 1, level: 2, cardid: 0, state: 1 },
    { tab: 1, level: 2, cardid: 0x100000000, state: 1 },
  ])('rejects malformed or unconfirmed state packets %#', packet => {
    const result = fixture(dataFixture()); const before = JSON.stringify(result.component._data);
    expect(result.component.updateList(packet)).toBe(false);
    expect(result.component.cancelUpdate(packet)).toBe(false);
    expect(JSON.stringify(result.component._data)).toBe(before);
  });

  it('installs once and preserves the existing component and data object', () => {
    const result = fixture(dataFixture());
    const data = result.component._data, render = result.component.renderCards;
    expect(installLastroCardState(result.component, result.deps)).toBe(false);
    expect(result.component._data).toBe(data); expect(result.component.renderCards).toBe(render);
  });
});
