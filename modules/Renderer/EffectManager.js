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
      G.add(
        new p(
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
          ((b = new q()),
          (b.GID = -1),
          (b.position = a.Inst.position),
          (b.objecttype = b.constructor.TYPE_EFFECT),
          (c = !0))
        : ((b = new q()),
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
      l = a("DB/Skills/SkillUnit"),
      h = a("DB/Skills/SkillUnitConst"),
      r = a("DB/Items/ItemEffect"),
      t = a("Core/Events"),
      n = a("Renderer/Effects/RsmViewer"),
      g = a("Renderer/Effects/Cylinder"),
      p = a("Renderer/Effects/StrEffect"),
      k = a("Renderer/Effects/TwoDEffect"),
      f = a("Renderer/Effects/ThreeDEffect"),
      m = a("Renderer/Effects/GroundEffect"),
      q = a("Renderer/Entity/Entity"),
      v = a("Renderer/EntityManager"),
      u = a("Renderer/Renderer"),
      A = a("Renderer/Map/Altitude"),
      D = a("Audio/SoundManager"),
      B = a("Preferences/Map"),
      H = a("Renderer/Effects/QuadHorn"),
      C,
      z = {},
      G = {},
      P = 1;
    G.init = function (a) {
      C = a;
    };
    G.add = function (a, b) {
      if (C) {
        var c = a.constructor._uid || (a.constructor._uid = P++);
        c in z ||
          ((z[c] = []),
          a.constructor.init && a.constructor.init(C),
          a.constructor.renderBeforeEntities ||
            (a.constructor.renderBeforeEntities = !1));
        a.init && a.init(C);
        a._Params = b;
        z[c].push(a);
      }
    };
    G.remove = (function () {
      function a(a, b, c) {
        var d,
          e,
          f,
          g = Array.isArray(c) ? c : [c];
        d = z[a];
        f = d.length;
        for (e = 0; e < f; ++e)
          (!b || (b && d[e]._Params.Init.ownerAID === b)) &&
            (!c || (c && g.includes(d[e]._Params.Inst.effectID))) &&
            (d[e].free && d[e].free(C), d.splice(e, 1), e--, f--);
        f || delete z[a];
      }
      return function (b, c, d) {
        if (b) b._uid in z && a(b._uid, c, d);
        else {
          var e,
            f = Object.keys(z);
          b = 0;
          for (e = f.length; b < e; ++b) a(f[b], c, d);
        }
      };
    })();
    G.removeSpirits = (function () {
      return function (a) {
        var b,
          c,
          d = Object.keys(z);
        b = 0;
        for (c = d.length; b < c; ++b) {
          var e = d[b],
            f = a,
            g = [2011, 2012, 2013, 2014, 2015],
            h,
            k,
            m,
            n = Array.isArray(g) ? g : [g];
          h = z[e];
          m = h.length;
          for (k = 0; k < m; ++k)
            (!f || (f && h[k]._Params.Init.ownerAID === f)) &&
              (!g || (g && n.includes(h[k]._Params.Inst.effectID))) &&
              (h[k].free && h[k].free(C), h.splice(k, 1), k--, m--);
          m || delete z[e];
        }
      };
    })();
    G.free = function (a) {
      var b = Object.keys(z),
        c,
        d,
        e,
        f,
        g,
        h;
      c = 0;
      for (f = b.length; c < f; ++c) {
        g = z[b[c]];
        h = g[0].constructor;
        d = 0;
        for (e = g.length; d < e; ++d) g[d].free && g[d].free(a);
        h.free && h.free(a);
        delete z[b[c]];
      }
    };
    G.render = function (a, b, c, d, e, f) {
      var g = Object.keys(z),
        h,
        k = g.length,
        m,
        n,
        l,
        p;
      for (h = 0; h < k; ++h)
        if (((l = z[g[h]]), l.length)) {
          if (
            ((p = l[0].constructor), p.renderBeforeEntities === f && p.ready)
          ) {
            p.beforeRender && p.beforeRender(a, b, c, d, e);
            m = 0;
            for (n = l.length; m < n; ++m) {
              l[m].ready && l[m].render(a, e);
              var q;
              a: {
                q = l[m];
                var t = q._Params;
                if (
                  (t.Inst.persistent || t.Inst.repeatEnd) &&
                  !q._AlreadyRepeated
                ) {
                  var T = !1;
                  if (
                    t.Inst.duration &&
                    0 < t.Inst.duration &&
                    u.tick > t.Inst.endTick + t.Inst.repeatDelay
                  ) {
                    if (
                      !t.Inst.repeatEnd ||
                      t.Inst.repeatEnd > t.Inst.endTick + t.Inst.repeatDelay
                    )
                      T = t.Inst.endTick + t.Inst.repeatDelay;
                  } else
                    q.needCleanUp &&
                      (!t.Inst.repeatEnd ||
                        t.Inst.repeatEnd > u.tick + t.Inst.repeatDelay) &&
                      (T = u.tick + t.Inst.repeatDelay);
                  if (T) {
                    G.spamEffect({
                      effect: t.effect,
                      Inst: {
                        effectID: t.Inst.effectID,
                        duplicateID: t.Inst.duplicateID,
                        startTick: T,
                        noDelay: !0,
                      },
                      Init: t.Init,
                    });
                    q._AlreadyRepeated = !0;
                    q = 1;
                    break a;
                  }
                }
                q = 0;
              }
              n += q;
              l[m].noLifeTime
                ? v.get(l[m]._Params.Init.ownerAID) ||
                  (l[m].free && l[m].free(a), l.splice(m, 1), m--, n--)
                : l[m].needCleanUp &&
                  (l[m].free && l[m].free(a), l.splice(m, 1), m--, n--);
            }
            p.afterRender && p.afterRender(a);
            0 === n && (p.free && p.free(a), delete z[g[h]]);
          }
        } else delete z[g[h]];
    };
    G.endRepeat = (function () {
      function a(a, b, c) {
        var d,
          e,
          f = Array.isArray(c) ? c : [c];
        a = z[a];
        e = a.length;
        for (d = 0; d < e; ++d)
          (!b || (b && a[d]._Params.Init.ownerAID === b)) &&
            (!c || (c && f.includes(a[d].effectID))) &&
            (a[d]._Params.Inst.persistent &&
              (a[d]._Params.Inst.persistent = !1),
            a[d]._Params.Inst.repeatEnd && (a[d]._Params.Inst.repeatEnd = !1));
      }
      return function (b, c, d) {
        if (b && b.name in z) a(b.name, c, d);
        else {
          var e,
            f = Object.keys(z);
          b = 0;
          for (e = f.length; b < e; ++b) a(f[b], c, d);
        }
      };
    })();
    G.spam = function (a) {
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
              G.spamEffect({
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
    G.spamEffect = function (a) {
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
        t.setTimeout(
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
          G.add(new g(a.effect, a.Inst, a.Init), a);
          break;
        case "2D":
          G.add(new k(a.effect, a.Inst, a.Init), a);
          break;
        case "3D":
          G.add(new f(a.effect, a.Inst, a.Init), a);
          break;
        case "QuadHorn":
          G.add(new H(a.effect, a.Inst, a.Init), a);
          break;
        case "GROUND":
          G.add(new m(a.effect, a.Inst, a.Init), a);
          break;
        case "TRAP":
          G.add(new n(a.effect, a.Inst, a.Init), a);
          break;
        case "FUNC":
          a.effect.func &&
            (a.effect.attachedEntity
              ? a.Init.ownerEntity && a.effect.func.call(this, a)
              : a.effect.func.call(this, a));
      }
    };
    G.spamSkillZone = function (a, b, c, f, g) {
      var k = v.get(g),
        m = [h.UNT_ICEWALL, h.UNT_REVERBERATION],
        n = [h.UNT_PRE_WARPPORTAL],
        p = [
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
          if (!(a in l)) return;
          k = l[a];
        }
        if (k in d) {
          var t = v.get(f),
            r = !1;
          t ||
            ((t = new q()),
            (t.GID = f),
            (t.position = [b, c, A.getCellHeight(b, c)]),
            (t.hideShadow = !0),
            (t.objecttype = p.includes(a)
              ? t.constructor.TYPE_TRAP
              : m.includes(a)
                ? t.constructor.TYPE_UNIT
                : n.includes(a)
                  ? t.constructor.TYPE_WARP
                  : t.constructor.TYPE_EFFECT),
            (t.creatorGID = g),
            (r = !0));
          r && v.add(t);
          G.remove(null, f);
          a = {
            effectId: k,
            ownerAID: f,
            position: [b, c, A.getCellHeight(b, c)],
            startTick: u.tick,
            persistent: !0,
            duration: -1,
            otherAID: g,
          };
          G.spam(a);
        }
      }
    };
    G.spamSkill = function (a, b, c, d, f) {
      if (a in e) {
        if (e[a].effectId) {
          var g = Array.isArray(e[a].effectId)
            ? e[a].effectId
            : [e[a].effectId];
          g.forEach(function (a) {
            G.spam({
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
            G.spam({
              effectId: a,
              ownerAID: f,
              position: c,
              startTick: d,
              otherAID: b,
            });
          }));
      }
    };
    G.spamSkillSuccess = function (a, b, c, d) {
      if (a in e) {
        if (e[a].successEffectId) {
          var f = Array.isArray(e[a].successEffectId)
            ? e[a].successEffectId
            : [e[a].successEffectId];
          f.forEach(function (a) {
            G.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
          });
        }
        e[a].successEffectIdOnCaster &&
          ((f = Array.isArray(e[a].successEffectIdOnCaster)
            ? e[a].successEffectIdOnCaster
            : [e[a].successEffectIdOnCaster]),
          f.forEach(function (a) {
            G.spam({ effectId: a, ownerAID: d, startTick: c, otherAID: b });
          }));
      }
    };
    G.spamSkillHit = function (a, b, c, d) {
      a in e &&
        e[a].hitEffectId &&
        (Array.isArray(e[a].hitEffectId)
          ? e[a].hitEffectId
          : [e[a].hitEffectId]
        ).forEach(function (a) {
          G.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
        });
    };
    G.spamSkillBeforeHit = function (a, b, c, d) {
      if (a in e) {
        if (e[a].beforeHitEffectId) {
          var f = Array.isArray(e[a].beforeHitEffectId)
            ? e[a].beforeHitEffectId
            : [e[a].beforeHitEffectId];
          f.forEach(function (a) {
            G.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
          });
        }
        e[a].beforeHitEffectIdOnCaster &&
          ((f = Array.isArray(e[a].beforeHitEffectIdOnCaster)
            ? e[a].beforeHitEffectIdOnCaster
            : [e[a].beforeHitEffectIdOnCaster]),
          f.forEach(function (a) {
            G.spam({ effectId: a, ownerAID: d, startTick: c, otherAID: b });
          }));
      }
    };
    G.spamSkillCast = function (a, b, c, d) {
      a in e &&
        e[a].beginCastEffectId &&
        (Array.isArray(e[a].beginCastEffectId)
          ? e[a].beginCastEffectId
          : [e[a].beginCastEffectId]
        ).forEach(function (a) {
          G.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
        });
    };
    G.spamItem = function (a, b, c, d, e) {
      if (a in r) {
        if (r[a].effectId) {
          var f = Array.isArray(r[a].effectId)
            ? r[a].effectId
            : [r[a].effectId];
          f.forEach(function (a) {
            G.spam({
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
            G.spam({
              effectId: a,
              ownerAID: e,
              position: c,
              startTick: d,
              otherAID: b,
            });
          }));
      }
    };
    return G;
  },
);
