define("UI/Components/Intro/FileSystem", [], function () {
  function a(e) {
    c && d
      ? c.queryUsageAndQuota(function (c) {
          c
            ? d(window.TEMPORARY, c, function (d) {
                b = d;
                d.root.getDirectory(
                  "/__tmp_upload/",
                  { create: !1 },
                  function (b) {
                    b.removeRecursively(function () {
                      a(e);
                    });
                  },
                  function () {
                    e(c);
                  },
                );
              })
            : e(0);
        })
      : e(0);
  }
  var b,
    c = navigator.temporaryStorage || navigator.webkitTemporaryStorage,
    d = window.requestFileSystem || window.webkitRequestFileSystem;
  return {
    cleanup: function (a) {
      b.root.createReader().readEntries(function (b) {
        function c() {
          ++k >= e && a();
        }
        var d,
          e = b.length,
          k = 0;
        for (d = 0; d < e; ++d)
          b[d].isDirectory ? b[d].removeRecursively(c) : b[d].remove(c);
        e || a();
      });
    },
    getSize: a,
  };
});
