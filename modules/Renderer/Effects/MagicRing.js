define("Renderer/Effects/MagicRing", [
  "Utils/WebGL",
  "Utils/Texture",
  "Utils/gl-matrix",
  "Core/Client",
], function (a, b, c, d) {
  function e(a, b, c, d, e, k) {
    this.target = a;
    this.topSize = b;
    this.bottomSize = c;
    this.textureName = e;
    this.height = d;
    this.endTick = k;
  }
  var m,
    h,
    r = c.mat4,
    q = r.create(),
    k = 0;
  e.prototype.init = function (b) {
    var c = this;
    d.loadFile(
      "data/texture/effect/" + this.textureName + ".tga",
      function (d) {
        a.texture(b, d, function (a) {
          c.texture = a;
          c.ready = !0;
        });
      },
    );
  };
  e.prototype.free = function (a) {
    this.ready = !1;
  };
  e.prototype.render = function (a, b) {
    var c = m.uniform,
      d = m.attribute;
    a.bindTexture(a.TEXTURE_2D, this.texture);
    a.enableVertexAttribArray(d.aPosition);
    a.enableVertexAttribArray(d.aTextureCoord);
    a.bindBuffer(a.ARRAY_BUFFER, h);
    a.vertexAttribPointer(d.aPosition, 3, a.FLOAT, !1, 20, 0);
    a.vertexAttribPointer(d.aTextureCoord, 2, a.FLOAT, !1, 20, 12);
    a.uniform3fv(c.uPosition, this.target.position);
    a.uniform1f(c.uBottomSize, this.bottomSize);
    a.uniform1f(c.uTopSize, this.topSize);
    a.uniform1f(c.uHeight, this.height);
    a.drawArrays(a.TRIANGLES, 0, k);
    this.needCleanUp = this.endTick < b;
    this.target.cast.display || (this.needCleanUp = !0);
  };
  e.init = function (b) {
    var c,
      d,
      e,
      g = [],
      p = [],
      q = [];
    for (c = 0; 20 >= c; c++)
      ((d = (c + 0) / 20),
        (e = (c + 0.5) / 20),
        (g[c] = [
          Math.sin(d * Math.PI * 2),
          Math.cos(d * Math.PI * 2),
          0,
          d,
          1,
        ]),
        (p[c] = [
          Math.sin(e * Math.PI * 2),
          Math.cos(e * Math.PI * 2),
          1,
          e,
          0,
        ]));
    for (c = 0; 20 >= c; c++)
      (q.push.apply(q, g[c + 0]),
        q.push.apply(q, p[c + 0]),
        q.push.apply(q, g[c + 1]),
        q.push.apply(q, p[c + 0]),
        q.push.apply(q, g[c + 1]),
        q.push.apply(q, p[c + 1]));
    c = new Float32Array(q);
    k = c.length / 5;
    m = a.createShaderProgram(
      b,
      "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\n\t\tattribute vec3 aPosition;\n\t\tattribute vec2 aTextureCoord;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\t\tuniform mat4 uRotationMat;\n\n\t\tuniform vec3 uPosition;\n\t\tuniform float uTopSize;\n\t\tuniform float uBottomSize;\n\t\tuniform float uHeight;\n\n\t\tvoid main(void) {\n\t\t\tfloat size, height;\n\n\t\t\tif (aPosition.z \x3d\x3d 1.0) {\n\t\t\t\tsize   \x3d uTopSize;\n\t\t\t\theight \x3d uHeight;\n\t\t\t}\n\t\t\telse {\n\t\t\t\tsize   \x3d uBottomSize;\n\t\t\t\theight \x3d 0.0;\n\t\t\t}\n\n\t\t\tvec4 position  \x3d vec4(uPosition.x + 0.5, -uPosition.z - height, uPosition.y + 0.5, 1.0);\n\t\t\tposition      +\x3d vec4(aPosition.x * size, 0.0, aPosition.y * size, 0.0) * uRotationMat;\n\n\t\t\tgl_Position    \x3d uProjectionMat * uModelViewMat * position;\n\t\t\tvTextureCoord  \x3d aTextureCoord;\n\t\t}\n\t",
      "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform sampler2D uDiffuse;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tvoid main(void) {\n\t\t\tvec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\n\n\t\t\tif (texture.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\n            if (texture.r \x3c 0.5 || texture.g \x3c 0.5 || texture.b \x3c 0.5) {\n               discard;\n            }\n\t\t\ttexture.a \x3d 0.7;\n\t\t\tgl_FragColor \x3d texture;\n\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
    );
    h = b.createBuffer();
    this.ready = !0;
    this.renderBeforeEntities = !1;
    b.bindBuffer(b.ARRAY_BUFFER, h);
    b.bufferData(b.ARRAY_BUFFER, c, b.STATIC_DRAW);
  };
  e.free = function (a) {
    m && (a.deleteProgram(m), (m = null));
    h && a.deleteBuffer(h);
    this.ready = !1;
  };
  e.beforeRender = function (a, b, c, d, e) {
    var f = m.uniform;
    r.identity(q);
    r.rotateY(q, q, (e / 4 / 180) * Math.PI);
    a.useProgram(m);
    a.uniformMatrix4fv(f.uModelViewMat, !1, b);
    a.uniformMatrix4fv(f.uProjectionMat, !1, c);
    a.uniformMatrix4fv(f.uRotationMat, !1, q);
    a.uniform1i(f.uFogUse, d.use && d.exist);
    a.uniform1f(f.uFogNear, d.near);
    a.uniform1f(f.uFogFar, d.far);
    a.uniform3fv(f.uFogColor, d.color);
    a.activeTexture(a.TEXTURE0);
    a.uniform1i(f.uDiffuse, 0);
  };
  e.afterRender = function (a) {
    a.disableVertexAttribArray(m.attribute.aPosition);
    a.disableVertexAttribArray(m.attribute.aTextureCoord);
  };
  return e;
});
