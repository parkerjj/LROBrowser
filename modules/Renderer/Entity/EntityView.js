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
        for (b in l)
          if (l[b] === a) {
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
    function m(a) {
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
    function t(a) {
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
    function r(a, b, c) {
      return function (d) {
        function e(f, u) {
          if ("robe" === a && !n.loadFile(f + ".spr")) {
            var v = g.getRobePath2(d, q, p);
            n.loadFile(f + ".act");
            n.loadFile(
              v + ".spr",
              function (b) {
                k["_" + a] = h;
                k.files[a].spr = v + ".spr";
                k.files[a].act = f + ".act";
              },
              function () {
                c &&
                  !u &&
                  ((h = g[c](d)), (f = g[b](h, k.job, k._sex)) && e(f, !0));
              },
              { to_rgba: !0 },
            );
            return !1;
          }
          n.loadFile(f + ".act");
          n.loadFile(
            f + ".spr",
            function (b) {
              k["_" + a] = h;
              k.files[a].spr = f + ".spr";
              k.files[a].act = f + ".act";
              "weapon" === a &&
                ((k["_" + a + "effect"] = m),
                (k.files[a + "effect"].spr = l + "_effect.spr"),
                (k.files[a + "effect"].act = l + "_effect.act"),
                (k.sound.attackFile = g.getWeaponSound(h)));
            },
            function () {
              c &&
                !u &&
                ((h = g[c](d)), (f = g[b](h, k.job, k._sex)) && e(f, !0));
            },
            { to_rgba: !0 },
          );
        }
        var f,
          l,
          k = this,
          q = this.job,
          p = this._sex,
          h = d;
        if ("weapon" === a) var m = g[c](d);
        if (0 >= d) this["_" + a] = 0;
        else {
          switch (a) {
            case "weapon":
              f = g[b](d, this.job, this._sex);
              l = g[b](m, this.job, this._sex);
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
      l = a("DB/Jobs/MountTable"),
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
        set: m,
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
        set: t,
      });
      Object.defineProperty(this, "weapon", {
        get: function () {
          return this._weapon;
        },
        set: r("weapon", "getWeaponPath", "getWeaponViewID"),
      });
      Object.defineProperty(this, "weaponeffect", {
        get: function () {
          return this._weaponeffect;
        },
        set: r("weaponeffect", "getWeaponEffectPath", "getWeaponViewID"),
      });
      Object.defineProperty(this, "shield", {
        get: function () {
          return this._shield;
        },
        set: r("shield", "getShieldPath"),
      });
      Object.defineProperty(this, "accessory", {
        get: function () {
          return this._accessory;
        },
        set: r("accessory", "getHatPath"),
      });
      Object.defineProperty(this, "accessory2", {
        get: function () {
          return this._accessory2;
        },
        set: r("accessory2", "getHatPath"),
      });
      Object.defineProperty(this, "accessory3", {
        get: function () {
          return this._accessory3;
        },
        set: r("accessory3", "getHatPath"),
      });
      Object.defineProperty(this, "robe", {
        get: function () {
          return this._robe;
        },
        set: r("robe", "getRobePath"),
      });
    };
  },
);
