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
    if (wa) {
      var d = ya.pop();
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
      : ((b = U - xa + 1),
        (d = e(new SyntaxError(c("[%1:%2] %3", na, b, d)))),
        (d.index = U),
        (d.line = na));
    d.column = b;
    throw d;
  }
  function h(a, d) {
    m(d, ca.expectedToken, a, d.value);
  }
  function t(a) {
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
          return m(a, ca.unexpected, "symbol", "nil", d);
      }
      return m(a, ca.unexpected, b, a.value, d);
    }
    return m(a, ca.unexpected, "symbol", a, d);
  }
  function r() {
    for (g(); 45 === X.charCodeAt(U) && 45 === X.charCodeAt(U + 1);) {
      ia = U;
      U += 2;
      var a = X.charAt(U),
        d = "",
        b = !1,
        c = U,
        e = xa,
        h = na;
      "[" === a && ((d = u(!0)), !1 === d ? (d = a) : (b = !0));
      if (!b) {
        for (; U < qa && !B(X.charCodeAt(U));) ++U;
        Z.comments && (d = X.slice(c, U));
      }
      if (Z.comments) {
        a = P.comment(d, X.slice(ia, U));
        Z.locations &&
          (a.loc = {
            start: { line: h, column: ia - e },
            end: { line: na, column: U - xa },
          });
        Z.ranges && (a.range = [ia, U]);
        if (Z.onCreateNode) Z.onCreateNode(a);
        ja.push(a);
      }
      g();
    }
    if (U >= qa)
      return {
        type: 1,
        value: "\x3ceof\x3e",
        line: na,
        lineStart: xa,
        range: [U, U],
      };
    e = X.charCodeAt(U);
    h = X.charCodeAt(U + 1);
    ia = U;
    a =
      (65 <= e && 90 >= e) || (97 <= e && 122 >= e) || 95 === e
        ? !0
        : Z.extendedIdentifiers && 128 <= e
          ? !0
          : !1;
    if (a) {
      for (; y(X.charCodeAt(++U)););
      e = l(X.slice(ia, U));
      H(e)
        ? (h = 4)
        : "true" === e || "false" === e
          ? ((h = 64), (e = "true" === e))
          : "nil" === e
            ? ((h = 128), (e = null))
            : (h = 8);
      return { type: h, value: e, line: na, lineStart: xa, range: [ia, U] };
    }
    switch (e) {
      case 39:
      case 34:
        e = X.charCodeAt(U++);
        h = na;
        a = xa;
        d = U;
        for (b = ""; U < qa;) {
          c = X.charCodeAt(U++);
          if (e === c) break;
          if (92 === c) ((b += l(X.slice(d, U - 1)) + q()), (d = U));
          else if (U >= qa || B(c))
            ((b += X.slice(d, U - 1)),
              m({}, ca.unfinishedString, b + String.fromCharCode(c)));
        }
        b += l(X.slice(d, U - 1));
        return {
          type: 2,
          value: b,
          line: h,
          lineStart: a,
          lastLine: na,
          lastLineStart: xa,
          range: [ia, U],
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
        return k();
      case 46:
        return J(h)
          ? k()
          : 46 === h
            ? 46 === X.charCodeAt(U + 2)
              ? ((U += 3),
                {
                  type: 256,
                  value: "...",
                  line: na,
                  lineStart: xa,
                  range: [ia, U],
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
            (a = u(!1)),
            !1 === a && m(aa, ca.expected, "[", aa.value),
            {
              type: 2,
              value: l(a),
              line: e,
              lineStart: h,
              lastLine: na,
              lastLineStart: xa,
              range: [ia, U],
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
        return f(X.charAt(U));
    }
    return t(X.charAt(U));
  }
  function n() {
    var a = X.charCodeAt(U),
      d = X.charCodeAt(U + 1);
    return B(a)
      ? (10 === a && 13 === d && ++U,
        13 === a && 10 === d && ++U,
        ++na,
        (xa = ++U),
        !0)
      : !1;
  }
  function g() {
    for (; U < qa;) {
      var a = X.charCodeAt(U);
      if (9 === a || 32 === a || 11 === a || 12 === a) ++U;
      else if (!n()) break;
    }
  }
  function p(a) {
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
          ? p(a.charCodeAt(0))
          : p(
              65536 +
                (((a.charCodeAt(0) & 1023) << 10) | (a.charCodeAt(1) & 1023)),
            );
      },
    );
  }
  function f(a) {
    U += a.length;
    return { type: 32, value: a, line: na, lineStart: xa, range: [ia, U] };
  }
  function k() {
    var a = X.charAt(U),
      d = X.charAt(U + 1);
    if ("0" === a && 0 <= "xX".indexOf(d || null)) {
      var a = 0,
        b = 1,
        d = 1,
        c,
        e;
      c = U += 2;
      for (
        D(X.charCodeAt(U)) || m({}, ca.malformedNumber, X.slice(ia, U));
        D(X.charCodeAt(U));
      )
        ++U;
      c = parseInt(X.slice(c, U), 16);
      if ("." === X.charAt(U)) {
        for (e = ++U; D(X.charCodeAt(U));) ++U;
        a = X.slice(e, U);
        a = e === U ? 0 : parseInt(a, 16) / Math.pow(16, U - e);
      }
      if (0 <= "pP".indexOf(X.charAt(U) || null)) {
        ++U;
        0 <= "+-".indexOf(X.charAt(U) || null) &&
          (d = "+" === X.charAt(U++) ? 1 : -1);
        b = U;
        for (
          J(X.charCodeAt(U)) || m({}, ca.malformedNumber, X.slice(ia, U));
          J(X.charCodeAt(U));
        )
          ++U;
        b = X.slice(b, U);
        b = Math.pow(2, b * d);
      }
      a = (c + a) * b;
    } else {
      for (; J(X.charCodeAt(U));) ++U;
      if ("." === X.charAt(U)) for (++U; J(X.charCodeAt(U));) ++U;
      if (0 <= "eE".indexOf(X.charAt(U) || null))
        for (
          ++U,
            0 <= "+-".indexOf(X.charAt(U) || null) && ++U,
            J(X.charCodeAt(U)) || m({}, ca.malformedNumber, X.slice(ia, U));
          J(X.charCodeAt(U));
        )
          ++U;
      a = parseFloat(X.slice(ia, U));
    }
    return { type: 16, value: a, line: na, lineStart: xa, range: [ia, U] };
  }
  function q() {
    var a = U;
    switch (X.charAt(U)) {
      case "a":
        return (++U, "\u0007");
      case "n":
        return (++U, "\n");
      case "r":
        return (++U, "\r");
      case "t":
        return (++U, "\t");
      case "v":
        return (++U, "\x0B");
      case "b":
        return (++U, "\b");
      case "f":
        return (++U, "\f");
      case "\r":
      case "\n":
        return (n(), "\n");
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
        for (; J(X.charCodeAt(U)) && 3 > U - a;) ++U;
        a = parseInt(X.slice(a, U), 10);
        255 < a && m({}, ca.decimalEscapeTooLarge, "\\" + a);
        return String.fromCharCode(a);
      case "z":
        if (pa.skipWhitespaceEscape) return (++U, g(), "");
      case "x":
        if (pa.hexEscapes) {
          if (D(X.charCodeAt(U + 1)) && D(X.charCodeAt(U + 2)))
            return (
              (U += 3),
              String.fromCharCode(parseInt(X.slice(a + 1, U), 16))
            );
          m({}, ca.hexadecimalDigitExpected, "\\" + X.slice(a, U + 2));
        }
      case "u":
        if (pa.unicodeEscapes) {
          a = U++;
          "{" !== X.charAt(U++) &&
            m({}, ca.braceExpected, "{", "\\" + X.slice(a, U));
          for (
            D(X.charCodeAt(U)) ||
            m({}, ca.hexadecimalDigitExpected, "\\" + X.slice(a, U));
            48 === X.charCodeAt(U);
          )
            ++U;
          for (var d = U; D(X.charCodeAt(U));)
            (++U,
              6 < U - d && m({}, ca.tooLargeCodepoint, "\\" + X.slice(a, U)));
          var b = X.charAt(U++);
          "}" !== b &&
            ('"' === b || "'" === b
              ? m({}, ca.braceExpected, "}", "\\" + X.slice(a, U--))
              : m({}, ca.hexadecimalDigitExpected, "\\" + X.slice(a, U)));
          d = parseInt(X.slice(d, U - 1), 16);
          d = p(d);
          null === d && m({}, ca.tooLargeCodepoint, "\\" + X.slice(a, U));
          return d;
        }
      default:
        pa.strictEscapes && m({}, ca.invalidEscape, "\\" + X.slice(a, U + 1));
      case "\\":
      case '"':
      case "'":
        return X.charAt(U++);
    }
  }
  function u(a) {
    var d = 0,
      b = "",
      c = !1,
      e,
      f,
      h = na;
    for (++U; "\x3d" === X.charAt(U + d);) ++d;
    if ("[" !== X.charAt(U + d)) return !1;
    U += d + 1;
    B(X.charCodeAt(U)) && n();
    for (f = U; U < qa;) {
      for (; B(X.charCodeAt(U));) n();
      e = X.charAt(U++);
      if ("]" === e) {
        c = !0;
        for (e = 0; e < d; ++e) "\x3d" !== X.charAt(U + e) && (c = !1);
        "]" !== X.charAt(U + d) && (c = !1);
      }
      if (c) return ((b += X.slice(f, U - 1)), (U += d + 1), b);
    }
    m(
      {},
      a ? ca.unfinishedLongComment : ca.unfinishedLongString,
      h,
      "\x3ceof\x3e",
    );
  }
  function v() {
    sa = aa;
    aa = ma;
    ma = r();
  }
  function A(a) {
    return a === aa.value ? (v(), !0) : !1;
  }
  function C(a) {
    a === aa.value ? v() : m(aa, ca.expected, a, aa.value);
  }
  function B(a) {
    return 10 === a || 13 === a;
  }
  function J(a) {
    return 48 <= a && 57 >= a;
  }
  function D(a) {
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
  function H(a) {
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
  function N(a) {
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
  function O() {
    var a = Array.apply(null, ua[Ba++]);
    ua.push(a);
    if (Z.onCreateScope) Z.onCreateScope();
  }
  function I() {
    ua.pop();
    Ba--;
    if (Z.onDestroyScope) Z.onDestroyScope();
  }
  function x(a) {
    if (Z.onLocalDeclaration) Z.onLocalDeclaration(a);
    -1 === ra(ua[Ba], a) && ua[Ba].push(a);
  }
  function K(a) {
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
    return new z(aa);
  }
  function z(a) {
    Z.locations &&
      (this.loc = {
        start: { line: a.line, column: a.range[0] - a.lineStart },
        end: { line: 0, column: 0 },
      });
    Z.ranges && (this.range = [a.range[0], 0]);
  }
  function G() {
    wa && ya.push(F());
  }
  function L(a) {
    wa && ya.push(a);
  }
  function M() {
    v();
    G();
    Z.scope && O();
    var a = Q();
    Z.scope && I();
    1 !== aa.type && t(aa);
    wa && !a.length && (sa = aa);
    return b(P.chunk(a));
  }
  function Q(a) {
    a = [];
    for (var d; !N(aa);) {
      if ("return" === aa.value) {
        a.push(V());
        break;
      }
      d = V();
      A(";");
      d && a.push(d);
    }
    return a;
  }
  function V() {
    G();
    if (4 === aa.type)
      switch (aa.value) {
        case "local":
          v();
          var a;
          var d;
          if (8 === aa.type) {
            a = [];
            var c = [];
            do ((d = T()), a.push(d));
            while (A(","));
            if (A("\x3d")) {
              do ((d = fa()), c.push(d));
              while (A(","));
            }
            if (Z.scope) {
              d = 0;
              for (var e = a.length; d < e; ++d) K(a[d]);
            }
            a = b(P.localStatement(a, c));
          } else
            A("function")
              ? ((d = T()), Z.scope && (K(d), O()), (a = da(d, !0)))
              : (h("\x3cname\x3e", aa), (a = void 0));
          return a;
        case "if":
          v();
          c = [];
          wa && ((a = ya[ya.length - 1]), ya.push(a));
          d = fa();
          C("then");
          Z.scope && O();
          e = Q();
          Z.scope && I();
          c.push(b(P.ifClause(d, e)));
          for (wa && (a = F()); A("elseif");)
            (L(a),
              (d = fa()),
              C("then"),
              Z.scope && O(),
              (e = Q()),
              Z.scope && I(),
              c.push(b(P.elseifClause(d, e))),
              wa && (a = F()));
          A("else") &&
            (wa && ((a = new z(sa)), ya.push(a)),
            Z.scope && O(),
            (e = Q()),
            Z.scope && I(),
            c.push(b(P.elseClause(e))));
          C("end");
          return b(P.ifStatement(c));
        case "return":
          v();
          a = [];
          if ("end" !== aa.value) {
            c = ta(0);
            for (null != c && a.push(c); A(",");) ((c = fa()), a.push(c));
            A(";");
          }
          return b(P.returnStatement(a));
        case "function":
          v();
          wa && (c = F());
          a = T();
          Z.scope && (E(a, -1 !== ra(ua[Ba], a.name)), O());
          for (; A(".");)
            (L(c), (d = T()), (a = b(P.memberExpression(a, ".", d))));
          A(":") &&
            (L(c),
            (d = T()),
            (a = b(P.memberExpression(a, ":", d))),
            Z.scope && x("self"));
          return da(a);
        case "while":
          return (
            v(),
            (a = fa()),
            C("do"),
            Z.scope && O(),
            (c = Q()),
            Z.scope && I(),
            C("end"),
            b(P.whileStatement(a, c))
          );
        case "for":
          v();
          c = T();
          Z.scope && (O(), K(c));
          if (A("\x3d")) {
            d = fa();
            C(",");
            var e = fa(),
              f = A(",") ? fa() : null;
            C("do");
            a = Q();
            C("end");
            Z.scope && I();
            a = b(P.forNumericStatement(c, d, e, f, a));
          } else {
            for (d = [c]; A(",");) ((c = T()), Z.scope && K(c), d.push(c));
            C("in");
            c = [];
            do ((a = fa()), c.push(a));
            while (A(","));
            C("do");
            a = Q();
            C("end");
            Z.scope && I();
            a = b(P.forGenericStatement(d, c, a));
          }
          return a;
        case "repeat":
          return (
            v(),
            Z.scope && O(),
            (a = Q()),
            C("until"),
            (c = fa()),
            Z.scope && I(),
            b(P.repeatStatement(c, a))
          );
        case "break":
          return (v(), b(P.breakStatement()));
        case "do":
          return (
            v(),
            Z.scope && O(),
            (a = Q()),
            Z.scope && I(),
            C("end"),
            b(P.doStatement(a))
          );
        case "goto":
          return (v(), W());
      }
    if (
      pa.contextualGoto &&
      8 === aa.type &&
      "goto" === aa.value &&
      8 === ma.type &&
      "goto" !== ma.value
    )
      return (v(), W());
    if (32 === aa.type && A("::"))
      return (
        (a = aa.value),
        (c = T()),
        Z.scope && (x("::" + a + "::"), E(c, !0)),
        C("::"),
        b(P.labelStatement(c))
      );
    wa && ya.pop();
    if (!pa.emptyStatement || !A(";")) return S();
  }
  function W() {
    var a = T();
    return b(P.gotoStatement(a));
  }
  function ba(a) {
    (a.inParens ||
      -1 ===
        ["Identifier", "MemberExpression", "IndexExpression"].indexOf(
          a.type,
        )) &&
      m(aa, ca.invalidVar, aa.value);
  }
  function S() {
    var a = aa,
      d,
      c;
    wa && (c = F());
    d = oa();
    if (null == d) return t(aa);
    if (0 <= ",\x3d".indexOf(aa.value)) {
      var a = [d],
        e = [];
      for (ba(d); A(",");)
        ((d = oa()),
          null == d && h("\x3cexpression\x3e", aa),
          ba(d),
          a.push(d));
      C("\x3d");
      do ((d = fa()), e.push(d));
      while (A(","));
      L(c);
      return b(P.assignmentStatement(a, e));
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
    return e ? (L(c), b(P.callStatement(d))) : t(a);
  }
  function T() {
    G();
    var a = aa.value;
    8 !== aa.type && h("\x3cname\x3e", aa);
    v();
    return b(P.identifier(a));
  }
  function da(a, d) {
    var c = [];
    C("(");
    if (!A(")"))
      for (;;) {
        if (8 === aa.type) {
          var e = T();
          Z.scope && K(e);
          c.push(e);
          if (A(",")) continue;
        } else 256 === aa.type ? c.push(ga()) : h("\x3cname\x3e or '...'", aa);
        C(")");
        break;
      }
    e = Q();
    C("end");
    Z.scope && I();
    return b(P.functionStatement(a, c, d || !1, e));
  }
  function R() {
    for (var a = [], d, c; ;) {
      G();
      if (32 === aa.type && A("["))
        ((d = fa()),
          C("]"),
          C("\x3d"),
          (c = fa()),
          a.push(b(P.tableKey(d, c))));
      else if (8 === aa.type)
        "\x3d" === ma.value
          ? ((d = T()), v(), (c = fa()), a.push(b(P.tableKeyString(d, c))))
          : ((c = fa()), a.push(b(P.tableValue(c))));
      else {
        if (null == (c = ta(0))) {
          ya.pop();
          break;
        }
        a.push(b(P.tableValue(c)));
      }
      if (0 <= ",;".indexOf(aa.value)) v();
      else break;
    }
    C("}");
    return b(P.tableConstructorExpression(a));
  }
  function fa() {
    var a = ta(0);
    if (null == a) h("\x3cexpression\x3e", aa);
    else return a;
  }
  function ea(a) {
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
    wa && (e = F());
    var f;
    f = aa;
    f =
      32 === f.type
        ? 0 <= "#-~".indexOf(f.value)
        : 4 === f.type
          ? "not" === f.value
          : !1;
    f &&
      (G(),
      v(),
      (c = ta(10)),
      null == c && h("\x3cexpression\x3e", aa),
      (c = b(P.unaryExpression(d, c))));
    null == c && ((c = ga()), null == c && (c = oa()));
    if (null == c) return null;
    for (;;) {
      d = aa.value;
      f = 32 === aa.type || 4 === aa.type ? ea(d) : 0;
      if (0 === f || f <= a) break;
      ("^" !== d && ".." !== d) || f--;
      v();
      f = ta(f);
      null == f && h("\x3cexpression\x3e", aa);
      wa && ya.push(e);
      c = b(P.binaryExpression(d, c, f));
    }
    return c;
  }
  function oa() {
    var a, d, c;
    wa && (c = F());
    if (8 === aa.type)
      ((d = aa.value), (a = T()), Z.scope && E(a, -1 !== ra(ua[Ba], d)));
    else if (A("(")) ((a = fa()), C(")"), (a.inParens = !0));
    else return null;
    for (;;)
      if (32 === aa.type)
        switch (aa.value) {
          case "[":
            L(c);
            v();
            d = fa();
            C("]");
            a = b(P.indexExpression(a, d));
            break;
          case ".":
            L(c);
            v();
            d = T();
            a = b(P.memberExpression(a, ".", d));
            break;
          case ":":
            L(c);
            v();
            d = T();
            a = b(P.memberExpression(a, ":", d));
            L(c);
            a = ka(a);
            break;
          case "(":
          case "{":
            L(c);
            a = ka(a);
            break;
          default:
            return a;
        }
      else if (2 === aa.type) (L(c), (a = ka(a)));
      else break;
    return a;
  }
  function ka(a) {
    if (32 === aa.type)
      switch (aa.value) {
        case "(":
          pa.emptyStatement ||
            (aa.line !== sa.line && m({}, ca.ambiguousSyntax, aa.value));
          v();
          var d = [],
            c = ta(0);
          for (null != c && d.push(c); A(",");) ((c = fa()), d.push(c));
          C(")");
          return b(P.callExpression(a, d));
        case "{":
          return (G(), v(), (d = R()), b(P.tableCallExpression(a, d)));
      }
    else if (2 === aa.type) return b(P.stringCallExpression(a, ga()));
    h("function arguments", aa);
  }
  function ga() {
    var a = aa.value,
      d = aa.type,
      c;
    wa && (c = F());
    if (d & 466)
      return (
        L(c),
        (c = X.slice(aa.range[0], aa.range[1])),
        v(),
        b(P.literal(d, a, c))
      );
    if (4 === d && "function" === a)
      return (L(c), v(), Z.scope && O(), da(null));
    if (A("{")) return (L(c), R());
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
    wa = Z.locations || Z.ranges;
    ma = r();
    a = M();
    Z.comments && (a.comments = ja);
    Z.scope && (a.globals = Aa);
    if (0 < ya.length)
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
  var ca = (a.errors = {
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
    P = (a.ast = {
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
    U,
    aa,
    sa,
    ma,
    ja,
    ia,
    na,
    xa;
  a.lex = r;
  var ua,
    Ba,
    Aa,
    ya = [],
    wa;
  z.prototype.complete = function () {
    Z.locations &&
      ((this.loc.end.line = sa.lastLine || sa.line),
      (this.loc.end.column = sa.range[1] - (sa.lastLineStart || sa.lineStart)));
    Z.ranges && (this.range[1] = sa.range[1]);
  };
  z.prototype.bless = function (a) {
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
    U = 0;
    na = 1;
    xa = 0;
    qa = X.length;
    ua = [[]];
    Ba = 0;
    Aa = [];
    ya = [];
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
