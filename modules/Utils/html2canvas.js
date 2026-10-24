define("Utils/html2canvas", [], function () {
  var a;
  (function (b, c, d) {
    function e(a) {
      h.logging && b.console && b.console.log && b.console.log(a);
    }
    function m(a, b) {
      var c = [];
      return {
        storage: c,
        width: a,
        height: b,
        fillRect: function () {
          c.push({ type: "function", name: "fillRect", arguments: arguments });
        },
        drawShape: function () {
          var a = [];
          c.push({ type: "function", name: "drawShape", arguments: a });
          return {
            moveTo: function () {
              a.push({ name: "moveTo", arguments: arguments });
            },
            lineTo: function () {
              a.push({ name: "lineTo", arguments: arguments });
            },
            bezierCurveTo: function () {
              a.push({ name: "bezierCurveTo", arguments: arguments });
            },
            quadraticCurveTo: function () {
              a.push({ name: "quadraticCurveTo", arguments: arguments });
            },
          };
        },
        drawImage: function () {
          c.push({ type: "function", name: "drawImage", arguments: arguments });
        },
        fillText: function () {
          c.push({ type: "function", name: "fillText", arguments: arguments });
        },
        setVariable: function (a, b) {
          c.push({ type: "variable", name: a, arguments: b });
        },
      };
    }
    var h = {},
      r;
    h.Util = {};
    h.Util.backgroundImage = function (a) {
      if (
        /data:image\/.*;base64,/i.test(a) ||
        /^(-webkit|-moz|linear-gradient|-o-)/.test(a)
      )
        return a;
      'url("' === a.toLowerCase().substr(0, 5)
        ? ((a = a.substr(5)), (a = a.substr(0, a.length - 2)))
        : ((a = a.substr(4)), (a = a.substr(0, a.length - 1)));
      return a;
    };
    h.Util.Bounds = function (a) {
      var b = {};
      if (a.getBoundingClientRect)
        return (
          (a = a.getBoundingClientRect()),
          (b.top = a.top),
          (b.bottom = a.bottom || a.top + a.height),
          (b.left = a.left),
          (b.width = a.width || a.right - a.left),
          (b.height = a.height || a.bottom - a.top),
          b
        );
    };
    h.Util.getCSS = function (a, e) {
      function g(b, c) {
        var d = a.runtimeStyle && a.runtimeStyle[b],
          f,
          e = a.style;
        !/^-?[0-9]+\.?[0-9]*(?:px)?$/i.test(c) &&
          /^-?\d/.test(c) &&
          ((f = e.left),
          d && (a.runtimeStyle.left = a.currentStyle.left),
          (e.left = "fontSize" === b ? "1em" : c || 0),
          (c = e.pixelLeft + "px"),
          (e.left = f),
          d && (a.runtimeStyle.left = d));
        return /^(thin|medium|thick)$/i.test(c)
          ? c
          : Math.round(parseFloat(c)) + "px";
      }
      var k;
      if (b.getComputedStyle)
        (void 0 !== a && (r = c.defaultView.getComputedStyle(a, null)),
          (k = r[e]),
          "backgroundPosition" === e
            ? ((k = (k.split(",")[0] || "0 0").split(" ")),
              (k[0] = -1 === k[0].indexOf("%") ? g(e + "X", k[0]) : k[0]),
              (k[1] = k[1] === d ? k[0] : k[1]),
              (k[1] = -1 === k[1].indexOf("%") ? g(e + "Y", k[1]) : k[1]))
            : /border(Top|Bottom)(Left|Right)Radius/.test(e) &&
              ((e = k.split(" ")),
              1 >= e.length && (e[1] = e[0]),
              (e[0] = parseInt(e[0], 10)),
              (e[1] = parseInt(e[1], 10)),
              (k = e)));
      else if (a.currentStyle)
        if ("backgroundPosition" === e)
          k = [
            g(e + "X", a.currentStyle[e + "X"]),
            g(e + "Y", a.currentStyle[e + "Y"]),
          ];
        else if (
          ((k = g(e, a.currentStyle[e])),
          /^(border)/i.test(e) && /^(medium|thin|thick)$/i.test(k))
        )
          switch (k) {
            case "thin":
              k = "1px";
              break;
            case "medium":
              k = "0px";
              break;
            case "thick":
              k = "5px";
          }
      return k;
    };
    h.Util.BackgroundPosition = function (a, b, c) {
      a = h.Util.getCSS(a, "backgroundPosition");
      var d, e;
      1 === a.length && ((d = a), (a = []), (a[0] = d), (a[1] = d));
      -1 !== a[0].toString().indexOf("%")
        ? ((e = parseFloat(a[0]) / 100), (d = b.width * e - c.width * e))
        : (d = parseInt(a[0], 10));
      -1 !== a[1].toString().indexOf("%")
        ? ((e = parseFloat(a[1]) / 100), (b = b.height * e - c.height * e))
        : (b = parseInt(a[1], 10));
      return { top: b, left: d };
    };
    h.Util.Extend = function (a, b) {
      for (var c in a) a.hasOwnProperty(c) && (b[c] = a[c]);
      return b;
    };
    h.Util.Children = function (a) {
      var b;
      try {
        var c;
        if (a.nodeName && "IFRAME" === a.nodeName.toUpperCase())
          c = a.contentDocument || a.contentWindow.document;
        else {
          var t = a.childNodes;
          a = [];
          if (null !== t) {
            var l = a.length,
              f = 0;
            if ("number" === typeof t.length)
              for (var n = t.length; f < n; f++) a[l++] = t[f];
            else for (; t[f] !== d;) a[l++] = t[f++];
            a.length = l;
          }
          c = a;
        }
        b = c;
      } catch (p) {
        (e("html2canvas.Util.Children failed with exception: " + p.message),
          (b = []));
      }
      return b;
    };
    (function () {
      h.Generate = {};
      var a = [
        /^(-webkit-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,
        /^(-o-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,
        /^(-webkit-gradient)\((linear|radial),\s((?:\d{1,3}%?)\s(?:\d{1,3}%?),\s(?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)-]+)\)$/,
        /^(-moz-linear-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)]+)\)$/,
        /^(-webkit-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z-]+)([\w\d\.\s,%\(\)]+)\)$/,
        /^(-moz-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s?([a-z-]*)([\w\d\.\s,%\(\)]+)\)$/,
        /^(-o-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z-]+)([\w\d\.\s,%\(\)]+)\)$/,
      ];
      h.Generate.parseGradient = function (b, c) {
        var d,
          e,
          f = a.length,
          g,
          k,
          h;
        for (e = 0; e < f && !(g = b.match(a[e])); e += 1);
        if (g)
          switch (g[1]) {
            case "-webkit-linear-gradient":
            case "-o-linear-gradient":
              d = {
                type: "linear",
                x0: null,
                y0: null,
                x1: null,
                y1: null,
                colorStops: [],
              };
              if ((b = g[2].match(/\w+/g)))
                for (f = b.length, e = 0; e < f; e += 1)
                  switch (b[e]) {
                    case "top":
                      d.y0 = 0;
                      d.y1 = c.height;
                      break;
                    case "right":
                      d.x0 = c.width;
                      d.x1 = 0;
                      break;
                    case "bottom":
                      d.y0 = c.height;
                      d.y1 = 0;
                      break;
                    case "left":
                      ((d.x0 = 0), (d.x1 = c.width));
                  }
              null === d.x0 && null === d.x1 && (d.x0 = d.x1 = c.width / 2);
              null === d.y0 && null === d.y1 && (d.y0 = d.y1 = c.height / 2);
              if (
                (b = g[3].match(
                  /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g,
                ))
              )
                for (
                  f = b.length, k = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((h = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/,
                  )),
                    h[2]
                      ? ((g = parseFloat(h[2])),
                        (g = "%" === h[3] ? g / 100 : g / c.width))
                      : (g = e * k),
                    d.colorStops.push({ color: h[1], stop: g }));
              break;
            case "-webkit-gradient":
              d = {
                type: "radial" === g[2] ? "circle" : g[2],
                x0: 0,
                y0: 0,
                x1: 0,
                y1: 0,
                colorStops: [],
              };
              if (
                (b = g[3].match(
                  /(\d{1,3})%?\s(\d{1,3})%?,\s(\d{1,3})%?\s(\d{1,3})%?/,
                ))
              )
                ((d.x0 = (b[1] * c.width) / 100),
                  (d.y0 = (b[2] * c.height) / 100),
                  (d.x1 = (b[3] * c.width) / 100),
                  (d.y1 = (b[4] * c.height) / 100));
              if (
                (b = g[4].match(
                  /((?:from|to|color-stop)\((?:[0-9\.]+,\s)?(?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)\))+/g,
                ))
              )
                for (f = b.length, e = 0; e < f; e += 1)
                  ((h = b[e].match(
                    /(from|to|color-stop)\(([0-9\.]+)?(?:,\s)?((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\)/,
                  )),
                    (g = parseFloat(h[2])),
                    "from" === h[1] && (g = 0),
                    "to" === h[1] && (g = 1),
                    d.colorStops.push({ color: h[3], stop: g }));
              break;
            case "-moz-linear-gradient":
              d = {
                type: "linear",
                x0: 0,
                y0: 0,
                x1: 0,
                y1: 0,
                colorStops: [],
              };
              if ((b = g[2].match(/(\d{1,3})%?\s(\d{1,3})%?/)))
                ((d.x0 = (b[1] * c.width) / 100),
                  (d.y0 = (b[2] * c.height) / 100),
                  (d.x1 = c.width - d.x0),
                  (d.y1 = c.height - d.y0));
              if (
                (b = g[3].match(
                  /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}%)?)+/g,
                ))
              )
                for (
                  f = b.length, k = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((h = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%)?/,
                  )),
                    h[2]
                      ? ((g = parseFloat(h[2])), h[3] && (g /= 100))
                      : (g = e * k),
                    d.colorStops.push({ color: h[1], stop: g }));
              break;
            case "-webkit-radial-gradient":
            case "-moz-radial-gradient":
            case "-o-radial-gradient":
              d = {
                type: "circle",
                x0: 0,
                y0: 0,
                x1: c.width,
                y1: c.height,
                cx: 0,
                cy: 0,
                rx: 0,
                ry: 0,
                colorStops: [],
              };
              if ((b = g[2].match(/(\d{1,3})%?\s(\d{1,3})%?/)))
                ((d.cx = (b[1] * c.width) / 100),
                  (d.cy = (b[2] * c.height) / 100));
              b = g[3].match(/\w+/);
              h = g[4].match(/[a-z-]*/);
              if (b && h)
                switch (h[0]) {
                  case "farthest-corner":
                  case "cover":
                  case "":
                    e = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.cy, 2));
                    b = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.y1 - d.cy, 2));
                    f = Math.sqrt(
                      Math.pow(d.x1 - d.cx, 2) + Math.pow(d.y1 - d.cy, 2),
                    );
                    h = Math.sqrt(Math.pow(d.x1 - d.cx, 2) + Math.pow(d.cy, 2));
                    d.rx = d.ry = Math.max(e, b, f, h);
                    break;
                  case "closest-corner":
                    e = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.cy, 2));
                    b = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.y1 - d.cy, 2));
                    f = Math.sqrt(
                      Math.pow(d.x1 - d.cx, 2) + Math.pow(d.y1 - d.cy, 2),
                    );
                    h = Math.sqrt(Math.pow(d.x1 - d.cx, 2) + Math.pow(d.cy, 2));
                    d.rx = d.ry = Math.min(e, b, f, h);
                    break;
                  case "farthest-side":
                    "circle" === b[0]
                      ? (d.rx = d.ry =
                          Math.max(d.cx, d.cy, d.x1 - d.cx, d.y1 - d.cy))
                      : ((d.type = b[0]),
                        (d.rx = Math.max(d.cx, d.x1 - d.cx)),
                        (d.ry = Math.max(d.cy, d.y1 - d.cy)));
                    break;
                  case "closest-side":
                  case "contain":
                    "circle" === b[0]
                      ? (d.rx = d.ry =
                          Math.min(d.cx, d.cy, d.x1 - d.cx, d.y1 - d.cy))
                      : ((d.type = b[0]),
                        (d.rx = Math.min(d.cx, d.x1 - d.cx)),
                        (d.ry = Math.min(d.cy, d.y1 - d.cy)));
                }
              if (
                (b = g[5].match(
                  /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g,
                ))
              )
                for (
                  f = b.length, k = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((h = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/,
                  )),
                    h[2]
                      ? ((g = parseFloat(h[2])),
                        (g = "%" === h[3] ? g / 100 : g / c.width))
                      : (g = e * k),
                    d.colorStops.push({ color: h[1], stop: g }));
          }
        return d;
      };
      h.Generate.Gradient = function (a, b) {
        var d = c.createElement("canvas"),
          g = d.getContext("2d"),
          f,
          n,
          k,
          m,
          u;
        d.width = b.width;
        d.height = b.height;
        f = h.Generate.parseGradient(a, b);
        u = new Image();
        if (f)
          if ("linear" === f.type) {
            n = g.createLinearGradient(f.x0, f.y0, f.x1, f.y1);
            k = 0;
            for (m = f.colorStops.length; k < m; k += 1)
              try {
                n.addColorStop(f.colorStops[k].stop, f.colorStops[k].color);
              } catch (O) {
                e([
                  "failed to add color stop: ",
                  O,
                  "; tried to add: ",
                  f.colorStops[k],
                  "; stop: ",
                  k,
                  "; in: ",
                  a,
                ]);
              }
            g.fillStyle = n;
            g.fillRect(0, 0, b.width, b.height);
            u.src = d.toDataURL();
          } else if ("circle" === f.type) {
            n = g.createRadialGradient(f.cx, f.cy, 0, f.cx, f.cy, f.rx);
            k = 0;
            for (m = f.colorStops.length; k < m; k += 1)
              try {
                n.addColorStop(f.colorStops[k].stop, f.colorStops[k].color);
              } catch (O) {
                e([
                  "failed to add color stop: ",
                  O,
                  "; tried to add: ",
                  f.colorStops[k],
                  "; stop: ",
                  k,
                  "; in: ",
                  a,
                ]);
              }
            g.fillStyle = n;
            g.fillRect(0, 0, b.width, b.height);
            u.src = d.toDataURL();
          } else if ("ellipse" === f.type) {
            b = c.createElement("canvas");
            var q = b.getContext("2d");
            n = Math.max(f.rx, f.ry);
            var r = 2 * n,
              B;
            b.width = b.height = r;
            n = q.createRadialGradient(f.rx, f.ry, 0, f.rx, f.ry, n);
            k = 0;
            for (m = f.colorStops.length; k < m; k += 1)
              try {
                n.addColorStop(f.colorStops[k].stop, f.colorStops[k].color);
              } catch (O) {
                e([
                  "failed to add color stop: ",
                  O,
                  "; tried to add: ",
                  f.colorStops[k],
                  "; stop: ",
                  k,
                  "; in: ",
                  a,
                ]);
              }
            q.fillStyle = n;
            q.fillRect(0, 0, r, r);
            g.fillStyle = f.colorStops[k - 1].color;
            g.fillRect(0, 0, d.width, d.height);
            B = new Image();
            B.onload = function () {
              g.drawImage(B, f.cx - f.rx, f.cy - f.ry, 2 * f.rx, 2 * f.ry);
              u.src = d.toDataURL();
            };
            B.src = b.toDataURL();
          }
        return u;
      };
      h.Generate.ListAlpha = function (a) {
        var b = "",
          c;
        do ((c = a % 26), (b = String.fromCharCode(c + 64) + b), (a /= 26));
        while (26 < 26 * a);
        return b;
      };
      h.Generate.ListRoman = function (a) {
        var b = "M CM D CD C XC L XL X IX V IV I".split(" "),
          c = [1e3, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
          d = "",
          f,
          e = b.length;
        if (0 >= a || 4e3 <= a) return a;
        for (f = 0; f < e; f += 1)
          for (; a >= c[f];) ((a -= c[f]), (d += b[f]));
        return d;
      };
    })();
    h.Parse = function (a, k) {
      function g() {
        return {
          width: Math.max(
            Math.max(L.body.scrollWidth, L.documentElement.scrollWidth),
            Math.max(L.body.offsetWidth, L.documentElement.offsetWidth),
            Math.max(L.body.clientWidth, L.documentElement.clientWidth),
          ),
          height: Math.max(
            Math.max(L.body.scrollHeight, L.documentElement.scrollHeight),
            Math.max(L.body.offsetHeight, L.documentElement.offsetHeight),
            Math.max(L.body.clientHeight, L.documentElement.clientHeight),
          ),
        };
      }
      function t(a, b) {
        a = parseInt(P(a, b), 10);
        return isNaN(a) ? 0 : a;
      }
      function l(a, b, c, d, f, e) {
        "transparent" !== e &&
          (a.setVariable("fillStyle", e), a.fillRect(b, c, d, f));
      }
      function f(a, b) {
        switch (b) {
          case "lowercase":
            return a.toLowerCase();
          case "capitalize":
            return a.replace(/(^|\s|:|-|\(|\))([a-z])/g, function (a, b, c) {
              if (0 < a.length) return b + c.toUpperCase();
            });
          case "uppercase":
            return a.toUpperCase();
          default:
            return a;
        }
      }
      function n(a) {
        return a.replace(/^\s*/g, "").replace(/\s*$/g, "");
      }
      function p(a, b, c) {
        c = c.ctx;
        var e = P(a, "fontFamily"),
          g = P(a, "fontSize"),
          p = P(a, "color"),
          t = P(a, "textDecoration"),
          m = P(a, "textAlign"),
          u = P(a, "letterSpacing"),
          v,
          R,
          q = P(a, "fontWeight"),
          r = P(a, "fontStyle"),
          B = P(a, "fontVariant"),
          D = 0,
          A;
        b.nodeValue = f(b.nodeValue, P(a, "textTransform"));
        if (0 < n(b.nodeValue).length) {
          if ("none" !== t)
            if (I[e + "-" + g] !== d) R = I[e + "-" + g];
            else {
              R = L.createElement("div");
              a = L.createElement("img");
              A = L.createElement("span");
              var x;
              R.style.visibility = "hidden";
              R.style.fontFamily = e;
              R.style.fontSize = g;
              R.style.margin = 0;
              R.style.padding = 0;
              M.appendChild(R);
              a.src =
                "data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs\x3d";
              a.width = 1;
              a.height = 1;
              a.style.margin = 0;
              a.style.padding = 0;
              a.style.verticalAlign = "baseline";
              A.style.fontFamily = e;
              A.style.fontSize = g;
              A.style.margin = 0;
              A.style.padding = 0;
              A.appendChild(L.createTextNode("Hidden Text"));
              R.appendChild(A);
              R.appendChild(a);
              x = a.offsetTop - A.offsetTop + 1;
              R.removeChild(A);
              R.appendChild(L.createTextNode("Hidden Text"));
              R.style.lineHeight = "normal";
              a.style.verticalAlign = "super";
              a = {
                baseline: x,
                lineWidth: 1,
                middle: a.offsetTop - R.offsetTop + 1,
              };
              I[e + "-" + g] = a;
              M.removeChild(R);
              R = a;
            }
          m = m.replace(["-webkit-auto"], ["auto"]);
          m =
            !1 === k.letterRendering &&
            /^(left|right|justify|auto)$/.test(m) &&
            /^(normal|none)$/.test(u)
              ? b.nodeValue.split(/(\b| )/)
              : b.nodeValue.split("");
          switch (parseInt(q, 10)) {
            case 401:
              q = "bold";
              break;
            case 400:
              q = "normal";
          }
          c.setVariable("fillStyle", p);
          c.setVariable("font", r + " " + B + " " + q + " " + g + " " + e);
          c.setVariable("textAlign", "left");
          g = b;
          q = 0;
          for (e = m.length; q < e; q += 1) {
            r = null;
            if (z.rangeBounds) {
              if ("none" !== t || 0 !== n(m[q]).length)
                ((r = m[q]),
                  L.createRange
                    ? ((v = L.createRange()),
                      v.setStart(b, D),
                      v.setEnd(b, D + r.length))
                    : (v = M.createTextRange()),
                  (v = v.getBoundingClientRect()
                    ? v.getBoundingClientRect()
                    : {}));
            } else {
              if ("string" !== typeof g.nodeValue) continue;
              B = g.splitText(m[q].length);
              u = g.parentNode;
              a = L.createElement("wrapper");
              A = g.cloneNode(!0);
              a.appendChild(g.cloneNode(!0));
              u.replaceChild(a, g);
              v = h.Util.Bounds(a);
              r = g.nodeValue;
              g = B;
              u.replaceChild(A, a);
            }
            null !== r &&
              ((B = v.left),
              (u = v.bottom),
              (a = c),
              0 < n(r).length && a.fillText(r, B, u));
            switch (t) {
              case "underline":
                l(
                  c,
                  v.left,
                  Math.round(v.top + R.baseline + R.lineWidth),
                  v.width,
                  1,
                  p,
                );
                break;
              case "overline":
                l(c, v.left, v.top, v.width, 1, p);
                break;
              case "line-through":
                l(
                  c,
                  v.left,
                  Math.ceil(v.top + R.middle + R.lineWidth),
                  v.width,
                  1,
                  p,
                );
            }
            D += m[q].length;
          }
        }
      }
      function v(b) {
        return (b = a[b]) && !0 === b.succeeded ? b.img : !1;
      }
      function u(a, b) {
        var c = Math.max(a.left, b.left),
          d = Math.max(a.top, b.top);
        return {
          left: c,
          top: d,
          width: Math.min(a.left + a.width, b.left + b.width) - c,
          height: Math.min(a.top + a.height, b.top + b.height) - d,
        };
      }
      function q(a, b, c, d) {
        var f = c.left,
          e = c.top,
          g = c.width;
        c = c.height;
        var l,
          n,
          k,
          p,
          h,
          m,
          v,
          R = (function (a) {
            var b = [],
              c = ["Top", "Right", "Bottom", "Left"],
              d;
            for (d = 0; 4 > d; d += 1)
              b.push({
                width: t(a, "border" + c[d] + "Width"),
                color: P(a, "border" + c[d] + "Color"),
              });
            return b;
          })(a);
        (function (a) {
          var b = [],
            c = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"],
            d;
          for (d = 0; 4 > d; d += 1) b.push(P(a, "border" + c[d] + "Radius"));
          return b;
        })(a);
        for (a = 0; 4 > a; a += 1)
          if (((l = R[a]), (v = []), 0 < l.width)) {
            n = f;
            k = e;
            p = g;
            h = c - R[2].width;
            switch (a) {
              case 0:
                h = R[0].width;
                m = 0;
                v[m++] = ["line", n, k];
                v[m++] = ["line", n + p, k];
                v[m++] = ["line", n + p - R[1].width, k + h];
                v[m++] = ["line", n + R[3].width, k + h];
                break;
              case 1:
                n = f + g - R[1].width;
                p = R[1].width;
                m = 0;
                v[m++] = ["line", n, k + R[0].width];
                v[m++] = ["line", n + p, k];
                v[m++] = ["line", n + p, k + h + R[2].width];
                v[m++] = ["line", n, k + h];
                break;
              case 2:
                k = k + c - R[2].width;
                h = R[2].width;
                m = 0;
                v[m++] = ["line", n + R[3].width, k];
                v[m++] = ["line", n + p - R[2].width, k];
                v[m++] = ["line", n + p, k + h];
                v[m++] = ["line", n, k + h];
                break;
              case 3:
                ((p = R[3].width),
                  (m = 0),
                  (v[m++] = ["line", n, k]),
                  (v[m++] = ["line", n + p, k + R[0].width]),
                  (v[m++] = ["line", n + p, k + h]),
                  (v[m++] = ["line", n, k + h + R[2].width]));
            }
            m = { left: n, top: k, width: p, height: h };
            d && (m = u(m, d));
            if (0 < m.width && 0 < m.height && "transparent" !== l.color)
              for (
                b.setVariable("fillStyle", l.color),
                  l = b.drawShape(),
                  n = v.length,
                  m = 0;
                m < n;
                m++
              )
                l[0 === m ? "moveTo" : v[m][0] + "To"].apply(
                  null,
                  v[m].slice(1),
                );
          }
        return R;
      }
      function r(a, b, c) {
        var d = L.createElement("valuewrap"),
          f =
            "lineHeight textAlign fontFamily color fontSize paddingLeft paddingTop width height border borderLeftWidth borderTopWidth".split(
              " ",
            ),
          g,
          l,
          n;
        g = 0;
        for (l = f.length; g < l; g += 1) {
          n = f[g];
          try {
            d.style[n] = P(a, n);
          } catch (fa) {
            e(
              "html2canvas: Parse: Exception caught in renderFormValue: " +
                fa.message,
            );
          }
        }
        d.style.borderColor = "black";
        d.style.borderStyle = "solid";
        d.style.display = "block";
        d.style.position = "absolute";
        if (
          /^(submit|reset|button|text|password)$/.test(a.type) ||
          "SELECT" === a.nodeName
        )
          d.style.lineHeight = P(a, "height");
        d.style.top = b.top + "px";
        d.style.left = b.left + "px";
        b = L.createTextNode(
          "SELECT" === a.nodeName ? a.options[a.selectedIndex].text : a.value,
        );
        d.appendChild(b);
        M.appendChild(d);
        p(a, b, c);
        M.removeChild(d);
      }
      function B(a, b, c, d, f, e, g, l) {
        var n = 0,
          k = 0;
        0 < g - c && (n = g - c);
        0 < l - d && (k = l - d);
        a.drawImage(b, n, k, f - n, e - k, c + n, d + k, f - n, e - k);
      }
      function O(a, b, c, d, f, e, g) {
        g = Math.min(b.height, g);
        var l, n;
        c.left -= Math.ceil(c.left / b.width) * b.width;
        for (n = d + c.left; n < e + d;)
          ((l = Math.floor(n + b.width) > e + d ? e + d - n : b.width),
            B(a, b, n, f + c.top, l, g, d, f),
            (n = Math.floor(n + b.width)));
      }
      function C(a, b) {
        var c = h.Util.Bounds(a),
          d = c.left,
          f = c.top,
          p = c.width,
          D = c.height,
          A,
          z = P(a, "backgroundColor"),
          I = P(a, "position"),
          y,
          C = P(a, "opacity"),
          E;
        b ? (K = {}) : ((K = g()), (b = { opacity: 1 }));
        E = P(a, "zIndex");
        (y = b.zIndex)
          ? "auto" !== E &&
            ((E = { zindex: E, children: [] }), y.children.push(E), (y = E))
          : (y = E = { zindex: 0, children: [] });
        E = {
          ctx: m(K.width || p, K.height || D),
          zIndex: y,
          opacity: C * b.opacity,
          cssPosition: I,
        };
        b.clip && (E.clip = h.Util.Extend({}, b.clip));
        !0 === k.useOverflow &&
          !0 === /(hidden|scroll|auto)/.test(P(a, "overflow")) &&
          !1 === /(BODY)/i.test(a.nodeName) &&
          (E.clip = E.clip ? u(E.clip, c) : c);
        b = y.children.push(E);
        C = y.children[b - 1].ctx;
        C.setVariable("globalAlpha", E.opacity);
        I = q(a, C, c, !1);
        E.borders = I;
        x.test(a.nodeName) &&
          "transparent" !== k.iframeDefault &&
          (z = "default" === k.iframeDefault ? "#efefef" : k.iframeDefault);
        p = {
          left: d + I[3].width,
          top: f + I[0].width,
          width: p - (I[1].width + I[3].width),
          height: D - (I[0].width + I[2].width),
        };
        E.clip && (p = u(p, E.clip));
        if (0 < p.height && 0 < p.width) {
          l(C, p.left, p.top, p.width, p.height, z);
          var F = p,
            S = P(a, "backgroundImage"),
            J = P(a, "backgroundRepeat").split(",")[0],
            M,
            N,
            G;
          /data:image\/.*;base64,/i.test(S) ||
            /^(-webkit|-moz|linear-gradient|-o-)/.test(S) ||
            (S = S.split(",")[0]);
          if ("undefined" !== typeof S && !1 === /^(1|none)$/.test(S))
            if (
              ((S = h.Util.backgroundImage(S)),
              (z = v(S)),
              (D = h.Util.BackgroundPosition(a, F, z)),
              z)
            )
              switch (J) {
                case "repeat-x":
                  O(C, z, D, F.left, F.top, F.width, F.height);
                  break;
                case "repeat-y":
                  S = F.left;
                  J = F.top;
                  M = F.height;
                  N = Math.min(z.width, F.width);
                  D.top -= Math.ceil(D.top / z.height) * z.height;
                  for (G = J + D.top; G < M + J;)
                    ((F =
                      Math.floor(G + z.height) > M + J ? M + J - G : z.height),
                      B(C, z, S + D.left, G, N, F, S, J),
                      (G = Math.floor(G + z.height)));
                  break;
                case "no-repeat":
                  S = F.width - D.left;
                  G = F.height - D.top;
                  J = D.left;
                  M = D.top;
                  N = D.left + F.left;
                  D = D.top + F.top;
                  0 > J
                    ? ((J = Math.abs(J)),
                      (N += J),
                      (S = Math.min(F.width, z.width - J)))
                    : ((S = Math.min(S, z.width)), (J = 0));
                  0 > M
                    ? ((M = Math.abs(M)),
                      (D += M),
                      (G = Math.min(F.height, z.height - M)))
                    : ((G = Math.min(G, z.height)), (M = 0));
                  0 < G && 0 < S && C.drawImage(z, J, M, S, G, N, D, S, G);
                  break;
                default:
                  for (
                    D.top -= Math.ceil(D.top / z.height) * z.height,
                      S = F.top + D.top;
                    S < F.height + F.top;
                  )
                    ((J = Math.min(z.height, F.height + F.top - S)),
                      (J =
                        Math.floor(S + z.height) > J + S
                          ? J + S - S
                          : z.height),
                      S < F.top ? ((M = F.top - S), (S = F.top)) : (M = 0),
                      O(C, z, D, F.left, S, F.width, J),
                      0 < M && (D.top += M),
                      (S = Math.floor(S + z.height) - M));
              }
            else e("html2canvas: Error loading background:" + S);
        }
        switch (a.nodeName) {
          case "IMG":
            E = a.getAttribute("src");
            (A = v(E))
              ? ((E = t(a, "paddingLeft")),
                (p = t(a, "paddingTop")),
                (z = t(a, "paddingRight")),
                (D = t(a, "paddingBottom")),
                C.drawImage(
                  A,
                  0,
                  0,
                  A.width,
                  A.height,
                  d + E + I[3].width,
                  f + p + I[0].width,
                  c.width - (I[1].width + I[3].width + E + z),
                  c.height - (I[0].width + I[2].width + p + D),
                ))
              : e("html2canvas: Error loading \x3cimg\x3e:" + E);
            break;
          case "INPUT":
            /^(text|url|email|submit|button|reset)$/.test(a.type) &&
              0 < a.value.length &&
              r(a, c, E);
            break;
          case "TEXTAREA":
            0 < a.value.length && r(a, c, E);
            break;
          case "SELECT":
            0 < a.options.length && r(a, c, E);
            break;
          case "LI":
            c = p;
            d = P(a, "listStylePosition");
            I = P(a, "listStyleType");
            f = P(a, "fontWeight");
            if (
              /^(decimal|decimal-leading-zero|upper-alpha|upper-latin|upper-roman|lower-alpha|lower-greek|lower-latin|lower-roman)$/i.test(
                I,
              )
            ) {
              C = -1;
              E = 1;
              p = a.parentNode.childNodes;
              if (a.parentNode) {
                for (; p[++C] !== a;) 1 === p[C].nodeType && E++;
                C = E;
              } else C = -1;
              switch (I) {
                case "decimal":
                  A = C;
                  break;
                case "decimal-leading-zero":
                  A =
                    1 === C.toString().length
                      ? "0" + C.toString()
                      : C.toString();
                  break;
                case "upper-roman":
                  A = h.Generate.ListRoman(C);
                  break;
                case "lower-roman":
                  A = h.Generate.ListRoman(C).toLowerCase();
                  break;
                case "lower-alpha":
                  A = h.Generate.ListAlpha(C).toLowerCase();
                  break;
                case "upper-alpha":
                  A = h.Generate.ListAlpha(C);
              }
              E = A += ". ";
              I = L.createElement("boundelement");
              I.style.display = "inline";
              C = a.style.listStyleType;
              a.style.listStyleType = "none";
              I.appendChild(L.createTextNode(E));
              a.insertBefore(I, a.firstChild);
              E = h.Util.Bounds(I);
              a.removeChild(I);
              a.style.listStyleType = C;
              switch (f) {
                case 401:
                  f = "bold";
                  break;
                case 400:
                  f = "normal";
              }
              H.setVariable("fillStyle", P(a, "color"));
              H.setVariable(
                "font",
                P(a, "fontVariant") +
                  " " +
                  f +
                  " " +
                  P(a, "fontStyle") +
                  " " +
                  P(a, "fontSize") +
                  " " +
                  P(a, "fontFamily"),
              );
              "inside" === d &&
                (H.setVariable("textAlign", "left"),
                (a = c.left),
                (c = E.bottom),
                (d = H),
                0 < n(A).length && d.fillText(A, a, c));
            }
            break;
          case "CANVAS":
            ((E = t(a, "paddingLeft")),
              (p = t(a, "paddingTop")),
              (z = t(a, "paddingRight")),
              (D = t(a, "paddingBottom")),
              C.drawImage(
                a,
                0,
                0,
                a.width,
                a.height,
                d + E + I[3].width,
                f + p + I[0].width,
                c.width - (I[1].width + I[3].width + E + z),
                c.height - (I[0].width + I[2].width + p + D),
              ));
        }
        return y.children[b - 1];
      }
      function y(a, b) {
        if (
          "none" !== P(a, "display") &&
          "hidden" !== P(a, "visibility") &&
          !a.hasAttribute("data-html2canvas-ignore") &&
          ((b = C(a, b) || b), (H = b.ctx), !x.test(a.nodeName))
        ) {
          var c = h.Util.Children(a),
            d,
            f,
            e;
          d = 0;
          for (e = c.length; d < e; d += 1)
            ((f = c[d]),
              1 === f.nodeType ? y(f, b) : 3 === f.nodeType && p(a, f, b));
        }
      }
      b.scroll(0, 0);
      var z = {
          rangeBounds: !1,
          svgRendering:
            k.svgRendering &&
            (function () {
              var a = new Image(),
                b = c.createElement("canvas"),
                f = b.getContext === d ? !1 : b.getContext("2d");
              if (!1 === f) return !1;
              b.width = b.height = 10;
              a.src =
                "data:image/svg+xml,\x3csvg xmlns\x3d'http://www.w3.org/2000/svg' width\x3d'10' height\x3d'10'\x3e\x3cforeignObject width\x3d'10' height\x3d'10'\x3e\x3cdiv xmlns\x3d'http://www.w3.org/1999/xhtml' style\x3d'width:10;height:10;'\x3esup\x3c/div\x3e\x3c/foreignObject\x3e\x3c/svg\x3e";
              try {
                (f.drawImage(a, 0, 0), b.toDataURL());
              } catch (ea) {
                return !1;
              }
              e("html2canvas: Parse: SVG powered rendering available");
              return !0;
            })(),
        },
        J = k.elements === d ? c.body : k.elements[0],
        I = {},
        L = J.ownerDocument,
        x = new RegExp("(" + k.ignoreElements + ")"),
        M = L.body,
        E,
        F,
        G,
        H,
        K;
      a = a || {};
      L.createRange &&
        ((E = L.createRange()),
        E.getBoundingClientRect &&
          ((F = L.createElement("boundtest")),
          (F.style.height = "123px"),
          (F.style.display = "block"),
          M.appendChild(F),
          E.selectNode(F),
          (E = E.getBoundingClientRect()),
          (E = E.height),
          123 === E && (z.rangeBounds = !0),
          M.removeChild(F)));
      var P = h.Util.getCSS;
      G = C(J, null);
      z.svgRendering &&
        (function (a) {
          function b(a) {
            a = h.Util.Children(a);
            var c = a.length,
              d,
              e,
              g,
              l,
              n;
            for (n = 0; n < c; n += 1)
              if (((l = a[n]), 3 === l.nodeType))
                f += l.nodeValue
                  .replace(/\</g, "\x26lt;")
                  .replace(/\>/g, "\x26gt;");
              else if (
                1 === l.nodeType &&
                !/^(script|meta|title)$/.test(l.nodeName.toLowerCase())
              ) {
                f += "\x3c" + l.nodeName.toLowerCase();
                if (l.hasAttributes())
                  for (d = l.attributes, g = d.length, e = 0; e < g; e += 1)
                    f += " " + d[e].name + '\x3d"' + d[e].value + '"';
                f += "\x3e";
                b(l);
                f += "\x3c/" + l.nodeName.toLowerCase() + "\x3e";
              }
          }
          var c = new Image(),
            d = g(),
            f = "";
          b(a);
          c.src = [
            "data:image/svg+xml,",
            "\x3csvg xmlns\x3d'http://www.w3.org/2000/svg' version\x3d'1.1' width\x3d'" +
              d.width +
              "' height\x3d'" +
              d.height +
              "'\x3e",
            "\x3cforeignObject width\x3d'" +
              d.width +
              "' height\x3d'" +
              d.height +
              "'\x3e",
            "\x3chtml xmlns\x3d'http://www.w3.org/1999/xhtml' style\x3d'margin:0;'\x3e",
            f.replace(/\#/g, "%23"),
            "\x3c/html\x3e\x3c/foreignObject\x3e\x3c/svg\x3e",
          ].join("");
          c.onload = function () {
            G.svgRender = c;
          };
        })(c.documentElement);
      F = 0;
      J = J.children;
      for (E = J.length; F < E; F += 1) y(J[F], G);
      G.backgroundColor = P(c.documentElement, "backgroundColor");
      return G;
    };
    h.Preload = function (a) {
      function k() {
        e(
          "html2canvas: start: images: " +
            f.numLoaded +
            " / " +
            f.numTotal +
            " (failed: " +
            f.numFailed +
            ")",
        );
        !f.firstRun &&
          f.numLoaded >= f.numTotal &&
          (e(
            "Finished loading images: # " +
              f.numTotal +
              " (failed: " +
              f.numFailed +
              ")",
          ),
          "function" === typeof a.complete && a.complete(f));
      }
      function g(c, e, g) {
        var n,
          p = a.proxy,
          h;
        O.href = c;
        c = O.href;
        n = "html2canvas_" + u++;
        g.callbackname = n;
        p = -1 < p.indexOf("?") ? p + "\x26" : p + "?";
        p += "url\x3d" + encodeURIComponent(c) + "\x26callback\x3d" + n;
        h = q.createElement("script");
        b[n] = function (a) {
          "error:" === a.substring(0, 6)
            ? ((g.succeeded = !1), f.numLoaded++, f.numFailed++, k())
            : (l(e, g), (e.src = a));
          b[n] = d;
          try {
            delete b[n];
          } catch (F) {}
          h.parentNode.removeChild(h);
          h = null;
          delete g.script;
          delete g.callbackname;
        };
        h.setAttribute("type", "text/javascript");
        h.setAttribute("src", p);
        g.script = h;
        b.document.body.appendChild(h);
      }
      function t(a) {
        var b = h.Util.Children(a),
          c,
          g,
          l = !1;
        try {
          var n = b.length;
          for (c = 0; c < n; c += 1) t(b[c]);
        } catch (E) {}
        try {
          l = a.nodeType;
        } catch (E) {
          ((l = !1),
            e(
              "html2canvas: failed to access some element's nodeType - Exception: " +
                E.message,
            ));
        }
        if (1 === l || l === d) {
          try {
            g = h.Util.getCSS(a, "backgroundImage");
          } catch (E) {
            e(
              "html2canvas: failed to get background-image - Exception: " +
                E.message,
            );
          }
          g &&
            "1" !== g &&
            "none" !== g &&
            (/^(-webkit|-o|-moz|-ms|linear)-/.test(g)
              ? ((a = h.Generate.Gradient(g, h.Util.Bounds(a))),
                a !== d &&
                  ((f[g] = { img: a, succeeded: !0 }),
                  f.numTotal++,
                  f.numLoaded++,
                  k()))
              : ((g = h.Util.backgroundImage(
                  g.match(/data:image\/.*;base64,/i) ? g : g.split(",")[0],
                )),
                p.loadImage(g)));
        }
      }
      function l(c, e) {
        c.onload = function () {
          e.timer !== d && b.clearTimeout(e.timer);
          f.numLoaded++;
          e.succeeded = !0;
          c.onerror = c.onload = null;
          k();
        };
        c.onerror = function () {
          if (
            "anonymous" === c.crossOrigin &&
            (b.clearTimeout(e.timer), a.proxy)
          ) {
            var d = c.src;
            c = new Image();
            e.img = c;
            c.src = d;
            g(c.src, c, e);
            return;
          }
          f.numLoaded++;
          f.numFailed++;
          e.succeeded = !1;
          c.onerror = c.onload = null;
          k();
        };
      }
      var f = { numLoaded: 0, numFailed: 0, numTotal: 0, cleanupDone: !1 },
        n,
        p,
        m,
        u = 0;
      m = a.elements[0] || c.body;
      var q = m.ownerDocument,
        r = q.images,
        B = r.length,
        O = q.createElement("a"),
        C = new Image().crossOrigin !== d,
        y;
      O.href = b.location.href;
      n = O.protocol + O.host;
      p = {
        loadImage: function (c) {
          var e, k;
          c &&
            f[c] === d &&
            ((e = new Image()),
            c.match(/data:image\/.*;base64,/i)
              ? ((e.src = c.replace(/url\(['"]{0,}|['"]{0,}\)$/gi, "")),
                (k = f[c] = { img: e }),
                f.numTotal++,
                l(e, k))
              : ((O.href = c),
                (O.href = O.href),
                O.protocol + O.host === n || !0 === a.allowTaint
                  ? ((k = f[c] = { img: e }),
                    f.numTotal++,
                    l(e, k),
                    (e.src = c))
                  : C && !a.allowTaint && a.useCORS
                    ? ((e.crossOrigin = "anonymous"),
                      (k = f[c] = { img: e }),
                      f.numTotal++,
                      l(e, k),
                      (e.src = c),
                      (e.customComplete = function () {
                        if (this.img.complete) this.img.onerror();
                        else
                          this.timer = b.setTimeout(
                            this.img.customComplete,
                            100,
                          );
                      }.bind(k)),
                      e.customComplete())
                    : a.proxy &&
                      ((k = f[c] = { img: e }), f.numTotal++, g(c, e, k))));
        },
        cleanupDOM: function (g) {
          var l, n;
          if (!f.cleanupDone) {
            g && "string" === typeof g
              ? e("html2canvas: Cleanup because: " + g)
              : e("html2canvas: Cleanup after timeout: " + a.timeout + " ms.");
            for (n in f)
              if (
                f.hasOwnProperty(n) &&
                ((l = f[n]),
                "object" === typeof l && l.callbackname && l.succeeded === d)
              ) {
                b[l.callbackname] = d;
                try {
                  delete b[l.callbackname];
                } catch (L) {}
                l.script &&
                  l.script.parentNode &&
                  (l.script.setAttribute("src", "about:blank"),
                  l.script.parentNode.removeChild(l.script));
                f.numLoaded++;
                f.numFailed++;
                e(
                  "html2canvas: Cleaned up failed img: '" +
                    n +
                    "' Steps: " +
                    f.numLoaded +
                    " / " +
                    f.numTotal,
                );
              }
            b.stop !== d
              ? b.stop()
              : c.execCommand !== d && c.execCommand("Stop", !1);
            c.close !== d && c.close();
            f.cleanupDone = !0;
            (g && "string" === typeof g) || k();
          }
        },
        renderingDone: function () {
          y && b.clearTimeout(y);
        },
      };
      0 < a.timeout && (y = b.setTimeout(p.cleanupDOM, a.timeout));
      e("html2canvas: Preload starts: finding background-images");
      f.firstRun = !0;
      t(m);
      e("html2canvas: Preload: Finding images");
      for (m = 0; m < B; m += 1) p.loadImage(r[m].getAttribute("src"));
      f.firstRun = !1;
      e("html2canvas: Preload: Done.");
      f.numTotal === f.numLoaded && k();
      return p;
    };
    h.Renderer = function (a, b) {
      function d(a) {
        var b = [],
          c = [];
        a = a.children;
        var g, l, k, h;
        g = 0;
        for (k = a.length; g < k; g += 1)
          ((l = a[g]),
            l.children && 0 < l.children.length
              ? (b.push(l), c.push(l.zindex))
              : e.push(l));
        c.sort(function (a, b) {
          return a - b;
        });
        a = 0;
        for (g = c.length; a < g; a += 1)
          for (l = c[a], k = 0, h = b.length; k <= h; k += 1)
            if (b[k].zindex === l) {
              l = b.splice(k, 1);
              d(l[0]);
              break;
            }
      }
      var e = [];
      d(a.zIndex);
      if ("function" !== typeof b._renderer._create)
        throw Error("Invalid renderer defined");
      return b._renderer._create(a, b, c, e, h);
    };
    a = function (a, c) {
      var g,
        k,
        l = {
          logging: !1,
          elements: a,
          proxy: "http://html2canvas.appspot.com/",
          timeout: 0,
          useCORS: !1,
          allowTaint: !1,
          svgRendering: !1,
          iframeDefault: "default",
          ignoreElements: "IFRAME|OBJECT|PARAM",
          useOverflow: !0,
          letterRendering: !1,
          flashcanvas: d,
          width: null,
          height: null,
          taintTest: !0,
          renderer: "Canvas",
        },
        l = h.Util.Extend(c, l);
      if ("string" === typeof l.renderer && h.Renderer[l.renderer] !== d)
        l._renderer = h.Renderer[l.renderer](l);
      else if ("function" === typeof l.renderer) l._renderer = l.renderer(l);
      else throw "Unknown renderer";
      h.logging = l.logging;
      l.complete = function (a) {
        if ("function" !== typeof l.onpreloaded || !1 !== l.onpreloaded(a))
          if (
            ((g = h.Parse(a, l)),
            "function" !== typeof l.onparsed || !1 !== l.onparsed(g))
          )
            if (((k = h.Renderer(g, l)), "function" === typeof l.onrendered))
              l.onrendered(k);
      };
      b.setTimeout(function () {
        h.Preload(l);
      }, 0);
      return {
        render: function (a, b) {
          return h.Renderer(a, h.Util.Extend(b, l));
        },
        parse: function (a, b) {
          return h.Parse(a, h.Util.Extend(b, l));
        },
        preload: function (a) {
          return h.Preload(h.Util.Extend(a, l));
        },
        log: e,
      };
    };
    a.log = e;
    a.Renderer = { Canvas: d };
    h.Renderer.Canvas = function (a) {
      a = a || {};
      var k = a.canvas || c.createElement("canvas"),
        g = !1,
        h = !1,
        l = !1,
        f;
      if (k.getContext)
        (e("html2canvas: Renderer: using canvas renderer"), (l = !0));
      else if (a.flashcanvas !== d) {
        g = !0;
        e("html2canvas: Renderer: canvas not available, using flashcanvas");
        var n = c.createElement("script");
        n.src = a.flashcanvas;
        n.onload = (function (a, c) {
          var f;
          if (a.onload === d)
            a.onreadystatechange !== d
              ? ((f = function () {
                  "loaded" !== a.readyState && "complete" !== a.readyState
                    ? b.setTimeout(f, 250)
                    : c();
                }),
                b.setTimeout(f, 250))
              : e(
                  "html2canvas: Renderer: Can't track when flashcanvas is loaded",
                );
          else return c;
        })(n, function () {
          "undefined" !== typeof b.FlashCanvas &&
            (e("html2canvas: Renderer: Flashcanvas initialized"),
            b.FlashCanvas.initElement(k),
            (l = !0),
            !1 !== h && f._create.apply(null, h));
        });
        c.body.appendChild(n);
      }
      return (f = {
        _create: function (a, b, f, n, t) {
          if (!l) return ((h = arguments), k);
          var p = k.getContext("2d"),
            m,
            u,
            v,
            q,
            r,
            D,
            A = c.createElement("canvas");
          r = A.getContext !== d;
          var x,
            M,
            A = r ? A.getContext("2d") : {};
          D = [];
          k.width = k.style.width = g
            ? Math.min(2880, b.width || a.ctx.width)
            : b.width || a.ctx.width;
          k.height = k.style.height = g
            ? Math.min(2880, b.height || a.ctx.height)
            : b.height || a.ctx.height;
          m = p.fillStyle;
          p.fillStyle = a.backgroundColor;
          p.fillRect(0, 0, k.width, k.height);
          p.fillStyle = m;
          if (b.svgRendering && a.svgRender !== d)
            p.drawImage(a.svgRender, 0, 0);
          else
            for (u = 0, v = n.length; u < v; u += 1) {
              m = n.splice(0, 1)[0];
              m.canvasPosition = m.canvasPosition || {};
              p.textBaseline = "bottom";
              m.clip &&
                (p.save(),
                p.beginPath(),
                p.rect(m.clip.left, m.clip.top, m.clip.width, m.clip.height),
                p.clip());
              if (m.ctx.storage)
                for (q = 0, x = m.ctx.storage.length; q < x; q += 1)
                  switch (((M = m.ctx.storage[q]), M.type)) {
                    case "variable":
                      p[M.name] = M.arguments;
                      break;
                    case "function":
                      if ("fillRect" === M.name)
                        (!g ||
                          (2880 > M.arguments[0] + M.arguments[2] &&
                            2880 > M.arguments[1] + M.arguments[3])) &&
                          p.fillRect.apply(p, M.arguments);
                      else if ("drawShape" === M.name) {
                        M = M.arguments;
                        var E,
                          F = M.length;
                        p.beginPath();
                        for (E = 0; E < F; E++)
                          p[M[E].name].apply(p, M[E].arguments);
                        p.closePath();
                        p.fill();
                      } else if ("fillText" === M.name)
                        (!g ||
                          (2880 > M.arguments[1] && 2880 > M.arguments[2])) &&
                          p.fillText.apply(p, M.arguments);
                      else if (
                        "drawImage" === M.name &&
                        0 < M.arguments[8] &&
                        M.arguments[7]
                      ) {
                        if (
                          r &&
                          b.taintTest &&
                          -1 === D.indexOf(M.arguments[0].src)
                        ) {
                          A.drawImage(M.arguments[0], 0, 0);
                          try {
                            A.getImageData(0, 0, 1, 1);
                          } catch (G) {
                            A = f.createElement("canvas");
                            A = A.getContext("2d");
                            continue;
                          }
                          D.push(M.arguments[0].src);
                        }
                        p.drawImage.apply(p, M.arguments);
                      }
                  }
              m.clip && p.restore();
            }
          e(
            "html2canvas: Renderer: Canvas renderer done - returning canvas obj",
          );
          v = b.elements.length;
          return 1 === v &&
            "object" === typeof b.elements[0] &&
            "BODY" !== b.elements[0].nodeName &&
            !1 === g
            ? ((D = t.Util.Bounds(b.elements[0])),
              (r = f.createElement("canvas")),
              (r.width = D.width),
              (r.height = D.height),
              (p = r.getContext("2d")),
              p.drawImage(
                k,
                D.left,
                D.top,
                D.width,
                D.height,
                0,
                0,
                D.width,
                D.height,
              ),
              (k = null),
              r)
            : k;
        },
      });
    };
    h.Renderer.SVG = function (a) {
      var b = c.createElementNS("http://www.w3.org/2000/svg", "svg"),
        d = c.createElementNS("http://www.w3.org/2000/svg", "defs"),
        h,
        l,
        f,
        n,
        p,
        m,
        u,
        q = {},
        r,
        B,
        O = 0;
      return {
        _create: function (a, c, g, k, t) {
          b.setAttribute("version", "1.1");
          b.setAttribute("baseProfile", "full");
          b.setAttribute(
            "viewBox",
            "0 0 " +
              Math.max(a.ctx.width, c.width) +
              " " +
              Math.max(a.ctx.height, c.height),
          );
          b.setAttribute("width", Math.max(a.ctx.width, c.width) + "px");
          b.setAttribute("height", Math.max(a.ctx.height, c.height) + "px");
          b.setAttribute("preserveAspectRatio", "none");
          b.appendChild(d);
          h = 0;
          for (f = k.length; h < f; h += 1)
            if (
              ((p = k.splice(0, 1)[0]),
              (p.canvasPosition = p.canvasPosition || {}),
              p.ctx.storage)
            )
              for (l = 0, n = p.ctx.storage.length; l < n; l += 1)
                switch (((m = p.ctx.storage[l]), m.type)) {
                  case "variable":
                    q[m.name] = m.arguments;
                    break;
                  case "function":
                    "fillRect" === m.name
                      ? ((u = g.createElementNS(
                          "http://www.w3.org/2000/svg",
                          "rect",
                        )),
                        u.setAttribute("x", m.arguments[0]),
                        u.setAttribute("y", m.arguments[1]),
                        u.setAttribute("width", m.arguments[2]),
                        u.setAttribute("height", m.arguments[3]),
                        u.setAttribute("fill", q.fillStyle),
                        b.appendChild(u))
                      : "fillText" === m.name
                        ? ((u = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "text",
                          )),
                          (B = q.font.split(" ")),
                          (u.style.fontVariant = B.splice(0, 1)[0]),
                          (u.style.fontWeight = B.splice(0, 1)[0]),
                          (u.style.fontStyle = B.splice(0, 1)[0]),
                          (u.style.fontSize = B.splice(0, 1)[0]),
                          u.setAttribute("x", m.arguments[1]),
                          u.setAttribute(
                            "y",
                            m.arguments[2] -
                              (parseInt(u.style.fontSize, 10) + 3),
                          ),
                          u.setAttribute("fill", q.fillStyle),
                          (u.style.dominantBaseline = "text-before-edge"),
                          (u.style.fontFamily = B.join(" ")),
                          (r = g.createTextNode(m.arguments[0])),
                          u.appendChild(r),
                          b.appendChild(u))
                        : "drawImage" === m.name &&
                          0 < m.arguments[8] &&
                          m.arguments[7] &&
                          ((u = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "clipPath",
                          )),
                          u.setAttribute("id", "clipId" + O),
                          (r = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "rect",
                          )),
                          r.setAttribute("x", m.arguments[5]),
                          r.setAttribute("y", m.arguments[6]),
                          r.setAttribute("width", m.arguments[3]),
                          r.setAttribute("height", m.arguments[4]),
                          u.appendChild(r),
                          d.appendChild(u),
                          (u = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "image",
                          )),
                          u.setAttributeNS(
                            "http://www.w3.org/1999/xlink",
                            "xlink:href",
                            m.arguments[0].src,
                          ),
                          u.setAttribute("width", m.arguments[7]),
                          u.setAttribute("height", m.arguments[8]),
                          u.setAttribute("x", m.arguments[5]),
                          u.setAttribute("y", m.arguments[6]),
                          u.setAttribute("clip-path", "url(#clipId" + O + ")"),
                          u.setAttribute("preserveAspectRatio", "none"),
                          b.appendChild(u),
                          (O += 1));
                }
          e("html2canvas: Renderer: SVG Renderer done - returning SVG DOM obj");
          return b;
        },
      };
    };
  })(window, document);
  return a;
});
