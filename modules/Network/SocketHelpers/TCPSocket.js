define("Network/SocketHelpers/TCPSocket", [], function () {
  function a(a, c) {
    var d = this;
    this.socket = (navigator.TCPSocket || navigator.mozTCPSocket).open(a, c, {
      binaryType: "arraybuffer",
    });
    this.connected = !1;
    this.socket.onopen = function () {
      d.connected = !0;
      d.onComplete(!0);
    };
    this.socket.onerror = function () {
      if (!d.connected) d.onComplete(!1);
    };
    this.socket.ondata = function (a) {
      d.onMessage(a.data);
    };
    this.socket.onclose = function () {
      this.close();
      d.connected = !1;
      if (d.onClose) d.onClose();
    };
  }
  a.isSupported = function () {
    return !(!navigator.TCPSocket && !navigator.mozTCPSocket);
  };
  a.prototype.send = function (a) {
    this.connected && this.socket.send(a);
  };
  a.prototype.close = function () {
    this.connected && (this.socket.close(), (this.connected = !1));
  };
  return a;
});
