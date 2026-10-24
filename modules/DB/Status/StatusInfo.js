define("DB/Status/StatusInfo", ["./StatusConst"], function (a) {
  var b = {};
  b[a.BPOWER] = {
    icon: "rk_lux.tga",
    descript: [
      ["\u7535\u91cf", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u624b\u673a\u9053\u5177\u7535\u91cf\u663e\u793a"],
      ["\u81ea\u52a8\u6218\u6597\u6d88\u8017\u7535\u91cf"],
    ],
  };
  b[a.ON_PUSH_CART] = {
    descript: [["\u4f7f\u7528\u624b\u63a8\u8f66\u4e2d", "rgb(155, 202, 155)"]],
  };
  b[a.OVERTHRUSTMAX] = {
    icon: "i_\u00bf\u00c0\u00b9\u00f6\u00b8\u00c6\u00bd\u00ba.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6700\u5927\u4f24\u5bb3\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u6b66\u5668\u7684\u5a01\u529b"],
      ["\u589e\u52a0\u4e86\u6b66\u5668\u635f\u574f\u7684\u53ef\u80fd\u6027"],
    ],
  };
  b[a.SUFFRAGIUM] = {
    icon: "\u00bc\u00f6\u00c1\u00dd\u00c0\u00ba\u00c7\u00cf\u00b7\u00e7\u00c0\u00c7\u00bf\u00ec\u00bf\u00ef.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u727a\u7272\u7948\u798f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u7f29\u77ed\u548f\u5531\u65f6\u95f4"],
    ],
  };
  b[a.OVERTHRUST] = {
    icon: "\u00bf\u00c0\u00b9\u00f6\u00c6\u00ae\u00b7\u00af\u00bd\u00ba\u00c6\u00ae.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u51f6\u780d", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u6b66\u5668\u7684\u5a01\u529b"],
      ["\u589e\u52a0\u4e86\u6b66\u5668\u635f\u574f\u7684\u53ef\u80fd\u6027"],
    ],
  };
  b[a.AUTOBERSERK] = {
    icon: "\u00b1\u00dd\u00b0\u00ad\u00ba\u00d2\u00b1\u00ab.tga",
    descript: [
      ["\u72c2\u66b4\u72b6\u6001", "rgb(155, 202, 155)"],
      ["\u63a5\u8fd1\u6b7b\u4ea1\u65f6\u7684\u6124\u6012\u72b6\u6001"],
    ],
  };
  b[a.BEYOND_OF_WARCRY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8fdc\u53e4\u5450\u558a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u7269\u7406\u4f24\u5bb3"],
      ["\u51cf\u5c11\u9b54\u6cd5\u4f24\u5bb3"],
    ],
  };
  b[a.SWORDREJECT] = {
    icon: "icon04.tga",
    descript: [
      ["\u9738\u738b\u9b42", "rgb(155, 202, 155)"],
      ["\u5bf9\u73a9\u5bb6\u5251\u7cfb\u6b66\u5668\u7684\u653b\u51fb"],
      ["(\u5bf9\u9b54\u7269\u7684\u6240\u6709\u653b\u51fb)"],
      ["\u6709\u673a\u7387\u53d7\u5230\u4f24\u5bb31/2"],
      ["\u5269\u4e0b\u7684\u4f24\u5bb3\u53cd\u5c04\u7ed9\u5bf9\u65b9"],
    ],
  };
  b[a.MANU_DEF] = {
    icon: "efst_def.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u6012\u514b\u7684\u610f\u5fd7", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4e8e\u9b54\u6012\u514b\u539f\u91ce\u906d\u53d7\u602a\u7269\u7684"],
      ["\u7269\u7406,\u9b54\u6cd5\u4f24\u5bb3\u964d\u4f4e"],
    ],
  };
  b[a.CONCENTRATION] = {
    icon: "\u00c1\u00fd\u00c1\u00df\u00b7\u00c2\u00c7\u00e2\u00bb\u00f3.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5fc3\u795e\u51dd\u805a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0DEX\u548cAGI"],
    ],
  };
  b[a.GRIFFON] = {
    icon: "\u00b6\u00f3\u00c0\u00cc\u00b5\u00f9.tga",
    descript: [["\u72ee\u9e6b\u517d\u642d\u4e58\u4e2d", "rgb(190, 190, 250)"]],
  };
  b[a.GS_MADNESSCANCEL] = {
    icon: "i_madness.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u75af\u72c2\u51ef\u65af\u4e50", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0ATK"],
      ["\u63d0\u9ad8\u653b\u51fb\u901f\u5ea6"],
      ["\u65e0\u6cd5\u79fb\u52a8"],
    ],
  };
  b[a.GS_ACCURACY] = {
    icon: "i_accuracy",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u547d\u4e2d\u7387\u9012\u589e", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u547d\u4e2d\u7387\u589e\u52a0"],
      ["DEX\u589e\u52a0"],
      ["AGI\u589e\u52a0"],
    ],
  };
  b[a.FOOD_STR] = {
    icon: "str_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["STR\u63d0\u5347"]],
  };
  b[a.HALLUCINATIONWALK] = {
    icon: "\u00c7\u00d2\u00b7\u00e7\u00bd\u00c3\u00b3\u00d7\u00c0\u00cc\u00bc\u00c7\u00bf\u00f6\u00c5\u00a9.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5e7b\u5f71\u6b65", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u56de\u907f\u7387\u63d0\u5347"],
      [
        "\u6709\u4e00\u5b9a\u51e0\u7387\u4e0d\u7406\u4f1a\u9b54\u6cd5\u4f24\u5bb3",
      ],
    ],
  };
  b[a.STORMKICK_ON] = {
    icon: "i_stormkick.tga",
    descript: [
      ["\u56de\u65cb\u51c6\u5907", "rgb(155, 202, 155)"],
      [
        "\u670915%\u7684\u673a\u7387\u505a\u56de\u65cb\u51c6\u5907\u7684\u59ff\u6001",
      ],
    ],
  };
  b[a.KAUPE] = {
    icon: "i_kaupe.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u51ef\u8bec\u4ec6", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4f9d\u51e0\u7387\u56de\u907f\u654c\u4eba\u7684\u653b\u51fb"],
    ],
  };
  b[a.SHIELDSPELL_DEF] = {
    icon: "lg_shieldspell_\u89c4.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u76fe\u5492-\u9632", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4f9d\u76fe\u724c\u9632\u5fa1\u5ea6\u800c\u53d1\u52a8\u9b54\u6cd5"],
    ],
  };
  b[a.WARMER] = {
    icon: "\u00bf\u00f6\u00b8\u00d3.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6696\u98ce", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u89e3\u9664\u51b7\u51bb,\u51b0\u51bb,\u7ed3\u51b0\u72b6\u6001"],
      ["\u4e0d\u4f1a\u4e2d\u51b7\u51bb,\u51b0\u51bb,\u7ed3\u51b0"],
      ["\u6bcf3\u79d2\u53ef\u6062\u590d\u4e00\u5b9a\u91cf\u7684HP"],
    ],
  };
  b[a.CURSEDCIRCLE_ATKER] = {
    icon: "\u00bf\u00f6\u00b8\u00d3.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5492\u7f1a\u9635", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u79fb\u52a8\u8303\u56f4\u5185\u6240\u6709\u654c\u4eba\u65e0\u6cd5\u653b\u51fb",
      ],
      ["\u72b6\u6001\u5f02\u5e38\u6c89\u9ed8\u8ffd\u52a0"],
    ],
  };
  b[a.PROTECT_MDEF] = {
    icon: "\u00b8\u00b6\u00b9\u00fd\u00b9\u00e6\u00be\u00ee\u00c6\u00f7\u00bc\u00c7.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u6cd5\u9632\u5fa1\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9b54\u6cd5\u653b\u51fb\u8010\u6027\u589e\u52a0"],
    ],
  };
  b[a.STAR_COMFORT] = {
    icon: "i_starcomfort.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u661f\u661f\u7684\u5e73\u5b89\u611f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u901f\u5ea6\u63d0\u5347"],
    ],
  };
  b[a.FOOD_CRITICALSUCCESSVALUE] = {
    icon: "gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u5fc5\u6740\u653b\u51fb\u7387\u63d0\u5347"],
    ],
  };
  b[a.PROPERTYTELEKINESIS] = {
    icon: "i_p_tele.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["\u5ff5\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8d4b\u4e88\u6b66\u5668\u5ff5\u5c5e\u6027"],
    ],
  };
  b[a.GLOOMYDAY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7f9e\u602f\u4e00\u5929\u7684\u5fe7\u90c1", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u56fa\u5b9a\u548f\u5531\u589e\u52a0, SP\u6d88\u8017\u589e\u52a0"],
      ["\u56de\u907f\u7387\u548c\u653b\u901f\u51cf\u5c11"],
    ],
  };
  b[a.SIRCLEOFNATURE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u5faa\u73af\u7684\u5927\u81ea\u7136\u4e4b\u97f3",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["HP\u81ea\u7136\u6062\u590d\u529b\u589e\u52a0"],
    ],
  };
  b[a.DEADLYINFECT] = {
    icon: "\u00b5\u00a5\u00b5\u00e9\u00b8\u00ae\u00c0\u00ce\u00c6\u00e5\u00c6\u00ae.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u81f4\u547d\u611f\u67d3", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u81ea\u5df1\u53bb\u653b\u51fb\u6216"],
      ["\u6765\u653b\u51fb\u81ea\u5df1\u7684\u654c\u4eba"],
      ["\u4f20\u67d3\u6240\u6709\u7684\u5f02\u5e38\u72b6\u6001"],
    ],
  };
  b[a.SYMPHONY_LOVE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u604b\u4eba\u4ea4\u54cd\u4e50", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9b54\u6cd5\u9632\u5fa1\u7387\u4e0a\u5347"],
    ],
  };
  b[a.BANDING] = {
    icon: "lg_banding.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u805a\u96c6", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u805a\u96c6\u72b6\u6001"],
    ],
  };
  b[a.NJ_BUNSINJYUTSU] = {
    icon: "i_bunsin.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5e7b\u5f71\u5206\u8eab", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u53ef\u56de\u907f\u4e00\u5b9a\u6b21\u6570\u7684\u8fd1\u8ddd\u79bb,\u8fdc\u8ddd\u79bb\u7269\u7406\u653b\u51fb",
      ],
      ["\u4e0d\u53ef\u9632\u5fa1\u9b54\u6cd5\u653b\u51fb"],
    ],
  };
  b[a.WUGRIDER] = {
    icon: "wolfmount.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9a91\u72fc\u672f(WUG RIDER)", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4e0d\u53ef\u4f7f\u7528\u5f13"],
      ["\u9650\u4f7f\u7528\u72fc\u4e13\u5c5e\u6280\u80fd"],
    ],
  };
  b[a.ATKER_BLOOD] = {
    icon: "sp\u5bb6\u845b\u6a0a\u7691\u5bb6\u5668\u8bb0.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["SP\u6d88\u8017\u91cf\u51cf\u5c11\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4f7f\u7528\u6280\u80fd\u65f6SP\u6d88\u8017\u91cf\u964d\u4f4e"],
    ],
  };
  b[a.BODYPAINT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4eba\u4f53\u5f69\u7ed8", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u89e3\u9664\u4f2a\u88c5\u72b6\u6001"],
      ["\u4f9d\u51e0\u7387\u4f1a\u53d1\u751f\u9ed1\u6697"],
      ["\u4f9d\u51e0\u7387\u653b\u51fb\u901f\u5ea6\u964d\u4f4e"],
    ],
  };
  b[a.NJ_UTSUSEMI] = {
    icon: "i_MAEMI.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u91d1\u8749\u8131\u58f3", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u53ef\u56de\u907f\u4e00\u5b9a\u6b21\u6570\u7684\u653b\u51fb"],
      ["\u671d\u653b\u51fb\u8005\u7684\u53cd\u65b9\u5411\u79fb\u52a8"],
    ],
  };
  b[a.POISONINGWEAPON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5267\u6bd2\u6b66\u5668", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8fd1\u8ddd\u79bb\u7269\u7406\u4f24\u5bb3\u589e\u52a0"],
      ["\u6839\u636e\u8d4b\u4e88\u7684\u6bd2\u8d4b\u4e88buff"],
      ["\u653b\u51fb\u65f6\u8ba9\u5bf9\u65b9\u4e2d\u6240\u6d82\u7684\u6bd2"],
    ],
  };
  b[a.CASH_DEATHPENALTY] = {
    icon: "death.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u6b7b\u4ea1\u65f6\u7ecf\u9a8c\u503c\u4e0d\u4f1a\u635f\u5931"],
    ],
  };
  b[a.GS_ADJUSTMENT] = {
    icon: "i_adjustment.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u81ea\u52a8\u8c03\u6574", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u51cf\u5c11\u547d\u4e2d"],
      ["\u63d0\u9ad8\u56de\u907f\u7387"],
      ["\u51cf\u5c11\u8fdc\u7a0b\u7269\u7406\u653b\u51fb\u7684\u4f24\u5bb3"],
    ],
  };
  b[a.AUTOSPELL] = {
    icon: "\u00bf\u00c0\u00c5\u00e4\u00bd\u00ba\u00c6\u00e7.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u81ea\u52a8\u5ff5\u5492", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5f53\u8fdb\u884c\u7269\u7406\u653b\u51fb\u65f6\u5019"],
      [
        "\u4e0d\u9700\u65bd\u6cd5\u65f6\u95f4\u4fbf\u53ef\u81ea\u52a8\u65bd\u5492.",
      ],
      [
        "\u4f7f\u7528\u7684\u8be5\u9879\u6280\u80fd\u53ea\u4f1a\u6d88\u8017\u4e00\u822c\u4f7f\u7528\u65f6\u7684 2/3SP\u6d88\u8017\u91cf",
      ],
    ],
  };
  b[a.DEC_AGI] = {
    icon: "\u00b9\u00ce\u00c3\u00b8\u00bc\u00ba\u00b0\u00a8\u00bc\u00d2.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7f13\u901f\u672f", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u51cf\u5c11\u79fb\u52a8\u901f\u5ea6"],
      ["\u964d\u4f4e\u653b\u51fb\u901f\u5ea6"],
    ],
  };
  b[a.NOEQUIPWEAPON] = {
    icon: "\u00bd\u00ba\u00c6\u00ae\u00b8\u00b3\u00bf\u00fe\u00c6\u00f9.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5378\u9664\u6b66\u5668", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u6cd5\u88c5\u7f6e\u6b66\u5668"],
    ],
  };
  b[a.SHIELDSPELL_MDEF] = {
    icon: "lg_shieldspell_\u4ed8.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u76fe\u5492-\u9b54", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4f9d\u76fe\u724c\u9b54\u6cd5\u9632\u5fa1\u503c\u800c\u53d1\u52a8\u9b54\u6cd5",
      ],
    ],
  };
  b[a.AUTOGUARD] = {
    icon: "\u00bf\u00c0\u00c5\u00e4\u00b0\u00a1\u00b5\u00e5.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u81ea\u52a8\u9632\u5fa1", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6709\u4e00\u5b9a\u673a\u7387\u9632\u5fa1\u7269\u7406\u653b\u51fb"],
    ],
  };
  b[a.TAROTCARD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u547d\u8fd0\u7684\u5854\u7f57\u724c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5bf9\u654c\u4eba\u8d4b\u4e8814\u79cd\u5361\u7247\u4e4b\u4e00\u7684\u6548\u679c",
      ],
    ],
  };
  b[a.FEARBREEZE] = {
    icon: "RA_FEARBREEZE.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5fae\u98ce\u6050\u60e7", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5f13\u653b\u51fb\u65f6\u4f9d\u51e0\u7387"],
      ["\u989d\u5916\u53d1\u52a8\u653b\u51fb"],
    ],
  };
  b[a.GN_CARTBOOST] = {
    icon: "Onpushcart.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u624b\u63a8\u8f66\u52a0\u901f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u9ad8\u79fb\u52a8\u901f\u5ea6"],
    ],
  };
  b[a.SHIELDSPELL_REF] = {
    icon: "lg_shieldspell_\u6977.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u76fe\u5492-\u70bc", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4f9d\u76fe\u724c\u7cbe\u7ec3\u503c\u800c\u53d1\u52a8\u9b54\u6cd5"],
    ],
  };
  b[a.FOOD_INT_CASH] = {
    icon: "int_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0INT"]],
  };
  b[a.NOEQUIPSHIELD] = {
    icon: "\u00bd\u00ba\u00c6\u00ae\u00b8\u00b3\u00bd\u00af\u00b5\u00e5.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5378\u9664\u76fe\u724c", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4e0d\u53ef\u88c5\u7f6e\u76fe\u724c"],
    ],
  };
  b[a.QUAGMIRE] = {
    icon: "\u00c4\u00e2\u00b1\u00d7\u00b8\u00b6\u00c0\u00cc\u00be\u00ee.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6ce5\u6cbc\u5730", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u964d\u4f4e\u79fb\u52a8\u901f\u5ea6"],
      ["\u51cf\u5c11AGI\u548cDEX"],
    ],
  };
  b[a.KAIZEL] = {
    icon: "i_kaizel.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u51ef\u6613\u54f2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u548f\u5531\u65f6\u95f4\u4e0d\u4f1a\u53d7DEX\u7684\u5f71\u54cd"],
      ["\u6b7b\u4ea1\u65f6\u7acb\u5373\u590d\u6d3b,\u7ef4\u63012\u79d2"],
    ],
  };
  b[a.CR_SHRINK] = {
    icon: "i_shrink.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9000\u7f29", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5f53\u89e6\u53d1\u81ea\u52a8\u9632\u5fa1\u65f6"],
      ["\u4e00\u5b9a\u673a\u7387\u51fb\u628a\u654c\u4eba\u51fb\u90002\u683c"],
    ],
  };
  b[a.FOOD_VIT] = {
    icon: "vit_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0VIT"]],
  };
  b[a.PARRYING] = {
    icon: "icon10.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u53cc\u5251\u683c\u6321", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4f9d\u673a\u7387\u4ee5\u5200\u6765\u963b\u6321\u5bf9\u65b9\u7684\u653b\u51fb",
      ],
    ],
  };
  b[a.PROTECTWEAPON] = {
    icon: "\u00c4\u00c9\u00b9\u00cc\u00c4\u00c3\u00c7\u00c1\u00b7\u00ce\u00c5\u00d8\u00bc\u00c7[\u00bf\u00fe\u00c6\u00f9].tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5316\u5b66\u6b66\u5668\u4fdd\u62a4", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u6b66\u5668\u53d8\u6210\u4e0d\u4f1a\u53d7\u5230\u635f\u574f\u7684\u72b6\u6001",
      ],
    ],
  };
  b[a.FOOD_AGI] = {
    icon: "agi_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0AGI"]],
  };
  b[a.INC_AGI] = {
    icon: "\u00b9\u00ce\u00c3\u00b8\u00bc\u00ba\u00c1\u00f5\u00b0\u00a1.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u52a0\u901f\u672f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u9ad8\u79fb\u52a8\u901f\u5ea6"],
      ["\u63d0\u9ad8\u653b\u51fb\u901f\u5ea6"],
    ],
  };
  b[a.SHOUT] = {
    icon: "\u00b0\u00ed\u00bc\u00ba\u00c1\u00f6\u00b8\u00a3\u00b1\u00e2.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5927\u58f0\u5450\u558a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0STR\u5c5e\u60274\u70b9"],
    ],
  };
  b[a.CASH_RECEIVEITEM] = {
    icon: "item.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u6d88\u706d\u9b54\u7269\u65f6"],
      ["\u7269\u54c1\u7684\u6389\u7387\u53d8\u66f4\u4e3a\u4e24\u500d"],
    ],
  };
  b[a.SPL_DEF] = {
    icon: "EFST_DEF.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9c81\u4fee\u62c9\u7684\u871c\u9171", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u906d\u53d7\u53f2\u6ce2\u6d6a\u58ee\u4e3d\u539f\u91ce\u602a\u7269\u7684",
      ],
      ["\u7269\u7406,\u9b54\u6cd5\u4f24\u5bb3\u4f1a\u964d\u4f4e"],
    ],
  };
  b[a.ILLUSION] = {
    icon: "\u00c8\u00af\u00b0\u00a2.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5e7b\u89c9", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4f24\u5bb3\u663e\u793a\u5f02\u5e38"],
      ["\u56e0\u50f5\u786c\u800c\u4e2d\u65ad\u5ff5\u5492"],
    ],
  };
  b[a.HOVERING] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u60ac\u505c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4e0d\u53d7\u9677\u9631\u6216\u90e8\u5206\u5730\u9762\u76ee\u6807\u9b54\u6cd5\u7684\u6548\u679c",
      ],
    ],
  };
  b[a.BENEDICTIO] = {
    icon: "\u00bc\u00ba\u00c3\u00bc\u00b0\u00ad\u00ba\u00b9.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u8d4b\u4e88\u9632\u5177\u5723\u5c5e\u6027"],
    ],
  };
  b[a.WEAPONBLOCKING] = {
    icon: "\u00bf\u00fe\u00c6\u00f9\u00ba\u00ed\u00b7\u00ce\u00c5\u00b7.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6b66\u5668\u62b5\u5fa1", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u906d\u53d7\u8fd1\u8eab\u7269\u7406\u653b\u51fb\u65f6"],
      ["\u4f9d\u51e0\u7387\u4f24\u5bb3\u5b8c\u5168\u65e0\u6548"],
    ],
  };
  b[a.ANGELUS] = {
    icon: "\u00be\u00c8\u00c1\u00a9\u00b7\u00e7\u00bd\u00ba.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5929\u4f7f\u4e4b\u969c\u58c1", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0VIT\u548cDEF"],
    ],
  };
  b[a.MARSHOFABYSS] = {
    icon: "MARSHOFABYSS.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6df1\u6e0a\u6cbc\u5730", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u79fb\u52a8\u901f\u5ea6\u964d\u4f4e"],
      ["\u9632\u5fa1\u7387,\u56de\u907f\u7387\u964d\u4f4e"],
    ],
  };
  b[a.STEALTHFIELD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9690\u5f62\u529b\u573a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5c06\u5468\u56f4\u7684\u5168\u90e8\u76ee\u6807\u53d8\u6210\u4f2a\u88c5\u72b6\u6001",
      ],
      ["\u4f1a\u6301\u7eed\u9500\u8017SP"],
      ["\u79fb\u52a8\u901f\u5ea6\u964d\u4f4e"],
    ],
  };
  b[a.ADRENALINE2] = {
    icon: "\u00be\u00c6\u00b5\u00e5\u00b7\u00b9\u00b3\u00af\u00b8\u00b0\u00b7\u00af\u00bd\u00ac.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6240\u6709\u901f\u5ea6\u6fc0\u53d1", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5f13\u4ee5\u5916\u7684\u6b66\u5668\u653b\u51fb\u901f\u5ea6\u589e\u52a0",
      ],
    ],
  };
  b[a.MANU_MATK] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u6012\u514b\u7684\u4fe1\u5ff5", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5bf9\u9b54\u6012\u514b\u539f\u91ce\u5730\u533a\u7684\u602a\u7269"],
      ["\u9b54\u6cd5\u653b\u51fb\u4f24\u5bb3\u4f1a\u589e\u52a0"],
    ],
  };
  b[a.NOEQUIPARMOR] = {
    icon: "\u00bd\u00ba\u00c6\u00ae\u00b8\u00b3\u00be\u00c6\u00b8\u00d3.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5378\u9664\u94e0\u7532", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u6cd5\u88c5\u7f6e\u94e0\u7532"],
    ],
  };
  b[a.HIDING] = {
    icon: "\u00c7\u00cf\u00c0\u00cc\u00b5\u00f9.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9690\u533f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u8eb2\u907f\u654c\u4eba\u7684\u653b\u51fb\u9690\u85cf\u5728\u5730\u4e0b",
      ],
      ["\u53ef\u88ab\u4fa6\u67e5\u6280\u80fd\u53d1\u73b0"],
    ],
  };
  b[a.WEIGHTOVER50] = {
    icon: "\u00b9\u00ab\u00b0\u00d450\u00c0\u00cc\u00bb\u00f3.tga",
    descript: [
      ["\u8d1f\u91cd\u8d85\u8fc750%", "rgb(250, 100, 100)"],
      ["\u4e0d\u4f1a\u6062\u590d\u8840\u91cf\u548c\u6c14\u91cf"],
    ],
  };
  b[a.STRUP] = {
    icon: "i_RUN.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u51b2\u523a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["STR\u589e\u52a0"],
      ["\u6b66\u5668\u672a\u88c5\u7f6e\u65f6"],
      ["\u4f9d\u8dd1\u6b65\u7b49\u7ea7\u800c\u589e\u52a0\u653b\u51fb\u529b"],
    ],
  };
  b[a.NOEQUIPHELM] = {
    icon: "\u00bd\u00ba\u00c6\u00ae\u00b8\u00b3\u00c7\u00ef\u00b8\u00a7.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5378\u9664\u5934\u76d4", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4e0d\u53ef\u88c5\u7f6e\u5934\u76d4"],
    ],
  };
  b[a.ATTHASTE_POTION3] = {
    icon: "\u00b0\u00f8\u00bc\u00d3\u00b9\u00b0\u00be\u00e0.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["\u83e0\u8272\u514b\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u9ad8\u653b\u51fb\u901f\u5ea6"],
    ],
  };
  b[a.ENDURE] = {
    icon: "\u00c0\u00ce\u00b5\u00e0\u00be\u00ee.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9738\u4f53", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u88ab\u653b\u51fb\u4e0d\u4f1a\u6709\u6240\u505c\u987f"],
    ],
  };
  b[a.TURNKICK_ON] = {
    icon: "i_turnkick.tga",
    descript: [
      ["\u8e22\u51c6\u5907", "rgb(155, 202, 155)"],
      ["\u670915%\u7684\u673a\u7387\u505a\u8e22\u51c6\u5907\u7684\u59ff\u6001"],
    ],
  };
  b[a.ENCHANTPOISON] = {
    icon: "\u00c0\u00ce\u00c2\u00f9\u00c6\u00ae\u00c6\u00f7\u00c0\u00cc\u00c1\u00f0.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6d82\u6bd2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9644\u9b54\u6b66\u5668\u6bd2\u5c5e\u6027"],
    ],
  };
  b[a.SPL_ATK] = {
    icon: "EFST_ATK.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6355\u866b\u5807\u5996\u679c\u9171", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5bf9\u53f2\u6ce2\u6d6a\u58ee\u4e3d\u539f\u91ce\u7684\u602a\u7269"],
      ["\u589e\u52a0\u653b\u51fb\u4f24\u5bb3"],
    ],
  };
  b[a.BLESSING] = {
    icon: "\u00ba\u00ed\u00b7\u00b9\u00bd\u00cc.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5929\u4f7f\u4e4b\u8d50\u798f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0DEX\u3001INT\u548cSTR"],
      ["\u6062\u590d\u5f02\u5e38\u72b6\u6001"],
    ],
  };
  b[a.ONEHANDQUICKEN] = {
    icon: "i_onehand.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u5355\u624b\u5251\u653b\u51fb\u901f\u5ea6\u589e\u52a0",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4f7f\u7528\u5355\u624b\u5251\u65f6\u589e\u52a0\u653b\u51fb\u901f\u5ea6",
      ],
    ],
  };
  b[a.SPEARQUICKEN] = {
    icon: "\u00bd\u00ba\u00c7\u00c7\u00be\u00ee\u00c4\u00fb\u00c5\u00ab.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u957f\u77db\u52a0\u901f\u672f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u9ad8\u653b\u51fb\u901f\u5ea6"],
      ["\u589e\u52a0\u56de\u907f"],
    ],
  };
  b[a.BROKENWEAPON] = {
    icon: "\u00b9\u00ab\u00b1\u00e2\u00c6\u00c4\u00b1\u00ab.tga",
    descript: [["\u6b66\u5668\u7834\u574f", "rgb(250, 100, 100)"]],
  };
  b[a.ASSUMPTIO] = {
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    icon: "icon05.tga",
    descript: [
      ["\u5723\u6bcd\u4e4b\u7948\u798f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u9632\u5fa1\u529b\u5728\u4e00\u5b9a\u65f6\u95f4\u5185\u589e\u52a0100%",
      ],
    ],
  };
  b[a.MAXIMIZE] = {
    icon: "\u00b8\u00c6\u00bd\u00c3\u00b8\u00b6\u00c0\u00cc\u00c1\u00ee\u00c6\u00c4\u00bf\u00f6.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6b66\u5668\u503c\u6700\u5927\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u53ef\u4f7f\u6b66\u5668\u53d1\u6325\u6700\u5927\u7684\u529f\u6548"],
      ["\u4f7f\u7528\u65f6\u4f1a\u6301\u7eed\u6d88\u8017SP"],
    ],
  };
  b[a.MELTDOWN] = {
    icon: "icon03.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u91ce\u86ee\u51f6\u780d", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5f53\u653b\u51fb\u73a9\u5bb6\u65f6\u6709\u4e00\u5b9a\u7684\u51e0\u7387\u7834\u574f\u73a9\u5bb6\u7684\u6b66\u5668\u6216\u9632\u5177",
      ],
      [
        "\u5f53\u653b\u51fb\u9b54\u7269\u65f6\u6709\u4e00\u5b9a\u7684\u51e0\u7387\u964d\u4f4e\u9b54\u7269\u7684\u653b\u51fb\u529b\u6216\u9632\u5fa1",
      ],
    ],
  };
  b[a.CARTBOOST] = {
    icon: "icon07.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u624b\u63a8\u8f66\u52a0\u901f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4f7f\u7528\u624b\u63a8\u8f66\u65f6\u79fb\u52a8\u901f\u5ea6\u589e\u52a0",
      ],
    ],
  };
  b[a.PROTECTSHIELD] = {
    icon: "\u00c4\u00c9\u00b9\u00cc\u00c4\u00c3\u00c7\u00c1\u00b7\u00ce\u00c5\u00d8\u00bc\u00c7[\u00bd\u00af\u00b5\u00e5].tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5316\u5b66\u76fe\u724c\u4fdd\u62a4", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u76fe\u724c\u53d8\u6210\u4e0d\u4f1a\u53d7\u5230\u635f\u574f\u7684\u72b6\u6001",
      ],
    ],
  };
  b[a.MAGNIFICAT] = {
    icon: "\u00b8\u00b6\u00b4\u00cf\u00c7\u00c7\u00c4\u00b1.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5723\u6bcd\u4e4b\u9882\u6b4c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["SP\u6062\u590d\u901f\u5ea6\u589e\u5feb\u4e24\u500d"],
    ],
  };
  b[a.ATTHASTE_POTION1] = {
    icon: "\u00b0\u00f8\u00bc\u00d3\u00b9\u00b0\u00be\u00e0.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u96c6\u4e2d\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u9ad8\u653b\u51fb\u901f\u5ea6"],
    ],
  };
  b[a.POISONREACT] = {
    icon: "\u00c6\u00f7\u00c0\u00cc\u00c1\u00f0\u00b8\u00ae\u00be\u00d7\u00c6\u00ae.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6bd2\u6027\u53cd\u5f39", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u53cd\u5c04\u6bd2\u5c5e\u6027\u7684\u653b\u51fb"],
      ["\u906d\u53d7\u4e00\u822c\u653b\u51fb\u7684\u4f24\u5bb3\u65f6"],
      ["\u5411\u5bf9\u65b9\u4f7f\u7528\u65bd\u6bd2\u6280"],
    ],
  };
  b[a.MOVHASTE_HORSE] = {
    icon: "i_bunsin.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["\u9a6c\u724c\u6548\u679c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u9ad8\u79fb\u52a8\u901f\u5ea6"],
    ],
  };
  b[a.CRESCENTELBOW] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7834\u788e\u67f1", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4f7f\u76ee\u6807\u5012\u9000\u5e76\u9020\u6210\u4f24\u5bb3"],
      ["\u800c\u81ea\u5df1\u4e5f\u4f1a\u906d\u53d7\u90e8\u5206\u4f24\u5bb3"],
    ],
  };
  b[a.SONG_OF_MANA] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u529b\u4e4b\u6b4c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["SP\u81ea\u7136\u6062\u590d\u91cf\u589e\u52a0"],
    ],
  };
  b[a.KAAHI] = {
    icon: "i_kaahi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u51ef\u963f\u5e0c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u906d\u53d7\u6280\u80fd\u4ee5\u5916\u7684\u653b\u51fb\u65f6"],
      ["\u6d88\u8017SP\u6765\u6062\u590dHP"],
    ],
  };
  b[a.ECHOSONG] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u56de\u97f3\u4e4b\u6b4c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9632\u5fa1\u7387\u589e\u52a0"],
    ],
  };
  b[a.PRESERVE] = {
    icon: "i_\u00c7\u00c1\u00b8\u00ae\u00c0\u00fa\u00ba\u00ea.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u81ea\u7531\u4fdd\u62a4", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4fdd\u62a4\u6284\u88ad\u6280\u80fd\u4e0d\u88ab\u6539\u53d8"],
    ],
  };
  b[a.WEAPONPERFECT] = {
    icon: "\u00bf\u00fe\u00c6\u00f9\u00c6\u00db\u00c6\u00e5\u00bc\u00c7.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u65e0\u89c6\u4f53\u578b\u653b\u51fb", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4ee5100%\u7684\u529b\u91cf"],
      ["\u653b\u51fb\u4efb\u4f55\u4f53\u578b\u7684\u602a\u7269"],
    ],
  };
  b[a.PROVOKE] = {
    icon: "\u00c7\u00c1\u00b7\u00ce\u00ba\u00b8\u00c5\u00a9.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6311\u8845", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9632\u5fa1\u7387\u4e0b\u964d"],
      ["\u653b\u51fb\u529b\u589e\u52a0"],
    ],
  };
  b[a.MOVHASTE_POTION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u79fb\u52a8\u901f\u5ea6\u589e\u52a0"],
    ],
  };
  b[a.EDP] = {
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    icon: "i_edp.tga",
    descript: [
      ["\u81f4\u547d\u6d82\u6bd2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u628a\u5f3a\u70c8\u7684\u6bd2\u9644\u4e8e\u5728\u6b66\u5668\u4e0a"],
      ["\u5bf9Boss\u7ea7\u9b54\u7269\u589e\u52a0\u7684\u4f24\u5bb3\u529b"],
    ],
  };
  b[a.JOINTBEAT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5de7\u6253", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4f9d\u53d7\u635f\u7684\u5173\u8282"],
      ["\u6709\u4ee5\u4e0b\u72b6\u6001"],
    ],
  };
  b[a.PROVIDENCE] = {
    icon: "\u00bd\u00c5\u00c0\u00c7\u00b6\u00e6.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u795e\u4f51\u4e4b\u5149", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5bf9\u6076\u9b54\u7cfb,\u5723\u5c5e\u6027\u602a\u7269\u7684"],
      ["\u8010\u6027\u589e\u52a0"],
    ],
  };
  b[a.FIGHTINGSPIRIT] = {
    icon: "RK_EISIR.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u827e\u4f0a\u74e6\u5179\u7b26\u6587\u77f3\uff1a\u63d0\u5347\u6597\u5fd7",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK\u589e\u52a0"],
      ["\u653b\u901f\u589e\u52a0"],
    ],
  };
  b[a.FOOD_VIT_CASH] = {
    icon: "vit_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0VIT"]],
  };
  b[a.SATURDAY_NIGHT_FEVER] = {
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["\u75af\u72c2", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf3\u79d2HP, SP\u635f\u5931"],
      ["HIT, FLEE \u51cf\u5c11\u3002"],
      ["\u65e0\u6cd5\u4f7f\u7528\u9053\u5177"],
    ],
  };
  b[a.TRUESIGHT] = {
    icon: "icon09.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u72d9\u6740\u7784\u51c6", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5168\u90e8\u7d20\u8d28\u589e\u52a0"],
      [
        "\u547d\u4e2d\u7387,\u4f24\u5bb3,\u5fc5\u6740\u653b\u51fb\u529b\u589e\u52a0",
      ],
    ],
  };
  b[a.CASH_PLUSONLYJOBEXP] = {
    icon: "job.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u51fb\u6740\u9b54\u7269\u65f6\u53ef\u989d\u5916\u83b7\u5f97JOB\u7ecf\u9a8c\u503c",
      ],
    ],
  };
  b[a.ARMOR_PROPERTY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5c5e\u6027\u53d8\u5316\u5377\u8f74", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5c5e\u6027\u53d8\u5316\u72b6\u6001"],
    ],
  };
  b[a.TENSIONRELAX] = {
    icon: "ICON08.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6781\u901f\u56de\u590d", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["HP\u6062\u590d\u901f\u5ea6\u63d0\u5347"],
    ],
  };
  b[a.DEATHHURT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6c61\u67d3\u4e4b\u6bd2", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u906d\u53d7\u6062\u590d\u6280\u80fd\u65f6\u6548\u679c\u964d\u4f4e"],
    ],
  };
  b[a.IMPOSITIO] = {
    icon: "\u00c0\u00d3\u00c6\u00f7\u00bd\u00c3\u00c6\u00bc\u00bf\u00c0\u00b8\u00b6\u00b4\u00a9\u00bd\u00ba.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u795e\u5a01\u7948\u798f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u6b66\u5668\u7684\u5a01\u529b"],
    ],
  };
  b[a.LEECHESEND] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5438\u8840\u4e4b\u6bd2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf\u79d2\u6d88\u8017HP"],
    ],
  };
  b[a.REPRODUCE] = {
    icon: "\u00b8\u00ae\u00c7\u00c1\u00b7\u00ce\u00b5\u00e0\u00bd\u00ba.tga",
    descript: [
      ["\u590d\u5236", "rgb(155, 202, 155)"],
      [
        "\u6fc0\u6d3b\u65f6\u53ef\u5b66\u4e60\u4ee5\u81ea\u5df1\u4e3a\u76ee\u6807\u7684\u6280\u80fd",
      ],
      ["\u53ef\u5b66\u4e60\u7684\u6280\u80fd\u53ea\u67091\u4e2a"],
    ],
  };
  b[a.ACCELERATION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u5bfc\u673a\u7532\u52a0\u901f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9b54\u5bfc\u673a\u7532\u7684\u79fb\u52a8\u901f\u5ea6\u589e\u52a0"],
    ],
  };
  b[a.NJ_NEN] = {
    icon: "i_nen.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5ff5", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u667a\u529b\u4e0e\u529b\u91cf\u589e\u52a0"],
    ],
  };
  b[a.FORCEOFVANGUARD] = {
    icon: "efst_guardian_s.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5148\u950b\u4e4b\u529b", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MHP,\u9632\u5fa1\u7387\u589e\u52a0"],
      [
        "\u6bcf\u6b21\u906d\u53d7\u4f24\u5bb3\u65f6\u4f1a\u7d2f\u8ba1\u6124\u6012\u6b21\u6570",
      ],
      ["\u6fc0\u6d3b\u65f6\u6301\u7eed\u6d88\u8017SP"],
    ],
  };
  b[a.RG_CCONFINE_M] = {
    icon: "i_closeconfine.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7d27\u5bc6\u7684\u7ea6\u675f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4e0e\u654c1\u4eba\u540c\u65f6\u9677\u5165\u4e0d\u53ef\u79fb\u52a8\u72b6\u6001",
      ],
      ["\u56de\u907f\u7387\u589e\u52a0"],
      ["\u5bf9BOSS\u65e0\u6548", "rgb(255, 255,   0)"],
    ],
  };
  b[a.TRICKDEAD] = {
    icon: "\u00c1\u00d7\u00c0\u00ba\u00c3\u00b4\u00c7\u00cf\u00b1\u00e2.tga",
    descript: [
      ["\u88c5\u6b7b", "rgb(190, 190, 250)"],
      ["\u8fdb\u5165\u5047\u6b7b\u72b6\u6001"],
    ],
  };
  b[a.PROPERTYWATER] = {
    icon: "i_p_water.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6c34\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8d4b\u4e88\u6b66\u5668\u6c34\u5c5e\u6027"],
    ],
  };
  b[a.ADORAMUS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8bb4\u6b4c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5904\u4e8e\u9ed1\u6697\u4e0e\u654f\u6377\u964d\u4f4e"],
    ],
  };
  b[a.GENTLETOUCH_ENERGYGAIN] = {
    icon: "\u00c1\u00a1\u00c7\u00f7\u00b1\u00b8.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u70b9\u7a74 - \u7403", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u8fd1\u8ddd\u79bb\u7269\u7406\u653b\u51fb\u6216\u8005\u53d7\u5230\u4f24\u5bb3\u65f6",
      ],
      ["\u751f\u62101\u4e2a\u6c14\u7403\u4f53"],
      [
        "\u731b\u9f99\u5938\u5f3a, \u6c14\u7edd\u5d29\u51fb, \u4f0f\u864e\u62f3\u4f24\u5bb3\u589e\u52a0",
      ],
    ],
  };
  b[a.NEUTRALBARRIER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4e2d\u6027\u9632\u62a4\u7f69", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u7269\u7406,\u9b54\u6cd5\u9632\u5fa1\u7387\u63d0\u5347"],
      ["\u8fdc\u8ddd\u79bb\u653b\u51fb\u65e0\u6548\u5316"],
    ],
  };
  b[a.EARTHSCROLL] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5feb\u4e50\u7684\u4f11\u606f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4f7f\u7528\u9b54\u6cd5\u4e66(\u5730\u9707\u672f)\u65f6"],
      ["\u4f1a\u6d88\u8017\u4e00\u5b9a\u91cf\u7684SP"],
      ["\u4ee5\u8f83\u4f4e\u51e0\u7387\u4f1a\u6d88\u8017\u5492\u8bed\u4e66"],
    ],
  };
  b[a.FALCON] = {
    icon: "\u00c6\u00c8\u00c4\u00dc.tga",
    descript: [
      ["\u9a6f\u9e70\u672f", "rgb(190, 190, 250)"],
      ["\u6253\u730e\u7528\u7684\u730e\u9e70"],
    ],
  };
  b[a.TWOHANDQUICKEN] = {
    icon: "\u00c5\u00f5\u00c7\u00da\u00b5\u00e5\u00c4\u00fb\u00c5\u00ab.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u53cc\u624b\u5251\u52a0\u901f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5f53\u4f7f\u7528\u53cc\u624b\u5251\u65f6"],
      ["\u63d0\u9ad8\u653b\u51fb\u901f\u5ea6"],
    ],
  };
  b[a.SUN_COMFORT] = {
    icon: "i_suncomfort.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u592a\u9633\u7684\u5e73\u5b89\u611f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9632\u5fa1\u7387\u63d0\u5347"],
    ],
  };
  b[a.KYRIE] = {
    icon: "\u00b1\u00e2\u00b8\u00ae\u00bf\u00a1\u00bf\u00a4\u00b7\u00b9\u00c0\u00cc\u00bc\u00d5.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9738\u90aa\u4e4b\u9635", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u963b\u6321\u4e00\u5b9a\u653b\u51fb\u6b21\u6570\u7684\u7684\u9632\u5fa1\u5c4f\u969c\u3002",
      ],
    ],
  };
  b[a.PROTECTARMOR] = {
    icon: "\u00c4\u00c9\u00b9\u00cc\u00c4\u00c3\u00c7\u00c1\u00b7\u00ce\u00c5\u00d8\u00bc\u00c7[\u00be\u00c6\u00b8\u00d3].tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5316\u5b66\u94e0\u7532\u4fdd\u62a4", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u94e0\u7532\u53d8\u6210\u4e0d\u4f1a\u53d7\u5230\u635f\u574f\u7684\u72b6\u6001",
      ],
    ],
  };
  b[a.GIANTGROWTH] = {
    icon: "RK_TURISUSS.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7a81\u91cc\u8428\u5179\u7b26\u6587\u77f3\uff1a\u529b\u91cf\u6210\u957f",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["STR\u589e\u52a0"],
      [
        "\u666e\u901a\u8fd1\u8ddd\u79bb\u7269\u7406\u653b\u51fb\u65f6\uff0c\u4ee5\u8f83\u9ad8\u7684\u6982\u7387\u5927\u4f24\u5bb3",
      ],
      ["\u8fd1\u8ddd\u79bb\u7269\u7406\u4f24\u5bb3\u589e\u52a0"],
    ],
  };
  b[a.STR_SCROLL] = {
    icon: "str_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0STR"]],
  };
  b[a.AB_SECRAMENT] = {
    icon: "\u00bc\u00bc\u00c5\u00a9\u00b6\u00f3\u00b8\u00e0\u00c6\u00ae.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5723\u5178", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u548f\u5531\u65f6\u95f4\u7f29\u77ed"],
    ],
  };
  b[a.PARALYSE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9ebb\u75f9\u4e4b\u6bd2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u901f\u5ea6\u964d\u4f4e"],
      ["\u56de\u907f\u964d\u4f4e"],
      ["\u79fb\u52a8\u901f\u5ea6\u964d\u4f4e"],
    ],
  };
  b[a.PROPERTYGROUND] = {
    icon: "i_p_earth.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5730\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8d4b\u4e88\u6b66\u5668\u5730\u5c5e\u6027"],
    ],
  };
  b[a.DOUBLECASTING] = {
    icon: "i_\u00b4\u00f5\u00ba\u00ed\u00c4\u00b3\u00bd\u00ba\u00c6\u00c3.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u53cc\u500d\u6295\u63b7", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5728\u53cc\u500d\u6295\u63b7\u72b6\u6001\u4e0b"],
      [
        "\u4f7f\u7528\u7bad\u672f\u7c7b\u6280\u80fd\u65f6,\u6709\u4e00\u5b9a\u7684\u673a\u7387\u8ba9\u7bad\u672f\u7c7b\u6280\u80fd,\u518d\u65bd\u5c55\u4e00\u6b21",
      ],
    ],
  };
  b[a.RG_CCONFINE_S] = {
    icon: "i_closeconfine.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7d27\u5bc6\u7684\u7ea6\u675f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4e0e\u654c1\u4eba\u540c\u65f6\u9677\u5165\u4e0d\u53ef\u79fb\u52a8\u72b6\u6001",
      ],
      ["\u56de\u907f\u7387\u589e\u52a0"],
      ["\u5bf9BOSS\u65e0\u6548"],
    ],
  };
  b[a.OVERHEAT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["\u8fc7\u70ed", "rgb(155, 202, 155)"],
      ["\u9b54\u5bfc\u673a\u7532\u8fc7\u70ed\u72b6\u6001"],
      ["\u6bcf\u79d2\u51cf\u5c11\u4e00\u5b9a\u91cf\u7684HP"],
    ],
  };
  b[a.SPL_MATK] = {
    icon: "EFST_MATK.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u72ec\u89d2\u98de\u9a6c\u4e4b\u6cea", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5bf9\u53f2\u6ce2\u6d6a\u58ee\u4e3d\u539f\u91ce\u602a\u7269\u7684"],
      ["\u9b54\u6cd5\u653b\u51fb\u4f24\u5bb3\u589e\u52a0"],
    ],
  };
  b[a.DEEP_SLEEP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6c89\u7761", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u901a\u5e38\u4f24\u5bb3\u76841.5\u500d"],
      ["\u6bcf2\u79d2\u53ef\u6062\u590d\u4e00\u5b9a\u91cf\u7684HP/SP"],
    ],
  };
  b[a.RECOGNIZEDSPELL] = {
    icon: "RECOGNIZESPELL.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u6cd5\u7701\u609f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4ee5\u6700\u5927\u7684\u9b54\u6cd5\u4f24\u5bb3\u6765\u653b\u51fb"],
      ["SP\u6d88\u8017\u91cf\u589e\u52a0"],
    ],
  };
  b[a.TARGET_ASPD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["MSP\u589e\u52a0,SP\u6d88\u8017\u91cf\u964d\u4f4e"],
    ],
  };
  b[a.FOOD_BASICAVOIDANCE] = {
    icon: "gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u56de\u907f\u7387\u63d0\u5347"],
    ],
  };
  b[a.DEFENDER] = {
    icon: "\u00b5\u00f0\u00c6\u00e6\u00b4\u00f5.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5149\u76fe", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u51cf\u5c11\u8fdc\u7a0b\u7269\u7406\u653b\u51fb\u9020\u6210\u7684\u4f24\u5bb3",
      ],
      ["\u964d\u4f4e\u79fb\u52a8\u901f\u5ea6\u548c\u653b\u51fb\u901f\u5ea6"],
    ],
  };
  b[a.WEAPONPROPERTY] = {
    1: {
      icon: "i_p_water.tga",
      haveTimeLimit: 1,
      posTimeLimitStr: 2,
      descript: [
        ["\u6c34\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
        ["%s", "rgb(255, 176,  98)"],
        ["\u8d4b\u4e88\u6b66\u5668\u6c34\u5c5e\u6027"],
      ],
    },
    2: {
      icon: "i_p_earth.tga",
      haveTimeLimit: 1,
      posTimeLimitStr: 2,
      descript: [
        ["\u5730\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
        ["%s", "rgb(255, 176,  98)"],
        ["\u8d4b\u4e88\u6b66\u5668\u5730\u5c5e\u6027"],
      ],
    },
    3: {
      icon: "i_p_fire.tga",
      haveTimeLimit: 1,
      posTimeLimitStr: 2,
      descript: [
        ["\u706b\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
        ["%s", "rgb(255, 176,  98)"],
        ["\u8d4b\u4e88\u6b66\u5668\u706b\u5c5e\u6027"],
      ],
    },
    4: {
      icon: "i_p_wind.tga",
      haveTimeLimit: 1,
      posTimeLimitStr: 2,
      descript: [
        ["\u98ce\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
        ["%s", "rgb(255, 176,  98)"],
        ["\u8d4b\u4e88\u6b66\u5668\u98ce\u5c5e\u6027"],
      ],
    },
    5: {
      icon: "i_p_tele.tga",
      haveTimeLimit: 1,
      posTimeLimitStr: 2,
      descript: [
        ["\u5ff5\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
        ["%s", "rgb(255, 176,  98)"],
        ["\u8d4b\u4e88\u6b66\u5668\u5ff5\u5c5e\u6027"],
      ],
    },
    6: {
      icon: "i_p_saint.tga",
      haveTimeLimit: 1,
      posTimeLimitStr: 2,
      descript: [
        ["\u5723\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
        ["%s", "rgb(255, 176,  98)"],
        ["\u8d4b\u4e88\u6b66\u5668\u5723\u5c5e\u6027"],
      ],
    },
    7: {
      icon: "i_p_dark.tga",
      haveTimeLimit: 1,
      posTimeLimitStr: 2,
      descript: [
        ["\u6697\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
        ["%s", "rgb(255, 176,  98)"],
        ["\u8d4b\u4e88\u6b66\u5668\u6697\u5c5e\u6027"],
      ],
    },
    length: 7,
  };
  b[a.S_LIFEPOTION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5c0f\u578b\u751f\u547d\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf5\u79d2\u53ef\u6062\u590d\u4e00\u5b9a\u91cf\u7684HP"],
      ["\u72c2\u6012\u4e4b\u67aa\u72b6\u6001\u4e2d\u4e3a\u65e0\u6548"],
    ],
  };
  b[a.FOOD_LUK] = {
    icon: "luk_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0LUK"]],
  };
  b[a.BLOODING] = {
    icon: "\u00c3\u00e2\u00c7\u00f7\u00bb\u00f3\u00c5\u00c2.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u51fa\u8840", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["HP, SP \u4e0d\u80fd\u6062\u590d"],
      ["\u6bcf10\u79d2\u4f1a\u6d41\u5931\u4e00\u5b9a\u91cf\u7684 HP"],
    ],
  };
  b[a.REFRESH] = {
    icon: "RK_NAUTHIZ.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4e00\u53f7\u5362\u6069\u77f3;\u6062\u590d", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4f7f\u7528\u65f6\u53ef\u89e3\u9664\u6240\u6709\u5f02\u5e38\u72b6\u6001,DEBUFF",
      ],
      ["\u4e0d\u4f1a\u4e2d\u4efb\u4f55\u5f02\u5e38\u72b6\u6001,DEBUFF"],
      ["\u6062\u590d\u4e00\u5b9a\u91cf\u7684HP"],
    ],
  };
  b[a.FOOD_LUK_CASH] = {
    icon: "luk_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0LUK"]],
  };
  b[a.BROKENARMOR] = {
    icon: "\u00b0\u00a9\u00bf\u00ca\u00c6\u00c4\u00b1\u00ab.tga",
    descript: [["\u9632\u5177\u7834\u574f", "rgb(250, 100, 100)"]],
  };
  b[a.DODGE_ON] = {
    icon: "i_dodge.tga",
    descript: [
      ["\u843d\u6cd5", "rgb(155, 202, 155)"],
      ["\u98de\u811a\u8e22\u51c6\u5907\u59ff\u52bf"],
      [
        "\u906d\u53d7\u654c\u4eba\u7684\u8fdc\u8ddd\u79bb,\u9b54\u6cd5\u653b\u51fb\u65f6",
      ],
      ["\u4f9d\u51e0\u7387\u56de\u907f\u653b\u51fb"],
      ["\u8dd1\u6b65\u65f6"],
      ["\u4e8e\u8fd1\u8ddd\u79bb\u53d1\u52a8\u653b\u51fb"],
    ],
  };
  b[a.TARGET_BLOOD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u5f02\u5e38\u72b6\u6001\u62b5\u6297\u836f\u6c34",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5bf9\u4e0b\u5217\u72b6\u6001\u7684\u62b5\u6297\u529b\u589e\u52a0"],
      ["\u6655\u7729,\u51b0\u51bb,\u77f3\u5316,\u7761\u7720,\u6c89\u9ed8"],
      ["\u9ed1\u6697,\u8bc5\u5492,\u6bd2,\u51fa\u8840,\u6df7\u4e71"],
    ],
  };
  b[a.MELODYOFSINK] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6d88\u6c89\u65cb\u5f8b", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["SP\u6301\u7eed\u6d88\u8017"],
      ["INT\u51cf\u5c11"],
    ],
  };
  b[a.CRUCIS] = {
    icon: "\u00bd\u00c3\u00b1\u00d7\u00b3\u00d1\u00c5\u00a9\u00b7\u00e7\u00bd\u00c3\u00bd\u00ba.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5929\u4f7f\u4e4b\u5149", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4e0d\u6b7b\u7cfb,\u6697\u5c5e\u6027\u602a\u7269\u7684\u9632\u5fa1\u7387\u964d\u4f4e",
      ],
    ],
  };
  b[a.SLOWCAST] = {
    icon: "slowcast.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u51cf\u7f13\u548f\u5531", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u548f\u5531\u65f6\u95f4\u589e\u52a0"],
    ],
  };
  b[a.PROPERTYWIND] = {
    icon: "i_p_wind.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u98ce\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8d4b\u4e88\u6b66\u5668\u98ce\u5c5e\u6027"],
    ],
  };
  b[a.ENCHANTBLADE] = {
    icon: "RK_ENCHANT.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u529b\u5251", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4e8e\u8fd1\u8eab\u7269\u7406\u653b\u51fb\u4e0a\u589e\u52a0\u9b54\u6cd5\u653b\u51fb\u529b",
      ],
    ],
  };
  b[a.ADRENALINE] = {
    icon: "\u00be\u00c6\u00b5\u00e5\u00b7\u00b9\u00b3\u00af\u00b8\u00b0\u00b7\u00af\u00bd\u00ac.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u901f\u5ea6\u6fc0\u53d1", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u9ad8\u653b\u51fb\u901f\u5ea6"],
      ["\u5355\u624b\u65a7\u548c\u53cc\u624b\u65a7"],
    ],
  };
  b[a.MAGICMUSHROOM] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u72c2\u7b11\u4e4b\u6bd2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u72c2\u7b11\u56fe\u91ca"],
      ["\u6bcf4\u79d2\u968f\u673a\u4f7f\u7528\u6280\u80fd"],
      ["\u6bcf4\u79d2\u6d88\u8017\u4e00\u5b9a\u91cf\u7684HP"],
    ],
  };
  b[a.CASH_PLUSEXP] = {
    icon: "exp.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u7ecf\u9a8c\u6536\u76ca"],
    ],
  };
  b[a.ATTHASTE_POTION2] = {
    icon: "\u00b0\u00f8\u00bc\u00d3\u00b9\u00b0\u00be\u00e0.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u89c9\u9192\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u9ad8\u653b\u51fb\u901f\u5ea6"],
    ],
  };
  b[a.TOXIN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9ebb\u9189\u4e4b\u6bd2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf10\u79d2\u9632\u788d\u548f\u5531,\u6280\u80fd\u52a8\u4f5c"],
      ["\u5251\u9c7c\u5361\u7247\u6548\u679c\u65e0\u6548"],
      ["\u6bcf10\u79d2\u6d88\u8017\u4e00\u5b9a\u91cf\u7684SP"],
    ],
  };
  b[a.RAISINGDRAGON] = {
    icon: "hl_confusion.tga",
    descript: [
      ["\u6f5c\u9f99\u5347\u5929", "rgb(155, 202, 155)"],
      ["\u589e\u52a0\u6700\u5927\u6c14\u7403\u6570"],
      ["\u589e\u52a0\u6700\u5927HP\u4e0eSP"],
      ["\u653b\u51fb\u901f\u5ea6\u589e\u52a0"],
      ["\u7ef4\u6301\u7206\u6c14"],
      ["\u6bcf\u79d2\u6d88\u8017\u4e00\u5b9a\u91cf\u7684HP"],
    ],
  };
  b[a.HARMONIZE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u548c\u58f0\u6f14\u594f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8c03\u6574\u7d20\u8d28\u52a0\u91cd\u503c"],
    ],
  };
  b[a.CHASEWALK2] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["STR\u589e\u52a0"]],
  };
  b[a.FOOD_STR_CASH] = {
    icon: "str_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0STR"]],
  };
  b[a.CLOAKINGEXCEED] = {
    icon: "\u00c6\u00f7\u00c0\u00cc\u00c1\u00ee\u00b4\u00d7\u00bf\u00fe\u00c6\u00f9.tga",
    descript: [
      ["\u4f2a\u88c5\u5f3a\u5316", "rgb(155, 202, 155)"],
      ["\u4e0d\u4f1a\u88ab\u6606\u866b\u7cfb,\u6076\u9b54\u7cfb\u53d1\u73b0"],
      ["\u53ef\u627f\u53d7\u81f3\u4e00\u5b9a\u6b21\u6570\u7684\u4f24\u5bb3"],
      ["\u79fb\u52a8\u901f\u5ea6\u63d0\u5347"],
    ],
  };
  b[a.ASSUMPTIO2] = {
    icon: "ICON05.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5723\u6bcd\u4e4b\u7948\u798f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9632\u5fa1\u7387\u589e\u52a0"],
    ],
  };
  b[a.THORNS_TRAP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8346\u68d8\u9677\u9631", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4e00\u70b9\u4e00\u70b9\u53d7\u4f24\u5bb3"],
    ],
  };
  b[a.SlowpOISON] = {
    icon: "\u00bd\u00bd\u00b7\u00ce\u00bf\u00ec\u00c6\u00f7\u00c0\u00cc\u00c1\u00f0.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7f13\u6bd2\u672f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u53ef\u6682\u505c\u6bd2\u6027\u53d1\u4f5c"],
    ],
  };
  b[a.CLOAKING] = {
    icon: "\u00c5\u00ac\u00b7\u00ce\u00c5\u00b7.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9690\u533f\u72b6\u6001", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4f2a\u88c5"],
    ],
  };
  b[a.PARTYFLEE] = {
    icon: "gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u56de\u907f\u7387\u589e\u52a0"],
    ],
  };
  b[a.CRITICALPERCENT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7814\u78e8\u5242", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5fc5\u6740\u653b\u51fb\u7387\u589e\u52a0"],
    ],
  };
  b[a.INSPIRATION] = {
    icon: "LG_INSPIRATION.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7075\u611f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u547d\u4e2d\u7387,\u7d20\u8d28\u589e\u52a0,\u653b\u51fb\u529b,MHP\u589e\u52a0",
      ],
      ["\u7279\u5b9aBUFF,\u5f02\u5e38\u72b6\u6001\u65e0\u6548\u5316"],
      ["\u6301\u7eed\u6027\u7684\u964d\u4f4eHP,SP"],
      [
        "\u53d1\u52a8\u65f6\u89e3\u9664\u6240\u6709BUFF\u53ca\u5f02\u5e38\u72b6\u6001",
      ],
      [
        "\u53d1\u52a8\u65f6\u635f\u5931\u4e00\u5b9a\u91cf\u7684\u7ecf\u9a8c\u503c",
      ],
    ],
  };
  b[a.UNLIMITED_HUMMING_VOICE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u65e0\u9650\u54fc\u5531\u58f0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5c5e\u6027\u9b54\u6cd5\u4f24\u5bb3\u589e\u52a0"],
    ],
  };
  b[a.FOOD_DEX] = {
    icon: "dex_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0DEX"]],
  };
  b[a.ANALYZE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u89e3\u6790", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u7269\u7406,\u9b54\u6cd5\u9632\u5fa1\u7387\u964d\u4f4e"],
    ],
  };
  b[a.GENTLETOUCH_REVITALIZE] = {
    icon: "\u00c1\u00a1\u00c7\u00f7\u00c8\u00b0.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u70b9\u7a74 - \u6d3b", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MHP\u589e\u52a0, \u7269\u7406\u9632\u5fa1\u529b\u589e\u52a0"],
      ["HP\u81ea\u7136\u6062\u590d\u901f\u5ea6\u589e\u52a0"],
      ["\u79fb\u52a8\u653b\u51fb\u4e2d\u4e5f\u4f1a\u6062\u590dHP"],
      [
        "\u864e\u70ae\uff0c\u7f57\u524e\u7834\u51f0\u51fb\u4f24\u5bb3\u589e\u52a0",
      ],
    ],
  };
  b[a.COUNTER_ON] = {
    icon: "i_counter.tga",
    descript: [
      ["\u8fd8\u51fb\u51c6\u5907", "rgb(155, 202, 155)"],
      [
        "\u670920%\u7684\u673a\u7387\u505a\u8fd8\u51fb\u51c6\u5907\u7684\u59ff\u6001",
      ],
    ],
  };
  b[a.GLORIA] = {
    icon: "\u00b1\u00db\u00b7\u00ce\u00b8\u00ae\u00be\u00c6.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5e78\u8fd0\u4e4b\u9882\u6b4c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0LUK"],
    ],
  };
  b[a.RUSH_WINDMILL] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u671d\u98ce\u8f66\u7a81\u51fb", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u529b\u589e\u52a0"],
      ["\u79fb\u52a8\u901f\u5ea6\u589e\u52a0"],
    ],
  };
  b[a.PYREXIA] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u70ed\u75c5\u4e4b\u6bd2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9ed1\u6697,\u5e7b\u89c9\u72b6\u6001"],
    ],
  };
  b[a.DANCE_WITH_WUG] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4e0e\u72fc\u5171\u821e", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u901f\u5ea6\u589e\u52a0"],
      ["\u56fa\u5b9a\u548f\u5531\u65f6\u95f4\u51cf\u5c11"],
      ["\u8fdc\u7a0b\u4f24\u5bb3\u589e\u52a0"],
    ],
  };
  b[a.SWING] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6447\u6446\u821e", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u79fb\u52a8\u901f\u5ea6\u589e\u52a0"],
      ["\u653b\u901f\u589e\u52a0"],
      ["\u56fa\u5b9a\u548f\u5531\u51cf\u5c11"],
    ],
  };
  b[a.MOON_COMFORT] = {
    icon: "i_mooncomfort.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6708\u4eae\u7684\u5e73\u5b89\u611f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u56de\u907f\u7387\u63d0\u5347"],
    ],
  };
  b[a.MOONLIT_SERENADE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6708\u5149\u5c0f\u591c\u66f2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9b54\u6cd5\u653b\u51fb\u529b\u589e\u52a0"],
    ],
  };
  b[a.GENTLETOUCH_CHANGE] = {
    icon: "\u00c1\u00a1\u00c7\u00f7\u00b9\u00dd.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u70b9\u7a74 - \u53cd", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u529b\uff0c\u653b\u901f\u589e\u52a0"],
      [
        "\u7206\u6c14\u6563\u5f39\uff0c\u4fee\u7f57\u8eab\u5f39\u4f24\u5bb3\u589e\u52a0",
      ],
    ],
  };
  b[a.STRIPACCESSARY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5378\u9664\u914d\u4ef6", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4e0d\u53ef\u88c5\u7f6e\u914d\u4ef6"],
    ],
  };
  b[a.PROPERTYUNDEAD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    descript: [["\u8d4b\u4e88\u4e0d\u6b7b\u7cfb\u5c5e\u6027"]],
  };
  b[a.INVISIBILITY] = {
    icon: "\u00c0\u00ce\u00ba\u00f1\u00c1\u00f6\u00ba\u00f4\u00b8\u00ae\u00c6\u00bc.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u65e0\u5f62\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4e8e\u900f\u660e\u72b6\u6001\u4e0b\u53ef\u8fdb\u884c\u653b\u51fb"],
      ["\u653b\u51fb\u5c5e\u6027\u53d8\u5ff5\u5c5e\u60271\u7ea7"],
      ["\u6301\u7eed\u6027\u7684SP\u964d\u4f4e"],
      ["\u4e0d\u53ef\u4f7f\u7528\u6280\u80fd,\u7269\u54c1"],
    ],
  };
  b[a.ABUNDANCE] = {
    icon: "RK_URUZ.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u516d\u53f7\u5362\u6069\u77f3;\u4e30\u8db3", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf10\u79d2\u6062\u590d\u4e00\u5b9a\u91cf\u7684SP"],
    ],
  };
  b[a.FOOD_BASICHIT] = {
    icon: "gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0HIT"]],
  };
  b[a.FOOD_AGI_CASH] = {
    icon: "agi_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0AGI"]],
  };
  b[a.SHADOWFORM] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b45\u5f71\u5f62\u6001", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6709\u4e00\u5b9a\u6b21\u6570\u5c06\u81ea\u5df1\u7684\u4f24\u5bb3"],
      ["\u4f1a\u8f6c\u79fb\u5230\u76ee\u6807\u73a9\u5bb6\u7684\u8eab\u4e0a"],
    ],
  };
  b[a.AUTOSHADOWSPELL] = {
    icon: "\u00bf\u00c0\u00c5\u00e4\u00bd\u00a6\u00b5\u00b5\u00bf\u00ec\u00bd\u00ba\u00c6\u00e7.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u81ea\u52a8\u5f71\u5492", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u53ef\u4ee5\u4f7f\u7528\u4ee5\u6284\u88ad,\u590d\u5236\u6240\u5b66\u7684",
      ],
      ["\u9b54\u6cd5\u6280\u80fd"],
    ],
  };
  b[a.SHAPESHIFT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5f62\u6001\u8f6c\u6362", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u53ef\u900f\u8fc7\u9b54\u5bfc\u6218\u7532\u7684\u673a\u8eab\u53d8\u6362\u5c5e\u6027",
      ],
    ],
  };
  b[a.MANU_ATK] = {
    icon: "EFST_ATK.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u6012\u514b\u7684\u826f\u673a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5bf9\u9b54\u6012\u514b\u539f\u91ce\u7684\u602a\u7269"],
      ["\u589e\u52a0\u653b\u51fb\u4f24\u5bb3"],
    ],
  };
  b[a.MARIONETTE_MASTER] = {
    icon: "ICON01.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u5080\u5121\u5e08\u7684\u628a\u620f(\u65bd\u5c55)",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5411\u76ee\u6807\u73a9\u5bb6"],
      ["\u8f6c\u79fb\u7d20\u8d28"],
    ],
  };
  b[a.MARIONETTE] = {
    icon: "ICON01.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u5080\u5121\u5e08\u7684\u628a\u620f(\u65bd\u5c55)",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5411\u76ee\u6807\u73a9\u5bb6"],
      ["\u8f6c\u79fb\u7d20\u8d28"],
    ],
  };
  b[a.WZ_SIGHTBLASTER] = {
    icon: "i_sightblaster.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u706b\u72e9\u82bd", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5411\u7f20\u4f4f\u7684\u654c\u4eba\u9020\u6210\u9b54\u6cd5\u653b\u51fb\u529b\u7684",
      ],
      ["\u4f24\u5bb3\u540e\u9000\u5f00"],
    ],
  };
  b[a.LEXAETERNA] = {
    icon: "\u00b7\u00ba\u00bd\u00ba\u00bf\u00a1\u00c5\u00d7\u00b8\u00a3\u00b3\u00aa.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5929\u4f7f\u4e4b\u6012", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["1\u6b21\u7684\u653b\u51fb\u906d\u53d7\u4e24\u500d\u7684\u4f24\u5bb3"],
    ],
  };
  b[a.INFRAREDSCAN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7ea2\u5916\u7ebf\u626b\u7784", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u53ef\u627e\u51fa\u9690\u533f\u7684\u654c\u4eba"],
      [
        "\u4f9d\u51e0\u7387\u8303\u56f4\u5185\u7684\u6240\u6709\u76ee\u6807\u7684\u56de\u907f\u7387\u964d\u4f4e",
      ],
    ],
  };
  b[a.INT_SCROLL] = {
    icon: "int_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0INT"]],
  };
  b[a.ASPERSIO] = {
    icon: "i_p_saint.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5723\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8d4b\u4e88\u6b66\u5668\u5723\u5c5e\u6027"],
    ],
  };
  b[a.MOVHASTE_INFINITY] = {
    icon: "hl_confusion.tga",
    descript: [["\u79fb\u52a8\u901f\u5ea6\u589e\u52a0"]],
  };
  b[a.LERADS_DEW] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u96f7\u62c9\u591a\u9732\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MHP\u589e\u52a0"],
    ],
  };
  b[a.FOOD_INT] = {
    icon: "int_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0INT"]],
  };
  b[a.VENOMBLEED] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8870\u5f31\u4e4b\u6bd2", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MHP\u56fa\u5b9a\u4e0b\u964d"],
    ],
  };
  b[a.GS_GATLINGFEVER] = {
    icon: "i_fever.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u683c\u6797\u72c2\u70ed", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u901f,\u4f24\u5bb3\u589e\u52a0"],
      ["\u56de\u907f\u7387,\u79fb\u52a8\u901f\u5ea6\u51cf\u5c11"],
    ],
  };
  b[a.VITALITYACTIVATION] = {
    icon: "RK_ISHA.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u4f0a\u672d\u7b26\u6587\u77f3\uff1a\u751f\u547d\u6fc0\u5316",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["HP\u6062\u590d\u6548\u679c\u589e\u52a0"],
      [
        "\u53d7\u5230\u7684\u8fd1\u8ddd\u79bb\u7269\u7406\u53cd\u5c04\u4f24\u5bb3\u51cf\u5c11",
      ],
    ],
  };
  b[a.STONEHARDSKIN] = {
    icon: "RK_HAGALAZ.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u4e5d\u53f7\u5362\u6069\u77f3;\u786c\u77f3\u76ae\u80a4",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u635f\u5931\u4e00\u5b9a\u91cf\u7684HP\u540e\u53ef\u5f62\u6210\u5bf9\u7b49\u91cf\u7684\u9632\u5fa1\u7f69",
      ],
      [
        "\u5f53\u5176\u4ed6\u73a9\u5bb6\u8fd1\u8eab\u7269\u7406\u653b\u51fb\u65f6",
      ],
      [
        "\u4f9d\u51e0\u7387\u53ef\u7834\u574f\u8fdb\u884c\u653b\u51fb\u7684\u73a9\u5bb6\u6b66\u5668",
      ],
      ["\u602a\u7269\u5219\u4f9d\u51e0\u738710\u79d2\u5185ATK\u4e0b\u964d"],
    ],
  };
  b[a.WEIGHTOVER70] = {
    icon: "\u00b9\u00ab\u00b0\u00d470\u00c0\u00cc\u00bb\u00f3.tga",
    descript: [
      ["\u8d1f\u91cd\u8d85\u8fc770%", "rgb(250, 100, 100)"],
      ["\u4e0d\u4f1a\u6062\u590d\u8840\u91cf\u548c\u6c14\u91cf"],
    ],
  };
  b[a.WEIGHTOVER90] = {
    icon: "\u00b9\u00ab\u00b0\u00d490\u00c0\u00cc\u00bb\u00f3.tga",
    descript: [
      ["\u8d1f\u91cd\u8d85\u8fc790%", "rgb(250, 100, 100)"],
      ["\u4e0d\u4f1a\u6062\u590d\u8840\u91cf\u548c\u6c14\u91cf"],
      ["\u65e0\u6cd5\u653b\u51fb\u548c\u4f7f\u7528\u6280\u80fd"],
    ],
  };
  b[a.PROTECTHELM] = {
    icon: "\u00c4\u00c9\u00b9\u00cc\u00c4\u00c3\u00c7\u00c1\u00b7\u00ce\u00c5\u00d8\u00bc\u00c7[\u00c7\u00ef\u00b8\u00a7].tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5316\u5b66\u5934\u76d4\u4fdd\u62a4", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5934\u76d4\u53d8\u6210\u4e0d\u4f1a\u53d7\u5230\u635f\u574f\u7684\u72b6\u6001",
      ],
    ],
  };
  b[a.PLUSAVOIDVALUE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5e7b\u5f71\u7684\u9152\u676f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5b8c\u5168\u56de\u907f\u589e\u52a0"],
    ],
  };
  b[a.OBLIVIONCURSE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5931\u5fc6\u4e4b\u6bd2", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5931\u5fc6"],
    ],
  };
  b[a.HEALPLUS] = {
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6062\u590d\u529b\u63d0\u5347\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u53d7\u5230\u7684\u6cbb\u6108\u672f\u4e0e\u90e8\u5206\u6062\u590d\u7269\u54c1\u7684",
      ],
      ["\u4f7f\u7528\u6548\u679c\u4f1a\u63d0\u5347"],
    ],
  };
  b[a.PROTECT_DEF] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7269\u7406\u9632\u5fa1\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u7269\u7406\u653b\u51fb\u8010\u6027\u589e\u52a0"],
    ],
  };
  b[a.CRITICALWOUND] = {
    icon: "criticalwound.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u81f4\u547d\u4f24\u53e3", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u53d7\u5230\u7684\u6062\u590d\u7cfb\u6280\u80fd\u7684\u6548\u679c\u964d\u4f4e",
      ],
    ],
  };
  b[a.PRESTIGE] = {
    icon: "LG_PRESTIGE.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5a01\u4fe1", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4f9d\u7d20\u8d28\u5957\u7528\u4e8e\u9b54\u6cd5\u56de\u907f\u7387"],
      ["\u9632\u5fa1\u7387\u589e\u52a0"],
    ],
  };
  b[a.FOOD_DEX_CASH] = {
    icon: "dex_gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["\u589e\u52a0DEX"]],
  };
  b[a.L_LIFEPOTION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4e2d\u578b\u751f\u547d\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf4\u79d2\u6062\u590d\u4e00\u5b9a\u91cf\u7684HP"],
      ["\u4e8e\u72c2\u6012\u4e4b\u67aa\u65f6\u65e0\u6548"],
    ],
  };
  b[a.WINDWALK] = {
    icon: "icon06.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u98ce\u4e4b\u6b65", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u79fb\u52a8\u901f\u5ea6,\u56de\u907f\u7387\u63d0\u5347"],
    ],
  };
  b[a.PROPERTYFIRE] = {
    icon: "i_p_fire.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u706b\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8d4b\u4e88\u6b66\u5668\u706b\u5c5e\u6027"],
    ],
  };
  b[a.STRIKING] = {
    icon: "\u00bd\u00ba\u00c6\u00ae\u00b6\u00f3\u00c0\u00cc\u00c5\u00b7.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6b66\u5668\u9510\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u6b66\u5668\u653b\u51fb\u529b,\u5fc5\u6740\u653b\u51fb\u7387\u589e\u52a0",
      ],
    ],
  };
  b[a.DOWNKICK_ON] = {
    icon: "i_downkick.tga",
    descript: [
      ["\u7838\u8e22\u51c6\u5907", "rgb(155, 202, 155)"],
      [
        "\u670915%\u7684\u673a\u7387\u505a\u7838\u8e22\u51c6\u5907\u7684\u59ff\u6001",
      ],
    ],
  };
  b[a.PROPERTYDARK] = {
    icon: "i_p_dark.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["\u6697\u5c5e\u6027\u9644\u52a0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8d4b\u4e88\u76d4\u7532\u6697\u5c5e\u6027"],
    ],
  };
  b[a.REFLECTSHIELD] = {
    icon: "\u00b8\u00ae\u00c7\u00c3\u00b7\u00ba\u00c6\u00ae\u00bd\u00af\u00b5\u00e5.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u53cd\u5c04\u76fe", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5f53\u53d7\u5230\u7269\u7406\u77ed\u8ddd\u79bb\u653b\u51fb\u65f6"],
      ["\u53cd\u5c04\u4e00\u90e8\u5206\u4f24\u5bb3"],
    ],
  };
  b[a.RIDING] = {
    icon: "\u00b6\u00f3\u00c0\u00cc\u00b5\u00f9.tga",
    descript: [["\u9a91\u4e58\u672f", "rgb(190, 190, 250)"]],
  };
  b[a.LIGHTNINGWALK] = {
    icon: "\u00bc\u00b6\u00c0\u00fc\u00ba\u00b8.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u95ea\u7535\u6b65", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u82e5\u662f\u8fdc\u8ddd\u79bb\u7269\u7406,\u9b54\u6cd5\u653b\u51fb\u7684\u76ee\u6807\u65f6",
      ],
      ["\u5728\u4e00\u5b9a\u51e0\u7387\u56de\u907f\u653b\u51fb\u540e"],
      [
        "\u5c31\u80fd\u79fb\u52a8\u81f3\u5bf9\u81ea\u5df1\u653b\u51fb\u7684\u76ee\u6807\u9762\u524d",
      ],
    ],
  };
  b[a.FROSTMISTY] = {
    icon: "frostmisty.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7ed3\u51b0", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u9632\u5fa1\u7387,\u79fb\u52a8\u901f\u5ea6,\u653b\u51fb\u901f\u5ea6\u964d\u4f4e",
      ],
      ["\u56fa\u5b9a\u548f\u5531\u65f6\u95f4\u589e\u52a0"],
    ],
  };
  b[a.COLD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6db2\u4f53\u51b7\u5374\u5f39", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6c34\u5c5e\u6027\u4f24\u5bb3\u4e0e"],
      ["\u7ed3\u51b0,\u51b0\u51bb\u5f02\u5e38\u72b6\u6001"],
    ],
  };
  b[a.GROUNDMAGIC] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u5957\u7528\u5730\u9762\u6280\u80fd\u7684\u6548\u679c"],
    ],
  };
  b[a.HELLPOWER] = {
    icon: "npc_hellpower.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5730\u72f1\u4e4b\u6743\u5a01", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4e0d\u53ef\u590d\u6d3b"],
      ["\u4e0d\u53ef\u4f7f\u7528\u820d\u547d\u653b\u51fb"],
      ["\u4e0d\u53ef\u4f7f\u7528\u539f\u5730\u590d\u6d3b\u4e4b\u8bc1"],
    ],
  };
  b[a.SAVAGE_STEAK] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u70e4\u91ce\u732a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0STR"],
    ],
  };
  b[a.COCKTAIL_WARG_BLOOD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u72fc\u8840\u9e21\u5c3e\u9152", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["INT\u589e\u52a0"],
    ],
  };
  b[a.MINOR_BBQ] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5c0f\u725b\u6392", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["VIT\u589e\u52a0"],
    ],
  };
  b[a.SIROMA_ICE_TEA] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u57ce\u95f4\u51b0\u8336", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["DEX\u589e\u52a0"],
    ],
  };
  b[a.DROCERA_HERB_STEAMED] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u836f\u8349\u84b8\u8305\u818f\u83dc", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["AGI\u589e\u52a0"],
    ],
  };
  b[a.PUTTI_TAILS_NOODLES] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6bd5\u5e1d\u7279\u9f99\u5c3e\u9762", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["LUK\u589e\u52a0"],
    ],
  };
  b[a.STOMACHACHE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8179\u75db", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6240\u6709\u7d20\u8d28\u52a0\u91cd\u503c\u964d\u4f4e"],
      ["\u79fb\u52a8\u901f\u5ea6\u964d\u4f4e"],
      ["\u6bcf10\u79d2\u51fa\u73b0\u4e00\u6b21\u5750\u4e0b\u52a8\u4f5c"],
      ["\u6bcf10\u79d2\u6d88\u8017\u4e00\u5b9a\u91cf\u7684SP"],
    ],
  };
  b[a.PROTECTEXP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7238\u5988\u6211\u7231\u60a8", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5373\u4f7f\u9635\u4ea1\u4e5f\u4e0d\u4f1a\u635f\u5931\u7ecf\u9a8c\u503c",
      ],
    ],
  };
  b[a.ANGEL_PROTECT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["Guardian Angel", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["No EXP loss upon death"],
    ],
  };
  b[a.MORA_BUFF] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["Mora Berry", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["Increases Resistance to every monsters"],
      ["in the fields near the town of Mora."],
    ],
  };
  b[a.POPECOOKIE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6559\u7687\u997c\u5e72", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK,MATK\u589e\u52a0"],
      ["\u6240\u6709\u5c5e\u6027\u8010\u6027\u589e\u52a0"],
    ],
  };
  b[a.VITALIZE_POTION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6d3b\u6027\u5316\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK,MATK\u589e\u52a0"],
      ["\u6cbb\u6108\u548c\u9053\u5177\u6062\u590d\u6548\u80fd\u589e\u52a0"],
    ],
  };
  b[a.G_LIFEPOTION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["Rapid Life-giving Water", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["Recovers HP every 3 seconds"],
      ["No effect if Berserk State is active"],
    ],
  };
  b[a.ODINS_POWER] = {
    icon: "all_odins_power.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5965\u4e01\u4e4b\u795e\u529b", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK,MATK\u589e\u52a0"],
      ["DEF,MDEF\u51cf\u5c11"],
    ],
  };
  b[a.MAGIC_CANDY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u6cd5\u7cd6\u679c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MATK\u589e\u52a0"],
      ["\u56fa\u5b9a\u548f\u5531\u51cf\u5c11"],
      ["\u548f\u5531\u4e0d\u4f1a\u4e2d\u65ad"],
      ["\u6bcf10\u79d2\u4f1a\u51cf\u5c11\u4e00\u5b9a\u91cf\u7684SP"],
    ],
  };
  b[a.ENERGYCOAT] = {
    icon: "\u00bf\u00a1\u00b3\u00ca\u00c1\u00f6\u00c4\u00da\u00c6\u00ae.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u80fd\u91cf\u5916\u5957", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6309\u6bd4\u4f8b\u51cf\u5c11\u4f24\u5bb3"],
      ["\u6d88\u8017\u7b49\u6bd4\u7684SP"],
    ],
  };
  b[a.PAIN_KILLER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["Pain Killer", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["No movement delay in receiving damage"],
      ["Reduced damage taken"],
    ],
  };
  b[a.LIGHT_OF_REGENE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["Light Of Regeneration", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["When the summoner died"],
      ["Homunculus will sacrifice to revive the summoner"],
    ],
  };
  b[a.OVERED_BOOST] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["Overed Boost", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["Increases ASPD and Evasion"],
      ["to a fixed amount"],
    ],
  };
  b[a.STYLE_CHANGE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 0,
    descript: [
      ["Style Change", "rgb(190, 190, 250)"],
      ["Homunculus in Fighter Style"],
    ],
  };
  b[a.MAGMA_FLOW] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["Magma Flow", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["When receiving damage"],
      ["there is a chance to eject magma around it"],
    ],
  };
  b[a.GRANITIC_ARMOR] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["Granitic Armor", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["Reduced damage taken"],
      ["Lose some HP when the status ends."],
    ],
  };
  b[a.PYROCLASTIC] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u706b\u5c71\u5c18\u66b4", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u751f\u547d\u4f53\u7684\u653b\u51fb\u4e0e\u4e3b\u4eba\u6240\u6301\u6b66\u5668",
      ],
      ["\u5c5e\u6027\u6682\u65f6\u8f6c\u4e3a\u706b\u5c5e\u6027"],
      ["\u63d0\u5347\u6b66\u5668\u653b\u51fb\u529b"],
    ],
  };
  b[a.VOLCANIC_ASH] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["Volcanic Ash", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["Reduced hit rate"],
      ["Skill has a chance of failing"],
      ["Increases fire damage taken"],
    ],
  };
  b[a.ATKER_ASPD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4ed9\u4e39", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MHP\u589e\u52a0"],
      ["HP\u6062\u590d\u529b\u589e\u52a0"],
    ],
  };
  b[a.ATKER_MOVESPEED] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["????\u2032\u00fc", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["Increases Max SP"],
      ["Increases SP recovery"],
    ],
  };
  b[a.OVERLAPEXPUP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7ef5\u7ef5\u5c9b\u732b\u98df\u7f50\u5934", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u72e9\u730e\u9b54\u7269\u65f6"],
      ["\u4eba\u7269\u7ecf\u9a8c\u503c,JOB\u7ecf\u9a8c\u503c\u589e\u52a0"],
    ],
  };
  b[a.PLUSATTACKPOWER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["ATK\u63d0\u5347"]],
  };
  b[a.PLUSMAGICPOWER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["MATK\u63d0\u5347"]],
  };
  b[a.MACRO_PERMIT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u81ea\u52a8\u7ec3\u529f\u7cfb\u7edf\u4f7f\u7528",
        "rgb(255, 255,   0)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["\u81ea\u52a8\u7ec3\u529f\u7cfb\u7edf\u4f7f\u7528\u4e2d"],
    ],
  };
  b[a.MACRO_POSTDELAY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u81ea\u52a8\u7ec3\u529f\u7cfb\u7edf", "rgb(255, 255,   0)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u81ea\u52a8\u7ec3\u529f\u7cfb\u7edf"],
    ],
  };
  b[a.MONSTER_TRANSFORM] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u53d8\u8eab\u602a\u7269", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u53d8\u8eab\u602a\u7269\u4e2d"],
    ],
  };
  b[a.SIT] = {
    icon: "\u00be\u00c9\u00b1\u00e2.tga",
    descript: [["\u5750\u4e0b", "rgb(190, 190, 250)"]],
  };
  b[a.ALL_RIDING] = {
    icon: "\u00b6\u00f3\u00c0\u00cc\u00b5\u00f9.tga",
    descript: [["\u642d\u4e58\u4e2d", "rgb(190, 190, 250)"]],
  };
  b[a.SKF_MATK] = {
    icon: "icon08.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["MATK\u589e\u52a0"]],
  };
  b[a.SKF_ATK] = {
    icon: "icon08.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [["%s", "rgb(255, 176,  98)"], ["ATK\u589e\u52a0"]],
  };
  b[a.SKF_ASPD] = {
    icon: "icon08.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u901f\u5ea6\u589e\u52a0"],
    ],
  };
  b[a.SKF_CAST] = {
    icon: "icon08.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u53d8\u52a8\u548f\u5531\u65f6\u95f4\u51cf\u5c11"],
    ],
  };
  b[a.REWARD_PLUSONLYJOBEXP] = {
    icon: "icon08.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["JOB\u7ecf\u9a8c\u503c\u989d\u5916\u83b7\u5f97"],
    ],
  };
  b[a.ENERVATION] = {
    icon: "Masquerade_ENERVATION.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9762\u5177:\u65e0\u529b", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u529b\u964d\u4f4e"],
      ["\u88ab\u653b\u51fb\u65f6\u4f1a\u5931\u53bb\u6c14\u7403\u4f53"],
    ],
  };
  b[a.GROOMY] = {
    icon: "Masquerade_GROOMY.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9762\u5177:\u5fe7\u90c1", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u901f\u5ea6,\u547d\u4e2d\u7387\u964d\u4f4e"],
      ["\u88ab\u653b\u51fb\u65f6\u89e3\u9664\u5438\u8840\u8759\u8760"],
      ["\u5438\u8840\u8759\u8760\u4e0d\u53ef\u4f7f\u7528"],
    ],
  };
  b[a.IGNORANCE] = {
    icon: "Masquerade_IGNORANCE.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9762\u5177:\u65e0\u77e5", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u88ab\u653b\u51fb\u65f6\u4f1a\u635f\u5931\u4e00\u5b9a\u91cf\u7684SP"],
      ["\u6280\u80fd,\u9b54\u6cd5\u4e0d\u53ef\u4f7f\u7528"],
    ],
  };
  b[a.LAZINESS] = {
    icon: "Masquerade_LAZINESS.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9762\u5177:\u61d2\u6563", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u79fb\u52a8\u901f\u5ea6,\u56de\u907f\u7387\u964d\u4f4e"],
      ["\u548f\u5531\u65f6\u95f4\u589e\u52a0"],
      [
        "\u4f7f\u7528\u6280\u80fd\u65f6\u4f1a\u989d\u5916\u6d88\u8017\u4e00\u5b9a\u91cf\u7684SP",
      ],
    ],
  };
  b[a.UNLUCKY] = {
    icon: "Masquerade_UNLUCKY.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9762\u5177:\u4e0d\u5e78", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u66b4\u51fb\u7387\u964d\u4f4e"],
      ["\u5b8c\u5168\u56de\u907f\u7387\u964d\u4f4e"],
      [
        "\u4f7f\u7528\u6280\u80fd\u65f6\u4f1a\u6d88\u8017\u4e00\u5b9a\u91cf\u7684\u91d1\u5e01",
      ],
      [
        "\u88ab\u653b\u51fb\u65f6\u4f1a\u53d1\u751f\u7279\u5b9a\u5f02\u5e38\u72b6\u51b5",
      ],
    ],
  };
  b[a.WEAKNESS] = {
    icon: "Masquerade_WEAKNESS.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9762\u5177:\u8870\u5f31", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u51cf\u5c11\u4e00\u5b9a\u91cf\u7684MHP"],
      [
        "\u88ab\u653b\u51fb\u65f6\u4f1a\u5378\u9664\u6b66\u5668,\u76fe\u724c\u88c5\u5907",
      ],
      ["\u6b66\u5668,\u76fe\u724c\u4e0d\u53ef\u88c5\u5907"],
    ],
  };
  b[a.STEELBODY] = {
    icon: "steelbody.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u91d1\u521a\u4e0d\u574f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["DEF , MDEF \u88ab\u56fa\u5b9a\u4e3a\u8f83\u9ad8\u7684\u6570\u503c"],
      [
        "\u5728\u6301\u7eed\u65f6\u95f4\u4e2d\u4e0d\u80fd\u7528\u4efb\u4f55\u6280\u80fd",
      ],
      [
        "\u79fb\u52a8\u901f\u5ea6\u548c\u653b\u51fb\u901f\u5ea6\u4f1a\u51cf\u4f4e ",
      ],
    ],
  };
  b[a.LG_REFLECTDAMAGE] = {
    icon: "\u00b8\u00ae\u00c7\u00c3\u00b7\u00ba\u00c6\u00ae\u00b5\u00a5\u00b9\u00cc\u00c1\u00f6.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u53cd\u5c04\u4f24\u5bb3", "rgb(190, 190, 250)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u628a\u906d\u53d7\u7684\u90e8\u5206\u4f24\u5bb3\u5206\u6563\u5230\u5468\u56f4",
      ],
      ["\u6bcf\u79d2\u4f1a\u6d88\u8017\u4e00\u5b9a\u91cf\u7684SP"],
    ],
  };
  b[a.MVPCARD_TAOGUNKA] = {
    icon: "MVPCARD_TAOGUNKA.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5854\u5965\u7fa4\u5361\u5377\u8f74", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MHP\u589e\u52a0"],
      ["DEF/MDEF\u51cf\u5c11"],
    ],
  };
  b[a.MVPCARD_MISTRESS] = {
    icon: "MVPCARD_MISTRESS.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8702\u540e\u5377\u8f74", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4e0d\u6d88\u8017\u9b54\u529b\u77ff\u77f3\u4e0b\u53ef\u4f7f\u7528\u9b54\u6cd5",
      ],
      ["SP\u6d88\u8017\u91cf\u589e\u52a0"],
    ],
  };
  b[a.MVPCARD_ORCHERO] = {
    icon: "MVPCARD_ORCHERO.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u517d\u4eba\u82f1\u96c4\u5377\u8f74", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4e0d\u4f1a\u9677\u5165\u6655\u7729"],
    ],
  };
  b[a.MVPCARD_ORCLORD] = {
    icon: "MVPCARD_ORCLORD.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u517d\u4eba\u914b\u957f\u5377\u8f74", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4f1a\u53cd\u5c04\u90e8\u5206\u8fd1\u8ddd\u79bb\u7269\u7406\u653b\u51fb",
      ],
    ],
  };
  b[a.HANDICAPSTATE_NORECOVER] = {
    icon: "NORECOVER.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4e0d\u53ef\u6062\u590d\u72b6\u6001", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["HP,SP\u53d8\u4e0d\u53ef\u6062\u590d\u72b6\u6001"],
    ],
  };
  b[a.SET_NUM_DEF] = {
    icon: "SETDEF.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["DEF\u56fa\u5b9a\u6210\u7279\u5b9a\u7684\u6570\u503c"],
    ],
  };
  b[a.SET_NUM_MDEF] = {
    icon: "SETMDEF.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 1,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["MDEF\u56fa\u5b9a\u6210\u7279\u5b9a\u7684\u6570\u503c"],
    ],
  };
  b[a.SET_PER_DEF] = {
    icon: "SETDEF.tga",
    descript: [["DEF\u56fa\u5b9a\u6210\u7279\u5b9a\u767e\u5206\u6bd4"]],
  };
  b[a.SET_PER_MDEF] = {
    icon: "SETMDEF.tga",
    descript: [["MDEF\u56fa\u5b9a\u6210\u7279\u5b9a\u767e\u5206\u6bd4"]],
  };
  b[a.EXTREMITYFIST] = {
    icon: "EXTREMITYFIST.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u963f\u4fee\u7f57\u9738\u51f0\u62f3", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["SP\u4e0d\u53ef\u6062\u590d"],
    ],
  };
  b[a.ATTHASTE_CASH] = {
    icon: "ASPDCASH.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["ASPD\u5f3a\u5316\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u901f\u5ea6\u589e\u52a0"],
    ],
  };
  b[a.RWC2011] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["Firecracker", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["Increases all stats"],
      ["Increases ATK, MATK"],
    ],
  };
  b[a.PHI_DEMON] = {
    icon: "PHIDEMON.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u53e4\u4ee3\u795e\u7075\u5e73\u5b89\u7b26", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5bf9\u6076\u9b54\u7cfb\u602a\u7684"],
      ["\u7269\u7406,\u9b54\u6cd5\u4f24\u5bb3\u589e\u52a0"],
    ],
  };
  b[a.GM_BATTLE] = {
    icon: "icon02.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9ad8\u7ea7\u6218\u6597\u7075\u836f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK,MATK\u589e\u52a0"],
      ["MHP,MSP\u51cf\u5c11"],
    ],
  };
  b[a.GM_BATTLE2] = {
    icon: "icon02.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9ad8\u7ea7\u6218\u6597\u7075\u836f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK,MATK\u589e\u52a0"],
      ["MHP,MSP\u51cf\u5c11"],
    ],
  };
  b[a.RWC_SCROLL2011] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["Red Booster", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["Increases ATK and MATK"],
      ["Increases ASPD"],
      ["Reduced variable casting time"],
      ["When receiving Physical and Magical damage"],
      ["there is a chance to cast Improve Concentration skill"],
    ],
  };
  b[a.MEIKYOUSISUI] = {
    icon: "MEIKYOUSISUI.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u660e\u955c\u6b62\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u53ef\u6062\u590d\u4e00\u5b9a\u91cf\u7684HP"],
      ["\u53ef\u6062\u590d\u4e00\u5b9a\u91cf\u7684SP"],
      ["\u4e0d\u53ef\u79fb\u52a8"],
      ["\u6709\u51e0\u7387\u4e0d\u53d7\u5230\u4f24\u5bb3"],
      ["\u4f7f\u7528\u6280\u80fd\u65f6\u4f1a\u968f\u673a\u89e3\u9664Debuff"],
      ["\u906d\u53d7\u4f24\u5bb3\u65f6\u4f1a\u89e3\u9664\u6548\u679c"],
    ],
  };
  b[a.IZAYOI] = {
    icon: "IZAYOI.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7b2c16\u4e2a\u591c\u665a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u89e3\u9664\u56fa\u5b9a\u548f\u5531"],
      ["\u53d8\u52a8\u548f\u5531\u964d\u4f4e"],
      ["\u7269\u54c1\u7684MATK\u589e\u52a0"],
    ],
  };
  b[a.KG_KAGEHUMI] = {
    icon: "KG_KAGEHUMI.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8e0f\u5f71", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4e0d\u80fd\u79fb\u52a8"],
      ["\u89e3\u9664\u7279\u5b9a\u6280\u80fd"],
      [
        "\u9690\u8eab\u3001\u77ac\u95f4\u79fb\u52a8\u6280\u80fd\u3001\u9053\u5177\u7b49\u7686\u4e0d\u53ef\u4f7f\u7528",
      ],
      ["\u7d27\u6025\u547c\u53eb\u6280\u80fd\u4e0d\u53ef\u4f7f\u7528"],
    ],
  };
  b[a.KYOMU] = {
    icon: "KYOMU.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u865a\u65e0\u7f25\u7f08\u4e4b\u5f71", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5c06\u7269\u7406\u548c\u9b54\u6cd5\u653b\u51fb\u53cd\u5c04\u6548\u679c\u53d8\u65e0\u6548",
      ],
      [
        "\u4f7f\u7528\u6280\u80fd\u65f6\u6709\u51e0\u7387\u4f7f\u7528\u6280\u80fd\u4f1a\u5931\u8d25",
      ],
    ],
  };
  b[a.KAGEMUSYA] = {
    icon: "KAGEMUSYA.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5f71\u5b50\u6b66\u58eb", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8d4b\u4e88\u4e8c\u5200\u8fde\u51fb\u6548\u679c"],
      ["\u6bcf\u79d2\u6d88\u8017\u4e00\u5b9a\u91cf\u7684SP"],
      [
        "\u516b\u65b9\u98de\u5200\uff0c\u7206\u70b8\u98de\u5200\u4f24\u5bb3\u589e\u52a0",
      ],
      [
        "\u98ce\u9b54\u98de\u9556\uff0c\u5e7d\u51a5\u5341\u5b57\u65a9\u4f24\u5bb3\u589e\u52a0",
      ],
    ],
  };
  b[a.ZANGETSU] = {
    icon: "ZANGETSU.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u53d8\u5f62\u7684\u4e0a\u5f26\u6708", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u4f9d\u7167BaseLv\u8d4b\u4e88\u6548\u679c"],
    ],
  };
  b[a.GENSOU] = {
    icon: "gensou.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9634\u6708\u7684\u5e7b\u5f71", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["HP\u548cSP\u4f1a\u968f\u673a\u589e\u52a0\u6216\u51cf\u5c11"],
      ["\u906d\u53d7\u9b54\u6cd5\u653b\u51fb\u65f6"],
      [
        "\u6709\u4e00\u534a\u4f24\u5bb3\u4f1a\u8f6c\u79fb\u5230\u5bf9\u65b9\u8eab\u4e0a",
      ],
    ],
  };
  b[a.AKAITSUKI] = {
    icon: "akaitsuki.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4e0d\u7965\u7684\u7ea2\u6708", "rgb(250, 100, 100)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u7279\u5b9a\u6062\u590dHP\u6280\u80fd"],
      ["\u5e76\u4e0d\u4f1a\u6062\u590d,\u53cd\u800c\u4f1a\u53d7\u4f24"],
    ],
  };
  b[a.MYSTICPOWDER] = {
    icon: "MYSTICPOWDER.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u795e\u5947\u7c89\u672b", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["FLEE,LUK\u589e\u52a0"],
    ],
  };
  b[a.ACARAJE] = {
    icon: "i_ONEHAND.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u963f\u5361\u62c9\u6770\u6cb9\u70b8\u997c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u901f\u5ea6,HIT\u589e\u52a0"],
    ],
  };
  b[a.M_LIFEPOTION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u795e\u5947\u751f\u547d\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf3\u79d2\u589e\u52a0\u4e00\u5b9a\u91cf\u7684HP"],
      ["\u72c2\u6012\u4e4b\u67aa\u4e2d\u65f6\u65e0\u6548"],
    ],
  };
  b[a.FLOWER_LEAF] = {
    icon: "FLOWER_LEAF.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8302\u76db\u7684\u82b1\u74e3", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["Flee\u589e\u52a0"],
      ["\u5b8c\u5168\u56de\u907f\u589e\u52a0"],
    ],
  };
  b[a.ZONGZI_POUCH_TRANS] = {
    icon: "UNLIMIT.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u7aef\u5348\u8282\u5e86\u5178", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u6240\u6709\u7684\u5c5e\u6027"],
    ],
  };
  b[a.PACKING_ENVELOPE1] = {
    icon: "FRIGG_SONG.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u5f3a\u70c8\u768430\u79d2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK\u589e\u52a0"],
    ],
  };
  b[a.PACKING_ENVELOPE2] = {
    icon: "FRIGG_SONG.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u806a\u660e\u768430\u79d2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MATK\u589e\u52a0"],
    ],
  };
  b[a.PACKING_ENVELOPE3] = {
    icon: "FRIGG_SONG.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u4f53\u529b\u768430\u79d2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MHP\u589e\u52a0"],
    ],
  };
  b[a.PACKING_ENVELOPE4] = {
    icon: "FRIGG_SONG.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u9b54\u529b\u768430\u79d2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MSP\u589e\u52a0"],
    ],
  };
  b[a.PACKING_ENVELOPE5] = {
    icon: "FRIGG_SONG.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u8f7b\u76c8\u768430\u79d2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["FLEE\u589e\u52a0"],
    ],
  };
  b[a.PACKING_ENVELOPE6] = {
    icon: "FRIGG_SONG.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u53d8\u5feb\u768430\u79d2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ASPD\u589e\u52a0"],
    ],
  };
  b[a.PACKING_ENVELOPE7] = {
    icon: "FRIGG_SONG.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u53ef\u9760\u768430\u79d2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["DEF\u589e\u52a0"],
    ],
  };
  b[a.PACKING_ENVELOPE8] = {
    icon: "FRIGG_SONG.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u5b89\u5168\u768430\u79d2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MDEF\u589e\u52a0"],
    ],
  };
  b[a.PACKING_ENVELOPE9] = {
    icon: "FRIGG_SONG.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u5e78\u8fd0\u768430\u79d2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["CRI\u589e\u52a0"],
    ],
  };
  b[a.PACKING_ENVELOPE10] = {
    icon: "FRIGG_SONG.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u548c\u8c10\u768430\u79d2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["HIT\u589e\u52a0"],
    ],
  };
  b[a.B_TRAP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6697\u9ed1\u5730\u72f1", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u79fb\u52a8\u901f\u5ea6\u51cf\u6162"],
    ],
  };
  b[a.E_CHAIN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u65e0\u9650\u8fde\u9501", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6709\u51e0\u7387\u53d1\u52a8\u8fde\u9501\u51b2\u51fb"],
    ],
  };
  b[a.C_MARKER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8840\u8272\u70d9\u5370", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["FLEE\u51cf\u5c11"],
    ],
  };
  b[a.C_MARKER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u767d\u91d1\u796d\u575b", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK\u589e\u52a0"],
      ["\u6297\u4e0d\u6b7b\u5c5e\u6027\u589e\u52a0"],
    ],
  };
  b[a.C_MARKER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6bc1\u706d\u91cd\u51fb", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6297\u65e0\u5c5e\u6027\u51cf\u5c11"],
    ],
  };
  b[a.ANTI_M_BLAST] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6bc1\u706d\u91cd\u51fb", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6297\u65e0\u5c5e\u6027\u51cf\u5c11"],
    ],
  };
  b[a.VITALIZE_POTION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6d3b\u6027\u5316\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK,MATK\u589e\u52a0"],
      ["\u6cbb\u6108\u548c\u9053\u5177\u6062\u590d\u6548\u80fd\u589e\u52a0"],
    ],
  };
  b[a.MAGIC_CANDY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u6cd5\u7cd6\u679c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MATK\u589e\u52a0"],
      ["\u56fa\u5b9a\u548f\u5531\u51cf\u5c11"],
      ["\u548f\u5531\u4e0d\u4f1a\u4e2d\u65ad"],
      ["\u6bcf10\u79d2\u4f1a\u51cf\u5c11\u4e00\u5b9a\u91cf\u7684SP"],
    ],
  };
  b[a.ALMIGHTY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4e07\u80fd\u5e74\u7cd5", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK,MATK\u589e\u52a0"],
    ],
  };
  b[a.SWORDCLAN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6218\u58eb\u7f81\u7eca", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["STR+1,VIT+1"],
      ["MHP+30,MSP+10"],
    ],
  };
  b[a.ARCWANDCLAN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u6cd5\u5e08\u7f81\u7eca", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["INT+1,DEX+1"],
      ["MHP+30,MSP+10"],
    ],
  };
  b[a.GOLDENMACECLAN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u670d\u4e8b\u7f81\u7eca", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["LUK+1,INT+1"],
      ["MHP+30,MSP+10"],
    ],
  };
  b[a.CROSSBOWCLAN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5f13\u7bad\u624b\u7f81\u7eca", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["DEX+1,AGI+1"],
      ["MHP+30,MSP+10"],
    ],
  };
  b[a.EXPIATIO] = {
    icon: "expiatio.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8d4e\u7f6a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5bf9\u8c61\u7684\u9632\u5fa1\u90e8\u5206\u5ffd\u89c6"],
    ],
  };
  b[a.FULL_THROTTLE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u52a0\u5927\u6cb9\u95e8", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u9ad8\u79fb\u52a8\u901f\u5ea6"],
      ["All State\u589e\u52a0"],
    ],
  };
  b[a.REBOUND] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u56de\u5f39", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u51cf\u5c11\u79fb\u52a8\u901f\u5ea6"],
      ["\u65e0\u6cd5\u81ea\u7136\u6062\u590dHP,SP"],
    ],
  };
  b[a.PROMOTE_HEALTH_RESERCH] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["HP\u589e\u52a0\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MHP\u589e\u52a0"],
    ],
  };
  b[a.ENERGY_DRINK_RESERCH] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["SP\u589e\u52a0\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MSP\u589e\u52a0"],
    ],
  };
  b[a.AID_PERIOD_DEADPENALTY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u964d\u4f4e\u6b7b\u4ea1\u60e9\u7f5a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u964d\u4f4e\u6b7b\u4ea1\u60e9\u7f5a"],
    ],
  };
  b[a.AID_PERIOD_ADDSTOREITEMCOUNT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u589e\u52a0\u4ed3\u5e93\u683c\u6570", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u4ed3\u5e93\u683c\u6570"],
    ],
  };
  b[a.AID_PERIOD_RECEIVEITEM_2ND] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u63d0\u9ad8\u6389\u5b9d\u7387", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u9ad8\u6389\u5b9d\u7387"],
    ],
  };
  b[a.AID_PERIOD_PLUSEXP_2ND] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u63d0\u9ad8\u7ecf\u9a8c\u503c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u9ad8\u7ecf\u9a8c\u503c"],
    ],
  };
  b[a.EP16_DEF] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u660e\u4eae\u7684\u5723\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4ece\u4eea\u5f0f\u7684\u623f\u95f4,\u4fb5\u7565\u666e\u9686\u5fb7\u62c9\u526f\u672c\u4e2d\u53d7\u5230\u7684\u4f24\u5bb3-10%",
      ],
    ],
  };
  b[a.ATK_POPCORN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u589e\u52a0\u653b\u51fb\u529b", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK+3%"],
    ],
  };
  b[a.MATK_POPCORN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u6cd5\u653b\u51fb\u529b\u589e\u52a0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MATK+3%"],
    ],
  };
  b[a.ASPD_POPCORN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u589e\u52a0\u653b\u51fb\u901f\u5ea6", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u540e\u5ef6\u8fdf-10%"],
    ],
  };
  b[a.CHUSEOK_MONDAY] = {
    icon: "gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5c5e\u6027\u5f3a\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6697\u5c5e\u6027\u602a\u7269\u8ffd\u52a0\u4f24\u5bb3"],
      ["\u5723\u5c5e\u6027\u8010\u6027\u589e\u52a0"],
    ],
  };
  b[a.CHUSEOK_TUESDAY] = {
    icon: "gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5c5e\u6027\u5f3a\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5730\u5c5e\u6027\u602a\u7269\u8ffd\u52a0\u4f24\u5bb3"],
      ["\u706b\u5c5e\u6027\u8010\u6027\u589e\u52a0"],
    ],
  };
  b[a.CHUSEOK_WEDNESDAY] = {
    icon: "gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5c5e\u6027\u5f3a\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u706b\u5c5e\u6027\u602a\u7269\u8ffd\u52a0\u4f24\u5bb3"],
      ["\u6c34\u5c5e\u6027\u8010\u6027\u589e\u52a0"],
    ],
  };
  b[a.CHUSEOK_THURSDAY] = {
    icon: "gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5c5e\u6027\u5f3a\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u98ce\u5c5e\u6027\u602a\u7269\u8ffd\u52a0\u4f24\u5bb3"],
      ["\u5730\u5c5e\u6027\u8010\u6027\u589e\u52a0"],
    ],
  };
  b[a.CHUSEOK_FRIDAY] = {
    icon: "gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5c5e\u6027\u5f3a\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6c34\u5c5e\u6027\u602a\u7269\u8ffd\u52a0\u4f24\u5bb3"],
      ["\u98ce\u5c5e\u6027\u8010\u6027\u589e\u52a0"],
    ],
  };
  b[a.CHUSEOK_WEEKEND] = {
    icon: "gogi.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5c5e\u6027\u5f3a\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u5c5e\u6027\u602a\u7269\u8ffd\u52a0\u4f24\u5bb3"],
      ["\u65e0\u5c5e\u6027\u8010\u6027\u589e\u52a0"],
    ],
  };
  b[a.JUMPINGCLAN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8df3\u7ea7\u516c\u4f1a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["All State + 1"],
    ],
  };
  b[a.LHZ_DUN_N1] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u575f\u5893\u7684\u5e87\u4f51", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5bf9\u90e8\u5206\u6218\u6b7b\u8005\u9b54\u7269\u7684\u4f24\u5bb3\u589e\u52a0",
      ],
      [
        "LIST:\u5251\u58eb\uff0c\u76d7\u8d3c\u7cfb\u5217\u6218\u6b7b\u8005\u9b54\u7269",
      ],
      [
        "\u4ece\u90e8\u5206\u6218\u6b7b\u8005\u9b54\u7269\u5904\u83b7\u5f97\u7684\u4f24\u5bb3\u51cf\u5c11",
      ],
      [
        "LIST:\u670d\u4e8b\uff0c\u5546\u4eba\u7cfb\u5217\u6218\u6b7b\u8005\u9b54\u7269",
      ],
      ["MVP\u9b54\u7269\u9664\u5916"],
    ],
  };
  b[a.LHZ_DUN_N2] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u575f\u5893\u7684\u5e87\u4f51", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5bf9\u90e8\u5206\u6218\u6b7b\u8005\u9b54\u7269\u7684\u4f24\u5bb3\u589e\u52a0",
      ],
      [
        "LIST:\u670d\u4e8b\uff0c\u5546\u4eba\u7cfb\u5217\u6218\u6b7b\u8005\u9b54\u7269",
      ],
      [
        "\u4ece\u90e8\u5206\u6218\u6b7b\u8005\u9b54\u7269\u5904\u83b7\u5f97\u7684\u4f24\u5bb3\u51cf\u5c11",
      ],
      [
        "LIST:\u9b54\u6cd5\u5e08\uff0c\u5f13\u7bad\u624b\u6218\u6b7b\u8005\u9b54\u7269",
      ],
      ["MVP\u9b54\u7269\u9664\u5916"],
    ],
  };
  b[a.LHZ_DUN_N3] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u575f\u5893\u7684\u5e87\u4f51", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5bf9\u90e8\u5206\u6218\u6b7b\u8005\u9b54\u7269\u7684\u4f24\u5bb3\u589e\u52a0",
      ],
      [
        "LIST\uff1a\u9b54\u6cd5\u5e08\uff0c\u5f13\u7bad\u624b\u6218\u6b7b\u8005\u9b54\u7269",
      ],
      [
        "\u4ece\u90e8\u5206\u6218\u6b7b\u8005\u9b54\u7269\u5904\u83b7\u5f97\u7684\u4f24\u5bb3\u51cf\u5c11",
      ],
      [
        "LIST\uff1a\u5251\u58eb\uff0c\u76d7\u8d3c\u7cfb\u5217\u6218\u6b7b\u8005\u9b54\u7269",
      ],
      ["MVP\u9b54\u7269\u9664\u5916"],
    ],
  };
  b[a.LHZ_DUN_N4] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u575f\u5893\u7684\u5e87\u4f51", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u5bf9\u90e8\u5206\u6218\u6b7b\u8005\u9b54\u7269\u7684\u4f24\u5bb3\u589e\u52a0",
      ],
      ["LIST\uff1a\u6218\u6b7b\u8005\u575f\u5893MVP\u9b54\u7269"],
      [
        "\u4ece\u90e8\u5206\u6218\u6b7b\u8005\u9b54\u7269\u5904\u83b7\u5f97\u7684\u4f24\u5bb3\u51cf\u5c11",
      ],
      ["LIST\uff1a\u6218\u6b7b\u8005\u575f\u5893MVP\u9b54\u7269"],
    ],
  };
  b[a.GS_MADNESSCANCEL] = {
    icon: "i_MADNESS.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u75af\u72c2\u51ef\u65af\u4e50", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK\u589e\u52a0"],
      ["\u653b\u901f\u589e\u52a0"],
      ["\u65e0\u6cd5\u79fb\u52a8"],
    ],
  };
  b[a.GS_GATLINGFEVER] = {
    icon: "i_FEVER.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u683c\u6797\u72c2\u70ed", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u901f,\u4f24\u5bb3\u589e\u52a0"],
      ["\u56de\u907f\u7387,\u79fb\u52a8\u901f\u5ea6\u51cf\u5c11"],
    ],
  };
  b[a.GS_ACCURACY] = {
    icon: "i_ACCURACY.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u547d\u4e2d\u7387\u9012\u589e", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u547d\u4e2d\u7387\u589e\u52a0"],
      ["DEX\u589e\u52a0"],
      ["AGI\u589e\u52a0"],
    ],
  };
  b[a.GS_MAGICAL_BULLET] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u672f\u5f39", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9b54\u6cd5\u4f24\u5bb3\u589e\u52a0"],
    ],
  };
  b[a.H_MINE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7834\u574f\u6012\u543c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u7834\u574f\u6012\u543c\u72b6\u6001"],
    ],
  };
  b[a.GS_ADJUSTMENT] = {
    icon: "i_ADJUSTMENT.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7ec8\u6781\u95ea\u8eb2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u547d\u4e2d\u7387\u51cf\u5c11"],
      ["\u56de\u907f\u7387\u589e\u52a0"],
      [
        "\u8fdc\u7a0b\u7269\u7406\u653b\u51fb\u53d7\u5230\u7684\u4f24\u5bb3\u51cf\u5c11",
      ],
    ],
  };
  b[a.HEAT_BARREL] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u52a0\u901f\u5b50\u5f39", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK\u589e\u52a0"],
      ["HIT\u51cf\u5c11"],
      ["\u653b\u901f\u589e\u52a0"],
      ["\u56fa\u5b9a\u548f\u5531\u51cf\u5c11"],
    ],
  };
  b[a.HEAT_BARREL_AFTER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u540e\u9057\u75c7", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9053\u5177\u65e0\u6cd5\u4f7f\u7528"],
      ["\u6280\u80fd\u65e0\u6cd5\u4f7f\u7528"],
      ["\u65e0\u6cd5\u653b\u51fb"],
    ],
  };
  b[a.DORAM_BUF_01] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5361\u9c81\u54c7\u725b\u5976", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["3\u5206\u949f\u5185\u6bcf10\u79d2\u6062\u590dHP10"],
    ],
  };
  b[a.DORAM_BUF_02] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7f57\u52d2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["3\u5206\u949f\u5185\u6bcf10\u79d2\u6062\u590dSP5"],
    ],
  };
  b[a.SPRITEMABLE] = {
    descript: [["\u7075\u9b42\u9b54\u73e0", "rgb(155, 202, 155)"]],
  };
  b[a.SUHIDE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8eb2\u85cf", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.FRESHSHRIMP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9c9c\u867e", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6062\u590d\u4e00\u5b9a\u91cf\u7684HP"],
    ],
  };
  b[a.SHRIMP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u867e\u7fa4", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK,MATK+10%"],
    ],
  };
  b[a.TUNAPARTY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u91d1\u67aa\u9c7c\u6d3e\u5bf9", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u53ef\u9632\u5fa1\u4e00\u5b9a\u91cf\u7684\u4f24\u5bb3"],
    ],
  };
  b[a.ARCLOUSEDASH] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5377\u7532\u866b\u66b4\u51b2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u79fb\u52a8\u901f\u5ea6"],
      ["AGI\u589e\u52a0"],
    ],
  };
  b[a.BITESCAR] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u54ac\u4f24", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["2\u79d2\u949f\u6655\u7729"],
      ["MHP\u6bcf\u79d2\u5931\u53bb\u4e00\u5b9a\u91cf"],
    ],
  };
  b[a.SV_ROOTTWIST] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6839\u830e\u7f20\u7ed5", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u6cd5\u79fb\u52a8"],
      ["\u6bcf\u79d2100\u7684\u65e0\u5c5e\u6027\u4f24\u5bb3"],
    ],
  };
  b[a.CATNIPPOWDER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6492\u7c89", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK,MATK\u51cf\u5c11"],
      ["\u79fb\u52a8\u901f\u5ea6\u51cf\u5c11"],
      ["HP,SP\u6062\u590d\u529b\u589e\u52a0"],
    ],
  };
  b[a.SU_STOOP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4fef\u8eab", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u8eab\u4f53\u5448\u5706\u5f62\u4fef\u8eab\u51cf\u5c11\u53d7\u5230\u7684\u4f24\u5bb3",
      ],
    ],
  };
  b[a.HISS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5636\u5636\u58f0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5b8c\u5168\u56de\u907f,\u79fb\u52a8\u901f\u5ea6\u589e\u52a0"],
    ],
  };
  b[a.NYANGGRASS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u55b5\u55b5\u8349", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u89c6\u88c5\u5907\u9053\u5177\u7684\u9632\u5fa1\u529b"],
    ],
  };
  b[a.CHATTERING] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u55b5\u55b5\u4e0d\u4f11", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["5\u79d2\u5185ATK,MATK+100"],
      ["10\u79d2\u5185\u79fb\u52a8\u901f\u5ea6\u589e\u52a0"],
    ],
  };
  b[a.GROOMING] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8214\u6bdb", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["FLEE+100"],
    ],
  };
  b[a.PROTECTIONOFSHRIMP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9c9c\u867e\u7684\u5b88\u62a4", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["SP\u6062\u590d\u529b\u589e\u52a0"],
    ],
  };
  b[a.CURSEDCIRCLE_TARGET] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5492\u7f1a\u9635", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u8303\u56f4\u5185\u6240\u6709\u5bf9\u8c61\u65e0\u6cd5\u79fb\u52a8\u548c\u653b\u51fb",
      ],
      ["\u589e\u52a0\u72b6\u6001\u5f02\u5e38\u6c89\u9ed8"],
    ],
  };
  b[a.MANDRAGORA] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u66fc\u9640\u7f57\u9b54\u82b1\u7684\u5c16\u53eb",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["INT,SP\u51cf\u5c11"],
      ["\u589e\u52a0\u6280\u80fd\u56fa\u5b9a\u548f\u5531"],
    ],
  };
  b[a.CRUSHSTRIKE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u91cd\u51fb\u5f3a\u88ad", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u8fd1\u8ddd\u79bb\u7269\u7406\u653b\u51fb\u529b"],
    ],
  };
  b[a.EXEEDBREAK] = {
    icon: "exeedbreak.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u84c4\u52bf\u5f85\u53d1", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u6700\u521d\u4e00\u51fb\u7684\u653b\u51fb\u529b"],
    ],
  };
  b[a.KINGS_GRACE] = {
    icon: "kings_grace.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u738b\u4e4b\u5b88\u62a4", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u654c"],
      ["\u7269\u54c1\u4e0d\u53ef\u4f7f\u7528"],
      ["\u65e0\u6cd5\u79fb\u52a8\u548c\u653b\u51fb"],
    ],
  };
  b[a.STASIS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u529b\u51bb\u7ed3", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u8303\u56f4\u5185\u6240\u6709\u5bf9\u8c61\u65e0\u6cd5\u65bd\u5c55\u9b54\u6cd5,\u5531\u6b4c,\u5408\u5531",
      ],
    ],
  };
  b[a.MAGNETICFIELD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u78c1\u573a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u8303\u56f4\u5185\u6240\u6709\u5bf9\u8c61\u65e0\u6cd5\u79fb\u52a8,\u5531\u6b4c,\u5408\u5531",
      ],
      ["SP\u51cf\u5c11"],
    ],
  };
  b[a.VACUUM_EXTREME] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6781\u9650\u7a7a\u865a", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u62c9\u6765\u8303\u56f4\u5185\u6240\u6709\u5bf9\u8c61"],
      ["\u65e0\u6cd5\u79fb\u52a8"],
    ],
  };
  b[a.BODYSTATE_STONECURSE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u77f3\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u6cd5\u56de\u907f,\u884c\u52a8"],
      ["MHP\u51cf\u5c11"],
    ],
  };
  b[a.BODYSTATE_FREEZING] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u51b0\u51bb", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u6cd5\u56de\u907f,\u884c\u52a8"],
      ["\u7269\u7406,\u9b54\u6cd5\u9632\u5fa1\u529b\u51cf\u5c11"],
    ],
  };
  b[a.BODYSTATE_STUN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6655\u7729", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u6cd5\u56de\u907f,\u884c\u52a8"],
    ],
  };
  b[a.BODYSTATE_SLEEP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7761\u7720", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u6cd5\u56de\u907f,\u884c\u52a8"],
      ["\u66b4\u51fb\u4f24\u5bb3\u6982\u7387\u589e\u52a0"],
    ],
  };
  b[a.BODYSTATE_STONECURSE_ING] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u77f3\u5316\u8fdb\u884c\u4e2d", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.BODYSTATE_BURNNING] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7740\u706b", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf3\u79d2\u53d7\u5230\u4f24\u5bb3"],
      ["\u9b54\u6cd5\u9632\u5fa1\u529b\u51cf\u5c11"],
    ],
  };
  b[a.BODYSTATE_IMPRISON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9694\u79bb", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u65e0\u6cd5\u4f7f\u7528\u79fb\u52a8,\u653b\u51fb,\u6280\u80fd,\u9053\u5177",
      ],
    ],
  };
  b[a.HEALTHSTATE_POISON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6bd2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u89c6\u91ce\u6a21\u7cca"],
      ["\u7269\u7406\u9632\u5fa1\u529b\u51cf\u5c11"],
      ["\u6bcf3\u79d2MHP\u51cf\u5c11"],
    ],
  };
  b[a.HEALTHSTATE_CURSE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8bc5\u5492", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u79fb\u52a8\u901f\u5ea6,\u7269\u7406\u653b\u51fb\u529b\u51cf\u5c11"],
      ["LUK\u6570\u503c0"],
    ],
  };
  b[a.HEALTHSTATE_SILENCE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6c89\u9ed8", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u6cd5\u4f7f\u7528\u6280\u80fd"],
    ],
  };
  b[a.HEALTHSTATE_CONFUSION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6df7\u4e71", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u79fb\u52a8\u65f6\u968f\u673a\u79fb\u52a8"],
    ],
  };
  b[a.ATTACK_PROPERTY_NOTHING] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7ed9\u6b66\u5668\u8d4b\u4e88\u65e0\u5c5e\u6027",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.ATTACK_PROPERTY_WATER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7ed9\u6b66\u5668\u8d4b\u4e88\u6c34\u5c5e\u6027",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.ATTACK_PROPERTY_GROUND] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7ed9\u6b66\u5668\u8d4b\u4e88\u5730\u5c5e\u6027",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.HEALTHSTATE_HEAVYPOISON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6bd2\u6db2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf\u79d2HP\u51cf\u5c11"],
    ],
  };
  b[a.HEALTHSTATE_FEAR] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6050\u6016", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["2\u79d2\u5185\u65e0\u6cd5\u79fb\u52a8"],
      ["\u547d\u4e2d\u7387,\u56de\u907f\u7387\u51cf\u5c11"],
    ],
  };
  b[a.ATTACK_PROPERTY_FIRE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7ed9\u6b66\u5668\u8d4b\u4e88\u706b\u5c5e\u6027",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.ATTACK_PROPERTY_WIND] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7ed9\u6b66\u5668\u8d4b\u4e88\u98ce\u5c5e\u6027",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.ATTACK_PROPERTY_POISON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7ed9\u6b66\u5668\u8d4b\u4e88\u6bd2\u5c5e\u6027",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.ATTACK_PROPERTY_SAINT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7ed9\u6b66\u5668\u8d4b\u4e88\u5723\u5c5e\u6027",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.ATTACK_PROPERTY_DARKNESS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7ed9\u6b66\u5668\u8d4b\u4e88\u6697\u5c5e\u6027",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.ATTACK_PROPERTY_TELEKINESIS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7ed9\u6b66\u5668\u8d4b\u4e88\u5ff5\u5c5e\u6027",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.ATTACK_PROPERTY_UNDEAD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7ed9\u6b66\u5668\u8d4b\u4e88\u4e0d\u6b7b\u5c5e\u6027",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.RESIST_PROPERTY_NOTHING] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u65e0\u5c5e\u6027\u8010\u6027", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.RESIST_PROPERTY_WATER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6c34\u5c5e\u6027\u8010\u6027", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.RESIST_PROPERTY_GROUND] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5730\u5c5e\u6027\u8010\u6027", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.RESIST_PROPERTY_FIRE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u706b\u5c5e\u6027\u8010\u6027", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.RESIST_PROPERTY_WIND] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u98ce\u5c5e\u6027\u8010\u6027", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.RESIST_PROPERTY_POISON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6bd2\u5c5e\u6027\u8010\u6027", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.RESIST_PROPERTY_SAINT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5723\u5c5e\u6027\u8010\u6027", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.RESIST_PROPERTY_DARKNESS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6697\u5c5e\u6027\u8010\u6027", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.RESIST_PROPERTY_TELEKINESIS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5ff5\u5c5e\u6027\u8010\u6027", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.RESIST_PROPERTY_UNDEAD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4e0d\u6b7b\u5c5e\u6027\u8010\u6027", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.EXTRACT_SALAMINE_JUICE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u653b\u901f\u589e\u52a0\u6d53\u7f29\u6c41", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u901f\u589e\u52a0"],
    ],
  };
  b[a.EXTRACT_WHITE_POTION_Z] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6d53\u7f29\u767d\u8272\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["HP\u81ea\u7136\u6062\u590d\u901f\u5ea6\u589e\u52a0"],
    ],
  };
  b[a.OVERLAPEXPUP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7ef5\u7ef5\u5c9b\u732b\u98df\u7f50\u5934", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u72e9\u730e\u9b54\u7269\u65f6"],
      ["\u4eba\u7269\u7ecf\u9a8c\u503c,JOB\u7ecf\u9a8c\u503c\u589e\u52a0"],
    ],
  };
  b[a.AS_RAGGED_GOLEM_CARD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u56de\u907f\u7387\u589e\u52a0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["FLEE+200"],
    ],
  };
  b[a.LIMIT_POWER_BOOSTER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u5e7b\u9999\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK,MATK\u589e\u52a0"],
      ["HIT,FLEE\u589e\u52a0"],
      ["\u653b\u51fb\u901f\u5ea6\u589e\u52a0"],
      ["SP\u6d88\u8017\u91cf\u51cf\u5c11"],
      ["\u51cf\u5c11\u56fa\u5b9a\u548f\u5531"],
    ],
  };
  b[a.GLASTHEIM_TRANS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u60a8\u5904\u4e8e\u751f\u8005\u4e0e\u6b7b\u8005\u7684\u5206\u754c\u7ebf\u4e0a",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["\u7cbe\u795e\u529b-50%\u3002"],
    ],
  };
  b[a.AID_PERIOD_POWER_ACCELERATION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5f3a\u6548\u6218\u6597\u836f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK,MATK+50"],
      ["HP,SP\u6062\u590d\u529b+100%"],
    ],
  };
  b[a.AID_PERIOD_MAX_HP_SP_AVOID] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6d3b\u529b\u836f\u5242", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MaxHP+10%,MaxSP+10%"],
      ["\u5b8c\u5168\u56de\u907f+8"],
    ],
  };
  b[a.AID_PERIOD_ADD_ALL_STATE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4e07\u80fd\u836f\u5242", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["All State + 10"],
    ],
  };
  b[a.INFINITY_DRINK] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6781\u9650\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MaxHP,MaxSP\u589e\u52a0"],
      ["\u66b4\u51fb\u4f24\u5bb3,\u8fdc\u7a0b\u7269\u7406\u4f24\u5bb3,"],
      ["\u5c5e\u6027\u9b54\u6cd5\u653b\u51fb\u529b\u589e\u52a0"],
      ["\u548f\u5531\u4e0d\u4f1a\u4e2d\u65ad"],
    ],
  };
  b[a.RENOVATIO] = {
    icon: "\u00b7\u00b9\u00b3\u00eb\u00b9\u00d9\u00c6\u00bc\u00bf\u00c0.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u51c0\u5316", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf5\u79d2\u56de\u590d\u4e00\u5b9a\u91cf\u7684HP"],
      ["\u5bf9\u4e0d\u6b7b\u5c5e\u6027\u73a9\u5bb6\u65e0\u6548\u3002"],
    ],
  };
  b[a.ANCILLA] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8f85\u52a9\u8005", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6cbb\u6108\u91cf+15%"],
      ["SP\u6062\u590d\u529b+30%\u3002"],
    ],
  };
  b[a.LAUDAAGNUS] = {
    icon: "laudaramus.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7f94\u7f8a\u6b4c\u9882", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u6700\u9ad8HP\u3002"],
    ],
  };
  b[a.LAUDARAMUS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6298\u679d\u8d5e\u9882", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u66b4\u51fb\u4f24\u5bb3\u3002"],
    ],
  };
  b[a.EP16_2_BUFF_SS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5f3a\u5316\u836f\u6c34SS", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ASPD +10"],
    ],
  };
  b[a.EP16_2_BUFF_SC] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5f3a\u5316\u836f\u6c34SC", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["CRI +30"],
    ],
  };
  b[a.EP16_2_BUFF_AC] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5f3a\u5316\u836f\u6c34AC", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u53d8\u52a8\u548f\u5531-80%"],
    ],
  };
  b[a.SACRIFICE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u820d\u547d\u653b\u51fb", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u666e\u901a\u8fd1\u8ddd\u79bb\u7269\u7406\u653b\u51fb"],
      ["\u4f24\u5bb3\u589e\u52a0"],
      ["\u6bcf1\u6b21\u653b\u51fb\u90fd\u4f1a\u6d88\u8017HP"],
    ],
  };
  b[a.SWEETSFAIR_ATK] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u589e\u52a0ATK", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK + 7%"],
    ],
  };
  b[a.SWEETSFAIR_MATK] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u589e\u52a0MATK", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MATK + 7%"],
    ],
  };
  b[a.PYROCLASTIC] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u706b\u5c71\u5c18\u66b4", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u751f\u547d\u4f53\u7684\u653b\u51fb\u4e0e\u4e3b\u4eba\u6240\u6301\u6b66\u5668",
      ],
      ["\u5c5e\u6027\u6682\u65f6\u8f6c\u4e3a\u706b\u5c5e\u6027"],
      ["\u63d0\u5347\u6b66\u5668\u653b\u51fb\u529b"],
    ],
  };
  b[a.SUNSTANCE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u592a\u9633\u82f1\u59ff", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK\u589e\u52a0"],
      ["\u53ef\u4f7f\u7528\u592a\u9633\u7cfb\u5217\u6280\u80fd"],
    ],
  };
  b[a.LUNARSTANCE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6708\u4eae\u82f1\u59ff", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MaxHP\u589e\u52a0"],
      ["\u53ef\u4f7f\u7528\u6708\u4eae\u7cfb\u5217\u6280\u80fd"],
    ],
  };
  b[a.STARSTANCE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u661f\u661f\u82f1\u59ff", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u901f\u589e\u52a0"],
      ["\u53ef\u4f7f\u7528\u661f\u661f\u7cfb\u5217\u6280\u80fd"],
    ],
  };
  b[a.UNIVERSESTANCE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5b87\u5b99\u82f1\u59ff", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u5347All Status"],
      ["\u53ef\u4f7f\u7528\u5b87\u5b99\u7cfb\u5217\u6280\u80fd"],
      ["\u53ef\u4f7f\u7528\u592a\u9633\u7cfb\u5217\u6280\u80fd"],
      ["\u53ef\u4f7f\u7528\u6708\u4eae\u7cfb\u5217\u6280\u80fd"],
      ["\u53ef\u4f7f\u7528\u661f\u661f\u7cfb\u5217\u6280\u80fd"],
    ],
  };
  b[a.LIGHTOFSUN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u592a\u9633\u5149\u8f89", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u592a\u9633\u7206\u70b8\u7684\u4f24\u5bb3"],
    ],
  };
  b[a.LIGHTOFMOON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6708\u4eae\u5149\u8f89", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u5347\u6ee1\u6708\u811a\u7684\u4f24\u5bb3"],
    ],
  };
  b[a.LIGHTOFSTAR] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u661f\u661f\u5149\u8f89", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u63d0\u5347\u6d41\u661f\u9668\u843d\u7684\u4f24\u5bb3"],
    ],
  };
  b[a.FLASHKICK] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u661f\u661f\u6807\u5fd7", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.NEWMOON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6714\u6708", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9690\u533f\u81ea\u5df1"],
      ["\u53ef\u4f7f\u7528\u6ee1\u6708\u811a"],
    ],
  };
  b[a.CREATINGSTAR] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u521b\u661f\u4e4b\u4e66", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u51cf\u5c11\u79fb\u52a8\u901f\u5ea6"],
    ],
  };
  b[a.GRAVITYCONTROL] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u91cd\u529b\u8c03\u6574", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u65e0\u6cd5\u653b\u51fb\u53ca\u79fb\u52a8"],
    ],
  };
  b[a.SOULCOLLECT] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7075\u9b42\u84c4\u79ef", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5b9a\u671f\u84c4\u79ef\u7075\u9b42\u80fd\u91cf"],
    ],
  };
  b[a.SOULREAPER] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7075\u9b42\u6536\u5272", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u65f6\uff0c\u4ee5\u4e00\u5b9a\u6982\u7387"],
      ["\u83b7\u5f97\u7075\u9b42\u80fd\u91cf"],
    ],
  };
  b[a.SOULUNITY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7075\u9b42\u96c6\u7ed3", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf3\u79d2\u6062\u590d HP"],
      ["\u53ef\u8fdb\u884c\u51ef\u6c83\u7279\u7684\u5bf9\u8c61\u3002"],
    ],
  };
  b[a.SOULSHADOW] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8d4b\u4e88\u5f71\u5b50\u7075\u9b42", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["CRI\u589e\u52a0"],
      ["ASPD\u589e\u52a0"],
    ],
  };
  b[a.SOULFAIRY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8d4b\u4e88\u7cbe\u7075\u7075\u9b42", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MATK\u589e\u52a0"],
      ["\u51cf\u5c11\u53d8\u52a8\u548f\u5531"],
    ],
  };
  b[a.SOULFALCON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8d4b\u4e88\u96bc\u9e70\u7075\u9b42", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK\u589e\u52a0"],
      ["\u547d\u4e2d\u7387\u589e\u52a0"],
    ],
  };
  b[a.SOULGOLEM] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u8d4b\u4e88\u5de8\u4eba\u7075\u9b42", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["DEF\u589e\u52a0"],
      ["MDEF\u589e\u52a0"],
    ],
  };
  b[a.SOULDIVISION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7075\u9b42\u5206\u88c2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u6280\u80fd\u540e\u5ef6\u8fdf"],
    ],
  };
  b[a.FALLINGSTAR] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6d41\u661f\u9668\u843d", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u653b\u51fb\u65f6\uff0c\u4ee5\u4e00\u5b9a\u6982\u7387"],
      ["\u5bf9\u6709\u661f\u661f\u6807\u5fd7\u7684\u76ee\u6807"],
      ["\u9668\u843d\u6d41\u661f"],
    ],
  };
  b[a.DIMENSION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6b21\u5143\u4e4b\u4e66", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u4f7f\u7528\u65b0\u661f\u7206\u70b8\uff0c\u661f\u5e1d\u964d\u4e34\u65f6",
      ],
      ["\u89e6\u53d1\u7279\u6b8a\u6548\u679c"],
    ],
  };
  b[a.SOULLINK] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7075\u9b42\u8d4b\u4e88\u72b6\u6001", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5df2\u63a5\u53d7\u4e86\u609f\u7075\u58eb"],
      ["\u8d4b\u4e88\u7684\u7075\u9b42\u7684\u72b6\u6001"],
    ],
  };
  b[a.ASSUMPTIO_BUFF] = {
    icon: "icon05.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5723\u6bcd\u4e4b\u7948\u798f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u7269\u7406\u9632\u5fa1\u529b\u589e\u52a0"],
      ["\u53d7\u5230\u7684\u6cbb\u6108\u91cf\u589e\u52a0"],
    ],
  };
  b[a.RICHMANKIM] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7ecf\u9a8c\u503c\u500d\u589e", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u51fb\u6740\u9b54\u7269\u65f6"],
      ["\u83b7\u5f97\u7684\u7ecf\u9a8c\u503c\u589e\u52a0\u3002"],
    ],
  };
  b[a.RINGNIBELUNGEN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5c3c\u8d1d\u9686\u6839\u4e4b\u6212\u6307", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u7ed9\u81ea\u5df1\u7684\u961f\u53cb\u8d4b\u4e88"],
      ["\u5404\u79cd\u6709\u76ca\u6548\u679c\u3002"],
    ],
  };
  b[a.DRUMBATTLEFIELD] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6218\u9f13\u9707\u5929", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u961f\u5458\u7684ATK , DEF\u3002"],
    ],
  };
  b[a.SIEGFRIED] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u4e0d\u6b7b\u795e\u9f50\u683c\u5f17\u91cc\u5fb7",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u961f\u5458\u5bf9\u6c34/\u98ce/\u5730/\u706b\u5c5e\u6027\u7684\u6297\u6027",
      ],
      ["\u90e8\u5206\u72b6\u6001\u5f02\u5e38\u6297\u6027\u589e\u52a0\u3002"],
    ],
  };
  b[a.ADAPTATION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4e34\u673a\u5e94\u53d8", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6f14\u594f\uff0c\u8df3\u821e\uff0c\u5408\u594f\u6280\u80fd"],
      ["SP\u6d88\u8017\u51cf\u5c11\u3002"],
    ],
  };
  b[a.INTOABYSS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u89e6\u5a92\u4e4b\u6240", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u53bb\u9664\u961f\u5458\u6d88\u8017\u9b54\u529b\u77ff\u77f3\u7684\u5185\u5bb9",
      ],
      ["\u90e8\u5206\u6280\u80fd\u9664\u5916"],
    ],
  };
  b[a.SERVICEFORYOU] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4e3a\u60a8\u670d\u52a1", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u961f\u5458\u7684\u6700\u9ad8SP\u589e\u52a0"],
      ["\u51cf\u5c11SP\u6d88\u8017"],
    ],
  };
  b[a.FORTUNEKISS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5973\u795e\u4e4b\u543b", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u961f\u5458\u7684CRI"],
      ["\u589e\u52a0\u66b4\u51fb\u4f24\u5bb3"],
    ],
  };
  b[a.HUMMING] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u65e0\u9650\u54fc\u5531\u58f0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u961f\u5458\u7684HIT"],
    ],
  };
  b[a.POEMBRAGI] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5e03\u83b1\u5947\u4e4b\u8bd7", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u51cf\u5c11\u961f\u5458\u7684\u53d8\u52a8\u548f\u5531"],
      ["\u6280\u80fd\u540e\u5ef6\u8fdf\u51cf\u5c11"],
    ],
  };
  b[a.ASSASSINCROSS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u523a\u5ba2\u7684\u9ec4\u660f", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u961f\u5458\u7684\u653b\u901f\u589e\u52a0"],
      ["\u51cf\u5c11\u653b\u51fb\u540e\u5ef6\u8fdf"],
    ],
  };
  b[a.WHISTLE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5439\u53e3\u54e8", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u961f\u5458\u7684FLEE\u589e\u52a0"],
      ["\u5b8c\u5168\u56de\u907f\u589e\u52a0"],
    ],
  };
  b[a.APPLEIDUN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u4f0a\u767b\u7684\u82f9\u679c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u961f\u5458\u6700\u9ad8HP\u589e\u52a0"],
      ["\u53d7\u5230\u7684\u6062\u590d\u91cf\u589e\u52a0"],
    ],
  };
  b[a.ENSEMBLEFATIGUE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5408\u594f\u75b2\u52b3\u72b6\u6001", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u56e0\u5408\u594f\u75b2\u52b3\u72b6\u6001"],
      ["\u4e0d\u53ef\u4f7f\u7528\u6280\u80fd"],
      ["\u79fb\u52a8\uff0c\u653b\u51fb\u901f\u5ea6-30%"],
    ],
  };
  b[a.ETERNALCHAOS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6c38\u8fdc\u7684\u6df7\u6c8c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9632\u5fa1\u529b\u56fa\u5b9a\u4e3a0"],
    ],
  };
  b[a.ROKISWEIL] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6d1b\u5947\u7684\u60b2\u9e23", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6280\u80fd\u65e0\u6cd5\u4f7f\u7528"],
      ["\u4ee5\u4e00\u5b9a\u6982\u7387\u5904\u4e8e\u6df7\u4e71\u72b6\u6001"],
    ],
  };
  b[a.DONTFORGETME] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u52ff\u5fd8\u6211", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u79fb\u52a8\uff0c\u653b\u901f\u51cf\u5c11"],
      [
        "\u79fb\u52a8\uff0c\u653b\u901f\u589e\u52a0\u6548\u679c\u53bb\u9664\u3002",
      ],
    ],
  };
  b[a.WEAPONBLOCK_ON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u53cd\u51fb\u72b6\u6001", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u53cd\u51fb\u65a9"],
      ["\u53ef\u4ee5\u4f7f\u7528"],
    ],
  };
  b[a.ITEM_ATKMAX] = {
    icon: "hl_confusion.tga",
    descript: [
      ["MAX ATK", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MAX ATK"],
    ],
  };
  b[a.ITEM_ATKMIN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["MIN ATK", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MIN ATK"],
    ],
  };
  b[a.ITEM_MATKMAX] = {
    icon: "hl_confusion.tga",
    descript: [
      ["MAX MATK", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MAX MATK"],
    ],
  };
  b[a.ITEM_MATKMIN] = {
    icon: "hl_confusion.tga",
    descript: [
      ["MIN MATK", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MIN MATK"],
    ],
  };
  b[a.GLASTHEIM_STATE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 3,
    descript: [
      ["\u6240\u6709\u80fd\u529b\u503c", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6025\u901f\u63d0\u5347\u3002"],
    ],
  };
  b[a.ALL_STAT_DOWN] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5168\u7d20\u8d28\u4e0b\u964d", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6240\u6709\u7d20\u8d28\u70b9\u51cf\u5c11\u3002"],
    ],
  };
  b[a.GRADUAL_GRAVITY] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u91cd\u529b\u589e\u52a0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf1\u79d2\u51cf\u5c11\u90e8\u5206HP\u3002"],
    ],
  };
  b[a.UNLIMITED_HUMMING_VOICE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u65e0\u9650\u54fc\u5531\u58f0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5c5e\u6027\u9b54\u6cd5\u4f24\u5bb3\u589e\u52a0"],
    ],
  };
  b[a.SOULCURSE] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u90aa\u7075\u7684\u8bc5\u5492", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5bf9\u6697\u5c5e\u6027\u653b\u51fb\u7684\u6297\u6027\u51cf\u5c11"],
    ],
  };
  b[a.SOUND_OF_DESTRUCTION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6bc1\u706d\u4e4b\u58f0", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6240\u6709\u4f24\u5bb32\u500d\u72b6\u6001"],
    ],
  };
  b[a.MISTY_FROST] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7ed3\u971c\u72b6\u6001", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.MAGIC_POISON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u529b\u4e2d\u6bd2", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5bf9\u6240\u6709\u5c5e\u6027\u653b\u51fb\u7684\u6297\u6027-50%"],
    ],
  };
  b[a.S_MANAPOTION] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5c0f\u578b\u9b54\u529b\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u6bcf5\u79d2\u6062\u590d\u4e00\u5b9a\u91cf\u7684SP"],
      [
        "\u72c2\u6012\u4e4b\u67aa\u72b6\u6001\u4e0b\u4e0d\u4f1a\u89e6\u53d1\u6548\u679c",
      ],
    ],
  };
  b[a.MANA_PLUS] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9b54\u529b\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["MATK +50"],
    ],
  };
  b[a.FULL_SWING_K] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6325\u51fb\u836f\u6c34", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK +50"],
    ],
  };
  b[a.FLOWER_LEAF2] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u70ed\u817e\u817e\u7684\u4f20\u7edf\u9762", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u706b\u5c5e\u6027\u9b54\u7269\u6297\u6027"],
      ["\u653b\u901f\u589e\u52a0"],
      ["\u51cf\u5c11\u53d8\u52a8\u548f\u5531"],
    ],
  };
  b[a.FLOWER_LEAF3] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9999\u751c\u7684\u5976\u6cb9\u610f\u9762", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK + 5%"],
    ],
  };
  b[a.FLOWER_LEAF4] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u751c\u751c\u7684\u897f\u74dc\u5e03\u4e01", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5bf9\u5c0f\u578b\uff0c\u4e2d\u578b\uff0c\u5927\u578b\u654c\u4eba"],
      ["MATK + 5%"],
    ],
  };
  b[a.OFFERTORIUM] = {
    icon: "offertorium.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 4,
    descript: [
      ["\u5949\u732e\u9882", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u81ea\u8eab\u4f7f\u7528\u7684\u6cbb\u6108\u91cf\u589e\u52a0"],
      ["\u6240\u6709\u6280\u80fd\u7684SP\u6d88\u8017\u91cf\u589e\u52a0"],
    ],
  };
  b[a.CHEERUP] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7238\u6bd4\u5988\u54aa\u8bf7\u52a0\u6cb9", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u5168\u90e8\u7d20\u8d28+3"],
    ],
  };
  b[a.M_DEFSCROLL] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u529b\u91cf\u9632\u62a4\u5377\u8f74", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u9632\u5fa1\u529b\u53ca\u9b54\u6cd5\u9632\u5fa1\u529b\u63d0\u5347"],
    ],
  };
  b[a.DARKCROW] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u81f4\u547d\u722a\u75d5", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8fd1\u8ddd\u79bb\u7269\u7406\u4f24\u5bb3\u589e\u5e45"],
      ["\u90e8\u5206\u53cd\u5c04\u6548\u679c\u65e0\u6548\u5316"],
    ],
  };
  b[a.POISONINGWEAPON] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u5267\u6bd2\u6b66\u5668", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8fd1\u8ddd\u79bb\u7269\u7406\u4f24\u5bb3\u589e\u52a0"],
      ["\u6839\u636e\u8d4b\u4e88\u7684\u6bd2\u8d4b\u4e88buff"],
      ["\u653b\u51fb\u65f6\u8ba9\u5bf9\u65b9\u4e2d\u6240\u6d82\u7684\u6bd2"],
    ],
  };
  b[a.GIANTGROWTH] = {
    icon: "RK_TURISUSS.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u7a81\u91cc\u8428\u5179\u7b26\u6587\u77f3\uff1a\u529b\u91cf\u6210\u957f",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["STR\u589e\u52a0"],
      [
        "\u666e\u901a\u8fd1\u8ddd\u79bb\u7269\u7406\u653b\u51fb\u65f6\uff0c\u4ee5\u8f83\u9ad8\u7684\u6982\u7387\u5927\u4f24\u5bb3",
      ],
      ["\u8fd1\u8ddd\u79bb\u7269\u7406\u4f24\u5bb3\u589e\u52a0"],
    ],
  };
  b[a.FIGHTINGSPIRIT] = {
    icon: "RK_EISIR.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u827e\u4f0a\u74e6\u5179\u7b26\u6587\u77f3\uff1a\u63d0\u5347\u6597\u5fd7",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK\u589e\u52a0"],
      ["\u653b\u901f\u589e\u52a0"],
    ],
  };
  b[a.VITALITYACTIVATION] = {
    icon: "RK_ISHA.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u4f0a\u672d\u7b26\u6587\u77f3\uff1a\u751f\u547d\u6fc0\u5316",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      ["HP\u6062\u590d\u6548\u679c\u589e\u52a0"],
      [
        "\u53d7\u5230\u7684\u8fd1\u8ddd\u79bb\u7269\u7406\u53cd\u5c04\u4f24\u5bb3\u51cf\u5c11",
      ],
    ],
  };
  b[a.LUXANIMA] = {
    icon: "hl_confusion.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      [
        "\u529b\u91cf\u5206\u4eab\u7b26\u6587\u77f3 : \u7b26\u6587\u7206\u53d1",
        "rgb(155, 202, 155)",
      ],
      ["%s", "rgb(255, 176,  98)"],
      [
        "\u666e\u901a\u8fd1\u8ddd\u79bb\u7269\u7406\u653b\u51fb\u65f6, \u6839\u636e\u6982\u7387",
      ],
      ["\u89e6\u53d1\u98ce\u66b4\u51b2\u51fb1lv"],
      [
        "\u5bf9\u6240\u6709\u5927\u5c0f\u654c\u4eba\u7684\u7269\u7406\u4f24\u5bb3\u589e\u52a0",
      ],
      ["\u66b4\u51fb\u4f24\u5bb3\u589e\u52a0"],
      [
        "\u8fd1\u8ddd\u79bb\u53ca\u8fdc\u7a0b\u7269\u7406\u4f24\u5bb3\u589e\u52a0",
      ],
    ],
  };
  b[a.AURABLADE] = {
    icon: "icon04.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7075\u6c14\u5251", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u589e\u52a0\u7269\u7406\u653b\u51fb\u529b"],
    ],
  };
  b[a.LKCONCENTRATION] = {
    icon: "\u00b5\u00f0\u00c0\u00cc\u00c5\u00cd4.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u96c6\u4e2d\u653b\u51fb", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["ATK, \u547d\u4e2d\u7387\u589e\u52a0"],
      ["\u7269\u7406\u9632\u5fa1\u529b\u51cf\u5c11"],
    ],
  };
  b[a.CR_SHRINK] = {
    icon: "i_shrink.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u9000\u7f29", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u89e6\u53d1\u81ea\u52a8\u9632\u5fa1\u6280\u80fd\u65f6"],
      [
        "\u6839\u636e\u6982\u7387\u8ba9\u76ee\u6807\u9677\u5165\u72b6\u6001\u5f02\u5e38\u6655\u7729",
      ],
    ],
  };
  b[a.UNLIMIT] = {
    icon: "UNLIMIT.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u7cbe\u82f1\u72d9\u51fb", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
      ["\u8fdc\u7a0b\u7269\u7406\u4f24\u5bb3\u63d0\u5347"],
    ],
  };
  b[a.BDPLAYING] = {
    icon: "\u00b9\u00d9\u00b5\u00e5\u00b3\u00eb\u00b7\u00a1.tga",
  };
  b[a.RUN] = { icon: "i_run.tga" };
  b[a.CLIENT_ONLY_EQUIP_ARROW] = { icon: "ArrowN.tga" };
  b[a.RAY_OF_PROTECTION] = { icon: "all_ray_of_protection.tga" };
  b[a.DARKCROW] = { icon: "darkcrow.tga" };
  b[a.FLOWER_LEAF] = { icon: "flower_leaf.tga" };
  b[a.FRIGG_SONG] = { icon: "frigg_song.tga" };
  b[a.FULL_THROTTLE] = { icon: "full_throttle.tga" };
  b[a.GLASTHEIM_ATK] = { icon: "glastheim_atk.tga" };
  b[a.GLASTHEIM_DEF] = { icon: "glastheim_def.tga" };
  b[a.GLASTHEIM_HEAL] = { icon: "glastheim_heal.tga" };
  b[a.ATTACK_TIMER] = {
    icon: "\u00c0\u00ce\u00c7\u00c1\u00b6\u00f3\u00b7\u00b9\u00b5\u00e5\u00bd\u00ba\u00c4\u00b5.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["\u6218\u6597\u65f6\u95f4", "rgb(155, 202, 155)"],
      ["%s", "rgb(255, 176,  98)"],
    ],
  };
  b[a.GROUNDMAGIC] = {
    icon: "i_\u00c0\u00e5\u00c6\u00c7.tga",
    haveTimeLimit: 1,
    posTimeLimitStr: 2,
    descript: [
      ["%s", "rgb(255, 176,  98)"],
      ["\u5730\u9762\u6280\u80fd\u6548\u679c"],
    ],
  };
  return b;
});
