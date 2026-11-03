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
      t = a("./MemoryManager"),
      r = a("Network/PacketVerManager"),
      n = a("Vendors/text-encoding"),
      g = (function () {
        function a(a, b, c) {
          t.set(c.filename, a, b);
        }
        var b = { filename: "", args: null };
        return function (c, d, f, k) {
          c = n.decodeString(c);
          t.exist(c) ||
            ((b.filename = c), (b.args = k || null), h.send("GET_FILE", b, a));
          return t.get(c, d, f);
        };
      })(),
      p = (function () {
        function b(b, c, f) {
          var k, q, g, p, u, n;
          if (b && !c)
            switch (f.filename.substr(-3)) {
              case "bmp":
                d.load(b, function () {
                  t.set(f.filename, this.toDataURL(), c);
                });
                return;
              case "str":
                p = a("Renderer/Renderer").getContext();
                q = b.layers;
                k = f.filename.split("/");
                k.pop();
                u = k.join("/");
                for (k = 0; k < b.layernum; ++k)
                  for (
                    q[k].materials = Array(q[k].texcnt), g = 0;
                    g < q[k].texcnt;
                    ++g
                  ) {
                    n = "";
                    if ("data/texture/effect" == u) n = q[k].texname[g];
                    else {
                      n = q[k].texname[g].split("\\");
                      var v = n.pop();
                      n.join("/");
                      n = u + "/" + v;
                    }
                    (function (a, b, c) {
                      l.loadFile(a, function (a) {
                        e.texture(p, a, function (a) {
                          b[c] = a;
                        });
                      });
                    })(n, q[k].materials, g);
                  }
                t.set(f.filename, b, c);
                return;
              case "spr":
                p = a("Renderer/Renderer").getContext();
                u = b.frames;
                q = u.length;
                for (k = 0; k < q; k++)
                  ((u[k].texture = p.createTexture()),
                    (n = u[k].type ? p.LINEAR : p.NEAREST),
                    (g = u[k].type ? p.RGBA : p.LUMINANCE),
                    p.pixelStorei(p.UNPACK_ALIGNMENT, 1),
                    p.bindTexture(p.TEXTURE_2D, u[k].texture),
                    p.texImage2D(
                      p.TEXTURE_2D,
                      0,
                      g,
                      u[k].width,
                      u[k].height,
                      0,
                      g,
                      p.UNSIGNED_BYTE,
                      u[k].data,
                    ),
                    p.texParameteri(p.TEXTURE_2D, p.TEXTURE_MAG_FILTER, n),
                    p.texParameteri(p.TEXTURE_2D, p.TEXTURE_MIN_FILTER, n),
                    p.texParameteri(
                      p.TEXTURE_2D,
                      p.TEXTURE_WRAP_S,
                      p.CLAMP_TO_EDGE,
                    ),
                    p.texParameteri(
                      p.TEXTURE_2D,
                      p.TEXTURE_WRAP_T,
                      p.CLAMP_TO_EDGE,
                    ));
                0 !== b.rgba_index &&
                  ((b.texture = p.createTexture()),
                  p.bindTexture(p.TEXTURE_2D, b.texture),
                  p.texImage2D(
                    p.TEXTURE_2D,
                    0,
                    p.RGBA,
                    256,
                    1,
                    0,
                    p.RGBA,
                    p.UNSIGNED_BYTE,
                    b.palette,
                  ),
                  p.texParameteri(
                    p.TEXTURE_2D,
                    p.TEXTURE_MAG_FILTER,
                    p.NEAREST,
                  ),
                  p.texParameteri(
                    p.TEXTURE_2D,
                    p.TEXTURE_MIN_FILTER,
                    p.NEAREST,
                  ));
                t.set(f.filename, b, c);
                return;
              case "pal":
                p = a("Renderer/Renderer").getContext();
                k = p.createTexture();
                b = new Uint8Array(b);
                p.bindTexture(p.TEXTURE_2D, k);
                p.texImage2D(
                  p.TEXTURE_2D,
                  0,
                  p.RGBA,
                  256,
                  1,
                  0,
                  p.RGBA,
                  p.UNSIGNED_BYTE,
                  b,
                );
                p.texParameteri(p.TEXTURE_2D, p.TEXTURE_MAG_FILTER, p.NEAREST);
                p.texParameteri(p.TEXTURE_2D, p.TEXTURE_MIN_FILTER, p.NEAREST);
                t.set(f.filename, { palette: b, texture: k }, c);
                return;
            }
          t.set(f.filename, b, c);
        }
        var c = { filename: "", args: null };
        return function (a, d, f, k) {
          a = n.decodeString(a);
          t.exist(a) ||
            ((c.filename = a), (c.args = k || null), h.send("LOAD_FILE", c, b));
          return t.get(a, d, f);
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
            k[f++] = e;
            f === d ? b && b.apply(null, k) : g(a[f], c);
          }
          var d, f, k;
          d = a.length;
          k = Array(d);
          f = 0;
          g(a[f], c);
        },
        loadFile: p,
        loadFiles: function (a, b) {
          function c(e) {
            k[f++] = e;
            f === d ? b && b.apply(null, k) : p(a[f], c);
          }
          var d, f, k;
          d = a.length;
          k = Array(d);
          f = 0;
          p(a[f], c);
        },
        search: function (a, b) {
          h.send("SEARCH_FILE", a, b);
        },
        onFilesLoaded: function () {},
      };
    return l;
  },
);
