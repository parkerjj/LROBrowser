var _createClass = (function () {
  function a(a, c) {
    for (var b = 0; b < c.length; b++) {
      var e = c[b];
      e.enumerable = e.enumerable || !1;
      e.configurable = !0;
      "value" in e && (e.writable = !0);
      Object.defineProperty(a, e.key, e);
    }
  }
  return function (b, c, d) {
    c && a(b.prototype, c);
    d && a(b, d);
    return b;
  };
})();
function _possibleConstructorReturn(a, b) {
  if (!a)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called",
    );
  return !b || ("object" !== typeof b && "function" !== typeof b) ? a : b;
}
function _inherits(a, b) {
  if ("function" !== typeof b && null !== b)
    throw new TypeError(
      "Super expression must either be null or a function, not " + typeof b,
    );
  a.prototype = Object.create(b && b.prototype, {
    constructor: { value: a, enumerable: !1, writable: !0, configurable: !0 },
  });
  b &&
    (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : (a.__proto__ = b));
}
function _classCallCheck(a, b) {
  if (!(a instanceof b))
    throw new TypeError("Cannot call a class as a function");
}
