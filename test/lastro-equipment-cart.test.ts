// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setLastROInnerHTML } from '../src/runtime/lastro-trusted-dom.mjs';

const native = readFileSync('vendor/v2/Online.js', 'utf8');
const commonPath = 'src/UI/Components/Equipment/EquipmentCommon.js';
const versions = [0, 1, 2, 3, 4];
function region(source: string, path: string) {
  const start = source.indexOf('//#region ' + path), end = source.indexOf('//#endregion', start);
  if (start < 0 || end < start) throw new Error('Missing native equipment fixture: ' + path);
  return source.slice(start, end + '//#endregion'.length);
}
function parse(source: string) {
  return ts.createSourceFile('equipment.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
}
function nodeText(source: string, predicate: (node: ts.Node, file: ts.SourceFile) => boolean) {
  const file = parse(source), found: ts.Node[] = [];
  function visit(node: ts.Node) {
    if (predicate(node, file)) found.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (found.length !== 1) throw new Error('Missing or ambiguous native equipment node');
  return found[0]!.getText(file);
}
function template(version: number, kind: 'html' | 'css') {
  const path = `src/UI/Components/Equipment/EquipmentV${version}/EquipmentV${version}.${kind}?raw`;
  const file = parse(region(native, path)), strings: ts.StringLiteral[] = [];
  function visit(node: ts.Node) {
    if (ts.isBinaryExpression(node) && ts.isIdentifier(node.left)
      && node.left.text === `EquipmentV${version}_default$${kind === 'html' ? 2 : 1}`
      && ts.isStringLiteral(node.right)) strings.push(node.right);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (strings.length !== 1) throw new Error('Changed native equipment template');
  // Native CSS contains literal tabs; AST .text also decodes its escaped CRLF.
  return strings[0]!.text;
}
function configuration(version: number) {
  const source = region(native, `src/UI/Components/Equipment/EquipmentV${version}/EquipmentV${version}.js`);
  return nodeText(source, node => ts.isObjectLiteralExpression(node)
    && ts.isCallExpression(node.parent) && node.parent.expression.getText() === 'createEquipment');
}
const common = region(native, commonPath);
const helpers = parse(common).statements.filter(ts.isFunctionDeclaration)
  .filter(node => node.name?.text !== 'createEquipment').map(node => node.getText()).join('\n');
const factory = nodeText(common, node => ts.isFunctionDeclaration(node) && node.name?.text === 'createEquipment');
const handler = nodeText(region(native, 'src/Engine/MapEngine/Entity.js'),
  node => ts.isFunctionDeclaration(node) && node.name?.text === 'onEntityStatusChange');
const stateDefinitions = ['src/DB/Status/StatusConst.js', 'src/DB/Status/StatusState.js', 'src/DB/Items/EquipmentLocation.js']
  .map(path => region(native, path)).join('\n');
const templates = new Map(versions.map(version => [version, template(version, 'html')]));
const styles = new Map(versions.map(version => [version, template(version, 'css')]));
const configurations = new Map(versions.map(version => [version, configuration(version)]));

interface Equipment {
  _host: HTMLElement;
  getRoot(): HTMLElement;
  render(): string;
  init(): void;
  toggle(): void;
}
interface StatusPacket { AID: number; index: number; state?: number; val?: number[]; }
interface Actor {
  GID: number; hasCart: boolean | number; effectState: number; CartNum?: number;
  effectColor: Float32Array; ACTION: { IDLE: number }; renderEntity: ReturnType<typeof vi.fn>;
}
function fixture(version: number) {
  let frame: (() => void) | undefined;
  const entity: Actor = {
    GID: 123, hasCart: false, effectState: 0,
    effectColor: new Float32Array([1, 1, 1, 1]), ACTION: { IDLE: 0 }, renderEntity: vi.fn(),
  };
  const cartHost = document.createElement('div'); cartHost.style.display = 'none';
  const sent = vi.fn(), icons = vi.fn(), blockStatus = vi.fn();
  class GUIComponent {
    _host = document.createElement('div');
    _root = document.createElement('div');
    draggable = vi.fn();
    focus = vi.fn();
    constructor() { this._host.style.display = 'none'; this._host.append(this._root); }
    getRoot() { return this._root; }
  }
  class PreviewEntity {
    static TYPE_PC = 0;
    effectColor = new Float32Array([1, 1, 1, 1]);
    ACTION = { IDLE: 0 };
    set(values: object) { Object.assign(this, values); }
    renderEntity = vi.fn();
  }
  const context = vm.createContext({
    document, window, Float32Array, GUIComponent, Entity: PreviewEntity,
    __esmMin: (init: () => void) => init,
    UIManager: { addComponent: (component: Equipment) => component },
    Preferences: { get: (_name: string, defaults: object) => ({ ...defaults, save: vi.fn() }) },
    UIVersionManager: { getEquipmentVersion: () => version },
    SessionStorage_default: { Entity: entity }, EntityManager: { get: (gid: number) => gid === entity.GID ? entity : null },
    Renderer: { render: (callback: () => void) => { frame = callback; }, stop: vi.fn() },
    SpriteRenderer: { bind2DContext: vi.fn() }, Camera: { direction: 0 },
    WinStatsController: { getUI: () => ({ embed: vi.fn(), unembed: vi.fn(), isEmbedded: () => false }) },
    SwitchEquip_default: { ui: null, toggle: vi.fn() },
    CartItems_default: { _host: cartHost },
    PACKET: { CZ: { REQ_CARTOFF: class {} } }, Network: { sendPacket: sent },
    DB: { INTERFACE_PATH: '', getMessage: (id: number) => String(id), getAllTitles: () => ({}) },
    Client: { loadFile: (_path: string, done: (data: string) => void) => done('data:image/bmp;base64,AA==') },
    GraphicsSettings: { damageSkin: 0, damageMotion: 0, save: vi.fn() },
    StatusIcons_default: { update: icons }, processBlockStatus: blockStatus,
    [`EquipmentV${version}_default$1`]: styles.get(version), [`EquipmentV${version}_default$2`]: templates.get(version),
  });
  vm.runInContext(`${stateDefinitions}\ninit_StatusConst(); init_StatusState(); init_EquipmentLocation();
    ${helpers}\n${factory}\n${handler}
    var equipment = createEquipment(${configurations.get(version)});`, context);
  const component = context.equipment as Equipment;
  setLastROInnerHTML(component.getRoot(), component.render());
  document.body.append(component._host);
  const style = document.createElement('style'); style.textContent = styles.get(version)!; document.head.append(style);
  // jsdom applies document styles, so keep the native markup in document scope.
  // Only canvas drawing is mocked; factory, render closure, CSS and events are native.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
    return { canvas: this, clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
  });
  component.init(); component.toggle();
  const cart = component.getRoot().querySelector<HTMLButtonElement>('.cartitems')!;
  const remove = component.getRoot().querySelector<HTMLButtonElement>('.removeOption')!;
  const effects = vm.runInContext('StatusState_default.EffectState', context) as Record<string, number>;
  const onPushCart = vm.runInContext('StatusConst_default.ON_PUSH_CART', context) as number;
  return {
    component, entity, cart, remove, effects, cartHost, sent, icons, blockStatus,
    frame: () => { if (!frame) throw new Error('Native render not registered'); frame(); },
    status: (values: Omit<StatusPacket, 'AID' | 'index'>) => {
      context.packet = { AID: entity.GID, index: onPushCart, ...values };
      vm.runInContext('onEntityStatusChange(packet);', context);
    },
    display: (button: HTMLElement) => window.getComputedStyle(button).display,
  };
}
afterEach(() => { vi.restoreAllMocks(); document.body.replaceChildren(); document.head.querySelectorAll('style').forEach(style => style.remove()); });

describe('native equipment cart buttons, CSS and render lifecycle', () => {
  it.each(versions)('keeps the cart buttons synchronized with EquipmentV%i state', version => {
    const current = fixture(version);
    current.frame();
    expect(current.display(current.cart)).toBe('none'); expect(current.display(current.remove)).toBe('none');
    current.entity.hasCart = true; current.frame();
    expect(current.display(current.cart)).toBe('block'); expect(current.display(current.remove)).toBe('block');
    current.frame(); // Unchanged-state renders retain the visible buttons.
    expect(current.display(current.cart)).toBe('block');
    current.entity.hasCart = false; current.frame();
    expect(current.display(current.cart)).toBe('none'); expect(current.display(current.remove)).toBe('none');
  });

  it.each(versions)('handles the original ON_PUSH_CART state updates in EquipmentV%i', version => {
    const f = fixture(version);
    f.status({ state: 1, val: [3] });
    expect(f.entity.hasCart).toBe(1); expect(f.entity.CartNum).toBe(3); f.frame();
    expect(f.display(f.cart)).toBe('block'); expect(f.display(f.remove)).toBe('block');
    f.status({ state: 0 }); f.frame();
    expect(f.entity.hasCart).toBe(false); expect(f.display(f.cart)).toBe('none');
    f.status({ val: [5] }); f.frame();
    expect(f.entity.hasCart).toBe(true); expect(f.entity.CartNum).toBe(5); expect(f.display(f.cart)).toBe('block');
    expect(f.icons).toHaveBeenCalledTimes(3); expect(f.blockStatus).toHaveBeenCalledTimes(3);
    expect(f.sent).not.toHaveBeenCalled();
  });

  it.each(versions)('keeps legacy CART1–5 and other attachment conditions in EquipmentV%i', version => {
    const f = fixture(version);
    for (const name of ['CART1', 'CART2', 'CART3', 'CART4', 'CART5']) {
      f.entity.effectState = f.effects[name]!; f.frame();
      expect(f.display(f.cart), name).toBe('block'); expect(f.display(f.remove), name).toBe('block');
    }
    for (const name of ['FALCON', 'RIDING', 'DRAGON1', 'MADOGEAR']) {
      f.entity.effectState = f.effects[name]!; f.frame();
      expect(f.display(f.cart), name).toBe('none'); expect(f.display(f.remove), name).toBe('block');
    }
    f.entity.effectState = 0; f.frame();
    expect(f.display(f.cart)).toBe('none'); expect(f.display(f.remove)).toBe('none');
    f.entity.effectState = f.effects.SIGHT!; f.frame();
    expect(f.display(f.cart)).toBe('none'); expect(f.display(f.remove)).toBe('none');
  });

  it.each([0, 4])('opens the existing CartItems window and retains cart-off action in EquipmentV%i', version => {
    const f = fixture(version);
    f.status({ state: 1 }); f.frame();
    f.cart.click(); expect(f.cartHost.style.display).toBe('');
    f.cart.click(); expect(f.cartHost.style.display).toBe('none');
    expect(f.sent).not.toHaveBeenCalled();
    f.remove.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); expect(f.sent).toHaveBeenCalledTimes(1);
    // Original onCartItems gate checks strict false; this patch does not alter it.
    f.entity.hasCart = false; f.frame(); f.cart.click(); expect(f.cartHost.style.display).toBe('none');
  });
});
