define(
  "Renderer/Effects/MagicTarget",
  "require Utils/WebGL Utils/Texture Utils/gl-matrix DB/Skills/SkillConst Core/Client Renderer/Map/Altitude Engine/SessionStorage".split(
    " ",
  ),
  function (a) {
    function b(a, b, c, d, e, f) {
      this.type = a;
      this.id = b;
      this.pos = c;
      this.offset = d;
      this.size = m[b] || 3;
      this.range = e;
      this.endLifeTime = f;
    }
    var c = a("Utils/WebGL"),
      d = a("Utils/Texture"),
      e = a("Utils/gl-matrix"),
      l = a("DB/Skills/SkillConst"),
      h = a("Core/Client"),
      r = a("Renderer/Map/Altitude"),
      t = a("Engine/SessionStorage"),
      n,
      g,
      p,
      k = e.mat4,
      f = k.create(),
      m = {};
    m[l.MG_SAFETYWALL] = [3];
    m[l.CR_SLIMPITCHER] = [7];
    m[l.SO_ARRULLO] = [3, 3, 5, 5, 7];
    m[l.AC_SHOWER] = [3, 3, 3, 3, 3, 5, 5, 5, 5, 5];
    m[l.NC_ARMSCANNON] = [7, 5, 3];
    m[l.AM_DEMONSTRATION] = [3];
    m[l.SC_BLOODYLUST] = [7];
    m[l.PF_FOGWALL] = [3];
    m[l.PR_BENEDICTIO] = [3];
    m[l.KO_ZENKAI] = [5];
    m[l.WL_CRIMSONROCK] = [7];
    m[l.GN_CRAZYWEED] = [9];
    m[l.NPC_COMET] = [3];
    m[l.WL_COMET] = [19];
    m[l.HT_CLAYMORETRAP] = [5];
    m[l.SC_CHAOSPANIC] = [5];
    m[l.RK_DRAGONBREATH_WATER] = [9];
    m[l.RK_DRAGONBREATH] = [9];
    m[l.SC_DIMENSIONDOOR] = [1];
    m[l.SO_DIAMONDDUST] = [9];
    m[l.HT_DETECTING] = [3];
    m[l.GN_DEMONIC_FIRE] = [5];
    m[l.SA_DELUGE] = [7];
    m[l.SO_VACUUM_EXTREME] = [3, 3, 5, 5, 7];
    m[l.NPC_EVILLAND] = [11];
    m[l.AB_EPICLESIS] = [5];
    m[l.SO_EARTH_INSIGNIA] = [3];
    m[l.SO_EARTHGRAVE] = [9];
    m[l.HT_FLASHER] = [3];
    m[l.MG_FIREWALL] = [3];
    m[l.RA_FIRINGTRAP] = [5];
    m[l.SO_FIRE_INSIGNIA] = [3];
    m[l.GN_FIRE_EXPANSION] = [5];
    m[l.GN_HELLS_PLANT] = [3];
    m[l.WZ_HEAVENDRIVE] = [5];
    m[l.HW_GRAVITATION] = [5];
    m[l.RL_HAMMER_OF_GOD] = [5];
    m[l.NPC_RAYOFGENESIS] = [3];
    m[l.LG_RAYOFGENESIS] = [11];
    m[l.HW_GANBANTEIN] = [3];
    m[l.NC_COLDSLOWER] = [5, 7, 9];
    m[l.WZ_VERMILION] = [11];
    m[l.SR_RIDEINLIGHTNING] = [3, 3, 5, 5, 7];
    m[l.NJ_RAIGEKISAI] = [3, 3, 5, 5, 7];
    m[l.MH_LAVA_SLIDE] = [3, 3, 3, 5, 5, 5, 7, 7, 7, 9];
    m[l.NPC_MAGMA_ERUPTION] = [3];
    m[l.NC_MAGMA_ERUPTION] = [7];
    m[l.KO_BAKURETSU] = [3];
    m[l.NPC_CLOUD_KILL] = [3];
    m[l.SO_CLOUD_KILL] = [7];
    m[l.WZ_METEOR] = [7];
    m[l.SC_MANHOLE] = [3];
    m[l.PR_MAGNUS] = [7];
    m[l.SA_LANDPROTECTOR] = [9];
    m[l.SC_MAELSTROM] = [5];
    m[l.KO_MUCHANAGE] = [3, 3, 3, 3, 3, 3, 3, 3, 5];
    m[l.WZ_QUAGMIRE] = [5];
    m[l.NPC_PSYCHIC_WAVE] = [3];
    m[l.SO_PSYCHIC_WAVE] = [7, 7, 9, 9, 11];
    m[l.GC_POISONSMOKE] = [5];
    m[l.MH_POISON_MIST] = [7];
    m[l.AL_PNEUMA] = [3];
    m[l.LG_OVERBRAND] = [3];
    m[l.WM_SEVERE_RAINSTORM] = [11];
    m[l.RG_GRAFFITI] = [5];
    m[l.PR_SANCTUARY] = [5];
    m[l.MG_THUNDERSTORM] = [5];
    m[l.WZ_STORMGUST] = [11];
    m[l.WM_SOUND_OF_DESTRUCTION] = [9, 9, 11, 13, 15];
    m[l.WM_POEMOFNETHERWORLD] = [3];
    m[l.MH_XENO_SLASHER] = [3, 3, 3, 5, 5, 5, 7, 7, 7, 9];
    m[l.SO_WIND_INSIGNIA] = [3];
    m[l.SA_VIOLENTGALE] = [7];
    m[l.NJ_SUITON] = [3, 3, 3, 5, 5, 5, 7, 7, 7, 9];
    m[l.SO_WATER_INSIGNIA] = [3];
    m[l.SO_WARMER] = [7];
    m[l.SA_VOLCANO] = [7];
    m[l.MH_VOLCANIC_ASH] = [3];
    m[l.AS_VENOMDUST] = [2];
    m[l.KO_HUUMARANKA] = [7];
    m[l.WL_COMET] = [26];
    b.prototype.init = function (a) {
      this.ready = !0;
    };
    b.prototype.free = function (a) {
      this.ready = !1;
    };
    b.prototype.render = function (a, b) {
      var c = 1;
      if (1 == this.type) {
        var d = new Float32Array(3);
        d[0] = this.pos[0];
        d[1] = this.pos[1];
        d[2] = r.getCellHeight(d[0], d[1]);
        a.uniform3fv(g.uniform.uPosition, d);
        a.uniform1f(g.uniform.uSize, this.size);
        a.uniform1f(g.uniform.uColor, c);
        a.drawArrays(a.TRIANGLES, 0, 6);
        this.needCleanUp = this.endLifeTime < b;
      } else {
        d = new Float32Array(3);
        d[0] = this.pos[0] + this.offset[0];
        d[1] = this.pos[1] + this.offset[1];
        d[2] = r.getCellHeight(d[0], d[1]);
        b = this.range + 1;
        var e = t.Entity.position[0] - d[0],
          f = t.Entity.position[1] - d[1];
        b * b <= e * e + f * f && (c = 0.2);
        a.uniform3fv(g.uniform.uPosition, d);
        a.uniform1f(g.uniform.uSize, this.size);
        a.uniform1f(g.uniform.uColor, c);
        a.drawArrays(a.TRIANGLES, 0, 6);
        this.needCleanUp = null;
      }
    };
    b.init = function (a) {
      g = c.createShaderProgram(
        a,
        " \n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\t\t\n\t\tattribute vec2 aPosition;\n\t\tattribute vec2 aTextureCoord;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\t\tuniform mat4 uRotationMat;\n\n\t\tuniform vec3 uPosition;\n\t\tuniform float uSize;\n\n\t\tvoid main(void) {\n\t\t\tvec4 position  \x3d vec4(uPosition.x + 0.5, -uPosition.z, uPosition.y + 0.5, 1.0);\n\t\t\tposition      +\x3d vec4(aPosition.x * uSize, 0.0, aPosition.y * uSize, 0.0) * uRotationMat;\n\n\t\t\tgl_Position    \x3d uProjectionMat * uModelViewMat * position;\n\t\t\tgl_Position.z -\x3d 0.02;\n\n\t\t\tvTextureCoord  \x3d aTextureCoord;\n\t\t}\n\t",
        " \n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\t\t\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform sampler2D uDiffuse;\n\t\tuniform float uColor;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tvoid main(void) {\n\t\t\tvec4 texture \x3d texture2D( uDiffuse,  vTextureCoord.st );\n\n\t\t\tif (texture.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\n\t\t\tgl_FragColor     \x3d texture;\n\t\t\tgl_FragColor.gb *\x3d uColor;\n\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
      );
      p = a.createBuffer();
      a.bindBuffer(a.ARRAY_BUFFER, p);
      a.bufferData(
        a.ARRAY_BUFFER,
        new Float32Array([
          -0.5, -0.5, 0, 0, 0.5, -0.5, 1, 0, 0.5, 0.5, 1, 1, 0.5, 0.5, 1, 1,
          -0.5, 0.5, 0, 1, -0.5, -0.5, 0, 0,
        ]),
        a.STATIC_DRAW,
      );
      h.loadFile("data/texture/effect/magic_target.tga", function (c) {
        d.load(c, function () {
          var c = this.getContext("2d");
          c.save();
          c.translate(this.width / 2, this.height / 2);
          c.rotate(0.25 * Math.PI);
          c.translate(-this.width / 2, -this.height / 2);
          c.drawImage(this, 0, 0);
          c.restore();
          n = a.createTexture();
          a.bindTexture(a.TEXTURE_2D, n);
          a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, this);
          a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR);
          a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
          b.ready = !0;
        });
      });
    };
    b.renderBeforeEntities = !0;
    b.free = function (a) {
      n && (a.deleteTexture(n), (n = null));
      g && (a.deleteProgram(g), (g = null));
      p && a.deleteBuffer(p);
      this.ready = !1;
    };
    b.beforeRender = function (a, b, c, d, e) {
      var h = g.uniform,
        m = g.attribute;
      k.identity(f);
      k.rotateY(f, f, (((e / 1e3) * 100) / 180) * Math.PI);
      a.useProgram(g);
      a.uniformMatrix4fv(h.uModelViewMat, !1, b);
      a.uniformMatrix4fv(h.uProjectionMat, !1, c);
      a.uniformMatrix4fv(h.uRotationMat, !1, f);
      a.uniform1i(h.uFogUse, d.use && d.exist);
      a.uniform1f(h.uFogNear, d.near);
      a.uniform1f(h.uFogFar, d.far);
      a.uniform3fv(h.uFogColor, d.color);
      a.activeTexture(a.TEXTURE0);
      a.bindTexture(a.TEXTURE_2D, n);
      a.uniform1i(h.uDiffuse, 0);
      a.enableVertexAttribArray(m.aPosition);
      a.enableVertexAttribArray(m.aTextureCoord);
      a.bindBuffer(a.ARRAY_BUFFER, p);
      a.vertexAttribPointer(m.aPosition, 2, a.FLOAT, !1, 16, 0);
      a.vertexAttribPointer(m.aTextureCoord, 2, a.FLOAT, !1, 16, 8);
    };
    b.afterRender = function (a) {
      a.disableVertexAttribArray(g.attribute.aPosition);
      a.disableVertexAttribArray(g.attribute.aTextureCoord);
    };
    return b;
  },
);
