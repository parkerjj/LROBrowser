import ts from 'typescript';

/** Close the acknowledged map session before the asynchronous character UI reload. */
export function patchRuntimeCharacterSwitch(source) {
  const marker = '//#region src/Engine/MapEngine.js';
  const start = source.indexOf(marker);
  if (start < 0) return source;
  const end = source.indexOf('//#endregion', start);
  if (end < 0 || source.indexOf(marker, start + marker.length) >= 0) throw new Error('anchor:character-switch:map-engine');
  const region = source.slice(start, end);
  const file = ts.createSourceFile('MapEngine.js', region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const matches = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === 'onRestartAnswer');
  if (matches.length !== 1 || matches[0].parameters.map(node => node.name.getText(file)).join(',') !== 'pkt') {
    throw new Error('anchor:character-switch:restart-answer');
  }
  const statement = matches[0].body?.statements[0];
  if (!statement || !ts.isIfStatement(statement) || statement.expression.getText(file).replace(/\s/g, '') !== '!pkt.type'
    || !statement.elseStatement || !ts.isBlock(statement.elseStatement)) throw new Error('anchor:character-switch:restart-result');
  const accepted = statement.elseStatement;
  const expected = ['GuildEngine.guild_id=0', 'cleanGameUI()', 'SessionStorage_default.Achievement=null',
    'Mouse.intersect=false', 'MapRenderer.free()', 'Renderer.stop()', 'onRestart()'];
  const expressions = accepted.statements.filter(ts.isExpressionStatement).map(node => node.expression.getText(file).replace(/\s/g, ''));
  if (accepted.statements.length !== expected.length || expressions.join(';') !== expected.join(';')) {
    throw new Error('anchor:character-switch:restart-close');
  }
  const position = start + accepted.getStart(file) + 1;
  return source.slice(0, position) + '\n    // The server accepted returning to character selection; this map socket is finished.\n    // Detach it now so EOF cannot queue a disconnect dialog while the UI reload awaits.\n    Network.close();' + source.slice(position);
}

/** Remove a superseded socket before close, which can synchronously invoke onClose. */
export function patchRuntimeNetworkHandoffCleanup(source) {
  const marker = '//#region src/Network/NetworkManager.js';
  const start = source.indexOf(marker);
  if (start < 0) return source;
  const end = source.indexOf('//#endregion', start);
  if (end < 0 || source.indexOf(marker, start + marker.length) >= 0) throw new Error('anchor:character-switch:network');
  const region = source.slice(start, end);
  const file = ts.createSourceFile('NetworkManager.js', region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const matches = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === 'setPing');
  if (matches.length !== 1 || !matches[0].body) throw new Error('anchor:character-switch:set-ping');
  const loops = [];
  function visit(node) {
    if (ts.isWhileStatement(node) && node.expression.getText(file).replace(/\s/g, '') === '_sockets.length>1') loops.push(node);
    ts.forEachChild(node, visit);
  }
  visit(matches[0].body);
  const condition = loops[0]?.statement;
  if (loops.length !== 1 || !ts.isIfStatement(condition) || condition.expression.getText(file).replace(/\s/g, '') !== '_socket!==_sockets[0]'
    || !ts.isBlock(condition.thenStatement)) throw new Error('anchor:character-switch:old-socket');
  const block = condition.thenStatement;
  const text = block.getText(file).replace(/\s/g, '');
  if (!text.includes('_sockets[0].close();_sockets.splice(0,1);')) throw new Error('anchor:character-switch:cleanup-order');
  const replacement = `{
        const previousSocket = _sockets.shift();
        if (typeof clearReceiveState === "function") clearReceiveState(previousSocket);
        previousSocket.close();
      }`;
  return source.slice(0, start + block.getStart(file)) + replacement + source.slice(start + block.end);
}

/** Keep only NPC entry packets whose rendering was blocked by an in-progress map load. */
export function createLastroNpcSpawnGate({ isLoading, isNpc, replay, maxPending = 4096 }) {
  const pending = new Map();
  return {
    capture(pkt) {
      if (!isLoading() || !isNpc(pkt) || !Number.isSafeInteger(pkt?.GID)) return false;
      // A repeated GID replaces the earlier snapshot; retain insertion order.
      if (!pending.has(pkt.GID) && pending.size >= maxPending) pending.delete(pending.keys().next().value);
      pending.set(pkt.GID, pkt);
      return true;
    },
    vanish(gid) { pending.delete(gid); },
    reset() { pending.clear(); },
    flush() {
      if (isLoading()) return;
      const batch = [...pending.values()];
      pending.clear();
      for (const pkt of batch) {
        // Loading may restart while draining (e.g. back-to-back instance changes).
        if (isLoading()) pending.set(pkt.GID, pkt);
        else replay(pkt);
      }
    },
    get size() { return pending.size; },
  };
}

