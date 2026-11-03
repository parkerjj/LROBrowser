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
              ((a = new r.CZ.REQUEST_MOVETOOWNER()),
              (a.GID = g.mercGID),
              t.sendPacket(a)),
            n.clearTimeout(u),
            (u = n.setTimeout(b, 200)))
          : ((g.mercGID = 0), n.clearTimeout(u));
      }
    }
    function c(a) {
      k.append();
      k.setInformations(a);
    }
    function d(a) {
      q.append();
      q.setskill(a.skillList);
    }
    function e() {
      g.moveAction &&
        n.setTimeout(function () {
          g.moveAction &&
            (t.sendPacket(g.moveAction),
            null == p.getFocusEntity() &&
              t.sendPacket(new r.CZ.CANCEL_LOCKON()),
            (g.moveAction = null));
        }, 50);
    }
    var m = a("DB/DBManager"),
      h = a("Utils/PathFinding"),
      t = a("Network/NetworkManager"),
      r = a("Network/PacketStructure");
    a("Core/Client");
    var n = a("Core/Events"),
      g = a("Engine/SessionStorage"),
      p = a("Renderer/EntityManager"),
      l = a("Renderer/Map/Altitude"),
      f = a("UI/UIManager");
    a("UI/Components/SlotMachine/SlotMachine");
    a("UI/Components/SkillTargetSelection/SkillTargetSelection");
    a("UI/Components/ItemSelection/ItemSelection");
    a("UI/Components/ChatBox/ChatBox");
    var k = a("UI/Components/Mercenary/MercenaryInformations"),
      q = a("UI/Components/Mercenary/MercenaryskillList"),
      u = null;
    k.reqFired = function () {
      f.showPromptBox(m.getMessage(1370), "ok", "cancel", function () {
        k.remove();
        q.remove();
        var a = new r.CZ.MER_COMMAND();
        a.command = 2;
        t.sendPacket(a);
      });
    };
    q.onUseSkill = function (a, b, c) {
      var d, e, f, k, m;
      d = p.get(g.mercGID);
      f = p.get(c) || d;
      e = q.getSkillById(a);
      k = [];
      if (f != d || !e || 1 != e.type)
        if (
          ((e = e ? e.attackRange : d.attack_range),
          (m = h.searchLong(
            d.position[0] | 0,
            d.position[1] | 0,
            f.position[0] | 0,
            f.position[1] | 0,
            e,
            k,
            l.TYPE.WALKABLE,
          )))
        )
          ((e = new r.CZ.USE_SKILL()),
            (e.SKID = a),
            (e.selectedLevel = b),
            (e.targetID = c || d),
            2 > m ||
              f === d ||
              ((g.moveAction = e),
              (e = new r.CZ.REQUEST_MOVE()),
              (e.dest[0] = k[2 * (m - 1) + 0]),
              (e.dest[1] = k[2 * (m - 1) + 1])),
            t.sendPacket(e));
    };
    k.WalkEnd = function () {
      var a = p.get(g.mercGID);
      u = n.setTimeout(b, 200);
      a.onWalkEnd = e;
    };
    return function () {
      t.hookPacket(r.ZC.MER_INIT, c);
      t.hookPacket(r.ZC.MER_SKILLINFO_LIST, d);
    };
  },
);
