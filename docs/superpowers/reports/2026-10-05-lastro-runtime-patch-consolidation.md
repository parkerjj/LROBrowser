# LastRO runtime patch consolidation implementation report

Date: 2026-10-06  
Status: implementation and Task 14 build/audit gates complete; the controller's independent final review is pending.

## Result and source identity

The approved consolidation is present in `vendor/v2/Online.js`. The permanent-core gate recognizes 31 migration modules with 161 unique vendor owners: 27 old patch modules/declaration files were retired, and four reusable host-only modules remain as mirrors for permanent source. One packet-layout module was renamed and six display/localization modules were merged. Product code for account login, tools, shortcut settings, teleport, chat/NPC/achievement links, cards, quests, appearance, equipment catalog/view, and other non-authorized features remains modular.

The Task 14 base was clean HEAD `bbdb4a5a318407c3426a43098edf0d503148f5a2` on `codex/runtime-patch-consolidation`. The frozen old final runtime is SHA-256 `07375cf28a8dc1cfc783865b481869053570c8a5dc7efbcffec6eafb9193f0c8`. The owned vendor is SHA-256 `2eb4725e97e188c377614ac2db0b35bb78d1050f95f4dded05c08406b16e7116` (14,924,181 bytes after preparation); the prepared runtime is SHA-256 `8f3b3636ebed9f9279b8ad3fc2c65cd2f5c34a7a24a2c80e3e4994d16845ba6c` (14,924,181 bytes). The vendor and prepared runtime hashes identify different stages and must not be interchanged.

`config/v2-allowlist.json` still records the reviewed upstream `Online.js` SHA-256 `5525839d71144032bc6f836c40f3ea1bf58db3e672ac8f4becfdd84cdfbc9e3c`. That import-review identity was not replaced with the owned vendor hash. `config/lastro-module-inventory.json` retains its 18 production-source entries and existing vendor regression list; `config/core-asset-roots.json` still lists only its three existing browser runtime modules. None of these configs changed. The permanent bundle adds no browser runtime file: `prepare:runtime` and the IWA executable manifest both report 505 runtime files.

## Complete 38-module disposition

The first 31 rows are the fixed permanent-runtime ownership matrix. Rows 1–27 retire their old transform module and paired declaration, where one existed; rows 28–31 retain reusable MJS sources but remove their old core serialization/injection path. The last seven rows record the packet rename and the six-source display merge.

