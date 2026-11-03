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
    function c(a, b, c, d, f, e, k, m, p) {
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
            position: l.vec3.clone(a.position),
            tick: v,
            layers: b,
            spr: c,
            pal: d,
            _position: new Int32Array(k),
            color: [].concat($jscomp.arrayFromIterable(a.effectColor)),
          }),
          (u.lastTick = v),
          u.snapshots.length > p && u.snapshots.pop());
        if (u.snapshots.length) {
          b = l.vec3.clone(g.position);
          var t = g.zIndex;
          c = new Float32Array(a.effectColor);
          g.runWithDepth(!0, !1, !1, function () {
            for (
              var b = 4 === n || 3 === n ? 800 : 400, c = 0;
              c < u.snapshots.length;
              c++
            ) {
              var d = u.snapshots[c],
                k = v - d.tick;
              if (!(
                (k > b && 4 !== n) ||
                ((k = Math.max(0, 0.5 * (1 - k / b))), 0.05 >= k && 4 !== n)
              ))
                for (
                  3 === n && (k *= 2),
                    1 !== n &&
                      ((a.effectColor[0] = 1),
                      (a.effectColor[1] = 1),
                      (a.effectColor[2] = 1)),
                    a.effectColor[3] = k,
                    g.position.set(d.position),
                    g.zIndex = t - c,
                    k = 0;
                  k < d.layers.length;
                  ++k
                )
                  a.renderLayer(
                    d.layers[k],
                    d.spr,
                    d.pal,
                    f.size,
                    d._position,
                    e,
                    !1,
                    m,
                  );
            }
          });
          g.position.set(b);
          g.zIndex = t;
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
        k = b.animations.length,
        m = k,
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
      if (!1 === g.play) return Math.min(g.frame, m - 1);
      ("head" !== c && "head_" !== c) ||
        !f ||
        ((k = Math.floor(k / 3)), (b = a.headDir));
      if (g.repeat)
        return (
          (d = Math.floor(d / e)),
          a.sound.freeOnAnimationEnd(d, k),
          (d = (d % k) + k * b + g.frame),
          d % m
        );
      d = Math.min((d / e) | 0, k || k - 1) + k * b + g.frame;
      "body" === c &&
        d >= m - 1 &&
        ((g.frame = d = m - 1), (g.play = !1), g.next && a.setAction(g.next));
      return Math.min(d, k - 1);
    }
    function e(a, b, c, d, f, e, k, m) {
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
        !m || ("head" != e && "head_" != e)
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
          : g.render(k);
      }
    }
    var l = a("Utils/gl-matrix"),
      h = a("Renderer/Camera"),
      r = a("Core/Client"),
      t = a("DB/Status/StatusState"),
      n = a("Renderer/Renderer"),
      g = a("Renderer/SpriteRenderer"),
      p = a("Renderer/Map/Ground"),
      k = a("Renderer/Map/Altitude");
    a("Engine/SessionStorage");
    a("DB/Jobs/JobConst");
    var f = (function () {
        var a = l.mat4,
          b = l.vec4,
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
          f.effectColor[3] && 139 !== f._job && m(f, c);
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
      m = (function () {
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
        var b = l.vec4,
          c = l.vec2.create(),
          d = b.create(),
          f = b.create();
        return function (b, d) {
          var e, g, k, m;
          e = b.xSize / 175;
          g = b.ySize / 175;
          c[0] = 0.5 * n.width;
          c[1] = 0.5 * n.height;
          m = b.boundingRect;
          b = b.objecttype === b.constructor.TYPE_ITEM ? 30 : 60;
          if (
            Infinity === m.x1 ||
            -Infinity === m.x2 ||
            -Infinity === m.y1 ||
            Infinity === m.y2
          )
            ((m.x1 = -25), (m.x2 = 25), (m.y1 = 45), (m.y2 = 0));
          m.x1 > m.x2 && ((k = m.x1), (m.x1 = m.x2), (m.x2 = k));
          a(m.x1 * e, m.y1 * g, d);
          m.x1 = c[0] + c[0] * f[0];
          m.y1 = c[1] - c[1] * f[1];
          a(m.x2 * e, m.y2 * g, d);
          m.x2 = c[0] + c[0] * f[0];
          m.y2 = c[1] - c[1] * f[1];
          m.x2 - m.x1 < b &&
            ((m.x1 = 0.5 * (m.x1 + m.x2) - 0.5 * b), (m.x2 = m.x1 + b));
          m.y2 - m.y1 < b &&
            ((m.y1 = 0.5 * (m.y1 + m.y2) - 0.5 * b), (m.y2 = m.y1 + b));
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
                (g.position[2] = k.getCellHeight(
                  this.position[0],
                  this.position[1],
                )),
                v(this, this.files.shadow, "shadow", a, !1, b));
              g.position.set(this.position);
              if (null != this.files.body.spr)
                if (
                  (this.objecttype === d.TYPE_PC &&
                    this.shield &&
                    e &&
                    !this.riding &&
                    !this.riding_ &&
                    v(this, this.files.shield, "shield", a, !0, b),
                  (f = (h.direction + this.direction + 8) % 8),
                  0 == f || 1 == f || 2 == f || 6 == f || 7 == f)
                ) {
                  if (
                    (v(this, this.files.body, "body", a, !0, b),
                    this.objecttype === d.TYPE_PC ||
                      this.objecttype === d.TYPE_MERC)
                  )
                    (0 < this.robe &&
                      (v(this, this.files.robe, "robe", a, !1, b),
                      v(this, this.files.body, "body", a, !1, b)),
                      v(this, this.files.head, "head", a, !1, b),
                      0 < this.accessory &&
                        v(this, this.files.accessory, "head_", a, !1, b),
                      0 < this.accessory3 &&
                        this.accessory3 !== this.accessory2 &&
                        this.accessory3 !== this.accessory &&
                        v(this, this.files.accessory3, "head_", a, !1, b),
                      0 < this.accessory2 &&
                        this.accessory2 !== this.accessory &&
                        v(this, this.files.accessory2, "head", a, !1, b),
                      0 < this.weapon &&
                        !this.riding_ &&
                        v(this, this.files.weapon, "weapon", a, !0, b),
                      0 < this.weaponeffect &&
                        !this.riding_ &&
                        v(
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
                        v(this, this.files.shield, "shield", a, !0, b));
                } else if (
                  (v(this, this.files.body, "body", a, !0, b),
                  this.objecttype === d.TYPE_PC ||
                    this.objecttype === d.TYPE_MERC)
                )
                  (v(this, this.files.head, "head", a, !1, b),
                    0 < this.accessory3 &&
                      this.accessory3 !== this.accessory2 &&
                      this.accessory3 !== this.accessory &&
                      v(this, this.files.accessory3, "head_", a, !1, b),
                    0 < this.accessory2 &&
                      this.accessory2 !== this.accessory &&
                      v(this, this.files.accessory2, "head", a, !1, b),
                    0 < this.accessory &&
                      v(this, this.files.accessory, "head_", a, !1, b),
                    0 < this.robe && v(this, this.files.robe, "robe", a, !1, b),
                    0 < this.weapon &&
                      !this.riding_ &&
                      v(this, this.files.weapon, "weapon", a, !0, b),
                    0 < this.weaponeffect &&
                      !this.riding_ &&
                      v(
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
                      v(this, this.files.shield, "shield", a, !0, b));
            }
          }
        };
      })(),
      v = (function () {
        var a = new Int32Array(2);
        return function (b, f, e, g, k, m) {
          var p = !1;
          if (f.spr && f.act) {
            var q = r.loadFile(f.spr),
              l = r.loadFile(f.act);
            if (q && l) {
              var v = (f.pal && r.loadFile(f.pal)) || q,
                u =
                  "falcon" === e
                    ? l.actions[
                        (8 * b.ACTION.IDLE +
                          ((h.direction + b.direction + 8) % 8)) %
                          l.actions.length
                      ]
                    : l.actions[
                        (8 * b.action + ((h.direction + b.direction + 8) % 8)) %
                          l.actions.length
                      ],
                B = d(b, u, e, n.tick - b.animation.tick);
              if ((u = u.animations[B])) {
                var D = u.layers;
                -1 < u.sound && b.sound.play(l.sounds[u.sound], b.action, B);
                a[0] = 0;
                a[1] = 0;
                u.pos.length &&
                  !k &&
                  ((a[0] = g[0] - u.pos[0].x), (a[1] = g[1] - u.pos[0].y));
                if (
                  ("shadow" !== e && b.getOpt3(t.Status.BERSERK)) ||
                  b.getOpt3(t.Status.MARIONETTE)
                )
                  p = !0;
                if (!b.ghost.render) {
                  var l = b.getOpt3(t.Status.NJ_BUNSINJYUTSU),
                    B = b.getOpt3(t.Status.HALLUCINATIONWALK),
                    A = b.getOpt3(t.Status.ENERGYCOAT),
                    z = b.virtue & t.OPT3.QUICKEN,
                    H = b.getOpt3(t.Status.OVERTHRUST),
                    C = b.getOpt3(t.Status.EXPLOSIONSPIRITS),
                    M = b.getOpt3(t.Status.BERSERK);
                  c(b, D, q, v, f, e, a, m, {
                    enableTrail:
                      A || l || B || z || H || C || M || !!b._enableTrail,
                  });
                }
                l = 0;
                for (B = D.length; l < B; ++l)
                  b.renderLayer(D[l], q, v, f.size, a, e, p, m);
                k && u.pos.length && ((g[0] = u.pos[0].x), (g[1] = u.pos[0].y));
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
