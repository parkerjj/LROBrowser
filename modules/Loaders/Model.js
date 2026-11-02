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
      u = Math.min,
      l = Math.max;
    b = e.length;
    m.identity(a);
    this.main_node.calcBoundingBox(a);
    for (a = 0; 3 > a; ++a) {
      for (d = 0; d < b; ++d)
        ((c.max[a] = l(c.max[a], e[d].box.max[a])),
          (c.min[a] = u(c.min[a], e[d].box.min[a])));
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
      u,
      l,
      f,
      n;
    this.main = a;
    this.is_only = b;
    this.name = d.readBinaryString(40);
    this.parentname = d.readBinaryString(40);
    b = d.readLong();
    u = Array(b);
    for (a = 0; a < b; ++a) u[a] = d.readLong();
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
    this.textures = u;
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
      u = this.main.nodes,
      l = m.create(),
      f = this.vertices,
      n = Math.max,
      p = Math.min,
      v,
      t;
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
          t = f[a][2],
          h[0] = l[0] * b + l[4] * v + l[8] * t + l[12],
          h[1] = l[1] * b + l[5] * v + l[9] * t + l[13],
          h[2] = l[2] * b + l[6] * v + l[10] * t + l[14],
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
    for (c = u.length; a < c; ++a)
      u[a].parentname === this.name &&
        this.name !== this.parentname &&
        u[a].calcBoundingBox(this.matrix);
  };
  c.Node.prototype.compile = function (a) {
    var d,
      b = m.create(),
      h = m.create(),
      g = this.textures,
      u = this.faces,
      l = this.vertices,
      f = {},
      n = [],
      p = Array(32),
      v = Array(32),
      t,
      z,
      E,
      C;
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
    C = l.length;
    a = new Float32Array(3 * C);
    for (d = 0; d < C; ++d)
      ((t = l[d][0]),
        (z = l[d][1]),
        (E = l[d][2]),
        (a[3 * d + 0] = b[0] * t + b[4] * z + b[8] * E + b[12]),
        (a[3 * d + 1] = b[1] * t + b[5] * z + b[9] * E + b[13]),
        (a[3 * d + 2] = b[2] * t + b[6] * z + b[10] * E + b[14]));
    b = new Float32Array(3 * u.length);
    d = 0;
    for (C = g.length; d < C; ++d) n[g[d]] = 0;
    d = 0;
    for (C = u.length; d < C; ++d) n[g[u[d].texid]]++;
    d = 0;
    for (C = g.length; d < C; ++d) f[g[d]] = new Float32Array(27 * n[g[d]]);
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
      t = this.vertices.length,
      z = this.faces,
      q,
      C,
      r = z.length;
    for (e = 0; 32 > e; ++e)
      if (d[e])
        for (
          b[e] = new Float32Array(3 * t), C = b[e], l = f = 0;
          f < t;
          ++f, l += 3
        ) {
          for (h = c = m = p = n = 0; c < r; ++c, h += 3)
            ((q = z[c]),
              q.smoothGroup !== e ||
                (q.vertidx[0] !== f &&
                  q.vertidx[1] !== f &&
                  q.vertidx[2] !== f) ||
                ((n += a[h]), (p += a[h + 1]), (m += a[h + 2])));
          c = 1 / Math.sqrt(n * n + p * p + m * m);
          C[l] = n * c;
          C[l + 1] = p * c;
          C[l + 2] = m * c;
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
      t = this.faces,
      z = this.textures,
      q = this.tvertices,
      C = this.main.alpha,
      r = [],
      A,
      B,
      F;
    l = 0;
    for (m = z.length; l < m; ++l) r[z[l]] = 0;
    n = l = 0;
    for (m = t.length; l < m; ++l, n += 3) {
      c = t[l];
      A = c.vertidx;
      B = c.tvertidx;
      p = z[c.texid];
      F = b[p];
      h = r[p];
      for (f = 0; 3 > f; f++, h += 9)
        ((c = 3 * A[f]),
          (e = 6 * B[f]),
          (F[h + 0] = a[c + 0]),
          (F[h + 1] = a[c + 1]),
          (F[h + 2] = a[c + 2]),
          (F[h + 3] = d[n + 0]),
          (F[h + 4] = d[n + 1]),
          (F[h + 5] = d[n + 2]),
          (F[h + 6] = q[e + 4]),
          (F[h + 7] = q[e + 5]),
          (F[h + 8] = C));
      r[p] = h;
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
      t = this.textures,
      z = this.tvertices,
      q = this.main.alpha,
      C = [],
      r,
      A,
      B,
      F;
    l = 0;
    for (p = t.length; l < p; ++l) C[t[l]] = 0;
    l = 0;
    for (p = m.length; l < p; ++l) {
      c = m[l];
      r = d[c.smoothGroup];
      A = c.vertidx;
      B = c.tvertidx;
      n = t[c.texid];
      F = b[n];
      h = C[n];
      for (f = 0; 3 > f; f++, h += 9)
        ((c = 3 * A[f]),
          (e = 6 * B[f]),
          (F[h + 0] = a[c + 0]),
          (F[h + 1] = a[c + 1]),
          (F[h + 2] = a[c + 2]),
          (F[h + 3] = r[c + 0]),
          (F[h + 4] = r[c + 1]),
          (F[h + 5] = r[c + 2]),
          (F[h + 6] = z[e + 4]),
          (F[h + 7] = z[e + 5]),
          (F[h + 8] = q));
      C[n] = h;
    }
  };
  return c;
});
