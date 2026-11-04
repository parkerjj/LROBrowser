import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';

const vendor = readFileSync('vendor/v2/Online.js', 'utf8');
const { JSDOM } = createRequire(import.meta.url)('jsdom') as { JSDOM: new (html: string) => { window: { document: Document } } };

function region(name: string) {
  const start = vendor.indexOf(`//#region ${name}`);
  const end = vendor.indexOf('//#endregion', start);
  if (start < 0 || end < 0) throw new Error(`Missing region ${name}`);
  return vendor.slice(start, end);
}

interface Slot { GID: number; name: string; CharNum: number; job: number; lastMap: string }
type Ui = {
  setInfo(pkt: unknown): void; addCharacter(slot: Slot): void; markServerChoice(slot: Partial<Slot> | null): void;
  onRemove(): void; getRoot(): Element;
};

const cleanups: Array<() => void> = [];
afterEach(() => { for (const cleanup of cleanups.splice(0)) cleanup(); });

function fixture() {
  const document = new JSDOM('<!doctype html><body></body>').window.document;
  const root = document.createElement('div');
  const cards = Array.from({ length: 6 }, (_, i) => `<div class="char_canvas"><canvas id="slot${i}"></canvas><div class="name"></div><div class="job_icon"></div></div>`).join('');
  const fields = ['name', 'job', 'lvl', 'exp', 'hp', 'sp', 'map', 'str', 'agi', 'vit', 'int', 'dex', 'luk'].map(c => `<div class="${c}"></div>`).join('');
  root.innerHTML = `<div class="char_list">${cards}</div><div class="charinfo">${fields}</div>
    <div class="delete"></div><div class="canceldelete"></div><div class="finaldelete"></div><div class="ok"></div>`;
  document.body.append(root);
  const scrolled: Element[] = [];
  (document.defaultView!.Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = function (this: Element) { scrolled.push(this); };
  class GUIComponent { constructor(public name: string, public cssText: string) {} getRoot() { return root; } }
  class Entity { effectState = 0; _effectState = 0; set() {} }
  const context = vm.createContext({
    document, GUIComponent, Entity, console, Infinity, Math, Date, setInterval: () => 1, clearInterval: vi.fn(),
    Preferences: { get: () => ({ index: 0, save() {} }) },
    PacketVerManager_default: { value: 20211103 },
    StatusState_default: { EffectState: { INVISIBLE: 1 } },
    Client: { loadFile: vi.fn() }, DB: { INTERFACE_PATH: '', getMapName: (m: string) => m },
    MonsterTable_default: { 7: 'Knight' }, Renderer: { render: vi.fn(), stop: vi.fn() },
    Camera: {}, SpriteRenderer: {}, __esmMin: (init: () => void) => init, UIManager: { addComponent: (component: unknown) => component },
    KEYS: { LEFT: 37, RIGHT: 39, ESCAPE: 27, SUPR: 46, ENTER: 13 },
  });
  vm.runInContext(`${region('src/UI/Components/CharSelect/CharSelectCommon.js')}
    globalThis.ui = createCharSelect({ name: 'CharSelectV4', htmlText: '', cssText: '', gridLayout: true });`, context);
  const ui = context.ui as Ui;
  cleanups.push(() => ui.onRemove());
  const character = (CharNum: number, name: string, GID: number): Slot => ({ GID, name, CharNum, job: 7, lastMap: 'prontera' });
  const list = [character(0, '星野', 150001), character(1, 'Aria', 150002), character(2, '墨竹', 150004)];
  const cardAt = (i: number) => root.querySelectorAll('.char_canvas')[i]!;
  return { ui, root, list, cardAt, scrolled };
}

const header = { TotalSlotNum: 9, PremiumStartSlot: 0, sex: 0 };
const picked = (root: Element) => [...root.querySelectorAll('.lastro-pick')];
const note = (root: Element) => root.querySelector('.lastro-pick-note')?.textContent ?? null;

describe('server-picked character highlight (HC.ACCEPT_ENTER2)', () => {
  it('marks the picked card, selects it and shows the note when the list arrives first', () => {
    const f = fixture();
    f.ui.setInfo({ ...header, charInfo: f.list });
    f.ui.markServerChoice({ GID: 150004, name: '墨竹', CharNum: 2 });
    expect(picked(f.root)).toEqual([f.cardAt(2)]);
    expect(f.cardAt(2).querySelector('.lastro-pick-ribbon')?.textContent).toContain('指定登录');
    expect(f.root.querySelector('.charinfo .name')).not.toBeNull();
    expect(note(f.root)).toContain('服务器指定登录:墨竹');
    expect(f.root.querySelector('.ok')!.classList.contains('lastro-pick-ring')).toBe(true);
    expect(f.scrolled).toEqual([f.cardAt(2)]);
  });

  it('applies a mark that arrived before the list and never enters the game by itself', () => {
    const f = fixture();
    f.ui.markServerChoice({ GID: 150002, name: 'Aria', CharNum: 1 });
    expect(picked(f.root)).toEqual([]);
    f.ui.setInfo({ ...header, charInfo: f.list });
    expect(picked(f.root)).toEqual([f.cardAt(1)]);
    expect(note(f.root)).toContain('Aria');
  });

  it('keeps the mark on its card when the player moves to another character', () => {
    const f = fixture();
    f.ui.setInfo({ ...header, charInfo: f.list });
    f.ui.markServerChoice({ GID: 150004, name: '墨竹', CharNum: 2 });
    const ok = f.root.querySelector('.ok')!;
    const scrolled = f.scrolled.length;
    const key = (which: number) => (f.ui as unknown as { onKeyDown: (this: object, e: object) => void })
      .onKeyDown.call({ _host: { style: {} } }, { which, stopImmediatePropagation() {} });
    key(37); key(37); // the cursor walks back to the first slot
    expect(picked(f.root)).toEqual([f.cardAt(2)]);
    expect(note(f.root)).toBe('服务器指定的角色是 墨竹。');
    expect(ok.classList.contains('lastro-pick-ring')).toBe(false);
    expect(f.scrolled.length).toBe(scrolled);
    key(39); key(39);
    expect(ok.classList.contains('lastro-pick-ring')).toBe(true);
  });

  it('matches by GID first, then name, and ignores unknown characters', () => {
    const f = fixture();
    f.ui.setInfo({ ...header, charInfo: f.list });
    f.ui.markServerChoice({ GID: 150001, name: 'someone else', CharNum: 3 });
    expect(picked(f.root)).toEqual([f.cardAt(0)]);
    f.ui.markServerChoice({ GID: 999999, name: 'Aria', CharNum: 3 });
    expect(picked(f.root)).toEqual([f.cardAt(1)]);
    f.ui.markServerChoice({ GID: 999999, name: 'nobody', CharNum: 3 });
    expect(picked(f.root)).toEqual([]);
    expect(note(f.root)).toBeNull();
  });

  it('clears the mark when asked and when the component is removed', () => {
    const f = fixture();
    f.ui.setInfo({ ...header, charInfo: f.list });
    f.ui.markServerChoice({ GID: 150001, name: '星野', CharNum: 0 });
    f.ui.markServerChoice(null);
    expect(picked(f.root)).toEqual([]);
    expect(note(f.root)).toBeNull();
    expect(f.root.querySelector('.ok')!.classList.contains('lastro-pick-ring')).toBe(false);
    f.ui.markServerChoice({ GID: 150001, name: '星野', CharNum: 0 });
    f.ui.onRemove();
    f.ui.setInfo({ ...header, charInfo: f.list });
    expect(picked(f.root)).toEqual([]);
  });
});

describe('server-picked character wiring', () => {
  it('marks from the ACCEPT_ENTER2 handler without touching the enter-game flow', () => {
    const handler = vendor.slice(vendor.indexOf('function onConnectionAcceptedSingle(pkt)'));
    const body = handler.slice(0, handler.indexOf('\n}\n'));
    expect(body).toContain('SessionStorage_default.Entity = new Player(pkt.entity)');
    expect(body).toContain('Controller$2.getUI()?.markServerChoice?.(pkt.entity)');
    expect(body).not.toMatch(/new PACKET\.CH\.|sendPacket\((?!ping)/);
  });

  it('resets any earlier mark whenever the character server is entered again', () => {
    expect(vendor).toMatch(/Controller\$2\.selectUIVersion\(\);\s*Controller\$1\.selectUIVersion\(\);[\s\S]{0,200}Controller\$2\.getUI\(\)\?\.markServerChoice\?\.\(null\);/);
  });
});
