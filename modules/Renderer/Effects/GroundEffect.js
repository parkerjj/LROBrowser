define("Renderer/Effects/GroundEffect", [
  "Utils/WebGL",
  "Utils/Texture",
  "Utils/gl-matrix",
  "Core/Client",
  "Renderer/Camera",
], function (a, b, c, d, e) {
  function m(a, b, c) {
    c = b.otherPosition;
    var d = b.position;
    this.matrix = k.create();
    this.position = b.position;
    this._position = [
      b.otherPosition[0],
      b.otherPosition[1],
      b.otherPosition[2],
    ];
    this.texture = null;
    this.textureName = a.file;
    this.size = a.size ? a.size : 0;
    this.color = new Float32Array(4);
    this.color[0] = a.red ? a.red : 1;
    this.color[1] = a.green ? a.green : 1;
    this.color[2] = a.blue ? a.blue : 1;
    this.color[3] = a.alpha ? a.alpha : 1;
    this.alpha = a.alphaMax ? a.alphaMax : 1;
    this.angle = a.angle ? a.angle : 0;
    this.noLifeTime = a.noLifeTime ? !0 : !1;
    this.startLifeTime = b.startTick;
    this.endLifeTime = b.endTick;
    this.fadeIn = a.fadeIn ? !0 : !1;
    this.fadeOut = a.fadeOut ? !0 : !1;
    this.blendMode = a.blendMode ? !0 : !1;
    this.rotate = a.rotate ? !0 : !1;
    a.posz && (this.position[2] = this._position[2] + a.posz);
    this.sizeStart = a.sizeStart ? a.sizeStart : 0;
    this.sizeEnd = a.sizeEnd ? a.sizeEnd : 0;
    this.sizeSmooth = a.sizeSmooth ? !0 : !1;
    this.posxSmooth = a.posxSmooth ? !0 : !1;
    this.posySmooth = a.posySmooth ? !0 : !1;
    a.toDst &&
      ((this.toDst = !0),
      (this.posxStart = 0),
      (this.posxEnd = d[0] - c[0]),
      (this.posyStart = 0),
      (this.posyEnd = d[1] - c[1]),
      (b = a.AngleOffset ? a.AngleOffset : 0),
      (this.angle = a.uAngle
        ? h(d, c) - e.angleFinal[1] - b
        : h(c, d) - e.angleFinal[1] - b));
    a.toPos &&
      ((this.toPos = !0),
      (this.posxStart = a.posxStart ? a.posxStart : 0),
      (this.posxEnd = a.posxEnd ? a.posxEnd : 0),
      (this.posyStart = a.posyStart ? a.posyStart : 0),
      (this.posyEnd = a.posyEnd ? a.posyEnd : 0),
      (d = new Int32Array(2)),
      (d[0] = c[0] + this.posxEnd),
      (d[1] = c[1] + this.posyEnd),
      (b = a.AngleOffset ? a.AngleOffset : 0),
      (this.angle = a.uAngle
        ? h(d, c) - e.angleFinal[1] - b
        : h(c, d) - e.angleFinal[1] - b));
  }
  function h(a, b) {
    return (180 * Math.atan2(b[1] - a[1], b[0] - a[0])) / Math.PI;
  }
  var r,
    q,
    k = c.mat4;
  k.create();
  m.prototype.init = function (b) {
    var c = this;
    d.loadFile("data/texture/" + this.textureName, function (d) {
      a.texture(b, d, function (a) {
        c.texture = a;
        c.ready = !0;
      });
    });
  };
  m.prototype.free = function (a) {
    this.ready = !1;
  };
  m.prototype.render = function (a, b) {
    var c = b - this.startLifeTime,
      d = this.endLifeTime - this.startLifeTime;
    if (this.noLifeTime) var e = b / 120;
    else ((e = (c / d) * 100), 100 < e && (e = 100));
    this.fadeIn && c < d / 4
      ? ((c = (c * this.alpha) / (d / 4)), (this.color[3] = c))
      : this.fadeOut &&
        c > d / 2 + d / 4 &&
        ((c = ((d - c) * this.alpha) / (d / 4)), (this.color[3] = c));
    if (this.toDst || this.toPos) {
      if (this.posxSmooth)
        if (this.posxStart != this.posxEnd)
          var c = Math.log10(0.09 * e + 1),
            d = this.posxEnd - this.posxStart,
            g = this.posxStart,
            c = c * d + g;
        else c = this.posxStart;
      else
        this.posxStart != this.posxEnd
          ? ((d = (this.posxEnd - this.posxStart) / 100),
            (g = this.posxStart),
            (c = e * d + g))
          : (c = this.posxStart);
      this.position[0] = this._position[0] + c;
      this.posySmooth
        ? this.posyStart != this.posyEnd
          ? ((c = Math.log10(0.09 * e + 1)),
            (d = this.posyEnd - this.posyStart),
            (g = this.posyStart),
            (c = c * d + g))
          : (c = this.posyStart)
        : this.posyStart != this.posyEnd
          ? ((d = (this.posyEnd - this.posyStart) / 100),
            (g = this.posyStart),
            (c = e * d + g))
          : (c = this.posyStart);
      this.position[1] = this._position[1] + c;
      this.sizeSmooth
        ? this.sizeEnd != this.sizeStart
          ? ((c = Math.log10(0.09 * e + 1)),
            (d = this.sizeEnd - this.sizeStart),
            (g = this.sizeStart),
            (e = c * d + g))
          : (e = this.sizeStart)
        : this.sizeEnd != this.sizeStart
          ? ((d = (this.sizeEnd - this.sizeStart) / 100),
            (g = this.sizeStart),
            (e = e * d + g))
          : (e = this.sizeStart);
    } else ((e = Math.sin((b / 4 / 180) * Math.PI)), (e /= 20));
    c = r.attribute;
    d = r.uniform;
    this.blendMode && a.blendFunc(a.SRC_ALPHA, a.DST_ALPHA);
    a.activeTexture(a.TEXTURE0);
    a.bindTexture(a.TEXTURE_2D, this.texture);
    a.uniform1i(d.uDiffuse, 0);
    this.rotate
      ? (k.identity(this.matrix),
        k.rotateY(this.matrix, this.matrix, (b / 4 / 180) * Math.PI))
      : (k.identity(this.matrix),
        k.rotateY(this.matrix, this.matrix, (this.angle / 180) * Math.PI));
    a.uniformMatrix4fv(r.uniform.uRotationMat, !1, this.matrix);
    a.enableVertexAttribArray(c.aPosition);
    a.enableVertexAttribArray(c.aTextureCoord);
    a.bindBuffer(a.ARRAY_BUFFER, q);
    a.vertexAttribPointer(c.aPosition, 2, a.FLOAT, !1, 16, 0);
    a.vertexAttribPointer(c.aTextureCoord, 2, a.FLOAT, !1, 16, 8);
    a.uniform3fv(r.uniform.uPosition, this.position);
    a.uniform1f(r.uniform.uSize, this.size + e);
    a.uniform4fv(r.uniform.uColor, this.color);
    a.drawArrays(a.TRIANGLES, 0, 6);
    this.noLifeTime || (this.needCleanUp = this.endLifeTime < b);
  };
  m.init = function (b) {
    r = a.createShaderProgram(
      b,
      "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\t\t\n\t\tattribute vec2 aPosition;\n\t\tattribute vec2 aTextureCoord;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\t\tuniform mat4 uRotationMat;\n\n\t\tuniform vec3 uPosition;\n\t\tuniform float uSize;\n\n\t\tvoid main(void) {\n\t\t\tvec4 position  \x3d vec4(uPosition.x + 0.5, -uPosition.z, uPosition.y + 0.5, 1.0);\n\t\t\tposition      +\x3d vec4(aPosition.x * uSize, 0.0, aPosition.y * uSize, 0.0) * uRotationMat;\n\n\t\t\tgl_Position    \x3d uProjectionMat * uModelViewMat * position;\n\t\t\tgl_Position.z -\x3d 0.02;\n\n\t\t\tvTextureCoord  \x3d aTextureCoord;\n\t\t}\n\t",
      "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\t\t\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform sampler2D uDiffuse;\n\t\tuniform vec4 uColor;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tvoid main(void) {\n\t\t\tvec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\n\n\t\t\tif (texture.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\n\t\t\tgl_FragColor     \x3d texture * uColor;\n\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
    );
    q = b.createBuffer();
    this.ready = !0;
    this.renderBeforeEntities = !1;
    b.bindBuffer(b.ARRAY_BUFFER, q);
    b.bufferData(
      b.ARRAY_BUFFER,
      new Float32Array([
        -0.5, -0.5, 0, 0, 0.5, -0.5, 1, 0, 0.5, 0.5, 1, 1, 0.5, 0.5, 1, 1, -0.5,
        0.5, 0, 1, -0.5, -0.5, 0, 0,
      ]),
      b.STATIC_DRAW,
    );
  };
  m.free = function (a) {
    r && (a.deleteProgram(r), (r = null));
    q && a.deleteBuffer(q);
    this.ready = !1;
  };
  m.beforeRender = function (a, b, c, d, e) {
    d = r.uniform;
    a.depthMask(!1);
    a.useProgram(r);
    a.uniformMatrix4fv(d.uModelViewMat, !1, b);
    a.uniformMatrix4fv(d.uProjectionMat, !1, c);
    a.activeTexture(a.TEXTURE0);
    a.uniform1i(d.uDiffuse, 0);
  };
  m.afterRender = function (a) {
    a.depthMask(!0);
    a.disableVertexAttribArray(r.attribute.aPosition);
    a.disableVertexAttribArray(r.attribute.aTextureCoord);
    a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
  };
  return m;
});
