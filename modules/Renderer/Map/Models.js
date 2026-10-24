define("Renderer/Map/Models", ["Utils/WebGL"], function (a) {
  var b = null,
    c = null,
    d = [];
  return {
    init: function (e, m) {
      function h(a, b) {
        d[b].texture = a;
        d[b].complete = !0;
      }
      var r, q;
      q = m.infos.length;
      d.length = q;
      c || (c = e.createBuffer());
      b ||
        (b = a.createShaderProgram(
          e,
          "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\n\t\tattribute vec3 aPosition;\n\t\tattribute vec3 aVertexNormal;\n\t\tattribute vec2 aTextureCoord;\n\t\tattribute float aAlpha;\n\n\t\tvarying vec2 vTextureCoord;\n\t\tvarying float vLightWeighting;\n\t\tvarying float vAlpha;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\n\t\tuniform vec3 uLightDirection;\n\t\tuniform mat3 uNormalMat;\n\n\t\tvoid main(void) {\n\t\t\tgl_Position     \x3d uProjectionMat * uModelViewMat * vec4( aPosition, 1.0);\n\n\t\t\tvTextureCoord   \x3d aTextureCoord;\n\t\t\tvAlpha          \x3d aAlpha;\n\n\t\t\tvec4 lDirection  \x3d uModelViewMat * vec4( uLightDirection, 0.0);\n\t\t\tvec3 dirVector   \x3d normalize(lDirection.xyz);\n\t\t\tfloat dotProduct \x3d dot( uNormalMat * aVertexNormal, dirVector );\n\t\t\tvLightWeighting  \x3d max( dotProduct, 0.5 );\n\t\t}\n\t",
          "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\n\t\tvarying vec2 vTextureCoord;\n\t\tvarying float vLightWeighting;\n\t\tvarying float vAlpha;\n\n\t\tuniform sampler2D uDiffuse;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tuniform vec3  uLightAmbient;\n\t\tuniform vec3  uLightDiffuse;\n\t\tuniform float uLightOpacity;\n\n\t\tvoid main(void) {\n\t\t\tvec4 texture  \x3d texture2D( uDiffuse,  vTextureCoord.st );\n\n\t\t\tif (texture.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\n\t\t\tvec3 Ambient    \x3d uLightAmbient * uLightOpacity;\n\t\t\tvec3 Diffuse    \x3d uLightDiffuse * vLightWeighting;\n\t\t\tvec4 LightColor \x3d vec4( Ambient + Diffuse, 1.0);\n\n\t\t\tgl_FragColor    \x3d texture * 0.2 + texture * clamp(LightColor, 0.0, 1.0);\n\t\t\tgl_FragColor.a *\x3d vAlpha;\n\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
        ));
      e.bindBuffer(e.ARRAY_BUFFER, c);
      e.bufferData(e.ARRAY_BUFFER, m.buffer, e.STATIC_DRAW);
      for (r = 0; r < q; ++r)
        (d[r] || (d[r] = {}),
          (d[r].vertCount = m.infos[r].vertCount),
          (d[r].vertOffset = m.infos[r].vertOffset),
          (d[r].complete = !1),
          a.texture(e, m.infos[r].texture, h, r));
    },
    render: function (a, m, h, r, q, k) {
      var e = b.uniform,
        t = b.attribute;
      a.useProgram(b);
      a.uniformMatrix4fv(e.uModelViewMat, !1, m);
      a.uniformMatrix4fv(e.uProjectionMat, !1, h);
      a.uniformMatrix3fv(e.uNormalMat, !1, r);
      a.uniform3fv(e.uLightDirection, k.direction);
      a.uniform1f(e.uLightOpacity, k.opacity);
      a.uniform3fv(e.uLightAmbient, k.ambient);
      a.uniform3fv(e.uLightDiffuse, k.diffuse);
      a.uniform1i(e.uFogUse, q.use && q.exist);
      a.uniform1f(e.uFogNear, q.near);
      a.uniform1f(e.uFogFar, q.far);
      a.uniform3fv(e.uFogColor, q.color);
      a.enableVertexAttribArray(t.aPosition);
      a.enableVertexAttribArray(t.aVertexNormal);
      a.enableVertexAttribArray(t.aTextureCoord);
      a.enableVertexAttribArray(t.aAlpha);
      a.bindBuffer(a.ARRAY_BUFFER, c);
      a.vertexAttribPointer(t.aPosition, 3, a.FLOAT, !1, 36, 0);
      a.vertexAttribPointer(t.aVertexNormal, 3, a.FLOAT, !1, 36, 12);
      a.vertexAttribPointer(t.aTextureCoord, 2, a.FLOAT, !1, 36, 24);
      a.vertexAttribPointer(t.aAlpha, 1, a.FLOAT, !1, 36, 32);
      a.activeTexture(a.TEXTURE0);
      a.uniform1i(e.uDiffuse, 0);
      m = 0;
      for (h = d.length; m < h; ++m)
        d[m].complete &&
          (a.bindTexture(a.TEXTURE_2D, d[m].texture),
          a.drawArrays(a.TRIANGLES, d[m].vertOffset, d[m].vertCount));
      a.disableVertexAttribArray(t.aPosition);
      a.disableVertexAttribArray(t.aVertexNormal);
      a.disableVertexAttribArray(t.aTextureCoord);
      a.disableVertexAttribArray(t.aAlpha);
    },
    free: function (a) {
      var e, h;
      c && (a.deleteBuffer(c), (c = null));
      b && (a.deleteProgram(b), (b = null));
      e = 0;
      for (h = d.length; e < h; ++e) a.deleteTexture(d[e].texture);
      d.length = 0;
    },
  };
});
