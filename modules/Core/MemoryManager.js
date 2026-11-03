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
        l;
      (l = c.match(/\.[^\.]+$/)) && (h = l.toString().toLowerCase());
      if (e)
        switch (h) {
          case ".spr":
            if (e.frames)
              for (h = 0, l = e.frames.length; h < l; ++h)
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
          l,
          n,
          g,
          p,
          k = [];
        h = Object.keys(d);
        g = h.length;
        p = b - 12e4;
        for (n = 0; n < g; ++n)
          ((l = d[h[n]]),
            l.complete && l.lastTimeUsed < p && (c(a, h[n]), k.push(h[n])));
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
        l = [];
      b = Object.keys(d);
      e = b.length;
      for (c = 0; c < e; ++c) b[c].match(a) && l.push(b[c]);
      return l;
    },
  };
});
