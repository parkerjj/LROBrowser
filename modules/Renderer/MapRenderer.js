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
      var b = v.getContext();
      this.water.mesh = a.waterMesh;
      this.water.vertCount = a.waterVertCount;
      N.init(b, a);
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
          K.add(this.sounds[b]));
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
      var b = v.getContext();
      O.init(a);
      H.init(b);
    }
    function m(a) {
      x.init(v.getContext(), a);
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
          v.init(),
          (a = v.getContext()),
          F.init(a),
          G.init(a, c),
          L.init(a),
          z.init(a),
          l.remove(function () {
            Q.loading = !1;
            u.intersect = !0;
            Q.onLoad();
            G.setUpCloudData();
            v.show();
            v.render(Q.onRender);
          }))
        : p.showErrorBox(b).ui.css("zIndex", 1e3);
    }
    var t = a("Core/Thread"),
      r = a("Audio/SoundManager"),
      n = a("Audio/BGM"),
      g = a("DB/DBManager"),
      p = a("UI/UIManager"),
      l = a("UI/Background"),
      f = a("UI/CursorManager"),
      k = a("Engine/SessionStorage"),
      q = a("Core/MemoryManager"),
      u = a("Controls/MouseEventHandler"),
      v = a("Renderer/Renderer"),
      A = a("Renderer/CartObject"),
      C = a("Renderer/FalconObject"),
      B = a("Renderer/WolfObject"),
      J = a("Renderer/Camera"),
      D = a("Renderer/EntityManager"),
      y = a("Renderer/GhostManager"),
      H = a("Renderer/Map/GridSelector"),
      N = a("Renderer/Map/Ground"),
      O = a("Renderer/Map/Altitude"),
      I = a("Renderer/Map/Water"),
      x = a("Renderer/Map/Models"),
      K = a("Renderer/Map/Sounds"),
      E = a("Renderer/Map/Effects"),
      F = a("Renderer/SpriteRenderer"),
      z = a("Renderer/EffectManager"),
      G = a("Renderer/Effects/Sky"),
      L = a("Renderer/Effects/Damage"),
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
          r.stop(),
          v.stop(),
          f.setType(f.ACTION.DEFAULT),
          p.removeComponents(),
          this.currentMap !== a)
        ) {
          this.loading = !0;
          n.stop();
          this.currentMap = a;
          var g = a.replace(/\.gat$/i, ".rsw");
          l.setLoading(function () {
            t.hook("MAP_PROGRESS", b.bind(Q));
            t.hook("MAP_WORLD", c.bind(Q));
            t.hook("MAP_GROUND", d.bind(Q));
            t.hook("MAP_ALTITUDE", e.bind(Q));
            t.hook("MAP_MODELS", m.bind(Q));
            Q.free();
            v.remove();
            t.send("LOAD_MAP", g, h.bind(Q));
          });
        } else
          ((a = v.getContext()),
            y.free(),
            D.free(),
            L.free(a),
            z.free(a),
            l.remove(function () {
              Q.onLoad();
              G.setUpCloudData();
              v.render(Q.onRender);
            }));
    };
    Q.free = function () {
      var a = v.getContext();
      y.free();
      D.free();
      H.free(a);
      K.free();
      E.free();
      N.free(a);
      I.free(a);
      x.free(a);
      L.free(a);
      z.free(a);
      r.stop();
      n.stop();
      u.intersect = !1;
      u.padOn = !1;
      this.effects = this.sounds = this.water = this.light = null;
    };
    var V = new Uint16Array(2);
    Q.onRender = function (a, b) {
      var c = Q.fog;
      c.use = M.fog;
      var d = Q.light,
        e,
        f,
        g;
      u.world.x = -1;
      u.world.y = -1;
      u.world.z = -1;
      b.clear(b.COLOR_BUFFER_BIT | b.DEPTH_BUFFER_BIT);
      J.update(a);
      e = J.modelView;
      f = J.projection;
      g = J.normalMat;
      G.render(b, e, f, c, a);
      "rogue" == Q.currentMap.replace(/\.gat$/i, "")
        ? N.render(b, e, f, g, c, d, !0)
        : N.render(b, e, f, g, c, d, !1);
      x.render(b, e, f, g, c, d, M.lightmap);
      I.render(b, e, f, c, d, a);
      u.intersect &&
        O.intersect(e, f, V) &&
        ((d = V[0]),
        (g = V[1]),
        O.getCellType(d, g) & O.TYPE.WALKABLE &&
          (H.render(b, e, f, c, d, g),
          (u.world.x = d),
          (u.world.y = g),
          (u.world.z = O.getCellHeight(d, g))));
      A.render();
      C.render();
      B.render();
      z.render(b, e, f, c, a, !0);
      y.render(b, e, f, c);
      D.render(b, e, f, c, !0);
      D.render(b, e, f, c, !1);
      z.render(b, e, f, c, a, !1);
      L.render(b, e, f, c, a);
      E.spam(k.Entity.position, a);
      K.render(k.Entity.position, a);
      u.intersect && !u.padOn && ((c = D.intersect()), D.setOverEntity(c));
      q.clean(b, a);
    };
    Q.onLoad = function () {};
    return Q;
  },
);
