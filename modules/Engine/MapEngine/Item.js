define(
  "Engine/MapEngine/Item",
  "require Utils/jquery DB/DBManager Renderer/EffectManager DB/Items/EquipmentLocation Network/NetworkManager Network/PacketStructure Renderer/ItemObject Renderer/Map/Altitude Engine/SessionStorage DB/Items/ItemEffect UI/Components/ChatBox/ChatBox UI/Components/ItemObtain/ItemObtain UI/Components/ItemSelection/ItemSelection UI/Components/Inventory/Inventory UI/Components/Equipment/Equipment UI/Components/Storage/Storage UI/Components/OnPushCart/OnPushCart UI/Components/ItemInfo/ItemInfo UI/Components/RefineUI/RefineUI UI/Components/ShortCut/ShortCut Preferences/Controls".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = a.xPos - 0.5 + a.subX / 12,
        c = a.yPos - 0.5 + a.subY / 12,
        d = N.getCellHeight(b, c);
      K.add(a.ITAID, a.ITID, a.IsIdentified, a.count, b, c, d);
    }
    function c(a) {
      var b = a.xPos - 0.5 + a.subX / 12,
        c = a.yPos - 0.5 + a.subY / 12,
        d = N.getCellHeight(b, c) + 5;
      K.add(a.ITAID, a.ITID, a.IsIdentified, a.count, b, c, d, a.canShowEffect);
    }
    function d(a) {
      da.setBound(a.index);
    }
    function e(a) {
      K.remove(a.ITAID);
    }
    function m(a) {
      if (0 !== a.result) W.addText(I.getMessage(53), W.TYPE.ERROR);
      else {
        V.append();
        V.set(a);
        var b = I.getItemInfo(a.ITID);
        W.addText(
          I.getMessage(153)
            .replace(
              "%s",
              a.IsIdentified ? I.getItemName(a) : b.unidentifiedDiSPlayName,
            )
            .replace("%d", a.count),
          W.TYPE.BLUE,
        );
        T.addItem(a);
      }
    }
    function h(a) {
      T.setItems(a.itemInfo || a.ItemInfo);
    }
    function q(a) {
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
    function k(a) {
      T.removeItem(a.Index, a.count || a.Count || 0);
    }
    function g(a) {
      T.removeItem(a.index, a.count || a.Count || 0);
    }
    function u(a) {
      if (a.result) {
        var b = da.unEquip(a.index, a.wearLocation);
        if (b) {
          b.WearState = 0;
          var c = I.getItemInfo(b.ITID);
          W.addText(
            c.identifiedDiSPlayName + " " + I.getMessage(171),
            W.TYPE.ERROR,
          );
          a.wearLocation & L.AMMO || T.addItem(b);
        }
      }
    }
    function l(a) {
      if (1 == a.result) {
        var b = T.removeItem(a.index, 1),
          c = I.getItemInfo(b.ITID);
        da.equip(b, a.wearLocation);
        W.addText(
          c.identifiedDiSPlayName + " " + I.getMessage(170),
          W.TYPE.BLUE,
        );
      } else W.addText(I.getMessage(372), W.TYPE.ERROR);
    }
    function f(a) {
      da.ShowOEquip(a);
    }
    function n(a) {
      (a.hasOwnProperty("AID") && Q.Entity.GID !== a.AID) ||
        !a.result ||
        T.updateItem(a.index, a.count);
      a.result && D.spamItem(a.id, a.AID, null, null, null);
    }
    function p(a) {
      da.setEquipConfig(a.bOpenEquipmentWin);
      W.addText(
        I.getMessage(1358 + (a.bOpenEquipmentWin ? 1 : 0)),
        W.TYPE.INFO,
      );
    }
    function v(a) {
      a = T.getItemByIndex(a.index);
      da.equip(a, L.AMMO);
    }
    function t(a) {
      if (a.ITIDList.length) {
        var b = T.getItemByIndex(ta);
        ba.append();
        ba.setList(a.ITIDList);
        ba.setTitle(
          I.getMessage(522) +
            "(" +
            I.getItemInfo(b.ITID).identifiedDiSPlayName +
            ")",
        );
        ba.onIndexSelected = function (a) {
          if (0 <= a) {
            var b = new G.CZ.REQ_ITEMCOMPOSITION();
            b.cardIndex = ta;
            b.equipIndex = a;
            y.sendPacket(b);
          }
          ta = null;
        };
      }
    }
    function z(a) {
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
    function E(a) {
      var b = T.removeItem(a.itemIndex, 1);
      b && ((b.RefiningLevel = a.RefiningLevel), T.addItem(b));
      switch (a.result) {
        case 0:
          fa.ui && fa.ui.is(":visible") && fa.setStep(4);
          break;
        case 1:
          W.addText("\u7cbe\u70bc\u5931\u8d25", W.TYPE.INFO);
          fa.ui && fa.ui.is(":visible") && fa.setStep(6);
          break;
        case 2:
          W.addText(
            "\u7cbe\u70bc\u5931\u8d25\uff0c\u6389\u6bb5\u4e86",
            W.TYPE.INFO,
          );
          fa.ui && fa.ui.is(":visible") && fa.setStep(7);
          break;
        case 3:
          W.addText(
            "\u7cbe\u70bc\u5931\u8d25\uff0c\u5e78\u597d\u9632\u7206\u4fdd\u4f4f\u4e86\u88c5\u5907",
            W.TYPE.INFO,
          );
          fa.ui && fa.ui.is(":visible") && fa.setStep(7);
          break;
        case 4:
          (W.addText(
            "\u7cbe\u70bc\u5931\u8d25\uff0c\u5e78\u597d\u88c5\u5907\u6ca1\u635f\u574f",
            W.TYPE.INFO,
          ),
            fa.ui && fa.ui.is(":visible") && fa.setStep(7));
      }
    }
    function C(a) {
      0 == a.result
        ? W.addText("\u4fee\u7406\u6210\u529f", W.TYPE.PUBLIC)
        : W.addText("\u4fee\u7406\u5931\u8d25", W.TYPE.PUBLIC);
    }
    function J(a) {
      var b = I.getItemInfo(a.ITID);
      W.addText(
        b.identifiedDiSPlayName +
          " \u9053\u5177\u7684\u4f7f\u7528\u65f6\u95f4\u6240\u5269\uff1a" +
          Math.ceil(a.RemainSecond / 60) +
          "\u5206\u949f",
        W.TYPE.PRIVATE,
      );
    }
    function A(a) {
      var b = { GID: 0, CName: "" };
      b.GID = a.GID;
      b.CName = a.CName;
      T.updateInfos(b);
    }
    function B(a) {
      x("#Storage").is(":visible") || R.append();
      R.setItemInfo(a.curCount, a.maxCount);
      R.setItems(ea);
      ea = [];
    }
    function F(a) {
      ea = ea.concat(a.ItemInfo || a.itemInfo);
    }
    function O(a) {
      R.addItem(x.extend({}, a));
    }
    function M(a) {
      R.removeItem(a.index, a.count);
    }
    function H() {
      R.remove();
    }
    var x = a("Utils/jquery"),
      I = a("DB/DBManager"),
      D = a("Renderer/EffectManager"),
      L = a("DB/Items/EquipmentLocation"),
      y = a("Network/NetworkManager"),
      G = a("Network/PacketStructure"),
      K = a("Renderer/ItemObject"),
      N = a("Renderer/Map/Altitude"),
      Q = a("Engine/SessionStorage");
    a("DB/Items/ItemEffect");
    var W = a("UI/Components/ChatBox/ChatBox"),
      V = a("UI/Components/ItemObtain/ItemObtain"),
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
      y.sendPacket(b);
    };
    R.onClosePressed = function () {
      var a = new G.CZ.CLOSE_STORE();
      y.sendPacket(a);
      R.remove();
    };
    R.reqAddItem = function (a, b) {
      if (!(0 >= b)) {
        var c = new G.CZ.MOVE_ITEM_FROM_BODY_TO_STORE();
        c.index = a;
        c.count = b;
        y.sendPacket(c);
      }
    };
    R.reqAddItem1 = function (a, b) {
      if (!(0 >= b)) {
        var c = new G.CZ.MOVE_ITEM_FROM_CART_TO_STORE();
        c.index = a;
        c.count = b;
        y.sendPacket(c);
      }
    };
    R.reqRemoveItem = function (a, b) {
      if (!(0 >= b)) {
        var c = new G.CZ.MOVE_ITEM_FROM_STORE_TO_BODY();
        c.index = a;
        c.count = b;
        y.sendPacket(c);
      }
    };
    R.reqRemoveItem1 = function (a, b) {
      if (!(0 >= b)) {
        var c = new G.CZ.MOVE_ITEM_FROM_STORE_TO_CART();
        c.index = a;
        c.count = b;
        y.sendPacket(c);
      }
    };
    return function () {
      y.hookPacket(G.ZC.ITEM_ENTRY, b);
      y.hookPacket(G.ZC.ITEM_FALL_ENTRY, c);
      y.hookPacket(G.ZC.ITEM_FALL_ENTRY2, c);
      y.hookPacket(G.ZC.ITEM_FALL_ENTRY3, c);
      y.hookPacket(G.ZC.NOTIFY_BIND_ON_EQUIP, d);
      y.hookPacket(G.ZC.ITEM_DISAPPEAR, e);
      y.hookPacket(G.ZC.ITEM_PICKUP_ACK, m);
      y.hookPacket(G.ZC.ITEM_PICKUP_ACK2, m);
      y.hookPacket(G.ZC.ITEM_PICKUP_ACK3, m);
      y.hookPacket(G.ZC.ITEM_PICKUP_ACK5, m);
      y.hookPacket(G.ZC.ITEM_PICKUP_ACK6, m);
      y.hookPacket(G.ZC.ITEM_PICKUP_ACK_V7, m);
      y.hookPacket(G.ZC.ITEM_PICKUP_ACK_V8, m);
      y.hookPacket(G.ZC.ITEM_THROW_ACK, k);
      y.hookPacket(G.ZC.NORMAL_ITEMLIST, h);
      y.hookPacket(G.ZC.NORMAL_ITEMLIST2, h);
      y.hookPacket(G.ZC.NORMAL_ITEMLIST3, h);
      y.hookPacket(G.ZC.NORMAL_ITEMLIST4, h);
      y.hookPacket(G.ZC.EQUIPMENT_ITEMLIST, h);
      y.hookPacket(G.ZC.EQUIPMENT_ITEMLIST2, h);
      y.hookPacket(G.ZC.EQUIPMENT_ITEMLIST3, h);
      y.hookPacket(G.ZC.EQUIPMENT_ITEMLIST4, h);
      y.hookPacket(G.ZC.EQUIPMENT_ITEMLIST5, h);
      y.hookPacket(G.ZC.CART_NORMAL_ITEMLIST4, r);
      y.hookPacket(G.ZC.CART_EQUIPMENT_ITEMLIST4, r);
      y.hookPacket(G.ZC.CART_EQUIPMENT_ITEMLIST5, r);
      y.hookPacket(G.ZC.REQ_TAKEOFF_EQUIP_ACK, u);
      y.hookPacket(G.ZC.REQ_TAKEOFF_EQUIP_ACK2, u);
      y.hookPacket(G.ZC.ACK_TAKEOFF_EQUIP_V5, u);
      y.hookPacket(G.ZC.REQ_WEAR_EQUIP_ACK, l);
      y.hookPacket(G.ZC.REQ_WEAR_EQUIP_ACK2, l);
      y.hookPacket(G.ZC.ACK_WEAR_EQUIP_V5, l);
      y.hookPacket(G.ZC.EQUIPWIN_MICROSCOPE_V5, f);
      y.hookPacket(G.ZC.EQUIPWIN_MICROSCOPE_V6, f);
      y.hookPacket(G.ZC.EQUIPWIN_MICROSCOPE3, f);
      y.hookPacket(G.ZC.DELETE_ITEM_FROM_BODY, k);
      y.hookPacket(G.ZC.USE_ITEM_ACK, n);
      y.hookPacket(G.ZC.USE_ITEM_ACK2, n);
      y.hookPacket(G.ZC.CONFIG_NOTIFY, p);
      y.hookPacket(G.ZC.EQUIP_ARROW, v);
      y.hookPacket(G.ZC.ITEMCOMPOSITION_LIST, t);
      y.hookPacket(G.ZC.ACK_ITEMCOMPOSITION, z);
      y.hookPacket(G.ZC.ACK_ITEMREFINING, E);
      y.hookPacket(G.ZC.ACK_ITEMREPAIR, C);
      y.hookPacket(G.ZC.ITEM_DELETE_BUYING_STORE, g);
      y.hookPacket(G.ZC.CASH_TIME_COUNTER, J);
      y.hookPacket(G.ZC.ACK_REQNAME_BYGID, A);
      y.hookPacket(G.ZC.ACK_REQNAME_BYGID2, A);
      y.hookPacket(G.ZC.STORE_NORMAL_ITEMLIST, F);
      y.hookPacket(G.ZC.STORE_NORMAL_ITEMLIST2, F);
      y.hookPacket(G.ZC.STORE_NORMAL_ITEMLIST3, F);
      y.hookPacket(G.ZC.STORE_NORMAL_ITEMLIST4, F);
      y.hookPacket(G.ZC.STORE_EQUIPMENT_ITEMLIST, F);
      y.hookPacket(G.ZC.STORE_EQUIPMENT_ITEMLIST2, F);
      y.hookPacket(G.ZC.STORE_EQUIPMENT_ITEMLIST3, F);
      y.hookPacket(G.ZC.STORE_EQUIPMENT_ITEMLIST4, F);
      y.hookPacket(G.ZC.STORE_EQUIPMENT_ITEMLIST5, F);
      y.hookPacket(G.ZC.NOTIFY_STOREITEM_COUNTINFO, B);
      y.hookPacket(G.ZC.ADD_ITEM_TO_STORE, O);
      y.hookPacket(G.ZC.ADD_ITEM_TO_STORE2, O);
      y.hookPacket(G.ZC.ADD_ITEM_TO_STORE3, O);
      y.hookPacket(G.ZC.ADD_ITEM_TO_STORE4, O);
      y.hookPacket(G.ZC.CLOSE_STORE, H);
      y.hookPacket(G.ZC.DELETE_ITEM_FROM_STORE, M);
      y.hookPacket(G.ZC.INVENTORY_ITEMLIST, q);
      y.hookPacket(G.ZC.INVENTORY_ITEMLIST_EQUIP, q);
    };
  },
);
