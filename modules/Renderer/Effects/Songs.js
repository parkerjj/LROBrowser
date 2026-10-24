define("Renderer/Effects/Songs", [
  "exports",
  "Renderer/Effects/Tiles",
  "Renderer/Effects/FlatColorTile",
], function (a, b, c) {
  Object.defineProperty(a, "__esModule", { value: !0 });
  a.AppleEffects = void 0;
  a.BragiEffects = void 0;
  a.SinEffects = void 0;
  a.EvillandEffects = void 0;
  var d = c && c.__esModule ? c : { default: c };
  a.DissonanceEffects = [
    (0, d.default)("dissonance", { r: 1, g: 1, b: 1, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/lens_w.bmp", 0.5, 0.7),
  ];
  a.LullabyEffects = [
    (0, d.default)("lullaby", { r: 237 / 255, g: 158 / 255, b: 1, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/zz.bmp", 0.5, 0.7),
  ];
  a.MrKimEffects = [
    (0, d.default)("mrkim", {
      r: 252 / 255,
      g: 199 / 255,
      b: 199 / 255,
      a: 0.05,
    }),
    (0, b.HoveringTexture)("data/texture/effect/pocket.bmp", 0.5, 0.7),
  ];
  a.EtChaosEffects = [
    (0, d.default)("etchaos", { r: 128 / 255, g: 1, b: 194 / 255, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/lens_g.bmp", 0.5, 0.7),
  ];
  a.DrumEffects = [
    (0, d.default)("drum", {
      r: 237 / 255,
      g: 101 / 255,
      b: 252 / 255,
      a: 0.05,
    }),
    (0, b.HoveringTexture)("data/texture/effect/melody_b.bmp", 0.5, 0.7),
  ];
  a.NibelungEffects = [
    (0, d.default)("nibelung", { r: 28 / 255, g: 236 / 255, b: 1, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/twirl.bmp", 0.5, 0.7),
  ];
  a.LokiEffects = [
    (0, d.default)("loki", {
      r: 220 / 255,
      g: 101 / 255,
      b: 252 / 255,
      a: 0.05,
    }),
    (0, b.HoveringTexture)("data/texture/effect/safeline.bmp", 0.5, 0.7),
  ];
  a.AbyssEffects = function () {
    return [
      (0, d.default)("abyss", { r: 1, g: 1, b: 1, a: 0.05 }),
      (0, b.HoveringTexture)(
        "data/texture/effect/" +
          [
            "\u00b7\u00b9\u00b5\u00e5\u00c1\u00aa\u00bd\u00ba\u00c5\u00e6",
            "\u00bf\u00bb\u00b7\u00ce\u00bf\u00ec\u00c1\u00aa\u00bd\u00ba\u00c5\u00e6",
            "\u00ba\u00ed\u00b7\u00e7\u00c1\u00aa\u00bd\u00ba\u00c5\u00e6",
          ][Math.round(2 * Math.random())] +
          ".bmp",
        0.5,
        1,
      ),
    ];
  };
  a.SiegfiedEffects = [
    (0, d.default)("siegfried", { r: 72 / 255, g: 59 / 255, b: 1, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/lens_b.bmp", 0.5, 0.7),
  ];
  a.WhistleEffects = [
    (0, d.default)("whislte", { r: 1, g: 192 / 255, b: 203 / 255, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/melody_b.bmp", 0.5, 0.7),
  ];
  a.SinEffects = [
    (0, d.default)("sinsun", { r: 1, g: 0.8, b: 0.85, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/lens_r.bmp", 0.5, 0.7),
  ];
  a.BragiEffects = function () {
    return [
      (0, d.default)("bragi", { r: 0.9, g: 0.9, b: 1, a: 0.05 }),
      (0, b.HoveringTexture)(
        "data/texture/effect/spell_0" +
          (Math.round(7 * Math.random()) + 1) +
          ".bmp",
        0.5,
        0.7,
      ),
    ];
  };
  a.AppleEffects = [
    (0, d.default)("apple", { r: 1, g: 1, b: 0, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/idun_apple.bmp", 1, 0.7),
  ];
  a.UglyEffects = [
    (0, d.default)("ugly", { r: 1, g: 1, b: 1, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/lens_w.bmp", 0.5, 0.7),
  ];
  a.HummingEffects = [
    (0, d.default)("humming", {
      r: 230 / 255,
      g: 209 / 255,
      b: 209 / 255,
      a: 0.05,
    }),
    (0, b.HoveringTexture)("data/texture/effect/melody_a.bmp", 0.5, 0.7),
  ];
  a.ForgetEffects = [
    (0, d.default)("humming", { r: 28 / 255, g: 1, b: 115 / 255, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/lens_g.bmp", 0.5, 0.7),
  ];
  a.FortuneEffects = [
    (0, d.default)("fortune", {
      r: 252 / 255,
      g: 111 / 255,
      b: 101 / 255,
      a: 0.05,
    }),
    (0, b.HoveringTexture)("data/texture/effect/heart_2.bmp", 0.5, 0.7),
  ];
  a.ServiceEffects = [
    (0, d.default)("service", { r: 1, g: 128 / 255, b: 183 / 255, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/safeline.bmp", 0.5, 0.7),
  ];
  a.GospelEffects = [
    (0, d.default)("gospel", { r: 1, g: 1, b: 1, a: 0.05 }),
    (0, b.HoveringTexture)("data/texture/effect/cross_old.bmp", 0.5, 0.7),
  ];
  a.FogEffects = [
    (0, d.default)("fog", { r: 170 / 255, g: 170 / 255, b: 170 / 255, a: 0.6 }),
    (0, b.HoveringTexture)("data/texture/effect/lens_w.bmp", 0.5, 0.7),
  ];
  a.GravityEffects = [
    (0, d.default)("gravity", { r: 1, g: 1, b: 1, a: 0.2 }),
    (0, b.HoveringTexture)("data/texture/effect/lens_w.bmp", 0.5, 0.7),
  ];
  a.EvillandEffects = [
    (0, d.default)("gray", {
      r: 160 / 255,
      g: 160 / 255,
      b: 160 / 255,
      a: 0.2,
    }),
    (0, b.HoveringTexture)("data/texture/effect/curse.bmp", 1, 0.7),
  ];
});
