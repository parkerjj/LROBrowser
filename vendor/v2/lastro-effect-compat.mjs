const LEGACY_STR_SKILLS = Object.freeze({
  SU_BITE: "su_bite/su_bite",
  SU_SCRATCH: "su_scratch/su_scratch",
  SU_SV_STEMSPEAR: "su_sv_stemspear/su_sv_stemspear",
  SU_CN_METEOR: "su_cn_meteor/su_cn_meteor0",
  SU_CN_METEOR2: "su_cn_meteor/su_cn_meteor0",
  SU_SCAROFTAROU: "su_scaroftarou/su_scaroftarou",
  SU_PICKYPECK: "su_pickypeck/su_pickypeck",
  SU_PICKYPECK_DOUBLE_ATK: "su_pickypeck/su_pickypeck",
  SU_ARCLOUSEDASH: "su_arclousedash/su_arclousedash",
  SU_LUNATICCARROTBEAT: "su_lunaticcarrotbeat/su_lunaticcarrotbeat",
  SU_LUNATICCARROTBEAT2: "su_lunaticcarrotbeat/su_lunaticcarrotbeat2",
  SU_TUNABELLY: "su_tunabelly/su_tunabelly",
  SU_BUNCHOFSHRIMP: "su_bunchofshrimp/su_bunchofshrimp",
  SU_FRESHSHRIMP: "su_freshshrimp/su_freshshrimp",
  SU_SHRIMPARTY: "su_freshshrimp/su_freshshrimp",
  SU_POWEROFFLOCK: "su_powerofflock/su_powerofflock",
  SU_SVG_SPIRIT: "su_svg_spirit/su_svg_spirit",
  SU_HISS: "su_hiss/su_hiss",
  SU_NYANGGRASS: "su_nyanggrass/su_nyanggrass",
  SU_GROOMING: "su_grooming/su_grooming",
  SU_PURRING: "su_grooming/su_grooming",
  SU_MEOWMEOW: "su_chattering/su_chattering",
  SU_CHATTERING: "su_chattering/su_chattering"
});

const LEGACY_TGA_SKILLS = Object.freeze({
  SU_CN_POWDERING: "effect/catnippowder.tga",
  SU_STOOP: "effect/su_stoop.tga",
  SU_TUNAPARTY: "effect/tunaparty.tga"
});

const LEGACY_GROUND_EFFECTS = Object.freeze({
  UNT_CATNIPPOWDER: {
    file: "effect/catnippowder.tga",
    size: 8
  },
  UNT_NYANGGRASS: {
    file: "effect/nyanggrass.tga",
    size: 8
  }
});

function hasOwn(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key);
}

function ensureStrEffect(effectTable, effectId, file) {
  if (!hasOwn(effectTable, effectId) || !Array.isArray(effectTable[effectId]) || !effectTable[effectId].length) {
    effectTable[effectId] = [{
      type: "STR",
      file,
      texturePath: "",
      renderBeforeEntities: true,
      attachedEntity: true
    }];
  }
}

function ensureTgaEffect(effectTable, effectId, file, options = {}) {
  if (!hasOwn(effectTable, effectId) || !Array.isArray(effectTable[effectId]) || !effectTable[effectId].length) {
    effectTable[effectId] = [{
      type: "3D",
      file,
      alphaMax: 0.8,
      blendMode: 2,
      attachedEntity: true,
      ...options
    }];
  }
}

/**
 * Restore the legacy Doram skill/unit links that are absent from the V2
 * generated tables. Existing server/BSON mappings always win.
 */
export function applyLegacyDoramEffects({ effectTable = {}, skillEffect = {}, skillUnit = {}, skillConst = {}, skillUnitConst = {} } = {}) {
  let skillCount = 0;
  let unitCount = 0;

  for (const [skillName, file] of Object.entries(LEGACY_STR_SKILLS)) {
    const skillId = skillConst[skillName];
    if (!Number.isFinite(Number(skillId))) continue;
    const effectId = `legacy_${skillName.toLowerCase()}`;
    ensureStrEffect(effectTable, effectId, file);
    const entry = skillEffect[skillId] && typeof skillEffect[skillId] === "object" ? skillEffect[skillId] : {};
    if (!hasOwn(entry, "effectId") || entry.effectId === undefined || entry.effectId === null) {
      entry.effectId = effectId;
      skillCount++;
    }
    skillEffect[skillId] = entry;
  }

  for (const [skillName, file] of Object.entries(LEGACY_TGA_SKILLS)) {
    const skillId = skillConst[skillName];
    if (!Number.isFinite(Number(skillId))) continue;
    const effectId = `legacy_${skillName.toLowerCase()}`;
    ensureTgaEffect(effectTable, effectId, file);
    const entry = skillEffect[skillId] && typeof skillEffect[skillId] === "object" ? skillEffect[skillId] : {};
    if (!hasOwn(entry, "effectId") || entry.effectId === undefined || entry.effectId === null) {
      entry.effectId = effectId;
      skillCount++;
    }
    skillEffect[skillId] = entry;
  }

  for (const [unitName, options] of Object.entries(LEGACY_GROUND_EFFECTS)) {
    const unitId = skillUnitConst[unitName];
    if (!Number.isFinite(Number(unitId))) continue;
    const effectId = `legacy_${unitName.toLowerCase()}`;
    ensureTgaEffect(effectTable, effectId, options.file, {
      attachedEntity: false,
      renderBeforeEntities: false,
      ...options
    });
    if (!hasOwn(skillUnit, unitId) || skillUnit[unitId] === undefined || skillUnit[unitId] === null || skillUnit[unitId] === -1) {
      skillUnit[unitId] = effectId;
      unitCount++;
    }
  }

  return { skillCount, unitCount };
}

