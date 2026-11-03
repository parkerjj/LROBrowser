define(
  "Renderer/Entity/EntityRender",
  "require Utils/gl-matrix Renderer/Camera Core/Client DB/Status/StatusState Renderer/Renderer Renderer/SpriteRenderer Renderer/Map/Ground Renderer/Map/Altitude Engine/SessionStorage DB/Jobs/JobConst".split(
    " ",
  ),
  function (a) {
    function b(b, c) {
      this.animations.process();
      this.objecttype != this.constructor.TYPE_WOLF &&
        this.action === this.ACTION.WALK &&
        this.walkProcess();
      this.boundingRect.x1 = Infinity;
      this.boundingRect.y1 = -Infinity;
      this.boundingRect.x2 = -Infinity;
      this.boundingRect.y2 = Infinity;
      if (this.effectColor[3])
        if (
          (!this.ghost ||
            this.is_mirror ||
            this.isDeath ||
            ((this.ghost.render = !0),
            this.renderEntity(!1),
            (this.ghost.render = !1)),
          this.renderEntity(!1),
          this.attachments.render(n.tick),
          this._explosion)
        ) {
          if (this.expTick + 800 < n.tick) {
            this.expTick = n.tick;
            var d = { effectId: 2018, ownerAID: this.GID };
            a("Renderer/EffectManager").spam(d);
          }
        } else
          this.explosion &&
            this.expTick + 800 < n.tick &&
            ((this.expTick = n.tick),
            (d =
              5 == this.objecttype
                ? { effectId: 2018, ownerAID: this.GID }
                : { effectId: 2017, ownerAID: this.GID }),
            a("Renderer/EffectManager").spam(d));
      f(this, b, c);
    }
    function c(a, b, c, d, f, e, l, k, p) {
      var q = (p = void 0 === p ? {} : p),
        h = void 0 === q.enableTrail ? !1 : q.enableTrail;
      p = void 0 === q.trailLength ? 5 : q.trailLength;
      var n = void 0 === q.blurType ? 1 : q.blurType;
      if (h && "shadow" !== e && "cartshadow" !== e && h) {
        a._trailData || (a._trailData = {});
        a._trailData[e] || (a._trailData[e] = { snapshots: [], lastTick: 0 });
        var u = a._trailData[e],
          v = Date.now(),
          q = 3 === n || 5 === n ? 560 : 100;
        p = 4 === n ? 1 : Math.floor(p / 2);
        h = !1;
        1 === n || 3 === n
          ? (h = a.action === a.ACTION.WALK && v - u.lastTick > q)
          : 4 === n
            ? (h = 0 === u.snapshots.length)
            : 5 === n &&
              (h =
                [
                  a.ACTION.ATTACK,
                  a.ACTION.ATTACK1,
                  a.ACTION.ATTACK2,
                  a.ACTION.ATTACK3,
                  a.ACTION.SKILL,
                ].includes(a.action) && v - u.lastTick > q);
        h &&
          (u.snapshots.unshift({
            position: m.vec3.clone(a.position),
            tick: v,
            layers: b,
            spr: c,
            pal: d,
            _position: new Int32Array(l),
            color: [].concat($jscomp.arrayFromIterable(a.effectColor)),
          }),
          (u.lastTick = v),
          u.snapshots.length > p && u.snapshots.pop());
        if (u.snapshots.length) {
          b = m.vec3.clone(g.position);
          var C = g.zIndex;
          c = new Float32Array(a.effectColor);
          g.runWithDepth(!0, !1, !1, function () {
            for (
              var b = 4 === n || 3 === n ? 800 : 400, c = 0;
              c < u.snapshots.length;
              c++
            ) {
              var d = u.snapshots[c],
                l = v - d.tick;
              if (!(
                (l > b && 4 !== n) ||
                ((l = Math.max(0, 0.5 * (1 - l / b))), 0.05 >= l && 4 !== n)
              ))
                for (
                  3 === n && (l *= 2),
                    1 !== n &&
                      ((a.effectColor[0] = 1),
                      (a.effectColor[1] = 1),
                      (a.effectColor[2] = 1)),
                    a.effectColor[3] = l,
                    g.position.set(d.position),
                    g.zIndex = C - c,
                    l = 0;
                  l < d.layers.length;
                  ++l
                )
                  a.renderLayer(
                    d.layers[l],
                    d.spr,
                    d.pal,
                    f.size,
                    d._position,
                    e,
                    !1,
                    k,
                  );
            }
          });
          g.position.set(b);
          g.zIndex = C;
          a.effectColor.set(c);
        }
      }
    }
    function d(a, b, c, d) {
      if (
        "shadow" === c ||
        "cartshadow" === c ||
        "robe" === c ||
        "undefined" === b.animations
      )
        return 0;
      var f = a.ACTION,
        e = a.action,
        g = a.animation,
        l = b.animations.length,
        k = l,
        f = e === f.IDLE || e === f.SIT;
      e =
        "body" === c && a.action === a.ACTION.WALK
          ? (b.delay / 150) * a.walk.speed
          : a.action === a.ACTION.ATTACK ||
              a.action === a.ACTION.ATTACK1 ||
              a.action === a.ACTION.ATTACK2 ||
              a.action === a.ACTION.ATTACK3
            ? a.attack_speed / b.animations.length
            : b.delay;
      b = 0;
      if ("cart" === c && f) return 0;
      if (
        ("body" === c && a.objecttype === a.constructor.TYPE_PC && f) ||
        ("body" === c && a.objecttype === a.constructor.TYPE_MERC && f)
      )
        return a.headDir;
      if (!1 === g.play) return Math.min(g.frame, k - 1);
      ("head" !== c && "head_" !== c) ||
        !f ||
        ((l = Math.floor(l / 3)), (b = a.headDir));
      if (g.repeat)
        return (
          (d = Math.floor(d / e)),
          a.sound.freeOnAnimationEnd(d, l),
          (d = (d % l) + l * b + g.frame),
          d % k
        );
      d = Math.min((d / e) | 0, l || l - 1) + l * b + g.frame;
      "body" === c &&
        d >= k - 1 &&
        ((g.frame = d = k - 1), (g.play = !1), g.next && a.setAction(g.next));
      return Math.min(d, l - 1);
    }
    function e(a, b, c, d, f, e, l, k) {
      if (!(0 > a.index)) {
        g.image.palette = null;
        g.sprite = b.frames[a.index];
        g.palette = c.palette;
        var p = a.index + 0;
        1 !== a.spr_type && 0 !== b.rgba_index
          ? ((g.image.palette = c.texture),
            (g.image.size[0] = 2 * b.frames[p].width),
            (g.image.size[1] = 2 * b.frames[p].height))
          : 1 === a.spr_type && (p += b.old_rgba_index);
        p = b.frames[p];
        b = p.width;
        c = p.height;
        this.objecttype === this.constructor.TYPE_SLAVE && (d *= 0.25);
        0 < this.isBoss && (d = 1.3 * d * 1.3);
        b *= a.scale[0] * d;
        c *= a.scale[1] * d;
        if ("body" === e) {
          var q = (p.originalWidth * a.scale[0] * d) / 2;
          d = (p.originalHeight * a.scale[1] * d) / 2;
          this.boundingRect.x1 = Math.min(
            this.boundingRect.x1,
            a.pos[0] + f[0] - q,
          );
          this.boundingRect.y1 = Math.max(
            this.boundingRect.y1,
            -(a.pos[1] + f[1]) + d,
          );
          this.boundingRect.x2 = Math.max(
            this.boundingRect.x2,
            a.pos[0] + f[0] + q,
          );
          this.boundingRect.y2 = Math.min(
            this.boundingRect.y2,
            -(a.pos[1] + f[1]) - d,
          );
        }
        a.is_mirror && (b = -b);
        "shadow" !== e
          ? ((g.color[0] = a.color[0] * this.effectColor[0]),
            (g.color[1] = a.color[1] * this.effectColor[1]),
            (g.color[2] = a.color[2] * this.effectColor[2]),
            (g.color[3] = a.color[3] * this.effectColor[3]))
          : ((g.color[0] = a.color[0]),
            (g.color[1] = a.color[1]),
            (g.color[2] = a.color[2]),
            (g.color[3] = a.color[3]));
        this.remove_tick &&
          (g.color[3] *= 1 - (n.tick - this.remove_tick) / this.remove_delay);
        g.angle = a.angle;
        g.size[0] = b;
        g.size[1] = c;
        !k || ("head" != e && "head_" != e)
          ? ((g.xSize = this.xSize),
            (g.ySize = this.ySize),
            (g.offset[0] = a.pos[0] + f[0]),
            (g.offset[1] = a.pos[1] + f[1]))
          : ((g.xSize = 1.2 * this.xSize),
            (g.ySize = 1.2 * this.ySize),
            (g.offset[0] = a.pos[0] + f[0]),
            (g.offset[1] = 0.86 * (a.pos[1] + f[1])));
        g.image.texture = p.texture;
        this.ghost && this.ghost.render
          ? ((a = 1 < this.ghost.xSize || 1 < this.ghost.ySize),
            (g.size[0] = b * this.ghost.xSize),
            (g.size[1] = c * this.ghost.ySize),
            (g.offset[0] *= this.ghost.xSize),
            (g.offset[1] = g.offset[1] * this.ghost.ySize + (a ? 3 : 0)),
            (g.color[3] *= a ? 0.5 : 0.3),
            (g.blendMode = a ? 2 : 1),
            g.render(),
            (g.blendMode = 0))
          : g.render(l);
      }
    }
    var m = a("Utils/gl-matrix"),
      h = a("Renderer/Camera"),
      t = a("Core/Client"),
      r = a("DB/Status/StatusState"),
      n = a("Renderer/Renderer"),
      g = a("Renderer/SpriteRenderer"),
      p = a("Renderer/Map/Ground"),
      l = a("Renderer/Map/Altitude");
    a("Engine/SessionStorage");
    a("DB/Jobs/JobConst");
    var f = (function () {
        var a = m.mat4,
          b = m.vec4,
          c = a.create(),
          d = b.create();
        return function (f, e, g) {
          d[0] = f.position[0] + 0.5;
          d[1] = -f.position[2];
          d[2] = f.position[1] + 0.5;
          a.translate(c, e, d);
          c[0] = 1;
          c[1] = 0;
          c[2] = 0;
          c[4] = 0;
          c[5] = 1;
          c[6] = 0;
          c[8] = 0;
          c[9] = 0;
          c[10] = 1;
          a.multiply(c, g, c);
          f.effectColor[3] && 139 !== f._job && k(f, c);
          d[0] = 0;
          d[1] = 0;
          d[2] = 0;
          d[3] = 1;
          b.transformMat4(d, d, c);
          f.depth = d[3];
          f.life.display && f.life.render(c);
          f.display.display && f.display.render(c);
          f.dialog.display && f.dialog.render(c);
          f.cast.display && f.cast.render(c);
          f.room.display && f.room.render(c);
        };
      })(),
      k = (function () {
        function a(a, c, e) {
          d[0] = a;
          d[1] = c;
          d[2] = 0;
          d[3] = 1;
          b.transformMat4(f, d, e);
          f[3] = 0 === f[3] ? 1 : 1 / f[3];
          f[0] *= f[3];
          f[1] *= f[3];
        }
        var b = m.vec4,
          c = m.vec2.create(),
          d = b.create(),
          f = b.create();
        return function (b, d) {
          var e, g, l, k;
          e = b.xSize / 175;
          g = b.ySize / 175;
          c[0] = 0.5 * n.width;
          c[1] = 0.5 * n.height;
          k = b.boundingRect;
          b = b.objecttype === b.constructor.TYPE_ITEM ? 30 : 60;
          if (
            Infinity === k.x1 ||
            -Infinity === k.x2 ||
            -Infinity === k.y1 ||
            Infinity === k.y2
          )
            ((k.x1 = -25), (k.x2 = 25), (k.y1 = 45), (k.y2 = 0));
          k.x1 > k.x2 && ((l = k.x1), (k.x1 = k.x2), (k.x2 = l));
          a(k.x1 * e, k.y1 * g, d);
          k.x1 = c[0] + c[0] * f[0];
          k.y1 = c[1] - c[1] * f[1];
          a(k.x2 * e, k.y2 * g, d);
          k.x2 = c[0] + c[0] * f[0];
          k.y2 = c[1] - c[1] * f[1];
          k.x2 - k.x1 < b &&
            ((k.x1 = 0.5 * (k.x1 + k.x2) - 0.5 * b), (k.x2 = k.x1 + b));
          k.y2 - k.y1 < b &&
            ((k.y1 = 0.5 * (k.y1 + k.y2) - 0.5 * b), (k.y2 = k.y1 + b));
        };
      })(),
      q = (function () {
        var a = new Int32Array(2);
        return function (b) {
          b = void 0 === b ? !1 : b;
          if (!this.hideEntity) {
            var c = this.animation,
              d = this.constructor;
            g.shadow = p.getShadowFactor(this.position[0], this.position[1]);
            g.zIndex =
              this.ghost && this.ghost.render
                ? 99
                : this.objecttype == d.TYPE_CART
                  ? 0
                  : 1;
            a[0] = 0;
            a[1] = 0;
            if (this.objecttype != d.TYPE_WARP) {
              c.save && c.delay < n.tick && this.setAction(c.save);
              var c = 0 > this.action ? this.ACTION.IDLE : this.action,
                f = (h.direction + this.direction + 8) % 8,
                e = 1 < f && 6 > f;
              c === this.ACTION.DIE ||
                c === this.ACTION.SIT ||
                45 === this.job ||
                this.hideShadow ||
                this.objecttype == d.TYPE_FALCON ||
                (this.ghost && this.ghost.render) ||
                ((g.position[0] = this.position[0]),
                (g.position[1] = this.position[1]),
                (g.position[2] = l.getCellHeight(
                  this.position[0],
                  this.position[1],
                )),
                u(this, this.files.shadow, "shadow", a, !1, b));
              g.position.set(this.position);
              if (null != this.files.body.spr)
                if (
                  (this.objecttype === d.TYPE_PC &&
                    this.shield &&
                    e &&
                    !this.riding &&
                    !this.riding_ &&
                    u(this, this.files.shield, "shield", a, !0, b),
                  (f = (h.direction + this.direction + 8) % 8),
                  0 == f || 1 == f || 2 == f || 6 == f || 7 == f)
                ) {
                  if (
                    (u(this, this.files.body, "body", a, !0, b),
                    this.objecttype === d.TYPE_PC ||
                      this.objecttype === d.TYPE_MERC)
                  )
                    (0 < this.robe &&
                      (u(this, this.files.robe, "robe", a, !1, b),
                      u(this, this.files.body, "body", a, !1, b)),
                      u(this, this.files.head, "head", a, !1, b),
                      0 < this.accessory &&
                        u(this, this.files.accessory, "head_", a, !1, b),
                      0 < this.accessory3 &&
                        this.accessory3 !== this.accessory2 &&
                        this.accessory3 !== this.accessory &&
                        u(this, this.files.accessory3, "head_", a, !1, b),
                      0 < this.accessory2 &&
                        this.accessory2 !== this.accessory &&
                        u(this, this.files.accessory2, "head", a, !1, b),
                      0 < this.weapon &&
                        !this.riding_ &&
                        u(this, this.files.weapon, "weapon", a, !0, b),
                      0 < this.weaponeffect &&
                        !this.riding_ &&
                        u(
                          this,
                          this.files.weaponeffect,
                          "weaponeffect",
                          a,
                          !0,
                          b,
                        ),
                      0 < this.shield &&
                        !e &&
                        !this.riding &&
                        !this.riding_ &&
                        u(this, this.files.shield, "shield", a, !0, b));
                } else if (
                  (u(this, this.files.body, "body", a, !0, b),
                  this.objecttype === d.TYPE_PC ||
                    this.objecttype === d.TYPE_MERC)
                )
                  (u(this, this.files.head, "head", a, !1, b),
                    0 < this.accessory3 &&
                      this.accessory3 !== this.accessory2 &&
                      this.accessory3 !== this.accessory &&
                      u(this, this.files.accessory3, "head_", a, !1, b),
                    0 < this.accessory2 &&
                      this.accessory2 !== this.accessory &&
                      u(this, this.files.accessory2, "head", a, !1, b),
                    0 < this.accessory &&
                      u(this, this.files.accessory, "head_", a, !1, b),
                    0 < this.robe && u(this, this.files.robe, "robe", a, !1, b),
                    0 < this.weapon &&
                      !this.riding_ &&
                      u(this, this.files.weapon, "weapon", a, !0, b),
                    0 < this.weaponeffect &&
                      !this.riding_ &&
                      u(
                        this,
                        this.files.weaponeffect,
                        "weaponeffect",
                        a,
                        !0,
                        b,
                      ),
                    0 < this.shield &&
                      !e &&
                      !this.riding &&
                      !this.riding_ &&
                      u(this, this.files.shield, "shield", a, !0, b));
            }
          }
        };
      })(),
      u = (function () {
        var a = new Int32Array(2);
        return function (b, f, e, g, l, k) {
          var p = !1;
          if (f.spr && f.act) {
            var q = t.loadFile(f.spr),
              m = t.loadFile(f.act);
            if (q && m) {
              var u = (f.pal && t.loadFile(f.pal)) || q,
                v =
                  "falcon" === e
                    ? m.actions[
                        (8 * b.ACTION.IDLE +
                          ((h.direction + b.direction + 8) % 8)) %
                          m.actions.length
                      ]
                    : m.actions[
                        (8 * b.action + ((h.direction + b.direction + 8) % 8)) %
                          m.actions.length
                      ],
                C = d(b, v, e, n.tick - b.animation.tick);
              if ((v = v.animations[C])) {
                var B = v.layers;
                -1 < v.sound && b.sound.play(m.sounds[v.sound], b.action, C);
                a[0] = 0;
                a[1] = 0;
                v.pos.length &&
                  !l &&
                  ((a[0] = g[0] - v.pos[0].x), (a[1] = g[1] - v.pos[0].y));
                if (
                  ("shadow" !== e && b.getOpt3(r.Status.BERSERK)) ||
                  b.getOpt3(r.Status.MARIONETTE)
                )
                  p = !0;
                if (!b.ghost.render) {
                  var m = b.getOpt3(r.Status.NJ_BUNSINJYUTSU),
                    C = b.getOpt3(r.Status.HALLUCINATIONWALK),
                    A = b.getOpt3(r.Status.ENERGYCOAT),
                    y = b.virtue & r.OPT3.QUICKEN,
                    J = b.getOpt3(r.Status.OVERTHRUST),
                    D = b.getOpt3(r.Status.EXPLOSIONSPIRITS),
                    M = b.getOpt3(r.Status.BERSERK);
                  c(b, B, q, u, f, e, a, k, {
                    enableTrail:
                      A || m || C || y || J || D || M || !!b._enableTrail,
                  });
                }
                m = 0;
                for (C = B.length; m < C; ++m)
                  b.renderLayer(B[m], q, u, f.size, a, e, p, k);
                l && v.pos.length && ((g[0] = v.pos[0].x), (g[1] = v.pos[0].y));
              }
            }
          }
        };
      })();
    return function () {
      this.render = b;
      this.renderLayer = e;
      this.renderEntity = q;
    };
  },
);
