define(
  "UI/Components/PetInformations/PetInformations",
  "require DB/DBManager DB/Pets/PetEvolution Core/Client Core/Preferences Renderer/Renderer UI/UIManager UI/UIComponent text!./PetInformations.html text!./PetInformations.css".split(
    " ",
  ),
  function (a) {
    function b() {
      switch (this.value) {
        case "feed":
          f.reqPetFeed();
          break;
        case "action":
          f.reqPetAction();
          break;
        case "release":
          f.reqBackToEgg();
          break;
        case "unequip":
          f.reqUnEquipPet();
          break;
        default:
          var a = q[this.value];
          if (a) {
            for (var b = "", c = 1; c < a.length; c += 2)
              ((b +=
                l.getItemInfo(a[c]).identifiedDiSPlayName + "*" + a[c + 1]),
                c + 2 < a.length && (b += "\uff0c"));
            g.showPromptBox(
              "\u8fdb\u5316\u9700\u8981\u6750\u6599(" +
                b +
                ")\u8981\u8fdb\u5316\u5417\uff1f",
              "ok",
              "cancel",
              function () {
                f.reqEvolution(a[0]);
              },
              null,
            );
          }
      }
      this.value = "default";
    }
    function c() {
      var a = f.ui.find(".name");
      f.reqNameEdit(a.val());
    }
    function d() {
      f.ui.hide();
    }
    function e(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    var l = a("DB/DBManager"),
      h = a("DB/Pets/PetEvolution"),
      r = a("Core/Client"),
      t = a("Core/Preferences"),
      n = a("Renderer/Renderer"),
      g = a("UI/UIManager"),
      p = a("UI/UIComponent"),
      k = a("text!./PetInformations.html");
    a = a("text!./PetInformations.css");
    var f = new p("PetInformations", k, a),
      m = t.get("PetInformations", { x: 100, y: 200, show: !1 }, 1),
      q = {};
    f.init = function () {
      this.draggable(this.ui.find(".titlebar"));
      this.ui.find(".base").mousedown(e);
      this.ui.find(".close").click(d);
      this.ui.find(".modify").click(c);
      this.ui.find(".command").change(b);
      this.ui.hide();
      this.ui.css({
        top: Math.min(Math.max(0, m.y), n.height - this.ui.height()),
        left: Math.min(Math.max(0, m.x), n.width - this.ui.width()),
      });
    };
    f.onRemove = function () {
      m.show = this.ui.is(":visible");
      m.y = parseInt(this.ui.css("top"), 10);
      m.x = parseInt(this.ui.css("left"), 10);
      m.save();
    };
    f.onShortCut = function (a) {
      if (this.ui)
        switch (a.cmd) {
          case "TOGGLE":
            (this.ui.toggle(), this.ui.is(":visible") && this.focus());
        }
    };
    f.setInformations = function (a) {
      q = {};
      this.ui.find(".command .evolution").remove();
      this.ui.find(".name").val(a.szName);
      this.ui.find(".level").text(a.nLevel);
      this.setHunger(a.nFullness);
      this.setIntimacy(a.nRelationship);
      this.ui.find(".accessory").text(l.getMessage(a.ITID ? 598 : 600));
      r.loadFile(
        l.getPetIllustPath(a.job),
        function (a) {
          this.ui.find(".content").css("backgroundImage", "url(" + a + ")");
        }.bind(this),
      );
      a.bModified
        ? this.ui
            .find(".name, .modify")
            .addClass("disabled")
            .attr("disabled", !0)
        : this.ui
            .find(".name, .modify")
            .removeClass("disabled")
            .attr("disabled", !1);
      if ((q = h[a.job])) {
        a = this.ui.find(".command");
        for (var b = Object.keys(q), c = 0; c < b.length; c++)
          a.append(
            jQuery("\x3coption/\x3e")
              .addClass("evolution")
              .text("\u8fdb\u5316 - " + l.getmobData(b[c]).kName)
              .val(b[c]),
          );
      }
    };
    f.setIntimacy = function (a) {
      this.ui
        .find(".intimacy")
        .text(
          l.getMessage(
            100 > a ? 672 : 250 > a ? 673 : 600 > a ? 669 : 900 > a ? 674 : 675,
          ),
        );
    };
    f.setHunger = function (a) {
      this.ui
        .find(".hunger")
        .text(
          l.getMessage(
            10 > a ? 667 : 25 > a ? 668 : 75 > a ? 669 : 90 > a ? 670 : 671,
          ),
        );
    };
    f.reqPetFeed = function () {};
    f.reqPetAction = function () {};
    f.reqNameEdit = function () {};
    f.reqUnEquipPet = function () {};
    f.reqBackToEgg = function () {};
    f.reqEvolution = function () {};
    return g.addComponent(f);
  },
);
