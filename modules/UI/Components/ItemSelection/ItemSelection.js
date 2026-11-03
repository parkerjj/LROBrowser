define(
  "UI/Components/ItemSelection/ItemSelection",
  "require Utils/jquery DB/DBManager DB/Items/Makablelist DB/Items/Makablelist_dg Controls/KeyEventHandler Core/Client Renderer/Renderer UI/UIManager UI/UIComponent UI/Components/Inventory/Inventory UI/Components/SkillList/SkillList text!./ItemSelection.html text!./ItemSelection.css".split(
    " ",
  ),
  function (a) {
    function b(a, b, d) {
      p.list.append(
        '\x3cdiv class\x3d"item" data-index\x3d"' +
          b +
          '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cspan class\x3d"name"\x3e' +
          c.escape(d) +
          "\x3c/span\x3e\x3c/div\x3e",
      );
      l.loadFile(a, function (a) {
        p.list
          .find("div[data-index\x3d" + b + "] .icon")
          .css("backgroundImage", "url(" + a + ")");
      });
    }
    var c = a("Utils/jquery"),
      d = a("DB/DBManager");
    a("DB/Items/Makablelist");
    a("DB/Items/Makablelist_dg");
    var e = a("Controls/KeyEventHandler"),
      l = a("Core/Client"),
      h = a("Renderer/Renderer"),
      r = a("UI/UIManager"),
      t = a("UI/UIComponent"),
      n = a("UI/Components/Inventory/Inventory");
    a("UI/Components/SkillList/SkillList");
    var g = a("text!./ItemSelection.html");
    a = a("text!./ItemSelection.css");
    var p = new t("ItemSelection", g, a);
    p.init = function () {
      this.ui.css({ top: (h.height - 200) / 2, left: (h.width - 200) / 2 });
      this.list = this.ui.find(".list:first");
      this.index = 0;
      this.draggable(this.ui.find(".head"));
      this.ui.find(".ok").click(this.selectIndex.bind(this));
      this.ui.find(".cancel").click(
        function () {
          this.index = -1;
          this.selectIndex();
        }.bind(this),
      );
      this.ui
        .on("dblclick", ".item", this.selectIndex.bind(this))
        .on("mousedown", ".item", function () {
          p.setIndex(Math.floor(this.getAttribute("data-index")));
        });
    };
    p.setList = function (a, c) {
      var e, f, g, h, k;
      p.list.empty();
      e = 0;
      for (f = a.length; e < f; ++e)
        if (0 < a[e]) {
          if (c) {
            if ((g = d.getSkillInfo(a[e]))) ((k = g.Name), (h = g.SkillName));
          } else if ((g = n.getItemByIndex(a[e])))
            ((h = d.getItemInfo(g.ITID)),
              (k = g.IsIdentified
                ? h.identifiedResourceName
                : h.unidentifiedResourceName),
              (h = g.IsIdentified
                ? h.identifiedDiSPlayName +
                  (0 < h.slotCount ? "[" + h.slotCount + "]" : "")
                : h.unidentifiedDiSPlayName));
          b(d.INTERFACE_PATH + "item/" + k + ".bmp", a[e], h);
        }
      this.setIndex(a[0]);
    };
    p.setList_ = function (a) {
      var c, e, g, h;
      p.list.empty();
      c = 0;
      for (e = a.length; c < e; ++c)
        ((g = d.getItemInfo(a[c].ITID)),
          (h = g.identifiedResourceName),
          (g =
            g.identifiedDiSPlayName +
            (0 < g.slotCount ? "[" + g.slotCount + "]" : "")),
          b(d.INTERFACE_PATH + "item/" + h + ".bmp", a[c].ITID, g));
      this.setIndex(a[0].ITID);
    };
    p.setList_p = function (a) {
      var c, e, g, h;
      p.list.empty();
      c = 0;
      for (e = a.length; c < e; ++c)
        ((g = d.getItemInfo(a[c].ITID)),
          (h = g.identifiedResourceName),
          (g = g.identifiedDiSPlayName),
          b(d.INTERFACE_PATH + "item/" + h + ".bmp", a[c].index, g));
      this.setIndex(a[0].index);
    };
    p.setMakeList = function (a) {
      var c, e, g, h;
      p.list.empty();
      c = 0;
      for (e = a.length; c < e; ++c)
        ((g = d.getItemInfo(a[c].ITID)),
          (h = g.identifiedResourceName),
          (g = g.identifiedDiSPlayName),
          b(d.INTERFACE_PATH + "item/" + h + ".bmp", a[c].ITID, g));
      this.setIndex(a[0].ITID);
    };
    p.setMakeList2 = function (a) {
      var c, e, g, h;
      p.list.empty();
      c = 0;
      for (e = a.length; c < e; ++c)
        ((g = d.getItemInfo(a[c])),
          (h = g.identifiedResourceName),
          (g = g.identifiedDiSPlayName),
          b(d.INTERFACE_PATH + "item/" + h + ".bmp", a[c], g));
      this.setIndex(a[0]);
    };
    p.setSpiritList = function (a) {
      var c,
        e,
        g,
        h,
        k = [];
      p.list.empty();
      switch (a) {
        case 1:
          k = [994, 995, 996, 997];
          break;
        case 2:
          k = [990, 991, 992, 993];
      }
      a = 0;
      for (c = k.length; a < c; ++a)
        if ((e = n.getItemById(k[a])))
          ((g = d.getItemInfo(e.ITID)),
            (h = e.IsIdentified
              ? g.identifiedResourceName
              : g.unidentifiedResourceName),
            (e = e.IsIdentified ? d.getItemName(e) : g.unidentifiedDiSPlayName),
            b(d.INTERFACE_PATH + "item/" + h + ".bmp", k[a], e));
      this.setIndex(k[0]);
    };
    p.setListPushCart = function () {
      this.list.empty();
      this.list.append(
        '\x3cdiv class\x3d"item cart" data-index\x3d"1"\x3e\x3cspan class\x3d"name"\x3e\u94c1\u8d28\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"item cart" data-index\x3d"2"\x3e\x3cspan class\x3d"name"\x3e\u6728\u8d28\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"item cart" data-index\x3d"3"\x3e\x3cspan class\x3d"name"\x3e\u5de1\u6e38\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"item cart" data-index\x3d"4"\x3e\x3cspan class\x3d"name"\x3e\u7279\u5356\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"item cart" data-index\x3d"5"\x3e\x3cspan class\x3d"name"\x3e\u8c6a\u534e\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"item cart" data-index\x3d"6"\x3e\x3cspan class\x3d"name"\x3e\u96e8\u4f1e\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"item cart" data-index\x3d"7"\x3e\x3cspan class\x3d"name"\x3e\u5192\u9669\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"item cart" data-index\x3d"8"\x3e\x3cspan class\x3d"name"\x3e\u52c7\u8005\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"item cart" data-index\x3d"9"\x3e\x3cspan class\x3d"name"\x3e\u534e\u4e3d\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e',
      );
      this.setIndex(1);
    };
    p.setListPushCart2 = function () {
      this.list.empty();
      this.list.append(
        '\x3cdiv class\x3d"item cart" data-index\x3d"1"\x3e\x3cspan class\x3d"name"\x3e\u793c\u7269\u76d2\u5b50\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"item cart" data-index\x3d"2"\x3e\x3cspan class\x3d"name"\x3e\u8ff7\u4f60\u6ce2\u5229\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d"item cart" data-index\x3d"3"\x3e\x3cspan class\x3d"name"\x3e\u5929\u4f7f\u6ce2\u5229\u624b\u63a8\u8f66\x3c/span\x3e\x3c/div\x3e',
      );
      this.setIndex(1);
    };
    p.setIndex = function (a) {
      this.list
        .find("div[data-index\x3d" + this.index + "]")
        .css("backgroundColor", "transparent");
      this.list
        .find("div[data-index\x3d" + a + "]")
        .css("backgroundColor", "#cde0ff");
      this.index = a;
    };
    p.selectIndex = function () {
      this.onIndexSelected(this.index);
      this.remove();
    };
    p.onRemove = function () {
      this.index = 0;
    };
    p.setTitle = function (a) {
      this.ui.find(".head .text").text(a);
    };
    p.onKeyDown = function (a) {
      switch (a.which) {
        case e.ENTER:
          this.selectIndex();
      }
      a.stopImmediatePropagation();
      return !1;
    };
    p.onIndexSelected = function () {};
    return r.addComponent(p);
  },
);
