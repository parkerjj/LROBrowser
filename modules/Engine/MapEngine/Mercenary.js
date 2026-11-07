define(
  "Engine/MapEngine/Mercenary",
  "require DB/DBManager Network/NetworkManager Utils/PathFinding Network/PacketStructure Core/Client Core/Events Engine/SessionStorage Renderer/EntityManager Renderer/Map/Altitude UI/UIManager UI/Components/SlotMachine/SlotMachine UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/ItemSelection/ItemSelection UI/Components/ChatBox/ChatBox UI/Components/Mercenary/MercenaryInformations UI/Components/Mercenary/MercenaryskillList".split(
    " ",
  ),
  function (a) {
    function b() {
      if (g.mercGID) {
        var a = t.get(g.mercGID);
        a
          ? (a.action == a.ACTION.IDLE &&
              (3 < Math.abs(g.Entity.position[0] - a.position[0]) ||
                3 < Math.abs(g.Entity.position[1] - a.position[1])) &&
              ((a = new q.CZ.REQUEST_MOVETOOWNER()),
              (a.GID = g.mercGID),
              r.sendPacket(a)),
            k.clearTimeout(v),
            (v = k.setTimeout(b, 200)))
          : ((g.mercGID = 0), k.clearTimeout(v));
      }
    }
    function c(a) {
      n.append();
      n.setInformations(a);
    }
    function d(a) {
      p.append();
      p.setskill(a.skillList);
    }
    function e() {
      g.moveAction &&
        k.setTimeout(function () {
          g.moveAction &&
            (r.sendPacket(g.moveAction),
            null == t.getFocusEntity() &&
              r.sendPacket(new q.CZ.CANCEL_LOCKON()),
            (g.moveAction = null));
        }, 50);
    }
    var m = a("DB/DBManager"),
      h = a("Utils/PathFinding"),
      r = a("Network/NetworkManager"),
      q = a("Network/PacketStructure");
    a("Core/Client");
    var k = a("Core/Events"),
      g = a("Engine/SessionStorage"),
      t = a("Renderer/EntityManager"),
      l = a("Renderer/Map/Altitude"),
      f = a("UI/UIManager");
    a("UI/Components/SlotMachine/SlotMachine");
    a("UI/Components/SkillTargetSelection/SkillTargetSelection");
    a("UI/Components/ItemSelection/ItemSelection");
    a("UI/Components/ChatBox/ChatBox");
    var n = a("UI/Components/Mercenary/MercenaryInformations"),
      p = a("UI/Components/Mercenary/MercenaryskillList"),
      v = null;
    n.reqFired = function () {
      f.showPromptBox(m.getMessage(1370), "ok", "cancel", function () {
        n.remove();
        p.remove();
        var a = new q.CZ.MER_COMMAND();
        a.command = 2;
        r.sendPacket(a);
      });
    };
    p.onUseSkill = function (a, b, c) {
      var d, e, f, k, n;
      d = t.get(g.mercGID);
      f = t.get(c) || d;
      e = p.getSkillById(a);
      k = [];
      if (f != d || !e || 1 != e.type)
        if (
          ((e = e ? e.attackRange : d.attack_range),
          (n = h.searchLong(
            d.position[0] | 0,
            d.position[1] | 0,
            f.position[0] | 0,
            f.position[1] | 0,
            e,
            k,
            l.TYPE.WALKABLE,
          )))
        )
          ((e = new q.CZ.USE_SKILL()),
            (e.SKID = a),
            (e.selectedLevel = b),
            (e.targetID = c || d),
            2 > n ||
              f === d ||
              ((g.moveAction = e),
              (e = new q.CZ.REQUEST_MOVE()),
              (e.dest[0] = k[2 * (n - 1) + 0]),
              (e.dest[1] = k[2 * (n - 1) + 1])),
            r.sendPacket(e));
    };
    n.WalkEnd = function () {
      var a = t.get(g.mercGID);
      v = k.setTimeout(b, 200);
      a.onWalkEnd = e;
    };
    return function () {
      r.hookPacket(q.ZC.MER_INIT, c);
      r.hookPacket(q.ZC.MER_SKILLINFO_LIST, d);
    };
  },
);
