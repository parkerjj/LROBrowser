import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import { createLastroMonsterHoverHp, patchRuntimeMonsterHoverHp } from '../scripts/lastro-monster-hover-hp.mjs';

const entityTypes = { TYPE_PC: 0, TYPE_DISGUISED: 1, TYPE_MOB: 5, TYPE_NPC: 6, TYPE_PET: 7, TYPE_NPC_ABR: 13, TYPE_NPC_BIONIC: 14 };
const unknownHp = '';
interface Life { hp: number; hp_max: number; display?: boolean; update?: () => void; }
interface MonsterEntity {
  GID: number; objecttype: number; constructor: typeof entityTypes; life: Life;
  display?: { name: string; fakename: string; refresh?: (entity: MonsterEntity) => void };
}
interface Entry { hp?: unknown; maxhp?: unknown; }
function fixture() {
  const entities = new Map<number, MonsterEntity>(), cache = new Map<number, Life>();
  let tick = 10000;
  const state = createLastroMonsterHoverHp({ getEntity: (gid: number) => entities.get(gid), getLife: (gid: number) => cache.get(gid), now: () => tick });
  const notify = (gid: number, hp: number, maxhp: number) => {
    const data = cache.get(gid) ?? { hp: -1, hp_max: -1 };
    data.hp = hp; data.hp_max = maxhp; cache.set(gid, data);
    const entity = entities.get(gid);
    if (entity) { entity.life.hp = hp; entity.life.hp_max = maxhp; }
    state.update(gid, hp, maxhp);
  };
  const spawn = (gid = 123, pkt: Entry = {}, objecttype = entityTypes.TYPE_MOB) => {
    const entity: MonsterEntity = { GID: gid, objecttype, constructor: entityTypes, life: { hp: -1, hp_max: -1 },
      display: { name: '波利 (Lv.1|HP:50%)', fakename: '', refresh: vi.fn() } };
    // Native onEntitySpam stores a new entity, then may restore its Life cache.
    entities.set(gid, entity);
    const old = cache.get(gid);
    if (old) { entity.life.hp = old.hp; entity.life.hp_max = old.hp_max; }
    state.spawn(entity, pkt as Parameters<typeof state.spawn>[1]);
    return entity;
  };
  return { entities, cache, state, notify, spawn, setNow: (value: number) => { tick = value; } };
}

