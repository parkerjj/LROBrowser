# LastRO runtime patch consolidation — independent final review

**Latest status (2026-10-07): scoped re-review PASS at `04da13f9508e534233c495cef5cf632ad88d5ada`; F1/F2 closed. See [scoped re-review](#scoped-re-review-after-f1f2-repair--2026-10-07). The initial Changes Requested verdict below is retained as review history.**

Review performed: 2026-10-06–2026-10-07. Reviewer: fresh independent `gpt-6.1-sol` / `high` agent. Review is read-only except this report; no child agents, code edits, index/build refresh, installation, deployment, signature, push or merge.

## Verdict

**Spec compliance: CHANGES REQUESTED. Code quality: CHANGES REQUESTED. Ready for integration: NO, pending F1 and scoped re-review.**

Critical: none. Important: one (F1, regression-test migration). Minor: one (F2, source-identity documentation). No reproducible production correctness or security defect was found in this review. The passing broad gates are real evidence for the current implementation; they do not discharge the explicit requirement to preserve prior behavioral assertions. F1 is a test/spec-compliance finding, not a claim that the shipped runtime currently chooses the wrong route.

## Exact scope and authorities

Reviewed the **whole** `ffbb99f681d474500bbffd536c7bfdc0855752ad..b17a473417451d1b91f4ef656deae2dd2c232b54` range: 174 changed paths, including the full vendor migration, retained adapters, deleted/renamed/merged modules and declarations, checker, extraction helpers, test/fixture changes, vendor Node-test harness changes and documentation. This is not `HEAD~1`. HEAD and clean tracked state were checked immediately before writing this report.

Authorities: the approved design at `docs/superpowers/specs/2026-10-05-lastro-runtime-patch-consolidation-design.md`; plan at `docs/superpowers/plans/2026-10-05-lastro-runtime-patch-consolidation.md`; implementation report at `docs/superpowers/reports/2026-10-05-lastro-runtime-patch-consolidation.md`; frozen brief/package at `generated/runtime-consolidation/final-review-brief.md` and `final-review-package.json`; progress and Task 1–14 reports/artifacts as historical evidence. Global/repository rules and RTK instructions were read. CodeGraph was consulted first for structural discovery; actual files and Git objects were authoritative. `code-review` and `requesting-code-review` skills were applied, with the explicit no-child-agent/read-only scope taking precedence over default delegation workflows.

The review treats the user-approved 31 permanent modules (27 retired, four reusable mirrors), packet-layout rename and six-source display merge as authorized. Account, tools, shortcut settings, teleport, chat/NPC/achievement links, cards, quests, appearance and equipment catalog/view remain modular. The fixed 40 retirement records, 12 display relocations, 31-module/161-owner matrix, 62 protected owners, 99 existing editable owners and four retired host APIs are requirements, not metadata to delete to obtain a pass.

## F1 — Important: prior behavior controls were deleted and exact preservation checks weakened

**Primary current locations:** `test/lastro-entity-sync.test.ts:175`, `test/lastro-entity-sync.test.ts:455`, `test/lastro-movement-input.test.ts:277`. Related ten-file inventory follows.

**Trigger and effect:** running the migrated tests no longer checks several contracts that the original tests checked. A nonempty route with different coordinates satisfies line 175; line 455 compares the same current vendor declaration with itself; the crowd matrix skips every failed lookup at line 277 and only validates successful cells, so different selection order, missed available cells, or even all-false results are not rejected by that matrix case. The original bug controls were removed rather than migrated into bounded historical fixtures. This violates design §10.1: “不能继续 patch 当前 vendor，也不能直接删除旧行为断言.” Ruling 9/Task 9's nine retired anchor/formatting cases do not waive behavioral controls in these ten files.

The concrete preservation losses are:

| Current location | BASE evidence | Lost contract; existing replacement and its limit |
| --- | --- | --- |
| `test/lastro-entity-sync.test.ts:172–175` | BASE:182–185 compared the complete `fixed.walk.path` with `native.walk.path` after `(1,1) → (20,10)`. | Replaced with `walk.total > 0`; oversized/blocked/loading/local rejection remains, but ordinary route identity is absent. |
| `test/lastro-entity-sync.test.ts:455–456` | BASE:500 compared patched `walkToNonWalkableGround` with the upstream declaration. | Both sides now extract the same current vendor function. Separate 32-step follower execution cases remain, but this assertion cannot detect any API/body change. |
| `test/lastro-movement-input.test.ts:265–289` | BASE:248 `retains native free-cell order for crowds, rounded positions, exclusions, terrain, and map edges` compared exact `{ found, out }` for 10 seeds × 3 target positions × 2 player positions × 4 ranges = 240 samples. | Only successful results are checked for bounds/range/walkability/occupancy. Exact result and candidate order, including failures, are lost. Existing corridor/fresh-click cases constrain a few results, not this matrix. |

The following original old-side behavior controls are also absent. BASE line numbers refer to the pinned BASE Git object; current locations identify their surviving fixed-side scenarios or the point at which the removed scenario should be restored. Titles are quoted as identities, not inferred from suite counts.

| File and current location | Original BASE case/old-side assertion | Surviving fixed-side coverage |
| --- | --- | --- |
| `test/lastro-entity-sync.test.ts:144` | BASE:148 short detour/index collisions: old route total 0 and position `[27,50,77]` (both player/entity packets). | Permanent detour route, legal path, finite positions and arrival remain. |
| `test/lastro-entity-sync.test.ts:269` | BASE:280 `reproduces native coordinate overflow on a 32-step route`: total 66, buffer 64, nonfinite coordinate encountered. | Eight actual-runtime 32-step finite-coordinate cases remain. |
| `test/lastro-entity-sync.test.ts:318` | BASE:343 `reproduces the native wait for attack motion plus 200ms before showing a received death`: IDLE, 1600ms timer, lookup removal, eventual DIE. | Actual immediate death/pending multihit cleanup remains. |
| `test/lastro-entity-sync.test.ts:361` | BASE:397 `reproduces the native ignored moveStartTime and fixes it for monsters and players`: old position x=1 and tick=10000. | Actual monster/player position x≈3 and tick remain. |
| `test/lastro-entity-sync.test.ts:388` | BASE:429 stale displayed position crosses wall: old x≈3. | Actual corrected x≈5/y=3/z=8 remains. |
| `test/lastro-equipment-animation.test.ts:131` | BASE:133 one-shot completion: old body frame 0 at 400ms. | Actual final frame 3, stopped animation and later frame persistence remain. |
| `test/lastro-equipment-animation.test.ts:140` | BASE:143 completion across six directions: old body action 5 but head action 0. | Actual all-part action/direction and subsequent IDLE remain. |
| `test/lastro-equipment-animation.test.ts:151` | BASE:156 robe/body ordering: old robe frames 5 vs 2 for opposite draw orders. | Actual equality across draw order remains. |
| `test/lastro-equipment-animation.test.ts:197` | BASE:206 composite clock: old draw had more than one frame when the clock advances per resource. | Actual `[1,1,1,1]` remains. |
| `test/lastro-equipment-animation.test.ts:271` | BASE:285 `reproduces movement-dependent cosmetic acceleration in the original renderer`: old frames differ at speeds 50/300. | Actual frame 2 at both speeds remains. |
| `test/lastro-equipment-cart.test.ts:144` | BASE:151 `reproduces the CSS-hidden native button and repairs EquipmentV%i`: both old button displays remain `none` despite hasCart, for versions 0/4. | Actual hidden/visible/repeated/removed state checks remain. |
| `test/lastro-manual-skill.test.ts:130` | BASE:131 `reproduces and repairs %s target input after a native skill notification`: old amotionTick=2000 and no send for direct/keyboard/mouse/list. | Actual one correct skill packet per input path remains. |
| `test/lastro-movement-input.test.ts:225` | BASE:203 `reproduces the original lost second click within its 200ms throttle`: only first `[10,20]` packet after second click. | Actual captured second-click/backward-render-tick behavior remains. |
| `test/lastro-movement-input.test.ts:292` | BASE:267 packed-crowd control: old `forEach` called 1330 times, exact false result. | Actual one scan, false result and target fallback remain. |
| `test/lastro-movement-input.test.ts:451` | BASE:430 friendly PC control: old `onMouseDown` returns true, onFocus never called, zero move sends. | Actual friendly false/false and one movement packet plus protected-interaction matrix remain. |
| `test/lastro-movement-sync.test.ts:322` | BASE:325 `reproduces native movement through stun followed by a server STOP correction`: old movement advances >5, same epoch, then authoritative STOP. | Actual five control-state cancellations, epoch and fractional position/STOP behavior remain. |
| `test/lastro-movement-sync.test.ts:451` | BASE:466 `reproduces the native empty-route buffer check after decoding a real FASTMOVE packet`: decoded target, path length 66, total 0, speed 10, unchanged position. | Actual unreachable target correction and legal 32-step FASTMOVE behavior remain. |
| `test/lastro-player-corpse.test.ts:136` | BASE:130 `reproduces a remote corpse orphaned from lookup while remaining rendered after resurrection and departure`: null lookup, retained actor/death/remove_tick/render behavior. | Actual same-entity death/resurrection/departure coverage remains. |
| `test/lastro-player-corpse.test.ts:159` | BASE:138 `reproduces a second rendered actor when the native orphaned GID enters again`: two GID copies and both render. | Actual single re-entering GID and lookup identity remain. |
| `test/lastro-skill-cooldown.test.ts:91` | BASE:93 `reproduces canceled native refresh after reappend at %i ms` at 3000/8000ms: old overlay retained, Delay=6000, no pending callback. | Actual live-deadline resume and expired-deadline clearing remain. |
| `test/lastro-weapon-view-fallback.test.ts:120` | BASE:121 `reproduces the native retry of the same missing Main Gauche SPR and changes only its failure fallback`: old requested→requested retry and initial request parity. | Actual requested→base fallback, loaded files/weapon and old/new packet variants remain. |
| `test/vending-movement-runtime.test.ts:125` | BASE:117 `reproduces the native lost shared freeze and movement-send bypass`: after clearing shared FreezeUI, old build/send each called once. | Actual final-send guard, shopping gates, close/native packet/lifecycle checks remain. |

The six existing fixtures/provenance entries cover audio, emoticons, party, showshop and bounded UI-state/Quest owners. They do not contain these ten-file historical controls. Actual fixed-side behavior was generally retained, so this finding does **not** demand restoring retired patch imports, adding a second fixed implementation, or reverting the migration.

**Minimal fix:** recover only the old regions/functions used by the controls above from the pinned source history, record source commit/file hash, exact region/symbol and fixture hash in provenance, and execute the controls in their existing sandboxes. Share bounded upstream declarations across the related entity/corpse and movement suites. For cases previously using an intermediate entity-sync result, keep only the unchanged upstream handler responsible for the old bug and bind explicit actual permanent dependencies; do not store a full patched bundle or a duplicate repaired implementation. Keep every fixed-side test on actual vendor/generated source. Restore the ordinary route's exact expected array (or upstream-vs-current exact result), make the follower comparison non-tautological against bounded upstream source or an explicit API/behavior contract, and restore all 240 exact `{found,out}` comparisons including failures. The existing successful fixed-side cases are useful and should remain. Verify the ten affected suites, fixture provenance/source extraction and the new checks' ability to reject a changed expected route/order or missing behavior; unchanged build/IWA gates need no rerun for test/docs-only repair.

## F2 — Minor: owned vendor byte count is mislabeled as prepared output

**Location:** `docs/superpowers/reports/2026-10-05-lastro-runtime-patch-consolidation.md:10`.

The owned vendor hash `2eb4725e…` is followed by `(14,924,181 bytes after preparation)`. Direct read of the owned vendor and the frozen package gives **13,385,917 bytes**. **14,924,181 bytes** belongs to each prepared/packaged copy with hash `8f3b3636…`. A reader verifying the vendor identity against this durable report obtains a contradictory size. Minimal fix: label the vendor as 13,385,917 source bytes and retain 14,924,181 for prepared output. No runtime change is needed.

## Production, ownership and composition review

The requested migration is present and scoped. Core definitions and initialization remain in bundle lexical context; retained product serializers use explicit permanent dependencies. The packet-layout rename is content-identical and preserves legacy anchor diagnostics/build position. Independently compared exported function declarations from the six original display modules with the merged source: eleven directly named exports were identical; the coordinator/private-helper and nine-owner job-name selector changes were separately read and checked. The early/late display stages preserve original relative order. The portrait resource guard is excluded by precise owner/argument context, rather than changing the expected nine display lookups to ten.

WorldMap retains the original twelve init calls in order, GUI construction before action factories, an empty default action object/unique marker, one final assignment of navigate/teleport/cancelTeleport and one installer spread. The resolver's four consumers (WorldMap/NPC/Achievement/Tools) preserve filename and `DB.mapalias` semantics and bind to the unique permanent declaration. Diagnostic placement preserves lexical ownership before `onMapComplete`. Four reusable modules stay pure host mirrors, with actual embedded parity checked; the server-walk/costume helpers have separate embedded parity.

The retained UI composition was reviewed against the final runtime: both shortcut-settings and teleport-settings Graphics append serializers preserve `_preferences$32` and native/permanent snapshot order; Hotkeys enters the exact third arrow callback; Quest retains the native append wrapper and adapts only bridge serialization; NPC helpers precede the permanent button fallback/registration. Tools/card teardown anchors preserve drag → tools → vending → card → movement ordering. Missing/duplicate/shape drift fails instead of using a retired-core fallback.

The checker uses fixed 31/161/62/99/40/12/4 contracts and lexical/module-origin acquisition, including decoded serialized code. The 99 editable existing owners match the explicit Task 12 exception table; allowing their residual product/localization edits does not authorize host reinjection of the 62 migrated definitions. Comparison preserves AST/ASI context, directives/regex/tagged-template raw spelling and cooked ordinary literals, while allowing only the exact seven audio relocations and four pinned WorldMap/resolver/diagnostic deltas. Full source parses reached the real end (vendor/old final/new final: 3682/3714/3715 statements); the embedded SUB character does not truncate AST coverage.

Independent in-memory probes on the actual pinned sources confirmed three historical holes are now rejected: (1) NPC-local resolver shadow inserted into both old/new outputs makes comparison unequal with “permanent resolver callee is shadowed or unresolved”; (2) namespace import with a query suffix followed by copied `createWorldMapIndex.toString()` is rejected; (3) `node:module` createRequire acquisition of `WORLD_MAP_HTML` is rejected. These were read-only probes, not new production transformations or behavior allowlist entries.

## All twelve rulings considered

| Ruling | Review judgment, reason and accepted cost |
| --- | --- |
| 1 | Accepted: explicit serial/shared-checkout and implementer self-review authorization, with this separate whole-range review. Reduced isolation/per-task independent review is an accepted process cost. |
| 2 | Accepted: old-path metadata and negative fixtures are necessary; active imports/calls/declarations are checked by ownership. String hits alone are not executable-source evidence. |
| 3 | Accepted: exact audio candidate/residual proof preceded apply; the residual CLI/manifest subsequently ran. Nominal order was not replayed; candidate/output identity supplies the relevant control. |
| 4 | Accepted: two exact trailing-space edits were pinned and outside literals; no general vendor normalization or build maintenance path. Byte-format identity has the stated two-line cost. |
| 5 | Accepted: card invalidation follows the unique direct close-vending calls; product remains modular. Cancellation-order risk is constrained by final equality/order tests. |
| 6 | Accepted: host-only skill-data path adapter addresses Vite URL rewriting with standard file/path semantics. Runtime data/API/origins are unchanged; encoded filename/direct-caller tests are present. |
| 7 | Accepted: exact direct-or-third-arrow Quest selector, with drift rejection. No broad idempotent matching; refresh/order is covered. |
| 8 | Accepted: one ordinary CSS literal uses explicit space escapes with equal decoded value. Tagged/raw strings are not excused; literal and AST proof constrains the trivia change. |
| 9 | Accepted: exact optional-chain drag-cancel anchor for Tools and preserved cleanup order. Separately, the recorded nine Task 9 anchor/formatting-only test removals are reasonable; this does not excuse F1's behavior deletions. |
| 10 | Accepted: both Graphics serializers, Hotkeys, Quest native-plus-bridge composition and NPC helper ordering match final native/product behavior. The disproved Quest unwrap is not present. Private guards and VM/drift tests constrain serializer free-variable/order risk. |
| 11 | Accepted: four resolver consumers bind to one permanent helper; lexical-shadow proof/negative is now effective. An unknown fifth caller remains a rejection, not a permitted expansion. |
| 12 | Accepted: all twelve original WorldMap initializers remain ordered; five extra existing client dependencies are initialized when no actions are bound. This accepted direct-vendor cost avoids changing final lifecycle order; no product implementation is absorbed. |

## Considered and set aside

Each entry states the particular behavior and why it is not an open finding. F1/F2 above remain open and are excluded from this list.

1. Audio listener/context duplication or early const evaluation: one initialization, seven exact relocations, preserved final side-effect order and actual audio deadline/unlock/retry/cleanup cases; no duplicate listener was found.
2. Clock wrap/reset and route/corpse behavior losing lexical dependencies: current helper bodies/scope and actual vendor tests cover lifecycle, finite routes and timing; no production delta beyond the approved consolidation was found. Missing historical test controls remain F1.
3. Equipment renderer/action/costume or manual-skill behavior copied with stale appearance data: retained catalog/view/appearance transforms remain modular, final source equality and actual rendering/skill tests constrain composition. Historical controls remain F1.
4. Receive recovery/close drain changing framing or late-socket ownership: permanent actual handlers and vendor Node fixtures retain framing/32–96-frame drain/late socket checks; new harness dependencies are actual permanent helpers.
5. BasicInfo/Mail/shop/typography mounting before early localization: final literal comparison and explicit localized runtime expectations preserve HTML/CSS/resource keys; translation is not blanket skipped.
6. Portrait MonsterTable lookup being localized as display text: nine exact display owners and the sole second-argument resource guard exclusion are guarded by missing/duplicate/unknown-lookup negatives.
7. WorldMap action-free default or product factories performing I/O too early: empty actions plus optional callbacks, original init order, constructor/no-I/O tests and final action/lifecycle comparisons constrain the seam.
8. WorldMap core/template/portrait mirrors drifting: parity uses actual embedded source and corresponding host source; browser fixture now uses prepared embedded implementation rather than overriding it with host functions.
9. Resolver shadows silently changing resource names: actual-source lexical shadow probe rejects; four known binding/call signatures are checked. Historical false acceptance is resolved in current code.
10. Namespace/query/hash/file-URL or require/createRequire copying core from a mirror: canonical origins and lexical aliases/loaders are audited; actual namespace-query and createRequire negatives reject. No general adversarial-JavaScript assurance is claimed.
11. Protected definitions hidden inside serialized strings/templates: decoded source/owner checks and negative contracts cover the accepted host patterns; fixed registry sizes and actual owner uniqueness remain intact.
12. Current source parsing ending at SUB/opaque tail: independent full-AST statement/end check reached all three complete sources; the earlier scanner limitation is historical, not current loss of coverage.
13. ASI/regex/tagged-template/directive semantic changes erased by token normalization: AST boundaries and raw spelling checks were read and negative controls retained; ordinary cooked UI strings are the allowed normalization.
14. Graphics free variables or wrapper overwrite: exact `_preferences$32`, original append/callback/snapshot sequence and both settings serializers remain; final code and behavior negatives constrain composition.
15. Quest native wrapper unwrapped/doubled: native wrapper remains, bridge only is composed, and actual native append/bridge VM/drift cases exist.
16. NPC helper declaration after invocation or fallback hiding a partial permanent source: helpers are before fallback/registration; old raw fallback requires both permanent marker/helper absent, partial shapes reject.
17. Tools/card cleanup changed by item drag/vending consolidation: unique direct-expression selectors and strict order checks preserve teardown order.
18. Superseded Preferences-save transform retirement: final permanent save matches the previous complete generated behavior, with metadata observability, quota/circular error and successful retry checks; no storage/account migration.
19. Retired transform anchor/no-double-apply/LF/CRLF or unaffected-byte tests deleted: runtime no longer executes those transforms; permanent-owner/missing/duplicate checks plus exact final comparison replace their source-transform purpose. This is distinct from F1's deleted old **behavior** controls.
20. Party/showshop/audio/NPC/Shortcut old-side scenarios renamed rather than kept under the exact title: bounded fixture controls and actual fixed-side cases were retained where present. Case-title differences alone are not findings.
21. Mail's removed CRLF-transform case: LF/CRLF source-transform behavior is retired; default-title/escaping/invalid-title actual-runtime behaviors remain independently tested.
22. Occupied-corridor packet comparison replaced by explicit expected packet: the same exact legacy/modern kind and `[2,1]` destination are asserted. This is a legitimate fixed expected result, unlike the weakened 240-sample matrix.
23. Test VM stubs added for navigation/drag/close-vending/observer/ACT/runtime dependencies: actual current source functions are extracted and explicitly bound; no retired patch is restored, fake repaired function substituted, or production fallback added.
24. Fixed 161-owner registry overconstraining ordinary retained transforms: 99 existing owners have explicit exceptions while 62 migrated helpers remain protected; the exception table was read, not inferred by dropping metadata.
25. New helper `.ts` imports in vendor Node tests: the retained Node 24 regression run executes all 29 entries/152 cases successfully; production executable inventory is unaffected by test imports.
26. Direct TCP, passive-origin and credential policy regression: relevant production transport/account/config paths were not expanded; final IWA evidence retains TCPSocket/Direct TCP, only `https://game.lastro.cn` and `https://rodata.ltsd.ro`, and IndexedDB account ownership. No executable remote origin/fallback was added.
27. Upstream reviewed hash differing from owned vendor: intentional stage identities; unchanged allowlist reviewed hash is not silently replaced with migration output.
28. Reconstructed Task 5 report and truncated Task 14 build output: limitations are explicitly recorded and independent actual hashes/manifests corroborate their result; neither is evidence of a current runtime failure. They do limit historical raw-log reconstruction.
29. Real IWA login/combat/GPU/audio/visual/performance behavior: unmeasured and stated below. No unsupported successful smoke/performance claim is made, and this is not a default integration blocker under the approved scope.

## Evidence, limits and re-review boundary

The reviewer independently reread pinned artifacts rather than rerunning unchanged broad gates. `task-13-full-green.json` reports success, 163 files, 4584 passed, 0 failed/pending; the retained log has no unhandled section and the controller's package records zero unhandled errors. `task-13-node-green.log` reports 152 tests, 152 pass, 0 fail/cancel/skip/todo across the 29 inventory entries. Task 13/14 reports retain passing lint/typecheck/build/IWA/localization/ownership/final comparison. These are historical executed gates, not fresh commands by this reviewer.

Independent current-file checks reproduced:

- Owned vendor: 13,385,917 bytes, SHA-256 `2eb4725e97e188c377614ac2db0b35bb78d1050f95f4dded05c08406b16e7116`.
- All four prepared/packaged Online.js copies: 14,924,181 bytes, SHA-256 `8f3b3636ebed9f9279b8ad3fc2c65cd2f5c34a7a24a2c80e3e4994d16845ba6c`.
- Generated/dist executable manifests: byte-identical, 104,996 bytes, SHA-256 `737e110cb76d3747279498e8db438a86104e58c4acd520653412aebc214a96cc`.
- Independently read all **505/505** manifest paths from `dist/core`; every actual byte count and SHA-256 matched its row.
- All six bounded fixture hashes and their historical Git-source hashes matched provenance; the audio transform hash matched too. No full bundle/credential fixture was added.
- Actual-source parse coverage and the three targeted lexical/module-acquisition negatives described above succeeded as negative controls.

No signed/installed IWA login, combat, live Direct TCP session, GPU/WebGL rendering, audio output, visual inspection or performance benchmark was executed. Unit/source/package evidence cannot verify those outcomes. Task 5's reconstructed report cannot reproduce the missing original report bytes/cause; Task 14's complete verbose build stdout is unavailable, although exit/final summary and actual package bytes/manifest were retained. Read-only verification initially used one wrong test filename and one wrong raw JSON filename; corrected paths were inspected, no source/build mutation occurred, and those ENOENT results are not test failures.

After a serial fix, scoped re-review should check F1's complete ten-file inventory, exact ordinary path/follower/240-sample controls and provenance against old source, ensure fixed-side extraction remains actual vendor/generated, review the focused test evidence and F2's corrected identity. If only tests/fixtures/docs change and production hashes remain pinned, no unchanged build/IWA/full ownership rerun is needed for review. Integration remains withheld because of F1 until that evidence closes the finding; F2 should be corrected in the same minimal batch.


## Scoped re-review after F1/F2 repair — 2026-10-07

**Spec compliance: PASS. Code quality: PASS. F1: CLOSED. F2: CLOSED. Ready for integration: YES within the approved scope.** No open Critical, Important or Minor finding remains. This is a review conclusion, not an executed merge/deployment or a claim of real-game smoke/performance validation.

### Pinned boundary and independence

Reviewed the complete `11557d150f3942fa451c91dc7bddd4434c9dd801..04da13f9508e534233c495cef5cf632ad88d5ada` fix: **22 paths, 771 insertions, 68 deletions**. HEAD was `04da13f9508e534233c495cef5cf632ad88d5ada` and worktree clean before this report update. The previous whole-range `ffbb99f681d474500bbffd536c7bfdc0855752ad..b17a473417451d1b91f4ef656deae2dd2c232b54` review and initial Changes Requested history remain above. The original reviewer text was SHA-256 `79015a82d088018b91e9c1acd79659cdeda9931da6d0a59f786870fb2e9f4a9f` before this entry/status note; it was unchanged by the fix commit. Only the latest-status note and this appendix were added by the reviewer.

Same independent `gpt-6.1-sol/high` reviewer, no child agents. Global/repository/RTK rules and the scoped brief were read, CodeGraph used first, then actual files/Git objects. No production/test/index/build/HEAD change, install, deployment, push or merge was performed. The original code-review skill workflow continues. Sources: `final-re-review-brief.md`, fix report, finding-to-test-fixture mapping, self-reviews, hash-proof, mutant evidence and controller verification under `generated/runtime-consolidation/`, plus their actual source/raw JSON/logs. These ignored artifacts corroborate the durable report rather than substitute for source review.

The 22 paths comprise ten affected suites, eight bounded native fixtures, provenance metadata, the seven-line historical read helper, one provenance/extraction test and the implementation report. Production code, the checker/registries, config, existing six fixture files and original review text were not changed by the fix.

### F1 closure: all 22 historical controls and exact preservation contracts

Read the complete ten-suite fix diff and checked its current-side assertions against the prior current suites. Old controls execute pinned upstream owners; repaired sides still extract actual `vendor/v2/Online.js` or existing generated/product-composition source. No retired core patch or hand-written repaired function was restored. All 22 original case titles were independently matched against the original BASE Git objects and their exact current locations:

| IDs | Current source/case locations | Closure evidence |
| --- | --- | --- |
| R01–R05 | `test/lastro-entity-sync.test.ts:149`, `:281`, `:344`, `:398`, `:430` | Both detour packets' old zero path/position; total66/buffer64/nonfinite overflow; delayed death/timer/lookup/DIE; ignored timestamp; wall crossing controls restored. Actual corrected-route/death/timestamp/wall assertions remain. |
| R06–R10 | `test/lastro-equipment-animation.test.ts:135`, `:145`, `:160`, `:208`, `:285` | Old final-frame0, body/head action split, robe5/2 draw order, multiple sampled frames and speed-dependent cosmetic frames restored. Actual permanent rendering/cadence assertions remain. |
| R11 | `test/lastro-equipment-cart.test.ts:146` | Both old buttons remain CSS-hidden despite hasCart for all five versions; fixed state/lifecycle assertions remain. Correction to the initial inventory's “versions 0/4” shorthand: the original/current `versions` table covers all five Equipment variants. |
| R12 | `test/lastro-manual-skill.test.ts:132` | Old amotionTick2000/zero sends across direct, keyboard, mouse and list input; actual correct one-send packet checks remain. |
| R13–R15 | `test/lastro-movement-input.test.ts:229`, `:322`, `:481` | Lost second click, native1330 scans and friendly-PC consumed-click controls restored; actual second-click, one-scan/fallback and friendly/protected interactions remain. |
| R16–R17 | `test/lastro-movement-sync.test.ts:329`, `:484` | Native movement-through-stun/epoch/STOP and decoded FASTMOVE empty-route/buffer66/speed10/position controls restored with explicit actual dependency bindings. Actual control/relocation suites remain. |
| R18–R19 | `test/lastro-player-corpse.test.ts:138`, `:146` | Native orphaned lookup/retained corpse/resurrection/departure and two rendered same-GID actors restored. Actual same-entity resurrection/removal/re-entry assertions remain. |
| R20 | `test/lastro-skill-cooldown.test.ts:93` | Old overlay/Delay6000/no callback at 3000/8000ms restored; actual live deadline/expired clearing checks remain. |
| R21 | `test/lastro-weapon-view-fallback.test.ts:122` | Native initial request parity and requested→requested failure retry restored; actual requested→base/files/weapon assertions remain. Retained catalog/view adapters are still host product composition. |
| R22 | `test/vending-movement-runtime.test.ts:127` | Old final-send build/send bypass after shared FreezeUI clears restored; actual shopping guard/lifecycle/packet checks remain. |

The three weakened checks are now substantive:

- `test/lastro-entity-sync.test.ts:182` compares the complete ordinary-route coordinate arrays from upstream/current under identical inputs, and retains current `total > 0`, plus all rejection scenarios.
- `test/lastro-entity-sync.test.ts:501` compares actual current `walkToNonWalkableGround` with the distinct pinned upstream declaration. Actual follower execution cases remain. Both sources happen to have the same body, as required; neither side is a read of the same current declaration.
- `test/lastro-movement-input.test.ts:275` performs all **240** exact `{found,out}` comparisons, including false results and candidate order, against distinct upstream/current functions. No unsuccessful-result `continue` exists in this restored matrix. The separate successful-cell validity matrix remains as additional coverage.

### Native source provenance and the bounded stun adaptation

Independently re-extracted every one of the eight new fixtures using the recorded source selections and TypeScript AST uniqueness checks, then reproduced the exact serialized JSON bytes. All source/fixture hashes matched. Total **176,830 bytes** across eight fixtures, all from pinned native Git source `b56169ac7c760ae28f60958c9e8bc8e83db239b5`, vendor SHA-256 `9d8cbd73b52dc37b25d136d7c21ea59f157dc3dedffdd9d31bfc5d2e9f8f5b7b`. Original six provenance entries and fixture bytes remain unchanged. The helper reads bounded JSON; the provenance test actually extracts the recorded owners from Git and demands exact fixture bytes. This provides an independent control against invented upstream code or an embedded repaired intermediate.

Entity/walk/action fixtures are shared across entity, animation and corpse suites. Movement-sync's historical owners are explicit original `walkProcess`, EntityState, `onEntityOptionChange` or FASTMOVE handler, bound to actual permanent route/packet dependencies. They are not a stored patched bundle. The native function has the original >250ms stall/100ms catch-up cap, so the original single 900ms jump would mix the stall cap with the stun contract. The solely approved adaptation uses equal 16ms steps for native/current through exactly 11000. Source inspection confirms original advance>5, unchanged native epoch, exact `[2,1,3]` STOP/total0 remain; current position stays frozen, epoch increments and total0. This is a sound sandbox timing control and adds no production exception. FASTMOVE preserves the original decoded target, buffer66, total0, speed10 and unchanged-position assertions with the actual permanent route dependency.

### Mutant and executed-gate evidence

Independently rebuilt all three temporary mutant test sources from the final/pre-closure source plus their exact recorded insertions; original and mutant SHA-256 values matched the evidence. Raw JSON for each shows exactly one failed assertion with the intended case identity and concrete unequal results:

| Mutant | Observed assertion failure |
| --- | --- |
| One ordinary-route coordinate changed | Complete path equality rejects `[1,1,3,2,…]` versus upstream `[1,1,2,2,…]`. |
| Candidate search returns false for every request | Exact matrix rejects `{found:false,out:[-1,-1]}` versus `{found:true,out:[30,40]}`. |
| Candidate x traversal reversed | Exact matrix rejects legal but differently selected `[29,41]` versus upstream `[31,40]`. |

Original test bytes were restored, and current bytes were independently hash-checked. These failure records prove the repaired assertions exercise route/result/order behavior, not just source shape. The reviewer did not repeat mutations on disk.

Read the fresh raw results: ten affected suites **624/624**; three provenance/source suites **317/317**; full suite **164 files, 4609/4609**, success, zero failed/pending and no unhandled section in the retained full log. Lint/typecheck exit0 is recorded by the worker/controller with their logs; fix-range `git diff --check` was independently rerun and exited0. No unchanged production build/IWA gate was repeated.

The complete full run does **not** correspond byte-for-byte to final entity-suite source: its SHA-256 was `888bc2954adce9204074bf263393ae770f04bf0afc21898fd9832d73d814edec`; final is `d1b23d521087970df63d330fc7525878060535ec6cb2c30c65744b9207f1f3e4`. Independently removing only the subsequently restored `expect(fixed.entity.walk.total).toBeGreaterThan(0);` at the ordinary-route case reproduces the former hash exactly. All other recorded test/fixture/helper/provenance full-run hashes match final bytes. Final entity raw JSON then proves **83/83** passed on the final entity bytes. This is sufficient assertion-only scoped closure; no post-closure full rerun is claimed.

### F2 closure and preserved production evidence

Implementation report line10 now correctly distinguishes **13,385,917 source bytes** for owned vendor hash `2eb4725e…` from **14,924,181 prepared bytes** for hash `8f3b3636…`. Its correction history explicitly records the initial self-review miss and the limitation of Task13's late forty-consumer title audit. It preserves the initial independent Changes Requested outcome, pending re-review at fix delivery, all twelve rulings and manual/evidence limitations. F2 is closed.

Independently recomputed **450/450** frozen path hashes, including production/scripts/config, the six prior fixtures, vendor, four prepared/packaged copies and both manifests; zero mismatch. The fixed retirement/display/owner contracts are unchanged. Original Node29-entry/152-case and Task14 build/IWA/localization/ownership/final-comparison evidence therefore retain their original production boundary. The earlier independent505/505 executable byte/hash check and identical manifest/package identities remain applicable. No Direct TCP/TCPSocket, two-passive-origin or IndexedDB account-flow change was introduced.

### Considered and set aside in this repair scope

1. Merely restoring case titles without assertions: full diff/source inspection confirms each R01–R22's actual old expected outcome and all surviving fixed-side expectations; not an open issue.
2. A repaired upstream fixture or patched intermediate: exact native Git/AST-to-JSON byte reproduction and shared bounded owners reject that concern. Retained equipment-view adapters remain legitimate existing product composition, not the retired weapon fallback fix.
3. False-result skips or unconstrained candidate order: restored240-sample equality includes both successes/failures; all-false and wrong-order actual mutants fail. The additional successful-cell validity case does not replace equality.
4. Reintroducing the stall cap makes stun advance assertion fail or weakens it: equal16ms cadence avoids the unrelated stall cap, preserves original >5/epoch/STOP contract and compares the current gated counterpart under the same clock. No weakened threshold/source edit is used.
5. Synthetic handler duplication within a sandbox: only the selected original guilty handlers replace their actual counterpart for the old-side control; explicit dependencies and current default paths retain actual permanent implementations. No runtime reinjection occurs.
6. Full-run/final-source mismatch: the exact single restored assertion and83-case final rerun close the changed byte boundary; the full4609 run is described as pre-closure, not silently relabeled final.
7. Old fixture/provenance, production/package or first-review history drift: independently checked hashes/first-six metadata and the complete22-path diff show none. This appendix/status note are the only reviewer edits.
8. Additional runtime/build/security proof demand after test/docs-only repair: unchanged450-path/hash evidence carries the existing gate results; repeating unchanged broad production checks would add no new assurance for this closure.

All twelve original ruling judgments and twenty-nine original set-aside assessments remain valid. Real installed/signed IWA login/combat/live Direct TCP/GPU/audio/visual/performance validation remains unperformed; Task5 reconstructed-report and Task14 truncated raw-output limitations remain explicit. Those are unchanged evidence boundaries, not new blockers under the approved scope. The scoped repair closes F1/F2 without expanding runtime scope, and the independent review now permits integration.
