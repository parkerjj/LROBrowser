define("Renderer/Effects/Tiles", [
  "exports",
  "Utils/WebGL",
  "Utils/Texture",
  "Utils/gl-matrix",
  "Core/Client",
], function (a, b, c, d, e) {
  function m(a) {
    return a && a.__esModule ? a : { default: a };
  }
  function h(a, b, c) {
    var d = a.createTexture();
    k.default.loadFile(b.filename, function (e) {
      q.default.load(e, function (e) {
        var f = b.size;
        e = document.createElement("canvas");
        e.width = e.height = f;
        var g = e.getContext("2d");
        g.save();
        g.translate(e.width / 2, e.height / 2);
        g.rotate(Math.PI);
        g.translate(-e.width / 2, -e.height / 2);
        g.drawImage(this, 0, 0, f, f);
        g.restore();
        a.bindTexture(a.TEXTURE_2D, d);
        a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, e);
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR);
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
        c(d);
      });
    });
  }
  Object.defineProperty(a, "__esModule", { value: !0 });
  a.HoveringTexture =
    a.FlatTexture =
    a.flatTextureFragmentShader =
    a.flatTextureVertexShader =
      void 0;
  a.loadTexture = h;
  var r = m(b),
    q = m(c);
  m(d);
  var k = m(e),
    g = (a.flatTextureVertexShader =
      "\n        #version 100\n        #pragma vscode_glsllint_stage : vert\n        precision highp float;\n\n        attribute vec2 aPosition;\n        attribute vec2 aTextureCoord;\n        varying vec2 vTextureCoord;\n        uniform mat4 uModelViewMat;\n        uniform mat4 uProjectionMat;\n        uniform vec3 uPosition;\n\t\t    uniform float uSize;\n\t\t\n\n        void main(void) {\n            vec4 position  \x3d vec4(uPosition.x + 0.5, -uPosition.z, uPosition.y + 0.5, 1.0);\n            position      +\x3d vec4(aPosition.x * uSize, 0.0, aPosition.y * uSize, 0.0);\n            gl_Position    \x3d uProjectionMat * uModelViewMat * position;\n            gl_Position.z -\x3d 0.01;\n            vTextureCoord  \x3d aTextureCoord;\n        }\n"),
    t = (a.flatTextureFragmentShader =
      "\n        #version 100\n        #pragma vscode_glsllint_stage : frag\n        precision highp float;\n        \n        varying vec2 vTextureCoord;\n        uniform sampler2D uDiffuse;\n        uniform float alpha;\n        \n        uniform bool  uFogUse;\n        uniform float uFogNear;\n        uniform float uFogFar;\n        uniform vec3  uFogColor;\n        \n            void main(void) {\n                vec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\n                if (texture.r \x3c 0.1 || texture.g \x3c 0.1 || texture.b \x3c 0.1) {\n                  discard;\n                }\n                texture.a \x3d alpha;\n                gl_FragColor \x3d texture;\n          \n          if (uFogUse) {\n            float depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n            float fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n            gl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n          }\n        }\n"),
    l = (a.FlatTexture = function (a) {
      var b =
        1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 64;
      return (function () {
        function c(a) {
          _classCallCheck(this, c);
          this.position = a.otherPosition;
        }
        _createClass(c, null, [
          {
            key: "createShaderProgram",
            value: function (a) {
              return r.default.createShaderProgram(a, g, t);
            },
          },
          {
            key: "init",
            value: function (c) {
              var d = this;
              this._program = this.createShaderProgram(c);
              this._buffer = c.createBuffer();
              this._texture = null;
              c.bindBuffer(c.ARRAY_BUFFER, this._buffer);
              c.bufferData(
                c.ARRAY_BUFFER,
                new Float32Array([
                  -1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 0,
                  1, -1, -1, 0, 0,
                ]),
                c.STATIC_DRAW,
              );
              h(c, { filename: a, size: b }, function (a) {
                d._texture = a;
                d.ready = !0;
              });
            },
          },
          {
            key: "free",
            value: function (a) {
              this._texture &&
                (a.deleteTexture(this._texture), (this._texture = null));
              this._program &&
                (a.deleteProgram(this._program), (this._program = null));
              this._buffer &&
                (a.deleteBuffer(this._buffer), (this._buffer = null));
              this.ready = !1;
            },
          },
          {
            key: "beforeRender",
            value: function (a, b, c, d, e) {
              e = this._program.uniform;
              var f = this._program.attribute;
              a.useProgram(this._program);
              a.uniformMatrix4fv(e.uModelViewMat, !1, b);
              a.uniformMatrix4fv(e.uProjectionMat, !1, c);
              a.activeTexture(a.TEXTURE0);
              a.bindTexture(a.TEXTURE_2D, this._texture);
              a.uniform1i(e.uDiffuse, 0);
              a.uniform1i(e.uFogUse, d.use && d.exist);
              a.uniform1f(e.uFogNear, d.near);
              a.uniform1f(e.uFogFar, d.far);
              a.uniform3fv(e.uFogColor, d.color);
              a.enableVertexAttribArray(f.aPosition);
              a.enableVertexAttribArray(f.aTextureCoord);
              a.bindBuffer(a.ARRAY_BUFFER, this._buffer);
              a.vertexAttribPointer(f.aPosition, 2, a.FLOAT, !1, 16, 0);
              a.vertexAttribPointer(f.aTextureCoord, 2, a.FLOAT, !1, 16, 8);
              a.depthMask(!1);
            },
          },
          {
            key: "afterRender",
            value: function (a) {
              a.depthMask(!0);
              a.disableVertexAttribArray(this._program.attribute.aPosition);
              a.disableVertexAttribArray(this._program.attribute.aTextureCoord);
            },
          },
          {
            key: "renderBeforeEntities",
            get: function () {
              return !0;
            },
          },
        ]);
        _createClass(c, [
          {
            key: "init",
            value: function () {
              this.ready = !0;
            },
          },
          {
            key: "free",
            value: function () {
              this.ready = !1;
            },
          },
          {
            key: "render",
            value: function (a, b) {
              a.uniform3fv(
                this.constructor._program.uniform.uPosition,
                this._Params.Inst.otherPosition,
              );
              a.bindBuffer(a.ARRAY_BUFFER, this.constructor._buffer);
              a.drawArrays(a.TRIANGLES, 0, 6);
            },
          },
        ]);
        return c;
      })();
    }),
    f = 0;
  a.HoveringTexture = function (a) {
    var b = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 1,
      c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 1;
    return (function (a) {
      function d() {
        _classCallCheck(this, d);
        var a = _possibleConstructorReturn(
          this,
          (d.__proto__ || Object.getPrototypeOf(d)).apply(this, arguments),
        );
        a.ix = ++f;
        a.effectSize = b;
        a.alpha = c;
        return a;
      }
      _inherits(d, a);
      _createClass(d, [
        {
          key: "render",
          value: function (a, b) {
            a.uniform3fv(this.constructor._program.uniform.uPosition, [
              this._Params.Inst.otherPosition[0],
              this._Params.Inst.otherPosition[1],
              this._Params.Inst.otherPosition[2] +
                0.4 -
                0.2 *
                  Math.sin(
                    (0 === this.ix % 2 ? Math.PI : 0) + b / (540 * Math.PI),
                  ),
            ]);
            a.uniform1f(
              this.constructor._program.uniform.uSize,
              this.effectSize,
            );
            a.uniform1f(this.constructor._program.uniform.alpha, this.alpha);
            a.bindBuffer(a.ARRAY_BUFFER, this.constructor._buffer);
            a.drawArrays(a.TRIANGLES, 0, 6);
          },
        },
      ]);
      return d;
    })(l(a));
  };
});
