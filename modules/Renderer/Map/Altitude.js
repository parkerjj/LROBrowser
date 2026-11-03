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
      n = c.length / 5,
      g = new Uint8Array(n);
    for (h = 0; h < n; ++h) g[h] = c[5 * h + 4];
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
      p,
      l,
      f,
      k;
    if (0 >= this.width || 0 >= this.height) return null;
    a.width = this.width;
    a.height = this.height;
    c = b.createImageData(this.width, this.height);
    f = this.width;
    k = this.height;
    for (l = e = 0; e < k; ++e)
      for (d = 0; d < f; ++d)
        ((p = 4 * (d + (k - e - 1) * f)),
          10 == m[l]
            ? ((c.data[p + 0] = 25), (c.data[p + 1] = 25), (c.data[p + 2] = 25))
            : ((c.data[p + 0] = 153),
              (c.data[p + 1] = 153),
              (c.data[p + 2] = 153)),
          (c.data[p + 3] = 255),
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
    var c, h;
    a += 0.5;
    b += 0.5;
    c = 5 * (Math.floor(a) + Math.floor(b) * d.width);
    a %= 1;
    h = e[c + 0] + (e[c + 1] - e[c + 0]) * a;
    return -(h + (b % 1) * (e[c + 2] + (e[c + 3] - e[c + 2]) * a - h));
  };
  d.intersect = (function () {
    var b = a.mat4,
      e = a.vec3,
      m = a.vec4,
      n = e.create(),
      g = m.create(),
      p = e.create(),
      l = b.create();
    return function (a, k, q) {
      var f = d.MAX_INTERSECT_COUNT;
      b.invert(l, a);
      n[0] = l[12];
      n[1] = l[13];
      n[2] = l[14];
      g[0] = (c.screen.x / c.screen.width) * 2 - 1;
      g[1] = 2 * -(c.screen.y / c.screen.height) + 1;
      g[2] = 1;
      g[3] = 1;
      b.multiply(l, k, a);
      b.invert(l, l);
      m.transformMat4(g, g, l);
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
    return function (g, p, l) {
      if (!e) return null;
      var f,
        k,
        q,
        h,
        m,
        r = Math.floor(l / 2);
      g = Math.floor(g);
      p = Math.floor(p);
      h = 0;
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
          m = n;
          break;
        default:
          m = new Float32Array(l * l * 30);
      }
      for (f = -r; f <= r; ++f)
        for (k = -r; k <= r; ++k, h += 30)
          ((q = 5 * (g + f + (p + k) * d.width)),
            (m[h + 0] = g + f + 0),
            (m[h + 1] = e[q + 0]),
            (m[h + 2] = p + k + 0),
            (m[h + 3] = (f + 0 + r) / l),
            (m[h + 4] = (k + 0 + r) / l),
            (m[h + 5] = g + f + 1),
            (m[h + 6] = e[q + 1]),
            (m[h + 7] = p + k + 0),
            (m[h + 8] = (f + 1 + r) / l),
            (m[h + 9] = (k + 0 + r) / l),
            (m[h + 10] = g + f + 1),
            (m[h + 11] = e[q + 3]),
            (m[h + 12] = p + k + 1),
            (m[h + 13] = (f + 1 + r) / l),
            (m[h + 14] = (k + 1 + r) / l),
            (m[h + 15] = g + f + 1),
            (m[h + 16] = e[q + 3]),
            (m[h + 17] = p + k + 1),
            (m[h + 18] = (f + 1 + r) / l),
            (m[h + 19] = (k + 1 + r) / l),
            (m[h + 20] = g + f + 0),
            (m[h + 21] = e[q + 2]),
            (m[h + 22] = p + k + 1),
            (m[h + 23] = (f + 0 + r) / l),
            (m[h + 24] = (k + 1 + r) / l),
            (m[h + 25] = g + f + 0),
            (m[h + 26] = e[q + 0]),
            (m[h + 27] = p + k + 0),
            (m[h + 28] = (f + 0 + r) / l),
            (m[h + 29] = (k + 0 + r) / l));
      return m;
    };
  })();
  return d;
});
