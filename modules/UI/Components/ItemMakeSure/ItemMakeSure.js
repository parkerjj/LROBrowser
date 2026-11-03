define(
  "UI/Components/ItemMakeSure/ItemMakeSure",
  "require Utils/jquery DB/DBManager DB/Items/Makablelist DB/Items/Makablelist_dg Core/Client Renderer/Renderer UI/UIManager UI/UIComponent text!./ItemMakeSure.html text!./ItemMakeSure.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b;
      try {
        b = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (q) {
        return !1;
      }
      a.stopImmediatePropagation();
      a = b.data;
      p("UI/Components/Inventory/Inventory").removeItem(a.index, 1);
      k.throwItem_ItemMakeSure(a);
      return !1;
    }
    function c(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    var d = a("Utils/jquery"),
      e = a("DB/DBManager");
    a("DB/Items/Makablelist");
    a("DB/Items/Makablelist_dg");
    var l = a("Core/Client"),
      h = a("Renderer/Renderer"),
      r = a("UI/UIManager"),
      t = a("UI/UIComponent"),
      n = a("text!./ItemMakeSure.html"),
      g = a("text!./ItemMakeSure.css"),
      p = a,
      k = new t("ItemMakeSure", n, g);
    k.list = [];
    k.init = function () {
      this.ui.css({
        top: d("#Inventory").offset().top + d("#Inventory").height() + 5,
        left: (h.width - 140) / 2,
      });
      this.ui.on("drop", b).on("dragover", c);
      this.draggable(this.ui.find(".head"));
      this.ui.find(".ok").on("click", this.selectIndex.bind(this));
      this.ui.find(".cancel").on(
        "click",
        function () {
          this.index = -1;
          this.selectIndex();
        }.bind(this),
      );
    };
    k.setMakems = function (a) {
      a = e.getItemInfo(a);
      this.ui.find(".title").html(a.identifiedDiSPlayName + " \u5236\u9020");
      k.ui.find(".list").empty();
    };
    k.selectIndex = function () {
      this.onIndexSelected(this.index);
      this.remove();
    };
    k.onAppend = function () {
      k.list = [];
    };
    k.onRemove = function () {
      this.index = 0;
    };
    k.throwItem_ItemMakeSure = function (a) {
      var b = e.getItemInfo(a.ITID),
        c = d("#ItemMakeSure .content .list");
      k.list.push(a);
      c.append(
        '\x3cdiv class\x3d"item" data-index\x3d"' +
          a.index +
          '" data-id\x3d"' +
          a.ITID +
          '" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3cspan class\x3d"count"\x3e1\x3c/span\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      l.loadFile(
        e.INTERFACE_PATH +
          "item/" +
          (a.IsIdentified
            ? b.identifiedResourceName
            : b.unidentifiedResourceName) +
          ".bmp",
        function (b) {
          c.find('.item[data-index\x3d"' + a.index + '"] .icon').css(
            "backgroundImage",
            "url(" + b + ")",
          );
        },
      );
    };
    k.onIndexSelected = function () {};
    return r.addComponent(k);
  },
);