describe('monster hover HP provenance and explicit percentage estimates', () => {
  it('does not treat an initialized Life bar or name percentage as actual HP', () => {
    const f = fixture(), entity = f.spawn();
    expect(f.state.text(entity)).toBe(unknownHp);
    entity.life.hp = 50; entity.life.hp_max = 100;
    f.cache.set(entity.GID, { hp: 50, hp_max: 100 });
    expect(f.state.text(entity)).toBe(unknownHp);
    f.state.spawn(entity, {}); expect(f.state.text(entity)).toBe(unknownHp);
  });

  it('tracks exact updates, zero HP and real maximum 100 without deriving values from damage', () => {
    const f = fixture(), entity = f.spawn();
    f.notify(entity.GID, 80, 100); expect(f.state.text(entity)).toBe('80 / 100');
    entity.life.hp = 60; // Damage animation and Life fields are not an exact-HP source.
    expect(f.state.text(entity)).toBe('80 / 100');
    f.notify(entity.GID, 20, 100); expect(f.state.text(entity)).toBe('20 / 100');
    f.notify(entity.GID, 0, 100); expect(f.state.text(entity)).toBe('0 / 100');
    expect(entity.display?.name).toBe('波利 (Lv.1|HP:50%)');
  });

  it('accepts authoritative entry fields without writing into native Life metadata', () => {
    const f = fixture(), entity = f.spawn(123, { hp: 1250, maxhp: 2000 });
    expect(f.state.text(entity)).toBe('1.25k / 2k');
    expect(entity.life).toEqual({ hp: -1, hp_max: -1 });
    expect(f.cache.has(123)).toBe(false);
    f.state.spawn(entity, {}); expect(f.state.text(entity)).toBe('1.25k / 2k');
    f.state.spawn(entity, { hp: 750, maxhp: 2000 }); expect(f.state.text(entity)).toBe('750 / 2k');
  });

  it('restores an exact notification received before entity creation only from its marked native cache', () => {
    const f = fixture(); f.notify(123, 1500, 2500);
    const entity = f.spawn(); expect(f.state.text(entity)).toBe('1.5k / 2.5k');
    expect(Object.getOwnPropertySymbols(f.cache.get(123)!)).toHaveLength(0);
    f.state.spawn(entity, { hp: 400, maxhp: 2500 }); expect(f.state.text(entity)).toBe('400 / 2.5k');
  });

  it('treats paired -1 entry values as an unreported sentinel rather than an invalid real value', () => {
    const f = fixture(); f.notify(123, 1500, 2500);
    const entity = f.spawn(123, { hp: -1, maxhp: -1 });
    expect(f.state.text(entity)).toBe('1.5k / 2.5k');
    f.state.spawn(entity, { hp: -1, maxhp: -1 });
    expect(f.state.text(entity)).toBe('1.5k / 2.5k');
    expect(f.state.text(f.spawn(456, { hp: -1, maxhp: -1 }))).toBe(unknownHp);
  });

  it('estimates Tiny values only from a confirmed maximum, including before entity creation', () => {
    const f = fixture(), entity = f.spawn(); f.notify(123, 1000, 2000);
    entity.life.hp = 25; entity.life.hp_max = 100;
    f.cache.get(123)!.hp = 25; f.cache.get(123)!.hp_max = 100;
    f.state.tiny(123, 5); expect(f.state.text(entity)).toBe('500 / 2k');
    f.state.spawn(entity, {}); expect(f.state.text(entity)).toBe('500 / 2k');
    f.notify(123, 900, 2000); expect(f.state.text(entity)).toBe('900 / 2k');
    f.notify(456, 800, 1600); f.state.tiny(456, 5);
    expect(f.state.text(f.spawn(456))).toBe('400 / 1.6k');
    const unknown = f.spawn(789); unknown.life.hp = 25; unknown.life.hp_max = 100;
    f.state.tiny(789, 5); expect(f.state.text(unknown)).toBe('');
  });

  it('hides the numeric row until a trusted maximum arrives, even when a percentage is known', () => {
    const f = fixture(), entity = f.spawn();
    expect(f.state.text(entity)).toBe('');
    f.state.tiny(123, 0); expect(f.state.text(entity)).toBe('');
    f.state.tiny(123, 20); expect(f.state.text(entity)).toBe('');
    entity.life.hp_max = 5000; f.cache.set(123, { hp: 3000, hp_max: 5000 });
    f.state.tiny(123, 3); expect(f.state.text(entity)).toBe('');
    f.notify(123, 3000, 5000); expect(f.state.text(entity)).toBe('3k / 5k');
    f.state.tiny(123, 3); expect(f.state.text(entity)).toBe('750 / 5k');
  });

  it('rounds estimates and restores the same original exact pair on a complete update or entry', () => {
    const f = fixture(), entity = f.spawn(123, { hp: 701, maxhp: 1001 });
    f.state.tiny(123, 10); expect(f.state.text(entity)).toBe('501 / 1k');
    f.notify(123, 701, 1001); expect(f.state.text(entity)).toBe('701 / 1k');
    f.state.tiny(123, 10); expect(f.state.text(entity)).toBe('501 / 1k');
    f.state.spawn(entity, { hp: 701, maxhp: 1001 }); expect(f.state.text(entity)).toBe('701 / 1k');
    f.state.tiny(123, 0); expect(f.state.text(entity)).toBe('0 / 1k');
    f.state.tiny(123, 20); expect(f.state.text(entity)).toBe('1k / 1k');
  });

  it.each([
    ['Mob (HP:0%)', '0 / 5k'], ['Mob (HP:100%)', '5k / 5k'],
    ['Mob (hp : 37.5 %)', '1.88k / 5k'], ['Mob (HP：80%)', '4k / 5k'],
  ])('uses a confirmed-name percentage immediately without Tiny: %s', (rawName, text) => {
    const f = fixture(), entity = f.spawn(123, { hp: 3500, maxhp: 5000 });
    f.state.name(entity, rawName); expect(f.state.text(entity)).toBe(text);
    expect(entity.display?.name).toBe('波利 (Lv.1|HP:50%)');
  });

  it('keeps fresh Tiny primary and falls back to a later name only at the two-second boundary', () => {
    const f = fixture(), entity = f.spawn(123, { hp: 3500, maxhp: 5000 });
    f.state.tiny(123, 5); f.state.name(entity, 'Mob (HP:90%)');
    expect(f.state.text(entity)).toBe('1.25k / 5k');
    f.setNow(11999); expect(f.state.text(entity)).toBe('1.25k / 5k');
    f.setNow(12000); expect(f.state.text(entity)).toBe('4.5k / 5k');
    // The same percentage is a new server sample, even if its text is identical.
    f.setNow(12001); f.state.tiny(123, 5); f.state.name(entity, 'Mob (HP:90%)');
    expect(f.state.text(entity)).toBe('1.25k / 5k');
    f.setNow(14000); expect(f.state.text(entity)).toBe('1.25k / 5k');
    f.setNow(14001); expect(f.state.text(entity)).toBe('4.5k / 5k');
  });

  it('does not revive an older name after Tiny expires, including packets received in the same millisecond', () => {
    const f = fixture(), entity = f.spawn(123, { hp: 3500, maxhp: 5000 });
    f.state.name(entity, 'Mob (HP:90%)'); f.state.tiny(123, 5);
    f.setNow(20000); expect(f.state.text(entity)).toBe('1.25k / 5k');
    f.state.name(entity, 'Mob (HP:80%)'); expect(f.state.text(entity)).toBe('4k / 5k');
    f.state.tiny(123, 7); expect(f.state.text(entity)).toBe('1.75k / 5k');
    f.setNow(30000); expect(f.state.text(entity)).toBe('1.75k / 5k');
  });

  it('clears both percentage sources when the same complete HP pair is freshly confirmed', () => {
    const f = fixture(), entity = f.spawn(123, { hp: 3500, maxhp: 5000 });
    f.state.tiny(123, 5); f.state.name(entity, 'Mob (HP:90%)');
    f.setNow(12000); expect(f.state.text(entity)).toBe('4.5k / 5k');
    f.notify(123, 3500, 5000); f.setNow(20000); expect(f.state.text(entity)).toBe('3.5k / 5k');
    f.state.name(entity, 'Mob (HP:80%)'); expect(f.state.text(entity)).toBe('4k / 5k');
    f.state.spawn(entity, { hp: 3500, maxhp: 5000 });
    f.setNow(30000); expect(f.state.text(entity)).toBe('3.5k / 5k');
  });

  it.each(['HP:-1%', 'HP:101%', 'HP:NaN%', 'HP:Infinity%', 'HP:1.2.3%', 'myHP:50%', 'HP:50', '', null, undefined])('ignores invalid original names %j without replacing a valid estimate', rawName => {
    const f = fixture(), entity = f.spawn(123, { hp: 3500, maxhp: 5000 });
    f.state.name(entity, 'Mob (HP:80%)'); f.state.name(entity, rawName);
    expect(f.state.text(entity)).toBe('4k / 5k');
  });

  it('hides names without a confirmed maximum and ignores display aliases and retired identities', () => {
    const f = fixture(), entity = f.spawn();
    entity.life.hp = 25; entity.life.hp_max = 100;
    f.state.name(entity, 'Mob (HP:80%)'); expect(f.state.text(entity)).toBe('');
    f.notify(123, 3500, 5000); expect(f.state.text(entity)).toBe('3.5k / 5k');
    entity.display!.fakename = 'Alias (HP:90%)'; expect(f.state.text(entity)).toBe('3.5k / 5k');
    f.state.name(entity, 'Mob (HP:80%)'); expect(f.state.text(entity)).toBe('4k / 5k');
    const reused = f.spawn(); f.state.name(entity, 'Old (HP:100%)');
    expect(f.state.text(entity)).toBe(''); expect(f.state.text(reused)).toBe('');
    f.notify(123, 3500, 5000); expect(f.state.text(reused)).toBe('3.5k / 5k');
  });

  it('clears name fallback data on removal and map epochs without transferring it to a new GID owner', () => {
    const f = fixture(), entity = f.spawn(123, { hp: 3500, maxhp: 5000 });
    f.state.name(entity, 'Mob (HP:80%)'); f.state.remove(123);
    expect(f.state.text(entity)).toBe(''); f.notify(123, 3500, 5000);
    expect(f.state.text(entity)).toBe('3.5k / 5k');
    f.state.name(entity, 'Mob (HP:80%)'); f.state.clear();
    expect(f.state.text(entity)).toBe(''); f.state.spawn(entity, {});
    expect(f.state.text(entity)).toBe('');
    f.notify(123, 3500, 5000); expect(f.state.text(entity)).toBe('3.5k / 5k');
  });

  it('claims percentage-only pending data without treating its native 100 scale as a real maximum', () => {
    const f = fixture(); f.cache.set(123, { hp: 25, hp_max: 100 }); f.state.tiny(123, 5);
    const life = f.cache.get(123)!;
    expect(Object.getOwnPropertySymbols(life)).toHaveLength(1);
    const entity = f.spawn(123, { hp: -1, maxhp: -1 });
    expect(f.state.text(entity)).toBe(''); expect(Object.getOwnPropertySymbols(life)).toHaveLength(0);
    f.state.tiny(123, 7); expect(f.state.text(entity)).toBe('');
    f.state.spawn(entity, { hp: 50, maxhp: 100 }); expect(f.state.text(entity)).toBe('50 / 100');
    f.state.tiny(123, 7); expect(f.state.text(entity)).toBe('35 / 100');
  });

  it.each([-1, 21, 255, 1.5, NaN, Infinity, null, '5', undefined])('ignores invalid or absent Tiny raw units %j without replacing a confirmed or estimated value', units => {
    const f = fixture(), entity = f.spawn(123, { hp: 500, maxhp: 2000 });
    f.state.tiny(123, units); expect(f.state.text(entity)).toBe('500 / 2k');
    f.state.tiny(123, 5); expect(f.state.text(entity)).toBe('500 / 2k');
    f.state.tiny(123, units); expect(f.state.text(entity)).toBe('500 / 2k');
    const unknown = f.spawn(456); f.state.tiny(456, units); expect(f.state.text(unknown)).toBe('');
  });

  it('does not let estimates or percentage pending values cross GID reuse, removal or a map epoch', () => {
    const f = fixture(), old = f.spawn(123, { hp: 500, maxhp: 1000 });
    f.state.tiny(123, 5); expect(f.state.text(old)).toBe('250 / 1k');
    const reused = f.spawn(); expect(f.state.text(old)).toBe(''); expect(f.state.text(reused)).toBe('');
    f.state.tiny(123, 5); expect(f.state.text(reused)).toBe('');
    f.state.remove(123); expect(f.state.text(reused)).toBe('');
    f.cache.set(456, { hp: 25, hp_max: 100 }); f.state.tiny(456, 5); f.state.remove(456);
    expect(f.state.text(f.spawn(456))).toBe('');
    f.notify(789, 500, 1000); f.state.tiny(789, 5);
    f.cache.set(999, { hp: 25, hp_max: 100 }); f.state.tiny(999, 5);
    f.state.clear(); expect(f.state.text(f.spawn(789))).toBe(''); expect(f.state.text(f.spawn(999))).toBe('');
  });

  it.each([
    [-1, 100], [1, 0], [1, -1], [101, 100], [NaN, 100], [10, Infinity],
    [1.5, 100], [1, 100.5], [Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER + 1],
  ])('rejects invalid exact values %j / %j and retires an earlier valid snapshot', (hp, maxhp) => {
    const f = fixture(), entity = f.spawn(); f.notify(123, 50, 100);
    f.notify(123, hp, maxhp); expect(f.state.text(entity)).toBe(unknownHp);
    f.state.spawn(entity, {}); expect(f.state.text(entity)).toBe(unknownHp);
  });

  it.each([{ hp: -1, maxhp: 100 }, { hp: 1 }, { maxhp: 100 }, { hp: undefined, maxhp: 100 }, { hp: '50', maxhp: 100 }])('does not fall back to cached values when explicit entry fields are invalid: %j', pkt => {
      const f = fixture(); f.notify(123, 50, 100);
      expect(f.state.text(f.spawn(123, pkt))).toBe(unknownHp);
    });

  it('does not transfer an old live-entity snapshot to a reused GID', () => {
    const f = fixture(), first = f.spawn(); f.notify(123, 500, 1000);
    const second = f.spawn();
    expect(f.state.text(first)).toBe(unknownHp); expect(f.state.text(second)).toBe(unknownHp);
    f.notify(123, 400, 800); expect(f.state.text(second)).toBe('400 / 800');
    expect(f.state.text(first)).toBe(unknownHp);
  });

  it('removes exact and pending data when a GID disappears', () => {
    const f = fixture(), entity = f.spawn(); f.notify(123, 500, 1000);
    f.state.remove(123); expect(f.state.text(entity)).toBe(unknownHp);
    expect(f.state.text(f.spawn())).toBe(unknownHp);
    f.notify(456, 400, 800); f.state.remove(456);
    expect(f.state.text(f.spawn(456))).toBe(unknownHp);
  });

  it('uses a new epoch after clearing and does not revive old cache markers', () => {
    const f = fixture(), old = f.spawn(); f.notify(123, 500, 1000); f.notify(456, 400, 800);
    f.state.clear(); expect(f.state.text(old)).toBe(unknownHp);
    expect(f.state.text(f.spawn())).toBe(unknownHp); expect(f.state.text(f.spawn(456))).toBe(unknownHp);
    f.notify(123, 600, 1000); expect(f.state.text(f.entities.get(123)!)).toBe('600 / 1k');
  });

  it.each([entityTypes.TYPE_PC, entityTypes.TYPE_DISGUISED, entityTypes.TYPE_NPC, entityTypes.TYPE_PET, entityTypes.TYPE_NPC_ABR, entityTypes.TYPE_NPC_BIONIC])('does not expose monster HP text for other entity type %i', type => {
      const f = fixture(), entity = f.spawn(123, { hp: 500, maxhp: 1000 }, type);
      f.notify(123, 500, 1000); f.state.name(entity, 'Other (HP:80%)'); expect(f.state.text(entity)).toBe('');
      expect(entity.display?.name).toBe('波利 (Lv.1|HP:50%)');
      expect(entity.display?.refresh).not.toHaveBeenCalled();
    });

  it.each([
    [0, 999, '0 / 999'], [999, 999, '999 / 999'], [1000, 1200, '1k / 1.2k'],
    [1005, 1050, '1.01k / 1.05k'], [1234, 10000, '1.23k / 10k'], [999999, 1000000, '1000k / 1m'],
    [1000000, 1250000, '1m / 1.25m'], [1000000000, 4294967295, '1b / 4.29b'],
  ] as const)('formats %i / %i as %s', (hp, maxhp, text) => {
    const f = fixture(), entity = f.spawn(123, { hp, maxhp }); expect(f.state.text(entity)).toBe(text);
  });
});

