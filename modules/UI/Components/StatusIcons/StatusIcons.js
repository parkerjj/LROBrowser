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
        f = m.ui.find(".state");
      c = f.length;
      for (b = e = d = 0; b < c; ++b, e += 36)
        (e >= 36 * v && ((e = 0), (d += 36)),
          (a = f[b]),
          (a.style.top = e + "px"),
          (a.style.right = d + "px"));
    }
    function c(a) {
      if (a in q) {
        var b = q[a].element;
        b && b.parentNode && b.parentNode.removeChild(b);
        delete q[a];
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
      q[a] = {};
      q[a].element = c;
      q[a].ctx = d.getContext("2d");
      q[a].type = 2e3 == a ? 1 : 0;
      0 < Object.keys(q).length && p.render(l);
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
          b.length && ((q[a].time = b[0]), (q[a].timeTick = 0));
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
        b.length && ((q[a].time = b[0]), (q[a].timeTick = 0));
        c.appendChild(d);
      }
    }
    function e(a) {
      var b, c;
      b = m.ui.find(".state").length;
      c = (b % v) * 36;
      b = 36 * ((b / v) | 0);
      a.style.top = c + "px";
      a.style.right = b + "px";
      m.ui.append(a);
    }
    function l(a) {
      var b, c, d;
      d = Object.keys(q);
      c = d.length;
      for (b = 0; b < c; ++b) {
        var e = q[d[b]],
          f = a,
          g,
          h,
          k,
          m;
        e.img &&
          ((m = e.ctx),
          1 == e.type
            ? 1 == e.refresh &&
              ((e.refresh = 0),
              (f = e.val),
              (k = "rgba(0,255,8,0.5)"),
              (g = 1 - f / 100),
              m.clearRect(0, 0, 32, 32),
              m.drawImage(e.img, 0, 0),
              (m.fillStyle = k),
              m.fillRect(0, 32 * g, 32, 32),
              e.time && (e.time.textContent = f + "%"))
            : ((g = e.start),
              (h = e.end),
              f > h && (h = f),
              h < f + 6e4
                ? ((k = "rgba(255,150,50,0.65)"), (g = 1 - (h - f) / 6e4))
                : ((k = "rgba(255,255,255,0.65)"),
                  (g = (f - g) / (h - 6e4 - g))),
              m.clearRect(0, 0, 32, 32),
              m.drawImage(e.img, 0, 0),
              (m.fillStyle = k),
              m.beginPath(),
              m.arc(16, 16, 24, 1.5 * Math.PI, ((1.5 + 2 * g) % 2) * Math.PI),
              m.lineTo(16, 16),
              m.fill(),
              e.time &&
                e.timeTick + 1e3 < f &&
                ((e.timeTick = f),
                (m = ((h - f) / 1e3) | 0),
                (k = m % 60),
                (m = (m / 60) | 0),
                (e.time.textContent =
                  f >= h || Infinity === h
                    ? ""
                    : (m ? m + " " + r.getMessage(1807, "\u5206") + " " : "") +
                      k +
                      " " +
                      r.getMessage(1808, "\u79d2")))));
      }
    }
    var h = a("DB/Status/StatusInfo"),
      r = a("DB/DBManager"),
      t = a("Utils/jquery"),
      n = a("Utils/Texture"),
      g = a("Core/Client"),
      p = a("Renderer/Renderer"),
      k = a("UI/UIManager"),
      f = a("UI/UIComponent");
    a = a("text!./StatusIcons.css");
    var m = new f("StatusIcons", null, a);
    m.mouseMode = f.MouseMode.CROSS;
    m.needFocus = !1;
    var q = {};
    m.init = function () {
      this.ui = t("\x3cdiv/\x3e").attr("id", "StatusIcons");
    };
    m.onAppend = function () {
      p.render(l);
    };
    m.onRemove = function () {
      p.stop(l);
    };
    m.clean = function () {
      this.ui.empty();
      q = {};
    };
    m.update = function (a, f, k, m) {
      if (a in h) {
        if (h[a].length) {
          if (f && !h[a][k].icon) return;
        } else if (!h[a].icon) return;
        f
          ? (a in q || d(a, k),
            (q[a].start = p.tick),
            (q[a].end = p.tick + m),
            9999 === m && (q[a].end = Infinity),
            q.img ||
              g.loadFile(
                "data/texture/effect/" +
                  (h[a].length ? h[a][k].icon : h[a].icon),
                function (b) {
                  n.load(b, function () {
                    q[a] && !q[a].img && ((q[a].img = this), e(q[a].element));
                  });
                },
              ))
          : (c(a), b());
      }
    };
    m.update2 = function (a, f, k, m) {
      if (a in h) {
        if (h[a].length) {
          if (f && (!h[a][k] || !h[a][k].icon)) return;
        } else if (!h[a].icon) return;
        f
          ? (a in q || d(a, k),
            (q[a].val = m),
            (q[a].refresh = 1),
            q.img ||
              g.loadFile(
                "data/texture/effect/" +
                  (h[a].length ? h[a][k].icon : h[a].icon),
                function (b) {
                  n.load(b, function () {
                    q[a] && !q[a].img && ((q[a].img = this), e(q[a].element));
                  });
                },
              ))
          : (c(a), b());
      }
    };
    var v = 5;
    return k.addComponent(m);
  },
);
