// @vitest-environment jsdom
import { expect, test, vi } from 'vitest';
import { createKoreWindow } from '../src/kore/kore-panel-window.mjs';

// 半自动也占实例额度：额度已满时，替换实例之后要用用户当初请求的模式启动。
function mount(detail: Record<string, unknown> | null) {
  const host = {
    state: { status: 'runtime-ready', degradedReason: null, worldReady: true, gameSessionId: 'game-1',
      authorization: { phase: 'quota-exceeded', user: { displayName: 'Parker' }, error: 'KE_QUOTA_EXCEEDED', detail } },
    onStateChange() { return () => {}; },
    sendCommandText: vi.fn(() => true),
    getAuthorizationDiagnostics: vi.fn(() => ''),
  };
  const view = createKoreWindow({ page: window, host: host as never });
  window.document.body.append(view.element);
  return { host, view };
}

const instances = [{ instance_id: 'instance-a', char_name: '旧角色', map_name: 'prontera' }];

test('a quota rejection of ai manual replaces the instance and starts manual mode', () => {
  const { host, view } = mount({ requested_mode: 'manual', active_instances: instances });

  expect(view.element.textContent).toContain('然后启动半自动模式');
  (view.element.querySelector('input[name="kore-quota-instance"]') as HTMLInputElement).click();
  (view.element.querySelector('.kore-quota-replace') as HTMLButtonElement).click();
  expect(host.sendCommandText).toHaveBeenCalledWith('ai manual kick instance-a');
  view.destroy();
});

test('a quota rejection of ai auto (or an unknown mode) still starts auto mode', () => {
  for (const detail of [{ requested_mode: 'auto', active_instances: instances }, { active_instances: instances }]) {
    const { host, view } = mount(detail);
    expect(view.element.textContent).toContain('然后启动自动模式');
    (view.element.querySelector('input[name="kore-quota-instance"]') as HTMLInputElement).click();
    (view.element.querySelector('.kore-quota-replace') as HTMLButtonElement).click();
    expect(host.sendCommandText).toHaveBeenCalledWith('ai auto kick instance-a');
    view.destroy();
  }
});

test('without a replaceable instance the retry button repeats the requested mode', () => {
  const { host, view } = mount({ requested_mode: 'manual' });

  const retry = [...view.element.querySelectorAll('button')].find(button => button.textContent === '重试半自动模式') as HTMLButtonElement;
  retry.click();
  expect(host.sendCommandText).toHaveBeenCalledWith('ai manual');
  view.destroy();
});
