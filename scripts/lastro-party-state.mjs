import ts from 'typescript';

/** Keep party-only visuals tied to the server-confirmed roster and HP source. */
export function createLastroPartyState({ session, entityManager, getMiniMaps, worldMap }) {
  let identity;
  const members = new Map(), ownedLife = new Map();
  const nativeStoreLife = entityManager.storeLife;
  const validAid = aid => Number.isInteger(aid) && aid > 0 && aid <= 0xffffffff;
  const miniMaps = () => [...new Set(getMiniMaps().filter(Boolean))];
  const isPlayer = entity => entity && (entity.objecttype === entity.constructor.TYPE_PC
    || entity.constructor.TYPE_DISGUISED !== undefined && entity.objecttype === entity.constructor.TYPE_DISGUISED);
  const refreshWorldMap = () => worldMap.updatePartyMembers({ groupInfo: [...members.values()] });
  function releaseLife(aid) {
    const owner = ownedLife.get(aid); ownedLife.delete(aid);
    if (!owner || aid === session.AID) return;
    const entity = entityManager.get(aid);
    if (entity === session.Entity || entity && !isPlayer(entity)) return;
    const cache = entityManager.getLife(aid);
    const ownedCache = cache === owner.cache && cache?.hp === owner.hp && cache?.hp_max === owner.hp_max;
    if (ownedCache) {
      delete cache.hp; delete cache.hp_max;
      if (!Object.keys(cache).length) entityManager.removeLife(aid);
    }
    if (entity?.life && entity.life.hp === owner.hp && entity.life.hp_max === owner.hp_max
      && (entity === owner.entity || ownedCache)) {
      entity.life.hp = -1; entity.life.hp_max = -1; entity.life.remove();
    }
  }
  function clearAll() {
    for (const aid of members.keys()) releaseLife(aid);
    members.clear(); ownedLife.clear();
    for (const map of miniMaps()) map.clearPartyMemberMarks();
    refreshWorldMap();
  }
  function synchronize() {
    const next = [session.AID, session.GID, session.Entity];
    if (identity && next.some((value, index) => value !== identity[index])) clearAll();
    identity = next;
  }
  // Independent HP packets keep their native result and revoke party ownership.
  // SP/hunger-only writes do not replace the source of the cached HP fields.
  entityManager.storeLife = function (aid, data) {
    synchronize();
    const result = nativeStoreLife.call(this, aid, data);
    if (data.hp !== undefined || data.hp_max !== undefined) ownedLife.delete(aid);
    return result;
  };
  function remove(aid) {
    releaseLife(aid); members.delete(aid);
    for (const map of miniMaps()) map.removePartyMemberMark(aid);
  }
  const api = {
    setRoster(roster) {
      synchronize();
      if (!Array.isArray(roster) || roster.some(member => !validAid(member?.AID))) return false;
      const next = new Map(roster.map(member => [member.AID, { ...member }]));
      for (const [aid, previous] of members) {
        if (!next.has(aid) || previous.characterName !== next.get(aid).characterName) remove(aid);
      }
      members.clear(); for (const [aid, member] of next) members.set(aid, member);
      session.hasParty = members.size > 0;
      if (!session.hasParty) {
        session.isPartyLeader = false;
        for (const map of miniMaps()) map.clearPartyMemberMarks();
      }
      refreshWorldMap(); return true;
    },
    join(member) {
      synchronize();
      if (!validAid(member?.AID)) return false;
      const self = member.AID === session.AID;
      if (!self && !session.hasParty) return false;
      if (self && !session.hasParty) clearAll();
      const previous = members.get(member.AID);
      if (previous && previous.characterName !== member.characterName) remove(member.AID);
      members.set(member.AID, { ...previous, ...member });
      if (self) session.hasParty = true;
      refreshWorldMap(); return true;
    },
    leave(aid) {
      synchronize();
      if (!validAid(aid)) return;
      if (aid === session.AID) {
        clearAll(); session.hasParty = false; session.isPartyLeader = false;
      } else if (members.has(aid)) { remove(aid); refreshWorldMap(); }
    },
    canUpdate(aid) { synchronize(); return session.hasParty === true && members.has(aid); },
    storeLife(aid, data) {
      if (!api.canUpdate(aid)) return;
      nativeStoreLife.call(entityManager, aid, data);
      const entity = entityManager.get(aid);
      if (aid !== session.AID && entity !== session.Entity && (!entity || isPlayer(entity))) {
        ownedLife.set(aid, { entity, cache: entityManager.getLife(aid), hp: data.hp, hp_max: data.hp_max });
      }
    },
    reset() { synchronize(); clearAll(); session.hasParty = false; session.isPartyLeader = false; },
  };
  return api;
}