| # | Original module | Final disposition |
| ---: | --- | --- |
| 1 | `lastro-network-receive-recovery.mjs` | Receive framing recovery and EOF drain are permanent vendor behavior; patch module and declaration retired. |
| 2 | `lastro-frame-timing.mjs` | Server tick helpers and frame timing are permanent; patch module and declaration retired. |
| 3 | `lastro-audio-timing.mjs` | Timed WebAudio, audio unlock and required WebAudio prefix closure are permanent; patch module and declaration retired. |
| 4 | `lastro-entity-sync.mjs` | Route and entity synchronization are permanent; patch module and declaration retired. The standalone `lastro-server-walk.mjs` helper remains for reuse and parity checks. |
| 5 | `lastro-movement-input.mjs` | Ground-input and movement-input behavior are permanent; patch module and declaration retired. |
| 6 | `lastro-movement-sync.mjs` | Movement blocking, correction and hit-route state are permanent; patch module and declaration retired. |
| 7 | `lastro-equipment-animation.mjs` | Equipment frame sampling is permanent; patch module and declaration retired. The standalone `lastro-costume-loop.mjs` helper remains for reuse and parity checks. |
| 8 | `lastro-equipment-cart.mjs` | Equipment cart-button behavior is permanent; patch module and declaration retired. |
| 9 | `lastro-weapon-view-fallback.mjs` | Weapon fallback and DB helper are permanent; patch module and declaration retired. Equipment catalog/view transforms remain modular. |
| 10 | `lastro-manual-skill.mjs` | Manual player skill behavior is permanent; patch module and declaration retired. |
| 11 | `lastro-skill-cooldown.mjs` | Shortcut skill cooldown behavior is permanent; patch module and declaration retired. |
| 12 | `lastro-party-state.mjs` | Party-state helper/factory and behavior are permanent; patch module and declaration retired. |
| 13 | `lastro-monster-hover-hp.mjs` | Hover HP helper/factory is permanent; patch module and declaration retired. |
| 14 | `lastro-vending-movement.mjs` | Vending movement gates and cleanup are permanent; patch module and declaration retired. |
| 15 | `lastro-item-drag.mjs` | Native drag installer and cleanup are permanent; patch module and declaration retired. |
| 16 | `lastro-ui-layout.mjs` | Scoped layout CSS/results are permanent; patch module and declaration retired. The orchestrator's separate product-layout function remains. |
| 17 | `lastro-ui-input.mjs` | Logical pointer, drag bounds and scaled input behavior are permanent; patch module and declaration retired. |
| 18 | `lastro-ui-state.mjs` | Window state, append and final Preferences behavior are permanent; patch module and declaration retired. The superseded Preferences save transform is also removed. |
| 19 | `lastro-store-scroll.mjs` | Store edge scrolling installer is permanent; patch module and declaration retired. |
| 20 | `lastro-storage-count.mjs` | Storage count/refresh behavior is permanent; patch module and declaration retired. |
| 21 | `lastro-basic-info.mjs` | BasicInfo HTML/CSS layout results are permanent; patch module and declaration retired. |
| 22 | `lastro-dialog-typography.mjs` | Dialog text measurement behavior is permanent; patch module and declaration retired. |
| 23 | `lastro-typography.mjs` | Common font and typography results are permanent; patch module and declaration retired. |
| 24 | `lastro-navigation-ui.mjs` | Navigation docking helpers and UI behavior are permanent; patch module and declaration retired. Teleport/tool behavior remains modular. |
| 25 | `lastro-npc-dialog-buttons.mjs` | NPC dialog button installer and cleanup are permanent; patch module and declaration retired. |
| 26 | `lastro-mail.mjs` | Mail template, CSS, escaping and validation results are permanent; patch module and declaration retired. |
| 27 | `lastro-shop-titles.mjs` | Shop title visibility and command behavior are permanent; patch module and declaration retired. |
| 28 | `lastro-map-resource-name.mjs` | Retained reusable resolver source; no host serialization remains. Build and product code call the unique embedded vendor resolver. |
| 29 | `lastro-map-load-diagnostic.mjs` | Retained reusable diagnostic source; old host failure transform is retired and the failure branch is permanent in MapRenderer. |
| 30 | `lastro-worldmap.mjs` | Retained preview/reusable source; WorldMap index, template, CSS, portrait use and core UI are permanent. Only the existing product actions are injected by the residual build. |
| 31 | `lastro-monster-portrait.mjs` | Retained reusable portrait factory source; the factory is embedded once in permanent WorldMap. This source has no `.d.mts`. |
| 32 | `lastro-network-security.mjs` | Renamed to `lastro-item-packet-layouts.mjs` with matching declaration and test rename. `patchRuntimeLastROItemLayouts`, all six packet constructors and legacy `anchor:network-security:*` diagnostics stay in the same build position. |
| 33 | `lastro-localization.mjs` | Merged into `lastro-display-localization.mjs`; original module/declaration retired. |
| 34 | `lastro-skill-localization.mjs` | Merged into `lastro-display-localization.mjs`; original source retired. |
| 35 | `lastro-ui-text.mjs` | Merged into `lastro-display-localization.mjs`; original module/declaration retired. |
| 36 | `lastro-ui-messages.mjs` | Merged into `lastro-display-localization.mjs`; original module/declaration retired. |
| 37 | `lastro-item-name.mjs` | Merged into `lastro-display-localization.mjs`; original module/declaration retired. |
| 38 | `lastro-emoticons.mjs` | Merged into `lastro-display-localization.mjs`; original module/declaration retired. |

The four retained modules in rows 28–31 stay host-only and are not executable-asset entries. `lastro-server-walk.mjs` and `lastro-costume-loop.mjs` are two additional reusable algorithm helpers outside the 38 source-transform/module disposition rows; each is checked against its embedded vendor counterpart. No product implementation was copied into the vendor to preserve these interfaces.

