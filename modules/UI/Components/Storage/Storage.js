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
      var b = C(a).position().top,
        c = C(a).position().left,
        e = C(a)[0].getAttribute("data-index"),
        f = 0,
        g = 0;
      0 > e ? (f = Q.height) : ((f = G[e]), (g = K[e]));
      var h;
      h = setInterval(function () {
        var a = Math.floor((F.screen.y - b - 20) / 32),
          h = Math.floor((F.screen.x - c - 25) / 32);
        0 > e
          ? (a = Math.min(Math.max(a, 12), 14))
          : ((a = Math.min(Math.max(a, 3), 8)),
            (h = Math.min(Math.max(h, 3), 8)));
        a !== f && (d(a, h, e), (f = a), (g = h));
      }, 30);
      C(window).on("mouseup.resize", function (a) {
        1 === a.which &&
          (clearInterval(h),
          C(window).off("mouseup.resize"),
          0 > e ? (Q.height = f) : ((G[e] = f), (K[e] = g)));
      });
    }
    function d(a, b, c) {
      0 > c
        ? (a = Math.min(Math.max(a, 12), 14))
        : ((a = Math.min(Math.max(a, 3), 8)),
          (b = Math.min(Math.max(b, 3), 8)));
      0 > c
        ? (L.ui.find(".MainWindow .container .content").css("height", 32 * a),
          L.ui.find(".MainWindow").css("height", 50 + 32 * a))
        : (L.ui
            .find(
              '.SecondaryWindow[data-index\x3d"' + c + '"] .container .content',
            )
            .css("height", 32 * a),
          L.ui
            .find('.SecondaryWindow[data-index\x3d"' + c + '"]')
            .css("height", 50 + 32 * a),
          L.ui
            .find(
              '.SecondaryWindow[data-index\x3d"' + c + '"] .container .content',
            )
            .css("width", 40 + 32 * b),
          L.ui
            .find('.SecondaryWindow[data-index\x3d"' + c + '"]')
            .css("width", 55 + 32 * b));
    }
    function e() {
      var a = C(this).index();
      Q.tab = a;
      J.loadFile(
        z.INTERFACE_PATH + "basic_interface/tab_itm_ex_0" + (a + 1) + ".bmp",
        function (a) {
          L.ui.find(".tabs").css("backgroundImage", 'url("' + a + '")');
          k();
        },
      );
    }
    function m() {
      var a = L.ui.find(".MainWindow .secondline .searchtext").val();
      L.ui
        .find('.SecondaryWindow[data-index\x3d"8"] .container .content')
        .empty();
      for (var b = 0, c = y.length; b < c; ++b) L.addItemSubSearch(y[b], a);
      L.ui.find('.SecondaryWindow[data-index\x3d"8"]').is(":visible") || q(8);
      L.ui.find(".MainWindow .secondline .searchtext").val("");
    }
    function h() {
      var a = parseInt(this.getAttribute("data-index"), 10);
      q(a);
    }
    function q(a) {
      var b = "",
        c = L.ui.find('.SecondaryWindow[data-index\x3d"' + a + '"]');
      Q.tabsOpened[a] = !c.is(":visible");
      Q.tabsOpened[a]
        ? (N.push(a), c.show())
        : (-1 < N.indexOf(a) && N.splice(N.indexOf(a), 1), c.hide());
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
        J.loadFile(
          z.INTERFACE_PATH +
            "basic_interface/" +
            b +
            "-" +
            (Q.tabsOpened[a] ? "1" : "2") +
            ".bmp",
          function (b) {
            L.ui
              .find(
                '.MainWindow .footer .firstline button[data-index\x3d"' +
                  a +
                  '"]',
              )
              .css("backgroundImage", 'url("' + b + '")');
          },
        );
    }
    function r(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (S) {}
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
              L.reqAddItem1(b.index, parseInt(a, 10));
            }),
            !1
          );
        L.reqAddItem1(b.index, 1);
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
              L.reqAddItem(b.index, parseInt(a, 10));
            }),
            !1
          );
        L.reqAddItem(b.index, 1);
        return !1;
      }
    }
    function k() {
      L.ui.find(".container .content").empty();
      var a,
        b,
        c = y.slice(0);
      L.ORDER.RISE === Q.order
        ? c.sort(function (a, b) {
            return C.escape(z.getItemName(a)).localeCompare(
              C.escape(z.getItemName(b)),
            );
          })
        : L.ORDER.FALL === Q.order &&
          c.sort(function (a, b) {
            return C.escape(z.getItemName(b)).localeCompare(
              C.escape(z.getItemName(a)),
            );
          });
      a = 0;
      for (b = c.length; a < b; ++a) L.addItemSub(c[a]);
    }
    function g(a) {
      var b, c;
      b = 0;
      for (c = y.length; b < c; ++b) if (y[b].index === a) return b;
      return -1;
    }
    function u(a) {
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
        var a = y[a],
          b = C(this).position(),
          c = C(this).parents().eq(4).find(".overlay");
        c.show();
        c.css({ top: b.top - 10, left: b.left + 30 });
        c.text(z.getItemName(a) + " " + (a.count || 1) + " \u4e2a");
        a.IsIdentified ? c.removeClass("grey") : c.addClass("grey");
      }
    }
    function f() {
      L.ui.find(".overlay").hide();
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
            (window._OBJ_DRAG_ = { type: "item", from: "Storage", data: y[b] }),
          ),
        );
        f();
      }
    }
    function p() {
      delete window._OBJ_DRAG_;
    }
    function v() {
      var a = C(this).val();
      Q.order =
        "Rise" == a ? L.ORDER.RISE : "Fall" == a ? L.ORDER.FALL : L.ORDER.BASIC;
      k();
    }
    function t(a) {
      a.stopImmediatePropagation();
      a = parseInt(this.getAttribute("data-index"), 10);
      a = g(a);
      if (-1 === a) return !1;
      I.uid === y[a].ITID && I.remove();
      I.append();
      I.uid = y[a].ITID;
      I.setItem(y[a]);
      return !1;
    }
    var z = a("DB/DBManager"),
      E = a("Controls/KeyEventHandler"),
      C = a("Utils/jquery"),
      J = a("Core/Client"),
      A = a("Core/Preferences"),
      B = a("Renderer/Renderer"),
      F = a("Controls/MouseEventHandler"),
      O = a("Preferences/Controls"),
      M = a("UI/UIManager"),
      H = a("UI/UIComponent"),
      x = a("UI/Components/InputBox/InputBox"),
      I = a("UI/Components/ItemInfo/ItemInfo"),
      D = a("text!./Storage.html");
    a = a("text!./Storage.css");
    var L = new H("Storage", D, a);
    L.ITEM = {
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
    L.TAB = { ITEM: 0, CASH: 1, ARMOR: 2, WEAPON: 3, AMMO: 4, CARD: 5, ETC: 6 };
    L.ORDER = { BASIC: 0, RISE: 1, FALL: 2 };
    var y = [],
      G = Array(8).fill(3, 0, 8),
      K = Array(8).fill(1, 0, 8),
      N = [],
      Q = A.get(
        "Storage",
        {
          x: 0,
          y: 0,
          height: 6,
          order: L.ORDER.BASIC,
          tab: L.TAB.ITEM,
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
    L.init = function () {
      var a = this.ui.find(".MainWindow"),
        g = this.ui.find(".SecondaryWindow");
      this.ui.find(".tabs button").mousedown(e);
      this.ui.find(".footer .close").click(this.onClosePressed.bind(this));
      a.find(".titlebar .close").click(this.onClosePressed.bind(this));
      g.find(".titlebar .close").on("click", function () {
        C(".searchsf").hide();
      });
      a.find(".footer .firstline button").click(h);
      a.find(".footer .secondline .search").click(m);
      J.loadFile(
        z.INTERFACE_PATH +
          "basic_interface/tab_itm_ex_0" +
          (Q.tab + 1) +
          ".bmp",
        function (a) {
          L.ui.find(".tabs").css("backgroundImage", 'url("' + a + '")');
        },
      );
      this.ui
        .on("drop", r)
        .on("dragover", b)
        .find(".container .content")
        .on("mousewheel DOMMouseScroll", u)
        .on("mouseover", ".item", l)
        .on("mouseout", ".item", f)
        .on("dragstart", ".item", n)
        .on("dragend", ".item", p)
        .on("contextmenu", ".item", t);
      this.ui.find("select").change(v);
      for (var k = {}, q = -1; q < g.length; k = { _main: k._main }, q++) {
        k._main = void 0;
        var T,
          x = 0,
          R = 0,
          N = 0;
        -1 == q
          ? ((k._main = a), (T = Q.height), (R = Q.x), (N = Q.y))
          : ((k._main = C(g[q])),
            (T = G[q]),
            (x = K[q]),
            void 0 !== Q.tabsPositions[q] &&
              ((R = Q.tabsPositions[q].x), (N = Q.tabsPositions[q].y)));
        this.draggable.call({ ui: k._main }, k._main.find(".titlebar"));
        k._main.find(".footer .extend").mousedown(
          (function (a) {
            return function () {
              c(a._main);
            };
          })(k),
        );
        d(T, x, q);
        k._main.css({
          top: Math.min(Math.max(0, N), (B.height - k._main.height()) / 2),
          left: Math.min(Math.max(0, R), B.width - k._main.width()),
        });
      }
    };
    L.onAppend = function () {
      O.talk = !0;
      var a = C._data(window, "events").keydown;
      a.unshift(a.pop());
    };
    L.onKeyDown = function (a) {
      return a.which === E.ESCAPE
        ? (0 < N.length && (q(N[N.length - 1]), a.stopImmediatePropagation()),
          !1)
        : !0;
    };
    L.onRemove = function () {
      O.talk = !1;
      this.ui.find(".container .content").empty();
      y.length = 0;
      Q.y = parseInt(this.ui.css("top"), 10);
      Q.x = parseInt(this.ui.css("left"), 10);
      Q.height = Math.floor((this.ui.height() - 20) / 32);
      Q.save();
    };
    L.setItems = function (a) {
      var b, c;
      b = 0;
      for (c = a.length; b < c; ++b) this.addItemSub(a[b]) && y.push(a[b]);
    };
    L.addItem = function (a) {
      var b = g(a.index);
      -1 < b
        ? ((y[b].count += a.count),
          this.ui
            .find('.item[data-index\x3d"' + a.index + '"] .count')
            .text(y[b].count))
        : this.addItemSub(a) && y.push(a);
    };
    L.addItemSub = function (a) {
      var b;
      switch (a.type) {
        case L.ITEM.HEALING:
        case L.ITEM.USABLE:
        case L.ITEM.USABLE_SKILL:
        case L.ITEM.USABLE_SKILL_UNK:
          b = L.TAB.ITEM;
          break;
        case L.ITEM.USABLE_UNK:
          b = L.TAB.CASH;
          break;
        case L.ITEM.EQUIP:
        case L.ITEM.PETEQUIP:
          b = L.TAB.ARMOR;
          break;
        case L.ITEM.WEAPON:
          b = L.TAB.WEAPON;
          break;
        case L.ITEM.AMMO:
          b = L.TAB.AMMO;
          break;
        case L.ITEM.CARD:
          b = L.TAB.CARD;
          break;
        default:
        case L.ITEM.ETC:
        case L.ITEM.PETEGG:
          b = L.TAB.ETC;
      }
      var c = z.getItemInfo(a.ITID),
        d =
          '\x3cdiv class\x3d"item" data-index\x3d"' +
          a.index +
          '" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
          (a.count
            ? '\x3cspan class\x3d"count"\x3e' + a.count + "\x3c/span\x3e "
            : "") +
          '\x3c/div\x3e\x3cspan class\x3d"name"\x3e' +
          C.escape(z.getItemName(a)) +
          "\x3c/span\x3e\x3c/div\x3e";
      b === Q.tab && L.ui.find(".MainWindow .container .content").append(d);
      L.ui
        .find('.SecondaryWindow[data-index\x3d"' + b + '"] .container .content')
        .append(d);
      J.loadFile(
        z.INTERFACE_PATH +
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
    L.addItemSubSearch = function (a, b) {
      var c = z.getItemInfo(a.ITID);
      C.escape(z.getItemName(a)).toLowerCase().includes(b.toLowerCase()) &&
        ((b =
          '\x3cdiv class\x3d"item" data-index\x3d"' +
          a.index +
          '" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
          (a.count
            ? '\x3cspan class\x3d"count"\x3e' + a.count + "\x3c/span\x3e "
            : "") +
          '\x3c/div\x3e\x3cspan class\x3d"name"\x3e' +
          C.escape(z.getItemName(a)) +
          "\x3c/span\x3e\x3c/div\x3e"),
        L.ui
          .find('.SecondaryWindow[data-index\x3d"8"] .container .content')
          .append(b),
        J.loadFile(
          z.INTERFACE_PATH +
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
    L.removeItem = function (a, b) {
      var c = g(a);
      if (0 > c) return null;
      if (y[c].count && ((y[c].count -= b), 0 < y[c].count))
        return (
          this.ui
            .find('.item[data-index\x3d"' + a + '"] .count')
            .text(y[c].count),
          y[c]
        );
      b = y[c];
      y.splice(c, 1);
      this.ui.find('.item[data-index\x3d"' + a + '"]').remove();
      return b;
    };
    L.setItemInfo = function (a, b) {
      this.ui.find(".footer .current").text(a);
      this.ui.find(".footer .limit").text(b);
    };
    L.onClosePressed = function () {};
    L.reqAddItem = function () {};
    L.reqRemoveItem = function () {};
    return M.addComponent(L);
  },
);
