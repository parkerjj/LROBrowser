define(
  "Renderer/MapRenderer",
  "require Core/Thread Audio/SoundManager Audio/BGM DB/DBManager UI/UIManager UI/Background UI/CursorManager Engine/SessionStorage Core/MemoryManager Controls/MouseEventHandler Renderer/Renderer Renderer/CartObject Renderer/FalconObject Renderer/WolfObject Renderer/Camera Renderer/EntityManager Renderer/GhostManager Renderer/Map/GridSelector Renderer/Map/Ground Renderer/Map/Altitude Renderer/Map/Water Renderer/Map/Models Renderer/Map/Sounds Renderer/Map/Effects Renderer/SpriteRenderer Renderer/EffectManager Renderer/Effects/Sky Renderer/Effects/Damage Preferences/Map".split(
    " ",
  ),
  function (a) {
    function b(a) {
      l.setPercent(a);
    }
    function c(a) {
      this.light = a.light;
      this.water = a.water;
      this.sounds = a.sound;
      this.effects = a.effect;
      this.light.direction = new Float32Array(3);
      a = (this.light.longitude * Math.PI) / 180;
      var b = (this.light.latitude * Math.PI) / 180;
      this.light.direction[0] = -Math.cos(a) * Math.sin(b);
      this.light.direction[1] = -Math.cos(b);
      this.light.direction[2] = -Math.sin(a) * Math.sin(b);
    }
    function d(a) {
      var b = t.getContext();
      this.water.mesh = a.waterMesh;
      this.water.vertCount = a.waterVertCount;
      O.init(b, a);
      H.init(b, this.water);
      var c, d;
      c = this.sounds.length;
      for (b = 0; b < c; ++b)
        ((d = -this.sounds[b].pos[1]),
          (this.sounds[b].pos[0] += a.width),
          (this.sounds[b].pos[1] = this.sounds[b].pos[2] + a.height),
          (this.sounds[b].pos[2] = d),
          (this.sounds[b].range *= 0.2),
          (this.sounds[b].tick = 0),
          I.add(this.sounds[b]));
      c = this.effects.length;
      for (b = 0; b < c; ++b)
        ((d = -this.effects[b].pos[1]),
          (this.effects[b].pos[0] += a.width - 0.45),
          (this.effects[b].pos[1] = this.effects[b].pos[2] + a.height + 0.5),
          (this.effects[b].pos[2] = d),
          (this.effects[b].tick = 0),
          D.add(this.effects[b]));
      this.effects.length = 0;
      this.sounds.length = 0;
    }
    function e(a) {
      var b = t.getContext();
      M.init(a);
      F.init(b);
    }
    function m(a) {
      x.init(t.getContext(), a);
    }
    function h(a, b) {
      var c = this.currentMap.replace(/\.gat$/i, ".rsw"),
        d = g.getMap(c);
      a
        ? (k.play((d && d.mp3) || "01.mp3"),
          (this.fog.exist = !(!d || !d.fog)),
          this.fog.exist &&
            ((this.fog.near = 230 * d.fog.near),
            (this.fog.far = 460 * d.fog.far),
            (this.fog.factor = d.fog.factor),
            this.fog.color.set(d.fog.color)),
          t.init(),
          (a = t.getContext()),
          L.init(a),
          G.init(a, c),
          K.init(a),
          y.init(a),
          l.remove(function () {
            Q.loading = !1;
            v.intersect = !0;
            Q.onLoad();
            G.setUpCloudData();
            t.show();
            t.render(Q.onRender);
          }))
        : u.showErrorBox(b).ui.css("zIndex", 1e3);
    }
    var q = a("Core/Thread"),
      r = a("Audio/SoundManager"),
      k = a("Audio/BGM"),
      g = a("DB/DBManager"),
      u = a("UI/UIManager"),
      l = a("UI/Background"),
      f = a("UI/CursorManager"),
      n = a("Engine/SessionStorage"),
      p = a("Core/MemoryManager"),
      v = a("Controls/MouseEventHandler"),
      t = a("Renderer/Renderer"),
      z = a("Renderer/CartObject"),
      E = a("Renderer/FalconObject"),
      C = a("Renderer/WolfObject"),
      J = a("Renderer/Camera"),
      A = a("Renderer/EntityManager"),
      B = a("Renderer/GhostManager"),
      F = a("Renderer/Map/GridSelector"),
      O = a("Renderer/Map/Ground"),
      M = a("Renderer/Map/Altitude"),
      H = a("Renderer/Map/Water"),
      x = a("Renderer/Map/Models"),
      I = a("Renderer/Map/Sounds"),
      D = a("Renderer/Map/Effects"),
      L = a("Renderer/SpriteRenderer"),
      y = a("Renderer/EffectManager"),
      G = a("Renderer/Effects/Sky"),
      K = a("Renderer/Effects/Damage"),
      N = a("Preferences/Map"),
      Q = {
        currentMap: "",
        light: null,
        water: null,
        sounds: null,
        effects: null,
        loading: !1,
        infos: null,
      };
    Q.fog = {
      use: N.fog,
      exist: !0,
      far: 30,
      near: 180,
      factor: 1,
      color: new Float32Array([1, 1, 1]),
    };
    Q.setMap = function (a) {
      if (!this.loading || this.currentMap != a)
        if (
          ((a = a.replace(/^(\d{3})(\d@)/, "$2").replace(/^\d{3}#/, "")),
          r.stop(),
          t.stop(),
          f.setType(f.ACTION.DEFAULT),
          u.removeComponents(),
          this.currentMap !== a)
        ) {
          this.loading = !0;
          k.stop();
          this.currentMap = a;
          var g = a.replace(/\.gat$/i, ".rsw");
          l.setLoading(function () {
            q.hook("MAP_PROGRESS", b.bind(Q));
            q.hook("MAP_WORLD", c.bind(Q));
            q.hook("MAP_GROUND", d.bind(Q));
            q.hook("MAP_ALTITUDE", e.bind(Q));
            q.hook("MAP_MODELS", m.bind(Q));
            Q.free();
            t.remove();
            q.send("LOAD_MAP", g, h.bind(Q));
          });
        } else
          ((a = t.getContext()),
            B.free(),
            A.free(),
            K.free(a),
            y.free(a),
            l.remove(function () {
              Q.onLoad();
              G.setUpCloudData();
              t.render(Q.onRender);
            }));
    };
    Q.free = function () {
      var a = t.getContext();
      B.free();
      A.free();
      F.free(a);
      I.free();
      D.free();
      O.free(a);
      H.free(a);
      x.free(a);
      K.free(a);
      y.free(a);
      r.stop();
      k.stop();
      v.intersect = !1;
      v.padOn = !1;
      this.effects = this.sounds = this.water = this.light = null;
    };
    var W = new Uint16Array(2);
    Q.onRender = function (a, b) {
      var c = Q.fog;
      c.use = N.fog;
      var d = Q.light,
        e,
        f,
        g;
      v.world.x = -1;
      v.world.y = -1;
      v.world.z = -1;
      b.clear(b.COLOR_BUFFER_BIT | b.DEPTH_BUFFER_BIT);
      J.update(a);
      e = J.modelView;
      f = J.projection;
      g = J.normalMat;
      G.render(b, e, f, c, a);
      "rogue" == Q.currentMap.replace(/\.gat$/i, "")
        ? O.render(b, e, f, g, c, d, !0)
        : O.render(b, e, f, g, c, d, !1);
      x.render(b, e, f, g, c, d, N.lightmap);
      H.render(b, e, f, c, d, a);
      v.intersect &&
        M.intersect(e, f, W) &&
        ((d = W[0]),
        (g = W[1]),
        M.getCellType(d, g) & M.TYPE.WALKABLE &&
          (F.render(b, e, f, c, d, g),
          (v.world.x = d),
          (v.world.y = g),
          (v.world.z = M.getCellHeight(d, g))));
      z.render();
      E.render();
      C.render();
      y.render(b, e, f, c, a, !0);
      B.render(b, e, f, c);
      A.render(b, e, f, c, !0);
      A.render(b, e, f, c, !1);
      y.render(b, e, f, c, a, !1);
      K.render(b, e, f, c, a);
      D.spam(n.Entity.position, a);
      I.render(n.Entity.position, a);
      v.intersect && !v.padOn && ((c = A.intersect()), A.setOverEntity(c));
      p.clean(b, a);
    };
    Q.onLoad = function () {};
    return Q;
  },
);
