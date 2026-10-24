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
      } catch (p) {
        return !1;
      }
      a.stopImmediatePropagation();
      a = b.data;
      t("UI/Components/Inventory/Inventory").removeItem(a.index, 1);
      l.throwItem_ItemMakeSure(a);
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
    var m = a("Core/Client"),
      h = a("Renderer/Renderer"),
      r = a("UI/UIManager"),
      q = a("UI/UIComponent"),
      k = a("text!./ItemMakeSure.html"),
      g = a("text!./ItemMakeSure.css"),
      t = a,
      l = new q("ItemMakeSure", k, g);
    l.list = [];
    l.init = function () {
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
    l.setMakems = function (a) {
      a = e.getItemInfo(a);
      this.ui.find(".title").html(a.identifiedDiSPlayName + " \u5236\u9020");
      l.ui.find(".list").empty();
    };
    l.selectIndex = function () {
      this.onIndexSelected(this.index);
      this.remove();
    };
    l.onAppend = function () {
      l.list = [];
    };
    l.onRemove = function () {
      this.index = 0;
    };
    l.throwItem_ItemMakeSure = function (a) {
      var b = e.getItemInfo(a.ITID),
        c = d("#ItemMakeSure .content .list");
      l.list.push(a);
      c.append(
        '\x3cdiv class\x3d"item" data-index\x3d"' +
          a.index +
          '" data-id\x3d"' +
          a.ITID +
          '" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3cspan class\x3d"count"\x3e1\x3c/span\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      m.loadFile(
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
    l.onIndexSelected = function () {};
    return r.addComponent(l);
  },
);
