import { describe, expect, it } from 'vitest';
import { installLastroInstancePackets, LASTRO_INSTANCE_PACKET_IDS as IDS } from '../src/assistant/lro-party-packets.mjs';

class FakeWriter {
  constructor(length) { this.buffer = new ArrayBuffer(length); this.view = new DataView(this.buffer); this.offset = 0; }
  writeShort(value) { this.view.setUint16(this.offset, value, true); this.offset += 2; return this; }
  writeLong(value) { this.view.setInt32(this.offset, value, true); this.offset += 4; return this; }
  writeString(text) {
    const bytes = new TextEncoder().encode(text);
    for (const value of bytes) this.view.setUint8(this.offset++, value);
    return this;
  }
}

function createModules() {
  const packet = { CZ: {}, ZC: {} }, registrations = new Map();
  const network = { registerPacket(id, Type) { Type.id = id; registrations.set(id, Type); } };
  const packetLengths = { getPacketLength(id) { return id === 1234 ? 6 : false; } };
  return { packet, network, packetLengths, registrations, BinaryWriter: FakeWriter };
}

describe('LastRO extension 0x0bf1-0x0bf6', () => {
  it('registers only the 3 response structures and preserves native length lookup', () => {
    const env = createModules();
    expect(installLastroInstancePackets(env)).toBe(true);
    expect([...env.registrations.keys()]).toEqual([0x0bf2, 0x0bf4, 0x0bf6]);
    for (const id of [IDS.createReply, IDS.deleteReply, IDS.enterReply]) {
      expect(env.packetLengths.getPacketLength(id)).toBe(3);
      expect(env.registrations.get(id).size).toBe(3);
    }
    expect(env.packetLengths.getPacketLength(1234)).toBe(6);
    expect(env.packetLengths.getPacketLength(4321)).toBe(false);
    expect(installLastroInstancePackets(env)).toBe(true);
    expect(env.registrations.size).toBe(3);
  });

  it('creates opcode + uint16 length + NUL-terminated instance name', () => {
    const env = createModules(); installLastroInstancePackets(env);
    const item = new env.packet.CZ.REQ_CREATE_INSTANCE();
    item.instanceName = 'test';
    const { buffer } = item.build();
    const view = new DataView(buffer);
    expect(buffer.byteLength).toBe(9);
    expect(view.getUint16(0,true)).toBe(0x0bf1);
    expect(view.getUint16(2,true)).toBe(9);
    expect(new Uint8Array(buffer).slice(4)).toEqual(Uint8Array.of(116,101,115,116,0));
  });

  it('deletes the current instance with a bare 2-byte opcode', () => {
    const env = createModules(); installLastroInstancePackets(env);
    const { buffer } = new env.packet.CZ.REQ_DEL_INSTANCE().build();
    expect(new Uint8Array(buffer)).toEqual(Uint8Array.of(0xf3, 0x0b));
  });

  it('enters with 32-bit CID then AID followed by name', () => {
    const env = createModules(); installLastroInstancePackets(env);
    const item = new env.packet.CZ.REQ_ENTER_INSTANCE();
    item.CID = 123456; item.AID = 654321; item.instanceName = 'B';
    const { buffer } = item.build(), view = new DataView(buffer);
    expect(view.getUint16(0,true)).toBe(0x0bf5);
    expect(view.getUint16(2,true)).toBe(14);
    expect(view.getInt32(4,true)).toBe(123456);
    expect(view.getInt32(8,true)).toBe(654321);
    expect([...new Uint8Array(buffer).slice(12)]).toEqual([66,0]);
  });

  it('decodes all 3 response values as one unsigned byte', () => {
    const env = createModules(); installLastroInstancePackets(env);
    for (const id of [IDS.createReply, IDS.deleteReply, IDS.enterReply]) {
      const decoder = env.registrations.get(id);
      expect(new decoder({ readUChar: () => 2 }).rs).toBe(2);
      expect(decoder.id).toBe(id);
    }
  });

  it('does not install on unrelated servers or mutate packets without prerequisites', () => {
    const env = createModules();
    expect(installLastroInstancePackets({ ...env, enabled:false })).toBe(false);
    expect(env.registrations.size).toBe(0);
    expect(() => installLastroInstancePackets({ ...env, network:{} })).toThrow();
  });
});