## Final source comparison and intentional deltas

The exact final command was:

```sh
rtk proxy node scripts/check-runtime-consolidation.mjs --baseline /home/parker/Development/RO/RoBrowserV2/generated/runtime-consolidation/baseline/final-Online.js --candidate /home/parker/Development/RO/RoBrowserV2/generated/runtime/Online.js --stage final
```

It exited 0 with `equal: true` and `differences: []`. Its seven fixed audio relocation owners are `installLastROWebAudio`, `LastROWebAudio`, `installLastROAudioUnlock`, `LastROAudioPlay`, `LastROAudioUnlock`, `LastROAudioRegisterContext`, and the single `installLastROAudioUnlock` installation call. The only other structural differences are the four pinned Task 11 deltas:

1. WorldMap keeps all twelve existing client-module initializers in their original order; GUI creation precedes pure product-factory construction.
2. WorldMap has one empty `lastroWorldMapActions` object, one exact marker, the three existing product callbacks assigned once, and one spread into installer dependencies.
3. Four preflight call sites use one permanent map-resource resolver, preserving exact filename and `DB.mapalias` behavior.
4. The token-identical diagnostic helper is declared once immediately before `onMapComplete`.

These are the explicit result of Rulings 11–12 and actual-source proof, not a general behavior allowlist. Runtime strings, AST owner order, helper bodies, product action behavior and unregistered deltas remain checked.

## Twelve implementation rulings, with reason and cost

