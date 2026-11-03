define(
  "Engine/MapEngine",
  "require Utils/jquery DB/DBManager DB/Status/StatusState DB/Effects/EffectConst Audio/SoundManager Audio/BGM Core/Events Core/Configs Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/Renderer Renderer/Camera Renderer/MapRenderer Renderer/EntityManager Renderer/Entity/Entity Renderer/EffectManager Renderer/Map/Altitude Renderer/CartObject Renderer/FalconObject Renderer/WolfObject Controls/MapControl Controls/MouseEventHandler Controls/KeyEventHandler Controls/BattleMode Preferences/Controls Preferences/ShortCutControls UI/UIManager UI/Background UI/Components/Escape/Escape UI/Components/ChatBox/ChatBox UI/Components/MiniMap/MiniMap UI/Components/BasicInfo/BasicInfo UI/Components/WinStats/WinStats UI/Components/Inventory/Inventory UI/Components/Mail/Mail UI/Components/Mail/Rodex UI/Components/Mail/RodexSend UI/Components/Shop/CashShop UI/Components/OnPushCart/OnPushCart UI/Components/ShortCut/ShortCut UI/Components/Equipment/Equipment UI/Components/StatusIcons/StatusIcons UI/Components/ChatRoomCreate/ChatRoomCreate UI/Components/Emoticons/Emoticons UI/Components/RankFont/RankFont UI/Components/SkillList/SkillList UI/Components/PartyFriends/PartyFriends UI/Components/Quest/Quest UI/Components/Achievement/Achievement UI/Components/PartyBooking/PartyBooking UI/Components/PartyBookingReg/PartyBookingReg UI/Components/Guild/Guild UI/Components/NpcBox/NpcBox UI/Components/NpcMenu/NpcMenu UI/Components/Announce/Announce UI/Components/InputBox/InputBox UI/Components/vbk/vbk UI/Components/Intro/Particle UI/Components/ItemObtain/ItemObtain UI/Components/Attendance/Attendance UI/Components/CardConnection/CardConnection2 UI/Components/miniQuest/miniQuest UI/Components/WorldMap/WorldMap ./MapEngine/Main ./MapEngine/NPC ./MapEngine/Entity ./MapEngine/Item ./MapEngine/PrivateMessage ./MapEngine/Group ./MapEngine/Guild ./MapEngine/Skill ./MapEngine/ChatRoom ./MapEngine/Quest ./MapEngine/Pet ./MapEngine/Mercenary ./MapEngine/Homunc ./MapEngine/Store ./MapEngine/Mail ./MapEngine/Trade ./MapEngine/Friends ./MapEngine/Achievement Engine/GameEngine Engine/GameEngine Engine/CharEngine".split(
    " ",
  ),
  function (a) {
    function b(a) {
      S.startTime = a.time;
    }
    function c(a) {
      S.pvpon = 0 < a.type ? !0 : !1;
      S.pvpon
        ? (va.append(), (ca.noshift = !0))
        : (va.remove(), (ca.noshift = !1));
    }
    function d(a) {
      va.updateCount(a);
    }
    function e(a) {
      S.Character.GID = a.AID;
    }
    function l(a) {
      S.Entity = new oa(S.Character);
      S.Entity.onWalkEnd = P;
      "sex" in a && 2 > a.sex && (S.Entity.sex = a.sex);
      rolename = S.Character.name;
      S.petId = 0;
      S.hasParty = !1;
      S.isPartyLeader = !1;
      S.hasGuild = !1;
      S.guildRight = 0;
      S.startTime = a.startTime;
      ma.update("blvl", S.Character.level);
      ma.update("jlvl", S.Character.joblevel);
      ma.update("zeny", S.Character.money);
      ma.update("name", S.Character.name);
      ma.update("job", S.Character.job);
      h({ xPos: a.PosDir[0], yPos: a.PosDir[1], mapName: mb });
    }
    function h(a) {
      y(window).off("keydown.map");
      y("#header").hide();
      ia.empty();
      Na.remove();
      Ya.remove();
      Za.remove();
      $a.remove();
      na.remove();
      wa.remove();
      Ga.reReady = 1;
      S.hasAttackTarget = null;
      S.Entity.cart && ka.remove(S.Entity.GID);
      S.Entity.falcon && ha.remove(S.Entity.GID);
      S.Entity.wolf && X.remove(S.Entity.GID);
      ea.onLoad = function () {
        y(window).on("keydown.map", function (a) {
          var b;
          if (
            (b =
              a.which ===
              (O.situp.Custom_settings
                ? O.situp.Custom_settings
                : O.situp.init))
          )
            b =
              (O.situp.Custom_settings ? O.situp.Custom_alt : O.situp.alt) ==
              pa.ALT;
          b &&
            (b =
              (O.situp.Custom_settings ? O.situp.Custom_ctrl : O.situp.ctrl) ==
              pa.CTRL);
          b &&
            (b =
              (O.situp.Custom_settings
                ? O.situp.Custom_shift
                : O.situp.shift) == pa.SHIFT);
          if (b)
            return (
              (b = new da.CZ.REQUEST_ACT()),
              (b.action = S.Entity.action === S.Entity.ACTION.SIT ? 3 : 2),
              T.sendPacket(b),
              a.stopImmediatePropagation(),
              !1
            );
        });
        y("html").addClass("gray");
        ca.autoattack = !1;
        ca.autofollow = !1;
        ca.autopick = !1;
        ca.autoeat = !1;
        ca.onlyattack = 0;
        ca.talk = !1;
        ca.writemail = !1;
        S.pvpon = !1;
        ca.noshift = !1;
        S.Entity.set({ PosDir: [a.xPos, a.yPos, 0], GID: S.Character.GID });
        ta.add(S.Entity);
        if (
          !(
            S.Entity.effectState &
            (K.EffectState.INVISIBLE |
              K.EffectState.HIDE |
              K.EffectState.CLOAK |
              K.EffectState.CHASEWALK)
          )
        ) {
          var b = { ownerAID: S.Entity.GID, position: S.Entity.position };
          b.effectId = M.EF_ENTRY2;
          la.spam(b);
          if (99 == S.Character.level || 200 == S.Character.level)
            ((b = {
              effectId: M.EF_LEVEL99_3,
              ownerAID: S.Entity.GID,
              position: S.Entity.position,
            }),
              la.spam(b));
          S.Entity.falcon && ha.add(S.Entity);
          S.Entity.wolf && X.add(S.Entity);
          S.Entity.effectState & K.EffectState.RUWACH &&
            la.spam(33, 1, S.Entity.GID);
          S.Entity.effectState & K.EffectState.SIGHT &&
            la.spam(22, 1, S.Entity.GID);
        }
        fa.setTarget(S.Entity);
        fa.init();
        w.init();
        sa.append();
        sa.setMap(ea.currentMap);
        aa.append();
        ma.append();
        U.append();
        ia.append();
        Ba.append();
        ja.append();
        xa.append();
        ya.append();
        Aa.append();
        za.append();
        Ka.append();
        Ia.append();
        Ca.append();
        Ea.append();
        Da.append();
        bb.append();
        La.append();
        Fa.append();
        Ga.append();
        na.append();
        ua.append();
        lb.append();
        sb.append();
        Ma.append();
        T.sendPacket(new da.CZ.NOTIFY_ACTORINIT());
        3 == ba.get("ClientVer") &&
          0 == Ga.ready &&
          T.sendPacket(new da.CZ.NOTIFY_LOADINFO());
        Ga.reReady = 0;
        Wa.ready = 1;
        Ga.noMapsame &&
          ((Ga.noMapsame = 0), Wa.setMapname(F.getMapName(ea.currentMap)));
      };
      ea.currentMap !== a.mapName && (Ga.noMapsame = 1);
      ea.setMap(a.mapName);
    }
    function r(a) {
      y(window).off("keydown.map");
      Oa.init(a.addr.ip, a.addr.port, a.mapName);
    }
    function t() {
      var b = new da.CZ.REQUEST_QUIT();
      T.sendPacket(b);
      Y.removeComponents();
      T.close();
      R.stop();
      ea.free();
      Q.stop();
      W.stop();
      ra.remove(function () {
        window.close();
        a("Engine/GameEngine").init();
      });
    }
    function n(a) {
      aa.addText(F.getMessage(502), aa.TYPE.ERROR);
    }
    function g() {
      Y.removeComponents();
      T.close();
      R.stop();
      ea.free();
      Q.stop();
      W.stop();
      ra.remove(function () {
        window.close();
        a("Engine/GameEngine").init();
      });
    }
    function p() {
      for (var a in ia.list)
        if (7621 == ia.list[a].ITID) {
          U.ui.find(".resurection").show();
          return;
        }
      U.ui.find(".resurection").hide();
    }
    function k() {
      if (1 == ca.writemail) aa.addText("\u5199\u4fe1\u4e2d", aa.TYPE.ERROR);
      else if (sessionStorage.getItem("offline"))
        aa.addText("\u79bb\u7ebf\u72b6\u6001\u4e2d", aa.TYPE.ERROR);
      else {
        var a = new da.CZ.WHISPER();
        a.receiver = "NPC:backhome";
        a.msg = "0";
        T.sendPacket(a);
      }
    }
    function f() {
      if (1 == ca.writemail) aa.addText("\u5199\u4fe1\u4e2d", aa.TYPE.ERROR);
      else if (sessionStorage.getItem("offline"))
        aa.addText("\u5df2\u5f00\u542f\u79bb\u7ebf\u72b6\u6001", aa.TYPE.ERROR);
      else {
        var a = new da.CZ.WHISPER();
        a.receiver = "NPC:setoffline";
        a.msg = "0";
        T.sendPacket(a);
        U.ui.hide();
      }
    }
    function m() {
      if (1 == ca.writemail) aa.addText("\u5199\u4fe1\u4e2d", aa.TYPE.ERROR);
      else if (sessionStorage.getItem("offline"))
        aa.addText("\u79bb\u7ebf\u72b6\u6001\u4e2d", aa.TYPE.ERROR);
      else {
        var a = new da.CZ.RESTART();
        a.type = 1;
        T.sendPacket(a);
      }
    }
    function q() {
      var a = new da.CZ.RESTART();
      a.type = 0;
      T.sendPacket(a);
    }
    function v() {
      if (1 != ca.writemail) {
        var a = new da.CZ.STANDING_RESURRECTION();
        T.sendPacket(a);
      }
    }
    function u(b) {
      b.type
        ? ((b = document.getElementById("blind")) &&
            document.body.removeChild(b),
          (S.Character = null),
          (S.moveAction = null),
          S.Entity.cart && (ka.remove(S.Entity.GID), (S.Entity.cart = !1)),
          S.Entity.falcon && (ha.remove(S.Entity.GID), (S.Entity.falcon = !1)),
          S.Entity.wolf && (X.remove(S.Entity.GID), (S.Entity.wolf = !1)),
          La.clean(),
          Wa.clean(),
          Da.clean(),
          Ia.clean(),
          ya.clean(),
          aa.clean(),
          Aa.clean(),
          Ba.clean(),
          Ca.clean(),
          ea.free(),
          R.stop(),
          sa.clearWalk(),
          Fa.clearWalk(),
          Da.clearWalk(),
          a("Engine/CharEngine").reload())
        : aa.addText(F.getMessage(502), aa.TYPE.ERROR);
    }
    function A(a) {
      switch (a.result) {
        case 0:
          S.moveAction = null;
          Da.clean();
          ya.clean();
          aa.clean();
          Aa.clean();
          Ba.clean();
          Ca.clean();
          R.stop();
          sa.clearWalk();
          Fa.clearWalk();
          Da.clearWalk();
          g();
          break;
        case 1:
          aa.addText(F.getMessage(502), aa.TYPE.ERROR);
      }
    }
    function D(a, b, c) {
      var d = "%" === b[0] || pa.CTRL,
        e = "$" === b[0] || pa.ALT;
      b = b.replace(/^(\$|\%)/, "");
      a.length
        ? ((c = new da.CZ.WHISPER()), (c.receiver = a), (c.msg = b))
        : (d && (c = (c & ~aa.TYPE.PARTY) | (~c & aa.TYPE.PARTY)),
          e && (c = (c & ~aa.TYPE.GUILD) | (~c & aa.TYPE.GUILD)),
          c & aa.TYPE.WORLD
            ? ((c = new da.CZ.WHISPER()), (c.receiver = "#global"), (c.msg = b))
            : ((c =
                c & aa.TYPE.PARTY
                  ? new da.CZ.REQUEST_CHAT_PARTY()
                  : c & aa.TYPE.GUILD
                    ? new da.CZ.GUILD_CHAT()
                    : new da.CZ.REQUEST_CHAT()),
              (c.msg = S.Entity.display.name + " : " + b)));
      T.sendPacket(c);
    }
    function B() {
      var a = new da.CZ.REQ_CARTOFF();
      T.sendPacket(a);
    }
    function H() {
      V.clearTimeout(Ua);
      if (S.Entity.action === S.Entity.ACTION.SIT) {
        S.Entity.lookTo(qa.world.x, qa.world.y);
        var a = new da.CZ.CHANGE_DIRECTION();
        a.headDir = S.Entity.headDir;
        a.dir = S.Entity.direction;
        T.sendPacket(a);
      } else z();
    }
    function C() {
      sa.clearWalk();
      V.clearTimeout(Ua);
    }
    function z() {
      if (!(fb + 450 > R.tick || S.Entity.canmove > R.tick)) {
        var a =
          Math.round(S.Entity.position[0]) === qa.world.x &&
          Math.round(S.Entity.position[1]) === qa.world.y;
        if (-1 < qa.world.x && -1 < qa.world.y && !a) {
          var a = new da.CZ.REQUEST_MOVE(),
            b;
          a: {
            b = qa.world.x;
            var c = qa.world.y,
              d = a.dest,
              e,
              f,
              g,
              h = S.Entity.position[0] < b ? -1 : 1,
              k = S.Entity.position[1] < c ? -1 : 1;
            for (g = 0; 1 >= g; ++g)
              for (e = -g; e <= g; ++e)
                for (f = -g; f <= g; ++f)
                  if (G(b + e * h, c + f * k)) {
                    d[0] = b + e * h;
                    d[1] = c + f * k;
                    b = !0;
                    break a;
                  }
            b = !1;
          }
          b || ((a.dest[0] = qa.world.x), (a.dest[1] = qa.world.y));
          T.sendPacket(a);
        }
        V.clearTimeout(Ua);
        Ua = V.setTimeout(z, 500);
        fb = +R.tick;
      }
    }
    function G(a, b) {
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
    function P() {
      S.moveAction &&
        V.setTimeout(function () {
          S.moveAction &&
            (T.sendPacket(S.moveAction),
            null == ta.getFocusEntity() &&
              T.sendPacket(new da.CZ.CANCEL_LOCKON()),
            (S.moveAction = null));
        }, 50);
    }
    function N(a, b) {
      var c = new da.CZ.STATUS_CHANGE();
      c.statusID = a;
      c.changeAmount = b;
      T.sendPacket(c);
    }
    function I(a, b) {
      if (b) {
        var c = new da.CZ.ITEM_THROW();
        c.Index = a;
        c.count = b;
        T.sendPacket(c);
      }
    }
    function x(a) {
      var b = new da.CZ.USE_ITEM();
      b.index = a;
      b.AID = S.Entity.GID;
      T.sendPacket(b);
    }
    function J(a, b) {
      var c = new da.CZ.REQ_WEAR_EQUIP();
      c.index = a;
      c.wearLocation = b;
      T.sendPacket(c);
    }
    function E(a) {
      var b = new da.CZ.REQ_TAKEOFF_EQUIP();
      b.index = a;
      T.sendPacket(b);
    }
    function L(a, b) {
      var c = new da.CZ.CONFIG();
      c.Config = a;
      c.Value = b;
      T.sendPacket(c);
    }
    var y = a("Utils/jquery"),
      F = a("DB/DBManager"),
      K = a("DB/Status/StatusState"),
      M = a("DB/Effects/EffectConst"),
      Q = a("Audio/SoundManager"),
      W = a("Audio/BGM"),
      V = a("Core/Events"),
      ba = a("Core/Configs"),
      S = a("Engine/SessionStorage"),
      T = a("Network/NetworkManager"),
      da = a("Network/PacketStructure"),
      R = a("Renderer/Renderer"),
      fa = a("Renderer/Camera"),
      ea = a("Renderer/MapRenderer"),
      ta = a("Renderer/EntityManager"),
      oa = a("Renderer/Entity/Entity"),
      la = a("Renderer/EffectManager"),
      ga = a("Renderer/Map/Altitude"),
      ka = a("Renderer/CartObject"),
      ha = a("Renderer/FalconObject"),
      X = a("Renderer/WolfObject"),
      Z = a("Controls/MapControl"),
      qa = a("Controls/MouseEventHandler"),
      pa = a("Controls/KeyEventHandler"),
      w = a("Controls/BattleMode"),
      ca = a("Preferences/Controls"),
      O = a("Preferences/ShortCutControls"),
      Y = a("UI/UIManager"),
      ra = a("UI/Background"),
      U = a("UI/Components/Escape/Escape"),
      aa = a("UI/Components/ChatBox/ChatBox"),
      sa = a("UI/Components/MiniMap/MiniMap"),
      ma = a("UI/Components/BasicInfo/BasicInfo"),
      ja = a("UI/Components/WinStats/WinStats"),
      ia = a("UI/Components/Inventory/Inventory");
    a("UI/Components/Mail/Mail");
    var na = a("UI/Components/Mail/Rodex"),
      wa = a("UI/Components/Mail/RodexSend"),
      ua = a("UI/Components/Shop/CashShop"),
      Ba = a("UI/Components/OnPushCart/OnPushCart"),
      Aa = a("UI/Components/ShortCut/ShortCut"),
      xa = a("UI/Components/Equipment/Equipment"),
      ya = a("UI/Components/StatusIcons/StatusIcons"),
      za = a("UI/Components/ChatRoomCreate/ChatRoomCreate"),
      Ka = a("UI/Components/Emoticons/Emoticons"),
      va = a("UI/Components/RankFont/RankFont"),
      Ia = a("UI/Components/SkillList/SkillList"),
      Ca = a("UI/Components/PartyFriends/PartyFriends"),
      Da = a("UI/Components/Quest/Quest"),
      La = a("UI/Components/Achievement/Achievement"),
      Ma = a("UI/Components/PartyBooking/PartyBooking"),
      Ha = a("UI/Components/PartyBookingReg/PartyBookingReg"),
      Ea = a("UI/Components/Guild/Guild"),
      Fa = a("UI/Components/WorldMap/WorldMap"),
      Ya = a("UI/Components/NpcBox/NpcBox"),
      Za = a("UI/Components/NpcMenu/NpcMenu"),
      Na = a("UI/Components/Announce/Announce"),
      $a = a("UI/Components/InputBox/InputBox"),
      Ga = a("UI/Components/vbk/vbk"),
      Ta = a("UI/Components/Intro/Particle"),
      Wa = a("UI/Components/ItemObtain/ItemObtain"),
      lb = a("UI/Components/Attendance/Attendance"),
      sb = a("UI/Components/CardConnection/CardConnection2"),
      bb = a("UI/Components/miniQuest/miniQuest"),
      mb = "",
      eb = !1,
      Oa = {
        init: function (R, z, V) {
          Ta.stop();
          mb = V;
          T.connect(
            T.utils.longToIP(R),
            z,
            function (a) {
              ea.currentMap = "";
              if (a) {
                S.Port = z;
                aid = S.AID;
                gid = S.GID;
                a = new da.CZ.ENTER();
                a.AID = S.AID;
                a.GID = S.GID;
                a.AuthCode = S.AuthCode;
                a.clientTime = Date.now();
                a.Sex = S.Sex;
                T.sendPacket(a);
                T.read(function (a) {
                  4 === a.length && (S.Character.GID = a.readLong());
                });
                var b = new da.CZ.REQUEST_TIME(),
                  c = Date.now();
                T.setPing(function () {
                  b.clientTime = Date.now() - c;
                  T.sendPacket(b);
                });
              } else Y.showErrorBox(F.getMessage(1));
            },
            !0,
          );
          eb ||
            ((eb = !0),
            Z.init(),
            (Z.onRequestWalk = H),
            (Z.onRequestStopWalk = C),
            (Z.onRequestDropItem = I),
            T.hookPacket(da.ZC.AID, e),
            T.hookPacket(da.ZC.ACCEPT_ENTER, l),
            T.hookPacket(da.ZC.ACCEPT_ENTER2, l),
            T.hookPacket(da.ZC.ACCEPT_ENTER3, l),
            T.hookPacket(da.ZC.NPCACK_MAPMOVE, h),
            T.hookPacket(da.ZC.NPCACK_SERVERMOVE, r),
            T.hookPacket(da.ZC.ACCEPT_QUIT, g),
            T.hookPacket(da.ZC.REFUSE_QUIT, n),
            T.hookPacket(da.ZC.RESTART_ACK, u),
            T.hookPacket(da.ZC.ACK_REQ_DISCONNECT, A),
            T.hookPacket(da.ZC.NOTIFY_TIME, b),
            T.hookPacket(da.ZC.NOTIFY_MAPPROPERTY2, c),
            T.hookPacket(da.ZC.NOTIFY_RANKING, d),
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
            U.prepare(),
            ia.prepare(),
            Ba.prepare(),
            ja.prepare(),
            xa.prepare(),
            Aa.prepare(),
            za.prepare(),
            Ka.prepare(),
            va.prepare(),
            Ia.prepare(),
            Ca.prepare(),
            ya.prepare(),
            ma.prepare(),
            aa.prepare(),
            Ea.prepare(),
            Fa.prepare(),
            Da.prepare(),
            bb.prepare(),
            Ga.prepare(),
            Wa.prepare(),
            Ma.prepare(),
            Ha.prepare(),
            (ja.onRequestUpdate = N),
            (xa.onUnEquip = E),
            (xa.onConfigUpdate = L),
            (xa.onEquipItem = J),
            (xa.onRemoveOption = B),
            (ia.onUseItem = x),
            (ia.onEquipItem = J),
            (U.onExitRequest = t),
            (U.onCharSelectionRequest = m),
            (U.onReturnSavePointRequest = q),
            (U.onResurectionRequest = v),
            (U.onBackhomeRequest = k),
            (U.onSetofflineRequest = f),
            (U.onCheakResurection = p),
            (aa.onRequestTalk = D));
        },
      },
      Ua = null,
      fb = 0;
    return Oa;
  },
);
