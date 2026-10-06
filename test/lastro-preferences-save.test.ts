import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';

const original = readVendorSource();
const module = extractVendorRegion('src/Core/Preferences.js', original);

function fixture() {
  const key = 'LastROTeleportOrder:5';
  const storage = new Map([[key, JSON.stringify({ _version: 1, orders: { npc: ['1', '0'] }, geometry: { teleport: { width: 590 } } })]]);
  let fail = false;
  const activePreferences: { value?: { _key: string; save: () => void } } = {};
  const metadataDuringWrite: Array<{ key: string | undefined; save: unknown }> = [];
  const prefs = runInNewContext(`${module}\ninit_Preferences$1(); Preferences.get(${JSON.stringify(key)}, { orders: {} }, 1);`, {
    __esmMin: (initialize: () => void) => initialize,
    localStorage: {
      getItem: (name: string) => storage.get(name) ?? null,
      setItem: (name: string, value: string) => {
        metadataDuringWrite.push({ key: activePreferences.value?._key, save: activePreferences.value?.save });
        if (fail) throw new Error('storage quota exceeded');
        storage.set(name, value);
      },
    },
  }) as { _key: string; save: () => void; customPlaces?: unknown; cyclic?: unknown };
  activePreferences.value = prefs;
  return { prefs, storage, key, metadataDuringWrite, setFailure: (value: boolean) => { fail = value; } };
}

describe('native persistent teleport preferences', () => {
  it('saves custom data alongside existing ordering and geometry without storing methods', () => {
    const f = fixture();
    f.prefs.customPlaces = { version: 1, entries: [{ id: 'saved-1', name: '挖宝任务', map: 'pay_fild11', x: 125, y: 175 }] };
    const save = f.prefs.save;
    f.prefs.save();
    const stored = JSON.parse(f.storage.get(f.key)!);
    expect(stored).toMatchObject({ orders: { npc: ['1', '0'] }, geometry: { teleport: { width: 590 } }, customPlaces: f.prefs.customPlaces });
    expect(stored._key).toBeUndefined(); expect(stored.save).toBeUndefined();
    expect(f.prefs._key).toBe(f.key); expect(f.prefs.save).toBe(save);
    expect(f.metadataDuringWrite.at(-1)).toEqual({ key: f.key, save });
  });

  it('permanent Preferences save can retry after quota or serialization failure', () => {
    const f = fixture(), before = f.storage.get(f.key), save = f.prefs.save;
    f.prefs.customPlaces = { version: 1, entries: [] };
    f.setFailure(true);
    expect(() => f.prefs.save()).toThrow('storage quota exceeded');
    expect(f.prefs._key).toBe(f.key); expect(f.prefs.save).toBe(save);
    expect(f.metadataDuringWrite.at(-1)).toEqual({ key: f.key, save });
    expect(f.storage.get(f.key)).toBe(before);
    f.setFailure(false); f.prefs.save();
    expect(JSON.parse(f.storage.get(f.key)!).customPlaces).toEqual({ version: 1, entries: [] });
    expect(f.storage.has('undefined')).toBe(false);
    const afterRetry = f.storage.get(f.key);
    const cycle: Record<string, unknown> = {}; cycle.self = cycle;
    f.prefs.cyclic = cycle;
    expect(() => f.prefs.save()).toThrow('circular');
    expect(f.prefs._key).toBe(f.key); expect(f.prefs.save).toBe(save);
    expect(f.storage.get(f.key)).toBe(afterRetry);
    delete f.prefs.cyclic;
    f.prefs.save();
    expect(JSON.parse(f.storage.get(f.key)!).customPlaces).toEqual({ version: 1, entries: [] });
  });
});
