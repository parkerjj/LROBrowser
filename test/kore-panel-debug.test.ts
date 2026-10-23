// @vitest-environment jsdom
import { expect, test, vi } from 'vitest';
import { createKoreDebugView } from '../src/kore/kore-panel-debug.mjs';

function debugHarness() {
  const documents = [{
    profile: 'lastro-20211103', aid: 7, cid: 9, fileName: 'config.txt',
    rawText: 'attackAuto 1\n', revision: 1,
  }];
  const host = {
    state: {
      status: 'runtime-ready', worldReady: true, logs: [], configIdentity: { aid: 7, cid: 9 },
      profile: 'lastro-20211103', runtimeStatus: null, lastDiagnostic: null, lastCommandResult: null,
      actions: [], diagnosticLog: [], receivedBytes: 0, sentBytes: 0, streamStatus: 'world-ready',
    },
    getConfigDocuments: vi.fn(async () => documents),
    saveConfigDocument: vi.fn(async (document: Record<string, unknown>) => ({
      fileName: String(document.fileName), rawText: String(document.rawText), revision: 2,
    })),
    sendCommandText: vi.fn(() => true),
    onCommandOutput: vi.fn(() => () => {}),
    onStateChange: vi.fn(() => () => {}),
    clearConsole: vi.fn(),
    debugMapRetry: vi.fn(() => true),
    reloadConfig: vi.fn(() => true),
  };
  return { host, documents };
}

test('debug config save includes the profile identity required by the config store', async () => {
  const { host } = debugHarness();
  const view = createKoreDebugView({ page: { document: window.document }, host });
  window.document.body.append(view.element);
  view.show();
  await vi.waitFor(() => expect(host.getConfigDocuments).toHaveBeenCalled());
  const editor = window.document.querySelector<HTMLTextAreaElement>('.kore-debug-editor')!;
  editor.value = 'attackAuto 0\n';
  const save = [...window.document.querySelectorAll<HTMLButtonElement>('.kore-debug-actions button')]
    .find(button => button.textContent === '保存')!;
  save.click();
  await vi.waitFor(() => expect(host.saveConfigDocument).toHaveBeenCalled());
  expect(host.saveConfigDocument).toHaveBeenCalledWith({
    profile: 'lastro-20211103', aid: 7, cid: 9, fileName: 'config.txt', rawText: 'attackAuto 0\n',
  });
  view.destroy();
});

test('copy and download export the state together with every raw config file', async () => {
  const { host, documents } = debugHarness();
  documents.push(
    { profile: 'lastro-20211103', aid: 7, cid: 9, fileName: 'timeouts.txt', rawText: 'ai_attack_unfail 12\n', revision: 3 },
    { profile: 'lastro-20211103', aid: 7, cid: 9, fileName: 'mon_control.txt', rawText: 'all 1 0 0\n', revision: 4 },
  );
  const writeText = vi.fn(async () => {});
  // 下载是点一个 <a download>；jsdom 不实现导航，别让它往 stderr 打噪音。
  vi.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  const blobs: string[] = [];
  class FakeBlob { constructor(parts: string[]) { blobs.push(parts.join('')); } }
  const page = {
    document: window.document,
    navigator: { clipboard: { writeText } },
    Blob: FakeBlob,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    setTimeout: () => 0,
  };
  const view = createKoreDebugView({ page, host });
  window.document.body.append(view.element);
  view.show();
  const button = (label: string) => [...window.document.querySelectorAll<HTMLButtonElement>('.kore-debug-actions button')]
    .find(item => item.textContent === label)!;

  button('复制 JSON').click();
  await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
  const copied = JSON.parse(String((writeText.mock.calls[0] as unknown[])[0]));
  expect(copied.status).toBe('runtime-ready');
  expect(Object.keys(copied.configDocuments)).toEqual(
    ['config.txt', 'mon_control.txt', 'timeouts.txt', 'pickupitems.txt', 'items_control.txt']);
  expect(copied.configDocuments['config.txt']).toEqual({ revision: 1, rawText: 'attackAuto 1\n' });
  expect(copied.configDocuments['timeouts.txt']).toEqual({ revision: 3, rawText: 'ai_attack_unfail 12\n' });
  // 存储里没有的文件明确写 null，不省略。
  expect(copied.configDocuments['pickupitems.txt']).toBeNull();

  button('下载 JSON').click();
  await vi.waitFor(() => expect(blobs).toHaveLength(1));
  expect(JSON.parse(blobs[0]!).configDocuments['mon_control.txt'].rawText).toBe('all 1 0 0\n');
  view.destroy();
});

test('the export says why the config is missing instead of failing', async () => {
  const { host } = debugHarness();
  const writeText = vi.fn(async () => {});
  const page = { document: window.document, navigator: { clipboard: { writeText } }, setTimeout: () => 0 };
  const view = createKoreDebugView({ page, host });
  window.document.body.append(view.element);
  view.show();
  // 先等配置编辑器自己的那次加载走完，再让导出读配置失败。
  await vi.waitFor(() => expect(host.getConfigDocuments).toHaveBeenCalled());
  host.getConfigDocuments.mockRejectedValueOnce(new Error('indexeddb unavailable'));
  [...window.document.querySelectorAll<HTMLButtonElement>('.kore-debug-actions button')]
    .find(item => item.textContent === '复制 JSON')!.click();
  await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
  const copied = JSON.parse(String((writeText.mock.calls[0] as unknown[])[0]));
  expect(copied.configDocuments).toBeNull();
  expect(copied.configDocumentsError).toContain('indexeddb unavailable');
  view.destroy();
});
