(function () {
  var a = window.location.host.split(".");
  if ("game" != a[0] || "lastro" != a[1] || "cn" != a[2])
    return ((window.location.href = "/"), !1);
})();
