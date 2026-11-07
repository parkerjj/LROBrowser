define("Renderer/Entity/EntityCast", [
  "Utils/gl-matrix",
  "Renderer/Renderer",
], function (a, b) {
  function c() {
    this.delay = this.tick = 0;
    this.percent = -1;
    this.display = !1;
    this.color = "#00FF00";
    this.onComplete = null;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.style.position = "absolute";
    this.canvas.style.zIndex = 1;
    this.canvas.width = 60;
    this.canvas.height = 6;
  }
  var d = a.vec4,
    e = new Float32Array(4),
    m = new Float32Array(2);
  c.prototype.set = function (a, c) {
    this.display = !0;
    this.tick = b.tick + 0;
    this.delay = a;
    this.color = c || "#00FF00";
  };
  c.prototype.isCasting = function () {
    return this.display;
  };
  c.prototype.remove = function () {
    this.percent = -1;
    this.display = !1;
    this.canvas.parentNode && document.body.removeChild(this.canvas);
  };
  c.prototype.clean = function () {
    this.remove();
    this.onComplete = null;
  };
  c.prototype.update = function (a) {
    var b = this.ctx;
    b.fillStyle = "#10189c";
    b.fillRect(0, 0, 60, 6);
    b.fillStyle = "#424242";
    b.fillRect(1, 1, 58, 4);
    b.fillStyle = this.color;
    b.fillRect(1, 1, Math.round(58 * a), 4);
  };
  c.prototype.render = function (a) {
    var c = this.canvas,
      h = +((b.tick - this.tick) / this.delay).toFixed(2);
    1 <= h
      ? (this.remove(),
        this.onComplete && (this.onComplete(), (this.onComplete = null)))
      : (h !== this.percent && (this.update(h), (this.percent = h)),
        (e[0] = 0),
        (e[1] = 90 / 35),
        (e[2] = 0),
        (e[3] = 1),
        (m[0] = b.width / 2),
        (m[1] = b.height / 2),
        d.transformMat4(e, e, a),
        (a = 0 === e[3] ? 1 : 1 / e[3]),
        (e[0] = m[0] + Math.round(m[0] * e[0] * a)),
        (e[1] = m[1] - Math.round(m[1] * e[1] * a)),
        (c.style.top = (e[1] | 0) + "px"),
        (c.style.left = ((e[0] - c.width / 2) | 0) + "px"),
        c.parentNode || document.body.appendChild(c));
  };
  return function () {
    this.cast = new c();
  };
});
