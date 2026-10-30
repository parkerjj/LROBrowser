import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { patchRuntimeHalloweenGround, patchRuntimeHalloweenWorld } from '../scripts/patch-v2-runtime.mjs';

function groundShader(source: string): string {
  const match = source.match(/(?:^|\n)[\x20]{2}Ground_default\$1\s*=\s*("(?:\\.|[^"\\])*")/);
  if (!match?.[1]) throw new Error('Ground shader literal not found');
  return JSON.parse(match[1]) as string;
}

describe('Halloween Ground color grade', () => {
  it('applies the seasonal color grade only to GND fragments after fog', async () => {
    const source = await readFile(new URL('../vendor/v2/Online.js', import.meta.url), 'utf8');
    const patched = patchRuntimeHalloweenWorld(source);
    const shader = groundShader(patched);
    const fog = shader.indexOf('fragColor    = mix( fragColor, vec4(uFogColor, fragColor.w), fogFactor );');
    const grade = shader.indexOf('if (uLastroHalloweenActive)');

    expect(shader).toContain('uniform bool uLastroHalloweenActive;');
    expect(fog).toBeGreaterThanOrEqual(0);
    expect(grade).toBeGreaterThan(fog);
    expect(shader).toContain('dot(vec3(0.698518, 0.194785, -0.025253), color) - 0.03');
    expect(shader).toContain('dot(vec3(0.131761, 0.798064, 0.029082), color) - 0.03');
    expect(shader).toContain('dot(vec3(0.167723, 0.130624, 0.654795), color) - 0.03');
    expect(shader).toContain('fragColor.rgb = vec3(');
    expect(shader).not.toContain('fragColor.a =');
    expect(patched).toContain('gl.uniform1i(uniform.uLastroHalloweenActive, Boolean(effects?.seasonal && !effects.disabled));');
    expect(patched.match(/uLastroHalloweenActive/g)).toHaveLength(3);
  });

  it('fails closed when the upstream Ground shader anchor changes', () => {
    expect(() => patchRuntimeHalloweenGround('var Ground_default$1;')).toThrow('anchor:halloween-ground-shader');
  });
});
