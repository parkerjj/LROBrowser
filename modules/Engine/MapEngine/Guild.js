define(
  "Engine/MapEngine/Guild",
  "require DB/DBManager Utils/Inflate Utils/Texture Utils/BinaryWriter Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/EntityManager UI/Components/ChatBox/ChatBox UI/Components/MiniMap/MiniMap UI/Components/Guild/Guild UI/UIManager".split(
    " ",
  ),
  function (a) {
    function b(a) {
      V.setSkills(a.skillList);
      V.setSkillsPoints(a.skillPoint);
    }
    function c(a) {
      Q.addText(a.msg, Q.TYPE.GUILD);
    }
    function d(a) {
      0 > a.xPos || 0 > a.yPos
        ? W.removeGuildMemberMark(a.AID)
        : W.addGuildMemberMark(a.AID, a.xPos, a.yPos);
    }
    function e(a) {
      V.setGuildInformations(a);
    }
    function l(a) {
      S.guild_id = a.GDID;
      V.changeGuildInfo(a);
    }
    function h(a) {
      V.setAccess(a.guildMemuFlag);
    }
    function r(a) {
      S.guild_id = a.GDID;
      y.hasGuild = !0;
      y.guildRight = a.right;
      y.isGuildMaster = !!a.isMaster;
      y.Entity.GUID = a.GDID;
      y.Entity.GEmblemVer = a.emblemVersion;
    }
    function t(a) {
      V.setRelations(a.relatedGuildList);
    }
    function n(a) {
      V.setMembers(a.memberInfo);
    }
    function g(a) {
      var b = !1;
      a instanceof K.ZC.POSITION_INFO
        ? ((a = a.memberInfo), (b = !0))
        : (a = a.memberList);
      V.setPositions(a, b);
    }
    function p(a) {
      V.setPositionsName(a.memberList);
    }
    function k(a) {
      V.setMember(a.Info);
    }
    function f(a) {
      V.updateMemberPosition(a.AID, a.GID, a.positionID);
    }
    function m(a) {
      Q.addText("[ " + a.subject + " ]", Q.TYPE.GUILD, "#FFFF63");
      Q.addText("[ " + a.notice + " ]", Q.TYPE.GUILD, "#FFFF63");
      V.setNotice(a.subject, a.notice);
    }
    function q(a) {
      V.setExpelList(a.banList);
    }
    function v(a) {
      switch (a.result) {
        case 0:
          y.hasGuild = !0;
          Q.addText(x.getMessage(374), Q.TYPE.BLUE);
          V.show();
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
    function u(a) {
      switch (a.reason) {
        case 0:
          V.hide();
          y.hasGuild = !1;
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
          var b = new K.CZ.JOIN_GUILD();
          b.GDID = c;
          b.answer = a;
          F.sendPacket(b);
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
    function D(a) {
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
      V.updateMemberStatus(a);
    }
    function H(a) {
      if (y.GID == a.charID || a.charName === y.Entity.display.name)
        (V.hide(),
          (y.hasGuild = !1),
          (y.isGuildMaster = !1),
          (y.guildRight = 0),
          (y.Entity.GUID = 0));
    }
    function C(a) {
      if (y.GID == a.charID || a.charName === y.Entity.display.name)
        (V.hide(),
          (y.hasGuild = !1),
          (y.isGuildMaster = !1),
          (y.guildRight = 0),
          (y.Entity.GUID = 0));
    }
    function z(a) {
      V.removeRelation(a.OpponentGDID, a.Relation);
    }
    function G(a) {
      V.addRelation(a.Info);
    }
    function P(a) {
      function b(a) {
        return function () {
          var b = new K.CZ.ALLY_GUILD();
          b.otherAID = c;
          b.answer = a;
          F.sendPacket(b);
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
    function N(a) {
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
      J = a("Utils/Inflate"),
      E = a("Utils/Texture"),
      L = a("Utils/BinaryWriter"),
      y = a("Engine/SessionStorage"),
      F = a("Network/NetworkManager"),
      K = a("Network/PacketStructure"),
      M = a("Renderer/EntityManager"),
      Q = a("UI/Components/ChatBox/ChatBox"),
      W = a("UI/Components/MiniMap/MiniMap"),
      V = a("UI/Components/Guild/Guild"),
      ba = a("UI/UIManager"),
      S = {},
      T = {};
    S.init = function () {
      F.hookPacket(K.ZC.GUILD_SKILLINFO, b);
      F.hookPacket(K.ZC.GUILD_CHAT, c);
      F.hookPacket(K.ZC.NOTIFY_POSITION_TO_GUILDM, d);
      F.hookPacket(K.ZC.GUILD_INFO, e);
      F.hookPacket(K.ZC.GUILD_INFO2, e);
      F.hookPacket(K.ZC.GUILD_INFO3, e);
      F.hookPacket(K.ZC.GUILD_INFO4, e);
      F.hookPacket(K.ZC.CHANGE_GUILD2, l);
      F.hookPacket(K.ZC.MYGUILD_BASIC_INFO, t);
      F.hookPacket(K.ZC.GUILD_EMBLEM_IMG, da);
      F.hookPacket(K.ZC.MEMBERMGR_INFO, n);
      F.hookPacket(K.ZC.MEMBERMGR_INFO2, n);
      F.hookPacket(K.ZC.PKT_MC_GUILDMEMBERLIST2, n);
      F.hookPacket(K.ZC.ACK_GUILD_MEMBER_INFO, k);
      F.hookPacket(K.ZC.POSITION_INFO, g);
      F.hookPacket(K.ZC.POSITION_ID_NAME_INFO, p);
      F.hookPacket(K.ZC.ACK_CHANGE_GUILD_POSITIONINFO, g);
      F.hookPacket(K.ZC.GUILD_NOTICE, m);
      F.hookPacket(K.ZC.ACK_REQ_CHANGE_MEMBERS, f);
      F.hookPacket(K.ZC.ACK_GUILD_MENUINTERFACE, h);
      F.hookPacket(K.ZC.RESULT_MAKE_GUILD, v);
      F.hookPacket(K.ZC.UPDATE_GDID, r);
      F.hookPacket(K.ZC.BAN_LIST, q);
      F.hookPacket(K.ZC.ACK_DISORGANIZE_GUILD_RESULT, u);
      F.hookPacket(K.ZC.REQ_JOIN_GUILD, A);
      F.hookPacket(K.ZC.ACK_REQ_JOIN_GUILD, D);
      F.hookPacket(K.ZC.UPDATE_CHARSTAT, B);
      F.hookPacket(K.ZC.UPDATE_CHARSTAT2, B);
      F.hookPacket(K.ZC.ACK_BAN_GUILD, H);
      F.hookPacket(K.ZC.ACK_BAN_GUILD_SSO, H);
      F.hookPacket(K.ZC.ACK_BAN_GUILD_SSO2, H);
      F.hookPacket(K.ZC.ACK_LEAVE_GUILD, C);
      F.hookPacket(K.ZC.ACK_LEAVE_GUILD2, C);
      F.hookPacket(K.ZC.DELETE_RELATED_GUILD, z);
      F.hookPacket(K.ZC.ADD_RELATED_GUILD, G);
      F.hookPacket(K.ZC.REQ_ALLY_GUILD, P);
      F.hookPacket(K.ZC.ACK_REQ_ALLY_GUILD, N);
      F.hookPacket(K.ZC.ACK_REQ_HOSTILE_GUILD, I);
      V.onGuildInfoRequest = S.requestInfo;
      V.onPositionUpdateRequest = S.requestPositionUpdate;
      V.onNoticeUpdateRequest = S.requestNoticeUpdate;
      V.onRequestLeave = S.requestLeave;
      V.onRequestMemberExpel = S.requestMemberExpel;
      V.onRequestMemberInfo = S.requestMemberInfo;
      V.onRequestDeleteRelation = S.requestDeleteRelatedGuild;
      V.onRequestAccess = S.requestAccess;
      V.onRequestGuildEmblem = S.requestGuildEmblem;
      V.onSendEmblem = S.sendEmblem;
    };
    S.requestInfo = function (a) {
      if (!(4 < a)) {
        var b = new K.CZ.REQ_GUILD_MENU();
        b.Type = a;
        F.sendPacket(b);
      }
    };
    S.requestGuildEmblem = function (a, b, c) {
      var d;
      T[a] || (T[a] = { version: -1, image: new Image(), callback: [] });
      d = T[a];
      b <= d.version
        ? c(d.image)
        : ((b = new K.CZ.REQ_GUILD_EMBLEM_IMG()),
          (b.GDID = a),
          F.sendPacket(b),
          d.callback.push(c));
    };
    S.requestAccess = function () {
      F.sendPacket(new K.CZ.REQ_GUILD_MENUINTERFACE());
    };
    S.createGuild = function (a) {
      var b = new K.CZ.REQ_MAKE_GUILD();
      b.GID = y.GID;
      b.GName = a;
      F.sendPacket(b);
    };
    S.breakGuild = function (a) {
      var b = new K.CZ.REQ_DISORGANIZE_GUILD();
      b.key = a;
      F.sendPacket(b);
    };
    S.requestPositionUpdate = function (a) {
      var b = new K.CZ.REG_CHANGE_GUILD_POSITIONINFO();
      b.memberList = a;
      F.sendPacket(b);
    };
    S.requestNoticeUpdate = function (a, b) {
      var c = new K.CZ.GUILD_NOTICE();
      c.GDID = S.guild_id;
      c.subject = a;
      c.notice = b;
      F.sendPacket(c);
    };
    S.requestPlayerInvitation = function (a) {
      var b = new K.CZ.REQ_JOIN_GUILD();
      b.AID = a;
      b.MyAID = y.AID;
      b.MyGID = y.GID;
      F.sendPacket(b);
    };
    S.requestAlliance = function (a) {
      var b = new K.CZ.REQ_ALLY_GUILD();
      b.AID = a;
      b.MyAID = y.AID;
      b.MyGID = y.GID;
      F.sendPacket(b);
    };
    S.requestHostility = function (a) {
      var b = new K.CZ.REQ_HOSTILE_GUILD();
      b.AID = a;
      F.sendPacket(b);
    };
    S.requestLeave = function (a, b, c) {
      var d = new K.CZ.REQ_LEAVE_GUILD();
      d.GDID = S.guild_id;
      d.AID = a;
      d.GID = b;
      d.reasonDesc = c;
      F.sendPacket(d);
    };
    S.requestMemberExpel = function (a, b, c) {
      var d = new K.CZ.REQ_BAN_GUILD();
      d.GDID = S.guild_id;
      d.AID = a;
      d.GID = b;
      d.reasonDesc = c;
      F.sendPacket(d);
    };
    S.requestMemberInfo = function (a) {
      var b = new K.CZ.REQ_OPEN_MEMBER_INFO();
      b.AID = a;
      F.sendPacket(b);
    };
    S.requestDeleteRelatedGuild = function (a, b) {
      var c = new K.CZ.REQ_DELETE_RELATED_GUILD();
      c.OpponentGDID = a;
      c.Relation = b;
      F.sendPacket(c);
    };
    S.sendEmblem = (function () {
      function a(a) {
        for (var b = 0, c = a.length, d = 1, e = 0; b < c; b++)
          ((d = (d + a[b]) % 65521), (e = (e + d) % 65521));
        return (e << 16) + d;
      }
      return function (b) {
        var c = b.length,
          d = new L(7 + c + 4);
        d.writeUChar(120);
        d.writeUChar(1);
        d.writeUChar(1);
        d.writeUShort(c);
        d.writeUShort(~c & 65535);
        d.writeBuffer(b.buffer);
        d.view.setInt32(d.offset, a(b), !1);
        b = new K.CZ.REGISTER_GUILD_EMBLEM_IMG();
        b.img = d.buffer;
        F.sendPacket(b);
      };
    })();
    S.guild_id = -1;
    var da = (function () {
      var a = new Uint8Array(2048);
      return function (b) {
        var c, d, e;
        T[b.GDID] ||
          (T[b.GDID] = { version: -1, image: new Image(), callback: [] });
        d = new J(b.img).getBytes(a);
        d = URL.createObjectURL(
          new Blob([a.subarray(0, d).buffer], { type: "image/bmp" }),
        );
        c = T[b.GDID];
        e = new Image();
        e.onload = function () {
          c.image = this;
          for (b.GDID === S.guild_id && V.setEmblem(this); c.callback.length;)
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
