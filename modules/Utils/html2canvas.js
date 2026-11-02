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
      q;
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
        (void 0 !== a && (q = c.defaultView.getComputedStyle(a, null)),
          (k = q[e]),
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
          var u = a.childNodes;
          a = [];
          if (null !== u) {
            var l = a.length,
              f = 0;
            if ("number" === typeof u.length)
              for (var n = u.length; f < n; f++) a[l++] = u[f];
            else for (; u[f] !== d;) a[l++] = u[f++];
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
          p,
          k;
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
                  f = b.length, p = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((k = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/,
                  )),
                    k[2]
                      ? ((g = parseFloat(k[2])),
                        (g = "%" === k[3] ? g / 100 : g / c.width))
                      : (g = e * p),
                    d.colorStops.push({ color: k[1], stop: g }));
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
                  ((k = b[e].match(
                    /(from|to|color-stop)\(([0-9\.]+)?(?:,\s)?((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\)/,
                  )),
                    (g = parseFloat(k[2])),
                    "from" === k[1] && (g = 0),
                    "to" === k[1] && (g = 1),
                    d.colorStops.push({ color: k[3], stop: g }));
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
                  f = b.length, p = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((k = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%)?/,
                  )),
                    k[2]
                      ? ((g = parseFloat(k[2])), k[3] && (g /= 100))
                      : (g = e * p),
                    d.colorStops.push({ color: k[1], stop: g }));
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
              k = g[4].match(/[a-z-]*/);
              if (b && k)
                switch (k[0]) {
                  case "farthest-corner":
                  case "cover":
                  case "":
                    e = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.cy, 2));
                    b = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.y1 - d.cy, 2));
                    f = Math.sqrt(
                      Math.pow(d.x1 - d.cx, 2) + Math.pow(d.y1 - d.cy, 2),
                    );
                    k = Math.sqrt(Math.pow(d.x1 - d.cx, 2) + Math.pow(d.cy, 2));
                    d.rx = d.ry = Math.max(e, b, f, k);
                    break;
                  case "closest-corner":
                    e = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.cy, 2));
                    b = Math.sqrt(Math.pow(d.cx, 2) + Math.pow(d.y1 - d.cy, 2));
                    f = Math.sqrt(
                      Math.pow(d.x1 - d.cx, 2) + Math.pow(d.y1 - d.cy, 2),
                    );
                    k = Math.sqrt(Math.pow(d.x1 - d.cx, 2) + Math.pow(d.cy, 2));
                    d.rx = d.ry = Math.min(e, b, f, k);
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
                  f = b.length, p = 1 / Math.max(f - 1, 1), e = 0;
                  e < f;
                  e += 1
                )
                  ((k = b[e].match(
                    /((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/,
                  )),
                    k[2]
                      ? ((g = parseFloat(k[2])),
                        (g = "%" === k[3] ? g / 100 : g / c.width))
                      : (g = e * p),
                    d.colorStops.push({ color: k[1], stop: g }));
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
          t;
        d.width = b.width;
        d.height = b.height;
        f = h.Generate.parseGradient(a, b);
        t = new Image();
        if (f)
          if ("linear" === f.type) {
            n = g.createLinearGradient(f.x0, f.y0, f.x1, f.y1);
            k = 0;
            for (m = f.colorStops.length; k < m; k += 1)
              try {
                n.addColorStop(f.colorStops[k].stop, f.colorStops[k].color);
              } catch (J) {
                e([
                  "failed to add color stop: ",
                  J,
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
            t.src = d.toDataURL();
          } else if ("circle" === f.type) {
            n = g.createRadialGradient(f.cx, f.cy, 0, f.cx, f.cy, f.rx);
            k = 0;
            for (m = f.colorStops.length; k < m; k += 1)
              try {
                n.addColorStop(f.colorStops[k].stop, f.colorStops[k].color);
              } catch (J) {
                e([
                  "failed to add color stop: ",
                  J,
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
            t.src = d.toDataURL();
          } else if ("ellipse" === f.type) {
            b = c.createElement("canvas");
            var r = b.getContext("2d");
            n = Math.max(f.rx, f.ry);
            var q = 2 * n,
              C;
            b.width = b.height = q;
            n = r.createRadialGradient(f.rx, f.ry, 0, f.rx, f.ry, n);
            k = 0;
            for (m = f.colorStops.length; k < m; k += 1)
              try {
                n.addColorStop(f.colorStops[k].stop, f.colorStops[k].color);
              } catch (J) {
                e([
                  "failed to add color stop: ",
                  J,
                  "; tried to add: ",
                  f.colorStops[k],
                  "; stop: ",
                  k,
                  "; in: ",
                  a,
                ]);
              }
            r.fillStyle = n;
            r.fillRect(0, 0, q, q);
            g.fillStyle = f.colorStops[k - 1].color;
            g.fillRect(0, 0, d.width, d.height);
            C = new Image();
            C.onload = function () {
              g.drawImage(C, f.cx - f.rx, f.cy - f.ry, 2 * f.rx, 2 * f.ry);
              t.src = d.toDataURL();
            };
            C.src = b.toDataURL();
          }
        return t;
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
            Math.max(H.body.scrollWidth, H.documentElement.scrollWidth),
            Math.max(H.body.offsetWidth, H.documentElement.offsetWidth),
            Math.max(H.body.clientWidth, H.documentElement.clientWidth),
          ),
          height: Math.max(
            Math.max(H.body.scrollHeight, H.documentElement.scrollHeight),
            Math.max(H.body.offsetHeight, H.documentElement.offsetHeight),
            Math.max(H.body.clientHeight, H.documentElement.clientHeight),
          ),
        };
      }
      function u(a, b) {
        a = parseInt(N(a, b), 10);
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
        var e = N(a, "fontFamily"),
          g = N(a, "fontSize"),
          p = N(a, "color"),
          u = N(a, "textDecoration"),
          t = N(a, "textAlign"),
          m = N(a, "letterSpacing"),
          v,
          r,
          C = N(a, "fontWeight"),
          q = N(a, "fontStyle"),
          z = N(a, "fontVariant"),
          E = 0,
          V;
        b.nodeValue = f(b.nodeValue, N(a, "textTransform"));
        if (0 < n(b.nodeValue).length) {
          if ("none" !== u)
            if (M[e + "-" + g] !== d) r = M[e + "-" + g];
            else {
              r = H.createElement("div");
              a = H.createElement("img");
              V = H.createElement("span");
              var x;
              r.style.visibility = "hidden";
              r.style.fontFamily = e;
              r.style.fontSize = g;
              r.style.margin = 0;
              r.style.padding = 0;
              I.appendChild(r);
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
              V.appendChild(H.createTextNode("Hidden Text"));
              r.appendChild(V);
              r.appendChild(a);
              x = a.offsetTop - V.offsetTop + 1;
              r.removeChild(V);
              r.appendChild(H.createTextNode("Hidden Text"));
              r.style.lineHeight = "normal";
              a.style.verticalAlign = "super";
              a = {
                baseline: x,
                lineWidth: 1,
                middle: a.offsetTop - r.offsetTop + 1,
              };
              M[e + "-" + g] = a;
              I.removeChild(r);
              r = a;
            }
          t = t.replace(["-webkit-auto"], ["auto"]);
          t =
            !1 === k.letterRendering &&
            /^(left|right|justify|auto)$/.test(t) &&
            /^(normal|none)$/.test(m)
              ? b.nodeValue.split(/(\b| )/)
              : b.nodeValue.split("");
          switch (parseInt(C, 10)) {
            case 401:
              C = "bold";
              break;
            case 400:
              C = "normal";
          }
          c.setVariable("fillStyle", p);
          c.setVariable("font", q + " " + z + " " + C + " " + g + " " + e);
          c.setVariable("textAlign", "left");
          g = b;
          C = 0;
          for (e = t.length; C < e; C += 1) {
            q = null;
            if (F.rangeBounds) {
              if ("none" !== u || 0 !== n(t[C]).length)
                ((q = t[C]),
                  H.createRange
                    ? ((v = H.createRange()),
                      v.setStart(b, E),
                      v.setEnd(b, E + q.length))
                    : (v = I.createTextRange()),
                  (v = v.getBoundingClientRect()
                    ? v.getBoundingClientRect()
                    : {}));
            } else {
              if ("string" !== typeof g.nodeValue) continue;
              z = g.splitText(t[C].length);
              m = g.parentNode;
              a = H.createElement("wrapper");
              V = g.cloneNode(!0);
              a.appendChild(g.cloneNode(!0));
              m.replaceChild(a, g);
              v = h.Util.Bounds(a);
              q = g.nodeValue;
              g = z;
              m.replaceChild(V, a);
            }
            null !== q &&
              ((z = v.left),
              (m = v.bottom),
              (a = c),
              0 < n(q).length && a.fillText(q, z, m));
            switch (u) {
              case "underline":
                l(
                  c,
                  v.left,
                  Math.round(v.top + r.baseline + r.lineWidth),
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
                  Math.ceil(v.top + r.middle + r.lineWidth),
                  v.width,
                  1,
                  p,
                );
            }
            E += t[C].length;
          }
        }
      }
      function v(b) {
        return (b = a[b]) && !0 === b.succeeded ? b.img : !1;
      }
      function t(a, b) {
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
          n,
          k,
          p,
          h,
          m,
          v,
          r = (function (a) {
            var b = [],
              c = ["Top", "Right", "Bottom", "Left"],
              d;
            for (d = 0; 4 > d; d += 1)
              b.push({
                width: u(a, "border" + c[d] + "Width"),
                color: N(a, "border" + c[d] + "Color"),
              });
            return b;
          })(a);
        (function (a) {
          var b = [],
            c = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"],
            d;
          for (d = 0; 4 > d; d += 1) b.push(N(a, "border" + c[d] + "Radius"));
          return b;
        })(a);
        for (a = 0; 4 > a; a += 1)
          if (((l = r[a]), (v = []), 0 < l.width)) {
            n = f;
            k = e;
            p = g;
            h = c - r[2].width;
            switch (a) {
              case 0:
                h = r[0].width;
                m = 0;
                v[m++] = ["line", n, k];
                v[m++] = ["line", n + p, k];
                v[m++] = ["line", n + p - r[1].width, k + h];
                v[m++] = ["line", n + r[3].width, k + h];
                break;
              case 1:
                n = f + g - r[1].width;
                p = r[1].width;
                m = 0;
                v[m++] = ["line", n, k + r[0].width];
                v[m++] = ["line", n + p, k];
                v[m++] = ["line", n + p, k + h + r[2].width];
                v[m++] = ["line", n, k + h];
                break;
              case 2:
                k = k + c - r[2].width;
                h = r[2].width;
                m = 0;
                v[m++] = ["line", n + r[3].width, k];
                v[m++] = ["line", n + p - r[2].width, k];
                v[m++] = ["line", n + p, k + h];
                v[m++] = ["line", n, k + h];
                break;
              case 3:
                ((p = r[3].width),
                  (m = 0),
                  (v[m++] = ["line", n, k]),
                  (v[m++] = ["line", n + p, k + r[0].width]),
                  (v[m++] = ["line", n + p, k + h]),
                  (v[m++] = ["line", n, k + h + r[2].width]));
            }
            m = { left: n, top: k, width: p, height: h };
            d && (m = t(m, d));
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
        return r;
      }
      function q(a, b, c) {
        var d = H.createElement("valuewrap"),
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
            d.style[n] = N(a, n);
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
          d.style.lineHeight = N(a, "height");
        d.style.top = b.top + "px";
        d.style.left = b.left + "px";
        b = H.createTextNode(
          "SELECT" === a.nodeName ? a.options[a.selectedIndex].text : a.value,
        );
        d.appendChild(b);
        I.appendChild(d);
        p(a, b, c);
        I.removeChild(d);
      }
      function C(a, b, c, d, f, e, g, l) {
        var n = 0,
          k = 0;
        0 < g - c && (n = g - c);
        0 < l - d && (k = l - d);
        a.drawImage(b, n, k, f - n, e - k, c + n, d + k, f - n, e - k);
      }
      function J(a, b, c, d, f, e, g) {
        g = Math.min(b.height, g);
        var l, n;
        c.left -= Math.ceil(c.left / b.width) * b.width;
        for (n = d + c.left; n < e + d;)
          ((l = Math.floor(n + b.width) > e + d ? e + d - n : b.width),
            C(a, b, n, f + c.top, l, g, d, f),
            (n = Math.floor(n + b.width)));
      }
      function A(a, b) {
        var c = h.Util.Bounds(a),
          d = c.left,
          f = c.top,
          p = c.width,
          z = c.height,
          E,
          M = N(a, "backgroundColor"),
          A = N(a, "position"),
          B,
          F = N(a, "opacity"),
          y;
        b ? (K = {}) : ((K = g()), (b = { opacity: 1 }));
        y = N(a, "zIndex");
        (B = b.zIndex)
          ? "auto" !== y &&
            ((y = { zindex: y, children: [] }), B.children.push(y), (B = y))
          : (B = y = { zindex: 0, children: [] });
        y = {
          ctx: m(K.width || p, K.height || z),
          zIndex: B,
          opacity: F * b.opacity,
          cssPosition: A,
        };
        b.clip && (y.clip = h.Util.Extend({}, b.clip));
        !0 === k.useOverflow &&
          !0 === /(hidden|scroll|auto)/.test(N(a, "overflow")) &&
          !1 === /(BODY)/i.test(a.nodeName) &&
          (y.clip = y.clip ? t(y.clip, c) : c);
        b = B.children.push(y);
        F = B.children[b - 1].ctx;
        F.setVariable("globalAlpha", y.opacity);
        A = r(a, F, c, !1);
        y.borders = A;
        x.test(a.nodeName) &&
          "transparent" !== k.iframeDefault &&
          (M = "default" === k.iframeDefault ? "#efefef" : k.iframeDefault);
        p = {
          left: d + A[3].width,
          top: f + A[0].width,
          width: p - (A[1].width + A[3].width),
          height: z - (A[0].width + A[2].width),
        };
        y.clip && (p = t(p, y.clip));
        if (0 < p.height && 0 < p.width) {
          l(F, p.left, p.top, p.width, p.height, M);
          var D = p,
            I = N(a, "backgroundImage"),
            Q = N(a, "backgroundRepeat").split(",")[0],
            O,
            L,
            W;
          /data:image\/.*;base64,/i.test(I) ||
            /^(-webkit|-moz|linear-gradient|-o-)/.test(I) ||
            (I = I.split(",")[0]);
          if ("undefined" !== typeof I && !1 === /^(1|none)$/.test(I))
            if (
              ((I = h.Util.backgroundImage(I)),
              (M = v(I)),
              (z = h.Util.BackgroundPosition(a, D, M)),
              M)
            )
              switch (Q) {
                case "repeat-x":
                  J(F, M, z, D.left, D.top, D.width, D.height);
                  break;
                case "repeat-y":
                  I = D.left;
                  Q = D.top;
                  O = D.height;
                  L = Math.min(M.width, D.width);
                  z.top -= Math.ceil(z.top / M.height) * M.height;
                  for (W = Q + z.top; W < O + Q;)
                    ((D =
                      Math.floor(W + M.height) > O + Q ? O + Q - W : M.height),
                      C(F, M, I + z.left, W, L, D, I, Q),
                      (W = Math.floor(W + M.height)));
                  break;
                case "no-repeat":
                  I = D.width - z.left;
                  W = D.height - z.top;
                  Q = z.left;
                  O = z.top;
                  L = z.left + D.left;
                  z = z.top + D.top;
                  0 > Q
                    ? ((Q = Math.abs(Q)),
                      (L += Q),
                      (I = Math.min(D.width, M.width - Q)))
                    : ((I = Math.min(I, M.width)), (Q = 0));
                  0 > O
                    ? ((O = Math.abs(O)),
                      (z += O),
                      (W = Math.min(D.height, M.height - O)))
                    : ((W = Math.min(W, M.height)), (O = 0));
                  0 < W && 0 < I && F.drawImage(M, Q, O, I, W, L, z, I, W);
                  break;
                default:
                  for (
                    z.top -= Math.ceil(z.top / M.height) * M.height,
                      I = D.top + z.top;
                    I < D.height + D.top;
                  )
                    ((Q = Math.min(M.height, D.height + D.top - I)),
                      (Q =
                        Math.floor(I + M.height) > Q + I
                          ? Q + I - I
                          : M.height),
                      I < D.top ? ((O = D.top - I), (I = D.top)) : (O = 0),
                      J(F, M, z, D.left, I, D.width, Q),
                      0 < O && (z.top += O),
                      (I = Math.floor(I + M.height) - O));
              }
            else e("html2canvas: Error loading background:" + I);
        }
        switch (a.nodeName) {
          case "IMG":
            y = a.getAttribute("src");
            (E = v(y))
              ? ((y = u(a, "paddingLeft")),
                (p = u(a, "paddingTop")),
                (M = u(a, "paddingRight")),
                (z = u(a, "paddingBottom")),
                F.drawImage(
                  E,
                  0,
                  0,
                  E.width,
                  E.height,
                  d + y + A[3].width,
                  f + p + A[0].width,
                  c.width - (A[1].width + A[3].width + y + M),
                  c.height - (A[0].width + A[2].width + p + z),
                ))
              : e("html2canvas: Error loading \x3cimg\x3e:" + y);
            break;
          case "INPUT":
            /^(text|url|email|submit|button|reset)$/.test(a.type) &&
              0 < a.value.length &&
              q(a, c, y);
            break;
          case "TEXTAREA":
            0 < a.value.length && q(a, c, y);
            break;
          case "SELECT":
            0 < a.options.length && q(a, c, y);
            break;
          case "LI":
            c = p;
            d = N(a, "listStylePosition");
            A = N(a, "listStyleType");
            f = N(a, "fontWeight");
            if (
              /^(decimal|decimal-leading-zero|upper-alpha|upper-latin|upper-roman|lower-alpha|lower-greek|lower-latin|lower-roman)$/i.test(
                A,
              )
            ) {
              F = -1;
              y = 1;
              p = a.parentNode.childNodes;
              if (a.parentNode) {
                for (; p[++F] !== a;) 1 === p[F].nodeType && y++;
                F = y;
              } else F = -1;
              switch (A) {
                case "decimal":
                  E = F;
                  break;
                case "decimal-leading-zero":
                  E =
                    1 === F.toString().length
                      ? "0" + F.toString()
                      : F.toString();
                  break;
                case "upper-roman":
                  E = h.Generate.ListRoman(F);
                  break;
                case "lower-roman":
                  E = h.Generate.ListRoman(F).toLowerCase();
                  break;
                case "lower-alpha":
                  E = h.Generate.ListAlpha(F).toLowerCase();
                  break;
                case "upper-alpha":
                  E = h.Generate.ListAlpha(F);
              }
              y = E += ". ";
              A = H.createElement("boundelement");
              A.style.display = "inline";
              F = a.style.listStyleType;
              a.style.listStyleType = "none";
              A.appendChild(H.createTextNode(y));
              a.insertBefore(A, a.firstChild);
              y = h.Util.Bounds(A);
              a.removeChild(A);
              a.style.listStyleType = F;
              switch (f) {
                case 401:
                  f = "bold";
                  break;
                case 400:
                  f = "normal";
              }
              G.setVariable("fillStyle", N(a, "color"));
              G.setVariable(
                "font",
                N(a, "fontVariant") +
                  " " +
                  f +
                  " " +
                  N(a, "fontStyle") +
                  " " +
                  N(a, "fontSize") +
                  " " +
                  N(a, "fontFamily"),
              );
              "inside" === d &&
                (G.setVariable("textAlign", "left"),
                (a = c.left),
                (c = y.bottom),
                (d = G),
                0 < n(E).length && d.fillText(E, a, c));
            }
            break;
          case "CANVAS":
            ((y = u(a, "paddingLeft")),
              (p = u(a, "paddingTop")),
              (M = u(a, "paddingRight")),
              (z = u(a, "paddingBottom")),
              F.drawImage(
                a,
                0,
                0,
                a.width,
                a.height,
                d + y + A[3].width,
                f + p + A[0].width,
                c.width - (A[1].width + A[3].width + y + M),
                c.height - (A[0].width + A[2].width + p + z),
              ));
        }
        return B.children[b - 1];
      }
      function B(a, b) {
        if (
          "none" !== N(a, "display") &&
          "hidden" !== N(a, "visibility") &&
          !a.hasAttribute("data-html2canvas-ignore") &&
          ((b = A(a, b) || b), (G = b.ctx), !x.test(a.nodeName))
        ) {
          var c = h.Util.Children(a),
            d,
            f,
            e;
          d = 0;
          for (e = c.length; d < e; d += 1)
            ((f = c[d]),
              1 === f.nodeType ? B(f, b) : 3 === f.nodeType && p(a, f, b));
        }
      }
      b.scroll(0, 0);
      var F = {
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
              } catch (ba) {
                return !1;
              }
              e("html2canvas: Parse: SVG powered rendering available");
              return !0;
            })(),
        },
        O = k.elements === d ? c.body : k.elements[0],
        M = {},
        H = O.ownerDocument,
        x = new RegExp("(" + k.ignoreElements + ")"),
        I = H.body,
        D,
        L,
        y,
        G,
        K;
      a = a || {};
      H.createRange &&
        ((D = H.createRange()),
        D.getBoundingClientRect &&
          ((L = H.createElement("boundtest")),
          (L.style.height = "123px"),
          (L.style.display = "block"),
          I.appendChild(L),
          D.selectNode(L),
          (D = D.getBoundingClientRect()),
          (D = D.height),
          123 === D && (F.rangeBounds = !0),
          I.removeChild(L)));
      var N = h.Util.getCSS;
      y = A(O, null);
      F.svgRendering &&
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
            y.svgRender = c;
          };
        })(c.documentElement);
      L = 0;
      O = O.children;
      for (D = O.length; L < D; L += 1) B(O[L], y);
      y.backgroundColor = N(c.documentElement, "backgroundColor");
      return y;
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
        J.href = c;
        c = J.href;
        n = "html2canvas_" + t++;
        g.callbackname = n;
        p = -1 < p.indexOf("?") ? p + "\x26" : p + "?";
        p += "url\x3d" + encodeURIComponent(c) + "\x26callback\x3d" + n;
        h = r.createElement("script");
        b[n] = function (a) {
          "error:" === a.substring(0, 6)
            ? ((g.succeeded = !1), f.numLoaded++, f.numFailed++, k())
            : (l(e, g), (e.src = a));
          b[n] = d;
          try {
            delete b[n];
          } catch (L) {}
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
      function u(a) {
        var b = h.Util.Children(a),
          c,
          g,
          l = !1;
        try {
          var n = b.length;
          for (c = 0; c < n; c += 1) u(b[c]);
        } catch (D) {}
        try {
          l = a.nodeType;
        } catch (D) {
          ((l = !1),
            e(
              "html2canvas: failed to access some element's nodeType - Exception: " +
                D.message,
            ));
        }
        if (1 === l || l === d) {
          try {
            g = h.Util.getCSS(a, "backgroundImage");
          } catch (D) {
            e(
              "html2canvas: failed to get background-image - Exception: " +
                D.message,
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
        t = 0;
      m = a.elements[0] || c.body;
      var r = m.ownerDocument,
        q = r.images,
        C = q.length,
        J = r.createElement("a"),
        A = new Image().crossOrigin !== d,
        B;
      J.href = b.location.href;
      n = J.protocol + J.host;
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
              : ((J.href = c),
                (J.href = J.href),
                J.protocol + J.host === n || !0 === a.allowTaint
                  ? ((k = f[c] = { img: e }),
                    f.numTotal++,
                    l(e, k),
                    (e.src = c))
                  : A && !a.allowTaint && a.useCORS
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
                } catch (H) {}
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
          B && b.clearTimeout(B);
        },
      };
      0 < a.timeout && (B = b.setTimeout(p.cleanupDOM, a.timeout));
      e("html2canvas: Preload starts: finding background-images");
      f.firstRun = !0;
      u(m);
      e("html2canvas: Preload: Finding images");
      for (m = 0; m < C; m += 1) p.loadImage(q[m].getAttribute("src"));
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
        _create: function (a, b, f, n, u) {
          if (!l) return ((h = arguments), k);
          var p = k.getContext("2d"),
            t,
            m,
            v,
            r,
            q,
            z,
            E = c.createElement("canvas");
          q = E.getContext !== d;
          var x,
            I,
            E = q ? E.getContext("2d") : {};
          z = [];
          k.width = k.style.width = g
            ? Math.min(2880, b.width || a.ctx.width)
            : b.width || a.ctx.width;
          k.height = k.style.height = g
            ? Math.min(2880, b.height || a.ctx.height)
            : b.height || a.ctx.height;
          t = p.fillStyle;
          p.fillStyle = a.backgroundColor;
          p.fillRect(0, 0, k.width, k.height);
          p.fillStyle = t;
          if (b.svgRendering && a.svgRender !== d)
            p.drawImage(a.svgRender, 0, 0);
          else
            for (m = 0, v = n.length; m < v; m += 1) {
              t = n.splice(0, 1)[0];
              t.canvasPosition = t.canvasPosition || {};
              p.textBaseline = "bottom";
              t.clip &&
                (p.save(),
                p.beginPath(),
                p.rect(t.clip.left, t.clip.top, t.clip.width, t.clip.height),
                p.clip());
              if (t.ctx.storage)
                for (r = 0, x = t.ctx.storage.length; r < x; r += 1)
                  switch (((I = t.ctx.storage[r]), I.type)) {
                    case "variable":
                      p[I.name] = I.arguments;
                      break;
                    case "function":
                      if ("fillRect" === I.name)
                        (!g ||
                          (2880 > I.arguments[0] + I.arguments[2] &&
                            2880 > I.arguments[1] + I.arguments[3])) &&
                          p.fillRect.apply(p, I.arguments);
                      else if ("drawShape" === I.name) {
                        I = I.arguments;
                        var D,
                          L = I.length;
                        p.beginPath();
                        for (D = 0; D < L; D++)
                          p[I[D].name].apply(p, I[D].arguments);
                        p.closePath();
                        p.fill();
                      } else if ("fillText" === I.name)
                        (!g ||
                          (2880 > I.arguments[1] && 2880 > I.arguments[2])) &&
                          p.fillText.apply(p, I.arguments);
                      else if (
                        "drawImage" === I.name &&
                        0 < I.arguments[8] &&
                        I.arguments[7]
                      ) {
                        if (
                          q &&
                          b.taintTest &&
                          -1 === z.indexOf(I.arguments[0].src)
                        ) {
                          E.drawImage(I.arguments[0], 0, 0);
                          try {
                            E.getImageData(0, 0, 1, 1);
                          } catch (y) {
                            E = f.createElement("canvas");
                            E = E.getContext("2d");
                            continue;
                          }
                          z.push(I.arguments[0].src);
                        }
                        p.drawImage.apply(p, I.arguments);
                      }
                  }
              t.clip && p.restore();
            }
          e(
            "html2canvas: Renderer: Canvas renderer done - returning canvas obj",
          );
          v = b.elements.length;
          return 1 === v &&
            "object" === typeof b.elements[0] &&
            "BODY" !== b.elements[0].nodeName &&
            !1 === g
            ? ((z = u.Util.Bounds(b.elements[0])),
              (q = f.createElement("canvas")),
              (q.width = z.width),
              (q.height = z.height),
              (p = q.getContext("2d")),
              p.drawImage(
                k,
                z.left,
                z.top,
                z.width,
                z.height,
                0,
                0,
                z.width,
                z.height,
              ),
              (k = null),
              q)
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
        t,
        r = {},
        q,
        C,
        J = 0;
      return {
        _create: function (a, c, g, k, u) {
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
                    r[m.name] = m.arguments;
                    break;
                  case "function":
                    "fillRect" === m.name
                      ? ((t = g.createElementNS(
                          "http://www.w3.org/2000/svg",
                          "rect",
                        )),
                        t.setAttribute("x", m.arguments[0]),
                        t.setAttribute("y", m.arguments[1]),
                        t.setAttribute("width", m.arguments[2]),
                        t.setAttribute("height", m.arguments[3]),
                        t.setAttribute("fill", r.fillStyle),
                        b.appendChild(t))
                      : "fillText" === m.name
                        ? ((t = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "text",
                          )),
                          (C = r.font.split(" ")),
                          (t.style.fontVariant = C.splice(0, 1)[0]),
                          (t.style.fontWeight = C.splice(0, 1)[0]),
                          (t.style.fontStyle = C.splice(0, 1)[0]),
                          (t.style.fontSize = C.splice(0, 1)[0]),
                          t.setAttribute("x", m.arguments[1]),
                          t.setAttribute(
                            "y",
                            m.arguments[2] -
                              (parseInt(t.style.fontSize, 10) + 3),
                          ),
                          t.setAttribute("fill", r.fillStyle),
                          (t.style.dominantBaseline = "text-before-edge"),
                          (t.style.fontFamily = C.join(" ")),
                          (q = g.createTextNode(m.arguments[0])),
                          t.appendChild(q),
                          b.appendChild(t))
                        : "drawImage" === m.name &&
                          0 < m.arguments[8] &&
                          m.arguments[7] &&
                          ((t = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "clipPath",
                          )),
                          t.setAttribute("id", "clipId" + J),
                          (q = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "rect",
                          )),
                          q.setAttribute("x", m.arguments[5]),
                          q.setAttribute("y", m.arguments[6]),
                          q.setAttribute("width", m.arguments[3]),
                          q.setAttribute("height", m.arguments[4]),
                          t.appendChild(q),
                          d.appendChild(t),
                          (t = g.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "image",
                          )),
                          t.setAttributeNS(
                            "http://www.w3.org/1999/xlink",
                            "xlink:href",
                            m.arguments[0].src,
                          ),
                          t.setAttribute("width", m.arguments[7]),
                          t.setAttribute("height", m.arguments[8]),
                          t.setAttribute("x", m.arguments[5]),
                          t.setAttribute("y", m.arguments[6]),
                          t.setAttribute("clip-path", "url(#clipId" + J + ")"),
                          t.setAttribute("preserveAspectRatio", "none"),
                          b.appendChild(t),
                          (J += 1));
                }
          e("html2canvas: Renderer: SVG Renderer done - returning SVG DOM obj");
          return b;
        },
      };
    };
  })(window, document);
  return a;
});