// Reuse ASTs for the three patched regions and extract native mouse callbacks
// from one small control region. The full vendor is sliced, never parsed.
const vendor = readFileSync(new URL('../vendor/v2/Online.js', import.meta.url), 'utf8');
const paths = ['src/Renderer/Entity/EntityDisplay.js', 'src/Renderer/EntityManager.js', 'src/Engine/MapEngine/Entity.js'] as const;
function region(source: string, name: string) {
  const start = source.indexOf('//#region ' + name), end = source.indexOf('//#endregion', start);
  if (start < 0 || end <= start) throw new Error('Missing native region: ' + name);
  return source.slice(start, end + '//#endregion'.length);
}
const native = paths.map(name => region(vendor, name)).join('\n');
const parse = (source: string) => ts.createSourceFile('Hover.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const nativeAst = parse(native);
const patched = patchRuntimeMonsterHoverHp(native), patchedAst = parse(patched);
function declarations(file: ts.SourceFile, className = 'Display') {
  const functions: Record<string, string> = {}, methods: Record<string, string> = {};
  const variables: Record<string, string> = {};
  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name) functions[node.name.text] = node.getText(file);
    if (ts.isMethodDeclaration(node) && ts.isClassExpression(node.parent)
      && ts.isBinaryExpression(node.parent.parent) && node.parent.parent.left.getText(file) === className) {
      methods[node.name.getText(file)] = node.getText(file);
    }
    if (ts.isBinaryExpression(node) && ts.isObjectLiteralExpression(node.right)) variables[node.left.getText(file)] = node.getText(file);
    ts.forEachChild(node, visit);
  }
  visit(file); return { functions, methods, variables };
}
const before = declarations(nativeAst), after = declarations(patchedAst);
const mouseMethods = declarations(parse(region(vendor, 'src/Controls/EntityControl.js')), 'EntityControl').methods;

