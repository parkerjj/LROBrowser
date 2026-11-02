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
        B.showPromptBox(
          "\u7269\u54c1\u540d\u79f0\uff1a" +
            c +
            "\uff0c\u4ef7\u683c\uff1a" +
            d +
            L +
            "\uff0c\u9053\u5177\u8d2d\u4e70\u540e\u5c06\u53d1\u9001\u5230\u90ae\u7bb1",
          "ok",
          "cancel",
          function () {
            if (b.SellerName == A.Entity.display.name)
              B.showMessageBox("\u8d2d\u4e70\u5931\u8d25", "ok");
            else {
              var c = new t.CZ.AUCTION_BUY();
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
        B.showPromptBox(
          "\u7269\u54c1\u540d\u79f0\uff1a" +
            b +
            "\uff0c\u9053\u5177\u4e0b\u67b6\u540e\u5c06\u53d1\u9001\u5230\u90ae\u7bb1",
          "ok",
          "cancel",
          function () {
            var b = new t.CZ.AUCTION_ADD_CANCEL();
            b.AuctionID = a;
            v.sendPacket(b);
          },
        ));
    }
    function e(a) {
      D.ui.find(".tabsbar .btns button").removeClass("sd");
      D.ui.find(".tabsbar .btns button").eq(a).addClass("sd");
      D.ui.find(".content").empty();
      G = a;
      switch (a) {
        case 0:
          D.ui.find(".seachbar").show();
          D.ui.find(".sellbar").hide();
          D.ui.find(".nav").show();
          D.ui.find(".nav2").hide();
          D.ui.find(".footer .pages").show();
          D.ui.find(".footer .btns").hide();
          m(4);
          break;
        case 1:
          D.ui.find(".seachbar").hide();
          D.ui.find(".sellbar").hide();
          D.ui.find(".nav").show();
          D.ui.find(".nav2").hide();
          D.ui.find(".footer .pages").hide();
          D.ui.find(".footer .btns").hide();
          a = new t.CZ.AUCTION_REQ_MY_INFO();
          a.Type = 0;
          v.sendPacket(a);
          break;
        case 2:
          (D.ui.find(".seachbar").hide(),
            D.ui.find(".sellbar").show(),
            D.ui.find(".nav").hide(),
            D.ui.find(".nav2").show(),
            D.ui.find(".footer .pages").hide(),
            D.ui.find(".footer .btns").show(),
            (a = D.ui.find(".content")),
            a.empty(),
            a.append(
              "\x3cp\x3e\u6253\u5f00\u80cc\u5305\u6dfb\u52a0\u51fa\u552e\u9053\u5177\x3c/p\x3e",
            ));
      }
    }
    function m(a) {
      D.ui.find(".search input").val("");
      D.ui
        .find(".search .sort option[value \x3d " + a + "]")
        .prop("selected", "selected");
      K = 1;
      var b = new t.CZ.AUCTION_ITEM_SEARCH();
      b.Type = a;
      b.AuctionID = 0;
      b.Name = D.ui.find(".search input").val() || "";
      b.Page = K;
      v.sendPacket(b);
      return !1;
    }
    function h(a) {
      var b;
      try {
        b = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (T) {
        return !1;
      }
      a.stopImmediatePropagation();
      if (("item" == b.type) & ("Inventory" == b.from) && (b = b.data)) {
        var c = new t.CZ.AUCTION_CREATE();
        c.type = 1;
        v.sendPacket(c);
        c = new t.CZ.AUCTION_ADD_ITEM();
        c.index = b.index;
        c.count = 1;
        v.sendPacket(c);
        O.auctionItem(b.index, 1);
      }
      a.stopImmediatePropagation();
      return !1;
    }
    function q(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function r() {
      1 < K && (--K, D.ui.find(".currentPage").text(K), g());
    }
    function k() {
      K < N && ((K += 1), D.ui.find(".currentPage").text(K), g());
    }
    function g() {
      var a = D.ui.find(".search .sort").val(),
        b = new t.CZ.AUCTION_ITEM_SEARCH();
      b.Type = a;
      b.AuctionID = 0;
      b.Name = D.ui.find(".search input").val();
      b.Page = K;
      v.sendPacket(b);
    }
    function u(a) {
      D.ui
        .find(".search .sort option[value \x3d 4]")
        .prop("selected", "selected");
      var b = new t.CZ.AUCTION_ITEM_SEARCH();
      b.Type = 4;
      b.AuctionID = a | 0;
      b.Name = D.ui.find(".search input").val();
      b.Page = K;
      v.sendPacket(b);
    }
    function l() {
      var a = D.ui.find(".content");
      if (W) {
        var b = new t.CZ.AUCTION_CREATE();
        b.type = 1;
        v.sendPacket(b);
        W = null;
      }
      a.empty();
      a.append(
        "\x3cp\x3e\u6253\u5f00\u80cc\u5305\u6dfb\u52a0\u51fa\u552e\u9053\u5177\x3c/p\x3e",
      );
    }
    function f() {
      if (W) {
        var a = D.ui.find(".itemSub .name").html(),
          b = D.ui.find(".itemSub .price input").val(),
          c = D.ui.find(".itemSub .datetime input").val();
        a
          ? b
            ? 1 > b
              ? B.showMessageBox(
                  "\u51fa\u552e\u4ef7\u683c\u5927\u4e8e\u7b49\u4e8e1",
                  "ok",
                )
              : c
                ? 1 > c
                  ? B.showMessageBox(
                      "\u6302\u552e\u65f6\u95f4\u81f3\u5c111\u5c0f\u65f6",
                      "ok",
                    )
                  : 168 < c
                    ? B.showMessageBox(
                        "\u6302\u552e\u65f6\u95f4\u4e0d\u80fd\u8d85\u8fc7168\u5c0f\u65f6",
                        "ok",
                      )
                    : ((b = parseInt(b)),
                      B.showPromptBox(
                        "\u7269\u54c1\u540d\u79f0\uff1a" +
                          a +
                          "\uff0c\u4ef7\u683c\uff1a" +
                          b +
                          L +
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
                          var a = new t.CZ.AUCTION_ADD();
                          a.NowMoney = b;
                          a.MaxMoney = b;
                          a.DeleteHour = c;
                          v.sendPacket(a);
                        },
                      ))
                : B.showMessageBox(
                    "\u8bf7\u586b\u5199\u6302\u552e\u65f6\u95f4",
                    "ok",
                  )
            : B.showMessageBox(
                "\u8bf7\u586b\u5199\u51fa\u552e\u4ef7\u683c",
                "ok",
              )
          : B.showMessageBox("\u8bf7\u6dfb\u52a0\u7269\u54c1", "ok");
      } else B.showMessageBox("\u8bf7\u6dfb\u52a0\u7269\u54c1", "ok");
    }
    function n(a) {
      for (var b, c = 0; c < D.list.length; c++)
        if (D.list[c].AuctionID == a) {
          b = D.list[c];
          break;
        }
      return b;
    }
    var p = a("DB/DBManager"),
      v = a("Network/NetworkManager"),
      t = a("Network/PacketStructure"),
      z = a("Utils/jquery"),
      E = a("Core/Preferences"),
      C = a("Core/Client"),
      J = a("Core/Configs");
    a("Renderer/Renderer");
    var A = a("Engine/SessionStorage");
    a("Controls/MouseEventHandler");
    var B = a("UI/UIManager"),
      F = a("UI/UIComponent");
    a("UI/Components/ContextMenu/ContextMenu");
    a("UI/Components/ChatBox/ChatBox");
    var O = a("UI/Components/Inventory/Inventory"),
      M = a("UI/Components/OnPushCart/OnPushCart"),
      H = a("UI/Components/ItemInfo/ItemInfo"),
      x = a("UI/Components/ItemObtain/ItemObtain"),
      I = a("text!./Auction.html");
    a = a("text!./Auction.css");
    var D = new F("Auction", I, a),
      L = "Z";
    3 == J.get("ClientVer") && (L = "C");
    D.list = [];
    D.TAB = { ITEM: 0, SELLING: 1, MNSELL: 2 };
    var y = E.get(
        "Auction",
        { x: 200, y: 260, width: 6, height: 6, show: !1, tab: D.TAB.ITEM },
        1,
      ),
      G = 0,
      K = 1,
      N = 1,
      Q = !1,
      W = null;
    D.init = function () {
      this.ui.find(".titlebar").on("click", ".close", function () {
        var a = new t.CZ.AUCTION_CLOSE();
        v.sendPacket(a);
      });
      this.ui.find(".content").on("contextmenu", ".item .left", function () {
        if (!Q) {
          var a = z(this).parent().attr("data-auctionid");
          if ((a = n(a)))
            H.AuctionID != a.AuctionID
              ? (H.append(),
                (H.AuctionID = a.AuctionID),
                (H.item_ = a),
                (a.type = a.Type),
                H.setItem(a))
              : H.remove();
        }
      });
      this.ui
        .find(".content")
        .on("contextmenu", ".itemSub .left,.itemSub .name", function () {
          if (!Q) {
            z(this).parent().attr("data-index");
            var a = W;
            a &&
              (H.uid != a.ITID
                ? (H.append(),
                  (H.uid = a.ITID),
                  (H.type = "Auction"),
                  (H.item_ = a),
                  (a.type = a.Type),
                  H.setItem(a))
                : H.remove());
          }
        });
      this.ui.find(".tabsbar .btns button").on("click", function () {
        e(z(this).index());
      });
      this.ui.find(".content").on("click", ".item .buyin", function () {
        Q || c(z(this).attr("data-auctionid"));
      });
      this.ui.find(".content").on("click", ".item .takedn", function () {
        Q || d(z(this).attr("data-auctionid"));
      });
      this.ui.find(".search .sort").on("change", function () {
        m(z(this).val());
      });
      this.ui.find(".search input").on("change", u);
      this.ui.find(".footer").on("click", ".prev", r);
      this.ui.find(".footer").on("click", ".next", k);
      this.ui.find(".openInventory").click(function () {
        O.toggle();
      });
      this.ui.find(".openpushcart").click(function () {
        A.Entity.cart
          ? M.toggle()
          : x.setMsg("\u627e\u4e0d\u5230\u624b\u63a8\u8f66");
      });
      this.ui.find(".sellbar").on("click", ".reset", l);
      this.ui.find(".sellbar").on("click", ".release", f);
      var a, b;
      this.ui
        .on("touchstart", ".content", function (b) {
          Q = !1;
          a = b.originalEvent.targetTouches[0].clientY;
        })
        .on("touchmove", ".content", function (c) {
          Q = !0;
          3 < z(this).find(".item").length &&
            ((b = c.originalEvent.targetTouches[0].clientY),
            (0 < b - a && 0 == z("#Auction .content").scrollTop()) ||
              c.stopImmediatePropagation());
        });
      this.draggable(this.ui.find(".titlebar"));
      this.ui.on("drop", h).on("dragover", q);
      y.tab = 0;
    };
    D.onAppend = function () {
      e(0);
    };
    D.onRemove = function () {
      H.ui && H.ui.is(":visible") && H.remove();
      G = 0;
      N = K = 1;
      W = null;
      D.ui.find(".search input").val("");
    };
    D.addItemSub = function (a, b) {
      var c = O.getItemByIndex(a);
      a = p.getItemInfo(c.ITID);
      b = p.getItemName(c);
      var d = this.ui.find(".content");
      W = c;
      d.empty();
      d.append(
        '\x3cdiv class\x3d"itemSub" data-index\x3d"' +
          c.index +
          '"\x3e\x3cdiv class\x3d"left" \x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"name"\x3e' +
          b +
          '\x3c/div\x3e\x3cdiv class\x3d"price"\x3e\x3cinput type\x3d"text" value\x3d"1"/\x3e\x3c/div\x3e\x3cdiv class\x3d"datetime"\x3e\x3cinput type\x3d"text" value\x3d"168" /\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      C.loadFile(
        p.INTERFACE_PATH + "item/" + a.identifiedResourceName + ".bmp",
        function (a) {
          d.find('.itemSub[data-index\x3d"' + c.index + '"] .icon').css(
            "backgroundImage",
            "url(" + a + ")",
          );
        },
      );
    };
    D.addItem = function (a) {
      var c,
        d = p.getItemInfo(a.ITID),
        e = p.getItemName(a),
        f = this.ui.find(".content"),
        g = D.ui.find(".tabsbar .btns button.sd").index(),
        h = !1;
      c = a.DeleteTime - parseInt(Date.now() / 1e3);
      a.SellerName == A.Entity.display.name && (h = !0);
      c = h
        ? z(
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
        : z(
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
      C.loadFile(
        p.INTERFACE_PATH + "item/" + d.identifiedResourceName + ".bmp",
        function (b) {
          f.find('.item[data-AuctionID\x3d"' + a.AuctionID + '"] .icon').css(
            "backgroundImage",
            "url(" + b + ")",
          );
        },
      );
    };
    D.getSellitem = function () {
      return W;
    };
    D.update = function (a) {
      e(a);
    };
    D.setList = function (a) {
      var b;
      this.list = a.auctionItemList;
      b = this.ui.find(".content");
      var c = this.ui.find(".footer .pages");
      N = a.MaxPage;
      b.empty();
      c.empty();
      b = 0;
      for (a = a.Number; b < a; b++)
        if ((D.addItem(this.list[b]), 0 == G && b == a - 1)) {
          var d = z(
            '\x3cbutton class\x3d"prev"\x3e\x3c\x3c/button\x3e\x3cspan class\x3d"currentPage"\x3e' +
              K +
              '\x3c/span\x3e / \x3cspan class\x3d"totalPages"\x3e' +
              N +
              '\x3c/span\x3e\x3cbutton class\x3d"next"\x3e\x3e\x3c/button\x3e',
          );
          c.append(d);
        }
    };
    D.updatePage = function () {
      g();
    };
    return B.addComponent(D);
  },
);
