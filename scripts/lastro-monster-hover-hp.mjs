import ts from 'typescript';

// Serialized into EntityManager; every dependency stays inside this factory.
export function createLastroMonsterHoverHp({ getEntity, getLife, now = () => Date.now() }) {
  const marker = Symbol('lastro-monster-hover-hp');
  let states = new WeakMap(), epoch = 0, sample = 0;
  const unknown = '';
  function monster(entity) {
    return !!entity && typeof entity.constructor?.TYPE_MOB === 'number'
      && entity.objecttype === entity.constructor.TYPE_MOB;
  }
  function valid(hp, maxhp) {
    return Number.isSafeInteger(hp) && hp >= 0 && Number.isSafeInteger(maxhp)
      && maxhp > 0 && hp <= maxhp;
  }
  function compact(value) {
    const divisor = value >= 1e9 ? 1e9 : value >= 1e6 ? 1e6 : value >= 1e3 ? 1e3 : 1;
    if (divisor === 1) return String(value);
    // Divide by an integer before rounding, so 1005 consistently becomes 1.01k.
    const rounded = Math.round(value / (divisor / 100)) / 100;
    return rounded.toFixed(2).replace(/\.?0+$/, '')
      + (divisor === 1e9 ? 'b' : divisor === 1e6 ? 'm' : 'k');
  }
  function snapshot(hp, maxhp) {
    return { hp, maxhp, text: compact(hp) + ' / ' + compact(maxhp) };
  }
  function estimate(previous, percent) {
    // Only a complete server HP pair establishes a trusted maximum. Native
    // Life fields may contain the normalized percentage pair (e.g. 25/100).
    const known = valid(previous?.hp, previous?.maxhp);
    return known ? compact(Math.round(previous.maxhp * (percent / 100)))
      + ' / ' + compact(previous.maxhp) : '';
  }
  function percentage(previous, units) {
    const percent = units * 5;
    return { ...previous, percent, serverAt: now(), serverOrder: ++sample,
      serverText: estimate(previous, percent) };
  }
  function name(entity, rawName) {
    if (!monster(entity) || getEntity(entity.GID) !== entity || typeof rawName !== 'string') return;
    const match = rawName.match(/\bHP\s*[:：]\s*(\d+(?:\.\d+)?)\s*%/i);
    if (!match) return;
    const percent = Number(match[1]);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) return;
    const previous = states.get(entity);
    states.set(entity, { ...previous, namePercent: percent, nameOrder: ++sample,
      nameText: estimate(previous, percent) });
  }
  function cache(gid) {
    const value = getLife(gid);
    return value && typeof value === 'object' ? value : null;
  }
  function remove(gid) {
    const entity = getEntity(gid), life = cache(gid);
    if (entity) states.delete(entity);
    if (life) delete life[marker];
  }
  function update(gid, hp, maxhp) {
    if (!valid(hp, maxhp)) { remove(gid); return; }
    const entity = getEntity(gid), life = cache(gid);
    if (entity && !monster(entity)) { remove(gid); return; }
    const previous = entity && states.get(entity);
    const value = previous?.percent === undefined && previous?.namePercent === undefined
      && previous?.hp === hp && previous.maxhp === maxhp
      ? previous : snapshot(hp, maxhp);
    if (entity) {
      states.set(entity, value);
      if (life) delete life[marker];
    } else if (life) life[marker] = { epoch, owner: null, value };
  }
  function tiny(gid, units) {
    const entity = getEntity(gid);
    if (entity && !monster(entity)) { remove(gid); return; }
    // HP_INFO_TINY encodes five-percent steps. An invalid sample cannot
    // replace a confirmed value or become a fake absolute HP pair.
    if (!Number.isInteger(units) || units < 0 || units > 20) return;
    const life = cache(gid);
    if (entity) {
      states.set(entity, percentage(states.get(entity), units));
      if (life) delete life[marker];
    } else if (life) {
      const pending = life[marker];
      const previous = pending?.epoch === epoch && pending.owner === null ? pending.value : undefined;
      life[marker] = { epoch, owner: null, value: percentage(previous, units) };
    }
  }
  function spawn(entity, packet) {
    if (!monster(entity)) { if (entity) remove(entity.GID); return; }
    const gid = entity.GID, life = cache(gid);
    if (valid(packet?.hp, packet?.maxhp)) {
      const previous = states.get(entity);
      const value = previous?.percent === undefined && previous?.namePercent === undefined
        && previous?.hp === packet.hp && previous.maxhp === packet.maxhp
        ? previous : snapshot(packet.hp, packet.maxhp);
      states.set(entity, value);
      if (life) delete life[marker];
      return;
    }
    const unreported = packet?.hp === undefined && packet?.maxhp === undefined
      || packet?.hp === -1 && packet?.maxhp === -1;
    if (!unreported) {
      states.delete(entity);
      if (life) delete life[marker];
      return;
    }
    const pending = life?.[marker];
    if (pending?.epoch === epoch && pending.owner === null) {
      states.set(entity, pending.value);
      delete life[marker];
    }
  }
  function clear() { states = new WeakMap(); epoch++; }
  function text(entity) {
    if (!monster(entity)) return '';
    if (getEntity(entity.GID) !== entity) return unknown;
    const value = states.get(entity);
    if (!value) return unknown;
    const server = value.percent !== undefined, named = value.namePercent !== undefined;
    // A newer name is a fallback only after two seconds without a Tiny update.
    // Keep the last server sample when the cached name predates it. No polling
    // or timer is needed: the existing hover render reads this selection.
    if (named && (!server || value.nameOrder > value.serverOrder && now() - value.serverAt >= 2000))
      return value.nameText;
    return server ? value.serverText : value.text || unknown;
  }
  return { update, tiny, name, spawn, remove, clear, text };
}

