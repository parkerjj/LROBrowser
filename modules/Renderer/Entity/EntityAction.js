define("Renderer/Entity/EntityAction", [
  "Renderer/Renderer",
  "DB/DBManager",
], function (a, b) {
  function c() {
    this.IDLE = 0;
    this.ATTACK = -2;
    this.PERF3 =
      this.PERF2 =
      this.PERF1 =
      this.SPECIAL =
      this.ACTION =
      this.SKILL =
      this.ATTACK3 =
      this.ATTACK2 =
      this.ATTACK1 =
      this.FREEZE2 =
      this.DIE =
      this.HURT =
      this.FREEZE =
      this.READYFIGHT =
      this.PICKUP =
      this.SIT =
      this.WALK =
        -1;
  }
  function d() {
    this.frame = this.tick = 0;
    this.play = this.repeat = !0;
    this.next = !1;
    this.delay = 0;
    this.save = !1;
  }
  function e(c) {
    var d = this.animation;
    if (c.delay) ((d.delay = c.delay + 0), (c.delay = 0), (d.save = c));
    else {
      if (c.action === this.ACTION.ATTACK) {
        if (this.objecttype === this.constructor.TYPE_PC) {
          var e = b.getWeaponAction(this.weapon, this._job, this._sex);
          c.action = [
            this.ACTION.ATTACK1,
            this.ACTION.ATTACK2,
            this.ACTION.ATTACK3,
          ][e];
        }
        -2 === c.action && (c.action = this.ACTION.ATTACK1);
      }
      this.action =
        -1 === c.action || "undefined" === typeof c.action
          ? this.ACTION.IDLE
          : c.action;
      d.tick = a.tick + 0;
      d.delay = 0;
      d.frame = c.frame || 0;
      d.speed = c.speed || !1;
      d.length = c.length || !1;
      d.repeat = c.repeat || !1;
      d.play = "undefined" !== typeof c.play ? c.play : !0;
      d.next = c.next || !1;
      d.save = !1;
      this.sound.free();
    }
  }
  return function () {
    this.ACTION = new c();
    this.animation = new d();
    this.setAction = e;
    var a = this.constructor;
    switch (this.objecttype) {
      case a.TYPE_PC:
      case a.TYPE_DISGUISED:
        this.ACTION.IDLE = 0;
        this.ACTION.WALK = 1;
        this.ACTION.SIT = 2;
        this.ACTION.PICKUP = 3;
        this.ACTION.READYFIGHT = 4;
        this.ACTION.ATTACK1 = 5;
        this.ACTION.HURT = 6;
        this.ACTION.FREEZE = 7;
        this.ACTION.DIE = 8;
        this.ACTION.FREEZE2 = 9;
        this.ACTION.ATTACK2 = 10;
        this.ACTION.ATTACK3 = 11;
        this.ACTION.SKILL = 12;
        break;
      case a.TYPE_MOB:
      case a.TYPE_SLAVE:
        this.ACTION.IDLE = 0;
        this.ACTION.WALK = 1;
        this.ACTION.ATTACK = 2;
        this.ACTION.HURT = 3;
        this.ACTION.DIE = 4;
        break;
      case a.TYPE_PET:
        this.ACTION.IDLE = 0;
        this.ACTION.WALK = 1;
        this.ACTION.ATTACK = 2;
        this.ACTION.HURT = 3;
        this.ACTION.DIE = 4;
        this.ACTION.SPECIAL = 5;
        this.ACTION.PERF1 = 6;
        this.ACTION.PERF2 = 7;
        this.ACTION.PERF3 = 8;
        break;
      case a.TYPE_NPC:
      case a.TYPE_NPC2:
        this.ACTION.IDLE = 0;
        this.ACTION.WALK = 1;
        break;
      case a.TYPE_WARP:
        this.ySize = this.xSize = 20;
        break;
      case a.TYPE_HOM:
        this.ACTION.IDLE = 0;
        this.ACTION.WALK = 1;
        this.ACTION.ATTACK = 2;
        this.ACTION.HURT = 3;
        this.ACTION.DIE = 4;
        this.ACTION.ATTACK2 = 5;
        this.ACTION.ATTACK3 = 6;
        this.ACTION.ACTION = 7;
        break;
      case a.TYPE_MERC:
        this.ACTION.IDLE = 0;
        this.ACTION.WALK = 1;
        this.ACTION.SIT = 2;
        this.ACTION.PICKUP = 3;
        this.ACTION.READYFIGHT = 4;
        this.ACTION.ATTACK1 = 5;
        this.ACTION.HURT = 6;
        this.ACTION.FREEZE = 7;
        this.ACTION.DIE = 8;
        this.ACTION.FREEZE2 = 9;
        this.ACTION.ATTACK2 = 10;
        this.ACTION.ATTACK3 = 11;
        this.ACTION.SKILL = 12;
        break;
      case a.TYPE_ELEM:
        this.ACTION.IDLE = 0;
        this.ACTION.WALK = 1;
        this.ACTION.ATTACK = 2;
        this.ACTION.HURT = 3;
        this.ACTION.DIE = 4;
        this.ACTION.SKILL = 5;
        break;
      case a.TYPE_WOLF:
        ((this.ACTION.IDLE = 0),
          (this.ACTION.WALK = 1),
          (this.ACTION.ATTACK = 2),
          (this.ACTION.HURT = 3),
          (this.ACTION.DIE = 4));
    }
  };
});
