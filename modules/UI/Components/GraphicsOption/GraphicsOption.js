define(
  "UI/Components/GraphicsOption/GraphicsOption",
  "require Core/Configs Core/Context Core/Preferences Preferences/Graphics Renderer/Renderer UI/UIManager UI/UIComponent text!./GraphicsOption.html text!./GraphicsOption.css".split(
    " ",
  ),
  function (a) {
    function b() {
      t.quality = parseInt(this.value, 10);
      t.save();
      e.set("quality", t.quality);
      r.resize();
    }
    function c() {
      t.cursor = !!this.checked;
      t.save();
      t.cursor || (document.body.style.cursor = "default");
    }
    function d() {
      var a = m.isFullScreen();
      t.screensize = this.value;
      t.save();
      "full" === t.screensize
        ? a || m.requestFullScreen()
        : (a && m.cancelFullScreen(),
          m.Is.POPUP &&
            ((a = t.screensize.split("x")),
            a[0] != window.innerWidth &&
              a[1] != window.innerHeight &&
              (window.resizeTo(a[0], a[1]),
              window.moveTo(
                (screen.availWidth - a[0]) / 2,
                (screen.availHeight - a[1]) / 2,
              ))));
    }
    var e = a("Core/Configs"),
      m = a("Core/Context"),
      h = a("Core/Preferences"),
      t = a("Preferences/Graphics"),
      r = a("Renderer/Renderer"),
      n = a("UI/UIManager"),
      g = a("UI/UIComponent"),
      p = a("text!./GraphicsOption.html");
    a = a("text!./GraphicsOption.css");
    var g = new g("GraphicsOption", p, a),
      l = h.get("GraphicsOption", { x: 300, y: 300 }, 1.1);
    g.init = function () {
      this.ui.find(".base").mousedown(function (a) {
        a.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".close").click(this.remove.bind(this));
      this.ui.find(".details").change(b);
      this.ui.find(".cursor").change(c);
      this.ui.find(".screensize").change(d);
      this.draggable(this.ui.find(".titlebar"));
    };
    g.onAppend = function () {
      this.ui.css({ top: l.y, left: l.x });
      this.ui.find(".details").val(t.quality);
      this.ui.find(".screensize").val(t.screensize);
      this.ui.find(".cursor").attr("checked", t.cursor);
    };
    g.onRemove = function () {
      l.x = parseInt(this.ui.css("left"), 10);
      l.y = parseInt(this.ui.css("top"), 10);
      l.save();
    };
    return n.addComponent(g);
  },
);
