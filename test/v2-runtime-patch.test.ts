import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { patchGuildEmblemRequestCallbacks, patchLegacyScriptSinks, patchLuaJsonEscapes, patchNpcMenuBlankArea, patchTrustedTypesDomWrites, patchV2Runtime, patchRuntimeWorldMapProductActions, patchRuntimeChatMapLinks, patchRuntimeToolsPanels } from '../scripts/patch-v2-runtime.mjs';
import { buildClientConfig } from '../src/runtime/client-config';
import { LASTRO_SERVER_PROFILES } from '../src/servers/server-profiles';
import { createLastroUiMessages } from '../scripts/lastro-display-localization.mjs';

const profile = LASTRO_SERVER_PROFILES[0];
if (!profile || profile.availability !== 'available') throw new Error('missing fixture profile');

describe('V2 runtime patch', () => {
  it.each([
    'function cleanGameUI() {}',
    'UIManager.addComponent(LastROTools); function cleanGameUI() {}',
    'UIManager.addComponent(LastROTools); var MapRenderer = class MapRenderer { static setMap() { UIManager.removeComponents(); } };',
    'UIManager.addComponent(LastROTools); UIManager.addComponent(LastROTools); var MapRenderer = class MapRenderer { static setMap() { UIManager.removeComponents(); } }; function cleanGameUI() {}',
  ])('rejects missing or ambiguous tools/map lifecycle anchors', source => {
    expect(() => patchRuntimeToolsPanels(source)).toThrow('anchor:lastro-tools-panels');
  });
  it('mounts the KE shell switch and host into the LastRO tools template', () => {
    const source = 'Navigation.navigateTo = function () { _finalTargetData = {}; this.waitForMapData(function () {}); }; Navigation.waitForMapData = function (callback) { Navigation.waitForMapData(callback); }; UIManager.addComponent(LastROTools); var MapRenderer = class MapRenderer { static setMap() { UIManager.removeComponents(); } }; function cleanGameUI() { document._lastroItemDrag?.cancel(); }';
    const patched = patchRuntimeToolsPanels(source);
    expect(patched).toContain('data-shell-mode="lastro"');
    expect(patched).toContain('科技改变生活');
    expect(patched).toContain('kore-shell-host');
    expect(patched).toContain('createKoreShell');
  });
  it('requires unambiguous chat-map integration anchors on upstream updates', () => {
    expect(() => patchRuntimeChatMapLinks('function requestChatMapTeleport(link) { return false; }')).toThrow('anchor:chat-map-links');
  });
  it('requires an unambiguous world-map anchor on upstream updates', () => {
    expect(() => patchRuntimeWorldMapProductActions('unrecognized upstream source')).toThrow('anchor:worldmap-product-actions');
  });
  it('loads message IDs and quoted-comma values from the local CSV', async () => {
    const runtime = await readFile('generated/runtime/Online.js', 'utf8');
    const csv = await readFile('vendor/core/data/msgstringtable.csv', 'utf8');
    const start = runtime.indexOf('function loadCSV(filename, targetTable, keyIndex, valueIndex, onEnd) {');
    const end = runtime.indexOf('\n/**', start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const client = { loadFile: (_filename: string, callback: (bytes: Uint8Array) => void) => callback(new TextEncoder().encode(csv)) };
    const codepageManager = { decode: (bytes: Uint8Array) => new TextDecoder().decode(bytes) };
    const loadCSV = new Function('Client', 'CodepageManager', 'LastROUiMessages', `${runtime.slice(start, end)}; return loadCSV;`)(client, codepageManager, createLastroUiMessages());
    const table: Record<number, string> = {};
    loadCSV('data/msgstringtable.csv', table, 0, 1, () => undefined);
    expect(table[3723]).toBe('※制作[%s] %d~%d个');
    expect(table[62]).toBe('没有接收 ,拒绝悄悄话讯息的人物名单');
    expect(runtime).toContain('data/msgstringtable.txt');
    expect(runtime).toContain('() => loadCSV("data/msgstringtable.csv", MsgStringTable, 0, 1, loadmsg)');
  }, 30000);

  it('keeps guild emblem callback arguments image-first', () => {
    const source = 'this.onSuccess(entry.guildId, entry.version, entry.image, entry.gif);';
    expect(patchGuildEmblemRequestCallbacks(source)).toBe('this.onSuccess(entry.guildId, entry.image, entry.gif);');
  });

  it('ignores blank-area NPC menu clicks in regenerated runtimes', () => {
    const source = [
      'content.addEventListener("mousedown", (e) => {',
      '  const div = e.target.closest("div");',
      '  if (div && content.contains(div)) selectIndex(div);',
      '});',
      'content.addEventListener("dblclick", (e) => {',
      '  const div = e.target.closest("div");',
      '  if (div && content.contains(div)) validate();',
      '});',
    ].join('\n');
    const patched = patchNpcMenuBlankArea(source);
    expect(patched).toContain('if (!div?.dataset?.index || !content.contains(div)) return;');
    expect(patched).toContain('if (div?.dataset?.index && content.contains(div)) validate();');
  });

  it('escapes Lua control characters before converting tables to JSON', () => {
    const source = String.raw`local function escape_str(str)
	return str:gsub("\\", "\\\\"):gsub("\"", "\\\"")
end`;
    const patched = patchLuaJsonEscapes(source);
    expect(patched).toContain(String.raw`:gsub("\b", "\\b")`);
    expect(patched).toContain(String.raw`:gsub("\f", "\\f")`);
    expect(patched).toContain(String.raw`:gsub("\n", "\\n")`);
    expect(patched).toContain(String.raw`:gsub("\r", "\\r")`);
    expect(patched).toContain(String.raw`:gsub("\t", "\\t")`);
    expect(patched).toContain(String.raw`:gsub("%c", function(char)`);
    expect(patched).toContain(String.raw`string.format("\\u%04x", string.byte(char))`);
  });

  it('removes legacy html2canvas proxy and FlashCanvas script sinks', () => {
    const source = [
      'function proxyGetImage(url, img, imageObj) {',
      '  let script = document.createElement("script");',
      '  script.setAttribute("src", options.proxy);',
      '  document.body.appendChild(script);',
      '}',
      '_html2canvas.Renderer.Canvas = function(options) {',
      '  let canvas = document.createElement("canvas");',
      '  if (canvas.getContext) { canvasReadyToDraw = true; }',
      '  else if (options.flashcanvas !== undefined) {',
      '    let script = document.createElement("script");',
      '    script.src = options.flashcanvas;',
      '    document.body.appendChild(script);',
      '  }',
      '  methods = { _create() {} };',
      '};',
    ].join('\n');
    const patched = patchLegacyScriptSinks(source);
    expect(patched).not.toContain('createElement("script")');
    expect(patched).not.toContain('options.proxy');
    expect(patched).not.toContain('options.flashcanvas');
  });

  it('rewrites executable DOM HTML sinks, including Background.setImage', () => {
    const source = [
      'class Background {',
      '  static setImage() { _container.innerHTML = ""; }',
      '  static replace() { node.outerHTML = html; }',
      '  static append() { node.insertAdjacentHTML("beforeend", html); }',
      '  static appendText() { node.innerHTML += html; }',
      '}',
    ].join('\n');
    const patched = patchTrustedTypesDomWrites(source);
    expect(patched).toContain('setLastROInnerHTML(_container, "")');
    expect(patched).toContain('setLastROOuterHTML(node, html)');
    expect(patched).toContain('setLastROAdjacentHTML(node, "beforeend", html)');
    expect(patched).not.toContain('_container.innerHTML =');
    expect(patched).not.toContain('node.outerHTML =');
    expect(patched).not.toContain('node.insertAdjacentHTML(');
    expect(patched).not.toContain('node.innerHTML +=');
  });

  it('fails closed when an anchored region drifts', () => {
    expect(() => patchV2Runtime('function defaultSocketFactory(host, port) {}')).toThrow(/anchor|function/);
  });

  it('maps available profiles to one server and only selected credentials', () => {
    for (const candidate of LASTRO_SERVER_PROFILES.slice(0, 2)) {
      if (candidate.availability !== 'available') throw new Error('unexpected unavailable profile');
      const config = buildClientConfig(candidate, { username: 'user', password: 'pass' });
      expect(config.servers).toHaveLength(1);
      expect(config.servers[0]).toMatchObject({ address: candidate.loginAddress, port: candidate.loginPort,
        version: candidate.version, langtype: candidate.langtype, packetver: candidate.packetver });
      expect(config.autoLogin).toEqual(['user', 'pass']);
      expect(JSON.stringify(config)).not.toMatch(/XKore|quickLogin|socketProxy/i);
      expect(Object.isFrozen(config)).toBe(true);
    }
  });

  it('keeps the real imported runtime source available for the next patch step', async () => {
    await expect(readFile('vendor/v2/Online.js', 'utf8')).resolves.toContain('defaultSocketFactory');
  });

  it('keeps the built-in vertical flip disabled for the ILLUSION status', async () => {
    const runtime = await readFile('vendor/v2/Online.js', 'utf8');
    expect(runtime).toMatch(/static setActive\(bool\)\s*\{\s*_active\$3 = false;\s*\}/);
    expect(runtime).toMatch(/if \(efstConst == StatusConst_default\.ILLUSION\)\s*VerticalFlip\.setActive\(true\);/);
  });

  it('applies bundled Chinese typography to the generated runtime', async () => {
    const runtime = await readFile('generated/runtime/Online.js', 'utf8');
    expect(runtime).toContain("font-family: 'MiSans'");
    expect(runtime).toContain('font-size: 12px');
    expect(runtime).toContain('font-size-adjust: none');
    expect(runtime).not.toContain('SCDream');
    expect(runtime).toContain('Arial');
  });

  it('moves item obtain notices right and stabilizes shortcut number metrics', async () => {
    const runtime = await readFile('generated/runtime/Online.js', 'utf8');
    expect(runtime).toContain('LastRO item-obtain placement and typography');
    expect(runtime).toContain('top: var(--loot-top, 0px)');
    expect(runtime).toContain('function installLastroLootList');
    expect(runtime).toContain('left: var(--loot-left, 0px) !important');
    expect(runtime).toContain('right: auto !important');
    expect(runtime).toContain('this._host.style.right = "24px"');
    expect(runtime).toContain('LastRO shortcut typography and alignment');
    expect(runtime).toContain('font-family: Arial, sans-serif');
    expect(runtime).toContain('font-size: 10px');
    expect(runtime).toContain('top: 17px');
  });

  it('applies the maintainable LASTRO localization overlay', async () => {
    const runtime = await readFile('generated/runtime/Online.js', 'utf8');
    expect(runtime).toContain('LASTRO Chinese job-name overlay');
    expect(runtime).toContain('"NOVICE":"初心者"');
    expect(runtime).toContain('"DRAGON_KNIGHT":"龙骑士"');
    expect(runtime).not.toContain('JobNameTable[JobConst_default.NOVICE] = "初心者"');
    expect(runtime).toContain('lastroJobDisplayName(info.job)');
    expect(runtime).toContain('>创建聊天室<');
    expect(runtime).toContain('>领取奖励<');
    expect(runtime).toContain('正在监测非法软件。');
    expect(runtime).toContain('DB.getMessage(126, "更改房间设置")');
    expect(runtime).toContain('DB.getMessage(1808, "秒")');
    expect(runtime).toContain('LASTRO Chinese skill-name overlay');
    expect(runtime).toContain('"SM_SWORD":"剑术修炼"');
    expect(runtime).toContain('"MG_FIREBOLT":"火箭术"');
    expect(runtime).toContain('"AL_HEAL":"治愈术"');
    expect(runtime).toContain('>成就<');
    expect(runtime).toContain('>公会助手<');
    expect(runtime).toContain('>任务列表（Alt + U）<');
    expect(runtime).toContain('>价格上限：%s Zeny<');
  });

  it('registers Web Audio contexts in the generated runtime for activation resume', async () => {
    const runtime = await readFile('generated/runtime/Online.js', 'utf8');
    expect(runtime).toContain('this.audioCtx = LastROAudioRegisterContext(new AudioContext());');
    expect(runtime).toContain('const resumeAudioContexts = () => {');
  });

  it('sets skipIntro to bypass local GRF file picker', () => {
    const config = buildClientConfig(profile, { username: 'test', password: 'pass' });
    expect(config.skipIntro).toBe(true);
  });
});