interface Draw {
  kind: string; text: string; x: number; y: number; font: string; color: string;
}
function canvas() {
  const draws: Draw[] = [], measures: { text: string; font: string; width: number }[] = [];
  const saved: { font: string; fillStyle: string; strokeStyle: string; textBaseline: string }[] = [];
  let width = 0, height = 0;
  const surface = {
    get width() { return width; },
    set width(value: number) { width = value; reset(); },
    get height() { return height; },
    set height(value: number) { height = value; reset(); },
    style: {} as Record<string, string>, remove: vi.fn(),
  };
  const ctx = {
    canvas: surface, font: '10px sans-serif', fillStyle: 'black', strokeStyle: 'black', textBaseline: 'alphabetic',
    save() { saved.push({ font: this.font, fillStyle: this.fillStyle, strokeStyle: this.strokeStyle, textBaseline: this.textBaseline }); },
    restore() { Object.assign(this, saved.pop()); },
    measureText(text: string) {
      const width = text.length * Number(this.font.match(/([\d.]+)px/)![1]);
      measures.push({ text, font: this.font, width }); return { width };
    },
    fillText(text: string, x: number, y: number) { record('fill', text, x, y); },
    strokeText(text: string, x: number, y: number) { record('stroke', text, x, y); },
    outlineText(text: string, x: number, y: number) { record('outline', text, x, y); },
    translate: vi.fn(), drawImage: vi.fn(), clearRect: vi.fn(), setTransform: vi.fn(),
  };
  function reset() { draws.length = 0; ctx.font = '10px sans-serif'; ctx.textBaseline = 'alphabetic'; }
  function record(kind: string, text: string, x: number, y: number) {
    draws.push({ kind, text, x, y, font: ctx.font, color: ctx.fillStyle });
  }
  return { surface, ctx, draws, measures };
}
type CanvasFixture = ReturnType<typeof canvas>;
interface RuntimeDisplay {
  name: string; fakename: string; party_name: string; guild_name: string; guild_rank: string; title_name: string;
  emblem: object | null; gifEmblem: Record<string, number | number[]> | null;
  STYLE: { DEFAULT: number; ADMIN: number; MOB: number; NPC: number; ITEM: number };
  TYPE: { NONE: number; LOADING: number; COMPLETE: number }; load: number; display: boolean;
  fixture: CanvasFixture; ctx: CanvasFixture['ctx']; canvas: CanvasFixture['surface'];
  add(): void; remove(): void;
  update(style?: number): void; render(matrix?: object): void; refresh(entity: RuntimeEntity): void;
}
interface RuntimeEntity extends Omit<MonsterEntity, 'display'> {
  display: RuntimeDisplay; clean(): void; onMouseOver(): void; onMouseOut(): void;
}
interface RuntimeManager {
  get(gid: number): RuntimeEntity | null;
  getLife(gid: number): Life | null;
  storeLife(gid: number, life: Partial<Life> & { sp?: number }): void;
  getOverEntity(): RuntimeEntity | null;
  setOverEntity(entity: RuntimeEntity | null): void;
  remove(gid: number): void; removeGID(gid: number): void; free(): void;
  _lastroMonsterHoverHp: ReturnType<typeof createLastroMonsterHoverHp>;
}
interface EntryPacket extends Entry {
  GID: number; objecttype?: number; name?: string; job?: number; effectState?: number;
}
interface Reader { readULong(): number; readUChar(): number; readString(length: number): string; }
function packetDefinition(name: string) {
  const match = vendor.match(new RegExp('PACKET\\.ZC\\.' + name + ' = function[\\s\\S]*?};'));
  if (!match) throw new Error('Missing native packet constructor: ' + name);
  return match[0];
}
const packetCode = ['NOTIFY_MONSTER_HP', 'HP_INFO_TINY', 'ACK_REQNAME'].map(packetDefinition).join('\n');

// Use real manager functions, real packet constructors/handlers and real canvas
// drawing methods. Only unrelated entity resources and the canvas are mocked.
function runtime({ pixelRatio = 1, ugly = false, showname = false } = {}) {
  const overlay = { append: vi.fn() };
  let tick = 10000;
  const context = vm.createContext({
    makeCanvas: canvas, makeLife: () => ({ hp: -1, hp_max: -1, update: vi.fn() }),
    Date: class extends Date { static now() { return tick; } }, NAME_LENGTH: 24,
    entityTypes, overlay, Map_default: { showname }, dpr: pixelRatio, _isUglyShadow: ugly,
    _pos$3: new Float32Array(4), _size$3: new Float32Array(2), EntityOverlay: overlay,
    vec4$3: { transformMat4: vi.fn() }, window: { innerWidth: 800, innerHeight: 600 },
    mat4$1: { multiply: vi.fn() }, _matrix: {}, Camera: { action: { active: false }, projection: {} },
    Controls_default: { noshift: false }, NpcBox_default: { ui: null },
    Cursor: { ACTION: { DEFAULT: 0, ATTACK: 1, TALK: 2, WARP: 3, PICK: 4, ROTATE: 5 }, setType: vi.fn() },
    KEYS: { SHIFT: false }, SessionStorage_default: {}, clanEmblems: {}, EffectManager: {},
    PacketVerManager_default: { value: 20110101 },
    StatusState_default: { EffectState: { FALCON: 1, WUG: 2, INVISIBLE: 4 } },
    DB: { getWeaponType: () => 0, getWeaponViewID: () => 0, isAssassin: () => false, isKatar: () => false },
    PACKET: { ZC: Object.fromEntries(['NOTIFY_NEWENTRY', 'NOTIFY_NEWENTRY2', 'NOTIFY_NEWENTRY3',
      'NOTIFY_NEWENTRY4', 'NOTIFY_NEWENTRY5', 'NOTIFY_NEWENTRY6', 'NOTIFY_NEWENTRY7',
      'NOTIFY_NEWENTRY10', 'NOTIFY_NEWENTRY11'].map(name => [name, function () {}])) },
    __exportAll: (value: object) => value,
    __esmMin: (callback: () => void) => { let initialized = false; return () => { if (!initialized) { initialized = true; callback(); } }; },
  });
  const managerRegion = region(patched, paths[1]);
  for (const match of managerRegion.matchAll(/\b(init_[\w$]+)\(\);/g)) context[match[1]!] = () => {};
  vm.runInContext(`
    ${after.functions.multiShadow}
    ${after.functions.Init$7}
    var Display = class {
      constructor() {
        this.fixture = makeCanvas(); this.canvas = this.fixture.surface; this.ctx = this.fixture.ctx;
        this.STYLE = { DEFAULT: 1, ADMIN: 2, MOB: 3, NPC: 4, ITEM: 5 };
        this.TYPE = { NONE: 0, LOADING: 1, COMPLETE: 2 }; this.load = this.TYPE.COMPLETE; this.display = false;
        this.name = ''; this.fakename = ''; this.party_name = ''; this.guild_name = '';
        this.guild_rank = ''; this.title_name = ''; this.emblem = null; this.gifEmblem = null;
      }
      ${after.methods.update}
      ${after.methods.render}
      ${after.methods.refresh}
      ${after.methods.add}
      ${after.methods.remove}
    };
    var EntityEvents = class {
      ${mouseMethods.onMouseOver}
      ${mouseMethods.onMouseOut}
    };
    var Entity = class {
      constructor() {
        this.GID = -1; this.objecttype = 0; this.life = makeLife(); this.position = [0, 0, 0];
        this.aura = { load() {} }; this.gr2Model = null; this.matrix = {}; Init$7.call(this);
        this.onMouseOver = EntityEvents.onMouseOver; this.onMouseOut = EntityEvents.onMouseOut;
      }
      set(packet) {
        this.GID = packet.GID; if (packet.objecttype !== undefined) this.objecttype = packet.objecttype;
        if (packet.name !== undefined) this.display.name = packet.name;
      }
      clean() { this.cleaned = true; }
      setEntityGuildEmblem() {}
      canAttackEntity() { return false; }
    };
    Object.assign(Entity, entityTypes, { TYPE_HOM: 8, TYPE_MERC: 9, TYPE_NPC2: 10, TYPE_ITEM: 11 });
    ${managerRegion}
    init_EntityManager();
    ${packetCode}
    ${after.functions.onEntitySpam}
    ${after.functions.onEntityLifeUpdate}
    ${after.functions.onEntityLifeUpdateTiny}
    ${after.functions.onEntityIdentity}
    ${after.functions.updateEntityStyle}
  `, context);
  const manager = context.EntityManager as RuntimeManager;
  const notify = context.onEntityLifeUpdate as (pkt: { AID: number; hp: number; maxhp: number }) => void;
  const tiny = context.onEntityLifeUpdateTiny as (pkt: { GID: number; hp: number }) => void;
  const entry = context.onEntitySpam as (pkt: EntryPacket) => void;
  const identify = context.onEntityIdentity as (pkt: { AID: number; CName: string }) => void;
  const packet = context.PACKET as { ZC: {
    NOTIFY_MONSTER_HP: new (reader: Reader, end: number) => { AID: number; hp: number; maxhp: number };
    HP_INFO_TINY: new (reader: Reader, end: number) => { GID: number; hp: number };
    ACK_REQNAME: new (reader: Reader, end: number) => { AID: number; CName: string };
  } };
  const reader = (data: ArrayBuffer) => {
    const view = new DataView(data); let index = 2;
    return { readULong() { const value = view.getUint32(index, true); index += 4; return value; },
      readUChar() { return view.getUint8(index++); },
      readString(length: number) {
        const value = new TextDecoder().decode(new Uint8Array(data, index, length)).split('\0')[0]!;
        index += length; return value;
      } };
  };
  const exact = (gid: number, hp: number, maxhp: number) => {
    const data = new ArrayBuffer(14), view = new DataView(data);
    view.setUint16(0, 0x0977, true); view.setUint32(2, gid, true);
    view.setUint32(6, hp, true); view.setUint32(10, maxhp, true);
    const decoded = new packet.ZC.NOTIFY_MONSTER_HP(reader(data), 14); notify(decoded); return decoded;
  };
  const percent = (gid: number, units: number) => {
    const data = new ArrayBuffer(7), view = new DataView(data);
    view.setUint16(0, 0x0a36, true); view.setUint32(2, gid, true); view.setUint8(6, units);
    const decoded = new packet.ZC.HP_INFO_TINY(reader(data), 7); tiny(decoded); return decoded;
  };
  const identity = (gid: number, rawName: string) => {
    const data = new ArrayBuffer(30), view = new DataView(data);
    view.setUint16(0, 0x0095, true); view.setUint32(2, gid, true);
    new Uint8Array(data, 6, 24).set(new TextEncoder().encode(rawName).slice(0, 24));
    const decoded = new packet.ZC.ACK_REQNAME(reader(data), 30); identify(decoded); return decoded;
  };
  const spawn = (pkt: EntryPacket) => {
    entry({ objecttype: entityTypes.TYPE_MOB, name: '波利 (Lv.1|HP:50%)', job: 1002, effectState: 0, ...pkt });
    return manager.get(pkt.GID)!;
  };
  return { manager, exact, percent, identity, spawn, overlay, setNow: (value: number) => { tick = value; },
    hover: (entity: RuntimeEntity | null) => manager.setOverEntity(entity),
    render: (entity: RuntimeEntity) => entity.display.render({}),
  };
}

