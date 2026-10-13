// Six LastRO-specific game-instance packets from the official legacy Online.js.
// This deliberately does not alter Ragnarok's standard party-booking packet family.
export const LASTRO_INSTANCE_PACKET_IDS = Object.freeze({
  createRequest: 0x0bf1,
  createReply: 0x0bf2,
  deleteRequest: 0x0bf3,
  deleteReply: 0x0bf4,
  enterRequest: 0x0bf5,
  enterReply: 0x0bf6,
});

const FIXED_REPLY_LENGTH = 3;
const patchedNetworks = new WeakSet();

export function installLastroInstancePackets({ packet, network, packetLengths, BinaryWriter, enabled = true }) {
  if (!enabled) return false;
  if (!packet?.CZ || !packet?.ZC || !network?.registerPacket
    || typeof packetLengths?.getPacketLength !== 'function'
    || typeof BinaryWriter !== 'function') {
    throw new TypeError('LastRO instance packet installation requires initialized V2 network modules');
  }
  if (patchedNetworks.has(network)) return true;
  const id = LASTRO_INSTANCE_PACKET_IDS;

  packet.CZ.REQ_CREATE_INSTANCE = function PACKET_CZ_REQ_CREATE_INSTANCE() {
    this.instanceName = '';
  };
  packet.CZ.REQ_CREATE_INSTANCE.prototype.build = function () {
    const name = String(this.instanceName || '');
    // BinaryWriter.writeString invokes the existing game GBK codepage handler.
    // The native writer also expands variable buffers and updates packet length
    // if the encoded text has more bytes than JS string code units.
    const size = 4 + name.length + 1;
    const writer = new BinaryWriter(size);
    writer.writeShort(id.createRequest);
    writer.writeShort(size);
    writer.writeString(name);
    return writer;
  };

  packet.CZ.REQ_DEL_INSTANCE = function PACKET_CZ_REQ_DEL_INSTANCE() {};
  packet.CZ.REQ_DEL_INSTANCE.prototype.build = function () {
    const writer = new BinaryWriter(2);
    writer.writeShort(id.deleteRequest);
    return writer;
  };

  packet.CZ.REQ_ENTER_INSTANCE = function PACKET_CZ_REQ_ENTER_INSTANCE() {
    this.AID = 0;
    this.CID = 0;
    this.instanceName = '';
  };
  packet.CZ.REQ_ENTER_INSTANCE.prototype.build = function () {
    const name = String(this.instanceName || '');
    const size = 12 + name.length + 1;
    const writer = new BinaryWriter(size);
    writer.writeShort(id.enterRequest);
    writer.writeShort(size);
    writer.writeLong(this.CID);
    writer.writeLong(this.AID);
    writer.writeString(name);
    return writer;
  };

  const makeReply = name => {
    // Deliberately named functions: the network debugger uses Struct.name.
    const Reply = function (reader) { this.rs = reader.readUChar(); };
    Object.defineProperty(Reply, 'name', { value: name });
    Reply.size = FIXED_REPLY_LENGTH;
    return Reply;
  };
  packet.ZC.RS_CREATE_INSTANCE = makeReply('PACKET_ZC_RS_CREATE_INSTANCE');
  packet.ZC.RS_DEL_INSTANCE = makeReply('PACKET_ZC_RS_DEL_INSTANCE');
  packet.ZC.RS_ENTER_INSTANCE = makeReply('PACKET_ZC_RS_ENTER_INSTANCE');

  const replies = [
    [id.createReply, packet.ZC.RS_CREATE_INSTANCE],
    [id.deleteReply, packet.ZC.RS_DEL_INSTANCE],
    [id.enterReply, packet.ZC.RS_ENTER_INSTANCE],
  ];
  const originalGetLength = packetLengths.getPacketLength;
  const replyIds = new Set(replies.map(([replyId]) => replyId));
  packetLengths.getPacketLength = function (packetId) {
    return replyIds.has(packetId) ? FIXED_REPLY_LENGTH : originalGetLength.call(this, packetId);
  };
  for (const [replyId, constructor] of replies) network.registerPacket(replyId, constructor);
  patchedNetworks.add(network);
  return true;
}
