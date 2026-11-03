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
      k.remove();
    }
    function d() {
      r.Sound.volume = parseInt(this.value, 10) / 100;
      r.save();
      g.setVolume(r.Sound.volume);
    }
    function e() {
      var a = r.Sound.volume;
      r.Sound.play = this.checked;
      r.Sound.play ? g.setVolume(r.Sound.volume) : (g.setVolume(0), g.stop());
      r.Sound.volume = a;
      r.save();
    }
    function m() {
      r.BGM.volume = parseInt(this.value, 10) / 100;
      r.save();
      n.setVolume(r.BGM.volume);
    }
    function h() {
      r.BGM.play = this.checked;
      r.save();
      r.BGM.play ? n.play(n.filename) : n.stop();
    }
    var t = a("Core/Preferences"),
      r = a("Preferences/Audio"),
      n = a("Audio/BGM"),
      g = a("Audio/SoundManager"),
      p = a("UI/UIManager"),
      l = a("UI/UIComponent"),
      f = a("text!./SoundOption.html");
    a = a("text!./SoundOption.css");
    var k = new l("SoundOption", f, a),
      q = t.get("SoundOption", { x: 300, y: 300 }, 1);
    k.init = function () {
      this.ui.find(".base").mousedown(b);
      this.ui.find(".close").click(c);
      this.ui.find(".sound").change(d);
      this.ui.find(".bgm").change(m);
      this.ui.find(".sound_state").change(e);
      this.ui.find(".bgm_state").change(h);
      this.draggable(this.ui.find(".titlebar"));
    };
    k.onAppend = function () {
      this.ui.css({ top: q.y, left: q.x });
      this.ui.find(".sound").val(100 * r.Sound.volume);
      this.ui.find(".bgm").val(100 * r.BGM.volume);
      this.ui.find(".sound_state")[0].checked = r.Sound.play;
      this.ui.find(".bgm_state")[0].checked = r.BGM.play;
    };
    k.onRemove = function () {
      q.x = parseInt(this.ui.css("left"), 10);
      q.y = parseInt(this.ui.css("top"), 10);
      q.save();
    };
    return p.addComponent(k);
  },
);
