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
        a.name + " " + m.getMessage(94),
        "ok",
        "cancel",
        b(1),
        b(0),
      );
    }
    function c(a) {
      switch (a.result) {
        case 0:
          H.addText(m.getMessage(77), H.TYPE.BLUE);
          q.hasParty = !0;
          z.setParty(N, [
            {
              AID: q.AID,
              characterName: q.Entity.display.name,
              role: 0,
              state: 0,
              mapName: D.currentMap,
            },
          ]);
          break;
        case 1:
          H.addText(m.getMessage(78), H.TYPE.ERROR);
          break;
        case 1:
          H.addText(m.getMessage(79), H.TYPE.ERROR);
          break;
        case 3:
          H.addText(m.getMessage(1387), H.TYPE.ERROR);
      }
    }
    function d(a) {
      switch (a.refused) {
        case 0:
          q.partyLeaderAID = a.AID;
          H.addText("\u52a0\u5165\u7ec4\u961f", H.TYPE.BLUE);
          G.setMsg("\u52a0\u5165\u7ec4\u961f");
          break;
        case 1:
          (H.addText("\u52a0\u5165\u5931\u8d25", H.TYPE.BLUE),
            G.setMsg("\u52a0\u5165\u5931\u8d25"));
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
      z.setParty(a.groupName, a.groupInfo);
    }
    function l(a) {
      var b = A.get(a.AID);
      b && b.life.display && (a.life = b.life);
      z.addPartyMember(a);
    }
    function h(a) {
      switch (a.result) {
        case 2:
          H.addText(m.getMessage(1872), H.TYPE.ERROR);
          return;
        case 3:
          H.addText(m.getMessage(1873), H.TYPE.ERROR);
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
            url: "https://game.lastro.cn/" + m.webpath + "/party/del",
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
      z.removePartyMember(a.AID, a.characterName);
    }
    function r(a) {
      var b = A.get(a.AID);
      b &&
        ((b.life.hp = a.hp),
        (b.life.hp_max = a.maxhp),
        b.life.update(),
        a.AID !== q.AID &&
          z.updateMemberLife(a.AID, b.life.canvas, a.hp, a.maxhp));
    }
    function t(a) {
      var b = A.get(a.AID);
      b && b.dialog.set(a.msg);
      H.addText(a.msg, H.TYPE.PARTY);
    }
    function n(a) {
      0 > a.xPos || 0 > a.yPos
        ? C.removePartyMemberMark(a.AID)
        : C.addPartyMemberMark(a.AID, a.xPos, a.yPos);
    }
    function g(a) {
      z.setOptions(a.expOption, a.ItemPickupRule, a.ItemDivisionRule);
      H.addText(
        m.getMessage(291) +
          "  - " +
          m.getMessage(292) +
          "  : " +
          m.getMessage(287 + a.expOption),
        H.TYPE.INFO,
      );
      H.addText(
        m.getMessage(291) +
          "  - " +
          m.getMessage(293) +
          "  : " +
          m.getMessage(289 + a.ItemPickupRule),
        H.TYPE.INFO,
      );
      H.addText(
        m.getMessage(291) +
          "  - " +
          m.getMessage(738) +
          "  : " +
          m.getMessage(287 + a.ItemDivisionRule),
        H.TYPE.INFO,
      );
    }
    function p(a) {
      H.addText(m.getMessage(a.bRefuseJoinMsg ? 1325 : 1326), H.TYPE.INFO);
    }
    function k(a) {
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
        a.groupName + " " + m.getMessage(94),
        "ok",
        "cancel",
        b(1),
        b(0),
      );
    }
    function f(a) {
      var b = 1,
        c = H.TYPE.ERROR;
      switch (a.answer) {
        case 0:
          b = 80;
          break;
        case 1:
          b = 81;
          break;
        case 2:
          b = 82;
          c = H.TYPE.BLUE;
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
      H.addText(m.getMessage(b).replace("%s", a.characterName), c);
    }
    var m = a("DB/DBManager"),
      q = a("Engine/SessionStorage"),
      v = a("Network/NetworkManager"),
      u = a("Network/PacketStructure"),
      A = a("Renderer/EntityManager"),
      D = a("Renderer/MapRenderer"),
      B = a("UI/UIManager"),
      H = a("UI/Components/ChatBox/ChatBox"),
      C = a("UI/Components/MiniMap/MiniMap"),
      z = a("UI/Components/PartyFriends/PartyFriends"),
      G = a("UI/Components/ItemObtain/ItemObtain"),
      P = {},
      N = "";
    P.init = function () {
      v.hookPacket(u.ZC.NOTIFY_HP_TO_GROUPM, r);
      v.hookPacket(u.ZC.NOTIFY_HP_TO_GROUPM_R2, r);
      v.hookPacket(u.ZC.NOTIFY_CHAT_PARTY, t);
      v.hookPacket(u.ZC.GROUPINFO_CHANGE, g);
      v.hookPacket(u.ZC.REQ_GROUPINFO_CHANGE_V2, g);
      v.hookPacket(u.ZC.PARTY_CONFIG, p);
      v.hookPacket(u.ZC.NOTIFY_POSITION_TO_GROUPM, n);
      v.hookPacket(u.ZC.PARTY_JOIN_REQ, k);
      v.hookPacket(u.ZC.PARTY_JOIN_REQ_ACK, f);
      v.hookPacket(u.ZC.ACK_REQ_JOIN_GROUP, f);
      v.hookPacket(u.ZC.GROUP_LIST, e);
      v.hookPacket(u.ZC.GROUP_LIST2, e);
      v.hookPacket(u.ZC.GROUP_LIST3, e);
      v.hookPacket(u.ZC.ADD_MEMBER_TO_GROUP, l);
      v.hookPacket(u.ZC.ADD_MEMBER_TO_GROUP2, l);
      v.hookPacket(u.ZC.ADD_MEMBER_TO_GROUP3, l);
      v.hookPacket(u.ZC.ADD_MEMBER_TO_GROUP4, l);
      v.hookPacket(u.ZC.DELETE_MEMBER_FROM_GROUP, h);
      v.hookPacket(u.ZC.ACK_MAKE_GROUP, c);
      v.hookPacket(u.ZC.PARTY_JOIN_REQ_ACK_FROM_MASTER, d);
      v.hookPacket(u.ZC.PARTY_REQ_MASTER_TO_JOIN, b);
      z.onExpelMember = P.onRequestExpel;
      z.onRequestChangeLeader = P.onRequestChangeLeader;
      z.onRequestLeave = P.onRequestLeave;
      z.onRequestPartyCreation = P.onRequestCreation;
      z.onRequestAddingMember = P.onRequestInvitation;
      z.onRequestSettingUpdate = P.onRequestInfoUpdate;
    };
    P.onRequestCreationEasy = function (a) {
      if (!q.hasParty) {
        N = a;
        var b = new u.CZ.MAKE_GROUP();
        b.groupName = a;
        v.sendPacket(b);
      }
    };
    P.onRequestCreation = function (a, b, c) {
      if (!q.hasParty) {
        var d = new u.CZ.MAKE_GROUP2();
        d.groupName = a;
        this.ItemPickupRule = b;
        this.ItemDivisionRule = c;
        v.sendPacket(d);
      }
    };
    P.onRequestInvitation = function (a, b) {
      if (q.hasParty && q.isPartyLeader) {
        H.addText(
          b +
            " " +
            m.getMessage(
              2059,
              " \u5df2\u7ecf\u6536\u5230\u60a8\u7684\u7ec4\u961f\u9080\u8bf7",
            ),
          H.TYPE.BLUE,
        );
        var c = new u.CZ.REQ_JOIN_GROUP();
        c.AID = a;
        c.CharName = b;
        v.sendPacket(c);
      }
    };
    P.onRequestLeave = function () {
      if (q.hasParty) {
        var a = new u.CZ.REQ_LEAVE_GROUP();
        v.sendPacket(a);
      }
    };
    P.onRequestExpel = function (a, b) {
      if (q.hasParty && q.isPartyLeader) {
        var c = new u.CZ.REQ_EXPEL_GROUP_MEMBER();
        c.AID = a;
        c.characterName = b;
        v.sendPacket(c);
      }
    };
    P.onRequestInfoUpdate = function (a, b, c) {
      if (q.hasParty && q.isPartyLeader) {
        var d = new u.CZ.GROUPINFO_CHANGE_V2();
        d.expOption = a;
        d.ItemPickupRule = b;
        d.ItemDivisionRule = c;
        v.sendPacket(d);
      }
    };
    P.onRequestChangeLeader = function (a) {
      if (q.hasParty && q.isPartyLeader) {
        var b = new u.CZ.CHANGE_GROUP_MASTER();
        b.AID = a;
        v.sendPacket(b);
      }
    };
    return P;
  },
);
