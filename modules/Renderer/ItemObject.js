define(
  "Renderer/ItemObject",
  "DB/DBManager ./EntityManager ./Entity/Entity Renderer/EffectManager Renderer/Map/Altitude UI/Components/vbk/vbk".split(
    " ",
  ),
  function (a, b, c, d, e, m) {
    return {
      add: function (h, q, r, k, g, u, l, f) {
        var n = a.getItemInfo(q);
        q = a.getItemPath(q, r);
        var p = new c();
        r = r ? n.identifiedDiSPlayName : n.unidentifiedDiSPlayName;
        p.GID = h;
        p.objecttype = c.TYPE_ITEM;
        p.position[0] = g;
        p.position[1] = u;
        p.position[2] = l;
        p.display.load = p.display.TYPE.COMPLETE;
        p.display.name = a.getMessage(183).replace("%s", r).replace("%d", k);
        p.display.update("#FFEF94");
        p.files.body.spr = q + ".spr";
        p.files.body.act = q + ".act";
        p.files.shadow.size = 0.25;
        p.animations.add(function (a) {
          var b = e.getCellHeight(p.position[0], p.position[1]);
          p.position[2] = Math.max(b, l - a / 40);
          return p.position[2] === b;
        });
        m.setObjList(p);
        b.add(p);
        f &&
          d.spam({
            effectId: 2300 + (Math.floor(6 * Math.random()) + 1),
            ownerAID: p.GID,
            position: p.position,
          });
      },
      remove: function (a) {
        m.delobjlist(a);
        b.remove(a);
      },
    };
  },
);
