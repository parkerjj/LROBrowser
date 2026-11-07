define(
  "Renderer/Effects/RsmViewer",
  "require Utils/WebGL Utils/Texture Utils/gl-matrix Core/Client Core/Configs Renderer/Renderer Renderer/Camera Loaders/Model Renderer/Map/Models".split(
    " ",
  ),
  function (a) {
    function b(a, b, c) {
      this.filename = a.filename;
      this.position = b.position;
      this.size = a.size;
      this.height = a.height;
      this.tick = b.startTick;
      this._objects = [];
    }
    var c = a("Utils/WebGL");
    a("Utils/Texture");
    var d = a("Utils/gl-matrix"),
      e = a("Core/Client");
    a("Core/Configs");
    var m = a("Renderer/Renderer");
    a("Renderer/Camera");
    var h = a("Loaders/Model");
    a("Renderer/Map/Models");
    var r = d.mat4;
    new Float32Array([1, 1, 1]);
    var q = new Float32Array([1, 1, 1]),
      k = new Float32Array([0, 0, 0]),
      g = new Float32Array([0, 1, 0]),
      t = {
        position: new Float32Array(3),
        rotation: new Float32Array(3),
        scale: new Float32Array([-0.075, -0.075, 0.075]),
        filename: null,
      };
    new Float32Array(16);
    var l = new Float32Array(9),
      f = null,
      n = r.create();
    b.prototype.init = function (a) {
      var d = this;
      e.getFile(this.filename, function (g) {
        function l() {
          ++p === q
            ? (d._buffer || (d._buffer = a.createBuffer()),
              f ||
                (f = c.createShaderProgram(
                  a,
                  " \n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\t\t\n\t\tattribute vec3 aPosition;\n\t\tattribute vec3 aVertexNormal;\n\t\tattribute vec2 aTextureCoord;\n\t\tattribute float aAlpha;\n\n\t\tvarying vec2 vTextureCoord;\n\t\tvarying float vLightWeighting;\n\t\tvarying float vAlpha;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\t\tuniform mat4 uRotationMat;\n\n\t\tuniform vec3 uLightDirection;\n\t\tuniform mat3 uNormalMat;\n\t\n\t\tuniform vec3 uPosition;\n\t\tuniform float uSize;\n\t\tuniform float uHeight;\n\n\t\tvoid main(void) {\n\n\t\t\tvec4 position  \x3d vec4(uPosition.x + 0.5, -uPosition.z - uHeight, uPosition.y + 0.5, 1.0);\n\t\t\tposition      +\x3d vec4(aPosition.x * uSize, aPosition.z * uSize, aPosition.y * uSize, 0.0) * uRotationMat;\n\n\t\t\tgl_Position    \x3d uProjectionMat * uModelViewMat * position;\n\t\t\t\n\t\t\tvTextureCoord   \x3d aTextureCoord;\n\t\t\tvAlpha          \x3d aAlpha;\n\n\t\t\tvec4 lDirection  \x3d uModelViewMat * vec4( uLightDirection, 0.0);\n\t\t\tvec3 dirVector   \x3d normalize(lDirection.xyz);\n\t\t\tfloat dotProduct \x3d dot( uNormalMat * aVertexNormal, dirVector );\n\t\t\tvLightWeighting  \x3d max( dotProduct, 0.5 );\n\t\t}\n\t",
                  " \n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\t\t\n\t\tvarying vec2 vTextureCoord;\n\t\tvarying float vLightWeighting;\n\t\tvarying float vAlpha;\n\n\t\tuniform sampler2D uDiffuse;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tuniform vec3  uLightAmbient;\n\t\tuniform vec3  uLightDiffuse;\n\t\tuniform float uLightOpacity;\n\n\t\tvoid main(void) {\n\t\t\tvec4 texture  \x3d texture2D( uDiffuse,  vTextureCoord.st );\n\n\t\t\tif (texture.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\n\t\t\tvec3 Ambient    \x3d uLightAmbient * uLightOpacity;\n\t\t\tvec3 Diffuse    \x3d uLightDiffuse * vLightWeighting;\n\t\t\tvec4 LightColor \x3d vec4( Ambient + Diffuse, 1.0);\n\n\t\t\tgl_FragColor    \x3d texture * clamp(LightColor, 0.0, 1.0);\n\t\t\tgl_FragColor.a *\x3d vAlpha;\n\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
                )),
              a.bindBuffer(a.ARRAY_BUFFER, d._buffer),
              a.bufferData(a.ARRAY_BUFFER, M, a.STATIC_DRAW),
              b.add(m.getContext(), { buffer: M, infos: I }, d._objects),
              (d.ready = !0))
            : e.loadFile(
                I[p].texture,
                function (a) {
                  I[p].texture = a;
                  l();
                },
                l,
              );
        }
        var k = new h(g),
          n,
          p,
          q,
          r,
          u,
          v;
        g = [];
        var I = [],
          L,
          x,
          M;
        k.createInstance(t, 0, 0);
        n = k.compile();
        q = n.meshes.length;
        p = v = 0;
        for (q = n.meshes.length; p < q; ++p)
          for (
            L = n.meshes[p], x = Object.keys(L), r = 0, u = x.length;
            r < u;
            ++r
          )
            (g.push({
              texture: n.textures[x[r]],
              alpha: k.alpha,
              mesh: L[x[r]],
            }),
              (v += L[x[r]].length));
        M = new Float32Array(v);
        q = g.length;
        for (p = k = 0; p < q; ++p)
          ((r = g[p]),
            (n = r.mesh.length),
            (I[p] = {
              texture: "data/texture/" + r.texture,
              vertOffset: k / 9,
              vertCount: n / 9,
            }),
            M.set(r.mesh, k),
            (k += n));
        p = -1;
        l();
      });
    };
    b.add = function (a, b, d) {
      function e(a, b) {
        d[b].texture = a;
        d[b].complete = !0;
      }
      var f, g;
      g = b.infos.length;
      d.length = g;
      for (f = 0; f < g; ++f)
        (d[f] || (d[f] = {}),
          (d[f].vertCount = b.infos[f].vertCount),
          (d[f].vertOffset = b.infos[f].vertOffset),
          (d[f].complete = !1),
          c.texture(a, b.infos[f].texture, e, f));
    };
    b.prototype.free = function (a) {
      this._buffer && (a.deleteBuffer(this._buffer), (this._buffer = null));
      this.ready = !1;
    };
    b.prototype.render = function (a, b, c, d, e) {
      b = f.uniform;
      c = f.attribute;
      d = 0;
      for (e = this._objects.length; d < e; ++d)
        this._objects[d].complete &&
          (a.bindTexture(a.TEXTURE_2D, this._objects[d].texture),
          a.enableVertexAttribArray(c.aPosition),
          a.enableVertexAttribArray(c.aVertexNormal),
          a.enableVertexAttribArray(c.aTextureCoord),
          a.enableVertexAttribArray(c.aAlpha),
          a.bindBuffer(a.ARRAY_BUFFER, this._buffer),
          a.vertexAttribPointer(c.aPosition, 3, a.FLOAT, !1, 36, 0),
          a.vertexAttribPointer(c.aVertexNormal, 3, a.FLOAT, !1, 36, 12),
          a.vertexAttribPointer(c.aTextureCoord, 2, a.FLOAT, !1, 36, 24),
          a.vertexAttribPointer(c.aAlpha, 1, a.FLOAT, !1, 36, 32),
          a.uniform3fv(b.uPosition, this.position),
          a.uniform1f(b.uSize, this.size),
          a.uniform1f(b.uHeight, this.height),
          a.drawArrays(
            a.TRIANGLES,
            this._objects[d].vertOffset,
            this._objects[d].vertCount,
          ));
      a.disableVertexAttribArray(f.attribute.aPosition);
      a.disableVertexAttribArray(f.attribute.aVertexNormal);
      a.disableVertexAttribArray(f.attribute.aTextureCoord);
      a.disableVertexAttribArray(f.attribute.aAlpha);
    };
    b.init = function (a) {
      f = c.createShaderProgram(
        a,
        " \n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\t\t\n\t\tattribute vec3 aPosition;\n\t\tattribute vec3 aVertexNormal;\n\t\tattribute vec2 aTextureCoord;\n\t\tattribute float aAlpha;\n\n\t\tvarying vec2 vTextureCoord;\n\t\tvarying float vLightWeighting;\n\t\tvarying float vAlpha;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\t\tuniform mat4 uRotationMat;\n\n\t\tuniform vec3 uLightDirection;\n\t\tuniform mat3 uNormalMat;\n\t\n\t\tuniform vec3 uPosition;\n\t\tuniform float uSize;\n\t\tuniform float uHeight;\n\n\t\tvoid main(void) {\n\n\t\t\tvec4 position  \x3d vec4(uPosition.x + 0.5, -uPosition.z - uHeight, uPosition.y + 0.5, 1.0);\n\t\t\tposition      +\x3d vec4(aPosition.x * uSize, aPosition.z * uSize, aPosition.y * uSize, 0.0) * uRotationMat;\n\n\t\t\tgl_Position    \x3d uProjectionMat * uModelViewMat * position;\n\t\t\t\n\t\t\tvTextureCoord   \x3d aTextureCoord;\n\t\t\tvAlpha          \x3d aAlpha;\n\n\t\t\tvec4 lDirection  \x3d uModelViewMat * vec4( uLightDirection, 0.0);\n\t\t\tvec3 dirVector   \x3d normalize(lDirection.xyz);\n\t\t\tfloat dotProduct \x3d dot( uNormalMat * aVertexNormal, dirVector );\n\t\t\tvLightWeighting  \x3d max( dotProduct, 0.5 );\n\t\t}\n\t",
        " \n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\t\t\n\t\tvarying vec2 vTextureCoord;\n\t\tvarying float vLightWeighting;\n\t\tvarying float vAlpha;\n\n\t\tuniform sampler2D uDiffuse;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tuniform vec3  uLightAmbient;\n\t\tuniform vec3  uLightDiffuse;\n\t\tuniform float uLightOpacity;\n\n\t\tvoid main(void) {\n\t\t\tvec4 texture  \x3d texture2D( uDiffuse,  vTextureCoord.st );\n\n\t\t\tif (texture.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\n\t\t\tvec3 Ambient    \x3d uLightAmbient * uLightOpacity;\n\t\t\tvec3 Diffuse    \x3d uLightDiffuse * vLightWeighting;\n\t\t\tvec4 LightColor \x3d vec4( Ambient + Diffuse, 1.0);\n\n\t\t\tgl_FragColor    \x3d texture * clamp(LightColor, 0.0, 1.0);\n\t\t\tgl_FragColor.a *\x3d vAlpha;\n\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
      );
      this.ready = !0;
      this.renderBeforeEntities = !1;
    };
    b.beforeRender = function (a, b, c, d, e) {
      e = f.uniform;
      r.identity(n);
      r.rotateX(n, n, 1.5 * Math.PI);
      a.useProgram(f);
      a.uniformMatrix4fv(e.uModelViewMat, !1, b);
      a.uniformMatrix4fv(e.uProjectionMat, !1, c);
      a.uniformMatrix3fv(e.uNormalMat, !1, l);
      a.uniformMatrix4fv(e.uRotationMat, !1, n);
      a.uniform3fv(e.uLightDirection, g);
      a.uniform1f(e.uLightOpacity, 1);
      a.uniform3fv(e.uLightAmbient, q);
      a.uniform3fv(e.uLightDiffuse, k);
      a.uniform1i(e.uFogUse, d.use && d.exist);
      a.uniform1f(e.uFogNear, d.near);
      a.uniform1f(e.uFogFar, d.far);
      a.uniform3fv(e.uFogColor, d.color);
      a.activeTexture(a.TEXTURE0);
      a.uniform1i(f.uniform.uDiffuse, 0);
    };
    b.afterRender = function (a) {
      a.disableVertexAttribArray(f.attribute.aPosition);
      a.disableVertexAttribArray(f.attribute.aTextureCoord);
    };
    return b;
  },
);
