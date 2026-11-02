define(
  "Engine/MapEngine/Group",
  "require DB/DBManager Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/EntityManager Renderer/MapRenderer UI/UIManager UI/Components/ChatBox/ChatBox UI/Components/MiniMap/MiniMap UI/Components/PartyFriends/PartyFriends UI/Components/ItemObtain/ItemObtain".split(
    " ",
  ),
  function (a) {
    function b(a) {
      function b(b) {
        return function () {
          var c = new t.CZ.PARTY_REQ_ACK_MASTER_TO_JOIN();
          c.CID = a.CID;
          c.AID = a.AID;
          c.accept = b;
          v.sendPacket(c);
        };
      }
      C.showPromptBox(
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
          J.addText(n.getMessage(77), J.TYPE.BLUE);
          p.hasParty = !0;
          B.setParty(M, [
            {
              AID: p.AID,
              characterName: p.Entity.display.name,
              role: 0,
              state: 0,
              mapName: E.currentMap,
            },
          ]);
          break;
        case 1:
          J.addText(n.getMessage(78), J.TYPE.ERROR);
          break;
        case 1:
          J.addText(n.getMessage(79), J.TYPE.ERROR);
          break;
        case 3:
          J.addText(n.getMessage(1387), J.TYPE.ERROR);
      }
    }
    function d(a) {
      switch (a.refused) {
        case 0:
          p.partyLeaderAID = a.AID;
          J.addText("\u52a0\u5165\u7ec4\u961f", J.TYPE.BLUE);
          F.setMsg("\u52a0\u5165\u7ec4\u961f");
          break;
        case 1:
          (J.addText("\u52a0\u5165\u5931\u8d25", J.TYPE.BLUE),
            F.setMsg("\u52a0\u5165\u5931\u8d25"));
      }
    }
    function e(a) {
      var b, c, d;
      p.hasParty = !0;
      c = a.groupInfo.length;
      for (b = 0; b < c; ++b)
        (0 == a.groupInfo[b].role && (p.partyLeaderAID = a.groupInfo[b].AID),
          (d = z.get(a.groupInfo[b].AID)) &&
            d.life.display &&
            (a.groupInfo[b].life = d.life));
      B.setParty(a.groupName, a.groupInfo);
    }
    function m(a) {
      var b = z.get(a.AID);
      b && b.life.display && (a.life = b.life);
      B.addPartyMember(a);
    }
    function h(a) {
      switch (a.result) {
        case 2:
          J.addText(n.getMessage(1872), J.TYPE.ERROR);
          return;
        case 3:
          J.addText(n.getMessage(1873), J.TYPE.ERROR);
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
      B.removePartyMember(a.AID, a.characterName);
    }
    function q(a) {
      var b = z.get(a.AID);
      b &&
        ((b.life.hp = a.hp),
        (b.life.hp_max = a.maxhp),
        b.life.update(),
        a.AID !== p.AID &&
          B.updateMemberLife(a.AID, b.life.canvas, a.hp, a.maxhp));
    }
    function r(a) {
      var b = z.get(a.AID);
      b && b.dialog.set(a.msg);
      J.addText(a.msg, J.TYPE.PARTY);
    }
    function k(a) {
      0 > a.xPos || 0 > a.yPos
        ? A.removePartyMemberMark(a.AID)
        : A.addPartyMemberMark(a.AID, a.xPos, a.yPos);
    }
    function g(a) {
      B.setOptions(a.expOption, a.ItemPickupRule, a.ItemDivisionRule);
      J.addText(
        n.getMessage(291) +
          "  - " +
          n.getMessage(292) +
          "  : " +
          n.getMessage(287 + a.expOption),
        J.TYPE.INFO,
      );
      J.addText(
        n.getMessage(291) +
          "  - " +
          n.getMessage(293) +
          "  : " +
          n.getMessage(289 + a.ItemPickupRule),
        J.TYPE.INFO,
      );
      J.addText(
        n.getMessage(291) +
          "  - " +
          n.getMessage(738) +
          "  : " +
          n.getMessage(287 + a.ItemDivisionRule),
        J.TYPE.INFO,
      );
    }
    function u(a) {
      J.addText(n.getMessage(a.bRefuseJoinMsg ? 1325 : 1326), J.TYPE.INFO);
    }
    function l(a) {
      function b(a) {
        return function () {
          var b = new t.CZ.PARTY_JOIN_REQ_ACK();
          b.GRID = c;
          b.bAccept = a;
          v.sendPacket(b);
        };
      }
      var c = a.GRID;
      C.showPromptBox(
        a.groupName + " " + n.getMessage(94),
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
      J.addText(n.getMessage(b).replace("%s", a.characterName), c);
    }
    var n = a("DB/DBManager"),
      p = a("Engine/SessionStorage"),
      v = a("Network/NetworkManager"),
      t = a("Network/PacketStructure"),
      z = a("Renderer/EntityManager"),
      E = a("Renderer/MapRenderer"),
      C = a("UI/UIManager"),
      J = a("UI/Components/ChatBox/ChatBox"),
      A = a("UI/Components/MiniMap/MiniMap"),
      B = a("UI/Components/PartyFriends/PartyFriends"),
      F = a("UI/Components/ItemObtain/ItemObtain"),
      O = {},
      M = "";
    O.init = function () {
      v.hookPacket(t.ZC.NOTIFY_HP_TO_GROUPM, q);
      v.hookPacket(t.ZC.NOTIFY_HP_TO_GROUPM_R2, q);
      v.hookPacket(t.ZC.NOTIFY_CHAT_PARTY, r);
      v.hookPacket(t.ZC.GROUPINFO_CHANGE, g);
      v.hookPacket(t.ZC.REQ_GROUPINFO_CHANGE_V2, g);
      v.hookPacket(t.ZC.PARTY_CONFIG, u);
      v.hookPacket(t.ZC.NOTIFY_POSITION_TO_GROUPM, k);
      v.hookPacket(t.ZC.PARTY_JOIN_REQ, l);
      v.hookPacket(t.ZC.PARTY_JOIN_REQ_ACK, f);
      v.hookPacket(t.ZC.ACK_REQ_JOIN_GROUP, f);
      v.hookPacket(t.ZC.GROUP_LIST, e);
      v.hookPacket(t.ZC.GROUP_LIST2, e);
      v.hookPacket(t.ZC.GROUP_LIST3, e);
      v.hookPacket(t.ZC.ADD_MEMBER_TO_GROUP, m);
      v.hookPacket(t.ZC.ADD_MEMBER_TO_GROUP2, m);
      v.hookPacket(t.ZC.ADD_MEMBER_TO_GROUP3, m);
      v.hookPacket(t.ZC.ADD_MEMBER_TO_GROUP4, m);
      v.hookPacket(t.ZC.DELETE_MEMBER_FROM_GROUP, h);
      v.hookPacket(t.ZC.ACK_MAKE_GROUP, c);
      v.hookPacket(t.ZC.PARTY_JOIN_REQ_ACK_FROM_MASTER, d);
      v.hookPacket(t.ZC.PARTY_REQ_MASTER_TO_JOIN, b);
      B.onExpelMember = O.onRequestExpel;
      B.onRequestChangeLeader = O.onRequestChangeLeader;
      B.onRequestLeave = O.onRequestLeave;
      B.onRequestPartyCreation = O.onRequestCreation;
      B.onRequestAddingMember = O.onRequestInvitation;
      B.onRequestSettingUpdate = O.onRequestInfoUpdate;
    };
    O.onRequestCreationEasy = function (a) {
      if (!p.hasParty) {
        M = a;
        var b = new t.CZ.MAKE_GROUP();
        b.groupName = a;
        v.sendPacket(b);
      }
    };
    O.onRequestCreation = function (a, b, c) {
      if (!p.hasParty) {
        var d = new t.CZ.MAKE_GROUP2();
        d.groupName = a;
        this.ItemPickupRule = b;
        this.ItemDivisionRule = c;
        v.sendPacket(d);
      }
    };
    O.onRequestInvitation = function (a, b) {
      if (p.hasParty && p.isPartyLeader) {
        J.addText(
          b +
            " " +
            n.getMessage(
              2059,
              " \u5df2\u7ecf\u6536\u5230\u60a8\u7684\u7ec4\u961f\u9080\u8bf7",
            ),
          J.TYPE.BLUE,
        );
        var c = new t.CZ.REQ_JOIN_GROUP();
        c.AID = a;
        c.CharName = b;
        v.sendPacket(c);
      }
    };
    O.onRequestLeave = function () {
      if (p.hasParty) {
        var a = new t.CZ.REQ_LEAVE_GROUP();
        v.sendPacket(a);
      }
    };
    O.onRequestExpel = function (a, b) {
      if (p.hasParty && p.isPartyLeader) {
        var c = new t.CZ.REQ_EXPEL_GROUP_MEMBER();
        c.AID = a;
        c.characterName = b;
        v.sendPacket(c);
      }
    };
    O.onRequestInfoUpdate = function (a, b, c) {
      if (p.hasParty && p.isPartyLeader) {
        var d = new t.CZ.GROUPINFO_CHANGE_V2();
        d.expOption = a;
        d.ItemPickupRule = b;
        d.ItemDivisionRule = c;
        v.sendPacket(d);
      }
    };
    O.onRequestChangeLeader = function (a) {
      if (p.hasParty && p.isPartyLeader) {
        var b = new t.CZ.CHANGE_GROUP_MASTER();
        b.AID = a;
        v.sendPacket(b);
      }
    };
    return O;
  },
);
