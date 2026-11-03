define(
  "UI/Components/LaphineUpgrade/LaphineUpgrade",
  "require Utils/jquery DB/DBManager Core/Client Renderer/Renderer Network/NetworkManager Network/PacketStructure UI/UIManager UI/UIComponent UI/Components/Inventory/Inventory UI/Components/ItemInfo/ItemInfo text!./LaphineUpgrade.html text!./LaphineUpgrade.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = k.ui.find(".main .right"),
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
      var b = k.ui.find(".main .left .left_header_bottom"),
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
      t = a("Network/NetworkManager"),
      r = a("Network/PacketStructure"),
      n = a("UI/UIManager"),
      g = a("UI/UIComponent"),
      p = a("UI/Components/Inventory/Inventory"),
      l = a("UI/Components/ItemInfo/ItemInfo"),
      f = a("text!./LaphineUpgrade.html");
    a = a("text!./LaphineUpgrade.css");
    var k = new g("LaphineUpgrade", f, a),
      q = -1,
      u = -1,
      v = [],
      A = 0;
    k.init = function () {
      k.ui.find(".close").on("click", function () {
        var a = new r.CZ.RANDOM_UPGRADE_ITEM_UI_CLOSE();
        t.sendPacket(a);
        k.remove();
      });
      k.ui.find(".apply").on("click", function () {
        if (-1 == q || -1 == u || 0 == A) return !1;
        var a = new r.CZ.REQ_RANDOM_UPGRADE_ITEM();
        a.ITID = q;
        a.index = u;
        t.sendPacket(a);
      });
      k.ui.find(".left").on("contextmenu", ".item", function () {
        var a = parseInt(this.getAttribute("data-itid"), 10),
          b = parseInt(this.getAttribute("data-index"), 10);
        (b = p.getItemByIndex(b)) || (b = { ITID: a, IsIdentified: !0 });
        if (l.uid === b.ITID) return (l.remove(), !1);
        l.append();
        l.uid = b.ITID;
        l.item_ = b;
        l.setItem(b);
        return !1;
      });
      k.ui.find(".right").on("contextmenu", ".item", function () {
        var a = parseInt(this.getAttribute("data-itid"), 10),
          b = parseInt(this.getAttribute("data-index"), 10);
        (b = p.getItemByIndex(b)) || (b = { ITID: a, IsIdentified: !0 });
        if (l.uid === b.ITID) return (l.remove(), !1);
        l.append();
        l.uid = b.ITID;
        l.item_ = b;
        l.setItem(b);
        return !1;
      });
      k.ui.find(".right").on("click", ".item", function () {
        parseInt(this.getAttribute("data-itid"), 10);
        var a = parseInt(this.getAttribute("data-index"), 10),
          b;
        a: {
          for (b = 0; b < v.length; b++)
            if (v[b].index == a) {
              b = v[b];
              break a;
            }
          b = void 0;
        }
        b &&
          (d(this).hasClass("disabled")
            ? ((u = -1),
              A--,
              d(this).removeClass("disabled").attr("disabled", !1),
              (a = b),
              k.ui
                .find(".main .left .left_header_bottom")
                .find('.item[data-index\x3d"' + a.index + '"]')
                .remove())
            : 0 == A &&
              ((u = a),
              d(this).addClass("disabled").attr("disabled", !0),
              A++,
              c(b)));
      });
      this.draggable(this.ui.find(".title"));
    };
    k.onAppend = function () {
      this.ui.css({
        top: 0.5 * (h.height - this.ui.height()),
        left: 0.5 * (h.width - this.ui.width()),
      });
    };
    k.onRemove = function () {
      v = [];
      u = q = -1;
      A = 0;
      this.ui.find(".main .right").empty();
      this.ui.find(".main .left_header_top .materialString").empty();
      this.ui.find(".main .left_header_bottom").empty();
    };
    k.setData = function (a) {
      var c = e.getItemInfo(a);
      this.ui.find(".title_bar .title").text(c.identifiedDiSPlayName);
      q = a;
      a = e.getLaphineUpgradeItem(a);
      if (!a) return !1;
      this.ui.find(".left .materialString").text(a.NeedSource_String);
      if ((v = p.getItemByUpgradeLimits(a)))
        for (a = 0; a < v.length; a++) b(v[a]);
    };
    return n.addComponent(k);
  },
);
