define("Network/SocketHelpers/JavaSocket", [
  "require",
  "Utils/jquery",
], function (a, b) {
  function c(c, e) {
    this.connected = !1;
    this.host = c;
    this.port = e;
    this.id = this.constructor.list.push(this) - 1;
    this.applet = b("\x3capplet/\x3e")
      .attr({
        archive: a.toUrl("./Java/JavaSocketBridge.jar"),
        code: "JavaSocketBridge.class",
        width: 0,
        height: 0,
      })
      .html('\x3cparam name\x3d"id" value\x3d"' + this.id + '"/\x3e')
      .appendTo("body")[0];
  }
  c.list = [];
  c.prototype.connect = function () {
    this.applet.connect(this.host, this.port);
  };
  c.prototype.send = function (a) {
    if (this.connected) {
      a = new Uint8Array(a);
      var b,
        c = a.length,
        d = "";
      for (b = 0; b < c; b++)
        d += a[b].toString(16).replace(/^([\da-f])$/, "0$1");
      this.applet.send(d);
    }
  };
  c.prototype.close = function () {
    this.connected &&
      (this.applet.parentNode && document.body.removeChild(this.applet),
      (this.constructor.list[this.id] = null),
      (this.connected = !1));
  };
  c.prototype.__onReady = function () {
    this.connect();
  };
  c.prototype.__onComplete = function (a) {
    this.connected = a;
    if (this.onComplete) this.onComplete(a);
  };
  c.prototype.__onClose = function () {
    this.applet.parentNode && document.body.removeChild(this.applet);
    this.connected = !1;
    this.constructor.list[this.id] = null;
    if (this.onClose) this.onClose();
  };
  c.prototype.__onReceive = function (a) {
    var b,
      c = a.length >> 1,
      d = new Uint8Array(c);
    for (b = 0; b < c; b++)
      d[b] = parseInt(a.substr(2 * b, 2).replace(/[^a-f0-9]/gi, ""), 16);
    if (this.onMessage) this.onMessage(d.buffer);
  };
  window.javasocketbridge_onready = function (a) {
    c.list[a] && c.list[a].__onReady();
  };
  window.javasocketbridge_oncomplete = function (a, b) {
    c.list[a] && c.list[a].__onComplete(!!b);
  };
  window.javasocketbridge_onclose = function (a) {
    c.list[a] && c.list[a].__onClose();
  };
  window.javasocketbridge_onmessage = function (a, b) {
    c.list[a] && c.list[a].__onReceive(String(b));
  };
  return c;
});
