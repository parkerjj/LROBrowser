define(
  "Engine/MapEngine/Store",
  "require DB/DBManager Network/NetworkManager Network/PacketStructure Renderer/EntityManager Preferences/Controls UI/Components/PlayerStore/PlayerStore UI/Components/NpcStore/NpcStore UI/Components/BuyingStore/BuyingStore UI/Components/ChatBox/ChatBox UI/Components/Auction/Auction UI/Components/Inventory/Inventory UI/Components/Shop/CashShop UI/Components/ItemObtain/ItemObtain".split(
    " ",
  ),
  function (a) {
    function b(a) {
      K.append();
      K.setType(K.Type.CASH);
      L.getOverEntity() && 592 == L.getOverEntity()._job && K.setType_(3);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        var b, c, d;
        d = new E.CZ.PC_BUY_CASH_POINT_ITEM();
        c = a.length;
        for (b = 0; b < c; ++b)
          d.itemList.push({ ITID: a[b].ITID, count: a[b].count });
        J.sendPacket(d);
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
        J.sendPacket(d);
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
          J.sendPacket(d);
        }
        d = new E.CZ.NPC_BARTER_MARKET_CLOSE();
        J.sendPacket(d);
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
          J.sendPacket(d);
        }
        d = new E.CZ.NPC_MARKET_CLOSE();
        J.sendPacket(d);
      };
    }
    function l(a) {
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
          J.sendPacket(d);
        }
        d = new E.CZ.NPC_EXPANDED_BARTER_MARKET_CLOSE();
        J.sendPacket(d);
      };
    }
    function h(a) {
      K.remove();
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
        J.sendPacket(d);
      };
    }
    function t(a) {
      K.remove();
      0 === a.result
        ? M.addText(x.getMessage(54), M.TYPE.BLUE)
        : M.addText(x.getMessage(57), M.TYPE.ERROR);
    }
    function n(a) {
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
        J.sendPacket(e);
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
      b = L.get(a.AID);
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
        J.sendPacket(e);
      };
    }
    function p(a) {
      y.append();
      y.initList(a);
      y.onSubmit = function (a, b) {
        var c;
        c = new E.CZ.REQ_OPENSTORE2();
        c.storeName = b || "\u6b22\u8fce\u5149\u4e34\uff01";
        c.result = 1;
        c.storeList = a;
        J.sendPacket(c);
      };
    }
    function k(a) {
      y.initSuss(a);
    }
    function f(a) {
      y.delitem2(a);
    }
    function m(a) {
      F.remove();
      F.__active = 1;
      F.append();
      F.initList(a);
      F.onSubmit = function (a, b, c) {
        var d;
        d = new E.CZ.REQ_OPEN_BUYING_STORE();
        d.LimitZeny = c;
        d.storeName = b || "\u6b22\u8fce\u5149\u4e34\uff01";
        d.result = 1;
        d.ItemList = a;
        J.sendPacket(d);
      };
    }
    function q(a) {
      sessionStorage.getItem("storeName")
        ? ((Session.Entity.effectState = 64),
          sessionStorage.removeItem("storeName"),
          (a = new E.CZ.WHISPER()),
          (a.receiver = "NPC:offline"),
          (a.msg = "0"))
        : (F.initSuss(a), (a = new E.CZ.REQUEST_ACT()), (a.action = 2));
      J.sendPacket(a);
    }
    function v(a) {
      F.Openfalut(a);
    }
    function u(a) {
      F.updateStore(a);
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
    function D(a) {
      0 == a.Type ? Q.append() : Q.remove();
    }
    function B(a) {
      if (0 == a.result) {
        var b = W.getItemByIndex(a.Index);
        Q.update(2);
        Q.addItemSub(a.Index, b.count_);
        W.removeItem(a.Index, b.count_);
        W.toggle();
      } else ba.setMsg("\u6dfb\u52a0\u5931\u8d25", M.TYPE.ERROR);
    }
    function H(a) {
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
    function C(a) {
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
    function z(a) {
      Q.setList(a);
    }
    function G(a) {
      V.setInit(a);
    }
    function P(a) {
      V.setList(a);
    }
    function N(a) {
      0 == a.result
        ? (M.addText("\u8d2d\u4e70\u6210\u529f", M.TYPE.PRIVATE),
          V.BuyResult(a),
          ba.setMsg("\u8d2d\u4e70\u6210\u529f"))
        : (M.addText("\u8d2d\u4e70\u5931\u8d25", M.TYPE.ERROR),
          ba.setMsg("\u8d2d\u4e70\u5931\u8d25"));
    }
    function I(a) {
      K.remove();
      0 == a.rs
        ? (M.addText("\u8d2d\u4e70\u6210\u529f", M.TYPE.PRIVATE),
          ba.setMsg("\u8d2d\u4e70\u6210\u529f"))
        : (M.addText("\u8d2d\u4e70\u5931\u8d25", M.TYPE.ERROR),
          ba.setMsg("\u8d2d\u4e70\u5931\u8d25"));
    }
    var x = a("DB/DBManager"),
      J = a("Network/NetworkManager"),
      E = a("Network/PacketStructure"),
      L = a("Renderer/EntityManager");
    a("Preferences/Controls");
    var y = a("UI/Components/PlayerStore/PlayerStore"),
      F = a("UI/Components/BuyingStore/BuyingStore"),
      K = a("UI/Components/NpcStore/NpcStore"),
      M = a("UI/Components/ChatBox/ChatBox"),
      Q = a("UI/Components/Auction/Auction"),
      W = a("UI/Components/Inventory/Inventory"),
      V = a("UI/Components/Shop/CashShop"),
      ba = a("UI/Components/ItemObtain/ItemObtain");
    y.onRemove2 = function () {
      var a;
      a = new E.CZ.REQ_OPENSTORE2();
      J.sendPacket(a);
      a = new E.CZ.REQ_CLOSESTORE();
      J.sendPacket(a);
    };
    F.onRemove2 = function () {
      var a = new E.CZ.REQ_CLOSE_BUYING_STORE();
      J.sendPacket(a);
      a = new E.CZ.REQUEST_ACT();
      a.action = 3;
      J.sendPacket(a);
    };
    return function () {
      J.hookPacket(E.ZC.PC_CASH_POINT_ITEMLIST, b);
      J.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST, c);
      J.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST2, c);
      J.hookPacket(E.ZC.NPC_BARTER_MARKET_ITEMINFO, d);
      J.hookPacket(E.ZC.NPC_MARKET_OPEN, e);
      J.hookPacket(E.ZC.NPC_EXPANDED_BARTER_MARKET_ITEMINFO, l);
      J.hookPacket(E.ZC.NPC_MARKET_PURCHASE_RESULT, I);
      J.hookPacket(E.ZC.PC_PURCHASE_RESULT, h);
      J.hookPacket(E.ZC.PC_SELL_ITEMLIST, r);
      J.hookPacket(E.ZC.PC_SELL_RESULT, t);
      J.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST_FROMMC, n);
      J.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST_FROMMC2, n);
      J.hookPacket(E.ZC.PC_PURCHASE_ITEMLIST_FROMMC3, n);
      J.hookPacket(E.ZC.ACK_ITEMLIST_BUYING_STORE, g);
      J.hookPacket(E.ZC.PC_PURCHASE_RESULT_FROMMC, h);
      J.hookPacket(E.ZC.OPENSTORE, p);
      J.hookPacket(E.ZC.PC_PURCHASE_MYITEMLIST, k);
      J.hookPacket(E.ZC.PC_PURCHASE_MYITEMLIST2, k);
      J.hookPacket(E.ZC.DELETEITEM_FROM_MCSTORE, f);
      J.hookPacket(E.ZC.DELETEITEM_FROM_MCSTORE2, f);
      J.hookPacket(E.ZC.OPEN_BUYING_STORE, m);
      J.hookPacket(E.ZC.MYITEMLIST_BUYING_STORE, q);
      J.hookPacket(E.ZC.FAILED_OPEN_BUYING_STORE_TO_BUYER, v);
      J.hookPacket(E.ZC.UPDATE_ITEM_FROM_BUYING_STORE, u);
      J.hookPacket(E.ZC.UPDATE_ITEM_FROM_BUYING_STORE2, u);
      J.hookPacket(E.ZC.FAILED_TRADE_BUYING_STORE_TO_SELLER, A);
      J.hookPacket(E.ZC.AUCTION_WINDOWS, D);
      J.hookPacket(E.ZC.ACK_AUCTION_ADD_ITEM, B);
      J.hookPacket(E.ZC.AUCTION_RESULT, H);
      J.hookPacket(E.ZC.AUCTION_ITEM_REQ_SEARCH, z);
      J.hookPacket(E.ZC.AUCTION_ACK_MY_SELL_STOP, C);
      J.hookPacket(E.ZC.OPEN_CASHSHOP_RESULT, G);
      J.hookPacket(E.ZC.SE_CASHSHOP_OPEN, G);
      J.hookPacket(E.ZC.ZC_ACK_SCHEDULER_CASHITEM, P);
      J.hookPacket(E.ZC.OPEN_CASHSHOP_RESULT2, N);
    };
  },
);
