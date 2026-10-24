define(
  "UI/Components/Inventory/Inventory",
  "require Network/NetworkManager Network/PacketStructure DB/DBManager DB/Items/ItemType Utils/jquery Core/Client Core/Preferences Renderer/Renderer Controls/KeyEventHandler Controls/MouseEventHandler UI/UIManager UI/UIComponent UI/Components/InputBox/InputBox UI/Components/ItemInfo/ItemInfo UI/Components/Equipment/Equipment UI/Components/ChatBox/ChatBox text!./Inventory.html text!./Inventory.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function c() {
      var a = F.ui,
        b = a.find(".container .content"),
        c = a.find(".hide"),
        d = a.position().top,
        e = a.position().left,
        f = 0,
        g = 0,
        h;
      h = setInterval(function () {
        var a = Math.floor((C.screen.x - e - 25) / 32),
          h = Math.floor((C.screen.y - d - 20) / 32),
          a = Math.min(Math.max(a, 6), 9),
          h = Math.min(Math.max(h, 2), 6);
        if (a !== f || h !== g)
          (F.resize(a, h),
            (f = a),
            (g = h),
            b.height() === b[0].scrollHeight ? c.show() : c.hide());
      }, 30);
      u(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(h), u(window).off("mouseup.resize"));
      });
    }
    function d() {
      var a = u(this).index();
      H.tab = parseInt(a, 10);
      A.loadFile(
        f.INTERFACE_PATH + "basic_interface/tab_itm_0" + (a + 1) + ".bmp",
        function (a) {
          F.ui.find(".tabs").css("backgroundImage", "url(" + a + ")");
          F.ui.find(".container .content").empty();
          a = F.list;
          var b, c;
          b = 0;
          for (c = a.length; b < c; ++b) F.addItemSub(a[b]);
        },
      );
    }
    function e() {
      var a = F.ui;
      G
        ? (a.find(".panel").show(), a.height(G), (G = 0))
        : ((G = a.height()), a.height(17), a.find(".panel").hide());
    }
    function m(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (S) {
        return !1;
      }
      a.stopImmediatePropagation();
      if (("item" == c.type) & ("OnPushCart" == c.from)) {
        b = c.data;
        if (1 < b.count)
          return (
            J.append(),
            J.setType("number", !1, b.count),
            (J.onSubmitRequest = function (a) {
              J.remove();
              E("UI/Components/OnPushCart/OnPushCart").reqRemoveItem(
                b.index,
                parseInt(a, 10),
              );
            }),
            !1
          );
        E("UI/Components/OnPushCart/OnPushCart").reqRemoveItem(b.index, 1);
        return !1;
      }
      if (("item" == c.type) & ("Storage" == c.from)) {
        b = c.data;
        if (1 < b.count)
          return (
            J.append(),
            J.setType("number", !1, b.count),
            (J.onSubmitRequest = function (a) {
              J.remove();
              E("UI/Components/Storage/Storage").reqRemoveItem(
                b.index,
                parseInt(a, 10),
              );
            }),
            !1
          );
        E("UI/Components/Storage/Storage").reqRemoveItem(b.index, 1);
        return !1;
      }
      if (("item" == c.type) & ("RodexSend" == c.from)) {
        b = c.data;
        if (1 < b.count)
          return (
            J.append(),
            J.setType("number", !1, b.count),
            (J.onSubmitRequest = function (a) {
              J.remove();
              E("UI/Components/Mail/RodexSend").reqRemoveItem(
                b.index,
                parseInt(a, 10),
              );
            }),
            !1
          );
        E("UI/Components/Mail/RodexSend").reqRemoveItem(b.index, 1);
        return !1;
      }
    }
    function h(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      this.scrollTop = 32 * Math.floor(this.scrollTop / 32) - 32 * b;
      a.stopImmediatePropagation();
      return !1;
    }
    function r() {
      var a = parseInt(this.getAttribute("data-index"), 10);
      if ((a = F.getItemByIndex(a))) {
        var b = u(this).position(),
          c = F.ui.find(".overlay");
        c.show();
        c.css({ top: b.top, left: b.left + 35 });
        c.text(f.getItemName(a));
        a.IsIdentified ? c.removeClass("grey") : c.addClass("grey");
      }
    }
    function q() {
      F.ui.find(".overlay").hide();
    }
    function k(a) {
      var b = parseInt(this.getAttribute("data-index"), 10);
      if ((b = F.getItemByIndex(b))) {
        var c = new Image(),
          d = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1];
        c.src = d.replace(/^\"/, "").replace(/\"$/, "");
        a.originalEvent.dataTransfer.setDragImage(c, 12, 12);
        a.originalEvent.dataTransfer.setData(
          "Text",
          JSON.stringify(
            (window._OBJ_DRAG_ = { type: "item", from: "Inventory", data: b }),
          ),
        );
        q();
      }
    }
    function g() {
      delete window._OBJ_DRAG_;
    }
    function t(a) {
      a.stopImmediatePropagation();
      a = parseInt(this.getAttribute("data-index"), 10);
      var b = F.getItemByIndex(a);
      if (!b) return !1;
      if (!0 === O.ALT) {
        var c = new p.CZ.MOVE_ITEM_FROM_BODY_TO_STORE();
        c.index = a;
        c.count = b.count;
        n.sendPacket(c);
        return !1;
      }
      if (I.index === b.index) return (I.remove(), !1);
      I.append();
      I.uid = b.ITID;
      I.index = b.index;
      I.setItem(b);
      return !1;
    }
    function l(a) {
      if (!u("#CashShop").is(":visible")) {
        var b = parseInt(this.getAttribute("data-index"), 10);
        if ((b = F.getItemByIndex(b))) (F.useItem(b), q());
        a.stopImmediatePropagation();
        return !1;
      }
    }
    var f = a("DB/DBManager"),
      n = a("Network/NetworkManager"),
      p = a("Network/PacketStructure"),
      v = a("DB/Items/ItemType"),
      u = a("Utils/jquery"),
      A = a("Core/Client"),
      D = a("Core/Preferences"),
      B = a("Renderer/Renderer"),
      O = a("Controls/KeyEventHandler"),
      C = a("Controls/MouseEventHandler"),
      y = a("UI/UIManager"),
      z = a("UI/UIComponent"),
      J = a("UI/Components/InputBox/InputBox"),
      I = a("UI/Components/ItemInfo/ItemInfo"),
      L = a("UI/Components/Equipment/Equipment");
    a("UI/Components/ChatBox/ChatBox");
    var x = a("text!./Inventory.html"),
      M = a("text!./Inventory.css"),
      E = a,
      F = new z("Inventory", x, M);
    F.TAB = { USABLE: 0, EQUIP: 1, ETC: 2 };
    F.list = [];
    var G = 0,
      H = D.get(
        "Inventory",
        {
          x: 200,
          y: 300,
          width: 8,
          height: 5,
          show: !1,
          reduce: !1,
          tab: F.TAB.USABLE,
        },
        1.1,
      );
    F.init = function () {
      this.ui.find(".titlebar .base").mousedown(b);
      this.ui.find(".titlebar .mini").click(e);
      this.ui.find(".tabs button").mousedown(d);
      this.ui.find(".footer .extend").mousedown(c);
      this.ui.find(".titlebar .close").click(function () {
        F.ui.hide();
      });
      this.ui
        .on("drop", m)
        .on("dragover", b)
        .find(".container .content")
        .on("mousewheel DOMMouseScroll", h)
        .on("mouseover", ".item", r)
        .on("mouseout", ".item", q)
        .on("dragstart", ".item", k)
        .on("dragend", ".item", g)
        .on("contextmenu", ".item", t)
        .on("dblclick", ".item", l);
      this.draggable(this.ui.find(".titlebar"));
    };
    F.onAppend = function () {
      this.ui.hide();
      A.loadFile(
        f.INTERFACE_PATH + "basic_interface/tab_itm_0" + (H.tab + 1) + ".bmp",
        function (a) {
          F.ui.find(".tabs").css("backgroundImage", 'url("' + a + '")');
        },
      );
      this.resize(H.width, H.height);
      this.ui.css({
        top: Math.min(Math.max(0, H.y), (B.height - this.ui.height()) / 2),
        left: Math.min(Math.max(0, H.x), (B.width - this.ui.width()) / 2),
      });
      G = H.reduce ? 0 : this.ui.height();
      this.ui.find(".titlebar .mini").trigger("mousedown");
    };
    F.onRemove = function () {
      this.ui.find(".container .content").empty();
      this.list.length = 0;
      u(".ItemInfo").remove();
      H.show = this.ui.is(":visible");
      H.reduce = !!G;
      H.y = parseInt(this.ui.css("top"), 10);
      H.x = parseInt(this.ui.css("left"), 10);
      H.width = Math.floor((this.ui.width() - 25) / 32);
      H.height = Math.floor((this.ui.height() - 20) / 32);
      H.save();
    };
    F.toggle = function () {
      this.ui.toggle();
      this.ui.is(":visible") && this.focus();
    };
    F.empty = function () {
      this.ui.find(".container .content").empty();
      this.list.length = 0;
    };
    F.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          (this.ui.toggle(),
            this.ui.is(":visible")
              ? this.focus()
              : this.ui.trigger("mouseleave"));
      }
    };
    F.resize = function (a, b) {
      a = Math.min(Math.max(a, 6), 9);
      b = Math.min(Math.max(b, 2), 6);
      this.ui
        .find(".container .content")
        .css({ width: 32 * a + 19, height: 32 * b });
      this.ui.css({ width: 55 + 32 * a, height: 50 + 32 * b });
    };
    F.getItemById = function (a) {
      var b,
        c,
        d = F.list;
      b = 0;
      for (c = d.length; b < c; ++b) if (d[b].ITID === a) return d[b];
      return null;
    };
    F.getItemByReformLimits = function (a) {
      var b,
        c,
        d = F.list;
      b = 0;
      for (c = d.length; b < c; ++b)
        if (
          d[b].ITID === a.BaseItem &&
          0 != d[b].IsIdentified &&
          !(
            d[b].RefiningLevel < a.NeedRefineMin ||
            d[b].RefiningLevel > a.NeedRefineMax ||
            d[b].nRandomOptionCnt < a.NeedOptionNumMin
          )
        ) {
          if (a.IsEmptySocket) {
            if (0 < d[b].slot.card1) continue;
            if (0 < d[b].slot.card2) continue;
            if (0 < d[b].slot.card3) continue;
            if (0 < d[b].slot.card4) continue;
          }
          return d[b];
        }
      return null;
    };
    F.getItemBySynthesisLimits = function (a) {
      var b = F.list,
        c = [];
      if (a.EquipmentFusionMode)
        for (var d = 0; d < b.length; ++d) {
          if (4 == b[d].type || 5 == b[d].type)
            ((b[d].needAmount = 1), c.push(b[d]));
        }
      else
        for (var e = a.SourceItems, d = 0; d < e.length; ++d)
          for (var f = 0; f < b.length; ++f)
            if (
              b[f].ITID == e[d][2] &&
              0 != b[f].IsIdentified &&
              !(
                b[f].count < e[d][1] ||
                b[f].RefiningLevel < a.NeedRefineMin ||
                b[f].RefiningLevel > a.NeedRefineMax
              )
            ) {
              var g = b[f];
              g.needAmount = e[d][1];
              c.push(g);
            }
      return c;
    };
    F.getItemByUpgradeLimits = function (a) {
      for (var b = F.list, c = a.TargetItems, d = [], e = 0; e < c.length; ++e)
        for (var f = 0; f < b.length; ++f)
          if (b[f].ITID == c[e][1] && 0 != b[f].IsIdentified) {
            if (a.NotSocketEnchantItem) {
              if (0 < b[f].slot.card1) continue;
              if (0 < b[f].slot.card2) continue;
              if (0 < b[f].slot.card3) continue;
              if (0 < b[f].slot.card4) continue;
            }
            b[f].RefiningLevel < a.NeedRefineMin ||
              b[f].RefiningLevel > a.NeedRefineMax ||
              d.push(b[f]);
          }
      return d;
    };
    F.getItemByIndex = function (a) {
      var b,
        c,
        d = F.list;
      b = 0;
      for (c = d.length; b < c; ++b) if (d[b].index === a) return d[b];
      return null;
    };
    F.setItems = function (a) {
      var b, c;
      b = 0;
      for (c = a.length; b < c; ++b) {
        var d = this.getItemByIndex(a[b].index);
        d && this.removeItem(d.index, d.count);
        this.addItemSub(a[b]) &&
          (this.list.push(a[b]), this.onUpdateItem(a[b].ITID, a[b].count));
      }
      a = F.list.length + L.getAmount();
      F.ui.find(".titlebar .curamount").text(a);
    };
    F.addItem = function (a) {
      var b = this.getItemByIndex(a.index);
      b
        ? ((b.count += a.count),
          this.ui
            .find('.item[data-index\x3d"' + a.index + '"] .count')
            .text(b.count),
          this.onUpdateItem(b.ITID, b.count))
        : ((b = u.extend({}, a)),
          this.addItemSub(b) &&
            (this.list.push(b), this.onUpdateItem(b.ITID, b.count)));
      a = F.list.length + L.getAmount();
      F.ui.find(".titlebar .curamount").text(a);
    };
    F.addItem_ = function (a) {
      var b = this.getItemByIndex(a.index);
      b
        ? ((b.count += 1),
          this.ui
            .find('.item[data-index\x3d"' + a.index + '"] .count')
            .text(b.count),
          this.onUpdateItem(b.ITID, b.count))
        : ((b = u.extend({}, a)),
          this.addItemSub(b) &&
            ((b.count += 1),
            this.list.push(b),
            this.onUpdateItem(b.ITID, b.count)));
      a = F.list.length + L.getAmount();
      F.ui.find(".titlebar .curamount").text(a);
    };
    F.updateInfos = function (a) {
      for (var b = 0; b < this.list.length; b++)
        if (this.ui.find(".item").eq(b).data("gid") == a.GID)
          for (
            var c = this.ui.find(".item").eq(b).data("index"), d = 0;
            d < this.list.length;
            d++
          )
            if (this.list[d].index == c) {
              this.list[d].makerInfo = a;
              break;
            }
      L.updateInfos(a);
    };
    F.addItemSub = function (a) {
      var b;
      switch (a.type) {
        case v.HEALING:
        case v.USABLE:
        case v.USABLE_SKILL:
        case v.USABLE_UNK:
          b = F.TAB.USABLE;
          break;
        case v.WEAPON:
        case v.EQUIP:
        case v.PETEQUIP:
          b = F.TAB.EQUIP;
          break;
        default:
        case v.ETC:
        case v.CARD:
        case v.AMMO:
        case v.PETEGG:
          b = F.TAB.ETC;
      }
      if (a.WearState && a.type !== v.AMMO && a.type !== v.CARD)
        return (L.equip(a), !1);
      if (b === H.tab) {
        b = f.getItemInfo(a.ITID);
        var c = this.ui.find(".container .content");
        switch (a.slot.card1) {
          case 255:
          case 254:
          case 65280:
            var d = 65535 * a.slot.card4 + a.slot.card3 + a.slot.card4;
            c.append(
              '\x3cdiv class\x3d"item maked" data-index\x3d"' +
                a.index +
                '" data-itid\x3d"' +
                a.ITID +
                '" draggable\x3d"true" data-gid\x3d"' +
                d +
                '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3cspan class\x3d"count"\x3e' +
                (a.count || 1) +
                "\x3c/span\x3e\x3c/div\x3e\x3c/div\x3e",
            );
            var e = new p.CZ.REQNAME_BYGID();
            e.GID = d;
            n.sendPacket(e);
            break;
          default:
            c.append(
              '\x3cdiv class\x3d"item" data-index\x3d"' +
                a.index +
                '" data-itid\x3d"' +
                a.ITID +
                '" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3cspan class\x3d"count"\x3e' +
                (a.count || 1) +
                "\x3c/span\x3e\x3c/div\x3e\x3c/div\x3e",
            );
        }
        c.height() < c[0].scrollHeight
          ? this.ui.find(".hide").hide()
          : this.ui.find(".hide").show();
        A.loadFile(
          f.INTERFACE_PATH +
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
    F.removeItem = function (a, b) {
      a = this.getItemByIndex(a);
      if (!a || 0 >= b) return null;
      if (a.count && ((a.count -= b), 0 < a.count))
        return (
          this.ui
            .find('.item[data-index\x3d"' + a.index + '"] .count')
            .text(a.count),
          this.onUpdateItem(a.ITID, a.count),
          (b = F.list.length + L.getAmount()),
          F.ui.find(".titlebar .curamount").text(b),
          a
        );
      this.list.splice(this.list.indexOf(a), 1);
      this.ui.find('.item[data-index\x3d"' + a.index + '"]').remove();
      this.onUpdateItem(a.ITID, 0);
      b = this.ui.find(".container .content");
      b.height() === b[0].scrollHeight && this.ui.find(".hide").show();
      b = F.list.length + L.getAmount();
      F.ui.find(".titlebar .curamount").text(b);
      return a;
    };
    F.updateItem = function (a, b) {
      if ((a = this.getItemByIndex(a)))
        ((a.count = b),
          0 < a.count
            ? (this.ui
                .find('.item[data-index\x3d"' + a.index + '"] .count')
                .text(a.count),
              this.onUpdateItem(a.ITID, a.count))
            : (this.list.splice(this.list.indexOf(a), 1),
              this.ui.find('.item[data-index\x3d"' + a.index + '"]').remove(),
              this.onUpdateItem(a.ITID, 0),
              (b = this.ui.find(".container .content")),
              b.height() === b[0].scrollHeight && this.ui.find(".hide").show()),
          (b = F.list.length + L.getAmount()),
          F.ui.find(".titlebar .curamount").text(b));
    };
    F.mailItem = function (a, b) {
      if ((a = this.getItemByIndex(a))) a.count_ = b;
    };
    F.useItem = function (a) {
      switch (a.type) {
        case v.HEALING:
        case v.USABLE:
        case v.USABLE_UNK:
          F.onUseItem(a.index);
          break;
        case v.CARD:
          F.onUseCard(a.index);
          break;
        case v.WEAPON:
        case v.EQUIP:
        case v.PETEQUIP:
        case v.AMMO:
          if (a.IsIdentified && !a.IsDamaged)
            F.onEquipItem(a.index, a.location);
      }
    };
    F.auctionItem = function (a, b) {
      if ((a = this.getItemByIndex(a))) a.count_ = b;
    };
    F.onUseItem = function () {};
    F.onUseCard = function () {};
    F.onEquipItem = function () {};
    F.onUpdateItem = function () {};
    return y.addComponent(F);
  },
);
