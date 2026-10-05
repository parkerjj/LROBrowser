import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import { patchRuntimeEntitySync } from '../scripts/lastro-entity-sync.mjs';

const vendor = readFileSync(new URL('../vendor/v2/Online.js', import.meta.url), 'utf8');
function region(name: string) {
  const start = vendor.indexOf(`//#region ${name}`), end = vendor.indexOf('//#endregion', start);
  if (start < 0 || end < 0) throw new Error(name);
  return vendor.slice(start, end + '//#endregion'.length);
}
// Parse each small native module once; never parse the entire runtime per case.
const parsed = new Map<string, ts.SourceFile>();
function file(name: string, source = region(name)) {
  if (!parsed.has(name)) parsed.set(name, ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS));
  return parsed.get(name)!;
}
function declaration(name: string, fn: string, source?: string) {
  const ast = file(name, source);
  const matches = ast.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === fn);
  if (matches.length !== 1) throw new Error(fn);
  return matches[0]!.getText(ast);
}
const engineName = 'src/Engine/MapEngine/Entity.js';
const patchedEngine = patchRuntimeEntitySync(region(engineName));
const entityAst = file('src/Renderer/Entity/Entity.js');
let entityClass: ts.ClassExpression | undefined;
const prototypes: string[] = [];
function visitEntity(node: ts.Node) {
  if (ts.isClassExpression(node) && node.name?.text === 'Entity') entityClass = node;
  if (ts.isExpressionStatement(node) && ts.isBinaryExpression(node.expression)
    && node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken
    && node.expression.left.getText(entityAst).startsWith('Entity.prototype.')) prototypes.push(node.getText(entityAst));
  ts.forEachChild(node, visitEntity);
}
visitEntity(entityAst);
if (!entityClass) throw new Error('Native Entity class');
const staticFields = entityClass.members.filter(node => ts.isPropertyDeclaration(node)
  && node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword)).map(node => node.getText(entityAst));
const methods = ['set', 'clean', 'remove'].map(name => {
  const matches = entityClass!.members.filter(node => ts.isMethodDeclaration(node) && node.name.getText(entityAst) === name);
  if (matches.length !== 1) throw new Error(name);
  return matches[0]!.getText(entityAst);
});
const actionName = 'src/Renderer/Entity/EntityAction.js';
const actionCode = ['Action', 'Animation', 'setAction', 'Init$10'].map(name => declaration(actionName, name)).join('\n');
const managerCode = region('src/Renderer/EntityManager.js');
const handlerCode = ['onEntitySpam', 'onEntityResurect'].map(name => declaration(engineName, name)).join('\n');

