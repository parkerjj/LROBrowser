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
      K.add(a.ITAID, a.ITID, a.IsIdentified, a.count, b, c, d);
    }
    function c(a) {
      var b = a.xPos - 0.5 + a.subX / 12,
        c = a.yPos - 0.5 + a.subY / 12,
        d = M.getCellHeight(b, c) + 5;
      K.add(a.ITAID, a.ITID, a.IsIdentified, a.count, b, c, d, a.canShowEffect);
    }
    function d(a) {
      da.setBound(a.index);
    }
    function e(a) {
      K.remove(a.ITAID);
    }
    function l(a) {
      if (0 !== a.result) W.addText(J.getMessage(53), W.TYPE.ERROR);
      else {
        V.append();
        V.set(a);
        var b = J.getItemInfo(a.ITID);
        W.addText(
          J.getMessage(153)
            .replace(
              "%s",
              a.IsIdentified ? J.getItemName(a) : b.unidentifiedDiSPlayName,
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
    function r(a) {
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
    function t(a) {
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
          var c = J.getItemInfo(b.ITID);
          W.addText(
            c.identifiedDiSPlayName + " " + J.getMessage(171),
            W.TYPE.ERROR,
          );
          a.wearLocation & L.AMMO || T.addItem(b);
        }
      }
    }
    function k(a) {
      if (1 == a.result) {
        var b = T.removeItem(a.index, 1),
          c = J.getItemInfo(b.ITID);
        da.equip(b, a.wearLocation);
        W.addText(
          c.identifiedDiSPlayName + " " + J.getMessage(170),
          W.TYPE.BLUE,
        );
      } else W.addText(J.getMessage(372), W.TYPE.ERROR);
    }
    function f(a) {
      da.ShowOEquip(a);
    }
    function m(a) {
      (a.hasOwnProperty("AID") && Q.Entity.GID !== a.AID) ||
        !a.result ||
        T.updateItem(a.index, a.count);
      a.result && E.spamItem(a.id, a.AID, null, null, null);
    }
    function q(a) {
      da.setEquipConfig(a.bOpenEquipmentWin);
      W.addText(
        J.getMessage(1358 + (a.bOpenEquipmentWin ? 1 : 0)),
        W.TYPE.INFO,
      );
    }
    function v(a) {
      a = T.getItemByIndex(a.index);
      da.equip(a, L.AMMO);
    }
    function u(a) {
      if (a.ITIDList.length) {
        var b = T.getItemByIndex(ta);
        ba.append();
        ba.setList(a.ITIDList);
        ba.setTitle(
          J.getMessage(522) +
            "(" +
            J.getItemInfo(b.ITID).identifiedDiSPlayName +
            ")",
        );
        ba.onIndexSelected = function (a) {
          if (0 <= a) {
            var b = new F.CZ.REQ_ITEMCOMPOSITION();
            b.cardIndex = ta;
            b.equipIndex = a;
            y.sendPacket(b);
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
    function D(a) {
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
    function B(a) {
      0 == a.result
        ? W.addText("\u4fee\u7406\u6210\u529f", W.TYPE.PUBLIC)
        : W.addText("\u4fee\u7406\u5931\u8d25", W.TYPE.PUBLIC);
    }
    function H(a) {
      var b = J.getItemInfo(a.ITID);
      W.addText(
        b.identifiedDiSPlayName +
          " \u9053\u5177\u7684\u4f7f\u7528\u65f6\u95f4\u6240\u5269\uff1a" +
          Math.ceil(a.RemainSecond / 60) +
          "\u5206\u949f",
        W.TYPE.PRIVATE,
      );
    }
    function C(a) {
      var b = { GID: 0, CName: "" };
      b.GID = a.GID;
      b.CName = a.CName;
      T.updateInfos(b);
    }
    function z(a) {
      x("#Storage").is(":visible") || R.append();
      R.setItemInfo(a.curCount, a.maxCount);
      R.setItems(ea);
      ea = [];
    }
    function G(a) {
      ea = ea.concat(a.ItemInfo || a.itemInfo);
    }
    function P(a) {
      R.addItem(x.extend({}, a));
    }
    function N(a) {
      R.removeItem(a.index, a.count);
    }
    function I() {
      R.remove();
    }
    var x = a("Utils/jquery"),
      J = a("DB/DBManager"),
      E = a("Renderer/EffectManager"),
      L = a("DB/Items/EquipmentLocation"),
      y = a("Network/NetworkManager"),
      F = a("Network/PacketStructure"),
      K = a("Renderer/ItemObject"),
      M = a("Renderer/Map/Altitude"),
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
      var b = new F.CZ.REQ_ITEMCOMPOSITION_LIST();
      b.cardIndex = a;
      y.sendPacket(b);
    };
    R.onClosePressed = function () {
      var a = new F.CZ.CLOSE_STORE();
      y.sendPacket(a);
      R.remove();
    };
    R.reqAddItem = function (a, b) {
      if (!(0 >= b)) {
        var c = new F.CZ.MOVE_ITEM_FROM_BODY_TO_STORE();
        c.index = a;
        c.count = b;
        y.sendPacket(c);
      }
    };
    R.reqAddItem1 = function (a, b) {
      if (!(0 >= b)) {
        var c = new F.CZ.MOVE_ITEM_FROM_CART_TO_STORE();
        c.index = a;
        c.count = b;
        y.sendPacket(c);
      }
    };
    R.reqRemoveItem = function (a, b) {
      if (!(0 >= b)) {
        var c = new F.CZ.MOVE_ITEM_FROM_STORE_TO_BODY();
        c.index = a;
        c.count = b;
        y.sendPacket(c);
      }
    };
    R.reqRemoveItem1 = function (a, b) {
      if (!(0 >= b)) {
        var c = new F.CZ.MOVE_ITEM_FROM_STORE_TO_CART();
        c.index = a;
        c.count = b;
        y.sendPacket(c);
      }
    };
    return function () {
      y.hookPacket(F.ZC.ITEM_ENTRY, b);
      y.hookPacket(F.ZC.ITEM_FALL_ENTRY, c);
      y.hookPacket(F.ZC.ITEM_FALL_ENTRY2, c);
      y.hookPacket(F.ZC.ITEM_FALL_ENTRY3, c);
      y.hookPacket(F.ZC.NOTIFY_BIND_ON_EQUIP, d);
      y.hookPacket(F.ZC.ITEM_DISAPPEAR, e);
      y.hookPacket(F.ZC.ITEM_PICKUP_ACK, l);
      y.hookPacket(F.ZC.ITEM_PICKUP_ACK2, l);
      y.hookPacket(F.ZC.ITEM_PICKUP_ACK3, l);
      y.hookPacket(F.ZC.ITEM_PICKUP_ACK5, l);
      y.hookPacket(F.ZC.ITEM_PICKUP_ACK6, l);
      y.hookPacket(F.ZC.ITEM_PICKUP_ACK_V7, l);
      y.hookPacket(F.ZC.ITEM_PICKUP_ACK_V8, l);
      y.hookPacket(F.ZC.ITEM_THROW_ACK, n);
      y.hookPacket(F.ZC.NORMAL_ITEMLIST, h);
      y.hookPacket(F.ZC.NORMAL_ITEMLIST2, h);
      y.hookPacket(F.ZC.NORMAL_ITEMLIST3, h);
      y.hookPacket(F.ZC.NORMAL_ITEMLIST4, h);
      y.hookPacket(F.ZC.EQUIPMENT_ITEMLIST, h);
      y.hookPacket(F.ZC.EQUIPMENT_ITEMLIST2, h);
      y.hookPacket(F.ZC.EQUIPMENT_ITEMLIST3, h);
      y.hookPacket(F.ZC.EQUIPMENT_ITEMLIST4, h);
      y.hookPacket(F.ZC.EQUIPMENT_ITEMLIST5, h);
      y.hookPacket(F.ZC.CART_NORMAL_ITEMLIST4, t);
      y.hookPacket(F.ZC.CART_EQUIPMENT_ITEMLIST4, t);
      y.hookPacket(F.ZC.CART_EQUIPMENT_ITEMLIST5, t);
      y.hookPacket(F.ZC.REQ_TAKEOFF_EQUIP_ACK, p);
      y.hookPacket(F.ZC.REQ_TAKEOFF_EQUIP_ACK2, p);
      y.hookPacket(F.ZC.ACK_TAKEOFF_EQUIP_V5, p);
      y.hookPacket(F.ZC.REQ_WEAR_EQUIP_ACK, k);
      y.hookPacket(F.ZC.REQ_WEAR_EQUIP_ACK2, k);
      y.hookPacket(F.ZC.ACK_WEAR_EQUIP_V5, k);
      y.hookPacket(F.ZC.EQUIPWIN_MICROSCOPE_V5, f);
      y.hookPacket(F.ZC.EQUIPWIN_MICROSCOPE_V6, f);
      y.hookPacket(F.ZC.EQUIPWIN_MICROSCOPE3, f);
      y.hookPacket(F.ZC.DELETE_ITEM_FROM_BODY, n);
      y.hookPacket(F.ZC.USE_ITEM_ACK, m);
      y.hookPacket(F.ZC.USE_ITEM_ACK2, m);
      y.hookPacket(F.ZC.CONFIG_NOTIFY, q);
      y.hookPacket(F.ZC.EQUIP_ARROW, v);
      y.hookPacket(F.ZC.ITEMCOMPOSITION_LIST, u);
      y.hookPacket(F.ZC.ACK_ITEMCOMPOSITION, A);
      y.hookPacket(F.ZC.ACK_ITEMREFINING, D);
      y.hookPacket(F.ZC.ACK_ITEMREPAIR, B);
      y.hookPacket(F.ZC.ITEM_DELETE_BUYING_STORE, g);
      y.hookPacket(F.ZC.CASH_TIME_COUNTER, H);
      y.hookPacket(F.ZC.ACK_REQNAME_BYGID, C);
      y.hookPacket(F.ZC.ACK_REQNAME_BYGID2, C);
      y.hookPacket(F.ZC.STORE_NORMAL_ITEMLIST, G);
      y.hookPacket(F.ZC.STORE_NORMAL_ITEMLIST2, G);
      y.hookPacket(F.ZC.STORE_NORMAL_ITEMLIST3, G);
      y.hookPacket(F.ZC.STORE_NORMAL_ITEMLIST4, G);
      y.hookPacket(F.ZC.STORE_EQUIPMENT_ITEMLIST, G);
      y.hookPacket(F.ZC.STORE_EQUIPMENT_ITEMLIST2, G);
      y.hookPacket(F.ZC.STORE_EQUIPMENT_ITEMLIST3, G);
      y.hookPacket(F.ZC.STORE_EQUIPMENT_ITEMLIST4, G);
      y.hookPacket(F.ZC.STORE_EQUIPMENT_ITEMLIST5, G);
      y.hookPacket(F.ZC.NOTIFY_STOREITEM_COUNTINFO, z);
      y.hookPacket(F.ZC.ADD_ITEM_TO_STORE, P);
      y.hookPacket(F.ZC.ADD_ITEM_TO_STORE2, P);
      y.hookPacket(F.ZC.ADD_ITEM_TO_STORE3, P);
      y.hookPacket(F.ZC.ADD_ITEM_TO_STORE4, P);
      y.hookPacket(F.ZC.CLOSE_STORE, I);
      y.hookPacket(F.ZC.DELETE_ITEM_FROM_STORE, N);
      y.hookPacket(F.ZC.INVENTORY_ITEMLIST, r);
      y.hookPacket(F.ZC.INVENTORY_ITEMLIST_EQUIP, r);
    };
  },
);
