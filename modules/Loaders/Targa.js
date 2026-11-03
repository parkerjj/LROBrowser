define("Loaders/Targa", [], function () {
  function a() {}
  function b(a, b, c, d, e, k, f, m, q, v) {
    var g, p, n;
    g = 0;
    for (n = e; n !== f; n += k)
      for (p = m; p !== v; p += q, g++)
        ((e = b[g]),
          (a[4 * (p + d * n) + 3] = 255),
          (a[4 * (p + d * n) + 2] = c[3 * e + 0]),
          (a[4 * (p + d * n) + 1] = c[3 * e + 1]),
          (a[4 * (p + d * n) + 0] = c[3 * e + 2]));
    return a;
  }
  function c(a, b, c, d, e, k, f, m, q, v) {
    var g, p;
    c = 0;
    for (p = e; p !== f; p += k)
      for (g = m; g !== v; g += q, c += 2)
        ((e = b[c + 0] | (b[c + 1] << 8)),
          (a[4 * (g + d * p) + 0] = (e & 31744) >> 7),
          (a[4 * (g + d * p) + 1] = (e & 992) >> 2),
          (a[4 * (g + d * p) + 2] = (e & 31) >> 3),
          (a[4 * (g + d * p) + 3] = e & 32768 ? 0 : 255));
    return a;
  }
  function d(a, b, c, d, e, k, f, m, q, v) {
    var g;
    c = 0;
    for (g = e; g !== f; g += k)
      for (e = m; e !== v; e += q, c += 3)
        ((a[4 * (e + d * g) + 3] = 255),
          (a[4 * (e + d * g) + 2] = b[c + 0]),
          (a[4 * (e + d * g) + 1] = b[c + 1]),
          (a[4 * (e + d * g) + 0] = b[c + 2]));
    return a;
  }
  function e(a, b, c, d, e, k, f, m, q, v) {
    var g;
    c = 0;
    for (g = e; g !== f; g += k)
      for (e = m; e !== v; e += q, c += 4)
        ((a[4 * (e + d * g) + 2] = b[c + 0]),
          (a[4 * (e + d * g) + 1] = b[c + 1]),
          (a[4 * (e + d * g) + 0] = b[c + 2]),
          (a[4 * (e + d * g) + 3] = b[c + 3]));
    return a;
  }
  function l(a, b, c, d, e, k, f, m, q, v) {
    var g, p;
    c = 0;
    for (p = e; p !== f; p += k)
      for (g = m; g !== v; g += q, c++)
        ((e = b[c]),
          (a[4 * (g + d * p) + 0] = e),
          (a[4 * (g + d * p) + 1] = e),
          (a[4 * (g + d * p) + 2] = e),
          (a[4 * (g + d * p) + 3] = 255));
    return a;
  }
  function h(a, b, c, d, e, k, f, m, q, v) {
    var g;
    c = 0;
    for (g = e; g !== f; g += k)
      for (e = m; e !== v; e += q, c += 2)
        ((a[4 * (e + d * g) + 0] = b[c + 0]),
          (a[4 * (e + d * g) + 1] = b[c + 0]),
          (a[4 * (e + d * g) + 2] = b[c + 0]),
          (a[4 * (e + d * g) + 3] = b[c + 1]));
    return a;
  }
  a.Type = {
    NO_DATA: 0,
    INDEXED: 1,
    RGB: 2,
    GREY: 3,
    RLE_INDEXED: 9,
    RLE_RGB: 10,
    RLE_GREY: 11,
  };
  a.Origin = {
    BOTTOM_LEFT: 0,
    BOTTOM_RIGHT: 1,
    TOP_LEFT: 2,
    TOP_RIGHT: 3,
    SHIFT: 4,
    MASK: 48,
  };
  a.prototype.open = function (a, b) {
    var c,
      d = this;
    c = new XMLHttpRequest();
    c.responseType = "arraybuffer";
    c.open("GET", a, !0);
    c.onload = function () {
      200 === this.status &&
        (d.load(new Uint8Array(c.response)), b && b.call(d));
    };
    c.send(null);
  };
  a.prototype.load = function (b) {
    var c = 0;
    if (18 > b.length)
      throw Error("Targa::load() - Not enough data to contain header");
    this.header = {
      idLength: b[c++],
      colorMapType: b[c++],
      imageType: b[c++],
      colorMapIndex: b[c++] | (b[c++] << 8),
      colorMapLength: b[c++] | (b[c++] << 8),
      colorMapDepth: b[c++],
      offsetX: b[c++] | (b[c++] << 8),
      offsetY: b[c++] | (b[c++] << 8),
      width: b[c++] | (b[c++] << 8),
      height: b[c++] | (b[c++] << 8),
      pixelDepth: b[c++],
      flags: b[c++],
    };
    this.header.hasEncoding =
      this.header.imageType === a.Type.RLE_INDEXED ||
      this.header.imageType === a.Type.RLE_RGB ||
      this.header.imageType === a.Type.RLE_GREY;
    this.header.hasColorMap =
      this.header.imageType === a.Type.RLE_INDEXED ||
      this.header.imageType === a.Type.INDEXED;
    this.header.isGreyColor =
      this.header.imageType === a.Type.RLE_GREY ||
      this.header.imageType === a.Type.GREY;
    var d = this.header;
    if (d.imageType === a.Type.NO_DATA)
      throw Error("Targa::checkHeader() - No data");
    if (d.hasColorMap) {
      if (
        256 < d.colorMapLength ||
        24 !== d.colorMapDepth ||
        1 !== d.colorMapType
      )
        throw Error("Targa::checkHeader() - Invalid colormap for indexed type");
    } else if (d.colorMapType)
      throw Error(
        "Targa::checkHeader() - Why does the image contain a palette ?",
      );
    if (0 >= d.width || 0 >= d.height)
      throw Error("Targa::checkHeader() - Invalid image size");
    if (
      8 !== d.pixelDepth &&
      16 !== d.pixelDepth &&
      24 !== d.pixelDepth &&
      32 !== d.pixelDepth
    )
      throw Error(
        'Targa::checkHeader() - Invalid pixel size "' + d.pixelDepth + '"',
      );
    c += this.header.idLength;
    if (c >= b.length) throw Error("Targa::load() - No data");
    this.header.hasColorMap &&
      ((d = this.header.colorMapLength * (this.header.colorMapDepth >> 3)),
      (this.palette = b.subarray(c, c + d)),
      (c += d));
    var d = this.header.pixelDepth >> 3,
      e = this.header.width * this.header.height,
      p = e * d;
    if (this.header.hasEncoding) {
      var k, f, m, q;
      q = new Uint8Array(p);
      m = new Uint8Array(d);
      for (e = 0; e < p;)
        if (((k = b[c++]), (f = (k & 127) + 1), k & 128)) {
          for (k = 0; k < d; ++k) m[k] = b[c++];
          for (k = 0; k < f; ++k) (q.set(m, e), (e += d));
        } else for (f *= d, k = 0; k < f; ++k) q[e++] = b[c++];
      this.imageData = q;
    } else
      this.imageData = b.subarray(c, c + (this.header.hasColorMap ? e : p));
  };
  a.prototype.getImageData = function (r) {
    var t = this.header.width,
      n = this.header.height,
      g = (this.header.flags & a.Origin.MASK) >> a.Origin.SHIFT,
      p,
      k,
      f,
      m,
      q;
    r ||
      (r = document
        ? document
            .createElement("canvas")
            .getContext("2d")
            .createImageData(t, n)
        : { width: t, height: n, data: new Uint8ClampedArray(t * n * 4) });
    g === a.Origin.TOP_LEFT || g === a.Origin.TOP_RIGHT
      ? ((f = 0), (m = 1))
      : ((f = n - 1), (n = m = -1));
    g === a.Origin.TOP_LEFT || g === a.Origin.BOTTOM_LEFT
      ? ((g = 0), (p = 1), (k = t))
      : ((g = t - 1), (k = p = -1));
    switch (this.header.pixelDepth) {
      case 8:
        q = this.header.isGreyColor ? l : b;
        break;
      case 16:
        q = this.header.isGreyColor ? h : c;
        break;
      case 24:
        q = d;
        break;
      case 32:
        q = e;
    }
    q(r.data, this.imageData, this.palette, t, f, m, n, g, p, k);
    return r;
  };
  a.prototype.getCanvas = function () {
    var a, b, c;
    a = document.createElement("canvas");
    b = a.getContext("2d");
    c = b.createImageData(this.header.width, this.header.height);
    a.width = this.header.width;
    a.height = this.header.height;
    b.putImageData(this.getImageData(c), 0, 0);
    return a;
  };
  a.prototype.getDataURL = function (a) {
    return this.getCanvas().toDataURL(a || "image/png");
  };
  return a;
});