export function patchRuntimeMapChangeHandoff(source) {
  const mapMarker = '//#region src/Engine/MapEngine.js\n';
  const renderMarker = '//#region src/Renderer/MapRenderer.js\n';
  const mapStart = source.indexOf(mapMarker), renderStart = source.indexOf(renderMarker);
  if (mapStart < 0 || renderStart < 0
    || source.indexOf(mapMarker, mapStart + mapMarker.length) >= 0
    || source.indexOf(renderMarker, renderStart + renderMarker.length) >= 0) throw new Error('anchor:map-change-handoff:regions');
  const mapEnd = source.indexOf('//#endregion', mapStart);
  const renderEnd = source.indexOf('//#endregion', renderStart);
  if (mapEnd < 0 || renderEnd < 0) throw new Error('anchor:map-change-handoff:ends');
  const entityMarker = '//#region src/Engine/MapEngine/Entity.js\n';
  const entityStart = source.indexOf(entityMarker);
  if (entityStart < 0 || source.indexOf(entityMarker, entityStart + entityMarker.length) >= 0)
    throw new Error('anchor:npc-spawn-gate:entity');
  const entityEnd = source.indexOf('//#endregion', entityStart);
  if (entityEnd < 0) throw new Error('anchor:npc-spawn-gate:entity-end');
  let entity = source.slice(entityStart, entityEnd);
  let map = source.slice(mapStart, mapEnd), renderer = source.slice(renderStart, renderEnd);
  const once = (body, anchor, replacement, name) => {
    if (body.split(anchor).length !== 2) throw new Error('anchor:map-change-handoff:' + name);
    return body.replace(anchor, replacement);
  };
  map = once(map, mapMarker, mapMarker + `let lastroDeferredMapChange = null;
const lastroNpcSpawnGate = (${createLastroNpcSpawnGate.toString()})({
  isLoading: () => MapRenderer.loading,
  isNpc: pkt => pkt.objecttype === Entity.TYPE_NPC || pkt.objecttype === Entity.TYPE_NPC2,
  replay: pkt => onEntitySpam(pkt),
});
`, 'state');
  map = once(map, '      _mapName = mapName;', '      lastroDeferredMapChange = null;\n      lastroNpcSpawnGate.reset();\n      _mapName = mapName;', 'connection-reset');
  map = once(map, 'function onMapChange(pkt) {\n  document._lastroItemDrag?.cancel();',
    `function onMapChange(pkt) {
  if (MapRenderer.loading) {
    // The current map's onLoad must remain installed until that load ends.
    lastroDeferredMapChange = pkt;
    return;
  }
  lastroNpcSpawnGate.reset();\n  document._lastroItemDrag?.cancel();`, 'arrival');
  map = once(map, '  MapRenderer.onLoad = () => {\n    resetEntityForMapEntry(',
    `  MapRenderer.onLoad = () => {
    const pending = lastroDeferredMapChange;
    if (pending) {
      lastroDeferredMapChange = null;
      // Apply the same instance-name normalization as MapRenderer.setMap.
      const targetMap = String(pending.mapName ?? "").replace(/^(\\d{3})(\\d@)/, "$2").replace(/^\\d{3}#/, "");
      const currentMap = String(MapRenderer.currentMap ?? "");
      if (targetMap.replace(/\\.[^.]*$/, "") !== currentMap.replace(/\\.[^.]*$/, "")) {
        onMapChange(pending);
        return;
      }
      // Same underlying resource, but newer coordinates: honor the latest packet.
      pkt = pending;
    }
    resetEntityForMapEntry(`, 'load-boundary');
  // Run NPC entry replay only after native onLoad has completed its reset/UI work.
  // An obsolete map's callback returns early and therefore cannot flush its NPCs.
  const mapFile = ts.createSourceFile('MapEngine.js', map, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const callbackAssignments = [];
  function visitMap(node) {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && node.left.getText(mapFile) === 'MapRenderer.onLoad' && ts.isArrowFunction(node.right))
      callbackAssignments.push(node.right);
    ts.forEachChild(node, visitMap);
  }
  const changeOwners = mapFile.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === 'onMapChange');
  if (changeOwners.length !== 1) throw new Error('anchor:npc-spawn-gate:map-owner');
  visitMap(changeOwners[0]);
  const callback = callbackAssignments[0];
  if (callbackAssignments.length !== 1 || !ts.isBlock(callback.body)
    || !callback.body.getText(mapFile).includes('NOTIFY_ACTORINIT'))
    throw new Error('anchor:npc-spawn-gate:onload');
  map = map.slice(0, callback.body.end - 1) + '\n    lastroNpcSpawnGate.flush();\n  ' + map.slice(callback.body.end - 1);
  if (entity.includes('function onEntitySpam(pkt) {\n  applyLastROMercenaryAppearance(pkt);')) {
    entity = once(entity, 'function onEntitySpam(pkt) {\n  applyLastROMercenaryAppearance(pkt);',
      'function onEntitySpam(pkt) {\n  if (lastroNpcSpawnGate.capture(pkt)) return;\n  applyLastROMercenaryAppearance(pkt);', 'npc-entry');
  } else {
    entity = once(entity, 'function onEntitySpam(pkt) {\n  let entity',
      'function onEntitySpam(pkt) {\n  if (lastroNpcSpawnGate.capture(pkt)) return;\n  let entity', 'npc-entry-native');
  }
  entity = once(entity, 'function onEntityVanish(pkt) {',
    'function onEntityVanish(pkt) {\n  lastroNpcSpawnGate.vanish(pkt.GID);', 'npc-vanish');
  map = once(map, 'function cleanGameUI() {',
    'function cleanGameUI() {\n  lastroNpcSpawnGate.reset();', 'npc-cleanup');
  renderer = once(renderer, '    MapRenderer.onLoad();\n    Sky_default.setUpCloudData();',
    '    MapRenderer.onLoad();\n    if (MapRenderer.loading) return;\n    Sky_default.setUpCloudData();', 'obsolete-render');
  let result = source.slice(0, renderStart) + renderer + source.slice(renderEnd);
  const updatedMapStart = result.indexOf(mapMarker), updatedMapEnd = result.indexOf('//#endregion', updatedMapStart);
  result = result.slice(0, updatedMapStart) + map + result.slice(updatedMapEnd);
  const updatedEntityStart = result.indexOf(entityMarker), updatedEntityEnd = result.indexOf('//#endregion', updatedEntityStart);
  return result.slice(0, updatedEntityStart) + entity + result.slice(updatedEntityEnd);
}
