define(
  "UI/Components/PlayerStore/PlayerStore",
  "require Utils/jquery DB/DBManager DB/Items/ItemType Core/Client Core/Preferences Engine/SessionStorage Controls/MouseEventHandler Controls/KeyEventHandler UI/UIManager UI/UIComponent UI/Components/ItemInfo/ItemInfo UI/Components/InputBox/InputBox UI/Components/ChatBox/ChatBox UI/Components/Inventory/Inventory UI/Components/OnPushCart/OnPushCart text!./PlayerStore.html text!./PlayerStore.css".split(
    " ",
  ),
  function (a) {
    function b(a, b) {
      var c = q.getItemInfo(b.ITID),
        d = a.find(".item[data-index\x3d" + b.index + "]:first");
      0 === b.count
        ? d.length && d.remove()
        : d.length
          ? d.find(".amount").text(isFinite(b.count) ? b.count : "")
          : (a.append(
              '\x3cdiv class\x3d"item" draggable\x3d"true" data-index\x3d"' +
                b.index +
                '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
                (isFinite(b.count) ? b.count : "1") +
                "\x3c/div\x3e\x3c/div\x3e",
            ),
            v.loadFile(
              q.INTERFACE_PATH +
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
    function c(a, b) {
      var c = q.getItemInfo(b.ITID),
        d = a.find(".item[data-index\x3d" + b.index + "]:first");
      0 === b.count
        ? d.length && d.remove()
        : d.length
          ? d.find(".amount").text(isFinite(b.count) ? b.count : "")
          : ((d = m("#PlayerStore .OutputWindow .item").eq(y)),
            d.attr("data-index", b.index),
            d.find(".amount").html(isFinite(b.count) ? b.count : "1"),
            d.find(".name").html(m.escape(q.getItemName(b))),
            v.loadFile(
              q.INTERFACE_PATH +
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
            ),
            y++);
    }
    function d(a, b) {
      b = Math.min(Math.max(b, 2), 9);
      a.css("height", 32 * b);
    }
    function e(a) {
      var b = a.position().top,
        c = a.find(".content:first"),
        e = 0,
        f;
      f = setInterval(function () {
        var a = Math.floor((A.screen.y - b - 20) / 32),
          a = Math.min(Math.max(a, 2), 9);
        a !== e && (d(c, a), (e = a));
      }, 30);
      m(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(f), m(window).off("mouseup.resize"));
      });
    }
    function l(a, b, c, d) {
      var e;
      e = d ? (isFinite(J[a].count) ? J[a].count : 1) : E[a].count;
      1 < e
        ? (z.append(),
          z.setType("number", !1, e),
          (z.onSubmitRequest = function (e) {
            z.remove();
            0 < e && F(b, c, d, a, e);
          }))
        : F(b, c, d, a, e);
    }
    function h(a) {
      var b;
      a.stopImmediatePropagation();
      try {
        b = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (Q) {
        return !1;
      }
      if (
        "item" !== b.type ||
        "PlayerStore" !== b.from ||
        b.container === this.className
      )
        return !1;
      l(
        b.index,
        m("." + b.container + " .content"),
        m(this).find(".content"),
        "OutputWindow" === this.className,
      );
      return !1;
    }
    function r(a) {
      var b = parseInt(this.parentNode.getAttribute("data-index"), 10),
        b = J[b];
      a.stopImmediatePropagation();
      if (!b) return !1;
      if (C.uid === b.ITID) return (C.remove(), !1);
      C.append();
      C.uid = b.ITID;
      C.setItem(b);
      return !1;
    }
    function t() {
      var a, b, c;
      L !== I.Type.BUY &&
        L !== I.Type.VENDING_STORE &&
        ((a = I.ui.find(".InputWindow:first")),
        m.contains(a.get(0), this)
          ? ((b = a), (c = I.ui.find(".OutputWindow:first")))
          : ((b = I.ui.find(".OutputWindow:first")), (c = a)),
        l(
          parseInt(this.getAttribute("data-index"), 10),
          b.find(".content:first"),
          c.find(".content:first"),
          b === a,
        ));
    }
    function n() {
      var a = parseInt(this.getAttribute("data-index"), 10);
      if ((a = P.getItemByIndex(a))) {
        var b = m(this).position(),
          c = m(this).parent().parent().parent().find(".overlay");
        c.show();
        c.css({ top: b.top - 20, left: b.left });
        c.text(q.getItemName(a));
        a.IsIdentified ? c.removeClass("grey") : c.addClass("grey");
      }
    }
    function g() {
      I.ui.find(".overlay").hide();
    }
    function p(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      this.scrollTop = 32 * Math.floor(this.scrollTop / 32) - 32 * b;
      return !1;
    }
    function k(a) {
      var b, c, d;
      b = I.ui.find(".InputWindow:first").get(0);
      c = I.ui.find(".OutputWindow:first").get(0);
      b = (m.contains(b, this) ? b : c).className;
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
            from: "PlayerStore",
            container: b,
            index: this.getAttribute("data-index"),
          }),
        ),
      );
    }
    function f() {
      x.select_all = !x.select_all;
      v.loadFile(
        q.INTERFACE_PATH + "checkbox_" + (x.select_all ? 1 : 0) + ".bmp",
        function (a) {
          this.style.backgroundImage = "url(" + a + ")";
        }.bind(this),
      );
    }
    var m = a("Utils/jquery"),
      q = a("DB/DBManager");
    a("DB/Items/ItemType");
    var v = a("Core/Client"),
      u = a("Core/Preferences");
    a("Engine/SessionStorage");
    var A = a("Controls/MouseEventHandler");
    a("Controls/KeyEventHandler");
    var D = a("Preferences/Controls"),
      B = a("UI/UIManager"),
      H = a("UI/UIComponent"),
      C = a("UI/Components/ItemInfo/ItemInfo"),
      z = a("UI/Components/InputBox/InputBox"),
      G = a("UI/Components/ChatBox/ChatBox");
    a("UI/Components/Inventory/Inventory");
    var P = a("UI/Components/OnPushCart/OnPushCart"),
      N = a("text!./PlayerStore.html");
    a = a("text!./PlayerStore.css");
    var I = new H("PlayerStore", N, a);
    I.mouseMode = H.MouseMode.FREEZE;
    var x = u.get(
        "PlayerStore",
        {
          inputWindow: { x: 50, y: 210, height: 2 },
          outputWindow: { x: 340, y: 50, height: 7 },
          saleWindow: { x: 50, y: 55, height: 2 },
          select_all: !1,
        },
        1,
      ),
      J = [],
      E = [],
      L,
      y = 0;
    I.init = function () {
      var a = this.ui,
        b = a.find(".InputWindow"),
        c = a.find(".OutputWindow"),
        d = a.find(".SaleWindow");
      a.find(".btn.cancel").click(this.remove.bind(this));
      a.find(".btn.buy, .btn.sell").click(this.submit.bind(this));
      d.on("click", ".close", this.remove.bind(this));
      a.find(".selectall").mousedown(f);
      b.find(".resize").mousedown(function () {
        e(b);
      });
      c.find(".resize").mousedown(function () {
        e(c);
      });
      this.ui
        .find(
          ".InputWindow .container .content,.SaleWindow .container .content",
        )
        .on("mouseover", ".item", n)
        .on("mouseout", ".item", g);
      a.find(".content")
        .on("mousewheel DOMMouseScroll", p)
        .on("contextmenu", ".icon", r)
        .on("dblclick", ".item", t)
        .on("dragstart", ".item", k)
        .on("dragend", ".item", function () {
          delete window._OBJ_DRAG_;
        });
      a.find(".InputWindow, .OutputWindow")
        .on("drop", h)
        .on("dragover", function (a) {
          a.stopImmediatePropagation();
          return !1;
        })
        .on("mousedown", function () {
          I.focus();
        });
      this.draggable.call({ ui: b }, b.find(".titlebar"));
      this.draggable.call({ ui: c }, c.find(".titlebar"));
      this.draggable.call({ ui: d }, d.find(".titlebar"));
    };
    I.onAppend = function () {
      D.talk = !0;
      var a = this.ui.find(".InputWindow"),
        b = this.ui.find(".OutputWindow"),
        c = this.ui.find(".SaleWindow");
      v.loadFile(
        q.INTERFACE_PATH + "checkbox_" + (x.select_all ? 1 : 0) + ".bmp",
        function (a) {
          this.ui
            .find(".selectall:first")
            .css("backgroundImage", "url(" + a + ")");
        }.bind(this),
      );
      d(a.find(".content"), x.inputWindow.height);
      d(b.find(".content"), x.outputWindow.height);
      d(c.find(".content"), x.saleWindow.height);
      a = m._data(window, "events").keydown;
      a.unshift(a.pop());
      I.setList(P.list);
    };
    I.onRemove = function () {
      D.talk = !1;
      var a = this.ui.find(".InputWindow"),
        b = this.ui.find(".OutputWindow"),
        c = this.ui.find(".SaleWindow");
      y = 0;
      J.length = 0;
      E.length = 0;
      a.css({ top: "", left: "" });
      b.css({ top: "", left: "" });
      c.css({ top: "", left: "" });
      this.ui.find(".content").empty();
      a.show();
      b.show();
      c.hide();
      I.onRemove2();
    };
    I.initList = function (a) {
      var b, c;
      this.ui.find(".OutputWindow .content").empty();
      c = this.ui.find(".OutputWindow .content");
      b = 0;
      for (a = a.itemcount; b < a; ++b)
        c.append(
          '\x3cdiv class\x3d"item" draggable\x3d"true" data-index\x3d""\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e\x3c/div\x3e\x3cdiv class\x3d"sale"\x3e\x3cspan\x3e\u552e\u4ef7:\x3c/span\x3e\x3cinput type\x3d"text" placeholder\x3d"0,000"/\x3e\x3c/div\x3e\x3c/div\x3e',
        );
    };
    I.setList = function (a) {
      var c, d, e, f;
      this.ui.find(".InputWindow .content").empty();
      f = this.ui.find(".InputWindow .content");
      c = 0;
      for (d = a.length; c < d; ++c)
        ("index" in a[c] || (a[c].index = c),
          (a[c].count = a[c].count || 1),
          (a[c].IsIdentified = !0),
          (e = m.extend({}, a[c])),
          (e.count = 0),
          b(f, a[c]),
          (J[a[c].index] = a[c]),
          (E[a[c].index] = e));
    };
    I.initSuss = function (a) {
      var c,
        d,
        e,
        f = "";
      I.ui || I.append();
      this.ui.find(".SaleWindow .content").empty();
      e = this.ui.find(".SaleWindow .content");
      m("#PlayerStore .SaleWindow .titlebar .text span").text(
        m("#PlayerStore .OutputWindow .shopname input").val() ||
          "\u6b22\u8fce\u5149\u4e34",
      );
      c = 0;
      for (d = a.itemList.length; c < d; ++c)
        ("index" in a.itemList[c] || (a.itemList[c].index = c),
          (a.itemList[c].count = a.itemList[c].count || 1),
          (a.itemList[c].IsIdentified = !0),
          (f +=
            "\x3cbr\x3e" +
            m.escape(q.getItemName(a.itemList[c])) +
            "\t\t:\t\t" +
            a.itemList[c].price +
            "\t\tZeny"),
          b(e, a.itemList[c]));
      this.ui.find(".InputWindow").hide();
      this.ui.find(".OutputWindow").hide();
      this.ui.find(".SaleWindow").show();
      G.addText(
        "\x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d \u51fa\u552e\u5217\u8868 \x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d" +
          f,
        G.TYPE.PRIVATE,
      );
    };
    I.submit = function () {
      var a, b, c, d;
      d = m("#PlayerStore .OutputWindow .shopname input").val();
      a = [];
      c = E.length;
      for (b = 0; b < c; ++b)
        E[b] &&
          E[b].count &&
          ((E[b].Price =
            parseInt(
              m(
                "#PlayerStore .OutputWindow .item[data-index\x3d" +
                  E[b].index +
                  "]",
              )
                .find(".sale input")
                .val(),
            ) || 1e7),
          a.push(E[b]));
      I.onSubmit(a, d);
    };
    I.delitem2 = function (a) {
      var b = this.ui.find(
        ".SaleWindow .content .item[data-index\x3d" + a.index + "]:first",
      );
      a = b.find(".amount").text() - a.count;
      0 === a ? b.length && b.remove() : b.length && b.find(".amount").text(a);
    };
    var F = (function () {
      var a = { ITID: 0, count: 0, Price: 0, index: 0 };
      return function (d, e, f, g, h) {
        if (f)
          y > m("#PlayerStore .OutputWindow .item").length - 1 ||
            ((E[g].count = Math.min(E[g].count + h, J[g].count)),
            (a.ITID = J[g].ITID),
            (a.count = J[g].count - E[g].count),
            (a.IsIdentified = J[g].IsIdentified),
            (a.index = J[g].index),
            c(d, a),
            c(e, E[g]));
        else if ((h = Math.min(h, E[g].count)))
          ((E[g].count -= h),
            (a.ITID = J[g].ITID),
            (a.count = J[g].count - E[g].count),
            (a.index = J[g].index),
            (a.IsIdentified = J[g].IsIdentified),
            (f = E[g]),
            (g = d.find(".item[data-index\x3d" + f.index + "]:first")),
            y--,
            0 === f.count
              ? g.length &&
                (g.remove(),
                d.append(
                  '\x3cdiv class\x3d"item" draggable\x3d"true" data-index\x3d""\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e\x3c/div\x3e\x3cdiv class\x3d"sale"\x3e\x3cspan\x3e\u552e\u4ef7:\x3c/span\x3e\x3cinput type\x3d"text" value\x3d"0,000"/\x3e\x3c/div\x3e\x3c/div\x3e',
                ))
              : g.length &&
                g.find(".amount").text(isFinite(f.count) ? f.count : ""),
            b(e, a));
      };
    })();
    I.onSubmit = function () {};
    return B.addComponent(I);
  },
);
