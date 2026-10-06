// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readLoginPreferences, saveLoginPreferences } from '../src/runtime/login-preferences.mjs';

afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

describe('login preferences', () => {
  it('defaults to traditional mode and 2x without saved preferences', () => {
    expect(readLoginPreferences()).toEqual({ connectionMode: 'relay', serverProfileId: 'lastro-2x' });
  });
  it.each([
    ['relay', 'lastro-3x'], ['relay', 'lastro-2x'], ['direct', 'lastro-app'],
  ] as const)('restores %s and %s after saving', (connectionMode, serverProfileId) => {
    saveLoginPreferences({ connectionMode, serverProfileId });
    expect(readLoginPreferences()).toEqual({ connectionMode, serverProfileId });
  });
  it('normalizes incompatible saved combinations', () => {
    saveLoginPreferences({ connectionMode: 'relay', serverProfileId: 'lastro-app' });
    expect(readLoginPreferences()).toEqual({ connectionMode: 'relay', serverProfileId: 'lastro-2x' });
    saveLoginPreferences({ connectionMode: 'direct', serverProfileId: 'lastro-3x' });
    expect(readLoginPreferences()).toEqual({ connectionMode: 'direct', serverProfileId: 'lastro-app' });
  });
  it('keeps login usable when preference storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(readLoginPreferences()).toEqual({ connectionMode: 'relay', serverProfileId: 'lastro-2x' });
    expect(() => saveLoginPreferences({ connectionMode: 'relay', serverProfileId: 'lastro-3x' })).not.toThrow();
  });
});
