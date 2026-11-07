(function (a, b, c) {
  var d = { function: !0, object: !0 },
    e = d[typeof exports] && exports && !exports.nodeType && exports,
    d = d[typeof module] && module && !module.nodeType && module,
    m = e && d && "object" === typeof global && global,
    h = d && d.exports === e && e;
  !m || (m.global !== m && m.window !== m && m.self !== m) || (a = m);
  "function" === typeof define && "object" === typeof define.amd && define.amd
    ? (define("Vendors/luaparse", ["exports"], c), e && h && c(d.exports))
    : e && d
      ? h
        ? c(d.exports)
        : c(e)
      : c((a[b] = {}));
})(this, "luaparse", function (a) {
  function b(a) {
    if (ya) {
      var d = wa.pop();
      d.complete();
      d.bless(a);
    }
    if (Z.onCreateNode) Z.onCreateNode(a);
    return a;
  }
  function c(a) {
    var d = Y.call(arguments, 1);
    return (a = a.replace(/%(\d)/g, function (a, b) {
      return "" + d[b - 1] || "";
    }));
  }
  function d() {
    for (
      var a = Y.call(arguments), d = {}, b, c, e = 0, f = a.length;
      e < f;
      ++e
    )
      for (c in ((b = a[e]), b)) b.hasOwnProperty(c) && (d[c] = b[c]);
    return d;
  }
  function e(a) {
    return Object.create
      ? Object.create(a, {
          line: { writable: !0, value: a.line },
          index: { writable: !0, value: a.index },
          column: { writable: !0, value: a.column },
        })
      : a;
  }
  function m(a) {
    var d = c.apply(null, Y.call(arguments, 1)),
      b;
    "undefined" !== typeof a.line
      ? ((b = a.range[0] - a.lineStart),
        (d = e(new SyntaxError(c("[%1:%2] %3", a.line, b, d)))),
        (d.line = a.line),
        (d.index = a.range[0]))
      : ((b = W - xa + 1),
        (d = e(new SyntaxError(c("[%1:%2] %3", na, b, d)))),
        (d.index = W),
        (d.line = na));
    d.column = b;
    throw d;
  }
  function h(a, d) {
    m(d, ba.expectedToken, a, d.value);
  }
  function r(a) {
    var d = ma.value;
    if ("undefined" !== typeof a.type) {
      var b;
      switch (a.type) {
        case 2:
          b = "string";
          break;
        case 4:
          b = "keyword";
          break;
        case 8:
          b = "identifier";
          break;
        case 16:
          b = "number";
          break;
        case 32:
          b = "symbol";
          break;
        case 64:
          b = "boolean";
          break;
        case 128:
          return m(a, ba.unexpected, "symbol", "nil", d);
      }
      return m(a, ba.unexpected, b, a.value, d);
    }
    return m(a, ba.unexpected, "symbol", a, d);
  }
  function q() {
    for (g(); 45 === X.charCodeAt(W) && 45 === X.charCodeAt(W + 1);) {
      ia = W;
      W += 2;
      var a = X.charAt(W),
        d = "",
        b = !1,
        c = W,
        e = xa,
        h = na;
      "[" === a && ((d = v(!0)), !1 === d ? (d = a) : (b = !0));
      if (!b) {
        for (; W < qa && !B(X.charCodeAt(W));) ++W;
        Z.comments && (d = X.slice(c, W));
      }
      if (Z.comments) {
        a = Q.comment(d, X.slice(ia, W));
        Z.locations &&
          (a.loc = {
            start: { line: h, column: ia - e },
            end: { line: na, column: W - xa },
          });
        Z.ranges && (a.range = [ia, W]);
        if (Z.onCreateNode) Z.onCreateNode(a);
        ja.push(a);
      }
      g();
    }
    if (W >= qa)
      return {
        type: 1,
        value: "\x3ceof\x3e",
        line: na,
        lineStart: xa,
        range: [W, W],
      };
    e = X.charCodeAt(W);
    h = X.charCodeAt(W + 1);
    ia = W;
    a =
      (65 <= e && 90 >= e) || (97 <= e && 122 >= e) || 95 === e
        ? !0
        : Z.extendedIdentifiers && 128 <= e
          ? !0
          : !1;
    if (a) {
      for (; y(X.charCodeAt(++W)););
      e = l(X.slice(ia, W));
      z(e)
        ? (h = 4)
        : "true" === e || "false" === e
          ? ((h = 64), (e = "true" === e))
          : "nil" === e
            ? ((h = 128), (e = null))
            : (h = 8);
      return { type: h, value: e, line: na, lineStart: xa, range: [ia, W] };
    }
    switch (e) {
      case 39:
      case 34:
        e = X.charCodeAt(W++);
        h = na;
        a = xa;
        d = W;
        for (b = ""; W < qa;) {
          c = X.charCodeAt(W++);
          if (e === c) break;
          if (92 === c) ((b += l(X.slice(d, W - 1)) + p()), (d = W));
          else if (W >= qa || B(c))
            ((b += X.slice(d, W - 1)),
              m({}, ba.unfinishedString, b + String.fromCharCode(c)));
        }
        b += l(X.slice(d, W - 1));
        return {
          type: 2,
          value: b,
          line: h,
          lineStart: a,
          lastLine: na,
          lastLineStart: xa,
          range: [ia, W],
        };
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return n();
      case 46:
        return O(h)
          ? n()
          : 46 === h
            ? 46 === X.charCodeAt(W + 2)
              ? ((W += 3),
                {
                  type: 256,
                  value: "...",
                  line: na,
                  lineStart: xa,
                  range: [ia, W],
                })
              : f("..")
            : f(".");
      case 61:
        return 61 === h ? f("\x3d\x3d") : f("\x3d");
      case 62:
        return pa.bitwiseOperators && 62 === h
          ? f("\x3e\x3e")
          : 61 === h
            ? f("\x3e\x3d")
            : f("\x3e");
      case 60:
        return pa.bitwiseOperators && 60 === h
          ? f("\x3c\x3c")
          : 61 === h
            ? f("\x3c\x3d")
            : f("\x3c");
      case 126:
        if (61 === h) return f("~\x3d");
        if (!pa.bitwiseOperators) break;
        return f("~");
      case 58:
        return pa.labels && 58 === h ? f("::") : f(":");
      case 91:
        return 91 === h || 61 === h
          ? ((e = na),
            (h = xa),
            (a = v(!1)),
            !1 === a && m(aa, ba.expected, "[", aa.value),
            {
              type: 2,
              value: l(a),
              line: e,
              lineStart: h,
              lastLine: na,
              lastLineStart: xa,
              range: [ia, W],
            })
          : f("[");
      case 47:
        return pa.integerDivision && 47 === h ? f("//") : f("/");
      case 38:
      case 124:
        if (!pa.bitwiseOperators) break;
      case 42:
      case 94:
      case 37:
      case 44:
      case 123:
      case 125:
      case 93:
      case 40:
      case 41:
      case 59:
      case 35:
      case 45:
      case 43:
        return f(X.charAt(W));
    }
    return r(X.charAt(W));
  }
  function k() {
    var a = X.charCodeAt(W),
      d = X.charCodeAt(W + 1);
    return B(a)
      ? (10 === a && 13 === d && ++W,
        13 === a && 10 === d && ++W,
        ++na,
        (xa = ++W),
        !0)
      : !1;
  }
  function g() {
    for (; W < qa;) {
      var a = X.charCodeAt(W);
      if (9 === a || 32 === a || 11 === a || 12 === a) ++W;
      else if (!k()) break;
    }
  }
  function t(a) {
    return 128 > a
      ? String.fromCharCode(a)
      : 2048 > a
        ? String.fromCharCode(192 | (a >> 6), 128 | (a & 63))
        : 65536 > a
          ? String.fromCharCode(
              224 | (a >> 12),
              128 | ((a >> 6) & 63),
              128 | (a & 63),
            )
          : 1114112 > a
            ? String.fromCharCode(
                240 | (a >> 18),
                128 | ((a >> 12) & 63),
                128 | ((a >> 6) & 63),
                128 | (a & 63),
              )
            : null;
  }
  function l(a) {
    return a.replace(
      /[\ud800-\udbff][\udc00-\udfff]|[^\x00-\x7f]/g,
      function (a) {
        return 1 === a.length
          ? t(a.charCodeAt(0))
          : t(
              65536 +
                (((a.charCodeAt(0) & 1023) << 10) | (a.charCodeAt(1) & 1023)),
            );
      },
    );
  }
  function f(a) {
    W += a.length;
    return { type: 32, value: a, line: na, lineStart: xa, range: [ia, W] };
  }
  function n() {
    var a = X.charAt(W),
      d = X.charAt(W + 1);
    if ("0" === a && 0 <= "xX".indexOf(d || null)) {
      var a = 0,
        b = 1,
        d = 1,
        c,
        e;
      c = W += 2;
      for (
        C(X.charCodeAt(W)) || m({}, ba.malformedNumber, X.slice(ia, W));
        C(X.charCodeAt(W));
      )
        ++W;
      c = parseInt(X.slice(c, W), 16);
      if ("." === X.charAt(W)) {
        for (e = ++W; C(X.charCodeAt(W));) ++W;
        a = X.slice(e, W);
        a = e === W ? 0 : parseInt(a, 16) / Math.pow(16, W - e);
      }
      if (0 <= "pP".indexOf(X.charAt(W) || null)) {
        ++W;
        0 <= "+-".indexOf(X.charAt(W) || null) &&
          (d = "+" === X.charAt(W++) ? 1 : -1);
        b = W;
        for (
          O(X.charCodeAt(W)) || m({}, ba.malformedNumber, X.slice(ia, W));
          O(X.charCodeAt(W));
        )
          ++W;
        b = X.slice(b, W);
        b = Math.pow(2, b * d);
      }
      a = (c + a) * b;
    } else {
      for (; O(X.charCodeAt(W));) ++W;
      if ("." === X.charAt(W)) for (++W; O(X.charCodeAt(W));) ++W;
      if (0 <= "eE".indexOf(X.charAt(W) || null))
        for (
          ++W,
            0 <= "+-".indexOf(X.charAt(W) || null) && ++W,
            O(X.charCodeAt(W)) || m({}, ba.malformedNumber, X.slice(ia, W));
          O(X.charCodeAt(W));
        )
          ++W;
      a = parseFloat(X.slice(ia, W));
    }
    return { type: 16, value: a, line: na, lineStart: xa, range: [ia, W] };
  }
  function p() {
    var a = W;
    switch (X.charAt(W)) {
      case "a":
        return (++W, "\u0007");
      case "n":
        return (++W, "\n");
      case "r":
        return (++W, "\r");
      case "t":
        return (++W, "\t");
      case "v":
        return (++W, "\x0B");
      case "b":
        return (++W, "\b");
      case "f":
        return (++W, "\f");
      case "\r":
      case "\n":
        return (k(), "\n");
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        for (; O(X.charCodeAt(W)) && 3 > W - a;) ++W;
        a = parseInt(X.slice(a, W), 10);
        255 < a && m({}, ba.decimalEscapeTooLarge, "\\" + a);
        return String.fromCharCode(a);
      case "z":
        if (pa.skipWhitespaceEscape) return (++W, g(), "");
      case "x":
        if (pa.hexEscapes) {
          if (C(X.charCodeAt(W + 1)) && C(X.charCodeAt(W + 2)))
            return (
              (W += 3),
              String.fromCharCode(parseInt(X.slice(a + 1, W), 16))
            );
          m({}, ba.hexadecimalDigitExpected, "\\" + X.slice(a, W + 2));
        }
      case "u":
        if (pa.unicodeEscapes) {
          a = W++;
          "{" !== X.charAt(W++) &&
            m({}, ba.braceExpected, "{", "\\" + X.slice(a, W));
          for (
            C(X.charCodeAt(W)) ||
            m({}, ba.hexadecimalDigitExpected, "\\" + X.slice(a, W));
            48 === X.charCodeAt(W);
          )
            ++W;
          for (var d = W; C(X.charCodeAt(W));)
            (++W,
              6 < W - d && m({}, ba.tooLargeCodepoint, "\\" + X.slice(a, W)));
          var b = X.charAt(W++);
          "}" !== b &&
            ('"' === b || "'" === b
              ? m({}, ba.braceExpected, "}", "\\" + X.slice(a, W--))
              : m({}, ba.hexadecimalDigitExpected, "\\" + X.slice(a, W)));
          d = parseInt(X.slice(d, W - 1), 16);
          d = t(d);
          null === d && m({}, ba.tooLargeCodepoint, "\\" + X.slice(a, W));
          return d;
        }
      default:
        pa.strictEscapes && m({}, ba.invalidEscape, "\\" + X.slice(a, W + 1));
      case "\\":
      case '"':
      case "'":
        return X.charAt(W++);
    }
  }
  function v(a) {
    var d = 0,
      b = "",
      c = !1,
      e,
      f,
      h = na;
    for (++W; "\x3d" === X.charAt(W + d);) ++d;
    if ("[" !== X.charAt(W + d)) return !1;
    W += d + 1;
    B(X.charCodeAt(W)) && k();
    for (f = W; W < qa;) {
      for (; B(X.charCodeAt(W));) k();
      e = X.charAt(W++);
      if ("]" === e) {
        c = !0;
        for (e = 0; e < d; ++e) "\x3d" !== X.charAt(W + e) && (c = !1);
        "]" !== X.charAt(W + d) && (c = !1);
      }
      if (c) return ((b += X.slice(f, W - 1)), (W += d + 1), b);
    }
    m(
      {},
      a ? ba.unfinishedLongComment : ba.unfinishedLongString,
      h,
      "\x3ceof\x3e",
    );
  }
  function u() {
    sa = aa;
    aa = ma;
    ma = q();
  }
  function A(a) {
    return a === aa.value ? (u(), !0) : !1;
  }
  function D(a) {
    a === aa.value ? u() : m(aa, ba.expected, a, aa.value);
  }
  function B(a) {
    return 10 === a || 13 === a;
  }
  function O(a) {
    return 48 <= a && 57 >= a;
  }
  function C(a) {
    return (
      (48 <= a && 57 >= a) || (97 <= a && 102 >= a) || (65 <= a && 70 >= a)
    );
  }
  function y(a) {
    return (65 <= a && 90 >= a) ||
      (97 <= a && 122 >= a) ||
      95 === a ||
      (48 <= a && 57 >= a) ||
      (Z.extendedIdentifiers && 128 <= a)
      ? !0
      : !1;
  }
  function z(a) {
    switch (a.length) {
      case 2:
        return "do" === a || "if" === a || "in" === a || "or" === a;
      case 3:
        return "and" === a || "end" === a || "for" === a || "not" === a;
      case 4:
        if ("else" === a || "then" === a) return !0;
        if (pa.labels && !pa.contextualGoto) return "goto" === a;
        break;
      case 5:
        return "break" === a || "local" === a || "until" === a || "while" === a;
      case 6:
        return "elseif" === a || "repeat" === a || "return" === a;
      case 8:
        return "function" === a;
    }
    return !1;
  }
  function J(a) {
    if (1 === a.type) return !0;
    if (4 !== a.type) return !1;
    switch (a.value) {
      case "else":
      case "elseif":
      case "end":
      case "until":
        return !0;
      default:
        return !1;
    }
  }
  function I() {
    var a = Array.apply(null, ua[Ba++]);
    ua.push(a);
    if (Z.onCreateScope) Z.onCreateScope();
  }
  function L() {
    ua.pop();
    Ba--;
    if (Z.onDestroyScope) Z.onDestroyScope();
  }
  function x(a) {
    if (Z.onLocalDeclaration) Z.onLocalDeclaration(a);
    -1 === ra(ua[Ba], a) && ua[Ba].push(a);
  }
  function M(a) {
    x(a.name);
    E(a, !0);
  }
  function E(a, d) {
    var b;
    if ((b = !d)) {
      a: {
        b = 0;
        for (var c = Aa.length; b < c; ++b) if (Aa[b].name === a.name) break a;
        b = -1;
      }
      b = -1 === b;
    }
    b && Aa.push(a);
    a.isLocal = d;
  }
  function F() {
    return new G(aa);
  }
  function G(a) {
    Z.locations &&
      (this.loc = {
        start: { line: a.line, column: a.range[0] - a.lineStart },
        end: { line: 0, column: 0 },
      });
    Z.ranges && (this.range = [a.range[0], 0]);
  }
  function H() {
    ya && wa.push(F());
  }
  function K(a) {
    ya && wa.push(a);
  }
  function P() {
    u();
    H();
    Z.scope && I();
    var a = N();
    Z.scope && L();
    1 !== aa.type && r(aa);
    ya && !a.length && (sa = aa);
    return b(Q.chunk(a));
  }
  function N(a) {
    a = [];
    for (var d; !J(aa);) {
      if ("return" === aa.value) {
        a.push(S());
        break;
      }
      d = S();
      A(";");
      d && a.push(d);
    }
    return a;
  }
  function S() {
    H();
    if (4 === aa.type)
      switch (aa.value) {
        case "local":
          u();
          var a;
          var d;
          if (8 === aa.type) {
            a = [];
            var c = [];
            do ((d = V()), a.push(d));
            while (A(","));
            if (A("\x3d")) {
              do ((d = fa()), c.push(d));
              while (A(","));
            }
            if (Z.scope) {
              d = 0;
              for (var e = a.length; d < e; ++d) M(a[d]);
            }
            a = b(Q.localStatement(a, c));
          } else
            A("function")
              ? ((d = V()), Z.scope && (M(d), I()), (a = ca(d, !0)))
              : (h("\x3cname\x3e", aa), (a = void 0));
          return a;
        case "if":
          u();
          c = [];
          ya && ((a = wa[wa.length - 1]), wa.push(a));
          d = fa();
          D("then");
          Z.scope && I();
          e = N();
          Z.scope && L();
          c.push(b(Q.ifClause(d, e)));
          for (ya && (a = F()); A("elseif");)
            (K(a),
              (d = fa()),
              D("then"),
              Z.scope && I(),
              (e = N()),
              Z.scope && L(),
              c.push(b(Q.elseifClause(d, e))),
              ya && (a = F()));
          A("else") &&
            (ya && ((a = new G(sa)), wa.push(a)),
            Z.scope && I(),
            (e = N()),
            Z.scope && L(),
            c.push(b(Q.elseClause(e))));
          D("end");
          return b(Q.ifStatement(c));
        case "return":
          u();
          a = [];
          if ("end" !== aa.value) {
            c = ta(0);
            for (null != c && a.push(c); A(",");) ((c = fa()), a.push(c));
            A(";");
          }
          return b(Q.returnStatement(a));
        case "function":
          u();
          ya && (c = F());
          a = V();
          Z.scope && (E(a, -1 !== ra(ua[Ba], a.name)), I());
          for (; A(".");)
            (K(c), (d = V()), (a = b(Q.memberExpression(a, ".", d))));
          A(":") &&
            (K(c),
            (d = V()),
            (a = b(Q.memberExpression(a, ":", d))),
            Z.scope && x("self"));
          return ca(a);
        case "while":
          return (
            u(),
            (a = fa()),
            D("do"),
            Z.scope && I(),
            (c = N()),
            Z.scope && L(),
            D("end"),
            b(Q.whileStatement(a, c))
          );
        case "for":
          u();
          c = V();
          Z.scope && (I(), M(c));
          if (A("\x3d")) {
            d = fa();
            D(",");
            var e = fa(),
              f = A(",") ? fa() : null;
            D("do");
            a = N();
            D("end");
            Z.scope && L();
            a = b(Q.forNumericStatement(c, d, e, f, a));
          } else {
            for (d = [c]; A(",");) ((c = V()), Z.scope && M(c), d.push(c));
            D("in");
            c = [];
            do ((a = fa()), c.push(a));
            while (A(","));
            D("do");
            a = N();
            D("end");
            Z.scope && L();
            a = b(Q.forGenericStatement(d, c, a));
          }
          return a;
        case "repeat":
          return (
            u(),
            Z.scope && I(),
            (a = N()),
            D("until"),
            (c = fa()),
            Z.scope && L(),
            b(Q.repeatStatement(c, a))
          );
        case "break":
          return (u(), b(Q.breakStatement()));
        case "do":
          return (
            u(),
            Z.scope && I(),
            (a = N()),
            Z.scope && L(),
            D("end"),
            b(Q.doStatement(a))
          );
        case "goto":
          return (u(), R());
      }
    if (
      pa.contextualGoto &&
      8 === aa.type &&
      "goto" === aa.value &&
      8 === ma.type &&
      "goto" !== ma.value
    )
      return (u(), R());
    if (32 === aa.type && A("::"))
      return (
        (a = aa.value),
        (c = V()),
        Z.scope && (x("::" + a + "::"), E(c, !0)),
        D("::"),
        b(Q.labelStatement(c))
      );
    ya && wa.pop();
    if (!pa.emptyStatement || !A(";")) return U();
  }
  function R() {
    var a = V();
    return b(Q.gotoStatement(a));
  }
  function ea(a) {
    (a.inParens ||
      -1 ===
        ["Identifier", "MemberExpression", "IndexExpression"].indexOf(
          a.type,
        )) &&
      m(aa, ba.invalidVar, aa.value);
  }
  function U() {
    var a = aa,
      d,
      c;
    ya && (c = F());
    d = ka();
    if (null == d) return r(aa);
    if (0 <= ",\x3d".indexOf(aa.value)) {
      var a = [d],
        e = [];
      for (ea(d); A(",");)
        ((d = ka()),
          null == d && h("\x3cexpression\x3e", aa),
          ea(d),
          a.push(d));
      D("\x3d");
      do ((d = fa()), e.push(d));
      while (A(","));
      K(c);
      return b(Q.assignmentStatement(a, e));
    }
    a: {
      switch (d.type) {
        case "CallExpression":
        case "TableCallExpression":
        case "StringCallExpression":
          e = !0;
          break a;
      }
      e = !1;
    }
    return e ? (K(c), b(Q.callStatement(d))) : r(a);
  }
  function V() {
    H();
    var a = aa.value;
    8 !== aa.type && h("\x3cname\x3e", aa);
    u();
    return b(Q.identifier(a));
  }
  function ca(a, d) {
    var c = [];
    D("(");
    if (!A(")"))
      for (;;) {
        if (8 === aa.type) {
          var e = V();
          Z.scope && M(e);
          c.push(e);
          if (A(",")) continue;
        } else 256 === aa.type ? c.push(ga()) : h("\x3cname\x3e or '...'", aa);
        D(")");
        break;
      }
    e = N();
    D("end");
    Z.scope && L();
    return b(Q.functionStatement(a, c, d || !1, e));
  }
  function T() {
    for (var a = [], d, c; ;) {
      H();
      if (32 === aa.type && A("["))
        ((d = fa()),
          D("]"),
          D("\x3d"),
          (c = fa()),
          a.push(b(Q.tableKey(d, c))));
      else if (8 === aa.type)
        "\x3d" === ma.value
          ? ((d = V()), u(), (c = fa()), a.push(b(Q.tableKeyString(d, c))))
          : ((c = fa()), a.push(b(Q.tableValue(c))));
      else {
        if (null == (c = ta(0))) {
          wa.pop();
          break;
        }
        a.push(b(Q.tableValue(c)));
      }
      if (0 <= ",;".indexOf(aa.value)) u();
      else break;
    }
    D("}");
    return b(Q.tableConstructorExpression(a));
  }
  function fa() {
    var a = ta(0);
    if (null == a) h("\x3cexpression\x3e", aa);
    else return a;
  }
  function da(a) {
    var d = a.charCodeAt(0),
      b = a.length;
    if (1 === b)
      switch (d) {
        case 94:
          return 12;
        case 42:
        case 47:
        case 37:
          return 10;
        case 43:
        case 45:
          return 9;
        case 38:
          return 6;
        case 126:
          return 5;
        case 124:
          return 4;
        case 60:
        case 62:
          return 3;
      }
    else if (2 === b)
      switch (d) {
        case 47:
          return 10;
        case 46:
          return 8;
        case 60:
        case 62:
          return "\x3c\x3c" === a || "\x3e\x3e" === a ? 7 : 3;
        case 61:
        case 126:
          return 3;
        case 111:
          return 1;
      }
    else if (97 === d && "and" === a) return 2;
    return 0;
  }
  function ta(a) {
    var d = aa.value,
      c,
      e;
    ya && (e = F());
    var f;
    f = aa;
    f =
      32 === f.type
        ? 0 <= "#-~".indexOf(f.value)
        : 4 === f.type
          ? "not" === f.value
          : !1;
    f &&
      (H(),
      u(),
      (c = ta(10)),
      null == c && h("\x3cexpression\x3e", aa),
      (c = b(Q.unaryExpression(d, c))));
    null == c && ((c = ga()), null == c && (c = ka()));
    if (null == c) return null;
    for (;;) {
      d = aa.value;
      f = 32 === aa.type || 4 === aa.type ? da(d) : 0;
      if (0 === f || f <= a) break;
      ("^" !== d && ".." !== d) || f--;
      u();
      f = ta(f);
      null == f && h("\x3cexpression\x3e", aa);
      ya && wa.push(e);
      c = b(Q.binaryExpression(d, c, f));
    }
    return c;
  }
  function ka() {
    var a, d, c;
    ya && (c = F());
    if (8 === aa.type)
      ((d = aa.value), (a = V()), Z.scope && E(a, -1 !== ra(ua[Ba], d)));
    else if (A("(")) ((a = fa()), D(")"), (a.inParens = !0));
    else return null;
    for (;;)
      if (32 === aa.type)
        switch (aa.value) {
          case "[":
            K(c);
            u();
            d = fa();
            D("]");
            a = b(Q.indexExpression(a, d));
            break;
          case ".":
            K(c);
            u();
            d = V();
            a = b(Q.memberExpression(a, ".", d));
            break;
          case ":":
            K(c);
            u();
            d = V();
            a = b(Q.memberExpression(a, ":", d));
            K(c);
            a = oa(a);
            break;
          case "(":
          case "{":
            K(c);
            a = oa(a);
            break;
          default:
            return a;
        }
      else if (2 === aa.type) (K(c), (a = oa(a)));
      else break;
    return a;
  }
  function oa(a) {
    if (32 === aa.type)
      switch (aa.value) {
        case "(":
          pa.emptyStatement ||
            (aa.line !== sa.line && m({}, ba.ambiguousSyntax, aa.value));
          u();
          var d = [],
            c = ta(0);
          for (null != c && d.push(c); A(",");) ((c = fa()), d.push(c));
          D(")");
          return b(Q.callExpression(a, d));
        case "{":
          return (H(), u(), (d = T()), b(Q.tableCallExpression(a, d)));
      }
    else if (2 === aa.type) return b(Q.stringCallExpression(a, ga()));
    h("function arguments", aa);
  }
  function ga() {
    var a = aa.value,
      d = aa.type,
      c;
    ya && (c = F());
    if (d & 466)
      return (
        K(c),
        (c = X.slice(aa.range[0], aa.range[1])),
        u(),
        b(Q.literal(d, a, c))
      );
    if (4 === d && "function" === a)
      return (K(c), u(), Z.scope && I(), ca(null));
    if (A("{")) return (K(c), T());
  }
  function la(d) {
    X += String(d);
    qa = X.length;
    return a;
  }
  function ha(a) {
    "undefined" !== typeof a && la(a);
    X &&
      "#!" === X.substr(0, 2) &&
      (X = X.replace(/^.*/, function (a) {
        return a.replace(/./g, " ");
      }));
    qa = X.length;
    ya = Z.locations || Z.ranges;
    ma = q();
    a = P();
    Z.comments && (a.comments = ja);
    Z.scope && (a.globals = Aa);
    if (0 < wa.length)
      throw Error(
        "Location tracking failed. This is most likely a bug in luaparse",
      );
    return a;
  }
  a.version = "0.2.1";
  var X,
    Z,
    qa,
    pa,
    w = (a.defaultOptions = {
      wait: !1,
      comments: !0,
      scope: !1,
      locations: !1,
      ranges: !1,
      onCreateNode: null,
      onCreateScope: null,
      onDestroyScope: null,
      onLocalDeclaration: null,
      luaVersion: "5.1",
      extendedIdentifiers: !1,
    });
  a.tokenTypes = {
    EOF: 1,
    StringLiteral: 2,
    Keyword: 4,
    Identifier: 8,
    NumericLiteral: 16,
    Punctuator: 32,
    BooleanLiteral: 64,
    NilLiteral: 128,
    VarargLiteral: 256,
  };
  var ba = (a.errors = {
      unexpected: "unexpected %1 '%2' near '%3'",
      expected: "'%1' expected near '%2'",
      expectedToken: "%1 expected near '%2'",
      unfinishedString: "unfinished string near '%1'",
      malformedNumber: "malformed number near '%1'",
      invalidVar: "invalid left-hand side of assignment near '%1'",
      decimalEscapeTooLarge: "decimal escape too large near '%1'",
      invalidEscape: "invalid escape sequence near '%1'",
      hexadecimalDigitExpected: "hexadecimal digit expected near '%1'",
      braceExpected: "missing '%1' near '%2'",
      tooLargeCodepoint: "UTF-8 value too large near '%1'",
      unfinishedLongString:
        "unfinished long string (starting at line %1) near '%2'",
      unfinishedLongComment:
        "unfinished long comment (starting at line %1) near '%2'",
      ambiguousSyntax:
        "ambiguous syntax (function call x new statement) near '%1'",
    }),
    Q = (a.ast = {
      labelStatement: function (a) {
        return { type: "LabelStatement", label: a };
      },
      breakStatement: function () {
        return { type: "BreakStatement" };
      },
      gotoStatement: function (a) {
        return { type: "GotoStatement", label: a };
      },
      returnStatement: function (a) {
        return { type: "ReturnStatement", arguments: a };
      },
      ifStatement: function (a) {
        return { type: "IfStatement", clauses: a };
      },
      ifClause: function (a, d) {
        return { type: "IfClause", condition: a, body: d };
      },
      elseifClause: function (a, d) {
        return { type: "ElseifClause", condition: a, body: d };
      },
      elseClause: function (a) {
        return { type: "ElseClause", body: a };
      },
      whileStatement: function (a, d) {
        return { type: "WhileStatement", condition: a, body: d };
      },
      doStatement: function (a) {
        return { type: "DoStatement", body: a };
      },
      repeatStatement: function (a, d) {
        return { type: "RepeatStatement", condition: a, body: d };
      },
      localStatement: function (a, d) {
        return { type: "LocalStatement", variables: a, init: d };
      },
      assignmentStatement: function (a, d) {
        return { type: "AssignmentStatement", variables: a, init: d };
      },
      callStatement: function (a) {
        return { type: "CallStatement", expression: a };
      },
      functionStatement: function (a, d, b, c) {
        return {
          type: "FunctionDeclaration",
          identifier: a,
          isLocal: b,
          parameters: d,
          body: c,
        };
      },
      forNumericStatement: function (a, d, b, c, e) {
        return {
          type: "ForNumericStatement",
          variable: a,
          start: d,
          end: b,
          step: c,
          body: e,
        };
      },
      forGenericStatement: function (a, d, b) {
        return {
          type: "ForGenericStatement",
          variables: a,
          iterators: d,
          body: b,
        };
      },
      chunk: function (a) {
        return { type: "Chunk", body: a };
      },
      identifier: function (a) {
        return { type: "Identifier", name: a };
      },
      literal: function (a, d, b) {
        return {
          type:
            2 === a
              ? "StringLiteral"
              : 16 === a
                ? "NumericLiteral"
                : 64 === a
                  ? "BooleanLiteral"
                  : 128 === a
                    ? "NilLiteral"
                    : "VarargLiteral",
          value: d,
          raw: b,
        };
      },
      tableKey: function (a, d) {
        return { type: "TableKey", key: a, value: d };
      },
      tableKeyString: function (a, d) {
        return { type: "TableKeyString", key: a, value: d };
      },
      tableValue: function (a) {
        return { type: "TableValue", value: a };
      },
      tableConstructorExpression: function (a) {
        return { type: "TableConstructorExpression", fields: a };
      },
      binaryExpression: function (a, d, b) {
        return {
          type:
            "and" === a || "or" === a
              ? "LogicalExpression"
              : "BinaryExpression",
          operator: a,
          left: d,
          right: b,
        };
      },
      unaryExpression: function (a, d) {
        return { type: "UnaryExpression", operator: a, argument: d };
      },
      memberExpression: function (a, d, b) {
        return { type: "MemberExpression", indexer: d, identifier: b, base: a };
      },
      indexExpression: function (a, d) {
        return { type: "IndexExpression", base: a, index: d };
      },
      callExpression: function (a, d) {
        return { type: "CallExpression", base: a, arguments: d };
      },
      tableCallExpression: function (a, d) {
        return { type: "TableCallExpression", base: a, arguments: d };
      },
      stringCallExpression: function (a, d) {
        return { type: "StringCallExpression", base: a, argument: d };
      },
      comment: function (a, d) {
        return { type: "Comment", value: a, raw: d };
      },
    }),
    Y = Array.prototype.slice,
    ra = function (a, d) {
      for (var b = 0, c = a.length; b < c; ++b) if (a[b] === d) return b;
      return -1;
    },
    W,
    aa,
    sa,
    ma,
    ja,
    ia,
    na,
    xa;
  a.lex = q;
  var ua,
    Ba,
    Aa,
    wa = [],
    ya;
  G.prototype.complete = function () {
    Z.locations &&
      ((this.loc.end.line = sa.lastLine || sa.line),
      (this.loc.end.column = sa.range[1] - (sa.lastLineStart || sa.lineStart)));
    Z.ranges && (this.range[1] = sa.range[1]);
  };
  G.prototype.bless = function (a) {
    if (this.loc) {
      var d = this.loc;
      a.loc = {
        start: { line: d.start.line, column: d.start.column },
        end: { line: d.end.line, column: d.end.column },
      };
    }
    this.range && (a.range = [this.range[0], this.range[1]]);
  };
  a.parse = function (b, e) {
    "undefined" === typeof e &&
      "object" === typeof b &&
      ((e = b), (b = void 0));
    e || (e = {});
    X = b || "";
    Z = d(w, e);
    W = 0;
    na = 1;
    xa = 0;
    qa = X.length;
    ua = [[]];
    Ba = 0;
    Aa = [];
    wa = [];
    if (!(pa = za[Z.luaVersion]))
      throw Error(c("Lua version '%1' not supported", Z.luaVersion));
    Z.comments && (ja = []);
    return Z.wait ? a : ha();
  };
  var za = {
    5.1: {},
    5.2: {
      labels: !0,
      emptyStatement: !0,
      hexEscapes: !0,
      skipWhitespaceEscape: !0,
      strictEscapes: !0,
    },
    5.3: {
      labels: !0,
      emptyStatement: !0,
      hexEscapes: !0,
      skipWhitespaceEscape: !0,
      strictEscapes: !0,
      unicodeEscapes: !0,
      bitwiseOperators: !0,
      integerDivision: !0,
    },
    LuaJIT: {
      labels: !0,
      contextualGoto: !0,
      hexEscapes: !0,
      skipWhitespaceEscape: !0,
      strictEscapes: !0,
      unicodeEscapes: !0,
    },
  };
  a.write = la;
  a.end = ha;
});
