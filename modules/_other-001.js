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
  function l(a, d) {
    return J.call(a, d);
  }
  function h(a, d) {
    return l(a, d) && a[d];
  }
  function r(a, d) {
    for (var b in a) if (l(a, b) && d(a[b], b)) break;
  }
  function t(a, d, e, f) {
    d &&
      r(d, function (d, h) {
        if (e || !l(a, h))
          !f ||
          "object" !== typeof d ||
          !d ||
          c(d) ||
          b(d) ||
          d instanceof RegExp
            ? (a[h] = d)
            : (a[h] || (a[h] = {}), t(a[h], d, e, f));
      });
    return a;
  }
  function n(a, d) {
    return function () {
      return d.apply(a, arguments);
    };
  }
  function g(a) {
    throw a;
  }
  function p(b) {
    if (!b) return b;
    var c = a;
    d(b.split("."), function (a) {
      c = c[a];
    });
    return c;
  }
  function k(a, d, b, c) {
    d = Error(d + "\nhttp://requirejs.org/docs/errors.html#" + a);
    d.requireType = a;
    d.requireModules = c;
    b && (d.originalError = b);
    return d;
  }
  function f(f) {
    function q(a, d, b) {
      var c,
        e,
        f,
        m,
        q,
        g,
        l,
        k = d && d.split("/"),
        n = ra.map,
        p = n && n["*"];
      if (a && "." === a.charAt(0))
        if (d) {
          e = k.slice(0, k.length - 1);
          a = a.split("/");
          d = a.length - 1;
          ra.nodeIdCompat && N.test(a[d]) && (a[d] = a[d].replace(N, ""));
          e = a = e.concat(a);
          m = e.length;
          for (d = 0; d < m; d++)
            if (((f = e[d]), "." === f)) (e.splice(d, 1), --d);
            else if (".." === f)
              if (1 !== d || (".." !== e[2] && ".." !== e[0]))
                0 < d && (e.splice(d - 1, 2), (d -= 2));
              else break;
          a = a.join("/");
        } else 0 === a.indexOf("./") && (a = a.substring(2));
      if (b && n && (k || p)) {
        e = a.split("/");
        d = e.length;
        a: for (; 0 < d; --d) {
          m = e.slice(0, d).join("/");
          if (k)
            for (f = k.length; 0 < f; --f)
              if ((b = h(n, k.slice(0, f).join("/"))))
                if ((b = h(b, m))) {
                  c = b;
                  q = d;
                  break a;
                }
          !g && p && h(p, m) && ((g = h(p, m)), (l = d));
        }
        !c && g && ((c = g), (q = l));
        c && (e.splice(0, q, c), (a = e.join("/")));
      }
      return (c = h(ra.pkgs, a)) ? c : a;
    }
    function v(a) {
      L &&
        d(document.getElementsByTagName("script"), function (d) {
          if (
            d.getAttribute("data-requiremodule") === a &&
            d.getAttribute("data-requirecontext") === ca.contextName
          )
            return (d.parentNode.removeChild(d), !0);
        });
    }
    function u(a) {
      var d = h(ra.paths, a);
      if (d && c(d) && 1 < d.length)
        return (d.shift(), ca.require.undef(a), ca.require([a]), !0);
    }
    function D(a) {
      var d,
        b = a ? a.indexOf("!") : -1;
      -1 < b && ((d = a.substring(0, b)), (a = a.substring(b + 1, a.length)));
      return [d, a];
    }
    function A(a, d, b, c) {
      var e,
        f,
        m = null,
        g = d ? d.name : null,
        l = a,
        k = !0,
        n = "";
      a || ((k = !1), (a = "_@r" + (wa += 1)));
      a = D(a);
      m = a[0];
      a = a[1];
      m && ((m = q(m, g, c)), (f = h(ja, m)));
      a &&
        (m
          ? (n =
              f && f.normalize
                ? f.normalize(a, function (a) {
                    return q(a, g, c);
                  })
                : q(a, g, c))
          : ((n = q(a, g, c)),
            (a = D(n)),
            (m = a[0]),
            (n = a[1]),
            (b = !0),
            (e = ca.nameToUrl(n))));
      b = !m || f || b ? "" : "_unnormalized" + (ua += 1);
      return {
        prefix: m,
        name: n,
        parentMap: d,
        unnormalized: !!b,
        url: e,
        originalName: l,
        isDefine: k,
        id: (m ? m + "!" + n : n) + b,
      };
    }
    function H(a) {
      var d = a.id,
        b = h(U, d);
      b || (b = U[d] = new ca.Module(a));
      return b;
    }
    function x(a, d, b) {
      var c = a.id,
        e = h(U, c);
      if (!l(ja, c) || (e && !e.defineEmitComplete))
        if (((e = H(a)), e.error && "error" === d)) b(e.error);
        else e.on(d, b);
      else "defined" === d && b(ja[c]);
    }
    function z(a, b) {
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
        m.onError(a);
    }
    function G() {
      W.length && (E.apply(ma, [ma.length, 0].concat(W)), (W = []));
    }
    function C(a) {
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
        m = !0;
      if (!pa) {
        pa = !0;
        r(aa, function (a) {
          var d = a.map,
            q = d.id;
          if (a.enabled && (d.isDefine || f.push(a), !a.error))
            if (!a.inited && c) u(q) ? (h = b = !0) : (e.push(q), v(q));
            else if (
              !a.inited &&
              a.fetched &&
              d.isDefine &&
              ((h = !0), !d.prefix)
            )
              return (m = !1);
        });
        if (c && e.length)
          return (
            (a = k("timeout", "Load timeout for modules: " + e, null, e)),
            (a.contextName = ca.contextName),
            z(a)
          );
        m &&
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
        pa = !1;
      }
    }
    function M(a) {
      l(ja, a[0]) || H(A(a[0], null, !0)).init(a[1], a[2]);
    }
    function J(a) {
      a = a.currentTarget || a.srcElement;
      var d = ca.onScriptLoad;
      a.detachEvent && !K
        ? a.detachEvent("onreadystatechange", d)
        : a.removeEventListener("load", d, !1);
      d = ca.onScriptError;
      (a.detachEvent && !K) || a.removeEventListener("error", d, !1);
      return { node: a, id: a && a.getAttribute("data-requiremodule") };
    }
    function P() {
      var a;
      for (G(); ma.length;) {
        a = ma.shift();
        if (null === a[0])
          return z(
            k(
              "mismatch",
              "Mismatched anonymous define() module: " + a[a.length - 1],
            ),
          );
        M(a);
      }
    }
    var pa,
      w,
      ca,
      O,
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
      wa = 1,
      ua = 1;
    O = {
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
              (b = n(this, function (a) {
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
              n(this, function () {
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
                      m.onError !== g
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
                        z((this.error = a))
                      );
                  } else e = f;
                  this.exports = e;
                  if (
                    this.map.isDefine &&
                    !this.ignore &&
                    ((ja[c] = e), m.onResourceLoad)
                  )
                    m.onResourceLoad(ca, this.map, this.depMaps);
                  C(c);
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
          b = A(a.prefix);
        this.depMaps.push(b);
        x(
          b,
          "defined",
          n(this, function (b) {
            var c, e;
            e = h(na, this.map.id);
            var f = this.map.name,
              g = this.map.parentMap ? this.map.parentMap.name : null,
              p = ca.makeRequire(a.parentMap, { enableBuildCallback: !0 });
            if (this.map.unnormalized) {
              if (
                (b.normalize &&
                  (f =
                    b.normalize(f, function (a) {
                      return q(a, g, !0);
                    }) || ""),
                (b = A(a.prefix + "!" + f, this.map.parentMap)),
                x(
                  b,
                  "defined",
                  n(this, function (a) {
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
                    n(this, function (a) {
                      this.emit("error", a);
                    }),
                  );
                e.enable();
              }
            } else
              e
                ? ((this.map.url = ca.nameToUrl(e)), this.load())
                : ((c = n(this, function (a) {
                    this.init(
                      [],
                      function () {
                        return a;
                      },
                      null,
                      { enabled: !0 },
                    );
                  })),
                  (c.error = n(this, function (a) {
                    this.inited = !0;
                    this.error = a;
                    a.requireModules = [d];
                    r(U, function (a) {
                      0 === a.map.id.indexOf(d + "_unnormalized") &&
                        C(a.map.id);
                    });
                    z(a);
                  })),
                  (c.fromText = n(this, function (b, e) {
                    var f = a.name,
                      h = A(f),
                      q = V;
                    e && (b = e);
                    q && (V = !1);
                    H(h);
                    l(ra.config, d) && (ra.config[f] = ra.config[d]);
                    try {
                      m.exec(b);
                    } catch (Fa) {
                      return z(
                        k(
                          "fromtexteval",
                          "fromText eval for " + d + " failed: " + Fa,
                          Fa,
                          [d],
                        ),
                      );
                    }
                    q && (V = !0);
                    this.depMaps.push(h);
                    ca.completeLoad(f);
                    p([f], c);
                  })),
                  b.load(a.name, p, c, ra));
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
          n(this, function (a, d) {
            var b, c;
            if ("string" === typeof a) {
              a = A(
                a,
                this.map.isDefine ? this.map : this.map.parentMap,
                !1,
                !this.skipMap,
              );
              this.depMaps[d] = a;
              if ((b = h(O, a.id))) {
                this.depExports[d] = b(this);
                return;
              }
              this.depCount += 1;
              x(
                a,
                "defined",
                n(this, function (a) {
                  this.defineDep(d, a);
                  this.check();
                }),
              );
              this.errback && x(a, "error", n(this, this.errback));
            }
            b = a.id;
            c = U[b];
            !l(O, b) && c && !c.enabled && ca.enable(a, this);
          }),
        );
        r(
          this.pluginMaps,
          n(this, function (a) {
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
      makeModuleMap: A,
      nextTick: m.nextTick,
      onError: z,
      configure: function (a) {
        a.baseUrl &&
          "/" !== a.baseUrl.charAt(a.baseUrl.length - 1) &&
          (a.baseUrl += "/");
        var b = ra.shim,
          e = { paths: !0, bundles: !0, config: !0, map: !0 };
        r(a, function (a, d) {
          e[d] ? (ra[d] || (ra[d] = {}), t(ra[d], a, !0, !0)) : (ra[d] = a);
        });
        a.bundles &&
          r(a.bundles, function (a, b) {
            d(a, function (a) {
              a !== b && (na[a] = b);
            });
          });
        a.shim &&
          (r(a.shim, function (a, d) {
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
              a.name + "/" + (a.main || "main").replace(I, "").replace(N, "");
          });
        r(U, function (a, d) {
          a.inited || a.map.unnormalized || (a.map = A(d));
        });
        (a.deps || a.callback) && ca.require(a.deps || [], a.callback);
      },
      makeShimExports: function (d) {
        return function () {
          var b;
          d.init && (b = d.init.apply(a, arguments));
          return b || (d.exports && p(d.exports));
        };
      },
      makeRequire: function (a, d) {
        function c(e, h, q) {
          var g, n;
          d.enableBuildCallback && h && b(h) && (h.__requireJsBuild = !0);
          if ("string" === typeof e) {
            if (b(h)) return z(k("requireargs", "Invalid require call"), q);
            if (a && l(O, e)) return O[e](U[a.id]);
            if (m.get) return m.get(ca, e, a, c);
            g = A(e, a, !1, !0);
            g = g.id;
            return l(ja, g)
              ? ja[g]
              : z(
                  k(
                    "notloaded",
                    'Module name "' +
                      g +
                      '" has not been loaded yet for context: ' +
                      f +
                      (a ? "" : ". Use require([])"),
                  ),
                );
          }
          P();
          ca.nextTick(function () {
            P();
            n = H(A(null, a));
            n.skipMap = d.skipMap;
            n.init(e, h, q, { enabled: !0 });
            Q();
          });
          return c;
        }
        d = d || {};
        t(c, {
          isBrowser: L,
          toUrl: function (d) {
            var b,
              c = d.lastIndexOf("."),
              e = d.split("/")[0];
            -1 !== c &&
              (("." !== e && ".." !== e) || 1 < c) &&
              ((b = d.substring(c, d.length)), (d = d.substring(0, c)));
            return ca.nameToUrl(q(d, a && a.id, !0), b, !0);
          },
          defined: function (d) {
            return l(ja, A(d, a, !1, !0).id);
          },
          specified: function (d) {
            d = A(d, a, !1, !0).id;
            return l(ja, d) || l(U, d);
          },
        });
        a ||
          (c.undef = function (d) {
            G();
            var b = A(d, a, !0),
              c = h(U, d);
            v(d);
            delete ja[d];
            delete ia[b.url];
            delete sa[d];
            e(ma, function (a, b) {
              a[0] === d && ma.splice(b, 1);
            });
            c && (c.events.defined && (sa[d] = c.events), C(d));
          });
        return c;
      },
      enable: function (a) {
        h(U, a.id) && H(a).enable();
      },
      completeLoad: function (a) {
        var d,
          b,
          c = h(ra.shim, a) || {},
          e = c.exports;
        for (G(); ma.length;) {
          b = ma.shift();
          if (null === b[0]) {
            b[0] = a;
            if (d) break;
            d = !0;
          } else b[0] === a && (d = !0);
          M(b);
        }
        b = h(U, a);
        if (!d && !l(ja, a) && b && !b.inited) {
          if (ra.enforceDefine && (!e || !p(e)))
            return u(a)
              ? void 0
              : z(k("nodefine", "No define call for " + a, null, [a]));
          M([a, c.deps || [], c.exportsFn]);
        }
        Q();
      },
      nameToUrl: function (a, d, b) {
        var e, f, q;
        (e = h(ra.pkgs, a)) && (a = e);
        if ((e = h(na, a))) return ca.nameToUrl(e, d, b);
        if (m.jsExtRegExp.test(a)) e = a + (d || "");
        else {
          e = ra.paths;
          a = a.split("/");
          for (f = a.length; 0 < f; --f)
            if (((q = a.slice(0, f).join("/")), (q = h(e, q)))) {
              c(q) && (q = q[0]);
              a.splice(0, f, q);
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
        m.load(ca, a, d);
      },
      execCb: function (a, d, b, c) {
        return d.apply(c, b);
      },
      onScriptLoad: function (a) {
        if (
          "load" === a.type ||
          F.test((a.currentTarget || a.srcElement).readyState)
        )
          ((B = null), (a = J(a)), ca.completeLoad(a.id));
      },
      onScriptError: function (a) {
        var d = J(a);
        if (!u(d.id))
          return z(k("scripterror", "Script error for: " + d.id, a, [d.id]));
      },
    };
    ca.require = ca.makeRequire();
    return ca;
  }
  var m,
    q,
    v,
    u,
    A,
    D,
    B,
    H,
    C,
    z,
    G = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,
    P = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
    N = /\.js$/,
    I = /^\.\//;
  q = Object.prototype;
  var x = q.toString,
    J = q.hasOwnProperty,
    E = Array.prototype.splice,
    L = !(
      "undefined" === typeof window ||
      "undefined" === typeof navigator ||
      !window.document
    ),
    y = !L && "undefined" !== typeof importScripts,
    F =
      L && "PLAYSTATION 3" === navigator.platform
        ? /^complete$/
        : /^(complete|loaded)$/,
    K = "undefined" !== typeof opera && "[object Opera]" === opera.toString(),
    M = {},
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
    m = requirejs = function (a, d, b, e) {
      var f,
        q = "_";
      !c(a) &&
        "string" !== typeof a &&
        ((f = a), c(d) ? ((a = d), (d = b), (b = e)) : (a = []));
      f && f.context && (q = f.context);
      (e = h(M, q)) || (e = M[q] = m.s.newContext(q));
      f && e.configure(f);
      return e.require(a, d, b);
    };
    m.config = function (a) {
      return m(a);
    };
    m.nextTick =
      "undefined" !== typeof setTimeout
        ? function (a) {
            setTimeout(a, 4);
          }
        : function (a) {
            a();
          };
    require || (require = m);
    m.version = "2.1.11";
    m.jsExtRegExp = /^\/|:|\?|\.js$/;
    m.isBrowser = L;
    q = m.s = { contexts: M, newContext: f };
    m({});
    d(["toUrl", "undef", "defined", "specified"], function (a) {
      m[a] = function () {
        var d = M._;
        return d.require[a].apply(d, arguments);
      };
    });
    L &&
      ((v = q.head = document.getElementsByTagName("head")[0]),
      (u = document.getElementsByTagName("base")[0])) &&
      (v = q.head = u.parentNode);
    m.onError = g;
    m.createNode = function (a) {
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
    m.load = function (a, d, b) {
      var c = (a && a.config) || {};
      if (L)
        return (
          (c = m.createNode(c, d, b)),
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
          (H = c),
          u ? v.insertBefore(c, u) : v.appendChild(c),
          (H = null),
          c
        );
      if (y)
        try {
          (importScripts(b), a.completeLoad(d));
        } catch (R) {
          a.onError(
            k(
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
        if ((A = a.getAttribute("data-main")))
          return (
            (C = A),
            Q.baseUrl ||
              ((D = C.split("/")),
              (C = D.pop()),
              (z = D.length ? D.join("/") + "/" : "./"),
              (Q.baseUrl = z)),
            (C = C.replace(N, "")),
            m.jsExtRegExp.test(C) && (C = A),
            (Q.deps = Q.deps ? Q.deps.concat(C) : [C]),
            !0
          );
      });
    define = function (a, d, f) {
      var h, m;
      "string" !== typeof a && ((f = d), (d = a), (a = null));
      c(d) || ((f = d), (d = null));
      !d &&
        b(f) &&
        ((d = []),
        f.length &&
          (f
            .toString()
            .replace(G, "")
            .replace(P, function (a, b) {
              d.push(b);
            }),
          (d = (
            1 === f.length ? ["require"] : ["require", "exports", "module"]
          ).concat(d))));
      V &&
        ((h = H) ||
          ((B && "interactive" === B.readyState) ||
            e(document.getElementsByTagName("script"), function (a) {
              if ("interactive" === a.readyState) return (B = a);
            }),
          (h = B)),
        h &&
          (a || (a = h.getAttribute("data-requiremodule")),
          (m = M[h.getAttribute("data-requirecontext")])));
      (m ? m.defQueue : W).push([a, d, f]);
    };
    define.amd = { jQuery: !0 };
    m.exec = function (a) {
      return eval(a);
    };
    m(Q);
  }
})(this);
var wybt = "\u4ed9\u5883\u7684\u4f20\u8bf4";
