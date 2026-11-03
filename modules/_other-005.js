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
    if (!l) var l = Math.random;
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
      var c = 2 * l() * Math.PI;
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
    var t = {
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
    t.sub = t.subtract;
    t.multiply = function (a, b, c) {
      a[0] = b[0] * c[0];
      a[1] = b[1] * c[1];
      a[2] = b[2] * c[2];
      return a;
    };
    t.mul = t.multiply;
    t.divide = function (a, b, c) {
      a[0] = b[0] / c[0];
      a[1] = b[1] / c[1];
      a[2] = b[2] / c[2];
      return a;
    };
    t.div = t.divide;
    t.min = function (a, b, c) {
      a[0] = Math.min(b[0], c[0]);
      a[1] = Math.min(b[1], c[1]);
      a[2] = Math.min(b[2], c[2]);
      return a;
    };
    t.max = function (a, b, c) {
      a[0] = Math.max(b[0], c[0]);
      a[1] = Math.max(b[1], c[1]);
      a[2] = Math.max(b[2], c[2]);
      return a;
    };
    t.scale = function (a, b, c) {
      a[0] = b[0] * c;
      a[1] = b[1] * c;
      a[2] = b[2] * c;
      return a;
    };
    t.scaleAndAdd = function (a, b, c, d) {
      a[0] = b[0] + c[0] * d;
      a[1] = b[1] + c[1] * d;
      a[2] = b[2] + c[2] * d;
      return a;
    };
    t.distance = function (a, b) {
      var c = b[0] - a[0],
        d = b[1] - a[1];
      a = b[2] - a[2];
      return Math.sqrt(c * c + d * d + a * a);
    };
    t.dist = t.distance;
    t.squaredDistance = function (a, b) {
      var c = b[0] - a[0],
        d = b[1] - a[1];
      a = b[2] - a[2];
      return c * c + d * d + a * a;
    };
    t.sqrDist = t.squaredDistance;
    t.length = function (a) {
      var b = a[0],
        c = a[1];
      a = a[2];
      return Math.sqrt(b * b + c * c + a * a);
    };
    t.len = t.length;
    t.squaredLength = function (a) {
      var b = a[0],
        c = a[1];
      a = a[2];
      return b * b + c * c + a * a;
    };
    t.sqrLen = t.squaredLength;
    t.negate = function (a, b) {
      a[0] = -b[0];
      a[1] = -b[1];
      a[2] = -b[2];
      return a;
    };
    t.normalize = function (a, b) {
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
    t.dot = function (a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    };
    t.cross = function (a, b, c) {
      var d = b[0],
        f = b[1];
      b = b[2];
      var m = c[0],
        e = c[1];
      c = c[2];
      a[0] = f * c - b * e;
      a[1] = b * m - d * c;
      a[2] = d * e - f * m;
      return a;
    };
    t.lerp = function (a, b, c, d) {
      var f = b[0],
        m = b[1];
      b = b[2];
      a[0] = f + d * (c[0] - f);
      a[1] = m + d * (c[1] - m);
      a[2] = b + d * (c[2] - b);
      return a;
    };
    t.random = function (a, b) {
      b = b || 1;
      var c = 2 * l() * Math.PI,
        d = 2 * l() - 1,
        f = Math.sqrt(1 - d * d) * b;
      a[0] = Math.cos(c) * f;
      a[1] = Math.sin(c) * f;
      a[2] = d * b;
      return a;
    };
    t.transformMat4 = function (a, b, c) {
      var d = b[0],
        f = b[1];
      b = b[2];
      a[0] = c[0] * d + c[4] * f + c[8] * b + c[12];
      a[1] = c[1] * d + c[5] * f + c[9] * b + c[13];
      a[2] = c[2] * d + c[6] * f + c[10] * b + c[14];
      return a;
    };
    t.transformMat3 = function (a, b, c) {
      var d = b[0],
        f = b[1];
      b = b[2];
      a[0] = d * c[0] + f * c[3] + b * c[6];
      a[1] = d * c[1] + f * c[4] + b * c[7];
      a[2] = d * c[2] + f * c[5] + b * c[8];
      return a;
    };
    t.transformQuat = function (a, b, c) {
      var d = b[0],
        f = b[1],
        m = b[2];
      b = c[0];
      var e = c[1],
        q = c[2];
      c = c[3];
      var g = c * d + e * m - q * f,
        k = c * f + q * d - b * m,
        p = c * m + b * f - e * d,
        d = -b * d - e * f - q * m;
      a[0] = g * c + d * -b + k * -q - p * -e;
      a[1] = k * c + d * -e + p * -b - g * -q;
      a[2] = p * c + d * -q + g * -e - k * -b;
      return a;
    };
    t.forEach = (function () {
      var a = t.create();
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
    t.str = function (a) {
      return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
    };
    "undefined" !== typeof a && (a.vec3 = t);
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
        m = b[3],
        c = c * c + d * d + f * f + m * m;
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
        m = b[1],
        e = b[2];
      b = b[3];
      a[0] = f + d * (c[0] - f);
      a[1] = m + d * (c[1] - m);
      a[2] = e + d * (c[2] - e);
      a[3] = b + d * (c[3] - b);
      return a;
    };
    n.random = function (a, b) {
      b = b || 1;
      a[0] = l();
      a[1] = l();
      a[2] = l();
      a[3] = l();
      n.normalize(a, a);
      n.scale(a, a, b);
      return a;
    };
    n.transformMat4 = function (a, b, c) {
      var d = b[0],
        f = b[1],
        m = b[2];
      b = b[3];
      a[0] = c[0] * d + c[4] * f + c[8] * m + c[12] * b;
      a[1] = c[1] * d + c[5] * f + c[9] * m + c[13] * b;
      a[2] = c[2] * d + c[6] * f + c[10] * m + c[14] * b;
      a[3] = c[3] * d + c[7] * f + c[11] * m + c[15] * b;
      return a;
    };
    n.transformQuat = function (a, b, c) {
      var d = b[0],
        f = b[1],
        m = b[2];
      b = c[0];
      var e = c[1],
        g = c[2];
      c = c[3];
      var q = c * d + e * m - g * f,
        k = c * f + g * d - b * m,
        p = c * m + b * f - e * d,
        d = -b * d - e * f - g * m;
      a[0] = q * c + d * -b + k * -g - p * -e;
      a[1] = k * c + d * -e + p * -b - q * -g;
      a[2] = p * c + d * -g + q * -e - k * -b;
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
        var m = c * b - f * d;
        if (!m) return null;
        m = 1 / m;
        a[0] = b * m;
        a[1] = -d * m;
        a[2] = -f * m;
        a[3] = c * m;
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
          e = b[2];
        b = b[3];
        var m = c[0],
          g = c[1],
          q = c[2];
        c = c[3];
        a[0] = d * m + f * q;
        a[1] = d * g + f * c;
        a[2] = e * m + b * q;
        a[3] = e * g + b * c;
        return a;
      },
    };
    h.mul = h.multiply;
    h.rotate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2];
      b = b[3];
      var m = Math.sin(c);
      c = Math.cos(c);
      a[0] = d * c + f * m;
      a[1] = d * -m + f * c;
      a[2] = e * c + b * m;
      a[3] = e * -m + b * c;
      return a;
    };
    h.scale = function (a, b, c) {
      var d = b[1],
        f = b[2],
        e = b[3],
        m = c[0];
      c = c[1];
      a[0] = b[0] * m;
      a[1] = d * c;
      a[2] = f * m;
      a[3] = e * c;
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
          m = b[4];
        b = b[5];
        var g = c * e - d * f;
        if (!g) return null;
        g = 1 / g;
        a[0] = e * g;
        a[1] = -d * g;
        a[2] = -f * g;
        a[3] = c * g;
        a[4] = (f * b - e * m) * g;
        a[5] = (d * m - c * b) * g;
        return a;
      },
      determinant: function (a) {
        return a[0] * a[3] - a[1] * a[2];
      },
      multiply: function (a, b, c) {
        var d = b[0],
          f = b[1],
          e = b[2],
          m = b[3],
          g = b[4];
        b = b[5];
        var q = c[0],
          k = c[1],
          p = c[2],
          n = c[3],
          h = c[4];
        c = c[5];
        a[0] = d * q + f * p;
        a[1] = d * k + f * n;
        a[2] = e * q + m * p;
        a[3] = e * k + m * n;
        a[4] = q * g + p * b + h;
        a[5] = k * g + n * b + c;
        return a;
      },
    };
    h.mul = h.multiply;
    h.rotate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        m = b[3],
        g = b[4];
      b = b[5];
      var q = Math.sin(c);
      c = Math.cos(c);
      a[0] = d * c + f * q;
      a[1] = -d * q + f * c;
      a[2] = e * c + m * q;
      a[3] = -e * q + c * m;
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
          m = b[4],
          g = b[5],
          k = b[6],
          p = b[7];
        b = b[8];
        var n = b * m - g * p,
          h = -b * e + g * k,
          l = p * e - m * k,
          t = c * n + d * h + f * l;
        if (!t) return null;
        t = 1 / t;
        a[0] = n * t;
        a[1] = (-b * d + f * p) * t;
        a[2] = (g * d - f * m) * t;
        a[3] = h * t;
        a[4] = (b * c - f * k) * t;
        a[5] = (-g * c + f * e) * t;
        a[6] = l * t;
        a[7] = (-p * c + d * k) * t;
        a[8] = (m * c - d * e) * t;
        return a;
      },
      adjoint: function (a, b) {
        var c = b[0],
          d = b[1],
          f = b[2],
          e = b[3],
          m = b[4],
          g = b[5],
          k = b[6],
          p = b[7];
        b = b[8];
        a[0] = m * b - g * p;
        a[1] = f * p - d * b;
        a[2] = d * g - f * m;
        a[3] = g * k - e * b;
        a[4] = c * b - f * k;
        a[5] = f * e - c * g;
        a[6] = e * p - m * k;
        a[7] = d * k - c * p;
        a[8] = c * m - d * e;
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
          m = b[3],
          g = b[4],
          q = b[5],
          k = b[6],
          p = b[7];
        b = b[8];
        var n = c[0],
          h = c[1],
          l = c[2],
          t = c[3],
          x = c[4],
          r = c[5],
          E = c[6],
          L = c[7];
        c = c[8];
        a[0] = n * d + h * m + l * k;
        a[1] = n * f + h * g + l * p;
        a[2] = n * e + h * q + l * b;
        a[3] = t * d + x * m + r * k;
        a[4] = t * f + x * g + r * p;
        a[5] = t * e + x * q + r * b;
        a[6] = E * d + L * m + c * k;
        a[7] = E * f + L * g + c * p;
        a[8] = E * e + L * q + c * b;
        return a;
      },
    };
    g.mul = g.multiply;
    g.translate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        m = b[3],
        g = b[4],
        q = b[5],
        k = b[6],
        p = b[7];
      b = b[8];
      var n = c[0];
      c = c[1];
      a[0] = d;
      a[1] = f;
      a[2] = e;
      a[3] = m;
      a[4] = g;
      a[5] = q;
      a[6] = n * d + c * m + k;
      a[7] = n * f + c * g + p;
      a[8] = n * e + c * q + b;
      return a;
    };
    g.rotate = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        m = b[3],
        g = b[4],
        q = b[5],
        k = b[6],
        p = b[7];
      b = b[8];
      var n = Math.sin(c);
      c = Math.cos(c);
      a[0] = c * d + n * m;
      a[1] = c * f + n * g;
      a[2] = c * e + n * q;
      a[3] = c * m - n * d;
      a[4] = c * g - n * f;
      a[5] = c * q - n * e;
      a[6] = k;
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
        m = c + c,
        g = d + d,
        k = f + f;
      b = c * m;
      var p = c * g,
        c = c * k,
        n = d * g,
        d = d * k,
        f = f * k,
        m = e * m,
        g = e * g,
        e = e * k;
      a[0] = 1 - (n + f);
      a[3] = p + e;
      a[6] = c - g;
      a[1] = p - e;
      a[4] = 1 - (b + f);
      a[7] = d + m;
      a[2] = c + g;
      a[5] = d - m;
      a[8] = 1 - (b + n);
      return a;
    };
    g.normalFromMat4 = function (a, b) {
      var c = b[0],
        d = b[1],
        f = b[2],
        e = b[3],
        m = b[4],
        g = b[5],
        k = b[6],
        p = b[7],
        n = b[8],
        h = b[9],
        l = b[10],
        t = b[11],
        r = b[12],
        x = b[13],
        J = b[14];
      b = b[15];
      var E = c * g - d * m,
        L = c * k - f * m,
        y = c * p - e * m,
        F = d * k - f * g,
        K = d * p - e * g,
        M = f * p - e * k,
        Q = n * x - h * r,
        W = n * J - l * r,
        n = n * b - t * r,
        V = h * J - l * x,
        h = h * b - t * x,
        l = l * b - t * J,
        t = E * l - L * h + y * V + F * n - K * W + M * Q;
      if (!t) return null;
      t = 1 / t;
      a[0] = (g * l - k * h + p * V) * t;
      a[1] = (k * n - m * l - p * W) * t;
      a[2] = (m * h - g * n + p * Q) * t;
      a[3] = (f * h - d * l - e * V) * t;
      a[4] = (c * l - f * n + e * W) * t;
      a[5] = (d * n - c * h - e * Q) * t;
      a[6] = (x * M - J * K + b * F) * t;
      a[7] = (J * y - r * M - b * L) * t;
      a[8] = (r * K - x * y + b * E) * t;
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
            m = b[7],
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
          a[13] = m;
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
          m = b[4],
          g = b[5],
          k = b[6],
          p = b[7],
          n = b[8],
          h = b[9],
          l = b[10],
          t = b[11],
          r = b[12],
          x = b[13],
          J = b[14];
        b = b[15];
        var E = c * g - d * m,
          L = c * k - f * m,
          y = c * p - e * m,
          F = d * k - f * g,
          K = d * p - e * g,
          M = f * p - e * k,
          Q = n * x - h * r,
          W = n * J - l * r,
          V = n * b - t * r,
          ba = h * J - l * x,
          S = h * b - t * x,
          T = l * b - t * J,
          da = E * T - L * S + y * ba + F * V - K * W + M * Q;
        if (!da) return null;
        da = 1 / da;
        a[0] = (g * T - k * S + p * ba) * da;
        a[1] = (f * S - d * T - e * ba) * da;
        a[2] = (x * M - J * K + b * F) * da;
        a[3] = (l * K - h * M - t * F) * da;
        a[4] = (k * V - m * T - p * W) * da;
        a[5] = (c * T - f * V + e * W) * da;
        a[6] = (J * y - r * M - b * L) * da;
        a[7] = (n * M - l * y + t * L) * da;
        a[8] = (m * S - g * V + p * Q) * da;
        a[9] = (d * V - c * S - e * Q) * da;
        a[10] = (r * K - x * y + b * E) * da;
        a[11] = (h * y - n * K - t * E) * da;
        a[12] = (g * W - m * ba - k * Q) * da;
        a[13] = (c * ba - d * W + f * Q) * da;
        a[14] = (x * L - r * F - J * E) * da;
        a[15] = (n * F - h * L + l * E) * da;
        return a;
      },
      adjoint: function (a, b) {
        var c = b[0],
          d = b[1],
          f = b[2],
          e = b[3],
          g = b[4],
          m = b[5],
          k = b[6],
          p = b[7],
          n = b[8],
          h = b[9],
          l = b[10],
          t = b[11],
          r = b[12],
          x = b[13],
          J = b[14];
        b = b[15];
        a[0] = m * (l * b - t * J) - h * (k * b - p * J) + x * (k * t - p * l);
        a[1] = -(
          d * (l * b - t * J) -
          h * (f * b - e * J) +
          x * (f * t - e * l)
        );
        a[2] = d * (k * b - p * J) - m * (f * b - e * J) + x * (f * p - e * k);
        a[3] = -(
          d * (k * t - p * l) -
          m * (f * t - e * l) +
          h * (f * p - e * k)
        );
        a[4] = -(
          g * (l * b - t * J) -
          n * (k * b - p * J) +
          r * (k * t - p * l)
        );
        a[5] = c * (l * b - t * J) - n * (f * b - e * J) + r * (f * t - e * l);
        a[6] = -(
          c * (k * b - p * J) -
          g * (f * b - e * J) +
          r * (f * p - e * k)
        );
        a[7] = c * (k * t - p * l) - g * (f * t - e * l) + n * (f * p - e * k);
        a[8] = g * (h * b - t * x) - n * (m * b - p * x) + r * (m * t - p * h);
        a[9] = -(
          c * (h * b - t * x) -
          n * (d * b - e * x) +
          r * (d * t - e * h)
        );
        a[10] = c * (m * b - p * x) - g * (d * b - e * x) + r * (d * p - e * m);
        a[11] = -(
          c * (m * t - p * h) -
          g * (d * t - e * h) +
          n * (d * p - e * m)
        );
        a[12] = -(
          g * (h * J - l * x) -
          n * (m * J - k * x) +
          r * (m * l - k * h)
        );
        a[13] = c * (h * J - l * x) - n * (d * J - f * x) + r * (d * l - f * h);
        a[14] = -(
          c * (m * J - k * x) -
          g * (d * J - f * x) +
          r * (d * k - f * m)
        );
        a[15] = c * (m * l - k * h) - g * (d * l - f * h) + n * (d * k - f * m);
        return a;
      },
      determinant: function (a) {
        var b = a[0],
          c = a[1],
          d = a[2],
          f = a[3],
          e = a[4],
          g = a[5],
          k = a[6],
          p = a[7],
          n = a[8],
          h = a[9],
          l = a[10],
          t = a[11],
          r = a[12],
          I = a[13],
          x = a[14];
        a = a[15];
        return (
          (b * g - c * e) * (l * a - t * x) -
          (b * k - d * e) * (h * a - t * I) +
          (b * p - f * e) * (h * x - l * I) +
          (c * k - d * g) * (n * a - t * r) -
          (c * p - f * g) * (n * x - l * r) +
          (d * p - f * k) * (n * I - h * r)
        );
      },
      multiply: function (a, b, c) {
        var d = b[0],
          f = b[1],
          e = b[2],
          g = b[3],
          m = b[4],
          k = b[5],
          q = b[6],
          p = b[7],
          n = b[8],
          h = b[9],
          l = b[10],
          t = b[11],
          r = b[12],
          J = b[13],
          E = b[14];
        b = b[15];
        var L = c[0],
          y = c[1],
          F = c[2],
          K = c[3];
        a[0] = L * d + y * m + F * n + K * r;
        a[1] = L * f + y * k + F * h + K * J;
        a[2] = L * e + y * q + F * l + K * E;
        a[3] = L * g + y * p + F * t + K * b;
        L = c[4];
        y = c[5];
        F = c[6];
        K = c[7];
        a[4] = L * d + y * m + F * n + K * r;
        a[5] = L * f + y * k + F * h + K * J;
        a[6] = L * e + y * q + F * l + K * E;
        a[7] = L * g + y * p + F * t + K * b;
        L = c[8];
        y = c[9];
        F = c[10];
        K = c[11];
        a[8] = L * d + y * m + F * n + K * r;
        a[9] = L * f + y * k + F * h + K * J;
        a[10] = L * e + y * q + F * l + K * E;
        a[11] = L * g + y * p + F * t + K * b;
        L = c[12];
        y = c[13];
        F = c[14];
        K = c[15];
        a[12] = L * d + y * m + F * n + K * r;
        a[13] = L * f + y * k + F * h + K * J;
        a[14] = L * e + y * q + F * l + K * E;
        a[15] = L * g + y * p + F * t + K * b;
        return a;
      },
    };
    p.mul = p.multiply;
    p.translate = function (a, b, c) {
      var d = c[0],
        f = c[1];
      c = c[2];
      var e, g, m, k, q, p, n, h, l, t, r, J;
      b === a
        ? ((a[12] = b[0] * d + b[4] * f + b[8] * c + b[12]),
          (a[13] = b[1] * d + b[5] * f + b[9] * c + b[13]),
          (a[14] = b[2] * d + b[6] * f + b[10] * c + b[14]),
          (a[15] = b[3] * d + b[7] * f + b[11] * c + b[15]))
        : ((e = b[0]),
          (g = b[1]),
          (m = b[2]),
          (k = b[3]),
          (q = b[4]),
          (p = b[5]),
          (n = b[6]),
          (h = b[7]),
          (l = b[8]),
          (t = b[9]),
          (r = b[10]),
          (J = b[11]),
          (a[0] = e),
          (a[1] = g),
          (a[2] = m),
          (a[3] = k),
          (a[4] = q),
          (a[5] = p),
          (a[6] = n),
          (a[7] = h),
          (a[8] = l),
          (a[9] = t),
          (a[10] = r),
          (a[11] = J),
          (a[12] = e * d + q * f + l * c + b[12]),
          (a[13] = g * d + p * f + t * c + b[13]),
          (a[14] = m * d + n * f + r * c + b[14]),
          (a[15] = k * d + h * f + J * c + b[15]));
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
      var m = Math.sqrt(f * f + g * g + e * e),
        k,
        q,
        p,
        n,
        h,
        v,
        l,
        t,
        r,
        J,
        E,
        L,
        y,
        F,
        K,
        M,
        Q,
        W,
        V,
        ba;
      if (Math.abs(m) < b) return null;
      m = 1 / m;
      f *= m;
      g *= m;
      e *= m;
      k = Math.sin(d);
      q = Math.cos(d);
      p = 1 - q;
      d = c[0];
      m = c[1];
      n = c[2];
      h = c[3];
      v = c[4];
      l = c[5];
      t = c[6];
      r = c[7];
      J = c[8];
      E = c[9];
      L = c[10];
      y = c[11];
      F = f * f * p + q;
      K = g * f * p + e * k;
      M = e * f * p - g * k;
      Q = f * g * p - e * k;
      W = g * g * p + q;
      V = e * g * p + f * k;
      ba = f * e * p + g * k;
      f = g * e * p - f * k;
      g = e * e * p + q;
      a[0] = d * F + v * K + J * M;
      a[1] = m * F + l * K + E * M;
      a[2] = n * F + t * K + L * M;
      a[3] = h * F + r * K + y * M;
      a[4] = d * Q + v * W + J * V;
      a[5] = m * Q + l * W + E * V;
      a[6] = n * Q + t * W + L * V;
      a[7] = h * Q + r * W + y * V;
      a[8] = d * ba + v * f + J * g;
      a[9] = m * ba + l * f + E * g;
      a[10] = n * ba + t * f + L * g;
      a[11] = h * ba + r * f + y * g;
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
        m = b[7],
        k = b[8],
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
      a[4] = f * c + k * d;
      a[5] = e * c + p * d;
      a[6] = g * c + q * d;
      a[7] = m * c + n * d;
      a[8] = k * c - f * d;
      a[9] = p * c - e * d;
      a[10] = q * c - g * d;
      a[11] = n * c - m * d;
      return a;
    };
    p.rotateY = function (a, b, c) {
      var d = Math.sin(c);
      c = Math.cos(c);
      var f = b[0],
        e = b[1],
        g = b[2],
        m = b[3],
        k = b[8],
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
      a[0] = f * c - k * d;
      a[1] = e * c - p * d;
      a[2] = g * c - q * d;
      a[3] = m * c - n * d;
      a[8] = f * d + k * c;
      a[9] = e * d + p * c;
      a[10] = g * d + q * c;
      a[11] = m * d + n * c;
      return a;
    };
    p.rotateZ = function (a, b, c) {
      var d = Math.sin(c);
      c = Math.cos(c);
      var f = b[0],
        e = b[1],
        g = b[2],
        m = b[3],
        k = b[4],
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
      a[0] = f * c + k * d;
      a[1] = e * c + p * d;
      a[2] = g * c + q * d;
      a[3] = m * c + n * d;
      a[4] = k * c - f * d;
      a[5] = p * c - e * d;
      a[6] = q * c - g * d;
      a[7] = n * c - m * d;
      return a;
    };
    p.fromRotationTranslation = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2],
        g = b[3],
        m = d + d,
        k = f + f,
        p = e + e;
      b = d * m;
      var q = d * k,
        d = d * p,
        n = f * k,
        f = f * p,
        e = e * p,
        m = g * m,
        k = g * k,
        g = g * p;
      a[0] = 1 - (n + e);
      a[1] = q + g;
      a[2] = d - k;
      a[3] = 0;
      a[4] = q - g;
      a[5] = 1 - (b + e);
      a[6] = f + m;
      a[7] = 0;
      a[8] = d + k;
      a[9] = f - m;
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
        m = f + f;
      b = c * g;
      var p = c * k,
        c = c * m,
        n = d * k,
        d = d * m,
        f = f * m,
        g = e * g,
        k = e * k,
        e = e * m;
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
    p.frustum = function (a, b, c, d, e, g, k) {
      var f = 1 / (c - b),
        m = 1 / (e - d),
        p = 1 / (g - k);
      a[0] = 2 * g * f;
      a[1] = 0;
      a[2] = 0;
      a[3] = 0;
      a[4] = 0;
      a[5] = 2 * g * m;
      a[6] = 0;
      a[7] = 0;
      a[8] = (c + b) * f;
      a[9] = (e + d) * m;
      a[10] = (k + g) * p;
      a[11] = -1;
      a[12] = 0;
      a[13] = 0;
      a[14] = k * g * 2 * p;
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
    p.ortho = function (a, b, c, d, e, g, k) {
      var f = 1 / (b - c),
        m = 1 / (d - e),
        p = 1 / (g - k);
      a[0] = -2 * f;
      a[1] = 0;
      a[2] = 0;
      a[3] = 0;
      a[4] = 0;
      a[5] = -2 * m;
      a[6] = 0;
      a[7] = 0;
      a[8] = 0;
      a[9] = 0;
      a[10] = 2 * p;
      a[11] = 0;
      a[12] = (b + c) * f;
      a[13] = (e + d) * m;
      a[14] = (k + g) * p;
      a[15] = 1;
      return a;
    };
    p.lookAt = function (a, c, d, e) {
      var f,
        g,
        k,
        m,
        q,
        n,
        h,
        l,
        v = c[0],
        t = c[1];
      c = c[2];
      k = e[0];
      m = e[1];
      g = e[2];
      h = d[0];
      e = d[1];
      f = d[2];
      if (Math.abs(v - h) < b && Math.abs(t - e) < b && Math.abs(c - f) < b)
        return p.identity(a);
      d = v - h;
      e = t - e;
      h = c - f;
      l = 1 / Math.sqrt(d * d + e * e + h * h);
      d *= l;
      e *= l;
      h *= l;
      f = m * h - g * e;
      g = g * d - k * h;
      k = k * e - m * d;
      (l = Math.sqrt(f * f + g * g + k * k))
        ? ((l = 1 / l), (f *= l), (g *= l), (k *= l))
        : (k = g = f = 0);
      m = e * k - h * g;
      q = h * f - d * k;
      n = d * g - e * f;
      (l = Math.sqrt(m * m + q * q + n * n))
        ? ((l = 1 / l), (m *= l), (q *= l), (n *= l))
        : (n = q = m = 0);
      a[0] = f;
      a[1] = m;
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
      a[12] = -(f * v + g * t + k * c);
      a[13] = -(m * v + q * t + n * c);
      a[14] = -(d * v + e * t + h * c);
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
    var k = {
      create: function () {
        var a = new c(4);
        a[0] = 0;
        a[1] = 0;
        a[2] = 0;
        a[3] = 1;
        return a;
      },
    };
    k.rotationTo = (function () {
      var a = t.create(),
        b = t.fromValues(1, 0, 0),
        c = t.fromValues(0, 1, 0);
      return function (d, f, e) {
        var g = t.dot(f, e);
        if (-0.999999 > g)
          return (
            t.cross(a, b, f),
            1e-6 > t.length(a) && t.cross(a, c, f),
            t.normalize(a, a),
            k.setAxisAngle(d, a, Math.PI),
            d
          );
        if (0.999999 < g)
          return ((d[0] = 0), (d[1] = 0), (d[2] = 0), (d[3] = 1), d);
        t.cross(a, f, e);
        d[0] = a[0];
        d[1] = a[1];
        d[2] = a[2];
        d[3] = 1 + g;
        return k.normalize(d, d);
      };
    })();
    k.setAxes = (function () {
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
        return k.normalize(b, k.fromMat3(b, a));
      };
    })();
    k.clone = n.clone;
    k.fromValues = n.fromValues;
    k.copy = n.copy;
    k.set = n.set;
    k.identity = function (a) {
      a[0] = 0;
      a[1] = 0;
      a[2] = 0;
      a[3] = 1;
      return a;
    };
    k.setAxisAngle = function (a, b, c) {
      c *= 0.5;
      var d = Math.sin(c);
      a[0] = d * b[0];
      a[1] = d * b[1];
      a[2] = d * b[2];
      a[3] = Math.cos(c);
      return a;
    };
    k.add = n.add;
    k.multiply = function (a, b, c) {
      var d = b[0],
        f = b[1],
        e = b[2];
      b = b[3];
      var g = c[0],
        k = c[1],
        m = c[2];
      c = c[3];
      a[0] = d * c + b * g + f * m - e * k;
      a[1] = f * c + b * k + e * g - d * m;
      a[2] = e * c + b * m + d * k - f * g;
      a[3] = b * c - d * g - f * k - e * m;
      return a;
    };
    k.mul = k.multiply;
    k.scale = n.scale;
    k.rotateX = function (a, b, c) {
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
    k.rotateY = function (a, b, c) {
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
    k.rotateZ = function (a, b, c) {
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
    k.calculateW = function (a, b) {
      var c = b[0],
        d = b[1];
      b = b[2];
      a[0] = c;
      a[1] = d;
      a[2] = b;
      a[3] = -Math.sqrt(Math.abs(1 - c * c - d * d - b * b));
      return a;
    };
    k.dot = n.dot;
    k.lerp = n.lerp;
    k.slerp = function (a, b, c, d) {
      var f = b[0],
        e = b[1],
        g = b[2];
      b = b[3];
      var k = c[0],
        m = c[1],
        p = c[2];
      c = c[3];
      var q, n, h;
      n = f * k + e * m + g * p + b * c;
      0 > n && ((n = -n), (k = -k), (m = -m), (p = -p), (c = -c));
      1e-6 < 1 - n
        ? ((q = Math.acos(n)),
          (h = Math.sin(q)),
          (n = Math.sin((1 - d) * q) / h),
          (d = Math.sin(d * q) / h))
        : (n = 1 - d);
      a[0] = n * f + d * k;
      a[1] = n * e + d * m;
      a[2] = n * g + d * p;
      a[3] = n * b + d * c;
      return a;
    };
    k.invert = function (a, b) {
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
    k.conjugate = function (a, b) {
      a[0] = -b[0];
      a[1] = -b[1];
      a[2] = -b[2];
      a[3] = b[3];
      return a;
    };
    k.length = n.length;
    k.len = k.length;
    k.squaredLength = n.squaredLength;
    k.sqrLen = k.squaredLength;
    k.normalize = n.normalize;
    k.fromMat3 = (function () {
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
    k.str = function (a) {
      return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
    };
    "undefined" !== typeof a && (a.quat = k);
  })(b);
})(this);
