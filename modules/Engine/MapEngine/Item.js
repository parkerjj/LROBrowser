define(
  "Engine/MapEngine/Item",
  "require Utils/jquery DB/DBManager Renderer/EffectManager DB/Items/EquipmentLocation Network/NetworkManager Network/PacketStructure Renderer/ItemObject Renderer/Map/Altitude Engine/SessionStorage DB/Items/ItemEffect UI/Components/ChatBox/ChatBox UI/Components/ItemObtain/ItemObtain UI/Components/ItemSelection/ItemSelection UI/Components/Inventory/Inventory UI/Components/Equipment/Equipment UI/Components/Storage/Storage UI/Components/OnPushCart/OnPushCart UI/Components/ItemInfo/ItemInfo UI/Components/RefineUI/RefineUI UI/Components/ShortCut/ShortCut Preferences/Controls".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = a.xPos - 0.5 + a.subX / 12,
        c = a.yPos - 0.5 + a.subY / 12,
        d = P.getCellHeight(b, c);
      K.add(a.ITAID, a.ITID, a.IsIdentified, a.count, b, c, d);
    }
    function c(a) {
      var b = a.xPos - 0.5 + a.subX / 12,
        c = a.yPos - 0.5 + a.subY / 12,
        d = P.getCellHeight(b, c) + 5;
      K.add(a.ITAID, a.ITID, a.IsIdentified, a.count, b, c, d, a.canShowEffect);
    }
    function d(a) {
      ca.setBound(a.index);
    }
    function e(a) {
      K.remove(a.ITAID);
    }
    function m(a) {
      if (0 !== a.result) S.addText(M.getMessage(53), S.TYPE.ERROR);
      else {
        R.append();
        R.set(a);
        var b = M.getItemInfo(a.ITID);
        S.addText(
          M.getMessage(153)
            .replace(
              "%s",
              a.IsIdentified ? M.getItemName(a) : b.unidentifiedDiSPlayName,
            )
            .replace("%d", a.count),
          S.TYPE.BLUE,
        );
        V.addItem(a);
      }
    }
    function h(a) {
      V.setItems(a.itemInfo || a.ItemInfo);
    }
    function r(a) {
      switch (a.type) {
        case 0:
          V.setItems(a.itemInfo || a.ItemInfo);
          break;
        case 1:
          U.setItems(a.itemInfo || a.ItemInfo);
          break;
        case 2:
          da = da.concat(a.ItemInfo || a.itemInfo);
      }
    }
    function q(a) {
      U.setItems(a.itemInfo || a.ItemInfo);
    }
    function k(a) {
      V.removeItem(a.Index, a.count || a.Count || 0);
    }
    function g(a) {
      V.removeItem(a.index, a.count || a.Count || 0);
    }
    function t(a) {
      if (a.result) {
        var b = ca.unEquip(a.index, a.wearLocation);
        if (b) {
          b.WearState = 0;
          var c = M.getItemInfo(b.ITID);
          S.addText(
            c.identifiedDiSPlayName + " " + M.getMessage(171),
            S.TYPE.ERROR,
          );
          a.wearLocation & F.AMMO || V.addItem(b);
        }
      }
    }
    function l(a) {
      if (1 == a.result) {
        var b = V.removeItem(a.index, 1),
          c = M.getItemInfo(b.ITID);
        ca.equip(b, a.wearLocation);
        S.addText(
          c.identifiedDiSPlayName + " " + M.getMessage(170),
          S.TYPE.BLUE,
        );
      } else S.addText(M.getMessage(372), S.TYPE.ERROR);
    }
    function f(a) {
      ca.ShowOEquip(a);
    }
    function n(a) {
      (a.hasOwnProperty("AID") && N.Entity.GID !== a.AID) ||
        !a.result ||
        V.updateItem(a.index, a.count);
      a.result && E.spamItem(a.id, a.AID, null, null, null);
    }
    function p(a) {
      ca.setEquipConfig(a.bOpenEquipmentWin);
      S.addText(
        M.getMessage(1358 + (a.bOpenEquipmentWin ? 1 : 0)),
        S.TYPE.INFO,
      );
    }
    function v(a) {
      a = V.getItemByIndex(a.index);
      ca.equip(a, F.AMMO);
    }
    function u(a) {
      if (a.ITIDList.length) {
        var b = V.getItemByIndex(ta);
        ea.append();
        ea.setList(a.ITIDList);
        ea.setTitle(
          M.getMessage(522) +
            "(" +
            M.getItemInfo(b.ITID).identifiedDiSPlayName +
            ")",
        );
        ea.onIndexSelected = function (a) {
          if (0 <= a) {
            var b = new H.CZ.REQ_ITEMCOMPOSITION();
            b.cardIndex = ta;
            b.equipIndex = a;
            G.sendPacket(b);
          }
          ta = null;
        };
      }
    }
    function A(a) {
      switch (a.result) {
        case 0:
          var b = V.removeItem(a.equipIndex, 1);
          a = V.removeItem(a.cardIndex, 1);
          if (b) {
            for (var c = 0; 4 > c; ++c)
              if (!b.slot["card" + (c + 1)]) {
                b.slot["card" + (c + 1)] = a.ITID;
                break;
              }
            V.addItem(b);
          }
      }
    }
    function D(a) {
      var b = V.removeItem(a.itemIndex, 1);
      b && ((b.RefiningLevel = a.RefiningLevel), V.addItem(b));
      switch (a.result) {
        case 0:
          fa.ui && fa.ui.is(":visible") && fa.setStep(4);
          break;
        case 1:
          S.addText("\u7cbe\u70bc\u5931\u8d25", S.TYPE.INFO);
          fa.ui && fa.ui.is(":visible") && fa.setStep(6);
          break;
        case 2:
          S.addText(
            "\u7cbe\u70bc\u5931\u8d25\uff0c\u6389\u6bb5\u4e86",
            S.TYPE.INFO,
          );
          fa.ui && fa.ui.is(":visible") && fa.setStep(7);
          break;
        case 3:
          S.addText(
            "\u7cbe\u70bc\u5931\u8d25\uff0c\u5e78\u597d\u9632\u7206\u4fdd\u4f4f\u4e86\u88c5\u5907",
            S.TYPE.INFO,
          );
          fa.ui && fa.ui.is(":visible") && fa.setStep(7);
          break;
        case 4:
          (S.addText(
            "\u7cbe\u70bc\u5931\u8d25\uff0c\u5e78\u597d\u88c5\u5907\u6ca1\u635f\u574f",
            S.TYPE.INFO,
          ),
            fa.ui && fa.ui.is(":visible") && fa.setStep(7));
      }
    }
    function B(a) {
      0 == a.result
        ? S.addText("\u4fee\u7406\u6210\u529f", S.TYPE.PUBLIC)
        : S.addText("\u4fee\u7406\u5931\u8d25", S.TYPE.PUBLIC);
    }
    function O(a) {
      var b = M.getItemInfo(a.ITID);
      S.addText(
        b.identifiedDiSPlayName +
          " \u9053\u5177\u7684\u4f7f\u7528\u65f6\u95f4\u6240\u5269\uff1a" +
          Math.ceil(a.RemainSecond / 60) +
          "\u5206\u949f",
        S.TYPE.PRIVATE,
      );
    }
    function C(a) {
      var b = { GID: 0, CName: "" };
      b.GID = a.GID;
      b.CName = a.CName;
      V.updateInfos(b);
    }
    function y(a) {
      x("#Storage").is(":visible") || T.append();
      T.setItemInfo(a.curCount, a.maxCount);
      T.setItems(da);
      da = [];
    }
    function z(a) {
      da = da.concat(a.ItemInfo || a.itemInfo);
    }
    function J(a) {
      T.addItem(x.extend({}, a));
    }
    function I(a) {
      T.removeItem(a.index, a.count);
    }
    function L() {
      T.remove();
    }
    var x = a("Utils/jquery"),
      M = a("DB/DBManager"),
      E = a("Renderer/EffectManager"),
      F = a("DB/Items/EquipmentLocation"),
      G = a("Network/NetworkManager"),
      H = a("Network/PacketStructure"),
      K = a("Renderer/ItemObject"),
      P = a("Renderer/Map/Altitude"),
      N = a("Engine/SessionStorage");
    a("DB/Items/ItemEffect");
    var S = a("UI/Components/ChatBox/ChatBox"),
      R = a("UI/Components/ItemObtain/ItemObtain"),
      ea = a("UI/Components/ItemSelection/ItemSelection"),
      U = a("UI/Components/OnPushCart/OnPushCart"),
      V = a("UI/Components/Inventory/Inventory"),
      ca = a("UI/Components/Equipment/Equipment"),
      T = a("UI/Components/Storage/Storage");
    a("UI/Components/ItemInfo/ItemInfo");
    var fa = a("UI/Components/RefineUI/RefineUI");
    a("UI/Components/ShortCut/ShortCut");
    a("Preferences/Controls");
    var da = [],
      ta;
    V.onUseCard = function (a) {
      ta = a;
      var b = new H.CZ.REQ_ITEMCOMPOSITION_LIST();
      b.cardIndex = a;
      G.sendPacket(b);
    };
    T.onClosePressed = function () {
      var a = new H.CZ.CLOSE_STORE();
      G.sendPacket(a);
      T.remove();
    };
    T.reqAddItem = function (a, b) {
      if (!(0 >= b)) {
        var c = new H.CZ.MOVE_ITEM_FROM_BODY_TO_STORE();
        c.index = a;
        c.count = b;
        G.sendPacket(c);
      }
    };
    T.reqAddItem1 = function (a, b) {
      if (!(0 >= b)) {
        var c = new H.CZ.MOVE_ITEM_FROM_CART_TO_STORE();
        c.index = a;
        c.count = b;
        G.sendPacket(c);
      }
    };
    T.reqRemoveItem = function (a, b) {
      if (!(0 >= b)) {
        var c = new H.CZ.MOVE_ITEM_FROM_STORE_TO_BODY();
        c.index = a;
        c.count = b;
        G.sendPacket(c);
      }
    };
    T.reqRemoveItem1 = function (a, b) {
      if (!(0 >= b)) {
        var c = new H.CZ.MOVE_ITEM_FROM_STORE_TO_CART();
        c.index = a;
        c.count = b;
        G.sendPacket(c);
      }
    };
    return function () {
      G.hookPacket(H.ZC.ITEM_ENTRY, b);
      G.hookPacket(H.ZC.ITEM_FALL_ENTRY, c);
      G.hookPacket(H.ZC.ITEM_FALL_ENTRY2, c);
      G.hookPacket(H.ZC.ITEM_FALL_ENTRY3, c);
      G.hookPacket(H.ZC.NOTIFY_BIND_ON_EQUIP, d);
      G.hookPacket(H.ZC.ITEM_DISAPPEAR, e);
      G.hookPacket(H.ZC.ITEM_PICKUP_ACK, m);
      G.hookPacket(H.ZC.ITEM_PICKUP_ACK2, m);
      G.hookPacket(H.ZC.ITEM_PICKUP_ACK3, m);
      G.hookPacket(H.ZC.ITEM_PICKUP_ACK5, m);
      G.hookPacket(H.ZC.ITEM_PICKUP_ACK6, m);
      G.hookPacket(H.ZC.ITEM_PICKUP_ACK_V7, m);
      G.hookPacket(H.ZC.ITEM_PICKUP_ACK_V8, m);
      G.hookPacket(H.ZC.ITEM_THROW_ACK, k);
      G.hookPacket(H.ZC.NORMAL_ITEMLIST, h);
      G.hookPacket(H.ZC.NORMAL_ITEMLIST2, h);
      G.hookPacket(H.ZC.NORMAL_ITEMLIST3, h);
      G.hookPacket(H.ZC.NORMAL_ITEMLIST4, h);
      G.hookPacket(H.ZC.EQUIPMENT_ITEMLIST, h);
      G.hookPacket(H.ZC.EQUIPMENT_ITEMLIST2, h);
      G.hookPacket(H.ZC.EQUIPMENT_ITEMLIST3, h);
      G.hookPacket(H.ZC.EQUIPMENT_ITEMLIST4, h);
      G.hookPacket(H.ZC.EQUIPMENT_ITEMLIST5, h);
      G.hookPacket(H.ZC.CART_NORMAL_ITEMLIST4, q);
      G.hookPacket(H.ZC.CART_EQUIPMENT_ITEMLIST4, q);
      G.hookPacket(H.ZC.CART_EQUIPMENT_ITEMLIST5, q);
      G.hookPacket(H.ZC.REQ_TAKEOFF_EQUIP_ACK, t);
      G.hookPacket(H.ZC.REQ_TAKEOFF_EQUIP_ACK2, t);
      G.hookPacket(H.ZC.ACK_TAKEOFF_EQUIP_V5, t);
      G.hookPacket(H.ZC.REQ_WEAR_EQUIP_ACK, l);
      G.hookPacket(H.ZC.REQ_WEAR_EQUIP_ACK2, l);
      G.hookPacket(H.ZC.ACK_WEAR_EQUIP_V5, l);
      G.hookPacket(H.ZC.EQUIPWIN_MICROSCOPE_V5, f);
      G.hookPacket(H.ZC.EQUIPWIN_MICROSCOPE_V6, f);
      G.hookPacket(H.ZC.EQUIPWIN_MICROSCOPE3, f);
      G.hookPacket(H.ZC.DELETE_ITEM_FROM_BODY, k);
      G.hookPacket(H.ZC.USE_ITEM_ACK, n);
      G.hookPacket(H.ZC.USE_ITEM_ACK2, n);
      G.hookPacket(H.ZC.CONFIG_NOTIFY, p);
      G.hookPacket(H.ZC.EQUIP_ARROW, v);
      G.hookPacket(H.ZC.ITEMCOMPOSITION_LIST, u);
      G.hookPacket(H.ZC.ACK_ITEMCOMPOSITION, A);
      G.hookPacket(H.ZC.ACK_ITEMREFINING, D);
      G.hookPacket(H.ZC.ACK_ITEMREPAIR, B);
      G.hookPacket(H.ZC.ITEM_DELETE_BUYING_STORE, g);
      G.hookPacket(H.ZC.CASH_TIME_COUNTER, O);
      G.hookPacket(H.ZC.ACK_REQNAME_BYGID, C);
      G.hookPacket(H.ZC.ACK_REQNAME_BYGID2, C);
      G.hookPacket(H.ZC.STORE_NORMAL_ITEMLIST, z);
      G.hookPacket(H.ZC.STORE_NORMAL_ITEMLIST2, z);
      G.hookPacket(H.ZC.STORE_NORMAL_ITEMLIST3, z);
      G.hookPacket(H.ZC.STORE_NORMAL_ITEMLIST4, z);
      G.hookPacket(H.ZC.STORE_EQUIPMENT_ITEMLIST, z);
      G.hookPacket(H.ZC.STORE_EQUIPMENT_ITEMLIST2, z);
      G.hookPacket(H.ZC.STORE_EQUIPMENT_ITEMLIST3, z);
      G.hookPacket(H.ZC.STORE_EQUIPMENT_ITEMLIST4, z);
      G.hookPacket(H.ZC.STORE_EQUIPMENT_ITEMLIST5, z);
      G.hookPacket(H.ZC.NOTIFY_STOREITEM_COUNTINFO, y);
      G.hookPacket(H.ZC.ADD_ITEM_TO_STORE, J);
      G.hookPacket(H.ZC.ADD_ITEM_TO_STORE2, J);
      G.hookPacket(H.ZC.ADD_ITEM_TO_STORE3, J);
      G.hookPacket(H.ZC.ADD_ITEM_TO_STORE4, J);
      G.hookPacket(H.ZC.CLOSE_STORE, L);
      G.hookPacket(H.ZC.DELETE_ITEM_FROM_STORE, I);
      G.hookPacket(H.ZC.INVENTORY_ITEMLIST, r);
      G.hookPacket(H.ZC.INVENTORY_ITEMLIST_EQUIP, r);
    };
  },
);
