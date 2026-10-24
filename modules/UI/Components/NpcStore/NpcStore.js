define(
  "UI/Components/NpcStore/NpcStore",
  "require Utils/jquery DB/DBManager DB/Items/ItemType Core/Client Core/Preferences Engine/SessionStorage Controls/MouseEventHandler Controls/KeyEventHandler Preferences/Controls UI/UIManager UI/UIComponent UI/Components/ItemInfo/ItemInfo UI/Components/InputBox/InputBox UI/Components/ChatBox/ChatBox UI/Components/Inventory/Inventory text!./NpcStore.html text!./NpcStore.css".split(
    " ",
  ),
  function (a) {
    function b(a, b) {
      a = a.toString().split("");
      var c,
        d = a.length,
        e = "";
      for (c = 0; c < d; c++)
        e = a[d - c - 1] + (c && 0 === c % 3 ? "," : "") + e;
      b &&
        (e =
          '\x3cspan style\x3d"' +
          "color:#000000; text-shadow:1px 0px #00ffff;,color:#0000ff; text-shadow:1px 0px #ce00ce;,color:#0000ff; text-shadow:1px 0px #00ffff;,color:#ff0000; text-shadow:1px 0px #ffff00;,color:#ff18ff;,color:#0000ff;,color:#000000; text-shadow:1px 0px #00ff00;,color:#ff0000;,color:#000000; text-shadow:1px 0px #cece63;,color:#ff0000; text-shadow:1px 0px #ff007b;".split(
            ",",
          )[d - 1] +
          '"\x3e' +
          e +
          "\x3c/span\x3e");
      return e;
    }
    function c(a, c, d) {
      var e = A.getItemInfo(c.ITID),
        f = a.find(".item[data-index\x3d" + c.index + "]:first");
      0 === c.count
        ? f.length && f.remove()
        : f.length
          ? f.find(".amount").text(isFinite(c.count) ? c.count : "")
          : ((f = b(c.price, S === H.Type.VENDING_STORE)),
            0 == R &&
              ("discountprice" in c && c.price !== c.discountprice
                ? (f += " -\x3e " + b(c.discountprice))
                : "overchargeprice" in c &&
                  c.price !== c.overchargeprice &&
                  (f += " -\x3e " + b(c.overchargeprice))),
            3 == d
              ? a.append(
                  '\x3cdiv class\x3d"item" draggable\x3d"true" data-index\x3d"' +
                    c.index +
                    '" data-itid\x3d"' +
                    c.ITID +
                    '" \x3e\x3cdiv class\x3d"icon"\x3e\x3cdiv class\x3d"amount"\x3e' +
                    (isFinite(c.count) ? c.count : "") +
                    ' \u4e2a\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e' +
                    u.escape(A.getItemName(c)) +
                    '\x3c/div\x3e\x3cdiv class\x3d"price"\x3e' +
                    f +
                    '\x3c/div\x3e\x3cdiv class\x3d"unity"\x3e' +
                    (0 === R ? "Z" : 1 === R ? "J" : 2 === R ? "C" : "Z") +
                    "\x3c/div\x3e\x3c/div\x3e",
                )
              : a.append(
                  '\x3cdiv class\x3d"item" draggable\x3d"true" data-index\x3d"' +
                    c.index +
                    '" data-itid\x3d"' +
                    c.ITID +
                    '" \x3e\x3cdiv class\x3d"icon"\x3e\x3cdiv class\x3d"amount"\x3e' +
                    (isFinite(c.count) ? c.count : "") +
                    '\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e' +
                    u.escape(A.getItemName(c)) +
                    '\x3c/div\x3e\x3cdiv class\x3d"price"\x3e' +
                    f +
                    '\x3c/div\x3e\x3cdiv class\x3d"unity"\x3e' +
                    (0 === R ? "Z" : 1 === R ? "J" : 2 === R ? "C" : "Z") +
                    "\x3c/div\x3e\x3c/div\x3e",
                ),
            B.loadFile(
              A.INTERFACE_PATH +
                "item/" +
                (c.IsIdentified
                  ? e.identifiedResourceName
                  : e.unidentifiedResourceName) +
                ".bmp",
              function (b) {
                a.find('.item[data-index\x3d"' + c.index + '"] .icon').css(
                  "backgroundImage",
                  "url(" + b + ")",
                );
              },
            ));
    }
    function d(a, b) {
      var c = A.getItemInfo(b.ITID),
        d = a.find(".item[data-index\x3d" + b.index + "]:first");
      0 === b.count
        ? d.length && d.remove()
        : d.length
          ? d.find(".amount").text(isFinite(b.count) ? b.count : "")
          : (a.append(
              '\x3cdiv class\x3d"item" data-index\x3d"' +
                b.index +
                '"  data-itid\x3d"' +
                b.ITID +
                '" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3cspan class\x3d"count"\x3e' +
                (b.count || 1) +
                "\x3c/span\x3e\x3c/div\x3e\x3c/div\x3e",
            ),
            B.loadFile(
              A.INTERFACE_PATH +
                "item/" +
                (b.IsIdentified
                  ? c.identifiedResourceName
                  : c.unidentifiedResourceName) +
                ".bmp",
              function (c) {
                a.find('.item[data-index\x3d"' + b.index + '"] .icon').css(
                  "backgroundImage",
                  "url(" + c + ")",
                );
              },
            ));
    }
    function e(a, b, c) {
      c = A.getItemInfo(b.ITID);
      F.getItemById(b.ITID);
      var d = a.find(".item[data-index\x3d" + b.index + "]:first");
      if (0 === b.count) d.length && d.remove();
      else if (!d.length) {
        var e = A.getItemInfo(b.currencyNameid),
          d = b.currencyAmount;
        a.append(
          '\x3cdiv class\x3d"item" draggable\x3d"true" data-index\x3d"' +
            b.index +
            '" data-itid\x3d"' +
            b.ITID +
            '" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
            (isFinite(b.count) ? b.count : "") +
            '\x3c/div\x3e\x3cdiv class\x3d"name"\x3e' +
            u.escape(A.getItemName(b)) +
            '\x3c/div\x3e\x3cdiv class\x3d"nicon" data-itid\x3d"' +
            b.currencyNameid +
            '"\x3e\x3c/div\x3e\x3cdiv class\x3d"price"\x3e' +
            d +
            "\x3c/div\x3e\x3c/div\x3e",
        );
        B.loadFile(
          A.INTERFACE_PATH +
            "item/" +
            (b.IsIdentified
              ? c.identifiedResourceName
              : c.unidentifiedResourceName) +
            ".bmp",
          function (c) {
            a.find('.item[data-index\x3d"' + b.index + '"] .icon').css(
              "backgroundImage",
              "url(" + c + ")",
            );
          },
        );
        B.loadFile(
          A.INTERFACE_PATH + "item/" + e.identifiedResourceName + ".bmp",
          function (c) {
            a.find('.item[data-index\x3d"' + b.index + '"] .nicon').css(
              "backgroundImage",
              "url(" + c + ")",
            );
          },
        );
      }
    }
    function m(a, b, c) {
      c = A.getItemInfo(b.ITID);
      F.getItemById(b.ITID);
      var d = a.find(".item[data-index\x3d" + b.index + "]:first");
      if (0 === b.count) d.length && d.remove();
      else if (!d.length) {
        var d = b.price,
          e = u(
            '\x3cdiv class\x3d"item market" draggable\x3d"true" data-index\x3d"' +
              b.index +
              '" data-itid\x3d"' +
              b.ITID +
              '" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
              (isFinite(b.count) ? b.count : "") +
              '\x3c/div\x3e\x3cdiv class\x3d"name"\x3e' +
              u.escape(A.getItemName(b)) +
              '\x3cdiv class\x3d"nitem"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"price"\x3e' +
              d +
              '\x3c/div\x3e\x3cdiv class\x3d"unity"\x3e' +
              (0 === R ? "Z" : 1 === R ? "J" : 2 === R ? "C" : "Z") +
              "\x3c/div\x3e\x3c/div\x3e",
          );
        B.loadFile(
          A.INTERFACE_PATH +
            "item/" +
            (b.IsIdentified
              ? c.identifiedResourceName
              : c.unidentifiedResourceName) +
            ".bmp",
          function (a) {
            e.find(".icon:first").css("backgroundImage", "url(" + a + ")");
          },
        );
        for (c = 0; c < b.currency_count; c++) {
          var d = b.currency_itemList[c],
            f = A.getItemInfo(d.ITID);
          e.find(".nitem").append(
            '\x3cdiv class\x3d"item" data-itid\x3d"' +
              d.ITID +
              '" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
              d.amount +
              " \x3c/div\x3e\x3c/div\x3e",
          );
          h(e, d, f);
        }
        a.append(e);
      }
    }
    function h(a, b, c) {
      B.loadFile(
        A.INTERFACE_PATH + "item/" + c.identifiedResourceName + ".bmp",
        function (c) {
          a.find('.item[data-itid\x3d"' + b.ITID + '"] .icon').css(
            "backgroundImage",
            "url(" + c + ")",
          );
        },
      );
    }
    function r(a, b) {
      b = Math.min(Math.max(b, 2), 9);
      a.css("height", 32 * b);
    }
    function q(a) {
      var b = a.position().top,
        c = a.find(".content:first"),
        d = 0,
        e;
      e = setInterval(function () {
        var a = Math.floor((y.screen.y - b - 20) / 32),
          a = Math.min(Math.max(a, 2), 9);
        a !== d && (r(c, a), (d = a));
      }, 30);
      u(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(e), u(window).off("mouseup.resize"));
      });
    }
    function k(a, b, c, d) {
      var e, f, g;
      e = d ? P[a] : N[a];
      g =
        e.type !== D.WEAPON &&
        e.type !== D.EQUIP &&
        e.type !== D.PETEGG &&
        e.type !== D.PETEQUIP;
      f = d ? (isFinite(P[a].count) ? P[a].count : 1) : N[a].count;
      if (
        (S === H.Type.BUY || S === H.Type.VENDING_STORE) &&
        !g &&
        d &&
        c.find('.item[data-index\x3d"' + e.index + '"]:first').length
      )
        return !1;
      if (
        1 === e.count ||
        (S === H.Type.SELL && K.select_all) ||
        (S === H.Type.BUYING_STORE && K.select_all) ||
        !g
      )
        return (ea(b, c, d, a, isFinite(e.count) ? e.count : 1), !1);
      M.append();
      M.setType("number", !1, f);
      M.onSubmitRequest = function (e) {
        M.remove();
        0 < e && ea(b, c, d, a, e);
      };
    }
    function g(a) {
      var b;
      a.stopImmediatePropagation();
      try {
        b = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (ca) {
        return !1;
      }
      if (
        "item" !== b.type ||
        "NpcStore" !== b.from ||
        b.container === this.className
      )
        return !1;
      3 == S
        ? k(
            b.index,
            u("." + b.container + " .content"),
            u(this).find(".content"),
            "OutputWindow2" === this.className,
          )
        : k(
            b.index,
            u("." + b.container + " .content"),
            u(this).find(".content"),
            "OutputWindow" === this.className,
          );
      return !1;
    }
    function t(a) {
      var b = parseInt(this.getAttribute("data-index"), 10),
        c = parseInt(this.getAttribute("data-ITID"), 10);
      (b = P[b]) || (b = { ITID: c, IsIdentified: !0 });
      a.stopImmediatePropagation();
      if (!b) return !1;
      if (x.uid === b.ITID) return (x.remove(), !1);
      x.append();
      x.uid = b.ITID;
      x.setItem(b);
      return !1;
    }
    function l() {
      var a, b, c;
      S !== H.Type.BUY &&
        S !== H.Type.VENDING_STORE &&
        ((a = H.ui.find(".InputWindow:first")),
        u.contains(a.get(0), this)
          ? ((b = a), (c = H.ui.find(".OutputWindow:first")))
          : ((b = H.ui.find(".OutputWindow:first")), (c = a)),
        k(
          parseInt(this.getAttribute("data-index"), 10),
          b.find(".content:first"),
          c.find(".content:first"),
          b === a,
        ));
    }
    function f() {
      H.ui.find(".item.selected").removeClass("selected");
      u(this).addClass("selected");
    }
    function n(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      this.scrollTop = 32 * Math.floor(this.scrollTop / 32) - 32 * b;
      return !1;
    }
    function p(a) {
      var b, c, d, e;
      b = H.ui.find(".InputWindow:first").get(0);
      c = H.ui.find(".OutputWindow:first").get(0);
      d = H.ui.find(".InputWindow2:first").get(0);
      e = H.ui.find(".OutputWindow2:first").get(0);
      b =
        3 == S
          ? (u.contains(d, this) ? d : e).className
          : (u.contains(b, this) ? b : c).className;
      c = new Image();
      d = this.firstChild.style.backgroundImage
        .match(/\(([^\)]+)/)[1]
        .replace(/"/g, "");
      c.src = d;
      a.originalEvent.dataTransfer.setDragImage(c, 12, 12);
      a.originalEvent.dataTransfer.setData(
        "Text",
        JSON.stringify(
          (window._OBJ_DRAG_ = {
            type: "item",
            from: "NpcStore",
            container: b,
            index: this.getAttribute("data-index"),
          }),
        ),
      );
    }
    function v() {
      K.select_all = !K.select_all;
      K.save();
      B.loadFile(
        A.INTERFACE_PATH + "checkbox_" + (K.select_all ? 1 : 0) + ".bmp",
        function (a) {
          this.style.backgroundImage = "url(" + a + ")";
        }.bind(this),
      );
    }
    var u = a("Utils/jquery"),
      A = a("DB/DBManager"),
      D = a("DB/Items/ItemType"),
      B = a("Core/Client"),
      O = a("Core/Preferences"),
      C = a("Engine/SessionStorage"),
      y = a("Controls/MouseEventHandler"),
      z = a("Controls/KeyEventHandler"),
      J = a("Preferences/Controls"),
      I = a("UI/UIManager"),
      L = a("UI/UIComponent"),
      x = a("UI/Components/ItemInfo/ItemInfo"),
      M = a("UI/Components/InputBox/InputBox"),
      E = a("UI/Components/ChatBox/ChatBox"),
      F = a("UI/Components/Inventory/Inventory"),
      G = a("text!./NpcStore.html");
    a = a("text!./NpcStore.css");
    var H = new L("NpcStore", G, a);
    H.Type = {
      BUY: 0,
      SELL: 1,
      VENDING_STORE: 2,
      BUYING_STORE: 3,
      BARTER_BUY: 4,
      BARTER_MARKET_BUY: 5,
    };
    H.mouseMode = L.MouseMode.FREEZE;
    var K = O.get(
        "NpcStore",
        {
          inputWindow: { x: 40, y: 100, height: 7 },
          outputWindow: { x: 330, y: 260, height: 2 },
          ViewWindow: { x: 50, y: 55, height: 3 },
          inputWindow2: { x: 50, y: 210, height: 2 },
          outputWindow2: { x: 50, y: 334, height: 2 },
          select_all: !1,
        },
        1.12,
      ),
      P = [],
      N = [],
      S;
    H.init = function () {
      var a = this.ui,
        b = a.find(".InputWindow"),
        c = a.find(".InputWindow2"),
        d = a.find(".OutputWindow"),
        e = a.find(".OutputWindow2"),
        h = this.ui.find(".ViewWindow");
      a.find(".btn.cancel").click(function () {
        H.onSubmit([]);
        H.remove();
      });
      a.find(".btn.buy, .btn.sell").click(this.submit.bind(this));
      a.find(".selectall").mousedown(v);
      a.mousedown(function () {
        event.stopImmediatePropagation();
      });
      b.find(".resize").mousedown(function () {
        q(b);
      });
      d.find(".resize").mousedown(function () {
        q(d);
      });
      a.find(".content")
        .on("mousewheel DOMMouseScroll", n)
        .on("contextmenu", ".item", t)
        .on("dblclick", ".item", l)
        .on("mousedown", ".item", f)
        .on("contextmenu", ".item .nicon", t)
        .on("dragstart", ".item", p)
        .on("dragend", ".item", function () {
          delete window._OBJ_DRAG_;
        });
      a.find(".InputWindow, .OutputWindow,.InputWindow2, .OutputWindow2")
        .on("drop", g)
        .on("dragover", function (a) {
          a.stopImmediatePropagation();
          return !1;
        })
        .on("mousedown", function () {
          H.focus();
        });
      this.draggable.call({ ui: h }, h.find(".titlebar"));
      this.draggable.call({ ui: b }, b.find(".titlebar"));
      this.draggable.call({ ui: c }, c.find(".titlebar"));
      this.draggable.call({ ui: e }, e.find(".titlebar"));
      this.draggable.call({ ui: d }, d.find(".titlebar"));
    };
    H.onAppend = function () {
      J.talk = !0;
      var a = this.ui.find(".ViewWindow"),
        b = this.ui.find(".InputWindow"),
        c = this.ui.find(".OutputWindow"),
        d = this.ui.find(".InputWindow2"),
        e = this.ui.find(".OutputWindow2");
      B.loadFile(
        A.INTERFACE_PATH + "checkbox_" + (K.select_all ? 1 : 0) + ".bmp",
        function (a) {
          this.ui
            .find(".selectall:first")
            .css("backgroundImage", "url(" + a + ")");
        }.bind(this),
      );
      r(a.find(".content"), K.ViewWindow.height);
      r(b.find(".content"), K.inputWindow.height);
      r(c.find(".content"), K.outputWindow.height);
      r(d.find(".content"), K.inputWindow2.height);
      r(e.find(".content"), K.outputWindow2.height);
      a = u._data(window, "events").keydown;
      a.unshift(a.pop());
    };
    H.onRemove = function () {
      J.talk = !1;
      var a = this.ui.find(".InputWindow"),
        b = this.ui.find(".OutputWindow"),
        c = this.ui.find(".InputWindow2"),
        d = this.ui.find(".OutputWindow2"),
        e = this.ui.find(".ViewWindow");
      P.length = 0;
      R = N.length = 0;
      e.css({ top: "", left: "" });
      a.css({ top: "", left: "" });
      b.css({ top: "", left: "" });
      c.css({ top: "", left: "" });
      d.css({ top: "", left: "" });
      this.ui.find(".content").empty();
      this.ui.find(".total .result").text(0);
      this.ui
        .find(
          ".ViewWindow,.InputWindow, .OutputWindow, .InputWindow2, .OutputWindow2",
        )
        .hide();
    };
    H.onKeyDown = function (a) {
      return a.which === z.ESCAPE
        ? (this.remove(), a.stopImmediatePropagation(), !1)
        : !0;
    };
    H.setType = function (a) {
      switch (a) {
        case H.Type.BUY:
        case H.Type.BARTER_BUY:
        case H.Type.BARTER_MARKET_BUY:
          this.ui.find(".WinSell, .WinVendingStore").hide();
          this.ui.find(".WinBuy").show();
          this.ui.find(".InputWindow, .OutputWindow").show();
          break;
        case H.Type.SELL:
          this.ui.find(".WinBuy, .WinVendingStore").hide();
          this.ui.find(".WinSell").show();
          this.ui.find(".InputWindow, .OutputWindow").show();
          break;
        case H.Type.VENDING_STORE:
          this.ui.find(".WinVendingStore, .WinSell").hide();
          this.ui.find(".WinBuy").show();
          this.ui.find(".InputWindow, .OutputWindow").show();
          break;
        case H.Type.BUYING_STORE:
          (this.ui.find(".WinBuy, .WinSell").hide(),
            this.ui.find(".WinSell").show(),
            this.ui.find(".ViewWindow,.InputWindow2,.OutputWindow2").show());
      }
      S = a;
    };
    var R = 0;
    H.setType_ = function (a) {
      R = a;
    };
    H.setList = function (a) {
      var b, f, g, h, k, l, n;
      this.ui.find(".content").empty();
      this.ui.find(".total .result").text(0);
      P.length = 0;
      N.length = 0;
      k = this.ui.find(".InputWindow .content");
      l = this.ui.find(".ViewWindow .content");
      n = this.ui.find(".InputWindow2 .content");
      switch (S) {
        case H.Type.BUY:
          b = 0;
          for (f = a.length; b < f; ++b)
            ("index" in a[b] || (a[b].index = b),
              (a[b].count = a[b].count || Infinity),
              (a[b].IsIdentified = !0),
              (h = u.extend({}, a[b])),
              (h.count = 0),
              c(k, a[b]),
              (P[a[b].index] = a[b]),
              (N[a[b].index] = h));
          break;
        case H.Type.VENDING_STORE:
          b = 0;
          for (f = a.length; b < f; ++b)
            ("index" in a[b] || (a[b].index = b),
              (a[b].count = a[b].count || Infinity),
              (a[b].IsIdentified = !0),
              (h = u.extend({}, a[b])),
              (h.count = 0),
              c(k, a[b]),
              (P[a[b].index] = a[b]),
              (N[a[b].index] = h));
          break;
        case H.Type.SELL:
          b = 0;
          for (f = a.length; b < f; ++b)
            if ((g = F.getItemByIndex(a[b].index)))
              ((g = u.extend({}, g)),
                (g.price = a[b].price),
                (g.overchargeprice = a[b].overchargeprice),
                (g.count = "count" in g ? g.count : 1),
                (h = u.extend({}, g)),
                (h.count = 0),
                c(k, g),
                (P[g.index] = g),
                (N[g.index] = h));
          break;
        case H.Type.BUYING_STORE:
          b = 0;
          for (f = a.length; b < f; ++b)
            ((g = F.getItemById(a[b].ITID)),
              "index" in a[b] || (a[b].index = b),
              c(l, a[b], S),
              g &&
                ((a[b].index = g.index),
                (h = u.extend({}, a[b])),
                (h.count = 0),
                d(n, g),
                (P[a[b].index] = g),
                (N[a[b].index] = h)));
          break;
        case H.Type.BARTER_BUY:
          b = 0;
          for (f = a.length; b < f; ++b)
            ("index" in a[b] || (a[b].index = b),
              (a[b].count = a[b].count || Infinity),
              (a[b].IsIdentified = !0),
              (h = F.getItemById(a[b].currencyNameid)),
              (a[b].invIndex = h ? h.index : -1),
              (h = u.extend({}, a[b])),
              (h.count = 0),
              e(k, a[b]),
              (P[a[b].index] = a[b]),
              (N[a[b].index] = h));
          break;
        case H.Type.BARTER_MARKET_BUY:
          for (b = 0, f = a.length; b < f; ++b)
            ("index" in a[b] || (a[b].index = b),
              (a[b].count = a[b].count || Infinity),
              (a[b].IsIdentified = !0),
              (h = u.extend({}, a[b])),
              (h.count = 0),
              m(k, a[b]),
              (P[a[b].index] = a[b]),
              (N[a[b].index] = h));
      }
    };
    H.submit = function () {
      var a, b, c;
      a = [];
      c = N.length;
      for (b = 0; b < c; ++b) N[b] && N[b].count && a.push(N[b]);
      H.onSubmit(a);
    };
    H.calculateCost = function () {
      var a, b, c;
      c = 0;
      b = N.length;
      for (a = 0; a < b; ++a)
        N[a] &&
          (c =
            4 == S
              ? c + N[a].currencyAmount * N[a].count
              : c +
                (N[a].discountprice || N[a].overchargeprice || N[a].price) *
                  N[a].count);
      this.ui.find(".total .result").text(c);
      switch (R) {
        case 0:
          4 == S
            ? this.ui.find(".total .unity").text("")
            : this.ui.find(".total .unity").text("Zeny");
          break;
        case 1:
          this.ui.find(".total .unity").text("J");
          break;
        case 2:
          this.ui.find(".total .unity").text("Cash");
      }
      return c;
    };
    H.calculateCost_ = function () {
      var a, b, c;
      c = 0;
      b = N.length;
      for (a = 0; a < b; ++a)
        N[a] && (c += (N[a].overchargeprice || N[a].price) * N[a].count);
      this.ui.find(".total .result").text(c);
      return c;
    };
    var ea = (function () {
      var a = { ITID: 0, count: 0, price: 0, index: 0 };
      return function (b, f, g, h, k) {
        if (g) {
          if (
            ((0 == R && S === H.Type.BUY) || S === H.Type.VENDING_STORE) &&
            H.calculateCost() + (P[h].discountprice || P[h].price) * k > C.zeny
          ) {
            E.addText(A.getMessage(55), E.TYPE.ERROR);
            return;
          }
          N[h].count = Math.min(N[h].count + k, P[h].count);
          a.ITID = P[h].ITID;
          a.count = P[h].count - N[h].count;
          a.price = P[h].price;
          a.index = P[h].index;
          a.IsIdentified = P[h].IsIdentified;
          4 == S
            ? (e(b, a), e(f, N[h]))
            : (5 == S ? m(b, a) : c(b, a), c(f, N[h]));
        } else {
          k = Math.min(k, N[h].count);
          if (!k) return;
          N[h].count -= k;
          a.ITID = P[h].ITID;
          a.count = P[h].count + N[h].count;
          a.price = P[h].price;
          a.index = P[h].index;
          a.IsIdentified = P[h].IsIdentified;
          3 == S
            ? (d(b, N[h]), d(f, a))
            : 5 == S
              ? (m(b, N[h]), m(f, a))
              : (c(b, N[h]), c(f, a));
        }
        0 == R ? H.calculateCost() : H.calculateCost_();
      };
    })();
    H.onSubmit = function () {};
    return I.addComponent(H);
  },
);
