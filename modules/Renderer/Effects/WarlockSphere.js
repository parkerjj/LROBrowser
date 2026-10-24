define(
  "Renderer/Effects/WarlockSphere",
  "require Utils/WebGL Utils/Texture Utils/gl-matrix Core/Client Renderer/Camera".split(
    " ",
  ),
  function (a) {
    function b(a, b) {
      this.position = a.position;
      this.spheres = b ? b : [];
      this.file = l[a.lastSKID];
      this.initialAlpha = 0;
    }
    var c = a("Utils/WebGL"),
      d = a("Utils/Texture"),
      e = a("Utils/gl-matrix"),
      m = a("Core/Client"),
      h = a("Renderer/Camera"),
      r,
      q,
      k,
      g = e.mat4,
      t = (function () {
        for (var a = [], b = 0; 5 > b; b++)
          a.push({ posMat: g.create(), texMat: g.create() });
        return a;
      })();
    g.create();
    var l = [];
    l[2222] = "fireorb.bmp";
    l[2223] = "lightningorb.bmp";
    l[2224] = "waterorb.bmp";
    l[2229] = "stoneorb.bmp";
    b.prototype.init = function (a) {
      var b = this;
      m.loadFile("data/texture/effect/" + this.file, function (c) {
        d.load(c, function () {
          var c = this.getContext("2d");
          c.save();
          c.translate(this.width / 2, this.height / 2);
          c.translate(-this.width / 2, -this.height / 2);
          c.drawImage(this, 0, 0);
          c.restore();
          r = a.createTexture();
          a.bindTexture(a.TEXTURE_2D, r);
          a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, this);
          a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR);
          a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
          b.ready = !0;
        });
      });
      this.ready = !0;
    };
    b.prototype.free = function (a) {
      this.ready = !1;
    };
    b.renderBeforeEntities = !1;
    b.init = function (a) {
      q = c.createShaderProgram(
        a,
        "\n        #version 100\n        #pragma vscode_glsllint_stage : vert\n        precision highp float;\n\n        attribute vec2 aPosition;\n        attribute vec2 aTextureCoord;\n\n        varying vec2 vTextureCoord;\n\n        uniform mat4 uModelViewMat;\n        uniform mat4 uProjectionMat;\n        uniform mat4 uTextureRotMat;\n        uniform mat4 uRotationMat;\n\n        uniform float uCameraZoom;\n\n        uniform vec3 uPosition;\n        uniform float uSize;\n        uniform float uZIndex;\n\n        void main(void) {\n\n            vec4 position  \x3d vec4(uPosition.x + 0.5, -uPosition.z - 2.0, uPosition.y + 0.5, 1.0);\n            \n            vec4 pos2      \x3d vec4(aPosition.x * uSize, 0.0, aPosition.y * uSize, 0.0) * uTextureRotMat;\n            pos2.x        +\x3d 1.0;\n            position      +\x3d pos2 * uRotationMat;\n\n            gl_Position    \x3d uProjectionMat * uModelViewMat * position;\n            gl_Position.z -\x3d uZIndex / max(uCameraZoom, 1.0);\n\n            vTextureCoord  \x3d aTextureCoord;\n        }",
        "\n        #version 100\n        #pragma vscode_glsllint_stage : frag\n        precision highp float;\n\n        varying vec2 vTextureCoord;\n\n        uniform vec4 uColor;\n        uniform sampler2D uDiffuse;\n        float tmp;\n\n        void main(void) {\n            vec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\n            \n            texture *\x3d uColor;\n            \n            /*if (texture.r \x3c 0.1 \x26\x26 texture.g \x3c 0.1 \x26\x26 texture.b \x3c 0.1) {\n               discard;\n            }*/\n            \n            gl_FragColor \x3d texture;\n\n        }",
      );
      k = a.createBuffer();
      a.bindBuffer(a.ARRAY_BUFFER, k);
      a.bufferData(
        a.ARRAY_BUFFER,
        new Float32Array([
          -1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 0, 1, -1,
          -1, 0, 0,
        ]),
        a.STATIC_DRAW,
      );
      m.loadFile("data/texture/effect/thunder_center.bmp", function (c) {
        d.load(c, function () {
          var c = this.getContext("2d");
          c.save();
          c.translate(this.width / 2, this.height / 2);
          c.translate(-this.width / 2, -this.height / 2);
          c.drawImage(this, 0, 0);
          c.restore();
          r = a.createTexture();
          a.bindTexture(a.TEXTURE_2D, r);
          a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, this);
          a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR);
          a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
          b.ready = !0;
        });
      });
    };
    b.free = function (a) {
      r && (a.deleteTexture(r), (r = null));
      q && (a.deleteProgram(q), (q = null));
      k && a.deleteBuffer(k);
      this.ready = !1;
    };
    b.beforeRender = function (a, b, c, d, e) {
      d = q.uniform;
      var f = q.attribute;
      a.useProgram(q);
      for (var l, n, m = 0, p = t.length; m < p; m++) {
        l = ((h.angle[0] - 90) * Math.PI) / 180;
        var v = (h.angle[1] * Math.PI) / 180;
        n = (2 * m * Math.PI) / t.length;
        n -= (e / 64 / 180) * Math.PI;
        var u = g.create();
        g.rotateX(t[m].texMat, u, l);
        g.rotateY(t[m].texMat, t[m].texMat, v - n);
        l = t[m].posMat;
        g.identity(l);
        g.rotateY(l, l, n);
      }
      a.uniformMatrix4fv(d.uModelViewMat, !1, b);
      a.uniformMatrix4fv(d.uProjectionMat, !1, c);
      a.activeTexture(a.TEXTURE0);
      a.bindTexture(a.TEXTURE_2D, r);
      a.uniform1i(d.uDiffuse, 0);
      a.enableVertexAttribArray(f.aPosition);
      a.enableVertexAttribArray(f.aTextureCoord);
      a.bindBuffer(a.ARRAY_BUFFER, k);
      a.vertexAttribPointer(f.aPosition, 2, a.FLOAT, !1, 16, 0);
      a.vertexAttribPointer(f.aTextureCoord, 2, a.FLOAT, !1, 16, 8);
      a.depthMask(!0);
    };
    b.prototype.render = function (a, b) {
      b = q.uniform;
      a.uniform3fv(b.uPosition, this.position);
      a.bindBuffer(a.ARRAY_BUFFER, k);
      a.blendFunc(a.SRC_ALPHA, a.ONE);
      a.uniform1f(b.uCameraZoom, h.zoom);
      for (var c, d = this.spheres.length; 0 < d; d--)
        ((c = t[d % t.length]),
          a.uniformMatrix4fv(b.uTextureRotMat, !1, c.texMat),
          a.uniformMatrix4fv(b.uRotationMat, !1, c.posMat),
          10 < d
            ? (this.isCoin
                ? (a.uniform1f(b.uSize, 0.3),
                  a.uniform4fv(b.uColor, [
                    1,
                    0.9,
                    0.4,
                    0.2 * this.initialAlpha,
                  ]))
                : (a.uniform1f(b.uSize, 0.55),
                  a.uniform4fv(b.uColor, [0, 0, 1, 0.2 * this.initialAlpha])),
              a.uniform1f(b.uZIndex, 0))
            : 5 < d
              ? (this.isCoin
                  ? (a.uniform1f(b.uSize, 0.2),
                    a.uniform4fv(b.uColor, [
                      1,
                      0.9,
                      0.4,
                      0.4 * this.initialAlpha,
                    ]))
                  : (a.uniform1f(b.uSize, 0.35),
                    a.uniform4fv(b.uColor, [0, 0, 1, 0.6 * this.initialAlpha])),
                a.uniform1f(b.uZIndex, 0.01))
              : (this.isCoin
                  ? (a.uniform1f(b.uSize, 0.1),
                    a.uniform4fv(b.uColor, [
                      1,
                      0.9,
                      0.4,
                      0.6 * this.initialAlpha,
                    ]))
                  : (a.uniform1f(b.uSize, 0.25),
                    a.uniform4fv(b.uColor, [0, 0, 1, 1 * this.initialAlpha])),
                a.uniform1f(b.uZIndex, 0.02),
                a.drawArrays(a.TRIANGLES, 0, 6),
                this.isCoin
                  ? (a.uniform1f(b.uSize, 0.05),
                    a.uniform4fv(b.uColor, [1, 1, 0.7, 1 * this.initialAlpha]))
                  : (a.uniform1f(b.uSize, 0.15),
                    a.uniform4fv(b.uColor, [
                      0.8,
                      0.8,
                      1,
                      1 * this.initialAlpha,
                    ])),
                a.uniform1f(b.uZIndex, 0.03)),
          a.drawArrays(a.TRIANGLES, 0, 6));
      1 > this.initialAlpha &&
        (this.initialAlpha = Math.min(this.initialAlpha + 0.005, 1));
    };
    b.afterRender = function (a) {
      a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
      a.disableVertexAttribArray(q.attribute.aPosition);
      a.disableVertexAttribArray(q.attribute.aTextureCoord);
    };
    return b;
  },
);
