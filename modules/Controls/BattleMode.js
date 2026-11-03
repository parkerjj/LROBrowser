define("Controls/BattleMode", [
  "require",
  "Utils/jquery",
  "Controls/KeyEventHandler",
  "Preferences/ShortCutControls",
  "UI/UIManager",
], function (a) {
  function b(a) {
    return t[a].Custom_settings ? t[a].Custom_settings : t[a].init;
  }
  function c(a) {
    return t[a].Custom_settings ? t[a].Custom_alt : t[a].alt;
  }
  function d(a) {
    return t[a].Custom_settings ? t[a].Custom_ctrl : t[a].ctrl;
  }
  function e(a) {
    return t[a].Custom_settings ? t[a].Custom_shift : t[a].shift;
  }
  var m = a("Utils/jquery"),
    h = a("Controls/KeyEventHandler"),
    t = a("Preferences/ShortCutControls"),
    r = a("UI/UIManager");
  a = {};
  var n = {};
  a.init = function () {
    this.reload();
  };
  a.reload = function () {
    n = {};
    n.F1 = {
      command: b("F1"),
      component: "ShortCut",
      cmd: "EXECUTE0",
      alt: c("F1"),
      ctrl: d("F1"),
      shift: e("F1"),
    };
    n.F2 = {
      command: b("F2"),
      component: "ShortCut",
      cmd: "EXECUTE1",
      alt: c("F2"),
      ctrl: d("F2"),
      shift: e("F2"),
    };
    n.F3 = {
      command: b("F3"),
      component: "ShortCut",
      cmd: "EXECUTE2",
      alt: c("F3"),
      ctrl: d("F3"),
      shift: e("F3"),
    };
    n.F4 = {
      command: b("F4"),
      component: "ShortCut",
      cmd: "EXECUTE3",
      alt: c("F4"),
      ctrl: d("F4"),
      shift: e("F4"),
    };
    n.F5 = {
      command: b("F5"),
      component: "ShortCut",
      cmd: "EXECUTE4",
      alt: c("F5"),
      ctrl: d("F5"),
      shift: e("F5"),
    };
    n.F6 = {
      command: b("F6"),
      component: "ShortCut",
      cmd: "EXECUTE5",
      alt: c("F6"),
      ctrl: d("F6"),
      shift: e("F6"),
    };
    n.F7 = {
      command: b("F7"),
      component: "ShortCut",
      cmd: "EXECUTE6",
      alt: c("F7"),
      ctrl: d("F7"),
      shift: e("F7"),
    };
    n.F8 = {
      command: b("F8"),
      component: "ShortCut",
      cmd: "EXECUTE7",
      alt: c("F8"),
      ctrl: d("F8"),
      shift: e("F8"),
    };
    n.F9 = {
      command: b("F9"),
      component: "ShortCut",
      cmd: "EXECUTE8",
      alt: c("F9"),
      ctrl: d("F9"),
      shift: e("F9"),
    };
    n.F10 = {
      command: b("F10"),
      component: "ChatBox",
      cmd: "updateHeight",
      alt: c("F10"),
      ctrl: d("F10"),
      shift: e("F10"),
    };
    n.F12 = {
      command: b("F12"),
      component: "ShortCut",
      cmd: "EXTEND",
      alt: c("F12"),
      ctrl: d("F12"),
      shift: e("F12"),
    };
    n.F2_1 = {
      command: b("F2_1"),
      component: "ShortCut",
      cmd: "EXECUTE9",
      alt: c("F2_1"),
      ctrl: d("F2_1"),
      shift: e("F2_1"),
    };
    n.F2_2 = {
      command: b("F2_2"),
      component: "ShortCut",
      cmd: "EXECUTE10",
      alt: c("F2_2"),
      ctrl: d("F2_2"),
      shift: e("F2_2"),
    };
    n.F2_3 = {
      command: b("F2_3"),
      component: "ShortCut",
      cmd: "EXECUTE11",
      alt: c("F2_3"),
      ctrl: d("F2_3"),
      shift: e("F2_3"),
    };
    n.F2_4 = {
      command: b("F2_4"),
      component: "ShortCut",
      cmd: "EXECUTE12",
      alt: c("F2_4"),
      ctrl: d("F2_4"),
      shift: e("F2_4"),
    };
    n.F2_5 = {
      command: b("F2_5"),
      component: "ShortCut",
      cmd: "EXECUTE13",
      alt: c("F2_5"),
      ctrl: d("F2_5"),
      shift: e("F2_5"),
    };
    n.F2_6 = {
      command: b("F2_6"),
      component: "ShortCut",
      cmd: "EXECUTE14",
      alt: c("F2_6"),
      ctrl: d("F2_6"),
      shift: e("F2_6"),
    };
    n.F2_7 = {
      command: b("F2_7"),
      component: "ShortCut",
      cmd: "EXECUTE15",
      alt: c("F2_7"),
      ctrl: d("F2_7"),
      shift: e("F2_7"),
    };
    n.F2_8 = {
      command: b("F2_8"),
      component: "ShortCut",
      cmd: "EXECUTE16",
      alt: c("F2_8"),
      ctrl: d("F2_8"),
      shift: e("F2_8"),
    };
    n.F2_9 = {
      command: b("F2_9"),
      component: "ShortCut",
      cmd: "EXECUTE17",
      alt: c("F2_9"),
      ctrl: d("F2_9"),
      shift: e("F2_9"),
    };
    n.F3_1 = {
      command: b("F3_1"),
      component: "ShortCut",
      cmd: "EXECUTE18",
      alt: c("F3_1"),
      ctrl: d("F3_1"),
      shift: e("F3_1"),
    };
    n.F3_2 = {
      command: b("F3_2"),
      component: "ShortCut",
      cmd: "EXECUTE19",
      alt: c("F3_2"),
      ctrl: d("F3_2"),
      shift: e("F3_2"),
    };
    n.F3_3 = {
      command: b("F3_3"),
      component: "ShortCut",
      cmd: "EXECUTE20",
      alt: c("F3_3"),
      ctrl: d("F3_3"),
      shift: e("F3_3"),
    };
    n.F3_4 = {
      command: b("F3_4"),
      component: "ShortCut",
      cmd: "EXECUTE21",
      alt: c("F3_4"),
      ctrl: d("F3_4"),
      shift: e("F3_4"),
    };
    n.F3_5 = {
      command: b("F3_5"),
      component: "ShortCut",
      cmd: "EXECUTE22",
      alt: c("F3_5"),
      ctrl: d("F3_5"),
      shift: e("F3_5"),
    };
    n.F3_6 = {
      command: b("F3_6"),
      component: "ShortCut",
      cmd: "EXECUTE23",
      alt: c("F3_6"),
      ctrl: d("F3_6"),
      shift: e("F3_6"),
    };
    n.F3_7 = {
      command: b("F3_7"),
      component: "ShortCut",
      cmd: "EXECUTE24",
      alt: c("F3_7"),
      ctrl: d("F3_7"),
      shift: e("F3_7"),
    };
    n.F3_8 = {
      command: b("F3_8"),
      component: "ShortCut",
      cmd: "EXECUTE25",
      alt: c("F3_8"),
      ctrl: d("F3_8"),
      shift: e("F3_8"),
    };
    n.F3_9 = {
      command: b("F3_9"),
      component: "ShortCut",
      cmd: "EXECUTE26",
      alt: c("F3_9"),
      ctrl: d("F3_9"),
      shift: e("F3_9"),
    };
    n.F4_1 = {
      command: b("F4_1"),
      component: "ShortCut",
      cmd: "EXECUTE27",
      alt: c("F4_1"),
      ctrl: d("F4_1"),
      shift: e("F4_1"),
    };
    n.F4_2 = {
      command: b("F4_2"),
      component: "ShortCut",
      cmd: "EXECUTE28",
      alt: c("F4_2"),
      ctrl: d("F4_2"),
      shift: e("F4_2"),
    };
    n.F4_3 = {
      command: b("F4_3"),
      component: "ShortCut",
      cmd: "EXECUTE29",
      alt: c("F4_3"),
      ctrl: d("F4_3"),
      shift: e("F4_3"),
    };
    n.F4_4 = {
      command: b("F4_4"),
      component: "ShortCut",
      cmd: "EXECUTE30",
      alt: c("F4_4"),
      ctrl: d("F4_4"),
      shift: e("F4_4"),
    };
    n.F4_5 = {
      command: b("F4_5"),
      component: "ShortCut",
      cmd: "EXECUTE31",
      alt: c("F4_5"),
      ctrl: d("F4_5"),
      shift: e("F4_5"),
    };
    n.F4_6 = {
      command: b("F4_6"),
      component: "ShortCut",
      cmd: "EXECUTE32",
      alt: c("F4_6"),
      ctrl: d("F4_6"),
      shift: e("F4_6"),
    };
    n.F4_7 = {
      command: b("F4_7"),
      component: "ShortCut",
      cmd: "EXECUTE33",
      alt: c("F4_7"),
      ctrl: d("F4_7"),
      shift: e("F4_7"),
    };
    n.F4_8 = {
      command: b("F4_8"),
      component: "ShortCut",
      cmd: "EXECUTE34",
      alt: c("F4_8"),
      ctrl: d("F4_8"),
      shift: e("F4_8"),
    };
    n.F4_9 = {
      command: b("F4_9"),
      component: "ShortCut",
      cmd: "EXECUTE35",
      alt: c("F4_9"),
      ctrl: d("F4_9"),
      shift: e("F4_9"),
    };
    n.WinStats = {
      command: b("WinStats"),
      component: "WinStats",
      cmd: "TOGGLE",
      alt: c("WinStats"),
      ctrl: d("WinStats"),
      shift: e("WinStats"),
    };
    n.ChatRoomCreate = {
      command: b("ChatRoomCreate"),
      component: "ChatRoomCreate",
      cmd: "TOGGLE",
      alt: c("ChatRoomCreate"),
      ctrl: d("ChatRoomCreate"),
      shift: e("ChatRoomCreate"),
    };
    n.Inventory = {
      command: b("Inventory"),
      component: "Inventory",
      cmd: "TOGGLE",
      alt: c("Inventory"),
      ctrl: d("Inventory"),
      shift: e("Inventory"),
    };
    n.OnPushCart = {
      command: b("OnPushCart"),
      component: "OnPushCart",
      cmd: "TOGGLE",
      alt: c("OnPushCart"),
      ctrl: d("OnPushCart"),
      shift: e("OnPushCart"),
    };
    n.Guild = {
      command: b("Guild"),
      component: "Guild",
      cmd: "TOGGLE",
      alt: c("Guild"),
      ctrl: d("Guild"),
      shift: e("Guild"),
    };
    n.PetInformations = {
      command: b("PetInformations"),
      component: "PetInformations",
      cmd: "TOGGLE",
      alt: c("PetInformations"),
      ctrl: d("PetInformations"),
      shift: e("PetInformations"),
    };
    n.EMO = {
      command: b("EMO"),
      component: "Emoticons",
      cmd: "TOGGLE",
      alt: c("EMO"),
      ctrl: d("EMO"),
      shift: e("EMO"),
    };
    n.WorldMap = {
      command: b("WorldMap"),
      component: "WorldMap",
      cmd: "TOGGLE",
      alt: c("WorldMap"),
      ctrl: d("WorldMap"),
      shift: e("WorldMap"),
    };
    n.Equipment = {
      command: b("Equipment"),
      component: "Equipment",
      cmd: "TOGGLE",
      alt: c("Equipment"),
      ctrl: d("Equipment"),
      shift: e("Equipment"),
    };
    n.SkillList = {
      command: b("SkillList"),
      component: "SkillList",
      cmd: "TOGGLE",
      alt: c("SkillList"),
      ctrl: d("SkillList"),
      shift: e("SkillList"),
    };
    n.Basicinfo = {
      command: b("Basicinfo"),
      component: "BasicInfo",
      cmd: "EXTEND",
      alt: c("Basicinfo"),
      ctrl: d("Basicinfo"),
      shift: e("Basicinfo"),
    };
    n.Friends = {
      command: b("Friends"),
      component: "PartyFriends",
      cmd: "FRIEND",
      alt: c("Friends"),
      ctrl: d("Friends"),
      shift: e("Friends"),
    };
    n.Party = {
      command: b("Party"),
      component: "PartyFriends",
      cmd: "PARTY",
      alt: c("Party"),
      ctrl: d("Party"),
      shift: e("Party"),
    };
    n.MercenaryInformations = {
      command: b("MercenaryInformations"),
      component: "MercenaryInformations",
      cmd: "TOGGLE",
      alt: c("MercenaryInformations"),
      ctrl: d("MercenaryInformations"),
      shift: e("MercenaryInformations"),
    };
    n.Quest = {
      command: b("Quest"),
      component: "Quest",
      cmd: "TOGGLE",
      alt: c("Quest"),
      ctrl: d("Quest"),
      shift: e("Quest"),
    };
  };
  a.match = function (a, b, c, d) {
    b = Object.keys(n);
    for (c = 0; c < b.length; c++)
      if (
        n[b[c]].command == a &&
        n[b[c]].alt == h.ALT &&
        n[b[c]].ctrl == h.CTRL &&
        n[b[c]].shift == h.SHIFT
      )
        return !0;
    return !1;
  };
  var g = {};
  document.addEventListener("keydown", function (a) {
    "F3" === a.key && a.preventDefault();
    return !1;
  });
  document.addEventListener("keyup", function (a) {
    g[a.keyCode] = !1;
    a.preventDefault();
    return !1;
  });
  a.process = function (a) {
    var b, c;
    if (m("#ShortCutOption").length) return !1;
    c = Object.keys(n);
    for (var d = 0; d < c.length; d++)
      n[c[d]].command == a &&
        n[c[d]].alt == h.ALT &&
        n[c[d]].ctrl == h.CTRL &&
        n[c[d]].shift == h.SHIFT &&
        (b = n[c[d]]);
    if (
      b &&
      !g[a] &&
      !!b.shift === h.SHIFT &&
      !!b.alt === h.ALT &&
      !!b.ctrl === h.CTRL
    ) {
      g[a] = !0;
      a = r.getComponent(b.component);
      if (a.onShortCut) a.onShortCut(b);
      return !0;
    }
    return !1;
  };
  a.shortcutToKeyString = function (a, b) {
    var c, d, e, g;
    c = Object.keys(n);
    g = c.length;
    for (e = 0; e < g; ++e)
      if (((d = n[c[e]]), d.component === a && d.cmd === b))
        return (
          (a = []),
          (c = h.toReadableKey(parseInt(c[e], 10))),
          d.alt && a.push("ALT"),
          d.shift && a.push("SHIFT"),
          d.ctrl && a.push("CTRL"),
          c && a.push(c),
          a.join(" + ")
        );
    return "None";
  };
  return a;
});
