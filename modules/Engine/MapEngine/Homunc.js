define(
  "Engine/MapEngine/Homunc",
  "require DB/DBManager Network/NetworkManager Utils/PathFinding Network/PacketStructure Core/Client Core/Events Engine/SessionStorage Renderer/EntityManager Renderer/Map/Altitude UI/UIManager UI/Components/SlotMachine/SlotMachine UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/ItemSelection/ItemSelection UI/Components/ChatBox/ChatBox UI/Components/Homunc/HomuncInformations UI/Components/Homunc/HomuncskillList".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = f.get(k.homGID);
      a
        ? (a.action == a.ACTION.IDLE &&
            (3 < Math.abs(k.Entity.position[0] - a.position[0]) ||
              3 < Math.abs(k.Entity.position[1] - a.position[1])) &&
            ((a = new g.CZ.REQUEST_MOVETOOWNER()),
            (a.GID = k.homGID),
            n.sendPacket(a)),
          p.clearTimeout(D),
          (D = p.setTimeout(b, 200)))
        : p.clearTimeout(D);
    }
    function c(a) {
      u.initData(a);
    }
    function d(a) {
      0 < a.nRelationship
        ? u.setInformations(a)
        : ((k.homGID = 0), (u.info = null));
    }
    function e(a) {
      A.append();
      A.setskill(a.skillList);
    }
    function l() {
      k.moveAction &&
        p.setTimeout(function () {
          k.moveAction &&
            (n.sendPacket(k.moveAction),
            null == f.getFocusEntity() &&
              n.sendPacket(new g.CZ.CANCEL_LOCKON()),
            (k.moveAction = null));
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
      t = a("Utils/PathFinding"),
      n = a("Network/NetworkManager"),
      g = a("Network/PacketStructure");
    a("Core/Client");
    var p = a("Core/Events"),
      k = a("Engine/SessionStorage"),
      f = a("Renderer/EntityManager"),
      m = a("Renderer/Map/Altitude"),
      q = a("UI/UIManager");
    a("UI/Components/SlotMachine/SlotMachine");
    a("UI/Components/SkillTargetSelection/SkillTargetSelection");
    a("UI/Components/ItemSelection/ItemSelection");
    var v = a("UI/Components/ChatBox/ChatBox"),
      u = a("UI/Components/Homunc/HomuncInformations"),
      A = a("UI/Components/Homunc/HomuncskillList"),
      D = null;
    u.reqPetFeed = function (a) {
      q.showPromptBox(r.getMessage(601), "ok", "cancel", function () {
        var a = new g.CZ.COMMAND_MER();
        a.type = 0;
        a.command = 1;
        n.sendPacket(a);
      });
    };
    u.reqNameEdit = function (a) {
      q.showPromptBox(r.getMessage(683), "ok", "cancel", function () {
        var b = new g.CZ.RENAME_MER();
        b.name = a;
        n.sendPacket(b);
      });
    };
    u.reqFired = function () {
      q.showPromptBox(r.getMessage(955), "ok", "cancel", function () {
        u.remove();
        A.remove();
        var a = new g.CZ.COMMAND_MER();
        a.type = 0;
        a.command = 2;
        n.sendPacket(a);
      });
    };
    A.onIncreaseSkill = function (a) {
      var b = new g.CZ.UPGRADE_SKILLLEVEL();
      b.SKID = a;
      n.sendPacket(b);
    };
    A.onUseSkill = function (a, b, c) {
      var d, e, h, l, p;
      d = f.get(k.homGID);
      h = f.get(c) || d;
      e = A.getSkillById(a);
      l = [];
      if (h != d || !e || 1 != e.type)
        if (
          ((e = e ? e.attackRange : d.attack_range),
          (p = t.searchLong(
            d.position[0] | 0,
            d.position[1] | 0,
            h.position[0] | 0,
            h.position[1] | 0,
            e,
            l,
            m.TYPE.WALKABLE,
          )))
        )
          ((e = new g.CZ.USE_SKILL()),
            (e.SKID = a),
            (e.selectedLevel = b),
            (e.targetID = c || k.Entity.GID),
            2 > p ||
              h === d ||
              ((k.moveAction = e),
              (e = new g.CZ.REQUEST_MOVE()),
              (e.dest[0] = l[2 * (p - 1) + 0]),
              (e.dest[1] = l[2 * (p - 1) + 1])),
            n.sendPacket(e));
    };
    u.WalkEnd = function () {
      var a = f.get(k.homGID);
      D = p.setTimeout(b, 200);
      a.onWalkEnd = l;
    };
    return function () {
      n.hookPacket(g.ZC.CHANGESTATE_MER, c);
      n.hookPacket(g.ZC.PROPERTY_HOMUN_2, d);
      n.hookPacket(g.ZC.PROPERTY_HOMUN4, d);
      n.hookPacket(g.ZC.HOM_SKILLINFO_LIST, e);
      n.hookPacket(g.ZC.FEED_HOM, h);
    };
  },
);
