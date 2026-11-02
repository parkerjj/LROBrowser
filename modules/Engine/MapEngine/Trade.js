define(
  "Engine/MapEngine/Trade",
  "require DB/DBManager Network/NetworkManager Network/PacketStructure UI/Components/Trade/Trade UI/Components/ChatBox/ChatBox UI/UIManager".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b, c, d;
      a = String(a);
      b = "";
      c = 0;
      for (d = a.length; c < d; ++c) b += "ROHUTNASEW"[a[c]];
      return b;
    }
    function c(a) {
      function c(a) {
        return function () {
          var b = new l.CZ.ACK_EXCHANGE_ITEM();
          b.result = a;
          u.sendPacket(b);
        };
      }
      var d = "(" + a.name + ") " + g.getMessage(93);
      f.title = a.name;
      "level" in a &&
        "GID" in a &&
        (d +=
          "\nPN: " + b(a.GID) + "\u00a0\u00a0\u00a0\u00a0\u00a0Lv." + a.level);
      p.showPromptBox(d, "ok", "cancel", c(3), c(4));
    }
    function d(a) {
      switch (a.result) {
        case 0:
          n.addText(g.getMessage(70), n.TYPE.ERROR);
          break;
        case 1:
          n.addText(g.getMessage(71), n.TYPE.ERROR);
          break;
        case 2:
          n.addText(g.getMessage(72), n.TYPE.ERROR);
          break;
        case 3:
          "level" in a &&
            "GID" in a &&
            (f.title += "  Lv" + a.level + " (" + b(a.GID) + ")");
          f.append();
          break;
        case 4:
          n.addText(g.getMessage(74), n.TYPE.ERROR);
      }
    }
    function e(a) {
      switch (a.result) {
        case 1:
          n.addText(g.getMessage(73), n.TYPE.ERROR);
          break;
        case 2:
          n.addText(g.getMessage(74), n.TYPE.ERROR);
      }
      f.addItemFromInventory(a.Index, 0 === a.result);
    }
    function m() {
      m.ITID = 0;
      m.IsDamaged = 0;
      m.IsIdentified = 0;
      m.RefiningLevel = 0;
      m.count = 0;
      m.slot = 0;
      m.type = 0;
      m.options = 0;
    }
    function h(a) {
      var b = new m();
      b.ITID = a.ITID;
      b.IsDamaged = a.IsDamaged;
      b.IsIdentified = a.IsIdentified;
      b.RefiningLevel = a.RefiningLevel;
      b.count = a.count;
      b.slot = a.slot;
      b.type = a.type;
      b.options = a.options;
      f.addItem(b);
    }
    function q(a) {
      n.addText(g.getMessage(74), n.TYPE.ERROR);
      f.remove();
    }
    function r(a) {
      f.conclude(a.who ? "recv" : "send");
    }
    function k(a) {
      1 === a.result
        ? n.addText(g.getMessage(76), n.TYPE.ERROR)
        : n.addText(g.getMessage(75), n.TYPE.BLUE);
      f.remove();
    }
    var g = a("DB/DBManager"),
      u = a("Network/NetworkManager"),
      l = a("Network/PacketStructure"),
      f = a("UI/Components/Trade/Trade"),
      n = a("UI/Components/ChatBox/ChatBox"),
      p = a("UI/UIManager");
    f.reqAddItem = function (a, b) {
      var c = new l.CZ.ADD_EXCHANGE_ITEM();
      c.index = a;
      c.count = b;
      u.sendPacket(c);
    };
    f.onCancel = function () {
      var a = new l.CZ.CANCEL_EXCHANGE_ITEM();
      u.sendPacket(a);
    };
    f.onConclude = function () {
      var a = new l.CZ.CONCLUDE_EXCHANGE_ITEM();
      u.sendPacket(a);
    };
    f.onTradeSubmit = function () {
      var a = new l.CZ.EXEC_EXCHANGE_ITEM();
      u.sendPacket(a);
    };
    f.reqExchange = function (a, b) {
      var c = new l.CZ.REQ_EXCHANGE_ITEM();
      c.AID = a;
      u.sendPacket(c);
      f.title = b;
    };
    return function () {
      u.hookPacket(l.ZC.REQ_EXCHANGE_ITEM, c);
      u.hookPacket(l.ZC.REQ_EXCHANGE_ITEM2, c);
      u.hookPacket(l.ZC.ACK_EXCHANGE_ITEM, d);
      u.hookPacket(l.ZC.ACK_EXCHANGE_ITEM2, d);
      u.hookPacket(l.ZC.ACK_ADD_EXCHANGE_ITEM, e);
      u.hookPacket(l.ZC.ADD_EXCHANGE_ITEM, h);
      u.hookPacket(l.ZC.ADD_EXCHANGE_ITEM2, h);
      u.hookPacket(l.ZC.ADD_EXCHANGE_ITEM3, h);
      u.hookPacket(l.ZC.ADD_EXCHANGE_ITEM4, h);
      u.hookPacket(l.ZC.CANCEL_EXCHANGE_ITEM, q);
      u.hookPacket(l.ZC.CONCLUDE_EXCHANGE_ITEM, r);
      u.hookPacket(l.ZC.EXEC_EXCHANGE_ITEM, k);
    };
  },
);
