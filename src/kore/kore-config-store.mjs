const STORE_NAME = 'documents';
const PROFILE_FILE_NAMES = ['config.txt', 'mon_control.txt', 'pickupitems.txt', 'items_control.txt', 'timeouts.txt'];

function documentKey(document) {
  return JSON.stringify([document.profile, document.aid, document.cid, document.nid, document.fileName]);
}

function cloneDocument(document) {
  return { profile: document.profile, aid: document.aid, cid: document.cid, nid: document.nid,
    fileName: document.fileName, rawText: document.rawText, revision: document.revision,
    savedAt: Number.isSafeInteger(document.savedAt) ? document.savedAt : null };
}

function validIdentity(identity) {
  return Boolean(identity && typeof identity.profile === 'string' && identity.profile.trim()
    && Number.isSafeInteger(identity.aid) && identity.aid > 0
    && Number.isSafeInteger(identity.cid) && identity.cid > 0
    && Number.isSafeInteger(identity.nid) && identity.nid > 0);
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
    if (!validIdentity(document)
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
        saved = { ...cloneDocument(document), revision, savedAt: Date.now() };
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
  async function replaceProfile(identity, files) {
    if (!validIdentity(identity) || !files || typeof files !== 'object' || Array.isArray(files)
      || Object.keys(files).length !== PROFILE_FILE_NAMES.length
      || PROFILE_FILE_NAMES.some(fileName => typeof files[fileName] !== 'string')
      || Object.keys(files).some(fileName => !PROFILE_FILE_NAMES.includes(fileName))) throw Error('config-profile-invalid');
    const database = await open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const saved = [];
      const savedAt = Date.now();
      for (const fileName of PROFILE_FILE_NAMES) {
        const document = { ...identity, fileName, rawText: files[fileName] };
        const key = documentKey(document);
        const request = objectStore.get(key);
        request.onsuccess = () => {
          const next = { ...document, revision: (request.result?.revision ?? 0) + 1, savedAt };
          objectStore.put({ ...next, key });
          saved.push(next);
        };
      }
      transaction.oncomplete = () => resolve(saved.map(cloneDocument));
      transaction.onerror = () => reject(transaction.error ?? Error('config-storage-write-failed'));
      transaction.onabort = () => reject(transaction.error ?? Error('config-storage-write-failed'));
    });
  }
  async function listDocuments(identity) {
    if (!validIdentity(identity)) throw Error('config-identity-invalid');
    const database = await open();
    return new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).openCursor();
      const documents = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) { resolve(documents.filter(document => document.profile === identity.profile && document.aid === identity.aid
          && document.cid === identity.cid && document.nid === identity.nid)); return; }
        documents.push(cloneDocument(cursor.value));
        cursor.continue();
      };
      request.onerror = () => reject(request.error ?? Error('config-storage-list-failed'));
    });
  }
  async function getProfile(identity) {
    const documents = await listDocuments(identity);
    const byName = new Map(documents.map(document => [document.fileName, document]));
    if (PROFILE_FILE_NAMES.some(fileName => !byName.has(fileName))) return null;
    return PROFILE_FILE_NAMES.map(fileName => byName.get(fileName));
  }
  return {
    saveDocument,
    getDocument,
    replaceProfile,
    getProfile,
    listDocuments,
    getReloadDocuments: listDocuments,
    async close() { const database = await databasePromise; database?.close(); databasePromise = null; },
  };
}

