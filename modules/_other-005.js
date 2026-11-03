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
    var t = {
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
    t.sub = t.subtract;
    t.multiply = function (a, b, c) {
      a[0] = b[0] * c[0];
      a[1] = b[1] * c[1];
      return a;
    };
    t.mul = t.multiply;
    t.divide = function (a, b, c) {
      a[0] = b[0] / c[0];
      a[1] = b[1] / c[1];
      return a;
    };
    t.div = t.divide;
    t.min = function (a, b, c) {
      a[0] = Math.min(b[0], c[0]);
      a[1] = Math.min(b[1], c[1]);
      return a;
    };
    t.max = function (a, b, c) {
      a[0] = Math.max(b[0], c[0]);
      a[1] = Math.max(b[1], c[1]);
      return a;
    };
    t.scale = function (a, b, c) {
      a[0] = b[0] * c;
      a[1] = b[1] * c;
      return a;
    };
    t.scaleAndAdd = function (a, b, c, d) {
      a[0] = b[0] + c[0] * d;
      a[1] = b[1] + c[1] * d;
      return a;
    };
    t.distance = function (a, b) {
      var c = b[0] - a[0];
      a = b[1] - a[1];
      return Math.sqrt(c * c + a * a);
    };
    t.dist = t.distance;
    t.squaredDistance = function (a, b) {
      var c = b[0] - a[0];
      a = b[1] - a[1];
      return c * c + a * a;
    };
    t.sqrDist = t.squaredDistance;
    t.length = function (a) {
      var b = a[0];
      a = a[1];
      return Math.sqrt(b * b + a * a);
    };
    t.len = t.length;
    t.squaredLength = function (a) {
      var b = a[0];
      a = a[1];
      return b * b + a * a;
    };
    t.sqrLen = t.squaredLength;
    t.negate = function (a, b) {
      a[0] = -b[0];
      a[1] = -b[1];
      return a;
    };
    t.normalize = function (a, b) {
      var c = b[0],
        d = b[1],
        c = c * c + d * d;
      0 < c && ((c = 1 / Math.sqrt(c)), (a[0] = b[0] * c), (a[1] = b[1] * c));
      return a;
    };
    t.dot = function (a, b) {
      return a[0] * b[0] + a[1] * b[1];
    };
    t.cross = function (a, b, c) {
      b = b[0] * c[1] - b[1] * c[0];
      a[0] = a[1] = 0;
      a[2] = b;
      return a;
    };
    t.lerp = function (a, b, c, d) {
      var f = b[0];
      b = b[1];
      a[0] = f + d * (c[0] - f);
      a[1] = b + d * (c[1] - b);
      return a;
    };
    t.random = function (a, b) {
      b = b || 1;
      var c = 2 * m() * Math.PI;
      a[0] = Math.cos(c) * b;
      a[1] = Math.sin(c) * b;
      return a;
    };
    t.transformMat2 = function (a, b, c) {
      var d = b[0];
      b = b[1];
      a[0] = c[0] * d + c[2] * b;
      a[1] = c[1] * d + c[3] * b;
      return a;
    };
    t.transformMat2d = function (a, b, c) {
      var d = b[0];
      b = b[1];
      a[0] = c[0] * d + c[2] * b + c[4];
      a[1] = c[1] * d + c[3] * b + c[5];
      return a;
    };
    t.transformMat3 = function (a, b, c) {
      var d = b[0];
      b = b[1];
      a[0] = c[0] * d + c[3] * b + c[6];
      a[1] = c[1] * d + c[4] * b + c[7];
      return a;
    };
    t.transformMat4 = function (a, b, c) {
      var d = b[0];
      b = b[1];
      a[0] = c[0] * d + c[4] * b + c[12];
      a[1] = c[1] * d + c[5] * b + c[13];
      return a;
    };
    t.forEach = (function () {
      var a = t.create();
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
    t.str = function (a) {
      return "vec2(" + a[0] + ", " + a[1] + ")";
    };
    "undefined" !== typeof a && (a.vec2 = t);
    var r = {
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
    r.sub = r.subtract;
    r.multiply = function (a, b, c) {
      a[0] = b[0] * c[0];
      a[1] = b[1] * c[1];
      a[2] = b[2] * c[2];
      return a;
    };
    r.mul = r.multiply;
    r.divide = function (a, b, c) {
      a[0] = b[0] / c[0];
      a[1] = b[1] / c[1];
      a[2] = b[2] / c[2];
      return a;
    };
    r.div = r.divide;
    r.min = function (a, b, c) {
      a[0] = Math.min(b[0], c[0]);
      a[1] = Math.min(b[1], c[1]);
      a[2] = Math.min(b[2], c[2]);
      return a;
    };
    r.max = function (a, b, c) {
      a[0] = Math.max(b[0], c[0]);
      a[1] = Math.max(b[1], c[1]);
      a[2] = Math.max(b[2], c[2]);
      return a;
    };
    r.scale = function (a, b, c) {
      a[0] = b[0] * c;
      a[1] = b[1] * c;
      a[2] = b[2] * c;
      return a;
    };
    r.scaleAndAdd = function (a, b, c, d) {
      a[0] = b[0] + c[0] * d;
      a[1] = b[1] + c[1] * d;
      a[2] = b[2] + c[2] * d;
      return a;
    };
    r.distance = function (a, b) {
      var c = b[0] - a[0],
        d = b[1] - a[1];
      a = b[2] - a[2];
      return Math.sqrt(c * c + d * d + a * a);
    };
    r.dist = r.distance;
    r.squaredDistance = function (a, b) {
      var c = b[0] - a[0],
        d = b[1] - a[1];
      a = b[2] - a[2];
      return c * c + d * d + a * a;
    };
    r.sqrDist = r.squaredDistance;
    r.length = function (a) {
      var b = a[0],
        c = a[1];
      a = a[2];
      return Math.sqrt(b * b + c * c + a * a);
    };
    r.len = r.length;
    r.squaredLength = function (a) {
      var b = a[0],
        c = a[1];
      a = a[2];
      return b * b + c * c + a * a;
    };
    r.sqrLen = r.squaredLength;
    r.negate = function (a, b) {
      a[0] = -b[0];
      a[1] = -b[1];
      a[2] = -b[2];
      return a;
    };
    r.normalize = function (a, b) {
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
    r.dot = function (a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    };
    r.cross = function (a, b, c) {
      var d = b[0],
        f = b[1];
      b = b[2];
      var k = c[0],
        e = c[1];
      c = c[2];
      a[0] = f * c - b * e;
      a[1] = b * k - d * c;
      a[2] = d * e - f * k;
      return a;
    };
    r.lerp = function (a, b, c, d) {
      var f = b[0],
        k = b[1];
      b = b[2];
      a[0] = f + d * (c[0] - f);
      a[1] = k + d * (c[1] - k);
      a[2] = b + d * (c[2] - b);
      return a;
    };
    r.random = function (a, b) {
      b = b || 1;
      var c = 2 * m() * Math.PI,
        d = 2 * m() - 1,
        f = Math.sqrt(1 - d * d) * b;
      a[0] = Math.cos(c) * f;
      a[1] = Math.sin(c) * f;
      a[2] = d * b;
      return a;
    };
    r.transformMat4 = function (a, b, c) {
      var d = b[0],
        f = b[1];
      b = b[2];
      a[0] = c[0] * d + c[4] * f + c[8] * b + c[12];
      a[1] = c[1] * d + c[5] * f + c[9] * b + c[13];
      a[2] = c[2] * d + c[6] * f + c[10] * b + c[14];
      return a;
    };
    r.transformMat3 = function (a, b, c) {
      var d = b[0],
        f = b[1];
      b = b[2];
      a[0] = d * c[0] + f * c[3] + b * c[6];
      a[1] = d * c[1] + f * c[4] + b * c[7];
      a[2] = d * c[2] + f * c[5] + b * c[8];
      return a;
    };
    r.transformQuat = function (a, b, c) {
      var d = b[0],
        f = b[1],
        k = b[2];
      b = c[0];
      var e = c[1],
        q = c[2];
      c = c[3];
      var g = c * d + e * k - q * f,
        l = c * f + q * d - b * k,
        p = c * k + b * f - e * d,
        d = -b * d - e * f - q * k;
      a[0] = g * c + d * -b + l * -q - p * -e;
      a[1] = l * c + d * -e + p * -b - g * -q;
      a[2] = p * c + d * -q + g * -e - l * -b;
      return a;
    };
    r.forEach = (function () {
      var a = r.create();
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
    r.str = function (a) {
      return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
    };
    "undefined" !== typeof a && (a.vec3 = r);
    var n = {
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
    n.sub = n.subtract;
    n.multiply = function (a, b, c) {
      a[0] = b[0] * c[0];
      a[1] = b[1] * c[1];
      a[2] = b[2] * c[2];
      a[3] = b[3] * c[3];
      return a;
    };
    n.mul = n.multiply;
    n.divide = function (a, b, c) {
      a[0] = b[0] / c[0];
      a[1] = b[1] / c[1];
      a[2] = b[2] / c[2];
      a[3] = b[3] / c[3];
      return a;
    };
    n.div = n.divide;
    n.min = function (a, b, c) {
      a[0] = Math.min(b[0], c[0]);
      a[1] = Math.min(b[1], c[1]);
      a[2] = Math.min(b[2], c[2]);
      a[3] = Math.min(b[3], c[3]);
      return a;
    };
    n.max = function (a, b, c) {
      a[0] = Math.max(b[0], c[0]);
      a[1] = Math.max(b[1], c[1]);
      a[2] = Math.max(b[2], c[2]);
      a[3] = Math.max(b[3], c[3]);
      return a;
    };
    n.scale = function (a, b, c) {
      a[0] = b[0] * c;
      a[1] = b[1] * c;
      a[2] = b[2] * c;
      a[3] = b[3] * c;
      return a;
    };
    n.scaleAndAdd = function (a, b, c, d) {
      a[0] = b[0] + c[0] * d;
      a[1] = b[1] + c[1] * d;
      a[2] = b[2] + c[2] * d;
      a[3] = b[3] + c[3] * d;
      return a;
    };
    n.distance = function (a, b) {
      var c = b[0] - a[0],
        d = b[1] - a[1],
        f = b[2] - a[2];
      a = b[3] - a[3];
      return Math.sqrt(c * c + d * d + f * f + a * a);
    };
    n.dist = n.distance;
    n.squaredDistance = function (a, b) {
      var c = b[0] - a[0],
        d = b[1] - a[1],
        f = b[2] - a[2];
      a = b[3] - a[3];
      return c * c + d * d + f * f + a * a;
    };
    n.sqrDist = n.squaredDistance;
    n.length = function (a) {
      var b = a[0],
        c = a[1],
        d = a[2];
      a = a[3];
      return Math.sqrt(b * b + c * c + d * d + a * a);
    };
    n.len = n.length;
    n.squaredLength = function (a) {
      var b = a[0],
        c = a[1],
        d = a[2];
      a = a[3];
      return b * b + c * c + d * d + a * a;
    };
    n.sqrLen = n.squaredLength;
    n.negate = function (a, b) {
      a[0] = -b[0];
      a[1] = -b[1];
      a[2] = -b[2];
      a[3] = -b[3];
      return a;
    };
    n.normalize = function (a, b) {
      var c = b[0],
        d = b[1],
        f = b[2],
        k = b[3],
        c = c * c + d * d + f * f + k * k;
      0 < c &&
        ((c = 1 / Math.sqrt(c)),
        (a[0] = b[0] * c),
        (a[1] = b[1] * c),
        (a[2] = b[2] * c),
        (a[3] = b[3] * c));
      return a;
    };
    n.dot = function (a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    };
    n.lerp = function (a, b, c, d) {
      var f = b[0],
        k = b[1],
        e = b[2];
      b = b[3];
      a[0] = f + d * (c[0] - f);
      a[1] = k + d * (c[1] - k);
      a[2] = e + d * (c[2] - e);
      a[3] = b + d * (c[3] - b);
      return a;
    };
    n.random = function (a, b) {
      b = b || 1;
      a[0] = m();
      a[1] = m();
      a[2] = m();
      a[3] = m();
      n.normalize(a, a);
      n.scale(a, a, b);
      return a;
    };
    n.transformMat4 = function (a, b, c) {
      var d = b[0],
        f = b[1],
        k = b[2];
      b = b[3];
      a[0] = c[0] * d + c[4] * f + c[8] * k + c[12] * b;
      a[1] = c[1] * d + c[5] * f + c[9] * k + c[13] * b;
      a[2] = c[2] * d + c[6] * f + c[10] * k + c[14] * b;
      a[3] = c[3] * d + c[7] * f + c[11] * k + c[15] * b;
      return a;
    };
    n.transformQuat = function (a, b, c) {
      var d = b[0],
        f = b[1],
        k = b[2];
      b = c[0];
      var e = c[1],
        g = c[2];
      c = c[3];
      var q = c * d + e * k - g * f,
        l = c * f + g * d - b * k,
        p = c * k + b * f - e * d,
        d = -b * d - e * f - g * k;
      a[0] = q * c + d * -b + l * -g - p * -e;
      a[1] = l * c + d * -e + p * -b - q * -g;
      a[2] = p * c + d * -g + q * -e - l * -b;
      return a;
    };
    n.forEach = (function () {
      var a = n.create();
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
    n.str = function (a) {
      return "vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
    };
    "undefined" !== typeof a && (a.vec4 = n);
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
        var k = c * b - f * d;
        if (!k) return null;
        k = 1 / k;
        a[0] = b * k;
        a[1] = -d * k;
        a[2] = -f * k;
        a[3] = c * k;
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
          k = b[2];
        b = b[3];
        var e = c[0],
          g = c[1],
          q = c[2];
        c = c[3];
        a[0] = d * e + f * q;
        a[1] = d * g + f * c;
        a[2] = k * e + b * q;
        a[3] = k * g + b * c;
        return a;
      },
    };
    h.mul = h.multiply;
    h.rotate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        k = b[2];
      b = b[3];
      var e = Math.sin(c);
      c = Math.cos(c);
      a[0] = d * c + f * e;
      a[1] = d * -e + f * c;
      a[2] = k * c + b * e;
      a[3] = k * -e + b * c;
      return a;
    };
    h.scale = function (a, b, c) {
      var d = b[1],
        f = b[2],
        k = b[3],
        e = c[0];
      c = c[1];
      a[0] = b[0] * e;
      a[1] = d * c;
      a[2] = f * e;
      a[3] = k * c;
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
          k = b[4];
        b = b[5];
        var g = c * e - d * f;
        if (!g) return null;
        g = 1 / g;
        a[0] = e * g;
        a[1] = -d * g;
        a[2] = -f * g;
        a[3] = c * g;
        a[4] = (f * b - e * k) * g;
        a[5] = (d * k - c * b) * g;
        return a;
      },
      determinant: function (a) {
        return a[0] * a[3] - a[1] * a[2];
      },
      multiply: function (a, b, c) {
        var d = b[0],
          f = b[1],
          e = b[2],
          k = b[3],
          g = b[4];
        b = b[5];
        var q = c[0],
          l = c[1],
          p = c[2],
          n = c[3],
          h = c[4];
        c = c[5];
        a[0] = d * q + f * p;
        a[1] = d * l + f * n;
        a[2] = e * q + k * p;
        a[3] = e * l + k * n;
        a[4] = q * g + p * b + h;
        a[5] = l * g + n * b + c;
        return a;
      },
    };
    h.mul = h.multiply;
    h.rotate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        k = b[3],
        g = b[4];
      b = b[5];
      var q = Math.sin(c);
      c = Math.cos(c);
      a[0] = d * c + f * q;
      a[1] = -d * q + f * c;
      a[2] = e * c + k * q;
      a[3] = -e * q + c * k;
      a[4] = c * g + q * b;
      a[5] = c * b - q * g;
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
          k = b[4],
          g = b[5],
          l = b[6],
          p = b[7];
        b = b[8];
        var n = b * k - g * p,
          h = -b * e + g * l,
          m = p * e - k * l,
          r = c * n + d * h + f * m;
        if (!r) return null;
        r = 1 / r;
        a[0] = n * r;
        a[1] = (-b * d + f * p) * r;
        a[2] = (g * d - f * k) * r;
        a[3] = h * r;
        a[4] = (b * c - f * l) * r;
        a[5] = (-g * c + f * e) * r;
        a[6] = m * r;
        a[7] = (-p * c + d * l) * r;
        a[8] = (k * c - d * e) * r;
        return a;
      },
      adjoint: function (a, b) {
        var c = b[0],
          d = b[1],
          f = b[2],
          e = b[3],
          k = b[4],
          g = b[5],
          l = b[6],
          p = b[7];
        b = b[8];
        a[0] = k * b - g * p;
        a[1] = f * p - d * b;
        a[2] = d * g - f * k;
        a[3] = g * l - e * b;
        a[4] = c * b - f * l;
        a[5] = f * e - c * g;
        a[6] = e * p - k * l;
        a[7] = d * l - c * p;
        a[8] = c * k - d * e;
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
          k = b[3],
          g = b[4],
          q = b[5],
          l = b[6],
          p = b[7];
        b = b[8];
        var n = c[0],
          h = c[1],
          m = c[2],
          r = c[3],
          t = c[4],
          K = c[5],
          E = c[6],
          F = c[7];
        c = c[8];
        a[0] = n * d + h * k + m * l;
        a[1] = n * f + h * g + m * p;
        a[2] = n * e + h * q + m * b;
        a[3] = r * d + t * k + K * l;
        a[4] = r * f + t * g + K * p;
        a[5] = r * e + t * q + K * b;
        a[6] = E * d + F * k + c * l;
        a[7] = E * f + F * g + c * p;
        a[8] = E * e + F * q + c * b;
        return a;
      },
    };
    g.mul = g.multiply;
    g.translate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        k = b[3],
        g = b[4],
        q = b[5],
        l = b[6],
        p = b[7];
      b = b[8];
      var n = c[0];
      c = c[1];
      a[0] = d;
      a[1] = f;
      a[2] = e;
      a[3] = k;
      a[4] = g;
      a[5] = q;
      a[6] = n * d + c * k + l;
      a[7] = n * f + c * g + p;
      a[8] = n * e + c * q + b;
      return a;
    };
    g.rotate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        k = b[3],
        g = b[4],
        q = b[5],
        l = b[6],
        p = b[7];
      b = b[8];
      var n = Math.sin(c);
      c = Math.cos(c);
      a[0] = c * d + n * k;
      a[1] = c * f + n * g;
      a[2] = c * e + n * q;
      a[3] = c * k - n * d;
      a[4] = c * g - n * f;
      a[5] = c * q - n * e;
      a[6] = l;
      a[7] = p;
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
        k = c + c,
        g = d + d,
        l = f + f;
      b = c * k;
      var p = c * g,
        c = c * l,
        n = d * g,
        d = d * l,
        f = f * l,
        k = e * k,
        g = e * g,
        e = e * l;
      a[0] = 1 - (n + f);
      a[3] = p + e;
      a[6] = c - g;
      a[1] = p - e;
      a[4] = 1 - (b + f);
      a[7] = d + k;
      a[2] = c + g;
      a[5] = d - k;
      a[8] = 1 - (b + n);
      return a;
    };
    g.normalFromMat4 = function (a, b) {
      var c = b[0],
        d = b[1],
        f = b[2],
        e = b[3],
        k = b[4],
        g = b[5],
        l = b[6],
        p = b[7],
        n = b[8],
        h = b[9],
        m = b[10],
        r = b[11],
        t = b[12],
        x = b[13],
        K = b[14];
      b = b[15];
      var E = c * g - d * k,
        F = c * l - f * k,
        z = c * p - e * k,
        G = d * l - f * g,
        L = d * p - e * g,
        M = f * p - e * l,
        Q = n * x - h * t,
        V = n * K - m * t,
        n = n * b - r * t,
        W = h * K - m * x,
        h = h * b - r * x,
        m = m * b - r * K,
        r = E * m - F * h + z * W + G * n - L * V + M * Q;
      if (!r) return null;
      r = 1 / r;
      a[0] = (g * m - l * h + p * W) * r;
      a[1] = (l * n - k * m - p * V) * r;
      a[2] = (k * h - g * n + p * Q) * r;
      a[3] = (f * h - d * m - e * W) * r;
      a[4] = (c * m - f * n + e * V) * r;
      a[5] = (d * n - c * h - e * Q) * r;
      a[6] = (x * M - K * L + b * G) * r;
      a[7] = (K * z - t * M - b * F) * r;
      a[8] = (t * L - x * z + b * E) * r;
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
    var p = {
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
            k = b[7],
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
          a[13] = k;
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
          k = b[4],
          g = b[5],
          l = b[6],
          p = b[7],
          n = b[8],
          h = b[9],
          m = b[10],
          r = b[11],
          t = b[12],
          x = b[13],
          K = b[14];
        b = b[15];
        var E = c * g - d * k,
          F = c * l - f * k,
          z = c * p - e * k,
          G = d * l - f * g,
          L = d * p - e * g,
          M = f * p - e * l,
          Q = n * x - h * t,
          V = n * K - m * t,
          W = n * b - r * t,
          ba = h * K - m * x,
          S = h * b - r * x,
          T = m * b - r * K,
          da = E * T - F * S + z * ba + G * W - L * V + M * Q;
        if (!da) return null;
        da = 1 / da;
        a[0] = (g * T - l * S + p * ba) * da;
        a[1] = (f * S - d * T - e * ba) * da;
        a[2] = (x * M - K * L + b * G) * da;
        a[3] = (m * L - h * M - r * G) * da;
        a[4] = (l * W - k * T - p * V) * da;
        a[5] = (c * T - f * W + e * V) * da;
        a[6] = (K * z - t * M - b * F) * da;
        a[7] = (n * M - m * z + r * F) * da;
        a[8] = (k * S - g * W + p * Q) * da;
        a[9] = (d * W - c * S - e * Q) * da;
        a[10] = (t * L - x * z + b * E) * da;
        a[11] = (h * z - n * L - r * E) * da;
        a[12] = (g * V - k * ba - l * Q) * da;
        a[13] = (c * ba - d * V + f * Q) * da;
        a[14] = (x * F - t * G - K * E) * da;
        a[15] = (n * G - h * F + m * E) * da;
        return a;
      },
      adjoint: function (a, b) {
        var c = b[0],
          d = b[1],
          f = b[2],
          e = b[3],
          g = b[4],
          k = b[5],
          l = b[6],
          p = b[7],
          n = b[8],
          h = b[9],
          m = b[10],
          r = b[11],
          t = b[12],
          x = b[13],
          K = b[14];
        b = b[15];
        a[0] = k * (m * b - r * K) - h * (l * b - p * K) + x * (l * r - p * m);
        a[1] = -(
          d * (m * b - r * K) -
          h * (f * b - e * K) +
          x * (f * r - e * m)
        );
        a[2] = d * (l * b - p * K) - k * (f * b - e * K) + x * (f * p - e * l);
        a[3] = -(
          d * (l * r - p * m) -
          k * (f * r - e * m) +
          h * (f * p - e * l)
        );
        a[4] = -(
          g * (m * b - r * K) -
          n * (l * b - p * K) +
          t * (l * r - p * m)
        );
        a[5] = c * (m * b - r * K) - n * (f * b - e * K) + t * (f * r - e * m);
        a[6] = -(
          c * (l * b - p * K) -
          g * (f * b - e * K) +
          t * (f * p - e * l)
        );
        a[7] = c * (l * r - p * m) - g * (f * r - e * m) + n * (f * p - e * l);
        a[8] = g * (h * b - r * x) - n * (k * b - p * x) + t * (k * r - p * h);
        a[9] = -(
          c * (h * b - r * x) -
          n * (d * b - e * x) +
          t * (d * r - e * h)
        );
        a[10] = c * (k * b - p * x) - g * (d * b - e * x) + t * (d * p - e * k);
        a[11] = -(
          c * (k * r - p * h) -
          g * (d * r - e * h) +
          n * (d * p - e * k)
        );
        a[12] = -(
          g * (h * K - m * x) -
          n * (k * K - l * x) +
          t * (k * m - l * h)
        );
        a[13] = c * (h * K - m * x) - n * (d * K - f * x) + t * (d * m - f * h);
        a[14] = -(
          c * (k * K - l * x) -
          g * (d * K - f * x) +
          t * (d * l - f * k)
        );
        a[15] = c * (k * m - l * h) - g * (d * m - f * h) + n * (d * l - f * k);
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
          p = a[7],
          n = a[8],
          h = a[9],
          m = a[10],
          r = a[11],
          t = a[12],
          I = a[13],
          x = a[14];
        a = a[15];
        return (
          (b * g - c * e) * (m * a - r * x) -
          (b * l - d * e) * (h * a - r * I) +
          (b * p - f * e) * (h * x - m * I) +
          (c * l - d * g) * (n * a - r * t) -
          (c * p - f * g) * (n * x - m * t) +
          (d * p - f * l) * (n * I - h * t)
        );
      },
      multiply: function (a, b, c) {
        var d = b[0],
          f = b[1],
          e = b[2],
          g = b[3],
          k = b[4],
          l = b[5],
          q = b[6],
          p = b[7],
          n = b[8],
          h = b[9],
          m = b[10],
          r = b[11],
          t = b[12],
          K = b[13],
          E = b[14];
        b = b[15];
        var F = c[0],
          z = c[1],
          G = c[2],
          L = c[3];
        a[0] = F * d + z * k + G * n + L * t;
        a[1] = F * f + z * l + G * h + L * K;
        a[2] = F * e + z * q + G * m + L * E;
        a[3] = F * g + z * p + G * r + L * b;
        F = c[4];
        z = c[5];
        G = c[6];
        L = c[7];
        a[4] = F * d + z * k + G * n + L * t;
        a[5] = F * f + z * l + G * h + L * K;
        a[6] = F * e + z * q + G * m + L * E;
        a[7] = F * g + z * p + G * r + L * b;
        F = c[8];
        z = c[9];
        G = c[10];
        L = c[11];
        a[8] = F * d + z * k + G * n + L * t;
        a[9] = F * f + z * l + G * h + L * K;
        a[10] = F * e + z * q + G * m + L * E;
        a[11] = F * g + z * p + G * r + L * b;
        F = c[12];
        z = c[13];
        G = c[14];
        L = c[15];
        a[12] = F * d + z * k + G * n + L * t;
        a[13] = F * f + z * l + G * h + L * K;
        a[14] = F * e + z * q + G * m + L * E;
        a[15] = F * g + z * p + G * r + L * b;
        return a;
      },
    };
    p.mul = p.multiply;
    p.translate = function (a, b, c) {
      var d = c[0],
        f = c[1];
      c = c[2];
      var e, g, k, l, p, q, n, h, m, r, t, K;
      b === a
        ? ((a[12] = b[0] * d + b[4] * f + b[8] * c + b[12]),
          (a[13] = b[1] * d + b[5] * f + b[9] * c + b[13]),
          (a[14] = b[2] * d + b[6] * f + b[10] * c + b[14]),
          (a[15] = b[3] * d + b[7] * f + b[11] * c + b[15]))
        : ((e = b[0]),
          (g = b[1]),
          (k = b[2]),
          (l = b[3]),
          (p = b[4]),
          (q = b[5]),
          (n = b[6]),
          (h = b[7]),
          (m = b[8]),
          (r = b[9]),
          (t = b[10]),
          (K = b[11]),
          (a[0] = e),
          (a[1] = g),
          (a[2] = k),
          (a[3] = l),
          (a[4] = p),
          (a[5] = q),
          (a[6] = n),
          (a[7] = h),
          (a[8] = m),
          (a[9] = r),
          (a[10] = t),
          (a[11] = K),
          (a[12] = e * d + p * f + m * c + b[12]),
          (a[13] = g * d + q * f + r * c + b[13]),
          (a[14] = k * d + n * f + t * c + b[14]),
          (a[15] = l * d + h * f + K * c + b[15]));
      return a;
    };
    p.scale = function (a, b, c) {
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
    p.rotate = function (a, c, d, e) {
      var f = e[0],
        g = e[1];
      e = e[2];
      var k = Math.sqrt(f * f + g * g + e * e),
        l,
        p,
        q,
        n,
        h,
        u,
        m,
        r,
        t,
        K,
        E,
        F,
        z,
        G,
        L,
        M,
        Q,
        V,
        W,
        ba;
      if (Math.abs(k) < b) return null;
      k = 1 / k;
      f *= k;
      g *= k;
      e *= k;
      l = Math.sin(d);
      p = Math.cos(d);
      q = 1 - p;
      d = c[0];
      k = c[1];
      n = c[2];
      h = c[3];
      u = c[4];
      m = c[5];
      r = c[6];
      t = c[7];
      K = c[8];
      E = c[9];
      F = c[10];
      z = c[11];
      G = f * f * q + p;
      L = g * f * q + e * l;
      M = e * f * q - g * l;
      Q = f * g * q - e * l;
      V = g * g * q + p;
      W = e * g * q + f * l;
      ba = f * e * q + g * l;
      f = g * e * q - f * l;
      g = e * e * q + p;
      a[0] = d * G + u * L + K * M;
      a[1] = k * G + m * L + E * M;
      a[2] = n * G + r * L + F * M;
      a[3] = h * G + t * L + z * M;
      a[4] = d * Q + u * V + K * W;
      a[5] = k * Q + m * V + E * W;
      a[6] = n * Q + r * V + F * W;
      a[7] = h * Q + t * V + z * W;
      a[8] = d * ba + u * f + K * g;
      a[9] = k * ba + m * f + E * g;
      a[10] = n * ba + r * f + F * g;
      a[11] = h * ba + t * f + z * g;
      c !== a &&
        ((a[12] = c[12]), (a[13] = c[13]), (a[14] = c[14]), (a[15] = c[15]));
      return a;
    };
    p.rotateX = function (a, b, c) {
      var d = Math.sin(c);
      c = Math.cos(c);
      var f = b[4],
        e = b[5],
        g = b[6],
        k = b[7],
        l = b[8],
        p = b[9],
        q = b[10],
        n = b[11];
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
      a[6] = g * c + q * d;
      a[7] = k * c + n * d;
      a[8] = l * c - f * d;
      a[9] = p * c - e * d;
      a[10] = q * c - g * d;
      a[11] = n * c - k * d;
      return a;
    };
    p.rotateY = function (a, b, c) {
      var d = Math.sin(c);
      c = Math.cos(c);
      var f = b[0],
        e = b[1],
        g = b[2],
        k = b[3],
        l = b[8],
        p = b[9],
        q = b[10],
        n = b[11];
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
      a[2] = g * c - q * d;
      a[3] = k * c - n * d;
      a[8] = f * d + l * c;
      a[9] = e * d + p * c;
      a[10] = g * d + q * c;
      a[11] = k * d + n * c;
      return a;
    };
    p.rotateZ = function (a, b, c) {
      var d = Math.sin(c);
      c = Math.cos(c);
      var f = b[0],
        e = b[1],
        g = b[2],
        k = b[3],
        l = b[4],
        p = b[5],
        q = b[6],
        n = b[7];
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
      a[1] = e * c + p * d;
      a[2] = g * c + q * d;
      a[3] = k * c + n * d;
      a[4] = l * c - f * d;
      a[5] = p * c - e * d;
      a[6] = q * c - g * d;
      a[7] = n * c - k * d;
      return a;
    };
    p.fromRotationTranslation = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        g = b[3],
        k = d + d,
        l = f + f,
        p = e + e;
      b = d * k;
      var q = d * l,
        d = d * p,
        n = f * l,
        f = f * p,
        e = e * p,
        k = g * k,
        l = g * l,
        g = g * p;
      a[0] = 1 - (n + e);
      a[1] = q + g;
      a[2] = d - l;
      a[3] = 0;
      a[4] = q - g;
      a[5] = 1 - (b + e);
      a[6] = f + k;
      a[7] = 0;
      a[8] = d + l;
      a[9] = f - k;
      a[10] = 1 - (b + n);
      a[11] = 0;
      a[12] = c[0];
      a[13] = c[1];
      a[14] = c[2];
      a[15] = 1;
      return a;
    };
    p.fromQuat = function (a, b) {
      var c = b[0],
        d = b[1],
        f = b[2],
        e = b[3],
        g = c + c,
        k = d + d,
        l = f + f;
      b = c * g;
      var p = c * k,
        c = c * l,
        n = d * k,
        d = d * l,
        f = f * l,
        g = e * g,
        k = e * k,
        e = e * l;
      a[0] = 1 - (n + f);
      a[1] = p + e;
      a[2] = c - k;
      a[3] = 0;
      a[4] = p - e;
      a[5] = 1 - (b + f);
      a[6] = d + g;
      a[7] = 0;
      a[8] = c + k;
      a[9] = d - g;
      a[10] = 1 - (b + n);
      a[11] = 0;
      a[12] = 0;
      a[13] = 0;
      a[14] = 0;
      a[15] = 1;
      return a;
    };
    p.frustum = function (a, b, c, d, e, g, l) {
      var f = 1 / (c - b),
        k = 1 / (e - d),
        p = 1 / (g - l);
      a[0] = 2 * g * f;
      a[1] = 0;
      a[2] = 0;
      a[3] = 0;
      a[4] = 0;
      a[5] = 2 * g * k;
      a[6] = 0;
      a[7] = 0;
      a[8] = (c + b) * f;
      a[9] = (e + d) * k;
      a[10] = (l + g) * p;
      a[11] = -1;
      a[12] = 0;
      a[13] = 0;
      a[14] = l * g * 2 * p;
      a[15] = 0;
      return a;
    };
    p.perspective = function (a, b, c, d, e) {
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
    p.ortho = function (a, b, c, d, e, g, l) {
      var f = 1 / (b - c),
        k = 1 / (d - e),
        p = 1 / (g - l);
      a[0] = -2 * f;
      a[1] = 0;
      a[2] = 0;
      a[3] = 0;
      a[4] = 0;
      a[5] = -2 * k;
      a[6] = 0;
      a[7] = 0;
      a[8] = 0;
      a[9] = 0;
      a[10] = 2 * p;
      a[11] = 0;
      a[12] = (b + c) * f;
      a[13] = (e + d) * k;
      a[14] = (l + g) * p;
      a[15] = 1;
      return a;
    };
    p.lookAt = function (a, c, d, e) {
      var f,
        g,
        k,
        l,
        q,
        n,
        h,
        u,
        m = c[0],
        r = c[1];
      c = c[2];
      k = e[0];
      l = e[1];
      g = e[2];
      h = d[0];
      e = d[1];
      f = d[2];
      if (Math.abs(m - h) < b && Math.abs(r - e) < b && Math.abs(c - f) < b)
        return p.identity(a);
      d = m - h;
      e = r - e;
      h = c - f;
      u = 1 / Math.sqrt(d * d + e * e + h * h);
      d *= u;
      e *= u;
      h *= u;
      f = l * h - g * e;
      g = g * d - k * h;
      k = k * e - l * d;
      (u = Math.sqrt(f * f + g * g + k * k))
        ? ((u = 1 / u), (f *= u), (g *= u), (k *= u))
        : (k = g = f = 0);
      l = e * k - h * g;
      q = h * f - d * k;
      n = d * g - e * f;
      (u = Math.sqrt(l * l + q * q + n * n))
        ? ((u = 1 / u), (l *= u), (q *= u), (n *= u))
        : (n = q = l = 0);
      a[0] = f;
      a[1] = l;
      a[2] = d;
      a[3] = 0;
      a[4] = g;
      a[5] = q;
      a[6] = e;
      a[7] = 0;
      a[8] = k;
      a[9] = n;
      a[10] = h;
      a[11] = 0;
      a[12] = -(f * m + g * r + k * c);
      a[13] = -(l * m + q * r + n * c);
      a[14] = -(d * m + e * r + h * c);
      a[15] = 1;
      return a;
    };
    p.str = function (a) {
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
    "undefined" !== typeof a && (a.mat4 = p);
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
      var a = r.create(),
        b = r.fromValues(1, 0, 0),
        c = r.fromValues(0, 1, 0);
      return function (d, f, e) {
        var g = r.dot(f, e);
        if (-0.999999 > g)
          return (
            r.cross(a, b, f),
            1e-6 > r.length(a) && r.cross(a, c, f),
            r.normalize(a, a),
            l.setAxisAngle(d, a, Math.PI),
            d
          );
        if (0.999999 < g)
          return ((d[0] = 0), (d[1] = 0), (d[2] = 0), (d[3] = 1), d);
        r.cross(a, f, e);
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
    l.clone = n.clone;
    l.fromValues = n.fromValues;
    l.copy = n.copy;
    l.set = n.set;
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
    l.add = n.add;
    l.multiply = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2];
      b = b[3];
      var g = c[0],
        k = c[1],
        l = c[2];
      c = c[3];
      a[0] = d * c + b * g + f * l - e * k;
      a[1] = f * c + b * k + e * g - d * l;
      a[2] = e * c + b * l + d * k - f * g;
      a[3] = b * c - d * g - f * k - e * l;
      return a;
    };
    l.mul = l.multiply;
    l.scale = n.scale;
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
    l.dot = n.dot;
    l.lerp = n.lerp;
    l.slerp = function (a, b, c, d) {
      var f = b[0],
        e = b[1],
        g = b[2];
      b = b[3];
      var l = c[0],
        k = c[1],
        p = c[2];
      c = c[3];
      var q, n, h;
      n = f * l + e * k + g * p + b * c;
      0 > n && ((n = -n), (l = -l), (k = -k), (p = -p), (c = -c));
      1e-6 < 1 - n
        ? ((q = Math.acos(n)),
          (h = Math.sin(q)),
          (n = Math.sin((1 - d) * q) / h),
          (d = Math.sin(d * q) / h))
        : (n = 1 - d);
      a[0] = n * f + d * l;
      a[1] = n * e + d * k;
      a[2] = n * g + d * p;
      a[3] = n * b + d * c;
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
    l.length = n.length;
    l.len = l.length;
    l.squaredLength = n.squaredLength;
    l.sqrLen = l.squaredLength;
    l.normalize = n.normalize;
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
