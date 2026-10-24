define(
  "DB/DBManager",
  "require Core/Client Core/Configs Vendors/luaparse Vendors/text-encoding Vendors/xmlparse ./Jobs/JobNameTable ./Jobs/JobPalNameTable ./Jobs/WeaponAction ./Jobs/WeaponJobTable ./Jobs/BabyTable ./Jobs/HairIndexTable ./Monsters/MonsterTable DB/Mercenary/MercenaryTable ./Pets/PetIllustration ./Pets/PetAction ./Jobs/JobConst ./Skills/SkillConst ./Items/HatTable ./Items/RobeTable ./Items/ShieldTable ./Items/WeaponTable ./Items/WeaponType ./Items/WeaponEffect ./Items/WeaponSoundTable ./Items/WeaponHitSoundTable ./Jobs/JobHitSoundTable ./Items/WeaponTrailTable ./QuestInfo/QuestInfo DB/worldData DB/navigateData DB/Mobs/mob_db DB/NpcShopTable ./Pets/PetEmotionTable ./Pets/PetHungryState ./Pets/PetFriendlyState ./Pets/PetMessageConst".split(
    " ",
  ),
  function (a) {
    function b(a) {
      switch (a) {
        case 4218:
        case 4219:
          return 1;
        default:
          return 0;
      }
    }
    function c(a, b) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "");
          a = C.parse(a, { comments: !1 });
          a = $jscomp.makeIterator(a.body[0].init[0].fields);
          for (var c = a.next(); !c.done; c = a.next())
            if (((c = c.value), "targets" == c.key.name))
              for (var d = 0; d < c.value.fields.length; d++) {
                for (
                  var e = {},
                    f = $jscomp.makeIterator(c.value.fields[d].value.fields),
                    g = f.next();
                  !g.done;
                  g = f.next()
                )
                  if (((g = g.value), "value" in g.value))
                    e[g.key.name] =
                      "StringLiteral" == g.value.type
                        ? g.value.raw
                            .substr(1)
                            .substr(0, g.value.raw.length - 2)
                        : g.value.value;
                  else if ("fields" in g.value) {
                    for (
                      var h = [],
                        k = $jscomp.makeIterator(g.value.fields),
                        l = k.next();
                      !l.done;
                      l = k.next()
                    ) {
                      for (
                        var m = [],
                          l = $jscomp.makeIterator(l.value.value.fields),
                          n = l.next();
                        !n.done;
                        n = l.next()
                      )
                        ((n = n.value),
                          "StringLiteral" == n.value.type
                            ? ((n = n.value.raw),
                              m.push(n.substr(1).substr(0, n.length - 2)))
                            : m.push(n.value.value));
                      h.push(m);
                    }
                    e[g.key.name] = h;
                  }
                Q.LaphineUpgradeList[d] = e;
              }
          b();
        },
        b,
      );
    }
    function d(a, b) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "");
          a = C.parse(a, { comments: !1 });
          a = $jscomp.makeIterator(a.body[0].init[0].fields);
          for (var c = a.next(); !c.done; c = a.next())
            if (((c = c.value), "sources" == c.key.name))
              for (var d = 0; d < c.value.fields.length; d++) {
                for (
                  var e = {},
                    f = $jscomp.makeIterator(c.value.fields[d].value.fields),
                    g = f.next();
                  !g.done;
                  g = f.next()
                )
                  if (((g = g.value), "value" in g.value))
                    e[g.key.name] =
                      "StringLiteral" == g.value.type
                        ? g.value.raw
                            .substr(1)
                            .substr(0, g.value.raw.length - 2)
                        : g.value.value;
                  else if ("fields" in g.value) {
                    for (
                      var h = [],
                        k = $jscomp.makeIterator(g.value.fields),
                        l = k.next();
                      !l.done;
                      l = k.next()
                    ) {
                      for (
                        var m = [],
                          l = $jscomp.makeIterator(l.value.value.fields),
                          n = l.next();
                        !n.done;
                        n = l.next()
                      )
                        ((n = n.value),
                          "StringLiteral" == n.value.type
                            ? ((n = n.value.raw),
                              m.push(n.substr(1).substr(0, n.length - 2)))
                            : m.push(n.value.value));
                      h.push(m);
                    }
                    e[g.key.name] = h;
                  }
                Q.LaphineSynthesisList[d] = e;
              }
          b();
        },
        b,
      );
    }
    function e(a, b) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "");
          var c = C.parse(a, { comments: !1 });
          a = {};
          for (
            var c = $jscomp.makeIterator(c.body[0].init[0].fields),
              d = c.next();
            !d.done;
            d = c.next()
          )
            ((d = d.value),
              "TableKey" == d.type
                ? (a[d.key.raw.substr(1).substr(0, d.key.raw.length - 2)] =
                    d.value.value)
                : "TableKeyString" == d.type &&
                  (a[d.key.name] = d.value.value));
          xa = a;
          b();
        },
        b,
      );
    }
    function m(a, b) {
      B.loadFile(
        a,
        function (a) {
          try {
            for (
              var c = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, ""),
                d = C.parse(c, { comments: !1 }),
                e = $jscomp.makeIterator(d.body[0].init[0].fields),
                f = e.next();
              !f.done;
              f = e.next()
            ) {
              var g = f.value,
                h = g.key.raw;
              void 0 === Q.ItemReformInfo[h] && (Q.ItemReformInfo[h] = {});
              for (a = 0; a < g.value.fields.length; a++)
                if ("value" in g.value.fields[a].value)
                  Q.ItemReformInfo[h][g.value.fields[a].key.name] =
                    "StringLiteral" == g.value.fields[a].value.type
                      ? xa[
                          g.value.fields[a].value.raw
                            .substr(1)
                            .substr(0, g.value.fields[a].value.raw.length - 2)
                        ] ||
                        g.value.fields[a].value.raw
                          .substr(1)
                          .substr(0, g.value.fields[a].value.raw.length - 2)
                      : g.value.fields[a].value.value;
                else if ("fields" in g.value.fields[a].value) {
                  if ("Material" == g.value.fields[a].key.name)
                    for (
                      var c = {},
                        k = $jscomp.makeIterator(
                          g.value.fields[a].value.fields,
                        ),
                        l = k.next();
                      !l.done;
                      l = k.next()
                    ) {
                      var m = l.value;
                      "TableKey" == m.type
                        ? m.key.raw &&
                          (c[
                            xa[
                              m.key.raw
                                .substr(1)
                                .substr(0, m.key.raw.length - 2)
                            ]
                          ] = m.value.value)
                        : (c[xa[m.key.name]] = m.value.value);
                    }
                  else
                    for (
                      var c = [],
                        n = $jscomp.makeIterator(
                          g.value.fields[a].value.fields,
                        ),
                        l = n.next();
                      !l.done;
                      l = n.next()
                    ) {
                      var p = l.value;
                      c.push(
                        p.value.raw.substr(1).substr(0, p.value.raw.length - 2),
                      );
                    }
                  Q.ItemReformInfo[h][g.value.fields[a].key.name] = c;
                } else {
                  var q =
                    parseInt(g.value.fields[a].value.operator) +
                    parseInt(g.value.fields[a].value.argument.raw);
                  Q.ItemReformInfo[h][g.value.fields[a].key.name] = q;
                }
            }
          } catch (Da) {
            console.error(Da);
          }
          b();
        },
        b,
      );
    }
    function h(a, b) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "");
          var c = C.parse(a, { comments: !1 });
          a = {};
          for (
            var c = $jscomp.makeIterator(c.body[0].init[0].fields),
              d = c.next();
            !d.done;
            d = c.next()
          ) {
            for (
              var d = d.value,
                e = [],
                f = $jscomp.makeIterator(d.value.fields),
                g = f.next();
              !g.done;
              g = f.next()
            )
              e.push(g.value.value.value);
            a[xa[d.key.name]] = e;
          }
          Q.ItemReformList = a;
          b();
        },
        b,
      );
    }
    function r(a, b, c, d, e) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "").split(b);
          var f,
            g = a.length,
            h = Array(c + 1);
          for (f = 0; f < g; f++)
            (0 === f % c && (f && d.apply(null, h), (h[f % c] = f)),
              (h[(f % c) + 1] = a[f].replace(/^\s+|\s+$/g, "")));
          e();
        },
        e,
      );
    }
    function q(a, b, c) {
      B.loadFile(
        a,
        function (a) {
          a = a.replace(/^.*<\?xml/, "\x3c?xml");
          a = new DOMParser().parseFromString(a, "application/xml");
          a = z.xml2json(a);
          b.call(null, a);
          c();
        },
        c,
      );
    }
    function k(a, b) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "");
          var c = C.parse(a, { comments: !1 });
          a = [];
          for (var d = {}, e = 1; 4 > e; e++)
            d[c.body[e].variables[0].name] = c.body[e].init[0].value;
          for (
            var e = {},
              c = $jscomp.makeIterator(c.body[4].init[0].fields),
              f = c.next();
            !f.done;
            f = c.next()
          ) {
            var f = f.value,
              g = f.value.fields[0].value.value;
            0 > a.indexOf(g) && ((e[g] = []), a.push(g));
            var h = {};
            h.x = f.value.fields[1].value.value;
            h.y = f.value.fields[2].value.value;
            h.z = f.value.fields[3].value.value;
            h.type = d[f.value.fields[4].value.name];
            h.file = f.value.fields[5].value.value
              .replace(/\\/g, "/")
              .replace(
                "\u00c3\u0080\u00c2\u00af\u00c3\u0080\u00c3\u00ba\u00c3\u0080\u00c3\u008e\u00c3\u0085\u00c3\u008d\u00c3\u0086\u00c3\u00a4\u00c3\u0080\u00c3\u008c\u00c2\u00bd\u00c2\u00ba",
                "\u00c0\u00af\u00c0\u00fa\u00c0\u00ce\u00c5\u00cd\u00c6\u00e4\u00c0\u00cc\u00bd\u00ba",
              );
            6 < f.value.fields.length &&
              (h.title = f.value.fields[6].value.value);
            7 < f.value.fields.length &&
              (h.color = f.value.fields[7].value.value);
            e[g].push(h);
          }
          sa = e;
          b();
        },
        b,
      );
    }
    function g(a, b) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "");
          var c = C.parse(a, { comments: !1 });
          a = {};
          for (
            var c = $jscomp.makeIterator(c.body[0].init[0].fields),
              d = c.next();
            !d.done;
            d = c.next()
          ) {
            d = d.value;
            a[d.key.name] = [];
            for (
              var e = $jscomp.makeIterator(d.value.fields), f = e.next();
              !f.done;
              f = e.next()
            ) {
              for (
                var g = {},
                  f = $jscomp.makeIterator(f.value.value.fields),
                  h = f.next();
                !h.done;
                h = f.next()
              )
                ((h = h.value),
                  "name" == h.key.name
                    ? (g[h.key.name.toLowerCase()] = h.value.raw
                        .substr(1)
                        .substr(0, h.value.raw.length - 2))
                    : (g[h.key.name.toLowerCase()] = h.value.value));
              a[d.key.name].push(g);
            }
          }
          Q.TownInfo = a;
          b();
        },
        b,
      );
    }
    function t(a, b) {
      B.loadFile(
        a,
        function (a) {
          try {
            for (
              var c = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, ""),
                d = C.parse(c, { comments: !1 }),
                e = $jscomp.makeIterator(d.body[0].init[0].fields),
                f = e.next();
              !f.done;
              f = e.next()
            ) {
              var g = f.value,
                h = g.key.raw;
              void 0 === Q.ItemInfo[h] && (Q.ItemInfo[h] = {});
              for (a = 0; a < g.value.fields.length; a++)
                if ("value" in g.value.fields[a].value)
                  isNaN(g.value.fields[a].value.raw)
                    ? (Q.ItemInfo[h][g.value.fields[a].key.name] =
                        g.value.fields[a].value.raw
                          .substr(1)
                          .substr(0, g.value.fields[a].value.raw.length - 2))
                    : (Q.ItemInfo[h][g.value.fields[a].key.name] =
                        g.value.fields[a].value.value);
                else if ("fields" in g.value.fields[a].value) {
                  for (
                    var c = [],
                      k = $jscomp.makeIterator(g.value.fields[a].value.fields),
                      l = k.next();
                    !l.done;
                    l = k.next()
                  ) {
                    var m = l.value;
                    c.push(
                      m.value.raw.substr(1).substr(0, m.value.raw.length - 2),
                    );
                  }
                  Q.ItemInfo[h][g.value.fields[a].key.name] = c;
                }
            }
          } catch (Ma) {
            console.error(Ma);
          }
          b();
        },
        b,
      );
    }
    function l(a, b) {
      B.loadFile(
        a,
        function (a) {
          try {
            for (
              var c = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, ""),
                d = C.parse(c, { comments: !1 }),
                e = $jscomp.makeIterator(d.body[0].init[0].fields),
                f = e.next();
              !f.done;
              f = e.next()
            ) {
              var g = f.value,
                h = g.key.raw;
              void 0 === Q.AchList[h] && (Q.AchList[h] = {});
              for (a = 0; a < g.value.fields.length; a++)
                if ("value" in g.value.fields[a].value)
                  isNaN(g.value.fields[a].value.raw)
                    ? (Q.AchList[h][g.value.fields[a].key.name] =
                        g.value.fields[a].value.raw
                          .substr(1)
                          .substr(0, g.value.fields[a].value.raw.length - 2))
                    : (Q.AchList[h][g.value.fields[a].key.name] =
                        g.value.fields[a].value.value);
                else if ("fields" in g.value.fields[a].value) {
                  for (
                    var c = [],
                      d = {},
                      k = {},
                      l = $jscomp.makeIterator(g.value.fields[a].value.fields),
                      m = l.next();
                    !m.done;
                    m = l.next()
                  ) {
                    var n = m.value;
                    if (n.key.name)
                      isNaN(n.value.raw)
                        ? (d[n.key.name] = n.value.raw
                            .substr(1)
                            .substr(0, n.value.raw.length - 2))
                        : (d[n.key.name] = n.value.value);
                    else if (n.key.raw) {
                      for (
                        var k = {},
                          p = $jscomp.makeIterator(n.value.fields),
                          q = p.next();
                        !q.done;
                        q = p.next()
                      ) {
                        var t = q.value;
                        isNaN(t.value.raw)
                          ? (k[t.key.name] = t.value.raw
                              .substr(1)
                              .substr(0, t.value.raw.length - 2))
                          : (k[t.key.name] = t.value.value);
                      }
                      d[n.key.raw] = k;
                    }
                  }
                  Object.keys(d).length && c.push(d);
                  Q.AchList[h][g.value.fields[a].key.name] = c;
                }
            }
          } catch (Oa) {
            console.error(Oa);
          }
          b();
        },
        b,
      );
    }
    function f(a, b) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "");
          var c = C.parse(a, { comments: !1 });
          a = {};
          for (
            var c = $jscomp.makeIterator(c.body[0].init[0].fields),
              d = c.next();
            !d.done;
            d = c.next()
          )
            ((d = d.value), (a[d.key.name] = d.value.value));
          N = a;
          Q.SkillId = N;
          b();
        },
        b,
      );
    }
    function n(a, b) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "");
          var c = C.parse(a, { comments: !1 });
          a = {};
          for (
            var c = $jscomp.makeIterator(c.body[0].init[0].fields),
              d = c.next();
            !d.done;
            d = c.next()
          ) {
            for (
              var e = d.value,
                d = e.key.identifier.name,
                f = {},
                e = $jscomp.makeIterator(e.value.fields),
                g = e.next();
              !g.done;
              g = e.next()
            )
              ((g = g.value), (f[g.key.value] = N[g.value.identifier.name]));
            a[P[d.slice(3)]] = f;
          }
          Q.SkillTreeView = a;
          b();
        },
        b,
      );
    }
    function p(a, b) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "");
          var c = C.parse(a, { comments: !1 });
          a = {};
          for (
            var d = $jscomp.makeIterator(c.body[0].init[0].fields),
              e = d.next();
            !e.done;
            e = d.next()
          )
            ((e = e.value), (a[e.key.name] = e.value.value));
          for (
            var d = {},
              e = $jscomp.makeIterator(c.body[1].init[0].fields),
              f = e.next();
            !f.done;
            f = e.next()
          )
            ((f = f.value),
              void 0 !== f.key.identifier &&
                (d[a[f.key.identifier.name]] = a[f.value.identifier.name]));
          c = $jscomp.makeIterator(c.body[3].init[0].fields);
          for (e = c.next(); !e.done; e = c.next())
            ((e = e.value),
              void 0 !== e.key.identifier &&
                (d[a[e.key.identifier.name]] = d[a[e.key.identifier.name]]
                  ? [d[a[e.key.identifier.name]], a[e.value.identifier.name]]
                  : a[e.value.identifier.name]));
          Q.JobInheritList = d;
          b();
        },
        b,
      );
    }
    function v(a, b) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "");
          var c = C.parse(a, { comments: !1 });
          a = {};
          for (
            var c = $jscomp.makeIterator(c.body[0].init[0].fields),
              d = c.next();
            !d.done;
            d = c.next()
          ) {
            for (
              var e = d.value,
                d = e.key.identifier.name,
                f = [],
                e = $jscomp.makeIterator(e.value.fields),
                g = e.next();
              !g.done;
              g = e.next()
            )
              ((g = g.value),
                f.push(
                  g.value.raw.substr(1).substr(0, g.value.raw.length - 2),
                ));
            a[N[d]] = f.join("\n");
          }
          ba = a;
          b();
        },
        b,
      );
    }
    function u(a, b) {
      B.loadFile(
        a,
        function (a) {
          a = ("\n" + a).replace(/\n(\/\/[^\n]+)/g, "");
          var c = C.parse(a, { comments: !1 });
          a = {};
          for (
            var c = $jscomp.makeIterator(c.body[0].init[0].fields),
              d = c.next();
            !d.done;
            d = c.next()
          ) {
            var d = d.value,
              e = d.key.identifier.name,
              f = {};
            f.Name = d.value.fields[0].value.value;
            for (var g = 1; g < d.value.fields.length; g++)
              if ("_NeedSkillList" == d.value.fields[g].key.name) {
                for (
                  var h = [],
                    k = $jscomp.makeIterator(d.value.fields[g].value.fields),
                    l = k.next();
                  !l.done;
                  l = k.next()
                )
                  ((l = l.value),
                    1 < l.value.fields.length
                      ? h.push([
                          N[l.value.fields[0].value.identifier.name],
                          l.value.fields[1].value.value,
                        ])
                      : h.push([
                          N[l.value.fields[0].value.identifier.name],
                          1,
                        ]));
                f[d.value.fields[g].key.name] = h;
              } else if ("NeedSkillList" == d.value.fields[g].key.name) {
                h = {};
                k = $jscomp.makeIterator(d.value.fields[g].value.fields);
                for (l = k.next(); !l.done; l = k.next()) {
                  for (
                    var l = l.value,
                      m = l.key.identifier.name,
                      n = [],
                      p = $jscomp.makeIterator(l.value.fields),
                      q = p.next();
                    !q.done;
                    q = p.next()
                  )
                    ((q = q.value),
                      1 < l.value.fields.length
                        ? n.push([
                            N[q.value.fields[0].value.identifier.name],
                            q.value.fields[1].value.raw,
                          ])
                        : n.push([
                            N[q.value.fields[0].value.identifier.name],
                            1,
                          ]));
                  h[P[m.slice(3)]] = n;
                }
                f[d.value.fields[g].key.name] = h;
              } else if ("SkillName" == d.value.fields[g].key.name)
                f[d.value.fields[g].key.name] = d.value.fields[g].value.raw
                  .substr(1)
                  .substr(0, d.value.fields[g].value.raw.length - 2);
              else if ("value" in d.value.fields[g].value)
                f[d.value.fields[g].key.name] = d.value.fields[g].value.value;
              else if ("fields" in d.value.fields[g].value) {
                h = [];
                k = $jscomp.makeIterator(d.value.fields[g].value.fields);
                for (l = k.next(); !l.done; l = k.next())
                  h.push(l.value.value.value);
                f[d.value.fields[g].key.name] = h;
              }
            a[N[e]] = f;
          }
          w = a;
          b();
        },
        b,
      );
    }
    function A(a, b) {
      a = b.replace(".gat", ".rsw");
      (ra[a] || (ra[a] = {})).indoor = !0;
    }
    function D(a, b, c, d, e, f) {
      a = parseInt(e, 16);
      (ra[b] || (ra[b] = {})).fog = {
        near: parseFloat(c),
        far: parseFloat(d),
        color: [
          (255 & (a >> 16)) / 255,
          (255 & (a >> 8)) / 255,
          (255 & (a >> 0)) / 255,
        ],
        factor: parseFloat(f),
      };
    }
    var B = a("Core/Client"),
      O = a("Core/Configs"),
      C = a("Vendors/luaparse"),
      y = a("Vendors/text-encoding"),
      z = a("Vendors/xmlparse"),
      J = a("./Jobs/JobNameTable"),
      I = a("./Jobs/JobPalNameTable"),
      L = a("./Jobs/WeaponAction"),
      x = a("./Jobs/WeaponJobTable"),
      M = a("./Jobs/BabyTable"),
      E = a("./Jobs/HairIndexTable"),
      F = a("./Monsters/MonsterTable"),
      G = a("DB/Mercenary/MercenaryTable"),
      H = a("./Pets/PetIllustration"),
      K = a("./Pets/PetAction"),
      P = a("./Jobs/JobConst"),
      N = a("./Skills/SkillConst"),
      S = a("./Items/HatTable"),
      R = a("./Items/RobeTable"),
      ea = a("./Items/ShieldTable"),
      U = a("./Items/WeaponTable"),
      V = a("./Items/WeaponType"),
      ca = a("./Items/WeaponEffect"),
      T = a("./Items/WeaponSoundTable"),
      fa = a("./Items/WeaponHitSoundTable"),
      da = a("./Jobs/JobHitSoundTable"),
      ta = a("./Items/WeaponTrailTable"),
      ka = a("./QuestInfo/QuestInfo"),
      oa = a("DB/worldData"),
      ga = a("DB/navigateData"),
      la = a("DB/Mobs/mob_db"),
      ha = a("DB/NpcShopTable"),
      X = a("./Pets/PetEmotionTable"),
      Z = a("./Pets/PetHungryState"),
      qa = a("./Pets/PetFriendlyState"),
      pa = a("./Pets/PetMessageConst"),
      w = {},
      ba = {},
      Q = {},
      Y = [],
      ra = {},
      W = ["\u00bf\u00a9", "\u00b3\u00b2"],
      aa = [
        "\u00c0\u00ce\u00b0\u00a3\u00c1\u00b7",
        "\u00b5\u00b5\u00b6\u00f7\u00c1\u00b7",
      ];
    Q.mapalias = {};
    Q.JobInheritList = {};
    Q.SkillTreeView = {};
    Q.TownInfo = {};
    Q.ItemInfo = {};
    Q.AchList = {};
    var sa = {},
      ma = O.get("ClientVer");
    Q.INTERFACE_PATH =
      "data/texture/\u00c0\u00af\u00c0\u00fa\u00c0\u00ce\u00c5\u00cd\u00c6\u00e4\u00c0\u00cc\u00bd\u00ba/";
    var ja = {},
      ia = [],
      na = [],
      xa = {};
    Q.ItemReformInfo = [];
    Q.ItemReformList = {};
    Q.LaphineSynthesisList = {};
    Q.LaphineUpgradeList = {};
    Q.init = function () {
      function a() {
        x++;
        return function () {
          b++;
          if (Q.onProgress) Q.onProgress(b, x);
          if (b === x && Q.onReady) Q.onReady();
        };
      }
      ma = O.get("ClientVer");
      Q.nid = ma;
      switch (ma) {
        case 5:
          Q.webpath = "webserver2";
          break;
        default:
          Q.webpath = "webserver";
      }
      var b = 0,
        x = 0;
      switch (ma) {
        case 3:
        case 4:
          t("System/itemInfo_re_59.lua", a());
          g("System/Towninfo_cn2_1.lua", a());
          l("System/achievement_list_cn2_06.lua", a());
          break;
        case 5:
          t("System/itemInfo_re_61.lua", a());
          g("System/Towninfo_cn2_1.lua", a());
          l("System/achievement_list_cn2_06.lua", a());
          break;
        default:
          (t("System/itemInfo.lua", a()),
            g("System/Towninfo.lua", a()),
            l("System/achievement_list.lua", a()));
      }
      r(
        "data/mp3nametable.txt",
        "#",
        2,
        function (a, b, c) {
          (ra[b] || (ra[b] = {})).mp3 = c;
        },
        a(),
      );
      r(
        "data/mapnametable.txt",
        "#",
        2,
        function (a, b, c) {
          (ra[b] || (ra[b] = {})).name = c;
        },
        a(),
      );
      r(
        "data/msgstringtable.txt",
        "#",
        1,
        function (a, b) {
          Y[a] = b;
        },
        a(),
      );
      r(
        "data/resnametable.txt",
        "#",
        2,
        function (a, b, c) {
          Q.mapalias[b] = c;
        },
        a(),
      );
      r(
        "data/num2cardillustnametable.txt",
        "#",
        2,
        function (a, b, c) {
          (
            Q.ItemInfo[b.toString()] || (Q.ItemInfo[b.toString()] = {})
          ).illustResourcesName = c;
        },
        a(),
      );
      r(
        "data/cardprefixnametable.txt",
        "#",
        2,
        function (a, b, c) {
          (
            Q.ItemInfo[b.toString()] || (Q.ItemInfo[b.toString()] = {})
          ).prefixNameTable = c;
        },
        a(),
      );
      r("data/fogparametertable.txt", "#", 5, D, a());
      r("data/indoorrswtable.txt", "#", 1, A, a());
      r(
        "data/ba_frostjoke.txt",
        "\t",
        1,
        function (a, b) {
          ia[a] = b;
        },
        a(),
      );
      r(
        "data/dc_scream.txt",
        "\t",
        1,
        function (a, b) {
          na[a] = b;
        },
        a(),
      );
      q(
        "data/pettalktable.xml",
        function (a) {
          ja = a.monster_talk_table;
        },
        a(),
      );
      k("data/luafiles514/lua files/signboardlist.lua", a());
      new Promise(function (b, c) {
        f("data/luafiles514/lua files/skillinfoz/skillid_re_01.lua", a());
        b();
      }).then(function () {
        v("data/luafiles514/lua files/skillinfoz/skilldescript_re_05.lua", a());
        u("data/luafiles514/lua files/skillinfoz/skillinfolist_re_06.lua", a());
        n("data/luafiles514/lua files/skillinfoz/skilltreeview_re_03.lua", a());
        p(
          "data/luafiles514/lua files/skillinfoz/jobinheritlist_re_02.lua",
          a(),
        );
      });
      new Promise(function (b, c) {
        e("data/luafiles514/lua files/itemdbnametbl_01.lua", a());
        b();
      }).then(function () {
        m("data/luafiles514/lua files/itemreform/itemreformsystem_01.lua", a());
        h(
          "data/luafiles514/lua files/itemreform/itemreformsystemlist_01.lua",
          a(),
        );
      });
      d("data/luafiles514/lua files/datainfo/lapineddukddakbox_01.lua", a());
      c("data/luafiles514/lua files/datainfo/LapineUpgradeBox.lua", a());
    };
    Q.getLaphineItem = function (a) {
      for (
        var b = Object.keys(Q.LaphineSynthesisList), c = 0;
        c < b.length;
        c++
      ) {
        var d = Q.LaphineSynthesisList[b[c]];
        if (d.ItemID == a) return d;
      }
    };
    Q.getLaphineUpgradeItem = function (a) {
      for (
        var b = Object.keys(Q.LaphineUpgradeList), c = 0;
        c < b.length;
        c++
      ) {
        var d = Q.LaphineUpgradeList[b[c]];
        if (d.ItemID == a) return d;
      }
    };
    Q.getBodyPath = function (a, c) {
      return 45 > a
        ? "data/sprite/" +
            aa[b(a)] +
            "/\u00b8\u00f6\u00c5\u00eb/" +
            W[c] +
            "/" +
            (J[a] || J[0]) +
            "_" +
            W[c]
        : 45 === a || 111 === a || 139 === a
          ? null
          : 1e3 > a
            ? "data/sprite/npc/" + (F[a] || F[46]).toLowerCase()
            : 4e3 > a
              ? "data/sprite/\u00b8\u00f3\u00bd\u00ba\u00c5\u00cd/" +
                (F[a] || F[1001]).toLowerCase()
              : 6e3 > a
                ? 4063 == a ||
                  4129 == a ||
                  (0 == c && 4061 == a) ||
                  4064 == a ||
                  (1 == c && 4078 == a)
                  ? "data/sprite/" +
                    aa[b(a)] +
                    "/\u00b8\u00f6\u00c5\u00eb/" +
                    W[c] +
                    "/" +
                    (J[a] || J[0]) +
                    "_" +
                    W[c]
                  : (4060 <= a && 4079 >= a) ||
                      4201 == a ||
                      4202 == a ||
                      4148 == a ||
                      4133 == a ||
                      4198 == a ||
                      4129 == a ||
                      4197 == a ||
                      4140 == a ||
                      4199 == a
                    ? "data/sprite/" +
                      aa[b(a)] +
                      "/\u00b8\u00f6\u00c5\u00eb/" +
                      W[c] +
                      "/costume_1/" +
                      (J[a] || J[0]) +
                      "_" +
                      W[c] +
                      "_1"
                    : "data/sprite/" +
                      aa[b(a)] +
                      "/\u00b8\u00f6\u00c5\u00eb/" +
                      W[c] +
                      "/" +
                      (J[a] || J[0]) +
                      "_" +
                      W[c]
                : 6017 > a
                  ? "data/sprite/homun/" + (F[a] || F[1002]).toLowerCase()
                  : 6048 > a
                    ? "data/sprite/\u00c0\u00ce\u00b0\u00a3\u00c1\u00b7/\u00b8\u00f6\u00c5\u00eb/" +
                      W[G[a][0].sex] +
                      "/" +
                      G[a][0].file
                    : 7e3 > a
                      ? "data/sprite/homun/" + (F[a] || F[1002]).toLowerCase()
                      : 11e3 > a
                        ? "data/sprite/npc/" + (F[a] || F[46]).toLowerCase()
                        : "data/sprite/\u00b8\u00f3\u00bd\u00ba\u00c5\u00cd/" +
                          (F[a] || F[46]).toLowerCase();
    };
    Q.getAdminPath = function (a, c) {
      return (
        "data/sprite/" +
        aa[b(a)] +
        "/\u00b8\u00f6\u00c5\u00eb/" +
        W[c] +
        "/\u00bf\u00ee\u00bf\u00b5\u00c0\u00da_" +
        W[c]
      );
    };
    Q.getBodyPalPath = function (a, b, c) {
      return 0 !== a && a in I
        ? (4060 <= a && 4079 >= a) ||
          4201 == a ||
          4202 == a ||
          4148 == a ||
          4132 == a ||
          4133 == a ||
          4198 == a ||
          4129 == a ||
          4197 == a ||
          4140 == a ||
          4199 == a
          ? "data/palette/\u00b8\u00f6/costume_1/" +
            I[a] +
            "_" +
            W[c] +
            "_" +
            b +
            "_1.pal"
          : "data/palette/\u00b8\u00f6/" + I[a] + "_" + W[c] + "_" + b + ".pal"
        : null;
    };
    Q.getHeadPath = function (a, c, d) {
      return (
        "data/sprite/" +
        aa[b(d)] +
        "/\u00b8\u00d3\u00b8\u00ae\u00c5\u00eb/" +
        W[c] +
        "/" +
        (E[c + 2 * b(d)][a] || a) +
        "_" +
        W[c]
      );
    };
    Q.getHeadPalPath = function (a, c, d, e) {
      e = b(e);
      return (
        "data/palette/" +
        (e ? aa[e] + "/" : "") +
        "\u00b8\u00d3\u00b8\u00ae/\u00b8\u00d3\u00b8\u00ae" +
        (E[d + 2 * e][a] || a) +
        "_" +
        W[d] +
        "_" +
        c +
        ".pal"
      );
    };
    Q.getHatPath = function (a, b) {
      return 0 !== a && a in S
        ? "data/sprite/\u00be\u00c7\u00bc\u00bc\u00bb\u00e7\u00b8\u00ae/" +
            W[b] +
            "/" +
            W[b] +
            S[a]
        : null;
    };
    Q.getRobePath = function (a, b, c) {
      return 0 !== a && a in R
        ? "data/sprite/\u00b7\u00ce\u00ba\u00ea/" +
            R[a] +
            "/" +
            W[c] +
            "/" +
            J[b] +
            "_" +
            W[c]
        : null;
    };
    Q.getRobePath2 = function (a, b, c) {
      return 0 !== a && a in R
        ? "data/sprite/\u00b7\u00ce\u00ba\u00ea/" + R[a] + "/" + R[a]
        : null;
    };
    Q.getPetEquipPath = function (a) {
      return 0 !== a && a in K ? "data/sprite/" + K[a] : null;
    };
    Q.getPetIllustPath = function (a) {
      return "data/texture/" + (H[a] || H[1002]);
    };
    Q.getShieldPath = function (a, b, c) {
      if (0 === a) return null;
      if (500 < a && (2100 > a || 2200 < a)) return Q.getWeaponPath(a, b, c);
      b = x[b] || x[0];
      a in Q.ItemInfo &&
        "ClassNum" in Q.ItemInfo[a] &&
        (a = Q.ItemInfo[a].ClassNum);
      return (
        "data/sprite/\u00b9\u00e6\u00c6\u00d0/" +
        b +
        "/" +
        b +
        "_" +
        W[c] +
        "_" +
        (ea[a] || ea[1])
      );
    };
    Q.getWeaponPath = function (a, c, d) {
      if (0 === a) return null;
      if (6016 < c && 6047 > c)
        return (
          "data/sprite/\u00c0\u00ce\u00b0\u00a3\u00c1\u00b7/\u00bf\u00eb\u00ba\u00b4/" +
          G[c][0].file +
          (U[a] || "_" + a)
        );
      var e = x[c] || x[0],
        f = 0;
      a in Q.ItemInfo &&
        "ClassNum" in Q.ItemInfo[a] &&
        (f = Q.ItemInfo[a].ClassNum);
      a =
        10 != f || (4218 != c && 4219 != c)
          ? 0 < f
            ? U[f]
              ? U[f]
              : "_" + a
            : U[a] || "_" + a
          : "_\u00b0\u00ad\u00be\u00c6\u00c1\u00f6\u00c7\u00ae_\u00b3\u00ec\u00bb\u00f6";
      return "data/sprite/" + aa[b(c)] + "/" + e + "/" + e + "_" + W[d] + a;
    };
    Q.getWeaponSound = function (a) {
      a = Q.getWeaponViewID(a);
      return T[a];
    };
    Q.getWeaponEffectPath = function (a, b, c) {
      if (0 === a) return null;
      b = x[b] || x[0];
      return (
        "data/sprite/\u00c0\u00ce\u00b0\u00a3\u00c1\u00b7/" +
        b +
        "/" +
        b +
        "_" +
        W[c] +
        ca[a]
      );
    };
    Q.getWeaponViewID = (function () {
      var a = [13157, 13158, 13159, 13172, 13177],
        b = [13154, 13155, 13156, 13167, 13168, 13169, 13173, 13178],
        c = [13160, 13161, 13162, 13174, 13179];
      return function (d) {
        return d < V.MAX
          ? d
          : d in Q.ItemInfo &&
              Q.ItemInfo[d].ClassNum &&
              U[Q.ItemInfo[d].ClassNum]
            ? Q.ItemInfo[d].ClassNum
            : 1100 > d
              ? V.NONE
              : 1116 <= d && 1118 >= d
                ? V.TWOHANDSWORD
                : 1314 <= d && 1315 >= d
                  ? V.TWOHANDAXE
                  : 1410 <= d && 1412 >= d
                    ? V.TWOHANDSPEAR
                    : 1472 <= d && 1473 >= d
                      ? V.ROD
                      : 1599 === d
                        ? V.MACE
                        : -1 < a.indexOf(d)
                          ? V.GUN_GATLING
                          : -1 < b.indexOf(d)
                            ? V.GUN_SHOTGUN
                            : -1 < c.indexOf(d)
                              ? V.GUN_GRANADE
                              : 1150 > d
                                ? V.SWORD
                                : 1200 > d
                                  ? V.TWOHANDSWORD
                                  : 1250 > d
                                    ? V.SHORTSWORD
                                    : 1300 > d
                                      ? V.KATAR
                                      : 1350 > d
                                        ? V.AXE
                                        : 1400 > d
                                          ? V.TWOHANDAXE
                                          : 1450 > d
                                            ? V.SPEAR
                                            : 1500 > d
                                              ? V.TWOHANDSPEAR
                                              : 1550 > d
                                                ? V.MACE
                                                : 1600 > d
                                                  ? V.BOOK
                                                  : 1681 > d
                                                    ? V.ROD
                                                    : 1700 > d
                                                      ? V.CATARRH
                                                      : 1750 > d
                                                        ? V.BOW
                                                        : 1800 > d
                                                          ? V.NONE
                                                          : 1850 > d
                                                            ? V.KNUKLE
                                                            : 1900 > d
                                                              ? V.NONE
                                                              : 1950 > d
                                                                ? V.INSTRUMENT
                                                                : 2e3 > d
                                                                  ? V.WHIP
                                                                  : 2050 > d
                                                                    ? V.TWOHANDROD
                                                                    : 13e3 > d
                                                                      ? V.NONE
                                                                      : 13050 >
                                                                          d
                                                                        ? V.SHORTSWORD
                                                                        : 13100 >
                                                                            d
                                                                          ? V.NONE
                                                                          : 13150 >
                                                                              d
                                                                            ? V.GUN_HANDGUN
                                                                            : 13200 >
                                                                                d
                                                                              ? V.GUN_RIFLE
                                                                              : 13300 >
                                                                                  d
                                                                                ? V.NONE
                                                                                : 13350 >
                                                                                    d
                                                                                  ? V.SYURIKEN
                                                                                  : 13400 >
                                                                                      d
                                                                                    ? V.NONE
                                                                                    : 13450 >
                                                                                        d
                                                                                      ? V.SWORD
                                                                                      : 18100 >
                                                                                          d
                                                                                        ? V.NONE
                                                                                        : 18150 >
                                                                                            d
                                                                                          ? V.BOW
                                                                                          : V.NONE;
      };
    })();
    Q.getWeaponAction = function (a, b, c) {
      a = Q.getWeaponViewID(a);
      if (b in L)
        if (L[b] instanceof Array) {
          if (a in L[b][c]) return L[b][c][a];
        } else if (a in L[b]) return L[b][a];
      return 0;
    };
    Q.SearchNpcShopByItemName = function (a) {
      if ("" == a.cname) return null;
      var b = [],
        c = ha[a.mapname];
      if (c)
        for (var d = 0; d < c.length; d++)
          for (var e = Object.keys(c[d].items), f = 0; f < e.length; f++) {
            var g = Q.getItemInfo(e[f]);
            if (g && ((g = g.identifiedDiSPlayName), g.includes(a.cname)))
              return (
                (a = {
                  map: a.mapname,
                  location: c[d].location,
                  name: c[d].name,
                }),
                b.push(a),
                b
              );
          }
      c = Object.keys(ha);
      for (d = 0; d < c.length; d++)
        for (var e = ha[c[d]], h = 0; h < e.length; h++)
          for (var k = Object.keys(e[h].items), f = 0; f < k.length; f++)
            if ((g = Q.getItemInfo(k[f])))
              if (((g = g.identifiedDiSPlayName), g.includes(a.cname)))
                return (
                  (a = { map: c[d], location: e[h].location, name: e[h].name }),
                  b.push(a),
                  b
                );
      return b;
    };
    Q.SearchNpcShopByItemId = function (a) {
      if (0 === a.itid) return null;
      var b = [],
        c = ha[a.mapname];
      if (c)
        for (var d = 0; d < c.length; d++)
          for (var e = Object.keys(c[d].items), f = 0; f < e.length; f++)
            if (e[f] == a.itid)
              return (
                (a = {
                  map: a.mapname,
                  location: c[d].location,
                  name: c[d].name,
                }),
                b.push(a),
                b
              );
      c = Object.keys(ha);
      for (d = 0; d < c.length; d++)
        for (var e = ha[c[d]], g = 0; g < e.length; g++)
          for (var h = Object.keys(e[g].items), f = 0; f < h.length; f++)
            if (h[f] == a.itid)
              return (
                (a = { map: c[d], location: e[g].location, name: e[g].name }),
                b.push(a),
                b
              );
      return b;
    };
    Q.getWeaponTrail = function (a, b, c) {
      if (0 === a) return null;
      b = x[b] || x[0];
      a in ItemTable &&
        "ClassNum" in ItemTable[a] &&
        (a = ItemTable[a].ClassNum);
      return (
        "data/sprite/\u00c0\u00ce\u00b0\u00a3\u00c1\u00b7/" +
        b +
        "/" +
        b +
        "_" +
        W[c] +
        ta[a]
      );
    };
    Q.getWeaponSound = function (a) {
      a = Q.getWeaponViewID(a);
      return T[a];
    };
    Q.getWeaponHitSound = function (a) {
      a = Q.getWeaponViewID(a);
      return a === V.NONE ? [fa[a][Math.floor(4 * Math.random())]] : fa[a];
    };
    Q.getJobHitSound = function (a) {
      return a ? da[a] || da[0] : da[0];
    };
    Q.getSkillTreePos = (function () {
      return function (a, b) {
        b = void 0 === b ? -1 : b;
        return -1 == b && void 0 !== Q.SkillTreeView[a]
          ? Q.SkillTreeView[a]
          : -1 < b &&
              void 0 !== Q.SkillTreeView[a] &&
              void 0 !== Q.SkillTreeView[a][b]
            ? Q.SkillTreeView[a][b]
            : -1 == b
              ? []
              : -1;
      };
    })();
    Q.getSkillInTree = (function () {
      return function (a, b) {
        do
          for (var c in Q.SkillTreeView[a])
            if (Q.SkillTreeView[a][c] == b) return c;
        while (a in Q.JobInheritList && void 0 !== (a = Q.JobInheritList[a]));
        return -1;
      };
    })();
    Q.getSkillDesc = (function () {
      return function (a) {
        a = ba[a];
        return (a = y.decodeString(a));
      };
    })();
    Q.getSkillInfo = (function () {
      return function (a) {
        if ((a = w[a]))
          return (
            a._decoded ||
              ((a.SkillName = y.decodeString(a.SkillName)),
              (a._level = 0),
              a._NeedSkillList || (a._NeedSkillList = []),
              (a._decoded = !0)),
            a
          );
      };
    })();
    Q.getAllSkillInfo = (function () {
      return function () {
        return w;
      };
    })();
    Q.getItemInfo = (function () {
      var a = {
        unidentifiedDiSPlayName: "Unknown Item",
        unidentifiedResourceName: "\u00bb\u00e7\u00b0\u00fa",
        unidentifiedDescriptionName: ["..."],
        identifiedDiSPlayName: "Unknown Item",
        identifiedResourceName: "\u00bb\u00e7\u00b0\u00fa",
        identifiedDescriptionName: ["..."],
        slotCount: 0,
        ClassNum: 0,
      };
      return function (b) {
        b = Q.ItemInfo[b] || a;
        b._decoded ||
          ((b.identifiedDescriptionName =
            b.identifiedDescriptionName &&
            b.identifiedDescriptionName instanceof Array
              ? y.decodeString(b.identifiedDescriptionName.join("\n"))
              : ""),
          (b.unidentifiedDescriptionName =
            b.unidentifiedDescriptionName &&
            b.unidentifiedDescriptionName instanceof Array
              ? y.decodeString(b.unidentifiedDescriptionName.join("\n"))
              : ""),
          (b.identifiedDiSPlayName = y.decodeString(b.identifiedDiSPlayName)),
          (b.unidentifiedDiSPlayName = y.decodeString(
            b.unidentifiedDiSPlayName,
          )),
          (b.prefixNameTable = y.decodeString(b.prefixNameTable || "")),
          (b._decoded = !0));
        return b;
      };
    })();
    Q.getAllAchInfo = (function () {
      return function () {
        if (!Q.AchList._decoded) {
          for (var a = Object.keys(Q.AchList), b = 0; b < a.length; b++) {
            var c = a[b],
              d = Q.AchList[c];
            d.title = y.decodeString(d.title);
            d.content[0].summary = y.decodeString(d.content[0].summary);
            d.content[0].details = y.decodeString(d.content[0].details);
            for (var e = Object.keys(d.resource[0]), f = 0; f < e.length; f++)
              ((c = e[f]),
                void 0 != d.resource[0][c].text &&
                  (d.resource[0][c].text = y.decodeString(
                    d.resource[0][c].text,
                  )));
          }
          Q.AchList._decoded = !0;
        }
        return Q.AchList;
      };
    })();
    Q.getAchInfo = (function () {
      return function (a) {
        return Q.AchList[a];
      };
    })();
    Q.getTownInfo = (function () {
      return function (a) {
        a = Q.TownInfo[a];
        if (!a) return !1;
        if (!a._decoded) {
          for (var b = 0; b < a.length; b++)
            a[b].name = y.decodeString(a[b].name);
          a._decoded = !0;
        }
        return a;
      };
    })();
    Q.getItemPath = function (a, b) {
      a = Q.getItemInfo(a);
      return (
        "data/sprite/\u00be\u00c6\u00c0\u00cc\u00c5\u00db/" +
        (b ? a.identifiedResourceName : a.unidentifiedResourceName)
      );
    };
    Q.getItemName = function (a, b) {
      b = void 0 === b ? !1 : b;
      var c = Q.getItemInfo(a.ITID),
        d = "",
        e = 0,
        f;
      if (!a.IsIdentified) return c.unidentifiedDiSPlayName;
      a.RefiningLevel && (d = "+" + a.RefiningLevel + " ");
      if (a.slot)
        switch (a.slot.card1) {
          case 255:
            a.makerInfo && ((f = a.makerInfo.CName), (d += f));
            d += "\u953b\u9020\u7684";
            break;
          case 254:
            a.makerInfo && ((f = a.makerInfo.CName), (d += f));
            d += "\u6253\u9020\u7684";
            break;
          case 65280:
            a.makerInfo && ((f = a.makerInfo.CName), (d += f));
            d += "\u5b75\u5316\u7684";
            break;
          default:
            f = ["", "\u4e24\u500d ", "\u4e09\u500d ", "\u56db\u500d "];
            var g = [0, 0, 0, 0],
              h,
              k = [],
              l,
              m = 0,
              n;
            for (l = 1; 4 >= l && a.slot["card" + l]; ++l)
              if ((h = Q.getItemInfo(a.slot["card" + l]).prefixNameTable))
                ((n = k.indexOf(h)),
                  -1 < n ? g[n]++ : ((k[m] = h), g[m]++, m++));
            for (l = 0; l < m; ++l) d += f[g[l] - 1] + k[l] + " ";
        }
      f = { 0: 450, 1: 452, 2: 454, 3: 451, 4: 453 };
      g = { 1: 459, 2: 460, 3: 461 };
      a.slot && 255 == a.slot.card1
        ? (d +=
            (0 < Math.round(a.slot.card2 / 1280)
              ? Q.getMessage(g[Math.round(a.slot.card2 / 1280)])
              : "") +
            Q.getMessage(f[a.slot.card2 % 1280]) +
            c.identifiedDiSPlayName)
        : ((d += c.identifiedDiSPlayName),
          c.slotCount && !b && (d += " [" + c.slotCount + "]"));
      if (a.options && 0 <= a.options.Index0) {
        for (l = 0; 5 > l; l++) a.options["Index" + l] && e++;
        0 < e && (d += " [" + e + "]");
      }
      return d;
    };
    Q.getMessage = function (a, b) {
      return a in Y ? y.decodeString(Y[a]) : void 0 !== b ? b : "NO MSG " + a;
    };
    Q.getSignBoard = function (a) {
      if (void 0 === a) return [];
      a = a.substring(0, a.length - 4);
      return void 0 == sa[a] ? [] : sa[a].slice(0);
    };
    Q.getQuestInfo = function (a) {
      return ka[a];
    };
    Q.isIndoor = function (a) {
      if (void 0 === a) return -1;
      a =
        ".gat" == a.substring(a.length - 4, a.length)
          ? a.replace(".gat", ".rsw")
          : a;
      return void 0 === ra[a] ? !1 : ra[a].indoor || !1;
    };
    Q.getMap = function (a) {
      a = a.replace(".gat", ".rsw");
      return ra[a] || null;
    };
    Q.getMapName = function (a, b) {
      a = a.replace(".gat", ".rsw");
      return a in ra && ra[a].name
        ? y.decodeString(ra[a].name)
        : "undefined" === typeof b
          ? Q.getMessage(187)
          : b;
    };
    Q.isBaby = function (a) {
      return -1 < M.indexOf(a);
    };
    Q.base64encode = function (a) {
      function b(a) {
        return String.fromCharCode(26 > a ? a + 65 : 52 > a ? a + 71 : a - 4);
      }
      for (var c = 0, d = 1193046, e = [], c = 0; c < 8 * a.length; c += 6)
        (e.push(
          b(
            (((a.charCodeAt(c >> 3) + (a.charCodeAt((c >> 3) + 1) << 8)) >>
              (c & 7)) ^
              d ^
              (d >> 5)) &
              63,
          ),
        ),
          (d = ((d >> 6) & 262143) | ((d ^ (d >> 5)) << 17)));
      return e.join("");
    };
    Q.base64decode = function (a) {
      var b,
        c = 0,
        d = 0,
        e = 1193046,
        f = [];
      for (b = 0; b < a.length; b++) {
        var g = (e ^ (e >> 5)) & 63,
          h = a.charCodeAt(b),
          d = ((g ^ (64 > h ? h + 4 : 96 > h ? h - 65 : h - 71)) << c) | d,
          e = (((e >> 5) ^ e) << 17) | ((e >> 6) & 262143);
        8 <= (c += 6) &&
          (f.push(String.fromCharCode(d & 255)), (d >>= 8), (c -= 8));
      }
      return f.join("");
    };
    Q.getCookie = function (a) {
      return (a = document.cookie.match(
        new RegExp(
          "(?:^|; )" +
            a.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
            "\x3d([^;]*)",
        ),
      ))
        ? decodeURIComponent(a[1])
        : void 0;
    };
    Q.setCookie = function (a, b) {
      var c = new Date(new Date().getTime() + 220752e6);
      document.cookie = a + "\x3d" + b + "; expires\x3d" + c.toUTCString();
    };
    Q.clearCookie = function (a) {
      var b = new Date(new Date().getTime());
      document.cookie = a + "\x3d0; expires\x3d" + b.toUTCString();
    };
    Q.getworldData = function (a) {
      return oa[a];
    };
    Q.getnavigateData = function (a) {
      return ga[a];
    };
    Q.getmobData = function (a) {
      return la[a];
    };
    Q.searchMob = function (a) {
      for (var b = Object.keys(la), c = b.length, d = [], e, f = 0; f < c; f++)
        if (((e = 0), la[b[f]].kName.match(a))) {
          for (var g = 0; g < d.length; g++)
            if (d[g].kName == la[b[f]].kName) {
              e = 1;
              break;
            }
          0 == e && ((la[b[f]].ID = b[f]), d.push(la[b[f]]));
        }
      return d;
    };
    Q.searchMob2 = function (a) {
      for (var b = [], c = 0; c < a.length; c++)
        if (void 0 != la[a[c].id]) {
          var d = la[a[c].id];
          d.ID = a[c].id;
          b.push(d);
        }
      return b;
    };
    Q.searchMobMap = function (a) {
      for (
        var b = Object.keys(oa), c = b.length, d = [], e, f = 0;
        f < c;
        f++
      ) {
        e = 0;
        var g = oa[b[f]].mobs;
        if (g)
          for (var h = 0; h < g.length; h++)
            if ((g[h] + "").match(a)) {
              for (var k = 0; k < d.length; k++)
                if (d[k].kName == b[f]) {
                  e = 1;
                  break;
                }
              if (0 == e) {
                oa[b[f]].kName = b[f];
                d.push(oa[b[f]]);
                break;
              }
            }
      }
      return d;
    };
    Q.getmobName = function (a) {
      return la[a].kName;
    };
    Q.searchItem = function (a) {
      for (
        var b = Q.ItemInfo, c = Object.keys(b), d = c.length, e = [], f, g = 0;
        g < d;
        g++
      ) {
        f = 0;
        var h = Q.getItemInfo(c[g]),
          k = h.identifiedDiSPlayName;
        if (k.match(a)) {
          for (var l = 0; l < e.length; l++)
            if (e[l].identifiedDiSPlayName == k) {
              f = 1;
              break;
            }
          0 == f && ((b[c[g]].ID = c[g]), e.push(h));
        }
      }
      return e;
    };
    Q.searchItem2 = function (a) {
      for (var b = [], c = 0; c < a.length; c++) {
        var d = Q.getItemInfo(a[c].id);
        d && ((d.ID = a[c].id), b.push(d));
      }
      return b;
    };
    Q.searchMobDrop = function (a) {
      for (var b = Object.keys(la), c = b.length, d = [], e, f = 0; f < c; f++)
        for (var g = (e = 0); 10 >= g; g++)
          if (la[b[f]][10 == g ? "DropCardid" : "Drop" + g + "id"] == a) {
            for (var h = 0; h < d.length; h++)
              if (d[h].ID == b[f]) {
                e = 1;
                break;
              }
            0 == e && ((la[b[f]].ID = b[f]), d.push(la[b[f]]));
          }
      return d;
    };
    Q.getRandomJoke = function () {
      return y.decodeString(ia[Math.round(Math.random() * (ia.length - 1))]);
    };
    Q.getRandomScream = function () {
      return y.decodeString(na[Math.round(Math.random() * (na.length - 1))]);
    };
    Q.getPetTalk = function (a) {
      var b = parseInt(a.toString().substring(0, 4)) || 1001,
        c = parseInt(a.toString().substring(4, 6)) || 0;
      a = parseInt(a.toString().substring(6, 7)) || 0;
      if (c >= Object.keys(Z).length || a >= Object.keys(pa).length) return !1;
      var d, e, f;
      b && 1e3 <= b && 4e3 > b && (d = (F[b] || F[1001]).toLowerCase());
      null !== c && void 0 !== c && (e = Q.getPetHungryText(parseInt(c)));
      null !== a && void 0 !== a && (f = Q.getPetActText(parseInt(a)));
      return d && e && f
        ? ja && ja[d] && ja[d][e] && ja[d][e][f]
          ? ja[d][e][f] instanceof Array
            ? ((b = parseInt((100 * Math.random()) % ja[d][e][f].length)),
              y.decodeString(ja[d][e][f][b]))
            : y.decodeString(ja[d][e][f])
          : !1
        : !1;
    };
    Q.getPetHungryState = function (a) {
      return a
        ? 90 < a && 100 >= a
          ? Z.PET_FULL
          : 75 < a && 90 >= a
            ? Z.PET_ENOUGH
            : 25 < a && 75 >= a
              ? Z.PET_SATISFIED
              : 10 < a && 25 >= a
                ? Z.PET_HUNGRY
                : 0 <= a && 10 >= a
                  ? Z.PET_HUNGER
                  : 0
        : 0;
    };
    Q.getPetFriendlyState = function (a) {
      return a
        ? 900 < a && 1e3 >= a
          ? qa.PET_FAMILIAR
          : 750 < a && 900 >= a
            ? qa.PET_FRIENDLY
            : 250 < a && 750 >= a
              ? qa.PET_NORMAL
              : 100 < a && 250 >= a
                ? qa.PET_AWKWARD
                : 0 <= a && 100 >= a
                  ? qa.PET_ASHAMED
                  : 0
        : 0;
    };
    Q.getPetActText = function (a) {
      switch (a) {
        case pa.PM_FEEDING:
          return "feeding";
        case pa.PM_HUNTING:
          return "hunting";
        case pa.PM_DANGER:
          return "danger";
        case pa.PM_DEAD:
          return "dead";
        case pa.PM_CONNENCT:
          return "connect";
        case pa.PM_LEVELUP:
          return "levelup";
        case pa.PM_PERFORMANCE1:
          return "perfor_1";
        case pa.PM_PERFORMANCE2:
          return "perfor_2";
        case pa.PM_PERFORMANCE3:
          return "perfor_3";
        case pa.PM_PERFORMANCE_S:
          return "perfor_s";
      }
      return "stand";
    };
    Q.getPetHungryText = function (a) {
      switch (a) {
        case Z.PET_HUNGRY:
          return "bit_hungry";
        case Z.PET_SATISFIED:
          return "noting";
        case Z.PET_ENOUGH:
          return "full";
        case Z.PET_FULL:
          return "so_full";
      }
      return "hungry";
    };
    Q.getPetEmotion = function (a, b, c) {
      return X[a][b][c] ? X[a][b][c] : !1;
    };
    Q.getPetTalkNumber = function (a, b, c) {
      return parseInt(a.toString() + ("0" + c).slice(-2) + b.toString());
    };
    return Q;
  },
);
