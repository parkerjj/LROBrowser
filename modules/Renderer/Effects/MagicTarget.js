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
      this.size = n[b] || 3;
      this.range = e;
      this.endLifeTime = f;
    }
    var c = a("Utils/WebGL"),
      d = a("Utils/Texture"),
      e = a("Utils/gl-matrix"),
      m = a("DB/Skills/SkillConst"),
      h = a("Core/Client"),
      r = a("Renderer/Map/Altitude"),
      q = a("Engine/SessionStorage"),
      k,
      g,
      t,
      l = e.mat4,
      f = l.create(),
      n = {};
    n[m.MG_SAFETYWALL] = [3];
    n[m.CR_SLIMPITCHER] = [7];
    n[m.SO_ARRULLO] = [3, 3, 5, 5, 7];
    n[m.AC_SHOWER] = [3, 3, 3, 3, 3, 5, 5, 5, 5, 5];
    n[m.NC_ARMSCANNON] = [7, 5, 3];
    n[m.AM_DEMONSTRATION] = [3];
    n[m.SC_BLOODYLUST] = [7];
    n[m.PF_FOGWALL] = [3];
    n[m.PR_BENEDICTIO] = [3];
    n[m.KO_ZENKAI] = [5];
    n[m.WL_CRIMSONROCK] = [7];
    n[m.GN_CRAZYWEED] = [9];
    n[m.NPC_COMET] = [3];
    n[m.WL_COMET] = [19];
    n[m.HT_CLAYMORETRAP] = [5];
    n[m.SC_CHAOSPANIC] = [5];
    n[m.RK_DRAGONBREATH_WATER] = [9];
    n[m.RK_DRAGONBREATH] = [9];
    n[m.SC_DIMENSIONDOOR] = [1];
    n[m.SO_DIAMONDDUST] = [9];
    n[m.HT_DETECTING] = [3];
    n[m.GN_DEMONIC_FIRE] = [5];
    n[m.SA_DELUGE] = [7];
    n[m.SO_VACUUM_EXTREME] = [3, 3, 5, 5, 7];
    n[m.NPC_EVILLAND] = [11];
    n[m.AB_EPICLESIS] = [5];
    n[m.SO_EARTH_INSIGNIA] = [3];
    n[m.SO_EARTHGRAVE] = [9];
    n[m.HT_FLASHER] = [3];
    n[m.MG_FIREWALL] = [3];
    n[m.RA_FIRINGTRAP] = [5];
    n[m.SO_FIRE_INSIGNIA] = [3];
    n[m.GN_FIRE_EXPANSION] = [5];
    n[m.GN_HELLS_PLANT] = [3];
    n[m.WZ_HEAVENDRIVE] = [5];
    n[m.HW_GRAVITATION] = [5];
    n[m.RL_HAMMER_OF_GOD] = [5];
    n[m.NPC_RAYOFGENESIS] = [3];
    n[m.LG_RAYOFGENESIS] = [11];
    n[m.HW_GANBANTEIN] = [3];
    n[m.NC_COLDSLOWER] = [5, 7, 9];
    n[m.WZ_VERMILION] = [11];
    n[m.SR_RIDEINLIGHTNING] = [3, 3, 5, 5, 7];
    n[m.NJ_RAIGEKISAI] = [3, 3, 5, 5, 7];
    n[m.MH_LAVA_SLIDE] = [3, 3, 3, 5, 5, 5, 7, 7, 7, 9];
    n[m.NPC_MAGMA_ERUPTION] = [3];
    n[m.NC_MAGMA_ERUPTION] = [7];
    n[m.KO_BAKURETSU] = [3];
    n[m.NPC_CLOUD_KILL] = [3];
    n[m.SO_CLOUD_KILL] = [7];
    n[m.WZ_METEOR] = [7];
    n[m.SC_MANHOLE] = [3];
    n[m.PR_MAGNUS] = [7];
    n[m.SA_LANDPROTECTOR] = [9];
    n[m.SC_MAELSTROM] = [5];
    n[m.KO_MUCHANAGE] = [3, 3, 3, 3, 3, 3, 3, 3, 5];
    n[m.WZ_QUAGMIRE] = [5];
    n[m.NPC_PSYCHIC_WAVE] = [3];
    n[m.SO_PSYCHIC_WAVE] = [7, 7, 9, 9, 11];
    n[m.GC_POISONSMOKE] = [5];
    n[m.MH_POISON_MIST] = [7];
    n[m.AL_PNEUMA] = [3];
    n[m.LG_OVERBRAND] = [3];
    n[m.WM_SEVERE_RAINSTORM] = [11];
    n[m.RG_GRAFFITI] = [5];
    n[m.PR_SANCTUARY] = [5];
    n[m.MG_THUNDERSTORM] = [5];
    n[m.WZ_STORMGUST] = [11];
    n[m.WM_SOUND_OF_DESTRUCTION] = [9, 9, 11, 13, 15];
    n[m.WM_POEMOFNETHERWORLD] = [3];
    n[m.MH_XENO_SLASHER] = [3, 3, 3, 5, 5, 5, 7, 7, 7, 9];
    n[m.SO_WIND_INSIGNIA] = [3];
    n[m.SA_VIOLENTGALE] = [7];
    n[m.NJ_SUITON] = [3, 3, 3, 5, 5, 5, 7, 7, 7, 9];
    n[m.SO_WATER_INSIGNIA] = [3];
    n[m.SO_WARMER] = [7];
    n[m.SA_VOLCANO] = [7];
    n[m.MH_VOLCANIC_ASH] = [3];
    n[m.AS_VENOMDUST] = [2];
    n[m.KO_HUUMARANKA] = [7];
    n[m.WL_COMET] = [26];
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
        var e = q.Entity.position[0] - d[0],
          f = q.Entity.position[1] - d[1];
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
      t = a.createBuffer();
      a.bindBuffer(a.ARRAY_BUFFER, t);
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
          k = a.createTexture();
          a.bindTexture(a.TEXTURE_2D, k);
          a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, this);
          a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR);
          a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
          b.ready = !0;
        });
      });
    };
    b.renderBeforeEntities = !0;
    b.free = function (a) {
      k && (a.deleteTexture(k), (k = null));
      g && (a.deleteProgram(g), (g = null));
      t && a.deleteBuffer(t);
      this.ready = !1;
    };
    b.beforeRender = function (a, b, c, d, e) {
      var h = g.uniform,
        n = g.attribute;
      l.identity(f);
      l.rotateY(f, f, (((e / 1e3) * 100) / 180) * Math.PI);
      a.useProgram(g);
      a.uniformMatrix4fv(h.uModelViewMat, !1, b);
      a.uniformMatrix4fv(h.uProjectionMat, !1, c);
      a.uniformMatrix4fv(h.uRotationMat, !1, f);
      a.uniform1i(h.uFogUse, d.use && d.exist);
      a.uniform1f(h.uFogNear, d.near);
      a.uniform1f(h.uFogFar, d.far);
      a.uniform3fv(h.uFogColor, d.color);
      a.activeTexture(a.TEXTURE0);
      a.bindTexture(a.TEXTURE_2D, k);
      a.uniform1i(h.uDiffuse, 0);
      a.enableVertexAttribArray(n.aPosition);
      a.enableVertexAttribArray(n.aTextureCoord);
      a.bindBuffer(a.ARRAY_BUFFER, t);
      a.vertexAttribPointer(n.aPosition, 2, a.FLOAT, !1, 16, 0);
      a.vertexAttribPointer(n.aTextureCoord, 2, a.FLOAT, !1, 16, 8);
    };
    b.afterRender = function (a) {
      a.disableVertexAttribArray(g.attribute.aPosition);
      a.disableVertexAttribArray(g.attribute.aTextureCoord);
    };
    return b;
  },
);
