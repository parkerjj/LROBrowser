// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installLastroCardArt } from '../scripts/lastro-card-art.mjs';

const native = readFileSync('vendor/v2/Online.js', 'utf8');
function region(path: string) {
  const start = native.indexOf('//#region ' + path);
  const end = native.indexOf('//#endregion', start);
  if (start < 0 || end < start) throw new Error('Missing native card detail fixture: ' + path);
  return native.slice(start, end);
}
const guiSource = region('src/UI/GUIComponent.js');
const guiFile = ts.createSourceFile('gui.js', guiSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
let guiClass = '';
function findGUI(node: ts.Node) {
  if (ts.isBinaryExpression(node) && node.left.getText(guiFile) === 'GUIComponent' && ts.isClassExpression(node.right)) {
    if (guiClass) throw new Error('Ambiguous native GUI class');
    guiClass = node.right.getText(guiFile);
  }
  ts.forEachChild(node, findGUI);
}
findGUI(guiFile);
if (!guiClass) throw new Error('Missing native GUI class');
const detailsSource = ['CardIllustration', 'ItemInfo'].map(name => ['html?raw', 'css?raw', 'js']
  .map(extension => region(`src/UI/Components/${name}/${name}.${extension}`)).join('\n')).join('\n');

interface Panel {
  name: string;
  _host: HTMLElement;
  prepare(): void;
  append(): void;
  remove(): void;
  focus(): void;
  getRoot(): ShadowRoot;
}
interface CardPanel extends Panel {
  _lastroCardArtInstalled?: boolean;
  _data: { data: Record<number, { data: Record<number, { cards: number[]; recharge: number[] }> }> };
  switchTab(tab: number): void;
  renderCards(): void;
  renderDeck(): HTMLElement | DocumentFragment;
  loadCardArt(element: HTMLElement, id: number): void;
  createCardNode(entry: { id: number; name: string }): HTMLElement;
}
interface InfoPanel extends Panel { uid: number; setItem(item: object): void; }
interface ArtLoad { path: string; success(url: unknown): void; failure(): void; }

function loadModule(source: string, context: vm.Context) {
  const exports: Record<string, unknown> = {};
  const code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  context.exports = exports;
  vm.runInContext('(function (exports) {\n' + code + '\n})(exports);', context);
  return exports;
}

function fixture(mode: 'sync' | 'async' = 'sync', patched = true) {
  const artLoads: ArtLoad[] = [];
  const Client = { loadFile: vi.fn((path: string, success: (url: unknown) => void, failure?: () => void) => {
    if (path.includes('/cardbmp/')) {
      artLoads.push({ path, success, failure: failure || (() => {}) });
      if (mode === 'sync') success('data:image/bmp;base64,AA==');
    } else success('data:image/bmp;base64,AQ==');
  }) };
  const DB = {
    INTERFACE_PATH: 'data/texture/ui/',
    getItemInfo: (id: number) => ({ identifiedDisplayName: '测试卡 ' + id,
      illustResourcesName: 'card-' + id, identifiedResourceName: 'card-' + id }),
    getItemName: (item: { ITID: number }) => '测试卡 ' + item.ITID,
    getMessage: (id: number) => String(id),
    getPreferredItemResourceName: () => 'card',
    getPreferredItemDescription: () => '原版卡片说明',
    formatItemDescription: (value: string) => value,
  };
  const components: Record<string, Panel> = {};
  const UIManager = { components, addComponent: (component: Panel & { manager: unknown }) => {
    component.manager = UIManager; components[component.name] = component; return component;
  } };
  const initStubs = Object.fromEntries([...detailsSource.matchAll(/\b(init_[\w$]+)\(\);/g)]
    .map(match => [match[1]!, () => {}]));
  const context = vm.createContext({
    ...initStubs, document, window, HTMLElement, Event, CustomEvent, MutationObserver,
    setTimeout, clearTimeout, console, UIManager, Client, DB,
    __esmMin: (init: () => void) => { let done = false; return () => { if (!done) { done = true; init(); } }; },
    __exportAll: (value: unknown) => value,
    _ensureDeps: () => Promise.resolve(), _Client: Client, _DB: DB, _EntityManager: null, _ScrollBar: null,
    _Renderer: { width: 1200, height: 900 }, _Cursor: null,
    Common_default$1: '', MouseMode: { CROSS: 0, STOP: 1, FREEZE: 2 }, CSS_NUMBER: { zIndex: true },
    Mouse: { intersect: true, screen: { x: 0, y: 0 } }, SessionStorage_default: {},
    UI_default: { windowmagnet: false }, _snapCache: [], UIClamp: vi.fn(),
    KEYS: { ESCAPE: 27 }, Cursor: { setType: vi.fn(), ACTION: { DEFAULT: 0 } },
    Renderer: { stop: vi.fn() }, ItemType_default: { CARD: 6 }, EquipmentLocation_default: {},
    ItemCompare_default: {}, ItemPreview_default: {},
    Network: { hookPacket: vi.fn() }, PACKET: { ZC: { CHANGE_ITEM_OPTION: class {} } },
  });
  vm.runInContext('var GUIComponent = ' + guiClass + ';\n' + detailsSource + '\ninit_ItemInfo();', context);
  const data = loadModule(readFileSync('vendor/v2/lastro-card-collection.mjs', 'utf8'), context);
  const ui = loadModule(readFileSync('vendor/v2/lastro-card-collection-ui.mjs', 'utf8'), context);
  const create = ui.createCardCollectionComponent as (deps: object) => CardPanel;
  const component = create({ ...data, GUIComponent: context.GUIComponent, Client, DB,
    Network: { sendPacket: vi.fn() }, PACKET: {}, Configs: { get: () => 5 } });
  UIManager.addComponent(component as CardPanel & { manager: unknown });
  const info = components.ItemInfo as InfoPanel;
  const illustration = components.CardIllustration!;
  if (patched) installLastroCardArt(component, { Client, DB, UIManager, getItemInfo: () => info, document });
  component.append();
  return { component, info, illustration, Client, DB, artLoads, UIManager };
}

function renderArtworkGrid(component: CardPanel, ids: number[]) {
  let grid: HTMLDivElement | null = null;
  component.renderDeck = () => {
    grid = document.createElement('div');
    grid.className = 'card-grid';
    for (const id of ids) grid.append(component.createCardNode({ id, name: '测试卡 ' + id }));
    return grid;
  };
  component.renderCards();
  return grid!;
}

async function flushArtwork() {
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('native card artwork and detail integration', () => {
  it('reproduces synchronous cached art loss and fixes it in every rebuilt card view', () => {
    const before = fixture('sync', false);
    before.component.switchTab(1);
    expect(before.component.getRoot().querySelectorAll('.is-art')).toHaveLength(0);
    before.component.remove();
    const { component, artLoads } = fixture();
    for (const tab of [1, 2, 1]) {
      component.switchTab(tab);
      expect(component.getRoot().querySelectorAll('.card')).toHaveLength(8);
      expect(component.getRoot().querySelectorAll('.is-art')).toHaveLength(8);
    }
    expect(artLoads).toHaveLength(16);
    component.remove(); component.append(); component.switchTab(1);
    expect(component.getRoot().querySelectorAll('.is-art')).toHaveLength(8);
    expect(artLoads).toHaveLength(16);
  });

  it('coalesces asynchronous loads across rerenders and never paints a reused node with an old card', () => {
    const { component, artLoads } = fixture('async');
    component.switchTab(1); component.renderCards(); component.renderCards();
    expect(artLoads).toHaveLength(8);
    for (const load of artLoads) load.success('data:image/bmp;base64,AA==');
    expect(component.getRoot().querySelectorAll('.is-art')).toHaveLength(8);
    const art = document.createElement('div');
    component.loadCardArt(art, 700001); component.loadCardArt(art, 700002);
    artLoads.at(-2)!.success('data:image/bmp;base64,Aw==');
    expect(art.classList.contains('is-art')).toBe(false);
    artLoads.at(-1)!.success('data:image/bmp;base64,Ag==');
    expect(art.style.backgroundImage).toContain('Ag==');
  });

  it('automatically fills every cold artwork beyond the concurrent request limit without another render', async () => {
    const { component, artLoads } = fixture('async');
    const ids = Array.from({ length: 130 }, (_, index) => 700000 + index);
    const grid = renderArtworkGrid(component, ids);
    await flushArtwork();
    expect(artLoads).toHaveLength(64);
    let completed = 0;
    while (completed < ids.length) {
      expect(artLoads.length - completed).toBeLessThanOrEqual(64);
      const load = artLoads[completed];
      expect(load, 'waiting cards must be started when an active request completes').toBeDefined();
      load!.success('data:image/bmp;base64,AA==');
      completed++;
      await flushArtwork();
    }
    expect(artLoads).toHaveLength(ids.length);
    expect(new Set(artLoads.map(load => load.path)).size).toBe(ids.length);
    expect(grid.querySelectorAll('.is-art')).toHaveLength(ids.length);
  });

  it('coalesces a queued resource and paints all its current subscribers after a slot is freed', async () => {
    const { component, artLoads } = fixture('async');
    const ids = [...Array.from({ length: 64 }, (_, index) => 710000 + index), ...Array<number>(80).fill(710064)];
    const grid = renderArtworkGrid(component, ids);
    await flushArtwork();
    expect(artLoads).toHaveLength(64);
    artLoads[0]!.success('data:image/bmp;base64,AA==');
    await flushArtwork();
    expect(artLoads).toHaveLength(65);
    expect(artLoads[64]!.path).toContain('card-710064.bmp');
    artLoads[64]!.success('data:image/bmp;base64,AQ==');
    await flushArtwork();
    expect(grid.querySelectorAll('.is-art')).toHaveLength(81);
    expect(artLoads.filter(load => load.path.includes('card-710064.bmp'))).toHaveLength(1);
    for (const load of artLoads.slice(1, 64)) load.success('data:image/bmp;base64,AA==');
    await flushArtwork();
    expect(grid.querySelectorAll('.is-art')).toHaveLength(ids.length);
  });

  it('drains queued resources after a failure, an empty result, or a loader exception without retrying the failed image', async () => {
    const { component, artLoads, Client } = fixture('async');
    const original = Client.loadFile.getMockImplementation()!;
    Client.loadFile.mockImplementation((path, success, failure) => {
      if (path.includes('card-720064.bmp')) throw new Error('Unavailable image');
      original(path, success, failure);
    });
    const grid = renderArtworkGrid(component, Array.from({ length: 68 }, (_, index) => 720000 + index));
    await flushArtwork();
    expect(artLoads).toHaveLength(64);
    artLoads[0]!.failure();
    await flushArtwork();
    expect(artLoads).toHaveLength(65);
    expect(artLoads[64]!.path).toContain('card-720065.bmp');
    artLoads[1]!.success(null);
    await flushArtwork();
    expect(artLoads).toHaveLength(66);
    artLoads[2]!.success('data:image/bmp;base64,AA==');
    await flushArtwork();
    expect(artLoads).toHaveLength(67);
    for (const load of artLoads.slice(3)) load.success('data:image/bmp;base64,AA==');
    await flushArtwork();
    expect(grid.querySelectorAll('.is-art')).toHaveLength(65);
    expect(Client.loadFile.mock.calls.filter(([path]) => path.includes('card-720064.bmp'))).toHaveLength(1);
    expect(artLoads.filter(load => load.path.includes('card-720000.bmp'))).toHaveLength(1);
  });

  it('drops obsolete queued targets across rerenders and only paints the current card view', async () => {
    const { component, artLoads } = fixture('async');
    const ids = Array.from({ length: 100 }, (_, index) => 730000 + index);
    const oldGrid = renderArtworkGrid(component, ids);
    const grid = renderArtworkGrid(component, ids);
    await flushArtwork();
    expect(artLoads).toHaveLength(64);
    for (let index = 0; index < ids.length; index++) {
      expect(artLoads[index]).toBeDefined();
      artLoads[index]!.success('data:image/bmp;base64,AA==');
      await flushArtwork();
    }
    expect(artLoads).toHaveLength(ids.length);
    expect(grid.querySelectorAll('.is-art')).toHaveLength(ids.length);
    expect(oldGrid.isConnected).toBe(false);
    expect(oldGrid.querySelectorAll('.is-art')).toHaveLength(0);
  });

  it('does not start obsolete queued artwork when a card node is reused for a different resource', async () => {
    const { component, artLoads } = fixture('async');
    const grid = renderArtworkGrid(component, Array.from({ length: 64 }, (_, index) => 740000 + index));
    const art = document.createElement('div');
    grid.append(art);
    component.loadCardArt(art, 740064);
    component.loadCardArt(art, 740065);
    await flushArtwork();
    expect(artLoads).toHaveLength(64);
    artLoads[0]!.success('data:image/bmp;base64,AA==');
    await flushArtwork();
    expect(artLoads).toHaveLength(65);
    expect(artLoads[64]!.path).toContain('card-740065.bmp');
    artLoads[64]!.success('data:image/bmp;base64,AQ==');
    await flushArtwork();
    expect(art.style.backgroundImage).toContain('AQ==');
    expect(artLoads.some(load => load.path.includes('card-740064.bmp'))).toBe(false);
  });

  it('clears unneeded queued artwork on native close and fills it after reopening while reusing successful images', async () => {
    const { component, artLoads } = fixture('async');
    const ids = Array.from({ length: 100 }, (_, index) => 750000 + index);
    renderArtworkGrid(component, ids);
    await flushArtwork();
    expect(artLoads).toHaveLength(64);
    component.getRoot().querySelector<HTMLButtonElement>('[data-action="close"]')!.click();
    expect(component._host.isConnected).toBe(false);
    for (const load of artLoads.slice()) load.success('data:image/bmp;base64,AA==');
    await flushArtwork();
    expect(artLoads).toHaveLength(64);
    component.append();
    const grid = renderArtworkGrid(component, ids);
    await flushArtwork();
    expect(grid.querySelectorAll('.is-art')).toHaveLength(64);
    expect(artLoads).toHaveLength(100);
    for (const load of artLoads.slice(64)) load.success('data:image/bmp;base64,AQ==');
    await flushArtwork();
    expect(grid.querySelectorAll('.is-art')).toHaveLength(ids.length);
    expect(new Set(artLoads.map(load => load.path)).size).toBe(ids.length);
  });

  it('joins still-running requests after reopening and applies their results only to the new view', async () => {
    const { component, artLoads } = fixture('async');
    const ids = Array.from({ length: 100 }, (_, index) => 760000 + index);
    const oldGrid = renderArtworkGrid(component, ids);
    component.remove();
    component.append();
    const grid = renderArtworkGrid(component, ids);
    await flushArtwork();
    expect(artLoads).toHaveLength(64);
    for (let index = 0; index < ids.length; index++) {
      expect(artLoads[index]).toBeDefined();
      artLoads[index]!.success('data:image/bmp;base64,AA==');
      await flushArtwork();
    }
    expect(grid.querySelectorAll('.is-art')).toHaveLength(ids.length);
    expect(oldGrid.querySelectorAll('.is-art')).toHaveLength(0);
    expect(artLoads).toHaveLength(ids.length);
  });

  it('drains a large synchronous batch and paints cache hits during the next native render', () => {
    const { component, artLoads } = fixture('sync');
    const ids = Array.from({ length: 130 }, (_, index) => 770000 + index);
    const first = renderArtworkGrid(component, ids);
    expect(first.querySelectorAll('.is-art')).toHaveLength(ids.length);
    expect(artLoads).toHaveLength(ids.length);
    const second = renderArtworkGrid(component, ids);
    expect(second.querySelectorAll('.is-art')).toHaveLength(ids.length);
    expect(artLoads).toHaveLength(ids.length);
  });

  it('retries unavailable art only on a subsequent render and bounds cached and stalled resources', () => {
    vi.useFakeTimers();
    const { component, artLoads } = fixture('async');
    const art = document.createElement('div');
    component.loadCardArt(art, 700000);
    artLoads[0]!.failure();
    expect(artLoads).toHaveLength(1);
    component.loadCardArt(art, 700000);
    expect(artLoads).toHaveLength(2);
    artLoads[1]!.success(null);
    for (let id = 700001; id <= 700064; id++) component.loadCardArt(document.createElement('div'), id);
    expect(artLoads).toHaveLength(66);
    vi.advanceTimersByTime(30000);
    component.loadCardArt(art, 700000);
    expect(artLoads).toHaveLength(67);
    artLoads.at(-1)!.success('data:image/bmp;base64,AA==');
    for (let id = 700101; id <= 700356; id++) {
      component.loadCardArt(art, id);
      artLoads.at(-1)!.success('data:image/bmp;base64,AA==');
    }
    const count = artLoads.length;
    component.loadCardArt(art, 700000);
    expect(artLoads).toHaveLength(count + 1);
  });

  it('opens real identified card details on right click with the native card illustration available above the panel', () => {
    const { component, info, illustration } = fixture();
    const originalInfoFocus = info.focus, originalIllustrationFocus = illustration.focus;
    component.switchTab(1);
    const card = component.getRoot().querySelector<HTMLElement>('.card')!;
    const id = component._data.data[1]!.data[1]!.cards[0]!;
    const contextmenu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    card.querySelector('.nm')!.dispatchEvent(contextmenu);
    expect(contextmenu.defaultPrevented).toBe(true);
    expect(info._host.isConnected).toBe(true);
    expect(info.uid).toBe(id);
    expect(info.getRoot().querySelector('.title')?.textContent).toBe('测试卡 ' + id);
    expect(info.getRoot().querySelector('.description-inner')?.textContent).toBe('原版卡片说明');
    const view = info.getRoot().querySelector<HTMLButtonElement>('.view')!;
    expect(view.style.display).toBe('block');
    expect(Number(info._host.style.zIndex)).toBeGreaterThan(120);
    view.click();
    expect(illustration._host.isConnected).toBe(true);
    expect(illustration.getRoot().querySelector('.titlebar .text')?.textContent).toBe('测试卡 ' + id);
    expect(illustration.getRoot().querySelector<HTMLElement>('.content')?.style.backgroundImage).toContain('AA==');
    expect(Number(illustration._host.style.zIndex)).toBeGreaterThan(Number(info._host.style.zIndex));
    component.focus();
    expect(Number(info._host.style.zIndex)).toBeGreaterThan(120);
    expect(info._host.style.getPropertyPriority('z-index')).toBe('important');
    illustration.remove();
    expect(illustration._host.style.getPropertyPriority('z-index')).toBe('');
    expect(Number(info._host.style.zIndex)).toBeGreaterThan(120);
    component.remove();
    expect(info.focus).toBe(originalInfoFocus);
    expect(illustration.focus).toBe(originalIllustrationFocus);
    expect(info._host.style.getPropertyPriority('z-index')).toBe('');
    expect(Number(info._host.style.zIndex)).toBeLessThan(120);
  });

  it('cleans detail layers when native close is used, and installs only once', () => {
    const { component, info, DB, Client } = fixture();
    expect(installLastroCardArt(component, { DB, Client })).toBe(false);
    component.createCardNode({ id: 700001, name: '卡片' }).dispatchEvent(new MouseEvent('contextmenu'));
    info.getRoot().querySelector<HTMLButtonElement>('.close')!.click();
    expect(info._host.isConnected).toBe(false);
    expect(info._host.style.getPropertyPriority('z-index')).toBe('');
    component.createCardNode({ id: 700002, name: '卡片' }).dispatchEvent(new MouseEvent('contextmenu'));
    expect(Number(info._host.style.zIndex)).toBeGreaterThan(120);
  });
});
