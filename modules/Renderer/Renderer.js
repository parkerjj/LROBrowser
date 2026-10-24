define(
  "Renderer/Renderer",
  "require Utils/WebGL Utils/jquery Utils/gl-matrix Core/Configs Preferences/Graphics Core/Events UI/Background UI/CursorManager Controls/MouseEventHandler Renderer/Camera".split(
    " ",
  ),
  function (a) {
    var b = a("Utils/WebGL"),
      c = a("Utils/jquery"),
      d = a("Utils/gl-matrix"),
      e = a("Core/Configs"),
      m = a("Preferences/Graphics"),
      h = a("Core/Events"),
      r = a("UI/Background"),
      q = a("UI/CursorManager"),
      k = a("Controls/MouseEventHandler"),
      g = a("Renderer/Camera"),
      t = d.mat4,
      d = {};
    d.canvas = document.createElement("canvas");
    d.gl = null;
    d.width = 0;
    d.height = 0;
    d.resizeTimeOut = 0;
    d.updateId = 0;
    d.frameLimit = m.fpslimit;
    d.tick = 0;
    d.vFov = 15;
    d.renderCallbacks = [];
    var l =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (a) {
          return window.setTimeout(a, 1e3 / 60);
        },
      f =
        window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        function (a) {
          window.clearTimeout(a);
        };
    d.init = function (a) {
      this.gl ||
        ((this.canvas.style.position = "absolute"),
        (this.canvas.style.top = "0px"),
        (this.canvas.style.left = "0px"),
        (this.canvas.style.zIndex = 0),
        (this.canvas.className = "renderer"),
        (this.gl = b.getContext(this.canvas, a)),
        c(window)
          .resize(this.onResize.bind(this))
          .on("contextmenu", function () {
            return !1;
          }),
        this.render(null),
        this.resize());
      a = this.gl;
      a.clearDepth(1);
      a.enable(a.DEPTH_TEST);
      a.depthFunc(a.LEQUAL);
      a.enable(a.BLEND);
      a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
    };
    d.show = function () {
      this.canvas.parentNode || document.body.appendChild(this.canvas);
    };
    d.remove = function () {
      this.canvas.parentNode && document.body.removeChild(this.canvas);
    };
    d.getContext = function () {
      return this.gl;
    };
    d.onResize = function () {
      h.clearTimeout(this.resizeTimeOut);
      this.resizeTimeOut = h.setTimeout(this.resize.bind(this), 500);
    };
    d.resize = function () {
      var b, c, d;
      b = window.innerWidth || document.body.offsetWidth;
      c = window.innerHeight || document.body.offsetHeight;
      k.screen.width = this.width = b;
      k.screen.height = this.height = c;
      d = e.get("quality", m.quality) / 100;
      b *= d;
      c *= d;
      this.canvas.width = 1.5 * b;
      this.canvas.height = 1.5 * c;
      this.canvas.style.width = this.width + "px";
      this.canvas.style.height = this.height + "px";
      this.gl.viewport(0, 0, 1.5 * b, 1.5 * c);
      t.perspective(this.vFov, b / c, 1, 1e3, g.projection);
      r.resize(this.width, this.height);
      a("UI/UIManager").fixResizeOverflow(this.width, this.height);
    };
    d.rendering = !1;
    d._render = function (a) {
      var b = Date.now();
      if (0 < this.frameLimit) {
        if (
          ("undefined" !== typeof a && f(this.updateId),
          100 / (b - this.tick) > 1e3 / this.frameLimit)
        )
          return;
      } else
        ("undefined" === typeof a && clearInterval(this.updateId),
          (this.updateId = l(this._render.bind(this), this.canvas)));
      this.tick = b;
      h.process(this.tick);
      a = 0;
      for (b = this.renderCallbacks.length; a < b; ++a)
        if (this.renderCallbacks[a])
          this.renderCallbacks[a](this.tick, this.gl);
      q.render(this.tick);
      performance.now();
      debugger;
    };
    d.render = function (a) {
      a && this.renderCallbacks.push(a);
      this.rendering ||
        ((this.rendering = !0),
        0 < this.frameLimit
          ? (this.updateId = setInterval(
              this._render.bind(this),
              1e3 / this.frameLimit,
            ))
          : this._render());
    };
    d.stop = function (a) {
      if (arguments.length) {
        var b = this.renderCallbacks.indexOf(a);
        -1 < b && this.renderCallbacks.splice(b, 1);
      } else this.renderCallbacks.length = 0;
    };
    return d;
  },
);
