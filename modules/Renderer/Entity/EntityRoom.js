define(
  "Renderer/Entity/EntityRoom",
  "require Utils/gl-matrix Renderer/Renderer Core/Client DB/DBManager UI/Components/EntityRoom/EntityRoom".split(
    " ",
  ),
  function (a) {
    function b(a) {
      this.owner = a;
      this.text = "";
      this.display = !1;
      this.node = null;
      this.type = b.Type.BUY_SHOP;
      this.id = 0;
      this.title = "";
      this.limit = this.count = 0;
    }
    var c = a("Utils/gl-matrix"),
      d = a("Renderer/Renderer"),
      e = a("Core/Client"),
      l = a("DB/DBManager"),
      h = a("UI/Components/EntityRoom/EntityRoom"),
      r = c.vec4,
      t = new Float32Array(4),
      n = new Float32Array(2);
    b.Type = { SELL_SHOP: 0, BUY_SHOP: 1, PUBLIC_CHAT: 2, PRIVATE_CHAT: 3 };
    b.prototype.create = function (a, c, d, f) {
      function g() {
        var g = "chat_open";
        switch (d) {
          case b.Type.PUBLIC_CHAT:
            g = "chat_open";
            break;
          case b.Type.SELL_SHOP:
            g = "buyingshop";
            break;
          case b.Type.BUY_SHOP:
            g = "shop";
            break;
          case b.Type.PRIVATE_CHAT:
            g = "chat_close";
        }
        k.type = d;
        k.id = c;
        k.node.onEnter = f ? k.owner.onRoomEnter.bind(k.owner) : null;
        e.loadFile(l.INTERFACE_PATH + g + ".bmp", function (b) {
          k.display = !0;
          k.node && k.node.setTitle(a, b);
        });
      }
      var k = this;
      this.node
        ? g()
        : ((this.node = h.clone("EntityRoom", !0)), (this.node.init = g));
      this.node.append();
    };
    b.prototype.remove = function () {
      this.display = !1;
      this.node && this.node.remove();
    };
    b.prototype.clean = function () {
      this.remove();
      this.node = null;
    };
    b.prototype.render = function (a) {
      var b = this.node.ui[0];
      t[0] = 0;
      t[1] = 4;
      t[2] = 0;
      t[3] = 1;
      n[0] = d.width / 2;
      n[1] = d.height / 2;
      r.transformMat4(t, t, a);
      a = 0 === t[3] ? 1 : 1 / t[3];
      t[0] = n[0] + n[0] * t[0] * a;
      t[1] = n[1] - n[1] * t[1] * a;
      b.style.top = (t[1] | 0) + "px";
      b.style.left = ((t[0] - 70) | 0) + "px";
    };
    return function () {
      this.room = new b(this);
    };
  },
);