| Ruling | Decision, reason and exact boundary | Cost if wrong / required evidence |
| ---: | --- | --- |
| 1 | Use the user-approved repository branch and serial shared checkout; the user explicitly selected per-task implementer self-review even where a skill's default differs. Keep a separate final independent review. | Isolation and per-task reviewer granularity would need reconsideration. The final independent review remains a required gate. |
| 2 | Treat old-path grep as a discovery check, not a blanket ban on strings in audit registries or intentional negative fixtures. The fixed retirement registry must name old imports/calls; active executable imports/calls and unresolved declarations must be zero. Classify matches with AST/import resolution. | A string-only stale runtime reference could be missed if every textual hit were ignored. Task 13 checked all executable consumers and preserved the explicit negative cases. |
| 3 | Do not undo the matched audio write only to repeat the nominal command order: guarded full residual output and strict frozen-final comparison had already passed before apply. The actual residual CLI and manifest were still required before that task could close. | A CLI-specific output or manifest defect would require paired repair or rollback before downstream tasks; this ruling waived neither check. |
| 4 | Permit one ignored-runner maintenance operation only for two Task 4 trailing-space lines/locations: line 315232 and 315244 each lose exactly two spaces. Pin complete source/candidate hashes; prove exact byte edits, AST owner/token/decoded-literal identity and that both edits are outside string/template/regex literals; reuse existing input, path, symlink, inode and atomic-write checks. No normal-build maintenance path was added. | A broader operation could hide unintended source edits. Every other byte had to remain hash-identical. |
| 5 | Adapt the retained card-collection adapter only at the unique direct `lastroCloseVendingShopping()` calls in `onMapChange` and `cleanGameUI`, placing card invalidation immediately after close. Missing/duplicate hooks fail closed. Keep the card product module independent. | Card cancellation or teardown order could regress. Frozen-final comparison and explicit drag → vending → card ordering tests were required. |
| 6 | Permit a narrow host-only path adapter in `lastro-skill-data.mjs` using `fileURLToPath` and `path.resolve/join`: Vite rewrote a static asset URL to HTTP on an indirect import while `import.meta.url` stayed file-based. GBK data, public table and runtime remain unchanged; no resource origin or executable was added. | Path/encoded filename behavior or direct module callers could regress. The bundled table/source equality hash and three affected suites (46/46) plus final broad gates constrain the change. |
| 7 | Adapt only the retained Quest `createQuest/onAppend` selector to either the original direct `if (renewLayout)` or the exact third-arrow callback in the unique returned `lastroUiWindowAppend`. Reject missing, duplicate, wrong container or shape drift. Keep Quest product code modular. | Refresh/tracker layout could be omitted or reordered. Strict frozen-final owner comparison, Quest tests and drift negatives are required. |
| 8 | Represent exactly one existing untagged UIManager CSS literal's two trailing spaces as `\x20` escapes. Candidate hash, literal location/shape, decoded 133-character value/hash, owner tokens and final output are pinned. The move made Git treat the old line as newly added; retaining raw trailing spaces fails `diff --check`, while trimming changes CSS. Eighty other candidate trivia lines were separately verified outside AST literal nodes. | Escaping tagged/raw/template text could change runtime CSS. The rule is limited to that one ordinary literal; no general whitespace edit or region exemption exists. |
| 9 | Anchor retained `patchRuntimeToolsPanels` cancellation after the unique direct zero-argument `document._lastroItemDrag?.cancel()` expression in `cleanGameUI`. Missing, duplicate or changed optional-chain shape fails. Preserve product code and teardown order: drag → tools → vending → card → movement. | Route cancellation, drag ghosts or cleanup ordering could regress. Strict parser-aware comparison, lifecycle tests and malformed-anchor negatives were required. |
| 10 | Permit four exact retained product composition adapters: (a) shortcut settings' stringified Graphics installer and both shortcut-settings and teleport-settings serialized `Component.onAppend` wrappers compose with permanent `lastroUiWindowAppend`, preserving exact `_preferences$32` and snapshot semantics; (b) Hotkeys cancellation is inserted into the exact third zero-argument arrow in `ShortCutOption`; (c) Quest keeps its native append wrapper and composes only the bridge append serializer with the same helper/snapshot; (d) NPC helpers go before the permanent fallback call, then UIManager registration. The old NPC raw fallback is accepted only when both marker and helper are absent; any partial/missing/duplicate/drifted permanent shape rejects. The first proposed Quest unwrap was disproved and withdrawn. | Shortcut/teleport settings save or append order, Hotkeys cancellation, Quest refresh/tracker or NPC preflight could duplicate or reorder. Exact callback/snapshot/order checks, per-owner frozen-final equality, behavior tests and negatives are required. No core transform rerun, helper reinjection, product absorption or comparison exemption was introduced. |
| 11 | Deduplicate the map-resource resolver for exactly four existing preflight consumers: WorldMap, NPC, Achievement and LastROTools. Preserve the helper body and filename/`DB.mapalias` call at every owner; require one permanent declaration and reject an unknown fifth caller or lexical shadow. Keep the LastROTools product module modular. | Alias, timeout, lexical binding or preflight behavior could change, or Tools code could be absorbed. Exact per-owner validation, product tests and final comparison are required. |
| 12 | Keep all twelve existing WorldMap client-module init calls in their exact original order in the permanent core; residual code injects only existing product factories/actions. This replaces the early seven/five split because those dependencies are already bundle client modules, not copied product implementation, and reordering Network/PacketStructure versus SessionStorage/MapRenderer added lifecycle risk without a requirement. Preserve the original spec/plan as historical documents and record this execution ruling. | When actions are absent, the core initializes five extra existing client dependencies. The built initialization order remains unchanged; exact call order and constructor/no-I/O tests plus strict node validation provide evidence. No other initialization reorder is accepted. |

## Ownership checker and proof boundaries

The final checker is a read-only host audit, not part of `prepare:runtime` or the browser package. `--check-final` covers the fixed 31 modules/161 actual owner selectors, all 40 retirement records, 12 display binding relocations, four retired host transforms, declarations, and the boundary between migration tooling and normal prepare. It returns zero diagnostics. The seven pure helper mirrors are not a behavior allowlist; the four reusable mirror sources in the 31-row table and the two route/costume algorithm sources are verified against actual embedded definitions.

The checker and comparator received these fail-closed corrections during implementation:

