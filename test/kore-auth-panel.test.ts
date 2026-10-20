// @vitest-environment jsdom
import { expect, test, vi } from 'vitest';
import { createKoreWindow } from '../src/kore/kore-panel-window.mjs';

function mount(authorization: Record<string, unknown>, status = 'runtime-ready', degradedReason: string | null = null) {
  const listeners = new Set<(state: unknown) => void>();
  const host = {
    state: { status, degradedReason, worldReady: true, gameSessionId: 'game-1', authorization },
    beginLtsdLogin: vi.fn(async () => true),
    openLtsdApproval: vi.fn(() => true),
    cancelLtsdLogin: vi.fn(),
    logoutLtsd: vi.fn(async () => true),
    refreshConfiguration: vi.fn(async () => ({ status: 'loaded', cached: false })),
    retryAuthorization: vi.fn(async () => true),
    getAuthorizationDiagnostics: vi.fn(() => 'KoreEngine 诊断信息\n授权阶段: error'),
    onStateChange(listener: (state: unknown) => void) { listeners.add(listener); return () => listeners.delete(listener); },
    sendCommandText: vi.fn(() => true),
  };
  const view = createKoreWindow({ page: window, host: host as never });
  window.document.body.append(view.element);
  return { host, view, notify() { for (const listener of listeners) listener(host.state); } };
}

test('a signed-out player sees LTSD login before gameplay controls', async () => {
  const { host, view } = mount({ phase: 'signed-out', user: null });

  expect(view.element.textContent).toContain('通过 LTSD.ro 登录');
  expect((view.element.querySelector('.kore-runtime-view') as HTMLElement).hidden).toBe(true);
  (view.element.querySelector('.kore-auth-primary') as HTMLButtonElement).click();
  expect(host.beginLtsdLogin).toHaveBeenCalledOnce();
  view.destroy();
});

test('device approval presents the matching code and opens the verified LTSD page', () => {
  const expiresAt = Date.now() + 60_000;
  const { host, view } = mount({ phase: 'awaiting-approval', userCode: 'BCDF-GHJK',
    verificationUriComplete: 'https://ltsd.ro/ke/device?code=BCDF-GHJK', expiresAt, interval: 5 });

  expect(view.element.querySelector('.kore-device-code')?.textContent).toBe('BCDF-GHJK');
  expect(view.element.querySelector('time.kore-device-expiry')?.getAttribute('datetime')).toBe(new Date(expiresAt).toISOString());
  (view.element.querySelector('.kore-auth-open') as HTMLButtonElement).click();
  expect(host.openLtsdApproval).toHaveBeenCalledOnce();
  view.destroy();
});

test('the device code can be copied from the approval step', async () => {
  const writeText = vi.fn(async () => {});
  Object.defineProperty(window.navigator, 'clipboard', { configurable: true, value: { writeText } });
  const { view } = mount({ phase: 'awaiting-approval', userCode: 'BCDF-GHJK', expiresAt: Date.now() + 60_000 });

  (view.element.querySelector('.kore-auth-copy') as HTMLButtonElement).click();
  await Promise.resolve();

  expect(writeText).toHaveBeenCalledWith('BCDF-GHJK');
  view.destroy();
});

test('profile absence leads to LTSD setup and cached fallback stays visibly marked', () => {
  const missing = mount({ phase: 'profile-missing', user: { displayName: 'Parker' }, error: 'KE_PROFILE_NOT_FOUND' });
  expect(missing.view.element.textContent).toContain('前往 LTSD 配置');
  expect((missing.view.element.querySelector('.kore-runtime-view') as HTMLElement).hidden).toBe(true);
  missing.view.destroy();

  const cached = mount({ phase: 'cache-fallback', user: { displayName: 'Parker' }, profileUpdatedAt: 1_800_000_000_000,
    error: 'KE_UNAVAILABLE' });
  expect(cached.view.element.textContent).toContain('本地缓存');
  expect(cached.view.element.textContent).toContain('KE_UNAVAILABLE');
  expect((cached.view.element.querySelector('.kore-runtime-view') as HTMLElement).hidden).toBe(true);
  cached.view.destroy();
});

