define(
  "Renderer/Entity/EntityView",
  "require Core/Client DB/DBManager DB/Monsters/ShadowTable DB/Jobs/MountTable ./EntityAction".split(
    " ",
  ),
  function (a) {
    function b(a, b, c) {
      this.spr = a || null;
      this.act = b || null;
      this.pal = c || null;
      this.size = 1;
    }
    function c() {
      this.body = new b();
      this.head = new b();
      this.weapon = new b();
      this.weaponeffect = new b();
      this.shield = new b();
      this.accessory = new b();
      this.accessory2 = new b();
      this.accessory3 = new b();
      this.robe = new b();
      this.shadow = new b("data/sprite/shadow.spr", "data/sprite/shadow.act");
    }
    function d(a) {
      -1 === this._sex
        ? (this._sex = a)
        : ((this._sex = a),
          (this.job = this._job),
          (this.head = this._head),
          (this.accessory = this._accessory),
          (this.accessory2 = this._accessory2),
          (this.accessory3 = this._accessory3));
    }
    function e(a) {
      var b, c;
      if (!(0 > a)) {
        for (b in k)
          if (k[b] === a) {
            this.costume = a;
            a = b;
            break;
          }
        this._job = a;
        this.costume && (a = this.costume);
        this.xSize = this.ySize = g.isBaby(a) ? 4 : 5;
        this.files.shadow.size = a in p ? p[a] : 1;
        c = g.getBodyPath(a, this._sex);
        b = this.constructor;
        if (this.objecttype === b.TYPE_UNKNOWN) {
          var d =
            45 > a
              ? b.TYPE_PC
              : 46 > a
                ? b.TYPE_WARP
                : 1e3 > a
                  ? b.TYPE_NPC
                  : 4e3 > a
                    ? b.TYPE_MOB
                    : 6e3 > a
                      ? b.TYPE_PC
                      : 7e3 > a
                        ? b.TYPE_HOM
                        : b.TYPE_MERC;
          d !== this.objecttype && ((this.objecttype = d), f.call(this));
        }
        if (111 === a || 139 === a || 45 === a)
          ((this.files.body.spr = null), (this.files.body.act = null));
        else {
          if (null === c || c.match(/\.gr2$/i))
            c = g.getBodyPath(1002, this._sex);
          n.loadFile(c + ".act");
          n.loadFile(
            c + ".spr",
            function () {
              this.files.body.spr = c + ".spr";
              this.files.body.act = c + ".act";
              this.bodypalette = this._bodypalette;
              this.weapon = this._weapon;
              this.weaponeffect = this._weaponeffect;
              this.shield = this._shield;
            }.bind(this),
            null,
            { to_rgba: this.objecttype !== b.TYPE_PC },
          );
        }
      }
    }
    function l(a) {
      this._bodypalette = a;
      -1 !== this._job &&
        (4e3 < this._job && 4008 > this._job && 2 > this._bodypalette
          ? (this.files.body.pal = g.getBodyPalPath(
              this.costume || this._job,
              1,
              this._sex,
            ))
          : (4060 <= this._job && 4079 >= this._job) ||
            (this.files.body.pal =
              0 >= this._bodypalette
                ? null
                : g.getBodyPalPath(
                    this.costume || this._job,
                    this._bodypalette,
                    this._sex,
                  )));
    }
    function h(a) {
      var b;
      0 > a ||
        ((this._head = a),
        (b = g.getHeadPath(a, this._sex, this.job)),
        n.loadFile(b + ".act"),
        n.loadFile(
          b + ".spr",
          function () {
            this.files.head.spr = b + ".spr";
            this.files.head.act = b + ".act";
            this.files.head.pal = null;
            this.headpalette = this._headpalette;
          }.bind(this),
        ));
    }
    function r(a) {
      this._headpalette = a;
      0 >= a
        ? (this.files.head.pal = null)
        : -1 !== this._head &&
          (this.files.head.pal = g.getHeadPalPath(
            this._head,
            this._headpalette,
            this._sex,
            this._job,
          ));
    }
    function t(a, b, c) {
      return function (d) {
        function e(f, v) {
          if ("robe" === a && !n.loadFile(f + ".spr")) {
            var u = g.getRobePath2(d, q, p);
            n.loadFile(f + ".act");
            n.loadFile(
              u + ".spr",
              function (b) {
                m["_" + a] = h;
                m.files[a].spr = u + ".spr";
                m.files[a].act = f + ".act";
              },
              function () {
                c &&
                  !v &&
                  ((h = g[c](d)), (f = g[b](h, m.job, m._sex)) && e(f, !0));
              },
              { to_rgba: !0 },
            );
            return !1;
          }
          n.loadFile(f + ".act");
          n.loadFile(
            f + ".spr",
            function (b) {
              m["_" + a] = h;
              m.files[a].spr = f + ".spr";
              m.files[a].act = f + ".act";
              "weapon" === a &&
                ((m["_" + a + "effect"] = l),
                (m.files[a + "effect"].spr = k + "_effect.spr"),
                (m.files[a + "effect"].act = k + "_effect.act"),
                (m.sound.attackFile = g.getWeaponSound(h)));
            },
            function () {
              c &&
                !v &&
                ((h = g[c](d)), (f = g[b](h, m.job, m._sex)) && e(f, !0));
            },
            { to_rgba: !0 },
          );
        }
        var f,
          k,
          m = this,
          q = this.job,
          p = this._sex,
          h = d;
        if ("weapon" === a) var l = g[c](d);
        if (0 >= d) this["_" + a] = 0;
        else {
          switch (a) {
            case "weapon":
              f = g[b](d, this.job, this._sex);
              k = g[b](l, this.job, this._sex);
              break;
            case "shield":
              f = g[b](d, this.job, this._sex);
              break;
            case "robe":
              f = g[b](d, this.job, this._sex);
              break;
            default:
              f = g[b](d, this._sex);
          }
          f
            ? e(f)
            : ((this.files[a].spr = null),
              (this.files[a].act = null),
              (this.files[a].pal = null),
              "weapon" === a &&
                ((this.files[a + "effect"].spr = null),
                (this.files[a + "effect"].act = null),
                (this.files[a + "effect"].pal = null),
                (this.sound.attackFile = g.getWeaponSound(d))));
        }
      };
    }
    var n = a("Core/Client"),
      g = a("DB/DBManager"),
      p = a("DB/Monsters/ShadowTable"),
      k = a("DB/Jobs/MountTable"),
      f = a("./EntityAction");
    return function () {
      this.files = new c();
      Object.defineProperty(this, "sex", {
        get: function () {
          return this._sex;
        },
        set: d,
      });
      Object.defineProperty(this, "job", {
        get: function () {
          return this.costume || this._job;
        },
        set: e,
      });
      Object.defineProperty(this, "bodypalette", {
        get: function () {
          return this._bodypalette;
        },
        set: l,
      });
      Object.defineProperty(this, "head", {
        get: function () {
          return this._head;
        },
        set: h,
      });
      Object.defineProperty(this, "headpalette", {
        get: function () {
          return this._headpalette;
        },
        set: r,
      });
      Object.defineProperty(this, "weapon", {
        get: function () {
          return this._weapon;
        },
        set: t("weapon", "getWeaponPath", "getWeaponViewID"),
      });
      Object.defineProperty(this, "weaponeffect", {
        get: function () {
          return this._weaponeffect;
        },
        set: t("weaponeffect", "getWeaponEffectPath", "getWeaponViewID"),
      });
      Object.defineProperty(this, "shield", {
        get: function () {
          return this._shield;
        },
        set: t("shield", "getShieldPath"),
      });
      Object.defineProperty(this, "accessory", {
        get: function () {
          return this._accessory;
        },
        set: t("accessory", "getHatPath"),
      });
      Object.defineProperty(this, "accessory2", {
        get: function () {
          return this._accessory2;
        },
        set: t("accessory2", "getHatPath"),
      });
      Object.defineProperty(this, "accessory3", {
        get: function () {
          return this._accessory3;
        },
        set: t("accessory3", "getHatPath"),
      });
      Object.defineProperty(this, "robe", {
        get: function () {
          return this._robe;
        },
        set: t("robe", "getRobePath"),
      });
    };
  },
);
