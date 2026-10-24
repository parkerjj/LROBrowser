define(
  "UI/Components/Attendance/Attendance",
  "require DB/DBManager DB/CheckAttendance Utils/jquery Utils/Texture Network/NetworkManager Network/PacketStructure Core/Client UI/UIManager UI/UIComponent UI/Components/ItemInfo/ItemInfo UI/Components/ItemObtain/ItemObtain text!./Attendance.html text!./Attendance.css".split(
    " ",
  ),
  function (a) {
    var b = a("DB/DBManager"),
      c = a("DB/CheckAttendance"),
      d = a("Utils/jquery"),
      e = a("Utils/Texture"),
      m = a("Network/NetworkManager"),
      h = a("Network/PacketStructure"),
      r = a("Core/Client"),
      q = a("UI/UIManager"),
      k = a("UI/UIComponent"),
      g = a("UI/Components/ItemInfo/ItemInfo"),
      t = a("UI/Components/ItemObtain/ItemObtain"),
      l = a("text!./Attendance.html");
    a = a("text!./Attendance.css");
    var f = 0,
      n = new k("Attendance", l, a),
      p = !1,
      v = !1;
    n.init = function () {
      this.ui.on("click", function () {
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".footer .close").on("click", function () {
        p = !1;
        n.ui.hide();
      });
      this.ui.find(".main").on("click", ".item", function () {
        d(this).index();
        if (d(this).hasClass("sd")) {
          var a = new h.CZ.REQ_ATTENDANCE();
          m.sendPacket(a);
          return !1;
        }
        var a = parseInt(d(this).attr("data-itid"), 10),
          c = b.getItemInfo(a);
        c.ITID = a;
        c.IsIdentified = 1;
        c &&
          (g.uid != a
            ? (g.append(), (g.uid = a), (g.type = "Attendance"), g.setItem(c))
            : g.remove());
      });
    };
    n.onAppend = function () {
      p && n.showUI();
    };
    n.onRemove = function () {};
    n.toggle = function () {
      if (!this.ui.is(":visible")) {
        var a = new h.CZ.REQ_OPEN_UI();
        a.uid = 5;
        m.sendPacket(a);
      }
    };
    n.addItem = function (a, c) {
      var d = c + 1,
        g = b.getItemInfo(a.id),
        h = n.ui.find(".main .borders");
      h.append(
        '\x3cdiv class\x3d"item" data-itid\x3d"' +
          a.id +
          '"  data-idx\x3d"' +
          c +
          '"\x3e\x3cdiv class\x3d"border"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"description"\x3e\x3cspan class\x3d"count"\x3e' +
          (a.amount || 1) +
          '\x3c/span\x3e\x3cspan class\x3d"name"\x3e\u7b2c' +
          d +
          '\u5929\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"shadow"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"cover"\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      r.loadFile(
        b.INTERFACE_PATH + "item/" + g.identifiedResourceName + ".bmp",
        function (b) {
          h.find('.item[data-itid\x3d"' + a.id + '"] .icon').css(
            "backgroundImage",
            "url(" + b + ")",
          );
        },
      );
      c < f
        ? r.loadFile(
            b.INTERFACE_PATH + "check_attendance/bt_slot_off.tga",
            function (a) {
              e.load(a, function (a) {
                a &&
                  ((a = this.toDataURL()),
                  h
                    .find('.item[data-idx\x3d"' + c + '"] .cover')
                    .css("backgroundImage", "url(" + a + ")"));
              });
            },
          )
        : c != f ||
          v ||
          (h.find('.item[data-itid\x3d"' + a.id + '"]').addClass("sd"),
          r.loadFile(
            b.INTERFACE_PATH + "check_attendance/bt_slot_complete.tga",
            function (a) {
              e.load(a, function (a) {
                a &&
                  ((a = this.toDataURL()),
                  h
                    .find('.item[data-idx\x3d"' + c + '"] .cover')
                    .css("backgroundImage", "url(" + a + ")"));
              });
            },
          ));
    };
    n.clean = function () {
      this.ui.hide();
    };
    n.showUI = function () {
      if (n.ui) {
        n.ui.find(".main .borders").empty();
        n.ui.find(".titlebar .startTime").text(c[b.nid].StartDate);
        n.ui.find(".titlebar .endTime").text(c[b.nid].EndDate);
        for (var a = Object.keys(c[b.nid].Reward), d = 0; d < a.length; d++)
          n.addItem(c[b.nid].Reward[a[d]], d);
        n.ui.show();
        n.focus();
      } else p = !0;
    };
    n.setData = function (a) {
      f = Math.round(a / 10);
      v = a % 10;
      n.showUI();
    };
    n.getreward = function (a) {
      var c = n.ui.find(".main .borders");
      r.loadFile(
        b.INTERFACE_PATH + "check_attendance/bt_slot_off.tga",
        function (a) {
          e.load(a, function (a) {
            a &&
              ((a = this.toDataURL()),
              c
                .find(".item.sd .cover")
                .css("backgroundImage", "url(" + a + ")"),
              c.find(".item.sd").removeClass("sd"),
              t.setMsg("\u7b7e\u5230\u6210\u529f"));
          });
        },
      );
    };
    return q.addComponent(n);
  },
);
