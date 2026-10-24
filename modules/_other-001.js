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
    return M.call(a, d);
  }
  function h(a, d) {
    return m(a, d) && a[d];
  }
  function r(a, d) {
    for (var b in a) if (m(a, b) && d(a[b], b)) break;
  }
  function q(a, d, e, f) {
    d &&
      r(d, function (d, h) {
        if (e || !m(a, h))
          !f ||
          "object" !== typeof d ||
          !d ||
          c(d) ||
          b(d) ||
          d instanceof RegExp
            ? (a[h] = d)
            : (a[h] || (a[h] = {}), q(a[h], d, e, f));
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
  function t(b) {
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
        k = ra.map,
        u = k && k["*"];
      if (a && "." === a.charAt(0))
        if (d) {
          e = l.slice(0, l.length - 1);
          a = a.split("/");
          d = a.length - 1;
          ra.nodeIdCompat && I.test(a[d]) && (a[d] = a[d].replace(I, ""));
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
      if (b && k && (l || u)) {
        e = a.split("/");
        d = e.length;
        a: for (; 0 < d; --d) {
          n = e.slice(0, d).join("/");
          if (l)
            for (f = l.length; 0 < f; --f)
              if ((b = h(k, l.slice(0, f).join("/"))))
                if ((b = h(b, n))) {
                  c = b;
                  p = d;
                  break a;
                }
          !g && u && h(u, n) && ((g = h(u, n)), (m = d));
        }
        !c && g && ((c = g), (p = m));
        c && (e.splice(0, p, c), (a = e.join("/")));
      }
      return (c = h(ra.pkgs, a)) ? c : a;
    }
    function u(a) {
      F &&
        d(document.getElementsByTagName("script"), function (d) {
          if (
            d.getAttribute("data-requiremodule") === a &&
            d.getAttribute("data-requirecontext") === ba.contextName
          )
            return (d.parentNode.removeChild(d), !0);
        });
    }
    function v(a) {
      var d = h(ra.paths, a);
      if (d && c(d) && 1 < d.length)
        return (d.shift(), ba.require.undef(a), ba.require([a]), !0);
    }
    function A(a) {
      var d,
        b = a ? a.indexOf("!") : -1;
      -1 < b && ((d = a.substring(0, b)), (a = a.substring(b + 1, a.length)));
      return [d, a];
    }
    function D(a, d, b, c) {
      var e,
        f,
        n = null,
        g = d ? d.name : null,
        m = a,
        l = !0,
        k = "";
      a || ((l = !1), (a = "_@r" + (xa += 1)));
      a = A(a);
      n = a[0];
      a = a[1];
      n && ((n = p(n, g, c)), (f = h(ja, n)));
      a &&
        (n
          ? (k =
              f && f.normalize
                ? f.normalize(a, function (a) {
                    return p(a, g, c);
                  })
                : p(a, g, c))
          : ((k = p(a, g, c)),
            (a = A(k)),
            (n = a[0]),
            (k = a[1]),
            (b = !0),
            (e = ba.nameToUrl(k))));
      b = !n || f || b ? "" : "_unnormalized" + (ua += 1);
      return {
        prefix: n,
        name: k,
        parentMap: d,
        unnormalized: !!b,
        url: e,
        originalName: m,
        isDefine: l,
        id: (n ? n + "!" + k : k) + b,
      };
    }
    function O(a) {
      var d = a.id,
        b = h(W, d);
      b || (b = W[d] = new ba.Module(a));
      return b;
    }
    function z(a, d, b) {
      var c = a.id,
        e = h(W, c);
      if (!m(ja, c) || (e && !e.defineEmitComplete))
        if (((e = O(a)), e.error && "error" === d)) b(e.error);
        else e.on(d, b);
      else "defined" === d && b(ja[c]);
    }
    function y(a, b) {
      var c = a.requireModules,
        e = !1;
      if (b) b(a);
      else if (
        (d(c, function (d) {
          if ((d = h(W, d)))
            ((d.error = a), d.events.error && ((e = !0), d.emit("error", a)));
        }),
        !e)
      )
        n.onError(a);
    }
    function x() {
      S.length && (E.apply(ma, [ma.length, 0].concat(S)), (S = []));
    }
    function C(a) {
      delete W[a];
      delete aa[a];
    }
    function ea(a, b, c) {
      var e = a.map.id;
      a.error
        ? a.emit("error", a.error)
        : ((b[e] = !0),
          d(a.depMaps, function (d, e) {
            d = d.id;
            var f = h(W, d);
            f &&
              !a.depMatched[e] &&
              !c[d] &&
              (h(b, d) ? (a.defineDep(e, ja[d]), a.check()) : ea(f, b, c));
          }),
          (c[e] = !0));
    }
    function J() {
      var a,
        b,
        c =
          (a = 1e3 * ra.waitSeconds) && ba.startTime + a < new Date().getTime(),
        e = [],
        f = [],
        h = !1,
        n = !0;
      if (!pa) {
        pa = !0;
        r(aa, function (a) {
          var d = a.map,
            p = d.id;
          if (a.enabled && (d.isDefine || f.push(a), !a.error))
            if (!a.inited && c) v(p) ? (h = b = !0) : (e.push(p), u(p));
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
            (a.contextName = ba.contextName),
            y(a)
          );
        n &&
          d(f, function (a) {
            ea(a, {}, {});
          });
        (c && !b) ||
          !h ||
          (!F && !G) ||
          Y ||
          (Y = setTimeout(function () {
            Y = 0;
            J();
          }, 50));
        pa = !1;
      }
    }
    function N(a) {
      m(ja, a[0]) || O(D(a[0], null, !0)).init(a[1], a[2]);
    }
    function P(a) {
      a = a.currentTarget || a.srcElement;
      var d = ba.onScriptLoad;
      a.detachEvent && !K
        ? a.detachEvent("onreadystatechange", d)
        : a.removeEventListener("load", d, !1);
      d = ba.onScriptError;
      (a.detachEvent && !K) || a.removeEventListener("error", d, !1);
      return { node: a, id: a && a.getAttribute("data-requiremodule") };
    }
    function M() {
      var a;
      for (x(); ma.length;) {
        a = ma.shift();
        if (null === a[0])
          return y(
            l(
              "mismatch",
              "Mismatched anonymous define() module: " + a[a.length - 1],
            ),
          );
        N(a);
      }
    }
    var pa,
      w,
      ba,
      Q,
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
      W = {},
      aa = {},
      sa = {},
      ma = [],
      ja = {},
      ia = {},
      na = {},
      xa = 1,
      ua = 1;
    Q = {
      require: function (a) {
        return a.require ? a.require : (a.require = ba.makeRequire(a.map));
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
          ba.startTime = new Date().getTime();
          var a = this.map;
          if (this.shim)
            ba.makeRequire(this.map, { enableBuildCallback: !0 })(
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
        ia[a] || ((ia[a] = !0), ba.load(this.map.id, a));
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
                        e = ba.execCb(c, f, d, e);
                      } catch (Ja) {
                        a = Ja;
                      }
                    else e = ba.execCb(c, f, d, e);
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
                        y((this.error = a))
                      );
                  } else e = f;
                  this.exports = e;
                  if (
                    this.map.isDefine &&
                    !this.ignore &&
                    ((ja[c] = e), n.onResourceLoad)
                  )
                    n.onResourceLoad(ba, this.map, this.depMaps);
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
          b = D(a.prefix);
        this.depMaps.push(b);
        z(
          b,
          "defined",
          k(this, function (b) {
            var c, e;
            e = h(na, this.map.id);
            var f = this.map.name,
              g = this.map.parentMap ? this.map.parentMap.name : null,
              u = ba.makeRequire(a.parentMap, { enableBuildCallback: !0 });
            if (this.map.unnormalized) {
              if (
                (b.normalize &&
                  (f =
                    b.normalize(f, function (a) {
                      return p(a, g, !0);
                    }) || ""),
                (b = D(a.prefix + "!" + f, this.map.parentMap)),
                z(
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
                (e = h(W, b.id)))
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
                ? ((this.map.url = ba.nameToUrl(e)), this.load())
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
                    r(W, function (a) {
                      0 === a.map.id.indexOf(d + "_unnormalized") &&
                        C(a.map.id);
                    });
                    y(a);
                  })),
                  (c.fromText = k(this, function (b, e) {
                    var f = a.name,
                      h = D(f),
                      p = R;
                    e && (b = e);
                    p && (R = !1);
                    O(h);
                    m(ra.config, d) && (ra.config[f] = ra.config[d]);
                    try {
                      n.exec(b);
                    } catch (Da) {
                      return y(
                        l(
                          "fromtexteval",
                          "fromText eval for " + d + " failed: " + Da,
                          Da,
                          [d],
                        ),
                      );
                    }
                    p && (R = !0);
                    this.depMaps.push(h);
                    ba.completeLoad(f);
                    u([f], c);
                  })),
                  b.load(a.name, u, c, ra));
          }),
        );
        ba.enable(b, this);
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
              a = D(
                a,
                this.map.isDefine ? this.map : this.map.parentMap,
                !1,
                !this.skipMap,
              );
              this.depMaps[d] = a;
              if ((b = h(Q, a.id))) {
                this.depExports[d] = b(this);
                return;
              }
              this.depCount += 1;
              z(
                a,
                "defined",
                k(this, function (a) {
                  this.defineDep(d, a);
                  this.check();
                }),
              );
              this.errback && z(a, "error", k(this, this.errback));
            }
            b = a.id;
            c = W[b];
            !m(Q, b) && c && !c.enabled && ba.enable(a, this);
          }),
        );
        r(
          this.pluginMaps,
          k(this, function (a) {
            var d = h(W, a.id);
            d && !d.enabled && ba.enable(a, this);
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
    ba = {
      config: ra,
      contextName: f,
      registry: W,
      defined: ja,
      urlFetched: ia,
      defQueue: ma,
      Module: w,
      makeModuleMap: D,
      nextTick: n.nextTick,
      onError: y,
      configure: function (a) {
        a.baseUrl &&
          "/" !== a.baseUrl.charAt(a.baseUrl.length - 1) &&
          (a.baseUrl += "/");
        var b = ra.shim,
          e = { paths: !0, bundles: !0, config: !0, map: !0 };
        r(a, function (a, d) {
          e[d] ? (ra[d] || (ra[d] = {}), q(ra[d], a, !0, !0)) : (ra[d] = a);
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
              (a.exportsFn = ba.makeShimExports(a));
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
              a.name + "/" + (a.main || "main").replace(L, "").replace(I, "");
          });
        r(W, function (a, d) {
          a.inited || a.map.unnormalized || (a.map = D(d));
        });
        (a.deps || a.callback) && ba.require(a.deps || [], a.callback);
      },
      makeShimExports: function (d) {
        return function () {
          var b;
          d.init && (b = d.init.apply(a, arguments));
          return b || (d.exports && t(d.exports));
        };
      },
      makeRequire: function (a, d) {
        function c(e, h, p) {
          var g, k;
          d.enableBuildCallback && h && b(h) && (h.__requireJsBuild = !0);
          if ("string" === typeof e) {
            if (b(h)) return y(l("requireargs", "Invalid require call"), p);
            if (a && m(Q, e)) return Q[e](W[a.id]);
            if (n.get) return n.get(ba, e, a, c);
            g = D(e, a, !1, !0);
            g = g.id;
            return m(ja, g)
              ? ja[g]
              : y(
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
          M();
          ba.nextTick(function () {
            M();
            k = O(D(null, a));
            k.skipMap = d.skipMap;
            k.init(e, h, p, { enabled: !0 });
            J();
          });
          return c;
        }
        d = d || {};
        q(c, {
          isBrowser: F,
          toUrl: function (d) {
            var b,
              c = d.lastIndexOf("."),
              e = d.split("/")[0];
            -1 !== c &&
              (("." !== e && ".." !== e) || 1 < c) &&
              ((b = d.substring(c, d.length)), (d = d.substring(0, c)));
            return ba.nameToUrl(p(d, a && a.id, !0), b, !0);
          },
          defined: function (d) {
            return m(ja, D(d, a, !1, !0).id);
          },
          specified: function (d) {
            d = D(d, a, !1, !0).id;
            return m(ja, d) || m(W, d);
          },
        });
        a ||
          (c.undef = function (d) {
            x();
            var b = D(d, a, !0),
              c = h(W, d);
            u(d);
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
        h(W, a.id) && O(a).enable();
      },
      completeLoad: function (a) {
        var d,
          b,
          c = h(ra.shim, a) || {},
          e = c.exports;
        for (x(); ma.length;) {
          b = ma.shift();
          if (null === b[0]) {
            b[0] = a;
            if (d) break;
            d = !0;
          } else b[0] === a && (d = !0);
          N(b);
        }
        b = h(W, a);
        if (!d && !m(ja, a) && b && !b.inited) {
          if (ra.enforceDefine && (!e || !t(e)))
            return v(a)
              ? void 0
              : y(l("nodefine", "No define call for " + a, null, [a]));
          N([a, c.deps || [], c.exportsFn]);
        }
        J();
      },
      nameToUrl: function (a, d, b) {
        var e, f, p;
        (e = h(ra.pkgs, a)) && (a = e);
        if ((e = h(na, a))) return ba.nameToUrl(e, d, b);
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
        n.load(ba, a, d);
      },
      execCb: function (a, d, b, c) {
        return d.apply(c, b);
      },
      onScriptLoad: function (a) {
        if (
          "load" === a.type ||
          H.test((a.currentTarget || a.srcElement).readyState)
        )
          ((B = null), (a = P(a)), ba.completeLoad(a.id));
      },
      onScriptError: function (a) {
        var d = P(a);
        if (!v(d.id))
          return y(l("scripterror", "Script error for: " + d.id, a, [d.id]));
      },
    };
    ba.require = ba.makeRequire();
    return ba;
  }
  var n,
    p,
    v,
    u,
    A,
    D,
    B,
    O,
    C,
    y,
    z = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,
    J = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
    I = /\.js$/,
    L = /^\.\//;
  p = Object.prototype;
  var x = p.toString,
    M = p.hasOwnProperty,
    E = Array.prototype.splice,
    F = !(
      "undefined" === typeof window ||
      "undefined" === typeof navigator ||
      !window.document
    ),
    G = !F && "undefined" !== typeof importScripts,
    H =
      F && "PLAYSTATION 3" === navigator.platform
        ? /^complete$/
        : /^(complete|loaded)$/,
    K = "undefined" !== typeof opera && "[object Opera]" === opera.toString(),
    P = {},
    N = {},
    S = [],
    R = !1;
  if ("undefined" === typeof define) {
    if ("undefined" !== typeof requirejs) {
      if (b(requirejs)) return;
      N = requirejs;
      requirejs = void 0;
    }
    "undefined" !== typeof require &&
      !b(require) &&
      ((N = require), (require = void 0));
    n = requirejs = function (a, d, b, e) {
      var f,
        p = "_";
      !c(a) &&
        "string" !== typeof a &&
        ((f = a), c(d) ? ((a = d), (d = b), (b = e)) : (a = []));
      f && f.context && (p = f.context);
      (e = h(P, p)) || (e = P[p] = n.s.newContext(p));
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
    n.isBrowser = F;
    p = n.s = { contexts: P, newContext: f };
    n({});
    d(["toUrl", "undef", "defined", "specified"], function (a) {
      n[a] = function () {
        var d = P._;
        return d.require[a].apply(d, arguments);
      };
    });
    F &&
      ((v = p.head = document.getElementsByTagName("head")[0]),
      (u = document.getElementsByTagName("base")[0])) &&
      (v = p.head = u.parentNode);
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
      if (F)
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
            : ((R = !0), c.attachEvent("onreadystatechange", a.onScriptLoad)),
          (c.src = b),
          (O = c),
          u ? v.insertBefore(c, u) : v.appendChild(c),
          (O = null),
          c
        );
      if (G)
        try {
          (importScripts(b), a.completeLoad(d));
        } catch (T) {
          a.onError(
            l(
              "importscripts",
              "importScripts failed for " + d + " at " + b,
              T,
              [d],
            ),
          );
        }
    };
    F &&
      !N.skipDataMain &&
      e(document.getElementsByTagName("script"), function (a) {
        v || (v = a.parentNode);
        if ((A = a.getAttribute("data-main")))
          return (
            (C = A),
            N.baseUrl ||
              ((D = C.split("/")),
              (C = D.pop()),
              (y = D.length ? D.join("/") + "/" : "./"),
              (N.baseUrl = y)),
            (C = C.replace(I, "")),
            n.jsExtRegExp.test(C) && (C = A),
            (N.deps = N.deps ? N.deps.concat(C) : [C]),
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
            .replace(z, "")
            .replace(J, function (a, b) {
              d.push(b);
            }),
          (d = (
            1 === f.length ? ["require"] : ["require", "exports", "module"]
          ).concat(d))));
      R &&
        ((h = O) ||
          ((B && "interactive" === B.readyState) ||
            e(document.getElementsByTagName("script"), function (a) {
              if ("interactive" === a.readyState) return (B = a);
            }),
          (h = B)),
        h &&
          (a || (a = h.getAttribute("data-requiremodule")),
          (n = P[h.getAttribute("data-requirecontext")])));
      (n ? n.defQueue : S).push([a, d, f]);
    };
    define.amd = { jQuery: !0 };
    n.exec = function (a) {
      return eval(a);
    };
    n(N);
  }
})(this);
var wybt = "\u4ed9\u5883\u7684\u4f20\u8bf4";
