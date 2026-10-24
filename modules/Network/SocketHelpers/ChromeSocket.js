define("Network/SocketHelpers/ChromeSocket", [], function () {
  function a(a, c) {
    this.connected = !1;
    this.socketID = 0;
    this.host = a;
    this.port = c;
    chrome.socket.create("tcp", {}, this.__onReady.bind(this));
  }
  a.prototype.connect = function () {
    chrome.socket.connect(
      this.socketID,
      this.host,
      parseInt(this.port, 10),
      this.__onComplete.bind(this),
    );
  };
  a.prototype.send = function (a) {
    this.connected &&
      chrome.socket.write(this.socketID, a, this.__onWrite.bind(this));
  };
  a.prototype.close = function () {
    this.connected &&
      (chrome.socket.disconnect(this.socketID),
      chrome.socket.destroy(this.socketID),
      (this.connected = !1),
      (this.socketID = 0));
  };
  a.prototype.__onReady = function (a) {
    this.socketID = a.socketId;
    this.connect();
  };
  a.prototype.__onComplete = function (a) {
    this.connected = 0 <= a;
    if (this.onComplete) this.onComplete(this.connected);
    this.connected && this.__onReceive();
  };
  a.prototype.__onClose = function () {
    this.close();
    if (this.onClose) this.onClose();
  };
  a.prototype.__onWrite = function () {};
  a.prototype.__onReceive = function (a) {
    if (a) {
      if (0 > a.resultCode) {
        this.__onClose();
        return;
      }
      if (this.onMessage) this.onMessage(a.data);
    }
    chrome.socket.read(this.socketID, null, this.__onReceive.bind(this));
  };
  return a;
});
