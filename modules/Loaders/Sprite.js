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
      q = this.frames;
    for (e = 0; e < a; ++e)
      ((m = d.readUShort()),
        (h = d.readUShort()),
        (q[e] = {
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
      q,
      r,
      k,
      g,
      u,
      l,
      f = this.frames;
    for (e = 0; e < a; ++e) {
      m = d.readUShort();
      h = d.readUShort();
      q = m * h;
      q = new Uint8Array(q);
      r = 0;
      for (l = d.readUShort() + d.tell(); d.tell() < l;)
        if (((k = d.readUByte()), (q[r++] = k), !k))
          if ((g = d.readUByte())) for (u = 1; u < g; ++u) q[r++] = k;
          else q[r++] = g;
      f[e] = { type: b.TYPE_PAL, width: m, height: h, data: q };
    }
  };
  b.prototype.readRgbaImage = function () {
    var a = this.rgba_count,
      d = this.rgba_index,
      e = this.fp,
      m = this.frames,
      h,
      q,
      r;
    for (h = 0; h < a; ++h)
      ((q = e.readShort()),
        (r = e.readShort()),
        (m[h + d] = {
          type: b.TYPE_RGBA,
          width: q,
          height: r,
          data: new Uint8Array(e.buffer, e.tell(), q * r * 4),
        }),
        e.seek(q * r * 4, SEEK_CUR));
  };
  b.prototype.switchToRGBA = function () {
    var a = this.frames,
      d,
      e,
      m = this.indexed_count,
      h,
      q,
      r,
      k,
      g,
      u,
      l = this.palette,
      f,
      n;
    for (e = 0; e < m; ++e)
      if (((d = a[e]), d.type === b.TYPE_PAL)) {
        h = d.data;
        q = d.width;
        r = d.height;
        u = new Uint8Array(q * r * 4);
        for (g = 0; g < r; ++g)
          for (k = 0; k < q; ++k)
            ((f = 4 * h[k + g * q]),
              (n = 4 * (k + (r - g - 1) * q)),
              (u[n + 3] = l[f + 0]),
              (u[n + 2] = l[f + 1]),
              (u[n + 1] = l[f + 2]),
              (u[n + 0] = f ? 255 : 0));
        d.data = u;
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
      q,
      r,
      k,
      g,
      u;
    m = this.frames[a];
    if (0 >= m.width || 0 >= m.height) return null;
    d.width = m.width;
    d.height = m.height;
    g = m.width;
    u = m.height;
    a = c.createImageData(m.width, m.height);
    if (m.type === b.TYPE_RGBA)
      for (q = 0; q < u; ++q)
        for (h = 0; h < g; ++h)
          ((r = 4 * (h + q * g)),
            (k = 4 * (h + (u - q - 1) * g)),
            (a.data[k + 0] = m.data[r + 3]),
            (a.data[k + 1] = m.data[r + 2]),
            (a.data[k + 2] = m.data[r + 1]),
            (a.data[k + 3] = m.data[r + 0]));
    else {
      var l = this.palette;
      for (q = 0; q < u; ++q)
        for (h = 0; h < g; ++h)
          ((r = 4 * m.data[h + q * g]),
            (k = 4 * (h + q * g)),
            (a.data[k + 0] = l[r + 0]),
            (a.data[k + 1] = l[r + 1]),
            (a.data[k + 2] = l[r + 2]),
            (a.data[k + 3] = r ? 255 : 0));
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
      q,
      r,
      k,
      g,
      u,
      l,
      f,
      n,
      p = Math.pow,
      v = Math.ceil,
      t = Math.log,
      z = Math.floor,
      E,
      C = Array(m);
    for (e = 0; e < m; ++e) {
      d = a[e];
      h = d.data;
      q = d.width;
      r = d.height;
      k = p(2, v(t(q) / t(2)));
      g = p(2, v(t(r) / t(2)));
      u = z(0.5 * (k - q));
      l = z(0.5 * (g - r));
      if (d.type === b.TYPE_PAL)
        for (E = new Uint8Array(k * g), n = 0; n < r; ++n)
          for (f = 0; f < q; ++f)
            ((E[(n + l) * k + (f + u)] = h[n * q + f]),
              255 == this.palette[4 * h[n * q + f]] &&
                255 == this.palette[4 * h[n * q + f] + 2] &&
                0 == this.palette[4 * h[n * q + f] + 1] &&
                (E[(n + l) * k + (f + u)] = 0));
      else
        for (E = new Uint8Array(k * g * 4), n = 0; n < r; ++n)
          for (f = 0; f < q; ++f)
            ((E[4 * ((n + l) * k + (f + u)) + 0] =
              h[4 * ((r - n - 1) * q + f) + 3]),
              (E[4 * ((n + l) * k + (f + u)) + 1] =
                h[4 * ((r - n - 1) * q + f) + 2]),
              (E[4 * ((n + l) * k + (f + u)) + 2] =
                h[4 * ((r - n - 1) * q + f) + 1]),
              (E[4 * ((n + l) * k + (f + u)) + 3] =
                h[4 * ((r - n - 1) * q + f) + 0]));
      C[e] = {
        type: d.type,
        width: k,
        height: g,
        originalWidth: q,
        originalHeight: r,
        data: E,
      };
    }
    return {
      frames: C,
      palette: this.palette,
      rgba_index: this.rgba_index,
      old_rgba_index: this._indexed_count,
    };
  };
  return b;
});
