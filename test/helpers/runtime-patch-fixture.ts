import ts from 'typescript';
import { extractRuntimeNode, extractVendorRegion } from './vendor-runtime';

const audioPreludeOwners = [
  'function:installLastROWebAudio',
  'variable:LastROWebAudio',
  'function:installLastROAudioUnlock',
  'function:LastROAudioPlay',
  'function:LastROAudioUnlock',
  'function:LastROAudioRegisterContext',
  'call:installLastROAudioUnlock',
];

export function buildRuntimeAudioPrelude(vendorSource: string): string[] {
  const file = ts.createSourceFile('Online.js', vendorSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const diagnostics = (file as ts.SourceFile & { parseDiagnostics?: readonly ts.Diagnostic[] }).parseDiagnostics ?? [];
  if (diagnostics.length) {
    const diagnostic = diagnostics[0];
    const message = diagnostic ? ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n') : 'Invalid JavaScript';
    throw new Error(`Cannot parse vendor audio owners: ${message}`);
  }
  const matches = new Map<string, ts.Statement[]>();
  for (const statement of file.statements) {
    const owners: string[] = [];
    if (ts.isFunctionDeclaration(statement) && statement.name) owners.push(`function:${statement.name.text}`);
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) owners.push(`variable:${declaration.name.text}`);
      }
    }
    if (ts.isExpressionStatement(statement) && ts.isCallExpression(statement.expression)
      && ts.isIdentifier(statement.expression.expression)) {
      owners.push(`call:${statement.expression.expression.text}`);
    }
    for (const owner of owners) {
      matches.set(owner, [...(matches.get(owner) ?? []), statement]);
    }
  }
  const nodes = audioPreludeOwners.map(owner => {
    const statements = matches.get(owner) ?? [];
    if (statements.length !== 1) throw new Error(`Expected exactly one vendor audio owner ${owner}; found ${statements.length}`);
    const statement = statements[0];
    if (!statement) throw new Error(`Missing vendor audio owner ${owner}`);
    return statement.getText(file);
  });
  const webAudioInitializer = matches.get('variable:LastROWebAudio')?.[0];
  const unlockInitializer = matches.get('call:installLastROAudioUnlock')?.[0];
  if (!webAudioInitializer || !unlockInitializer) throw new Error('Missing vendor audio initializers');
  const webAudioIndex = file.statements.indexOf(webAudioInitializer);
  const unlockIndex = file.statements.indexOf(unlockInitializer);
  if (webAudioIndex < 0 || unlockIndex < 0 || webAudioIndex >= unlockIndex) {
    throw new Error('Vendor audio initialization order must install Web Audio before the unlock listener');
  }
  return nodes;
}

