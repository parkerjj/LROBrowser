require.onError = function (a) {
  require.defined("UI/Components/Error/Error")
    ? require("UI/Components/Error/Error").addTrace(a)
    : require(["UI/Components/Error/Error"], function (b) {
        b.addTrace(a);
      });
};
require({
  urlArgs: ROConfig.version,
  baseUrl: "../ro/src/",
  paths: { text: "Vendors/text.require", jquery: "Vendors/jquery-1.9.1" },
}, ["Engine/GameEngine", "Core/Context"], function (a, b) {
  if (document.title != wybt) return !1;
  var c = window.location.host.split(".");
  "game" == c[0] &&
    "lastro" == c[1] &&
    "cn" == c[2] &&
    (a.init(),
    b.Is.APP ||
      (window.onbeforeunload = function () {
        return "Are you sure to exit roBrowser ?";
      }));
});
