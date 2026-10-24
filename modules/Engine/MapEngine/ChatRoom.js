define(
  "Engine/MapEngine/ChatRoom",
  "require DB/DBManager Network/NetworkManager Network/PacketStructure Renderer/EntityManager UI/Components/ChatRoomCreate/ChatRoomCreate UI/Components/ChatRoom/ChatRoom UI/Components/ChatBox/ChatBox Engine/SessionStorage".split(
    " ",
  ),
  function (a) {
    function b(a) {
      switch (a.result) {
        case 0:
          f.title = l.title;
          f.limit = l.limit;
          f.type = l.type;
          f.count = 1;
          f.members = [p.Entity.display.name];
          f.owner = p.Entity.display.name;
          f.append();
          n.addText(q.getMessage(64), n.TYPE.BLUE);
          break;
        case 1:
          n.addText(q.getMessage(65), n.TYPE.ERROR);
          break;
        case 2:
          n.addText(q.getMessage(66), n.TYPE.ERROR);
      }
    }
    function c(a) {
      var b = 67;
      switch (a.result) {
        case 0:
          b = 67;
          break;
        case 1:
          b = 7;
          break;
        case 2:
          b = 68;
          break;
        case 3:
          return;
        case 4:
          b = 55;
          break;
        case 5:
          b = 432;
          break;
        case 6:
          b = 433;
          break;
        case 7:
          b = 434;
      }
      n.addText(q.getMessage(b), n.TYPE.ERROR);
    }
    function d(a) {
      f.count = a.curcount;
      f.members.push(a.name);
      f.updateChat();
      f.message(q.getMessage(179).replace("%s", a.name), "join");
    }
    function e(a) {
      1 === a.role && ((f.owner = a.name), f.updateChat());
    }
    function m(a) {
      f.isOpen &&
        ((f.count = a.curcount),
        f.removeMember(a.name),
        f.updateChat(),
        0 === a.type
          ? f.message(q.getMessage(180).replace("%s", a.name), "leave")
          : f.message(q.getMessage(181).replace("%s", a.name), "leave"));
    }
    function h(a) {
      f.limit = a.maxcount;
      f.count = a.curcount;
      f.type = a.type;
      f.title = a.title;
      f.updateChat();
    }
    function r(a) {
      var b,
        c = a.memberList.length;
      f.members = Array(c);
      for (b = 0; b < c; ++b)
        (0 === a.memberList[b].role && (f.owner = a.memberList[b].name),
          (f.members[b] = a.memberList[b].name));
      t.forEach(function (b) {
        return b.room.id === a.roomID ? (b.room.remove(), !1) : !0;
      });
      f.count = c;
      f.append();
    }
    var q = a("DB/DBManager"),
      k = a("Network/NetworkManager"),
      g = a("Network/PacketStructure"),
      t = a("Renderer/EntityManager"),
      l = a("UI/Components/ChatRoomCreate/ChatRoomCreate"),
      f = a("UI/Components/ChatRoom/ChatRoom"),
      n = a("UI/Components/ChatBox/ChatBox"),
      p = a("Engine/SessionStorage");
    l.requestRoom = function () {
      var a = new g.CZ.CREATE_CHATROOM();
      a.size = this.limit;
      a.type = this.type;
      a.passwd = this.password;
      a.title = this.title;
      k.sendPacket(a);
    };
    f.changeChatRoom = function () {
      var a = new g.CZ.CHANGE_CHATROOM();
      k.sendPacket(a);
    };
    f.requestRoleChange = function () {
      var a = new g.CZ.REQ_ROLE_CHANGE();
      k.sendPacket(a);
    };
    f.requestExpelMember = function () {
      var a = new g.CZ.REQ_EXPEL_MEMBER();
      k.sendPacket(a);
    };
    f.exitRoom = function () {
      var a = new g.CZ.EXIT_ROOM();
      k.sendPacket(a);
    };
    return function () {
      k.hookPacket(g.ZC.ACK_CREATE_CHATROOM, b);
      k.hookPacket(g.ZC.CHANGE_CHATROOM, h);
      k.hookPacket(g.ZC.ENTER_ROOM, r);
      k.hookPacket(g.ZC.MEMBER_NEWENTRY, d);
      k.hookPacket(g.ZC.ROLE_CHANGE, e);
      k.hookPacket(g.ZC.MEMBER_EXIT, m);
      k.hookPacket(g.ZC.REFUSE_ENTER_ROOM, c);
    };
  },
);
