// Keyboard and mouse quick cast. Keep the native skill send/range/path flow.
import ts from 'typescript';

function replaceRegion(source, name, install, target) {
  const marker = '//#region ' + name;
  const start = source.indexOf(marker);
  if (start < 0 || source.indexOf(marker, start + marker.length) !== -1)
    throw new Error('anchor:quick-cast:' + name);
  const end = source.indexOf('//#endregion', start);
  if (end < 0) throw new Error('anchor:quick-cast:end:' + name);
  const region = source.slice(start, end);
  const file = ts.createSourceFile(name, region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const assignments = [];
  function visit(node) {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        node.left.getText(file) === target && ts.isFunctionExpression(node.right)) assignments.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (assignments.length !== 1 || !ts.isExpressionStatement(assignments[0].parent))
    throw new Error('anchor:quick-cast:assignment:' + target);
  const position = start + assignments[0].parent.end;
  // Insert within the native lazy initializer, immediately after the method exists.
  return source.slice(0, position) + '\\n' + install + '\\n' + source.slice(position);
}

export function patchRuntimeQuickCast(source) {
  if (source.includes('lastroQuickCastNativeSet')) throw new Error('anchor:quick-cast:duplicate');

  // Settings live in the existing native game settings window. Missing preference
  // means enabled, including upgrades from old Controls storage.
  source = replaceRegion(source, 'src/UI/Components/GraphicsOption/GraphicsOption.js', `
  {
    const lastroQuickCastInit = GraphicsOption.init;
    GraphicsOption.init = function (...args) {
      const result = lastroQuickCastInit?.apply(this, args);
      const table = this.getRoot()?.querySelector('#basic table');
      if (table && !table.querySelector('.lastro-quick-cast')) {
        const row = document.createElement('tr');
        const title = document.createElement('td');
        const value = document.createElement('td');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        title.textContent = '快捷施法';
        checkbox.type = 'checkbox';
        checkbox.className = 'lastro-quick-cast';
        checkbox.checked = Controls_default.quickCast !== false;
        label.title = '攻击技能优先对鼠标指向的怪物施放，否则选择最近的怪物；辅助和地面技能仍需手动指定目标。';
        label.append(checkbox, document.createTextNode(' 启用鼠标和键盘快捷施法'));
        value.append(label);
        row.append(title, value);
        table.append(row);
        checkbox.addEventListener('change', () => {
          Controls_default.quickCast = checkbox.checked;
          Controls_default.save();
        });
      }
      const checkbox = table?.querySelector('.lastro-quick-cast');
      if (checkbox) checkbox.checked = Controls_default.quickCast !== false;
      return result;
    };
  }
  `, 'GraphicsOption.init');

  source = replaceRegion(source, 'src/UI/Components/SkillTargetSelection/SkillTargetSelection.js', `
  // Only pure ENEMY-targeted skills are eligible. FRIEND, PLACE, PET, TRAP,
  // and mixed-target skills retain native manual selection.
  const lastroQuickCastNativeSet = SkillTargetSelection.set;
  SkillTargetSelection.set = function (skill, targetType, description) {
    const result = lastroQuickCastNativeSet.apply(this, arguments);
    if (Controls_default.quickCast === false ||
        targetType !== SkillTargetSelection.TYPE.ENEMY ||
        !skill || !Number.isInteger(skill.SKID) || skill.SKID <= 0 ||
        Mouse.state !== Mouse.MOUSE_STATE.USESKILL ||
        !SessionStorage_default.Entity) return result;

    const player = SessionStorage_default.Entity;
    const isValidMob = entity =>
      !!entity && entity !== player && entity.objecttype === Entity.TYPE_MOB &&
      Number.isInteger(entity.GID) && entity.GID > 0 &&
      entity.action !== entity.ACTION?.DIE &&
      Array.isArray(entity.position) && entity.position.length >= 2 &&
      Number.isFinite(entity.position[0]) && Number.isFinite(entity.position[1]);

    // A hovered monster wins; otherwise use the already implemented
    // controller nearest-entity helper, explicitly restricted to mobs.
    let entity = EntityManager.getOverEntity?.();
    if (!isValidMob(entity))
      entity = EntityManager.getClosestEntity?.(player, Entity.TYPE_MOB);
    if (!isValidMob(entity)) return result;

    const level = skill.useLevel || skill.level;
    if (!Number.isFinite(level) || level <= 0) return result;
    // Use the native selection callback, never synthesize a click or packet.
    SkillTargetSelection.onUseSkillToId(skill.SKID, level, entity.GID);
    SkillTargetSelection.remove();
    return result;
  };
  `, 'SkillTargetSelection.set');

  return source;
}
