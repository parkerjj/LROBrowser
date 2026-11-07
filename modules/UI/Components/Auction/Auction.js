define(
  "UI/Components/Auction/Auction",
  "require DB/DBManager Network/NetworkManager Network/PacketStructure Utils/jquery Core/Preferences Core/Client Core/Configs Renderer/Renderer Engine/SessionStorage Controls/MouseEventHandler UI/UIManager UI/UIComponent UI/Components/ContextMenu/ContextMenu UI/Components/ChatBox/ChatBox UI/Components/Inventory/Inventory UI/Components/OnPushCart/OnPushCart UI/Components/ItemInfo/ItemInfo UI/Components/ItemObtain/ItemObtain text!./Auction.html text!./Auction.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      return 86400 < a
        ? parseInt(a / 86400) + "\u5929\u540e"
        : 3600 < a
          ? parseInt(a / 3600) + "\u5c0f\u65f6\u540e"
          : 60 < a
            ? parseInt(a / 60) + "\u5206\u949f\u540e"
            : parseInt(a) + "\u79d2\u540e";
    }
    function c(a) {
      var b = n(a);
      if (b) {
        var c = p.getItemName(b),
          d = b.MaxPrice;
        y.showPromptBox(
          "\u7269\u54c1\u540d\u79f0\uff1a" +
            c +
            "\uff0c\u4ef7\u683c\uff1a" +
            d +
            F +
            "\uff0c\u9053\u5177\u8d2d\u4e70\u540e\u5c06\u53d1\u9001\u5230\u90ae\u7bb1",
          "ok",
          "cancel",
          function () {
            if (b.SellerName == C.Entity.display.name)
              y.showMessageBox("\u8d2d\u4e70\u5931\u8d25", "ok");
            else {
              var c = new u.CZ.AUCTION_BUY();
              c.AuctionID = a;
              c.Money = d;
              v.sendPacket(c);
            }
          },
        );
      }
    }
    function d(a) {
      var b = n(a);
      b &&
        ((b = p.getItemName(b)),
        y.showPromptBox(
          "\u7269\u54c1\u540d\u79f0\uff1a" +
            b +
            "\uff0c\u9053\u5177\u4e0b\u67b6\u540e\u5c06\u53d1\u9001\u5230\u90ae\u7bb1",
          "ok",
          "cancel",
          function () {
            var b = new u.CZ.AUCTION_ADD_CANCEL();
            b.AuctionID = a;
            v.sendPacket(b);
          },
        ));
    }
    function e(a) {
      E.ui.find(".tabsbar .btns button").removeClass("sd");
      E.ui.find(".tabsbar .btns button").eq(a).addClass("sd");
      E.ui.find(".content").empty();
      H = a;
      switch (a) {
        case 0:
          E.ui.find(".seachbar").show();
          E.ui.find(".sellbar").hide();
          E.ui.find(".nav").show();
          E.ui.find(".nav2").hide();
          E.ui.find(".footer .pages").show();
          E.ui.find(".footer .btns").hide();
          m(4);
          break;
        case 1:
          E.ui.find(".seachbar").hide();
          E.ui.find(".sellbar").hide();
          E.ui.find(".nav").show();
          E.ui.find(".nav2").hide();
          E.ui.find(".footer .pages").hide();
          E.ui.find(".footer .btns").hide();
          a = new u.CZ.AUCTION_REQ_MY_INFO();
          a.Type = 0;
          v.sendPacket(a);
          break;
        case 2:
          (E.ui.find(".seachbar").hide(),
            E.ui.find(".sellbar").show(),
            E.ui.find(".nav").hide(),
            E.ui.find(".nav2").show(),
            E.ui.find(".footer .pages").hide(),
            E.ui.find(".footer .btns").show(),
            (a = E.ui.find(".content")),
            a.empty(),
            a.append(
              "\x3cp\x3e\u6253\u5f00\u80cc\u5305\u6dfb\u52a0\u51fa\u552e\u9053\u5177\x3c/p\x3e",
            ));
      }
    }
    function m(a) {
      E.ui.find(".search input").val("");
      E.ui
        .find(".search .sort option[value \x3d " + a + "]")
        .prop("selected", "selected");
      K = 1;
      var b = new u.CZ.AUCTION_ITEM_SEARCH();
      b.Type = a;
      b.AuctionID = 0;
      b.Name = E.ui.find(".search input").val() || "";
      b.Page = K;
      v.sendPacket(b);
      return !1;
    }
    function h(a) {
      var b;
      try {
        b = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (V) {
        return !1;
      }
      a.stopImmediatePropagation();
      if (("item" == b.type) & ("Inventory" == b.from) && (b = b.data)) {
        var c = new u.CZ.AUCTION_CREATE();
        c.type = 1;
        v.sendPacket(c);
        c = new u.CZ.AUCTION_ADD_ITEM();
        c.index = b.index;
        c.count = 1;
        v.sendPacket(c);
        J.auctionItem(b.index, 1);
      }
      a.stopImmediatePropagation();
      return !1;
    }
    function r(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function q() {
      1 < K && (--K, E.ui.find(".currentPage").text(K), g());
    }
    function k() {
      K < P && ((K += 1), E.ui.find(".currentPage").text(K), g());
    }
    function g() {
      var a = E.ui.find(".search .sort").val(),
        b = new u.CZ.AUCTION_ITEM_SEARCH();
      b.Type = a;
      b.AuctionID = 0;
      b.Name = E.ui.find(".search input").val();
      b.Page = K;
      v.sendPacket(b);
    }
    function t(a) {
      E.ui
        .find(".search .sort option[value \x3d 4]")
        .prop("selected", "selected");
      var b = new u.CZ.AUCTION_ITEM_SEARCH();
      b.Type = 4;
      b.AuctionID = a | 0;
      b.Name = E.ui.find(".search input").val();
      b.Page = K;
      v.sendPacket(b);
    }
    function l() {
      var a = E.ui.find(".content");
      if (S) {
        var b = new u.CZ.AUCTION_CREATE();
        b.type = 1;
        v.sendPacket(b);
        S = null;
      }
      a.empty();
      a.append(
        "\x3cp\x3e\u6253\u5f00\u80cc\u5305\u6dfb\u52a0\u51fa\u552e\u9053\u5177\x3c/p\x3e",
      );
    }
    function f() {
      if (S) {
        var a = E.ui.find(".itemSub .name").html(),
          b = E.ui.find(".itemSub .price input").val(),
          c = E.ui.find(".itemSub .datetime input").val();
        a
          ? b
            ? 1 > b
              ? y.showMessageBox(
                  "\u51fa\u552e\u4ef7\u683c\u5927\u4e8e\u7b49\u4e8e1",
                  "ok",
                )
              : c
                ? 1 > c
                  ? y.showMessageBox(
                      "\u6302\u552e\u65f6\u95f4\u81f3\u5c111\u5c0f\u65f6",
                      "ok",
                    )
                  : 168 < c
                    ? y.showMessageBox(
                        "\u6302\u552e\u65f6\u95f4\u4e0d\u80fd\u8d85\u8fc7168\u5c0f\u65f6",
                        "ok",
                      )
                    : ((b = parseInt(b)),
                      y.showPromptBox(
                        "\u7269\u54c1\u540d\u79f0\uff1a" +
                          a +
                          "\uff0c\u4ef7\u683c\uff1a" +
                          b +
                          F +
                          "\uff0c\u624b\u7eed\u8d39\uff1a" +
                          b +
                          "Z\uff0c\u6302\u552e\u65f6\u95f4\uff1a" +
                          c +
                          "\u5c0f\u65f6" +
                          (10 <= b
                            ? "\uff0c\u4ea4\u6613\u6210\u529f\u540e\u5c06\u6536\u53d6\u6210\u4ea4\u4ef7\u683c\u768410%\u4f5c\u4e3a\u624b\u7eed\u8d39\u3002"
                            : ""),
                        "ok",
                        "cancel",
                        function () {
                          var a = new u.CZ.AUCTION_ADD();
                          a.NowMoney = b;
                          a.MaxMoney = b;
                          a.DeleteHour = c;
                          v.sendPacket(a);
                        },
                      ))
                : y.showMessageBox(
                    "\u8bf7\u586b\u5199\u6302\u552e\u65f6\u95f4",
                    "ok",
                  )
            : y.showMessageBox(
                "\u8bf7\u586b\u5199\u51fa\u552e\u4ef7\u683c",
                "ok",
              )
          : y.showMessageBox("\u8bf7\u6dfb\u52a0\u7269\u54c1", "ok");
      } else y.showMessageBox("\u8bf7\u6dfb\u52a0\u7269\u54c1", "ok");
    }
    function n(a) {
      for (var b, c = 0; c < E.list.length; c++)
        if (E.list[c].AuctionID == a) {
          b = E.list[c];
          break;
        }
      return b;
    }
    var p = a("DB/DBManager"),
      v = a("Network/NetworkManager"),
      u = a("Network/PacketStructure"),
      A = a("Utils/jquery"),
      D = a("Core/Preferences"),
      B = a("Core/Client"),
      O = a("Core/Configs");
    a("Renderer/Renderer");
    var C = a("Engine/SessionStorage");
    a("Controls/MouseEventHandler");
    var y = a("UI/UIManager"),
      z = a("UI/UIComponent");
    a("UI/Components/ContextMenu/ContextMenu");
    a("UI/Components/ChatBox/ChatBox");
    var J = a("UI/Components/Inventory/Inventory"),
      I = a("UI/Components/OnPushCart/OnPushCart"),
      L = a("UI/Components/ItemInfo/ItemInfo"),
      x = a("UI/Components/ItemObtain/ItemObtain"),
      M = a("text!./Auction.html");
    a = a("text!./Auction.css");
    var E = new z("Auction", M, a),
      F = "Z";
    3 == O.get("ClientVer") && (F = "C");
    E.list = [];
    E.TAB = { ITEM: 0, SELLING: 1, MNSELL: 2 };
    var G = D.get(
        "Auction",
        { x: 200, y: 260, width: 6, height: 6, show: !1, tab: E.TAB.ITEM },
        1,
      ),
      H = 0,
      K = 1,
      P = 1,
      N = !1,
      S = null;
    E.init = function () {
      this.ui.find(".titlebar").on("click", ".close", function () {
        var a = new u.CZ.AUCTION_CLOSE();
        v.sendPacket(a);
      });
      this.ui.find(".content").on("contextmenu", ".item .left", function () {
        if (!N) {
          var a = A(this).parent().attr("data-auctionid");
          if ((a = n(a)))
            L.AuctionID != a.AuctionID
              ? (L.append(),
                (L.AuctionID = a.AuctionID),
                (L.item_ = a),
                (a.type = a.Type),
                L.setItem(a))
              : L.remove();
        }
      });
      this.ui
        .find(".content")
        .on("contextmenu", ".itemSub .left,.itemSub .name", function () {
          if (!N) {
            A(this).parent().attr("data-index");
            var a = S;
            a &&
              (L.uid != a.ITID
                ? (L.append(),
                  (L.uid = a.ITID),
                  (L.type = "Auction"),
                  (L.item_ = a),
                  (a.type = a.Type),
                  L.setItem(a))
                : L.remove());
          }
        });
      this.ui.find(".tabsbar .btns button").on("click", function () {
        e(A(this).index());
      });
      this.ui.find(".content").on("click", ".item .buyin", function () {
        N || c(A(this).attr("data-auctionid"));
      });
      this.ui.find(".content").on("click", ".item .takedn", function () {
        N || d(A(this).attr("data-auctionid"));
      });
      this.ui.find(".search .sort").on("change", function () {
        m(A(this).val());
      });
      this.ui.find(".search input").on("change", t);
      this.ui.find(".footer").on("click", ".prev", q);
      this.ui.find(".footer").on("click", ".next", k);
      this.ui.find(".openInventory").click(function () {
        J.toggle();
      });
      this.ui.find(".openpushcart").click(function () {
        C.Entity.cart
          ? I.toggle()
          : x.setMsg("\u627e\u4e0d\u5230\u624b\u63a8\u8f66");
      });
      this.ui.find(".sellbar").on("click", ".reset", l);
      this.ui.find(".sellbar").on("click", ".release", f);
      var a, b;
      this.ui
        .on("touchstart", ".content", function (b) {
          N = !1;
          a = b.originalEvent.targetTouches[0].clientY;
        })
        .on("touchmove", ".content", function (c) {
          N = !0;
          3 < A(this).find(".item").length &&
            ((b = c.originalEvent.targetTouches[0].clientY),
            (0 < b - a && 0 == A("#Auction .content").scrollTop()) ||
              c.stopImmediatePropagation());
        });
      this.draggable(this.ui.find(".titlebar"));
      this.ui.on("drop", h).on("dragover", r);
      G.tab = 0;
    };
    E.onAppend = function () {
      e(0);
    };
    E.onRemove = function () {
      L.ui && L.ui.is(":visible") && L.remove();
      H = 0;
      P = K = 1;
      S = null;
      E.ui.find(".search input").val("");
    };
    E.addItemSub = function (a, b) {
      var c = J.getItemByIndex(a);
      a = p.getItemInfo(c.ITID);
      b = p.getItemName(c);
      var d = this.ui.find(".content");
      S = c;
      d.empty();
      d.append(
        '\x3cdiv class\x3d"itemSub" data-index\x3d"' +
          c.index +
          '"\x3e\x3cdiv class\x3d"left" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e' +
          b +
          '\x3c/div\x3e\x3cdiv class\x3d"price"\x3e\x3cinput type\x3d"text" value\x3d"1"/\x3e\x3c/div\x3e\x3cdiv class\x3d"datetime"\x3e\x3cinput type\x3d"text" value\x3d"168" /\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      B.loadFile(
        p.INTERFACE_PATH + "item/" + a.identifiedResourceName + ".bmp",
        function (a) {
          d.find('.itemSub[data-index\x3d"' + c.index + '"] .icon').css(
            "backgroundImage",
            "url(" + a + ")",
          );
        },
      );
    };
    E.addItem = function (a) {
      var c,
        d = p.getItemInfo(a.ITID),
        e = p.getItemName(a),
        f = this.ui.find(".content"),
        g = E.ui.find(".tabsbar .btns button.sd").index(),
        h = !1;
      c = a.DeleteTime - parseInt(Date.now() / 1e3);
      a.SellerName == C.Entity.display.name && (h = !0);
      c = h
        ? A(
            '\x3cdiv class\x3d"item" draggable\x3d"true" data-AuctionID\x3d"' +
              a.AuctionID +
              '" \x3e\x3cdiv class\x3d"left" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e' +
              e +
              '\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"price"\x3e' +
              a.MaxPrice +
              '\x3c/div\x3e\x3cdiv class\x3d"datetime"\x3e' +
              b(c) +
              '\x3c/div\x3e\x3cdiv class\x3d"btn"\x3e' +
              (0 == g
                ? '\x3cbutton class\x3d"buyin off" data-AuctionID\x3d"' +
                  a.AuctionID +
                  '" disabled\x3e\u8d2d\u4e70\x3c/button\x3e'
                : '\x3cbutton class\x3d"takedn" data-AuctionID\x3d"' +
                  a.AuctionID +
                  '"\x3e\u4e0b\u67b6\x3c/button\x3e') +
              "\x3c/div\x3e\x3c/div\x3e",
          )
        : A(
            '\x3cdiv class\x3d"item" draggable\x3d"true" data-AuctionID\x3d"' +
              a.AuctionID +
              '" \x3e\x3cdiv class\x3d"left" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e' +
              e +
              '\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"price"\x3e' +
              a.MaxPrice +
              '\x3c/div\x3e\x3cdiv class\x3d"datetime"\x3e' +
              b(c) +
              '\x3c/div\x3e\x3cdiv class\x3d"btn"\x3e' +
              (0 == g
                ? '\x3cbutton class\x3d"buyin on" data-AuctionID\x3d"' +
                  a.AuctionID +
                  '"\x3e\u8d2d\u4e70\x3c/button\x3e'
                : '\x3cbutton class\x3d"takedn" data-AuctionID\x3d"' +
                  a.AuctionID +
                  '"\x3e\u4e0b\u67b6\x3c/button\x3e') +
              "\x3c/div\x3e\x3c/div\x3e",
          );
      f.append(c);
      B.loadFile(
        p.INTERFACE_PATH + "item/" + d.identifiedResourceName + ".bmp",
        function (b) {
          f.find('.item[data-AuctionID\x3d"' + a.AuctionID + '"] .icon').css(
            "backgroundImage",
            "url(" + b + ")",
          );
        },
      );
    };
    E.getSellitem = function () {
      return S;
    };
    E.update = function (a) {
      e(a);
    };
    E.setList = function (a) {
      var b;
      this.list = a.auctionItemList;
      b = this.ui.find(".content");
      var c = this.ui.find(".footer .pages");
      P = a.MaxPage;
      b.empty();
      c.empty();
      b = 0;
      for (a = a.Number; b < a; b++)
        if ((E.addItem(this.list[b]), 0 == H && b == a - 1)) {
          var d = A(
            '\x3cbutton class\x3d"prev"\x3e\x3c\x3c/button\x3e\x3cspan class\x3d"currentPage"\x3e' +
              K +
              '\x3c/span\x3e / \x3cspan class\x3d"totalPages"\x3e' +
              P +
              '\x3c/span\x3e\x3cbutton class\x3d"next"\x3e\x3e\x3c/button\x3e',
          );
          c.append(d);
        }
    };
    E.updatePage = function () {
      g();
    };
    return y.addComponent(E);
  },
);
