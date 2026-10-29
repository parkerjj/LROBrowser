# IWA startup reliability implementation plan

**Goal:** Bundle the server's cursor SPR/ACT locally and show actionable startup errors instead of leaving users waiting indefinitely.

**Design:** Reuse the existing core-asset importer and standalone startup diagnostics. Store the two downloaded passive files in vendor/core/data/sprite, disallow remote cursor fallback in both resource loaders, and report native startup failures through LastROStartupDiagnostics. WebGL guidance covers graphics acceleration, browser/driver updates, and closing other game windows. Package/Worker guidance covers reopening/reinstalling the current client and copying diagnostics without deleting saved accounts.

**Scope approved by:** The user's request in this chat to download/package cursor assets and show solutions for remaining startup errors.

**Constraints:** Work in this repository; no new scripts, proxy, deployment, production signing or account-data changes. Preserve the existing pnpm-workspace.yaml edit.

## Tasks

- [x] Add failing behavioral regressions for cursor package import/local-only resolution, native cursor failure reporting, asynchronous renderer errors, Worker errors, and user-facing guidance.
- [x] Extend the existing passive-asset download list and importer whitelist; download and validate cursors.spr/cursors.act from the approved resource origin.
- [x] Fix vendor Cursor.init failure callbacks and GameEngine startup phases/error propagation. Extend the existing Worker patch to surface native errors without adding a script.
- [x] Add contextual help to the existing standalone startup screen, including stalled stages and damaged local packages. Retain successful-login cleanup.
- [x] Run focused tests, then lint, typecheck, the project test suite, build, IWA audit and diff checks. Verify the actual built Worker loads packaged cursor files without remote requests.

## Verification

- All 25 focused startup regressions pass, including local-only cursor resolution, failure reporting, WebGL/Worker errors and contextual recovery guidance.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`, the final Vite rebuild, `pnpm audit:iwa` and `git diff --check` pass.
- The built real resource Worker reads and parses both packaged cursor files. All requests remain on the simulated package origin; downloaded, staged and built bytes match their manifest hashes.
- Full Windows suite: 4520 passed, 8 failed, 4 skipped. Failures concern path separators, Windows junction creation, unavailable `ln`, TAR command length and local-server timeouts. The user explicitly accepted leaving these Windows issues outside this change because final testing and packaging run on Linux. Linux tests have not been run in this session.
- Cursor files: SPR 15,259 bytes; ACT 13,420 bytes. Source URLs are recorded in the existing passive-asset importer.
- This fixes confirmed startup failure-handling gaps. The affected user's original white screen remains unobserved locally; gzip has not been established as its cause.

## Review focus

- Missing or corrupt local cursors must fail visibly without reaching a remote origin.
- Real asynchronous Worker readiness must not let WebGL exceptions escape the startup diagnostics.
- Late game errors after login must not reopen the startup screen.
- A slow but eventually successful startup must still hide the diagnostic screen.
- Resource errors and suggested fixes must not require clearing saved accounts or include credentials.
