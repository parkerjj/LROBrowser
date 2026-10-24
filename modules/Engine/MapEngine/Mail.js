define(
  "Engine/MapEngine/Mail",
  "require DB/DBManager Utils/jquery Network/NetworkManager Network/PacketStructure Engine/SessionStorage Renderer/EntityManager UI/Components/Mail/Rodex UI/Components/Mail/RodexInfo UI/Components/Mail/RodexSend UI/Components/ChatBox/ChatBox UI/Components/Inventory/Inventory UI/Components/BasicInfo/BasicInfo".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a.unread && u.addText("\u6709\u672a\u8bfb\u4fe1\u4ef6", u.TYPE.PRIVATE);
    }
    function c(a) {
      0 < a.unknown && n.setList(a);
    }
    function d(a) {
      n.deleteMail(a);
    }
    function e(a) {
      p.readMail(a);
    }
    function m(a) {
      switch (a.Result) {
        case 0:
          u.addText("\u5df2\u9886\u53d6\u6e38\u620f\u5e01", u.TYPE.PRIVATE);
          p.getMailZeny();
          break;
        case 1:
        case 2:
          u.addText(
            "\u6301\u6709\u6e38\u620f\u5e01\u8fc7\u591a",
            u.TYPE.PRIVATE,
          );
      }
    }
    function h(a) {
      switch (a.Result) {
        case 0:
          u.addText("\u5df2\u9886\u53d6\u7269\u54c1", u.TYPE.PRIVATE);
          p.getMailItem();
          break;
        case 1:
        case 2:
          u.addText(
            "\u8d85\u91cd\u6216\u6301\u6709\u7269\u54c1\u6570\u91cf\u8fc7\u591a",
            u.TYPE.PRIVATE,
          );
      }
    }
    function r(a) {
      v.checkName(a);
    }
    function q(a) {
      v.ui && !v.ui.is(":visible") && (v.append(), v.focus());
      v.mailReply(a);
    }
    function k(a) {
      switch (a.Result) {
        case 0:
          u.addText("\u4fe1\u4ef6\u53d1\u9001\u6210\u529f", u.TYPE.PRIVATE);
          v.clearList();
          v.remove();
          break;
        case 1:
        case 2:
          u.addText("\u4fe1\u4ef6\u53d1\u9001\u5931\u8d25", u.TYPE.PRIVATE);
      }
    }
    function g(a) {
      switch (a.result) {
        case 0:
          v.addItem(a);
          A.removeItem(a.index, a.count);
          break;
        case 1:
        case 2:
          u.addText(
            "\u8be5\u9053\u5177\u65e0\u6cd5\u90ae\u5bc4",
            u.TYPE.PRIVATE,
          );
          break;
        case 3:
          u.addText(
            "\u6700\u591a\u53d1\u90015\u4e2a\u9053\u5177",
            u.TYPE.PRIVATE,
          );
          break;
        case 4:
          u.addText(
            "\u4e0d\u80fd\u6dfb\u52a0\u7684\u9053\u5177",
            u.TYPE.PRIVATE,
          );
      }
    }
    function t(a) {
      a.success && v.removeItem(a);
    }
    a("DB/DBManager");
    a("Utils/jquery");
    var l = a("Network/NetworkManager"),
      f = a("Network/PacketStructure");
    a("Engine/SessionStorage");
    a("Renderer/EntityManager");
    var n = a("UI/Components/Mail/Rodex"),
      p = a("UI/Components/Mail/RodexInfo"),
      v = a("UI/Components/Mail/RodexSend"),
      u = a("UI/Components/ChatBox/ChatBox"),
      A = a("UI/Components/Inventory/Inventory");
    a("UI/Components/BasicInfo/BasicInfo");
    return function () {
      l.hookPacket(f.ZC.ACK_MAIL_LIST, c);
      l.hookPacket(f.ZC.ACK_MAIL_LIST3, c);
      l.hookPacket(f.ZC.ACK_DELETE_MAIL, d);
      l.hookPacket(f.ZC.NOTIFY_UNREADMAIL, b);
      l.hookPacket(f.ZC.ACK_READ_MAIL, e);
      l.hookPacket(f.ZC.ACK_READ_RODEX, e);
      l.hookPacket(f.ZC.ACK_ZENY_FROM_MAIL, m);
      l.hookPacket(f.ZC.ACK_ITEM_FROM_MAIL, h);
      l.hookPacket(f.ZC.CHECK_RECEIVE_CHARACTER_NAME, r);
      l.hookPacket(f.ZC.CHECK_RECEIVE_CHARACTER_NAME2, r);
      l.hookPacket(f.ZC.ACK_OPEN_WRITE_MAIL, q);
      l.hookPacket(f.ZC.ACK_WRITE_MAIL, k);
      l.hookPacket(f.ZC.ACK_ADD_ITEM_TO_MAIL, g);
      l.hookPacket(f.ZC.ACK_ADD_ITEM_RODEX, g);
      l.hookPacket(f.ZC.ACK_REMOVE_ITEM_MAIL, t);
    };
  },
);
