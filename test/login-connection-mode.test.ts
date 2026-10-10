// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IndexedDbAccountStore } from '../src/accounts/account-store';
import { buildClientConfig } from '../src/runtime/client-config';
import { getAvailableServerProfile } from '../src/servers/server-profiles';
import { readLoginPreferences, saveLoginPreferences } from '../src/runtime/login-preferences.mjs';
// @ts-expect-error Packaged runtime MJS is exercised below.
import { decorateLastROLoginStyles, decorateLastROLoginTemplate, installLastROLogin, beforeLastROLoginConnect, afterLastROLoginPassword } from '../src/runtime/lastro-account-login.mjs';

afterEach(() => { document.body.replaceChildren(); localStorage.clear(); vi.unstubAllGlobals(); });

function runtimeConfig(id = 'lastro-2x') {
  const source = readFileSync('generated/runtime/Online.js', 'utf8');
  const configRegion = source.slice(source.indexOf('var _global, _server$2, Configs;'), source.indexOf('//#region src/Core/Thread.js'));
  const selectRegion = source.slice(source.indexOf('function selectLoginServerProfile('), source.indexOf('function populateLoginServerButtons('));
  const reloadRegion = source.slice(source.indexOf('function onReload()'), source.indexOf('function onReadyLoginServer('));
  const registration = vi.fn();
  vi.stubGlobal('LastROLoginRegistration', registration);
  const config = buildClientConfig(getAvailableServerProfile(id), { username: '', password: '' });
  const close = vi.fn();
  const context = vm.createContext({
    window: { ROConfig: config, location: globalThis.location },
    __esmMin: (init: () => void) => init,
    Network: { close }, PacketCrypt_default: { reset: vi.fn() },
    SessionStorage_default: {}, PacketVerManager_default: {},
    CodepageManager: { setCharset: vi.fn() }, resolveNetworkCharset: () => 'gbk',
    Renderer: { stop: vi.fn() }, MapRenderer: { free: vi.fn() }, BGM: { play: vi.fn() },
    LoginEngine: { init: (server: unknown) => context.Configs.setServer(server) },
  });
  vm.runInContext(`${configRegion}\ninit_Configs();\nlet _server, _charServers, _loginID, _servers = window.ROConfig.servers, _previous_server;\n${selectRegion}\n${reloadRegion}`, context);
  const configs = vm.runInContext('Configs', context);
  configs.setServer(config.servers[0]);
  return { configs, context, select: vm.runInContext('selectLoginServerProfile', context), close, registration };
}

async function setup(id = 'lastro-2x', onAssistantProfileChange?: (profileId: string) => void | Promise<void>) {
  saveLoginPreferences({ connectionMode: id === 'lastro-app' ? 'direct' : 'relay', serverProfileId: getAvailableServerProfile(id).id });
  const factory = new IDBFactory();
  vi.stubGlobal('indexedDB', factory);
  vi.stubGlobal('LastRODirectSocketsSupported', true);
  const assign = vi.fn();
  vi.stubGlobal('location', { href: 'https://client.invalid/?server=' + id, assign });
  const store = new IndexedDbAccountStore({ indexedDB: factory });
  const accounts = await Promise.all((['lastro-2x', 'lastro-3x', 'lastro-app'] as const).map(serverProfileId => store.save({
    serverProfileId, label: serverProfileId, username: serverProfileId, password: 'fixture-only',
  })));
  const runtime = runtimeConfig(id);
  runtime.configs.set('connectionMode', id === 'lastro-app' ? 'direct' : 'relay');
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = decorateLastROLoginTemplate('WinLogin', '<div id="WinLogin"><input class="user"><input class="pass"><button class="connect"></button></div>');
  document.body.append(host);
  installLastROLogin({ root, component: { onServerSelect: runtime.select }, configs: runtime.configs, onAssistantProfileChange });
  await vi.waitFor(() => expect(root.querySelector('[data-account-id]')).not.toBeNull());
  const server = (id: string) => root.querySelector<HTMLButtonElement>(`[data-server-profile="${id}"]`)!;
  const mode = (value: string) => root.querySelector<HTMLButtonElement>(`[data-connection-mode="${value}"]`)!;
  return { root, store, accounts, assign, server, mode, ...runtime };
}

