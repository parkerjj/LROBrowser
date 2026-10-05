import ts from 'typescript';
import { installLastroCardState } from './lastro-card-state.mjs';
import { installLastroCardDeck } from './lastro-card-deck.mjs';
import { installLastroCardDeckUI } from './lastro-card-deck-ui.mjs';
import { installLastroCardArt } from './lastro-card-art.mjs';

const paths = ['src/UI/Components/CardConnection/CardConnection2', 'src/Engine/MapEngine.js',
  'src/Network/NetworkManager.js', 'src/Engine/MapEngine/Main.js'];
const marker = '/* lastro-card-collection */';
function fail(label) { throw new Error('anchor:card-collection:' + label); }
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
function one(scope, predicate, label) {
  const found = [];
  function visit(node) { if (predicate(node)) found.push(node); ts.forEachChild(node, visit); }
  visit(scope.file); if (found.length !== 1) fail(label); return found[0];
}

/** Keep card state in the native component, with narrow lifecycle and server-notice hooks. */
export function patchRuntimeCardCollection(source) {
  if (!paths.some(path => source.includes('//#region ' + path))) return source;
  if (source.includes(marker)) fail('already-patched');
  const card = region(source, paths[0]), map = region(source, paths[1]), network = region(source, paths[2]), main = region(source, paths[3]);
  const creation = one(card, node => ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
    && node.left.getText(card.file) === 'CardConnection2' && ts.isCallExpression(node.right)
    && node.right.expression.getText(card.file) === 'createCardCollectionComponent', 'component');
  if (!ts.isExpressionStatement(creation.parent)) fail('component');
  const fn = (scope, name) => one(scope, node => ts.isFunctionDeclaration(node) && node.name?.text === name && node.body, name);
  const changeMap = fn(map, 'onMapChange'), cleanup = fn(map, 'cleanGameUI'), close = fn(network, 'onClose$9');
  const notice = fn(main, 'onPlayerMessage');
  const installation = `
  ${marker}
  init_SessionStorage(); init_Preferences$1(); init_KeyEventHandler(); init_Inventory();
  (${installLastroCardState.toString()})(CardConnection2, {
    document, listCardEntries, CARD_CONNECTION_TABS,
    getInventory: () => InventoryController.getUI(),
    resolveCategoryCardAction: entry => entry.state > 1
      ? {badgeText:"已加入卡组",badgeKind:"indeck",action:{label:"已在卡组",kind:"",tab:entry.tab,level:entry.level,disabled:true}}
      : entry.state > 0
        ? {badgeText:"已充能",badgeKind:"charged",action:{action:"add-deck",label:"加入卡组",kind:"btn-gold",tab:entry.tab,level:entry.level}}
        : {badgeText:"未充能",badgeKind:"",action:{action:"recharge",label:"充能",tab:entry.tab,level:entry.level}}
  });
  const lastroDeck = (${installLastroCardDeck.toString()})(CardConnection2, {
    getSession: () => {
      const session = SessionStorage_default;
      const valid = Number.isInteger(session.AID) && session.AID > 0 && Number.isInteger(session.GID) && session.GID > 0;
      return {
        key: valid ? JSON.stringify([session.ServerName || "", Configs.get("lastroNid",5), session.AID, session.GID]) : null,
        connection: _socket || null,
        playing: valid && session.Playing === true && _socket?.connected === true && _socket?.isZone === true && !_socket.handoffPending
      };
    },
    getDefaults: () => getCardConnectionData(Configs.get("lastroNid",5)),
    loadPreferences: key => Preferences.get("LastROCardDeck:" + key, {_key:"LastROCardDeck:" + key,_version:1,presets:[null,null,null,null],names:["卡册 1","卡册 2","卡册 3","卡册 4"],activePreset:null,activeCards:null}, 1),
    setTimeout, clearTimeout,
    notify: (success, index, name, reason) => {
      init_Announce(); Announce_default.append();
      const notice = Announce_default, host = notice._host;
      if (host) {
        if (!notice._lastroCardDeckNotice) {
          const previous = {value:host.style.getPropertyValue("z-index"),priority:host.style.getPropertyPriority("z-index"),remove:notice.onRemove};
          notice._lastroCardDeckNotice = previous;
          notice.onRemove = function (...args) {
            try { return previous.remove?.apply(this,args); }
            finally {
              if (previous.value) host.style.setProperty("z-index",previous.value,previous.priority);
              else host.style.removeProperty("z-index");
              this.onRemove = previous.remove; delete this._lastroCardDeckNotice;
            }
          };
        }
        const cardZ = CardConnection2._host ? Number.parseInt(document.defaultView?.getComputedStyle(CardConnection2._host).zIndex,10) || 120 : 120;
        host.style.setProperty("z-index",String(Math.max(120,cardZ)+2),"important");
      }
      Announce_default.set(success ? "切换成功：已切换至「" + name + "」" : "切换失败：「" + name + "」" + (reason ? "，" + reason : ""),
        success ? "#63d68e" : "#ffb4a8", {fontSize:12,life:3000});
    }
  });
  (${installLastroCardDeckUI.toString()})(CardConnection2, {
    document, ...lastroDeck,
    select: index => CardConnection2.selectDeckPreset(index), save: index => CardConnection2.saveDeckPreset(index),
    activate: index => CardConnection2.activateDeckPreset(index), rename: (index, name) => CardConnection2.renameDeckPreset(index, name)
  });
  (${installLastroCardArt.toString()})(CardConnection2, {
    document, DB, Client, UIManager,
    getItemInfo: () => { init_ItemInfo(); return ItemInfo_default; }
  });
`;
  const guard = 'if (typeof CardConnection2 !== "undefined") CardConnection2?._lastroCardDeck?.invalidate';
  const edits = [
    { scope: card, start: creation.parent.end, text: installation },
    { scope: map, start: changeMap.body.getStart(map.file) + 1, text: '\n  ' + guard + '(false);\n' },
    { scope: map, start: cleanup.body.getStart(map.file) + 1, text: '\n  ' + guard + '(true);\n' },
    { scope: network, start: close.body.getStart(network.file) + 1,
      text: '\n  if (this === _socket && this.isZone) { ' + guard + '(true); }\n' },
    { scope: main, start: notice.body.getStart(main.file) + 1,
      text: '\n  if (typeof CardConnection2 !== "undefined") CardConnection2?._lastroCardDeck?.onServerNotice(pkt.msg);\n' },
  ];
  for (const edit of edits.sort((a, b) => b.scope.start + b.start - a.scope.start - a.start)) {
    const start = edit.scope.start + edit.start;
    source = source.slice(0, start) + edit.text.replace(/\r?\n/g, edit.scope.newline) + source.slice(start);
  }
  return source;
}
