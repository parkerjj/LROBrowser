define(
  "Renderer/Effects/LineEffect",
  "require Utils/WebGL Utils/gl-matrix DB/Skills/SkillConst Core/Client Renderer/Map/Altitude Renderer/Camera".split(
    " ",
  ),
  function (a) {
    function b(a, b, c, d, q) {
      this.lineCheck = !0;
      this.AID = d;
      this.tAID = q;
      this.position = a;
      this._position = b;
      this.alpha = c.alphaMax ? c.alphaMax : 1;
      this.color = new Float32Array(4);
      this.color[0] = c.red ? c.red : 1;
      this.color[1] = c.green ? c.green : 1;
      this.color[2] = c.blue ? c.blue : 1;
      this.color[3] = this.alpha;
    }
    var c = a("Utils/WebGL");
    a("Utils/gl-matrix");
    a("DB/Skills/SkillConst");
    a("Core/Client");
    a("Renderer/Map/Altitude");
    a("Renderer/Camera");
    var d;
    b.prototype.init = function (a) {
      this.buffer = a.createBuffer();
      a.bindBuffer(a.ARRAY_BUFFER, this.buffer);
      this.ready = !0;
    };
    b.prototype.free = function (a) {
      a.deleteBuffer(this.buffer);
      this.ready = !1;
    };
    b.prototype.render = function (a, b) {
      if (
        !(
          11 <
          Math.sqrt(
            Math.pow(Math.abs(this._position[0] - this.position[0]), 2) +
              Math.pow(Math.abs(this._position[1] - this.position[1]), 2),
          )
        )
      ) {
        b = d.attribute;
        a.enableVertexAttribArray(b.aPosition);
        a.bindBuffer(a.ARRAY_BUFFER, this.buffer);
        var c = new Float32Array([
          this.position[0],
          this.position[1],
          this.position[2],
          this._position[0],
          this._position[1],
          this._position[2],
        ]);
        a.bufferData(a.ARRAY_BUFFER, c, a.STATIC_DRAW);
        a.vertexAttribPointer(b.aPosition, 3, a.FLOAT, !1, 0, 0);
        a.uniform4fv(d.uniform.uColor, this.color);
        a.drawArrays(a.LINES, 0, 2);
      }
    };
    b.init = function (a) {
      d = c.createShaderProgram(
        a,
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\t\t\n\t\t'attribute vec3 aPosition;',\n\t\t'uniform mat4 uModelViewMat;',\n\t\t'uniform mat4 uProjectionMat;',\n\n\t\t'void main(void) {',\n\t\t\t'vec4 position  \x3d vec4(0.5, -1.5, 0.5, 1.0);',\n\t\t\t'position      +\x3d vec4(aPosition.x, -aPosition.z, aPosition.y, 0.0);',\n\n\t\t\t'gl_Position    \x3d uProjectionMat * uModelViewMat * position;',\n\t\t'}'\n\t",
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\t\t\n\t\t'uniform vec4 uColor;',\n\n\t\t'void main(void) {',\n\t\t\t'gl_FragColor     \x3d uColor;',\n\t\t'}'\n\t",
      );
      this.ready = !0;
      this.renderBeforeEntities = !1;
    };
    b.free = function (a) {
      d && (a.deleteProgram(d), (d = null));
    };
    b.beforeRender = function (a, b, c, r, q) {
      r = d.uniform;
      a.useProgram(d);
      a.uniformMatrix4fv(r.uModelViewMat, !1, b);
      a.uniformMatrix4fv(r.uProjectionMat, !1, c);
    };
    b.afterRender = function (a) {
      a.disableVertexAttribArray(d.attribute.aPosition);
      a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
    };
    return b;
  },
);
