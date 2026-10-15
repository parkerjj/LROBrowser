const STORE_NAME = 'documents';

function documentKey(document) {
  return [document.profile, document.aid, document.cid, document.fileName].join(':');
}

function cloneDocument(document) {
  return { profile: document.profile, aid: document.aid, cid: document.cid, fileName: document.fileName, rawText: document.rawText, revision: document.revision };
}

export function createKoreConfigStore({ page = globalThis, indexedDBFactory = page.indexedDB ?? globalThis.indexedDB, databaseName = 'kore-config' } = {}) {
  let databasePromise = null;
  async function open() {
    if (databasePromise) return databasePromise;
    if (!indexedDBFactory) throw Error('config-storage-unavailable');
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDBFactory.open(databaseName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? Error('config-storage-open-failed'));
    });
    return databasePromise;
  }
  async function getByKey(key) {
    const database = await open();
    return new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result ? cloneDocument(request.result) : null);
      request.onerror = () => reject(request.error ?? Error('config-storage-read-failed'));
    });
  }
  async function saveDocument(document) {
    if (!document || typeof document.profile !== 'string' || !Number.isSafeInteger(document.aid) || !Number.isSafeInteger(document.cid)
      || typeof document.fileName !== 'string' || typeof document.rawText !== 'string') throw Error('config-document-invalid');
    const database = await open();
    const next = await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const key = documentKey(document);
      let saved;
      const getRequest = objectStore.get(key);
      getRequest.onsuccess = () => {
        const revision = (getRequest.result?.revision ?? 0) + 1;
        saved = { ...cloneDocument(document), revision };
        objectStore.put({ ...saved, key });
      };
      transaction.oncomplete = () => resolve(saved);
      transaction.onerror = () => reject(transaction.error ?? Error('config-storage-write-failed'));
      transaction.onabort = () => reject(transaction.error ?? Error('config-storage-write-failed'));
    });
    return next;
  }
  async function getDocument(identity) {
    return getByKey(documentKey(identity));
  }
  async function listDocuments(identity) {
    const database = await open();
    return new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).openCursor();
      const documents = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) { resolve(documents.filter(document => document.profile === identity.profile && document.aid === identity.aid && document.cid === identity.cid)); return; }
        documents.push(cloneDocument(cursor.value));
        cursor.continue();
      };
      request.onerror = () => reject(request.error ?? Error('config-storage-list-failed'));
    });
  }
  return {
    saveDocument,
    getDocument,
    listDocuments,
    getReloadDocuments: listDocuments,
    async close() { const database = await databasePromise; database?.close(); databasePromise = null; },
  };
}

