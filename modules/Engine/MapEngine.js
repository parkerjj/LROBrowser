define(
  "Engine/MapEngine",
  "require Utils/jquery DB/DBManager DB/Status/StatusState DB/Effects/EffectConst Audio/SoundManager Audio/BGM Core/Events Core/Configs Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/Renderer Renderer/Camera Renderer/MapRenderer Renderer/EntityManager Renderer/Entity/Entity Renderer/EffectManager Renderer/Map/Altitude Renderer/CartObject Renderer/FalconObject Renderer/WolfObject Controls/MapControl Controls/MouseEventHandler Controls/KeyEventHandler Controls/BattleMode Preferences/Controls Preferences/ShortCutControls UI/UIManager UI/Background UI/Components/Escape/Escape UI/Components/ChatBox/ChatBox UI/Components/MiniMap/MiniMap UI/Components/BasicInfo/BasicInfo UI/Components/WinStats/WinStats UI/Components/Inventory/Inventory UI/Components/Mail/Mail UI/Components/Mail/Rodex UI/Components/Mail/RodexSend UI/Components/Shop/CashShop UI/Components/OnPushCart/OnPushCart UI/Components/ShortCut/ShortCut UI/Components/Equipment/Equipment UI/Components/StatusIcons/StatusIcons UI/Components/ChatRoomCreate/ChatRoomCreate UI/Components/Emoticons/Emoticons UI/Components/RankFont/RankFont UI/Components/SkillList/SkillList UI/Components/PartyFriends/PartyFriends UI/Components/Quest/Quest UI/Components/Achievement/Achievement UI/Components/PartyBooking/PartyBooking UI/Components/PartyBookingReg/PartyBookingReg UI/Components/Guild/Guild UI/Components/NpcBox/NpcBox UI/Components/NpcMenu/NpcMenu UI/Components/Announce/Announce UI/Components/InputBox/InputBox UI/Components/vbk/vbk UI/Components/Intro/Particle UI/Components/ItemObtain/ItemObtain UI/Components/Attendance/Attendance UI/Components/CardConnection/CardConnection2 UI/Components/miniQuest/miniQuest UI/Components/WorldMap/WorldMap ./MapEngine/Main ./MapEngine/NPC ./MapEngine/Entity ./MapEngine/Item ./MapEngine/PrivateMessage ./MapEngine/Group ./MapEngine/Guild ./MapEngine/Skill ./MapEngine/ChatRoom ./MapEngine/Quest ./MapEngine/Pet ./MapEngine/Mercenary ./MapEngine/Homunc ./MapEngine/Store ./MapEngine/Mail ./MapEngine/Trade ./MapEngine/Friends ./MapEngine/Achievement Engine/GameEngine Engine/GameEngine Engine/CharEngine".split(
    " ",
  ),
  function (a) {
    function b(a) {
      U.startTime = a.time;
    }
    function c(a) {
      U.pvpon = 0 < a.type ? !0 : !1;
      U.pvpon
        ? (va.append(), (ba.noshift = !0))
        : (va.remove(), (ba.noshift = !1));
    }
    function d(a) {
      va.updateCount(a);
    }
    function e(a) {
      U.Character.GID = a.AID;
    }
    function m(a) {
      U.Entity = new ka(U.Character);
      U.Entity.onWalkEnd = J;
      "sex" in a && 2 > a.sex && (U.Entity.sex = a.sex);
      rolename = U.Character.name;
      U.petId = 0;
      U.hasParty = !1;
      U.isPartyLeader = !1;
      U.hasGuild = !1;
      U.guildRight = 0;
      U.startTime = a.startTime;
      ma.update("blvl", U.Character.level);
      ma.update("jlvl", U.Character.joblevel);
      ma.update("zeny", U.Character.money);
      ma.update("name", U.Character.name);
      ma.update("job", U.Character.job);
      h({ xPos: a.PosDir[0], yPos: a.PosDir[1], mapName: mb });
    }
    function h(a) {
      G(window).off("keydown.map");
      G("#header").hide();
      ia.empty();
      Pa.remove();
      Oa.remove();
      Ya.remove();
      Za.remove();
      na.remove();
      xa.remove();
      Ea.reReady = 1;
      U.hasAttackTarget = null;
      U.Entity.cart && la.remove(U.Entity.GID);
      U.Entity.falcon && ha.remove(U.Entity.GID);
      U.Entity.wolf && X.remove(U.Entity.GID);
      da.onLoad = function () {
        G(window).on("keydown.map", function (a) {
          var b;
          if (
            (b =
              a.which ===
              (Q.situp.Custom_settings
                ? Q.situp.Custom_settings
                : Q.situp.init))
          )
            b =
              (Q.situp.Custom_settings ? Q.situp.Custom_alt : Q.situp.alt) ==
              pa.ALT;
          b &&
            (b =
              (Q.situp.Custom_settings ? Q.situp.Custom_ctrl : Q.situp.ctrl) ==
              pa.CTRL);
          b &&
            (b =
              (Q.situp.Custom_settings
                ? Q.situp.Custom_shift
                : Q.situp.shift) == pa.SHIFT);
          if (b)
            return (
              (b = new ca.CZ.REQUEST_ACT()),
              (b.action = U.Entity.action === U.Entity.ACTION.SIT ? 3 : 2),
              V.sendPacket(b),
              a.stopImmediatePropagation(),
              !1
            );
        });
        G("html").addClass("gray");
        ba.autoattack = !1;
        ba.autofollow = !1;
        ba.autopick = !1;
        ba.autoeat = !1;
        ba.onlyattack = 0;
        ba.talk = !1;
        ba.writemail = !1;
        U.pvpon = !1;
        ba.noshift = !1;
        U.Entity.set({ PosDir: [a.xPos, a.yPos, 0], GID: U.Character.GID });
        ta.add(U.Entity);
        if (
          !(
            U.Entity.effectState &
            (K.EffectState.INVISIBLE |
              K.EffectState.HIDE |
              K.EffectState.CLOAK |
              K.EffectState.CHASEWALK)
          )
        ) {
          var b = { ownerAID: U.Entity.GID, position: U.Entity.position };
          b.effectId = P.EF_ENTRY2;
          oa.spam(b);
          if (99 == U.Character.level || 200 == U.Character.level)
            ((b = {
              effectId: P.EF_LEVEL99_3,
              ownerAID: U.Entity.GID,
              position: U.Entity.position,
            }),
              oa.spam(b));
          U.Entity.falcon && ha.add(U.Entity);
          U.Entity.wolf && X.add(U.Entity);
          U.Entity.effectState & K.EffectState.RUWACH &&
            oa.spam(33, 1, U.Entity.GID);
          U.Entity.effectState & K.EffectState.SIGHT &&
            oa.spam(22, 1, U.Entity.GID);
        }
        fa.setTarget(U.Entity);
        fa.init();
        w.init();
        sa.append();
        sa.setMap(da.currentMap);
        aa.append();
        ma.append();
        W.append();
        ia.append();
        Ba.append();
        ja.append();
        wa.append();
        ya.append();
        Aa.append();
        za.append();
        Ja.append();
        Ha.append();
        Ca.append();
        Ga.append();
        Fa.append();
        cb.append();
        Ka.append();
        Da.append();
        Ea.append();
        na.append();
        ua.append();
        lb.append();
        sb.append();
        Ma.append();
        V.sendPacket(new ca.CZ.NOTIFY_ACTORINIT());
        3 == ea.get("ClientVer") &&
          0 == Ea.ready &&
          V.sendPacket(new ca.CZ.NOTIFY_LOADINFO());
        Ea.reReady = 0;
        Wa.ready = 1;
        Ea.noMapsame &&
          ((Ea.noMapsame = 0), Wa.setMapname(H.getMapName(da.currentMap)));
      };
      da.currentMap !== a.mapName && (Ea.noMapsame = 1);
      da.setMap(a.mapName);
    }
    function r(a) {
      G(window).off("keydown.map");
      ab.init(a.addr.ip, a.addr.port, a.mapName);
    }
    function q() {
      var b = new ca.CZ.REQUEST_QUIT();
      V.sendPacket(b);
      Y.removeComponents();
      V.close();
      T.stop();
      da.free();
      N.stop();
      S.stop();
      ra.remove(function () {
        window.close();
        a("Engine/GameEngine").init();
      });
    }
    function k(a) {
      aa.addText(H.getMessage(502), aa.TYPE.ERROR);
    }
    function g() {
      Y.removeComponents();
      V.close();
      T.stop();
      da.free();
      N.stop();
      S.stop();
      ra.remove(function () {
        window.close();
        a("Engine/GameEngine").init();
      });
    }
    function t() {
      for (var a in ia.list)
        if (7621 == ia.list[a].ITID) {
          W.ui.find(".resurection").show();
          return;
        }
      W.ui.find(".resurection").hide();
    }
    function l() {
      if (1 == ba.writemail) aa.addText("\u5199\u4fe1\u4e2d", aa.TYPE.ERROR);
      else if (sessionStorage.getItem("offline"))
        aa.addText("\u79bb\u7ebf\u72b6\u6001\u4e2d", aa.TYPE.ERROR);
      else {
        var a = new ca.CZ.WHISPER();
        a.receiver = "NPC:backhome";
        a.msg = "0";
        V.sendPacket(a);
      }
    }
    function f() {
      if (1 == ba.writemail) aa.addText("\u5199\u4fe1\u4e2d", aa.TYPE.ERROR);
      else if (sessionStorage.getItem("offline"))
        aa.addText("\u5df2\u5f00\u542f\u79bb\u7ebf\u72b6\u6001", aa.TYPE.ERROR);
      else {
        var a = new ca.CZ.WHISPER();
        a.receiver = "NPC:setoffline";
        a.msg = "0";
        V.sendPacket(a);
        W.ui.hide();
      }
    }
    function n() {
      if (1 == ba.writemail) aa.addText("\u5199\u4fe1\u4e2d", aa.TYPE.ERROR);
      else if (sessionStorage.getItem("offline"))
        aa.addText("\u79bb\u7ebf\u72b6\u6001\u4e2d", aa.TYPE.ERROR);
      else {
        var a = new ca.CZ.RESTART();
        a.type = 1;
        V.sendPacket(a);
      }
    }
    function p() {
      var a = new ca.CZ.RESTART();
      a.type = 0;
      V.sendPacket(a);
    }
    function v() {
      if (1 != ba.writemail) {
        var a = new ca.CZ.STANDING_RESURRECTION();
        V.sendPacket(a);
      }
    }
    function u(b) {
      b.type
        ? ((b = document.getElementById("blind")) &&
            document.body.removeChild(b),
          (U.Character = null),
          (U.moveAction = null),
          Ka.clean(),
          Wa.clean(),
          Fa.clean(),
          Ha.clean(),
          ya.clean(),
          aa.clean(),
          Aa.clean(),
          Ba.clean(),
          Ca.clean(),
          da.free(),
          T.stop(),
          sa.clearWalk(),
          Da.clearWalk(),
          Fa.clearWalk(),
          a("Engine/CharEngine").reload())
        : aa.addText(H.getMessage(502), aa.TYPE.ERROR);
    }
    function A(a) {
      switch (a.result) {
        case 0:
          U.moveAction = null;
          Fa.clean();
          ya.clean();
          aa.clean();
          Aa.clean();
          Ba.clean();
          Ca.clean();
          T.stop();
          sa.clearWalk();
          Da.clearWalk();
          Fa.clearWalk();
          g();
          break;
        case 1:
          aa.addText(H.getMessage(502), aa.TYPE.ERROR);
      }
    }
    function D(a, b, c) {
      var d = "%" === b[0] || pa.CTRL,
        e = "$" === b[0] || pa.ALT;
      b = b.replace(/^(\$|\%)/, "");
      a.length
        ? ((c = new ca.CZ.WHISPER()), (c.receiver = a), (c.msg = b))
        : (d && (c = (c & ~aa.TYPE.PARTY) | (~c & aa.TYPE.PARTY)),
          e && (c = (c & ~aa.TYPE.GUILD) | (~c & aa.TYPE.GUILD)),
          c & aa.TYPE.WORLD
            ? ((c = new ca.CZ.WHISPER()), (c.receiver = "#global"), (c.msg = b))
            : ((c =
                c & aa.TYPE.PARTY
                  ? new ca.CZ.REQUEST_CHAT_PARTY()
                  : c & aa.TYPE.GUILD
                    ? new ca.CZ.GUILD_CHAT()
                    : new ca.CZ.REQUEST_CHAT()),
              (c.msg = U.Entity.display.name + " : " + b)));
      V.sendPacket(c);
    }
    function B() {
      var a = new ca.CZ.REQ_CARTOFF();
      V.sendPacket(a);
    }
    function O() {
      R.clearTimeout(Ua);
      if (U.Entity.action === U.Entity.ACTION.SIT) {
        U.Entity.lookTo(qa.world.x, qa.world.y);
        var a = new ca.CZ.CHANGE_DIRECTION();
        a.headDir = U.Entity.headDir;
        a.dir = U.Entity.direction;
        V.sendPacket(a);
      } else y();
    }
    function C() {
      sa.clearWalk();
      R.clearTimeout(Ua);
    }
    function y() {
      if (!(gb + 450 > T.tick || U.Entity.canmove > T.tick)) {
        var a =
          Math.round(U.Entity.position[0]) === qa.world.x &&
          Math.round(U.Entity.position[1]) === qa.world.y;
        if (-1 < qa.world.x && -1 < qa.world.y && !a) {
          var a = new ca.CZ.REQUEST_MOVE(),
            b;
          a: {
            b = qa.world.x;
            var c = qa.world.y,
              d = a.dest,
              e,
              f,
              g,
              h = U.Entity.position[0] < b ? -1 : 1,
              k = U.Entity.position[1] < c ? -1 : 1;
            for (g = 0; 1 >= g; ++g)
              for (e = -g; e <= g; ++e)
                for (f = -g; f <= g; ++f)
                  if (z(b + e * h, c + f * k)) {
                    d[0] = b + e * h;
                    d[1] = c + f * k;
                    b = !0;
                    break a;
                  }
            b = !1;
          }
          b || ((a.dest[0] = qa.world.x), (a.dest[1] = qa.world.y));
          V.sendPacket(a);
        }
        R.clearTimeout(Ua);
        Ua = R.setTimeout(y, 500);
        gb = +T.tick;
      }
    }
    function z(a, b) {
      if (!(ga.getCellType(a, b) & ga.TYPE.WALKABLE)) return !1;
      var c = !0;
      ta.forEach(function (d) {
        return Math.round(d.position[0]) === a &&
          Math.round(d.position[1]) === b
          ? (c = !1)
          : !0;
      });
      return c;
    }
    function J() {
      U.moveAction &&
        R.setTimeout(function () {
          U.moveAction &&
            (V.sendPacket(U.moveAction),
            null == ta.getFocusEntity() &&
              V.sendPacket(new ca.CZ.CANCEL_LOCKON()),
            (U.moveAction = null));
        }, 50);
    }
    function I(a, b) {
      var c = new ca.CZ.STATUS_CHANGE();
      c.statusID = a;
      c.changeAmount = b;
      V.sendPacket(c);
    }
    function L(a, b) {
      if (b) {
        var c = new ca.CZ.ITEM_THROW();
        c.Index = a;
        c.count = b;
        V.sendPacket(c);
      }
    }
    function x(a) {
      var b = new ca.CZ.USE_ITEM();
      b.index = a;
      b.AID = U.Entity.GID;
      V.sendPacket(b);
    }
    function M(a, b) {
      var c = new ca.CZ.REQ_WEAR_EQUIP();
      c.index = a;
      c.wearLocation = b;
      V.sendPacket(c);
    }
    function E(a) {
      var b = new ca.CZ.REQ_TAKEOFF_EQUIP();
      b.index = a;
      V.sendPacket(b);
    }
    function F(a, b) {
      var c = new ca.CZ.CONFIG();
      c.Config = a;
      c.Value = b;
      V.sendPacket(c);
    }
    var G = a("Utils/jquery"),
      H = a("DB/DBManager"),
      K = a("DB/Status/StatusState"),
      P = a("DB/Effects/EffectConst"),
      N = a("Audio/SoundManager"),
      S = a("Audio/BGM"),
      R = a("Core/Events"),
      ea = a("Core/Configs"),
      U = a("Engine/SessionStorage"),
      V = a("Network/NetworkManager"),
      ca = a("Network/PacketStructure"),
      T = a("Renderer/Renderer"),
      fa = a("Renderer/Camera"),
      da = a("Renderer/MapRenderer"),
      ta = a("Renderer/EntityManager"),
      ka = a("Renderer/Entity/Entity"),
      oa = a("Renderer/EffectManager"),
      ga = a("Renderer/Map/Altitude"),
      la = a("Renderer/CartObject"),
      ha = a("Renderer/FalconObject"),
      X = a("Renderer/WolfObject"),
      Z = a("Controls/MapControl"),
      qa = a("Controls/MouseEventHandler"),
      pa = a("Controls/KeyEventHandler"),
      w = a("Controls/BattleMode"),
      ba = a("Preferences/Controls"),
      Q = a("Preferences/ShortCutControls"),
      Y = a("UI/UIManager"),
      ra = a("UI/Background"),
      W = a("UI/Components/Escape/Escape"),
      aa = a("UI/Components/ChatBox/ChatBox"),
      sa = a("UI/Components/MiniMap/MiniMap"),
      ma = a("UI/Components/BasicInfo/BasicInfo"),
      ja = a("UI/Components/WinStats/WinStats"),
      ia = a("UI/Components/Inventory/Inventory");
    a("UI/Components/Mail/Mail");
    var na = a("UI/Components/Mail/Rodex"),
      xa = a("UI/Components/Mail/RodexSend"),
      ua = a("UI/Components/Shop/CashShop"),
      Ba = a("UI/Components/OnPushCart/OnPushCart"),
      Aa = a("UI/Components/ShortCut/ShortCut"),
      wa = a("UI/Components/Equipment/Equipment"),
      ya = a("UI/Components/StatusIcons/StatusIcons"),
      za = a("UI/Components/ChatRoomCreate/ChatRoomCreate"),
      Ja = a("UI/Components/Emoticons/Emoticons"),
      va = a("UI/Components/RankFont/RankFont"),
      Ha = a("UI/Components/SkillList/SkillList"),
      Ca = a("UI/Components/PartyFriends/PartyFriends"),
      Fa = a("UI/Components/Quest/Quest"),
      Ka = a("UI/Components/Achievement/Achievement"),
      Ma = a("UI/Components/PartyBooking/PartyBooking"),
      La = a("UI/Components/PartyBookingReg/PartyBookingReg"),
      Ga = a("UI/Components/Guild/Guild"),
      Da = a("UI/Components/WorldMap/WorldMap"),
      Oa = a("UI/Components/NpcBox/NpcBox"),
      Ya = a("UI/Components/NpcMenu/NpcMenu"),
      Pa = a("UI/Components/Announce/Announce"),
      Za = a("UI/Components/InputBox/InputBox"),
      Ea = a("UI/Components/vbk/vbk"),
      $a = a("UI/Components/Intro/Particle"),
      Wa = a("UI/Components/ItemObtain/ItemObtain"),
      lb = a("UI/Components/Attendance/Attendance"),
      sb = a("UI/Components/CardConnection/CardConnection2"),
      cb = a("UI/Components/miniQuest/miniQuest"),
      mb = "",
      fb = !1,
      ab = {
        init: function (R, w, y) {
          $a.stop();
          mb = y;
          V.connect(
            V.utils.longToIP(R),
            w,
            function (a) {
              da.currentMap = "";
              if (a) {
                U.Port = w;
                aid = U.AID;
                gid = U.GID;
                a = new ca.CZ.ENTER();
                a.AID = U.AID;
                a.GID = U.GID;
                a.AuthCode = U.AuthCode;
                a.clientTime = Date.now();
                a.Sex = U.Sex;
                V.sendPacket(a);
                V.read(function (a) {
                  4 === a.length && (U.Character.GID = a.readLong());
                });
                var b = new ca.CZ.REQUEST_TIME(),
                  c = Date.now();
                V.setPing(function () {
                  b.clientTime = Date.now() - c;
                  V.sendPacket(b);
                });
              } else Y.showErrorBox(H.getMessage(1));
            },
            !0,
          );
          fb ||
            ((fb = !0),
            Z.init(),
            (Z.onRequestWalk = O),
            (Z.onRequestStopWalk = C),
            (Z.onRequestDropItem = L),
            V.hookPacket(ca.ZC.AID, e),
            V.hookPacket(ca.ZC.ACCEPT_ENTER, m),
            V.hookPacket(ca.ZC.ACCEPT_ENTER2, m),
            V.hookPacket(ca.ZC.ACCEPT_ENTER3, m),
            V.hookPacket(ca.ZC.NPCACK_MAPMOVE, h),
            V.hookPacket(ca.ZC.NPCACK_SERVERMOVE, r),
            V.hookPacket(ca.ZC.ACCEPT_QUIT, g),
            V.hookPacket(ca.ZC.REFUSE_QUIT, k),
            V.hookPacket(ca.ZC.RESTART_ACK, u),
            V.hookPacket(ca.ZC.ACK_REQ_DISCONNECT, A),
            V.hookPacket(ca.ZC.NOTIFY_TIME, b),
            V.hookPacket(ca.ZC.NOTIFY_MAPPROPERTY2, c),
            V.hookPacket(ca.ZC.NOTIFY_RANKING, d),
            a("./MapEngine/Main").call(),
            a("./MapEngine/NPC").call(),
            a("./MapEngine/Entity").call(),
            a("./MapEngine/Item").call(),
            a("./MapEngine/PrivateMessage").call(),
            a("./MapEngine/Group").init(),
            a("./MapEngine/Guild").init(),
            a("./MapEngine/Skill").call(),
            a("./MapEngine/ChatRoom").call(),
            a("./MapEngine/Quest").call(),
            a("./MapEngine/Mail").call(),
            a("./MapEngine/Pet").call(),
            a("./MapEngine/Mercenary").call(),
            a("./MapEngine/Homunc").call(),
            a("./MapEngine/Store").call(),
            a("./MapEngine/Trade").call(),
            a("./MapEngine/Friends").init(),
            a("./MapEngine/Achievement").call(),
            sa.prepare(),
            W.prepare(),
            ia.prepare(),
            Ba.prepare(),
            ja.prepare(),
            wa.prepare(),
            Aa.prepare(),
            za.prepare(),
            Ja.prepare(),
            va.prepare(),
            Ha.prepare(),
            Ca.prepare(),
            ya.prepare(),
            ma.prepare(),
            aa.prepare(),
            Ga.prepare(),
            Da.prepare(),
            Fa.prepare(),
            cb.prepare(),
            Ea.prepare(),
            Wa.prepare(),
            Ma.prepare(),
            La.prepare(),
            (ja.onRequestUpdate = I),
            (wa.onUnEquip = E),
            (wa.onConfigUpdate = F),
            (wa.onEquipItem = M),
            (wa.onRemoveOption = B),
            (ia.onUseItem = x),
            (ia.onEquipItem = M),
            (W.onExitRequest = q),
            (W.onCharSelectionRequest = n),
            (W.onReturnSavePointRequest = p),
            (W.onResurectionRequest = v),
            (W.onBackhomeRequest = l),
            (W.onSetofflineRequest = f),
            (W.onCheakResurection = t),
            (aa.onRequestTalk = D));
        },
      },
      Ua = null,
      gb = 0;
    return ab;
  },
);
