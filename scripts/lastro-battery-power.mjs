import ts from 'typescript';

const BATTERY_STATUS_ID = 2000;
const BATTERY_PROPERTY_ID = 300;

function rewriteRegion(source, path, edit) {
  const marker = '//#region ' + path + '\n';
  const start = source.indexOf(marker);
  if (start < 0 || source.indexOf(marker, start + marker.length) >= 0)
    throw new Error('anchor:lastro-battery:region:' + path);
  const end = source.indexOf('//#endregion', start + marker.length);
  if (end < 0) throw new Error('anchor:lastro-battery:end:' + path);
  return source.slice(0, start) + edit(source.slice(start, end)) + source.slice(end);
}

function uniqueFunction(file, name) {
  const nodes = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  if (nodes.length !== 1 || !nodes[0].body) throw new Error('anchor:lastro-battery:function:' + name);
  return nodes[0];
}

/**
 * Official LastRO: PAR_CHANGE (0x00b0) varID 300 (BPOWER)
 * is a special percentage-based status icon (status ID 2000).
 * The packet is already registered; network framing must remain unchanged.
 */
export function patchRuntimeLastROBatteryPower(source) {
  let output = rewriteRegion(source, 'src/UI/Components/StatusIcons/StatusIcons.js', region => {
    if (region.includes('lastroBatteryPower')) throw new Error('anchor:lastro-battery:already-installed');
    const file = ts.createSourceFile('StatusIcons.js', region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const render = uniqueFunction(file, 'renderStatus');
    const assignments = [];
    function visit(node) {
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && node.left.getText(file) === 'StatusIcons.update') assignments.push(node);
      ts.forEachChild(node, visit);
    }
    visit(file);
    if (assignments.length !== 1 || !region.includes('StatusInfo') || !region.includes('_status'))
      throw new Error('anchor:lastro-battery:status-icons');
    const installAt = assignments[0].parent.getStart(file);
    const install = `// LastRO phone battery percentage buff.
  StatusInfo[${BATTERY_STATUS_ID}] = {
    icon: "rk_lux.tga",
    descript: [
      ["电量", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176, 98)"],
      ["手机道具电量显示"],
      ["自动战斗消耗电量"]
    ]
  };
  StatusIcons.updateBatteryPower = function updateBatteryPower(rawValue) {
    const value = Number(rawValue);
    if (!Number.isFinite(value)) return;
    const percent = Math.min(100, Math.max(0, value));
    StatusIcons.update(${BATTERY_STATUS_ID}, true, 9999);
    // Keep the latest percentage when the image is loading asynchronously.
    if (_status[${BATTERY_STATUS_ID}]) _status[${BATTERY_STATUS_ID}].lastroBatteryPower = percent;
  };
  `;
    const renderStart = render.body.getStart(file) + 1;
    const renderPatch = `
  if (status.img && typeof status.lastroBatteryPower === "number") {
    const percent = status.lastroBatteryPower;
    const ctx = status.ctx;
    ctx.clearRect(0, 0, 32, 32);
    ctx.drawImage(status.img, 0, 0);
    ctx.fillStyle = "rgba(0,255,8,0.5)";
    ctx.fillRect(0, 32 * (1 - percent / 100), 32, 32);
    if (status.time) status.time.textContent = percent + "%";
    return;
  }
  `;
    for (const edit of [
      { start: installAt, text: install },
      { start: renderStart, text: renderPatch }
    ].sort((a, b) => b.start - a.start)) {
      region = region.slice(0, edit.start) + edit.text + region.slice(edit.start);
    }
    return region;
  });
  output = rewriteRegion(output, 'src/Engine/MapEngine/Main.js', region => {
    const file = ts.createSourceFile('Main.js', region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const handler = uniqueFunction(file, 'onParameterChange$1');
    const insertAt = handler.body.getStart(file) + 1;
    const guard = `
  // PAR_CHANGE is registered; varID 300 represents the phone battery.
  if (pkt && pkt.varID === ${BATTERY_PROPERTY_ID}) {
    StatusIcons_default.updateBatteryPower(pkt.count);
    return;
  }
`;
    return region.slice(0, insertAt) + guard + region.slice(insertAt);
  });
  return output;
}
