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
  view.show('config');
  await vi.waitFor(() => expect(host.getConfigDocuments).toHaveBeenCalled());
  const editor = window.document.querySelector<HTMLTextAreaElement>('.kore-debug-editor')!;
  editor.value = 'attackAuto 0\n';
  const save = [...window.document.querySelectorAll<HTMLButtonElement>('.kore-debug-actions button')]
    .find(button => button.textContent === 'Save')!;
  save.click();
  await vi.waitFor(() => expect(host.saveConfigDocument).toHaveBeenCalled());
  expect(host.saveConfigDocument).toHaveBeenCalledWith({
    profile: 'lastro-20211103', aid: 7, cid: 9, fileName: 'config.txt', rawText: 'attackAuto 0\n',
  });
  view.destroy();
});
