import 'fake-indexeddb/auto';
import { expect, test } from 'vitest';
import { createKoreConfigStore } from '../src/kore/kore-config-store.mjs';

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