- Actual-source audits parse the vendor, patcher, prepare script and declarations once, retain source locations and owner/container structure, and require each permanent selector exactly once. The fixed matrix has 161 owners; 62 are host-protected migrated definitions/state/factories and 99 selectors are existing bundle owners deliberately left editable for residual localization/product/diagnostic composition. This does not pin all of `Online.js` by hash.
- Permanent functions, classes, methods, assignments and helper calls are distinct from retired host transform APIs. The four APIs `patchWebAudioPlayback`, `patchRuntimePreferencesSave`, `patchRuntimeWorldMap`, and `patchMapLoadFailureRecovery` have no same-named permanent runtime wrapper by design; the checker rejects reintroduced host definitions/calls/declarations instead of fabricating vendor owners.
- Serialized sources are checked after decoding string/template nodes and concatenations, including function-local templates, no-substitution strings and embedded factory definitions. Name discovery alone cannot authorize a body; exact owner and lexical binding are required. The migration runner is absent from `prepare-runtime.mjs` and the IWA executable list.
- Task 10 exposed a parser hole: plain scanning could mistake template-interpolation executable tokens for string content and accept directive spelling changes. The final comparison preserves AST path/boundaries and ASI structure; compares directive-prologue literals by raw spelling (so changing `"use strict"` to a cooked-equivalent escape cannot change strict mode); compares regex source and tagged-template raw spelling exactly; compares ordinary untagged literals by cooked value; and only discards ordinary trivia/comments where their AST context is proven. There is no whole-region ignore.
- Task 11 exposed a lexical-shadow counterexample: an NPC-local `resolveLastroMapResourceName = () => "shadow"` caused the outgoing resource path to become `shadow` while an earlier structural comparator accepted it. The final compiler-symbol check requires each of the four resolver calls to bind to the single permanent declaration and rejects function/block/parameter/destructuring/catch shadows. A separate actual runtime counterexample and negative contract verify filename behavior; the earlier false acceptance is retained as historical evidence.
- Task 12 RED probes showed imported aliases acquired through namespace/query/hash/file-URL forms, computed/destructured/aliased serialization, and `require`/`createRequire` loader origins were not fully tracked. The final audit canonicalizes module origins and follows lexical aliases/loaders, then applies the same retired/permanent binding checks to source and serialized code. The combined binding/loader gate passed 30/30 positive/negative contracts. Legal product, logging, metadata and parameter cases remain accepted; this is module-origin and ownership enforcement, not a new runtime behavior list.
- The Task 12 161-owner mutation table passed 161/161; complete `--check-final` returned 31/161/40/12/4 with no diagnostics. Original 40 retirement records and 12 display mappings remained fixed. The checker has no migration write option and does not hash-lock the entire vendor.

The complete set of existing host owners that remain editable while still requiring one actual vendor definition is recorded below. All other newly migrated helper/factory/state owners are protected from host reinjection.

