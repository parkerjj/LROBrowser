define(
  "Renderer/MapRenderer",
  "require Core/Thread Audio/SoundManager Audio/BGM DB/DBManager UI/UIManager UI/Background UI/CursorManager Engine/SessionStorage Core/MemoryManager Controls/MouseEventHandler Renderer/Renderer Renderer/CartObject Renderer/FalconObject Renderer/WolfObject Renderer/Camera Renderer/EntityManager Renderer/GhostManager Renderer/Map/GridSelector Renderer/Map/Ground Renderer/Map/Altitude Renderer/Map/Water Renderer/Map/Models Renderer/Map/Sounds Renderer/Map/Effects Renderer/SpriteRenderer Renderer/EffectManager Renderer/Effects/Sky Renderer/Effects/Damage Preferences/Map".split(
    " ",
  ),
  function (a) {
    function b(a) {
      k.setPercent(a);
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
      var b = u.getContext();
      this.water.mesh = a.waterMesh;
      this.water.vertCount = a.waterVertCount;
      P.init(b, a);
      I.init(b, this.water);
      var c, d;
      c = this.sounds.length;
      for (b = 0; b < c; ++b)
        ((d = -this.sounds[b].pos[1]),
          (this.sounds[b].pos[0] += a.width),
          (this.sounds[b].pos[1] = this.sounds[b].pos[2] + a.height),
          (this.sounds[b].pos[2] = d),
          (this.sounds[b].range *= 0.2),
          (this.sounds[b].tick = 0),
          J.add(this.sounds[b]));
      c = this.effects.length;
      for (b = 0; b < c; ++b)
        ((d = -this.effects[b].pos[1]),
          (this.effects[b].pos[0] += a.width - 0.45),
          (this.effects[b].pos[1] = this.effects[b].pos[2] + a.height + 0.5),
          (this.effects[b].pos[2] = d),
          (this.effects[b].tick = 0),
          E.add(this.effects[b]));
      this.effects.length = 0;
      this.sounds.length = 0;
    }
    function e(a) {
      var b = u.getContext();
      N.init(a);
      G.init(b);
    }
    function l(a) {
      x.init(u.getContext(), a);
    }
    function h(a, b) {
      var c = this.currentMap.replace(/\.gat$/i, ".rsw"),
        d = g.getMap(c);
      a
        ? (n.play((d && d.mp3) || "01.mp3"),
          (this.fog.exist = !(!d || !d.fog)),
          this.fog.exist &&
            ((this.fog.near = 230 * d.fog.near),
            (this.fog.far = 460 * d.fog.far),
            (this.fog.factor = d.fog.factor),
            this.fog.color.set(d.fog.color)),
          u.init(),
          (a = u.getContext()),
          L.init(a),
          F.init(a, c),
          K.init(a),
          y.init(a),
          k.remove(function () {
            Q.loading = !1;
            v.intersect = !0;
            Q.onLoad();
            F.setUpCloudData();
            u.show();
            u.render(Q.onRender);
          }))
        : p.showErrorBox(b).ui.css("zIndex", 1e3);
    }
    var r = a("Core/Thread"),
      t = a("Audio/SoundManager"),
      n = a("Audio/BGM"),
      g = a("DB/DBManager"),
      p = a("UI/UIManager"),
      k = a("UI/Background"),
      f = a("UI/CursorManager"),
      m = a("Engine/SessionStorage"),
      q = a("Core/MemoryManager"),
      v = a("Controls/MouseEventHandler"),
      u = a("Renderer/Renderer"),
      A = a("Renderer/CartObject"),
      D = a("Renderer/FalconObject"),
      B = a("Renderer/WolfObject"),
      H = a("Renderer/Camera"),
      C = a("Renderer/EntityManager"),
      z = a("Renderer/GhostManager"),
      G = a("Renderer/Map/GridSelector"),
      P = a("Renderer/Map/Ground"),
      N = a("Renderer/Map/Altitude"),
      I = a("Renderer/Map/Water"),
      x = a("Renderer/Map/Models"),
      J = a("Renderer/Map/Sounds"),
      E = a("Renderer/Map/Effects"),
      L = a("Renderer/SpriteRenderer"),
      y = a("Renderer/EffectManager"),
      F = a("Renderer/Effects/Sky"),
      K = a("Renderer/Effects/Damage"),
      M = a("Preferences/Map"),
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
      use: M.fog,
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
          t.stop(),
          u.stop(),
          f.setType(f.ACTION.DEFAULT),
          p.removeComponents(),
          this.currentMap !== a)
        ) {
          this.loading = !0;
          n.stop();
          this.currentMap = a;
          var g = a.replace(/\.gat$/i, ".rsw");
          k.setLoading(function () {
            r.hook("MAP_PROGRESS", b.bind(Q));
            r.hook("MAP_WORLD", c.bind(Q));
            r.hook("MAP_GROUND", d.bind(Q));
            r.hook("MAP_ALTITUDE", e.bind(Q));
            r.hook("MAP_MODELS", l.bind(Q));
            Q.free();
            u.remove();
            r.send("LOAD_MAP", g, h.bind(Q));
          });
        } else
          ((a = u.getContext()),
            z.free(),
            C.free(),
            K.free(a),
            y.free(a),
            k.remove(function () {
              Q.onLoad();
              F.setUpCloudData();
              u.render(Q.onRender);
            }));
    };
    Q.free = function () {
      var a = u.getContext();
      z.free();
      C.free();
      G.free(a);
      J.free();
      E.free();
      P.free(a);
      I.free(a);
      x.free(a);
      K.free(a);
      y.free(a);
      t.stop();
      n.stop();
      v.intersect = !1;
      v.padOn = !1;
      this.effects = this.sounds = this.water = this.light = null;
    };
    var W = new Uint16Array(2);
    Q.onRender = function (a, b) {
      var c = Q.fog;
      c.use = M.fog;
      var d = Q.light,
        e,
        f,
        g;
      v.world.x = -1;
      v.world.y = -1;
      v.world.z = -1;
      b.clear(b.COLOR_BUFFER_BIT | b.DEPTH_BUFFER_BIT);
      H.update(a);
      e = H.modelView;
      f = H.projection;
      g = H.normalMat;
      F.render(b, e, f, c, a);
      "rogue" == Q.currentMap.replace(/\.gat$/i, "")
        ? P.render(b, e, f, g, c, d, !0)
        : P.render(b, e, f, g, c, d, !1);
      x.render(b, e, f, g, c, d, M.lightmap);
      I.render(b, e, f, c, d, a);
      v.intersect &&
        N.intersect(e, f, W) &&
        ((d = W[0]),
        (g = W[1]),
        N.getCellType(d, g) & N.TYPE.WALKABLE &&
          (G.render(b, e, f, c, d, g),
          (v.world.x = d),
          (v.world.y = g),
          (v.world.z = N.getCellHeight(d, g))));
      A.render();
      D.render();
      B.render();
      y.render(b, e, f, c, a, !0);
      z.render(b, e, f, c);
      C.render(b, e, f, c, !0);
      C.render(b, e, f, c, !1);
      y.render(b, e, f, c, a, !1);
      K.render(b, e, f, c, a);
      E.spam(m.Entity.position, a);
      J.render(m.Entity.position, a);
      v.intersect && !v.padOn && ((c = C.intersect()), C.setOverEntity(c));
      q.clean(b, a);
    };
    Q.onLoad = function () {};
    return Q;
  },
);
