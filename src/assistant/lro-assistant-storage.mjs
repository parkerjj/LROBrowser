// LRO 助手 · 加藤惠。独立于客户端快捷账号数据库；只存助手数据。
const PREFIX = 'ro-market-assistant';
const SHARED_PREFERENCE_KEYS = new Set([
  `${PREFIX}:settings:v1`,
  `${PREFIX}:character-settings:v1`,
  `${PREFIX}:global-settings:v1`,
  `${PREFIX}:window-positions:v1`,
  `${PREFIX}:card-decks:v1`,
  `${PREFIX}:equipment-outfits:v1`,
]);

async function openAssistantProfileStorage(profile, options = {}) {
  if (!/^[a-z0-9-]{1,64}$/.test(profile)) throw new TypeError('无效服务器标识');
  const factory = options.indexedDB ?? globalThis.indexedDB;
  if (!factory) throw new Error('助手本地数据库不可用');
  const database = await new Promise((resolve, reject) => {
    const request = factory.open(`lro-assistant-standard:${profile}`, 1);
    let settled = false;
    const timer = globalThis.setTimeout(() => { settled = true; reject(new Error('助手本地数据库打开超时')); }, 5000);
    request.onupgradeneeded = () => request.result.createObjectStore('values');
    request.onerror = () => { globalThis.clearTimeout(timer); reject(request.error); };
    request.onblocked = () => { globalThis.clearTimeout(timer); settled = true; reject(new Error('助手本地数据库被占用')); };
    request.onsuccess = () => {
      globalThis.clearTimeout(timer);
      if (settled) request.result.close();
      else resolve(request.result);
    };
  });
  const memory = new Map();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction('values', 'readonly');
    const request = transaction.objectStore('values').openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) { memory.set(cursor.key, cursor.value); cursor.continue(); }
    };
    transaction.oncomplete = resolve;
    transaction.onerror = transaction.onabort = () => reject(transaction.error ?? new Error('助手数据读取失败'));
  }).catch(error => { database.close(); throw error; });
  let closed = false;
  let fault = null;
  let pending = 0;
  let tail = Promise.resolve();
  const validate = key => {
    if (typeof key !== 'string' || !key.startsWith(PREFIX + ':') && !key.startsWith(PREFIX + '-manual:')) {
      throw new TypeError('助手只允许访问自己的数据');
    }
    if (closed) throw new Error('助手数据库已关闭');
    if (fault) throw fault;
  };
  database.onversionchange = () => { closed = true; database.close(); };
  function write(key, value) {
    validate(key);
    if (memory.get(key) === value || value === null && !memory.has(key)) return;
    if (value === null) memory.delete(key); else memory.set(key, value);
    pending++;
    // Keep writes ordered. A failure is sticky: subsequent writes cannot pretend
    // they are durable, and flush() continues to reject until the next reload.
    tail = tail.then(() => new Promise((resolve, reject) => {
      const transaction = database.transaction('values', 'readwrite');
      const store = transaction.objectStore('values');
      if (value === null) store.delete(key); else store.put(value, key);
      transaction.oncomplete = resolve;
      transaction.onerror = transaction.onabort = () => reject(transaction.error ?? new Error('助手数据保存失败'));
    })).finally(() => { pending--; });
    void tail.catch(error => {
      if (!fault) { fault = error; options.onError?.(error); }
    });
  }
  const storage = {
    get length() { return memory.size; },
    key(index) { return [...memory.keys()][index] ?? null; },
    getItem(key) { validate(key); return memory.get(key) ?? null; },
    setItem(key, value) { write(key, String(value)); },
    removeItem(key) { write(key, null); },
    async flush() { await tail; if (fault) throw fault; },
    async close() { try { await storage.flush(); } finally { closed = true; database.close(); } },
    get status() { return { pending, failed: Boolean(fault), closed }; },
  };
  return storage;
}

export async function openAssistantStorage(profile, options = {}) {
  let activeProfile = profile;
  let active = await openAssistantProfileStorage(profile, options);
  let preferences;
  try { preferences = await openAssistantProfileStorage('preferences', options); }
  catch (error) { await active.close().catch(() => {}); throw error; }
  let switchQueue = Promise.resolve();
  let closed = false;
  let switching = false;
  const backing = key => SHARED_PREFERENCE_KEYS.has(key) ? preferences : active;

  const storage = {
    get profile() { return activeProfile; },
    get length() { return new Set([...Array.from({ length: active.length }, (_, index) => active.key(index)), ...Array.from({ length: preferences.length }, (_, index) => preferences.key(index))]).size; },
    key(index) { return [...new Set([...Array.from({ length: active.length }, (_, n) => active.key(n)), ...Array.from({ length: preferences.length }, (_, n) => preferences.key(n))])][index] ?? null; },
    getItem(key) { return backing(key).getItem(key); },
    getProfileItem(key) { return active.getItem(key); },
    setItem(key, value) { if (switching) throw new Error('助手服务器资料正在切换'); backing(key).setItem(key, value); },
    removeItem(key) { if (switching) throw new Error('助手服务器资料正在切换'); backing(key).removeItem(key); },
    async flush() { await switchQueue; await Promise.all([active.flush(), preferences.flush()]); },
    async close() {
      await switchQueue;
      if (closed) return;
      closed = true;
      const results = await Promise.allSettled([active.close(), preferences.close()]);
      const failed = results.find(result => result.status === 'rejected');
      if (failed?.status === 'rejected') throw failed.reason;
    },
    async switchProfile(nextProfile) {
      if (closed) throw new Error('助手数据库已关闭');
      const transition = switchQueue.then(async () => {
        if (closed) throw new Error('助手数据库已关闭');
        if (nextProfile === activeProfile) return;
        switching = true;
        try {
          await active.flush();
          const next = await openAssistantProfileStorage(nextProfile, options);
          try { await active.close(); }
          catch (error) { await next.close().catch(() => {}); throw error; }
          active = next;
          activeProfile = nextProfile;
        } finally { switching = false; }
      });
      switchQueue = transition.catch(() => {});
      await transition;
    },
    get status() {
      return {
        ...active.status,
        pending: active.status.pending + preferences.status.pending,
        failed: active.status.failed || preferences.status.failed,
        profile: activeProfile,
      };
    },
  };
  return storage;
}
