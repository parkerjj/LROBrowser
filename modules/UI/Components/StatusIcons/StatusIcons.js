define(
  "UI/Components/StatusIcons/StatusIcons",
  "require DB/Status/StatusInfo DB/DBManager Utils/jquery Utils/Texture Core/Client Renderer/Renderer UI/UIManager UI/UIComponent text!./StatusIcons.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a,
        b,
        c,
        d,
        e,
        f = n.ui.find(".state");
      c = f.length;
      for (b = e = d = 0; b < c; ++b, e += 36)
        (e >= 36 * v && ((e = 0), (d += 36)),
          (a = f[b]),
          (a.style.top = e + "px"),
          (a.style.right = d + "px"));
    }
    function c(a) {
      if (a in p) {
        var b = p[a].element;
        b && b.parentNode && b.parentNode.removeChild(b);
        delete p[a];
      }
    }
    function d(a, b) {
      var c, d;
      c = document.createElement("div");
      c.className = "state";
      d = document.createElement("canvas");
      d.width = 32;
      d.height = 32;
      c.appendChild(d);
      p[a] = {};
      p[a].element = c;
      p[a].ctx = d.getContext("2d");
      p[a].type = 2e3 == a ? 1 : 0;
      0 < Object.keys(p).length && t.render(m);
      if (h[a].length) {
        if (h[a][b].descript) {
          var e, f;
          d = document.createElement("div");
          d.className = "description";
          f = h[a][b].descript;
          e = f.length;
          for (b = 0; b < e; ++b) {
            var g = document.createElement("div");
            g.textContent = f[b][0];
            f[b][1] && (g.style.color = f[b][1]);
            g.innerHTML = g.innerHTML.replace(
              "%s",
              '\x3cspan class\x3d"time"\x3e0\x3c/span\x3e',
            );
            d.appendChild(g);
          }
          b = d.getElementsByClassName("time");
          b.length && ((p[a].time = b[0]), (p[a].timeTick = 0));
          c.appendChild(d);
        }
      } else if (h[a].descript) {
        d = document.createElement("div");
        d.className = "description";
        f = h[a].descript;
        e = f.length;
        for (b = 0; b < e; ++b)
          ((g = document.createElement("div")),
            (g.textContent = f[b][0]),
            f[b][1] && (g.style.color = f[b][1]),
            (g.innerHTML = g.innerHTML.replace(
              "%s",
              '\x3cspan class\x3d"time"\x3e0\x3c/span\x3e',
            )),
            d.appendChild(g));
        b = d.getElementsByClassName("time");
        b.length && ((p[a].time = b[0]), (p[a].timeTick = 0));
        c.appendChild(d);
      }
    }
    function e(a) {
      var b, c;
      b = n.ui.find(".state").length;
      c = (b % v) * 36;
      b = 36 * ((b / v) | 0);
      a.style.top = c + "px";
      a.style.right = b + "px";
      n.ui.append(a);
    }
    function m(a) {
      var b, c, d;
      d = Object.keys(p);
      c = d.length;
      for (b = 0; b < c; ++b) {
        var e = p[d[b]],
          f = a,
          g,
          h,
          k,
          l;
        e.img &&
          ((l = e.ctx),
          1 == e.type
            ? 1 == e.refresh &&
              ((e.refresh = 0),
              (f = e.val),
              (k = "rgba(0,255,8,0.5)"),
              (g = 1 - f / 100),
              l.clearRect(0, 0, 32, 32),
              l.drawImage(e.img, 0, 0),
              (l.fillStyle = k),
              l.fillRect(0, 32 * g, 32, 32),
              e.time && (e.time.textContent = f + "%"))
            : ((g = e.start),
              (h = e.end),
              f > h && (h = f),
              h < f + 6e4
                ? ((k = "rgba(255,150,50,0.65)"), (g = 1 - (h - f) / 6e4))
                : ((k = "rgba(255,255,255,0.65)"),
                  (g = (f - g) / (h - 6e4 - g))),
              l.clearRect(0, 0, 32, 32),
              l.drawImage(e.img, 0, 0),
              (l.fillStyle = k),
              l.beginPath(),
              l.arc(16, 16, 24, 1.5 * Math.PI, ((1.5 + 2 * g) % 2) * Math.PI),
              l.lineTo(16, 16),
              l.fill(),
              e.time &&
                e.timeTick + 1e3 < f &&
                ((e.timeTick = f),
                (l = ((h - f) / 1e3) | 0),
                (k = l % 60),
                (l = (l / 60) | 0),
                (e.time.textContent =
                  f >= h || Infinity === h
                    ? ""
                    : (l ? l + " " + r.getMessage(1807, "\u5206") + " " : "") +
                      k +
                      " " +
                      r.getMessage(1808, "\u79d2")))));
      }
    }
    var h = a("DB/Status/StatusInfo"),
      r = a("DB/DBManager"),
      q = a("Utils/jquery"),
      k = a("Utils/Texture"),
      g = a("Core/Client"),
      t = a("Renderer/Renderer"),
      l = a("UI/UIManager"),
      f = a("UI/UIComponent");
    a = a("text!./StatusIcons.css");
    var n = new f("StatusIcons", null, a);
    n.mouseMode = f.MouseMode.CROSS;
    n.needFocus = !1;
    var p = {};
    n.init = function () {
      this.ui = q("\x3cdiv/\x3e").attr("id", "StatusIcons");
    };
    n.onAppend = function () {
      t.render(m);
    };
    n.onRemove = function () {
      t.stop(m);
    };
    n.clean = function () {
      this.ui.empty();
      p = {};
    };
    n.update = function (a, f, l, n) {
      if (a in h) {
        if (h[a].length) {
          if (f && !h[a][l].icon) return;
        } else if (!h[a].icon) return;
        f
          ? (a in p || d(a, l),
            (p[a].start = t.tick),
            (p[a].end = t.tick + n),
            9999 === n && (p[a].end = Infinity),
            p.img ||
              g.loadFile(
                "data/texture/effect/" +
                  (h[a].length ? h[a][l].icon : h[a].icon),
                function (b) {
                  k.load(b, function () {
                    p[a] && !p[a].img && ((p[a].img = this), e(p[a].element));
                  });
                },
              ))
          : (c(a), b());
      }
    };
    n.update2 = function (a, f, l, n) {
      if (a in h) {
        if (h[a].length) {
          if (f && (!h[a][l] || !h[a][l].icon)) return;
        } else if (!h[a].icon) return;
        f
          ? (a in p || d(a, l),
            (p[a].val = n),
            (p[a].refresh = 1),
            p.img ||
              g.loadFile(
                "data/texture/effect/" +
                  (h[a].length ? h[a][l].icon : h[a].icon),
                function (b) {
                  k.load(b, function () {
                    p[a] && !p[a].img && ((p[a].img = this), e(p[a].element));
                  });
                },
              ))
          : (c(a), b());
      }
    };
    var v = 5;
    return l.addComponent(n);
  },
);
