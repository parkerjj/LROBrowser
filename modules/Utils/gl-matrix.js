define("Utils/gl-matrix", ["Vendors/gl-matrix"], function (a) {
  a.vec3.calcNormal = function (a, c, d, e) {
    var b, h, q, r;
    b = d[0] - c[0];
    h = d[1] - c[1];
    q = d[2] - c[2];
    d = a[0] - c[0];
    r = a[1] - c[1];
    c = a[2] - c[2];
    a = h * c - q * r;
    q = q * d - b * c;
    b = b * r - h * d;
    h = 1 / Math.sqrt(a * a + q * q + b * b);
    e[0] = a * h;
    e[1] = q * h;
    e[2] = b * h;
    return e;
  };
  a.vec4.calcNormal = function (a, c, d, e, m) {
    var b, q, r, k, g, u, l, f, n;
    r = d[0] - c[0];
    k = d[1] - c[1];
    g = d[2] - c[2];
    u = a[0] - c[0];
    l = a[1] - c[1];
    f = a[2] - c[2];
    n = k * f - g * l;
    g = g * u - r * f;
    r = r * l - k * u;
    k = 1 / Math.sqrt(n * n + g * g + r * r);
    c = n * k;
    b = g * k;
    q = r * k;
    r = a[0] - e[0];
    k = a[1] - e[1];
    g = a[2] - e[2];
    u = d[0] - e[0];
    l = d[1] - e[1];
    f = d[2] - e[2];
    n = k * f - g * l;
    g = g * u - r * f;
    r = r * l - k * u;
    k = 1 / Math.sqrt(n * n + g * g + r * r);
    c += n * k;
    b += g * k;
    q += r * k;
    k = 1 / Math.sqrt(c * c + b * b + q * q);
    m[0] = c * k;
    m[1] = b * k;
    m[2] = q * k;
    return m;
  };
  a.mat4.translateZ = function (a, c, d) {
    var b, m, h, q, r, k, g, u, l, f, n;
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
    q = a[3];
    r = a[4];
    k = a[5];
    g = a[6];
    u = a[7];
    l = a[8];
    f = a[9];
    n = a[10];
    a = a[11];
    d[0] = b;
    d[1] = m;
    d[2] = h;
    d[3] = q;
    d[4] = r;
    d[5] = k;
    d[6] = g;
    d[7] = u;
    d[8] = l;
    d[9] = f;
    d[10] = n;
    d[11] = a;
    d[12] += l * c;
    d[13] += f * c;
    d[14] += n * c;
    d[15] += a * c;
    return d;
  };
  a.mat4.rotateQuat = function (b, c, d) {
    var e, m, h;
    e = d[0];
    m = d[1];
    h = d[2];
    d = d[3];
    var q = Math.sqrt(e * e + m * m + h * h + d * d);
    e /= q;
    m /= q;
    h /= q;
    d /= q;
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
      q = b[5],
      r = b[6],
      k = b[8],
      g = b[9];
    b = b[10];
    var u = b * q - r * g,
      l = -b * h + r * k,
      f = g * h - q * k,
      n = d * u + e * l + m * f;
    if (!n) return null;
    n = 1 / n;
    c || (c = a.mat3.create());
    c[0] = u * n;
    c[1] = (-b * e + m * g) * n;
    c[2] = (r * e - m * q) * n;
    c[3] = l * n;
    c[4] = (b * d - m * k) * n;
    c[5] = (-r * d + m * h) * n;
    c[6] = f * n;
    c[7] = (-g * d + e * k) * n;
    c[8] = (q * d - e * h) * n;
    return c;
  };
  a.mat4.perspective = function (b, c, d, e, m) {
    b = d * Math.tan((b * Math.PI) / 360);
    c *= b;
    return a.mat4.frustum(m, -c, c, -b, b, d, e);
  };
  return a;
});
