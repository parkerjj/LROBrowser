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
      var b = t(a.AID, a.GID);
      -1 < b && ((q[b].State = a.State), f.updateFriendState(b, a.State));
    }
    function e(a) {
      function b(b) {
        return function () {
          k.answerFriendRequest(a.ReqAID, a.ReqGID, b);
        };
      }
      p.showPromptBox(
        r.getMessage(818).replace("%s", a.Name),
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
          l.addText(r.getMessage(821).replace("%s", a.Name), l.TYPE.BLUE);
          b = t(a.AID, a.GID);
          0 > b && ((b = q.length), (q[b] = {}));
          q[b].AID = a.AID;
          q[b].GID = a.GID;
          q[b].Name = a.Name;
          q[b].State = 0;
          f.updateFriend(b, q[b]);
          break;
        case 1:
          l.addText(r.getMessage(822).replace("%s", a.Name), l.TYPE.ERROR);
          break;
        case 2:
          l.addText(r.getMessage(819), l.TYPE.ERROR);
          break;
        case 3:
          l.addText(r.getMessage(820).replace("%s", a.Name), l.TYPE.ERROR);
      }
    }
    function h(a) {
      a = t(a.AID, a.GID);
      -1 < a && (q.splice(a, 1), f.removeFriend(a));
    }
    function t(a, b) {
      var c, d;
      c = 0;
      for (d = q.length; c < d; ++c)
        if (q[c].AID === a && q[c].GID === b) return c;
      return -1;
    }
    var r = a("DB/DBManager"),
      n = a("Network/NetworkManager"),
      g = a("Network/PacketStructure"),
      p = a("UI/UIManager"),
      l = a("UI/Components/ChatBox/ChatBox"),
      f = a("UI/Components/PartyFriends/PartyFriends"),
      k = {},
      q = [];
    k.init = function () {
      n.hookPacket(g.ZC.FRIENDS_LIST, c);
      n.hookPacket(g.ZC.FRIENDS_STATE, d);
      n.hookPacket(g.ZC.REQ_ADD_FRIENDS, e);
      n.hookPacket(g.ZC.ADD_FRIENDS_LIST, m);
      n.hookPacket(g.ZC.DELETE_FRIENDS, h);
      n.hookPacket(g.ZC.SETTING_WHISPER_STATE, b);
      f.onRequestNewFriend = k.addFriend;
      f.onRemoveFriend = k.removeFriend;
    };
    k.free = function () {
      q.length = 0;
    };
    k.addFriend = function (a) {
      var b = new g.CZ.ADD_FRIENDS();
      b.name = a;
      n.sendPacket(b);
    };
    k.removeFriend = function (a) {
      var b = new g.CZ.DELETE_FRIENDS();
      b.AID = q[a].AID;
      b.GID = q[a].GID;
      n.sendPacket(b);
    };
    k.answerFriendRequest = function (a, b, c) {
      var d = new g.CZ.ACK_REQ_ADD_FRIENDS();
      d.ReqAID = a;
      d.ReqGID = b;
      d.Result = c;
      n.sendPacket(d);
    };
    k.isFriend = function (a) {
      var b,
        c = q.length;
      for (b = 0; b < c; ++b) if (a === q[b].Name) return !0;
      return !1;
    };
    k.sayHi = function () {
      var a,
        b = q.length,
        c = new g.CZ.WHISPER();
      c.msg = "(Hi) *^_^*";
      for (a = 0; a < b; ++a)
        0 === q[a].State && ((c.receiver = q[a].Name), n.sendPacket(c));
      l.addText("[ To Friends ] : " + c.msg, l.TYPE.PRIVATE);
    };
    return k;
  },
);
