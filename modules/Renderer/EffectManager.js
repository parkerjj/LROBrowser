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
      H.add(
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
      c && u.add(b);
    }
    var d = a("DB/Effects/EffectTable"),
      e = a("DB/Skills/SkillEffect"),
      m = a("DB/Skills/SkillUnit"),
      h = a("DB/Skills/SkillUnitConst"),
      t = a("DB/Items/ItemEffect"),
      r = a("Core/Events"),
      n = a("Renderer/Effects/RsmViewer"),
      g = a("Renderer/Effects/Cylinder"),
      p = a("Renderer/Effects/StrEffect"),
      l = a("Renderer/Effects/TwoDEffect"),
      f = a("Renderer/Effects/ThreeDEffect"),
      k = a("Renderer/Effects/GroundEffect"),
      q = a("Renderer/Entity/Entity"),
      u = a("Renderer/EntityManager"),
      v = a("Renderer/Renderer"),
      A = a("Renderer/Map/Altitude"),
      C = a("Audio/SoundManager"),
      B = a("Preferences/Map"),
      J = a("Renderer/Effects/QuadHorn"),
      D,
      y = {},
      H = {},
      N = 1;
    H.init = function (a) {
      D = a;
    };
    H.add = function (a, b) {
      if (D) {
        var c = a.constructor._uid || (a.constructor._uid = N++);
        c in y ||
          ((y[c] = []),
          a.constructor.init && a.constructor.init(D),
          a.constructor.renderBeforeEntities ||
            (a.constructor.renderBeforeEntities = !1));
        a.init && a.init(D);
        a._Params = b;
        y[c].push(a);
      }
    };
    H.remove = (function () {
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
            (d[e].free && d[e].free(D), d.splice(e, 1), e--, f--);
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
    H.removeSpirits = (function () {
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
            m = Array.isArray(g) ? g : [g];
          h = y[e];
          l = h.length;
          for (k = 0; k < l; ++k)
            (!f || (f && h[k]._Params.Init.ownerAID === f)) &&
              (!g || (g && m.includes(h[k]._Params.Inst.effectID))) &&
              (h[k].free && h[k].free(D), h.splice(k, 1), k--, l--);
          l || delete y[e];
        }
      };
    })();
    H.free = function (a) {
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
    H.render = function (a, b, c, d, e, f) {
      var g = Object.keys(y),
        h,
        k = g.length,
        l,
        m,
        p,
        n;
      for (h = 0; h < k; ++h)
        if (((p = y[g[h]]), p.length)) {
          if (
            ((n = p[0].constructor), n.renderBeforeEntities === f && n.ready)
          ) {
            n.beforeRender && n.beforeRender(a, b, c, d, e);
            l = 0;
            for (m = p.length; l < m; ++l) {
              p[l].ready && p[l].render(a, e);
              var q;
              a: {
                q = p[l];
                var r = q._Params;
                if (
                  (r.Inst.persistent || r.Inst.repeatEnd) &&
                  !q._AlreadyRepeated
                ) {
                  var T = !1;
                  if (
                    r.Inst.duration &&
                    0 < r.Inst.duration &&
                    v.tick > r.Inst.endTick + r.Inst.repeatDelay
                  ) {
                    if (
                      !r.Inst.repeatEnd ||
                      r.Inst.repeatEnd > r.Inst.endTick + r.Inst.repeatDelay
                    )
                      T = r.Inst.endTick + r.Inst.repeatDelay;
                  } else
                    q.needCleanUp &&
                      (!r.Inst.repeatEnd ||
                        r.Inst.repeatEnd > v.tick + r.Inst.repeatDelay) &&
                      (T = v.tick + r.Inst.repeatDelay);
                  if (T) {
                    H.spamEffect({
                      effect: r.effect,
                      Inst: {
                        effectID: r.Inst.effectID,
                        duplicateID: r.Inst.duplicateID,
                        startTick: T,
                        noDelay: !0,
                      },
                      Init: r.Init,
                    });
                    q._AlreadyRepeated = !0;
                    q = 1;
                    break a;
                  }
                }
                q = 0;
              }
              m += q;
              p[l].noLifeTime
                ? u.get(p[l]._Params.Init.ownerAID) ||
                  (p[l].free && p[l].free(a), p.splice(l, 1), l--, m--)
                : p[l].needCleanUp &&
                  (p[l].free && p[l].free(a), p.splice(l, 1), l--, m--);
            }
            n.afterRender && n.afterRender(a);
            0 === m && (n.free && n.free(a), delete y[g[h]]);
          }
        } else delete y[g[h]];
    };
    H.endRepeat = (function () {
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
    H.spam = function (a) {
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
        b.startTick || (b.startTick = v.tick);
        b.ownerEntity = u.get(b.ownerAID);
        b.otherEntity = u.get(b.otherAID);
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
              H.spamEffect({
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
    H.spamEffect = function (a) {
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
            C.playPosition(d + ".wav", a.Inst.position);
          },
          a.Inst.startTick +
            (isNaN(a.effect.delayWav) ? 0 : a.effect.delayWav) -
            v.tick,
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
          H.add(new g(a.effect, a.Inst, a.Init), a);
          break;
        case "2D":
          H.add(new l(a.effect, a.Inst, a.Init), a);
          break;
        case "3D":
          H.add(new f(a.effect, a.Inst, a.Init), a);
          break;
        case "QuadHorn":
          H.add(new J(a.effect, a.Inst, a.Init), a);
          break;
        case "GROUND":
          H.add(new k(a.effect, a.Inst, a.Init), a);
          break;
        case "TRAP":
          H.add(new n(a.effect, a.Inst, a.Init), a);
          break;
        case "FUNC":
          a.effect.func &&
            (a.effect.attachedEntity
              ? a.Init.ownerEntity && a.effect.func.call(this, a)
              : a.effect.func.call(this, a));
      }
    };
    H.spamSkillZone = function (a, b, c, f, g) {
      var k = u.get(g),
        l = [h.UNT_ICEWALL, h.UNT_REVERBERATION],
        p = [h.UNT_PRE_WARPPORTAL],
        n = [
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
          var r = u.get(f),
            t = !1;
          r ||
            ((r = new q()),
            (r.GID = f),
            (r.position = [b, c, A.getCellHeight(b, c)]),
            (r.hideShadow = !0),
            (r.objecttype = n.includes(a)
              ? r.constructor.TYPE_TRAP
              : l.includes(a)
                ? r.constructor.TYPE_UNIT
                : p.includes(a)
                  ? r.constructor.TYPE_WARP
                  : r.constructor.TYPE_EFFECT),
            (r.creatorGID = g),
            (t = !0));
          t && u.add(r);
          H.remove(null, f);
          a = {
            effectId: k,
            ownerAID: f,
            position: [b, c, A.getCellHeight(b, c)],
            startTick: v.tick,
            persistent: !0,
            duration: -1,
            otherAID: g,
          };
          H.spam(a);
        }
      }
    };
    H.spamSkill = function (a, b, c, d, f) {
      if (a in e) {
        if (e[a].effectId) {
          var g = Array.isArray(e[a].effectId)
            ? e[a].effectId
            : [e[a].effectId];
          g.forEach(function (a) {
            H.spam({
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
            H.spam({
              effectId: a,
              ownerAID: f,
              position: c,
              startTick: d,
              otherAID: b,
            });
          }));
      }
    };
    H.spamSkillSuccess = function (a, b, c, d) {
      if (a in e) {
        if (e[a].successEffectId) {
          var f = Array.isArray(e[a].successEffectId)
            ? e[a].successEffectId
            : [e[a].successEffectId];
          f.forEach(function (a) {
            H.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
          });
        }
        e[a].successEffectIdOnCaster &&
          ((f = Array.isArray(e[a].successEffectIdOnCaster)
            ? e[a].successEffectIdOnCaster
            : [e[a].successEffectIdOnCaster]),
          f.forEach(function (a) {
            H.spam({ effectId: a, ownerAID: d, startTick: c, otherAID: b });
          }));
      }
    };
    H.spamSkillHit = function (a, b, c, d) {
      a in e &&
        e[a].hitEffectId &&
        (Array.isArray(e[a].hitEffectId)
          ? e[a].hitEffectId
          : [e[a].hitEffectId]
        ).forEach(function (a) {
          H.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
        });
    };
    H.spamSkillBeforeHit = function (a, b, c, d) {
      if (a in e) {
        if (e[a].beforeHitEffectId) {
          var f = Array.isArray(e[a].beforeHitEffectId)
            ? e[a].beforeHitEffectId
            : [e[a].beforeHitEffectId];
          f.forEach(function (a) {
            H.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
          });
        }
        e[a].beforeHitEffectIdOnCaster &&
          ((f = Array.isArray(e[a].beforeHitEffectIdOnCaster)
            ? e[a].beforeHitEffectIdOnCaster
            : [e[a].beforeHitEffectIdOnCaster]),
          f.forEach(function (a) {
            H.spam({ effectId: a, ownerAID: d, startTick: c, otherAID: b });
          }));
      }
    };
    H.spamSkillCast = function (a, b, c, d) {
      a in e &&
        e[a].beginCastEffectId &&
        (Array.isArray(e[a].beginCastEffectId)
          ? e[a].beginCastEffectId
          : [e[a].beginCastEffectId]
        ).forEach(function (a) {
          H.spam({ effectId: a, ownerAID: b, startTick: c, otherAID: d });
        });
    };
    H.spamItem = function (a, b, c, d, e) {
      if (a in t) {
        if (t[a].effectId) {
          var f = Array.isArray(t[a].effectId)
            ? t[a].effectId
            : [t[a].effectId];
          f.forEach(function (a) {
            H.spam({
              effectId: a,
              ownerAID: b,
              position: c,
              startTick: d,
              otherAID: e,
            });
          });
        }
        t[a].effectIdOnCaster &&
          e &&
          ((f = Array.isArray(t[a].effectIdOnCaster)
            ? t[a].effectIdOnCaster
            : [t[a].effectIdOnCaster]),
          f.forEach(function (a) {
            H.spam({
              effectId: a,
              ownerAID: e,
              position: c,
              startTick: d,
              otherAID: b,
            });
          }));
      }
    };
    return H;
  },
);
