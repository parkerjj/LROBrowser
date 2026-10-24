define("Renderer/SpriteRenderer", [
  "Utils/WebGL",
  "Utils/gl-matrix",
  "./Camera",
], function (a, b, c) {
  function d(a) {
    if (this.image.texture && this.color[3]) {
      var b = h.uniform,
        c = k,
        d = null !== this.image.palette;
      a
        ? c.blendFunc(c.SRC_ALPHA, c.ONE)
        : !1 === a && c.blendFunc(c.SRC_ALPHA, c.ONE_MINUS_SRC_ALPHA);
      this.shadow !== l && c.uniform1f(b.uShadow, (l = this.shadow));
      c.uniform3fv(b.uSpriteRendererPosition, this.position);
      d &&
        (c.activeTexture(c.TEXTURE1),
        c.bindTexture(c.TEXTURE_2D, this.image.palette),
        c.uniform2fv(b.uTextSize, this.image.size),
        c.activeTexture(c.TEXTURE0));
      A !== d && c.uniform1i(b.uUsePal, (A = d));
      this.depth !== n && c.uniform1f(b.uSpriteRendererDepth, (n = this.depth));
      c.uniform1f(b.uSpriteRendererZindex, this.zIndex++);
      this.angle !== f &&
        ((f = this.angle),
        e.identity(B),
        f && e.rotateZ(B, B, (-f / 180) * Math.PI),
        c.uniformMatrix4fv(b.uSpriteRendererAngle, !1, B));
      a = 0;
      1 == m.blendMode
        ? (c.depthMask(!1), c.blendFunc(c.SRC_ALPHA, c.DST_ALPHA))
        : 2 == m.blendMode
          ? ((a = Date.now()),
            (a = Math.sin((a / 4 / 180) * Math.PI)),
            (a /= 30),
            c.depthMask(!1),
            c.blendFunc(c.SRC_ALPHA, c.DST_ALPHA))
          : 3 == m.blendMode &&
            (c.depthMask(!1), c.blendFunc(c.SRC_ALPHA, c.ONE));
      C[0] = (this.offset[0] / 175) * this.xSize;
      C[1] = (this.offset[1] / 175) * this.ySize - 0.5;
      O[0] = (this.size[0] / 175) * this.xSize + a;
      O[1] = (this.size[1] / 175) * this.ySize + a;
      c.uniform4fv(b.uSpriteRendererColor, this.color);
      c.uniform2fv(b.uSpriteRendererSize, O);
      c.uniform2fv(b.uSpriteRendererOffset, C);
      if (g !== t || u !== this.image.texture)
        ((t = g), c.bindTexture(c.TEXTURE_2D, (u = this.image.texture)));
      c.drawArrays(c.TRIANGLE_STRIP, 0, 4);
      m.blendMode && c.depthMask(!0);
      c.blendFunc(c.SRC_ALPHA, c.ONE_MINUS_SRC_ALPHA);
    }
  }
  var e = b.mat4,
    m = { render: null, shadow: 1, angle: 0, depth: 0 };
  m.position = new Float32Array(3);
  m.color = new Float32Array(4);
  m.size = new Float32Array(2);
  m.offset = new Float32Array(2);
  m.image = { texture: null, palette: null, size: new Float32Array(2) };
  m.sprite = null;
  m.palette = null;
  m.groupId = 0;
  m.xSize = 5;
  m.ySize = 5;
  var h = null,
    r = null,
    q = null,
    k = null,
    g = 0,
    t = 0,
    l = null,
    f = null,
    n = null,
    p = !0,
    v = !0,
    u = null,
    A = null,
    D = new Int16Array(2),
    B = new Float32Array(16),
    O = new Float32Array(2),
    C = new Float32Array(2);
  m.init = function (b) {
    r ||
      ((r = b.createBuffer()),
      b.bindBuffer(b.ARRAY_BUFFER, r),
      b.bufferData(
        b.ARRAY_BUFFER,
        new Float32Array([
          -0.5, 0.5, 0, 0, 0.5, 0.5, 1, 0, -0.5, -0.5, 0, 1, 0.5, -0.5, 1, 1,
        ]),
        b.STATIC_DRAW,
      ));
    h ||
      (h = a.createShaderProgram(
        b,
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\t\n\t\tattribute vec2 aPosition;\n\t\tattribute vec2 aTextureCoord;\n\t\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uViewModelMat;\n\t\tuniform mat4 uProjectionMat;\n\n\t\tuniform float uCameraZoom;\n\t\tuniform float uCameraLatitude;\n\n\t\tuniform vec2 uSpriteRendererSize;\n\t\tuniform vec2 uSpriteRendererOffset;\n\t\tuniform mat4 uSpriteRendererAngle;\n\t\tuniform vec3 uSpriteRendererPosition;\n\t\tuniform float uSpriteRendererDepth;\n\t\tuniform float uSpriteRendererZindex;\n\n\t\tmat4 Project( mat4 mat, vec3 pos) {\n\n\t\t\t// xyz \x3d x(-z)y + middle of cell (0.5)\n\t\t\tfloat x \x3d  pos.x + 0.5;\n\t\t\tfloat y \x3d -pos.z;\n\t\t\tfloat z \x3d  pos.y + 0.5;\n\n\t\t\t// Matrix translation\n\t\t\tmat[3].x +\x3d mat[0].x * x + mat[1].x * y + mat[2].x * z;\n\t\t\tmat[3].y +\x3d mat[0].y * x + mat[1].y * y + mat[2].y * z;\n\t\t\tmat[3].z +\x3d (mat[0].z * x + mat[1].z * y + mat[2].z * z) + (uCameraLatitude / 50.0);\n\t\t\tmat[3].w +\x3d mat[0].w * x + mat[1].w * y + mat[2].w * z;\n\n\t\t\t// Spherical billboard\n\t\t\tmat[0].xyz \x3d vec3( 1.0, 0.0, 0.0 );\n\t\t\tmat[1].xyz \x3d vec3( 0.0, 1.0 + 0.5/uCameraLatitude, uCameraLatitude/50.0 );\n\t\t\tmat[2].xyz \x3d vec3( 0.0, 0.0, 1.0 );\n\n\t\t\treturn mat;\n\t\t}\n\n\t\tvoid main(void) {\n\t\t\t\n\t\t\t// Calculate position base on angle and sprite offset/size\n\t\t\tvec4 position \x3d uSpriteRendererAngle * vec4( aPosition.x * uSpriteRendererSize.x, aPosition.y * uSpriteRendererSize.y, 0.0, 1.0 );\n\t\t\tposition.x   +\x3d uSpriteRendererOffset.x;\n\t\t\tposition.y   -\x3d uSpriteRendererOffset.y + 0.5;\n\t\t\t\n\t\t\t// Project to camera plane\n\t\t\tgl_Position   \x3d uProjectionMat * Project(uModelViewMat, uSpriteRendererPosition) * position;\n\t\t\tgl_Position.z -\x3d (uSpriteRendererZindex * 2.50 + uSpriteRendererDepth) / max(uCameraZoom, 1.0);\n\t\t\t\n\t\t\tvTextureCoord \x3d aTextureCoord;\n\t\t}\n\t",
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform sampler2D uDiffuse;\n\t\tuniform sampler2D uPalette;\n\n\t\tuniform bool uUsePal;\n\t\tuniform vec4 uSpriteRendererColor;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\t\tuniform bool  lightmap;\n\n\t\tuniform float uShadow;\n\t\tuniform vec2 uTextSize;\n\n\t\t// With palette we don't have a good result because of the gl.NEAREST, so smooth it.\n\t\tvec4 bilinearSample(vec2 uv, sampler2D indexT, sampler2D LUT) {\n\t\t\tvec2 TextInterval \x3d 1.0 / uTextSize;\n\n\t\t\tfloat tlLUT \x3d texture2D(indexT, uv ).x;\n\t\t\tfloat trLUT \x3d texture2D(indexT, uv + vec2(TextInterval.x, 0.0)).x;\n\t\t\tfloat blLUT \x3d texture2D(indexT, uv + vec2(0.0, TextInterval.y)).x;\n\t\t\tfloat brLUT \x3d texture2D(indexT, uv + TextInterval).x;\n\n\t\t\tvec4 transparent \x3d vec4( 0.5, 0.5, 0.5, 0.0);\n\n\t\t\tvec4 tl \x3d tlLUT \x3d\x3d 0.0 ? transparent : vec4( texture2D(LUT, vec2(tlLUT,1.0)).rgb, 1.0);\n\t\t\tvec4 tr \x3d trLUT \x3d\x3d 0.0 ? transparent : vec4( texture2D(LUT, vec2(trLUT,1.0)).rgb, 1.0);\n\t\t\tvec4 bl \x3d blLUT \x3d\x3d 0.0 ? transparent : vec4( texture2D(LUT, vec2(blLUT,1.0)).rgb, 1.0);\n\t\t\tvec4 br \x3d brLUT \x3d\x3d 0.0 ? transparent : vec4( texture2D(LUT, vec2(brLUT,1.0)).rgb, 1.0);\n\n\t\t\tvec2 f  \x3d fract( uv.xy * uTextSize );\n\t\t\tvec4 tA \x3d mix( tl, tr, f.x );\n\t\t\tvec4 tB \x3d mix( bl, br, f.x );\n\n\t\t\treturn mix( tA, tB, f.y );\n\t\t}\n\n\n\t\tvoid main(void) {\n\n\t\t\t// Don't render if it's not shown.\n\t\t\tif (uSpriteRendererColor.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\n\t\t\t// Calculate texture\n\t\t\tvec4 texture;\n\t\t\tif (uUsePal) {\n\t\t\t\ttexture \x3d bilinearSample( vTextureCoord, uDiffuse, uPalette );\n\t\t\t}\n\t\t\telse {\n\t\t\t\ttexture \x3d texture2D( uDiffuse, vTextureCoord.st );\n\t\t\t}\n\n\t\t\t// No alpha, skip.\n\t\t\tif ( texture.a \x3d\x3d 0.0 )\n\t\t\t\tdiscard;\n\n\t\t\t// Apply shadow, apply color\n\t\t\tif(lightmap){\n\t\t\t\ttexture.rgb   *\x3d uShadow;\n\t\t\t}\n\t\t\t\n\t\t\tgl_FragColor   \x3d texture * uSpriteRendererColor;\n\n\t\t\t// Similar to Official RO, only applied when not transparent [Waken]\n\t\t\tif (uSpriteRendererColor.a \x3e\x3d 0.8) {\n\t\t\t\tfloat edgeFactor \x3d smoothstep(0.20, 0.90, gl_FragColor.a);\n\t\t\t\tgl_FragColor.rgb *\x3d edgeFactor;\n\t\t\t}\n\n\t\t\t// Fog feature\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
      ));
  };
  m.bind3DContext = function (a, b, f, l, n) {
    var p = h.attribute,
      t = h.uniform;
    a.useProgram(h);
    a.uniformMatrix4fv(t.uProjectionMat, !1, f);
    a.uniformMatrix4fv(t.uModelViewMat, !1, b);
    a.uniformMatrix4fv(t.uViewModelMat, !1, e.invert(B, b));
    a.uniform1i(t.uFogUse, l.use && l.exist);
    a.uniform1f(t.uFogNear, l.near);
    a.uniform1f(t.uFogFar, l.far);
    a.uniform3fv(t.uFogColor, l.color);
    a.uniform1i(t.lightmap, n);
    a.uniform1i(t.uDiffuse, 0);
    a.uniform1i(t.uPalette, 1);
    a.uniform1f(t.uCameraZoom, c.zoom);
    a.uniform1f(t.uCameraLatitude, c.getLatitude());
    a.enableVertexAttribArray(p.aPosition);
    a.enableVertexAttribArray(p.aTextureCoord);
    a.bindBuffer(a.ARRAY_BUFFER, r);
    a.vertexAttribPointer(p.aPosition, 2, a.FLOAT, !1, 16, 0);
    a.vertexAttribPointer(p.aTextureCoord, 2, a.FLOAT, !1, 16, 8);
    this.render = d;
    this.ySize = this.xSize = 5;
    k = a;
    g++;
  };
  m.unbind = function (a) {
    var b = h.attribute;
    a.disableVertexAttribArray(b.aPosition);
    a.disableVertexAttribArray(b.aTextureCoord);
  };
  m.bind2DContext = function (a, b, c, d) {
    q = a;
    D[0] = b;
    D[1] = c;
    this.center = d ? !0 : !1;
    this.render = y;
    this.ySize = this.xSize = 5;
    this.sharedCanvas ||
      ((this.sharedCanvas = document.createElement("canvas")),
      (this.sharedCanvas.width = 1),
      (this.sharedCanvas.height = 1),
      (this.sharedCtx = this.sharedCanvas.getContext("2d", {
        willReadFrequently: !0,
      })),
      (this.sharedImageData = null));
  };
  m.runWithDepth = function (a, b, c, d) {
    if (k) {
      var f = v,
        e = p,
        g = this.disableDepthCorrection;
      v !== a && ((v = a) ? k.enable(k.DEPTH_TEST) : k.disable(k.DEPTH_TEST));
      p !== b && ((p = b), k.depthMask(b));
      this.disableDepthCorrection !== c && (this.disableDepthCorrection = c);
      d();
      v !== f && ((v = f) ? k.enable(k.DEPTH_TEST) : k.disable(k.DEPTH_TEST));
      p !== e && ((p = e), k.depthMask(e));
      this.disableDepthCorrection !== g && (this.disableDepthCorrection = g);
    } else d();
  };
  var y = (function () {
    return function () {
      if (!(0 >= this.sprite.width || 0 >= this.sprite.height)) {
        var a, b, c, d, f, e, g, l, n, k, p, h, t, m, u;
        b = a = 1;
        this.center
          ? ((g = D[0] + this.offset[0]), (l = D[1]))
          : ((g = D[0] + this.offset[0]), (l = D[1] + this.offset[1] - 17.5));
        h = this.palette;
        c = this.sprite;
        n = c.width;
        k = c.height;
        O.set(this.size);
        0 > O[0] && ((a *= -1), (O[0] *= -1));
        0 > O[1] && ((b *= -1), (O[1] *= -1));
        var v = this.sharedCanvas,
          r = this.sharedCtx;
        if (n > v.width || k > v.height)
          if (
            ((v.width = Math.max(v.width, n)),
            (v.height = Math.max(v.height, k)),
            0 < v.width && 0 < v.height)
          )
            this.sharedImageData = r.createImageData(v.width, v.height);
          else {
            console.error(
              "Canvas width or height is invalid:",
              v.width,
              v.height,
            );
            return;
          }
        if (this.sharedImageData) {
          var B = this.sharedImageData;
          if ((u = B.data)) {
            m = c.data;
            t = this.color;
            p = v.width;
            if (1 === this.sprite.type)
              for (e = 0; e < k; ++e)
                for (f = 0; f < n; ++f)
                  ((c = 4 * (f + e * p)),
                    (d = 4 * (f + e * n)),
                    (u[c + 0] = m[d + 0] * t[0]),
                    (u[c + 1] = m[d + 1] * t[1]),
                    (u[c + 2] = m[d + 2] * t[2]),
                    (u[c + 3] = m[d + 3] * t[3]));
            else
              for (e = 0; e < k; ++e)
                for (f = 0; f < n; ++f)
                  ((c = 4 * (e * p + f)),
                    (d = 4 * m[e * n + f]),
                    (u[c + 0] = h[d + 0] * t[0]),
                    (u[c + 1] = h[d + 1] * t[1]),
                    (u[c + 2] = h[d + 2] * t[2]),
                    (u[c + 3] = m[e * n + f] ? 255 * t[3] : 0));
            r.putImageData(B, 0, 0);
            q.save();
            q.translate(g | 0, l | 0);
            q.rotate((this.angle / 180) * Math.PI);
            q.scale(a, b);
            q.drawImage(
              v,
              0,
              0,
              n,
              k,
              -O[0] >> 1,
              -O[1] >> 1,
              O[0] | 0,
              O[1] | 0,
            );
            q.restore();
          } else console.error("ImageData.data is null or undefined.");
        } else console.error("ImageData is not initialized.");
      }
    };
  })();
  return m;
});
