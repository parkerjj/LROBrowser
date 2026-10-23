import { describe, expect, it } from "vitest";
// @ts-expect-error The vendored runtime module intentionally has no declaration file.
import { buildAutoToggleRequest, mapScalarUpdate } from "../vendor/v2/lastro-v1-migration.mjs";

describe("auto toggle packet selection", () => {
  it("uses the official whisper commands for 3x", () => {
    expect(buildAutoToggleRequest({ nid: 3, option: "autoAttack", enabled: true })).toEqual({
      kind: "whisper", receiver: "NPC:setautoattack", msg: "0"
    });
    expect(buildAutoToggleRequest({ nid: 3, option: "autoLoot", enabled: false })).toEqual({
      kind: "whisper", receiver: "NPC:setautopick", msg: "0"
    });
    expect(buildAutoToggleRequest({ nid: 3, option: "autoFollow", enabled: true })).toEqual({
      kind: "whisper", receiver: "NPC:setfollow", msg: "0"
    });
  });

  it("uses scalar update ids for 2x and App", () => {
    expect(buildAutoToggleRequest({ nid: 5, option: "autoAttack", enabled: true })).toEqual({ kind: "update", id: 34, value: 1 });
    expect(buildAutoToggleRequest({ nid: 6, option: "autoLoot", enabled: false })).toEqual({ kind: "update", id: 35, value: 1 });
    expect(buildAutoToggleRequest({ nid: 6, option: "autoLoot", enabled: true })).toEqual({ kind: "update", id: 35, value: 1 });
    expect(buildAutoToggleRequest({ nid: 6, option: "autoPots", enabled: false })).toEqual({ kind: "update", id: 36, value: 1 });
    expect(buildAutoToggleRequest({ nid: 6, option: "autoFollow", enabled: true })).toEqual({ kind: "update", id: 37, value: 1 });
  });
});

// Exercise the actual runtime handlers so both packet paths stay consistent.
import { readFileSync } from "node:fs";
const runtime = readFileSync(new URL("../vendor/v2/Online.js", import.meta.url), "utf8");
function receiveState(nid: number, method: string, packet: object) {
  const match = runtime.match(new RegExp(`LastROTools\\.${method} = function ${method}\\(pkt\\) \\{([\\s\\S]*?)\\n  \\};`));
  if (!match?.[1]) throw new Error(`Missing runtime handler ${method}`);
  let state: Record<string, unknown> = {};
  const handler = new Function("Configs", "mapLoadInfoPayload", "mapReloadInfoPacket", "SCALAR_FIELD_BY_ID", "pkt", match[1]);
  handler.call({ applyState: (value: Record<string, unknown>) => { state = value; } },
    { get: () => nid }, (value: object) => value, (value: object) => value,
    { 34: "startAutoAtk", 35: "startAutoLoot", 36: "startAutopots", 37: "startAutofollow" }, packet);
  return state;
}

function toggleAutomation(nid: number, option: string, enabled: boolean) {
  const match = runtime.match(/LastROTools\.setAutomationOption = function setAutomationOption\(([\s\S]*?)\n\x20{2}\};/);
  if (!match?.[0]) throw new Error("Missing runtime handler setAutomationOption");
  const body = match[0].slice(match[0].indexOf("{") + 1, match[0].lastIndexOf("\n  };")).trim();
  const sent: Array<Record<string, unknown>> = [];
  class WhisperPacket {
    receiver = "";
    msg = "";
  }
  class UpdatePacket {
    id = 0;
    value = 0;
  }
  const handler = new Function(
    "OPTION_TO_PACKET_ID", "buildAutoToggleRequest", "Configs", "PACKET", "Network", "mapScalarUpdate", "option", "enabled", body,
  );
  handler.call({
    _settingState: {},
    setStatus() {},
    getOptionLabel: () => option,
    renderCompactStatus() {},
  },
    { autoAttack: 34, autoLoot: 35, autoPots: 36, autoFollow: 37 },
    buildAutoToggleRequest,
    { get: () => nid },
    { CZ: { WHISPER: WhisperPacket, NOTIFY_UPDATEINFO: UpdatePacket } },
    { sendPacket: (packet: Record<string, unknown>) => sent.push({ ...packet }) },
    mapScalarUpdate,
    option,
    enabled,
  );
  return sent;
}

