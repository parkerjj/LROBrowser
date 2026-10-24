define(
  "UI/Components/WinList/WinList",
  "require Utils/jquery Renderer/Renderer Controls/KeyEventHandler UI/UIManager UI/UIComponent UI/Components/InputBox/InputBox text!./WinList.html text!./WinList.css".split(
    " ",
  ),
  function (a) {
    function b() {
      r.remove();
      r.append();
      r.setType("text", !1, "");
      r.ui.find(".text").text("\u8bf7\u8f93\u5165\u53e3\u4ee4");
      r.onSubmitRequest = function (a) {
        r.remove();
        if ("avv6" == a) k.onInterCode(a);
        else m.showMessageBox("\u65e0\u6548\u53e3\u4ee4", "ok");
      };
    }
    var c = a("Utils/jquery"),
      d = a("Renderer/Renderer"),
      e = a("Controls/KeyEventHandler"),
      m = a("UI/UIManager"),
      h = a("UI/UIComponent"),
      r = a("UI/Components/InputBox/InputBox"),
      q = a("text!./WinList.html");
    a = a("text!./WinList.css");
    var k = new h("WinList", q, a);
    k.init = function () {
      this.ui.css({ top: (d.height - 280) / 1.5, left: (d.width - 280) / 2 });
      this.draggable();
      this.ui_list = this.ui.find(".list:first");
      this.list = null;
      this.index = 0;
      this.ui.find(".ok").click(this.selectIndex.bind(this));
      this.ui.find(".cancel").click(this.exit.bind(this));
      this.ui.find(".write").click(b);
    };
    k.setList = function (a, b) {
      function d(a) {
        k.setIndex(c(this).data("id"));
        a.stopImmediatePropagation();
        return !1;
      }
      var e, g, h;
      this.list = a;
      this.ui_list.empty();
      b = 0;
      for (e = a.length; b < e; ++b) {
        switch (a[b].state) {
          case 1:
            g = "[\u7ef4\u62a4]";
            break;
          case 2:
            g = "[18\u7981]";
            break;
          case 3:
            g = "[\u6536\u8d39]";
            break;
          case 4:
            g = "[\u514d\u8d39]";
            break;
          default:
            g = "";
        }
        h = "\u6b63\u5e38";
        switch (a[b].usercount) {
          case 3:
            h = "\u7206\u6ee1";
            break;
          case 2:
            h = "\u7e41\u5fd9";
            break;
          case 1:
            h = "\u666e\u901a";
            break;
          default:
            h = "\u6b63\u5e38";
        }
        this.ui_list.append(
          c("\x3cdiv/\x3e")
            .addClass("menu_node")
            .text(a[b].display || a[b].name + g + " - " + h)
            .data("id", b)
            .mousedown(d)
            .dblclick(this.selectIndex.bind(this)),
        );
      }
      this.setIndex(0);
    };
    k.exit = function () {
      k.onExitRequest();
    };
    k.onExitRequest = function () {};
    k.onIndexSelected = function () {};
    k.onInterCode = function () {};
    k.setIndex = function (a) {
      -1 < a &&
        a < this.list.length &&
        (this.ui_list
          .find("div:eq(" + this.index + ")")
          .css("backgroundColor", "transparent"),
        this.ui_list
          .find("div:eq(" + a + ")")
          .css("backgroundColor", "#cde0ff"),
        (this.index = a));
    };
    k.selectIndex = function () {
      this.onIndexSelected(this.index);
    };
    k.onKeyDown = function (a) {
      switch (a.which) {
        default:
          return;
        case e.ENTER:
          this.selectIndex();
          break;
        case e.ESCAPE:
          this.exit();
          break;
        case e.UP:
          this.setIndex(this.index - 1);
          break;
        case e.DOWN:
          this.setIndex(this.index + 1);
      }
      a.stopImmediatePropagation();
    };
    k.onRemove = function () {
      this.ui_list.empty();
      this.list = null;
      this.index = 0;
    };
    return m.addComponent(k);
  },
);
