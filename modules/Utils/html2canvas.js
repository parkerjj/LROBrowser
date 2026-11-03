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
      t;
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
        (void 0 !== a && (t = c.defaultView.getComputedStyle(a, null)),
          (p = t[e]),
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
            var l = a.length,
              f = 0;
            if ("number" === typeof p.length)
              for (var k = p.length; f < k; f++) a[l++] = p[f];
            else for (; p[f] !== d;) a[l++] = p[f++];
            a.length = l;
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
                  f = b.length, q = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((h = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/,
                  )),
                    h[2]
                      ? ((g = parseFloat(h[2])),
                        (g = "%" === h[3] ? g / 100 : g / c.width))
                      : (g = e * q),
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
                  f = b.length, q = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((h = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%)?/,
                  )),
                    h[2]
                      ? ((g = parseFloat(h[2])), h[3] && (g /= 100))
                      : (g = e * q),
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
                  f = b.length, q = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((h = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/,
                  )),
                    h[2]
                      ? ((g = parseFloat(h[2])),
                        (g = "%" === h[3] ? g / 100 : g / c.width))
                      : (g = e * q),
                    d.colorStops.push({ color: h[1], stop: g }));
          }
        return d;
      };
      h.Generate.Gradient = function (a, b) {
        var d = c.createElement("canvas"),
          g = d.getContext("2d"),
          f,
          k,
          q,
          n,
          m;
        d.width = b.width;
        d.height = b.height;
        f = h.Generate.parseGradient(a, b);
        m = new Image();
        if (f)
          if ("linear" === f.type) {
            k = g.createLinearGradient(f.x0, f.y0, f.x1, f.y1);
            q = 0;
            for (n = f.colorStops.length; q < n; q += 1)
              try {
                k.addColorStop(f.colorStops[q].stop, f.colorStops[q].color);
              } catch (J) {
                e([
                  "failed to add color stop: ",
                  J,
                  "; tried to add: ",
                  f.colorStops[q],
                  "; stop: ",
                  q,
                  "; in: ",
                  a,
                ]);
              }
            g.fillStyle = k;
            g.fillRect(0, 0, b.width, b.height);
            m.src = d.toDataURL();
          } else if ("circle" === f.type) {
            k = g.createRadialGradient(f.cx, f.cy, 0, f.cx, f.cy, f.rx);
            q = 0;
            for (n = f.colorStops.length; q < n; q += 1)
              try {
                k.addColorStop(f.colorStops[q].stop, f.colorStops[q].color);
              } catch (J) {
                e([
                  "failed to add color stop: ",
                  J,
                  "; tried to add: ",
                  f.colorStops[q],
                  "; stop: ",
                  q,
                  "; in: ",
                  a,
                ]);
              }
            g.fillStyle = k;
            g.fillRect(0, 0, b.width, b.height);
            m.src = d.toDataURL();
          } else if ("ellipse" === f.type) {
            b = c.createElement("canvas");
            var r = b.getContext("2d");
            k = Math.max(f.rx, f.ry);
            var C = 2 * k,
              B;
            b.width = b.height = C;
            k = r.createRadialGradient(f.rx, f.ry, 0, f.rx, f.ry, k);
            q = 0;
            for (n = f.colorStops.length; q < n; q += 1)
              try {
                k.addColorStop(f.colorStops[q].stop, f.colorStops[q].color);
              } catch (J) {
                e([
                  "failed to add color stop: ",
                  J,
                  "; tried to add: ",
                  f.colorStops[q],
                  "; stop: ",
                  q,
                  "; in: ",
                  a,
                ]);
              }
            r.fillStyle = k;
            r.fillRect(0, 0, C, C);
            g.fillStyle = f.colorStops[q - 1].color;
            g.fillRect(0, 0, d.width, d.height);
            B = new Image();
            B.onload = function () {
              g.drawImage(B, f.cx - f.rx, f.cy - f.ry, 2 * f.rx, 2 * f.ry);
              m.src = d.toDataURL();
            };
            B.src = b.toDataURL();
          }
        return m;
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
      function k(a) {
        return a.replace(/^\s*/g, "").replace(/\s*$/g, "");
      }
      function q(a, b, c) {
        c = c.ctx;
        var e = M(a, "fontFamily"),
          g = M(a, "fontSize"),
          p = M(a, "color"),
          q = M(a, "textDecoration"),
          m = M(a, "textAlign"),
          u = M(a, "letterSpacing"),
          v,
          C,
          r = M(a, "fontWeight"),
          B = M(a, "fontStyle"),
          t = M(a, "fontVariant"),
          x = 0,
          A;
        b.nodeValue = f(b.nodeValue, M(a, "textTransform"));
        if (0 < k(b.nodeValue).length) {
          if ("none" !== q)
            if (O[e + "-" + g] !== d) C = O[e + "-" + g];
            else {
              C = I.createElement("div");
              a = I.createElement("img");
              A = I.createElement("span");
              var J;
              C.style.visibility = "hidden";
              C.style.fontFamily = e;
              C.style.fontSize = g;
              C.style.margin = 0;
              C.style.padding = 0;
              K.appendChild(C);
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
              A.appendChild(I.createTextNode("Hidden Text"));
              C.appendChild(A);
              C.appendChild(a);
              J = a.offsetTop - A.offsetTop + 1;
              C.removeChild(A);
              C.appendChild(I.createTextNode("Hidden Text"));
              C.style.lineHeight = "normal";
              a.style.verticalAlign = "super";
              a = {
                baseline: J,
                lineWidth: 1,
                middle: a.offsetTop - C.offsetTop + 1,
              };
              O[e + "-" + g] = a;
              K.removeChild(C);
              C = a;
            }
          m = m.replace(["-webkit-auto"], ["auto"]);
          m =
            !1 === n.letterRendering &&
            /^(left|right|justify|auto)$/.test(m) &&
            /^(normal|none)$/.test(u)
              ? b.nodeValue.split(/(\b| )/)
              : b.nodeValue.split("");
          switch (parseInt(r, 10)) {
            case 401:
              r = "bold";
              break;
            case 400:
              r = "normal";
          }
          c.setVariable("fillStyle", p);
          c.setVariable("font", B + " " + t + " " + r + " " + g + " " + e);
          c.setVariable("textAlign", "left");
          g = b;
          r = 0;
          for (e = m.length; r < e; r += 1) {
            B = null;
            if (H.rangeBounds) {
              if ("none" !== q || 0 !== k(m[r]).length)
                ((B = m[r]),
                  I.createRange
                    ? ((v = I.createRange()),
                      v.setStart(b, x),
                      v.setEnd(b, x + B.length))
                    : (v = K.createTextRange()),
                  (v = v.getBoundingClientRect()
                    ? v.getBoundingClientRect()
                    : {}));
            } else {
              if ("string" !== typeof g.nodeValue) continue;
              t = g.splitText(m[r].length);
              u = g.parentNode;
              a = I.createElement("wrapper");
              A = g.cloneNode(!0);
              a.appendChild(g.cloneNode(!0));
              u.replaceChild(a, g);
              v = h.Util.Bounds(a);
              B = g.nodeValue;
              g = t;
              u.replaceChild(A, a);
            }
            null !== B &&
              ((t = v.left),
              (u = v.bottom),
              (a = c),
              0 < k(B).length && a.fillText(B, t, u));
            switch (q) {
              case "underline":
                l(
                  c,
                  v.left,
                  Math.round(v.top + C.baseline + C.lineWidth),
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
                  Math.ceil(v.top + C.middle + C.lineWidth),
                  v.width,
                  1,
                  p,
                );
            }
            x += m[r].length;
          }
        }
      }
      function u(b) {
        return (b = a[b]) && !0 === b.succeeded ? b.img : !1;
      }
      function v(a, b) {
        var c = Math.max(a.left, b.left),
          d = Math.max(a.top, b.top);
        return {
          left: c,
          top: d,
          width: Math.min(a.left + a.width, b.left + b.width) - c,
          height: Math.min(a.top + a.height, b.top + b.height) - d,
        };
      }
      function r(a, b, c, d) {
        var f = c.left,
          e = c.top,
          g = c.width;
        c = c.height;
        var l,
          k,
          q,
          h,
          n,
          m,
          u,
          C = (function (a) {
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
          if (((l = C[a]), (u = []), 0 < l.width)) {
            k = f;
            q = e;
            h = g;
            n = c - C[2].width;
            switch (a) {
              case 0:
                n = C[0].width;
                m = 0;
                u[m++] = ["line", k, q];
                u[m++] = ["line", k + h, q];
                u[m++] = ["line", k + h - C[1].width, q + n];
                u[m++] = ["line", k + C[3].width, q + n];
                break;
              case 1:
                k = f + g - C[1].width;
                h = C[1].width;
                m = 0;
                u[m++] = ["line", k, q + C[0].width];
                u[m++] = ["line", k + h, q];
                u[m++] = ["line", k + h, q + n + C[2].width];
                u[m++] = ["line", k, q + n];
                break;
              case 2:
                q = q + c - C[2].width;
                n = C[2].width;
                m = 0;
                u[m++] = ["line", k + C[3].width, q];
                u[m++] = ["line", k + h - C[2].width, q];
                u[m++] = ["line", k + h, q + n];
                u[m++] = ["line", k, q + n];
                break;
              case 3:
                ((h = C[3].width),
                  (m = 0),
                  (u[m++] = ["line", k, q]),
                  (u[m++] = ["line", k + h, q + C[0].width]),
                  (u[m++] = ["line", k + h, q + n]),
                  (u[m++] = ["line", k, q + n + C[2].width]));
            }
            m = { left: k, top: q, width: h, height: n };
            d && (m = v(m, d));
            if (0 < m.width && 0 < m.height && "transparent" !== l.color)
              for (
                b.setVariable("fillStyle", l.color),
                  l = b.drawShape(),
                  k = u.length,
                  m = 0;
                m < k;
                m++
              )
                l[0 === m ? "moveTo" : u[m][0] + "To"].apply(
                  null,
                  u[m].slice(1),
                );
          }
        return C;
      }
      function C(a, b, c) {
        var d = I.createElement("valuewrap"),
          f =
            "lineHeight textAlign fontFamily color fontSize paddingLeft paddingTop width height border borderLeftWidth borderTopWidth".split(
              " ",
            ),
          g,
          l,
          k;
        g = 0;
        for (l = f.length; g < l; g += 1) {
          k = f[g];
          try {
            d.style[k] = M(a, k);
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
        K.appendChild(d);
        q(a, b, c);
        K.removeChild(d);
      }
      function B(a, b, c, d, f, e, g, l) {
        var k = 0,
          p = 0;
        0 < g - c && (k = g - c);
        0 < l - d && (p = l - d);
        a.drawImage(b, k, p, f - k, e - p, c + k, d + p, f - k, e - p);
      }
      function t(a, b, c, d, f, e, g) {
        g = Math.min(b.height, g);
        var l, k;
        c.left -= Math.ceil(c.left / b.width) * b.width;
        for (k = d + c.left; k < e + d;)
          ((l = Math.floor(k + b.width) > e + d ? e + d - k : b.width),
            B(a, b, k, f + c.top, l, g, d, f),
            (k = Math.floor(k + b.width)));
      }
      function D(a, b) {
        var c = h.Util.Bounds(a),
          d = c.left,
          f = c.top,
          q = c.width,
          A = c.height,
          O,
          J = M(a, "backgroundColor"),
          y = M(a, "position"),
          D,
          H = M(a, "opacity"),
          E;
        b ? (L = {}) : ((L = g()), (b = { opacity: 1 }));
        E = M(a, "zIndex");
        (D = b.zIndex)
          ? "auto" !== E &&
            ((E = { zindex: E, children: [] }), D.children.push(E), (D = E))
          : (D = E = { zindex: 0, children: [] });
        E = {
          ctx: m(L.width || q, L.height || A),
          zIndex: D,
          opacity: H * b.opacity,
          cssPosition: y,
        };
        b.clip && (E.clip = h.Util.Extend({}, b.clip));
        !0 === n.useOverflow &&
          !0 === /(hidden|scroll|auto)/.test(M(a, "overflow")) &&
          !1 === /(BODY)/i.test(a.nodeName) &&
          (E.clip = E.clip ? v(E.clip, c) : c);
        b = D.children.push(E);
        H = D.children[b - 1].ctx;
        H.setVariable("globalAlpha", E.opacity);
        y = r(a, H, c, !1);
        E.borders = y;
        x.test(a.nodeName) &&
          "transparent" !== n.iframeDefault &&
          (J = "default" === n.iframeDefault ? "#efefef" : n.iframeDefault);
        q = {
          left: d + y[3].width,
          top: f + y[0].width,
          width: q - (y[1].width + y[3].width),
          height: A - (y[0].width + y[2].width),
        };
        E.clip && (q = v(q, E.clip));
        if (0 < q.height && 0 < q.width) {
          l(H, q.left, q.top, q.width, q.height, J);
          var K = q,
            z = M(a, "backgroundImage"),
            F = M(a, "backgroundRepeat").split(",")[0],
            N,
            Q,
            V;
          /data:image\/.*;base64,/i.test(z) ||
            /^(-webkit|-moz|linear-gradient|-o-)/.test(z) ||
            (z = z.split(",")[0]);
          if ("undefined" !== typeof z && !1 === /^(1|none)$/.test(z))
            if (
              ((z = h.Util.backgroundImage(z)),
              (J = u(z)),
              (A = h.Util.BackgroundPosition(a, K, J)),
              J)
            )
              switch (F) {
                case "repeat-x":
                  t(H, J, A, K.left, K.top, K.width, K.height);
                  break;
                case "repeat-y":
                  z = K.left;
                  F = K.top;
                  N = K.height;
                  Q = Math.min(J.width, K.width);
                  A.top -= Math.ceil(A.top / J.height) * J.height;
                  for (V = F + A.top; V < N + F;)
                    ((K =
                      Math.floor(V + J.height) > N + F ? N + F - V : J.height),
                      B(H, J, z + A.left, V, Q, K, z, F),
                      (V = Math.floor(V + J.height)));
                  break;
                case "no-repeat":
                  z = K.width - A.left;
                  V = K.height - A.top;
                  F = A.left;
                  N = A.top;
                  Q = A.left + K.left;
                  A = A.top + K.top;
                  0 > F
                    ? ((F = Math.abs(F)),
                      (Q += F),
                      (z = Math.min(K.width, J.width - F)))
                    : ((z = Math.min(z, J.width)), (F = 0));
                  0 > N
                    ? ((N = Math.abs(N)),
                      (A += N),
                      (V = Math.min(K.height, J.height - N)))
                    : ((V = Math.min(V, J.height)), (N = 0));
                  0 < V && 0 < z && H.drawImage(J, F, N, z, V, Q, A, z, V);
                  break;
                default:
                  for (
                    A.top -= Math.ceil(A.top / J.height) * J.height,
                      z = K.top + A.top;
                    z < K.height + K.top;
                  )
                    ((F = Math.min(J.height, K.height + K.top - z)),
                      (F =
                        Math.floor(z + J.height) > F + z
                          ? F + z - z
                          : J.height),
                      z < K.top ? ((N = K.top - z), (z = K.top)) : (N = 0),
                      t(H, J, A, K.left, z, K.width, F),
                      0 < N && (A.top += N),
                      (z = Math.floor(z + J.height) - N));
              }
            else e("html2canvas: Error loading background:" + z);
        }
        switch (a.nodeName) {
          case "IMG":
            E = a.getAttribute("src");
            (O = u(E))
              ? ((E = p(a, "paddingLeft")),
                (q = p(a, "paddingTop")),
                (J = p(a, "paddingRight")),
                (A = p(a, "paddingBottom")),
                H.drawImage(
                  O,
                  0,
                  0,
                  O.width,
                  O.height,
                  d + E + y[3].width,
                  f + q + y[0].width,
                  c.width - (y[1].width + y[3].width + E + J),
                  c.height - (y[0].width + y[2].width + q + A),
                ))
              : e("html2canvas: Error loading \x3cimg\x3e:" + E);
            break;
          case "INPUT":
            /^(text|url|email|submit|button|reset)$/.test(a.type) &&
              0 < a.value.length &&
              C(a, c, E);
            break;
          case "TEXTAREA":
            0 < a.value.length && C(a, c, E);
            break;
          case "SELECT":
            0 < a.options.length && C(a, c, E);
            break;
          case "LI":
            c = q;
            d = M(a, "listStylePosition");
            y = M(a, "listStyleType");
            f = M(a, "fontWeight");
            if (
              /^(decimal|decimal-leading-zero|upper-alpha|upper-latin|upper-roman|lower-alpha|lower-greek|lower-latin|lower-roman)$/i.test(
                y,
              )
            ) {
              H = -1;
              E = 1;
              q = a.parentNode.childNodes;
              if (a.parentNode) {
                for (; q[++H] !== a;) 1 === q[H].nodeType && E++;
                H = E;
              } else H = -1;
              switch (y) {
                case "decimal":
                  O = H;
                  break;
                case "decimal-leading-zero":
                  O =
                    1 === H.toString().length
                      ? "0" + H.toString()
                      : H.toString();
                  break;
                case "upper-roman":
                  O = h.Generate.ListRoman(H);
                  break;
                case "lower-roman":
                  O = h.Generate.ListRoman(H).toLowerCase();
                  break;
                case "lower-alpha":
                  O = h.Generate.ListAlpha(H).toLowerCase();
                  break;
                case "upper-alpha":
                  O = h.Generate.ListAlpha(H);
              }
              E = O += ". ";
              y = I.createElement("boundelement");
              y.style.display = "inline";
              H = a.style.listStyleType;
              a.style.listStyleType = "none";
              y.appendChild(I.createTextNode(E));
              a.insertBefore(y, a.firstChild);
              E = h.Util.Bounds(y);
              a.removeChild(y);
              a.style.listStyleType = H;
              switch (f) {
                case 401:
                  f = "bold";
                  break;
                case 400:
                  f = "normal";
              }
              G.setVariable("fillStyle", M(a, "color"));
              G.setVariable(
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
                (G.setVariable("textAlign", "left"),
                (a = c.left),
                (c = E.bottom),
                (d = G),
                0 < k(O).length && d.fillText(O, a, c));
            }
            break;
          case "CANVAS":
            ((E = p(a, "paddingLeft")),
              (q = p(a, "paddingTop")),
              (J = p(a, "paddingRight")),
              (A = p(a, "paddingBottom")),
              H.drawImage(
                a,
                0,
                0,
                a.width,
                a.height,
                d + E + y[3].width,
                f + q + y[0].width,
                c.width - (y[1].width + y[3].width + E + J),
                c.height - (y[0].width + y[2].width + q + A),
              ));
        }
        return D.children[b - 1];
      }
      function y(a, b) {
        if (
          "none" !== M(a, "display") &&
          "hidden" !== M(a, "visibility") &&
          !a.hasAttribute("data-html2canvas-ignore") &&
          ((b = D(a, b) || b), (G = b.ctx), !x.test(a.nodeName))
        ) {
          var c = h.Util.Children(a),
            d,
            f,
            e;
          d = 0;
          for (e = c.length; d < e; d += 1)
            ((f = c[d]),
              1 === f.nodeType ? y(f, b) : 3 === f.nodeType && q(a, f, b));
        }
      }
      b.scroll(0, 0);
      var H = {
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
        N = n.elements === d ? c.body : n.elements[0],
        O = {},
        I = N.ownerDocument,
        x = new RegExp("(" + n.ignoreElements + ")"),
        K = I.body,
        E,
        F,
        z,
        G,
        L;
      a = a || {};
      I.createRange &&
        ((E = I.createRange()),
        E.getBoundingClientRect &&
          ((F = I.createElement("boundtest")),
          (F.style.height = "123px"),
          (F.style.display = "block"),
          K.appendChild(F),
          E.selectNode(F),
          (E = E.getBoundingClientRect()),
          (E = E.height),
          123 === E && (H.rangeBounds = !0),
          K.removeChild(F)));
      var M = h.Util.getCSS;
      z = D(N, null);
      H.svgRendering &&
        (function (a) {
          function b(a) {
            a = h.Util.Children(a);
            var c = a.length,
              d,
              e,
              g,
              k,
              l;
            for (l = 0; l < c; l += 1)
              if (((k = a[l]), 3 === k.nodeType))
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
            z.svgRender = c;
          };
        })(c.documentElement);
      F = 0;
      N = N.children;
      for (E = N.length; F < E; F += 1) y(N[F], z);
      z.backgroundColor = M(c.documentElement, "backgroundColor");
      return z;
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
        var k,
          p = a.proxy,
          q;
        t.href = c;
        c = t.href;
        k = "html2canvas_" + v++;
        g.callbackname = k;
        p = -1 < p.indexOf("?") ? p + "\x26" : p + "?";
        p += "url\x3d" + encodeURIComponent(c) + "\x26callback\x3d" + k;
        q = r.createElement("script");
        b[k] = function (a) {
          "error:" === a.substring(0, 6)
            ? ((g.succeeded = !1), f.numLoaded++, f.numFailed++, n())
            : (l(e, g), (e.src = a));
          b[k] = d;
          try {
            delete b[k];
          } catch (F) {}
          q.parentNode.removeChild(q);
          q = null;
          delete g.script;
          delete g.callbackname;
        };
        q.setAttribute("type", "text/javascript");
        q.setAttribute("src", p);
        g.script = q;
        b.document.body.appendChild(q);
      }
      function p(a) {
        var b = h.Util.Children(a),
          c,
          g,
          k = !1;
        try {
          var l = b.length;
          for (c = 0; c < l; c += 1) p(b[c]);
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
      function l(c, e) {
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
        k,
        q,
        m,
        v = 0;
      m = a.elements[0] || c.body;
      var r = m.ownerDocument,
        C = r.images,
        B = C.length,
        t = r.createElement("a"),
        D = new Image().crossOrigin !== d,
        y;
      t.href = b.location.href;
      k = t.protocol + t.host;
      q = {
        loadImage: function (c) {
          var e, p;
          c &&
            f[c] === d &&
            ((e = new Image()),
            c.match(/data:image\/.*;base64,/i)
              ? ((e.src = c.replace(/url\(['"]{0,}|['"]{0,}\)$/gi, "")),
                (p = f[c] = { img: e }),
                f.numTotal++,
                l(e, p))
              : ((t.href = c),
                (t.href = t.href),
                t.protocol + t.host === k || !0 === a.allowTaint
                  ? ((p = f[c] = { img: e }),
                    f.numTotal++,
                    l(e, p),
                    (e.src = c))
                  : D && !a.allowTaint && a.useCORS
                    ? ((e.crossOrigin = "anonymous"),
                      (p = f[c] = { img: e }),
                      f.numTotal++,
                      l(e, p),
                      (e.src = c),
                      (e.customComplete = function () {
                        if (this.img.complete) this.img.onerror();
                        else
                          this.timer = b.setTimeout(
                            this.img.customComplete,
                            100,
                          );
                      }.bind(p)),
                      e.customComplete())
                    : a.proxy &&
                      ((p = f[c] = { img: e }), f.numTotal++, g(c, e, p))));
        },
        cleanupDOM: function (g) {
          var k, l;
          if (!f.cleanupDone) {
            g && "string" === typeof g
              ? e("html2canvas: Cleanup because: " + g)
              : e("html2canvas: Cleanup after timeout: " + a.timeout + " ms.");
            for (l in f)
              if (
                f.hasOwnProperty(l) &&
                ((k = f[l]),
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
                    l +
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
          y && b.clearTimeout(y);
        },
      };
      0 < a.timeout && (y = b.setTimeout(q.cleanupDOM, a.timeout));
      e("html2canvas: Preload starts: finding background-images");
      f.firstRun = !0;
      p(m);
      e("html2canvas: Preload: Finding images");
      for (m = 0; m < B; m += 1) q.loadImage(C[m].getAttribute("src"));
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
        var g, l, p, h;
        g = 0;
        for (p = a.length; g < p; g += 1)
          ((l = a[g]),
            l.children && 0 < l.children.length
              ? (b.push(l), c.push(l.zindex))
              : e.push(l));
        c.sort(function (a, b) {
          return a - b;
        });
        a = 0;
        for (g = c.length; a < g; a += 1)
          for (l = c[a], p = 0, h = b.length; p <= h; p += 1)
            if (b[p].zindex === l) {
              l = b.splice(p, 1);
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
        p,
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
            if (((p = h.Renderer(g, l)), "function" === typeof l.onrendered))
              l.onrendered(p);
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
      var h = a.canvas || c.createElement("canvas"),
        g = !1,
        p = !1,
        l = !1,
        f;
      if (h.getContext)
        (e("html2canvas: Renderer: using canvas renderer"), (l = !0));
      else if (a.flashcanvas !== d) {
        g = !0;
        e("html2canvas: Renderer: canvas not available, using flashcanvas");
        var k = c.createElement("script");
        k.src = a.flashcanvas;
        k.onload = (function (a, c) {
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
        })(k, function () {
          "undefined" !== typeof b.FlashCanvas &&
            (e("html2canvas: Renderer: Flashcanvas initialized"),
            b.FlashCanvas.initElement(h),
            (l = !0),
            !1 !== p && f._create.apply(null, p));
        });
        c.body.appendChild(k);
      }
      return (f = {
        _create: function (a, b, f, k, n) {
          if (!l) return ((p = arguments), h);
          var q = h.getContext("2d"),
            m,
            u,
            v,
            C,
            r,
            t,
            A = c.createElement("canvas");
          r = A.getContext !== d;
          var x,
            K,
            A = r ? A.getContext("2d") : {};
          t = [];
          h.width = h.style.width = g
            ? Math.min(2880, b.width || a.ctx.width)
            : b.width || a.ctx.width;
          h.height = h.style.height = g
            ? Math.min(2880, b.height || a.ctx.height)
            : b.height || a.ctx.height;
          m = q.fillStyle;
          q.fillStyle = a.backgroundColor;
          q.fillRect(0, 0, h.width, h.height);
          q.fillStyle = m;
          if (b.svgRendering && a.svgRender !== d)
            q.drawImage(a.svgRender, 0, 0);
          else
            for (u = 0, v = k.length; u < v; u += 1) {
              m = k.splice(0, 1)[0];
              m.canvasPosition = m.canvasPosition || {};
              q.textBaseline = "bottom";
              m.clip &&
                (q.save(),
                q.beginPath(),
                q.rect(m.clip.left, m.clip.top, m.clip.width, m.clip.height),
                q.clip());
              if (m.ctx.storage)
                for (C = 0, x = m.ctx.storage.length; C < x; C += 1)
                  switch (((K = m.ctx.storage[C]), K.type)) {
                    case "variable":
                      q[K.name] = K.arguments;
                      break;
                    case "function":
                      if ("fillRect" === K.name)
                        (!g ||
                          (2880 > K.arguments[0] + K.arguments[2] &&
                            2880 > K.arguments[1] + K.arguments[3])) &&
                          q.fillRect.apply(q, K.arguments);
                      else if ("drawShape" === K.name) {
                        K = K.arguments;
                        var E,
                          F = K.length;
                        q.beginPath();
                        for (E = 0; E < F; E++)
                          q[K[E].name].apply(q, K[E].arguments);
                        q.closePath();
                        q.fill();
                      } else if ("fillText" === K.name)
                        (!g ||
                          (2880 > K.arguments[1] && 2880 > K.arguments[2])) &&
                          q.fillText.apply(q, K.arguments);
                      else if (
                        "drawImage" === K.name &&
                        0 < K.arguments[8] &&
                        K.arguments[7]
                      ) {
                        if (
                          r &&
                          b.taintTest &&
                          -1 === t.indexOf(K.arguments[0].src)
                        ) {
                          A.drawImage(K.arguments[0], 0, 0);
                          try {
                            A.getImageData(0, 0, 1, 1);
                          } catch (z) {
                            A = f.createElement("canvas");
                            A = A.getContext("2d");
                            continue;
                          }
                          t.push(K.arguments[0].src);
                        }
                        q.drawImage.apply(q, K.arguments);
                      }
                  }
              m.clip && q.restore();
            }
          e(
            "html2canvas: Renderer: Canvas renderer done - returning canvas obj",
          );
          v = b.elements.length;
          return 1 === v &&
            "object" === typeof b.elements[0] &&
            "BODY" !== b.elements[0].nodeName &&
            !1 === g
            ? ((t = n.Util.Bounds(b.elements[0])),
              (r = f.createElement("canvas")),
              (r.width = t.width),
              (r.height = t.height),
              (q = r.getContext("2d")),
              q.drawImage(
                h,
                t.left,
                t.top,
                t.width,
                t.height,
                0,
                0,
                t.width,
                t.height,
              ),
              (h = null),
              r)
            : h;
        },
      });
    };
    h.Renderer.SVG = function (a) {
      var b = c.createElementNS("http://www.w3.org/2000/svg", "svg"),
        d = c.createElementNS("http://www.w3.org/2000/svg", "defs"),
        p,
        l,
        f,
        k,
        q,
        h,
        m,
        r = {},
        C,
        B,
        t = 0;
      return {
        _create: function (a, c, g, n, u) {
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
              for (l = 0, k = q.ctx.storage.length; l < k; l += 1)
                switch (((h = q.ctx.storage[l]), h.type)) {
                  case "variable":
                    r[h.name] = h.arguments;
                    break;
                  case "function":
                    "fillRect" === h.name
                      ? ((m = g.createElementNS(
                          "http://www.w3.org/2000/svg",
                          "rect",
                        )),
                        m.setAttribute("x", h.arguments[0]),
                        m.setAttribute("y", h.arguments[1]),
                        m.setAttribute("width", h.arguments[2]),
                        m.setAttribute("height", h.arguments[3]),
                        m.setAttribute("fill", r.fillStyle),
                        b.appendChild(m))
                      : "fillText" === h.name
                        ? ((m = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "text",
                          )),
                          (B = r.font.split(" ")),
                          (m.style.fontVariant = B.splice(0, 1)[0]),
                          (m.style.fontWeight = B.splice(0, 1)[0]),
                          (m.style.fontStyle = B.splice(0, 1)[0]),
                          (m.style.fontSize = B.splice(0, 1)[0]),
                          m.setAttribute("x", h.arguments[1]),
                          m.setAttribute(
                            "y",
                            h.arguments[2] -
                              (parseInt(m.style.fontSize, 10) + 3),
                          ),
                          m.setAttribute("fill", r.fillStyle),
                          (m.style.dominantBaseline = "text-before-edge"),
                          (m.style.fontFamily = B.join(" ")),
                          (C = g.createTextNode(h.arguments[0])),
                          m.appendChild(C),
                          b.appendChild(m))
                        : "drawImage" === h.name &&
                          0 < h.arguments[8] &&
                          h.arguments[7] &&
                          ((m = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "clipPath",
                          )),
                          m.setAttribute("id", "clipId" + t),
                          (C = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "rect",
                          )),
                          C.setAttribute("x", h.arguments[5]),
                          C.setAttribute("y", h.arguments[6]),
                          C.setAttribute("width", h.arguments[3]),
                          C.setAttribute("height", h.arguments[4]),
                          m.appendChild(C),
                          d.appendChild(m),
                          (m = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "image",
                          )),
                          m.setAttributeNS(
                            "http://www.w3.org/1999/xlink",
                            "xlink:href",
                            h.arguments[0].src,
                          ),
                          m.setAttribute("width", h.arguments[7]),
                          m.setAttribute("height", h.arguments[8]),
                          m.setAttribute("x", h.arguments[5]),
                          m.setAttribute("y", h.arguments[6]),
                          m.setAttribute("clip-path", "url(#clipId" + t + ")"),
                          m.setAttribute("preserveAspectRatio", "none"),
                          b.appendChild(m),
                          (t += 1));
                }
          e("html2canvas: Renderer: SVG Renderer done - returning SVG DOM obj");
          return b;
        },
      };
    };
  })(window, document);
  return a;
});
