define(
  "UI/Components/OnPushCart/OnPushCart",
  "require DB/DBManager Network/NetworkManager Network/PacketStructure DB/Items/ItemType Utils/jquery Core/Client Core/Preferences Engine/SessionStorage Renderer/Renderer Controls/KeyEventHandler Controls/MouseEventHandler UI/UIManager UI/UIComponent UI/Components/InputBox/InputBox UI/Components/ItemInfo/ItemInfo text!./OnPushCart.html text!./OnPushCart.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function c() {
      var a = N.ui,
        b = a.find(".container .content"),
        c = a.find(".hide"),
        d = a.position().top,
        e = a.position().left,
        f = 0,
        g = 0,
        h;
      h = setInterval(function () {
        var a = Math.floor((B.screen.x - e - 25) / 32),
          h = Math.floor((B.screen.y - d - 20) / 32),
          a = Math.min(Math.max(a, 6), 9),
          h = Math.min(Math.max(h, 2), 6);
        if (a !== f || h !== g)
          (N.resize(a, h),
            (f = a),
            (g = h),
            b.height() === b[0].scrollHeight ? c.show() : c.hide());
      }, 30);
      q(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(h), q(window).off("mouseup.resize"));
      });
    }
    function d() {
      var a = N.ui;
      I
        ? (a.find(".panel").show(), a.height(I), (I = 0))
        : ((I = a.height()), a.height(17), a.find(".panel").hide());
    }
    function e(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      this.scrollTop = 32 * Math.floor(this.scrollTop / 32) - 32 * b;
      a.stopImmediatePropagation();
      return !1;
    }
    function l() {
      var a = parseInt(this.getAttribute("data-index"), 10);
      if ((a = N.getItemByIndex(a))) {
        var b = q(this).position(),
          c = N.ui.find(".overlay");
        c.show();
        c.css({ top: b.top, left: b.left + 35 });
        c.text(p.getItemName(a));
        a.IsIdentified ? c.removeClass("grey") : c.addClass("grey");
      }
    }
    function h() {
      N.ui.find(".overlay").hide();
    }
    function r(a) {
      var b = parseInt(this.getAttribute("data-index"), 10);
      if ((b = N.getItemByIndex(b))) {
        var c = new Image(),
          d = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1];
        c.src = d.replace(/^\"/, "").replace(/\"$/, "");
        a.originalEvent.dataTransfer.setDragImage(c, 12, 12);
        a.originalEvent.dataTransfer.setData(
          "Text",
          JSON.stringify(
            (window._OBJ_DRAG_ = { type: "item", from: "OnPushCart", data: b }),
          ),
        );
        h();
      }
    }
    function t() {
      delete window._OBJ_DRAG_;
    }
    function n(a) {
      a.stopImmediatePropagation();
      a = parseInt(this.getAttribute("data-index"), 10);
      a = N.getItemByIndex(a);
      if (!a) return !1;
      if (G.index === a.index) return (G.remove(), !1);
      G.append();
      G.uid = a.ITID;
      G.index = a.index;
      G.setItem(a);
      return !1;
    }
    function g(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (y) {}
      a.stopImmediatePropagation();
      if (!c) return !1;
      if (("item" == c.type) & ("Inventory" == c.from)) {
        b = c.data;
        if (1 < b.count)
          return (
            z.append(),
            z.setType("number", !1, b.count),
            (z.onSubmitRequest = function (a) {
              z.remove();
              N.reqAddItem(b.index, parseInt(a, 10));
            }),
            !1
          );
        N.reqAddItem(b.index, 1);
        return !1;
      }
      if (("item" == c.type) & ("Storage" == c.from)) {
        b = c.data;
        if (1 < b.count)
          return (
            z.append(),
            z.setType("number", !1, b.count),
            (z.onSubmitRequest = function (a) {
              z.remove();
              N.reqAddItem1(b.index, parseInt(a, 10));
            }),
            !1
          );
        N.reqAddItem1(b.index, 1);
        return !1;
      }
    }
    var p = a("DB/DBManager"),
      k = a("Network/NetworkManager"),
      f = a("Network/PacketStructure"),
      m = a("DB/Items/ItemType"),
      q = a("Utils/jquery"),
      v = a("Core/Client"),
      u = a("Core/Preferences"),
      A = a("Engine/SessionStorage"),
      D = a("Renderer/Renderer");
    a("Controls/KeyEventHandler");
    var B = a("Controls/MouseEventHandler"),
      H = a("UI/UIManager"),
      C = a("UI/UIComponent"),
      z = a("UI/Components/InputBox/InputBox"),
      G = a("UI/Components/ItemInfo/ItemInfo"),
      P = a("text!./OnPushCart.html");
    a = a("text!./OnPushCart.css");
    var N = new C("OnPushCart", P, a);
    N.TAB = { ALL: 0 };
    N.list = [];
    var I = 0,
      x = u.get(
        "OnPushCart",
        { x: 200, y: 125, width: 7, height: 4, tab: N.TAB.ALL },
        1,
      );
    N.init = function () {
      this.ui.find(".titlebar .base").mousedown(b);
      this.ui.find(".titlebar .mini").click(d);
      this.ui.find(".footer .extend").mousedown(c);
      this.ui.find(".titlebar .close").click(function () {
        N.ui.hide();
      });
      this.ui
        .on("drop", g)
        .on("dragover", b)
        .find(".container .content")
        .on("mousewheel DOMMouseScroll", e)
        .on("mouseover", ".item", l)
        .on("mouseout", ".item", h)
        .on("dragstart", ".item", r)
        .on("dragend", ".item", t)
        .on("contextmenu", ".item", n);
      this.draggable(this.ui.find(".titlebar"));
    };
    N.onAppend = function () {
      this.ui.hide();
      this.resize(x.width, x.height);
      this.ui.css({
        top: Math.min(Math.max(0, x.y), D.height - this.ui.height()),
        left: Math.min(Math.max(0, x.x), D.width - this.ui.width()),
      });
      I = x.reduce ? 0 : this.ui.height();
      this.ui.find(".titlebar .mini").trigger("mousedown");
    };
    N.clean = function () {
      this.ui.hide();
    };
    N.onRemove = function () {
      this.ui.find(".container .content").empty();
      this.list.length = 0;
      q(".ItemInfo").remove();
      x.show = this.ui.is(":visible");
      x.reduce = !!I;
      x.y = parseInt(this.ui.css("top"), 10);
      x.x = parseInt(this.ui.css("left"), 10);
      x.width = Math.floor((this.ui.width() - 25) / 32);
      x.height = Math.floor((this.ui.height() - 20) / 32);
      x.save();
    };
    N.toggle = function () {
      this.ui.toggle();
      this.ui.is(":visible") && this.focus();
    };
    N.onShortCut = function (a) {
      if (A.Entity.cart)
        switch (a.cmd) {
          case "TOGGLE":
            (this.ui.toggle(),
              this.ui.is(":visible")
                ? this.focus()
                : this.ui.trigger("mouseleave"));
        }
    };
    N.resize = function (a, b) {
      a = Math.min(Math.max(a, 6), 9);
      b = Math.min(Math.max(b, 2), 6);
      this.ui
        .find(".container .content")
        .css({ width: 32 * a + 46, height: 32 * b });
      this.ui.css({ width: 55 + 32 * a, height: 47 + 32 * b });
    };
    N.update = function (a) {
      this.ui.find(".curcount").text(a[0]);
      this.ui.find(".maxcount").text(a[1]);
      this.ui.find(".curweight").text(a[2] / 10);
      this.ui.find(".maxweight").text(a[3] / 10);
    };
    N.getItemById = function (a) {
      var b,
        c,
        d = N.list;
      b = 0;
      for (c = d.length; b < c; ++b) if (d[b].ITID === a) return d[b];
      return null;
    };
    N.getItemByIndex = function (a) {
      var b,
        c,
        d = N.list;
      b = 0;
      for (c = d.length; b < c; ++b) if (d[b].index === a) return d[b];
      return null;
    };
    N.setItems = function (a) {
      var b, c;
      b = 0;
      for (c = a.length; b < c; ++b) {
        var d = this.getItemByIndex(a[b].index);
        d && this.removeItem(d.index, d.count);
        this.addItemSub(a[b]) && this.list.push(a[b]);
      }
    };
    N.addItem = function (a) {
      var b = this.getItemByIndex(a.index);
      b
        ? ((b.count += a.count),
          this.ui
            .find('.item[data-index\x3d"' + a.index + '"] .count')
            .text(b.count))
        : ((b = q.extend({}, a)), this.addItemSub(b) && this.list.push(b));
    };
    N.addItemSub = function (a) {
      var b;
      switch (a.type) {
        case m.HEALING:
        case m.USABLE:
        case m.USABLE_SKILL:
        case m.USABLE_UNK:
        case m.WEAPON:
        case m.EQUIP:
        case m.PETEGG:
        case m.PETEQUIP:
        case m.ETC:
        case m.CARD:
        case m.AMMO:
        case m.FASHION:
        case m.SHADOWGEAR:
          b = N.TAB.ALL;
      }
      if (b === x.tab) {
        b = p.getItemInfo(a.ITID);
        var c = this.ui.find(".container .content");
        c.append(
          '\x3cdiv class\x3d"item" data-index\x3d"' +
            a.index +
            '" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3cspan class\x3d"count"\x3e' +
            (a.count || 1) +
            "\x3c/span\x3e\x3c/div\x3e\x3c/div\x3e",
        );
        v.loadFile(
          p.INTERFACE_PATH +
            "item/" +
            (a.IsIdentified
              ? b.identifiedResourceName
              : b.unidentifiedResourceName) +
            ".bmp",
          function (b) {
            c.find('.item[data-index\x3d"' + a.index + '"] .icon').css(
              "backgroundImage",
              "url(" + b + ")",
            );
          },
        );
      }
      return !0;
    };
    N.removeItem = function (a, b) {
      a = this.getItemByIndex(a);
      if (!a || 0 >= b) return null;
      if (a.count && ((a.count -= b), 0 < a.count))
        return (
          this.ui
            .find('.item[data-index\x3d"' + a.index + '"] .count')
            .text(a.count),
          this.onUpdateItem(a.ITID, a.count),
          a
        );
      this.list.splice(this.list.indexOf(a), 1);
      this.ui.find('.item[data-index\x3d"' + a.index + '"]').remove();
      this.onUpdateItem(a.ITID, 0);
      b = this.ui.find(".container .content");
      b.height() === b[0].scrollHeight && this.ui.find(".hide").show();
      return a;
    };
    N.updateItem = function (a, b) {
      if ((a = this.getItemByIndex(a)))
        ((a.count = b),
          0 < a.count
            ? (N.ui
                .find('.item[data-index\x3d"' + a.index + '"] .count')
                .text(a.count),
              N.onUpdateItem(a.ITID, a.count))
            : (this.list.splice(this.list.indexOf(a), 1),
              this.ui.find('.item[data-index\x3d"' + a.index + '"]').remove(),
              N.onUpdateItem(a.ITID, 0),
              (b = this.ui.find(".container .content")),
              b.height() === b[0].scrollHeight &&
                this.ui.find(".hide").show()));
    };
    N.reqAddItem = function (a, b) {
      if (!(0 >= b)) {
        var c = new f.CZ.MOVE_ITEM_FROM_BODY_TO_CART();
        c.index = a;
        c.count = b;
        k.sendPacket(c);
      }
    };
    N.reqAddItem1 = function (a, b) {
      if (!(0 >= b)) {
        var c = new f.CZ.MOVE_ITEM_FROM_STORE_TO_CART();
        c.index = a;
        c.count = b;
        k.sendPacket(c);
      }
    };
    N.reqRemoveItem = function (a, b) {
      if (!(0 >= b)) {
        var c = new f.CZ.MOVE_ITEM_FROM_CART_TO_BODY();
        c.index = a;
        c.count = b;
        k.sendPacket(c);
      }
    };
    return H.addComponent(N);
  },
);
