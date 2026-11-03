define(
  "Engine/MapEngine/Mercenary",
  "require DB/DBManager Network/NetworkManager Utils/PathFinding Network/PacketStructure Core/Client Core/Events Engine/SessionStorage Renderer/EntityManager Renderer/Map/Altitude UI/UIManager UI/Components/SlotMachine/SlotMachine UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/ItemSelection/ItemSelection UI/Components/ChatBox/ChatBox UI/Components/Mercenary/MercenaryInformations UI/Components/Mercenary/MercenaryskillList".split(
    " ",
  ),
  function (a) {
    function b() {
      if (g.mercGID) {
        var a = p.get(g.mercGID);
        a
          ? (a.action == a.ACTION.IDLE &&
              (3 < Math.abs(g.Entity.position[0] - a.position[0]) ||
                3 < Math.abs(g.Entity.position[1] - a.position[1])) &&
              ((a = new t.CZ.REQUEST_MOVETOOWNER()),
              (a.GID = g.mercGID),
              r.sendPacket(a)),
            n.clearTimeout(v),
            (v = n.setTimeout(b, 200)))
          : ((g.mercGID = 0), n.clearTimeout(v));
      }
    }
    function c(a) {
      m.append();
      m.setInformations(a);
    }
    function d(a) {
      q.append();
      q.setskill(a.skillList);
    }
    function e() {
      g.moveAction &&
        n.setTimeout(function () {
          g.moveAction &&
            (r.sendPacket(g.moveAction),
            null == p.getFocusEntity() &&
              r.sendPacket(new t.CZ.CANCEL_LOCKON()),
            (g.moveAction = null));
        }, 50);
    }
    var l = a("DB/DBManager"),
      h = a("Utils/PathFinding"),
      r = a("Network/NetworkManager"),
      t = a("Network/PacketStructure");
    a("Core/Client");
    var n = a("Core/Events"),
      g = a("Engine/SessionStorage"),
      p = a("Renderer/EntityManager"),
      k = a("Renderer/Map/Altitude"),
      f = a("UI/UIManager");
    a("UI/Components/SlotMachine/SlotMachine");
    a("UI/Components/SkillTargetSelection/SkillTargetSelection");
    a("UI/Components/ItemSelection/ItemSelection");
    a("UI/Components/ChatBox/ChatBox");
    var m = a("UI/Components/Mercenary/MercenaryInformations"),
      q = a("UI/Components/Mercenary/MercenaryskillList"),
      v = null;
    m.reqFired = function () {
      f.showPromptBox(l.getMessage(1370), "ok", "cancel", function () {
        m.remove();
        q.remove();
        var a = new t.CZ.MER_COMMAND();
        a.command = 2;
        r.sendPacket(a);
      });
    };
    q.onUseSkill = function (a, b, c) {
      var d, e, f, m, n;
      d = p.get(g.mercGID);
      f = p.get(c) || d;
      e = q.getSkillById(a);
      m = [];
      if (f != d || !e || 1 != e.type)
        if (
          ((e = e ? e.attackRange : d.attack_range),
          (n = h.searchLong(
            d.position[0] | 0,
            d.position[1] | 0,
            f.position[0] | 0,
            f.position[1] | 0,
            e,
            m,
            k.TYPE.WALKABLE,
          )))
        )
          ((e = new t.CZ.USE_SKILL()),
            (e.SKID = a),
            (e.selectedLevel = b),
            (e.targetID = c || d),
            2 > n ||
              f === d ||
              ((g.moveAction = e),
              (e = new t.CZ.REQUEST_MOVE()),
              (e.dest[0] = m[2 * (n - 1) + 0]),
              (e.dest[1] = m[2 * (n - 1) + 1])),
            r.sendPacket(e));
    };
    m.WalkEnd = function () {
      var a = p.get(g.mercGID);
      v = n.setTimeout(b, 200);
      a.onWalkEnd = e;
    };
    return function () {
      r.hookPacket(t.ZC.MER_INIT, c);
      r.hookPacket(t.ZC.MER_SKILLINFO_LIST, d);
    };
  },
);
