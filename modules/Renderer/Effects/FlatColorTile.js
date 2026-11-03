define("Renderer/Effects/FlatColorTile", ["require", "Utils/WebGL"], function (
  a,
) {
  var b = a("Utils/WebGL"),
    c = {};
  return function (a, e) {
    function d(a) {
      this.position = a.otherPosition;
    }
    var h, r;
    if (c[a]) return c[a];
    void 0 === e.a && (e.a = 0.5);
    [e.r, e.g, e.b, e.a].forEach(function (a) {
      if (void 0 === a) throw Error("FlatColorTile: need to pass r, g, b, a");
      if (1 < a || 0 > a)
        throw Error("FlatColorTile: r, g, b, a need to be 0.0-1.0");
    });
    d._uid = a;
    c[a] = d;
    d.prototype.init = function (a) {
      this.ready = !0;
    };
    d.prototype.free = function (a) {
      this.ready = !1;
    };
    d.prototype.render = function (a, b) {
      a.uniform3fv(h.uniform.uPosition, this._Params.Inst.otherPosition);
      a.uniform1f(h.uniform.uSize, 0.5);
      a.uniform4fv(h.uniform.uColor, [e.r, e.g, e.b, e.a]);
      a.bindBuffer(a.ARRAY_BUFFER, r);
      a.drawArrays(a.TRIANGLES, 0, 6);
    };
    d.init = function (a) {
      h = b.createShaderProgram(
        a,
        "\n        #version 100\n        #pragma vscode_glsllint_stage : vert\n        precision highp float;\n\n        varying vec4 fragColor;\n\n        attribute vec2 aPosition;\n\n        uniform vec4 uColor;\n\n        uniform mat4 uModelViewMat;\n        uniform mat4 uProjectionMat;\n\n        uniform vec3 uPosition;\n        uniform float uSize;\n\n        void main(void) {\n            vec4 position  \x3d vec4(uPosition.x + 0.5, -uPosition.z, uPosition.y + 0.5, 1.0);\n            position      +\x3d vec4(aPosition.x * uSize, 0.0, aPosition.y * uSize, 0.0);\n\n            gl_Position    \x3d uProjectionMat * uModelViewMat * position;\n            gl_Position.z -\x3d 0.01;\n            fragColor \x3d uColor;\n        }\n    ",
        "\n        #version 100\n        #pragma vscode_glsllint_stage : vert\n        precision highp float;\n\n        varying vec4 fragColor;\n\n        void main(void) {\n                gl_FragColor \x3d fragColor;\n        }\n    ",
      );
      r = a.createBuffer();
      a.bindBuffer(a.ARRAY_BUFFER, r);
      a.bufferData(
        a.ARRAY_BUFFER,
        new Float32Array([
          -1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 0, 1, -1,
          -1, 0, 0,
        ]),
        a.STATIC_DRAW,
      );
      d.ready = !0;
    };
    d.renderBeforeEntities = !0;
    d.free = function (a) {
      h && (a.deleteProgram(h), (h = null));
      r && a.deleteBuffer(r);
      this.ready = !1;
    };
    d.beforeRender = function (a, b, c, d, e) {
      d = h.uniform;
      e = h.attribute;
      a.useProgram(h);
      a.uniformMatrix4fv(d.uModelViewMat, !1, b);
      a.uniformMatrix4fv(d.uProjectionMat, !1, c);
      a.enableVertexAttribArray(e.aPosition);
      a.bindBuffer(a.ARRAY_BUFFER, r);
      a.vertexAttribPointer(e.aPosition, 2, a.FLOAT, !1, 16, 0);
    };
    d.afterRender = function (a) {
      a.disableVertexAttribArray(h.attribute.aPosition);
    };
    return d;
  };
});
