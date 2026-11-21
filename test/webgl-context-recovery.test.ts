import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { extractRuntimeNode, extractVendorRegion } from './helpers/vendor-runtime';

async function runtimeSource(): Promise<string> {
  return readFile(new URL('../generated/runtime/Online.js', import.meta.url), 'utf8');
}

function section(source: string, startMarker: string, endMarker: string): string {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`Runtime section not found: ${startMarker}`);
  return source.slice(start, end);
}

describe('WebGL resource pressure and context recovery', () => {
  it('resizes the 3D canvas immediately when toggling performance mode without changing UI geometry', async () => {
    const source = await runtimeSource();
    const resize = section(source, 'static resize() {\n      if (this.contextLost', '    /**\n     * Rendering scene')
      .replace('import.meta.url', '"file:///Online.js"');
    const graphicsOptions = 'src/UI/Components/GraphicsOption/GraphicsOption.js';
    const toggle = extractRuntimeNode(source, { region: graphicsOptions, kind: 'function', name: 'onTogglePerformanceMode' });
    const reset = extractRuntimeNode(source, { region: graphicsOptions, kind: 'function', name: 'onResetToDefaults' });
    const canvas = { width: 0, height: 0, style: {} };
    const viewport = vi.fn();
    const resizeEffects = vi.fn();
    const projection = vi.fn();
    const screen = { width: 0, height: 0 };
    let quality = 80;
    const { Renderer, onTogglePerformanceMode, onResetToDefaults } = runInNewContext(
      `const Renderer = class { ${resize} };
       Renderer.canvas = canvas;
       Renderer.gl = gl;
       Renderer.vFov = 15;
       ({ Renderer, onTogglePerformanceMode: ${toggle}, onResetToDefaults: ${reset} })`,
      {
        canvas, gl: { viewport }, Mouse: { screen },
        window: { innerWidth: 1920, innerHeight: 1080, devicePixelRatio: 2 },
        GraphicsSettings: { save() {}, quality, defaults: { quality: 100, performanceMode: false } },
        GraphicsOption: { onAppend() {} },
        Configs: { get: () => quality, set: (_key: string, value: number) => { quality = value; } },
        mat4$9: { perspective: projection }, Camera: { projection: [] },
        Background: { resize() {} }, PostProcess: { recreateFbo: resizeEffects }, __vitePreload() {},
      },
    );

    Renderer.resize();
    expect([canvas.width, canvas.height]).toEqual([3072, 1728]);
    onTogglePerformanceMode.call({ checked: true });
    expect(canvas).toEqual({ width: 2304, height: 1296, style: { width: '1920px', height: '1080px' } });
    expect(screen).toEqual({ width: 1920, height: 1080 });
    expect(projection).toHaveBeenLastCalledWith(15, 1920 / 1080, 1, 1000, []);
    expect(viewport).toHaveBeenLastCalledWith(0, 0, 2304, 1296);
    expect(resizeEffects).toHaveBeenLastCalledWith(Renderer.gl, 2304, 1296);
    onTogglePerformanceMode.call({ checked: false });
    expect([canvas.width, canvas.height]).toEqual([3072, 1728]);
    onTogglePerformanceMode.call({ checked: true });
    onResetToDefaults();
    expect([canvas.width, canvas.height]).toEqual([3840, 2160]);
  });

  it('uses the scaled canvas for real post-processing effects and allocates nothing for performance mode alone', async () => {
    const source = await runtimeSource();
    const post = extractVendorRegion('src/Renderer/Effects/PostProcess.js', source);
    const register = extractRuntimeNode(source, { region: 'src/Renderer/MapRenderer.js', kind: 'function', name: 'registerPostProcessModules' });
    let bloomActive = false;
    const inactiveEffect = { program() {}, isActive: () => false, init() {}, render() {}, clean() {} };
    const gl = {
      FRAMEBUFFER: 1, canvas: { width: 2880, height: 1620 }, bindFramebuffer: vi.fn(), viewport: vi.fn(), clear: vi.fn(),
      isTexture: () => false, isRenderbuffer: () => false, isFramebuffer: () => false,
    };
    const allocate = vi.fn((_gl, width: number, height: number) => ({ width, height, framebuffer: {} }));
    const postProcess = runInNewContext(`${post}
      init_PostProcess();
      PostProcess.createFbo = allocate;
      (${register})(gl);
      PostProcess;`, {
      gl, allocate, init_Graphics() {}, __esmMin: (fn: () => void) => fn,
      GraphicsSettings: { performanceMode: true },
      WebGL_default: { detectBadWebGL: () => false },
      Bloom: { ...inactiveEffect, isActive: () => bloomActive },
      Upsampling: { ...inactiveEffect, isActive: () => true },
      GaussianBlur: inactiveEffect, FXAA: inactiveEffect, CAS: inactiveEffect,
      Cartoon: inactiveEffect, Vibrance: inactiveEffect, VerticalFlip: inactiveEffect, Blind: inactiveEffect,
    });

    postProcess.recreateFbo(gl, gl.canvas.width, gl.canvas.height);
    postProcess.prepare(gl);
    expect(allocate).not.toHaveBeenCalled();
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, null);

    bloomActive = true;
    postProcess.recreateFbo(gl, gl.canvas.width, gl.canvas.height);
    postProcess.prepare(gl);
    expect(allocate.mock.calls.map(([, width, height]) => [width, height])).toEqual([[2880, 1620], [2880, 1620]]);
    bloomActive = false;
    postProcess.prepare(gl);
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, null);
  });

  it('keeps a sprite and its texture when it is reused before scheduled cleanup', async () => {
    const source = await runtimeSource();
    const memory = ['src/Core/MemoryItem.js', 'src/Core/MemoryManager.js'].map(path => extractVendorRegion(path, source));
    let now = 1;
    const idle: Array<(deadline: { timeRemaining: () => number }) => void> = [];
    const cache = runInNewContext(memory.join('\n') + '\ninit_MemoryManager(); MemoryManager;', {
      __esmMin: (fn: () => void) => fn, Date: { now: () => now },
      requestIdleCallback: (callback: typeof idle[number]) => idle.push(callback),
      console: { log() {} },
    });
    const activeTexture = {};
    const expiredTexture = {};
    const gl = { isTexture: () => true, deleteTexture: vi.fn() };
    cache.set('active.spr', { frames: [{ texture: activeTexture }] });
    cache.set('expired.spr', { frames: [{ texture: expiredTexture }] });
    now = 31_001;
    cache.clean(gl, now);
    now++;
    cache.get('active.spr');
    idle.shift()!({ timeRemaining: () => 5 });

    expect(cache.exist('active.spr')).toBe(true);
    expect(cache.exist('expired.spr')).toBe(false);
    expect(gl.deleteTexture).toHaveBeenCalledExactlyOnceWith(expiredTexture);
  });

  it('evicts expired textures in batches without requestIdleCallback', async () => {
    const source = await runtimeSource();
    const memory = ['src/Core/MemoryItem.js', 'src/Core/MemoryManager.js'].map(path => extractVendorRegion(path, source));
    let now = 1;
    const tasks: Array<() => void> = [];
    const cache = runInNewContext(memory.join('\n') + '\ninit_MemoryManager(); MemoryManager;', {
      __esmMin: (fn: () => void) => fn, Date: { now: () => now }, performance: { now: () => now },
      setTimeout: (callback: () => void) => tasks.push(callback), console: { log() {} },
    });
    const gl = { isTexture: () => true, deleteTexture: vi.fn() };
    for (let i = 0; i < 7; i++) cache.set(`${i}.spr`, { frames: [{ texture: { i } }] });

    now = 31_001;
    cache.clean(gl, now);
    expect(gl.deleteTexture).not.toHaveBeenCalled();
    now++;
    cache.get('6.spr');
    tasks.shift()!();
    expect(gl.deleteTexture).toHaveBeenCalledTimes(5);
    tasks.shift()!();
    expect(gl.deleteTexture).toHaveBeenCalledTimes(6);
    expect(cache.exist('6.spr')).toBe(true);

    now = 62_003;
    cache.clean(gl, now);
    tasks.shift()!();
    expect(cache.exist('6.spr')).toBe(false);
  });

  it.each(['first', 'second', 'effect'] as const)('renders to the screen and throttles retries if the %s framebuffer fails', async failure => {
    const post = extractVendorRegion('src/Renderer/Effects/PostProcess.js', await runtimeSource());
    let now = 0;
    let unavailable = true;
    const textures: object[] = [];
    const allocate = vi.fn((_gl, width: number, height: number) => {
      if (unavailable && allocate.mock.calls.length === (failure === 'first' ? 1 : failure === 'second' ? 2 : 0)) return null;
      const buffer = { width, height, framebuffer: {}, texture: {}, rbo: {} };
      textures.push(buffer.texture);
      return buffer;
    });
    const effect = {
      program() {}, isActive: () => true, init() {}, render: vi.fn(), clean() {},
      recreateFbo: () => failure === 'effect' && unavailable ? false : true,
    };
    const gl = {
      FRAMEBUFFER: 1, canvas: { width: 800, height: 600 }, bindFramebuffer: vi.fn(), viewport: vi.fn(), clear: vi.fn(),
      isTexture: () => true, isRenderbuffer: () => true, isFramebuffer: () => true,
      deleteTexture: vi.fn(), deleteRenderbuffer: vi.fn(), deleteFramebuffer: vi.fn(),
    };
    const postProcess = runInNewContext(`${post}
      init_PostProcess();
      PostProcess.createFbo = allocate;
      PostProcess.register(effect, gl);
      PostProcess;`, {
      gl, allocate, effect, performance: { now: () => now }, init_Graphics() {}, __esmMin: (fn: () => void) => fn,
    });

    postProcess.recreateFbo(gl, gl.canvas.width, gl.canvas.height);
    const initialAttempts = failure === 'first' ? 1 : 2;
    expect(allocate).toHaveBeenCalledTimes(initialAttempts);
    for (let i = 1; i <= 3; i++) {
      now = i * 16;
      postProcess.prepare(gl);
      postProcess.render(gl);
    }
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, null);
    expect(effect.render).not.toHaveBeenCalled();
    expect(allocate).toHaveBeenCalledTimes(initialAttempts);
    expect(gl.deleteTexture.mock.calls.map(([texture]) => texture)).toEqual(textures);

    unavailable = false;
    now = 1001;
    postProcess.prepare(gl);
    expect(gl.bindFramebuffer).not.toHaveBeenLastCalledWith(gl.FRAMEBUFFER, null);
    postProcess.render(gl);
    expect(effect.render).toHaveBeenCalledExactlyOnceWith(gl, textures.at(-1), null);
    expect(allocate).toHaveBeenCalledTimes(initialAttempts + 2);
  });

  it('deletes all partially allocated buffers when a framebuffer is incomplete', async () => {
    const source = await runtimeSource();
    const factory = section(source, 'static createFramebuffer(gl, width, height, oldfbo)', '\n  };\n});');
    const framebuffer = {};
    const texture = {};
    const renderbuffer = {};
    const gl = {
      FRAMEBUFFER_COMPLETE: 1,
      createFramebuffer: (): object | null => framebuffer,
      createTexture: () => texture,
      createRenderbuffer: () => renderbuffer,
      checkFramebufferStatus: () => 0,
      bindFramebuffer: vi.fn(),
      bindTexture: vi.fn(),
      texImage2D: vi.fn(),
      texParameteri: vi.fn(),
      framebufferTexture2D: vi.fn(),
      bindRenderbuffer: vi.fn(),
      renderbufferStorage: vi.fn(),
      framebufferRenderbuffer: vi.fn(),
      deleteFramebuffer: vi.fn(),
      deleteTexture: vi.fn(),
      deleteRenderbuffer: vi.fn(),
    };
    const createFramebuffer = runInNewContext(`(class { ${factory} }).createFramebuffer`, {
      console: { error: vi.fn() },
    }) as (context: typeof gl, width: number, height: number, old: null) => unknown;

    expect(createFramebuffer(gl, 32, 32, null)).toBeNull();
    expect(gl.deleteFramebuffer).toHaveBeenCalledExactlyOnceWith(framebuffer);
    expect(gl.deleteTexture).toHaveBeenCalledExactlyOnceWith(texture);
    expect(gl.deleteRenderbuffer).toHaveBeenCalledExactlyOnceWith(renderbuffer);

    const missingFramebuffer = { ...gl, createFramebuffer: () => null, checkFramebufferStatus: () => gl.FRAMEBUFFER_COMPLETE };
    expect(createFramebuffer(missingFramebuffer, 32, 32, null)).toBeNull();
  });

  it('allocates post-process framebuffers only for active effects', async () => {
    const source = await runtimeSource();
    const prepare = section(source, 'static prepare(gl)', 'static render(gl)');
    const resize = section(source, 'static recreateFbo(gl, width, height)', 'static clean(gl)');
    const bloom = section(source, 'Bloom = class Bloom', '//#endregion');
    const bloomInit = section(bloom, 'static init(gl)', 'static recreateFbo(gl, width, height)');
    const bloomRelease = section(bloom, 'static releaseFbo(gl)', 'static recreateFbo(gl, width, height)');

    expect(prepare).toContain('this.recreateFbo(gl, gl.canvas.width, gl.canvas.height);');
    expect(resize).toContain('_effects.filter((module) => module.isActive())');
    expect(resize).toContain('if (_activeEffects.length === 0) this.releaseBuffers(gl);');
    expect(section(bloom, 'static recreateFbo(gl, width, height)', 'static isActive()')).toContain('PostProcess.createFbo');
    expect(bloomInit).not.toContain('this.recreateFbo(gl, gl.canvas.width, gl.canvas.height);');
    expect(bloomRelease).toContain('_internalFbo = null;');
  });

  it('rebuilds the page after context restoration without clearing scene callbacks', async () => {
    const source = await runtimeSource();
    const lost = section(source, 'static onContextLost(event)', 'static onContextRestored(event)');
    const restored = section(source, 'static onContextRestored(event)', 'static show()');
    const renderer = section(source, 'Renderer = class {', 'static onContextLost(event)');

    expect(lost).not.toContain('this.stop();');
    expect(lost).not.toContain('this.renderCallbacks.length = 0;');
    expect(lost).toContain('重新加载游戏');
    expect(lost).toContain('this.rendering = false;');
    expect(lost).toContain('_cancelAnimationFrame(this.updateId);');
    expect(restored).toContain('window.location.reload()');
    expect(restored).toContain('sessionStorage');
    expect(restored).not.toContain('PostProcess.restartModules(gl);');
    expect(renderer).toContain('window.setTimeout');
    expect(renderer).toContain('lastro-webgl-context-recovery');
  });
});
