define("Renderer/Entity/EntityAnimations", ["Renderer/Renderer"], function (a) {
  function b(a) {
    this.entity = a;
    this.list = [];
  }
  b.prototype.add = function (b) {
    this.list.push({ tick: a.tick, callback: b });
  };
  b.prototype.process = function () {
    var b, d;
    b = 0;
    for (d = this.list.length; b < d; ++b)
      this.list[b].callback(a.tick - this.list[b].tick) &&
        (this.list.splice(b, 1), b--, d--);
  };
  b.prototype.free = function () {
    this.list.length = 0;
  };
  return function () {
    this.animations = new b(this);
  };
});