| Permanent module | Existing host-editable owners |
| --- | --- |
| `lastro-network-receive-recovery` | `receive`, `onClose$9` |
| `lastro-frame-timing` | `init_Events`, `init_Renderer` |
| `lastro-audio-timing` | `init_MemoryManager`, `init_MemoryItem`, `init_BGM`, `init_SoundManager`, `init_RainWeather`, `installLastROAudioUnlock` call |
| `lastro-entity-sync` | `WalkStructure`, `walkTo`, `walkProcess`, `resetRoute`, `computeWalkStartTick` |
| `lastro-movement-input` | `onMouseUpCapture`, `onMouseDown`, `init_MapControl` |
| `lastro-movement-sync` | none |
| `lastro-equipment-animation` | `init_EntityRender` |
| `lastro-equipment-cart` | `createEquipment`, `onEntityStatusChange` |
| `lastro-weapon-view-fallback` | `UpdateGeneric`, `init_DBManager` |
| `lastro-manual-skill` | `onUseSkill`, `moveCharacter`, `init_Skill` |
| `lastro-skill-cooldown` | `setDelayOnIndex`, `init_ShortCut` |
| `lastro-party-state` | `onPartyCreate`, `onPartyIsAlive`, `onPartyList`, `onPartyMemberJoin`, `onPartyMemberLeave`, `onMemberLifeUpdate`, `onMemberMove$1` |
| `lastro-monster-hover-hp` | `init_EntityManager` |
| `lastro-vending-movement` | `onRequestWalk`, `cleanGameUI`, `onMapChange` |
| `lastro-item-drag` | none |
| `lastro-ui-layout` | `init_CashShop$2`, `init_EntityRoom$2`, `init_EntitySignboard$1`, `init_ChatRoomCreate$1`, `init_CartItems$1`, `init_Storage$3`, `init_SkillListV2$1` |
| `lastro-ui-input` | `bindMouseEvents`, `init_GUIComponent` |
| `lastro-ui-state` | `selfSave`, `StorageFilter`, `init_Preferences$1` |
| `lastro-store-scroll` | `init_NpcStore` |
| `lastro-storage-count` | `createStorage`, `init_StorageFilter`, `StorageFilter.prototype.addItem`, `StorageFilter.prototype.removeItem` |
| `lastro-basic-info` | `init_BasicInfoV1$1`, `init_BasicInfoV1$2`, `init_BasicInfoV3$1`, `init_BasicInfoV3$2`, `init_BasicInfoV4$1`, `init_BasicInfoV4$2`, `init_BasicInfoV5$1`, `init_BasicInfoV5$2` |
| `lastro-dialog-typography` | `init_EntityDialog`, `Dialog` class |
| `lastro-typography` | `init_Common$1`, `init_ChatBox`, `init_ChatBox$1`, `init_ItemInfo$1`, `init_ChatRoomCreate$1`, `init_CashShop$2`, `init_EntitySignboard$1`, `init_LastROTools$1`, `init_Storage$3`, `init_SkillListV2$1`, `init_InventoryV0$1`, `init_InventoryV1$1`, `init_InventoryV2$1`, `init_InventoryV3$1` |
| `lastro-navigation-ui` | `createMiniMap`, `init_Navigation` |
| `lastro-npc-dialog-buttons` | `init_NpcBox` |
| `lastro-mail` | `onClickClose$1`, `onClickSend`, `init_Rodex$1`, `init_Rodex$2`, `init_Rodex$3`, `init_WriteRodex`, `init_WriteRodex$1`, `init_WriteRodex$2`, `init_ReadRodex$1`, `init_ReadRodex$2` |
| `lastro-shop-titles` | `init_Map`, `init_ProcessCommand`, `init_EntityRoom`, `init_EntityRoom$2` |
| `lastro-map-resource-name` | none |
| `lastro-map-load-diagnostic` | `onMapComplete` |
| `lastro-worldmap` | `init_WorldMap` |
| `lastro-monster-portrait` | none |

## Test migration, historical failures and fixture provenance

Task 13 ran `rtk proxy .tools/node_modules/.bin/pnpm run test`: final exit 0, 163/163 Vitest files, 4,584/4,584 tests, zero failed/pending/todo/unhandled. A separate inventory-driven Node 24 run used 29 `vendor/v2/*.test.mjs` files and passed 152/152 with zero skip/cancel/todo. An earlier hand summary of 122 cases was wrong; the raw red log and final green run both show 152, and the report corrects it. The original full run had 4,584 cases with 4,577 passing and seven concrete teleport-runtime fixture failures; those were repaired against the actual prepared resolver before the final full run. Lint, typecheck, final ownership and diff checks all exited 0 in Task 13.

Task 12's focused coverage closure is 350 cases across its original four suites and the final v2 fixes; it was not a new single-command 350-case green rerun. The first five-suite run collected 350 and had two new failures; after precise selector fixes, the original suites and the affected v2 cases passed in their respective final runs. Task 11's final focused closure was 15 suites / 359 cases, with the stale synthetic portrait case replaced by extraction from the permanent portrait call and explicit missing/duplicate/guard drift negatives. Task 9's nine focused suites moved from 171 to 162 cases because nine tests asserted retired source-transform anchors/formatting only. They were retired or replaced by actual permanent-vendor owner checks and malformed/missing/duplicate-node coverage; runtime behavior checks stayed. Task 13's assertion audit covered 40 frozen test consumers with zero removed or added case-title templates; that scoped finding does not claim every historical case across all prior suite shapes was unchanged.

