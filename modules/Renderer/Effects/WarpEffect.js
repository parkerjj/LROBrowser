define(
  "Renderer/Effects/WarpEffect",
  "require Utils/WebGL Utils/gl-matrix DB/Skills/SkillConst Core/Client Renderer/Map/Altitude".split(
    " ",
  ),
  function (a) {
    function b(a, b) {
      this.x = a;
      this.y = b;
      this.position = new Int16Array([a, b, 0]);
      this.size = 5;
    }
    var c = a("Utils/WebGL"),
      d = a("Utils/gl-matrix");
    a("DB/Skills/SkillConst");
    var e = a("Core/Client"),
      m = a("Renderer/Map/Altitude"),
      h,
      r,
      q = d.mat4,
      k = q.create(),
      g =
        "attribute vec3 aPosition;\nattribute vec2 aTextureCoord;\nvarying vec2 vTextureCoord;\nuniform mat4 uModelViewMat;\nuniform mat4 uProjectionMat;\nuniform mat4 uRotationMat;\nvoid main(void) {\ngl_Position    \x3d uProjectionMat * uModelViewMat * vec4( aPosition.x, aPosition.y - 0.5, aPosition.z, 1.0);\ngl_Position.z -\x3d 0.01;\nvTextureCoord  \x3d (uRotationMat * vec4( aTextureCoord - 0.5, 1.0, 1.0)).xy + 0.5;\n}",
      t =
        "varying vec2 vTextureCoord;\nuniform sampler2D uDiffuse;\nuniform vec4 uSpriteRendererColor;\nuniform bool  uFogUse;\nuniform float uFogNear;\nuniform float uFogFar;\nuniform vec3  uFogColor;\nvoid main(void) {\nif (uSpriteRendererColor.a \x3d\x3d 0.0) {\ndiscard;\n}\nvec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\nif (texture.a \x3d\x3d 0.0) {\n\tdiscard;\n}\ngl_FragColor \x3d texture * uSpriteRendererColor;\nif (uFogUse) {\nfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\nfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\ngl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n}\n}";
    b.prototype.init = function (a) {
      var b = m.generatePlane(this.x, this.y, this.size);
      this.buffer = a.createBuffer();
      this.vertCount = b.length / 5;
      a.bindBuffer(a.ARRAY_BUFFER, this.buffer);
      a.bufferData(a.ARRAY_BUFFER, b, a.STATIC_DRAW);
      this.ready = !0;
    };
    b.prototype.free = function (a) {
      a.deleteBuffer(this.buffer);
      this.ready = !1;
    };
    b.prototype.render = function (a, b) {
      b = r.attribute;
      a.bindBuffer(a.ARRAY_BUFFER, this.buffer);
      a.vertexAttribPointer(b.aPosition, 3, a.FLOAT, !1, 20, 0);
      a.vertexAttribPointer(b.aTextureCoord, 2, a.FLOAT, !1, 20, 12);
      a.drawArrays(a.TRIANGLES, 0, this.vertCount);
    };
    b.init = function (a) {
      r = c.createShaderProgram(a, g, t);
      e.loadFile("data/texture/effect/pok2.tga", function (d) {
        c.texture(a, d, function (a) {
          h = a;
          b.ready = !0;
        });
      });
      this.color = new Float32Array(4);
      this.color[0] = 1;
      this.color[1] = 1;
      this.color[2] = 1;
      this.color[3] = 0.2;
    };
    b.renderBeforeEntities = !0;
    b.free = function (a) {
      h && (a.deleteTexture(h), (h = null));
      r && (a.deleteProgram(r), (r = null));
      this.ready = !1;
    };
    b.beforeRender = function (a, b, c, d, e) {
      e = r.uniform;
      var f = r.attribute;
      a.depthMask(!1);
      q.identity(k);
      a.useProgram(r);
      a.uniformMatrix4fv(e.uModelViewMat, !1, b);
      a.uniformMatrix4fv(e.uProjectionMat, !1, c);
      a.uniformMatrix4fv(e.uRotationMat, !1, k);
      a.uniform1i(e.uFogUse, d.use && d.exist);
      a.uniform1f(e.uFogNear, d.near);
      a.uniform1f(e.uFogFar, d.far);
      a.uniform3fv(e.uFogColor, d.color);
      a.uniform4fv(e.uSpriteRendererColor, this.color);
      a.activeTexture(a.TEXTURE0);
      a.bindTexture(a.TEXTURE_2D, h);
      a.uniform1i(e.uDiffuse, 0);
      a.enableVertexAttribArray(f.aPosition);
      a.enableVertexAttribArray(f.aTextureCoord);
      a.blendFunc(a.SRC_ALPHA, a.DST_ALPHA);
    };
    b.afterRender = function (a) {
      a.depthMask(!0);
      a.disableVertexAttribArray(r.attribute.aPosition);
      a.disableVertexAttribArray(r.attribute.aTextureCoord);
      a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
    };
    return b;
  },
);
