define("Preferences/ShortCutControls", [
  "Core/Preferences",
  "Controls/KeyEventHandler",
], function (a, b) {
  var c = {};
  c.F1 = {
    init: b.F1,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F2 = {
    init: b.F2,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F3 = {
    init: b.F3,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F4 = {
    init: b.F4,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F5 = {
    init: b.F5,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F6 = {
    init: b.F6,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F7 = {
    init: b.F7,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F8 = {
    init: b.F8,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F9 = {
    init: b.F9,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F10 = {
    init: b.F10,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F12 = {
    init: b.F12,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F2_1 = {
    init: b[1],
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F2_2 = {
    init: b[2],
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F2_3 = {
    init: b[3],
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F2_4 = {
    init: b[4],
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F2_5 = {
    init: b[5],
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F2_6 = {
    init: b[6],
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F2_7 = {
    init: b[7],
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F2_8 = {
    init: b[8],
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F2_9 = {
    init: b[9],
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F3_1 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F3_2 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F3_3 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F3_4 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F3_5 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F3_6 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F3_7 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F3_8 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F3_9 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F4_1 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F4_2 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F4_3 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F4_4 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F4_5 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F4_6 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F4_7 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F4_8 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.F4_9 = {
    init: "",
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.situp = {
    init: b.INSERT,
    Custom_settings: "",
    alt: !1,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.ChatRoomCreate = {
    init: b.C,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.Inventory = {
    init: b.E,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.OnPushCart = {
    init: b.W,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.Guild = {
    init: b.G,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.PetInformations = {
    init: b.J,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.EMO = {
    init: b.L,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.WorldMap = {
    init: b.M,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.WinStats = {
    init: b.A,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.Equipment = {
    init: b.Q,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.SkillList = {
    init: b.S,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.Basicinfo = {
    init: b.V,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.Friends = {
    init: b.H,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.Party = {
    init: b.Z,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.MercenaryInformations = {
    init: b.R,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  c.Quest = {
    init: b.U,
    Custom_settings: "",
    alt: !0,
    Custom_alt: !1,
    ctrl: !1,
    Custom_ctrl: !1,
    shift: !1,
    Custom_shift: !1,
  };
  return a.get("ShortCutControls", c, 2.4);
});
