define(
  "Engine/MapEngine/Skill",
  "require DB/DBManager DB/Skills/SkillConst DB/Effects/EffectConst Utils/jquery Utils/PathFinding Engine/SessionStorage Network/NetworkManager Renderer/Renderer Network/PacketStructure Renderer/EntityManager Renderer/EffectManager Renderer/Map/Altitude Renderer/Effects/LineEffect UI/UIManager UI/Components/ShortCut/ShortCut UI/Components/ChatBox/ChatBox UI/Components/SkillList/SkillList UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/ItemSelection/ItemSelection UI/Components/ItemMakeSure/ItemMakeSure UI/Components/Inventory/Inventory UI/Components/NpcMenu/NpcMenu UI/Components/WarpList/WarpList UI/Components/vbk/vbk".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = [
        S.EF_ANGEL,
        S.EF_JOBLVUP,
        S.EF_REFINEFAIL,
        S.EF_REFINEOK,
        S.NONE,
        S.EF_PHARMACY_OK,
        S.EF_PHARMACY_FAIL,
        S.EF_ANGEL2,
        S.EF_JOBLVUP2,
        S.EF_ANGEL3,
      ];
      -1 < b[a.effectID] &&
        fa.spam({ effectId: b[a.effectID], ownerAID: a.AID });
    }
    function c(a) {
      fa.spam({ effectId: a.effectID, ownerAID: a.AID });
    }
    function d(a) {
      var b = T.get(a.AID);
      b && (b.skillId = a.SKID);
      b = Array(3);
      b[0] = a.xPos;
      b[1] = a.yPos;
      b[2] = da.getCellHeight(a.xPos, a.yPos);
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
            case N.NV_BASIC:
              b = 7 > a.NUM ? 159 + a.NUM : 7 == a.NUM ? 383 : 0;
              break;
            case N.AL_WARP:
              b = 214;
              break;
            case N.TF_STEAL:
              b = 205;
              break;
            case N.TF_POISON:
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
        b && la.addText(P.getMessage(b), la.TYPE.ERROR);
      }
    }
    function m(a) {
      ba.addskillOption(a.skillList, "autoskillid");
    }
    function h(a) {
      ba.addskillOption(a.skillList, "addiskillid", "\u8bf7\u9009\u62e9");
    }
    function r(a) {
      ba.addskillOption(a.skillList, "touchskillid", "\u8bf7\u9009\u62e9");
    }
    function q(a) {
      ba.addskillOption(a.skillList, "qoautoskillid");
    }
    function k(a) {
      ba.addskillOption2(a);
    }
    function g(a) {
      ha.updateSkills(a.skillList);
    }
    function t(a) {
      ha.updateSkill(a);
      ea.skillUpdate = !0;
    }
    function l(a) {
      oa.setList(a.ShortCutKey);
    }
    function f(a) {
      switch (a.tab) {
        case 0:
          (oa.clean(), oa.setList(a.ShortCutKey));
      }
    }
    function n(a) {
      ha.setSkillCDById(a.SKID, a.DelayTM);
      oa.addSkillCooldown(a.SKID, a.DelayTM);
    }
    function p(a) {
      ha.addSkill(a);
    }
    function v(a) {
      ha.useSkill(a.data, a.data.level);
    }
    function u(a) {
      a.ITIDList.length &&
        (Z.append(),
        Z.setList(a.ITIDList),
        Z.setTitle(P.getMessage(521)),
        (Z.onIndexSelected = function (a) {
          var b = new V.CZ.REQ_ITEMIDENTIFY();
          b.index = a;
          U.sendPacket(b);
        }));
    }
    function A(a) {
      a.itemList.length &&
        (Z.append(),
        Z.setList_p(a.itemList),
        Z.setTitle("\u4fee\u7406\u88c5\u5907"),
        (Z.onIndexSelected = function (a) {
          var b = new V.CZ.REQ_ITEMREPAIR();
          b.TargetItemInfo.index = a;
          U.sendPacket(b);
        }));
    }
    function D(a) {
      a.itemList.length
        ? (Z.append(),
          Z.setList_p(a.itemList),
          Z.setTitle("\u7cbe\u70bc\u5217\u8868"),
          (Z.onIndexSelected = function (a) {
            var b = new V.CZ.REQ_WEAPONREFINE();
            b.Index = a;
            U.sendPacket(b);
          }))
        : ka.showMessageBox(
            "\u6750\u6599\u6216\u6280\u80fd\u4e0d\u8db3\uff0c\u65e0\u6cd5\u7cbe\u70bc\u9053\u5177",
            "ok",
            null,
          );
    }
    function B(a) {
      var b = P.getItemInfo(a.ITID);
      if (b)
        switch (a.msg) {
          case 0:
            ea.Entity.dialog.set(
              b.identifiedDiSPlayName + " " + P.getMessage(498),
            );
            la.addText(
              b.identifiedDiSPlayName + " " + P.getMessage(498),
              la.TYPE.BLUE,
            );
            break;
          case 1:
            (ea.Entity.dialog.set(
              b.identifiedDiSPlayName + " " + P.getMessage(499),
            ),
              la.addText(
                b.identifiedDiSPlayName + " " + P.getMessage(499),
                la.TYPE.ERROR,
              ));
        }
    }
    function O(a) {
      a.arrowList.length &&
        (Z.append(),
        Z.setList_(a.arrowList),
        Z.setTitle("\u5236\u4f5c\u5217\u8868"),
        (Z.onIndexSelected = function (a) {
          var b = new V.CZ.REQ_MAKINGARROW();
          b.id = a;
          U.sendPacket(b);
        }));
    }
    function C(a) {
      if (!(0 > a.index))
        switch (a.result) {
          case 0:
            la.addText(P.getMessage(491), la.TYPE.BLUE);
            if ((a = pa.removeItem(a.index, 1)))
              ((a.IsIdentified = !0), (a.count = 1), pa.addItem(a));
            break;
          case 1:
            la.addText(P.getMessage(492), la.TYPE.ERROR);
        }
    }
    function y(a) {
      0 == a.info.length
        ? ka.showMessageBox(
            "\u9053\u5177\u6253\u9020\u5931\u8d25\u3002",
            "cancel",
            function () {
              var a = new V.CZ.REQMAKINGITEM();
              a.info.ITID = 0;
              a.info.material_ID = { 0: 0, 1: 0, 2: 0 };
              U.sendPacket(a);
            },
          )
        : (Z.append(),
          Z.setMakeList(a.info, !0),
          Z.setTitle(P.getMessage(697)),
          (Z.onIndexSelected = function (a) {
            if (1101 > a) {
              var b = new V.CZ.REQMAKINGITEM();
              b.info.ITID = a;
              b.info.material_ID = { 0: 0, 1: 0, 2: 0 };
              U.sendPacket(b);
            } else
              (qa.append(),
                qa.setMakems(a),
                (qa.index = a),
                (qa.onIndexSelected = function (a) {
                  var b = new V.CZ.REQMAKINGITEM();
                  b.info.ITID = a;
                  a = {
                    0: Number(qa.ui.find(".item:eq(0)").attr("data-id")) || 0,
                    1: Number(qa.ui.find(".item:eq(1)").attr("data-id")) || 0,
                    2: Number(qa.ui.find(".item:eq(2)").attr("data-id")) || 0,
                  };
                  b.info.material_ID = a;
                  U.sendPacket(b);
                }));
          }));
    }
    function z(a) {
      Z.append();
      Z.setSpiritList(a.Type);
      1 == a.Type
        ? Z.setTitle("\u539f\u77f3\u5206\u89e3")
        : 2 == a.Type && Z.setTitle("\u539f\u77f3\u5408\u6210");
      Z.onIndexSelected = function (b) {
        var c = new V.CZ.ITEMLISTWIN_RES();
        c.Type = a.Type;
        -1 == b
          ? ((c.Action = 0), (c.MaterialList = []))
          : (b = pa.getItemById(b))
            ? ((c.Action = 1),
              (c.MaterialList = [{ id: b.index, count: b.count }]))
            : ((c.Action = 0), (c.MaterialList = []));
        U.sendPacket(c);
      };
    }
    function J(a) {
      1 == a.result && la.addText(P.getMessage(428), la.TYPE.ERROR);
    }
    function I(a) {
      a.SKID.length &&
        (Z.append(),
        Z.setList(a.SKID, !0),
        Z.setTitle(P.getMessage(697)),
        (Z.onIndexSelected = function (a) {
          if (0 <= a) {
            var b = new V.CZ.SELECTAUTOSPELL();
            b.SKID = a;
            U.sendPacket(b);
          }
        }));
    }
    function L(a) {
      a.SKID.length &&
        (Z.append(),
        Z.setList(a.SKID, !0),
        Z.setTitle(P.getMessage(697)),
        (Z.onIndexSelected = function (a) {
          var b = new V.CZ.SKILL_SELECT_RESPONSE();
          b.why = 0;
          b.SKID = 0 < a ? a : 0;
          U.sendPacket(b);
        }));
    }
    function x(a) {
      a.idList.length &&
        (Z.append(),
        Z.setMakeList2(a.idList, !0),
        Z.setTitle("\u914d\u836f\u5217\u8868"),
        (Z.onIndexSelected = function (b) {
          var c = new V.CZ.REQ_MAKINGITEM();
          c.mkType = a.type;
          c.id = b;
          U.sendPacket(c);
        }));
    }
    function M(a) {
      w.onSelectMenu = function (b, c) {
        w.remove();
        var d = new V.CZ.SELECT_WARPPOINT();
        d.SKID = b;
        d.mapName = a.mapName[c - 1] || "cancel";
        U.sendPacket(d);
      };
      w.onAppend = function () {
        var b,
          c,
          d = [];
        b = 0;
        for (c = a.mapName.length; b < c; ++b)
          d[b] = P.getMapName(a.mapName[b], a.mapName[b]);
        w.setMenu(d.join(":") + ":Cancel", a.SKID);
        w.ui.find(".title").text(P.getMessage(213));
      };
      w.append();
    }
    function E(a) {
      switch (a.type) {
        case 0:
          la.addText(P.getMessage(500), la.TYPE.ERROR);
          break;
        case 1:
          la.addText(P.getMessage(501), la.TYPE.ERROR);
      }
    }
    function F(a) {
      switch (a.errorCode) {
        case 0:
          la.addText(P.getMessage(217), la.TYPE.BLUE);
          break;
        case 1:
          la.addText(P.getMessage(214), la.TYPE.ERROR);
          break;
        case 2:
          la.addText(P.getMessage(216), la.TYPE.ERROR);
      }
    }
    function G(a) {
      da.setCellType(a.xPos, a.yPos, a.type);
    }
    function H(a) {
      fa.remove(ta, a.myAID);
      for (var b = a.AID, c = 0; c < b.length; c++)
        0 < b[c] && fa.spam(2058, 1, a.myAID, b[c]);
    }
    function K(a) {
      var b = T.get(a.GID);
      if (a.enabled) {
        if (23 == a.hatEffectIDs[0] || 47 == a.hatEffectIDs[0])
          b._explosion = 1;
      } else if (23 == a.hatEffectIDs[0] || 47 == a.hatEffectIDs[0])
        b._explosion = 0;
    }
    var P = a("DB/DBManager"),
      N = a("DB/Skills/SkillConst"),
      S = a("DB/Effects/EffectConst");
    a("Utils/jquery");
    var R = a("Utils/PathFinding"),
      ea = a("Engine/SessionStorage"),
      U = a("Network/NetworkManager"),
      V = a("Network/PacketStructure"),
      ca = a("Renderer/Renderer"),
      T = a("Renderer/EntityManager"),
      fa = a("Renderer/EffectManager"),
      da = a("Renderer/Map/Altitude"),
      ta = a("Renderer/Effects/LineEffect"),
      ka = a("UI/UIManager"),
      oa = a("UI/Components/ShortCut/ShortCut"),
      ga = a("UI/Components/Guild/Guild"),
      la = a("UI/Components/ChatBox/ChatBox"),
      ha = a("UI/Components/SkillList/SkillList"),
      X = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      Z = a("UI/Components/ItemSelection/ItemSelection"),
      qa = a("UI/Components/ItemMakeSure/ItemMakeSure"),
      pa = a("UI/Components/Inventory/Inventory");
    a("UI/Components/NpcMenu/NpcMenu");
    var w = a("UI/Components/WarpList/WarpList"),
      ba = a("UI/Components/vbk/vbk");
    oa.onChange = function (a, b, c, d) {
      var e = new V.CZ.SHORTCUT_KEY_CHANGE();
      e.Index = a;
      e.ShortCutKey.isSkill = b ? 1 : 0;
      e.ShortCutKey.ID = c;
      e.ShortCutKey.count = d;
      U.sendPacket(e);
    };
    ga.onRequestCHANGE_MEMBERPOS = function (a, b, c) {
      var d = new V.CZ.REQ_CHANGE_MEMBERPOS(),
        e = [];
      e.push({ AID: a, GID: b, positionID: c });
      d.memberInfo = e;
      U.sendPacket(d);
    };
    ga.onIncreaseSkill = function (a) {
      var b = new V.CZ.UPGRADE_SKILLLEVEL();
      b.SKID = a;
      U.sendPacket(b);
    };
    ha.onIncreaseSkill = function (a) {
      var b = new V.CZ.UPGRADE_SKILLLEVEL();
      b.SKID = a;
      U.sendPacket(b);
    };
    var Q = 0;
    ga.onUseSkill = function (a, b, c) {
      if (!(ca.tick < Q + 70)) {
        Q = ca.tick;
        var d, e, f, g, h;
        d = ea.Entity;
        f = T.get(c) || d;
        e = ga.getSkillById(a);
        g = [];
        if (f != d || !e || 1 != e.type)
          if (
            ((e = e ? e.attackRange + 1 : d.attack_range),
            (h = R.searchLong(
              d.position[0] | 0,
              d.position[1] | 0,
              f.position[0] | 0,
              f.position[1] | 0,
              e,
              g,
              da.TYPE.WALKABLE,
            )))
          )
            ((e = new V.CZ.USE_SKILL()),
              (e.SKID = a),
              (e.selectedLevel = b),
              (e.targetID = c || ea.Entity.GID),
              2 > h ||
                f === d ||
                ((ea.moveAction = e),
                (e = new V.CZ.REQUEST_MOVE()),
                (e.dest[0] = g[2 * (h - 1) + 0]),
                (e.dest[1] = g[2 * (h - 1) + 1])),
              U.sendPacket(e));
      }
    };
    ha.onUseSkill = function (a, b, c) {
      if (!(ca.tick < Q + 70)) {
        Q = ca.tick;
        var d, e, f, g, h;
        d = ea.Entity;
        f = T.get(c) || d;
        e = ha.getSkillById(a);
        g = [];
        if (f != d || !e || 1 != e.type)
          if (
            ((e = e ? e.attackRange : d.attack_range),
            (h = R.searchLong(
              d.position[0] | 0,
              d.position[1] | 0,
              f.position[0] | 0,
              f.position[1] | 0,
              e,
              g,
              da.TYPE.WALKABLE,
            )))
          )
            ((e = new V.CZ.USE_SKILL()),
              (e.SKID = a),
              (e.selectedLevel = b),
              (e.targetID = c || ea.Entity.GID),
              2 > h ||
                f === d ||
                ((ea.moveAction = e),
                (e = new V.CZ.REQUEST_MOVE()),
                (e.dest[0] = g[2 * h + 0]),
                (e.dest[1] = g[2 * h + 1])),
              U.sendPacket(e));
      }
    };
    X.onUseSkillToPos = function (a, b, c, d) {
      if (!(ca.tick < Q + 70)) {
        Q = ca.tick;
        var e, f, g, h;
        f = ea.Entity;
        e = f.position;
        h = ha.getSkillById(a);
        g = [];
        if (
          (f = R.searchLong(
            e[0] | 0,
            e[1] | 0,
            c | 0,
            d | 0,
            h ? h.attackRange + 1 : f.attack_range,
            g,
            da.TYPE.WALKABLE,
          ))
        )
          ((e = new V.CZ.USE_SKILL_TOGROUND()),
            (e.SKID = a),
            (e.selectedLevel = b),
            (e.xPos = c),
            (e.yPos = d),
            (ea.Entity.lastSKID = a),
            (ea.Entity.lastSkLvl = b),
            2 > f ||
              ((ea.moveAction = e),
              (e = new V.CZ.REQUEST_MOVE()),
              (e.dest[0] = g[2 * f + 0]),
              (e.dest[1] = g[2 * f + 1])),
            U.sendPacket(e));
      }
    };
    return function () {
      U.hookPacket(V.ZC.ATTACK_SKILLINFO_LIST, m);
      U.hookPacket(V.ZC.ADDIS_SKILLINFO_LIST, h);
      U.hookPacket(V.ZC.TOUCH_SKILLINFO_LIST, r);
      U.hookPacket(V.ZC.QOATTACK_SKILLINFO_LIST, q);
      U.hookPacket(V.ZC.SKILL_AUTOSHADOWSPELL, k);
      U.hookPacket(V.ZC.SKILLINFO_LIST, g);
      U.hookPacket(V.ZC.SKILLINFO_UPDATE, t);
      U.hookPacket(V.ZC.ADD_SKILL, p);
      U.hookPacket(V.ZC.ADD_SKILL2, p);
      U.hookPacket(V.ZC.SHORTCUT_KEY_LIST, l);
      U.hookPacket(V.ZC.SHORTCUT_KEY_LIST_V2, l);
      U.hookPacket(V.ZC.SHORTCUT_KEY_LIST_V3, l);
      U.hookPacket(V.ZC.HORTCUT_KEY_LIST, f);
      U.hookPacket(V.ZC.SKILL_POSTDELAY, n);
      U.hookPacket(V.ZC.ACK_TOUSESKILL, e);
      U.hookPacket(V.ZC.NOTIFY_EFFECT, b);
      U.hookPacket(V.ZC.NOTIFY_EFFECT2, c);
      U.hookPacket(V.ZC.NOTIFY_EFFECT3, c);
      U.hookPacket(V.ZC.NOTIFY_GROUNDSKILL, d);
      U.hookPacket(V.ZC.AUTORUN_SKILL, v);
      U.hookPacket(V.ZC.ITEMIDENTIFY_LIST, u);
      U.hookPacket(V.ZC.REPAIRITEMLIST, A);
      U.hookPacket(V.ZC.NOTIFY_WEAPONITEMLIST, D);
      U.hookPacket(V.ZC.ACK_WEAPONREFINE, B);
      U.hookPacket(V.ZC.ACK_ITEMIDENTIFY, C);
      U.hookPacket(V.ZC.MAKINGARROW_LIST, O);
      U.hookPacket(V.ZC.AUTOSPELLLIST, I);
      U.hookPacket(V.ZC.AUTOSPELLLIST2, I);
      U.hookPacket(V.ZC.SKILL_SELECT_REQUEST, L);
      U.hookPacket(V.ZC.WARPLIST, M);
      U.hookPacket(V.ZC.WARPLIST2, M);
      U.hookPacket(V.ZC.NOTIFY_MAPINFO, E);
      U.hookPacket(V.ZC.UPDATE_MAPINFO, G);
      U.hookPacket(V.ZC.ACK_REMEMBER_WARPPOINT, F);
      U.hookPacket(V.ZC.MAKABLEITEMLIST, y);
      U.hookPacket(V.ZC.ITEMLISTWIN_OPEN, z);
      U.hookPacket(V.ZC.ACK_REQMAKINGITEM, J);
      U.hookPacket(V.ZC.DEVOTIONLIST, H);
      U.hookPacket(V.ZC.HAT_EFFECT, K);
      U.hookPacket(V.ZC.MAKINGITEM_LIST, x);
    };
  },
);