`test/fixtures/runtime-consolidation/provenance.json` records bounded historical evidence, not a full vendor snapshot:

| Fixture / owner | Source commit and source SHA-256 | Fixture SHA-256 |
| --- | --- | --- |
| Audio prefix: `installLastROWebAudio`, SoundManager and BGM | `b56169ac7c760ae28f60958c9e8bc8e83db239b5`; `9d8cbd73b52dc37b25d136d7c21ea59f157dc3dedffdd9d31bfc5d2e9f8f5b7b` | `4805eb498f722b12c9f67008effbedc0a9244689aee15b455437be8ece74f0cd` |
| Emotions/BinaryWriter and ChatBox/ShortCuts/Emoticons source regions | same source commit/hash as above | `4b18a0c55377cc9dac443257ac21c0312d2a5a1725ae9ff0ce5a778b48101fc7` |
| MapEngine Group and MiniMapCommon | same source commit/hash as above | `52dda4b294958ae0b57384ebea22b702f3906d460a3af1f6b8c7fa7e54713ed9` |
| Preferences Map, ProcessCommand and EntityRoom | same source commit/hash as above | `44c857e0cfc69926dfd4d36b63b320608d892a23421178cf661045723b6e53f4` |
| Bounded Quest native `onAppend` text fixture from `ui-state-upstream.json` | `ed064c5ee434413452bf205b0fa19ff610d002b7`; `d199a879e23d4c4e5b3d050834a300b3e82614f25dfa1069c22d9889ea4cbdb1` | `8ede047b430829346b5394604507198ad740b87fe585638c951703ec72dac986` |
| Bounded UI-state upstream owners in NPC, `onCloseAppear`, and ShortCut | same source commit/hash as above | `3b6ca6ed4d940581882d4aefedaaad9101a7fb19ee5dbab0e57d8f00e9f0271f` |

The audio provenance also pins its transform path SHA-256 `2cb25838b7633807b6d91195ecffdca03d760b200f8a725c388b68f8fda89002`. These fixtures are limited to named old regions/functions. They do not store credentials or full `Online.js`.

The Task 5 scratch report was found absent during that task's final checks, after prior reads; the cause and timing are unknown. The report now present at `generated/runtime-consolidation/task-5-report.md` was reconstructed from preserved artifacts and task messages, not recovered byte-for-byte. Its candidate, baseline, ledger, runner and Tasks 1–4 reports were still present; the final owned vendor hash was independently rechecked against the preserved frozen source. This is an evidence-provenance limitation, not an unresolved runtime failure.

## Task 14 build, package and manifest evidence

Task 14 used the original configured model `gpt-6-luna` / `max`, with no child agents. The following commands exited 0:

| Exact command | Result |
| --- | --- |
| `rtk proxy .tools/node_modules/.bin/pnpm build` | `prepare:runtime` reported 505 runtime files; Vite transformed 14 modules and completed the build. |
| `rtk proxy .tools/node_modules/.bin/pnpm audit:iwa` | 762 packaged files, 128,690,396 total bytes; 505 core executable entries / 96,149,026 packaged bytes; no prohibited pattern results. Allowed origins were exactly `https://game.lastro.cn` and `https://rodata.ltsd.ro`. Audit digest: `ae192cd833540dd9cec47536fdb075e51334d74ee479c5d6c9bb65bc0ba33c3f`. |
| `rtk proxy node scripts/audit-localization.mjs --check-dist` | 1,444 skills; 1,443 translated; 1 preserved; 1,149 descriptions; 790 maps; 43 map titles; no pending skill names. It checked generated and dist `Online.js` copies in both core and app paths. |
| `rtk proxy node scripts/check-runtime-consolidation.mjs --check-final` | 31 modules, 161 owners, 40 retirements, 12 display relocations, 4 retired host transforms; zero diagnostics. |
| `rtk proxy node scripts/check-runtime-consolidation.mjs --baseline /home/parker/Development/RO/RoBrowserV2/generated/runtime-consolidation/baseline/final-Online.js --candidate /home/parker/Development/RO/RoBrowserV2/generated/runtime/Online.js --stage final` | `equal: true`, `differences: []`; only seven audio relocations and the four listed WorldMap/resolver/diagnostic structural deltas. |
| `rtk git diff --check` | Exit 0. |
| `rtk proxy .tools/node_modules/.bin/pnpm prepare:runtime` | Separate post-build prepare exited 0 with 505 runtime files. |