function fail(label) { throw new Error('anchor:monster-hover-hp:' + label); }
function compact(text) { return text.replace(/\s/g, ''); }

function patchRegion(source, path, mutate) {
  const marker = '//#region ' + path, start = source.indexOf(marker);
  if (start < 0) return source;
  const end = source.indexOf('//#endregion', start), next = source.indexOf('//#region ', start + marker.length);
  if ((start > 0 && source[start - 1] !== '\n') || end < 0 || (next >= 0 && next < end)
    || source.indexOf(marker, start + marker.length) >= 0
    || !/^\r?\n/.test(source.slice(start + marker.length))) fail(path);
  const region = source.slice(start, end), eol = region.includes('\r\n') ? '\r\n' : '\n';
  if (/\r(?!\n)/.test(region) || (eol === '\r\n' && /(?<!\r)\n/.test(region))) fail(path + ':newlines');
  if (region.includes('lastro-monster-hover-hp-installed')) fail('already-installed');
  const file = ts.createSourceFile(path, region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS), edits = [];
  if (file.parseDiagnostics.length) fail(path + ':syntax');
  const find = predicate => {
    const matches = [];
    function visit(node) { if (predicate(node)) matches.push(node); ts.forEachChild(node, visit); }
    visit(file); return matches;
  };
  const one = (predicate, label) => {
    const matches = find(predicate);
    if (matches.length !== 1) fail(label);
    return matches[0];
  };
  const fn = name => {
    const value = one(node => ts.isFunctionDeclaration(node) && node.name?.text === name, name);
    if (!value.body) fail(name + ':body');
    return value;
  };
  mutate({ file, edits, find, one, fn });
  edits.push({ start: region.indexOf('\n') + 1, text: '// lastro-monster-hover-hp-installed\n' });
  let output = region;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    output = output.slice(0, edit.start) + edit.text.replace(/\r?\n/g, eol) + output.slice(edit.end ?? edit.start);
  }
  const check = ts.createSourceFile(path, output, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);
  if (check.parseDiagnostics.length) fail(path + ':output-syntax');
  return source.slice(0, start) + output + source.slice(end);
}

