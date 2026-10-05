import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { patchRuntimeMovementEffects as patchViteMovementEffects } from '../scripts/lastro-movement-effects.mjs';

const nativeRequire = process.getBuiltinModule('module').createRequire(import.meta.url);
const { patchRuntimeMovementEffects } = nativeRequire('../scripts/lastro-movement-effects.mjs') as {
  patchRuntimeMovementEffects(source: string): string;
};
const vendor = readFileSync(new URL('../vendor/v2/Online.js', import.meta.url), 'utf8');
const names = ['StrEffect', 'SwirlingAura', 'GroundAura', 'Level99Bubble', 'SpiritSphere', 'WarlockSphere'] as const;
type EffectName = typeof names[number];
function region(name: EffectName, source = vendor) {
  const start = source.indexOf(`//#region src/Renderer/Effects/${name}.js`);
  if (start < 0) throw new Error(name);
  const end = source.indexOf('//#endregion', start) + '//#endregion'.length;
  return source.slice(start, end);
}
const base = names.map(name => region(name)).join('\n');
const patched = patchRuntimeMovementEffects(base);

interface Owner { position: Float32Array; direction: number; xSize: number; ySize: number; }
interface Effect {
  position: Float32Array; ownerEntity?: Owner; ownerDirection?: number;
  ready: boolean; texture: string; filename?: string; startTick?: number;
  persistent?: boolean; initialAlpha?: number;
  _Params?: { effect?: { attachedEntity?: unknown }; Init?: { ownerEntity?: Owner }; Inst?: { position?: Float32Array } };
  columns?: { anchors: { x: number; y: number; z: number }[] }[];
  tmpPoints?: number[][];
  updateAnchor?: ReturnType<typeof vi.fn>;
  render(gl: unknown, tick: number): void;
}

function fixture(name: EffectName, source = patched) {
  const owner: Owner = { position: new Float32Array([3, 4, 7]), direction: 6, xSize: 175, ySize: 175 };
  const visual = new Float32Array([4.5, 6, 10.5]);
  let lastro = true;
  const methods = new Map<string, ReturnType<typeof vi.fn>>();
  const gl = new Proxy<Record<string, ReturnType<typeof vi.fn>>>({}, {
    get: (_, key: string) => {
      let method = methods.get(key);
      if (!method) { method = vi.fn(); methods.set(key, method); }
      return method;
    },
  });
  const matrix = {
    create: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    identity: (out: Float32Array) => { out.fill(0); out[0] = out[5] = out[10] = out[15] = 1; return out; },
    translate: (out: Float32Array, input: Float32Array, point: number[]) => {
      if (out !== input) out.set(input);
      out[12]! += point[0]!; out[13]! += point[1]!; out[14]! += point[2]!;
      return out;
    },
    scale: (out: Float32Array, input: Float32Array) => { if (out !== input) out.set(input); return out; },
    rotateY: (out: Float32Array) => out,
    rotateX: (out: Float32Array) => out,
    rotateZ: (out: Float32Array) => out,
  };
  const animation = {
    frame: 0, type: 0, aniframe: 0, angle: 0, srcalpha: 1, destalpha: 1,
    color: new Float32Array([1, 1, 1, 1]), pos: new Float32Array([320, 320]),
    uv: new Float32Array(8), xy: new Float32Array(8),
  };
  const str = { fps: 1, maxKey: 10, layernum: 1,
    layers: [{ materials: ['texture'], anikeynum: 1, animations: [animation] }] };
  const Client = { loadFile: vi.fn(() => str) };
  const Altitude = { getCellHeight: vi.fn((x: number, y: number) => x + y) };
  const lastroMovementVisual = vi.fn((entity: Owner) => entity === owner && lastro ? visual : entity.position);
  const lastroMovementVisualDirection = vi.fn((entity: Owner) => entity === owner && lastro ? 2 : entity.direction);
  const context = vm.createContext({
    Float32Array, Int16Array, Uint8Array,
    __esmMin: (callback: () => void) => callback,
    gl_matrix_default: { mat4: matrix },
    Client, Altitude, Camera: { angle: [45, 0], zoom: 1 },
    SpriteRenderer: { runWithDepth: (_a: unknown, _b: unknown, _c: unknown, callback: () => void) => callback() },
    SessionStorage_default: { Entity: owner }, Configs: { get: () => lastro },
    lastroMovementVisual, lastroMovementVisualDirection,
  });
  for (const dependency of base.matchAll(/\b(init_[\w$]+)\(\);/g)) context[dependency[1]!] = () => {};
  vm.runInContext(source, context);
  vm.runInContext(`init_${name}();`, context);
  const program = { uniform: new Proxy({}, { get: (_target, key) => key }),
    attribute: new Proxy({}, { get: (_target, key) => key }) };
  for (const identifier of region(name).matchAll(/\b(_program(?:\$\d+)?)\b/g)) context[identifier[1]!] = program;
  context.owner = owner;
  const expression = name === 'StrEffect' ? 'new StrEffect("effect.str", owner.position, 10000, "")'
    : name === 'GroundAura' ? 'new GroundAura(owner.position, 100, 15, "aura.bmp", 10000)'
      : name === 'SpiritSphere' ? 'new SpiritSphere(owner, 1, false)'
        : name === 'WarlockSphere' ? 'new WarlockSphere(owner, [68])'
          : `new ${name}(owner.position, "aura.bmp", 10000)`;
  const effect = vm.runInContext(expression, context) as Effect;
  effect.ready = true; effect.texture = 'texture';
  if (name === 'SwirlingAura') {
    context.effect = effect;
    vm.runInContext('effect.buffers = effect.bands.map(() => ({}));', context);
  }
  effect._Params = { effect: { attachedEntity: true }, Init: { ownerEntity: owner }, Inst: { position: owner.position } };
  if (name === 'StrEffect') effect.ownerEntity = owner;
  if (name === 'Level99Bubble') {
    effect.updateAnchor = vi.fn();
    for (const column of effect.columns!) for (const anchor of column.anchors) { anchor.x = anchor.z = 0; anchor.y = -1; }
  }
  return { effect, owner, visual, gl, methods, context, Client, Altitude, lastroMovementVisual,
    lastroMovementVisualDirection, disableLastro: () => { lastro = false; } };
}

