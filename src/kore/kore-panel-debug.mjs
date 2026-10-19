// Debug page shared by the small window and the fullscreen panel. It only
// projects host state and sends raw commands; it never mirrors Rust state.

import { KORE_CONFIG_FILES } from './kore-integration.mjs';
import { outputLines } from './kore-panel-console.mjs';

const normalize = value => String(value ?? '').trim().toLowerCase();
const el = (document, tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
const json = value => {
  try {
    return JSON.stringify(value, (_key, item) => typeof item === 'bigint' ? item.toString() : item, 2);
  } catch (error) { return `<unserializable: ${String(error?.message ?? error)}>`; }
};

const TABS = [['state', '状态'], ['packet', 'Packet'], ['config', '配置'], ['tests', '测试'], ['commands', '命令表']];

export function createKoreDebugView({ page = globalThis, host } = {}) {
  const document = page.document;
  const root = el(document, 'section', 'kore-debug');
  root.hidden = true;
  root.setAttribute('aria-label', 'KoreEngine Debug');
  const header = el(document, 'header', 'kore-debug-header');
  const title = el(document, 'strong', 'kore-debug-title', 'DEBUG');
  const tabs = el(document, 'div', 'kore-debug-tabs');
  const close = el(document, 'button', 'kore-debug-close', '关闭');
  close.type = 'button';
  close.addEventListener('click', () => hide());
  header.append(title, tabs, close);
  const body = el(document, 'div', 'kore-debug-body');
  root.append(header, body);

  const panes = new Map();
  const buttons = new Map();
  for (const [id, label] of TABS) {
    const button = el(document, 'button', 'kore-debug-tab', label);
    button.type = 'button';
    button.dataset.tab = id;
    button.addEventListener('click', () => show(id));
    tabs.append(button);
    buttons.set(id, button);
    const pane = el(document, 'div', 'kore-debug-pane');
    pane.dataset.tab = id;
    pane.hidden = true;
    body.append(pane);
    panes.set(id, pane);
  }

  // State / packet
  const statePre = el(document, 'pre', 'kore-debug-pre');
  panes.get('state').append(statePre);
  const packetPre = el(document, 'pre', 'kore-debug-pre');
  panes.get('packet').append(packetPre);

  // Config
  const config = panes.get('config');
  const configNote = el(document, 'div', 'kore-debug-note');
  const fileSelect = el(document, 'select', 'kore-debug-select');
  for (const file of KORE_CONFIG_FILES) {
    const option = el(document, 'option', '', file);
    option.value = file;
    fileSelect.append(option);
  }
  const editor = el(document, 'textarea', 'kore-debug-editor');
  editor.setAttribute('spellcheck', 'false');
  editor.rows = 18;
  const configButtons = el(document, 'div', 'kore-debug-actions');
  const loadButton = el(document, 'button', 'kore-button', 'Load');
  const saveButton = el(document, 'button', 'kore-button', 'Save');
  const reloadButton = el(document, 'button', 'kore-button', 'Save + ai off + reload');
  loadButton.type = saveButton.type = reloadButton.type = 'button';
  configButtons.append(loadButton, saveButton, reloadButton);
  const configResult = el(document, 'pre', 'kore-debug-pre');
  config.append(configNote, fileSelect, editor, configButtons, configResult);

  // Tests
  const tests = panes.get('tests');
  const testButtons = el(document, 'div', 'kore-debug-actions');
  for (const [label, command] of [['map retry', null], ['ai print', 'ai print'], ['exp', 'exp'], ['exp report', 'exp report'], ['help', 'help'], ['清空控制台', null]]) {
    const button = el(document, 'button', 'kore-button', label);
    button.type = 'button';
    button.addEventListener('click', () => {
      if (label === 'map retry') { host?.debugMapRetry?.(); return; }
      if (label === '清空控制台') { host?.clearConsole?.(); return; }
      host?.sendCommandText?.(command);
    });
    testButtons.append(button);
  }
  tests.append(testButtons);

  // Command table
  const commands = panes.get('commands');
  const commandButton = el(document, 'button', 'kore-button', '加载命令表');
  commandButton.type = 'button';
  const commandPre = el(document, 'pre', 'kore-debug-pre');
  commands.append(commandButton, commandPre);

  const pending = new Map();
  const sendSilent = (command, handler) => {
    pending.set(normalize(command), handler);
    if (host?.sendCommandText?.(command, { silent: true }) !== true) pending.delete(normalize(command));
  };
  commandButton.addEventListener('click', () => sendSilent('help', result => {
    commandPre.textContent = outputLines(result).map(line => line.text).join('\n');
  }));

  let current = 'state';
  const identity = () => host?.state?.configIdentity ?? null;

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
    if (await saveFile()) {
      host.sendCommandText('ai off');
      host.sendCommandText(`reload ${fileSelect.value}`);
    }
  });

  const unsubscribeOutput = host?.onCommandOutput?.(({ command, result, silent }) => {
    if (!silent) return;
    const handler = pending.get(normalize(command));
    if (!handler) return;
    pending.delete(normalize(command));
    handler(result);
  }) ?? (() => {});
  const unsubscribeState = host?.onStateChange?.(() => { if (!root.hidden) update(); }) ?? (() => {});

  function update() {
    const state = host?.state;
    if (!state) { statePre.textContent = 'no host'; packetPre.textContent = ''; return; }
    statePre.textContent = json({
      status: state.status, packageId: state.packageId, mode: state.mode,
      runtimeGeneration: state.runtimeGeneration, gameSessionId: state.gameSessionId,
      connectionGeneration: state.connectionGeneration, streamStatus: state.streamStatus,
      worldReady: state.worldReady, mapResourceState: state.mapResourceState,
      receivedBytes: state.receivedBytes, sentBytes: state.sentBytes,
      degradedReason: state.degradedReason, runtimeStatus: state.runtimeStatus,
      heartbeat: state.heartbeat, actions: state.actions.slice(-10),
    });
    packetPre.textContent = [
      `receivedBytes=${state.receivedBytes} sentBytes=${state.sentBytes}`,
      `lastDiagnostic=${json(state.lastDiagnostic)}`,
      ...state.diagnosticLog.map(entry => `${new Date(entry.timestamp).toLocaleTimeString()} ${entry.text}`),
    ].join('\n');
    configResult.textContent = json(state.lastCommandResult);
  }

  function show(tab = 'state') {
    current = panes.has(tab) ? tab : 'state';
    root.hidden = false;
    for (const [id, pane] of panes) pane.hidden = id !== current;
    for (const [id, button] of buttons) button.classList.toggle('is-active', id === current);
    update();
    if (current === 'config' && editor.value === '' && identity()) void loadFile();
  }
  function hide() { root.hidden = true; }

  return {
    element: root,
    show, hide, update,
    get visible() { return root.hidden !== true; },
    destroy() { unsubscribeOutput(); unsubscribeState(); pending.clear(); root.remove(); },
  };
}
