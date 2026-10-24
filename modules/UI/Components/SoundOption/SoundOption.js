define(
  "UI/Components/SoundOption/SoundOption",
  "require Core/Preferences Preferences/Audio Audio/BGM Audio/SoundManager UI/UIManager UI/UIComponent text!./SoundOption.html text!./SoundOption.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function c() {
      n.remove();
    }
    function d() {
      q.Sound.volume = parseInt(this.value, 10) / 100;
      q.save();
      g.setVolume(q.Sound.volume);
    }
    function e() {
      var a = q.Sound.volume;
      q.Sound.play = this.checked;
      q.Sound.play ? g.setVolume(q.Sound.volume) : (g.setVolume(0), g.stop());
      q.Sound.volume = a;
      q.save();
    }
    function m() {
      q.BGM.volume = parseInt(this.value, 10) / 100;
      q.save();
      k.setVolume(q.BGM.volume);
    }
    function h() {
      q.BGM.play = this.checked;
      q.save();
      q.BGM.play ? k.play(k.filename) : k.stop();
    }
    var r = a("Core/Preferences"),
      q = a("Preferences/Audio"),
      k = a("Audio/BGM"),
      g = a("Audio/SoundManager"),
      t = a("UI/UIManager"),
      l = a("UI/UIComponent"),
      f = a("text!./SoundOption.html");
    a = a("text!./SoundOption.css");
    var n = new l("SoundOption", f, a),
      p = r.get("SoundOption", { x: 300, y: 300 }, 1);
    n.init = function () {
      this.ui.find(".base").mousedown(b);
      this.ui.find(".close").click(c);
      this.ui.find(".sound").change(d);
      this.ui.find(".bgm").change(m);
      this.ui.find(".sound_state").change(e);
      this.ui.find(".bgm_state").change(h);
      this.draggable(this.ui.find(".titlebar"));
    };
    n.onAppend = function () {
      this.ui.css({ top: p.y, left: p.x });
      this.ui.find(".sound").val(100 * q.Sound.volume);
      this.ui.find(".bgm").val(100 * q.BGM.volume);
      this.ui.find(".sound_state")[0].checked = q.Sound.play;
      this.ui.find(".bgm_state")[0].checked = q.BGM.play;
    };
    n.onRemove = function () {
      p.x = parseInt(this.ui.css("left"), 10);
      p.y = parseInt(this.ui.css("top"), 10);
      p.save();
    };
    return t.addComponent(n);
  },
);
