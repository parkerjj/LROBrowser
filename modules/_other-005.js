(function (a) {
  var b;
  "undefined" === typeof exports
    ? "function" == typeof define && "object" == typeof define.amd && define.amd
      ? ((b = {}),
        define("Vendors/gl-matrix", [], function () {
          return b;
        }))
      : (b = "undefined" !== typeof window ? window : a)
    : (b = exports);
  (function (a) {
    if (!b) var b = 1e-6;
    if (!c) var c = "undefined" !== typeof Float32Array ? Float32Array : Array;
    if (!m) var m = Math.random;
    var h = {
      setMatrixArrayType: function (a) {
        c = a;
      },
    };
    "undefined" !== typeof a && (a.glMatrix = h);
    var r = {
      create: function () {
        var a = new c(2);
        a[0] = 0;
        a[1] = 0;
        return a;
      },
      clone: function (a) {
        var b = new c(2);
        b[0] = a[0];
        b[1] = a[1];
        return b;
      },
      fromValues: function (a, b) {
        var d = new c(2);
        d[0] = a;
        d[1] = b;
        return d;
      },
      copy: function (a, b) {
        a[0] = b[0];
        a[1] = b[1];
        return a;
      },
      set: function (a, b, c) {
        a[0] = b;
        a[1] = c;
        return a;
      },
      add: function (a, b, c) {
        a[0] = b[0] + c[0];
        a[1] = b[1] + c[1];
        return a;
      },
      subtract: function (a, b, c) {
        a[0] = b[0] - c[0];
        a[1] = b[1] - c[1];
        return a;
      },
    };
    r.sub = r.subtract;
    r.multiply = function (a, b, c) {
      a[0] = b[0] * c[0];
      a[1] = b[1] * c[1];
      return a;
    };
    r.mul = r.multiply;
    r.divide = function (a, b, c) {
      a[0] = b[0] / c[0];
      a[1] = b[1] / c[1];
      return a;
    };
    r.div = r.divide;
    r.min = function (a, b, c) {
      a[0] = Math.min(b[0], c[0]);
      a[1] = Math.min(b[1], c[1]);
      return a;
    };
    r.max = function (a, b, c) {
      a[0] = Math.max(b[0], c[0]);
      a[1] = Math.max(b[1], c[1]);
      return a;
    };
    r.scale = function (a, b, c) {
      a[0] = b[0] * c;
      a[1] = b[1] * c;
      return a;
    };
    r.scaleAndAdd = function (a, b, c, d) {
      a[0] = b[0] + c[0] * d;
      a[1] = b[1] + c[1] * d;
      return a;
    };
    r.distance = function (a, b) {
      var c = b[0] - a[0];
      a = b[1] - a[1];
      return Math.sqrt(c * c + a * a);
    };
    r.dist = r.distance;
    r.squaredDistance = function (a, b) {
      var c = b[0] - a[0];
      a = b[1] - a[1];
      return c * c + a * a;
    };
    r.sqrDist = r.squaredDistance;
    r.length = function (a) {
      var b = a[0];
      a = a[1];
      return Math.sqrt(b * b + a * a);
    };
    r.len = r.length;
    r.squaredLength = function (a) {
      var b = a[0];
      a = a[1];
      return b * b + a * a;
    };
    r.sqrLen = r.squaredLength;
    r.negate = function (a, b) {
      a[0] = -b[0];
      a[1] = -b[1];
      return a;
    };
    r.normalize = function (a, b) {
      var c = b[0],
        d = b[1],
        c = c * c + d * d;
      0 < c && ((c = 1 / Math.sqrt(c)), (a[0] = b[0] * c), (a[1] = b[1] * c));
      return a;
    };
    r.dot = function (a, b) {
      return a[0] * b[0] + a[1] * b[1];
    };
    r.cross = function (a, b, c) {
      b = b[0] * c[1] - b[1] * c[0];
      a[0] = a[1] = 0;
      a[2] = b;
      return a;
    };
    r.lerp = function (a, b, c, d) {
      var f = b[0];
      b = b[1];
      a[0] = f + d * (c[0] - f);
      a[1] = b + d * (c[1] - b);
      return a;
    };
    r.random = function (a, b) {
      b = b || 1;
      var c = 2 * m() * Math.PI;
      a[0] = Math.cos(c) * b;
      a[1] = Math.sin(c) * b;
      return a;
    };
    r.transformMat2 = function (a, b, c) {
      var d = b[0];
      b = b[1];
      a[0] = c[0] * d + c[2] * b;
      a[1] = c[1] * d + c[3] * b;
      return a;
    };
    r.transformMat2d = function (a, b, c) {
      var d = b[0];
      b = b[1];
      a[0] = c[0] * d + c[2] * b + c[4];
      a[1] = c[1] * d + c[3] * b + c[5];
      return a;
    };
    r.transformMat3 = function (a, b, c) {
      var d = b[0];
      b = b[1];
      a[0] = c[0] * d + c[3] * b + c[6];
      a[1] = c[1] * d + c[4] * b + c[7];
      return a;
    };
    r.transformMat4 = function (a, b, c) {
      var d = b[0];
      b = b[1];
      a[0] = c[0] * d + c[4] * b + c[12];
      a[1] = c[1] * d + c[5] * b + c[13];
      return a;
    };
    r.forEach = (function () {
      var a = r.create();
      return function (b, c, d, f, e, g) {
        c || (c = 2);
        d || (d = 0);
        for (f = f ? Math.min(f * c + d, b.length) : b.length; d < f; d += c)
          ((a[0] = b[d]),
            (a[1] = b[d + 1]),
            e(a, a, g),
            (b[d] = a[0]),
            (b[d + 1] = a[1]));
        return b;
      };
    })();
    r.str = function (a) {
      return "vec2(" + a[0] + ", " + a[1] + ")";
    };
    "undefined" !== typeof a && (a.vec2 = r);
    var q = {
      create: function () {
        var a = new c(3);
        a[0] = 0;
        a[1] = 0;
        a[2] = 0;
        return a;
      },
      clone: function (a) {
        var b = new c(3);
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        return b;
      },
      fromValues: function (a, b, d) {
        var f = new c(3);
        f[0] = a;
        f[1] = b;
        f[2] = d;
        return f;
      },
      copy: function (a, b) {
        a[0] = b[0];
        a[1] = b[1];
        a[2] = b[2];
        return a;
      },
      set: function (a, b, c, d) {
        a[0] = b;
        a[1] = c;
        a[2] = d;
        return a;
      },
      add: function (a, b, c) {
        a[0] = b[0] + c[0];
        a[1] = b[1] + c[1];
        a[2] = b[2] + c[2];
        return a;
      },
      subtract: function (a, b, c) {
        a[0] = b[0] - c[0];
        a[1] = b[1] - c[1];
        a[2] = b[2] - c[2];
        return a;
      },
    };
    q.sub = q.subtract;
    q.multiply = function (a, b, c) {
      a[0] = b[0] * c[0];
      a[1] = b[1] * c[1];
      a[2] = b[2] * c[2];
      return a;
    };
    q.mul = q.multiply;
    q.divide = function (a, b, c) {
      a[0] = b[0] / c[0];
      a[1] = b[1] / c[1];
      a[2] = b[2] / c[2];
      return a;
    };
    q.div = q.divide;
    q.min = function (a, b, c) {
      a[0] = Math.min(b[0], c[0]);
      a[1] = Math.min(b[1], c[1]);
      a[2] = Math.min(b[2], c[2]);
      return a;
    };
    q.max = function (a, b, c) {
      a[0] = Math.max(b[0], c[0]);
      a[1] = Math.max(b[1], c[1]);
      a[2] = Math.max(b[2], c[2]);
      return a;
    };
    q.scale = function (a, b, c) {
      a[0] = b[0] * c;
      a[1] = b[1] * c;
      a[2] = b[2] * c;
      return a;
    };
    q.scaleAndAdd = function (a, b, c, d) {
      a[0] = b[0] + c[0] * d;
      a[1] = b[1] + c[1] * d;
      a[2] = b[2] + c[2] * d;
      return a;
    };
    q.distance = function (a, b) {
      var c = b[0] - a[0],
        d = b[1] - a[1];
      a = b[2] - a[2];
      return Math.sqrt(c * c + d * d + a * a);
    };
    q.dist = q.distance;
    q.squaredDistance = function (a, b) {
      var c = b[0] - a[0],
        d = b[1] - a[1];
      a = b[2] - a[2];
      return c * c + d * d + a * a;
    };
    q.sqrDist = q.squaredDistance;
    q.length = function (a) {
      var b = a[0],
        c = a[1];
      a = a[2];
      return Math.sqrt(b * b + c * c + a * a);
    };
    q.len = q.length;
    q.squaredLength = function (a) {
      var b = a[0],
        c = a[1];
      a = a[2];
      return b * b + c * c + a * a;
    };
    q.sqrLen = q.squaredLength;
    q.negate = function (a, b) {
      a[0] = -b[0];
      a[1] = -b[1];
      a[2] = -b[2];
      return a;
    };
    q.normalize = function (a, b) {
      var c = b[0],
        d = b[1],
        f = b[2],
        c = c * c + d * d + f * f;
      0 < c &&
        ((c = 1 / Math.sqrt(c)),
        (a[0] = b[0] * c),
        (a[1] = b[1] * c),
        (a[2] = b[2] * c));
      return a;
    };
    q.dot = function (a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    };
    q.cross = function (a, b, c) {
      var d = b[0],
        f = b[1];
      b = b[2];
      var n = c[0],
        e = c[1];
      c = c[2];
      a[0] = f * c - b * e;
      a[1] = b * n - d * c;
      a[2] = d * e - f * n;
      return a;
    };
    q.lerp = function (a, b, c, d) {
      var f = b[0],
        n = b[1];
      b = b[2];
      a[0] = f + d * (c[0] - f);
      a[1] = n + d * (c[1] - n);
      a[2] = b + d * (c[2] - b);
      return a;
    };
    q.random = function (a, b) {
      b = b || 1;
      var c = 2 * m() * Math.PI,
        d = 2 * m() - 1,
        f = Math.sqrt(1 - d * d) * b;
      a[0] = Math.cos(c) * f;
      a[1] = Math.sin(c) * f;
      a[2] = d * b;
      return a;
    };
    q.transformMat4 = function (a, b, c) {
      var d = b[0],
        f = b[1];
      b = b[2];
      a[0] = c[0] * d + c[4] * f + c[8] * b + c[12];
      a[1] = c[1] * d + c[5] * f + c[9] * b + c[13];
      a[2] = c[2] * d + c[6] * f + c[10] * b + c[14];
      return a;
    };
    q.transformMat3 = function (a, b, c) {
      var d = b[0],
        f = b[1];
      b = b[2];
      a[0] = d * c[0] + f * c[3] + b * c[6];
      a[1] = d * c[1] + f * c[4] + b * c[7];
      a[2] = d * c[2] + f * c[5] + b * c[8];
      return a;
    };
    q.transformQuat = function (a, b, c) {
      var d = b[0],
        f = b[1],
        n = b[2];
      b = c[0];
      var e = c[1],
        p = c[2];
      c = c[3];
      var g = c * d + e * n - p * f,
        l = c * f + p * d - b * n,
        k = c * n + b * f - e * d,
        d = -b * d - e * f - p * n;
      a[0] = g * c + d * -b + l * -p - k * -e;
      a[1] = l * c + d * -e + k * -b - g * -p;
      a[2] = k * c + d * -p + g * -e - l * -b;
      return a;
    };
    q.forEach = (function () {
      var a = q.create();
      return function (b, c, d, f, e, g) {
        c || (c = 3);
        d || (d = 0);
        for (f = f ? Math.min(f * c + d, b.length) : b.length; d < f; d += c)
          ((a[0] = b[d]),
            (a[1] = b[d + 1]),
            (a[2] = b[d + 2]),
            e(a, a, g),
            (b[d] = a[0]),
            (b[d + 1] = a[1]),
            (b[d + 2] = a[2]));
        return b;
      };
    })();
    q.str = function (a) {
      return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
    };
    "undefined" !== typeof a && (a.vec3 = q);
    var k = {
      create: function () {
        var a = new c(4);
        a[0] = 0;
        a[1] = 0;
        a[2] = 0;
        a[3] = 0;
        return a;
      },
      clone: function (a) {
        var b = new c(4);
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = a[3];
        return b;
      },
      fromValues: function (a, b, d, e) {
        var f = new c(4);
        f[0] = a;
        f[1] = b;
        f[2] = d;
        f[3] = e;
        return f;
      },
      copy: function (a, b) {
        a[0] = b[0];
        a[1] = b[1];
        a[2] = b[2];
        a[3] = b[3];
        return a;
      },
      set: function (a, b, c, d, e) {
        a[0] = b;
        a[1] = c;
        a[2] = d;
        a[3] = e;
        return a;
      },
      add: function (a, b, c) {
        a[0] = b[0] + c[0];
        a[1] = b[1] + c[1];
        a[2] = b[2] + c[2];
        a[3] = b[3] + c[3];
        return a;
      },
      subtract: function (a, b, c) {
        a[0] = b[0] - c[0];
        a[1] = b[1] - c[1];
        a[2] = b[2] - c[2];
        a[3] = b[3] - c[3];
        return a;
      },
    };
    k.sub = k.subtract;
    k.multiply = function (a, b, c) {
      a[0] = b[0] * c[0];
      a[1] = b[1] * c[1];
      a[2] = b[2] * c[2];
      a[3] = b[3] * c[3];
      return a;
    };
    k.mul = k.multiply;
    k.divide = function (a, b, c) {
      a[0] = b[0] / c[0];
      a[1] = b[1] / c[1];
      a[2] = b[2] / c[2];
      a[3] = b[3] / c[3];
      return a;
    };
    k.div = k.divide;
    k.min = function (a, b, c) {
      a[0] = Math.min(b[0], c[0]);
      a[1] = Math.min(b[1], c[1]);
      a[2] = Math.min(b[2], c[2]);
      a[3] = Math.min(b[3], c[3]);
      return a;
    };
    k.max = function (a, b, c) {
      a[0] = Math.max(b[0], c[0]);
      a[1] = Math.max(b[1], c[1]);
      a[2] = Math.max(b[2], c[2]);
      a[3] = Math.max(b[3], c[3]);
      return a;
    };
    k.scale = function (a, b, c) {
      a[0] = b[0] * c;
      a[1] = b[1] * c;
      a[2] = b[2] * c;
      a[3] = b[3] * c;
      return a;
    };
    k.scaleAndAdd = function (a, b, c, d) {
      a[0] = b[0] + c[0] * d;
      a[1] = b[1] + c[1] * d;
      a[2] = b[2] + c[2] * d;
      a[3] = b[3] + c[3] * d;
      return a;
    };
    k.distance = function (a, b) {
      var c = b[0] - a[0],
        d = b[1] - a[1],
        f = b[2] - a[2];
      a = b[3] - a[3];
      return Math.sqrt(c * c + d * d + f * f + a * a);
    };
    k.dist = k.distance;
    k.squaredDistance = function (a, b) {
      var c = b[0] - a[0],
        d = b[1] - a[1],
        f = b[2] - a[2];
      a = b[3] - a[3];
      return c * c + d * d + f * f + a * a;
    };
    k.sqrDist = k.squaredDistance;
    k.length = function (a) {
      var b = a[0],
        c = a[1],
        d = a[2];
      a = a[3];
      return Math.sqrt(b * b + c * c + d * d + a * a);
    };
    k.len = k.length;
    k.squaredLength = function (a) {
      var b = a[0],
        c = a[1],
        d = a[2];
      a = a[3];
      return b * b + c * c + d * d + a * a;
    };
    k.sqrLen = k.squaredLength;
    k.negate = function (a, b) {
      a[0] = -b[0];
      a[1] = -b[1];
      a[2] = -b[2];
      a[3] = -b[3];
      return a;
    };
    k.normalize = function (a, b) {
      var c = b[0],
        d = b[1],
        f = b[2],
        n = b[3],
        c = c * c + d * d + f * f + n * n;
      0 < c &&
        ((c = 1 / Math.sqrt(c)),
        (a[0] = b[0] * c),
        (a[1] = b[1] * c),
        (a[2] = b[2] * c),
        (a[3] = b[3] * c));
      return a;
    };
    k.dot = function (a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    };
    k.lerp = function (a, b, c, d) {
      var f = b[0],
        n = b[1],
        e = b[2];
      b = b[3];
      a[0] = f + d * (c[0] - f);
      a[1] = n + d * (c[1] - n);
      a[2] = e + d * (c[2] - e);
      a[3] = b + d * (c[3] - b);
      return a;
    };
    k.random = function (a, b) {
      b = b || 1;
      a[0] = m();
      a[1] = m();
      a[2] = m();
      a[3] = m();
      k.normalize(a, a);
      k.scale(a, a, b);
      return a;
    };
    k.transformMat4 = function (a, b, c) {
      var d = b[0],
        f = b[1],
        n = b[2];
      b = b[3];
      a[0] = c[0] * d + c[4] * f + c[8] * n + c[12] * b;
      a[1] = c[1] * d + c[5] * f + c[9] * n + c[13] * b;
      a[2] = c[2] * d + c[6] * f + c[10] * n + c[14] * b;
      a[3] = c[3] * d + c[7] * f + c[11] * n + c[15] * b;
      return a;
    };
    k.transformQuat = function (a, b, c) {
      var d = b[0],
        f = b[1],
        n = b[2];
      b = c[0];
      var e = c[1],
        g = c[2];
      c = c[3];
      var p = c * d + e * n - g * f,
        l = c * f + g * d - b * n,
        k = c * n + b * f - e * d,
        d = -b * d - e * f - g * n;
      a[0] = p * c + d * -b + l * -g - k * -e;
      a[1] = l * c + d * -e + k * -b - p * -g;
      a[2] = k * c + d * -g + p * -e - l * -b;
      return a;
    };
    k.forEach = (function () {
      var a = k.create();
      return function (b, c, d, f, e, g) {
        c || (c = 4);
        d || (d = 0);
        for (f = f ? Math.min(f * c + d, b.length) : b.length; d < f; d += c)
          ((a[0] = b[d]),
            (a[1] = b[d + 1]),
            (a[2] = b[d + 2]),
            (a[3] = b[d + 3]),
            e(a, a, g),
            (b[d] = a[0]),
            (b[d + 1] = a[1]),
            (b[d + 2] = a[2]),
            (b[d + 3] = a[3]));
        return b;
      };
    })();
    k.str = function (a) {
      return "vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
    };
    "undefined" !== typeof a && (a.vec4 = k);
    h = {
      create: function () {
        var a = new c(4);
        a[0] = 1;
        a[1] = 0;
        a[2] = 0;
        a[3] = 1;
        return a;
      },
      clone: function (a) {
        var b = new c(4);
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = a[3];
        return b;
      },
      copy: function (a, b) {
        a[0] = b[0];
        a[1] = b[1];
        a[2] = b[2];
        a[3] = b[3];
        return a;
      },
      identity: function (a) {
        a[0] = 1;
        a[1] = 0;
        a[2] = 0;
        a[3] = 1;
        return a;
      },
      transpose: function (a, b) {
        if (a === b) {
          var c = b[1];
          a[1] = b[2];
          a[2] = c;
        } else ((a[0] = b[0]), (a[1] = b[2]), (a[2] = b[1]), (a[3] = b[3]));
        return a;
      },
      invert: function (a, b) {
        var c = b[0],
          d = b[1],
          f = b[2];
        b = b[3];
        var n = c * b - f * d;
        if (!n) return null;
        n = 1 / n;
        a[0] = b * n;
        a[1] = -d * n;
        a[2] = -f * n;
        a[3] = c * n;
        return a;
      },
      adjoint: function (a, b) {
        var c = b[0];
        a[0] = b[3];
        a[1] = -b[1];
        a[2] = -b[2];
        a[3] = c;
        return a;
      },
      determinant: function (a) {
        return a[0] * a[3] - a[2] * a[1];
      },
      multiply: function (a, b, c) {
        var d = b[0],
          f = b[1],
          n = b[2];
        b = b[3];
        var e = c[0],
          g = c[1],
          p = c[2];
        c = c[3];
        a[0] = d * e + f * p;
        a[1] = d * g + f * c;
        a[2] = n * e + b * p;
        a[3] = n * g + b * c;
        return a;
      },
    };
    h.mul = h.multiply;
    h.rotate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        n = b[2];
      b = b[3];
      var e = Math.sin(c);
      c = Math.cos(c);
      a[0] = d * c + f * e;
      a[1] = d * -e + f * c;
      a[2] = n * c + b * e;
      a[3] = n * -e + b * c;
      return a;
    };
    h.scale = function (a, b, c) {
      var d = b[1],
        f = b[2],
        n = b[3],
        e = c[0];
      c = c[1];
      a[0] = b[0] * e;
      a[1] = d * c;
      a[2] = f * e;
      a[3] = n * c;
      return a;
    };
    h.str = function (a) {
      return "mat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
    };
    "undefined" !== typeof a && (a.mat2 = h);
    h = {
      create: function () {
        var a = new c(6);
        a[0] = 1;
        a[1] = 0;
        a[2] = 0;
        a[3] = 1;
        a[4] = 0;
        a[5] = 0;
        return a;
      },
      clone: function (a) {
        var b = new c(6);
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = a[3];
        b[4] = a[4];
        b[5] = a[5];
        return b;
      },
      copy: function (a, b) {
        a[0] = b[0];
        a[1] = b[1];
        a[2] = b[2];
        a[3] = b[3];
        a[4] = b[4];
        a[5] = b[5];
        return a;
      },
      identity: function (a) {
        a[0] = 1;
        a[1] = 0;
        a[2] = 0;
        a[3] = 1;
        a[4] = 0;
        a[5] = 0;
        return a;
      },
      invert: function (a, b) {
        var c = b[0],
          d = b[1],
          f = b[2],
          e = b[3],
          n = b[4];
        b = b[5];
        var g = c * e - d * f;
        if (!g) return null;
        g = 1 / g;
        a[0] = e * g;
        a[1] = -d * g;
        a[2] = -f * g;
        a[3] = c * g;
        a[4] = (f * b - e * n) * g;
        a[5] = (d * n - c * b) * g;
        return a;
      },
      determinant: function (a) {
        return a[0] * a[3] - a[1] * a[2];
      },
      multiply: function (a, b, c) {
        var d = b[0],
          f = b[1],
          e = b[2],
          n = b[3],
          g = b[4];
        b = b[5];
        var p = c[0],
          l = c[1],
          k = c[2],
          t = c[3],
          h = c[4];
        c = c[5];
        a[0] = d * p + f * k;
        a[1] = d * l + f * t;
        a[2] = e * p + n * k;
        a[3] = e * l + n * t;
        a[4] = p * g + k * b + h;
        a[5] = l * g + t * b + c;
        return a;
      },
    };
    h.mul = h.multiply;
    h.rotate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        n = b[3],
        g = b[4];
      b = b[5];
      var p = Math.sin(c);
      c = Math.cos(c);
      a[0] = d * c + f * p;
      a[1] = -d * p + f * c;
      a[2] = e * c + n * p;
      a[3] = -e * p + c * n;
      a[4] = c * g + p * b;
      a[5] = c * b - p * g;
      return a;
    };
    h.scale = function (a, b, c) {
      var d = c[0];
      c = c[1];
      a[0] = b[0] * d;
      a[1] = b[1] * c;
      a[2] = b[2] * d;
      a[3] = b[3] * c;
      a[4] = b[4] * d;
      a[5] = b[5] * c;
      return a;
    };
    h.translate = function (a, b, c) {
      a[0] = b[0];
      a[1] = b[1];
      a[2] = b[2];
      a[3] = b[3];
      a[4] = b[4] + c[0];
      a[5] = b[5] + c[1];
      return a;
    };
    h.str = function (a) {
      return (
        "mat2d(" +
        a[0] +
        ", " +
        a[1] +
        ", " +
        a[2] +
        ", " +
        a[3] +
        ", " +
        a[4] +
        ", " +
        a[5] +
        ")"
      );
    };
    "undefined" !== typeof a && (a.mat2d = h);
    var g = {
      create: function () {
        var a = new c(9);
        a[0] = 1;
        a[1] = 0;
        a[2] = 0;
        a[3] = 0;
        a[4] = 1;
        a[5] = 0;
        a[6] = 0;
        a[7] = 0;
        a[8] = 1;
        return a;
      },
      fromMat4: function (a, b) {
        a[0] = b[0];
        a[1] = b[1];
        a[2] = b[2];
        a[3] = b[4];
        a[4] = b[5];
        a[5] = b[6];
        a[6] = b[8];
        a[7] = b[9];
        a[8] = b[10];
        return a;
      },
      clone: function (a) {
        var b = new c(9);
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = a[3];
        b[4] = a[4];
        b[5] = a[5];
        b[6] = a[6];
        b[7] = a[7];
        b[8] = a[8];
        return b;
      },
      copy: function (a, b) {
        a[0] = b[0];
        a[1] = b[1];
        a[2] = b[2];
        a[3] = b[3];
        a[4] = b[4];
        a[5] = b[5];
        a[6] = b[6];
        a[7] = b[7];
        a[8] = b[8];
        return a;
      },
      identity: function (a) {
        a[0] = 1;
        a[1] = 0;
        a[2] = 0;
        a[3] = 0;
        a[4] = 1;
        a[5] = 0;
        a[6] = 0;
        a[7] = 0;
        a[8] = 1;
        return a;
      },
      transpose: function (a, b) {
        if (a === b) {
          var c = b[1],
            d = b[2],
            f = b[5];
          a[1] = b[3];
          a[2] = b[6];
          a[3] = c;
          a[5] = b[7];
          a[6] = d;
          a[7] = f;
        } else
          ((a[0] = b[0]),
            (a[1] = b[3]),
            (a[2] = b[6]),
            (a[3] = b[1]),
            (a[4] = b[4]),
            (a[5] = b[7]),
            (a[6] = b[2]),
            (a[7] = b[5]),
            (a[8] = b[8]));
        return a;
      },
      invert: function (a, b) {
        var c = b[0],
          d = b[1],
          f = b[2],
          e = b[3],
          n = b[4],
          g = b[5],
          l = b[6],
          k = b[7];
        b = b[8];
        var t = b * n - g * k,
          h = -b * e + g * l,
          m = k * e - n * l,
          q = c * t + d * h + f * m;
        if (!q) return null;
        q = 1 / q;
        a[0] = t * q;
        a[1] = (-b * d + f * k) * q;
        a[2] = (g * d - f * n) * q;
        a[3] = h * q;
        a[4] = (b * c - f * l) * q;
        a[5] = (-g * c + f * e) * q;
        a[6] = m * q;
        a[7] = (-k * c + d * l) * q;
        a[8] = (n * c - d * e) * q;
        return a;
      },
      adjoint: function (a, b) {
        var c = b[0],
          d = b[1],
          f = b[2],
          e = b[3],
          n = b[4],
          g = b[5],
          l = b[6],
          k = b[7];
        b = b[8];
        a[0] = n * b - g * k;
        a[1] = f * k - d * b;
        a[2] = d * g - f * n;
        a[3] = g * l - e * b;
        a[4] = c * b - f * l;
        a[5] = f * e - c * g;
        a[6] = e * k - n * l;
        a[7] = d * l - c * k;
        a[8] = c * n - d * e;
        return a;
      },
      determinant: function (a) {
        var b = a[3],
          c = a[4],
          d = a[5],
          f = a[6],
          e = a[7],
          g = a[8];
        return (
          a[0] * (g * c - d * e) +
          a[1] * (-g * b + d * f) +
          a[2] * (e * b - c * f)
        );
      },
      multiply: function (a, b, c) {
        var d = b[0],
          f = b[1],
          e = b[2],
          n = b[3],
          g = b[4],
          p = b[5],
          l = b[6],
          k = b[7];
        b = b[8];
        var t = c[0],
          h = c[1],
          m = c[2],
          q = c[3],
          r = c[4],
          M = c[5],
          E = c[6],
          F = c[7];
        c = c[8];
        a[0] = t * d + h * n + m * l;
        a[1] = t * f + h * g + m * k;
        a[2] = t * e + h * p + m * b;
        a[3] = q * d + r * n + M * l;
        a[4] = q * f + r * g + M * k;
        a[5] = q * e + r * p + M * b;
        a[6] = E * d + F * n + c * l;
        a[7] = E * f + F * g + c * k;
        a[8] = E * e + F * p + c * b;
        return a;
      },
    };
    g.mul = g.multiply;
    g.translate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        n = b[3],
        g = b[4],
        p = b[5],
        l = b[6],
        k = b[7];
      b = b[8];
      var t = c[0];
      c = c[1];
      a[0] = d;
      a[1] = f;
      a[2] = e;
      a[3] = n;
      a[4] = g;
      a[5] = p;
      a[6] = t * d + c * n + l;
      a[7] = t * f + c * g + k;
      a[8] = t * e + c * p + b;
      return a;
    };
    g.rotate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        n = b[3],
        g = b[4],
        p = b[5],
        l = b[6],
        k = b[7];
      b = b[8];
      var t = Math.sin(c);
      c = Math.cos(c);
      a[0] = c * d + t * n;
      a[1] = c * f + t * g;
      a[2] = c * e + t * p;
      a[3] = c * n - t * d;
      a[4] = c * g - t * f;
      a[5] = c * p - t * e;
      a[6] = l;
      a[7] = k;
      a[8] = b;
      return a;
    };
    g.scale = function (a, b, c) {
      var d = c[0];
      c = c[1];
      a[0] = d * b[0];
      a[1] = d * b[1];
      a[2] = d * b[2];
      a[3] = c * b[3];
      a[4] = c * b[4];
      a[5] = c * b[5];
      a[6] = b[6];
      a[7] = b[7];
      a[8] = b[8];
      return a;
    };
    g.fromMat2d = function (a, b) {
      a[0] = b[0];
      a[1] = b[1];
      a[2] = 0;
      a[3] = b[2];
      a[4] = b[3];
      a[5] = 0;
      a[6] = b[4];
      a[7] = b[5];
      a[8] = 1;
      return a;
    };
    g.fromQuat = function (a, b) {
      var c = b[0],
        d = b[1],
        f = b[2],
        e = b[3],
        n = c + c,
        g = d + d,
        l = f + f;
      b = c * n;
      var k = c * g,
        c = c * l,
        t = d * g,
        d = d * l,
        f = f * l,
        n = e * n,
        g = e * g,
        e = e * l;
      a[0] = 1 - (t + f);
      a[3] = k + e;
      a[6] = c - g;
      a[1] = k - e;
      a[4] = 1 - (b + f);
      a[7] = d + n;
      a[2] = c + g;
      a[5] = d - n;
      a[8] = 1 - (b + t);
      return a;
    };
    g.normalFromMat4 = function (a, b) {
      var c = b[0],
        d = b[1],
        f = b[2],
        e = b[3],
        n = b[4],
        g = b[5],
        l = b[6],
        k = b[7],
        t = b[8],
        h = b[9],
        m = b[10],
        q = b[11],
        r = b[12],
        x = b[13],
        M = b[14];
      b = b[15];
      var E = c * g - d * n,
        F = c * l - f * n,
        G = c * k - e * n,
        H = d * l - f * g,
        K = d * k - e * g,
        P = f * k - e * l,
        N = t * x - h * r,
        S = t * M - m * r,
        t = t * b - q * r,
        R = h * M - m * x,
        h = h * b - q * x,
        m = m * b - q * M,
        q = E * m - F * h + G * R + H * t - K * S + P * N;
      if (!q) return null;
      q = 1 / q;
      a[0] = (g * m - l * h + k * R) * q;
      a[1] = (l * t - n * m - k * S) * q;
      a[2] = (n * h - g * t + k * N) * q;
      a[3] = (f * h - d * m - e * R) * q;
      a[4] = (c * m - f * t + e * S) * q;
      a[5] = (d * t - c * h - e * N) * q;
      a[6] = (x * P - M * K + b * H) * q;
      a[7] = (M * G - r * P - b * F) * q;
      a[8] = (r * K - x * G + b * E) * q;
      return a;
    };
    g.str = function (a) {
      return (
        "mat3(" +
        a[0] +
        ", " +
        a[1] +
        ", " +
        a[2] +
        ", " +
        a[3] +
        ", " +
        a[4] +
        ", " +
        a[5] +
        ", " +
        a[6] +
        ", " +
        a[7] +
        ", " +
        a[8] +
        ")"
      );
    };
    "undefined" !== typeof a && (a.mat3 = g);
    var t = {
      create: function () {
        var a = new c(16);
        a[0] = 1;
        a[1] = 0;
        a[2] = 0;
        a[3] = 0;
        a[4] = 0;
        a[5] = 1;
        a[6] = 0;
        a[7] = 0;
        a[8] = 0;
        a[9] = 0;
        a[10] = 1;
        a[11] = 0;
        a[12] = 0;
        a[13] = 0;
        a[14] = 0;
        a[15] = 1;
        return a;
      },
      clone: function (a) {
        var b = new c(16);
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = a[3];
        b[4] = a[4];
        b[5] = a[5];
        b[6] = a[6];
        b[7] = a[7];
        b[8] = a[8];
        b[9] = a[9];
        b[10] = a[10];
        b[11] = a[11];
        b[12] = a[12];
        b[13] = a[13];
        b[14] = a[14];
        b[15] = a[15];
        return b;
      },
      copy: function (a, b) {
        a[0] = b[0];
        a[1] = b[1];
        a[2] = b[2];
        a[3] = b[3];
        a[4] = b[4];
        a[5] = b[5];
        a[6] = b[6];
        a[7] = b[7];
        a[8] = b[8];
        a[9] = b[9];
        a[10] = b[10];
        a[11] = b[11];
        a[12] = b[12];
        a[13] = b[13];
        a[14] = b[14];
        a[15] = b[15];
        return a;
      },
      identity: function (a) {
        a[0] = 1;
        a[1] = 0;
        a[2] = 0;
        a[3] = 0;
        a[4] = 0;
        a[5] = 1;
        a[6] = 0;
        a[7] = 0;
        a[8] = 0;
        a[9] = 0;
        a[10] = 1;
        a[11] = 0;
        a[12] = 0;
        a[13] = 0;
        a[14] = 0;
        a[15] = 1;
        return a;
      },
      transpose: function (a, b) {
        if (a === b) {
          var c = b[1],
            d = b[2],
            f = b[3],
            e = b[6],
            n = b[7],
            g = b[11];
          a[1] = b[4];
          a[2] = b[8];
          a[3] = b[12];
          a[4] = c;
          a[6] = b[9];
          a[7] = b[13];
          a[8] = d;
          a[9] = e;
          a[11] = b[14];
          a[12] = f;
          a[13] = n;
          a[14] = g;
        } else
          ((a[0] = b[0]),
            (a[1] = b[4]),
            (a[2] = b[8]),
            (a[3] = b[12]),
            (a[4] = b[1]),
            (a[5] = b[5]),
            (a[6] = b[9]),
            (a[7] = b[13]),
            (a[8] = b[2]),
            (a[9] = b[6]),
            (a[10] = b[10]),
            (a[11] = b[14]),
            (a[12] = b[3]),
            (a[13] = b[7]),
            (a[14] = b[11]),
            (a[15] = b[15]));
        return a;
      },
      invert: function (a, b) {
        var c = b[0],
          d = b[1],
          f = b[2],
          e = b[3],
          n = b[4],
          g = b[5],
          l = b[6],
          k = b[7],
          t = b[8],
          h = b[9],
          m = b[10],
          q = b[11],
          r = b[12],
          x = b[13],
          M = b[14];
        b = b[15];
        var E = c * g - d * n,
          F = c * l - f * n,
          G = c * k - e * n,
          H = d * l - f * g,
          K = d * k - e * g,
          P = f * k - e * l,
          N = t * x - h * r,
          S = t * M - m * r,
          R = t * b - q * r,
          ea = h * M - m * x,
          U = h * b - q * x,
          V = m * b - q * M,
          ca = E * V - F * U + G * ea + H * R - K * S + P * N;
        if (!ca) return null;
        ca = 1 / ca;
        a[0] = (g * V - l * U + k * ea) * ca;
        a[1] = (f * U - d * V - e * ea) * ca;
        a[2] = (x * P - M * K + b * H) * ca;
        a[3] = (m * K - h * P - q * H) * ca;
        a[4] = (l * R - n * V - k * S) * ca;
        a[5] = (c * V - f * R + e * S) * ca;
        a[6] = (M * G - r * P - b * F) * ca;
        a[7] = (t * P - m * G + q * F) * ca;
        a[8] = (n * U - g * R + k * N) * ca;
        a[9] = (d * R - c * U - e * N) * ca;
        a[10] = (r * K - x * G + b * E) * ca;
        a[11] = (h * G - t * K - q * E) * ca;
        a[12] = (g * S - n * ea - l * N) * ca;
        a[13] = (c * ea - d * S + f * N) * ca;
        a[14] = (x * F - r * H - M * E) * ca;
        a[15] = (t * H - h * F + m * E) * ca;
        return a;
      },
      adjoint: function (a, b) {
        var c = b[0],
          d = b[1],
          f = b[2],
          e = b[3],
          g = b[4],
          n = b[5],
          l = b[6],
          k = b[7],
          t = b[8],
          h = b[9],
          m = b[10],
          q = b[11],
          r = b[12],
          x = b[13],
          M = b[14];
        b = b[15];
        a[0] = n * (m * b - q * M) - h * (l * b - k * M) + x * (l * q - k * m);
        a[1] = -(
          d * (m * b - q * M) -
          h * (f * b - e * M) +
          x * (f * q - e * m)
        );
        a[2] = d * (l * b - k * M) - n * (f * b - e * M) + x * (f * k - e * l);
        a[3] = -(
          d * (l * q - k * m) -
          n * (f * q - e * m) +
          h * (f * k - e * l)
        );
        a[4] = -(
          g * (m * b - q * M) -
          t * (l * b - k * M) +
          r * (l * q - k * m)
        );
        a[5] = c * (m * b - q * M) - t * (f * b - e * M) + r * (f * q - e * m);
        a[6] = -(
          c * (l * b - k * M) -
          g * (f * b - e * M) +
          r * (f * k - e * l)
        );
        a[7] = c * (l * q - k * m) - g * (f * q - e * m) + t * (f * k - e * l);
        a[8] = g * (h * b - q * x) - t * (n * b - k * x) + r * (n * q - k * h);
        a[9] = -(
          c * (h * b - q * x) -
          t * (d * b - e * x) +
          r * (d * q - e * h)
        );
        a[10] = c * (n * b - k * x) - g * (d * b - e * x) + r * (d * k - e * n);
        a[11] = -(
          c * (n * q - k * h) -
          g * (d * q - e * h) +
          t * (d * k - e * n)
        );
        a[12] = -(
          g * (h * M - m * x) -
          t * (n * M - l * x) +
          r * (n * m - l * h)
        );
        a[13] = c * (h * M - m * x) - t * (d * M - f * x) + r * (d * m - f * h);
        a[14] = -(
          c * (n * M - l * x) -
          g * (d * M - f * x) +
          r * (d * l - f * n)
        );
        a[15] = c * (n * m - l * h) - g * (d * m - f * h) + t * (d * l - f * n);
        return a;
      },
      determinant: function (a) {
        var b = a[0],
          c = a[1],
          d = a[2],
          f = a[3],
          e = a[4],
          g = a[5],
          l = a[6],
          k = a[7],
          t = a[8],
          h = a[9],
          m = a[10],
          q = a[11],
          r = a[12],
          L = a[13],
          x = a[14];
        a = a[15];
        return (
          (b * g - c * e) * (m * a - q * x) -
          (b * l - d * e) * (h * a - q * L) +
          (b * k - f * e) * (h * x - m * L) +
          (c * l - d * g) * (t * a - q * r) -
          (c * k - f * g) * (t * x - m * r) +
          (d * k - f * l) * (t * L - h * r)
        );
      },
      multiply: function (a, b, c) {
        var d = b[0],
          f = b[1],
          e = b[2],
          g = b[3],
          n = b[4],
          l = b[5],
          p = b[6],
          k = b[7],
          t = b[8],
          h = b[9],
          m = b[10],
          q = b[11],
          r = b[12],
          M = b[13],
          E = b[14];
        b = b[15];
        var F = c[0],
          G = c[1],
          H = c[2],
          K = c[3];
        a[0] = F * d + G * n + H * t + K * r;
        a[1] = F * f + G * l + H * h + K * M;
        a[2] = F * e + G * p + H * m + K * E;
        a[3] = F * g + G * k + H * q + K * b;
        F = c[4];
        G = c[5];
        H = c[6];
        K = c[7];
        a[4] = F * d + G * n + H * t + K * r;
        a[5] = F * f + G * l + H * h + K * M;
        a[6] = F * e + G * p + H * m + K * E;
        a[7] = F * g + G * k + H * q + K * b;
        F = c[8];
        G = c[9];
        H = c[10];
        K = c[11];
        a[8] = F * d + G * n + H * t + K * r;
        a[9] = F * f + G * l + H * h + K * M;
        a[10] = F * e + G * p + H * m + K * E;
        a[11] = F * g + G * k + H * q + K * b;
        F = c[12];
        G = c[13];
        H = c[14];
        K = c[15];
        a[12] = F * d + G * n + H * t + K * r;
        a[13] = F * f + G * l + H * h + K * M;
        a[14] = F * e + G * p + H * m + K * E;
        a[15] = F * g + G * k + H * q + K * b;
        return a;
      },
    };
    t.mul = t.multiply;
    t.translate = function (a, b, c) {
      var d = c[0],
        f = c[1];
      c = c[2];
      var e, g, n, l, p, k, t, h, m, q, r, M;
      b === a
        ? ((a[12] = b[0] * d + b[4] * f + b[8] * c + b[12]),
          (a[13] = b[1] * d + b[5] * f + b[9] * c + b[13]),
          (a[14] = b[2] * d + b[6] * f + b[10] * c + b[14]),
          (a[15] = b[3] * d + b[7] * f + b[11] * c + b[15]))
        : ((e = b[0]),
          (g = b[1]),
          (n = b[2]),
          (l = b[3]),
          (p = b[4]),
          (k = b[5]),
          (t = b[6]),
          (h = b[7]),
          (m = b[8]),
          (q = b[9]),
          (r = b[10]),
          (M = b[11]),
          (a[0] = e),
          (a[1] = g),
          (a[2] = n),
          (a[3] = l),
          (a[4] = p),
          (a[5] = k),
          (a[6] = t),
          (a[7] = h),
          (a[8] = m),
          (a[9] = q),
          (a[10] = r),
          (a[11] = M),
          (a[12] = e * d + p * f + m * c + b[12]),
          (a[13] = g * d + k * f + q * c + b[13]),
          (a[14] = n * d + t * f + r * c + b[14]),
          (a[15] = l * d + h * f + M * c + b[15]));
      return a;
    };
    t.scale = function (a, b, c) {
      var d = c[0],
        f = c[1];
      c = c[2];
      a[0] = b[0] * d;
      a[1] = b[1] * d;
      a[2] = b[2] * d;
      a[3] = b[3] * d;
      a[4] = b[4] * f;
      a[5] = b[5] * f;
      a[6] = b[6] * f;
      a[7] = b[7] * f;
      a[8] = b[8] * c;
      a[9] = b[9] * c;
      a[10] = b[10] * c;
      a[11] = b[11] * c;
      a[12] = b[12];
      a[13] = b[13];
      a[14] = b[14];
      a[15] = b[15];
      return a;
    };
    t.rotate = function (a, c, d, e) {
      var f = e[0],
        g = e[1];
      e = e[2];
      var n = Math.sqrt(f * f + g * g + e * e),
        l,
        p,
        k,
        t,
        h,
        v,
        m,
        q,
        r,
        M,
        E,
        F,
        G,
        H,
        K,
        P,
        N,
        S,
        R,
        ea;
      if (Math.abs(n) < b) return null;
      n = 1 / n;
      f *= n;
      g *= n;
      e *= n;
      l = Math.sin(d);
      p = Math.cos(d);
      k = 1 - p;
      d = c[0];
      n = c[1];
      t = c[2];
      h = c[3];
      v = c[4];
      m = c[5];
      q = c[6];
      r = c[7];
      M = c[8];
      E = c[9];
      F = c[10];
      G = c[11];
      H = f * f * k + p;
      K = g * f * k + e * l;
      P = e * f * k - g * l;
      N = f * g * k - e * l;
      S = g * g * k + p;
      R = e * g * k + f * l;
      ea = f * e * k + g * l;
      f = g * e * k - f * l;
      g = e * e * k + p;
      a[0] = d * H + v * K + M * P;
      a[1] = n * H + m * K + E * P;
      a[2] = t * H + q * K + F * P;
      a[3] = h * H + r * K + G * P;
      a[4] = d * N + v * S + M * R;
      a[5] = n * N + m * S + E * R;
      a[6] = t * N + q * S + F * R;
      a[7] = h * N + r * S + G * R;
      a[8] = d * ea + v * f + M * g;
      a[9] = n * ea + m * f + E * g;
      a[10] = t * ea + q * f + F * g;
      a[11] = h * ea + r * f + G * g;
      c !== a &&
        ((a[12] = c[12]), (a[13] = c[13]), (a[14] = c[14]), (a[15] = c[15]));
      return a;
    };
    t.rotateX = function (a, b, c) {
      var d = Math.sin(c);
      c = Math.cos(c);
      var f = b[4],
        e = b[5],
        g = b[6],
        n = b[7],
        l = b[8],
        p = b[9],
        k = b[10],
        t = b[11];
      b !== a &&
        ((a[0] = b[0]),
        (a[1] = b[1]),
        (a[2] = b[2]),
        (a[3] = b[3]),
        (a[12] = b[12]),
        (a[13] = b[13]),
        (a[14] = b[14]),
        (a[15] = b[15]));
      a[4] = f * c + l * d;
      a[5] = e * c + p * d;
      a[6] = g * c + k * d;
      a[7] = n * c + t * d;
      a[8] = l * c - f * d;
      a[9] = p * c - e * d;
      a[10] = k * c - g * d;
      a[11] = t * c - n * d;
      return a;
    };
    t.rotateY = function (a, b, c) {
      var d = Math.sin(c);
      c = Math.cos(c);
      var f = b[0],
        e = b[1],
        g = b[2],
        n = b[3],
        l = b[8],
        p = b[9],
        k = b[10],
        t = b[11];
      b !== a &&
        ((a[4] = b[4]),
        (a[5] = b[5]),
        (a[6] = b[6]),
        (a[7] = b[7]),
        (a[12] = b[12]),
        (a[13] = b[13]),
        (a[14] = b[14]),
        (a[15] = b[15]));
      a[0] = f * c - l * d;
      a[1] = e * c - p * d;
      a[2] = g * c - k * d;
      a[3] = n * c - t * d;
      a[8] = f * d + l * c;
      a[9] = e * d + p * c;
      a[10] = g * d + k * c;
      a[11] = n * d + t * c;
      return a;
    };
    t.rotateZ = function (a, b, c) {
      var d = Math.sin(c);
      c = Math.cos(c);
      var f = b[0],
        e = b[1],
        g = b[2],
        n = b[3],
        l = b[4],
        k = b[5],
        p = b[6],
        t = b[7];
      b !== a &&
        ((a[8] = b[8]),
        (a[9] = b[9]),
        (a[10] = b[10]),
        (a[11] = b[11]),
        (a[12] = b[12]),
        (a[13] = b[13]),
        (a[14] = b[14]),
        (a[15] = b[15]));
      a[0] = f * c + l * d;
      a[1] = e * c + k * d;
      a[2] = g * c + p * d;
      a[3] = n * c + t * d;
      a[4] = l * c - f * d;
      a[5] = k * c - e * d;
      a[6] = p * c - g * d;
      a[7] = t * c - n * d;
      return a;
    };
    t.fromRotationTranslation = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        g = b[3],
        n = d + d,
        l = f + f,
        k = e + e;
      b = d * n;
      var p = d * l,
        d = d * k,
        t = f * l,
        f = f * k,
        e = e * k,
        n = g * n,
        l = g * l,
        g = g * k;
      a[0] = 1 - (t + e);
      a[1] = p + g;
      a[2] = d - l;
      a[3] = 0;
      a[4] = p - g;
      a[5] = 1 - (b + e);
      a[6] = f + n;
      a[7] = 0;
      a[8] = d + l;
      a[9] = f - n;
      a[10] = 1 - (b + t);
      a[11] = 0;
      a[12] = c[0];
      a[13] = c[1];
      a[14] = c[2];
      a[15] = 1;
      return a;
    };
    t.fromQuat = function (a, b) {
      var c = b[0],
        d = b[1],
        f = b[2],
        e = b[3],
        g = c + c,
        n = d + d,
        l = f + f;
      b = c * g;
      var k = c * n,
        c = c * l,
        t = d * n,
        d = d * l,
        f = f * l,
        g = e * g,
        n = e * n,
        e = e * l;
      a[0] = 1 - (t + f);
      a[1] = k + e;
      a[2] = c - n;
      a[3] = 0;
      a[4] = k - e;
      a[5] = 1 - (b + f);
      a[6] = d + g;
      a[7] = 0;
      a[8] = c + n;
      a[9] = d - g;
      a[10] = 1 - (b + t);
      a[11] = 0;
      a[12] = 0;
      a[13] = 0;
      a[14] = 0;
      a[15] = 1;
      return a;
    };
    t.frustum = function (a, b, c, d, e, g, l) {
      var f = 1 / (c - b),
        n = 1 / (e - d),
        k = 1 / (g - l);
      a[0] = 2 * g * f;
      a[1] = 0;
      a[2] = 0;
      a[3] = 0;
      a[4] = 0;
      a[5] = 2 * g * n;
      a[6] = 0;
      a[7] = 0;
      a[8] = (c + b) * f;
      a[9] = (e + d) * n;
      a[10] = (l + g) * k;
      a[11] = -1;
      a[12] = 0;
      a[13] = 0;
      a[14] = l * g * 2 * k;
      a[15] = 0;
      return a;
    };
    t.perspective = function (a, b, c, d, e) {
      b = 1 / Math.tan(b / 2);
      var f = 1 / (d - e);
      a[0] = b / c;
      a[1] = 0;
      a[2] = 0;
      a[3] = 0;
      a[4] = 0;
      a[5] = b;
      a[6] = 0;
      a[7] = 0;
      a[8] = 0;
      a[9] = 0;
      a[10] = (e + d) * f;
      a[11] = -1;
      a[12] = 0;
      a[13] = 0;
      a[14] = 2 * e * d * f;
      a[15] = 0;
      return a;
    };
    t.ortho = function (a, b, c, d, e, g, l) {
      var f = 1 / (b - c),
        n = 1 / (d - e),
        k = 1 / (g - l);
      a[0] = -2 * f;
      a[1] = 0;
      a[2] = 0;
      a[3] = 0;
      a[4] = 0;
      a[5] = -2 * n;
      a[6] = 0;
      a[7] = 0;
      a[8] = 0;
      a[9] = 0;
      a[10] = 2 * k;
      a[11] = 0;
      a[12] = (b + c) * f;
      a[13] = (e + d) * n;
      a[14] = (l + g) * k;
      a[15] = 1;
      return a;
    };
    t.lookAt = function (a, c, d, e) {
      var f,
        g,
        l,
        n,
        k,
        p,
        h,
        v,
        m = c[0],
        q = c[1];
      c = c[2];
      l = e[0];
      n = e[1];
      g = e[2];
      h = d[0];
      e = d[1];
      f = d[2];
      if (Math.abs(m - h) < b && Math.abs(q - e) < b && Math.abs(c - f) < b)
        return t.identity(a);
      d = m - h;
      e = q - e;
      h = c - f;
      v = 1 / Math.sqrt(d * d + e * e + h * h);
      d *= v;
      e *= v;
      h *= v;
      f = n * h - g * e;
      g = g * d - l * h;
      l = l * e - n * d;
      (v = Math.sqrt(f * f + g * g + l * l))
        ? ((v = 1 / v), (f *= v), (g *= v), (l *= v))
        : (l = g = f = 0);
      n = e * l - h * g;
      k = h * f - d * l;
      p = d * g - e * f;
      (v = Math.sqrt(n * n + k * k + p * p))
        ? ((v = 1 / v), (n *= v), (k *= v), (p *= v))
        : (p = k = n = 0);
      a[0] = f;
      a[1] = n;
      a[2] = d;
      a[3] = 0;
      a[4] = g;
      a[5] = k;
      a[6] = e;
      a[7] = 0;
      a[8] = l;
      a[9] = p;
      a[10] = h;
      a[11] = 0;
      a[12] = -(f * m + g * q + l * c);
      a[13] = -(n * m + k * q + p * c);
      a[14] = -(d * m + e * q + h * c);
      a[15] = 1;
      return a;
    };
    t.str = function (a) {
      return (
        "mat4(" +
        a[0] +
        ", " +
        a[1] +
        ", " +
        a[2] +
        ", " +
        a[3] +
        ", " +
        a[4] +
        ", " +
        a[5] +
        ", " +
        a[6] +
        ", " +
        a[7] +
        ", " +
        a[8] +
        ", " +
        a[9] +
        ", " +
        a[10] +
        ", " +
        a[11] +
        ", " +
        a[12] +
        ", " +
        a[13] +
        ", " +
        a[14] +
        ", " +
        a[15] +
        ")"
      );
    };
    "undefined" !== typeof a && (a.mat4 = t);
    var l = {
      create: function () {
        var a = new c(4);
        a[0] = 0;
        a[1] = 0;
        a[2] = 0;
        a[3] = 1;
        return a;
      },
    };
    l.rotationTo = (function () {
      var a = q.create(),
        b = q.fromValues(1, 0, 0),
        c = q.fromValues(0, 1, 0);
      return function (d, f, e) {
        var g = q.dot(f, e);
        if (-0.999999 > g)
          return (
            q.cross(a, b, f),
            1e-6 > q.length(a) && q.cross(a, c, f),
            q.normalize(a, a),
            l.setAxisAngle(d, a, Math.PI),
            d
          );
        if (0.999999 < g)
          return ((d[0] = 0), (d[1] = 0), (d[2] = 0), (d[3] = 1), d);
        q.cross(a, f, e);
        d[0] = a[0];
        d[1] = a[1];
        d[2] = a[2];
        d[3] = 1 + g;
        return l.normalize(d, d);
      };
    })();
    l.setAxes = (function () {
      var a = g.create();
      return function (b, c, d, f) {
        a[0] = d[0];
        a[3] = d[1];
        a[6] = d[2];
        a[1] = f[0];
        a[4] = f[1];
        a[7] = f[2];
        a[2] = c[0];
        a[5] = c[1];
        a[8] = c[2];
        return l.normalize(b, l.fromMat3(b, a));
      };
    })();
    l.clone = k.clone;
    l.fromValues = k.fromValues;
    l.copy = k.copy;
    l.set = k.set;
    l.identity = function (a) {
      a[0] = 0;
      a[1] = 0;
      a[2] = 0;
      a[3] = 1;
      return a;
    };
    l.setAxisAngle = function (a, b, c) {
      c *= 0.5;
      var d = Math.sin(c);
      a[0] = d * b[0];
      a[1] = d * b[1];
      a[2] = d * b[2];
      a[3] = Math.cos(c);
      return a;
    };
    l.add = k.add;
    l.multiply = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2];
      b = b[3];
      var g = c[0],
        l = c[1],
        n = c[2];
      c = c[3];
      a[0] = d * c + b * g + f * n - e * l;
      a[1] = f * c + b * l + e * g - d * n;
      a[2] = e * c + b * n + d * l - f * g;
      a[3] = b * c - d * g - f * l - e * n;
      return a;
    };
    l.mul = l.multiply;
    l.scale = k.scale;
    l.rotateX = function (a, b, c) {
      c *= 0.5;
      var d = b[0],
        f = b[1],
        e = b[2];
      b = b[3];
      var g = Math.sin(c);
      c = Math.cos(c);
      a[0] = d * c + b * g;
      a[1] = f * c + e * g;
      a[2] = e * c - f * g;
      a[3] = b * c - d * g;
      return a;
    };
    l.rotateY = function (a, b, c) {
      c *= 0.5;
      var d = b[0],
        f = b[1],
        e = b[2];
      b = b[3];
      var g = Math.sin(c);
      c = Math.cos(c);
      a[0] = d * c - e * g;
      a[1] = f * c + b * g;
      a[2] = e * c + d * g;
      a[3] = b * c - f * g;
      return a;
    };
    l.rotateZ = function (a, b, c) {
      c *= 0.5;
      var d = b[0],
        f = b[1],
        e = b[2];
      b = b[3];
      var g = Math.sin(c);
      c = Math.cos(c);
      a[0] = d * c + f * g;
      a[1] = f * c - d * g;
      a[2] = e * c + b * g;
      a[3] = b * c - e * g;
      return a;
    };
    l.calculateW = function (a, b) {
      var c = b[0],
        d = b[1];
      b = b[2];
      a[0] = c;
      a[1] = d;
      a[2] = b;
      a[3] = -Math.sqrt(Math.abs(1 - c * c - d * d - b * b));
      return a;
    };
    l.dot = k.dot;
    l.lerp = k.lerp;
    l.slerp = function (a, b, c, d) {
      var f = b[0],
        e = b[1],
        g = b[2];
      b = b[3];
      var l = c[0],
        n = c[1],
        k = c[2];
      c = c[3];
      var p, t, h;
      t = f * l + e * n + g * k + b * c;
      0 > t && ((t = -t), (l = -l), (n = -n), (k = -k), (c = -c));
      1e-6 < 1 - t
        ? ((p = Math.acos(t)),
          (h = Math.sin(p)),
          (t = Math.sin((1 - d) * p) / h),
          (d = Math.sin(d * p) / h))
        : (t = 1 - d);
      a[0] = t * f + d * l;
      a[1] = t * e + d * n;
      a[2] = t * g + d * k;
      a[3] = t * b + d * c;
      return a;
    };
    l.invert = function (a, b) {
      var c = b[0],
        d = b[1],
        f = b[2];
      b = b[3];
      var e = c * c + d * d + f * f + b * b,
        e = e ? 1 / e : 0;
      a[0] = -c * e;
      a[1] = -d * e;
      a[2] = -f * e;
      a[3] = b * e;
      return a;
    };
    l.conjugate = function (a, b) {
      a[0] = -b[0];
      a[1] = -b[1];
      a[2] = -b[2];
      a[3] = b[3];
      return a;
    };
    l.length = k.length;
    l.len = l.length;
    l.squaredLength = k.squaredLength;
    l.sqrLen = l.squaredLength;
    l.normalize = k.normalize;
    l.fromMat3 = (function () {
      var a =
        "undefined" !== typeof Int8Array ? new Int8Array([1, 2, 0]) : [1, 2, 0];
      return function (b, c) {
        var d = c[0] + c[4] + c[8];
        if (0 < d)
          ((d = Math.sqrt(d + 1)),
            (b[3] = 0.5 * d),
            (d = 0.5 / d),
            (b[0] = (c[7] - c[5]) * d),
            (b[1] = (c[2] - c[6]) * d),
            (b[2] = (c[3] - c[1]) * d));
        else {
          var f = 0;
          c[4] > c[0] && (f = 1);
          c[8] > c[3 * f + f] && (f = 2);
          var e = a[f],
            g = a[e],
            d = Math.sqrt(c[3 * f + f] - c[3 * e + e] - c[3 * g + g] + 1);
          b[f] = 0.5 * d;
          d = 0.5 / d;
          b[3] = (c[3 * g + e] - c[3 * e + g]) * d;
          b[e] = (c[3 * e + f] + c[3 * f + e]) * d;
          b[g] = (c[3 * g + f] + c[3 * f + g]) * d;
        }
        return b;
      };
    })();
    l.str = function (a) {
      return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
    };
    "undefined" !== typeof a && (a.quat = l);
  })(b);
})(this);
