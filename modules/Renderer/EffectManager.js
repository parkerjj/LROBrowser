define(
  "Renderer/EffectManager",
  "require DB/Effects/EffectTable DB/Skills/SkillEffect DB/Skills/SkillUnit DB/Skills/SkillUnitConst DB/Items/ItemEffect Core/Events Renderer/Effects/RsmViewer Renderer/Effects/Cylinder Renderer/Effects/StrEffect Renderer/Effects/TwoDEffect Renderer/Effects/ThreeDEffect Renderer/Effects/GroundEffect Renderer/Entity/Entity Renderer/EntityManager Renderer/Renderer Renderer/Map/Altitude Audio/SoundManager Preferences/Map Renderer/Effects/QuadHorn".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b;
      b = B.mineffect && a.effect.min ? a.effect.min : a.effect.file;
      a.effect.rand &&
        (b = b.replace(
          "%d",
          Math.round(
            a.effect.rand[0] +
              (a.effect.rand[1] - a.effect.rand[0]) * Math.random(),
          ),
        ));
      z.add(
        new t(
          "data/texture/effect/" + b + ".str",
          a.Inst.position,
          a.Inst.startTick,
          a.effect.posYoffset ? a.effect.posYoffset : 0,
          a.effect.noLifeTime ? a.effect.noLifeTime : !1,
        ),
        a,
      );
    }
    function c(a) {
      var b = a.Init.ownerEntity,
        c = !1;
      b
        ? a.effect.attachedEntity ||
          ((b = new p()),
          (b.GID = -1),
          (b.position = a.Inst.position),
          (b.objecttype = b.constructor.TYPE_EFFECT),
          (c = !0))
        : ((b = new p()),
          (b.GID = a.Init.ownerAID),
          (b.position = a.Inst.position),
          (b.objecttype = b.constructor.TYPE_EFFECT),
          (c = !0));
      b.attachments.add({
        uid: a.effect.effectID,
        file: a.effect.file,
        head: !!a.effect.head,
        direction: !!a.effect.direction,
        repeat: a.effect.repeat || a.Inst.persistent,
        duplicate: a.effect.duplicate,
        stopAtEnd: a.effect.stopAtEnd,
        xOffset: a.effect.xOffset,
        yOffset: a.effect.yOffset,
        frame: a.effect.frame,
        delay: a.effect.delayFrame,
      });
      c && v.add(b);
    }
    var d = a("DB/Effects/EffectTable"),
      e = a("DB/Skills/SkillEffect"),
      m = a("DB/Skills/SkillUnit"),
      h = a("DB/Skills/SkillUnitConst"),
      r = a("DB/Items/ItemEffect"),
      q = a("Core/Events"),
      k = a("Renderer/Effects/RsmViewer"),
      g = a("Renderer/Effects/Cylinder"),
      t = a("Renderer/Effects/StrEffect"),
      l = a("Renderer/Effects/TwoDEffect"),
      f = a("Renderer/Effects/ThreeDEffect"),
      n = a("Renderer/Effects/GroundEffect"),
      p = a("Renderer/Entity/Entity"),
      v = a("Renderer/EntityManager"),
      u = a("Renderer/Renderer"),
      A = a("Renderer/Map/Altitude"),
      D = a("Audio/SoundManager"),
      B = a("Preferences/Map"),
      O = a("Renderer/Effects/QuadHorn"),
      C,
      y = {},
      z = {},
      J = 1;
    z.init = function (a) {
      C = a;
    };
    z.add = function (a, b) {
      if (C) {
        var c = a.constructor._uid || (a.constructor._uid = J++);
        c in y ||
          ((y[c] = []),
          a.constructor.init && a.constructor.init(C),
          a.constructor.renderBeforeEntities ||
            (a.constructor.renderBeforeEntities = !1));
        a.init && a.init(C);
        a._Params = b;
        y[c].push(a);
      }
    };
    z.remove = (function () {
      function a(a, b, c) {
        var d,
          e,
          f,
          g = Array.isArray(c) ? c : [c];
        d = y[a];
        f = d.length;
        for (e = 0; e < f; ++e)
          (!b || (b && d[e]._Params.Init.ownerAID === b)) &&
            (!c || (c && g.includes(d[e]._Params.Inst.effectID))) &&
            (d[e].free && d[e].free(C), d.splice(e, 1), e--, f--);
        f || delete y[a];
      }
      return function (b, c, d) {
        if (b) b._uid in y && a(b._uid, c, d);
        else {
          var e,
            f = Object.keys(y);
          b = 0;
          for (e = f.length; b < e; ++b) a(f[b], c, d);
        }
      };
    })();
    z.removeSpirits = (function () {
      return function (a) {
        var b,
          c,
          d = Object.keys(y);
        b = 0;
        for (c = d.length; b < c; ++b) {
          var e = d[b],
            f = a,
            g = [2011, 2012, 2013, 2014, 2015],
            h,
            k,
            l,
            n = Array.isArray(g) ? g : [g];
          h = y[e];
          l = h.length;
          for (k = 0; k < l; ++k)
            (!f || (f && h[k]._Params.Init.ownerAID === f)) &&
              (!g || (g && n.includes(h[k]._Params.Inst.effectID))) &&
              (h[k].free && h[k].free(C), h.splice(k, 1), k--, l--);
          l || delete y[e];
        }
      };
    })();
    z.free = function (a) {
      var b = Object.keys(y),
        c,
        d,
        e,
        f,
        g,
        h;
      c = 0;
      for (f = b.length; c < f; ++c) {
        g = y[b[c]];
        h = g[0].constructor;
        d = 0;
        for (e = g.length; d < e; ++d) g[d].free && g[d].free(a);
        h.free && h.free(a);
        delete y[b[c]];
      }
    };
    z.render = function (a, b, c, d, e, f) {
      var g = Object.keys(y),
        h,
        k = g.length,
        l,
        n,
        m,
        p;
      for (h = 0; h < k; ++h)
        if (((m = y[g[h]]), m.length)) {
          if (
            ((p = m[0].constructor), p.renderBeforeEntities === f && p.ready)
          ) {
            p.beforeRender && p.beforeRender(a, b, c, d, e);
            l = 0;
            for (n = m.length; l < n; ++l) {
              m[l].ready && m[l].render(a, e);
              var t;
              a: {
                t = m[l];
                var q = t._Params;
                if (
                  (q.Inst.persistent || q.Inst.repeatEnd) &&
                  !t._AlreadyRepeated
                ) {
                  var r = !1;
                  if (
                    q.Inst.duration &&
                    0 < q.Inst.duration &&
                    u.tick > q.Inst.endTick + q.Inst.repeatDelay
                  ) {
                    if (
                      !q.Inst.repeatEnd ||
                      q.Inst.repeatEnd > q.Inst.endTick + q.Inst.repeatDelay
                    )
                      r = q.Inst.endTick + q.Inst.repeatDelay;
                  } else
                    t.needCleanUp &&
                      (!q.Inst.repeatEnd ||
                        q.Inst.repeatEnd > u.tick + q.Inst.repeatDelay) &&
                      (r = u.tick + q.Inst.repeatDelay);
                  if (r) {
                    z.spamEffect({
                      effect: q.effect,
                      Inst: {
                        effectID: q.Inst.effectID,
                        duplicateID: q.Inst.duplicateID,
                        startTick: r,
                        noDelay: !0,
                      },
                      Init: q.Init,
                    });
                    t._AlreadyRepeated = !0;
                    t = 1;
                    break a;
                  }
                }
                t = 0;
              }
              n += t;
              m[l].noLifeTime
                ? v.get(m[l]._Params.Init.ownerAID) ||
                  (m[l].free && m[l].free(a), m.splice(l, 1), l--, n--)
                : m[l].needCleanUp &&
                  (m[l].free && m[l].free(a), m.splice(l, 1), l--, n--);
            }
            p.afterRender && p.afterRender(a);
            0 === n && (p.free && p.free(a), delete y[g[h]]);
          }
        } else delete y[g[h]];
    };
    z.endRepeat = (function () {
      function a(a, b, c) {
        var d,
          e,
          f = Array.isArray(c) ? c : [c];
        a = y[a];
        e = a.length;
        for (d = 0; d < e; ++d)
          (!b || (b && a[d]._Params.Init.ownerAID === b)) &&
            (!c || (c && f.includes(a[d].effectID))) &&
            (a[d]._Params.Inst.persistent &&
              (a[d]._Params.Inst.persistent = !1),
            a[d]._Params.Inst.repeatEnd && (a[d]._Params.Inst.repeatEnd = !1));
      }
      return function (b, c, d) {
        if (b && b.name in y) a(b.name, c, d);
        else {
          var e,
            f = Object.keys(y);
          b = 0;
          for (e = f.length; b < e; ++b) a(f[b], c, d);
        }
      };
    })();
    z.spam = function (a) {
      if (a && B.effect) {
        var b = {
            effectId: -1,
            skillId: null,
            skilllv: null,
            skillRange: null,
            ownerAID: null,
            position: null,
            startTick: null,
            duration: null,
            persistent: !1,
            repeatEnd: null,
            repeatDelay: 0,
            otherAID: null,
            otherPosition: null,
          },
          b = Object.assign(b, a);
        b.startTick || (b.startTick = u.tick);
        b.ownerEntity = v.get(b.ownerAID);
        b.otherEntity = v.get(b.otherAID);
        a = b;
        if (a.effectId in d) {
          var b = d[a.effectId],
            c,
            e,
            f;
          c = 0;
          for (f = b.length; c < f; ++c)
            for (
              b[c].duplicate =
                -1 == b[c].duplicate
                  ? 999
                  : b[c].duplicate
                    ? Math.min(b[c].duplicate, 999)
                    : 1,
                b[c].timeBetweenDupli = isNaN(b[c].timeBetweenDupli)
                  ? 200
                  : b[c].timeBetweenDupli,
                e = 0;
              e < b[c].duplicate;
              ++e
            )
              z.spamEffect({
                effect: b[c],
                Inst: {
                  effectID: a.effectId,
                  duplicateID: e,
                  startTick: a.startTick + b[c].timeBetweenDupli * e,
                },
                Init: a,
              });
        }
      }
    };
    z.spamEffect = function (a) {
      var d;
      a.Inst.position = a.Init.position;
      a.Inst.otherPosition = a.Init.otherPosition;
      if (!a.Inst.position) {
        if (!a.Init.ownerEntity) return;
        a.Inst.position = a.Init.ownerEntity.position;
      }
      a.Inst.otherPosition ||
        (a.Inst.otherPosition = a.Init.otherEntity
          ? a.Init.otherEntity.position
          : [
              a.Inst.position[0] - 5,
              a.Inst.position[1] + 5,
              a.Inst.position[2],
            ]);
      a.Inst.position = a.effect.attachedEntity
        ? a.Inst.position
        : [a.Inst.position[0], a.Inst.position[1], a.Inst.position[2]];
      a.Inst.persistent = a.Init.persistent || !1;
      "undefined" !== typeof a.effect.repeat &&
        null !== a.effect.repeat &&
        (a.Inst.persistent = a.effect.repeat);
      a.Inst.repeatEnd = a.Init.repeatEnd
        ? a.Init.repeatEnd
        : a.effect.repeatEnd || 0;
      a.Inst.repeatDelay = a.effect.repeatDelay
        ? a.effect.repeatDelay
        : a.Init.repeatDelay;
      a.effect.wav &&
        ((d = a.effect.wav),
        a.effect.rand &&
          (d = d.replace(
            "%d",
            Math.round(
              a.effect.rand[0] +
                (a.effect.rand[1] - a.effect.rand[0]) * Math.random(),
            ),
          )),
        q.setTimeout(
          function () {
            D.playPosition(d + ".wav", a.Inst.position);
          },
          a.Inst.startTick +
            (isNaN(a.effect.delayWav) ? 0 : a.effect.delayWav) -
            u.tick,
        ));
      a.Inst.direction =
        a.effect.attachedEntity && a.Init.ownerEntity
          ? a.Init.ownerEntity.direction
          : 0;
      a.Inst.duration = isNaN(a.effect.duration)
        ? a.Init.duration
        : a.effect.duration;
      a.Inst.delayOffsetDelta = isNaN(a.effect.delayOffsetDelta)
        ? 0
        : a.effect.delayOffsetDelta * a.Inst.duplicateID;
      a.Inst.delayLateDelta = isNaN(a.effect.delayLateDelta)
        ? 0
        : a.effect.delayLateDelta * a.Inst.duplicateID;
      a.Inst.delayOffset = isNaN(a.effect.delayOffset)
        ? 0
        : a.effect.delayOffset + a.Inst.delayOffsetDelta;
      a.Inst.delayLate = isNaN(a.effect.delayLate)
        ? 0
        : a.effect.delayLate + a.Inst.delayLateDelta;
      a.Inst.startTick += a.Inst.noDelay
        ? a.Inst.delayOffset + a.Inst.delayLate
        : 0;
      a.Inst.endTick =
        0 < a.Inst.duration
          ? a.Inst.startTick +
            (a.Inst.noDelay ? a.Inst.delayOffset : 0) +
            a.Inst.duration
          : -1;
      switch (a.effect.type) {
        case "SPR":
          c(a);
          break;
        case "STR":
          b(a);
          break;
        case "CYLINDER":
          z.add(new g(a.effect, a.Inst, a.Init), a);
          break;
        case "2D":
          z.add(new l(a.effect, a.Inst, a.Init), a);
          break;
        case "3D":
          z.add(new f(a.effect, a.Inst, a.Init), a);
          break;
        case "QuadHorn":
          z.add(new O(a.effect, a.Inst, a.Init), a);
          break;
        case "GROUND":
          z.add(new n(a.effect, a.Inst, a.Init), a);
          break;
        case "TRAP":
          z.add(new k(a.effect, a.Inst, a.Init), a);
          break;
        case "FUNC":
          a.effect.func &&
            (a.effect.attachedEntity
              ? a.Init.ownerEntity && a.effect.func.call(this, a)
              : a.effect.func.call(this, a));
      }
    };
    z.spamSkillZone = function (a, b, c, f, g) {
      var k = v.get(g),
        l = [h.UNT_ICEWALL, h.UNT_REVERBERATION],
        n = [h.UNT_PRE_WARPPORTAL],
        t = [
          h.UNT_TRAP,
          h.UNT_BLASTMINE,
          h.UNT_SKIDTRAP,
          h.UNT_ANKLESNARE,
          h.UNT_LANDMINE,
          h.UNT_SHOCKWAVE,
          h.UNT_SANDMAN,
          h.UNT_FLASHER,
          h.UNT_FREEZINGTRAP,
          h.UNT_CLAYMORETRAP,
          h.UNT_TALKIEBOX,
          h.UNT_MAGENTATRAP,
          h.UNT_COBALTTRAP,
          h.UNT_MAIZETRAP,
          h.UNT_VERDURETRAP,
          h.UNT_FIRINGTRAP,
          h.UNT_ICEBOUNDTRAP,
          h.UNT_ELECTRICSHOCKE,
          h.UNT_CLUSTERBOMB,
          h.UNT_ICEMINE,
        ];
      if (B.effect && k) {
        if (134 == a) {
          if (91 != k.skillId && 254 != k.skillId && 2452 != k.skillId) return;
          k = k.skillId;
          if (!(k in e)) return;
          k = e[k];
          if (!k.groundEffectId) return;
          k = k.groundEffectId;
        } else {
          if (!(a in m)) return;
          k = m[a];
        }
        if (k in d) {
          var q = v.get(f),
            r = !1;
          q ||
            ((q = new p()),
            (q.GID = f),
            (q.position = [b, c, A.getCellHeight(b, c)]),
            (q.hideShadow = !0),
            (q.objecttype = t.includes(a)
              ? q.constructor.TYPE_TRAP
              : l.includes(a)
                ? q.constructor.TYPE_UNIT
                : n.includes(a)
                  ? q.constructor.TYPE_WARP
                  : q.constructor.TYPE_EFFECT),
            (q.creatorGID = g),
            (r = !0));
          r && v.add(q);
          z.remove(null, f);
          a = {
            effectId: k,
            ownerAID: f,
            position: [b, c, A.getCellHeight(b, c)],
            startTick: u.tick,
            persistent: !0,
            duration: -1,
            otherAID: g,
          };
          z.spam(a);
        }
      }
    };
    z.spamSkill = function (a, b, c, d, f) {
      if (a in e) {
        if (e[a].effectId) {
          var g = Array.isArray(e[a].effectId)
            ? e[a].effectId
            : [e[a].effectId];
          g.forEach(function (a) {
            z.spam({
              effectId: a,
              ownerAID: b,
              position: c,
              startTick: d,
              otherAID: f,
            });
          });
        }
        e[a].effectIdOnCaster &&
          f &&
          ((g = Array.isArray(e[a].effectIdOnCaster)
            ? e[a].effectIdOnCaster
            : [e[a].effectIdOnCaster]),
          g.forEach(function (a) {
            z.spam({
              effectId: a,
              ownerAID: f,
              position: c,
              startTick: d,
              otherAID: b,
            });
          }));
      }
    };
    z.spamSkillSuccess = function (a, b, c, d) {
      if (a in e) {
        if (e[a].successEffectId) {
          var f = Array.isArray(e[a].successEffectId)
            ? e[a].successEffectId
            : [e[a].successEffectId];
          f.forEach(function (a) {
            z.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
          });
        }
        e[a].successEffectIdOnCaster &&
          ((f = Array.isArray(e[a].successEffectIdOnCaster)
            ? e[a].successEffectIdOnCaster
            : [e[a].successEffectIdOnCaster]),
          f.forEach(function (a) {
            z.spam({ effectId: a, ownerAID: d, startTick: c, otherAID: b });
          }));
      }
    };
    z.spamSkillHit = function (a, b, c, d) {
      a in e &&
        e[a].hitEffectId &&
        (Array.isArray(e[a].hitEffectId)
          ? e[a].hitEffectId
          : [e[a].hitEffectId]
        ).forEach(function (a) {
          z.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
        });
    };
    z.spamSkillBeforeHit = function (a, b, c, d) {
      if (a in e) {
        if (e[a].beforeHitEffectId) {
          var f = Array.isArray(e[a].beforeHitEffectId)
            ? e[a].beforeHitEffectId
            : [e[a].beforeHitEffectId];
          f.forEach(function (a) {
            z.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
          });
        }
        e[a].beforeHitEffectIdOnCaster &&
          ((f = Array.isArray(e[a].beforeHitEffectIdOnCaster)
            ? e[a].beforeHitEffectIdOnCaster
            : [e[a].beforeHitEffectIdOnCaster]),
          f.forEach(function (a) {
            z.spam({ effectId: a, ownerAID: d, startTick: c, otherAID: b });
          }));
      }
    };
    z.spamSkillCast = function (a, b, c, d) {
      a in e &&
        e[a].beginCastEffectId &&
        (Array.isArray(e[a].beginCastEffectId)
          ? e[a].beginCastEffectId
          : [e[a].beginCastEffectId]
        ).forEach(function (a) {
          z.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
        });
    };
    z.spamItem = function (a, b, c, d, e) {
      if (a in r) {
        if (r[a].effectId) {
          var f = Array.isArray(r[a].effectId)
            ? r[a].effectId
            : [r[a].effectId];
          f.forEach(function (a) {
            z.spam({
              effectId: a,
              ownerAID: b,
              position: c,
              startTick: d,
              otherAID: e,
            });
          });
        }
        r[a].effectIdOnCaster &&
          e &&
          ((f = Array.isArray(r[a].effectIdOnCaster)
            ? r[a].effectIdOnCaster
            : [r[a].effectIdOnCaster]),
          f.forEach(function (a) {
            z.spam({
              effectId: a,
              ownerAID: e,
              position: c,
              startTick: d,
              otherAID: b,
            });
          }));
      }
    };
    return z;
  },
);
