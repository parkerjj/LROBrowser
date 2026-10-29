# Halloween Local Appearance and Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Make the 2026 Halloween preview visibly use RO assets through a local player costume and a local-only pumpkin status marker.

**Architecture:** Reuse the player's existing render wrapper to swap only the head-top SPR/ACT during drawing, restoring the original fields in `finally`. Keep the status marker in the existing passive Halloween overlay and load its BMP through the client's resource loader. Both follow `LastROHalloweenEffects` date/preview and disable state.

**Tech Stack:** TypeScript, JavaScript modules, CSS, RO client SPR/ACT/BMP loader.

**Spec:** The user selected local Gothic Pumpkin Head appearance plus a local Pumpkin Curse status marker. Neither may modify equipment or server status. The user requested no test runs.

## Global Constraints

- Apply the seasonal date and preview rules already used by `LastROHalloweenEffects`.
- Never send or mutate server equipment/status data.
- Keep game sprites and item icons sourced from the client assets.
- Do not run tests, as requested by the user.

## Review Focus

- Effects disabled at startup: the player and overlay remain unchanged.
- Preview toggled while logged in: both visuals activate or clear immediately.
- Character entity changes: the render wrapper moves to the current player entity.
- Existing hide-costume option enabled: it continues to restore normal equipment before the Halloween override.
- Pumpkin item asset unavailable: no server state changes or broken-image decoration is introduced.

---

### Task 1: Local player costume

**Files:**
- Modify: `src/assistant/lro-assistant-standard.mjs`

**Interfaces:**
- Consume `LastROHalloweenEffects.seasonal` and `LastROHalloweenEffects.disabled`.
- Resolve the existing item view `1685` through `DB.getHatPath(viewId, sex)`.

- [x] Extend `CostumeVisibilityModule` so it installs its render wrapper while either hide-costume or Halloween rendering is active.
- [x] Temporarily replace only the upper-head view/files while rendering and restore the original values in `finally`.
- [x] Re-sync on Halloween toggle changes and preserve the hide-costume option behavior.

### Task 2: Local status marker and sprite timing

**Files:**
- Modify: `src/halloween/halloween-effects.ts`
- Modify: `src/halloween/halloween.css`
- Modify: `scripts/lastro-worldmap.mjs`

**Interfaces:**
- Load `data/texture/item/Gothic_Pumpkin_Head.bmp` through the existing client image loader.
- Keep the ghost animation gated on its loaded RO sprite image.

- [x] Add a small local Pumpkin Curse marker using the Gothic Pumpkin Head item icon.
- [x] Clear the marker together with the Halloween overlay when effects are disabled.
- [x] Register the item-icon loader after the world-map image loader is initialized.
- [x] Keep the first Whisper animation scheduled only after its image loads.
