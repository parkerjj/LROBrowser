define("DB/Skills/SkillAction", ["./SkillConst"], function (a) {
  var b = {
    DEFAULT: function (a, b) {
      return {
        action: a.ACTION.SKILL,
        frame: 0,
        repeat: !1,
        play: !0,
        next: {
          action: a.ACTION.IDLE,
          frame: 0,
          repeat: !0,
          play: !0,
          next: !1,
        },
      };
    },
  };
  b[a.ST_CHASEWALK] = function (a, b) {
    return { action: a.ACTION.IDLE, frame: 0, repeat: !0, play: !0, next: !1 };
  };
  b[a.SM_BASH] =
    b[a.SM_MAGNUM] =
    b[a.KN_PIERCE] =
    b[a.KN_BRANDISHSPEAR] =
    b[a.KN_SPEARSTAB] =
    b[a.KN_BOWLINGBASH] =
    b[a.BS_HAMMERFALL] =
    b[a.AC_CHARGEARROW] =
    b[a.RG_BACKSTAP] =
    b[a.RG_RAID] =
    b[a.RG_INTIMIDATE] =
    b[a.CR_SHIELDCHARGE] =
    b[a.CR_HOLYCROSS] =
    b[a.MO_EXTREMITYFIST] =
    b[a.MO_CHAINCOMBO] =
    b[a.MO_COMBOFINISH] =
    b[a.BA_MUSICALSTRIKE] =
    b[a.DC_THROWARROW] =
    b[a.NPC_DARKCROSS] =
    b[a.CH_PALMSTRIKE] =
    b[a.CH_TIGERFIST] =
    b[a.CH_CHAINCRUSH] =
    b[a.LK_SPIRALPIERCE] =
    b[a.LK_HEADCRUSH] =
    b[a.LK_JOINTBEAT] =
    b[a.HW_MAGICPOWER] =
    b[a.PA_SACRIFICE] =
    b[a.ASC_METEORASSAULT] =
    b[a.TK_STORMKICK] =
    b[a.TK_DOWNKICK] =
    b[a.TK_TURNKICK] =
    b[a.TK_COUNTER] =
    b[a.TK_JUMPKICK] =
    b[a.CR_ACIDDEMONSTRATION] =
    b[a.GS_TRIPLEACTION] =
    b[a.GS_BULLSEYE] =
    b[a.GS_TRACKING] =
    b[a.GS_DISARM] =
    b[a.GS_PIERCINGSHOT] =
    b[a.GS_RAPIDSHOWER] =
    b[a.GS_DESPERADO] =
    b[a.GS_DUST] =
    b[a.GS_FULLBUSTER] =
    b[a.GS_SPREADATTACK] =
    b[a.GS_GROUNDDRIFT] =
    b[a.NJ_HUUMA] =
    b[a.NJ_KASUMIKIRI] =
    b[a.NJ_KIRIKAGE] =
    b[a.NJ_ISSEN] =
    b[a.RK_SONICWAVE] =
    b[a.RK_HUNDREDSPEAR] =
    b[a.RK_WINDCUTTER] =
    b[a.RK_IGNITIONBREAK] =
    b[a.RK_DRAGONBREATH] =
    b[a.GC_DARKILLUSION] =
    b[a.GC_COUNTERSLASH] =
    b[a.GC_WEAPONCRUSH] =
    b[a.GC_VENOMPRESSURE] =
    b[a.GC_PHANTOMMENACE] =
    b[a.GC_ROLLINGCUTTER] =
    b[a.GC_CROSSRIPPERSLASHER] =
    b[a.NC_PILEBUNKER] =
    b[a.NC_VULCANARM] =
    b[a.NC_FLAMELAUNCHER] =
    b[a.NC_COLDSLOWER] =
    b[a.NC_ARMSCANNON] =
    b[a.NC_POWERSWING] =
    b[a.NC_AXETORNADO] =
    b[a.SC_FATALMENACE] =
    b[a.LG_CANNONSPEAR] =
    b[a.LG_MOONSLASHER] =
    b[a.LG_BANISHINGPOINT] =
    b[a.LG_TRAMPLE] =
    b[a.LG_SHIELDPRESS] =
    b[a.LG_PINPOINTATTACK] =
    b[a.LG_RAGEBURST] =
    b[a.LG_OVERBRAND] =
    b[a.LG_RAYOFGENESIS] =
    b[a.LG_EARTHDRIVE] =
    b[a.SR_DRAGONCOMBO] =
    b[a.SR_SKYNETBLOW] =
    b[a.SR_FALLENEMPIRE] =
    b[a.SR_TIGERCANNON] =
    b[a.SR_CRESCENTELBOW] =
    b[a.SR_GATEOFHELL] =
      function (a, b) {
        return {
          action: a.ACTION.ATTACK,
          frame: 0,
          repeat: !1,
          play: !0,
          next: {
            action: a.ACTION.IDLE,
            frame: 0,
            repeat: !0,
            play: !0,
            next: !1,
          },
        };
      };
  b[a.KN_SPEARBOOMERANG] =
    b[a.CR_SHIELDBOOMERANG] =
    b[a.AM_DEMONSTRATION] =
    b[a.AM_ACIDTERROR] =
    b[a.AM_POTIONPITCHER] =
    b[a.AM_CANNIBALIZE] =
    b[a.TF_SPRINKLESAND] =
    b[a.TF_THROWSTONE] =
    b[a.NJ_SYURIKEN] =
    b[a.NJ_KUNAI] =
    b[a.NJ_ZENYNAGE] =
    b[a.ITM_TOMAHAWK] =
    b[a.AS_VENOMKNIFE] =
    b[a.PA_SHIELDCHAIN] =
    b[a.NC_AXEBOOMERANG] =
    b[a.GN_SLINGITEM] =
      function (a, b) {
        return {
          action: a.ACTION.ATTACK1,
          frame: 0,
          repeat: !1,
          play: !0,
          next: {
            action: a.ACTION.IDLE,
            frame: 0,
            repeat: !0,
            play: !0,
            next: !1,
          },
        };
      };
  b[a.TF_POISON] =
    b[a.MC_MAMMONITE] =
    b[a.MC_CARTREVOLUTION] =
    b[a.GN_CART_TORNADO] =
      function (a, b) {
        return {
          action: a.ACTION.ATTACK2,
          frame: 0,
          repeat: !1,
          play: !0,
          next: {
            action: a.ACTION.IDLE,
            frame: 0,
            repeat: !0,
            play: !0,
            next: !1,
          },
        };
      };
  b[a.AC_DOUBLE] =
    b[a.ASC_BREAKER] =
    b[a.HT_PHANTASMIC] =
    b[a.SN_SHARPSHOOTING] =
    b[a.RA_ARROWSTORM] =
    b[a.RA_AIMEDBOLT] =
    b[a.SC_TRIANGLESHOT] =
      function (a, b) {
        return {
          action: a.ACTION.ATTACK3,
          frame: 0,
          repeat: !1,
          play: !0,
          next: {
            action: a.ACTION.IDLE,
            frame: 0,
            repeat: !0,
            play: !0,
            next: !1,
          },
        };
      };
  b[a.HT_LANDMINE] =
    b[a.HT_ANKLESNARE] =
    b[a.HT_SHOCKWAVE] =
    b[a.HT_SANDMAN] =
    b[a.HT_FLASHER] =
    b[a.HT_FREEZINGTRAP] =
    b[a.HT_BLASTMINE] =
    b[a.HT_CLAYMORETRAP] =
    b[a.HT_REMOVETRAP] =
    b[a.HT_TALKIEBOX] =
    b[a.TF_PICKSTONE] =
    b[a.BS_GREED] =
    b[a.RA_ELECTRICSHOCKER] =
    b[a.RA_CLUSTERBOMB] =
    b[a.RA_MAGENTATRAP] =
    b[a.RA_COBALTTRAP] =
    b[a.RA_MAIZETRAP] =
    b[a.RA_VERDURETRAP] =
    b[a.RA_FIRINGTRAP] =
    b[a.RA_ICEBOUNDTRAP] =
      function (a, b) {
        return {
          action: a.ACTION.PICKUP,
          frame: 0,
          repeat: !1,
          play: !0,
          next: {
            action: a.ACTION.IDLE,
            frame: 0,
            repeat: !0,
            play: !0,
            next: !1,
          },
        };
      };
  b[a.NJ_TATAMIGAESHI] = b[a.SR_EARTHSHAKER] = function (a, b) {
    return {
      action: a.ACTION.PICKUP,
      frame: 1,
      repeat: !1,
      play: !1,
      next: !1,
    };
  };
  b[a.SN_SIGHT] = function (a, b) {
    return {
      action: a.ACTION.ACTION,
      frame: 0,
      repeat: !1,
      play: !0,
      next: { action: a.ACTION.IDLE, frame: 0, repeat: !0, play: !0, next: !1 },
    };
  };
  b[a.DC_WINKCHARM] =
    b[a.DC_FORTUNEKISS] =
    b[a.DC_UGLYDANCE] =
    b[a.DC_HUMMING] =
    b[a.DC_DONTFORGETME] =
    b[a.DC_SERVICEFORYOU] =
    b[a.BA_APPLEIDUN] =
    b[a.BA_DISSONANCE] =
    b[a.BA_WHISTLE] =
    b[a.BA_ASSASSINCROSS] =
    b[a.BA_POEMBRAGI] =
    b[a.BD_LULLABY] =
    b[a.BD_RICHMANKIM] =
    b[a.BD_ETERNALCHAOS] =
    b[a.BD_DRUMBATTLEFIELD] =
    b[a.BD_SIEGFRIED] =
    b[a.CG_HERMODE] =
    b[a.BD_RINGNIBELUNGEN] =
    b[a.SKID_BD_ROKISWEIL] =
    b[a.BD_INTOABYSS] =
    b[a.CG_MOONLIT] =
    b[a.CG_MARIONETTE] =
      function (a, b) {
        return {
          action: a.ACTION.SKILL,
          frame: 1,
          length: 3,
          speed: 250,
          repeat: !0,
          play: !0,
          next: !1,
        };
      };
  b[a.SM_ENDURE] = function (a, b) {
    return {
      action: a.ACTION.READYFIGHT,
      frame: 0,
      repeat: !1,
      play: !0,
      next: { action: a.ACTION.IDLE, frame: 0, repeat: !0, play: !0, next: !1 },
    };
  };
  b[a.AC_SHOWER] = function (a, b) {
    return {
      action: a.ACTION.ATTACK,
      frame: 0,
      repeat: !1,
      speed: 50,
      play: !0,
      next: {
        action: a.ACTION.READYFIGHT,
        frame: 0,
        repeat: !0,
        play: !0,
        next: !1,
      },
    };
  };
  b[a.KN_AUTOCOUNTER] = function (a, b) {
    return {
      action: a.ACTION.ATTACK,
      frame: 0,
      repeat: !1,
      play: !1,
      next: !1,
    };
  };
  b[a.MO_BLADESTOP] = function (a, b) {
    return {
      action: a.ACTION.SKILL,
      frame: 3,
      repeat: !1,
      play: !1,
      next: {
        delay: b + 3e3,
        action: a.ACTION.IDLE,
        frame: 0,
        repeat: !0,
        play: !0,
        next: !1,
      },
    };
  };
  b[a.MO_INVESTIGATE] = b[a.MO_FINGEROFFENSIVE] = function (a, b) {
    return { action: a.ACTION.SKILL, frame: 4, repeat: !1, play: !1, next: !1 };
  };
  b[a.CG_ARROWVULCAN] = function (a, b) {
    return {
      action: a.ACTION.ATTACK,
      frame: 0,
      repeat: !1,
      play: !0,
      next: {
        action: a.ACTION.ATTACK,
        frame: 0,
        repeat: !1,
        speed: 30,
        play: !0,
        next: {
          action: a.ACTION.ATTACK,
          frame: 0,
          repeat: !1,
          speed: 30,
          play: !0,
          next: {
            action: a.ACTION.ATTACK,
            frame: 0,
            repeat: !1,
            speed: 30,
            play: !0,
            next: {
              action: a.ACTION.ATTACK,
              frame: 0,
              repeat: !1,
              speed: 30,
              play: !0,
              next: {
                action: a.ACTION.ATTACK,
                frame: 0,
                repeat: !1,
                speed: 30,
                play: !0,
                next: {
                  action: a.ACTION.ATTACK,
                  frame: 0,
                  repeat: !1,
                  speed: 30,
                  play: !0,
                  next: {
                    action: a.ACTION.ATTACK,
                    frame: 0,
                    repeat: !1,
                    speed: 30,
                    play: !0,
                    next: {
                      action: a.ACTION.ATTACK,
                      frame: 0,
                      repeat: !1,
                      speed: 30,
                      play: !0,
                      next: {
                        action: a.ACTION.READYFIGHT,
                        frame: 0,
                        repeat: !0,
                        play: !0,
                        next: !1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  };
  b[a.AS_SONICBLOW] = function (a, b) {
    return {
      action: a.ACTION.ATTACK,
      frame: 0,
      repeat: !1,
      play: !0,
      next: {
        action: a.ACTION.ATTACK,
        frame: 0,
        repeat: !1,
        speed: 30,
        play: !0,
        next: {
          action: a.ACTION.ATTACK,
          frame: 0,
          repeat: !1,
          speed: 30,
          play: !0,
          next: {
            action: a.ACTION.ATTACK,
            frame: 0,
            repeat: !1,
            speed: 30,
            play: !0,
            next: {
              action: a.ACTION.ATTACK,
              frame: 0,
              repeat: !1,
              speed: 30,
              play: !0,
              next: {
                action: a.ACTION.ATTACK,
                frame: 0,
                repeat: !1,
                speed: 30,
                play: !0,
                next: {
                  action: a.ACTION.ATTACK,
                  frame: 0,
                  repeat: !1,
                  speed: 30,
                  play: !0,
                  next: {
                    action: a.ACTION.ATTACK,
                    frame: 0,
                    repeat: !1,
                    speed: 30,
                    play: !0,
                    next: {
                      action: a.ACTION.READYFIGHT,
                      frame: 0,
                      repeat: !0,
                      play: !0,
                      next: !1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  };
  b[a.GC_CROSSIMPACT] = function (a, b) {
    return {
      action: a.ACTION.ATTACK,
      frame: 0,
      repeat: !1,
      play: !0,
      next: {
        action: a.ACTION.ATTACK,
        frame: 0,
        repeat: !1,
        speed: 30,
        play: !0,
        next: {
          action: a.ACTION.ATTACK,
          frame: 0,
          repeat: !1,
          speed: 30,
          play: !0,
          next: {
            action: a.ACTION.ATTACK,
            frame: 0,
            repeat: !1,
            speed: 30,
            play: !0,
            next: {
              action: a.ACTION.ATTACK,
              frame: 0,
              repeat: !1,
              speed: 30,
              play: !0,
              next: {
                action: a.ACTION.ATTACK,
                frame: 0,
                repeat: !1,
                speed: 30,
                play: !0,
                next: {
                  action: a.ACTION.ATTACK,
                  frame: 0,
                  repeat: !1,
                  speed: 30,
                  play: !0,
                  next: {
                    action: a.ACTION.READYFIGHT,
                    frame: 0,
                    repeat: !0,
                    play: !0,
                    next: !1,
                  },
                },
              },
            },
          },
        },
      },
    };
  };
  b[a.TF_BACKSLIDING] =
    b[a.NV_TRICKDEAD] =
    b[a.TK_HIGHJUMP] =
    b[a.TK_DODGE] =
    b[a.LK_TENSIONRELAX] =
    b[a.NC_F_SIDESLIDE] =
    b[a.NC_B_SIDESLIDE] =
      !1;
  return b;
});
