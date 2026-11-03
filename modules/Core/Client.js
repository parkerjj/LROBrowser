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
            grfList: l.get("grfList") || "DATA.INI",
            save: !!l.get("saveFiles"),
            quota: a,
          },
          k.onFilesLoaded,
        );
      });
    }
    var c = a("Utils/Executable"),
      d = a("Utils/Texture"),
      e = a("Utils/WebGL"),
      l = a("./Configs"),
      h = a("./Thread"),
      r = a("./MemoryManager"),
      t = a("Network/PacketVerManager"),
      n = a("Vendors/text-encoding"),
      g = (function () {
        function a(a, b, c) {
          r.set(c.filename, a, b);
        }
        var b = { filename: "", args: null };
        return function (c, d, f, m) {
          c = n.decodeString(c);
          r.exist(c) ||
            ((b.filename = c), (b.args = m || null), h.send("GET_FILE", b, a));
          return r.get(c, d, f);
        };
      })(),
      p = (function () {
        function b(b, c, f) {
          var m, q, g, p, n, v;
          if (b && !c)
            switch (f.filename.substr(-3)) {
              case "bmp":
                d.load(b, function () {
                  r.set(f.filename, this.toDataURL(), c);
                });
                return;
              case "str":
                p = a("Renderer/Renderer").getContext();
                q = b.layers;
                m = f.filename.split("/");
                m.pop();
                n = m.join("/");
                for (m = 0; m < b.layernum; ++m)
                  for (
                    q[m].materials = Array(q[m].texcnt), g = 0;
                    g < q[m].texcnt;
                    ++g
                  ) {
                    v = "";
                    if ("data/texture/effect" == n) v = q[m].texname[g];
                    else {
                      v = q[m].texname[g].split("\\");
                      var u = v.pop();
                      v.join("/");
                      v = n + "/" + u;
                    }
                    (function (a, b, c) {
                      k.loadFile(a, function (a) {
                        e.texture(p, a, function (a) {
                          b[c] = a;
                        });
                      });
                    })(v, q[m].materials, g);
                  }
                r.set(f.filename, b, c);
                return;
              case "spr":
                p = a("Renderer/Renderer").getContext();
                n = b.frames;
                q = n.length;
                for (m = 0; m < q; m++)
                  ((n[m].texture = p.createTexture()),
                    (v = n[m].type ? p.LINEAR : p.NEAREST),
                    (g = n[m].type ? p.RGBA : p.LUMINANCE),
                    p.pixelStorei(p.UNPACK_ALIGNMENT, 1),
                    p.bindTexture(p.TEXTURE_2D, n[m].texture),
                    p.texImage2D(
                      p.TEXTURE_2D,
                      0,
                      g,
                      n[m].width,
                      n[m].height,
                      0,
                      g,
                      p.UNSIGNED_BYTE,
                      n[m].data,
                    ),
                    p.texParameteri(p.TEXTURE_2D, p.TEXTURE_MAG_FILTER, v),
                    p.texParameteri(p.TEXTURE_2D, p.TEXTURE_MIN_FILTER, v),
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
                r.set(f.filename, b, c);
                return;
              case "pal":
                p = a("Renderer/Renderer").getContext();
                m = p.createTexture();
                b = new Uint8Array(b);
                p.bindTexture(p.TEXTURE_2D, m);
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
                r.set(f.filename, { palette: b, texture: m }, c);
                return;
            }
          r.set(f.filename, b, c);
        }
        var c = { filename: "", args: null };
        return function (a, d, f, m) {
          a = n.decodeString(a);
          r.exist(a) ||
            ((c.filename = a), (c.args = m || null), h.send("LOAD_FILE", c, b));
          return r.get(a, d, f);
        };
      })(),
      k = {
        init: function (a) {
          function d(a) {
            2e7 < a && (t.value = a);
          }
          var f,
            e,
            g = l.get("remoteClient");
          l.get("ClientVer");
          if ("20211103".match(/^executable$/i))
            for (f = 0, e = a.length; f < e; ++f) {
              if (c.isROExec(a[f])) {
                c.getDate(a[f], d);
                break;
              }
            }
          else t.value = 20211103;
          g && h.send("SET_HOST", g);
          b(a);
        },
        getFile: g,
        getFiles: function (a, b) {
          function c(e) {
            m[f++] = e;
            f === d ? b && b.apply(null, m) : g(a[f], c);
          }
          var d, f, m;
          d = a.length;
          m = Array(d);
          f = 0;
          g(a[f], c);
        },
        loadFile: p,
        loadFiles: function (a, b) {
          function c(e) {
            m[f++] = e;
            f === d ? b && b.apply(null, m) : p(a[f], c);
          }
          var d, f, m;
          d = a.length;
          m = Array(d);
          f = 0;
          p(a[f], c);
        },
        search: function (a, b) {
          h.send("SEARCH_FILE", a, b);
        },
        onFilesLoaded: function () {},
      };
    return k;
  },
);
