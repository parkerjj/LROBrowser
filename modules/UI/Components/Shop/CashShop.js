define(
  "UI/Components/Shop/CashShop",
  "require DB/DBManager Utils/jquery Network/NetworkManager Network/PacketStructure Core/Client UI/UIManager UI/UIComponent UI/Components/ItemInfo/ItemInfo UI/Components/InputBox/InputBox text!./CashShop.html text!./CashShop.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a = parseInt(this.getAttribute("data-itid"), 10);
      var b = c.getItemInfo(a);
      b.ITID = a;
      b.IsIdentified = 1;
      b &&
        (k.uid != b.ITID
          ? (k.append(), (k.uid = b.ITID), (k.type = "CashShop"), k.setItem(b))
          : k.remove());
    }
    var c = a("DB/DBManager"),
      d = a("Utils/jquery"),
      e = a("Network/NetworkManager"),
      m = a("Network/PacketStructure"),
      h = a("Core/Client"),
      r = a("UI/UIManager"),
      q = a("UI/UIComponent"),
      k = a("UI/Components/ItemInfo/ItemInfo"),
      g = a("UI/Components/InputBox/InputBox"),
      t = a("text!./CashShop.html");
    a = a("text!./CashShop.css");
    var l = new q("CashShop", t, a),
      f = [],
      n = [],
      p = [],
      v = 1,
      u = 1,
      A = 0,
      D = 0;
    l.init = function () {
      d("#CashShopButton").on("mousedown", function () {
        if (!l.ui || !l.ui.is(":visible")) {
          l.ui.show();
          var a = new m.CZ.REQ_CASHSHOP_OPEN();
          e.sendPacket(a);
          event.stopImmediatePropagation();
        }
      });
      this.ui.find(".l_main").on("contextmenu", ".item", b);
      this.ui.find(".l_main").on("click", ".item .buy", function () {
        g.append();
        g.setType("number", !1, 1);
        var a = d(this).data("itid"),
          b = d(this).data("tab"),
          c = d(this).data("price");
        g.onSubmitRequest = function (d) {
          g.remove();
          for (var e = 0, h = 0; h < n.length; h++)
            n[h].id == a && ((n[h].count += d), (e = 1));
          if (0 == e) {
            if (6 <= n.length)
              return (
                r.showMessageBox(
                  "\u8d2d\u7269\u8f66\u6700\u591a\u653e6\u4e2a\u4e0d\u540c\u5546\u54c1",
                  "ok",
                  null,
                ),
                !1
              );
            for (e = 0; e < f[b].count; e++)
              f[b].itemList[e].ITID == a &&
                ((h = {}),
                (h.id = a),
                (h.count = d),
                (h.tab = b),
                (h.price = c),
                n.push(h));
          }
          l.setBuyItemList();
        };
      });
      this.ui.find(".titlebar .close").on("click", function () {
        l.ui.hide();
        var a = new m.CZ.REQ_CASHSHOP_CLOSE();
        e.sendPacket(a);
        event.stopImmediatePropagation();
      });
      this.ui.find(".r_header .close").on("click", function () {
        l.ui.find(".rightCont").removeClass("open");
      });
      this.ui.find(".r_main").on("blur", ".item .num", function () {
        if (0 < d(this).val())
          for (
            var a = d(this).parent().parent().parent(), b = 0;
            b < n.length;
            b++
          )
            n[b].id == a.data("itid") && (n[b].count = d(this).val());
        else
          for (a = d(this).parent().parent().parent(), b = 0; b < n.length; b++)
            n[b].id == a.data("itid") && (n.splice(b, 1), a.remove());
        l.calculatePrice();
      });
      this.ui.find(".r_main").on("click", ".item .close", function () {
        for (var a = d(this).parent().parent(), b = 0; b < n.length; b++)
          n[b].id == a.data("itid") && (n.splice(b, 1), a.remove());
        l.calculatePrice();
      });
      this.ui.find(".l_header button").on("click", function () {
        "saleCart" == d(this).attr("class")
          ? l.ui.find(".rightCont").addClass("open")
          : "search" == d(this).attr("class")
            ? ((D = 9),
              (v = 1),
              l.ui.find(".l_header .sd").removeClass("sd"),
              d(this).addClass("sd"),
              l.setSearchItems())
            : (l.ui.find(".l_header .sd").removeClass("sd"),
              d(this).addClass("sd"),
              d(this).data("tab") != D &&
                0 <= d(this).data("tab") &&
                ((v = 1), (D = d(this).data("tab")), l.setCashItems()));
      });
      this.ui.find(".l_main").on("click", ".prev", function () {
        1 < v && (--v, 9 == D ? l.setSearchItems() : l.setCashItems());
      });
      this.ui.find(".l_main").on("click", ".next", function () {
        v < u && ((v += 1), 9 == D ? l.setSearchItems() : l.setCashItems());
      });
      this.ui.find(".confirmBuy").on("click", function () {
        0 < n.length &&
          r.showPromptBox(
            "\u786e\u5b9a\u8d2d\u4e70\u5417\uff1f",
            "ok",
            "cancel",
            function () {
              for (var a = [], b = 0; b < n.length; b++) {
                var c = {};
                c.id = n[b].id;
                c.count = n[b].count;
                c.tab = n[b].tab;
                a.push(c);
              }
              b = new m.CZ.REQ_CASHSHOP_BUY();
              b.list = a;
              b.kafrapts = 0;
              e.sendPacket(b);
            },
            null,
          );
      });
      this.ui.find(".search_btn").on("click", function () {
        D = 9;
        v = 1;
        l.ui.find(".l_header .sd").removeClass("sd");
        l.ui.find(".l_header .search").addClass("sd");
        l.ui.find(".search .msg").val()
          ? l.searchItems(l.ui.find(".search .msg").val())
          : ((p = []), l.setSearchItems());
      });
      this.draggable(this.ui.find(".titlebar"));
    };
    l.onAppend = function () {};
    l.onRemove = function () {};
    l.setInit = function (a) {
      l.ui.find(".cashpoints .right").text(a.cashPoints);
      0 == f.length && ((a = new m.CZ.REQ_CASHSHOP_LIST()), e.sendPacket(a));
    };
    l.setList = function (a) {
      var b = {};
      b.count = a.count;
      b.itemList = a.itemList;
      b.tab = a.tab;
      f.push(b);
      l.setCashItems();
    };
    l.setPage = function () {
      u = 9 == D ? Math.ceil(p.length / 6) : Math.ceil(f[D].count / 6);
      l.ui
        .find(".l_main")
        .append(
          '\x3cdiv class\x3d"page"\x3e\x3cbutton class\x3d"prev"\x3e\u4e0a\u4e00\u9875\x3c/button\x3e\x3cspan class\x3d"currentPage"\x3e' +
            v +
            '\x3c/span\x3e / \x3cspan class\x3d"totalPages"\x3e' +
            u +
            '\x3c/span\x3e\x3cbutton class\x3d"next"\x3e\u4e0b\u4e00\u9875\x3c/button\x3e\x3c/div\x3e',
        );
    };
    l.setCashItems = function () {
      l.ui.find(".l_main").empty();
      if (f[D] && 0 < f[D].count) {
        for (var a = 6 * (v - 1); a < 6 * (v - 1) + 6; a++)
          f[D].itemList[a] && l.addCashItem(f[D].itemList[a], D);
        6 < f[D].count && l.setPage();
      } else
        l.ui
          .find(".l_main")
          .append(
            '\x3cdiv class\x3d"none"\x3e\u627e\u4e0d\u5230\u5546\u54c1\x3c/div\x3e',
          );
    };
    l.addCashItem = function (a, b) {
      var d = this.ui.find(".l_main"),
        e = c.getItemInfo(a.ITID);
      d.append(
        '\x3cdiv class\x3d"item" data-itid\x3d"' +
          a.ITID +
          '"\x3e\x3cdiv class\x3d"name"\x3e' +
          e.identifiedDiSPlayName +
          '\x3c/div\x3e\x3cdiv class\x3d"main"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"detailed"\x3e\x3cdiv class\x3d"price"\x3e' +
          a.price +
          '\x3c/div\x3e\x3cbutton class\x3d"buy" data-itid\x3d"' +
          a.ITID +
          '" data-price\x3d"' +
          a.price +
          '" data-tab\x3d"' +
          b +
          '"\x3e\u8d2d\u4e70\x3c/button\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      h.loadFile(
        c.INTERFACE_PATH + "basic_interface/price_bg.bmp",
        function (b) {
          d.find('.item[data-itid\x3d"' + a.ITID + '"] .price').css(
            "backgroundImage",
            "url(" + b + ")",
          );
        },
      );
      h.loadFile(
        c.INTERFACE_PATH + "collection/" + e.identifiedResourceName + ".bmp",
        function (b) {
          d.find('.item[data-itid\x3d"' + a.ITID + '"] .icon').css(
            "backgroundImage",
            "url(" + b + ")",
          );
        },
      );
    };
    l.setBuyItemList = function () {
      this.ui.find(".r_main").empty();
      for (var a = 0; a < n.length; a++) l.addBuyItem(n[a]);
      l.calculatePrice();
    };
    l.addBuyItem = function (a) {
      var b = this.ui.find(".r_main"),
        d = c.getItemInfo(a.id);
      b.append(
        '\x3cdiv class\x3d"item good" data-itid\x3d"' +
          a.id +
          '"\x3e\x3cdiv class\x3d"left"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"right"\x3e\x3cdiv class\x3d"name"\x3e' +
          d.identifiedDiSPlayName +
          '\x3c/div\x3e\x3cdiv class\x3d"info"\x3e\x3cinput class\x3d"num" type\x3d"number" value\x3d"' +
          a.count +
          '"/\x3e\x3cspan class\x3d"needCpoints"\x3e' +
          a.price +
          'C\x3c/span\x3e\x3c/div\x3e\x3cbutton class\x3d"close"\x3ex\x3c/button\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      h.loadFile(
        c.INTERFACE_PATH + "basic_interface/price_bg.bmp",
        function (c) {
          b.find('.item[data-itid\x3d"' + a.id + '"] .price').css(
            "backgroundImage",
            "url(" + c + ")",
          );
        },
      );
      h.loadFile(
        c.INTERFACE_PATH + "collection/" + d.identifiedResourceName + ".bmp",
        function (c) {
          b.find('.item[data-itid\x3d"' + a.id + '"] .icon').css(
            "backgroundImage",
            "url(" + c + ")",
          );
        },
      );
    };
    l.calculatePrice = function () {
      for (var a = (A = 0); a < n.length; a++) A += n[a].count * n[a].price;
      l.ui.find(".payforc .totalC").text(A);
    };
    l.BuyResult = function (a) {
      n = [];
      l.setBuyItemList();
      l.ui.find(".cashpoints .right").text(a.cashPoints);
    };
    l.searchItems = function (a) {
      p = [];
      for (var b = 0; b < f.length; b++)
        for (var d = 0; d < f[b].count; d++)
          if (
            -1 !==
            c
              .getItemInfo(f[b].itemList[d].ITID)
              .identifiedDiSPlayName.indexOf(a)
          ) {
            for (var e = 0, g = 0; g < p.length; g++)
              p[g].ITID == f[b].itemList[d].ITID && (e = 1);
            0 == e &&
              ((e = {}),
              (e.ITID = f[b].itemList[d].ITID),
              (e.price = f[b].itemList[d].price),
              (e.tab = b),
              p.push(e));
          }
      l.setSearchItems();
    };
    l.setSearchItems = function () {
      l.ui.find(".l_main").empty();
      if (0 < p.length) {
        for (var a = 6 * (v - 1); a < 6 * (v - 1) + 6; a++)
          p[a] && l.addCashItem(p[a], p[a].tab);
        6 < p.length && l.setPage();
      } else
        l.ui
          .find(".l_main")
          .append(
            '\x3cdiv class\x3d"none"\x3e\u627e\u4e0d\u5230\u5546\u54c1\x3c/div\x3e',
          );
    };
    return r.addComponent(l);
  },
);
