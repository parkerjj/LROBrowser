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
      u,
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
        ((u = 4 * (d + (n - e - 1) * f)),
          10 == m[l]
            ? ((c.data[u + 0] = 25), (c.data[u + 1] = 25), (c.data[u + 2] = 25))
            : ((c.data[u + 0] = 153),
              (c.data[u + 1] = 153),
              (c.data[u + 2] = 153)),
          (c.data[u + 3] = 255),
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
      u = e.create(),
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
      e.sub(u, g, k);
      e.normalize(u, u);
      for (a = 0; a < f; ++a)
        if (
          ((k[0] += u[0]),
          (k[1] += u[1]),
          (k[2] += u[2]),
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
        u,
        t,
        m = Math.floor(l / 2);
      g = Math.floor(g);
      h = Math.floor(h);
      u = 0;
      switch (l) {
        case 1:
          t = a;
          break;
        case 5:
          t = b;
          break;
        case 7:
          t = c;
          break;
        case 13:
          t = k;
          break;
        default:
          t = new Float32Array(l * l * 30);
      }
      for (f = -m; f <= m; ++f)
        for (n = -m; n <= m; ++n, u += 30)
          ((p = 5 * (g + f + (h + n) * d.width)),
            (t[u + 0] = g + f + 0),
            (t[u + 1] = e[p + 0]),
            (t[u + 2] = h + n + 0),
            (t[u + 3] = (f + 0 + m) / l),
            (t[u + 4] = (n + 0 + m) / l),
            (t[u + 5] = g + f + 1),
            (t[u + 6] = e[p + 1]),
            (t[u + 7] = h + n + 0),
            (t[u + 8] = (f + 1 + m) / l),
            (t[u + 9] = (n + 0 + m) / l),
            (t[u + 10] = g + f + 1),
            (t[u + 11] = e[p + 3]),
            (t[u + 12] = h + n + 1),
            (t[u + 13] = (f + 1 + m) / l),
            (t[u + 14] = (n + 1 + m) / l),
            (t[u + 15] = g + f + 1),
            (t[u + 16] = e[p + 3]),
            (t[u + 17] = h + n + 1),
            (t[u + 18] = (f + 1 + m) / l),
            (t[u + 19] = (n + 1 + m) / l),
            (t[u + 20] = g + f + 0),
            (t[u + 21] = e[p + 2]),
            (t[u + 22] = h + n + 1),
            (t[u + 23] = (f + 0 + m) / l),
            (t[u + 24] = (n + 1 + m) / l),
            (t[u + 25] = g + f + 0),
            (t[u + 26] = e[p + 0]),
            (t[u + 27] = h + n + 0),
            (t[u + 28] = (f + 0 + m) / l),
            (t[u + 29] = (n + 0 + m) / l));
      return t;
    };
  })();
  return d;
});
