define("Renderer/Map/Ground", [
  "Utils/WebGL",
  "Utils/Texture",
  "Preferences/Map",
], function (a, b, c) {
  function d(c, d) {
    function f(a, b) {
      a &&
        ((a = (b % p) * 258),
        (b = 258 * Math.floor(b / p)),
        m.drawImage(this, a + 0, b + 0, 258, 258),
        m.drawImage(this, a + 1, b + 1, 256, 256));
      ++n === g &&
        ((b = h),
        r || (r = c.createTexture()),
        c.bindTexture(c.TEXTURE_2D, r),
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, b),
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR),
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR),
        c.generateMipmap(c.TEXTURE_2D));
    }
    var e, g, l, p, n, h, m;
    g = d.length;
    p = Math.round(Math.sqrt(g));
    e = a.toPowerOfTwo(258 * p);
    l = a.toPowerOfTwo(258 * Math.ceil(Math.sqrt(g)));
    h = document.createElement("canvas");
    h.width = e;
    h.height = l;
    m = h.getContext("2d");
    for (e = n = 0; e < g; ++e) b.load(d[e], f, e);
  }
  var e = null,
    m = null,
    h = null,
    t = null,
    r = null,
    n = null,
    g = 0,
    p = 0;
  return {
    init: function (b, c) {
      g = c.meshVertCount;
      p = c.width;
      n = c.shadowMap;
      m || (m = b.createBuffer());
      e ||
        (e = a.createShaderProgram(
          b,
          "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\n\t\tattribute vec3 aPosition;\n\t\tattribute vec3 aVertexNormal;\n\t\tattribute vec2 aTextureCoord;\n\t\tattribute vec2 aLightmapCoord;\n\t\tattribute vec2 aTileColorCoord;\n\n\t\tvarying vec2 vTextureCoord;\n\t\tvarying vec2 vLightmapCoord;\n\t\tvarying vec2 vTileColorCoord;\n\t\tvarying float vLightWeighting;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\n\t\tuniform vec3 uLightDirection;\n\t\tuniform mat3 uNormalMat;\n\n\t\tvoid main(void) {\n\t\t\tgl_Position     \x3d uProjectionMat * uModelViewMat * vec4( aPosition, 1.0);\n\n\t\t\tvTextureCoord   \x3d aTextureCoord;\n\t\t\tvLightmapCoord  \x3d aLightmapCoord;\n\t\t\tvTileColorCoord \x3d aTileColorCoord;\n\n\t\t\tvec4 lDirection  \x3d uModelViewMat * vec4( uLightDirection, 0.0);\n\t\t\tvec3 dirVector   \x3d normalize(lDirection.xyz);\n\t\t\tfloat dotProduct \x3d dot( uNormalMat * aVertexNormal, dirVector );\n\t\t\tvLightWeighting  \x3d max( dotProduct, 0.1 );\n\t\t}\n\t",
          "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\n\t\tvarying vec2 vTextureCoord;\n\t\tvarying vec2 vLightmapCoord;\n\t\tvarying vec2 vTileColorCoord;\n\t\tvarying float vLightWeighting;\n\n\t\tuniform sampler2D uDiffuse;\n\t\tuniform sampler2D uLightmap;\n\t\tuniform sampler2D uTileColor;\n\t\tuniform bool uLightMapUse;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tuniform vec3  uLightAmbient;\n\t\tuniform vec3  uLightDiffuse;\n\t\tuniform float uLightOpacity;\n\n\t\tvoid main(void) {\n\n\t\t\tvec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\n\t\t\tfloat lightWeight \x3d 1.0;\n\n\t\t\tif (texture.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\n\t\t\tif (vTileColorCoord.st !\x3d vec2(0.0,0.0)) {\n\t\t\t\ttexture    *\x3d texture2D( uTileColor, vTileColorCoord.st);\n\t\t\t\tlightWeight \x3d vLightWeighting;\n\t\t\t}\n\n\t\t\tvec3 Ambient    \x3d uLightAmbient * uLightOpacity;\n\t\t\tvec3 Diffuse    \x3d uLightDiffuse * lightWeight;\n\n\t\t\tif (uLightMapUse) {\n\t\t\t\tvec4 lightmap   \x3d texture2D( uLightmap, vLightmapCoord.st);\n\t\t\t\tvec4 LightColor \x3d vec4( (Ambient + Diffuse) * (1.0, 1.0, 0.8) * lightmap.a, 1.0);\n\t\t\t\tvec4 ColorMap   \x3d vec4( lightmap.rgb, 0.0 );\n\n\t\t\t\tgl_FragColor    \x3d texture * 0.05 + texture * clamp(LightColor, 0.0, 1.0) + ColorMap;\n\t\t\t}\n\t\t\telse {\n\t\t\t\tvec4 LightColor \x3d vec4( Ambient + Diffuse, 1.0);\n\t\t\t\tgl_FragColor    \x3d texture * clamp(LightColor, 0.0, 1.0);\n\t\t\t}\n\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
        ));
      b.bindBuffer(b.ARRAY_BUFFER, m);
      b.bufferData(b.ARRAY_BUFFER, c.mesh, b.STATIC_DRAW);
      var f = c.lightmap,
        q = c.lightmapSize,
        l;
      l = a.toPowerOfTwo(8 * Math.round(Math.sqrt(q)));
      q = a.toPowerOfTwo(8 * Math.ceil(Math.sqrt(q)));
      h || (h = b.createTexture());
      b.bindTexture(b.TEXTURE_2D, h);
      b.texImage2D(
        b.TEXTURE_2D,
        0,
        b.RGBA,
        l,
        q,
        0,
        b.RGBA,
        b.UNSIGNED_BYTE,
        f,
      );
      b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MAG_FILTER, b.LINEAR);
      b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MIN_FILTER, b.LINEAR);
      b.generateMipmap(b.TEXTURE_2D);
      var v = c.tileColor,
        A = c.width,
        q = c.height,
        C,
        B,
        r,
        D,
        f = document.createElement("canvas");
      f.width = A;
      f.height = q;
      l = f.getContext("2d");
      r = l.createImageData(A, q);
      D = r.data;
      B = D.length;
      for (C = 0; C < B; ++C) D[C] = v[C];
      l.putImageData(r, 0, 0);
      v = a.toPowerOfTwo(A);
      q = a.toPowerOfTwo(q);
      A = document.createElement("canvas");
      A.width = v;
      A.height = q;
      l = A.getContext("2d");
      l.fillStyle = "black";
      l.fillRect(0, 0, v, q);
      l.drawImage(f, 0, 0, v, q);
      t || (t = b.createTexture());
      b.bindTexture(b.TEXTURE_2D, t);
      b.texImage2D(b.TEXTURE_2D, 0, b.RGBA, b.RGBA, b.UNSIGNED_BYTE, A);
      b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MAG_FILTER, b.LINEAR);
      b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MIN_FILTER, b.LINEAR);
      b.generateMipmap(b.TEXTURE_2D);
      d(b, c.textures);
    },
    free: function (a) {
      h && (a.deleteTexture(h), (h = null));
      t && (a.deleteTexture(t), (t = null));
      r && (a.deleteTexture(r), (r = null));
      m && (a.deleteBuffer(m), (m = null));
      n = null;
      g = 0;
    },
    render: function (a, b, d, q, p, n, A) {
      var f = e.uniform,
        k = e.attribute;
      a.useProgram(e);
      a.uniformMatrix4fv(f.uModelViewMat, !1, b);
      a.uniformMatrix4fv(f.uProjectionMat, !1, d);
      a.uniformMatrix3fv(f.uNormalMat, !1, q);
      a.uniform3fv(f.uLightDirection, n.direction);
      a.uniform1f(f.uLightOpacity, n.opacity);
      a.uniform3fv(f.uLightAmbient, n.ambient);
      a.uniform3fv(f.uLightDiffuse, n.diffuse);
      a.uniform1i(f.uLightMapUse, c.lightmap);
      a.uniform1i(f.uFogUse, p.use && p.exist);
      a.uniform1f(f.uFogNear, p.near);
      a.uniform1f(f.uFogFar, p.far);
      a.uniform3fv(f.uFogColor, p.color);
      a.enableVertexAttribArray(k.aPosition);
      a.enableVertexAttribArray(k.aVertexNormal);
      a.enableVertexAttribArray(k.aTextureCoord);
      a.enableVertexAttribArray(k.aLightmapCoord);
      a.enableVertexAttribArray(k.aTileColorCoord);
      a.bindBuffer(a.ARRAY_BUFFER, m);
      a.vertexAttribPointer(k.aPosition, 3, a.FLOAT, !1, 48, 0);
      a.vertexAttribPointer(k.aVertexNormal, 3, a.FLOAT, !1, 48, 12);
      a.vertexAttribPointer(k.aTextureCoord, 2, a.FLOAT, !1, 48, 24);
      a.vertexAttribPointer(k.aLightmapCoord, 2, a.FLOAT, !1, 48, 32);
      a.vertexAttribPointer(k.aTileColorCoord, 2, a.FLOAT, !1, 48, 40);
      a.activeTexture(a.TEXTURE0);
      a.bindTexture(a.TEXTURE_2D, r);
      a.uniform1i(f.uDiffuse, 0);
      a.activeTexture(a.TEXTURE1);
      a.bindTexture(a.TEXTURE_2D, h);
      a.uniform1i(f.uLightmap, 1);
      a.activeTexture(a.TEXTURE2);
      a.bindTexture(a.TEXTURE_2D, t);
      a.uniform1i(f.uTileColor, 2);
      A ? a.drawArrays(a.LINES, 0, g) : a.drawArrays(a.TRIANGLES, 0, g);
      a.disableVertexAttribArray(k.aPosition);
      a.disableVertexAttribArray(k.aVertexNormal);
      a.disableVertexAttribArray(k.aTextureCoord);
      a.disableVertexAttribArray(k.aLightmapCoord);
      a.disableVertexAttribArray(k.aTileColorCoord);
    },
    getShadowFactor: function (a, b) {
      if (!n) return 1;
      var c,
        d,
        f = 0;
      a += 0.5;
      b += 0.5;
      c = 8 * Math.floor(a / 2);
      d = 8 * Math.floor(b / 2);
      c += Math.min((a & 1 ? 4 : 0) + Math.floor((a % 1) * 4), 6);
      d += Math.min((b & 1 ? 4 : 0) + Math.floor((b % 1) * 4), 6);
      for (b = -3; 3 > b; ++b)
        for (a = -3; 3 > a; ++a) f += n[c + a + (d + b) * p * 8];
      return f / 36 / 255;
    },
  };
});
