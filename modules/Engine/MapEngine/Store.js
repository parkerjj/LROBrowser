define(
  "Engine/MapEngine/Store",
  "require DB/DBManager Network/NetworkManager Network/PacketStructure Renderer/EntityManager Preferences/Controls UI/Components/PlayerStore/PlayerStore UI/Components/NpcStore/NpcStore UI/Components/BuyingStore/BuyingStore UI/Components/ChatBox/ChatBox UI/Components/Auction/Auction UI/Components/Inventory/Inventory UI/Components/Shop/CashShop UI/Components/ItemObtain/ItemObtain".split(
    " ",
  ),
  function (a) {
    function b(a) {
      L.append();
      L.setType(L.Type.CASH);
      F.getOverEntity() && 592 == F.getOverEntity()._job && L.setType_(3);
      L.setList(a.itemList);
      L.onSubmit = function (a) {
        var b, c, d;
        d = new E.CZ.PC_BUY_CASH_POINT_ITEM();
        c = a.length;
        for (b = 0; b < c; ++b)
          d.itemList.push({ ITID: a[b].ITID, count: a[b].count });
        K.sendPacket(d);
      };
    }
    function c(a) {
      L.append();
      L.setType(L.Type.BUY);
      L.setList(a.itemList);
      L.onSubmit = function (a) {
        var b, c, d;
        d = new E.CZ.PC_PURCHASE_ITEMLIST();
        c = a.length;
        for (b = 0; b < c; ++b)
          d.itemList.push({ ITID: a[b].ITID, count: a[b].count });
        K.sendPacket(d);
      };
    }
    function d(a) {
      L.append();
      L.setType(L.Type.BARTER_BUY);
      L.setList(a.itemList);
      L.onSubmit = function (a) {
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
          K.sendPacket(d);
        }
        d = new E.CZ.NPC_BARTER_MARKET_CLOSE();
        K.sendPacket(d);
      };
    }
    function e(a) {
      L.append();
      L.setType(L.Type.BUY);
      L.setList(a.itemList);
      L.onSubmit = function (a) {
        if (0 < a.length) {
          var b, c, d;
          d = new E.CZ.NPC_MARKET_PURCHASE();
          c = a.length;
          for (b = 0; b < c; ++b)
            d.itemList.push({ ITID: a[b].ITID, amount: a[b].count });
          K.sendPacket(d);
        }
        d = new E.CZ.NPC_MARKET_CLOSE();
        K.sendPacket(d);
      };
    }
    function m(a) {
      L.append();
      L.setType(L.Type.BARTER_MARKET_BUY);
      L.setList(a.itemList);
      L.onSubmit = function (a) {
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
          K.sendPacket(d);
        }
        d = new E.CZ.NPC_EXPANDED_BARTER_MARKET_CLOSE();
        K.sendPacket(d);
      };
    }
    function h(a) {
      L.remove();
      switch (a.result) {
        case 0:
          M.addText(x.getMessage(54), M.TYPE.BLUE);
          break;
        case 1:
          M.addText(x.getMessage(55), M.TYPE.ERROR);
          break;
        case 2:
          M.addText(x.getMessage(56), M.TYPE.ERROR);
          break;
        case 4:
          M.addText(x.getMessage(230), M.TYPE.ERROR);
          break;
        case 5:
          M.addText(x.getMessage(281), M.TYPE.ERROR);
          break;
        case 7:
          M.addText(x.getMessage(1797), M.TYPE.ERROR);
          break;
        default:
          M.addText(x.getMessage(57), M.TYPE.ERROR);
      }
    }
    function t(a) {
      L.append();
      L.setType(L.Type.SELL);
      L.setList(a.itemList);
      L.onSubmit = function (a) {
        var b, c, d;
        d = new E.CZ.PC_SELL_ITEMLIST();
        c = a.length;
        for (b = 0; b < c; ++b)
          d.itemList.push({ index: a[b].index, count: a[b].count });
        K.sendPacket(d);
      };
    }
    function r(a) {
      L.remove();
      0 === a.result
        ? M.addText(x.getMessage(54), M.TYPE.BLUE)
        : M.addText(x.getMessage(57), M.TYPE.ERROR);
    }
    function n(a) {
      L.append();
      L.setType(L.Type.VENDING_STORE);
      L.setList(a.itemList);
      L.onSubmit = function (b) {
        L.remove();
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
        K.sendPacket(e);
      };
    }
    function g(a) {
      L.append();
      L.setType(L.Type.BUYING_STORE);
      L.setList(a.ItemList);
      var b = a.limitZeny.toString().split(""),
        c,
        d = b.length,
        e = "";
      for (c = 0; c < d; c++)
        e = b[d - c - 1] + (c && 0 === c % 3 ? "," : "") + e;
      L.ui.find(".limit span").html(e);
      b = F.get(a.AID);
      L.ui.find(".seller").text(b ? b.display.name : "");
      L.onSubmit = function (b) {
        L.remove();
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
        K.sendPacket(e);
      };
    }
    function p(a) {
      z.append();
      z.initList(a);
      z.onSubmit = function (a, b) {
        var c;
        c = new E.CZ.REQ_OPENSTORE2();
        c.storeName = b || "\u6b22\u8fce\u5149\u4e34\uff01";
        c.result = 1;
        c.storeList = a;
        K.sendPacket(c);
      };
    }
    function l(a) {
      z.initSuss(a);
    }
    function f(a) {
      z.delitem2(a);
    }
    function k(a) {
      G.remove();
      G.__active = 1;
      G.append();
      G.initList(a);
      G.onSubmit = function (a, b, c) {
        var d;
        d = new E.CZ.REQ_OPEN_BUYING_STORE();
        d.LimitZeny = c;
        d.storeName = b || "\u6b22\u8fce\u5149\u4e34\uff01";
        d.result = 1;
        d.ItemList = a;
        K.sendPacket(d);
      };
    }
    function q(a) {
      sessionStorage.getItem("storeName")
        ? ((Session.Entity.effectState = 64),
          sessionStorage.removeItem("storeName"),
          (a = new E.CZ.WHISPER()),
          (a.receiver = "NPC:offline"),
          (a.msg = "0"))
        : (G.initSuss(a), (a = new E.CZ.REQUEST_ACT()), (a.action = 2));
      K.sendPacket(a);
    }
    function u(a) {
      G.Openfalut(a);
    }
    function v(a) {
      G.updateStore(a);
    }
    function A(a) {
      switch (a.Result) {
        case 5:
          M.addText(
            "\u91c7\u8d2d\u5546\u5e97\u5f00\u542f\u5931\u8d25",
            M.TYPE.ERROR,
          );
          break;
        case 6:
          M.addText("\u4f9b\u8fc7\u4e8e\u6c42", M.TYPE.ERROR);
          break;
        case 7:
          M.addText(
            "\u5bf9\u65b9\u6ca1\u6709\u8db3\u591f\u7684\u91d1\u94b1",
            M.TYPE.ERROR,
          );
      }
    }
    function C(a) {
      0 == a.Type ? Q.append() : Q.remove();
    }
    function B(a) {
      if (0 == a.result) {
        var b = V.getItemByIndex(a.Index);
        Q.update(2);
        Q.addItemSub(a.Index, b.count_);
        V.removeItem(a.Index, b.count_);
        V.toggle();
      } else ba.setMsg("\u6dfb\u52a0\u5931\u8d25", M.TYPE.ERROR);
    }
    function J(a) {
      1 == a.Result
        ? (Q.update(1),
          M.addText("\u6210\u529f\u767b\u8bb0\u7269\u54c1", M.TYPE.PRIVATE),
          ba.setMsg("\u6210\u529f\u767b\u8bb0\u7269\u54c1"))
        : 2 == a.Result
          ? (M.addText(
              "\u5546\u54c1\u5df2\u4e0b\u67b6\uff0c\u5546\u54c1\u5df2\u53d1\u9001\u81f3\u90ae\u4ef6",
              M.TYPE.ERROR,
            ),
            ba.setMsg("\u5546\u54c1\u5df2\u4e0b\u67b6"),
            Q.update(1))
          : 4 == a.Result
            ? (Q.update(1),
              M.addText(
                "\u6700\u591a\u767b\u8bb010\u4e2a\u7269\u54c1",
                M.TYPE.ERROR,
              ),
              ba.setMsg("\u6700\u591a\u767b\u8bb010\u4e2a\u7269\u54c1"))
            : 5 == a.Result
              ? (M.addText(
                  "\u624b\u7eed\u8d39\u7f34\u8d39\u5931\u8d25",
                  M.TYPE.ERROR,
                ),
                ba.setMsg("\u624b\u7eed\u8d39\u7f34\u8d39\u5931\u8d25"))
              : 6 == a.Result
                ? (M.addText(
                    "\u5546\u54c1\u5df2\u53d1\u9001\u81f3\u90ae\u4ef6",
                    M.TYPE.PRIVATE,
                  ),
                  ba.setMsg("\u5546\u54c1\u5df2\u53d1\u9001\u81f3\u90ae\u4ef6"),
                  Q.updatePage())
                : M.addText("\u4ea4\u6613\u5931\u8d25", M.TYPE.ERROR);
    }
    function D(a) {
      1 == a.Result
        ? (M.addText("\u5546\u54c1\u5df2\u4e0b\u67b6", M.TYPE.PRIVATE),
          ba.setMsg("\u5546\u54c1\u5df2\u4e0b\u67b6"))
        : 2 == a.Result
          ? (M.addText("\u5546\u54c1\u4e0d\u80fd\u4e0b\u67b6", M.TYPE.ERROR),
            ba.setMsg("\u5546\u54c1\u4e0d\u80fd\u4e0b\u67b6"))
          : (M.addText(
              "\u5546\u54c1\u53ef\u80fd\u5df2\u51fa\u552e",
              M.TYPE.PRIVATE,
            ),
            ba.setMsg("\u5546\u54c1\u53ef\u80fd\u5df2\u51fa\u552e"));
      Q.update(1);
    }
    function y(a) {
      Q.setList(a);
    }
    function H(a) {
      W.setInit(a);
    }
    function N(a) {
      W.setList(a);
    }
    function O(a) {
      0 == a.result
        ? (M.addText("\u8d2d\u4e70\u6210\u529f", M.TYPE.PRIVATE),
          W.BuyResult(a),
          ba.setMsg("\u8d2d\u4e70\u6210\u529f"))
        : (M.addText("\u8d2d\u4e70\u5931\u8d25", M.TYPE.ERROR),
          ba.setMsg("\u8d2d\u4e70\u5931\u8d25"));
    }
    function I(a) {
      L.remove();
      0 == a.rs
        ? (M.addText("\u8d2d\u4e70\u6210\u529f", M.TYPE.PRIVATE),
          ba.setMsg("\u8d2d\u4e70\u6210\u529f"))
        : (M.addText("\u8d2d\u4e70\u5931\u8d25", M.TYPE.ERROR),
          ba.setMsg("\u8d2d\u4e70\u5931\u8d25"));
    }
    var x = a("DB/DBManager"),
      K = a("Network/NetworkManager"),
      E = a("Network/PacketStructure"),
      F = a("Renderer/EntityManager");
    a("Preferences/Controls");
    var z = a("UI/Components/PlayerStore/PlayerStore"),
      G = a("UI/Components/BuyingStore/BuyingStore"),
      L = a("UI/Components/NpcStore/NpcStore"),
      M = a("UI/Components/ChatBox/ChatBox"),
      Q = a("UI/Components/Auction/Auction"),
      V = a("UI/Components/Inventory/Inventory"),
      W = a("UI/Components/Shop/CashShop"),
      ba = a("UI/Components/ItemObtain/ItemObtain");
    z.onRemove2 = function () {
      var a;
      a = new E.CZ.REQ_OPENSTORE2();
      K.sendPacket(a);
      a = new E.CZ.REQ_CLOSESTORE();
      K.sendPacket(a);
    };
    G.onRemove2 = function () {
      var a = new E.CZ.REQ_CLOSE_BUYING_STORE();
      K.sendPacket(a);
      a = new E.CZ.REQUEST_ACT();
      a.action = 3;
      K.sendPacket(a);
    };
    return function () {
      K.hookPacket(E.ZC.PC_CASH_POINT_ITEMLIST, b);
      K.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST, c);
      K.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST2, c);
      K.hookPacket(E.ZC.NPC_BARTER_MARKET_ITEMINFO, d);
      K.hookPacket(E.ZC.NPC_MARKET_OPEN, e);
      K.hookPacket(E.ZC.NPC_EXPANDED_BARTER_MARKET_ITEMINFO, m);
      K.hookPacket(E.ZC.NPC_MARKET_PURCHASE_RESULT, I);
      K.hookPacket(E.ZC.PC_PURCHASE_RESULT, h);
      K.hookPacket(E.ZC.PC_SELL_ITEMLIST, t);
      K.hookPacket(E.ZC.PC_SELL_RESULT, r);
      K.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST_FROMMC, n);
      K.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST_FROMMC2, n);
      K.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST_FROMMC3, n);
      K.hookPacket(E.ZC.ACK_ITEMLIST_BUYING_STORE, g);
      K.hookPacket(E.ZC.PC_PURCHASE_RESULT_FROMMC, h);
      K.hookPacket(E.ZC.OPENSTORE, p);
      K.hookPacket(E.ZC.PC_PURCHASE_MYITEMLIST, l);
      K.hookPacket(E.ZC.PC_PURCHASE_MYITEMLIST2, l);
      K.hookPacket(E.ZC.DELETEITEM_FROM_MCSTORE, f);
      K.hookPacket(E.ZC.DELETEITEM_FROM_MCSTORE2, f);
      K.hookPacket(E.ZC.OPEN_BUYING_STORE, k);
      K.hookPacket(E.ZC.MYITEMLIST_BUYING_STORE, q);
      K.hookPacket(E.ZC.FAILED_OPEN_BUYING_STORE_TO_BUYER, u);
      K.hookPacket(E.ZC.UPDATE_ITEM_FROM_BUYING_STORE, v);
      K.hookPacket(E.ZC.UPDATE_ITEM_FROM_BUYING_STORE2, v);
      K.hookPacket(E.ZC.FAILED_TRADE_BUYING_STORE_TO_SELLER, A);
      K.hookPacket(E.ZC.AUCTION_WINDOWS, C);
      K.hookPacket(E.ZC.ACK_AUCTION_ADD_ITEM, B);
      K.hookPacket(E.ZC.AUCTION_RESULT, J);
      K.hookPacket(E.ZC.AUCTION_ITEM_REQ_SEARCH, y);
      K.hookPacket(E.ZC.AUCTION_ACK_MY_SELL_STOP, D);
      K.hookPacket(E.ZC.OPEN_CASHSHOP_RESULT, H);
      K.hookPacket(E.ZC.SE_CASHSHOP_OPEN, H);
      K.hookPacket(E.ZC.ZC_ACK_SCHEDULER_CASHITEM, N);
      K.hookPacket(E.ZC.OPEN_CASHSHOP_RESULT2, O);
    };
  },
);
