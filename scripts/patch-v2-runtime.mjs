import { patchLroAssistantRuntime } from './patch-lro-assistant.mjs';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { parseArgs } from 'node:util';
import process from 'node:process';
import ts from 'typescript';
import { patchStrEffectLifecycle } from '../vendor/v2/lastro-effect-compat.mjs';
import { patchRuntimeScrollbarObserverLifecycle, patchRuntimeSameMapSignboardCleanup } from './lastro-ui-lifecycle.mjs';
import { patchRuntimeLocalization, patchRuntimeMapLocalization, patchRuntimeStatusTooltips, assertRuntimeLocalizationMount, patchRuntimeUiText, patchRuntimeUiMessages, patchRuntimeEmoticons, patchRuntimeItemName, patchRuntimeCharSelectMapName } from './lastro-display-localization.mjs';

import { patchRuntimeNavigation, patchRuntimePluginLoader, patchRuntimePlainTextSinks } from './patch-csp-runtime.mjs';
import { patchRuntimeCredentialSecurity } from './lastro-credential-security.mjs';
import { patchRuntimeLastROItemLayouts } from './lastro-item-packet-layouts.mjs';
import { patchRuntimeCharacterSwitch, patchRuntimeNetworkHandoffCleanup, patchRuntimeMapChangeHandoff } from './lastro-character-switch.mjs';
import { patchRuntimeNetworkDiagnostics } from './lastro-network-diagnostics.mjs';
import { patchRuntimeLastROBatteryPower } from './lastro-battery-power.mjs';
import { patchRuntimeLuaStartup } from './lastro-lua-startup.mjs';
import { patchRuntimeDebugAccess } from './lastro-debug-access.mjs';
import { installHalloweenWorldRuntime } from '../src/halloween/halloween-world-runtime.mjs';
import { createMonsterPortraitLoader } from './lastro-monster-portrait.mjs';



import { ITEM_OBTAIN_CSS } from './lastro-loot-style.mjs';
import { installLastroLootList } from './lastro-loot-list.mjs';
import { createLastroChatMapLinks } from './lastro-chat-map-links.mjs';
import { patchRuntimeNpcMapLinks } from './lastro-npc-map-links.mjs';
import { patchRuntimeAutolootSettings } from './lastro-autoloot-settings.mjs';
import { patchRuntimeAchievementLinks } from './lastro-achievement-links.mjs';
import { patchRuntimeTeleportFeedback } from './lastro-teleport-feedback.mjs';
import { patchRuntimeEntityAppearance } from './lastro-entity-appearance.mjs';
import { patchRuntimeEquipmentAppearance, patchRuntimeEquipmentCatalog, patchRuntimeEquipmentView } from './lastro-equipment-view.mjs';
import { patchRuntimeTeleportFade } from './lastro-teleport-fade.mjs';
import { installKoreShellPanels, installLastroToolsPanels } from './lastro-tools-panels.mjs';
import { KORE_SHELL_CSS, LASTRO_TOOLS_CSS } from './lastro-tools-style.mjs';
import { captureLastroShortcutEntry, installLastroShortcutEntry } from './lastro-shortcut-entry.mjs';
import { installLastroShortcutSettings } from './lastro-shortcut-settings.mjs';
import { installLastroTeleportSettings } from './lastro-teleport-settings.mjs';
import { patchPetDialogueDecoding } from './patch-pet-dialogue.mjs';


import { patchRuntimeHotkeys } from './lastro-hotkeys.mjs';
import { patchRuntimeQuickCast } from './lastro-quick-cast.mjs';
import { patchRuntimeCardDeckHotkeys } from './lastro-card-deck-hotkeys.mjs';
import { patchRuntimeCardCollection } from './lastro-card-collection.mjs';
import { patchRuntimeQuests } from './lastro-quest-runtime.mjs';
import teleportRoutes from './lastro-teleport-routes.json' with { type: 'json' };
import { createLastroTeleportNavigation } from './lastro-teleport-navigation.mjs';
import { createLastroTeleportPreflight } from './lastro-teleport-preflight.mjs';
import { createLastroVerifiedTeleportRequest } from './lastro-teleport-request.mjs';
import { createLastroWorldMapTeleport } from './lastro-worldmap-teleport.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));

function fail(code) {
  throw new Error(JSON.stringify({ code }));
}

function count(source, needle) {
  return source.split(needle).length - 1;
}

function replaceOnce(source, needle, replacement) {
  if (count(source, needle) !== 1) fail(`anchor:${needle}`);
  return source.replace(needle, replacement);
}

export function patchRuntimeHalloweenGround(source) {
  const shaderAnchor = '\n  Ground_default$1 =';
  if (count(source, shaderAnchor) !== 1) fail('anchor:halloween-ground-shader');
  const shaderMatch = /(?:^|\n)[\x20]{2}Ground_default\$1\s*=\s*("(?:\\.|[^"\\])*")/.exec(source);
  if (!shaderMatch?.[1]) fail('anchor:halloween-ground-shader');

  let shader = decodeDoubleQuotedString(shaderMatch[1]);
  shader = replaceOnce(
    shader,
    'uniform bool uGammaCorrection;',
    'uniform bool uGammaCorrection;\r\nuniform bool uLastroHalloweenActive;',
  );
  shader = replaceOnce(shader, '    }\r\n\r\n}', `    }\r\n\r\n    if (uLastroHalloweenActive) {\r\n        vec3 color = fragColor.rgb;\r\n        fragColor.rgb = vec3(\r\n            dot(vec3(0.698518, 0.194785, -0.025253), color) - 0.03,\r\n            dot(vec3(0.131761, 0.798064, 0.029082), color) - 0.03,\r\n            dot(vec3(0.167723, 0.130624, 0.654795), color) - 0.03\r\n        );\r\n    }\r\n\r\n}`);

  const literalStart = shaderMatch.index + shaderMatch[0].lastIndexOf(shaderMatch[1]);
  let output = source.slice(0, literalStart) + JSON.stringify(shader)
    + source.slice(literalStart + shaderMatch[1].length);
  const renderAnchor = 'function render$12(gl, modelView, projection, normalMat, fog, light) {';
  if (count(output, renderAnchor) !== 1) fail('anchor:halloween-ground-render');
  const renderStart = output.indexOf(renderAnchor);
  const renderEnd = output.indexOf('\n}', renderStart);
  if (renderEnd < 0) fail('anchor:halloween-ground-render');
  let render = output.slice(renderStart, renderEnd + 2);
  render = replaceOnce(render, '  gl.useProgram(_program$25);\n',
    '  gl.useProgram(_program$25);\n'
      + '  const effects = globalThis.LastROHalloweenEffects;\n'
      + '  gl.uniform1i(uniform.uLastroHalloweenActive, Boolean(effects?.seasonal && !effects.disabled));\n');
  output = output.slice(0, renderStart) + render + output.slice(renderEnd + 2);
  return output;
}

export function patchRuntimeHalloweenWorld(source) {
  source = patchRuntimeHalloweenGround(source);
  const anchor = '  BGM.play((mapInfo && mapInfo.mp3) || "01.mp3");';
  if (count(source, anchor) !== 1) fail('anchor:halloween-world-runtime');
  const installer = installHalloweenWorldRuntime.toString();
  const output = source.replace(anchor, `  const lastroBaseBgm = (mapInfo && mapInfo.mp3) || "01.mp3";
  globalThis.lastroHalloweenWorldRuntime ??= (${installer})({
    window,
    isActive: () => {
      const effects = globalThis.LastROHalloweenEffects;
      return !!effects?.seasonal && !effects.disabled;
    },
    getMap: () => MapRenderer.currentMap,
    playBgm: filename => BGM.play(filename),
    Entity,
    EntityManager,
    getPlayer: () => SessionStorage_default.Entity,
    getBodyPath: id => DB.getBodyPath(id, 0),
    getGroundHeight: (x, y) => Altitude.getCellHeight(x, y),
  });
  globalThis.lastroHalloweenWorldRuntime.onMapLoaded({ mp3: lastroBaseBgm });`);
  const readyAnchor = '    Renderer.render(MapRenderer.onRender);\n    Mouse.intersect = true;';
  if (count(output, readyAnchor) !== 1) fail('anchor:halloween-world-ready');
  return output.replace(readyAnchor, `${readyAnchor}\n    globalThis.lastroHalloweenPortraitLoader2026 ??= (${createMonsterPortraitLoader.toString()})(Client, id => DB.getBodyPath(id, 0), document);\n    globalThis.LastROHalloweenEffects?.setMonsterPortraitLoader?.(globalThis.lastroHalloweenPortraitLoader2026);`);
}

/**
 * Try candidate anchor/replacement pairs, longest anchor first, and apply the
 * first pair whose anchor matches exactly once.  This lets the patcher support
 * both the tab-indented upstream bundle and the space-indented formatted copy.
 */
function replaceOnceAny(source, pairs) {
  const sorted = [...pairs].sort((a, b) => b[0].length - a[0].length);
  for (const [anchor, replacement] of sorted) {
    if (count(source, anchor) === 1) return source.replace(anchor, replacement);
  }
  fail(`anchor:${pairs[0][0]}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeDoubleQuotedString(literal) {
  const escapeMap = { '\\r': '\r', '\\n': '\n', '\\t': '\t', '\\b': '\b', '\\f': '\f', '\\v': '\v', '\\\\': '\\', '\\"': '"' };
  return literal.slice(1, -1).replace(/\\(?:r|n|t|b|f|v|\\|")/g, (escape) => escapeMap[escape]);
}

function appendCssToStringVariable(source, variableName, cssBlock) {
  const pattern = new RegExp(`(${escapeRegExp(variableName)}\\s*=\\s*)("(?:\\\\.|[^"\\\\])*")`, 'g');
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) fail(`anchor:${variableName}`);
  const match = matches[0];
  const css = decodeDoubleQuotedString(match[2]);
  if (css.includes(cssBlock)) return source;
  return source.replace(match[0], `${match[1]}${JSON.stringify(css + cssBlock)}`);
}

function removeRegion(source, names) {
  const pattern = new RegExp(`//#region src/Network/SocketHelpers/(?:${names.join('|')})\\.js\\r?\\n[\\s\\S]*?//#endregion`, 'g');
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) fail(`region:${names.join('|')}`);
  const match = matches[0];
  return source.slice(0, match.index) + source.slice(match.index + match[0].length);
}

function replaceFunctionBody(source, name, body) {
  const file = ts.createSourceFile('Online.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const matches = [];
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) matches.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (matches.length !== 1) fail(`function:${name}`);
  const node = matches[0];
  const start = node.body.getStart(file);
  return source.slice(0, start) + body + source.slice(node.body.end);
}

function patchLoginRegistrationHook(source) {
  const file = ts.createSourceFile('Online.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const matches = [];
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'onConnectionRequest') matches.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (matches.length !== 1) fail('function:onConnectionRequest');
  const node = matches[0];
  let body = source.slice(node.body.getStart(file), node.body.end);
  const variants = [
    { send: '\t\t\t\tNetwork.sendPacket(pkt);', close3: '\t\t\t}', close2: '\t\t}', close1: '\t});', indent: '\t\t\t\t' },
    { send: '        Network.sendPacket(pkt);', close3: '      }', close2: '    }', close1: '  });', indent: '        ' },
  ];
  const matched = variants.filter((v) => count(body, `${v.send}\n${v.close3} else {`) === 1);
  if (matched.length !== 1) fail('anchor:login-han-send');
  const variant = matched[0];
  const hook = `\n${variant.indent}afterLastROLoginPassword(username, password);`;
  const hanMarker = `${variant.send}\n${variant.close3} else {`;
  const normalMarker = `${variant.send}\n${variant.close3}\n${variant.close2}\n${variant.close1}\n}`;
  if (count(body, normalMarker) !== 1) fail('anchor:login-send');
  body = body.replace(hanMarker, `${variant.send}${hook}\n${variant.close3} else {`);
  body = body.replace(normalMarker, `${variant.send}${hook}\n${variant.close3}\n${variant.close2}\n${variant.close1}\n}`);
  return source.slice(0, node.body.getStart(file)) + body + source.slice(node.body.end);
}







export function patchLuaTableCompletion(source) {
  if (!source.includes('function loadLuaTable(')) return source;
  const start = source.indexOf('function loadLuaTable(');
  const script = source.slice(start).match(/lua\.doStringSync\((`[\s\S]*?`)\);/);
  if (!script || !script[1].includes('main_table()')) fail('anchor:lua-table-parser');
  return replaceFunctionBody(source, 'loadLuaTable', `{
  const mounted = [];
  const table = {};
  const read = (filename) => new Promise((resolve, reject) => {
    Client.loadFile(filename, resolve, () => reject(new Error("Failed to load " + filename)));
  });
  void (async () => {
    try {
      for (const filename of file_list) {
        const file = await read(filename);
        const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
        lua.mountFile(filename, buffer);
        mounted.push(filename);
        await lua.doFile(filename);
      }
      const valueCharset = getLuaTableValueCharset(file_list[1], userCharpage);
      const ctx = lua.ctx;
      ctx.addKeyAndValueToTable = (key, value) => {
        table[key] = userStringDecoder.decode(value, valueCharset);
        return 1;
      };
      ctx.addKeyAndMoreValuesToTable = (key, value) => {
        table[key] = (table[key] || "") + userStringDecoder.decode(value, valueCharset) + "\\n";
        return 1;
      };
      ctx.addKeyAndValueToTable.$rawLuaStringArgs = [1];
      ctx.addKeyAndMoreValuesToTable.$rawLuaStringArgs = [1];
      lua.doStringSync(${script[1]});
      if (typeof contextFunc === "function") contextFunc();
      callback.call(null, table);
    } catch (error) {
      console.error("[loadLuaTable]", table_name, error);
    } finally {
      for (const filename of mounted.reverse()) {
        try { lua.unmountFile(filename); } catch (error) { console.error("[loadLuaTable] cleanup", error); }
      }
      if (typeof onEnd === "function") onEnd();
    }
  })();
}`);
}

