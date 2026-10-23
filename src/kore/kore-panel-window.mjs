// KE small-window view. It renders Rust output and forwards raw command text;
// it never decides gameplay state or updates anything optimistically.

import { renderConsole } from './kore-panel-console.mjs';
import { authorizationGuide } from './kore-auth-guide.mjs';
import { copyText } from './kore-clipboard.mjs';

// Entries with a `mode` form the mode switch (the active one is highlighted from KE's own
// answer); the rest are plain one-shot commands.
export const KORE_QUICK_COMMANDS = Object.freeze([
  { label: '自动', command: 'ai auto', mode: 'AUTO', title: '全自动：索敌、拾取、补给、寻路。需要 LTSD 授权并占用实例额度' },
  { label: '半自动', command: 'ai manual', mode: 'MANUAL', title: '半自动：全自动砍掉自动补给、自动走路（寻怪/追怪/随机走动/拾取/回挂机图）、寻怪瞬移、自动坐/站和死亡复活。保留自动换装、用药、BUFF、保命瞬移，以及射程内的怪自动选技能出手（不追怪、不走位、不普攻，各项按 manualAI 为 1/2 过滤）。位置由你控制。需要 LTSD 授权，和自动模式一样占实例额度' },
  { label: '关闭', command: 'ai off', mode: 'OFF', title: '关闭 KE 的自动功能' },
  { label: '清空 AI 队列', command: 'ai clear', title: '只清空 KE 内部队列，与游戏任务无关' },
  { label: '经验统计', command: 'exp' },
  { label: '经验报告', command: 'exp report' },
]);

const MODE_LABELS = Object.freeze({ AUTO: '● 自动', MANUAL: '◊ 半自动', OFF: '○ 关闭' });

// KE 命令失败是 {kind:'output', ok:false, blocks:[{text:'<code>: <msg>'}]}，没有 message/code 字段。
const pollErrorText = error => {
  const text = error.blocks?.find(block => typeof block?.text === 'string' && block.text)?.text;
  return String(error.message ?? error.code ?? text ?? 'KE 回显失败');
};

const quotaInstanceLabel = value => {
  if (!value || typeof value !== 'object' || typeof value.instance_id !== 'string'
    || !/^[A-Za-z0-9-]{1,64}$/.test(value.instance_id)) return null;
  return {
    id: value.instance_id,
    name: String(value.char_name || 'LastRO 角色'),
    map: String(value.map_name ?? ''),
    lastHeartbeat: value.last_heartbeat_at == null ? '' : String(value.last_heartbeat_at),
  };
};

