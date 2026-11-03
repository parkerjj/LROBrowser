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
      m.remove();
    }
    function d() {
      t.Sound.volume = parseInt(this.value, 10) / 100;
      t.save();
      g.setVolume(t.Sound.volume);
    }
    function e() {
      var a = t.Sound.volume;
      t.Sound.play = this.checked;
      t.Sound.play ? g.setVolume(t.Sound.volume) : (g.setVolume(0), g.stop());
      t.Sound.volume = a;
      t.save();
    }
    function l() {
      t.BGM.volume = parseInt(this.value, 10) / 100;
      t.save();
      n.setVolume(t.BGM.volume);
    }
    function h() {
      t.BGM.play = this.checked;
      t.save();
      t.BGM.play ? n.play(n.filename) : n.stop();
    }
    var r = a("Core/Preferences"),
      t = a("Preferences/Audio"),
      n = a("Audio/BGM"),
      g = a("Audio/SoundManager"),
      p = a("UI/UIManager"),
      k = a("UI/UIComponent"),
      f = a("text!./SoundOption.html");
    a = a("text!./SoundOption.css");
    var m = new k("SoundOption", f, a),
      q = r.get("SoundOption", { x: 300, y: 300 }, 1);
    m.init = function () {
      this.ui.find(".base").mousedown(b);
      this.ui.find(".close").click(c);
      this.ui.find(".sound").change(d);
      this.ui.find(".bgm").change(l);
      this.ui.find(".sound_state").change(e);
      this.ui.find(".bgm_state").change(h);
      this.draggable(this.ui.find(".titlebar"));
    };
    m.onAppend = function () {
      this.ui.css({ top: q.y, left: q.x });
      this.ui.find(".sound").val(100 * t.Sound.volume);
      this.ui.find(".bgm").val(100 * t.BGM.volume);
      this.ui.find(".sound_state")[0].checked = t.Sound.play;
      this.ui.find(".bgm_state")[0].checked = t.BGM.play;
    };
    m.onRemove = function () {
      q.x = parseInt(this.ui.css("left"), 10);
      q.y = parseInt(this.ui.css("top"), 10);
      q.save();
    };
    return p.addComponent(m);
  },
);