interface CorpseEntity {
  GID: number; objecttype: number; action: number; ACTION: Record<string, number>;
  position: Float32Array; remove_tick: number; remove_delay: number; gr2Model: unknown;
  animation: { repeat: boolean }; render: ReturnType<typeof vi.fn>;
  set(packet: Record<string, unknown>): void; remove(type: number): void; clean(): void;
}
function fixture(native = false) {
  let now = 10000;
  const component = () => ({ clean: vi.fn(), free: vi.fn(), remove: vi.fn(), load: vi.fn(),
    update: vi.fn(), hp: -1, hp_max: -1 });
  const SessionStorage_default = { Entity: null as CorpseEntity | null, AdminList: [] };
  const Escape_default = { showDeathMenu: vi.fn(), resetMenu: vi.fn() };
  const renderBindings = { bind3DContext: vi.fn(), unbind: vi.fn() };
  const context = vm.createContext({
    Date: class extends Date { static now() { return now; } },
    Float32Array, Int16Array, Uint8Array, Map, console, component, mockFn: vi.fn,
    SessionStorage_default, Escape_default, Renderer: { tick: now },
    __exportAll: (value: unknown) => value,
    __esmMin: (callback: () => void) => { let loaded = false; return () => { if (!loaded) { loaded = true; callback(); } }; },
    init_SessionStorage() {}, init_Entity$1() {}, init_SpriteRenderer() {}, init_MouseEventHandler() {},
    init_KeyEventHandler() {}, init_PathFinding() {}, init_Graphics() {}, init_Altitude() {}, init_GR2ModelRenderer() {},
    Client: { loadFile: vi.fn() }, Altitude: { getCellHeight: (x: number, y: number) => x + y },
    EffectManager: { remove: vi.fn(), spam: vi.fn() },
    EffectConst_default: { EF_DEVIL: 1 }, StatusState_default: { EffectState: { INVISIBLE: 1, FALCON: 2, WUG: 4 } },
    HomunInformations_default: { stopAI: vi.fn() }, MercenaryInformations_default: { stopAI: vi.fn() },
    PacketVerManager_default: { value: 20211103 },
    DB: { getWeaponAction: () => 0, getWeaponType: () => 0, getWeaponViewID: () => 0,
      isShield: () => true, isAssassin: () => false, isKatar: () => false, isHunter: () => false },
    GraphicsSettings: { performanceMode: false }, SpriteRenderer: renderBindings,
    GR2ModelRenderer_default: { detach: vi.fn() },
    Events: { setTimeout: vi.fn() }, C_DEATH_SYNC_OFFSET: 200, haveSiegfriedItem: () => false,
    KEYS: { SHIFT: false }, Mouse: { screen: { x: 0, y: 0 } },
    PACKET: { ZC: new Proxy({}, { get: () => function NativePacket() {} }) }, clanEmblems: {},
  });
  vm.runInContext(`
${actionCode}
class Entity {
  ${staticFields.join('\n')}
  constructor(packet) {
    this.position = new Float32Array([0,0,0]); this.depth=0; this.gr2Model=null;
    this.files={shadow:{spr:'shadow.spr',act:'shadow.act'}}; this.walk={speed:150};
    this._job=1002; this._sex=0; this.sound=component();
    for (const key of ['life','emblem','display','dialog','cast','room','attachments','animations','aura','dropEffect']) this[key]=component();
    this.render=mockFn(); Init$10.call(this); if (packet) this.set(packet);
  }
  ${methods.join('\n')}
}
${prototypes.join('\n')}
${managerCode}
init_EntityManager();
${handlerCode}
${declaration(native ? engineName : 'patched/MapEngine/Entity.js', 'onEntityVanish', native ? undefined : patchedEngine)}
`, context);
  const handlers = vm.runInContext('({ vanish:onEntityVanish, resurrect:onEntityResurect, spawn:onEntitySpam })', context) as {
    vanish(packet: { GID: number; type: number }): void;
    resurrect(packet: { AID: number }): void;
    spawn(packet: Record<string, unknown>): void;
  };
  const manager = vm.runInContext('EntityManager', context) as {
    get(gid: number): CorpseEntity | null; add(entity: CorpseEntity): CorpseEntity;
    forEach(callback: (entity: CorpseEntity) => void): void; free(): void;
    render(...args: unknown[]): void; storeLife(gid: number, values: Record<string, number>): void;
    getLife(gid: number): Record<string, number> | null;
  };
  function create(gid: number, objecttype = 0) {
    context.createPacket = { GID: gid, objecttype, job: 1002, PosDir: [4, 5, 0], state: 0 };
    return vm.runInContext('new Entity(createPacket)', context) as CorpseEntity;
  }
  const owner = create(999); manager.add(owner); SessionStorage_default.Entity = owner;
  const other = create(123); manager.add(other);
  return { context, manager, handlers, owner, other, Escape_default, SessionStorage_default,
    list() { const values: CorpseEntity[] = []; manager.forEach(entity => { values.push(entity); }); return values; },
    advance(time: number) { now = time; manager.render({}, {}, {}, {}, false); },
    create,
    respawn(gid = 123) { handlers.spawn({ GID: gid, objecttype: 0, job: 1002, PosDir: [8, 9, 0], state: 0 }); },
  };
}

