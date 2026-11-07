define(
  "Engine/MapEngine/Homunc",
  "require DB/DBManager Network/NetworkManager Utils/PathFinding Network/PacketStructure Core/Client Core/Events Engine/SessionStorage Renderer/EntityManager Renderer/Map/Altitude UI/UIManager UI/Components/SlotMachine/SlotMachine UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/ItemSelection/ItemSelection UI/Components/ChatBox/ChatBox UI/Components/Homunc/HomuncInformations UI/Components/Homunc/HomuncskillList".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = f.get(l.homGID);
      a
        ? (a.action == a.ACTION.IDLE &&
            (3 < Math.abs(l.Entity.position[0] - a.position[0]) ||
              3 < Math.abs(l.Entity.position[1] - a.position[1])) &&
            ((a = new g.CZ.REQUEST_MOVETOOWNER()),
            (a.GID = l.homGID),
            k.sendPacket(a)),
          t.clearTimeout(D),
          (D = t.setTimeout(b, 200)))
        : t.clearTimeout(D);
    }
    function c(a) {
      u.initData(a);
    }
    function d(a) {
      0 < a.nRelationship
        ? u.setInformations(a)
        : ((l.homGID = 0), (u.info = null));
    }
    function e(a) {
      A.append();
      A.setskill(a.skillList);
    }
    function m() {
      l.moveAction &&
        t.setTimeout(function () {
          l.moveAction &&
            (k.sendPacket(l.moveAction),
            null == f.getFocusEntity() &&
              k.sendPacket(new g.CZ.CANCEL_LOCKON()),
            (l.moveAction = null));
        }, 50);
    }
    function h(a) {
      a.cRet ||
        v.addText(
          r
            .getMessage(591)
            .replace("%s", r.getItemInfo(a.ITID).identifiedDiSPlayName),
          v.TYPE.ERROR,
        );
    }
    var r = a("DB/DBManager"),
      q = a("Utils/PathFinding"),
      k = a("Network/NetworkManager"),
      g = a("Network/PacketStructure");
    a("Core/Client");
    var t = a("Core/Events"),
      l = a("Engine/SessionStorage"),
      f = a("Renderer/EntityManager"),
      n = a("Renderer/Map/Altitude"),
      p = a("UI/UIManager");
    a("UI/Components/SlotMachine/SlotMachine");
    a("UI/Components/SkillTargetSelection/SkillTargetSelection");
    a("UI/Components/ItemSelection/ItemSelection");
    var v = a("UI/Components/ChatBox/ChatBox"),
      u = a("UI/Components/Homunc/HomuncInformations"),
      A = a("UI/Components/Homunc/HomuncskillList"),
      D = null;
    u.reqPetFeed = function (a) {
      p.showPromptBox(r.getMessage(601), "ok", "cancel", function () {
        var a = new g.CZ.COMMAND_MER();
        a.type = 0;
        a.command = 1;
        k.sendPacket(a);
      });
    };
    u.reqNameEdit = function (a) {
      p.showPromptBox(r.getMessage(683), "ok", "cancel", function () {
        var b = new g.CZ.RENAME_MER();
        b.name = a;
        k.sendPacket(b);
      });
    };
    u.reqFired = function () {
      p.showPromptBox(r.getMessage(955), "ok", "cancel", function () {
        u.remove();
        A.remove();
        var a = new g.CZ.COMMAND_MER();
        a.type = 0;
        a.command = 2;
        k.sendPacket(a);
      });
    };
    A.onIncreaseSkill = function (a) {
      var b = new g.CZ.UPGRADE_SKILLLEVEL();
      b.SKID = a;
      k.sendPacket(b);
    };
    A.onUseSkill = function (a, b, c) {
      var d, e, h, m, p;
      d = f.get(l.homGID);
      h = f.get(c) || d;
      e = A.getSkillById(a);
      m = [];
      if (h != d || !e || 1 != e.type)
        if (
          ((e = e ? e.attackRange : d.attack_range),
          (p = q.searchLong(
            d.position[0] | 0,
            d.position[1] | 0,
            h.position[0] | 0,
            h.position[1] | 0,
            e,
            m,
            n.TYPE.WALKABLE,
          )))
        )
          ((e = new g.CZ.USE_SKILL()),
            (e.SKID = a),
            (e.selectedLevel = b),
            (e.targetID = c || l.Entity.GID),
            2 > p ||
              h === d ||
              ((l.moveAction = e),
              (e = new g.CZ.REQUEST_MOVE()),
              (e.dest[0] = m[2 * (p - 1) + 0]),
              (e.dest[1] = m[2 * (p - 1) + 1])),
            k.sendPacket(e));
    };
    u.WalkEnd = function () {
      var a = f.get(l.homGID);
      D = t.setTimeout(b, 200);
      a.onWalkEnd = m;
    };
    return function () {
      k.hookPacket(g.ZC.CHANGESTATE_MER, c);
      k.hookPacket(g.ZC.PROPERTY_HOMUN_2, d);
      k.hookPacket(g.ZC.PROPERTY_HOMUN4, d);
      k.hookPacket(g.ZC.HOM_SKILLINFO_LIST, e);
      k.hookPacket(g.ZC.FEED_HOM, h);
    };
  },
);
