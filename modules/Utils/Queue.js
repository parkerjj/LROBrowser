define("Utils/Queue", [], function () {
  function a() {
    this.list = [];
  }
  a.prototype.add = function (a) {
    this.list.push(a);
  };
  a.prototype._next = function () {
    this.list.length && this.list.shift().call(this);
  };
  Object.defineProperty(a.prototype, "next", {
    get: function () {
      return this._next.bind(this);
    },
  });
  a.prototype.run = function () {
    this.next();
  };
  return a;
});
