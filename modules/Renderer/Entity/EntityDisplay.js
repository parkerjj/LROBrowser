define("Renderer/Entity/EntityDisplay", [
  "Utils/gl-matrix",
  "Renderer/Renderer",
], function (a, b) {
  function c(a, b, c, d, e, n, p) {
    a.textBaseline = "top";
    a.lineWidth = 1;
    a.shadowColor = "#222";
    a.shadowBlur = p;
    a.shadowOffsetX = e;
    a.shadowOffsetY = n;
    a.fillStyle = "black";
    a.fillText(b, c, d);
  }
  function d() {
    this.TYPE = { NONE: 0, LOADING: 1, COMPLETE: 2 };
    this.STYLE = { DEFAULT: 0, MOB: 1, NPC: 2, ITEM: 3 };
    this.load = this.TYPE.NONE;
    this.title =
      this.guild_rank =
      this.guild_name =
      this.party_name =
      this.name =
        "";
    this.emblem = null;
    this.display = !1;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.style.position = "absolute";
    this.canvas.style.zIndex = 0;
    this.entity = null;
  }
  var e = a.vec4,
    m = new Float32Array(4),
    h = new Float32Array(2),
    r = window.devicePixelRatio;
  "undefined" !== typeof CanvasRenderingContext2D &&
    (CanvasRenderingContext2D.prototype.outlineText = function (a, b, c) {
      this.fillText(a, b - 1, c);
      this.fillText(a, b, c - 1);
      this.fillText(a, b + 1, c);
      this.fillText(a, b, c + 1);
    });
  var q = (function () {
    var a = document.createElement("canvas").getContext("2d"),
      b;
    a.font = "12px Arial";
    b = a.measureText("Testing").width + 10;
    a.canvas.width = b;
    a.canvas.height = 72;
    a.font = "12px Arial";
    a.textBaseline = "top";
    c(a, "Testing", 5, 0, 0, -1, 0);
    c(a, "Testing", 5, 0, 0, 1, 0);
    c(a, "Testing", 5, 0, -1, 0, 0);
    c(a, "Testing", 5, 0, 1, 0, 0);
    a.fillStyle = "white";
    a.strokeStyle = "black";
    a.strokeText("Testing", 5, 0);
    a.fillText("Testing", 5, 0);
    var a = a.getImageData(0, 0, b, 72).data,
      d = a.length,
      e = 0;
    for (b = 0; b < d; b += 4) e += ((255 - a[b]) / 255) * a[b + 3];
    return !window.chrome || 6.15 < e / (d / 4) / 2.55;
  })();
  d.prototype.add = function () {
    this.display = !0;
  };
  d.prototype.remove = function () {
    this.canvas.parentNode && document.body.removeChild(this.canvas);
    this.display = !1;
  };
  d.prototype.clean = function () {
    this.remove();
  };
  d.prototype.update = function (a) {
    this.guild_name.length || (this.emblem = 0);
    var b = Array(2),
      d = 11 * r,
      e = this.ctx,
      f = (this.emblem ? 26 : 0) + 5,
      n,
      k;
    b[0] = this.name.split("#")[0];
    b[1] = "";
    this.title.length && (b[0] = " [" + this.title + "]" + b[0]);
    this.party_name.length && (b[0] += " (" + this.party_name + ")");
    this.guild_name.length &&
      ((b[1] = this.guild_name),
      this.guild_rank.length && (b[1] += " [" + this.guild_rank + "]"));
    e.font = "bold " + d + "px Arial";
    n = Math.max(e.measureText(b[0]).width, e.measureText(b[1]).width) + f + 5;
    k = 3 * d * (b[1].length ? 2 : 1);
    e.canvas.width = n;
    e.canvas.height = k;
    this.emblem && e.drawImage(this.emblem, 0, 0);
    a = a || "white";
    e.font = "bold " + d + "px Arial";
    e.textBaseline = "top";
    q
      ? (e.translate(0.5, 0.5),
        (e.fillStyle = "black"),
        e.outlineText(b[0], f, 0),
        e.outlineText(b[1], f, 1.2 * d),
        (e.fillStyle = a),
        e.fillText(b[0], f, 0))
      : (c(e, b[0], f, 0, 0, -1, 0),
        c(e, b[0], f, 0, 0, 1, 0),
        c(e, b[0], f, 0, -1, 0, 0),
        c(e, b[0], f, 0, 1, 0, 0),
        c(e, b[1], f, 1.2 * d, 0, -1, 0),
        c(e, b[1], f, 1.2 * d, 0, 1, 0),
        c(e, b[1], f, 1.2 * d, -1, 0, 0),
        c(e, b[1], f, 1.2 * d, 1, 0, 0),
        (e.fillStyle = a),
        (e.strokeStyle = "black"),
        e.strokeText(b[0], f, 0),
        e.fillText(b[0], f, 0),
        e.strokeText(b[1], f, 1.2 * d));
    e.fillText(b[1], f, 1.2 * d);
  };
  d.prototype.render = function (a) {
    var c = this.canvas,
      d = 0;
    m[0] = 0;
    m[1] = -0.5;
    m[2] = 0;
    m[3] = 1;
    h[0] = b.width / 2;
    h[1] = b.height / 2;
    e.transformMat4(m, m, a);
    a = 0 === m[3] ? 1 : 1 / m[3];
    m[0] = h[0] + Math.round(h[0] * m[0] * a);
    m[1] = h[1] - Math.round(h[1] * m[1] * a);
    this.entity.life.display && (d = 10);
    c.style.top = ((m[1] + 5 + d) | 0) + "px";
    c.style.left = ((m[0] - c.width / r / 2) | 0) + "px";
    c.style.width = c.width / r + "px";
    c.style.height = c.height / r + "px";
    c.parentNode || document.body.appendChild(c);
  };
  return function () {
    this.display = new d();
    this.display.entity = this;
  };
});
