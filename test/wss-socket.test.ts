import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import type { LegacyClientSocket } from '../src/network/client-socket';

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  binaryType = '';
  readyState = 0;
  onopen?: () => void;
  onerror?: () => void;
  onmessage?: (event: { data: ArrayBuffer }) => void;
  onclose?: (event: object) => void;
  sent: ArrayBuffer[] = [];
  close = vi.fn(() => { this.readyState = 3; });
  constructor(readonly url: string) { FakeWebSocket.instances.push(this); }
  send(buffer: ArrayBuffer) { this.sent.push(buffer); }
}

function harness(mode = 'relay', serverId = 'lastro-2x') {
  FakeWebSocket.instances = [];
  const source = readFileSync('generated/runtime/Online.js', 'utf8');
  const start = source.indexOf('function Socket$1(');
  const socket = start === -1 ? '' : source.slice(start, source.indexOf('//#endregion', start));
  const factoryStart = source.indexOf('function defaultSocketFactory(');
  const factory = source.slice(factoryStart, source.indexOf('/**', factoryStart));
  const direct = vi.fn(() => ({ direct: true }));
  const context = vm.createContext({
    __esmMin: (init: () => void) => init, WebSocket: FakeWebSocket, URL,
    Configs: { get: (key: string, fallback: unknown) => ({ connectionMode: mode, id: serverId }[key] ?? fallback) },
    LastRODirectSocketFactory: direct,
  });
  vm.runInContext(`${socket}\nif (typeof init_WebSocket === 'function') init_WebSocket();\n${factory}`, context);
  const create: (host: string, port: number) => LegacyClientSocket = vm.runInContext('defaultSocketFactory', context);
  return { create, direct };
}

describe('explicit WSS relay transport', () => {
  it('uses WSS for relay mode and forwards binary packets', () => {
    const { create, direct } = harness();
    const socket = create('port.lastro.cn', 26569);
    expect(FakeWebSocket.instances).toHaveLength(1);
    const ws = FakeWebSocket.instances[0]!;
    expect(ws.url).toBe('wss://port.lastro.cn/45.248.10.247:26569');
    expect(ws.binaryType).toBe('arraybuffer');
    expect(direct).not.toHaveBeenCalled();
    const complete = vi.fn(), receive = vi.fn();
    socket.onComplete = complete;
    socket.onMessage = receive;
    ws.readyState = 1;
    ws.onopen?.();
    expect(socket.connected).toBe(true);
    expect(complete).toHaveBeenCalledExactlyOnceWith(true);
    const bytes = new Uint8Array([1, 2, 3]).buffer;
    socket.send(bytes);
    expect(ws.sent).toEqual([bytes]);
    ws.onmessage?.({ data: bytes });
    expect(receive).toHaveBeenCalledExactlyOnceWith(bytes);
  });

  it('keeps direct mode on TCP without creating a WebSocket', () => {
    const { create, direct } = harness('direct', 'lastro-app');
    expect(create('port.lastro.cn', 26569)).toEqual({ direct: true });
    expect(direct).toHaveBeenCalledExactlyOnceWith('port.lastro.cn', 26569);
    expect(FakeWebSocket.instances).toEqual([]);
  });

  it('routes 3x login and character/map handoffs through the same WSS origin', () => {
    const { create } = harness('relay', 'lastro-3x');
    create('port.lastro.cn', 28569);
    create('port.lastro.cn', 28570);
    create('45.248.10.247', 28571);
    expect(FakeWebSocket.instances.map(ws => ws.url)).toEqual([
      'wss://port.lastro.cn/45.248.10.247:28569',
      'wss://port.lastro.cn/45.248.10.247:28570',
      'wss://port.lastro.cn/45.248.10.247:28571',
    ]);
  });

  it('forwards a refreshed official numeric host to the relay without old IP substitution', () => {
    const { create } = harness('relay', 'lastro-3x');
    create('103.8.222.164', 28569);
    create('103.8.222.164', 28570);
    expect(FakeWebSocket.instances.map(ws => ws.url)).toEqual([
      'wss://port.lastro.cn/103.8.222.164:28569',
      'wss://port.lastro.cn/103.8.222.164:28570',
    ]);
  });

  it('rejects relay use for App even for character/map ports', () => {
    const { create } = harness('relay', 'lastro-app');
    expect(() => create('port.lastro.cn', 27570)).toThrow(/App/);
    expect(FakeWebSocket.instances).toEqual([]);
  });

  it('rejects direct use for non-App servers while GM has it disabled', () => {
    const { create, direct } = harness('direct', 'lastro-2x');
    expect(() => create('port.lastro.cn', 26569)).toThrow('直连暂时仅App服可用');
    expect(direct).not.toHaveBeenCalled();
  });

  it('cancels a connecting socket and ignores late open/message events', () => {
    const { create } = harness();
    const socket = create('port.lastro.cn', 26569);
    const ws = FakeWebSocket.instances[0]!;
    const complete = vi.fn(), receive = vi.fn(), close = vi.fn();
    socket.onComplete = complete; socket.onMessage = receive; socket.onClose = close;
    socket.close(); socket.close();
    expect(ws.close).toHaveBeenCalledTimes(1);
    ws.onopen?.(); ws.onmessage?.({ data: new ArrayBuffer(0) }); ws.onclose?.({});
    expect(socket.connected).toBe(false);
    expect(complete).not.toHaveBeenCalled();
    expect(receive).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });

  it('reports opening failure once across error and close', () => {
    const { create } = harness();
    const socket = create('port.lastro.cn', 26569);
    const ws = FakeWebSocket.instances[0]!;
    const complete = vi.fn(), close = vi.fn();
    socket.onComplete = complete; socket.onClose = close;
    ws.onerror?.(); ws.onclose?.({});
    expect(complete).toHaveBeenCalledExactlyOnceWith(false);
    expect(socket.connected).toBe(false);
  });

  it('reports remote disconnect once after opening', () => {
    const { create } = harness();
    const socket = create('port.lastro.cn', 26569);
    const ws = FakeWebSocket.instances[0]!;
    const close = vi.fn(); socket.onClose = close;
    ws.onopen?.(); ws.onclose?.({ code: 1006 }); ws.onclose?.({ code: 1006 });
    expect(socket.connected).toBe(false);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
