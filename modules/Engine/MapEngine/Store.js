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
        d = new D.CZ.PC_BUY_CASH_POINT_ITEM();
        c = a.length;
        for (b = 0; b < c; ++b)
          d.itemList.push({ ITID: a[b].ITID, count: a[b].count });
        I.sendPacket(d);
      };
    }
    function c(a) {
      K.append();
      K.setType(K.Type.BUY);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        var b, c, d;
        d = new D.CZ.PC_PURCHASE_ITEMLIST();
        c = a.length;
        for (b = 0; b < c; ++b)
          d.itemList.push({ ITID: a[b].ITID, count: a[b].count });
        I.sendPacket(d);
      };
    }
    function d(a) {
      K.append();
      K.setType(K.Type.BARTER_BUY);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        if (0 < a.length) {
          var b, c, d;
          d = new D.CZ.NPC_BARTER_MARKET_PURCHASE();
          c = a.length;
          for (b = 0; b < c; ++b)
            d.itemList.push({
              ITID: a[b].ITID,
              amount: a[b].count,
              invIndex: a[b].invIndex,
              shopIndex: a[b].index,
            });
          I.sendPacket(d);
        }
        d = new D.CZ.NPC_BARTER_MARKET_CLOSE();
        I.sendPacket(d);
      };
    }
    function e(a) {
      K.append();
      K.setType(K.Type.BUY);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        if (0 < a.length) {
          var b, c, d;
          d = new D.CZ.NPC_MARKET_PURCHASE();
          c = a.length;
          for (b = 0; b < c; ++b)
            d.itemList.push({ ITID: a[b].ITID, amount: a[b].count });
          I.sendPacket(d);
        }
        d = new D.CZ.NPC_MARKET_CLOSE();
        I.sendPacket(d);
      };
    }
    function m(a) {
      K.append();
      K.setType(K.Type.BARTER_MARKET_BUY);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        if (0 < a.length) {
          var b, c, d;
          d = new D.CZ.NPC_EXPANDED_BARTER_MARKET_PURCHASE();
          c = a.length;
          for (b = 0; b < c; ++b)
            d.itemList.push({
              ITID: a[b].ITID,
              shopIndex: a[b].index,
              amount: a[b].count,
            });
          I.sendPacket(d);
        }
        d = new D.CZ.NPC_EXPANDED_BARTER_MARKET_CLOSE();
        I.sendPacket(d);
      };
    }
    function h(a) {
      K.remove();
      switch (a.result) {
        case 0:
          N.addText(x.getMessage(54), N.TYPE.BLUE);
          break;
        case 1:
          N.addText(x.getMessage(55), N.TYPE.ERROR);
          break;
        case 2:
          N.addText(x.getMessage(56), N.TYPE.ERROR);
          break;
        case 4:
          N.addText(x.getMessage(230), N.TYPE.ERROR);
          break;
        case 5:
          N.addText(x.getMessage(281), N.TYPE.ERROR);
          break;
        case 7:
          N.addText(x.getMessage(1797), N.TYPE.ERROR);
          break;
        default:
          N.addText(x.getMessage(57), N.TYPE.ERROR);
      }
    }
    function q(a) {
      K.append();
      K.setType(K.Type.SELL);
      K.setList(a.itemList);
      K.onSubmit = function (a) {
        var b, c, d;
        d = new D.CZ.PC_SELL_ITEMLIST();
        c = a.length;
        for (b = 0; b < c; ++b)
          d.itemList.push({ index: a[b].index, count: a[b].count });
        I.sendPacket(d);
      };
    }
    function r(a) {
      K.remove();
      0 === a.result
        ? N.addText(x.getMessage(54), N.TYPE.BLUE)
        : N.addText(x.getMessage(57), N.TYPE.ERROR);
    }
    function k(a) {
      K.append();
      K.setType(K.Type.VENDING_STORE);
      K.setList(a.itemList);
      K.onSubmit = function (b) {
        K.remove();
        var c, d, e;
        a instanceof D.ZC.PC_PURCHASE_ITEMLIST_FROMMC3
          ? ((e = new D.CZ.PC_PURCHASE_ITEMLIST_FROMMC2()),
            (e.UniqueID = a.UniqueID))
          : a instanceof D.ZC.PC_PURCHASE_ITEMLIST_FROMMC2
            ? ((e = new D.CZ.PC_PURCHASE_ITEMLIST_FROMMC2()),
              (e.UniqueID = a.UniqueID))
            : (e = new D.CZ.PC_PURCHASE_ITEMLIST_FROMMC());
        e.AID = a.AID;
        d = b.length;
        for (c = 0; c < d; ++c)
          e.itemList.push({ index: b[c].index, count: b[c].count });
        I.sendPacket(e);
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
        e = new D.CZ.REQ_TRADE_BUYING_STORE();
        e.makerAID = a.makerAID;
        e.StoreID = a.StoreID;
        d = b.length;
        for (c = 0; c < d; ++c)
          e.ItemList.push({
            id: b[c].ITID,
            index: b[c].index,
            count: b[c].count,
          });
        I.sendPacket(e);
      };
    }
    function u(a) {
      y.append();
      y.initList(a);
      y.onSubmit = function (a, b) {
        var c;
        c = new D.CZ.REQ_OPENSTORE2();
        c.storeName = b || "\u6b22\u8fce\u5149\u4e34\uff01";
        c.result = 1;
        c.storeList = a;
        I.sendPacket(c);
      };
    }
    function l(a) {
      y.initSuss(a);
    }
    function f(a) {
      y.delitem2(a);
    }
    function n(a) {
      G.remove();
      G.__active = 1;
      G.append();
      G.initList(a);
      G.onSubmit = function (a, b, c) {
        var d;
        d = new D.CZ.REQ_OPEN_BUYING_STORE();
        d.LimitZeny = c;
        d.storeName = b || "\u6b22\u8fce\u5149\u4e34\uff01";
        d.result = 1;
        d.ItemList = a;
        I.sendPacket(d);
      };
    }
    function p(a) {
      sessionStorage.getItem("storeName")
        ? ((Session.Entity.effectState = 64),
          sessionStorage.removeItem("storeName"),
          (a = new D.CZ.WHISPER()),
          (a.receiver = "NPC:offline"),
          (a.msg = "0"))
        : (G.initSuss(a), (a = new D.CZ.REQUEST_ACT()), (a.action = 2));
      I.sendPacket(a);
    }
    function v(a) {
      G.Openfalut(a);
    }
    function t(a) {
      G.updateStore(a);
    }
    function z(a) {
      switch (a.Result) {
        case 5:
          N.addText(
            "\u91c7\u8d2d\u5546\u5e97\u5f00\u542f\u5931\u8d25",
            N.TYPE.ERROR,
          );
          break;
        case 6:
          N.addText("\u4f9b\u8fc7\u4e8e\u6c42", N.TYPE.ERROR);
          break;
        case 7:
          N.addText(
            "\u5bf9\u65b9\u6ca1\u6709\u8db3\u591f\u7684\u91d1\u94b1",
            N.TYPE.ERROR,
          );
      }
    }
    function E(a) {
      0 == a.Type ? Q.append() : Q.remove();
    }
    function C(a) {
      if (0 == a.result) {
        var b = W.getItemByIndex(a.Index);
        Q.update(2);
        Q.addItemSub(a.Index, b.count_);
        W.removeItem(a.Index, b.count_);
        W.toggle();
      } else ba.setMsg("\u6dfb\u52a0\u5931\u8d25", N.TYPE.ERROR);
    }
    function J(a) {
      1 == a.Result
        ? (Q.update(1),
          N.addText("\u6210\u529f\u767b\u8bb0\u7269\u54c1", N.TYPE.PRIVATE),
          ba.setMsg("\u6210\u529f\u767b\u8bb0\u7269\u54c1"))
        : 2 == a.Result
          ? (N.addText(
              "\u5546\u54c1\u5df2\u4e0b\u67b6\uff0c\u5546\u54c1\u5df2\u53d1\u9001\u81f3\u90ae\u4ef6",
              N.TYPE.ERROR,
            ),
            ba.setMsg("\u5546\u54c1\u5df2\u4e0b\u67b6"),
            Q.update(1))
          : 4 == a.Result
            ? (Q.update(1),
              N.addText(
                "\u6700\u591a\u767b\u8bb010\u4e2a\u7269\u54c1",
                N.TYPE.ERROR,
              ),
              ba.setMsg("\u6700\u591a\u767b\u8bb010\u4e2a\u7269\u54c1"))
            : 5 == a.Result
              ? (N.addText(
                  "\u624b\u7eed\u8d39\u7f34\u8d39\u5931\u8d25",
                  N.TYPE.ERROR,
                ),
                ba.setMsg("\u624b\u7eed\u8d39\u7f34\u8d39\u5931\u8d25"))
              : 6 == a.Result
                ? (N.addText(
                    "\u5546\u54c1\u5df2\u53d1\u9001\u81f3\u90ae\u4ef6",
                    N.TYPE.PRIVATE,
                  ),
                  ba.setMsg("\u5546\u54c1\u5df2\u53d1\u9001\u81f3\u90ae\u4ef6"),
                  Q.updatePage())
                : N.addText("\u4ea4\u6613\u5931\u8d25", N.TYPE.ERROR);
    }
    function A(a) {
      1 == a.Result
        ? (N.addText("\u5546\u54c1\u5df2\u4e0b\u67b6", N.TYPE.PRIVATE),
          ba.setMsg("\u5546\u54c1\u5df2\u4e0b\u67b6"))
        : 2 == a.Result
          ? (N.addText("\u5546\u54c1\u4e0d\u80fd\u4e0b\u67b6", N.TYPE.ERROR),
            ba.setMsg("\u5546\u54c1\u4e0d\u80fd\u4e0b\u67b6"))
          : (N.addText(
              "\u5546\u54c1\u53ef\u80fd\u5df2\u51fa\u552e",
              N.TYPE.PRIVATE,
            ),
            ba.setMsg("\u5546\u54c1\u53ef\u80fd\u5df2\u51fa\u552e"));
      Q.update(1);
    }
    function B(a) {
      Q.setList(a);
    }
    function F(a) {
      V.setInit(a);
    }
    function O(a) {
      V.setList(a);
    }
    function M(a) {
      0 == a.result
        ? (N.addText("\u8d2d\u4e70\u6210\u529f", N.TYPE.PRIVATE),
          V.BuyResult(a),
          ba.setMsg("\u8d2d\u4e70\u6210\u529f"))
        : (N.addText("\u8d2d\u4e70\u5931\u8d25", N.TYPE.ERROR),
          ba.setMsg("\u8d2d\u4e70\u5931\u8d25"));
    }
    function H(a) {
      K.remove();
      0 == a.rs
        ? (N.addText("\u8d2d\u4e70\u6210\u529f", N.TYPE.PRIVATE),
          ba.setMsg("\u8d2d\u4e70\u6210\u529f"))
        : (N.addText("\u8d2d\u4e70\u5931\u8d25", N.TYPE.ERROR),
          ba.setMsg("\u8d2d\u4e70\u5931\u8d25"));
    }
    var x = a("DB/DBManager"),
      I = a("Network/NetworkManager"),
      D = a("Network/PacketStructure"),
      L = a("Renderer/EntityManager");
    a("Preferences/Controls");
    var y = a("UI/Components/PlayerStore/PlayerStore"),
      G = a("UI/Components/BuyingStore/BuyingStore"),
      K = a("UI/Components/NpcStore/NpcStore"),
      N = a("UI/Components/ChatBox/ChatBox"),
      Q = a("UI/Components/Auction/Auction"),
      W = a("UI/Components/Inventory/Inventory"),
      V = a("UI/Components/Shop/CashShop"),
      ba = a("UI/Components/ItemObtain/ItemObtain");
    y.onRemove2 = function () {
      var a;
      a = new D.CZ.REQ_OPENSTORE2();
      I.sendPacket(a);
      a = new D.CZ.REQ_CLOSESTORE();
      I.sendPacket(a);
    };
    G.onRemove2 = function () {
      var a = new D.CZ.REQ_CLOSE_BUYING_STORE();
      I.sendPacket(a);
      a = new D.CZ.REQUEST_ACT();
      a.action = 3;
      I.sendPacket(a);
    };
    return function () {
      I.hookPacket(D.ZC.PC_CASH_POINT_ITEMLIST, b);
      I.hookPacket(D.ZC.PC_PURCHASE_ITEMLIST, c);
      I.hookPacket(D.ZC.PC_PURCHASE_ITEMLIST2, c);
      I.hookPacket(D.ZC.NPC_BARTER_MARKET_ITEMINFO, d);
      I.hookPacket(D.ZC.NPC_MARKET_OPEN, e);
      I.hookPacket(D.ZC.NPC_EXPANDED_BARTER_MARKET_ITEMINFO, m);
      I.hookPacket(D.ZC.NPC_MARKET_PURCHASE_RESULT, H);
      I.hookPacket(D.ZC.PC_PURCHASE_RESULT, h);
      I.hookPacket(D.ZC.PC_SELL_ITEMLIST, q);
      I.hookPacket(D.ZC.PC_SELL_RESULT, r);
      I.hookPacket(D.ZC.PC_PURCHASE_ITEMLIST_FROMMC, k);
      I.hookPacket(D.ZC.PC_PURCHASE_ITEMLIST_FROMMC2, k);
      I.hookPacket(D.ZC.PC_PURCHASE_ITEMLIST_FROMMC3, k);
      I.hookPacket(D.ZC.ACK_ITEMLIST_BUYING_STORE, g);
      I.hookPacket(D.ZC.PC_PURCHASE_RESULT_FROMMC, h);
      I.hookPacket(D.ZC.OPENSTORE, u);
      I.hookPacket(D.ZC.PC_PURCHASE_MYITEMLIST, l);
      I.hookPacket(D.ZC.PC_PURCHASE_MYITEMLIST2, l);
      I.hookPacket(D.ZC.DELETEITEM_FROM_MCSTORE, f);
      I.hookPacket(D.ZC.DELETEITEM_FROM_MCSTORE2, f);
      I.hookPacket(D.ZC.OPEN_BUYING_STORE, n);
      I.hookPacket(D.ZC.MYITEMLIST_BUYING_STORE, p);
      I.hookPacket(D.ZC.FAILED_OPEN_BUYING_STORE_TO_BUYER, v);
      I.hookPacket(D.ZC.UPDATE_ITEM_FROM_BUYING_STORE, t);
      I.hookPacket(D.ZC.UPDATE_ITEM_FROM_BUYING_STORE2, t);
      I.hookPacket(D.ZC.FAILED_TRADE_BUYING_STORE_TO_SELLER, z);
      I.hookPacket(D.ZC.AUCTION_WINDOWS, E);
      I.hookPacket(D.ZC.ACK_AUCTION_ADD_ITEM, C);
      I.hookPacket(D.ZC.AUCTION_RESULT, J);
      I.hookPacket(D.ZC.AUCTION_ITEM_REQ_SEARCH, B);
      I.hookPacket(D.ZC.AUCTION_ACK_MY_SELL_STOP, A);
      I.hookPacket(D.ZC.OPEN_CASHSHOP_RESULT, F);
      I.hookPacket(D.ZC.SE_CASHSHOP_OPEN, F);
      I.hookPacket(D.ZC.ZC_ACK_SCHEDULER_CASHITEM, O);
      I.hookPacket(D.ZC.OPEN_CASHSHOP_RESULT2, M);
    };
  },
);
