define("Renderer/Effects/SpiderWeb", [
  "exports",
  "Utils/WebGL",
  "Renderer/Effects/Tiles",
], function (a, b, c) {
  Object.defineProperty(a, "__esModule", { value: !0 });
  var d = b && b.__esModule ? b : { default: b },
    e = 0;
  return (function (a) {
    function b() {
      _classCallCheck(this, b);
      var a = _possibleConstructorReturn(
        this,
        (b.__proto__ || Object.getPrototypeOf(b)).apply(this, arguments),
      );
      a.ix = ++e;
      return a;
    }
    _inherits(b, a);
    _createClass(b, null, [
      {
        key: "createShaderProgram",
        value: function (a) {
          return d.default.createShaderProgram(
            a,
            "\n        #version 100\n        #pragma vscode_glsllint_stage : vert\n        precision highp float;\n\n        attribute vec2 aPosition;\n        attribute vec2 aTextureCoord;\n\n        varying vec2 vTextureCoord;\n\n        uniform mat4 uModelViewMat;\n        uniform mat4 uProjectionMat;\n        uniform vec3 uPosition;\n        uniform float uSize;\n\n        void main(void) {\n            vec4 position  \x3d vec4(uPosition.x + 0.5, -uPosition.z, uPosition.y + 0.5, 1.0);\n            position      +\x3d vec4(aPosition.x * uSize, 0.0, aPosition.y * uSize, 0.0);\n            gl_Position    \x3d uProjectionMat * uModelViewMat * position;\n            gl_Position.z -\x3d 0.01;\n            vTextureCoord  \x3d aTextureCoord;\n        }\n",
            "\n        #version 100\n        #pragma vscode_glsllint_stage : frag\n        precision highp float;\n\n        varying vec2 vTextureCoord;\n\n        uniform sampler2D uDiffuse;\n\n        void main(void) {\n            vec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\n            if (texture.r \x3c 0.5 || texture.g \x3c 0.5 || texture.b \x3c 0.5) {\n               discard;\n            }\n            texture.a \x3d 0.7;\n            gl_FragColor \x3d texture;\n        }\n",
          );
        },
      },
    ]);
    _createClass(b, [
      {
        key: "render",
        value: function (a, b) {
          b = Math.sin((0 === this.ix % 2 ? Math.PI : 0) + b / (540 * Math.PI));
          a.uniform3fv(
            this.constructor._program.uniform.uPosition,
            this._Params.Inst.position,
          );
          a.uniform1f(this.constructor._program.uniform.uSize, 1.5 + 0.05 * b);
          a.bindBuffer(a.ARRAY_BUFFER, this.constructor._buffer);
          a.drawArrays(a.TRIANGLES, 0, 6);
        },
      },
    ]);
    return b;
  })((0, c.FlatTexture)("data/texture/effect/spiderweb.tga", 128));
});
