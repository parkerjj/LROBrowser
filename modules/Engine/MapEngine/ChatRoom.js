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
          f.members = [q.Entity.display.name];
          f.owner = q.Entity.display.name;
          f.append();
          k.addText(r.getMessage(64), k.TYPE.BLUE);
          break;
        case 1:
          k.addText(r.getMessage(65), k.TYPE.ERROR);
          break;
        case 2:
          k.addText(r.getMessage(66), k.TYPE.ERROR);
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
      k.addText(r.getMessage(b), k.TYPE.ERROR);
    }
    function d(a) {
      f.count = a.curcount;
      f.members.push(a.name);
      f.updateChat();
      f.message(r.getMessage(179).replace("%s", a.name), "join");
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
          ? f.message(r.getMessage(180).replace("%s", a.name), "leave")
          : f.message(r.getMessage(181).replace("%s", a.name), "leave"));
    }
    function h(a) {
      f.limit = a.maxcount;
      f.count = a.curcount;
      f.type = a.type;
      f.title = a.title;
      f.updateChat();
    }
    function t(a) {
      var b,
        c = a.memberList.length;
      f.members = Array(c);
      for (b = 0; b < c; ++b)
        (0 === a.memberList[b].role && (f.owner = a.memberList[b].name),
          (f.members[b] = a.memberList[b].name));
      p.forEach(function (b) {
        return b.room.id === a.roomID ? (b.room.remove(), !1) : !0;
      });
      f.count = c;
      f.append();
    }
    var r = a("DB/DBManager"),
      n = a("Network/NetworkManager"),
      g = a("Network/PacketStructure"),
      p = a("Renderer/EntityManager"),
      l = a("UI/Components/ChatRoomCreate/ChatRoomCreate"),
      f = a("UI/Components/ChatRoom/ChatRoom"),
      k = a("UI/Components/ChatBox/ChatBox"),
      q = a("Engine/SessionStorage");
    l.requestRoom = function () {
      var a = new g.CZ.CREATE_CHATROOM();
      a.size = this.limit;
      a.type = this.type;
      a.passwd = this.password;
      a.title = this.title;
      n.sendPacket(a);
    };
    f.changeChatRoom = function () {
      var a = new g.CZ.CHANGE_CHATROOM();
      n.sendPacket(a);
    };
    f.requestRoleChange = function () {
      var a = new g.CZ.REQ_ROLE_CHANGE();
      n.sendPacket(a);
    };
    f.requestExpelMember = function () {
      var a = new g.CZ.REQ_EXPEL_MEMBER();
      n.sendPacket(a);
    };
    f.exitRoom = function () {
      var a = new g.CZ.EXIT_ROOM();
      n.sendPacket(a);
    };
    return function () {
      n.hookPacket(g.ZC.ACK_CREATE_CHATROOM, b);
      n.hookPacket(g.ZC.CHANGE_CHATROOM, h);
      n.hookPacket(g.ZC.ENTER_ROOM, t);
      n.hookPacket(g.ZC.MEMBER_NEWENTRY, d);
      n.hookPacket(g.ZC.ROLE_CHANGE, e);
      n.hookPacket(g.ZC.MEMBER_EXIT, m);
      n.hookPacket(g.ZC.REFUSE_ENTER_ROOM, c);
    };
  },
);
