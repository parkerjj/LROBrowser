import 'fake-indexeddb/auto';
import { expect, test } from 'vitest';
import { createKoreConfigStore } from '../src/kore/kore-config-store.mjs';

test('seeds missing defaults atomically without overwriting saved character documents', async () => {
  const store = createKoreConfigStore({ databaseName: `kore-seed-${Math.random()}`, indexedDBFactory: indexedDB });
  const identity = { profile: 'lastro-20211103', aid: 11, cid: 22 };
  const defaults = { 'config.txt': 'attackAuto 2\n', 'pickupitems.txt': 'all 1\n' };
  try {
    await store.saveDocument({ ...identity, fileName: 'config.txt', rawText: 'attackAuto 0\n' });
    await Promise.all([store.ensureDefaults(identity, defaults), store.ensureDefaults(identity, defaults)]);
    expect(await store.getDocument({ ...identity, fileName: 'config.txt' })).toMatchObject({ rawText: 'attackAuto 0\n', revision: 1 });
    expect(await store.getDocument({ ...identity, fileName: 'pickupitems.txt' })).toMatchObject({ rawText: 'all 1\n', revision: 1 });
    expect(await store.listDocuments({ ...identity, cid: 33 })).toEqual([]);
    await store.saveDocument({ ...identity, fileName: 'pickupitems.txt', rawText: '' });
    await store.ensureDefaults(identity, defaults);
    expect(await store.getDocument({ ...identity, fileName: 'pickupitems.txt' })).toMatchObject({ rawText: '', revision: 2 });
  } finally { await store.close(); }
});

test('stores config documents by profile and character with monotonic revisions', async () => {
  const databaseName = `kore-config-${Date.now()}-${Math.random()}`;
  const store = createKoreConfigStore({ databaseName, indexedDBFactory: indexedDB });
  try {
    const first = await store.saveDocument({ profile: 'lastro-20211103', aid: 11, cid: 22, fileName: 'config.txt', rawText: 'attackAuto 1\n' });
    const second = await store.saveDocument({ profile: 'lastro-20211103', aid: 11, cid: 22, fileName: 'config.txt', rawText: 'attackAuto 2\n' });
    expect(first.revision).toBe(1);
    expect(second.revision).toBe(2);
    expect(await store.getDocument({ profile: 'lastro-20211103', aid: 11, cid: 22, fileName: 'config.txt' })).toMatchObject(second);
    expect((await store.listDocuments({ profile: 'lastro-20211103', aid: 11, cid: 22 })).map(document => document.fileName)).toEqual(['config.txt']);
    expect((await store.getReloadDocuments({ profile: 'lastro-20211103', aid: 11, cid: 22 })).length).toBe(1);
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

