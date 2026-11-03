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
      l,
      h,
      r = this.frames;
    for (e = 0; e < a; ++e)
      ((l = d.readUShort()),
        (h = d.readUShort()),
        (r[e] = {
          type: b.TYPE_PAL,
          width: l,
          height: h,
          data: new Uint8Array(d.buffer, d.tell(), l * h),
        }),
        d.seek(l * h, SEEK_CUR));
  };
  b.prototype.readIndexedImageRLE = function () {
    var a = this.indexed_count,
      d = this.fp,
      e,
      l,
      h,
      r,
      t,
      n,
      g,
      p,
      k,
      f = this.frames;
    for (e = 0; e < a; ++e) {
      l = d.readUShort();
      h = d.readUShort();
      r = l * h;
      r = new Uint8Array(r);
      t = 0;
      for (k = d.readUShort() + d.tell(); d.tell() < k;)
        if (((n = d.readUByte()), (r[t++] = n), !n))
          if ((g = d.readUByte())) for (p = 1; p < g; ++p) r[t++] = n;
          else r[t++] = g;
      f[e] = { type: b.TYPE_PAL, width: l, height: h, data: r };
    }
  };
  b.prototype.readRgbaImage = function () {
    var a = this.rgba_count,
      d = this.rgba_index,
      e = this.fp,
      l = this.frames,
      h,
      r,
      t;
    for (h = 0; h < a; ++h)
      ((r = e.readShort()),
        (t = e.readShort()),
        (l[h + d] = {
          type: b.TYPE_RGBA,
          width: r,
          height: t,
          data: new Uint8Array(e.buffer, e.tell(), r * t * 4),
        }),
        e.seek(r * t * 4, SEEK_CUR));
  };
  b.prototype.switchToRGBA = function () {
    var a = this.frames,
      d,
      e,
      l = this.indexed_count,
      h,
      r,
      t,
      n,
      g,
      p,
      k = this.palette,
      f,
      m;
    for (e = 0; e < l; ++e)
      if (((d = a[e]), d.type === b.TYPE_PAL)) {
        h = d.data;
        r = d.width;
        t = d.height;
        p = new Uint8Array(r * t * 4);
        for (g = 0; g < t; ++g)
          for (n = 0; n < r; ++n)
            ((f = 4 * h[n + g * r]),
              (m = 4 * (n + (t - g - 1) * r)),
              (p[m + 3] = k[f + 0]),
              (p[m + 2] = k[f + 1]),
              (p[m + 1] = k[f + 2]),
              (p[m + 0] = f ? 255 : 0));
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
      l,
      h,
      r,
      t,
      n,
      g,
      p;
    l = this.frames[a];
    if (0 >= l.width || 0 >= l.height) return null;
    d.width = l.width;
    d.height = l.height;
    g = l.width;
    p = l.height;
    a = c.createImageData(l.width, l.height);
    if (l.type === b.TYPE_RGBA)
      for (r = 0; r < p; ++r)
        for (h = 0; h < g; ++h)
          ((t = 4 * (h + r * g)),
            (n = 4 * (h + (p - r - 1) * g)),
            (a.data[n + 0] = l.data[t + 3]),
            (a.data[n + 1] = l.data[t + 2]),
            (a.data[n + 2] = l.data[t + 1]),
            (a.data[n + 3] = l.data[t + 0]));
    else {
      var k = this.palette;
      for (r = 0; r < p; ++r)
        for (h = 0; h < g; ++h)
          ((t = 4 * l.data[h + r * g]),
            (n = 4 * (h + r * g)),
            (a.data[n + 0] = k[t + 0]),
            (a.data[n + 1] = k[t + 1]),
            (a.data[n + 2] = k[t + 2]),
            (a.data[n + 3] = t ? 255 : 0));
    }
    c.putImageData(a, 0, 0);
    return d;
  };
  b.prototype.compile = function () {
    var a = this.frames,
      d,
      e,
      l = a.length,
      h,
      r,
      t,
      n,
      g,
      p,
      k,
      f,
      m,
      q = Math.pow,
      v = Math.ceil,
      u = Math.log,
      A = Math.floor,
      D,
      B = Array(l);
    for (e = 0; e < l; ++e) {
      d = a[e];
      h = d.data;
      r = d.width;
      t = d.height;
      n = q(2, v(u(r) / u(2)));
      g = q(2, v(u(t) / u(2)));
      p = A(0.5 * (n - r));
      k = A(0.5 * (g - t));
      if (d.type === b.TYPE_PAL)
        for (D = new Uint8Array(n * g), m = 0; m < t; ++m)
          for (f = 0; f < r; ++f)
            ((D[(m + k) * n + (f + p)] = h[m * r + f]),
              255 == this.palette[4 * h[m * r + f]] &&
                255 == this.palette[4 * h[m * r + f] + 2] &&
                0 == this.palette[4 * h[m * r + f] + 1] &&
                (D[(m + k) * n + (f + p)] = 0));
      else
        for (D = new Uint8Array(n * g * 4), m = 0; m < t; ++m)
          for (f = 0; f < r; ++f)
            ((D[4 * ((m + k) * n + (f + p)) + 0] =
              h[4 * ((t - m - 1) * r + f) + 3]),
              (D[4 * ((m + k) * n + (f + p)) + 1] =
                h[4 * ((t - m - 1) * r + f) + 2]),
              (D[4 * ((m + k) * n + (f + p)) + 2] =
                h[4 * ((t - m - 1) * r + f) + 1]),
              (D[4 * ((m + k) * n + (f + p)) + 3] =
                h[4 * ((t - m - 1) * r + f) + 0]));
      B[e] = {
        type: d.type,
        width: n,
        height: g,
        originalWidth: r,
        originalHeight: t,
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
