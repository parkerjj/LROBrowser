define("Utils/gl-matrix", ["Vendors/gl-matrix"], function (a) {
  a.vec3.calcNormal = function (a, c, d, e) {
    var b, h, t, r;
    b = d[0] - c[0];
    h = d[1] - c[1];
    t = d[2] - c[2];
    d = a[0] - c[0];
    r = a[1] - c[1];
    c = a[2] - c[2];
    a = h * c - t * r;
    t = t * d - b * c;
    b = b * r - h * d;
    h = 1 / Math.sqrt(a * a + t * t + b * b);
    e[0] = a * h;
    e[1] = t * h;
    e[2] = b * h;
    return e;
  };
  a.vec4.calcNormal = function (a, c, d, e, m) {
    var b, t, r, n, g, p, l, f, k;
    r = d[0] - c[0];
    n = d[1] - c[1];
    g = d[2] - c[2];
    p = a[0] - c[0];
    l = a[1] - c[1];
    f = a[2] - c[2];
    k = n * f - g * l;
    g = g * p - r * f;
    r = r * l - n * p;
    n = 1 / Math.sqrt(k * k + g * g + r * r);
    c = k * n;
    b = g * n;
    t = r * n;
    r = a[0] - e[0];
    n = a[1] - e[1];
    g = a[2] - e[2];
    p = d[0] - e[0];
    l = d[1] - e[1];
    f = d[2] - e[2];
    k = n * f - g * l;
    g = g * p - r * f;
    r = r * l - n * p;
    n = 1 / Math.sqrt(k * k + g * g + r * r);
    c += k * n;
    b += g * n;
    t += r * n;
    n = 1 / Math.sqrt(c * c + b * b + t * t);
    m[0] = c * n;
    m[1] = b * n;
    m[2] = t * n;
    return m;
  };
  a.mat4.translateZ = function (a, c, d) {
    var b, m, h, t, r, n, g, p, l, f, k;
    if (!d || a === d)
      return (
        (a[12] += a[8] * c),
        (a[13] += a[9] * c),
        (a[14] += a[10] * c),
        (a[15] += a[11] * c),
        a
      );
    b = a[0];
    m = a[1];
    h = a[2];
    t = a[3];
    r = a[4];
    n = a[5];
    g = a[6];
    p = a[7];
    l = a[8];
    f = a[9];
    k = a[10];
    a = a[11];
    d[0] = b;
    d[1] = m;
    d[2] = h;
    d[3] = t;
    d[4] = r;
    d[5] = n;
    d[6] = g;
    d[7] = p;
    d[8] = l;
    d[9] = f;
    d[10] = k;
    d[11] = a;
    d[12] += l * c;
    d[13] += f * c;
    d[14] += k * c;
    d[15] += a * c;
    return d;
  };
  a.mat4.rotateQuat = function (b, c, d) {
    var e, m, h;
    e = d[0];
    m = d[1];
    h = d[2];
    d = d[3];
    var t = Math.sqrt(e * e + m * m + h * h + d * d);
    e /= t;
    m /= t;
    h /= t;
    d /= t;
    return a.mat4.multiply(b, c, [
      1 - 2 * (m * m + h * h),
      2 * (e * m + h * d),
      2 * (e * h - m * d),
      0,
      2 * (e * m - h * d),
      1 - 2 * (e * e + h * h),
      2 * (h * m + e * d),
      0,
      2 * (e * h + m * d),
      2 * (m * h - e * d),
      1 - 2 * (e * e + m * m),
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
      m = 1 / a.vec3.length([c[8], c[9], c[10]]);
    b[0] = c[0] * d;
    b[1] = c[1] * d;
    b[2] = c[2] * d;
    b[4] = c[4] * e;
    b[5] = c[5] * e;
    b[6] = c[6] * e;
    b[8] = c[8] * m;
    b[9] = c[9] * m;
    b[10] = c[10] * m;
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
      m = b[2],
      h = b[4],
      t = b[5],
      r = b[6],
      n = b[8],
      g = b[9];
    b = b[10];
    var p = b * t - r * g,
      l = -b * h + r * n,
      f = g * h - t * n,
      k = d * p + e * l + m * f;
    if (!k) return null;
    k = 1 / k;
    c || (c = a.mat3.create());
    c[0] = p * k;
    c[1] = (-b * e + m * g) * k;
    c[2] = (r * e - m * t) * k;
    c[3] = l * k;
    c[4] = (b * d - m * n) * k;
    c[5] = (-r * d + m * h) * k;
    c[6] = f * k;
    c[7] = (-g * d + e * n) * k;
    c[8] = (t * d - e * h) * k;
    return c;
  };
  a.mat4.perspective = function (b, c, d, e, m) {
    b = d * Math.tan((b * Math.PI) / 360);
    c *= b;
    return a.mat4.frustum(m, -c, c, -b, b, d, e);
  };
  return a;
});
