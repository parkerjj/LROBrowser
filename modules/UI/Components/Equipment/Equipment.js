define(
  "UI/Components/Equipment/Equipment",
  "require DB/DBManager DB/Status/StatusState DB/Items/EquipmentLocation DB/Items/ItemType Utils/jquery Core/Client Core/Preferences Engine/SessionStorage Renderer/Renderer Renderer/Camera Renderer/SpriteRenderer UI/UIManager UI/UIComponent UI/Components/ItemInfo/ItemInfo UI/UIManager UI/UIComponent UI/Components/ItemInfo/ItemInfo UI/Components/OnPushCart/OnPushCart text!./Equipment.html text!./Equipment.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function c() {
      var a = x.ui.find(".status_component"),
        b = x.ui.find(".view_status"),
        c = a.is(":visible") ? "on" : "off";
      a.toggle();
      v.loadFile(
        f.INTERFACE_PATH + "basic_interface/view" + c + ".bmp",
        function (a) {
          b.css("backgroundImage", "url(" + a + ")");
        },
      );
    }
    function d() {
      x.onConfigUpdate(0, M ? 0 : 1);
    }
    function e(a) {
      var b = [];
      a & k.HEAD_TOP && b.push(".head_top");
      a & k.HEAD_MID && b.push(".head_mid");
      a & k.HEAD_BOTTOM && b.push(".head_bottom");
      a & k.ARMOR && b.push(".armor");
      a & k.WEAPON && b.push(".weapon");
      a & k.SHIELD && b.push(".shield");
      a & k.GARMENT && b.push(".garment");
      a & k.SHOES && b.push(".shoes");
      a & k.ACCESSORY1 && b.push(".accessory1");
      a & k.ACCESSORY2 && b.push(".accessory2");
      a & k.AMMO && b.push(".ammo");
      a & k.HEAD_TOP_F && b.push(".head_top_f");
      a & k.HEAD_MID_F && b.push(".head_mid_f");
      a & k.HEAD_BOTTOM_F && b.push(".head_bottom_f");
      a & k.ARMOR_F && b.push(".armor_f");
      a & k.WEAPON_F && b.push(".weapon_f");
      a & k.SHIELD_F && b.push(".shield_f");
      a & k.GARMENT_F && b.push(".garment_f");
      a & k.SHOES_F && b.push(".shoes_f");
      a & k.ACC_R_F && b.push(".accessory1_f");
      a & k.ACC_L_F && b.push(".accessory2_f");
      return b.join(", ");
    }
    function m(a) {
      if (window._OBJ_DRAG_) {
        var b = window._OBJ_DRAG_,
          c;
        "item" === b.type &&
          ((b = b.data),
          (b.type !== q.WEAPON && b.type !== q.EQUIP) ||
            !b.IsIdentified ||
            b.IsDamaged ||
            ((b = e("location" in b ? b.location : b.WearLocation)),
            (c = x.ui.find(b)),
            v.loadFile(
              f.INTERFACE_PATH + "basic_interface/item_invert.bmp",
              function (a) {
                c.css("backgroundImage", "url(" + a + ")");
              },
            )));
      }
      a.stopImmediatePropagation();
      return !1;
    }
    function h(a) {
      x.ui.find("td").css("backgroundImage", "none");
      a.stopImmediatePropagation();
      return !1;
    }
    function t(a) {
      var b;
      try {
        b = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (T) {}
      b &&
        "item" === b.type &&
        ((b = b.data),
        (b.type !== q.WEAPON && b.type !== q.EQUIP && b.type !== q.AMMO) ||
          !b.IsIdentified ||
          b.IsDamaged ||
          (x.ui.find("td").css("backgroundImage", "none"),
          x.onEquipItem(b.index, "location" in b ? b.location : b.WearState)));
      a.stopImmediatePropagation();
      return !1;
    }
    function r(a) {
      var b = parseInt(this.getAttribute("data-index"), 10);
      if ((b = F[b]))
        N.uid === b.ITID
          ? N.remove()
          : (N.append(), (N.uid = b.ITID), N.setItem(b));
      a.stopImmediatePropagation();
      return !1;
    }
    function n(a) {
      for (
        var b = parseInt(this.getAttribute("data-index"), 10), c, d = 0;
        d < z.length;
        d++
      )
        if (z[d].index == b) {
          c = z[d];
          break;
        }
      if (c) {
        if (N.uid === c.ITID) return (N.remove(), !1);
        N.append();
        N.uid = c.ITID;
        N.item_ = c;
        N.type = "Equipment_";
        N.setItem(c);
      }
      a.stopImmediatePropagation();
      return !1;
    }
    function g() {
      var a = parseInt(this.getAttribute("data-index"), 10);
      x.onUnEquip(a);
      x.ui.find(".overlay").hide();
    }
    function p() {
      var a = parseInt(this.parentNode.getAttribute("data-index"), 10);
      if ((a = F[a])) {
        var b = x.ui.find(".overlay"),
          c = u(this).position();
        if (c.top || c.left)
          (b.show(),
            b.css({ top: c.top - 22, left: c.left - 22 }),
            b.text(f.getItemName(a)));
      }
    }
    function l() {
      x.ui.find(".overlay").hide();
    }
    var f = a("DB/DBManager");
    a("DB/Status/StatusState");
    var k = a("DB/Items/EquipmentLocation"),
      q = a("DB/Items/ItemType"),
      u = a("Utils/jquery"),
      v = a("Core/Client"),
      A = a("Core/Preferences"),
      C = a("Engine/SessionStorage"),
      B = a("Renderer/Renderer"),
      J = a("Renderer/Camera"),
      D = a("Renderer/SpriteRenderer"),
      y = a("UI/UIManager"),
      H = a("UI/UIComponent"),
      N = a("UI/Components/ItemInfo/ItemInfo"),
      O = a("UI/Components/OnPushCart/OnPushCart"),
      I = a("text!./Equipment.html");
    a = a("text!./Equipment.css");
    var x = new H("Equipment", I, a),
      K = x.clone("Equipment_");
    y.addComponent(K);
    var E = A.get(
        "Equipment",
        { x: 480, y: 200, show: !1, reduce: !1, stats: !0 },
        1,
      ),
      F = {},
      z = {},
      G,
      L,
      M = !1,
      Q,
      V;
    x.init = function () {
      G = this.ui.find("canvas")[0].getContext("2d");
      Q = u("#lvlup_base")
        .detach()
        .mousedown(b)
        .click(function () {
          Q.detach();
          x.ui.show();
          x.ui.parent().append(x.ui);
          x.ui.is(":visible") && B.render(W);
        });
      this.ui.find(".titlebar .base").mousedown(b);
      this.ui.find(".titlebar .mini").click(function () {
        x.ui.find(".panel").toggle();
      });
      this.ui.find(".titlebar .close").click(function () {
        x.ui.hide();
      });
      this.ui.find(".OpenCart").click(function () {
        O.ui.toggle();
        O.focus();
      });
      this.ui.find(".removeOption").click(function () {
        O.ui.hide();
        x.onRemoveOption();
      });
      this.ui.find(".removeOption_").click(function () {
        x.onRemoveOption();
        event.stopImmediatePropagation();
      });
      this.ui.find(".view_status").click(c);
      this.ui.find(".show_equip").click(d);
      this.ui.find(".tabs").on("click", "button", function () {
        0 == u(this).data("index")
          ? x.ui.find(".panel").removeClass("fashion").addClass("unfashion")
          : x.ui.find(".panel").removeClass("unfashion").addClass("fashion");
      });
      this.ui.on("dragover", m);
      this.ui.on("dragleave", h);
      this.ui.on("drop", t);
      this.ui
        .find(".content")
        .on("contextmenu", ".item", r)
        .on("dblclick", ".item", g)
        .on("mouseover", "button", p)
        .on("mouseout", "button", l);
      this.ui.mousedown(b);
      this.draggable(this.ui.find(".titlebar"));
    };
    K.init = function () {
      this.ui.css({
        top: Math.min(Math.max(0, E.y), (B.height - this.ui.height()) / 2),
        left: Math.min(Math.max(0, E.x), (B.width - this.ui.width()) / 2),
      });
      L = this.ui.find("canvas")[0].getContext("2d");
      this.ui.find(".footer .left,.footer .right,#lvlup_base").hide();
      this.ui.find(".titlebar .close").on("click", function () {
        K.remove();
        N.remove();
        event.stopImmediatePropagation();
      });
      this.ui.on("contextmenu", ".item", n);
      this.draggable(this.ui.find(".titlebar"));
    };
    x.onAppend = function () {
      this.ui.css({
        top: Math.min(Math.max(0, E.y), (B.height - this.ui.height()) / 2),
        left: Math.min(Math.max(0, E.x), (B.width - this.ui.width()) / 2),
      });
      this.ui.hide();
      E.reduce && this.ui.find(".panel").hide();
      E.stats ||
        (this.ui.find(".status_component").hide(),
        v.loadFile(
          f.INTERFACE_PATH + "basic_interface/viewon.bmp",
          function (a) {
            this.ui
              .find(".view_status")
              .css("backgroundImage", "url(" + a + ")");
          }.bind(this),
        ));
      this.ui.find("canvas").is(":visible") && B.render(W);
    };
    x.onRemove = function () {
      Q.detach();
      x.ui.find(".OpenCart").hide();
      x.ui.find(".removeOption").hide();
      x.ui.find(".removeOption_").hide();
      F = {};
      this.ui.find(".col1, .col3, .ammo").empty();
      this.ui.find(".item").remove();
      E.show = this.ui.is(":visible");
      E.reduce = "none" === this.ui.find(".panel").css("display");
      E.stats = "none" !== this.ui.find(".status_component").css("display");
      E.y = parseInt(this.ui.css("top"), 10);
      E.x = parseInt(this.ui.css("left"), 10);
      E.save();
    };
    x.toggle = function () {
      this.ui.toggle();
      this.ui.is(":visible")
        ? (B.render(W), Q.detach(), this.focus())
        : B.stop(W);
    };
    x.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          this.toggle();
      }
    };
    x.setEquipConfig = function (a) {
      M = a;
      v.loadFile(
        f.INTERFACE_PATH + "checkbox_" + (a ? "1" : "0") + ".bmp",
        function (a) {
          x.ui.find(".show_equip").css("backgroundImage", "url(" + a + ")");
        },
      );
    };
    x.equip = function (a, b) {
      var c = f.getItemInfo(a.ITID);
      F[a.index] = a;
      1 === arguments.length &&
        ("WearState" in a
          ? (b = a.WearState)
          : "location" in a && (b = a.location));
      switch (a.slot.card1) {
        case 255:
        case 254:
        case 65280:
          var d = 65535 * a.slot.card4 + a.slot.card3 + a.slot.card4;
          this.ui
            .find(e(b))
            .html(
              '\x3cdiv class\x3d"item" data-index\x3d"' +
                a.index +
                '" data-gid\x3d"' +
                d +
                '"\x3e\x3cbutton\x3e\x3c/button\x3e\x3cspan\x3e' +
                u.escape(f.getItemName(a)) +
                "\x3c/span\x3e\x3c/div\x3e",
            );
          break;
        default:
          this.ui
            .find(e(b))
            .html(
              '\x3cdiv class\x3d"item" data-index\x3d"' +
                a.index +
                '"\x3e\x3cbutton\x3e\x3c/button\x3e\x3cspan\x3e' +
                u.escape(f.getItemName(a)) +
                "\x3c/span\x3e\x3c/div\x3e",
            );
      }
      v.loadFile(
        f.INTERFACE_PATH + "item/" + c.identifiedResourceName + ".bmp",
        function (b) {
          this.ui
            .find('.item[data-index\x3d"' + a.index + '"] button')
            .css("backgroundImage", "url(" + b + ")");
        }.bind(this),
      );
    };
    K.equip = function (a, b) {
      var c = f.getItemInfo(a.ITID);
      b = a.WearState;
      this.ui
        .find(e(b))
        .html(
          '\x3cdiv class\x3d"item" data-index\x3d"' +
            a.index +
            '"\x3e\x3cbutton\x3e\x3c/button\x3e\x3cspan\x3e' +
            u.escape(f.getItemName(a)) +
            "\x3c/span\x3e\x3c/div\x3e",
        );
      v.loadFile(
        f.INTERFACE_PATH + "item/" + c.identifiedResourceName + ".bmp",
        function (b) {
          this.ui
            .find('.item[data-index\x3d"' + a.index + '"] button')
            .css("backgroundImage", "url(" + b + ")");
        }.bind(this),
      );
    };
    x.unEquip = function (a, b) {
      b = e(b);
      var c = F[a];
      this.ui.find(b).empty();
      delete F[a];
      return c;
    };
    x.setBound = function (a) {
      if ((a = this.getItemByIndex(a)))
        a.bindOnEquipType = 0 < a.bindOnEquipType ? 0 : 2;
    };
    x.getItemByIndex = function (a) {
      for (var b in F) if (F[b].index === a) return F[b];
      return null;
    };
    K.setEquip = function (a) {
      z = a.ItemInfo;
      this.ui
        .find(".titlebar .text")
        .html(a.characterName + " \u88c5\u5907\u680f");
      for (a = 0; a < z.length; a++) z[a].WearState && K.equip(z[a]);
    };
    x.ShowOEquip = function (a) {
      K.append();
      K.setEquip(a);
      x.renderOCharacter(V);
    };
    x.updateInfos = function (a) {
      var b = this.ui
        .find('.item[data-gid\x3d"' + a.GID + '"]')
        .attr("data-index");
      b && (F[b].makerInfo = a);
    };
    x.getAmount = function () {
      return Object.keys(F).length;
    };
    x.onLevelUp = function () {
      Q.appendTo("body");
    };
    var W = (function () {
      var a = 0,
        b = new Float32Array([1, 1, 1, 1]),
        c = new Float32Array(4),
        d = {
          tick: 0,
          frame: 0,
          repeat: !0,
          play: !0,
          next: !1,
          delay: 0,
          save: !1,
        };
      return function (e) {
        if (!(e < a + 1e3)) {
          a = e;
          e = C.Entity;
          var f = e.direction,
            g = e.headDir,
            h = e.action,
            k = e.animation;
          x.ui.find(".OpenCart").hide();
          x.ui.find(".removeOption").hide();
          x.ui.find(".removeOption_").hide();
          e.cart &&
            (x.ui.find(".OpenCart").show(), x.ui.find(".removeOption").show());
          e.falcon && x.ui.find(".removeOption_").show();
          !e.riding ||
            (7 != e._job &&
              14 != e._job &&
              4008 != e._job &&
              4015 != e._job &&
              4060 != e._job &&
              4066 != e._job) ||
            x.ui.find(".removeOption_").show();
          J.direction = 4;
          e.direction = 4;
          e.headDir = 0;
          e.action = e.ACTION.IDLE;
          e.animation = d;
          c.set(e.effectColor);
          e.effectColor.set(b);
          D.bind2DContext(G, 30, 130);
          G.clearRect(0, 0, G.canvas.width, G.canvas.height);
          e.renderEntity();
          e.direction = f;
          e.headDir = g;
          e.action = h;
          e.animation = k;
          e.effectColor.set(c);
        }
      };
    })();
    x.setCharacter = function (a) {
      V = a;
    };
    x.renderOCharacter = function (a) {
      var b = new Float32Array([1, 1, 1, 1]),
        c = new Float32Array(4),
        d = a.direction,
        e = a.headDir,
        f = a.action,
        g = a.animation;
      J.direction = 4;
      a.direction = 4;
      a.headDir = 0;
      a.action = a.ACTION.IDLE;
      a.animation = {
        tick: 0,
        frame: 0,
        repeat: !0,
        play: !0,
        next: !1,
        delay: 0,
        save: !1,
      };
      c.set(a.effectColor);
      a.effectColor.set(b);
      D.bind2DContext(L, 30, 130);
      L.clearRect(0, 0, L.canvas.width, L.canvas.height);
      a.renderEntity();
      a.direction = d;
      a.headDir = e;
      a.action = f;
      a.animation = g;
      a.effectColor.set(c);
    };
    x.onUnEquip = function () {};
    x.onConfigUpdate = function () {};
    x.onEquipItem = function () {};
    x.onRemoveCart = function () {};
    return y.addComponent(x);
  },
);