/**
 * Legacy STR files store only a basename for textures. V1 resolved that
 * basename relative to the STR directory; V2's worker otherwise requests it
 * from the effect root and silently drops the whole animation.
 */
export function resolveStrTexturePath(filename, textureName, texturePath = "") {
  if (String(texturePath || "").trim()) return textureName;
  const normalizedFilename = String(filename || "").replace(/\\/g, "/");
  const normalizedLower = normalizedFilename.toLowerCase();
  const effectRoot = "data/texture/effect";
  const marker = `${effectRoot}/`;
  const rootIndex = normalizedLower.indexOf(marker);
  if (rootIndex < 0) return textureName;
  const parent = normalizedFilename.slice(0, normalizedFilename.lastIndexOf("/") + 1).replace(/\/$/, "");
  if (!parent || parent.toLowerCase() === effectRoot) return textureName;
  const normalizedTexture = String(textureName || "").replace(/\\/g, "/");
  const basename = normalizedTexture.slice(normalizedTexture.lastIndexOf("/") + 1);
  return basename ? `${parent}/${basename}` : textureName;
}


/**
 * Keep the V2 effect render pass bounded to the effects present at its start.
 *
 * The upstream manager increases its live loop bound when repeatEffect()
 * appends a replacement. If that replacement is already at its terminal
 * frame, or an absent STR resource fails synchronously from cache, it can
 * repeatedly append/remove effects without yielding to the browser.
 *
 * Apply this as a source transform during prepare:runtime so the vendored
 * Online.js remains a reproducible upstream snapshot.
 */
export function patchStrEffectLifecycle(source) {
  function patchRegion(input, path, edit) {
    const marker = `//#region ${path}\n`;
    const start = input.indexOf(marker);
    if (start < 0 || input.indexOf(marker, start + marker.length) >= 0) {
      throw new Error(`STR lifecycle patch: missing or duplicate region ${path}`);
    }
    const end = input.indexOf("//#endregion", start + marker.length);
    if (end < 0) throw new Error(`STR lifecycle patch: unclosed region ${path}`);
    const fragment = input.slice(start, end);
    return input.slice(0, start) + edit(fragment) + input.slice(end);
  }

  function replaceCount(text, before, after, expected = 1) {
    const actual = text.split(before).length - 1;
    if (actual !== expected) {
      throw new Error(`STR lifecycle patch: expected ${expected} occurrence(s) of ${JSON.stringify(before)}, got ${actual}`);
    }
    return text.split(before).join(after);
  }

  let output = patchRegion(source, "src/Renderer/EffectManager.js", (region) => {
    // A failed resource must not be re-spawned indefinitely by repeatEffect.
    region = replaceCount(region,
      "if (!Params || !Params.Inst) return 0;",
      "if (!Params || !Params.Inst || effect.loadFailed) return 0;");
    // Appended replacements are rendered next frame, never in this live pass.
    region = replaceCount(region, "size += repeatEffect(effect);", "repeatEffect(effect);", 2);
    // size is the original work budget; it is not the number of survivors.
    return replaceCount(region, "if (size === 0)", "if (list.length === 0)");
  });

  output = patchRegion(output, "src/Renderer/Effects/StrEffect.js", (region) => {
    // The error callback also runs for 404s cached by the resource loader.
    region = replaceCount(region,
      "        () => {\n          this.needCleanUp = true;\n        },",
      "        () => {\n          this.loadFailed = true;\n          this.needCleanUp = true;\n        },");
    // Never sample one frame past maxKey. Reject unusable STR metadata too.
    region = replaceCount(region,
      "      if (!this._lastValidAnim) this._lastValidAnim = {};",
      "      if (!Number.isFinite(keyIndex) || !(strFile.maxKey > 0)) {\n        this.loadFailed = true;\n        this.needCleanUp = true;\n        return;\n      }\n      if (keyIndex >= strFile.maxKey) {\n        this.needCleanUp = true;\n        return;\n      }\n      if (!this._lastValidAnim) this._lastValidAnim = {};");
    return replaceCount(region, "      if (keyIndex >= strFile.maxKey) this.needCleanUp = true;\n", "");
  });
  return output;
}

export { LEGACY_GROUND_EFFECTS, LEGACY_STR_SKILLS };
