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
        u.entity.head,
        u.entity.headpalette,
        u.entity.sex,
        u.entity.job,
      );
    }
    function c() {
      event.stopImmediatePropagation();
      p.onExitRequest();
    }
    function d(a, b) {
      switch (a) {
        case "head":
          a = u.entity.head + b;
          b = u.entity.job ? 6 : 29;
          a = (a + b - 1) % b;
          u.entity.head = a + 1;
          B.entity.head = a + 1;
          break;
        case "headpalette":
          a = u.entity.headpalette += b;
          1 > a && (a = 8);
          8 < a && (a = 1);
          u.entity.headpalette = a;
          B.entity.headpalette = u.entity.headpalette;
          break;
        case "direction":
          u.entity.direction += b;
          break;
        case "sex":
          u.entity.sex = b;
          break;
        case "class":
          B.entity.setAction({ action: 0 });
          B = b ? D : A;
          u.entity.job = b ? 4218 : 0;
          u.entity.head = ((u.entity.head - 1) % 6) + 1;
          B.entity.headpalette = u.entity.headpalette;
          B.entity.head = u.entity.head;
          p.ui
            .find(".box_select")
            .removeClass("slot1 slot2 slot3")
            .addClass("slot" + (b ? 2 : 1));
          B.entity.setAction({ action: 1, repeat: !0 });
          break;
        case "gender":
          ((u.entity.sex = b),
            (A.entity.sex = b),
            (D.entity.sex = b),
            p.changeBackground(".chargen .male", b ? 1 : 0),
            p.changeBackground(".chargen .female", b ? 0 : 1));
      }
      e();
    }
    function e(a) {
      u.tick + 500 < a &&
        (u.entity.direction++, (u.entity.direction %= 8), (u.tick = a));
      g.bind2DContext(u.ctx, 32, 115);
      u.ctx.clearRect(0, 0, u.ctx.canvas.width, u.ctx.canvas.height);
      u.entity.renderEntity();
      g.bind2DContext(A.ctx, 32, 115);
      A.ctx.clearRect(0, 0, A.ctx.canvas.width, A.ctx.canvas.height);
      A.entity.renderEntity();
      g.bind2DContext(D.ctx, 32, 115);
      D.ctx.clearRect(0, 0, D.ctx.canvas.width, D.ctx.canvas.height);
      D.entity.renderEntity();
    }
    var m = a("DB/DBManager"),
      h = a("Core/Configs"),
      r = a("Renderer/Renderer"),
      q = a("Controls/KeyEventHandler"),
      k = a("Renderer/Entity/Entity"),
      g = a("Renderer/SpriteRenderer"),
      t = a("Renderer/Camera"),
      l = a("UI/UIManager"),
      f = a("UI/UIComponent"),
      n = a("text!./CharCreate.html");
    a = a("text!./CharCreate.css");
    var p = new f("CharCreate", n, a),
      v = 0,
      u = { entity: new k(), ctx: null, render: !1, tick: 0 },
      A = { entity: new k(), ctx: null, render: !1, tick: 0 },
      D = { entity: new k(), ctx: null, render: !1, tick: 0 },
      B = A;
    h.get("ClientVer");
    p.init = function () {
      u.ctx = this.ui.find(".chargen canvas")[0].getContext("2d");
      A.ctx = this.ui.find(".human canvas")[0].getContext("2d");
      D.ctx = this.ui.find(".doram canvas")[0].getContext("2d");
      this.ui.css({ top: (r.height - 358) / 2, left: (r.width - 576) / 2 });
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
      u.render = !0;
      u.entity.set({ sex: v, job: 0, head: 2, action: 0 });
      A.render = !0;
      A.entity.set({
        sex: v,
        job: 0,
        head: 2,
        speed: 200,
        direction: 1,
        action: 0,
      });
      D.render = !0;
      D.entity.set({
        sex: v,
        job: 4218,
        head: 2,
        speed: 200,
        direction: 1,
        action: 0,
      });
      t.direction = 0;
      d("class", 0);
      d("gender", v);
      this.ui.find(".human .name").text(m.getMessage(3016));
      this.ui.find(".human .desc").text(m.getMessage(3020));
      this.ui.find(".human .jobs").text(m.getMessage(3017));
      this.ui.find(".doram .name").text(m.getMessage(3018));
      this.ui.find(".doram .desc").text(m.getMessage(3021));
      this.ui.find(".doram .jobs").text(m.getMessage(3019));
      this.ui.find("input").val("").focus();
      r.render(e);
    };
    p.onRemove = function () {
      r.stop(e);
    };
    p.onKeyDown = function (a) {
      return a.which === q.ESCAPE
        ? (a.stopImmediatePropagation(), c(), !1)
        : a.which === q.ENTER
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
