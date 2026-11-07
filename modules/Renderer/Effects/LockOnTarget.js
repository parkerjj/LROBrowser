define(
  "Renderer/Effects/LockOnTarget",
  "require Utils/WebGL Utils/Texture Utils/gl-matrix Core/Client Renderer/Map/Altitude Engine/SessionStorage".split(
    " ",
  ),
  function (a) {
    function b(a, b, c, d, e, g) {
      this.type = a;
      this.src = b;
      this.target = c;
      this.range = d;
      this.startLifeTime = e;
      this.endLifeTime = g;
    }
    var c = a("Utils/WebGL"),
      d = a("Utils/Texture"),
      e = a("Utils/gl-matrix"),
      m = a("Core/Client"),
      h = a("Renderer/Map/Altitude"),
      r = a("Engine/SessionStorage"),
      q,
      k,
      g,
      t = e.mat4,
      l = t.create();
    b.prototype.init = function (a) {
      this.ready = !0;
    };
    b.prototype.free = function (a) {
      this.ready = !1;
    };
    b.prototype.render = function (a, b) {
      var c = 1;
      if (1 == this.type) {
        var d = b - this.startLifeTime,
          c = 20 - (Math.floor(d / 20) % 20),
          c = c / 20,
          d = Math.max(d / 50, 1),
          d = Math.min(d, 5);
        a.uniform3fv(k.uniform.uPosition, this.target.position);
        a.uniform1f(k.uniform.uSize, 3 * (6 - d));
        a.uniform1f(k.uniform.uColor, c);
        a.drawArrays(a.TRIANGLES, 0, 6);
        this.needCleanUp = this.endLifeTime < b;
      } else {
        b = new Float32Array(3);
        b[0] = this.src[0] + this.target[0];
        b[1] = this.src[1] + this.target[1];
        b[2] = h.getCellHeight(b[0], b[1]);
        var d = this.range + 1,
          e = r.Entity.position[0] - b[0],
          f = r.Entity.position[1] - b[1];
        d * d <= e * e + f * f && (c = 0.2);
        a.uniform3fv(k.uniform.uPosition, b);
        a.uniform1f(k.uniform.uSize, 3);
        a.uniform1f(k.uniform.uColor, c);
        a.drawArrays(a.TRIANGLES, 0, 6);
        this.needCleanUp = null;
      }
    };
    b.init = function (a) {
      k = c.createShaderProgram(
        a,
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\n\t\tattribute vec2 aPosition;\n\t\tattribute vec2 aTextureCoord;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\t\tuniform mat4 uRotationMat;\n\n\t\tuniform vec3 uPosition;\n\t\tuniform float uSize;\n\n\t\tvoid main(void) {\n\t\t\tvec4 position  \x3d vec4(uPosition.x + 0.5, -uPosition.z, uPosition.y + 0.5, 1.0);\n\t\t\tposition      +\x3d vec4(aPosition.x * uSize, 0.0, aPosition.y * uSize, 0.0) * uRotationMat;\n\n\t\t\tgl_Position    \x3d uProjectionMat * uModelViewMat * position;\n\t\t\tgl_Position.z -\x3d 0.02;\n\n\t\t\tvTextureCoord  \x3d aTextureCoord;\n\t\t}\n\t",
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform sampler2D uDiffuse;\n\t\tuniform float uColor;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tvoid main(void) {\n\t\t\tvec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\n\n\t\t\tif (texture.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\n\t\t\tgl_FragColor     \x3d texture;\n\t\t\tgl_FragColor.gb *\x3d uColor;\n\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
      );
      g = a.createBuffer();
      a.bindBuffer(a.ARRAY_BUFFER, g);
      a.bufferData(
        a.ARRAY_BUFFER,
        new Float32Array([
          -0.5, -0.5, 0, 0, 0.5, -0.5, 1, 0, 0.5, 0.5, 1, 1, 0.5, 0.5, 1, 1,
          -0.5, 0.5, 0, 1, -0.5, -0.5, 0, 0,
        ]),
        a.STATIC_DRAW,
      );
      m.loadFile("data/texture/effect/lockon128.tga", function (c) {
        d.load(c, function () {
          var c = this.getContext("2d");
          c.save();
          c.translate(this.width / 2, this.height / 2);
          c.rotate(0.25 * Math.PI);
          c.translate(-this.width / 2, -this.height / 2);
          c.drawImage(this, 0, 0);
          c.restore();
          q = a.createTexture();
          a.bindTexture(a.TEXTURE_2D, q);
          a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, this);
          a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR);
          a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
          b.ready = !0;
        });
      });
    };
    b.renderBeforeEntities = !0;
    b.free = function (a) {
      q && (a.deleteTexture(q), (q = null));
      k && (a.deleteProgram(k), (k = null));
      g && a.deleteBuffer(g);
      this.ready = !1;
    };
    b.beforeRender = function (a, b, c, d, e) {
      var f = k.uniform,
        h = k.attribute;
      t.identity(l);
      t.rotateY(l, l, (e / 4 / 180) * Math.PI);
      a.useProgram(k);
      a.uniformMatrix4fv(f.uModelViewMat, !1, b);
      a.uniformMatrix4fv(f.uProjectionMat, !1, c);
      a.uniformMatrix4fv(f.uRotationMat, !1, l);
      a.uniform1i(f.uFogUse, d.use && d.exist);
      a.uniform1f(f.uFogNear, d.near);
      a.uniform1f(f.uFogFar, d.far);
      a.uniform3fv(f.uFogColor, d.color);
      a.activeTexture(a.TEXTURE0);
      a.bindTexture(a.TEXTURE_2D, q);
      a.uniform1i(f.uDiffuse, 0);
      a.enableVertexAttribArray(h.aPosition);
      a.enableVertexAttribArray(h.aTextureCoord);
      a.bindBuffer(a.ARRAY_BUFFER, g);
      a.vertexAttribPointer(h.aPosition, 2, a.FLOAT, !1, 16, 0);
      a.vertexAttribPointer(h.aTextureCoord, 2, a.FLOAT, !1, 16, 8);
    };
    b.afterRender = function (a) {
      a.disableVertexAttribArray(k.attribute.aPosition);
      a.disableVertexAttribArray(k.attribute.aTextureCoord);
    };
    return b;
  },
);