const paths = ['src/Engine/MapEngine/Group.js', 'src/UI/Components/MiniMap/MiniMapCommon.js'];
const marker = '/* lastro-party-state */';
const fail = label => { throw new Error('anchor:party-state:' + label); };
function region(source, path) {
  const anchor = '//#region ' + path, start = source.indexOf(anchor);
  if (start < 0 || !['\r', '\n', undefined].includes(source[start + anchor.length])
    || source.indexOf(anchor, start + anchor.length) >= 0) fail(path);
  const end = source.indexOf('//#endregion', start), next = source.indexOf('//#region ', start + anchor.length);
  if (end < 0 || next >= 0 && next < end) fail('region');
  const text = source.slice(start, end);
  if (/\r(?!\n)/.test(text) || text.includes('\r\n') && /(?<!\r)\n/.test(text)) fail('newlines');
  const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (file.parseDiagnostics.length) fail('syntax');
  return { start, text, file, newline: text.includes('\r\n') ? '\r\n' : '\n' };
}
function one(scope, predicate, label, root = scope.file) {
  const found = [];
  function visit(node) { if (predicate(node)) found.push(node); ts.forEachChild(node, visit); }
  visit(root); if (found.length !== 1) fail(label); return found[0];
}
/** Touch only party packet handlers and the shared minimap's party-marker array. */
export function patchRuntimePartyState(source) {
  if (!paths.some(path => source.includes('//#region ' + path))) return source;
  if (source.includes(marker)) fail('already-patched');
  const group = region(source, paths[0]), mini = region(source, paths[1]), edits = [];
  const add = (scope, start, end, text) => edits.push({ start: scope.start + start, end: scope.start + end,
    text: text.replace(/\r?\n/g, scope.newline) });
  const fn = name => {
    const node = one(group, node => ts.isFunctionDeclaration(node) && node.name?.text === name && node.body, name);
    if (node.parameters.length !== 1 || node.parameters[0].name.getText(group.file) !== 'pkt') fail(name + ':parameters');
    return node;
  };
  const call = (name, root, label) => one(group, node => ts.isCallExpression(node)
    && node.expression.getText(group.file) === name, label, root);
  const initialized = one(group, node => ts.isExpressionStatement(node) && node.getText(group.file) === '_partyName = "";', 'init');
  if (initialized.parent?.kind !== ts.SyntaxKind.Block) fail('init-block');
  add(group, group.text.indexOf('\n') + 1, group.text.indexOf('\n') + 1, 'var _lastroPartyState;\n');
  const create = fn('onPartyCreate'), list = fn('onPartyList'), join = fn('onPartyMemberJoin'), leave = fn('onPartyMemberLeave');
  const created = call('controller.getUI().setParty', create.body, 'created-roster');
  if (created.arguments.map(node => node.getText(group.file)).join(',') !== '_partyName,[memberData]'
    || !ts.isExpressionStatement(created.parent)) fail('created-roster');
  add(group, created.parent.end, created.parent.end, '\n      _lastroPartyState.setRoster([memberData]);');
  add(group, list.body.getStart(group.file) + 1, list.body.getStart(group.file) + 1, `
  if (!_lastroPartyState.setRoster(pkt.groupInfo)) return;
  if (!pkt.groupInfo.length) {
    controller.getUI().removePartyMember(SessionStorage_default.AID, SessionStorage_default.Entity?.display?.name || "");
    return;
  }
`);
  const mapRefresh = call('WorldMap_default.updatePartyMembers', list.body, 'list-map');
  if (!ts.isExpressionStatement(mapRefresh.parent) || mapRefresh.arguments[0]?.getText(group.file) !== 'pkt') fail('list-map');
  add(group, mapRefresh.parent.getStart(group.file), mapRefresh.parent.end, '');
  add(group, join.body.getStart(group.file) + 1, join.body.getStart(group.file) + 1,
    '\n  if (!_lastroPartyState.join(pkt)) return;\n');
  add(group, leave.body.getStart(group.file) + 1, leave.body.getStart(group.file) + 1,
    '\n  if (![0, 1, 2, 3].includes(pkt.result)) return;\n');
  const removed = call('controller.getUI().removePartyMember', leave.body, 'leave-roster');
  if (!ts.isExpressionStatement(removed.parent) || removed.arguments.map(node => node.getText(group.file)).join(',') !== 'pkt.AID,pkt.characterName') fail('leave-roster');
  add(group, removed.parent.getStart(group.file), removed.parent.getStart(group.file), '_lastroPartyState.leave(pkt.AID);\n  ');
  for (const name of ['onMemberLifeUpdate', 'onMemberMove$1', 'onPartyIsAlive']) {
    const handler = fn(name);
    add(group, handler.body.getStart(group.file) + 1, handler.body.getStart(group.file) + 1,
      '\n  if (!_lastroPartyState.canUpdate(pkt.AID)) return;\n');
    if (name === 'onMemberLifeUpdate') {
      const store = call('EntityManager.storeLife', handler.body, 'party-life');
      add(group, store.expression.getStart(group.file), store.expression.end, '_lastroPartyState.storeLife');
    }
  }
  const init = one(group, node => ts.isMethodDeclaration(node) && node.name.getText(group.file) === 'init'
    && ts.isClassExpression(node.parent) && node.parent.name?.text === 'GroupEngine', 'engine-init');
  add(group, init.body.getStart(group.file) + 1, init.body.getStart(group.file) + 1, `
      ${marker}
      // Group has a native initialization cycle through EntityManager. Install only once the engine is ready.
      _lastroPartyState ||= (${createLastroPartyState.toString()})({
        session: SessionStorage_default, entityManager: EntityManager,
        getMiniMaps: () => [MiniMap_default, MiniMapV2_default, Controller$5.getUI()], worldMap: WorldMap_default
      });
      _lastroPartyState.reset();
`);
  const removeMark = one(mini, node => ts.isExpressionStatement(node) && ts.isBinaryExpression(node.expression)
    && node.expression.left.getText(mini.file) === 'MiniMap.removePartyMemberMark', 'minimap-remove');
  function rejectExistingClear(node) {
    if (ts.isPropertyAccessExpression(node) && node.getText(mini.file) === 'MiniMap.clearPartyMemberMarks') fail('minimap-clear');
    ts.forEachChild(node, rejectExistingClear);
  }
  rejectExistingClear(mini.file);
  if (one(mini, node => ts.isVariableDeclaration(node) && node.name.getText(mini.file) === '_party', 'minimap-party').initializer?.getText(mini.file) !== '[]') fail('minimap-array');
  add(mini, removeMark.end, removeMark.end, '\n  MiniMap.clearPartyMemberMarks = function () { _party.length = 0; };\n');
  for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  return source;
}
