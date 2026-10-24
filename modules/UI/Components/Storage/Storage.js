define(
  "UI/Components/Storage/Storage",
  "require DB/DBManager Controls/KeyEventHandler Utils/jquery Core/Client Core/Preferences Renderer/Renderer Controls/MouseEventHandler Preferences/Controls UI/UIManager UI/UIComponent UI/Components/InputBox/InputBox UI/Components/ItemInfo/ItemInfo text!./Storage.html text!./Storage.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function c(a) {
      var b = B(a).position().top,
        c = B(a).position().left,
        e = B(a)[0].getAttribute("data-index"),
        f = 0,
        g = 0;
      0 > e ? (f = N.height) : ((f = H[e]), (g = K[e]));
      var h;
      h = setInterval(function () {
        var a = Math.floor((z.screen.y - b - 20) / 32),
          h = Math.floor((z.screen.x - c - 25) / 32);
        0 > e
          ? (a = Math.min(Math.max(a, 12), 14))
          : ((a = Math.min(Math.max(a, 3), 8)),
            (h = Math.min(Math.max(h, 3), 8)));
        a !== f && (d(a, h, e), (f = a), (g = h));
      }, 30);
      B(window).on("mouseup.resize", function (a) {
        1 === a.which &&
          (clearInterval(h),
          B(window).off("mouseup.resize"),
          0 > e ? (N.height = f) : ((H[e] = f), (K[e] = g)));
      });
    }
    function d(a, b, c) {
      0 > c
        ? (a = Math.min(Math.max(a, 12), 14))
        : ((a = Math.min(Math.max(a, 3), 8)),
          (b = Math.min(Math.max(b, 3), 8)));
      0 > c
        ? (F.ui.find(".MainWindow .container .content").css("height", 32 * a),
          F.ui.find(".MainWindow").css("height", 50 + 32 * a))
        : (F.ui
            .find(
              '.SecondaryWindow[data-index\x3d"' + c + '"] .container .content',
            )
            .css("height", 32 * a),
          F.ui
            .find('.SecondaryWindow[data-index\x3d"' + c + '"]')
            .css("height", 50 + 32 * a),
          F.ui
            .find(
              '.SecondaryWindow[data-index\x3d"' + c + '"] .container .content',
            )
            .css("width", 40 + 32 * b),
          F.ui
            .find('.SecondaryWindow[data-index\x3d"' + c + '"]')
            .css("width", 55 + 32 * b));
    }
    function e() {
      var a = B(this).index();
      N.tab = a;
      O.loadFile(
        A.INTERFACE_PATH + "basic_interface/tab_itm_ex_0" + (a + 1) + ".bmp",
        function (a) {
          F.ui.find(".tabs").css("backgroundImage", 'url("' + a + '")');
          k();
        },
      );
    }
    function m() {
      var a = F.ui.find(".MainWindow .secondline .searchtext").val();
      F.ui
        .find('.SecondaryWindow[data-index\x3d"8"] .container .content')
        .empty();
      for (var b = 0, c = G.length; b < c; ++b) F.addItemSubSearch(G[b], a);
      F.ui.find('.SecondaryWindow[data-index\x3d"8"]').is(":visible") || r(8);
      F.ui.find(".MainWindow .secondline .searchtext").val("");
    }
    function h() {
      var a = parseInt(this.getAttribute("data-index"), 10);
      r(a);
    }
    function r(a) {
      var b = "",
        c = F.ui.find('.SecondaryWindow[data-index\x3d"' + a + '"]');
      N.tabsOpened[a] = !c.is(":visible");
      N.tabsOpened[a]
        ? (P.push(a), c.show())
        : (-1 < P.indexOf(a) && P.splice(P.indexOf(a), 1), c.hide());
      switch (a) {
        case 0:
          b = "\u00bc\u00d2\u00ba\u00f1";
          break;
        case 1:
          b = "\u00c4\u00b3\u00bd\u00c3";
          break;
        case 2:
          b = "\u00b9\u00e6\u00be\u00ee\u00b1\u00b8";
          break;
        case 3:
          b = "\u00b9\u00ab\u00b1\u00e2";
          break;
        case 4:
          b = "\u00c5\u00f5\u00bb\u00e7\u00c3\u00bc";
          break;
        case 5:
          b = "\u00c4\u00ab\u00b5\u00e5";
          break;
        case 6:
          b = "\u00b1\u00e2\u00c5\u00b8";
      }
      8 != a &&
        O.loadFile(
          A.INTERFACE_PATH +
            "basic_interface/" +
            b +
            "-" +
            (N.tabsOpened[a] ? "1" : "2") +
            ".bmp",
          function (b) {
            F.ui
              .find(
                '.MainWindow .footer .firstline button[data-index\x3d"' +
                  a +
                  '"]',
              )
              .css("backgroundImage", 'url("' + b + '")');
          },
        );
    }
    function q(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (U) {}
      a.stopImmediatePropagation();
      if (!c) return !1;
      if (("item" == c.type) & ("OnPushCart" == c.from)) {
        b = c.data;
        if (1 < b.count)
          return (
            x.append(),
            x.setType("number", !1, b.count),
            (x.onSubmitRequest = function (a) {
              x.remove();
              F.reqAddItem1(b.index, parseInt(a, 10));
            }),
            !1
          );
        F.reqAddItem1(b.index, 1);
        return !1;
      }
      if (("item" == c.type) & ("Inventory" == c.from)) {
        b = c.data;
        if (1 < b.count)
          return (
            x.append(),
            x.setType("number", !1, b.count),
            (x.onSubmitRequest = function (a) {
              x.remove();
              F.reqAddItem(b.index, parseInt(a, 10));
            }),
            !1
          );
        F.reqAddItem(b.index, 1);
        return !1;
      }
    }
    function k() {
      F.ui.find(".container .content").empty();
      var a,
        b,
        c = G.slice(0);
      F.ORDER.RISE === N.order
        ? c.sort(function (a, b) {
            return B.escape(A.getItemName(a)).localeCompare(
              B.escape(A.getItemName(b)),
            );
          })
        : F.ORDER.FALL === N.order &&
          c.sort(function (a, b) {
            return B.escape(A.getItemName(b)).localeCompare(
              B.escape(A.getItemName(a)),
            );
          });
      a = 0;
      for (b = c.length; a < b; ++a) F.addItemSub(c[a]);
    }
    function g(a) {
      var b, c;
      b = 0;
      for (c = G.length; b < c; ++b) if (G[b].index === a) return b;
      return -1;
    }
    function t(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      this.scrollTop = 32 * Math.floor(this.scrollTop / 32) - 32 * b;
      return !1;
    }
    function l() {
      var a = parseInt(this.getAttribute("data-index"), 10),
        a = g(a);
      if (!(0 > a)) {
        var a = G[a],
          b = B(this).position(),
          c = B(this).parents().eq(4).find(".overlay");
        c.show();
        c.css({ top: b.top - 10, left: b.left + 30 });
        c.text(A.getItemName(a) + " " + (a.count || 1) + " \u4e2a");
        a.IsIdentified ? c.removeClass("grey") : c.addClass("grey");
      }
    }
    function f() {
      F.ui.find(".overlay").hide();
    }
    function n(a) {
      var b = parseInt(this.getAttribute("data-index"), 10),
        b = g(b);
      if (-1 !== b) {
        var c = new Image(),
          d = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1],
          d = (d = d.replace(/^\"/, "").replace(/\"$/, ""));
        c.src = d;
        a.originalEvent.dataTransfer.setDragImage(c, 12, 12);
        a.originalEvent.dataTransfer.setData(
          "Text",
          JSON.stringify(
            (window._OBJ_DRAG_ = { type: "item", from: "Storage", data: G[b] }),
          ),
        );
        f();
      }
    }
    function p() {
      delete window._OBJ_DRAG_;
    }
    function v() {
      var a = B(this).val();
      N.order =
        "Rise" == a ? F.ORDER.RISE : "Fall" == a ? F.ORDER.FALL : F.ORDER.BASIC;
      k();
    }
    function u(a) {
      a.stopImmediatePropagation();
      a = parseInt(this.getAttribute("data-index"), 10);
      a = g(a);
      if (-1 === a) return !1;
      M.uid === G[a].ITID && M.remove();
      M.append();
      M.uid = G[a].ITID;
      M.setItem(G[a]);
      return !1;
    }
    var A = a("DB/DBManager"),
      D = a("Controls/KeyEventHandler"),
      B = a("Utils/jquery"),
      O = a("Core/Client"),
      C = a("Core/Preferences"),
      y = a("Renderer/Renderer"),
      z = a("Controls/MouseEventHandler"),
      J = a("Preferences/Controls"),
      I = a("UI/UIManager"),
      L = a("UI/UIComponent"),
      x = a("UI/Components/InputBox/InputBox"),
      M = a("UI/Components/ItemInfo/ItemInfo"),
      E = a("text!./Storage.html");
    a = a("text!./Storage.css");
    var F = new L("Storage", E, a);
    F.ITEM = {
      HEALING: 0,
      USABLE: 2,
      ETC: 3,
      EQUIP: 4,
      WEAPON: 5,
      CARD: 6,
      PETEGG: 7,
      PETEQUIP: 8,
      AMMO: 10,
      USABLE_SKILL: 11,
      USABLE_UNK: 18,
    };
    F.TAB = { ITEM: 0, CASH: 1, ARMOR: 2, WEAPON: 3, AMMO: 4, CARD: 5, ETC: 6 };
    F.ORDER = { BASIC: 0, RISE: 1, FALL: 2 };
    var G = [],
      H = Array(8).fill(3, 0, 8),
      K = Array(8).fill(1, 0, 8),
      P = [],
      N = C.get(
        "Storage",
        {
          x: 0,
          y: 0,
          height: 6,
          order: F.ORDER.BASIC,
          tab: F.TAB.ITEM,
          tabsPositions: {
            0: { x: 300, y: 0 },
            1: { x: 300, y: 160 },
            2: { x: 300, y: 320 },
            3: { x: 460, y: 0 },
            4: { x: 460, y: 160 },
            5: { x: 460, y: 320 },
            6: { x: 460, y: 0 },
            7: { x: 460, y: 160 },
            8: { x: 460, y: 320 },
          },
          tabsOpened: [!1, !1, !1, !1, !1, !1, !1, !1, !1],
        },
        1.3,
      );
    F.init = function () {
      var a = this.ui.find(".MainWindow"),
        g = this.ui.find(".SecondaryWindow");
      this.ui.find(".tabs button").mousedown(e);
      this.ui.find(".footer .close").click(this.onClosePressed.bind(this));
      a.find(".titlebar .close").click(this.onClosePressed.bind(this));
      g.find(".titlebar .close").on("click", function () {
        B(".searchsf").hide();
      });
      a.find(".footer .firstline button").click(h);
      a.find(".footer .secondline .search").click(m);
      O.loadFile(
        A.INTERFACE_PATH +
          "basic_interface/tab_itm_ex_0" +
          (N.tab + 1) +
          ".bmp",
        function (a) {
          F.ui.find(".tabs").css("backgroundImage", 'url("' + a + '")');
        },
      );
      this.ui
        .on("drop", q)
        .on("dragover", b)
        .find(".container .content")
        .on("mousewheel DOMMouseScroll", t)
        .on("mouseover", ".item", l)
        .on("mouseout", ".item", f)
        .on("dragstart", ".item", n)
        .on("dragend", ".item", p)
        .on("contextmenu", ".item", u);
      this.ui.find("select").change(v);
      for (var k = {}, r = -1; r < g.length; k = { _main: k._main }, r++) {
        k._main = void 0;
        var V,
          x = 0,
          z = 0,
          C = 0;
        -1 == r
          ? ((k._main = a), (V = N.height), (z = N.x), (C = N.y))
          : ((k._main = B(g[r])),
            (V = H[r]),
            (x = K[r]),
            void 0 !== N.tabsPositions[r] &&
              ((z = N.tabsPositions[r].x), (C = N.tabsPositions[r].y)));
        this.draggable.call({ ui: k._main }, k._main.find(".titlebar"));
        k._main.find(".footer .extend").mousedown(
          (function (a) {
            return function () {
              c(a._main);
            };
          })(k),
        );
        d(V, x, r);
        k._main.css({
          top: Math.min(Math.max(0, C), (y.height - k._main.height()) / 2),
          left: Math.min(Math.max(0, z), y.width - k._main.width()),
        });
      }
    };
    F.onAppend = function () {
      J.talk = !0;
      var a = B._data(window, "events").keydown;
      a.unshift(a.pop());
    };
    F.onKeyDown = function (a) {
      return a.which === D.ESCAPE
        ? (0 < P.length && (r(P[P.length - 1]), a.stopImmediatePropagation()),
          !1)
        : !0;
    };
    F.onRemove = function () {
      J.talk = !1;
      this.ui.find(".container .content").empty();
      G.length = 0;
      N.y = parseInt(this.ui.css("top"), 10);
      N.x = parseInt(this.ui.css("left"), 10);
      N.height = Math.floor((this.ui.height() - 20) / 32);
      N.save();
    };
    F.setItems = function (a) {
      var b, c;
      b = 0;
      for (c = a.length; b < c; ++b) this.addItemSub(a[b]) && G.push(a[b]);
    };
    F.addItem = function (a) {
      var b = g(a.index);
      -1 < b
        ? ((G[b].count += a.count),
          this.ui
            .find('.item[data-index\x3d"' + a.index + '"] .count')
            .text(G[b].count))
        : this.addItemSub(a) && G.push(a);
    };
    F.addItemSub = function (a) {
      var b;
      switch (a.type) {
        case F.ITEM.HEALING:
        case F.ITEM.USABLE:
        case F.ITEM.USABLE_SKILL:
        case F.ITEM.USABLE_SKILL_UNK:
          b = F.TAB.ITEM;
          break;
        case F.ITEM.USABLE_UNK:
          b = F.TAB.CASH;
          break;
        case F.ITEM.EQUIP:
        case F.ITEM.PETEQUIP:
          b = F.TAB.ARMOR;
          break;
        case F.ITEM.WEAPON:
          b = F.TAB.WEAPON;
          break;
        case F.ITEM.AMMO:
          b = F.TAB.AMMO;
          break;
        case F.ITEM.CARD:
          b = F.TAB.CARD;
          break;
        default:
        case F.ITEM.ETC:
        case F.ITEM.PETEGG:
          b = F.TAB.ETC;
      }
      var c = A.getItemInfo(a.ITID),
        d =
          '\x3cdiv class\x3d"item" data-index\x3d"' +
          a.index +
          '" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
          (a.count
            ? '\x3cspan class\x3d"count"\x3e' + a.count + "\x3c/span\x3e "
            : "") +
          '\x3c/div\x3e\x3cspan class\x3d"name"\x3e' +
          B.escape(A.getItemName(a)) +
          "\x3c/span\x3e\x3c/div\x3e";
      b === N.tab && F.ui.find(".MainWindow .container .content").append(d);
      F.ui
        .find('.SecondaryWindow[data-index\x3d"' + b + '"] .container .content')
        .append(d);
      O.loadFile(
        A.INTERFACE_PATH +
          "item/" +
          (a.IsIdentified
            ? c.identifiedResourceName
            : c.unidentifiedResourceName) +
          ".bmp",
        function (b) {
          this.ui
            .find('.item[data-index\x3d"' + a.index + '"] .icon')
            .css("backgroundImage", "url(" + b + ")");
        }.bind(this),
      );
      return !0;
    };
    F.addItemSubSearch = function (a, b) {
      var c = A.getItemInfo(a.ITID);
      B.escape(A.getItemName(a)).toLowerCase().includes(b.toLowerCase()) &&
        ((b =
          '\x3cdiv class\x3d"item" data-index\x3d"' +
          a.index +
          '" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
          (a.count
            ? '\x3cspan class\x3d"count"\x3e' + a.count + "\x3c/span\x3e "
            : "") +
          '\x3c/div\x3e\x3cspan class\x3d"name"\x3e' +
          B.escape(A.getItemName(a)) +
          "\x3c/span\x3e\x3c/div\x3e"),
        F.ui
          .find('.SecondaryWindow[data-index\x3d"8"] .container .content')
          .append(b),
        O.loadFile(
          A.INTERFACE_PATH +
            "item/" +
            (a.IsIdentified
              ? c.identifiedResourceName
              : c.unidentifiedResourceName) +
            ".bmp",
          function (b) {
            this.ui
              .find('.item[data-index\x3d"' + a.index + '"] .icon')
              .css("backgroundImage", "url(" + b + ")");
          }.bind(this),
        ));
      return !0;
    };
    F.removeItem = function (a, b) {
      var c = g(a);
      if (0 > c) return null;
      if (G[c].count && ((G[c].count -= b), 0 < G[c].count))
        return (
          this.ui
            .find('.item[data-index\x3d"' + a + '"] .count')
            .text(G[c].count),
          G[c]
        );
      b = G[c];
      G.splice(c, 1);
      this.ui.find('.item[data-index\x3d"' + a + '"]').remove();
      return b;
    };
    F.setItemInfo = function (a, b) {
      this.ui.find(".footer .current").text(a);
      this.ui.find(".footer .limit").text(b);
    };
    F.onClosePressed = function () {};
    F.reqAddItem = function () {};
    F.reqRemoveItem = function () {};
    return I.addComponent(F);
  },
);