describe("0x0AF5 load info layout", () => {
  // 整份设置快照：58 字节，id 之后 56 字节。偏移取自官方 Online.js 的 PACKET_ZC_NOTIFY_LOADINFO
  // （ROWeb/ro 与 ROWeb/v1-debug 一致），并与 OpenKore LastroFollow（startAutofollow@43）吻合。
  const FIELDS: Array<[string, "b" | "w" | "l", number]> = [
    ["pmdis", "b", 0], ["mgdis", "b", 1], ["AutoUseWing_time", "b", 2], ["usehpConversion", "b", 3],
    ["AutoSeeBoss", "b", 4], ["qomobnumMin", "b", 5], ["qomobnum", "b", 6], ["usealheal", "b", 7],
    ["qo_AutoUseSkillid", "w", 8], ["qo_AutoUseSkilllv", "b", 10], ["MinHpValFly", "b", 11],
    ["MinSpValFly", "b", 12], ["MinHpVal", "b", 13], ["useBoarding", "b", 14], ["petTurnEgg", "b", 15],
    ["autoloot", "l", 16], ["AutoUseItem_reHpVal", "b", 20], ["AutoUseItem_reSpVal", "b", 21],
    ["AutoUseItem_jsys", "b", 22], ["AutoUseItem_Elemental", "b", 23], ["AutoUseItem_Panacea", "b", 24],
    ["useSiegfried", "b", 25], ["AutoAttackstatus", "b", 26], ["AutofollowMode", "b", 27],
    ["disTarget", "b", 28], ["addisTarget", "b", 29], ["aidddis_reHpVal", "b", 30], ["aidddis_reSpVal", "b", 31],
    ["AutoUseSit", "b", 32], ["AutoUseSit_reHpVal", "b", 33], ["AutoUseSit_reSpVal", "b", 34],
    ["AutoUseSit_reHpUpVal", "b", 35], ["AutoUseSit_reSpUpVal", "b", 36], ["AutoUseSit_xw", "b", 37],
    ["onlynoattack", "b", 38], ["AutoUseItem_Protection", "b", 39],
    ["startAutoAtk", "b", 40], ["startAutoLoot", "b", 41], ["startAutopots", "b", 42], ["startAutofollow", "b", 43],
    ["searchMode", "b", 44], ["AutoUseSkillid", "w", 45], ["AutoUseSkilllv", "b", 47], ["useSkill_pro", "b", 48],
    ["AutoUseItem_Elementalid", "w", 49], ["ProtectTeam", "b", 51], ["keepwayOp", "b", 52],
    ["useManuals", "b", 53], ["useBubbles", "b", 54], ["useAspersio", "b", 55],
  ];

  function parseLoadInfo(payload: number[]) {
    const match = runtime.match(/PACKET\.ZC\.NOTIFY_LOADINFO = function PACKET_ZC_NOTIFY_LOADINFO\(fp, end\) \{([\s\S]*?)\n\x20{2}\};/);
    if (!match?.[1]) throw new Error("Missing NOTIFY_LOADINFO parser");
    const bytes = Uint8Array.from(payload);
    const view = new DataView(bytes.buffer);
    let at = 0;
    const fp = {
      tell: () => at,
      readUChar: () => view.getUint8(at++),
      readUShort: () => { const value = view.getUint16(at, true); at += 2; return value; },
      readLong: () => { const value = view.getInt32(at, true); at += 4; return value; },
    };
    const packet: Record<string, number> = {};
    new Function("fp", "end", match[1]).call(packet, fp, bytes.length);
    return { packet, consumed: at };
  }

  it.each(FIELDS)("reads %s from its official offset", (name, kind, offset) => {
    // 每个字段占自己的字节，值用 offset 本身标记（不会和别的字段撞），读到别处就对不上。
    const payload = new Array<number>(56).fill(0);
    if (kind === "b") payload[offset] = 0x7f;
    if (kind === "w") { payload[offset] = 0x34; payload[offset + 1] = 0x12; }
    if (kind === "l") { payload[offset] = 0x78; payload[offset + 1] = 0x56; payload[offset + 2] = 0x34; payload[offset + 3] = 0x12; }
    const { packet } = parseLoadInfo(payload);
    expect(packet[name]).toBe(kind === "b" ? 0x7f : kind === "w" ? 0x1234 : 0x12345678);
    for (const [other] of FIELDS.filter(([field]) => field !== name)) expect(packet[other]).toBe(0);
  });

  it("consumes exactly the 56 payload bytes and defines no extra fields", () => {
    const { packet, consumed } = parseLoadInfo(new Array<number>(56).fill(0));
    expect(consumed).toBe(56);
    expect(Object.keys(packet).sort()).toEqual(FIELDS.map(([name]) => name).sort());
  });
});

