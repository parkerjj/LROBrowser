// Shared console model and renderer for the KE small window and fullscreen panel.
// Rust owns the output blocks; this module only expands them for display.

const DOMAIN_COLORS = Object.freeze({
  attackMon: '#00bcd4', attackMonMiss: '#00bcd4',
  attacked: '#c050c0', attackedMiss: '#c050c0',
  others: '#7d8087', exp: '#d6dbe1',
  connection: '#2e9e4f', startup: '#2e9e4f',
  success: '#2e9e4f', system: '#d8b84a', pm: '#d8b84a', schat: '#d8b84a', teleport: '#d8b84a',
  menu: '#d8b84a', list: '#d6dbe1', info: '#d6dbe1',
  equip: '#9a9a9a', plugin: '#9a9a9a', debug: '#9a9a9a',
  drop: '#5c8dff', useItem: '#5c8dff',
  route: '#2e9e4f', skill: '#2e9e4f', selfSkill: '#2e9e4f',
  publicchat: '#2e9e4f', selfchat: '#2e9e4f', guildchat: '#2e9e4f', partychat: '#a0522d',
});
const LEVEL_COLORS = Object.freeze({ error: '#e06060', warning: '#d8b84a', warn: '#d8b84a', debug: '#9a9a9a', message: null });
export const KORE_CONSOLE_MAX_ENTRIES = 1000;

// Console categories the user can hide from the fullscreen panel. Domains outside
// this list (system, info, list, errors, warnings, command replies) are always shown.
export const KORE_CONSOLE_CATEGORIES = Object.freeze([
  { id: 'attackMon', label: '我的攻击', domains: ['attackMon', 'attackMonMiss'] },
  { id: 'attacked', label: '受到攻击', domains: ['attacked', 'attackedMiss'] },
  { id: 'selfSkill', label: '我的技能', domains: ['selfSkill'] },
  { id: 'skill', label: '他人对我的技能', domains: ['skill'] },
  { id: 'others', label: '他人之间的战斗', domains: ['others'], hiddenByDefault: true },
  { id: 'exp', label: '经验与击杀', domains: ['exp'] },
  { id: 'drop', label: '掉落', domains: ['drop'] },
  { id: 'useItem', label: '物品与拾取', domains: ['useItem'] },
  { id: 'npc', label: 'NPC 对话', domains: ['npc'] },
  { id: 'route', label: '移动路线', domains: ['route'] },
  { id: 'equip', label: '装备', domains: ['equip'] },
  { id: 'supply', label: '补给', domains: ['supply'] },
  { id: 'respawn', label: '复活', domains: ['respawn'] },
]);
const FILTER_STORAGE_KEY = 'kore.console.hidden';

