define(
  "UI/Components/ItemInfo/ItemInfo",
  "require Utils/jquery DB/DBManager DB/Items/Randomoption DB/Items/ItemType Core/Client Core/Configs Controls/KeyEventHandler UI/Components/CardIllustration/CardIllustration UI/UIManager UI/UIComponent text!./ItemInfo.html text!./ItemInfo.css".split(
    " ",
  ),
  function (a) {
    function b(a, b, e, g) {
      var k = "",
        l = d.getItemInfo(b);
      b && l
        ? ((g = "item/" + l.identifiedResourceName + ".bmp"),
          (k =
            '\x3cdiv class\x3d"name"\x3e' +
            c.escape(l.identifiedDiSPlayName) +
            "\x3c/div\x3e"))
        : (g = e < g ? "empty_card_slot.bmp" : "disable_card_slot.bmp");
      a.append(
        '\x3cdiv class\x3d"item" data-index\x3d"' +
          e +
          '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e' +
          k +
          "\x3c/div\x3e",
      );
      h.loadFile(d.INTERFACE_PATH + g, function (c) {
        var d = a.find('.item[data-index\x3d"' + e + '"] .icon');
        d.css("backgroundImage", "url(" + c + ")");
        if (b && l)
          d.on("contextmenu", function () {
            f.setItem({ ITID: b, IsIdentified: !0, type: 6 });
            return !1;
          });
      });
    }
    var c = a("Utils/jquery"),
      d = a("DB/DBManager"),
      e = a("DB/Items/Randomoption"),
      m = a("DB/Items/ItemType"),
      h = a("Core/Client"),
      r = a("Core/Configs"),
      q = a("Controls/KeyEventHandler"),
      k = a("UI/Components/CardIllustration/CardIllustration"),
      g = a("UI/UIManager"),
      t = a("UI/UIComponent"),
      l = a("text!./ItemInfo.html");
    a = a("text!./ItemInfo.css");
    var f = new t("ItemInfo", l, a);
    f.uid = -1;
    f.index = -1;
    var n = r.get("ClientVer");
    f.onKeyDown = function (a) {
      return a.which === q.ESCAPE
        ? (f.remove(), a.stopImmediatePropagation(), !1)
        : !0;
    };
    f.onAppend = function () {
      var a = c._data(window, "events").keydown;
      a.unshift(a.pop());
    };
    f.onRemove = function () {
      this.index = this.uid = -1;
    };
    f.init = function () {
      this.ui.css({ top: 200, left: 200 });
      this.ui
        .find(".close")
        .mousedown(function (a) {
          a.stopImmediatePropagation();
          return !1;
        })
        .click(this.remove.bind(this));
      this.ui.find(".view").click(
        function () {
          k.append();
          k.setCard(this.item);
        }.bind(this),
      );
      this.draggable(this.ui.find(".title"));
    };
    f.setItem = function (a) {
      var c = d.getItemInfo(a.ITID),
        f = this.ui,
        g = f.find(".cardlist .border"),
        k = f.find(".effectlist");
      this.item = c;
      h.loadFile(
        d.INTERFACE_PATH +
          "collection/" +
          (a.IsIdentified
            ? c.identifiedResourceName
            : c.unidentifiedResourceName) +
          ".bmp",
        function (a) {
          f.find(".collection").css("backgroundImage", "url(" + a + ")");
        },
      );
      f.find(".title").text(
        a.IsIdentified
          ? d.getItemName(a) +
              (a.slot && 4700 <= a.slot.card4
                ? " ^733C77[" +
                  d.getItemInfo(a.slot.card4).identifiedDiSPlayName +
                  "]^000000 "
                : "")
          : c.unidentifiedDiSPlayName,
      );
      0 < a.IsDamaged &&
        f
          .find(".title")
          .append(
            '[\x3cspan style\x3d"color:red"\x3e\u5df2\u635f\u574f\x3c/span\x3e]',
          );
      5 != n ||
        (4 != a.type && 5 != a.type) ||
        (0 < a.bindOnEquipType
          ? f
              .find(".title")
              .append("\x3cspan\x3e[\u5df2\u7ed1\u5b9a]\x3c/span\x3e")
          : f
              .find(".title")
              .append("\x3cspan\x3e[\u672a\u7ed1\u5b9a]\x3c/span\x3e"));
      "card" == this.type || "attachMagic" == this.type
        ? f.find(".description").text(c.identifiedDescriptionName)
        : f
            .find(".description")
            .text(
              a.IsIdentified
                ? c.identifiedDescriptionName
                : "\u5c1a\u672a\u9274\u5b9a\uff0c\u53ef\u4f7f\u7528[\u653e\u5927\u955c]\u8fdb\u884c\u9274\u5b9a\u3002",
            );
      a.IsIdentified &&
        f
          .find(".description")
          .prepend(
            "\x3cspan style\x3d'color:#ccc'\x3eID:" +
              a.ITID +
              "\x3c/span\x3e\x3cbr\x3e",
          );
      if (a.HireExpireDate) {
        var l, p, q, t;
        l = new Date(1e3 * a.HireExpireDate);
        l.getFullYear();
        p =
          (10 > l.getMonth() + 1
            ? "0" + (l.getMonth() + 1)
            : l.getMonth() + 1) + "\u6708 ";
        q = l.getDate() + "\u65e5 ";
        t = l.getHours() + "\u65f6";
        l.getMinutes();
        l.getSeconds();
        f.find(".description").prepend(
          '\x3cp style\x3d"color:red;margin:0;"\x3e\u6d88\u5931\u65f6\u95f4\uff1a' +
            p +
            q +
            t +
            "\x3c/p\x3e",
        );
      }
      a.type === m.CARD ? f.find(".view").show() : f.find(".view").hide();
      switch (a.type) {
        default:
          g.parent().hide();
          k.hide();
          break;
        case m.WEAPON:
        case m.EQUIP:
        case m.FASHION:
          if (!a.IsIdentified) {
            g.parent().hide();
            k.hide();
            return;
          }
          l = c.slotCount || 0;
          g.parent().show();
          g.empty();
          for (c = 0; 4 > c; ++c)
            b(g, (a.slot && a.slot["card" + (c + 1)]) || 0, c, l);
          a.slot && 255 == a.slot.card1 && g.parent().hide();
      }
      g = 0;
      if (a.options) for (c = 0; 5 > c; c++) a.options["Index" + c] && g++;
      if (0 < g)
        for (k.show(), k.empty(), c = 0; 5 > c; c++)
          a.options["Index" + c] &&
            k.append(
              "\x3cdiv class\x3d'border'\x3e\x3cp\x3e" +
                e[a.options["Index" + c]].replace(
                  "%d",
                  a.options["Value" + c],
                ) +
                "\x3c/p\x3e\x3c/div\x3e",
            );
      else (k.hide(), k.empty());
    };
    return g.addComponent(f);
  },
);
