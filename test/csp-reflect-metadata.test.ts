import { describe, expect, it } from 'vitest';
import vm from 'node:vm';
import { cspSafeReflectMetadata } from '../vite.config';

describe('CSP-safe TLS certificate metadata polyfill', () => {
  it('replaces only legacy dynamic global accessors with standard globalThis', () => {
    const original = [
      'function GetGlobal(){',
      'function direct(){try{return Function("return this;")()}catch{}}',
      'function fallback(){try{return (0, eval)("(function() { return this; })()")}catch{}}',
      'return direct() || fallback();',
      '}',
      'Reflect.defineMetadata = metadata => metadata;',
    ].join('\n');
    const patched = cspSafeReflectMetadata(original);
    expect(patched).not.toMatch(/\bFunction\s*\(|\beval\s*\(/);
    expect(patched).toContain('return globalThis');
    expect(patched).toContain('Reflect.defineMetadata = metadata => metadata;');
    expect(vm.runInNewContext(patched + '\nGetGlobal() === globalThis;')).toBe(true);
  });

  it('requires both known replacements so dependency upgrades cannot silently bypass IWA audit', () => {
    expect(() => cspSafeReflectMetadata('function ordinary() { return globalThis; }'))
      .toThrow('Unexpected reflect-metadata global detection');
    expect(() => cspSafeReflectMetadata('Function("return this;")()'))
      .toThrow('Function=1, eval=0');
  });
});
