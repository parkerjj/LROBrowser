define(
  "UI/Components/Homunc/HomuncInformations",
  "require DB/DBManager Engine/SessionStorage Core/Preferences Renderer/EntityManager UI/UIManager UI/UIComponent UI/Components/Homunc/HomuncskillList text!./HomuncInformations.html text!./HomuncInformations.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = l.ui.find(".name");
      l.reqNameEdit(a.val());
    }
    function c(a) {
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
    function d() {
      l.ui.hide();
    }
    var e = a("DB/DBManager"),
      m = a("Core/Preferences"),
      h = a("Engine/SessionStorage"),
      r = a("Renderer/EntityManager"),
      q = a("UI/UIManager"),
      k = a("UI/UIComponent"),
      g = a("UI/Components/Homunc/HomuncskillList"),
      t = a("text!./HomuncInformations.html");
    a = a("text!./HomuncInformations.css");
    var l = new k("HomuncInformations", t, a);
    m.get("HomuncInformations", { x: 100, y: 200, show: !1 }, 1);
    l.init = function () {
      this.draggable(this.ui.find(".titlebar"));
      this.ui.find(".close").click(d);
      this.ui.find(".modify").click(b);
      this.ui.find(".fired").click(l.reqFired);
      this.ui.find(".feed").click(l.reqPetFeed);
      this.ui.find(".skill").click(function () {
        g.ui.toggle();
        g.focus();
      });
      this.ui.hide();
    };
    l.onRemove = function () {
      h.homGID = null;
      l.info = null;
    };
    l.onShortCut = function (a) {
      if (this.ui)
        switch (a.cmd) {
          case "TOGGLE":
            (this.ui.toggle(), this.ui.is(":visible") && this.focus());
        }
    };
    l.update = function (a, b) {
      if (this.ui)
        switch (a) {
          case "aspd":
            this.ui.find("." + a).text(Math.floor(200 - b / 10));
            break;
          case "ExpireDate":
            this.ui.find(".deltime").text(c(b));
            break;
          default:
            this.ui.find("." + a).text(b);
        }
    };
    l.initData = function (a) {
      var b = r.get(a.GID);
      if (b)
        switch (a.state) {
          case 0:
            h.homGID = a.GID;
            h.homGID && l.append();
            break;
          case 1:
            this.ui
              .find(".nRelationship")
              .text(
                e.getMessage(
                  100 > a.data
                    ? 672
                    : 250 > a.data
                      ? 673
                      : 600 > a.data
                        ? 669
                        : 900 > a.data
                          ? 674
                          : 675,
                ),
              );
            break;
          case 2:
            this.ui.find(".nFullness").text(a.data);
            b.life.nFullness = a.data;
            b.life.update();
            break;
          case 3:
            this.ui.find(".accessory").text(e.getMessage(a.data ? 598 : 600));
        }
    };
    l.setInformations = function (a) {
      var b = r.get(h.homGID);
      b &&
        (a &&
          ((l.info = a),
          this.ui.find(".atak").text(a.atk),
          this.ui.find(".matak").text(a.Matk),
          this.ui.find(".hit").text(a.Matk),
          this.ui.find(".critical").text(a.critical),
          this.ui.find(".def").text(a.def),
          this.ui.find(".mdef").text(a.Mdef),
          this.ui.find(".flee").text(a.flee),
          this.ui.find(".aspd").text(Math.floor(200 - a.aspd / 10)),
          this.ui.find(".name").val(a.szName),
          a.bModified
            ? this.ui
                .find(".name, .modify")
                .addClass("disabled")
                .attr("disabled", !0)
            : this.ui
                .find(".name, .modify")
                .removeClass("disabled")
                .attr("disabled", !1),
          this.ui.find(".level").text(a.nLevel),
          this.ui.find(".hp").text(a.hp),
          this.ui.find(".maxhp").text(a.maxHP),
          this.ui.find(".sp").text(a.sp),
          this.ui.find(".maxsp").text(a.maxSP),
          this.ui.find(".deltime").text(c(a.ExpireDate)),
          this.ui.find(".faith").text(a.faith),
          this.ui.find(".callNum").text(a.toal_call_num),
          this.ui.find(".killNum").text(a.approval_monster_kill_counter),
          this.ui.find(".exp").text(a.exp),
          this.ui.find(".max_exp").text(a.maxEXP),
          this.ui.find(".nFullness").text(a.nFullness),
          this.ui
            .find(".nRelationship")
            .text(
              e.getMessage(
                100 > a.nRelationship
                  ? 672
                  : 250 > a.nRelationship
                    ? 673
                    : 600 > a.nRelationship
                      ? 669
                      : 900 > a.nRelationship
                        ? 674
                        : 675,
              ),
            ),
          this.ui.find(".accessory").text(e.getMessage(a.Equipid ? 598 : 600)),
          g.setPoints(a.SKPoint),
          (b.attack_range = a.ATKRange),
          (b.life.hp = a.hp),
          (b.life.hp_max = a.maxHP),
          (b.life.sp = a.sp),
          (b.life.sp_max = a.maxSP),
          (b.life.nFullness = a.nFullness)),
        -1 < b.life.hp &&
          -1 < b.life.hp_max &&
          (b.life.update(), (b.life.display = !0)),
        l.WalkEnd());
    };
    l.resetHom = function () {
      var a = r.get(h.homGID),
        b = l.info;
      a &&
        ((a.attack_range = b.ATKRange),
        (a.life.hp = b.hp),
        (a.life.hp_max = b.maxHP),
        (a.life.sp = b.sp),
        (a.life.sp_max = b.maxSP),
        -1 < a.life.hp &&
          -1 < a.life.hp_max &&
          (a.life.update(), (a.life.display = !0)),
        l.WalkEnd());
    };
    l.reqNameEdit = function () {};
    l.reqFired = function () {};
    l.reqPetFeed = function () {};
    l.WalkEnd = function () {};
    return q.addComponent(l);
  },
);