describe("automatic battle toggle", () => {
  it("keeps nid=3 online and sends only the auto-attack whisper", () => {
    expect(toggleAutomation(3, "autoAttack", true)).toEqual([
      { receiver: "NPC:setautoattack", msg: "0" },
    ]);
  });

  it.each([5, 6])("uses only the scalar auto-attack packet for nid=%s", (nid) => {
    expect(toggleAutomation(nid, "autoAttack", true)).toEqual([
      { id: 34, value: 1 },
    ]);
  });

  it("does not send offline mode when auto battle is disabled or another option changes", () => {
    expect(toggleAutomation(3, "autoAttack", false)).toEqual([
      { receiver: "NPC:setautoattack", msg: "0" },
    ]);
    expect(toggleAutomation(3, "autoLoot", true)).toEqual([
      { receiver: "NPC:setautopick", msg: "0" },
    ]);
  });
});

describe("nid=3 ESC offline battle entry", () => {
  it("adds a manual offline battle button gated to nid=3", () => {
    expect(runtime).toContain('class="setoffline"');
    expect(runtime).toContain('Number(Configs.get("lastroNid", 0)) === 3');
  });

  it("sends NPC:setoffline only through the manual Escape callback", () => {
    const match = runtime.match(/function onSetofflineRequest\$2\(\) \{([\s\S]*?)\n\}/);
    if (!match?.[1]) throw new Error("Missing manual offline callback");
    const sent: Array<Record<string, unknown>> = [];
    class WhisperPacket {
      receiver = "";
      msg = "";
    }
    const handler = new Function("PACKET", "Network", match[1]);
    handler(
      { CZ: { WHISPER: WhisperPacket } },
      { sendPacket: (packet: Record<string, unknown>) => sent.push({ ...packet }) },
    );
    expect(sent).toEqual([{ receiver: "NPC:setoffline", msg: "0" }]);
  });
});

describe("server auto-loot state polarity", () => {
  for (const nid of [3, 5, 6]) {
    for (const value of [0, 1]) {
      it(`maps load and reload consistently for nid=${nid}, value=${value}`, () => {
        const enabled = nid === 3 ? Boolean(value) : value === 0;
        const loaded = receiveState(nid, "setLoadInfo", {
          startAutoLoot: value, startAutoAtk: value, startAutopots: value, startAutofollow: value,
        });
        expect(loaded.autoLoot).toBe(enabled);
        for (const option of ["autoAttack", "autoPots", "autoFollow"]) expect(loaded[option]).toBe(Boolean(value));
        expect(receiveState(nid, "setReloadInfo", { id: 35, value }).autoLoot).toBe(enabled);
        for (const [id, option] of [[34, "autoAttack"], [36, "autoPots"], [37, "autoFollow"]] as const)
          expect(receiveState(nid, "setReloadInfo", { id, value })[option]).toBe(Boolean(value));
      });
    }
  }
});
