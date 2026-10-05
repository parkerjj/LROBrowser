// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installLastroCardDeckShortcutDispatch, patchRuntimeCardDeckHotkeys } from '../scripts/lastro-card-deck-hotkeys.mjs';
import { installLastroCardDeck } from '../scripts/lastro-card-deck.mjs';
import { installLastroCardDeckUI } from '../scripts/lastro-card-deck-ui.mjs';
import { installLastroCardState } from '../scripts/lastro-card-state.mjs';
import type { LastroCardStateComponent, LastroCardStateData } from '../scripts/lastro-card-state.mjs';
import { patchRuntimeHotkeys } from '../scripts/lastro-hotkeys.mjs';

const native = readFileSync('vendor/v2/Online.js', 'utf8');
const patched = patchRuntimeCardDeckHotkeys(native);
function region(source: string, path: string) {
  const start = source.indexOf('//#region ' + path), end = source.indexOf('//#endregion', start);
  if (start < 0 || end < start) throw new Error('Missing native shortcut fixture: ' + path);
  return source.slice(start, end + '//#endregion'.length);
}
function assignment(source: string, name: string) {
  const file = ts.createSourceFile('fixture.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  let result = '';
  function visit(node: ts.Node) {
    if (ts.isBinaryExpression(node) && node.left.getText(file) === name) result = node.getText(file) + ';';
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (!result) throw new Error('Missing native shortcut assignment: ' + name);
  return result;
}
function guiMethod(name: string) {
  const file = ts.createSourceFile('gui.js', region(native, 'src/UI/GUIComponent.js'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  let result = '';
  function visit(node: ts.Node) {
    if (ts.isMethodDeclaration(node) && node.name.getText(file) === name) result = node.getText(file);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (!result) throw new Error('Missing native GUI method: ' + name);
  return result;
}
const controlsPath = 'src/Preferences/ShortCutControls.js';
const templatePath = 'src/UI/Components/ShortCutOption/ShortCutOption.html?raw';
const cardPath = 'src/UI/Components/CardConnection/CardConnection2';
const eventPatched = patchRuntimeHotkeys(patched);
const chatSource = region(eventPatched, 'src/UI/Components/ChatBox/ChatBox.js');
const fixtureSource = eventPatched.slice(eventPatched.indexOf('function lastroHotkeyId('), eventPatched.indexOf('//#region src/Controls/KeyEventHandler.js'))
  + ['src/Core/Preferences.js', 'src/Controls/KeyEventHandler.js', controlsPath, 'src/Controls/BattleMode.js', templatePath,
    'src/UI/Components/ShortCutOption/ShortCutOption.js', cardPath].map(path => region(eventPatched, path)).join('\n')
  + '\n' + assignment(chatSource, 'ChatBox.processBattleMode') + '\n' + assignment(chatSource, 'ChatBox.onKeyDown');
interface Binding { key: number | string; alt: boolean; ctrl: boolean; shift: boolean; }
interface NativeApi {
  ShortCutOption: { isCapturing: boolean; _host: HTMLElement; getRoot(): ShadowRoot; append(): void; remove(): void };
  ShortCutControls_default: { ShortCuts: Record<string, { init: Binding; cust: Binding | false; component: string; cmd: string }> };
  BattleMode: { process(key: number): boolean; reload(): void };
  KEYS: { ALT: boolean; CTRL: boolean; SHIFT: boolean; getDeepActiveElement(): Element | null };
}
const frames: HTMLIFrameElement[] = [];
afterEach(() => { frames.splice(0).forEach(frame => frame.remove()); vi.useRealTimers(); vi.restoreAllMocks(); });
function fixture(saved?: string) {
  const frame = document.createElement('iframe'); document.body.append(frame); frames.push(frame);
  const win = frame.contentWindow as Window & typeof globalThis, doc = win.document;
  const storage = new Map<string, string>(); if (saved) storage.set('ShortCutControls', saved);
  const switchDeck = vi.fn(), otherActions = vi.fn();
  const chatHost = doc.createElement('div'); doc.body.append(chatHost);
  const chatRoot = chatHost.attachShadow({ mode: 'open' });
  chatRoot.innerHTML = '<div class="input"><input class="username"><div class="input-chatbox" contenteditable="true" tabindex="0"></div></div><div class="header"></div><div class="battlemode" style="display:none"></div>';
  const chat = { getRoot: () => chatRoot, onKeyDown: (() => true) as (event: KeyboardEvent) => boolean };
  const components: Record<string, unknown> = { ChatBox: chat };
  const initializationNames = [...new Set([...fixtureSource.matchAll(/\b(init_[\w$]+)\(\);/g)].map(match => match[1]!))];
  const context = vm.createContext({
    window: win, document: doc, console,
    localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
    Renderer: { width: 800, height: 600 }, ChatBox: chat, _root$18: () => chatRoot, ShortCutOption_default$1: '',
    Controls_default: {}, Configs: {}, Network: {}, PACKET: {}, DB: {}, Client: {}, CARD_CONNECTION_TABS: [],
    ...Object.fromEntries(['getCardConnectionData', 'listCardEntries', 'getCardDeckOverview', 'getCardLevelCount',
      'buildCardConnectionAction', 'applyCardConnectionUpdate', 'applyCardConnectionCancelUpdate', 'applyCardConnectionActivateUpdate',
      'applyCardConnectionEnableUpdate'].map(name => [name, () => {}])),
    createCardCollectionComponent: () => ({ name: 'CardConnection2', switchDeckPreset: switchDeck }),
    UIManager: { components, addComponent(component: { name: string }) { components[component.name] = component; return component; },
      getComponent(name: string) { return components[name] ?? { onShortCut: (binding: unknown) => otherActions(name, binding), updateAllTooltips() {} }; } },
    ProcessCommand_default: { processCommand: vi.fn() },
    __esmMin: (fn: () => void) => { let initialized = false; return () => { if (!initialized) { initialized = true; fn(); } }; },
  });
  vm.runInContext(`
    ${initializationNames.map(name => `var ${name} = () => {};`).join('\n')}
    class GUIComponent {
      static MouseMode = { STOP: 1 };
      constructor(name) { this.name = name; }
      getRoot() { return this._shadow; }
      draggable() {}
      focus() { this._host.tabIndex = -1; this._host.focus(); }
      append() {
        this.__active = true;
        if (!this._host) {
          this._host = document.createElement('div'); this._host.id = this.name;
          this._shadow = this._host.attachShadow({ mode: 'open' }); this._shadow.innerHTML = this.render(); this.init();
        }
        document.body.append(this._host); this._bindKeyDown(); this.onAppend?.();
      }
      remove() { this.__active = false; this._unbindKeyDown(); this.onRemove?.(); this._host?.remove(); }
      ${guiMethod('isEditableFocused')}
      ${guiMethod('_bindKeyDown')}
      ${guiMethod('_unbindKeyDown')}
    }
    ${fixtureSource}
    init_ShortCutOption(); init_CardConnection2();
    globalThis.api = { ShortCutOption, ShortCutControls_default, BattleMode, KEYS };
  `, context);
  const api = context.api as NativeApi;
  win.addEventListener('keydown', event => { if (!chat.onKeyDown(event)) event.preventDefault(); }, true);
  api.ShortCutOption.append();
  const root = api.ShortCutOption.getRoot();
  const cell = (id: string) => root.querySelector<HTMLElement>(`td[data-button="${id}"]`)!;
  const click = (selector: string) => root.querySelector<HTMLElement>(selector)!.click();
  const press = (key: number, modifiers: KeyboardEventInit = {}, target: EventTarget = doc.body) => {
    const event = new win.KeyboardEvent('keydown', { bubbles: true, composed: true, cancelable: true, keyCode: key, which: key, ...modifiers });
    target.dispatchEvent(event); return event;
  };
  return { ...api, root, doc, win, cell, press, switchDeck, otherActions, context, chatRoot,
    saved: () => storage.get('ShortCutControls')!, select: (id: string) => cell(id).click(),
    apply: () => click('.ok'), cancel: () => click('.cancel'), reset: () => click('.reset'), close: () => click('.close') };
}

function liveDeckFixture(modifiers: KeyboardEventInit = { ctrlKey: true, shiftKey: true }, verified = true) {
  const f = fixture();
  const sent = vi.fn<(packet: { id: number; tab: number; level: number; cardid: number }) => void>();
  f.context.liveSend = sent;
  const library = readFileSync('vendor/v2/lastro-card-collection.mjs', 'utf8').replace(/^export /gm, '');
  const cardUI = readFileSync('vendor/v2/lastro-card-collection-ui.mjs', 'utf8').replace(/^export /gm, '');
  vm.runInContext(`var liveCardBundle = (() => {
    ${library}\n${cardUI}
    const component = createCardCollectionComponent({
      GUIComponent, Network: { sendPacket: liveSend }, PACKET: { CZ: {
        REQUEST_CARDCONNECTION_RECHARGE: class {}, REQUEST_CARDCONNECTION_ADDMYDECK: class {}, REQUEST_CARDCONNECTION_CANCEL: class {}
      } }, DB: { getItemInfo: id => ({ identifiedDisplayName: '卡片' + id }) }, Client: { loadFile() {} }, Configs: { get: () => 5 },
      CARD_CONNECTION_TABS, getCardConnectionData, listCardEntries, getCardDeckOverview, getCardLevelCount, buildCardConnectionAction,
      applyCardConnectionUpdate, applyCardConnectionCancelUpdate, applyCardConnectionActivateUpdate, applyCardConnectionEnableUpdate
    });
    return { component, defaults: getCardConnectionData(5), CARD_CONNECTION_TABS, listCardEntries, resolveCategoryCardAction };
  })();`, f.context);
  const bundle = f.context.liveCardBundle as {
    component: LastroCardStateComponent & Parameters<typeof installLastroCardDeck>[0]
      & { switchDeckPreset(index: number, options?: { requireVerified?: boolean }): Promise<boolean> | boolean;
        activateDeckPreset(index: number): Promise<boolean>;
        saveDeckPreset(index: number): Promise<boolean>; selectDeckPreset(index: number): boolean;
        append(): void; getRoot(): ShadowRoot };
    defaults: LastroCardStateData;
  } & Parameters<typeof installLastroCardState>[1];
  const card = bundle.component;
  const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
  expect(installLastroCardState(card, { ...bundle, document: f.doc })).toBe(true);
  const session = { key: 'server5/account1/character10', connection: {}, playing: true };
  const notify = vi.fn(), save = vi.fn(async () => true);
  const api = installLastroCardDeck(card, {
    getSession: () => ({ ...session }), getDefaults: () => clone(bundle.defaults),
    loadPreferences: () => ({ presets: [[{ id: 4010, tab: 1, level: 1 }], [{ id: 4001, tab: 2, level: 1 }], null, null],
      verifiedCards: verified ? [[{ id: 4010, tab: 1, level: 1 }], [{ id: 4001, tab: 2, level: 1 }], null, null] : [null, null, null, null], activePreset: 1, save }),
    setTimeout, clearTimeout, notify,
  });
  installLastroCardDeckShortcutDispatch(card, { getActiveElement: () => f.KEYS.getDeepActiveElement(),
    getChatRoot: () => f.chatRoot, isCapturing: () => f.ShortCutOption.isCapturing });
  const manager = f.context.UIManager as { components: Record<string, unknown> };
  manager.components.CardConnection2 = card;
  const switchDeck = vi.spyOn(card, 'switchDeckPreset');
  const data = clone(bundle.defaults);
  for (const [tab, category] of Object.entries(data.data)) {
    if (Number(tab) === 0) continue;
    for (const row of Object.values(category.data)) row.recharge = row.cards.map(id => id === 4010 ? 2 : id === 4001 ? 1 : 0);
  }
  data.data[0]!.data[1]!.cards = [4010, 0, 0, 0, 0, 0, 0, 0];
  const sync = () => card.rechargeList({ classNum: 8, classInfos: Object.entries(data.data).map(([tab, category]) => {
    const rows = Object.values(category.data).map(row => ({ activate: row.activate ?? 0,
      ...Object.fromEntries(Array.from({ length: 8 }, (_unused, slot) => ['recharge' + slot, (Number(tab) === 0 ? row.cards : row.recharge)[slot] ?? 0])) }));
    return { level: rows.length, enable: category.enable ?? 0, data: rows };
  }) });
  expect(sync()).toBe(true);
  for (const index of [1, 2, 3, 4]) { f.select('CardDeck' + index); f.press(48 + index, modifiers); }
  f.apply(); f.ShortCutOption.remove();
  const press = (index: number) => {
    const result = f.press(48 + index, modifiers);
    f.doc.body.dispatchEvent(new f.win.KeyboardEvent('keyup', { bubbles: true, composed: true, keyCode: 48 + index }));
    return result;
  };
  const ack = (state?: number) => {
    const packet = sent.mock.calls.at(-1)?.[0];
    if (!packet) throw new Error('A card request must precede its acknowledgement');
    const update = { tab: packet.tab, level: packet.level, cardid: packet.cardid, state: state ?? (packet.id === 2787 ? 1 : 2) };
    return packet.id === 2787 ? card.cancelUpdate(update) : card.updateList(update);
  };
  const openUI = () => {
    expect(card._data).not.toBeNull();
    installLastroCardDeckUI(card as typeof card & { _data: LastroCardStateData }, { document: f.doc, ...api,
      select: index => card.selectDeckPreset(index), save: index => card.saveDeckPreset(index),
      activate: index => card.activateDeckPreset(index), rename: async () => true,
    });
    card.append();
    // Native first-time init creates its catalogue before the server roster.
    sync();
    const root = card.getRoot()!;
    return {
      root,
      slot: (index: number) => root.querySelector<HTMLButtonElement>(`[data-preset="${index}"]`)!,
      activate: () => root.querySelector<HTMLButtonElement>('.preset-activate')!,
      save: () => root.querySelector<HTMLButtonElement>('.preset-save')!,
    };
  };
  return { ...f, card, api, sent, notify, save, switchDeck, press, rawPress: f.press, ack, session, sync, openUI,
    deck: () => card._data!.data[0]!.data[1]!.cards.filter(Boolean) };
}
async function flush() { for (let index = 0; index < 8; index++) await Promise.resolve(); }

describe('native card deck shortcut settings', () => {
  it('adds four initially unbound actions as two interface rows', () => {
    const f = fixture();
    for (let index = 1; index <= 4; index++) {
      const cell = f.cell('CardDeck' + index);
      expect(cell.closest('.content')?.classList.contains('t_ui')).toBe(true);
      expect(cell.previousElementSibling?.textContent).toBe('切换卡册' + index);
      expect(cell.textContent).toBe('N/A');
      expect(f.ShortCutControls_default.ShortCuts['CardDeck' + index]).toMatchObject({
        init: { key: '', alt: false, ctrl: false, shift: false }, cust: false, component: 'CardConnection2', cmd: 'SWITCH_DECK_' + index,
      });
    }
    expect(f.cell('CardDeck1').parentElement).toBe(f.cell('CardDeck2').parentElement);
    expect(f.cell('CardDeck3').parentElement).toBe(f.cell('CardDeck4').parentElement);
    f.ShortCutOption.remove(); f.press(49); expect(f.switchDeck).not.toHaveBeenCalled();
  });

  it.each([1, 2, 3, 4])('records, applies and dispatches preset %i using the original native pipeline', index => {
    const f = fixture(); f.select('CardDeck' + index); f.press(48 + index, { ctrlKey: true, shiftKey: true });
    expect(f.switchDeck).not.toHaveBeenCalled(); f.apply(); f.ShortCutOption.remove();
    expect(f.press(48 + index, { ctrlKey: true, shiftKey: true }).defaultPrevented).toBe(true);
    expect(f.switchDeck).toHaveBeenCalledExactlyOnceWith(index, { requireVerified: true });
  });

  it('migrates an existing saved native table without replacing unrelated shortcuts', () => {
    const existing = fixture(); existing.select('Inventory'); existing.press(75, { ctrlKey: true }); existing.apply();
    const saved = JSON.parse(existing.saved()) as { ShortCuts: Record<string, unknown> };
    for (let index = 1; index <= 4; index++) delete saved.ShortCuts['CardDeck' + index];
    const f = fixture(JSON.stringify(saved));
    expect(f.ShortCutControls_default.ShortCuts.Inventory!.cust).toMatchObject({ key: 75, ctrl: true });
    expect(f.cell('Inventory').textContent).toBe('CTRL + K');
    for (let index = 1; index <= 4; index++) expect(f.ShortCutControls_default.ShortCuts['CardDeck' + index]!.cust).toBe(false);
  });

  it('persists the new action after restart and uses native conflict swapping', () => {
    const f = fixture(); f.select('CardDeck1'); f.press(69, { altKey: true }); f.apply();
    expect(f.ShortCutControls_default.ShortCuts.Inventory!.cust).toEqual({ key: '', alt: false, ctrl: false, shift: false });
    const reopened = fixture(f.saved());
    expect(reopened.cell('CardDeck1').textContent).toBe('ALT + E');
    reopened.ShortCutOption.remove(); reopened.press(69, { altKey: true });
    expect(reopened.switchDeck).toHaveBeenCalledExactlyOnceWith(1, { requireVerified: true }); expect(reopened.otherActions).not.toHaveBeenCalled();
  });

  it.each(['cancel', 'close'] as const)('discards an unsaved new binding on %s', action => {
    const f = fixture(); f.select('CardDeck2'); f.press(50, { ctrlKey: true, shiftKey: true }); f[action]();
    f.ShortCutOption.remove(); f.press(50, { ctrlKey: true, shiftKey: true });
    expect(f.switchDeck).not.toHaveBeenCalled(); expect(f.ShortCutControls_default.ShortCuts.CardDeck2!.cust).toBe(false);
  });

  it('uses the native Escape unbind and resets to unbound without changing normal actions', () => {
    const f = fixture(); f.select('CardDeck1'); f.press(49, { ctrlKey: true, shiftKey: true }); f.apply();
    f.select('CardDeck1'); f.press(27); f.apply(); f.ShortCutOption.remove();
    f.press(49, { ctrlKey: true, shiftKey: true }); expect(f.switchDeck).not.toHaveBeenCalled();
    f.ShortCutOption.append(); f.select('CardDeck1'); f.press(49, { ctrlKey: true, shiftKey: true }); f.apply();
    f.reset(); f.apply(); expect(f.ShortCutControls_default.ShortCuts.CardDeck1!.cust).toBe(false);
    f.ShortCutOption.remove(); f.press(69, { altKey: true });
    expect(f.otherActions).toHaveBeenCalledWith('Inventory', expect.objectContaining({ cmd: 'TOGGLE' }));
  });

  it('does not switch while recording another shortcut or composing text, and follows native modifier shortcuts in chat', () => {
    const f = fixture(); f.select('CardDeck1'); f.press(49, { ctrlKey: true, shiftKey: true }); f.apply();
    f.select('Inventory'); f.press(49, { ctrlKey: true, shiftKey: true });
    expect(f.switchDeck).not.toHaveBeenCalled(); f.cancel(); f.ShortCutOption.remove();
    f.press(49, { ctrlKey: true, shiftKey: true, isComposing: true }); expect(f.switchDeck).not.toHaveBeenCalled();
    const input = f.chatRoot.querySelector<HTMLElement>('.input-chatbox')!; input.focus();
    f.press(49, { ctrlKey: true, shiftKey: true }, input); expect(f.switchDeck).toHaveBeenCalledExactlyOnceWith(1, { requireVerified: true });
    input.blur(); f.press(49, { ctrlKey: true, shiftKey: true }); expect(f.switchDeck).toHaveBeenCalledTimes(2);
  });

  it('keeps native Alt+1 and Alt+2 actions usable when focus returns to the chat box after the first switch', () => {
    const f = fixture();
    f.select('CardDeck1'); f.press(49, { altKey: true });
    f.select('CardDeck2'); f.press(50, { altKey: true }); f.apply(); f.ShortCutOption.remove();
    f.press(49, { altKey: true }); expect(f.switchDeck).toHaveBeenCalledExactlyOnceWith(1, { requireVerified: true });
    const input = f.chatRoot.querySelector<HTMLElement>('.input-chatbox')!; input.focus();
    f.press(69, { altKey: true }, input);
    expect(f.otherActions).toHaveBeenCalledWith('Inventory', expect.objectContaining({ cmd: 'TOGGLE' }));
    f.press(50, { altKey: true }, input);
    expect(f.switchDeck.mock.calls.map(([index]) => index)).toEqual([1, 2]);
    const canvas = f.doc.createElement('canvas'); f.doc.body.append(canvas);
    canvas.addEventListener('mousedown', event => event.preventDefault());
    canvas.dispatchEvent(new f.win.MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    expect(f.KEYS.getDeepActiveElement()).toBe(input);
    f.press(49, { altKey: true });
    expect(f.switchDeck.mock.calls.map(([index]) => index)).toEqual([1, 2, 1]);
  });

  it.each(['.input-chatbox', '.input .username'])('allows a configured native function key in the exact chat field %s', selector => {
    const f = fixture(); f.select('CardDeck1'); f.press(112); f.apply(); f.ShortCutOption.remove();
    const input = f.chatRoot.querySelector<HTMLElement>(selector)!; input.focus();
    f.press(112, {}, input); expect(f.switchDeck).toHaveBeenCalledExactlyOnceWith(1, { requireVerified: true });
  });

  it.each([65, 67, 86, 88, 89, 90])('retains native protection for ordinary chat typing and editing shortcut Ctrl+%i even when bound to a deck', editingKey => {
    const f = fixture();
    f.select('CardDeck1'); f.press(49);
    f.select('CardDeck2'); f.press(editingKey, { ctrlKey: true }); f.apply(); f.ShortCutOption.remove();
    f.chatRoot.querySelector<HTMLElement>('.battlemode')!.style.display = 'block';
    const input = f.chatRoot.querySelector<HTMLElement>('.input-chatbox')!; input.focus();
    f.press(49, {}, input); f.press(editingKey, { ctrlKey: true }, input);
    expect(f.switchDeck).not.toHaveBeenCalled();
  });

  it('preserves composition and dead-key protection for Alt+1 in chat', () => {
    const f = fixture(); f.select('CardDeck1'); f.press(49, { altKey: true }); f.apply(); f.ShortCutOption.remove();
    const input = f.chatRoot.querySelector<HTMLElement>('.input-chatbox')!; input.focus();
    f.press(49, { altKey: true, isComposing: true }, input);
    f.press(229, { altKey: true }, input);
    f.press(49, { altKey: true, key: 'Dead' }, input);
    expect(f.switchDeck).not.toHaveBeenCalled();
    f.press(49, { altKey: true }, input); expect(f.switchDeck).toHaveBeenCalledExactlyOnceWith(1, { requireVerified: true });
  });

  it.each(['input', 'textarea', 'select', 'contenteditable'])('still blocks a deck shortcut inside another %s editor', type => {
    const f = fixture(); f.select('CardDeck1'); f.press(49, { altKey: true }); f.apply(); f.ShortCutOption.remove();
    const editor = f.doc.createElement(type === 'contenteditable' ? 'div' : type);
    if (type === 'contenteditable') { editor.setAttribute('contenteditable', 'true'); editor.tabIndex = 0; }
    // An editor in the chat root is not necessarily the chat message/recipient field.
    f.chatRoot.append(editor); editor.focus();
    f.press(49, { altKey: true }, editor); expect(f.switchDeck).not.toHaveBeenCalled();
  });

  it('does not switch while a native text field in another shadow root is focused', () => {
    const f = fixture(); f.select('CardDeck1'); f.press(49, { ctrlKey: true, shiftKey: true }); f.apply(); f.ShortCutOption.remove();
    const host = f.doc.createElement('div'); f.doc.body.append(host);
    const root = host.attachShadow({ mode: 'open' }); const input = f.doc.createElement('input'); root.append(input); input.focus();
    f.press(49, { ctrlKey: true, shiftKey: true }, input); expect(f.switchDeck).not.toHaveBeenCalled();
  });

  it('preserves unrelated component shortcut handlers and rejects invalid deck commands', () => {
    const original = vi.fn(), switchDeckPreset = vi.fn();
    const component = { onShortCut: original, switchDeckPreset };
    installLastroCardDeckShortcutDispatch(component, { getActiveElement: () => null, isCapturing: () => false });
    component.onShortCut({ cmd: 'TOGGLE' }); component.onShortCut({ cmd: 'SWITCH_DECK_5' });
    expect(original).toHaveBeenCalledTimes(2); expect(switchDeckPreset).not.toHaveBeenCalled();
  });
});

describe('repeated native keyboard dispatch with confirmed card state', () => {
  it('reports waiting for native Alt shortcuts while one shared lock protects every ACK and preference save', async () => {
    const f = liveDeckFixture({ altKey: true }), ui = f.openUI();
    const manual = vi.spyOn(f.card, 'activateDeckPreset');
    let finishSave!: (value: boolean) => void;
    f.save.mockImplementationOnce(() => new Promise<boolean>(resolve => { finishSave = resolve; }));
    expect(f.press(2).defaultPrevented).toBe(true);
    const switching = f.switchDeck.mock.results[0]!.value;
    const assertLocked = () => {
      const requests = f.sent.mock.calls.length, shortcuts = f.switchDeck.mock.calls.length, notices = [...f.notify.mock.calls];
      expect(f.api.isBusy()).toBe(true); expect(f.api.getSelected()).toBe(2);
      expect(ui.activate().disabled).toBe(true); expect(ui.save().disabled).toBe(true);
      for (const index of [1, 3]) {
        expect(ui.slot(index).disabled).toBe(true);
        expect(f.press(index).defaultPrevented).toBe(true);
        ui.slot(index).dispatchEvent(new f.win.MouseEvent('click', { bubbles: true }));
      }
      // Exercise the handler as well as the disabled browser button.
      ui.activate().dispatchEvent(new f.win.MouseEvent('click', { bubbles: true }));
      expect(f.switchDeck).toHaveBeenCalledTimes(shortcuts + 2);
      expect(f.switchDeck.mock.results.slice(-2).map(result => result.value)).toEqual([false, false]);
      expect(manual).not.toHaveBeenCalled(); expect(f.sent).toHaveBeenCalledTimes(requests);
      expect(f.notify.mock.calls).toEqual([...notices,
        [false, 1, '卡册 1', '正在等待服务器确认'], [false, 3, '卡册 3', '正在等待服务器确认']]);
      expect(f.api.getSelected()).toBe(2);
    };
    assertLocked(); expect(f.sent).toHaveBeenCalledTimes(1);
    f.ack(); await flush(); assertLocked(); expect(f.sent).toHaveBeenCalledTimes(2);
    f.ack(); await flush(); assertLocked(); expect(f.save).toHaveBeenCalledOnce();
    expect(f.deck()).toEqual([4001]); expect(f.notify.mock.calls.every(([success]) => success === false)).toBe(true);
    finishSave(true); await flush(); expect(await switching).toBe(true);
    expect(f.api.isBusy()).toBe(false); expect(ui.slot(1).disabled).toBe(false);
    expect(f.notify.mock.calls.at(-1)).toEqual([true, 2, '卡册 2', undefined]);
    f.switchDeck.mockClear(); f.notify.mockClear();
    ui.slot(1).click(); ui.activate().click(); expect(manual).toHaveBeenCalledExactlyOnceWith(1);
    for (const before of [3, 4]) {
      const shortcuts = f.switchDeck.mock.calls.length, notices = [...f.notify.mock.calls];
      for (const index of [2, 3]) expect(f.press(index).defaultPrevented).toBe(true);
      expect(f.switchDeck).toHaveBeenCalledTimes(shortcuts + 2); expect(f.sent).toHaveBeenCalledTimes(before);
      expect(f.notify.mock.calls).toEqual([...notices,
        [false, 2, '卡册 2', '正在等待服务器确认'], [false, 3, '卡册 3', '正在等待服务器确认']]);
      expect(f.api.getSelected()).toBe(1); expect(ui.activate().disabled).toBe(true);
      f.ack(); await flush();
    }
    expect(await manual.mock.results[0]!.value).toBe(true); expect(f.api.getActivePreset()).toBe(1);
    expect(f.api.isBusy()).toBe(false); expect(f.notify.mock.calls.at(-1)?.slice(0, 3)).toEqual([true, 1, '卡册 1']);
    f.press(2); f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)!.value).toBe(true);
    expect(f.switchDeck.mock.calls.map(([index]) => index)).toEqual([2, 3, 2, 3, 2]);
    f.press(1); f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)!.value).toBe(true);
    expect(f.api.getActivePreset()).toBe(1); expect(f.notify.mock.calls.at(-1)).toEqual([true, 1, '卡册 1', undefined]);
  });

  it('blocks concurrent native shortcuts during a rejected switch and unlocks after the matching rejection', async () => {
    const f = liveDeckFixture({ altKey: true }), ui = f.openUI();
    f.press(2); f.press(1); f.press(3);
    expect(f.switchDeck.mock.calls.map(([index]) => index)).toEqual([2, 1, 3]);
    expect(f.notify.mock.calls).toEqual([[false, 1, '卡册 1', '正在等待服务器确认'],
      [false, 3, '卡册 3', '正在等待服务器确认']]);
    expect(f.sent).toHaveBeenCalledOnce(); expect(f.api.getSelected()).toBe(2);
    f.ack(2); await flush();
    expect(await f.switchDeck.mock.results[0]!.value).toBe(false);
    expect(f.api.isBusy()).toBe(false); expect(ui.slot(1).disabled).toBe(false);
    expect(f.notify).toHaveBeenCalledTimes(3); expect(f.notify.mock.calls.at(-1)?.slice(0, 3)).toEqual([false, 2, '卡册 2']);
    f.press(2); f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)!.value).toBe(true);
    expect(f.api.getActivePreset()).toBe(2); expect(f.notify.mock.calls.map(([success]) => success)).toEqual([false, false, false, true]);
  });

  it('keeps timed-out requests quarantined across shortcut and manual inputs until the exact late ACK arrives', async () => {
    vi.useFakeTimers(); const f = liveDeckFixture({ altKey: true }), ui = f.openUI();
    const manual = vi.spyOn(f.card, 'activateDeckPreset');
    f.press(2); await vi.advanceTimersByTimeAsync(5000);
    expect(await f.switchDeck.mock.results[0]!.value).toBe(false);
    expect(f.api.isBusy()).toBe(true); const notices = [...f.notify.mock.calls];
    expect(notices).toHaveLength(1); expect(notices[0]?.[0]).toBe(false);
    for (const index of [1, 2, 3]) f.press(index);
    ui.slot(1).dispatchEvent(new f.win.MouseEvent('click', { bubbles: true }));
    ui.activate().dispatchEvent(new f.win.MouseEvent('click', { bubbles: true }));
    expect(f.switchDeck).toHaveBeenCalledTimes(4); expect(manual).not.toHaveBeenCalled();
    expect(f.switchDeck.mock.results.slice(1).map(result => result.value)).toEqual([false, false, false]);
    expect(f.api.getSelected()).toBe(2); expect(f.sent).toHaveBeenCalledOnce();
    expect(f.notify.mock.calls).toEqual([...notices, ...[1, 2, 3].map(index =>
      [false, index, '卡册 ' + index, '正在等待服务器确认'])]);
    const waitingNotices = [...f.notify.mock.calls];
    expect(ui.activate().disabled).toBe(true); expect(ui.slot(1).disabled).toBe(true);
    f.ack(); await flush(); expect(f.api.isBusy()).toBe(false); expect(f.sent).toHaveBeenCalledOnce();
    // The late cancel confirms only itself; it cannot resume the aborted add.
    expect(f.deck()).toEqual([]); expect(f.notify.mock.calls).toEqual(waitingNotices);
    f.press(1); expect(f.sent).toHaveBeenCalledTimes(2); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)!.value).toBe(true);
    expect(f.deck()).toEqual([4010]); expect(f.api.getActivePreset()).toBe(1);
  });

  it('retires a map-change transaction and requires a fresh roster after reconnect before accepting new shortcuts', async () => {
    const f = liveDeckFixture({ altKey: true }), ui = f.openUI();
    f.press(2); f.api.invalidate(false); f.card.renderCards(); await flush();
    expect(await f.switchDeck.mock.results[0]!.value).toBe(false);
    expect(f.api.isBusy()).toBe(true); f.press(1); expect(f.switchDeck).toHaveBeenCalledTimes(2);
    expect(f.switchDeck.mock.results[1]!.value).toBe(false);
    expect(ui.activate().disabled).toBe(true);
    expect(f.notify.mock.calls).toEqual([[false, 1, '卡册 1', '正在等待服务器确认']]);
    f.session.connection = {}; expect(f.api.isBusy()).toBe(false);
    f.ack(); await flush(); expect(f.sent).toHaveBeenCalledOnce(); expect(f.notify).toHaveBeenCalledOnce();
    expect(f.api.getActivePreset()).toBeNull();
    f.press(2); await flush(); expect(await f.switchDeck.mock.results.at(-1)!.value).toBe(false);
    expect(f.sent).toHaveBeenCalledOnce(); expect(f.notify.mock.calls.at(-1)?.[3]).toBe('卡册状态尚未完整同步');
    f.sync(); f.press(2); f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)!.value).toBe(true);
    expect(f.api.isBusy()).toBe(false); expect(f.api.getActivePreset()).toBe(2);
    expect(f.notify.mock.calls.map(([success]) => success)).toEqual([false, false, true]);
  });

  it('keeps foreign editing and native key recording silent even while a deck switch is pending', async () => {
    const f = liveDeckFixture({ altKey: true });
    f.press(2); expect(f.api.isBusy()).toBe(true);
    const switching = f.switchDeck.mock.results[0]!.value;
    const input = f.doc.createElement('input'); f.doc.body.append(input); input.focus();
    f.rawPress(49, { altKey: true }, input);
    expect(f.switchDeck).toHaveBeenCalledOnce(); expect(f.notify).not.toHaveBeenCalled(); expect(f.sent).toHaveBeenCalledOnce();
    f.ShortCutOption.append(); f.select('Inventory');
    expect(f.ShortCutOption.isCapturing).toBe(true);
    f.rawPress(49, { altKey: true });
    expect(f.switchDeck).toHaveBeenCalledOnce(); expect(f.notify).not.toHaveBeenCalled(); expect(f.sent).toHaveBeenCalledOnce();
    f.cancel(); f.ShortCutOption.remove(); input.remove();
    f.ack(); await flush(); f.ack(); await flush(); expect(await switching).toBe(true);
    expect(f.api.isBusy()).toBe(false); expect(f.notify.mock.calls).toEqual([[true, 2, '卡册 2', undefined]]);
    f.press(1); f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)!.value).toBe(true); expect(f.api.getActivePreset()).toBe(1);
  });

  it.each([0, 5000])('keeps Alt+1/2 switching reusable after a chat-only quota refusal at %i ms', async delay => {
    vi.useFakeTimers(); const f = liveDeckFixture({ altKey: true });
    const definition = Object.entries(f.card._data!.data[1]!.data)
      .find(([, row]) => row.cards.includes(4112))!;
    const second = { tab: 1, level: Number(definition[0]), cardid: 4112 };
    f.card.updateList({ ...second, state: 1 });
    expect(f.card.sendAction('add-deck', second)).toBe(true); await vi.advanceTimersByTimeAsync(delay);
    expect(f.api.getActivePreset()).toBe(1); expect(f.api.onServerNotice('卡组中已有1张头饰类卡片')).toBe(true); await flush();
    expect(f.api.isBusy()).toBe(false); expect(f.api.isVerified(1)).toBe(true);
    f.sent.mockClear(); f.notify.mockClear(); f.switchDeck.mockClear();
    const input = f.chatRoot.querySelector<HTMLElement>('.input-chatbox')!; input.focus();
    for (const index of [2, 1, 2, 1]) {
      expect(f.rawPress(48 + index, { altKey: true }, input).defaultPrevented).toBe(true);
      f.ack(); await flush(); f.ack(); await flush();
      expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
      expect(f.api.getActivePreset()).toBe(index); expect(f.api.isBusy()).toBe(false);
      expect(f.notify.mock.calls.at(-1)?.slice(0, 3)).toEqual([true, index, '卡册 ' + index]);
    }
    expect(f.switchDeck).toHaveBeenCalledTimes(4); expect(f.sent).toHaveBeenCalledTimes(8); expect(f.notify).toHaveBeenCalledTimes(4);
  });

  it('refuses changed server-confirmed content until explicitly saved, then repeatedly switches Alt+1/2', async () => {
    const f = liveDeckFixture({ altKey: true }, false);
    const activation = f.card.activateDeckPreset(2); f.ack(); await flush(); f.ack();
    expect(await activation).toBe(true);
    expect(f.card.sendAction('add-deck', { tab: 1, level: 1, cardid: 4010 })).toBe(true);
    expect(f.api.canSave()).toBe(false); f.ack(); await flush();
    expect(f.api.getDraft().map(card => card.id)).toEqual([4001, 4010]); expect(f.api.isVerified(2)).toBe(false);
    f.sent.mockClear(); f.notify.mockClear(); f.switchDeck.mockClear();
    expect(f.press(2).defaultPrevented).toBe(true); await flush();
    expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(false);
    expect(f.sent).not.toHaveBeenCalled(); expect(f.notify.mock.calls[0]?.[0]).toBe(false);
    expect(await f.card.saveDeckPreset(2)).toBe(true); expect(f.api.isVerified(2)).toBe(true);
    f.sent.mockClear(); f.notify.mockClear(); f.switchDeck.mockClear();
    for (const index of [1, 2, 1, 2]) {
      expect(f.press(index).defaultPrevented).toBe(true); f.ack(); await flush();
      expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
      expect(f.deck().sort()).toEqual((index === 1 ? [4010] : [4001, 4010]).sort());
      expect(f.api.getActivePreset()).toBe(index); expect(f.api.isBusy()).toBe(false);
    }
    expect(f.sent).toHaveBeenCalledTimes(4); expect(f.notify).toHaveBeenCalledTimes(4);
    expect(f.notify.mock.calls.every(([success]) => success)).toBe(true);
  });

  it('rejects an unverified saved preset through a native shortcut with one clear failure notice and no packets', async () => {
    const f = liveDeckFixture({ altKey: true }, false);
    expect(f.press(2).defaultPrevented).toBe(true); await flush();
    expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(false);
    expect(f.switchDeck).toHaveBeenCalledExactlyOnceWith(2, { requireVerified: true });
    expect(f.sent).not.toHaveBeenCalled(); expect(f.deck()).toEqual([4010]); expect(f.api.isBusy()).toBe(false);
    expect(f.notify).toHaveBeenCalledOnce();
    expect(f.notify.mock.calls[0]?.slice(0, 3)).toEqual([false, 2, '卡册 2']);
    expect(f.notify.mock.calls[0]?.[3]).toMatch(/手动|激活/);
  });

  it('allows repeated Alt+1 and Alt+2 only after both exact saved contents have completed manual server activation', async () => {
    const f = liveDeckFixture({ altKey: true }, false);
    for (const index of [2, 1]) {
      const operation = f.card.activateDeckPreset(index); f.ack(); await flush(); f.ack();
      expect(await operation).toBe(true); expect(f.api.isVerified(index)).toBe(true);
      expect(f.api.isBusy()).toBe(false);
    }
    f.sent.mockClear(); f.notify.mockClear(); f.switchDeck.mockClear();
    const input = f.chatRoot.querySelector<HTMLElement>('.input-chatbox')!; input.focus();
    for (const index of [2, 1, 2, 1]) {
      expect(f.rawPress(48 + index, { altKey: true }, input).defaultPrevented).toBe(true);
      f.ack(); await flush(); f.ack(); await flush();
      expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
      expect(f.deck()).toEqual([index === 1 ? 4010 : 4001]); expect(f.api.getActivePreset()).toBe(index);
      expect(f.api.isBusy()).toBe(false); expect(f.KEYS.getDeepActiveElement()).toBe(input);
    }
    expect(f.switchDeck.mock.calls).toEqual([2, 1, 2, 1].map(index => [index, { requireVerified: true }]));
    expect(f.sent).toHaveBeenCalledTimes(8); expect(f.notify).toHaveBeenCalledTimes(4);
    expect(f.notify.mock.calls.every(([success]) => success)).toBe(true);
  });

  it('switches repeatedly with Alt+1 and Alt+2 while the native chat field remains focused', async () => {
    const f = liveDeckFixture({ altKey: true });
    f.press(2); f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
    const input = f.chatRoot.querySelector<HTMLElement>('.input-chatbox')!; input.focus();
    for (const index of [1, 2]) {
      f.rawPress(48 + index, { altKey: true }, input);
      f.ack(); await flush(); f.ack(); await flush();
      expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
      expect(f.api.isBusy()).toBe(false); expect(f.api.getActivePreset()).toBe(index);
      expect(f.KEYS.getDeepActiveElement()).toBe(input);
    }
    expect(f.switchDeck.mock.calls.map(([index]) => index)).toEqual([2, 1, 2]);
    expect(f.notify).toHaveBeenCalledTimes(3); expect(f.sent).toHaveBeenCalledTimes(6);
  });

  it('switches A to B to A to B using saved modifiers, releasing busy after every complete acknowledgement sequence', async () => {
    const f = liveDeckFixture();
    for (const index of [2, 1, 2]) {
      const before = f.sent.mock.calls.length;
      expect(f.press(index).defaultPrevented).toBe(true);
      expect(f.api.isBusy()).toBe(true);
      expect(f.sent).toHaveBeenCalledTimes(before + 1);
      f.ack(); await flush(); expect(f.sent).toHaveBeenCalledTimes(before + 2);
      f.ack(); await flush();
      expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
      expect(f.api.isBusy()).toBe(false);
      expect(f.api.getActivePreset()).toBe(index);
      expect(f.deck()).toEqual([index === 1 ? 4010 : 4001]);
      expect(f.KEYS).toMatchObject({ ALT: false, CTRL: false, SHIFT: false });
    }
    expect(f.switchDeck.mock.calls.map(([index]) => index)).toEqual([2, 1, 2]);
    expect(f.notify).toHaveBeenCalledTimes(3);
    expect(f.ShortCutControls_default.ShortCuts.CardDeck1!.cust).toMatchObject({ key: 49, ctrl: true, shift: true });
    expect(f.ShortCutControls_default.ShortCuts.CardDeck2!.cust).toMatchObject({ key: 50, ctrl: true, shift: true });
  });

  it('dispatches again after a server rejection without a stuck capture flag or busy state', async () => {
    const f = liveDeckFixture();
    f.press(2); f.ack(2); await flush();
    expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(false);
    expect(f.api.isBusy()).toBe(false); expect(f.ShortCutOption.isCapturing).toBe(false);
    expect(f.deck()).toEqual([4010]);
    f.press(2); expect(f.sent).toHaveBeenCalledTimes(2);
    f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
    expect(f.deck()).toEqual([4001]); expect(f.api.isBusy()).toBe(false);
  });

  it('accepts the next short press without any intervening keyup and corrects stale modifier state from the new event', async () => {
    const f = liveDeckFixture();
    f.rawPress(50, { ctrlKey: true, shiftKey: true });
    f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
    expect(f.KEYS).toMatchObject({ CTRL: true, SHIFT: true, ALT: false });
    // Simulate losing the entire keyup, followed by a stale global-key update.
    f.KEYS.CTRL = false; f.KEYS.SHIFT = false; f.KEYS.ALT = true;
    expect(f.rawPress(49, { ctrlKey: true, shiftKey: true }).defaultPrevented).toBe(true);
    expect(f.KEYS).toMatchObject({ CTRL: true, SHIFT: true, ALT: false });
    f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
    expect(f.switchDeck.mock.calls.map(([index]) => index)).toEqual([2, 1]);
    expect(f.deck()).toEqual([4010]); expect(f.api.isBusy()).toBe(false);
  });

  it('does not latch a prevented or repeated keydown while awaiting or after receiving acknowledgements', async () => {
    const f = liveDeckFixture();
    expect(f.rawPress(50, { ctrlKey: true, shiftKey: true }).defaultPrevented).toBe(true);
    expect(f.rawPress(50, { ctrlKey: true, shiftKey: true, repeat: true }).defaultPrevented).toBe(true);
    expect(f.sent).toHaveBeenCalledTimes(1);
    expect(f.switchDeck.mock.calls).toEqual([[2, { requireVerified: true }], [2, { requireVerified: true }]]);
    expect(f.switchDeck.mock.results[1]!.value).toBe(false);
    expect(f.notify).toHaveBeenCalledWith(false, 2, '卡册 2', '正在等待服务器确认');
    f.ack(); await flush(); f.ack(); await flush();
    expect(f.api.isBusy()).toBe(false); expect(f.deck()).toEqual([4001]);
    expect(f.rawPress(49, { ctrlKey: true, shiftKey: true, repeat: true }).defaultPrevented).toBe(true);
    f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
    expect(f.deck()).toEqual([4010]); expect(f.api.isBusy()).toBe(false);
    expect(f.switchDeck.mock.calls.map(([index]) => index)).toEqual([2, 2, 1]);
  });

  it('keeps keyboard dispatch intact after logout while requiring full state for a new character', async () => {
    const f = liveDeckFixture();
    f.press(2); f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
    f.session.playing = false; f.press(1); await flush();
    expect(f.sent).toHaveBeenCalledTimes(2); expect(f.api.getActivePreset()).toBeNull();
    f.session.key = 'server5/account1/character20'; f.session.playing = true; f.press(1); await flush();
    expect(f.sent).toHaveBeenCalledTimes(2);
    f.sync(); f.press(2); expect(f.sent).toHaveBeenCalledTimes(3);
    f.ack(); await flush(); f.ack(); await flush();
    expect(await f.switchDeck.mock.results.at(-1)?.value).toBe(true);
    expect(f.api.isBusy()).toBe(false); expect(f.api.getActivePreset()).toBe(2);
    expect(f.switchDeck.mock.calls.map(([index]) => index)).toEqual([2, 1, 1, 2]);
  });
});

