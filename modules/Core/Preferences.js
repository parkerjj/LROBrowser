define("Core/Preferences", ["./Context"], function (a) {
  function b(a) {
    var b = a._key;
    delete a._key;
    delete a.save;
    var e = {};
    e[b] = JSON.stringify(a);
    d.set(e);
    a._key = b;
    a.save = c;
  }
  function c() {
    b(this);
  }
  var d = a.Is.APP
    ? window.chrome.storage.local
    : {
        get: function (a, d) {
          var b = {};
          b[a] = localStorage.getItem(a);
          d(b);
        },
        set: function (a, d) {
          var b = Object.keys(a),
            c,
            e;
          c = 0;
          for (e = b.length; c < e; ++c) localStorage.setItem(b[c], a[b[c]]);
          d && d();
        },
      };
  return {
    get: function (a, m, h) {
      d.get(a, function (d) {
        var e, k, g;
        h = h || 0;
        if (d[a] && JSON.parse(d[a])._version === h)
          for (
            d = JSON.parse(d[a]),
              d._key = a,
              d._version = h,
              d.save = c,
              e = Object.keys(d),
              g = e.length,
              k = 0;
            k < g;
            ++k
          )
            m[e[k]] = d[e[k]];
        else b(m);
      });
      m._key = a;
      m._version = h;
      m.save = c;
      return m;
    },
    save: b,
  };
});
