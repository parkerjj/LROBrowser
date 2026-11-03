define(
  "Engine/MapEngine/Guild",
  "require DB/DBManager Utils/Inflate Utils/Texture Utils/BinaryWriter Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/EntityManager UI/Components/ChatBox/ChatBox UI/Components/MiniMap/MiniMap UI/Components/Guild/Guild UI/UIManager".split(
    " ",
  ),
  function (a) {
    function b(a) {
      W.setSkills(a.skillList);
      W.setSkillsPoints(a.skillPoint);
    }
    function c(a) {
      Q.addText(a.msg, Q.TYPE.GUILD);
    }
    function d(a) {
      0 > a.xPos || 0 > a.yPos
        ? V.removeGuildMemberMark(a.AID)
        : V.addGuildMemberMark(a.AID, a.xPos, a.yPos);
    }
    function e(a) {
      W.setGuildInformations(a);
    }
    function m(a) {
      S.guild_id = a.GDID;
      W.changeGuildInfo(a);
    }
    function h(a) {
      W.setAccess(a.guildMemuFlag);
    }
    function t(a) {
      S.guild_id = a.GDID;
      z.hasGuild = !0;
      z.guildRight = a.right;
      z.isGuildMaster = !!a.isMaster;
      z.Entity.GUID = a.GDID;
      z.Entity.GEmblemVer = a.emblemVersion;
    }
    function r(a) {
      W.setRelations(a.relatedGuildList);
    }
    function n(a) {
      W.setMembers(a.memberInfo);
    }
    function g(a) {
      var b = !1;
      a instanceof L.ZC.POSITION_INFO
        ? ((a = a.memberInfo), (b = !0))
        : (a = a.memberList);
      W.setPositions(a, b);
    }
    function p(a) {
      W.setPositionsName(a.memberList);
    }
    function l(a) {
      W.setMember(a.Info);
    }
    function f(a) {
      W.updateMemberPosition(a.AID, a.GID, a.positionID);
    }
    function k(a) {
      Q.addText("[ " + a.subject + " ]", Q.TYPE.GUILD, "#FFFF63");
      Q.addText("[ " + a.notice + " ]", Q.TYPE.GUILD, "#FFFF63");
      W.setNotice(a.subject, a.notice);
    }
    function q(a) {
      W.setExpelList(a.banList);
    }
    function u(a) {
      switch (a.result) {
        case 0:
          z.hasGuild = !0;
          Q.addText(x.getMessage(374), Q.TYPE.BLUE);
          W.show();
          break;
        case 1:
          Q.addText(x.getMessage(375), Q.TYPE.ERROR);
          break;
        case 2:
          Q.addText(x.getMessage(376), Q.TYPE.ERROR);
          break;
        case 3:
          Q.addText(x.getMessage(405), Q.TYPE.ERROR);
      }
    }
    function v(a) {
      switch (a.reason) {
        case 0:
          W.hide();
          z.hasGuild = !1;
          Q.addText(x.getMessage(400), Q.TYPE.BLUE);
          break;
        case 1:
          Q.addText(x.getMessage(401), Q.TYPE.ERROR);
          break;
        case 2:
          Q.addText(x.getMessage(402), Q.TYPE.ERROR);
      }
    }
    function A(a) {
      function b(a) {
        return function () {
          var b = new L.CZ.JOIN_GUILD();
          b.GDID = c;
          b.answer = a;
          G.sendPacket(b);
        };
      }
      var c = a.GDID;
      ba.showPromptBox(
        "(" + a.guildName + ") " + x.getMessage(377),
        "ok",
        "cancel",
        b(1),
        b(0),
      );
    }
    function C(a) {
      switch (a.answer) {
        case 0:
          Q.addText(x.getMessage(378), Q.TYPE.ERROR);
          break;
        case 1:
          Q.addText(x.getMessage(379), Q.TYPE.ERROR);
          break;
        case 2:
          Q.addText(x.getMessage(380), Q.TYPE.BLUE);
          break;
        case 3:
          Q.addText(x.getMessage(381), Q.TYPE.ERROR);
      }
    }
    function B(a) {
      W.updateMemberStatus(a);
    }
    function J(a) {
      if (z.GID == a.charID || a.charName === z.Entity.display.name)
        (W.hide(),
          (z.hasGuild = !1),
          (z.isGuildMaster = !1),
          (z.guildRight = 0),
          (z.Entity.GUID = 0));
    }
    function D(a) {
      if (z.GID == a.charID || a.charName === z.Entity.display.name)
        (W.hide(),
          (z.hasGuild = !1),
          (z.isGuildMaster = !1),
          (z.guildRight = 0),
          (z.Entity.GUID = 0));
    }
    function y(a) {
      W.removeRelation(a.OpponentGDID, a.Relation);
    }
    function H(a) {
      W.addRelation(a.Info);
    }
    function N(a) {
      function b(a) {
        return function () {
          var b = new L.CZ.ALLY_GUILD();
          b.otherAID = c;
          b.answer = a;
          G.sendPacket(b);
        };
      }
      var c = a.otherAID;
      ba.showPromptBox(
        "(" + a.guildName + ") " + x.getMessage(393),
        "ok",
        "cancel",
        b(1),
        b(0),
      );
    }
    function O(a) {
      switch (a.answer) {
        case 0:
          Q.addText(x.getMessage(394), Q.TYPE.ERROR);
          break;
        case 1:
          Q.addText(x.getMessage(395), Q.TYPE.ERROR);
          break;
        case 2:
          Q.addText(x.getMessage(396), Q.TYPE.BLUE);
          break;
        case 3:
          Q.addText(x.getMessage(397), Q.TYPE.ERROR);
          break;
        case 4:
          Q.addText(x.getMessage(398), Q.TYPE.ERROR);
          break;
        case 5:
          Q.addText(x.getMessage(1717), Q.TYPE.ERROR);
      }
    }
    function I(a) {
      switch (a.result) {
        case 0:
          Q.addText(x.getMessage(495), Q.TYPE.BLUE);
          break;
        case 1:
          Q.addText(x.getMessage(496), Q.TYPE.ERROR);
          break;
        case 2:
          Q.addText(x.getMessage(497), Q.TYPE.ERROR);
          break;
        case 3:
          Q.addText(x.getMessage(1718), Q.TYPE.ERROR);
      }
    }
    var x = a("DB/DBManager"),
      K = a("Utils/Inflate"),
      E = a("Utils/Texture"),
      F = a("Utils/BinaryWriter"),
      z = a("Engine/SessionStorage"),
      G = a("Network/NetworkManager"),
      L = a("Network/PacketStructure"),
      M = a("Renderer/EntityManager"),
      Q = a("UI/Components/ChatBox/ChatBox"),
      V = a("UI/Components/MiniMap/MiniMap"),
      W = a("UI/Components/Guild/Guild"),
      ba = a("UI/UIManager"),
      S = {},
      T = {};
    S.init = function () {
      G.hookPacket(L.ZC.GUILD_SKILLINFO, b);
      G.hookPacket(L.ZC.GUILD_CHAT, c);
      G.hookPacket(L.ZC.NOTIFY_POSITION_TO_GUILDM, d);
      G.hookPacket(L.ZC.GUILD_INFO, e);
      G.hookPacket(L.ZC.GUILD_INFO2, e);
      G.hookPacket(L.ZC.GUILD_INFO3, e);
      G.hookPacket(L.ZC.GUILD_INFO4, e);
      G.hookPacket(L.ZC.CHANGE_GUILD2, m);
      G.hookPacket(L.ZC.MYGUILD_BASIC_INFO, r);
      G.hookPacket(L.ZC.GUILD_EMBLEM_IMG, da);
      G.hookPacket(L.ZC.MEMBERMGR_INFO, n);
      G.hookPacket(L.ZC.MEMBERMGR_INFO2, n);
      G.hookPacket(L.ZC.PKT_MC_GUILDMEMBERLIST2, n);
      G.hookPacket(L.ZC.ACK_GUILD_MEMBER_INFO, l);
      G.hookPacket(L.ZC.POSITION_INFO, g);
      G.hookPacket(L.ZC.POSITION_ID_NAME_INFO, p);
      G.hookPacket(L.ZC.ACK_CHANGE_GUILD_POSITIONINFO, g);
      G.hookPacket(L.ZC.GUILD_NOTICE, k);
      G.hookPacket(L.ZC.ACK_REQ_CHANGE_MEMBERS, f);
      G.hookPacket(L.ZC.ACK_GUILD_MENUINTERFACE, h);
      G.hookPacket(L.ZC.RESULT_MAKE_GUILD, u);
      G.hookPacket(L.ZC.UPDATE_GDID, t);
      G.hookPacket(L.ZC.BAN_LIST, q);
      G.hookPacket(L.ZC.ACK_DISORGANIZE_GUILD_RESULT, v);
      G.hookPacket(L.ZC.REQ_JOIN_GUILD, A);
      G.hookPacket(L.ZC.ACK_REQ_JOIN_GUILD, C);
      G.hookPacket(L.ZC.UPDATE_CHARSTAT, B);
      G.hookPacket(L.ZC.UPDATE_CHARSTAT2, B);
      G.hookPacket(L.ZC.ACK_BAN_GUILD, J);
      G.hookPacket(L.ZC.ACK_BAN_GUILD_SSO, J);
      G.hookPacket(L.ZC.ACK_BAN_GUILD_SSO2, J);
      G.hookPacket(L.ZC.ACK_LEAVE_GUILD, D);
      G.hookPacket(L.ZC.ACK_LEAVE_GUILD2, D);
      G.hookPacket(L.ZC.DELETE_RELATED_GUILD, y);
      G.hookPacket(L.ZC.ADD_RELATED_GUILD, H);
      G.hookPacket(L.ZC.REQ_ALLY_GUILD, N);
      G.hookPacket(L.ZC.ACK_REQ_ALLY_GUILD, O);
      G.hookPacket(L.ZC.ACK_REQ_HOSTILE_GUILD, I);
      W.onGuildInfoRequest = S.requestInfo;
      W.onPositionUpdateRequest = S.requestPositionUpdate;
      W.onNoticeUpdateRequest = S.requestNoticeUpdate;
      W.onRequestLeave = S.requestLeave;
      W.onRequestMemberExpel = S.requestMemberExpel;
      W.onRequestMemberInfo = S.requestMemberInfo;
      W.onRequestDeleteRelation = S.requestDeleteRelatedGuild;
      W.onRequestAccess = S.requestAccess;
      W.onRequestGuildEmblem = S.requestGuildEmblem;
      W.onSendEmblem = S.sendEmblem;
    };
    S.requestInfo = function (a) {
      if (!(4 < a)) {
        var b = new L.CZ.REQ_GUILD_MENU();
        b.Type = a;
        G.sendPacket(b);
      }
    };
    S.requestGuildEmblem = function (a, b, c) {
      var d;
      T[a] || (T[a] = { version: -1, image: new Image(), callback: [] });
      d = T[a];
      b <= d.version
        ? c(d.image)
        : ((b = new L.CZ.REQ_GUILD_EMBLEM_IMG()),
          (b.GDID = a),
          G.sendPacket(b),
          d.callback.push(c));
    };
    S.requestAccess = function () {
      G.sendPacket(new L.CZ.REQ_GUILD_MENUINTERFACE());
    };
    S.createGuild = function (a) {
      var b = new L.CZ.REQ_MAKE_GUILD();
      b.GID = z.GID;
      b.GName = a;
      G.sendPacket(b);
    };
    S.breakGuild = function (a) {
      var b = new L.CZ.REQ_DISORGANIZE_GUILD();
      b.key = a;
      G.sendPacket(b);
    };
    S.requestPositionUpdate = function (a) {
      var b = new L.CZ.REG_CHANGE_GUILD_POSITIONINFO();
      b.memberList = a;
      G.sendPacket(b);
    };
    S.requestNoticeUpdate = function (a, b) {
      var c = new L.CZ.GUILD_NOTICE();
      c.GDID = S.guild_id;
      c.subject = a;
      c.notice = b;
      G.sendPacket(c);
    };
    S.requestPlayerInvitation = function (a) {
      var b = new L.CZ.REQ_JOIN_GUILD();
      b.AID = a;
      b.MyAID = z.AID;
      b.MyGID = z.GID;
      G.sendPacket(b);
    };
    S.requestAlliance = function (a) {
      var b = new L.CZ.REQ_ALLY_GUILD();
      b.AID = a;
      b.MyAID = z.AID;
      b.MyGID = z.GID;
      G.sendPacket(b);
    };
    S.requestHostility = function (a) {
      var b = new L.CZ.REQ_HOSTILE_GUILD();
      b.AID = a;
      G.sendPacket(b);
    };
    S.requestLeave = function (a, b, c) {
      var d = new L.CZ.REQ_LEAVE_GUILD();
      d.GDID = S.guild_id;
      d.AID = a;
      d.GID = b;
      d.reasonDesc = c;
      G.sendPacket(d);
    };
    S.requestMemberExpel = function (a, b, c) {
      var d = new L.CZ.REQ_BAN_GUILD();
      d.GDID = S.guild_id;
      d.AID = a;
      d.GID = b;
      d.reasonDesc = c;
      G.sendPacket(d);
    };
    S.requestMemberInfo = function (a) {
      var b = new L.CZ.REQ_OPEN_MEMBER_INFO();
      b.AID = a;
      G.sendPacket(b);
    };
    S.requestDeleteRelatedGuild = function (a, b) {
      var c = new L.CZ.REQ_DELETE_RELATED_GUILD();
      c.OpponentGDID = a;
      c.Relation = b;
      G.sendPacket(c);
    };
    S.sendEmblem = (function () {
      function a(a) {
        for (var b = 0, c = a.length, d = 1, e = 0; b < c; b++)
          ((d = (d + a[b]) % 65521), (e = (e + d) % 65521));
        return (e << 16) + d;
      }
      return function (b) {
        var c = b.length,
          d = new F(7 + c + 4);
        d.writeUChar(120);
        d.writeUChar(1);
        d.writeUChar(1);
        d.writeUShort(c);
        d.writeUShort(~c & 65535);
        d.writeBuffer(b.buffer);
        d.view.setInt32(d.offset, a(b), !1);
        b = new L.CZ.REGISTER_GUILD_EMBLEM_IMG();
        b.img = d.buffer;
        G.sendPacket(b);
      };
    })();
    S.guild_id = -1;
    var da = (function () {
      var a = new Uint8Array(2048);
      return function (b) {
        var c, d, e;
        T[b.GDID] ||
          (T[b.GDID] = { version: -1, image: new Image(), callback: [] });
        d = new K(b.img).getBytes(a);
        d = URL.createObjectURL(
          new Blob([a.subarray(0, d).buffer], { type: "image/bmp" }),
        );
        c = T[b.GDID];
        e = new Image();
        e.onload = function () {
          c.image = this;
          for (b.GDID === S.guild_id && W.setEmblem(this); c.callback.length;)
            c.callback.shift().call(null, this);
          M.forEach(function (a) {
            a.GUID === b.GDID &&
              ((a.display.emblem = e),
              a.display.update(
                a.objecttype === a.constructor.TYPE_MOB
                  ? "#ffc6c6"
                  : a.objecttype === a.constructor.TYPE_NPC
                    ? "#94bdf7"
                    : "white",
              ));
          });
        };
        c.version = b.emblemVersion;
        E.load(d, function () {
          e.src = this.toDataURL();
        });
      };
    })();
    return S;
  },
);
