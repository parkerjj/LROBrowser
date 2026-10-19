// Repeated NPC packets call GUIComponent.append(), even while the dialog remains mounted.
// Patch the vendor-owned lifecycle instead of installing another runtime observer.
function rewriteRegion(source, path, edits) {
  const marker = '//#region ' + path + '\n';
  const start = source.indexOf(marker);
  if (start < 0 || source.indexOf(marker, start + marker.length) >= 0)
    throw new Error('anchor:ui-lifecycle:' + path);
  const end = source.indexOf('//#endregion', start + marker.length);
  if (end < 0) throw new Error('anchor:ui-lifecycle:end:' + path);
  let region = source.slice(start, end);
  for (const [label, before, after] of edits) {
    if (region.split(before).length !== 2)
      throw new Error('anchor:ui-lifecycle:' + label);
    region = region.replace(before, after);
  }
  return source.slice(0, start) + region + source.slice(end);
}

export function patchRuntimeScrollbarObserverLifecycle(source) {
  return rewriteRegion(source, 'src/UI/GUIComponent.js', [
    ['scrollbar-remove',
      '    remove() {\n      this.__active = false;',
      `    remove() {
      this.__active = false;
      // Invalidate every delayed scrollbar scan from the previous mount.
      this.__scrollbarGeneration = (this.__scrollbarGeneration || 0) + 1;
      if (this.__scrollbarSetupTimer != null) {
        clearTimeout(this.__scrollbarSetupTimer);
        this.__scrollbarSetupTimer = null;
      }`],
    ['scrollbar-setup',
      '    _setupScrollbars() {\n      const self = this;',
      `    _setupScrollbars() {
      // append() is also called for each SAY_DIALOG / WAIT_DIALOG packet.
      // Never replace the only observer reference while leaving its predecessor active.
      if (this.__scrollbarObserver || this.__scrollbarSetupTimer != null) return;
      const generation = this.__scrollbarGeneration = (this.__scrollbarGeneration || 0) + 1;
      const self = this;`],
    ['scrollbar-start',
      '      setTimeout(() => {\n        if (!this._host || !this._host.parentNode) return;\n        const checkScrollbars = (el) => {\n          const candidates = [el, ...el.querySelectorAll("*")];',
      `      this.__scrollbarSetupTimer = setTimeout(() => {
        this.__scrollbarSetupTimer = null;
        if (!this.__active || !this._host?.isConnected || this.__scrollbarGeneration !== generation) return;
        const checkScrollbars = (el) => {
          // Also stop the 50/150/500ms follow-up scans after removal or remount.
          if (!this.__active || !this._host?.isConnected || this.__scrollbarGeneration !== generation) return;
          const candidates = [el, ...el.querySelectorAll("*")];`],
  ]);
}

export function patchRuntimeSameMapSignboardCleanup(source) {
  return rewriteRegion(source, 'src/Renderer/MapRenderer.js', [
    ['same-map-signboards',
      '      const gl = Renderer.getContext();\n      EntityManager.free();\n      Damage.free(gl);\n      EffectManager.free(gl);',
      `      const gl = Renderer.getContext();
      // Cross-map loads free these in MapRenderer.free(); same-map entries
      // also rebuild them in onMapChange(), so release the previous set first.
      SignboardManager.free();
      EntityManager.free();
      Damage.free(gl);
      EffectManager.free(gl);`],
  ]);
}
