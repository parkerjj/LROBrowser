define("Utils/gl-matrix", ["Vendors/gl-matrix"], function (a) {
  a.vec3.calcNormal = function (a, c, d, e) {
    var b, h, r, t;
    b = d[0] - c[0];
    h = d[1] - c[1];
    r = d[2] - c[2];
    d = a[0] - c[0];
    t = a[1] - c[1];
    c = a[2] - c[2];
    a = h * c - r * t;
    r = r * d - b * c;
    b = b * t - h * d;
    h = 1 / Math.sqrt(a * a + r * r + b * b);
    e[0] = a * h;
    e[1] = r * h;
    e[2] = b * h;
    return e;
  };
  a.vec4.calcNormal = function (a, c, d, e, l) {
    var b, r, t, n, g, p, k, f, m;
    t = d[0] - c[0];
    n = d[1] - c[1];
    g = d[2] - c[2];
    p = a[0] - c[0];
    k = a[1] - c[1];
    f = a[2] - c[2];
    m = n * f - g * k;
    g = g * p - t * f;
    t = t * k - n * p;
    n = 1 / Math.sqrt(m * m + g * g + t * t);
    c = m * n;
    b = g * n;
    r = t * n;
    t = a[0] - e[0];
    n = a[1] - e[1];
    g = a[2] - e[2];
    p = d[0] - e[0];
    k = d[1] - e[1];
    f = d[2] - e[2];
    m = n * f - g * k;
    g = g * p - t * f;
    t = t * k - n * p;
    n = 1 / Math.sqrt(m * m + g * g + t * t);
    c += m * n;
    b += g * n;
    r += t * n;
    n = 1 / Math.sqrt(c * c + b * b + r * r);
    l[0] = c * n;
    l[1] = b * n;
    l[2] = r * n;
    return l;
  };
  a.mat4.translateZ = function (a, c, d) {
    var b, l, h, r, t, n, g, p, k, f, m;
    if (!d || a === d)
      return (
        (a[12] += a[8] * c),
        (a[13] += a[9] * c),
        (a[14] += a[10] * c),
        (a[15] += a[11] * c),
        a
      );
    b = a[0];
    l = a[1];
    h = a[2];
    r = a[3];
    t = a[4];
    n = a[5];
    g = a[6];
    p = a[7];
    k = a[8];
    f = a[9];
    m = a[10];
    a = a[11];
    d[0] = b;
    d[1] = l;
    d[2] = h;
    d[3] = r;
    d[4] = t;
    d[5] = n;
    d[6] = g;
    d[7] = p;
    d[8] = k;
    d[9] = f;
    d[10] = m;
    d[11] = a;
    d[12] += k * c;
    d[13] += f * c;
    d[14] += m * c;
    d[15] += a * c;
    return d;
  };
  a.mat4.rotateQuat = function (b, c, d) {
    var e, l, h;
    e = d[0];
    l = d[1];
    h = d[2];
    d = d[3];
    var r = Math.sqrt(e * e + l * l + h * h + d * d);
    e /= r;
    l /= r;
    h /= r;
    d /= r;
    return a.mat4.multiply(b, c, [
      1 - 2 * (l * l + h * h),
      2 * (e * l + h * d),
      2 * (e * h - l * d),
      0,
      2 * (e * l - h * d),
      1 - 2 * (e * e + h * h),
      2 * (h * l + e * d),
      0,
      2 * (e * h + l * d),
      2 * (l * h - e * d),
      1 - 2 * (e * e + l * l),
      0,
      0,
      0,
      0,
      1,
    ]);
  };
  a.mat4.extractRotation = function (b, c) {
    var d = 1 / a.vec3.length([c[0], c[1], c[2]]),
      e = 1 / a.vec3.length([c[4], c[5], c[6]]),
      l = 1 / a.vec3.length([c[8], c[9], c[10]]);
    b[0] = c[0] * d;
    b[1] = c[1] * d;
    b[2] = c[2] * d;
    b[4] = c[4] * e;
    b[5] = c[5] * e;
    b[6] = c[6] * e;
    b[8] = c[8] * l;
    b[9] = c[9] * l;
    b[10] = c[10] * l;
    return b;
  };
  a.mat3.toMat4 = function (b, c) {
    c || (c = a.mat4.create());
    c[15] = 1;
    c[14] = 0;
    c[13] = 0;
    c[12] = 0;
    c[11] = 0;
    c[10] = b[8];
    c[9] = b[7];
    c[8] = b[6];
    c[7] = 0;
    c[6] = b[5];
    c[5] = b[4];
    c[4] = b[3];
    c[3] = 0;
    c[2] = b[2];
    c[1] = b[1];
    c[0] = b[0];
    return c;
  };
  a.mat4.toInverseMat3 = function (b, c) {
    var d = b[0],
      e = b[1],
      l = b[2],
      h = b[4],
      r = b[5],
      t = b[6],
      n = b[8],
      g = b[9];
    b = b[10];
    var p = b * r - t * g,
      k = -b * h + t * n,
      f = g * h - r * n,
      m = d * p + e * k + l * f;
    if (!m) return null;
    m = 1 / m;
    c || (c = a.mat3.create());
    c[0] = p * m;
    c[1] = (-b * e + l * g) * m;
    c[2] = (t * e - l * r) * m;
    c[3] = k * m;
    c[4] = (b * d - l * n) * m;
    c[5] = (-t * d + l * h) * m;
    c[6] = f * m;
    c[7] = (-g * d + e * n) * m;
    c[8] = (r * d - e * h) * m;
    return c;
  };
  a.mat4.perspective = function (b, c, d, e, l) {
    b = d * Math.tan((b * Math.PI) / 360);
    c *= b;
    return a.mat4.frustum(l, -c, c, -b, b, d, e);
  };
  return a;
});
