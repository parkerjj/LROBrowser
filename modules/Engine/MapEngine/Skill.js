define(
  "Engine/MapEngine/Skill",
  "require DB/DBManager DB/Skills/SkillConst DB/Effects/EffectConst Utils/jquery Utils/PathFinding Engine/SessionStorage Network/NetworkManager Renderer/Renderer Network/PacketStructure Renderer/EntityManager Renderer/EffectManager Renderer/Map/Altitude Renderer/Effects/LineEffect UI/UIManager UI/Components/ShortCut/ShortCut UI/Components/ChatBox/ChatBox UI/Components/SkillList/SkillList UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/ItemSelection/ItemSelection UI/Components/ItemMakeSure/ItemMakeSure UI/Components/Inventory/Inventory UI/Components/NpcMenu/NpcMenu UI/Components/WarpList/WarpList UI/Components/vbk/vbk".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = [
        W.EF_ANGEL,
        W.EF_JOBLVUP,
        W.EF_REFINEFAIL,
        W.EF_REFINEOK,
        W.NONE,
        W.EF_PHARMACY_OK,
        W.EF_PHARMACY_FAIL,
        W.EF_ANGEL2,
        W.EF_JOBLVUP2,
        W.EF_ANGEL3,
      ];
      -1 < b[a.effectID] &&
        fa.spam({ effectId: b[a.effectID], ownerAID: a.AID });
    }
    function c(a) {
      fa.spam({ effectId: a.effectID, ownerAID: a.AID });
    }
    function d(a) {
      var b = R.get(a.AID);
      b && (b.skillId = a.SKID);
      b = Array(3);
      b[0] = a.xPos;
      b[1] = a.yPos;
      b[2] = ea.getCellHeight(a.xPos, a.yPos);
      fa.spamSkill(a.SKID, a.AID, b, null, a.AID);
    }
    function e(a) {
      if (!a.result) {
        var b = 0;
        if (a.NUM)
          switch (a.SKID) {
            default:
              b = 204;
              break;
            case Q.NV_BASIC:
              b = 7 > a.NUM ? 159 + a.NUM : 7 == a.NUM ? 383 : 0;
              break;
            case Q.AL_WARP:
              b = 214;
              break;
            case Q.TF_STEAL:
              b = 205;
              break;
            case Q.TF_POISON:
              b = 207;
          }
        else
          switch (a.cause) {
            case 1:
              b = 202;
              break;
            case 2:
              b = 203;
              break;
            case 3:
              b = 808;
              break;
            case 4:
              b = 219;
              break;
            case 5:
              b = 233;
              break;
            case 6:
              b = 239;
              break;
            case 7:
              b = 246;
              break;
            case 8:
              b = 247;
              break;
            case 9:
              b = 580;
              break;
            case 10:
              b = 285;
              break;
            case 83:
              b = 661;
          }
        b && ka.addText(N.getMessage(b), ka.TYPE.ERROR);
      }
    }
    function m(a) {
      ca.addskillOption(a.skillList, "autoskillid");
    }
    function h(a) {
      ca.addskillOption(a.skillList, "addiskillid", "\u8bf7\u9009\u62e9");
    }
    function q(a) {
      ca.addskillOption(a.skillList, "touchskillid", "\u8bf7\u9009\u62e9");
    }
    function r(a) {
      ca.addskillOption(a.skillList, "qoautoskillid");
    }
    function k(a) {
      ca.addskillOption2(a);
    }
    function g(a) {
      ha.updateSkills(a.skillList);
    }
    function u(a) {
      ha.updateSkill(a);
      ba.skillUpdate = !0;
    }
    function l(a) {
      la.setList(a.ShortCutKey);
    }
    function f(a) {
      switch (a.tab) {
        case 0:
          (la.clean(), la.setList(a.ShortCutKey));
      }
    }
    function n(a) {
      ha.setSkillCDById(a.SKID, a.DelayTM);
      la.addSkillCooldown(a.SKID, a.DelayTM);
    }
    function p(a) {
      ha.addSkill(a);
    }
    function v(a) {
      ha.useSkill(a.data, a.data.level);
    }
    function t(a) {
      a.ITIDList.length &&
        (Z.append(),
        Z.setList(a.ITIDList),
        Z.setTitle(N.getMessage(521)),
        (Z.onIndexSelected = function (a) {
          var b = new T.CZ.REQ_ITEMIDENTIFY();
          b.index = a;
          S.sendPacket(b);
        }));
    }
    function z(a) {
      a.itemList.length &&
        (Z.append(),
        Z.setList_p(a.itemList),
        Z.setTitle("\u4fee\u7406\u88c5\u5907"),
        (Z.onIndexSelected = function (a) {
          var b = new T.CZ.REQ_ITEMREPAIR();
          b.TargetItemInfo.index = a;
          S.sendPacket(b);
        }));
    }
    function E(a) {
      a.itemList.length
        ? (Z.append(),
          Z.setList_p(a.itemList),
          Z.setTitle("\u7cbe\u70bc\u5217\u8868"),
          (Z.onIndexSelected = function (a) {
            var b = new T.CZ.REQ_WEAPONREFINE();
            b.Index = a;
            S.sendPacket(b);
          }))
        : pa.showMessageBox(
            "\u6750\u6599\u6216\u6280\u80fd\u4e0d\u8db3\uff0c\u65e0\u6cd5\u7cbe\u70bc\u9053\u5177",
            "ok",
            null,
          );
    }
    function C(a) {
      var b = N.getItemInfo(a.ITID);
      if (b)
        switch (a.msg) {
          case 0:
            ba.Entity.dialog.set(
              b.identifiedDiSPlayName + " " + N.getMessage(498),
            );
            ka.addText(
              b.identifiedDiSPlayName + " " + N.getMessage(498),
              ka.TYPE.BLUE,
            );
            break;
          case 1:
            (ba.Entity.dialog.set(
              b.identifiedDiSPlayName + " " + N.getMessage(499),
            ),
              ka.addText(
                b.identifiedDiSPlayName + " " + N.getMessage(499),
                ka.TYPE.ERROR,
              ));
        }
    }
    function J(a) {
      a.arrowList.length &&
        (Z.append(),
        Z.setList_(a.arrowList),
        Z.setTitle("\u5236\u4f5c\u5217\u8868"),
        (Z.onIndexSelected = function (a) {
          var b = new T.CZ.REQ_MAKINGARROW();
          b.id = a;
          S.sendPacket(b);
        }));
    }
    function A(a) {
      if (!(0 > a.index))
        switch (a.result) {
          case 0:
            ka.addText(N.getMessage(491), ka.TYPE.BLUE);
            if ((a = oa.removeItem(a.index, 1)))
              ((a.IsIdentified = !0), (a.count = 1), oa.addItem(a));
            break;
          case 1:
            ka.addText(N.getMessage(492), ka.TYPE.ERROR);
        }
    }
    function B(a) {
      0 == a.info.length
        ? pa.showMessageBox(
            "\u9053\u5177\u6253\u9020\u5931\u8d25\u3002",
            "cancel",
            function () {
              var a = new T.CZ.REQMAKINGITEM();
              a.info.ITID = 0;
              a.info.material_ID = { 0: 0, 1: 0, 2: 0 };
              S.sendPacket(a);
            },
          )
        : (Z.append(),
          Z.setMakeList(a.info, !0),
          Z.setTitle(N.getMessage(697)),
          (Z.onIndexSelected = function (a) {
            if (1101 > a) {
              var b = new T.CZ.REQMAKINGITEM();
              b.info.ITID = a;
              b.info.material_ID = { 0: 0, 1: 0, 2: 0 };
              S.sendPacket(b);
            } else
              (qa.append(),
                qa.setMakems(a),
                (qa.index = a),
                (qa.onIndexSelected = function (a) {
                  var b = new T.CZ.REQMAKINGITEM();
                  b.info.ITID = a;
                  a = {
                    0: Number(qa.ui.find(".item:eq(0)").attr("data-id")) || 0,
                    1: Number(qa.ui.find(".item:eq(1)").attr("data-id")) || 0,
                    2: Number(qa.ui.find(".item:eq(2)").attr("data-id")) || 0,
                  };
                  b.info.material_ID = a;
                  S.sendPacket(b);
                }));
          }));
    }
    function F(a) {
      Z.append();
      Z.setSpiritList(a.Type);
      1 == a.Type
        ? Z.setTitle("\u539f\u77f3\u5206\u89e3")
        : 2 == a.Type && Z.setTitle("\u539f\u77f3\u5408\u6210");
      Z.onIndexSelected = function (b) {
        var c = new T.CZ.ITEMLISTWIN_RES();
        c.Type = a.Type;
        -1 == b
          ? ((c.Action = 0), (c.MaterialList = []))
          : (b = oa.getItemById(b))
            ? ((c.Action = 1),
              (c.MaterialList = [{ id: b.index, count: b.count }]))
            : ((c.Action = 0), (c.MaterialList = []));
        S.sendPacket(c);
      };
    }
    function O(a) {
      1 == a.result && ka.addText(N.getMessage(428), ka.TYPE.ERROR);
    }
    function M(a) {
      a.SKID.length &&
        (Z.append(),
        Z.setList(a.SKID, !0),
        Z.setTitle(N.getMessage(697)),
        (Z.onIndexSelected = function (a) {
          if (0 <= a) {
            var b = new T.CZ.SELECTAUTOSPELL();
            b.SKID = a;
            S.sendPacket(b);
          }
        }));
    }
    function H(a) {
      a.SKID.length &&
        (Z.append(),
        Z.setList(a.SKID, !0),
        Z.setTitle(N.getMessage(697)),
        (Z.onIndexSelected = function (a) {
          var b = new T.CZ.SKILL_SELECT_RESPONSE();
          b.why = 0;
          b.SKID = 0 < a ? a : 0;
          S.sendPacket(b);
        }));
    }
    function x(a) {
      a.idList.length &&
        (Z.append(),
        Z.setMakeList2(a.idList, !0),
        Z.setTitle("\u914d\u836f\u5217\u8868"),
        (Z.onIndexSelected = function (b) {
          var c = new T.CZ.REQ_MAKINGITEM();
          c.mkType = a.type;
          c.id = b;
          S.sendPacket(c);
        }));
    }
    function I(a) {
      w.onSelectMenu = function (b, c) {
        w.remove();
        var d = new T.CZ.SELECT_WARPPOINT();
        d.SKID = b;
        d.mapName = a.mapName[c - 1] || "cancel";
        S.sendPacket(d);
      };
      w.onAppend = function () {
        var b,
          c,
          d = [];
        b = 0;
        for (c = a.mapName.length; b < c; ++b)
          d[b] = N.getMapName(a.mapName[b], a.mapName[b]);
        w.setMenu(d.join(":") + ":Cancel", a.SKID);
        w.ui.find(".title").text(N.getMessage(213));
      };
      w.append();
    }
    function D(a) {
      switch (a.type) {
        case 0:
          ka.addText(N.getMessage(500), ka.TYPE.ERROR);
          break;
        case 1:
          ka.addText(N.getMessage(501), ka.TYPE.ERROR);
      }
    }
    function L(a) {
      switch (a.errorCode) {
        case 0:
          ka.addText(N.getMessage(217), ka.TYPE.BLUE);
          break;
        case 1:
          ka.addText(N.getMessage(214), ka.TYPE.ERROR);
          break;
        case 2:
          ka.addText(N.getMessage(216), ka.TYPE.ERROR);
      }
    }
    function y(a) {
      ea.setCellType(a.xPos, a.yPos, a.type);
    }
    function G(a) {
      fa.remove(ta, a.myAID);
      for (var b = a.AID, c = 0; c < b.length; c++)
        0 < b[c] && fa.spam(2058, 1, a.myAID, b[c]);
    }
    function K(a) {
      var b = R.get(a.GID);
      if (a.enabled) {
        if (23 == a.hatEffectIDs[0] || 47 == a.hatEffectIDs[0])
          b._explosion = 1;
      } else if (23 == a.hatEffectIDs[0] || 47 == a.hatEffectIDs[0])
        b._explosion = 0;
    }
    var N = a("DB/DBManager"),
      Q = a("DB/Skills/SkillConst"),
      W = a("DB/Effects/EffectConst");
    a("Utils/jquery");
    var V = a("Utils/PathFinding"),
      ba = a("Engine/SessionStorage"),
      S = a("Network/NetworkManager"),
      T = a("Network/PacketStructure"),
      da = a("Renderer/Renderer"),
      R = a("Renderer/EntityManager"),
      fa = a("Renderer/EffectManager"),
      ea = a("Renderer/Map/Altitude"),
      ta = a("Renderer/Effects/LineEffect"),
      pa = a("UI/UIManager"),
      la = a("UI/Components/ShortCut/ShortCut"),
      ga = a("UI/Components/Guild/Guild"),
      ka = a("UI/Components/ChatBox/ChatBox"),
      ha = a("UI/Components/SkillList/SkillList"),
      X = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      Z = a("UI/Components/ItemSelection/ItemSelection"),
      qa = a("UI/Components/ItemMakeSure/ItemMakeSure"),
      oa = a("UI/Components/Inventory/Inventory");
    a("UI/Components/NpcMenu/NpcMenu");
    var w = a("UI/Components/WarpList/WarpList"),
      ca = a("UI/Components/vbk/vbk");
    la.onChange = function (a, b, c, d) {
      var e = new T.CZ.SHORTCUT_KEY_CHANGE();
      e.Index = a;
      e.ShortCutKey.isSkill = b ? 1 : 0;
      e.ShortCutKey.ID = c;
      e.ShortCutKey.count = d;
      S.sendPacket(e);
    };
    ga.onRequestCHANGE_MEMBERPOS = function (a, b, c) {
      var d = new T.CZ.REQ_CHANGE_MEMBERPOS(),
        e = [];
      e.push({ AID: a, GID: b, positionID: c });
      d.memberInfo = e;
      S.sendPacket(d);
    };
    ga.onIncreaseSkill = function (a) {
      var b = new T.CZ.UPGRADE_SKILLLEVEL();
      b.SKID = a;
      S.sendPacket(b);
    };
    ha.onIncreaseSkill = function (a) {
      var b = new T.CZ.UPGRADE_SKILLLEVEL();
      b.SKID = a;
      S.sendPacket(b);
    };
    var P = 0;
    ga.onUseSkill = function (a, b, c) {
      if (!(da.tick < P + 70)) {
        P = da.tick;
        var d, e, f, g, h;
        d = ba.Entity;
        f = R.get(c) || d;
        e = ga.getSkillById(a);
        g = [];
        if (f != d || !e || 1 != e.type)
          if (
            ((e = e ? e.attackRange + 1 : d.attack_range),
            (h = V.searchLong(
              d.position[0] | 0,
              d.position[1] | 0,
              f.position[0] | 0,
              f.position[1] | 0,
              e,
              g,
              ea.TYPE.WALKABLE,
            )))
          )
            ((e = new T.CZ.USE_SKILL()),
              (e.SKID = a),
              (e.selectedLevel = b),
              (e.targetID = c || ba.Entity.GID),
              2 > h ||
                f === d ||
                ((ba.moveAction = e),
                (e = new T.CZ.REQUEST_MOVE()),
                (e.dest[0] = g[2 * (h - 1) + 0]),
                (e.dest[1] = g[2 * (h - 1) + 1])),
              S.sendPacket(e));
      }
    };
    ha.onUseSkill = function (a, b, c) {
      if (!(da.tick < P + 70)) {
        P = da.tick;
        var d, e, f, g, h;
        d = ba.Entity;
        f = R.get(c) || d;
        e = ha.getSkillById(a);
        g = [];
        if (f != d || !e || 1 != e.type)
          if (
            ((e = e ? e.attackRange : d.attack_range),
            (h = V.searchLong(
              d.position[0] | 0,
              d.position[1] | 0,
              f.position[0] | 0,
              f.position[1] | 0,
              e,
              g,
              ea.TYPE.WALKABLE,
            )))
          )
            ((e = new T.CZ.USE_SKILL()),
              (e.SKID = a),
              (e.selectedLevel = b),
              (e.targetID = c || ba.Entity.GID),
              2 > h ||
                f === d ||
                ((ba.moveAction = e),
                (e = new T.CZ.REQUEST_MOVE()),
                (e.dest[0] = g[2 * h + 0]),
                (e.dest[1] = g[2 * h + 1])),
              S.sendPacket(e));
      }
    };
    X.onUseSkillToPos = function (a, b, c, d) {
      if (!(da.tick < P + 70)) {
        P = da.tick;
        var e, f, g, h;
        f = ba.Entity;
        e = f.position;
        h = ha.getSkillById(a);
        g = [];
        if (
          (f = V.searchLong(
            e[0] | 0,
            e[1] | 0,
            c | 0,
            d | 0,
            h ? h.attackRange + 1 : f.attack_range,
            g,
            ea.TYPE.WALKABLE,
          ))
        )
          ((e = new T.CZ.USE_SKILL_TOGROUND()),
            (e.SKID = a),
            (e.selectedLevel = b),
            (e.xPos = c),
            (e.yPos = d),
            (ba.Entity.lastSKID = a),
            (ba.Entity.lastSkLvl = b),
            2 > f ||
              ((ba.moveAction = e),
              (e = new T.CZ.REQUEST_MOVE()),
              (e.dest[0] = g[2 * f + 0]),
              (e.dest[1] = g[2 * f + 1])),
            S.sendPacket(e));
      }
    };
    return function () {
      S.hookPacket(T.ZC.ATTACK_SKILLINFO_LIST, m);
      S.hookPacket(T.ZC.ADDIS_SKILLINFO_LIST, h);
      S.hookPacket(T.ZC.TOUCH_SKILLINFO_LIST, q);
      S.hookPacket(T.ZC.QOATTACK_SKILLINFO_LIST, r);
      S.hookPacket(T.ZC.SKILL_AUTOSHADOWSPELL, k);
      S.hookPacket(T.ZC.SKILLINFO_LIST, g);
      S.hookPacket(T.ZC.SKILLINFO_UPDATE, u);
      S.hookPacket(T.ZC.ADD_SKILL, p);
      S.hookPacket(T.ZC.ADD_SKILL2, p);
      S.hookPacket(T.ZC.SHORTCUT_KEY_LIST, l);
      S.hookPacket(T.ZC.SHORTCUT_KEY_LIST_V2, l);
      S.hookPacket(T.ZC.SHORTCUT_KEY_LIST_V3, l);
      S.hookPacket(T.ZC.HORTCUT_KEY_LIST, f);
      S.hookPacket(T.ZC.SKILL_POSTDELAY, n);
      S.hookPacket(T.ZC.ACK_TOUSESKILL, e);
      S.hookPacket(T.ZC.NOTIFY_EFFECT, b);
      S.hookPacket(T.ZC.NOTIFY_EFFECT2, c);
      S.hookPacket(T.ZC.NOTIFY_EFFECT3, c);
      S.hookPacket(T.ZC.NOTIFY_GROUNDSKILL, d);
      S.hookPacket(T.ZC.AUTORUN_SKILL, v);
      S.hookPacket(T.ZC.ITEMIDENTIFY_LIST, t);
      S.hookPacket(T.ZC.REPAIRITEMLIST, z);
      S.hookPacket(T.ZC.NOTIFY_WEAPONITEMLIST, E);
      S.hookPacket(T.ZC.ACK_WEAPONREFINE, C);
      S.hookPacket(T.ZC.ACK_ITEMIDENTIFY, A);
      S.hookPacket(T.ZC.MAKINGARROW_LIST, J);
      S.hookPacket(T.ZC.AUTOSPELLLIST, M);
      S.hookPacket(T.ZC.AUTOSPELLLIST2, M);
      S.hookPacket(T.ZC.SKILL_SELECT_REQUEST, H);
      S.hookPacket(T.ZC.WARPLIST, I);
      S.hookPacket(T.ZC.WARPLIST2, I);
      S.hookPacket(T.ZC.NOTIFY_MAPINFO, D);
      S.hookPacket(T.ZC.UPDATE_MAPINFO, y);
      S.hookPacket(T.ZC.ACK_REMEMBER_WARPPOINT, L);
      S.hookPacket(T.ZC.MAKABLEITEMLIST, B);
      S.hookPacket(T.ZC.ITEMLISTWIN_OPEN, F);
      S.hookPacket(T.ZC.ACK_REQMAKINGITEM, O);
      S.hookPacket(T.ZC.DEVOTIONLIST, G);
      S.hookPacket(T.ZC.HAT_EFFECT, K);
      S.hookPacket(T.ZC.MAKINGITEM_LIST, x);
    };
  },
);
