define(
  "UI/Components/BuyingStore/BuyingStore",
  "require Utils/jquery DB/DBManager DB/Items/ItemType Core/Client Core/Preferences Engine/SessionStorage Controls/MouseEventHandler Controls/KeyEventHandler Preferences/Controls UI/UIManager UI/UIComponent UI/Components/ItemInfo/ItemInfo UI/Components/InputBox/InputBox UI/Components/ChatBox/ChatBox UI/Components/Inventory/Inventory UI/Components/OnPushCart/OnPushCart text!./BuyingStore.html text!./BuyingStore.css".split(
    " ",
  ),
  function (a) {
    function b(a, b) {
      var c = p.getItemInfo(b.ITID),
        d = a.find(".item[data-index\x3d" + b.index + "]:first");
      0 === b.count
        ? d.length && d.remove()
        : d.length
          ? d.find(".amount").text(isFinite(b.count) ? b.count : "")
          : (a.append(
              '\x3cdiv class\x3d"item" draggable\x3d"true" data-index\x3d"' +
                b.index +
                '" data-id\x3d"' +
                b.ITID +
                '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
                (isFinite(b.count) ? b.count : "1") +
                "\x3c/div\x3e\x3c/div\x3e",
            ),
            v.loadFile(
              p.INTERFACE_PATH +
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
      var c = p.getItemInfo(b.ITID),
        d = a.find(".item[data-index\x3d" + b.index + "]:first");
      0 === b.count
        ? d.length && d.remove()
        : d.length
          ? d.find(".amount").text(isFinite(b.count) ? b.count : "")
          : ((d = n("#BuyingStore .OutputWindow .item").eq(H)),
            d.attr("data-index", b.index),
            d.find(".amount").html(isFinite(b.count) ? b.count : "1"),
            d.find(".name").html(n.escape(p.getItemName(b))),
            v.loadFile(
              p.INTERFACE_PATH +
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
            H++);
    }
    function d(a, b) {
      b = Math.min(Math.max(b, 2), 9);
      a.css("height", 32 * b + 5);
    }
    function e(a) {
      var b = a.position().top,
        c = a.find(".content:first"),
        e = 0,
        f;
      f = setInterval(function () {
        var a = Math.floor((D.screen.y - b - 20) / 32),
          a = Math.min(Math.max(a, 2), 9);
        a !== e && (d(c, a), (e = a));
      }, 30);
      n(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(f), n(window).off("mouseup.resize"));
      });
    }
    function m(a, b, c, d) {
      var e;
      e = d ? (isFinite(E[a].count) ? E[a].count : 1) : F[a].count;
      1 < e
        ? (z.append(),
          z.setType("number", !1, e),
          (z.onSubmitRequest = function (e) {
            z.remove();
            0 < e && K(b, c, d, a, e);
          }))
        : K(b, c, d, a, e);
    }
    function h(a) {
      var b;
      a.stopImmediatePropagation();
      try {
        b = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (S) {
        return !1;
      }
      if (
        "item" !== b.type ||
        "BuyingStore" !== b.from ||
        b.container === this.className
      )
        return !1;
      m(
        b.index,
        n("." + b.container + " .content"),
        n(this).find(".content"),
        "OutputWindow" === this.className,
      );
      return !1;
    }
    function r(a) {
      a = parseInt(this.getAttribute("data-id"), 10);
      var b = p.getItemInfo(a);
      b.ITID = a;
      b.IsIdentified = 1;
      b &&
        (y.uid != b.ITID
          ? (y.append(), (y.index = b.index), (y.uid = b.ITID), y.setItem(b))
          : y.remove());
    }
    function q() {
      var a = parseInt(this.getAttribute("data-index"), 10);
      a
        ? (a = I.getItemByIndex(a))
        : ((a = p.getItemInfo(parseInt(this.getAttribute("data-id"), 10))),
          (a.ITID = parseInt(this.getAttribute("data-id"), 10)));
      if (a) {
        var b = n(this).position(),
          c = n(this).parent().parent().parent().find(".overlay");
        c.show();
        c.css({ top: b.top, left: b.left + 12 });
        c.text(p.getItemName(a));
        a.IsIdentified ? c.removeClass("grey") : c.addClass("grey");
      }
    }
    function k() {
      x.ui.find(".overlay").hide();
    }
    function g() {
      var a, b, c;
      G !== x.Type.BUY &&
        G !== x.Type.VENDING_STORE &&
        ((a = x.ui.find(".InputWindow:first")),
        n.contains(a.get(0), this)
          ? ((b = a), (c = x.ui.find(".OutputWindow:first")))
          : ((b = x.ui.find(".OutputWindow:first")), (c = a)),
        m(
          parseInt(this.getAttribute("data-index"), 10),
          b.find(".content:first"),
          c.find(".content:first"),
          b === a,
        ));
    }
    function t(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      this.scrollTop = 32 * Math.floor(this.scrollTop / 32) - 32 * b;
      return !1;
    }
    function l(a) {
      var b, c, d;
      b = x.ui.find(".InputWindow:first").get(0);
      c = x.ui.find(".OutputWindow:first").get(0);
      b = (n.contains(b, this) ? b : c).className;
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
            from: "BuyingStore",
            container: b,
            index: this.getAttribute("data-index"),
          }),
        ),
      );
    }
    function f() {
      M.select_all = !M.select_all;
      v.loadFile(
        p.INTERFACE_PATH + "checkbox_" + (M.select_all ? 1 : 0) + ".bmp",
        function (a) {
          this.style.backgroundImage = "url(" + a + ")";
        }.bind(this),
      );
    }
    var n = a("Utils/jquery"),
      p = a("DB/DBManager");
    a("DB/Items/ItemType");
    var v = a("Core/Client"),
      u = a("Core/Preferences"),
      A = a("Engine/SessionStorage"),
      D = a("Controls/MouseEventHandler");
    a("Controls/KeyEventHandler");
    var B = a("Preferences/Controls"),
      O = a("UI/UIManager"),
      C = a("UI/UIComponent"),
      y = a("UI/Components/ItemInfo/ItemInfo"),
      z = a("UI/Components/InputBox/InputBox"),
      J = a("UI/Components/ChatBox/ChatBox"),
      I = a("UI/Components/Inventory/Inventory");
    a("UI/Components/OnPushCart/OnPushCart");
    var L = a("text!./BuyingStore.html");
    a = a("text!./BuyingStore.css");
    var x = new C("BuyingStore", L, a);
    x.mouseMode = C.MouseMode.STOP;
    var M = u.get(
        "BuyingStore",
        {
          inputWindow: { x: 50, y: 210, height: 2 },
          outputWindow: { x: 340, y: 50, height: 7 },
          saleWindow: { x: 50, y: 55, height: 2 },
          select_all: !1,
        },
        1.11,
      ),
      E = [],
      F = [],
      G,
      H = 0;
    x.init = function () {
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
      a.find(".InputWindow .container .content,.SaleWindow .container .content")
        .on("mouseover", ".item", q)
        .on("mouseout", ".item", k);
      a.find(".content")
        .on("mousewheel DOMMouseScroll", t)
        .on("contextmenu", ".item", r)
        .on("dblclick", ".item", g)
        .on("dragstart", ".item", l)
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
          x.focus();
        });
      this.draggable.call({ ui: b }, b.find(".titlebar"));
      this.draggable.call({ ui: c }, c.find(".titlebar"));
      this.draggable.call({ ui: d }, d.find(".titlebar"));
    };
    x.onAppend = function () {
      B.talk = !0;
      var a = this.ui.find(".InputWindow"),
        b = this.ui.find(".OutputWindow"),
        c = this.ui.find(".SaleWindow");
      v.loadFile(
        p.INTERFACE_PATH + "checkbox_" + (M.select_all ? 1 : 0) + ".bmp",
        function (a) {
          this.ui
            .find(".selectall:first")
            .css("backgroundImage", "url(" + a + ")");
        }.bind(this),
      );
      d(a.find(".container"), M.inputWindow.height);
      d(b.find(".container"), M.outputWindow.height);
      d(c.find(".container"), M.saleWindow.height);
      n("#BuyingStore .curzeny").html(n("#basicinfo .zeny_value").html());
      n("#BuyingStore .curweight").html(n("#basicinfo .weight_value").html());
      n("#BuyingStore .maxweight").html(n("#basicinfo .weight_total").html());
      n("#BuyingStore .zenylimit input").val(A.zeny);
      a = n._data(window, "events").keydown;
      a.unshift(a.pop());
      x.setList(I.list);
    };
    x.onRemove = function () {
      B.talk = !1;
      var a = this.ui.find(".InputWindow"),
        b = this.ui.find(".OutputWindow"),
        c = this.ui.find(".SaleWindow");
      H = 0;
      E.length = 0;
      F.length = 0;
      a.css({ top: "", left: "" });
      b.css({ top: "", left: "" });
      c.css({ top: "", left: "" });
      this.ui.find(".content").empty();
      a.show();
      b.show();
      c.hide();
      x.onRemove2();
    };
    x.onRemove2 = function () {};
    x.onKeyDown = function (a) {
      return !0;
    };
    x.initList = function (a) {
      var b, c;
      this.ui.find(".OutputWindow .content").empty();
      c = this.ui.find(".OutputWindow .content");
      b = 0;
      for (a = a.count; b < a; ++b)
        c.append(
          '\x3cdiv class\x3d"item" draggable\x3d"true" data-index\x3d""\x3e\x3cdiv class\x3d"icon"\x3e\x3cdiv class\x3d"amount"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e\x3c/div\x3e\x3cdiv class\x3d"sale"\x3e\x3cinput type\x3d"text" class\x3d"num" placeholder\x3d"0"/\x3e\x3cspan\x3e\u4e2a\x3c/span\x3e\x3cspan\x3e\u6536\u8d2d\u4ef7\x3c/span\x3e\x3cinput type\x3d"text" class\x3d"prices" placeholder\x3d"0,000"/\x3e\x3c/div\x3e\x3c/div\x3e',
        );
    };
    x.setList = function (a) {
      var c, d, e, f;
      this.ui.find(".InputWindow .content").empty();
      f = this.ui.find(".InputWindow .content");
      c = 0;
      for (d = a.length; c < d; ++c)
        ("index" in a[c] || (a[c].index = c),
          (a[c].count = a[c].count || 1),
          (a[c].IsIdentified = !0),
          (e = n.extend({}, a[c])),
          (e.count = 0),
          b(f, a[c]),
          (E[a[c].index] = a[c]),
          (F[a[c].index] = e));
    };
    x.initSuss = function (a) {
      var c,
        d,
        e,
        f = "";
      x.ui || x.append();
      this.ui.find(".SaleWindow .content").empty();
      e = this.ui.find(".SaleWindow .content");
      n("#BuyingStore .SaleWindow .titlebar .text span").text(
        n("#BuyingStore .OutputWindow .shopname input").val() ||
          "\u6b22\u8fce\u5149\u4e34",
      );
      c = 0;
      for (d = a.ItemList.length; c < d; ++c)
        ("index" in a.ItemList[c] || (a.ItemList[c].index = c),
          (a.ItemList[c].count = a.ItemList[c].count || 1),
          (a.ItemList[c].IsIdentified = !0),
          (f +=
            "\x3cbr\x3e" +
            n.escape(p.getItemName(a.ItemList[c])) +
            "\t\t:\t\t" +
            a.ItemList[c].price +
            "\t\tZeny"),
          b(e, a.ItemList[c]));
      this.ui.find(".InputWindow").hide();
      this.ui.find(".OutputWindow").hide();
      this.ui.find(".SaleWindow").show();
      J.addText(
        "\x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d \u91c7\u8d2d\u5217\u8868 \x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d\x3d" +
          f,
        J.TYPE.PRIVATE,
      );
    };
    x.Openfalut = function (a) {
      x.remove();
      x.onRemove2();
      J.addText(
        "\u91c7\u8d2d\u5f00\u542f\u5931\u8d25\uff0c\u6709\u4e9b\u9053\u5177\u4e0d\u5141\u8bb8\u91c7\u8d2d\u3002",
        J.TYPE.PRIVATE,
      );
      A.Entity.dialog.set("\u91c7\u8d2d\u5f00\u542f\u5931\u8d25");
    };
    x.submit = function () {
      var a, b, c, d, e;
      d = n("#BuyingStore .OutputWindow .shopname input").val();
      e = n("#BuyingStore .OutputWindow .zenylimit input").val();
      if (e > A.zeny)
        alert(
          "\u8d2d\u4e70\u9650\u5ea6\u4e0d\u80fd\u8d85\u8fc7\u6301\u6709\u91d1\u989d",
        );
      else {
        a = [];
        c = F.length;
        for (b = 0; b < c; b++)
          if (F[b] && F[b].count) {
            if (
              0 ==
                n(
                  "#BuyingStore .OutputWindow .item[data-index\x3d" +
                    F[b].index +
                    "]",
                )
                  .find(".num")
                  .val() ||
              0 ==
                n(
                  "#BuyingStore .OutputWindow .item[data-index\x3d" +
                    F[b].index +
                    "]",
                )
                  .find(".prices")
                  .val()
            ) {
              alert(
                "\u5fd8\u8bb0\u586b\u5199\u91c7\u8d2d\u6570\u91cf\u6216\u6536\u8d2d\u4ef7\u683c\u4e86",
              );
              return;
            }
            F[b]._id = F[b].ITID || 0;
            F[b]._count =
              n(
                "#BuyingStore .OutputWindow .item[data-index\x3d" +
                  F[b].index +
                  "]",
              )
                .find(".num")
                .val() || 0;
            F[b]._price =
              n(
                "#BuyingStore .OutputWindow .item[data-index\x3d" +
                  F[b].index +
                  "]",
              )
                .find(".prices")
                .val() || 0;
            a.push(F[b]);
          }
        x.onSubmit(a, d, e);
      }
    };
    x.updateStore = function (a) {
      for (var b = F.length, c = 0; c < b; c++)
        F[c] &&
          F[c].ITID == a.ITID &&
          ((F[c]._count -= a.count),
          n("#BuyingStore .SaleWindow .item[data-id\x3d" + F[c].ITID + "]")
            .find(".amount")
            .html(F[c]._count));
    };
    x.delitem2 = function (a) {
      var b = this.ui.find(
        ".SaleWindow .content .item[data-index\x3d" + a.index + "]:first",
      );
      a = b.find(".amount").text() - a.count;
      0 === a ? b.length && b.remove() : b.length && b.find(".amount").text(a);
    };
    var K = (function () {
      var a = { ITID: 0, count: 0, Price: 0, index: 0 };
      return function (d, e, f, g, h) {
        if (f)
          H > n("#BuyingStore .OutputWindow .item").length - 1 ||
            ((F[g].count = Math.min(F[g].count + h, E[g].count)),
            (a.ITID = E[g].ITID),
            (a.count = E[g].count - F[g].count),
            (a.IsIdentified = E[g].IsIdentified),
            (a.index = E[g].index),
            c(d, a),
            c(e, F[g]));
        else if ((h = Math.min(h, F[g].count)))
          ((F[g].count -= h),
            (a.ITID = E[g].ITID),
            (a.count = E[g].count - F[g].count),
            (a.index = E[g].index),
            (a.IsIdentified = E[g].IsIdentified),
            (f = F[g]),
            (g = d.find(".item[data-index\x3d" + f.index + "]:first")),
            H--,
            0 === f.count
              ? g.length &&
                (g.remove(),
                d.append(
                  '\x3cdiv class\x3d"item" draggable\x3d"true" data-index\x3d""\x3e\x3cdiv class\x3d"left"\x3e\x3cdiv class\x3d"icon"\x3e\x3cdiv class\x3d"amount"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"sale"\x3e\x3cinput type\x3d"text" class\x3d"num" placeholder\x3d"0"/\x3e\x3cspan\x3e\u4e2a\x3c/span\x3e\x3cspan\x3e\u6536\u8d2d\u4ef7\x3c/span\x3e\x3cinput type\x3d"text" class\x3d"prices" placeholder\x3d"0,000"/\x3e\x3c/div\x3e\x3c/div\x3e',
                ))
              : g.length &&
                g.find(".amount").text(isFinite(f.count) ? f.count : ""),
            b(e, a));
      };
    })();
    x.onSubmit = function () {};
    return O.addComponent(x);
  },
);
