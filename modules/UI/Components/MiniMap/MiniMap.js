define(
  "UI/Components/MiniMap/MiniMap",
  "require DB/DBManager Utils/jquery Utils/PathFinding Core/Client Core/Preferences Preferences/Graphics Preferences/Controls Network/NetworkManager Network/PacketStructure Engine/SessionStorage Renderer/Renderer Renderer/Map/Altitude Controls/KeyEventHandler UI/UIManager UI/UIComponent UI/Components/ChatBox/ChatBox UI/Components/WorldMap/WorldMap UI/Components/ItemObtain/ItemObtain text!./MiniMap.html text!./MiniMap.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = X.replace(/\.gat$/i, ""),
        c = A.width,
        d = A.height,
        e = Math.max(c, d),
        f = document.getElementById("map"),
        g = f.getBoundingClientRect().width,
        f = f.getBoundingClientRect().height,
        g = (1 / e) * g,
        c = (e - c) / 2,
        d = (d - e) / 2,
        e = Math.floor(
          (a.pageX - I.ui.find(".mapZoom canvas").offset().left) / g - c,
        );
      a = Math.floor(
        (I.ui.find(".mapZoom canvas").offset().top + f - a.pageY) / g + d,
      );
      I.moving(1, b, e, a);
    }
    function c() {
      I.ui.find(".mapZoom").toggle();
      I.ui.is(":visible") ? ((U = 1), I.focus()) : (U = 0);
    }
    function d() {
      var a = this.getAttribute("data-index"),
        b = k(this).position(),
        c = I.ui.find(".overlay");
      c.show();
      c.css({ top: b.top - 35, left: b.left - 10 });
      c.text(a);
    }
    function e() {
      I.ui.find(".overlay").hide();
    }
    function m() {
      var a = this.getAttribute("data-index"),
        b = k(this).position(),
        c = I.ui.find(".mapZoom .zoverlay");
      c.show();
      c.css({ top: b.top - 20, left: b.left });
      c.text(a);
    }
    function h() {
      I.ui.find(".mapZoom .zoverlay").hide();
    }
    function r() {
      I.ui.find(".infos").toggle();
    }
    var q = a("DB/DBManager"),
      k = a("Utils/jquery"),
      g = a("Utils/PathFinding"),
      t = a("Core/Client"),
      l = a("Core/Preferences");
    a("Preferences/Graphics");
    var f = a("Preferences/Controls"),
      n = a("Network/NetworkManager"),
      p = a("Network/PacketStructure"),
      v = a("Engine/SessionStorage"),
      u = a("Renderer/Renderer"),
      A = a("Renderer/Map/Altitude"),
      D = a("Controls/KeyEventHandler"),
      B = a("UI/UIManager"),
      O = a("UI/UIComponent");
    a("UI/Components/ChatBox/ChatBox");
    var C = a("UI/Components/WorldMap/WorldMap"),
      y = a("UI/Components/ItemObtain/ItemObtain"),
      z = a("text!./MiniMap.html"),
      J = a("text!./MiniMap.css"),
      I = new O("MiniMap", z, J);
    I.mouseMode = O.MouseMode.CROSS;
    var L = l.get("MiniMap", { zoom: 2, opacity: 2 }, 1.21),
      x = [],
      M = [],
      E = [],
      F = [],
      G = [],
      H = new Image(),
      K = new Image(),
      P = new Image(),
      N = new Image(),
      S,
      R,
      ea = [1, 10, 6, 3, 2],
      U = 0,
      V = window.devicePixelRatio,
      ca = !1,
      T,
      fa = [],
      da = [],
      ta = [],
      ka = 0,
      oa,
      ga,
      la,
      ha,
      X,
      Z = 2;
    I.changePos = !1;
    var qa = function (a) {
        return q.getworldData(a);
      },
      pa;
    I.init = function () {
      function f(a) {
        return function (b) {
          I.updateZoom(a);
          b.stopImmediatePropagation();
          return !1;
        };
      }
      pa = a("Renderer/EffectManager");
      S = this.ui.find("canvas")[0].getContext("2d");
      R = this.ui.find(".mapZoom canvas")[0].getContext("2d");
      this.opacity = 2;
      t.loadFile(q.INTERFACE_PATH + "map/map_arrow.bmp", function (a) {
        H.src = a;
      });
      t.loadFile(q.INTERFACE_PATH + "minimap/boss_1.bmp", function (a) {
        N.src = a;
      });
      this.ui.mousedown(function (a) {
        a.stopImmediatePropagation();
      });
      this.ui.mouseup(function (a) {
        a.stopImmediatePropagation();
      });
      this.ui.find(".object").click(r);
      this.ui.find(".plus").click(f(1));
      this.ui.find(".minus").click(f(-1));
      this.ui.find(".posx").text("0");
      this.ui.find(".posy").text("0");
      this.ui.find(".zx").text("0");
      this.ui.find(".zy").text("0");
      this.ui
        .find(".infos")
        .on("mouseover", ".info", d)
        .on("mouseout", ".info", e);
      this.ui
        .find(".zinfos")
        .on("mouseover", ".info", m)
        .on("mouseout", ".info", h)
        .on("mousedown", ".info", b);
      this.__mouseStopBlock = [];
      this.__mouseStopBlock[0] = this.ui.find(".footer");
      this.ui.find(".viewon").click(function () {
        C.select();
      });
      this.ui.find(".mini").click(c);
      var g = this.ui.find(".mapZoom");
      g.mousedown(function (a) {
        g.focus();
        a.stopImmediatePropagation();
      });
      g.find(".close").click(function () {
        g.hide();
        event.stopImmediatePropagation();
      });
      g.find(".zinfos_flow").click(b);
      g.find(".mode").click(function () {
        1 == Z ? ((ta = []), (Z = 2)) : (Z = 1);
        I.setMap(X);
      });
      this.ui.on("click", ".infos_flow", c);
    };
    I.moving = function (a, b, c, d) {
      function e(a, b) {
        setTimeout(function () {
          pa.spam(a.id, 1, -1, -1, a.pos, null, null, null, null, 0);
        }, R * b);
      }
      function h() {
        if (f.talk)
          return (
            (r = []),
            (ca = !1),
            clearInterval(T),
            I.removeDestination(),
            !1
          );
        if (I.changePos) {
          I.changePos = !1;
          for (var b = 0; b < u.length; b++)
            if (
              ((t = 0),
              (k = u[b].map),
              (l = u[b].x),
              (m = u[b].y),
              (r = []),
              (ka = 1),
              (x = g.searchNavigate(
                v.Entity.position[0] | 0,
                v.Entity.position[1] | 0,
                l | 0,
                m | 0,
                r,
              )),
              0 < x)
            ) {
              t = 1;
              w = b;
              I.addDestination(l, m);
              1 == a
                ? y.setMsg(
                    "\u8ba1\u7b97\u8def\u5f84\u79fb\u52a8\u81f3\u5750\u6807\uff1a" +
                      l +
                      ", " +
                      m,
                  )
                : y.setMsg("\u79fb\u52a8\u81f3 " + q.getMapName(k + ".gat"));
              break;
            }
          if (0 == t)
            return (
              (r = []),
              (ca = !1),
              clearInterval(T),
              I.removeDestination(),
              !1
            );
        }
        if (ka < x) {
          oa = 2 * (ka - 1);
          ga = 2 * (ka - 1) + 1;
          la = Math.abs(v.Entity.position[0] - r[oa]);
          ha = Math.abs(v.Entity.position[1] - r[ga]);
          b = la + ha;
          if (!ca || 3 > b) {
            ca = !0;
            ka += 6;
            oa = 2 * (ka - 1);
            ga = 2 * (ka - 1) + 1;
            if (!r[oa] || !r[ga])
              return (
                1 < ka && v.Entity.action != v.Entity.ACTION.WALK && --ka,
                !1
              );
            for (var b = ka - 6, c = 0; b < x; b++) {
              var d,
                h = [r[2 * (b - 1)], r[2 * (b - 1) + 1]],
                R = [r[2 * (b - 1) + 2], r[2 * (b - 1) + 3]];
              d = R[0] - h[0];
              h = R[1] - h[1];
              d =
                void 0 == d || void 0 == h
                  ? -1
                  : 0 > d && 0 > h
                    ? 3
                    : 0 > d && 0 == h
                      ? 2
                      : 0 > d && 0 < h
                        ? 1
                        : 0 == d && 0 < h
                          ? 0
                          : 0 < d && 0 < h
                            ? 7
                            : 0 < d && 0 == h
                              ? 6
                              : 0 < d && 0 > h
                                ? 5
                                : 4;
              if (0 <= d) {
                d = {
                  id: 2060 + d,
                  pos: [
                    r[2 * (b - 1)],
                    r[2 * (b - 1) + 1],
                    A.getCellHeight(r[2 * (b - 1)], r[2 * (b - 1) + 1]),
                  ],
                };
                c++;
                if (6 < c) break;
                e(d, c);
              }
            }
            b = new p.CZ.REQUEST_MOVE();
            b.dest[0] = r[oa];
            b.dest[1] = r[ga];
            n.sendPacket(b);
          }
          if (1 < ka && v.Entity.action != v.Entity.ACTION.WALK)
            return (
              (ka -= 3),
              (oa = 2 * (ka - 1)),
              (ga = 2 * (ka - 1) + 1),
              (b = new p.CZ.REQUEST_MOVE()),
              (b.dest[0] = r[oa]),
              (b.dest[1] = r[ga]),
              n.sendPacket(b),
              !1
            );
        } else if (
          ((r = []),
          (ca = !1),
          I.removeDestination(),
          (la = Math.abs(v.Entity.position[0] - l)),
          (ha = Math.abs(v.Entity.position[1] - m)),
          (b = la + ha),
          12 > b &&
            ((b = new p.CZ.REQUEST_MOVE()),
            (b.dest[0] = l),
            (b.dest[1] = m),
            n.sendPacket(b),
            w == u.length - 1))
        )
          return (clearInterval(T), !1);
      }
      var k = b,
        l = 0,
        m = 0,
        t = 0,
        r = [],
        u = [],
        x = 0,
        R = v.Entity.walk.speed / 10,
        w = 0;
      I.changePos = !0;
      var z = new Blob([
          "\n\t\t\tself.addEventListener('message', " +
            g.calculate.toString() +
            ", false);\n\t\t",
        ]),
        z = window.URL.createObjectURL(z),
        B = new Worker(z);
      ca = !1;
      clearInterval(T);
      I.removeDestination();
      if (0 == u.length) {
        var z = X.replace(/\.gat$/i, ""),
          C = A.getGat();
        b = {
          map: b,
          x: c,
          y: d,
          type: a,
          type: a,
          sx: v.Entity.position[0],
          sy: v.Entity.position[1],
          width: C.width,
          height: C.height,
          cells: C.cells,
          types: C.types,
          curMap: z,
          nextMap: k,
          warps: q.getnavigateData(z),
        };
        y.setMsg(
          "\u6b63\u5728\u8ba1\u7b97\u8def\u5f84\u548c\u79fb\u52a8\u5750\u6807",
        );
        if (z == k) B.postMessage(b);
        else
          for (c = 0; c < q.getnavigateData(z).length; c++)
            if (k == q.getnavigateData(z)[c][2]) {
              B.postMessage(b);
              break;
            }
      }
      B.addEventListener("message", function (a) {
        u = a.data;
        0 < u.length
          ? (T = setInterval(h, 200))
          : y.setMsg(
              "\u8be5\u5750\u6807\u6709\u969c\u788d\u7269\u6216\u662f\u5176\u5b83\u539f\u56e0\u65e0\u6cd5\u5230\u8fbe",
            );
        B.terminate();
      });
    };
    I.clearWalk = function () {
      ca = !1;
      clearInterval(T);
      I.removeDestination();
    };
    I.onAppend = function () {
      this.toggleOpacity(L.opacity + 1);
      u.render(w);
    };
    I.setPosition = function (a, b) {
      this.ui.find(".posx").text(a);
      this.ui.find(".posy").text(b);
      this.ui.find(".zx").text(a);
      this.ui.find(".zy").text(b);
    };
    I.setMap = function (a) {
      X = a;
      var b = A.getCanvasFromFrame();
      if (null == b) return !1;
      b.getContext("2d");
      var c = X.replace(/\.gat$/i, "");
      if (qa[c] && (c = qa[c].coordinate))
        for (var d = 0; d < c.length; d++) {
          var e = c[d].split("#");
          I.addWarp(e[0], e[1]);
        }
      b = b.toDataURL();
      P.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d";
      P.src = b;
      K.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d";
      b =
        q.INTERFACE_PATH.replace("data/texture/", "") +
        "map/" +
        a.replace(/\..*/, ".bmp");
      b = b.replace(/\//g, "\\");
      b = q.mapalias[b] || b;
      t.loadFile("data/texture/" + b, function (a) {
        K.src = a;
      });
      this.ui.find(".overlay").hide();
      this.ui.find(".zoverlay").hide();
      this.ui.find(".infos").empty();
      this.ui.find(".zinfos").empty();
      this.ui.find(".posx").text(v.Entity.position[0]);
      this.ui.find(".posy").text(v.Entity.position[1]);
      this.ui.find(".zx").text(v.Entity.position[0]);
      this.ui.find(".zy").text(v.Entity.position[1]);
      this.ui.find(".cname").text(q.getMapName(a));
      this.ui.find(".ename").text(a);
      q.isIndoor(a) ? I.ui.hide() : I.ui.show();
    };
    I.onKeyDown = function (a) {
      return a.which === D.TAB && D.CTRL
        ? (this.toggleOpacity(), a.stopImmediatePropagation(), !1)
        : !0;
    };
    I.onRemove = function () {
      fa = [];
      da = [];
      x.length = 0;
      M.length = 0;
      G.length = 0;
      E.length = 0;
      F.length = 0;
      ta.length = 0;
    };
    I.addPartyMemberMark = function (a, b, c) {
      var d,
        e = x.length,
        f = Math.random;
      for (d = 0; d < e; ++d)
        if (x[d].key === a) {
          x[d].x = b;
          x[d].y = c;
          return;
        }
      x.push({
        key: a,
        x: b,
        y: c,
        color:
          "rgb(" + [(255 * f()) | 0, (255 * f()) | 0, (255 * f()) | 0] + ")",
      });
    };
    I.removePartyMemberMark = function (a) {
      var b,
        c = x.length;
      for (b = 0; b < c; ++b)
        if (x[b].key === a) {
          x.splice(b, 1);
          break;
        }
    };
    I.addWarp = function (a, b) {
      ta.push({ x: a, y: b, color: "#ea0000" });
    };
    I.addGuildMemberMark = function (a, b, c) {
      var d,
        e = M.length;
      for (d = 0; d < e; ++d)
        if (M[d].key === a) {
          M[d].x = b;
          M[d].y = c;
          return;
        }
      M.push({ key: a, x: b, y: c });
    };
    I.removeGuildMemberMark = function (a) {
      var b,
        c = M.length;
      for (b = 0; b < c; ++b)
        if (M[b].key === a) {
          M.splice(b, 1);
          break;
        }
    };
    I.addNpcMark = function (a, b, c, d, e) {
      var f = G.length,
        g = [(d & 16711680) >> 16, (d & 65280) >> 8, d & 255];
      for (d = 0; d < f; ++d)
        if (G[d].key === a) {
          G[d].x = b;
          G[d].y = c;
          G[d].color = "rgb(" + g[0] + "," + g[1] + "," + g[2] + ")";
          G[d].tick = u.tick + e;
          return;
        }
      G.push({
        key: a,
        x: b,
        y: c,
        color: "rgb(" + g[0] + "," + g[1] + "," + g[2] + ")",
        tick: u.tick + e,
      });
    };
    I.removeNpcMark = function (a) {
      var b,
        c = G.length;
      for (b = 0; b < c; ++b)
        if (G[b].key === a) {
          G.splice(b, 1);
          break;
        }
    };
    I.addDestination = function (a, b) {
      F = [];
      fa = [];
      g.searchNavigate(
        v.Entity.position[0] | 0,
        v.Entity.position[1] | 0,
        a | 0,
        b | 0,
        fa,
      );
      fa.length && (da = fa);
      F.push({ x: a, y: b, color: "rgb(0,128,0)" });
    };
    I.removeDestination = function () {
      F = [];
      da = [];
    };
    I.addBossMark = function (a, b) {
      E = [];
      E.push({ x: a, y: b, color: "rgb(255, 0, 0)" });
    };
    I.updateZoom = function (b) {
      L.zoom = Math.max(0, Math.min(ea.length - 1, L.zoom + b));
      L.save();
      b = a("Renderer/MapRenderer").currentMap;
      I.addInfos(b.substring(0, b.length - 4));
    };
    I.toggleOpacity = function (a) {
      this.opacity = ((arguments.length ? a : this.opacity) + 2) % 3;
      L.opacity = this.opacity;
      L.save();
      switch (this.opacity) {
        case 0:
          this.ui.hide();
          break;
        case 1:
          S.globalAlpha = 0.5;
          this.ui.show();
          break;
        case 2:
          ((S.globalAlpha = 1), this.ui.show());
      }
    };
    I.addInfos = function (a) {
      function b(a) {
        return 1 === g
          ? (e + a * h) | 0
          : (64 + ((a - l[0]) * h * 256) / (20 * g)) | 0;
      }
      function c(a) {
        return 1 === g
          ? (f + 128 - a * h) | 0
          : (64 - ((a - l[1]) * h * 256) / (20 * g)) | 0;
      }
      var d,
        e,
        f,
        g,
        h,
        l = v.Entity.position;
      if (a in q.TownInfo) {
        var m = 0,
          n = A.height,
          p = A.width;
        g = ea[L.zoom];
        d = Math.max(p, n);
        h = (1 / d) * 128;
        e = ((d - p) / 2) * h;
        f = ((n - d) / 2) * h;
        var r = I.ui.find(".infos");
        I.ui.find(".infos").empty();
        d = {};
        a = $jscomp.makeIterator(q.getTownInfo(a));
        for (n = a.next(); !n.done; d = { type: d.type }, n = a.next()) {
          n = n.value;
          d.type = void 0;
          var u;
          switch (n.type) {
            case 0:
              d.type = "ToolDealer";
              u = "store";
              break;
            case 1:
              d.type = "WeaponDealer";
              u = "weaponshop";
              break;
            case 2:
              d.type = "ArmorDealer";
              u = "armorshops";
              break;
            case 3:
              d.type = "Smith";
              u = "smithy";
              break;
            case 4:
              d.type = "Guide";
              u = "guide";
              break;
            case 5:
              d.type = "Inn";
              u = "inn";
              break;
            case 6:
              d.type = "KafraEmployee";
              u = "kafra";
              break;
            case 7:
              ((d.type = "Styling"), (u = "style"));
          }
          r.append(
            '\x3cdiv class\x3d"info" data-index\x3d"' +
              k.escape(n.name) +
              '" style\x3d"top:' +
              c(n.y) +
              "px; left:" +
              b(n.x) +
              'px;"\x3e\x3cbutton class\x3d"icon ' +
              d.type +
              '"\x3e\x3c/button\x3e\x3c/div\x3e',
          );
          t.loadFile(
            q.INTERFACE_PATH + "information/" + u + ".bmp",
            (function (a) {
              return function (b) {
                r.find(".info .icon." + a.type + "").css(
                  "backgroundImage",
                  "url(" + b + ")",
                );
              };
            })(d),
          );
          m++;
        }
      }
    };
    I.addzInfos = function (a) {
      var b, c, d;
      if (a in q.TownInfo) {
        var e = 0,
          f = A.height;
        c = A.width;
        b = Math.max(c, f);
        d = (1 / b) * 453;
        c = ((b - c) / 2) * d;
        b = ((f - b) / 2) * d;
        var g = I.ui.find(".zinfos");
        I.ui.find(".zinfos").empty();
        f = {};
        a = $jscomp.makeIterator(q.getTownInfo(a));
        for (var h = a.next(); !h.done; f = { type: f.type }, h = a.next()) {
          h = h.value;
          f.type = void 0;
          var l;
          switch (h.type) {
            case 0:
              f.type = "ToolDealer";
              l = "store";
              break;
            case 1:
              f.type = "WeaponDealer";
              l = "weaponshop";
              break;
            case 2:
              f.type = "ArmorDealer";
              l = "armorshops";
              break;
            case 3:
              f.type = "Smith";
              l = "smithy";
              break;
            case 4:
              f.type = "Guide";
              l = "guide";
              break;
            case 5:
              f.type = "Inn";
              l = "inn";
              break;
            case 6:
              f.type = "KafraEmployee";
              l = "kafra";
              break;
            case 7:
              ((f.type = "Styling"), (l = "style"));
          }
          g.append(
            '\x3cdiv class\x3d"info" data-index\x3d"' +
              k.escape(h.name) +
              '" style\x3d"top:' +
              ((b + 453 - h.y * d) | 0) +
              "px; left:" +
              ((c + h.x * d) | 0) +
              'px;"\x3e\x3cbutton class\x3d"icon ' +
              f.type +
              '"\x3e\x3c/button\x3e\x3c/div\x3e',
          );
          t.loadFile(
            q.INTERFACE_PATH + "information/" + l + ".bmp",
            (function (a) {
              return function (b) {
                g.find(".info .icon." + a.type + "").css(
                  "backgroundImage",
                  "url(" + b + ")",
                );
              };
            })(f),
          );
          e++;
        }
      }
    };
    I.zoomRender = function () {
      function a(a) {
        return (d + a * f) | 0;
      }
      function b(a) {
        return (e + 453 - a * f) | 0;
      }
      var c, d, e, f, g, h, k;
      h = A.width;
      k = A.height;
      g = v.Entity.position;
      c = Math.max(h, k);
      f = (1 / c) * 453;
      d = ((c - h) / 2) * f;
      e = ((k - c) / 2) * f;
      R.clearRect(0, 0, 453, 453);
      1 == Z
        ? P.complete &&
          P.width &&
          ((c = P.width),
          (h = P.height),
          c == h
            ? R.drawImage(P, 0, 0, 453, 453)
            : h > c
              ? ((c = (453 * c) / h), R.drawImage(P, (453 - c) / 2, 0, c, 453))
              : ((c = (453 * h) / c), R.drawImage(P, 0, (453 - c) / 2, 453, c)),
          (R.globalAlpha = 1))
        : K.complete &&
          K.width &&
          ((c = K.width),
          (h = K.height),
          c == h
            ? R.drawImage(K, 0, 0, 453, 453)
            : h > c
              ? ((c = (453 * c) / h), R.drawImage(K, (453 - c) / 2, 0, c, 453))
              : ((c = (453 * h) / c), R.drawImage(K, 0, (453 - c) / 2, 453, c)),
          (R.globalAlpha = 1));
      H.complete &&
        H.width &&
        (R.save(),
        R.translate(a(g[0]), b(g[1])),
        R.rotate((45 * (v.Entity.direction + 4) * Math.PI) / 180),
        R.drawImage(H, 0.5 * -H.width, 0.5 * -H.height),
        R.restore());
      h = G.length;
      for (c = 0; c < h; ++c)
        ((k = G[c]),
          k.tick < u.tick
            ? (G.splice(c, 1), c--, h--)
            : ((R.fillStyle = k.color),
              R.fillRect(a(k.x) - 1, b(k.y) - 4, 2, 8),
              R.fillRect(a(k.x) - 4, b(k.y) - 1, 8, 2)));
      h = x.length;
      for (c = 0; c < h; ++c)
        ((k = x[c]),
          (R.fillStyle = "white"),
          R.fillRect(a(k.x) - 3, b(k.y) - 3, 6, 6),
          (R.fillStyle = k.color),
          R.fillRect(a(k.x) - 2, b(k.y) - 2, 4, 4));
      h = ta.length;
      for (c = 0; c < h; ++c)
        ((k = ta[c]),
          (R.fillStyle = k.color),
          R.fillRect(a(k.x) - 2, b(k.y) - 2, 4, 4));
      if ((h = M.length)) {
        R.fillStyle = "rgb(245,175,200)";
        R.strokeStyle = "white";
        R.lineWidth = 2;
        for (c = 0; c < h; ++c)
          ((k = M[c]),
            R.beginPath(),
            R.moveTo(a(k.x) + 0, b(k.y) - 4),
            R.lineTo(a(k.x) + 4, b(k.y) + 4),
            R.lineTo(a(k.x) - 4, b(k.y) + 4),
            R.lineTo(a(k.x) + 0, b(k.y) - 4));
        R.stroke();
        R.fill();
      }
      h = E.length;
      for (c = 0; c < h; ++c)
        ((k = E[c]),
          N.complete &&
            N.width &&
            (R.save(),
            R.translate(a(k.x), b(k.y)),
            R.drawImage(N, -N.width, -N.height, N.width, N.height),
            R.restore()));
      if ((h = da.length)) {
        R.strokeStyle = "rgba(255,255,255,1)";
        R.lineWidth = 1;
        R.moveTo(a(g[0]), b(g[1]));
        R.beginPath();
        for (c = 2; c < h / 2; c++)
          ((g = da[2 * (c - 1) + 1]), R.lineTo(a(da[2 * (c - 1)]), b(g)));
        R.stroke();
      }
      h = F.length;
      for (c = 0; c < h; ++c)
        ((k = F[c]),
          (R.font = "bold " + 10 * V + "px Arial"),
          (R.fillStyle = "red"),
          (R.textAlign = "center"),
          (R.textBaseline = "middle"),
          R.fillText("x", a(k.x), b(k.y)));
    };
    var w = (function () {
      function b(a) {
        return 1 === g
          ? (e + a * h) | 0
          : (64 + ((a - k[0]) * h * 256) / (20 * g)) | 0;
      }
      function c(a) {
        return 1 === g
          ? (f + 128 - a * h) | 0
          : (64 - ((a - k[1]) * h * 256) / (20 * g)) | 0;
      }
      var d,
        e,
        f,
        g,
        h,
        k,
        l = 0;
      return function (m) {
        if (!(m < l + 500)) {
          l = m;
          var n, p;
          n = A.width;
          p = A.height;
          g = ea[L.zoom];
          k = v.Entity.position;
          d = Math.max(n, p);
          h = (1 / d) * 128;
          e = ((d - n) / 2) * h;
          f = ((p - d) / 2) * h;
          S.clearRect(0, 0, 128, 128);
          K.complete &&
            K.width &&
            (1 === g
              ? ((n = K.width),
                (p = K.height),
                n == p
                  ? S.drawImage(K, 0, 0, 128, 128)
                  : p > n
                    ? ((n = (128 * n) / p),
                      S.drawImage(K, (128 - n) / 2, 0, n, 128))
                    : ((n = (128 * p) / n),
                      S.drawImage(K, 0, (128 - n) / 2, 128, n)))
              : (S.drawImage(
                  K,
                  (4 * (e + k[0] * h) - 20 * g) | 0,
                  (4 * (f + 128 - k[1] * h) - 20 * g) | 0,
                  40 * g,
                  40 * g,
                  0,
                  0,
                  128,
                  128,
                ),
                (S.globalAlpha = 1)));
          H.complete &&
            H.width &&
            (S.save(),
            S.translate(b(k[0]), c(k[1])),
            S.rotate((45 * (v.Entity.direction + 4) * Math.PI) / 180),
            S.drawImage(H, 0.5 * -H.width, 0.5 * -H.height),
            S.restore());
          if (500 < m % 1e3)
            for (n = G.length, m = 0; m < n; ++m)
              ((p = G[m]),
                p.tick < u.tick
                  ? (G.splice(m, 1), m--, n--)
                  : ((S.fillStyle = p.color),
                    S.fillRect(b(p.x) - 1, c(p.y) - 4, 2, 8),
                    S.fillRect(b(p.x) - 4, c(p.y) - 1, 8, 2)));
          n = x.length;
          for (m = 0; m < n; ++m)
            ((p = x[m]),
              (S.fillStyle = "white"),
              S.fillRect(b(p.x) - 3, c(p.y) - 3, 6, 6),
              (S.fillStyle = p.color),
              S.fillRect(b(p.x) - 2, c(p.y) - 2, 4, 4));
          if ((n = M.length)) {
            S.fillStyle = "rgb(245,175,200)";
            S.strokeStyle = "white";
            S.lineWidth = 2;
            for (m = 0; m < n; ++m)
              ((p = M[m]),
                S.beginPath(),
                S.moveTo(b(p.x) + 0, c(p.y) - 4),
                S.lineTo(b(p.x) + 4, c(p.y) + 4),
                S.lineTo(b(p.x) - 4, c(p.y) + 4),
                S.lineTo(b(p.x) + 0, c(p.y) - 4));
            S.stroke();
            S.fill();
          }
          n = E.length;
          for (m = 0; m < n; ++m)
            ((p = E[m]),
              N.complete &&
                N.width &&
                (S.save(),
                S.translate(b(p.x), c(p.y)),
                S.drawImage(
                  N,
                  0.5 * -N.width,
                  0.5 * -N.height,
                  0.5 * N.width,
                  0.5 * N.height,
                ),
                S.restore()));
          if ((n = da.length)) {
            S.strokeStyle = "rgba(255,255,255,1)";
            S.lineWidth = 1;
            S.moveTo(b(k[0]), c(k[1]));
            S.beginPath();
            for (m = 2; m < n / 2; m++)
              ((p = da[2 * (m - 1) + 1]), S.lineTo(b(da[2 * (m - 1)]), c(p)));
            S.stroke();
          }
          n = F.length;
          for (m = 0; m < n; ++m)
            ((p = F[m]),
              (S.font = "bold " + 10 * V + "px Arial"),
              (S.fillStyle = "red"),
              (S.textAlign = "center"),
              (S.textBaseline = "middle"),
              S.fillText("x", b(p.x), c(p.y)));
          m = a("Renderer/MapRenderer").currentMap;
          I.addInfos(m.substring(0, m.length - 4));
          U && (I.zoomRender(), I.addzInfos(m.substring(0, m.length - 4)));
        }
      };
    })();
    return B.addComponent(I);
  },
);
