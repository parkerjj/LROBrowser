define("Core/MemoryItem", [], function () {
  function a(a, c) {
    this._onload = [];
    this._onerror = [];
    a && this.addEventListener("load", a);
    c && this.addEventListener("error", c);
  }
  a.prototype._data = null;
  a.prototype._error = "";
  a.prototype.complete = !1;
  a.prototype.lastTimeUsed = 0;
  Object.defineProperty(a.prototype, "data", {
    get: function () {
      this.lastTimeUsed = Date.now();
      return this._data;
    },
  });
  a.prototype.addEventListener = function (a, c) {
    if (!(c instanceof Function))
      throw Error(
        "MemoryItem::addEventListener() - callback must be a function !",
      );
    switch (a.toLowerCase()) {
      case "load":
        if (this.complete) {
          this._data && c(this._data);
          break;
        }
        this._onload.push(c);
        break;
      case "error":
        if (this.complete) {
          this._error && c(this._error);
          break;
        }
        this._onerror.push(c);
        break;
      default:
        throw Error(
          'MemoryItem::addEventListener() - Invalid event "' + a + '" used.',
        );
    }
  };
  a.prototype.onload = function (a) {
    var b, d;
    this._data = a;
    this.complete = !0;
    this.lastTimeUsed = Date.now();
    b = 0;
    for (d = this._onload.length; b < d; ++b) this._onload[b](a);
    this._onload.length = 0;
    this._onerror.length = 0;
  };
  a.prototype.onerror = function (a) {
    var b, d;
    this._error = a;
    this.complete = !0;
    this.lastTimeUsed = Date.now();
    b = 0;
    for (d = this._onerror.length; b < d; ++b) this._onerror[b](a);
    this._onload.length = 0;
    this._onerror.length = 0;
  };
  return a;
});