describe('native attached effect movement display', () => {
  it('reproduces native STR authority override and fixes actual GPU position and owner direction', () => {
    const native = fixture('StrEffect', base);
    native.effect.position = native.visual;
    native.effect.render(native.gl, 10000);
    expect(native.methods.get('uniform3fv')!.mock.calls[0]![1]).toBe(native.owner.position);
    expect(native.effect.position).toBe(native.owner.position);
    const f = fixture('StrEffect');
    const before = Array.from(f.owner.position);
    f.effect.render(f.gl, 10000);
    expect(f.methods.get('uniform3fv')!.mock.calls[0]).toEqual(['uSpritePosition', f.visual]);
    expect(f.effect.ownerDirection).toBe(2);
    expect(f.effect.position).toBe(f.owner.position);
    expect(f.effect._Params!.Inst!.position).toBe(f.owner.position);
    expect(Array.from(f.owner.position)).toEqual(before);
  });

  it('follows STR attached through EffectManager without an explicit ownerEntity', () => {
    const f = fixture('StrEffect'); delete f.effect.ownerEntity;
    f.effect.render(f.gl, 10000);
    expect(f.methods.get('uniform3fv')!.mock.calls[0]![1]).toBe(f.visual);
    expect(f.effect.position).toBe(f.owner.position);
  });

  it('keeps the real entity coordinates authoritative during the actual GPU draw', () => {
    const f = fixture('StrEffect');
    f.gl.uniform3fv!.mockImplementation((_uniform, position) => {
      expect(position).toBe(f.visual);
      expect(Array.from(f.owner.position)).toEqual([3, 4, 7]);
      expect(f.owner.position).not.toBe(f.visual);
    });
    f.effect.render(f.gl, 10000);
    expect(f.gl.uniform3fv).toHaveBeenCalled();
  });

  it.each(['SwirlingAura', 'GroundAura', 'Level99Bubble'] as const)('%s samples the displayed ground cell and restores the authority reference', name => {
    const f = fixture(name); f.effect.render(f.gl, 10000);
    expect(f.Altitude.getCellHeight).toHaveBeenCalledWith(f.visual[0], f.visual[1]);
    expect(f.effect.position).toBe(f.owner.position);
    expect(f.effect._Params!.Inst!.position).toBe(f.owner.position);
    expect(Array.from(f.owner.position)).toEqual([3, 4, 7]);
    if (name === 'GroundAura') expect(f.methods.get('uniform3fv')!.mock.calls[0])
      .toEqual(['uWorldPosition', [4.5, 6, 10.55]]);
    if (name === 'SwirlingAura') {
      const model = f.methods.get('uniformMatrix4fv')!.mock.calls[0]![2] as Float32Array;
      expect(Array.from(model.slice(12, 15))).toEqual([5, -10.5, 6.5]);
    }
    if (name === 'Level99Bubble') {
      const points = f.effect.tmpPoints!;
      expect(points.reduce((sum, point) => sum + point[0]!, 0) / points.length).toBeCloseTo(5);
      expect(points.reduce((sum, point) => sum + point[2]!, 0) / points.length).toBeCloseTo(6.5);
    }
  });

  it.each(['SpiritSphere', 'WarlockSphere'] as const)('%s uploads the display position while preserving native orbit animation', name => {
    const f = fixture(name); f.effect.render(f.gl, 10000);
    expect(f.methods.get('uniform3fv')!.mock.calls[0]).toEqual(['uPosition', f.visual]);
    expect(f.methods.get('drawArrays')).toHaveBeenCalled();
    expect(f.effect.initialAlpha).toBe(0.005);
    expect(f.effect.position).toBe(f.owner.position);
    expect(Array.from(f.owner.position)).toEqual([3, 4, 7]);
  });

  it.each(names)('%s preserves another entity and does not resolve a local view', name => {
    const f = fixture(name);
    const other: Owner = { ...f.owner, position: new Float32Array([8, 9, 17]), direction: 4 };
    f.effect.position = other.position;
    f.effect._Params!.Init!.ownerEntity = other;
    f.effect._Params!.Inst!.position = other.position;
    if (name === 'StrEffect') f.effect.ownerEntity = other;
    f.effect.render(f.gl, 10000);
    expect(f.lastroMovementVisual).not.toHaveBeenCalled();
    expect(f.effect.position).toBe(other.position);
    if (name === 'StrEffect') expect(f.effect.ownerDirection).toBe(4);
  });

  it.each(names)('%s preserves fixed ground effects even when their position is the local authority array', name => {
    const f = fixture(name); f.effect._Params!.effect!.attachedEntity = false;
    f.effect.render(f.gl, 10000);
    expect(f.lastroMovementVisual).not.toHaveBeenCalled();
    expect(f.effect.position).toBe(f.owner.position);
    if (name === 'StrEffect') expect(f.effect.ownerDirection).toBe(f.owner.direction);
  });

  it.each(['SwirlingAura', 'GroundAura', 'Level99Bubble', 'SpiritSphere', 'WarlockSphere'] as const)(
    '%s keeps explicit copied positions fixed even with an attached owner', name => {
      const f = fixture(name); const fixed = new Float32Array(f.owner.position); f.effect.position = fixed;
      f.effect.render(f.gl, 10000);
      expect(f.lastroMovementVisual).not.toHaveBeenCalled(); expect(f.effect.position).toBe(fixed);
    });

  it.each(names)('%s leaves non-LastRO runtime behavior unchanged', name => {
    const f = fixture(name); f.disableLastro(); f.effect.render(f.gl, 10000);
    expect(f.lastroMovementVisual).not.toHaveBeenCalled(); expect(f.effect.position).toBe(f.owner.position);
  });

  it('supports native STR owner attachments without EffectManager metadata', () => {
    const f = fixture('StrEffect'); delete f.effect._Params;
    f.effect.render(f.gl, 10000);
    expect(f.methods.get('uniform3fv')!.mock.calls[0]![1]).toBe(f.visual);
    expect(f.effect.position).toBe(f.owner.position); expect(f.effect.ownerDirection).toBe(2);
  });

  it.each(names)('%s restores display-only references after rendering throws', name => {
    const f = fixture(name);
    f.gl.bindTexture!.mockImplementation(() => { throw new Error('GL failed'); });
    f.gl.bindBuffer!.mockImplementation(() => { throw new Error('GL failed'); });
    expect(() => f.effect.render(f.gl, 10000)).toThrow('GL failed');
    expect(f.effect.position).toBe(f.owner.position);
    expect(f.effect._Params!.Inst!.position).toBe(f.owner.position);
    expect(Array.from(f.owner.position)).toEqual([3, 4, 7]);
  });

  it('removes a temporary STR instance position when no position existed before rendering', () => {
    const f = fixture('StrEffect'); delete f.effect._Params!.Inst!.position;
    f.Client.loadFile.mockImplementation(() => { throw new Error('resource failed'); });
    expect(() => f.effect.render(f.gl, 10000)).toThrow('resource failed');
    expect(Object.hasOwn(f.effect._Params!.Inst!, 'position')).toBe(false);
    expect(f.effect.position).toBe(f.owner.position);
  });

  it('restores a previous STR position when a bound owner refreshes from another origin', () => {
    const f = fixture('StrEffect'); const previous = new Float32Array([1, 2, 3]); f.effect.position = previous;
    f.effect.render(f.gl, 10000);
    expect(f.methods.get('uniform3fv')!.mock.calls[0]![1]).toBe(f.visual);
    expect(f.effect.position).toBe(previous);
  });

  it('falls back to native rendering if movement display helpers are absent', () => {
    const f = fixture('StrEffect'); delete f.context.lastroMovementVisual;
    f.effect.render(f.gl, 10000);
    expect(f.effect.position).toBe(f.owner.position); expect(f.effect.ownerDirection).toBe(6);
  });
});

