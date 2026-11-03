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
      t = this.frames;
    for (e = 0; e < a; ++e)
      ((m = d.readUShort()),
        (h = d.readUShort()),
        (t[e] = {
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
      t,
      r,
      n,
      g,
      p,
      l,
      f = this.frames;
    for (e = 0; e < a; ++e) {
      m = d.readUShort();
      h = d.readUShort();
      t = m * h;
      t = new Uint8Array(t);
      r = 0;
      for (l = d.readUShort() + d.tell(); d.tell() < l;)
        if (((n = d.readUByte()), (t[r++] = n), !n))
          if ((g = d.readUByte())) for (p = 1; p < g; ++p) t[r++] = n;
          else t[r++] = g;
      f[e] = { type: b.TYPE_PAL, width: m, height: h, data: t };
    }
  };
  b.prototype.readRgbaImage = function () {
    var a = this.rgba_count,
      d = this.rgba_index,
      e = this.fp,
      m = this.frames,
      h,
      t,
      r;
    for (h = 0; h < a; ++h)
      ((t = e.readShort()),
        (r = e.readShort()),
        (m[h + d] = {
          type: b.TYPE_RGBA,
          width: t,
          height: r,
          data: new Uint8Array(e.buffer, e.tell(), t * r * 4),
        }),
        e.seek(t * r * 4, SEEK_CUR));
  };
  b.prototype.switchToRGBA = function () {
    var a = this.frames,
      d,
      e,
      m = this.indexed_count,
      h,
      t,
      r,
      n,
      g,
      p,
      l = this.palette,
      f,
      k;
    for (e = 0; e < m; ++e)
      if (((d = a[e]), d.type === b.TYPE_PAL)) {
        h = d.data;
        t = d.width;
        r = d.height;
        p = new Uint8Array(t * r * 4);
        for (g = 0; g < r; ++g)
          for (n = 0; n < t; ++n)
            ((f = 4 * h[n + g * t]),
              (k = 4 * (n + (r - g - 1) * t)),
              (p[k + 3] = l[f + 0]),
              (p[k + 2] = l[f + 1]),
              (p[k + 1] = l[f + 2]),
              (p[k + 0] = f ? 255 : 0));
        d.data = p;
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
      t,
      r,
      n,
      g,
      p;
    m = this.frames[a];
    if (0 >= m.width || 0 >= m.height) return null;
    d.width = m.width;
    d.height = m.height;
    g = m.width;
    p = m.height;
    a = c.createImageData(m.width, m.height);
    if (m.type === b.TYPE_RGBA)
      for (t = 0; t < p; ++t)
        for (h = 0; h < g; ++h)
          ((r = 4 * (h + t * g)),
            (n = 4 * (h + (p - t - 1) * g)),
            (a.data[n + 0] = m.data[r + 3]),
            (a.data[n + 1] = m.data[r + 2]),
            (a.data[n + 2] = m.data[r + 1]),
            (a.data[n + 3] = m.data[r + 0]));
    else {
      var l = this.palette;
      for (t = 0; t < p; ++t)
        for (h = 0; h < g; ++h)
          ((r = 4 * m.data[h + t * g]),
            (n = 4 * (h + t * g)),
            (a.data[n + 0] = l[r + 0]),
            (a.data[n + 1] = l[r + 1]),
            (a.data[n + 2] = l[r + 2]),
            (a.data[n + 3] = r ? 255 : 0));
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
      t,
      r,
      n,
      g,
      p,
      l,
      f,
      k,
      q = Math.pow,
      u = Math.ceil,
      v = Math.log,
      A = Math.floor,
      C,
      B = Array(m);
    for (e = 0; e < m; ++e) {
      d = a[e];
      h = d.data;
      t = d.width;
      r = d.height;
      n = q(2, u(v(t) / v(2)));
      g = q(2, u(v(r) / v(2)));
      p = A(0.5 * (n - t));
      l = A(0.5 * (g - r));
      if (d.type === b.TYPE_PAL)
        for (C = new Uint8Array(n * g), k = 0; k < r; ++k)
          for (f = 0; f < t; ++f)
            ((C[(k + l) * n + (f + p)] = h[k * t + f]),
              255 == this.palette[4 * h[k * t + f]] &&
                255 == this.palette[4 * h[k * t + f] + 2] &&
                0 == this.palette[4 * h[k * t + f] + 1] &&
                (C[(k + l) * n + (f + p)] = 0));
      else
        for (C = new Uint8Array(n * g * 4), k = 0; k < r; ++k)
          for (f = 0; f < t; ++f)
            ((C[4 * ((k + l) * n + (f + p)) + 0] =
              h[4 * ((r - k - 1) * t + f) + 3]),
              (C[4 * ((k + l) * n + (f + p)) + 1] =
                h[4 * ((r - k - 1) * t + f) + 2]),
              (C[4 * ((k + l) * n + (f + p)) + 2] =
                h[4 * ((r - k - 1) * t + f) + 1]),
              (C[4 * ((k + l) * n + (f + p)) + 3] =
                h[4 * ((r - k - 1) * t + f) + 0]));
      B[e] = {
        type: d.type,
        width: n,
        height: g,
        originalWidth: t,
        originalHeight: r,
        data: C,
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
