define(
  "Renderer/Entity/Entity",
  "require Renderer/Renderer Renderer/Map/Altitude Engine/SessionStorage Core/Configs Core/Client Utils/gl-matrix Controls/EntityControl ./EntityAction ./EntityCast ./EntityLife ./EntityDisplay ./EntityDialog ./EntitySound ./EntityView ./EntityWalk ./EntityRender ./EntityRoom ./EntityState ./EntityAttachments ./EntityAnimations ./EntityAction".split(
    " ",
  ),
  function (a) {
    function b(b) {
      a("Controls/EntityControl").call(this);
      a("./EntityAction").call(this);
      a("./EntityCast").call(this);
      a("./EntityLife").call(this);
      a("./EntityDisplay").call(this);
      a("./EntityDialog").call(this);
      a("./EntitySound").call(this);
      a("./EntityView").call(this);
      a("./EntityWalk").call(this);
      a("./EntityRender").call(this);
      a("./EntityRoom").call(this);
      a("./EntityState").call(this);
      a("./EntityAttachments").call(this);
      a("./EntityAnimations").call(this);
      this.boundingRect = { x1: 0, y1: 0, x2: 0, y2: 0 };
      this.matrix = k.create();
      this.position = q.create();
      this._position = q.create();
      b && (this.clean(), this.set(b));
    }
    var c = a("Renderer/Renderer"),
      d = a("Renderer/Map/Altitude"),
      e = a("Engine/SessionStorage"),
      m = a("Core/Configs"),
      h = a("Core/Client"),
      r = a("Utils/gl-matrix"),
      q = r.vec3,
      k = r.mat4;
    m.get("ClientVer");
    b.TYPE_EFFECT = -3;
    b.TYPE_UNKNOWN = -2;
    b.TYPE_WARP = -1;
    b.TYPE_PC = 0;
    b.TYPE_DISGUISED = 1;
    b.TYPE_MOB = 5;
    b.TYPE_NPC = 6;
    b.TYPE_PET = 7;
    b.TYPE_HOM = 8;
    b.TYPE_MERC = 9;
    b.TYPE_ELEM = 10;
    b.TYPE_ITEM = 11;
    b.TYPE_NPC2 = 12;
    b.TYPE_FALCON = 13;
    b.TYPE_TRAP = 14;
    b.TYPE_ICEWALL = 15;
    b.TYPE_WOLF = 16;
    b.TYPE_SLAVE = 17;
    b.TYPE_CART = 18;
    b.VT = { OUTOFSIGHT: 0, DEAD: 1, EXIT: 2, TELEPORT: 3, TRICKDEAD: 4 };
    b.PickingPriority = {};
    b.PickingPriority.Normal = {};
    b.PickingPriority.Normal[b.TYPE_MOB] = 3;
    b.PickingPriority.Normal[b.TYPE_ITEM] = 2;
    b.PickingPriority.Normal[b.TYPE_NPC] = 1;
    b.PickingPriority.Normal[b.TYPE_UNKNOWN] = 0;
    b.PickingPriority.Normal[b.TYPE_WARP] = 0;
    b.PickingPriority.Normal[b.TYPE_PC] = 0;
    b.PickingPriority.Normal[b.TYPE_DISGUISED] = 0;
    b.PickingPriority.Normal[b.TYPE_PET] = 0;
    b.PickingPriority.Normal[b.TYPE_HOM] = 0;
    b.PickingPriority.Normal[b.TYPE_MERC] = 0;
    b.PickingPriority.Normal[b.TYPE_ELEM] = 0;
    b.PickingPriority.Normal[b.TYPE_UNIT] = 0;
    b.PickingPriority.Normal[b.TYPE_TRAP] = 0;
    b.PickingPriority.Normal[b.TYPE_EFFECT] = -1;
    b.PickingPriority.Support = {};
    b.PickingPriority.Support[b.TYPE_PC] = 3;
    b.PickingPriority.Support[b.TYPE_DISGUISED] = 3;
    b.PickingPriority.Support[b.TYPE_HOM] = 3;
    b.PickingPriority.Support[b.TYPE_MERC] = 3;
    b.PickingPriority.Support[b.TYPE_ELEM] = 3;
    b.PickingPriority.Support[b.TYPE_MOB] = 2;
    b.PickingPriority.Support[b.TYPE_PET] = 1;
    b.PickingPriority.Support[b.TYPE_ITEM] = 0;
    b.PickingPriority.Support[b.TYPE_NPC] = 0;
    b.PickingPriority.Support[b.TYPE_UNKNOWN] = 0;
    b.PickingPriority.Support[b.TYPE_WARP] = 0;
    b.PickingPriority.Support[b.TYPE_UNIT] = 0;
    b.PickingPriority.Support[b.TYPE_TRAP] = 0;
    b.PickingPriority.Support[b.TYPE_EFFECT] = -1;
    b.prototype.objecttype = b.TYPE_UNKNOWN;
    b.prototype.GID = 0;
    b.prototype._bodyState = 0;
    b.prototype._healthState = 0;
    b.prototype._effectState = 0;
    b.prototype._sex = -1;
    b.prototype._job = -1;
    b.prototype._bodypalette = 0;
    b.prototype._head = -1;
    b.prototype._headpalette = 0;
    b.prototype._weapon = -1;
    b.prototype._weaponeffect = -1;
    b.prototype._shield = -1;
    b.prototype._accessory = -1;
    b.prototype._accessory2 = -1;
    b.prototype._accessory3 = -1;
    b.prototype._robe = -1;
    b.prototype.GUID = 0;
    b.prototype.GEmblemVer = 0;
    b.prototype.honor = 0;
    b.prototype.virtue = 0;
    b.prototype.isPKModeON = 0;
    b.prototype.xSize = 5;
    b.prototype.ySize = 5;
    b.prototype.state = 0;
    b.prototype.clevel = 0;
    b.prototype.action = 0;
    b.prototype.costume = 0;
    b.prototype.explosion = 0;
    b.prototype.virtueTick = 0;
    b.prototype.expTick = 0;
    b.prototype.spirs = 0;
    b.prototype.matrix = null;
    b.prototype.depth = 0;
    b.prototype.headDir = 0;
    b.prototype.direction = 0;
    b.prototype.position = null;
    b.prototype._position = null;
    b.prototype.attack_range = 0;
    b.prototype.attack_speed = 300;
    b.prototype.effectColor = null;
    b.prototype.isAdmin = !1;
    b.prototype.startTickCD = 0;
    b.prototype.RemainMS = 0;
    b.prototype.cart = !1;
    b.prototype.falcon = !1;
    b.prototype.riding = !1;
    b.prototype.riding_ = !1;
    b.prototype.wolf = !1;
    b.prototype.berserk = 0;
    b.prototype.soullink = 0;
    b.prototype.canmove = 0;
    b.prototype.isDeath = !1;
    b.prototype.isHide = !1;
    b.prototype.tranfrom_btype = -1;
    b.prototype.tranfrom_bjob = -1;
    b.prototype.tranfrom_costume = -1;
    b.prototype.is_mirror = !1;
    b.prototype.lastSKID = 0;
    b.prototype.lastSkLvl = 0;
    b.prototype.isBoss = 0;
    b.prototype.ghost = { xSize: 1, ySize: 1 };
    b.prototype.set = function (g) {
      if ("GoldpointManager" == g.name) return ((e.goldpcid = g.GID), !1);
      var k, l, f;
      this.direction = 4;
      this.setAction({
        action: this.ACTION.IDLE,
        frame: 0,
        play: !0,
        repeat: !0,
      });
      h.loadFile(this.files.shadow.spr, null, null, { to_rgba: !0 });
      h.loadFile(this.files.shadow.act);
      this.isAdmin = -1 < e.AdminList.indexOf(g.GID);
      this.sex = g.hasOwnProperty("sex") ? g.sex : this._sex;
      this.job = g.hasOwnProperty("job") ? g.job : this._job;
      this.clothes = 0;
      k = Object.keys(g);
      f = k.length;
      for (l = 0; l < f; ++l)
        switch (k[l]) {
          case "objecttype":
            this.objecttype = 45 === g.job ? b.TYPE_WARP : g.objecttype;
            a("./EntityAction").call(this);
            break;
          case "sex":
          case "job":
            break;
          case "xSize":
          case "ySize":
            break;
          case "PosDir":
            this.direction = [4, 3, 2, 1, 0, 7, 6, 5][(g.PosDir[2] + 8) % 8];
            this.position[0] = g.PosDir[0];
            this.position[1] = g.PosDir[1];
            this.position[2] = d.getCellHeight(g.PosDir[0], g.PosDir[1]);
            this._position[0] = this.position[0];
            this._position[1] = this.position[1];
            this._position[2] = this.position[2] + 3;
            break;
          case "state":
            this.setAction({
              action: [this.ACTION.IDLE, this.ACTION.DIE, this.ACTION.SIT][
                g.state
              ],
              frame: 0,
              play: !0,
              repeat: 1 !== g.state,
            });
            break;
          case "action":
            this.setAction({
              action: g.action,
              play: !0,
              frame: 0,
              repeat: 1 !== g.action,
            });
            break;
          case "actStartTime":
            this.animation.tick = g.actStartTime;
            break;
          case "speed":
            this.walk.speed = g.speed;
            break;
          case "moveStartTime":
            this.walk.tick = +c.tick;
            break;
          case "name":
            g.name &&
              "Unknown" != g.name &&
              ((this.display.name = g.name),
              this.display.update(
                this.objecttype === b.TYPE_MOB
                  ? "#ffc6c6"
                  : this.objecttype === b.TYPE_NPC
                    ? "#94bdf7"
                    : "white",
              ));
            break;
          case "MoveData":
            this.position[0] ||
              this.position[1] ||
              ((this.position[0] = g.MoveData[0]),
              (this.position[1] = g.MoveData[1]),
              (this.position[2] = d.getCellHeight(
                g.MoveData[0],
                g.MoveData[1],
              )));
            this.walkTo.apply(this, g.MoveData);
            break;
          case "effectState":
            this.effectState != g.effectState &&
              (this.effectState = g.effectState);
            break;
          case "Robe":
            this.robe = g.Robe;
            break;
          case "level":
            this.clevel = g.level;
            break;
          case "virtue":
            this.virtue = g.virtue;
            1 == this.virtue
              ? ((this.effectColor[0] = 0.8),
                (this.effectColor[1] = 0.8),
                (this.effectColor[2] = 0))
              : 2 == this.virtue
                ? ((this.effectColor[0] = 1),
                  (this.effectColor[1] = 0.7),
                  (this.effectColor[2] = 0.7))
                : 4 == this.virtue &&
                  ((this.effectColor[0] = 0.7),
                  (this.effectColor[1] = 0.7),
                  (this.effectColor[2] = 1));
            break;
          default:
            (b.prototype.hasOwnProperty(k[l]) ||
              b.prototype.hasOwnProperty("_" + k[l])) &&
              this[k[l]] != g[k[l]] &&
              (this[k[l]] = g[k[l]]);
        }
      -1 < this.life.hp &&
        -1 < this.life.hp_max &&
        (this.life.update(), (this.life.display = !0));
    };
    b.prototype.clean = function () {
      this.life.clean();
      this.display.clean();
      this.dialog.clean();
      this.cast.clean();
      this.room.clean();
      this.attachments.remove("lockon");
      this.animations.free();
      this.remove_delay = this.remove_tick = 0;
      this.GID += Math.random();
    };
    b.prototype.remove_tick = 0;
    b.prototype.remove_delay = 0;
    b.prototype.remove = function (a) {
      switch (a) {
        case 0:
          this.clean();
          this.remove_tick = +c.tick;
          this.remove_delay = 1e3;
          break;
        case 1:
          a = this.objecttype === b.TYPE_PC;
          this.setAction({
            action: this.ACTION.DIE,
            repeat: a,
            play: !0,
            frame: 0,
            next: !1,
          });
          a ||
            (this.clean(),
            (this.remove_tick = +c.tick),
            (this.remove_delay = 5e3));
          break;
        default:
          (this.clean(), (this.remove_tick = c.tick), (this.remove_delay = 0));
      }
    };
    b.prototype.lookTo = function (a, b) {
      a = Math.round(a - this.position[0]);
      b = Math.round(b - this.position[1]);
      var c;
      1 <= a && (c = 1 <= b ? 5 : 0 === b ? 6 : 7);
      0 === a && (c = 1 <= b ? 4 : 0);
      -1 >= a && (c = 1 <= b ? 3 : 0 === b ? 2 : 1);
      this.direction = c;
    };
    return b;
  },
);
