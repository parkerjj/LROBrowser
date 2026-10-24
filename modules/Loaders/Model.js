define("Loaders/Model", ["Utils/BinaryReader", "Utils/gl-matrix"], function (
  a,
  b,
) {
  function c(a) {
    a && this.load(a);
  }
  var d = b.vec3,
    e = b.mat3,
    m = b.mat4;
  c.SHADING = { NONE: 0, FLAT: 1, SMOOTH: 2 };
  c.Box = function () {
    this.max = d.fromValues(-Infinity, -Infinity, -Infinity);
    this.min = d.fromValues(Infinity, Infinity, Infinity);
    this.offset = d.create();
    this.range = d.create();
    this.center = d.create();
  };
  c.prototype.load = function (d) {
    var b, e, h, g, m;
    d = new a(d);
    b = d.readBinaryString(4);
    if ("GRSM" !== b)
      throw Error('RSM::load() - Incorrect header "' + b + '", must be "GRSM"');
    this.version = d.readByte() + d.readByte() / 10;
    this.animLen = d.readLong();
    this.shadeType = d.readLong();
    this.main_node = null;
    this.alpha = 1.4 <= this.version ? d.readUByte() / 255 : 1;
    d.seek(16, SEEK_CUR);
    h = d.readLong();
    g = Array(h);
    for (b = 0; b < h; ++b) g[b] = d.readBinaryString(40);
    e = d.readBinaryString(40);
    h = d.readLong();
    m = Array(h);
    for (b = 0; b < h; ++b)
      ((m[b] = new c.Node(this, d, 1 === h)),
        m[b].name === e && (this.main_node = m[b]));
    null === this.main_node && (this.main_node = m[0]);
    if (1.5 > this.version) {
      h = d.readLong();
      e = Array(h);
      for (b = 0; b < h; ++b)
        e[b] = {
          frame: d.readLong(),
          px: d.readFloat(),
          py: d.readFloat(),
          pz: d.readFloat(),
        };
      this.posKeyframes = e;
    } else this.posKeyframes = [];
    h = d.readLong();
    e = Array(h);
    for (b = 0; b < h; ++b)
      e[b] = {
        size: [d.readFloat(), d.readFloat(), d.readFloat()],
        pos: [d.readFloat(), d.readFloat(), d.readFloat()],
        rot: [d.readFloat(), d.readFloat(), d.readFloat()],
        flag: 1.3 <= this.version ? d.readLong() : 0,
      };
    this.instances = [];
    this.box = new c.Box();
    this.textures = g;
    this.nodes = m;
    this.volumebox = e;
    this.calcBoundingBox();
  };
  c.prototype.createInstance = function (a, d, b) {
    var c = m.create();
    m.identity(c);
    m.translate(c, c, [a.position[0] + d, a.position[1], a.position[2] + b]);
    m.rotateZ(c, c, (a.rotation[2] / 180) * Math.PI);
    m.rotateX(c, c, (a.rotation[0] / 180) * Math.PI);
    m.rotateY(c, c, (a.rotation[1] / 180) * Math.PI);
    m.scale(c, c, a.scale);
    this.instances.push(c);
  };
  c.prototype.calcBoundingBox = function () {
    var a,
      d,
      b,
      c = this.box;
    a = m.create();
    var e = this.nodes,
      t = Math.min,
      l = Math.max;
    b = e.length;
    m.identity(a);
    this.main_node.calcBoundingBox(a);
    for (a = 0; 3 > a; ++a) {
      for (d = 0; d < b; ++d)
        ((c.max[a] = l(c.max[a], e[d].box.max[a])),
          (c.min[a] = t(c.min[a], e[d].box.min[a])));
      c.offset[a] = (c.max[a] + c.min[a]) / 2;
      c.range[a] = (c.max[a] - c.min[a]) / 2;
      c.center[a] = c.min[a] + c.range[a];
    }
  };
  c.prototype.compile = function () {
    var a = this.nodes,
      d = this.instances,
      b = a.length,
      c = d.length,
      e,
      m,
      l,
      f = Array(b * c);
    for (l = e = 0; e < b; ++e)
      for (m = 0; m < c; ++m, l++) f[l] = a[e].compile(d[m]);
    return { meshes: f, textures: this.textures };
  };
  c.Node = function (a, d, b) {
    var e,
      h = a.version,
      t,
      l,
      f,
      n;
    this.main = a;
    this.is_only = b;
    this.name = d.readBinaryString(40);
    this.parentname = d.readBinaryString(40);
    b = d.readLong();
    t = Array(b);
    for (a = 0; a < b; ++a) t[a] = d.readLong();
    this.mat3 = [
      d.readFloat(),
      d.readFloat(),
      d.readFloat(),
      d.readFloat(),
      d.readFloat(),
      d.readFloat(),
      d.readFloat(),
      d.readFloat(),
      d.readFloat(),
    ];
    this.offset = [d.readFloat(), d.readFloat(), d.readFloat()];
    this.pos = [d.readFloat(), d.readFloat(), d.readFloat()];
    this.rotangle = d.readFloat();
    this.rotaxis = [d.readFloat(), d.readFloat(), d.readFloat()];
    this.scale = [d.readFloat(), d.readFloat(), d.readFloat()];
    b = d.readLong();
    l = Array(b);
    for (a = 0; a < b; ++a)
      l[a] = [d.readFloat(), d.readFloat(), d.readFloat()];
    b = d.readLong();
    f = new Float32Array(6 * b);
    for (e = a = 0; a < b; ++a, e += 6)
      (1.2 <= h &&
        ((f[e + 0] = d.readUByte() / 255),
        (f[e + 1] = d.readUByte() / 255),
        (f[e + 2] = d.readUByte() / 255),
        (f[e + 3] = d.readUByte() / 255)),
        (f[e + 4] = 0.98 * d.readFloat() + 0.01),
        (f[e + 5] = 0.98 * d.readFloat() + 0.01));
    b = d.readLong();
    e = Array(b);
    for (a = 0; a < b; ++a)
      e[a] = {
        vertidx: [d.readUShort(), d.readUShort(), d.readUShort()],
        tvertidx: [d.readUShort(), d.readUShort(), d.readUShort()],
        texid: d.readUShort(),
        padding: d.readUShort(),
        twoSide: d.readLong(),
        smoothGroup: 1.2 <= h ? d.readLong() : 0,
      };
    if (1.5 <= h)
      for (b = d.readLong(), n = Array(b), a = 0; a < b; ++a)
        n[a] = {
          frame: d.readLong(),
          px: d.readFloat(),
          py: d.readFloat(),
          pz: d.readFloat(),
        };
    b = d.readLong();
    h = Array(b);
    for (a = 0; a < b; ++a)
      h[a] = {
        frame: d.readLong(),
        q: [d.readFloat(), d.readFloat(), d.readFloat(), d.readFloat()],
      };
    this.box = new c.Box();
    this.matrix = m.create();
    this.textures = t;
    this.vertices = l;
    this.tvertices = f;
    this.faces = e;
    this.rotKeyframes = h;
    this.posKeyframes = n;
  };
  c.Node.prototype.calcBoundingBox = function (a) {
    var b,
      c,
      h = d.create(),
      g = this.box,
      t = this.main.nodes,
      l = m.create(),
      f = this.vertices,
      n = Math.max,
      p = Math.min,
      v,
      u;
    m.copy(this.matrix, a);
    m.translate(this.matrix, this.matrix, this.pos);
    this.rotKeyframes.length
      ? m.rotateQuat(this.matrix, this.matrix, this.rotKeyframes[0].q)
      : m.rotate(this.matrix, this.matrix, this.rotangle, this.rotaxis);
    m.scale(this.matrix, this.matrix, this.scale);
    m.copy(l, this.matrix);
    this.is_only || m.translate(l, l, this.offset);
    m.multiply(l, l, e.toMat4(this.mat3));
    a = 0;
    for (c = f.length; a < c; ++a)
      for (
        b = f[a][0],
          v = f[a][1],
          u = f[a][2],
          h[0] = l[0] * b + l[4] * v + l[8] * u + l[12],
          h[1] = l[1] * b + l[5] * v + l[9] * u + l[13],
          h[2] = l[2] * b + l[6] * v + l[10] * u + l[14],
          b = 0;
        3 > b;
        b++
      )
        ((g.min[b] = p(h[b], g.min[b])), (g.max[b] = n(h[b], g.max[b])));
    for (a = 0; 3 > a; a++)
      ((g.offset[a] = (g.max[a] + g.min[a]) / 2),
        (g.range[a] = (g.max[a] - g.min[a]) / 2),
        (g.center[a] = g.min[a] + g.range[a]));
    a = 0;
    for (c = t.length; a < c; ++a)
      t[a].parentname === this.name &&
        this.name !== this.parentname &&
        t[a].calcBoundingBox(this.matrix);
  };
  c.Node.prototype.compile = function (a) {
    var d,
      b = m.create(),
      h = m.create(),
      g = this.textures,
      t = this.faces,
      l = this.vertices,
      f = {},
      n = [],
      p = Array(32),
      v = Array(32),
      u,
      A,
      D,
      B;
    d = m.create();
    m.identity(d);
    m.translate(d, d, [
      -this.main.box.center[0],
      -this.main.box.max[1],
      -this.main.box.center[2],
    ]);
    m.multiply(d, d, this.matrix);
    this.is_only || m.translate(d, d, this.offset);
    m.multiply(d, d, e.toMat4(this.mat3));
    m.multiply(b, a, d);
    m.extractRotation(h, b);
    B = l.length;
    a = new Float32Array(3 * B);
    for (d = 0; d < B; ++d)
      ((u = l[d][0]),
        (A = l[d][1]),
        (D = l[d][2]),
        (a[3 * d + 0] = b[0] * u + b[4] * A + b[8] * D + b[12]),
        (a[3 * d + 1] = b[1] * u + b[5] * A + b[9] * D + b[13]),
        (a[3 * d + 2] = b[2] * u + b[6] * A + b[10] * D + b[14]));
    b = new Float32Array(3 * t.length);
    d = 0;
    for (B = g.length; d < B; ++d) n[g[d]] = 0;
    d = 0;
    for (B = t.length; d < B; ++d) n[g[t[d].texid]]++;
    d = 0;
    for (B = g.length; d < B; ++d) f[g[d]] = new Float32Array(27 * n[g[d]]);
    switch (this.main.shadeType) {
      default:
      case c.SHADING.NONE:
        this.calcNormal_NONE(b);
        this.generate_mesh_FLAT(a, b, f);
        break;
      case c.SHADING.FLAT:
        this.calcNormal_FLAT(b, h, v);
        this.generate_mesh_FLAT(a, b, f);
        break;
      case c.SHADING.SMOOTH:
        (this.calcNormal_FLAT(b, h, v),
          this.calcNormal_SMOOTH(b, v, p),
          this.generate_mesh_SMOOTH(a, p, f));
    }
    return f;
  };
  c.Node.prototype.calcNormal_NONE = function (a) {
    var d, b;
    d = 1;
    for (b = a.length; d < b; d += 3) a[d] = -1;
  };
  c.Node.prototype.calcNormal_FLAT = function (a, b, c) {
    var e,
      h,
      m,
      l,
      f = d.create(),
      n = this.faces,
      p = this.vertices;
    h = e = 0;
    for (m = n.length; e < m; ++e, h += 3)
      ((l = n[e]),
        d.calcNormal(p[l.vertidx[0]], p[l.vertidx[1]], p[l.vertidx[2]], f),
        (a[h] = b[0] * f[0] + b[4] * f[1] + b[8] * f[2] + b[12]),
        (a[h + 1] = b[1] * f[0] + b[5] * f[1] + b[9] * f[2] + b[13]),
        (a[h + 2] = b[2] * f[0] + b[6] * f[1] + b[10] * f[2] + b[14]),
        (c[l.smoothGroup] = !0));
  };
  c.Node.prototype.calcNormal_SMOOTH = function (a, d, b) {
    var c,
      e,
      h,
      l,
      f,
      n,
      p,
      m,
      u = this.vertices.length,
      r = this.faces,
      D,
      B,
      q = r.length;
    for (e = 0; 32 > e; ++e)
      if (d[e])
        for (
          b[e] = new Float32Array(3 * u), B = b[e], l = f = 0;
          f < u;
          ++f, l += 3
        ) {
          for (h = c = m = p = n = 0; c < q; ++c, h += 3)
            ((D = r[c]),
              D.smoothGroup !== e ||
                (D.vertidx[0] !== f &&
                  D.vertidx[1] !== f &&
                  D.vertidx[2] !== f) ||
                ((n += a[h]), (p += a[h + 1]), (m += a[h + 2])));
          c = 1 / Math.sqrt(n * n + p * p + m * m);
          B[l] = n * c;
          B[l + 1] = p * c;
          B[l + 2] = m * c;
        }
  };
  c.Node.prototype.generate_mesh_FLAT = function (a, d, b) {
    var c,
      e,
      h,
      l,
      f,
      n,
      p,
      m,
      u = this.faces,
      r = this.textures,
      D = this.tvertices,
      B = this.main.alpha,
      q = [],
      C,
      y,
      z;
    l = 0;
    for (m = r.length; l < m; ++l) q[r[l]] = 0;
    n = l = 0;
    for (m = u.length; l < m; ++l, n += 3) {
      c = u[l];
      C = c.vertidx;
      y = c.tvertidx;
      p = r[c.texid];
      z = b[p];
      h = q[p];
      for (f = 0; 3 > f; f++, h += 9)
        ((c = 3 * C[f]),
          (e = 6 * y[f]),
          (z[h + 0] = a[c + 0]),
          (z[h + 1] = a[c + 1]),
          (z[h + 2] = a[c + 2]),
          (z[h + 3] = d[n + 0]),
          (z[h + 4] = d[n + 1]),
          (z[h + 5] = d[n + 2]),
          (z[h + 6] = D[e + 4]),
          (z[h + 7] = D[e + 5]),
          (z[h + 8] = B));
      q[p] = h;
    }
  };
  c.Node.prototype.generate_mesh_SMOOTH = function (a, d, b) {
    var c,
      e,
      h,
      l,
      f,
      n,
      p,
      m = this.faces,
      u = this.textures,
      r = this.tvertices,
      D = this.main.alpha,
      B = [],
      q,
      C,
      y,
      z;
    l = 0;
    for (p = u.length; l < p; ++l) B[u[l]] = 0;
    l = 0;
    for (p = m.length; l < p; ++l) {
      c = m[l];
      q = d[c.smoothGroup];
      C = c.vertidx;
      y = c.tvertidx;
      n = u[c.texid];
      z = b[n];
      h = B[n];
      for (f = 0; 3 > f; f++, h += 9)
        ((c = 3 * C[f]),
          (e = 6 * y[f]),
          (z[h + 0] = a[c + 0]),
          (z[h + 1] = a[c + 1]),
          (z[h + 2] = a[c + 2]),
          (z[h + 3] = q[c + 0]),
          (z[h + 4] = q[c + 1]),
          (z[h + 5] = q[c + 2]),
          (z[h + 6] = r[e + 4]),
          (z[h + 7] = r[e + 5]),
          (z[h + 8] = D));
      B[n] = h;
    }
  };
  return c;
});
