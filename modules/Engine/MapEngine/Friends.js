define(
  "Engine/MapEngine/Friends",
  "require DB/DBManager Network/NetworkManager Network/PacketStructure UI/UIManager UI/Components/ChatBox/ChatBox UI/Components/PartyFriends/PartyFriends".split(
    " ",
  ),
  function (a) {
    function b(a) {}
    function c(a) {
      q = a.friendList;
      f.setFriends(q);
    }
    function d(a) {
      var b = r(a.AID, a.GID);
      -1 < b && ((q[b].State = a.State), f.updateFriendState(b, a.State));
    }
    function e(a) {
      function b(b) {
        return function () {
          m.answerFriendRequest(a.ReqAID, a.ReqGID, b);
        };
      }
      p.showPromptBox(
        t.getMessage(818).replace("%s", a.Name),
        "ok",
        "cancel",
        b(1),
        b(0),
      );
    }
    function l(a) {
      var b;
      switch (a.Result) {
        case 0:
          k.addText(t.getMessage(821).replace("%s", a.Name), k.TYPE.BLUE);
          b = r(a.AID, a.GID);
          0 > b && ((b = q.length), (q[b] = {}));
          q[b].AID = a.AID;
          q[b].GID = a.GID;
          q[b].Name = a.Name;
          q[b].State = 0;
          f.updateFriend(b, q[b]);
          break;
        case 1:
          k.addText(t.getMessage(822).replace("%s", a.Name), k.TYPE.ERROR);
          break;
        case 2:
          k.addText(t.getMessage(819), k.TYPE.ERROR);
          break;
        case 3:
          k.addText(t.getMessage(820).replace("%s", a.Name), k.TYPE.ERROR);
      }
    }
    function h(a) {
      a = r(a.AID, a.GID);
      -1 < a && (q.splice(a, 1), f.removeFriend(a));
    }
    function r(a, b) {
      var c, d;
      c = 0;
      for (d = q.length; c < d; ++c)
        if (q[c].AID === a && q[c].GID === b) return c;
      return -1;
    }
    var t = a("DB/DBManager"),
      n = a("Network/NetworkManager"),
      g = a("Network/PacketStructure"),
      p = a("UI/UIManager"),
      k = a("UI/Components/ChatBox/ChatBox"),
      f = a("UI/Components/PartyFriends/PartyFriends"),
      m = {},
      q = [];
    m.init = function () {
      n.hookPacket(g.ZC.FRIENDS_LIST, c);
      n.hookPacket(g.ZC.FRIENDS_STATE, d);
      n.hookPacket(g.ZC.REQ_ADD_FRIENDS, e);
      n.hookPacket(g.ZC.ADD_FRIENDS_LIST, l);
      n.hookPacket(g.ZC.DELETE_FRIENDS, h);
      n.hookPacket(g.ZC.SETTING_WHISPER_STATE, b);
      f.onRequestNewFriend = m.addFriend;
      f.onRemoveFriend = m.removeFriend;
    };
    m.free = function () {
      q.length = 0;
    };
    m.addFriend = function (a) {
      var b = new g.CZ.ADD_FRIENDS();
      b.name = a;
      n.sendPacket(b);
    };
    m.removeFriend = function (a) {
      var b = new g.CZ.DELETE_FRIENDS();
      b.AID = q[a].AID;
      b.GID = q[a].GID;
      n.sendPacket(b);
    };
    m.answerFriendRequest = function (a, b, c) {
      var d = new g.CZ.ACK_REQ_ADD_FRIENDS();
      d.ReqAID = a;
      d.ReqGID = b;
      d.Result = c;
      n.sendPacket(d);
    };
    m.isFriend = function (a) {
      var b,
        c = q.length;
      for (b = 0; b < c; ++b) if (a === q[b].Name) return !0;
      return !1;
    };
    m.sayHi = function () {
      var a,
        b = q.length,
        c = new g.CZ.WHISPER();
      c.msg = "(Hi) *^_^*";
      for (a = 0; a < b; ++a)
        0 === q[a].State && ((c.receiver = q[a].Name), n.sendPacket(c));
      k.addText("[ To Friends ] : " + c.msg, k.TYPE.PRIVATE);
    };
    return m;
  },
);
