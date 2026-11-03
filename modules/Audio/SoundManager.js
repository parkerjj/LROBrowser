define("Audio/SoundManager", [
  "Core/Client",
  "Preferences/Audio",
  "Core/MemoryManager",
  "Utils/gl-matrix",
  "Engine/SessionStorage",
], function (a, b, c, d, e) {
  function l() {
    if (n[this.filename]) {
      var a = n[this.filename].instances.indexOf(this);
      -1 !== a &&
        (n[this.filename].instances.splice(a, 1),
        0 == n[this.filename].instances.length && delete n[this.filename]);
      r(this);
    }
  }
  function h() {
    var a = n[this.filename].instances.indexOf(this);
    -1 !== a &&
      (n[this.filename].instances.splice(a, 1),
      0 == n[this.filename].instances.length && delete n[this.filename]);
    this.remove();
    p--;
  }
  function r(a) {
    a.filename &&
      (a.filename in g ||
        ((g[a.filename] = {}), (g[a.filename].instances = [])),
      g[a.filename].instances.length < Math.ceil(30 * (1 - p / 800))
        ? ((a.currentTime = 0),
          (a.cleanupHandle = setTimeout(function () {
            if (
              a.filename &&
              a.filename in g &&
              0 < g[a.filename].instances.length
            ) {
              var b = g[a.filename].instances.indexOf(a);
              -1 !== b &&
                (g[a.filename].instances.splice(b, 1), a.remove(), p--);
            }
          }, 3e4)),
          g[a.filename].instances.push(a))
        : (a.remove(), p--));
  }
  function t(a) {
    var b = null;
    a in g &&
      0 < g[a].instances.length &&
      ((b = g[a].instances.pop()),
      b.cleanupHandle && clearTimeout(b.cleanupHandle));
    return b;
  }
  var n = {},
    g = {},
    p = 0,
    k = {};
  k.volume = b.Sound.volume;
  k.play = function (c, d) {
    var f;
    f = d ? d * this.volume : this.volume;
    0 >= f ||
      !b.Sound.play ||
      (c in n || ((n[c] = {}), (n[c].instances = []), (n[c].lastTick = 0)),
      (d = t(c))
        ? ((d.volume = Math.min(f, 1)),
          (d._volume = f),
          d.play(),
          n[c].instances.push(d),
          (n[c].lastTick = Date.now()))
        : a.loadFile("data/wav/" + c, function (a) {
            var b;
            (c in n &&
              (n[c].lastTick > Date.now() - 100 ||
                n[c].instances.length > Math.ceil(10 * (1 - p / 800)))) ||
              ((b = document.createElement("audio")),
              p++,
              (b.filename = c),
              (b.src = a),
              (b.volume = Math.min(f, 1)),
              (b._volume = f),
              b.addEventListener("error", h, !1),
              b.addEventListener("ended", l, !1),
              b.play(),
              n[c].instances.push(b),
              (n[c].lastTick = Date.now()));
          }));
  };
  k.playPosition = function (a, b) {
    b = Math.floor(d.vec2.dist(b, e.Entity.position));
    k.play(a, Math.max(1 - Math.abs((0.99 * (b - 1)) / 24 + 0.01), 0.1));
  };
  k.stop = function (a) {
    var b, d;
    if (a) {
      if (a in n) {
        for (; 0 < n[a].instances.length;)
          ((b = n[a].instances.shift()), b.pause(), b.remove(), p--);
        delete n[a];
      }
    } else
      for (
        Object.keys(n).forEach(function (a) {
          for (; 0 < n[a].instances.length;) {
            var b = n[a].instances.shift();
            b.pause();
            b.remove();
            p--;
          }
          delete n[a];
        }),
          d = c.search(/\.wav$/),
          a = 0,
          b = d.length;
        a < b;
        ++a
      )
        c.remove(d[a]);
  };
  k.setVolume = function (a) {
    this.volume = Math.min(a, 1);
    b.Sound.volume = this.volume;
    b.save();
    Object.keys(n).forEach(function (a) {
      n[a].instances.forEach(function (a) {
        a.volume = Math.min(a._volume, 1);
      });
    });
  };
  return k;
});