const element = (document, tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

// Four outline corners, 14px at 1.5px stroke like the rest of the panel's icons.
function expandIcon(document) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  for (const [name, value] of Object.entries({
    viewBox: '0 0 14 14', width: '14', height: '14', fill: 'none',
    stroke: 'currentColor', 'stroke-width': '1.5', 'aria-hidden': 'true',
  })) svg.setAttribute(name, value);
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9');
  svg.append(path);
  return svg;
}

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
  root.setAttribute('aria-label', 'KoreEngine');

  const onboarding = element(document, 'section', 'kore-onboarding');
  onboarding.setAttribute('aria-labelledby', 'kore-onboarding-title');
  const onboardingTitle = element(document, 'h2', 'kore-onboarding-title', '连接 KoreEngine');
  onboardingTitle.id = 'kore-onboarding-title';
  const onboardingLead = element(document, 'p', 'kore-onboarding-lead');
  const onboardingSteps = element(document, 'ol', 'kore-onboarding-steps');
  const stepNodes = ['LTSD 账号', 'LastRO 角色', '配置同步'].map((label, index) => {
    const item = element(document, 'li', 'kore-onboarding-step', label);
    item.dataset.step = String(index + 1);
    onboardingSteps.append(item);
    return item;
  });
  const onboardingContent = element(document, 'div', 'kore-onboarding-content');
  onboardingContent.setAttribute('aria-live', 'polite');
  const onboardingActions = element(document, 'div', 'kore-onboarding-actions');
  onboarding.append(onboardingTitle, onboardingLead, onboardingSteps, onboardingContent, onboardingActions);
  const runtimeView = element(document, 'div', 'kore-runtime-view');
  // 配置栏：配置来源/同步时间在左，“编辑配置 → 同步并重载”两步操作在右，顺序即日常使用流程。
  const configNotice = element(document, 'div', 'kore-config-notice');
  const configSource = element(document, 'span', 'kore-config-source');
  configSource.setAttribute('role', 'status');
  const configEdit = element(document, 'button', 'kore-button kore-config-edit', '编辑配置 ↗');
  configEdit.type = 'button';
  configEdit.title = '在 LTSD 打开配置编辑页（新标签页）';
  configEdit.addEventListener('click', () => { page.open?.('https://ltsd.ro/ke', '_blank', 'noopener,noreferrer'); });
  const configRetry = element(document, 'button', 'kore-button kore-config-retry', '同步并重载');
  configRetry.type = 'button';
  configRetry.title = '从 LTSD 拉取最新配置并重新加载 KoreEngine';
  configRetry.addEventListener('click', () => { void host?.refreshConfiguration?.(); });
  configNotice.append(configSource, configEdit, configRetry);

  const summary = element(document, 'div', 'kore-summary');
  const identity = element(document, 'div', 'kore-identity');
  const name = element(document, 'span', 'kore-name', '等待 KE');
  const job = element(document, 'span', 'kore-job', '');
  identity.append(name, job);
  const headerActions = element(document, 'div', 'kore-header-actions');
  const debugButton = element(document, 'button', 'kore-link-button', 'Debug');
  debugButton.type = 'button';
  debugButton.addEventListener('click', () => onDebug());
  const fullscreenButton = element(document, 'button', 'kore-link-button');
  fullscreenButton.append(expandIcon(document));
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

  const modeSwitch = element(document, 'div', 'kore-mode-switch');
  modeSwitch.setAttribute('role', 'group');
  modeSwitch.setAttribute('aria-label', 'AI 模式');
  const actions = element(document, 'div', 'kore-actions');
  const commandButtons = [];
  const modeButtons = [];
  for (const quick of KORE_QUICK_COMMANDS) {
    const button = element(document, 'button', quick.mode ? 'kore-button kore-mode-button' : 'kore-button', quick.label);
    button.type = 'button';
    if (quick.title) button.title = quick.title;
    button.addEventListener('click', () => send(quick.command));
    if (quick.mode) {
      button.dataset.mode = quick.mode;
      button.setAttribute('aria-pressed', 'false');
      modeSwitch.append(button);
      modeButtons.push(button);
    } else {
      actions.append(button);
    }
    commandButtons.push(button);
  }
  const renderLabel = element(document, 'label', 'kore-render-toggle');
  const renderCheckbox = element(document, 'input');
  renderCheckbox.type = 'checkbox';
  // 勾选 = 省电模式（黑屏），与 renderToggle 的 enabled（3D 开启）语义相反。
  renderCheckbox.addEventListener('change', () => renderToggle?.setEnabled?.(!renderCheckbox.checked));
  renderLabel.append(renderCheckbox, document.createTextNode(' 省电模式'));
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
  runtimeView.append(summary, modeSwitch, actions, configNotice, consoleNode, form);
  root.append(onboarding, runtimeView);

  function authButton(label, className, action) {
    const button = element(document, 'button', className, label);
    button.type = 'button';
    button.addEventListener('click', action);
    onboardingActions.append(button);
    return button;
  }

  let selectedQuotaInstanceId = null;
  function errorCard(guide) {
    const card = element(document, 'section', 'kore-error-card');
    card.setAttribute('role', 'alert');
    card.append(element(document, 'h3', 'kore-error-title', guide.title));
    if (guide.cause) card.append(element(document, 'p', 'kore-onboarding-error', guide.cause));
    if (guide.steps.length) {
      const steps = element(document, 'ol', 'kore-error-steps');
      for (const step of guide.steps) steps.append(element(document, 'li', null, step));
      card.append(steps);
    }
    if (guide.code) card.append(element(document, 'code', 'kore-error-code', guide.code));
    return card;
  }

  function copyDiagnostics(event, code) {
    const button = event.currentTarget;
    const report = host?.getAuthorizationDiagnostics?.() ?? `错误码: ${code ?? '-'}`;
    void copyText(page, report).then(copied => {
      if (copied) { button.textContent = '已复制错误信息'; return; }
      page.console?.log?.('[KoreEngine] diagnostics', report);
      button.textContent = '复制失败，已输出到控制台';
    });
  }

  let runtimeShown = false;
  function renderAuthorization() {
    const auth = host?.state?.authorization;
    if (!auth || typeof auth !== 'object') {
      onboarding.hidden = true;
      runtimeView.hidden = false;
      configNotice.hidden = true;
      return;
    }
    const phase = String(auth.phase ?? 'signed-out');
    // 运行中手动“同步并重载”会经过 loading-profile/loading-runtime；此时保留控制台，不退回首次接入界面。
    const syncing = ['loading-profile', 'loading-runtime'].includes(phase);
    const showRuntime = phase === 'ready' || phase === 'starting-license' || (syncing && runtimeShown);
    runtimeShown = showRuntime;
    onboarding.hidden = showRuntime;
    runtimeView.hidden = !showRuntime;
    const updatedAt = Number(auth.profileUpdatedAt);
    const hasSyncTime = Number.isFinite(updatedAt) && updatedAt > 0;
    configNotice.hidden = false;
    configSource.dataset.cached = String(auth.configCached === true);
    if (auth.configCached === true) {
      configSource.textContent = hasSyncTime
        ? `本地缓存 · 最后成功同步 ${new Date(updatedAt).toLocaleString()}`
        : '本地缓存 · 尚无同步时间';
    } else {
      configSource.textContent = syncing ? '正在同步配置…'
        : hasSyncTime ? `配置已同步 ${new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '配置';
    }
    configRetry.disabled = syncing;
    configRetry.textContent = syncing ? '同步中…' : '同步并重载';
    onboardingContent.replaceChildren();
    onboardingActions.replaceChildren();
    onboardingContent.removeAttribute('data-tone');
    const user = auth.user && typeof auth.user === 'object' ? auth.user : null;
    const hasAccount = Boolean(user);
    const beforeCore = host?.state?.status !== 'runtime-ready';
    const step = hasAccount ? (['waiting-character', 'waiting-bind', 'binding-character'].includes(phase) || (phase === 'error' && beforeCore) ? 2 : 3) : 1;
    for (const [index, node] of stepNodes.entries()) {
      node.dataset.state = index + 1 < step ? 'complete' : index + 1 === step ? 'current' : 'upcoming';
    }
    const accountName = String(user?.displayName ?? user?.display_name ?? '');
    const status = text => onboardingContent.append(element(document, 'p', 'kore-onboarding-status', text));
    // 后台运行环境已停止时，即使授权阶段没有错误码也必须说明原因，不能让用户对着不动的面板干等。
    const workerFailed = host?.state?.status === 'failed';
    const errorCode = auth.error ?? (workerFailed ? host.state.degradedReason ?? 'worker-stopped' : null);
    const baseGuide = authorizationGuide(errorCode, { stalled: auth.stalled === true });
    // LTSD 返回的在线实例数就是当前占用的名额：额度用完时直接告诉用户上限是几个。
    const quotaCount = Array.isArray(auth.detail?.active_instances) ? auth.detail.active_instances.length : 0;
    const guide = baseGuide && errorCode === 'KE_QUOTA_EXCEEDED' && quotaCount > 0
      ? { ...baseGuide, title: `同时运行的实例已达上限：${quotaCount} 个`, cause: '' } : baseGuide;
    if (guide) onboardingContent.append(errorCard(guide));
    const phaseTitle = {
      'signed-out': '连接 KoreEngine',
      'requesting-device': '正在连接 LTSD',
      'awaiting-approval': '批准此设备',
      'checking-account': '正在验证 LTSD 账号',
      'waiting-character': '等待 LastRO 角色',
      'waiting-bind': '准备绑定角色',
      'binding-character': '绑定 LastRO 角色',
      'rebuilding-instance': '恢复授权实例',
      'loading-profile': '同步角色配置',
      'loading-runtime': '重新加载 KoreEngine',
      'profile-missing': '还没有活动配置',
      'profile-unavailable': '配置暂时不可用',
      'cache-fallback': '使用本地缓存',
      'device-expired': '验证码已过期',
      'device-denied': '设备授权未批准',
      error: '连接未完成',
    };
    onboardingTitle.textContent = phaseTitle[phase] ?? '连接 KoreEngine';
    onboardingLead.textContent = hasAccount ? `LTSD 账号：${accountName}` : '通过 LTSD.ro 登录，然后同步当前角色配置。';

    if (phase === 'signed-out' || phase === 'device-expired' || phase === 'device-denied' || phase === 'error') {
      if (!auth.error) status(phase === 'device-expired' ? '请重新申请设备验证码。'
        : phase === 'device-denied' ? '请在 LTSD 授权页确认后重新开始。' : '首次使用 KoreEngine 需要先连接 LTSD。');
      if (phase === 'error' && hasAccount) authButton('重试', 'kore-auth-primary', () => { void host.retryAuthorization?.(); });
      authButton(phase === 'signed-out' ? '通过 LTSD.ro 登录' : '重新登录 LTSD', phase === 'error' && hasAccount ? 'kore-auth-secondary' : 'kore-auth-primary', () => { void host.beginLtsdLogin?.(); });
    } else if (phase === 'requesting-device' || phase === 'checking-account') {
      status(phase === 'requesting-device' ? '正在申请一次性设备验证码…' : '正在确认账号状态…');
    } else if (phase === 'awaiting-approval') {
      status('请在打开的 LTSD 页面核对验证码并批准。');
      const code = element(document, 'div', 'kore-device-code', String(auth.userCode ?? ''));
      code.setAttribute('aria-label', '设备验证码');
      onboardingContent.append(code);
      const expiresAt = Number(auth.expiresAt);
      if (Number.isFinite(expiresAt) && expiresAt > 0) {
        const expiry = new Date(expiresAt);
        const expiryNode = element(document, 'time', 'kore-device-expiry', `有效期至 ${expiry.toLocaleTimeString()}`);
        expiryNode.dateTime = expiry.toISOString();
        expiryNode.title = expiry.toLocaleString();
        onboardingContent.append(expiryNode);
      }
      authButton('打开 LTSD 批准页', 'kore-auth-primary kore-auth-open', () => host.openLtsdApproval?.());
      authButton('复制验证码', 'kore-auth-secondary kore-auth-copy', event => {
        const button = event.currentTarget;
        void copyText(page, String(auth.userCode ?? '')).then(copied => { button.textContent = copied ? '已复制' : '复制失败'; });
      });
      authButton('重新申请验证码', 'kore-auth-secondary', () => { void host.beginLtsdLogin?.(); });
      authButton('取消', 'kore-auth-link', () => host.cancelLtsdLogin?.());
    } else if (phase === 'waiting-character' || phase === 'waiting-bind' || phase === 'binding-character') {
      status(phase === 'waiting-character' ? '登录游戏角色后，KoreEngine 会继续绑定。'
        : phase === 'binding-character' ? '正在向 LTSD 验证当前角色…' : '等待启动层准备当前角色的绑定请求…');
      if (hasAccount && phase === 'waiting-bind') authButton('重试', 'kore-auth-secondary', () => { void host.retryAuthorization?.(); });
      if (hasAccount) authButton('退出 LTSD', 'kore-auth-link', () => { void host.logoutLtsd?.(); });
    } else if (phase === 'rebuilding-instance') {
      status('LTSD 已清理旧实例，正在使用当前角色和实例 ID 重新绑定。');
    } else if (phase === 'loading-profile' || phase === 'loading-runtime') {
      status(phase === 'loading-profile' ? '正在获取 LTSD 活动配置…' : '配置已获取，正在让 KoreEngine 执行 reload all…');
    } else if (phase === 'profile-missing') {
      status('前往 LTSD 为当前角色创建并启用一套配置。');
      authButton('前往 LTSD 配置', 'kore-auth-primary', () => page.open?.('https://ltsd.ro/ke', '_blank', 'noopener,noreferrer'));
      authButton('重新检查', 'kore-auth-secondary', () => { void host.refreshConfiguration?.(); });
    } else if (phase === 'profile-unavailable') {
      status('配置接口暂时失败；成功同步过的配置会按账号和角色保存在本地。');
      authButton('重试同步', 'kore-auth-primary', () => { void host.refreshConfiguration?.(); });
    } else if (phase === 'cache-fallback') {
      const updatedAt = Number(auth.profileUpdatedAt);
      status(`最后成功同步：${Number.isFinite(updatedAt) && updatedAt > 0 ? new Date(updatedAt).toLocaleString() : '时间未知'}`);
      authButton('重试同步', 'kore-auth-primary', () => { void host.refreshConfiguration?.(); });
    } else if (phase === 'quota-exceeded') {
      // 半自动也占额度：额度已满时用用户当初请求的模式（Rust 放在 detail.requested_mode）重新启动。
      const startCommand = auth.detail?.requested_mode === 'manual' ? 'manual' : 'auto';
      const modeLabel = startCommand === 'manual' ? '半自动' : '自动';
      const instances = Array.isArray(auth.detail?.active_instances)
        ? auth.detail.active_instances.map(quotaInstanceLabel).filter(Boolean).slice(0, 32) : [];
      if (!instances.some(instance => instance.id === selectedQuotaInstanceId)) selectedQuotaInstanceId = null;
      if (instances.length) {
        status(`选择一个仍在运行的实例并替换，然后启动${modeLabel}模式：`);
        const list = element(document, 'div', 'kore-quota-list');
        let replaceButton = null;
        for (const instance of instances) {
          const label = element(document, 'label', 'kore-quota-instance');
          const radio = element(document, 'input');
          radio.type = 'radio';
          radio.name = 'kore-quota-instance';
          radio.value = instance.id;
          radio.checked = instance.id === selectedQuotaInstanceId;
          radio.addEventListener('change', () => {
            selectedQuotaInstanceId = instance.id;
            if (replaceButton) replaceButton.disabled = false;
          });
          const details = element(document, 'span', 'kore-quota-instance-details');
          details.append(element(document, 'span', 'kore-quota-instance-name', instance.name));
          if (instance.map) details.append(element(document, 'span', 'kore-quota-instance-map', instance.map));
          label.append(radio, details);
          list.append(label);
        }
        onboardingContent.append(list);
        replaceButton = authButton('替换所选实例并启动', 'kore-auth-primary kore-quota-replace', () => {
          if (selectedQuotaInstanceId) host.sendCommandText?.(`ai ${startCommand} kick ${selectedQuotaInstanceId}`);
        });
        replaceButton.disabled = selectedQuotaInstanceId === null;
      } else {
        status('LTSD 没有返回可替换的实例；请在其他已登录设备停止自动模式后重试。');
        authButton(`重试${modeLabel}模式`, 'kore-auth-secondary', () => host.sendCommandText?.(`ai ${startCommand}`));
      }
    }
    if (guide) {
      authButton('复制错误信息', 'kore-auth-secondary kore-auth-copy-error', event => copyDiagnostics(event, errorCode));
      if (workerFailed) authButton('刷新页面', 'kore-auth-primary kore-auth-reload', () => page.location?.reload?.());
    }
    if (hasAccount && !['waiting-character', 'waiting-bind', 'binding-character', 'awaiting-approval'].includes(phase)) {
      authButton('退出 LTSD', 'kore-auth-link', () => { void host.logoutLtsd?.(); });
    }
  }

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
    if (percent <= 12) targetBar.fill.dataset.level = 'crit';
    else if (percent <= 25) targetBar.fill.dataset.level = 'warn';
    else delete targetBar.fill.dataset.level;
    targetBar.value.textContent = ratio.value == null ? '—' : `${ratio.value}/${ratio.max} ${percent}%`;
  }

  function update() {
    renderAuthorization();
    const state = host?.state ?? null;
    const status = poller?.results?.('status') ?? null;
    const ai = poller?.results?.('ai') ?? null;
    const where = poller?.results?.('where') ?? null;
    const model = statusModel({ status, ai, where, state });
    name.textContent = model.connected && model.worldReady ? model.name : '等待 KE';
    job.textContent = model.worldReady ? `${model.job} Lv ${model.level}` : (state?.status ?? '');
    setRatio(hpBar, model.hp);
    setRatio(spBar, model.sp);
    mode.textContent = MODE_LABELS[model.mode] ?? '模式 —';
    mode.dataset.mode = model.mode;
    for (const button of modeButtons) {
      const active = button.dataset.mode === model.mode;
      button.dataset.active = String(active);
      button.setAttribute('aria-pressed', String(active));
    }
    task.textContent = `任务 ${model.task}`;
    map.textContent = `地图 ${model.map} ${model.position}`.trim();
    target.textContent = `目标 ${model.target}`;
    const statusError = poller?.errors?.('status');
    const aiError = poller?.errors?.('ai');
    const whereError = poller?.errors?.('where');
    const error = statusError ?? aiError ?? whereError;
    waitLine.hidden = !error && model.worldReady;
    waitLine.textContent = error
      ? pollErrorText(error)
      : model.connected ? '等待世界状态…' : '等待 KoreEngine…';
    if (renderToggle) {
      renderCheckbox.disabled = renderToggle.available !== true;
      renderCheckbox.checked = renderToggle.enabled !== true;
      renderLabel.title = renderToggle.available === true ? '勾选后黑屏省电，取消勾选恢复正常显示' : '当前客户端未暴露渲染接口';
    }
    renderConsole(consoleNode, consoleModel?.entries?.() ?? [], { page, maxLines: 6, filter: consoleModel?.filter });
  }

  const cleanups = [];
  if (poller?.subscribe) cleanups.push(poller.subscribe(() => update()));
  if (consoleModel?.subscribe) cleanups.push(consoleModel.subscribe(() => renderConsole(consoleNode, consoleModel.entries(), { page, maxLines: 6, filter: consoleModel?.filter })));
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
