define("Renderer/Entity/EntityDialog", [
  "Utils/gl-matrix",
  "Core/Events",
  "Renderer/Renderer",
], function (a, b, c) {
  function d(a, b, c, d, e, f) {
    a.beginPath();
    a.moveTo(b + f, c);
    a.lineTo(b + d - f, c);
    a.quadraticCurveTo(b + d, c, b + d, c + f);
    a.lineTo(b + d, c + e - f);
    a.quadraticCurveTo(b + d, c + e, b + d - f, c + e);
    a.lineTo(b + f, c + e);
    a.quadraticCurveTo(b, c + e, b, c + e - f);
    a.lineTo(b, c + f);
    a.quadraticCurveTo(b, c, b + f, c);
    a.closePath();
  }
  function e() {
    this.text = "";
    this.tick = 0;
    this.timeout = null;
    this.display = !1;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.style.position = "absolute";
    this.canvas.style.zIndex = 1;
  }
  var m = a.vec4,
    h = new Float32Array(4),
    r = new Float32Array(2);
  e.prototype.set = function (a, e) {
    this.text = a;
    this.tick = c.tick;
    this.display = !0;
    var g = this.ctx,
      k = [],
      l = 0,
      f,
      n,
      p = e || "white";
    for (g.font = "12px serif"; a.length;) {
      for (e = a.length; 250 < g.measureText(a.substr(0, e)).width;) e--;
      n = a.substr(0, e);
      if (e !== a.length)
        for (f = 0; -1 !== n.indexOf(" ", f);) f = n.indexOf(" ", f) + 1;
      k.push(n.substr(0, f || n.length));
      l = Math.max(l, g.measureText(k[k.length - 1]).width);
      a = a.substr(k[k.length - 1].length, a.length);
    }
    g.canvas.width = 14 + l;
    g.canvas.height = 8 + 17 * k.length;
    g.font = "12px serif";
    g.fillStyle = "rgba(0,0,0,0.4)";
    g.fillRect(0, 0, g.canvas.width, g.canvas.height);
    g.strokeStyle = "#525252";
    d(g, 0.5, 0.5, g.canvas.width - 1, g.canvas.height - 1, 2);
    g.stroke();
    e = 0;
    for (f = k.length; e < f; ++e)
      ((g.fillStyle = "black"),
        g.fillText(k[e], 8, 17 + 17 * e),
        (g.fillStyle = p),
        g.fillText(k[e], 7, 16 + 17 * e));
    this.timeout && b.clearTimeout(this.timeout);
    this.timeout = b.setTimeout(
      function () {
        this.timeout = null;
        this.remove();
      }.bind(this),
      5e3,
    );
  };
  e.prototype.remove = function () {
    this.timeout && (b.clearTimeout(this.timeout), (this.timeout = null));
    this.canvas.parentNode && document.body.removeChild(this.canvas);
    this.display = !1;
    this.text = "";
  };
  e.prototype.clean = function () {
    this.remove();
  };
  e.prototype.render = function (a) {
    var b = this.canvas;
    h[0] = 0;
    h[1] = 90 / 35;
    h[2] = 0;
    h[3] = 1;
    r[0] = c.width / 2;
    r[1] = c.height / 2;
    m.transformMat4(h, h, a);
    a = 0 === h[3] ? 1 : 1 / h[3];
    h[0] = r[0] + Math.round(r[0] * h[0] * a);
    h[1] = r[1] - Math.round(r[1] * h[1] * a);
    b.style.zIndex = c.canvas.style.zIndex + 1;
    b.style.top = ((h[1] - b.height - 2) | 0) + "px";
    b.style.left = ((h[0] - b.width / 2) | 0) + "px";
    b.parentNode || document.body.appendChild(b);
  };
  return function () {
    this.dialog = new e();
  };
});
