define("Loaders/Targa", [], function () {
  function a() {}
  function b(a, b, c, d, e, l, f, n, p, v) {
    var g, k, t;
    g = 0;
    for (t = e; t !== f; t += l)
      for (k = n; k !== v; k += p, g++)
        ((e = b[g]),
          (a[4 * (k + d * t) + 3] = 255),
          (a[4 * (k + d * t) + 2] = c[3 * e + 0]),
          (a[4 * (k + d * t) + 1] = c[3 * e + 1]),
          (a[4 * (k + d * t) + 0] = c[3 * e + 2]));
    return a;
  }
  function c(a, b, c, d, e, l, f, n, p, v) {
    var g, k;
    c = 0;
    for (k = e; k !== f; k += l)
      for (g = n; g !== v; g += p, c += 2)
        ((e = b[c + 0] | (b[c + 1] << 8)),
          (a[4 * (g + d * k) + 0] = (e & 31744) >> 7),
          (a[4 * (g + d * k) + 1] = (e & 992) >> 2),
          (a[4 * (g + d * k) + 2] = (e & 31) >> 3),
          (a[4 * (g + d * k) + 3] = e & 32768 ? 0 : 255));
    return a;
  }
  function d(a, b, c, d, e, l, f, n, p, v) {
    var g;
    c = 0;
    for (g = e; g !== f; g += l)
      for (e = n; e !== v; e += p, c += 3)
        ((a[4 * (e + d * g) + 3] = 255),
          (a[4 * (e + d * g) + 2] = b[c + 0]),
          (a[4 * (e + d * g) + 1] = b[c + 1]),
          (a[4 * (e + d * g) + 0] = b[c + 2]));
    return a;
  }
  function e(a, b, c, d, e, l, f, n, p, v) {
    var g;
    c = 0;
    for (g = e; g !== f; g += l)
      for (e = n; e !== v; e += p, c += 4)
        ((a[4 * (e + d * g) + 2] = b[c + 0]),
          (a[4 * (e + d * g) + 1] = b[c + 1]),
          (a[4 * (e + d * g) + 0] = b[c + 2]),
          (a[4 * (e + d * g) + 3] = b[c + 3]));
    return a;
  }
  function m(a, b, c, d, e, l, f, n, p, v) {
    var g, k;
    c = 0;
    for (k = e; k !== f; k += l)
      for (g = n; g !== v; g += p, c++)
        ((e = b[c]),
          (a[4 * (g + d * k) + 0] = e),
          (a[4 * (g + d * k) + 1] = e),
          (a[4 * (g + d * k) + 2] = e),
          (a[4 * (g + d * k) + 3] = 255));
    return a;
  }
  function h(a, b, c, d, e, l, f, n, p, v) {
    var g;
    c = 0;
    for (g = e; g !== f; g += l)
      for (e = n; e !== v; e += p, c += 2)
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
      t = e * d;
    if (this.header.hasEncoding) {
      var l, f, n, p;
      p = new Uint8Array(t);
      n = new Uint8Array(d);
      for (e = 0; e < t;)
        if (((l = b[c++]), (f = (l & 127) + 1), l & 128)) {
          for (l = 0; l < d; ++l) n[l] = b[c++];
          for (l = 0; l < f; ++l) (p.set(n, e), (e += d));
        } else for (f *= d, l = 0; l < f; ++l) p[e++] = b[c++];
      this.imageData = p;
    } else
      this.imageData = b.subarray(c, c + (this.header.hasColorMap ? e : t));
  };
  a.prototype.getImageData = function (r) {
    var q = this.header.width,
      k = this.header.height,
      g = (this.header.flags & a.Origin.MASK) >> a.Origin.SHIFT,
      t,
      l,
      f,
      n,
      p;
    r ||
      (r = document
        ? document
            .createElement("canvas")
            .getContext("2d")
            .createImageData(q, k)
        : { width: q, height: k, data: new Uint8ClampedArray(q * k * 4) });
    g === a.Origin.TOP_LEFT || g === a.Origin.TOP_RIGHT
      ? ((f = 0), (n = 1))
      : ((f = k - 1), (k = n = -1));
    g === a.Origin.TOP_LEFT || g === a.Origin.BOTTOM_LEFT
      ? ((g = 0), (t = 1), (l = q))
      : ((g = q - 1), (l = t = -1));
    switch (this.header.pixelDepth) {
      case 8:
        p = this.header.isGreyColor ? m : b;
        break;
      case 16:
        p = this.header.isGreyColor ? h : c;
        break;
      case 24:
        p = d;
        break;
      case 32:
        p = e;
    }
    p(r.data, this.imageData, this.palette, q, f, n, k, g, t, l);
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
