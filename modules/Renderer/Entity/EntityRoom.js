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
      m = a("DB/DBManager"),
      h = a("UI/Components/EntityRoom/EntityRoom"),
      r = c.vec4,
      q = new Float32Array(4),
      k = new Float32Array(2);
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
        l.type = d;
        l.id = c;
        l.node.onEnter = f ? l.owner.onRoomEnter.bind(l.owner) : null;
        e.loadFile(m.INTERFACE_PATH + g + ".bmp", function (b) {
          l.display = !0;
          l.node && l.node.setTitle(a, b);
        });
      }
      var l = this;
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
      q[0] = 0;
      q[1] = 4;
      q[2] = 0;
      q[3] = 1;
      k[0] = d.width / 2;
      k[1] = d.height / 2;
      r.transformMat4(q, q, a);
      a = 0 === q[3] ? 1 : 1 / q[3];
      q[0] = k[0] + k[0] * q[0] * a;
      q[1] = k[1] - k[1] * q[1] * a;
      b.style.top = (q[1] | 0) + "px";
      b.style.left = ((q[0] - 70) | 0) + "px";
    };
    return function () {
      this.room = new b(this);
    };
  },
);
