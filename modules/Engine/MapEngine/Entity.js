define(
  "Engine/MapEngine/Entity",
  "require DB/DBManager DB/Skills/SkillConst DB/Skills/SkillInfo DB/Status/StatusConst DB/Status/StatusState DB/Mercenary/MercenaryTable DB/Emotions DB/Skills/SkillEffect DB/Skills/SkillAction DB/Items/TitleTable DB/Effects/EffectConst Renderer/CartObject Renderer/FalconObject Renderer/WolfObject DB/Pets/PetMessageConst Audio/SoundManager Core/Events Engine/MapEngine/Guild Engine/SessionStorage Network/NetworkManager Network/PacketStructure Network/PacketVerManager Preferences/Map Renderer/Map/Altitude Renderer/Renderer Renderer/EntityManager Renderer/Entity/Entity Renderer/EffectManager Renderer/Map/Effects Renderer/Effects/Damage Renderer/Effects/MagicTarget Renderer/Effects/LockOnTarget Renderer/Effects/MagicRing Renderer/Effects/StrEffect Renderer/Map/Effects UI/UIManager UI/Components/BasicInfo/BasicInfo UI/Components/ChatBox/ChatBox UI/Components/ChatRoom/ChatRoom UI/Components/Escape/Escape UI/Components/Inventory/Inventory UI/Components/MiniMap/MiniMap UI/Components/ShortCut/ShortCut UI/Components/StatusIcons/StatusIcons UI/Components/OnPushCart/OnPushCart UI/Components/ItemSelection/ItemSelection UI/Components/vbk/vbk UI/Components/ItemObtain/ItemObtain UI/Components/PartyBookingReg/PartyBookingReg".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a.objecttype === ja.TYPE_MERC &&
        ka[a.job] &&
        ((a.sex = ka[a.job][0].sex),
        (a.head = ka[a.job][0].head),
        (a.accessory = ka[a.job][0].accessory),
        (a.accessory2 = ka[a.job][0].accessory2),
        (a.accessory3 = ka[a.job][0].accessory3),
        (a.weapon = ka[a.job][0].weapon));
      var b = ma.get(a.GID);
      if (b) {
        if ((b.set(a), 45 == a.job)) {
          var c = { ownerAID: b.GID, position: b.position };
          c.effectId = 20030715 > ra.value ? X.EF_WARPZONE : X.EF_WARPZONE2;
          ia.spam(c);
        }
      } else {
        b = new ja();
        b.set(a);
        if (
          b.objecttype === ja.TYPE_PC &&
          !(
            b._effectState &
            (ta.EffectState.INVISIBLE |
              ta.EffectState.HIDE |
              ta.EffectState.CLOAK |
              ta.EffectState.CHASEWALK)
          )
        ) {
          if (
            a instanceof Y.ZC.NOTIFY_STANDENTRY ||
            a instanceof Y.ZC.NOTIFY_STANDENTRY2 ||
            a instanceof Y.ZC.NOTIFY_STANDENTRY3 ||
            a instanceof Y.ZC.NOTIFY_STANDENTRY4 ||
            a instanceof Y.ZC.NOTIFY_STANDENTRY5 ||
            a instanceof Y.ZC.NOTIFY_STANDENTRY6 ||
            a instanceof Y.ZC.NOTIFY_STANDENTRY7 ||
            a instanceof Y.ZC.NOTIFY_STANDENTRY8 ||
            a instanceof Y.ZC.NOTIFY_STANDENTRY9
          )
            ((c = { ownerAID: b.GID, position: b.position }),
              (c.effectId = 20030715 > ra.value ? X.EF_ENTRY : X.EF_ENTRY2),
              ia.spam(c));
          (99 == a.clevel || 200 == a.clevel) &&
            0 < a.head &&
            ((c = {
              effectId: X.EF_LEVEL99_3,
              ownerAID: b.GID,
              position: b.position,
            }),
            ia.spam(c));
        }
        b.objecttype === ja.TYPE_MOB &&
          ((c = b.display.name),
          c.includes("\u96c4\u58ee") ||
            c.includes("\u72e1\u733e") ||
            c.includes("\u83c1\u82f1") ||
            c.includes("\u8fc5\u6377") ||
            c.includes("\u6124\u6012")) &&
          ((c = { effectId: 2307, ownerAID: b.GID, position: b.position }),
          ia.spam(c));
        45 == a.job &&
          ((c = { ownerAID: b.GID, position: b.position }),
          (c.effectId = 20030715 > ra.value ? X.EF_WARPZONE : X.EF_WARPZONE2),
          ia.spam(c));
        ma.add(b);
        Da.setObjList(b);
      }
      S(b);
    }
    function c(a) {
      if (a.GID === ba.Entity.GID && 1 === a.type)
        return (
          Ca.ui.show(),
          Ca.onCheakResurection(),
          Ca.ui.find(".savepoint").show(),
          Ca.ui.find(".setting, .hotkey,.setoffline,.charselect").hide(),
          ba.Entity.remove(a.type),
          !1
        );
      var b = ma.get(a.GID);
      if (b) {
        if (1 == a.type)
          return (
            b.objecttype != ja.TYPE_PC && Da.delobjlist(a.GID),
            (b.isDeath = !0),
            b.remove(a.type),
            ia.remove(null, a.GID),
            ba.hasAttackTarget == b && (ba.hasAttackTarget = null),
            !1
          );
        Da.delobjlist(a.GID);
        b.cart && Aa.remove(a.GID);
        b.falcon && wa.remove(a.GID);
        b.wolf && ya.remove(a.GID);
        if (b.objecttype === ja.TYPE_PC && a.GID === ba.Entity.GID) {
          var c = { effectId: X.EF_DEVIL, ownerAID: b.GID };
          ia.spam(c);
        }
        ia.remove(null, a.GID);
        switch (a.type) {
          case ja.VT.OUTOFSIGHT:
            ia.remove(null, a.GID, null);
            break;
          case ja.VT.EXIT:
          case ja.VT.TELEPORT:
            b._effectState & ta.EffectState.INVISIBLE ||
              ((c = { position: b.position }),
              (c.effectId =
                20030715 > ra.value ? X.EF_TELEPORTATION : X.EF_TELEPORTATION2),
              ia.spam(c));
        }
        b.remove(a.type);
      }
    }
    function d(a) {
      var b = ma.get(a.GID);
      b && b.walkTo(a.MoveData[0], a.MoveData[1], a.MoveData[2], a.MoveData[3]);
    }
    function e(a) {
      var b = ma.get(a.AID);
      b &&
        ((b.position[0] = a.xPos),
        (b.position[1] = a.yPos),
        (b.position[2] = aa.getCellHeight(a.xPos, a.yPos)),
        (b.walk.index = b.walk.total),
        b.action === b.ACTION.WALK &&
          b.setAction({
            action: b.ACTION.IDLE,
            frame: 0,
            repeat: !0,
            play: !0,
          }));
    }
    function m(a) {
      var b = ma.get(a.AID);
      b &&
        ((b.position[0] = a.xPos),
        (b.position[1] = a.yPos),
        (b.position[2] = aa.getCellHeight(a.xPos, a.yPos)));
    }
    function h(a) {
      var b = ma.get(a.AID);
      if (
        b &&
        (b.walkTo(b.position[0], b.position[1], a.targetXpos, a.targetYpos),
        b.walk.path.length)
      ) {
        var c = b.walk.speed;
        b.walk.speed = 10;
        b.walk.onEnd = function () {
          b.walk.speed = c;
        };
      }
    }
    function r(a) {
      var b = ma.get(a.GID);
      b &&
        a.type in oa.indexes &&
        b.attachments.add({
          frame: oa.indexes[a.type],
          file: "emotion",
          play: !0,
          head: !0,
          depth: 5,
        });
    }
    function q(a) {
      if ((a = ma.get(a.AID)))
        ((a.isDeath = !1),
          a.setAction({
            action: a.ACTION.IDLE,
            frame: 0,
            repeat: !0,
            play: !0,
          }),
          a === ba.Entity &&
            (Ca.ui.hide(),
            Ca.ui.find(".resurection, .savepoint").hide(),
            Ca.ui.find(" .setting, .hotkey, .setoffline, .charselect").show()));
    }
    function k(a) {
      var b = ma.get(a.GID);
      if (b) {
        var c = ma.get(a.targetGID),
          d,
          e = b.weapon ? b.weapon : 0,
          f = b.shield ? b.shield : 0;
        b.targetGID = a.targetGID;
        switch (a.action) {
          case 0:
          case 4:
          case 8:
          case 9:
          case 10:
          case 11:
          case 13:
            var g = (d = ca.getWeaponSound(e)) ? d[0] : !1,
              h = d ? d[1] : !1,
              k = (d = ca.getWeaponSound(f)) ? d[0] : !1;
            d = d ? d[1] : !1;
            if (g && g.includes("bow")) {
              var l = {
                effectId: "ef_arrow_projectile",
                ownerAID: c.GID,
                otherAID: b.GID,
                otherPosition: b.position,
              };
              pa.setTimeout(function () {
                ia.spam(l);
              }, 0.75 * a.attackMT);
            }
            g &&
              pa.setTimeout(function () {
                qa.play(g);
              }, 0);
            h &&
              pa.setTimeout(function () {
                qa.play(h);
              }, 0.25 * a.attackMT);
            2 == a.count &&
              (g &&
                pa.setTimeout(function () {
                  qa.play(g);
                }, 200),
              h &&
                pa.setTimeout(
                  function () {
                    qa.play(h);
                  },
                  0.25 * a.attackMT + 200,
                ));
            a.leftDamage &&
              (k &&
                pa.setTimeout(function () {
                  qa.play(k);
                }, 350),
              d &&
                pa.setTimeout(
                  function () {
                    qa.play(h);
                  },
                  0.25 * a.attackMT + 350,
                ));
            if (c) {
              N(a, c);
              if ((d = a.damage ? c : b)) {
                c.objecttype === ja.TYPE_MOB &&
                  0 < a.damage &&
                  11 != b.weaponeffect &&
                  ((l = {
                    effectId: X.EF_HIT1,
                    ownerAID: a.targetGID,
                    startTick: sa.tick + a.attackMT,
                  }),
                  ia.spam(l));
                var n = null;
                switch (a.action) {
                  case 10:
                    n = na.TYPE.CRIT;
                  case 0:
                  case 4:
                    a.leftDamage
                      ? (na.add(a.damage, d, sa.tick + a.attackMT / 2, e, n),
                        na.add(a.leftDamage, d, sa.tick + a.attackMT, f, n))
                      : na.add(a.damage, d, sa.tick + a.attackMT, e, n);
                    break;
                  case 13:
                    n = na.TYPE.CRIT;
                  case 8:
                  case 9:
                    a.leftDamage
                      ? (c.objecttype === ja.TYPE_MOB &&
                          0 < a.damage &&
                          (na.add(
                            a.damage / 2,
                            c,
                            sa.tick + a.attackMT / 3,
                            e,
                            na.TYPE.COMBO,
                          ),
                          na.add(
                            a.damage,
                            c,
                            sa.tick + (a.attackMT / 3) * 2,
                            f,
                            na.TYPE.COMBO,
                          ),
                          na.add(
                            a.damage + a.leftDamage,
                            c,
                            sa.tick + a.attackMT,
                            e,
                            na.TYPE.COMBO | na.TYPE.COMBO_FINAL,
                          )),
                        na.add(a.damage / 2, d, sa.tick + a.attackMT / 3, e, n),
                        na.add(
                          a.damage / 2,
                          d,
                          sa.tick + (a.attackMT / 3) * 2,
                          f,
                          n,
                        ),
                        na.add(a.leftDamage, d, sa.tick + a.attackMT, e, n))
                      : (c.objecttype === ja.TYPE_MOB &&
                          0 < a.damage &&
                          (na.add(
                            a.damage / 2,
                            c,
                            sa.tick + (a.attackMT / 3) * 2,
                            e,
                            na.TYPE.COMBO,
                          ),
                          na.add(
                            a.damage,
                            c,
                            sa.tick + a.attackMT,
                            e,
                            na.TYPE.COMBO | na.TYPE.COMBO_FINAL,
                          )),
                        na.add(
                          a.damage / 2,
                          d,
                          sa.tick + (a.attackMT / 3) * 2,
                          e,
                          n,
                        ),
                        na.add(a.damage / 2, d, sa.tick + a.attackMT, e, n));
                    break;
                  case 11:
                    na.add(0, d, sa.tick + a.attackMT, na.TYPE.MISS);
                }
              }
              b.lookTo(c.position[0], c.position[1]);
            }
            b.attack_speed = a.attackMT;
            b.objecttype === ja.TYPE_MERC
              ? b.setAction({
                  action: b.ACTION.ATTACK2,
                  frame: 0,
                  repeat: !1,
                  play: !0,
                  next: {
                    delay: sa.tick + a.attackMT,
                    action: b.ACTION.IDLE,
                    frame: 0,
                    repeat: !0,
                    play: !0,
                    next: !1,
                  },
                })
              : 2 == a.count
                ? (b.setAction({
                    action: b.ACTION.ATTACK,
                    frame: 0,
                    repeat: !1,
                    play: !0,
                    next: !1,
                  }),
                  setTimeout(function () {
                    b.setAction({
                      action: b.ACTION.ATTACK,
                      frame: 0,
                      repeat: !1,
                      play: !0,
                      next: {
                        delay: sa.tick + a.attackMT,
                        action: b.ACTION.READYFIGHT,
                        frame: 0,
                        repeat: !0,
                        play: !0,
                        next: !1,
                      },
                    });
                  }, a.attackMT / 2))
                : b.setAction({
                    action: b.ACTION.ATTACK,
                    frame: 0,
                    repeat: !1,
                    play: !0,
                    next: {
                      delay: sa.tick + a.attackMT,
                      action: b.ACTION.READYFIGHT,
                      frame: 0,
                      repeat: !0,
                      play: !0,
                      next: !1,
                    },
                  });
            b.GID === ba.Entity.GID &&
              900 < ba.pet.friendly &&
              (ba.pet.lastTalk || 0) + 1e4 < Date.now() &&
              3 > parseInt(10 * Math.random()) &&
              ((c = ca.getPetHungryState(ba.pet.oldHungry)),
              (c = ca.getPetTalkNumber(ba.pet.job, Z.PM_HUNTING, c)),
              (e = new Y.CZ.PET_ACT()),
              (e.data = c),
              Q.sendPacket(e),
              (ba.pet.lastTalk = Date.now()));
            break;
          case 1:
            b.setAction({
              action: b.ACTION.PICKUP,
              frame: 0,
              repeat: !1,
              play: !0,
              next: {
                action: b.ACTION.IDLE,
                frame: 0,
                repeat: !0,
                play: !0,
                next: !1,
              },
            });
            c && b.lookTo(c.position[0], c.position[1]);
            break;
          case 2:
            b.setAction({
              action: b.ACTION.SIT,
              frame: 0,
              repeat: !0,
              play: !0,
            });
            break;
          case 3:
            b.setAction({
              action: b.ACTION.IDLE,
              frame: 0,
              repeat: !0,
              play: !0,
            });
        }
      }
    }
    function g(a) {
      var b, c;
      a.msg = a.msg.replace(/\: \|\d{2}/, ": ");
      if (Ha.isOpen) Ha.message(a.msg);
      else {
        c = va.TYPE.PUBLIC;
        if ((b = ma.get(a.GID)))
          (b.dialog.set(a.msg),
            b === ba.Entity
              ? (c |= va.TYPE.SELF)
              : b.isAdmin && (c |= va.TYPE.ADMIN));
        va.addText(a.msg, c);
      }
    }
    function t(a) {
      var b = a.msg.split("\x3cmsg\x3e");
      if (3 == b.length && "" == b[0] && "" != b[1] && "" == b[2])
        return (Oa.setMsg(b[1]), !1);
      b = a.msg.split("\x3cmapname\x3e");
      if (3 == b.length && "" == b[0] && "" != b[1] && "" == b[2])
        return (Oa.setMapname(b[1]), !1);
      var c =
        "rgb(" +
        [
          a.color & 255,
          (a.color & 65280) >> 8,
          (a.color & 16711680) >> 16,
        ].join() +
        ")";
      a.msg = a.msg.replace(/\: \|\d{2}/, ": ");
      (b = ma.get(a.accountID)) &&
        ba.Entity.GID != b.GID &&
        b.dialog.set(a.msg);
      va.addText(a.msg, va.TYPE.PUBLIC, c);
    }
    function l(a) {
      var b = ma.get(a.AID);
      if (b) {
        if (b.objecttype == ja.TYPE_SLAVE) return !1;
        b.display.name = a.CName;
        b.display.party_name = a.PName || "";
        b.display.guild_name = a.GName || "";
        b.display.guild_rank = a.RName || "";
        b.display.title = a.TitleID ? ha[a.TitleID] : "";
        b.display.load = b.display.TYPE.COMPLETE;
        b.GUID
          ? w.requestGuildEmblem(b.GUID, b.GEmblemVer, function (a) {
              b.display.emblem = a;
              b.display.update(
                b.objecttype === ja.TYPE_MOB
                  ? "#ffc6c6"
                  : b.objecttype === ja.TYPE_NPC
                    ? "#94bdf7"
                    : "white",
              );
            })
          : (b.display.emblem = null);
        b.display.update(
          b.objecttype === ja.TYPE_MOB
            ? "#ffc6c6"
            : b.objecttype === ja.TYPE_NPC
              ? "#94bdf7"
              : "white",
        );
        b.objecttype != ja.TYPE_MOB && b.display.add();
      }
    }
    function f(a) {
      var b = ma.get(a.AID);
      b && ((b.life.hp = a.hp), (b.life.hp_max = a.maxhp), b.life.update());
    }
    function n(a) {
      var b = ma.get(a.npcID);
      if (9999 !== a.effect) {
        var c = a.effect + 81;
        b &&
          a.effect in oa.indexes &&
          b.attachments.add({
            frame: oa.indexes[c],
            file: "emotion",
            play: !0,
            head: !0,
            repeat: !0,
            depth: 5,
          });
      }
      switch (a.color + 1) {
        case 1:
          b = 16776960;
          break;
        case 2:
          b = 16753920;
          break;
        case 3:
          b = 57706;
          break;
        case 4:
          b = 8388736;
          break;
        default:
          return;
      }
      Fa.addNpcMark(a.npcID, a.xPos, a.yPos, b, Infinity);
    }
    function p(a) {
      var b = ma.get(a.AID);
      b &&
        ((b.direction = [4, 3, 2, 1, 0, 7, 6, 5][a.dir]),
        (b.headDir = a.headDir));
    }
    function v(a) {
      var b = ma.get(a.GID);
      if (b)
        switch (a.type) {
          case 0:
            b.objecttype === ja.TYPE_EFFECT ||
            b.objecttype === ja.TYPE_UNIT ||
            b.objecttype === ja.TYPE_TRAP ||
            b.objecttype === ja.TYPE_WARP
              ? ia.spamSkillZone(
                  a.value,
                  b.position[0],
                  b.position[1],
                  a.GID,
                  b.creatorGID,
                )
              : ((b.job = a.value),
                b === ba.Entity && Ja.update("job", a.value));
            break;
          case 1:
            b.head = a.value;
            break;
          case 2:
            a instanceof Y.ZC.SPRITE_CHANGE2
              ? ((b.weapon = a.value), (b.shield = a.value1))
              : (b.weapon = a.value);
            break;
          case 3:
            b.accessory = a.value;
            break;
          case 4:
            b.accessory2 = a.value;
            break;
          case 5:
            b.accessory3 = a.value;
            break;
          case 6:
            b.headpalette = a.value;
            break;
          case 7:
            b.bodypalette = a.value;
            break;
          case 8:
            b.shield = a.value;
            break;
          case 12:
            b.robe = a.value;
        }
    }
    function u(a) {
      var b = ma.get(a.GID);
      b && (b.job = a.value);
    }
    function A(a) {
      var b = ma.get(a.srcAID),
        c = ma.get(a.targetAID);
      !b ||
        (b.objecttype !== ja.TYPE_PC &&
          b.objecttype !== ja.TYPE_DISGUISED &&
          b.objecttype !== ja.TYPE_PET &&
          b.objecttype !== ja.TYPE_HOM &&
          b.objecttype !== ja.TYPE_MERC &&
          b.objecttype !== ja.TYPE_ELEM) ||
        Pa.includes(a.SKID) ||
        b.dialog.set(
          ((fa[a.SKID] && fa[a.SKID].SkillName) || "Unknown Skill") + " !!",
          "white",
        );
      if (b && b.action !== b.ACTION.DIE && b.action !== b.ACTION.SIT)
        if (a.SKID in la) {
          var d = la[a.SKID];
          d && b.setAction(d(b, sa.tick));
        } else b.setAction(la.DEFAULT(b, sa.tick));
      if (c) {
        b && c !== b && b.lookTo(c.position[0], c.position[1]);
        if (
          a.SKID === T.AL_HEAL ||
          a.SKID === T.AB_HIGHNESSHEAL ||
          a.SKID === T.AB_CHEAL
        )
          (na.add(a.level, c, sa.tick, null, na.TYPE.HEAL),
            qa.playPosition("_heal_effect.wav", c.position));
        a.SKID === T.GC_ROLLINGCUTTER &&
          c.RollCounter &&
          ((b = {
            effectId: X.EF_ROLLING1 + c.RollCounter - 1,
            ownerAID: c.GID,
          }),
          ia.spam(b));
        a.SKID === T.TK_SEVENWIND &&
          a.level &&
          ((b = { effectId: X.EF_BEGINASURA1 + a.level - 1, ownerAID: c.GID }),
          ia.spam(b));
        ia.spamSkill(a.SKID, a.targetAID, null, null, a.srcAID);
        1 == a.result &&
          ia.spamSkillSuccess(a.SKID, a.targetAID, null, a.srcAID);
        ba.Entity == c &&
          154 == a.SKID &&
          1 == a.result &&
          (Ga.append(),
          Ga.setListPushCart(),
          Ga.setTitle("\u624b\u63a8\u8f66\u76ee\u5f55"),
          (Ga.onIndexSelected = function (a) {
            switch (a) {
              case 2:
                if (40 > ba.Entity.clevel)
                  return (
                    za.showMessageBox(
                      "\u6728\u8d28\u624b\u63a8\u8f66\u9700\u898140\u7ea7\u4ee5\u4e0a\u624d\u80fd\u4f7f\u7528\u3002",
                      "ok",
                    ),
                    !1
                  );
                break;
              case 3:
                if (65 > ba.Entity.clevel)
                  return (
                    za.showMessageBox(
                      "\u5de1\u6e38\u624b\u63a8\u8f66\u9700\u898165\u7ea7\u4ee5\u4e0a\u624d\u80fd\u4f7f\u7528\u3002",
                      "ok",
                    ),
                    !1
                  );
                break;
              case 4:
                if (80 > ba.Entity.clevel)
                  return (
                    za.showMessageBox(
                      "\u7279\u5356\u624b\u63a8\u8f66\u9700\u898180\u7ea7\u4ee5\u4e0a\u624d\u80fd\u4f7f\u7528\u3002",
                      "ok",
                    ),
                    !1
                  );
                break;
              case 5:
                if (90 > ba.Entity.clevel)
                  return (
                    za.showMessageBox(
                      "\u8c6a\u534e\u624b\u63a8\u8f66\u9700\u898190\u7ea7\u4ee5\u4e0a\u624d\u80fd\u4f7f\u7528\u3002",
                      "ok",
                    ),
                    !1
                  );
                break;
              case 6:
                if (105 > ba.Entity.clevel)
                  return (
                    za.showMessageBox(
                      "\u96e8\u4f1e\u624b\u63a8\u8f66\u9700\u8981105\u7ea7\u4ee5\u4e0a\u624d\u80fd\u4f7f\u7528\u3002",
                      "ok",
                    ),
                    !1
                  );
                break;
              case 7:
                if (115 > ba.Entity.clevel)
                  return (
                    za.showMessageBox(
                      "\u5192\u9669\u624b\u63a8\u8f66\u9700\u8981115\u7ea7\u4ee5\u4e0a\u624d\u80fd\u4f7f\u7528\u3002",
                      "ok",
                    ),
                    !1
                  );
                break;
              case 8:
                if (125 > ba.Entity.clevel)
                  return (
                    za.showMessageBox(
                      "\u52c7\u8005\u624b\u63a8\u8f66\u9700\u8981125\u7ea7\u4ee5\u4e0a\u624d\u80fd\u4f7f\u7528\u3002",
                      "ok",
                    ),
                    !1
                  );
                break;
              case 9:
                if (135 > ba.Entity.clevel)
                  return (
                    za.showMessageBox(
                      "\u534e\u4e3d\u624b\u63a8\u8f66\u9700\u8981135\u7ea7\u4ee5\u4e0a\u624d\u80fd\u4f7f\u7528\u3002",
                      "ok",
                    ),
                    !1
                  );
            }
            var b = new Y.CZ.REQ_CHANGECART();
            b.num = a;
            Q.sendPacket(b);
          }));
        c &&
          349 == a.SKID &&
          (a.result
            ? ((c.explosion = 1),
              (c.effectColor[0] = 1),
              (c.effectColor[1] = 0.7),
              (c.effectColor[2] = 0.7))
            : ((c.explosion = 0),
              (c.effectColor[0] = 1),
              (c.effectColor[1] = 1),
              (c.effectColor[2] = 1)));
      }
    }
    function D(a) {
      Ga.append();
      Ga.setListPushCart2();
      Ga.setTitle("\u624b\u63a8\u8f66\u76ee\u5f55");
      Ga.onIndexSelected = function (b) {
        var c = new Y.CZ.SELECTCART();
        c.AID = a.AID;
        c.type = 9 + b;
        Q.sendPacket(c);
      };
    }
    function B(a) {
      ia.spamSkillZone(a.job, a.xPos, a.yPos, a.AID, a.creatorAID);
    }
    function O(a) {
      ia.remove(null, a.AID);
      (a = ma.get(a.AID)) && a.remove();
    }
    function C(a) {
      var b = ma.get(a.AID),
        c = ma.get(a.targetID),
        d;
      if (
        b &&
        ((a.attackMT = Math.min(a.attackMT, a.attackedMT)),
        (a.attackMT = Math.max(200, a.attackMT)),
        (b.attack_speed = a.attackMT),
        (b.amotionTick = sa.tick + a.attackMT),
        (d = 0),
        b.weapon && (d = b.weapon),
        Pa.includes(a.SKID) ||
          (b.objecttype !== ja.TYPE_PC &&
            b.objecttype !== ja.TYPE_DISGUISED &&
            b.objecttype !== ja.TYPE_PET &&
            b.objecttype !== ja.TYPE_HOM &&
            b.objecttype !== ja.TYPE_MERC &&
            b.objecttype !== ja.TYPE_ELEM) ||
          b.dialog.set(
            ((fa[a.SKID] && fa[a.SKID].SkillName) || "Unknown Skill") + " !!",
          ),
        b.action !== b.ACTION.DIE && b.action !== b.ACTION.SIT)
      ) {
        if (a.SKID in la) {
          var e = la[a.SKID];
          e && b.setAction(e(b, sa.tick));
        } else b.setAction(la.DEFAULT(b, sa.tick));
        if (
          b.GID === ba.Entity.GID &&
          900 < ba.pet.friendly &&
          (ba.pet.lastTalk || 0) + 1e4 < Date.now() &&
          3 > parseInt(10 * Math.random())
        ) {
          var e = ca.getPetHungryState(ba.pet.oldHungry),
            e = ca.getPetTalkNumber(ba.pet.job, Z.PM_HUNTING, e),
            f = new Y.CZ.PET_ACT();
          f.data = e;
          Q.sendPacket(f);
          ba.pet.lastTalk = Date.now();
        }
      }
      if (c && (e = a.damage ? c : b) && (b != c || 6 != a.action)) {
        N(a, c);
        for (
          var f = e.objecttype !== ja.TYPE_PC && 1 < a.count,
            g = Za.includes(a.SKID),
            h = 0;
          h < a.count;
          ++h
        ) {
          ia.spamSkillBeforeHit(a.SKID, a.targetID, sa.tick + 200 * h, a.AID);
          var k = h,
            l = sa.tick + a.attackMT + 200 * h;
          a.damage && ia.spamSkillHit(a.SKID, a.targetID, l, a.AID);
          !f && g && a.damage
            ? na.add(
                a.damage / a.count,
                e,
                l,
                d,
                na.TYPE.COMBO_B | (k + 1 === a.count ? na.TYPE.COMBO_FINAL : 0),
              )
            : na.add(a.damage / a.count, e, l, d);
          f &&
            a.damage &&
            na.add(
              (a.damage / a.count) * (k + 1),
              e,
              l,
              d,
              (g ? na.TYPE.COMBO_B : na.TYPE.COMBO) |
                (k + 1 === a.count ? na.TYPE.COMBO_FINAL : 0),
            );
        }
      }
      b &&
        c &&
        5 != a.action &&
        7 != a.SKID &&
        81 != a.SKID &&
        406 != a.SKID &&
        ia.spamSkill(a.SKID, a.targetID, null, sa.tick, a.AID);
    }
    function y(a) {
      var b = ma.get(a.AID),
        c = ma.get(a.targetID),
        d = !1;
      if (b) {
        var e;
        e = !0;
        var f = {
          action: b.ACTION.READYFIGHT,
          frame: 0,
          repeat: !0,
          play: !0,
          next: !1,
        };
        a.delayTime &&
          ((e = a.SKID in ga && ga[a.SKID].hideCastBar) ||
            b.cast.set(a.delayTime),
          (f = e = !1));
        b.objecttype === ja.TYPE_PC &&
          b.setAction({
            action: b.ACTION[(fa[a.SKID] && fa[a.SKID].ActionType) || "SKILL"],
            frame: 0,
            repeat: !1,
            play: e,
            next: f,
          });
        a.SKID == T.KN_AUTOCOUNTER &&
          (b.cast.set(1e3), b === ba.Entity && (ba.underAutoCounter = !0));
        if (a.SKID === T.BA_FROSTJOKE && b.GID == ba.Entity.GID) {
          if ((e = ca.getRandomJoke()))
            (va.onRequestTalk("", e, va.TYPE.PUBLIC), (d = !0));
        } else
          a.SKID === T.DC_SCREAM &&
            b.GID == ba.Entity.GID &&
            (e = ca.getRandomScream()) &&
            (va.onRequestTalk("", e, va.TYPE.PUBLIC), (d = !0));
        if (
          b.objecttype === ja.TYPE_PC ||
          b.objecttype === ja.TYPE_DISGUISED ||
          b.objecttype === ja.TYPE_PET ||
          b.objecttype === ja.TYPE_HOM ||
          b.objecttype === ja.TYPE_MERC ||
          b.objecttype === ja.TYPE_ELEM
        )
          Pa.includes(a.SKID) ||
            d ||
            b.dialog.set(
              ((fa[a.SKID] && fa[a.SKID].SkillName) || "Unknown Skill") + " !!",
              "white",
            );
        ia.spamSkillCast(a.SKID, a.AID, null, a.targetID);
        c && c !== b
          ? (b.lookTo(c.position[0], c.position[1]),
            a.delayTime &&
              ((c = {
                effectId: X.EF_LOCKON,
                ownerAID: c.GID,
                position: c.position,
                duration: a.delayTime,
              }),
              ia.spam(c)))
          : a.xPos &&
            a.yPos &&
            (b.lookTo(a.xPos, a.yPos),
            a.delayTime &&
              ((c = ca.getSkillInfo(a.SKID)),
              (c = {
                effectId: X.EF_GROUNDSAMPLE,
                skillId: a.SKID,
                skillRange: c.AttackRange[0],
                position: [a.xPos, a.yPos, aa.getCellHeight(a.yPos, a.yPos)],
                duration: a.delayTime,
                otherAID: b.GID,
              }),
              ia.spam(c)));
        c = a.SKID in ga && ga[a.SKID].hideCastAura;
        if (b && a.delayTime && !c) {
          c = {
            effectId: X.EF_BEGINSPELL,
            ownerAID: b.GID,
            position: b.position,
            duration: a.delayTime,
          };
          switch (a.property) {
            case 0:
              c.effectId = X.EF_BEGINSPELL;
              break;
            case 1:
              c.effectId = X.EF_BEGINSPELL2;
              break;
            case 2:
              c.effectId = X.EF_BEGINSPELL5;
              break;
            case 3:
              c.effectId = X.EF_BEGINSPELL3;
              break;
            case 4:
              c.effectId = X.EF_BEGINSPELL4;
              break;
            case 5:
              c.effectId = X.EF_BEGINSPELL7;
              break;
            case 6:
              c.effectId = X.EF_BEGINSPELL6;
              break;
            case 7:
              c.effectId = X.EF_DARKCASTING;
              break;
            case 8:
              c.effectId = X.EF_BEGINSPELL6;
              break;
            case 9:
              c.effectId = X.EF_DARKCASTING;
          }
          ia.spam(c);
        }
      }
    }
    function z(a) {
      var b = ma.get(a.AID);
      if (
        b &&
        (b.cast.clean(),
        ia.remove(null, b.GID, [12, 54, 55, 56, 57, 58, 59, 454, 60, 513]),
        ia.remove(ua, b.GID),
        ia.remove(xa, b.GID),
        ia.remove(Ba, b.GID),
        b === ba.Entity && ba.underAutoCounter)
      ) {
        if (0 < ba.Entity.life.hp)
          var c = { effectId: X.EF_AUTOCOUNTER, ownerAID: a.AID };
        ia.spam(c);
        ba.underAutoCounter = !1;
      }
    }
    function J(a) {
      var b = ma.get(a.AID);
      if (b) {
        var c = 0,
          d = 0;
        a.val && 0 < a.val[0] && (d = a.val[0]);
        a.state && (c = a.state);
        var e = new Float32Array([
          b.effectColor[0],
          b.effectColor[1],
          b.effectColor[2],
          b.effectColor[3],
        ]);
        switch (a.index) {
          case da.CLAIRVOYANCE:
            b === ba.Entity &&
              ((ba.Character.intravision = a.state),
              ma.forEach(function (a) {
                a.effectState = a.effectState;
              }));
            break;
          case da.ON_PUSH_CART:
            b.cart = "undefined" !== typeof a.val ? a.val[0] : a.state;
            b === ba.Entity &&
              ((ba.Entity.cart = b.cart), ba.Entity.cart || La.ui.hide());
            Aa.remove(a.AID);
            b.cart && b._effectStateColor[3] && Aa.add(b, b.cart);
            break;
          case da.FALCON:
            b.falcon = a.state;
            b === ba.Entity && (ba.Entity.falcon = b.falcon);
            wa.remove(a.AID);
            b.falcon && b._effectStateColor[3] && wa.add(b);
            break;
          case da.RIDING:
            b.riding = 1 == c || 0 < d ? !0 : !1;
            b.effectState = b.effectState;
            b.effectColor = e;
            break;
          case da.ALL_RIDING:
            1 == c || 0 < d
              ? ((b.riding_ = !0), (b.allRidingState = 1))
              : ((b.riding_ = !1), (b.allRidingState = 0));
            b.effectColor = e;
            break;
          case da.HIDING:
            c = { effectId: X.EF_SUMMONSLAVE, ownerAID: a.AID };
            1 == a.state && (c.effectId = X.EF_BASH);
            ia.spam(c);
            break;
          case da.MARIONETTE_MASTER:
          case da.MARIONETTE:
          case da.TWOHANDQUICKEN:
          case da.ONEHANDQUICKEN:
          case da.SPEARQUICKEN:
          case da.LKCONCENTRATION:
          case da.BERSERK:
          case da.ENERGYCOAT:
          case da.OVERTHRUST:
          case da.OVERTHRUSTMAX:
          case da.SWOO:
          case da.SKE:
          case da.NJ_BUNSINJYUTSU:
          case da.STEELBODY:
          case da.AURABLADE:
          case da.SG_WARM:
          case da.SG_SUN_WARM:
          case da.SG_MOON_WARM:
          case da.SG_STAR_WARM:
          case da.KAITE:
          case da.SOULLINK:
          case da.PROPERTYUNDEAD:
          case da.DA_CONTRACT:
            b.toggleOpt3(a.index, a.state);
            break;
          case da.RUN:
            c = { effectId: X.EF_STOPEFFECT, ownerAID: a.AID };
            1 == a.state && (c.effectId = X.EF_RUN);
            ia.spam(c);
            break;
          case da.TING:
            c = { effectId: X.EF_QUAKEBODY, ownerAID: a.AID };
            ia.spam(c);
            break;
          case da.STORMKICK_ON:
          case da.STORMKICK_READY:
            b.setAction({
              action: b.ACTION.SKILL,
              frame: 0,
              repeat: !1,
              play: !1,
              next: !1,
            });
            break;
          case da.DOWNKICK_ON:
          case da.DOWNKICK_READY:
            b.setAction({
              action: b.ACTION.SKILL,
              frame: 2,
              repeat: !1,
              play: !1,
              next: !1,
            });
            break;
          case da.TURNKICK_ON:
          case da.TURNKICK_READY:
            b.setAction({
              action: b.ACTION.SKILL,
              frame: 3,
              repeat: !1,
              play: !1,
              next: !1,
            });
            break;
          case da.COUNTER_ON:
          case da.COUNTER_READY:
            b.setAction({
              action: b.ACTION.SKILL,
              frame: 4,
              repeat: !1,
              play: !1,
              next: !1,
            });
            break;
          case da.DODGE_ON:
          case da.DODGE_READY:
            b.setAction({
              action: b.ACTION.PICKUP,
              frame: 1,
              repeat: !1,
              play: !1,
              next: !1,
            });
            break;
          case da.ROLLINGCUTTER:
            b.RollCounter = 1 == a.state ? a.val[0] : 0;
            break;
          case da.CAMOUFLAGE:
            b.Camouflage = 1 == a.state ? a.val[0] : 0;
            b.effectState = b.effectState;
            break;
          case da.SUMMON1:
            b.Summon1 = 1 == a.state ? a.val[0] : 0;
            I(b);
            break;
          case da.SUMMON2:
            b.Summon2 = 1 == a.state ? a.val[0] : 0;
            I(b);
            break;
          case da.SUMMON3:
            b.Summon3 = 1 == a.state ? a.val[0] : 0;
            I(b);
            break;
          case da.SUMMON4:
            b.Summon4 = 1 == a.state ? a.val[0] : 0;
            I(b);
            break;
          case da.SUMMON5:
            b.Summon5 = 1 == a.state ? a.val[0] : 0;
            I(b);
            break;
          case da.STEALTHFIELD:
            b.Stealthfield = 1 == a.state ? a.val[0] : 0;
            b.effectState = b.effectState;
            break;
          case da.SHADOWFORM:
            b.Shadowform = 1 == a.state ? a.val[0] : 0;
            b.effectState = b.effectState;
            break;
          case da.TRICKDEAD:
            1 == a.state &&
              (b.setAction({
                action: b.ACTION.DIE,
                frame: 0,
                repeat: !1,
                play: !0,
                next: !1,
              }),
              (b.isTrickDead = !0));
            0 == a.state &&
              (b.setAction({
                action: b.ACTION.IDLE,
                frame: 0,
                repeat: !1,
                play: !0,
                next: !1,
              }),
              (b.isTrickDead = !1));
            break;
          case da.ILLUSION:
            b.isHallucinating = 1 == a.state ? !0 : !1;
            break;
          case da.STOP:
            1 == a.state
              ? b.attachments.add({
                  repeat: !0,
                  uid: "status-stop",
                  file: "\u00bd\u00ba\u00c5\u00e9",
                })
              : b.attachments.remove("status-stop");
            break;
          case da.C_MARKER:
            1 == a.state &&
              ((c = { effectId: "ef_c_marker2", ownerAID: a.AID }), ia.spam(c));
            break;
          case da.POSTDELAY:
            ba.Entity == b &&
              ((ba.Entity.startTickCD = Date.now()),
              (ba.Entity.RemainMS = a.RemainMS),
              Ka.addCooldown(a.RemainMS));
            b.setAction({
              action: b.ACTION.SKILL,
              frame: 0,
              repeat: !1,
              play: !0,
              next: {
                action: b.ACTION.IDLE,
                frame: 0,
                repeat: !0,
                play: !0,
                next: !1,
              },
            });
            break;
          case da.TRICKDEAD:
            1 == c
              ? b.setAction({
                  action: b.ACTION.DIE,
                  repeat: !0,
                  play: !0,
                  frame: 0,
                  next: !1,
                })
              : b.setAction({
                  action: b.ACTION.IDLE,
                  frame: 0,
                  repeat: !0,
                  play: !0,
                  next: !1,
                });
            break;
          case da.TWOHANDQUICKEN:
          case da.SPEARQUICKEN:
            1 == c
              ? ((b.virtue = 1),
                (b.effectColor[0] = 0.8),
                (b.effectColor[1] = 0.8),
                (b.effectColor[2] = 0))
              : ((b.virtue = 0),
                (b.effectColor[0] = 1),
                (b.effectColor[1] = 1),
                (b.effectColor[2] = 1));
            break;
          case da.OVERTHRUST:
            1 == c
              ? ((b.virtue = 2),
                (b.effectColor[0] = 1),
                (b.effectColor[1] = 0.7),
                (b.effectColor[2] = 0.7))
              : ((b.virtue = 0),
                (b.effectColor[0] = 1),
                (b.effectColor[1] = 1),
                (b.effectColor[2] = 1));
            break;
          case da.ENERGYCOAT:
            1 == c
              ? ((b.virtue = 4),
                (b.effectColor[0] = 0.7),
                (b.effectColor[1] = 0.7))
              : ((b.virtue = 0),
                (b.effectColor[0] = 1),
                (b.effectColor[1] = 1));
            b.effectColor[2] = 1;
            break;
          case da.MONSTER_TRANSFORM:
          case da.ACTIVE_MONSTER_TRANSFORM:
            1 == c || 0 < d
              ? b.job != d &&
                ((b.tranfrom_bjob = b._job),
                (b.tranfrom_btype = b.objecttype),
                (b.tranfrom_costume = b.costume),
                (b.job = d),
                (b.objecttype = 5),
                (b.costume = 0),
                b.set(b))
              : -1 < b.tranfrom_bjob &&
                ((b.job = b.tranfrom_bjob),
                (b.objecttype = b.tranfrom_btype),
                (b.costume = b.tranfrom_costume),
                b.set(b),
                (b.tranfrom_bjob = -1),
                (b.tranfrom_btype = -1),
                (b.tranfrom_costume = -1));
            break;
          case da.ASSUMPTIO:
          case da.ASSUMPTIO2:
            b.ghost =
              1 == c || 0 < d
                ? { xSize: 1.2, ySize: 1.1 }
                : { xSize: 1, ySize: 1 };
            break;
          case da.EXPLOSIONSPIRITS:
            1 == c
              ? ((b.explosion = 1),
                (b.effectColor[0] = 1),
                (b.effectColor[1] = 0.7),
                (b.effectColor[2] = 0.7))
              : ((b.explosion = 0),
                (b.effectColor[0] = 1),
                (b.effectColor[1] = 1),
                (b.effectColor[2] = 1));
            break;
          case da.BERSERK:
            1 == c
              ? ((b.berserk = 1),
                (b.effectColor[0] = 2),
                (b.effectColor[1] = 1.2))
              : ((b.berserk = 0),
                (b.effectColor[0] = 1),
                (b.effectColor[1] = 1));
            b.effectColor[2] = 1;
            break;
          case da.SOULLINK:
            1 == c
              ? ((b.soullink = 1),
                (b.effectColor[0] = 1),
                (b.effectColor[1] = 1),
                (b.effectColor[2] = 2))
              : ((b.soullink = 0),
                (b.effectColor[0] = 1),
                (b.effectColor[1] = 1),
                (b.effectColor[2] = 1));
            break;
          case da.DEVIL1:
            b.healthState = 1 == c ? 16 : 0;
        }
        b === ba.Entity && Ma.update(a.index, a.state, d, a.RemainMS);
        S(b);
      }
    }
    function I(a) {
      a.Summon1 || a.Summon2 || a.Summon3 || a.Summon4 || a.Summon5
        ? (ia.spam({
            effectId: "temporary_warlock_sphere",
            ownerAID: a.GID,
            persistent: !1,
          }),
          (a.WarlockSpheres = !0))
        : a.WarlockSpheres &&
          (ia.remove(null, a.GID, "temporary_warlock_sphere"),
          (a.WarlockSpheres = !1));
    }
    function L(a) {
      var b = ma.get(a.AID);
      b &&
        ((b.bodyState = a.bodyState),
        (b.healthState = a.healthState),
        (b.effectState = a.effectState),
        (b.isPKModeON = a.isPKModeON),
        S(b));
    }
    function x(a) {
      var b;
      if (a instanceof Y.ZC.STORE_ENTRY)
        (b = ma.get(a.makerAID)) &&
          b.room.create(
            a.storeName,
            a.makerAID,
            b.room.constructor.Type.BUY_SHOP,
            !0,
          );
      else if (a instanceof Y.ZC.BUYING_STORE_ENTRY)
        (b = ma.get(a.makerAID)) &&
          b.room.create(
            a.storeName,
            a.makerAID,
            b.room.constructor.Type.SELL_SHOP,
            !0,
          );
      else if (a instanceof Y.ZC.ROOM_NEWENTRY && (b = ma.get(a.AID))) {
        var c = b.room.constructor.Type.PUBLIC_CHAT,
          d = a.title + "(" + a.curcount + "/" + a.maxcount + ")";
        switch (a.type) {
          case 0:
            c = b.room.constructor.Type.PRIVATE_CHAT;
            break;
          case 3:
            d = a.title;
        }
        b.room.title = a.title;
        b.room.limit = a.maxcount;
        b.room.count = a.curcount;
        b.room.create(d, a.roomID, c, !0);
      }
    }
    function M(a) {
      if ("roomID" in a)
        ma.forEach(function (b) {
          return b.room.id === a.roomID ? (b.room.remove(), !1) : !0;
        });
      else {
        var b = ma.get(a.makerAID);
        b && b.room.remove();
      }
    }
    function E(a, b, c) {
      a.lookTo(b.position[0], b.position[1]);
      a.toggleOpt3(da.BLADESTOP, c);
      1 == c &&
        a.setAction({
          action: a.ACTION.READYFIGHT,
          frame: 0,
          repeat: !1,
          play: !0,
          next: !1,
        });
      0 == c &&
        a.setAction({
          action: a.ACTION.IDLE,
          frame: 0,
          repeat: !1,
          play: !0,
          next: !1,
        });
    }
    function F(a) {
      var b = ma.get(a.srcAID),
        c = ma.get(a.destAID);
      b && c && (E(b, c, a.flag), E(c, b, a.flag));
    }
    function G(a) {
      1 == a.expType &&
        (1 == a.varID &&
          va.addText(
            "Experience gained from Quest, Base:" + a.amount,
            null,
            "#A442DC",
          ),
        2 == a.varID &&
          va.addText(
            "Experience gained from Quest, Job:" + a.amount,
            null,
            "#A442DC",
          ));
    }
    function H(a) {
      Fa.removeNpcMark("mvp");
      0 == a.infoType
        ? va.addText(ca.getMessage(1223), va.TYPE.ERROR)
        : 1 == a.infoType
          ? Fa.addNpcMark("mvp", a.xPos, a.yPos, 16711680, Infinity)
          : 3 == a.infoType &&
            va.addText(
              "Boss\u7ea7\u9b54\u7269 '" +
                a.name +
                "'\u8ddd\u79bb\u590d\u6d3b\u8fd8\u6709 " +
                a.minHour +
                "\u5c0f\u65f6:" +
                a.minMinute +
                "\u5206",
              va.TYPE.PUBLIC,
            );
    }
    function K(a) {
      ia.spam({ effectId: X.EF_MVP, ownerAID: a.AID });
    }
    function P(a) {
      a = ca.getItemInfo(a.ITID);
      va.addText(ca.getMessage(143), va.TYPE.BLUE);
      va.addText(a.identifiedDiSPlayName, va.TYPE.BLUE);
    }
    function N(a, b) {
      if (
        (0 < a.damage || 0 < a.leftDamage) &&
        4 !== a.action &&
        9 !== a.action &&
        11 !== a.action
      )
        for (
          var c = function () {
              b.action !== b.ACTION.DIE &&
                b.setAction({
                  action: b.ACTION.HURT,
                  frame: 0,
                  repeat: !1,
                  play: !0,
                  next: {
                    action: b.ACTION.READYFIGHT,
                    delay: a.attackedMT + 0,
                    frame: 0,
                    repeat: !0,
                    play: !0,
                  },
                });
            },
            d = a.count || 1,
            e = 0;
          e < d;
          e++
        )
          (a.damage && pa.setTimeout(c, a.attackMT + 200 * e),
            a.leftDamage && pa.setTimeout(c, a.attackMT + 350 * e));
    }
    function S(a) {
      if (ba.Playing && 99 <= a.clevel) {
        var b =
          a._effectState &
            (ta.EffectState.INVISIBLE |
              ta.EffectState.HIDE |
              ta.EffectState.CLOAK |
              ta.EffectState.CHASEWALK) ||
          !!a.Shadowform ||
          !!a.Camouflage ||
          !!a.Stealthfield;
        W.aura && !b
          ? a.auraVisible ||
            (ia.spam({
              ownerAID: a.GID,
              position: a.position,
              effectId: X.EF_LEVEL99,
            }),
            ia.spam({
              ownerAID: a.GID,
              position: a.position,
              effectId: X.EF_LEVEL99_2,
            }),
            ia.spam({
              ownerAID: a.GID,
              position: a.position,
              effectId: X.EF_LEVEL99_3,
            }),
            (a.auraVisible = !0))
          : a.auraVisible &&
            (ia.remove(null, a.GID, X.EF_LEVEL99),
            ia.remove(null, a.GID, X.EF_LEVEL99_2),
            ia.remove(null, a.GID, X.EF_LEVEL99_3),
            (a.auraVisible = !1));
      }
    }
    function R(a) {
      ba.Entity.display.title = a.ACHID ? ha[a.ACHID] : "";
      ba.Entity.display.update(
        ba.Entity.objecttype === ja.TYPE_MOB
          ? "#ffc6c6"
          : ba.Entity.objecttype === ja.TYPE_NPC
            ? "#94bdf7"
            : "white",
      );
    }
    function ea(a) {
      var b = ma.get(a.AID);
      b &&
        (pa.clearTimeout(b._TimeOut),
        (b._TimeOut = pa.setTimeout(function () {
          ia.removeSpirits(a.AID);
          b.spirs = 5 < a.num ? 5 : a.num;
          0 < b.spirs && ia.spam({ effectId: 2010 + b.spirs, ownerAID: a.AID });
        }, 200)));
    }
    function U(a) {
      Ya.onCreateBookingLog(a);
    }
    function V(a) {
      Ya.onDelBookingLog(a);
    }
    var ca = a("DB/DBManager"),
      T = a("DB/Skills/SkillConst"),
      fa = a("DB/Skills/SkillInfo"),
      da = a("DB/Status/StatusConst"),
      ta = a("DB/Status/StatusState"),
      ka = a("DB/Mercenary/MercenaryTable"),
      oa = a("DB/Emotions"),
      ga = a("DB/Skills/SkillEffect"),
      la = a("DB/Skills/SkillAction"),
      ha = a("DB/Items/TitleTable"),
      X = a("DB/Effects/EffectConst"),
      Z = a("DB/Pets/PetMessageConst"),
      qa = a("Audio/SoundManager"),
      pa = a("Core/Events"),
      w = a("Engine/MapEngine/Guild"),
      ba = a("Engine/SessionStorage"),
      Q = a("Network/NetworkManager"),
      Y = a("Network/PacketStructure"),
      ra = a("Network/PacketVerManager"),
      W = a("Preferences/Map"),
      aa = a("Renderer/Map/Altitude"),
      sa = a("Renderer/Renderer"),
      ma = a("Renderer/EntityManager"),
      ja = a("Renderer/Entity/Entity"),
      ia = a("Renderer/EffectManager");
    a("Renderer/Map/Effects");
    var na = a("Renderer/Effects/Damage"),
      xa = a("Renderer/Effects/MagicTarget"),
      ua = a("Renderer/Effects/LockOnTarget"),
      Ba = a("Renderer/Effects/MagicRing");
    a("Renderer/Effects/StrEffect");
    a("Renderer/Map/Effects");
    var Aa = a("Renderer/CartObject"),
      wa = a("Renderer/FalconObject"),
      ya = a("Renderer/WolfObject"),
      za = a("UI/UIManager"),
      Ja = a("UI/Components/BasicInfo/BasicInfo"),
      va = a("UI/Components/ChatBox/ChatBox"),
      Ha = a("UI/Components/ChatRoom/ChatRoom"),
      Ca = a("UI/Components/Escape/Escape");
    a("UI/Components/Inventory/Inventory");
    var Fa = a("UI/Components/MiniMap/MiniMap"),
      Ka = a("UI/Components/ShortCut/ShortCut"),
      Ma = a("UI/Components/StatusIcons/StatusIcons"),
      La = a("UI/Components/OnPushCart/OnPushCart"),
      Ga = a("UI/Components/ItemSelection/ItemSelection"),
      Da = a("UI/Components/vbk/vbk"),
      Oa = a("UI/Components/ItemObtain/ItemObtain"),
      Ya = a("UI/Components/PartyBookingReg/PartyBookingReg"),
      Pa = [
        T.TF_HIDING,
        T.AS_CLOAKING,
        T.RG_CHASEWALK,
        T.GC_CLOAKINGEXCEED,
        T.RA_CAMOUFLAGE,
        T.NC_STEALTHFIELD,
        T.SC_SHADOWFORM,
        T.SC_INVISIBILITY,
        T.KO_YAMIKUMO,
        T.LG_OVERBRAND_BRANDISH,
        T.LG_OVERBRAND_PLUSATK,
        T.WM_REVERBERATION_MELEE,
        T.WM_REVERBERATION_MAGIC,
        T.WL_TETRAVORTEX_FIRE,
        T.WL_TETRAVORTEX_WATER,
        T.WL_TETRAVORTEX_WIND,
        T.WL_TETRAVORTEX_GROUND,
        T.WL_SUMMON_ATK_FIRE,
        T.WL_SUMMON_ATK_WIND,
        T.WL_SUMMON_ATK_WATER,
        T.WL_SUMMON_ATK_GROUND,
      ],
      Za = [
        T.TK_STORMKICK,
        T.TK_DOWNKICK,
        T.TK_TURNKICK,
        T.TK_COUNTER,
        T.TK_JUMPKICK,
        T.SR_RAMPAGEBLASTER,
      ];
    return function () {
      Q.hookPacket(Y.ZC.NOTIFY_STANDENTRY, b);
      Q.hookPacket(Y.ZC.NOTIFY_NEWENTRY, b);
      Q.hookPacket(Y.ZC.NOTIFY_ACTENTRY, b);
      Q.hookPacket(Y.ZC.NOTIFY_MOVEENTRY, b);
      Q.hookPacket(Y.ZC.NOTIFY_STANDENTRY_NPC, b);
      Q.hookPacket(Y.ZC.NOTIFY_STANDENTRY2, b);
      Q.hookPacket(Y.ZC.NOTIFY_NEWENTRY2, b);
      Q.hookPacket(Y.ZC.NOTIFY_MOVEENTRY2, b);
      Q.hookPacket(Y.ZC.NOTIFY_STANDENTRY3, b);
      Q.hookPacket(Y.ZC.NOTIFY_NEWENTRY3, b);
      Q.hookPacket(Y.ZC.NOTIFY_MOVEENTRY3, b);
      Q.hookPacket(Y.ZC.NOTIFY_STANDENTRY4, b);
      Q.hookPacket(Y.ZC.NOTIFY_NEWENTRY4, b);
      Q.hookPacket(Y.ZC.NOTIFY_MOVEENTRY4, b);
      Q.hookPacket(Y.ZC.NOTIFY_STANDENTRY5, b);
      Q.hookPacket(Y.ZC.NOTIFY_NEWENTRY5, b);
      Q.hookPacket(Y.ZC.NOTIFY_MOVEENTRY5, b);
      Q.hookPacket(Y.ZC.NOTIFY_STANDENTRY6, b);
      Q.hookPacket(Y.ZC.NOTIFY_NEWENTRY6, b);
      Q.hookPacket(Y.ZC.NOTIFY_MOVEENTRY6, b);
      Q.hookPacket(Y.ZC.NOTIFY_STANDENTRY7, b);
      Q.hookPacket(Y.ZC.NOTIFY_NEWENTRY7, b);
      Q.hookPacket(Y.ZC.NOTIFY_MOVEENTRY7, b);
      Q.hookPacket(Y.ZC.NOTIFY_STANDENTRY8, b);
      Q.hookPacket(Y.ZC.NOTIFY_NEWENTRY8, b);
      Q.hookPacket(Y.ZC.NOTIFY_MOVEENTRY8, b);
      Q.hookPacket(Y.ZC.NOTIFY_STANDENTRY9, b);
      Q.hookPacket(Y.ZC.NOTIFY_NEWENTRY9, b);
      Q.hookPacket(Y.ZC.NOTIFY_MOVEENTRY9, b);
      Q.hookPacket(Y.ZC.NOTIFY_VANISH, c);
      Q.hookPacket(Y.ZC.NOTIFY_MOVE, d);
      Q.hookPacket(Y.ZC.STOPMOVE, e);
      Q.hookPacket(Y.ZC.NOTIFY_ACT, k);
      Q.hookPacket(Y.ZC.NOTIFY_ACT2, k);
      Q.hookPacket(Y.ZC.NOTIFY_ACT3, k);
      Q.hookPacket(Y.ZC.NOTIFY_CHAT, g);
      Q.hookPacket(Y.ZC.SHOWSCRIPT, g);
      Q.hookPacket(Y.ZC.NPC_CHAT, t);
      Q.hookPacket(Y.ZC.ACK_REQNAME, l);
      Q.hookPacket(Y.ZC.ACK_REQNAME3, l);
      Q.hookPacket(Y.ZC.ACK_REQNAMEALL, l);
      Q.hookPacket(Y.ZC.ACK_REQNAMEALL2, l);
      Q.hookPacket(Y.ZC.CHANGE_DIRECTION, p);
      Q.hookPacket(Y.ZC.SPRITE_CHANGE, v);
      Q.hookPacket(Y.ZC.SPRITE_CHANGE2, v);
      Q.hookPacket(Y.ZC.NPCSPRITE_CHANGE, u);
      Q.hookPacket(Y.ZC.USE_SKILL, A);
      Q.hookPacket(Y.ZC.USE_SKILL2, A);
      Q.hookPacket(Y.ZC.NOTIFY_SKILL, C);
      Q.hookPacket(Y.ZC.NOTIFY_SKILL2, C);
      Q.hookPacket(Y.ZC.NOTIFY_SKILL_POSITION, C);
      Q.hookPacket(Y.ZC.SELECTCART, D);
      Q.hookPacket(Y.ZC.USESKILL_ACK, y);
      Q.hookPacket(Y.ZC.USESKILL_ACK2, y);
      Q.hookPacket(Y.ZC.USESKILL_ACK3, y);
      Q.hookPacket(Y.ZC.STATE_CHANGE, L);
      Q.hookPacket(Y.ZC.STATE_CHANGE3, L);
      Q.hookPacket(Y.ZC.MSG_STATE_CHANGE, J);
      Q.hookPacket(Y.ZC.MSG_STATE_CHANGE2, J);
      Q.hookPacket(Y.ZC.MSG_STATE_CHANGE3, J);
      Q.hookPacket(Y.ZC.MSG_STATE_CHANGE4, J);
      Q.hookPacket(Y.ZC.MSG_STATE_CHANGE5, J);
      Q.hookPacket(Y.ZC.STORE_ENTRY, x);
      Q.hookPacket(Y.ZC.DISAPPEAR_ENTRY, M);
      Q.hookPacket(Y.ZC.BUYING_STORE_ENTRY, x);
      Q.hookPacket(Y.ZC.DISAPPEAR_BUYING_STORE_ENTRY, M);
      Q.hookPacket(Y.ZC.ROOM_NEWENTRY, x);
      Q.hookPacket(Y.ZC.DESTROY_ROOM, M);
      Q.hookPacket(Y.ZC.SKILL_ENTRY, B);
      Q.hookPacket(Y.ZC.SKILL_ENTRY2, B);
      Q.hookPacket(Y.ZC.SKILL_ENTRY3, B);
      Q.hookPacket(Y.ZC.SKILL_ENTRY4, B);
      Q.hookPacket(Y.ZC.SKILL_ENTRY5, B);
      Q.hookPacket(Y.ZC.SKILL_DISAPPEAR, O);
      Q.hookPacket(Y.ZC.DISPEL, z);
      Q.hookPacket(Y.ZC.HIGHJUMP, m);
      Q.hookPacket(Y.ZC.FASTMOVE, h);
      Q.hookPacket(Y.ZC.RESURRECTION, q);
      Q.hookPacket(Y.ZC.EMOTION, r);
      Q.hookPacket(Y.ZC.NOTIFY_MONSTER_HP, f);
      Q.hookPacket(Y.ZC.QUEST_NOTIFY_EFFECT, n);
      Q.hookPacket(Y.ZC.BLADESTOP, F);
      Q.hookPacket(Y.ZC.NOTIFY_EXP, G);
      Q.hookPacket(Y.ZC.BOSS_INFO, H);
      Q.hookPacket(Y.ZC.MVP, K);
      Q.hookPacket(Y.ZC.MVP_GETTING_ITEM, P);
      Q.hookPacket(Y.ZC.SPIRITS, ea);
      Q.hookPacket(Y.ZC.SPIRITS2, ea);
      Q.hookPacket(Y.ZC.ACK_CHANGE_TITLE, R);
      Q.hookPacket(Y.ZC.RS_CREATE_INSTANCE, U);
      Q.hookPacket(Y.ZC.RS_DEL_INSTANCE, V);
    };
  },
);