function patchRuntimeUiLayout(source) {
  const itemObtainCss = ITEM_OBTAIN_CSS;
  const shortcutCss = [
    '\r\n\r\n/* LastRO shortcut typography and alignment */\r\n',
    '#ShortCut {\r\n',
    '\tfont-family: Arial, \'Microsoft YaHei\', \'MiSans\', \'LastRO Glyph Fallback\', sans-serif;\r\n',
    '\tfont-size: 10px;\r\n',
    '\tline-height: 1;\r\n',
    '}\r\n',
    '#ShortCut .row {\r\n',
    '\theight: 34px;\r\n',
    '}\r\n',
    '#ShortCut .row .container {\r\n',
    '\theight: 24px;\r\n',
    '\tmargin-bottom: 5px;\r\n',
    '}\r\n',
    '#ShortCut .row .index {\r\n',
    '\tfont-family: Arial, sans-serif;\r\n',
    '\tfont-size: 10px;\r\n',
    '\tline-height: 10px;\r\n',
    '}\r\n',
    '#ShortCut .icon .amount {\r\n',
    '\tright: 1px;\r\n',
    '\ttop: 17px;\r\n',
    '\theight: 10px;\r\n',
    '\tmin-width: 8px;\r\n',
    '\tfont-family: Arial, sans-serif;\r\n',
    '\tfont-size: 10px;\r\n',
    '\tline-height: 10px;\r\n',
    '}\r\n',
    '.shortcut-tooltip {\r\n',
    '\tfont-family: Arial, \'Microsoft YaHei\', \'MiSans\', \'LastRO Glyph Fallback\', sans-serif;\r\n',
    '\tfont-size: 10px;\r\n',
    '\tline-height: 12px;\r\n',
    '}\r\n',
  ].join('');

  if (source.includes('ItemObtain_default$1')) {
    source = appendCssToStringVariable(source, 'ItemObtain_default$1', itemObtainCss);
    const centeredPosition = 'this._host.style.left = `${(Renderer.width - (el ? el.offsetWidth : 0)) >> 1}px`;';
    const centeredPositionBlocks = [
      `const el = this.getRoot().querySelector("#ItemObtain");\n    ${centeredPosition}`,
      `const el = root.querySelector("#ItemObtain");\n    ${centeredPosition}`,
    ];
    const centeredPositionCount = centeredPositionBlocks.reduce((total, block) => total + count(source, block), 0);
    if (centeredPositionCount !== 2) fail('anchor:item-obtain-center');
    for (const block of centeredPositionBlocks)
      source = source.replaceAll(block, 'this._host.style.left = "auto";\n    this._host.style.right = "24px";');
    const behaviorPattern = /ItemObtain\.onRemove = function onRemove\(\) \{[\s\S]*?(?= {2}ItemObtain_default = UIManager\.addComponent\(ItemObtain\);)/g;
    if ([...source.matchAll(behaviorPattern)].length !== 1) fail('anchor:item-obtain-list');
    source = source.replace(behaviorPattern, () => `(${installLastroLootList.toString()})(ItemObtain, { DB, Client }, _life);\n`);
  }
  if (source.includes('ShortCut_default$1'))
    source = appendCssToStringVariable(source, 'ShortCut_default$1', shortcutCss);
  return source;
}

function teleportResourceLoaderCode() {
  return `filename => new Promise((resolve, reject) => {
    const resolvedFilename = resolveLastroMapResourceName(filename, DB.mapalias);
    let settled = false;
    const timer = globalThis.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("download-timeout-65000ms: " + resolvedFilename));
    }, 65000);
    try {
      Thread.send("GET_FILE", { filename: resolvedFilename, args: null }, (bytes, error) => {
        if (settled) return;
        settled = true;
        globalThis.clearTimeout(timer);
        if (error || !bytes) {
          console.warn("[LastRO] Teleport resource check failed", filename, resolvedFilename, error);
          reject(new Error(String(error?.message || error || "ResourceResolutionError") + ": " + resolvedFilename));
        } else resolve(bytes);
      });
    } catch (error) {
      settled = true;
      globalThis.clearTimeout(timer);
      reject(error);
    }
  })`;
}

export function patchRuntimeWorldMapProductActions(source) {
  const marker = '/* lastro-worldmap-product-actions */';
  const pattern = /\/\/#region src\/UI\/Components\/WorldMap\/WorldMap\.js\r?\n[\s\S]*?\/\/#endregion/g;
  const regions = [...source.matchAll(pattern)];
  if (regions.length !== 1 || count(source, marker) !== 1) fail('anchor:worldmap-product-actions');
  const region = regions[0], text = region[0];
  const file = ts.createSourceFile('WorldMap.js', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const declarations = [], factories = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === 'init_WorldMap') declarations.push(node);
    if (ts.isFunctionExpression(node) && ['installLastroWorldMap', 'createWorldMapIndex', 'createMonsterPortraitLoader'].includes(node.name?.text)) factories.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  const declaration = declarations[0], initializer = declaration?.initializer;
  const callback = ts.isCallExpression(initializer ?? {}) && initializer.expression.getText(file) === '__esmMin'
    && initializer.arguments.length === 1 && initializer.arguments[0];
  const statements = callback && ts.isArrowFunction(callback) && !callback.modifiers?.length
    && callback.parameters.length === 0 && ts.isBlock(callback.body) && callback.body.statements;
  const expectedInits = ['init_DBManager', 'init_Client', 'init_UIManager', 'init_GUIComponent', 'init_MonsterTable', 'init_NetworkManager', 'init_PacketStructure', 'init_SessionStorage', 'init_MapRenderer', 'init_Navigation', 'init_Thread', 'init_Configs'];
  if (file.parseDiagnostics.length || declarations.length !== 1 || !statements || statements.length !== 18
      || factories.length !== 3 || new Set(factories.map(node => node.name.text)).size !== 3
      || expectedInits.some((name, i) => !ts.isExpressionStatement(statements[i])
        || !ts.isCallExpression(statements[i].expression) || statements[i].expression.expression.getText(file) !== name
        || statements[i].expression.arguments.length !== 0)) fail('anchor:worldmap-product-actions');
  const gui = statements[12], actions = statements[13], render = statements[14], installer = statements[15];
  const action = ts.isVariableStatement(actions) && actions.declarationList.declarations[0];
  const call = ts.isExpressionStatement(installer) && installer.expression;
  const assignment = ts.isExpressionStatement(gui) && gui.expression;
  const props = ts.isCallExpression(call ?? {}) && call.arguments[1];
  const coreProperties = ['DB', 'Client', 'monsterPortrait', 'itemTable', 'currentMap', 'accountId', 'loadData'];
  if (!action || (actions.declarationList.flags & ts.NodeFlags.BlockScoped) !== ts.NodeFlags.Const || actions.declarationList.declarations.length !== 1
      || action.name.getText(file) !== 'lastroWorldMapActions' || !ts.isObjectLiteralExpression(action.initializer ?? {}) || action.initializer.properties.length
      || text.slice(actions.end, render.getStart(file)).trim() !== marker
      || !ts.isBinaryExpression(assignment ?? {}) || assignment.operatorToken.kind !== ts.SyntaxKind.EqualsToken
      || assignment.left.getText(file) !== 'WorldMap' || !ts.isNewExpression(assignment.right) || assignment.right.expression.getText(file) !== 'GUIComponent'
      || assignment.right.arguments?.length !== 2 || !ts.isStringLiteral(assignment.right.arguments[0]) || assignment.right.arguments[0].text !== 'WorldMap'
      || !ts.isStringLiteral(assignment.right.arguments[1])
      || !ts.isCallExpression(call ?? {}) || !ts.isParenthesizedExpression(call.expression)
      || !ts.isFunctionExpression(call.expression.expression) || call.expression.expression.name?.text !== 'installLastroWorldMap'
      || call.arguments.length !== 4 || call.arguments[0].getText(file) !== 'WorldMap'
      || !ts.isObjectLiteralExpression(props ?? {}) || props.properties.length !== 8
      || coreProperties.some((name, i) => props.properties[i].name?.getText(file) !== name)
      || !ts.isSpreadAssignment(props.properties[7]) || props.properties[7].expression.getText(file) !== 'lastroWorldMapActions'
      || !ts.isFunctionExpression(call.arguments[3]) || call.arguments[3].name?.text !== 'createWorldMapIndex'
      || statements[16].getText(file) !== 'WorldMap.mouseMode = GUIComponent.MouseMode.STOP;'
      || statements[17].getText(file) !== 'WorldMap_default = UIManager.addComponent(WorldMap);') fail('anchor:worldmap-product-actions');
  const portrait = props.properties[2].initializer;
  if (!ts.isCallExpression(portrait ?? {}) || !ts.isParenthesizedExpression(portrait.expression)
      || !ts.isFunctionExpression(portrait.expression.expression) || portrait.expression.expression.name?.text !== 'createMonsterPortraitLoader') fail('anchor:worldmap-product-actions');
  const expectedDeps = ts.createSourceFile('worldmap-deps.js', `const deps = {
    DB, Client,
    monsterPortrait: (createMonsterPortraitLoader)(Client, id => MonsterTable_default[id] ? DB.getBodyPath(id, 0) : null, document),
    itemTable: () => ItemTable_default,
    currentMap: () => MapRenderer.currentMap,
    accountId: () => SessionStorage_default.AID,
    loadData: async () => {
      const values = await Promise.all(["world-data", "mob-data"].map(async name => {
        const response = await fetch(new URL("../core/data/world/" + name + ".json", import.meta.url));
        if (!response.ok) throw new Error("World map data HTTP " + response.status);
        return response.json();
      }));
      return { worldData: values[0], mobData: values[1] };
    }
  };`, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const actualDepsText = 'const deps = {' + props.properties.slice(0, 7).map(node => node.getText(file)).join(',') + '};';
  const actualDeps = ts.createSourceFile('worldmap-actual-deps.js', actualDepsText.replace(portrait.expression.getText(file), '(createMonsterPortraitLoader)'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const printer = ts.createPrinter({ removeComments: true });
  const dependencyTokens = file => {
    function check(node) {
      if (node.kind === ts.SyntaxKind.RegularExpressionLiteral || ts.isTemplateExpression(node) || ts.isNoSubstitutionTemplateLiteral(node)) fail('anchor:worldmap-product-actions');
      ts.forEachChild(node, check);
    }
    check(file);
    const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, printer.printFile(file));
    const tokens = [];
    for (let kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFileToken; kind = scanner.scan()) tokens.push([kind, scanner.getTokenText()]);
    return JSON.stringify(tokens);
  };
  if (actualDeps.parseDiagnostics.length || dependencyTokens(actualDeps) !== dependencyTokens(expectedDeps)) fail('anchor:worldmap-product-actions');
  const injection = `const lastroWorldMapPreflight = (${createLastroTeleportPreflight.toString()})({
    getMap: () => MapRenderer.loading ? "" : normalizeLastROTeleportMap(MapRenderer.currentMap),
    getProfile: () => String(Configs.get("lastroNid", 0)) + ":" + String(Configs.get("clientVer", 0)),
    loadFile: ${teleportResourceLoaderCode()},
  });
  const lastroWorldMapTeleport = (${createLastroWorldMapTeleport.toString()})({
    preflight: lastroWorldMapPreflight,
    skipPreflight: true,
    getMap: () => MapRenderer.loading ? "" : normalizeLastROTeleportMap(MapRenderer.currentMap),
    getProfile: () => String(Configs.get("lastroNid", 0)) + ":" + String(Configs.get("clientVer", 0)),
    onSameMap: () => showLastroTeleportNotice("已在目标地图。"),
    showPrompt: (message, yes, no) => UIManager.showPromptBox(message, "ok", "cancel", yes, no),
    shouldConfirmTeleport: () => typeof getLastroTeleportConfirmationEnabled !== "function" || getLastroTeleportConfirmationEnabled(),
    send: mapname => {
      if (!PACKET.CZ.PRIVATE_AIRSHIP_REQUEST) throw new Error("当前客户端不支持传送");
      const pkt = new PACKET.CZ.PRIVATE_AIRSHIP_REQUEST();
      Object.assign(pkt, buildPrivateAirshipRequest({ mapname }));
      Network.sendPacket(pkt);
    },
    onError: error => {
      console.warn("[LastRO] World map teleport check failed", error);
      if (error?.resource) {
        const diagnostic = describeLastroMapLoadFailure("", error);
        UIManager.showErrorBox("传送失败：" + diagnostic.reason + "。\\n文件：" + error.resource);
      } else UIManager.showErrorBox(error.message || "传送地点检查失败，请重试。");
    },
  });
  WorldMap._lastroTeleport = lastroWorldMapTeleport;
  Object.assign(lastroWorldMapActions, {
    navigate: mapname => {
      if (typeof LastROTools !== "undefined") LastROTools?._lastroPanels?.cancelRoute();
      if (normalizeLastROTeleportMap(MapRenderer.currentMap) === normalizeLastROTeleportMap(mapname)) {
        showLastroTeleportNotice("已在目标地图。");
        return;
      }
      const position = SessionStorage_default.Entity?.position || [0, 0];
      Navigation_default.show();
      Navigation_default.navigateTo({ startMap: MapRenderer.currentMap, startX: position[0] | 0, startY: position[1] | 0, endMap: mapname, endX: 0, endY: 0, displayName: mapname });
    },
    teleport: (mapname, label) => {
      if (typeof LastROTools !== "undefined") LastROTools?._lastroPanels?.cancelRoute();
      return lastroWorldMapTeleport.request(mapname, label);
    },
    cancelTeleport: () => lastroWorldMapTeleport.cancelPending(),
  });`;
  const position = region.index + actions.end;
  return source.slice(0, position) + '\n  ' + injection + source.slice(position);
}


function replaceWorkerCreation(source) {
  const pattern = /if \(!_source\) _source = new Worker\(new URL\(\s*\/\* @vite-ignore \*\/\s*"" \+ new URL\("LastROThreadEventHandler\.js", import\.meta\.url\)\.href,\s*"" \+ import\.meta\.url\s*\), \{ type: "classic" \}\);/g;
  const matches = [...source.matchAll(pattern)];
  if (matches.length === 1) {
    const replacement = [
      'if (!_source) _source = new Worker(createLastROWorkerScriptUrl("LastROThreadEventHandler.js"), { type: "classic" });',
    ].join('\n');
    return source.replace(pattern, replacement);
  }
  return replaceOnceAny(source, [
    ['      if (!_source)\n        _source = new Worker(\n          new URL(\n            /* @vite-ignore */\n            "" +\n              new URL(\n                "LastROThreadEventHandler.js",\n                import.meta.url,\n              ).href,\n            "" + import.meta.url,\n          ),\n          { type: "classic" },\n        );',
      '      if (!_source) _source = new Worker(createLastROWorkerScriptUrl("LastROThreadEventHandler.js"), { type: "classic" });'],
  ]);
}

function replacePathFindingWorkerCreation(source) {
  return replaceOnceAny(source, [
    ['const workerUrl = new URL("PathFindingWorker.js", import.meta.url).href;',
      'const workerUrl = createLastROWorkerScriptUrl("PathFindingWorker.js");'],
    ['    const workerUrl = new URL(\n      "PathFindingWorker.js",\n      import.meta.url,\n    ).href;',
      '    const workerUrl = createLastROWorkerScriptUrl("PathFindingWorker.js");'],
  ]);
}


/**
 * Remove legacy html2canvas script injection paths. IWA Trusted Types blocks
 * dynamic TrustedScriptURL assignments, and these proxy/FlashCanvas branches
 * are obsolete in the canvas-capable browser runtime.
 */
export function patchLegacyScriptSinks(source) {
  const file = ts.createSourceFile('Online.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const proxyFunctions = [];
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'proxyGetImage') proxyFunctions.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (proxyFunctions.length === 1) {
    const node = proxyFunctions[0];
    const bodyStart = node.body.getStart(file);
    source = source.slice(0, bodyStart) + `{
    imageObj.succeeded = false;
    images.numLoaded++;
    images.numFailed++;
    start();
  }` + source.slice(node.body.end);
  } else if (proxyFunctions.length > 1) {
    fail('function:proxyGetImage');
  }
  const branch = /}\s*else if \(options\.flashcanvas !== undefined\) \{[\s\S]*?(?=\n\s*methods = \{)/;
  if (branch.test(source)) {
    source = source.replace(branch, '} else {\n\t\t\t\tcanvasReadyToDraw = false;\n\t\t\t}');
  }
  if (/createElement\(\s*["']script["']\s*\)/.test(source)
    || /(?:\.src|setAttribute\(\s*["']src["'])\s*=?.*(?:proxy|flashcanvas)/i.test(source)) {
    fail('legacy-script-sink');
  }
  return source;
}

export function patchGuildEmblemRequestCallbacks(source) {
  const callback = 'this.onSuccess(entry.guildId, entry.version, entry.image, entry.gif);';
  const replacement = 'this.onSuccess(entry.guildId, entry.image, entry.gif);';
  const count = source.split(callback).length - 1;
  if (count === 0) return source;
  if (count !== 1) fail('anchor:guild-emblem-onSuccess');
  return source.replace(callback, replacement);
}

export function patchTrustedTypesDomWrites(source) {
  const file = ts.createSourceFile('runtime.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const edits = [];
  function visit(node) {
    if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left)
      && node.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken
      && node.left.name.text === 'innerHTML') {
      edits.push({
        start: node.getStart(file),
        end: node.end,
        text: `setLastROAdjacentHTML(${node.left.expression.getText(file)}, "beforeend", ${node.right.getText(file)})`,
      });
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && ts.isPropertyAccessExpression(node.left)) {
      const property = node.left.name.text;
      const helper = property === 'innerHTML' ? 'setLastROInnerHTML'
        : property === 'outerHTML' ? 'setLastROOuterHTML' : undefined;
      if (helper) edits.push({
        start: node.getStart(file),
        end: node.end,
        text: `${helper}(${node.left.expression.getText(file)}, ${node.right.getText(file)})`,
      });
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
      && node.expression.name.text === 'insertAdjacentHTML' && node.arguments.length === 2) {
      edits.push({
        start: node.getStart(file),
        end: node.end,
        text: `setLastROAdjacentHTML(${node.expression.expression.getText(file)}, ${node.arguments[0].getText(file)}, ${node.arguments[1].getText(file)})`,
      });
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
      && node.expression.name.text === 'parseFromString' && node.arguments.length === 2
      && ts.isStringLiteral(node.arguments[1]) && node.arguments[1].text === 'application/xml') {
      edits.push({
        start: node.getStart(file),
        end: node.end,
        text: `parseLastROXML(${node.expression.expression.getText(file)}, ${node.arguments[0].getText(file)})`,
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (!edits.length) return source;
  edits.sort((left, right) => right.start - left.start);
  let output = source;
  for (const edit of edits) output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  if (!/from ["']\.\/lastro-trusted-dom\.mjs["']/.test(output)) {
    output = `import { setLastROAdjacentHTML, setLastROInnerHTML, setLastROOuterHTML } from "./lastro-trusted-dom.mjs";\n${output}`;
  }
  if (edits.some(edit => edit.text.startsWith('parseLastROXML('))
    && !/import\s*\{[^}]*\bparseLastROXML\b[^}]*\}\s*from ["']\.\/lastro-trusted-dom\.mjs["']/.test(output)) {
    output = `import { parseLastROXML } from "./lastro-trusted-dom.mjs";\n${output}`;
  }
  return output;
}

function patchLuaValueFailure(source) {
  const file = ts.createSourceFile('Online.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const loader = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === 'loadLuaValue');
  if (loader.length !== 1) fail('function:loadLuaValue');
  const calls = [];
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
      && node.expression.getText(file) === 'Client.loadFile' && node.arguments.length === 2) calls.push(node);
    ts.forEachChild(node, visit);
  }
  visit(loader[0]);
  if (calls.length !== 1) fail('anchor:loadLuaValue-loadFile');
  const end = calls[0].arguments.end;
  return source.slice(0, end) + `, function(error) {
      console.error("[loadLuaValue] Failed to load " + file_path, error);
      if (onEnd) onEnd.call();
    }` + source.slice(end);
}

export function patchLuaJsonEscapes(source) {
  const anchor = String.raw`return str:gsub("\\", "\\\\"):gsub("\"", "\\\"")`;
  if (!source.includes('local function escape_str')) return source;
  const replacement = String.raw`return str
                  :gsub("\\", "\\\\")
                  :gsub("\"", "\\\"")
                  :gsub("\b", "\\b")
                  :gsub("\f", "\\f")
                  :gsub("\n", "\\n")
                  :gsub("\r", "\\r")
                  :gsub("\t", "\\t")
                  :gsub("%c", function(char)
                    return string.format("\\u%04x", string.byte(char))
                  end)`;
  return replaceOnce(source, anchor, replacement);
}

export function patchNpcMenuBlankArea(source) {
  const mousedownAnchor = 'if (div && content.contains(div)) selectIndex(div);';
  const dblclickAnchor = 'if (div && content.contains(div)) validate();';
  let output = source;
  if (output.includes(mousedownAnchor)) {
    output = replaceOnce(output, mousedownAnchor,
      'if (!div?.dataset?.index || !content.contains(div)) return;\n        selectIndex(div);');
  }
  if (output.includes(dblclickAnchor)) {
    output = replaceOnce(output, dblclickAnchor,
      'if (div?.dataset?.index && content.contains(div)) validate();');
  }
  return output;
}

export function patchAchievementClaimButton(source) {
  const lineBreak = String.raw`\r\n`;
  const claimMarker = 'd-claim-btn js-d-claim';
  // Some focused patch tests use a minimal runtime fixture without the
  // optional achievement component. Leave those fixtures untouched; when the
  // component exists, all of its anchors remain strict below.
  if (!source.includes(claimMarker)) return source;
  if (count(source, claimMarker) !== 1) fail('anchor:achievement-claim-template');
  const claimIndex = source.indexOf(claimMarker);
  const buttonStart = source.lastIndexOf('<ui-button', claimIndex);
  const styleIndex = source.indexOf('display: none', claimIndex);
  const styleEnd = source.indexOf(lineBreak, styleIndex);
  const buttonEndMarker = '</ui-button>';
  const buttonEnd = source.indexOf(buttonEndMarker, claimIndex);
  if (buttonStart < 0 || styleIndex < 0 || styleEnd < 0 || buttonEnd < 0 || buttonEnd < styleEnd) {
    fail('anchor:achievement-claim-template');
  }
  // The HTML is embedded in a JavaScript string and contains literal escaped
  // CR/LF sequences. Keep the existing prefix and replace only the missing
  // asset-backed button body so this works across bundle formatting variants.
  source = source.slice(0, buttonStart)
    + source.slice(buttonStart, styleEnd + lineBreak.length)
    + '\t\t>领取奖励</ui-button>'
    + source.slice(buttonEnd + buttonEndMarker.length);

  const cssMarker = '.detail-view .d-claim-btn';
  if (count(source, cssMarker) !== 1) fail('anchor:achievement-claim-css');
  const cssStart = source.indexOf(cssMarker);
  const scrollbarMarker = '/* Scrollbar area */';
  const scrollbarStart = source.indexOf(scrollbarMarker, cssStart);
  if (scrollbarStart < 0) fail('anchor:achievement-claim-css');
  const cssBlock = [
    '.detail-view .d-claim-btn {',
    '\tposition: absolute;',
    '\tbottom: 10px;',
    '\tright: 10px;',
    '\tleft: auto;',
    '\twidth: 110px;',
    '\theight: 26px;',
    '\tdisplay: none;',
    '\talign-items: center;',
    '\tjustify-content: center;',
    '\tbox-sizing: border-box;',
    '\tpadding: 0 8px;',
    '\tborder: 1px solid #80652f;',
    '\tborder-radius: 2px;',
    '\tbackground: #e8d08c;',
    '\tcolor: #3b2a12;',
    '\tfont-size: 11px;',
    '\tfont-weight: bold;',
    '\tline-height: 18px;',
    '\ttext-align: center;',
    '\tcursor: pointer;',
    '\ttext-shadow: 1px 1px 0 #fff4cf;',
    '}',
    '',
    '.detail-view .d-claim-btn:hover {',
    '\tbackground: #f3dfaa;',
    '}',
    '',
    '.detail-view .d-claim-btn:active {',
    '\tbackground: #d8bb70;',
    '}',
  ].join('\r\n');
  // JSON.stringify provides the correct escaping for the surrounding JS
  // string, including CR/LF and CSS quotes.
  const encodedCssBlock = JSON.stringify(cssBlock).slice(1, -1);
  source = source.slice(0, cssStart)
    + encodedCssBlock
    + lineBreak + lineBreak
    + source.slice(scrollbarStart);

  const clickAnchors = [
    ['const allAch = DB.getAchievementTable();\n          const sessAch =\n            SessionStorage_default.Achievement &&\n            SessionStorage_default.Achievement.list\n              ? SessionStorage_default.Achievement.list\n              : {};\n          const info = allAch[this.selectedAchId];\n          const state = sessAch[this.selectedAchId];\n          const canClaim =\n            this.selectedAchId !== null &&\n            this.claimingAchId !== this.selectedAchId &&\n            hasAchievementReward(info && info.reward) &&\n            !!state &&\n            !!(state.completed || state.Completed) &&\n            !(state.reward || state.rewarded);\n          if (canClaim) {',
      'const claimId = this.selectedAchId;\n          if (claimId !== null) {'],
  ];
  if (count(source, clickAnchors[0][0]) === 1) source = source.replace(clickAnchors[0][0], clickAnchors[0][1]);
  else if (!source.includes('const claimId = this.selectedAchId;')) fail('anchor:achievement-claim-click');
  source = source.replace(
    'this.claimingAchId = this.selectedAchId;\n            const pkt = new PACKET.CZ.REQ_ACH_REWARD();\n            pkt.achievementID = this.selectedAchId;',
    'this.claimingAchId = claimId;\n            const pkt = new PACKET.CZ.REQ_ACH_REWARD();\n            pkt.achievementID = claimId;',
  );

  const emptyDetailDisplayAnchor = 'root.querySelector(".js-d-claim").style.display = "none";';
  if (count(source, emptyDetailDisplayAnchor) === 1) {
    source = source.replace(
      emptyDetailDisplayAnchor,
      'root.querySelector(".js-d-claim").textContent = "领取奖励";\n'
        + '        root.querySelector(".js-d-claim").disabled = false;\n'
        + '        root.querySelector(".js-d-claim").style.display = "flex";',
    );
  } else if (!source.includes('root.querySelector(".js-d-claim").style.display = "flex";')) {
    fail('anchor:achievement-claim-empty-detail-display');
  }

  const displayAnchors = [
    ['const canClaim = hasAchievementReward(info.reward) &&\n        !!s &&\n        !!(s.completed || s.Completed) &&\n        !(s.reward || s.rewarded);\n      claimBtn.textContent = "领取奖励";\n      claimBtn.style.display = canClaim ? "flex" : "none";',
      'claimBtn.textContent = "领取奖励";\n      claimBtn.disabled = false;\n      claimBtn.style.display = "flex";'],
    ['if (canClaim)\n        claimBtn.style.display = "";\n      else claimBtn.style.display = "none";',
      'claimBtn.textContent = "领取奖励";\n      claimBtn.disabled = false;\n      claimBtn.style.display = "flex";'],
  ];
  if (count(source, displayAnchors[0][0]) === 1) source = source.replace(displayAnchors[0][0], displayAnchors[0][1]);
  else if (count(source, displayAnchors[1][0]) === 1) source = source.replace(displayAnchors[1][0], displayAnchors[1][1]);
  else if (source.includes('claimBtn.style.display = hasReward ? "flex" : "none";')) return source;
  else fail('anchor:achievement-claim-display');
  return source;
}

export function patchRuntimeChatMapLinks(source) {
  const file = ts.createSourceFile('Online.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const edits = [];
  let requestCount = 0, renderCount = 0, overrideCount = 0, clickCount = 0, inputCount = 0, itemCount = 0, announceCount = 0, broadcastInputCount = 0, playerNoticeCount = 0, npcNoticeCount = 0;
  function visit(node, scope = '') {
    if (ts.isFunctionDeclaration(node)) scope = node.name?.text ?? scope;
    if (ts.isFunctionDeclaration(node) && ['onPlayerMessage', 'onEntityTalkColor'].includes(node.name?.text)) {
      if (node.name.text === 'onPlayerMessage') playerNoticeCount++;
      else npcNoticeCount++;
      edits.push({ start: node.body.getStart(file) + 1, end: node.body.getStart(file) + 1, text: `
  if (Configs.get("lastroProtocol", false)) {
    const lastroMessage = LastROChatMapLinks.serverMessage(pkt.msg);
    if (lastroMessage !== null) {
      if (typeof CardConnection2 !== "undefined") CardConnection2?._lastroCardDeck?.onServerNotice(lastroMessage);
      init_Announce();
      Announce_default.append();
      Announce_default.set(LastROChatMapLinks.plainText(lastroMessage), "#FFFF00", { life: 5000 });
      ChatBox_default.addText(lastroMessage, ChatBox_default.TYPE.ANNOUNCE, ChatBox_default.FILTER.PUBLIC_LOG);
      return false;
    }
  }
` });
    }
    if (ts.isBinaryExpression(node) && node.left.getText(file) === 'ChatBox.addText') {
      scope = 'ChatBox.addText';
      if (!ts.isFunctionExpression(node.right) || !node.right.body) fail('anchor:chat-input');
      inputCount++;
      edits.push({ start: node.right.body.getStart(file) + 1, end: node.right.body.getStart(file) + 1, text: '\n    text = LastROChatMapLinks.normalize(text);' });
    }
    if (ts.isCallExpression(node) && scope === 'ChatBox.addText' && node.expression.getText(file) === 'text.replace'
      && node.arguments[0]?.getText(file).includes('ITEMLINK') && node.arguments[1]) {
      itemCount++;
      edits.push({ start: node.arguments[1].getStart(file), end: node.arguments[1].end, text: `function (match) {
        const html = LastROChatMapLinks.formatItemLink(match, () => DB.parseItemLink(match));
        if (!html) return "[物品信息暂不可用]";
        override = true;
        return html;
      }` });
    }
    if (ts.isCallExpression(node) && scope === 'onGlobalAnnounce' && node.expression.getText(file) === 'Announce_default.set' && node.arguments[0]) {
      announceCount++;
      edits.push({ start: node.arguments[0].getStart(file), end: node.arguments[0].end, text: `LastROChatMapLinks.plainText(${node.arguments[0].getText(file)})` });
    }
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'requestChatMapTeleport') {
      requestCount++;
      edits.push({ start: node.body.getStart(file), end: node.body.end, text: '{ return LastROChatMapLinks.request(link); }' });
    }
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'onGlobalAnnounce') {
      broadcastInputCount++;
      edits.push({ start: node.body.getStart(file) + 1, end: node.body.getStart(file) + 1, text: '\n  pkt.msg = LastROChatMapLinks.serverMessage(pkt.msg) ?? LastROChatMapLinks.normalize(pkt.msg);\n  if (!pkt.msg) return;' });
    }
    if (ts.isIfStatement(node) && scope === 'flushMessageBuffer' && node.expression.getText(file) === '!msg.override'
      && node.thenStatement.getText(file).includes('div.textContent') && node.elseStatement?.getText(file).includes('div.innerHTML')) {
      renderCount++;
      edits.push({ start: node.getStart(file), end: node.end, text: 'LastROChatMapLinks.render(div, msg.text, msg.override);' });
    }
    if (ts.isIfStatement(node) && scope === 'ChatBox.addText' && node.expression.getText(file).includes('mapname')
      && node.thenStatement.getText(file) === 'override = true;') {
      overrideCount++;
      edits.push({ start: node.getStart(file), end: node.end, text: '' });
    }
    if (ts.isIfStatement(node) && node.expression.getText(file) === 'requestChatMapTeleport(mapLink)') {
      clickCount++;
      edits.push({ start: node.getStart(file), end: node.end, text: 'event.preventDefault();\n            event.stopImmediatePropagation();\n            requestChatMapTeleport(mapLink);' });
    }
    ts.forEachChild(node, child => visit(child, scope));
  }
  visit(file);
  if ([requestCount, renderCount, overrideCount, clickCount, inputCount, itemCount, announceCount, broadcastInputCount, playerNoticeCount, npcNoticeCount].some(value => value !== 1)) fail('anchor:chat-map-links');
  edits.sort((a, b) => b.start - a.start);
  for (const edit of edits) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  return `const LastROChatMapLinks = (${createLastroChatMapLinks.toString()})({
  setHtml: (parent, html) => setLastROInnerHTML(parent, html),
  showPrompt: (message, yes, no) => UIManager.showPromptBox(message, "ok", "cancel", yes, no),
  shouldConfirmTeleport: () => typeof getLastroTeleportConfirmationEnabled !== "function" || getLastroTeleportConfirmationEnabled(),
  getMap: () => typeof MapRenderer !== "undefined" && !MapRenderer.loading ? normalizeLastROTeleportMap(MapRenderer.currentMap) : "",
  canTeleport: () => !!PACKET?.CZ?.PRIVATE_AIRSHIP_REQUEST && typeof MapRenderer !== "undefined" && !MapRenderer.loading && !!normalizeLastROTeleportMap(MapRenderer.currentMap),
  navigate: target => {
    init_SessionStorage(); init_Altitude();
    const position = SessionStorage_default.Entity?.position;
    const currentMap = normalizeLastROTeleportMap(MapRenderer.currentMap);
    if (MapRenderer.loading || currentMap !== target.mapname || !position || !Number.isFinite(position[0]) || !Number.isFinite(position[1]) || !(Altitude.width > 0) || !(Altitude.height > 0)) {
      showLastroTeleportNotice("当前地图尚未就绪，请稍后再试。");
      return;
    }
    if (target.x >= Altitude.width || target.y >= Altitude.height) {
      showLastroTeleportNotice("目标坐标超出地图范围，无法前往。");
      return;
    }
    if (typeof LastROTools !== "undefined") LastROTools?._lastroPanels?.cancelRoute();
    init_Navigation();
    return Navigation_default.navigateTo({startMap: currentMap, startX: Math.round(position[0]), startY: Math.round(position[1]), endMap: target.mapname, endX: target.x, endY: target.y, showWindow: false});
  },
  onError: error => console.warn("[LastRO] Notification recovered from an error", error),
  teleport: target => {
    const packet = new PACKET.CZ.PRIVATE_AIRSHIP_REQUEST();
    // Activity coordinates use the official notification handler's type 1.
    Object.assign(packet, buildPrivateAirshipRequest({ ...target, type: 1 }));
    Network.sendPacket(packet);
  },
});\n${source}`;
}

export function patchNavigationPendingTargets(source) {
  const file = ts.createSourceFile('Online.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const functions = [], waiters = [];
  function visit(node) {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && node.left.getText(file) === 'Navigation.navigateTo' && ts.isFunctionExpression(node.right)) functions.push(node.right);
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && node.left.getText(file) === 'Navigation.waitForMapData' && ts.isFunctionExpression(node.right)) waiters.push(node.right);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (functions.length !== 1 || waiters.length !== 1) fail('anchor:navigation-pending-targets');
  const navigation = functions[0], assignments = [], callbacks = [];
  function findAnchors(node) {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && ts.isIdentifier(node.left) && node.left.text === '_finalTargetData') assignments.push(node);
    if (ts.isCallExpression(node) && node.expression.getText(file) === 'this.waitForMapData') callbacks.push(node);
    if (ts.isIdentifier(node) && node.text === 'lastroNavigationPendingTarget') fail('anchor:navigation-pending-targets');
    ts.forEachChild(node, findAnchors);
  }
  findAnchors(navigation.body);
  const assignment = assignments[0], callback = callbacks[0]?.arguments[0];
  if (assignments.length !== 1 || callbacks.length !== 1 || !ts.isObjectLiteralExpression(assignment.right)
    || !ts.isExpressionStatement(assignment.parent) || assignment.parent.parent !== navigation.body
    || !callback || !ts.isFunctionExpression(callback) || !callback.body
    || callback.getStart(file) <= assignment.end) fail('anchor:navigation-pending-targets');
  const waiter = waiters[0], recursiveCalls = [];
  function findRecursion(node) {
    if (ts.isCallExpression(node) && node.expression.getText(file) === 'Navigation.waitForMapData') recursiveCalls.push(node);
    if (ts.isIdentifier(node) && node.text === 'lastroNavigationWaitingTarget') fail('anchor:navigation-pending-targets');
    ts.forEachChild(node, findRecursion);
  }
  findRecursion(waiter.body);
  const parameter = waiter.parameters[0], recursive = recursiveCalls[0];
  if (waiter.parameters.length !== 1 || !ts.isIdentifier(parameter.name) || parameter.name.text !== 'callback'
    || parameter.initializer || recursiveCalls.length !== 1 || recursive.arguments.length !== 1
    || recursive.arguments[0].getText(file) !== 'callback') fail('anchor:navigation-pending-targets');
  const edits = [
    { start: assignment.parent.end, text: '\n    const lastroNavigationPendingTarget = _finalTargetData;' },
    { start: callback.body.getStart(file) + 1, text: '\n        if (_finalTargetData !== lastroNavigationPendingTarget) return;' },
    { start: parameter.end, text: ', lastroNavigationWaitingTarget = _finalTargetData' },
    { start: waiter.body.getStart(file) + 1, text: '\n    if (lastroNavigationWaitingTarget !== _finalTargetData) return;' },
    { start: recursive.arguments[0].end, text: ', lastroNavigationWaitingTarget' },
  ].sort((a, b) => b.start - a.start);
  for (const edit of edits) source = source.slice(0, edit.start) + edit.text + source.slice(edit.start);
  return source;
}

export function patchRuntimeToolsPanels(source) {
  const file = ts.createSourceFile('Online.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const anchors = [], transitions = [], cleanups = [], dragCancels = [];
  function visit(node, scope = '') {
    if (ts.isFunctionDeclaration(node)) scope = node.name?.text ?? scope;
    if (ts.isMethodDeclaration(node) && node.name?.getText(file) === 'setMap' && ts.isClassExpression(node.parent) && node.parent.name?.text === 'MapRenderer') scope = 'MapRenderer.setMap';
    if (ts.isCallExpression(node) && node.expression.getText(file) === 'UIManager.addComponent' && node.arguments[0]?.getText(file) === 'LastROTools') anchors.push(node);
    if (ts.isCallExpression(node) && scope === 'MapRenderer.setMap' && node.expression.getText(file) === 'UIManager.removeComponents') transitions.push(node);
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'cleanGameUI') cleanups.push(node);
    if (scope === 'cleanGameUI' && ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)
      && node.expression.arguments.length === 0 && !node.expression.questionDotToken
      && ts.isPropertyAccessExpression(node.expression.expression)
      && node.expression.expression.name.text === 'cancel' && node.expression.expression.questionDotToken
      && ts.isPropertyAccessExpression(node.expression.expression.expression)
      && !node.expression.expression.expression.questionDotToken
      && node.expression.expression.expression.name.text === '_lastroItemDrag'
      && ts.isIdentifier(node.expression.expression.expression.expression)
      && node.expression.expression.expression.expression.text === 'document') dragCancels.push(node);
    ts.forEachChild(node, child => visit(child, scope));
  }
  visit(file);
  if (anchors.length !== 1 || transitions.length !== 1 || cleanups.length !== 1 || dragCancels.length !== 1
    || dragCancels[0].parent !== cleanups[0].body) fail('anchor:lastro-tools-panels');
  const anchor = anchors[0];
  const install = `const lastroSendRouteTeleport = point => {
    if (!PACKET?.CZ?.PRIVATE_AIRSHIP_REQUEST) throw new Error("当前客户端不支持传送");
    const packet = new PACKET.CZ.PRIVATE_AIRSHIP_REQUEST();
    Object.assign(packet, buildPrivateAirshipRequest({mapname: normalizeLastROTeleportMap(point[0]), x: point[1], y: point[2], type: 1}));
    Network.sendPacket(packet);
    if (Navigation_default?.__loaded) Navigation_default.clear();
  };
  const lastroRouteNavigation = (${createLastroTeleportNavigation.toString()})({
    getMap: () => normalizeLastROTeleportMap(MapRenderer.currentMap),
    getPosition: () => SessionStorage_default.Entity?.position,
    clock: globalThis,
    sendTeleport: lastroSendRouteTeleport,
    stopNavigation: () => { if (Navigation_default?.__loaded) Navigation_default.clear(); },
    navigate: point => {
      const position = SessionStorage_default.Entity?.position;
      if (!position || !Navigation_default?.navigateTo) throw new Error("当前地图尚未就绪");
      return Navigation_default.navigateTo({startMap: MapRenderer.currentMap, startX: position[0], startY: position[1], endMap: point[0], endX: point[1], endY: point[2], showWindow: false});
    },
    setStatus: message => LastROTools._lastroPanels?.setStatus(message),
  });
  const lastroRoutePreflight = (${createLastroTeleportPreflight.toString()})({
    getMap: () => MapRenderer.loading ? "" : normalizeLastROTeleportMap(MapRenderer.currentMap),
    getProfile: () => String(Configs.get("lastroNid", 0)) + ":" + String(Configs.get("clientVer", 0)),
    loadFile: ${teleportResourceLoaderCode()},
  });
  const lastroVerifiedRouteRequest = (${createLastroVerifiedTeleportRequest.toString()})({
    sendTeleport: lastroSendRouteTeleport,
    preflight: lastroRoutePreflight, navigation: lastroRouteNavigation,
    getMap: () => MapRenderer.loading ? "" : normalizeLastROTeleportMap(MapRenderer.currentMap),
    getProfile: () => String(Configs.get("lastroNid", 0)) + ":" + String(Configs.get("clientVer", 0)),
    clearNavigation: () => {
      WorldMap_default?._lastroTeleport?.cancelPending();
      if (Navigation_default?.__loaded) Navigation_default.clear();
    },
  });
  LastROTools._lastroQuestRoute = lastroVerifiedRouteRequest;
  LastROTools._lastroTeleportRejected = message => lastroRouteNavigation.onTeleportRejected(message);
  const lastroNativeShortcutEntry = (${captureLastroShortcutEntry.toString()})(LastROTools);
  (${installLastroToolsPanels.toString()})(LastROTools, {
    document: globalThis.document, window: globalThis, GUIComponent, UIManager,
    setHtml: setLastROInnerHTML,
    normalizeRoute: normalizeRouteEntry,
    requestRoute: route => lastroVerifiedRouteRequest.request(route, { skipPreflight: true }),
    cancelPendingRoute: () => lastroVerifiedRouteRequest.cancelPending(),
    routeMapChanging: () => { lastroVerifiedRouteRequest.cancelPending(); lastroRouteNavigation.onMapChanging(); },
    routeMapChanged: () => lastroRouteNavigation.onMapChanged(),
    cancelRoute: () => lastroVerifiedRouteRequest.cancel(),
    showPrompt: (message, yes, no) => UIManager.showPromptBox(message, "ok", "cancel", yes, no),
    setTeleportConfirmationEnabled: enabled => setLastroTeleportConfirmationEnabled(enabled),
    shouldConfirmTeleport: () => typeof getLastroTeleportConfirmationEnabled !== "function" || getLastroTeleportConfirmationEnabled(),
    getPresetRoutes: () => {
      const catalog = LastROTeleportPresets.profiles[Configs.get("clientVer", 0)];
      return catalog ? { ...catalog, custom: { ...LastROTeleportPresets.upstreamCustomRoutes, ...catalog.custom } } : {};
    },
    getProfile: () => Configs.get("lastroNid", 0),
    getCurrentLocation: () => {
      const position = SessionStorage_default.Entity?.position;
      const map = normalizeLastROTeleportMap(MapRenderer.currentMap);
      if (MapRenderer.loading || !map || !position
          || !Number.isFinite(position[0]) || !Number.isFinite(position[1])) return;
      return { map, x: Math.floor(position[0]), y: Math.floor(position[1]) };
    },
    loadPreferences: () => {
      const key = "LastROTeleportOrder:" + Configs.get("lastroNid", 0);
      return Preferences.get(key, { _key: key, _version: 1, orders: {} }, 1);
    },
    createKoreShell,
    getKoreHost: () => globalThis.KoreEngine,
  }, ${JSON.stringify(LASTRO_TOOLS_CSS)});
  (${installLastroShortcutEntry.toString()})(LastROTools, lastroNativeShortcutEntry, {
    document: globalThis.document, setHtml: setLastROInnerHTML,
    getEnabled: getLastroShortcutEntryEnabled,
    normalizeRoute: normalizeRouteEntry,
    requestRoute: route => LastROTools._lastroPanels.requestCustomRoute(route),
  });
  (${installKoreShellPanels.toString()})(LastROTools, {
    document: globalThis.document, window: globalThis, setHtml: setLastROInnerHTML,
    createKoreShell, getKoreHost: () => globalThis.KoreEngine,
    shellCss: ${JSON.stringify(KORE_SHELL_CSS)},
  });\n  `;
  const edits = [
    { start: anchor.getStart(file), text: 'init_Preferences$1();\n  ' + install },
    { start: transitions[0].getStart(file), text: 'if (typeof LastROTools !== "undefined") LastROTools?._lastroPanels?.onMapChanging();\n      ' },
    { start: dragCancels[0].end, text: '\n  if (typeof LastROTools !== "undefined") LastROTools?._lastroPanels?.cancelRoute();' },
  ].sort((a, b) => b.start - a.start);
  for (const edit of edits) source = source.slice(0, edit.start) + edit.text + source.slice(edit.start);
  return `const LastROTeleportPresets = ${JSON.stringify({ profiles: teleportRoutes.profiles, upstreamCustomRoutes: teleportRoutes.upstreamCustomRoutes })};\n` + patchNavigationPendingTargets(source);
}

export function patchRuntimeShortcutSettings(source) {
  const file = ts.createSourceFile('Online.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const anchors = [];
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(file) === 'UIManager.addComponent'
        && node.arguments[0]?.getText(file) === 'GraphicsOption') anchors.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (anchors.length !== 1) fail('anchor:lastro-shortcut-settings');
  const call = anchors[0];
  const parent = call.parent;
  // Native registration assigns the returned GUI to GraphicsOption_default.
  // Insert before that whole statement so Escape keeps its append/remove target.
  const statement = ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
    && parent.left.getText(file) === 'GraphicsOption_default' && parent.right === call ? parent.parent : parent;
  if (!ts.isExpressionStatement(statement) || statement.expression !== call && statement.expression !== parent
    || !ts.isBlock(statement.parent) && !ts.isSourceFile(statement.parent)) fail('anchor:lastro-shortcut-settings:statement');
  const helpers = [], declarations = [], preferences = [], appends = [];
  function findPermanentOwners(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'lastroUiWindowAppend') helpers.push(node);
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === '_preferences$32') declarations.push(node);
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      if (node.left.getText(file) === '_preferences$32') preferences.push(node);
      if (node.left.getText(file) === 'GraphicsOption.onAppend') appends.push(node);
    }
    ts.forEachChild(node, findPermanentOwners);
  }
  findPermanentOwners(file);
  const helper = helpers[0], nativePreference = preferences[0], append = appends[0];
  if (helpers.length !== 1 || declarations.length !== 1 || preferences.length !== 1 || appends.length !== 1
    || helper.parameters.map(parameter => parameter.name.getText(file)).join(',') !== 'component,preferences,append,snapshot,options'
    || helper.parameters[4].initializer?.getText(file) !== '{}'
    || !ts.isCallExpression(nativePreference.right) || nativePreference.right.expression.getText(file) !== 'Preferences.get'
    || nativePreference.right.arguments.length !== 3 || nativePreference.right.arguments[0].text !== 'GraphicsOption'
    || nativePreference.right.arguments[2].getText(file) !== '1.1'
    || nativePreference.parent.parent !== statement.parent || append.parent.parent !== statement.parent
    || !ts.isFunctionExpression(append.right) || append.right.parameters.length !== 0
    || append.right.asteriskToken || append.right.modifiers?.length
    || append.right.body.statements.length !== 1) fail('anchor:lastro-shortcut-settings:ui-state');
  const returned = append.right.body.statements[0];
  const zeroArgumentBlockArrow = node => ts.isArrowFunction(node) && node.parameters.length === 0
    && !node.modifiers?.length && ts.isBlock(node.body);
  if (!ts.isReturnStatement(returned) || !returned.expression || !ts.isCallExpression(returned.expression)
    || returned.expression.questionDotToken || returned.expression.expression.getText(file) !== 'lastroUiWindowAppend'
    || returned.expression.arguments.length !== 4 || returned.expression.arguments[0].getText(file) !== 'this'
    || returned.expression.arguments[1].getText(file) !== '_preferences$32'
    || !zeroArgumentBlockArrow(returned.expression.arguments[2]) || !zeroArgumentBlockArrow(returned.expression.arguments[3])
    || returned.expression.arguments[3].body.statements.map(node => node.getText(file)).join('\n')
      !== '_preferences$32.x = parseInt(this._host.style.left, 10);\n_preferences$32.y = parseInt(this._host.style.top, 10);') {
    fail('anchor:lastro-shortcut-settings:ui-state');
  }
  function serializeSettingsInstaller(factory, expectedStatements) {
    const text = factory.toString();
    const installerFile = ts.createSourceFile('settings.js', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const matches = [];
    function findAppend(node) {
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && node.left.getText(installerFile) === 'component.onAppend') matches.push(node.right);
      ts.forEachChild(node, findAppend);
    }
    findAppend(installerFile);
    const fn = matches[0];
    if (matches.length !== 1 || !ts.isFunctionExpression(fn) || fn.parameters.length !== 1
      || fn.asteriskToken || fn.modifiers?.length
      || !fn.parameters[0].dotDotDotToken || fn.parameters[0].name.getText(installerFile) !== 'args'
      || fn.body.statements.map(node => node.getText(installerFile)).join('\n') !== expectedStatements.join('\n')) {
      fail('anchor:lastro-shortcut-settings:installer-append');
    }
    const body = `{ return lastroUiWindowAppend(this, _preferences$32, () => {${fn.body.getText(installerFile).slice(1, -1)}
}, () => {_preferences$32.x = parseFloat(this._host.style.left) || 0; _preferences$32.y = parseFloat(this._host.style.top) || 0;
}); }`;
    return text.slice(0, fn.body.getStart(installerFile)) + body + text.slice(fn.body.end);
  }
  const shortcutInstaller = serializeSettingsInstaller(installLastroShortcutSettings, ['originalAppend?.apply(this, args);', 'sync();']);
  const teleportInstaller = serializeSettingsInstaller(installLastroTeleportSettings, ['const result = originalAppend?.apply(this, args);', 'sync();', 'return result;']);
  const install = `(${shortcutInstaller})(GraphicsOption, {
    document: globalThis.document,
    getEnabled: getLastroShortcutEntryEnabled,
    setEnabled: setLastroShortcutEntryEnabled,
    onError: () => UIManager.showErrorBox("快捷入口设置保存失败，请重试。"),
  });
  (${teleportInstaller})(GraphicsOption, {
    document: globalThis.document,
    getEnabled: getLastroTeleportConfirmationEnabled,
    setEnabled: setLastroTeleportConfirmationEnabled,
    onError: () => UIManager.showErrorBox("传送确认设置保存失败，请重试。"),
  });\n  `;
  const anchor = statement.getStart(file);
  const preference = `let lastroShortcutEntryPreferences;
function getLastroShortcutEntryPreferences() {
  init_Preferences$1();
  if (!lastroShortcutEntryPreferences) {
    const defaults = { _key: "LastROShortcutEntry", _version: 1, enabled: true };
    try { lastroShortcutEntryPreferences = Preferences.get("LastROShortcutEntry", defaults, 1); }
    catch { lastroShortcutEntryPreferences = { ...defaults, save() { Preferences.save(this); } }; }
  }
  return lastroShortcutEntryPreferences;
}
function getLastroShortcutEntryEnabled() {
  return getLastroShortcutEntryPreferences().enabled !== false;
}
async function setLastroShortcutEntryEnabled(enabled) {
  const preferences = getLastroShortcutEntryPreferences();
  const next = { ...preferences, enabled: enabled === true };
  if (typeof next.save !== "function" || await next.save.call(next) === false) throw new Error("Shortcut preference was not saved");
  preferences.enabled = next.enabled;
  if (typeof LastROTools !== "undefined") LastROTools?._lastroShortcutEntry?.setEnabled(next.enabled);
  return true;
}
let lastroTeleportConfirmationPreferences;
function getLastroTeleportConfirmationPreferences() {
  init_Preferences$1();
  if (!lastroTeleportConfirmationPreferences) {
    const defaults = { _key: "LastROTeleportConfirmation", _version: 1, enabled: false };
    try { lastroTeleportConfirmationPreferences = Preferences.get("LastROTeleportConfirmation", defaults, 1); }
    catch { lastroTeleportConfirmationPreferences = { ...defaults, save() { return Preferences.save(this); } }; }
  }
  return lastroTeleportConfirmationPreferences;
}
function getLastroTeleportConfirmationEnabled() {
  return getLastroTeleportConfirmationPreferences().enabled !== false;
}
async function setLastroTeleportConfirmationEnabled(enabled) {
  const preferences = getLastroTeleportConfirmationPreferences();
  const next = { ...preferences, enabled: enabled === true };
  if (typeof next.save !== "function" || await next.save.call(next) === false) throw new Error("Teleport confirmation preference was not saved");
  preferences.enabled = next.enabled;
  return true;
}\n`;
  return preference + source.slice(0, anchor) + install + source.slice(anchor);
}

// LastRO's instance protocol is absent from upstream V2. Keep it distinct
// from Gravity's standard PARTY_BOOKING protocol.
export function patchLastROInstancePackets(source) {
  const structures = `
  PACKET.CZ.REQ_CREATE_INSTANCE = function PACKET_CZ_REQ_CREATE_INSTANCE() { this.instanceName = ''; };
  PACKET.CZ.REQ_CREATE_INSTANCE.prototype.build = function () {
    const name = String(this.instanceName ?? '');
    if (!name || name.length > 200) throw new Error('Invalid LastRO instance name');
    const pkt = new BinaryWriter(4 + name.length + 1);
    pkt.writeShort(3057); pkt.writeShort(0); pkt.writeString(name); pkt.writeUChar(0);
    pkt.view.setUint16(2, pkt.buffer.byteLength, true);
    return pkt;
  };
  PACKET.ZC.RS_CREATE_INSTANCE = function PACKET_ZC_RS_CREATE_INSTANCE(fp) { this.rs = fp.readUChar(); };
  PACKET.ZC.RS_CREATE_INSTANCE.size = 3;
  PACKET.CZ.REQ_DEL_INSTANCE = function PACKET_CZ_REQ_DEL_INSTANCE() {};
  PACKET.CZ.REQ_DEL_INSTANCE.prototype.build = function () {
    const pkt = new BinaryWriter(2); pkt.writeShort(3059); return pkt;
  };
  PACKET.ZC.RS_DEL_INSTANCE = function PACKET_ZC_RS_DEL_INSTANCE(fp) { this.rs = fp.readUChar(); };
  PACKET.ZC.RS_DEL_INSTANCE.size = 3;
  PACKET.CZ.REQ_ENTER_INSTANCE = function PACKET_CZ_REQ_ENTER_INSTANCE() {
    this.CID = 0; this.AID = 0; this.instanceName = '';
  };
  PACKET.CZ.REQ_ENTER_INSTANCE.prototype.build = function () {
    const name = String(this.instanceName ?? '');
    if (!name || name.length > 200) throw new Error('Invalid LastRO instance name');
    const pkt = new BinaryWriter(12 + name.length + 1);
    pkt.writeShort(3061); pkt.writeShort(0);
    pkt.writeLong(this.CID); pkt.writeLong(this.AID);
    pkt.writeString(name); pkt.writeUChar(0);
    pkt.view.setUint16(2, pkt.buffer.byteLength, true);
    return pkt;
  };
  PACKET.ZC.RS_ENTER_INSTANCE = function PACKET_ZC_RS_ENTER_INSTANCE(fp) { this.rs = fp.readUChar(); };
  PACKET.ZC.RS_ENTER_INSTANCE.size = 3;
`;
  source = replaceOnce(source,
    '  PACKET.ZC.NOTIFY_OFFLINEMSG.size = 30;',
    '  PACKET.ZC.NOTIFY_OFFLINEMSG.size = 30;' + structures);
  source = replaceOnce(source,
    '    Object.assign(PacketRegister, {\n      2773: PACKET.ZC.SECOND_CHECK,',
    '    Object.assign(PacketRegister, {\n      3058: PACKET.ZC.RS_CREATE_INSTANCE,\n      3060: PACKET.ZC.RS_DEL_INSTANCE,\n      3062: PACKET.ZC.RS_ENTER_INSTANCE,\n      2773: PACKET.ZC.SECOND_CHECK,');
  source = replaceOnce(source, '          2812: 30,',
    '          2812: 30,\n          3058: 3,\n          3060: 3,\n          3062: 3,');
  return source;
}

// Recover off-screen movable UI panels when they are appended or shown.
// Do this in the generated runtime rather than modifying the large vendor snapshot.
export function patchRuntimeWindowBounds(source) {
  const original = `    _fixPositionOverflow() {
      if (!this._host || !this._isDraggable) return;
      const WIDTH = _Renderer?.width ?? window.innerWidth;
      const HEIGHT = _Renderer?.height ?? window.innerHeight;
      UIClamp(this._host, WIDTH, HEIGHT, this.magnet);
    }`;
  const replacement = `    _fixPositionOverflow() {
      if (!this._host || !this._isDraggable) return;
      lastroRecoverWindowBounds(this);
    }`;
  if (source.split(original).length !== 2) fail('anchor:gui-window-overflow');
  source = source.replace(original, replacement);
  const marker = '//#region src/UI/GUIComponent.js';
  if (source.split(marker).length !== 2) fail('anchor:gui-window-region');
  return source.replace(marker, `function lastroRecoverWindowBounds(component) {
  const host = component._host;
  const win = host?.ownerDocument?.defaultView;
  // Windows with their own persistence helper already perform a scale-aware fit.
  if (!win || component._lastroWindowState || !host.isConnected || host.style.display === 'none') return;
  const vw = win.innerWidth, vh = win.innerHeight;
  if (!(vw > 0 && vh > 0)) return;
  let rect = host.getBoundingClientRect();
  if (!(rect.width > 0 && rect.height > 0)) return;
  const invalid = ![rect.left, rect.top, rect.right, rect.bottom].every(Number.isFinite);
  if (!invalid && rect.left >= 0 && rect.top >= 0 && rect.right <= vw && rect.bottom <= vh) return;
  // Oversized windows must also keep their title bar reachable.
  if (rect.width > vw || rect.height > vh) {
    const scale = Math.min(1, vw / rect.width, vh / rect.height);
    host.style.transformOrigin = '0 0';
    host.style.scale = String(scale);
    rect = host.getBoundingClientRect();
  }
  const width = host.offsetWidth, height = host.offsetHeight;
  const sx = width > 0 ? rect.width / width : 1;
  const sy = height > 0 ? rect.height / height : 1;
  if (!(sx > 0 && sy > 0)) return;
  const magnet = component.magnet || {};
  const targetX = magnet.LEFT ? 0 : magnet.RIGHT ? vw - rect.width : (vw - rect.width) / 2;
  const targetY = magnet.TOP ? 0 : magnet.BOTTOM ? vh - rect.height : (vh - rect.height) / 2;
  const baseX = Number.isFinite(host.offsetLeft) ? host.offsetLeft : 0;
  const baseY = Number.isFinite(host.offsetTop) ? host.offsetTop : 0;
  host.style.left = (baseX + (targetX - (Number.isFinite(rect.left) ? rect.left : 0))) + 'px';
  host.style.top = (baseY + (targetY - (Number.isFinite(rect.top) ? rect.top : 0))) + 'px';
}
${marker}`);
}


/**
 * Recover storage on server COUNTINFO, even when the version-specific UI
 * reports __active but its host was detached or hidden by a previous session.
 * Respect StorageController.getUI(): V0 and V3 must both be supported.
 */
export function patchRuntimeStorageOpening(source) {
  const marker = '//#region src/Engine/MapEngine/Storage.js';
  const start = source.indexOf(marker);
  if (start < 0 || source.indexOf(marker, start + marker.length) >= 0) fail('anchor:storage-region');
  const end = source.indexOf('//#endregion', start);
  if (end < 0) fail('anchor:storage-region-end');
  const region = source.slice(start, end);
  const file = ts.createSourceFile('Storage.js', region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const owners = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === 'onStorageInfo');
  if (owners.length !== 1 || !owners[0].body) fail('anchor:storage-open-handler');
  const statements = owners[0].body.statements;
  const guards = statements.filter(node => ts.isIfStatement(node)
    && node.thenStatement.getText(file).includes('StorageController.getUI().append()'));
  const guard = guards[0];
  if (guards.length !== 1 || guard.expression.getText(file).replace(/\s/g, '')
    !== '!(StorageController.getUI().__loaded&&StorageController.getUI().__active)') {
    fail('anchor:storage-open-guard');
  }
  const lists = statements.filter(node => ts.isExpressionStatement(node)
    && node.expression.getText(file).replace(/\s/g, '') === 'StorageController.getUI().setItems(itemBuffer)');
  if (lists.length !== 1) fail('anchor:storage-item-list');
  const edits = [
    {
      start: guard.expression.getStart(file),
      end: guard.expression.end,
      value: '!(StorageController.getUI().__loaded && StorageController.getUI().__active'
        + ' && StorageController.getUI()._host?.isConnected'
        + ' && StorageController.getUI()._host.style.display !== "none")',
    },
    {
      start: lists[0].end,
      end: lists[0].end,
      value: [
        '\n  // Refit after the native handler has appended and hydrated its item list.',
        '  const lastroStorageWindow = StorageController.getUI();',
        '  if (typeof lastroStorageWindow.focus === "function") lastroStorageWindow.focus();',
        '  const recoverStorageWindow = () => {',
        '    const host = lastroStorageWindow._host;',
        '    if (!lastroStorageWindow.__active || !host?.isConnected || host.style.display === "none") return;',
        '    if (lastroStorageWindow._lastroWindowState?.fit) lastroStorageWindow._lastroWindowState.fit();',
        '    else lastroRecoverWindowBounds(lastroStorageWindow);',
        '  };',
        '  if (typeof requestAnimationFrame === "function") {',
        '    requestAnimationFrame(() => {',
        '      recoverStorageWindow();',
        '      requestAnimationFrame(recoverStorageWindow);',
        '    });',
        '  } else recoverStorageWindow();',
      ].join('\n'),
    },
  ];
  let patched = region;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    patched = patched.slice(0, edit.start) + edit.value + patched.slice(edit.end);
  }
  return source.slice(0, start) + patched + source.slice(end);
}


/**
 * Buffer both generations of storage item-list packets until COUNTINFO.
 * A gear-only account can receive SPLIT_SEND_ITEMLIST_EQUIP without the
 * NORMAL packet that the upstream UI incorrectly relies upon to append.
 * The resulting full snapshot replaces the old UI list instead of
 * accumulating duplicate items on a reopened/detached window.
 */
export function patchRuntimeStorageItemFlow(source) {
  const findRegion = marker => {
    const start = source.indexOf(marker);
    if (start < 0 || source.indexOf(marker, start + marker.length) >= 0) fail('anchor:storage-flow-region:' + marker);
    const end = source.indexOf('//#endregion', start);
    if (end < 0) fail('anchor:storage-flow-region-end:' + marker);
    return { start, end, code: source.slice(start, end) };
  };
  const patchRegion = (marker, update) => {
    const { start, end, code } = findRegion(marker);
    source = source.slice(0, start) + update(code) + source.slice(end);
  };

  const itemMarker = '//#region src/Engine/MapEngine/Item.js';
  patchRegion(itemMarker, region => {
    const file = ts.createSourceFile('Item.js', region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const edits = [];
    for (const name of ['onItemListNormal', 'onItemListEquip']) {
      const owners = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
      if (owners.length !== 1 || !owners[0].body) fail('anchor:storage-flow:' + name);
      const switches = owners[0].body.statements.filter(ts.isSwitchStatement);
      if (switches.length !== 1 || switches[0].expression.getText(file) !== 'pkt.invType') {
        fail('anchor:storage-flow-switch:' + name);
      }
      const cases = switches[0].caseBlock.clauses.filter(node => ts.isCaseClause(node)
        && node.expression.getText(file) === '2');
      if (cases.length !== 1) fail('anchor:storage-flow-case:' + name);
      const statements = cases[0].statements;
      const original = statements.map(node => node.getText(file)).join('\n');
      if (!/Storage/.test(original) || !/\.setItems\(/.test(original)
        || !ts.isBreakStatement(statements[statements.length - 1])) {
        fail('anchor:storage-flow-items:' + name);
      }
      edits.push({
        start: statements[0].getStart(file),
        end: statements[statements.length - 1].end,
        value: 'lastroStageStorageItems(pkt.itemInfo || pkt.ItemInfo);\n          break;',
      });
    }
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      region = region.slice(0, edit.start) + edit.value + region.slice(edit.end);
    }
    return region;
  });

  // A shared per-runtime staging area, outside the ESM initializers for
  // Item.js and Storage.js, permits both packet handlers to cooperate.
  const stagingHelpers = [
    'const lastroStagedStorageItems = new Map();',
    'let lastroStorageSnapshotApplied = false;',
    'function lastroResetStorageSnapshot() {',
    '  lastroStagedStorageItems.clear();',
    '  lastroStorageSnapshotApplied = false;',
    '}',
    'function lastroStageStorageItems(items) {',
    '  if (!Array.isArray(items)) return;',
    '  for (const item of items) {',
    '    if (item) lastroStagedStorageItems.set(item.index, item);',
    '  }',
    '}',
    'function lastroApplyStorageSnapshot(storage, legacyItems) {',
    '  const hasItems = lastroStagedStorageItems.size > 0 || (legacyItems?.length ?? 0) > 0;',
    '  if (!hasItems && lastroStorageSnapshotApplied) return;',
    '  const merged = new Map();',
    '  for (const item of legacyItems || []) {',
    '    if (item) merged.set(item.index, item);',
    '  }',
    '  for (const [index, item] of lastroStagedStorageItems) merged.set(index, item);',
    '  lastroStagedStorageItems.clear();',
    '  storage.replaceItems(Array.from(merged.values()));',
    '  lastroStorageSnapshotApplied = true;',
    '}',
    '',
  ].join('\n');
  source = source.replace(itemMarker, stagingHelpers + itemMarker);

  patchRegion('//#region src/UI/Components/Storage/StorageCommon.js', region => {
    const anchor = 'Component.setItems = function setItems(items) {';
    if (region.split(anchor).length !== 2) fail('anchor:storage-snapshot-setItems');
    const replacement = [
      '// Replace a complete server snapshot, including when an old UI was reattached.',
      'Component.replaceItems = function replaceItems(items) {',
      '  const root = this.getRoot();',
      '  const content = root?.querySelector(".container .content");',
      '  if (content) content.textContent = "";',
      '  _list.length = 0;',
      '  if (hasFilters) {',
      '    for (const filter of Object.values(_openFilters)) filter.remove();',
      '    _openFilters = {};',
      '  }',
      '  this.setItems(items);',
      '};',
      '',
      anchor,
    ].join('\n');
    return region.replace(anchor, replacement);
  });

  patchRegion('//#region src/Engine/MapEngine/Storage.js', region => {
    const original = 'StorageController.getUI().setItems(itemBuffer)';
    if (region.split(original).length !== 2) fail('anchor:storage-snapshot-apply');
    region = region.replace(original,
      'lastroApplyStorageSnapshot(StorageController.getUI(), itemBuffer)');

    const file = ts.createSourceFile('Storage.js', region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const edits = [];
    for (const name of ['onStorageClose', 'onClosePressed', 'StorageEngine', 'onItemListSet']) {
      const owners = [];
      function visit(node) {
        if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) && node.name?.text === name) owners.push(node);
        ts.forEachChild(node, visit);
      }
      visit(file);
      if (owners.length !== 1 || !owners[0].body) fail('anchor:storage-snapshot-reset:' + name);
      edits.push({
        start: owners[0].body.getStart(file) + 1,
        value: name === 'onItemListSet'
          ? '\n  if (pkt.invType === 2) { lastroResetStorageSnapshot(); itemBuffer = []; }'
          : '\n  lastroResetStorageSnapshot();\n  itemBuffer = [];',
      });
    }
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      region = region.slice(0, edit.start) + edit.value + region.slice(edit.start);
    }
    return region;
  });

  // Character switching can remove UI components without a CLOSE_STORE
  // packet. Clear any partial list before the next account session.
  const exitPattern = /function onExitSuccess\([^)]*\)\s*\{/g;
  const exits = [...source.matchAll(exitPattern)];
  if (exits.length > 1) fail('anchor:storage-snapshot-session-exit');
  if (exits.length === 1) {
    source = source.replace(exitPattern, match => match + '\n  lastroResetStorageSnapshot();');
  }
  return source;
}

export function patchV2Runtime(source, { assistant = false } = {}) {
  if (!source.startsWith('import ')) fail('anchor:runtime-imports');
  const normalizedSource = patchRuntimeHalloweenWorld(source.replace(/\r\n/g, '\n'));
  let output = `import { decorateLastROLoginTemplate, decorateLastROLoginStyles, installLastROLogin, beforeLastROLoginConnect, afterLastROLoginPassword } from "./lastro-account-login.mjs";
import { sendKoreNativePacket, startOptionalKore } from "./kore-integration.mjs";
import { createKoreShell } from "./kore-panel-shell.mjs";
let lastroWorkerPolicy;
let currentKoreWorkerUrl = null;
const nativeWorkerUrls = ["LastROThreadEventHandler.js", "PathFindingWorker.js"]
	.map(path => new URL(path, import.meta.url).href);
function trustLastROWorkerUrl(value) {
	const candidate = new URL(value, import.meta.url);
	if (!nativeWorkerUrls.includes(candidate.href) && candidate.href !== currentKoreWorkerUrl) {
		throw new TypeError("Unexpected worker URL");
	}
	const trustedTypes = globalThis.trustedTypes;
	if (!trustedTypes) return candidate.href;
	const policy = lastroWorkerPolicy ?? (lastroWorkerPolicy = trustedTypes.createPolicy("lastro-iwa-worker", {
		createScriptURL: (url) => {
			const allowed = new URL(url, import.meta.url).href;
			if (!nativeWorkerUrls.includes(allowed) && allowed !== currentKoreWorkerUrl) {
				throw new TypeError("Unexpected worker URL");
			}
			return allowed;
		},
	}));
	return policy.createScriptURL(candidate.href);
}
function createLastROWorkerScriptUrl(relativePath) {
	if (relativePath !== "LastROThreadEventHandler.js" && relativePath !== "PathFindingWorker.js") {
		throw new TypeError("Unexpected worker path");
	}
	return trustLastROWorkerUrl(new URL(relativePath, import.meta.url).href);
}
function sendKoreEnginePacket(action, packet) {
  let refusalReason = null;
  if (/REQUEST_MOVE2?$/.test(packet?.constructor?.name || "")) {
    try {
      if (lastroVendingShoppingActive()) refusalReason = "vending-store-active";
      else if (lastroMovementUnavailable()) refusalReason = "movement-connection-unavailable";
    } catch { /* The native sender remains authoritative if diagnostics cannot inspect a guard. */ }
  }
  return sendKoreNativePacket(action, packet, {
    page: globalThis,
    sendPacket: value => Network.sendPacket(value),
    socket: typeof _socket === "undefined" ? null : _socket,
    refusalReason,
  });
}
globalThis.KoreEngineNativeAction = (action) => {
  if (!action) return false;
  if (action.type === "MoveTo") {
    const packet = PacketVerManager_default.value >= 20180307
      ? new PACKET.CZ.REQUEST_MOVE2()
      : new PACKET.CZ.REQUEST_MOVE();
    packet.dest[0] = action.x;
    packet.dest[1] = action.y;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "Attack") {
    const Ctor = PacketVerManager_default.value >= 20180307 ? PACKET.CZ.REQUEST_ACT2 : PACKET.CZ.REQUEST_ACT;
    if (!Ctor) return false;
    const packet = new Ctor();
    packet.targetGID = action.targetGid;
    // ACTION_ATTACK_REPEAT (7): OpenKore's normal attack mode. The server
    // keeps swinging at its own ASPD; action 0 is a single attack only.
    packet.action = 7;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "Sit" || action.type === "Stand") {
    const Ctor = PacketVerManager_default.value >= 20180307 ? PACKET.CZ.REQUEST_ACT2 : PACKET.CZ.REQUEST_ACT;
    if (!Ctor) return false;
    const packet = new Ctor();
    packet.targetGID = SessionStorage_default.AID ?? 0;
    packet.action = action.type === "Sit" ? 2 : 3;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "Equip") {
    if (!PACKET?.CZ?.REQ_WEAR_EQUIP) return false;
    const packet = new PACKET.CZ.REQ_WEAR_EQUIP();
    packet.index = action.inventoryIndex;
    packet.wearLocation = action.position;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "Unequip") {
    if (!PACKET?.CZ?.REQ_TAKEOFF_EQUIP) return false;
    const packet = new PACKET.CZ.REQ_TAKEOFF_EQUIP();
    packet.index = action.inventoryIndex;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "UseSkillOnTarget" || action.type === "UseSkillSelf") {
    const Ctor = PacketVerManager_default.value >= 20180307 ? PACKET.CZ.USE_SKILL2 : PACKET.CZ.USE_SKILL;
    if (!Ctor) return false;
    const packet = new Ctor();
    packet.selectedLevel = action.level;
    packet.SKID = action.skillId;
    // 地图上的自身 actor ID 是 AID；SessionStorage.GID 是角色服务器的 CID，不能作为自身目标。
    packet.targetID = action.type === "UseSkillSelf" ? (SessionStorage_default.AID ?? 0) : action.targetGid;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "UseSkillAt") {
    const Ctor = PacketVerManager_default.value >= 20190904
      ? PACKET.CZ.USE_SKILL_TOGROUND3
      : PacketVerManager_default.value >= 20180307 ? PACKET.CZ.USE_SKILL_TOGROUND2 : PACKET.CZ.USE_SKILL_TOGROUND;
    if (!Ctor) return false;
    const packet = new Ctor();
    packet.selectedLevel = action.level;
    packet.SKID = action.skillId;
    packet.xPos = action.x;
    packet.yPos = action.y;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "UseItem") {
    const Ctor = PacketVerManager_default.value >= 20180307 ? PACKET.CZ.USE_ITEM2 : PACKET.CZ.USE_ITEM;
    if (!Ctor) return false;
    const packet = new Ctor();
    packet.index = action.inventoryIndex;
    packet.AID = action.targetGid || SessionStorage_default.AID || 0;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "Pickup") {
    const Ctor = PacketVerManager_default.value >= 20180307 ? PACKET.CZ.ITEM_PICKUP2 : PACKET.CZ.ITEM_PICKUP;
    if (!Ctor) return false;
    const packet = new Ctor();
    packet.ITAID = action.itemGid;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "DropItem") {
    // LastRO 20211103: 0x0363 PACKET_CZ_ITEM_THROW2, Index + count.
    const Ctor = PacketVerManager_default.value >= 20180307 ? PACKET.CZ.ITEM_THROW2 : PACKET.CZ.ITEM_THROW;
    if (!Ctor) return false;
    const packet = new Ctor();
    packet.Index = action.inventoryIndex;
    packet.count = action.amount;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "StorageTransfer") {
    const Ctor = action.toStorage
      ? (PacketVerManager_default.value >= 20180307 ? PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE2 : PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_STORE)
      : (PacketVerManager_default.value >= 20180307 ? PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY2 : PACKET.CZ.MOVE_ITEM_FROM_STORE_TO_BODY);
    if (!Ctor) return false;
    const packet = new Ctor();
    packet.index = action.inventoryIndex;
    packet.count = action.amount;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "ToggleServerAutoFight" || action.type === "ToggleServerFollow") {
    // LastRO 服务器版“自动战斗 / 自动跟随”开关是切换：nid 5/6 发 NOTIFY_UPDATEINFO(34 或 37, 1)，
    // nid 3 私聊 NPC:setautoattack / NPC:setfollow。编码方式和工具箱的开关一致；状态由服务器 0x0AF6 回报给 KE。
    const option = action.type === "ToggleServerFollow" ? "autoFollow" : "autoAttack";
    const request = buildAutoToggleRequest({ nid: Configs.get("lastroNid", 0), option, enabled: false });
    if (request?.kind === "whisper") {
      if (!PACKET?.CZ?.WHISPER) return false;
      const packet = new PACKET.CZ.WHISPER();
      packet.receiver = request.receiver;
      packet.msg = request.msg;
      return sendKoreEnginePacket(action, packet);
    }
    if (request?.kind === "update") {
      if (!PACKET?.CZ?.NOTIFY_UPDATEINFO) return false;
      const packet = new PACKET.CZ.NOTIFY_UPDATEINFO();
      Object.assign(packet, mapScalarUpdate(request));
      return sendKoreEnginePacket(action, packet);
    }
    return false;
  }
  if (action.type === "RequestServerSettings") {
    // 向服务器要整份自动战斗设置：官方工具箱每次换图发的同一个 2 字节包（CZ.NOTIFY_LOADINFO，0x0AFF），
    // 服务器用 0x0AF5 快照回答。KE 靠它问出自动战斗/跟随开关的真实状态——服务器不会回报每一次切换。
    if (!PACKET?.CZ?.NOTIFY_LOADINFO) return false;
    return sendKoreEnginePacket(action, new PACKET.CZ.NOTIFY_LOADINFO());
  }
  if (action.type === "StorageClose") {
    // OpenKore sendStorageClose：服务端仓库没关时，后续的飞空艇请求会被静默忽略。
    if (!PACKET?.CZ?.CLOSE_STORE) return false;
    return sendKoreEnginePacket(action, new PACKET.CZ.CLOSE_STORE());
  }
  if (action.type === "NpcTalk") {
    if (!PACKET?.CZ?.CONTACTNPC) return false;
    const packet = new PACKET.CZ.CONTACTNPC();
    packet.NAID = action.npcGid;
    packet.type = 1;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "NpcMenu") {
    if (!PACKET?.CZ?.CHOOSE_MENU) return false;
    const packet = new PACKET.CZ.CHOOSE_MENU();
    packet.NAID = action.npcGid;
    packet.num = action.choice;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "NpcContinue") {
    if (!PACKET?.CZ?.REQ_NEXT_SCRIPT) return false;
    const packet = new PACKET.CZ.REQ_NEXT_SCRIPT();
    packet.NAID = action.npcGid;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "NpcClose") {
    if (!PACKET?.CZ?.CLOSE_DIALOG) return false;
    const packet = new PACKET.CZ.CLOSE_DIALOG();
    packet.NAID = action.npcGid;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "NpcNumber") {
    if (!PACKET?.CZ?.INPUT_EDITDLG) return false;
    const packet = new PACKET.CZ.INPUT_EDITDLG();
    packet.NAID = action.npcGid;
    packet.value = action.value;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "NpcText") {
    if (!PACKET?.CZ?.INPUT_EDITDLGSTR) return false;
    const packet = new PACKET.CZ.INPUT_EDITDLGSTR();
    packet.NAID = action.npcGid;
    packet.msg = action.text;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "NpcShopSelect") {
    if (!PACKET?.CZ?.ACK_SELECT_DEALTYPE) return false;
    const packet = new PACKET.CZ.ACK_SELECT_DEALTYPE();
    packet.NAID = action.npcGid;
    packet.type = action.sell ? 1 : 0;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "ShopBuy") {
    if (!PACKET?.CZ?.PC_PURCHASE_ITEMLIST) return false;
    const packet = new PACKET.CZ.PC_PURCHASE_ITEMLIST();
    packet.itemList = action.items.map((entry) => ({ ITID: entry.itemId, count: entry.amount }));
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "ShopSell") {
    if (!PACKET?.CZ?.PC_SELL_ITEMLIST) return false;
    const packet = new PACKET.CZ.PC_SELL_ITEMLIST();
    packet.itemList = action.items.map((entry) => ({ index: entry.inventoryIndex, count: entry.amount }));
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "PrivateAirship") {
    if (!PACKET?.CZ?.PRIVATE_AIRSHIP_REQUEST) return false;
    const packet = new PACKET.CZ.PRIVATE_AIRSHIP_REQUEST();
    packet.mapname = String(action.destinationId).replace(/\\.(?:gat|rsw)$/i, "").toLowerCase();
    const hasPosition = Number.isSafeInteger(action.x) && Number.isSafeInteger(action.y);
    packet.x = hasPosition ? action.x : 0;
    packet.y = hasPosition ? action.y : 0;
    packet.type = hasPosition ? 1 : 0;
    packet.itemid = Number.isSafeInteger(action.itemId) && action.itemId > 0 ? action.itemId : 14527;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "SelectWarpPoint") {
    // 瞬间移动 Lv2 弹出传送点列表后的选择（0x011B：skillID u16 + mapName Z16）。
    // 选哪一项由 KE 决定，Host 只编码发送。
    if (!PACKET?.CZ?.SELECT_WARPPOINT) return false;
    const packet = new PACKET.CZ.SELECT_WARPPOINT();
    packet.SKID = action.skillId;
    packet.mapName = action.mapName;
    return sendKoreEnginePacket(action, packet);
  }
  if (action.type === "Restart") {
    if (!PACKET?.CZ?.RESTART) return false;
    const packet = new PACKET.CZ.RESTART();
    packet.type = 0;
    return sendKoreEnginePacket(action, packet);
  }
  return false;
};
globalThis.KoreEngineNativeRouteAction = globalThis.KoreEngineNativeAction;
// Worker 重建后的会话恢复需要知道角色此刻所在的地图（登录时的地图可能早已过期）。
globalThis.KoreEngineCurrentMap = () => {
  try { return String(MapRenderer?.currentMap ?? ""); } catch { return ""; }
};
globalThis.KoreEngineDisconnect = (reason) => {
	try {
		Network.close();
		return true;
	} catch {
		return false;
	}
};
startOptionalKore({
	createWorker: (value) => {
		const url = new URL(value);
		const local = new URL(import.meta.url);
		if (url.protocol !== local.protocol || url.host !== local.host || url.username || url.password || url.search || url.hash
			|| !/^\\/core\\/ke\\/[a-f0-9]{64}\\/kore-worker\\.mjs$/.test(url.pathname)) {
			throw new TypeError("Unexpected KoreEngine worker URL");
		}
		currentKoreWorkerUrl = url.href;
		return new Worker(trustLastROWorkerUrl(url.href), { type: "module" });
	},
	onWorkerReleased: () => { currentKoreWorkerUrl = null; },
});

${normalizedSource}`;
  output = output.replace(/\?build=[A-Za-z0-9._-]+/g, '');
  output = patchStrEffectLifecycle(output);
  output = patchRuntimeScrollbarObserverLifecycle(output);
  output = patchRuntimeSameMapSignboardCleanup(output);
  output = replaceOnceAny(output, [
    ['\troInitSpinner.add();\n\tPlugins.init();\n\tGameEngine.init();',
      '\troInitSpinner.add();\n\ttry {\n\t\tPlugins.init();\n\t\tGameEngine.init();\n\t} catch (error) {\n\t\troInitSpinner.remove();\n\t\tthrow error;\n\t}'],
    ['  roInitSpinner.add();\n  Plugins.init();\n  GameEngine.init();',
      '  roInitSpinner.add();\n  try {\n    Plugins.init();\n    GameEngine.init();\n  } catch (error) {\n    roInitSpinner.remove();\n    throw error;\n  }'],
  ]);
  output = replaceOnceAny(output, [
    ['if (_source instanceof Worker) _source.addEventListener("message", Thread.receive, false);',
      'if (_source instanceof Worker) {\n\t\t\t\tconsole.info("[LastRO IWA] waiting for resource worker");\n\t\t\t\tconst failed = (event) => { console.error("[LastRO IWA] resource worker failed", event.message); globalThis.LastROStartupDiagnostics?.fail("资源工作线程启动失败", event.message || "Worker message error"); };\n\t\t\t\t_source.addEventListener("error", failed);\n\t\t\t\t_source.addEventListener("messageerror", failed);\n\t\t\t\t_source.addEventListener("message", Thread.receive, false);\n\t\t\t}'],
    ['      if (_source instanceof Worker)\n        _source.addEventListener("message", Thread.receive, false);',
      '      if (_source instanceof Worker) {\n        console.info("[LastRO IWA] waiting for resource worker");\n        const failed = (event) => { console.error("[LastRO IWA] resource worker failed", event.message); globalThis.LastROStartupDiagnostics?.fail("资源工作线程启动失败", event.message || "Worker message error"); };\n        _source.addEventListener("error", failed);\n        _source.addEventListener("messageerror", failed);\n        _source.addEventListener("message", Thread.receive, false);\n      }'],
  ]);
  output = replaceOnce(output, '_thread_ready = true;', '_thread_ready = true;\n\t\t\t\t\t\tconsole.info("[LastRO IWA] resource worker ready; initializing renderer");');
  output = replaceOnce(output, 'savingFiles(files);', 'console.info("[LastRO IWA] initializing remote client resources");\n\t\t\tThread.send("CLIENT_INIT", { files: [], save: false }, (...args) => Client.onFilesLoaded(...args));');
  output = replaceFunctionBody(output, 'defaultSocketFactory', `{
  if (Configs.get("connectionMode", "direct") === "relay") {
    if (Configs.get("id") === "lastro-app") throw new Error("App服不支持中转");
    // Online_new.js routes the public host through this upstream address.
    const targetHost = host === "port.lastro.cn" ? "45.248.10.247" : host;
    let relayBase = "wss://port.lastro.cn/";
    const officialRelay = Configs.get("relayEndpoint");
    if (typeof officialRelay === "string") {
      try {
        const url = new URL(officialRelay);
        // Never follow an arbitrary proxy learned over plaintext HTTP.
        if (url.protocol === "wss:" && (url.hostname === "lastro.cn" || url.hostname.endsWith(".lastro.cn"))
            && (!url.port || url.port === "443") && url.pathname === "/"
            && !url.search && !url.hash && !url.username && !url.password) {
          relayBase = url.href;
        }
      } catch { /* keep the built-in proxy */ }
    }
    const relayUrl = relayBase + targetHost + ":" + port;
    // 官方中转只放行官网 Origin；IWA 原生 WebSocket 的 Origin 是 isolated-app://，改走 Direct TCP + TLS 握手。
    if (typeof globalThis.LastRORelaySocketFactory === "function") return globalThis.LastRORelaySocketFactory(relayUrl);
    return new Socket$1(relayUrl);
  }
  if (Configs.get("id") !== "lastro-app") throw new Error("直连暂时仅App服可用");
  if (typeof globalThis.LastRODirectSocketFactory !== "function") throw new Error("Direct TCP factory unavailable");
  return globalThis.LastRODirectSocketFactory(host, port);
}`);
  // Renderer.init is the stable point where both Renderer and GraphicsSettings
  // are in lexical scope; expose only those two references for the 3D toggle.
  output = replaceOnceAny(output, [
    ['    static init(param) {\n      if (!this.gl) {',
      '    static init(param) {\n      try { globalThis.__LastRORenderer = { Renderer: this, GraphicsSettings }; } catch { /* optional */ }\n      if (!this.gl) {'],
    ['\t\tstatic init(param) {\n\t\t\tif (!this.gl) {',
      '\t\tstatic init(param) {\n\t\t\ttry { globalThis.__LastRORenderer = { Renderer: this, GraphicsSettings }; } catch { /* optional */ }\n\t\t\tif (!this.gl) {'],
  ]);
  output = patchLoginRegistrationHook(output);
  output = patchRuntimeEntityAppearance(output);
  output = patchRuntimeEquipmentCatalog(output);
  output = patchRuntimeEquipmentView(output);
  output = patchRuntimeEquipmentAppearance(output);
  output = patchRuntimeLastROItemLayouts(output);
  output = patchRuntimeCharacterSwitch(output);
  output = patchRuntimeMapChangeHandoff(output);
  output = patchRuntimeNetworkHandoffCleanup(output);
  output = patchRuntimeNetworkDiagnostics(output);
  output = patchRuntimeLastROBatteryPower(output);
  output = replaceOnce(output, 'init_NodeSocket();', '');
  output = replaceWorkerCreation(output);
  output = replacePathFindingWorkerCreation(output);
  output = patchLegacyScriptSinks(output);
  output = patchLuaValueFailure(output);
  output = patchLuaJsonEscapes(output);
  output = patchNpcMenuBlankArea(output);
  output = patchAchievementClaimButton(output);
  for (const table of ['map', 'npc', 'link', 'linkdistance', 'npcdistance']) {
    output = replaceOnce(output, `DB.LUA_PATH + "navigation/navi_${table}_krpri.lub"`,
      `DB.LUA_PATH + "navigation/" + (Configs.get("lastroProtocol", false) ? "navi_${table}_tw.lub" : "navi_${table}_krpri.lub")`);
  }

  output = replaceFunctionBody(output, 'loadXMLFile', `{
  Client.loadFile(filename, function(file) {
    try {
      console.log('Loading file "' + filename + '"...');
      let xml = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
      xml = CodepageManager.decode(xml, userCharpage);
      xml = xml.replace(/^.*<\\?xml/, "<?xml");
      const parsedXML = new DOMParser().parseFromString(xml, "application/xml");
      callback.call(null, xmlparse_default.xml2json(parsedXML));
    } catch (error) {
      console.error("[loadXMLFile] Failed to load " + filename, error);
    } finally {
      onEnd();
    }
  }, onEnd);
}`);
  output = replaceOnce(output, 'const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];', [
    'let gamepads = [];',
    '// Gamepad input is optional; denied IWA permissions must not interrupt login.',
    'const gamepadPolicy = document.permissionsPolicy ?? document.featurePolicy;',
    'try {',
    '  if (typeof navigator.getGamepads === "function" && gamepadPolicy?.allowsFeature?.("gamepad") !== false) {',
    '    gamepads = navigator.getGamepads();',
    '  }',
    '} catch (error) {',
    '  if (error?.name !== "SecurityError") throw error;',
    '}',
  ].join('\n\t\t\t'));

  output = replaceOnceAny(output, [
    ['if (!Configs.get("remoteClient") && !count && !window.electronAPI?.isElectron) {', 'if (!Configs.get("remoteClient") && !count) {'],
    ['      if (\n        !Configs.get("remoteClient") &&\n        !count &&\n        !window.electronAPI?.isElectron\n      ) {', '      if (!Configs.get("remoteClient") && !count) {'],
  ]);
  output = replaceOnce(output, 'el.innerHTML = PRELOADER_INNER_HTML;', [
    'const spinner = document.createElement("div");',
    'spinner.className = "pre-spinner";',
    'const text = document.createElement("p");',
    'text.className = "pre-text";',
    'for (const [index, character] of Array.from("Loading...").entries()) {',
    'const span = document.createElement("span");',
    'span.style.setProperty("--i", String(index));',
    'span.textContent = character;',
    'text.appendChild(span);',
    '}',
    'el.append(spinner, text);',
  ].join('\n\t\t\t\t'));
  for (const pairs of [
    [
      ['      if (remoteClient) Thread.send("SET_HOST", remoteClient);', '      if (remoteClient) Thread.send("SET_HOST", remoteClient);\n      Thread.send("SET_EXECUTABLE_MANIFEST", globalThis.LastROExecutableManifest);'],
      ['if (remoteClient) Thread.send("SET_HOST", remoteClient);', 'if (remoteClient) Thread.send("SET_HOST", remoteClient);\n\t\t\tThread.send("SET_EXECUTABLE_MANIFEST", globalThis.LastROExecutableManifest);'],
    ],
    [
      ['        Thread.send("SET_HOST", remoteClient);', '        Thread.send("SET_HOST", remoteClient);\n      Thread.send("SET_EXECUTABLE_MANIFEST", globalThis.LastROExecutableManifest);'],
      ['\t\t\t\tThread.send("SET_HOST", remoteClient);', '\t\t\t\tThread.send("SET_HOST", remoteClient);\n\t\t\tThread.send("SET_EXECUTABLE_MANIFEST", globalThis.LastROExecutableManifest);'],
    ],
  ]) {
    output = replaceOnceAny(output, pairs);
  }
  output = replaceOnce(output, 'var root = freeGlobal || freeSelf || Function("return this")();', 'var root = freeGlobal || freeSelf || globalThis;');
  output = replaceOnceAny(output, [
    ['return Function(importsKeys, sourceURL + "return " + source).apply(undefined, importsValues);',
      'throw new Error("Dynamic templates are disabled in the IWA runtime");'],
    ['          return Function(importsKeys, sourceURL + "return " + source).apply(\n            undefined,\n            importsValues,\n          );',
      '          throw new Error("Dynamic templates are disabled in the IWA runtime");'],
  ]);
  output = removeRegion(output, ['NodeSocket']);
  output = output.replace(/\/\*\*(?:(?!\*\/)[\s\S])*?Default socket factory(?:(?!\*\/)[\s\S])*?\*\/\r?\nfunction defaultSocketFactory/, 'function defaultSocketFactory');
  output = replaceOnceAny(output, [
    ['new GUIComponent(\n    name,\n    enhanceWinLoginStyles(name, cssText),\n  )',
      'new GUIComponent(\n    name,\n    decorateLastROLoginStyles(name, enhanceWinLoginStyles(name, cssText)),\n  )'],
    ['new GUIComponent(name, enhanceWinLoginStyles(name, cssText))',
      'new GUIComponent(name, decorateLastROLoginStyles(name, enhanceWinLoginStyles(name, cssText)))'],
  ]);
  output = replaceOnce(output, 'const renderedHtmlText = enhanceWinLoginTemplate(name, htmlText);',
    'const renderedHtmlText = decorateLastROLoginTemplate(name, enhanceWinLoginTemplate(name, htmlText));');
  output = replaceOnceAny(output, [
    ['    void 0;\n    populateLoginServerButtons(\n      root,\n      Configs.get("loginServerProfiles", []),\n      Configs.getServer?.().id || "lastro",\n      (profile) => Component.onServerSelect(profile),\n    );',
      '    installLastROLogin({ root, component: Component, configs: Configs, onAssistantProfileChange: profileId => globalThis.LROAssistantProfileChange?.(profileId) });'],
    ['\t\tvoid 0;\n\t\tpopulateLoginServerButtons(root, Configs.get("loginServerProfiles", []), Configs.getServer?.().id || "lastro", (profile) => Component.onServerSelect(profile));',
      '\t\tinstallLastROLogin({ root, component: Component, configs: Configs, onAssistantProfileChange: profileId => globalThis.LROAssistantProfileChange?.(profileId) });'],
  ]);
  output = replaceOnceAny(output, [
    ['    const pass = _inputPassword.value;\n    applyDebugLoginFields();',
      '    const pass = _inputPassword.value;\n    if (beforeLastROLoginConnect(user, pass) === false) return false;\n    applyDebugLoginFields();'],
    ['\t\tconst pass = _inputPassword.value;\n\t\tapplyDebugLoginFields();',
      '\t\tconst pass = _inputPassword.value;\n\t\tif (beforeLastROLoginConnect(user, pass) === false) return false;\n\t\tapplyDebugLoginFields();'],
  ]);
  output = patchRuntimeLocalization(output);
  output = patchRuntimeUiText(output);
  output = patchRuntimeUiMessages(output);
  output = patchRuntimeMapLocalization(output);
  output = patchRuntimeCharSelectMapName(output);
  output = patchRuntimeStatusTooltips(output);
  output = patchRuntimeHotkeys(output);
  output = patchRuntimeCardDeckHotkeys(output);
  output = patchRuntimeCardCollection(output);
  output = patchRuntimeLuaStartup(output);
  output = patchLuaTableCompletion(output);
  output = patchRuntimeUiLayout(output);
  output = patchRuntimeWindowBounds(output);
  output = patchRuntimeStorageOpening(output);
  output = patchRuntimeStorageItemFlow(output);
  output = patchPetDialogueDecoding(output);
  output = patchRuntimeWorldMapProductActions(output);
  output = patchRuntimeChatMapLinks(output);
  output = patchRuntimeNpcMapLinks(output, teleportResourceLoaderCode());
  output = patchRuntimeAchievementLinks(output, teleportResourceLoaderCode());
  output = patchRuntimeTeleportFeedback(output);
  output = patchRuntimeAutolootSettings(output);
  output = patchRuntimeToolsPanels(output);
  output = patchRuntimeShortcutSettings(output);
  output = patchRuntimeQuickCast(output);
  output = patchRuntimeQuests(output);
  output = patchRuntimeItemName(output);
  output = patchRuntimeEmoticons(output);
  output = patchRuntimeTeleportFade(output);
  if (/\bws:\/\/|socketProxy|electronAPI|NodeSocket/i.test(output)) fail('legacy-transport');
  output = patchLastROInstancePackets(output);
  output = patchRuntimeCredentialSecurity(output);
  output = patchRuntimePluginLoader(output);
  output = patchRuntimeDebugAccess(output);
  output = patchRuntimePlainTextSinks(output);
  const finalOutput = patchRuntimeNavigation(patchTrustedTypesDomWrites(output));
  assertRuntimeLocalizationMount(finalOutput, source);
  return assistant ? patchLroAssistantRuntime(finalOutput) : finalOutput;
}

async function main() {
  const { values } = parseArgs({ args: process.argv.slice(2), options: {
    input: { type: 'string' }, output: { type: 'string' }, manifest: { type: 'string' },
  } });
  if (!values.input || !values.output || !values.manifest || !path.isAbsolute(values.input)
    || !path.isAbsolute(values.output) || !path.isAbsolute(values.manifest)) fail('absolute-path-required');
  const input = await readFile(values.input);
  const output = Buffer.from(patchV2Runtime(input.toString('utf8'), { assistant: true }));
  await mkdir(path.dirname(values.output), { recursive: true });
  await writeFile(values.output, output);
  const manifest = {
    source: path.relative(repo, values.input),
    output: path.relative(repo, values.output),
    preSha256: createHash('sha256').update(input).digest('hex'),
    postSha256: createHash('sha256').update(output).digest('hex'),
    anchors: ['defaultSocketFactory', 'init_WebSocket', 'init_NodeSocket', 'electronAPI', 'legacy transport regions', 'Client.init resource manifest', 'LoginEngine.init resource manifest'],
  };
  await writeFile(values.manifest, JSON.stringify(manifest, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ bytes: output.length, ...manifest }) + '\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { await main(); } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
