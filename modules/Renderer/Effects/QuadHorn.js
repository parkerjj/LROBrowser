define("Renderer/Effects/QuadHorn", [
  "Utils/WebGL",
  "Utils/Texture",
  "Utils/gl-matrix",
  "Core/Client",
], function (a, b, c, d) {
  function e(a, b, c) {
    this.position = b.position;
    this.blendMode = a.blendMode || 1;
    this.height =
      (a.height && a.height instanceof Array
        ? l(a.height[0], a.height[1])
        : a.height) || 0;
    this.rotateY =
      (a.rotateY && a.rotateY instanceof Array
        ? l(a.rotateY[0], a.rotateY[1])
        : a.rotateY) || 0;
    this.rotateZ =
      (a.rotateZ && a.rotateZ instanceof Array
        ? l(a.rotateZ[0], a.rotateZ[1])
        : a.rotateZ) || 0;
    this.offsetX =
      (a.offsetX && a.offsetX instanceof Array
        ? l(a.offsetX[0], a.offsetX[1])
        : a.offsetX) || 0.5;
    this.offsetY =
      (a.offsetY && a.offsetY instanceof Array
        ? l(a.offsetY[0], a.offsetY[1])
        : a.offsetY) || 0.5;
    this.offsetZ =
      (a.offsetZ && a.offsetZ instanceof Array
        ? l(a.offsetZ[0], a.offsetZ[1])
        : a.offsetZ) || 0.5;
    this.bottomSize =
      (a.bottomSize && a.bottomSize instanceof Array
        ? l(a.bottomSize[0], a.bottomSize[1])
        : a.bottomSize) || 0;
    this.color = a.color || [1, 1, 1, 1];
    this.animation = a.animation || 0;
    this.animationSpeed = a.animationSpeed || 100;
    this.animationOut = a.animationOut || !1;
    this.textureFile = a.textureFile;
    this.startTick = b.startTick;
    this.endTick = b.endTick;
    this._endAnimation = 0 < a.animation ? !1 : !0;
  }
  var m,
    h,
    r,
    q = c.mat4;
  q.create();
  var k = {},
    g = [
      0, 1, 0, -1, -1, 1, 1, -1, 1, 0, 1, 0, 1, -1, 1, 1, -1, -1, 0, 1, 0, 1,
      -1, -1, -1, -1, -1, 0, 1, 0, -1, -1, -1, -1, -1, 1,
    ],
    t = [
      0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0,
    ],
    l = function (a, b) {
      return parseFloat(Math.min(a + Math.random() * (b - a), b).toFixed(3));
    },
    f = q.create(),
    n = q.create();
  e.prototype.init = function (b) {
    var c = this;
    d.loadFile("data/texture/" + this.textureFile, function (d) {
      a.texture(b, d, function (a) {
        c.texture = a;
        c.ready = !0;
      });
    });
  };
  e.prototype.free = function (a) {
    this.ready = !1;
  };
  e.prototype.render = function (a, b) {
    var c = m.uniform,
      d = m.attribute,
      e = (b - this.startTick) / 1e3,
      g = (b - this.endTick) / 1e3;
    a.bindTexture(a.TEXTURE_2D, this.texture);
    a.enableVertexAttribArray(d.aPosition);
    a.enableVertexAttribArray(d.aTextureCoord);
    a.enableVertexAttribArray(d.aColor);
    0 < this.blendMode && 16 > this.blendMode
      ? a.blendFunc(a.SRC_ALPHA, k[this.blendMode])
      : a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
    1 !== this.animation || this._endAnimation
      ? 2 !== this.animation || this._endAnimation
        ? 3 !== this.animation || this._endAnimation
          ? (a.uniform1f(c.uHeight, this.height),
            a.uniform1f(c.uOffsetZ, this.offsetZ))
          : ((e /= this.animationSpeed / 1e3),
            e > this.height / 2
              ? ((this._endAnimation = !0),
                a.uniform1f(c.uOffsetZ, this.offsetZ))
              : a.uniform1f(c.uOffsetZ, e),
            a.uniform1f(c.uHeight, this.height))
        : ((e /= this.animationSpeed / 1e3),
          e > this.offsetZ
            ? ((this._endAnimation = !0), a.uniform1f(c.uOffsetZ, this.offsetZ))
            : a.uniform1f(c.uOffsetZ, e),
          a.uniform1f(c.uHeight, this.height))
      : ((e /= this.animationSpeed / 1e3),
        e > this.height
          ? ((this._endAnimation = !0), a.uniform1f(c.uHeight, this.height))
          : a.uniform1f(c.uHeight, e),
        a.uniform1f(c.uOffsetZ, this.offsetZ));
    0 < this.endTick &&
      this.endTick < b &&
      (this.animationOut && this._endAnimation
        ? ((g = -((g / (this.animationSpeed / 1e3)) * this.height)),
          g < -(this.height + this.offsetZ) &&
            (this.needCleanUp = this.endTick < b),
          a.uniform1f(c.uOffsetZ, g))
        : (this.needCleanUp = this.endTick < b));
    a.bindBuffer(a.ARRAY_BUFFER, h);
    a.vertexAttribPointer(d.aPosition, 3, a.FLOAT, !1, 0, 0);
    a.bindBuffer(a.ARRAY_BUFFER, null);
    a.bindBuffer(a.ARRAY_BUFFER, r);
    a.vertexAttribPointer(d.aTextureCoord, 2, a.FLOAT, !1, 0, 0);
    a.bindBuffer(a.ARRAY_BUFFER, null);
    a.uniform3fv(c.uPosition, this.position);
    a.uniform1f(c.uBottomSize, this.bottomSize);
    a.uniform1f(c.uOffsetX, this.offsetX);
    a.uniform1f(c.uOffsetY, this.offsetY);
    a.uniform4fv(c.uColor, this.color);
    q.identity(n);
    q.rotate(n, n, (this.rotateY * Math.PI) / 180, [0, 1, 0]);
    a.uniformMatrix4fv(c.uYRotationMat, !1, n);
    q.identity(f);
    q.rotate(f, f, ((180 + this.rotateZ) * Math.PI) / 180, [0, 0, 1]);
    a.uniformMatrix4fv(c.uZRotationMat, !1, f);
    a.drawArrays(a.TRIANGLES, 0, 12);
    a.flush();
  };
  e.init = function (b) {
    m = a.createShaderProgram(
      b,
      "\n        #version 100\n        #pragma vscode_glsllint_stage : vert\n        precision highp float;\n\n\t\tattribute vec3 aPosition;\n\t\tattribute vec2 aTextureCoord;\n\t\tvarying vec2 vTextureCoord;\n\n        uniform vec3 uPosition;\n\t\tuniform float uHeight;\n\t\tuniform float uBottomSize;\n\t\tuniform float uOffsetX;\n\t\tuniform float uOffsetY;\n\t\tuniform float uOffsetZ;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\t\tuniform mat4 uYRotationMat;\n\t\tuniform mat4 uZRotationMat;\n\t\tvoid main(void) {\n\t\t\tvec4 position       \x3d vec4(uPosition.x + uOffsetX, -uPosition.z - ((uHeight * 0.9) + uOffsetZ), uPosition.y + uOffsetY, 1.0);\n\t\t\tposition            +\x3d vec4(aPosition.x * uBottomSize, aPosition.y * uHeight, aPosition.z * uBottomSize, 0.0) * uYRotationMat * uZRotationMat;\n            gl_Position         \x3d uProjectionMat * uModelViewMat * position;\n\n            vTextureCoord \x3d aTextureCoord;\n\t\t}\n\t",
      "\n        #version 100\n        #pragma vscode_glsllint_stage : frag\n        precision highp float;\n\n\t\tvarying vec2 vTextureCoord;\n        uniform vec4 uColor;\n\t\tuniform sampler2D uDiffuse;\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\t\t\n\t\tvoid main(void) {\n\t\t\t\n\t\t\tvec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\n\t\t\t\n\t\t\tif (texture.a \x3d\x3d 0.0 ) { discard; }\n            if (texture.r \x3c 0.01 \x26\x26 texture.g \x3c 0.01 \x26\x26 texture.b \x3c 0.01) {\n                discard;\n             }\n\t\t\t\n\t\t\tgl_FragColor \x3d texture * uColor;\n\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
    );
    k[1] = b.ZERO;
    k[2] = b.ONE;
    k[3] = b.SRC_COLOR;
    k[4] = b.ONE_MINUS_SRC_COLOR;
    k[5] = b.DST_COLOR;
    k[6] = b.ONE_MINUS_DST_COLOR;
    k[7] = b.SRC_ALPHA;
    k[8] = b.ONE_MINUS_SRC_ALPHA;
    k[9] = b.DST_ALPHA;
    k[10] = b.ONE_MINUS_DST_ALPHA;
    k[11] = b.CONSTANT_COLOR;
    k[12] = b.ONE_MINUS_CONSTANT_COLOR;
    k[13] = b.CONSTANT_ALPHA;
    k[14] = b.ONE_MINUS_CONSTANT_ALPHA;
    k[15] = b.SRC_ALPHA_SATURATE;
    h = b.createBuffer();
    b.bindBuffer(b.ARRAY_BUFFER, h);
    b.bufferData(b.ARRAY_BUFFER, new Float32Array(g), b.STATIC_DRAW);
    r = b.createBuffer();
    b.bindBuffer(b.ARRAY_BUFFER, r);
    b.bufferData(b.ARRAY_BUFFER, new Float32Array(t), b.STATIC_DRAW);
    this.ready = !0;
    this.renderBeforeEntities = !1;
  };
  e.free = function (a) {
    m && (a.deleteProgram(m), (m = null));
    h && a.deleteBuffer(h);
    r && a.deleteBuffer(r);
    this.ready = !1;
  };
  e.beforeRender = function (a, b, c, d, e) {
    e = m.uniform;
    a.useProgram(m);
    a.uniformMatrix4fv(e.uModelViewMat, !1, b);
    a.uniformMatrix4fv(e.uProjectionMat, !1, c);
    a.uniform1i(e.uFogUse, d.use && d.exist);
    a.uniform1f(e.uFogNear, d.near);
    a.uniform1f(e.uFogFar, d.far);
    a.uniform3fv(e.uFogColor, d.color);
    a.activeTexture(a.TEXTURE0);
    a.uniform1i(e.uDiffuse, 0);
  };
  e.afterRender = function (a) {
    a.disableVertexAttribArray(m.attribute.aPosition);
    a.disableVertexAttribArray(m.attribute.aTextureCoord);
    a.disableVertexAttribArray(m.attribute.aColor);
    a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
  };
  return e;
});
