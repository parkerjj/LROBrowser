define("Audio/BGM", [
  "require",
  "Utils/jquery",
  "Core/Client",
  "Preferences/Audio",
], function (a, b, c, d) {
  var e = { stat: 0, position: null, filename: null };
  e.volume = d.BGM.volume;
  e.isPlaying = "false";
  e.audio = document.createElement("audio");
  e.useHTML5 = !1;
  e.extension = "mp3";
  e.isInit = !1;
  e.initFlash = function () {
    e.isInit ||
      ((window.BGM = e),
      (e.isInit = !0),
      (e.flash = b(
        [
          '\x3cobject type\x3d"application/x-shockwave-flash" data\x3d"' +
            a.toUrl("./mp3-player/mp3-player.swf") +
            '" width\x3d"0" height\x3d"0"\x3e',
          '\x3cparam name\x3d"AllowScriptAccess" value\x3d"always"/\x3e\n\x3cparam name\x3d"FlashVars" value\x3d"listener\x3dBGM\x26interval\x3d1000"/\x3e\n\x3c/object\x3e',
        ].join("\n"),
      ).appendTo("body")[0]),
      (e.onInit = function () {
        e.position = 0;
        e.filename && d.BGM.play && e.play(e.filename);
      }),
      (e.onUpdate = function () {
        "false" === e.isPlaying && e.filename && e.play(e.filename);
      }));
  };
  e.initHTML5 = function () {
    e.isInit ||
      ((e.isInit = !0),
      "boolean" === typeof e.audio.loop
        ? (e.audio.loop = !0)
        : e.audio.addEventListener(
            "ended",
            function () {
              e.audio.currentTime = 0;
              e.audio.play();
            },
            !1,
          ));
  };
  e.setAvailableExtensions = function (a) {
    var b,
      c,
      d = this.audio;
    this.useHTML5 = !1;
    if (d.canPlayType)
      for ((a && a.length) || (a = ["mp3"]), b = 0, c = a.length; b < c; ++b)
        if (d.canPlayType("audio/" + a[b]).replace(/no/i, "")) {
          this.extension = a[b];
          this.useHTML5 = !0;
          e.initHTML5();
          return;
        }
    e.initFlash();
  };
  e.play = function (a) {
    if (a) {
      a.match(/bgm/i) && (a = a.match(/\w+\.mp3/i).toString());
      if (this.filename === a) {
        if (
          (!this.useHTML5 && "true" == this.isPlaying) ||
          (this.useHTML5 && !this.audio.paused)
        )
          return;
      } else this.filename = a;
      (this.useHTML5 || null !== this.position) &&
        d.BGM.play &&
        c.loadFile("BGM/" + a, function (a) {
          e.load(a);
        });
    }
  };
  e.load = function (a) {
    d.BGM.play &&
      (!a.match(/^(blob|data)\:/) &&
        e.useHTML5 &&
        (a = a.replace(/mp3$/i, e.extension)),
      e.useHTML5
        ? ((e.audio.src = a), (e.audio.volume = this.volume), e.audio.play())
        : e.flash.SetVariable &&
          (e.flash.SetVariable("method:setUrl", a),
          e.flash.SetVariable("method:play", null),
          e.flash.SetVariable("enabled", "true")));
  };
  e.stop = function () {
    e.useHTML5
      ? e.audio.pause()
      : e.flash.SetVariable && e.flash.SetVariable("method:pause", null);
  };
  e.setVolume = function (a) {
    e.volume = a;
    d.BGM.volume = a;
    d.save();
    e.useHTML5
      ? (e.audio.volume = a)
      : e.flash.SetVariable && e.flash.SetVariable("method:setVolume", 100 * a);
  };
  return e;
});
