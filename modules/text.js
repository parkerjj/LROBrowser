define("text", ["module"], function (a) {
  var b,
    c,
    d,
    e,
    m,
    h = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"],
    r = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
    q = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
    k = "undefined" !== typeof location && location.href,
    g = k && location.protocol && location.protocol.replace(/\:/, ""),
    t = k && location.hostname,
    l = k && (location.port || void 0),
    f = {},
    n = (a.config && a.config()) || {};
  b = {
    version: "2.0.10",
    strip: function (a) {
      if (a) {
        a = a.replace(r, "");
        var d = a.match(q);
        d && (a = d[1]);
      } else a = "";
      return a;
    },
    jsEscape: function (a) {
      return a
        .replace(/(['\\])/g, "\\$1")
        .replace(/[\f]/g, "\\f")
        .replace(/[\b]/g, "\\b")
        .replace(/[\n]/g, "\\n")
        .replace(/[\t]/g, "\\t")
        .replace(/[\r]/g, "\\r")
        .replace(/[\u2028]/g, "\\u2028")
        .replace(/[\u2029]/g, "\\u2029");
    },
    createXhr:
      n.createXhr ||
      function () {
        var a, d, b;
        if ("undefined" !== typeof XMLHttpRequest) return new XMLHttpRequest();
        if ("undefined" !== typeof ActiveXObject)
          for (d = 0; 3 > d; d += 1) {
            b = h[d];
            try {
              a = new ActiveXObject(b);
            } catch (A) {}
            if (a) {
              h = [b];
              break;
            }
          }
        return a;
      },
    parseName: function (a) {
      var d,
        b,
        c = !1,
        e = a.indexOf(".");
      d = 0 === a.indexOf("./") || 0 === a.indexOf("../");
      -1 !== e && (!d || 1 < e)
        ? ((d = a.substring(0, e)), (b = a.substring(e + 1, a.length)))
        : (d = a);
      a = b || d;
      e = a.indexOf("!");
      -1 !== e &&
        ((c = "strip" === a.substring(e + 1)),
        (a = a.substring(0, e)),
        b ? (b = a) : (d = a));
      return { moduleName: d, ext: b, strip: c };
    },
    xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,
    useXhr: function (a, d, c, e) {
      var f, h;
      f = b.xdRegExp.exec(a);
      if (!f) return !0;
      a = f[2];
      f = f[3];
      f = f.split(":");
      h = f[1];
      f = f[0];
      return (
        (!a || a === d) &&
        (!f || f.toLowerCase() === c.toLowerCase()) &&
        ((!h && !f) || h === e)
      );
    },
    finishLoad: function (a, d, c, e) {
      c = d ? b.strip(c) : c;
      n.isBuild && (f[a] = c);
      e(c);
    },
    load: function (a, d, c, e) {
      if (e.isBuild && !e.inlineText) c();
      else {
        n.isBuild = e.isBuild;
        var f = b.parseName(a);
        e = f.moduleName + (f.ext ? "." + f.ext : "");
        var h = d.toUrl(e),
          p = n.useXhr || b.useXhr;
        0 === h.indexOf("empty:")
          ? c()
          : !k || p(h, g, t, l)
            ? b.get(
                h,
                function (d) {
                  b.finishLoad(a, f.strip, d, c);
                },
                function (a) {
                  c.error && c.error(a);
                },
              )
            : d([e], function (a) {
                b.finishLoad(f.moduleName + "." + f.ext, f.strip, a, c);
              });
      }
    },
    write: function (a, d, c, e) {
      f.hasOwnProperty(d) &&
        ((e = b.jsEscape(f[d])),
        c.asModule(
          a + "!" + d,
          "define(function () { return '" + e + "';});\n",
        ));
    },
    writeFile: function (a, d, c, e, f) {
      d = b.parseName(d);
      var h = d.ext ? "." + d.ext : "",
        n = d.moduleName + h,
        p = c.toUrl(d.moduleName + h) + ".js";
      b.load(
        n,
        c,
        function (d) {
          d = function (a) {
            return e(p, a);
          };
          d.asModule = function (a, d) {
            return e.asModule(a, p, d);
          };
          b.write(a, n, d, f);
        },
        f,
      );
    },
  };
  if (
    "node" === n.env ||
    (!n.env &&
      "undefined" !== typeof process &&
      process.versions &&
      process.versions.node &&
      !process.versions["node-webkit"])
  )
    ((c = require.nodeRequire("fs")),
      (b.get = function (a, d, b) {
        try {
          var e = c.readFileSync(a, "utf8");
          0 === e.indexOf("\ufeff") && (e = e.substring(1));
          d(e);
        } catch (D) {
          b(D);
        }
      }));
  else if ("xhr" === n.env || (!n.env && b.createXhr()))
    b.get = function (a, d, c, e) {
      var f = b.createXhr(),
        h;
      f.open("GET", a, !0);
      if (e)
        for (h in e)
          e.hasOwnProperty(h) && f.setRequestHeader(h.toLowerCase(), e[h]);
      if (n.onXhr) n.onXhr(f, a);
      f.onreadystatechange = function (b) {
        if (
          4 === f.readyState &&
          ((b = f.status),
          399 < b && 600 > b
            ? ((b = Error(a + " HTTP status: " + b)), (b.xhr = f), c(b))
            : d(f.responseText),
          n.onXhrComplete)
        )
          n.onXhrComplete(f, a);
      };
      f.send(null);
    };
  else if (
    "rhino" === n.env ||
    (!n.env && "undefined" !== typeof Packages && "undefined" !== typeof java)
  )
    b.get = function (a, d) {
      var b,
        c,
        e = new java.io.File(a);
      a = java.lang.System.getProperty("line.separator");
      var e = new java.io.BufferedReader(
          new java.io.InputStreamReader(
            new java.io.FileInputStream(e),
            "utf-8",
          ),
        ),
        f = "";
      try {
        b = new java.lang.StringBuffer();
        (c = e.readLine()) &&
          c.length() &&
          65279 === c.charAt(0) &&
          (c = c.substring(1));
        for (null !== c && b.append(c); null !== (c = e.readLine());)
          (b.append(a), b.append(c));
        f = String(b.toString());
      } finally {
        e.close();
      }
      d(f);
    };
  else if (
    "xpconnect" === n.env ||
    (!n.env &&
      "undefined" !== typeof Components &&
      Components.classes &&
      Components.interfaces)
  )
    ((d = Components.classes),
      (e = Components.interfaces),
      Components.utils["import"]("resource://gre/modules/FileUtils.jsm"),
      (m = "@mozilla.org/windows-registry-key;1" in d),
      (b.get = function (a, b) {
        var c,
          f,
          h = {};
        m && (a = a.replace(/\//g, "\\"));
        a = new FileUtils.File(a);
        try {
          ((c = d["@mozilla.org/network/file-input-stream;1"].createInstance(
            e.nsIFileInputStream,
          )),
            c.init(a, 1, 0, !1),
            (f = d["@mozilla.org/intl/converter-input-stream;1"].createInstance(
              e.nsIConverterInputStream,
            )),
            f.init(
              c,
              "utf-8",
              c.available(),
              e.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER,
            ),
            f.readString(c.available(), h),
            f.close(),
            c.close(),
            b(h.value));
        } catch (B) {
          throw Error(((a && a.path) || "") + ": " + B);
        }
      }));
  return b;
});
