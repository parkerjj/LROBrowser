// Debug drawer: a right-hand sidebar shared by the small window and the
// fullscreen panel. It projects host state, sends raw commands and renders the
// console inline; it never mirrors Rust state and never opens its own transport.

import { KORE_CONFIG_FILES } from './kore-integration.mjs';
import { renderConsole } from './kore-panel-console.mjs';

const el = (document, tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
const json = value => {
  try {
    const text = JSON.stringify(value, (_key, item) => typeof item === 'bigint' ? item.toString() : item, 2);
    return text ?? 'null';
  } catch (error) { return `<unserializable: ${String(error?.message ?? error)}>`; }
};

export function createKoreDebugView({ page = globalThis, host } = {}) {
  const document = page.document;
  const root = el(document, 'section', 'kore-debug');
  root.hidden = true;
  root.setAttribute('aria-label', 'KoreEngine 调试侧边栏');

  const header = el(document, 'header', 'kore-debug-header');
  const title = el(document, 'strong', 'kore-debug-title', '调试');
  const close = el(document, 'button', 'kore-debug-close', '关闭');
  close.type = 'button';
  close.addEventListener('click', () => hide());
  header.append(title, close);

  const body = el(document, 'div', 'kore-debug-body');
  root.append(header, body);

  const section = titleText => {
    const node = el(document, 'section', 'kore-debug-section');
    node.append(el(document, 'h3', 'kore-debug-section-title', titleText));
    body.append(node);
    return node;
  };
  const commandButton = (parent, label, command) => {
    const button = el(document, 'button', 'kore-button', label);
    button.type = 'button';
    if (command) button.title = command;
    button.addEventListener('click', () => host?.sendCommandText?.(command));
    parent.append(button);
    return button;
  };

  // 数据：导出 / 复制 / 清空。
  const dataSection = section('数据');
  const dataButtons = el(document, 'div', 'kore-debug-actions');
  const copyButton = el(document, 'button', 'kore-button', '复制 JSON');
  const downloadButton = el(document, 'button', 'kore-button', '下载 JSON');
  const clearButton = el(document, 'button', 'kore-button', '清空控制台');
  copyButton.type = downloadButton.type = clearButton.type = 'button';
  copyButton.addEventListener('click', () => {
    const clipboard = (page.navigator ?? globalThis.navigator)?.clipboard;
    if (!clipboard?.writeText) { copyButton.textContent = '剪贴板不可用'; return; }
    clipboard.writeText(json(host?.state ?? null)).then(() => {
      copyButton.textContent = '已复制';
      page.setTimeout?.(() => { copyButton.textContent = '复制 JSON'; }, 1200);
    }, () => { copyButton.textContent = '复制失败'; });
  });
  downloadButton.addEventListener('click', () => {
    const BlobCtor = page.Blob ?? globalThis.Blob;
    const createObjectURL = page.URL?.createObjectURL ?? globalThis.URL?.createObjectURL;
    if (!BlobCtor || !createObjectURL) return;
    const url = createObjectURL(new BlobCtor([json(host?.state ?? null)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'kore-state.json';
    document.body.append(link); link.click(); link.remove();
    page.setTimeout?.(() => (page.URL?.revokeObjectURL ?? globalThis.URL?.revokeObjectURL)?.(url), 0);
  });
  clearButton.addEventListener('click', () => host?.clearConsole?.());
  dataButtons.append(copyButton, downloadButton, clearButton);
  dataSection.append(dataButtons);

  // 状态：只读 host 摘要。
  const statusSection = section('状态');
  const statusGrid = el(document, 'div', 'kore-debug-status');
  const statusFields = {};
  for (const [key, label] of [['status', '状态'], ['mode', '模式'], ['stream', '流'], ['worldReady', '世界就绪'], ['map', '地图资源'], ['runtime', '运行时'], ['bytes', '收发字节'], ['identity', '身份']]) {
    statusGrid.append(el(document, 'span', 'kore-debug-status-label', label));
    const value = el(document, 'span', 'kore-debug-status-value', '—');
    statusGrid.append(value);
    statusFields[key] = value;
  }
  statusSection.append(statusGrid);

  // AI 控制。
  const aiSection = section('AI 控制');
  const aiButtons = el(document, 'div', 'kore-debug-actions');
  for (const [label, command] of [['开启自动', 'ai auto'], ['关闭自动', 'ai off'], ['清空队列', 'ai clear'], ['AI 状态', 'ai print']]) {
    commandButton(aiButtons, label, command);
  }
  aiSection.append(aiButtons);

  // 查询命令（一次性，回显进控制台）。
  const querySection = section('查询');
  const queryButtons = el(document, 'div', 'kore-debug-actions');
  for (const [label, command] of [['状态', 's'], ['位置', 'where'], ['背包', 'i'], ['怪物', 'ml'], ['玩家', 'pl'], ['NPC', 'nl'], ['地面物品', 'il'], ['技能', 'skills'], ['手推车', 'cart'], ['经验', 'exp'], ['经验报告', 'exp report']]) {
    commandButton(queryButtons, label, command);
  }
  querySection.append(queryButtons);

  // 系统。
  const sysSection = section('系统');
  const sysButtons = el(document, 'div', 'kore-debug-actions');
  commandButton(sysButtons, '命令表', 'help');
  const mapRetryButton = el(document, 'button', 'kore-button', '地图重试');
  mapRetryButton.type = 'button';
  mapRetryButton.title = 'debugMapRetry';
  mapRetryButton.addEventListener('click', () => host?.debugMapRetry?.());
  sysButtons.append(mapRetryButton);
  sysSection.append(sysButtons);

  // 配置编辑器。
  const configSection = section('配置');
  const configNote = el(document, 'div', 'kore-debug-note');
  const fileSelect = el(document, 'select', 'kore-debug-select');
  for (const file of KORE_CONFIG_FILES) {
    const option = el(document, 'option', '', file);
    option.value = file;
    fileSelect.append(option);
  }
  const editor = el(document, 'textarea', 'kore-debug-editor');
  editor.setAttribute('spellcheck', 'false');
  editor.rows = 14;
  const configButtons = el(document, 'div', 'kore-debug-actions');
  const loadButton = el(document, 'button', 'kore-button', '加载');
  const saveButton = el(document, 'button', 'kore-button', '保存');
  const reloadButton = el(document, 'button', 'kore-button', '应用并重载');
  reloadButton.title = '先保存，再 ai off，然后 reload 到 Rust';
  loadButton.type = saveButton.type = reloadButton.type = 'button';
  configButtons.append(loadButton, saveButton, reloadButton);
  const configResult = el(document, 'pre', 'kore-debug-pre');
  configSection.append(configNote, fileSelect, editor, configButtons, configResult);

  // 控制台：命令回显直接显示在这里，无需翻页。
  const consoleSection = section('控制台');
  const consoleNode = el(document, 'div', 'kore-debug-console');
  consoleNode.setAttribute('role', 'log');
  consoleNode.setAttribute('aria-live', 'polite');
  consoleSection.append(consoleNode);

  // 网络。
  const netSection = section('网络');
  const netPre = el(document, 'pre', 'kore-debug-pre');
  netSection.append(netPre);

  const identity = () => {
    const state = host?.state;
    return state?.configIdentity ? { profile: state.profile, ...state.configIdentity } : null;
  };

  async function loadFile() {
    const owner = identity();
    if (!owner) { configNote.textContent = '需要先进入游戏获得 aid/cid'; return; }
    try {
      const documents = await host.getConfigDocuments(owner);
      const document = documents.find(item => item.fileName === fileSelect.value);
      if (!document) { configNote.textContent = `${fileSelect.value} 不在存储中`; return; }
      editor.value = document.rawText;
      configNote.textContent = `已加载 ${document.fileName} revision=${document.revision}`;
    } catch (error) { configNote.textContent = `加载失败: ${String(error?.message ?? error)}`; }
  }
  async function saveFile() {
    const owner = identity();
    if (!owner) { configNote.textContent = '需要先进入游戏获得 aid/cid'; return false; }
    try {
      const saved = await host.saveConfigDocument({ ...owner, fileName: fileSelect.value, rawText: editor.value });
      configNote.textContent = `已保存 ${saved.fileName} revision=${saved.revision}`;
      return true;
    } catch (error) { configNote.textContent = `保存失败: ${String(error?.message ?? error)}`; return false; }
  }
  loadButton.addEventListener('click', () => void loadFile());
  saveButton.addEventListener('click', () => void saveFile());
  reloadButton.addEventListener('click', async () => {
    if (!await saveFile()) return;
    host.sendCommandText('ai off');
    // reload 需要 Host 附带 IndexedDB 配置文档和身份，不能只发裸文本。
    if (host.reloadConfig?.(fileSelect.value) !== true) configNote.textContent = 'reload 未发送：需要已验证的 aid/cid';
  });

  const unsubscribeState = host?.onStateChange?.(() => { if (!root.hidden) update(); }) ?? (() => {});

  function update() {
    const state = host?.state;
    if (!state) return;
    statusFields.status.textContent = state.status ?? '-';
    statusFields.mode.textContent = state.mode ?? '-';
    statusFields.stream.textContent = state.streamStatus ?? '-';
    statusFields.worldReady.textContent = String(state.worldReady);
    statusFields.map.textContent = state.mapResourceState ?? '-';
    statusFields.runtime.textContent = state.runtimeStatus
      ? `${state.runtimeStatus.runtimeState ?? '-'} rev=${state.runtimeStatus.revision ?? '-'}`
      : '-';
    statusFields.bytes.textContent = `recv=${state.receivedBytes} sent=${state.sentBytes}`;
    statusFields.identity.textContent = state.configIdentity
      ? `aid=${state.configIdentity.aid} cid=${state.configIdentity.cid}`
      : '-';
    netPre.textContent = [
      `receivedBytes=${state.receivedBytes} sentBytes=${state.sentBytes}`,
      `lastDiagnostic=${json(state.lastDiagnostic)}`,
      ...(state.diagnosticLog ?? []).map(entry => `${new Date(entry.timestamp).toLocaleTimeString()} ${entry.text}`),
    ].join('\n');
    configResult.textContent = state.lastCommandResult ? json(state.lastCommandResult) : '暂无命令结果';
    renderConsole(consoleNode, state.logs ?? [], { page, maxLines: 400 });
  }

  function show() {
    root.hidden = false;
    update();
    if (editor.value === '' && identity()) void loadFile();
  }
  function hide() { root.hidden = true; }

  return {
    element: root,
    show, hide, update,
    get visible() { return root.hidden !== true; },
    destroy() { unsubscribeState(); root.remove(); },
  };
}
