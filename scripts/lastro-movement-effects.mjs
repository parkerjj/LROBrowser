import ts from 'typescript';

/* global SessionStorage_default, Configs, lastroMovementVisual, lastroMovementVisualDirection */

// Native attached effects retain the authority array. Resolve their owner only
// while rendering; world effects with copied positions keep their fixed origin.
function lastroMovementEffectOwner(effect, boundOwner) {
  if (typeof SessionStorage_default === 'undefined' || !SessionStorage_default.Entity
      || typeof Configs === 'undefined' || !Configs.get('lastroProtocol', false)
      || typeof lastroMovementVisual !== 'function' || typeof lastroMovementVisualDirection !== 'function') return null;
  const params = effect._Params;
  if (params?.effect && params.effect.attachedEntity !== true) return null;
  const owner = boundOwner || (params?.effect?.attachedEntity === true ? params.Init?.ownerEntity : null);
  if (owner !== SessionStorage_default.Entity) return null;
  // STR attachments explicitly bind an owner and refresh their position every
  // frame. Other native effects follow only when their position is its array.
  if (!boundOwner && effect.position !== owner.position) return null;
  return owner;
}

const effectRegions = [
  ['src/Renderer/Effects/StrEffect.js', 'StrEffect'],
  ['src/Renderer/Effects/SwirlingAura.js', 'SwirlingAura'],
  ['src/Renderer/Effects/GroundAura.js', 'GroundAura'],
  ['src/Renderer/Effects/Level99Bubble.js', 'Level99Bubble'],
  ['src/Renderer/Effects/SpiritSphere.js', 'SpiritSphere'],
  ['src/Renderer/Effects/WarlockSphere.js', 'WarlockSphere'],
];

export function patchRuntimeMovementEffects(source) {
  const present = effectRegions.filter(([name]) => source.includes('//#region ' + name));
  if (!present.length) return source;
  const fail = () => { throw new Error('anchor:movement-effects'); };
  if (source.includes('function lastroMovementEffectOwner(')) fail();
  let output = source;
  for (const [name, className] of present) {
    const marker = '//#region ' + name, start = output.indexOf(marker);
    const end = output.indexOf('//#endregion', start);
    const nextRegion = output.indexOf('//#region', start + marker.length);
    if (end < start || nextRegion >= 0 && nextRegion < end || output.indexOf(marker, start + marker.length) >= 0) fail();
    const region = output.slice(start, end).replace(/\r\n/g, '\n');
    const file = ts.createSourceFile(name, region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const classes = [];
    function findClass(node) {
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
          && node.left.getText(file) === className && ts.isClassExpression(node.right)) classes.push(node.right);
      ts.forEachChild(node, findClass);
    }
    findClass(file);
    if (classes.length !== 1) fail();
    const methods = classes[0].members.filter(node => ts.isMethodDeclaration(node)
      && node.name.getText(file) === 'render' && !node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword));
    if (methods.length !== 1 || !methods[0].body
        || methods[0].parameters.map(node => node.name.getText(file)).join(',') !== 'gl,tick') fail();
    const body = methods[0].body, edits = [];
    let ownerPositions = 0, ownerDirections = 0, positions = 0;
    function inspect(node) {
      if (ts.isPropertyAccessExpression(node)) {
        const object = node.expression.getText(file), property = node.name.text;
        if (object === 'this' && property === 'position') positions++;
        if (className === 'StrEffect' && object === 'this.ownerEntity' && ['position', 'direction'].includes(property)) {
          const replacement = property === 'position'
            ? '(lastroEffectOwner ? lastroEffectPosition : this.ownerEntity.position)'
            : '(lastroEffectOwner ? lastroMovementVisualDirection(lastroEffectOwner) : this.ownerEntity.direction)';
          edits.push({ start: node.getStart(file), end: node.end, text: replacement });
          if (property === 'position') ownerPositions++;
          else ownerDirections++;
          return;
        }
      }
      ts.forEachChild(node, inspect);
    }
    inspect(body);
    if (!positions || className === 'StrEffect' && (ownerPositions !== 2 || ownerDirections !== 1)) fail();
    let original = region.slice(body.getStart(file) + 1, body.end - 1);
    const bodyStart = body.getStart(file) + 1;
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      original = original.slice(0, edit.start - bodyStart) + edit.text + original.slice(edit.end - bodyStart);
    }
    const owner = className === 'StrEffect' ? 'this.ownerEntity' : 'undefined';
    const wrapped = `{
      const lastroEffectOwner = lastroMovementEffectOwner(this, ${owner});
      const lastroEffectPosition = lastroEffectOwner ? lastroMovementVisual(lastroEffectOwner) : null;
      const lastroSavedEffectPosition = this.position;
      const lastroEffectInstance = this._Params?.Inst;
      const lastroHadInstancePosition = lastroEffectInstance && Object.prototype.hasOwnProperty.call(lastroEffectInstance, 'position');
      const lastroSavedInstancePosition = lastroEffectInstance?.position;
      if (lastroEffectOwner) this.position = lastroEffectPosition;
      try {${original}
      } finally {
        if (lastroEffectOwner) {
          this.position = lastroSavedEffectPosition;
          if (lastroEffectInstance) {
            if (lastroHadInstancePosition) lastroEffectInstance.position = lastroSavedInstancePosition;
            else delete lastroEffectInstance.position;
          }
        }
      }
    }`;
    output = output.slice(0, start) + region.slice(0, body.getStart(file)) + wrapped + region.slice(body.end) + output.slice(end);
  }
  const at = output.indexOf('//#region ' + present[0][0]);
  return output.slice(0, at) + lastroMovementEffectOwner.toString() + '\n' + output.slice(at);
}
