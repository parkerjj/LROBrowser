# Halloween Ground Color Grade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Remove the Halloween canvas filter and vignette while applying the existing dark color grade only to GND ground fragments.

**Architecture:** Keep the DOM ghost and three wisps. Extend the existing runtime patcher to add one seasonal uniform and a fixed color matrix to `Ground_default$1`; leave all other shaders untouched.

**Tech Stack:** TypeScript, JavaScript runtime patching, GLSL ES 3.00, Vitest.

**Spec:** User request in the 2026-10-30 conversation.

## Global Constraints

- Keep ghost and wisp sprites; remove only canvas CSS filtering and the full-screen vignette.
- Apply the grade only to the GND Ground shader; exclude sprites, water, RSM models, and effects.
- Keep changes in the existing runtime patch pipeline and do not commit or deploy.

## Review Focus

- Disabled or out-of-season state must send a false uniform.
- Fog must be graded because the former CSS filter ran after fog composition.
- Fragment alpha must remain unchanged.
- Other shader source must not receive the grade.
- DOM ghost and three wisps must remain mounted without a vignette.

---

### Task 1: Remove the Full-Screen DOM/CSS Effects

**Files:** `src/halloween/halloween-effects.ts`, `src/halloween/halloween.css`, `test/halloween-effects.test.ts`

- [x] Write tests for retained ghost/wisps and removed canvas filter/vignette.
- [x] Run focused tests and confirm they fail for the old behavior.
- [x] Remove vignette creation, canvas polling/class attachment, and related CSS.
- [x] Run focused tests and confirm they pass.

### Task 2: Grade GND in the Existing Runtime Shader

**Files:** `scripts/patch-v2-runtime.mjs`, `scripts/patch-v2-runtime.d.mts`, `test/halloween-ground-shader.test.ts`

- [x] Test that the runtime patch adds a seasonal Ground uniform and applies the old color grade after fog, preserving alpha and leaving other shaders alone.
- [x] Run focused tests and confirm they fail because the patch is absent.
- [x] Implement `patchRuntimeHalloweenGround(source)` and invoke it from `patchRuntimeHalloweenWorld`.
- [x] Run focused and full tests, typecheck, changed-file lint, build, and IWA checks; record the unrelated full-lint blockers.
