define("Network/SocketHelpers/WebSocket", [], function () {
  function a(a, c, d) {
    var b = a.split(".");
    if (3 == b.length) {
      if ("port" != b[0] || "lastro" != b[1] || "cn" != b[2]) return;
    } else if (
      ("103" != b[0] && "45" != b[0] && "127" != b[0]) ||
      ("8" != b[1] && "248" != b[1] && "0" != b[1]) ||
      ("222" != b[2] && "10" != b[2] && "0" != b[2]) ||
      ("164" != b[3] && "247" != b[3] && "1" != b[3])
    )
      return;
    var b = "ws://" + a + ":" + c + "/",
      m = this;
    this.connected = !1;
    d && ((b = d), b.match(/\/$/) || (b += "/"), (b += a + ":" + c));
    this.ws = new WebSocket(b);
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = function () {
      m.connected = !0;
      if (m.onComplete) m.onComplete(!0);
    };
    this.ws.onerror = function () {
      if (!m.connected && m.onComplete) m.onComplete(!1);
    };
    this.ws.onmessage = function (a) {
      if (m.onMessage) m.onMessage(a.data);
    };
    this.ws.onclose = function () {
      m.connected = !1;
      if (m.onClose) m.onClose();
    };
  }
  a.prototype.send = function (a) {
    this.connected && this.ws.send(a);
  };
  a.prototype.close = function () {
    this.connected && (this.ws.close(), (this.connected = !1));
  };
  return a;
});
