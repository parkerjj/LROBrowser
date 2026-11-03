define(
  "Renderer/ItemObject",
  "DB/DBManager ./EntityManager ./Entity/Entity Renderer/EffectManager Renderer/Map/Altitude UI/Components/vbk/vbk".split(
    " ",
  ),
  function (a, b, c, d, e, l) {
    return {
      add: function (h, r, t, n, g, p, k, f) {
        var m = a.getItemInfo(r);
        r = a.getItemPath(r, t);
        var q = new c();
        t = t ? m.identifiedDiSPlayName : m.unidentifiedDiSPlayName;
        q.GID = h;
        q.objecttype = c.TYPE_ITEM;
        q.position[0] = g;
        q.position[1] = p;
        q.position[2] = k;
        q.display.load = q.display.TYPE.COMPLETE;
        q.display.name = a.getMessage(183).replace("%s", t).replace("%d", n);
        q.display.update("#FFEF94");
        q.files.body.spr = r + ".spr";
        q.files.body.act = r + ".act";
        q.files.shadow.size = 0.25;
        q.animations.add(function (a) {
          var b = e.getCellHeight(q.position[0], q.position[1]);
          q.position[2] = Math.max(b, k - a / 40);
          return q.position[2] === b;
        });
        l.setObjList(q);
        b.add(q);
        f &&
          d.spam({
            effectId: 2300 + (Math.floor(6 * Math.random()) + 1),
            ownerAID: q.GID,
            position: q.position,
          });
      },
      remove: function (a) {
        l.delobjlist(a);
        b.remove(a);
      },
    };
  },
);
