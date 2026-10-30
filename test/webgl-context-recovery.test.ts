import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

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
  it('allocates post-process framebuffers only for active effects', async () => {
    const source = await runtimeSource();
    const prepare = section(source, 'static prepare(gl)', 'static render(gl)');
    const resize = section(source, 'static recreateFbo(gl, width, height)', 'static clean(gl)');
    const bloom = section(source, 'Bloom = class Bloom', '//#endregion');
    const bloomInit = section(bloom, 'static init(gl)', 'static recreateFbo(gl, width, height)');
    const bloomRelease = section(bloom, 'static releaseFbo(gl)', 'static recreateFbo(gl, width, height)');

    expect(prepare).toContain('if (_activeEffects.length > 0) this.validateBuffers(gl);');
    expect(prepare).toContain('this.releaseBuffers(gl);');
    expect(resize).toContain('_effects.filter((module) => module.isActive())');
    expect(resize).toContain('if (activeEffects.length === 0)');
    expect(resize).toContain('this.releaseBuffers(gl);');
    expect(resize).toContain('activeEffects.forEach');
    expect(section(bloom, 'static render(gl, inputTexture, outputFbo)', 'static init(gl)')).toContain('PostProcess.createFbo');
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
