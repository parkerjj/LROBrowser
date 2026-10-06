import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDirectSocket, isDirectSocketsSupported, UnsupportedDirectSocketsError } from '../src/network/socket-factory';
afterEach(() => vi.unstubAllGlobals());

describe('Direct TCP factory', () => {
  it('blocks unsupported environments without creating a transport', () => {
    vi.stubGlobal('TCPSocket', undefined);
    expect(isDirectSocketsSupported()).toBe(false);
    expect(() => createDirectSocket('45.248.8.68', 26569)).toThrow(UnsupportedDirectSocketsError);
  });
});
