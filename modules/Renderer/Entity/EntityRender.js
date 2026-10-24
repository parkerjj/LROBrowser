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
          this.attachments.render(k.tick),
          this._explosion)
        ) {
          if (this.expTick + 800 < k.tick) {
            this.expTick = k.tick;
            var d = { effectId: 2018, ownerAID: this.GID };
            a("Renderer/EffectManager").spam(d);
          }
        } else
          this.explosion &&
            this.expTick + 800 < k.tick &&
            ((this.expTick = k.tick),
            (d =
              5 == this.objecttype
                ? { effectId: 2018, ownerAID: this.GID }
                : { effectId: 2017, ownerAID: this.GID }),
            a("Renderer/EffectManager").spam(d));
      f(this, b, c);
    }
    function c(a, b, c, d, e, f, l, n, k) {
      var p = (k = void 0 === k ? {} : k),
        h = void 0 === p.enableTrail ? !1 : p.enableTrail;
      k = void 0 === p.trailLength ? 5 : p.trailLength;
      var t = void 0 === p.blurType ? 1 : p.blurType;
      if (h && "shadow" !== f && "cartshadow" !== f && h) {
        a._trailData || (a._trailData = {});
        a._trailData[f] || (a._trailData[f] = { snapshots: [], lastTick: 0 });
        var u = a._trailData[f],
          v = Date.now(),
          p = 3 === t || 5 === t ? 560 : 100;
        k = 4 === t ? 1 : Math.floor(k / 2);
        h = !1;
        1 === t || 3 === t
          ? (h = a.action === a.ACTION.WALK && v - u.lastTick > p)
          : 4 === t
            ? (h = 0 === u.snapshots.length)
            : 5 === t &&
              (h =
                [
                  a.ACTION.ATTACK,
                  a.ACTION.ATTACK1,
                  a.ACTION.ATTACK2,
                  a.ACTION.ATTACK3,
                  a.ACTION.SKILL,
                ].includes(a.action) && v - u.lastTick > p);
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
          u.snapshots.length > k && u.snapshots.pop());
        if (u.snapshots.length) {
          b = m.vec3.clone(g.position);
          var q = g.zIndex;
          c = new Float32Array(a.effectColor);
          g.runWithDepth(!0, !1, !1, function () {
            for (
              var b = 4 === t || 3 === t ? 800 : 400, c = 0;
              c < u.snapshots.length;
              c++
            ) {
              var d = u.snapshots[c],
                l = v - d.tick;
              if (!(
                (l > b && 4 !== t) ||
                ((l = Math.max(0, 0.5 * (1 - l / b))), 0.05 >= l && 4 !== t)
              ))
                for (
                  3 === t && (l *= 2),
                    1 !== t &&
                      ((a.effectColor[0] = 1),
                      (a.effectColor[1] = 1),
                      (a.effectColor[2] = 1)),
                    a.effectColor[3] = l,
                    g.position.set(d.position),
                    g.zIndex = q - c,
                    l = 0;
                  l < d.layers.length;
                  ++l
                )
                  a.renderLayer(
                    d.layers[l],
                    d.spr,
                    d.pal,
                    e.size,
                    d._position,
                    f,
                    !1,
                    n,
                  );
            }
          });
          g.position.set(b);
          g.zIndex = q;
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
      var e = a.ACTION,
        f = a.action,
        g = a.animation,
        l = b.animations.length,
        n = l,
        e = f === e.IDLE || f === e.SIT;
      f =
        "body" === c && a.action === a.ACTION.WALK
          ? (b.delay / 150) * a.walk.speed
          : a.action === a.ACTION.ATTACK ||
              a.action === a.ACTION.ATTACK1 ||
              a.action === a.ACTION.ATTACK2 ||
              a.action === a.ACTION.ATTACK3
            ? a.attack_speed / b.animations.length
            : b.delay;
      b = 0;
      if ("cart" === c && e) return 0;
      if (
        ("body" === c && a.objecttype === a.constructor.TYPE_PC && e) ||
        ("body" === c && a.objecttype === a.constructor.TYPE_MERC && e)
      )
        return a.headDir;
      if (!1 === g.play) return Math.min(g.frame, n - 1);
      ("head" !== c && "head_" !== c) ||
        !e ||
        ((l = Math.floor(l / 3)), (b = a.headDir));
      if (g.repeat)
        return (
          (d = Math.floor(d / f)),
          a.sound.freeOnAnimationEnd(d, l),
          (d = (d % l) + l * b + g.frame),
          d % n
        );
      d = Math.min((d / f) | 0, l || l - 1) + l * b + g.frame;
      "body" === c &&
        d >= n - 1 &&
        ((g.frame = d = n - 1), (g.play = !1), g.next && a.setAction(g.next));
      return Math.min(d, l - 1);
    }
    function e(a, b, c, d, e, f, l, n) {
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
        if ("body" === f) {
          var h = (p.originalWidth * a.scale[0] * d) / 2;
          d = (p.originalHeight * a.scale[1] * d) / 2;
          this.boundingRect.x1 = Math.min(
            this.boundingRect.x1,
            a.pos[0] + e[0] - h,
          );
          this.boundingRect.y1 = Math.max(
            this.boundingRect.y1,
            -(a.pos[1] + e[1]) + d,
          );
          this.boundingRect.x2 = Math.max(
            this.boundingRect.x2,
            a.pos[0] + e[0] + h,
          );
          this.boundingRect.y2 = Math.min(
            this.boundingRect.y2,
            -(a.pos[1] + e[1]) - d,
          );
        }
        a.is_mirror && (b = -b);
        "shadow" !== f
          ? ((g.color[0] = a.color[0] * this.effectColor[0]),
            (g.color[1] = a.color[1] * this.effectColor[1]),
            (g.color[2] = a.color[2] * this.effectColor[2]),
            (g.color[3] = a.color[3] * this.effectColor[3]))
          : ((g.color[0] = a.color[0]),
            (g.color[1] = a.color[1]),
            (g.color[2] = a.color[2]),
            (g.color[3] = a.color[3]));
        this.remove_tick &&
          (g.color[3] *= 1 - (k.tick - this.remove_tick) / this.remove_delay);
        g.angle = a.angle;
        g.size[0] = b;
        g.size[1] = c;
        !n || ("head" != f && "head_" != f)
          ? ((g.xSize = this.xSize),
            (g.ySize = this.ySize),
            (g.offset[0] = a.pos[0] + e[0]),
            (g.offset[1] = a.pos[1] + e[1]))
          : ((g.xSize = 1.2 * this.xSize),
            (g.ySize = 1.2 * this.ySize),
            (g.offset[0] = a.pos[0] + e[0]),
            (g.offset[1] = 0.86 * (a.pos[1] + e[1])));
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
      r = a("Core/Client"),
      q = a("DB/Status/StatusState"),
      k = a("Renderer/Renderer"),
      g = a("Renderer/SpriteRenderer"),
      t = a("Renderer/Map/Ground"),
      l = a("Renderer/Map/Altitude");
    a("Engine/SessionStorage");
    a("DB/Jobs/JobConst");
    var f = (function () {
        var a = m.mat4,
          b = m.vec4,
          c = a.create(),
          d = b.create();
        return function (e, f, g) {
          d[0] = e.position[0] + 0.5;
          d[1] = -e.position[2];
          d[2] = e.position[1] + 0.5;
          a.translate(c, f, d);
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
          e.effectColor[3] && 139 !== e._job && n(e, c);
          d[0] = 0;
          d[1] = 0;
          d[2] = 0;
          d[3] = 1;
          b.transformMat4(d, d, c);
          e.depth = d[3];
          e.life.display && e.life.render(c);
          e.display.display && e.display.render(c);
          e.dialog.display && e.dialog.render(c);
          e.cast.display && e.cast.render(c);
          e.room.display && e.room.render(c);
        };
      })(),
      n = (function () {
        function a(a, c, f) {
          d[0] = a;
          d[1] = c;
          d[2] = 0;
          d[3] = 1;
          b.transformMat4(e, d, f);
          e[3] = 0 === e[3] ? 1 : 1 / e[3];
          e[0] *= e[3];
          e[1] *= e[3];
        }
        var b = m.vec4,
          c = m.vec2.create(),
          d = b.create(),
          e = b.create();
        return function (b, d) {
          var f, g, l, n;
          f = b.xSize / 175;
          g = b.ySize / 175;
          c[0] = 0.5 * k.width;
          c[1] = 0.5 * k.height;
          n = b.boundingRect;
          b = b.objecttype === b.constructor.TYPE_ITEM ? 30 : 60;
          if (
            Infinity === n.x1 ||
            -Infinity === n.x2 ||
            -Infinity === n.y1 ||
            Infinity === n.y2
          )
            ((n.x1 = -25), (n.x2 = 25), (n.y1 = 45), (n.y2 = 0));
          n.x1 > n.x2 && ((l = n.x1), (n.x1 = n.x2), (n.x2 = l));
          a(n.x1 * f, n.y1 * g, d);
          n.x1 = c[0] + c[0] * e[0];
          n.y1 = c[1] - c[1] * e[1];
          a(n.x2 * f, n.y2 * g, d);
          n.x2 = c[0] + c[0] * e[0];
          n.y2 = c[1] - c[1] * e[1];
          n.x2 - n.x1 < b &&
            ((n.x1 = 0.5 * (n.x1 + n.x2) - 0.5 * b), (n.x2 = n.x1 + b));
          n.y2 - n.y1 < b &&
            ((n.y1 = 0.5 * (n.y1 + n.y2) - 0.5 * b), (n.y2 = n.y1 + b));
        };
      })(),
      p = (function () {
        var a = new Int32Array(2);
        return function (b) {
          b = void 0 === b ? !1 : b;
          if (!this.hideEntity) {
            var c = this.animation,
              d = this.constructor;
            g.shadow = t.getShadowFactor(this.position[0], this.position[1]);
            g.zIndex =
              this.ghost && this.ghost.render
                ? 99
                : this.objecttype == d.TYPE_CART
                  ? 0
                  : 1;
            a[0] = 0;
            a[1] = 0;
            if (this.objecttype != d.TYPE_WARP) {
              c.save && c.delay < k.tick && this.setAction(c.save);
              var c = 0 > this.action ? this.ACTION.IDLE : this.action,
                e = (h.direction + this.direction + 8) % 8,
                f = 1 < e && 6 > e;
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
                v(this, this.files.shadow, "shadow", a, !1, b));
              g.position.set(this.position);
              if (null != this.files.body.spr)
                if (
                  (this.objecttype === d.TYPE_PC &&
                    this.shield &&
                    f &&
                    !this.riding &&
                    !this.riding_ &&
                    v(this, this.files.shield, "shield", a, !0, b),
                  (e = (h.direction + this.direction + 8) % 8),
                  0 == e || 1 == e || 2 == e || 6 == e || 7 == e)
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
                        !f &&
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
                      !f &&
                      !this.riding &&
                      !this.riding_ &&
                      v(this, this.files.shield, "shield", a, !0, b));
            }
          }
        };
      })(),
      v = (function () {
        var a = new Int32Array(2);
        return function (b, e, f, g, l, n) {
          var p = !1;
          if (e.spr && e.act) {
            var t = r.loadFile(e.spr),
              m = r.loadFile(e.act);
            if (t && m) {
              var v = (e.pal && r.loadFile(e.pal)) || t,
                u =
                  "falcon" === f
                    ? m.actions[
                        (8 * b.ACTION.IDLE +
                          ((h.direction + b.direction + 8) % 8)) %
                          m.actions.length
                      ]
                    : m.actions[
                        (8 * b.action + ((h.direction + b.direction + 8) % 8)) %
                          m.actions.length
                      ],
                D = d(b, u, f, k.tick - b.animation.tick);
              if ((u = u.animations[D])) {
                var B = u.layers;
                -1 < u.sound && b.sound.play(m.sounds[u.sound], b.action, D);
                a[0] = 0;
                a[1] = 0;
                u.pos.length &&
                  !l &&
                  ((a[0] = g[0] - u.pos[0].x), (a[1] = g[1] - u.pos[0].y));
                if (
                  ("shadow" !== f && b.getOpt3(q.Status.BERSERK)) ||
                  b.getOpt3(q.Status.MARIONETTE)
                )
                  p = !0;
                if (!b.ghost.render) {
                  var m = b.getOpt3(q.Status.NJ_BUNSINJYUTSU),
                    D = b.getOpt3(q.Status.HALLUCINATIONWALK),
                    A = b.getOpt3(q.Status.ENERGYCOAT),
                    y = b.virtue & q.OPT3.QUICKEN,
                    O = b.getOpt3(q.Status.OVERTHRUST),
                    C = b.getOpt3(q.Status.EXPLOSIONSPIRITS),
                    P = b.getOpt3(q.Status.BERSERK);
                  c(b, B, t, v, e, f, a, n, {
                    enableTrail:
                      A || m || D || y || O || C || P || !!b._enableTrail,
                  });
                }
                m = 0;
                for (D = B.length; m < D; ++m)
                  b.renderLayer(B[m], t, v, e.size, a, f, p, n);
                l && u.pos.length && ((g[0] = u.pos[0].x), (g[1] = u.pos[0].y));
              }
            }
          }
        };
      })();
    return function () {
      this.render = b;
      this.renderLayer = e;
      this.renderEntity = p;
    };
  },
);
