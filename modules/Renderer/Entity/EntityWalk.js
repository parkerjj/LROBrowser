define(
  "Renderer/Entity/EntityWalk",
  "require Utils/PathFinding Renderer/Renderer Renderer/Map/Altitude Engine/SessionStorage UI/Components/MiniMap/MiniMap".split(
    " ",
  ),
  function (a) {
    function b() {
      this.speed = 150;
      this.tick = 0;
      this.path = new Int16Array(64);
      this.pos = new Float32Array(3);
      this.onEnd = null;
      this.total = this.index = 0;
    }
    function c() {
      this.walk.pos.set(this.position);
      this.walk.tick = h.tick;
      this.headDir = 0;
      this.action == this.ACTION.WALK &&
        this.setAction({
          action: this.ACTION.IDLE,
          frame: 0,
          play: !0,
          repeat: !0,
        });
      this.dy = this.dx = 0;
    }
    function d(a, b, c, d, e) {
      var f = this.walk.path;
      c = m.search(a | 0, b | 0, c | 0, d | 0, e || 0, f);
      this.walk.index = 2;
      this.walk.total = 2 * c;
      !c ||
        (2 === c &&
          f[this.walk.index + 0] === a &&
          f[this.walk.index + 1] === b) ||
        (this.walk.pos.set(this.position),
        (this.walk.tick = h.tick),
        (this.headDir = 0),
        this.action !== this.ACTION.WALK &&
          this.setAction({
            action: this.ACTION.WALK,
            frame: 0,
            repeat: !0,
            play: !0,
          }));
    }
    function e() {
      var a = this.position,
        b = this.walk,
        c = b.path,
        d = b.index,
        e = b.total,
        m,
        u,
        A,
        D = h.tick;
      if (d < e) {
        for (; d < e;) {
          m = c[d + 0] - b.pos[0];
          u = c[d + 1] - b.pos[1];
          A = m && u ? b.speed / 0.7 : b.speed;
          if (D - b.tick <= A) break;
          b.tick += A;
          b.pos[0] = c[d + 0];
          b.pos[1] = c[d + 1];
          d += 2;
        }
        c = Math.min(A, D - b.tick);
        b.index = d;
        c || (c = 150);
        a[0] = b.pos[0] + m / (A / c);
        a[1] = b.pos[1] + u / (A / c);
        a[2] = r.getCellHeight(a[0], a[1]);
        this._position[0] = a[0];
        this._position[1] = a[1];
        this._position[2] = a[2] + 3;
        q.Entity.GID == this.GID &&
          k.setPosition(Math.round(a[0]), Math.round(a[1]));
        if (d < e) {
          this.direction =
            g[(0 < m ? 1 : 0 > m ? -1 : 0) + 1][
              (0 < u ? 1 : 0 > u ? -1 : 0) + 1
            ];
          return;
        }
      }
      this.setAction({
        action: this.ACTION.IDLE,
        frame: 0,
        play: !0,
        repeat: !0,
      });
      this.onWalkEnd();
      b.onEnd && (b.onEnd(), (b.onEnd = null));
      a[0] = Math.round(a[0]);
      a[1] = Math.round(a[1]);
      a[2] = r.getCellHeight(a[0], a[1]);
      this._position[0] = a[0];
      this._position[1] = a[1];
      this._position[2] = a[2] + 3;
      q.Entity.GID == this.GID && k.setPosition(a[0], a[1]);
    }
    var m = a("Utils/PathFinding"),
      h = a("Renderer/Renderer"),
      r = a("Renderer/Map/Altitude"),
      q = a("Engine/SessionStorage"),
      k = a("UI/Components/MiniMap/MiniMap"),
      g = [
        [1, 2, 3],
        [0, 0, 4],
        [7, 6, 5],
      ];
    return function () {
      this.onWalkEnd = function () {};
      this.walk = new b();
      this.walkTo = d;
      this.walkProcess = e;
      this.walkStop = c;
    };
  },
);
