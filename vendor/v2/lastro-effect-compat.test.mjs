import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { applyLegacyDoramEffects, resolveStrTexturePath, patchStrEffectLifecycle } from "./lastro-effect-compat.mjs";

test("rebases legacy STR texture basenames to the STR directory", () => {
  assert.equal(
    resolveStrTexturePath(
      "data\\texture\\effect\\su_cn_meteor\\su_cn_meteor0.str",
      "data\\texture\\effect\\kkee.bmp"
    ),
    "data/texture/effect/su_cn_meteor/kkee.bmp"
  );
  assert.equal(
    resolveStrTexturePath("data/texture/effect/basic.str", "data\\texture\\effect\\foo.bmp"),
    "data\\texture\\effect\\foo.bmp"
  );
  assert.equal(
    resolveStrTexturePath("data/texture/effect/su_cn_meteor/effect.str", "data/texture/effect/kkee.bmp", "su_cn_meteor/"),
    "data/texture/effect/kkee.bmp"
  );
});

test("fills missing Doram skill and ground-unit mappings without replacing existing ones", () => {
  const effectTable = {};
  const skillEffect = { 5028: {}, 5040: { effectId: "server_effect" } };
  const skillUnit = { 262: -1, 263: "server_ground_effect" };
  const result = applyLegacyDoramEffects({
    effectTable,
    skillEffect,
    skillUnit,
    skillConst: { SU_CN_METEOR: 5028, SU_BUNCHOFSHRIMP: 5040 },
    skillUnitConst: { UNT_CATNIPPOWDER: 262, UNT_NYANGGRASS: 263 }
  });

  assert.equal(result.skillCount, 1);
  assert.equal(result.unitCount, 1);
  assert.equal(skillEffect[5028].effectId, "legacy_su_cn_meteor");
  assert.equal(skillEffect[5040].effectId, "server_effect");
  assert.equal(skillUnit[262], "legacy_unt_catnippowder");
  assert.equal(skillUnit[263], "server_ground_effect");
  assert.equal(effectTable.legacy_su_cn_meteor[0].file, "su_cn_meteor/su_cn_meteor0");
  assert.equal(effectTable.legacy_unt_catnippowder[0].file, "effect/catnippowder.tga");
});

test("uses root TGA assets for skills without a matching STR animation", () => {
  const effectTable = {};
  const skillEffect = {};
  const result = applyLegacyDoramEffects({
    effectTable,
    skillEffect,
    skillConst: { SU_STOOP: 5022, SU_TUNAPARTY: 5039 }
  });

  assert.equal(result.skillCount, 2);
  assert.equal(skillEffect[5022].effectId, "legacy_su_stoop");
  assert.equal(skillEffect[5039].effectId, "legacy_su_tunaparty");
  assert.equal(effectTable.legacy_su_stoop[0].file, "effect/su_stoop.tga");
  assert.equal(effectTable.legacy_su_tunaparty[0].file, "effect/tunaparty.tga");
});

test("covers V1 skill-effect aliases used by Doram support skills", () => {
  const effectTable = {};
  const skillEffect = {};
  applyLegacyDoramEffects({
    effectTable,
    skillEffect,
    skillConst: { SU_SHRIMPARTY: 5051, SU_PURRING: 5050, SU_MEOWMEOW: 5053 }
  });

  assert.equal(effectTable.legacy_su_shrimparty[0].file, "su_freshshrimp/su_freshshrimp");
  assert.equal(effectTable.legacy_su_purring[0].file, "su_grooming/su_grooming");
  assert.equal(effectTable.legacy_su_meowmeow[0].file, "su_chattering/su_chattering");
  assert.equal(skillEffect[5051].effectId, "legacy_su_shrimparty");
  assert.equal(skillEffect[5050].effectId, "legacy_su_purring");
  assert.equal(skillEffect[5053].effectId, "legacy_su_meowmeow");
});

function sourceRegion(source, name) {
  const start = source.indexOf(`//#region ${name}\n`);
  assert.ok(start >= 0, `Missing ${name}`);
  const end = source.indexOf("//#endregion", start);
  assert.ok(end > start);
  return source.slice(start, end);
}

function lifecycleFixture() {
  const source = readFileSync(new URL("./Online.js", import.meta.url), "utf8");
  const patched = patchStrEffectLifecycle(source);
  return { source, patched };
}

