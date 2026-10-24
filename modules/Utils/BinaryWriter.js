define("Utils/BinaryWriter", ["Vendors/text-encoding"], function (a) {
  function b(a) {
    this.buffer = new ArrayBuffer(a);
    this.view = new DataView(this.buffer);
    this.offset = 0;
  }
  DataView.prototype.setPos = function (a, d, b) {
    var c = d[0];
    d = d[1];
    b
      ? (this.setInt8(a + 0, c >> 2, !0),
        this.setInt8(a + 1, ((c % 4) << 6) | (d >> 4), !0),
        this.setInt8(a + 2, (d % 16) << 4, !0))
      : (this.setInt8(a + 2, c >> 2, !0),
        this.setInt8(a + 1, ((c % 4) << 6) | (d >> 4), !0),
        this.setInt8(a + 0, (d % 16) << 4, !0));
  };
  DataView.prototype.setString = function (b, d, e) {
    e && (d = String(d).substr(0, e));
    var c = a.encode(d);
    d = 0;
    for (e = e || c.length; d < e; ++d) this.setUint8(b + d, c[d]);
  };
  DataView.prototype.setBinaryString = function (a, d, b) {
    b && (d = String(d).substr(0, b));
    var c;
    b = 0;
    for (c = d.length; b < c; ++b) this.setUint8(a + b, d.charCodeAt(b) & 255);
  };
  b.prototype.setInt8 =
    b.prototype.writeChar =
    b.prototype.writeByte =
      function (a) {
        this.view.setInt8(this.offset++, a, !0);
        return this;
      };
  b.prototype.setUint8 =
    b.prototype.writeUChar =
    b.prototype.writeUByte =
      function (a) {
        this.view.setUint8(this.offset++, a, !0);
        return this;
      };
  b.prototype.setInt16 = b.prototype.writeShort = function (a) {
    this.view.setInt16(this.offset, a, !0);
    this.offset += 2;
    return this;
  };
  b.prototype.setUint16 = b.prototype.writeUShort = function (a) {
    this.view.setUint16(this.offset, a, !0);
    this.offset += 2;
    return this;
  };
  b.prototype.setInt32 =
    b.prototype.writeInt =
    b.prototype.writeLong =
      function (a) {
        this.view.setInt32(this.offset, a, !0);
        this.offset += 4;
        return this;
      };
  b.prototype.setUint32 =
    b.prototype.writeUInt =
    b.prototype.writeULong =
      function (a) {
        this.view.setUint32(this.offset, a, !0);
        this.offset += 4;
        return this;
      };
  b.prototype.setUint64 = b.prototype.writeQLong = function (a) {
    this.view.setUint32(this.offset, a, !0);
    this.offset += 8;
    return this;
  };
  b.prototype.setFloat32 = b.prototype.writeFloat = function (a) {
    this.view.setFloat32(this.offset, a, !0);
    this.offset += 4;
    return this;
  };
  b.prototype.setFloat64 = b.prototype.writeDouble = function (a) {
    this.view.setFloat64(this.offset, a, !0);
    this.offset += 8;
    return this;
  };
  b.prototype.setString = b.prototype.writeString = function (b, d) {
    d && (b = String(b).substr(0, d));
    var c = a.encode(b),
      m = d || c.length;
    !d &&
      c.length > b.length &&
      ((b = new Uint8Array(this.buffer.byteLength + (c.length - b.length))),
      b.set(new Uint8Array(this.buffer), 0),
      (this.buffer = b.buffer),
      (this.view = new DataView(this.buffer)),
      this.view.setInt16(2, b.length, !0));
    for (b = 0; b < m; ++b) this.view.setUint8(this.offset + b, c[b]);
    this.offset += d || m;
    return this;
  };
  b.prototype.setBinaryString = b.prototype.writeBinaryString = function (
    a,
    d,
  ) {
    d && (a = String(a).substr(0, d));
    var b,
      c = a.length;
    for (b = 0; b < c; ++b)
      this.view.setUint8(this.offset + b, a.charCodeAt(b) & 255);
    this.offset += d || c;
    return this;
  };
  b.prototype.setBuffer = b.prototype.writeBuffer = function (a) {
    new Uint8Array(this.buffer).set(new Uint8Array(a), this.offset);
    this.offset += a.byteLength;
    return this;
  };
  b.prototype.skip = function (a) {
    this.offset += a;
    return this;
  };
  b.prototype.setPos = b.prototype.writePos = function (a) {
    var d = a[0];
    a = a[1];
    this.view.setInt8(this.offset++, d >> 2, !0);
    this.view.setInt8(this.offset++, ((d % 4) << 6) | (a >> 4), !0);
    this.view.setInt8(this.offset++, (a % 16) << 4, !0);
    return this;
  };
  return b;
});
