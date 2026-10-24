define("Core/Context", [], function () {
  if (document.title != wybt) return !1;
  var a = window.location.host.split(".");
  if ("game" == a[0] && "lastro" == a[1] && "cn" == a[2]) {
    var b = {};
    b.Is = {
      APP: !!(window.chrome && window.chrome.app && window.chrome.app.window),
      POPUP: !!window.opener,
      FRAME: window.top !== window.self,
    };
    b.isFullScreen = function () {
      return !!(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        (b.Is.APP && window.chrome.app.window.current().isFullscreen())
      );
    };
    b.requestFullScreen = function () {
      if (b.Is.APP) window.chrome.app.window.current().fullscreen();
      else if (!b.isFullScreen()) {
        var a = document.documentElement;
        a.requestFullscreen
          ? a.requestFullscreen()
          : a.mozRequestFullScreen
            ? a.mozRequestFullScreen()
            : a.webkitRequestFullscreen &&
              a.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    };
    b.cancelFullScreen = function () {
      b.Is.APP
        ? window.chrome.app.window.current().restore()
        : document.cancelFullScreen
          ? document.cancelFullScreen()
          : document.mozCancelFullScreen
            ? document.mozCancelFullScreen()
            : document.webkitCancelFullScreen &&
              document.webkitCancelFullScreen();
    };
    b.checkSupport = function () {
      var a, d;
      a = document.createElement("div");
      if (!("draggable" in a || ("ondragstart" in a && "ondrop" in a)))
        throw "\u60a8\u7684Web\u6d4f\u89c8\u5668\u9700\u8981\u66f4\u65b0\uff0c\u5b83\u4e0d\u652f\u6301\u62d6\u653e\u548c\u62d6\u653e\u529f\u80fd\u3002";
      a = document.createElement("canvas");
      if (!a.getContext || !a.getContext("2d"))
        throw "\u60a8\u7684\u7f51\u7edc\u6d4f\u89c8\u5668\u9700\u8981\u66f4\u65b0\uff0c\u5b83\u4e0d\u652f\u6301canvas \u5143\u4ef6\u3002";
      if (!window.WebGLRenderingContext)
        throw "\u60a8\u7684\u7f51\u7edc\u6d4f\u89c8\u5668\u9700\u8981\u66f4\u65b0\uff0c\u5b83\u4e0d\u652f\u63013D\u56fe\u5f62\u3002";
      a = document.createElement("canvas");
      try {
        d = a.getContext("webgl");
      } catch (e) {}
      try {
        d = d || a.getContext("experimental-webgl");
      } catch (e) {}
      if (!d)
        throw "\u60a8\u7684\u7f51\u7edc\u6d4f\u89c8\u5668\u6216\u60a8\u7684\u663e\u5361\u6216\u9a71\u52a8\u7a0b\u5e8f\u9700\u8981\u66f4\u65b0\uff0c\u5b83\u4e0d\u652f\u63013D\u56fe\u5f62";
      if (!window.Worker)
        throw "\u60a8\u7684Web\u6d4f\u89c8\u5668\u9700\u8981\u66f4\u65b0\uff0c\u5b83\u4e0d\u652f\u6301Threads(Web Worker API)\u3002";
      if (!window.File || !window.FileList || !window.FileReader)
        throw "\u60a8\u7684Web\u6d4f\u89c8\u5668\u9700\u8981\u66f4\u65b0\uff0c\u5b83\u4e0d\u652f\u6301File API\u3002";
      if (!window.DataView || !DataView.prototype.getFloat64)
        throw "\u60a8\u7684Web\u6d4f\u89c8\u5668\u9700\u8981\u66f4\u65b0\uff0c\u5b83\u4e0d\u652f\u6301File API\uff08DataView\uff09\u3002";
    };
    return b;
  }
});
