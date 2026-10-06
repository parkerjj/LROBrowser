import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

const vendor = readFileSync('vendor/v2/Online.js', 'utf8');
const path = 'src/Engine/MapEngine/Skill.js';
function region(source: string, name: string) {
  const start = source.indexOf('//#region ' + name), end = source.indexOf('//#endregion', start);
  if (start < 0 || end < start) throw new Error('Missing native fixture: ' + name);
  return source.slice(start, end + '//#endregion'.length);
}
function parse(source: string) { return ts.createSourceFile('native.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS); }
function one(source: string, predicate: (node: ts.Node, file: ts.SourceFile) => boolean) {
  const file = parse(source), found: ts.Node[] = [];
  function visit(node: ts.Node) { if (predicate(node, file)) found.push(node); ts.forEachChild(node, visit); }
  visit(file);
  if (found.length !== 1) throw new Error('Missing or ambiguous native node');
  return found[0]!.getText(file);
}
function declaration(source: string, name: string) {
  return one(source, node => ts.isFunctionDeclaration(node) && node.name?.text === name);
}
function assignment(source: string, name: string) {
  return one(source, (node, file) => ts.isBinaryExpression(node)
    && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && node.left.getText(file) === name);
}
const native = region(vendor, path);
const engine = region(vendor, 'src/Engine/MapEngine/Entity.js');
const shortcut = region(vendor, 'src/UI/Components/ShortCut/ShortCut.js');
const skillList = region(vendor, 'src/UI/Components/SkillList/SkillListCommon.js');
const selection = region(vendor, 'src/UI/Components/SkillTargetSelection/SkillTargetSelection.js');
const nativeInputs = [declaration(shortcut, 'clickElement'), declaration(shortcut, 'onUseShortCut'),
  assignment(shortcut, 'ShortCut.onShortCut'), assignment(shortcut, 'ShortCut.useSkill'),
  assignment(skillList, 'Component.useSkillID'), assignment(skillList, 'Component.useSkill'),
  assignment(selection, 'SkillTargetSelection.TYPE'), declaration(selection, 'intersectEntity'),
  declaration(selection, 'intersectEntities'), assignment(selection, 'SkillTargetSelection.onMapMouseDown'),
].join(';\n');
const attackNotification = declaration(engine, 'onEntityUseSkillToAttack');

interface Actor {
  GID: number; position: number[]; amotionTick: number; isOverWeight: boolean;
  objecttype: number; action: number; ACTION: Record<string, number>;
  dialog: { set: ReturnType<typeof vi.fn> }; setAction: ReturnType<typeof vi.fn>;
}
interface Request { kind: string; SKID?: number; selectedLevel?: number; targetID?: number; GID?: number; dest: number[]; xPos?: number; yPos?: number; }
interface Skill { SKID: number; level: number; selectedLevel: number; type: number; attackRange: number; }
interface SkillUI {
  onUseSkill(id: number, level: number, target?: number): void;
  useSkillID(id: number, level?: number): void;
  useSkill(skill: Skill, level?: number): void;
  getSkillById(id: number): Skill | undefined;
}
function fixture(source = native, version = 20260901) {
  const createActor = (GID: number): Actor => ({ GID, position: [2, 3], amotionTick: 0,
    isOverWeight: false, objecttype: 0, action: 0, ACTION: { DIE: 1, SIT: 2 },
    dialog: { set: vi.fn() }, setAction: vi.fn() });
  const player = createActor(123), target = createActor(456), homun = createActor(789), merc = createActor(987);
  target.objecttype = 5; target.position = [4, 5];
  const actors = new Map([player, target, homun, merc].map(actor => [actor.GID, actor]));
  const skills = new Map<number, Skill>();
  const send = vi.fn<(request: Request) => void>(), search = vi.fn((_x: number, _y: number,
    _tx: number, _ty: number, _range: number, out: number[]) => { out.push(2, 3); return 1; });
  const SessionStorage_default = { Entity: player, homunId: homun.GID, mercId: merc.GID,
    moveAction: null as Request | null, pet: { friendly: 0 } };
  const Renderer = { tick: 1000 }, hooks = new Map<string, (packet: object) => void>();
  const createPackets = (prefix: string) => new Proxy({} as Record<string, new () => Request>, {
    get: (bag, name: string) => bag[name] ||= class { kind = prefix + name; dest: number[] = []; },
  });
  const PACKET = { CZ: createPackets('CZ.'), ZC: createPackets('ZC.') };
  const ui = { getSkillById: (id: number) => skills.get(id) } as SkillUI;
  const short = { setSkillDelay: vi.fn(), setGlobalSkillDelay: vi.fn() };
  const selector = { remove: vi.fn(), append: vi.fn(), set: vi.fn(), checkMapState: vi.fn(() => false) };
  const messages = vi.fn();
  const context = vm.createContext({ __esmMin: (initialize: () => void) => initialize,
    Renderer, SessionStorage_default, EntityManager: { get: (gid: number) => actors.get(gid), getOverEntity: () => target },
    Controller$4: { getUI: () => ui }, Component: ui, getSkillById: ui.getSkillById,
    SkillInfo: {}, SkillConst_default: { HOMUN_BEGIN: 8000, HOMUN_LAST: 8061,
      MERCENARY_BEGIN: 8200, MERCENARY_LAST: 8242, MC_CHANGECART: 39 },
    Altitude: { TYPE: { WALKABLE: 1 } }, PathFinding_default: { search }, PACKET,
    PacketVerManager_default: { value: version }, Network: {
      sendPacket: send, hookPacket: (type: new () => Request, handler: (packet: object) => void) => hooks.set(new type().kind, handler),
    },
    ShortCut: short, ShortCut_default: short, Guild_default: {},
    SkillListMH_default: { homunculus: {}, mercenary: {} }, SkillTargetSelection: selector, SkillTargetSelection_default: selector,
    Entity: { TYPE_MOB: 5, TYPE_UNIT: 6, TYPE_TRAP: 7, TYPE_HOM: 8, TYPE_MERC: 9, TYPE_PC: 0, TYPE_ELEM: 10 },
    ChatBox_default: { addText: messages, TYPE: { ERROR: 1 }, FILTER: { SKILL_FAIL: 1 } }, DB: { getMessage: (id: number) => String(id) },
    SkillNameDisplayExclude: [], SkillAction: { DEFAULT: vi.fn(() => ({ action: 0 })) },
    Mouse: { intersect: true, world: { x: 6, y: 7 } }, KEYS: {}, Controls_default: { noshift: false },
    _flag: 1, _skill: undefined, _list$1: [], _preferences$19: { size: 0, save: vi.fn() },
  });
  // Execute the complete native skill initializer and packet registrations; only imports/resources are stubbed.
  const file = parse(source);
  function imports(node: ts.Node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text.startsWith('init_'))
      context[node.expression.text] = vi.fn();
    ts.forEachChild(node, imports);
  }
  imports(file);
  vm.runInContext(source + '\ninit_Skill(); SkillEngine();\n' + nativeInputs + ';\n' + attackNotification, context);
  function skill(id: number, type = 1, level = 3) {
    const value = { SKID: id, level, selectedLevel: level, type, attackRange: 3 };
    skills.set(id, value); context._skill = value; return value;
  }
  function attack(actor = player, attackMT = 500) {
    // A real successful-skill notification writes the visual animation lock; missing target avoids resource effects.
    context.attackPacket = { AID: actor.GID, targetID: -1, SKID: 19, attackMT, level: 1, damage: 0 };
    vm.runInContext('onEntityUseSkillToAttack(attackPacket);', context);
  }
  function targetInput(id = 19, via: 'keyboard' | 'mouse' | 'list' | 'direct' = 'direct') {
    const value = skill(id); context._list$1 = [{ ID: id, isSkill: true, count: value.level }];
    context._flag = 1;
    if (via === 'direct') ui.onUseSkill(id, value.level, target.GID);
    else {
      if (via === 'keyboard') vm.runInContext('ShortCut.onShortCut({cmd:"EXECUTE0"});', context);
      if (via === 'mouse') vm.runInContext('onUseShortCut({parentNode:{getAttribute:()=>"0"}});', context);
      if (via === 'list') ui.useSkillID(id, value.level);
      vm.runInContext('SkillTargetSelection.onMapMouseDown({which:1,stopImmediatePropagation(){},preventDefault(){}});', context);
    }
  }
  function groundInput(id = 89) {
    skill(id, 2); context._flag = 2;
    vm.runInContext('SkillTargetSelection.onMapMouseDown({which:1,stopImmediatePropagation(){},preventDefault(){}});', context);
  }
  return { player, target, homun, merc, Renderer, SessionStorage_default, context, send, search, hooks,
    short, ui, selector, messages, skill, attack, targetInput, groundInput };
}

describe('manual skill requests use server timing rather than visual attack locks', () => {
  it.each(['direct', 'keyboard', 'mouse', 'list'] as const)('allows %s target input after a native skill notification', via => {
    const current = fixture(); current.attack(); current.Renderer.tick = 1600; current.targetInput(19, via);
    expect(current.player.amotionTick).toBe(2000);
    expect(current.send).toHaveBeenCalledOnce();
    expect(current.send.mock.calls[0]![0]).toMatchObject({ kind: 'CZ.USE_SKILL2', SKID: 19, selectedLevel: 3, targetID: current.target.GID });
  });
  it('repairs the native mouse ground-target path before the animation lock expires', () => {
    const current = fixture(); current.attack(); current.groundInput();
    expect(current.send.mock.calls[0]![0]).toMatchObject({ kind: 'CZ.USE_SKILL_TOGROUND3', SKID: 89, xPos: 6, yPos: 7 });
  });
  it.each([19, 28, 89, 5001])('is independent of player skill ID %i', id => {
    const f = fixture(); f.attack(); f.targetInput(id); expect(f.send).toHaveBeenCalledOnce();
  });
  it('keeps native self-target selection and level', () => {
    const f = fixture(); f.attack(); const self = f.skill(28, 4, 7);
    f.ui.useSkill(self, 5);
    expect(f.send.mock.calls[0]![0]).toMatchObject({ SKID: 28, selectedLevel: 5, targetID: f.player.GID });
  });
  it.each([20100101, 20180307, 20190904])('keeps version %i targeted and ground packet selection', version => {
    const f = fixture(native, version); f.attack(); f.targetInput(); f.groundInput();
    expect(f.send.mock.calls.map(call => call[0].kind)).toEqual([
      version < 20180307 ? 'CZ.USE_SKILL' : 'CZ.USE_SKILL2',
      version < 20180307 ? 'CZ.USE_SKILL_TOGROUND' : version < 20190904 ? 'CZ.USE_SKILL_TOGROUND2' : 'CZ.USE_SKILL_TOGROUND3',
    ]);
  });
  it.each(['target', 'ground'])('retains %s range movement and pending skill request', kind => {
    const f = fixture(); f.attack();
    f.search.mockImplementation((_x, _y, _tx, _ty, _range, out) => { out.push(2, 3, 4, 5); return 2; });
    if (kind === 'target') f.targetInput(); else f.groundInput();
    expect(f.send.mock.calls[0]![0]).toMatchObject({ kind: 'CZ.REQUEST_MOVE2', dest: [4, 5] });
    expect(f.SessionStorage_default.moveAction?.SKID).toBe(kind === 'target' ? 19 : 89);
  });
  it.each(['target', 'ground'])('retains %s unreachable-path rejection', kind => {
    const f = fixture(); f.attack(); f.search.mockReturnValue(0);
    if (kind === 'target') f.targetInput(); else f.groundInput();
    expect(f.send).not.toHaveBeenCalled();
  });
  it('retains ground-skill overweight rejection', () => {
    const f = fixture(); f.attack(); f.player.isOverWeight = true; f.groundInput();
    expect(f.send).not.toHaveBeenCalled(); expect(f.messages).toHaveBeenCalledWith('243', 1, 1);
    expect(f.search).not.toHaveBeenCalled();
  });
  it.each(['homun', 'merc'] as const)('retains the %s target-skill animation lock and caster', kind => {
    const f = fixture(), actor = f[kind], id = kind === 'homun' ? 8001 : 8201;
    f.attack(actor); f.targetInput(id); expect(f.send).not.toHaveBeenCalled();
    f.Renderer.tick = actor.amotionTick; f.targetInput(id); expect(f.send).toHaveBeenCalledOnce();
    expect(f.search.mock.calls[0]?.slice(0, 2)).toEqual(actor.position);
  });
  it('retains the native homunculus ground-skill animation lock', () => {
    const f = fixture(); f.attack(f.homun); f.groundInput(8001); expect(f.send).not.toHaveBeenCalled();
    f.Renderer.tick = f.homun.amotionTick; f.groundInput(8001); expect(f.send).toHaveBeenCalledOnce();
  });
  it('preserves server post-delay handling without treating the overlay as a send gate', () => {
    const f = fixture(); f.attack();
    f.hooks.get('ZC.SKILL_POSTDELAY')!({ SKID: 19, DelayTM: 100 });
    expect(f.short.setSkillDelay).toHaveBeenCalledWith(19, 100);
    f.Renderer.tick = 1200; f.targetInput(); expect(f.send).toHaveBeenCalledOnce();
  });
  it('retains unlearned and passive skill-list rejection', () => {
    const f = fixture(); f.attack(); f.skill(19, 1, 0); f.ui.useSkillID(19);
    f.skill(28, 0, 5); f.ui.useSkillID(28);
    expect(f.send).not.toHaveBeenCalled(); expect(f.selector.append).not.toHaveBeenCalled();
  });
});
