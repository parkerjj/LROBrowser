define(
  "UI/Components/ItemReform/ItemReform",
  "require Utils/jquery DB/DBManager Core/Client Renderer/Renderer Network/NetworkManager Network/PacketStructure UI/UIManager UI/UIComponent UI/Components/Inventory/Inventory UI/Components/ItemInfo/ItemInfo text!./ItemReform.html text!./ItemReform.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = p.ui.find(".main .right"),
        c = m.getItemInfo(a.ITID),
        d = e(
          '\x3cbutton class\x3d"item" data-index\x3d"' +
            a.index +
            '" data-itid\x3d"' +
            a.ITID +
            '" data-background\x3d"reformui/btn_reform_item.bmp" data-hover\x3d"reformui/btn_reform_item_over.bmp" data-down\x3d"reformui/btn_reform_item_press.bmp"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e' +
            e.escape(m.getItemName(a)) +
            "\x3c/div\x3e\x3c/button\x3e",
        );
      h.loadFile(
        m.INTERFACE_PATH +
          "item/" +
          (a.IsIdentified
            ? c.identifiedResourceName
            : c.unidentifiedResourceName) +
          ".bmp",
        function (a) {
          d.find(".icon:first").css("backgroundImage", "url(" + a + ")");
        },
      );
      b.append(d);
    }
    function c(a, b) {
      var c = p.ui.find(".main .left_header_top"),
        f = p.ui.find(".main .left_header_bottom"),
        g = l.getItemByReformLimits(a);
      g
        ? (g.count || (g.count = 1), (A = g.index))
        : ((D = !1),
          (g = {
            ITID: a.BaseItem,
            IsIdentified: !0,
            RefiningLevel: a.NeedRefineMin,
            index: -1,
            count: 0,
          }));
      var k = {
          ITID: a.ResultItem,
          IsIdentified: !0,
          RefiningLevel: g.RefiningLevel + a.ChangeRefineValue,
        },
        n = m.getItemInfo(a.ResultItem),
        q = m.getItemInfo(a.BaseItem);
      b = e(
        '\x3cdiv class\x3d"item result" data-itid\x3d"' +
          a.ResultItem +
          '" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"item base" data-index\x3d"' +
          b +
          '" data-itid\x3d"' +
          a.BaseItem +
          '" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e' +
          e.escape(m.getItemName(k)) +
          "\x3c/div\x3e",
      );
      c.append(b);
      f.append(
        '\x3cdiv class\x3d"item" data-index\x3d"' +
          g.index +
          '" data-itid\x3d"' +
          g.ITID +
          '" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
          g.count +
          "/1 \x3c/div\x3e\x3c/div\x3e",
      );
      h.loadFile(
        m.INTERFACE_PATH + "item/" + n.identifiedResourceName + ".bmp",
        function (b) {
          c.find('.item[data-itid\x3d"' + a.ResultItem + '"] .icon').css(
            "backgroundImage",
            "url(" + b + ")",
          );
        },
      );
      h.loadFile(
        m.INTERFACE_PATH + "item/" + q.identifiedResourceName + ".bmp",
        function (b) {
          c.find('.item[data-itid\x3d"' + a.BaseItem + '"] .icon').css(
            "backgroundImage",
            "url(" + b + ")",
          );
          f.find('.item[data-itid\x3d"' + a.BaseItem + '"] .icon').css(
            "backgroundImage",
            "url(" + b + ")",
          );
        },
      );
      g = Object.keys(a.Material);
      for (n = 0; n < g.length; n++) {
        q = parseInt(g[n]);
        b = a.Material[q];
        var k = m.getItemInfo(q),
          t = l.getItemById(q);
        t || (t = { ITID: q, IsIdentified: !0, count: 0 });
        f.append(
          '\x3cdiv class\x3d"item" data-itid\x3d"' +
            q +
            '" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
            t.count +
            "/" +
            b +
            " \x3c/div\x3e\x3c/div\x3e",
        );
        t.count < b && (D = !1);
        d(f, t, k);
      }
    }
    function d(a, b, c) {
      h.loadFile(
        m.INTERFACE_PATH + "item/" + c.identifiedResourceName + ".bmp",
        function (c) {
          a.find('.item[data-itid\x3d"' + b.ITID + '"] .icon').css(
            "backgroundImage",
            "url(" + c + ")",
          );
        },
      );
    }
    var e = a("Utils/jquery"),
      m = a("DB/DBManager"),
      h = a("Core/Client"),
      r = a("Renderer/Renderer"),
      q = a("Network/NetworkManager"),
      k = a("Network/PacketStructure"),
      g = a("UI/UIManager"),
      t = a("UI/UIComponent"),
      l = a("UI/Components/Inventory/Inventory"),
      f = a("UI/Components/ItemInfo/ItemInfo"),
      n = a("text!./ItemReform.html");
    a = a("text!./ItemReform.css");
    var p = new t("ItemReform", n, a),
      v = [],
      u = -1,
      A = -1,
      D = !0,
      B = null;
    p.init = function () {
      p.ui.find(".close").on("click", function () {
        var a = new k.CZ.CLOSE_REFORM_UI();
        q.sendPacket(a);
        p.remove();
      });
      p.ui.find(".apply").on("click", function () {
        if (-1 == u || -1 == A || !D) return !1;
        var a = new k.CZ.ITEM_REFORM();
        a.ITID = u;
        a.index = A;
        q.sendPacket(a);
      });
      p.ui.find(".left").on("contextmenu", ".item", function () {
        var a = parseInt(this.getAttribute("data-itid"), 10),
          b = parseInt(this.getAttribute("data-index"), 10);
        (b = l.getItemByIndex(b)) ||
          (b =
            a == B.BaseItem
              ? { ITID: a, IsIdentified: !0, RefiningLevel: B.NeedRefineMin }
              : a == B.ResultItem
                ? {
                    ITID: a,
                    IsIdentified: !0,
                    RefiningLevel: B.NeedRefineMin + B.ChangeRefineValue,
                  }
                : { ITID: a, IsIdentified: !0 });
        if (f.uid === b.ITID) return (f.remove(), !1);
        f.append();
        f.uid = b.ITID;
        f.item_ = b;
        f.setItem(b);
        return !1;
      });
      p.ui.find(".right").on("click", ".item", function () {
        p.ui.find(".main .left_header_top").empty();
        p.ui.find(".main .left_header_bottom").empty();
        D = !0;
        var a = parseInt(this.getAttribute("data-itid"), 10),
          b = parseInt(this.getAttribute("data-index"), 10);
        p.ui.find(".item.sd").removeClass("sd");
        e(this).addClass("sd");
        A = b;
        a: {
          for (var d = 0; d < v.length; d++) {
            var f = m.ItemReformInfo[v[d]];
            if (f && f.ResultItem == a) {
              B = f;
              break a;
            }
          }
          B = void 0;
        }
        c(B, b);
      });
      this.draggable(this.ui.find(".title"));
    };
    p.onAppend = function () {
      this.ui.css({
        top: 0.5 * (r.height - this.ui.height()),
        left: 0.5 * (r.width - this.ui.width()),
      });
    };
    p.onRemove = function () {
      v = [];
      A = u = -1;
      D = !0;
      B = null;
      this.ui.find(".main .right").empty();
      this.ui.find(".main .left_header_top").empty();
      this.ui.find(".main .left_header_bottom").empty();
    };
    p.setData = function (a) {
      var c = m.getItemInfo(a);
      this.ui.find(".title_bar .title").text(c.identifiedDiSPlayName);
      u = a;
      v = m.ItemReformList[a];
      if (0 == v.length) return !1;
      for (a = 0; a < v.length; a++)
        (c = m.ItemReformInfo[v[a]]) &&
          b({ ITID: c.ResultItem, IsIdentified: !0, index: -1 });
    };
    return g.addComponent(p);
  },
);
