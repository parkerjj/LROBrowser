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
    this.connected = !1;
    this._url = d
      ? d.replace(/\/$/, "") + "/" + a + ":" + c
      : "ws://" + a + ":" + c + "/";
    if (d) {
      a = window.crypto.getRandomValues(new Uint8Array(32));
      c = "";
      for (d = 0; d < a.length; d++) c += ("0" + a[d].toString(16)).slice(-2);
      a = c;
    } else a = null;
    this._token = a;
    this._attempt = 0;
    this._stopped = this._opened = !1;
    this._acknowledged = this._sent = this._received = 0;
    this._pending = [];
    this._retryDeadline = this._pendingBytes = 0;
    this._connect();
    this._onPageHide = this.close.bind(this);
    window.addEventListener("pagehide", this._onPageHide);
  }
  a.prototype._connect = function () {
    function a() {
      return d.ws === c && !d._stopped;
    }
    this._attempt++;
    var c = this._token
      ? new WebSocket(this._url, "wsproxy.resume.v1")
      : new WebSocket(this._url);
    this.ws = c;
    c.binaryType = "arraybuffer";
    var d = this;
    c.onopen = function () {
      a() &&
        (d._token
          ? "wsproxy.resume.v1" === c.protocol
            ? d._control({
                type: 1 === d._attempt ? "open" : "resume",
                token: d._token,
                attempt: d._attempt,
                ack: d._received,
              })
            : d._finish(4001, "Proxy does not support session resume")
          : d._ready());
    };
    c.onmessage = function (b) {
      if (a())
        if (((d._lastMessage = Date.now()), d._token)) d._receive(b.data);
        else if (d.onMessage) d.onMessage(b.data);
    };
    c.onclose = function (b) {
      a() &&
        (d._token && d._opened && 4001 !== b.code && 1e3 !== b.code
          ? d._retry(c)
          : d._finish(b.code, b.reason));
    };
    if (this._token) {
      var e = (this._lastMessage = Date.now());
      this._watchdog = setInterval(function () {
        var b = Date.now();
        if (a())
          if (d._retryDeadline && b >= d._retryDeadline)
            d._finish(1006, "Session resume timed out");
          else if (
            15e3 <= b - d._lastMessage ||
            (!d.connected && b - e >= (d._opened ? 5e3 : 15e3))
          )
            d._opened
              ? d._retry(c)
              : d._finish(1006, "Proxy handshake timed out");
      }, 1e3);
    }
  };
  a.prototype._ready = function () {
    this.connected = !0;
    this._retryDeadline = 0;
    if (!this._opened && ((this._opened = !0), this.onComplete))
      this.onComplete(!0);
  };
  a.prototype._control = function (a) {
    this.ws.readyState === WebSocket.OPEN && this.ws.send(JSON.stringify(a));
  };
  a.prototype._acknowledge = function (a) {
    if (!Number.isInteger(a) || a < this._acknowledged || a > this._sent)
      return !1;
    for (var b = a - this._acknowledged, d = 0; d < b; d++)
      this._pendingBytes -= this._pending[d].byteLength;
    this._pending.splice(0, b);
    this._acknowledged = a;
    return !0;
  };
  a.prototype._receive = function (a) {
    if ("string" === typeof a) {
      var b;
      try {
        b = JSON.parse(a);
      } catch (e) {
        return this._finish(4001, "Invalid proxy message");
      }
      if (b && "ping" === b.type) return this._control({ type: "pong" });
      if (
        b &&
        "ready" === b.type &&
        !this.connected &&
        this._acknowledge(b.ack)
      ) {
        for (a = 0; a < this._pending.length; a++)
          this.ws.send(this._pending[a]);
        this._ready();
        return;
      }
      return b && "ack" === b.type && this.connected && this._acknowledge(b.ack)
        ? void 0
        : this._finish(4001, "Invalid proxy message");
    }
    if (!(this.connected && a instanceof ArrayBuffer) || 4 >= a.byteLength)
      return this._finish(4001, "Invalid proxy packet");
    b = new DataView(a).getUint32(0);
    if (0 === b || b > this._received + 1)
      return this._finish(4001, "Invalid proxy packet sequence");
    var d = b > this._received;
    d && (this._received = b);
    this._control({ type: "ack", ack: this._received });
    if (d && this.onMessage) this.onMessage(a.slice(4));
  };
  a.prototype._retry = function (a) {
    this.connected = !1;
    clearInterval(this._watchdog);
    this.ws = null;
    a.readyState < WebSocket.CLOSING && a.close(4e3);
    this._retryDeadline || (this._retryDeadline = Date.now() + 65e3);
    var b = this;
    this._retryTimer = setTimeout(function () {
      b._stopped ||
        (Date.now() >= b._retryDeadline
          ? b._finish(1006, "Session resume timed out")
          : b._connect());
    }, 1e3);
  };
  a.prototype.send = function (a) {
    if (!this._stopped && this._opened)
      if (this._token) {
        if (
          ((a = ArrayBuffer.isView(a)
            ? new Uint8Array(a.buffer, a.byteOffset, a.byteLength)
            : new Uint8Array(a)),
          a.length)
        ) {
          var b = a.length + 4;
          if (
            1048576 < this._pendingBytes + b ||
            4096 <= this._pending.length ||
            4294967295 === this._sent
          )
            return this._finish(4001, "Client replay buffer exceeded");
          var d = new Uint8Array(b);
          new DataView(d.buffer).setUint32(0, ++this._sent);
          d.set(a, 4);
          this._pending.push(d.buffer);
          this._pendingBytes += b;
          this.connected &&
            this.ws.readyState === WebSocket.OPEN &&
            this.ws.send(d.buffer);
        }
      } else
        this.connected &&
          this.ws.readyState === WebSocket.OPEN &&
          this.ws.send(a);
  };
  a.prototype._finish = function (a, c, d) {
    function b() {
      if (!m._opened && !d && m.onComplete) m.onComplete(!1);
      if (m.onClose) m.onClose(a, c);
    }
    if (!this._stopped) {
      this._stopped = !0;
      this.connected = !1;
      window.removeEventListener("pagehide", this._onPageHide);
      clearInterval(this._watchdog);
      clearTimeout(this._retryTimer);
      this._pending = [];
      this._pendingBytes = 0;
      this.ws && this.ws.readyState < WebSocket.CLOSING && this.ws.close(1e3);
      var m = this;
      d ? setTimeout(b, 0) : b();
    }
  };
  a.prototype.close = function () {
    this._finish(1e3, "", !0);
  };
  return a;
});
