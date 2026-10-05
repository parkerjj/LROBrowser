import ts from 'typescript';

/* global SessionStorage_default, Configs, MapRenderer, Altitude, PACKET,
  lastroBeginMovementConfirmation, lastroFinishMovementConfirmation,
  lastroCancelMovement, lastroResetMovementVisual */

function lastroBeginMovementState(entity, packet) {
  if (entity !== SessionStorage_default.Entity) return null;
  const structures = typeof PACKET === 'undefined' ? null : PACKET.ZC;
  let name = null;
  if (structures && packet) {
    for (const key of Object.keys(structures)) {
      if (/^(?:LASTRO_)?NOTIFY_(?:STANDENTRY\d*|NEWENTRY\d*|ACTENTRY|MOVEENTRY\d*)$/.test(key)
          && typeof structures[key] === 'function' && packet.constructor === structures[key]) {
        name = key;
        break;
      }
    }
  }
  const position = packet?.PosDir, moving = packet?.MoveData !== undefined;
  const lastro = Configs.get('lastroProtocol', false), loading = MapRenderer.loading;
  const width = Altitude.width, height = Altitude.height;
  const valid = position?.length >= 3 && Number.isInteger(width) && Number.isInteger(height)
    && width > 0 && height > 0 && Number.isInteger(position[0]) && Number.isInteger(position[1])
    && position[0] >= 0 && position[1] >= 0 && position[0] < width && position[1] < height
    && position[0] <= 32767 && position[1] <= 32767
    && Number.isInteger(position[2]) && position[2] >= 0 && position[2] < 8;
  const standing = !!name && /^(?:LASTRO_)?NOTIFY_STANDENTRY\d*$/.test(name);

  if (!lastro || loading || !valid || moving) return null;
  try {
    if (!Number.isFinite(Altitude.getCellType(position[0], position[1]))
        || !Number.isFinite(Altitude.getCellHeight(position[0], position[1]))) return null;
  } catch { return null; }
  return standing
    ? { standing: true, confirmation: lastroBeginMovementConfirmation(entity, 0, true) }
    : { standing: false };
}

function lastroFinishMovementState(entity, token) {
  if (!token || entity !== SessionStorage_default.Entity) return;
  if (token.standing) {
    lastroCancelMovement(entity);
    lastroFinishMovementConfirmation(entity, token.confirmation);
  } else lastroResetMovementVisual(entity, 'state-entry');
}

export function patchRuntimeMovementState(source) {
  const marker = '//#region src/Engine/MapEngine/Entity.js', start = source.indexOf(marker);
  if (start < 0) return source;
  const fail = () => { throw new Error('anchor:movement-state'); };
  const end = source.indexOf('//#endregion', start), next = source.indexOf('//#region', start + marker.length);
  if (end < 0 || next >= 0 && next < end || source.indexOf(marker, start + marker.length) >= 0
      || source.includes('function lastroBeginMovementState(')) fail();
  const region = source.slice(start, end).replace(/\r\n/g, '\n');
  const file = ts.createSourceFile('Entity.js', region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const functions = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === 'onEntitySpam');
  if (functions.length !== 1 || !functions[0].body
      || functions[0].parameters.map(node => node.name.getText(file)).join(',') !== 'pkt') fail();
  const matches = [];
  function inspect(node) {
    if (ts.isIfStatement(node) && node.expression.getText(file) === 'entity'
        && node.thenStatement.getText(file) === 'entity.set(pkt);') matches.push(node.thenStatement);
    ts.forEachChild(node, inspect);
  }
  inspect(functions[0].body);
  if (matches.length !== 1) fail();
  const anchor = matches[0], replacement = `{
    const lastroStateView = lastroBeginMovementState(entity, pkt);
    entity.set(pkt);
    lastroFinishMovementState(entity, lastroStateView);
  }`;
  const output = region.slice(0, anchor.getStart(file)) + replacement + region.slice(anchor.end);
  return source.slice(0, start) + lastroBeginMovementState.toString() + '\n'
    + lastroFinishMovementState.toString() + '\n' + output + source.slice(end);
}
