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
          p.sendPacket(b);
        };
      }
      var d = "(" + a.name + ") " + g.getMessage(93);
      f.title = a.name;
      "level" in a &&
        "GID" in a &&
        (d +=
          "\nPN: " + b(a.GID) + "\u00a0\u00a0\u00a0\u00a0\u00a0Lv." + a.level);
      q.showPromptBox(d, "ok", "cancel", c(3), c(4));
    }
    function d(a) {
      switch (a.result) {
        case 0:
          k.addText(g.getMessage(70), k.TYPE.ERROR);
          break;
        case 1:
          k.addText(g.getMessage(71), k.TYPE.ERROR);
          break;
        case 2:
          k.addText(g.getMessage(72), k.TYPE.ERROR);
          break;
        case 3:
          "level" in a &&
            "GID" in a &&
            (f.title += "  Lv" + a.level + " (" + b(a.GID) + ")");
          f.append();
          break;
        case 4:
          k.addText(g.getMessage(74), k.TYPE.ERROR);
      }
    }
    function e(a) {
      switch (a.result) {
        case 1:
          k.addText(g.getMessage(73), k.TYPE.ERROR);
          break;
        case 2:
          k.addText(g.getMessage(74), k.TYPE.ERROR);
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
    function t(a) {
      k.addText(g.getMessage(74), k.TYPE.ERROR);
      f.remove();
    }
    function r(a) {
      f.conclude(a.who ? "recv" : "send");
    }
    function n(a) {
      1 === a.result
        ? k.addText(g.getMessage(76), k.TYPE.ERROR)
        : k.addText(g.getMessage(75), k.TYPE.BLUE);
      f.remove();
    }
    var g = a("DB/DBManager"),
      p = a("Network/NetworkManager"),
      l = a("Network/PacketStructure"),
      f = a("UI/Components/Trade/Trade"),
      k = a("UI/Components/ChatBox/ChatBox"),
      q = a("UI/UIManager");
    f.reqAddItem = function (a, b) {
      var c = new l.CZ.ADD_EXCHANGE_ITEM();
      c.index = a;
      c.count = b;
      p.sendPacket(c);
    };
    f.onCancel = function () {
      var a = new l.CZ.CANCEL_EXCHANGE_ITEM();
      p.sendPacket(a);
    };
    f.onConclude = function () {
      var a = new l.CZ.CONCLUDE_EXCHANGE_ITEM();
      p.sendPacket(a);
    };
    f.onTradeSubmit = function () {
      var a = new l.CZ.EXEC_EXCHANGE_ITEM();
      p.sendPacket(a);
    };
    f.reqExchange = function (a, b) {
      var c = new l.CZ.REQ_EXCHANGE_ITEM();
      c.AID = a;
      p.sendPacket(c);
      f.title = b;
    };
    return function () {
      p.hookPacket(l.ZC.REQ_EXCHANGE_ITEM, c);
      p.hookPacket(l.ZC.REQ_EXCHANGE_ITEM2, c);
      p.hookPacket(l.ZC.ACK_EXCHANGE_ITEM, d);
      p.hookPacket(l.ZC.ACK_EXCHANGE_ITEM2, d);
      p.hookPacket(l.ZC.ACK_ADD_EXCHANGE_ITEM, e);
      p.hookPacket(l.ZC.ADD_EXCHANGE_ITEM, h);
      p.hookPacket(l.ZC.ADD_EXCHANGE_ITEM2, h);
      p.hookPacket(l.ZC.ADD_EXCHANGE_ITEM3, h);
      p.hookPacket(l.ZC.ADD_EXCHANGE_ITEM4, h);
      p.hookPacket(l.ZC.CANCEL_EXCHANGE_ITEM, t);
      p.hookPacket(l.ZC.CONCLUDE_EXCHANGE_ITEM, r);
      p.hookPacket(l.ZC.EXEC_EXCHANGE_ITEM, n);
    };
  },
);
