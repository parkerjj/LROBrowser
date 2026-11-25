import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { extractRuntimeNode, extractVendorRegion } from './helpers/vendor-runtime';

const runtime = readFileSync('vendor/v2/Online.js', 'utf8');
const timer = extractVendorRegion('src/UI/Components/PCGoldTimer/PCGoldTimer.js', runtime);
const extract = (region: string, name: string) => extractRuntimeNode(runtime, { region, kind: 'function', name });
const result = extract('src/Engine/MapEngine/NPC.js', 'onDynamicNPCCreateRequest');
const entity = extract('src/Engine/MapEngine/Entity.js', 'onEntitySpam');
const transfer = extract('src/Engine/MapEngine.js', 'onServerChange');

function fixture() {
  const sent: object[] = [];
  const timers: Array<() => void> = [];
  const addText = vi.fn();
  const dialog = { __active: false, _host: { isConnected: true } };
  const session = {};
  const api = runInNewContext(`${timer}\n${result}\n${entity}\n${transfer}\n({
    click: onClickPCGoldTimer, spawn: onEntitySpam, result: onDynamicNPCCreateRequest, changeZone: onServerChange,
  })`, {
    __esmMin: () => () => {},
    Configs: { get: () => true }, isObserverMode: () => false,
    SessionStorage_default: session, lastroAuction: undefined, MapEngine: { init() {} },
    NpcBox_default: dialog, NpcMenu_default: { __active: false },
    ChatBox_default: { addText, TYPE: { ERROR: 'error' }, FILTER: { PUBLIC_LOG: 'public' } },
    Entity: { TYPE_NPC: 6, TYPE_NPC2: 12 },
    EntityManager: { get: () => ({ set() { throw new Error('The hidden NPC must bypass the renderer'); } }) },
    PACKET: { CZ: {
      DYNAMICNPC_CREATE_REQUEST: class { name = ''; },
      CONTACTNPC: class { NAID = 0; type = 0; },
    } },
    Network: { sendPacket: (packet: object) => sent.push(packet) },
    setTimeout: (callback: () => void) => timers.push(callback),
  }) as { click(): void; spawn(packet: object): void; result(packet: object): void; changeZone(packet: object): void };
  return { ...api, sent, timers, addText, dialog };
}

const npc = { name: 'GoldpointManager', GID: 110000137, objecttype: 6 };
const request = { name: 'GOLDPCCAFE' };
const contact = { NAID: 110000137, type: 1 };

describe('在线积分 NPC', () => {
  it('等待积分管理员实体与成功回包，无论先后都只发一次对话请求', () => {
    const f = fixture();
    f.click();
    f.click();
    f.result({ result: 0 });
    expect(f.sent).toEqual([request]);
    f.spawn(npc);
    f.result({ result: 0 });
    expect(f.sent).toEqual([request, contact]);

    const other = fixture();
    other.click();
    other.spawn(npc);
    expect(other.sent).toEqual([request]);
    other.result({ result: 0 });
    expect(other.sent).toEqual([request, contact]);
  });

  it('再次点击可以使用当前地图已有管理员，切换地图服务器后丢弃旧状态', () => {
    const f = fixture();
    f.click();
    f.spawn(npc);
    f.result({ result: 0 });
    f.click();
    f.result({ result: 3 });
    expect(f.sent).toEqual([request, contact, request, contact]);
    f.click();
    f.changeZone({ addr: { ip: '127.0.0.1', port: 6121 }, mapName: 'izlude' });
    f.result({ result: 0 });
    expect(f.sent).toEqual([request, contact, request, contact, request]);
  });

  it('保留动态 NPC 错误处理，超时后可以重试，已有对话时不抢占', () => {
    const f = fixture();
    f.dialog.__active = true;
    f.click();
    expect(f.sent).toEqual([]);
    f.dialog.__active = false;
    f.click();
    f.result({ result: 2 });
    expect(f.addText).toHaveBeenCalledOnce();
    f.click();
    f.timers[1]!();
    expect(f.addText).toHaveBeenCalledTimes(2);
    f.click();
    expect(f.sent).toEqual([request, request, request]);
  });
});