test("bounds the live effect render pass and rejects failed STR repeats", () => {
  const { source, patched } = lifecycleFixture();
  assert.notEqual(patched, source);
  const manager = sourceRegion(patched, "src/Renderer/EffectManager.js");
  assert.equal(manager.includes("size += repeatEffect(effect);"), false);
  assert.equal(manager.match(/\brepeatEffect\(effect\);/g)?.length, 2);
  assert.ok(manager.includes("if (list.length === 0)"));
  assert.ok(manager.includes("!Params.Inst || effect.loadFailed"));

  const repeatCode = manager.match(/function repeatEffect\(effect\) \{[\s\S]*?\n\}/)?.[0];
  const renderBlock = manager.match(/    static render\(gl, modelView, projection, fog, tick, renderBeforeEntities\) \{[\s\S]*?\n    \}\n    \/\*\*/)?.[0];
  assert.ok(repeatCode);
  assert.ok(renderBlock);
  const renderMethod = renderBlock.slice(0, -7);
  const context = {
    Renderer: { tick: 123 },
    SessionStorage_default: { Entity: { position: [0, 0, 0] } },
    GraphicsSettings: { performanceMode: false, viewArea: 20 },
    _list$4: {},
  };
  const EffectManager = vm.runInNewContext(
    `${repeatCode}\nclass EffectManager {\n${renderMethod}\n}\nEffectManager`,
    context,
  );
  let rendered = 0;
  let spawned = 0;
  let released = 0;
  class MockEffect {
    static ready = true;
    static beforeRender() {}
    static afterRender() {}
    static free() { released++; }
  }
  function createEffect(loadFailed) {
    return {
      constructor: MockEffect,
      ready: true,
      needCleanUp: true,
      loadFailed,
      renderBeforeEntities: false,
      _Params: {
        Init: { ownerAID: 1 },
        Inst: {
          position: [0, 0, 0], effectID: 12, duplicateID: 0,
          persistent: true, repeatEnd: 0, repeatDelay: 0, duration: -1, endTick: -1,
        },
        effect: { type: "STR" },
      },
      render() { rendered++; this.needCleanUp = true; },
      free() {},
    };
  }
  context._list$4.MockEffect = [createEffect(false)];
  EffectManager.spamEffect = (params) => {
    spawned++;
    const failed = createEffect(true);
    failed._Params = { ...failed._Params, Init: params.Init, effect: params.effect };
    context._list$4.MockEffect.push(failed);
  };
  EffectManager.render(null, null, null, {}, 123, false);
  assert.equal(rendered, 1, "a replacement must not render in its creation frame");
  assert.equal(spawned, 1);
  assert.equal(context._list$4.MockEffect.length, 1, "replacement must stay registered");
  assert.equal(released, 0, "renderer must not be freed while a replacement remains");
  EffectManager.render(null, null, null, {}, 124, false);
  assert.equal(rendered, 2);
  assert.equal(spawned, 1, "a failed replacement must not spawn another");
  assert.equal(context._list$4.MockEffect, undefined);
  assert.equal(released, 1);
});

test("stops STR rendering before sampling past the final frame", () => {
  const { patched } = lifecycleFixture();
  const str = sourceRegion(patched, "src/Renderer/Effects/StrEffect.js");
  assert.ok(str.includes("this.loadFailed = true;\n          this.needCleanUp = true;"));
  const match = str.match(/    render\(gl, tick\) \{[\s\S]*?\n    \}\n    \/\*\*/);
  assert.ok(match);
  const renderMethod = match[0].slice(0, -7);
  const loaded = { fps: 10, maxKey: 20, layernum: 1,
    get layers() { throw new Error("must not sample beyond maxKey"); } };
  const StrEffect = vm.runInNewContext(
    `class StrEffect {\n${renderMethod}\n}\nStrEffect`,
    { Client: { loadFile: () => loaded } },
  );
  const effect = Object.create(StrEffect.prototype);
  effect.filename = "ranger.str";
  effect.startTick = 0;
  effect.render(null, 2000);
  assert.equal(effect.needCleanUp, true);
  loaded.maxKey = 0;
  const malformed = Object.create(StrEffect.prototype);
  malformed.filename = "broken.str";
  malformed.startTick = 0;
  malformed.render(null, 100);
  assert.equal(malformed.needCleanUp, true);
  assert.equal(malformed.loadFailed, true);
});

test("fails safely if the pinned STR lifecycle patch anchors drift", () => {
  const { source } = lifecycleFixture();
  assert.throws(
    () => patchStrEffectLifecycle(source.replace("size += repeatEffect(effect);", "repeatEffect(effect);")),
    /STR lifecycle patch: expected 2 occurrence/,
  );
});
