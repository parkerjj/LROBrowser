import ts from 'typescript';

function insertAfterAssignment(source, regionName, assignmentName, injected) {
  const marker = '//#region ' + regionName;
  const start = source.indexOf(marker);
  if (start < 0 || source.indexOf(marker, start + marker.length) !== -1)
    throw new Error('anchor:quick-cast:region:' + regionName);
  const end = source.indexOf('//#endregion', start);
  if (end < 0) throw new Error('anchor:quick-cast:end:' + regionName);
  const region = source.slice(start, end);
  const ast = ts.createSourceFile(regionName, region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const found = [];
  function visit(node) {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        node.left.getText(ast) === assignmentName && ts.isFunctionExpression(node.right))
      found.push(node);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  if (found.length !== 1 || !ts.isExpressionStatement(found[0].parent))
    throw new Error('anchor:quick-cast:assignment:' + assignmentName);
  const position = start + found[0].parent.end;
  return source.slice(0, position) + '\n' + injected + '\n' + source.slice(position);
}

function installShortcutQuickCast(component, doc, controls) {
  const nativeInit = component.init;
  component.init = function (...args) {
    const root = this.getRoot();
    if (root && !root.querySelector('.lastro-quick-cast-enabled')) {
      const tabs = root.querySelector('.tabs');
      const panel = root.querySelector('.panel');
      if (tabs && panel) {
        const tab = doc.createElement('button');
        tab.className = 't_quickcast';
        tab.dataset.index = 't_quickcast';
        tab.textContent = '键鼠施法';
        tabs.appendChild(tab);

        const content = doc.createElement('div');
        content.className = 'content t_quickcast';
        const table = doc.createElement('table');
        table.setAttribute('border', '1');
        table.setAttribute('cellspacing', '0');
        table.setAttribute('bordercolor', '#aaa');
        const body = doc.createElement('tbody');
        table.appendChild(body);
        content.appendChild(table);
        panel.insertBefore(content, panel.querySelector('.button.reset'));

        function row(title) {
          const tr = doc.createElement('tr');
          const heading = doc.createElement('td');
          const value = doc.createElement('td');
          heading.textContent = title;
          tr.append(heading, value);
          body.appendChild(tr);
          return value;
        }
        const boxCell = row('快捷施法');
        const label = doc.createElement('label');
        const checkbox = doc.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'lastro-quick-cast-enabled';
        label.append(checkbox, doc.createTextNode(' 启用键鼠快捷施法'));
        label.title = '只有敌对单体目标技能才会自动选怪；治疗、辅助、地面和混合目标技能保持手动操作。';
        boxCell.appendChild(label);
        checkbox.addEventListener('change', () => {
          controls.quickCast = checkbox.checked;
          controls.save();
        });

        const modeCell = row('攻击目标选择');
        const mode = doc.createElement('select');
        mode.className = 'lastro-quick-cast-mode';
        for (const [value, title] of [
          ['hover-nearest', '鼠标优先，无目标时选择最近怪物'],
          ['hover-only', '仅鼠标指向的怪物'],
          ['nearest-only', '始终选择最近的怪物']
        ]) {
          const option = doc.createElement('option');
          option.value = value;
          option.textContent = title;
          mode.appendChild(option);
        }
        modeCell.appendChild(mode);
        mode.addEventListener('change', () => {
          controls.quickCastTargetMode = mode.value;
          controls.save();
        });
      }
    }
    const checkbox = root?.querySelector('.lastro-quick-cast-enabled');
    const mode = root?.querySelector('.lastro-quick-cast-mode');
    if (checkbox) checkbox.checked = controls.quickCast !== false;
    if (mode) {
      const saved = controls.quickCastTargetMode;
      mode.value = saved === 'hover-only' || saved === 'nearest-only' ? saved : 'hover-nearest';
    }
    return nativeInit?.apply(this, args);
  };
}

function installSkillQuickCast(selector, controls, session, mouse, entityManager, entityTypes) {
  const nativeSet = selector.set;
  selector.set = function (skill, targetType) {
    const result = nativeSet.apply(this, arguments);
    if (controls.quickCast === false ||
        targetType !== selector.TYPE.ENEMY ||
        !skill || !Number.isInteger(skill.SKID) || skill.SKID <= 0 ||
        !session.Entity || mouse.state !== mouse.MOUSE_STATE.USESKILL ||
        typeof selector.onUseSkillToId !== 'function') return result;

    const player = session.Entity;
    const isMonster = entity =>
      !!entity && entity !== player &&
      entity.objecttype === entityTypes.TYPE_MOB &&
      Number.isInteger(entity.GID) && entity.GID > 0 &&
      entity.action !== entity.ACTION?.DIE &&
      !entity.remove_tick &&
      // glMatrix.vec3.create() returns a Float32Array, not a JavaScript Array.
      entity.position != null &&
      Number.isFinite(entity.position[0]) && Number.isFinite(entity.position[1]);

    const mode = controls.quickCastTargetMode;
    let target = mode === 'nearest-only' ? null : entityManager.getOverEntity?.();
    if (!isMonster(target)) target = null;
    if (!target && mode !== 'hover-only')
      target = entityManager.getClosestEntity?.(player, entityTypes.TYPE_MOB);
    if (!isMonster(target)) return result;

    const level = skill.useLevel || skill.level;
    if (!Number.isFinite(level) || level <= 0) return result;
    selector.onUseSkillToId(skill.SKID, level, target.GID);
    selector.remove();
    return result;
  };
}

function patchRuntimeQuickCast(source) {
  if (source.includes('lastroQuickCastNativeSet') ||
      source.includes('installSkillQuickCast('))
    throw new Error('anchor:quick-cast:already-patched');
  source = insertAfterAssignment(
    source, 'src/UI/Components/ShortCutOption/ShortCutOption.js', 'ShortCutOption.init',
    '(' + installShortcutQuickCast.toString() + ')(ShortCutOption, globalThis.document, Controls_default);'
  );
  source = insertAfterAssignment(
    source, 'src/UI/Components/SkillTargetSelection/SkillTargetSelection.js', 'SkillTargetSelection.set',
    '(' + installSkillQuickCast.toString() + ')(SkillTargetSelection, Controls_default, SessionStorage_default, Mouse, EntityManager, Entity);'
  );
  const checked = ts.createSourceFile('quick-cast-runtime.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (checked.parseDiagnostics.length)
    throw new Error('quick-cast:invalid-javascript:' + checked.parseDiagnostics[0].messageText);
  return source;
}

export { patchRuntimeQuickCast };
