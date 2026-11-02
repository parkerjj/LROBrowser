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
      q = a("./MemoryManager"),
      r = a("Network/PacketVerManager"),
      k = a("Vendors/text-encoding"),
      g = (function () {
        function a(a, b, c) {
          q.set(c.filename, a, b);
        }
        var b = { filename: "", args: null };
        return function (c, d, f, n) {
          c = k.decodeString(c);
          q.exist(c) ||
            ((b.filename = c), (b.args = n || null), h.send("GET_FILE", b, a));
          return q.get(c, d, f);
        };
      })(),
      u = (function () {
        function b(b, c, f) {
          var n, p, g, t, k, u;
          if (b && !c)
            switch (f.filename.substr(-3)) {
              case "bmp":
                d.load(b, function () {
                  q.set(f.filename, this.toDataURL(), c);
                });
                return;
              case "str":
                t = a("Renderer/Renderer").getContext();
                p = b.layers;
                n = f.filename.split("/");
                n.pop();
                k = n.join("/");
                for (n = 0; n < b.layernum; ++n)
                  for (
                    p[n].materials = Array(p[n].texcnt), g = 0;
                    g < p[n].texcnt;
                    ++g
                  ) {
                    u = "";
                    if ("data/texture/effect" == k) u = p[n].texname[g];
                    else {
                      u = p[n].texname[g].split("\\");
                      var v = u.pop();
                      u.join("/");
                      u = k + "/" + v;
                    }
                    (function (a, b, c) {
                      l.loadFile(a, function (a) {
                        e.texture(t, a, function (a) {
                          b[c] = a;
                        });
                      });
                    })(u, p[n].materials, g);
                  }
                q.set(f.filename, b, c);
                return;
              case "spr":
                t = a("Renderer/Renderer").getContext();
                k = b.frames;
                p = k.length;
                for (n = 0; n < p; n++)
                  ((k[n].texture = t.createTexture()),
                    (u = k[n].type ? t.LINEAR : t.NEAREST),
                    (g = k[n].type ? t.RGBA : t.LUMINANCE),
                    t.pixelStorei(t.UNPACK_ALIGNMENT, 1),
                    t.bindTexture(t.TEXTURE_2D, k[n].texture),
                    t.texImage2D(
                      t.TEXTURE_2D,
                      0,
                      g,
                      k[n].width,
                      k[n].height,
                      0,
                      g,
                      t.UNSIGNED_BYTE,
                      k[n].data,
                    ),
                    t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, u),
                    t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, u),
                    t.texParameteri(
                      t.TEXTURE_2D,
                      t.TEXTURE_WRAP_S,
                      t.CLAMP_TO_EDGE,
                    ),
                    t.texParameteri(
                      t.TEXTURE_2D,
                      t.TEXTURE_WRAP_T,
                      t.CLAMP_TO_EDGE,
                    ));
                0 !== b.rgba_index &&
                  ((b.texture = t.createTexture()),
                  t.bindTexture(t.TEXTURE_2D, b.texture),
                  t.texImage2D(
                    t.TEXTURE_2D,
                    0,
                    t.RGBA,
                    256,
                    1,
                    0,
                    t.RGBA,
                    t.UNSIGNED_BYTE,
                    b.palette,
                  ),
                  t.texParameteri(
                    t.TEXTURE_2D,
                    t.TEXTURE_MAG_FILTER,
                    t.NEAREST,
                  ),
                  t.texParameteri(
                    t.TEXTURE_2D,
                    t.TEXTURE_MIN_FILTER,
                    t.NEAREST,
                  ));
                q.set(f.filename, b, c);
                return;
              case "pal":
                t = a("Renderer/Renderer").getContext();
                n = t.createTexture();
                b = new Uint8Array(b);
                t.bindTexture(t.TEXTURE_2D, n);
                t.texImage2D(
                  t.TEXTURE_2D,
                  0,
                  t.RGBA,
                  256,
                  1,
                  0,
                  t.RGBA,
                  t.UNSIGNED_BYTE,
                  b,
                );
                t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST);
                t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST);
                q.set(f.filename, { palette: b, texture: n }, c);
                return;
            }
          q.set(f.filename, b, c);
        }
        var c = { filename: "", args: null };
        return function (a, d, f, n) {
          a = k.decodeString(a);
          q.exist(a) ||
            ((c.filename = a), (c.args = n || null), h.send("LOAD_FILE", c, b));
          return q.get(a, d, f);
        };
      })(),
      l = {
        init: function (a) {
          function d(a) {
            2e7 < a && (r.value = a);
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
          else r.value = 20211103;
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
        loadFile: u,
        loadFiles: function (a, b) {
          function c(e) {
            n[f++] = e;
            f === d ? b && b.apply(null, n) : u(a[f], c);
          }
          var d, f, n;
          d = a.length;
          n = Array(d);
          f = 0;
          u(a[f], c);
        },
        search: function (a, b) {
          h.send("SEARCH_FILE", a, b);
        },
        onFilesLoaded: function () {},
      };
    return l;
  },
);