export function buildRuntimePatchFixture(vendorSource: string): string {
  const cacheRegions = [
    'src/Core/MemoryItem.js',
    'src/Core/MemoryManager.js',
    'src/Core/Preferences.js',
  ].map(name => extractVendorRegion(name, vendorSource));
  const audioRegions = [
    'src/Audio/BGM.js',
    'src/Audio/SoundManager.js',
    'src/Renderer/Effects/RainWeather.js',
  ].map(name => extractVendorRegion(name, vendorSource));
  const commonCss = extractVendorRegion('src/UI/Common.css?raw', vendorSource);
  const worldMap = extractVendorRegion('src/UI/Components/WorldMap/WorldMap.js', vendorSource);
  const mapFailure = extractRuntimeNode(vendorSource, {
    region: 'src/Renderer/MapRenderer.js',
    kind: 'function',
    name: 'onMapComplete',
  });
  const audioPrelude = buildRuntimeAudioPrelude(vendorSource);

  return [
    'import { existing } from "./existing.mjs?build=fixture-1";',
    ...audioPrelude,
    ...cacheRegions,
    'var root = freeGlobal || freeSelf || Function("return this")();',
    commonCss,
    'function drawLabel(ctx) { ctx.font = "10px Arial"; }',
    ...audioRegions,
    'function compileTemplate(importsKeys, sourceURL, source, importsValues) { return Function(importsKeys, sourceURL + "return " + source).apply(undefined, importsValues); }',
    'function addPreloader(el) { el.innerHTML = PRELOADER_INNER_HTML; }',
    '/** Earlier runtime documentation */\nconst retainedRuntime = 1;',
    '//#region src/Network/SocketHelpers/WebSocket.js\nfunction Socket$1() {}\n//#endregion',
    '//#region src/Network/SocketHelpers/NodeSocket.js\nvar Socket;\n//#endregion',
    worldMap,
    'function defaultSocketFactory(host, port) { return new Socket(host, port); }',
    'function requestChatMapTeleport(link) { return false; }',
    'function flushMessageBuffer() { messages.forEach(msg => { const div = document.createElement("div"); if (!msg.override) div.textContent = msg.text; else div.innerHTML = msg.text; }); }',
    'ChatBox.addText = function addText(text, override) { text = text.replace(/<ITEMLINK>.*?<\\/ITEMLINK>/gi, function(match) { return match; }); if (!override && /mapname/.test(text)) override = true; };',
    'function onMapClick(event, mapLink) { if (requestChatMapTeleport(mapLink)) { event.preventDefault(); event.stopImmediatePropagation(); } }',
    'UIManager.addComponent(LastROTools);',
    'UIManager.addComponent(GraphicsOption);',
    'Navigation.waitForMapData = function waitForMapData(callback) { setTimeout(() => Navigation.waitForMapData(callback), 100); };',
    'Navigation.navigateTo = function navigateTo(options) { _finalTargetData = {map: options.endMap}; this.waitForMapData(function () { this.findPath(); }); };',
    'var MapRenderer = class MapRenderer { static setMap(mapname) { UIManager.removeComponents(); } };',
    mapFailure,
    'function cleanGameUI() {}',
    'function onGlobalAnnounce(pkt) { Announce_default.set(pkt.msg, "#FFFF00"); }',
    'function onPlayerMessage(pkt) { ChatBox_default.addText(pkt.msg); }',
    'function onEntityTalkColor(pkt) { ChatBox_default.addText(pkt.msg); }',
    'function onConnectionRequest(username, password) {',
    '  SoundManager.play("fixture-login.wav");',
    '  Network.connect(_server.address, _server.port, (success) => {',
    '    if (!success) {',
    '      return;',
    '    }',
    '    let pkt;',
    '    function sendLogin() {',
    '      if (Configs.get("loginMode") == "han") {',
    '        pkt = new PACKET.CA.LOGIN_HAN();',
    '        Network.sendPacket(pkt);',
    '      } else {',
    '        pkt = new PACKET.CA.LOGIN();',
    '        Network.sendPacket(pkt);',
    '      }',
    '    }',
    '  });',
    '}',
    'function initializeLoginConfig() {',
    '      const autoLogin = Configs.get("autoLogin");',
    '      if (autoLogin instanceof Array && autoLogin[0] && autoLogin[1]) {',
    '        onConnectionRequest.apply(null, autoLogin);',
    '        Configs.set("autoLogin", null);',
    '      }',
    '}',
    'function initializeNetworkDebug() {',
    '  packetDump = Configs.get("packetDump", false);',
    '}',
    'Plugins.init = function initPlugins() { this.list = Configs.get("plugins", []); };',
    '//#region src/UI/Components/Storage/Fixture.js',
    'function renderStorageListFixture() { nameSpan.innerHTML = DB.getItemName(item); }',
    'function renderStorageGridFixture() { nameSpan.innerHTML = DB.getItemName(item); }',
    'function renderStorageListOverlayFixture() { overlay.innerHTML = `${DB.getItemName(item)} ${item.count || 1}${getItemCountUnit()}`; }',
    'function renderStorageGridOverlayFixture() { overlay.innerHTML = `${DB.getItemName(item)} ${item.count || 1}${getItemCountUnit()}`; }',
    '//#endregion',
    'function renderCharacterFixture() { charCanvases[i].querySelector(".name").innerHTML = _slots[i] ? _slots[i].name : ""; }',
    'function init_NetworkManager() { init_WebSocket(); init_NodeSocket(); }',
    'function init() {\n\troInitSpinner.add();\n\tPlugins.init();\n\tGameEngine.init();\n}',
    'function initThread() {\n\tif (!_source) _source = new Worker(new URL(\n\t\t/* @vite-ignore */\n\t\t"" + new URL("LastROThreadEventHandler.js", import.meta.url).href,\n\t\t"" + import.meta.url\n\t), { type: "classic" });\n\tif (_source instanceof Worker) _source.addEventListener("message", Thread.receive, false);\n}',
    'function initializePathFindingWorker() { const workerUrl = new URL("PathFindingWorker.js", import.meta.url).href; return new Worker(workerUrl); }',
    'function loadXMLFile(filename, callback, onEnd) {}',
    'function loadLuaValue(file_path, variable_name, callback, onEnd) { Client.loadFile(file_path, function(file) {}); }',
    ...['map', 'npc', 'link', 'linkdistance', 'npcdistance'].map(table => `loadLuaValue(DB.LUA_PATH + "navigation/navi_${table}_krpri.lub", "Navi_Table", callback, onEnd);`),
    'function onReady() { _thread_ready = true; savingFiles(files); }',
    'function updateGamepads() { const gamepads = navigator.getGamepads ? navigator.getGamepads() : []; }',
    'function clientInit() { if (remoteClient) Thread.send("SET_HOST", remoteClient); }',
    'function loginInit() {\n\t\t\t\tThread.send("SET_HOST", remoteClient);\n}',
    'function loadFiles() { if (!Configs.get("remoteClient") && !count && !window.electronAPI?.isElectron) { alert("x"); } }',
    'function createWinLogin({ name, htmlText, cssText }) {',
    '\t\tconst Component = new GUIComponent(name, enhanceWinLoginStyles(name, cssText));',
    '\t\tconst renderedHtmlText = enhanceWinLoginTemplate(name, htmlText);',
    '\t\tvoid 0;',
    '\t\tpopulateLoginServerButtons(root, Configs.get("loginServerProfiles", []), Configs.getServer?.().id || "lastro", (profile) => Component.onServerSelect(profile));',
    '\t\tconst user = _inputUsername.value;',
    '\t\tconst pass = _inputPassword.value;',
    '\t\tapplyDebugLoginFields();',
    '\t}',
  ].join('\n');
}
