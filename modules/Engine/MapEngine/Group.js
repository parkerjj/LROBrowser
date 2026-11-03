define(
  "Engine/MapEngine/Group",
  "require DB/DBManager Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/EntityManager Renderer/MapRenderer UI/UIManager UI/Components/ChatBox/ChatBox UI/Components/MiniMap/MiniMap UI/Components/PartyFriends/PartyFriends UI/Components/ItemObtain/ItemObtain".split(
    " ",
  ),
  function (a) {
    function b(a) {
      function b(b) {
        return function () {
          var c = new v.CZ.PARTY_REQ_ACK_MASTER_TO_JOIN();
          c.CID = a.CID;
          c.AID = a.AID;
          c.accept = b;
          u.sendPacket(c);
        };
      }
      B.showPromptBox(
        a.name + " " + k.getMessage(94),
        "ok",
        "cancel",
        b(1),
        b(0),
      );
    }
    function c(a) {
      switch (a.result) {
        case 0:
          J.addText(k.getMessage(77), J.TYPE.BLUE);
          q.hasParty = !0;
          y.setParty(O, [
            {
              AID: q.AID,
              characterName: q.Entity.display.name,
              role: 0,
              state: 0,
              mapName: C.currentMap,
            },
          ]);
          break;
        case 1:
          J.addText(k.getMessage(78), J.TYPE.ERROR);
          break;
        case 1:
          J.addText(k.getMessage(79), J.TYPE.ERROR);
          break;
        case 3:
          J.addText(k.getMessage(1387), J.TYPE.ERROR);
      }
    }
    function d(a) {
      switch (a.refused) {
        case 0:
          q.partyLeaderAID = a.AID;
          J.addText("\u52a0\u5165\u7ec4\u961f", J.TYPE.BLUE);
          H.setMsg("\u52a0\u5165\u7ec4\u961f");
          break;
        case 1:
          (J.addText("\u52a0\u5165\u5931\u8d25", J.TYPE.BLUE),
            H.setMsg("\u52a0\u5165\u5931\u8d25"));
      }
    }
    function e(a) {
      var b, c, d;
      q.hasParty = !0;
      c = a.groupInfo.length;
      for (b = 0; b < c; ++b)
        (0 == a.groupInfo[b].role && (q.partyLeaderAID = a.groupInfo[b].AID),
          (d = A.get(a.groupInfo[b].AID)) &&
            d.life.display &&
            (a.groupInfo[b].life = d.life));
      y.setParty(a.groupName, a.groupInfo);
    }
    function m(a) {
      var b = A.get(a.AID);
      b && b.life.display && (a.life = b.life);
      y.addPartyMember(a);
    }
    function h(a) {
      switch (a.result) {
        case 2:
          J.addText(k.getMessage(1872), J.TYPE.ERROR);
          return;
        case 3:
          J.addText(k.getMessage(1873), J.TYPE.ERROR);
          return;
      }
      if (q.AID === a.AID) {
        if (q.partyLeaderAID == a.AID) {
          var b = new FormData();
          b.append("AuthToken", q.AuthToken);
          b.append("AID", q.Entity.GID);
          b.append("GDID", q.Entity.GUID);
          b.append("WorldName", "lastro");
          $.ajax({
            url: "https://game.lastro.cn/" + k.webpath + "/party/del",
            type: "POST",
            cache: !1,
            data: b,
            processData: !1,
            contentType: !1,
          })
            .done(function (a) {})
            .fail(function (a) {});
        }
        q.hasParty = !1;
        q.partyLeaderAID = 0;
      }
      y.removePartyMember(a.AID, a.characterName);
    }
    function t(a) {
      var b = A.get(a.AID);
      b &&
        ((b.life.hp = a.hp),
        (b.life.hp_max = a.maxhp),
        b.life.update(),
        a.AID !== q.AID &&
          y.updateMemberLife(a.AID, b.life.canvas, a.hp, a.maxhp));
    }
    function r(a) {
      var b = A.get(a.AID);
      b && b.dialog.set(a.msg);
      J.addText(a.msg, J.TYPE.PARTY);
    }
    function n(a) {
      0 > a.xPos || 0 > a.yPos
        ? D.removePartyMemberMark(a.AID)
        : D.addPartyMemberMark(a.AID, a.xPos, a.yPos);
    }
    function g(a) {
      y.setOptions(a.expOption, a.ItemPickupRule, a.ItemDivisionRule);
      J.addText(
        k.getMessage(291) +
          "  - " +
          k.getMessage(292) +
          "  : " +
          k.getMessage(287 + a.expOption),
        J.TYPE.INFO,
      );
      J.addText(
        k.getMessage(291) +
          "  - " +
          k.getMessage(293) +
          "  : " +
          k.getMessage(289 + a.ItemPickupRule),
        J.TYPE.INFO,
      );
      J.addText(
        k.getMessage(291) +
          "  - " +
          k.getMessage(738) +
          "  : " +
          k.getMessage(287 + a.ItemDivisionRule),
        J.TYPE.INFO,
      );
    }
    function p(a) {
      J.addText(k.getMessage(a.bRefuseJoinMsg ? 1325 : 1326), J.TYPE.INFO);
    }
    function l(a) {
      function b(a) {
        return function () {
          var b = new v.CZ.PARTY_JOIN_REQ_ACK();
          b.GRID = c;
          b.bAccept = a;
          u.sendPacket(b);
        };
      }
      var c = a.GRID;
      B.showPromptBox(
        a.groupName + " " + k.getMessage(94),
        "ok",
        "cancel",
        b(1),
        b(0),
      );
    }
    function f(a) {
      var b = 1,
        c = J.TYPE.ERROR;
      switch (a.answer) {
        case 0:
          b = 80;
          break;
        case 1:
          b = 81;
          break;
        case 2:
          b = 82;
          c = J.TYPE.BLUE;
          break;
        case 3:
          b = 83;
          break;
        case 4:
          b = 608;
          break;
        case 5:
          b = 1324;
          break;
        case 7:
          b = 71;
          break;
        case 8:
          b = 1388;
          break;
        case 9:
          b = 1871;
      }
      J.addText(k.getMessage(b).replace("%s", a.characterName), c);
    }
    var k = a("DB/DBManager"),
      q = a("Engine/SessionStorage"),
      u = a("Network/NetworkManager"),
      v = a("Network/PacketStructure"),
      A = a("Renderer/EntityManager"),
      C = a("Renderer/MapRenderer"),
      B = a("UI/UIManager"),
      J = a("UI/Components/ChatBox/ChatBox"),
      D = a("UI/Components/MiniMap/MiniMap"),
      y = a("UI/Components/PartyFriends/PartyFriends"),
      H = a("UI/Components/ItemObtain/ItemObtain"),
      N = {},
      O = "";
    N.init = function () {
      u.hookPacket(v.ZC.NOTIFY_HP_TO_GROUPM, t);
      u.hookPacket(v.ZC.NOTIFY_HP_TO_GROUPM_R2, t);
      u.hookPacket(v.ZC.NOTIFY_CHAT_PARTY, r);
      u.hookPacket(v.ZC.GROUPINFO_CHANGE, g);
      u.hookPacket(v.ZC.REQ_GROUPINFO_CHANGE_V2, g);
      u.hookPacket(v.ZC.PARTY_CONFIG, p);
      u.hookPacket(v.ZC.NOTIFY_POSITION_TO_GROUPM, n);
      u.hookPacket(v.ZC.PARTY_JOIN_REQ, l);
      u.hookPacket(v.ZC.PARTY_JOIN_REQ_ACK, f);
      u.hookPacket(v.ZC.ACK_REQ_JOIN_GROUP, f);
      u.hookPacket(v.ZC.GROUP_LIST, e);
      u.hookPacket(v.ZC.GROUP_LIST2, e);
      u.hookPacket(v.ZC.GROUP_LIST3, e);
      u.hookPacket(v.ZC.ADD_MEMBER_TO_GROUP, m);
      u.hookPacket(v.ZC.ADD_MEMBER_TO_GROUP2, m);
      u.hookPacket(v.ZC.ADD_MEMBER_TO_GROUP3, m);
      u.hookPacket(v.ZC.ADD_MEMBER_TO_GROUP4, m);
      u.hookPacket(v.ZC.DELETE_MEMBER_FROM_GROUP, h);
      u.hookPacket(v.ZC.ACK_MAKE_GROUP, c);
      u.hookPacket(v.ZC.PARTY_JOIN_REQ_ACK_FROM_MASTER, d);
      u.hookPacket(v.ZC.PARTY_REQ_MASTER_TO_JOIN, b);
      y.onExpelMember = N.onRequestExpel;
      y.onRequestChangeLeader = N.onRequestChangeLeader;
      y.onRequestLeave = N.onRequestLeave;
      y.onRequestPartyCreation = N.onRequestCreation;
      y.onRequestAddingMember = N.onRequestInvitation;
      y.onRequestSettingUpdate = N.onRequestInfoUpdate;
    };
    N.onRequestCreationEasy = function (a) {
      if (!q.hasParty) {
        O = a;
        var b = new v.CZ.MAKE_GROUP();
        b.groupName = a;
        u.sendPacket(b);
      }
    };
    N.onRequestCreation = function (a, b, c) {
      if (!q.hasParty) {
        var d = new v.CZ.MAKE_GROUP2();
        d.groupName = a;
        this.ItemPickupRule = b;
        this.ItemDivisionRule = c;
        u.sendPacket(d);
      }
    };
    N.onRequestInvitation = function (a, b) {
      if (q.hasParty && q.isPartyLeader) {
        J.addText(
          b +
            " " +
            k.getMessage(
              2059,
              " \u5df2\u7ecf\u6536\u5230\u60a8\u7684\u7ec4\u961f\u9080\u8bf7",
            ),
          J.TYPE.BLUE,
        );
        var c = new v.CZ.REQ_JOIN_GROUP();
        c.AID = a;
        c.CharName = b;
        u.sendPacket(c);
      }
    };
    N.onRequestLeave = function () {
      if (q.hasParty) {
        var a = new v.CZ.REQ_LEAVE_GROUP();
        u.sendPacket(a);
      }
    };
    N.onRequestExpel = function (a, b) {
      if (q.hasParty && q.isPartyLeader) {
        var c = new v.CZ.REQ_EXPEL_GROUP_MEMBER();
        c.AID = a;
        c.characterName = b;
        u.sendPacket(c);
      }
    };
    N.onRequestInfoUpdate = function (a, b, c) {
      if (q.hasParty && q.isPartyLeader) {
        var d = new v.CZ.GROUPINFO_CHANGE_V2();
        d.expOption = a;
        d.ItemPickupRule = b;
        d.ItemDivisionRule = c;
        u.sendPacket(d);
      }
    };
    N.onRequestChangeLeader = function (a) {
      if (q.hasParty && q.isPartyLeader) {
        var b = new v.CZ.CHANGE_GROUP_MASTER();
        b.AID = a;
        u.sendPacket(b);
      }
    };
    return N;
  },
);
