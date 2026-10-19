// Independent fullscreen overlay. It is created on enter and removed on exit;
// the small LastROTools host is never resized or restyled by this module.

import { outputLines, renderConsole } from './kore-panel-console.mjs';
import { createKoreDebugView } from './kore-panel-debug.mjs';
import { decodeWalkability, drawMap, mapEntities, parsePoint, targetGidFromAi } from './kore-panel-map.mjs';
import { statusModel } from './kore-panel-window.mjs';

const normalize = value => String(value ?? '').trim().toLowerCase();
const el = (document, tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
const blockOf = (result, type) => Array.isArray(result?.blocks) ? result.blocks.find(block => block?.type === type) : null;

export function createKoreFullscreen({
  page = globalThis, host, poller, consoleModel,
  history = [], onExit = () => {},
} = {}) {
  const document = page.document;
  const overlay = el(document, 'section', 'kore-fullscreen');
  overlay.tabIndex = -1;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'KoreEngine 全屏面板');

  const titlebar = el(document, 'header', 'kore-fs-titlebar');
  const title = el(document, 'div', 'kore-fs-title', '科技改变生活');
  const exitButton = el(document, 'button', 'kore-fs-exit', '退出全屏');
  exitButton.type = 'button';
  titlebar.append(title, exitButton);

  const body = el(document, 'div', 'kore-fs-body');
  const left = el(document, 'div', 'kore-fs-left');
  const right = el(document, 'div', 'kore-fs-right');

  // STATUS
  const statusPane = el(document, 'section', 'kore-fs-pane kore-fs-status');
  const statusHeading = el(document, 'h2', 'kore-fs-heading', 'STATUS');
  const statusGrid = el(document, 'div', 'kore-fs-status-grid');
  const statusFields = {};
  for (const [key, label] of [['name', '名称'], ['job', '职业'], ['level', '等级'], ['hp', 'HP'], ['sp', 'SP'], ['weight', '重量'], ['zeny', 'Zeny'], ['mode', '模式'], ['task', '任务'], ['target', '目标'], ['next', '下一步'], ['reason', '原因'], ['map', '地图'], ['position', '坐标']]) {
    const row = el(document, 'div', 'kore-fs-status-row');
    const name = el(document, 'span', 'kore-fs-status-label', label);
    const value = el(document, 'span', 'kore-fs-status-value', '—');
    row.append(name, value);
    statusGrid.append(row);
    statusFields[key] = value;
  }
  statusPane.append(statusHeading, statusGrid);

  // CONSOLE
  const consolePane = el(document, 'section', 'kore-fs-pane kore-fs-console');
  const consoleHeading = el(document, 'h2', 'kore-fs-heading', 'CONSOLE');
  const consoleNode = el(document, 'div', 'kore-console kore-fs-console-body');
  const form = el(document, 'form', 'kore-command');
  const prompt = el(document, 'span', 'kore-prompt', '>');
  const input = el(document, 'input', 'kore-command-input');
  input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
  input.setAttribute('aria-label', 'KoreEngine 全屏命令');
  input.placeholder = '输入命令，Enter 发送';
  const sendButton = el(document, 'button', 'kore-send', '发送');
  sendButton.type = 'submit';
  form.append(prompt, input, sendButton);
  consolePane.append(consoleHeading, consoleNode, form);

  // MAP
  const mapPane = el(document, 'section', 'kore-fs-pane kore-fs-map');
  const mapHeading = el(document, 'h2', 'kore-fs-heading', 'MAP');
  const mapNote = el(document, 'div', 'kore-fs-note');
  const canvas = el(document, 'canvas', 'kore-fs-canvas');
  mapPane.append(mapHeading, mapNote, canvas);

  // TABS
  const tabsPane = el(document, 'section', 'kore-fs-pane kore-fs-tabs');
  const tabsHeader = el(document, 'div', 'kore-fs-tabs-header');
  const tabButtons = new Map();
  for (const [id, label] of [['inventory', '背包'], ['cart', '手推车'], ['exp', 'EXP'], ['item', '物品信息']]) {
    const button = el(document, 'button', 'kore-fs-tab', label);
    button.type = 'button';
    button.dataset.tab = id;
    button.addEventListener('click', () => selectTab(id));
    tabButtons.set(id, button);
    tabsHeader.append(button);
  }
  const filterBar = el(document, 'div', 'kore-fs-filters');
  for (const [id, label, command] of [['all', '全部', 'i'], ['eq', '装备', 'i eq'], ['usable', '可用', 'i u'], ['unusable', '不可用', 'i nu']]) {
    const button = el(document, 'button', 'kore-fs-filter', label);
    button.type = 'button';
    button.dataset.filter = id;
    button.addEventListener('click', () => selectInventoryFilter(id, command));
    filterBar.append(button);
  }
  const tabContent = el(document, 'div', 'kore-fs-tab-content');
  tabsPane.append(tabsHeader, filterBar, tabContent);

  const debugButton = el(document, 'button', 'kore-fs-debug', 'DEBUG');
  debugButton.type = 'button';

  left.append(statusPane, consolePane);
  right.append(mapPane, tabsPane);
  body.append(left, right);
  overlay.append(titlebar, body, debugButton);
  document.body.append(overlay);

  const debug = createKoreDebugView({ page, host });
  overlay.append(debug.element);
  debugButton.addEventListener('click', () => debug.show('state'));

  let activeTab = 'inventory';
  let itemDetail = null;
  let itemDetailLabel = '';
  let lastMapKey = null;
  let mapTimer = null;
  let mapBytes = null;
  let mapRevision = null;
  let closed = false;
  let historyIndex = history.length;
  const pending = new Map();
  const overrides = new Map();

  const sendSilent = (command, handler) => {
    pending.set(normalize(command), handler);
    if (host?.sendCommandText?.(command, { silent: true }) !== true) pending.delete(normalize(command));
  };
  const unsubscribeOutput = host?.onCommandOutput?.(({ command, result, silent }) => {
    if (!silent) return;
    const handler = pending.get(normalize(command));
    if (!handler) return;
    pending.delete(normalize(command));
    handler(result);
    update();
  }) ?? (() => {});

  function send(text) {
    const command = String(text ?? '').trim();
    if (!command) return false;
    const sent = host?.sendCommandText?.(command) === true;
    if (sent) {
      history.push(command);
      historyIndex = history.length;
      input.value = '';
      update();
    }
    return sent;
  }
  form.addEventListener('submit', event => { event.preventDefault(); send(input.value); });
  input.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Enter') return;
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown' || !history.length) return;
    event.preventDefault();
    historyIndex = event.key === 'ArrowUp' ? Math.max(0, historyIndex - 1) : Math.min(history.length, historyIndex + 1);
    input.value = history[historyIndex] ?? '';
  });

  function selectTab(tab) {
    activeTab = tab;
    for (const [id, button] of tabButtons) button.classList.toggle('is-active', id === tab);
    filterBar.hidden = tab !== 'inventory';
    poller?.setTab?.(tab === 'item' ? null : tab);
    update();
  }
  function selectInventoryFilter(filter, command) {
    for (const button of [...filterBar.children]) button.classList.toggle('is-active', button.dataset.filter === filter);
    if (filter === 'all') {
      overrides.delete('inventory');
      poller?.request?.('inventory');
      update();
      return;
    }
    sendSilent(command, result => overrides.set('inventory', result));
  }

  function renderTable(container, result, onRow) {
    const table = blockOf(result, 'table');
    if (!table) {
      const pre = el(document, 'pre', 'kore-fs-table');
      pre.textContent = result
        ? result.kind === 'output' ? outputLines(result).map(line => line.text).join('\n') : `${result.code ?? result.kind}: ${result.message ?? ''}`
        : '等待回显…';
      if (result && (result.ok === false || result.kind === 'error')) pre.classList.add('is-error');
      container.replaceChildren(pre);
      return;
    }
    const node = el(document, 'table', 'kore-fs-table');
    const head = el(document, 'thead');
    const headRow = el(document, 'tr');
    for (const column of table.columns ?? []) headRow.append(el(document, 'th', '', String(column)));
    head.append(headRow);
    const bodyNode = el(document, 'tbody');
    for (const row of table.rows ?? []) {
      const tr = el(document, 'tr');
      for (const value of row ?? []) tr.append(el(document, 'td', '', String(value)));
      if (onRow) { tr.tabIndex = 0; tr.addEventListener('click', () => onRow(row)); }
      bodyNode.append(tr);
    }
    node.append(head, bodyNode);
    container.replaceChildren(node);
  }

  function renderTabs() {
    if (activeTab === 'item') {
      filterBar.hidden = true;
      renderTable(tabContent, itemDetail);
      if (!itemDetail) tabContent.textContent = itemDetailLabel || '在背包中选择一行';
      return;
    }
    filterBar.hidden = activeTab !== 'inventory';
    const result = activeTab === 'inventory'
      ? overrides.get('inventory') ?? poller?.results?.('inventory')
      : poller?.results?.(activeTab);
    renderTable(tabContent, result, activeTab === 'inventory' ? row => {
      const selector = String(row?.[0] ?? '').trim();
      if (!/^\d+$/.test(selector)) return;
      itemDetailLabel = `物品 #${selector}`;
      sendSilent(`i desc ${selector}`, detail => { itemDetail = detail; activeTab = 'item'; update(); });
    } : null);
  }

  function renderStatus() {
    const model = statusModel({
      status: poller?.results?.('status'), ai: poller?.results?.('ai'),
      where: poller?.results?.('where'), state: host?.state,
    });
    const values = {
      name: model.name, job: model.job, level: model.level,
      hp: model.hp.value == null ? '—' : `${model.hp.value}/${model.hp.max} ${model.hp.percent}%`,
      sp: model.sp.value == null ? '—' : `${model.sp.value}/${model.sp.max} ${model.sp.percent}%`,
      weight: model.weight, zeny: model.zeny,
      mode: model.mode === 'AUTO' ? '● 自动' : model.mode === 'OFF' ? '○ 关闭' : '—',
      task: model.task, target: model.target, next: model.next, reason: model.reason,
      map: model.map, position: model.position,
    };
    for (const [key, node] of Object.entries(statusFields)) node.textContent = values[key] ?? '—';
  }

  function scheduleMap() {
    if (mapTimer !== null) return;
    mapTimer = page.setTimeout?.(() => { mapTimer = null; drawCurrentMap(); }, 250) ?? null;
    if (mapTimer === null) drawCurrentMap();
  }

  function drawCurrentMap() {
    const map = blockOf(poller?.results?.('map'), 'map');
    if (!map) {
      mapNote.textContent = poller?.errors?.('map')?.code ? `MAP: ${poller.errors('map').code}` : '等待地图…';
      return;
    }
    const key = `${map.mapName}:${map.mapRevision}`;
    if (key !== lastMapKey) {
      lastMapKey = key;
      poller.request?.('map');
    }
    mapNote.textContent = `${map.mapName} ${map.width}x${map.height}`;
    if (map.mapRevision !== mapRevision) { mapRevision = map.mapRevision; mapBytes = null; }
    if (!mapBytes) mapBytes = decodeWalkability(map.walkability, map.width, map.height);
    const width = mapPane.clientWidth || 320;
    const height = mapPane.clientHeight || 320;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext?.('2d');
    if (!ctx) return;
    const selfPair = blockOf(poller?.results?.('where'), 'kv')?.pairs?.find(([name]) => name === '坐标')?.[1];
    drawMap(ctx, {
      map: { ...map, walkabilityBytes: mapBytes },
      entities: mapEntities({
        monsters: poller?.results?.('monsters'), players: poller?.results?.('players'),
        npcs: poller?.results?.('npcs'), items: poller?.results?.('items'),
      }),
      self: parsePoint(selfPair), targetGid: targetGidFromAi(poller?.results?.('ai')),
      maxWidth: width, maxHeight: height,
    });
  }

  function update() {
    if (closed) return;
    renderStatus();
    renderConsole(consoleNode, consoleModel?.entries?.() ?? [], { page, maxLines: 200 });
    renderTabs();
    scheduleMap();
    if (debug.visible) debug.update();
  }

  const cleanups = [];
  if (poller?.subscribe) cleanups.push(poller.subscribe(() => update()));
  if (consoleModel?.subscribe) cleanups.push(consoleModel.subscribe(() => renderConsole(consoleNode, consoleModel.entries(), { page, maxLines: 200 })));
  if (host?.onStateChange) cleanups.push(host.onStateChange(() => update()));

  function close() {
    if (closed) return;
    const reduced = page.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
    const finish = () => { if (closed) return; closed = true; destroy(); onExit(); };
    if (reduced) { finish(); return; }
    overlay.classList.add('is-leaving');
    if (page.setTimeout) page.setTimeout(finish, 160);
    else finish();
  }
  function destroy() {
    if (closed && !overlay.isConnected) return;
    closed = true;
    for (const cleanup of cleanups) { try { cleanup(); } catch { /* best effort. */ } }
    unsubscribeOutput();
    pending.clear();
    debug.destroy();
    overlay.remove();
  }

  exitButton.addEventListener('click', close);
  const keydown = event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    if (debug.visible) { debug.hide(); return; }
    close();
  };
  document.addEventListener?.('keydown', keydown);
  cleanups.push(() => document.removeEventListener?.('keydown', keydown));

  overlay.classList.add('is-entering');
  page.requestAnimationFrame?.(() => overlay.classList.add('is-ready'));
  poller?.setView?.('fullscreen');
  poller?.setTab?.('inventory');
  poller?.request?.('map');
  selectTab('inventory');
  overlay.focus?.();
  update();

  return {
    element: overlay,
    update, close, destroy,
    get closed() { return closed; },
  };
}
