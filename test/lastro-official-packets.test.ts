/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
// @ts-expect-error The vendored runtime module intentionally has no declaration file.
import { getLastROPacketLengthOverrides } from '../vendor/v2/lastro-packet-framing.mjs';
import { extractRuntimeNode, extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';

// 官方 Online.js(1.js) 的接收封包表快照：[十进制 ID, 官方名称, 官方声明长度|null]。
const official: Array<[number, string, number | null]> = JSON.parse(
  readFileSync(new URL('./fixtures/lastro-official-packets.json', import.meta.url), 'utf8'),
).receive;

const vendorSource = readVendorSource();
const hex = (id: number) => `0x${id.toString(16).padStart(4, '0')}`;

// ---------------------------------------------------------------------------
// 覆盖与长度：仓库“只能多，不能少”。
// ---------------------------------------------------------------------------
describe('官方封包表覆盖', () => {
  if (!existsSync('generated/runtime/Online.js')) throw new Error('缺少 generated/runtime/Online.js，请先运行 pnpm prepare:runtime');
  const runtimeSource = readFileSync('generated/runtime/Online.js', 'utf8');

  // 注册表的键可能写成 2e3 之类的数字字面量，所以按语法树读取而不是正则。
  const registered = new Map<number, string>();
  const registerFile = ts.createSourceFile('PacketRegister.js', extractVendorRegion('src/Network/PacketRegister.js', runtimeSource), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  (function visit(node: ts.Node): void {
    if (ts.isPropertyAssignment(node) && ts.isNumericLiteral(node.name) && ts.isPropertyAccessExpression(node.initializer)) {
      registered.set(Number(node.name.text), node.initializer.getText(registerFile).replace(/^PACKET\./, ''));
    }
    ts.forEachChild(node, visit);
  })(registerFile);

  // 与运行时 PacketLength 模块一致地求出每个 ID 的有效长度（2021 表 + LastRO 覆盖 + 补丁）。
  const effectiveLength = (() => {
    const region = 'src/Network/PacketLength.js';
    const table = extractRuntimeNode(runtimeSource, { region: 'src/Network/Packets/packets2021_len_main.js', kind: 'function', name: 'init$19' });
    const init = extractRuntimeNode(runtimeSource, { region, kind: 'function', name: 'init$14' });
    const get = extractRuntimeNode(runtimeSource, { region, kind: 'function', name: 'getPacketLength' });
    const configs = { get: (key: string, fallback: unknown) => (key === 'lastroCustomPackets' ? true : fallback) };
    const factory = new Function('getLastROPacketLengthOverrides', 'Configs', 'console', `
      const length_list$4 = [];
      let packets_len;
      ${table}
      const packetModules = { './Packets/packets2021_len_main.js': { default: { init: init$19 } } };
      ${init}
      ${get}
      init$14(20211103);
      return getPacketLength;`);
    return factory(getLastROPacketLengthOverrides, configs, { log() {}, error() {} }) as (id: number) => number | false;
  })();

  // 官方 1.js 里声明长度与实际收包矛盾的包：官方源码笔误或根本不会收到的登录服包，不照抄。
  const rejected = new Map<number, string>([
    [0x011a, '官方把 USE_SKILL2 的长度 17 误写到 USE_SKILL 上；标准 0x011A 为 15 字节'],
    [0x01d6, '官方把 0x099B 的同名结构（8 字节）覆盖到 0x01D6 上；标准 0x01D6 为 4 字节'],
    [0x0276, '官方声明 51 字节，但该包带服务器列表，是变长包（-1）'],
    [0x0823, '官方声明 6 字节，但该包是变长包（-1）'],
  ]);

  it('官方注册的每个接收封包仓库都注册了', () => {
    const missing = official.filter(([id]) => !registered.has(id)).map(([id, name]) => `${hex(id)} ${name}`);
    expect(missing).toEqual([]);
  });

  it('每个已注册的官方封包都有长度，且与官方声明一致', () => {
    const noLength: string[] = [];
    const different: string[] = [];
    for (const [id, name, size] of official) {
      const length = effectiveLength(id);
      if (!length) { noLength.push(`${hex(id)} ${name}`); continue; }
      if (size !== null && !rejected.has(id) && length !== size) different.push(`${hex(id)} ${name} 官方=${size} 仓库=${length}`);
    }
    expect(noLength).toEqual([]);
    expect(different).toEqual([]);
  });

  it('被拒绝照抄的长度都有书面理由，并且仓库值保持原样', () => {
    expect(effectiveLength(0x011a)).toBe(15);
    expect(effectiveLength(0x01d6)).toBe(4);
    expect(effectiveLength(0x0276)).toBe(-1);
    expect(effectiveLength(0x0823)).toBe(-1);
    for (const reason of rejected.values()) expect(reason.length).toBeGreaterThan(8);
  });
});

// ---------------------------------------------------------------------------
// 逐字节解析：新增与修正的封包。
// ---------------------------------------------------------------------------
const u8 = (n: number) => [n & 255];
const u16 = (n: number) => [n & 255, (n >> 8) & 255];
const u32 = (n: number) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
const str = (text: string, length: number) => {
  const out = Array.from(text, ch => ch.charCodeAt(0));
  while (out.length < length) out.push(0);
  return out.slice(0, length);
};

class TestReader {
  readonly view: DataView;
  offset: number;
  readonly length: number;
  constructor(bytes: number[], start: number) {
    this.view = new DataView(new Uint8Array(bytes).buffer);
    this.offset = start;
    this.length = bytes.length;
  }
  tell() { return this.offset; }
  seek(index: number, type = 2) { this.offset = type === 1 ? this.offset + index : type === 3 ? this.length + index : index; }
  readChar() { return this.view.getInt8(this.offset++); }
  getInt8() { return this.readChar(); }
  readUChar() { return this.view.getUint8(this.offset++); }
  readShort() { const v = this.view.getInt16(this.offset, true); this.offset += 2; return v; }
  readUShort() { const v = this.view.getUint16(this.offset, true); this.offset += 2; return v; }
  readLong() { const v = this.view.getInt32(this.offset, true); this.offset += 4; return v; }
  readULong() { const v = this.view.getUint32(this.offset, true); this.offset += 4; return v; }
  readUInt64() { const v = this.view.getUint32(this.offset, true) + 2 ** 32 * this.view.getUint32(this.offset + 4, true); this.offset += 8; return v; }
  readString(length: number) {
    let text = '';
    for (let i = 0; i < length; ++i) { const c = this.view.getUint8(this.offset + i); if (!c) break; text += String.fromCharCode(c); }
    this.offset += length;
    return text;
  }
  readBinaryString(length: number) { return this.readString(length); }
  readPos() { this.offset += 3; return [0, 0, 0]; }
  readPos2() { this.offset += 6; return [0, 0, 0, 0]; }
  readStruct(struct: { fields: string[] }) {
    const out: Record<string, number> = {};
    for (const field of struct.fields) {
      const [type, name] = field.split(' ') as [string, string];
      out[name] = type === 'short' ? this.readShort() : this.readChar();
    }
    return out;
  }
}

class TestStruct { fields: string[]; constructor(...fields: string[]) { this.fields = fields; } }

type Decoded = Record<string, any>;
interface DecodeOptions { variable?: boolean; packetver?: number; helpers?: string[]; parseCharInfo?: (fp: TestReader, end: number) => unknown[]; deps?: string[]; }

/** 在沙箱里取出仓库中的真实封包解析函数并按收包路径执行（reader 位于包 ID[/长度]之后）。 */
function decode(name: string, payload: number[], options: DecodeOptions = {}): { packet: Decoded; reader: TestReader } {
  const region = 'src/Network/PacketStructure.js';
  const wanted = [...(options.deps ?? []), name];
  const sources = wanted.map(n => extractRuntimeNode(vendorSource, { region, kind: 'assignment', name: `PACKET.${n}` }));
  const helperNames = ['readLastROItemId', 'pickLastROListUnit', 'readLastROSkillInfoList', 'readTrailingName', ...(options.helpers ?? [])];
  const helpers = [...new Set(helperNames)].map(n => extractRuntimeNode(vendorSource, { region, kind: 'function', name: n }));
  const header = options.variable ? [0, 0, 0, 0] : [0, 0];
  const bytes = [...header, ...payload];
  if (options.variable) { bytes[2] = bytes.length & 255; bytes[3] = bytes.length >> 8; }
  const reader = new TestReader(bytes, header.length);
  const PACKET = { ZC: {}, HC: {}, CZ: {}, CH: {}, AC: {}, CA: {} } as Record<string, Record<string, any>>;
  const factory = new Function('PACKET', 'PacketVerManager_default', 'NAME_LENGTH', 'Struct', 'SEEK_SET', 'SEEK_CUR', 'SEEK_END', 'Configs',
    `${helpers.join('\n')}\n${sources.join(';\n')};\nreturn PACKET.${name};`);
  const Ctor = factory(PACKET, { value: options.packetver ?? 20211103, parseCharInfo: options.parseCharInfo }, 24, TestStruct, 2, 1, 3,
    { get: (key: string, fallback: unknown) => (key === 'lastroProtocol' ? true : fallback) });
  const packet: Decoded = {};
  Ctor.call(packet, reader, bytes.length);
  return { packet, reader };
}

describe('新增的官方接收封包（逐字节）', () => {
  it('0x08E2 NAVIGATETO：导航目标（27 字节帧）', () => {
    const { packet, reader } = decode('ZC.NAVIGATETO', [...u8(1), ...u8(2), ...u8(3), ...str('prontera', 16), ...u16(150), ...u16(180), ...u16(1002)]);
    expect(packet).toMatchObject({ type: 1, flag: 2, noshow: 3, mapname: 'prontera', x: 150, y: 180, mobid: 1002 });
    expect(reader.tell()).toBe(27);
  });

  it('0x097E UPDATE_RANKING_POINT：排名点数（12 字节帧）', () => {
    const { packet, reader } = decode('ZC.UPDATE_RANKING_POINT', [...u16(3), ...u32(120), ...u32(4500)]);
    expect(packet).toMatchObject({ Type: 3, Point: 120, TotalPoint: 4500 });
    expect(reader.tell()).toBe(12);
  });

  it('0x09E6 UPDATE_ITEM_FROM_BUYING_STORE2：收购商店物品更新（24 字节帧，物品 ID 32 位）', () => {
    const { packet, reader } = decode('ZC.UPDATE_ITEM_FROM_BUYING_STORE2', [...u32(100501), ...u16(7), ...u32(5000), ...u32(90000), ...u32(150001), ...u32(1760000000)]);
    expect(packet).toMatchObject({ ITID: 100501, count: 7, Zeny: 5000, limitZeny: 90000, GID: 150001, Date: 1760000000 });
    expect(reader.tell()).toBe(24);
  });

  it('0x0A78 CAMERA_INFO：镜头参数（15 字节帧）', () => {
    const { packet, reader } = decode('ZC.CAMERA_INFO', [...u8(1), ...u32(240), ...u32(30), ...u32(45)]);
    expect(packet).toMatchObject({ show: 1, range: 240, rotation: 30, latitude: 45 });
    expect(reader.tell()).toBe(15);
  });

  it.each([['ZC.ACK_BAN_GUILD_SSO2'], ['ZC.ACK_LEAVE_GUILD2']])('0x0A82/0x0A83 %s：公会成员原因（46 字节帧）', name => {
    const { packet, reader } = decode(name, [...u32(150001), ...str('AFK', 40)]);
    expect(packet).toMatchObject({ charID: 150001, reasonDesc: 'AFK' });
    expect(reader.tell()).toBe(46);
  });

  it('0x0ABD PARTY_JOB_AND_LEVEL：队员职业与等级（10 字节帧）', () => {
    const { packet, reader } = decode('ZC.PARTY_JOB_AND_LEVEL', [...u32(2000001), ...u16(4004), ...u16(175)]);
    expect(packet).toMatchObject({ AID: 2000001, Job: 4004, Level: 175 });
    expect(reader.tell()).toBe(10);
  });

  it.each([['ZC.ATTACK_SKILLINFO_LIST'], ['ZC.ADDIS_SKILLINFO_LIST'], ['ZC.TOUCH_SKILLINFO_LIST'], ['ZC.QOATTACK_SKILLINFO_LIST']])('0x0AD1-0x0AD4 %s：变长技能列表，每项 37 字节', name => {
    const entry = (skid: number, level: number) => [...u16(skid), ...u32(2), ...u16(level), ...u16(12), ...u16(9), ...str('Fire Bolt', 24), ...u8(1)];
    const { packet, reader } = decode(name, [...entry(19, 10), ...entry(20, 5)], { variable: true });
    expect(packet.skillList).toHaveLength(2);
    expect(packet.skillList[0]).toMatchObject({ SKID: 19, type: 2, level: 10, spcost: 12, attackRange: 9, skillName: 'Fire Bolt', upgradable: 1 });
    expect(packet.skillList[1]).toMatchObject({ SKID: 20, level: 5 });
    expect(reader.tell()).toBe(4 + 37 * 2);
  });

  it('0x0AE7 PARTY_REQ_MASTER_TO_JOIN：加入队伍申请（38 字节帧）', () => {
    const { packet, reader } = decode('ZC.PARTY_REQ_MASTER_TO_JOIN', [...u32(150001), ...u32(2000001), ...str('Alice', 24), ...u16(120), ...u16(88)]);
    expect(packet).toMatchObject({ CID: 150001, AID: 2000001, name: 'Alice', xPos: 120, yPos: 88 });
    expect(reader.tell()).toBe(38);
  });

  it('0x0AF0 NOTIFY_ATTENDANCE：签到（10 字节帧）', () => {
    const { packet, reader } = decode('ZC.NOTIFY_ATTENDANCE', [...u32(7), ...u32(2026)]);
    expect(packet).toMatchObject({ unknown: 7, data: 2026 });
    expect(reader.tell()).toBe(10);
  });

  it('0x0AF9 SKILL_AUTOSHADOWSPELL：变长技能 ID 列表', () => {
    const { packet, reader } = decode('ZC.SKILL_AUTOSHADOWSPELL', [...u32(1), ...u16(268), ...u16(270), ...u16(272)], { variable: true });
    expect(packet.why).toBe(1);
    expect(packet.SKID).toEqual([268, 270, 272]);
    expect(reader.tell()).toBe(4 + 4 + 6);
  });

  it('0x0AFA PARTY_JOIN_REQ_ACK_FROM_MASTER：队长回应（58 字节帧）', () => {
    const { packet, reader } = decode('ZC.PARTY_JOIN_REQ_ACK_FROM_MASTER', [...str('Bob', 24), ...str('Party1', 24), ...u32(2000002), ...u32(1)]);
    expect(packet).toMatchObject({ player_name: 'Bob', party_name: 'Party1', AID: 2000002, refused: 1 });
    expect(reader.tell()).toBe(58);
  });

  it('0x0B47 CHANGE_GUILD2：公会变更（14 字节帧）', () => {
    const { packet, reader } = decode('ZC.CHANGE_GUILD2', [...u32(9001), ...u32(12), ...u32(2000001)]);
    expect(packet).toMatchObject({ GDID: 9001, emblemVersion: 12, AID: 2000001 });
    expect(reader.tell()).toBe(14);
  });

  it('0x0B7C BAN_LIST2：变长封禁列表，每项 68 字节', () => {
    const entry = (aid: number, reason: string, name: string) => [...u32(aid), ...str(reason, 40), ...str(name, 24)];
    const { packet, reader } = decode('ZC.BAN_LIST2', [...entry(1, 'AFK', 'Alice'), ...entry(2, 'Spam', 'Bob')], { variable: true });
    expect(packet.banList).toEqual([{ AID: 1, reason: 'AFK', charname: 'Alice' }, { AID: 2, reason: 'Spam', charname: 'Bob' }]);
    expect(reader.tell()).toBe(4 + 68 * 2);
  });

  it('0x06B1 ACCEPT_ENTER_NEO_UNION2 与 0x006B 字节布局相同', () => {
    const calls: number[] = [];
    const parseCharInfo = (fp: TestReader, end: number) => { calls.push(fp.tell(), end); return [{ GID: 1 }]; };
    const payload = [...u8(9), ...u8(3), ...u8(5), ...u8(0), ...u32(0), ...u32(11), ...u32(22), ...str('', 7), 1, 2, 3];
    const { packet } = decode('HC.ACCEPT_ENTER_NEO_UNION2', payload, { variable: true, deps: ['HC.ACCEPT_ENTER_NEO_UNION'], parseCharInfo });
    expect(packet).toMatchObject({ TotalSlotNum: 9, PremiumStartSlot: 3, PremiumEndSlot: 5, time1: 11, time2: 22 });
    expect(packet.charInfo).toEqual([{ GID: 1 }]);
    expect(calls[0]).toBe(4 + 3 + 1 + 4 + 4 + 4 + 7);
  });

  it('0x06B2 ACCEPT_ENTER2：只带一个角色（175 字节块），沿用角色列表的解析', () => {
    let seen: { at: number; end: number } | null = null;
    const parseCharInfo = (fp: TestReader, end: number) => { seen = { at: fp.tell(), end }; return [{ GID: 150001, name: 'Alice' }]; };
    const payload = new Array(175).fill(0);
    const { packet } = decode('HC.ACCEPT_ENTER2', payload, { variable: true, parseCharInfo });
    expect(seen).toEqual({ at: 4, end: 4 + 175 });
    expect(packet.entity).toEqual({ GID: 150001, name: 'Alice' });
  });
});


// ---------------------------------------------------------------------------
// 已有封包：按官方 1.js 的宽度/布局修正，同时保持旧布局可解析（只多不少）。
// ---------------------------------------------------------------------------
describe('物品 ID 等字段的宽度（官方 32 位，旧帧 16 位）', () => {
  // [包名, 官方宽度的负载, 旧宽度的负载, 期望字段]
  const cases: Array<[string, number[], number[], Decoded]> = [
    ['ZC.MVP_GETTING_ITEM', u32(100501), u16(501), { ITID: 100501 }],
    ['ZC.ACK_REQMAKINGITEM', [...u16(1), ...u32(100501)], [...u16(1), ...u16(501)], { result: 1, ITID: 100501 }],
    ['ZC.FEED_PET', [...u8(1), ...u32(100501)], [...u8(1), ...u16(501)], { cRet: 1, ITID: 100501 }],
    ['ZC.FEED_MER', [...u8(1), ...u32(100501)], [...u8(1), ...u16(501)], { cRet: 1, ITID: 100501 }],
    ['ZC.CASH_TIME_COUNTER', [...u32(100501), ...u32(3600)], [...u16(501), ...u32(3600)], { ITID: 100501, RemainSecond: 3600 }],
    ['ZC.CASH_ITEM_DELETE', [...u16(3), ...u32(100501)], [...u16(3), ...u16(501)], { index: 3, ITID: 100501 }],
    ['ZC.FAILED_TRADE_BUYING_STORE_TO_SELLER', [...u16(2), ...u32(100501)], [...u16(2), ...u16(501)], { Result: 2, ITID: 100501 }],
  ];

  it.each(cases)('%s：官方 32 位帧', (name, wide, _legacy, expected) => {
    const { packet, reader } = decode(name, wide);
    expect(packet).toMatchObject(expected);
    expect(reader.tell()).toBe(2 + wide.length);
  });

  it.each(cases)('%s：旧的 16 位帧仍可解析', (name, _wide, legacy, expected) => {
    const { packet } = decode(name, legacy);
    expect(packet).toMatchObject({ ...expected, ITID: 501 });
  });

  it('0x09CD MSG_COLOR：官方颜色 32 位，旧帧 16 位', () => {
    expect(decode('ZC.MSG_COLOR', [...u16(77), ...u32(0x00ff8000)]).packet).toMatchObject({ msg: 77, color: 0x00ff8000 });
    expect(decode('ZC.MSG_COLOR', [...u16(77), ...u16(0xff80)]).packet).toMatchObject({ msg: 77, color: 0xff80 });
  });
});

describe('布局与官方不同的已有封包', () => {
  it('0x0206 FRIENDS_STATE：35 字节帧带好友名，观察者的 11 字节帧没有', () => {
    const head = [...u32(1), ...u32(2), ...u8(1)];
    expect(decode('ZC.FRIENDS_STATE', [...head, ...str('Alice', 24)]).packet).toMatchObject({ AID: 1, GID: 2, State: 1, Name: 'Alice' });
    expect(decode('ZC.FRIENDS_STATE', head).packet.Name).toBeUndefined();
  });

  it('0x0849 SE_PC_BUY_CASHITEM_RESULT：官方 16 字节帧按 物品ID(4) 结果(2) 点数(4) 卡普拉点(4) 读取', () => {
    const { packet, reader } = decode('ZC.SE_PC_BUY_CASHITEM_RESULT', [...u32(100501), ...u16(0), ...u32(123456), ...u32(789)]);
    expect(packet).toMatchObject({ itemId: 100501, ITID: 100501, result: 0, cashPoints: 123456, kafraPoints: 789 });
    expect(reader.tell()).toBe(16);
    // 旧布局（仓库原有读法）仍然保留
    expect(decode('ZC.SE_PC_BUY_CASHITEM_RESULT', [...u16(7), ...u16(501), ...u16(0), ...u16(1000)]).packet)
      .toMatchObject({ kafraPoints: 7, itemId: 501, result: 0, cashPoints: 1000 });
  });

  it('0x097F SELECTCART：保留原有 identity/typeList，另按官方布局给出 cartIdentity/AID/CartList', () => {
    const { packet } = decode('ZC.SELECTCART', [...u16(0x1234), ...u32(2000001), 1, 2, 3], { variable: false });
    expect(packet).toMatchObject({ cartIdentity: 0x1234, AID: 2000001, CartList: [1, 2, 3] });
    expect(packet.typeList).toHaveLength(5);
    expect(packet.typeList.slice(2)).toEqual([1, 2, 3]);
  });

  it('0x0A43 ADD_MEMBER_TO_GROUP3：队伍角色(4) 职业(2) 等级(2) 坐标(2+2)', () => {
    const payload = [...u32(2000001), ...u32(0), ...u16(4004), ...u16(175), ...u16(120), ...u16(88), ...u8(1),
      ...str('Party1', 24), ...str('Alice', 24), ...str('prontera.gat', 16), ...u8(1), ...u8(2)];
    const { packet, reader } = decode('ZC.ADD_MEMBER_TO_GROUP3', payload);
    expect(packet).toMatchObject({ AID: 2000001, role: 0, Role: 0, class_: 4004, Job: 4004, baseLevel: 175, Level: 175, xPos: 120, yPos: 88,
      state: 1, groupName: 'Party1', characterName: 'Alice', mapName: 'prontera.gat', ItemPickupRule: 1, ItemDivisionRule: 2 });
    expect(reader.tell()).toBe(2 + payload.length);
  });

  it('0x0AFC NOTIFY_OFFLINEMSG：28 字节离线挂机结算，msg 仍然保留', () => {
    const payload = [...u8(1), ...u32(100), ...u32(200), ...u16(3), ...u16(150), ...u16(80), ...u32(777), ...u16(4), ...u16(5), ...u16(6), ...u16(7), ...u8(1)];
    expect(payload).toHaveLength(28);
    const { packet } = decode('ZC.NOTIFY_OFFLINEMSG', payload);
    expect(packet).toMatchObject({ op: 1, endtime: 100, time: 200, cash: 3, baselv: 150, joblv: 80, zeny: 777,
      equipCount: 4, cardCount: 5, bpower: 6, brepower: 7, feedback: 1 });
    expect(typeof packet.msg).toBe('string');
  });

  it('0x09A0 HC.CHARLIST_NOTIFY：帧里带第二个 32 位时读槽位数，6 字节旧帧不读', () => {
    expect(decode('HC.CHARLIST_NOTIFY', [...u32(3), ...u32(9)]).packet).toMatchObject({ TotalCnt: 3, charSlots: 9 });
    expect(decode('HC.CHARLIST_NOTIFY', u32(3)).packet.charSlots).toBeUndefined();
  });
});

describe('变长列表包按剩余字节自适应单元长度', () => {
  it('0x0221 NOTIFY_WEAPONITEMLIST：官方 23 字节条目与旧 13 字节条目', () => {
    const wide = (idx: number, itid: number) => [...u16(idx), ...u32(itid), ...u8(4), ...u32(1), ...u32(2), ...u32(3), ...u32(4)];
    const narrow = (idx: number, itid: number) => [...u16(idx), ...u16(itid), ...u8(4), ...u16(1), ...u16(2), ...u16(3), ...u16(4)];
    const a = decode('ZC.NOTIFY_WEAPONITEMLIST', [...wide(2, 100501), ...wide(3, 100502)], { variable: true }).packet;
    expect(a.itemList).toHaveLength(2);
    expect(a.itemList[1]).toEqual({ index: 3, ITID: 100502, RefiningLevel: 4, slot: { card1: 1, card2: 2, card3: 3, card4: 4 } });
    const b = decode('ZC.NOTIFY_WEAPONITEMLIST', [...narrow(2, 501), ...narrow(3, 502)], { variable: true }).packet;
    expect(b.itemList).toHaveLength(2);
    expect(b.itemList[1]).toEqual({ index: 3, ITID: 502, RefiningLevel: 4, slot: { card1: 1, card2: 2, card3: 3, card4: 4 } });
  });

  it('0x00C6 PC_PURCHASE_ITEMLIST：官方 11 字节条目与 13 字节条目', () => {
    const e11 = (price: number, itid: number) => [...u32(price), ...u32(price - 1), ...u8(3), ...u16(itid)];
    const e13 = (price: number, itid: number) => [...u32(price), ...u32(price - 1), ...u8(3), ...u32(itid)];
    const a = decode('ZC.PC_PURCHASE_ITEMLIST', [...e11(100, 501), ...e11(200, 502), ...e11(300, 503)], { variable: true }).packet;
    expect(a.itemList.map((x: Decoded) => [x.price, x.discountprice, x.type, x.ITID])).toEqual([[100, 99, 3, 501], [200, 199, 3, 502], [300, 299, 3, 503]]);
    const b = decode('ZC.PC_PURCHASE_ITEMLIST', [...e13(100, 100501), ...e13(200, 100502)], { variable: true }).packet;
    expect(b.itemList.map((x: Decoded) => x.ITID)).toEqual([100501, 100502]);
  });

  it('0x0287 PC_CASH_POINT_ITEMLIST：官方 11 字节条目、20 字节条目，以及头部的官方读法', () => {
    const e11 = (itid: number) => [...u32(10), ...u32(9), ...u8(1), ...u16(itid)];
    const a = decode('ZC.PC_CASH_POINT_ITEMLIST', [...u32(1500), ...u16(2), ...u16(11), ...e11(501), ...e11(502)], { variable: true }).packet;
    expect(a).toMatchObject({ officialCashPoint: 1500, md_itemcount: 2, md_itemSize: 11 });
    expect(a.itemList.map((x: Decoded) => x.ITID)).toEqual([501, 502]);
    const e20 = (itid: number) => [...u32(10), ...u32(9), ...u8(1), ...u32(itid), ...u16(5), ...u32(6), ...u8(0)];
    const b = decode('ZC.PC_CASH_POINT_ITEMLIST', [...u32(0), ...u32(0), ...e20(100501), ...e20(100502)], { variable: true }).packet;
    expect(b.itemList.map((x: Decoded) => [x.ITID, x.viewSprite, x.location])).toEqual([[100501, 5, 6], [100502, 5, 6]]);
  });

  it('0x0252 AUCTION_ITEM_REQ_SEARCH：118 / 108 / 83 字节条目', () => {
    const entry = (wide: boolean, options: boolean) => [...u32(7), ...str('Seller', 24), ...(wide ? u32(100501) : u16(501)), ...u32(2), ...u16(1), ...u8(1), ...u8(0), ...u8(9),
      ...(wide ? [...u32(1), ...u32(2), ...u32(3), ...u32(4)] : [...u16(1), ...u16(2), ...u16(3), ...u16(4)]),
      ...u32(500), ...u32(900), ...str('Buyer', 24), ...u32(1760000000), ...(options ? new Array(25).fill(0).map((_, i) => (i % 5 === 4 ? 1 : 0)) : [])];
    for (const [wide, options, size] of [[true, true, 118], [false, true, 108], [false, false, 83]] as const) {
      const bytes = entry(wide, options);
      expect(bytes).toHaveLength(size);
      const { packet } = decode('ZC.AUCTION_ITEM_REQ_SEARCH', [...u32(3), ...u32(1), ...bytes], { variable: true });
      expect(packet.auctionItemList).toHaveLength(1);
      expect(packet.auctionItemList[0]).toMatchObject({ AuctionID: 7, SellerName: 'Seller', ITID: wide ? 100501 : 501, RefiningLevel: 9, NowPrice: 500, MaxPrice: 900, BuyerName: 'Buyer', DeleteTime: 1760000000 });
      expect(packet.auctionItemList[0].slot.card4).toBe(4);
      expect(Boolean(packet.auctionItemList[0].options)).toBe(options);
    }
  });

  it('0x0800 PC_PURCHASE_ITEMLIST_FROMMC2：官方 53 字节条目与 64 字节条目', () => {
    const optionBytes = new Array(25).fill(0);
    const e53 = [...u32(1000), ...u16(2), ...u16(5), ...u8(4), ...u16(501), ...u8(1), ...u8(0), ...u8(7), ...u16(1), ...u16(2), ...u16(3), ...u16(4), ...optionBytes, ...u32(8), ...u16(9)];
    const e64 = [...u32(1000), ...u16(2), ...u16(5), ...u8(4), ...u32(100501), ...u8(1), ...u8(0), ...u8(7), ...u32(1), ...u32(2), ...u32(3), ...u32(4), ...optionBytes, ...u32(8), ...u16(9), ...u8(6)];
    expect(e53).toHaveLength(53);
    expect(e64).toHaveLength(64);
    const a = decode('ZC.PC_PURCHASE_ITEMLIST_FROMMC2', [...u32(11), ...u32(22), ...e53], { variable: true }).packet;
    expect(a.itemList[0]).toMatchObject({ price: 1000, count: 2, index: 5, type: 4, ITID: 501, RefiningLevel: 7, location: 8, viewSprite: 9, WearState: 9 });
    expect(a.itemList[0].slot.card4).toBe(4);
    const b = decode('ZC.PC_PURCHASE_ITEMLIST_FROMMC2', [...u32(11), ...u32(22), ...e64], { variable: true }).packet;
    expect(b.itemList[0]).toMatchObject({ ITID: 100501, location: 8, viewSprite: 9, grade: 6 });
    expect(b.itemList[0].slot.card4).toBe(4);
  });

  it('0x0AA5 MEMBERMGR_INFO2：官方 108 字节条目（带备注与角色名）与 34 字节条目', () => {
    const head = (aid: number) => [...u32(aid), ...u32(aid + 1), ...u16(1), ...u16(2), ...u16(0), ...u16(4004), ...u16(175), ...u32(5), ...u32(1), ...u32(3), ...u32(1760000000)];
    const a = decode('ZC.MEMBERMGR_INFO2', [...head(10), ...str('memo', 50), ...str('Alice', 24)], { variable: true }).packet;
    expect(a.memberInfo).toHaveLength(1);
    expect(a.memberInfo[0]).toMatchObject({ AID: 10, GID: 11, Job: 4004, Level: 175, LastLogin: 1760000000, Memo: 'memo', CharName: 'Alice' });
    const b = decode('ZC.MEMBERMGR_INFO2', [...head(10), ...head(20)], { variable: true }).packet;
    expect(b.memberInfo.map((x: Decoded) => [x.AID, x.Memo, x.CharName])).toEqual([[10, '', ''], [20, '', '']]);
  });

  it('0x08C0 ACK_SE_CASH_ITEM_LIST2：官方 标签(4) 数量(2) + 6 字节条目，并保留原有字段', () => {
    const payload = [...u32(2), ...u16(2), ...u16(501), ...u32(100), ...u16(502), ...u32(200)];
    const { packet } = decode('ZC.ACK_SE_CASH_ITEM_LIST2', payload, { variable: true });
    expect(packet).toMatchObject({ tab: 2, count: 2 });
    expect(packet.itemList).toEqual([{ ITID: 501, price: 100 }, { ITID: 502, price: 200 }]);
    expect(packet.len).toBe(2);
    const small = decode('ZC.ACK_SE_CASH_ITEM_LIST2', [...u32(2), ...u16(0)], { variable: true }).packet;
    expect(small).toMatchObject({ tab: 2, count: 0, itemList: [] });
    expect(small.len).toBeUndefined();
  });
});

describe('0x0856-0x0858 实体进入包：官方没有 shield 字段，带 shield 的帧长 4 字节', () => {
  const common = (withShield: boolean, prefix: number[]) => [
    ...u8(1), ...u32(150001), ...u16(150), ...u16(0), ...u16(0), ...u32(0), ...u16(4004), ...u16(1), ...u32(5),
    ...(withShield ? u32(6) : []), ...prefix,
  ];
  const tail = [...u16(1), ...u16(2), ...u16(3), ...u16(4), ...u16(5), ...u16(6), ...u32(7), ...u16(8), ...u16(9), ...u32(10), ...u8(0), ...u8(1)];
  const cases: Array<[string, number[], number[], number]> = [
    // [包名, 武器之后的字段, 名字之前的尾部, 官方负载长度（含 24 字节名字）]
    ['ZC.NOTIFY_MOVEENTRY6', [...u16(1), ...u32(2)], [...tail, ...new Array(6).fill(0), ...u8(3), ...u8(3), ...u16(99), ...u16(0)], 91],
    ['ZC.NOTIFY_NEWENTRY6', [...u16(1)], [...tail, ...new Array(3).fill(0), ...u8(3), ...u8(3), ...u8(0), ...u16(99), ...u16(0)], 85],
    ['ZC.NOTIFY_STANDENTRY6', [...u16(1)], [...tail, ...new Array(3).fill(0), ...u8(3), ...u8(3), ...u16(99), ...u16(0)], 84],
  ];
  it.each(cases)('%s：按帧长判断是否带 shield，名字在两种帧里都能读到', (name, mid, rest, officialPayload) => {
    // MOVEENTRY6 在 accessory 与 GUID 之间多一个 moveStartTime；这里只关心总长度和名字。
    const body = (withShield: boolean) => {
      const raw = [...common(withShield, mid), ...rest];
      const nameBytes = str('Mob', 24);
      // 补齐到“官方负载 - 24（名字）”，再加名字
      const target = officialPayload - 24 + (withShield ? 4 : 0);
      while (raw.length < target) raw.push(0);
      return [...raw.slice(0, target), ...nameBytes];
    };
    const official = decode(name, body(false), { variable: true });
    expect(official.packet.shield).toBeUndefined();
    expect(official.packet.name).toBe('Mob');
    const withShield = decode(name, body(true), { variable: true });
    expect(withShield.packet.shield).toBe(6);
    expect(withShield.packet.name).toBe('Mob');
  });
});

describe('官方声明了长度、但解析函数多读的包不得越过帧边界', () => {
  it('0x008F ENTRY_ACK：6 字节帧只有 AID；放得下 Header 时才读它', () => {
    const framed = decode('ZC.ENTRY_ACK', u32(2000001));
    expect(framed.packet).toMatchObject({ AID: 2000001 });
    expect(framed.packet.Header).toBeUndefined();
    expect(framed.reader.tell()).toBe(6);
    expect(decode('ZC.ENTRY_ACK', [...u16(7), ...u32(2000001)]).packet).toMatchObject({ Header: 7, AID: 2000001 });
  });

  it('0x02A3 GAMEGUARD_LINGO_KEY：18 字节帧只有 4 个密钥；放得下 packetType 时才读它', () => {
    const keys = [...u32(1), ...u32(2), ...u32(3), ...u32(4)];
    const framed = decode('ZC.GAMEGUARD_LINGO_KEY', keys);
    expect(framed.packet.lingoKey).toEqual({ dwAlgNum: 1, dwAlgKey1: 2, dwAlgKey2: 3, dwSeed: 4 });
    expect(framed.packet.packetType).toBeUndefined();
    expect(framed.reader.tell()).toBe(18);
    expect(decode('ZC.GAMEGUARD_LINGO_KEY', [...u16(9), ...keys]).packet.packetType).toBe(9);
  });
});

describe('新增的客户端封包（逐字节）', () => {
  class TestWriter {
    readonly buffer: ArrayBuffer;
    readonly view: DataView;
    private offset = 0;
    constructor(length: number) { this.buffer = new ArrayBuffer(length); this.view = new DataView(this.buffer); }
    writeShort(v: number) { this.view.setInt16(this.offset, v, true); this.offset += 2; }
    writeUShort(v: number) { this.view.setUint16(this.offset, v, true); this.offset += 2; }
    writeLong(v: number) { this.view.setInt32(this.offset, v, true); this.offset += 4; }
    writeULong(v: number) { this.view.setUint32(this.offset, v, true); this.offset += 4; }
    writeUChar(v: number) { this.view.setUint8(this.offset, v); this.offset += 1; }
  }
  function build(name: string, fields: Record<string, number> = {}): number[] {
    const region = 'src/Network/PacketStructure.js';
    const ctor = extractRuntimeNode(vendorSource, { region, kind: 'assignment', name: `PACKET.${name}` });
    const builder = extractRuntimeNode(vendorSource, { region, kind: 'assignment', name: `PACKET.${name}.prototype.build` });
    const PACKET = { CZ: {} } as Record<string, Record<string, any>>;
    const Packet = new Function('PACKET', 'BinaryWriter', `${ctor};\n${builder};\nreturn PACKET.${name};`)(PACKET, TestWriter);
    const instance = new Packet();
    Object.assign(instance, fields);
    const out = instance.build();
    return [...new Uint8Array(out.buffer)];
  }

  it.each([
    ['CZ.USE_SKILL_START', { SKID: 28, selectedLevel: 5, targetID: 2000001 }, [...u16(0x0b10), ...u16(28), ...u16(5), ...u32(2000001)]],
    ['CZ.USE_SKILL_END', { SKID: 28 }, [...u16(0x0b11), ...u16(28)]],
    ['CZ.REQ_GIVE_MANNER_POINT', { otherAID: 2000002, type: 1, point: -3 }, [...u16(0x0149), ...u32(2000002), ...u8(1), ...u16(0xfffd)]],
    ['CZ.REQ_DEL_QUEST', { Qid: 7001 }, [...u16(0x02be), ...u32(7001)]],
    ['CZ.REQ_ONECLICK_ITEMIDENTIFY', { result: 3 }, [...u16(0x0a35), ...u16(3)]],
    ['CZ.AUCTION_CLOSE', {}, [...u16(0x0acd)]],
    ['CZ.PARTY_REQ_MASTER_TO_JOIN', { CID: 150001, AID: 2000001 }, [...u16(0x0ae6), ...u32(150001), ...u32(2000001)]],
    ['CZ.PARTY_REQ_ACK_MASTER_TO_JOIN', { CID: 150001, AID: 2000001, accept: 1 }, [...u16(0x0af8), ...u32(150001), ...u32(2000001), ...u8(1)]],
  ] as Array<[string, Record<string, number>, number[]]>)('%s', (name, fields, expected) => {
    expect(build(name, fields)).toEqual(expected);
  });
});
