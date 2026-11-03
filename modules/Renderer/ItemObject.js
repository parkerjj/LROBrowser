define(
  "Renderer/ItemObject",
  "DB/DBManager ./EntityManager ./Entity/Entity Renderer/EffectManager Renderer/Map/Altitude UI/Components/vbk/vbk".split(
    " ",
  ),
  function (a, b, c, d, e, m) {
    return {
      add: function (h, t, r, n, g, p, l, f) {
        var k = a.getItemInfo(t);
        t = a.getItemPath(t, r);
        var q = new c();
        r = r ? k.identifiedDiSPlayName : k.unidentifiedDiSPlayName;
        q.GID = h;
        q.objecttype = c.TYPE_ITEM;
        q.position[0] = g;
        q.position[1] = p;
        q.position[2] = l;
        q.display.load = q.display.TYPE.COMPLETE;
        q.display.name = a.getMessage(183).replace("%s", r).replace("%d", n);
        q.display.update("#FFEF94");
        q.files.body.spr = t + ".spr";
        q.files.body.act = t + ".act";
        q.files.shadow.size = 0.25;
        q.animations.add(function (a) {
          var b = e.getCellHeight(q.position[0], q.position[1]);
          q.position[2] = Math.max(b, l - a / 40);
          return q.position[2] === b;
        });
        m.setObjList(q);
        b.add(q);
        f &&
          d.spam({
            effectId: 2300 + (Math.floor(6 * Math.random()) + 1),
            ownerAID: q.GID,
            position: q.position,
          });
      },
      remove: function (a) {
        m.delobjlist(a);
        b.remove(a);
      },
    };
  },
);
