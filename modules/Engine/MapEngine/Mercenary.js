define(
  "Engine/MapEngine/Mercenary",
  "require DB/DBManager Network/NetworkManager Utils/PathFinding Network/PacketStructure Core/Client Core/Events Engine/SessionStorage Renderer/EntityManager Renderer/Map/Altitude UI/UIManager UI/Components/SlotMachine/SlotMachine UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/ItemSelection/ItemSelection UI/Components/ChatBox/ChatBox UI/Components/Mercenary/MercenaryInformations UI/Components/Mercenary/MercenaryskillList".split(
    " ",
  ),
  function (a) {
    function b() {
      if (g.mercGID) {
        var a = u.get(g.mercGID);
        a
          ? (a.action == a.ACTION.IDLE &&
              (3 < Math.abs(g.Entity.position[0] - a.position[0]) ||
                3 < Math.abs(g.Entity.position[1] - a.position[1])) &&
              ((a = new r.CZ.REQUEST_MOVETOOWNER()),
              (a.GID = g.mercGID),
              q.sendPacket(a)),
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
            (q.sendPacket(g.moveAction),
            null == u.getFocusEntity() &&
              q.sendPacket(new r.CZ.CANCEL_LOCKON()),
            (g.moveAction = null));
        }, 50);
    }
    var m = a("DB/DBManager"),
      h = a("Utils/PathFinding"),
      q = a("Network/NetworkManager"),
      r = a("Network/PacketStructure");
    a("Core/Client");
    var k = a("Core/Events"),
      g = a("Engine/SessionStorage"),
      u = a("Renderer/EntityManager"),
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
        var a = new r.CZ.MER_COMMAND();
        a.command = 2;
        q.sendPacket(a);
      });
    };
    p.onUseSkill = function (a, b, c) {
      var d, e, f, n, k;
      d = u.get(g.mercGID);
      f = u.get(c) || d;
      e = p.getSkillById(a);
      n = [];
      if (f != d || !e || 1 != e.type)
        if (
          ((e = e ? e.attackRange : d.attack_range),
          (k = h.searchLong(
            d.position[0] | 0,
            d.position[1] | 0,
            f.position[0] | 0,
            f.position[1] | 0,
            e,
            n,
            l.TYPE.WALKABLE,
          )))
        )
          ((e = new r.CZ.USE_SKILL()),
            (e.SKID = a),
            (e.selectedLevel = b),
            (e.targetID = c || d),
            2 > k ||
              f === d ||
              ((g.moveAction = e),
              (e = new r.CZ.REQUEST_MOVE()),
              (e.dest[0] = n[2 * (k - 1) + 0]),
              (e.dest[1] = n[2 * (k - 1) + 1])),
            q.sendPacket(e));
    };
    n.WalkEnd = function () {
      var a = u.get(g.mercGID);
      v = k.setTimeout(b, 200);
      a.onWalkEnd = e;
    };
    return function () {
      q.hookPacket(r.ZC.MER_INIT, c);
      q.hookPacket(r.ZC.MER_SKILLINFO_LIST, d);
    };
  },
);
