define(
  "UI/Components/CharCreate/CharCreate",
  "require DB/DBManager Core/Configs Renderer/Renderer Controls/KeyEventHandler Renderer/Entity/Entity Renderer/SpriteRenderer Renderer/Camera UI/UIManager UI/UIComponent text!./CharCreate.html text!./CharCreate.css".split(
    " ",
  ),
  function (a) {
    function b() {
      q.onCharCreationRequest(
        q.ui.find("input").val(),
        1,
        1,
        1,
        1,
        1,
        1,
        v.entity.head,
        v.entity.headpalette,
        v.entity.sex,
        v.entity.job,
      );
    }
    function c() {
      event.stopImmediatePropagation();
      q.onExitRequest();
    }
    function d(a, b) {
      switch (a) {
        case "head":
          a = v.entity.head + b;
          b = v.entity.job ? 6 : 29;
          a = (a + b - 1) % b;
          v.entity.head = a + 1;
          B.entity.head = a + 1;
          break;
        case "headpalette":
          a = v.entity.headpalette += b;
          1 > a && (a = 8);
          8 < a && (a = 1);
          v.entity.headpalette = a;
          B.entity.headpalette = v.entity.headpalette;
          break;
        case "direction":
          v.entity.direction += b;
          break;
        case "sex":
          v.entity.sex = b;
          break;
        case "class":
          B.entity.setAction({ action: 0 });
          B = b ? C : A;
          v.entity.job = b ? 4218 : 0;
          v.entity.head = ((v.entity.head - 1) % 6) + 1;
          B.entity.headpalette = v.entity.headpalette;
          B.entity.head = v.entity.head;
          q.ui
            .find(".box_select")
            .removeClass("slot1 slot2 slot3")
            .addClass("slot" + (b ? 2 : 1));
          B.entity.setAction({ action: 1, repeat: !0 });
          break;
        case "gender":
          ((v.entity.sex = b),
            (A.entity.sex = b),
            (C.entity.sex = b),
            q.changeBackground(".chargen .male", b ? 1 : 0),
            q.changeBackground(".chargen .female", b ? 0 : 1));
      }
      e();
    }
    function e(a) {
      v.tick + 500 < a &&
        (v.entity.direction++, (v.entity.direction %= 8), (v.tick = a));
      g.bind2DContext(v.ctx, 32, 115);
      v.ctx.clearRect(0, 0, v.ctx.canvas.width, v.ctx.canvas.height);
      v.entity.renderEntity();
      g.bind2DContext(A.ctx, 32, 115);
      A.ctx.clearRect(0, 0, A.ctx.canvas.width, A.ctx.canvas.height);
      A.entity.renderEntity();
      g.bind2DContext(C.ctx, 32, 115);
      C.ctx.clearRect(0, 0, C.ctx.canvas.width, C.ctx.canvas.height);
      C.entity.renderEntity();
    }
    var m = a("DB/DBManager"),
      h = a("Core/Configs"),
      t = a("Renderer/Renderer"),
      r = a("Controls/KeyEventHandler"),
      n = a("Renderer/Entity/Entity"),
      g = a("Renderer/SpriteRenderer"),
      p = a("Renderer/Camera"),
      l = a("UI/UIManager"),
      f = a("UI/UIComponent"),
      k = a("text!./CharCreate.html");
    a = a("text!./CharCreate.css");
    var q = new f("CharCreate", k, a),
      u = 0,
      v = { entity: new n(), ctx: null, render: !1, tick: 0 },
      A = { entity: new n(), ctx: null, render: !1, tick: 0 },
      C = { entity: new n(), ctx: null, render: !1, tick: 0 },
      B = A;
    h.get("ClientVer");
    q.init = function () {
      v.ctx = this.ui.find(".chargen canvas")[0].getContext("2d");
      A.ctx = this.ui.find(".human canvas")[0].getContext("2d");
      C.ctx = this.ui.find(".doram canvas")[0].getContext("2d");
      this.ui.css({ top: (t.height - 358) / 2, left: (t.width - 576) / 2 });
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
    q.setAccountSex = function (a) {
      u = a;
    };
    q.onAppend = function () {
      v.render = !0;
      v.entity.set({ sex: u, job: 0, head: 2, action: 0 });
      A.render = !0;
      A.entity.set({
        sex: u,
        job: 0,
        head: 2,
        speed: 200,
        direction: 1,
        action: 0,
      });
      C.render = !0;
      C.entity.set({
        sex: u,
        job: 4218,
        head: 2,
        speed: 200,
        direction: 1,
        action: 0,
      });
      p.direction = 0;
      d("class", 0);
      d("gender", u);
      this.ui.find(".human .name").text(m.getMessage(3016));
      this.ui.find(".human .desc").text(m.getMessage(3020));
      this.ui.find(".human .jobs").text(m.getMessage(3017));
      this.ui.find(".doram .name").text(m.getMessage(3018));
      this.ui.find(".doram .desc").text(m.getMessage(3021));
      this.ui.find(".doram .jobs").text(m.getMessage(3019));
      this.ui.find("input").val("").focus();
      t.render(e);
    };
    q.onRemove = function () {
      t.stop(e);
    };
    q.onKeyDown = function (a) {
      return a.which === r.ESCAPE
        ? (a.stopImmediatePropagation(), c(), !1)
        : a.which === r.ENTER
          ? (a.stopImmediatePropagation(), b(), !1)
          : !0;
    };
    q.highlight = function (a) {
      var b = this.ui.find("input");
      b.css("background-color", a ? "#F5A9BC" : "white");
      a && b.focus();
    };
    q.onExitRequest = function () {};
    q.onCharCreationRequest = function () {};
    return l.addComponent(q);
  },
);
