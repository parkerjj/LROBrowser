define(
  "Engine/MapEngine/Group",
  "require DB/DBManager Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/EntityManager Renderer/MapRenderer UI/UIManager UI/Components/ChatBox/ChatBox UI/Components/MiniMap/MiniMap UI/Components/PartyFriends/PartyFriends UI/Components/ItemObtain/ItemObtain".split(
    " ",
  ),
  function (a) {
    function b(a) {
      function b(b) {
        return function () {
          var c = new u.CZ.PARTY_REQ_ACK_MASTER_TO_JOIN();
          c.CID = a.CID;
          c.AID = a.AID;
          c.accept = b;
          v.sendPacket(c);
        };
      }
      B.showPromptBox(
        a.name + " " + n.getMessage(94),
        "ok",
        "cancel",
        b(1),
        b(0),
      );
    }
    function c(a) {
      switch (a.result) {
        case 0:
          O.addText(n.getMessage(77), O.TYPE.BLUE);
          p.hasParty = !0;
          y.setParty(I, [
            {
              AID: p.AID,
              characterName: p.Entity.display.name,
              role: 0,
              state: 0,
              mapName: D.currentMap,
            },
          ]);
          break;
        case 1:
          O.addText(n.getMessage(78), O.TYPE.ERROR);
          break;
        case 1:
          O.addText(n.getMessage(79), O.TYPE.ERROR);
          break;
        case 3:
          O.addText(n.getMessage(1387), O.TYPE.ERROR);
      }
    }
    function d(a) {
      switch (a.refused) {
        case 0:
          p.partyLeaderAID = a.AID;
          O.addText("\u52a0\u5165\u7ec4\u961f", O.TYPE.BLUE);
          z.setMsg("\u52a0\u5165\u7ec4\u961f");
          break;
        case 1:
          (O.addText("\u52a0\u5165\u5931\u8d25", O.TYPE.BLUE),
            z.setMsg("\u52a0\u5165\u5931\u8d25"));
      }
    }
    function e(a) {
      var b, c, d;
      p.hasParty = !0;
      c = a.groupInfo.length;
      for (b = 0; b < c; ++b)
        (0 == a.groupInfo[b].role && (p.partyLeaderAID = a.groupInfo[b].AID),
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
          O.addText(n.getMessage(1872), O.TYPE.ERROR);
          return;
        case 3:
          O.addText(n.getMessage(1873), O.TYPE.ERROR);
          return;
      }
      if (p.AID === a.AID) {
        if (p.partyLeaderAID == a.AID) {
          var b = new FormData();
          b.append("AuthToken", p.AuthToken);
          b.append("AID", p.Entity.GID);
          b.append("GDID", p.Entity.GUID);
          b.append("WorldName", "lastro");
          $.ajax({
            url: "https://game.lastro.cn/" + n.webpath + "/party/del",
            type: "POST",
            cache: !1,
            data: b,
            processData: !1,
            contentType: !1,
          })
            .done(function (a) {})
            .fail(function (a) {});
        }
        p.hasParty = !1;
        p.partyLeaderAID = 0;
      }
      y.removePartyMember(a.AID, a.characterName);
    }
    function r(a) {
      var b = A.get(a.AID);
      b &&
        ((b.life.hp = a.hp),
        (b.life.hp_max = a.maxhp),
        b.life.update(),
        a.AID !== p.AID &&
          y.updateMemberLife(a.AID, b.life.canvas, a.hp, a.maxhp));
    }
    function q(a) {
      var b = A.get(a.AID);
      b && b.dialog.set(a.msg);
      O.addText(a.msg, O.TYPE.PARTY);
    }
    function k(a) {
      0 > a.xPos || 0 > a.yPos
        ? C.removePartyMemberMark(a.AID)
        : C.addPartyMemberMark(a.AID, a.xPos, a.yPos);
    }
    function g(a) {
      y.setOptions(a.expOption, a.ItemPickupRule, a.ItemDivisionRule);
      O.addText(
        n.getMessage(291) +
          "  - " +
          n.getMessage(292) +
          "  : " +
          n.getMessage(287 + a.expOption),
        O.TYPE.INFO,
      );
      O.addText(
        n.getMessage(291) +
          "  - " +
          n.getMessage(293) +
          "  : " +
          n.getMessage(289 + a.ItemPickupRule),
        O.TYPE.INFO,
      );
      O.addText(
        n.getMessage(291) +
          "  - " +
          n.getMessage(738) +
          "  : " +
          n.getMessage(287 + a.ItemDivisionRule),
        O.TYPE.INFO,
      );
    }
    function t(a) {
      O.addText(n.getMessage(a.bRefuseJoinMsg ? 1325 : 1326), O.TYPE.INFO);
    }
    function l(a) {
      function b(a) {
        return function () {
          var b = new u.CZ.PARTY_JOIN_REQ_ACK();
          b.GRID = c;
          b.bAccept = a;
          v.sendPacket(b);
        };
      }
      var c = a.GRID;
      B.showPromptBox(
        a.groupName + " " + n.getMessage(94),
        "ok",
        "cancel",
        b(1),
        b(0),
      );
    }
    function f(a) {
      var b = 1,
        c = O.TYPE.ERROR;
      switch (a.answer) {
        case 0:
          b = 80;
          break;
        case 1:
          b = 81;
          break;
        case 2:
          b = 82;
          c = O.TYPE.BLUE;
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
      O.addText(n.getMessage(b).replace("%s", a.characterName), c);
    }
    var n = a("DB/DBManager"),
      p = a("Engine/SessionStorage"),
      v = a("Network/NetworkManager"),
      u = a("Network/PacketStructure"),
      A = a("Renderer/EntityManager"),
      D = a("Renderer/MapRenderer"),
      B = a("UI/UIManager"),
      O = a("UI/Components/ChatBox/ChatBox"),
      C = a("UI/Components/MiniMap/MiniMap"),
      y = a("UI/Components/PartyFriends/PartyFriends"),
      z = a("UI/Components/ItemObtain/ItemObtain"),
      J = {},
      I = "";
    J.init = function () {
      v.hookPacket(u.ZC.NOTIFY_HP_TO_GROUPM, r);
      v.hookPacket(u.ZC.NOTIFY_HP_TO_GROUPM_R2, r);
      v.hookPacket(u.ZC.NOTIFY_CHAT_PARTY, q);
      v.hookPacket(u.ZC.GROUPINFO_CHANGE, g);
      v.hookPacket(u.ZC.REQ_GROUPINFO_CHANGE_V2, g);
      v.hookPacket(u.ZC.PARTY_CONFIG, t);
      v.hookPacket(u.ZC.NOTIFY_POSITION_TO_GROUPM, k);
      v.hookPacket(u.ZC.PARTY_JOIN_REQ, l);
      v.hookPacket(u.ZC.PARTY_JOIN_REQ_ACK, f);
      v.hookPacket(u.ZC.ACK_REQ_JOIN_GROUP, f);
      v.hookPacket(u.ZC.GROUP_LIST, e);
      v.hookPacket(u.ZC.GROUP_LIST2, e);
      v.hookPacket(u.ZC.GROUP_LIST3, e);
      v.hookPacket(u.ZC.ADD_MEMBER_TO_GROUP, m);
      v.hookPacket(u.ZC.ADD_MEMBER_TO_GROUP2, m);
      v.hookPacket(u.ZC.ADD_MEMBER_TO_GROUP3, m);
      v.hookPacket(u.ZC.ADD_MEMBER_TO_GROUP4, m);
      v.hookPacket(u.ZC.DELETE_MEMBER_FROM_GROUP, h);
      v.hookPacket(u.ZC.ACK_MAKE_GROUP, c);
      v.hookPacket(u.ZC.PARTY_JOIN_REQ_ACK_FROM_MASTER, d);
      v.hookPacket(u.ZC.PARTY_REQ_MASTER_TO_JOIN, b);
      y.onExpelMember = J.onRequestExpel;
      y.onRequestChangeLeader = J.onRequestChangeLeader;
      y.onRequestLeave = J.onRequestLeave;
      y.onRequestPartyCreation = J.onRequestCreation;
      y.onRequestAddingMember = J.onRequestInvitation;
      y.onRequestSettingUpdate = J.onRequestInfoUpdate;
    };
    J.onRequestCreationEasy = function (a) {
      if (!p.hasParty) {
        I = a;
        var b = new u.CZ.MAKE_GROUP();
        b.groupName = a;
        v.sendPacket(b);
      }
    };
    J.onRequestCreation = function (a, b, c) {
      if (!p.hasParty) {
        var d = new u.CZ.MAKE_GROUP2();
        d.groupName = a;
        this.ItemPickupRule = b;
        this.ItemDivisionRule = c;
        v.sendPacket(d);
      }
    };
    J.onRequestInvitation = function (a, b) {
      if (p.hasParty && p.isPartyLeader) {
        O.addText(
          b +
            " " +
            n.getMessage(
              2059,
              " \u5df2\u7ecf\u6536\u5230\u60a8\u7684\u7ec4\u961f\u9080\u8bf7",
            ),
          O.TYPE.BLUE,
        );
        var c = new u.CZ.REQ_JOIN_GROUP();
        c.AID = a;
        c.CharName = b;
        v.sendPacket(c);
      }
    };
    J.onRequestLeave = function () {
      if (p.hasParty) {
        var a = new u.CZ.REQ_LEAVE_GROUP();
        v.sendPacket(a);
      }
    };
    J.onRequestExpel = function (a, b) {
      if (p.hasParty && p.isPartyLeader) {
        var c = new u.CZ.REQ_EXPEL_GROUP_MEMBER();
        c.AID = a;
        c.characterName = b;
        v.sendPacket(c);
      }
    };
    J.onRequestInfoUpdate = function (a, b, c) {
      if (p.hasParty && p.isPartyLeader) {
        var d = new u.CZ.GROUPINFO_CHANGE_V2();
        d.expOption = a;
        d.ItemPickupRule = b;
        d.ItemDivisionRule = c;
        v.sendPacket(d);
      }
    };
    J.onRequestChangeLeader = function (a) {
      if (p.hasParty && p.isPartyLeader) {
        var b = new u.CZ.CHANGE_GROUP_MASTER();
        b.AID = a;
        v.sendPacket(b);
      }
    };
    return J;
  },
);
