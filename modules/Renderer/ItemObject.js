define(
  "Renderer/ItemObject",
  "DB/DBManager ./EntityManager ./Entity/Entity Renderer/EffectManager Renderer/Map/Altitude UI/Components/vbk/vbk".split(
    " ",
  ),
  function (a, b, c, d, e, m) {
    return {
      add: function (h, r, q, k, g, t, l, f) {
        var n = a.getItemInfo(r);
        r = a.getItemPath(r, q);
        var p = new c();
        q = q ? n.identifiedDiSPlayName : n.unidentifiedDiSPlayName;
        p.GID = h;
        p.objecttype = c.TYPE_ITEM;
        p.position[0] = g;
        p.position[1] = t;
        p.position[2] = l;
        p.display.load = p.display.TYPE.COMPLETE;
        p.display.name = a.getMessage(183).replace("%s", q).replace("%d", k);
        p.display.update("#FFEF94");
        p.files.body.spr = r + ".spr";
        p.files.body.act = r + ".act";
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
