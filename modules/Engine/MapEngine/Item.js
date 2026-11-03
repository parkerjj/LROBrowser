define(
  "Engine/MapEngine/Item",
  "require Utils/jquery DB/DBManager Renderer/EffectManager DB/Items/EquipmentLocation Network/NetworkManager Network/PacketStructure Renderer/ItemObject Renderer/Map/Altitude Engine/SessionStorage DB/Items/ItemEffect UI/Components/ChatBox/ChatBox UI/Components/ItemObtain/ItemObtain UI/Components/ItemSelection/ItemSelection UI/Components/Inventory/Inventory UI/Components/Equipment/Equipment UI/Components/Storage/Storage UI/Components/OnPushCart/OnPushCart UI/Components/ItemInfo/ItemInfo UI/Components/RefineUI/RefineUI UI/Components/ShortCut/ShortCut Preferences/Controls".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = a.xPos - 0.5 + a.subX / 12,
        c = a.yPos - 0.5 + a.subY / 12,
        d = M.getCellHeight(b, c);
      L.add(a.ITAID, a.ITID, a.IsIdentified, a.count, b, c, d);
    }
    function c(a) {
      var b = a.xPos - 0.5 + a.subX / 12,
        c = a.yPos - 0.5 + a.subY / 12,
        d = M.getCellHeight(b, c) + 5;
      L.add(a.ITAID, a.ITID, a.IsIdentified, a.count, b, c, d, a.canShowEffect);
    }
    function d(a) {
      da.setBound(a.index);
    }
    function e(a) {
      L.remove(a.ITAID);
    }
    function m(a) {
      if (0 !== a.result) V.addText(K.getMessage(53), V.TYPE.ERROR);
      else {
        W.append();
        W.set(a);
        var b = K.getItemInfo(a.ITID);
        V.addText(
          K.getMessage(153)
            .replace(
              "%s",
              a.IsIdentified ? K.getItemName(a) : b.unidentifiedDiSPlayName,
            )
            .replace("%d", a.count),
          V.TYPE.BLUE,
        );
        T.addItem(a);
      }
    }
    function h(a) {
      T.setItems(a.itemInfo || a.ItemInfo);
    }
    function t(a) {
      switch (a.type) {
        case 0:
          T.setItems(a.itemInfo || a.ItemInfo);
          break;
        case 1:
          S.setItems(a.itemInfo || a.ItemInfo);
          break;
        case 2:
          ea = ea.concat(a.ItemInfo || a.itemInfo);
      }
    }
    function r(a) {
      S.setItems(a.itemInfo || a.ItemInfo);
    }
    function n(a) {
      T.removeItem(a.Index, a.count || a.Count || 0);
    }
    function g(a) {
      T.removeItem(a.index, a.count || a.Count || 0);
    }
    function p(a) {
      if (a.result) {
        var b = da.unEquip(a.index, a.wearLocation);
        if (b) {
          b.WearState = 0;
          var c = K.getItemInfo(b.ITID);
          V.addText(
            c.identifiedDiSPlayName + " " + K.getMessage(171),
            V.TYPE.ERROR,
          );
          a.wearLocation & F.AMMO || T.addItem(b);
        }
      }
    }
    function l(a) {
      if (1 == a.result) {
        var b = T.removeItem(a.index, 1),
          c = K.getItemInfo(b.ITID);
        da.equip(b, a.wearLocation);
        V.addText(
          c.identifiedDiSPlayName + " " + K.getMessage(170),
          V.TYPE.BLUE,
        );
      } else V.addText(K.getMessage(372), V.TYPE.ERROR);
    }
    function f(a) {
      da.ShowOEquip(a);
    }
    function k(a) {
      (a.hasOwnProperty("AID") && Q.Entity.GID !== a.AID) ||
        !a.result ||
        T.updateItem(a.index, a.count);
      a.result && E.spamItem(a.id, a.AID, null, null, null);
    }
    function q(a) {
      da.setEquipConfig(a.bOpenEquipmentWin);
      V.addText(
        K.getMessage(1358 + (a.bOpenEquipmentWin ? 1 : 0)),
        V.TYPE.INFO,
      );
    }
    function u(a) {
      a = T.getItemByIndex(a.index);
      da.equip(a, F.AMMO);
    }
    function v(a) {
      if (a.ITIDList.length) {
        var b = T.getItemByIndex(ta);
        ba.append();
        ba.setList(a.ITIDList);
        ba.setTitle(
          K.getMessage(522) +
            "(" +
            K.getItemInfo(b.ITID).identifiedDiSPlayName +
            ")",
        );
        ba.onIndexSelected = function (a) {
          if (0 <= a) {
            var b = new G.CZ.REQ_ITEMCOMPOSITION();
            b.cardIndex = ta;
            b.equipIndex = a;
            z.sendPacket(b);
          }
          ta = null;
        };
      }
    }
    function A(a) {
      switch (a.result) {
        case 0:
          var b = T.removeItem(a.equipIndex, 1);
          a = T.removeItem(a.cardIndex, 1);
          if (b) {
            for (var c = 0; 4 > c; ++c)
              if (!b.slot["card" + (c + 1)]) {
                b.slot["card" + (c + 1)] = a.ITID;
                break;
              }
            T.addItem(b);
          }
      }
    }
    function C(a) {
      var b = T.removeItem(a.itemIndex, 1);
      b && ((b.RefiningLevel = a.RefiningLevel), T.addItem(b));
      switch (a.result) {
        case 0:
          fa.ui && fa.ui.is(":visible") && fa.setStep(4);
          break;
        case 1:
          V.addText("\u7cbe\u70bc\u5931\u8d25", V.TYPE.INFO);
          fa.ui && fa.ui.is(":visible") && fa.setStep(6);
          break;
        case 2:
          V.addText(
            "\u7cbe\u70bc\u5931\u8d25\uff0c\u6389\u6bb5\u4e86",
            V.TYPE.INFO,
          );
          fa.ui && fa.ui.is(":visible") && fa.setStep(7);
          break;
        case 3:
          V.addText(
            "\u7cbe\u70bc\u5931\u8d25\uff0c\u5e78\u597d\u9632\u7206\u4fdd\u4f4f\u4e86\u88c5\u5907",
            V.TYPE.INFO,
          );
          fa.ui && fa.ui.is(":visible") && fa.setStep(7);
          break;
        case 4:
          (V.addText(
            "\u7cbe\u70bc\u5931\u8d25\uff0c\u5e78\u597d\u88c5\u5907\u6ca1\u635f\u574f",
            V.TYPE.INFO,
          ),
            fa.ui && fa.ui.is(":visible") && fa.setStep(7));
      }
    }
    function B(a) {
      0 == a.result
        ? V.addText("\u4fee\u7406\u6210\u529f", V.TYPE.PUBLIC)
        : V.addText("\u4fee\u7406\u5931\u8d25", V.TYPE.PUBLIC);
    }
    function J(a) {
      var b = K.getItemInfo(a.ITID);
      V.addText(
        b.identifiedDiSPlayName +
          " \u9053\u5177\u7684\u4f7f\u7528\u65f6\u95f4\u6240\u5269\uff1a" +
          Math.ceil(a.RemainSecond / 60) +
          "\u5206\u949f",
        V.TYPE.PRIVATE,
      );
    }
    function D(a) {
      var b = { GID: 0, CName: "" };
      b.GID = a.GID;
      b.CName = a.CName;
      T.updateInfos(b);
    }
    function y(a) {
      x("#Storage").is(":visible") || R.append();
      R.setItemInfo(a.curCount, a.maxCount);
      R.setItems(ea);
      ea = [];
    }
    function H(a) {
      ea = ea.concat(a.ItemInfo || a.itemInfo);
    }
    function N(a) {
      R.addItem(x.extend({}, a));
    }
    function O(a) {
      R.removeItem(a.index, a.count);
    }
    function I() {
      R.remove();
    }
    var x = a("Utils/jquery"),
      K = a("DB/DBManager"),
      E = a("Renderer/EffectManager"),
      F = a("DB/Items/EquipmentLocation"),
      z = a("Network/NetworkManager"),
      G = a("Network/PacketStructure"),
      L = a("Renderer/ItemObject"),
      M = a("Renderer/Map/Altitude"),
      Q = a("Engine/SessionStorage");
    a("DB/Items/ItemEffect");
    var V = a("UI/Components/ChatBox/ChatBox"),
      W = a("UI/Components/ItemObtain/ItemObtain"),
      ba = a("UI/Components/ItemSelection/ItemSelection"),
      S = a("UI/Components/OnPushCart/OnPushCart"),
      T = a("UI/Components/Inventory/Inventory"),
      da = a("UI/Components/Equipment/Equipment"),
      R = a("UI/Components/Storage/Storage");
    a("UI/Components/ItemInfo/ItemInfo");
    var fa = a("UI/Components/RefineUI/RefineUI");
    a("UI/Components/ShortCut/ShortCut");
    a("Preferences/Controls");
    var ea = [],
      ta;
    T.onUseCard = function (a) {
      ta = a;
      var b = new G.CZ.REQ_ITEMCOMPOSITION_LIST();
      b.cardIndex = a;
      z.sendPacket(b);
    };
    R.onClosePressed = function () {
      var a = new G.CZ.CLOSE_STORE();
      z.sendPacket(a);
      R.remove();
    };
    R.reqAddItem = function (a, b) {
      if (!(0 >= b)) {
        var c = new G.CZ.MOVE_ITEM_FROM_BODY_TO_STORE();
        c.index = a;
        c.count = b;
        z.sendPacket(c);
      }
    };
    R.reqAddItem1 = function (a, b) {
      if (!(0 >= b)) {
        var c = new G.CZ.MOVE_ITEM_FROM_CART_TO_STORE();
        c.index = a;
        c.count = b;
        z.sendPacket(c);
      }
    };
    R.reqRemoveItem = function (a, b) {
      if (!(0 >= b)) {
        var c = new G.CZ.MOVE_ITEM_FROM_STORE_TO_BODY();
        c.index = a;
        c.count = b;
        z.sendPacket(c);
      }
    };
    R.reqRemoveItem1 = function (a, b) {
      if (!(0 >= b)) {
        var c = new G.CZ.MOVE_ITEM_FROM_STORE_TO_CART();
        c.index = a;
        c.count = b;
        z.sendPacket(c);
      }
    };
    return function () {
      z.hookPacket(G.ZC.ITEM_ENTRY, b);
      z.hookPacket(G.ZC.ITEM_FALL_ENTRY, c);
      z.hookPacket(G.ZC.ITEM_FALL_ENTRY2, c);
      z.hookPacket(G.ZC.ITEM_FALL_ENTRY3, c);
      z.hookPacket(G.ZC.NOTIFY_BIND_ON_EQUIP, d);
      z.hookPacket(G.ZC.ITEM_DISAPPEAR, e);
      z.hookPacket(G.ZC.ITEM_PICKUP_ACK, m);
      z.hookPacket(G.ZC.ITEM_PICKUP_ACK2, m);
      z.hookPacket(G.ZC.ITEM_PICKUP_ACK3, m);
      z.hookPacket(G.ZC.ITEM_PICKUP_ACK5, m);
      z.hookPacket(G.ZC.ITEM_PICKUP_ACK6, m);
      z.hookPacket(G.ZC.ITEM_PICKUP_ACK_V7, m);
      z.hookPacket(G.ZC.ITEM_PICKUP_ACK_V8, m);
      z.hookPacket(G.ZC.ITEM_THROW_ACK, n);
      z.hookPacket(G.ZC.NORMAL_ITEMLIST, h);
      z.hookPacket(G.ZC.NORMAL_ITEMLIST2, h);
      z.hookPacket(G.ZC.NORMAL_ITEMLIST3, h);
      z.hookPacket(G.ZC.NORMAL_ITEMLIST4, h);
      z.hookPacket(G.ZC.EQUIPMENT_ITEMLIST, h);
      z.hookPacket(G.ZC.EQUIPMENT_ITEMLIST2, h);
      z.hookPacket(G.ZC.EQUIPMENT_ITEMLIST3, h);
      z.hookPacket(G.ZC.EQUIPMENT_ITEMLIST4, h);
      z.hookPacket(G.ZC.EQUIPMENT_ITEMLIST5, h);
      z.hookPacket(G.ZC.CART_NORMAL_ITEMLIST4, r);
      z.hookPacket(G.ZC.CART_EQUIPMENT_ITEMLIST4, r);
      z.hookPacket(G.ZC.CART_EQUIPMENT_ITEMLIST5, r);
      z.hookPacket(G.ZC.REQ_TAKEOFF_EQUIP_ACK, p);
      z.hookPacket(G.ZC.REQ_TAKEOFF_EQUIP_ACK2, p);
      z.hookPacket(G.ZC.ACK_TAKEOFF_EQUIP_V5, p);
      z.hookPacket(G.ZC.REQ_WEAR_EQUIP_ACK, l);
      z.hookPacket(G.ZC.REQ_WEAR_EQUIP_ACK2, l);
      z.hookPacket(G.ZC.ACK_WEAR_EQUIP_V5, l);
      z.hookPacket(G.ZC.EQUIPWIN_MICROSCOPE_V5, f);
      z.hookPacket(G.ZC.EQUIPWIN_MICROSCOPE_V6, f);
      z.hookPacket(G.ZC.EQUIPWIN_MICROSCOPE3, f);
      z.hookPacket(G.ZC.DELETE_ITEM_FROM_BODY, n);
      z.hookPacket(G.ZC.USE_ITEM_ACK, k);
      z.hookPacket(G.ZC.USE_ITEM_ACK2, k);
      z.hookPacket(G.ZC.CONFIG_NOTIFY, q);
      z.hookPacket(G.ZC.EQUIP_ARROW, u);
      z.hookPacket(G.ZC.ITEMCOMPOSITION_LIST, v);
      z.hookPacket(G.ZC.ACK_ITEMCOMPOSITION, A);
      z.hookPacket(G.ZC.ACK_ITEMREFINING, C);
      z.hookPacket(G.ZC.ACK_ITEMREPAIR, B);
      z.hookPacket(G.ZC.ITEM_DELETE_BUYING_STORE, g);
      z.hookPacket(G.ZC.CASH_TIME_COUNTER, J);
      z.hookPacket(G.ZC.ACK_REQNAME_BYGID, D);
      z.hookPacket(G.ZC.ACK_REQNAME_BYGID2, D);
      z.hookPacket(G.ZC.STORE_NORMAL_ITEMLIST, H);
      z.hookPacket(G.ZC.STORE_NORMAL_ITEMLIST2, H);
      z.hookPacket(G.ZC.STORE_NORMAL_ITEMLIST3, H);
      z.hookPacket(G.ZC.STORE_NORMAL_ITEMLIST4, H);
      z.hookPacket(G.ZC.STORE_EQUIPMENT_ITEMLIST, H);
      z.hookPacket(G.ZC.STORE_EQUIPMENT_ITEMLIST2, H);
      z.hookPacket(G.ZC.STORE_EQUIPMENT_ITEMLIST3, H);
      z.hookPacket(G.ZC.STORE_EQUIPMENT_ITEMLIST4, H);
      z.hookPacket(G.ZC.STORE_EQUIPMENT_ITEMLIST5, H);
      z.hookPacket(G.ZC.NOTIFY_STOREITEM_COUNTINFO, y);
      z.hookPacket(G.ZC.ADD_ITEM_TO_STORE, N);
      z.hookPacket(G.ZC.ADD_ITEM_TO_STORE2, N);
      z.hookPacket(G.ZC.ADD_ITEM_TO_STORE3, N);
      z.hookPacket(G.ZC.ADD_ITEM_TO_STORE4, N);
      z.hookPacket(G.ZC.CLOSE_STORE, I);
      z.hookPacket(G.ZC.DELETE_ITEM_FROM_STORE, O);
      z.hookPacket(G.ZC.INVENTORY_ITEMLIST, t);
      z.hookPacket(G.ZC.INVENTORY_ITEMLIST_EQUIP, t);
    };
  },
);