test('normal Kore controls appear only after configuration reload is ready', () => {
  const { view } = mount({ phase: 'ready', user: { displayName: 'Parker' } });

  expect((view.element.querySelector('.kore-runtime-view') as HTMLElement).hidden).toBe(false);
  expect([...view.element.querySelectorAll('.kore-mode-button')].map(button => button.textContent)).toEqual(['自动', '半自动', '关闭']);
  view.destroy();
});

test('ready state keeps cached configuration provenance visible and can retry LTSD sync', () => {
  const { host, view } = mount({ phase: 'ready', configCached: true,
    profileUpdatedAt: 1_800_000_000_000, user: { displayName: 'Parker' } });

  expect((view.element.querySelector('.kore-runtime-view') as HTMLElement).hidden).toBe(false);
  expect(view.element.querySelector('.kore-config-source')?.textContent).toContain('本地缓存');
  (view.element.querySelector('.kore-config-retry') as HTMLButtonElement).click();
  expect(host.refreshConfiguration).toHaveBeenCalledOnce();
  view.destroy();
});

test('ready state offers one-click LTSD editing and sync-and-reload next to the config status', () => {
  const open = vi.fn();
  const { host, view } = mount({ phase: 'ready', profileUpdatedAt: 1_800_000_000_000, user: { displayName: 'Parker' } });
  (view.element.ownerDocument.defaultView as Window & { open: unknown }).open = open;

  expect(view.element.querySelector('.kore-config-source')?.textContent).toMatch(/^配置已同步 /);
  const edit = view.element.querySelector('.kore-config-edit') as HTMLButtonElement;
  const sync = view.element.querySelector('.kore-config-retry') as HTMLButtonElement;
  expect(edit.textContent).toContain('编辑配置');
  expect(sync.textContent).toBe('同步并重载');
  edit.click();
  expect(open).toHaveBeenCalledWith('https://ltsd.ro/ke', '_blank', 'noopener,noreferrer');
  sync.click();
  expect(host.refreshConfiguration).toHaveBeenCalledOnce();
  view.destroy();
});

test('a manual sync keeps the console visible and disables the sync button while it runs', () => {
  const { host, view, notify } = mount({ phase: 'ready', user: { displayName: 'Parker' } });
  host.state.authorization = { phase: 'loading-profile', user: { displayName: 'Parker' } };
  notify();

  expect((view.element.querySelector('.kore-runtime-view') as HTMLElement).hidden).toBe(false);
  const sync = view.element.querySelector('.kore-config-retry') as HTMLButtonElement;
  expect(sync.disabled).toBe(true);
  expect(sync.textContent).toBe('同步中…');
  view.destroy();
});

test('quota state lists active instances and retries start through Rust command text', () => {
  const { host, view } = mount({ phase: 'quota-exceeded', user: { displayName: 'Parker' },
    detail: { active_instances: [{ instance_id: 'instance-a', char_name: '旧角色', map_name: 'prontera' }] } });

  expect(view.element.textContent).toContain('旧角色');
  expect(view.element.textContent).toContain('prontera');
  const replace = view.element.querySelector('.kore-quota-replace') as HTMLButtonElement;
  expect(replace.disabled).toBe(true);
  (view.element.querySelector('input[name="kore-quota-instance"]') as HTMLInputElement).click();
  expect(replace.disabled).toBe(false);
  replace.click();

  expect(host.sendCommandText).toHaveBeenCalledWith('ai auto kick instance-a');
  view.destroy();
});

test('an authorization error offers a retry alongside re-login and explains boot failures', () => {
  const { host, view } = mount({ phase: 'error', user: { displayName: 'Parker' }, error: 'boot-key-bundle-invalid' });

  expect(view.element.textContent).toContain('核心密钥无效');
  const retry = Array.from(view.element.querySelectorAll('button')).find(button => button.textContent === '重试') as HTMLButtonElement;
  retry.click();
  expect(host.retryAuthorization).toHaveBeenCalledOnce();
  expect(view.element.textContent).toContain('重新登录 LTSD');
  view.destroy();
});

