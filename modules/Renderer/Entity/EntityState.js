define(
  "Renderer/Entity/EntityState",
  "require Audio/SoundManager DB/Status/StatusState DB/Jobs/MountTable DB/Jobs/MountTable2 Engine/SessionStorage DB/Emotions".split(
    " ",
  ),
  function (a) {
    function b() {
      this.effectColor[0] =
        this._bodyStateColor[0] *
        this._healthStateColor[0] *
        this._effectStateColor[0] *
        this._virtueColor[0] *
        this._flashColor[0];
      this.effectColor[1] =
        this._bodyStateColor[1] *
        this._healthStateColor[1] *
        this._effectStateColor[1] *
        this._virtueColor[1] *
        this._flashColor[1];
      this.effectColor[2] =
        this._bodyStateColor[2] *
        this._healthStateColor[2] *
        this._effectStateColor[2] *
        this._virtueColor[2] *
        this._flashColor[2];
      this.effectColor[3] =
        this._bodyStateColor[3] *
        this._healthStateColor[3] *
        this._effectStateColor[3] *
        this._virtueColor[3] *
        this._flashColor[3];
    }
    function c(a, b) {
      if (0 !== a) {
        var c = v[a];
        void 0 === c
          ? console.log("toggleState: unknown state", a)
          : (this.virtue = b ? this.virtue | c : this.virtue ^ c);
      }
    }
    function d(a) {
      if (0 === a) return !1;
      var b = v[a];
      return void 0 === b
        ? (console.log("toggleState: unknown state", a), !1)
        : 0 !== (this.virtue & b);
    }
    function e(a) {
      this._virtueColor[0] = 1;
      this._virtueColor[1] = 1;
      this._virtueColor[2] = 1;
      this._virtueColor[3] = 1;
      a & g.OPT3.QUICKEN && (this._virtueColor[2] = 0);
      a & g.OPT3.EXPLOSIONSPIRITS &&
        ((this._virtueColor[0] = 1),
        (this._virtueColor[1] = 0.75),
        (this._virtueColor[2] = 0.75));
      a & g.OPT3.BLADESTOP &&
        ((this._virtueColor[0] = 0.25),
        (this._virtueColor[1] = 0.25),
        (this._virtueColor[2] = 0.25));
      if (a & g.OPT3.ENERGYCOAT || a & g.OPT3.BUNSIN)
        ((this._virtueColor[0] = 0.5),
          (this._virtueColor[1] = 0.5),
          (this._virtueColor[2] = 0.85));
      a & g.OPT3.OVERTHRUST &&
        ((this._virtueColor[1] = 0.75), (this._virtueColor[2] = 0.75));
      a & g.OPT3.WARM &&
        ((this._virtueColor[1] = 0.4), (this._virtueColor[2] = 0.4));
      a & g.OPT3.SOULLINK &&
        ((this._virtueColor[0] = 0.35),
        (this._virtueColor[1] = 0.35),
        (this._virtueColor[2] = 0.9),
        (this._virtueColor[3] = 0.9));
      a & g.OPT3.UNDEAD &&
        ((this._virtueColor[0] = 0.7), (this._virtueColor[2] = 0.65));
      a & g.OPT3.MARIONETTE &&
        ((this._virtueColor[0] = 1),
        (this._virtueColor[1] = 0.34),
        (this._virtueColor[2] = 0.71),
        (this._virtueColor[3] = 0.5));
      a & g.OPT3.BERSERK &&
        ((this._virtueColor[0] = 1),
        (this._virtueColor[1] = 0.4),
        (this._virtueColor[2] = 0.4),
        (this._virtueColor[3] = 1));
      b.call(this);
      this._virtue = a;
    }
    function m(a) {
      if (a !== this._bodyState) {
        this._bodyStateColor[0] = 1;
        this._bodyStateColor[1] = 1;
        this._bodyStateColor[2] = 1;
        this._bodyStateColor[3] = 1;
        switch (this._bodyState) {
          case g.BodyState.SLEEP:
            this.attachments.remove("status-sleep");
            break;
          case g.BodyState.FREEZE:
            k.playPosition("_frozen_explosion.wav", this.position);
            this.attachments.add({
              frame: 1,
              uid: "status-freeze",
              file: "\u00be\u00f3\u00c0\u00bd\u00b6\u00af",
            });
            this.setAction({
              action: this.ACTION.READYFIGHT,
              frame: 0,
              repeat: !0,
              play: !0,
            });
            break;
          case g.BodyState.STONE:
            k.playPosition("_stone_explosion.wav", this.position);
            this.animation.play = !0;
            break;
          case g.BodyState.STUN:
            this.attachments.remove("status-stun");
        }
        switch (a) {
          case g.BodyState.STONE:
            this._bodyStateColor[0] = 0.1;
            this._bodyStateColor[1] = 0.1;
            this._bodyStateColor[2] = 0.1;
            this.animation.play = !1;
            break;
          case g.BodyState.STONEWAIT:
            this._bodyStateColor[0] = 0.3;
            this._bodyStateColor[1] = 0.3;
            this._bodyStateColor[2] = 0.3;
            k.playPosition("_stonecurse.wav", this.position);
            break;
          case g.BodyState.SLEEP:
            this.attachments.add({
              repeat: !0,
              frame: 0,
              uid: "status-sleep",
              file: "status-sleep",
              head: !0,
            });
            break;
          case g.BodyState.FREEZE:
            this._bodyStateColor[0] = 0;
            this._bodyStateColor[1] = 0.4;
            this._bodyStateColor[2] = 0.8;
            this.attachments.add({
              animationId: 0,
              frame: 0,
              uid: "status-freeze",
              file: "\u00be\u00f3\u00c0\u00bd\u00b6\u00af",
            });
            this.setAction({
              action: this.ACTION.FREEZE2,
              frame: 0,
              repeat: !1,
              play: !1,
            });
            break;
          case g.BodyState.STUN:
            (k.playPosition("_stun.wav", this.position),
              this.attachments.add({
                repeat: !0,
                frame: 0,
                uid: "status-stun",
                file: "status-stun",
                head: !0,
              }));
        }
        this._bodyState = a;
        b.call(this);
      }
    }
    function h(a) {
      a !== this._healthState &&
        ((this._healthStateColor[0] = 1),
        (this._healthStateColor[1] = 1),
        (this._healthStateColor[2] = 1),
        (this._healthStateColor[3] = 1),
        a & g.HealthState.CURSE
          ? (this._healthState & g.HealthState.CURSE ||
              (k.playPosition("_curse.wav", this.position),
              this.attachments.add({
                repeat: !0,
                uid: "status-curse",
                file: "status-curse",
                head: !0,
                opacity: 0.5,
              })),
            (this._healthStateColor[0] *= 0.5),
            (this._healthStateColor[1] *= 0.15),
            (this._healthStateColor[2] *= 0.1))
          : a & g.HealthState.CURSE || this.attachments.remove("status-curse"),
        a & g.HealthState.POISON &&
          (this._healthState & g.HealthState.POISON ||
            k.playPosition("_poison.wav", this.position),
          (this._healthStateColor[0] *= 0.9),
          (this._healthStateColor[1] *= 0.4),
          (this._healthStateColor[2] *= 0.8)),
        a & g.HealthState.BLIND &&
          (this._healthState & g.HealthState.BLIND ||
            k.playPosition("_blind.wav", this.position)),
        a & g.HealthState.SILENCE
          ? this._healthState & g.HealthState.SILENCE ||
            (k.playPosition("_silence.wav", this.position),
            this.attachments.add({
              frame: n.indexes[9],
              file: "emotion",
              uid: "status-silence",
              play: !0,
              head: !0,
              repeat: !0,
              depth: 5,
            }))
          : a & g.HealthState.SILENCE ||
            this.attachments.remove("status-silence"),
        (this._healthState = a),
        b.call(this));
    }
    function r(a) {
      var c = 0;
      this._allRidingState && (c = this.costume);
      this._effectStateColor[0] = 1;
      this._effectStateColor[1] = 1;
      this._effectStateColor[2] = 1;
      this._effectStateColor[3] = 1;
      a &
        (g.EffectState.RIDING |
          g.EffectState.DRAGON1 |
          g.EffectState.DRAGON2 |
          g.EffectState.DRAGON3 |
          g.EffectState.DRAGON4 |
          g.EffectState.DRAGON5 |
          g.EffectState.WUGRIDER |
          g.EffectState.MADOGEAR) &&
        this._job in t &&
        (c = t[this._job]);
      a & g.EffectState.WEDDING && (c = 22);
      a & g.EffectState.XMAS && (c = 26);
      a & g.EffectState.SUMMER && (c = 27);
      a & g.EffectState.FALCON && (this.falcon = !0);
      a & g.EffectState.WUG &&
        0 == this.wolf &&
        ((this.wolf = !0), p("Renderer/WolfObject").add(this));
      0 == a &&
        1 == this.wolf &&
        ((this.wolf = !1), p("Renderer/WolfObject").remove(this.GID));
      1 == this.berserk &&
        ((this._effectStateColor[0] = 2),
        (this._effectStateColor[1] = 1.2),
        (this._effectStateColor[2] = 1));
      if (1 == this.explosion || 2 == this.virtue)
        ((this._effectStateColor[0] = 1),
          (this._effectStateColor[1] = 0.7),
          (this._effectStateColor[2] = 0.7));
      1 == this.virtue &&
        ((this._effectStateColor[0] = 0.8),
        (this._effectStateColor[1] = 0.8),
        (this._effectStateColor[2] = 0));
      4 == this.virtue &&
        ((this._effectStateColor[0] = 0.7),
        (this._effectStateColor[1] = 0.7),
        (this._effectStateColor[2] = 1));
      1 == this.soullink &&
        ((this._effectStateColor[0] = 1),
        (this._effectStateColor[1] = 1),
        (this._effectStateColor[2] = 2));
      p("Renderer/EffectManager").remove(null, this.GID);
      if (a & g.EffectState.RUWACH) {
        var d = { effectId: 33, ownerAID: this.GID, position: this.position };
        p("Renderer/EffectManager").spam(d);
      }
      a & g.EffectState.SIGHT &&
        ((d = { effectId: 22, ownerAID: this.GID, position: this.position }),
        p("Renderer/EffectManager").spam(d));
      this.isHide = !1;
      if (a & g.EffectState.INVISIBLE)
        ((this.isHide = !0),
          this.objecttype === this.constructor.TYPE_PC &&
            ((this.display.display = !1), this.display.remove()),
          (this._effectStateColor[3] = 0),
          p("Renderer/EffectManager").remove(null, this.GID));
      else if (
        a &
        (g.EffectState.HIDE | g.EffectState.CLOAK | g.EffectState.CHASEWALK)
      )
        f.Character.intravision
          ? ((this._effectStateColor[0] = 0),
            (this._effectStateColor[1] = 0),
            (this._effectStateColor[2] = 0))
          : ((this.isHide = !0),
            this.objecttype === this.constructor.TYPE_PC &&
              ((this.display.display = !1), this.display.remove()),
            (this._effectStateColor[3] = 0),
            p("Renderer/EffectManager").remove(null, this.GID));
      else if (this.Camouflage || this.Stealthfield)
        f.Character.intravision
          ? ((this._effectStateColor[0] = 0),
            (this._effectStateColor[1] = 0),
            (this._effectStateColor[2] = 0))
          : ((this._effectStateColor[3] = 0.1),
            k.play("effect/assasin_cloaking.wav", this.position));
      else if (this.Shadowform)
        f.Character.intravision
          ? ((this._effectStateColor[0] = 0),
            (this._effectStateColor[1] = 0),
            (this._effectStateColor[2] = 0))
          : ((this._effectStateColor[0] = 0.2),
            (this._effectStateColor[1] = 0.2),
            (this._effectStateColor[2] = 0.2),
            (this._effectStateColor[3] = 0.2),
            k.play("effect/assasin_cloaking.wav", this.position));
      else if (99 == this.clevel || 200 == this.clevel)
        ((d = { effectId: 202, ownerAID: this.GID, position: this.position }),
          p("Renderer/EffectManager").spam(d));
      c !== this.costume && ((this.costume = c), (this.job = this._job));
      this._effectState = a;
      b.call(this);
    }
    function q(a) {
      var c = 0,
        d =
          g.EffectState.RIDING |
          g.EffectState.DRAGON1 |
          g.EffectState.DRAGON2 |
          g.EffectState.DRAGON3 |
          g.EffectState.DRAGON4 |
          g.EffectState.DRAGON5 |
          g.EffectState.WUGRIDER |
          g.EffectState.MADOGEAR |
          g.EffectState.WEDDING |
          g.EffectState.XMAS |
          g.EffectState.SUMMER;
      !a || this._effectState & d || (this._job in l && (c = l[this._job]));
      c !== this.costume && ((this.costume = c), (this.job = this._job));
      this._allRidingState = a;
      b.call(this);
    }
    var k = a("Audio/SoundManager"),
      g = a("DB/Status/StatusState"),
      t = a("DB/Jobs/MountTable"),
      l = a("DB/Jobs/MountTable2"),
      f = a("Engine/SessionStorage"),
      n = a("DB/Emotions"),
      p = a,
      v = {};
    v[g.Status.TWOHANDQUICKEN] = g.OPT3.QUICKEN;
    v[g.Status.SPEARQUICKEN] = g.OPT3.QUICKEN;
    v[g.Status.LKCONCENTRATION] = g.OPT3.QUICKEN;
    v[g.Status.ONEHANDQUICKEN] = g.OPT3.QUICKEN;
    v[g.Status.EXPLOSIONSPIRITS] = g.OPT3.EXPLOSIONSPIRITS;
    v[g.Status.STEELBODY] = g.OPT3.STEELBODY;
    v[g.Status.AURABLADE] = g.OPT3.AURABLADE;
    v[g.Status.BLADESTOP] = g.OPT3.BLADESTOP;
    v[g.Status.OVERTHRUST] = g.OPT3.OVERTHRUST;
    v[g.Status.OVERTHRUSTMAX] = g.OPT3.OVERTHRUST;
    v[g.Status.SWOO] = g.OPT3.OVERTHRUST;
    v[g.Status.ENERGYCOAT] = g.OPT3.ENERGYCOAT;
    v[g.Status.SKE] = g.OPT3.ENERGYCOAT;
    v[g.Status.BERSERK] = g.OPT3.BERSERK;
    v[g.Status.MARIONETTE] = g.OPT3.MARIONETTE;
    v[g.Status.MARIONETTE_MASTER] = g.OPT3.MARIONETTE;
    v[g.Status.ASSUMPTIO] = g.OPT3.ASSUMPTIO;
    v[g.Status.ASSUMPTIO2] = g.OPT3.ASSUMPTIO;
    v[g.Status.SG_WARM] = g.OPT3.WARM;
    v[g.Status.SG_SUN_WARM] = g.OPT3.WARM;
    v[g.Status.SG_MOON_WARM] = g.OPT3.WARM;
    v[g.Status.SG_STAR_WARM] = g.OPT3.WARM;
    v[g.Status.KAITE] = g.OPT3.KAITE;
    v[g.Status.NJ_BUNSINJYUTSU] = g.OPT3.BUNSIN;
    v[g.Status.SOULLINK] = g.OPT3.SOULLINK;
    v[g.Status.PROPERTYUNDEAD] = g.OPT3.UNDEAD;
    v[g.Status.DA_CONTRACT] = g.OPT3.CONTRACT;
    v[g.Status.HALLUCINATIONWALK] = g.OPT3.HALLUCINATIONWALK;
    return function () {
      this._bodyStateColor = new Float32Array([1, 1, 1, 1]);
      this._healthStateColor = new Float32Array([1, 1, 1, 1]);
      this._effectStateColor = new Float32Array([1, 1, 1, 1]);
      this._virtueColor = new Float32Array([1, 1, 1, 1]);
      this._flashColor = new Float32Array([1, 1, 1, 1]);
      this.effectColor = new Float32Array([1, 1, 1, 1]);
      Object.defineProperty(this, "bodyState", {
        get: function () {
          return this._bodyState;
        },
        set: m,
      });
      Object.defineProperty(this, "healthState", {
        get: function () {
          return this._healthState;
        },
        set: h,
      });
      Object.defineProperty(this, "effectState", {
        get: function () {
          return this._effectState;
        },
        set: r,
      });
      Object.defineProperty(this, "allRidingState", {
        get: function () {
          return this._allRidingState;
        },
        set: q,
      });
      Object.defineProperty(this, "virtue", {
        get: function () {
          return this._virtue;
        },
        set: e,
      });
      this.toggleOpt3 = c;
      this.getOpt3 = d;
      this.recalculateBlendingColor = b;
    };
  },
);