describe('login connection mode and live server selection', () => {
  it('hides Direct TCP controls in the Web build', () => {
    vi.stubGlobal('LastROWebBuild', true);
    const html = decorateLastROLoginTemplate('WinLogin', '<div id="WinLogin"></div>');
    expect(html).not.toContain('data-connection-mode="direct"');
  });
  it('places connection choices above three servers in one row', async () => {
    const { root } = await setup();
    const panel = root.querySelector('[data-lastro-login-panel]')!;
    expect(Array.from(panel.querySelectorAll('h3')).slice(0, 2).map(h => h.textContent)).toEqual(['连接模式', '服务器']);
    expect(Array.from(root.querySelectorAll('[data-connection-mode]')).map(b => b.textContent)).toEqual(['传统', '直连']);
    expect(root.querySelector('[data-lastro-login-environment]')).toBeNull();
    expect(root.querySelectorAll('[data-lastro-mode-description]')).toHaveLength(1);
    expect(root.querySelector('[data-lastro-mode-description]')!.textContent).toBe('传统：采用与LRO旧版客户端相同的工作模式。');
    const style = document.createElement('style');
    style.textContent = decorateLastROLoginStyles('WinLogin', '');
    document.head.append(style);
    const div = document.createElement('div');
    div.innerHTML = decorateLastROLoginTemplate('WinLogin', '<div id="WinLogin"></div>');
    document.body.append(div);
    try { expect(getComputedStyle(div.querySelector('.lastro-server-list')!).gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))'); }
    finally { style.remove(); }
  });

  it('keeps saved accounts independent of modes while automatically changing servers', async () => {
    const { root, mode, assign, store, accounts, configs, server } = await setup();
    root.querySelector<HTMLElement>('[data-lastro-action="edit"]')!.click();
    const password = root.querySelector<HTMLInputElement>('[data-lastro-account-password]')!;
    await vi.waitFor(() => expect(password.value).toBe('fixture-only'));
    mode('direct').click();
    expect(configs.getServer().id).toBe('lastro-app');
    expect(password.value).toBe('');
    expect(server('lastro-2x').disabled).toBe(true);
    expect(server('lastro-3x').disabled).toBe(true);
    expect(root.querySelector('[data-lastro-mode-description]')!.textContent).toBe('直连：直连游戏服务器，响应更快速。(此被GM暂时关闭仅App服可用）');
    mode('relay').click();
    expect(configs.getServer().id).toBe('lastro-2x');
    await vi.waitFor(() => expect(root.querySelector('[data-account-id]')?.textContent).toContain('lastro-2x'));
    expect(assign).not.toHaveBeenCalled();
    expect(await store.get(accounts[0]!.id)).toMatchObject({ serverProfileId: 'lastro-2x', password: 'fixture-only' });
  });

  it('disables App in relay mode and selects 2x when switching from App', async () => {
    const { mode, server, configs, root, assign } = await setup('lastro-app');
    mode('relay').click();
    expect(server('lastro-app').disabled).toBe(true);
    expect(server('lastro-app').hidden).toBe(false);
    expect(server('lastro-2x').dataset.selected).toBe('true');
    expect(configs.getServer().id).toBe('lastro-2x');
    await vi.waitFor(() => expect(root.querySelector('[data-account-id]')?.textContent).toContain('lastro-2x'));
    server('lastro-app').click();
    expect(configs.getServer().id).toBe('lastro-2x');
    mode('direct').click();
    expect(server('lastro-app').disabled).toBe(false);
    server('lastro-app').click();
    expect(configs.getServer().id).toBe('lastro-app');
    expect(assign).not.toHaveBeenCalled();
  });

  it('switches accounts and all protocol parameters immediately before login', async () => {
    const { root, configs, server, mode, registration, context, assign } = await setup();
    mode('relay').click();
    server('lastro-3x').click();
    expect(configs.getServer()).toMatchObject({ id: 'lastro-3x', address: '103.8.222.164', port: 28569, langtype: 3 });
    expect(configs.get('packetKeys')).toEqual([1205481659, 453061308, 592073252]);
    expect(configs.get('clientVer')).toBe(3);
    expect(configs.get('lastroNid')).toBe(3);
    expect(configs.get('connectionMode')).toBe('relay');
    expect(context.SessionStorage_default.LangType).toBe(3);
    await vi.waitFor(() => expect(root.querySelector('[data-account-id]')?.textContent).toContain('lastro-3x'));
    expect(root.querySelectorAll('[data-account-id]')).toHaveLength(1);
    expect(beforeLastROLoginConnect('fixture-user', 'fixture-only')).toBe(true);
    afterLastROLoginPassword('fixture-user', 'fixture-only');
    expect(registration).toHaveBeenCalledWith('checkin', 3, 'fixture-user', 'fixture-only');
    expect(assign).not.toHaveBeenCalled();
  });

  it('applies a newly downloaded official server entry immediately before login', async () => {
    const { configs, root } = await setup('lastro-2x');
    vi.stubGlobal('LastROResolveServerConnection', (candidate: Record<string, unknown>) => ({
      ...candidate,
      address: '103.8.222.200',
      port: 26599,
      version: 45,
      langtype: 3,
      packetKeys: [1205481642, 453065386, 592073252],
    }));
    expect(configs.getServer().port).toBe(26569);
    expect(beforeLastROLoginConnect('fixture-user', 'fixture-only')).toBe(true);
    expect(configs.getServer()).toMatchObject({
      id: 'lastro-2x', address: '103.8.222.200', port: 26599, langtype: 3,
    });
    expect(root.querySelector('[data-lastro-login-message]')).not.toBeNull();
  });

  it('allows relay login when Direct TCP is unavailable and blocks only direct login', async () => {
    const { root, mode } = await setup();
    vi.stubGlobal('LastRODirectSocketsSupported', false);
    mode('relay').click();
    expect(root.querySelector<HTMLButtonElement>('.connect')!.disabled).toBe(false);
    expect(beforeLastROLoginConnect('fixture-user', 'fixture-only')).toBe(true);
    mode('direct').click();
    expect(root.querySelector<HTMLButtonElement>('.connect')!.disabled).toBe(true);
    expect(beforeLastROLoginConnect('fixture-user', 'fixture-only')).toBe(false);
  });

  it('cannot restore a previous server password after a delayed decrypt', async () => {
    const { root, server } = await setup();
    let complete: (buffer: ArrayBuffer) => void = () => undefined;
    const delayed = new Promise<ArrayBuffer>(resolve => { complete = resolve; });
    const decrypt = vi.spyOn(crypto.subtle, 'decrypt').mockReturnValue(delayed);
    try {
      root.querySelector<HTMLElement>('[data-account-id]')!.click();
      await vi.waitFor(() => expect(decrypt).toHaveBeenCalled());
      server('lastro-3x').click();
      complete(new TextEncoder().encode('fixture-only').buffer);
      await delayed;
      await vi.waitFor(() => expect(root.querySelector('[data-account-id]')?.textContent).toContain('lastro-3x'));
      expect(root.querySelector<HTMLInputElement>('.user')!.value).toBe('');
      expect(root.querySelector<HTMLInputElement>('.pass')!.value).toBe('');
    } finally { decrypt.mockRestore(); }
  });

  it('keeps the selected server when returning to login after a game reload', async () => {
    const { server, configs, context, root } = await setup();
    server('lastro-3x').click();
    await vi.waitFor(() => expect(root.querySelector('[data-account-id]')?.textContent).toContain('lastro-3x'));
    vm.runInContext('onReload()', context);
    expect(configs.getServer().id).toBe('lastro-3x');
    expect(configs.get('packetKeys')).toEqual([1205481659, 453061308, 592073252]);
    expect(server('lastro-3x').dataset.selected).toBe('true');
  });

  it('restores the selected mode and server when bootstrapping a fresh login panel', async () => {
    const { server, mode } = await setup();
    server('lastro-3x').click();
    expect(readLoginPreferences()).toEqual({ connectionMode: 'relay', serverProfileId: 'lastro-3x' });
    mode('direct').click();
    const saved = readLoginPreferences();
    const { configs, select } = runtimeConfig(saved.serverProfileId);
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = decorateLastROLoginTemplate('WinLogin', '<div id="WinLogin"><input class="user"><input class="pass"><button class="connect"></button></div>');
    document.body.append(host);
    installLastROLogin({ root, component: { onServerSelect: select }, configs });
    expect(configs.getServer().id).toBe('lastro-app');
    expect(configs.get('connectionMode')).toBe('direct');
    expect(root.querySelector<HTMLElement>('[data-connection-mode="direct"]')!.dataset.selected).toBe('true');
    expect(root.querySelector<HTMLElement>('[data-server-profile="lastro-app"]')!.dataset.selected).toBe('true');
  });

  it('waits for assistant storage rebinding before changing server without reloading', async () => {
    let finishRebind!: () => void;
    const onAssistantProfileChange = vi.fn(() => new Promise<void>(resolve => { finishRebind = resolve; }));
    const { server, configs, assign } = await setup('lastro-2x', onAssistantProfileChange);

    server('lastro-3x').click();
    await vi.waitFor(() => expect(onAssistantProfileChange).toHaveBeenCalledWith('lastro-3x'));
    expect(configs.getServer().id).toBe('lastro-2x');
    expect(server('lastro-3x').disabled).toBe(true);

    finishRebind();
    await vi.waitFor(() => expect(configs.getServer().id).toBe('lastro-3x'));
    expect(assign).not.toHaveBeenCalled();
  });

  it('keeps the current server selected if assistant profile rebinding fails', async () => {
    const onAssistantProfileChange = vi.fn(async () => { throw new Error('storage unavailable'); });
    const { root, server, configs } = await setup('lastro-2x', onAssistantProfileChange);

    server('lastro-3x').click();
    await vi.waitFor(() => expect(root.querySelector('[data-lastro-login-message]')?.textContent).toContain('助手数据切换失败'));
    expect(configs.getServer().id).toBe('lastro-2x');
    expect(server('lastro-2x').dataset.selected).toBe('true');
    expect(server('lastro-3x').dataset.selected).toBe('false');
  });
});
