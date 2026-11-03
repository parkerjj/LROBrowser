define(
  "UI/Components/LaphineSynthesis/LaphineSynthesis",
  "require Utils/jquery DB/DBManager Core/Client Renderer/Renderer Network/NetworkManager Network/PacketStructure UI/UIManager UI/UIComponent UI/Components/Inventory/Inventory UI/Components/ItemInfo/ItemInfo text!./LaphineSynthesis.html text!./LaphineSynthesis.css".split(
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
            '" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
            a.needAmount +
            '\x3c/div\x3e\x3cdiv class\x3d"shadow"\x3e\x3c/div\x3e\x3c/div\x3e',
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
      f = a("text!./LaphineSynthesis.html");
    a = a("text!./LaphineSynthesis.css");
    var k = new g("LaphineSynthesis", f, a),
      q = -1,
      u = [],
      v = [],
      A = 0,
      C = 0;
    k.init = function () {
      k.ui.find(".close").on("click", function () {
        var a = new r.CZ.RANDOM_COMBINE_ITEM_UI_CLOSE();
        t.sendPacket(a);
        k.remove();
      });
      k.ui.find(".apply").on("click", function () {
        if (0 == v.length || A < C) return !1;
        var a = new r.CZ.REQ_RANDOM_COMBINE_ITEM();
        a.ITID = q;
        a.list = v;
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
        var a = parseInt(this.getAttribute("data-index"), 10);
        a: {
          for (var b = 0; b < u.length; b++)
            if (u[b].index == a) {
              a = u[b];
              break a;
            }
          a = void 0;
        }
        if (a)
          if (d(this).hasClass("disabled")) {
            for (var b = -1, e = 0; e < v.length; e++)
              v[e].index == a.index && (b = e);
            -1 < b &&
              (v.splice(b, 1),
              A--,
              k.ui.find(".main .left_header_top .materialCurAmount").text(A),
              (b = (b = d(this).find(".amount").text())
                ? parseInt(b) + a.needAmount
                : a.needAmount),
              d(this)
                .find(".amount")
                .text(0 == b ? "" : b),
              d(this).removeClass("disabled").attr("disabled", !1),
              k.ui
                .find(".main .left .left_header_bottom")
                .find('.item[data-index\x3d"' + a.index + '"]')
                .remove());
          } else
            A < C &&
              ((b = { index: a.index, count: a.needAmount }),
              v.push(b),
              (b = a.count || 1),
              (b -= a.needAmount),
              d(this)
                .find(".amount")
                .text(0 == b ? "" : b),
              d(this).addClass("disabled").attr("disabled", !0),
              A++,
              k.ui.find(".main .left_header_top .materialCurAmount").text(A),
              c(a));
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
      u = [];
      v = [];
      q = -1;
      C = A = 0;
      this.ui.find(".main .right").empty();
      this.ui.find(".main .left_header_top .materialString").empty();
      this.ui.find(".main .left_header_top .materialCurAmount").text(0);
      this.ui.find(".main .left_header_top .materialNeedAmount").text(0);
      this.ui.find(".main .left_header_bottom").empty();
    };
    k.setData = function (a) {
      var c = e.getItemInfo(a);
      this.ui.find(".title_bar .title").text(c.identifiedDiSPlayName);
      q = a;
      a = e.getLaphineItem(a);
      if (!a) return !1;
      this.ui.find(".left .materialString").text(a.NeedSource_String);
      C = a.NeedCount;
      this.ui.find(".left .materialNeedAmount").text(a.NeedCount);
      if ((u = p.getItemBySynthesisLimits(a)))
        for (a = 0; a < u.length; a++) b(u[a]);
    };
    return n.addComponent(k);
  },
);
