define("Renderer/Effects/Cylinder", [
  "Utils/WebGL",
  "Utils/Texture",
  "Utils/gl-matrix",
  "Core/Client",
  "Renderer/Camera",
], function (a, b, c, d, e) {
  function m(a, b, c) {
    var d,
      e,
      f,
      g = [],
      l = [],
      h = [];
    for (d = 0; d <= b; d++)
      ((e = (d + 0) / a),
        (f = (d + 0) / a),
        (g[d] = [
          Math.sin(e * Math.PI * 2),
          Math.cos(e * Math.PI * 2),
          0,
          (a / b) * e * c,
          1,
        ]),
        (l[d] = [
          Math.sin(f * Math.PI * 2),
          Math.cos(f * Math.PI * 2),
          1,
          (a / b) * f * c,
          0,
        ]));
    for (d = 0; d <= b; d++)
      (h.push.apply(h, g[d + 0]),
        h.push.apply(h, l[d + 0]),
        h.push.apply(h, g[d + 1]),
        h.push.apply(h, l[d + 0]),
        h.push.apply(h, g[d + 1]),
        h.push.apply(h, l[d + 1]));
    return new Float32Array(h);
  }
  function h(a, b, c) {
    c = b.position;
    var d = b.otherPosition,
      e = b.direction,
      f = b.startTick;
    b = b.endTick;
    this.semiCircle = a.semiCircle ? !1 : !0;
    this.totalCircleSides = isNaN(a.totalCircleSides) ? 20 : a.totalCircleSides;
    this.circleSides = isNaN(a.circleSides)
      ? this.totalCircleSides
      : a.circleSides;
    this.color = new Float32Array([1, 1, 1, 1]);
    isNaN(a.red) || (this.color[0] = a.red);
    isNaN(a.green) || (this.color[1] = a.green);
    isNaN(a.blue) || (this.color[2] = a.blue);
    this.position = c;
    this.otherPosition = d;
    this.posX = isNaN(a.posX) ? 0 : a.posX;
    this.posY = isNaN(a.posY) ? 0 : a.posY;
    this.posZ = isNaN(a.posZ) ? 0 : a.posZ;
    this.poszStart = a.poszStart ? a.poszStart : 0;
    this.poszEnd = a.poszEnd ? a.poszEnd : 0;
    this.topSize = a.topSize;
    this.bottomSize = a.bottomSize;
    this.textureName = a.textureName;
    this.height = a.height;
    this.animation = a.animation;
    this.fade = a.fade;
    this.rotate = a.rotate;
    this.alphaMax = 0 < a.alphaMax ? a.alphaMax : 1;
    this.angleX = isNaN(a.angleX) ? 0 : a.angleX;
    this.angleY = isNaN(a.angleY) ? 0 : a.angleY;
    this.angleZ = isNaN(a.angleZ) ? 0 : a.angleZ;
    this.angleX += isNaN(a.angleXRandom)
      ? 0
      : Math.floor(Math.random() * a.angleXRandom);
    this.angleY += isNaN(a.angleYRandom)
      ? 0
      : Math.floor(Math.random() * a.angleYRandom);
    this.angleZ += isNaN(a.angleZRandom)
      ? 0
      : Math.floor(Math.random() * a.angleZRandom);
    this.repeatTextureX = isNaN(a.repeatTextureX) ? 1 : a.repeatTextureX;
    a.rotateToTarget &&
      ((this.rotateToTarget = !0),
      (this.angleY +=
        90 -
        (180 / Math.PI) *
          Math.atan2(
            this.otherPosition[1] - this.position[1],
            this.otherPosition[0] - this.position[0],
          )));
    a.rotateWithSource &&
      ((this.rotateWithSource = !0), (this.angleY += 180 + -45 * e));
    this.poszSmooth = a.poszSmooth ? !0 : !1;
    this.rotateWithCamera = a.rotateWithCamera ? !0 : !1;
    this.fixedPerspective = a.fixedPerspective ? !0 : !1;
    this.zIndex = isNaN(a.zIndex) ? 0 : a.zIndex;
    this.blendMode = a.blendMode;
    this.startTick = f;
    this.endTick = b;
    this.repeat = a.repeat;
    this.isBmp = a.isBmp ? !0 : !1;
  }
  var t,
    r = {};
  h.buffer;
  var n = c.mat4,
    g = n.create();
  h.verticeCount = 0;
  h.prototype.init = function (b) {
    this.vertices = m(
      this.totalCircleSides,
      this.circleSides,
      this.repeatTextureX,
    );
    this.verticeCount = this.vertices.length / 5;
    this.buffer = b.createBuffer();
    b.bindBuffer(b.ARRAY_BUFFER, this.buffer);
    b.bufferData(b.ARRAY_BUFFER, this.vertices, b.STATIC_DRAW);
    var c = this;
    d.loadFile(
      "data/texture/effect/" +
        this.textureName +
        (this.isBmp ? ".bmp" : ".tga"),
      function (d) {
        a.texture(b, d, function (a) {
          c.texture = a;
          c.ready = !0;
        });
      },
    );
  };
  h.prototype.free = function (a) {
    this.ready = !1;
  };
  h.prototype.render = function (a, b) {
    if (!(this.startTick > b)) {
      var c = b - this.startTick,
        d = this.endTick - this.startTick,
        l = t.uniform,
        h = t.attribute,
        p = (c / d) * 100;
      100 < p && (p = 100);
      a.bindTexture(a.TEXTURE_2D, this.texture);
      1 < this.repeatTextureX &&
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, a.REPEAT);
      a.enableVertexAttribArray(h.aPosition);
      a.enableVertexAttribArray(h.aTextureCoord);
      a.bindBuffer(a.ARRAY_BUFFER, this.buffer);
      a.vertexAttribPointer(h.aPosition, 3, a.FLOAT, !1, 20, 0);
      a.vertexAttribPointer(h.aTextureCoord, 2, a.FLOAT, !1, 20, 12);
      a.uniform1f(l.uBottomSize, this.bottomSize);
      a.uniform1f(l.uZindex, this.zIndex);
      if (1 == this.animation)
        (1e3 < d
          ? 1e3 >= c
            ? a.uniform1f(l.uHeight, (c / 1e3) * this.height)
            : a.uniform1f(l.uHeight, this.height)
          : a.uniform1f(l.uHeight, (c / d) * this.height),
          a.uniform1f(l.uTopSize, this.topSize));
      else if (2 == this.animation)
        (a.uniform1f(l.uHeight, this.height),
          1e3 < d
            ? 1e3 >= c
              ? a.uniform1f(l.uTopSize, (c / 1e3) * this.topSize)
              : a.uniform1f(l.uTopSize, this.topSize)
            : a.uniform1f(l.uTopSize, (c / d) * this.topSize));
      else if (3 == this.animation)
        (a.uniform1f(l.uHeight, this.height),
          a.uniform1f(l.uBottomSize, (1 - c / d) * this.bottomSize),
          a.uniform1f(l.uTopSize, (1 - c / d) * this.topSize),
          c < d / 2
            ? a.uniform1f(l.uHeight, (c * this.height) / (d / 2))
            : c > d / 2 &&
              a.uniform1f(l.uHeight, ((d - c) * this.height) / (d / 2)));
      else if (4 == this.animation) {
        a.uniform1f(l.uHeight, this.height);
        h = (c / d) * this.bottomSize;
        0 > h && (h = 0);
        var m = (c / d) * this.topSize;
        0 > m && (m = 0);
        a.uniform1f(l.uBottomSize, h);
        a.uniform1f(l.uTopSize, m);
      } else
        (5 == this.animation
          ? c < d / 2
            ? a.uniform1f(l.uHeight, ((2 * c) / d) * this.height)
            : a.uniform1f(l.uHeight, ((d - c) * this.height) / (d / 2))
          : a.uniform1f(l.uHeight, this.height),
          a.uniform1f(l.uTopSize, this.topSize));
      this.color[3] = this.alphaMax;
      this.fade &&
        (c < d / 4
          ? (this.color[3] = (c * this.alphaMax) / (d / 4))
          : c > d / 2 + d / 4 &&
            (this.color[3] = ((d - c) * this.alphaMax) / (d / 4)));
      a.uniform4fv(l.uSpriteRendererColor, this.color);
      0 < this.blendMode && 16 > this.blendMode
        ? a.blendFunc(a.SRC_ALPHA, r[this.blendMode])
        : a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
      c = [this.position[0], this.position[1], this.position[2]];
      this.poszSmooth
        ? this.poszStart != this.poszEnd
          ? ((d = this.poszEnd - this.poszStart),
            (h = this.poszStart),
            (p = Math.log10(0.09 * p + 1) * d + h))
          : (p = this.poszStart)
        : this.poszStart != this.poszEnd
          ? ((d = (this.poszEnd - this.poszStart) / 100),
            (h = this.poszStart),
            (p = p * d + h))
          : (p = this.poszStart);
      c[2] = this.position[2] + p;
      if (
        this.rotate ||
        this.angleX ||
        this.angleY ||
        this.angleZ ||
        this.rotateWithCamera ||
        this.fixedPerspective
      ) {
        n.identity(g);
        this.rotate && n.rotateY(g, g, (b / 4 / 180) * Math.PI);
        this.angleX && n.rotateX(g, g, (this.angleX / 180) * Math.PI);
        this.angleY && n.rotateY(g, g, (this.angleY / 180) * Math.PI);
        this.angleZ && n.rotateZ(g, g, (this.angleZ / 180) * Math.PI);
        if (this.rotateWithCamera || this.fixedPerspective) {
          p = this.posY;
          this.fixedPerspective &&
            ((d = ((e.angle[0] - 180) * Math.PI) / 180),
            this.posZ &&
              ((c[2] += this.posZ * Math.cos(d) - this.posY * Math.sin(d)),
              (p = this.posY * Math.sin(d) + this.posZ * Math.sin(d))),
            n.rotateX(g, g, d));
          d = (e.angle[1] * Math.PI) / 180;
          if (this.posX || this.posY)
            ((c[0] += this.posX * Math.cos(d) - p * Math.sin(d)),
              (c[1] += p * Math.cos(d) + this.posX * Math.sin(d)));
          n.rotateY(g, g, d);
        } else ((c[0] += this.posX), (c[1] += this.posY), (c[2] += this.posZ));
        a.uniform1i(l.uRotate, !0);
        a.uniformMatrix4fv(l.uRotationMat, !1, g);
      } else
        ((c[0] += this.posX),
          (c[1] += this.posY),
          (c[2] += this.posZ),
          a.uniform1i(l.uRotate, !1));
      a.uniform3fv(l.uPosition, c);
      a.drawArrays(a.TRIANGLES, 0, this.verticeCount);
      this.needCleanUp = this.endTick < b;
    }
  };
  h.init = function (b) {
    r[1] = b.ZERO;
    r[2] = b.ONE;
    r[3] = b.SRC_COLOR;
    r[4] = b.ONE_MINUS_SRC_COLOR;
    r[5] = b.DST_COLOR;
    r[6] = b.ONE_MINUS_DST_COLOR;
    r[7] = b.SRC_ALPHA;
    r[8] = b.ONE_MINUS_SRC_ALPHA;
    r[9] = b.DST_ALPHA;
    r[10] = b.ONE_MINUS_DST_ALPHA;
    r[11] = b.CONSTANT_COLOR;
    r[12] = b.ONE_MINUS_CONSTANT_COLOR;
    r[13] = b.CONSTANT_ALPHA;
    r[14] = b.ONE_MINUS_CONSTANT_ALPHA;
    r[15] = b.SRC_ALPHA_SATURATE;
    t = a.createShaderProgram(
      b,
      "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\n\t\tattribute vec3 aPosition;\n\t\tattribute vec2 aTextureCoord;\n\t\t\n\t\tvarying vec2 vTextureCoord;\n\t\t\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\t\tuniform mat4 uRotationMat;\n\t\tuniform bool uRotate;\n\t\tuniform vec3 uPosition;\n\t\tuniform float uTopSize;\n\t\tuniform float uBottomSize;\n\t\tuniform float uHeight;\n\t\t\n\t\tuniform float uZindex;\n\t\t\n\t\tvoid main(void) {\n\t\t\tfloat size, height;\n\t\t\t\n\t\t\tif (aPosition.z \x3d\x3d 1.0) {\n\t\t\t\tsize   \x3d uTopSize;\n\t\t\t\theight \x3d uHeight;\n\t\t\t} else {\n\t\t\t\tsize   \x3d uBottomSize;\n\t\t\t\theight \x3d 0.0;\n\t\t\t}\n\t\t\t\n\t\t\tvec4 position  \x3d vec4(uPosition.x + 0.5, -uPosition.z, uPosition.y + 0.5, 1.0);\n\t\t\tif(uRotate) {\n\t\t\t\tposition +\x3d vec4(aPosition.x * size, -height, aPosition.y * size, 0.0) * uRotationMat;\n\t\t\t} else {\n\t\t\t\tposition  +\x3d vec4(aPosition.x * size, -height, aPosition.y * size, 0.0);\n\t\t\t}\n\t\t\t\n\t\t\tgl_Position    \x3d uProjectionMat * uModelViewMat * position;\n\t\t\tgl_Position.z -\x3d uZindex;\n\t\t\t\n\t\t\tvTextureCoord  \x3d aTextureCoord;\n\t\t}\n\t",
      "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\n\t\tprecision highp float;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform sampler2D uDiffuse;\n\t\tuniform vec4 uSpriteRendererColor;\n\t\t\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\t\t\n\t\tvoid main(void) {\n\t\t\t\n\t\t\tif (uSpriteRendererColor.a \x3d\x3d  0.0) { \n\t\t\t\tdiscard; \n\t\t\t}\n\t\t\t\n\t\t vec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\n\t\t\t\n\t\t\tif (texture.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\t\t\t\n\t\t\tif (texture.r \x3c 0.01 \x26\x26 texture.g \x3c 0.01 \x26\x26 texture.b \x3c 0.01) {\n               discard;\n            }\n\t\t\t\n\t\t\tgl_FragColor   \x3d texture * uSpriteRendererColor;\n\t\t\t\n\t\t\tif (uFogUse) {\n\t\t\t float depth \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t float fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
    );
    this.ready = !0;
    this.renderBeforeEntities = !1;
  };
  h.free = function (a) {
    t && (a.deleteProgram(t), (t = null));
    this.buffer && a.deleteBuffer(this.buffer);
    this.ready = !1;
  };
  h.beforeRender = function (a, b, c, d, e) {
    e = t.uniform;
    a.depthMask(!1);
    a.useProgram(t);
    a.uniformMatrix4fv(e.uModelViewMat, !1, b);
    a.uniformMatrix4fv(e.uProjectionMat, !1, c);
    a.uniform1i(e.uFogUse, d.use && d.exist);
    a.uniform1f(e.uFogNear, d.near);
    a.uniform1f(e.uFogFar, d.far);
    a.uniform3fv(e.uFogColor, d.color);
    a.activeTexture(a.TEXTURE0);
    a.uniform1i(e.uDiffuse, 0);
  };
  h.afterRender = function (a) {
    a.depthMask(!0);
    a.disableVertexAttribArray(t.attribute.aPosition);
    a.disableVertexAttribArray(t.attribute.aTextureCoord);
    a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
  };
  return h;
});
