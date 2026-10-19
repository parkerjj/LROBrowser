// KE small-window view. It renders Rust output and forwards raw command text;
// it never decides gameplay state or updates anything optimistically.

import { renderConsole } from './kore-panel-console.mjs';

export const KORE_QUICK_COMMANDS = Object.freeze([
  { label: '开启自动', command: 'ai auto' },
  { label: '关闭自动', command: 'ai off' },
  { label: '清空队列', command: 'ai clear' },
  { label: '经验', command: 'exp' },
  { label: '报告', command: 'exp report' },
]);

const element = (document, tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

export function kvPairs(result) {
  const block = Array.isArray(result?.blocks) ? result.blocks.find(item => item?.type === 'kv') : null;
  const pairs = new Map();
  for (const [key, value] of block?.pairs ?? []) pairs.set(String(key), String(value ?? ''));
  return pairs;
}

export function parseRatio(text) {
  const match = /^(\d+)\/(\d+)(?:\s*\((\d+)%\))?/.exec(String(text ?? '').trim());
  if (!match) return { value: null, max: null, percent: null };
  const value = Number(match[1]);
  const max = Number(match[2]);
  const percent = match[3] != null ? Number(match[3]) : max > 0 ? Math.round(value * 100 / max) : null;
  return { value, max, percent };
}

export function statusModel({ status, ai, where, state = null }) {
  const basic = kvPairs(status);
  const decision = kvPairs(ai);
  const location = kvPairs(where);
  return {
    connected: state ? state.status === 'runtime-ready' : Boolean(status),
    worldReady: state?.worldReady === true,
    name: basic.get('名称') ?? '—',
    job: basic.get('职业') ?? '—',
    level: basic.get('等级') ?? '—',
    hp: parseRatio(basic.get('HP')),
    sp: parseRatio(basic.get('SP')),
    weight: basic.get('重量') ?? '—',
    zeny: basic.get('Zeny') ?? '—',
    mode: decision.get('模式') ?? '—',
    task: decision.get('任务') ?? '—',
    target: decision.get('目标') ?? '—',
    next: decision.get('下一步') ?? '—',
    reason: decision.get('原因') ?? '—',
    map: location.get('地图') ?? '—',
    position: location.get('坐标') ?? '—',
  };
}

export function createKoreWindow({
  page = globalThis, host, poller, consoleModel, renderToggle = null,
  history = [], onFullscreen = () => {}, onDebug = () => {},
} = {}) {
  const document = page.document;
  const root = element(document, 'div', 'kore-window');
  root.setAttribute('aria-label', 'KoreEngine 科技改变生活');

  const summary = element(document, 'div', 'kore-summary');
  const identity = element(document, 'div', 'kore-identity');
  const name = element(document, 'span', 'kore-name', '等待 KE');
  const job = element(document, 'span', 'kore-job', '');
  identity.append(name, job);
  const headerActions = element(document, 'div', 'kore-header-actions');
  const debugButton = element(document, 'button', 'kore-link-button', 'Debug');
  debugButton.type = 'button';
  debugButton.addEventListener('click', () => onDebug());
  const fullscreenButton = element(document, 'button', 'kore-link-button', '⛶');
  fullscreenButton.type = 'button';
  fullscreenButton.setAttribute('aria-label', '进入全屏');
  fullscreenButton.title = '全屏';
  fullscreenButton.addEventListener('click', () => onFullscreen());
  headerActions.append(debugButton, fullscreenButton);
  const identityRow = element(document, 'div', 'kore-identity-row');
  identityRow.append(identity, headerActions);

  const bars = element(document, 'div', 'kore-bars');
  const makeBar = (label, className) => {
    const row = element(document, 'div', `kore-bar ${className}`);
    const tag = element(document, 'span', 'kore-bar-label', label);
    const track = element(document, 'span', 'kore-bar-track');
    const fill = element(document, 'span', 'kore-bar-fill');
    track.append(fill);
    const value = element(document, 'span', 'kore-bar-value', '—');
    row.append(tag, track, value);
    bars.append(row);
    return { fill, value };
  };
  const hpBar = makeBar('HP', 'kore-bar-hp');
  const spBar = makeBar('SP', 'kore-bar-sp');

  const meta = element(document, 'div', 'kore-meta');
  const mode = element(document, 'span', 'kore-mode', '模式 —');
  const task = element(document, 'span', 'kore-task', '任务 —');
  const map = element(document, 'span', 'kore-map', '地图 —');
  const target = element(document, 'span', 'kore-target', '目标 —');
  meta.append(mode, task, map, target);
  const waitLine = element(document, 'div', 'kore-wait');
  waitLine.hidden = true;
  summary.append(identityRow, bars, meta, waitLine);

  const actions = element(document, 'div', 'kore-actions');
  const commandButtons = [];
  for (const quick of KORE_QUICK_COMMANDS) {
    const button = element(document, 'button', 'kore-button', quick.label);
    button.type = 'button';
    button.addEventListener('click', () => send(quick.command));
    actions.append(button);
    commandButtons.push(button);
  }
  const renderLabel = element(document, 'label', 'kore-render-toggle');
  const renderCheckbox = element(document, 'input');
  renderCheckbox.type = 'checkbox';
  renderCheckbox.addEventListener('change', () => renderToggle?.setEnabled?.(renderCheckbox.checked));
  renderLabel.append(renderCheckbox, document.createTextNode(' 3D'));
  actions.append(renderLabel);

  const consoleNode = element(document, 'div', 'kore-console');
  consoleNode.setAttribute('role', 'log');
  consoleNode.setAttribute('aria-live', 'polite');

  const form = element(document, 'form', 'kore-command');
  const prompt = element(document, 'span', 'kore-prompt', '>');
  const input = element(document, 'input', 'kore-command-input');
  input.type = 'text';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('aria-label', 'KoreEngine 命令');
  input.placeholder = '输入命令，Enter 发送';
  const sendButton = element(document, 'button', 'kore-send', '发送');
  sendButton.type = 'submit';
  form.append(prompt, input, sendButton);
  form.addEventListener('submit', event => { event.preventDefault(); send(input.value); });
  root.addEventListener('keydown', event => event.stopPropagation());
  root.append(summary, actions, consoleNode, form);

  let historyIndex = history.length;
  function send(text) {
    const command = String(text ?? '').trim();
    if (!command) return false;
    const sent = host?.sendCommandText?.(command) === true;
    if (sent) {
      history.push(command);
      historyIndex = history.length;
      input.value = '';
      input.blur?.();
    }
    update();
    return sent;
  }
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') return;
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    if (!history.length) return;
    event.preventDefault();
    historyIndex = event.key === 'ArrowUp'
      ? Math.max(0, historyIndex - 1)
      : Math.min(history.length, historyIndex + 1);
    input.value = history[historyIndex] ?? '';
  });

  function setRatio(targetBar, ratio) {
    const percent = ratio.percent == null ? 0 : Math.max(0, Math.min(100, ratio.percent));
    targetBar.fill.style.width = `${percent}%`;
    targetBar.fill.dataset.percent = String(percent);
    targetBar.value.textContent = ratio.value == null ? '—' : `${ratio.value}/${ratio.max} ${percent}%`;
  }

  function update() {
    const state = host?.state ?? null;
    const status = poller?.results?.('status') ?? null;
    const ai = poller?.results?.('ai') ?? null;
    const where = poller?.results?.('where') ?? null;
    const model = statusModel({ status, ai, where, state });
    name.textContent = model.connected && model.worldReady ? model.name : '等待 KE';
    job.textContent = model.worldReady ? `${model.job} Lv ${model.level}` : (state?.status ?? '');
    setRatio(hpBar, model.hp);
    setRatio(spBar, model.sp);
    mode.textContent = model.mode === 'AUTO' ? '● 自动' : model.mode === 'OFF' ? '○ 关闭' : '模式 —';
    mode.dataset.mode = model.mode;
    task.textContent = `任务 ${model.task}`;
    map.textContent = `地图 ${model.map} ${model.position}`.trim();
    target.textContent = `目标 ${model.target}`;
    const statusError = poller?.errors?.('status');
    const aiError = poller?.errors?.('ai');
    const whereError = poller?.errors?.('where');
    const error = statusError ?? aiError ?? whereError;
    waitLine.hidden = !error && model.worldReady;
    waitLine.textContent = error
      ? String(error.message ?? error.code ?? 'KE 回显失败')
      : model.connected ? '等待世界状态…' : '等待 KoreEngine…';
    if (renderToggle) {
      renderCheckbox.disabled = renderToggle.available !== true;
      renderCheckbox.checked = renderToggle.enabled === true;
      renderLabel.title = renderToggle.available === true ? '切换 3D 渲染' : '当前客户端未暴露渲染接口';
    }
    renderConsole(consoleNode, consoleModel?.entries?.() ?? [], { page, maxLines: 6 });
  }

  const cleanups = [];
  if (poller?.subscribe) cleanups.push(poller.subscribe(() => update()));
  if (consoleModel?.subscribe) cleanups.push(consoleModel.subscribe(() => renderConsole(consoleNode, consoleModel.entries(), { page, maxLines: 6 })));
  if (host?.onStateChange) cleanups.push(host.onStateChange(() => update()));
  if (renderToggle?.onChange) cleanups.push(renderToggle.onChange(() => update()));
  update();

  return {
    element: root,
    update,
    send,
    focus() { input.focus?.(); },
    destroy() {
      for (const cleanup of cleanups) { try { cleanup(); } catch { /* best effort. */ } }
      root.remove();
    },
    get input() { return input; },
    get consoleNode() { return consoleNode; },
    get commandButtons() { return commandButtons; },
    get renderCheckbox() { return renderCheckbox; },
    get fullscreenButton() { return fullscreenButton; },
    get debugButton() { return debugButton; },
  };
}