/** Add monster HP from complete values or a trusted maximum and percentage. */
export function patchRuntimeMonsterHoverHp(source) {
  const paths = ['src/Renderer/Entity/EntityDisplay.js', 'src/Renderer/EntityManager.js', 'src/Engine/MapEngine/Entity.js'];
  const missing = paths.filter(path => !source.includes('//#region ' + path));
  if (missing.length === paths.length) return source;
  if (missing.length) fail('regions:' + missing.join(','));
  source = patchRegion(source, 'src/Renderer/Entity/EntityDisplay.js', ({ file, edits, one, fn }) => {
    const init = fn('Init$7');
    if (init.parameters.length || compact(init.body.getText(file)) !== '{this.display=newDisplay();}') fail('display-owner');
    const display = one(node => ts.isClassExpression(node) && ts.isBinaryExpression(node.parent)
      && node.parent.left.getText(file) === 'Display', 'display-class');
    if (!ts.isExpressionStatement(display.parent.parent)) fail('display-class-context');
    const method = name => {
      const matches = display.members.filter(node => ts.isMethodDeclaration(node) && node.name.getText(file) === name);
      if (matches.length !== 1 || !matches[0].body) fail('display-' + name);
      return matches[0];
    };
    const update = method('update'), render = method('render');
    if (update.parameters.map(node => node.name.getText(file)).join(',') !== 'style'
      || render.parameters.map(node => node.name.getText(file)).join(',') !== 'matrix') fail('display-parameters');
    const declaration = (name, body) => one(node => ts.isVariableDeclaration(node) && node.name.getText(file) === name
      && node.parent.parent.parent === body, 'display-' + name);
    const font = declaration('fontSize', update.body), width = declaration('width', update.body);
    const height = declaration('height', update.body), padding = declaration('paddingTop', update.body);
    if (compact(font.initializer?.getText(file) ?? '') !== '12*dpr'
      || compact(padding.initializer?.getText(file) ?? '') !== '5'
      || compact(width.initializer?.getText(file) ?? '') !== 'Math.max(ctx.measureText(lines[0]).width,ctx.measureText(lines[1]).width,)+start_x+5'
      || compact(height.initializer?.getText(file) ?? '') !== 'fontSize*3*(lines[1].length?2:1)+paddingTop') fail('display-size');
    const last = update.body.statements[update.body.statements.length - 1];
    if (!ts.isIfStatement(last) || compact(last.expression.getText(file)) !== '!_isUglyShadow'
      || !last.elseStatement || !ts.isBlock(last.thenStatement) || !ts.isBlock(last.elseStatement)
      || compact(last.elseStatement.getText(file)) !== '{ctx.translate(0.5,0.5);ctx.fillStyle="black";ctx.outlineText(lines[0],start_x,paddingTop);ctx.outlineText(lines[1],start_x,fontSize*1.2+paddingTop);ctx.fillStyle=color;ctx.fillText(lines[0],start_x,paddingTop);ctx.fillText(lines[1],start_x,fontSize*1.2+paddingTop);}') fail('display-draw');
    const first = render.body.statements[0];
    if (!ts.isIfStatement(first) || first.expression.getText(file) !== 'this.gifEmblem'
      || !compact(render.body.getText(file)).endsWith('EntityOverlay.append(canvas);}')) fail('display-render');
    edits.push({ start: init.body.end - 1, text: '  this.display._lastroEntity = this;\n' });
    edits.push({ start: width.parent.getStart(file), text: `const lastroHpOwner = this._lastroEntity;
      const lastroHpText = lastroHpOwner && typeof lastroHpOwner.constructor?.TYPE_MOB === "number"
        && lastroHpOwner.objecttype === lastroHpOwner.constructor.TYPE_MOB
        && EntityManager.getOverEntity() === lastroHpOwner
        ? EntityManager._lastroMonsterHoverHp.text(lastroHpOwner) : "";
      this._lastroMonsterHpText = lastroHpText;
      let lastroHpWidth = 0;
      if (lastroHpText) {
        ctx.save();
        ctx.font = (Map_default.showname ? "bold " : "") + fontSize * 0.75 + "px Arial";
        lastroHpWidth = ctx.measureText(lastroHpText).width;
        ctx.restore();
      }
      ` });
    edits.push({ start: width.initializer.getStart(file), end: width.initializer.end,
      text: 'Math.max(ctx.measureText(lines[0]).width, ctx.measureText(lines[1]).width, lastroHpWidth) + start_x + 5' });
    edits.push({ start: last.end, text: `
      if (lastroHpText) {
        const lastroHpY = paddingTop + fontSize * 1.2 * (lines[1].length ? 2 : 1);
        const lastroHpX = (ctx.canvas.width - lastroHpWidth) / 2;
        ctx.save();
        ctx.font = (Map_default.showname ? "bold " : "") + fontSize * 0.75 + "px Arial";
        ctx.textBaseline = "top";
        if (!_isUglyShadow) {
          multiShadow(ctx, lastroHpText, lastroHpX, lastroHpY, 0, -1, 0);
          multiShadow(ctx, lastroHpText, lastroHpX, lastroHpY, 0, 1, 0);
          multiShadow(ctx, lastroHpText, lastroHpX, lastroHpY, -1, 0, 0);
          multiShadow(ctx, lastroHpText, lastroHpX, lastroHpY, 1, 0, 0);
          ctx.fillStyle = color;
          ctx.strokeStyle = "black";
          ctx.strokeText(lastroHpText, lastroHpX, lastroHpY);
        } else {
          ctx.fillStyle = "black";
          ctx.outlineText(lastroHpText, lastroHpX, lastroHpY);
          ctx.fillStyle = color;
        }
        ctx.fillText(lastroHpText, lastroHpX, lastroHpY);
        ctx.restore();
      }` });
    edits.push({ start: render.body.getStart(file) + 1, text: `
      const lastroOwner = this._lastroEntity;
      const lastroMonster = lastroOwner && typeof lastroOwner.constructor?.TYPE_MOB === "number"
        && lastroOwner.objecttype === lastroOwner.constructor.TYPE_MOB;
      const lastroHpText = lastroMonster && EntityManager.getOverEntity() === lastroOwner
        ? EntityManager._lastroMonsterHoverHp.text(lastroOwner) : "";
      if (lastroHpText !== (this._lastroMonsterHpText || "")) {
        if (lastroMonster) this.update(this.STYLE.MOB);
        else if (lastroOwner) this.refresh(lastroOwner);
        else this.update();
      }` });
  });
  source = patchRegion(source, 'src/Renderer/EntityManager.js', ({ file, edits, one, fn }) => {
    const free = fn('free'), remove = fn('removeEntity'), removeGid = fn('removeGID');
    if (free.parameters.length || remove.parameters.map(node => node.name.getText(file)).join(',') !== 'gid'
      || removeGid.parameters.map(node => node.name.getText(file)).join(',') !== 'gid'
      || compact(removeGid.body.getText(file)) !== '{_gidMap.delete(gid);}'
      || !compact(free.body.getText(file)).includes('_gidMap.clear();')
      || !compact(remove.body.getText(file)).startsWith('{constentity=_gidMap.get(gid);if(entity){releaseGr2(entity);entity.clean();')) fail('manager-cleanup');
    const manager = one(node => ts.isBinaryExpression(node) && node.left.getText(file) === 'EntityManager'
      && ts.isObjectLiteralExpression(node.right), 'manager-object');
    if (!ts.isExpressionStatement(manager.parent) || !ts.isBlock(manager.parent.parent)
      || manager.right.properties.some(node => node.name?.getText(file) === '_lastroMonsterHoverHp')) fail('manager-init');
    for (const [name, expected] of [['get', 'getEntity'], ['getLife', 'getLife'], ['getOverEntity', 'getOverEntity']]) {
      const properties = manager.right.properties.filter(node => node.name?.getText(file) === name);
      if (properties.length !== 1 || !(ts.isShorthandPropertyAssignment(properties[0]) && expected === name)
        && !(ts.isPropertyAssignment(properties[0]) && properties[0].initializer.getText(file) === expected)) fail('manager-' + name);
    }
    const store = fn('storeLife'), getLife = fn('getLife');
    if (store.parameters.map(node => node.name.getText(file)).join(',') !== 'gid,data'
      || compact(store.body.statements[0]?.getText(file) ?? '') !== 'constexisting=_lifeCache.get(gid)||{};'
      || compact(store.body.statements[store.body.statements.length - 1]?.getText(file) ?? '') !== '_lifeCache.set(gid,existing);'
      || compact(getLife.body.getText(file)) !== '{return_lifeCache.get(gid)||null;}') fail('manager-life-cache');
    edits.push({ start: manager.parent.end, text: `
  EntityManager._lastroMonsterHoverHp = (${createLastroMonsterHoverHp.toString()})({
    getEntity: gid => EntityManager.get(gid),
    getLife: gid => EntityManager.getLife(gid),
  });` });
    edits.push({ start: free.body.getStart(file) + 1, text: '\n  EntityManager._lastroMonsterHoverHp.clear();' });
    for (const method of [remove, removeGid]) {
      edits.push({ start: method.body.getStart(file) + 1, text: '\n  EntityManager._lastroMonsterHoverHp.remove(gid);' });
    }
  });
  return patchRegion(source, 'src/Engine/MapEngine/Entity.js', ({ file, edits, one, fn }) => {
    const exact = fn('onEntityLifeUpdate'), tiny = fn('onEntityLifeUpdateTiny'), spawn = fn('onEntitySpam');
    const identity = fn('onEntityIdentity');
    for (const method of [exact, tiny, spawn, identity]) {
      if (method.parameters.map(node => node.name.getText(file)).join(',') !== 'pkt') fail(method.name.text + ':parameters');
    }
    if (compact(exact.body.getText(file)) !== '{EntityManager.storeLife(pkt.AID,{hp:pkt.hp,hp_max:pkt.maxhp,});constentity=EntityManager.get(pkt.AID);if(entity){entity.life.hp=pkt.hp;entity.life.hp_max=pkt.maxhp;entity.life.update();entity.life.display=true;}}'
      || compact(tiny.body.getText(file)) !== '{consthp=pkt.hp*5;EntityManager.storeLife(pkt.GID,{hp,hp_max:100,});constentity=EntityManager.get(pkt.GID);if(entity){entity.life.hp=hp;entity.life.hp_max=100;entity.life.update();entity.life.display=true;}}') fail('packet-life-handlers');
    const first = spawn.body.statements[0], second = spawn.body.statements[1];
    if (compact(first?.getText(file) ?? '') !== 'letentity=EntityManager.get(pkt.GID);'
      || !ts.isIfStatement(second) || second.expression.getText(file) !== 'entity'
      || compact(second.thenStatement.getText(file)) !== 'entity.set(pkt);' || !second.elseStatement
      || !ts.isBlock(second.elseStatement)
      || compact(second.elseStatement.statements[0]?.getText(file) ?? '') !== 'entity=newEntity();'
      || compact(second.elseStatement.statements[1]?.getText(file) ?? '') !== 'entity.set(pkt);'
      || second.elseStatement.statements.filter(node => compact(node.getText(file)) === 'EntityManager.add(entity);').length !== 1
      || !compact(second.elseStatement.getText(file)).includes('constcachedLife=EntityManager.getLife(entity.GID);if(cachedLife&&entity.life.hp<=-1){')) fail('packet-spawn');
    edits.push({ start: exact.body.end - 1, text: '  EntityManager._lastroMonsterHoverHp.update(pkt.AID, pkt.hp, pkt.maxhp);\n' });
    edits.push({ start: tiny.body.end - 1, text: '  EntityManager._lastroMonsterHoverHp.tiny(pkt.GID, pkt.hp);\n' });
    const complete = one(node => ts.isBinaryExpression(node)
      && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && node.getStart(file) >= identity.body.getStart(file) && node.end <= identity.body.end
      && node.left.getText(file) === 'entity.display.load'
      && node.right.getText(file) === 'entity.display.TYPE.COMPLETE', 'packet-identity-load');
    if (!ts.isExpressionStatement(complete.parent)) fail('packet-identity-load-context');
    edits.push({ start: complete.parent.end, text: '\n    EntityManager._lastroMonsterHoverHp.name(entity, pkt.CName);' });
    edits.push({ start: second.end, text: '\n  EntityManager._lastroMonsterHoverHp.spawn(entity, pkt);' });
  });
}
