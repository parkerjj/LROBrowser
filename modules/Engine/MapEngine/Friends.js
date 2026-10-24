define(
  "Engine/MapEngine/Friends",
  "require DB/DBManager Network/NetworkManager Network/PacketStructure UI/UIManager UI/Components/ChatBox/ChatBox UI/Components/PartyFriends/PartyFriends".split(
    " ",
  ),
  function (a) {
    function b(a) {}
    function c(a) {
      p = a.friendList;
      f.setFriends(p);
    }
    function d(a) {
      var b = r(a.AID, a.GID);
      -1 < b && ((p[b].State = a.State), f.updateFriendState(b, a.State));
    }
    function e(a) {
      function b(b) {
        return function () {
          n.answerFriendRequest(a.ReqAID, a.ReqGID, b);
        };
      }
      t.showPromptBox(
        q.getMessage(818).replace("%s", a.Name),
        "ok",
        "cancel",
        b(1),
        b(0),
      );
    }
    function m(a) {
      var b;
      switch (a.Result) {
        case 0:
          l.addText(q.getMessage(821).replace("%s", a.Name), l.TYPE.BLUE);
          b = r(a.AID, a.GID);
          0 > b && ((b = p.length), (p[b] = {}));
          p[b].AID = a.AID;
          p[b].GID = a.GID;
          p[b].Name = a.Name;
          p[b].State = 0;
          f.updateFriend(b, p[b]);
          break;
        case 1:
          l.addText(q.getMessage(822).replace("%s", a.Name), l.TYPE.ERROR);
          break;
        case 2:
          l.addText(q.getMessage(819), l.TYPE.ERROR);
          break;
        case 3:
          l.addText(q.getMessage(820).replace("%s", a.Name), l.TYPE.ERROR);
      }
    }
    function h(a) {
      a = r(a.AID, a.GID);
      -1 < a && (p.splice(a, 1), f.removeFriend(a));
    }
    function r(a, b) {
      var c, d;
      c = 0;
      for (d = p.length; c < d; ++c)
        if (p[c].AID === a && p[c].GID === b) return c;
      return -1;
    }
    var q = a("DB/DBManager"),
      k = a("Network/NetworkManager"),
      g = a("Network/PacketStructure"),
      t = a("UI/UIManager"),
      l = a("UI/Components/ChatBox/ChatBox"),
      f = a("UI/Components/PartyFriends/PartyFriends"),
      n = {},
      p = [];
    n.init = function () {
      k.hookPacket(g.ZC.FRIENDS_LIST, c);
      k.hookPacket(g.ZC.FRIENDS_STATE, d);
      k.hookPacket(g.ZC.REQ_ADD_FRIENDS, e);
      k.hookPacket(g.ZC.ADD_FRIENDS_LIST, m);
      k.hookPacket(g.ZC.DELETE_FRIENDS, h);
      k.hookPacket(g.ZC.SETTING_WHISPER_STATE, b);
      f.onRequestNewFriend = n.addFriend;
      f.onRemoveFriend = n.removeFriend;
    };
    n.free = function () {
      p.length = 0;
    };
    n.addFriend = function (a) {
      var b = new g.CZ.ADD_FRIENDS();
      b.name = a;
      k.sendPacket(b);
    };
    n.removeFriend = function (a) {
      var b = new g.CZ.DELETE_FRIENDS();
      b.AID = p[a].AID;
      b.GID = p[a].GID;
      k.sendPacket(b);
    };
    n.answerFriendRequest = function (a, b, c) {
      var d = new g.CZ.ACK_REQ_ADD_FRIENDS();
      d.ReqAID = a;
      d.ReqGID = b;
      d.Result = c;
      k.sendPacket(d);
    };
    n.isFriend = function (a) {
      var b,
        c = p.length;
      for (b = 0; b < c; ++b) if (a === p[b].Name) return !0;
      return !1;
    };
    n.sayHi = function () {
      var a,
        b = p.length,
        c = new g.CZ.WHISPER();
      c.msg = "(Hi) *^_^*";
      for (a = 0; a < b; ++a)
        0 === p[a].State && ((c.receiver = p[a].Name), k.sendPacket(c));
      l.addText("[ To Friends ] : " + c.msg, l.TYPE.PRIVATE);
    };
    return n;
  },
);
