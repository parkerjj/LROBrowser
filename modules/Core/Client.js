define(
  "Core/Client",
  "require Utils/Executable Utils/Texture Utils/WebGL ./Configs ./Thread ./MemoryManager Network/PacketVerManager Vendors/text-encoding".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = document.createElement("div"),
        c = document.createElement("div"),
        d = Date.now(),
        f = [],
        e,
        g;
      if (a.length)
        for (
          b.style.position = "fixed",
            b.style.zIndex = "2147483647",
            b.style.top = "0px",
            b.style.left = "0px",
            b.style.backgroundColor = "rgb(180,0,0)",
            b.style.transition = "width 500ms linear",
            b.style.width = "0px",
            b.style.height = "3px",
            b.onmouseover = function () {
              c.style.display = "block";
            },
            b.onmouseout = function () {
              c.style.display = "none";
            },
            c.textContent = "Saving fullclient... (0.00 %)",
            c.style.position = "absolute",
            c.style.left = "20px",
            c.style.top = "0px",
            c.style.whiteSpace = "nowrap",
            c.style.zIndex = "2147483646",
            c.style.height = "12px",
            c.style.padding = "5px",
            c.style.background =
              "linear-gradient( rgb(180,0,0), rgb(136,0,0) 30%)",
            c.style.color = "white",
            c.style.textShadow = "1px 1px black",
            c.style.borderBottomLeftRadius = "5px",
            c.style.borderBottomRightRadius = "5px",
            c.style.textAlign = "center",
            c.style.width = "160px",
            c.style.display = "none",
            document.body.appendChild(b),
            document.body.appendChild(c),
            h.hook("CLIENT_SAVE_PROGRESS", function (a) {
              var f = Date.now();
              d + 400 < f &&
                ((b.style.width = a.total.perc + "%"),
                (c.textContent =
                  "Saving fullclient... (" + a.total.perc + " %)"),
                (d = f));
            }),
            h.hook("CLIENT_SAVE_COMPLETE", function () {
              b.parentNode && document.body.removeChild(b);
              c.parentNode && document.body.removeChild(c);
            }),
            e = 0,
            g = a.length;
          e < g;
          ++e
        )
          f.push({
            file: a[e],
            path:
              a[e].fullPath ||
              a[e].relativePath ||
              a[e].webkitRelativePath ||
              a[e].name,
          });
      (
        navigator.temporaryStorage ||
        navigator.webkitTemporaryStorage || {
          queryUsageAndQuota: function (a) {
            a(0, 0);
          },
        }
      ).queryUsageAndQuota(function (a, b) {
        a = { used: a, remaining: b };
        h.send(
          "CLIENT_INIT",
          {
            files: f,
            grfList: m.get("grfList") || "DATA.INI",
            save: !!m.get("saveFiles"),
            quota: a,
          },
          l.onFilesLoaded,
        );
      });
    }
    var c = a("Utils/Executable"),
      d = a("Utils/Texture"),
      e = a("Utils/WebGL"),
      m = a("./Configs"),
      h = a("./Thread"),
      r = a("./MemoryManager"),
      q = a("Network/PacketVerManager"),
      k = a("Vendors/text-encoding"),
      g = (function () {
        function a(a, b, c) {
          r.set(c.filename, a, b);
        }
        var b = { filename: "", args: null };
        return function (c, d, f, n) {
          c = k.decodeString(c);
          r.exist(c) ||
            ((b.filename = c), (b.args = n || null), h.send("GET_FILE", b, a));
          return r.get(c, d, f);
        };
      })(),
      t = (function () {
        function b(b, c, f) {
          var n, p, g, k, t, v;
          if (b && !c)
            switch (f.filename.substr(-3)) {
              case "bmp":
                d.load(b, function () {
                  r.set(f.filename, this.toDataURL(), c);
                });
                return;
              case "str":
                k = a("Renderer/Renderer").getContext();
                p = b.layers;
                n = f.filename.split("/");
                n.pop();
                t = n.join("/");
                for (n = 0; n < b.layernum; ++n)
                  for (
                    p[n].materials = Array(p[n].texcnt), g = 0;
                    g < p[n].texcnt;
                    ++g
                  ) {
                    v = "";
                    if ("data/texture/effect" == t) v = p[n].texname[g];
                    else {
                      v = p[n].texname[g].split("\\");
                      var u = v.pop();
                      v.join("/");
                      v = t + "/" + u;
                    }
                    (function (a, b, c) {
                      l.loadFile(a, function (a) {
                        e.texture(k, a, function (a) {
                          b[c] = a;
                        });
                      });
                    })(v, p[n].materials, g);
                  }
                r.set(f.filename, b, c);
                return;
              case "spr":
                k = a("Renderer/Renderer").getContext();
                t = b.frames;
                p = t.length;
                for (n = 0; n < p; n++)
                  ((t[n].texture = k.createTexture()),
                    (v = t[n].type ? k.LINEAR : k.NEAREST),
                    (g = t[n].type ? k.RGBA : k.LUMINANCE),
                    k.pixelStorei(k.UNPACK_ALIGNMENT, 1),
                    k.bindTexture(k.TEXTURE_2D, t[n].texture),
                    k.texImage2D(
                      k.TEXTURE_2D,
                      0,
                      g,
                      t[n].width,
                      t[n].height,
                      0,
                      g,
                      k.UNSIGNED_BYTE,
                      t[n].data,
                    ),
                    k.texParameteri(k.TEXTURE_2D, k.TEXTURE_MAG_FILTER, v),
                    k.texParameteri(k.TEXTURE_2D, k.TEXTURE_MIN_FILTER, v),
                    k.texParameteri(
                      k.TEXTURE_2D,
                      k.TEXTURE_WRAP_S,
                      k.CLAMP_TO_EDGE,
                    ),
                    k.texParameteri(
                      k.TEXTURE_2D,
                      k.TEXTURE_WRAP_T,
                      k.CLAMP_TO_EDGE,
                    ));
                0 !== b.rgba_index &&
                  ((b.texture = k.createTexture()),
                  k.bindTexture(k.TEXTURE_2D, b.texture),
                  k.texImage2D(
                    k.TEXTURE_2D,
                    0,
                    k.RGBA,
                    256,
                    1,
                    0,
                    k.RGBA,
                    k.UNSIGNED_BYTE,
                    b.palette,
                  ),
                  k.texParameteri(
                    k.TEXTURE_2D,
                    k.TEXTURE_MAG_FILTER,
                    k.NEAREST,
                  ),
                  k.texParameteri(
                    k.TEXTURE_2D,
                    k.TEXTURE_MIN_FILTER,
                    k.NEAREST,
                  ));
                r.set(f.filename, b, c);
                return;
              case "pal":
                k = a("Renderer/Renderer").getContext();
                n = k.createTexture();
                b = new Uint8Array(b);
                k.bindTexture(k.TEXTURE_2D, n);
                k.texImage2D(
                  k.TEXTURE_2D,
                  0,
                  k.RGBA,
                  256,
                  1,
                  0,
                  k.RGBA,
                  k.UNSIGNED_BYTE,
                  b,
                );
                k.texParameteri(k.TEXTURE_2D, k.TEXTURE_MAG_FILTER, k.NEAREST);
                k.texParameteri(k.TEXTURE_2D, k.TEXTURE_MIN_FILTER, k.NEAREST);
                r.set(f.filename, { palette: b, texture: n }, c);
                return;
            }
          r.set(f.filename, b, c);
        }
        var c = { filename: "", args: null };
        return function (a, d, f, n) {
          a = k.decodeString(a);
          r.exist(a) ||
            ((c.filename = a), (c.args = n || null), h.send("LOAD_FILE", c, b));
          return r.get(a, d, f);
        };
      })(),
      l = {
        init: function (a) {
          function d(a) {
            2e7 < a && (q.value = a);
          }
          var f,
            e,
            g = m.get("remoteClient");
          m.get("ClientVer");
          if ("20211103".match(/^executable$/i))
            for (f = 0, e = a.length; f < e; ++f) {
              if (c.isROExec(a[f])) {
                c.getDate(a[f], d);
                break;
              }
            }
          else q.value = 20211103;
          g && h.send("SET_HOST", g);
          b(a);
        },
        getFile: g,
        getFiles: function (a, b) {
          function c(e) {
            n[f++] = e;
            f === d ? b && b.apply(null, n) : g(a[f], c);
          }
          var d, f, n;
          d = a.length;
          n = Array(d);
          f = 0;
          g(a[f], c);
        },
        loadFile: t,
        loadFiles: function (a, b) {
          function c(e) {
            n[f++] = e;
            f === d ? b && b.apply(null, n) : t(a[f], c);
          }
          var d, f, n;
          d = a.length;
          n = Array(d);
          f = 0;
          t(a[f], c);
        },
        search: function (a, b) {
          h.send("SEARCH_FILE", a, b);
        },
        onFilesLoaded: function () {},
      };
    return l;
  },
);
