define(
  "Engine/MapEngine/Guild",
  "require DB/DBManager Utils/Inflate Utils/Texture Utils/BinaryWriter Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/EntityManager UI/Components/ChatBox/ChatBox UI/Components/MiniMap/MiniMap UI/Components/Guild/Guild UI/UIManager".split(
    " ",
  ),
  function (a) {
    function b(a) {
      R.setSkills(a.skillList);
      R.setSkillsPoints(a.skillPoint);
    }
    function c(a) {
      N.addText(a.msg, N.TYPE.GUILD);
    }
    function d(a) {
      0 > a.xPos || 0 > a.yPos
        ? S.removeGuildMemberMark(a.AID)
        : S.addGuildMemberMark(a.AID, a.xPos, a.yPos);
    }
    function e(a) {
      R.setGuildInformations(a);
    }
    function m(a) {
      U.guild_id = a.GDID;
      R.changeGuildInfo(a);
    }
    function h(a) {
      R.setAccess(a.guildMemuFlag);
    }
    function r(a) {
      U.guild_id = a.GDID;
      G.hasGuild = !0;
      G.guildRight = a.right;
      G.isGuildMaster = !!a.isMaster;
      G.Entity.GUID = a.GDID;
      G.Entity.GEmblemVer = a.emblemVersion;
    }
    function q(a) {
      R.setRelations(a.relatedGuildList);
    }
    function k(a) {
      R.setMembers(a.memberInfo);
    }
    function g(a) {
      var b = !1;
      a instanceof K.ZC.POSITION_INFO
        ? ((a = a.memberInfo), (b = !0))
        : (a = a.memberList);
      R.setPositions(a, b);
    }
    function t(a) {
      R.setPositionsName(a.memberList);
    }
    function l(a) {
      R.setMember(a.Info);
    }
    function f(a) {
      R.updateMemberPosition(a.AID, a.GID, a.positionID);
    }
    function n(a) {
      N.addText("[ " + a.subject + " ]", N.TYPE.GUILD, "#FFFF63");
      N.addText("[ " + a.notice + " ]", N.TYPE.GUILD, "#FFFF63");
      R.setNotice(a.subject, a.notice);
    }
    function p(a) {
      R.setExpelList(a.banList);
    }
    function v(a) {
      switch (a.result) {
        case 0:
          G.hasGuild = !0;
          N.addText(x.getMessage(374), N.TYPE.BLUE);
          R.show();
          break;
        case 1:
          N.addText(x.getMessage(375), N.TYPE.ERROR);
          break;
        case 2:
          N.addText(x.getMessage(376), N.TYPE.ERROR);
          break;
        case 3:
          N.addText(x.getMessage(405), N.TYPE.ERROR);
      }
    }
    function u(a) {
      switch (a.reason) {
        case 0:
          R.hide();
          G.hasGuild = !1;
          N.addText(x.getMessage(400), N.TYPE.BLUE);
          break;
        case 1:
          N.addText(x.getMessage(401), N.TYPE.ERROR);
          break;
        case 2:
          N.addText(x.getMessage(402), N.TYPE.ERROR);
      }
    }
    function A(a) {
      function b(a) {
        return function () {
          var b = new K.CZ.JOIN_GUILD();
          b.GDID = c;
          b.answer = a;
          H.sendPacket(b);
        };
      }
      var c = a.GDID;
      ea.showPromptBox(
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
          N.addText(x.getMessage(378), N.TYPE.ERROR);
          break;
        case 1:
          N.addText(x.getMessage(379), N.TYPE.ERROR);
          break;
        case 2:
          N.addText(x.getMessage(380), N.TYPE.BLUE);
          break;
        case 3:
          N.addText(x.getMessage(381), N.TYPE.ERROR);
      }
    }
    function B(a) {
      R.updateMemberStatus(a);
    }
    function O(a) {
      if (G.GID == a.charID || a.charName === G.Entity.display.name)
        (R.hide(),
          (G.hasGuild = !1),
          (G.isGuildMaster = !1),
          (G.guildRight = 0),
          (G.Entity.GUID = 0));
    }
    function C(a) {
      if (G.GID == a.charID || a.charName === G.Entity.display.name)
        (R.hide(),
          (G.hasGuild = !1),
          (G.isGuildMaster = !1),
          (G.guildRight = 0),
          (G.Entity.GUID = 0));
    }
    function y(a) {
      R.removeRelation(a.OpponentGDID, a.Relation);
    }
    function z(a) {
      R.addRelation(a.Info);
    }
    function J(a) {
      function b(a) {
        return function () {
          var b = new K.CZ.ALLY_GUILD();
          b.otherAID = c;
          b.answer = a;
          H.sendPacket(b);
        };
      }
      var c = a.otherAID;
      ea.showPromptBox(
        "(" + a.guildName + ") " + x.getMessage(393),
        "ok",
        "cancel",
        b(1),
        b(0),
      );
    }
    function I(a) {
      switch (a.answer) {
        case 0:
          N.addText(x.getMessage(394), N.TYPE.ERROR);
          break;
        case 1:
          N.addText(x.getMessage(395), N.TYPE.ERROR);
          break;
        case 2:
          N.addText(x.getMessage(396), N.TYPE.BLUE);
          break;
        case 3:
          N.addText(x.getMessage(397), N.TYPE.ERROR);
          break;
        case 4:
          N.addText(x.getMessage(398), N.TYPE.ERROR);
          break;
        case 5:
          N.addText(x.getMessage(1717), N.TYPE.ERROR);
      }
    }
    function L(a) {
      switch (a.result) {
        case 0:
          N.addText(x.getMessage(495), N.TYPE.BLUE);
          break;
        case 1:
          N.addText(x.getMessage(496), N.TYPE.ERROR);
          break;
        case 2:
          N.addText(x.getMessage(497), N.TYPE.ERROR);
          break;
        case 3:
          N.addText(x.getMessage(1718), N.TYPE.ERROR);
      }
    }
    var x = a("DB/DBManager"),
      M = a("Utils/Inflate"),
      E = a("Utils/Texture"),
      F = a("Utils/BinaryWriter"),
      G = a("Engine/SessionStorage"),
      H = a("Network/NetworkManager"),
      K = a("Network/PacketStructure"),
      P = a("Renderer/EntityManager"),
      N = a("UI/Components/ChatBox/ChatBox"),
      S = a("UI/Components/MiniMap/MiniMap"),
      R = a("UI/Components/Guild/Guild"),
      ea = a("UI/UIManager"),
      U = {},
      V = {};
    U.init = function () {
      H.hookPacket(K.ZC.GUILD_SKILLINFO, b);
      H.hookPacket(K.ZC.GUILD_CHAT, c);
      H.hookPacket(K.ZC.NOTIFY_POSITION_TO_GUILDM, d);
      H.hookPacket(K.ZC.GUILD_INFO, e);
      H.hookPacket(K.ZC.GUILD_INFO2, e);
      H.hookPacket(K.ZC.GUILD_INFO3, e);
      H.hookPacket(K.ZC.GUILD_INFO4, e);
      H.hookPacket(K.ZC.CHANGE_GUILD2, m);
      H.hookPacket(K.ZC.MYGUILD_BASIC_INFO, q);
      H.hookPacket(K.ZC.GUILD_EMBLEM_IMG, ca);
      H.hookPacket(K.ZC.MEMBERMGR_INFO, k);
      H.hookPacket(K.ZC.MEMBERMGR_INFO2, k);
      H.hookPacket(K.ZC.PKT_MC_GUILDMEMBERLIST2, k);
      H.hookPacket(K.ZC.ACK_GUILD_MEMBER_INFO, l);
      H.hookPacket(K.ZC.POSITION_INFO, g);
      H.hookPacket(K.ZC.POSITION_ID_NAME_INFO, t);
      H.hookPacket(K.ZC.ACK_CHANGE_GUILD_POSITIONINFO, g);
      H.hookPacket(K.ZC.GUILD_NOTICE, n);
      H.hookPacket(K.ZC.ACK_REQ_CHANGE_MEMBERS, f);
      H.hookPacket(K.ZC.ACK_GUILD_MENUINTERFACE, h);
      H.hookPacket(K.ZC.RESULT_MAKE_GUILD, v);
      H.hookPacket(K.ZC.UPDATE_GDID, r);
      H.hookPacket(K.ZC.BAN_LIST, p);
      H.hookPacket(K.ZC.ACK_DISORGANIZE_GUILD_RESULT, u);
      H.hookPacket(K.ZC.REQ_JOIN_GUILD, A);
      H.hookPacket(K.ZC.ACK_REQ_JOIN_GUILD, D);
      H.hookPacket(K.ZC.UPDATE_CHARSTAT, B);
      H.hookPacket(K.ZC.UPDATE_CHARSTAT2, B);
      H.hookPacket(K.ZC.ACK_BAN_GUILD, O);
      H.hookPacket(K.ZC.ACK_BAN_GUILD_SSO, O);
      H.hookPacket(K.ZC.ACK_BAN_GUILD_SSO2, O);
      H.hookPacket(K.ZC.ACK_LEAVE_GUILD, C);
      H.hookPacket(K.ZC.ACK_LEAVE_GUILD2, C);
      H.hookPacket(K.ZC.DELETE_RELATED_GUILD, y);
      H.hookPacket(K.ZC.ADD_RELATED_GUILD, z);
      H.hookPacket(K.ZC.REQ_ALLY_GUILD, J);
      H.hookPacket(K.ZC.ACK_REQ_ALLY_GUILD, I);
      H.hookPacket(K.ZC.ACK_REQ_HOSTILE_GUILD, L);
      R.onGuildInfoRequest = U.requestInfo;
      R.onPositionUpdateRequest = U.requestPositionUpdate;
      R.onNoticeUpdateRequest = U.requestNoticeUpdate;
      R.onRequestLeave = U.requestLeave;
      R.onRequestMemberExpel = U.requestMemberExpel;
      R.onRequestMemberInfo = U.requestMemberInfo;
      R.onRequestDeleteRelation = U.requestDeleteRelatedGuild;
      R.onRequestAccess = U.requestAccess;
      R.onRequestGuildEmblem = U.requestGuildEmblem;
      R.onSendEmblem = U.sendEmblem;
    };
    U.requestInfo = function (a) {
      if (!(4 < a)) {
        var b = new K.CZ.REQ_GUILD_MENU();
        b.Type = a;
        H.sendPacket(b);
      }
    };
    U.requestGuildEmblem = function (a, b, c) {
      var d;
      V[a] || (V[a] = { version: -1, image: new Image(), callback: [] });
      d = V[a];
      b <= d.version
        ? c(d.image)
        : ((b = new K.CZ.REQ_GUILD_EMBLEM_IMG()),
          (b.GDID = a),
          H.sendPacket(b),
          d.callback.push(c));
    };
    U.requestAccess = function () {
      H.sendPacket(new K.CZ.REQ_GUILD_MENUINTERFACE());
    };
    U.createGuild = function (a) {
      var b = new K.CZ.REQ_MAKE_GUILD();
      b.GID = G.GID;
      b.GName = a;
      H.sendPacket(b);
    };
    U.breakGuild = function (a) {
      var b = new K.CZ.REQ_DISORGANIZE_GUILD();
      b.key = a;
      H.sendPacket(b);
    };
    U.requestPositionUpdate = function (a) {
      var b = new K.CZ.REG_CHANGE_GUILD_POSITIONINFO();
      b.memberList = a;
      H.sendPacket(b);
    };
    U.requestNoticeUpdate = function (a, b) {
      var c = new K.CZ.GUILD_NOTICE();
      c.GDID = U.guild_id;
      c.subject = a;
      c.notice = b;
      H.sendPacket(c);
    };
    U.requestPlayerInvitation = function (a) {
      var b = new K.CZ.REQ_JOIN_GUILD();
      b.AID = a;
      b.MyAID = G.AID;
      b.MyGID = G.GID;
      H.sendPacket(b);
    };
    U.requestAlliance = function (a) {
      var b = new K.CZ.REQ_ALLY_GUILD();
      b.AID = a;
      b.MyAID = G.AID;
      b.MyGID = G.GID;
      H.sendPacket(b);
    };
    U.requestHostility = function (a) {
      var b = new K.CZ.REQ_HOSTILE_GUILD();
      b.AID = a;
      H.sendPacket(b);
    };
    U.requestLeave = function (a, b, c) {
      var d = new K.CZ.REQ_LEAVE_GUILD();
      d.GDID = U.guild_id;
      d.AID = a;
      d.GID = b;
      d.reasonDesc = c;
      H.sendPacket(d);
    };
    U.requestMemberExpel = function (a, b, c) {
      var d = new K.CZ.REQ_BAN_GUILD();
      d.GDID = U.guild_id;
      d.AID = a;
      d.GID = b;
      d.reasonDesc = c;
      H.sendPacket(d);
    };
    U.requestMemberInfo = function (a) {
      var b = new K.CZ.REQ_OPEN_MEMBER_INFO();
      b.AID = a;
      H.sendPacket(b);
    };
    U.requestDeleteRelatedGuild = function (a, b) {
      var c = new K.CZ.REQ_DELETE_RELATED_GUILD();
      c.OpponentGDID = a;
      c.Relation = b;
      H.sendPacket(c);
    };
    U.sendEmblem = (function () {
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
        b = new K.CZ.REGISTER_GUILD_EMBLEM_IMG();
        b.img = d.buffer;
        H.sendPacket(b);
      };
    })();
    U.guild_id = -1;
    var ca = (function () {
      var a = new Uint8Array(2048);
      return function (b) {
        var c, d, e;
        V[b.GDID] ||
          (V[b.GDID] = { version: -1, image: new Image(), callback: [] });
        d = new M(b.img).getBytes(a);
        d = URL.createObjectURL(
          new Blob([a.subarray(0, d).buffer], { type: "image/bmp" }),
        );
        c = V[b.GDID];
        e = new Image();
        e.onload = function () {
          c.image = this;
          for (b.GDID === U.guild_id && R.setEmblem(this); c.callback.length;)
            c.callback.shift().call(null, this);
          P.forEach(function (a) {
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
    return U;
  },
);