The prepared copies in `generated/runtime/Online.js`, `generated/core/runtime/Online.js`, `dist/runtime/Online.js`, and `dist/core/runtime/Online.js` each have 14,924,181 bytes and SHA-256 `8f3b3636ebed9f9279b8ad3fc2c65cd2f5c34a7a24a2c80e3e4994d16845ba6c`. `generated/core/executable-assets.json` and `dist/core/executable-assets.json` are byte-identical (SHA-256 `737e110cb76d3747279498e8db438a86104e58c4acd520653412aebc214a96cc`), with 505 entries. The manifest's `runtime/Online.js` row says kind `runtime`, 14,924,181 bytes, and the same SHA-256; reading the packaged path reproduced both values. The audit's complete asset walk found 762 files and no symlink or prohibited content. Generated and dist files are build evidence only and are not tracked.

The build tool output was returned in the Task 14 tool response rather than written to a persistent raw-log file; its exit code and final summary were retained in the Task 14 scratch report. The audit, localization, ownership, source comparison and manifest/hash summaries are retained there as well. The wrapper truncated verbose Vite per-file listing, after the successful final summary; no claim depends on the omitted listing.

## Model and recovery history

The approved plan specified `gpt-6-luna` / `max` implementers and an independent `gpt-6.1-sol` / `high` final reviewer. User-authorized exceptions during implementation were:

- Task 10's Luna worker ended with an OpenAI local-proxy HTTP 502 on `/responses`. After the user had explicitly authorized suitable model upgrades, the controller resumed the same shared-checkout work from its frozen checkpoint with a fresh Sol Max recovery worker. It did not restart the baseline or expand scope.
- Task 11's Sol Max worker hit a usage-limit interruption. The same agent resumed when the ordinary usage API showed it was allowed to proceed (primary usage 0%, weekly 41%); no credit purchase or reset was made.
- The user explicitly allowed Sol Max for the remaining complex ownership proof in Task 12 and cross-module test closure in Task 13. Task 14 returned to the original configured Luna Max model. All implementation tasks remained serial in the shared checkout with no child agents.
- Task 13 corrected an earlier manual Node result from 122 to the raw and final 152 cases. No earlier count was silently overwritten.

## Limitations, rollback and final review status

No signed or installed IWA was launched for login, combat, GPU/WebGL, sound, or visual smoke testing. The localization checks prove source/packaging mounts, not that the UI was inspected in a real game session. Performance was not benchmarked. Browser rendering, real account login and actual in-game image/audio behavior therefore remain unverified. The full unit/Node gates and production package audits do not claim those manual outcomes.

If this consolidation must be rolled back, revert the paired migration changes together: `vendor/v2/Online.js`; `scripts/patch-v2-runtime.mjs` and `.d.mts`; the deleted/renamed/merged MJS and declaration modules; affected test consumers, extractors, fixtures and provenance; and the tracked source-provenance/spec/plan/report updates. A vendor-only rollback would leave retired build calls/tests inconsistent. Do not use a generated `Online.js` snapshot as the rollback source; do not use `git reset --hard` or `git clean`. The original transforms remain recoverable from the recorded Git history. No database, account or Preferences migration was introduced.

Task 14 spec-compliance self-review: **PASS**. The requested build/package/localization/final-source gates pass, all 38 dispositions and 12 rulings are recorded, hashes and upstream-reviewed provenance remain distinct, and no generated asset or config change is tracked.  
Task 14 code-quality self-review: **PASS**. The docs preserve historical decision records, distinguish evidence from interpretation, state the reconstructed Task 5 report limitation, and avoid claiming real-IWA smoke coverage.  
Independent whole-branch final review by the controller: **PENDING**. No reviewer was dispatched by this worker, and no review-related plan checkbox is marked complete.
