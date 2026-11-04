import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const vendor = readFileSync('vendor/v2/Online.js', 'utf8');
const { JSDOM } = createRequire(import.meta.url)('jsdom') as { JSDOM: new (html: string, options?: { url?: string }) => { window: Window & typeof globalThis } };

function region(name: string) {
  const start = vendor.indexOf(`//#region ${name}`), end = vendor.indexOf('//#endregion', start);
  if (start < 0 || end < 0) throw new Error(`Missing region ${name}`);
  return vendor.slice(start, end);
}
function fn(source: string, name: string) {
  const start = source.indexOf(`\nfunction ${name}(`);
  const end = source.indexOf('\n}\n', start);
  if (start < 0 || end < 0) throw new Error(`Missing function ${name}`);
  return source.slice(start, end + 3);
}
const dom = () => new JSDOM('<!doctype html><body></body>', { url: 'https://lastro.example/' }).window;

describe('item details toggle is per item instance', () => {
  const info = region('src/UI/Components/ItemInfo/ItemInfo.js');
  function fixture() {
    const shown = { uid: -1, _lastroSig: null as string | null, append: vi.fn(), remove: vi.fn(), setItem: vi.fn() };
    shown.setItem.mockImplementation(function (this: typeof shown, item: object) {
      this._lastroSig = (context.lastroItemInfoSignature as (i: object) => string)(item);
    });
    shown.remove.mockImplementation(function (this: typeof shown) { this.uid = -1; this._lastroSig = null; });
    const context = vm.createContext({ ItemInfo_default: shown, ItemInfo: shown });
    const isShowing = info.slice(info.indexOf('ItemInfo.isShowing = function isShowing'), info.indexOf('MOVE_INFO_MESSAGES = ['));
    vm.runInContext(`${fn(info, 'lastroItemInfoSignature')}\n${fn(info, 'lastroToggleItemInfo')}\n${isShowing}`, context);
    return { shown, toggle: context.lastroToggleItemInfo as (item: object) => boolean };
  }
  const blade = (index: number, refine: number) => ({ ITID: 1201, index, RefiningLevel: refine, IsIdentified: true });

  it('opens, then closes on the second right-click of the very same item', () => {
    const { shown, toggle } = fixture();
    toggle(blade(7, 4)); expect(shown.append).toHaveBeenCalledTimes(1); expect(shown.setItem).toHaveBeenCalledTimes(1);
    toggle(blade(7, 4)); expect(shown.remove).toHaveBeenCalledTimes(1);
  });

  it('switches to another copy with the same ITID instead of closing the window', () => {
    const { shown, toggle } = fixture();
    toggle(blade(7, 4));
    toggle(blade(9, 7));
    expect(shown.remove).not.toHaveBeenCalled();
    expect(shown.setItem).toHaveBeenCalledTimes(2);
    expect(shown.setItem.mock.calls[1]![0]).toMatchObject({ index: 9, RefiningLevel: 7 });
  });

  it('ignores missing items', () => {
    const { shown, toggle } = fixture();
    expect(toggle(undefined as never)).toBe(false); expect(shown.append).not.toHaveBeenCalled();
  });

  it('no longer compares only ITID in any window', () => {
    expect(vendor).not.toMatch(/ItemInfo(_default)?\.uid === [\w$.[\]]+\.ITID/);
  });
});

