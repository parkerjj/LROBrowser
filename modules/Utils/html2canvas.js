define("Utils/html2canvas", [], function () {
  var a;
  (function (b, c, d) {
    function e(a) {
      h.logging && b.console && b.console.log && b.console.log(a);
    }
    function l(a, b) {
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
      var p;
      if (b.getComputedStyle)
        (void 0 !== a && (r = c.defaultView.getComputedStyle(a, null)),
          (p = r[e]),
          "backgroundPosition" === e
            ? ((p = (p.split(",")[0] || "0 0").split(" ")),
              (p[0] = -1 === p[0].indexOf("%") ? g(e + "X", p[0]) : p[0]),
              (p[1] = p[1] === d ? p[0] : p[1]),
              (p[1] = -1 === p[1].indexOf("%") ? g(e + "Y", p[1]) : p[1]))
            : /border(Top|Bottom)(Left|Right)Radius/.test(e) &&
              ((e = p.split(" ")),
              1 >= e.length && (e[1] = e[0]),
              (e[0] = parseInt(e[0], 10)),
              (e[1] = parseInt(e[1], 10)),
              (p = e)));
      else if (a.currentStyle)
        if ("backgroundPosition" === e)
          p = [
            g(e + "X", a.currentStyle[e + "X"]),
            g(e + "Y", a.currentStyle[e + "Y"]),
          ];
        else if (
          ((p = g(e, a.currentStyle[e])),
          /^(border)/i.test(e) && /^(medium|thin|thick)$/i.test(p))
        )
          switch (p) {
            case "thin":
              p = "1px";
              break;
            case "medium":
              p = "0px";
              break;
            case "thick":
              p = "5px";
          }
      return p;
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
          var p = a.childNodes;
          a = [];
          if (null !== p) {
            var k = a.length,
              f = 0;
            if ("number" === typeof p.length)
              for (var m = p.length; f < m; f++) a[k++] = p[f];
            else for (; p[f] !== d;) a[k++] = p[f++];
            a.length = k;
          }
          c = a;
        }
        b = c;
      } catch (q) {
        (e("html2canvas.Util.Children failed with exception: " + q.message),
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
          q,
          n;
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
                  f = b.length, q = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((n = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/,
                  )),
                    n[2]
                      ? ((g = parseFloat(n[2])),
                        (g = "%" === n[3] ? g / 100 : g / c.width))
                      : (g = e * q),
                    d.colorStops.push({ color: n[1], stop: g }));
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
                  ((n = b[e].match(
                    /(from|to|color-stop)\(([0-9\.]+)?(?:,\s)?((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\)/,
                  )),
                    (g = parseFloat(n[2])),
                    "from" === n[1] && (g = 0),
                    "to" === n[1] && (g = 1),
                    d.colorStops.push({ color: n[3], stop: g }));
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
                  f = b.length, q = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((n = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%)?/,
                  )),
                    n[2]
                      ? ((g = parseFloat(n[2])), n[3] && (g /= 100))
                      : (g = e * q),
                    d.colorStops.push({ color: n[1], stop: g }));
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
              n = g[4].match(/[a-z-]*/);
              if (b && n)
                switch (n[0]) {
                  case "farthest-corner":
                  case "cover":
                  case "":
                    e = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.cy, 2));
                    b = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.y1 - d.cy, 2));
                    f = Math.sqrt(
                      Math.pow(d.x1 - d.cx, 2) + Math.pow(d.y1 - d.cy, 2),
                    );
                    n = Math.sqrt(Math.pow(d.x1 - d.cx, 2) + Math.pow(d.cy, 2));
                    d.rx = d.ry = Math.max(e, b, f, n);
                    break;
                  case "closest-corner":
                    e = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.cy, 2));
                    b = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.y1 - d.cy, 2));
                    f = Math.sqrt(
                      Math.pow(d.x1 - d.cx, 2) + Math.pow(d.y1 - d.cy, 2),
                    );
                    n = Math.sqrt(Math.pow(d.x1 - d.cx, 2) + Math.pow(d.cy, 2));
                    d.rx = d.ry = Math.min(e, b, f, n);
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
                  f = b.length, q = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((n = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/,
                  )),
                    n[2]
                      ? ((g = parseFloat(n[2])),
                        (g = "%" === n[3] ? g / 100 : g / c.width))
                      : (g = e * q),
                    d.colorStops.push({ color: n[1], stop: g }));
          }
        return d;
      };
      h.Generate.Gradient = function (a, b) {
        var d = c.createElement("canvas"),
          g = d.getContext("2d"),
          f,
          m,
          q,
          n,
          l;
        d.width = b.width;
        d.height = b.height;
        f = h.Generate.parseGradient(a, b);
        l = new Image();
        if (f)
          if ("linear" === f.type) {
            m = g.createLinearGradient(f.x0, f.y0, f.x1, f.y1);
            q = 0;
            for (n = f.colorStops.length; q < n; q += 1)
              try {
                m.addColorStop(f.colorStops[q].stop, f.colorStops[q].color);
              } catch (H) {
                e([
                  "failed to add color stop: ",
                  H,
                  "; tried to add: ",
                  f.colorStops[q],
                  "; stop: ",
                  q,
                  "; in: ",
                  a,
                ]);
              }
            g.fillStyle = m;
            g.fillRect(0, 0, b.width, b.height);
            l.src = d.toDataURL();
          } else if ("circle" === f.type) {
            m = g.createRadialGradient(f.cx, f.cy, 0, f.cx, f.cy, f.rx);
            q = 0;
            for (n = f.colorStops.length; q < n; q += 1)
              try {
                m.addColorStop(f.colorStops[q].stop, f.colorStops[q].color);
              } catch (H) {
                e([
                  "failed to add color stop: ",
                  H,
                  "; tried to add: ",
                  f.colorStops[q],
                  "; stop: ",
                  q,
                  "; in: ",
                  a,
                ]);
              }
            g.fillStyle = m;
            g.fillRect(0, 0, b.width, b.height);
            l.src = d.toDataURL();
          } else if ("ellipse" === f.type) {
            b = c.createElement("canvas");
            var t = b.getContext("2d");
            m = Math.max(f.rx, f.ry);
            var D = 2 * m,
              B;
            b.width = b.height = D;
            m = t.createRadialGradient(f.rx, f.ry, 0, f.rx, f.ry, m);
            q = 0;
            for (n = f.colorStops.length; q < n; q += 1)
              try {
                m.addColorStop(f.colorStops[q].stop, f.colorStops[q].color);
              } catch (H) {
                e([
                  "failed to add color stop: ",
                  H,
                  "; tried to add: ",
                  f.colorStops[q],
                  "; stop: ",
                  q,
                  "; in: ",
                  a,
                ]);
              }
            t.fillStyle = m;
            t.fillRect(0, 0, D, D);
            g.fillStyle = f.colorStops[q - 1].color;
            g.fillRect(0, 0, d.width, d.height);
            B = new Image();
            B.onload = function () {
              g.drawImage(B, f.cx - f.rx, f.cy - f.ry, 2 * f.rx, 2 * f.ry);
              l.src = d.toDataURL();
            };
            B.src = b.toDataURL();
          }
        return l;
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
    h.Parse = function (a, n) {
      function g() {
        return {
          width: Math.max(
            Math.max(I.body.scrollWidth, I.documentElement.scrollWidth),
            Math.max(I.body.offsetWidth, I.documentElement.offsetWidth),
            Math.max(I.body.clientWidth, I.documentElement.clientWidth),
          ),
          height: Math.max(
            Math.max(I.body.scrollHeight, I.documentElement.scrollHeight),
            Math.max(I.body.offsetHeight, I.documentElement.offsetHeight),
            Math.max(I.body.clientHeight, I.documentElement.clientHeight),
          ),
        };
      }
      function p(a, b) {
        a = parseInt(M(a, b), 10);
        return isNaN(a) ? 0 : a;
      }
      function k(a, b, c, d, f, e) {
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
      function m(a) {
        return a.replace(/^\s*/g, "").replace(/\s*$/g, "");
      }
      function q(a, b, c) {
        c = c.ctx;
        var e = M(a, "fontFamily"),
          g = M(a, "fontSize"),
          p = M(a, "color"),
          q = M(a, "textDecoration"),
          l = M(a, "textAlign"),
          u = M(a, "letterSpacing"),
          v,
          B,
          t = M(a, "fontWeight"),
          D = M(a, "fontStyle"),
          r = M(a, "fontVariant"),
          x = 0,
          V;
        b.nodeValue = f(b.nodeValue, M(a, "textTransform"));
        if (0 < m(b.nodeValue).length) {
          if ("none" !== q)
            if (N[e + "-" + g] !== d) B = N[e + "-" + g];
            else {
              B = I.createElement("div");
              a = I.createElement("img");
              V = I.createElement("span");
              var A;
              B.style.visibility = "hidden";
              B.style.fontFamily = e;
              B.style.fontSize = g;
              B.style.margin = 0;
              B.style.padding = 0;
              J.appendChild(B);
              a.src =
                "data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs\x3d";
              a.width = 1;
              a.height = 1;
              a.style.margin = 0;
              a.style.padding = 0;
              a.style.verticalAlign = "baseline";
              V.style.fontFamily = e;
              V.style.fontSize = g;
              V.style.margin = 0;
              V.style.padding = 0;
              V.appendChild(I.createTextNode("Hidden Text"));
              B.appendChild(V);
              B.appendChild(a);
              A = a.offsetTop - V.offsetTop + 1;
              B.removeChild(V);
              B.appendChild(I.createTextNode("Hidden Text"));
              B.style.lineHeight = "normal";
              a.style.verticalAlign = "super";
              a = {
                baseline: A,
                lineWidth: 1,
                middle: a.offsetTop - B.offsetTop + 1,
              };
              N[e + "-" + g] = a;
              J.removeChild(B);
              B = a;
            }
          l = l.replace(["-webkit-auto"], ["auto"]);
          l =
            !1 === n.letterRendering &&
            /^(left|right|justify|auto)$/.test(l) &&
            /^(normal|none)$/.test(u)
              ? b.nodeValue.split(/(\b| )/)
              : b.nodeValue.split("");
          switch (parseInt(t, 10)) {
            case 401:
              t = "bold";
              break;
            case 400:
              t = "normal";
          }
          c.setVariable("fillStyle", p);
          c.setVariable("font", D + " " + r + " " + t + " " + g + " " + e);
          c.setVariable("textAlign", "left");
          g = b;
          t = 0;
          for (e = l.length; t < e; t += 1) {
            D = null;
            if (G.rangeBounds) {
              if ("none" !== q || 0 !== m(l[t]).length)
                ((D = l[t]),
                  I.createRange
                    ? ((v = I.createRange()),
                      v.setStart(b, x),
                      v.setEnd(b, x + D.length))
                    : (v = J.createTextRange()),
                  (v = v.getBoundingClientRect()
                    ? v.getBoundingClientRect()
                    : {}));
            } else {
              if ("string" !== typeof g.nodeValue) continue;
              r = g.splitText(l[t].length);
              u = g.parentNode;
              a = I.createElement("wrapper");
              V = g.cloneNode(!0);
              a.appendChild(g.cloneNode(!0));
              u.replaceChild(a, g);
              v = h.Util.Bounds(a);
              D = g.nodeValue;
              g = r;
              u.replaceChild(V, a);
            }
            null !== D &&
              ((r = v.left),
              (u = v.bottom),
              (a = c),
              0 < m(D).length && a.fillText(D, r, u));
            switch (q) {
              case "underline":
                k(
                  c,
                  v.left,
                  Math.round(v.top + B.baseline + B.lineWidth),
                  v.width,
                  1,
                  p,
                );
                break;
              case "overline":
                k(c, v.left, v.top, v.width, 1, p);
                break;
              case "line-through":
                k(
                  c,
                  v.left,
                  Math.ceil(v.top + B.middle + B.lineWidth),
                  v.width,
                  1,
                  p,
                );
            }
            x += l[t].length;
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
      function t(a, b, c, d) {
        var f = c.left,
          e = c.top,
          g = c.width;
        c = c.height;
        var k,
          m,
          q,
          n,
          h,
          l,
          v,
          B = (function (a) {
            var b = [],
              c = ["Top", "Right", "Bottom", "Left"],
              d;
            for (d = 0; 4 > d; d += 1)
              b.push({
                width: p(a, "border" + c[d] + "Width"),
                color: M(a, "border" + c[d] + "Color"),
              });
            return b;
          })(a);
        (function (a) {
          var b = [],
            c = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"],
            d;
          for (d = 0; 4 > d; d += 1) b.push(M(a, "border" + c[d] + "Radius"));
          return b;
        })(a);
        for (a = 0; 4 > a; a += 1)
          if (((k = B[a]), (v = []), 0 < k.width)) {
            m = f;
            q = e;
            n = g;
            h = c - B[2].width;
            switch (a) {
              case 0:
                h = B[0].width;
                l = 0;
                v[l++] = ["line", m, q];
                v[l++] = ["line", m + n, q];
                v[l++] = ["line", m + n - B[1].width, q + h];
                v[l++] = ["line", m + B[3].width, q + h];
                break;
              case 1:
                m = f + g - B[1].width;
                n = B[1].width;
                l = 0;
                v[l++] = ["line", m, q + B[0].width];
                v[l++] = ["line", m + n, q];
                v[l++] = ["line", m + n, q + h + B[2].width];
                v[l++] = ["line", m, q + h];
                break;
              case 2:
                q = q + c - B[2].width;
                h = B[2].width;
                l = 0;
                v[l++] = ["line", m + B[3].width, q];
                v[l++] = ["line", m + n - B[2].width, q];
                v[l++] = ["line", m + n, q + h];
                v[l++] = ["line", m, q + h];
                break;
              case 3:
                ((n = B[3].width),
                  (l = 0),
                  (v[l++] = ["line", m, q]),
                  (v[l++] = ["line", m + n, q + B[0].width]),
                  (v[l++] = ["line", m + n, q + h]),
                  (v[l++] = ["line", m, q + h + B[2].width]));
            }
            l = { left: m, top: q, width: n, height: h };
            d && (l = u(l, d));
            if (0 < l.width && 0 < l.height && "transparent" !== k.color)
              for (
                b.setVariable("fillStyle", k.color),
                  k = b.drawShape(),
                  m = v.length,
                  l = 0;
                l < m;
                l++
              )
                k[0 === l ? "moveTo" : v[l][0] + "To"].apply(
                  null,
                  v[l].slice(1),
                );
          }
        return B;
      }
      function D(a, b, c) {
        var d = I.createElement("valuewrap"),
          f =
            "lineHeight textAlign fontFamily color fontSize paddingLeft paddingTop width height border borderLeftWidth borderTopWidth".split(
              " ",
            ),
          g,
          k,
          m;
        g = 0;
        for (k = f.length; g < k; g += 1) {
          m = f[g];
          try {
            d.style[m] = M(a, m);
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
          d.style.lineHeight = M(a, "height");
        d.style.top = b.top + "px";
        d.style.left = b.left + "px";
        b = I.createTextNode(
          "SELECT" === a.nodeName ? a.options[a.selectedIndex].text : a.value,
        );
        d.appendChild(b);
        J.appendChild(d);
        q(a, b, c);
        J.removeChild(d);
      }
      function B(a, b, c, d, f, e, g, k) {
        var m = 0,
          p = 0;
        0 < g - c && (m = g - c);
        0 < k - d && (p = k - d);
        a.drawImage(b, m, p, f - m, e - p, c + m, d + p, f - m, e - p);
      }
      function r(a, b, c, d, f, e, g) {
        g = Math.min(b.height, g);
        var k, m;
        c.left -= Math.ceil(c.left / b.width) * b.width;
        for (m = d + c.left; m < e + d;)
          ((k = Math.floor(m + b.width) > e + d ? e + d - m : b.width),
            B(a, b, m, f + c.top, k, g, d, f),
            (m = Math.floor(m + b.width)));
      }
      function C(a, b) {
        var c = h.Util.Bounds(a),
          d = c.left,
          f = c.top,
          q = c.width,
          A = c.height,
          R,
          H = M(a, "backgroundColor"),
          z = M(a, "position"),
          N,
          G = M(a, "opacity"),
          C;
        b ? (K = {}) : ((K = g()), (b = { opacity: 1 }));
        C = M(a, "zIndex");
        (N = b.zIndex)
          ? "auto" !== C &&
            ((C = { zindex: C, children: [] }), N.children.push(C), (N = C))
          : (N = C = { zindex: 0, children: [] });
        C = {
          ctx: l(K.width || q, K.height || A),
          zIndex: N,
          opacity: G * b.opacity,
          cssPosition: z,
        };
        b.clip && (C.clip = h.Util.Extend({}, b.clip));
        !0 === n.useOverflow &&
          !0 === /(hidden|scroll|auto)/.test(M(a, "overflow")) &&
          !1 === /(BODY)/i.test(a.nodeName) &&
          (C.clip = C.clip ? u(C.clip, c) : c);
        b = N.children.push(C);
        G = N.children[b - 1].ctx;
        G.setVariable("globalAlpha", C.opacity);
        z = t(a, G, c, !1);
        C.borders = z;
        x.test(a.nodeName) &&
          "transparent" !== n.iframeDefault &&
          (H = "default" === n.iframeDefault ? "#efefef" : n.iframeDefault);
        q = {
          left: d + z[3].width,
          top: f + z[0].width,
          width: q - (z[1].width + z[3].width),
          height: A - (z[0].width + z[2].width),
        };
        C.clip && (q = u(q, C.clip));
        if (0 < q.height && 0 < q.width) {
          k(G, q.left, q.top, q.width, q.height, H);
          var y = q,
            E = M(a, "backgroundImage"),
            J = M(a, "backgroundRepeat").split(",")[0],
            Q,
            L,
            P;
          /data:image\/.*;base64,/i.test(E) ||
            /^(-webkit|-moz|linear-gradient|-o-)/.test(E) ||
            (E = E.split(",")[0]);
          if ("undefined" !== typeof E && !1 === /^(1|none)$/.test(E))
            if (
              ((E = h.Util.backgroundImage(E)),
              (H = v(E)),
              (A = h.Util.BackgroundPosition(a, y, H)),
              H)
            )
              switch (J) {
                case "repeat-x":
                  r(G, H, A, y.left, y.top, y.width, y.height);
                  break;
                case "repeat-y":
                  E = y.left;
                  J = y.top;
                  Q = y.height;
                  L = Math.min(H.width, y.width);
                  A.top -= Math.ceil(A.top / H.height) * H.height;
                  for (P = J + A.top; P < Q + J;)
                    ((y =
                      Math.floor(P + H.height) > Q + J ? Q + J - P : H.height),
                      B(G, H, E + A.left, P, L, y, E, J),
                      (P = Math.floor(P + H.height)));
                  break;
                case "no-repeat":
                  E = y.width - A.left;
                  P = y.height - A.top;
                  J = A.left;
                  Q = A.top;
                  L = A.left + y.left;
                  A = A.top + y.top;
                  0 > J
                    ? ((J = Math.abs(J)),
                      (L += J),
                      (E = Math.min(y.width, H.width - J)))
                    : ((E = Math.min(E, H.width)), (J = 0));
                  0 > Q
                    ? ((Q = Math.abs(Q)),
                      (A += Q),
                      (P = Math.min(y.height, H.height - Q)))
                    : ((P = Math.min(P, H.height)), (Q = 0));
                  0 < P && 0 < E && G.drawImage(H, J, Q, E, P, L, A, E, P);
                  break;
                default:
                  for (
                    A.top -= Math.ceil(A.top / H.height) * H.height,
                      E = y.top + A.top;
                    E < y.height + y.top;
                  )
                    ((J = Math.min(H.height, y.height + y.top - E)),
                      (J =
                        Math.floor(E + H.height) > J + E
                          ? J + E - E
                          : H.height),
                      E < y.top ? ((Q = y.top - E), (E = y.top)) : (Q = 0),
                      r(G, H, A, y.left, E, y.width, J),
                      0 < Q && (A.top += Q),
                      (E = Math.floor(E + H.height) - Q));
              }
            else e("html2canvas: Error loading background:" + E);
        }
        switch (a.nodeName) {
          case "IMG":
            C = a.getAttribute("src");
            (R = v(C))
              ? ((C = p(a, "paddingLeft")),
                (q = p(a, "paddingTop")),
                (H = p(a, "paddingRight")),
                (A = p(a, "paddingBottom")),
                G.drawImage(
                  R,
                  0,
                  0,
                  R.width,
                  R.height,
                  d + C + z[3].width,
                  f + q + z[0].width,
                  c.width - (z[1].width + z[3].width + C + H),
                  c.height - (z[0].width + z[2].width + q + A),
                ))
              : e("html2canvas: Error loading \x3cimg\x3e:" + C);
            break;
          case "INPUT":
            /^(text|url|email|submit|button|reset)$/.test(a.type) &&
              0 < a.value.length &&
              D(a, c, C);
            break;
          case "TEXTAREA":
            0 < a.value.length && D(a, c, C);
            break;
          case "SELECT":
            0 < a.options.length && D(a, c, C);
            break;
          case "LI":
            c = q;
            d = M(a, "listStylePosition");
            z = M(a, "listStyleType");
            f = M(a, "fontWeight");
            if (
              /^(decimal|decimal-leading-zero|upper-alpha|upper-latin|upper-roman|lower-alpha|lower-greek|lower-latin|lower-roman)$/i.test(
                z,
              )
            ) {
              G = -1;
              C = 1;
              q = a.parentNode.childNodes;
              if (a.parentNode) {
                for (; q[++G] !== a;) 1 === q[G].nodeType && C++;
                G = C;
              } else G = -1;
              switch (z) {
                case "decimal":
                  R = G;
                  break;
                case "decimal-leading-zero":
                  R =
                    1 === G.toString().length
                      ? "0" + G.toString()
                      : G.toString();
                  break;
                case "upper-roman":
                  R = h.Generate.ListRoman(G);
                  break;
                case "lower-roman":
                  R = h.Generate.ListRoman(G).toLowerCase();
                  break;
                case "lower-alpha":
                  R = h.Generate.ListAlpha(G).toLowerCase();
                  break;
                case "upper-alpha":
                  R = h.Generate.ListAlpha(G);
              }
              C = R += ". ";
              z = I.createElement("boundelement");
              z.style.display = "inline";
              G = a.style.listStyleType;
              a.style.listStyleType = "none";
              z.appendChild(I.createTextNode(C));
              a.insertBefore(z, a.firstChild);
              C = h.Util.Bounds(z);
              a.removeChild(z);
              a.style.listStyleType = G;
              switch (f) {
                case 401:
                  f = "bold";
                  break;
                case 400:
                  f = "normal";
              }
              F.setVariable("fillStyle", M(a, "color"));
              F.setVariable(
                "font",
                M(a, "fontVariant") +
                  " " +
                  f +
                  " " +
                  M(a, "fontStyle") +
                  " " +
                  M(a, "fontSize") +
                  " " +
                  M(a, "fontFamily"),
              );
              "inside" === d &&
                (F.setVariable("textAlign", "left"),
                (a = c.left),
                (c = C.bottom),
                (d = F),
                0 < m(R).length && d.fillText(R, a, c));
            }
            break;
          case "CANVAS":
            ((C = p(a, "paddingLeft")),
              (q = p(a, "paddingTop")),
              (H = p(a, "paddingRight")),
              (A = p(a, "paddingBottom")),
              G.drawImage(
                a,
                0,
                0,
                a.width,
                a.height,
                d + C + z[3].width,
                f + q + z[0].width,
                c.width - (z[1].width + z[3].width + C + H),
                c.height - (z[0].width + z[2].width + q + A),
              ));
        }
        return N.children[b - 1];
      }
      function z(a, b) {
        if (
          "none" !== M(a, "display") &&
          "hidden" !== M(a, "visibility") &&
          !a.hasAttribute("data-html2canvas-ignore") &&
          ((b = C(a, b) || b), (F = b.ctx), !x.test(a.nodeName))
        ) {
          var c = h.Util.Children(a),
            d,
            f,
            e;
          d = 0;
          for (e = c.length; d < e; d += 1)
            ((f = c[d]),
              1 === f.nodeType ? z(f, b) : 3 === f.nodeType && q(a, f, b));
        }
      }
      b.scroll(0, 0);
      var G = {
          rangeBounds: !1,
          svgRendering:
            n.svgRendering &&
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
              } catch (ba) {
                return !1;
              }
              e("html2canvas: Parse: SVG powered rendering available");
              return !0;
            })(),
        },
        P = n.elements === d ? c.body : n.elements[0],
        N = {},
        I = P.ownerDocument,
        x = new RegExp("(" + n.ignoreElements + ")"),
        J = I.body,
        E,
        L,
        y,
        F,
        K;
      a = a || {};
      I.createRange &&
        ((E = I.createRange()),
        E.getBoundingClientRect &&
          ((L = I.createElement("boundtest")),
          (L.style.height = "123px"),
          (L.style.display = "block"),
          J.appendChild(L),
          E.selectNode(L),
          (E = E.getBoundingClientRect()),
          (E = E.height),
          123 === E && (G.rangeBounds = !0),
          J.removeChild(L)));
      var M = h.Util.getCSS;
      y = C(P, null);
      G.svgRendering &&
        (function (a) {
          function b(a) {
            a = h.Util.Children(a);
            var c = a.length,
              d,
              e,
              g,
              k,
              m;
            for (m = 0; m < c; m += 1)
              if (((k = a[m]), 3 === k.nodeType))
                f += k.nodeValue
                  .replace(/\</g, "\x26lt;")
                  .replace(/\>/g, "\x26gt;");
              else if (
                1 === k.nodeType &&
                !/^(script|meta|title)$/.test(k.nodeName.toLowerCase())
              ) {
                f += "\x3c" + k.nodeName.toLowerCase();
                if (k.hasAttributes())
                  for (d = k.attributes, g = d.length, e = 0; e < g; e += 1)
                    f += " " + d[e].name + '\x3d"' + d[e].value + '"';
                f += "\x3e";
                b(k);
                f += "\x3c/" + k.nodeName.toLowerCase() + "\x3e";
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
            y.svgRender = c;
          };
        })(c.documentElement);
      L = 0;
      P = P.children;
      for (E = P.length; L < E; L += 1) z(P[L], y);
      y.backgroundColor = M(c.documentElement, "backgroundColor");
      return y;
    };
    h.Preload = function (a) {
      function n() {
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
        var m,
          q = a.proxy,
          p;
        r.href = c;
        c = r.href;
        m = "html2canvas_" + u++;
        g.callbackname = m;
        q = -1 < q.indexOf("?") ? q + "\x26" : q + "?";
        q += "url\x3d" + encodeURIComponent(c) + "\x26callback\x3d" + m;
        p = t.createElement("script");
        b[m] = function (a) {
          "error:" === a.substring(0, 6)
            ? ((g.succeeded = !1), f.numLoaded++, f.numFailed++, n())
            : (k(e, g), (e.src = a));
          b[m] = d;
          try {
            delete b[m];
          } catch (L) {}
          p.parentNode.removeChild(p);
          p = null;
          delete g.script;
          delete g.callbackname;
        };
        p.setAttribute("type", "text/javascript");
        p.setAttribute("src", q);
        g.script = p;
        b.document.body.appendChild(p);
      }
      function p(a) {
        var b = h.Util.Children(a),
          c,
          g,
          k = !1;
        try {
          var m = b.length;
          for (c = 0; c < m; c += 1) p(b[c]);
        } catch (E) {}
        try {
          k = a.nodeType;
        } catch (E) {
          ((k = !1),
            e(
              "html2canvas: failed to access some element's nodeType - Exception: " +
                E.message,
            ));
        }
        if (1 === k || k === d) {
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
                  n()))
              : ((g = h.Util.backgroundImage(
                  g.match(/data:image\/.*;base64,/i) ? g : g.split(",")[0],
                )),
                q.loadImage(g)));
        }
      }
      function k(c, e) {
        c.onload = function () {
          e.timer !== d && b.clearTimeout(e.timer);
          f.numLoaded++;
          e.succeeded = !0;
          c.onerror = c.onload = null;
          n();
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
          n();
        };
      }
      var f = { numLoaded: 0, numFailed: 0, numTotal: 0, cleanupDone: !1 },
        m,
        q,
        l,
        u = 0;
      l = a.elements[0] || c.body;
      var t = l.ownerDocument,
        D = t.images,
        B = D.length,
        r = t.createElement("a"),
        C = new Image().crossOrigin !== d,
        z;
      r.href = b.location.href;
      m = r.protocol + r.host;
      q = {
        loadImage: function (c) {
          var e, q;
          c &&
            f[c] === d &&
            ((e = new Image()),
            c.match(/data:image\/.*;base64,/i)
              ? ((e.src = c.replace(/url\(['"]{0,}|['"]{0,}\)$/gi, "")),
                (q = f[c] = { img: e }),
                f.numTotal++,
                k(e, q))
              : ((r.href = c),
                (r.href = r.href),
                r.protocol + r.host === m || !0 === a.allowTaint
                  ? ((q = f[c] = { img: e }),
                    f.numTotal++,
                    k(e, q),
                    (e.src = c))
                  : C && !a.allowTaint && a.useCORS
                    ? ((e.crossOrigin = "anonymous"),
                      (q = f[c] = { img: e }),
                      f.numTotal++,
                      k(e, q),
                      (e.src = c),
                      (e.customComplete = function () {
                        if (this.img.complete) this.img.onerror();
                        else
                          this.timer = b.setTimeout(
                            this.img.customComplete,
                            100,
                          );
                      }.bind(q)),
                      e.customComplete())
                    : a.proxy &&
                      ((q = f[c] = { img: e }), f.numTotal++, g(c, e, q))));
        },
        cleanupDOM: function (g) {
          var k, m;
          if (!f.cleanupDone) {
            g && "string" === typeof g
              ? e("html2canvas: Cleanup because: " + g)
              : e("html2canvas: Cleanup after timeout: " + a.timeout + " ms.");
            for (m in f)
              if (
                f.hasOwnProperty(m) &&
                ((k = f[m]),
                "object" === typeof k && k.callbackname && k.succeeded === d)
              ) {
                b[k.callbackname] = d;
                try {
                  delete b[k.callbackname];
                } catch (I) {}
                k.script &&
                  k.script.parentNode &&
                  (k.script.setAttribute("src", "about:blank"),
                  k.script.parentNode.removeChild(k.script));
                f.numLoaded++;
                f.numFailed++;
                e(
                  "html2canvas: Cleaned up failed img: '" +
                    m +
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
            (g && "string" === typeof g) || n();
          }
        },
        renderingDone: function () {
          z && b.clearTimeout(z);
        },
      };
      0 < a.timeout && (z = b.setTimeout(q.cleanupDOM, a.timeout));
      e("html2canvas: Preload starts: finding background-images");
      f.firstRun = !0;
      p(l);
      e("html2canvas: Preload: Finding images");
      for (l = 0; l < B; l += 1) q.loadImage(D[l].getAttribute("src"));
      f.firstRun = !1;
      e("html2canvas: Preload: Done.");
      f.numTotal === f.numLoaded && n();
      return q;
    };
    h.Renderer = function (a, b) {
      function d(a) {
        var b = [],
          c = [];
        a = a.children;
        var g, k, p, n;
        g = 0;
        for (p = a.length; g < p; g += 1)
          ((k = a[g]),
            k.children && 0 < k.children.length
              ? (b.push(k), c.push(k.zindex))
              : e.push(k));
        c.sort(function (a, b) {
          return a - b;
        });
        a = 0;
        for (g = c.length; a < g; a += 1)
          for (k = c[a], p = 0, n = b.length; p <= n; p += 1)
            if (b[p].zindex === k) {
              k = b.splice(p, 1);
              d(k[0]);
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
        p,
        k = {
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
        k = h.Util.Extend(c, k);
      if ("string" === typeof k.renderer && h.Renderer[k.renderer] !== d)
        k._renderer = h.Renderer[k.renderer](k);
      else if ("function" === typeof k.renderer) k._renderer = k.renderer(k);
      else throw "Unknown renderer";
      h.logging = k.logging;
      k.complete = function (a) {
        if ("function" !== typeof k.onpreloaded || !1 !== k.onpreloaded(a))
          if (
            ((g = h.Parse(a, k)),
            "function" !== typeof k.onparsed || !1 !== k.onparsed(g))
          )
            if (((p = h.Renderer(g, k)), "function" === typeof k.onrendered))
              k.onrendered(p);
      };
      b.setTimeout(function () {
        h.Preload(k);
      }, 0);
      return {
        render: function (a, b) {
          return h.Renderer(a, h.Util.Extend(b, k));
        },
        parse: function (a, b) {
          return h.Parse(a, h.Util.Extend(b, k));
        },
        preload: function (a) {
          return h.Preload(h.Util.Extend(a, k));
        },
        log: e,
      };
    };
    a.log = e;
    a.Renderer = { Canvas: d };
    h.Renderer.Canvas = function (a) {
      a = a || {};
      var n = a.canvas || c.createElement("canvas"),
        g = !1,
        p = !1,
        k = !1,
        f;
      if (n.getContext)
        (e("html2canvas: Renderer: using canvas renderer"), (k = !0));
      else if (a.flashcanvas !== d) {
        g = !0;
        e("html2canvas: Renderer: canvas not available, using flashcanvas");
        var m = c.createElement("script");
        m.src = a.flashcanvas;
        m.onload = (function (a, c) {
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
        })(m, function () {
          "undefined" !== typeof b.FlashCanvas &&
            (e("html2canvas: Renderer: Flashcanvas initialized"),
            b.FlashCanvas.initElement(n),
            (k = !0),
            !1 !== p && f._create.apply(null, p));
        });
        c.body.appendChild(m);
      }
      return (f = {
        _create: function (a, b, f, m, h) {
          if (!k) return ((p = arguments), n);
          var q = n.getContext("2d"),
            l,
            u,
            v,
            t,
            D,
            r,
            A = c.createElement("canvas");
          D = A.getContext !== d;
          var x,
            J,
            A = D ? A.getContext("2d") : {};
          r = [];
          n.width = n.style.width = g
            ? Math.min(2880, b.width || a.ctx.width)
            : b.width || a.ctx.width;
          n.height = n.style.height = g
            ? Math.min(2880, b.height || a.ctx.height)
            : b.height || a.ctx.height;
          l = q.fillStyle;
          q.fillStyle = a.backgroundColor;
          q.fillRect(0, 0, n.width, n.height);
          q.fillStyle = l;
          if (b.svgRendering && a.svgRender !== d)
            q.drawImage(a.svgRender, 0, 0);
          else
            for (u = 0, v = m.length; u < v; u += 1) {
              l = m.splice(0, 1)[0];
              l.canvasPosition = l.canvasPosition || {};
              q.textBaseline = "bottom";
              l.clip &&
                (q.save(),
                q.beginPath(),
                q.rect(l.clip.left, l.clip.top, l.clip.width, l.clip.height),
                q.clip());
              if (l.ctx.storage)
                for (t = 0, x = l.ctx.storage.length; t < x; t += 1)
                  switch (((J = l.ctx.storage[t]), J.type)) {
                    case "variable":
                      q[J.name] = J.arguments;
                      break;
                    case "function":
                      if ("fillRect" === J.name)
                        (!g ||
                          (2880 > J.arguments[0] + J.arguments[2] &&
                            2880 > J.arguments[1] + J.arguments[3])) &&
                          q.fillRect.apply(q, J.arguments);
                      else if ("drawShape" === J.name) {
                        J = J.arguments;
                        var E,
                          L = J.length;
                        q.beginPath();
                        for (E = 0; E < L; E++)
                          q[J[E].name].apply(q, J[E].arguments);
                        q.closePath();
                        q.fill();
                      } else if ("fillText" === J.name)
                        (!g ||
                          (2880 > J.arguments[1] && 2880 > J.arguments[2])) &&
                          q.fillText.apply(q, J.arguments);
                      else if (
                        "drawImage" === J.name &&
                        0 < J.arguments[8] &&
                        J.arguments[7]
                      ) {
                        if (
                          D &&
                          b.taintTest &&
                          -1 === r.indexOf(J.arguments[0].src)
                        ) {
                          A.drawImage(J.arguments[0], 0, 0);
                          try {
                            A.getImageData(0, 0, 1, 1);
                          } catch (y) {
                            A = f.createElement("canvas");
                            A = A.getContext("2d");
                            continue;
                          }
                          r.push(J.arguments[0].src);
                        }
                        q.drawImage.apply(q, J.arguments);
                      }
                  }
              l.clip && q.restore();
            }
          e(
            "html2canvas: Renderer: Canvas renderer done - returning canvas obj",
          );
          v = b.elements.length;
          return 1 === v &&
            "object" === typeof b.elements[0] &&
            "BODY" !== b.elements[0].nodeName &&
            !1 === g
            ? ((r = h.Util.Bounds(b.elements[0])),
              (D = f.createElement("canvas")),
              (D.width = r.width),
              (D.height = r.height),
              (q = D.getContext("2d")),
              q.drawImage(
                n,
                r.left,
                r.top,
                r.width,
                r.height,
                0,
                0,
                r.width,
                r.height,
              ),
              (n = null),
              D)
            : n;
        },
      });
    };
    h.Renderer.SVG = function (a) {
      var b = c.createElementNS("http://www.w3.org/2000/svg", "svg"),
        d = c.createElementNS("http://www.w3.org/2000/svg", "defs"),
        p,
        k,
        f,
        m,
        q,
        h,
        l,
        t = {},
        D,
        B,
        r = 0;
      return {
        _create: function (a, c, g, n, v) {
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
          p = 0;
          for (f = n.length; p < f; p += 1)
            if (
              ((q = n.splice(0, 1)[0]),
              (q.canvasPosition = q.canvasPosition || {}),
              q.ctx.storage)
            )
              for (k = 0, m = q.ctx.storage.length; k < m; k += 1)
                switch (((h = q.ctx.storage[k]), h.type)) {
                  case "variable":
                    t[h.name] = h.arguments;
                    break;
                  case "function":
                    "fillRect" === h.name
                      ? ((l = g.createElementNS(
                          "http://www.w3.org/2000/svg",
                          "rect",
                        )),
                        l.setAttribute("x", h.arguments[0]),
                        l.setAttribute("y", h.arguments[1]),
                        l.setAttribute("width", h.arguments[2]),
                        l.setAttribute("height", h.arguments[3]),
                        l.setAttribute("fill", t.fillStyle),
                        b.appendChild(l))
                      : "fillText" === h.name
                        ? ((l = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "text",
                          )),
                          (B = t.font.split(" ")),
                          (l.style.fontVariant = B.splice(0, 1)[0]),
                          (l.style.fontWeight = B.splice(0, 1)[0]),
                          (l.style.fontStyle = B.splice(0, 1)[0]),
                          (l.style.fontSize = B.splice(0, 1)[0]),
                          l.setAttribute("x", h.arguments[1]),
                          l.setAttribute(
                            "y",
                            h.arguments[2] -
                              (parseInt(l.style.fontSize, 10) + 3),
                          ),
                          l.setAttribute("fill", t.fillStyle),
                          (l.style.dominantBaseline = "text-before-edge"),
                          (l.style.fontFamily = B.join(" ")),
                          (D = g.createTextNode(h.arguments[0])),
                          l.appendChild(D),
                          b.appendChild(l))
                        : "drawImage" === h.name &&
                          0 < h.arguments[8] &&
                          h.arguments[7] &&
                          ((l = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "clipPath",
                          )),
                          l.setAttribute("id", "clipId" + r),
                          (D = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "rect",
                          )),
                          D.setAttribute("x", h.arguments[5]),
                          D.setAttribute("y", h.arguments[6]),
                          D.setAttribute("width", h.arguments[3]),
                          D.setAttribute("height", h.arguments[4]),
                          l.appendChild(D),
                          d.appendChild(l),
                          (l = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "image",
                          )),
                          l.setAttributeNS(
                            "http://www.w3.org/1999/xlink",
                            "xlink:href",
                            h.arguments[0].src,
                          ),
                          l.setAttribute("width", h.arguments[7]),
                          l.setAttribute("height", h.arguments[8]),
                          l.setAttribute("x", h.arguments[5]),
                          l.setAttribute("y", h.arguments[6]),
                          l.setAttribute("clip-path", "url(#clipId" + r + ")"),
                          l.setAttribute("preserveAspectRatio", "none"),
                          b.appendChild(l),
                          (r += 1));
                }
          e("html2canvas: Renderer: SVG Renderer done - returning SVG DOM obj");
          return b;
        },
      };
    };
  })(window, document);
  return a;
});
