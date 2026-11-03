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
    return K.call(a, d);
  }
  function h(a, d) {
    return m(a, d) && a[d];
  }
  function t(a, d) {
    for (var b in a) if (m(a, b) && d(a[b], b)) break;
  }
  function r(a, d, e, f) {
    d &&
      t(d, function (d, h) {
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
  function l(a, d, b, c) {
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
        k,
        q,
        g,
        m,
        l = d && d.split("/"),
        n = ra.map,
        p = n && n["*"];
      if (a && "." === a.charAt(0))
        if (d) {
          e = l.slice(0, l.length - 1);
          a = a.split("/");
          d = a.length - 1;
          ra.nodeIdCompat && O.test(a[d]) && (a[d] = a[d].replace(O, ""));
          e = a = e.concat(a);
          k = e.length;
          for (d = 0; d < k; d++)
            if (((f = e[d]), "." === f)) (e.splice(d, 1), --d);
            else if (".." === f)
              if (1 !== d || (".." !== e[2] && ".." !== e[0]))
                0 < d && (e.splice(d - 1, 2), (d -= 2));
              else break;
          a = a.join("/");
        } else 0 === a.indexOf("./") && (a = a.substring(2));
      if (b && n && (l || p)) {
        e = a.split("/");
        d = e.length;
        a: for (; 0 < d; --d) {
          k = e.slice(0, d).join("/");
          if (l)
            for (f = l.length; 0 < f; --f)
              if ((b = h(n, l.slice(0, f).join("/"))))
                if ((b = h(b, k))) {
                  c = b;
                  q = d;
                  break a;
                }
          !g && p && h(p, k) && ((g = h(p, k)), (m = d));
        }
        !c && g && ((c = g), (q = m));
        c && (e.splice(0, q, c), (a = e.join("/")));
      }
      return (c = h(ra.pkgs, a)) ? c : a;
    }
    function u(a) {
      F &&
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
    function C(a) {
      var d,
        b = a ? a.indexOf("!") : -1;
      -1 < b && ((d = a.substring(0, b)), (a = a.substring(b + 1, a.length)));
      return [d, a];
    }
    function A(a, d, b, c) {
      var e,
        f,
        k = null,
        g = d ? d.name : null,
        m = a,
        l = !0,
        n = "";
      a || ((l = !1), (a = "_@r" + (xa += 1)));
      a = C(a);
      k = a[0];
      a = a[1];
      k && ((k = q(k, g, c)), (f = h(ja, k)));
      a &&
        (k
          ? (n =
              f && f.normalize
                ? f.normalize(a, function (a) {
                    return q(a, g, c);
                  })
                : q(a, g, c))
          : ((n = q(a, g, c)),
            (a = C(n)),
            (k = a[0]),
            (n = a[1]),
            (b = !0),
            (e = ca.nameToUrl(n))));
      b = !k || f || b ? "" : "_unnormalized" + (ua += 1);
      return {
        prefix: k,
        name: n,
        parentMap: d,
        unnormalized: !!b,
        url: e,
        originalName: m,
        isDefine: l,
        id: (k ? k + "!" + n : n) + b,
      };
    }
    function J(a) {
      var d = a.id,
        b = h(U, d);
      b || (b = U[d] = new ca.Module(a));
      return b;
    }
    function y(a, d, b) {
      var c = a.id,
        e = h(U, c);
      if (!m(ja, c) || (e && !e.defineEmitComplete))
        if (((e = J(a)), e.error && "error" === d)) b(e.error);
        else e.on(d, b);
      else "defined" === d && b(ja[c]);
    }
    function x(a, b) {
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
        k.onError(a);
    }
    function D() {
      V.length && (E.apply(ma, [ma.length, 0].concat(V)), (V = []));
    }
    function H(a) {
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
    function K() {
      var a,
        b,
        c =
          (a = 1e3 * ra.waitSeconds) && ca.startTime + a < new Date().getTime(),
        e = [],
        f = [],
        h = !1,
        k = !0;
      if (!pa) {
        pa = !0;
        t(aa, function (a) {
          var d = a.map,
            q = d.id;
          if (a.enabled && (d.isDefine || f.push(a), !a.error))
            if (!a.inited && c) v(q) ? (h = b = !0) : (e.push(q), u(q));
            else if (
              !a.inited &&
              a.fetched &&
              d.isDefine &&
              ((h = !0), !d.prefix)
            )
              return (k = !1);
        });
        if (c && e.length)
          return (
            (a = l("timeout", "Load timeout for modules: " + e, null, e)),
            (a.contextName = ca.contextName),
            x(a)
          );
        k &&
          d(f, function (a) {
            ba(a, {}, {});
          });
        (c && !b) ||
          !h ||
          (!F && !z) ||
          Y ||
          (Y = setTimeout(function () {
            Y = 0;
            K();
          }, 50));
        pa = !1;
      }
    }
    function M(a) {
      m(ja, a[0]) || J(A(a[0], null, !0)).init(a[1], a[2]);
    }
    function Q(a) {
      a = a.currentTarget || a.srcElement;
      var d = ca.onScriptLoad;
      a.detachEvent && !L
        ? a.detachEvent("onreadystatechange", d)
        : a.removeEventListener("load", d, !1);
      d = ca.onScriptError;
      (a.detachEvent && !L) || a.removeEventListener("error", d, !1);
      return { node: a, id: a && a.getAttribute("data-requiremodule") };
    }
    function N() {
      var a;
      for (D(); ma.length;) {
        a = ma.shift();
        if (null === a[0])
          return x(
            l(
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
      xa = 1,
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
                      k.onError !== g
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
                        x((this.error = a))
                      );
                  } else e = f;
                  this.exports = e;
                  if (
                    this.map.isDefine &&
                    !this.ignore &&
                    ((ja[c] = e), k.onResourceLoad)
                  )
                    k.onResourceLoad(ca, this.map, this.depMaps);
                  H(c);
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
        y(
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
                y(
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
                    t(U, function (a) {
                      0 === a.map.id.indexOf(d + "_unnormalized") &&
                        H(a.map.id);
                    });
                    x(a);
                  })),
                  (c.fromText = n(this, function (b, e) {
                    var f = a.name,
                      h = A(f),
                      q = W;
                    e && (b = e);
                    q && (W = !1);
                    J(h);
                    m(ra.config, d) && (ra.config[f] = ra.config[d]);
                    try {
                      k.exec(b);
                    } catch (Fa) {
                      return x(
                        l(
                          "fromtexteval",
                          "fromText eval for " + d + " failed: " + Fa,
                          Fa,
                          [d],
                        ),
                      );
                    }
                    q && (W = !0);
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
              if ((b = h(P, a.id))) {
                this.depExports[d] = b(this);
                return;
              }
              this.depCount += 1;
              y(
                a,
                "defined",
                n(this, function (a) {
                  this.defineDep(d, a);
                  this.check();
                }),
              );
              this.errback && y(a, "error", n(this, this.errback));
            }
            b = a.id;
            c = U[b];
            !m(P, b) && c && !c.enabled && ca.enable(a, this);
          }),
        );
        t(
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
      nextTick: k.nextTick,
      onError: x,
      configure: function (a) {
        a.baseUrl &&
          "/" !== a.baseUrl.charAt(a.baseUrl.length - 1) &&
          (a.baseUrl += "/");
        var b = ra.shim,
          e = { paths: !0, bundles: !0, config: !0, map: !0 };
        t(a, function (a, d) {
          e[d] ? (ra[d] || (ra[d] = {}), r(ra[d], a, !0, !0)) : (ra[d] = a);
        });
        a.bundles &&
          t(a.bundles, function (a, b) {
            d(a, function (a) {
              a !== b && (na[a] = b);
            });
          });
        a.shim &&
          (t(a.shim, function (a, d) {
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
              a.name + "/" + (a.main || "main").replace(I, "").replace(O, "");
          });
        t(U, function (a, d) {
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
            if (b(h)) return x(l("requireargs", "Invalid require call"), q);
            if (a && m(P, e)) return P[e](U[a.id]);
            if (k.get) return k.get(ca, e, a, c);
            g = A(e, a, !1, !0);
            g = g.id;
            return m(ja, g)
              ? ja[g]
              : x(
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
          N();
          ca.nextTick(function () {
            N();
            n = J(A(null, a));
            n.skipMap = d.skipMap;
            n.init(e, h, q, { enabled: !0 });
            K();
          });
          return c;
        }
        d = d || {};
        r(c, {
          isBrowser: F,
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
            return m(ja, A(d, a, !1, !0).id);
          },
          specified: function (d) {
            d = A(d, a, !1, !0).id;
            return m(ja, d) || m(U, d);
          },
        });
        a ||
          (c.undef = function (d) {
            D();
            var b = A(d, a, !0),
              c = h(U, d);
            u(d);
            delete ja[d];
            delete ia[b.url];
            delete sa[d];
            e(ma, function (a, b) {
              a[0] === d && ma.splice(b, 1);
            });
            c && (c.events.defined && (sa[d] = c.events), H(d));
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
        for (D(); ma.length;) {
          b = ma.shift();
          if (null === b[0]) {
            b[0] = a;
            if (d) break;
            d = !0;
          } else b[0] === a && (d = !0);
          M(b);
        }
        b = h(U, a);
        if (!d && !m(ja, a) && b && !b.inited) {
          if (ra.enforceDefine && (!e || !p(e)))
            return v(a)
              ? void 0
              : x(l("nodefine", "No define call for " + a, null, [a]));
          M([a, c.deps || [], c.exportsFn]);
        }
        K();
      },
      nameToUrl: function (a, d, b) {
        var e, f, q;
        (e = h(ra.pkgs, a)) && (a = e);
        if ((e = h(na, a))) return ca.nameToUrl(e, d, b);
        if (k.jsExtRegExp.test(a)) e = a + (d || "");
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
        k.load(ca, a, d);
      },
      execCb: function (a, d, b, c) {
        return d.apply(c, b);
      },
      onScriptLoad: function (a) {
        if (
          "load" === a.type ||
          G.test((a.currentTarget || a.srcElement).readyState)
        )
          ((B = null), (a = Q(a)), ca.completeLoad(a.id));
      },
      onScriptError: function (a) {
        var d = Q(a);
        if (!v(d.id))
          return x(l("scripterror", "Script error for: " + d.id, a, [d.id]));
      },
    };
    ca.require = ca.makeRequire();
    return ca;
  }
  var k,
    q,
    u,
    v,
    A,
    C,
    B,
    J,
    D,
    y,
    H = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,
    N = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
    O = /\.js$/,
    I = /^\.\//;
  q = Object.prototype;
  var x = q.toString,
    K = q.hasOwnProperty,
    E = Array.prototype.splice,
    F = !(
      "undefined" === typeof window ||
      "undefined" === typeof navigator ||
      !window.document
    ),
    z = !F && "undefined" !== typeof importScripts,
    G =
      F && "PLAYSTATION 3" === navigator.platform
        ? /^complete$/
        : /^(complete|loaded)$/,
    L = "undefined" !== typeof opera && "[object Opera]" === opera.toString(),
    M = {},
    Q = {},
    V = [],
    W = !1;
  if ("undefined" === typeof define) {
    if ("undefined" !== typeof requirejs) {
      if (b(requirejs)) return;
      Q = requirejs;
      requirejs = void 0;
    }
    "undefined" !== typeof require &&
      !b(require) &&
      ((Q = require), (require = void 0));
    k = requirejs = function (a, d, b, e) {
      var f,
        q = "_";
      !c(a) &&
        "string" !== typeof a &&
        ((f = a), c(d) ? ((a = d), (d = b), (b = e)) : (a = []));
      f && f.context && (q = f.context);
      (e = h(M, q)) || (e = M[q] = k.s.newContext(q));
      f && e.configure(f);
      return e.require(a, d, b);
    };
    k.config = function (a) {
      return k(a);
    };
    k.nextTick =
      "undefined" !== typeof setTimeout
        ? function (a) {
            setTimeout(a, 4);
          }
        : function (a) {
            a();
          };
    require || (require = k);
    k.version = "2.1.11";
    k.jsExtRegExp = /^\/|:|\?|\.js$/;
    k.isBrowser = F;
    q = k.s = { contexts: M, newContext: f };
    k({});
    d(["toUrl", "undef", "defined", "specified"], function (a) {
      k[a] = function () {
        var d = M._;
        return d.require[a].apply(d, arguments);
      };
    });
    F &&
      ((u = q.head = document.getElementsByTagName("head")[0]),
      (v = document.getElementsByTagName("base")[0])) &&
      (u = q.head = v.parentNode);
    k.onError = g;
    k.createNode = function (a) {
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
    k.load = function (a, d, b) {
      var c = (a && a.config) || {};
      if (F)
        return (
          (c = k.createNode(c, d, b)),
          c.setAttribute("data-requirecontext", a.contextName),
          c.setAttribute("data-requiremodule", d),
          !c.attachEvent ||
          (c.attachEvent.toString &&
            0 > c.attachEvent.toString().indexOf("[native code")) ||
          L
            ? (c.addEventListener("load", a.onScriptLoad, !1),
              c.addEventListener("error", a.onScriptError, !1))
            : ((W = !0), c.attachEvent("onreadystatechange", a.onScriptLoad)),
          (c.src = b),
          (J = c),
          v ? u.insertBefore(c, v) : u.appendChild(c),
          (J = null),
          c
        );
      if (z)
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
    F &&
      !Q.skipDataMain &&
      e(document.getElementsByTagName("script"), function (a) {
        u || (u = a.parentNode);
        if ((A = a.getAttribute("data-main")))
          return (
            (D = A),
            Q.baseUrl ||
              ((C = D.split("/")),
              (D = C.pop()),
              (y = C.length ? C.join("/") + "/" : "./"),
              (Q.baseUrl = y)),
            (D = D.replace(O, "")),
            k.jsExtRegExp.test(D) && (D = A),
            (Q.deps = Q.deps ? Q.deps.concat(D) : [D]),
            !0
          );
      });
    define = function (a, d, f) {
      var h, k;
      "string" !== typeof a && ((f = d), (d = a), (a = null));
      c(d) || ((f = d), (d = null));
      !d &&
        b(f) &&
        ((d = []),
        f.length &&
          (f
            .toString()
            .replace(H, "")
            .replace(N, function (a, b) {
              d.push(b);
            }),
          (d = (
            1 === f.length ? ["require"] : ["require", "exports", "module"]
          ).concat(d))));
      W &&
        ((h = J) ||
          ((B && "interactive" === B.readyState) ||
            e(document.getElementsByTagName("script"), function (a) {
              if ("interactive" === a.readyState) return (B = a);
            }),
          (h = B)),
        h &&
          (a || (a = h.getAttribute("data-requiremodule")),
          (k = M[h.getAttribute("data-requirecontext")])));
      (k ? k.defQueue : V).push([a, d, f]);
    };
    define.amd = { jQuery: !0 };
    k.exec = function (a) {
      return eval(a);
    };
    k(Q);
  }
})(this);
var wybt = "\u4ed9\u5883\u7684\u4f20\u8bf4";
