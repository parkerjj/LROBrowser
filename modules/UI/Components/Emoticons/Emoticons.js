define(
  "UI/Components/Emoticons/Emoticons",
  "require DB/Emotions Core/Client Core/Preferences Renderer/Renderer Renderer/SpriteRenderer Renderer/Entity/Entity UI/UIManager UI/UIComponent UI/Components/ChatBox/ChatBox text!./Emoticons.html text!./Emoticons.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      return function () {
        this.className.match(/disabled/) || p.movePage(a);
      };
    }
    function c() {
      p.ui.hide();
    }
    function d() {
      var a = this.getAttribute("data-index");
      (a = m.names[a]) &&
        !f.ui.find(".battlemode").is(":visible") &&
        f.ui
          .find(".input .message")
          .val("/" + a)
          .select();
    }
    function e() {
      if (F)
        u.showMessageBox("You are temporarily restricted from clicking.", "ok");
      else if (
        (B++,
        1 === B &&
          setTimeout(function () {
            B = 0;
          }, 5e3),
        30 < B)
      )
        ((F = !0),
          u.showMessageBox(
            "Click limit exceeded. You are restricted for 10s.",
            "ok",
          ),
          setTimeout(function () {
            F = !1;
            u.showMessageBox("Restriction lifted. You can click again.", "ok");
          }, 1e4));
      else {
        var a = this.getAttribute("data-index"),
          a = m.names[a];
        f.ui.find(".input .message").val("/" + a);
        f.submit();
      }
    }
    var m = a("DB/Emotions"),
      h = a("Core/Client"),
      q = a("Core/Preferences"),
      r = a("Renderer/Renderer"),
      k = a("Renderer/SpriteRenderer"),
      g = a("Renderer/Entity/Entity"),
      u = a("UI/UIManager"),
      l = a("UI/UIComponent"),
      f = a("UI/Components/ChatBox/ChatBox"),
      n = a("text!./Emoticons.html");
    a = a("text!./Emoticons.css");
    var p = new l("Emoticons", n, a),
      v = 0,
      t = 0,
      z = Object.keys(m.order).length,
      E,
      C,
      J = new g(),
      A = q.get("Emoticons", { x: 600, y: 200, show: !1 }, 1),
      B = 0,
      F = !1;
    p.init = function () {
      h.loadFiles(
        [
          "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/emotion.act",
          "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/emotion.spr",
        ],
        function (a, b) {
          E = a;
          C = b;
          t = Math.floor(z / 30);
          this.ui.find(".total").text(t + 1);
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
    p.onAppend = function () {
      this.ui.hide();
      this.ui.css({
        top: Math.min(Math.max(0, A.y), (r.height - this.ui.height()) / 2),
        left: Math.min(Math.max(0, A.x), (r.width - this.ui.width()) / 2),
      });
    };
    p.onRemove = function () {
      A.show = this.ui.is(":visible");
      A.y = parseInt(this.ui.css("top"), 10);
      A.x = parseInt(this.ui.css("left"), 10);
      A.save();
    };
    p.movePage = function (a) {
      this.ui.find(".prev, .next").removeClass("disabled");
      v += a;
      0 >= v && (this.ui.find(".prev").addClass("disabled"), (v = 0));
      v >= t && (this.ui.find(".next").addClass("disabled"), (v = t));
      this.ui.find(".current").text(v + 1);
      a = this.ui.find(".content");
      var b,
        c,
        d,
        e,
        f = 30 * v,
        g = Math.min(z, f + 30),
        h = [0, 0];
      for (a.empty(); f < g;) {
        b = document.createElement("canvas");
        c = b.getContext("2d");
        b.width = 40;
        b.height = 40;
        d = m.order[f];
        b.setAttribute("data-index", d);
        d = E.actions[d].animations;
        d = d[Math.floor(d.length / 5)];
        d = d.layers;
        e = d.length;
        k.bind2DContext(c, 20 - d[0].pos[0], 40 - d[0].pos[1]);
        for (c = 0; c < e; ++c) J.renderLayer(d[c], C, C, 1, h, !1);
        a.append(b);
        f++;
      }
    };
    p.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          (this.ui.toggle(), this.ui.is(":visible") && this.focus());
      }
    };
    return u.addComponent(p);
  },
);
