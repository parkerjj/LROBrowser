define("Renderer/Entity/EntityLife", [
  "Utils/gl-matrix",
  "Renderer/Renderer",
], function (a, b) {
  function c() {
    this.nFullness = this.sp_max = this.hp_max = this.sp = this.hp = -1;
    this.display = !1;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.style.position = "absolute";
    this.canvas.style.zIndex = 1;
    this.entity = null;
  }
  var d = a.vec4,
    e = new Float32Array(4),
    m = new Float32Array(2);
  c.prototype.remove = function () {
    this.display = !1;
    this.canvas.parentNode && document.body.removeChild(this.canvas);
  };
  c.prototype.clean = function () {
    this.remove();
  };
  c.prototype.update = function () {
    var a = 5,
      b = this.entity.constructor;
    if (0 > this.hp || 0 > this.hp_max) this.remove();
    else {
      this.display = !0;
      var c = this.ctx,
        d = this.hp / this.hp_max,
        e = -1 < this.sp && -1 < this.sp_max,
        t = this.sp / this.sp_max,
        l = -1 < this.nFullness,
        f = this.nFullness / 100;
      e && (a += 4);
      l && (a += 4);
      c.canvas.width = 60;
      c.canvas.height = a;
      c.fillStyle = "#222";
      c.fillRect(0, 0, 60, a);
      c.fillStyle = "#43301D";
      c.fillRect(1, 1, 58, a - 2);
      c.fillStyle =
        this.entity.objecttype === b.TYPE_MOB
          ? 0.25 > d
            ? "#FF0000"
            : "#FE6B00"
          : this.entity.objecttype === b.TYPE_PET
            ? 0.25 > d
              ? "#FE6B00"
              : "#FFE7E7"
            : 0.25 > d
              ? "#FF0000"
              : "#10ef21";
      c.fillRect(1, 1, Math.round(58 * d), 3);
      e &&
        ((c.fillStyle = "#43301D"),
        c.fillRect(0, 4, 60, 1),
        (c.fillStyle = "#369AD9"),
        c.fillRect(1, 5, Math.round(58 * t), 3));
      l &&
        ((c.fillStyle = "#43301D"),
        c.fillRect(0, 8, 60, 1),
        (c.fillStyle = 0.25 > f ? "#FF0000" : "#FFE6E6"),
        c.fillRect(1, 9, Math.round(58 * f), 3));
    }
  };
  c.prototype.render = function (a) {
    var c = this.canvas;
    e[0] = 0;
    e[1] = -0.5;
    e[2] = 0;
    e[3] = 1;
    m[0] = b.width / 2;
    m[1] = b.height / 2;
    d.transformMat4(e, e, a);
    a = 0 === e[3] ? 1 : 1 / e[3];
    e[0] = m[0] + Math.round(m[0] * e[0] * a);
    e[1] = m[1] - Math.round(m[1] * e[1] * a);
    c.style.top = (e[1] | 0) + "px";
    c.style.left = ((e[0] - c.width / 2) | 0) + "px";
    c.parentNode || document.body.appendChild(c);
  };
  return function () {
    this.life = new c();
    this.life.entity = this;
  };
});
