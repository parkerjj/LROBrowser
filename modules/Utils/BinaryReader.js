define("Utils/BinaryReader", ["./Struct", "Vendors/text-encoding"], function (
  a,
  b,
) {
  function c(a, d, b) {
    var c;
    if ("string" === typeof a) {
      var e, h, l;
      l = a.length;
      c = new ArrayBuffer(l);
      e = new Uint8Array(c);
      for (h = 0; h < l; ++h) e[h] = a.charCodeAt(h) & 255;
    } else if (a instanceof ArrayBuffer) c = a;
    else if (a instanceof Uint8Array) c = a.buffer;
    else throw Error("BinaryReader() - Undefined buffer type");
    this.buffer = c;
    this.view = new DataView(c, d || 0, b || c.byteLength);
    this.offset = 0;
    this.length = (b || c.byteLength) - (d || 0);
  }
  _global.SEEK_CUR = 1;
  _global.SEEK_SET = 2;
  _global.SEEK_END = 3;
  c.prototype.getInt8 =
    c.prototype.readChar =
    c.prototype.readByte =
      function () {
        return this.view.getInt8(this.offset++);
      };
  c.prototype.getUint8 =
    c.prototype.readUChar =
    c.prototype.readUByte =
      function () {
        return this.view.getUint8(this.offset++);
      };
  c.prototype.getInt16 = c.prototype.readShort = function () {
    var a = this.view.getInt16(this.offset, !0);
    this.offset += 2;
    return a;
  };
  c.prototype.getUint16 = c.prototype.readUShort = function () {
    var a = this.view.getUint16(this.offset, !0);
    this.offset += 2;
    return a;
  };
  c.prototype.getInt32 =
    c.prototype.readInt =
    c.prototype.readLong =
      function () {
        var a = this.view.getInt32(this.offset, !0);
        this.offset += 4;
        return a;
      };
  c.prototype.getUint32 =
    c.prototype.readUInt =
    c.prototype.readULong =
      function () {
        var a = this.view.getUint32(this.offset, !0);
        this.offset += 4;
        return a;
      };
  c.prototype.getUint64 = c.prototype.readQLong = function () {
    var a = this.view.getUint32(this.offset, !0);
    this.offset += 8;
    return a;
  };
  c.prototype.getFloat32 = c.prototype.readFloat = function () {
    var a = this.view.getFloat32(this.offset, !0);
    this.offset += 4;
    return a;
  };
  c.prototype.getFloat64 = c.prototype.readDouble = function () {
    var a = this.view.getFloat64(this.offset, !0);
    this.offset += 8;
    return a;
  };
  c.prototype.tell = function () {
    return this.offset;
  };
  c.prototype.getString = c.prototype.readString = function (a) {
    var d = this.offset + 0,
      c,
      e,
      h = new Uint8Array(a);
    for (c = 0; c < a && (e = this.getUint8()); ++c) h[c] = e;
    this.offset = d + a;
    return b.decode(h.subarray(0, c));
  };
  c.prototype.getBinaryString = c.prototype.readBinaryString = function (a) {
    var d = this.offset + 0,
      b,
      c,
      e = "";
    for (b = 0; b < a && (c = this.getUint8()); ++b)
      e += String.fromCharCode(c);
    this.offset = d + a;
    return e;
  };
  c.prototype.getStruct = c.prototype.readStruct = function (d) {
    if (!(d instanceof a))
      throw Error("BinaryReader::getStruct() - Invalid data as argument");
    d = d._list;
    var b,
      c = {},
      e,
      h,
      m,
      l,
      f;
    h = Object.keys(d);
    f = h.length;
    for (l = 0; l < f; ++l)
      if (((b = h[l]), (e = d[b]), 1 < e.count))
        for (c[b] = Array(e.count), m = 0; m < e.count; ++m)
          c[b][m] = this[e.func]();
      else c[b] = this[e.func]();
    return c;
  };
  c.prototype.seek = function (a, d) {
    d = d || SEEK_SET;
    this.offset =
      d === SEEK_CUR ? this.offset + a : d === SEEK_END ? this.length + a : a;
  };
  var d = new ArrayBuffer(4),
    e = new Int8Array(d),
    m = new Int32Array(d);
  c.prototype.getPos = c.prototype.readPos = function () {
    var a, d;
    e[2] = this.getUint8();
    e[1] = this.getUint8();
    e[0] = this.getUint8();
    e[3] = 0;
    a = 0 + m[0];
    d = a & 15;
    a >>= 4;
    return [(a >> 10) & 1023, a & 1023, d];
  };
  c.prototype.getPos2 = c.prototype.readPos2 = function () {
    var a, d, b, c, e;
    a = this.getInt8();
    d = this.getInt8();
    b = this.getInt8();
    c = this.getInt8();
    e = this.getInt8();
    this.getInt8();
    return [
      ((a & 255) << 2) | ((d & 192) >> 6),
      ((d & 63) << 4) | ((b & 240) >> 4),
      ((c & 252) >> 2) | ((b & 15) << 6),
      ((c & 3) << 8) | (e & 255),
    ];
  };
  return c;
});
