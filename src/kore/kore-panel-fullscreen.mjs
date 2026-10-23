// Independent fullscreen overlay. It is created on enter and removed on exit;
// the small LastROTools host is never resized or restyled by this module.

import { KORE_CONSOLE_CATEGORIES, consoleColor, outputLines, renderConsole } from './kore-panel-console.mjs';
import { MAP_COLORS, decodeWalkability, drawMap, entityCounts, mapEntities, parsePoint, targetGidFromAi } from './kore-panel-map.mjs';
import { EXP_ROWS, equipmentView, groupItems, isBroken, isWorn, parseEarnings, parseItemRows } from './kore-panel-items.mjs';
import { statusModel } from './kore-panel-window.mjs';

const el = (document, tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
const blockOf = (result, type) => Array.isArray(result?.blocks) ? result.blocks.find(block => block?.type === type) : null;
const isBlank = value => value === '' || value === '—';
const grouped = value => Number.isFinite(value) ? value.toLocaleString('en-US') : '—';

// One-click versions of the commands people type most; the same set the debug page offers.
const QUICK_COMMANDS = [
  ['状态', [['状态', 's'], ['位置', 'where'], ['AI 状态', 'ai print'], ['技能', 'skills']]],
  ['周围', [['怪物', 'ml'], ['玩家', 'pl'], ['NPC', 'nl'], ['地面物品', 'il']]],
  ['物品', [['背包', 'i'], ['手推车', 'cart'], ['经验', 'exp'], ['经验报告', 'exp report']]],
  ['其他', [['取消路线', 'route cancel'], ['命令表', 'help']]],
];
const LEGEND = [['monster', '怪物'], ['player', '玩家'], ['npc', 'NPC'], ['item', '物品'], ['portal', '传送点']];

export function createKoreFullscreen({
  page = globalThis, host, poller, consoleModel,
  history = [], onExit = () => {}, onDebug = () => {},
} = {}) {
  const document = page.document;
  const overlay = el(document, 'section', 'kore-fullscreen');
  overlay.tabIndex = -1;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'KoreEngine 全屏面板');

  // Top bar: the product on the left, the two window actions on the right.
  const bar = el(document, 'header', 'kore-fs-bar');
  const brand = el(document, 'div', 'kore-fs-brand');
  brand.append(el(document, 'span', 'kore-fs-mark'), el(document, 'span', 'kore-fs-title', 'KoreEngine'));
  const debugButton = el(document, 'button', 'kore-fs-btn kore-fs-btn-text kore-fs-debug', '调试');
  debugButton.type = 'button';
  debugButton.addEventListener('click', () => onDebug());
  const exitButton = el(document, 'button', 'kore-fs-btn kore-fs-exit', '退出全屏');
  exitButton.type = 'button';
  exitButton.append(el(document, 'span', 'kore-fs-hint', 'Esc'));
  const barActions = el(document, 'div', 'kore-fs-bar-actions');
  barActions.append(debugButton, exitButton);
  bar.append(brand, barActions);

  // Title row: who this is, what the AI is doing right now, and the one job
  // people come here for (start or stop it).
  const head = el(document, 'div', 'kore-fs-head');
  const identity = el(document, 'div', 'kore-fs-id');
  const identityLine = el(document, 'div', 'kore-fs-id-line');
  const fsName = el(document, 'h1', 'kore-fs-name', '等待 KE');
  const fsJob = el(document, 'span', 'kore-fs-job', '');
  const fsMode = el(document, 'span', 'kore-fs-pill', '');
  identityLine.append(fsName, fsJob, fsMode);
  const finding = el(document, 'p', 'kore-fs-finding', '');
  identity.append(identityLine, finding);
  const autoButton = el(document, 'button', 'kore-fs-btn kore-fs-btn-primary kore-fs-auto', '开启自动');
  autoButton.type = 'button';
  const manualButton = el(document, 'button', 'kore-fs-btn kore-fs-manual', '半自动');
  manualButton.type = 'button';
  manualButton.title = '半自动：全自动砍掉自动补给、自动走路（寻怪/追怪/随机走动/拾取/回挂机图）、寻怪瞬移、自动坐/站和死亡复活。保留自动换装、用药、BUFF、保命瞬移，以及射程内的怪自动选技能出手（不追怪、不走位、不普攻，各项按 manualAI 为 1/2 过滤）。位置由你控制；需要 LTSD 授权，和自动模式一样占实例额度';
  const clearButton = el(document, 'button', 'kore-fs-btn kore-fs-btn-text', '清空 AI 队列');
  clearButton.type = 'button';
  clearButton.title = '只清空 KE 内部队列，与游戏任务无关';
  const headActions = el(document, 'div', 'kore-fs-head-actions');
  headActions.append(autoButton, manualButton, clearButton);
  head.append(identity, headActions);

  const card = (className, title) => {
    const node = el(document, 'section', `kore-fs-card ${className}`);
    const header = el(document, 'div', 'kore-fs-card-head');
    const heading = el(document, 'h2', 'kore-fs-card-title', title);
    const meta = el(document, 'span', 'kore-fs-meta');
    header.append(heading, meta);
    node.append(header);
    return { node, meta, header };
  };

  // Left: vitals, then the item tables.
  const status = card('kore-fs-status', '状态');
  const gauges = el(document, 'div', 'kore-fs-gauges');
  const makeGauge = (label, className) => {
    const row = el(document, 'div', `kore-fs-gauge ${className}`);
    const track = el(document, 'span', 'kore-fs-gauge-track');
    const fill = el(document, 'span', 'kore-fs-gauge-fill');
    track.append(fill);
    const value = el(document, 'span', 'kore-fs-gauge-value');
    const amount = el(document, 'span', '', '—');
    const percent = el(document, 'span', 'kore-fs-meta', '');
    value.append(amount, percent);
    row.append(el(document, 'span', 'kore-fs-gauge-label', label), track, value);
    gauges.append(row);
    return { fill, amount, percent };
  };
  const fsHp = makeGauge('HP', 'kore-fs-gauge-hp');
  const fsSp = makeGauge('SP', 'kore-fs-gauge-sp');
  const facts = el(document, 'dl', 'kore-fs-kv');
  const statusFields = {};
  for (const [key, label] of [['target', '目标'], ['weight', '重量'], ['zeny', 'Zeny']]) {
    const value = el(document, 'dd', '', '—');
    facts.append(el(document, 'dt', '', label), value);
    statusFields[key] = value;
  }
  status.node.append(gauges, facts);

  const tabsCard = el(document, 'section', 'kore-fs-card kore-fs-tabs');
  const tabsHeader = el(document, 'div', 'kore-fs-tabs-header');
  const tabButtons = new Map();
  for (const [id, label] of [['inventory', '背包'], ['equipment', '穿戴'], ['cart', '手推车'], ['earnings', '收益']]) {
    const button = el(document, 'button', 'kore-fs-tab', label);
    button.type = 'button';
    button.dataset.tab = id;
    button.addEventListener('click', () => selectTab(id));
    tabButtons.set(id, button);
    tabsHeader.append(button);
  }
  const searchBar = el(document, 'div', 'kore-fs-search');
  const searchInput = el(document, 'input', 'kore-fs-input kore-fs-search-input');
  searchInput.type = 'search'; searchInput.autocomplete = 'off'; searchInput.spellcheck = false;
  searchInput.placeholder = '搜索物品名称或 ID';
  searchInput.setAttribute('aria-label', '搜索物品');
  searchBar.append(searchInput);
  const tabContent = el(document, 'div', 'kore-fs-tab-content');
  tabsCard.append(tabsHeader, searchBar, tabContent);
  const left = el(document, 'div', 'kore-fs-col kore-fs-col-side');
  left.append(status.node, tabsCard);

  // Centre: the console is the biggest block, it is what the AI has been doing.
  const log = card('kore-fs-console', '控制台');
  const consoleNode = el(document, 'div', 'kore-fs-log-body');
  const form = el(document, 'form', 'kore-fs-command');
  const prompt = el(document, 'span', 'kore-fs-prompt', '>');
  const input = el(document, 'input', 'kore-fs-input');
  input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
  input.setAttribute('aria-label', 'KoreEngine 全屏命令');
  input.placeholder = '输入命令，Enter 发送';
  const sendButton = el(document, 'button', 'kore-fs-btn kore-fs-send', '发送');
  sendButton.type = 'submit';
  form.append(prompt, input, sendButton);
  log.node.append(consoleNode, form);

  // Which message categories the console shows; the choice is shared with the small panel.
  const consoleFilter = consoleModel?.filter ?? null;
  const filterButton = el(document, 'button', 'kore-fs-btn kore-fs-btn-text kore-fs-filter-button');
  filterButton.type = 'button';
  filterButton.setAttribute('aria-haspopup', 'true');
  filterButton.setAttribute('aria-expanded', 'false');
  const filterMenu = el(document, 'div', 'kore-fs-filter-menu');
  filterMenu.hidden = true;
  filterMenu.setAttribute('role', 'group');
  filterMenu.setAttribute('aria-label', '控制台显示的信息类别');
  const filterChecks = new Map();
  for (const category of KORE_CONSOLE_CATEGORIES) {
    const row = el(document, 'label', 'kore-fs-filter-row');
    const check = el(document, 'input');
    check.type = 'checkbox';
    check.addEventListener('change', () => consoleFilter?.setCategoryVisible(category.id, check.checked));
    const swatch = el(document, 'span', 'kore-fs-filter-swatch');
    swatch.style.background = consoleColor(category.domains[0]);
    row.append(check, swatch, el(document, 'span', '', category.label));
    filterMenu.append(row);
    filterChecks.set(category.id, check);
  }
  const filterReset = el(document, 'button', 'kore-fs-btn kore-fs-btn-text kore-fs-filter-reset', '恢复默认');
  filterReset.type = 'button';
  filterReset.addEventListener('click', () => consoleFilter?.reset());
  filterMenu.append(filterReset);
  const filterWrap = el(document, 'div', 'kore-fs-filter');
  filterWrap.append(filterButton, filterMenu);
  const setFilterOpen = open => {
    filterMenu.hidden = !open;
    filterButton.setAttribute('aria-expanded', String(open));
  };
  filterButton.addEventListener('click', () => setFilterOpen(filterMenu.hidden));
  const closeFilterOnOutside = event => { if (!filterMenu.hidden && !filterWrap.contains(event.target)) setFilterOpen(false); };
  const closeFilterOnEscape = event => {
    if (event.key === 'Escape' && !filterMenu.hidden) { event.stopPropagation(); setFilterOpen(false); filterButton.focus?.(); }
  };
  const renderFilter = () => {
    for (const [id, check] of filterChecks) check.checked = consoleFilter?.isCategoryVisible(id) ?? true;
    const hidden = consoleFilter?.hiddenCount() ?? 0;
    filterButton.textContent = hidden ? `筛选（隐藏 ${hidden}）` : '筛选';
  };
  if (consoleFilter) {
    renderFilter();
    log.header.append(filterWrap);
  }
  const centre = el(document, 'div', 'kore-fs-col kore-fs-col-log');
  centre.append(log.node);

  // Right: a small map for orientation (it is not interactive), then the quick commands.
  const map = card('kore-fs-map', '地图');
  const stage = el(document, 'div', 'kore-fs-map-stage');
  const canvas = el(document, 'canvas', 'kore-fs-canvas');
  const mapEmpty = el(document, 'div', 'kore-fs-empty kore-fs-map-empty', '等待地图…');
  stage.append(canvas, mapEmpty);
  const legend = el(document, 'div', 'kore-fs-legend');
  const legendSelf = el(document, 'span', 'kore-fs-legend-item');
  const selfMark = el(document, 'span', 'kore-fs-swatch kore-fs-swatch-self');
  selfMark.style.borderColor = MAP_COLORS.self;
  const selfText = el(document, 'span', '', '你 —');
  legendSelf.append(selfMark, selfText);
  legend.append(legendSelf);
  const legendCounts = {};
  for (const [kind, label] of LEGEND) {
    const item = el(document, 'span', 'kore-fs-legend-item');
    const mark = el(document, 'span', kind === 'portal' ? 'kore-fs-swatch kore-fs-swatch-ring' : 'kore-fs-swatch');
    if (kind === 'portal') mark.style.borderColor = MAP_COLORS.portal; else mark.style.background = MAP_COLORS[kind];
    const count = el(document, 'b', '', '0');
    item.append(mark, el(document, 'span', '', label), count);
    legend.append(item);
    legendCounts[kind] = count;
  }
  map.node.append(stage, legend);

  const quick = card('kore-fs-quick', '常用命令');
  const quickButtons = [];
  for (const [groupLabel, commands] of QUICK_COMMANDS) {
    const group = el(document, 'div', 'kore-fs-quick-group');
    const actions = el(document, 'div', 'kore-fs-quick-actions');
    for (const [label, command] of commands) {
      const button = el(document, 'button', 'kore-fs-quick-btn', label);
      button.type = 'button';
      button.title = command;
      button.dataset.command = command;
      button.addEventListener('click', () => run(command));
      actions.append(button);
      quickButtons.push(button);
    }
    group.append(el(document, 'h3', 'kore-fs-quick-label', groupLabel), actions);
    quick.node.append(group);
  }
  const right = el(document, 'div', 'kore-fs-col kore-fs-col-map');
  right.append(map.node, quick.node);

  const grid = el(document, 'div', 'kore-fs-grid');
  grid.append(left, centre, right);
  const main = el(document, 'main', 'kore-fs-main');
  main.append(head, grid);
  overlay.append(bar, main);
  document.body.append(overlay);

  let activeTab = 'inventory';
  let query = '';
  // Collapsed groups, remembered per tab for as long as the overlay is open.
  const collapsed = new Set();
  let lastMapKey = null;
  let mapTimer = null;
  let mapBytes = null;
  let mapRevision = null;
  let closed = false;
  let historyIndex = history.length;

  // Sends a command through the console; typing in the command line is left alone.
  function run(text) {
    const command = String(text ?? '').trim();
    if (!command) return false;
    const sent = host?.sendCommandText?.(command) === true;
    if (sent) {
      history.push(command);
      historyIndex = history.length;
      update();
    }
    return sent;
  }
  function send(text) {
    const sent = run(text);
    if (sent) input.value = '';
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
  autoButton.addEventListener('click', () => run(autoButton.dataset.command));
  manualButton.addEventListener('click', () => run(manualButton.dataset.command));
  clearButton.addEventListener('click', () => run('ai clear'));

  // The equipment view reads the same `i` result as the bag.
  const POLLER_TAB = { inventory: 'inventory', equipment: 'inventory', cart: 'cart', earnings: 'exp' };
  function selectTab(tab) {
    activeTab = tab;
    for (const [id, button] of tabButtons) button.classList.toggle('is-active', id === tab);
    searchBar.hidden = tab !== 'inventory' && tab !== 'cart';
    poller?.setTab?.(POLLER_TAB[tab]);
    update();
  }
  searchInput.addEventListener('keydown', event => event.stopPropagation());
  searchInput.addEventListener('input', () => { query = searchInput.value; renderTabs(); });

  const ERROR_TEXT = {
    'inventory-not-ready': '背包数据还没有收到',
    'cart-not-ready': '没有手推车，或手推车数据还没有收到',
    'experience-unavailable': '还没有开始统计',
  };
  function stateMessage(result, waiting) {
    if (!result) return el(document, 'div', 'kore-fs-empty', waiting);
    const line = outputLines(result)[0]?.text ?? '';
    const code = /^([a-z-]+):/.exec(line)?.[1];
    return el(document, 'div', 'kore-fs-empty', ERROR_TEXT[code] ?? line);
  }

  // OpenKore marks a damaged item with a "BROKEN " prefix; show that as a flag instead.
  function itemName(name) {
    const node = el(document, 'span', 'kore-fs-item-name');
    node.append(el(document, 'span', 'kore-fs-item-text', name.replace(/^BROKEN /, '')));
    if (isBroken(name)) node.append(el(document, 'span', 'kore-fs-pill kore-fs-pill-bad', '损坏'));
    return node;
  }
  function itemRow(row) {
    const node = el(document, 'div', 'kore-fs-item');
    node.title = `${row.name}\n${row.category} · ID ${row.id}`;
    node.append(itemName(row.name), el(document, 'span', 'kore-fs-item-qty', row.amount));
    return node;
  }
  function groupNode(key, label, count, rows, makeRow) {
    const collapsedKey = `${activeTab}:${key}`;
    const isCollapsed = collapsed.has(collapsedKey);
    const group = el(document, 'section', `kore-fs-group${isCollapsed ? ' is-collapsed' : ''}`);
    const head = el(document, 'button', 'kore-fs-group-head');
    head.type = 'button';
    head.setAttribute('aria-expanded', String(!isCollapsed));
    head.append(el(document, 'span', 'kore-fs-chevron'), el(document, 'span', 'kore-fs-group-label', label), el(document, 'span', 'kore-fs-meta', String(count)));
    head.addEventListener('click', () => {
      if (!collapsed.delete(collapsedKey)) collapsed.add(collapsedKey);
      renderTabs();
    });
    group.append(head);
    if (!isCollapsed) for (const row of rows) group.append(makeRow(row));
    return group;
  }

  function renderItems(rows, empty) {
    const groups = groupItems(rows.filter(row => !isWorn(row)), query);
    if (!groups.length) {
      tabContent.replaceChildren(el(document, 'div', 'kore-fs-empty', query.trim() ? '没有匹配的物品' : empty));
      return;
    }
    tabContent.replaceChildren(...groups.map(group => groupNode(group.key, group.label, group.rows.length, group.rows, itemRow)));
  }

  function renderEquipment(rows) {
    const list = el(document, 'div', 'kore-fs-slots');
    for (const slot of equipmentView(rows)) {
      const node = el(document, 'div', `kore-fs-slot${slot.item ? '' : ' is-empty'}`);
      node.title = slot.item ? `${slot.item.name}\n${slot.key} · ID ${slot.item.id}` : slot.key;
      node.append(el(document, 'span', 'kore-fs-slot-label', slot.label), slot.item ? itemName(slot.item.name) : el(document, 'span', 'kore-fs-item-name', '—'));
      list.append(node);
    }
    tabContent.replaceChildren(list);
  }

  const fact = (label, value) => [el(document, 'dt', '', label), el(document, 'dd', '', value)];
  function earningsSection(title, meta, ...children) {
    const section = el(document, 'section', 'kore-fs-earn');
    const head = el(document, 'div', 'kore-fs-earn-head');
    head.append(el(document, 'h3', 'kore-fs-earn-title', title));
    if (meta) head.append(el(document, 'span', 'kore-fs-meta', meta));
    section.append(head, ...children);
    return section;
  }
  function factList(rows) {
    const list = el(document, 'dl', 'kore-fs-kv kore-fs-kv-tight');
    for (const [label, value] of rows) list.append(...fact(label, value));
    return list;
  }
  function expSection(name, level, kind, get) {
    const rows = EXP_ROWS.map(([label, base, job]) => [label, get(kind === 'base' ? base : job)]);
    const percent = /\((\d+(?:\.\d+)?)%\)/.exec(get(kind === 'base' ? '基础经验' : '职业经验'))?.[1];
    const track = el(document, 'span', 'kore-fs-gauge-track kore-fs-earn-track');
    const fill = el(document, 'span', 'kore-fs-gauge-fill');
    fill.style.width = `${Math.min(100, Number(percent ?? 0))}%`;
    track.append(fill);
    return earningsSection(`${name}经验`, `Lv ${level}`, track, factList(rows));
  }
  function changeSection(title, items, sign, meta) {
    if (!items.length) return null;
    const total = items.reduce((sum, item) => sum + Math.abs(item.amount), 0);
    const rows = items.map(item => {
      const node = el(document, 'div', 'kore-fs-item');
      node.title = `${item.name}\nID ${item.id}`;
      node.append(el(document, 'span', 'kore-fs-item-name', item.name), el(document, 'span', 'kore-fs-item-qty', `${sign}${Math.abs(item.amount).toLocaleString('en-US')}`));
      return node;
    });
    return earningsSection(title, meta ?? `${items.length} 种 / ${total.toLocaleString('en-US')} 件`, ...rows);
  }
  function renderEarnings(result) {
    const earnings = parseEarnings(result);
    if (!earnings) { tabContent.replaceChildren(stateMessage(result, '等待收益数据…')); return; }
    const get = key => earnings.kv.get(key) ?? '—';
    const kills = earnings.monsters.map(monster => {
      const node = el(document, 'div', 'kore-fs-item');
      node.title = `${monster.name}\nID ${monster.id}`;
      node.append(el(document, 'span', 'kore-fs-item-name', monster.name), el(document, 'span', 'kore-fs-item-qty', monster.count.toLocaleString('en-US')));
      return node;
    });
    // What an AFK player checks first: the rates and the money, then what dropped,
    // then the experience detail.
    tabContent.replaceChildren(...[
      earningsSection('本次挂机', get('时长'), factList([
        ['击杀', get('击杀')], ['死亡', get('死亡')],
        ['基础经验每小时', get('基础经验每小时')], ['职业经验每小时', get('职业经验每小时')],
        ['Zeny 净增', get('Zeny 净增')], ['Zeny 每小时', get('Zeny 每小时')],
      ])),
      changeSection('获得道具', earnings.gained, '+', earnings.kv.get('获得道具')),
      expSection('基础', earnings.baseLevel, 'base', get),
      expSection('职业', earnings.jobLevel, 'job', get),
      changeSection('消耗道具', earnings.consumed, '-'),
      kills.length ? earningsSection('击杀', get('击杀'), ...kills) : null,
    ].filter(Boolean));
  }

  function renderTabs() {
    if (activeTab === 'earnings') { renderEarnings(poller?.results?.('exp')); return; }
    const cart = activeTab === 'cart';
    const result = poller?.results?.(cart ? 'cart' : 'inventory');
    const rows = parseItemRows(result);
    if (!rows) { tabContent.replaceChildren(stateMessage(result, cart ? '等待手推车数据…' : '等待背包数据…')); return; }
    if (activeTab === 'equipment') renderEquipment(rows);
    else renderItems(rows, cart ? '手推车是空的' : '背包是空的');
  }

  function renderStatus() {
    const model = statusModel({
      status: poller?.results?.('status'), ai: poller?.results?.('ai'),
      where: poller?.results?.('where'), state: host?.state,
    });
    const ready = model.worldReady;
    fsName.textContent = ready ? model.name : '等待 KE';
    fsJob.textContent = ready ? [model.job, `Lv ${model.level}`].filter(part => !isBlank(part.replace(/^Lv /, ''))).join(' · ') : (host?.state?.status ?? '');
    // Until the world is ready the last answers are stale; say so instead of showing them as live.
    const auto = ready && model.mode === 'AUTO';
    const manual = ready && model.mode === 'MANUAL';
    fsMode.textContent = !ready ? '' : auto ? '自动' : manual ? '半自动' : model.mode === 'OFF' ? '已关闭' : '';
    fsMode.dataset.mode = model.mode;
    const doing = [['任务', model.task], ['下一步', model.next], ['原因', model.reason]]
      .filter(([, value]) => !isBlank(value)).map(([label, value]) => `${label} ${value}`).join(' · ');
    finding.textContent = ready ? doing || '暂时没有 AI 决策' : '等待 KE 就绪…';
    autoButton.textContent = auto ? '关闭自动' : '开启自动';
    autoButton.dataset.command = auto ? 'ai off' : 'ai auto';
    autoButton.classList.toggle('kore-fs-btn-primary', !auto);
    autoButton.disabled = !ready;
    manualButton.textContent = manual ? '关闭半自动' : '半自动';
    manualButton.dataset.command = manual ? 'ai off' : 'ai manual';
    manualButton.disabled = !ready;
    clearButton.disabled = !ready;
    for (const button of quickButtons) button.disabled = !ready;
    const setGauge = (gauge, ratio) => {
      const percent = ratio.percent == null ? 0 : Math.max(0, Math.min(100, ratio.percent));
      gauge.fill.style.width = `${percent}%`;
      if (percent <= 12) gauge.fill.dataset.level = 'crit';
      else if (percent <= 25) gauge.fill.dataset.level = 'warn';
      else delete gauge.fill.dataset.level;
      gauge.amount.textContent = ratio.value == null ? '—' : `${grouped(ratio.value)} / ${grouped(ratio.max)}`;
      gauge.percent.textContent = ratio.value == null ? '' : ` ${percent}%`;
    };
    setGauge(fsHp, model.hp);
    setGauge(fsSp, model.sp);
    const values = { target: model.target, weight: model.weight, zeny: model.zeny };
    for (const [key, node] of Object.entries(statusFields)) node.textContent = values[key] ?? '—';
  }

  function scheduleMap() {
    if (mapTimer !== null) return;
    mapTimer = page.setTimeout?.(() => { mapTimer = null; drawCurrentMap(); }, 250) ?? null;
    if (mapTimer === null) drawCurrentMap();
  }

  function drawCurrentMap() {
    if (closed) return;
    const field = blockOf(poller?.results?.('map'), 'map');
    // The map name and your position come from `where`, so they show even before the field data arrives.
    const where = blockOf(poller?.results?.('where'), 'kv')?.pairs;
    const selfPair = where?.find(([name]) => name === '坐标')?.[1];
    const self = parsePoint(selfPair);
    selfText.textContent = self ? `你 (${self.x}, ${self.y})` : '你 —';
    if (!field) {
      mapEmpty.hidden = false;
      const code = poller?.errors?.('map')?.code;
      mapEmpty.textContent = code ? `地图不可用 · ${code}` : '等待地图…';
      map.meta.textContent = where?.find(([name]) => name === '地图')?.[1] ?? '';
      return;
    }
    mapEmpty.hidden = true;
    const key = `${field.mapName}:${field.mapRevision}`;
    if (key !== lastMapKey) {
      lastMapKey = key;
      poller.request?.('map');
    }
    if (field.mapRevision !== mapRevision) { mapRevision = field.mapRevision; mapBytes = null; }
    if (!mapBytes) mapBytes = decodeWalkability(field.walkability, field.width, field.height);
    const width = stage.clientWidth || 320;
    const height = stage.clientHeight || 320;
    const ratio = Math.max(1, page.devicePixelRatio ?? 1);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext?.('2d');
    if (!ctx) return;
    ctx.setTransform?.(ratio, 0, 0, ratio, 0, 0);
    const entities = mapEntities({
      monsters: poller?.results?.('monsters'), players: poller?.results?.('players'),
      npcs: poller?.results?.('npcs'), items: poller?.results?.('items'),
    });
    map.meta.textContent = `${field.mapName} · ${field.width}×${field.height}`;
    const counts = entityCounts(entities);
    for (const [kind, node] of Object.entries(legendCounts)) node.textContent = String(counts[kind] ?? 0);
    drawMap(ctx, {
      map: { ...field, walkabilityBytes: mapBytes },
      entities, self, targetGid: targetGidFromAi(poller?.results?.('ai')),
      maxWidth: width, maxHeight: height, rulers: true,
    });
  }

  function update() {
    if (closed) return;
    renderStatus();
    renderConsole(consoleNode, consoleModel?.entries?.() ?? [], { page, maxLines: 200, filter: consoleFilter });
    renderTabs();
    scheduleMap();
  }

  const cleanups = [];
  if (poller?.subscribe) cleanups.push(poller.subscribe(() => update()));
  if (consoleFilter) {
    cleanups.push(consoleFilter.subscribe(renderFilter));
    page.document.addEventListener('pointerdown', closeFilterOnOutside);
    page.document.addEventListener('keydown', closeFilterOnEscape, true);
    cleanups.push(() => {
      page.document.removeEventListener('pointerdown', closeFilterOnOutside);
      page.document.removeEventListener('keydown', closeFilterOnEscape, true);
    });
  }
  if (consoleModel?.subscribe) cleanups.push(consoleModel.subscribe(() => renderConsole(consoleNode, consoleModel.entries(), { page, maxLines: 200, filter: consoleFilter })));
  if (host?.onStateChange) cleanups.push(host.onStateChange(() => update()));
  // The map fills its card, so it is redrawn whenever the card changes size.
  if (typeof page.ResizeObserver === 'function') {
    const observer = new page.ResizeObserver(() => scheduleMap());
    observer.observe(stage);
    cleanups.push(() => observer.disconnect());
  } else if (page.addEventListener) {
    page.addEventListener('resize', scheduleMap);
    cleanups.push(() => page.removeEventListener?.('resize', scheduleMap));
  }

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
    overlay.remove();
  }

  exitButton.addEventListener('click', () => close());

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
