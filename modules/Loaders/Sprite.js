define("Loaders/Sprite", ["Utils/BinaryReader"], function (a) {
  function b(a) {
    a && this.load(a);
  }
  b.TYPE_PAL = 0;
  b.TYPE_RGBA = 1;
  b.prototype.fp = null;
  b.prototype.header = "SP";
  b.prototype.version = 0;
  b.prototype.indexed_count = 0;
  b.prototype._indexed_count = 0;
  b.prototype.rgba_count = 0;
  b.prototype.rgba_index = 0;
  b.prototype.palette = null;
  b.prototype.frames = null;
  b.prototype.load = function (b) {
    this.fp = new a(b);
    this.header = this.fp.readBinaryString(2);
    this.version = this.fp.readUByte() / 10 + this.fp.readUByte();
    if ("SP" != this.header)
      throw Error(
        'SPR::load() - Incorrect header "' + this.header + '", must be "SP"',
      );
    this.indexed_count = this.fp.readUShort();
    this._indexed_count = this.indexed_count + 0;
    1.1 < this.version && (this.rgba_count = this.fp.readUShort());
    this.frames = Array(this.indexed_count + this.rgba_count);
    this.rgba_index = this.indexed_count;
    2.1 > this.version ? this.readIndexedImage() : this.readIndexedImageRLE();
    this.readRgbaImage();
    1 < this.version &&
      (this.palette = new Uint8Array(
        this.fp.buffer,
        this.fp.length - 1024,
        1024,
      ));
  };
  b.prototype.readIndexedImage = function () {
    var a = this.indexed_count,
      d = this.fp,
      e,
      m,
      h,
      r = this.frames;
    for (e = 0; e < a; ++e)
      ((m = d.readUShort()),
        (h = d.readUShort()),
        (r[e] = {
          type: b.TYPE_PAL,
          width: m,
          height: h,
          data: new Uint8Array(d.buffer, d.tell(), m * h),
        }),
        d.seek(m * h, SEEK_CUR));
  };
  b.prototype.readIndexedImageRLE = function () {
    var a = this.indexed_count,
      d = this.fp,
      e,
      m,
      h,
      r,
      q,
      k,
      g,
      t,
      l,
      f = this.frames;
    for (e = 0; e < a; ++e) {
      m = d.readUShort();
      h = d.readUShort();
      r = m * h;
      r = new Uint8Array(r);
      q = 0;
      for (l = d.readUShort() + d.tell(); d.tell() < l;)
        if (((k = d.readUByte()), (r[q++] = k), !k))
          if ((g = d.readUByte())) for (t = 1; t < g; ++t) r[q++] = k;
          else r[q++] = g;
      f[e] = { type: b.TYPE_PAL, width: m, height: h, data: r };
    }
  };
  b.prototype.readRgbaImage = function () {
    var a = this.rgba_count,
      d = this.rgba_index,
      e = this.fp,
      m = this.frames,
      h,
      r,
      q;
    for (h = 0; h < a; ++h)
      ((r = e.readShort()),
        (q = e.readShort()),
        (m[h + d] = {
          type: b.TYPE_RGBA,
          width: r,
          height: q,
          data: new Uint8Array(e.buffer, e.tell(), r * q * 4),
        }),
        e.seek(r * q * 4, SEEK_CUR));
  };
  b.prototype.switchToRGBA = function () {
    var a = this.frames,
      d,
      e,
      m = this.indexed_count,
      h,
      r,
      q,
      k,
      g,
      t,
      l = this.palette,
      f,
      n;
    for (e = 0; e < m; ++e)
      if (((d = a[e]), d.type === b.TYPE_PAL)) {
        h = d.data;
        r = d.width;
        q = d.height;
        t = new Uint8Array(r * q * 4);
        for (g = 0; g < q; ++g)
          for (k = 0; k < r; ++k)
            ((f = 4 * h[k + g * r]),
              (n = 4 * (k + (q - g - 1) * r)),
              (t[n + 3] = l[f + 0]),
              (t[n + 2] = l[f + 1]),
              (t[n + 1] = l[f + 2]),
              (t[n + 0] = f ? 255 : 0));
        d.data = t;
        d.type = b.TYPE_RGBA;
      }
    this.indexed_count = 0;
    this.rgba_count = a.length;
    this.rgba_index = 0;
  };
  b.prototype.getCanvasFromFrame = function (a) {
    var d = document.createElement("canvas"),
      c = d.getContext("2d"),
      m,
      h,
      r,
      q,
      k,
      g,
      t;
    m = this.frames[a];
    if (0 >= m.width || 0 >= m.height) return null;
    d.width = m.width;
    d.height = m.height;
    g = m.width;
    t = m.height;
    a = c.createImageData(m.width, m.height);
    if (m.type === b.TYPE_RGBA)
      for (r = 0; r < t; ++r)
        for (h = 0; h < g; ++h)
          ((q = 4 * (h + r * g)),
            (k = 4 * (h + (t - r - 1) * g)),
            (a.data[k + 0] = m.data[q + 3]),
            (a.data[k + 1] = m.data[q + 2]),
            (a.data[k + 2] = m.data[q + 1]),
            (a.data[k + 3] = m.data[q + 0]));
    else {
      var l = this.palette;
      for (r = 0; r < t; ++r)
        for (h = 0; h < g; ++h)
          ((q = 4 * m.data[h + r * g]),
            (k = 4 * (h + r * g)),
            (a.data[k + 0] = l[q + 0]),
            (a.data[k + 1] = l[q + 1]),
            (a.data[k + 2] = l[q + 2]),
            (a.data[k + 3] = q ? 255 : 0));
    }
    c.putImageData(a, 0, 0);
    return d;
  };
  b.prototype.compile = function () {
    var a = this.frames,
      d,
      e,
      m = a.length,
      h,
      r,
      q,
      k,
      g,
      t,
      l,
      f,
      n,
      p = Math.pow,
      v = Math.ceil,
      u = Math.log,
      A = Math.floor,
      D,
      B = Array(m);
    for (e = 0; e < m; ++e) {
      d = a[e];
      h = d.data;
      r = d.width;
      q = d.height;
      k = p(2, v(u(r) / u(2)));
      g = p(2, v(u(q) / u(2)));
      t = A(0.5 * (k - r));
      l = A(0.5 * (g - q));
      if (d.type === b.TYPE_PAL)
        for (D = new Uint8Array(k * g), n = 0; n < q; ++n)
          for (f = 0; f < r; ++f)
            ((D[(n + l) * k + (f + t)] = h[n * r + f]),
              255 == this.palette[4 * h[n * r + f]] &&
                255 == this.palette[4 * h[n * r + f] + 2] &&
                0 == this.palette[4 * h[n * r + f] + 1] &&
                (D[(n + l) * k + (f + t)] = 0));
      else
        for (D = new Uint8Array(k * g * 4), n = 0; n < q; ++n)
          for (f = 0; f < r; ++f)
            ((D[4 * ((n + l) * k + (f + t)) + 0] =
              h[4 * ((q - n - 1) * r + f) + 3]),
              (D[4 * ((n + l) * k + (f + t)) + 1] =
                h[4 * ((q - n - 1) * r + f) + 2]),
              (D[4 * ((n + l) * k + (f + t)) + 2] =
                h[4 * ((q - n - 1) * r + f) + 1]),
              (D[4 * ((n + l) * k + (f + t)) + 3] =
                h[4 * ((q - n - 1) * r + f) + 0]));
      B[e] = {
        type: d.type,
        width: k,
        height: g,
        originalWidth: r,
        originalHeight: q,
        data: D,
      };
    }
    return {
      frames: B,
      palette: this.palette,
      rgba_index: this.rgba_index,
      old_rgba_index: this._indexed_count,
    };
  };
  return b;
});
