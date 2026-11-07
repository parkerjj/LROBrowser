define(
  "Renderer/GhostManager",
  "require Engine/SessionStorage ./Entity/Entity ./SpriteRenderer Controls/MouseEventHandler Controls/KeyEventHandler Preferences/Map".split(
    " ",
  ),
  function (a) {
    function b(a) {
      if (0 > a) return -1;
      var b,
        c = g.length;
      for (b = 0; b < c; ++b) if (g[b].GID === a) return b;
      return -1;
    }
    function c(a, b) {
      return b.depth + (b.GID % 100) / 1e3 - (a.depth + (a.GID % 100) / 1e3);
    }
    function d(a, b) {
      var c = a.depth + (a.GID % 100) / 1e3,
        d = b.depth + (b.GID % 100) / 1e3;
      a.objecttype !== b.objecttype &&
        ((c -= 100 * m.PickingPriority[a.objecttype]),
        (d -= 100 * m.PickingPriority[b.objecttype]));
      return c - d;
    }
    var e = a("Engine/SessionStorage"),
      m = a("./Entity/Entity"),
      h = a("./SpriteRenderer"),
      r = a("Controls/MouseEventHandler"),
      q = a("Controls/KeyEventHandler"),
      k = a("Preferences/Map"),
      g = [],
      t = null,
      l = !1,
      f = null;
    a = {
      free: function () {
        var a,
          b = g.length;
        for (a = 0; a < b; ++a) g[a].clean();
        g.length = 0;
      },
      add: function (a) {
        var c = b(a.GID);
        0 > c ? (c = g.push(a) - 1) : g[c].set(a);
        return g[c];
      },
      remove: function (a) {
        a = b(a);
        -1 < a && (g[a].clean(), g.splice(a, 1));
      },
      get: function (a) {
        if (parseInt(e.Entity.GID) === a) return e.Entity;
        a = b(a);
        return 0 > a ? null : g[a];
      },
      forEach: function (a) {
        var b,
          c = g.length;
        for (b = 0; b < c && !1 !== a(g[b]); ++b);
      },
      getOverEntity: function () {
        return t;
      },
      setOverEntity: function (a) {
        var b = t;
        if (a !== b || l !== q.SHIFT) {
          l = q.SHIFT;
          if (b) b.onMouseOut();
          a ? ((t = a), a.onMouseOver()) : (t = null);
        }
      },
      getFocusEntity: function () {
        return f;
      },
      setFocusEntity: function (a) {
        f = a;
      },
      render: function (a, b, d, e) {
        var f,
          l = Date.now();
        if (g.length) {
          g.sort(c);
          h.bind3DContext(a, b, d, e, k.lightmap);
          e = 0;
          for (f = g.length; e < f; ++e)
            g[e].remove_tick && g[e].remove_tick + g[e].remove_delay < l
              ? (g[e].clean(), g.splice(e, 1), e--, f--)
              : (a.depthMask(!1), g[e].render(b, d), a.depthMask(!0));
          h.unbind(a);
        }
      },
      intersect: function () {
        var a, b, c;
        if (g.length) {
          g.sort(d);
          var e = r.screen.x,
            f = r.screen.y;
          a = 0;
          for (b = g.length; a < b; ++a)
            if (
              ((c = g[a]),
              (c.action !== c.ACTION.DIE || c.objecttype === m.TYPE_PC) &&
                0 === c.remove_tick &&
                e > c.boundingRect.x1 &&
                e < c.boundingRect.x2 &&
                f > c.boundingRect.y1 &&
                f < c.boundingRect.y2)
            )
              return c;
          return null;
        }
      },
    };
    return (m.Manager = a);
  },
);
