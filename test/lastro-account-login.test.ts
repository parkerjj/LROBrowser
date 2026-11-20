// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { IDBFactory } from 'fake-indexeddb';
import { IndexedDbAccountStore } from '../src/accounts/account-store';
import { buildClientConfig } from '../src/runtime/client-config';
import { buildLastROLoginRequest } from '../src/network/lastro-login-http';
import { getAvailableServerProfile } from '../src/servers/server-profiles';

// The runtime module is deliberately shipped as an executable MJS asset.
// @ts-expect-error Runtime MJS is validated by the Vite bundle and this focused test.
import { decorateLastROLoginStyles, decorateLastROLoginTemplate, installLastROLogin, beforeLastROLoginConnect, afterLastROLoginPassword } from '../src/runtime/lastro-account-login.mjs';

describe('LastRO native login integration', () => {
  async function savedLogin() {
    const factory = new IDBFactory();
    vi.stubGlobal('indexedDB', factory);
    vi.stubGlobal('LastRODirectSocketsSupported', true);
    const store = new IndexedDbAccountStore({ indexedDB: factory });
    const saved = await store.save({ serverProfileId: 'lastro-2x', label: 'Fixture', username: 'fixture-user', password: 'fixture-only' });
    const config = buildClientConfig(getAvailableServerProfile('lastro-2x'), { username: '', password: '' });
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = decorateLastROLoginTemplate('WinLogin', '<div id="WinLogin"><input class="user"><input class="pass"><button class="connect"></button></div>');
    document.body.append(host);
    const component: { onRemove?: () => void; onAppend?: () => void } = {};
    installLastROLogin({ root, component, configs: { get: (key: keyof typeof config) => config[key], getServer: () => config.servers[0] } });
    await vi.waitFor(() => expect(root.querySelector('[data-account-id]')).not.toBeNull());
    return { host, root, component, store, saved };
  }
  it('replaces the private quick-login panel with the native account panel', () => {
    const html = '<div class="login"><div class="quick-login-panel">private data</div><input class="user" /></div>';
    const decorated = decorateLastROLoginTemplate('WinLogin', html);
    expect(decorated).not.toContain('quick-login-panel');
    expect(decorated).toContain('data-lastro-login-panel');
    expect(decorated).toContain('data-lastro-server-list');
    expect(decorated).toContain('data-lastro-account-password');
    expect(decorated).toContain('<img src="/icons/icon-64.png"');
    expect(decorated).toContain('class="lastro-login-brand"');
  });

  it('leaves unrelated V2 windows unchanged', () => {
    const html = '<div class="window"></div>';
    const css = '.window { color: black; }';
    expect(decorateLastROLoginTemplate('WinInventory', html)).toBe(html);
    expect(decorateLastROLoginStyles('WinInventory', css)).toBe(css);
  });

  it('keeps account editor inputs in normal flow alongside the legacy native form', () => {
    const source = readFileSync('generated/runtime/Online.js', 'utf8');
    const css = vm.runInNewContext(source.match(/WinLogin_default\$1 =\s*((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'));/s)![1]!);
    const style = document.createElement('style');
    style.textContent = decorateLastROLoginStyles('WinLogin', css);
    const root = document.createElement('div');
    root.innerHTML = decorateLastROLoginTemplate('WinLogin', '<div id="WinLogin"><input class="user"><input class="pass"><button class="connect"></button></div>');
    document.head.append(style);
    document.body.append(root);
    try {
      expect(getComputedStyle(root.querySelector('.user')!).position).toBe('absolute');
      expect(getComputedStyle(root.querySelector('[data-lastro-account-username]')!).position).toBe('static');
      expect(root.querySelector('[data-lastro-login-panel]')?.parentElement?.id).toBe('WinLogin');
    } finally { root.remove(); style.remove(); }
  });



  it('builds the LastRO login registration request with the nid-specific form fields', () => {
    const request = buildLastROLoginRequest('checkin', 5, 'testbot1', '123123');
    expect(request.path).toBe('/?r=mg/checkin&nid=5');
    expect(request.body).toBe('Login_debug%5Buserid%5D=testbot1&Login_debug%5Buser_pass%5D=123123');
  });

  it('sends login checks without observing the response and keeps check disabled by default', async () => {
    const calls: Array<{ phase: string; username: string; password: string }> = [];
    const config = buildClientConfig(getAvailableServerProfile('lastro-2x'), { username: '', password: '' });
    expect(config.lastroLoginCheck).toBe(false);
    expect(config.lastroLoginCheckin).toBe(true);
    const html = '<div id="WinLogin"><input class="user"><input class="pass"><button class="connect"></button></div>';
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = decorateLastROLoginTemplate('WinLogin', html);
    document.body.append(host);
    vi.stubGlobal('LastRODirectSocketsSupported', true);
    vi.stubGlobal('LastROLoginRegistration', (phase: string, _nid: number, username: string, password: string) => {
      calls.push({ phase, username, password });
    });
    try {
      installLastROLogin({ root, component: {}, configs: {
        get: (key: keyof typeof config) => config[key], getServer: () => config.servers[0],
      } });
      const before = beforeLastROLoginConnect;
      const after = afterLastROLoginPassword;
      expect(before('testbot1', '123123')).toBe(true);
      expect(calls).toEqual([]);
      after('testbot1', '123123');
      expect(calls).toEqual([{ phase: 'checkin', username: 'testbot1', password: '123123' }]);
    } finally {
      host.remove();
      Reflect.deleteProperty(globalThis, 'LastROLoginBeforeConnect');
      Reflect.deleteProperty(globalThis, 'LastROLoginAfterPassword');
      vi.unstubAllGlobals();
    }
  });

  it('sends the optional check before checkin when explicitly enabled', () => {
    const calls: string[] = [];
    vi.stubGlobal('LastRODirectSocketsSupported', true);
    vi.stubGlobal('LastROLoginRegistration', (phase: string) => { calls.push(phase); });
    const base = buildClientConfig(getAvailableServerProfile('lastro-2x'), { username: '', password: '' });
    const config = { ...base, lastroLoginCheck: true };
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = decorateLastROLoginTemplate('WinLogin', '<div id="WinLogin"><input class="user"><input class="pass"></div>');
    document.body.append(host);
    try {
      installLastROLogin({ root, component: {}, configs: {
        get: (key: keyof typeof config) => config[key], getServer: () => config.servers[0],
      } });
      const before = beforeLastROLoginConnect;
      const after = afterLastROLoginPassword;
      expect(before('testbot1', '123123')).toBe(true);
      after('testbot1', '123123');
      expect(calls).toEqual(['check', 'checkin']);
    } finally {
      host.remove();
      Reflect.deleteProperty(globalThis, 'LastROLoginBeforeConnect');
      Reflect.deleteProperty(globalThis, 'LastROLoginAfterPassword');
      vi.unstubAllGlobals();
    }
  });

  it('fills the original login fields from this IWA IndexedDB without submitting a login', async () => {
    const factory = new IDBFactory();
    vi.stubGlobal('indexedDB', factory);
    vi.stubGlobal('LastRODirectSocketsSupported', true);
    const store = new IndexedDbAccountStore({ indexedDB: factory });
    await store.save({ serverProfileId: 'lastro-2x', label: 'Fixture', username: 'fixture-user', password: 'fixture-only' });
    const config = buildClientConfig(getAvailableServerProfile('lastro-2x'), { username: '', password: '' });
    const source = readFileSync('generated/runtime/Online.js', 'utf8');
    const html = vm.runInNewContext(source.match(/WinLogin_default\$2 =\s*((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'));/s)![1]!);
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = decorateLastROLoginTemplate('WinLogin', html);
    document.body.append(host);
    const connect = vi.fn();
    root.querySelector('.connect')!.addEventListener('click', connect);
    try {
      installLastROLogin({ root, component: {}, configs: {
        get: (key: keyof typeof config) => config[key], getServer: () => config.servers[0],
      } });
      await vi.waitFor(() => expect(root.querySelector('[data-account-id]')).not.toBeNull());
      (root.querySelector('[data-account-id]') as HTMLButtonElement).click();
      expect((root.querySelector('.user') as HTMLInputElement).value).toBe('fixture-user');
      await vi.waitFor(() => expect((root.querySelector('.pass') as HTMLInputElement).value).toBe('fixture-only'));
      expect(connect).not.toHaveBeenCalled();
      expect(root.querySelector('.quick-login-panel')).toBeNull();
      host.remove();
      expect(document.querySelector('[data-lastro-login-panel]')).toBeNull();
    } finally {
      host.remove();
      Reflect.deleteProperty(globalThis, 'LastROLoginBeforeConnect');
      Reflect.deleteProperty(globalThis, 'LastROLoginAfterPassword');
      vi.unstubAllGlobals();
    }
  });

  it('keeps credential hooks module-private and clears both password fields when login consumes them', async () => {
    const { host, root } = await savedLogin();
    try {
      const native = root.querySelector<HTMLInputElement>('.pass')!;
      const editor = root.querySelector<HTMLInputElement>('[data-lastro-account-password]')!;
      native.value = editor.value = 'fixture-only';
      expect(Reflect.get(globalThis, 'LastROLoginBeforeConnect')).toBeUndefined();
      expect(Reflect.get(globalThis, 'LastROLoginAfterPassword')).toBeUndefined();
      expect(beforeLastROLoginConnect('fixture-user', 'fixture-only')).toBe(true);
      expect(native.value).toBe('');
      expect(editor.value).toBe('');
      expect(beforeLastROLoginConnect('fixture-user', 'fixture\u0000bad')).toBe(false);
    } finally { host.remove(); vi.unstubAllGlobals(); }
  });

  it('clears a hidden login window and reloads summaries when it is shown again', async () => {
    const { host, root, component } = await savedLogin();
    try {
      root.querySelector<HTMLElement>('[data-account-id]')!.click();
      await vi.waitFor(() => expect(root.querySelector<HTMLInputElement>('.pass')!.value).toBe('fixture-only'));
      component.onRemove?.();
      expect(root.querySelector<HTMLInputElement>('.pass')!.value).toBe('');
      expect(root.querySelector('[data-account-id]')).toBeNull();
      expect(beforeLastROLoginConnect('fixture-user', 'fixture-only')).toBe(false);
      component.onAppend?.();
      await vi.waitFor(() => expect(root.querySelector('[data-account-id]')).not.toBeNull());
      expect(root.querySelector<HTMLInputElement>('.pass')!.value).toBe('');
    } finally { host.remove(); vi.unstubAllGlobals(); }
  });

  it('removes the editor password when cancelled without removing the saved account', async () => {
    const { host, root, store, saved } = await savedLogin();
    try {
      root.querySelector<HTMLElement>('[data-lastro-action="edit"]')!.click();
      const editor = root.querySelector<HTMLInputElement>('[data-lastro-account-password]')!;
      await vi.waitFor(() => expect(editor.value).toBe('fixture-only'));
      root.querySelector<HTMLElement>('[data-lastro-action="cancel"]')!.click();
      expect(editor.value).toBe('');
      expect(await store.get(saved.id)).toMatchObject({ password: 'fixture-only' });
    } finally { host.remove(); vi.unstubAllGlobals(); }
  });

  it('does not refill a password after a delayed decrypt finishes following a user edit', async () => {
    const { host, root } = await savedLogin();
    let complete: (buffer: ArrayBuffer) => void = () => undefined;
    const delayed = new Promise<ArrayBuffer>(resolve => { complete = resolve; });
    const decrypt = vi.spyOn(crypto.subtle, 'decrypt').mockReturnValue(delayed);
    try {
      root.querySelector<HTMLElement>('[data-account-id]')!.click();
      await vi.waitFor(() => expect(decrypt).toHaveBeenCalled());
      const native = root.querySelector<HTMLInputElement>('.pass')!;
      native.value = 'new-user-input';
      native.dispatchEvent(new Event('input', { bubbles: true }));
      complete(new TextEncoder().encode('fixture-only').buffer);
      await delayed;
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(native.value).toBe('new-user-input');
    } finally { decrypt.mockRestore(); host.remove(); vi.unstubAllGlobals(); }
  });
});

describe('LastRO login version badge', () => {
  const UPDATES = 'https://client.ltsd.ro/native/latest.json';
  const windows = 'https://client.ltsd.ro/native/1.2.1/LRO-Client-1.2.1-windows-x64-setup.exe';
  const mac = 'https://client.ltsd.ro/native/1.2.1/LRO-Client-1.2.1-macos-universal.dmg';
  const macUpdater = 'https://client.ltsd.ro/native/1.2.1/LRO-Client-1.2.1-macos-universal.app.tar.gz';
  const installer = (url: string) => ({ url, sha256: 'a'.repeat(64), size: 4000 });
  const signed = (url: string) => ({ ...installer(url), signature: 'c2lnbmF0dXJl' });
  const legacy = {
    version: '1.2.1', notes: 'LRO进阶客户端 1.2.1', pub_date: '2026-11-19T21:13:13.000Z',
    platforms: {
      'windows-x86_64': signed(windows),
      'darwin-aarch64': signed(macUpdater),
      'darwin-x86_64': signed(macUpdater),
    },
  };
  const published = { ...legacy, installers: { 'windows-x86_64': installer(windows), 'darwin-universal': installer(mac) } };
  const reply = (body: unknown) => ({ ok: true, json: async () => body });
  function mount(installed: string | null, updates: () => Promise<unknown> = async () => reply(published)) {
    vi.stubGlobal('indexedDB', new IDBFactory());
    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/.well-known/manifest.webmanifest') return installed === null ? { ok: false, json: async () => ({}) } : reply({ version: installed });
      if (url === UPDATES) return updates();
      throw new Error('unexpected fetch ' + url);
    });
    vi.stubGlobal('fetch', fetchMock);
    const config = buildClientConfig(getAvailableServerProfile('lastro-2x'), { username: '', password: '' });
    const host = document.createElement('div'), root = host.attachShadow({ mode: 'open' });
    root.innerHTML = decorateLastROLoginTemplate('WinLogin', '<div id="WinLogin"><input class="user"><input class="pass"><button class="connect"></button></div>');
    document.body.append(host);
    installLastROLogin({ root, component: {}, configs: { get: (key: keyof typeof config) => config[key], getServer: () => config.servers[0] } });
    const box = root.querySelector<HTMLElement>('[data-lastro-version]')!;
    return { host, root, box, fetchMock, badge: box.querySelector<HTMLButtonElement>('[data-lastro-version-badge]')!,
      detail: box.querySelector<HTMLElement>('[data-lastro-update-detail]')! };
  }
  afterEach(() => { document.body.innerHTML = ''; vi.unstubAllGlobals(); });

  it.each(['1.200.261119', '1.2.1'])('offers both Native installers when the installed IWA version is %s', async (current) => {
    const { box, badge, detail, fetchMock } = mount(current);
    await vi.waitFor(() => expect(box.dataset.update).toBe('available'));
    expect(box.hidden).toBe(false);
    expect(badge.textContent).toContain(`v${current}`);
    expect(badge.textContent).toContain('原生客户端 v1.2.1');
    expect(fetchMock).toHaveBeenCalledWith(UPDATES, expect.objectContaining({ credentials: 'omit' }));
    expect(badge.getAttribute('aria-expanded')).toBe('false');
    expect(detail.hidden).toBe(true);
    badge.click();
    expect(badge.getAttribute('aria-expanded')).toBe('true');
    expect(detail.hidden).toBe(false);
    expect(detail.textContent).toContain('v1.2.1');
    expect(detail.textContent).toContain('使用原有游戏账号登录');
    expect(detail.textContent).not.toContain('chrome://iwa-dev');
    const links = [...detail.querySelectorAll<HTMLAnchorElement>('a[href]')];
    expect(links.map(link => link.href)).toEqual([windows, mac]);
    expect(links[0]?.textContent).toContain('.exe');
    expect(links[1]?.textContent).toContain('.dmg');
    expect(links.every(link => link.rel.includes('noopener'))).toBe(true);
    badge.click();
    expect(detail.hidden).toBe(true);
  });

  it('uses the legacy release feed to offer a DMG and the Windows setup executable', async () => {
    const { box, detail } = mount('1.200.261119', async () => reply(legacy));
    await vi.waitFor(() => expect(box.dataset.update).toBe('available'));
    expect([...detail.querySelectorAll<HTMLAnchorElement>('a[href]')].map(link => link.href)).toEqual([windows, mac]);
  });

  it('reads the installer feed through the IWA release transport when it is available', async () => {
    vi.stubGlobal('LastROFetchNativeUpdateManifest', async () => reply(legacy));
    const { box, detail, fetchMock } = mount('1.200.261119', async () => { throw new TypeError('CORS'); });
    await vi.waitFor(() => expect(box.dataset.update).toBe('available'));
    expect([...detail.querySelectorAll<HTMLAnchorElement>('a[href]')].map(link => link.href)).toEqual([windows, mac]);
    expect(fetchMock).not.toHaveBeenCalledWith(UPDATES, expect.anything());
  });

  it.each([
    { ...installer(macUpdater) },
    { ...installer(mac.replace('client.ltsd.ro', 'client.ltsd.ro.example')) },
    { ...installer(mac.replace('/1.2.1/', '/1.2.2/')) },
    { ...installer(`${mac}?download=1`) },
    { ...installer(mac.replace('client.ltsd.ro', 'client.ltsd.ro:8443')) },
    { ...installer(mac), sha256: 'invalid' },
    { ...installer(mac), size: 0 },
  ])('excludes invalid explicit macOS installers without using the legacy fallback (%j)', async (descriptor) => {
    const manifest = { ...published, installers: { ...published.installers, 'darwin-universal': descriptor } };
    const { box, detail } = mount('1.200.261119', async () => reply(manifest));
    await vi.waitFor(() => expect(box.dataset.update).toBe('available'));
    expect([...detail.querySelectorAll<HTMLAnchorElement>('a[href]')].map(link => link.href)).toEqual([windows]);
  });

  it('does not derive a DMG from an invalid legacy Mac updater descriptor', async () => {
    const manifest = {
      ...legacy,
      platforms: {
        'windows-x86_64': legacy.platforms['windows-x86_64'],
        'darwin-aarch64': signed(macUpdater.replace('/1.2.1/', '/1.2.2/')),
        'darwin-x86_64': { ...signed(macUpdater), signature: '' },
      },
    };
    const { box, detail } = mount('1.200.261119', async () => reply(manifest));
    await vi.waitFor(() => expect(box.dataset.update).toBe('available'));
    expect([...detail.querySelectorAll<HTMLAnchorElement>('a[href]')].map(link => link.href)).toEqual([windows]);
  });

  it('does not report an update for the unreleased placeholder version', async () => {
    const { box, badge, fetchMock } = mount('0.1.0');
    await vi.waitFor(() => expect(box.hidden).toBe(false));
    expect(badge.textContent).toBe('v0.1.0'); expect(fetchMock).not.toHaveBeenCalledWith(UPDATES, expect.anything());
  });

  it('keeps the version visible without installer links when the release feed cannot be read', async () => {
    const { box, badge, fetchMock } = mount('0.1.91', async () => { throw new TypeError('Failed to fetch'); });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith(UPDATES, expect.anything()));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(box.hidden).toBe(false); expect(badge.textContent).toBe('v0.1.91'); expect(box.dataset.update).toBeUndefined();
  });

  it('stays hidden when the installed version is unknown or in the web build', async () => {
    const unknown = mount(null);
    await vi.waitFor(() => expect(unknown.fetchMock).toHaveBeenCalled());
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(unknown.box.hidden).toBe(true);
    vi.stubGlobal('LastROWebBuild', true);
    const web = mount('0.1.91');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(web.box.hidden).toBe(true); expect(web.fetchMock).not.toHaveBeenCalled();
  });

  it('uses the Native app version and checks for updates through Tauri on demand', async () => {
    vi.stubGlobal('LastRONativeBuild', true);
    let complete: (result: string) => void = () => undefined;
    const pending = new Promise<string>(resolve => { complete = resolve; });
    const invoke = vi.fn((command: string) => {
      if (command === 'native_update_version') return Promise.resolve('1.12.261119');
      if (command === 'native_check_update') return pending;
      throw new Error(`Unexpected Native command ${command}`);
    });
    vi.stubGlobal('__TAURI__', { core: { invoke } });
    const { box, badge, detail, fetchMock, root } = mount('0.1.0');
    await vi.waitFor(() => expect(badge.textContent).toBe('v1.12.261119'));
    expect(box.hidden).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(invoke).toHaveBeenCalledTimes(1);
    const check = root.querySelector<HTMLButtonElement>('[data-lastro-action="check-native-update"]')!;
    expect(check.textContent).toBe('检查客户端更新');
    expect(check.hidden).toBe(false);
    check.click();
    check.click();
    expect(check.disabled).toBe(true);
    expect(detail.hidden).toBe(false);
    expect(detail.textContent).toContain('正在检查');
    expect(invoke).toHaveBeenCalledTimes(2);
    complete('up-to-date');
    await vi.waitFor(() => expect(detail.textContent).toContain('已是最新版本'));
    expect(check.disabled).toBe(false);
  });

  it.each([
    { result: 'update-offered', message: '请查看更新提示' },
    { result: 'busy', message: '正在检查或安装更新' },
    { result: null, message: '服务器暂时不可用' },
  ])('shows the updater outcome and re-enables the action ($message)', async ({ result, message }) => {
    vi.stubGlobal('LastRONativeBuild', true);
    vi.stubGlobal('__TAURI__', { core: { invoke: async (command: string) => {
      if (command === 'native_update_version') return '1.2.1';
      if (command === 'native_check_update' && result !== null) return result;
      throw '服务器暂时不可用';
    } } });
    const { badge, detail, root } = mount('0.1.0');
    await vi.waitFor(() => expect(badge.textContent).toBe('v1.2.1'));
    const check = root.querySelector<HTMLButtonElement>('[data-lastro-action="check-native-update"]')!;
    check.click();
    await vi.waitFor(() => expect(detail.textContent).toContain(message));
    expect(check.disabled).toBe(false);
  });
});
