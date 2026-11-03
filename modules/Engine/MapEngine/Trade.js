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
          var b = new k.CZ.ACK_EXCHANGE_ITEM();
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
          m.addText(g.getMessage(70), m.TYPE.ERROR);
          break;
        case 1:
          m.addText(g.getMessage(71), m.TYPE.ERROR);
          break;
        case 2:
          m.addText(g.getMessage(72), m.TYPE.ERROR);
          break;
        case 3:
          "level" in a &&
            "GID" in a &&
            (f.title += "  Lv" + a.level + " (" + b(a.GID) + ")");
          f.append();
          break;
        case 4:
          m.addText(g.getMessage(74), m.TYPE.ERROR);
      }
    }
    function e(a) {
      switch (a.result) {
        case 1:
          m.addText(g.getMessage(73), m.TYPE.ERROR);
          break;
        case 2:
          m.addText(g.getMessage(74), m.TYPE.ERROR);
      }
      f.addItemFromInventory(a.Index, 0 === a.result);
    }
    function l() {
      l.ITID = 0;
      l.IsDamaged = 0;
      l.IsIdentified = 0;
      l.RefiningLevel = 0;
      l.count = 0;
      l.slot = 0;
      l.type = 0;
      l.options = 0;
    }
    function h(a) {
      var b = new l();
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
    function r(a) {
      m.addText(g.getMessage(74), m.TYPE.ERROR);
      f.remove();
    }
    function t(a) {
      f.conclude(a.who ? "recv" : "send");
    }
    function n(a) {
      1 === a.result
        ? m.addText(g.getMessage(76), m.TYPE.ERROR)
        : m.addText(g.getMessage(75), m.TYPE.BLUE);
      f.remove();
    }
    var g = a("DB/DBManager"),
      p = a("Network/NetworkManager"),
      k = a("Network/PacketStructure"),
      f = a("UI/Components/Trade/Trade"),
      m = a("UI/Components/ChatBox/ChatBox"),
      q = a("UI/UIManager");
    f.reqAddItem = function (a, b) {
      var c = new k.CZ.ADD_EXCHANGE_ITEM();
      c.index = a;
      c.count = b;
      p.sendPacket(c);
    };
    f.onCancel = function () {
      var a = new k.CZ.CANCEL_EXCHANGE_ITEM();
      p.sendPacket(a);
    };
    f.onConclude = function () {
      var a = new k.CZ.CONCLUDE_EXCHANGE_ITEM();
      p.sendPacket(a);
    };
    f.onTradeSubmit = function () {
      var a = new k.CZ.EXEC_EXCHANGE_ITEM();
      p.sendPacket(a);
    };
    f.reqExchange = function (a, b) {
      var c = new k.CZ.REQ_EXCHANGE_ITEM();
      c.AID = a;
      p.sendPacket(c);
      f.title = b;
    };
    return function () {
      p.hookPacket(k.ZC.REQ_EXCHANGE_ITEM, c);
      p.hookPacket(k.ZC.REQ_EXCHANGE_ITEM2, c);
      p.hookPacket(k.ZC.ACK_EXCHANGE_ITEM, d);
      p.hookPacket(k.ZC.ACK_EXCHANGE_ITEM2, d);
      p.hookPacket(k.ZC.ACK_ADD_EXCHANGE_ITEM, e);
      p.hookPacket(k.ZC.ADD_EXCHANGE_ITEM, h);
      p.hookPacket(k.ZC.ADD_EXCHANGE_ITEM2, h);
      p.hookPacket(k.ZC.ADD_EXCHANGE_ITEM3, h);
      p.hookPacket(k.ZC.ADD_EXCHANGE_ITEM4, h);
      p.hookPacket(k.ZC.CANCEL_EXCHANGE_ITEM, r);
      p.hookPacket(k.ZC.CONCLUDE_EXCHANGE_ITEM, t);
      p.hookPacket(k.ZC.EXEC_EXCHANGE_ITEM, n);
    };
  },
);
