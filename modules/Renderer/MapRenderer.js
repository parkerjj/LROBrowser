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
      var b = u.getContext();
      this.water.mesh = a.waterMesh;
      this.water.vertCount = a.waterVertCount;
      J.init(b, a);
      L.init(b, this.water);
      var c, d;
      c = this.sounds.length;
      for (b = 0; b < c; ++b)
        ((d = -this.sounds[b].pos[1]),
          (this.sounds[b].pos[0] += a.width),
          (this.sounds[b].pos[1] = this.sounds[b].pos[2] + a.height),
          (this.sounds[b].pos[2] = d),
          (this.sounds[b].range *= 0.2),
          (this.sounds[b].tick = 0),
          M.add(this.sounds[b]));
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
      I.init(a);
      z.init(b);
    }
    function m(a) {
      x.init(u.getContext(), a);
    }
    function h(a, b) {
      var c = this.currentMap.replace(/\.gat$/i, ".rsw"),
        d = g.getMap(c);
      a
        ? (k.play((d && d.mp3) || "01.mp3"),
          (this.fog.exist = !(!d || !d.fog)),
          this.fog.exist &&
            ((this.fog.near = 230 * d.fog.near),
            (this.fog.far = 360 * d.fog.far),
            (this.fog.factor = d.fog.factor),
            this.fog.color.set(d.fog.color)),
          u.init(),
          (a = u.getContext()),
          F.init(a),
          H.init(a, c),
          K.init(a),
          G.init(a),
          l.remove(function () {
            N.loading = !1;
            v.intersect = !0;
            N.onLoad();
            H.setUpCloudData();
            u.show();
            u.render(N.onRender);
          }))
        : t.showErrorBox(b).ui.css("zIndex", 1e3);
    }
    var r = a("Core/Thread"),
      q = a("Audio/SoundManager"),
      k = a("Audio/BGM"),
      g = a("DB/DBManager"),
      t = a("UI/UIManager"),
      l = a("UI/Background"),
      f = a("UI/CursorManager"),
      n = a("Engine/SessionStorage"),
      p = a("Core/MemoryManager"),
      v = a("Controls/MouseEventHandler"),
      u = a("Renderer/Renderer"),
      A = a("Renderer/CartObject"),
      D = a("Renderer/FalconObject"),
      B = a("Renderer/WolfObject"),
      O = a("Renderer/Camera"),
      C = a("Renderer/EntityManager"),
      y = a("Renderer/GhostManager"),
      z = a("Renderer/Map/GridSelector"),
      J = a("Renderer/Map/Ground"),
      I = a("Renderer/Map/Altitude"),
      L = a("Renderer/Map/Water"),
      x = a("Renderer/Map/Models"),
      M = a("Renderer/Map/Sounds"),
      E = a("Renderer/Map/Effects"),
      F = a("Renderer/SpriteRenderer"),
      G = a("Renderer/EffectManager"),
      H = a("Renderer/Effects/Sky"),
      K = a("Renderer/Effects/Damage"),
      P = a("Preferences/Map"),
      N = {
        currentMap: "",
        light: null,
        water: null,
        sounds: null,
        effects: null,
        loading: !1,
        infos: null,
      };
    N.fog = {
      use: P.fog,
      exist: !0,
      far: 30,
      near: 180,
      factor: 1,
      color: new Float32Array([1, 1, 1]),
    };
    N.setMap = function (a) {
      if (!this.loading || this.currentMap != a)
        if (
          ((a = a.replace(/^(\d{3})(\d@)/, "$2").replace(/^\d{3}#/, "")),
          q.stop(),
          u.stop(),
          f.setType(f.ACTION.DEFAULT),
          t.removeComponents(),
          this.currentMap !== a)
        ) {
          this.loading = !0;
          k.stop();
          this.currentMap = a;
          var g = a.replace(/\.gat$/i, ".rsw");
          l.setLoading(function () {
            r.hook("MAP_PROGRESS", b.bind(N));
            r.hook("MAP_WORLD", c.bind(N));
            r.hook("MAP_GROUND", d.bind(N));
            r.hook("MAP_ALTITUDE", e.bind(N));
            r.hook("MAP_MODELS", m.bind(N));
            N.free();
            u.remove();
            r.send("LOAD_MAP", g, h.bind(N));
          });
        } else
          ((a = u.getContext()),
            y.free(),
            C.free(),
            K.free(a),
            G.free(a),
            l.remove(function () {
              N.onLoad();
              H.setUpCloudData();
              u.render(N.onRender);
            }));
    };
    N.free = function () {
      var a = u.getContext();
      y.free();
      C.free();
      z.free(a);
      M.free();
      E.free();
      J.free(a);
      L.free(a);
      x.free(a);
      K.free(a);
      G.free(a);
      q.stop();
      k.stop();
      v.intersect = !1;
      v.padOn = !1;
      this.effects = this.sounds = this.water = this.light = null;
    };
    var S = new Uint16Array(2);
    N.onRender = function (a, b) {
      var c = N.fog;
      c.use = P.fog;
      var d = N.light,
        e,
        f,
        g;
      v.world.x = -1;
      v.world.y = -1;
      v.world.z = -1;
      b.clear(b.COLOR_BUFFER_BIT | b.DEPTH_BUFFER_BIT);
      O.update(a);
      e = O.modelView;
      f = O.projection;
      g = O.normalMat;
      H.render(b, e, f, c, a);
      "rogue" == N.currentMap.replace(/\.gat$/i, "")
        ? J.render(b, e, f, g, c, d, !0)
        : J.render(b, e, f, g, c, d, !1);
      x.render(b, e, f, g, c, d, P.lightmap);
      L.render(b, e, f, c, d, a);
      v.intersect &&
        I.intersect(e, f, S) &&
        ((d = S[0]),
        (g = S[1]),
        I.getCellType(d, g) & I.TYPE.WALKABLE &&
          (z.render(b, e, f, c, d, g),
          (v.world.x = d),
          (v.world.y = g),
          (v.world.z = I.getCellHeight(d, g))));
      A.render();
      D.render();
      B.render();
      G.render(b, e, f, c, a, !0);
      y.render(b, e, f, c);
      C.render(b, e, f, c, !0);
      C.render(b, e, f, c, !1);
      G.render(b, e, f, c, a, !1);
      K.render(b, e, f, c, a);
      E.spam(n.Entity.position, a);
      M.render(n.Entity.position, a);
      v.intersect && !v.padOn && ((c = C.intersect()), C.setOverEntity(c));
      p.clean(b, a);
    };
    N.onLoad = function () {};
    return N;
  },
);
