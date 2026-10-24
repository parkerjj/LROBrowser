define("Audio/SoundManager", [
  "Core/Client",
  "Preferences/Audio",
  "Core/MemoryManager",
  "Utils/gl-matrix",
  "Engine/SessionStorage",
], function (a, b, c, d, e) {
  function m() {
    if (k[this.filename]) {
      var a = k[this.filename].instances.indexOf(this);
      -1 !== a &&
        (k[this.filename].instances.splice(a, 1),
        0 == k[this.filename].instances.length && delete k[this.filename]);
      r(this);
    }
  }
  function h() {
    var a = k[this.filename].instances.indexOf(this);
    -1 !== a &&
      (k[this.filename].instances.splice(a, 1),
      0 == k[this.filename].instances.length && delete k[this.filename]);
    this.remove();
    t--;
  }
  function r(a) {
    a.filename &&
      (a.filename in g ||
        ((g[a.filename] = {}), (g[a.filename].instances = [])),
      g[a.filename].instances.length < Math.ceil(30 * (1 - t / 800))
        ? ((a.currentTime = 0),
          (a.cleanupHandle = setTimeout(function () {
            if (
              a.filename &&
              a.filename in g &&
              0 < g[a.filename].instances.length
            ) {
              var b = g[a.filename].instances.indexOf(a);
              -1 !== b &&
                (g[a.filename].instances.splice(b, 1), a.remove(), t--);
            }
          }, 3e4)),
          g[a.filename].instances.push(a))
        : (a.remove(), t--));
  }
  function q(a) {
    var b = null;
    a in g &&
      0 < g[a].instances.length &&
      ((b = g[a].instances.pop()),
      b.cleanupHandle && clearTimeout(b.cleanupHandle));
    return b;
  }
  var k = {},
    g = {},
    t = 0,
    l = {};
  l.volume = b.Sound.volume;
  l.play = function (c, d) {
    var f;
    f = d ? d * this.volume : this.volume;
    0 >= f ||
      !b.Sound.play ||
      (c in k || ((k[c] = {}), (k[c].instances = []), (k[c].lastTick = 0)),
      (d = q(c))
        ? ((d.volume = Math.min(f, 1)),
          (d._volume = f),
          d.play(),
          k[c].instances.push(d),
          (k[c].lastTick = Date.now()))
        : a.loadFile("data/wav/" + c, function (a) {
            var b;
            (c in k &&
              (k[c].lastTick > Date.now() - 100 ||
                k[c].instances.length > Math.ceil(10 * (1 - t / 800)))) ||
              ((b = document.createElement("audio")),
              t++,
              (b.filename = c),
              (b.src = a),
              (b.volume = Math.min(f, 1)),
              (b._volume = f),
              b.addEventListener("error", h, !1),
              b.addEventListener("ended", m, !1),
              b.play(),
              k[c].instances.push(b),
              (k[c].lastTick = Date.now()));
          }));
  };
  l.playPosition = function (a, b) {
    b = Math.floor(d.vec2.dist(b, e.Entity.position));
    l.play(a, Math.max(1 - Math.abs((0.99 * (b - 1)) / 24 + 0.01), 0.1));
  };
  l.stop = function (a) {
    var b, d;
    if (a) {
      if (a in k) {
        for (; 0 < k[a].instances.length;)
          ((b = k[a].instances.shift()), b.pause(), b.remove(), t--);
        delete k[a];
      }
    } else
      for (
        Object.keys(k).forEach(function (a) {
          for (; 0 < k[a].instances.length;) {
            var b = k[a].instances.shift();
            b.pause();
            b.remove();
            t--;
          }
          delete k[a];
        }),
          d = c.search(/\.wav$/),
          a = 0,
          b = d.length;
        a < b;
        ++a
      )
        c.remove(d[a]);
  };
  l.setVolume = function (a) {
    this.volume = Math.min(a, 1);
    b.Sound.volume = this.volume;
    b.save();
    Object.keys(k).forEach(function (a) {
      k[a].instances.forEach(function (a) {
        a.volume = Math.min(a._volume, 1);
      });
    });
  };
  return l;
});
