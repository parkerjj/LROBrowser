(function (a, b) {
  function c(a) {
    var d = a.length,
      b = w.type(a);
    return w.isWindow(a)
      ? !1
      : 1 === a.nodeType && d
        ? !0
        : "array" === b ||
          ("function" !== b &&
            (0 === d || ("number" === typeof d && 0 < d && d - 1 in a)));
  }
  function d(a) {
    var d = (Aa[a] = {});
    w.each(a.match(O) || [], function (a, b) {
      d[b] = !0;
    });
    return d;
  }
  function e(a, d, c, e) {
    if (w.acceptData(a)) {
      var f = w.expando,
        h = "string" === typeof d,
        m = a.nodeType,
        q = m ? w.cache : a,
        g = m ? a[f] : a[f] && f;
      if ((g && q[g] && (e || q[g].data)) || !h || c !== b) {
        g || (m ? (a[f] = g = la.pop() || w.guid++) : (g = f));
        q[g] || ((q[g] = {}), m || (q[g].toJSON = w.noop));
        if ("object" === typeof d || "function" === typeof d)
          e ? (q[g] = w.extend(q[g], d)) : (q[g].data = w.extend(q[g].data, d));
        a = q[g];
        e || (a.data || (a.data = {}), (a = a.data));
        c !== b && (a[w.camelCase(d)] = c);
        h ? ((c = a[d]), null == c && (c = a[w.camelCase(d)])) : (c = a);
        return c;
      }
    }
  }
  function l(a, d, b) {
    if (w.acceptData(a)) {
      var c,
        e,
        f,
        h = a.nodeType,
        m = h ? w.cache : a,
        q = h ? a[w.expando] : w.expando;
      if (m[q]) {
        if (d && (f = b ? m[q] : m[q].data)) {
          w.isArray(d)
            ? (d = d.concat(w.map(d, w.camelCase)))
            : d in f
              ? (d = [d])
              : ((d = w.camelCase(d)), (d = d in f ? [d] : d.split(" ")));
          c = 0;
          for (e = d.length; c < e; c++) delete f[d[c]];
          if (!(b ? r : w.isEmptyObject)(f)) return;
        }
        if (!b && (delete m[q].data, !r(m[q]))) return;
        h
          ? w.cleanData([a], !0)
          : w.support.deleteExpando || m != m.window
            ? delete m[q]
            : (m[q] = null);
      }
    }
  }
  function h(a, d, c) {
    if (c === b && 1 === a.nodeType)
      if (
        ((c = "data-" + d.replace(ya, "-$1").toLowerCase()),
        (c = a.getAttribute(c)),
        "string" === typeof c)
      ) {
        try {
          c =
            "true" === c
              ? !0
              : "false" === c
                ? !1
                : "null" === c
                  ? null
                  : +c + "" === c
                    ? +c
                    : xa.test(c)
                      ? w.parseJSON(c)
                      : c;
        } catch (pb) {}
        w.data(a, d, c);
      } else c = b;
    return c;
  }
  function r(a) {
    for (var d in a)
      if (("data" !== d || !w.isEmptyObject(a[d])) && "toJSON" !== d) return !1;
    return !0;
  }
  function t() {
    return !0;
  }
  function n() {
    return !1;
  }
  function g(a, d) {
    do a = a[d];
    while (a && 1 !== a.nodeType);
    return a;
  }
  function p(a, d, b) {
    d = d || 0;
    if (w.isFunction(d))
      return w.grep(a, function (a, c) {
        return !!d.call(a, c, a) === b;
      });
    if (d.nodeType)
      return w.grep(a, function (a) {
        return (a === d) === b;
      });
    if ("string" === typeof d) {
      var c = w.grep(a, function (a) {
        return 1 === a.nodeType;
      });
      if (Wa.test(d)) return w.filter(d, c, !b);
      d = w.filter(d, c);
    }
    return w.grep(a, function (a) {
      return 0 <= w.inArray(a, d) === b;
    });
  }
  function k(a) {
    var d = bb.split("|");
    a = a.createDocumentFragment();
    if (a.createElement) for (; d.length;) a.createElement(d.pop());
    return a;
  }
  function f(a, d) {
    return (
      a.getElementsByTagName(d)[0] ||
      a.appendChild(a.ownerDocument.createElement(d))
    );
  }
  function m(a) {
    var d = a.getAttributeNode("type");
    a.type = (d && d.specified) + "/" + a.type;
    return a;
  }
  function q(a) {
    var d = Ob.exec(a.type);
    d ? (a.type = d[1]) : a.removeAttribute("type");
    return a;
  }
  function v(a, d) {
    for (var b, c = 0; null != (b = a[c]); c++)
      w._data(b, "globalEval", !d || w._data(d[c], "globalEval"));
  }
  function u(a, d) {
    if (1 === d.nodeType && w.hasData(a)) {
      var b, c, e;
      c = w._data(a);
      a = w._data(d, c);
      var f = c.events;
      if (f)
        for (b in (delete a.handle, (a.events = {}), f))
          for (c = 0, e = f[b].length; c < e; c++) w.event.add(d, b, f[b][c]);
      a.data && (a.data = w.extend({}, a.data));
    }
  }
  function A(a, d) {
    var c,
      e,
      f = 0,
      h =
        typeof a.getElementsByTagName !== da
          ? a.getElementsByTagName(d || "*")
          : typeof a.querySelectorAll !== da
            ? a.querySelectorAll(d || "*")
            : b;
    if (!h)
      for (h = [], c = a.childNodes || a; null != (e = c[f]); f++)
        !d || w.nodeName(e, d) ? h.push(e) : w.merge(h, A(e, d));
    return d === b || (d && w.nodeName(a, d)) ? w.merge([a], h) : h;
  }
  function D(a) {
    qb.test(a.type) && (a.defaultChecked = a.checked);
  }
  function B(a, d) {
    if (d in a) return d;
    for (
      var b = d.charAt(0).toUpperCase() + d.slice(1), c = d, e = zb.length;
      e--;
    )
      if (((d = zb[e] + b), d in a)) return d;
    return c;
  }
  function H(a, d) {
    a = d || a;
    return "none" === w.css(a, "display") || !w.contains(a.ownerDocument, a);
  }
  function C(a, d) {
    for (var b, c, e, f = [], h = 0, m = a.length; h < m; h++)
      ((c = a[h]),
        c.style &&
          ((f[h] = w._data(c, "olddisplay")),
          (b = c.style.display),
          d
            ? (f[h] || "none" !== b || (c.style.display = ""),
              "" === c.style.display &&
                H(c) &&
                (f[h] = w._data(c, "olddisplay", N(c.nodeName))))
            : f[h] ||
              ((e = H(c)),
              ((b && "none" !== b) || !e) &&
                w._data(c, "olddisplay", e ? b : w.css(c, "display")))));
    for (h = 0; h < m; h++)
      ((c = a[h]),
        !c.style ||
          (d && "none" !== c.style.display && "" !== c.style.display) ||
          (c.style.display = d ? f[h] || "" : "none"));
    return a;
  }
  function z(a, d, b) {
    return (a = Pb.exec(d)) ? Math.max(0, a[1] - (b || 0)) + (a[2] || "px") : d;
  }
  function G(a, d, b, c, e) {
    d = b === (c ? "border" : "content") ? 4 : "width" === d ? 1 : 0;
    for (var f = 0; 4 > d; d += 2)
      ("margin" === b && (f += w.css(a, b + Qa[d], !0, e)),
        c
          ? ("content" === b && (f -= w.css(a, "padding" + Qa[d], !0, e)),
            "margin" !== b &&
              (f -= w.css(a, "border" + Qa[d] + "Width", !0, e)))
          : ((f += w.css(a, "padding" + Qa[d], !0, e)),
            "padding" !== b &&
              (f += w.css(a, "border" + Qa[d] + "Width", !0, e))));
    return f;
  }
  function P(a, d, b) {
    var c = !0,
      e = "width" === d ? a.offsetWidth : a.offsetHeight,
      f = Ra(a),
      h = w.support.boxSizing && "border-box" === w.css(a, "boxSizing", !1, f);
    if (0 >= e || null == e) {
      e = Sa(a, d, f);
      if (0 > e || null == e) e = a.style[d];
      if (ib.test(e)) return e;
      c = h && (w.support.boxSizingReliable || e === a.style[d]);
      e = parseFloat(e) || 0;
    }
    return e + G(a, d, b || (h ? "border" : "content"), c, f) + "px";
  }
  function N(a) {
    var d = R,
      b = Ab[a];
    b ||
      ((b = I(a, d)),
      ("none" !== b && b) ||
        ((cb = (
          cb ||
          w(
            "\x3ciframe frameborder\x3d'0' width\x3d'0' height\x3d'0'/\x3e",
          ).css("cssText", "display:block !important")
        ).appendTo(d.documentElement)),
        (d = (cb[0].contentWindow || cb[0].contentDocument).document),
        d.write("\x3c!doctype html\x3e\x3chtml\x3e\x3cbody\x3e"),
        d.close(),
        (b = I(a, d)),
        cb.detach()),
      (Ab[a] = b));
    return b;
  }
  function I(a, d) {
    a = w(d.createElement(a)).appendTo(d.body);
    d = w.css(a[0], "display");
    a.remove();
    return d;
  }
  function x(a, d, b, c) {
    var e;
    if (w.isArray(d))
      w.each(d, function (d, e) {
        b || Qb.test(a)
          ? c(a, e)
          : x(a + "[" + ("object" === typeof e ? d : "") + "]", e, b, c);
      });
    else if (b || "object" !== w.type(d)) c(a, d);
    else for (e in d) x(a + "[" + e + "]", d[e], b, c);
  }
  function J(a) {
    return function (d, b) {
      "string" !== typeof d && ((b = d), (d = "*"));
      var c = 0,
        e = d.toLowerCase().match(O) || [];
      if (w.isFunction(b))
        for (; (d = e[c++]);)
          "+" === d[0]
            ? ((d = d.slice(1) || "*"), (a[d] = a[d] || []).unshift(b))
            : (a[d] = a[d] || []).push(b);
    };
  }
  function E(a, d, b, c) {
    function e(m) {
      var q;
      f[m] = !0;
      w.each(a[m] || [], function (a, m) {
        a = m(d, b, c);
        if ("string" === typeof a && !h && !f[a])
          return (d.dataTypes.unshift(a), e(a), !1);
        if (h) return !(q = a);
      });
      return q;
    }
    var f = {},
      h = a === rb;
    return e(d.dataTypes[0]) || (!f["*"] && e("*"));
  }
  function L(a, d) {
    var c,
      e,
      f = w.ajaxSettings.flatOptions || {};
    for (e in d) d[e] !== b && ((f[e] ? a : c || (c = {}))[e] = d[e]);
    c && w.extend(!0, a, c);
    return a;
  }
  function y() {
    try {
      return new a.XMLHttpRequest();
    } catch (hb) {}
  }
  function F() {
    setTimeout(function () {
      Xa = b;
    });
    return (Xa = w.now());
  }
  function K(a, d) {
    w.each(d, function (d, b) {
      for (
        var c = (db[d] || []).concat(db["*"]), e = 0, f = c.length;
        e < f && !c[e].call(a, d, b);
        e++
      );
    });
  }
  function M(a, d, b) {
    var c,
      e = 0,
      f = jb.length,
      h = w.Deferred().always(function () {
        delete m.elem;
      }),
      m = function () {
        if (c) return !1;
        for (
          var d = Xa || F(),
            d = Math.max(0, q.startTime + q.duration - d),
            b = 1 - (d / q.duration || 0),
            e = 0,
            f = q.tweens.length;
          e < f;
          e++
        )
          q.tweens[e].run(b);
        h.notifyWith(a, [q, b, d]);
        if (1 > b && f) return d;
        h.resolveWith(a, [q]);
        return !1;
      },
      q = h.promise({
        elem: a,
        props: w.extend({}, d),
        opts: w.extend(!0, { specialEasing: {} }, b),
        originalProperties: d,
        originalOptions: b,
        startTime: Xa || F(),
        duration: b.duration,
        tweens: [],
        createTween: function (d, b) {
          d = w.Tween(
            a,
            q.opts,
            d,
            b,
            q.opts.specialEasing[d] || q.opts.easing,
          );
          q.tweens.push(d);
          return d;
        },
        stop: function (d) {
          var b = 0,
            e = d ? q.tweens.length : 0;
          if (c) return this;
          for (c = !0; b < e; b++) q.tweens[b].run(1);
          d ? h.resolveWith(a, [q, d]) : h.rejectWith(a, [q, d]);
          return this;
        },
      });
    b = q.props;
    for (Q(b, q.opts.specialEasing); e < f; e++)
      if ((d = jb[e].call(q, a, b, q.opts))) return d;
    K(q, b);
    w.isFunction(q.opts.start) && q.opts.start.call(a, q);
    w.fx.timer(w.extend(m, { elem: a, anim: q, queue: q.opts.queue }));
    return q
      .progress(q.opts.progress)
      .done(q.opts.done, q.opts.complete)
      .fail(q.opts.fail)
      .always(q.opts.always);
  }
  function Q(a, d) {
    var b, c, e, f, h;
    for (e in a)
      if (
        ((c = w.camelCase(e)),
        (f = d[c]),
        (b = a[e]),
        w.isArray(b) && ((f = b[1]), (b = a[e] = b[0])),
        e !== c && ((a[c] = b), delete a[e]),
        (h = w.cssHooks[c]) && "expand" in h)
      )
        for (e in ((b = h.expand(b)), delete a[c], b))
          e in a || ((a[e] = b[e]), (d[e] = f));
      else d[c] = f;
  }
  function W(a, d, b, c, e) {
    return new W.prototype.init(a, d, b, c, e);
  }
  function V(a, d) {
    var b,
      c = { height: a },
      e = 0;
    for (d = d ? 1 : 0; 4 > e; e += 2 - d)
      ((b = Qa[e]), (c["margin" + b] = c["padding" + b] = a));
    d && (c.opacity = c.width = a);
    return c;
  }
  function ba(a) {
    return w.isWindow(a)
      ? a
      : 9 === a.nodeType
        ? a.defaultView || a.parentWindow
        : !1;
  }
  var S,
    T,
    da = typeof b,
    R = a.document,
    fa = a.location,
    ea = a.jQuery,
    ta = a.$,
    oa = {},
    la = [],
    ga = la.concat,
    ka = la.push,
    ha = la.slice,
    X = la.indexOf,
    Z = oa.toString,
    qa = oa.hasOwnProperty,
    pa = "1.9.1".trim,
    w = function (a, d) {
      return new w.fn.init(a, d, T);
    },
    ca = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
    O = /\S+/g,
    Y = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
    ra = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,
    U = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    aa = /^[\],:{}\s]*$/,
    sa = /(?:^|:|,)(?:\s*\[)+/g,
    ma = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
    ja = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,
    ia = /^-ms-/,
    na = /-([\da-z])/gi,
    wa = function (a, d) {
      return d.toUpperCase();
    },
    ua = function (a) {
      if (
        R.addEventListener ||
        "load" === a.type ||
        "complete" === R.readyState
      )
        (Ba(), w.ready());
    },
    Ba = function () {
      R.addEventListener
        ? (R.removeEventListener("DOMContentLoaded", ua, !1),
          a.removeEventListener("load", ua, !1))
        : (R.detachEvent("onreadystatechange", ua),
          a.detachEvent("onload", ua));
    };
  w.fn = w.prototype = {
    jquery: "1.9.1",
    constructor: w,
    init: function (a, d, c) {
      var e;
      if (!a) return this;
      if ("string" === typeof a) {
        e =
          "\x3c" === a.charAt(0) &&
          "\x3e" === a.charAt(a.length - 1) &&
          3 <= a.length
            ? [null, a, null]
            : ra.exec(a);
        if (!e || (!e[1] && d))
          return !d || d.jquery
            ? (d || c).find(a)
            : this.constructor(d).find(a);
        if (e[1]) {
          if (
            ((d = d instanceof w ? d[0] : d),
            w.merge(
              this,
              w.parseHTML(e[1], d && d.nodeType ? d.ownerDocument || d : R, !0),
            ),
            U.test(e[1]) && w.isPlainObject(d))
          )
            for (e in d)
              if (w.isFunction(this[e])) this[e](d[e]);
              else this.attr(e, d[e]);
        } else {
          if ((d = R.getElementById(e[2])) && d.parentNode) {
            if (d.id !== e[2]) return c.find(a);
            this.length = 1;
            this[0] = d;
          }
          this.context = R;
          this.selector = a;
        }
        return this;
      }
      if (a.nodeType)
        return ((this.context = this[0] = a), (this.length = 1), this);
      if (w.isFunction(a)) return c.ready(a);
      a.selector !== b &&
        ((this.selector = a.selector), (this.context = a.context));
      return w.makeArray(a, this);
    },
    selector: "",
    length: 0,
    size: function () {
      return this.length;
    },
    toArray: function () {
      return ha.call(this);
    },
    get: function (a) {
      return null == a
        ? this.toArray()
        : 0 > a
          ? this[this.length + a]
          : this[a];
    },
    pushStack: function (a) {
      a = w.merge(this.constructor(), a);
      a.prevObject = this;
      a.context = this.context;
      return a;
    },
    each: function (a, d) {
      return w.each(this, a, d);
    },
    ready: function (a) {
      w.ready.promise().done(a);
      return this;
    },
    slice: function () {
      return this.pushStack(ha.apply(this, arguments));
    },
    first: function () {
      return this.eq(0);
    },
    last: function () {
      return this.eq(-1);
    },
    eq: function (a) {
      var d = this.length;
      a = +a + (0 > a ? d : 0);
      return this.pushStack(0 <= a && a < d ? [this[a]] : []);
    },
    map: function (a) {
      return this.pushStack(
        w.map(this, function (d, b) {
          return a.call(d, b, d);
        }),
      );
    },
    end: function () {
      return this.prevObject || this.constructor(null);
    },
    push: ka,
    sort: [].sort,
    splice: [].splice,
  };
  w.fn.init.prototype = w.fn;
  w.extend = w.fn.extend = function () {
    var a,
      d,
      c,
      e,
      f,
      h = arguments[0] || {},
      m = 1,
      q = arguments.length,
      g = !1;
    "boolean" === typeof h && ((g = h), (h = arguments[1] || {}), (m = 2));
    "object" === typeof h || w.isFunction(h) || (h = {});
    q === m && ((h = this), --m);
    for (; m < q; m++)
      if (null != (f = arguments[m]))
        for (e in f)
          ((a = h[e]),
            (c = f[e]),
            h !== c &&
              (g && c && (w.isPlainObject(c) || (d = w.isArray(c)))
                ? (d
                    ? ((d = !1), (a = a && w.isArray(a) ? a : []))
                    : (a = a && w.isPlainObject(a) ? a : {}),
                  (h[e] = w.extend(g, a, c)))
                : c !== b && (h[e] = c)));
    return h;
  };
  w.extend({
    noConflict: function (d) {
      a.$ === w && (a.$ = ta);
      d && a.jQuery === w && (a.jQuery = ea);
      return w;
    },
    isReady: !1,
    readyWait: 1,
    holdReady: function (a) {
      a ? w.readyWait++ : w.ready(!0);
    },
    ready: function (a) {
      if (!0 === a ? !--w.readyWait : !w.isReady) {
        if (!R.body) return setTimeout(w.ready);
        w.isReady = !0;
        (!0 !== a && 0 < --w.readyWait) ||
          (S.resolveWith(R, [w]),
          w.fn.trigger && w(R).trigger("ready").off("ready"));
      }
    },
    isFunction: function (a) {
      return "function" === w.type(a);
    },
    isArray:
      Array.isArray ||
      function (a) {
        return "array" === w.type(a);
      },
    isWindow: function (a) {
      return null != a && a == a.window;
    },
    isNumeric: function (a) {
      return !isNaN(parseFloat(a)) && isFinite(a);
    },
    type: function (a) {
      return null == a
        ? String(a)
        : "object" === typeof a || "function" === typeof a
          ? oa[Z.call(a)] || "object"
          : typeof a;
    },
    isPlainObject: function (a) {
      if (!a || "object" !== w.type(a) || a.nodeType || w.isWindow(a))
        return !1;
      try {
        if (
          a.constructor &&
          !qa.call(a, "constructor") &&
          !qa.call(a.constructor.prototype, "isPrototypeOf")
        )
          return !1;
      } catch (Nb) {
        return !1;
      }
      for (var d in a);
      return d === b || qa.call(a, d);
    },
    isEmptyObject: function (a) {
      for (var d in a) return !1;
      return !0;
    },
    error: function (a) {
      throw Error(a);
    },
    parseHTML: function (a, d, b) {
      if (!a || "string" !== typeof a) return null;
      "boolean" === typeof d && ((b = d), (d = !1));
      d = d || R;
      var c = U.exec(a);
      b = !b && [];
      if (c) return [d.createElement(c[1])];
      c = w.buildFragment([a], d, b);
      b && w(b).remove();
      return w.merge([], c.childNodes);
    },
    parseJSON: function (d) {
      if (a.JSON && a.JSON.parse) return a.JSON.parse(d);
      if (null === d) return d;
      if (
        "string" === typeof d &&
        (d = w.trim(d)) &&
        aa.test(d.replace(ma, "@").replace(ja, "]").replace(sa, ""))
      )
        return new Function("return " + d)();
      w.error("Invalid JSON: " + d);
    },
    parseXML: function (d) {
      var c, e;
      if (!d || "string" !== typeof d) return null;
      try {
        a.DOMParser
          ? ((e = new DOMParser()), (c = e.parseFromString(d, "text/xml")))
          : ((c = new ActiveXObject("Microsoft.XMLDOM")),
            (c.async = "false"),
            c.loadXML(d));
      } catch (pb) {
        c = b;
      }
      (c &&
        c.documentElement &&
        !c.getElementsByTagName("parsererror").length) ||
        w.error("Invalid XML: " + d);
      return c;
    },
    noop: function () {},
    globalEval: function (d) {
      d &&
        w.trim(d) &&
        (
          a.execScript ||
          function (d) {
            a.eval.call(a, d);
          }
        )(d);
    },
    camelCase: function (a) {
      return a.replace(ia, "ms-").replace(na, wa);
    },
    nodeName: function (a, d) {
      return a.nodeName && a.nodeName.toLowerCase() === d.toLowerCase();
    },
    each: function (a, d, b) {
      var e,
        f = 0,
        h = a.length;
      e = c(a);
      if (b)
        if (e) for (; f < h && ((e = d.apply(a[f], b)), !1 !== e); f++);
        else
          for (f in a) {
            if (((e = d.apply(a[f], b)), !1 === e)) break;
          }
      else if (e) for (; f < h && ((e = d.call(a[f], f, a[f])), !1 !== e); f++);
      else for (f in a) if (((e = d.call(a[f], f, a[f])), !1 === e)) break;
      return a;
    },
    trim:
      pa && !pa.call("\ufeff\u00a0")
        ? function (a) {
            return null == a ? "" : pa.call(a);
          }
        : function (a) {
            return null == a ? "" : (a + "").replace(Y, "");
          },
    makeArray: function (a, d) {
      d = d || [];
      null != a &&
        (c(Object(a))
          ? w.merge(d, "string" === typeof a ? [a] : a)
          : ka.call(d, a));
      return d;
    },
    inArray: function (a, d, b) {
      var c;
      if (d) {
        if (X) return X.call(d, a, b);
        c = d.length;
        for (b = b ? (0 > b ? Math.max(0, c + b) : b) : 0; b < c; b++)
          if (b in d && d[b] === a) return b;
      }
      return -1;
    },
    merge: function (a, d) {
      var c = d.length,
        e = a.length,
        f = 0;
      if ("number" === typeof c) for (; f < c; f++) a[e++] = d[f];
      else for (; d[f] !== b;) a[e++] = d[f++];
      a.length = e;
      return a;
    },
    grep: function (a, d, b) {
      var c,
        e = [],
        f = 0,
        h = a.length;
      for (b = !!b; f < h; f++) ((c = !!d(a[f], f)), b !== c && e.push(a[f]));
      return e;
    },
    map: function (a, d, b) {
      var e,
        f = 0,
        h = a.length,
        m = [];
      if (c(a))
        for (; f < h; f++)
          ((e = d(a[f], f, b)), null != e && (m[m.length] = e));
      else for (f in a) ((e = d(a[f], f, b)), null != e && (m[m.length] = e));
      return ga.apply([], m);
    },
    guid: 1,
    proxy: function (a, d) {
      var c, e;
      "string" === typeof d && ((e = a[d]), (d = a), (a = e));
      if (!w.isFunction(a)) return b;
      c = ha.call(arguments, 2);
      e = function () {
        return a.apply(d || this, c.concat(ha.call(arguments)));
      };
      e.guid = a.guid = a.guid || w.guid++;
      return e;
    },
    access: function (a, d, c, e, f, h, m) {
      var q = 0,
        g = a.length,
        l = null == c;
      if ("object" === w.type(c))
        for (q in ((f = !0), c)) w.access(a, d, q, c[q], !0, h, m);
      else if (
        e !== b &&
        ((f = !0),
        w.isFunction(e) || (m = !0),
        l &&
          (m
            ? (d.call(a, e), (d = null))
            : ((l = d),
              (d = function (a, d, b) {
                return l.call(w(a), b);
              }))),
        d)
      )
        for (; q < g; q++) d(a[q], c, m ? e : e.call(a[q], q, d(a[q], c)));
      return f ? a : l ? d.call(a) : g ? d(a[0], c) : h;
    },
    now: function () {
      return new Date().getTime();
    },
  });
  w.ready.promise = function (d) {
    if (!S)
      if (((S = w.Deferred()), "complete" === R.readyState))
        setTimeout(w.ready);
      else if (R.addEventListener)
        (R.addEventListener("DOMContentLoaded", ua, !1),
          a.addEventListener("load", ua, !1));
      else {
        R.attachEvent("onreadystatechange", ua);
        a.attachEvent("onload", ua);
        var b = !1;
        try {
          b = null == a.frameElement && R.documentElement;
        } catch (Nb) {}
        b &&
          b.doScroll &&
          (function pb() {
            if (!w.isReady) {
              try {
                b.doScroll("left");
              } catch (lc) {
                return setTimeout(pb, 50);
              }
              Ba();
              w.ready();
            }
          })();
      }
    return S.promise(d);
  };
  w.each(
    "Boolean Number String Function Array Date RegExp Object Error".split(" "),
    function (a, d) {
      oa["[object " + d + "]"] = d.toLowerCase();
    },
  );
  T = w(R);
  var Aa = {};
  w.Callbacks = function (a) {
    a = "string" === typeof a ? Aa[a] || d(a) : w.extend({}, a);
    var c,
      e,
      f,
      h,
      m,
      q,
      g = [],
      l = !a.once && [],
      k = function (d) {
        e = a.memory && d;
        f = !0;
        m = q || 0;
        q = 0;
        h = g.length;
        for (c = !0; g && m < h; m++)
          if (!1 === g[m].apply(d[0], d[1]) && a.stopOnFalse) {
            e = !1;
            break;
          }
        c = !1;
        g && (l ? l.length && k(l.shift()) : e ? (g = []) : n.disable());
      },
      n = {
        add: function () {
          if (g) {
            var d = g.length;
            (function kb(d) {
              w.each(d, function (d, b) {
                d = w.type(b);
                "function" === d
                  ? (a.unique && n.has(b)) || g.push(b)
                  : b && b.length && "string" !== d && kb(b);
              });
            })(arguments);
            c ? (h = g.length) : e && ((q = d), k(e));
          }
          return this;
        },
        remove: function () {
          g &&
            w.each(arguments, function (a, d) {
              for (var b; -1 < (b = w.inArray(d, g, b));)
                (g.splice(b, 1), c && (b <= h && h--, b <= m && m--));
            });
          return this;
        },
        has: function (a) {
          return a ? -1 < w.inArray(a, g) : !(!g || !g.length);
        },
        empty: function () {
          g = [];
          return this;
        },
        disable: function () {
          g = l = e = b;
          return this;
        },
        disabled: function () {
          return !g;
        },
        lock: function () {
          l = b;
          e || n.disable();
          return this;
        },
        locked: function () {
          return !l;
        },
        fireWith: function (a, d) {
          d = d || [];
          d = [a, d.slice ? d.slice() : d];
          !g || (f && !l) || (c ? l.push(d) : k(d));
          return this;
        },
        fire: function () {
          n.fireWith(this, arguments);
          return this;
        },
        fired: function () {
          return !!f;
        },
      };
    return n;
  };
  w.extend({
    Deferred: function (a) {
      var d = [
          ["resolve", "done", w.Callbacks("once memory"), "resolved"],
          ["reject", "fail", w.Callbacks("once memory"), "rejected"],
          ["notify", "progress", w.Callbacks("memory")],
        ],
        b = "pending",
        c = {
          state: function () {
            return b;
          },
          always: function () {
            e.done(arguments).fail(arguments);
            return this;
          },
          then: function () {
            var a = arguments;
            return w
              .Deferred(function (b) {
                w.each(d, function (d, f) {
                  var h = f[0],
                    m = w.isFunction(a[d]) && a[d];
                  e[f[1]](function () {
                    var a = m && m.apply(this, arguments);
                    if (a && w.isFunction(a.promise))
                      a.promise()
                        .done(b.resolve)
                        .fail(b.reject)
                        .progress(b.notify);
                    else
                      b[h + "With"](
                        this === c ? b.promise() : this,
                        m ? [a] : arguments,
                      );
                  });
                });
                a = null;
              })
              .promise();
          },
          promise: function (a) {
            return null != a ? w.extend(a, c) : c;
          },
        },
        e = {};
      c.pipe = c.then;
      w.each(d, function (a, f) {
        var h = f[2],
          m = f[3];
        c[f[1]] = h.add;
        m &&
          h.add(
            function () {
              b = m;
            },
            d[a ^ 1][2].disable,
            d[2][2].lock,
          );
        e[f[0]] = function () {
          e[f[0] + "With"](this === e ? c : this, arguments);
          return this;
        };
        e[f[0] + "With"] = h.fireWith;
      });
      c.promise(e);
      a && a.call(e, e);
      return e;
    },
    when: function (a) {
      var d = 0,
        b = ha.call(arguments),
        c = b.length,
        e = 1 !== c || (a && w.isFunction(a.promise)) ? c : 0,
        f = 1 === e ? a : w.Deferred(),
        h = function (a, d, b) {
          return function (c) {
            d[a] = this;
            b[a] = 1 < arguments.length ? ha.call(arguments) : c;
            b === m ? f.notifyWith(d, b) : --e || f.resolveWith(d, b);
          };
        },
        m,
        q,
        g;
      if (1 < c)
        for (m = Array(c), q = Array(c), g = Array(c); d < c; d++)
          b[d] && w.isFunction(b[d].promise)
            ? b[d]
                .promise()
                .done(h(d, g, b))
                .fail(f.reject)
                .progress(h(d, q, m))
            : --e;
      e || f.resolveWith(g, b);
      return f.promise();
    },
  });
  w.support = (function () {
    var d,
      b,
      c,
      e,
      f,
      h,
      m,
      q = R.createElement("div");
    q.setAttribute("className", "t");
    q.innerHTML =
      "  \x3clink/\x3e\x3ctable\x3e\x3c/table\x3e\x3ca href\x3d'/a'\x3ea\x3c/a\x3e\x3cinput type\x3d'checkbox'/\x3e";
    b = q.getElementsByTagName("*");
    c = q.getElementsByTagName("a")[0];
    if (!b || !c || !b.length) return {};
    e = R.createElement("select");
    f = e.appendChild(R.createElement("option"));
    b = q.getElementsByTagName("input")[0];
    c.style.cssText = "top:1px;float:left;opacity:.5";
    d = {
      getSetAttribute: "t" !== q.className,
      leadingWhitespace: 3 === q.firstChild.nodeType,
      tbody: !q.getElementsByTagName("tbody").length,
      htmlSerialize: !!q.getElementsByTagName("link").length,
      style: /top/.test(c.getAttribute("style")),
      hrefNormalized: "/a" === c.getAttribute("href"),
      opacity: /^0.5/.test(c.style.opacity),
      cssFloat: !!c.style.cssFloat,
      checkOn: !!b.value,
      optSelected: f.selected,
      enctype: !!R.createElement("form").enctype,
      html5Clone:
        "\x3c:nav\x3e\x3c/:nav\x3e" !==
        R.createElement("nav").cloneNode(!0).outerHTML,
      boxModel: "CSS1Compat" === R.compatMode,
      deleteExpando: !0,
      noCloneEvent: !0,
      inlineBlockNeedsLayout: !1,
      shrinkWrapBlocks: !1,
      reliableMarginRight: !0,
      boxSizingReliable: !0,
      pixelPosition: !1,
    };
    b.checked = !0;
    d.noCloneChecked = b.cloneNode(!0).checked;
    e.disabled = !0;
    d.optDisabled = !f.disabled;
    try {
      delete q.test;
    } catch (oc) {
      d.deleteExpando = !1;
    }
    b = R.createElement("input");
    b.setAttribute("value", "");
    d.input = "" === b.getAttribute("value");
    b.value = "t";
    b.setAttribute("type", "radio");
    d.radioValue = "t" === b.value;
    b.setAttribute("checked", "t");
    b.setAttribute("name", "t");
    c = R.createDocumentFragment();
    c.appendChild(b);
    d.appendChecked = b.checked;
    d.checkClone = c.cloneNode(!0).cloneNode(!0).lastChild.checked;
    q.attachEvent &&
      (q.attachEvent("onclick", function () {
        d.noCloneEvent = !1;
      }),
      q.cloneNode(!0).click());
    for (m in { submit: !0, change: !0, focusin: !0 })
      (q.setAttribute((c = "on" + m), "t"),
        (d[m + "Bubbles"] = c in a || !1 === q.attributes[c].expando));
    q.style.backgroundClip = "content-box";
    q.cloneNode(!0).style.backgroundClip = "";
    d.clearCloneStyle = "content-box" === q.style.backgroundClip;
    w(function () {
      var b,
        c,
        e = R.getElementsByTagName("body")[0];
      e &&
        ((b = R.createElement("div")),
        (b.style.cssText =
          "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px"),
        e.appendChild(b).appendChild(q),
        (q.innerHTML =
          "\x3ctable\x3e\x3ctr\x3e\x3ctd\x3e\x3c/td\x3e\x3ctd\x3et\x3c/td\x3e\x3c/tr\x3e\x3c/table\x3e"),
        (c = q.getElementsByTagName("td")),
        (c[0].style.cssText = "padding:0;margin:0;border:0;display:none"),
        (h = 0 === c[0].offsetHeight),
        (c[0].style.display = ""),
        (c[1].style.display = "none"),
        (d.reliableHiddenOffsets = h && 0 === c[0].offsetHeight),
        (q.innerHTML = ""),
        (q.style.cssText =
          "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;"),
        (d.boxSizing = 4 === q.offsetWidth),
        (d.doesNotIncludeMarginInBodyOffset = 1 !== e.offsetTop),
        a.getComputedStyle &&
          ((d.pixelPosition = "1%" !== (a.getComputedStyle(q, null) || {}).top),
          (d.boxSizingReliable =
            "4px" === (a.getComputedStyle(q, null) || { width: "4px" }).width),
          (c = q.appendChild(R.createElement("div"))),
          (c.style.cssText = q.style.cssText =
            "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;"),
          (c.style.marginRight = c.style.width = "0"),
          (q.style.width = "1px"),
          (d.reliableMarginRight = !parseFloat(
            (a.getComputedStyle(c, null) || {}).marginRight,
          ))),
        typeof q.style.zoom !== da &&
          ((q.innerHTML = ""),
          (q.style.cssText =
            "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;width:1px;padding:1px;display:inline;zoom:1"),
          (d.inlineBlockNeedsLayout = 3 === q.offsetWidth),
          (q.style.display = "block"),
          (q.innerHTML = "\x3cdiv\x3e\x3c/div\x3e"),
          (q.firstChild.style.width = "5px"),
          (d.shrinkWrapBlocks = 3 !== q.offsetWidth),
          d.inlineBlockNeedsLayout && (e.style.zoom = 1)),
        e.removeChild(b),
        (q = null));
    });
    b = e = c = f = c = b = null;
    return d;
  })();
  var xa = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
    ya = /([A-Z])/g;
  w.extend({
    cache: {},
    expando: "jQuery" + ("1.9.1" + Math.random()).replace(/\D/g, ""),
    noData: {
      embed: !0,
      object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
      applet: !0,
    },
    hasData: function (a) {
      a = a.nodeType ? w.cache[a[w.expando]] : a[w.expando];
      return !!a && !r(a);
    },
    data: function (a, d, b) {
      return e(a, d, b);
    },
    removeData: function (a, d) {
      return l(a, d);
    },
    _data: function (a, d, b) {
      return e(a, d, b, !0);
    },
    _removeData: function (a, d) {
      return l(a, d, !0);
    },
    acceptData: function (a) {
      if (a.nodeType && 1 !== a.nodeType && 9 !== a.nodeType) return !1;
      var d = a.nodeName && w.noData[a.nodeName.toLowerCase()];
      return !d || (!0 !== d && a.getAttribute("classid") === d);
    },
  });
  w.fn.extend({
    data: function (a, d) {
      var c,
        e,
        f = this[0],
        m = 0,
        q = null;
      if (a === b) {
        if (
          this.length &&
          ((q = w.data(f)), 1 === f.nodeType && !w._data(f, "parsedAttrs"))
        ) {
          for (c = f.attributes; m < c.length; m++)
            ((e = c[m].name),
              e.indexOf("data-") ||
                ((e = w.camelCase(e.slice(5))), h(f, e, q[e])));
          w._data(f, "parsedAttrs", !0);
        }
        return q;
      }
      return "object" === typeof a
        ? this.each(function () {
            w.data(this, a);
          })
        : w.access(
            this,
            function (d) {
              if (d === b) return f ? h(f, a, w.data(f, a)) : null;
              this.each(function () {
                w.data(this, a, d);
              });
            },
            null,
            d,
            1 < arguments.length,
            null,
            !0,
          );
    },
    removeData: function (a) {
      return this.each(function () {
        w.removeData(this, a);
      });
    },
  });
  w.extend({
    queue: function (a, d, b) {
      var c;
      if (a)
        return (
          (d = (d || "fx") + "queue"),
          (c = w._data(a, d)),
          b &&
            (!c || w.isArray(b)
              ? (c = w._data(a, d, w.makeArray(b)))
              : c.push(b)),
          c || []
        );
    },
    dequeue: function (a, d) {
      d = d || "fx";
      var b = w.queue(a, d),
        c = b.length,
        e = b.shift(),
        f = w._queueHooks(a, d),
        h = function () {
          w.dequeue(a, d);
        };
      "inprogress" === e && ((e = b.shift()), c--);
      if ((f.cur = e))
        ("fx" === d && b.unshift("inprogress"), delete f.stop, e.call(a, h, f));
      !c && f && f.empty.fire();
    },
    _queueHooks: function (a, d) {
      var b = d + "queueHooks";
      return (
        w._data(a, b) ||
        w._data(a, b, {
          empty: w.Callbacks("once memory").add(function () {
            w._removeData(a, d + "queue");
            w._removeData(a, b);
          }),
        })
      );
    },
  });
  w.fn.extend({
    queue: function (a, d) {
      var c = 2;
      "string" !== typeof a && ((d = a), (a = "fx"), c--);
      return arguments.length < c
        ? w.queue(this[0], a)
        : d === b
          ? this
          : this.each(function () {
              var b = w.queue(this, a, d);
              w._queueHooks(this, a);
              "fx" === a && "inprogress" !== b[0] && w.dequeue(this, a);
            });
    },
    dequeue: function (a) {
      return this.each(function () {
        w.dequeue(this, a);
      });
    },
    delay: function (a, d) {
      a = w.fx ? w.fx.speeds[a] || a : a;
      return this.queue(d || "fx", function (d, b) {
        var c = setTimeout(d, a);
        b.stop = function () {
          clearTimeout(c);
        };
      });
    },
    clearQueue: function (a) {
      return this.queue(a || "fx", []);
    },
    promise: function (a, d) {
      var c,
        e = 1,
        f = w.Deferred(),
        h = this,
        m = this.length,
        q = function () {
          --e || f.resolveWith(h, [h]);
        };
      "string" !== typeof a && ((d = a), (a = b));
      for (a = a || "fx"; m--;)
        (c = w._data(h[m], a + "queueHooks")) &&
          c.empty &&
          (e++, c.empty.add(q));
      q();
      return f.promise(d);
    },
  });
  var za,
    Ka,
    va = /[\t\r\n]/g,
    Ia = /\r/g,
    Ca = /^(?:input|select|textarea|button|object)$/i,
    Da = /^(?:a|area)$/i,
    La =
      /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,
    Ma = /^(?:checked|selected)$/i,
    Ha = w.support.getSetAttribute,
    Ea = w.support.input;
  w.fn.extend({
    attr: function (a, d) {
      return w.access(this, w.attr, a, d, 1 < arguments.length);
    },
    removeAttr: function (a) {
      return this.each(function () {
        w.removeAttr(this, a);
      });
    },
    prop: function (a, d) {
      return w.access(this, w.prop, a, d, 1 < arguments.length);
    },
    removeProp: function (a) {
      a = w.propFix[a] || a;
      return this.each(function () {
        try {
          ((this[a] = b), delete this[a]);
        } catch (ob) {}
      });
    },
    addClass: function (a) {
      var d,
        b,
        c,
        e,
        f,
        h = 0,
        m = this.length;
      d = "string" === typeof a && a;
      if (w.isFunction(a))
        return this.each(function (d) {
          w(this).addClass(a.call(this, d, this.className));
        });
      if (d)
        for (d = (a || "").match(O) || []; h < m; h++)
          if (
            ((b = this[h]),
            (c =
              1 === b.nodeType &&
              (b.className ? (" " + b.className + " ").replace(va, " ") : " ")))
          ) {
            for (f = 0; (e = d[f++]);)
              0 > c.indexOf(" " + e + " ") && (c += e + " ");
            b.className = w.trim(c);
          }
      return this;
    },
    removeClass: function (a) {
      var d,
        b,
        c,
        e,
        f,
        h = 0,
        m = this.length;
      d = 0 === arguments.length || ("string" === typeof a && a);
      if (w.isFunction(a))
        return this.each(function (d) {
          w(this).removeClass(a.call(this, d, this.className));
        });
      if (d)
        for (d = (a || "").match(O) || []; h < m; h++)
          if (
            ((b = this[h]),
            (c =
              1 === b.nodeType &&
              (b.className ? (" " + b.className + " ").replace(va, " ") : "")))
          ) {
            for (f = 0; (e = d[f++]);)
              for (; 0 <= c.indexOf(" " + e + " ");)
                c = c.replace(" " + e + " ", " ");
            b.className = a ? w.trim(c) : "";
          }
      return this;
    },
    toggleClass: function (a, d) {
      var b = typeof a,
        c = "boolean" === typeof d;
      return w.isFunction(a)
        ? this.each(function (b) {
            w(this).toggleClass(a.call(this, b, this.className, d), d);
          })
        : this.each(function () {
            if ("string" === b)
              for (
                var e, f = 0, h = w(this), m = d, q = a.match(O) || [];
                (e = q[f++]);
              )
                ((m = c ? m : !h.hasClass(e)),
                  h[m ? "addClass" : "removeClass"](e));
            else if (b === da || "boolean" === b)
              (this.className && w._data(this, "__className__", this.className),
                (this.className =
                  this.className || !1 === a
                    ? ""
                    : w._data(this, "__className__") || ""));
          });
    },
    hasClass: function (a) {
      a = " " + a + " ";
      for (var d = 0, b = this.length; d < b; d++)
        if (
          1 === this[d].nodeType &&
          0 <= (" " + this[d].className + " ").replace(va, " ").indexOf(a)
        )
          return !0;
      return !1;
    },
    val: function (a) {
      var d,
        c,
        e,
        f = this[0];
      if (arguments.length)
        return (
          (e = w.isFunction(a)),
          this.each(function (d) {
            var f = w(this);
            1 === this.nodeType &&
              ((d = e ? a.call(this, d, f.val()) : a),
              null == d
                ? (d = "")
                : "number" === typeof d
                  ? (d += "")
                  : w.isArray(d) &&
                    (d = w.map(d, function (a) {
                      return null == a ? "" : a + "";
                    })),
              (c =
                w.valHooks[this.type] ||
                w.valHooks[this.nodeName.toLowerCase()]),
              (c && "set" in c && c.set(this, d, "value") !== b) ||
                (this.value = d));
          })
        );
      if (f) {
        if (
          (c = w.valHooks[f.type] || w.valHooks[f.nodeName.toLowerCase()]) &&
          "get" in c &&
          (d = c.get(f, "value")) !== b
        )
          return d;
        d = f.value;
        return "string" === typeof d ? d.replace(Ia, "") : null == d ? "" : d;
      }
    },
  });
  w.extend({
    valHooks: {
      option: {
        get: function (a) {
          var d = a.attributes.value;
          return !d || d.specified ? a.value : a.text;
        },
      },
      select: {
        get: function (a) {
          for (
            var d,
              b = a.options,
              c = a.selectedIndex,
              e = (a = "select-one" === a.type || 0 > c) ? null : [],
              f = a ? c + 1 : b.length,
              h = 0 > c ? f : a ? c : 0;
            h < f;
            h++
          )
            if (
              ((d = b[h]),
              !(
                (!d.selected && h !== c) ||
                (w.support.optDisabled
                  ? d.disabled
                  : null !== d.getAttribute("disabled")) ||
                (d.parentNode.disabled && w.nodeName(d.parentNode, "optgroup"))
              ))
            ) {
              d = w(d).val();
              if (a) return d;
              e.push(d);
            }
          return e;
        },
        set: function (a, d) {
          var b = w.makeArray(d);
          w(a)
            .find("option")
            .each(function () {
              this.selected = 0 <= w.inArray(w(this).val(), b);
            });
          b.length || (a.selectedIndex = -1);
          return b;
        },
      },
    },
    attr: function (a, d, c) {
      var e, f, h;
      f = a.nodeType;
      if (a && 3 !== f && 8 !== f && 2 !== f) {
        if (typeof a.getAttribute === da) return w.prop(a, d, c);
        if ((f = 1 !== f || !w.isXMLDoc(a)))
          ((d = d.toLowerCase()),
            (e = w.attrHooks[d] || (La.test(d) ? Ka : za)));
        if (c !== b)
          if (null === c) w.removeAttr(a, d);
          else {
            if (e && f && "set" in e && (h = e.set(a, c, d)) !== b) return h;
            a.setAttribute(d, c + "");
            return c;
          }
        else {
          if (e && f && "get" in e && null !== (h = e.get(a, d))) return h;
          typeof a.getAttribute !== da && (h = a.getAttribute(d));
          return null == h ? b : h;
        }
      }
    },
    removeAttr: function (a, d) {
      var b,
        c = 0,
        e = d && d.match(O);
      if (e && 1 === a.nodeType)
        for (; (d = e[c++]);)
          ((b = w.propFix[d] || d),
            La.test(d)
              ? !Ha && Ma.test(d)
                ? (a[w.camelCase("default-" + d)] = a[b] = !1)
                : (a[b] = !1)
              : w.attr(a, d, ""),
            a.removeAttribute(Ha ? d : b));
    },
    attrHooks: {
      type: {
        set: function (a, d) {
          if (
            !w.support.radioValue &&
            "radio" === d &&
            w.nodeName(a, "input")
          ) {
            var b = a.value;
            a.setAttribute("type", d);
            b && (a.value = b);
            return d;
          }
        },
      },
    },
    propFix: {
      tabindex: "tabIndex",
      readonly: "readOnly",
      for: "htmlFor",
      class: "className",
      maxlength: "maxLength",
      cellspacing: "cellSpacing",
      cellpadding: "cellPadding",
      rowspan: "rowSpan",
      colspan: "colSpan",
      usemap: "useMap",
      frameborder: "frameBorder",
      contenteditable: "contentEditable",
    },
    prop: function (a, d, c) {
      var e,
        f,
        h = a.nodeType;
      if (a && 3 !== h && 8 !== h && 2 !== h)
        return (
          (1 === h && w.isXMLDoc(a)) ||
            ((d = w.propFix[d] || d), (f = w.propHooks[d])),
          c !== b
            ? f && "set" in f && (e = f.set(a, c, d)) !== b
              ? e
              : (a[d] = c)
            : f && "get" in f && null !== (e = f.get(a, d))
              ? e
              : a[d]
        );
    },
    propHooks: {
      tabIndex: {
        get: function (a) {
          var d = a.getAttributeNode("tabindex");
          return d && d.specified
            ? parseInt(d.value, 10)
            : Ca.test(a.nodeName) || (Da.test(a.nodeName) && a.href)
              ? 0
              : b;
        },
      },
    },
  });
  Ka = {
    get: function (a, d) {
      var c = w.prop(a, d),
        e = "boolean" === typeof c && a.getAttribute(d);
      return (a =
        "boolean" === typeof c
          ? Ea && Ha
            ? null != e
            : Ma.test(d)
              ? a[w.camelCase("default-" + d)]
              : !!e
          : a.getAttributeNode(d)) && !1 !== a.value
        ? d.toLowerCase()
        : b;
    },
    set: function (a, d, b) {
      !1 === d
        ? w.removeAttr(a, b)
        : (Ea && Ha) || !Ma.test(b)
          ? a.setAttribute((!Ha && w.propFix[b]) || b, b)
          : (a[w.camelCase("default-" + b)] = a[b] = !0);
      return b;
    },
  };
  (Ea && Ha) ||
    (w.attrHooks.value = {
      get: function (a, d) {
        d = a.getAttributeNode(d);
        return w.nodeName(a, "input")
          ? a.defaultValue
          : d && d.specified
            ? d.value
            : b;
      },
      set: function (a, d, b) {
        if (w.nodeName(a, "input")) a.defaultValue = d;
        else return za && za.set(a, d, b);
      },
    });
  Ha ||
    ((za = w.valHooks.button =
      {
        get: function (a, d) {
          return (a = a.getAttributeNode(d)) &&
            ("id" === d || "name" === d || "coords" === d
              ? "" !== a.value
              : a.specified)
            ? a.value
            : b;
        },
        set: function (a, d, c) {
          var e = a.getAttributeNode(c);
          e || a.setAttributeNode((e = a.ownerDocument.createAttribute(c)));
          e.value = d += "";
          return "value" === c || d === a.getAttribute(c) ? d : b;
        },
      }),
    (w.attrHooks.contenteditable = {
      get: za.get,
      set: function (a, d, b) {
        za.set(a, "" === d ? !1 : d, b);
      },
    }),
    w.each(["width", "height"], function (a, d) {
      w.attrHooks[d] = w.extend(w.attrHooks[d], {
        set: function (a, b) {
          if ("" === b) return (a.setAttribute(d, "auto"), b);
        },
      });
    }));
  w.support.hrefNormalized ||
    (w.each(["href", "src", "width", "height"], function (a, d) {
      w.attrHooks[d] = w.extend(w.attrHooks[d], {
        get: function (a) {
          a = a.getAttribute(d, 2);
          return null == a ? b : a;
        },
      });
    }),
    w.each(["href", "src"], function (a, d) {
      w.propHooks[d] = {
        get: function (a) {
          return a.getAttribute(d, 4);
        },
      };
    }));
  w.support.style ||
    (w.attrHooks.style = {
      get: function (a) {
        return a.style.cssText || b;
      },
      set: function (a, d) {
        return (a.style.cssText = d + "");
      },
    });
  w.support.optSelected ||
    (w.propHooks.selected = w.extend(w.propHooks.selected, {
      get: function (a) {
        if ((a = a.parentNode))
          (a.selectedIndex, a.parentNode && a.parentNode.selectedIndex);
        return null;
      },
    }));
  w.support.enctype || (w.propFix.enctype = "encoding");
  w.support.checkOn ||
    w.each(["radio", "checkbox"], function () {
      w.valHooks[this] = {
        get: function (a) {
          return null === a.getAttribute("value") ? "on" : a.value;
        },
      };
    });
  w.each(["radio", "checkbox"], function () {
    w.valHooks[this] = w.extend(w.valHooks[this], {
      set: function (a, d) {
        if (w.isArray(d)) return (a.checked = 0 <= w.inArray(w(a).val(), d));
      },
    });
  });
  var Fa = /^(?:input|select|textarea)$/i,
    Ya = /^key/,
    Za = /^(?:mouse|contextmenu)|click/,
    Na = /^(?:focusinfocus|focusoutblur)$/,
    $a = /^([^.]*)(?:\.(.+)|)$/;
  w.event = {
    global: {},
    add: function (a, d, c, e, f) {
      var h, m, q, g, l, k, n, p, v;
      if ((q = w._data(a))) {
        c.handler && ((g = c), (c = g.handler), (f = g.selector));
        c.guid || (c.guid = w.guid++);
        (m = q.events) || (m = q.events = {});
        (l = q.handle) ||
          ((l = q.handle =
            function (a) {
              return typeof w === da || (a && w.event.triggered === a.type)
                ? b
                : w.event.dispatch.apply(l.elem, arguments);
            }),
          (l.elem = a));
        d = (d || "").match(O) || [""];
        for (q = d.length; q--;)
          ((h = $a.exec(d[q]) || []),
            (p = k = h[1]),
            (v = (h[2] || "").split(".").sort()),
            (h = w.event.special[p] || {}),
            (p = (f ? h.delegateType : h.bindType) || p),
            (h = w.event.special[p] || {}),
            (k = w.extend(
              {
                type: p,
                origType: k,
                data: e,
                handler: c,
                guid: c.guid,
                selector: f,
                needsContext: f && w.expr.match.needsContext.test(f),
                namespace: v.join("."),
              },
              g,
            )),
            (n = m[p]) ||
              ((n = m[p] = []),
              (n.delegateCount = 0),
              (h.setup && !1 !== h.setup.call(a, e, v, l)) ||
                (a.addEventListener
                  ? a.addEventListener(p, l, !1)
                  : a.attachEvent && a.attachEvent("on" + p, l))),
            h.add &&
              (h.add.call(a, k), k.handler.guid || (k.handler.guid = c.guid)),
            f ? n.splice(n.delegateCount++, 0, k) : n.push(k),
            (w.event.global[p] = !0));
        a = null;
      }
    },
    remove: function (a, d, b, c, e) {
      var f,
        h,
        m,
        q,
        g,
        l,
        k,
        n,
        p,
        v,
        u,
        r = w.hasData(a) && w._data(a);
      if (r && (l = r.events)) {
        d = (d || "").match(O) || [""];
        for (g = d.length; g--;)
          if (
            ((m = $a.exec(d[g]) || []),
            (p = u = m[1]),
            (v = (m[2] || "").split(".").sort()),
            p)
          ) {
            k = w.event.special[p] || {};
            p = (c ? k.delegateType : k.bindType) || p;
            n = l[p] || [];
            m =
              m[2] &&
              new RegExp("(^|\\.)" + v.join("\\.(?:.*\\.|)") + "(\\.|$)");
            for (q = f = n.length; f--;)
              ((h = n[f]),
                (!e && u !== h.origType) ||
                  (b && b.guid !== h.guid) ||
                  (m && !m.test(h.namespace)) ||
                  (c && c !== h.selector && ("**" !== c || !h.selector)) ||
                  (n.splice(f, 1),
                  h.selector && n.delegateCount--,
                  k.remove && k.remove.call(a, h)));
            q &&
              !n.length &&
              ((k.teardown && !1 !== k.teardown.call(a, v, r.handle)) ||
                w.removeEvent(a, p, r.handle),
              delete l[p]);
          } else for (p in l) w.event.remove(a, p + d[g], b, c, !0);
        w.isEmptyObject(l) && (delete r.handle, w._removeData(a, "events"));
      }
    },
    trigger: function (d, c, e, f) {
      var h,
        m,
        q,
        g,
        l,
        k,
        n = [e || R],
        p = qa.call(d, "type") ? d.type : d;
      l = qa.call(d, "namespace") ? d.namespace.split(".") : [];
      q = h = e = e || R;
      if (
        3 !== e.nodeType &&
        8 !== e.nodeType &&
        !Na.test(p + w.event.triggered) &&
        (0 <= p.indexOf(".") && ((l = p.split(".")), (p = l.shift()), l.sort()),
        (m = 0 > p.indexOf(":") && "on" + p),
        (d = d[w.expando] ? d : new w.Event(p, "object" === typeof d && d)),
        (d.isTrigger = !0),
        (d.namespace = l.join(".")),
        (d.namespace_re = d.namespace
          ? new RegExp("(^|\\.)" + l.join("\\.(?:.*\\.|)") + "(\\.|$)")
          : null),
        (d.result = b),
        d.target || (d.target = e),
        (c = null == c ? [d] : w.makeArray(c, [d])),
        (l = w.event.special[p] || {}),
        f || !l.trigger || !1 !== l.trigger.apply(e, c))
      ) {
        if (!f && !l.noBubble && !w.isWindow(e)) {
          g = l.delegateType || p;
          Na.test(g + p) || (q = q.parentNode);
          for (; q; q = q.parentNode) (n.push(q), (h = q));
          h === (e.ownerDocument || R) &&
            n.push(h.defaultView || h.parentWindow || a);
        }
        for (k = 0; (q = n[k++]) && !d.isPropagationStopped();)
          ((d.type = 1 < k ? g : l.bindType || p),
            (h =
              (w._data(q, "events") || {})[d.type] && w._data(q, "handle")) &&
              h.apply(q, c),
            (h = m && q[m]) &&
              w.acceptData(q) &&
              h.apply &&
              !1 === h.apply(q, c) &&
              d.preventDefault());
        d.type = p;
        if (
          !(
            f ||
            d.isDefaultPrevented() ||
            (l._default && !1 !== l._default.apply(e.ownerDocument, c)) ||
            ("click" === p && w.nodeName(e, "a"))
          ) &&
          w.acceptData(e) &&
          m &&
          e[p] &&
          !w.isWindow(e)
        ) {
          (h = e[m]) && (e[m] = null);
          w.event.triggered = p;
          try {
            e[p]();
          } catch (qc) {}
          w.event.triggered = b;
          h && (e[m] = h);
        }
        return d.result;
      }
    },
    dispatch: function (a) {
      a = w.event.fix(a);
      var d,
        c,
        e,
        f,
        h,
        m = ha.call(arguments);
      d = (w._data(this, "events") || {})[a.type] || [];
      var q = w.event.special[a.type] || {};
      m[0] = a;
      a.delegateTarget = this;
      if (!q.preDispatch || !1 !== q.preDispatch.call(this, a)) {
        h = w.event.handlers.call(this, a, d);
        for (d = 0; (e = h[d++]) && !a.isPropagationStopped();)
          for (
            a.currentTarget = e.elem, f = 0;
            (c = e.handlers[f++]) && !a.isImmediatePropagationStopped();
          )
            if (!a.namespace_re || a.namespace_re.test(c.namespace))
              ((a.handleObj = c),
                (a.data = c.data),
                (c = (
                  (w.event.special[c.origType] || {}).handle || c.handler
                ).apply(e.elem, m)),
                c !== b &&
                  !1 === (a.result = c) &&
                  (a.preventDefault(), a.stopPropagation()));
        q.postDispatch && q.postDispatch.call(this, a);
        return a.result;
      }
    },
    handlers: function (a, d) {
      var c,
        e,
        f,
        h,
        m = [],
        q = d.delegateCount,
        g = a.target;
      if (q && g.nodeType && (!a.button || "click" !== a.type))
        for (; g != this; g = g.parentNode || this)
          if (1 === g.nodeType && (!0 !== g.disabled || "click" !== a.type)) {
            f = [];
            for (h = 0; h < q; h++)
              ((e = d[h]),
                (c = e.selector + " "),
                f[c] === b &&
                  (f[c] = e.needsContext
                    ? 0 <= w(c, this).index(g)
                    : w.find(c, this, null, [g]).length),
                f[c] && f.push(e));
            f.length && m.push({ elem: g, handlers: f });
          }
      q < d.length && m.push({ elem: this, handlers: d.slice(q) });
      return m;
    },
    fix: function (a) {
      if (a[w.expando]) return a;
      var d, b, c;
      d = a.type;
      var e = a,
        f = this.fixHooks[d];
      f ||
        (this.fixHooks[d] = f =
          Za.test(d) ? this.mouseHooks : Ya.test(d) ? this.keyHooks : {});
      c = f.props ? this.props.concat(f.props) : this.props;
      a = new w.Event(e);
      for (d = c.length; d--;) ((b = c[d]), (a[b] = e[b]));
      a.target || (a.target = e.srcElement || R);
      3 === a.target.nodeType && (a.target = a.target.parentNode);
      a.metaKey = !!a.metaKey;
      return f.filter ? f.filter(a, e) : a;
    },
    props:
      "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(
        " ",
      ),
    fixHooks: {},
    keyHooks: {
      props: ["char", "charCode", "key", "keyCode"],
      filter: function (a, d) {
        null == a.which &&
          (a.which = null != d.charCode ? d.charCode : d.keyCode);
        return a;
      },
    },
    mouseHooks: {
      props:
        "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(
          " ",
        ),
      filter: function (a, d) {
        var c,
          e,
          f = d.button,
          h = d.fromElement;
        null == a.pageX &&
          null != d.clientX &&
          ((c = a.target.ownerDocument || R),
          (e = c.documentElement),
          (c = c.body),
          (a.pageX =
            d.clientX +
            ((e && e.scrollLeft) || (c && c.scrollLeft) || 0) -
            ((e && e.clientLeft) || (c && c.clientLeft) || 0)),
          (a.pageY =
            d.clientY +
            ((e && e.scrollTop) || (c && c.scrollTop) || 0) -
            ((e && e.clientTop) || (c && c.clientTop) || 0)));
        !a.relatedTarget &&
          h &&
          (a.relatedTarget = h === a.target ? d.toElement : h);
        a.which || f === b || (a.which = f & 1 ? 1 : f & 2 ? 3 : f & 4 ? 2 : 0);
        return a;
      },
    },
    special: {
      load: { noBubble: !0 },
      click: {
        trigger: function () {
          if (
            w.nodeName(this, "input") &&
            "checkbox" === this.type &&
            this.click
          )
            return (this.click(), !1);
        },
      },
      focus: {
        trigger: function () {
          if (this !== R.activeElement && this.focus)
            try {
              return (this.focus(), !1);
            } catch (hb) {}
        },
        delegateType: "focusin",
      },
      blur: {
        trigger: function () {
          if (this === R.activeElement && this.blur) return (this.blur(), !1);
        },
        delegateType: "focusout",
      },
      beforeunload: {
        postDispatch: function (a) {
          a.result !== b && (a.originalEvent.returnValue = a.result);
        },
      },
    },
    simulate: function (a, d, b, c) {
      a = w.extend(new w.Event(), b, {
        type: a,
        isSimulated: !0,
        originalEvent: {},
      });
      c ? w.event.trigger(a, null, d) : w.event.dispatch.call(d, a);
      a.isDefaultPrevented() && b.preventDefault();
    },
  };
  w.removeEvent = R.removeEventListener
    ? function (a, d, b) {
        a.removeEventListener && a.removeEventListener(d, b, !1);
      }
    : function (a, d, b) {
        d = "on" + d;
        a.detachEvent &&
          (typeof a[d] === da && (a[d] = null), a.detachEvent(d, b));
      };
  w.Event = function (a, d) {
    if (!(this instanceof w.Event)) return new w.Event(a, d);
    a && a.type
      ? ((this.originalEvent = a),
        (this.type = a.type),
        (this.isDefaultPrevented =
          a.defaultPrevented ||
          !1 === a.returnValue ||
          (a.getPreventDefault && a.getPreventDefault())
            ? t
            : n))
      : (this.type = a);
    d && w.extend(this, d);
    this.timeStamp = (a && a.timeStamp) || w.now();
    this[w.expando] = !0;
  };
  w.Event.prototype = {
    isDefaultPrevented: n,
    isPropagationStopped: n,
    isImmediatePropagationStopped: n,
    preventDefault: function () {
      var a = this.originalEvent;
      this.isDefaultPrevented = t;
      a && (a.preventDefault ? a.preventDefault() : (a.returnValue = !1));
    },
    stopPropagation: function () {
      var a = this.originalEvent;
      this.isPropagationStopped = t;
      a && (a.stopPropagation && a.stopPropagation(), (a.cancelBubble = !0));
    },
    stopImmediatePropagation: function () {
      this.isImmediatePropagationStopped = t;
      this.stopPropagation();
    },
  };
  w.each({ mouseenter: "mouseover", mouseleave: "mouseout" }, function (a, d) {
    w.event.special[a] = {
      delegateType: d,
      bindType: d,
      handle: function (a) {
        var b,
          c = a.relatedTarget,
          e = a.handleObj;
        if (!c || (c !== this && !w.contains(this, c)))
          ((a.type = e.origType),
            (b = e.handler.apply(this, arguments)),
            (a.type = d));
        return b;
      },
    };
  });
  w.support.submitBubbles ||
    (w.event.special.submit = {
      setup: function () {
        if (w.nodeName(this, "form")) return !1;
        w.event.add(this, "click._submit keypress._submit", function (a) {
          a = a.target;
          (a =
            w.nodeName(a, "input") || w.nodeName(a, "button") ? a.form : b) &&
            !w._data(a, "submitBubbles") &&
            (w.event.add(a, "submit._submit", function (a) {
              a._submit_bubble = !0;
            }),
            w._data(a, "submitBubbles", !0));
        });
      },
      postDispatch: function (a) {
        a._submit_bubble &&
          (delete a._submit_bubble,
          this.parentNode &&
            !a.isTrigger &&
            w.event.simulate("submit", this.parentNode, a, !0));
      },
      teardown: function () {
        if (w.nodeName(this, "form")) return !1;
        w.event.remove(this, "._submit");
      },
    });
  w.support.changeBubbles ||
    (w.event.special.change = {
      setup: function () {
        if (Fa.test(this.nodeName)) {
          if ("checkbox" === this.type || "radio" === this.type)
            (w.event.add(this, "propertychange._change", function (a) {
              "checked" === a.originalEvent.propertyName &&
                (this._just_changed = !0);
            }),
              w.event.add(this, "click._change", function (a) {
                this._just_changed && !a.isTrigger && (this._just_changed = !1);
                w.event.simulate("change", this, a, !0);
              }));
          return !1;
        }
        w.event.add(this, "beforeactivate._change", function (a) {
          a = a.target;
          Fa.test(a.nodeName) &&
            !w._data(a, "changeBubbles") &&
            (w.event.add(a, "change._change", function (a) {
              !this.parentNode ||
                a.isSimulated ||
                a.isTrigger ||
                w.event.simulate("change", this.parentNode, a, !0);
            }),
            w._data(a, "changeBubbles", !0));
        });
      },
      handle: function (a) {
        var d = a.target;
        if (
          this !== d ||
          a.isSimulated ||
          a.isTrigger ||
          ("radio" !== d.type && "checkbox" !== d.type)
        )
          return a.handleObj.handler.apply(this, arguments);
      },
      teardown: function () {
        w.event.remove(this, "._change");
        return !Fa.test(this.nodeName);
      },
    });
  w.support.focusinBubbles ||
    w.each({ focus: "focusin", blur: "focusout" }, function (a, d) {
      var b = 0,
        c = function (a) {
          w.event.simulate(d, a.target, w.event.fix(a), !0);
        };
      w.event.special[d] = {
        setup: function () {
          0 === b++ && R.addEventListener(a, c, !0);
        },
        teardown: function () {
          0 === --b && R.removeEventListener(a, c, !0);
        },
      };
    });
  w.fn.extend({
    on: function (a, d, c, e, f) {
      var h, m;
      if ("object" === typeof a) {
        "string" !== typeof d && ((c = c || d), (d = b));
        for (h in a) this.on(h, d, c, a[h], f);
        return this;
      }
      null == c && null == e
        ? ((e = d), (c = d = b))
        : null == e &&
          ("string" === typeof d
            ? ((e = c), (c = b))
            : ((e = c), (c = d), (d = b)));
      if (!1 === e) e = n;
      else if (!e) return this;
      1 === f &&
        ((m = e),
        (e = function (a) {
          w().off(a);
          return m.apply(this, arguments);
        }),
        (e.guid = m.guid || (m.guid = w.guid++)));
      return this.each(function () {
        w.event.add(this, a, e, c, d);
      });
    },
    one: function (a, d, b, c) {
      return this.on(a, d, b, c, 1);
    },
    off: function (a, d, c) {
      var e;
      if (a && a.preventDefault && a.handleObj)
        return (
          (e = a.handleObj),
          w(a.delegateTarget).off(
            e.namespace ? e.origType + "." + e.namespace : e.origType,
            e.selector,
            e.handler,
          ),
          this
        );
      if ("object" === typeof a) {
        for (e in a) this.off(e, d, a[e]);
        return this;
      }
      if (!1 === d || "function" === typeof d) ((c = d), (d = b));
      !1 === c && (c = n);
      return this.each(function () {
        w.event.remove(this, a, c, d);
      });
    },
    bind: function (a, d, b) {
      return this.on(a, null, d, b);
    },
    unbind: function (a, d) {
      return this.off(a, null, d);
    },
    delegate: function (a, d, b, c) {
      return this.on(d, a, b, c);
    },
    undelegate: function (a, d, b) {
      return 1 === arguments.length
        ? this.off(a, "**")
        : this.off(d, a || "**", b);
    },
    trigger: function (a, d) {
      return this.each(function () {
        w.event.trigger(a, d, this);
      });
    },
    triggerHandler: function (a, d) {
      var b = this[0];
      if (b) return w.event.trigger(a, d, b, !0);
    },
  });
  (function (a, d) {
    function b() {
      var a,
        d = [];
      return (a = function (b, c) {
        d.push((b += " ")) > T.cacheLength && delete a[d.shift()];
        return (a[b] = c);
      });
    }
    function c(a) {
      a[y] = !0;
      return a;
    }
    function e(a) {
      var d = G.createElement("div");
      try {
        return a(d);
      } catch (sc) {
        return !1;
      } finally {
      }
    }
    function f(a, d, b, c) {
      var e, f, h, m, q;
      (d ? d.ownerDocument || d : M) !== G && V(d);
      d = d || G;
      b = b || [];
      if (!a || "string" !== typeof a) return b;
      if (1 !== (m = d.nodeType) && 9 !== m) return [];
      if (!C && !c) {
        if ((e = ra.exec(a)))
          if ((h = e[1]))
            if (9 === m)
              if ((f = d.getElementById(h)) && f.parentNode) {
                if (f.id === h) return (b.push(f), b);
              } else return b;
            else {
              if (
                d.ownerDocument &&
                (f = d.ownerDocument.getElementById(h)) &&
                Q(d, f) &&
                f.id === h
              )
                return (b.push(f), b);
            }
          else {
            if (e[2])
              return (ea.apply(b, Y.call(d.getElementsByTagName(a), 0)), b);
            if ((h = e[3]) && J.getByClassName && d.getElementsByClassName)
              return (ea.apply(b, Y.call(d.getElementsByClassName(h), 0)), b);
          }
        if (J.qsa && !S.test(a)) {
          e = !0;
          f = y;
          h = d;
          q = 9 === m && a;
          if (1 === m && "object" !== d.nodeName.toLowerCase()) {
            m = l(a);
            (e = d.getAttribute("id"))
              ? (f = e.replace(ca, "\\$\x26"))
              : d.setAttribute("id", f);
            f = "[id\x3d'" + f + "'] ";
            for (h = m.length; h--;) m[h] = f + k(m[h]);
            h = (pa.test(a) && d.parentNode) || d;
            q = m.join(",");
          }
          if (q)
            try {
              return (ea.apply(b, Y.call(h.querySelectorAll(q), 0)), b);
            } catch (uc) {
            } finally {
              e || d.removeAttribute("id");
            }
        }
      }
      var g;
      a: {
        a = a.replace(oa, "$1");
        f = l(a);
        if (!c && 1 === f.length) {
          e = f[0] = f[0].slice(0);
          if (
            2 < e.length &&
            "ID" === (g = e[0]).type &&
            9 === d.nodeType &&
            !C &&
            T.relative[e[1].type]
          ) {
            d = T.find.ID(g.matches[0].replace(X, Z), d)[0];
            if (!d) {
              g = b;
              break a;
            }
            a = a.slice(e.shift().value.length);
          }
          for (m = aa.needsContext.test(a) ? 0 : e.length; m--;) {
            g = e[m];
            if (T.relative[(h = g.type)]) break;
            if ((h = T.find[h]))
              if (
                (c = h(
                  g.matches[0].replace(X, Z),
                  (pa.test(e[0].type) && d.parentNode) || d,
                ))
              ) {
                e.splice(m, 1);
                a = c.length && k(e);
                if (!a) {
                  ea.apply(b, Y.call(c, 0));
                  g = b;
                  break a;
                }
                break;
              }
          }
        }
        z(a, f)(c, d, C, b, pa.test(a));
        g = b;
      }
      return g;
    }
    function h(a, d) {
      var b = d && a,
        c =
          b &&
          (~d.sourceIndex || -2147483648) - (~a.sourceIndex || -2147483648);
      if (c) return c;
      if (b) for (; (b = b.nextSibling);) if (b === d) return -1;
      return a ? 1 : -1;
    }
    function m(a) {
      return function (d) {
        return "input" === d.nodeName.toLowerCase() && d.type === a;
      };
    }
    function q(a) {
      return function (d) {
        var b = d.nodeName.toLowerCase();
        return ("input" === b || "button" === b) && d.type === a;
      };
    }
    function g(a) {
      return c(function (d) {
        d = +d;
        return c(function (b, c) {
          for (var e, f = a([], b.length, d), h = f.length; h--;)
            b[(e = f[h])] && (b[e] = !(c[e] = b[e]));
        });
      });
    }
    function l(a, d) {
      var b, c, e, h, m, q, g;
      if ((m = W[a + " "])) return d ? 0 : m.slice(0);
      m = a;
      q = [];
      for (g = T.preFilter; m;) {
        if (!b || (c = O.exec(m)))
          (c && (m = m.slice(c[0].length) || m), q.push((e = [])));
        b = !1;
        if ((c = Ba.exec(m)))
          ((b = c.shift()),
            e.push({ value: b, type: c[0].replace(oa, " ") }),
            (m = m.slice(b.length)));
        for (h in T.filter)
          !(c = aa[h].exec(m)) ||
            (g[h] && !(c = g[h](c))) ||
            ((b = c.shift()),
            e.push({ value: b, type: h, matches: c }),
            (m = m.slice(b.length)));
        if (!b) break;
      }
      return d ? m.length : m ? f.error(a) : W(a, q).slice(0);
    }
    function k(a) {
      for (var d = 0, b = a.length, c = ""; d < b; d++) c += a[d].value;
      return c;
    }
    function n(a, d, b) {
      var c = d.dir,
        e = b && "parentNode" === c,
        f = L++;
      return d.first
        ? function (d, b, f) {
            for (; (d = d[c]);) if (1 === d.nodeType || e) return a(d, b, f);
          }
        : function (d, b, h) {
            var m,
              q,
              g,
              l = P + " " + f;
            if (h)
              for (; (d = d[c]);) {
                if ((1 === d.nodeType || e) && a(d, b, h)) return !0;
              }
            else
              for (; (d = d[c]);)
                if (1 === d.nodeType || e)
                  if (((g = d[y] || (d[y] = {})), (q = g[c]) && q[0] === l)) {
                    if (!0 === (m = q[1]) || m === t) return !0 === m;
                  } else if (
                    ((q = g[c] = [l]), (q[1] = a(d, b, h) || t), !0 === q[1])
                  )
                    return !0;
          };
    }
    function p(a) {
      return 1 < a.length
        ? function (d, b, c) {
            for (var e = a.length; e--;) if (!a[e](d, b, c)) return !1;
            return !0;
          }
        : a[0];
    }
    function v(a, d, b, c, e) {
      for (var f, h = [], m = 0, q = a.length, g = null != d; m < q; m++)
        if ((f = a[m])) if (!b || b(f, c, e)) (h.push(f), g && d.push(m));
      return h;
    }
    function u(a, d, b, e, h, m) {
      e && !e[y] && (e = u(e));
      h && !h[y] && (h = u(h, m));
      return c(function (c, m, q, g) {
        var l,
          k,
          n = [],
          p = [],
          u = m.length,
          r;
        if (!(r = c)) {
          r = d || "*";
          for (
            var D = q.nodeType ? [q] : q, B = [], A = 0, t = D.length;
            A < t;
            A++
          )
            f(r, D[A], B);
          r = B;
        }
        r = !a || (!c && d) ? r : v(r, n, a, q, g);
        D = b ? (h || (c ? a : u || e) ? [] : m) : r;
        b && b(r, D, q, g);
        if (e)
          for (l = v(D, p), e(l, [], q, g), q = l.length; q--;)
            if ((k = l[q])) D[p[q]] = !(r[p[q]] = k);
        if (c) {
          if (h || a) {
            if (h) {
              l = [];
              for (q = D.length; q--;) (k = D[q]) && l.push((r[q] = k));
              h(null, (D = []), l, g);
            }
            for (q = D.length; q--;)
              (k = D[q]) &&
                -1 < (l = h ? U.call(c, k) : n[q]) &&
                (c[l] = !(m[l] = k));
          }
        } else
          ((D = v(D === m ? D.splice(u, D.length) : D)),
            h ? h(null, m, D, g) : ea.apply(m, D));
      });
    }
    function r(a) {
      var d,
        b,
        c,
        e = a.length,
        f = T.relative[a[0].type];
      b = f || T.relative[" "];
      for (
        var h = f ? 1 : 0,
          m = n(
            function (a) {
              return a === d;
            },
            b,
            !0,
          ),
          q = n(
            function (a) {
              return -1 < U.call(d, a);
            },
            b,
            !0,
          ),
          g = [
            function (a, b, c) {
              return (
                (!f && (c || b !== N)) ||
                ((d = b).nodeType ? m(a, b, c) : q(a, b, c))
              );
            },
          ];
        h < e;
        h++
      )
        if ((b = T.relative[a[h].type])) g = [n(p(g), b)];
        else {
          b = T.filter[a[h].type].apply(null, a[h].matches);
          if (b[y]) {
            for (c = ++h; c < e && !T.relative[a[c].type]; c++);
            return u(
              1 < h && p(g),
              1 < h && k(a.slice(0, h - 1)).replace(oa, "$1"),
              b,
              h < c && r(a.slice(h, c)),
              c < e && r((a = a.slice(c))),
              c < e && k(a),
            );
          }
          g.push(b);
        }
      return p(g);
    }
    function D(a, d) {
      var b = 0,
        e = 0 < d.length,
        h = 0 < a.length,
        m = function (c, m, q, g, l) {
          var k,
            n,
            p = [],
            u = 0,
            r = "0",
            D = c && [],
            B = null != l,
            A = N,
            H = c || (h && T.find.TAG("*", (l && m.parentNode) || m)),
            x = (P += null == A ? 1 : Math.random() || 0.1);
          B && ((N = m !== G && m), (t = b));
          for (; null != (l = H[r]); r++) {
            if (h && l) {
              for (k = 0; (n = a[k++]);)
                if (n(l, m, q)) {
                  g.push(l);
                  break;
                }
              B && ((P = x), (t = ++b));
            }
            e && ((l = !n && l) && u--, c && D.push(l));
          }
          u += r;
          if (e && r !== u) {
            for (k = 0; (n = d[k++]);) n(D, p, m, q);
            if (c) {
              if (0 < u) for (; r--;) D[r] || p[r] || (p[r] = hb.call(g));
              p = v(p);
            }
            ea.apply(g, p);
            B && !c && 0 < p.length && 1 < u + d.length && f.uniqueSort(g);
          }
          B && ((P = x), (N = A));
          return D;
        };
      return e ? c(m) : m;
    }
    function B() {}
    var A,
      t,
      T,
      H,
      x,
      z,
      R,
      N,
      V,
      G,
      I,
      C,
      S,
      ba,
      da,
      Q,
      E,
      y = "sizzle" + -new Date(),
      M = a.document,
      J = {},
      P = 0,
      L = 0,
      fa = b(),
      W = b(),
      K = b(),
      F = typeof d,
      ua = [],
      hb = ua.pop,
      ea = ua.push,
      Y = ua.slice,
      U =
        ua.indexOf ||
        function (a) {
          for (var d = 0, b = this.length; d < b; d++)
            if (this[d] === a) return d;
          return -1;
        },
      ua = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+".replace("w", "w#"),
      Ga =
        "\\[[\\x20\\t\\r\\n\\f]*((?:\\\\.|[\\w-]|[^\\x00-\\xa0])+)[\\x20\\t\\r\\n\\f]*(?:([*^$|!~]?\x3d)[\\x20\\t\\r\\n\\f]*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" +
        ua +
        ")|)|)[\\x20\\t\\r\\n\\f]*\\]",
      Ta =
        ":((?:\\\\.|[\\w-]|[^\\x00-\\xa0])+)(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" +
        Ga.replace(3, 8) +
        ")*)|.*)\\)|)",
      oa = /^[\x20\t\r\n\f]+|((?:^|[^\\])(?:\\.)*)[\x20\t\r\n\f]+$/g,
      O = /^[\x20\t\r\n\f]*,[\x20\t\r\n\f]*/,
      Ba = /^[\x20\t\r\n\f]*([\x20\t\r\n\f>+~])[\x20\t\r\n\f]*/,
      La = new RegExp(Ta),
      xa = new RegExp("^" + ua + "$"),
      aa = {
        ID: /^#((?:\\.|[\w-]|[^\x00-\xa0])+)/,
        CLASS: /^\.((?:\\.|[\w-]|[^\x00-\xa0])+)/,
        NAME: /^\[name=['"]?((?:\\.|[\w-]|[^\x00-\xa0])+)['"]?\]/,
        TAG: new RegExp(
          "^(" + "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+".replace("w", "w*") + ")",
        ),
        ATTR: new RegExp("^" + Ga),
        PSEUDO: new RegExp("^" + Ta),
        CHILD:
          /^:(only|first|last|nth|nth-last)-(child|of-type)(?:\([\x20\t\r\n\f]*(even|odd|(([+-]|)(\d*)n|)[\x20\t\r\n\f]*(?:([+-]|)[\x20\t\r\n\f]*(\d+)|))[\x20\t\r\n\f]*\)|)/i,
        needsContext:
          /^[\x20\t\r\n\f]*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\([\x20\t\r\n\f]*((?:-\d)?\d*)[\x20\t\r\n\f]*\)|)(?=[^-]|$)/i,
      },
      pa = /[\x20\t\r\n\f]*[+~]/,
      Aa = /^[^{]+\{\s*\[native code/,
      ra = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
      ta = /^(?:input|select|textarea|button)$/i,
      ob = /^h\d$/i,
      ca = /'|\\/g,
      la = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,
      X = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
      Z = function (a, d) {
        a = "0x" + d - 65536;
        return a !== a
          ? d
          : 0 > a
            ? String.fromCharCode(a + 65536)
            : String.fromCharCode((a >> 10) | 55296, (a & 1023) | 56320);
      };
    try {
      Y.call(M.documentElement.childNodes, 0)[0].nodeType;
    } catch (rc) {
      Y = function (a) {
        for (var d, b = []; (d = this[a++]);) b.push(d);
        return b;
      };
    }
    x = f.isXML = function (a) {
      return (a = a && (a.ownerDocument || a).documentElement)
        ? "HTML" !== a.nodeName
        : !1;
    };
    V = f.setDocument = function (a) {
      var b = a ? a.ownerDocument || a : M;
      if (b === G || 9 !== b.nodeType || !b.documentElement) return G;
      G = b;
      I = b.documentElement;
      C = x(b);
      J.tagNameNoComments = e(function (a) {
        a.appendChild(b.createComment(""));
        return !a.getElementsByTagName("*").length;
      });
      J.attributes = e(function (a) {
        a.innerHTML = "\x3cselect\x3e\x3c/select\x3e";
        a = typeof a.lastChild.getAttribute("multiple");
        return "boolean" !== a && "string" !== a;
      });
      J.getByClassName = e(function (a) {
        a.innerHTML =
          "\x3cdiv class\x3d'hidden e'\x3e\x3c/div\x3e\x3cdiv class\x3d'hidden'\x3e\x3c/div\x3e";
        if (!a.getElementsByClassName || !a.getElementsByClassName("e").length)
          return !1;
        a.lastChild.className = "e";
        return 2 === a.getElementsByClassName("e").length;
      });
      J.getByName = e(function (a) {
        a.id = y + 0;
        a.innerHTML =
          "\x3ca name\x3d'" +
          y +
          "'\x3e\x3c/a\x3e\x3cdiv name\x3d'" +
          y +
          "'\x3e\x3c/div\x3e";
        I.insertBefore(a, I.firstChild);
        var d =
          b.getElementsByName &&
          b.getElementsByName(y).length ===
            2 + b.getElementsByName(y + 0).length;
        J.getIdNotName = !b.getElementById(y);
        I.removeChild(a);
        return d;
      });
      T.attrHandle = e(function (a) {
        a.innerHTML = "\x3ca href\x3d'#'\x3e\x3c/a\x3e";
        return (
          a.firstChild &&
          typeof a.firstChild.getAttribute !== F &&
          "#" === a.firstChild.getAttribute("href")
        );
      })
        ? {}
        : {
            href: function (a) {
              return a.getAttribute("href", 2);
            },
            type: function (a) {
              return a.getAttribute("type");
            },
          };
      J.getIdNotName
        ? ((T.find.ID = function (a, d) {
            if (typeof d.getElementById !== F && !C)
              return (a = d.getElementById(a)) && a.parentNode ? [a] : [];
          }),
          (T.filter.ID = function (a) {
            var d = a.replace(X, Z);
            return function (a) {
              return a.getAttribute("id") === d;
            };
          }))
        : ((T.find.ID = function (a, b) {
            if (typeof b.getElementById !== F && !C)
              return (b = b.getElementById(a))
                ? b.id === a ||
                  (typeof b.getAttributeNode !== F &&
                    b.getAttributeNode("id").value === a)
                  ? [b]
                  : d
                : [];
          }),
          (T.filter.ID = function (a) {
            var d = a.replace(X, Z);
            return function (a) {
              return (
                (a =
                  typeof a.getAttributeNode !== F &&
                  a.getAttributeNode("id")) && a.value === d
              );
            };
          }));
      T.find.TAG = J.tagNameNoComments
        ? function (a, d) {
            if (typeof d.getElementsByTagName !== F)
              return d.getElementsByTagName(a);
          }
        : function (a, d) {
            var b = [],
              c = 0;
            d = d.getElementsByTagName(a);
            if ("*" === a) {
              for (; (a = d[c++]);) 1 === a.nodeType && b.push(a);
              return b;
            }
            return d;
          };
      T.find.NAME =
        J.getByName &&
        function (a, d) {
          if (typeof d.getElementsByName !== F)
            return d.getElementsByName(name);
        };
      T.find.CLASS =
        J.getByClassName &&
        function (a, d) {
          if (typeof d.getElementsByClassName !== F && !C)
            return d.getElementsByClassName(a);
        };
      ba = [];
      S = [":focus"];
      if ((J.qsa = Aa.test(b.querySelectorAll + "")))
        (e(function (a) {
          a.innerHTML =
            "\x3cselect\x3e\x3coption selected\x3d''\x3e\x3c/option\x3e\x3c/select\x3e";
          a.querySelectorAll("[selected]").length ||
            S.push(
              "\\[[\\x20\\t\\r\\n\\f]*(?:checked|disabled|ismap|multiple|readonly|selected|value)",
            );
          a.querySelectorAll(":checked").length || S.push(":checked");
        }),
          e(function (a) {
            a.innerHTML = "\x3cinput type\x3d'hidden' i\x3d''/\x3e";
            a.querySelectorAll("[i^\x3d'']").length &&
              S.push("[*^$]\x3d[\\x20\\t\\r\\n\\f]*(?:\"\"|'')");
            a.querySelectorAll(":enabled").length ||
              S.push(":enabled", ":disabled");
            a.querySelectorAll("*,:x");
            S.push(",.*:");
          }));
      (J.matchesSelector = Aa.test(
        (da =
          I.matchesSelector ||
          I.mozMatchesSelector ||
          I.webkitMatchesSelector ||
          I.oMatchesSelector ||
          I.msMatchesSelector) + "",
      )) &&
        e(function (a) {
          J.disconnectedMatch = da.call(a, "div");
          da.call(a, "[s!\x3d'']:x");
          ba.push("!\x3d", Ta);
        });
      S = new RegExp(S.join("|"));
      ba = new RegExp(ba.join("|"));
      Q =
        Aa.test(I.contains + "") || I.compareDocumentPosition
          ? function (a, d) {
              var b = 9 === a.nodeType ? a.documentElement : a;
              d = d && d.parentNode;
              return (
                a === d ||
                !!(
                  d &&
                  1 === d.nodeType &&
                  (b.contains
                    ? b.contains(d)
                    : a.compareDocumentPosition &&
                      a.compareDocumentPosition(d) & 16)
                )
              );
            }
          : function (a, d) {
              if (d) for (; (d = d.parentNode);) if (d === a) return !0;
              return !1;
            };
      E = I.compareDocumentPosition
        ? function (a, d) {
            var c;
            return a === d
              ? ((R = !0), 0)
              : (c =
                    d.compareDocumentPosition &&
                    a.compareDocumentPosition &&
                    a.compareDocumentPosition(d))
                ? c & 1 || (a.parentNode && 11 === a.parentNode.nodeType)
                  ? a === b || Q(M, a)
                    ? -1
                    : d === b || Q(M, d)
                      ? 1
                      : 0
                  : c & 4
                    ? -1
                    : 1
                : a.compareDocumentPosition
                  ? -1
                  : 1;
          }
        : function (a, d) {
            var c = 0,
              e = a.parentNode,
              f = d.parentNode,
              m = [a],
              q = [d];
            if (a === d) return ((R = !0), 0);
            if (!e || !f)
              return a === b ? -1 : d === b ? 1 : e ? -1 : f ? 1 : 0;
            if (e === f) return h(a, d);
            for (; (a = a.parentNode);) m.unshift(a);
            for (a = d; (a = a.parentNode);) q.unshift(a);
            for (; m[c] === q[c];) c++;
            return c ? h(m[c], q[c]) : m[c] === M ? -1 : q[c] === M ? 1 : 0;
          };
      R = !1;
      [0, 0].sort(E);
      J.detectDuplicates = R;
      return G;
    };
    f.matches = function (a, d) {
      return f(a, null, null, d);
    };
    f.matchesSelector = function (a, d) {
      (a.ownerDocument || a) !== G && V(a);
      d = d.replace(la, "\x3d'$1']");
      if (!(!J.matchesSelector || C || (ba && ba.test(d)) || S.test(d)))
        try {
          var b = da.call(a, d);
          if (
            b ||
            J.disconnectedMatch ||
            (a.document && 11 !== a.document.nodeType)
          )
            return b;
        } catch (tc) {}
      return 0 < f(d, G, null, [a]).length;
    };
    f.contains = function (a, d) {
      (a.ownerDocument || a) !== G && V(a);
      return Q(a, d);
    };
    f.attr = function (a, d) {
      var b;
      (a.ownerDocument || a) !== G && V(a);
      C || (d = d.toLowerCase());
      return (b = T.attrHandle[d])
        ? b(a)
        : C || J.attributes
          ? a.getAttribute(d)
          : ((b = a.getAttributeNode(d)) || a.getAttribute(d)) && !0 === a[d]
            ? d
            : b && b.specified
              ? b.value
              : null;
    };
    f.error = function (a) {
      throw Error("Syntax error, unrecognized expression: " + a);
    };
    f.uniqueSort = function (a) {
      var d,
        b = [],
        c = 1,
        e = 0;
      R = !J.detectDuplicates;
      a.sort(E);
      if (R) {
        for (; (d = a[c]); c++) d === a[c - 1] && (e = b.push(c));
        for (; e--;) a.splice(b[e], 1);
      }
      return a;
    };
    H = f.getText = function (a) {
      var d,
        b = "",
        c = 0;
      d = a.nodeType;
      if (!d) for (; (d = a[c]); c++) b += H(d);
      else if (1 === d || 9 === d || 11 === d) {
        if ("string" === typeof a.textContent) return a.textContent;
        for (a = a.firstChild; a; a = a.nextSibling) b += H(a);
      } else if (3 === d || 4 === d) return a.nodeValue;
      return b;
    };
    T = f.selectors = {
      cacheLength: 50,
      createPseudo: c,
      match: aa,
      find: {},
      relative: {
        "\x3e": { dir: "parentNode", first: !0 },
        " ": { dir: "parentNode" },
        "+": { dir: "previousSibling", first: !0 },
        "~": { dir: "previousSibling" },
      },
      preFilter: {
        ATTR: function (a) {
          a[1] = a[1].replace(X, Z);
          a[3] = (a[4] || a[5] || "").replace(X, Z);
          "~\x3d" === a[2] && (a[3] = " " + a[3] + " ");
          return a.slice(0, 4);
        },
        CHILD: function (a) {
          a[1] = a[1].toLowerCase();
          "nth" === a[1].slice(0, 3)
            ? (a[3] || f.error(a[0]),
              (a[4] = +(a[4]
                ? a[5] + (a[6] || 1)
                : 2 * ("even" === a[3] || "odd" === a[3]))),
              (a[5] = +(a[7] + a[8] || "odd" === a[3])))
            : a[3] && f.error(a[0]);
          return a;
        },
        PSEUDO: function (a) {
          var d,
            b = !a[5] && a[2];
          if (aa.CHILD.test(a[0])) return null;
          a[4]
            ? (a[2] = a[4])
            : b &&
              La.test(b) &&
              (d = l(b, !0)) &&
              (d = b.indexOf(")", b.length - d) - b.length) &&
              ((a[0] = a[0].slice(0, d)), (a[2] = b.slice(0, d)));
          return a.slice(0, 3);
        },
      },
      filter: {
        TAG: function (a) {
          if ("*" === a)
            return function () {
              return !0;
            };
          a = a.replace(X, Z).toLowerCase();
          return function (d) {
            return d.nodeName && d.nodeName.toLowerCase() === a;
          };
        },
        CLASS: function (a) {
          var d = fa[a + " "];
          return (
            d ||
            ((d = new RegExp(
              "(^|[\\x20\\t\\r\\n\\f])" + a + "([\\x20\\t\\r\\n\\f]|$)",
            )),
            fa(a, function (a) {
              return d.test(
                a.className ||
                  (typeof a.getAttribute !== F && a.getAttribute("class")) ||
                  "",
              );
            }))
          );
        },
        ATTR: function (a, d, b) {
          return function (c) {
            c = f.attr(c, a);
            if (null == c) return "!\x3d" === d;
            if (!d) return !0;
            c += "";
            return "\x3d" === d
              ? c === b
              : "!\x3d" === d
                ? c !== b
                : "^\x3d" === d
                  ? b && 0 === c.indexOf(b)
                  : "*\x3d" === d
                    ? b && -1 < c.indexOf(b)
                    : "$\x3d" === d
                      ? b && c.slice(-b.length) === b
                      : "~\x3d" === d
                        ? -1 < (" " + c + " ").indexOf(b)
                        : "|\x3d" === d
                          ? c === b || c.slice(0, b.length + 1) === b + "-"
                          : !1;
          };
        },
        CHILD: function (a, d, b, c, e) {
          var f = "nth" !== a.slice(0, 3),
            h = "last" !== a.slice(-4),
            m = "of-type" === d;
          return 1 === c && 0 === e
            ? function (a) {
                return !!a.parentNode;
              }
            : function (d, b, q) {
                var g, l, k, n, p;
                b = f !== h ? "nextSibling" : "previousSibling";
                var v = d.parentNode,
                  u = m && d.nodeName.toLowerCase();
                q = !q && !m;
                if (v) {
                  if (f) {
                    for (; b;) {
                      for (l = d; (l = l[b]);)
                        if (
                          m ? l.nodeName.toLowerCase() === u : 1 === l.nodeType
                        )
                          return !1;
                      p = b = "only" === a && !p && "nextSibling";
                    }
                    return !0;
                  }
                  p = [h ? v.firstChild : v.lastChild];
                  if (h && q)
                    for (
                      q = v[y] || (v[y] = {}),
                        g = q[a] || [],
                        n = g[0] === P && g[1],
                        k = g[0] === P && g[2],
                        l = n && v.childNodes[n];
                      (l = (++n && l && l[b]) || (k = n = 0) || p.pop());
                    ) {
                      if (1 === l.nodeType && ++k && l === d) {
                        q[a] = [P, n, k];
                        break;
                      }
                    }
                  else if (q && (g = (d[y] || (d[y] = {}))[a]) && g[0] === P)
                    k = g[1];
                  else
                    for (
                      ;
                      (l = (++n && l && l[b]) || (k = n = 0) || p.pop()) &&
                      ((m
                        ? l.nodeName.toLowerCase() !== u
                        : 1 !== l.nodeType) ||
                        !++k ||
                        (q && ((l[y] || (l[y] = {}))[a] = [P, k]), l !== d));
                    );
                  k -= e;
                  return k === c || (0 === k % c && 0 <= k / c);
                }
              };
        },
        PSEUDO: function (a, d) {
          var b,
            e =
              T.pseudos[a] ||
              T.setFilters[a.toLowerCase()] ||
              f.error("unsupported pseudo: " + a);
          return e[y]
            ? e(d)
            : 1 < e.length
              ? ((b = [a, a, "", d]),
                T.setFilters.hasOwnProperty(a.toLowerCase())
                  ? c(function (a, b) {
                      for (var c, f = e(a, d), h = f.length; h--;)
                        ((c = U.call(a, f[h])), (a[c] = !(b[c] = f[h])));
                    })
                  : function (a) {
                      return e(a, 0, b);
                    })
              : e;
        },
      },
      pseudos: {
        not: c(function (a) {
          var d = [],
            b = [],
            e = z(a.replace(oa, "$1"));
          return e[y]
            ? c(function (a, d, b, c) {
                c = e(a, null, c, []);
                for (var f = a.length; f--;) if ((b = c[f])) a[f] = !(d[f] = b);
              })
            : function (a, c, f) {
                d[0] = a;
                e(d, null, f, b);
                return !b.pop();
              };
        }),
        has: c(function (a) {
          return function (d) {
            return 0 < f(a, d).length;
          };
        }),
        contains: c(function (a) {
          return function (d) {
            return -1 < (d.textContent || d.innerText || H(d)).indexOf(a);
          };
        }),
        lang: c(function (a) {
          xa.test(a || "") || f.error("unsupported lang: " + a);
          a = a.replace(X, Z).toLowerCase();
          return function (d) {
            var b;
            do
              if (
                (b = C
                  ? d.getAttribute("xml:lang") || d.getAttribute("lang")
                  : d.lang)
              )
                return (
                  (b = b.toLowerCase()),
                  b === a || 0 === b.indexOf(a + "-")
                );
            while ((d = d.parentNode) && 1 === d.nodeType);
            return !1;
          };
        }),
        target: function (d) {
          var b = a.location && a.location.hash;
          return b && b.slice(1) === d.id;
        },
        root: function (a) {
          return a === I;
        },
        focus: function (a) {
          return (
            a === G.activeElement &&
            (!G.hasFocus || G.hasFocus()) &&
            !!(a.type || a.href || ~a.tabIndex)
          );
        },
        enabled: function (a) {
          return !1 === a.disabled;
        },
        disabled: function (a) {
          return !0 === a.disabled;
        },
        checked: function (a) {
          var d = a.nodeName.toLowerCase();
          return (
            ("input" === d && !!a.checked) || ("option" === d && !!a.selected)
          );
        },
        selected: function (a) {
          a.parentNode && a.parentNode.selectedIndex;
          return !0 === a.selected;
        },
        empty: function (a) {
          for (a = a.firstChild; a; a = a.nextSibling)
            if ("@" < a.nodeName || 3 === a.nodeType || 4 === a.nodeType)
              return !1;
          return !0;
        },
        parent: function (a) {
          return !T.pseudos.empty(a);
        },
        header: function (a) {
          return ob.test(a.nodeName);
        },
        input: function (a) {
          return ta.test(a.nodeName);
        },
        button: function (a) {
          var d = a.nodeName.toLowerCase();
          return ("input" === d && "button" === a.type) || "button" === d;
        },
        text: function (a) {
          var d;
          return (
            "input" === a.nodeName.toLowerCase() &&
            "text" === a.type &&
            (null == (d = a.getAttribute("type")) || d.toLowerCase() === a.type)
          );
        },
        first: g(function () {
          return [0];
        }),
        last: g(function (a, d) {
          return [d - 1];
        }),
        eq: g(function (a, d, b) {
          return [0 > b ? b + d : b];
        }),
        even: g(function (a, d) {
          for (var b = 0; b < d; b += 2) a.push(b);
          return a;
        }),
        odd: g(function (a, d) {
          for (var b = 1; b < d; b += 2) a.push(b);
          return a;
        }),
        lt: g(function (a, d, b) {
          for (d = 0 > b ? b + d : b; 0 <= --d;) a.push(d);
          return a;
        }),
        gt: g(function (a, d, b) {
          for (b = 0 > b ? b + d : b; ++b < d;) a.push(b);
          return a;
        }),
      },
    };
    for (A in { radio: !0, checkbox: !0, file: !0, password: !0, image: !0 })
      T.pseudos[A] = m(A);
    for (A in { submit: !0, reset: !0 }) T.pseudos[A] = q(A);
    z = f.compile = function (a, d) {
      var b,
        c = [],
        e = [],
        f = K[a + " "];
      if (!f) {
        d || (d = l(a));
        for (b = d.length; b--;) ((f = r(d[b])), f[y] ? c.push(f) : e.push(f));
        f = K(a, D(e, c));
      }
      return f;
    };
    T.pseudos.nth = T.pseudos.eq;
    T.filters = B.prototype = T.pseudos;
    T.setFilters = new B();
    V();
    f.attr = w.attr;
    w.find = f;
    w.expr = f.selectors;
    w.expr[":"] = w.expr.pseudos;
    w.unique = f.uniqueSort;
    w.text = f.getText;
    w.isXMLDoc = f.isXML;
    w.contains = f.contains;
  })(a);
  var Ga = /Until$/,
    Ta = /^(?:parents|prev(?:Until|All))/,
    Wa = /^.[^:#\[\.,]*$/,
    lb = w.expr.match.needsContext,
    sb = { children: !0, contents: !0, next: !0, prev: !0 };
  w.fn.extend({
    find: function (a) {
      var d,
        b,
        c,
        e = this.length;
      if ("string" !== typeof a)
        return (
          (c = this),
          this.pushStack(
            w(a).filter(function () {
              for (d = 0; d < e; d++) if (w.contains(c[d], this)) return !0;
            }),
          )
        );
      b = [];
      for (d = 0; d < e; d++) w.find(a, this[d], b);
      b = this.pushStack(1 < e ? w.unique(b) : b);
      b.selector = (this.selector ? this.selector + " " : "") + a;
      return b;
    },
    has: function (a) {
      var d,
        b = w(a, this),
        c = b.length;
      return this.filter(function () {
        for (d = 0; d < c; d++) if (w.contains(this, b[d])) return !0;
      });
    },
    not: function (a) {
      return this.pushStack(p(this, a, !1));
    },
    filter: function (a) {
      return this.pushStack(p(this, a, !0));
    },
    is: function (a) {
      return (
        !!a &&
        ("string" === typeof a
          ? lb.test(a)
            ? 0 <= w(a, this.context).index(this[0])
            : 0 < w.filter(a, this).length
          : 0 < this.filter(a).length)
      );
    },
    closest: function (a, d) {
      for (
        var b,
          c = 0,
          e = this.length,
          f = [],
          h = lb.test(a) || "string" !== typeof a ? w(a, d || this.context) : 0;
        c < e;
        c++
      )
        for (
          b = this[c];
          b && b.ownerDocument && b !== d && 11 !== b.nodeType;
        ) {
          if (h ? -1 < h.index(b) : w.find.matchesSelector(b, a)) {
            f.push(b);
            break;
          }
          b = b.parentNode;
        }
      return this.pushStack(1 < f.length ? w.unique(f) : f);
    },
    index: function (a) {
      return a
        ? "string" === typeof a
          ? w.inArray(this[0], w(a))
          : w.inArray(a.jquery ? a[0] : a, this)
        : this[0] && this[0].parentNode
          ? this.first().prevAll().length
          : -1;
    },
    add: function (a, d) {
      a =
        "string" === typeof a
          ? w(a, d)
          : w.makeArray(a && a.nodeType ? [a] : a);
      a = w.merge(this.get(), a);
      return this.pushStack(w.unique(a));
    },
    addBack: function (a) {
      return this.add(null == a ? this.prevObject : this.prevObject.filter(a));
    },
  });
  w.fn.andSelf = w.fn.addBack;
  w.each(
    {
      parent: function (a) {
        return (a = a.parentNode) && 11 !== a.nodeType ? a : null;
      },
      parents: function (a) {
        return w.dir(a, "parentNode");
      },
      parentsUntil: function (a, d, b) {
        return w.dir(a, "parentNode", b);
      },
      next: function (a) {
        return g(a, "nextSibling");
      },
      prev: function (a) {
        return g(a, "previousSibling");
      },
      nextAll: function (a) {
        return w.dir(a, "nextSibling");
      },
      prevAll: function (a) {
        return w.dir(a, "previousSibling");
      },
      nextUntil: function (a, d, b) {
        return w.dir(a, "nextSibling", b);
      },
      prevUntil: function (a, d, b) {
        return w.dir(a, "previousSibling", b);
      },
      siblings: function (a) {
        return w.sibling((a.parentNode || {}).firstChild, a);
      },
      children: function (a) {
        return w.sibling(a.firstChild);
      },
      contents: function (a) {
        return w.nodeName(a, "iframe")
          ? a.contentDocument || a.contentWindow.document
          : w.merge([], a.childNodes);
      },
    },
    function (a, d) {
      w.fn[a] = function (b, c) {
        var e = w.map(this, d, b);
        Ga.test(a) || (c = b);
        c && "string" === typeof c && (e = w.filter(c, e));
        e = 1 < this.length && !sb[a] ? w.unique(e) : e;
        1 < this.length && Ta.test(a) && (e = e.reverse());
        return this.pushStack(e);
      };
    },
  );
  w.extend({
    filter: function (a, d, b) {
      b && (a = ":not(" + a + ")");
      return 1 === d.length
        ? w.find.matchesSelector(d[0], a)
          ? [d[0]]
          : []
        : w.find.matches(a, d);
    },
    dir: function (a, d, c) {
      var e = [];
      for (
        a = a[d];
        a && 9 !== a.nodeType && (c === b || 1 !== a.nodeType || !w(a).is(c));
      )
        (1 === a.nodeType && e.push(a), (a = a[d]));
      return e;
    },
    sibling: function (a, d) {
      for (var b = []; a; a = a.nextSibling)
        1 === a.nodeType && a !== d && b.push(a);
      return b;
    },
  });
  var bb =
      "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
    mb = / jQuery\d+="(?:null|\d+)"/g,
    eb = new RegExp("\x3c(?:" + bb + ")[\\s/\x3e]", "i"),
    Oa = /^\s+/,
    Ua =
      /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    fb = /<([\w:]+)/,
    Cb = /<tbody/i,
    Sb = /<|&#?\w+;/,
    Tb = /<(?:script|style|link)/i,
    qb = /^(?:checkbox|radio)$/i,
    Ub = /checked\s*(?:[^=]|=\s*.checked.)/i,
    Db = /^$|\/(?:java|ecma)script/i,
    Ob = /^true\/(.*)/,
    Vb = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
    Ja = {
      option: [1, "\x3cselect multiple\x3d'multiple'\x3e", "\x3c/select\x3e"],
      legend: [1, "\x3cfieldset\x3e", "\x3c/fieldset\x3e"],
      area: [1, "\x3cmap\x3e", "\x3c/map\x3e"],
      param: [1, "\x3cobject\x3e", "\x3c/object\x3e"],
      thead: [1, "\x3ctable\x3e", "\x3c/table\x3e"],
      tr: [2, "\x3ctable\x3e\x3ctbody\x3e", "\x3c/tbody\x3e\x3c/table\x3e"],
      col: [
        2,
        "\x3ctable\x3e\x3ctbody\x3e\x3c/tbody\x3e\x3ccolgroup\x3e",
        "\x3c/colgroup\x3e\x3c/table\x3e",
      ],
      td: [
        3,
        "\x3ctable\x3e\x3ctbody\x3e\x3ctr\x3e",
        "\x3c/tr\x3e\x3c/tbody\x3e\x3c/table\x3e",
      ],
      _default: w.support.htmlSerialize
        ? [0, "", ""]
        : [1, "X\x3cdiv\x3e", "\x3c/div\x3e"],
    },
    tb = k(R).appendChild(R.createElement("div"));
  Ja.optgroup = Ja.option;
  Ja.tbody = Ja.tfoot = Ja.colgroup = Ja.caption = Ja.thead;
  Ja.th = Ja.td;
  w.fn.extend({
    text: function (a) {
      return w.access(
        this,
        function (a) {
          return a === b
            ? w.text(this)
            : this.empty().append(
                ((this[0] && this[0].ownerDocument) || R).createTextNode(a),
              );
        },
        null,
        a,
        arguments.length,
      );
    },
    wrapAll: function (a) {
      if (w.isFunction(a))
        return this.each(function (d) {
          w(this).wrapAll(a.call(this, d));
        });
      if (this[0]) {
        var d = w(a, this[0].ownerDocument).eq(0).clone(!0);
        this[0].parentNode && d.insertBefore(this[0]);
        d.map(function () {
          for (var a = this; a.firstChild && 1 === a.firstChild.nodeType;)
            a = a.firstChild;
          return a;
        }).append(this);
      }
      return this;
    },
    wrapInner: function (a) {
      return w.isFunction(a)
        ? this.each(function (d) {
            w(this).wrapInner(a.call(this, d));
          })
        : this.each(function () {
            var d = w(this),
              b = d.contents();
            b.length ? b.wrapAll(a) : d.append(a);
          });
    },
    wrap: function (a) {
      var d = w.isFunction(a);
      return this.each(function (b) {
        w(this).wrapAll(d ? a.call(this, b) : a);
      });
    },
    unwrap: function () {
      return this.parent()
        .each(function () {
          w.nodeName(this, "body") || w(this).replaceWith(this.childNodes);
        })
        .end();
    },
    append: function () {
      return this.domManip(arguments, !0, function (a) {
        (1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType) ||
          this.appendChild(a);
      });
    },
    prepend: function () {
      return this.domManip(arguments, !0, function (a) {
        (1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType) ||
          this.insertBefore(a, this.firstChild);
      });
    },
    before: function () {
      return this.domManip(arguments, !1, function (a) {
        this.parentNode && this.parentNode.insertBefore(a, this);
      });
    },
    after: function () {
      return this.domManip(arguments, !1, function (a) {
        this.parentNode && this.parentNode.insertBefore(a, this.nextSibling);
      });
    },
    remove: function (a, d) {
      for (var b, c = 0; null != (b = this[c]); c++)
        if (!a || 0 < w.filter(a, [b]).length)
          (d || 1 !== b.nodeType || w.cleanData(A(b)),
            b.parentNode &&
              (d && w.contains(b.ownerDocument, b) && v(A(b, "script")),
              b.parentNode.removeChild(b)));
      return this;
    },
    empty: function () {
      for (var a, d = 0; null != (a = this[d]); d++) {
        for (1 === a.nodeType && w.cleanData(A(a, !1)); a.firstChild;)
          a.removeChild(a.firstChild);
        a.options && w.nodeName(a, "select") && (a.options.length = 0);
      }
      return this;
    },
    clone: function (a, d) {
      a = null == a ? !1 : a;
      d = null == d ? a : d;
      return this.map(function () {
        return w.clone(this, a, d);
      });
    },
    html: function (a) {
      return w.access(
        this,
        function (a) {
          var d = this[0] || {},
            c = 0,
            e = this.length;
          if (a === b)
            return 1 === d.nodeType ? d.innerHTML.replace(mb, "") : b;
          if (!(
            "string" !== typeof a ||
            Tb.test(a) ||
            (!w.support.htmlSerialize && eb.test(a)) ||
            (!w.support.leadingWhitespace && Oa.test(a)) ||
            Ja[(fb.exec(a) || ["", ""])[1].toLowerCase()]
          )) {
            a = a.replace(Ua, "\x3c$1\x3e\x3c/$2\x3e");
            try {
              for (; c < e; c++)
                ((d = this[c] || {}),
                  1 === d.nodeType &&
                    (w.cleanData(A(d, !1)), (d.innerHTML = a)));
              d = 0;
            } catch (mc) {}
          }
          d && this.empty().append(a);
        },
        null,
        a,
        arguments.length,
      );
    },
    replaceWith: function (a) {
      w.isFunction(a) || "string" === typeof a || (a = w(a).not(this).detach());
      return this.domManip([a], !0, function (a) {
        var d = this.nextSibling,
          b = this.parentNode;
        b && (w(this).remove(), b.insertBefore(a, d));
      });
    },
    detach: function (a) {
      return this.remove(a, !0);
    },
    domManip: function (a, d, c) {
      a = ga.apply([], a);
      var e,
        h,
        g,
        l,
        k = 0,
        n = this.length,
        p = this,
        v = n - 1,
        u = a[0],
        r = w.isFunction(u);
      if (
        r ||
        (!(1 >= n || "string" !== typeof u || w.support.checkClone) &&
          Ub.test(u))
      )
        return this.each(function (e) {
          var f = p.eq(e);
          r && (a[0] = u.call(this, e, d ? f.html() : b));
          f.domManip(a, d, c);
        });
      if (
        n &&
        ((l = w.buildFragment(a, this[0].ownerDocument, !1, this)),
        (e = l.firstChild),
        1 === l.childNodes.length && (l = e),
        e)
      ) {
        d = d && w.nodeName(e, "tr");
        g = w.map(A(l, "script"), m);
        for (h = g.length; k < n; k++)
          ((e = l),
            k !== v &&
              ((e = w.clone(e, !0, !0)), h && w.merge(g, A(e, "script"))),
            c.call(
              d && w.nodeName(this[k], "table") ? f(this[k], "tbody") : this[k],
              e,
              k,
            ));
        if (h)
          for (
            l = g[g.length - 1].ownerDocument, w.map(g, q), k = 0;
            k < h;
            k++
          )
            ((e = g[k]),
              Db.test(e.type || "") &&
                !w._data(e, "globalEval") &&
                w.contains(l, e) &&
                (e.src
                  ? w.ajax({
                      url: e.src,
                      type: "GET",
                      dataType: "script",
                      async: !1,
                      global: !1,
                      throws: !0,
                    })
                  : w.globalEval(
                      (e.text || e.textContent || e.innerHTML || "").replace(
                        Vb,
                        "",
                      ),
                    )));
        l = e = null;
      }
      return this;
    },
  });
  w.each(
    {
      appendTo: "append",
      prependTo: "prepend",
      insertBefore: "before",
      insertAfter: "after",
      replaceAll: "replaceWith",
    },
    function (a, d) {
      w.fn[a] = function (a) {
        for (var b = 0, c = [], e = w(a), f = e.length - 1; b <= f; b++)
          ((a = b === f ? this : this.clone(!0)),
            w(e[b])[d](a),
            ka.apply(c, a.get()));
        return this.pushStack(c);
      };
    },
  );
  w.extend({
    clone: function (a, d, b) {
      var c,
        e,
        f,
        h,
        g,
        l = w.contains(a.ownerDocument, a);
      w.support.html5Clone ||
      w.isXMLDoc(a) ||
      !eb.test("\x3c" + a.nodeName + "\x3e")
        ? (f = a.cloneNode(!0))
        : ((tb.innerHTML = a.outerHTML), tb.removeChild((f = tb.firstChild)));
      if (!(
        (w.support.noCloneEvent && w.support.noCloneChecked) ||
        (1 !== a.nodeType && 11 !== a.nodeType) ||
        w.isXMLDoc(a)
      ))
        for (c = A(f), g = A(a), h = 0; null != (e = g[h]); ++h)
          if (c[h]) {
            var k = c[h],
              n,
              p = void 0,
              r;
            if (1 === k.nodeType) {
              n = k.nodeName.toLowerCase();
              if (!w.support.noCloneEvent && k[w.expando]) {
                r = w._data(k);
                for (p in r.events) w.removeEvent(k, p, r.handle);
                k.removeAttribute(w.expando);
              }
              if ("script" === n && k.text !== e.text)
                ((m(k).text = e.text), q(k));
              else if ("object" === n)
                (k.parentNode && (k.outerHTML = e.outerHTML),
                  w.support.html5Clone &&
                    e.innerHTML &&
                    !w.trim(k.innerHTML) &&
                    (k.innerHTML = e.innerHTML));
              else if ("input" === n && qb.test(e.type))
                ((k.defaultChecked = k.checked = e.checked),
                  k.value !== e.value && (k.value = e.value));
              else if ("option" === n)
                k.defaultSelected = k.selected = e.defaultSelected;
              else if ("input" === n || "textarea" === n)
                k.defaultValue = e.defaultValue;
            }
          }
      if (d)
        if (b)
          for (g = g || A(a), c = c || A(f), h = 0; null != (e = g[h]); h++)
            u(e, c[h]);
        else u(a, f);
      c = A(f, "script");
      0 < c.length && v(c, !l && A(a, "script"));
      return f;
    },
    buildFragment: function (a, d, b, c) {
      for (
        var e, f, h, m, q, g, l = a.length, n = k(d), p = [], u = 0;
        u < l;
        u++
      )
        if ((f = a[u]) || 0 === f)
          if ("object" === w.type(f)) w.merge(p, f.nodeType ? [f] : f);
          else if (Sb.test(f)) {
            h = h || n.appendChild(d.createElement("div"));
            m = (fb.exec(f) || ["", ""])[1].toLowerCase();
            g = Ja[m] || Ja._default;
            h.innerHTML = g[1] + f.replace(Ua, "\x3c$1\x3e\x3c/$2\x3e") + g[2];
            for (e = g[0]; e--;) h = h.lastChild;
            !w.support.leadingWhitespace &&
              Oa.test(f) &&
              p.push(d.createTextNode(Oa.exec(f)[0]));
            if (!w.support.tbody)
              for (
                e =
                  (f =
                    "table" !== m || Cb.test(f)
                      ? "\x3ctable\x3e" !== g[1] || Cb.test(f)
                        ? 0
                        : h
                      : h.firstChild) && f.childNodes.length;
                e--;
              )
                w.nodeName((q = f.childNodes[e]), "tbody") &&
                  !q.childNodes.length &&
                  f.removeChild(q);
            w.merge(p, h.childNodes);
            for (h.textContent = ""; h.firstChild;) h.removeChild(h.firstChild);
            h = n.lastChild;
          } else p.push(d.createTextNode(f));
      h && n.removeChild(h);
      w.support.appendChecked || w.grep(A(p, "input"), D);
      for (u = 0; (f = p[u++]);)
        if (!c || -1 === w.inArray(f, c))
          if (
            ((a = w.contains(f.ownerDocument, f)),
            (h = A(n.appendChild(f), "script")),
            a && v(h),
            b)
          )
            for (e = 0; (f = h[e++]);) Db.test(f.type || "") && b.push(f);
      return n;
    },
    cleanData: function (a, d) {
      for (
        var b,
          c,
          e,
          f,
          h = 0,
          m = w.expando,
          q = w.cache,
          g = w.support.deleteExpando,
          l = w.event.special;
        null != (b = a[h]);
        h++
      )
        if (d || w.acceptData(b))
          if ((f = (e = b[m]) && q[e])) {
            if (f.events)
              for (c in f.events)
                l[c] ? w.event.remove(b, c) : w.removeEvent(b, c, f.handle);
            q[e] &&
              (delete q[e],
              g
                ? delete b[m]
                : typeof b.removeAttribute !== da
                  ? b.removeAttribute(m)
                  : (b[m] = null),
              la.push(e));
          }
    },
  });
  var cb,
    Ra,
    Sa,
    ub = /alpha\([^)]*\)/i,
    Wb = /opacity\s*=\s*([^)]*)/,
    Xb = /^(top|right|bottom|left)$/,
    Yb = /^(none|table(?!-c[ea]).+)/,
    Eb = /^margin/,
    Pb = new RegExp("^(" + ca + ")(.*)$", "i"),
    ib = new RegExp("^(" + ca + ")(?!px)[a-z%]+$", "i"),
    Zb = new RegExp("^([+-])\x3d(" + ca + ")", "i"),
    Ab = { BODY: "block" },
    $b = { position: "absolute", visibility: "hidden", display: "block" },
    Fb = { letterSpacing: 0, fontWeight: 400 },
    Qa = ["Top", "Right", "Bottom", "Left"],
    zb = ["Webkit", "O", "Moz", "ms"];
  w.fn.extend({
    css: function (a, d) {
      return w.access(
        this,
        function (a, d, c) {
          var e,
            f = {},
            h = 0;
          if (w.isArray(d)) {
            e = Ra(a);
            for (c = d.length; h < c; h++) f[d[h]] = w.css(a, d[h], !1, e);
            return f;
          }
          return c !== b ? w.style(a, d, c) : w.css(a, d);
        },
        a,
        d,
        1 < arguments.length,
      );
    },
    show: function () {
      return C(this, !0);
    },
    hide: function () {
      return C(this);
    },
    toggle: function (a) {
      var d = "boolean" === typeof a;
      return this.each(function () {
        (d ? a : H(this)) ? w(this).show() : w(this).hide();
      });
    },
  });
  w.extend({
    cssHooks: {
      opacity: {
        get: function (a, d) {
          if (d) return ((a = Sa(a, "opacity")), "" === a ? "1" : a);
        },
      },
    },
    cssNumber: {
      columnCount: !0,
      fillOpacity: !0,
      fontWeight: !0,
      lineHeight: !0,
      opacity: !0,
      orphans: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
    },
    cssProps: { float: w.support.cssFloat ? "cssFloat" : "styleFloat" },
    style: function (a, d, c, e) {
      if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
        var f,
          h,
          m,
          q = w.camelCase(d),
          g = a.style;
        d = w.cssProps[q] || (w.cssProps[q] = B(g, q));
        m = w.cssHooks[d] || w.cssHooks[q];
        if (c !== b) {
          if (
            ((h = typeof c),
            "string" === h &&
              (f = Zb.exec(c)) &&
              ((c = (f[1] + 1) * f[2] + parseFloat(w.css(a, d))),
              (h = "number")),
            !(
              null == c ||
              ("number" === h && isNaN(c)) ||
              ("number" !== h || w.cssNumber[q] || (c += "px"),
              w.support.clearCloneStyle ||
                "" !== c ||
                0 !== d.indexOf("background") ||
                (g[d] = "inherit"),
              m && "set" in m && (c = m.set(a, c, e)) === b)
            ))
          )
            try {
              g[d] = c;
            } catch (pc) {}
        } else return m && "get" in m && (f = m.get(a, !1, e)) !== b ? f : g[d];
      }
    },
    css: function (a, d, c, e) {
      var f, h;
      h = w.camelCase(d);
      d = w.cssProps[h] || (w.cssProps[h] = B(a.style, h));
      (h = w.cssHooks[d] || w.cssHooks[h]) &&
        "get" in h &&
        (f = h.get(a, !0, c));
      f === b && (f = Sa(a, d, e));
      "normal" === f && d in Fb && (f = Fb[d]);
      return "" === c || c
        ? ((a = parseFloat(f)), !0 === c || w.isNumeric(a) ? a || 0 : f)
        : f;
    },
    swap: function (a, d, b, c) {
      var e,
        f = {};
      for (e in d) ((f[e] = a.style[e]), (a.style[e] = d[e]));
      b = b.apply(a, c || []);
      for (e in d) a.style[e] = f[e];
      return b;
    },
  });
  a.getComputedStyle
    ? ((Ra = function (d) {
        return a.getComputedStyle(d, null);
      }),
      (Sa = function (a, d, c) {
        var e,
          f = (c = c || Ra(a)) ? c.getPropertyValue(d) || c[d] : b,
          h = a.style;
        c &&
          ("" !== f || w.contains(a.ownerDocument, a) || (f = w.style(a, d)),
          ib.test(f) &&
            Eb.test(d) &&
            ((a = h.width),
            (d = h.minWidth),
            (e = h.maxWidth),
            (h.minWidth = h.maxWidth = h.width = f),
            (f = c.width),
            (h.width = a),
            (h.minWidth = d),
            (h.maxWidth = e)));
        return f;
      }))
    : R.documentElement.currentStyle &&
      ((Ra = function (a) {
        return a.currentStyle;
      }),
      (Sa = function (a, d, c) {
        var e,
          f,
          h = (c = c || Ra(a)) ? c[d] : b,
          m = a.style;
        null == h && m && m[d] && (h = m[d]);
        if (ib.test(h) && !Xb.test(d)) {
          c = m.left;
          if ((f = (e = a.runtimeStyle) && e.left))
            e.left = a.currentStyle.left;
          m.left = "fontSize" === d ? "1em" : h;
          h = m.pixelLeft + "px";
          m.left = c;
          f && (e.left = f);
        }
        return "" === h ? "auto" : h;
      }));
  w.each(["height", "width"], function (a, d) {
    w.cssHooks[d] = {
      get: function (a, b, c) {
        if (b)
          return 0 === a.offsetWidth && Yb.test(w.css(a, "display"))
            ? w.swap(a, $b, function () {
                return P(a, d, c);
              })
            : P(a, d, c);
      },
      set: function (a, b, c) {
        var e = c && Ra(a);
        return z(
          a,
          b,
          c
            ? G(
                a,
                d,
                c,
                w.support.boxSizing &&
                  "border-box" === w.css(a, "boxSizing", !1, e),
                e,
              )
            : 0,
        );
      },
    };
  });
  w.support.opacity ||
    (w.cssHooks.opacity = {
      get: function (a, d) {
        return Wb.test(
          (d && a.currentStyle ? a.currentStyle.filter : a.style.filter) || "",
        )
          ? 0.01 * parseFloat(RegExp.$1) + ""
          : d
            ? "1"
            : "";
      },
      set: function (a, d) {
        var b = a.style;
        a = a.currentStyle;
        var c = w.isNumeric(d) ? "alpha(opacity\x3d" + 100 * d + ")" : "",
          e = (a && a.filter) || b.filter || "";
        b.zoom = 1;
        if (
          (1 <= d || "" === d) &&
          "" === w.trim(e.replace(ub, "")) &&
          b.removeAttribute &&
          (b.removeAttribute("filter"), "" === d || (a && !a.filter))
        )
          return;
        b.filter = ub.test(e) ? e.replace(ub, c) : e + " " + c;
      },
    });
  w(function () {
    w.support.reliableMarginRight ||
      (w.cssHooks.marginRight = {
        get: function (a, d) {
          if (d)
            return w.swap(a, { display: "inline-block" }, Sa, [
              a,
              "marginRight",
            ]);
        },
      });
    !w.support.pixelPosition &&
      w.fn.position &&
      w.each(["top", "left"], function (a, d) {
        w.cssHooks[d] = {
          get: function (a, b) {
            if (b)
              return (
                (b = Sa(a, d)),
                ib.test(b) ? w(a).position()[d] + "px" : b
              );
          },
        };
      });
  });
  w.expr &&
    w.expr.filters &&
    ((w.expr.filters.hidden = function (a) {
      return (
        (0 >= a.offsetWidth && 0 >= a.offsetHeight) ||
        (!w.support.reliableHiddenOffsets &&
          "none" === ((a.style && a.style.display) || w.css(a, "display")))
      );
    }),
    (w.expr.filters.visible = function (a) {
      return !w.expr.filters.hidden(a);
    }));
  w.each({ margin: "", padding: "", border: "Width" }, function (a, d) {
    w.cssHooks[a + d] = {
      expand: function (b) {
        var c = 0,
          e = {};
        for (b = "string" === typeof b ? b.split(" ") : [b]; 4 > c; c++)
          e[a + Qa[c] + d] = b[c] || b[c - 2] || b[0];
        return e;
      },
    };
    Eb.test(a) || (w.cssHooks[a + d].set = z);
  });
  var ac = /%20/g,
    Qb = /\[\]$/,
    Gb = /\r?\n/g,
    bc = /^(?:submit|button|image|reset|file)$/i,
    cc = /^(?:input|select|textarea|keygen)/i;
  w.fn.extend({
    serialize: function () {
      return w.param(this.serializeArray());
    },
    serializeArray: function () {
      return this.map(function () {
        var a = w.prop(this, "elements");
        return a ? w.makeArray(a) : this;
      })
        .filter(function () {
          var a = this.type;
          return (
            this.name &&
            !w(this).is(":disabled") &&
            cc.test(this.nodeName) &&
            !bc.test(a) &&
            (this.checked || !qb.test(a))
          );
        })
        .map(function (a, d) {
          a = w(this).val();
          return null == a
            ? null
            : w.isArray(a)
              ? w.map(a, function (a) {
                  return { name: d.name, value: a.replace(Gb, "\r\n") };
                })
              : { name: d.name, value: a.replace(Gb, "\r\n") };
        })
        .get();
    },
  });
  w.param = function (a, d) {
    var c,
      e = [],
      f = function (a, d) {
        d = w.isFunction(d) ? d() : null == d ? "" : d;
        e[e.length] = encodeURIComponent(a) + "\x3d" + encodeURIComponent(d);
      };
    d === b && (d = w.ajaxSettings && w.ajaxSettings.traditional);
    if (w.isArray(a) || (a.jquery && !w.isPlainObject(a)))
      w.each(a, function () {
        f(this.name, this.value);
      });
    else for (c in a) x(c, a[c], d, f);
    return e.join("\x26").replace(ac, "+");
  };
  w.each(
    "blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(
      " ",
    ),
    function (a, d) {
      w.fn[d] = function (a, b) {
        return 0 < arguments.length ? this.on(d, null, a, b) : this.trigger(d);
      };
    },
  );
  w.fn.hover = function (a, d) {
    return this.mouseenter(a).mouseleave(d || a);
  };
  var Va,
    Pa,
    vb = w.now(),
    wb = /\?/,
    dc = /#.*$/,
    Hb = /([?&])_=[^&]*/,
    ec = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
    fc = /^(?:GET|HEAD)$/,
    gc = /^\/\//,
    Ib = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
    Jb = w.fn.load,
    Kb = {},
    rb = {},
    Lb = "*/".concat("*");
  try {
    Pa = fa.href;
  } catch (hb) {
    ((Pa = R.createElement("a")), (Pa.href = ""), (Pa = Pa.href));
  }
  Va = Ib.exec(Pa.toLowerCase()) || [];
  w.fn.load = function (a, d, c) {
    if ("string" !== typeof a && Jb) return Jb.apply(this, arguments);
    var e,
      f,
      h,
      m = this,
      q = a.indexOf(" ");
    0 <= q && ((e = a.slice(q, a.length)), (a = a.slice(0, q)));
    w.isFunction(d)
      ? ((c = d), (d = b))
      : d && "object" === typeof d && (h = "POST");
    0 < m.length &&
      w
        .ajax({ url: a, type: h, dataType: "html", data: d })
        .done(function (a) {
          f = arguments;
          m.html(e ? w("\x3cdiv\x3e").append(w.parseHTML(a)).find(e) : a);
        })
        .complete(
          c &&
            function (a, d) {
              m.each(c, f || [a.responseText, d, a]);
            },
        );
    return this;
  };
  w.each(
    "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),
    function (a, d) {
      w.fn[d] = function (a) {
        return this.on(d, a);
      };
    },
  );
  w.each(["get", "post"], function (a, d) {
    w[d] = function (a, c, e, f) {
      w.isFunction(c) && ((f = f || e), (e = c), (c = b));
      return w.ajax({ url: a, type: d, dataType: f, data: c, success: e });
    };
  });
  w.extend({
    active: 0,
    lastModified: {},
    etag: {},
    ajaxSettings: {
      url: Pa,
      type: "GET",
      isLocal: /^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(
        Va[1],
      ),
      global: !0,
      processData: !0,
      async: !0,
      contentType: "application/x-www-form-urlencoded; charset\x3dUTF-8",
      accepts: {
        "*": Lb,
        text: "text/plain",
        html: "text/html",
        xml: "application/xml, text/xml",
        json: "application/json, text/javascript",
      },
      contents: { xml: /xml/, html: /html/, json: /json/ },
      responseFields: { xml: "responseXML", text: "responseText" },
      converters: {
        "* text": a.String,
        "text html": !0,
        "text json": w.parseJSON,
        "text xml": w.parseXML,
      },
      flatOptions: { url: !0, context: !0 },
    },
    ajaxSetup: function (a, d) {
      return d ? L(L(a, w.ajaxSettings), d) : L(w.ajaxSettings, a);
    },
    ajaxPrefilter: J(Kb),
    ajaxTransport: J(rb),
    ajax: function (a, d) {
      function c(a, d, c, e) {
        var l,
          D,
          B,
          t,
          H = d;
        if (2 !== A) {
          A = 2;
          m && clearTimeout(m);
          g = b;
          h = e || "";
          T.readyState = 0 < a ? 4 : 0;
          if (c) {
            t = k;
            e = T;
            var x,
              z,
              R,
              N,
              V = t.contents,
              G = t.dataTypes,
              I = t.responseFields;
            for (N in I) N in c && (e[I[N]] = c[N]);
            for (; "*" === G[0];)
              (G.shift(),
                z === b &&
                  (z = t.mimeType || e.getResponseHeader("Content-Type")));
            if (z)
              for (N in V)
                if (V[N] && V[N].test(z)) {
                  G.unshift(N);
                  break;
                }
            if (G[0] in c) R = G[0];
            else {
              for (N in c) {
                if (!G[0] || t.converters[N + " " + G[0]]) {
                  R = N;
                  break;
                }
                x || (x = N);
              }
              R = R || x;
            }
            R ? (R !== G[0] && G.unshift(R), (t = c[R])) : (t = void 0);
          }
          if ((200 <= a && 300 > a) || 304 === a)
            if (
              (k.ifModified &&
                ((c = T.getResponseHeader("Last-Modified")) &&
                  (w.lastModified[f] = c),
                (c = T.getResponseHeader("etag")) && (w.etag[f] = c)),
              204 === a)
            )
              ((l = !0), (H = "nocontent"));
            else if (304 === a) ((l = !0), (H = "notmodified"));
            else {
              a: {
                D = k;
                B = t;
                var C,
                  S,
                  H = {};
                x = 0;
                z = D.dataTypes.slice();
                R = z[0];
                D.dataFilter && (B = D.dataFilter(B, D.dataType));
                if (z[1])
                  for (S in D.converters) H[S.toLowerCase()] = D.converters[S];
                for (; (c = z[++x]);)
                  if ("*" !== c) {
                    if ("*" !== R && R !== c) {
                      S = H[R + " " + c] || H["* " + c];
                      if (!S)
                        for (C in H)
                          if (
                            ((l = C.split(" ")),
                            l[1] === c &&
                              (S = H[R + " " + l[0]] || H["* " + l[0]]))
                          ) {
                            !0 === S
                              ? (S = H[C])
                              : !0 !== H[C] &&
                                ((c = l[0]), z.splice(x--, 0, c));
                            break;
                          }
                      if (!0 !== S)
                        if (S && D["throws"]) B = S(B);
                        else
                          try {
                            B = S(B);
                          } catch (Rb) {
                            l = {
                              state: "parsererror",
                              error: S
                                ? Rb
                                : "No conversion from " + R + " to " + c,
                            };
                            break a;
                          }
                    }
                    R = c;
                  }
                l = { state: "success", data: B };
              }
              H = l.state;
              D = l.data;
              B = l.error;
              l = !B;
            }
          else if (((B = H), a || !H)) ((H = "error"), 0 > a && (a = 0));
          T.status = a;
          T.statusText = (d || H) + "";
          l ? v.resolveWith(n, [D, H, T]) : v.rejectWith(n, [T, H, B]);
          T.statusCode(r);
          r = b;
          q && p.trigger(l ? "ajaxSuccess" : "ajaxError", [T, k, l ? D : B]);
          u.fireWith(n, [T, H]);
          q &&
            (p.trigger("ajaxComplete", [T, k]),
            --w.active || w.event.trigger("ajaxStop"));
        }
      }
      "object" === typeof a && ((d = a), (a = b));
      d = d || {};
      var e,
        f,
        h,
        m,
        q,
        g,
        l,
        k = w.ajaxSetup({}, d),
        n = k.context || k,
        p = k.context && (n.nodeType || n.jquery) ? w(n) : w.event,
        v = w.Deferred(),
        u = w.Callbacks("once memory"),
        r = k.statusCode || {},
        D = {},
        B = {},
        A = 0,
        t = "canceled",
        T = {
          readyState: 0,
          getResponseHeader: function (a) {
            var d;
            if (2 === A) {
              if (!l)
                for (l = {}; (d = ec.exec(h));) l[d[1].toLowerCase()] = d[2];
              d = l[a.toLowerCase()];
            }
            return null == d ? null : d;
          },
          getAllResponseHeaders: function () {
            return 2 === A ? h : null;
          },
          setRequestHeader: function (a, d) {
            var b = a.toLowerCase();
            A || ((a = B[b] = B[b] || a), (D[a] = d));
            return this;
          },
          overrideMimeType: function (a) {
            A || (k.mimeType = a);
            return this;
          },
          statusCode: function (a) {
            var d;
            if (a)
              if (2 > A) for (d in a) r[d] = [r[d], a[d]];
              else T.always(a[T.status]);
            return this;
          },
          abort: function (a) {
            a = a || t;
            g && g.abort(a);
            c(0, a);
            return this;
          },
        };
      v.promise(T).complete = u.add;
      T.success = T.done;
      T.error = T.fail;
      k.url = ((a || k.url || Pa) + "")
        .replace(dc, "")
        .replace(gc, Va[1] + "//");
      k.type = d.method || d.type || k.method || k.type;
      k.dataTypes = w
        .trim(k.dataType || "*")
        .toLowerCase()
        .match(O) || [""];
      null == k.crossDomain &&
        ((a = Ib.exec(k.url.toLowerCase())),
        (k.crossDomain = !(
          !a ||
          (a[1] === Va[1] &&
            a[2] === Va[2] &&
            (a[3] || ("http:" === a[1] ? 80 : 443)) ==
              (Va[3] || ("http:" === Va[1] ? 80 : 443)))
        )));
      k.data &&
        k.processData &&
        "string" !== typeof k.data &&
        (k.data = w.param(k.data, k.traditional));
      E(Kb, k, d, T);
      if (2 === A) return T;
      (q = k.global) && 0 === w.active++ && w.event.trigger("ajaxStart");
      k.type = k.type.toUpperCase();
      k.hasContent = !fc.test(k.type);
      f = k.url;
      k.hasContent ||
        (k.data &&
          ((f = k.url += (wb.test(f) ? "\x26" : "?") + k.data), delete k.data),
        !1 === k.cache &&
          (k.url = Hb.test(f)
            ? f.replace(Hb, "$1_\x3d" + vb++)
            : f + (wb.test(f) ? "\x26" : "?") + "_\x3d" + vb++));
      k.ifModified &&
        (w.lastModified[f] &&
          T.setRequestHeader("If-Modified-Since", w.lastModified[f]),
        w.etag[f] && T.setRequestHeader("If-None-Match", w.etag[f]));
      ((k.data && k.hasContent && !1 !== k.contentType) || d.contentType) &&
        T.setRequestHeader("Content-Type", k.contentType);
      T.setRequestHeader(
        "Accept",
        k.dataTypes[0] && k.accepts[k.dataTypes[0]]
          ? k.accepts[k.dataTypes[0]] +
              ("*" !== k.dataTypes[0] ? ", " + Lb + "; q\x3d0.01" : "")
          : k.accepts["*"],
      );
      for (e in k.headers) T.setRequestHeader(e, k.headers[e]);
      if (k.beforeSend && (!1 === k.beforeSend.call(n, T, k) || 2 === A))
        return T.abort();
      t = "abort";
      for (e in { success: 1, error: 1, complete: 1 }) T[e](k[e]);
      if ((g = E(rb, k, d, T))) {
        T.readyState = 1;
        q && p.trigger("ajaxSend", [T, k]);
        k.async &&
          0 < k.timeout &&
          (m = setTimeout(function () {
            T.abort("timeout");
          }, k.timeout));
        try {
          ((A = 1), g.send(D, c));
        } catch (Bb) {
          if (2 > A) c(-1, Bb);
          else throw Bb;
        }
      } else c(-1, "No Transport");
      return T;
    },
    getScript: function (a, d) {
      return w.get(a, b, d, "script");
    },
    getJSON: function (a, d, b) {
      return w.get(a, d, b, "json");
    },
  });
  w.ajaxSetup({
    accepts: {
      script:
        "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript",
    },
    contents: { script: /(?:java|ecma)script/ },
    converters: {
      "text script": function (a) {
        w.globalEval(a);
        return a;
      },
    },
  });
  w.ajaxPrefilter("script", function (a) {
    a.cache === b && (a.cache = !1);
    a.crossDomain && ((a.type = "GET"), (a.global = !1));
  });
  w.ajaxTransport("script", function (a) {
    if (a.crossDomain) {
      var d,
        c = R.head || w("head")[0] || R.documentElement;
      return {
        send: function (b, e) {
          d = R.createElement("script");
          d.async = !0;
          a.scriptCharset && (d.charset = a.scriptCharset);
          d.src = a.url;
          d.onload = d.onreadystatechange = function (a, b) {
            if (b || !d.readyState || /loaded|complete/.test(d.readyState))
              ((d.onload = d.onreadystatechange = null),
                d.parentNode && d.parentNode.removeChild(d),
                (d = null),
                b || e(200, "success"));
          };
          c.insertBefore(d, c.firstChild);
        },
        abort: function () {
          if (d) d.onload(b, !0);
        },
      };
    }
  });
  var Mb = [],
    xb = /(=)\?(?=&|$)|\?\?/;
  w.ajaxSetup({
    jsonp: "callback",
    jsonpCallback: function () {
      var a = Mb.pop() || w.expando + "_" + vb++;
      this[a] = !0;
      return a;
    },
  });
  w.ajaxPrefilter("json jsonp", function (d, c, e) {
    var f,
      h,
      m,
      q =
        !1 !== d.jsonp &&
        (xb.test(d.url)
          ? "url"
          : "string" === typeof d.data &&
            !(d.contentType || "").indexOf(
              "application/x-www-form-urlencoded",
            ) &&
            xb.test(d.data) &&
            "data");
    if (q || "jsonp" === d.dataTypes[0])
      return (
        (f = d.jsonpCallback =
          w.isFunction(d.jsonpCallback) ? d.jsonpCallback() : d.jsonpCallback),
        q
          ? (d[q] = d[q].replace(xb, "$1" + f))
          : !1 !== d.jsonp &&
            (d.url += (wb.test(d.url) ? "\x26" : "?") + d.jsonp + "\x3d" + f),
        (d.converters["script json"] = function () {
          m || w.error(f + " was not called");
          return m[0];
        }),
        (d.dataTypes[0] = "json"),
        (h = a[f]),
        (a[f] = function () {
          m = arguments;
        }),
        e.always(function () {
          a[f] = h;
          d[f] && ((d.jsonpCallback = c.jsonpCallback), Mb.push(f));
          m && w.isFunction(h) && h(m[0]);
          m = h = b;
        }),
        "script"
      );
  });
  var ab,
    gb,
    hc = 0,
    yb =
      a.ActiveXObject &&
      function () {
        for (var a in ab) ab[a](b, !0);
      };
  w.ajaxSettings.xhr = a.ActiveXObject
    ? function () {
        var d;
        if (!(d = !this.isLocal && y()))
          a: {
            try {
              d = new a.ActiveXObject("Microsoft.XMLHTTP");
              break a;
            } catch (ob) {}
            d = void 0;
          }
        return d;
      }
    : y;
  gb = w.ajaxSettings.xhr();
  w.support.cors = !!gb && "withCredentials" in gb;
  (gb = w.support.ajax = !!gb) &&
    w.ajaxTransport(function (d) {
      if (!d.crossDomain || w.support.cors) {
        var c;
        return {
          send: function (e, f) {
            var h,
              m,
              q = d.xhr();
            d.username
              ? q.open(d.type, d.url, d.async, d.username, d.password)
              : q.open(d.type, d.url, d.async);
            if (d.xhrFields) for (m in d.xhrFields) q[m] = d.xhrFields[m];
            d.mimeType && q.overrideMimeType && q.overrideMimeType(d.mimeType);
            d.crossDomain ||
              e["X-Requested-With"] ||
              (e["X-Requested-With"] = "XMLHttpRequest");
            try {
              for (m in e) q.setRequestHeader(m, e[m]);
            } catch (nc) {}
            q.send((d.hasContent && d.data) || null);
            c = function (a, e) {
              var m, g, l, k;
              try {
                if (c && (e || 4 === q.readyState))
                  if (
                    ((c = b),
                    h && ((q.onreadystatechange = w.noop), yb && delete ab[h]),
                    e)
                  )
                    4 !== q.readyState && q.abort();
                  else {
                    k = {};
                    m = q.status;
                    g = q.getAllResponseHeaders();
                    "string" === typeof q.responseText &&
                      (k.text = q.responseText);
                    try {
                      l = q.statusText;
                    } catch (kb) {
                      l = "";
                    }
                    m || !d.isLocal || d.crossDomain
                      ? 1223 === m && (m = 204)
                      : (m = k.text ? 200 : 404);
                  }
              } catch (kb) {
                e || f(-1, kb);
              }
              k && f(m, l, k, g);
            };
            d.async
              ? 4 === q.readyState
                ? setTimeout(c)
                : ((h = ++hc),
                  yb && (ab || ((ab = {}), w(a).unload(yb)), (ab[h] = c)),
                  (q.onreadystatechange = c))
              : c();
          },
          abort: function () {
            c && c(b, !0);
          },
        };
      }
    });
  var Xa,
    nb,
    ic = /^(?:toggle|show|hide)$/,
    jc = new RegExp("^(?:([+-])\x3d|)(" + ca + ")([a-z%]*)$", "i"),
    kc = /queueHooks$/,
    jb = [
      function (a, d, b) {
        var c,
          e,
          f,
          h,
          m,
          q,
          g = this,
          l = a.style,
          k = {},
          n = [],
          p = a.nodeType && H(a);
        b.queue ||
          ((m = w._queueHooks(a, "fx")),
          null == m.unqueued &&
            ((m.unqueued = 0),
            (q = m.empty.fire),
            (m.empty.fire = function () {
              m.unqueued || q();
            })),
          m.unqueued++,
          g.always(function () {
            g.always(function () {
              m.unqueued--;
              w.queue(a, "fx").length || m.empty.fire();
            });
          }));
        1 === a.nodeType &&
          ("height" in d || "width" in d) &&
          ((b.overflow = [l.overflow, l.overflowX, l.overflowY]),
          "inline" === w.css(a, "display") &&
            "none" === w.css(a, "float") &&
            (w.support.inlineBlockNeedsLayout && "inline" !== N(a.nodeName)
              ? (l.zoom = 1)
              : (l.display = "inline-block")));
        b.overflow &&
          ((l.overflow = "hidden"),
          w.support.shrinkWrapBlocks ||
            g.always(function () {
              l.overflow = b.overflow[0];
              l.overflowX = b.overflow[1];
              l.overflowY = b.overflow[2];
            }));
        for (e in d)
          ((f = d[e]),
            ic.exec(f) &&
              (delete d[e],
              (c = c || "toggle" === f),
              f !== (p ? "hide" : "show") && n.push(e)));
        if ((d = n.length))
          for (
            f = w._data(a, "fxshow") || w._data(a, "fxshow", {}),
              ("hidden" in f) && (p = f.hidden),
              c && (f.hidden = !p),
              p
                ? w(a).show()
                : g.done(function () {
                    w(a).hide();
                  }),
              g.done(function () {
                var d;
                w._removeData(a, "fxshow");
                for (d in k) w.style(a, d, k[d]);
              }),
              e = 0;
            e < d;
            e++
          )
            ((c = n[e]),
              (h = g.createTween(c, p ? f[c] : 0)),
              (k[c] = f[c] || w.style(a, c)),
              c in f ||
                ((f[c] = h.start),
                p &&
                  ((h.end = h.start),
                  (h.start = "width" === c || "height" === c ? 1 : 0))));
      },
    ],
    db = {
      "*": [
        function (a, d) {
          var b,
            c = this.createTween(a, d),
            e = jc.exec(d),
            f = c.cur(),
            h = +f || 0,
            m = 1,
            q = 20;
          if (e) {
            d = +e[2];
            b = e[3] || (w.cssNumber[a] ? "" : "px");
            if ("px" !== b && h) {
              h = w.css(c.elem, a, !0) || d || 1;
              do ((m = m || ".5"), (h /= m), w.style(c.elem, a, h + b));
              while (m !== (m = c.cur() / f) && 1 !== m && --q);
            }
            c.unit = b;
            c.start = h;
            c.end = e[1] ? h + (e[1] + 1) * d : d;
          }
          return c;
        },
      ],
    };
  w.Animation = w.extend(M, {
    tweener: function (a, d) {
      w.isFunction(a) ? ((d = a), (a = ["*"])) : (a = a.split(" "));
      for (var b, c = 0, e = a.length; c < e; c++)
        ((b = a[c]), (db[b] = db[b] || []), db[b].unshift(d));
    },
    prefilter: function (a, d) {
      d ? jb.unshift(a) : jb.push(a);
    },
  });
  w.Tween = W;
  W.prototype = {
    constructor: W,
    init: function (a, d, b, c, e, f) {
      this.elem = a;
      this.prop = b;
      this.easing = e || "swing";
      this.options = d;
      this.start = this.now = this.cur();
      this.end = c;
      this.unit = f || (w.cssNumber[b] ? "" : "px");
    },
    cur: function () {
      var a = W.propHooks[this.prop];
      return a && a.get ? a.get(this) : W.propHooks._default.get(this);
    },
    run: function (a) {
      var d,
        b = W.propHooks[this.prop];
      this.pos = this.options.duration
        ? (d = w.easing[this.easing](
            a,
            this.options.duration * a,
            0,
            1,
            this.options.duration,
          ))
        : (d = a);
      this.now = (this.end - this.start) * d + this.start;
      this.options.step && this.options.step.call(this.elem, this.now, this);
      b && b.set ? b.set(this) : W.propHooks._default.set(this);
      return this;
    },
  };
  W.prototype.init.prototype = W.prototype;
  W.propHooks = {
    _default: {
      get: function (a) {
        return null == a.elem[a.prop] ||
          (a.elem.style && null != a.elem.style[a.prop])
          ? (a = w.css(a.elem, a.prop, "")) && "auto" !== a
            ? a
            : 0
          : a.elem[a.prop];
      },
      set: function (a) {
        if (w.fx.step[a.prop]) w.fx.step[a.prop](a);
        else
          a.elem.style &&
          (null != a.elem.style[w.cssProps[a.prop]] || w.cssHooks[a.prop])
            ? w.style(a.elem, a.prop, a.now + a.unit)
            : (a.elem[a.prop] = a.now);
      },
    },
  };
  W.propHooks.scrollTop = W.propHooks.scrollLeft = {
    set: function (a) {
      a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now);
    },
  };
  w.each(["toggle", "show", "hide"], function (a, d) {
    var b = w.fn[d];
    w.fn[d] = function (a, c, e) {
      return null == a || "boolean" === typeof a
        ? b.apply(this, arguments)
        : this.animate(V(d, !0), a, c, e);
    };
  });
  w.fn.extend({
    fadeTo: function (a, d, b, c) {
      return this.filter(H)
        .css("opacity", 0)
        .show()
        .end()
        .animate({ opacity: d }, a, b, c);
    },
    animate: function (a, d, b, c) {
      var e = w.isEmptyObject(a),
        f = w.speed(d, b, c),
        h = function () {
          var d = M(this, w.extend({}, a), f);
          h.finish = function () {
            d.stop(!0);
          };
          (e || w._data(this, "finish")) && d.stop(!0);
        };
      h.finish = h;
      return e || !1 === f.queue ? this.each(h) : this.queue(f.queue, h);
    },
    stop: function (a, d, c) {
      var e = function (a) {
        var d = a.stop;
        delete a.stop;
        d(c);
      };
      "string" !== typeof a && ((c = d), (d = a), (a = b));
      d && !1 !== a && this.queue(a || "fx", []);
      return this.each(function () {
        var d = !0,
          b = null != a && a + "queueHooks",
          f = w.timers,
          h = w._data(this);
        if (b) h[b] && h[b].stop && e(h[b]);
        else for (b in h) h[b] && h[b].stop && kc.test(b) && e(h[b]);
        for (b = f.length; b--;)
          f[b].elem !== this ||
            (null != a && f[b].queue !== a) ||
            (f[b].anim.stop(c), (d = !1), f.splice(b, 1));
        (!d && c) || w.dequeue(this, a);
      });
    },
    finish: function (a) {
      !1 !== a && (a = a || "fx");
      return this.each(function () {
        var d,
          b = w._data(this),
          c = b[a + "queue"];
        d = b[a + "queueHooks"];
        var e = w.timers,
          f = c ? c.length : 0;
        b.finish = !0;
        w.queue(this, a, []);
        d && d.cur && d.cur.finish && d.cur.finish.call(this);
        for (d = e.length; d--;)
          e[d].elem === this &&
            e[d].queue === a &&
            (e[d].anim.stop(!0), e.splice(d, 1));
        for (d = 0; d < f; d++) c[d] && c[d].finish && c[d].finish.call(this);
        delete b.finish;
      });
    },
  });
  w.each(
    {
      slideDown: V("show"),
      slideUp: V("hide"),
      slideToggle: V("toggle"),
      fadeIn: { opacity: "show" },
      fadeOut: { opacity: "hide" },
      fadeToggle: { opacity: "toggle" },
    },
    function (a, d) {
      w.fn[a] = function (a, b, c) {
        return this.animate(d, a, b, c);
      };
    },
  );
  w.speed = function (a, d, b) {
    var c =
      a && "object" === typeof a
        ? w.extend({}, a)
        : {
            complete: b || (!b && d) || (w.isFunction(a) && a),
            duration: a,
            easing: (b && d) || (d && !w.isFunction(d) && d),
          };
    c.duration = w.fx.off
      ? 0
      : "number" === typeof c.duration
        ? c.duration
        : c.duration in w.fx.speeds
          ? w.fx.speeds[c.duration]
          : w.fx.speeds._default;
    if (null == c.queue || !0 === c.queue) c.queue = "fx";
    c.old = c.complete;
    c.complete = function () {
      w.isFunction(c.old) && c.old.call(this);
      c.queue && w.dequeue(this, c.queue);
    };
    return c;
  };
  w.easing = {
    linear: function (a) {
      return a;
    },
    swing: function (a) {
      return 0.5 - Math.cos(a * Math.PI) / 2;
    },
  };
  w.timers = [];
  w.fx = W.prototype.init;
  w.fx.tick = function () {
    var a,
      d = w.timers,
      c = 0;
    for (Xa = w.now(); c < d.length; c++)
      ((a = d[c]), a() || d[c] !== a || d.splice(c--, 1));
    d.length || w.fx.stop();
    Xa = b;
  };
  w.fx.timer = function (a) {
    a() && w.timers.push(a) && w.fx.start();
  };
  w.fx.interval = 13;
  w.fx.start = function () {
    nb || (nb = setInterval(w.fx.tick, w.fx.interval));
  };
  w.fx.stop = function () {
    clearInterval(nb);
    nb = null;
  };
  w.fx.speeds = { slow: 600, fast: 200, _default: 400 };
  w.fx.step = {};
  w.expr &&
    w.expr.filters &&
    (w.expr.filters.animated = function (a) {
      return w.grep(w.timers, function (d) {
        return a === d.elem;
      }).length;
    });
  w.fn.offset = function (a) {
    if (arguments.length)
      return a === b
        ? this
        : this.each(function (d) {
            w.offset.setOffset(this, a, d);
          });
    var d,
      c,
      e = { top: 0, left: 0 },
      f = (c = this[0]) && c.ownerDocument;
    if (f) {
      d = f.documentElement;
      if (!w.contains(d, c)) return e;
      typeof c.getBoundingClientRect !== da && (e = c.getBoundingClientRect());
      c = ba(f);
      return {
        top: e.top + (c.pageYOffset || d.scrollTop) - (d.clientTop || 0),
        left: e.left + (c.pageXOffset || d.scrollLeft) - (d.clientLeft || 0),
      };
    }
  };
  w.offset = {
    setOffset: function (a, d, b) {
      var c = w.css(a, "position");
      "static" === c && (a.style.position = "relative");
      var e = w(a),
        f = e.offset(),
        h = w.css(a, "top"),
        m = w.css(a, "left"),
        q = {};
      ("absolute" === c || "fixed" === c) && -1 < w.inArray("auto", [h, m])
        ? ((m = e.position()), (c = m.top), (m = m.left))
        : ((c = parseFloat(h) || 0), (m = parseFloat(m) || 0));
      w.isFunction(d) && (d = d.call(a, b, f));
      null != d.top && (q.top = d.top - f.top + c);
      null != d.left && (q.left = d.left - f.left + m);
      "using" in d ? d.using.call(a, q) : e.css(q);
    },
  };
  w.fn.extend({
    position: function () {
      if (this[0]) {
        var a,
          d,
          b = { top: 0, left: 0 },
          c = this[0];
        "fixed" === w.css(c, "position")
          ? (d = c.getBoundingClientRect())
          : ((a = this.offsetParent()),
            (d = this.offset()),
            w.nodeName(a[0], "html") || (b = a.offset()),
            (b.top += w.css(a[0], "borderTopWidth", !0)),
            (b.left += w.css(a[0], "borderLeftWidth", !0)));
        return {
          top: d.top - b.top - w.css(c, "marginTop", !0),
          left: d.left - b.left - w.css(c, "marginLeft", !0),
        };
      }
    },
    offsetParent: function () {
      return this.map(function () {
        for (
          var a = this.offsetParent || R.documentElement;
          a && !w.nodeName(a, "html") && "static" === w.css(a, "position");
        )
          a = a.offsetParent;
        return a || R.documentElement;
      });
    },
  });
  w.each(
    { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" },
    function (a, d) {
      var c = /Y/.test(d);
      w.fn[a] = function (e) {
        return w.access(
          this,
          function (a, e, f) {
            var h = ba(a);
            if (f === b)
              return h ? (d in h ? h[d] : h.document.documentElement[e]) : a[e];
            h
              ? h.scrollTo(c ? w(h).scrollLeft() : f, c ? f : w(h).scrollTop())
              : (a[e] = f);
          },
          a,
          e,
          arguments.length,
          null,
        );
      };
    },
  );
  w.each({ Height: "height", Width: "width" }, function (a, d) {
    w.each(
      { padding: "inner" + a, content: d, "": "outer" + a },
      function (c, e) {
        w.fn[e] = function (e, f) {
          var h = arguments.length && (c || "boolean" !== typeof e),
            m = c || (!0 === e || !0 === f ? "margin" : "border");
          return w.access(
            this,
            function (d, c, e) {
              return w.isWindow(d)
                ? d.document.documentElement["client" + a]
                : 9 === d.nodeType
                  ? ((c = d.documentElement),
                    Math.max(
                      d.body["scroll" + a],
                      c["scroll" + a],
                      d.body["offset" + a],
                      c["offset" + a],
                      c["client" + a],
                    ))
                  : e === b
                    ? w.css(d, c, m)
                    : w.style(d, c, e, m);
            },
            d,
            h ? e : b,
            h,
            null,
          );
        };
      },
    );
  });
  a.jQuery = a.$ = w;
  "function" === typeof define &&
    define.amd &&
    define.amd.jQuery &&
    define("jquery", [], function () {
      return w;
    });
})(window);
var UrlTools = (function () {
  var a = (function (a) {
      return a
        .replace(/#(\d+)\$/g, function (a, d) {
          return Array(+d + 3).join("#");
        })
        .replace(/#/g, "####")
        .replace(/(\w\w):([\w#]+)(?:,|$)/g, function (a, d, b) {
          return b.replace(/../g, function (a) {
            return "##" != a ? d + a : a;
          });
        });
    })(
      "4e:020405060f12171f20212326292e2f313335373c40414244464a5155575a5b6263646567686a6b6c6d6e6f727475767778797a7b7c7d7f808182838485878a#909697999c9d9ea3aaafb0b1b4b6b7b8b9bcbdbec8cccfd0d2dadbdce0e2e6e7e9edeeeff1f4f8f9fafcfe,4f:00020304050607080b0c12131415161c1d212328292c2d2e31333537393b3e3f40414244454748494a4b4c525456616266686a6b6d6e7172757778797a7d8081828586878a8c8e909293959698999a9c9e9fa1a2a4abadb0b1b2b3b4b6b7b8b9babbbcbdbec0c1c2c6c7c8c9cbcccdd2d3d4d5d6d9dbe0e2e4e5e7ebecf0f2f4f5f6f7f9fbfcfdff,50:000102030405060708090a#0b0e1011131516171b1d1e20222324272b2f303132333435363738393b3d3f404142444546494a4b4d5051525354565758595b5d5e5f6061626364666768696a6b6d6e6f70717273747578797a7c7d818283848687898a8b8c8e8f909192939495969798999a9b9c9d9e9fa0a1a2a4a6aaabadaeafb0b1b3b4b5b6b7b8b9bcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdced0d1d2d3d4d5d7d8d9dbdcdddedfe0e1e2e3e4e5e8e9eaebeff0f1f2f4f6f7f8f9fafcfdfeff,51:00010203040508#090a0c0d0e0f1011131415161718191a1b1c1d1e1f2022232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e42474a4c4e4f5052535758595b5d5e5f606163646667696a6f727a7e7f838486878a8b8e8f90919394989a9d9e9fa1a3a6a7a8a9aaadaeb4b8b9babebfc1c2c3c5c8cacdced0d2d3d4d5d6d7d8d9dadcdedfe2e3e5e6e7e8e9eaeceef1f2f4f7fe,52:0405090b0c0f101314151c1e1f2122232526272a2c2f313234353c3e4445464748494b4e4f5253555758#595a5b5d5f6062636466686b6c6d6e7071737475767778797a7b7c7e808384858687898a8b8c8d8e8f91929495969798999a9ca4a5a6a7aeafb0b4b5b6b7b8b9babbbcbdc0c1c2c4c5c6c8cacccdcecfd1d3d4d5d7d9dadbdcdddee0e1e2e3e5e6e7e8e9eaebecedeeeff1f2f3f4f5f6f7f8fbfcfd,53:0102030407090a0b0c0e11121314181b1c1e1f2224252728292b2c2d2f3031323334353637383c3d404244464b4c4d505458595b5d65686a6c6d7276797b7c7d7e80818387888a8e8f#90919293949697999b9c9ea0a1a4a7aaabacadafb0b1b2b3b4b5b7b8b9babcbdbec0c3c4c5c6c7cecfd0d2d3d5dadcdddee1e2e7f4fafeff,54:000205070b1418191a1c2224252a303336373a3d3f4142444547494c4d4e4f515a5d5e5f6061636567696a6b6c6d6e6f7074797a7e7f8183858788898a8d919397989c9e9fa0a1a2a5aeb0b2b5b6b7b9babcbec3c5cacbd6d8dbe0e1e2e3e4ebeceff0f1f4f5f6f7f8f9fbfe,55:0002030405080a0b0c0d0e121315161718191a1c1d1e1f212526#28292b2d3234353638393a3b3d40424547484b4c4d4e4f515253545758595a5b5d5e5f60626368696b6f7071727374797a7d7f85868c8d8e9092939596979a9b9ea0a1a2a3a4a5a6a8a9aaabacadaeafb0b2b4b6b8babcbfc0c1c2c3c6c7c8cacbcecfd0d5d7d8d9dadbdee0e2e7e9edeef0f1f4f6f8f9fafbfcff,56:0203040506070a0b0d1011121314151617191a1c1d202122252628292a2b2e2f30333537383a3c3d3e404142434445464748494a4b4f5051525355565a5b5d5e5f6061#636566676d6e6f70727374757778797a7d7e7f80818283848788898a8b8c8d9091929495969798999a9b9c9d9e9fa0a1a2a4a5a6a7a8a9aaabacadaeb0b1b2b3b4b5b6b8b9babbbdbebfc0c1c2c3c4c5c6c7c8c9cbcccdcecfd0d1d2d3d5d6d8d9dce3e5e6e7e8e9eaeceeeff2f3f6f7f8fbfc,57:00010205070b0c0d0e0f101112131415161718191a1b1d1e202122242526272b313234353637383c3d3f414344454648494b52535455565859626365676c6e707172747578797a7d7e7f80#818788898a8d8e8f90919495969798999a9c9d9e9fa5a8aaacafb0b1b3b5b6b7b9babbbcbdbebfc0c1c4c5c6c7c8c9cacccdd0d1d3d6d7dbdcdee1e2e3e5e6e7e8e9eaebeceef0f1f2f3f5f6f7fbfcfeff,58:0103040508090a0c0e0f101213141617181a1b1c1d1f222325262728292b2c2d2e2f31323334363738393a3b3c3d3e3f4041424345464748494a4b4e4f505253555657595a5b5c5d5f6061626364666768696a6d6e6f707172737475767778797a7b7c7d7f82848687888a8b8c#8d8e8f909194959697989b9c9da0a1a2a3a4a5a6a7aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbdbebfc0c2c3c4c6c7c8c9cacbcccdcecfd0d2d3d4d6d7d8d9dadbdcdddedfe0e1e2e3e5e6e7e8e9eaedeff1f2f4f5f7f8fafbfcfdfeff,59:000103050608090a0b0c0e1011121317181b1d1e2021222326282c30323335363b3d3e3f404345464a4c4d505253595b5c5d5e5f616364666768696a6b6c6d6e6f70717275777a7b7c7e7f8085898b8c8e8f90919495989a9b9c9d9fa0a1a2a6#a7acadb0b1b3b4b5b6b7b8babcbdbfc0c1c2c3c4c5c7c8c9cccdcecfd5d6d9dbdedfe0e1e2e4e6e7e9eaebedeeeff0f1f2f3f4f5f6f7f8fafcfdfe,5a:00020a0b0d0e0f101214151617191a1b1d1e2122242627282a2b2c2d2e2f3033353738393a3b3d3e3f414243444547484b4c4d4e4f5051525354565758595b5c5d5e5f60616364656668696b6c6d6e6f7071727378797b7c7d7e808182838485868788898a8b8c8d8e8f9091939495969798999c9d9e9fa0a1a2a3a4a5a6a7a8a9abac#adaeafb0b1b4b6b7b9babbbcbdbfc0c3c4c5c6c7c8cacbcdcecfd0d1d3d5d7d9dadbdddedfe2e4e5e7e8eaecedeeeff0f2f3f4f5f6f7f8f9fafbfcfdfeff,5b:0001020304050607080a0b0c0d0e0f10111213141518191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303133353638393a3b3c3d3e3f4142434445464748494a4b4c4d4e4f52565e606167686b6d6e6f7274767778797b7c7e7f82868a8d8e90919294969fa7a8a9acadaeafb1b2b7babbbcc0c1c3c8c9cacbcdcecf#d1d4d5d6d7d8d9dadbdce0e2e3e6e7e9eaebecedeff1f2f3f4f5f6f7fdfe,5c:0002030507080b0c0d0e10121317191b1e1f2021232628292a2b2d2e2f303233353637434446474c4d5253545657585a5b5c5d5f62646768696a6b6c6d70727374757677787b7c7d7e808384858687898a8b8e8f9293959d9e9fa0a1a4a5a6a7a8aaaeafb0b2b4b6b9babbbcbec0c2c3c5c6c7c8c9cacccdcecfd0d1d3d4d5d6d7d8dadbdcdddedfe0e2e3e7e9ebeceeeff1f2f3f4f5f6f7f8f9fafcfdfeff,5d:00#01040508090a0b0c0d0f10111213151718191a1c1d1f2021222325282a2b2c2f3031323335363738393a3b3c3f4041424344454648494d4e4f5051525354555657595a5c5e5f6061626364656667686a6d6e7071727375767778797a7b7c7d7e7f8081838485868788898a8b8c8d8e8f9091929394959697989a9b9c9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b8b9babbbcbdbebfc0c1c2c3c4c6c7c8c9cacbcccecfd0d1d2d3d4d5d6d7d8d9dadcdfe0e3e4eaeced#f0f5f6f8f9fafbfcff,5e:000407090a0b0d0e1213171e1f20212223242528292a2b2c2f303233343536393a3e3f404143464748494a4b4d4e4f50515253565758595a5c5d5f60636465666768696a6b6c6d6e6f70717577797e8182838588898c8d8e92989b9da1a2a3a4a8a9aaabacaeafb0b1b2b4babbbcbdbfc0c1c2c3c4c5c6c7c8cbcccdcecfd0d4d5d7d8d9dadcdddedfe0e1e2e3e4e5e6e7e9ebecedeeeff0f1f2f3f5f8f9fbfcfd,5f:050607090c0d0e10121416191a1c1d1e21222324#282b2c2e30323334353637383b3d3e3f4142434445464748494a4b4c4d4e4f5154595a5b5c5e5f60636567686b6e6f72747576787a7d7e7f83868d8e8f919394969a9b9d9e9fa0a2a3a4a5a6a7a9abacafb0b1b2b3b4b6b8b9babbbebfc0c1c2c7c8cacbced3d4d5dadbdcdedfe2e3e5e6e8e9eceff0f2f3f4f6f7f9fafc,60:0708090b0c10111317181a1e1f2223242c2d2e3031323334363738393a3d3e404445464748494a4c4e4f5153545657585b5c5e5f606165666e71727475777e80#8182858687888a8b8e8f909193959798999c9ea1a2a4a5a7a9aaaeb0b3b5b6b7b9babdbebfc0c1c2c3c4c7c8c9cccdcecfd0d2d3d4d6d7d9dbdee1e2e3e4e5eaf1f2f5f7f8fbfcfdfeff,61:02030405070a0b0c1011121314161718191b1c1d1e21222528292a2c2d2e2f303132333435363738393a3b3c3d3e4041424344454647494b4d4f50525354565758595a5b5c5e5f606163646566696a6b6c6d6e6f717273747678797a7b7c7d7e7f808182838485868788898a8c8d8f9091929395#969798999a9b9c9e9fa0a1a2a3a4a5a6aaabadaeafb0b1b2b3b4b5b6b8b9babbbcbdbfc0c1c3c4c5c6c7c9cccdcecfd0d3d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e7e8e9eaebecedeeeff0f1f2f3f4f6f7f8f9fafbfcfdfe,62:00010203040507091314191c1d1e2023262728292b2d2f303132353638393a3b3c424445464a4f50555657595a5c5d5e5f6061626465687172747577787a7b7d818283858687888b8c8d8e8f9094999c9d9ea3a6a7a9aaadaeafb0b2b3b4b6b7b8babec0c1#c3cbcfd1d5dddee0e1e4eaebf0f2f5f8f9fafb,63:00030405060a0b0c0d0f10121314151718191c2627292c2d2e30313334353637383b3c3e3f40414447484a51525354565758595a5b5c5d60646566686a6b6c6f707273747578797c7d7e7f81838485868b8d9193949597999a9b9c9d9e9fa1a4a6abafb1b2b5b6b9bbbdbfc0c1c2c3c5c7c8cacbccd1d3d4d5d7d8d9dadbdcdddfe2e4e5e6e7e8ebeceeeff0f1f3f5f7f9fafbfcfe,64:0304060708090a0d0e111215161718191a1d1f222324#252728292b2e2f3031323335363738393b3c3e404243494b4c4d4e4f505153555657595a5b5c5d5f60616263646566686a6b6c6e6f70717273747576777b7c7d7e7f8081838688898a8b8c8d8e8f90939497989a9b9c9d9fa0a1a2a3a5a6a7a8aaabafb1b2b3b4b6b9bbbdbebfc1c3c4c6c7c8c9cacbcccfd1d3d4d5d6d9dadbdcdddfe0e1e3e5e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,65:01020304050607080a0b0c0d0e0f10111314151617191a1b1c1d1e1f2021#222324262728292a2c2d30313233373a3c3d404142434446474a4b4d4e5052535457585a5c5f606164656768696a6d6e6f7173757678797a7b7c7d7e7f8081828384858688898a8d8e8f92949596989a9d9ea0a2a3a6a8aaacaeb1b2b3b4b5b6b7b8babbbebfc0c2c7c8c9cacdd0d1d3d4d5d8d9dadbdcdddedfe1e3e4eaebf2f3f4f5f8f9fbfcfdfeff,66:0104050708090b0d1011121617181a1b1c1e2122232426292a2b2c2e3032333738393a3b3d3f40424445464748494a4d4e505158#595b5c5d5e6062636567696a6b6c6d7172737578797b7c7d7f808183858688898a8b8d8e8f909293949598999a9b9c9e9fa0a1a2a3a4a5a6a9aaabacadafb0b1b2b3b5b6b7b8babbbcbdbfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8dadedfe0e1e2e3e4e5e7e8eaebecedeeeff1f5f6f8fafbfd,67:010203040506070c0e0f1112131618191a1c1e20212223242527292e303233363738393b3c3e3f414445474a4b4d5254555758595a5b5d62636466676b6c6e717476#78797a7b7d8082838586888a8c8d8e8f9192939496999b9fa0a1a4a6a9acaeb1b2b4b9babbbcbdbebfc0c2c5c6c7c8c9cacbcccdced5d6d7dbdfe1e3e4e6e7e8eaebedeef2f5f6f7f8f9fafbfcfe,68:01020304060d1012141518191a1b1c1e1f20222324252627282b2c2d2e2f30313435363a3b3f474b4d4f52565758595a5b5c5d5e5f6a6c6d6e6f707172737578797a7b7c7d7e7f8082848788898a8b8c8d8e90919294959698999a9b9c9d9e9fa0a1a3a4a5a9aaabacaeb1b2b4b6b7b8#b9babbbcbdbebfc1c3c4c5c6c7c8cacccecfd0d1d3d4d6d7d9dbdcdddedfe1e2e4e5e6e7e8e9eaebecedeff2f3f4f6f7f8fbfdfeff,69:00020304060708090a0c0f11131415161718191a1b1c1d1e21222325262728292a2b2c2e2f313233353637383a3b3c3e4041434445464748494a4b4c4d4e4f50515253555658595b5c5f616264656768696a6c6d6f7072737475767a7b7d7e7f8183858a8b8c8e8f909192939697999a9d9e9fa0a1a2a3a4a5a6a9aaacaeafb0b2b3b5b6b8b9babcbd#bebfc0c2c3c4c5c6c7c8c9cbcdcfd1d2d3d5d6d7d8d9dadcdddee1e2e3e4e5e6e7e8e9eaebeceeeff0f1f3f4f5f6f7f8f9fafbfcfe,6a:000102030405060708090b0c0d0e0f10111213141516191a1b1c1d1e20222324252627292b2c2d2e30323334363738393a3b3c3f40414243454648494a4b4c4d4e4f515253545556575a5c5d5e5f60626364666768696a6b6c6d6e6f70727374757677787a7b7d7e7f81828385868788898a8b8c8d8f929394959698999a9b9c9d9e9fa1a2a3a4a5a6#a7a8aaadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,6b:000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f252628292a2b2c2d2e2f303133343536383b3c3d3f4041424445484a4b4d4e4f5051525354555657585a5b5c5d5e5f606168696b6c6d6e6f7071727374757677787a7d7e7f808588#8c8e8f909194959798999c9d9e9fa0a2a3a4a5a6a7a8a9abacadaeafb0b1b2b6b8b9babbbcbdbec0c3c4c6c7c8c9caccced0d1d8dadcdddedfe0e2e3e4e5e6e7e8e9ecedeef0f1f2f4f6f7f8fafbfcfeff,6c:000102030408090a0b0c0e12171c1d1e2023252b2c2d31333637393a3b3c3e3f434445484b4c4d4e4f5152535658595a62636566676b6c6d6e6f71737577787a7b7c7f8084878a8b8d8e9192959697989a9c9d9ea0a2a8acafb0b4b5b6b7bac0c1c2c3c6c7c8cbcdcecfd1d2d8#d9dadcdddfe4e6e7e9ecedf2f4f9ff,6d:000203050608090a0d0f101113141516181c1d1f20212223242628292c2d2f30343637383a3f404244494c50555657585b5d5f6162646567686b6c6d707172737576797a7b7d7e7f8081838486878a8b8d8f9092969798999a9ca2a5acadb0b1b3b4b6b7b9babbbcbdbec1c2c3c8c9cacdcecfd0d2d3d4d5d7dadbdcdfe2e3e5e7e8e9eaedeff0f2f4f5f6f8fafdfeff,6e:0001020304060708090b0f12131518191b1c1e1f222627282a2c2e30313335#3637393b3c3d3e3f40414245464748494a4b4c4f5051525557595a5c5d5e606162636465666768696a6c6d6f707172737475767778797a7b7c7d8081828487888a8b8c8d8e91929394959697999a9b9d9ea0a1a3a4a6a8a9abacadaeb0b3b5b8b9bcbebfc0c3c4c5c6c8c9cacccdced0d2d6d8d9dbdcdde3e7eaebecedeeeff0f1f2f3f5f6f7f8fafbfcfdfeff,6f:000103040507080a0b0c0d0e101112161718191a1b1c1d1e1f212223252627282c2e303234353738393a3b3c3d3f404142#43444548494a4c4e4f5051525354555657595a5b5d5f60616364656768696a6b6c6f707173757677797b7d7e7f808182838586878a8b8f909192939495969798999a9b9d9e9fa0a2a3a4a5a6a8a9aaabacadaeafb0b1b2b4b5b7b8babbbcbdbebfc1c3c4c5c6c7c8cacbcccdcecfd0d3d4d5d6d7d8d9dadbdcdddfe2e3e4e5e6e7e8e9eaebecedf0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,70:000102030405060708090a0b0c0d0e0f1012131415161718191c1d1e1f2021222425262728292a#2b2c2d2e2f30313233343637383a3b3c3d3e3f404142434445464748494a4b4d4e505152535455565758595a5b5c5d5f606162636465666768696a6e7172737477797a7b7d818283848687888b8c8d8f90919397989a9b9e9fa0a1a2a3a4a5a6a7a8a9aab0b2b4b5b6babebfc4c5c6c7c9cbcccdcecfd0d1d2d3d4d5d6d7dadcdddee0e1e2e3e5eaeef0f1f2f3f4f5f6f8fafbfcfeff,71:0001020304050607080b0c0d0e0f111214171b1c1d1e1f2021222324252728292a2b2c2d2e323334#353738393a3b3c3d3e3f4041424344464748494b4d4f505152535455565758595a5b5d5f6061626365696a6b6c6d6f707174757677797b7c7e7f8081828385868788898b8c8d8e909192939596979a9b9c9d9ea1a2a3a4a5a6a7a9aaabadaeafb0b1b2b4b6b7b8babbbcbdbebfc0c1c2c4c5c6c7c8c9cacbcccdcfd0d1d2d3d6d7d8d9dadbdcdddedfe1e2e3e4e6e8e9eaebecedeff0f1f2f3f4f5f6f7f8fafbfcfdfeff,72:0001020304050708090a0b0c0d0e0f101112131415161718191a#1b1c1e1f2021222324252627292b2d2e2f3233343a3c3e40414243444546494a4b4e4f505153545557585a5c5e60636465686a6b6c6d707173747677787b7c7d828385868788898c8e9091939495969798999a9b9c9d9ea0a1a2a3a4a5a6a7a8a9aaabaeb1b2b3b5babbbcbdbebfc0c5c6c7c9cacbcccfd1d3d4d5d6d8dadb#95$,30:000102,00b702:c9c7,00a830:0305,2014ff5e20:162618191c1d,30:141508090a0b0c0d0e0f16171011,00:b1d7f7,22:362728110f2a2908371aa52520,231222:992b2e614c483d1d606e6f64651e3534,26:4240,00b020:3233,2103ff0400a4ff:e0e1,203000a7211626:0605,25:cbcfcec7c6a1a0b3b2,203b21:92909193,30:13#95$,21:70717273747576777879#4$,24:88898a8b8c8d8e8f909192939495969798999a9b7475767778797a7b7c7d7e7f808182838485868760616263646566676869##,32:20212223242526272829##,21:606162636465666768696a6b#97$,ff:010203e505060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5de3#95$,30:4142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f90919293#106$a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6#103$,03:9192939495969798999a9b9c9d9e9fa0a1a3a4a5a6a7a8a9#6$b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c3c4c5c6c7c8c9#5$,fe:3536393a3f403d3e41424344##3b3c373831#3334#104$,04:10111213141501161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f#13$30313233343551363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f#11$,02:cacbd9,20:13152535,21:050996979899,22:151f23526667bf,25:505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f7071727381828384858687#88898a8b8c8d8e8f939495bcbde2e3e4e5,2609229530:121d1e#9$,010100e101ce00e0011300e9011b00e8012b00ed01d000ec014d00f301d200f2016b00fa01d400f901:d6d8dadc,00:fcea,0251e7c701:4448,e7c802:61#2$,31:05060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20212223242526272829#19$,30:212223242526272829,32a333:8e8f9c9d9ea1c4ced1d2d5,fe30ff:e2e4#,212132:31#,20:10#1$,30:fc9b9cfdfe069d9e,fe:494a4b4c4d4e4f50515254555657595a5b5c5d5e5f6061#626364656668696a6b,e7:e7e8e9eaebecedeeeff0f1f2f3,30:07#11$,25:000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b#13$,72:dcdddfe2e3e4e5e6e7eaebf5f6f9fdfeff,73:00020405060708090b0c0d0f1011121418191a1f2023242627282d2f30323335363a3b3c3d404142434445464748#494a4b4c4e4f515354555658595a5b5c5d5e5f6162636465666768696a6b6e7071#92$72737475767778797a7b7c7d7f808182838586888a8c8d8f90929394959798999a9c9d9ea0a1a3a4a5a6a7a8aaacadb1b4b5b6b8b9bcbdbebfc1c3c4c5c6c7#cbccced2d3d4d5d6d7d8dadbdcdddfe1e2e3e4e6e8eaebeceeeff0f1f3f4f5f6f7#92$f8f9fafbfcfdfeff,74:0001020407080b0c0d0e1112131415161718191c1d1e1f2021232427292b2d2f31323738393a3b3d3e3f4042434445464748494a4b4c4d#4e4f505152535456585d606162636465666768696a6b6c6e6f717273747578797a#92$7b7c7d7f8284858688898a8c8d8f9192939495969798999a9b9d9fa0a1a2a3a4a5a6aaabacadaeafb0b1b2b3b4b5b6b7b8b9bbbcbdbebfc0c1c2c3c4c5c6c7#c8c9cacbcccdcecfd0d1d3d4d5d6d7d8d9dadbdddfe1e5e7e8e9eaebecedf0f1f2#92$f3f5f8f9fafbfcfdfe,75:0001020305060708090a0b0c0e1012141516171b1d1e202122232426272a2e3436393c3d3f414243444647494a4d5051525355565758#5d5e5f60616263646768696b6c6d6e6f7071737576777a7b7c7d7e808182848587#92$88898a8c8d8e909395989b9c9ea2a6a7a8a9aaadb6b7babbbfc0c1c6cbcccecfd0d1d3d7d9dadcdddfe0e1e5e9ecedeeeff2f3f5f6f7f8fafbfdfe,76:02040607#08090b0d0e0f11121314161a1c1d1e212327282c2e2f31323637393a3b3d414244#92$45464748494a4b4e4f50515253555758595a5b5d5f6061626465666768696a6c6d6e7071727374757677797a7c7f80818385898a8c8d8f9092949597989a9b#9c9d9e9fa0a1a2a3a5a6a7a8a9aaabacadafb0b3b5b6b7b8b9babbbcbdbec0c1c3,554a963f57c3632854ce550954c076:914c,853c77ee827e788d72319698978d6c285b894ffa630966975cb880fa684880ae660276ce51f9655671ac7ff1888450b2596561ca6fb382ad634c625253ed54277b06516b75a45df462d48dcb9776628a8019575d97387f627238767d67cf767e64464f708d2562dc7a17659173ed642c6273822c9881677f724862:6ecc,4f3474e3534a529e7eca90a65e2e6886699c81807ed168d278c5868c9551508d8c2482de80de53058912526576:c4c7c9cbccd3d5d9dadcdddee0e1e2e3e4e6e7e8e9eaebecedf0f3f5f6f7fafbfdff,77:00020305060a0c0e0f1011121314151617181b1c1d1e21232425272a2b#2c2e3031323334393b3d3e3f4244454648494a4b4c4d4e4f52535455565758595c,858496f94fdd582199715b9d62:b1a5,66b48c799c8d7206676f789160b253:5117,8f8880cc8d1d94a1500d72c8590760eb711988ab595482ef672c7b285d297ef7752d6cf58e668ff8903c9f3b6bd491197b145f7c78a784d6853d6b:d5d9d6,5e:0187,75f995ed655d5f:0ac5,8f9f58c181c2907f965b97ad8fb97f168d2c62414fbf53:d85e,8f:a8a9ab,904d68075f6a819888689cd6618b522b762a5f6c658c6fd26ee85bbe644851:75b0,67c44e1979c9997c70b377:5d5e5f606467696a6d6e6f7071727374757677787a7b7c818283868788898a8b8f90939495969798999a9b9c9d9ea1a3a4a6a8abadaeafb1b2b4b6b7b8b9ba#bcbec0c1c2c3c4c5c6c7c8c9cacbcccecfd0d1d2d3d4d5d6d8d9dadddedfe0e1e4,75c55e7673bb83e064ad62e894b56ce2535a52c3640f94c27b944f2f5e1b823681:168a,6e246cca9a736355535c54fa886557e04e0d5e036b657c3f90e8601664e6731c88c16750624d8d22776c8e2991c75f6983dc8521991053c286956b8b60:ede8,707f82:cd31,4ed36ca785cf64cd7cd969fd66f9834953957b564fa7518c6d4b5c428e6d63d253c983:2c36,67e578b4643d5bdf5c945dee8be762c667f48c7a640063ba8749998b8c177f2094f24ea7961098a4660c731677:e6e8eaeff0f1f2f4f5f7f9fafbfc,78:0304050607080a0b0e0f101315191b1e20212224282a2b2e2f31323335363d3f414243444648494a4b4d4f51535458595a#5b5c5e5f606162636465666768696f7071727374757678797a7b7d7e7f80818283,573a5c1d5e38957f507f80a05382655e7545553150218d856284949e671d56326f6e5de2543570928f66626f64a463a35f7b6f8890f481e38fb05c1866685ff16c8996488d81886c649179f057ce6a59621054484e587a0b60e96f848bda627f901e9a8b79e4540375f4630153196c608fdf5f1b9a70803b9f7f4f885c3a8d647fc565a570bd51:45b2,866b5d075ba062bd916c75748e0c7a2061017b794ec77ef877854e1181ed521d51fa6a7153a88e87950496cf6ec19664695a78:848586888a8b8f9092949596999d9ea0a2a4a6a8a9aaabacadaeafb5b6b7b8babbbcbdbfc0c2c3c4c6c7c8cccdcecfd1d2d3d6d7d8dadbdcdddedfe0e1e2e3#e4e5e6e7e9eaebedeeeff0f1f3f5f6f8f9fbfcfdfeff,79:00020304060708090a0b0c,784050a877d7641089e6590463e35ddd7a7f693d4f20823955984e3275ae7a975e:628a,95ef521b5439708a6376952457826625693f918755076df37eaf882262337ef075b5832878c196cc8f9e614874f78bcd6b64523a8d506b21806a847156f153064e:ce1b,51d17c97918b7c074fc38e7f7be17a9c64675d1450ac810676017cb96dec7fe067515b:58f8,78cb64:ae13,63:aa2b,9519642d8fbe7b5476296253592754466b7950a362345e266b864ee38d37888b5f85902e79:0d0e0f1011121415161718191a1b1c1d1f2021222325262728292a2b2c2d2e2f3031323335363738393d3f42434445474a4b4c4d4e4f505152545558596163#6466696a6b6c6e70717273747576797b7c7d7e7f8283868788898b8c8d8e909192,6020803d62c54e39535590f863b880c665e66c2e4f4660ee6de18bde5f3986cb5f536321515a83616863520063638e4850125c9b79775bfc52307a3b60bc905376d75f:b797,76848e6c706f767b7b4977aa51f3909358244f4e6ef48fea654c7b1b72c46da47fdf5ae162b55e95573084827b2c5e1d5f1f90127f1498a063826ec7789870b95178975b57ab75354f4375385e9760e659606dc06bbf788953fc96d551cb52016389540a94938c038dcc7239789f87768fed8c0d53e079:939495969798999b9c9d9e9fa0a1a2a3a4a5a6a8a9aaabacadaeafb0b1b2b4b5b6b7b8bcbfc2c4c5c7c8cacccecfd0d3d4d6d7d9dadbdcdddee0e1e2e5e8ea#eceef1f2f3f4f5f6f7f9fafcfeff,7a:0104050708090a0c0f10111213151618191b1c,4e0176ef53ee948998769f0e952d5b9a8ba24e:221c,51ac846361c252a8680b4f97606b51bb6d1e515c6296659796618c46901775d890fd77636bd272:8aec,8bfb583577798d4c675c9540809a5ea66e2159927aef77ed953b6bb565ad7f0e58065151961f5bf958a954288e726566987f56e4949d76fe9041638754c659:1a3a,579b8eb267358dfa8235524160f0581586fe5ce89e454fc4989d8bb95a2560765384627c904f9102997f6069800c513f80335c1499756d314e8c7a:1d1f21222425262728292a2b2c2d2e2f303132343536383a3e4041424344454748494a4b4c4d4e4f50525354555658595a5b5c5d5e5f606162636465666768#696a6b6c6d6e6f717273757b7c7d7e828587898a8b8c8e8f909394999a9b9ea1a2,8d3053d17f5a7b4f4f104e4f96006cd573d085e95e06756a7ffb6a0a77fe94927e4151e170e653cd8fd483038d2972af996d6cdb574a82b365b980aa623f963259a84eff8bbf7eba653e83f2975e556198de80a5532a8bfd542080ba5e9f6cb88d3982ac915a54296c1b52067eb7575f711a6c7e7c89594b4efd5fff61247caa4e305c0167ab87025cf0950b98ce75af70fd902251af7f1d8bbd594951e44f5b5426592b657780a45b7562:76c2,8f905e456c1f7b264f:0fd8,670d7a:a3a4a7a9aaabaeafb0b1b2b4b5b6b7b8b9babbbcbdbec0c1c2c3c4c5c6c7c8c9cacccdcecfd0d1d2d3d4d5d7d8dadbdcdde1e2e4e7e8e9eaebeceef0f1f2f3#f4f5f6f7f8fbfcfe,7b:0001020507090c0d0e1012131617181a1c1d1f21222327292d,6d:6eaa,798f88b15f17752b629a8f854fef91dc65a781:2f51,5e9c81508d74526f89868d4b590d50854ed8961c723681798d1f5bcc8ba3964459877f1a549056:760e,8be565396982949976d66e895e72751867:46d1,7aff809d8d76611f79c665628d635188521a94a27f38809b7eb25c976e2f67607bd9768b9ad8818f7f947cd5641e95507a3f54:4ae5,6b4c640162089e3d80f3759952729769845b683c86e496:0194,94ec4e2a54047ed968398ddf801566f45e9a7fb97b:2f303234353637393b3d3f404142434446484a4d4e535557595c5e5f61636465666768696a6b6c6d6f70737476787a7c7d7f81828384868788898a8b8c8e8f#9192939698999a9b9e9fa0a3a4a5aeafb0b2b3b5b6b7b9babbbcbdbebfc0c2c3c4,57c2803f68975de5653b529f606d9f9a4f9b8eac516c5bab5f135de96c5e62f18d21517194a952fe6c9f82df72d757a267848d2d591f8f9c83c754957b8d4f306cbd5b6459d19f1353e486ca9aa88c3780a16545987e56fa96c7522e74dc52505be1630289024e5662d0602a68fa51735b9851a089c27ba199867f5060ef704c8d2f51495e7f901b747089c4572d78455f529f9f95fa8f689b3c8be17678684267dc8d:ea35,523d8f8a6eda68cd950590ed56fd679c88f98fc754c87b:c5c8c9cacbcdcecfd0d2d4d5d6d7d8dbdcdedfe0e2e3e4e7e8e9ebecedeff0f2f3f4f5f6f8f9fafbfdff,7c:0001020304050608090a0d0e101112131415171819#1a1b1c1d1e20212223242528292b2c2d2e2f3031323334353637393a3b3c3d3e42,9ab85b696d776c264ea55bb39a87916361a890af97e9542b6db55bd251fd558a7f:55f0,64bc634d65f161be608d710a6c:5749,592f676d822a58d5568e8c6a6beb90dd597d801753f76d695475559d83:77cf,683879be548c4f55540876d28c8996026cb36db88d6b89109e648d3a563f9ed175d55f8872e0606854fc4ea86a2a886160528f7054c470d886799e3f6d2a5b8f5f187ea255894faf7334543c539a501954:0e7c,4e4e5ffd745a58f6846b80e1877472d07cca6e567c:434445464748494a4b4c4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f70717275767778797a7e7f8081828384858687#888a8b8c8d8e8f90939496999a9ba0a1a3a6a7a8a9abacadafb0b4b5b6b7b8babb,5f27864e552c62a44e926caa623782b154d7534e733e6ed1753b521253168bdd69d05f8a60006dee574f6b2273af68538fd87f13636260a3552475ea8c6271156da35ba65e7b8352614c9ec478fa87577c27768751f060f6714c66435e4c604d8c0e707063258f895fbd606286d456de6bc160946167534960e066668d3f79fd4f1a70e96c478b:b3f2,7ed88364660f5a5a9b426d:51f7,8c416d3b4f19706b83b7621660d1970d8d27797851fb57:3efa,673a75787a3d79ef7b957c:bfc0c2c3c4c6c9cbcecfd0d1d2d3d4d8dadbdddee1e2e3e4e5e6e7e9eaebecedeef0f1f2f3f4f5f6f7f9fafcfdfeff,7d:000102030405060708090b0c0d0e0f10#1112131415161718191a1b1c1d1e1f212324252628292a2c2d2e30313233343536,808c99658ff96fc08ba59e2159ec7ee97f095409678168d88f917c4d96c653ca602575be6c7253735ac97ea7632451e0810a5df184df628051805b634f0e796d524260b86d4e5b:c4c2,8b:a1b0,65e25fcc964559937e:e7aa,560967b759394f735bb652a0835a988a8d3e753294be50477a3c4ef767b69a7e5ac16b7c76d1575a5c167b3a95f4714e517c80a9827059787f04832768c067ec78:b177,62e363617b804fed526a51cf835069db92748d:f531,89c1952e7bad4ef67d:3738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6f70717273747576#78797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798,506582305251996f6e:1085,6da75efa50f559dc5c066d466c5f7586848b686859568bb253209171964d854969127901712680f64ea490ca6d479a845a0756bc640594f077eb4fa5811a72e189d2997a7f347ede527f655991758f:7f83,53eb7a9663:eda5,768679f888579636622a52ab8282685467706377776b7aed6d017ed389e359d0621285c982a5754c501f4ecb75a58beb5c4a5dfe7b4b65a491d14eca6d25895f7d2795264ec58c288fdb9773664b79818fd170ec6d787d:999a9b9c9d9e9fa0a1a2a3a4a5a7a8a9aaabacadafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9#dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fa,5c3d52b283465162830e775b66769cb84eac60ca7c:beb3,7ecf4e958b66666f988897595883656c955c5f8475c997567a:dfde,51c070af7a9863ea7a767ea0739697ed4e4570784e5d915253a965:51e7,81fc8205548e5c31759a97a062d872d975bd5c459a7983ca5c40548077e94e3e6cae805a62d2636e5de851778ddd8e1e952f4ff153e560e770ac526763509e435a1f5026773753777ee26485652b628963985014723589c951b38bc07edd574783cc94a7519b541b5cfb7d:fbfcfdfeff,7e:000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233343536373839#3a3c3d3e3f40424344454648494a4b4c4d4e4f505152535455565758595a5b5c5d,4fca7ae36d5a90e19a8f55805496536154af5f0063e9697751ef6168520a582a52d8574e780d770b5eb761777ce062:5b97,4ea27095800362f770e49760577782db67ef68f578d5989779d158f354b353ef6e34514b523b5ba28bfe80af554357a660735751542d7a7a60505b5463a762a053e362635bc767af54ed7a9f82e691775e9388e4593857ae630e8de880ef57577b774fa95feb5bbd6b3e53217b5072c2684677:ff36,65f751b54e8f76d45cbf7aa58475594e9b4150807e:5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f8081838485868788898a8b8c8d8e8f909192939495969798999a9c9d9e#aeb4bbbcd6e4ecf9,7f:0a101e37393b3c3d3e3f404143464748494a4b4c4d4e4f5253,998861276e8357646606634656f062:ec69,5ed39614578362c955878721814a8fa3556683b167658d5684dd5a6a680f62e67bee961151706f9c8c3063fd89c861d27f0670c26ee57405699472fc5eca90ce67176d6a635e52b3726280014f6c59e5916a70d96d9d52d24e5096f7956d857e78ca7d2f5121579264c2808b7c7b6cea68f1695e51b7539868a872819ece7bf172f879bb6f137406674e91cc9ca4793c83:8954,540f68174e3d538952b1783e5386522950884f:8bd0,7f:56595b5c5d5e6063646566676b6c6d6f7073757677787a7b7c7d7f8082838485868788898b8d8f9091929395969798999b9ca0a2a3a5a6a8a9aaabacadaeb1#b3b4b5b6b7babbbec0c2c3c4c6c7c8c9cbcdcfd0d1d2d3d6d7d9dadbdcdddee2e3,75e27acb7c926ca596b6529b748354e94fe9805483b28fde95705ec9601c6d9f5e18655b813894fe604b70bc7ec37cae51c968817cb1826f4e248f8691cf667e4eae8c0564a9804a50da759771ce5be58fbd6f664e86648295635ed66599521788c270c852a3730e7433679778f797164e3490bb9cde6dcb51db8d41541d62ce73b283f196f69f8494c34f367f9a51cc707596755cad988653e64ee46e9c740969b4786b998f7559521876246d4167f3516d9f99804b54997b3c7abf7f:e4e7e8eaebecedeff2f4f5f6f7f8f9fafdfeff,80:020708090a0e0f11131a1b1d1e1f2123242b2c2d2e2f303234393a3c3e404144454748494e4f505153555657#595b5c5d5e5f6061626364656667686b6c6d6e6f7072737475767778797a7b7c7d,9686578462e29647697c5a0464027bd36f0f964b82a6536298855e90708963b35364864f9c819e93788c97328d:ef42,9e7f6f5e79845f559646622e9a74541594dd4fa365c55c:6561,7f1586516c2f5f8b73876ee47eff5ce6631b5b6a6ee653754e7163a0756562a18f6e4f264ed16ca67eb68bba841d87ba7f57903b95237ba99aa188f8843d6d1b9a867edc59889ebb739b780186829a:6c82,561b541757cb4e709ea653568fc881097792999286ee6ee1851366fc61626f2b80:7e818285888a8d8e8f909192949597999ea3a6a7a8acb0b3b5b6b8b9bbc5c7c8c9cacbcfd0d1d2d3d4d5d8dfe0e2e3e6eef5f7f9fbfeff,81:000103040507080b#0c1517191b1c1d1f202122232425262728292a2b2d2e3033343537393a3b3c3d3f,8c298292832b76f26c135fd983bd732b8305951a6bdb77db94c6536f830251925e3d8c8c8d384e4873ab679a68859176970971646ca177095a9295416bcf7f8e66275bd059b95a9a95:e8f7,4eec84:0c99,6aac76df9530731b68a65b5f772f919a97617cdc8ff78c1c5f257c7379d889c56ccc871c5bc65e4268c977207ef551:954d,52c95a297f05976282d763cf778485d079d26e3a5e9959998511706d6c1162bf76bf654f60af95fd660e879f9e2394ed54:0d7d,8c2c647881:40414243444547494d4e4f525657585b5c5d5e5f6162636466686a6b6c6f727375767778818384858687898b8c8d8e90929394959697999a9e9fa0a1a2a4a5#a7a9abacadaeafb0b1b2b4b5b6b7b8b9bcbdbebfc4c5c7c8c9cbcdcecfd0d1d2d3,647986116a21819c78e864699b5462b9672b83ab58a89ed86cab6f205bde964c8c0b725f67d062c772614ea959c66bcd589366ae5e5552df6155672876ee776672677a4662ff54:ea50,94a090a35a1c7eb36c164e435976801059485357753796be56ca63208111607c95f96dd65462998151855ae980fd59ae9713502a6ce55c3c62df4f60533f817b90066eba852b62c85e7478be64b5637b5ff55a18917f9e1f5c3f634f80425b7d556e95:4a4d,6d8560a867e072de51dd5b8181:d4d5d6d7d8d9dadbdcdddedfe0e1e2e4e5e6e8e9ebeeeff0f1f2f5f6f7f8f9fafdff,82:030708090a0b0e0f111315161718191a1d2024252627292e323a3c3d3f#404142434546484a4c4d4e5051525354555657595b5c5d5e606162636465666769,62e76cde725b626d94ae7ebd81136d53519c5f04597452aa6012597366968650759f632a61e67cef8bfa54e66b279e256bb485d5545550766ca4556a8db4722c5e156015743662cd6392724c5f986e436d3e65006f5876d878d076fc7554522453db4e535e9e65c180:2ad6,629b5486522870ae888d8dd16ce1547880da57f988f48d54966a914d4f696c9b55b776c6783062a870f96f8e5f6d84ec68da787c7bf781a8670b9e4f636778b0576f7812973962:79ab,528874356bd782:6a6b6c6d71757677787b7c808183858687898c90939495969a9b9ea0a2a3a7b2b5b6babbbcbfc0c2c3c5c6c9d0d6d9dadde2e7e8e9eaecedeef0f2f3f5f6f8#fafcfdfeff,83:000a0b0d1012131618191d1e1f20212223242526292a2e3032373b3d,5564813e75b276ae533975de50fb5c418b6c7bc7504f72479a9798d86f0274e27968648777a562fc98918d2b54c180584e52576a82f9840d5e7351ed74f68bc45c4f57616cfc98875a4678349b448feb7c955256625194fa4ec68386846183e984b257d467345703666e6d668c3166dd7011671f6b3a6816621a59bb4e0351c46f0667d26c8f517668cb59476b6775665d0e81109f5065d779:4841,9a918d775c824e5e4f01542f5951780c56686c148fc45f036c:7de3,8bab639083:3e3f41424445484a4b4c4d4e5355565758595d6270717273747576797a7e7f808182838487888a8b8c8d8f909194959697999a9d9fa1a2a3a4a5a6a7acadae#afb5bbbebfc2c3c4c6c8c9cbcdced0d1d2d3d5d7d9dadbdee2e3e4e6e7e8ebeced,60706d3d7275626694:8ec5,53438fc17b7e4edf8c264e7e9ed494:b1b3,524d6f5c90636d458c3458115d4c6b:2049,67aa545b81547f8c589985375f3a62a26a47953965726084686577a74e544fa85de7979864ac7fd85ced4fcf7a8d520783044e14602f7a8394a64fb54eb279e6743452e482b964d279bd5bdd6c8197528f7b6c22503e537f6e0564ce66746c3060c598778bf75e86743c7a7779cb4e1890b174036c4256da914b6cc58d8b533a86c666f28eaf5c489a716e2083:eeeff3f4f5f6f7fafbfcfeff,84:0002050708090a10121314151617191a1b1e1f20212223292a2b2c2d2e2f30323334353637393a3b3e3f404142434445474849#4a4b4c4d4e4f505253545556585d5e5f606264656667686a6e6f70727477797b7c,53d65a369f8b8da353bb570898a76743919b6cc9516875ca62f372ac52:389d,7f3a7094763853749e4a69b7786e96c088d97fa471:36c3,518967d374e458e4651856b78ba9997662707ed560f970ed58ec4e:c1ba,5fcd97e74efb8ba45203598a7eab62544ecd65e5620e833884c98363878d71946eb65bb97ed2519763c967d480898339881551125b7a59828fb14e736c5d516589258f6f962e854a745e95:10f0,6da682e55f3164926d128428816e9cc3585e8d5b4e0953c184:7d7e7f8081838485868a8d8f90919293949596989a9b9d9e9fa0a2a3a4a5a6a7a8a9aaabacadaeb0b1b3b5b6b7bbbcbec0c2c3c5c6c7c8cbcccecfd2d4d5d7#d8d9dadbdcdee1e2e4e7e8e9eaebedeeeff1f2f3f4f5f6f7f8f9fafbfdfe,85:000102,4f1e6563685155d34e2764149a9a626b5ac2745f82726da968ee50e7838e7802674052396c997eb150bb5565715e7b5b665273ca82eb67495c715220717d886b95ea965564c58d6181b355846c5562477f2e58924f2455468d4f664c4e0a5c1a88f368a2634e7a0d70e7828d52fa97f65c1154e890b57ecd59628d4a86c782:0c0d,8d6664445c0461516d89793e8bbe78377533547b4f388eab6df15a207ec5795e6c885ba15a76751a80be614e6e1758f075:1f25,727253477ef385:030405060708090a0b0d0e0f101214151618191b1c1d1e2022232425262728292a2d2e2f303132333435363e3f404142444546474b4c4d4e4f505152535455#57585a5b5c5d5f60616263656667696a6b6c6d6e6f707173757677787c7d7f8081,770176db526980dc57235e08593172ee65bd6e7f8bd75c388671534177f362fe65f64ec098df86805b9e8bc653f277e24f7f5c4e9a7659cb5f0f793a58eb4e1667ff4e8b62ed8a93901d52bf662f55dc566c90024ed54f8d91ca99706c0f5e0260435ba489c68bd56536624b99965b:88ff,6388552e53d77626517d852c67a268b36b8a62928f9353d482126dd1758f4e668d4e5b70719f85af66:91d9,7f7287009ecd9f205c5e672f8ff06811675f620d7ad658855eb665706f3185:82838688898a8b8c8d8e909192939495969798999a9d9e9fa0a1a2a3a5a6a7a9abacadb1b2b3b4b5b6b8babbbcbdbebfc0c2c3c4c5c6c7c8cacbcccdced1d2#d4d6d7d8d9dadbdddedfe0e1e2e3e5e6e7e8eaebecedeeeff0f1f2f3f4f5f6f7f8,60555237800d6454887075295e05681362f4971c53cc723d8c016c3477617a0e542e77ac987a821c8bf47855671470c165af64955636601d79c153f84e1d6b7b80865bfa55e356db4f:3a3c,99725df3677e80386002988290015b8b8b:bcf5,641c825864de55fd82cf91654fd77d20901f7c9f50f358516eaf5bbf8bc980839178849c7b97867d96:8b8f,7ee59ad3788e5c817a57904296a7795f5b59635f7b0b84d168ad55067f2974107d2295016240584c4ed65b835979585485:f9fafcfdfe,86:0001020304060708090a0b0c0d0e0f10121314151718191a1b1c1d1e1f20212223242526282a2b2c2d2e2f3031323334353637393a3b3d3e3f40#4142434445464748494a4b4c525355565758595b5c5d5f6061636465666768696a,736d631e8e:4b0f,80ce82d462ac53f06cf0915e592a60016c70574d644a8d2a762b6ee9575b6a8075f06f6d8c:2d08,57666bef889278b363a253f970ad6c645858642a580268e0819b55107cd650188eba6dcc8d9f70eb638f6d9b6ed47ee68404684390036dd896768ba85957727985e4817e75bc8a8a68af52548e22951163d098988e44557c4f5366ff568f60d56d9552435c4959296dfb586b75:301c,606c82148146631167618fe2773a8d:f334,94c15e165385542c70c386:6d6f7072737475767778838485868788898e8f90919294969798999a9b9e9fa0a1a2a5a6abadaeb2b3b7b8b9bbbcbdbebfc1c2c3c5c8cccdd2d3d5d6d7dadc#dde0e1e2e3e5e6e7e8eaebeceff5f6f7fafbfcfdff,87:010405060b0c0e0f10111416,6c405ef7505c4ead5ead633a8247901a6850916e77b3540c94dc5f647ae5687663457b527edf75db507762955934900f51f879c37a8156fe5f9290146d825c60571f541051546e4d56e263a89893817f8715892a9000541e5c6f81c062:d658,81319e3596409a:6e7c,692d59a562d3553e631654c786d96d3c5a0374e6889c6b6a59168c4c5f2f6e7e73a9987d4e3870f75b8c7897633d665a769660cb5b9b5a494e0781556c6a738b4ea167897f515f8065fa671b5fd859845a0187:191b1d1f20242627282a2b2c2d2f303233353638393a3c3d404142434445464a4b4d4f505152545556585a5b5c5d5e5f6162666768696a6b6c6d6f71727375#7778797a7f8081848687898a8c8e8f90919294959698999a9b9c9d9ea0a1a2a3a4,5dcd5fae537197e68fdd684556f4552f60df4e3a6f4d7ef482c7840e59d44f:1f2a,5c3e7eac672a851a5473754f80c355829b4f4f4d6e2d8c135c096170536b761f6e29868a658795fb7eb9543b7a337d0a95ee55e17fc174ee631d87176da17a9d621165a1536763e16c835deb545c94a84e4c6c618bec5c4b65e0829c68a754:3e34,6b:cb66,4e9463425348821e4f:0dae,575e620a96fe6664726952:ffa1,609f8bef661471996790897f785277fd6670563b54389521727a87:a5a6a7a9aaaeb0b1b2b4b6b7b8b9bbbcbebfc1c2c3c4c5c7c8c9cccdcecfd0d4d5d6d7d8d9dadcdddedfe1e2e3e4e6e7e8e9ebecedeff0f1f2f3f4f5f6f7f8#fafbfcfdff,88:0001020405060708090b0c0d0e0f101112141718191a1c1d1e1f2023,7a00606f5e0c6089819d591560dc718470ef6eaa6c5072806a8488ad5e2d4e605ab3559c94e36d177cfb9699620f7ec6778e867e5323971e8f9666875ce14fa072ed4e0b53a6590f54136380952851484ed99c9c7ea454b88d248854823795f26d8e5f265acc663e966973:b02e,53bf817a99857fa15baa96:7750,7ebf76f853a2957699997bb189446e584e617fd479658be660f354cd4eab98795df76a6150cf54118c618427785d9704524a54ee56a395006d885bb56dc6665388:2425262728292a2b2c2d2e2f30313334353637383a3b3d3e3f414243464748494a4b4e4f505152535556585a5b5c5d5e5f6066676a6d6f717374757678797a#7b7c80838687898a8c8e8f90919394959798999a9b9d9e9fa0a1a3a5a6a7a8a9aa,5c0f5b5d6821809655787b11654869544e9b6b47874e978b534f631f643a90aa659c80c18c10519968b0537887f961c86c:c4fb,8c225c5185aa82af950c6b238f9b65b05f:fbc3,4fe18845661f8165732960fa51745211578b5f6290a2884c91925e78674f602759d351:44f6,80f853086c7996c4718a4f:11ee,7f9e673d55c5950879c088967ee3589f620c9700865a5618987b5f908bb884c4915753d965ed5e8f755c60647d6e5a7f7e:eaed,8f6955a75ba360ac65cb738488:acaeafb0b2b3b4b5b6b8b9babbbdbebfc0c3c4c7c8cacbcccdcfd0d1d3d6d7dadbdcdddee0e1e6e7e9eaebecedeeeff2f5f6f7fafbfdff,89:0001030405060708#090b0c0d0e0f1114151617181c1d1e1f20222324262728292c2d2e2f3132333537,9009766377297eda9774859b5b667a7496ea884052cb718f5faa65ec8be25bfb9a6f5de16b896c5b8b:adaf,900a8fc5538b62bc9e:262d,54404e2b82bd7259869c5d1688596daf96c554d14e9a8bb6710954bd960970df6df976d04e25781487125ca95ef68a00989c960e708e6cbf594463a9773c884d6f148273583071d5538c781a96c155015f6671305bb48c1a9a8c6b83592e9e2f79e76768626c4f6f75a17f8a6d0b96336c274ef075d2517b68376f3e908081705996747689:38393a3b3c3d3e3f40424345464748494a4b4c4d4e4f505152535455565758595a5b5c5d6061626364656768696a6b6c6d6e6f707172737475767778797a7c#7d7e808284858788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1,64475c2790657a918c2359da54ac8200836f898180006930564e8036723791ce51b64e5f987563964e1a53f666f3814b591c6db24e0058f9533b63d694f14f:9d0a,886398905937905779fb4eea80f075916c825b9c59e85f5d69058681501a5df24e5977e34ee5827a6291661390915c794ebf5f7981c69038808475ab4ea688d4610f6bc55fc64e4976ca6ea28b:e3ae,8c0a8bd15f027f:fccc,7ece83:356b,56e06bb797f3963459fb541f94f66deb5bc5996e5c395f15969089:a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c3cdd3d4d5d7d8d9dbdddfe0e1e2e4e7e8e9eaecedeef0f1f2f4f5f6f7f8f9fa#fbfcfdfeff,8a:01020304050608090a0b0c0d0e0f101112131415161718191a1b1c1d,537082f16a315a749e705e947f2883b984:2425,836787478fce8d6276c85f719896786c662054df62e54f6381c375c85eb896cd8e0a86f9548f6cf36d8c6c38607f52c775285e7d4f1860a05fe75c24753190ae94c072b96cb96e389149670953:cbf3,4f5191c98bf153c85e7c8fc26de44e8e76c26986865e611a82064f:59de,903e9c7c61096e:1d14,96854e885a3196e84e0e5c7f79b95b878bed7fbd738957df828b90c15401904755bb5cea5fa161086b3272f180b28a:891e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3f4041424344454647494a4b4c4d4e4f505152535455565758595a5b5c5d5e#5f606162636465666768696a6b6c6d6e6f7071727374757677787a7b7c7d7e7f80,6d745bd388d598848c6b9a6d9e336e0a51:a443,57a38881539f63f48f9556ed54585706733f6e907f188fdc82d1613f6028966266f07ea68d:8ac3,94a55cb37ca4670860a6960580184e9190e75300966851418fd08574915d665597f55b55531d78386742683d54c9707e5bb08f7d518d572854b1651266828d:5e43,810f846c906d7cdf51ff85fb67a365e96fa186a48e81566a90207682707671e58d2362e952196cfd8d3c600e589e618e66fe8d60624e55b36e23672d8f678a:81828384858687888b8c8d8e8f9091929495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2#c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3,94e195f87728680569a8548b4e4d70b88bc86458658b5b857a84503a5be877bb6be18a797c986cbe76cf65a98f975d2d5c5586386808536062187ad96e5b7efd6a1f7ae05f706f335f20638c6da867564e085e108d264ed780c07634969c62db662d627e6cbc8d7571677f695146808753ec906e629854f286f08f998005951785178fd96d5973cd659f771f7504782781fb8d1e94884fa6679575b98bca9707632f9547963584b8632377415f8172f04e896014657462ef6b63653f8a:e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,8b:0001020304050608090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20212223#24252728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445,5e2775c790d18bc1829d679d652f5431871877e580a281026c414e4b7ec7804c76f4690d6b966267503c4f84574063076b628dbe53ea65e87eb85fd763:1ab7,81:f3f4,7f6e5e1c5cd95236667a79e97a1a8d28709975d46ede6cbb7a924e2d76c55fe0949f88777ec879cd80bf91cd4ef24f17821f54685dde6d328bcc7ca58f7480985e1a549276b15b99663c9aa473e0682a86db6731732a8b:f8db,90107af970db716e62c477a956314e3b845767f152a986c08d2e94f87b518b:464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f6061626364656768696a6b6d6e6f707172737475767778797a7b7c7d7e7f80818283848586#8788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9facb1bbc7d0ea,8c:091e,4f4f6ce8795d9a7b6293722a62fd4e1378168f6c64b08d5a7bc668695e8488c55986649e58ee72b6690e95258ffd8d5857607f008c0651c6634962d95353684c74228301914c55447740707c6d4a517954a88d4459ff6ecb6dc45b5c7d2b4ed47c7d6ed35b5081ea6e0d5b579b0368d58e2a5b977efc603b7eb590b98d70594f63cd79df8db3535265cf79568bc5963b7ec494bb7e825634918967007f6a5c0a907566285de64f5067de505a4f5c57505e:a7#3$,8c:38393a3b3c3d3e3f4042434445484a4b4d4e4f5051525354565758595b5c5d5e5f60636465666768696c6d6e6f707172747576777b7c7d7e7f808183848687#888b8d8e8f90919293959697999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacad,4e:8d0c,51404e105eff53454e:15981e,9b325b6c56694e2879ba4e3f53154e47592d723b536e6c1056df80e499976bd3777e9f174e:369f,9f104e:5c6993,82885b5b556c560f4ec453:8d9da3a5ae,97658d5d53:1af5262e3e,8d5c53:6663,52:02080e2d333f404c5e615c,84af52:7d82819093,51827f544e:bbc3c9c2e8e1ebde,4f1b4ef34f:2264,4ef54f:2527092b5e67,65384f:5a5d,8c:aeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebec#edeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,8d:000102030405060708090a0b0c0d,4f:5f57323d76749189838f7e7baa7cac94e6e8eac5dae3dcd1dff8,50:294c,4ff350:2c0f2e2d,4ffe50:1c0c25287e4355484e6c7ba5a7a9bad6,510650:edece6ee,51:070b,4edd6c3d4f:5865ce,9fa06c467c74516e5dfd9ec999985181591452f9530d8a07531051eb591951554ea051564eb388:6ea4,4eb5811488d279805b3488037fb851:abb1bdbc,8d:0e0f101112131415161718191a1b1c205152575f6568696a6c6e6f717278797a7b7c7d7e7f808283868788898c8d8e8f90929395969798999a9b9c9d9ea0a1#a2a4a5a6a7a8a9aaabacadaeafb0b2b6b7b9bbbdc0c1c2c5c7c8c9cacdd0d2d3d4,51:c796a2a5,8b:a0a6a7aab4b5b7c2c3cbcfced2d3d4d6d8d9dcdfe0e4e8e9eef0f3f6f9fcff,8c:000204070c0f1112141516191b181d1f202125272a2b2e2f32333536,53:697a,96:1d2221312a3d3c4249545f676c7274888d97b0,90:979b9d99aca1b4b3b6ba,8d:d5d8d9dce0e1e2e5e6e7e9edeef0f1f2f4f6fcfeff,8e:00010203040607080b0d0e1011121315161718191a1b1c202124252627282b2d303233343637383b3c3e#3f4345464c4d4e4f505354555657585a5b5c5d5e5f60616263646567686a6b6e71,90:b8b0cfc5bed0c4c7d3e6e2dcd7dbebeffe,91:04221e23312f394346,520d594252:a2acadbe,54ff52:d0d6f0,53df71ee77cd5ef451:f5fc,9b2f53b65f01755a5def57:4ca9a1,58:7ebcc5d1,57:292c2a33392e2f5c3b4269856b867c7b686d7673ada48cb2cfa7b493a0d5d8dad9d2b8f4eff8e4dd,8e:73757778797a7b7d7e808283848688898a8b8c8d8e91929395969798999a9b9d9fa0a1a2a3a4a5a6a7a8a9aaadaeb0b1b3b4b5b6b7b8b9bbbcbdbebfc0c1c2#c3c4c5c6c7c8c9cacbcccdcfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4,58:0b0d,57:fded,58:001e194420656c81899a80,99a89f1961ff82:797d7f8f8aa8848e919799abb8beb0c8cae398b7aecbccc1a9b4a1aa9fc4cea4e1,830982:f7e4,83:0f07,82:dcf4d2d8,830c82:fbd3,83:111a061415,82:e0d5,83:1c515b5c08923c34319b5e2f4f47435f4017602d3a336665,8e:e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,8f:000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20212223#2425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f4041424344,83:681b696c6a6d6eb078b3b4a0aa939c857cb6a97db87b989ea8babcc1,840183:e5d8,580784:180b,83:ddfdd6,84:1c381106,83:d4df,84:0f03,83:f8f9eac5c0,842683:f0e1,84:5c515a597387887a89783c4669768c8e316dc1cdd0e6bdd3cabfbae0a1b9b497e5e3,850c750d853884f085:391f3a,8f:45464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f6061626364656a808c929da0a1a2a4a5a6a7aaacadaeafb2b3b4b5b7b8babbbcbfc0c3c6#c9cacbcccdcfd2d6d7dae0e1e3e7eceff1f2f4f5f6fafbfcfeff,90:07080c0e131518,85:563b,84:fffc,85:594868645e7a,77a285:43727ba4a8878f79ae9c85b9b7b0d3c1dcff,86:270529163c,5efe5f0859:3c41,803759:555a58,530f5c:22252c34,62:4c6a9fbbcadad7ee,632262f663:394b43adf6717a8eb46dac8a69aebcf2f8e0ffc4dece,645263:c6be,64:45410b1b200c26215e846d96,90:191c2324252728292a2b2c303132333437393a3d3f4043454648494a4b4c4e545556595a5c5d5e5f6061646667696a6b6c6f70717273767778797a7b7c7e81#84858687898a8c8d8e8f90929496989a9c9e9fa0a4a5a7a8a9abadb2b7bcbdbfc0,64:7ab7b899bac0d0d7e4e2,65:09252e,5f:0bd2,75195f1153:5ff1fde9e8fb,54:1216064b5253545643215759233282947771649a9b8476669dd0adc2b4d2a7a6d3d472a3d5bbbfccd9dadca9aaa4ddcfde,551b54e7552054fd551454f355:22230f11272a678fb5496d41553f503c,90:c2c3c6c8c9cbcccdd2d4d5d6d8d9dadedfe0e3e4e5e9eaeceef0f1f2f3f5f6f7f9fafbfcff,91:00010305060708090a0b0c0d0e0f1011121314151617181a1b1c#1d1f20212425262728292a2b2c2d2e30323334353637383a3b3c3d3e3f40414244,55:375675767733305c8bd283b1b988819f7ed6917bdfbdbe9499eaf7c9,561f55:d1ebecd4e6ddc4efe5f2f3cccde8f5e4,8f9456:1e080c012423,55fe56:00272d5839572c4d62595c4c548664716b7b7c8593afd4d7dde1f5ebf9ff,57:040a091c,5e:0f191411313b3c,91:454748515354555658595b5c5f606667686b6d737a7b7c808182838486888a8e8f939495969798999c9d9e9fa0a1a4a5a6a7a8a9abacb0b1b2b3b6b7b8b9bb#bcbdbebfc0c1c2c3c4c5c6c8cbd0d2d3d4d5d6d7d8d9dadbdddedfe0e1e2e3e4e5,5e:3744545b5e61,5c:8c7a8d9096889899919a9cb5a2bdacabb1a3c1b7c4d2e4cbe5,5d:020327262e241e061b583e343d6c5b6f5d6b4b4a697482999d,8c735d:b7c5,5f:73778287898c95999ca8adb5bc,88625f6172:adb0b4b7b8c3c1cecdd2e8efe9f2f4f7,730172f3730372fa91:e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,92:000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f2021222324#25262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445,72fb73:1713210a1e1d152239252c3831504d57606c6f7e,821b592598e759:2402,99:636768696a6b6c74777d8084878a8d9091939495,5e:80918b96a5a0b9b5beb3,8d535e:d2d1dbe8ea,81ba5f:c4c9d6cf,60035fee60045f:e1e4fe,60:0506,5f:eaedf8,60:1935261b0f0d292b0a3f2178797b7a42,92:464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f7071727375767778797a7b7c7d7e7f808182838485#868788898a8b8c8d8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7,60:6a7d969aad9d83928c9becbbb1ddd8c6dab4,61:20261523,60f461:000e2b4a75ac94a7b7d4f5,5fdd96b395:e9ebf1f3f5f6fcfe,96:030406080a0b0c0d0f12151617191a,4e2c723f62156c:35545c4aa38590948c6869747686a9d0d4adf7f8f1d7b2e0d6faebeeb1d3effe,92:a8a9aaabacadafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8#e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,93:00010203040506070809,6d:39270c43480704190e2b4d2e351a4f525433916f9ea05e93945c607c63,6e1a6d:c7c5de,6e0e6d:bfe0,6e116d:e6ddd9,6e166dab6e0c6dae6e:2b6e4e6bb25f865354322544dfb198e0,6f2d6e:e2a5a7bdbbb7d7b4cf8fc29f,6f:6246472415,6ef96f:2f364b742a0929898d8c78727c7ad1,93:0a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3f40414243444546474849#4a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696b,6f:c9a7b9b6c2e1eedee0ef,70:1a231b39354f5e,5b:80849593a5b8,752f9a9e64345b:e4ee,89305bf08e478b078f:b6d3d5e5eee4e9e6f3e8,90:05040b26110d162135362d2f445152506858625b,66b990:747d8288838b,5f:50575658,5c3b54ab5c:5059,5b715c:6366,7fbc5f:2a292d,82745f3c9b3b5c6e59:81838da9aaa3,93:6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaab#acadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cbcccd,59:97caab9ea4d2b2afd7be,5a:0506,59dd5a0859:e3d8f9,5a:0c09323411231340674a553c6275,80ec5a:aa9b777abeebb2d2d4b8e0e3f1d6e6d8dc,5b:091716323740,5c:151c,5b:5a6573515362,9a:7577787a7f7d808185888a90929396989b9c9d9fa0a2a3a5a7,7e:9fa1a3a5a8a9,93:cecfd0d1d2d3d4d5d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,94:000102030405060708090a0b0c0d#0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e,7e:adb0bec0c1c2c9cbccd0d4d7dbe0e1e8ebeeeff1f2,7f0d7e:f6fafbfe,7f:01020307080b0c0f111217191c1b1f212223242526272a2b2c2d2f3031323335,5e7a757f5ddb753e909573:8e91aea29fcfc2d1b7b3c0c9c8e5d9,987c740a73:e9e7debaf2,74:0f2a5b262528302e2c,94:2f303132333435363738393a3b3c3d3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6c6d6e6f#707172737475767778797a7b7c7d7e7f8081828384919698c7cfd3d4dae6fb,95:1c20,74:1b1a415c575559776d7e9c8e8081878b9ea8a990a7d2ba,97:eaebec,67:4c535e4869a5876a7398a775a89ead8b777cf0,680967d8680a67:e9b0,680c67:d9b5dab3dd,680067:c3b8e2,680e67:c1fd,68:323360614e624464831d55664167403e4a4929b58f7477936bc2,696e68fc69:1f20,68f995:27333d43484b555a606e74757778797a7b7c7d7e808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aa#abacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacb,692468f069:0b0157,68e369:10713960425d846b80987834cc8788ce896663799ba7bbabadd4b1c1cadf95e08dff,6a2f69ed6a:171865,69f26a:443ea0505b358e793d28587c9190a997ab,73:3752,6b:8182878492938d9a9ba1aa,8f:6b6d71727375767877797a7c7e818284878b,95:cccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7ecff,96:0713181b1e20232425262728292b2c2d2f303738393a3e41434a4e4f5152535657#58595a5c5d5e606365666b6d6e6f70717378797a7b7c7d7e7f808182838487898a,8f:8d8e8f989a,8ece62:0b171b1f222125242c,81e774:eff4ff,75:0f1113,65:34eeeff0,66:0a19,677266:031500,708566:f71d34313635,800666:5f54414f56615777848ca79dbedbdce6e9,8d:3233363b3d4045464849474d5559,89:c7cacbcccecfd0d1,72:6e9f5d666f7e7f848b8d8f92,63:0832b0,96:8c8e91929395969a9b9d9e9fa0a1a2a3a4a5a6a8a9aaabacadaeafb1b2b4b5b7b8babbbfc2c3c8cacbd0d1d3d4d6d7d8d9dadbdcdddedfe1e2e3e4e5e6e7eb#ecedeef0f1f2f4f5f8fafbfcfdff,97:0203050a0b0c10111214151718191a1b1d1f20,64:3fd8,80046b:eaf3fdf5f9,6c:0507060d1518191a2129242a32,65:35556b,72:4d525630,8662521680:9f9c93bc,670a80:bdb1abadb4b7e7e8e9eadbc2c4d9cdd7,671080:ddebf1f4ed,81:0d0e,80:f2fc,671581128c5a81:361e2c1832484c5374595a7160697c7d6d67,584d5ab581:888291,6ed581:a3aacc,672681:cabb,97:2122232425262728292b2c2e2f3133343536373a3b3c3d3f404142434445464748494a4b4c4d4e4f5051545557585a5c5d5f63646667686a6b6c6d6e6f7071#72757778797a7b7d7e7f8081828384868788898a8c8e8f9093959697999a9b9c9d,81:c1a6,6b:243739434659,98:d1d2d3d5d9da,6bb35f406bc289f365909f5165:93bcc6c4c3ccced2d6,70:809c969dbbc0b7abb1e8ca,71:1013162f31735c6845724a787a98b3b5a8a0e0d4e7f9,72:1d28,706c71:1866b9,62:3e3d434849,79:3b4046495b5c535a6257606f677a858a9aa7b3,5f:d1d0,97:9e9fa1a2a4a5a6a7a8a9aaacaeb0b1b3b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3#e4e5e8eeeff0f1f2f4f7f8f9fafbfcfdfeff,98:000102030405060708090a0b0c0d0e,60:3c5d5a67415963ab,61:060d5da99dcbd1,620680:807f,6c:93f6,6dfc77:f6f8,78:0009171811,65ab78:2d1c1d393a3b1f3c252c23294e6d56572650474c6a9b939a879ca1a3b2b9a5d4d9c9ecf2,790578f479:13241e34,9f9b9e:f9fbfc,76f177:040d,76f977:07081a22192d263538505147435a68,98:0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d#4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e,77:62657f8d7d808c919fa0b0b5bd,75:3a404e4b485b727983,7f:58615f,8a487f:68747179817e,76:cde5,883294:8586878b8a8c8d8f909497959a9b9ca3a4abaaadacafb0b2b4b6b7b8b9babcbdbfc4c8c9cacbcccdced0d1d2d5d6d7d9d8dbdedfe0e2e4e5e7e8ea,98:6f70717273748b8e929599a3a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcfd0d4d6d7dbdcdde0e1e2e3e4#e5e6e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,99:0001020304050607,94:e9ebeeeff3f4f5f7f9fcfdff,95:03020607090a0d0e0f1213141516181b1d1e1f222a2b292c3132343637383c3e3f4235444546494c4e4f525354565758595b5e5f5d61626465666768696a6b6c6f7172733a,77:e7ec,96c979:d5ede3eb,7a065d477a:03021e14,99:08090a0b0c0e0f1112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2f303132333435363738393a3b3c3d3e3f40414243444546474849#4a4b4c4d4e4f50515253565758595a5b5c5d5e5f60616264667378797b7e828389,7a:393751,9ecf99a57a7076:888e9399a4,74:dee0,752c9e:202228292a2b2c3231363837393a3e414244464748494b4c4e5155575a5b5c5e63666768696a6b6c716d73,75:929496a09daca3b3b4b8c4b1b0c3c2d6cde3e8e6e4ebe7,760375:f1fcff,76:1000050c170a25181519,99:8c8e9a9b9c9d9e9fa0a1a2a3a4a6a7a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8#d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9,76:1b3c2220402d303f35433e334d5e545c566b6f,7fca7a:e6787980868895a6a0aca8adb3,88:6469727d7f82a2c6b7bcc9e2cee3e5f1,891a88:fce8fef0,89:2119131b0a342b3641667b,758b80e576:b2b4,77dc80:1214161c20222526272928310b3543464d526971,898398:788083,99:fafbfcfdfeff,9a:000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738#393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f50515253545556575859,98:898c8d8f949a9b9e9fa1a2a5a6,86:4d546c6e7f7a7c7ba88d8bac9da7a3aa93a9b6c4b5ceb0bab1afc9cfb4e9f1f2edf3d0,871386:def4dfd8d1,87:0307,86f887:080a0d09233b1e252e1a3e48343129373f82227d7e7b60704c6e8b53637c64596593afa8d2,9a:5a5b5c5d5e5f606162636465666768696a6b7283898d8e949599a6a9aaabacadaeafb2b3b4b5b9bbbdbebfc3c4c6c7c8c9cacdcecfd0d2d4d5d6d7d9dadbdc#dddee0e2e3e4e5e7e8e9eaeceef0f1f2f3f4f5f6f7f8fafcfdfeff,9b:000102040506,87:c68885ad9783abe5acb5b3cbd3bdd1c0cadbeae0ee,88:1613,87fe88:0a1b21393c,7f:36424445,82107a:fafd,7b:080304150a2b0f47382a192e31202524333e1e585a45754c5d606e7b62727190a6a7b8ac9da885aa9ca2abb4d1c1ccdddae5e6ea,7c0c7b:fefc,7c:0f160b,9b:07090a0b0c0d0e1011121415161718191a1b1c1d1e2021222425262728292a2b2c2d2e3031333435363738393a3d3e3f40464a4b4c4e50525355565758595a#5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b,7c:1f2a26384140,81fe82:010204,81ec884482:2122232d2f282b383b33343e44494b4f5a5f68,88:7e8588d8df,895e7f:9d9fa7afb0b2,7c7c65497c:919d9c9ea2b2bcbdc1c7cccdc8c5d7e8,826e66a87f:bfced5e5e1e6e9eef3,7cf87d:77a6ae,7e:479b,9e:b8b4,8d:73849491b1676d,8c:4749,91:4a504e4f64,9b:7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9ba#bbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadb,91:626170696f7d7e7274798c85908d91a2a3aaadaeafb5b4ba,8c559e7e8d:b8eb,8e:055969,8d:b5bfbcbac4d6d7dadececfdbc6ecf7f8e3f9fbe4,8e098dfd8e:141d1f2c2e232f3a4039353d3149414251524a70767c6f74858f94909c9e,8c:78828a859894,659b89:d6dedadc,9b:dcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,9c:000102030405060708090a0b0c0d0e0f101112131415161718191a#1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b,89:e5ebef,8a3e8b26975396:e9f3ef,97:0601080f0e2a2d303e,9f:808385868788898a8c,9efe9f:0b0d,96:b9bcbdced2,77bf96e092:8eaec8,93:3e6aca8f,94:3e6b,9c:7f8285868788,7a239c:8b8e90919294959a9b9e9fa0a1a2a3a5a6a7a8a9abadaeb0b1b2b3b4b5b6b7babbbcbdc4c5c6c7cacb3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a#7b7d7e808384898a8c8f93969798999daaacafb9bebfc0c1c2c8c9d1d2dadbe0e1cccdcecfd0d3d4d5d7d8d9dcdddfe2,97:7c85919294afaba3b2b4,9a:b1b0b7,9e589a:b6babcc1c0c5c2cbccd1,9b:45434749484d51,98e899:0d2e5554,9a:dfe1e6efebfbedf9,9b:080f131f23,9e:bdbe,7e3b9e:8287888b92,93d69e:9d9fdbdcdde0dfe2e9e7e5eaef,9f:222c2f39373d3e44,9c:e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,9d:000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f2021#22232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142#92$434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f8081#82838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2#92$a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1#e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff,9e:000102#92$030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e24272e30343b3c404d5052535456595d5f606162656e6f727475767778797a7b7c7d80#8183848586898a8c8d8e8f90919495969798999a9b9c9ea0a1a2a3a4a5a7a8a9aa#92$abacadaeafb0b1b2b3b5b6b7b9babcbfc0c1c2c3c5c6c7c8cacbccd0d2d3d5d6d7d9dadee1e3e4e6e8ebecedeef0f1f2f3f4f5f6f7f8fafdff,9f:000102030405#060708090a0c0f1112141516181a1b1c1d1e1f21232425262728292a2b2d2e3031#92$3233343536383a3c3f4041424345464748494a4b4c4d4e4f52535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778#797a7b7c7d7e81828d8e8f9091929394959697989c9d9ea1a2a3a4a5,f9:2c7995e7f1#92$,fa:0c0d0e0f111314181f20212324272829,e8:15161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40414243#4445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f6061626364",
    ),
    b = {},
    c = {};
  !(function (a) {
    var d = 0;
    a = a.match(/..../g);
    for (var l = 129; 254 >= l; l++)
      for (var h = 64; 254 >= h; h++)
        b[a[d++]] = ("%" + l.toString(16) + "%" + h.toString(16)).toUpperCase();
    for (var r in b) c[b[r]] = r;
  })(a);
  return {
    encode: function (a) {
      return a.replace(/./g, function (a) {
        var d = a.charCodeAt(0);
        if (8364 == d || (127 >= d && 0 <= d)) return encodeURIComponent(a);
        d = d.toString(16);
        4 != d.length && (d = ("000" + d).match(/....$/)[0]);
        return b[d] || a;
      });
    },
    decode: function (a) {
      return a
        .replace(/%[0-9A-F]{2}%[0-9A-F]{2}/g, function (a) {
          return a in c ? String.fromCharCode("0x" + c[a]) : a;
        })
        .replace(/%[\w]{2}/g, function (a) {
          try {
            return decodeURIComponent(a);
          } catch (l) {
            return (console.warn("Failed to decode: " + a, l), a);
          }
        });
    },
  };
})();