describe('movement effect runtime patch anchors', () => {
  it.each(['LF', 'CRLF', 'mixed'] as const)('executes equivalent %s native effect code', ending => {
    let source = base.replace(/\r\n/g, '\n');
    if (ending === 'CRLF') source = source.replace(/\n/g, '\r\n');
    if (ending === 'mixed') source = source.split('\n').map((line, index) => line + (index % 2 ? '\r' : '')).join('\n');
    const f = fixture('StrEffect', patchRuntimeMovementEffects(source)); f.effect.render(f.gl, 10000);
    expect(f.methods.get('uniform3fv')!.mock.calls[0]![1]).toBe(f.visual);
  });

  it('does not alter unrelated native regions or sources without effects', () => {
    const unrelated = '\n//#region src/Renderer/Unrelated.js\nconst value = 1;\n//#endregion\n';
    expect(patchRuntimeMovementEffects(unrelated)).toBe(unrelated);
    expect(patchRuntimeMovementEffects(base + unrelated)).toContain(unrelated);
    for (const name of names) expect(() => patchRuntimeMovementEffects(region(name))).not.toThrow();
  });

  it('serializes actual Node runtime helpers without test-runner aliases', () => {
    const output = patchViteMovementEffects(base);
    expect(output).not.toContain('__vite_ssr_import_');
    const f = fixture('StrEffect', output); f.effect.render(f.gl, 10000);
    expect(f.methods.get('uniform3fv')!.mock.calls[0]![1]).toBe(f.visual);
  });

  it('rejects duplicate regions, changed native render anchors and double installation', () => {
    expect(() => patchRuntimeMovementEffects(base + region('StrEffect'))).toThrow('anchor:movement-effects');
    expect(() => patchRuntimeMovementEffects(base.replace('render(gl, tick)', 'render(gl, now)'))).toThrow('anchor:movement-effects');
    expect(() => patchRuntimeMovementEffects(base.replace('this.position = this.ownerEntity.position;', 'this.position = owner.position;')))
      .toThrow('anchor:movement-effects');
    expect(() => patchRuntimeMovementEffects(base.replace('//#endregion', '//missing-region-end'))).toThrow('anchor:movement-effects');
    expect(() => patchRuntimeMovementEffects(patched)).toThrow('anchor:movement-effects');
  });
});
