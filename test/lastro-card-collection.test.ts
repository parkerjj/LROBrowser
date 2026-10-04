// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { patchRuntimeCardCollection } from '../scripts/lastro-card-collection.mjs';

const paths = ['src/UI/Components/CardConnection/CardConnection2', 'src/Engine/MapEngine.js',
  'src/Network/NetworkManager.js', 'src/Engine/MapEngine/Main.js'];
const native = readFileSync('vendor/v2/Online.js', 'utf8');
const patched = patchRuntimeCardCollection(native);
function region(source: string, path: string) {
  const marker = '//#region ' + path;
  const start = source.indexOf(marker), end = source.indexOf('//#endregion', start);
  if (start < 0 || end < start) throw new Error('Missing integration fixture region: ' + path);
  return { start, end: end + '//#endregion'.length, text: source.slice(start, end) };
}
function parse(source: string) {
  return ts.createSourceFile('card-integration.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
}
function nodes<T extends ts.Node>(file: ts.SourceFile, predicate: (node: ts.Node) => node is T) {
  const result: T[] = [];
  function visit(node: ts.Node) { if (predicate(node)) result.push(node); ts.forEachChild(node, visit); }
  visit(file); return result;
}
const cardFile = parse(region(patched, paths[0]!).text);
const mapFile = parse(region(patched, paths[1]!).text);
const networkFile = parse(region(patched, paths[2]!).text);
const mainFile = parse(region(patched, paths[3]!).text);
function declaration(file: ts.SourceFile, name: string) {
  const values = nodes(file, (node): node is ts.FunctionDeclaration => ts.isFunctionDeclaration(node) && node.name?.text === name);
  if (values.length !== 1) throw new Error('Changed native integration function: ' + name);
  return values[0]!;
}
function skeleton(source: string) {
  for (const path of paths) {
    const part = region(source, path);
    source = source.slice(0, part.start) + 'TARGET:' + path + source.slice(part.end);
  }
  return source;
}
const mini = `// untouched prefix
//#region src/UI/Components/CardConnection/CardConnection2
var CardConnection2, CardConnection2_default;
var init_CardConnection2 = __esmMin(() => {
  CardConnection2 = createCardCollectionComponent({ DB, Client });
  CardConnection2_default = UIManager.addComponent(CardConnection2);
});
//#endregion
//#region src/Engine/MapEngine.js
function onMapChange(pkt) { nativeEvents.push(pkt); }
function cleanGameUI() { nativeEvents.push('clean'); }
//#endregion
//#region src/Network/NetworkManager.js
function onClose$9(event) { nativeEvents.push(event); }
//#endregion
//#region src/Engine/MapEngine/Main.js
function onPlayerMessage(pkt) { nativeEvents.push(pkt.msg); }
//#endregion
// untouched suffix
`;
function installer(call: ts.CallExpression) {
  const expression = call.expression;
  return ts.isParenthesizedExpression(expression) && ts.isFunctionExpression(expression.expression)
    ? expression.expression.name?.text : undefined;
}
const installerCalls = nodes(cardFile, ts.isCallExpression).filter(call => installer(call)?.startsWith('installLastroCard'));
function dependency(name: string, property: string) {
  const call = installerCalls.find(value => installer(value) === name);
  const options = call?.arguments[1];
  if (!options || !ts.isObjectLiteralExpression(options)) throw new Error('Missing serialized card dependency object');
  const entry = options.properties.find(value => ts.isPropertyAssignment(value) && value.name.getText(cardFile) === property);
  if (!entry || !ts.isPropertyAssignment(entry)) throw new Error('Missing serialized card dependency: ' + property);
  return entry.initializer.getText(cardFile);
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

describe('card collection runtime integration boundaries', () => {
  it('limits the real bundled changes to the card component, teardown and one native server message callback', () => {
    expect(skeleton(patched)).toBe(skeleton(native));
    expect([...native.matchAll(/^\/\/#region /gm)].length).toBeGreaterThan(700);
    expect([...patched.matchAll(/^\/\/#region /gm)].length).toBe([...native.matchAll(/^\/\/#region /gm)].length);
    for (const file of [cardFile, mapFile, networkFile, mainFile]) {
      expect((file as ts.SourceFile & { parseDiagnostics: ts.Diagnostic[] }).parseDiagnostics).toEqual([]);
    }
    expect(installerCalls.map(installer)).toEqual([
      'installLastroCardState', 'installLastroCardDeck', 'installLastroCardDeckUI', 'installLastroCardArt',
    ]);
    expect(region(patched, paths[0]!).text).toContain('init_SessionStorage(); init_Preferences$1(); init_KeyEventHandler();');
    expect(dependency('installLastroCardArt', 'getItemInfo')).toContain('init_ItemInfo(); return ItemInfo_default;');
  });

  it('resolves every injected initializer against the actual native runtime', () => {
    const initializers = new Set([...native.matchAll(/\b(init_[\w$]+)\s*=\s*__esmMin\s*\(/g)].map(match => match[1]));
    const calls = nodes(cardFile, ts.isCallExpression).filter(call => ts.isIdentifier(call.expression)
      && call.expression.text.startsWith('init_'));
    for (const call of calls) expect(initializers.has(call.expression.getText(cardFile))).toBe(true);
    let inventory = { list: [{ ITID: 4000, type: 6, count: 1 }] };
    const getUI = vi.fn(() => inventory);
    const context = vm.createContext({ InventoryController: { getUI } });
    const read = vm.runInContext('(' + dependency('installLastroCardState', 'getInventory') + ')', context) as () => typeof inventory;
    expect(read()).toBe(inventory);
    inventory = { list: [] };
    expect(read()).toBe(inventory);
    expect(getUI).toHaveBeenCalledTimes(2);
  });

  it.each(['\n', '\r\n'])('preserves %j in a small complete fixture with valid serialized installer syntax', newline => {
    const source = mini.replace(/\n/g, newline);
    const result = patchRuntimeCardCollection(source);
    expect(skeleton(result)).toBe(skeleton(source));
    if (newline === '\r\n') expect(result).not.toMatch(/(?<!\r)\n/);
    else expect(result).not.toContain('\r');
    const file = parse(result);
    expect((file as ts.SourceFile & { parseDiagnostics: ts.Diagnostic[] }).parseDiagnostics).toEqual([]);
  });

  it('does nothing when none of the target regions exists, and rejects applying twice', () => {
    const unrelated = '//#region src/UI/Components/Unrelated.js\nfunction noop() {}\n//#endregion\n';
    expect(patchRuntimeCardCollection(unrelated)).toBe(unrelated);
    expect(patchRuntimeCardCollection('')).toBe('');
    expect(() => patchRuntimeCardCollection(patchRuntimeCardCollection(mini))).toThrow('anchor:card-collection:already-patched');
  });

  it.each(paths)('rejects missing, truncated and duplicated region anchors for %s', path => {
    const part = region(mini, path);
    const missing = mini.slice(0, part.start) + mini.slice(part.end);
    expect(() => patchRuntimeCardCollection(missing)).toThrow(/anchor:card-collection:/);
    const truncated = mini.slice(0, part.end - '//#endregion'.length) + mini.slice(part.end);
    expect(() => patchRuntimeCardCollection(truncated)).toThrow(/anchor:card-collection:/);
    expect(() => patchRuntimeCardCollection(mini + '\n' + mini.slice(part.start, part.end))).toThrow(/anchor:card-collection:/);
  });

  it.each(['onMapChange', 'cleanGameUI', 'onClose$9', 'onPlayerMessage'])('rejects missing and ambiguous %s function anchors', name => {
    const missing = mini.replace('function ' + name + '(', 'function changed' + name + '(');
    expect(() => patchRuntimeCardCollection(missing)).toThrow(/anchor:card-collection:/);
    const target = name === 'onClose$9' ? paths[2]! : name === 'onPlayerMessage' ? paths[3]! : paths[1]!;
    const part = region(mini, target);
    const duplicate = mini.slice(0, part.end - '//#endregion'.length) + `function ${name}() {}\n`
      + mini.slice(part.end - '//#endregion'.length);
    expect(() => patchRuntimeCardCollection(duplicate)).toThrow(/anchor:card-collection:/);
  });

  it('rejects missing or ambiguous component assignments and a region label that merely shares the prefix', () => {
    const missing = mini.replace('CardConnection2 = createCardCollectionComponent', 'Changed = createCardCollectionComponent');
    expect(() => patchRuntimeCardCollection(missing)).toThrow(/anchor:card-collection:/);
    const duplicate = mini.replace('CardConnection2_default =', 'CardConnection2 = createCardCollectionComponent({});\n  CardConnection2_default =');
    expect(() => patchRuntimeCardCollection(duplicate)).toThrow(/anchor:card-collection:/);
    const wrongPath = mini.replace('//#region ' + paths[0], '//#region ' + paths[0] + '-copy');
    expect(() => patchRuntimeCardCollection(wrongPath)).toThrow(/anchor:card-collection:/);
  });

  it.each(paths)('rejects mixed and bare CR line endings within %s', path => {
    const source = mini.replace(/\n/g, '\r\n');
    const part = region(source, path);
    const offset = source.indexOf('\r\n', part.start);
    const mixed = source.slice(0, offset) + '\n' + source.slice(offset + 2);
    expect(() => patchRuntimeCardCollection(mixed)).toThrow('anchor:card-collection:newlines');
    const bare = source.slice(0, offset) + '\r' + source.slice(offset + 2);
    expect(() => patchRuntimeCardCollection(bare)).toThrow(/anchor:card-collection:/);
  });
});

describe('card preset teardown and character isolation in emitted native code', () => {
  it('passes raw native self/server messages to the card controller while preserving original chat, room and entity display', () => {
    const notice = declaration(mainFile, 'onPlayerMessage');
    const onServerNotice = vi.fn(), addText = vi.fn(), roomMessage = vi.fn(), dialog = vi.fn();
    const ChatRoom = { isOpen: false, message: roomMessage };
    const context = vm.createContext({
      CardConnection2: { _lastroCardDeck: { onServerNotice } },
      ChatRoom_default: ChatRoom,
      ChatBox_default: { addText, TYPE: { PUBLIC: 1, SELF: 2 }, FILTER: { PUBLIC_CHAT: 4 } },
      SessionStorage_default: { Entity: { dialog: { set: dialog } } },
      DB: { getItemNameFromLink: () => '原生物品' },
    });
    vm.runInContext(notice.getText(mainFile) + '\nvar receive = onPlayerMessage;', context);
    const receive = context.receive as (packet: { msg: string }) => void;
    const refusal = '卡组中已有1张头饰类卡片'; receive({ msg: refusal });
    expect(onServerNotice).toHaveBeenCalledExactlyOnceWith(refusal);
    expect(addText).toHaveBeenCalledExactlyOnceWith(refusal, 3, 4, null, false);
    expect(dialog).toHaveBeenCalledExactlyOnceWith(refusal);
    expect(onServerNotice.mock.invocationCallOrder[0]).toBeLessThan(addText.mock.invocationCallOrder[0]!);
    const itemLink = '角色 : <ITEMLINK>原生链接</ITEMLINK>'; receive({ msg: itemLink });
    expect(onServerNotice).toHaveBeenLastCalledWith(itemLink); expect(addText).toHaveBeenLastCalledWith(itemLink, 3, 4, null, false);
    expect(dialog).toHaveBeenLastCalledWith('角色 : <原生物品>');
    ChatRoom.isOpen = true; receive({ msg: refusal });
    expect(roomMessage).toHaveBeenCalledExactlyOnceWith(refusal); expect(addText).toHaveBeenCalledTimes(2);
    delete context.CardConnection2;
    expect(() => receive({ msg: '未初始化卡册时的聊天' })).not.toThrow();
    expect(roomMessage).toHaveBeenLastCalledWith('未初始化卡册时的聊天');
  });

  it('adds only a lazy guard to the server callback and leaves every other Main statement unchanged', () => {
    const nativeMain = parse(region(native, paths[3]!).text);
    const before = declaration(nativeMain, 'onPlayerMessage'), after = declaration(mainFile, 'onPlayerMessage');
    expect(after.body!.statements[0]!.getText(mainFile)).toBe('if (typeof CardConnection2 !== "undefined") CardConnection2?._lastroCardDeck?.onServerNotice(pkt.msg);');
    expect(after.body!.statements.slice(1).map(node => node.getText(mainFile)))
      .toEqual([...before.body!.statements].map(node => node.getText(nativeMain)));
    const original = region(native, paths[3]!).text;
    const emitted = region(patched, paths[3]!).text;
    expect(emitted.replace(/\r?\n {2}if \(typeof CardConnection2 !== "undefined"\) CardConnection2\?\._lastroCardDeck\?\.onServerNotice\(pkt\.msg\);\r?\n/, ''))
      .toBe(original);
  });

  it('cancels pending work first on map changes, and clears readiness on native game UI cleanup', () => {
    const change = declaration(mapFile, 'onMapChange');
    const clean = declaration(mapFile, 'cleanGameUI');
    expect(change.body?.statements[0]?.getText(mapFile)).toContain('invalidate(false)');
    expect(clean.body?.statements[0]?.getText(mapFile)).toContain('invalidate(true)');
    const invalidate = vi.fn(), removed = vi.fn(), cleaned = vi.fn(), whisper = vi.fn();
    const component = { __loaded: true, remove: removed, clean: cleaned };
    const context = vm.createContext({
      CardConnection2: { _lastroCardDeck: { invalidate } },
      WhisperBox: { clearAll: whisper },
      BasicInfoController: component, PlayerViewEquipController: component,
      StatusIcons_default: component, ChatBox_default: component, ShortCut_default: component,
      Controller$3: component, controller: component, CashShop_default: component,
    });
    vm.runInContext(clean.getText(mapFile) + '\ncleanGameUI();', context);
    expect(invalidate).toHaveBeenCalledExactlyOnceWith(true);
    expect(whisper).toHaveBeenCalledOnce();
    expect(removed).toHaveBeenCalledTimes(2);
    expect(cleaned).toHaveBeenCalledTimes(6);
    expect(invalidate.mock.invocationCallOrder[0]).toBeLessThan(whisper.mock.invocationCallOrder[0]!);
  });

  it('invalidates only the current zone socket while preserving native disconnect cleanup', () => {
    const close = declaration(networkFile, 'onClose$9');
    const invalidate = vi.fn(), receive = vi.fn(), warning = vi.fn();
    const context = vm.createContext({
      CardConnection2: { _lastroCardDeck: { invalidate } },
      clearReceiveState: receive, console: { warn: warning },
      isObserverMode: () => true, Configs: {}, clearInterval: vi.fn(),
    });
    // The disconnect-popup branch is deliberately skipped in this observer
    // fixture; replace only its module URL so the native function can run in VM.
    vm.runInContext(close.getText(networkFile).replace('import.meta.url', '"native-fixture"')
      + '\nvar closeNative = onClose$9;', context);
    const invoke = context.closeNative as (this: object, packet: object) => void;
    const current = { isZone: true }, oldZone = { isZone: true }, characterSocket = { isZone: false };
    for (const [socket, currentSocket, shouldInvalidate] of [
      [oldZone, current, false], [characterSocket, characterSocket, false], [current, current, true],
    ] as const) {
      invalidate.mockClear(); context._socket = currentSocket; context._sockets = [socket];
      invoke.call(socket, { code: 1000, wasClean: true });
      expect(invalidate).toHaveBeenCalledTimes(shouldInvalidate ? 1 : 0);
      if (shouldInvalidate) expect(invalidate).toHaveBeenCalledWith(true);
      expect(context._sockets).toHaveLength(0);
    }
    expect(receive).toHaveBeenCalledTimes(3);
    expect(warning).toHaveBeenCalledTimes(2);
    delete context.CardConnection2;
    context._socket = current; context._sockets = [current];
    expect(() => invoke.call(current, {})).not.toThrow();
  });

  it('keys saved presets by server, realm, account and Session.GID rather than a stale displayed entity', () => {
    const getSession = dependency('installLastroCardDeck', 'getSession');
    const session = { AID: 123, GID: 456, ServerName: 'LastRO', Playing: true, Entity: { GID: 999 } };
    const socket = { connected: true, isZone: true, handoffPending: false };
    let realm = 5;
    const context = vm.createContext({ SessionStorage_default: session, _socket: socket, Configs: { get: () => realm } });
    vm.runInContext('var emittedGetSession = ' + getSession + ';', context);
    const read = context.emittedGetSession as () => { key: string | null; connection: object | null; playing: boolean };
    const first = read();
    expect(JSON.parse(first.key!)).toEqual(['LastRO', 5, 123, 456]);
    expect(first.connection).toBe(socket); expect(first.playing).toBe(true);
    session.GID = 457; const nextCharacter = read().key;
    expect(nextCharacter).not.toBe(first.key);
    session.Entity.GID = 456;
    expect(read().key).toBe(nextCharacter);
    session.AID = 124; expect(read().key).not.toBe(nextCharacter);
    const nextAccount = read().key;
    realm = 6; expect(read().key).not.toBe(nextAccount);
    const nextRealm = read().key;
    session.ServerName = 'Other'; expect(read().key).not.toBe(nextRealm);
    for (const field of ['Playing', 'connected', 'isZone', 'handoffPending'] as const) {
      if (field === 'Playing') session.Playing = false;
      else socket[field] = field === 'handoffPending';
      expect(read().playing).toBe(false);
      session.Playing = true; socket.connected = true; socket.isZone = true; socket.handoffPending = false;
    }
    session.GID = 0; expect(read()).toMatchObject({ key: null, playing: false });
    session.GID = 457; session.AID = 0; expect(read()).toMatchObject({ key: null, playing: false });
    session.AID = 124; context._socket = null; expect(read()).toMatchObject({ connection: null, playing: false });
  });

  it('loads character-scoped preferences and lazily initializes the original item panel from serialized dependencies', () => {
    const preference = vi.fn(), initInfo = vi.fn(), info = {};
    const context = vm.createContext({ Preferences: { get: preference }, init_ItemInfo: initInfo, ItemInfo_default: info });
    vm.runInContext('var loadPrefs = ' + dependency('installLastroCardDeck', 'loadPreferences')
      + '; var getInfo = ' + dependency('installLastroCardArt', 'getItemInfo') + ';', context);
    (context.loadPrefs as (key: string) => unknown)('character-key');
    expect(preference).toHaveBeenCalledWith('LastROCardDeck:character-key', {
      _key: 'LastROCardDeck:character-key', _version: 1,
      presets: [null, null, null, null], names: ['卡册 1', '卡册 2', '卡册 3', '卡册 4'], activePreset: null, activeCards: null,
    }, 1);
    expect((context.getInfo as () => object)()).toBe(info);
    expect(initInfo).toHaveBeenCalledOnce();
  });

  it('routes manual activation to draft-aware controller and renaming to preset names', () => {
    const activate = vi.fn(() => Promise.resolve(true)), rename = vi.fn(() => Promise.resolve(true)), shortcut = vi.fn();
    const context = vm.createContext({ CardConnection2: { activateDeckPreset: activate, switchDeckPreset: shortcut, renameDeckPreset: rename } });
    vm.runInContext('var activatePreset = ' + dependency('installLastroCardDeckUI', 'activate')
      + '; var renamePreset = ' + dependency('installLastroCardDeckUI', 'rename') + ';', context);
    const start = context.activatePreset as (index: number) => Promise<boolean>;
    const edit = context.renamePreset as (index: number, name: string) => Promise<boolean>;
    const activation = start(3), renaming = edit(3, '首领套卡');
    expect(activate).toHaveBeenCalledExactlyOnceWith(3);
    expect(shortcut).not.toHaveBeenCalled();
    expect(rename).toHaveBeenCalledExactlyOnceWith(3, '首领套卡');
    expect(activation).toBe(activate.mock.results[0]!.value);
    expect(renaming).toBe(rename.mock.results[0]!.value);
  });
});

describe('serialized native card switch notices', () => {
  function notices() {
    const initialize = vi.fn(), append = vi.fn(), set = vi.fn(), removed = vi.fn();
    const host = document.createElement('div'), cardHost = document.createElement('div');
    host.style.setProperty('z-index', '17', 'important');
    cardHost.style.setProperty('z-index', '120', 'important');
    document.body.append(host, cardHost);
    const announce: { append: typeof append; set: typeof set; _host: HTMLElement; onRemove: (...args: unknown[]) => unknown } = {
      append, set, _host: host, onRemove: removed,
    };
    const network = vi.fn(), prompt = vi.fn(), message = vi.fn();
    const context = vm.createContext({
      document, window, getComputedStyle: window.getComputedStyle.bind(window),
      init_Announce: initialize, Announce_default: announce, CardConnection2: { _host: cardHost },
      Network: { sendPacket: network }, UIManager: { showPromptBox: prompt, showMessageBox: message },
    });
    vm.runInContext('var notifySwitch = ' + dependency('installLastroCardDeck', 'notify') + ';', context);
    const notify = context.notifySwitch as (success: boolean, index: number, name: string, reason?: string) => void;
    return { notify, initialize, append, set, announce, host, cardHost, removed, network, prompt, message };
  }

  it('initializes and appends the native notice before drawing one success message with the custom card name', () => {
    const result = notices(); result.notify(true, 2, '首领套卡');
    expect(result.initialize).toHaveBeenCalledOnce(); expect(result.append).toHaveBeenCalledOnce();
    expect(result.initialize.mock.invocationCallOrder[0]).toBeLessThan(result.append.mock.invocationCallOrder[0]!);
    expect(result.append.mock.invocationCallOrder[0]).toBeLessThan(result.set.mock.invocationCallOrder[0]!);
    expect(result.set).toHaveBeenCalledExactlyOnceWith('切换成功：已切换至「首领套卡」', '#63d68e', { fontSize: 12, life: 3000 });
    expect(result.network).not.toHaveBeenCalled(); expect(result.prompt).not.toHaveBeenCalled(); expect(result.message).not.toHaveBeenCalled();
  });

  it('draws a nonblocking failure message with the custom card name and actual reason', () => {
    const result = notices(); result.notify(false, 4, '防御套卡', '服务器未确认加入卡片');
    expect(result.set).toHaveBeenCalledExactlyOnceWith('切换失败：「防御套卡」，服务器未确认加入卡片', '#ffb4a8', { fontSize: 12, life: 3000 });
    expect(result.append.mock.invocationCallOrder[0]).toBeLessThan(result.set.mock.invocationCallOrder[0]!);
    expect(result.network).not.toHaveBeenCalled(); expect(result.prompt).not.toHaveBeenCalled(); expect(result.message).not.toHaveBeenCalled();
  });

  it('keeps failure messages readable when no additional reason is available', () => {
    const result = notices(); result.notify(false, 1, '日常套卡');
    expect(result.set.mock.calls[0]![0]).toBe('切换失败：「日常套卡」');
    expect(result.set.mock.calls[0]![0]).not.toContain('undefined');
  });

  it('shows the notice above the card overlay and restores the original inline layer and native remove callback', () => {
    const result = notices(); result.removed.mockReturnValue('native-removed');
    result.cardHost.style.setProperty('z-index', '150', 'important');
    result.notify(true, 2, '首领套卡');
    expect(result.host.style.getPropertyValue('z-index')).toBe('152');
    expect(result.host.style.getPropertyPriority('z-index')).toBe('important');
    expect(result.announce.onRemove).not.toBe(result.removed);
    expect(result.announce).toHaveProperty('_lastroCardDeckNotice');
    expect(result.announce.onRemove.call(result.announce, 'timeout')).toBe('native-removed');
    expect(result.removed).toHaveBeenCalledExactlyOnceWith('timeout');
    expect(result.removed.mock.contexts[0]).toBe(result.announce);
    expect(result.host.style.getPropertyValue('z-index')).toBe('17');
    expect(result.host.style.getPropertyPriority('z-index')).toBe('important');
    expect(result.announce.onRemove).toBe(result.removed);
    expect(result.announce).not.toHaveProperty('_lastroCardDeckNotice');
  });

  it('wraps repeated notifications once and restores the first original layer rather than a temporary layer', () => {
    const result = notices(); result.notify(true, 1, '日常套卡');
    const wrapper = result.announce.onRemove;
    expect(result.host.style.getPropertyValue('z-index')).toBe('122');
    result.cardHost.style.setProperty('z-index', '210', 'important');
    result.notify(false, 3, '输出套卡', '服务器响应超时');
    expect(result.announce.onRemove).toBe(wrapper);
    expect(result.host.style.getPropertyValue('z-index')).toBe('212');
    result.announce.onRemove();
    expect(result.removed).toHaveBeenCalledOnce();
    expect(result.host.style.getPropertyValue('z-index')).toBe('17');
    expect(result.host.style.getPropertyPriority('z-index')).toBe('important');
    expect(result.announce.onRemove).toBe(result.removed);
    expect(result.announce).not.toHaveProperty('_lastroCardDeckNotice');
  });

  it('removes a temporary inline layer when the native notice originally had no inline z-index', () => {
    const result = notices(); result.host.style.removeProperty('z-index');
    result.notify(true, 1, '日常套卡');
    expect(result.host.style.getPropertyValue('z-index')).toBe('122');
    result.announce.onRemove();
    expect(result.host.style.getPropertyValue('z-index')).toBe('');
    expect(result.host.style.getPropertyPriority('z-index')).toBe('');
    expect(result.announce.onRemove).toBe(result.removed);
  });

  it('restores the layer even if the original native remove callback throws', () => {
    const result = notices(); result.removed.mockImplementation(() => { throw new Error('native-remove'); });
    result.notify(false, 1, '日常套卡', '未保存');
    expect(() => result.announce.onRemove()).toThrow('native-remove');
    expect(result.host.style.getPropertyValue('z-index')).toBe('17');
    expect(result.host.style.getPropertyPriority('z-index')).toBe('important');
    expect(result.announce.onRemove).toBe(result.removed);
    expect(result.announce).not.toHaveProperty('_lastroCardDeckNotice');
  });
});
