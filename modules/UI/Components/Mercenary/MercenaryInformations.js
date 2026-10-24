define(
  "UI/Components/Mercenary/MercenaryInformations",
  "require DB/DBManager Core/Preferences Engine/SessionStorage Renderer/EntityManager UI/UIManager UI/UIComponent UI/Components/Mercenary/MercenaryskillList text!./MercenaryInformations.html text!./MercenaryInformations.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b, c, d, e;
      a = new Date(1e3 * a);
      a.getFullYear();
      b =
        (10 > a.getMonth() + 1 ? "0" + (a.getMonth() + 1) : a.getMonth() + 1) +
        "\u6708";
      c = a.getDate() + "\u65e5";
      d = a.getHours() + "\u65f6";
      e = a.getMinutes() + "\u5206";
      a.getSeconds();
      return b + c + d + e;
    }
    function c() {
      g.ui.hide();
    }
    a("DB/DBManager");
    var d = a("Core/Preferences"),
      e = a("Engine/SessionStorage"),
      m = a("Renderer/EntityManager"),
      h = a("UI/UIManager"),
      r = a("UI/UIComponent"),
      q = a("UI/Components/Mercenary/MercenaryskillList"),
      k = a("text!./MercenaryInformations.html");
    a = a("text!./MercenaryInformations.css");
    var g = new r("MercenaryInformations", k, a);
    d.get("MercenaryInformations", { x: 100, y: 200, show: !0 }, 1);
    g.init = function () {
      this.draggable(this.ui.find(".titlebar"));
      this.ui.find(".close").click(c);
      this.ui.find(".skill").click(function () {
        q.ui.toggle();
        q.focus();
      });
      this.ui.find(".fired").click(g.reqFired);
      this.ui.hide();
    };
    g.onRemove = function () {};
    g.onShortCut = function (a) {
      if (this.ui)
        switch (a.cmd) {
          case "TOGGLE":
            (this.ui.toggle(), this.ui.is(":visible") && this.focus());
        }
    };
    g.update = function (a, c) {
      if (this.ui)
        switch (a) {
          case "aspd":
            this.ui.find("." + a).text(Math.floor(200 - c / 10));
            break;
          case "ExpireDate":
            this.ui.find(".deltime").text(b(c));
            break;
          default:
            this.ui.find("." + a).text(c);
        }
    };
    g.setInformations = function (a) {
      var c = m.get(a.AID);
      e.mercGID = a.AID;
      this.ui.find(".atak").text(a.atk);
      this.ui.find(".matak").text(a.Matk);
      this.ui.find(".hit").text(a.Matk);
      this.ui.find(".critical").text(a.critical);
      this.ui.find(".def").text(a.def);
      this.ui.find(".mdef").text(a.Mdef);
      this.ui.find(".flee").text(a.flee);
      this.ui.find(".aspd").text(Math.floor(200 - a.aspd / 10));
      this.ui.find(".name").text(a.name);
      this.ui.find(".level").text(a.level);
      this.ui.find(".hp").text(a.hp);
      this.ui.find(".maxhp").text(a.maxHP);
      this.ui.find(".sp").text(a.sp);
      this.ui.find(".maxsp").text(a.maxSP);
      this.ui.find(".deltime").text(b(a.ExpireDate));
      this.ui.find(".faith").text(a.faith);
      this.ui.find(".callNum").text(a.toal_call_num);
      this.ui.find(".killNum").text(a.approval_monster_kill_counter);
      c.attack_range = a.ATKRange;
      c.life.hp = a.hp;
      c.life.hp_max = a.maxHP;
      c.life.sp = a.sp;
      c.life.sp_max = a.maxSP;
      -1 < c.life.hp &&
        -1 < c.life.hp_max &&
        (c.life.update(), (c.life.display = !0));
      g.WalkEnd();
    };
    g.reqFired = function () {};
    g.WalkEnd = function () {};
    return h.addComponent(g);
  },
);