describe('right-click item details in shop and exchange windows', () => {
  const store = region('src/UI/Components/NpcStore/NpcStore.js');
  function row(html: string) {
    const win = dom(); const holder = win.document.createElement('div');
    holder.innerHTML = html; win.document.body.append(holder);
    return { win, item: holder.querySelector('.item') as HTMLElement };
  }
  function handler(types: Record<string, number> = {}) {
    const toggle = vi.fn(), transfer = vi.fn();
    const context = vm.createContext({
      _input: [{ ITID: 501, index: 0 }, { ITID: 502, index: 1 }], _type: 99,
      NpcStore: { Type: { SELL: 4, ...types }, getRoot: () => ({ querySelector: () => ({ contains: () => false }) }) },
      transferSellItemStack: transfer, lastroToggleItemInfo: toggle,
    });
    vm.runInContext(fn(store, 'onItemInfo'), context);
    return { toggle, call: (el: Element, target: Element) => (context.onItemInfo as (this: Element, e: object) => boolean)
      .call(el, { target, which: 3, altKey: false, stopImmediatePropagation() {} }) };
  }

  it('answers a right-click anywhere on the row, not only on the 24px icon', () => {
    const { item } = row('<div class="item" data-index="1"><div class="icon"></div><div class="name">Red Potion</div></div>');
    const h = handler();
    h.call(item, item.querySelector('.name')!);
    expect(h.toggle).toHaveBeenCalledWith({ ITID: 502, index: 1 });
  });

  it('shows the item to hand in when a barter currency icon is clicked', () => {
    const { item } = row('<div class="item" data-index="0"><div class="icon"></div><div class="currency_icon" data-item="7319"></div></div>');
    const h = handler();
    h.call(item, item.querySelector('.currency_icon')!);
    expect(h.toggle).toHaveBeenCalledWith({ ITID: 7319, IsIdentified: true });
  });

  it('reaches the currency slots of expanded barter rows too', () => {
    const { item } = row('<div class="item expanded-barter" data-index="0"><div class="expanded_currency_holder"><div class="icon"></div></div><div class="currency_section"><div class="currency_slot" data-item="6223"><div class="expanded_currency_icon"></div></div></div></div>');
    const h = handler();
    h.call(item, item.querySelector('.expanded_currency_icon')!);
    expect(h.toggle).toHaveBeenCalledWith({ ITID: 6223, IsIdentified: true });
    h.toggle.mockClear(); h.call(item, item.querySelector('.expanded_currency_holder .icon')!);
    expect(h.toggle).toHaveBeenCalledWith({ ITID: 501, index: 0 });
  });

  it('binds the shop windows to the whole item row and covers the selection windows', () => {
    expect(vendor).toMatch(/content\.addEventListener\("contextmenu", \(e\) => \{\s*const itemEl = e\.target\.closest\("\.item"\);\s*if \(itemEl\) \{\s*e\.preventDefault\(\);\s*e\.stopImmediatePropagation\(\);\s*onItemInfo\.call\(itemEl, e\);/);
    expect(vendor).toMatch(/const itemEl = e\.target\.closest\("\.item"\);\s*if \(itemEl\) onItemInfo\$11\.call\(itemEl, e\);/);
    for (const id of ['ItemSelection', 'MakeArrowSelection', 'RefineWeaponSelection', 'MakeItemSelection'])
      expect(vendor).toMatch(new RegExp(`querySelector\\("#${id}"\\)\\s*\\.?addEventListener\\("contextmenu"`));
    expect(region('src/UI/Components/Rodex/ReadRodex.js')).toContain('"contextmenu"');
  });
});

describe('reset window positions', () => {
  function preferences() {
    const win = dom();
    const context = vm.createContext({ localStorage: win.localStorage, __esmMin: (init: () => void) => init, JSON, Object, Array });
    vm.runInContext(`${region('src/Core/Preferences.js')}\ninit_Preferences$1();`, context);
    return { win, Preferences: context.Preferences as {
      get(key: string, def: Record<string, unknown>, version?: number): Record<string, unknown> & { inputWindow: Record<string, number>; _lastroWindow: Record<string, number>; save(): void };
      resetWindowPositions(): number; registry: Record<string, unknown>;
    } };
  }

  it('restores built-in x/y, drops saved left/top and keeps sizes and other settings', () => {
    const { win, Preferences } = preferences();
    const inventory = Preferences.get('Inventory', { x: 20, y: 30, height: 10, tab: 0 }, 1);
    Object.assign(inventory, { x: 9000, y: -400, height: 22, tab: 2, _lastroWindow: { left: 9000, top: -400, width: 300, height: 200 } });
    inventory.save();
    const shop = Preferences.get('NpcStore', { inputWindow: { x: 5, y: 6, height: 7 } }, 1);
    shop.inputWindow.x = 7777;
    shop.save();
    expect(Preferences.resetWindowPositions()).toBeGreaterThanOrEqual(2);
    expect(inventory).toMatchObject({ x: 20, y: 30, height: 22, tab: 2, _lastroWindow: { width: 300, height: 200 } });
    expect(inventory._lastroWindow).not.toHaveProperty('left');
    expect(shop.inputWindow).toMatchObject({ x: 5, y: 6, height: 7 });
    const stored = JSON.parse(win.localStorage.getItem('Inventory')!);
    expect(stored).toMatchObject({ x: 20, y: 30, height: 22, tab: 2 });
    expect(JSON.parse(win.localStorage.getItem('NpcStore')!).inputWindow.x).toBe(5);
  });

  it('also clears saved positions of windows not created in this session, leaving other data alone', () => {
    const { win, Preferences } = preferences();
    win.localStorage.setItem('LaterWindow', JSON.stringify({ _version: 1, x: 8000, y: 9000, _lastroWindow: { left: 1, top: 2, width: 50 }, note: 'keep' }));
    win.localStorage.setItem('NotPreferences', JSON.stringify({ x: 1, y: 2 }));
    win.localStorage.setItem('Broken', '{not json');
    Preferences.resetWindowPositions();
    const later = JSON.parse(win.localStorage.getItem('LaterWindow')!);
    expect(later).toEqual({ _version: 1, _lastroWindow: { width: 50 }, note: 'keep' });
    expect(win.localStorage.getItem('NotPreferences')).toBe(JSON.stringify({ x: 1, y: 2 }));
    expect(win.localStorage.getItem('Broken')).toBe('{not json');
  });

  it('is offered in the graphics settings and moves open windows back', () => {
    const graphics = region('src/UI/Components/GraphicsOption/GraphicsOption.html?raw');
    expect(graphics).toContain('reset-windows-button');
    expect(graphics).toContain('重置窗口位置');
    expect(vendor).toContain('resetWindowsBtn.addEventListener("click", onResetWindowPositions)');
    expect(vendor).toMatch(/resetPosition\(\) \{\s*delete geometry\.left; delete geometry\.top;/);
  });
});

interface QuickTool {
  saveQuickPlace(): void; renderQuickPlaceMenu(): void;
  recordRecentQuickPlace(place: object): void; selectQuickPlace(place: object): void;
}

describe('named quick teleport points', () => {
  const tools = region('src/UI/Components/LastROTools/LastROTools.js');
  const start = tools.indexOf('const LASTRO_QUICK_PLACE_STORAGE_KEY');
  const end = tools.indexOf('LastROTools.loadQuickRoutes = function');
  const body = tools.slice(start, end);
  function fixture() {
    const win = dom();
    const root = win.document.createElement('div');
    root.innerHTML = `<div data-quick-place-menu></div><input data-custom-route-name><input data-custom-route-map><input data-custom-route-x><input data-custom-route-y>`;
    win.document.body.append(root);
    const status: string[] = [];
    const tool = { getRoot: () => root, setStatus: (text: string) => status.push(text) } as unknown as QuickTool;
    const context = vm.createContext({ globalThis: { localStorage: win.localStorage }, LastROTools: tool, Date, Map, Set, JSON, Number, String, Array, Object,
      closeLastROQuickPlacePicker: () => {} });
    vm.runInContext(body, context);
    const fill = (name: string, map: string, x: number, y: number) => {
      (root.querySelector('[data-custom-route-name]') as HTMLInputElement).value = name;
      (root.querySelector('[data-custom-route-map]') as HTMLInputElement).value = map;
      (root.querySelector('[data-custom-route-x]') as HTMLInputElement).value = String(x);
      (root.querySelector('[data-custom-route-y]') as HTMLInputElement).value = String(y);
    };
    const saved = () => JSON.parse(win.localStorage.getItem('LastROToolsQuickPlaces.v1')!).saved as Array<Record<string, unknown>>;
    return { tool, root, status, fill, saved, win, context };
  }

  it('stores the name next to the coordinates', () => {
    const f = fixture();
    f.fill('  练级点   一号 ', 'PRT_FILD05.gat', 271, 210); f.tool.saveQuickPlace();
    expect(f.saved()).toEqual([{ map: 'prt_fild05', x: 271, y: 210, name: '练级点 一号' }]);
    expect(f.status.at(-1)).toContain('练级点 一号');
  });

  it('keeps unnamed points exactly as before', () => {
    const f = fixture();
    f.fill('', 'prontera', 150, 150); f.tool.saveQuickPlace();
    expect(f.saved()).toEqual([{ map: 'prontera', x: 150, y: 150 }]);
  });

  it('renames an existing point instead of refusing it, and reports an identical save as existing', () => {
    const f = fixture();
    f.fill('旧名字', 'prontera', 150, 150); f.tool.saveQuickPlace();
    f.fill('新名字', 'prontera', 150, 150); f.tool.saveQuickPlace();
    expect(f.saved()).toEqual([{ map: 'prontera', x: 150, y: 150, name: '新名字' }]);
    expect(f.status.at(-1)).toContain('已更新快捷点名称');
    f.tool.saveQuickPlace();
    expect(f.status.at(-1)).toContain('已存在');
  });

  it('truncates very long names', () => {
    const f = fixture();
    f.fill('长'.repeat(100), 'prontera', 1, 2); f.tool.saveQuickPlace();
    expect((f.saved()[0]!.name as string).length).toBe(40);
  });

  it('lists the custom name first and shows coordinates underneath, also for recent teleports', () => {
    const f = fixture();
    f.fill('药水商人', 'prontera', 150, 150); f.tool.saveQuickPlace();
    f.tool.recordRecentQuickPlace({ map: 'prontera', x: 150, y: 150 });
    f.tool.recordRecentQuickPlace({ map: 'geffen', x: 120, y: 114 });
    const items = [...f.root.querySelectorAll<HTMLElement>('.quick-place-picker-item')];
    expect(items).toHaveLength(3);
    expect(items[0]!.querySelector('.quick-place-name')!.textContent).toBe('药水商人');
    expect(items[0]!.querySelector('.quick-place-coords')!.textContent).toBe('prontera 150,150');
    expect(items[1]!.textContent).toBe('geffen 120,114'); // newest recent teleport, never named
    expect(items[2]!.querySelector('.quick-place-name')!.textContent).toBe('药水商人'); // recent hit on a named point
  });

  it('fills the name field again when a named point is picked', () => {
    const f = fixture();
    f.fill('药水商人', 'prontera', 150, 150); f.tool.saveQuickPlace();
    f.fill('', '', 0, 0);
    f.tool.selectQuickPlace({ map: 'prontera', x: 150, y: 150 });
    expect((f.root.querySelector('[data-custom-route-name]') as HTMLInputElement).value).toBe('药水商人');
    expect((f.root.querySelector('[data-custom-route-map]') as HTMLInputElement).value).toBe('prontera');
  });

  it('reads old saved data that has no names', () => {
    const f = fixture();
    f.win.localStorage.setItem('LastROToolsQuickPlaces.v1', JSON.stringify({ version: 1, saved: [{ map: 'payon', x: 1, y: 2 }], recent: [] }));
    f.tool.renderQuickPlaceMenu();
    expect(f.root.querySelector('.quick-place-picker-item')!.textContent).toBe('payon 1,2');
  });

  it('has a name field and layout row in the panel', () => {
    expect(vendor).toContain('data-custom-route-name');
    expect(vendor).toContain('"category picker picker picker" "name name name name" "map map x y" "go go save save"');
  });
});

describe('clicks that go through a window never reach the world', () => {
  it('drops mouse-down and mouse-up from STOP windows before the walk logic', () => {
    for (const name of ['onMouseDown', 'onMouseUp']) {
      const source = fn(vendor, name);
      expect(source).toContain('composedPath?.().some((node) => node?.hasAttribute?.("data-lastro-stop"))');
    }
    expect(vendor).toContain('element.setAttribute("data-lastro-stop", "")');
  });

  it('actually returns before touching the entity focus when the path crosses a window', () => {
    const source = fn(vendor, 'onMouseUp');
    const getFocusEntity = vi.fn();
    const context = vm.createContext({ Mouse: { intersect: true }, EntityManager: { getFocusEntity }, Cursor: {}, Camera: {}, KEYS: {}, _rightClickPosition: [0, 0] });
    vm.runInContext(source, context);
    const mouseUp = context.onMouseUp as (this: object, event: object) => void;
    const windowNode = { hasAttribute: (name: string) => name === 'data-lastro-stop' };
    mouseUp.call({}, { which: 1, composedPath: () => [windowNode] });
    expect(getFocusEntity).not.toHaveBeenCalled();
    mouseUp.call({ onRequestStopWalk() {} }, { which: 1, composedPath: () => [{ hasAttribute: () => false }] });
    expect(getFocusEntity).toHaveBeenCalledOnce();
  });
});
