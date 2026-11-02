"use strict";
var $jscomp = { scope: {} };
$jscomp.defineProperty =
  "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (a, b, c) {
        if (c.get || c.set)
          throw new TypeError("ES3 does not support getters and setters.");
        a != Array.prototype && a != Object.prototype && (a[b] = c.value);
      };
$jscomp.getGlobal = function (a) {
  return "undefined" != typeof window && window === a
    ? a
    : "undefined" != typeof global
      ? global
      : a;
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function () {
  $jscomp.initSymbol = function () {};
  $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};
$jscomp.symbolCounter_ = 0;
$jscomp.Symbol = function (a) {
  return $jscomp.SYMBOL_PREFIX + (a || "") + $jscomp.symbolCounter_++;
};
$jscomp.initSymbolIterator = function () {
  $jscomp.initSymbol();
  var a = $jscomp.global.Symbol.iterator;
  a || (a = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
  "function" != typeof Array.prototype[a] &&
    $jscomp.defineProperty(Array.prototype, a, {
      configurable: !0,
      writable: !0,
      value: function () {
        return $jscomp.arrayIterator(this);
      },
    });
  $jscomp.initSymbolIterator = function () {};
};
$jscomp.arrayIterator = function (a) {
  var b = 0;
  return $jscomp.iteratorPrototype(function () {
    return b < a.length ? { done: !1, value: a[b++] } : { done: !0 };
  });
};
$jscomp.iteratorPrototype = function (a) {
  $jscomp.initSymbolIterator();
  a = { next: a };
  a[$jscomp.global.Symbol.iterator] = function () {
    return this;
  };
  return a;
};
$jscomp.makeIterator = function (a) {
  $jscomp.initSymbolIterator();
  var b = a[Symbol.iterator];
  return b ? b.call(a) : $jscomp.arrayIterator(a);
};
$jscomp.arrayFromIterator = function (a) {
  for (var b, c = []; !(b = a.next()).done;) c.push(b.value);
  return c;
};
$jscomp.arrayFromIterable = function (a) {
  return a instanceof Array
    ? a
    : $jscomp.arrayFromIterator($jscomp.makeIterator(a));
};
this.require &&
  ((this.gui = this.require("nw.gui")),
  (this.requireNode = this.require),
  (this.requireNode.version = process.versions.node),
  delete this.require,
  delete process.versions.node);
var requirejs, require, define;
(function (a) {
  function b(a) {
    return "[object Function]" === x.call(a);
  }
  function c(a) {
    return "[object Array]" === x.call(a);
  }
  function d(a, d) {
    if (a) {
      var b;
      for (b = 0; b < a.length && (!a[b] || !d(a[b], b, a)); b += 1);
    }
  }
  function e(a, d) {
    if (a) {
      var b;
      for (b = a.length - 1; -1 < b && (!a[b] || !d(a[b], b, a)); --b);
    }
  }
  function m(a, d) {
    return I.call(a, d);
  }
  function h(a, d) {
    return m(a, d) && a[d];
  }
  function q(a, d) {
    for (var b in a) if (m(a, b) && d(a[b], b)) break;
  }
  function r(a, d, e, f) {
    d &&
      q(d, function (d, h) {
        if (e || !m(a, h))
          !f ||
          "object" !== typeof d ||
          !d ||
          c(d) ||
          b(d) ||
          d instanceof RegExp
            ? (a[h] = d)
            : (a[h] || (a[h] = {}), r(a[h], d, e, f));
      });
    return a;
  }
  function k(a, d) {
    return function () {
      return d.apply(a, arguments);
    };
  }
  function g(a) {
    throw a;
  }
  function u(b) {
    if (!b) return b;
    var c = a;
    d(b.split("."), function (a) {
      c = c[a];
    });
    return c;
  }
  function l(a, d, b, c) {
    d = Error(d + "\nhttp://requirejs.org/docs/errors.html#" + a);
    d.requireType = a;
    d.requireModules = c;
    b && (d.originalError = b);
    return d;
  }
  function f(f) {
    function p(a, d, b) {
      var c,
        e,
        f,
        n,
        p,
        g,
        m,
        l = d && d.split("/"),
        t = ra.map,
        k = t && t["*"];
      if (a && "." === a.charAt(0))
        if (d) {
          e = l.slice(0, l.length - 1);
          a = a.split("/");
          d = a.length - 1;
          ra.nodeIdCompat && M.test(a[d]) && (a[d] = a[d].replace(M, ""));
          e = a = e.concat(a);
          n = e.length;
          for (d = 0; d < n; d++)
            if (((f = e[d]), "." === f)) (e.splice(d, 1), --d);
            else if (".." === f)
              if (1 !== d || (".." !== e[2] && ".." !== e[0]))
                0 < d && (e.splice(d - 1, 2), (d -= 2));
              else break;
          a = a.join("/");
        } else 0 === a.indexOf("./") && (a = a.substring(2));
      if (b && t && (l || k)) {
        e = a.split("/");
        d = e.length;
        a: for (; 0 < d; --d) {
          n = e.slice(0, d).join("/");
          if (l)
            for (f = l.length; 0 < f; --f)
              if ((b = h(t, l.slice(0, f).join("/"))))
                if ((b = h(b, n))) {
                  c = b;
                  p = d;
                  break a;
                }
          !g && k && h(k, n) && ((g = h(k, n)), (m = d));
        }
        !c && g && ((c = g), (p = m));
        c && (e.splice(0, p, c), (a = e.join("/")));
      }
      return (c = h(ra.pkgs, a)) ? c : a;
    }
    function t(a) {
      L &&
        d(document.getElementsByTagName("script"), function (d) {
          if (
            d.getAttribute("data-requiremodule") === a &&
            d.getAttribute("data-requirecontext") === ca.contextName
          )
            return (d.parentNode.removeChild(d), !0);
        });
    }
    function v(a) {
      var d = h(ra.paths, a);
      if (d && c(d) && 1 < d.length)
        return (d.shift(), ca.require.undef(a), ca.require([a]), !0);
    }
    function z(a) {
      var d,
        b = a ? a.indexOf("!") : -1;
      -1 < b && ((d = a.substring(0, b)), (a = a.substring(b + 1, a.length)));
      return [d, a];
    }
    function E(a, d, b, c) {
      var e,
        f,
        n = null,
        g = d ? d.name : null,
        m = a,
        l = !0,
        t = "";
      a || ((l = !1), (a = "_@r" + (ya += 1)));
      a = z(a);
      n = a[0];
      a = a[1];
      n && ((n = p(n, g, c)), (f = h(ja, n)));
      a &&
        (n
          ? (t =
              f && f.normalize
                ? f.normalize(a, function (a) {
                    return p(a, g, c);
                  })
                : p(a, g, c))
          : ((t = p(a, g, c)),
            (a = z(t)),
            (n = a[0]),
            (t = a[1]),
            (b = !0),
            (e = ca.nameToUrl(t))));
      b = !n || f || b ? "" : "_unnormalized" + (ua += 1);
      return {
        prefix: n,
        name: t,
        parentMap: d,
        unnormalized: !!b,
        url: e,
        originalName: m,
        isDefine: l,
        id: (n ? n + "!" + t : t) + b,
      };
    }
    function J(a) {
      var d = a.id,
        b = h(U, d);
      b || (b = U[d] = new ca.Module(a));
      return b;
    }
    function x(a, d, b) {
      var c = a.id,
        e = h(U, c);
      if (!m(ja, c) || (e && !e.defineEmitComplete))
        if (((e = J(a)), e.error && "error" === d)) b(e.error);
        else e.on(d, b);
      else "defined" === d && b(ja[c]);
    }
    function A(a, b) {
      var c = a.requireModules,
        e = !1;
      if (b) b(a);
      else if (
        (d(c, function (d) {
          if ((d = h(U, d)))
            ((d.error = a), d.events.error && ((e = !0), d.emit("error", a)));
        }),
        !e)
      )
        n.onError(a);
    }
    function B() {
      W.length && (D.apply(ma, [ma.length, 0].concat(W)), (W = []));
    }
    function F(a) {
      delete U[a];
      delete aa[a];
    }
    function ba(a, b, c) {
      var e = a.map.id;
      a.error
        ? a.emit("error", a.error)
        : ((b[e] = !0),
          d(a.depMaps, function (d, e) {
            d = d.id;
            var f = h(U, d);
            f &&
              !a.depMatched[e] &&
              !c[d] &&
              (h(b, d) ? (a.defineDep(e, ja[d]), a.check()) : ba(f, b, c));
          }),
          (c[e] = !0));
    }
    function Q() {
      var a,
        b,
        c =
          (a = 1e3 * ra.waitSeconds) && ca.startTime + a < new Date().getTime(),
        e = [],
        f = [],
        h = !1,
        n = !0;
      if (!oa) {
        oa = !0;
        q(aa, function (a) {
          var d = a.map,
            p = d.id;
          if (a.enabled && (d.isDefine || f.push(a), !a.error))
            if (!a.inited && c) v(p) ? (h = b = !0) : (e.push(p), t(p));
            else if (
              !a.inited &&
              a.fetched &&
              d.isDefine &&
              ((h = !0), !d.prefix)
            )
              return (n = !1);
        });
        if (c && e.length)
          return (
            (a = l("timeout", "Load timeout for modules: " + e, null, e)),
            (a.contextName = ca.contextName),
            A(a)
          );
        n &&
          d(f, function (a) {
            ba(a, {}, {});
          });
        (c && !b) ||
          !h ||
          (!L && !y) ||
          Y ||
          (Y = setTimeout(function () {
            Y = 0;
            Q();
          }, 50));
        oa = !1;
      }
    }
    function I(a) {
      m(ja, a[0]) || J(E(a[0], null, !0)).init(a[1], a[2]);
    }
    function N(a) {
      a = a.currentTarget || a.srcElement;
      var d = ca.onScriptLoad;
      a.detachEvent && !K
        ? a.detachEvent("onreadystatechange", d)
        : a.removeEventListener("load", d, !1);
      d = ca.onScriptError;
      (a.detachEvent && !K) || a.removeEventListener("error", d, !1);
      return { node: a, id: a && a.getAttribute("data-requiremodule") };
    }
    function O() {
      var a;
      for (B(); ma.length;) {
        a = ma.shift();
        if (null === a[0])
          return A(
            l(
              "mismatch",
              "Mismatched anonymous define() module: " + a[a.length - 1],
            ),
          );
        I(a);
      }
    }
    var oa,
      w,
      ca,
      P,
      Y,
      ra = {
        waitSeconds: 7,
        baseUrl: "./",
        paths: {},
        bundles: {},
        pkgs: {},
        shim: {},
        config: {},
      },
      U = {},
      aa = {},
      sa = {},
      ma = [],
      ja = {},
      ia = {},
      na = {},
      ya = 1,
      ua = 1;
    P = {
      require: function (a) {
        return a.require ? a.require : (a.require = ca.makeRequire(a.map));
      },
      exports: function (a) {
        a.usingExports = !0;
        if (a.map.isDefine)
          return a.exports
            ? (ja[a.map.id] = a.exports)
            : (a.exports = ja[a.map.id] = {});
      },
      module: function (a) {
        return a.module
          ? a.module
          : (a.module = {
              id: a.map.id,
              uri: a.map.url,
              config: function () {
                return h(ra.config, a.map.id) || {};
              },
              exports: a.exports || (a.exports = {}),
            });
      },
    };
    w = function (a) {
      this.events = h(sa, a.id) || {};
      this.map = a;
      this.shim = h(ra.shim, a.id);
      this.depExports = [];
      this.depMaps = [];
      this.depMatched = [];
      this.pluginMaps = {};
      this.depCount = 0;
    };
    w.prototype = {
      init: function (a, d, b, c) {
        c = c || {};
        if (!this.inited) {
          this.factory = d;
          if (b) this.on("error", b);
          else
            this.events.error &&
              (b = k(this, function (a) {
                this.emit("error", a);
              }));
          this.depMaps = a && a.slice(0);
          this.errback = b;
          this.inited = !0;
          this.ignore = c.ignore;
          c.enabled || this.enabled ? this.enable() : this.check();
        }
      },
      defineDep: function (a, d) {
        this.depMatched[a] ||
          ((this.depMatched[a] = !0),
          --this.depCount,
          (this.depExports[a] = d));
      },
      fetch: function () {
        if (!this.fetched) {
          this.fetched = !0;
          ca.startTime = new Date().getTime();
          var a = this.map;
          if (this.shim)
            ca.makeRequire(this.map, { enableBuildCallback: !0 })(
              this.shim.deps || [],
              k(this, function () {
                return a.prefix ? this.callPlugin() : this.load();
              }),
            );
          else return a.prefix ? this.callPlugin() : this.load();
        }
      },
      load: function () {
        var a = this.map.url;
        ia[a] || ((ia[a] = !0), ca.load(this.map.id, a));
      },
      check: function () {
        if (this.enabled && !this.enabling) {
          var a,
            d,
            c = this.map.id;
          d = this.depExports;
          var e = this.exports,
            f = this.factory;
          if (this.inited)
            if (this.error) this.emit("error", this.error);
            else {
              if (!this.defining) {
                this.defining = !0;
                if (1 > this.depCount && !this.defined) {
                  if (b(f)) {
                    if (
                      (this.events.error && this.map.isDefine) ||
                      n.onError !== g
                    )
                      try {
                        e = ca.execCb(c, f, d, e);
                      } catch (Ka) {
                        a = Ka;
                      }
                    else e = ca.execCb(c, f, d, e);
                    this.map.isDefine &&
                      void 0 === e &&
                      ((d = this.module)
                        ? (e = d.exports)
                        : this.usingExports && (e = this.exports));
                    if (a)
                      return (
                        (a.requireMap = this.map),
                        (a.requireModules = this.map.isDefine
                          ? [this.map.id]
                          : null),
                        (a.requireType = this.map.isDefine
                          ? "define"
                          : "require"),
                        A((this.error = a))
                      );
                  } else e = f;
                  this.exports = e;
                  if (
                    this.map.isDefine &&
                    !this.ignore &&
                    ((ja[c] = e), n.onResourceLoad)
                  )
                    n.onResourceLoad(ca, this.map, this.depMaps);
                  F(c);
                  this.defined = !0;
                }
                this.defining = !1;
                this.defined &&
                  !this.defineEmitted &&
                  ((this.defineEmitted = !0),
                  this.emit("defined", this.exports),
                  (this.defineEmitComplete = !0));
              }
            }
          else this.fetch();
        }
      },
      callPlugin: function () {
        var a = this.map,
          d = a.id,
          b = E(a.prefix);
        this.depMaps.push(b);
        x(
          b,
          "defined",
          k(this, function (b) {
            var c, e;
            e = h(na, this.map.id);
            var f = this.map.name,
              g = this.map.parentMap ? this.map.parentMap.name : null,
              t = ca.makeRequire(a.parentMap, { enableBuildCallback: !0 });
            if (this.map.unnormalized) {
              if (
                (b.normalize &&
                  (f =
                    b.normalize(f, function (a) {
                      return p(a, g, !0);
                    }) || ""),
                (b = E(a.prefix + "!" + f, this.map.parentMap)),
                x(
                  b,
                  "defined",
                  k(this, function (a) {
                    this.init(
                      [],
                      function () {
                        return a;
                      },
                      null,
                      { enabled: !0, ignore: !0 },
                    );
                  }),
                ),
                (e = h(U, b.id)))
              ) {
                this.depMaps.push(b);
                if (this.events.error)
                  e.on(
                    "error",
                    k(this, function (a) {
                      this.emit("error", a);
                    }),
                  );
                e.enable();
              }
            } else
              e
                ? ((this.map.url = ca.nameToUrl(e)), this.load())
                : ((c = k(this, function (a) {
                    this.init(
                      [],
                      function () {
                        return a;
                      },
                      null,
                      { enabled: !0 },
                    );
                  })),
                  (c.error = k(this, function (a) {
                    this.inited = !0;
                    this.error = a;
                    a.requireModules = [d];
                    q(U, function (a) {
                      0 === a.map.id.indexOf(d + "_unnormalized") &&
                        F(a.map.id);
                    });
                    A(a);
                  })),
                  (c.fromText = k(this, function (b, e) {
                    var f = a.name,
                      h = E(f),
                      p = V;
                    e && (b = e);
                    p && (V = !1);
                    J(h);
                    m(ra.config, d) && (ra.config[f] = ra.config[d]);
                    try {
                      n.exec(b);
                    } catch (Fa) {
                      return A(
                        l(
                          "fromtexteval",
                          "fromText eval for " + d + " failed: " + Fa,
                          Fa,
                          [d],
                        ),
                      );
                    }
                    p && (V = !0);
                    this.depMaps.push(h);
                    ca.completeLoad(f);
                    t([f], c);
                  })),
                  b.load(a.name, t, c, ra));
          }),
        );
        ca.enable(b, this);
        this.pluginMaps[b.id] = b;
      },
      enable: function () {
        aa[this.map.id] = this;
        this.enabling = this.enabled = !0;
        d(
          this.depMaps,
          k(this, function (a, d) {
            var b, c;
            if ("string" === typeof a) {
              a = E(
                a,
                this.map.isDefine ? this.map : this.map.parentMap,
                !1,
                !this.skipMap,
              );
              this.depMaps[d] = a;
              if ((b = h(P, a.id))) {
                this.depExports[d] = b(this);
                return;
              }
              this.depCount += 1;
              x(
                a,
                "defined",
                k(this, function (a) {
                  this.defineDep(d, a);
                  this.check();
                }),
              );
              this.errback && x(a, "error", k(this, this.errback));
            }
            b = a.id;
            c = U[b];
            !m(P, b) && c && !c.enabled && ca.enable(a, this);
          }),
        );
        q(
          this.pluginMaps,
          k(this, function (a) {
            var d = h(U, a.id);
            d && !d.enabled && ca.enable(a, this);
          }),
        );
        this.enabling = !1;
        this.check();
      },
      on: function (a, d) {
        var b = this.events[a];
        b || (b = this.events[a] = []);
        b.push(d);
      },
      emit: function (a, b) {
        d(this.events[a], function (a) {
          a(b);
        });
        "error" === a && delete this.events[a];
      },
    };
    ca = {
      config: ra,
      contextName: f,
      registry: U,
      defined: ja,
      urlFetched: ia,
      defQueue: ma,
      Module: w,
      makeModuleMap: E,
      nextTick: n.nextTick,
      onError: A,
      configure: function (a) {
        a.baseUrl &&
          "/" !== a.baseUrl.charAt(a.baseUrl.length - 1) &&
          (a.baseUrl += "/");
        var b = ra.shim,
          e = { paths: !0, bundles: !0, config: !0, map: !0 };
        q(a, function (a, d) {
          e[d] ? (ra[d] || (ra[d] = {}), r(ra[d], a, !0, !0)) : (ra[d] = a);
        });
        a.bundles &&
          q(a.bundles, function (a, b) {
            d(a, function (a) {
              a !== b && (na[a] = b);
            });
          });
        a.shim &&
          (q(a.shim, function (a, d) {
            c(a) && (a = { deps: a });
            (!a.exports && !a.init) ||
              a.exportsFn ||
              (a.exportsFn = ca.makeShimExports(a));
            b[d] = a;
          }),
          (ra.shim = b));
        a.packages &&
          d(a.packages, function (a) {
            var d;
            a = "string" === typeof a ? { name: a } : a;
            d = a.name;
            a.location && (ra.paths[d] = a.location);
            ra.pkgs[d] =
              a.name + "/" + (a.main || "main").replace(H, "").replace(M, "");
          });
        q(U, function (a, d) {
          a.inited || a.map.unnormalized || (a.map = E(d));
        });
        (a.deps || a.callback) && ca.require(a.deps || [], a.callback);
      },
      makeShimExports: function (d) {
        return function () {
          var b;
          d.init && (b = d.init.apply(a, arguments));
          return b || (d.exports && u(d.exports));
        };
      },
      makeRequire: function (a, d) {
        function c(e, h, p) {
          var g, t;
          d.enableBuildCallback && h && b(h) && (h.__requireJsBuild = !0);
          if ("string" === typeof e) {
            if (b(h)) return A(l("requireargs", "Invalid require call"), p);
            if (a && m(P, e)) return P[e](U[a.id]);
            if (n.get) return n.get(ca, e, a, c);
            g = E(e, a, !1, !0);
            g = g.id;
            return m(ja, g)
              ? ja[g]
              : A(
                  l(
                    "notloaded",
                    'Module name "' +
                      g +
                      '" has not been loaded yet for context: ' +
                      f +
                      (a ? "" : ". Use require([])"),
                  ),
                );
          }
          O();
          ca.nextTick(function () {
            O();
            t = J(E(null, a));
            t.skipMap = d.skipMap;
            t.init(e, h, p, { enabled: !0 });
            Q();
          });
          return c;
        }
        d = d || {};
        r(c, {
          isBrowser: L,
          toUrl: function (d) {
            var b,
              c = d.lastIndexOf("."),
              e = d.split("/")[0];
            -1 !== c &&
              (("." !== e && ".." !== e) || 1 < c) &&
              ((b = d.substring(c, d.length)), (d = d.substring(0, c)));
            return ca.nameToUrl(p(d, a && a.id, !0), b, !0);
          },
          defined: function (d) {
            return m(ja, E(d, a, !1, !0).id);
          },
          specified: function (d) {
            d = E(d, a, !1, !0).id;
            return m(ja, d) || m(U, d);
          },
        });
        a ||
          (c.undef = function (d) {
            B();
            var b = E(d, a, !0),
              c = h(U, d);
            t(d);
            delete ja[d];
            delete ia[b.url];
            delete sa[d];
            e(ma, function (a, b) {
              a[0] === d && ma.splice(b, 1);
            });
            c && (c.events.defined && (sa[d] = c.events), F(d));
          });
        return c;
      },
      enable: function (a) {
        h(U, a.id) && J(a).enable();
      },
      completeLoad: function (a) {
        var d,
          b,
          c = h(ra.shim, a) || {},
          e = c.exports;
        for (B(); ma.length;) {
          b = ma.shift();
          if (null === b[0]) {
            b[0] = a;
            if (d) break;
            d = !0;
          } else b[0] === a && (d = !0);
          I(b);
        }
        b = h(U, a);
        if (!d && !m(ja, a) && b && !b.inited) {
          if (ra.enforceDefine && (!e || !u(e)))
            return v(a)
              ? void 0
              : A(l("nodefine", "No define call for " + a, null, [a]));
          I([a, c.deps || [], c.exportsFn]);
        }
        Q();
      },
      nameToUrl: function (a, d, b) {
        var e, f, p;
        (e = h(ra.pkgs, a)) && (a = e);
        if ((e = h(na, a))) return ca.nameToUrl(e, d, b);
        if (n.jsExtRegExp.test(a)) e = a + (d || "");
        else {
          e = ra.paths;
          a = a.split("/");
          for (f = a.length; 0 < f; --f)
            if (((p = a.slice(0, f).join("/")), (p = h(e, p)))) {
              c(p) && (p = p[0]);
              a.splice(0, f, p);
              break;
            }
          e = a.join("/");
          e += d || (/^data\:|\?/.test(e) || b ? "" : ".js");
          e =
            ("/" === e.charAt(0) || e.match(/^[\w\+\.\-]+:/)
              ? ""
              : ra.baseUrl) + e;
        }
        return ra.urlArgs
          ? e + ((-1 === e.indexOf("?") ? "?" : "\x26") + ra.urlArgs)
          : e;
      },
      load: function (a, d) {
        n.load(ca, a, d);
      },
      execCb: function (a, d, b, c) {
        return d.apply(c, b);
      },
      onScriptLoad: function (a) {
        if (
          "load" === a.type ||
          G.test((a.currentTarget || a.srcElement).readyState)
        )
          ((C = null), (a = N(a)), ca.completeLoad(a.id));
      },
      onScriptError: function (a) {
        var d = N(a);
        if (!v(d.id))
          return A(l("scripterror", "Script error for: " + d.id, a, [d.id]));
      },
    };
    ca.require = ca.makeRequire();
    return ca;
  }
  var n,
    p,
    v,
    t,
    z,
    E,
    C,
    J,
    A,
    B,
    F = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,
    O = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
    M = /\.js$/,
    H = /^\.\//;
  p = Object.prototype;
  var x = p.toString,
    I = p.hasOwnProperty,
    D = Array.prototype.splice,
    L = !(
      "undefined" === typeof window ||
      "undefined" === typeof navigator ||
      !window.document
    ),
    y = !L && "undefined" !== typeof importScripts,
    G =
      L && "PLAYSTATION 3" === navigator.platform
        ? /^complete$/
        : /^(complete|loaded)$/,
    K = "undefined" !== typeof opera && "[object Opera]" === opera.toString(),
    N = {},
    Q = {},
    W = [],
    V = !1;
  if ("undefined" === typeof define) {
    if ("undefined" !== typeof requirejs) {
      if (b(requirejs)) return;
      Q = requirejs;
      requirejs = void 0;
    }
    "undefined" !== typeof require &&
      !b(require) &&
      ((Q = require), (require = void 0));
    n = requirejs = function (a, d, b, e) {
      var f,
        p = "_";
      !c(a) &&
        "string" !== typeof a &&
        ((f = a), c(d) ? ((a = d), (d = b), (b = e)) : (a = []));
      f && f.context && (p = f.context);
      (e = h(N, p)) || (e = N[p] = n.s.newContext(p));
      f && e.configure(f);
      return e.require(a, d, b);
    };
    n.config = function (a) {
      return n(a);
    };
    n.nextTick =
      "undefined" !== typeof setTimeout
        ? function (a) {
            setTimeout(a, 4);
          }
        : function (a) {
            a();
          };
    require || (require = n);
    n.version = "2.1.11";
    n.jsExtRegExp = /^\/|:|\?|\.js$/;
    n.isBrowser = L;
    p = n.s = { contexts: N, newContext: f };
    n({});
    d(["toUrl", "undef", "defined", "specified"], function (a) {
      n[a] = function () {
        var d = N._;
        return d.require[a].apply(d, arguments);
      };
    });
    L &&
      ((v = p.head = document.getElementsByTagName("head")[0]),
      (t = document.getElementsByTagName("base")[0])) &&
      (v = p.head = t.parentNode);
    n.onError = g;
    n.createNode = function (a) {
      var d = a.xhtml
        ? document.createElementNS(
            "http://www.w3.org/1999/xhtml",
            "html:script",
          )
        : document.createElement("script");
      d.type = a.scriptType || "text/javascript";
      d.charset = "utf-8";
      d.async = !0;
      return d;
    };
    n.load = function (a, d, b) {
      var c = (a && a.config) || {};
      if (L)
        return (
          (c = n.createNode(c, d, b)),
          c.setAttribute("data-requirecontext", a.contextName),
          c.setAttribute("data-requiremodule", d),
          !c.attachEvent ||
          (c.attachEvent.toString &&
            0 > c.attachEvent.toString().indexOf("[native code")) ||
          K
            ? (c.addEventListener("load", a.onScriptLoad, !1),
              c.addEventListener("error", a.onScriptError, !1))
            : ((V = !0), c.attachEvent("onreadystatechange", a.onScriptLoad)),
          (c.src = b),
          (J = c),
          t ? v.insertBefore(c, t) : v.appendChild(c),
          (J = null),
          c
        );
      if (y)
        try {
          (importScripts(b), a.completeLoad(d));
        } catch (R) {
          a.onError(
            l(
              "importscripts",
              "importScripts failed for " + d + " at " + b,
              R,
              [d],
            ),
          );
        }
    };
    L &&
      !Q.skipDataMain &&
      e(document.getElementsByTagName("script"), function (a) {
        v || (v = a.parentNode);
        if ((z = a.getAttribute("data-main")))
          return (
            (A = z),
            Q.baseUrl ||
              ((E = A.split("/")),
              (A = E.pop()),
              (B = E.length ? E.join("/") + "/" : "./"),
              (Q.baseUrl = B)),
            (A = A.replace(M, "")),
            n.jsExtRegExp.test(A) && (A = z),
            (Q.deps = Q.deps ? Q.deps.concat(A) : [A]),
            !0
          );
      });
    define = function (a, d, f) {
      var h, n;
      "string" !== typeof a && ((f = d), (d = a), (a = null));
      c(d) || ((f = d), (d = null));
      !d &&
        b(f) &&
        ((d = []),
        f.length &&
          (f
            .toString()
            .replace(F, "")
            .replace(O, function (a, b) {
              d.push(b);
            }),
          (d = (
            1 === f.length ? ["require"] : ["require", "exports", "module"]
          ).concat(d))));
      V &&
        ((h = J) ||
          ((C && "interactive" === C.readyState) ||
            e(document.getElementsByTagName("script"), function (a) {
              if ("interactive" === a.readyState) return (C = a);
            }),
          (h = C)),
        h &&
          (a || (a = h.getAttribute("data-requiremodule")),
          (n = N[h.getAttribute("data-requirecontext")])));
      (n ? n.defQueue : W).push([a, d, f]);
    };
    define.amd = { jQuery: !0 };
    n.exec = function (a) {
      return eval(a);
    };
    n(Q);
  }
})(this);
var wybt = "\u4ed9\u5883\u7684\u4f20\u8bf4";
