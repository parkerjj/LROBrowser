define("Utils/WebGL", ["Utils/Texture"], function (a) {
  function b(a, b, c) {
    c = a.createShader(c);
    a.shaderSource(c, b);
    a.compileShader(c);
    if (!a.getShaderParameter(c, a.COMPILE_STATUS))
      throw (
        (b = a.getShaderInfoLog(c)),
        a.deleteShader(c),
        Error("WebGL::CompileShader() - Fail to compile shader : " + b)
      );
    return c;
  }
  function c(a) {
    return Math.pow(2, Math.ceil(Math.log(a) / Math.log(2)));
  }
  return {
    getContext: function (a, b) {
      var c = null,
        d = ["webgl2", "webgl"],
        e,
        q = d.length;
      b ||
        (b = {
          alpha: !1,
          depth: !0,
          stencil: !1,
          antialias: !0,
          premultipliedAlpha: !1,
          preserveDrawingBuffer: !0,
        });
      if (a.getContext && window.WebGLRenderingContext)
        for (e = 0; e < q; ++e)
          try {
            if ((c = a.getContext(d[e], b))) break;
          } catch (k) {}
      if (!c)
        throw Error(
          "WebGL::getContext() - Can't find a valid context, is WebGL supported ?",
        );
      return c;
    },
    createShaderProgram: function (a, c, m) {
      var d, e;
      d = a.createProgram();
      c = b(a, c, a.VERTEX_SHADER);
      m = b(a, m, a.FRAGMENT_SHADER);
      a.attachShader(d, c);
      a.attachShader(d, m);
      a.linkProgram(d);
      if (!a.getProgramParameter(d, a.LINK_STATUS))
        throw (
          (e = a.getProgramInfoLog(d)),
          a.deleteProgram(d),
          a.deleteShader(c),
          a.deleteShader(m),
          Error("WebGL::CreateShaderProgram() - Fail to link shaders : " + e)
        );
      m = a.getProgramParameter(d, a.ACTIVE_ATTRIBUTES);
      d.attribute = {};
      for (c = 0; c < m; c++)
        ((e = a.getActiveAttrib(d, c)),
          (d.attribute[e.name] = a.getAttribLocation(d, e.name)));
      m = a.getProgramParameter(d, a.ACTIVE_UNIFORMS);
      d.uniform = {};
      for (c = 0; c < m; c++)
        ((e = a.getActiveUniform(d, c)),
          (d.uniform[e.name] = a.getUniformLocation(d, e.name)));
      return d;
    },
    toPowerOfTwo: c,
    texture: function (b, e, m) {
      var d = Array.prototype.slice.call(arguments, 3);
      a.load(e, function (a) {
        if (a) {
          var e;
          a = document.createElement("canvas");
          a.width = c(this.width);
          a.height = c(this.height);
          a.getContext("2d").drawImage(this, 0, 0, a.width, a.height);
          e = b.createTexture();
          b.bindTexture(b.TEXTURE_2D, e);
          b.texImage2D(b.TEXTURE_2D, 0, b.RGBA, b.RGBA, b.UNSIGNED_BYTE, a);
          b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MAG_FILTER, b.LINEAR);
          b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MIN_FILTER, b.LINEAR);
          b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_S, b.CLAMP_TO_EDGE);
          b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_T, b.CLAMP_TO_EDGE);
          d.unshift(e);
          m.apply(null, d);
        }
      });
    },
  };
});
