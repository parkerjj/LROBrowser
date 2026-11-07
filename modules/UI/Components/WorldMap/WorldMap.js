define(
  "UI/Components/WorldMap/WorldMap",
  "require DB/DBManager Utils/PathFinding Utils/jquery Core/Client Network/NetworkManager Network/PacketStructure Core/Preferences Engine/SessionStorage Renderer/Camera Renderer/Renderer Renderer/Map/Altitude Renderer/SpriteRenderer Controls/KeyEventHandler UI/UIManager UI/UIComponent UI/Components/ChatBox/ChatBox UI/Components/ItemInfo/ItemInfo UI/Components/InputBox/InputBox UI/Components/ItemObtain/ItemObtain UI/Components/Inventory/Inventory Preferences/Controls text!./WorldMap.html text!./WorldMap.css".split(
    " ",
  ),
  function (a) {
    function b(a, b) {
      var e = "",
        f = "",
        h = g("#worldmap .container").scrollLeft(),
        k = g("#worldmap .container").scrollTop();
      g("#map_" + a);
      if (0 < g("#map_" + a).length)
        var l = (h + g("#map_" + a).position().left) / g("#map_" + a).width(),
          m = (k + g("#map_" + a).position().top) / g("#map_" + a).height();
      else e = E(a).belong;
      if (0 < g("#map_" + b).length)
        var n = (h + g("#map_" + b).position().left) / g("#map_" + b).width(),
          p = (k + g("#map_" + b).position().top) / g("#map_" + b).height();
      else f = E(b).belong;
      var t = "",
        r = "";
      e && f ? ((t = e), (r = f)) : e && !f ? (t = e) : !e && f && (r = f);
      var f = [],
        u = [],
        e = [],
        v;
      f.push({ map: a, x: l, y: m, wx: 0, wy: 0, G: 0 });
      do {
        l = f.shift();
        u.push(l);
        m = l.map;
        if (q.getnavigateData(m))
          for (var x = 0; x < q.getnavigateData(m).length; x++) {
            var y,
              R = q.getnavigateData(m)[x][2];
            if (R != m)
              if (0 < g("#map_" + R).length) {
                if (
                  ((y = {
                    map: R,
                    x:
                      (h + g("#map_" + R).position().left) /
                      g("#map_" + R).width(),
                    y:
                      (k + g("#map_" + R).position().top) /
                      g("#map_" + R).height(),
                    wx: q.getnavigateData(m)[x][0],
                    wy: q.getnavigateData(m)[x][1],
                  }),
                  !d(y, u))
                ) {
                  var z = l.G + (0 == (l.x - y.x) * (l.y - y.y) ? 10 : 14);
                  d(y, f)
                    ? ((y = d(y, f)),
                      z < f[y].G &&
                        ((f[y].parent = l),
                        (f[y].G = z),
                        (f[y].F = z + f[y].H)))
                    : ((y.H = 10 * Math.abs(n - y.x) + 10 * Math.abs(p - y.y)),
                      (y.G = z),
                      (y.F = y.H + y.G),
                      (y.parent = l),
                      f.push(y));
                }
              } else {
                if (t == E(R).belong || r == E(R).belong)
                  ((y = {
                    map: R,
                    wx: q.getnavigateData(m)[x][0],
                    wy: q.getnavigateData(m)[x][1],
                    parent: l,
                  }),
                    d(y, u) || d(y, f) || f.unshift(y));
                if (q.getnavigateData(R))
                  for (
                    var z = JSON.parse(JSON.stringify(q.getnavigateData(R))),
                      R = {
                        map: R,
                        wx: q.getnavigateData(m)[x][0],
                        wy: q.getnavigateData(m)[x][1],
                        parent: l,
                      },
                      B = 0;
                    B < z.length;
                    B++
                  )
                    ((y = {
                      map: z[B][2],
                      wx: z[B][0],
                      wy: z[B][1],
                      parent: R,
                    }),
                      d(y, u) || d(y, f) || f.push(y));
              }
          }
        if (0 == f.length) break;
        f.sort(c);
      } while (!(v = d({ map: b }, f)));
      if (v) {
        b = f[v];
        do (e.unshift({ map: b.map, x: b.wx, y: b.wy }), (b = b.parent));
        while (b.map != a);
      } else e = [];
      return e;
    }
    function c(a, b) {
      return b.F - a.F;
    }
    function d(a, b) {
      for (var c in b) if (a.map == b[c].map) return c;
      return !1;
    }
    function e(a, b) {
      var c = g("#Mhtmltip"),
        d = { ITID: a, IsIdentified: 1 };
      c.find(".dropbox").append(
        '\x3cdiv data-id\x3d"' +
          a +
          '"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"20" height\x3d"20" /\x3e\x3cspan\x3e' +
          q.getItemName(d) +
          " (" +
          b / 100 +
          "%)\x3c/span\x3e\x3c/div\x3e",
      );
      k.loadFile(
        q.INTERFACE_PATH +
          "item/" +
          q.getItemInfo(a).identifiedResourceName +
          ".bmp",
        function (b) {
          c.find(".dropbox")
            .find('div[data-id\x3d"' + a + '"] img')
            .attr("src", b);
        },
      );
    }
    function m(a) {
      var b = g("#shMtip"),
        c = { ITID: a.ID, IsIdentified: 1 };
      b.find(".items").append(
        '\x3cdiv data-id\x3d"' +
          a.ID +
          '"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"20" height\x3d"20" /\x3e\x3cspan\x3e' +
          q.getItemName(c) +
          "\x3c/span\x3e\x3c/div\x3e",
      );
      k.loadFile(
        q.INTERFACE_PATH + "item/" + a.identifiedResourceName + ".bmp",
        function (c) {
          b.find(".items")
            .find('div[data-id\x3d"' + a.ID + '"] img')
            .attr("src", c);
        },
      );
    }
    function h(a) {
      var b, c;
      if (!(a < N + 1e3 / 60)) {
        N = a;
        f.direction = 4;
        c = I.length;
        a = x.length;
        for (b = 0; b < c; b++)
          (I[b].clearRect(0, 0, I[b].canvas.width, I[b].canvas.height),
            p.bind2DContext(I[b], 60, 80, !0),
            J[b].renderEntity());
        for (b = 0; b < a; b++)
          (x[b].clearRect(0, 0, x[b].canvas.width, x[b].canvas.height),
            p.bind2DContext(x[b], 60, 80, !0),
            L[b].renderEntity());
      }
    }
    function r(a) {
      if (0 < g(".Mhtmltip[data-map\x3d'" + a + "']").length) {
        y.ui.find(".bigworld").hide();
        0 <
        y.ui.find(".bigworld.normal .Mhtmltip[data-map\x3d'" + a + "']").length
          ? (y.ui.find(".bigworld.normal").show(),
            y.ui.find(".mapblock option").eq(0).prop("selected", "selected"))
          : 0 <
              y.ui.find(
                ".bigworld.dimension .Mhtmltip[data-map\x3d'" + a + "']",
              ).length
            ? (y.ui.find(".bigworld.dimension").show(),
              y.ui.find(".mapblock option").eq(1).prop("selected", "selected"))
            : 0 <
                y.ui.find(
                  ".bigworld.localizing1 .Mhtmltip[data-map\x3d'" + a + "']",
                ).length
              ? (y.ui.find(".bigworld.localizing1").show(),
                y.ui
                  .find(".mapblock option")
                  .eq(2)
                  .prop("selected", "selected"))
              : 0 <
                  y.ui.find(
                    ".bigworld.localizing2 .Mhtmltip[data-map\x3d'" + a + "']",
                  ).length &&
                (y.ui.find(".bigworld.localizing2").show(),
                y.ui
                  .find(".mapblock option")
                  .eq(3)
                  .prop("selected", "selected"));
        var b = g("#worldmap .container").scrollTop(),
          c = g("#worldmap .container").scrollLeft();
        a = g(".Mhtmltip[data-map\x3d'" + a + "']");
        g(".Mhtmltip.sd").removeClass("sd");
        a.addClass("sd");
        g("#worldmap .container").animate(
          {
            scrollTop: (b + a.offset().top) / 1.5,
            scrollLeft: (c + a.offset().left) / 1.5,
          },
          800,
        );
      } else
        0 < g(".Mhtmltip[data-map\x3d'" + E(a).belong + "']").length &&
          (y.ui.find(".bigworld").hide(),
          0 <
          y.ui.find(
            ".bigworld.normal .Mhtmltip[data-map\x3d'" + E(a).belong + "']",
          ).length
            ? (y.ui.find(".bigworld.normal").show(),
              y.ui.find(".mapblock option").eq(0).prop("selected", "selected"))
            : 0 <
                y.ui.find(
                  ".bigworld.dimension .Mhtmltip[data-map\x3d'" +
                    E(a).belong +
                    "']",
                ).length
              ? (y.ui.find(".bigworld.dimension").show(),
                y.ui
                  .find(".mapblock option")
                  .eq(1)
                  .prop("selected", "selected"))
              : 0 <
                  y.ui.find(
                    ".bigworld.localizing1 .Mhtmltip[data-map\x3d'" +
                      E(a).belong +
                      "']",
                  ).length
                ? (y.ui.find(".bigworld.localizing1").show(),
                  y.ui
                    .find(".mapblock option")
                    .eq(2)
                    .prop("selected", "selected"))
                : 0 <
                    y.ui.find(
                      ".bigworld.localizing2 .Mhtmltip[data-map\x3d'" +
                        E(a).belong +
                        "']",
                    ).length &&
                  (y.ui.find(".bigworld.localizing2").show(),
                  y.ui
                    .find(".mapblock option")
                    .eq(3)
                    .prop("selected", "selected")),
          (b = g("#worldmap .container").scrollTop()),
          (c = g("#worldmap .container").scrollLeft()),
          (a = g(".Mhtmltip[data-map\x3d'" + E(a).belong + "']")),
          g(".Mhtmltip.sd").removeClass("sd"),
          a.addClass("sd"),
          g("#worldmap .container").animate(
            {
              scrollTop: (b + a.offset().top) / 1.5,
              scrollLeft: (c + a.offset().left) / 1.5,
            },
            800,
          ));
    }
    var q = a("DB/DBManager"),
      k = a("Core/Client"),
      g = a("Utils/jquery");
    a("Utils/PathFinding");
    var t = a("Network/NetworkManager"),
      l = a("Network/PacketStructure");
    a("Core/Preferences");
    a("Engine/SessionStorage");
    var f = a("Renderer/Camera"),
      n = a("Renderer/Renderer");
    a("Renderer/Map/Altitude");
    var p = a("Renderer/SpriteRenderer"),
      v = a("Controls/KeyEventHandler"),
      u = a("UI/UIManager"),
      A = a("UI/UIComponent");
    a("UI/Components/ChatBox/ChatBox");
    var D = a("UI/Components/ItemInfo/ItemInfo");
    a("UI/Components/InputBox/InputBox");
    var B = a("UI/Components/ItemObtain/ItemObtain");
    a("Preferences/Controls");
    var O = a("text!./WorldMap.html"),
      C = a("text!./WorldMap.css"),
      y = new A("WorldMap", O, C);
    y.needFocus = !0;
    var z = !1,
      J = [],
      I = [],
      L = [],
      x = [],
      M,
      E = function (a) {
        return q.getworldData(a);
      },
      F = function (a) {
        return q.getmobData(a);
      },
      G,
      H = 0,
      K = {
        0: "\u65e0\u5f62 \u4e0d\u6b7b \u52a8\u7269 \u690d\u7269 \u6606\u866b \u9c7c\u8d1d \u6076\u9b54 \u4eba\u5f62 \u5929\u4f7f \u9f99".split(
          " ",
        ),
        1: "\u8865\u7ed9 \u6d88\u8017 \u5ba0\u7269\u86cb \u5ba0\u7269\u88c5\u5907 \u529f\u80fd \u79df\u8d41 \u5176\u5b83 \u8ff7\u4f60\u7bb1\u5b50 MVP\u788e\u7247\u8f6c\u86cb \u53d1\u578b\u626d\u86cb \u6c14\u7403\u626d\u86cb \u65f6\u88c5\u626d\u86cb(1) \u65f6\u88c5\u626d\u86cb(2) \u94dc\u5b9d\u7bb1[R] \u94f6\u5b9d\u7bb1[R] \u91d1\u5b9d\u7bb1[R]".split(
          " ",
        ),
        2: "\u5355\u624b\u65a7 \u5355\u624b\u77db \u5355\u624b\u6756 \u53cc\u624b\u65a7 \u53cc\u624b\u77db \u53cc\u624b\u6756 \u4e66 \u5f13 \u5c0f\u63d0\u7434 \u62f3\u5203 \u77ed\u5251 \u62f3\u5957 \u949d\u5668 \u98de\u9556 \u5355\u624b\u5251 \u53cc\u624b\u5251 \u97ad \u624b\u67aa \u652f\u67aa \u673a\u5173\u67aa \u69b4\u5f39\u53d1\u5c04\u5668 \u9730\u5f39\u67aa".split(
          " ",
        ),
        3: "\u5934\u4e0a \u5934\u4e2d \u5934\u4e0b \u8863\u670d \u76fe\u724c \u62ab\u80a9 \u8863\u670d \u9970\u54c1".split(
          " ",
        ),
      },
      P = {
        0: "Formless Undead Brute Plant Insect Fish Demon Demihuman Angel Dragon".split(
          " ",
        ),
        1: "Healing Usable Petegg Petarmor Delayconsume Cash Etc miniPackage mvpCards hairscroll balloonScroll fashionScroll fashionscroll2 bronzeTreasureBox silverTreasureBox goldenTreasureBox".split(
          " ",
        ),
        2: "1hAxe 1hSpear Staff 2hAxe 2hSpear 2hStaff Book Bow Musical Katar Dagger Knuckle Mace Huuma 1hSword 2hSword Whip Revolver Rifle Gatling Grenade Shotgun".split(
          " ",
        ),
        3: "head_top head_mid head_low armor left_hand garment shoes accessory".split(
          " ",
        ),
      };
    y.init = function () {
      for (var b = this.ui.find(".stype").val(), c = 0; c < K[b].length; c++)
        this.ui
          .find(".subtype")
          .append(
            '\x3cspan class\x3d"minav" data-idx\x3d"' +
              c +
              '"\x3e' +
              K[b][c] +
              "\x3c/span\x3e",
          );
      this.ui.find(".stype").on("change", function () {
        y.ui.find(".subtype").empty();
        y.ui.find(".scontainer").empty();
        for (var a = y.ui.find(".stype").val(), b = 0; b < K[a].length; b++)
          y.ui
            .find(".subtype")
            .append(
              '\x3cspan class\x3d"minav" data-idx\x3d"' +
                b +
                '"\x3e' +
                K[a][b] +
                "\x3c/span\x3e",
            );
      });
      var d = "",
        f = "";
      this.ui.find(".subtype").on("click", "span", function () {
        var a = g(".minav.sd").data("idx"),
          b = g(this).data("idx");
        H = 1;
        L.length = 0;
        x.length = 0;
        y.ui.find(".scontainer").empty();
        g(".minav.sd").removeClass("sd");
        if (a != b) {
          g(this).addClass("sd");
          y.ui.find(".scontainer").empty();
          var a = g("#_csrf").val(),
            c = y.ui.find(".stype").val(),
            a = { _csrf: a };
          d = c;
          f = P[c][b];
          $.ajax({
            url:
              "/?r\x3dmn/searchdb\x26type\x3d" +
              c +
              "\x26subtype\x3d" +
              P[c][b] +
              "\x26page\x3d" +
              H,
            type: "post",
            dataType: "json",
            data: a,
            success: function (a) {
              if (0 == c) {
                var d = q.searchMob2(a),
                  e = g(
                    "\x3cp\x3e\u641c\u7d22 " +
                      K[c][b] +
                      " \u76f8\u5173\u9b54\u7269\x3c/p\x3e",
                  );
                y.ui.find(".scontainer").append(e);
                e = g('\x3cdiv class\x3d"mobs"\x3e\x3c/div\x3e');
                y.ui.find(".scontainer").append(e);
                for (e = 0; e < d.length; e++) {
                  var f = g(
                    '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
                      d[e].ID +
                      "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
                  );
                  L[e] = new G();
                  L[e].set({ job: d[e].ID });
                  L[e].noSound = !0;
                  x[e] = f.find("canvas")[0].getContext("2d");
                  y.ui.find(".scontainer .mobs").append(f);
                }
              } else
                for (
                  d = q.searchItem2(a),
                    e = g(
                      "\x3cp\x3e\u641c\u7d22 " +
                        K[c][b] +
                        " \u76f8\u5173\u9053\u5177\x3c/p\x3e",
                    ),
                    y.ui.find(".scontainer").append(e),
                    e = g('\x3cdiv class\x3d"items"\x3e\x3c/div\x3e'),
                    y.ui.find(".scontainer").append(e),
                    e = 0;
                  e < d.length;
                  e++
                )
                  m(d[e]);
              0 < a.length &&
                y.ui
                  .find(".scontainer")
                  .append(
                    '\x3cdiv class\x3d"addMore"\x3e\u70b9\u51fb\u52a0\u8f7d\u66f4\u591a\x3c/div\x3e',
                  );
            },
          });
        }
        return !1;
      });
      this.ui.find(".scontainer").on("click", ".addMore", function () {
        g(this).text("\u6b63\u5728\u52a0\u8f7d\u4e2d...");
        y.ui.find(".scontainer .mainMap").remove();
        var a = { _csrf: g("#_csrf").val() };
        H++;
        $.ajax({
          url:
            "/?r\x3dmn/searchdb\x26type\x3d" +
            d +
            "\x26subtype\x3d" +
            f +
            "\x26page\x3d" +
            H,
          type: "post",
          dataType: "json",
          data: a,
          success: function (a) {
            if (0 == d)
              for (var b = q.searchMob2(a), c = 0; c < b.length; c++) {
                var e = g(
                    '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
                      b[c].ID +
                      "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
                  ),
                  f = L.length;
                L[f] = new G();
                L[f].set({ job: b[c].ID });
                L[f].noSound = !0;
                x[f] = e.find("canvas")[0].getContext("2d");
                y.ui.find(".scontainer .mobs").append(e);
              }
            else for (b = q.searchItem2(a), c = 0; c < b.length; c++) m(b[c]);
            g(".addMore").remove();
            0 < a.length &&
              y.ui
                .find(".scontainer")
                .append(
                  '\x3cdiv class\x3d"addMore"\x3e\u70b9\u51fb\u52a0\u8f7d\u66f4\u591a\x3c/div\x3e',
                );
          },
        });
        return !1;
      });
      G = a("Renderer/Entity/Entity");
      this.ui.find(".close").on("click", function () {
        if (!z)
          return (event.stopImmediatePropagation(), y.ui.hide(), n.stop(h), !1);
      });
      this.ui.find(".move").on("click", function () {
        if (!z) {
          var b = a("Renderer/MapRenderer"),
            c = y.ui.find(".mainMap .sd").data("map"),
            b = b.currentMap,
            b = b.replace(/\.gat$/i, "");
          if (c == b) return !1;
          y.moving(c);
          y.ui.hide();
          n.stop(h);
          return !1;
        }
      });
      this.ui.find(".gogogo").on("click", function () {
        if (!z) {
          event.stopImmediatePropagation();
          var a = y.ui.find(".mainMap .sd").data("map");
          u.showPromptBox(
            "\u786e\u5b9a\u524d\u5f80" + a + "\u5730\u56fe\u5417?",
            "ok",
            "cancel",
            function () {
              var b = new l.CZ.PRIVATE_AIRSHIP_REQUEST();
              b.mapname = a;
              b.itemid = 14527;
              t.sendPacket(b);
            },
            null,
          );
          return !1;
        }
      });
      this.ui.find("td").on("click", function () {
        if (!z) {
          var b = !1;
          if (!g(this).hasClass("Mhtmltip"))
            return (
              g(".Mhtmltip.sd").removeClass("sd"),
              (J.length = 0),
              (I.length = 0),
              g(".gogogo").hide(),
              g(".move").hide(),
              g("#Mhtmltip").hide(),
              g("#Mhtmltip").empty(),
              D.ui && D.ui.is(":visible") && D.remove(),
              !1
            );
          g(".gogogo").show();
          g(".move").show();
          g(".Mhtmltip.sd").removeClass("sd");
          g(this).addClass("sd");
          g("#Mhtmltip").empty();
          g("#Mhtmltip").is(":visible") || g("#Mhtmltip").show();
          D.ui && D.ui.is(":visible") && D.remove();
          J.length = 0;
          I.length = 0;
          var c = a("Renderer/MapRenderer").currentMap,
            c = c.replace(/\.gat$/i, ""),
            d = g(
              '\x3cdiv class\x3d"maptitle"\x3e\x3cdiv class\x3d"mainMap"\x3e\x3ch2\x3e' +
                E(g(this).data("map")).name +
                "(" +
                g(this).data("map") +
                ')\x3c/h2\x3e\x3cul\x3e\x3cli class\x3d"sd" data-map\x3d"' +
                g(this).data("map") +
                '"\x3e\x3cimg src\x3d"/statics/imgs/map/s/' +
                g(this).data("map") +
                '.png" /\x3e' +
                (E(g(this).data("map")).hasBoss
                  ? '\x3cspan class\x3d"mvpMap" data-background\x3d"minimap/boss_1.bmp"\x3e\x3c/span\x3e'
                  : "") +
                '\x3c/li\x3e\x3c/ul\x3e\x3c/div\x3e\x3cdiv class\x3d"lvspan"\x3e\x3c/div\x3e\x3cdiv class\x3d"mobs"\x3e\x3c/div\x3e\x3cdiv class\x3d"droptitle"\x3e\x3c/div\x3e\x3cdiv class\x3d"dropbox"\x3e\x3c/div\x3e\x3c/div\x3e',
            );
          if (0 < E(g(this).data("map")).branch.length)
            for (var e in E(g(this).data("map")).branch)
              if (c == E(g(this).data("map")).branch[e]) {
                var b = !0,
                  f = E(g(this).data("map")).branch[e];
                d.find(".mainMap .sd").removeClass("sd");
                d.find(".mainMap ul").append(
                  '\x3cli class\x3d"sd" data-map\x3d"' +
                    f +
                    '"\x3e\x3cimg src\x3d"/statics/imgs/map/s/' +
                    f +
                    '.png" /\x3e' +
                    (E(f).hasBoss
                      ? '\x3cspan class\x3d"mvpMap" data-background\x3d"minimap/boss_1.bmp"\x3e\x3c/span\x3e'
                      : "") +
                    "\x3c/li\x3e",
                );
              } else
                ((f = E(g(this).data("map")).branch[e]),
                  d
                    .find(".mainMap ul")
                    .append(
                      '\x3cli data-map\x3d"' +
                        f +
                        '"\x3e\x3cimg src\x3d"/statics/imgs/map/s/' +
                        f +
                        '.png" /\x3e' +
                        (E(f).hasBoss
                          ? '\x3cspan class\x3d"mvpMap" data-background\x3d"minimap/boss_1.bmp"\x3e\x3c/span\x3e'
                          : "") +
                        "\x3c/li\x3e",
                    ));
          0 < d.find(".mainMap .mvpMap").length &&
            k.loadFile(q.INTERFACE_PATH + "minimap/boss_1.bmp", function (a) {
              d.find(".mainMap .mvpMap").css(
                "backgroundImage",
                "url(" + a + ")",
              );
            });
          if (b) {
            if (
              (d.find(".mainMap h2").html(E(c).name + "(" + c + ")"),
              0 < E(c).mobs.length)
            ) {
              b = 0;
              f = 99;
              for (e in E(c).mobs) {
                var h = g(
                  '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
                    E(c).mobs[e] +
                    "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
                );
                b < F(E(c).mobs[e]).LV && (b = F(E(c).mobs[e]).LV);
                f > F(E(c).mobs[e]).LV && (f = F(E(c).mobs[e]).LV);
                J[e] = new G();
                var l = { job: E(c).mobs[e] };
                J[e].set(l);
                J[e].noSound = !0;
                I[e] = h.find("canvas")[0].getContext("2d");
                d.find(".mobs").append(h);
              }
              c =
                f == b
                  ? " ( Lv. " + b + " )"
                  : " ( Lv. " + f + " - " + b + " )";
              d.find(".lvspan").html(
                "\x3cp\x3e\u5730\u56fe\u9b54\u7269" + c + "\x3c/p\x3e",
              );
            }
          } else if (0 < E(g(this).data("map")).mobs.length) {
            b = 0;
            f = 99;
            for (e in E(g(this).data("map")).mobs)
              ((h = g(
                '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
                  E(g(this).data("map")).mobs[e] +
                  "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
              )),
                b < F(E(g(this).data("map")).mobs[e]).LV &&
                  (b = F(E(g(this).data("map")).mobs[e]).LV),
                f > F(E(g(this).data("map")).mobs[e]).LV &&
                  (f = F(E(g(this).data("map")).mobs[e]).LV),
                (J[e] = new G()),
                (l = { job: E(g(this).data("map")).mobs[e] }),
                J[e].set(l),
                (J[e].noSound = !0),
                (I[e] = h.find("canvas")[0].getContext("2d")),
                d.find(".mobs").append(h));
            c =
              f == b ? " ( Lv. " + b + " )" : " ( Lv. " + f + " - " + b + " )";
            d.find(".lvspan").html(
              "\x3cp\x3e\u5730\u56fe\u9b54\u7269" + c + "\x3c/p\x3e",
            );
          }
          g("#Mhtmltip").append(d);
          return !1;
        }
      });
      this.ui.find("#Mhtmltip").on("click", "li", function () {
        if (!z) {
          if (g(this).data("map") != g("#Mhtmltip .mainMap .sd").data("map")) {
            g(".gogogo").show();
            g(".move").show();
            var a = g("#Mhtmltip");
            a.find(".sd").removeClass("sd");
            g(this).addClass("sd");
            g(
              "#Mhtmltip .lvspan,#Mhtmltip .mobs,#Mhtmltip .droptitle,#Mhtmltip .dropbox",
            ).empty();
            D.ui && D.ui.is(":visible") && D.remove();
            J.length = 0;
            I.length = 0;
            a.find(".mainMap h2").html(
              E(g(this).data("map")).name + "(" + g(this).data("map") + ")",
            );
            if (0 < E(g(this).data("map")).mobs.length) {
              var b = 0,
                c = 99,
                d;
              for (d in E(g(this).data("map")).mobs) {
                var e = g(
                  '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
                    E(g(this).data("map")).mobs[d] +
                    "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
                );
                b < F(E(g(this).data("map")).mobs[d]).LV &&
                  (b = F(E(g(this).data("map")).mobs[d]).LV);
                c > F(E(g(this).data("map")).mobs[d]).LV &&
                  (c = F(E(g(this).data("map")).mobs[d]).LV);
                J[d] = new G();
                var f = { job: E(g(this).data("map")).mobs[d] };
                J[d].set(f);
                J[d].noSound = !0;
                I[d] = e.find("canvas")[0].getContext("2d");
                a.find(".mobs").append(e);
              }
              b =
                c == b
                  ? " ( Lv. " + b + " )"
                  : " ( Lv. " + c + " - " + b + " )";
              a.find(".lvspan").html(
                "\x3cp\x3e\u5730\u56fe\u9b54\u7269" + b + "\x3c/p\x3e",
              );
            }
          }
          return !1;
        }
      });
      this.ui.find("#Mhtmltip").on("click", ".mobtitle", function () {
        if (!z) {
          if (g(this).data("id") != g("#Mhtmltip .mobtitle.sd").data("id")) {
            var a = 0,
              b = g("#Mhtmltip");
            b.find(".mobs .sd").removeClass("sd");
            g(this).addClass("sd");
            g("#Mhtmltip .dropbox").empty();
            D.ui && D.ui.is(":visible") && D.remove();
            for (var c = F(g(this).data("id")), d = 0; d <= c.MvpDropsNum; d++)
              c["MVP" + d + "id"] &&
                0 < c["MVP" + d + "id"] &&
                (e(c["MVP" + d + "id"], c["MVP" + d + "per"]), (a += 1));
            for (d = 0; d <= c.DropsNum; d++)
              c["Drop" + d + "id"] &&
                0 < c["Drop" + d + "id"] &&
                (e(c["Drop" + d + "id"], c["Drop" + d + "per"]), (a += 1));
            b.find(".droptitle").html(
              "\x3cp\x3e Lv." +
                c.LV +
                " " +
                c.kName +
                " \u6389\u843d\u7269\u54c1 ( " +
                a +
                " )\x3c/p\x3e",
            );
          }
          return !1;
        }
      });
      this.ui.find("#Mhtmltip").on("click", ".dropbox div", function () {
        if (!z) {
          var a = parseInt(this.getAttribute("data-id"), 10),
            b = q.getItemInfo(a);
          g("#Mhtmltip .dropbox div").removeClass("sd");
          g(this).addClass("sd");
          b &&
            (D.uid != a
              ? (D.append(),
                (b.ITID = a),
                (b.IsIdentified = 1),
                (D.uid = a),
                (D.item_ = b),
                (D.type = "Worldmap"),
                D.setItem(b),
                D.ui.css({ zIndex: 90 }))
              : D.remove());
        }
        return !1;
      });
      this.ui.find("#Mhtmltip").on("click", function (a) {
        z ||
          ((J.length = 0),
          (I.length = 0),
          g(".gogogo").hide(),
          g(".move").hide(),
          g("#Mhtmltip").hide(),
          g("#Mhtmltip").empty(),
          D.ui && D.ui.is(":visible") && D.remove(),
          a.stopImmediatePropagation());
      });
      this.ui.find(".mapblock").on("change", function (a) {
        g("#worldmap .container").scrollTop(0);
        g("#worldmap .container").scrollLeft(0);
        switch (g(this).get(0).selectedIndex) {
          case 0:
            y.ui.find(".bigworld").hide();
            y.ui.find(".bigworld.normal").show();
            g("#worldmap .container").scrollLeft(50);
            break;
          case 1:
            y.ui.find(".bigworld").hide();
            y.ui.find(".bigworld.dimension").show();
            g("#worldmap .container").scrollLeft(200);
            break;
          case 2:
            y.ui.find(".bigworld").hide();
            y.ui.find(".bigworld.localizing1").show();
            g("#worldmap .container").scrollLeft(100);
            break;
          case 3:
            (y.ui.find(".bigworld").hide(),
              y.ui.find(".bigworld.localizing2").show(),
              g("#worldmap .container").scrollLeft(100));
        }
        0 < g(".Mhtmltip.here").length &&
          g(".Mhtmltip.here").is(":visible") &&
          (g("#worldmap .container").scrollTop(
            g(".Mhtmltip.here").offset().top / 1.5,
          ),
          g("#worldmap .container").scrollLeft(
            g(".Mhtmltip.here").offset().left / 1.5,
          ));
      });
      this.ui.find(".search").on("click", function (a) {
        g("#shMtip").show();
      });
      this.ui.find(".search_btn").on("click", function (a) {
        a = y.ui.find(".msg").val();
        var b = y.ui.find(".stype option:selected").index();
        if (!a) return !1;
        y.ui.find(".scontainer").empty();
        L.length = 0;
        x.length = 0;
        if (0 != b)
          if (((b = /^\d+$/), b.test(a))) {
            b = q.getItemInfo(a);
            b.ID = a;
            var c = g(
              "\x3cp\x3e\u641c\u7d22 ID " +
                a +
                " \u76f8\u5173\u9053\u5177\x3c/p\x3e",
            );
            y.ui.find(".scontainer").append(c);
            c = g('\x3cdiv class\x3d"items"\x3e\x3c/div\x3e');
            y.ui.find(".scontainer").append(c);
            b && m(b);
          } else
            for (
              b = q.searchItem(a),
                c = g(
                  "\x3cp\x3e\u641c\u7d22 " +
                    a +
                    " \u76f8\u5173\u9053\u5177(" +
                    b.length +
                    ")\x3c/p\x3e",
                ),
                y.ui.find(".scontainer").append(c),
                c = g('\x3cdiv class\x3d"items"\x3e\x3c/div\x3e'),
                y.ui.find(".scontainer").append(c),
                a = 0;
              a < b.length;
              a++
            )
              m(b[a]);
        else if (((b = /^\d+$/), b.test(a))) {
          if (
            ((b = q.getmobData(a)),
            (c = g(
              "\x3cp\x3e\u641c\u7d22 ID " +
                a +
                " \u76f8\u5173\u9b54\u7269\x3c/p\x3e",
            )),
            y.ui.find(".scontainer").append(c),
            (c = g('\x3cdiv class\x3d"mobs"\x3e\x3c/div\x3e')),
            y.ui.find(".scontainer").append(c),
            b)
          ) {
            c = g(
              '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
                a +
                "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
            );
            L[0] = new G();
            var d = { job: a };
            L[0].set(d);
            L[0].noSound = !0;
            x[0] = c.find("canvas")[0].getContext("2d");
            y.ui.find(".scontainer .mobs").append(c);
          }
        } else
          for (
            b = q.searchMob(a),
              c = g(
                "\x3cp\x3e\u641c\u7d22 " +
                  a +
                  " \u76f8\u5173\u9b54\u7269(" +
                  b.length +
                  ")\x3c/p\x3e",
              ),
              y.ui.find(".scontainer").append(c),
              c = g('\x3cdiv class\x3d"mobs"\x3e\x3c/div\x3e'),
              y.ui.find(".scontainer").append(c),
              a = 0;
            a < b.length;
            a++
          )
            ((c = g(
              '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
                b[a].ID +
                "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
            )),
              (L[a] = new G()),
              (d = { job: b[a].ID }),
              L[a].set(d),
              (L[a].noSound = !0),
              (x[a] = c.find("canvas")[0].getContext("2d")),
              y.ui.find(".scontainer .mobs").append(c));
      });
      this.ui.find("#shMtip").on("click", ".mobtitle", function () {
        if (!z) {
          if (g(this).data("id") != g(".mobtitle.sd").data("id")) {
            y.ui.find(".mainMap").remove();
            var a = g("#shMtip");
            a.find(".mobs .sd").removeClass("sd");
            g(this).addClass("sd");
            var a = a.find(".mobs .sd").data("id"),
              b = q.searchMobMap(a),
              a = g(
                '\x3cdiv class\x3d"mainMap"\x3e\x3cp\x3e\u641c\u7d22 ' +
                  q.getmobName(a) +
                  " \u51fa\u6ca1\u5730\u56fe(" +
                  b.length +
                  ")\x3c/p\x3e\x3cul\x3e\x3c/ul\x3e\x3c/div\x3e",
              );
            y.ui.find(".scontainer").append(a);
            for (a = 0; a < b.length; a++)
              y.ui
                .find(".scontainer .mainMap ul")
                .append(
                  '\x3cli data-map\x3d"' +
                    b[a].kName +
                    '"\x3e\x3cimg src\x3d"/statics/imgs/map/s/' +
                    b[a].kName +
                    '.png" /\x3e\x3c/li\x3e',
                );
          }
          return !1;
        }
      });
      this.ui.find(".close_btn").on("click", function (a) {
        L.length = 0;
        x.length = 0;
        g("#shMtip").hide();
        y.ui.find(".snav .msg").val("");
        y.ui.find(".scontainer").empty();
      });
      this.ui.find("#shMtip").on("click", "li", function () {
        if (!z) {
          if (g(this).data("map") != g("#Mhtmltip .Mhtmltip.sd").data("map")) {
            g(".gogogo").show();
            g(".move").show();
            var a = g("#shMtip");
            a.find(".mainMap .sd").removeClass("sd");
            g(this).addClass("sd");
            g("#Mhtmltip").empty();
            g("#Mhtmltip").is(":visible") || g("#Mhtmltip").show();
            D.ui && D.ui.is(":visible") && D.remove();
            var b = g(this).data("map");
            r(b);
            a = g(
              '\x3cdiv class\x3d"maptitle"\x3e\x3cdiv class\x3d"mainMap"\x3e\x3ch2\x3e' +
                E(b).name +
                "(" +
                b +
                ')\x3c/h2\x3e\x3cul\x3e\x3cli class\x3d"sd" data-map\x3d"' +
                b +
                '"\x3e\x3cimg src\x3d"/statics/imgs/map/s/' +
                b +
                '.png" /\x3e' +
                (E(b).hasBoss
                  ? '\x3cspan class\x3d"mvpMap" data-background\x3d"minimap/boss_1.bmp"\x3e\x3c/span\x3e'
                  : "") +
                '\x3c/li\x3e\x3c/ul\x3e\x3c/div\x3e\x3cdiv class\x3d"lvspan"\x3e\x3c/div\x3e\x3cdiv class\x3d"mobs"\x3e\x3c/div\x3e\x3cdiv class\x3d"droptitle"\x3e\x3c/div\x3e\x3cdiv class\x3d"dropbox"\x3e\x3c/div\x3e\x3c/div\x3e',
            );
            0 < a.find(".mainMap .mvpMap").length &&
              k.loadFile(q.INTERFACE_PATH + "minimap/boss_1.bmp", function (b) {
                a.find(".mainMap .mvpMap").css(
                  "backgroundImage",
                  "url(" + b + ")",
                );
              });
            var c = g("#shMtip .mobtitle.sd").data("id");
            if (0 < E(b).mobs.length) {
              var d = 0,
                f = 99,
                h;
              for (h in E(b).mobs) {
                var l = g(
                  '\x3cdiv class\x3d"mobtitle ' +
                    (E(b).mobs[h] == c ? "sd" : "") +
                    '" data-id\x3d"' +
                    E(b).mobs[h] +
                    "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
                );
                d < F(E(b).mobs[h]).LV && (d = F(E(b).mobs[h]).LV);
                f > F(E(b).mobs[h]).LV && (f = F(E(b).mobs[h]).LV);
                J[h] = new G();
                var m = { job: E(b).mobs[h] };
                J[h].set(m);
                J[h].noSound = !0;
                I[h] = l.find("canvas")[0].getContext("2d");
                a.find(".mobs").append(l);
              }
              h =
                f == d
                  ? " ( Lv. " + d + " )"
                  : " ( Lv. " + f + " - " + d + " )";
              a.find(".lvspan").html(
                "\x3cp\x3e\u5730\u56fe\u9b54\u7269" + h + "\x3c/p\x3e",
              );
            }
            g("#Mhtmltip").append(a);
            b = 0;
            g("#Mhtmltip .dropbox").empty();
            D.ui && D.ui.is(":visible") && D.remove();
            c = F(c);
            for (h = 0; h <= c.MvpDropsNum; h++)
              c["MVP" + h + "id"] &&
                0 < c["MVP" + h + "id"] &&
                (e(c["MVP" + h + "id"], c["MVP" + h + "per"]), (b += 1));
            for (h = 0; h <= c.DropsNum; h++)
              c["Drop" + h + "id"] &&
                0 < c["Drop" + h + "id"] &&
                (e(c["Drop" + h + "id"], c["Drop" + h + "per"]), (b += 1));
            a.find(".droptitle").html(
              "\x3cp\x3e Lv." +
                c.LV +
                " " +
                c.kName +
                " \u6389\u843d\u7269\u54c1 ( " +
                b +
                " )\x3c/p\x3e",
            );
          }
          return !1;
        }
      });
      this.ui.find("#shMtip").on("click", ".items div", function () {
        if (!z) {
          if (g(this).data("id") != g(".items .sd").data("id")) {
            y.ui.find(".mobBlock").remove();
            y.ui.find(".mainMap").remove();
            var a = g("#shMtip");
            a.find(".items .sd").removeClass("sd");
            g(this).addClass("sd");
            var a = g(this).data("id"),
              b = q.searchMobDrop(a),
              c = { ITID: a, IsIdentified: 1 },
              a = g(
                '\x3cdiv class\x3d"mobBlock"\x3e\x3cp\x3e\u641c\u7d22\u6389\u843d ' +
                  q.getItemName(c) +
                  " \u7684\u9b54\u7269(" +
                  b.length +
                  ')\x3c/p\x3e\x3cdiv class\x3d"mobs"\x3e\x3c/div\x3e\x3c/div\x3e',
              );
            y.ui.find(".scontainer").append(a);
            for (a = 0; a < b.length; a++)
              ((c = g(
                '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
                  b[a].ID +
                  "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
              )),
                (L[a] = new G()),
                L[a].set({ job: b[a].ID }),
                (L[a].noSound = !0),
                (x[a] = c.find("canvas")[0].getContext("2d")),
                y.ui.find(".scontainer .mobs").append(c));
          } else if (
            ((a = parseInt(this.getAttribute("data-id"), 10)),
            (c = q.getItemInfo(a)))
          )
            D.uid != a
              ? (D.append(),
                (c.ITID = a),
                (c.IsIdentified = 1),
                (D.uid = a),
                (D.item_ = c),
                (D.type = "Worldmap"),
                D.setItem(c),
                D.ui.css({ zIndex: 90 }))
              : D.remove();
          return !1;
        }
      });
    };
    y.moving = function (c, d, e) {
      function f() {
        var a = g.currentMap,
          b = k.noMapsame,
          a = a.replace(/\.gat$/i, "");
        if (a == r) return (clearInterval(M), !1);
        if ((a == m && 0 == b) || l)
          ((l = !1),
            (m = u[n].map),
            (p = u[n].x),
            (t = u[n].y),
            h.moving(2, m, p, t),
            (n += 1));
      }
      var g = a("Renderer/MapRenderer"),
        h = a("UI/Components/MiniMap/MiniMap"),
        k = a("UI/Components/vbk/vbk"),
        l = !0,
        m = "",
        n = 0,
        p = 0,
        t = 0,
        r = c;
      event.stopImmediatePropagation();
      clearInterval(M);
      c = g.currentMap;
      c = c.replace(/\.gat$/i, "");
      var u = b(c, r);
      0 < u.length
        ? (u.push({ map: r, x: d, y: e }),
          (m = u[n].map),
          (M = setInterval(f, 1e3)),
          B.setMsg("\u524d\u5f80 " + q.getMapName(r + ".gat")))
        : B.setMsg(
            "\u76ee\u6807\u5730\u56fe\u65e0\u6cd5\u901a\u8fc7\u79fb\u52a8\u5230\u8fbe",
          );
    };
    y.select = function (b) {
      this.ui.show();
      this.focus();
      b = a("Renderer/MapRenderer").currentMap;
      b = b.replace(/\.gat$/i, "");
      g(".Mhtmltip.here").removeClass("here");
      if (!E(b)) return (n.render(h), !1);
      "" != E(b).belong
        ? g(".Mhtmltip[data-map\x3d'" + E(b).belong + "']").addClass("here")
        : g(".Mhtmltip[data-map\x3d'" + b + "']").addClass("here");
      g(".bigworld").hide();
      0 < g(".Mhtmltip.here").length
        ? (g(".Mhtmltip.here").parents("table").show(),
          (b = g(".Mhtmltip.here").parents("table").data("index")),
          this.ui.find(".mapblock option").eq(b).prop("selected", "selected"))
        : ((b = this.ui.find(".mapblock").get(0).selectedIndex),
          this.ui.find("table").eq(b).show());
      g("#worldmap .container").scrollTop(0);
      g("#worldmap .container").scrollLeft(0);
      0 < g(".Mhtmltip.here").length &&
        g(".Mhtmltip.here").is(":visible") &&
        (g("#worldmap .container").scrollTop(
          g(".Mhtmltip.here").offset().top / 1.5,
        ),
        g("#worldmap .container").scrollLeft(
          g(".Mhtmltip.here").offset().left / 1.5,
        ));
      n.render(h);
    };
    y.selectMap = function (a) {
      g(".gogogo").show();
      g(".move").show();
      g("#Mhtmltip").empty().show();
      r(a);
      var b = g(
        '\x3cdiv class\x3d"maptitle"\x3e\x3cdiv class\x3d"mainMap"\x3e\x3ch2\x3e' +
          E(a).name +
          "(" +
          a +
          ')\x3c/h2\x3e\x3cul\x3e\x3cli class\x3d"sd" data-map\x3d"' +
          a +
          '"\x3e\x3cimg src\x3d"/statics/imgs/map/s/' +
          a +
          '.png" /\x3e' +
          (E(a).hasBoss
            ? '\x3cspan class\x3d"mvpMap" data-background\x3d"minimap/boss_1.bmp"\x3e\x3c/span\x3e'
            : "") +
          '\x3c/li\x3e\x3c/ul\x3e\x3c/div\x3e\x3cdiv class\x3d"lvspan"\x3e\x3c/div\x3e\x3cdiv class\x3d"mobs"\x3e\x3c/div\x3e\x3cdiv class\x3d"droptitle"\x3e\x3c/div\x3e\x3cdiv class\x3d"dropbox"\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      if (0 < E(a).branch.length)
        for (var c in E(a).branch)
          if (a == E(a).branch[c]) {
            var d = E(a).branch[c];
            b.find(".mainMap .sd").removeClass("sd");
            b.find(".mainMap ul").append(
              '\x3cli class\x3d"sd" data-map\x3d"' +
                d +
                '"\x3e\x3cimg src\x3d"/statics/imgs/map/s/' +
                d +
                '.png" /\x3e' +
                (E(d).hasBoss
                  ? '\x3cspan class\x3d"mvpMap" data-background\x3d"minimap/boss_1.bmp"\x3e\x3c/span\x3e'
                  : "") +
                "\x3c/li\x3e",
            );
          } else
            ((d = E(a).branch[c]),
              b
                .find(".mainMap ul")
                .append(
                  '\x3cli data-map\x3d"' +
                    d +
                    '"\x3e\x3cimg src\x3d"/statics/imgs/map/s/' +
                    d +
                    '.png" /\x3e' +
                    (E(d).hasBoss
                      ? '\x3cspan class\x3d"mvpMap" data-background\x3d"minimap/boss_1.bmp"\x3e\x3c/span\x3e'
                      : "") +
                    "\x3c/li\x3e",
                ));
      0 < b.find(".mainMap .mvpMap").length &&
        k.loadFile(q.INTERFACE_PATH + "minimap/boss_1.bmp", function (a) {
          b.find(".mainMap .mvpMap").css("backgroundImage", "url(" + a + ")");
        });
      d = g("#shMtip .mobtitle.sd").data("id");
      if (0 < E(a).mobs.length) {
        var e = 0,
          f = 99;
        for (c in E(a).mobs) {
          var h = g(
            '\x3cdiv class\x3d"mobtitle ' +
              (E(a).mobs[c] == d ? "sd" : "") +
              '" data-id\x3d"' +
              E(a).mobs[c] +
              "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
          );
          e < F(E(a).mobs[c]).LV && (e = F(E(a).mobs[c]).LV);
          f > F(E(a).mobs[c]).LV && (f = F(E(a).mobs[c]).LV);
          J[c] = new G();
          var l = { job: E(a).mobs[c] };
          J[c].set(l);
          J[c].noSound = !0;
          I[c] = h.find("canvas")[0].getContext("2d");
          b.find(".mobs").append(h);
        }
        a = f == e ? " ( Lv. " + e + " )" : " ( Lv. " + f + " - " + e + " )";
        b.find(".lvspan").html(
          "\x3cp\x3e\u5730\u56fe\u9b54\u7269" + a + "\x3c/p\x3e",
        );
      }
      g("#Mhtmltip").append(b);
    };
    y.selectItem = function (a) {
      g("#shMtip").show();
      if (!a) return !1;
      y.ui.find(".stype option[value\x3d'1']").prop("selected", "selected");
      y.ui.find(".snav .msg").val(a);
      y.ui.find(".scontainer").empty();
      L.length = 0;
      x.length = 0;
      if (/^\d+$/.test(a)) {
        var b = q.getItemInfo(a);
        b.ID = a;
        a = g(
          "\x3cp\x3e\u641c\u7d22 ID " +
            a +
            " \u76f8\u5173\u9053\u5177\x3c/p\x3e",
        );
        y.ui.find(".scontainer").append(a);
        a = g('\x3cdiv class\x3d"items"\x3e\x3c/div\x3e');
        y.ui.find(".scontainer").append(a);
        b && m(b);
      } else
        for (
          b = q.searchItem(a),
            a = g(
              "\x3cp\x3e\u641c\u7d22 " +
                a +
                " \u76f8\u5173\u9053\u5177(" +
                b.length +
                ")\x3c/p\x3e",
            ),
            y.ui.find(".scontainer").append(a),
            a = g('\x3cdiv class\x3d"items"\x3e\x3c/div\x3e'),
            y.ui.find(".scontainer").append(a),
            a = 0;
          a < b.length;
          a++
        )
          m(b[a]);
    };
    y.selectMob = function (a) {
      g("#shMtip").show();
      if (!a) return !1;
      y.ui.find(".stype option[value\x3d'0']").prop("selected", "selected");
      y.ui.find(".snav .msg").val(a);
      y.ui.find(".scontainer").empty();
      L.length = 0;
      x.length = 0;
      if (/^\d+$/.test(a)) {
        var b = q.getmobData(a),
          c = g(
            "\x3cp\x3e\u641c\u7d22 ID " +
              a +
              " \u76f8\u5173\u9b54\u7269\x3c/p\x3e",
          );
        y.ui.find(".scontainer").append(c);
        c = g('\x3cdiv class\x3d"mobs"\x3e\x3c/div\x3e');
        y.ui.find(".scontainer").append(c);
        b &&
          ((c = g(
            '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
              a +
              "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
          )),
          (L[0] = new G()),
          (a = { job: a }),
          L[0].set(a),
          (L[0].noSound = !0),
          (x[0] = c.find("canvas")[0].getContext("2d")),
          y.ui.find(".scontainer .mobs").append(c));
      } else {
        b = q.searchMob(a);
        c = g(
          "\x3cp\x3e\u641c\u7d22 " +
            a +
            " \u76f8\u5173\u9b54\u7269(" +
            b.length +
            ")\x3c/p\x3e",
        );
        y.ui.find(".scontainer").append(c);
        c = g('\x3cdiv class\x3d"mobs"\x3e\x3c/div\x3e');
        y.ui.find(".scontainer").append(c);
        for (var d = 0; d < b.length; d++)
          ((c = g(
            '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
              b[d].ID +
              "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
          )),
            (L[d] = new G()),
            (a = { job: b[d].ID }),
            L[d].set(a),
            (L[d].noSound = !0),
            (x[d] = c.find("canvas")[0].getContext("2d")),
            y.ui.find(".scontainer .mobs").append(c));
      }
    };
    y.onAppend = function () {
      this.ui.hide();
    };
    y.onRemove = function () {};
    y.clearWalk = function () {
      z = !1;
      clearInterval(M);
    };
    var N = 0;
    y.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          this.ui.is(":visible")
            ? (y.ui.hide(),
              y.ui.css({ zIndex: 50 }),
              n.stop(h),
              g(this).hasClass("Mhtmltip") ||
                (g(".Mhtmltip.sd").removeClass("sd"),
                (J.length = 0),
                (I.length = 0),
                g("#Mhtmltip").hide(),
                g("#Mhtmltip").empty(),
                D.ui && D.ui.is(":visible") && D.remove()))
            : y.select();
      }
    };
    y.onKeyDown = function (a) {
      switch (a.which) {
        case v.ENTER:
          a = y.ui.find(".msg").val();
          var b = y.ui.find(".stype option:selected").index();
          if (!a) return !1;
          y.ui.find(".scontainer").empty();
          L.length = 0;
          x.length = 0;
          if (0 != b)
            if (((b = /^\d+$/), b.test(a))) {
              b = q.getItemInfo(a);
              b.ID = a;
              var c = g(
                "\x3cp\x3e\u641c\u7d22 ID " +
                  a +
                  " \u76f8\u5173\u9053\u5177\x3c/p\x3e",
              );
              y.ui.find(".scontainer").append(c);
              c = g('\x3cdiv class\x3d"items"\x3e\x3c/div\x3e');
              y.ui.find(".scontainer").append(c);
              b && m(b);
            } else
              for (
                b = q.searchItem(a),
                  c = g(
                    "\x3cp\x3e\u641c\u7d22 " +
                      a +
                      " \u76f8\u5173\u9053\u5177(" +
                      b.length +
                      ")\x3c/p\x3e",
                  ),
                  y.ui.find(".scontainer").append(c),
                  c = g('\x3cdiv class\x3d"items"\x3e\x3c/div\x3e'),
                  y.ui.find(".scontainer").append(c),
                  a = 0;
                a < b.length;
                a++
              )
                m(b[a]);
          else if (((b = /^\d+$/), b.test(a))) {
            if (
              ((b = q.getmobData(a)),
              (c = g(
                "\x3cp\x3e\u641c\u7d22 ID " +
                  a +
                  " \u76f8\u5173\u9b54\u7269\x3c/p\x3e",
              )),
              y.ui.find(".scontainer").append(c),
              (c = g('\x3cdiv class\x3d"mobs"\x3e\x3c/div\x3e')),
              y.ui.find(".scontainer").append(c),
              b)
            ) {
              c = g(
                '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
                  a +
                  "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
              );
              L[0] = new G();
              var d = { job: a };
              L[0].set(d);
              L[0].noSound = !0;
              x[0] = c.find("canvas")[0].getContext("2d");
              y.ui.find(".scontainer .mobs").append(c);
            }
          } else
            for (
              b = q.searchMob(a),
                c = g(
                  "\x3cp\x3e\u641c\u7d22 " +
                    a +
                    " \u76f8\u5173\u9b54\u7269(" +
                    b.length +
                    ")\x3c/p\x3e",
                ),
                y.ui.find(".scontainer").append(c),
                c = g('\x3cdiv class\x3d"mobs"\x3e\x3c/div\x3e'),
                y.ui.find(".scontainer").append(c),
                a = 0;
              a < b.length;
              a++
            )
              ((c = g(
                '\x3cdiv class\x3d"mobtitle" data-id\x3d"' +
                  b[a].ID +
                  "\"\x3e\x3cdiv class\x3d'mag'\x3e\x3ccanvas width\x3d120 height\x3d160\x3e\x3c/canvas\x3e\x3c/div\x3e\x3c/div\x3e",
              )),
                (L[a] = new G()),
                (d = { job: b[a].ID }),
                L[a].set(d),
                (L[a].noSound = !0),
                (x[a] = c.find("canvas")[0].getContext("2d")),
                y.ui.find(".scontainer .mobs").append(c));
          return !0;
        default:
          return !0;
      }
    };
    return u.addComponent(y);
  },
);
