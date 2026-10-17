/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFile } from 'node:fs/promises';
import { expect, test, vi } from 'vitest';
import { sendKoreNativePacket } from '../src/kore/kore-integration.mjs';
import { extractRuntimeNode } from './helpers/vendor-runtime';

class PACKET_CZ_REQUEST_MOVE2 {
  dest = [237, 222];

  getPacketVersion() { return [20211103, 0x035f, 5, 2]; }

  build() {
    const buffer = Uint8Array.from([0x5f, 0x03, 0x01, 0x02, 0x03]).buffer;
    return { buffer, view: new DataView(buffer) };
  }
}

function runtimePage(sentBytes = 91): any {
  return {
    console: { log: vi.fn() },
    KoreEngine: { state: { sentBytes } },
  };
}

test('native KE packet log captures class, wire ID, encoded bytes and sent-byte delta', () => {
  const page = runtimePage();
  const packet = new PACKET_CZ_REQUEST_MOVE2();
  const sendPacket = vi.fn((value: unknown) => {
    const encoded = (value as PACKET_CZ_REQUEST_MOVE2).build();
    page.KoreEngine.state.sentBytes += encoded.buffer.byteLength;
  });

  const sent = sendKoreNativePacket({ type: 'MoveTo', x: 237, y: 222 }, packet, {
    page, sendPacket, socket: { connected: true, isZone: true, readyState: 1 },
  });

  expect(sent).toBe(true);
  expect(sendPacket).toHaveBeenCalledOnce();
  expect(page.console.log).toHaveBeenCalledWith('[KoreEngine] native packet send', expect.objectContaining({
    action: expect.objectContaining({ type: 'MoveTo', x: 237, y: 222 }),
    packetClass: 'PACKET_CZ_REQUEST_MOVE2',
    packetId: '0x035f',
    encodedBytes: 5,
    encodedPacketHex: '5F03010203',
    sentBytesBefore: 91,
    sentBytesAfter: 96,
    sentBytesDelta: 5,
    outcome: 'sent',
    reason: null,
  }));
});

test('patched MoveTo sender uses the packet logger and preserves the native network path', async () => {
  const runtime = await readFile('generated/runtime/Online.js', 'utf8');
  const actionAssignment = extractRuntimeNode(runtime, {
    kind: 'assignment', name: 'globalThis.KoreEngineNativeAction',
  });
  const packetHelper = extractRuntimeNode(runtime, { kind: 'function', name: 'sendKoreEnginePacket' });
  const page = runtimePage();
  const Packet = PACKET_CZ_REQUEST_MOVE2;
  const socket = { connected: true, isZone: true, readyState: 1 };
  const Network = {
    sendPacket: vi.fn((packet: PACKET_CZ_REQUEST_MOVE2) => {
      const encoded = packet.build();
      page.KoreEngine.state.sentBytes += encoded.buffer.byteLength;
    }),
  };
  const createSender = new Function('globalThis', 'sendKoreNativePacket', 'Network',
    'PacketVerManager_default', 'PACKET', 'SessionStorage_default', '_socket',
    'lastroVendingShoppingActive', 'lastroMovementUnavailable',
    `${packetHelper}\n${actionAssignment}\nreturn globalThis.KoreEngineNativeAction;`);
  const nativeAction = createSender(page, sendKoreNativePacket, Network,
    { value: 20211103 }, { CZ: { REQUEST_MOVE2: Packet, REQUEST_MOVE: Packet } }, {},
    socket, () => false, () => false);

  const sent = nativeAction({ type: 'MoveTo', x: 237, y: 222 });

  expect(sent).toBe(true);
  expect(Network.sendPacket).toHaveBeenCalledOnce();
  expect(page.console.log).toHaveBeenCalledWith('[KoreEngine] native packet send', expect.objectContaining({
    packetClass: 'PACKET_CZ_REQUEST_MOVE2', packetId: '0x035f', encodedBytes: 5,
    sentBytesDelta: 5, outcome: 'sent',
  }));
});

test('native KE packet log reports a protection refusal before packet encoding', () => {
  const page = runtimePage();
  const packet = new PACKET_CZ_REQUEST_MOVE2();
  const build = vi.spyOn(packet, 'build');
  const sendPacket = vi.fn(() => false);

  const sent = sendKoreNativePacket({ type: 'MoveTo', x: 237, y: 222 }, packet, {
    page, sendPacket, socket: { connected: true, isZone: true, readyState: 1 },
    refusalReason: 'movement-connection-unavailable',
  });

  expect(sent).toBe(false);
  expect(build).not.toHaveBeenCalled();
  expect(page.KoreEngine.state.sentBytes).toBe(91);
  expect(page.console.log).toHaveBeenCalledWith('[KoreEngine] native packet send', expect.objectContaining({
    packetClass: 'PACKET_CZ_REQUEST_MOVE2',
    packetId: '0x035f',
    encodedBytes: 0,
    sentBytesDelta: 0,
    outcome: 'rejected',
    reason: 'movement-connection-unavailable',
  }));
});

test('native KE packet log distinguishes a missing map socket from a sent packet', () => {
  const page = runtimePage();
  const packet = new PACKET_CZ_REQUEST_MOVE2();
  const sendPacket = vi.fn();

  const acceptedByNetwork = sendKoreNativePacket({ type: 'Attack', targetGid: 110031484 }, packet, {
    page, sendPacket, socket: null,
  });

  expect(acceptedByNetwork).toBe(true);
  expect(page.console.log).toHaveBeenCalledWith('[KoreEngine] native packet send', expect.objectContaining({
    action: expect.objectContaining({ type: 'Attack', targetGid: 110031484 }),
    sentBytesDelta: 0,
    outcome: 'socket-unavailable',
    reason: 'map-socket-unavailable',
  }));
});

