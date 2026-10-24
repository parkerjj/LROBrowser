define("UI/Components/ChatBox/History", [], function () {
  function a(a) {
    this.list = [];
    this.uniqueKey = !!a;
  }
  a.prototype.index = 0;
  a.prototype.push = function (a) {
    var b = this.list.length,
      d;
    (b && this.list[b - 1] === a) ||
      (this.uniqueKey &&
        ((d = this.list.indexOf(a)), -1 < d && (this.list.splice(d, 1), b--)),
      50 <= b && this.list.shift(),
      this.list.push(a));
    this.index = this.list.length;
  };
  a.prototype.previous = function () {
    0 < this.index && this.index--;
    return this.list[this.index] || "";
  };
  a.prototype.next = function () {
    this.index < this.list.length && this.index++;
    return this.list[this.index] || "";
  };
  a.prototype.clear = function () {
    this.index = this.list.length = 0;
  };
  return a;
});
