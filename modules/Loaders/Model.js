define("Loaders/Model", ["Utils/BinaryReader", "Utils/gl-matrix"], function (
  a,
  b,
) {
  function c(a) {
    a && this.load(a);
  }
  var d = b.vec3,
    e = b.mat3,
    l = b.mat4;
  c.SHADING = { NONE: 0, FLAT: 1, SMOOTH: 2 };
  c.Box = function () {
    this.max = d.fromValues(-Infinity, -Infinity, -Infinity);
    this.min = d.fromValues(Infinity, Infinity, Infinity);
    this.offset = d.create();
    this.range = d.create();
    this.center = d.create();
  };
  c.prototype.load = function (d) {
    var b, e, h, g, l;
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
    l = Array(h);
    for (b = 0; b < h; ++b)
      ((l[b] = new c.Node(this, d, 1 === h)),
        l[b].name === e && (this.main_node = l[b]));
    null === this.main_node && (this.main_node = l[0]);
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
    this.nodes = l;
    this.volumebox = e;
    this.calcBoundingBox();
  };
  c.prototype.createInstance = function (a, d, b) {
    var c = l.create();
    l.identity(c);
    l.translate(c, c, [a.position[0] + d, a.position[1], a.position[2] + b]);
    l.rotateZ(c, c, (a.rotation[2] / 180) * Math.PI);
    l.rotateX(c, c, (a.rotation[0] / 180) * Math.PI);
    l.rotateY(c, c, (a.rotation[1] / 180) * Math.PI);
    l.scale(c, c, a.scale);
    this.instances.push(c);
  };
  c.prototype.calcBoundingBox = function () {
    var a,
      d,
      b,
      c = this.box;
    a = l.create();
    var e = this.nodes,
      p = Math.min,
      k = Math.max;
    b = e.length;
    l.identity(a);
    this.main_node.calcBoundingBox(a);
    for (a = 0; 3 > a; ++a) {
      for (d = 0; d < b; ++d)
        ((c.max[a] = k(c.max[a], e[d].box.max[a])),
          (c.min[a] = p(c.min[a], e[d].box.min[a])));
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
      l,
      k,
      f = Array(b * c);
    for (k = e = 0; e < b; ++e)
      for (l = 0; l < c; ++l, k++) f[k] = a[e].compile(d[l]);
    return { meshes: f, textures: this.textures };
  };
  c.Node = function (a, d, b) {
    var e,
      h = a.version,
      p,
      k,
      f,
      m;
    this.main = a;
    this.is_only = b;
    this.name = d.readBinaryString(40);
    this.parentname = d.readBinaryString(40);
    b = d.readLong();
    p = Array(b);
    for (a = 0; a < b; ++a) p[a] = d.readLong();
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
    k = Array(b);
    for (a = 0; a < b; ++a)
      k[a] = [d.readFloat(), d.readFloat(), d.readFloat()];
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
      for (b = d.readLong(), m = Array(b), a = 0; a < b; ++a)
        m[a] = {
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
    this.matrix = l.create();
    this.textures = p;
    this.vertices = k;
    this.tvertices = f;
    this.faces = e;
    this.rotKeyframes = h;
    this.posKeyframes = m;
  };
  c.Node.prototype.calcBoundingBox = function (a) {
    var b,
      c,
      h = d.create(),
      g = this.box,
      p = this.main.nodes,
      k = l.create(),
      f = this.vertices,
      m = Math.max,
      q = Math.min,
      v,
      u;
    l.copy(this.matrix, a);
    l.translate(this.matrix, this.matrix, this.pos);
    this.rotKeyframes.length
      ? l.rotateQuat(this.matrix, this.matrix, this.rotKeyframes[0].q)
      : l.rotate(this.matrix, this.matrix, this.rotangle, this.rotaxis);
    l.scale(this.matrix, this.matrix, this.scale);
    l.copy(k, this.matrix);
    this.is_only || l.translate(k, k, this.offset);
    l.multiply(k, k, e.toMat4(this.mat3));
    a = 0;
    for (c = f.length; a < c; ++a)
      for (
        b = f[a][0],
          v = f[a][1],
          u = f[a][2],
          h[0] = k[0] * b + k[4] * v + k[8] * u + k[12],
          h[1] = k[1] * b + k[5] * v + k[9] * u + k[13],
          h[2] = k[2] * b + k[6] * v + k[10] * u + k[14],
          b = 0;
        3 > b;
        b++
      )
        ((g.min[b] = q(h[b], g.min[b])), (g.max[b] = m(h[b], g.max[b])));
    for (a = 0; 3 > a; a++)
      ((g.offset[a] = (g.max[a] + g.min[a]) / 2),
        (g.range[a] = (g.max[a] - g.min[a]) / 2),
        (g.center[a] = g.min[a] + g.range[a]));
    a = 0;
    for (c = p.length; a < c; ++a)
      p[a].parentname === this.name &&
        this.name !== this.parentname &&
        p[a].calcBoundingBox(this.matrix);
  };
  c.Node.prototype.compile = function (a) {
    var d,
      b = l.create(),
      h = l.create(),
      g = this.textures,
      p = this.faces,
      k = this.vertices,
      f = {},
      m = [],
      q = Array(32),
      v = Array(32),
      u,
      A,
      D,
      B;
    d = l.create();
    l.identity(d);
    l.translate(d, d, [
      -this.main.box.center[0],
      -this.main.box.max[1],
      -this.main.box.center[2],
    ]);
    l.multiply(d, d, this.matrix);
    this.is_only || l.translate(d, d, this.offset);
    l.multiply(d, d, e.toMat4(this.mat3));
    l.multiply(b, a, d);
    l.extractRotation(h, b);
    B = k.length;
    a = new Float32Array(3 * B);
    for (d = 0; d < B; ++d)
      ((u = k[d][0]),
        (A = k[d][1]),
        (D = k[d][2]),
        (a[3 * d + 0] = b[0] * u + b[4] * A + b[8] * D + b[12]),
        (a[3 * d + 1] = b[1] * u + b[5] * A + b[9] * D + b[13]),
        (a[3 * d + 2] = b[2] * u + b[6] * A + b[10] * D + b[14]));
    b = new Float32Array(3 * p.length);
    d = 0;
    for (B = g.length; d < B; ++d) m[g[d]] = 0;
    d = 0;
    for (B = p.length; d < B; ++d) m[g[p[d].texid]]++;
    d = 0;
    for (B = g.length; d < B; ++d) f[g[d]] = new Float32Array(27 * m[g[d]]);
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
          this.calcNormal_SMOOTH(b, v, q),
          this.generate_mesh_SMOOTH(a, q, f));
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
      l,
      k,
      f = d.create(),
      m = this.faces,
      q = this.vertices;
    h = e = 0;
    for (l = m.length; e < l; ++e, h += 3)
      ((k = m[e]),
        d.calcNormal(q[k.vertidx[0]], q[k.vertidx[1]], q[k.vertidx[2]], f),
        (a[h] = b[0] * f[0] + b[4] * f[1] + b[8] * f[2] + b[12]),
        (a[h + 1] = b[1] * f[0] + b[5] * f[1] + b[9] * f[2] + b[13]),
        (a[h + 2] = b[2] * f[0] + b[6] * f[1] + b[10] * f[2] + b[14]),
        (c[k.smoothGroup] = !0));
  };
  c.Node.prototype.calcNormal_SMOOTH = function (a, d, b) {
    var c,
      e,
      h,
      k,
      f,
      m,
      q,
      l,
      u = this.vertices.length,
      r = this.faces,
      D,
      B,
      H = r.length;
    for (e = 0; 32 > e; ++e)
      if (d[e])
        for (
          b[e] = new Float32Array(3 * u), B = b[e], k = f = 0;
          f < u;
          ++f, k += 3
        ) {
          for (h = c = l = q = m = 0; c < H; ++c, h += 3)
            ((D = r[c]),
              D.smoothGroup !== e ||
                (D.vertidx[0] !== f &&
                  D.vertidx[1] !== f &&
                  D.vertidx[2] !== f) ||
                ((m += a[h]), (q += a[h + 1]), (l += a[h + 2])));
          c = 1 / Math.sqrt(m * m + q * q + l * l);
          B[k] = m * c;
          B[k + 1] = q * c;
          B[k + 2] = l * c;
        }
  };
  c.Node.prototype.generate_mesh_FLAT = function (a, d, b) {
    var c,
      e,
      h,
      k,
      f,
      m,
      q,
      l,
      u = this.faces,
      r = this.textures,
      D = this.tvertices,
      B = this.main.alpha,
      H = [],
      t,
      z,
      G;
    k = 0;
    for (l = r.length; k < l; ++k) H[r[k]] = 0;
    m = k = 0;
    for (l = u.length; k < l; ++k, m += 3) {
      c = u[k];
      t = c.vertidx;
      z = c.tvertidx;
      q = r[c.texid];
      G = b[q];
      h = H[q];
      for (f = 0; 3 > f; f++, h += 9)
        ((c = 3 * t[f]),
          (e = 6 * z[f]),
          (G[h + 0] = a[c + 0]),
          (G[h + 1] = a[c + 1]),
          (G[h + 2] = a[c + 2]),
          (G[h + 3] = d[m + 0]),
          (G[h + 4] = d[m + 1]),
          (G[h + 5] = d[m + 2]),
          (G[h + 6] = D[e + 4]),
          (G[h + 7] = D[e + 5]),
          (G[h + 8] = B));
      H[q] = h;
    }
  };
  c.Node.prototype.generate_mesh_SMOOTH = function (a, d, b) {
    var c,
      e,
      h,
      k,
      f,
      m,
      q,
      l = this.faces,
      u = this.textures,
      r = this.tvertices,
      D = this.main.alpha,
      B = [],
      H,
      t,
      z,
      G;
    k = 0;
    for (q = u.length; k < q; ++k) B[u[k]] = 0;
    k = 0;
    for (q = l.length; k < q; ++k) {
      c = l[k];
      H = d[c.smoothGroup];
      t = c.vertidx;
      z = c.tvertidx;
      m = u[c.texid];
      G = b[m];
      h = B[m];
      for (f = 0; 3 > f; f++, h += 9)
        ((c = 3 * t[f]),
          (e = 6 * z[f]),
          (G[h + 0] = a[c + 0]),
          (G[h + 1] = a[c + 1]),
          (G[h + 2] = a[c + 2]),
          (G[h + 3] = H[c + 0]),
          (G[h + 4] = H[c + 1]),
          (G[h + 5] = H[c + 2]),
          (G[h + 6] = r[e + 4]),
          (G[h + 7] = r[e + 5]),
          (G[h + 8] = D));
      B[m] = h;
    }
  };
  return c;
});