test('a stalled character bind can be retried and the license start keeps the console visible', () => {
  const waiting = mount({ phase: 'waiting-bind', user: { displayName: 'Parker' } });
  Array.from(waiting.view.element.querySelectorAll('button')).find(button => button.textContent === '重试')!.click();
  expect(waiting.host.retryAuthorization).toHaveBeenCalledOnce();
  waiting.view.destroy();

  const starting = mount({ phase: 'starting-license', user: { displayName: 'Parker' } });
  expect((starting.view.element.querySelector('.kore-runtime-view') as HTMLElement).hidden).toBe(false);
  starting.view.destroy();
});

test('an error is explained in plain language with fix steps, the raw code, and a button that copies diagnostics', async () => {
  const writeText = vi.fn(async () => {});
  Object.defineProperty(window.navigator, 'clipboard', { configurable: true, value: { writeText } });
  const { host, view } = mount({ phase: 'error', user: { displayName: 'Parker' }, error: 'boot-bind-unavailable' }, 'runtime-ready');

  expect(view.element.querySelector('.kore-error-title')?.textContent).toBe('连不上 LTSD');
  expect(view.element.querySelectorAll('.kore-error-steps li').length).toBeGreaterThanOrEqual(2);
  expect(view.element.querySelector('.kore-error-code')?.textContent).toBe('boot-bind-unavailable');
  (view.element.querySelector('.kore-auth-copy-error') as HTMLButtonElement).click();
  await Promise.resolve();

  expect(host.getAuthorizationDiagnostics).toHaveBeenCalled();
  expect(writeText).toHaveBeenCalledWith('KoreEngine 诊断信息\n授权阶段: error');
  view.destroy();
});

test('an unknown error code still produces a card with generic steps and the code', () => {
  const { view } = mount({ phase: 'error', user: { displayName: 'Parker' }, error: 'something-new-123' });

  expect(view.element.querySelector('.kore-error-title')?.textContent).toBe('连接未完成');
  expect(view.element.querySelector('.kore-error-code')?.textContent).toBe('something-new-123');
  expect(view.element.querySelectorAll('.kore-error-steps li').length).toBeGreaterThanOrEqual(2);
  view.destroy();
});

test('a stopped worker is reported even when the authorization phase carries no error, with a reload button', () => {
  const reload = vi.fn();
  const { view } = mount({ phase: 'binding-character', user: { displayName: 'Parker' } }, 'failed', 'runtime-not-initialized:heartbeatRequest');
  (window as unknown as { location: { reload: () => void } }).location = { ...window.location, reload } as never;

  expect(view.element.querySelector('.kore-error-title')?.textContent).toBe('KoreEngine 运行环境已停止');
  expect(view.element.querySelector('.kore-error-code')?.textContent).toBe('runtime-not-initialized:heartbeatRequest');
  expect(view.element.querySelector('.kore-auth-reload')).not.toBeNull();
  view.destroy();
});

test('a stalled step explains that nothing answered and offers retry and copy', () => {
  const { host, view } = mount({ phase: 'waiting-bind', user: { displayName: 'Parker' }, stalled: true });

  expect(view.element.querySelector('.kore-error-title')?.textContent).toBe('这一步花的时间比预期长');
  expect(view.element.querySelector('.kore-auth-copy-error')).not.toBeNull();
  Array.from(view.element.querySelectorAll('button')).find(button => button.textContent === '重试')!.click();
  expect(host.retryAuthorization).toHaveBeenCalledOnce();
  view.destroy();
});

test('an error before the core is open is shown on the bind step, not the config step', () => {
  const { view } = mount({ phase: 'error', user: { displayName: 'Parker' }, error: 'boot-key-bundle-invalid' }, 'starting');

  const states = Array.from(view.element.querySelectorAll('[data-state]')).map(node => (node as HTMLElement).dataset.state);
  expect(states.indexOf('current')).toBe(1);
  view.destroy();
});
