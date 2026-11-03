define(
  "Engine/MapEngine/ChatRoom",
  "require DB/DBManager Network/NetworkManager Network/PacketStructure Renderer/EntityManager UI/Components/ChatRoomCreate/ChatRoomCreate UI/Components/ChatRoom/ChatRoom UI/Components/ChatBox/ChatBox Engine/SessionStorage".split(
    " ",
  ),
  function (a) {
    function b(a) {
      switch (a.result) {
        case 0:
          f.title = k.title;
          f.limit = k.limit;
          f.type = k.type;
          f.count = 1;
          f.members = [q.Entity.display.name];
          f.owner = q.Entity.display.name;
          f.append();
          m.addText(t.getMessage(64), m.TYPE.BLUE);
          break;
        case 1:
          m.addText(t.getMessage(65), m.TYPE.ERROR);
          break;
        case 2:
          m.addText(t.getMessage(66), m.TYPE.ERROR);
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
      m.addText(t.getMessage(b), m.TYPE.ERROR);
    }
    function d(a) {
      f.count = a.curcount;
      f.members.push(a.name);
      f.updateChat();
      f.message(t.getMessage(179).replace("%s", a.name), "join");
    }
    function e(a) {
      1 === a.role && ((f.owner = a.name), f.updateChat());
    }
    function l(a) {
      f.isOpen &&
        ((f.count = a.curcount),
        f.removeMember(a.name),
        f.updateChat(),
        0 === a.type
          ? f.message(t.getMessage(180).replace("%s", a.name), "leave")
          : f.message(t.getMessage(181).replace("%s", a.name), "leave"));
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
      p.forEach(function (b) {
        return b.room.id === a.roomID ? (b.room.remove(), !1) : !0;
      });
      f.count = c;
      f.append();
    }
    var t = a("DB/DBManager"),
      n = a("Network/NetworkManager"),
      g = a("Network/PacketStructure"),
      p = a("Renderer/EntityManager"),
      k = a("UI/Components/ChatRoomCreate/ChatRoomCreate"),
      f = a("UI/Components/ChatRoom/ChatRoom"),
      m = a("UI/Components/ChatBox/ChatBox"),
      q = a("Engine/SessionStorage");
    k.requestRoom = function () {
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
      n.hookPacket(g.ZC.ENTER_ROOM, r);
      n.hookPacket(g.ZC.MEMBER_NEWENTRY, d);
      n.hookPacket(g.ZC.ROLE_CHANGE, e);
      n.hookPacket(g.ZC.MEMBER_EXIT, l);
      n.hookPacket(g.ZC.REFUSE_ENTER_ROOM, c);
    };
  },
);
