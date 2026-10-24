define("Renderer/Map/Water", ["Utils/WebGL"], function (a) {
  var b = null,
    c = null,
    d = 0,
    e = Array(32),
    m = 0,
    h = 0,
    r = 0,
    q = 0,
    k = 0.6;
  return {
    init: function (g, t) {
      function l(a, b) {
        e[b] = a;
      }
      var f;
      d = t.vertCount;
      h = t.waveHeight;
      m = t.waveSpeed;
      q = t.animSpeed;
      r = t.wavePitch;
      k = 4 !== t.type && 6 !== t.type ? 0.6 : 1;
      if (d)
        for (
          b ||
            (b = a.createShaderProgram(
              g,
              "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\n\t\tattribute vec3 aPosition;\n\t\tattribute vec2 aTextureCoord;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\n\t\tuniform float uWaveHeight;\n\t\tuniform float uWavePitch;\n\t\tuniform float uWaterOffset;\n\n\t\tconst float PI \x3d 3.14159265358979323846264;\n\n\t\tvoid main(void) {\n\t\t\tfloat x       \x3d mod( aPosition.x, 2.0);\n\t\t\tfloat y       \x3d mod( aPosition.z, 2.0);\n\t\t\tfloat diff    \x3d x \x3c 1.0 ? y \x3c 1.0 ? 1.0 : -1.0 : 0.0;\n\t\t\tfloat Height  \x3d sin((PI / 180.0) * (uWaterOffset + 0.5 * uWavePitch * (aPosition.x + aPosition.z + diff))) * uWaveHeight;\n\n\t\t\tgl_Position   \x3d uProjectionMat * uModelViewMat * vec4( aPosition.x, aPosition.y + Height, aPosition.z, 1.0);\n\t\t\tvTextureCoord \x3d aTextureCoord;\n\t\t}\n\t",
              "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\t\t\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform sampler2D uDiffuse;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tuniform vec3  uLightAmbient;\n\t\tuniform vec3  uLightDiffuse;\n\t\tuniform float uLightOpacity;\n\n\t\tuniform float uOpacity;\n\n\t\tvoid main(void) {\n\t\t\t\n\t\t\tvec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\n\t\t\ttexture.a \x3d uOpacity;\n\t\t\t\n\t\t\tif (texture.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\t\t\t\n\t\t\ttexture.a *\x3d uOpacity;\n\t\t\t\n\t\t\tgl_FragColor   \x3d texture;\n\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
            )),
            c = g.createBuffer(),
            g.bindBuffer(g.ARRAY_BUFFER, c),
            g.bufferData(g.ARRAY_BUFFER, t.mesh, g.STATIC_DRAW),
            f = 0;
          32 > f;
          ++f
        )
          a.texture(g, t.images[f], l, f);
    },
    free: function (a) {
      var d;
      c && (a.deleteBuffer(c), (c = null));
      b && (a.deleteProgram(b), (b = null));
      for (d = 0; 32 > d; ++d) e[d] && (a.deleteTexture(e[d]), (e[d] = null));
    },
    render: function (a, t, l, f, n, p) {
      if (d) {
        n = b.uniform;
        var g = b.attribute;
        p /= 1e3 / 60;
        a.useProgram(b);
        a.uniformMatrix4fv(n.uModelViewMat, !1, t);
        a.uniformMatrix4fv(n.uProjectionMat, !1, l);
        a.uniform1i(n.uFogUse, f.use && f.exist);
        a.uniform1f(n.uFogNear, f.near);
        a.uniform1f(n.uFogFar, f.far);
        a.uniform3fv(n.uFogColor, f.color);
        a.enableVertexAttribArray(g.aPosition);
        a.enableVertexAttribArray(g.aTextureCoord);
        a.bindBuffer(a.ARRAY_BUFFER, c);
        a.vertexAttribPointer(g.aPosition, 3, a.FLOAT, !1, 20, 0);
        a.vertexAttribPointer(g.aTextureCoord, 2, a.FLOAT, !1, 20, 12);
        a.activeTexture(a.TEXTURE0);
        a.uniform1i(n.uDiffuse, 0);
        a.uniform1f(n.uWaveHeight, h);
        a.uniform1f(n.uOpacity, k);
        a.uniform1f(n.uWavePitch, r);
        a.uniform1f(n.uWaterOffset, ((p * m) % 360) - 180);
        a.bindTexture(a.TEXTURE_2D, e[((p / q) % 32) | 0]);
        a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
        a.drawArrays(a.TRIANGLES, 0, d);
        a.disableVertexAttribArray(g.aPosition);
        a.disableVertexAttribArray(g.aTextureCoord);
      }
    },
  };
});
