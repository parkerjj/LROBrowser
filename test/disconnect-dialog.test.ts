// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const runtime = readFileSync(resolve(process.cwd(), 'vendor/v2/Online.js'), 'utf8');

// 取出真实的 showErrorBox 源码，在桩环境里执行，确认断线弹窗不再挡住 KE 面板。
function loadShowErrorBox() {
  const start = runtime.indexOf('    static showErrorBox(text');
  const end = runtime.indexOf('    static showMessageBox(', start);
  expect(start).toBeGreaterThan(0);
  expect(end).toBeGreaterThan(start);
  const body = runtime.slice(start, end).replace('static showErrorBox', 'showErrorBox').replaceAll('import.meta.url', 'undefined');
  const overlays: HTMLElement[] = [];
  const winError = {
    _host: document.createElement('div'),
    _shadow: document.createElement('div'),
    draggable: vi.fn(),
    append: vi.fn(() => { winError.init(); (winError.onAppend as (() => void) | undefined)?.(); }),
    remove: vi.fn(),
    init: () => {},
    onKeyDown: undefined as unknown,
    onAppend: undefined as unknown,
  };
  winError._shadow.innerHTML = '<div class="text"></div><div class="btns"></div>';
  const prioritize = vi.fn();
  const factory = new Function(
    '_popupPosition', '_createButton', '_createOverlay', '_prioritizeKeyDown', 'KEYS', '__vitePreload', 'init_GameEngine', 'GameEngine_exports',
    `return { ${body} };`,
  );
  const manager = factory(
    () => ({ top: '10px', left: '10px', zIndex: '100' }),
    (_name: string, onClick: () => void) => { const button = document.createElement('button'); button.addEventListener('click', onClick); return button; },
    () => { const overlay = document.createElement('div'); overlay.className = 'win_popup_overlay'; document.body.append(overlay); overlays.push(overlay); return overlay; },
    prioritize, { ENTER: 13, ESCAPE: 27 }, vi.fn(), vi.fn(), {},
  );
  manager.getComponent = () => ({ clone: () => winError });
  return { manager, winError, overlays, prioritize };
}

describe('disconnect dialog', () => {
  it('the in-game disconnect uses the non-modal error box', () => {
    expect(runtime).toContain('showErrorBox("Disconnected from Server.", { modal: false })');
  });

  it('non-modal error box has no blocking overlay, no Enter/Escape reload and sits below other windows', () => {
    const { manager, winError, overlays, prioritize } = loadShowErrorBox();
    manager.showErrorBox('Disconnected from Server.', { modal: false });
    expect(overlays).toHaveLength(0);
    expect(winError.onKeyDown).toBeUndefined();
    expect(prioritize).not.toHaveBeenCalled();
    expect(winError._host.style.zIndex).toBe('40');
    expect(winError.draggable).toHaveBeenCalled();
    expect(winError._shadow.querySelector('.text')?.textContent).toBe('Disconnected from Server.');
    // OK 仍然可以关闭并重新加载。
    (winError._shadow.querySelector('.btns button') as HTMLButtonElement).click();
    expect(winError.remove).toHaveBeenCalled();
  });

  it('other error boxes stay modal', () => {
    const { manager, winError, overlays } = loadShowErrorBox();
    manager.showErrorBox('传送失败');
    expect(overlays).toHaveLength(1);
    expect(typeof winError.onKeyDown).toBe('function');
    expect(winError._host.style.zIndex).toBe('100');
  });
});
