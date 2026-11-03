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
      u.loadFile(
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
      a & m.HEAD_TOP && b.push(".head_top");
      a & m.HEAD_MID && b.push(".head_mid");
      a & m.HEAD_BOTTOM && b.push(".head_bottom");
      a & m.ARMOR && b.push(".armor");
      a & m.WEAPON && b.push(".weapon");
      a & m.SHIELD && b.push(".shield");
      a & m.GARMENT && b.push(".garment");
      a & m.SHOES && b.push(".shoes");
      a & m.ACCESSORY1 && b.push(".accessory1");
      a & m.ACCESSORY2 && b.push(".accessory2");
      a & m.AMMO && b.push(".ammo");
      a & m.HEAD_TOP_F && b.push(".head_top_f");
      a & m.HEAD_MID_F && b.push(".head_mid_f");
      a & m.HEAD_BOTTOM_F && b.push(".head_bottom_f");
      a & m.ARMOR_F && b.push(".armor_f");
      a & m.WEAPON_F && b.push(".weapon_f");
      a & m.SHIELD_F && b.push(".shield_f");
      a & m.GARMENT_F && b.push(".garment_f");
      a & m.SHOES_F && b.push(".shoes_f");
      a & m.ACC_R_F && b.push(".accessory1_f");
      a & m.ACC_L_F && b.push(".accessory2_f");
      return b.join(", ");
    }
    function l(a) {
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
            u.loadFile(
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
    function r(a) {
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
    function t(a) {
      var b = parseInt(this.getAttribute("data-index"), 10);
      if ((b = L[b]))
        P.uid === b.ITID
          ? P.remove()
          : (P.append(), (P.uid = b.ITID), P.setItem(b));
      a.stopImmediatePropagation();
      return !1;
    }
    function n(a) {
      for (
        var b = parseInt(this.getAttribute("data-index"), 10), c, d = 0;
        d < y.length;
        d++
      )
        if (y[d].index == b) {
          c = y[d];
          break;
        }
      if (c) {
        if (P.uid === c.ITID) return (P.remove(), !1);
        P.append();
        P.uid = c.ITID;
        P.item_ = c;
        P.type = "Equipment_";
        P.setItem(c);
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
      if ((a = L[a])) {
        var b = x.ui.find(".overlay"),
          c = v(this).position();
        if (c.top || c.left)
          (b.show(),
            b.css({ top: c.top - 22, left: c.left - 22 }),
            b.text(f.getItemName(a)));
      }
    }
    function k() {
      x.ui.find(".overlay").hide();
    }
    var f = a("DB/DBManager");
    a("DB/Status/StatusState");
    var m = a("DB/Items/EquipmentLocation"),
      q = a("DB/Items/ItemType"),
      v = a("Utils/jquery"),
      u = a("Core/Client"),
      A = a("Core/Preferences"),
      D = a("Engine/SessionStorage"),
      B = a("Renderer/Renderer"),
      H = a("Renderer/Camera"),
      C = a("Renderer/SpriteRenderer"),
      z = a("UI/UIManager"),
      G = a("UI/UIComponent"),
      P = a("UI/Components/ItemInfo/ItemInfo"),
      N = a("UI/Components/OnPushCart/OnPushCart"),
      I = a("text!./Equipment.html");
    a = a("text!./Equipment.css");
    var x = new G("Equipment", I, a),
      J = x.clone("Equipment_");
    z.addComponent(J);
    var E = A.get(
        "Equipment",
        { x: 480, y: 200, show: !1, reduce: !1, stats: !0 },
        1,
      ),
      L = {},
      y = {},
      F,
      K,
      M = !1,
      Q,
      W;
    x.init = function () {
      F = this.ui.find("canvas")[0].getContext("2d");
      Q = v("#lvlup_base")
        .detach()
        .mousedown(b)
        .click(function () {
          Q.detach();
          x.ui.show();
          x.ui.parent().append(x.ui);
          x.ui.is(":visible") && B.render(V);
        });
      this.ui.find(".titlebar .base").mousedown(b);
      this.ui.find(".titlebar .mini").click(function () {
        x.ui.find(".panel").toggle();
      });
      this.ui.find(".titlebar .close").click(function () {
        x.ui.hide();
      });
      this.ui.find(".OpenCart").click(function () {
        N.ui.toggle();
        N.focus();
      });
      this.ui.find(".removeOption").click(function () {
        N.ui.hide();
        x.onRemoveOption();
      });
      this.ui.find(".removeOption_").click(function () {
        x.onRemoveOption();
        event.stopImmediatePropagation();
      });
      this.ui.find(".view_status").click(c);
      this.ui.find(".show_equip").click(d);
      this.ui.find(".tabs").on("click", "button", function () {
        0 == v(this).data("index")
          ? x.ui.find(".panel").removeClass("fashion").addClass("unfashion")
          : x.ui.find(".panel").removeClass("unfashion").addClass("fashion");
      });
      this.ui.on("dragover", l);
      this.ui.on("dragleave", h);
      this.ui.on("drop", r);
      this.ui
        .find(".content")
        .on("contextmenu", ".item", t)
        .on("dblclick", ".item", g)
        .on("mouseover", "button", p)
        .on("mouseout", "button", k);
      this.ui.mousedown(b);
      this.draggable(this.ui.find(".titlebar"));
    };
    J.init = function () {
      this.ui.css({
        top: Math.min(Math.max(0, E.y), (B.height - this.ui.height()) / 2),
        left: Math.min(Math.max(0, E.x), (B.width - this.ui.width()) / 2),
      });
      K = this.ui.find("canvas")[0].getContext("2d");
      this.ui.find(".footer .left,.footer .right,#lvlup_base").hide();
      this.ui.find(".titlebar .close").on("click", function () {
        J.remove();
        P.remove();
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
        u.loadFile(
          f.INTERFACE_PATH + "basic_interface/viewon.bmp",
          function (a) {
            this.ui
              .find(".view_status")
              .css("backgroundImage", "url(" + a + ")");
          }.bind(this),
        ));
      this.ui.find("canvas").is(":visible") && B.render(V);
    };
    x.onRemove = function () {
      Q.detach();
      x.ui.find(".OpenCart").hide();
      x.ui.find(".removeOption").hide();
      x.ui.find(".removeOption_").hide();
      L = {};
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
        ? (B.render(V), Q.detach(), this.focus())
        : B.stop(V);
    };
    x.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          this.toggle();
      }
    };
    x.setEquipConfig = function (a) {
      M = a;
      u.loadFile(
        f.INTERFACE_PATH + "checkbox_" + (a ? "1" : "0") + ".bmp",
        function (a) {
          x.ui.find(".show_equip").css("backgroundImage", "url(" + a + ")");
        },
      );
    };
    x.equip = function (a, b) {
      var c = f.getItemInfo(a.ITID);
      L[a.index] = a;
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
                v.escape(f.getItemName(a)) +
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
                v.escape(f.getItemName(a)) +
                "\x3c/span\x3e\x3c/div\x3e",
            );
      }
      u.loadFile(
        f.INTERFACE_PATH + "item/" + c.identifiedResourceName + ".bmp",
        function (b) {
          this.ui
            .find('.item[data-index\x3d"' + a.index + '"] button')
            .css("backgroundImage", "url(" + b + ")");
        }.bind(this),
      );
    };
    J.equip = function (a, b) {
      var c = f.getItemInfo(a.ITID);
      b = a.WearState;
      this.ui
        .find(e(b))
        .html(
          '\x3cdiv class\x3d"item" data-index\x3d"' +
            a.index +
            '"\x3e\x3cbutton\x3e\x3c/button\x3e\x3cspan\x3e' +
            v.escape(f.getItemName(a)) +
            "\x3c/span\x3e\x3c/div\x3e",
        );
      u.loadFile(
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
      var c = L[a];
      this.ui.find(b).empty();
      delete L[a];
      return c;
    };
    x.setBound = function (a) {
      if ((a = this.getItemByIndex(a)))
        a.bindOnEquipType = 0 < a.bindOnEquipType ? 0 : 2;
    };
    x.getItemByIndex = function (a) {
      for (var b in L) if (L[b].index === a) return L[b];
      return null;
    };
    J.setEquip = function (a) {
      y = a.ItemInfo;
      this.ui
        .find(".titlebar .text")
        .html(a.characterName + " \u88c5\u5907\u680f");
      for (a = 0; a < y.length; a++) y[a].WearState && J.equip(y[a]);
    };
    x.ShowOEquip = function (a) {
      J.append();
      J.setEquip(a);
      x.renderOCharacter(W);
    };
    x.updateInfos = function (a) {
      var b = this.ui
        .find('.item[data-gid\x3d"' + a.GID + '"]')
        .attr("data-index");
      b && (L[b].makerInfo = a);
    };
    x.getAmount = function () {
      return Object.keys(L).length;
    };
    x.onLevelUp = function () {
      Q.appendTo("body");
    };
    var V = (function () {
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
          e = D.Entity;
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
          H.direction = 4;
          e.direction = 4;
          e.headDir = 0;
          e.action = e.ACTION.IDLE;
          e.animation = d;
          c.set(e.effectColor);
          e.effectColor.set(b);
          C.bind2DContext(F, 30, 130);
          F.clearRect(0, 0, F.canvas.width, F.canvas.height);
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
      W = a;
    };
    x.renderOCharacter = function (a) {
      var b = new Float32Array([1, 1, 1, 1]),
        c = new Float32Array(4),
        d = a.direction,
        e = a.headDir,
        f = a.action,
        g = a.animation;
      H.direction = 4;
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
      C.bind2DContext(K, 30, 130);
      K.clearRect(0, 0, K.canvas.width, K.canvas.height);
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
    return z.addComponent(x);
  },
);