describe('native monster hover HP packet and canvas integration', () => {
  it('decodes original CName and updates the hovered numeric row after native identity completion', () => {
    const f = runtime(), entity = f.spawn({ GID: 123, hp: 3500, maxhp: 5000 }); f.hover(entity);
    const state = f.manager._lastroMonsterHoverHp, name = state.name;
    const loads: number[] = [];
    vi.spyOn(state, 'name').mockImplementation((owner, rawName) => {
      loads.push((owner as RuntimeEntity).display.load); name(owner, rawName);
    });
    entity.display.load = entity.display.TYPE.LOADING;
    entity.display.fakename = 'Alias (HP:20%)';
    const decoded = f.identity(123, 'Mob (HP:80%)');
    expect(decoded).toEqual({ AID: 123, CName: 'Mob (HP:80%)' });
    expect(loads).toEqual([entity.display.TYPE.COMPLETE]);
    expect(entity.display.name).toBe('波利 (Lv.1|HP:50%)');
    expect(entity.display.fakename).toBe('Mob (HP:80%)');
    expect(state.text(entity)).toBe('4k / 5k');
    expect(entity.display.fixture.draws.some(draw => draw.kind === 'fill' && draw.text === '4k / 5k' && draw.font === '9px Arial')).toBe(true);
  });

  it('uses realtime Tiny until expiry and repaints the later original-name fallback on existing hover frames', () => {
    const f = runtime(), entity = f.spawn({ GID: 123, hp: 3500, maxhp: 5000 }); f.hover(entity);
    f.percent(123, 5); f.identity(123, 'Mob (HP:90%)');
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('1.25k / 5k');
    f.setNow(11999); f.render(entity);
    expect(entity.display.fixture.draws.some(draw => draw.kind === 'fill' && draw.text === '1.25k / 5k')).toBe(true);
    f.setNow(12000); f.render(entity);
    expect(entity.display.fixture.draws.some(draw => draw.kind === 'fill' && draw.text === '4.5k / 5k')).toBe(true);
    expect(entity.display.fixture.draws.some(draw => draw.text === '1.25k / 5k')).toBe(false);
    f.setNow(12001); f.percent(123, 5); f.identity(123, 'Mob (HP:90%)'); f.render(entity);
    expect(entity.display.fixture.draws.some(draw => draw.kind === 'fill' && draw.text === '1.25k / 5k')).toBe(true);
    f.setNow(14000); f.render(entity);
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('1.25k / 5k');
    f.setNow(14001); f.render(entity);
    expect(entity.display.fixture.draws.some(draw => draw.kind === 'fill' && draw.text === '4.5k / 5k')).toBe(true);
    expect(entity.display.fixture.draws.some(draw => draw.font === '9px Arial' && (draw.text.includes('≈') || draw.text.includes('%')))).toBe(false);
  });

  it('retains named fallback through native mouse exit and immediately restores a newly confirmed exact pair', () => {
    const f = runtime(), entity = f.spawn({ GID: 123, hp: 3500, maxhp: 5000 });
    f.hover(entity); f.percent(123, 5); f.identity(123, 'Mob (HP:90%)');
    f.hover(null); entity.display.refresh(entity); f.setNow(12000); f.hover(entity);
    expect(entity.display.fixture.draws.some(draw => draw.kind === 'fill' && draw.text === '4.5k / 5k')).toBe(true);
    f.exact(123, 3500, 5000); f.render(entity);
    expect(entity.display.fixture.draws.some(draw => draw.kind === 'fill' && draw.text === '3.5k / 5k')).toBe(true);
    expect(entity.display.fixture.draws.some(draw => draw.text === '4.5k / 5k')).toBe(false);
    f.hover(null); entity.display.refresh(entity); f.setNow(20000); f.hover(entity);
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('3.5k / 5k');
  });

  it('keeps original-name percentages native and hides the extra row without a trustworthy maximum', () => {
    const f = runtime(), entity = f.spawn({ GID: 123 }); f.hover(entity);
    entity.life.hp = 3000; entity.life.hp_max = 5000;
    f.percent(123, 5); f.identity(123, 'Mob (HP:90%)'); f.setNow(12000); f.render(entity);
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('');
    expect(entity.display.fakename).toBe('Mob (HP:90%)');
    expect(entity.display.fixture.draws.some(draw => draw.font === '9px Arial')).toBe(false);
    expect(entity.display.fixture.draws.some(draw => draw.text === 'Mob (HP:90%)' && draw.font === '12px Arial')).toBe(true);
    f.exact(123, 3500, 5000); f.render(entity);
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('3.5k / 5k');
    expect(entity.display.fixture.draws.some(draw => draw.kind === 'fill' && draw.text === '3.5k / 5k')).toBe(true);
  });

  it('does not transfer original-name fallback across removal, map free or nonmonster identity packets', () => {
    const f = runtime(), old = f.spawn({ GID: 123, hp: 3500, maxhp: 5000 });
    f.identity(123, 'Mob (HP:90%)'); expect(f.manager._lastroMonsterHoverHp.text(old)).toBe('4.5k / 5k');
    f.manager.removeGID(123);
    const reused = f.spawn({ GID: 123, hp: 3500, maxhp: 5000 });
    expect(f.manager._lastroMonsterHoverHp.text(old)).toBe('');
    expect(f.manager._lastroMonsterHoverHp.text(reused)).toBe('3.5k / 5k');
    f.identity(123, 'Mob (HP:80%)'); f.manager.free();
    const next = f.spawn({ GID: 123 }); f.identity(123, 'Mob (HP:90%)');
    expect(f.manager._lastroMonsterHoverHp.text(next)).toBe('');
    const npc = f.spawn({ GID: 456, objecttype: entityTypes.TYPE_NPC, hp: 3500, maxhp: 5000 });
    f.identity(456, 'NPC (HP:90%)'); f.hover(npc);
    expect(f.manager._lastroMonsterHoverHp.text(npc)).toBe('');
    expect(npc.display.fixture.draws.some(draw => draw.font === '9px Arial')).toBe(false);
  });

  it.each([{ pixelRatio: 1, ugly: false }, { pixelRatio: 1.25, ugly: false }, { pixelRatio: 2, ugly: false }, { pixelRatio: 1, ugly: true }, { pixelRatio: 2, ugly: true }])('renders a separate 75% HP line at the native baseline: %j', options => {
      const f = runtime(options), entity = f.spawn({ GID: 123, hp: 2500, maxhp: 5000 }); f.hover(entity); f.render(entity);
      const { draws, ctx, surface } = entity.display.fixture;
      const hpText = '2.5k / 5k', hp = draws.filter(draw => draw.text === hpText && draw.kind === 'fill').at(-1)!;
      expect(hp.font).toBe(9 * options.pixelRatio + 'px Arial');
      expect(hp.y).toBeCloseTo(5 + 12 * options.pixelRatio * 1.2);
      const name = draws.filter(draw => draw.text === entity.display.name && draw.kind === 'fill').at(-1)!;
      expect(name.font).toBe(12 * options.pixelRatio + 'px Arial'); expect(name.y).toBe(5);
      expect(hp.y + 9 * options.pixelRatio).toBeLessThan(surface.height);
      expect(surface.height).toBe(12 * options.pixelRatio * 3 + 5);
      expect(hp.x).toBeCloseTo((surface.width - hpText.length * 9 * options.pixelRatio) / 2);
      expect(ctx.font).toBe(12 * options.pixelRatio + 'px Arial');
      f.exact(123, 5000, 20000); f.render(entity);
      expect(draws.some(draw => draw.text === '5k / 20k' && draw.font === 9 * options.pixelRatio + 'px Arial')).toBe(true);
      expect(draws.some(draw => draw.text === hpText)).toBe(false);
      expect(entity.display.name).toBe('波利 (Lv.1|HP:50%)');
      expect(f.overlay.append).toHaveBeenCalledWith(entity.display.canvas);
    });

  it('decodes unsigned real HP, estimates the actual Tiny packet against its confirmed maximum and restores a full value', () => {
    const f = runtime(), entity = f.spawn({ GID: 123 }); f.hover(entity);
    expect(f.exact(123, 3000000000, 4000000000)).toMatchObject({ AID: 123, hp: 3000000000, maxhp: 4000000000 });
    expect(entity.life).toMatchObject({ hp: 3000000000, hp_max: 4000000000, display: true });
    f.render(entity); expect(entity.display.fixture.draws.some(draw => draw.text === '3b / 4b')).toBe(true);
    expect(f.percent(123, 5)).toMatchObject({ GID: 123, hp: 5 });
    expect(entity.life).toMatchObject({ hp: 25, hp_max: 100, display: true });
    expect(f.manager.getLife(123)).toMatchObject({ hp: 25, hp_max: 100 });
    f.render(entity); expect(entity.display.fixture.draws.some(draw => draw.text === '1b / 4b')).toBe(true);
    expect(entity.display.fixture.draws.some(draw => draw.text === '3b / 4b')).toBe(false);
    expect(entity.display.fixture.draws.some(draw => draw.text === '25 / 100')).toBe(false);
    f.exact(123, 2500000000, 4000000000); f.render(entity);
    expect(entity.display.fixture.draws.some(draw => draw.text === '2.5b / 4b')).toBe(true);
  });

  it('claims a pre-entry real notification through the native Life cache without changing other cached fields', () => {
    const f = runtime(); f.manager.storeLife(123, { sp: 17 }); f.exact(123, 1005, 999999);
    const life = f.manager.getLife(123)!; expect(Object.getOwnPropertySymbols(life)).toHaveLength(1);
    const entity = f.spawn({ GID: 123, hp: -1, maxhp: -1 });
    expect(entity.life).toMatchObject({ hp: 1005, hp_max: 999999 });
    expect(f.manager.getLife(123)).toBe(life); expect(life).toMatchObject({ sp: 17 });
    expect(Object.getOwnPropertySymbols(life)).toHaveLength(0);
    f.hover(entity); f.render(entity);
    expect(entity.display.fixture.draws.some(draw => draw.text === '1.01k / 1000k')).toBe(true);
    f.percent(456, 10); const percentageOnly = f.spawn({ GID: 456, hp: -1, maxhp: -1 });
    f.hover(percentageOnly); f.render(percentageOnly);
    expect(f.manager._lastroMonsterHoverHp.text(percentageOnly)).toBe('');
    expect(percentageOnly.display.fixture.draws.some(draw => draw.font === '9px Arial')).toBe(false);
    expect(percentageOnly.display.fixture.draws.some(draw => draw.text === '50 / 100')).toBe(false);
  });

  it('omits the numeric HP row until a real maximum is known and retains the native header percentage', () => {
    const f = runtime(), entity = f.spawn({ GID: 123 }); f.hover(entity); f.render(entity);
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('');
    expect(entity.display.fixture.draws.some(draw => draw.font === '9px Arial')).toBe(false);
    expect(entity.display.fixture.measures.some(measurement => measurement.font === '9px Arial')).toBe(false);
    expect(entity.display.fixture.draws.some(draw => draw.text === '— / —')).toBe(false);
    f.percent(123, 5); f.render(entity);
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('');
    expect(entity.display.fixture.draws.some(draw => draw.font === '9px Arial')).toBe(false);
    expect(entity.display.fixture.draws.some(draw => draw.text === '25 / 100')).toBe(false);
    f.hover(null); entity.display.refresh(entity); f.hover(entity);
    expect(entity.display.fixture.draws.some(draw => draw.font === '9px Arial')).toBe(false);
    expect(entity.display.fixture.draws.some(draw => draw.text === entity.display.name && draw.font === '12px Arial')).toBe(true);
    expect(entity.display.name).toBe('波利 (Lv.1|HP:50%)');
  });

  it('claims a pre-entry full maximum followed by Tiny without trusting the overwritten native Life denominator', () => {
    const f = runtime(); f.exact(123, 3000, 5000); f.percent(123, 5);
    expect(f.manager.getLife(123)).toMatchObject({ hp: 25, hp_max: 100 });
    const entity = f.spawn({ GID: 123, hp: -1, maxhp: -1 }); f.hover(entity);
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('1.25k / 5k');
    expect(entity.display.fixture.draws.some(draw => draw.text === '1.25k / 5k')).toBe(true);
    expect(Object.getOwnPropertySymbols(f.manager.getLife(123)!)).toHaveLength(0);
  });

  it('updates an already hovered entity live and redraws only when the formatted text changes', () => {
    const f = runtime(), entity = f.spawn({ GID: 123, hp: 2500, maxhp: 5000 }); f.hover(entity); f.render(entity);
    expect(entity.life).toMatchObject({ hp: -1, hp_max: -1 });
    const measurements = entity.display.fixture.measures.length;
    f.render(entity); expect(entity.display.fixture.measures).toHaveLength(measurements);
    f.exact(123, 2500, 5000); f.render(entity); expect(entity.display.fixture.measures).toHaveLength(measurements);
    f.exact(123, 2400, 5000); f.render(entity);
    expect(entity.display.fixture.draws.some(draw => draw.text === '2.4k / 5k')).toBe(true);
    f.spawn({ GID: 123, hp: 1000, maxhp: 5000 }); f.render(entity);
    expect(entity.display.fixture.draws.some(draw => draw.text === '1k / 5k')).toBe(true);
  });

  it('restores confirmed HP immediately on native mouse re-entry after an off-hover refresh clears the canvas', () => {
    const f = runtime(), entity = f.spawn({ GID: 123, hp: 2500, maxhp: 5000 });
    f.hover(entity);
    expect(entity.display.display).toBe(true);
    expect(entity.display.fixture.draws.some(draw => draw.text === '2.5k / 5k')).toBe(true);
    f.hover(null);
    expect(entity.display.display).toBe(false); expect(entity.display.canvas.remove).toHaveBeenCalled();
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('2.5k / 5k');
    entity.display.refresh(entity);
    expect(entity.display.fixture.draws.some(draw => draw.text.includes(' / '))).toBe(false);
    f.hover(entity); // The native onMouseOver calls render/add synchronously, with no new HP packet.
    expect(entity.display.display).toBe(true);
    expect(entity.display.fixture.draws.some(draw => draw.text === '2.5k / 5k')).toBe(true);
  });

  it('shows a new full value received while away on native mouse re-entry without another packet or render call', () => {
    const f = runtime(), entity = f.spawn({ GID: 123, hp: 2500, maxhp: 5000 }); f.hover(entity); f.hover(null);
    f.exact(123, 1750, 5000); entity.display.update(entity.display.STYLE.MOB);
    expect(entity.display.fixture.draws.some(draw => draw.text.includes(' / '))).toBe(false);
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('1.75k / 5k');
    f.hover(entity);
    expect(entity.display.fixture.draws.some(draw => draw.text === '1.75k / 5k')).toBe(true);
    expect(entity.display.fixture.draws.some(draw => draw.text === '2.5k / 5k')).toBe(false);
  });

  it('keeps calculated HP across native mouse-out/re-entry and restores the original full pair on a complete packet', () => {
    const f = runtime(), entity = f.spawn({ GID: 123, hp: 3500, maxhp: 5000 }); f.hover(entity);
    f.percent(123, 5); f.render(entity);
    expect(entity.life).toMatchObject({ hp: 25, hp_max: 100 });
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('1.25k / 5k');
    f.hover(null); entity.display.refresh(entity); f.hover(entity);
    expect(entity.display.fixture.draws.some(draw => draw.text === '1.25k / 5k')).toBe(true);
    expect(entity.display.fixture.draws.some(draw => draw.text === '25 / 100')).toBe(false);
    f.exact(123, 3500, 5000); f.render(entity);
    expect(entity.display.fixture.draws.some(draw => draw.text === '3.5k / 5k')).toBe(true);
    expect(entity.display.fixture.draws.some(draw => draw.text.includes('≈'))).toBe(false);
    f.exact(123, 3000, 5000); f.render(entity);
    expect(entity.display.fixture.draws.some(draw => draw.text === '3k / 5k')).toBe(true);
  });

  it('keeps the previous exact or estimated display when native Tiny carries an out-of-range byte', () => {
    const f = runtime(), entity = f.spawn({ GID: 123, hp: 3500, maxhp: 5000 }); f.hover(entity);
    expect(f.percent(123, 255)).toMatchObject({ GID: 123, hp: 255 }); f.render(entity);
    expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('3.5k / 5k');
    f.percent(123, 5); f.render(entity); expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('1.25k / 5k');
    f.percent(123, 21); f.render(entity); expect(f.manager._lastroMonsterHoverHp.text(entity)).toBe('1.25k / 5k');
    expect(entity.display.fixture.draws.some(draw => draw.text === '1.25k / 5k')).toBe(true);
  });

  it('clears actual packet estimates and percentage pending values on removal and a map free', () => {
    const f = runtime(), old = f.spawn({ GID: 123, hp: 3500, maxhp: 5000 }); f.percent(123, 5);
    expect(f.manager._lastroMonsterHoverHp.text(old)).toBe('1.25k / 5k');
    f.manager.removeGID(123); const reused = f.spawn({ GID: 123 });
    expect(f.manager._lastroMonsterHoverHp.text(old)).toBe(''); expect(f.manager._lastroMonsterHoverHp.text(reused)).toBe('');
    f.percent(123, 5); expect(f.manager._lastroMonsterHoverHp.text(reused)).toBe('');
    f.exact(456, 3000, 5000); f.percent(456, 5); f.percent(789, 5);
    f.manager.free();
    expect(f.manager._lastroMonsterHoverHp.text(f.spawn({ GID: 456, hp: -1, maxhp: -1 }))).toBe('');
    expect(f.manager._lastroMonsterHoverHp.text(f.spawn({ GID: 789, hp: -1, maxhp: -1 }))).toBe('');
  });

  it('uses each monster identity when native mouse hover switches repeatedly between A and B', () => {
    const f = runtime(), a = f.spawn({ GID: 123, hp: 500, maxhp: 1000 }), b = f.spawn({ GID: 456, hp: 400, maxhp: 800 });
    f.hover(a); expect(a.display.fixture.draws.some(draw => draw.text === '500 / 1k')).toBe(true);
    f.hover(b); expect(a.display.display).toBe(false); expect(b.display.display).toBe(true);
    expect(b.display.fixture.draws.some(draw => draw.text === '400 / 800')).toBe(true);
    a.display.refresh(a); f.hover(a);
    expect(a.display.fixture.draws.some(draw => draw.text === '500 / 1k')).toBe(true);
    expect(a.display.fixture.draws.some(draw => draw.text === '400 / 800')).toBe(false);
    f.exact(456, 350, 800); b.display.refresh(b); f.hover(b);
    expect(b.display.fixture.draws.some(draw => draw.text === '350 / 800')).toBe(true);
    expect(b.display.fixture.draws.some(draw => draw.text === '500 / 1k')).toBe(false);
    expect(f.manager._lastroMonsterHoverHp.text(a)).toBe('500 / 1k');
  });

  it('clears exact HP before immediate GID removal, even while the old render object remains alive', () => {
    const f = runtime(), old = f.spawn({ GID: 123, hp: 500, maxhp: 1000 }); f.hover(old); f.render(old);
    const state = f.manager._lastroMonsterHoverHp, remove = state.remove;
    const present: boolean[] = [];
    vi.spyOn(state, 'remove').mockImplementation(gid => { present.push(!!f.manager.get(gid)); remove(gid); });
    f.manager.removeGID(123); expect(present).toEqual([true]);
    expect(f.manager.get(123)).toBeNull(); expect(state.text(old)).toBe(unknownHp);
    const next = f.spawn({ GID: 123 }); expect(next).not.toBe(old);
    expect(state.text(next)).toBe(unknownHp); f.exact(123, 400, 800);
    expect(state.text(next)).toBe('400 / 800'); expect(state.text(old)).toBe(unknownHp);
    f.exact(456, 400, 800); f.manager.removeGID(456);
    expect(state.text(f.spawn({ GID: 456 }))).toBe(unknownHp);
  });

  it('invalidates snapshots on native remove and free without requiring the native Life cache to disappear', () => {
    const f = runtime(), old = f.spawn({ GID: 123 }); f.exact(123, 500, 1000);
    f.exact(456, 400, 800); const pending = f.manager.getLife(456)!;
    f.manager.remove(123); expect(f.manager._lastroMonsterHoverHp.text(old)).toBe(unknownHp);
    f.manager.free(); expect(f.manager.getLife(456)).toBe(pending);
    expect(f.manager._lastroMonsterHoverHp.text(f.spawn({ GID: 456, hp: -1, maxhp: -1 }))).toBe(unknownHp);
  });

  it('keeps HP scoped to the current hovered monster, including MOB-styled nonmonster types', () => {
    const f = runtime(), first = f.spawn({ GID: 123, hp: 500, maxhp: 1000 }), second = f.spawn({ GID: 456, hp: 400, maxhp: 800 });
    f.hover(first); f.render(first); f.render(second);
    expect(first.display.fixture.draws.some(draw => draw.text === '500 / 1k')).toBe(true);
    expect(second.display.fixture.draws.some(draw => draw.text === '400 / 800')).toBe(false);
    f.hover(second); f.render(first); f.render(second);
    expect(first.display.fixture.draws.some(draw => draw.text === '500 / 1k')).toBe(false);
    expect(second.display.fixture.draws.some(draw => draw.text === '400 / 800')).toBe(true);
    second.objecttype = entityTypes.TYPE_NPC_ABR; f.render(second);
    expect(second.display.fixture.draws.some(draw => draw.text.includes(' / '))).toBe(false);
    for (const type of [entityTypes.TYPE_PC, entityTypes.TYPE_NPC, entityTypes.TYPE_DISGUISED, entityTypes.TYPE_NPC_BIONIC]) {
      const entity = f.spawn({ GID: 700 + type, objecttype: type, hp: 500, maxhp: 1000 });
      f.hover(entity); f.render(entity);
      expect(entity.display.fixture.draws.some(draw => draw.text.includes(' / '))).toBe(false);
    }
  });

  it('measures the HP line at its own font size, retains bold naming and places it after native guild text', () => {
    const f = runtime({ pixelRatio: 2, showname: true }), entity = f.spawn({ GID: 123, name: 'M', hp: 4294967295, maxhp: 4294967295 });
    entity.display.guild_name = 'G'; f.hover(entity); f.render(entity);
    const hp = entity.display.fixture.draws.filter(draw => draw.text === '4.29b / 4.29b' && draw.kind === 'fill').at(-1)!;
    expect(hp.font).toBe('bold 18px Arial'); expect(hp.y).toBeCloseTo(5 + 24 * 1.2 * 2);
    expect(entity.display.fixture.surface.width).toBe('4.29b / 4.29b'.length * 18 + 10);
    expect(hp.x).toBeCloseTo((entity.display.fixture.surface.width - '4.29b / 4.29b'.length * 18) / 2);
    expect(entity.display.fixture.surface.height).toBe(24 * 3 * 2 + 5);
    expect(entity.display.ctx.font).toBe('bold 24px Arial');
    expect(entity.display.fixture.draws.filter(draw => draw.text === 'G' && draw.kind === 'fill').at(-1)!.y).toBeCloseTo(5 + 24 * 1.2);
  });
});

