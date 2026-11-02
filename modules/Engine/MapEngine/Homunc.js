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
          u.clearTimeout(E),
          (E = u.setTimeout(b, 200)))
        : u.clearTimeout(E);
    }
    function c(a) {
      t.initData(a);
    }
    function d(a) {
      0 < a.nRelationship
        ? t.setInformations(a)
        : ((l.homGID = 0), (t.info = null));
    }
    function e(a) {
      z.append();
      z.setskill(a.skillList);
    }
    function m() {
      l.moveAction &&
        u.setTimeout(function () {
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
          q
            .getMessage(591)
            .replace("%s", q.getItemInfo(a.ITID).identifiedDiSPlayName),
          v.TYPE.ERROR,
        );
    }
    var q = a("DB/DBManager"),
      r = a("Utils/PathFinding"),
      k = a("Network/NetworkManager"),
      g = a("Network/PacketStructure");
    a("Core/Client");
    var u = a("Core/Events"),
      l = a("Engine/SessionStorage"),
      f = a("Renderer/EntityManager"),
      n = a("Renderer/Map/Altitude"),
      p = a("UI/UIManager");
    a("UI/Components/SlotMachine/SlotMachine");
    a("UI/Components/SkillTargetSelection/SkillTargetSelection");
    a("UI/Components/ItemSelection/ItemSelection");
    var v = a("UI/Components/ChatBox/ChatBox"),
      t = a("UI/Components/Homunc/HomuncInformations"),
      z = a("UI/Components/Homunc/HomuncskillList"),
      E = null;
    t.reqPetFeed = function (a) {
      p.showPromptBox(q.getMessage(601), "ok", "cancel", function () {
        var a = new g.CZ.COMMAND_MER();
        a.type = 0;
        a.command = 1;
        k.sendPacket(a);
      });
    };
    t.reqNameEdit = function (a) {
      p.showPromptBox(q.getMessage(683), "ok", "cancel", function () {
        var b = new g.CZ.RENAME_MER();
        b.name = a;
        k.sendPacket(b);
      });
    };
    t.reqFired = function () {
      p.showPromptBox(q.getMessage(955), "ok", "cancel", function () {
        t.remove();
        z.remove();
        var a = new g.CZ.COMMAND_MER();
        a.type = 0;
        a.command = 2;
        k.sendPacket(a);
      });
    };
    z.onIncreaseSkill = function (a) {
      var b = new g.CZ.UPGRADE_SKILLLEVEL();
      b.SKID = a;
      k.sendPacket(b);
    };
    z.onUseSkill = function (a, b, c) {
      var d, e, h, m, p;
      d = f.get(l.homGID);
      h = f.get(c) || d;
      e = z.getSkillById(a);
      m = [];
      if (h != d || !e || 1 != e.type)
        if (
          ((e = e ? e.attackRange : d.attack_range),
          (p = r.searchLong(
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
    t.WalkEnd = function () {
      var a = f.get(l.homGID);
      E = u.setTimeout(b, 200);
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
