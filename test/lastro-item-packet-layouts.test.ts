import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { patchRuntimeLastROItemLayouts } from '../scripts/lastro-item-packet-layouts.mjs';

const native = readFileSync('vendor/v2/Online.js', 'utf8');
function networkRegion(source: string): string {
  const start = source.indexOf('//#region src/Network/NetworkManager.js');
  return source.slice(start, source.indexOf('//#endregion', start));
}

describe('LastRO item packet layouts', () => {
  it('leaves the native network manager region unchanged', () => {
    const output = patchRuntimeLastROItemLayouts(native);
    expect(networkRegion(output)).toBe(networkRegion(native));
    expect(output).not.toContain('function lastroReceivePackets(');
    expect(output).not.toContain('Packet decoder exceeded frame bounds');
    expect(output).not.toContain('Packet handler failed after decoding');
  });

  it('leaves unrelated runtime modules unchanged', () => {
    const unrelated = 'export const worker = true;';
    expect(patchRuntimeLastROItemLayouts(unrelated)).toBe(unrelated);
  });

  it('rejects a second application of the six reviewed layout adjustments', () => {
    expect(() => patchRuntimeLastROItemLayouts(patchRuntimeLastROItemLayouts(native))).toThrow('anchor:network-security:item-layout');
  });
});
