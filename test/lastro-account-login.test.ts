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
import { decorateLastROLoginStyles, decorateLastROLoginTemplate, installLastROLogin, beforeLastROLoginConnect, afterLastROLoginPassword, compareLastROVersions, selectLastROUpdate } from '../src/runtime/lastro-account-login.mjs';

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
  const UPDATES = 'https://client.ltsd.ro/updates.json';
  const published = { versions: [
    { version: '0.1.102', src: 'https://client.ltsd.ro/releases/0.1.102/lastro-v2-a.swbn', channels: ['default'] },
    { version: '0.1.91', src: 'https://client.ltsd.ro/releases/0.1.91/lastro-v2-b.swbn', channels: ['default'] },
    { version: '0.1.66', src: 'https://client.ltsd.ro/releases/0.1.66/lastro-v2-c.swbn', channels: ['default'] },
  ], channels: { default: { name: 'Stable' } } };
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
    return { host, root, box, fetchMock, badge: box.querySelector<HTMLElement>('[data-lastro-version-badge]')!,
      detail: box.querySelector<HTMLElement>('[data-lastro-update-detail]')! };
  }
  afterEach(() => { document.body.innerHTML = ''; vi.unstubAllGlobals(); });

  it('compares dotted versions numerically', () => {
    expect(compareLastROVersions('0.1.102', '0.1.91')).toBeGreaterThan(0);
    expect(compareLastROVersions('0.1.66', '0.1.66')).toBe(0);
    expect(compareLastROVersions('0.2', '0.1.99')).toBeGreaterThan(0);
  });

  it('selects the newest default-channel https package from the project host only', () => {
    expect(selectLastROUpdate(published)).toEqual({ version: '0.1.102', src: published.versions[0]!.src });
    const hostile = { versions: [
      { version: '9.9.9', src: 'https://evil.example/x.swbn', channels: ['default'] },
      { version: '9.9.8', src: 'http://client.ltsd.ro/x.swbn', channels: ['default'] },
      { version: '9.9.7', src: 'https://client.ltsd.ro/x.swbn', channels: ['beta'] },
      { version: 'v9', src: 'https://client.ltsd.ro/x.swbn', channels: ['default'] },
      { version: '0.1.5', src: 'https://client.ltsd.ro/ok.swbn', channels: ['default'] },
    ] };
    expect(selectLastROUpdate(hostile)).toEqual({ version: '0.1.5', src: 'https://client.ltsd.ro/ok.swbn' });
    expect(selectLastROUpdate({})).toBeNull(); expect(selectLastROUpdate(null)).toBeNull();
  });

  it('shows the installed version and a prominent, expandable notice when a newer package is published', async () => {
    const { box, badge, detail, root, fetchMock } = mount('0.1.91');
    await vi.waitFor(() => expect(box.dataset.update).toBe('available'));
    expect(box.hidden).toBe(false);
    expect(badge.textContent).toBe('v0.1.91 · 发现新版本 v0.1.102');
    expect(fetchMock).toHaveBeenCalledWith(UPDATES, expect.objectContaining({ credentials: 'omit' }));
    const download = root.querySelector<HTMLAnchorElement>('[data-lastro-update-download]')!;
    expect(download.href).toBe(published.versions[0]!.src); expect(download.rel).toContain('noopener');
    expect(detail.hidden).toBe(true); badge.click(); expect(detail.hidden).toBe(false);
    expect(detail.textContent).toContain('chrome://iwa-dev'); badge.click(); expect(detail.hidden).toBe(true);
  });

  it('copies the install page address because web content cannot open chrome:// pages', async () => {
    const writeText = vi.fn(async () => undefined);
    const { box, badge, root } = mount('0.1.66');
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    await vi.waitFor(() => expect(box.dataset.update).toBe('available'));
    badge.click();
    const copy = root.querySelector<HTMLButtonElement>('[data-lastro-action="copy-install-page"]')!;
    copy.click();
    await vi.waitFor(() => expect(copy.textContent).toBe('已复制，请粘贴到地址栏'));
    expect(writeText).toHaveBeenCalledExactlyOnceWith('chrome://iwa-dev');
  });

  it('shows only the version when the installed package is current', async () => {
    const { box, badge, fetchMock } = mount('0.1.102');
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith(UPDATES, expect.anything()));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(badge.textContent).toBe('v0.1.102'); expect(box.dataset.update).toBeUndefined();
  });

  it('does not report an update for the unreleased placeholder version', async () => {
    const { box, badge, fetchMock } = mount('0.1.0');
    await vi.waitFor(() => expect(box.hidden).toBe(false));
    expect(badge.textContent).toBe('v0.1.0'); expect(fetchMock).not.toHaveBeenCalledWith(UPDATES, expect.anything());
  });

  it('keeps the version visible and stays quiet when the update list cannot be read', async () => {
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
});
