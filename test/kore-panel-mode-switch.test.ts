// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { createKoreWindow } from '../src/kore/kore-panel-window.mjs';

const kv = (pairs: Array<[string, string]>) => ({ kind: 'output', ok: true, blocks: [{ type: 'kv', pairs }] });

function mount(mode: string | null) {
  const host = {
    state: { status: 'runtime-ready', worldReady: true, authorization: { phase: 'ready', user: { displayName: 'Parker' } } },
    onStateChange: () => () => {},
    sendCommandText: vi.fn(() => true),
  };
  const results: Record<string, unknown> = {
    status: kv([['名称', 'Parker'], ['职业', '高阶祭司'], ['等级', '99/70']]),
    ...(mode ? { ai: kv([['模式', mode]]) } : {}),
  };
  const poller = { results: (name: string) => results[name] ?? null, errors: () => null, subscribe: () => () => {} };
  const view = createKoreWindow({ page: window, host: host as never, poller: poller as never });
  window.document.body.append(view.element);
  view.update();
  return { host, view, $$: (selector: string) => [...view.element.querySelectorAll<HTMLButtonElement>(selector)] };
}

afterEach(() => { window.document.body.replaceChildren(); });

test('the three AI modes sit together in their own switch row, apart from the one-shot commands', () => {
  const { view, $$ } = mount('AUTO');
  const modeRow = view.element.querySelector('.kore-mode-switch') as HTMLElement;
  expect([...modeRow.querySelectorAll('button')].map(button => button.textContent)).toEqual(['自动', '半自动', '关闭']);
  expect($$('.kore-actions .kore-button').map(button => button.textContent)).toEqual(['清空 AI 队列', '经验统计', '经验报告']);
  expect(modeRow.nextElementSibling?.classList.contains('kore-actions')).toBe(true);
  view.destroy();
});

test('the active mode is highlighted from what KE reports, never optimistically', () => {
  for (const [mode, active, label] of [['AUTO', '自动', '● 自动'], ['MANUAL', '半自动', '◊ 半自动'], ['OFF', '关闭', '○ 关闭']]) {
    const { view, $$ } = mount(mode);
    expect($$('.kore-mode-button').filter(button => button.getAttribute('aria-pressed') === 'true').map(button => button.textContent)).toEqual([active]);
    expect(view.element.querySelector('.kore-mode')?.textContent).toBe(label);
    view.destroy();
    window.document.body.replaceChildren();
  }

  const { host, view, $$ } = mount('AUTO');
  $$('.kore-mode-button')[1]!.click();
  expect(host.sendCommandText).toHaveBeenCalledWith('ai manual');
  expect($$('.kore-mode-button').filter(button => button.getAttribute('aria-pressed') === 'true').map(button => button.textContent)).toEqual(['自动']);
  view.destroy();
});

test('no mode is highlighted before KE has answered', () => {
  const { view, $$ } = mount(null);
  expect($$('.kore-mode-button').some(button => button.getAttribute('aria-pressed') === 'true')).toBe(false);
  expect(view.element.querySelector('.kore-mode')?.textContent).toBe('模式 —');
  view.destroy();
});

test('a failed status poll shows KE\'s own error text instead of a generic echo failure', () => {
  const host = {
    state: { status: 'runtime-ready', worldReady: true, authorization: { phase: 'ready', user: { displayName: 'Parker' } } },
    onStateChange: () => () => {},
    sendCommandText: vi.fn(() => true),
  };
  const failure = { kind: 'output', ok: false, blocks: [{ type: 'text', text: 'world-session-not-initialized: Command arrived before a world session' }] };
  const poller = { results: () => null, errors: (name: string) => (name === 'status' ? failure : null), subscribe: () => () => {} };
  const view = createKoreWindow({ page: window, host: host as never, poller: poller as never });
  window.document.body.append(view.element);
  view.update();
  expect(view.element.textContent).toContain('world-session-not-initialized: Command arrived before a world session');
  expect(view.element.textContent).not.toContain('KE 回显失败');
  view.destroy();
});
