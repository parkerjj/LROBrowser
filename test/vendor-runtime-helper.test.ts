import { describe, expect, it } from 'vitest';
import { getRuntimeSourceFile } from './helpers/vendor-runtime';

describe('vendor runtime source parsing', () => {
  it('reuses the parsed AST for an identical source slice', () => {
    const source = 'function sample() { return 1; }';
    const first = getRuntimeSourceFile(source, 'sample.js');
    const second = getRuntimeSourceFile(source, 'sample.js');

    expect(first.fileName).toBe('sample.js');
    expect(second).toBe(first);
  });
});
