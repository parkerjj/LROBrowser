define("UI/Components/Intro/Particle", ["require"], function (a) {
  function b(a, b) {
    this.rmax = 10;
    this.xmax = 5;
    this.ymax = 2;
    this.reset(a, b);
  }
  b.requestRender =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (a) {
      window.setTimeout(a, 1e3 / 60);
    };
  var c;
  b.init = function () {
    this.list = Array(50);
    c = document.createElement("canvas");
    c.width = window.innerWidth || document.body.offsetWidth;
    c.height = window.innerHeight || document.body.offsetHeight;
    document.body.appendChild(c);
    this.width = c.width;
    this.height = c.height;
    this.canvas = c;
    this.ctx = c.getContext("2d");
    this.ctx.globalCompositeOperation = "lighter";
    this.bg = new Image();
    this.bg.onload = function () {
      this.ready = !0;
    };
    for (var a = 0; 50 > a; ++a) this.list[a] = new b(this.width, this.height);
    this.process = !0;
    this.tick = Date.now();
    this.render();
  };
  b.stop = function () {
    this.process = !1;
    c.remove();
  };
  b.render = function () {
    var a = Date.now(),
      b,
      c;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.ready &&
      ((this.ctx.globalCompositeOperation = "source-over"),
      this.ctx.drawImage(this.bg, 0, 0),
      (this.ctx.globalCompositeOperation = "lighter"));
    b = 0;
    for (c = this.list.length; b < c; ++b)
      (this.list[b].update(a - this.tick, 0, 0, this.width, this.height),
        this.list[b].render(this.ctx));
    this.tick = a;
    this.process &&
      this.requestRender.call(window, this.render.bind(this), this.canvas);
  };
  b.prototype.reset = function (a, b) {
    this.x = a * Math.random();
    this.y = b * Math.random();
    this.r = (this.rmax - 1) * Math.random() + 1;
    this.c = Math.floor(255 * Math.random());
    this.dx = Math.random() * this.xmax * 2 - this.xmax;
    this.dy = Math.random() * this.ymax * 2 - this.ymax;
    this.dc = 0.5 < Math.random() ? 1 : -1;
    this.life = (this.r / this.rmax) * 200;
    this.ratio = Math.random() * this.life;
    this.stop = 0.2 * Math.random() + 0.4;
    this.t = Math.random() + 1;
  };
  b.prototype.render = function (a) {
    var b = 0.01 * Math.floor(100 * (1 - this.ratio / this.life)),
      c = a.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        Math.max(this.r * b, 0.5),
      );
    a.beginPath();
    a.arc(this.x, this.y, this.r, 0, 2 * Math.PI, !0);
    a.closePath();
    c.addColorStop(0, "rgba(255,255,255," + b + ")");
    c.addColorStop(this.stop, "rgba(255,255,255," + 0.5 * b + ")");
    c.addColorStop(1, "rgba(255,255,255,0)");
    a.fillStyle = c;
    a.fill();
  };
  b.prototype.update = function (a, b, c, h, r) {
    a = (a / 60) * 2;
    this.x += Math.cos((this.ratio / this.life) * this.dx * 2) * a;
    this.y += Math.sin((this.ratio / this.life) * this.dy * 2) * a;
    this.c += this.dc * a;
    this.ratio += this.t * a;
    if (0 >= this.ratio || this.ratio >= this.life) this.t *= -1;
    (this.x - this.r > h ||
      0 > this.x + this.r ||
      this.y - this.r > r ||
      0 > this.y + this.r) &&
      this.reset(h, r);
    255 <= this.c ? (this.dc = -1) : 0 >= this.c && (this.dc = 1);
  };
  return b;
});
