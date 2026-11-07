define(
  "UI/Components/LaphineUpgrade/LaphineUpgrade",
  "require Utils/jquery DB/DBManager Core/Client Renderer/Renderer Network/NetworkManager Network/PacketStructure UI/UIManager UI/UIComponent UI/Components/Inventory/Inventory UI/Components/ItemInfo/ItemInfo text!./LaphineUpgrade.html text!./LaphineUpgrade.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = n.ui.find(".main .right"),
        c = e.getItemInfo(a.ITID),
        f = d(
          '\x3cdiv class\x3d"item" data-index\x3d"' +
            a.index +
            '" data-itid\x3d"' +
            a.ITID +
            '" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e' +
            d.escape(e.getItemName(a)) +
            '\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
            (a.count || 1) +
            "\x3c/div\x3e\x3c/div\x3e",
        );
      m.loadFile(
        e.INTERFACE_PATH +
          "item/" +
          (a.IsIdentified
            ? c.identifiedResourceName
            : c.unidentifiedResourceName) +
          ".bmp",
        function (a) {
          f.find(".icon:first").css("backgroundImage", "url(" + a + ")");
        },
      );
      b.append(f);
    }
    function c(a) {
      var b = n.ui.find(".main .left .left_header_bottom"),
        c = e.getItemInfo(a.ITID),
        f = d(
          '\x3cdiv class\x3d"item" data-index\x3d"' +
            a.index +
            '" data-itid\x3d"' +
            a.ITID +
            '" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3c/div\x3e',
        );
      m.loadFile(
        e.INTERFACE_PATH +
          "item/" +
          (a.IsIdentified
            ? c.identifiedResourceName
            : c.unidentifiedResourceName) +
          ".bmp",
        function (a) {
          f.find(".icon:first").css("backgroundImage", "url(" + a + ")");
        },
      );
      b.append(f);
    }
    var d = a("Utils/jquery"),
      e = a("DB/DBManager"),
      m = a("Core/Client"),
      h = a("Renderer/Renderer"),
      r = a("Network/NetworkManager"),
      q = a("Network/PacketStructure"),
      k = a("UI/UIManager"),
      g = a("UI/UIComponent"),
      t = a("UI/Components/Inventory/Inventory"),
      l = a("UI/Components/ItemInfo/ItemInfo"),
      f = a("text!./LaphineUpgrade.html");
    a = a("text!./LaphineUpgrade.css");
    var n = new g("LaphineUpgrade", f, a),
      p = -1,
      v = -1,
      u = [],
      A = 0;
    n.init = function () {
      n.ui.find(".close").on("click", function () {
        var a = new q.CZ.RANDOM_UPGRADE_ITEM_UI_CLOSE();
        r.sendPacket(a);
        n.remove();
      });
      n.ui.find(".apply").on("click", function () {
        if (-1 == p || -1 == v || 0 == A) return !1;
        var a = new q.CZ.REQ_RANDOM_UPGRADE_ITEM();
        a.ITID = p;
        a.index = v;
        r.sendPacket(a);
      });
      n.ui.find(".left").on("contextmenu", ".item", function () {
        var a = parseInt(this.getAttribute("data-itid"), 10),
          b = parseInt(this.getAttribute("data-index"), 10);
        (b = t.getItemByIndex(b)) || (b = { ITID: a, IsIdentified: !0 });
        if (l.uid === b.ITID) return (l.remove(), !1);
        l.append();
        l.uid = b.ITID;
        l.item_ = b;
        l.setItem(b);
        return !1;
      });
      n.ui.find(".right").on("contextmenu", ".item", function () {
        var a = parseInt(this.getAttribute("data-itid"), 10),
          b = parseInt(this.getAttribute("data-index"), 10);
        (b = t.getItemByIndex(b)) || (b = { ITID: a, IsIdentified: !0 });
        if (l.uid === b.ITID) return (l.remove(), !1);
        l.append();
        l.uid = b.ITID;
        l.item_ = b;
        l.setItem(b);
        return !1;
      });
      n.ui.find(".right").on("click", ".item", function () {
        parseInt(this.getAttribute("data-itid"), 10);
        var a = parseInt(this.getAttribute("data-index"), 10),
          b;
        a: {
          for (b = 0; b < u.length; b++)
            if (u[b].index == a) {
              b = u[b];
              break a;
            }
          b = void 0;
        }
        b &&
          (d(this).hasClass("disabled")
            ? ((v = -1),
              A--,
              d(this).removeClass("disabled").attr("disabled", !1),
              (a = b),
              n.ui
                .find(".main .left .left_header_bottom")
                .find('.item[data-index\x3d"' + a.index + '"]')
                .remove())
            : 0 == A &&
              ((v = a),
              d(this).addClass("disabled").attr("disabled", !0),
              A++,
              c(b)));
      });
      this.draggable(this.ui.find(".title"));
    };
    n.onAppend = function () {
      this.ui.css({
        top: 0.5 * (h.height - this.ui.height()),
        left: 0.5 * (h.width - this.ui.width()),
      });
    };
    n.onRemove = function () {
      u = [];
      v = p = -1;
      A = 0;
      this.ui.find(".main .right").empty();
      this.ui.find(".main .left_header_top .materialString").empty();
      this.ui.find(".main .left_header_bottom").empty();
    };
    n.setData = function (a) {
      var c = e.getItemInfo(a);
      this.ui.find(".title_bar .title").text(c.identifiedDiSPlayName);
      p = a;
      a = e.getLaphineUpgradeItem(a);
      if (!a) return !1;
      this.ui.find(".left .materialString").text(a.NeedSource_String);
      if ((u = t.getItemByUpgradeLimits(a)))
        for (a = 0; a < u.length; a++) b(u[a]);
    };
    return k.addComponent(n);
  },
);
