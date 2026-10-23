import 'fake-indexeddb/auto';
import { expect, test } from 'vitest';
import { createKoreConfigStore } from '../src/kore/kore-config-store.mjs';

const profileFiles = {
  'config.txt': 'attackAuto 2\n',
  'mon_control.txt': '1002 1 0 0\n',
  'pickupitems.txt': 'all 1\n',
  'items_control.txt': 'all 0 1 0\n',
  'timeouts.txt': 'ai_move_giveup 1\n',
};

test('replaces active profile documents atomically and scopes the cache by aid/cid/nid', async () => {
  const store = createKoreConfigStore({ databaseName: `kore-profile-${Math.random()}`, indexedDBFactory: indexedDB });
  const identity = { profile: 'lastro-20211103', aid: 11, cid: 22, nid: 33 };
  try {
    const saved = await store.replaceProfile(identity, profileFiles);
    expect(saved).toHaveLength(5);
    expect(saved.every(document => Number.isSafeInteger(document.savedAt))).toBe(true);
    expect((await store.getProfile(identity))?.map(document => document.fileName).sort()).toEqual(Object.keys(profileFiles).sort());
    expect(await store.getProfile({ ...identity, nid: 34 })).toBeNull();
    await expect(store.replaceProfile(identity, { ...profileFiles, 'timeouts.txt': undefined })).rejects.toThrow('config-profile-invalid');
    expect((await store.getProfile(identity))?.find(document => document.fileName === 'config.txt')?.rawText).toBe('attackAuto 2\n');
  } finally { await store.close(); }
});

test('stores config documents by profile and character with monotonic revisions', async () => {
  const databaseName = `kore-config-${Date.now()}-${Math.random()}`;
  const store = createKoreConfigStore({ databaseName, indexedDBFactory: indexedDB });
  try {
    const identity = { profile: 'lastro-20211103', aid: 11, cid: 22, nid: 33 };
    const first = await store.saveDocument({ ...identity, fileName: 'config.txt', rawText: 'attackAuto 1\n' });
    const second = await store.saveDocument({ ...identity, fileName: 'config.txt', rawText: 'attackAuto 2\n' });
    expect(first.revision).toBe(1);
    expect(second.revision).toBe(2);
    expect(await store.getDocument({ ...identity, fileName: 'config.txt' })).toMatchObject(second);
    expect((await store.listDocuments(identity)).map(document => document.fileName)).toEqual(['config.txt']);
    expect((await store.getReloadDocuments(identity)).length).toBe(1);
    await store.saveDocument({ ...identity, nid: 34, fileName: 'config.txt', rawText: 'attackAuto 0\n' });
    expect((await store.listDocuments(identity))[0]?.rawText).toBe('attackAuto 2\n');
  } finally {
    await store.close();
    await new Promise<void>(resolve => {
      const request = indexedDB.deleteDatabase(databaseName);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  }
});

