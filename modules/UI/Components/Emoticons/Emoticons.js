define(
  "UI/Components/Emoticons/Emoticons",
  "require DB/Emotions Core/Client Core/Preferences Renderer/Renderer Renderer/SpriteRenderer Renderer/Entity/Entity UI/UIManager UI/UIComponent UI/Components/ChatBox/ChatBox text!./Emoticons.html text!./Emoticons.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      return function () {
        this.className.match(/disabled/) || q.movePage(a);
      };
    }
    function c() {
      q.ui.hide();
    }
    function d() {
      var a = this.getAttribute("data-index");
      (a = l.names[a]) &&
        !f.ui.find(".battlemode").is(":visible") &&
        f.ui
          .find(".input .message")
          .val("/" + a)
          .select();
    }
    function e() {
      if (G)
        p.showMessageBox("You are temporarily restricted from clicking.", "ok");
      else if (
        (z++,
        1 === z &&
          setTimeout(function () {
            z = 0;
          }, 5e3),
        30 < z)
      )
        ((G = !0),
          p.showMessageBox(
            "Click limit exceeded. You are restricted for 10s.",
            "ok",
          ),
          setTimeout(function () {
            G = !1;
            p.showMessageBox("Restriction lifted. You can click again.", "ok");
          }, 1e4));
      else {
        var a = this.getAttribute("data-index"),
          a = l.names[a];
        f.ui.find(".input .message").val("/" + a);
        f.submit();
      }
    }
    var l = a("DB/Emotions"),
      h = a("Core/Client"),
      r = a("Core/Preferences"),
      t = a("Renderer/Renderer"),
      n = a("Renderer/SpriteRenderer"),
      g = a("Renderer/Entity/Entity"),
      p = a("UI/UIManager"),
      k = a("UI/UIComponent"),
      f = a("UI/Components/ChatBox/ChatBox"),
      m = a("text!./Emoticons.html");
    a = a("text!./Emoticons.css");
    var q = new k("Emoticons", m, a),
      v = 0,
      u = 0,
      A = Object.keys(l.order).length,
      D,
      B,
      H = new g(),
      C = r.get("Emoticons", { x: 600, y: 200, show: !1 }, 1),
      z = 0,
      G = !1;
    q.init = function () {
      h.loadFiles(
        [
          "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/emotion.act",
          "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/emotion.spr",
        ],
        function (a, b) {
          D = a;
          B = b;
          u = Math.floor(A / 30);
          this.ui.find(".total").text(u + 1);
          this.movePage(0);
        }.bind(this),
      );
      this.ui
        .find(".content")
        .on("dblclick", "canvas", e)
        .on("mousedown", "canvas", d);
      this.ui.find(".base").mousedown(function (a) {
        a.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".prev").addClass("disabled");
      this.ui.find(".close").click(c);
      this.ui.find(".prev").click(b(-1));
      this.ui.find(".next").click(b(1));
      this.draggable(this.ui.find(".titlebar"));
    };
    q.onAppend = function () {
      this.ui.hide();
      this.ui.css({
        top: Math.min(Math.max(0, C.y), (t.height - this.ui.height()) / 2),
        left: Math.min(Math.max(0, C.x), (t.width - this.ui.width()) / 2),
      });
    };
    q.onRemove = function () {
      C.show = this.ui.is(":visible");
      C.y = parseInt(this.ui.css("top"), 10);
      C.x = parseInt(this.ui.css("left"), 10);
      C.save();
    };
    q.movePage = function (a) {
      this.ui.find(".prev, .next").removeClass("disabled");
      v += a;
      0 >= v && (this.ui.find(".prev").addClass("disabled"), (v = 0));
      v >= u && (this.ui.find(".next").addClass("disabled"), (v = u));
      this.ui.find(".current").text(v + 1);
      a = this.ui.find(".content");
      var b,
        c,
        d,
        e,
        f = 30 * v,
        g = Math.min(A, f + 30),
        h = [0, 0];
      for (a.empty(); f < g;) {
        b = document.createElement("canvas");
        c = b.getContext("2d");
        b.width = 40;
        b.height = 40;
        d = l.order[f];
        b.setAttribute("data-index", d);
        d = D.actions[d].animations;
        d = d[Math.floor(d.length / 5)];
        d = d.layers;
        e = d.length;
        n.bind2DContext(c, 20 - d[0].pos[0], 40 - d[0].pos[1]);
        for (c = 0; c < e; ++c) H.renderLayer(d[c], B, B, 1, h, !1);
        a.append(b);
        f++;
      }
    };
    q.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          (this.ui.toggle(), this.ui.is(":visible") && this.focus());
      }
    };
    return p.addComponent(q);
  },
);
