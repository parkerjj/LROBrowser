define("Renderer/Entity/EntitySound", ["Audio/SoundManager"], function (a) {
  function b() {
    this._lastAnimationId = this._lastActionId = -1;
    this._lastFileName = null;
    this._animCounter = -1;
    this.attackFile = null;
  }
  b.prototype.play = function (b, d, e) {
    if (
      !this.entity.noSound &&
      this.entity.objecttype !== this.entity.constructor.TYPE_PET &&
      (this._lastActionId !== d ||
        this._lastAnimationId !== e ||
        this._lastFileName !== b)
    ) {
      this._lastActionId = d;
      this._lastAnimationId = e;
      this._lastFileName = b;
      if ("atk" === b) {
        if (!this.attackFile) return;
        b = this.attackFile;
      }
      a.play(b);
    }
  };
  b.prototype.free = function () {
    this._lastAnimationId = this._lastActionId = -1;
    this._lastFileName = null;
    this._animCounter = -1;
  };
  b.prototype.freeOnAnimationEnd = function (a, b) {
    a < b ||
      ((a = Math.floor(a / b)),
      this._animCounter !== a && (this.free(), (this._animCounter = a)));
  };
  return function () {
    this.sound = new b();
    this.sound.entity = this;
  };
});
