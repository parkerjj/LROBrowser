define(
  "UI/Components/RefineUI/RefineUI",
  "require DB/DBManager Utils/jquery Utils/Texture Renderer/Renderer Engine/SessionStorage Network/NetworkManager Network/PacketStructure Core/Configs Core/Client UI/UIManager UI/UIComponent UI/Components/Inventory/Inventory UI/Components/ItemInfo/ItemInfo UI/Components/ItemObtain/ItemObtain UI/Components/ChatBox/ChatBox text!./RefineUI.html text!./RefineUI.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b;
      try {
        b = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (K) {}
      a.stopImmediatePropagation();
      if (!b) return !1;
      if (("item" == b.type) & ("Inventory" == b.from))
        return (
          (a = b.data),
          (b = new g.CZ.REFINE_ADD_ITEM()),
          (b.index = a.index),
          k.sendPacket(b),
          !1
        );
    }
    function c(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function d(a) {
      a.stopImmediatePropagation();
      a = parseInt(this.getAttribute("data-index"), 10);
      a = p.getItemByIndex(a);
      if (!a) return !1;
      if (v.index === a.index) return (v.remove(), !1);
      v.append();
      v.uid = a.ITID;
      v.index = a.index;
      v.setItem(a);
      return !1;
    }
    function e(a) {
      if (
        !(a < E + 100) &&
        ((E = a),
        F < B[O].amount &&
          l.loadFile(
            m.INTERFACE_PATH +
              "refining_renewal/" +
              B[O].TextureName +
              "_" +
              (1 < F.toString().length ? F : "0" + F) +
              ".bmp",
            function (a) {
              C.ui.find(".head img").attr("src", a);
              F++;
              B[O].repeat
                ? F > B[O].amount - 1 && (F = B[O].start | 0)
                : B[O].next &&
                  F > B[O].amount - 1 &&
                  ((O = B[O].next), C.setStep(O));
            },
          ),
        3 == O && F >= B[O].amount && 0 == M)
      )
        return (
          (M = !0),
          (a = new g.CZ.REFINE_ITEM_REQUEST()),
          (a.index = y.index),
          (a.material = J),
          (a.catalyst = L),
          k.sendPacket(a),
          !1
        );
    }
    var m = a("DB/DBManager"),
      h = a("Utils/jquery");
    a("Utils/Texture");
    var r = a("Renderer/Renderer"),
      q = a("Engine/SessionStorage"),
      k = a("Network/NetworkManager"),
      g = a("Network/PacketStructure"),
      t = a("Core/Configs"),
      l = a("Core/Client"),
      f = a("UI/UIManager"),
      n = a("UI/UIComponent"),
      p = a("UI/Components/Inventory/Inventory"),
      v = a("UI/Components/ItemInfo/ItemInfo"),
      u = a("UI/Components/ItemObtain/ItemObtain"),
      A = a("UI/Components/ChatBox/ChatBox"),
      D = a("text!./RefineUI.html");
    a = a("text!./RefineUI.css");
    t.get("ClientVer");
    var B = {
        1: {
          TextureName: "bg_refining_wait",
          amount: 4,
          repeat: !0,
          start: 0,
          next: 0,
        },
        2: {
          TextureName: "bg_refininga_ready",
          amount: 3,
          repeat: !1,
          start: 0,
          next: 0,
        },
        3: {
          TextureName: "bg_refininga_process",
          amount: 14,
          repeat: !1,
          start: 0,
          next: 0,
        },
        4: {
          TextureName: "bg_refining_success",
          amount: 17,
          repeat: !1,
          start: 0,
          next: 5,
        },
        5: {
          TextureName: "bg_refining_success",
          amount: 17,
          repeat: !0,
          start: 5,
          next: 0,
        },
        6: {
          TextureName: "bg_refining_fail",
          amount: 20,
          repeat: !0,
          start: 5,
          next: 0,
        },
        7: {
          TextureName: "bg_refining_fail",
          amount: 20,
          repeat: !0,
          start: 5,
          next: 0,
        },
        length: 5,
      },
      O = 1,
      C = new n("RefineUI", D, a),
      y,
      z = {},
      J = 0,
      I = 0,
      L = 0,
      x = 0,
      M = !1;
    C.init = function () {
      this.ui.find(".footer .close").on("click", function () {
        r.stop(e);
        C.remove();
        var a = new g.CZ.REFINE_WINDOW_CLOSE();
        k.sendPacket(a);
      });
      this.ui
        .on("drop", b)
        .on("dragover", c)
        .find(".mainEquip .container")
        .on("contextmenu", ".item", d);
      this.ui.find(".materials .container").on("click", ".item", function () {
        h(".materials .item").removeClass("sd");
        h(this).addClass("sd");
        h(".materials .item").css("backgroundImage", "none");
        var a = parseInt(this.getAttribute("data-itid"), 10),
          b = C.ui.find(".head .materials .container"),
          c = h(this).index();
        J = a;
        I = c;
        h(this).find(".count").attr("data-count");
        l.loadFile(
          m.INTERFACE_PATH +
            (4 == c
              ? "refining_renewal/slot_select_red.bmp"
              : "refining_renewal/slot_select_blue3.bmp"),
          function (c) {
            b.find('.item[data-itid\x3d"' + a + '"]').css(
              "backgroundImage",
              "url(" + c + ")",
            );
          },
        );
        var d = z[c].chance;
        C.ui
          .find(".titlebar")
          .html(
            "\x3cp\x3e\u6210\u529f \x3cspan class\x3d'rate'\x3e" +
              d +
              "%\x3c/span\x3e\x3c/p\x3e",
          );
        c = z[c].zeny;
        C.ui.find(".refine .btn .price").text(c);
        var c = m.getItemInfo(a),
          d = h(this).position(),
          e = C.ui.find(".overlay");
        e.show();
        e.css({ top: d.top - 28, left: d.left });
        e.text(c.identifiedDiSPlayName);
        c.IsIdentified ? e.removeClass("grey") : e.addClass("grey");
      });
      this.ui
        .find(".materials .container")
        .on("click", ".blessing", function () {
          var a = parseInt(this.getAttribute("data-itid"), 10),
            b = p.getItemById(a);
          if (!b || b.count < x)
            return (
              u.setMsg("\u9632\u7206\u6750\u6599\u6570\u91cf\u4e0d\u8db3"),
              !1
            );
          if (h(this).hasClass("sd"))
            ((L = 0),
              u.setMsg("\u53d6\u6d88\u4f7f\u7528\u9632\u7206\u6750\u6599"),
              A.addText(
                "\u53d6\u6d88\u4f7f\u7528\u9632\u7206\u6750\u6599",
                A.TYPE.INFO,
              ),
              h(".materials .blessing").removeClass("sd"),
              h(".materials .blessing").css("backgroundImage", "none"));
          else {
            L = 1;
            u.setMsg("\u4f7f\u7528\u9632\u7206\u6750\u6599");
            A.addText("\u4f7f\u7528\u9632\u7206\u6750\u6599", A.TYPE.INFO);
            h(".materials .blessing").removeClass("sd");
            h(this).addClass("sd");
            h(".materials .blessing").css("backgroundImage", "none");
            var c = C.ui.find(".head .materials .container");
            h(this).index();
            l.loadFile(
              m.INTERFACE_PATH + "refining_renewal/slot_select_red.bmp",
              function (b) {
                c.find('.blessing[data-itid\x3d"' + a + '"]').css(
                  "backgroundImage",
                  "url(" + b + ")",
                );
              },
            );
            var b = m.getItemInfo(a),
              d = h(this).position(),
              e = C.ui.find(".overlay");
            e.show();
            e.css({ top: d.top - 28, left: d.left });
            e.text(b.identifiedDiSPlayName);
            b.IsIdentified ? e.removeClass("grey") : e.addClass("grey");
          }
        });
      this.ui
        .find(".materials .container")
        .on("mouseout", ".item.sd", function () {
          C.ui.find(".overlay").hide();
        });
      this.ui.find(".refine .btn").on("click", function () {
        if (!J)
          return (u.setMsg("\u8bf7\u9009\u62e9\u7cbe\u70bc\u6750\u6599"), !1);
        var a = p.getItemById(J),
          b = q.zeny;
        if (!a || 0 >= a.count)
          return (u.setMsg("\u6750\u6599\u6570\u91cf\u4e0d\u8db3"), !1);
        if (b < z[I].zeny)
          return (u.setMsg("\u6e38\u620f\u5e01\u4e0d\u8db3"), !1);
        if (L && ((a = p.getItemById(6635)), !a || a.count < x))
          return (
            u.setMsg("\u9632\u7206\u6750\u6599\u6570\u91cf\u4e0d\u8db3"),
            !1
          );
        C.setStep(3);
      });
      this.ui.find(".btns .btn.back").on("click", function () {
        C.setStep(1);
      });
      this.ui.find(".btns .btn.reRefine").on("click", function () {
        if (!J) return (u.setMsg("\u8bf7\u9009\u62e9\u6750\u6599"), !1);
        var a = p.getItemById(J),
          b = q.zeny;
        if (!a || 0 >= a.count)
          return (u.setMsg("\u6750\u6599\u6570\u91cf\u4e0d\u8db3"), !1);
        if (b < z[I].zeny)
          return (u.setMsg("\u6e38\u620f\u5e01\u4e0d\u8db3"), !1);
        if (L && ((a = p.getItemById(6635)), !a || a.count < x))
          return (
            u.setMsg("\u9632\u7206\u6750\u6599\u6570\u91cf\u4e0d\u8db3"),
            !1
          );
        C.setStep(3);
      });
    };
    C.onAppend = function () {};
    C.onRemove = function () {
      x = L = 0;
      y = null;
      I = J = 0;
      z = {};
    };
    C.toggle = function () {
      C.restore();
      C.setStep(1);
      r.render(e);
    };
    C.clean = function () {};
    C.setData = function (a) {
      for (var b = 0, c = 0; c < z.length; c++)
        if (z[c].itemId != a.items[c].itemId) {
          b = 1;
          break;
        }
      x != a.count && (b = 1);
      1 == b && C.setStep(1);
      a && (z = a.items);
      if ((b = p.getItemByIndex(a.index)))
        (p.ui.hide(), v.remove(), C.throwInItem(b));
      if (z.length) {
        var d = C.ui.find(".head .materials .container");
        d.empty();
        for (c = 0; c < z.length; c++) C.throwInMaterial(z[c]);
        C.ui.find(".rate").text(z[I].chance + "%");
      }
      if (a.count) {
        var b = m.getItemInfo(6635),
          c = p.getItemById(6635),
          e = 0;
        c && (e = c.count);
        x = a.count;
        d = C.ui.find(".head .materials .container");
        d.append(
          '\x3cdiv class\x3d"blessing" data-itid\x3d"6635"\x3e\x3cdiv class\x3d"border"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"description"\x3e\x3cspan class\x3d"count"\x3e' +
            e +
            " / " +
            a.count +
            '\x3c/span\x3e\x3cspan class\x3d"name"\x3e\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"shadow"\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e',
        );
        l.loadFile(
          m.INTERFACE_PATH + "item/" + b.identifiedResourceName + ".bmp",
          function (a) {
            d.find('.blessing[data-itid\x3d"6635"] .icon').css(
              "backgroundImage",
              "url(" + a + ")",
            );
          },
        );
      }
      4 != O && 6 != O && 7 != O && C.setStep(2);
    };
    C.throwInItem = function (a) {
      y = a;
      var b = m.getItemInfo(a.ITID),
        c = C.ui.find(".mainEquip .container");
      c.empty();
      c.append(
        '\x3cdiv class\x3d"item" data-index\x3d"' +
          a.index +
          '"\x3e\x3cdiv class\x3d"border"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"description"\x3e\x3cspan class\x3d"count"\x3e\x3c/span\x3e\x3cspan class\x3d"name"\x3e' +
          m.getItemName(a) +
          '\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"shadow"\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      l.loadFile(
        m.INTERFACE_PATH + "item/" + b.identifiedResourceName + ".bmp",
        function (b) {
          c.find('.item[data-index\x3d"' + a.index + '"] .icon').css(
            "backgroundImage",
            "url(" + b + ")",
          );
        },
      );
    };
    C.throwInMaterial = function (a) {
      var b = a.itemId;
      a = m.getItemInfo(a.itemId);
      var c = p.getItemById(b),
        d = 0;
      c && (d = c.count);
      var e = C.ui.find(".head .materials .container");
      e.append(
        '\x3cdiv class\x3d"item" data-itid\x3d"' +
          b +
          '"\x3e\x3cdiv class\x3d"border"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"description"\x3e\x3cspan class\x3d"count"\x3e' +
          d +
          ' / 1\x3c/span\x3e\x3cspan class\x3d"name"\x3e\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"shadow"\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      l.loadFile(
        m.INTERFACE_PATH + "item/" + a.identifiedResourceName + ".bmp",
        function (a) {
          e.find('.item[data-itid\x3d"' + b + '"] .icon').css(
            "backgroundImage",
            "url(" + a + ")",
          );
        },
      );
    };
    C.setStep = function (a) {
      O = a;
      F = F = B[O].start | 0;
      switch (a) {
        case 1:
          C.restore();
          break;
        case 2:
          C.ui.find(".titlebar").show();
          C.ui.find(".materials").show();
          C.ui.find(".blessMaterial").show();
          C.ui.find(".refine").show();
          C.ui.find(".btns").hide();
          break;
        case 3:
          M = !1;
          C.ui.find(".titlebar").hide();
          C.ui.find(".materials").hide();
          C.ui.find(".blessMaterial").hide();
          C.ui.find(".refine").hide();
          C.ui.find(".btns").hide();
          C.ui.find(".titlebar").empty();
          C.ui.find(".head .blessMaterial").empty();
          C.ui.find(".head .materials .container").empty();
          C.ui.find(".refine .btn .price").empty();
          break;
        case 4:
          C.ui
            .find(".btns .btn.reRefine .rate")
            .text("\u6982\u7387\uff1a" + z[I].chance + "%");
          C.ui.find(".btns .btn.reRefine .zeny").text(z[I].zeny);
          C.ui
            .find(".titlebar")
            .html("\x3cp\x3e\u7cbe\u70bc\u6210\u529f\x3c/p\x3e")
            .show();
          C.ui.find(".btns").show();
          C.ui.find(".btns .reRefine").show();
          break;
        case 6:
          C.ui.find(".mainEquip .container").empty();
          C.ui
            .find(".titlebar")
            .html("\x3cp\x3e\u7cbe\u70bc\u5931\u8d25\x3c/p\x3e")
            .show();
          C.ui.find(".btns").show();
          C.ui.find(".btns .reRefine").hide();
          break;
        case 7:
          (C.ui
            .find(".btns .btn.reRefine .rate")
            .text("\u6982\u7387\uff1a" + z[I].chance + "%"),
            C.ui.find(".btns .btn.reRefine .zeny").text(z[I].zeny),
            C.ui
              .find(".titlebar")
              .html("\x3cp\x3e\u7cbe\u70bc\u5931\u8d25\x3c/p\x3e")
              .show(),
            C.ui.find(".btns").show(),
            C.ui.find(".btns .reRefine").show());
      }
    };
    C.cancelItem = function (a) {
      C.restore();
      C.setStep(1);
    };
    C.restore = function () {
      x = L = 0;
      y = null;
      I = J = 0;
      M = !1;
      z = {};
      C.ui.find(".titlebar").hide();
      C.ui.find(".materials").hide();
      C.ui.find(".blessMaterial").hide();
      C.ui.find(".refine").hide();
      C.ui.find(".btns").hide();
      C.ui.find(".titlebar").empty();
      C.ui.find(".head .blessMaterial").empty();
      C.ui.find(".head .materials .container").empty();
      C.ui.find(".mainEquip .container").empty();
      C.ui.find(".refine .btn").css("backgroundImage", "none");
      C.ui.find(".refine .btn .price").empty();
      C.ui.find(".btns .btn.reRefine .rate").empty();
      C.ui.find(".btns .btn.reRefine .zeny").empty();
    };
    var E = 0,
      F = B[O].start | 0;
    return f.addComponent(C);
  },
);
