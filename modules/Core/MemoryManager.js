define("Core/MemoryManager", ["Core/MemoryItem"], function (a) {
  function b(b, c, e) {
    d[b] || (d[b] = new a());
    b = d[b];
    c && b.addEventListener("load", c);
    e && b.addEventListener("error", e);
    return b.data;
  }
  function c(a, c) {
    if (d[c]) {
      var e = b(c),
        h = "",
        m;
      (m = c.match(/\.[^\.]+$/)) && (h = m.toString().toLowerCase());
      if (e)
        switch (h) {
          case ".spr":
            if (e.frames)
              for (h = 0, m = e.frames.length; h < m; ++h)
                e.frames[h].texture &&
                  a.isTexture(e.frames[h].texture) &&
                  a.deleteTexture(e.frames[h].texture);
            e.texture && a.isTexture(e.texture) && a.deleteTexture(e.texture);
            break;
          case ".pal":
            e.texture && a.isTexture(e.texture) && a.deleteTexture(e.texture);
            break;
          default:
            e.match && e.match(/^blob\:/) && URL.revokeObjectURL(e);
        }
      delete d[c];
    }
  }
  var d = {},
    e = 0;
  return {
    get: b,
    set: function (b, c, e) {
      d[b] || (d[b] = new a());
      if (e || !c) d[b].onerror(e);
      else d[b].onload(c);
    },
    clean: function (a, b) {
      if (!(e + 3e4 > b)) {
        var h,
          m,
          k,
          g,
          t,
          l = [];
        h = Object.keys(d);
        g = h.length;
        t = b - 12e4;
        for (k = 0; k < g; ++k)
          ((m = d[h[k]]),
            m.complete && m.lastTimeUsed < t && (c(a, h[k]), l.push(h[k])));
        e = b;
      }
    },
    remove: c,
    exist: function (a) {
      return !!d[a];
    },
    search: function (a) {
      var b,
        c,
        e,
        m = [];
      b = Object.keys(d);
      e = b.length;
      for (c = 0; c < e; ++c) b[c].match(a) && m.push(b[c]);
      return m;
    },
  };
});
