define("Network/SocketHelpers/NodeSocket", [], function () {
  function a(a, c) {
    var d = this;
    this.connected = !1;
    this.socket = window.requireNode("net").connect(c, a);
    this.socket.on("connect", function () {
      d.connected = !0;
      d.onComplete(!0);
    });
    this.socket.on("error", function () {
      if (!d.connected) d.onComplete(!1);
    });
    this.socket.on("data", function (a) {
      d.onMessage(new Uint8Array(a));
    });
    this.socket.on("close", function () {
      d.connected = !1;
      this.destroy();
      if (d.onClose) d.onClose();
    });
  }
  a.isSupported = function () {
    return !!window.requireNode;
  };
  a.prototype.send = function (a) {
    this.connected && this.socket.write(new Buffer(new Uint8Array(a)));
  };
  a.prototype.close = function () {
    this.connected &&
      (this.socket.end(), this.socket.destroy(), (this.connected = !1));
  };
  return a;
});