describe('card deck shortcut patch boundaries', () => {
  it('changes only preferences, settings HTML and the card component integration', () => {
    let remainder = native, changed = patched;
    for (const path of [controlsPath, templatePath, cardPath]) {
      remainder = remainder.replace(region(remainder, path), ''); changed = changed.replace(region(changed, path), '');
    }
    expect(changed).toBe(remainder);
  });
  it.each(['\n', '\r\n'])('supports consistent %j newlines', newline => {
    const fixture = [controlsPath, templatePath, cardPath].map(path => region(native, path)).join('\n').replace(/\r?\n/g, newline);
    const output = patchRuntimeCardDeckHotkeys(fixture);
    expect(output).toContain('SWITCH_DECK_');
    expect(output.replaceAll(newline, '')).not.toMatch(/[\r\n]/);
    const parsed = ts.createSourceFile('patched.js', output, ts.ScriptTarget.Latest, true) as ts.SourceFile & { parseDiagnostics: ts.Diagnostic[] };
    expect(parsed.parseDiagnostics).toHaveLength(0);
  });
  it('fails closed for repeated patches, missing regions and ambiguous anchors', () => {
    expect(() => patchRuntimeCardDeckHotkeys(patched)).toThrow('already-patched');
    expect(() => patchRuntimeCardDeckHotkeys(region(native, controlsPath))).toThrow('anchor:card-deck-hotkeys:');
    expect(() => patchRuntimeCardDeckHotkeys(native + '\n' + region(native, controlsPath))).toThrow('anchor:card-deck-hotkeys:');
    expect(patchRuntimeCardDeckHotkeys('unrelated')).toBe('unrelated');
  });
  it.each([controlsPath, templatePath, cardPath])('ignores similarly named regions when patching %s', path => {
    const other = '\n//#region ' + path + '.extra\nconst untouched = true;\n//#endregion';
    const output = patchRuntimeCardDeckHotkeys(native + other);
    expect(output).toBe(patched + other);
  });
  it.each(['\n', '\r\n'])('does not interpret a region-name prefix as a matching marker with %j line endings', newline => {
    const onlyPrefixes = [controlsPath, templatePath, cardPath]
      .map(path => '//#region ' + path + '.extra' + newline + 'const untouched = true;' + newline + '//#endregion').join(newline);
    expect(patchRuntimeCardDeckHotkeys(onlyPrefixes)).toBe(onlyPrefixes);
    const fixture = native.replace(/\r?\n/g, newline);
    const missingExact = fixture.replace('//#region ' + cardPath + newline, '//#region ' + cardPath + '.extra' + newline);
    expect(missingExact).not.toBe(fixture);
    expect(() => patchRuntimeCardDeckHotkeys(missingExact)).toThrow('anchor:card-deck-hotkeys:' + cardPath);
  });
  it('recognizes a complete marker at EOF and rejects the incomplete region', () => {
    expect(() => patchRuntimeCardDeckHotkeys('//#region ' + controlsPath)).toThrow('anchor:card-deck-hotkeys:region');
  });
});