describe('native player corpse lifecycle with the real entity manager', () => {
  it('reproduces a remote corpse orphaned from lookup while remaining rendered after resurrection and departure', () => {
    const f = fixture(true); f.handlers.vanish({ GID: 123, type: 1 });
    expect(f.manager.get(123)).toBeNull(); expect(f.list()).toContain(f.other);
    f.handlers.resurrect({ AID: 123 }); f.handlers.vanish({ GID: 123, type: 0 });
    f.advance(100000); expect(f.other.action).toBe(f.other.ACTION.DIE); expect(f.other.remove_tick).toBe(0);
    expect(f.list()).toContain(f.other); expect(f.other.render).toHaveBeenCalledOnce();
  });

  it('reproduces a second rendered actor when the native orphaned GID enters again', () => {
    const f = fixture(true); f.handlers.vanish({ GID: 123, type: 1 }); f.respawn();
    const copies = f.list().filter(entity => entity.GID === 123);
    expect(copies).toHaveLength(2); expect(f.manager.get(123)).not.toBe(f.other);
    f.advance(20000); expect(copies[0]!.render).toHaveBeenCalledOnce(); expect(copies[1]!.render).toHaveBeenCalledOnce();
  });

  it('retains the remote dead player for server lifecycle packets without adding a corpse expiration', () => {
    const f = fixture(); f.manager.storeLife(123, { hp: 100, hp_max: 100 });
    f.handlers.vanish({ GID: 123, type: 1 });
    expect(f.manager.get(123)).toBe(f.other); expect(f.other.action).toBe(f.other.ACTION.DIE);
    expect(f.other.animation.repeat).toBe(true); expect(f.other.remove_tick).toBe(0); expect(f.other.remove_delay).toBe(0);
    expect(f.manager.getLife(123)).toBeNull(); f.advance(100000);
    expect(f.list()).toContain(f.other); expect(f.manager.get(123)).toBe(f.other);
  });

  it('revives the same remote player entity in place without retaining another corpse', () => {
    const f = fixture(); f.handlers.vanish({ GID: 123, type: 1 }); f.handlers.resurrect({ AID: 123 });
    expect(f.other.action).toBe(f.other.ACTION.IDLE); expect(f.manager.get(123)).toBe(f.other);
    expect(f.list().filter(entity => entity.GID === 123)).toEqual([f.other]);
    expect(f.Escape_default.resetMenu).not.toHaveBeenCalled();
  });

  it.each([0, 2, 3])('cleans a dead remote player on server vanish type %s and completes native render removal', type => {
    const f = fixture(); f.handlers.vanish({ GID: 123, type: 1 }); f.handlers.vanish({ GID: 123, type });
    expect(f.manager.get(123)).toBeNull(); expect(f.other.GID).toBe(-1); expect(f.other.remove_tick).toBe(10000);
    expect(f.other.remove_delay).toBe(type === 0 ? 1000 : 0);
    f.advance(11001); expect(f.list()).toEqual([f.owner]); expect(f.other.render).not.toHaveBeenCalled();
  });

  it('updates a re-entering same GID player instead of adding a duplicate rendered actor', () => {
    const f = fixture(); f.handlers.vanish({ GID: 123, type: 1 }); f.respawn();
    expect(f.manager.get(123)).toBe(f.other); expect(f.other.action).toBe(f.other.ACTION.IDLE);
    expect(Array.from(f.other.position)).toEqual([8, 9, 17]);
    expect(f.list().filter(entity => entity.GID === 123)).toEqual([f.other]);
    f.advance(20000); expect(f.other.render).toHaveBeenCalledOnce();
  });

  it('keeps repeated DEAD packets idempotent and still accepts the following resurrection', () => {
    const f = fixture(); f.handlers.vanish({ GID: 123, type: 1 }); f.handlers.vanish({ GID: 123, type: 1 });
    expect(f.manager.get(123)).toBe(f.other); expect(f.list()).toHaveLength(2);
    f.handlers.resurrect({ AID: 123 }); expect(f.other.action).toBe(f.other.ACTION.IDLE);
  });

  it('preserves the current player death menu and in-place resurrection', () => {
    const f = fixture(); f.handlers.vanish({ GID: 999, type: 1 });
    expect(f.manager.get(999)).toBe(f.owner); expect(f.owner.action).toBe(f.owner.ACTION.DIE);
    expect(f.Escape_default.showDeathMenu).toHaveBeenCalledWith(false);
    f.handlers.resurrect({ AID: 999 }); expect(f.owner.action).toBe(f.owner.ACTION.IDLE);
    expect(f.Escape_default.resetMenu).toHaveBeenCalledOnce(); expect(f.list()).toHaveLength(2);
  });

  it('preserves native monster death fading and removal from both lookup and render list', () => {
    const f = fixture(), monster = f.create(456, 5); f.manager.add(monster);
    f.handlers.vanish({ GID: 456, type: 1 });
    expect(f.manager.get(456)).toBeNull(); expect(monster.remove_tick).toBe(10000); expect(monster.remove_delay).toBe(5000);
    f.advance(12000); expect(f.list()).toContain(monster); expect(monster.render).toHaveBeenCalledOnce();
    f.advance(15001); expect(f.list()).not.toContain(monster); expect(f.manager.get(123)).toBe(f.other);
  });

  it('cleans retained player corpses during the native map manager free lifecycle', () => {
    const f = fixture(); f.handlers.vanish({ GID: 123, type: 1 }); f.manager.free();
    expect(f.list()).toHaveLength(0); expect(f.other.GID).toBe(-1); expect(f.owner.GID).toBe(-1);
    expect(f.manager.get(123)).toBeNull(); expect(f.manager.get(999)).toBeNull();
    f.advance(20000); expect(f.other.render).not.toHaveBeenCalled();
  });
});
