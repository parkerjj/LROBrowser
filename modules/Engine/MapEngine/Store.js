define(
  "Engine/MapEngine/Store",
  "require DB/DBManager Network/NetworkManager Network/PacketStructure Renderer/EntityManager Preferences/Controls UI/Components/PlayerStore/PlayerStore UI/Components/NpcStore/NpcStore UI/Components/BuyingStore/BuyingStore UI/Components/ChatBox/ChatBox UI/Components/Auction/Auction UI/Components/Inventory/Inventory UI/Components/Shop/CashShop UI/Components/ItemObtain/ItemObtain".split(
    " ",
  ),
  function (a) {
    function b(a) {
      K.append();
      K.setType(K.Type.CASH);
      F.getOverEntity() && 592 == F.getOverEntity()._job && K.setType_(3);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        var b, c, d;
        d = new E.CZ.PC_BUY_CASH_POINT_ITEM();
        c = a.length;
        for (b = 0; b < c; ++b)
          d.itemList.push({ ITID: a[b].ITID, count: a[b].count });
        M.sendPacket(d);
      };
    }
    function c(a) {
      K.append();
      K.setType(K.Type.BUY);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        var b, c, d;
        d = new E.CZ.PC_PURCHASE_ITEMLIST();
        c = a.length;
        for (b = 0; b < c; ++b)
          d.itemList.push({ ITID: a[b].ITID, count: a[b].count });
        M.sendPacket(d);
      };
    }
    function d(a) {
      K.append();
      K.setType(K.Type.BARTER_BUY);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        if (0 < a.length) {
          var b, c, d;
          d = new E.CZ.NPC_BARTER_MARKET_PURCHASE();
          c = a.length;
          for (b = 0; b < c; ++b)
            d.itemList.push({
              ITID: a[b].ITID,
              amount: a[b].count,
              invIndex: a[b].invIndex,
              shopIndex: a[b].index,
            });
          M.sendPacket(d);
        }
        d = new E.CZ.NPC_BARTER_MARKET_CLOSE();
        M.sendPacket(d);
      };
    }
    function e(a) {
      K.append();
      K.setType(K.Type.BUY);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        if (0 < a.length) {
          var b, c, d;
          d = new E.CZ.NPC_MARKET_PURCHASE();
          c = a.length;
          for (b = 0; b < c; ++b)
            d.itemList.push({ ITID: a[b].ITID, amount: a[b].count });
          M.sendPacket(d);
        }
        d = new E.CZ.NPC_MARKET_CLOSE();
        M.sendPacket(d);
      };
    }
    function m(a) {
      K.append();
      K.setType(K.Type.BARTER_MARKET_BUY);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        if (0 < a.length) {
          var b, c, d;
          d = new E.CZ.NPC_EXPANDED_BARTER_MARKET_PURCHASE();
          c = a.length;
          for (b = 0; b < c; ++b)
            d.itemList.push({
              ITID: a[b].ITID,
              shopIndex: a[b].index,
              amount: a[b].count,
            });
          M.sendPacket(d);
        }
        d = new E.CZ.NPC_EXPANDED_BARTER_MARKET_CLOSE();
        M.sendPacket(d);
      };
    }
    function h(a) {
      K.remove();
      switch (a.result) {
        case 0:
          P.addText(x.getMessage(54), P.TYPE.BLUE);
          break;
        case 1:
          P.addText(x.getMessage(55), P.TYPE.ERROR);
          break;
        case 2:
          P.addText(x.getMessage(56), P.TYPE.ERROR);
          break;
        case 4:
          P.addText(x.getMessage(230), P.TYPE.ERROR);
          break;
        case 5:
          P.addText(x.getMessage(281), P.TYPE.ERROR);
          break;
        case 7:
          P.addText(x.getMessage(1797), P.TYPE.ERROR);
          break;
        default:
          P.addText(x.getMessage(57), P.TYPE.ERROR);
      }
    }
    function r(a) {
      K.append();
      K.setType(K.Type.SELL);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        var b, c, d;
        d = new E.CZ.PC_SELL_ITEMLIST();
        c = a.length;
        for (b = 0; b < c; ++b)
          d.itemList.push({ index: a[b].index, count: a[b].count });
        M.sendPacket(d);
      };
    }
    function q(a) {
      K.remove();
      0 === a.result
        ? P.addText(x.getMessage(54), P.TYPE.BLUE)
        : P.addText(x.getMessage(57), P.TYPE.ERROR);
    }
    function k(a) {
      K.append();
      K.setType(K.Type.VENDING_STORE);
      K.setList(a.itemList);
      K.onSubmit = function (b) {
        K.remove();
        var c, d, e;
        a instanceof E.ZC.PC_PURCHASE_ITEMLIST_FROMMC3
          ? ((e = new E.CZ.PC_PURCHASE_ITEMLIST_FROMMC2()),
            (e.UniqueID = a.UniqueID))
          : a instanceof E.ZC.PC_PURCHASE_ITEMLIST_FROMMC2
            ? ((e = new E.CZ.PC_PURCHASE_ITEMLIST_FROMMC2()),
              (e.UniqueID = a.UniqueID))
            : (e = new E.CZ.PC_PURCHASE_ITEMLIST_FROMMC());
        e.AID = a.AID;
        d = b.length;
        for (c = 0; c < d; ++c)
          e.itemList.push({ index: b[c].index, count: b[c].count });
        M.sendPacket(e);
      };
    }
    function g(a) {
      K.append();
      K.setType(K.Type.BUYING_STORE);
      K.setList(a.ItemList);
      var b = a.limitZeny.toString().split(""),
        c,
        d = b.length,
        e = "";
      for (c = 0; c < d; c++)
        e = b[d - c - 1] + (c && 0 === c % 3 ? "," : "") + e;
      K.ui.find(".limit span").html(e);
      b = F.get(a.AID);
      K.ui.find(".seller").text(b ? b.display.name : "");
      K.onSubmit = function (b) {
        K.remove();
        var c, d, e;
        e = new E.CZ.REQ_TRADE_BUYING_STORE();
        e.makerAID = a.makerAID;
        e.StoreID = a.StoreID;
        d = b.length;
        for (c = 0; c < d; ++c)
          e.ItemList.push({
            id: b[c].ITID,
            index: b[c].index,
            count: b[c].count,
          });
        M.sendPacket(e);
      };
    }
    function t(a) {
      G.append();
      G.initList(a);
      G.onSubmit = function (a, b) {
        var c;
        c = new E.CZ.REQ_OPENSTORE2();
        c.storeName = b || "\u6b22\u8fce\u5149\u4e34\uff01";
        c.result = 1;
        c.storeList = a;
        M.sendPacket(c);
      };
    }
    function l(a) {
      G.initSuss(a);
    }
    function f(a) {
      G.delitem2(a);
    }
    function n(a) {
      H.remove();
      H.__active = 1;
      H.append();
      H.initList(a);
      H.onSubmit = function (a, b, c) {
        var d;
        d = new E.CZ.REQ_OPEN_BUYING_STORE();
        d.LimitZeny = c;
        d.storeName = b || "\u6b22\u8fce\u5149\u4e34\uff01";
        d.result = 1;
        d.ItemList = a;
        M.sendPacket(d);
      };
    }
    function p(a) {
      sessionStorage.getItem("storeName")
        ? ((Session.Entity.effectState = 64),
          sessionStorage.removeItem("storeName"),
          (a = new E.CZ.WHISPER()),
          (a.receiver = "NPC:offline"),
          (a.msg = "0"))
        : (H.initSuss(a), (a = new E.CZ.REQUEST_ACT()), (a.action = 2));
      M.sendPacket(a);
    }
    function v(a) {
      H.Openfalut(a);
    }
    function u(a) {
      H.updateStore(a);
    }
    function A(a) {
      switch (a.Result) {
        case 5:
          P.addText(
            "\u91c7\u8d2d\u5546\u5e97\u5f00\u542f\u5931\u8d25",
            P.TYPE.ERROR,
          );
          break;
        case 6:
          P.addText("\u4f9b\u8fc7\u4e8e\u6c42", P.TYPE.ERROR);
          break;
        case 7:
          P.addText(
            "\u5bf9\u65b9\u6ca1\u6709\u8db3\u591f\u7684\u91d1\u94b1",
            P.TYPE.ERROR,
          );
      }
    }
    function D(a) {
      0 == a.Type ? N.append() : N.remove();
    }
    function B(a) {
      if (0 == a.result) {
        var b = S.getItemByIndex(a.Index);
        N.update(2);
        N.addItemSub(a.Index, b.count_);
        S.removeItem(a.Index, b.count_);
        S.toggle();
      } else ea.setMsg("\u6dfb\u52a0\u5931\u8d25", P.TYPE.ERROR);
    }
    function O(a) {
      1 == a.Result
        ? (N.update(1),
          P.addText("\u6210\u529f\u767b\u8bb0\u7269\u54c1", P.TYPE.PRIVATE),
          ea.setMsg("\u6210\u529f\u767b\u8bb0\u7269\u54c1"))
        : 2 == a.Result
          ? (P.addText(
              "\u5546\u54c1\u5df2\u4e0b\u67b6\uff0c\u5546\u54c1\u5df2\u53d1\u9001\u81f3\u90ae\u4ef6",
              P.TYPE.ERROR,
            ),
            ea.setMsg("\u5546\u54c1\u5df2\u4e0b\u67b6"),
            N.update(1))
          : 4 == a.Result
            ? (N.update(1),
              P.addText(
                "\u6700\u591a\u767b\u8bb010\u4e2a\u7269\u54c1",
                P.TYPE.ERROR,
              ),
              ea.setMsg("\u6700\u591a\u767b\u8bb010\u4e2a\u7269\u54c1"))
            : 5 == a.Result
              ? (P.addText(
                  "\u624b\u7eed\u8d39\u7f34\u8d39\u5931\u8d25",
                  P.TYPE.ERROR,
                ),
                ea.setMsg("\u624b\u7eed\u8d39\u7f34\u8d39\u5931\u8d25"))
              : 6 == a.Result
                ? (P.addText(
                    "\u5546\u54c1\u5df2\u53d1\u9001\u81f3\u90ae\u4ef6",
                    P.TYPE.PRIVATE,
                  ),
                  ea.setMsg("\u5546\u54c1\u5df2\u53d1\u9001\u81f3\u90ae\u4ef6"),
                  N.updatePage())
                : P.addText("\u4ea4\u6613\u5931\u8d25", P.TYPE.ERROR);
    }
    function C(a) {
      1 == a.Result
        ? (P.addText("\u5546\u54c1\u5df2\u4e0b\u67b6", P.TYPE.PRIVATE),
          ea.setMsg("\u5546\u54c1\u5df2\u4e0b\u67b6"))
        : 2 == a.Result
          ? (P.addText("\u5546\u54c1\u4e0d\u80fd\u4e0b\u67b6", P.TYPE.ERROR),
            ea.setMsg("\u5546\u54c1\u4e0d\u80fd\u4e0b\u67b6"))
          : (P.addText(
              "\u5546\u54c1\u53ef\u80fd\u5df2\u51fa\u552e",
              P.TYPE.PRIVATE,
            ),
            ea.setMsg("\u5546\u54c1\u53ef\u80fd\u5df2\u51fa\u552e"));
      N.update(1);
    }
    function y(a) {
      N.setList(a);
    }
    function z(a) {
      R.setInit(a);
    }
    function J(a) {
      R.setList(a);
    }
    function I(a) {
      0 == a.result
        ? (P.addText("\u8d2d\u4e70\u6210\u529f", P.TYPE.PRIVATE),
          R.BuyResult(a),
          ea.setMsg("\u8d2d\u4e70\u6210\u529f"))
        : (P.addText("\u8d2d\u4e70\u5931\u8d25", P.TYPE.ERROR),
          ea.setMsg("\u8d2d\u4e70\u5931\u8d25"));
    }
    function L(a) {
      K.remove();
      0 == a.rs
        ? (P.addText("\u8d2d\u4e70\u6210\u529f", P.TYPE.PRIVATE),
          ea.setMsg("\u8d2d\u4e70\u6210\u529f"))
        : (P.addText("\u8d2d\u4e70\u5931\u8d25", P.TYPE.ERROR),
          ea.setMsg("\u8d2d\u4e70\u5931\u8d25"));
    }
    var x = a("DB/DBManager"),
      M = a("Network/NetworkManager"),
      E = a("Network/PacketStructure"),
      F = a("Renderer/EntityManager");
    a("Preferences/Controls");
    var G = a("UI/Components/PlayerStore/PlayerStore"),
      H = a("UI/Components/BuyingStore/BuyingStore"),
      K = a("UI/Components/NpcStore/NpcStore"),
      P = a("UI/Components/ChatBox/ChatBox"),
      N = a("UI/Components/Auction/Auction"),
      S = a("UI/Components/Inventory/Inventory"),
      R = a("UI/Components/Shop/CashShop"),
      ea = a("UI/Components/ItemObtain/ItemObtain");
    G.onRemove2 = function () {
      var a;
      a = new E.CZ.REQ_OPENSTORE2();
      M.sendPacket(a);
      a = new E.CZ.REQ_CLOSESTORE();
      M.sendPacket(a);
    };
    H.onRemove2 = function () {
      var a = new E.CZ.REQ_CLOSE_BUYING_STORE();
      M.sendPacket(a);
      a = new E.CZ.REQUEST_ACT();
      a.action = 3;
      M.sendPacket(a);
    };
    return function () {
      M.hookPacket(E.ZC.PC_CASH_POINT_ITEMLIST, b);
      M.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST, c);
      M.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST2, c);
      M.hookPacket(E.ZC.NPC_BARTER_MARKET_ITEMINFO, d);
      M.hookPacket(E.ZC.NPC_MARKET_OPEN, e);
      M.hookPacket(E.ZC.NPC_EXPANDED_BARTER_MARKET_ITEMINFO, m);
      M.hookPacket(E.ZC.NPC_MARKET_PURCHASE_RESULT, L);
      M.hookPacket(E.ZC.PC_PURCHASE_RESULT, h);
      M.hookPacket(E.ZC.PC_SELL_ITEMLIST, r);
      M.hookPacket(E.ZC.PC_SELL_RESULT, q);
      M.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST_FROMMC, k);
      M.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST_FROMMC2, k);
      M.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST_FROMMC3, k);
      M.hookPacket(E.ZC.ACK_ITEMLIST_BUYING_STORE, g);
      M.hookPacket(E.ZC.PC_PURCHASE_RESULT_FROMMC, h);
      M.hookPacket(E.ZC.OPENSTORE, t);
      M.hookPacket(E.ZC.PC_PURCHASE_MYITEMLIST, l);
      M.hookPacket(E.ZC.PC_PURCHASE_MYITEMLIST2, l);
      M.hookPacket(E.ZC.DELETEITEM_FROM_MCSTORE, f);
      M.hookPacket(E.ZC.DELETEITEM_FROM_MCSTORE2, f);
      M.hookPacket(E.ZC.OPEN_BUYING_STORE, n);
      M.hookPacket(E.ZC.MYITEMLIST_BUYING_STORE, p);
      M.hookPacket(E.ZC.FAILED_OPEN_BUYING_STORE_TO_BUYER, v);
      M.hookPacket(E.ZC.UPDATE_ITEM_FROM_BUYING_STORE, u);
      M.hookPacket(E.ZC.UPDATE_ITEM_FROM_BUYING_STORE2, u);
      M.hookPacket(E.ZC.FAILED_TRADE_BUYING_STORE_TO_SELLER, A);
      M.hookPacket(E.ZC.AUCTION_WINDOWS, D);
      M.hookPacket(E.ZC.ACK_AUCTION_ADD_ITEM, B);
      M.hookPacket(E.ZC.AUCTION_RESULT, O);
      M.hookPacket(E.ZC.AUCTION_ITEM_REQ_SEARCH, y);
      M.hookPacket(E.ZC.AUCTION_ACK_MY_SELL_STOP, C);
      M.hookPacket(E.ZC.OPEN_CASHSHOP_RESULT, z);
      M.hookPacket(E.ZC.SE_CASHSHOP_OPEN, z);
      M.hookPacket(E.ZC.ZC_ACK_SCHEDULER_CASHITEM, J);
      M.hookPacket(E.ZC.OPEN_CASHSHOP_RESULT2, I);
    };
  },
);