export function createConsoleFilter({ storage = null } = {}) {
  const categoryByDomain = new Map(KORE_CONSOLE_CATEGORIES.flatMap(category => category.domains.map(domain => [domain, category.id])));
  const defaults = () => new Set(KORE_CONSOLE_CATEGORIES.filter(category => category.hiddenByDefault).map(category => category.id));
  let hidden = defaults();
  try {
    const saved = JSON.parse(storage?.getItem?.(FILTER_STORAGE_KEY) ?? 'null');
    if (Array.isArray(saved)) hidden = new Set(saved.filter(id => KORE_CONSOLE_CATEGORIES.some(category => category.id === id)));
  } catch { /* A corrupt saved filter falls back to the defaults. */ }
  const listeners = new Set();
  const commit = () => {
    try { storage?.setItem?.(FILTER_STORAGE_KEY, JSON.stringify([...hidden])); } catch { /* Persistence is best effort. */ }
    for (const listener of listeners) { try { listener(); } catch { /* UI must not affect transport. */ } }
  };
  return {
    isVisible(domain) {
      const id = categoryByDomain.get(domain);
      return id === undefined || !hidden.has(id);
    },
    isCategoryVisible: id => !hidden.has(id),
    hiddenCount: () => hidden.size,
    setCategoryVisible(id, visible) {
      if (!KORE_CONSOLE_CATEGORIES.some(category => category.id === id)) return;
      if (visible === !hidden.has(id)) return;
      if (visible) hidden.delete(id); else hidden.add(id);
      commit();
    },
    reset() { hidden = defaults(); commit(); },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function consoleColor(domain, level) {
  const override = LEVEL_COLORS[String(level ?? '').toLowerCase()];
  if (override) return override;
  return DOMAIN_COLORS[domain] ?? DOMAIN_COLORS.info;
}

const cell = value => String(value ?? '').replace(/\s+/g, ' ').trim();

// CJK text is two terminal cells wide; padding must follow display width so
// Chinese names and item lists line up in the monospace console.
export function displayWidth(value) {
  let width = 0;
  for (const character of String(value ?? '')) {
    const code = character.codePointAt(0);
    if (code === 0x200b || code === 0xfeff || (code >= 0x0300 && code <= 0x036f)) continue;
    width += (code >= 0x1100 && (code <= 0x115f
      || code === 0x2329 || code === 0x232a
      || (code >= 0x2e80 && code <= 0xa4cf && code !== 0x303f)
      || (code >= 0xac00 && code <= 0xd7a3)
      || (code >= 0xf900 && code <= 0xfaff)
      || (code >= 0xfe10 && code <= 0xfe19)
      || (code >= 0xfe30 && code <= 0xfe6f)
      || (code >= 0xff00 && code <= 0xff60)
      || (code >= 0xffe0 && code <= 0xffe6)
      || (code >= 0x1f300 && code <= 0x1faff)
      || (code >= 0x20000 && code <= 0x3fffd))) ? 2 : 1;
  }
  return width;
}

const padDisplay = (value, width) => `${value}${' '.repeat(Math.max(0, width - displayWidth(value)))}`;

export function tableText(columns, rows) {
  const widths = (columns ?? []).map((column, index) => Math.max(
    displayWidth(cell(column)),
    ...(rows ?? []).map(row => displayWidth(cell(row?.[index]))),
  ));
  const line = row => (row ?? []).map((value, index) => padDisplay(cell(value), widths[index] ?? 0)).join('  ').trimEnd();
  return [line(columns), ...(rows ?? []).map(line)];
}

export function outputBlockLines(block) {
  if (!block || typeof block !== 'object') return [];
  if (block.type === 'text') return [{ text: String(block.text ?? ''), domain: block.domain ?? 'info', level: block.level ?? 'message' }];
  if (block.type === 'kv') {
    return (block.pairs ?? []).map(([key, value]) => ({
      text: `${padDisplay(cell(key), 12)}${cell(value)}`, domain: block.domain ?? 'info', level: block.level ?? 'message',
    }));
  }
  if (block.type === 'table') {
    return tableText(block.columns, block.rows).map(text => ({ text, domain: block.domain ?? 'list', level: block.level ?? 'message' }));
  }
  if (block.type === 'map') {
    return [{
      text: `map ${block.mapName ?? '-'} ${block.width ?? '?'}x${block.height ?? '?'}`,
      domain: block.domain ?? 'info', level: block.level ?? 'message',
    }];
  }
  return [];
}

export function outputLines(result) {
  const blocks = Array.isArray(result?.blocks) ? result.blocks : [];
  const lines = blocks.flatMap(outputBlockLines);
  if (lines.length) return lines;
  return [{ text: `${result?.ok ? 'OK' : 'ERROR'} ${result?.command ?? ''}`.trim(), domain: 'info', level: result?.ok ? 'message' : 'error' }];
}

export function logLines(entry) {
  if (entry?.blocks) {
    return outputLines({ blocks: entry.blocks, ok: entry.level !== 'error', command: entry.command ?? '' })
      .map(line => ({ ...line, timestamp: entry.timestamp }));
  }
  return [{ text: String(entry?.text ?? ''), domain: entry?.domain ?? 'info', level: entry?.level ?? 'message', timestamp: entry?.timestamp }];
}

export function consoleLines(entries) {
  return (entries ?? []).flatMap(logLines);
}

export function createKoreConsoleModel({ host, maxEntries = KORE_CONSOLE_MAX_ENTRIES, storage = null }) {
  const filter = createConsoleFilter({ storage });
  let entries = [];
  let lastLength = -1, lastEntry = null;
  const listeners = new Set();
  const sync = () => {
    const logs = Array.isArray(host?.state?.logs) ? host.state.logs : [];
    const latest = logs.at(-1) ?? null;
    if (logs.length === lastLength && latest === lastEntry) return;
    lastLength = logs.length; lastEntry = latest;
    entries = logs.slice(-maxEntries);
    for (const listener of listeners) { try { listener(entries); } catch { /* UI must not affect transport. */ } }
  };
  const unsubscribe = host?.onStateChange?.(sync) ?? (() => {});
  sync();
  const unsubscribeFilter = filter.subscribe(() => {
    for (const listener of listeners) { try { listener(entries); } catch { /* UI must not affect transport. */ } }
  });
  return {
    entries: () => entries,
    filter,
    clear: () => { host?.clearConsole?.(); sync(); },
    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() { listeners.clear(); unsubscribeFilter(); unsubscribe(); },
  };
}

export function renderConsole(container, entries, { page = globalThis, maxLines = 200, filter = null } = {}) {
  const document = page.document;
  if (!document || !container) return;
  const lines = consoleLines(entries).filter(line => filter?.isVisible(line.domain) ?? true).slice(-maxLines);
  const signature = lines.map(line => `${line.timestamp ?? ''}\u0000${line.domain}\u0000${line.level}\u0000${line.text}`).join('\u0001');
  if (container.dataset.renderSignature === signature) return;
  container.dataset.renderSignature = signature;
  const fragment = document.createDocumentFragment();
  for (const line of lines) {
    const row = document.createElement('div');
    row.className = 'kore-console-line';
    const time = document.createElement('span');
    time.className = 'kore-console-time';
    time.textContent = line.timestamp == null ? '' : `[${clock(line.timestamp)}] `;
    const text = document.createElement('span');
    text.className = 'kore-console-text';
    text.style.color = consoleColor(line.domain, line.level);
    text.textContent = line.text;
    row.append(time, text);
    fragment.append(row);
  }
  container.replaceChildren(fragment);
  container.scrollTop = container.scrollHeight;
}

function clock(timestamp) {
  const date = new Date(timestamp);
  return [date.getHours(), date.getMinutes(), date.getSeconds()].map(part => String(part).padStart(2, '0')).join(':');
}
