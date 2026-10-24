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
    m = null;
  d.init = function (a) {
    var c = a.cells,
      h,
      k = c.length / 5,
      g = new Uint8Array(k);
    for (h = 0; h < k; ++h) g[h] = c[5 * h + 4];
    e = a.cells;
    m = g;
    d.width = a.width;
    d.height = a.height;
    b.setGat({ width: d.width, height: d.height, cells: g, types: d.TYPE });
  };
  d.getGat = function () {
    return { width: d.width, height: d.height, cells: m, types: d.TYPE };
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
      t,
      l,
      f,
      n;
    if (0 >= this.width || 0 >= this.height) return null;
    a.width = this.width;
    a.height = this.height;
    c = b.createImageData(this.width, this.height);
    f = this.width;
    n = this.height;
    for (l = e = 0; e < n; ++e)
      for (d = 0; d < f; ++d)
        ((t = 4 * (d + (n - e - 1) * f)),
          10 == m[l]
            ? ((c.data[t + 0] = 25), (c.data[t + 1] = 25), (c.data[t + 2] = 25))
            : ((c.data[t + 0] = 153),
              (c.data[t + 1] = 153),
              (c.data[t + 2] = 153)),
          (c.data[t + 3] = 255),
          l++);
    b.putImageData(c, 0, 0);
    return a;
  };
  d.getCellType = function (a, b) {
    return m[a + b * d.width];
  };
  d.setCellType = function (a, b, c) {
    m[a + b * d.width] = 0 == c ? 10 : c;
  };
  d.getCellHeight = function (a, b) {
    if (!e) return 0;
    var c, k;
    a += 0.5;
    b += 0.5;
    c = 5 * (Math.floor(a) + Math.floor(b) * d.width);
    a %= 1;
    k = e[c + 0] + (e[c + 1] - e[c + 0]) * a;
    return -(k + (b % 1) * (e[c + 2] + (e[c + 3] - e[c + 2]) * a - k));
  };
  d.intersect = (function () {
    var b = a.mat4,
      e = a.vec3,
      m = a.vec4,
      k = e.create(),
      g = m.create(),
      t = e.create(),
      l = b.create();
    return function (a, n, p) {
      var f = d.MAX_INTERSECT_COUNT;
      b.invert(l, a);
      k[0] = l[12];
      k[1] = l[13];
      k[2] = l[14];
      g[0] = (c.screen.x / c.screen.width) * 2 - 1;
      g[1] = 2 * -(c.screen.y / c.screen.height) + 1;
      g[2] = 1;
      g[3] = 1;
      b.multiply(l, n, a);
      b.invert(l, l);
      m.transformMat4(g, g, l);
      g[0] /= g[3];
      g[1] /= g[3];
      g[2] /= g[3];
      e.sub(t, g, k);
      e.normalize(t, t);
      for (a = 0; a < f; ++a)
        if (
          ((k[0] += t[0]),
          (k[1] += t[1]),
          (k[2] += t[2]),
          0.5 > Math.abs(d.getCellHeight(k[0], k[2]) + k[1]))
        )
          return ((p[0] = k[0]), (p[1] = k[2]), !0);
      return !1;
    };
  })();
  d.generatePlane = (function () {
    var a = new Float32Array(30),
      b = new Float32Array(750),
      c = new Float32Array(1470),
      k = new Float32Array(5070);
    return function (g, h, l) {
      if (!e) return null;
      var f,
        n,
        p,
        t,
        m,
        q = Math.floor(l / 2);
      g = Math.floor(g);
      h = Math.floor(h);
      t = 0;
      switch (l) {
        case 1:
          m = a;
          break;
        case 5:
          m = b;
          break;
        case 7:
          m = c;
          break;
        case 13:
          m = k;
          break;
        default:
          m = new Float32Array(l * l * 30);
      }
      for (f = -q; f <= q; ++f)
        for (n = -q; n <= q; ++n, t += 30)
          ((p = 5 * (g + f + (h + n) * d.width)),
            (m[t + 0] = g + f + 0),
            (m[t + 1] = e[p + 0]),
            (m[t + 2] = h + n + 0),
            (m[t + 3] = (f + 0 + q) / l),
            (m[t + 4] = (n + 0 + q) / l),
            (m[t + 5] = g + f + 1),
            (m[t + 6] = e[p + 1]),
            (m[t + 7] = h + n + 0),
            (m[t + 8] = (f + 1 + q) / l),
            (m[t + 9] = (n + 0 + q) / l),
            (m[t + 10] = g + f + 1),
            (m[t + 11] = e[p + 3]),
            (m[t + 12] = h + n + 1),
            (m[t + 13] = (f + 1 + q) / l),
            (m[t + 14] = (n + 1 + q) / l),
            (m[t + 15] = g + f + 1),
            (m[t + 16] = e[p + 3]),
            (m[t + 17] = h + n + 1),
            (m[t + 18] = (f + 1 + q) / l),
            (m[t + 19] = (n + 1 + q) / l),
            (m[t + 20] = g + f + 0),
            (m[t + 21] = e[p + 2]),
            (m[t + 22] = h + n + 1),
            (m[t + 23] = (f + 0 + q) / l),
            (m[t + 24] = (n + 1 + q) / l),
            (m[t + 25] = g + f + 0),
            (m[t + 26] = e[p + 0]),
            (m[t + 27] = h + n + 0),
            (m[t + 28] = (f + 0 + q) / l),
            (m[t + 29] = (n + 0 + q) / l));
      return m;
    };
  })();
  return d;
});
