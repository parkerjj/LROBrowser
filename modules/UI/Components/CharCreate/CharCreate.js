define(
  "UI/Components/CharCreate/CharCreate",
  "require DB/DBManager Core/Configs Renderer/Renderer Controls/KeyEventHandler Renderer/Entity/Entity Renderer/SpriteRenderer Renderer/Camera UI/UIManager UI/UIComponent text!./CharCreate.html text!./CharCreate.css".split(
    " ",
  ),
  function (a) {
    function b() {
      p.onCharCreationRequest(
        p.ui.find("input").val(),
        1,
        1,
        1,
        1,
        1,
        1,
        t.entity.head,
        t.entity.headpalette,
        t.entity.sex,
        t.entity.job,
      );
    }
    function c() {
      event.stopImmediatePropagation();
      p.onExitRequest();
    }
    function d(a, b) {
      switch (a) {
        case "head":
          a = t.entity.head + b;
          b = t.entity.job ? 6 : 29;
          a = (a + b - 1) % b;
          t.entity.head = a + 1;
          C.entity.head = a + 1;
          break;
        case "headpalette":
          a = t.entity.headpalette += b;
          1 > a && (a = 8);
          8 < a && (a = 1);
          t.entity.headpalette = a;
          C.entity.headpalette = t.entity.headpalette;
          break;
        case "direction":
          t.entity.direction += b;
          break;
        case "sex":
          t.entity.sex = b;
          break;
        case "class":
          C.entity.setAction({ action: 0 });
          C = b ? E : z;
          t.entity.job = b ? 4218 : 0;
          t.entity.head = ((t.entity.head - 1) % 6) + 1;
          C.entity.headpalette = t.entity.headpalette;
          C.entity.head = t.entity.head;
          p.ui
            .find(".box_select")
            .removeClass("slot1 slot2 slot3")
            .addClass("slot" + (b ? 2 : 1));
          C.entity.setAction({ action: 1, repeat: !0 });
          break;
        case "gender":
          ((t.entity.sex = b),
            (z.entity.sex = b),
            (E.entity.sex = b),
            p.changeBackground(".chargen .male", b ? 1 : 0),
            p.changeBackground(".chargen .female", b ? 0 : 1));
      }
      e();
    }
    function e(a) {
      t.tick + 500 < a &&
        (t.entity.direction++, (t.entity.direction %= 8), (t.tick = a));
      g.bind2DContext(t.ctx, 32, 115);
      t.ctx.clearRect(0, 0, t.ctx.canvas.width, t.ctx.canvas.height);
      t.entity.renderEntity();
      g.bind2DContext(z.ctx, 32, 115);
      z.ctx.clearRect(0, 0, z.ctx.canvas.width, z.ctx.canvas.height);
      z.entity.renderEntity();
      g.bind2DContext(E.ctx, 32, 115);
      E.ctx.clearRect(0, 0, E.ctx.canvas.width, E.ctx.canvas.height);
      E.entity.renderEntity();
    }
    var m = a("DB/DBManager"),
      h = a("Core/Configs"),
      q = a("Renderer/Renderer"),
      r = a("Controls/KeyEventHandler"),
      k = a("Renderer/Entity/Entity"),
      g = a("Renderer/SpriteRenderer"),
      u = a("Renderer/Camera"),
      l = a("UI/UIManager"),
      f = a("UI/UIComponent"),
      n = a("text!./CharCreate.html");
    a = a("text!./CharCreate.css");
    var p = new f("CharCreate", n, a),
      v = 0,
      t = { entity: new k(), ctx: null, render: !1, tick: 0 },
      z = { entity: new k(), ctx: null, render: !1, tick: 0 },
      E = { entity: new k(), ctx: null, render: !1, tick: 0 },
      C = z;
    h.get("ClientVer");
    p.init = function () {
      t.ctx = this.ui.find(".chargen canvas")[0].getContext("2d");
      z.ctx = this.ui.find(".human canvas")[0].getContext("2d");
      E.ctx = this.ui.find(".doram canvas")[0].getContext("2d");
      this.ui.css({ top: (q.height - 358) / 2, left: (q.width - 576) / 2 });
      this.draggable();
      this.ui.find(".chargen .male").on("click", function () {
        d("gender", 1);
      });
      this.ui.find(".chargen .female").on("click", function () {
        d("gender", 0);
      });
      this.ui.find(".chargen .stylel").on("click", function () {
        d("head", -1);
      });
      this.ui.find(".chargen .styler").on("click", function () {
        d("head", 1);
      });
      this.ui.find(".chargen .colorl").on("click", function () {
        d("headpalette", -1);
      });
      this.ui.find(".chargen .colorr").on("click", function () {
        d("headpalette", 1);
      });
      this.ui.find(".human").on("click", function () {
        d("class", 0);
      });
      this.ui.find(".doram").on("click", function () {
        d("class", 1);
      });
      this.ui.find("input").on("click", function (a) {
        this.focus();
        a.stopImmediatePropagation();
      });
      this.ui.find(".cancel").on("click", c);
      this.ui.find(".make").on("click", b);
      h.get("doram") || this.ui.find(".doram").hide();
    };
    p.setAccountSex = function (a) {
      v = a;
    };
    p.onAppend = function () {
      t.render = !0;
      t.entity.set({ sex: v, job: 0, head: 2, action: 0 });
      z.render = !0;
      z.entity.set({
        sex: v,
        job: 0,
        head: 2,
        speed: 200,
        direction: 1,
        action: 0,
      });
      E.render = !0;
      E.entity.set({
        sex: v,
        job: 4218,
        head: 2,
        speed: 200,
        direction: 1,
        action: 0,
      });
      u.direction = 0;
      d("class", 0);
      d("gender", v);
      this.ui.find(".human .name").text(m.getMessage(3016));
      this.ui.find(".human .desc").text(m.getMessage(3020));
      this.ui.find(".human .jobs").text(m.getMessage(3017));
      this.ui.find(".doram .name").text(m.getMessage(3018));
      this.ui.find(".doram .desc").text(m.getMessage(3021));
      this.ui.find(".doram .jobs").text(m.getMessage(3019));
      this.ui.find("input").val("").focus();
      q.render(e);
    };
    p.onRemove = function () {
      q.stop(e);
    };
    p.onKeyDown = function (a) {
      return a.which === r.ESCAPE
        ? (a.stopImmediatePropagation(), c(), !1)
        : a.which === r.ENTER
          ? (a.stopImmediatePropagation(), b(), !1)
          : !0;
    };
    p.highlight = function (a) {
      var b = this.ui.find("input");
      b.css("background-color", a ? "#F5A9BC" : "white");
      a && b.focus();
    };
    p.onExitRequest = function () {};
    p.onCharCreationRequest = function () {};
    return l.addComponent(p);
  },
);
