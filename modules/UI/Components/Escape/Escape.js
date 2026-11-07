define(
  "UI/Components/Escape/Escape",
  "require Core/Configs Engine/SessionStorage Controls/KeyEventHandler Renderer/Renderer UI/UIManager UI/UIComponent UI/Components/SoundOption/SoundOption UI/Components/GraphicsOption/GraphicsOption UI/Components/ShortCutOption/ShortCutOption text!./Escape.html text!./Escape.css".split(
    " ",
  ),
  function (a) {
    function b() {
      k.ui && k.ui[0].parentNode ? k.remove() : k.append();
    }
    function c() {
      g.ui && g.ui[0].parentNode ? g.remove() : g.append();
    }
    function d() {
      t.ui && t.ui[0].parentNode ? t.remove() : t.append();
    }
    var e = a("Core/Configs");
    a("Engine/SessionStorage");
    var m = a("Controls/KeyEventHandler"),
      h = a("Renderer/Renderer"),
      r = a("UI/UIManager"),
      q = a("UI/UIComponent"),
      k = a("UI/Components/SoundOption/SoundOption"),
      g = a("UI/Components/GraphicsOption/GraphicsOption"),
      t = a("UI/Components/ShortCutOption/ShortCutOption"),
      l = a("text!./Escape.html");
    a = a("text!./Escape.css");
    var f = new q("Escape", l, a),
      n = e.get("ClientVer");
    f.init = function () {
      this.draggable(this.ui.find(".top"));
      this.ui.find(".node").mousedown(function (a) {
        a.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".sound").on("click", b);
      this.ui.find(".graphics").on("click", c);
      this.ui.find(".shortcut_setting").on("click", d);
      this.ui.find(".resurection").on("click", function () {
        f.onResurectionRequest();
      });
      this.ui.find(".backhome").on("click", function () {
        f.onBackhomeRequest();
      });
      this.ui.find(".setoffline").on("click", function () {
        f.onSetofflineRequest();
      });
      this.ui.find(".savepoint").on("click", function () {
        f.onReturnSavePointRequest();
      });
      this.ui.find(".charselect").on("click", function () {
        f.onCharSelectionRequest();
      });
      this.ui.find(".cancel").on("click", function () {
        f.ui.hide();
      });
      this.ui.find(".areward").on("click", function () {
        localStorage.setItem("aid", aid);
        localStorage.setItem("gid", gid);
        localStorage.setItem("rolename", rolename);
        localStorage.setItem("account", account);
        window.open("http://game.lastro.cn/?r\x3dpay/index\x26nid\x3d" + n);
      });
    };
    f.onAppend = function () {
      this.ui.css({
        top: 0.5 * (h.height - this.ui.height()),
        left: 0.5 * (h.width - this.ui.width()),
      });
      this.ui.find("button").show();
      this.ui.find(".resurection, .savepoint, .exit, .backhome").hide();
      this.ui.hide();
    };
    f.onRemove = function () {
      this.ui.hide();
      this.ui.find(".savepoint,.resurection").hide();
      this.ui.find(".setting, .hotkey, .setoffline, .charselect").show();
    };
    f.onKeyDown = function (a) {
      return a.which === m.ESCAPE
        ? (this.ui.toggle(),
          this.ui.is(":visible") && this.focus(),
          a.stopImmediatePropagation(),
          !1)
        : !0;
    };
    f.onResurectionRequest = function () {};
    f.onCheakResurection = function () {};
    f.onExitRequest = function () {};
    f.onReturnSavePointRequest = function () {};
    f.onCharSelectionRequest = function () {};
    f.onBackhomeRequest = function () {};
    f.onSetofflineRequest = function () {};
    return r.addComponent(f);
  },
);
