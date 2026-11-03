define("Renderer/Map/Altitude", [
  "Utils/gl-matrix",
  "Utils/PathFinding",
  "Controls/MouseEventHandler",
], function (a, b, c) {
  var d = {
      width: 0,
      height: 0,
      TYPE: { NONE: 1, WALKABLE: 2, WATER: 4, SNIPABLE: 8 },
      MAX_INTERSECT_COUNT: 150,
    },
    e = null,
    l = null;
  d.init = function (a) {
    var c = a.cells,
      h,
      n = c.length / 5,
      g = new Uint8Array(n);
    for (h = 0; h < n; ++h) g[h] = c[5 * h + 4];
    e = a.cells;
    l = g;
    d.width = a.width;
    d.height = a.height;
    b.setGat({ width: d.width, height: d.height, cells: g, types: d.TYPE });
  };
  d.getGat = function () {
    return { width: d.width, height: d.height, cells: l, types: d.TYPE };
  };
  d.getCell = (function () {
    var a = new Float32Array(5);
    return function (b, c) {
      b = 5 * (Math.floor(b) + Math.floor(c) * d.width);
      a[0] = e[b + 0];
      a[1] = e[b + 1];
      a[2] = e[b + 2];
      a[3] = e[b + 3];
      a[4] = e[b + 4];
      return a;
    };
  })();
  d.getCanvasFromFrame = function () {
    var a = document.createElement("canvas"),
      b = a.getContext("2d"),
      c,
      d,
      e,
      p,
      k,
      f,
      m;
    if (0 >= this.width || 0 >= this.height) return null;
    a.width = this.width;
    a.height = this.height;
    c = b.createImageData(this.width, this.height);
    f = this.width;
    m = this.height;
    for (k = e = 0; e < m; ++e)
      for (d = 0; d < f; ++d)
        ((p = 4 * (d + (m - e - 1) * f)),
          10 == l[k]
            ? ((c.data[p + 0] = 25), (c.data[p + 1] = 25), (c.data[p + 2] = 25))
            : ((c.data[p + 0] = 153),
              (c.data[p + 1] = 153),
              (c.data[p + 2] = 153)),
          (c.data[p + 3] = 255),
          k++);
    b.putImageData(c, 0, 0);
    return a;
  };
  d.getCellType = function (a, b) {
    return l[a + b * d.width];
  };
  d.setCellType = function (a, b, c) {
    l[a + b * d.width] = 0 == c ? 10 : c;
  };
  d.getCellHeight = function (a, b) {
    if (!e) return 0;
    var c, n;
    a += 0.5;
    b += 0.5;
    c = 5 * (Math.floor(a) + Math.floor(b) * d.width);
    a %= 1;
    n = e[c + 0] + (e[c + 1] - e[c + 0]) * a;
    return -(n + (b % 1) * (e[c + 2] + (e[c + 3] - e[c + 2]) * a - n));
  };
  d.intersect = (function () {
    var b = a.mat4,
      e = a.vec3,
      l = a.vec4,
      n = e.create(),
      g = l.create(),
      p = e.create(),
      k = b.create();
    return function (a, m, q) {
      var f = d.MAX_INTERSECT_COUNT;
      b.invert(k, a);
      n[0] = k[12];
      n[1] = k[13];
      n[2] = k[14];
      g[0] = (c.screen.x / c.screen.width) * 2 - 1;
      g[1] = 2 * -(c.screen.y / c.screen.height) + 1;
      g[2] = 1;
      g[3] = 1;
      b.multiply(k, m, a);
      b.invert(k, k);
      l.transformMat4(g, g, k);
      g[0] /= g[3];
      g[1] /= g[3];
      g[2] /= g[3];
      e.sub(p, g, n);
      e.normalize(p, p);
      for (a = 0; a < f; ++a)
        if (
          ((n[0] += p[0]),
          (n[1] += p[1]),
          (n[2] += p[2]),
          0.5 > Math.abs(d.getCellHeight(n[0], n[2]) + n[1]))
        )
          return ((q[0] = n[0]), (q[1] = n[2]), !0);
      return !1;
    };
  })();
  d.generatePlane = (function () {
    var a = new Float32Array(30),
      b = new Float32Array(750),
      c = new Float32Array(1470),
      n = new Float32Array(5070);
    return function (g, p, k) {
      if (!e) return null;
      var f,
        m,
        q,
        h,
        l,
        t = Math.floor(k / 2);
      g = Math.floor(g);
      p = Math.floor(p);
      h = 0;
      switch (k) {
        case 1:
          l = a;
          break;
        case 5:
          l = b;
          break;
        case 7:
          l = c;
          break;
        case 13:
          l = n;
          break;
        default:
          l = new Float32Array(k * k * 30);
      }
      for (f = -t; f <= t; ++f)
        for (m = -t; m <= t; ++m, h += 30)
          ((q = 5 * (g + f + (p + m) * d.width)),
            (l[h + 0] = g + f + 0),
            (l[h + 1] = e[q + 0]),
            (l[h + 2] = p + m + 0),
            (l[h + 3] = (f + 0 + t) / k),
            (l[h + 4] = (m + 0 + t) / k),
            (l[h + 5] = g + f + 1),
            (l[h + 6] = e[q + 1]),
            (l[h + 7] = p + m + 0),
            (l[h + 8] = (f + 1 + t) / k),
            (l[h + 9] = (m + 0 + t) / k),
            (l[h + 10] = g + f + 1),
            (l[h + 11] = e[q + 3]),
            (l[h + 12] = p + m + 1),
            (l[h + 13] = (f + 1 + t) / k),
            (l[h + 14] = (m + 1 + t) / k),
            (l[h + 15] = g + f + 1),
            (l[h + 16] = e[q + 3]),
            (l[h + 17] = p + m + 1),
            (l[h + 18] = (f + 1 + t) / k),
            (l[h + 19] = (m + 1 + t) / k),
            (l[h + 20] = g + f + 0),
            (l[h + 21] = e[q + 2]),
            (l[h + 22] = p + m + 1),
            (l[h + 23] = (f + 0 + t) / k),
            (l[h + 24] = (m + 1 + t) / k),
            (l[h + 25] = g + f + 0),
            (l[h + 26] = e[q + 0]),
            (l[h + 27] = p + m + 0),
            (l[h + 28] = (f + 0 + t) / k),
            (l[h + 29] = (m + 0 + t) / k));
      return l;
    };
  })();
  return d;
});
