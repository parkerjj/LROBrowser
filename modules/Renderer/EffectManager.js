define(
  "Renderer/EffectManager",
  "require DB/Effects/EffectTable DB/Skills/SkillEffect DB/Skills/SkillUnit DB/Skills/SkillUnitConst DB/Items/ItemEffect Core/Events Renderer/Effects/RsmViewer Renderer/Effects/Cylinder Renderer/Effects/StrEffect Renderer/Effects/TwoDEffect Renderer/Effects/ThreeDEffect Renderer/Effects/GroundEffect Renderer/Entity/Entity Renderer/EntityManager Renderer/Renderer Renderer/Map/Altitude Audio/SoundManager Preferences/Map Renderer/Effects/QuadHorn".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b;
      b = C.mineffect && a.effect.min ? a.effect.min : a.effect.file;
      a.effect.rand &&
        (b = b.replace(
          "%d",
          Math.round(
            a.effect.rand[0] +
              (a.effect.rand[1] - a.effect.rand[0]) * Math.random(),
          ),
        ));
      F.add(
        new u(
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
      q = a("DB/Items/ItemEffect"),
      r = a("Core/Events"),
      k = a("Renderer/Effects/RsmViewer"),
      g = a("Renderer/Effects/Cylinder"),
      u = a("Renderer/Effects/StrEffect"),
      l = a("Renderer/Effects/TwoDEffect"),
      f = a("Renderer/Effects/ThreeDEffect"),
      n = a("Renderer/Effects/GroundEffect"),
      p = a("Renderer/Entity/Entity"),
      v = a("Renderer/EntityManager"),
      t = a("Renderer/Renderer"),
      z = a("Renderer/Map/Altitude"),
      E = a("Audio/SoundManager"),
      C = a("Preferences/Map"),
      J = a("Renderer/Effects/QuadHorn"),
      A,
      B = {},
      F = {},
      O = 1;
    F.init = function (a) {
      A = a;
    };
    F.add = function (a, b) {
      if (A) {
        var c = a.constructor._uid || (a.constructor._uid = O++);
        c in B ||
          ((B[c] = []),
          a.constructor.init && a.constructor.init(A),
          a.constructor.renderBeforeEntities ||
            (a.constructor.renderBeforeEntities = !1));
        a.init && a.init(A);
        a._Params = b;
        B[c].push(a);
      }
    };
    F.remove = (function () {
      function a(a, b, c) {
        var d,
          e,
          f,
          g = Array.isArray(c) ? c : [c];
        d = B[a];
        f = d.length;
        for (e = 0; e < f; ++e)
          (!b || (b && d[e]._Params.Init.ownerAID === b)) &&
            (!c || (c && g.includes(d[e]._Params.Inst.effectID))) &&
            (d[e].free && d[e].free(A), d.splice(e, 1), e--, f--);
        f || delete B[a];
      }
      return function (b, c, d) {
        if (b) b._uid in B && a(b._uid, c, d);
        else {
          var e,
            f = Object.keys(B);
          b = 0;
          for (e = f.length; b < e; ++b) a(f[b], c, d);
        }
      };
    })();
    F.removeSpirits = (function () {
      return function (a) {
        var b,
          c,
          d = Object.keys(B);
        b = 0;
        for (c = d.length; b < c; ++b) {
          var e = d[b],
            f = a,
            g = [2011, 2012, 2013, 2014, 2015],
            h,
            l,
            k,
            n = Array.isArray(g) ? g : [g];
          h = B[e];
          k = h.length;
          for (l = 0; l < k; ++l)
            (!f || (f && h[l]._Params.Init.ownerAID === f)) &&
              (!g || (g && n.includes(h[l]._Params.Inst.effectID))) &&
              (h[l].free && h[l].free(A), h.splice(l, 1), l--, k--);
          k || delete B[e];
        }
      };
    })();
    F.free = function (a) {
      var b = Object.keys(B),
        c,
        d,
        e,
        f,
        g,
        h;
      c = 0;
      for (f = b.length; c < f; ++c) {
        g = B[b[c]];
        h = g[0].constructor;
        d = 0;
        for (e = g.length; d < e; ++d) g[d].free && g[d].free(a);
        h.free && h.free(a);
        delete B[b[c]];
      }
    };
    F.render = function (a, b, c, d, e, f) {
      var g = Object.keys(B),
        h,
        l = g.length,
        k,
        n,
        m,
        p;
      for (h = 0; h < l; ++h)
        if (((m = B[g[h]]), m.length)) {
          if (
            ((p = m[0].constructor), p.renderBeforeEntities === f && p.ready)
          ) {
            p.beforeRender && p.beforeRender(a, b, c, d, e);
            k = 0;
            for (n = m.length; k < n; ++k) {
              m[k].ready && m[k].render(a, e);
              var u;
              a: {
                u = m[k];
                var r = u._Params;
                if (
                  (r.Inst.persistent || r.Inst.repeatEnd) &&
                  !u._AlreadyRepeated
                ) {
                  var T = !1;
                  if (
                    r.Inst.duration &&
                    0 < r.Inst.duration &&
                    t.tick > r.Inst.endTick + r.Inst.repeatDelay
                  ) {
                    if (
                      !r.Inst.repeatEnd ||
                      r.Inst.repeatEnd > r.Inst.endTick + r.Inst.repeatDelay
                    )
                      T = r.Inst.endTick + r.Inst.repeatDelay;
                  } else
                    u.needCleanUp &&
                      (!r.Inst.repeatEnd ||
                        r.Inst.repeatEnd > t.tick + r.Inst.repeatDelay) &&
                      (T = t.tick + r.Inst.repeatDelay);
                  if (T) {
                    F.spamEffect({
                      effect: r.effect,
                      Inst: {
                        effectID: r.Inst.effectID,
                        duplicateID: r.Inst.duplicateID,
                        startTick: T,
                        noDelay: !0,
                      },
                      Init: r.Init,
                    });
                    u._AlreadyRepeated = !0;
                    u = 1;
                    break a;
                  }
                }
                u = 0;
              }
              n += u;
              m[k].noLifeTime
                ? v.get(m[k]._Params.Init.ownerAID) ||
                  (m[k].free && m[k].free(a), m.splice(k, 1), k--, n--)
                : m[k].needCleanUp &&
                  (m[k].free && m[k].free(a), m.splice(k, 1), k--, n--);
            }
            p.afterRender && p.afterRender(a);
            0 === n && (p.free && p.free(a), delete B[g[h]]);
          }
        } else delete B[g[h]];
    };
    F.endRepeat = (function () {
      function a(a, b, c) {
        var d,
          e,
          f = Array.isArray(c) ? c : [c];
        a = B[a];
        e = a.length;
        for (d = 0; d < e; ++d)
          (!b || (b && a[d]._Params.Init.ownerAID === b)) &&
            (!c || (c && f.includes(a[d].effectID))) &&
            (a[d]._Params.Inst.persistent &&
              (a[d]._Params.Inst.persistent = !1),
            a[d]._Params.Inst.repeatEnd && (a[d]._Params.Inst.repeatEnd = !1));
      }
      return function (b, c, d) {
        if (b && b.name in B) a(b.name, c, d);
        else {
          var e,
            f = Object.keys(B);
          b = 0;
          for (e = f.length; b < e; ++b) a(f[b], c, d);
        }
      };
    })();
    F.spam = function (a) {
      if (a && C.effect) {
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
        b.startTick || (b.startTick = t.tick);
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
              F.spamEffect({
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
    F.spamEffect = function (a) {
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
        r.setTimeout(
          function () {
            E.playPosition(d + ".wav", a.Inst.position);
          },
          a.Inst.startTick +
            (isNaN(a.effect.delayWav) ? 0 : a.effect.delayWav) -
            t.tick,
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
          F.add(new g(a.effect, a.Inst, a.Init), a);
          break;
        case "2D":
          F.add(new l(a.effect, a.Inst, a.Init), a);
          break;
        case "3D":
          F.add(new f(a.effect, a.Inst, a.Init), a);
          break;
        case "QuadHorn":
          F.add(new J(a.effect, a.Inst, a.Init), a);
          break;
        case "GROUND":
          F.add(new n(a.effect, a.Inst, a.Init), a);
          break;
        case "TRAP":
          F.add(new k(a.effect, a.Inst, a.Init), a);
          break;
        case "FUNC":
          a.effect.func &&
            (a.effect.attachedEntity
              ? a.Init.ownerEntity && a.effect.func.call(this, a)
              : a.effect.func.call(this, a));
      }
    };
    F.spamSkillZone = function (a, b, c, f, g) {
      var l = v.get(g),
        k = [h.UNT_ICEWALL, h.UNT_REVERBERATION],
        n = [h.UNT_PRE_WARPPORTAL],
        u = [
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
      if (C.effect && l) {
        if (134 == a) {
          if (91 != l.skillId && 254 != l.skillId && 2452 != l.skillId) return;
          l = l.skillId;
          if (!(l in e)) return;
          l = e[l];
          if (!l.groundEffectId) return;
          l = l.groundEffectId;
        } else {
          if (!(a in m)) return;
          l = m[a];
        }
        if (l in d) {
          var r = v.get(f),
            q = !1;
          r ||
            ((r = new p()),
            (r.GID = f),
            (r.position = [b, c, z.getCellHeight(b, c)]),
            (r.hideShadow = !0),
            (r.objecttype = u.includes(a)
              ? r.constructor.TYPE_TRAP
              : k.includes(a)
                ? r.constructor.TYPE_UNIT
                : n.includes(a)
                  ? r.constructor.TYPE_WARP
                  : r.constructor.TYPE_EFFECT),
            (r.creatorGID = g),
            (q = !0));
          q && v.add(r);
          F.remove(null, f);
          a = {
            effectId: l,
            ownerAID: f,
            position: [b, c, z.getCellHeight(b, c)],
            startTick: t.tick,
            persistent: !0,
            duration: -1,
            otherAID: g,
          };
          F.spam(a);
        }
      }
    };
    F.spamSkill = function (a, b, c, d, f) {
      if (a in e) {
        if (e[a].effectId) {
          var g = Array.isArray(e[a].effectId)
            ? e[a].effectId
            : [e[a].effectId];
          g.forEach(function (a) {
            F.spam({
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
            F.spam({
              effectId: a,
              ownerAID: f,
              position: c,
              startTick: d,
              otherAID: b,
            });
          }));
      }
    };
    F.spamSkillSuccess = function (a, b, c, d) {
      if (a in e) {
        if (e[a].successEffectId) {
          var f = Array.isArray(e[a].successEffectId)
            ? e[a].successEffectId
            : [e[a].successEffectId];
          f.forEach(function (a) {
            F.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
          });
        }
        e[a].successEffectIdOnCaster &&
          ((f = Array.isArray(e[a].successEffectIdOnCaster)
            ? e[a].successEffectIdOnCaster
            : [e[a].successEffectIdOnCaster]),
          f.forEach(function (a) {
            F.spam({ effectId: a, ownerAID: d, startTick: c, otherAID: b });
          }));
      }
    };
    F.spamSkillHit = function (a, b, c, d) {
      a in e &&
        e[a].hitEffectId &&
        (Array.isArray(e[a].hitEffectId)
          ? e[a].hitEffectId
          : [e[a].hitEffectId]
        ).forEach(function (a) {
          F.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
        });
    };
    F.spamSkillBeforeHit = function (a, b, c, d) {
      if (a in e) {
        if (e[a].beforeHitEffectId) {
          var f = Array.isArray(e[a].beforeHitEffectId)
            ? e[a].beforeHitEffectId
            : [e[a].beforeHitEffectId];
          f.forEach(function (a) {
            F.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
          });
        }
        e[a].beforeHitEffectIdOnCaster &&
          ((f = Array.isArray(e[a].beforeHitEffectIdOnCaster)
            ? e[a].beforeHitEffectIdOnCaster
            : [e[a].beforeHitEffectIdOnCaster]),
          f.forEach(function (a) {
            F.spam({ effectId: a, ownerAID: d, startTick: c, otherAID: b });
          }));
      }
    };
    F.spamSkillCast = function (a, b, c, d) {
      a in e &&
        e[a].beginCastEffectId &&
        (Array.isArray(e[a].beginCastEffectId)
          ? e[a].beginCastEffectId
          : [e[a].beginCastEffectId]
        ).forEach(function (a) {
          F.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
        });
    };
    F.spamItem = function (a, b, c, d, e) {
      if (a in q) {
        if (q[a].effectId) {
          var f = Array.isArray(q[a].effectId)
            ? q[a].effectId
            : [q[a].effectId];
          f.forEach(function (a) {
            F.spam({
              effectId: a,
              ownerAID: b,
              position: c,
              startTick: d,
              otherAID: e,
            });
          });
        }
        q[a].effectIdOnCaster &&
          e &&
          ((f = Array.isArray(q[a].effectIdOnCaster)
            ? q[a].effectIdOnCaster
            : [q[a].effectIdOnCaster]),
          f.forEach(function (a) {
            F.spam({
              effectId: a,
              ownerAID: e,
              position: c,
              startTick: d,
              otherAID: b,
            });
          }));
      }
    };
    return F;
  },
);