const displayTemplate = `${before.functions.Init$7}\nDisplay = class {${before.methods.update}\n${before.methods.render}};`;
const managerTemplate = ['free', 'removeEntity', 'removeGID', 'storeLife', 'getLife'].map(name => before.functions[name]).join('\n')
  + '\nfunction initializeManager() { ' + before.variables.EntityManager + '; }';
const engineTemplate = ['onEntityLifeUpdate', 'onEntityLifeUpdateTiny', 'onEntitySpam', 'onEntityIdentity'].map(name => before.functions[name]).join('\n');
const templates = [displayTemplate, managerTemplate, engineTemplate];
const wrap = (content: string, index: number) => '//#region ' + paths[index] + '\n' + content + '\n//#endregion';
const small = templates.map(wrap).join('\n').replace(/\r\n/g, '\n');

describe('monster hover runtime patch scope and fail-closed guards', () => {
  it('keeps original packet handlers and Display methods outside the explicit changes byte-identical', () => {
    for (const [name, source] of Object.entries(before.functions)) {
      if (['Init$7', 'free', 'removeEntity', 'removeGID', 'onEntitySpam', 'onEntityLifeUpdate', 'onEntityLifeUpdateTiny', 'onEntityIdentity'].includes(name)) continue;
      expect(after.functions[name], name).toBe(source);
    }
    for (const [name, source] of Object.entries(before.methods)) {
      if (name === 'update' || name === 'render') continue;
      expect(after.methods[name], name).toBe(source);
    }
    expect(Object.keys(before.methods)).toContain('update');
    expect(patched.match(/lastro-monster-hover-hp-installed/g)).toHaveLength(3);
    expect((patchedAst as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] }).parseDiagnostics).toHaveLength(0);
  });

  it.each(['\n', '\r\n'])('supports complete native anchors with %j line endings while preserving outside bytes', eol => {
    const input = ('// before\n//#region other.js\nconst untouched = 1;\n//#endregion\n' + small + '\n// after\n').replace(/\n/g, eol);
    const output = patchRuntimeMonsterHoverHp(input);
    expect(output).not.toBe(input);
    expect(output.slice(0, output.indexOf('//#region ' + paths[0]))).toBe(input.slice(0, input.indexOf('//#region ' + paths[0])));
    expect(output.slice(output.lastIndexOf('//#endregion') + 12)).toBe(input.slice(input.lastIndexOf('//#endregion') + 12));
    if (eol === '\r\n') expect(output.replace(/\r\n/g, '')).not.toContain('\n');
  });

  it('leaves region-free fixtures unchanged and rejects partial dependent regions', () => {
    const unrelated = '//#region other.js\nconst untouched = true;\n//#endregion';
    expect(patchRuntimeMonsterHoverHp(unrelated)).toBe(unrelated);
    for (let index = 0; index < paths.length; index++) {
      expect(() => patchRuntimeMonsterHoverHp(templates.filter((_, i) => i !== index).map((content, i) => wrap(content, i < index ? i : i + 1)).join('\n')))
        .toThrow(/anchor:monster-hover-hp:regions/);
    }
  });

  it.each([
    ['font size', 'const fontSize = 12 * dpr;', 'const fontSize = 11 * dpr;'],
    ['display owner', 'this.display = new Display();', 'this.display = new Display(); this.other = true;'],
    ['exact HP source', 'hp: pkt.hp,', 'hp: pkt.hp * 5,'],
    ['Tiny percentage scale', 'const hp = pkt.hp * 5;', 'const hp = pkt.hp * 4;'],
    ['identity completion', 'entity.display.load = entity.display.TYPE.COMPLETE;', 'entity.display.load = entity.display.TYPE.LOADING;'],
    ['spawn cache boundary', 'entity.life.hp <= -1', 'entity.life.hp <= 0'],
    ['Life cache retrieval', 'return _lifeCache.get(gid) || null;', 'return _lifeCache.get(gid);'],
    ['GID removal boundary', 'function removeGID(gid) {\n  _gidMap.delete(gid);', 'function removeGID(gid) {\n  _gidMap.delete(gid); changed();'],
  ])('rejects changed %s anchors rather than patching an unexpected native implementation', (_label, from, to) => {
    for (const eol of ['\n', '\r\n']) {
      const input = small.replace(/\n/g, eol), changed = input.replace(from.replace(/\n/g, eol), to.replace(/\n/g, eol));
      expect(changed).not.toBe(input);
      expect(() => patchRuntimeMonsterHoverHp(changed)).toThrow(/anchor:monster-hover-hp:/);
    }
  });

  it('rejects duplicate regions, duplicate functions, missing terminators, mixed newlines and second application', () => {
    expect(() => patchRuntimeMonsterHoverHp(small + '\n' + wrap(managerTemplate, 1))).toThrow(/anchor:monster-hover-hp:/);
    const init = before.functions.Init$7!.replace(/\r\n/g, '\n');
    expect(() => patchRuntimeMonsterHoverHp(small.replace(init, init + '\n' + init)))
      .toThrow(/anchor:monster-hover-hp:/);
    expect(() => patchRuntimeMonsterHoverHp(small.replace('//#endregion', ''))).toThrow(/anchor:monster-hover-hp:/);
    expect(() => patchRuntimeMonsterHoverHp(small.replace('\n', '\r\n'))).toThrow(/anchor:monster-hover-hp:/);
    expect(() => patchRuntimeMonsterHoverHp(patchRuntimeMonsterHoverHp(small))).toThrow(/anchor:monster-hover-hp:already-installed/);
  });
});
