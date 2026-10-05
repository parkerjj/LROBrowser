# LastRO Runtime Patch Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` to implement this plan task-by-task. 用户已指定执行方式与模型，覆盖 skill 的默认模型选择及逐 task 独立 reviewer 要求。Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户指定的 31 个模块的核心运行时结果永久合入 `vendor/v2/Online.js`，重命名物品 packet layout 模块、合并六个显示本地化模块，并保持产品功能模块化和最终构建行为。

**Architecture:** 逐批在内存/候选文件中应用已有 source transforms，验证旧完整构建与新 residual pipeline 的结果后原子写回 vendor；每批同时移除对应构建 import/call 并迁移测试。音频迁移包含必要前置闭包；WorldMap 拆开永久 display/portrait 与模块化产品 actions。正常 prepare 永不调用迁移工具。

**Tech Stack:** Node.js `>=24 <25`、仓库 pnpm、ESM、TypeScript compiler API、Vitest/jsdom、既有 Vite/IWA asset pipeline；不新增依赖。

**Spec:** [已确认设计](../specs/2026-10-05-lastro-runtime-patch-consolidation-design.md)。用户已确认 spec，并于 2026-10-05 确认本 plan、授权开始实施。以下 task 按既定 subagent 模式执行。

## Global Constraints

- 只在 `/home/parker/Development/RO/RoBrowserV2` 工作，不读取或修改 `/run/media/parker/7A9F-F871/ROWeb`。
- `generated/`、`dist/`、`release/`、`.codegraph/` 是本地生成目录，不提交生成物、测试密钥或迁移候选。
- 生产代码只允许 Direct TCP / `TCPSocket`；不新增 WebSocket、WSS、proxy、bridge、Electron 或 NodeSocket fallback。
- 远程只允许 `https://game.lastro.cn` 和 `https://rodata.ltsd.ro` 两个被动资源 origin；JS/MJS/Worker/WASM/Lua/LUB 必须进入 IWA 包内清单。
- 账号密码只通过用户自己的 IndexedDB 流程保存；不改变账号/Preferences 持久化字段，不复制个人配置或 secret。
- 不执行自动更新、生产签名、GitHub Actions、Surge、公网部署；不自动 merge/push。
- 保留 tools/account/shortcut/teleport/chat/NPC/achievement/card/quest 等产品模块，以及 entity/equipment appearance、equipment catalog/view 的现有 transform。
- 全部 shell 命令使用 `rtk`；不修改 Node/pnpm 配置或安装依赖。以下命令均从仓库根执行。
- 修复后的测试入口是实际 vendor/generated；禁止把完整 patched generated 当 vendor、全文件格式化、无约束全局替换、已迁移 patch 的 no-op/try-catch fallback。

## Review Focus

以下五种输入/条件由对应 task 明确增加断言，review 不以“旧测试已绿”代替检查：

1. vendor 在 dry-run 后被其他修改改变：拒绝写回，保留文件 bytes，Task 2。
2. prepare 连跑两次：没有第二次核心 transform、重复音频 listener 或 factory 初始化，Task 3/12/14。
3. WorldMap 核心独立提取、产品 action 缺省及 final binding：核心可初始化，最终三个动作只绑定一次且取消/确认/预检保持，Task 11。
4. 永久 Mail/BasicInfo/WorldMap 文本提前出现在 localization 输入：最终字符串、resource key 和翻译挂载正确，Task 8/9/11。
5. 迁移删除模块后 preview/test 仍导入旧路径或 factory 文本漂移：显式 import 查询、actual source 提取和 parity，Task 9/11/12/13。

## 执行方式、模型与交接

| 角色 | 模型/effort | 职责 |
| --- | --- | --- |
| 每个 task 的 implementer | `gpt-6-luna` / `max`，`fork_turns: "none"` | 实现一个 task，运行聚焦验证，完成 task 自审核，写报告 |
| task 自审核 | 同一个 `gpt-6-luna` / `max` implementer | 分别报告 spec compliance 与 code quality；不额外派发 task reviewer |
| 最终独立 reviewer | `gpt-6.1-sol` / `high`，`fork_turns: "none"` | 全分支独立只读 review；本 plan 的独立审查也使用该模型 |

用户最新指令已取消 6 Terra。不得继承控制线程默认模型代替以上配置，也不自动升级 implementer 模型。无法调用指定模型时报告实际接口限制。遇到 Luna 阻塞先补充接口/拆小当前 task，不重复无变化派发。

全部实现 task **串行**：它们共享 Online.js、patch-v2-runtime、测试提取工具和 generated 输出。主线程只负责接口、整合、ledger、命令证据和 review 闭环；implementer 不再派发子代理。遵守用户“只在本仓库”限制，直接使用当前仓库的专用 `codex/` 分支；不在仓库外建立 checkout。开始实施时识别现有 branch/worktree，复用符合此限制的当前 checkout，保留用户已有改动。

每次派发传本 task brief、spec 的相关节、Global Constraints、已产生接口与一份报告路径；不复制整段聊天历史或让 worker 读全 plan。记录 task 起始 BASE 和结束 HEAD，review package 使用完整 `BASE..HEAD`，不能假设 `HEAD~1`。任务报告含 exact files、接口、命令/exit/count、候选/最终 hashes、self-review 两个 verdict、剩余风险。小 diff 不重复执行已完成且同代码的全量测试。

scratch 固定在本仓库忽略的 `generated/runtime-consolidation/`，ledger、brief/report 和一次性工具位于该目录；prepare 只清理自身指定目录，不清除此 scratch。完成后提交长期证据文档，scratch 仍不提交。当前环境不存在 task 独立 reviewer 的 gate，这是用户选定的自审核方式；最终 review 仍必须独立，修复由一个 Luna Max worker 汇总完成，再由 6.1 Sol scoped re-review。

## 阶段与顺序

| 用户要求阶段 | Tasks | 依赖 |
| --- | --- | --- |
| a. 基线/迁移清单冻结 | 1 | 已确认 spec、实施授权 |
| b. Online.js 安全迁移机制 | 2 | 1 |
| c. 核心运行时批量迁移 | 3–6 | 2，串行 |
| d. packet layout 重命名 | 7 | 6 |
| e. localization/UI 文案合并 | 8 | 7 |
| f. UI/地图/资源永久合入 | 9–11 | 8，串行 |
| g. patch-v2-runtime 最终清理 | 12 | 11；每批已完成局部 import/call 清理 |
| h. 测试/兼容覆盖 | 13 | 12；每批已迁移本组测试 |
| i. build/audit/manifest 与最终 review | 14 | 13 |

先通过上一 task 聚焦验证和自审核才继续。每批完成后可做一个本地源码提交，内容必须包含 vendor + 本批构建清理 + 测试/声明迁移，不能提交一个会双重 patch 的中间态；不强制拆出 setup-only commit。任务最终交付未得到用户实施授权前，以下 checkbox 均保持未执行。

## 共用接口与文件规则

- `scripts/check-runtime-consolidation.mjs` / `.d.mts`：新增的**只读**审计/对照工具，不负责修改 vendor、不加入 prepare 或浏览器清单。
  - `auditCoreOwnership({ vendorSource: string, patcherSource: string, prepareSource: string, retiredTransforms: Array<{ module: string, imported: string, local: string, callOwner: string }>, retiredHostExports: string[] }): string[]`：按 import source、imported/local binding 和调用所属函数审计，而非按裸函数名。`retiredHostExports` 只指 orchestrator 顶层定义/导出。返回违反永久定义/退休 import/call/prepare 边界的诊断；不在测试外自动 swallow。
  - scoped layout 退休记录固定为 `{ module: './lastro-ui-layout.mjs', imported: 'patchRuntimeUiLayout', local: 'patchScopedUiLayout', callOwner: 'patchV2Runtime' }`；保留本地产品函数 `patchRuntimeUiLayout` 及其调用。其他直接 import 的 local 等于 imported；对已删 import 后剩余的旧 local 调用也检查作用域，不能靠移除 import 隐藏漏删 call。
  - `compareRuntimeSources(before: string, after: string, options: { stage: 'audio' | 'sync' | 'gameplay' | 'receive' | 'packet' | 'localization' | 'ui-layout' | 'ui-state' | 'worldmap' | 'final' }): { equal: boolean, differences: Array<{ owner: string, kind: string, detail: string }> }`：AST/token 与真实字符串对照；差异必须精确到 node/owner，不按整 region 放行。
  - CLI：`--baseline <absolute-file> --candidate <absolute-file> --stage <stage>` 作对照；`--check-final` 作最终 read-only 源所有权检查；不提供 write flag。
- `test/helpers/vendor-runtime.ts`：`readVendorSource(): string`；`extractVendorRegion(path: string, source?: string): string`；`extractRuntimeNode(source: string, selector: { region?: string, kind: 'function' | 'class' | 'assignment', name: string }): string`。region 和目标节点均要求唯一，function 支持 declaration/命名 expression；assignment 按确切 left-hand expression，class 支持赋值 class expression。测试自行显式绑定 sandbox 依赖，不执行真实 bundle/网络。
- `test/helpers/runtime-patch-fixture.ts`：从 Task 3 起提供 `buildRuntimePatchFixture(vendorSource: string): string`。保留现有合成测试的 residual transport/login/Worker/CSP/product anchors，只把其已有的核心模拟片段替换为当前 vendor 的唯一实际 owner；不是再造整个 bundle。具体片段契约见 Task 3，后续阶段读取当前 vendor 即更新对应 owner，不能在 Task 12 才补救已删除 transforms。
- `generated/runtime-consolidation/migrate-runtime-core.mjs`：一次性候选 runner，不提交；每批仅 dynamic import 本批仍存在的 transforms。CLI 在 Task 2 固定，正常 build 无引用；删除模块后不指望其仍能重跑退休批次。
- `test/fixtures/runtime-consolidation/`：仅需要 upstream 对照的受限旧 region/function fixture；每个 fixture 的 provenance 写入 `provenance.json`，字段为 `path`、`sourceCommit`、`sourceSha256`、`regionOrSymbol`、`fixtureSha256`；不存完整 Online.js，不存修复实现/账号数据。
- 每个 task 列出的 `.mjs` 若删除/重命名，处理其同 stem `.d.mts`；这是确定路径变换，例如 `scripts/lastro-frame-timing.mjs` 对应 `scripts/lastro-frame-timing.d.mts`。`lastro-monster-portrait.mjs`、`lastro-skill-localization.mjs` 当前没有声明文件，不虚构删除路径。
- 每批共同修改 `test/runtime-core-consolidation.test.ts` 与需要改入口的 `test/v2-runtime-patch.test.ts`；实际 fixture 构造从真实永久 region 提取，不能再运行已退休 patch。

### Task 1: 冻结本地基线和消费者清单（a）

**Exact files:** 只读 `vendor/v2/Online.js`、`scripts/prepare-runtime.mjs`、`scripts/patch-v2-runtime.mjs`、spec 矩阵内 38 个 MJS/声明、`config/lastro-module-inventory.json`、`config/v2-allowlist.json`、`config/core-asset-roots.json`。创建 scratch `baseline/vendor-Online.js`、`baseline/final-Online.js`、`baseline/metadata.json`、`consumers.json`；创建有需要的 bounded fixtures/provenance。所有 scratch 路径以前述 generated 根为前缀。

**Interfaces / dependency:** 依赖实施授权；输出 baseline commit/hash、38-file 分类与 test/preview/audit import 清单供 Tasks 2–14。审查时的 vendor hash 是 `9d8cbd73b52dc37b25d136d7c21ea59f157dc3dedffdd9d31bfc5d2e9f8f5b7b`，不是未来静默接受任意变化的默认值。

- [ ] 核对规则、当前 HEAD/branch/dirty files，记录此次实际基线；若 vendor 与 spec hash 不同，先核对 diff/解释变动，不覆盖用户修改。
- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm prepare:runtime`，保存 vendor 原 bytes 和完整 final bytes 到 scratch 后记录 SHA-256；不要把其内容写入 vendor。
- [ ] 用 CodeGraph 后续精确查询与 `rtk proxy rg -n` 枚举消费者。至少冻结 `preview-ui-review.mjs` 的 ui-layout 二次 patch、worldmap teleport/confirmation/lifecycle 的旧 exported patch、audio/BGM 的 `patchWebAudioPlayback`、Preferences 两个旧测试。
- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/v2-runtime-patch.test.ts test/module-inventory.test.ts test/v2-source-ownership.test.ts test/v2-regression-runner.test.ts test/import-v2-snapshot.test.ts`；基线新失败先定位，不伪装为本次迁移失败或直接改无关代码。
- [ ] 提取之后必须保留 upstream 对照的有名旧 region/functions，记录 provenance；其他旧行为测试直接改入口，不机械复制所有 region。
- [ ] 自审核基线报告。PASS：准备和所列 suite 通过、两个原文件 hash 可复算、消费者清单覆盖所有点名模块。FAIL：缺源/漂移未解释/外部来源读取/任何未登记消费者。

**Anti-pattern guards:** 不运行 `import:v2 --source` 指向外部目录，不刷新 allowlist reviewedSha256，不复制整 bundle 到 tracked test fixture，不提交 generated baseline。

### Task 2: 建立候选迁移和只读验证工具（b）

**Exact files:** 创建 `scripts/check-runtime-consolidation.mjs`、`scripts/check-runtime-consolidation.d.mts`、`test/helpers/vendor-runtime.ts`、`test/runtime-core-consolidation.test.ts`；创建一次性 scratch runner。只读 Task 1 baseline；本 task 不改 vendor/patcher。

**Interfaces / dependency:** 依赖 Task 1；实现上面的共用接口。runner CLI：`--batch <audio|sync|gameplay|receive|ui-layout|ui-state|worldmap> --input <repo-vendor-file> --expect-sha <sha256> --output <scratch-candidate>` 默认只写候选；另一个 `--apply-candidate <scratch-file> --expect-sha <current-vendor-sha> --validated-sha <candidate-sha>` 分支仅在验证完成后写唯一目标 `vendor/v2/Online.js`。

- [ ] 在 `runtime-core-consolidation.test.ts` 加 `rejects missing or duplicated AST owners`、`preserves decoded HTML/CSS strings in comparison`、`rejects retired transform calls instead of accepting no-op`、`distinguishes retired scoped layout import from retained local product layout`；验证选择器缺失/重复时 throw、改单个 literal 返回差异、退休 module 的 alias import/call 被拒绝，而本地同名产品函数及其调用被允许。移除旧 import 但漏删 alias call 的输入也必须报错。
- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run test/runtime-core-consolidation.test.ts`，预期新接口未实现导致 FAIL；实现接口后预期 PASS。
- [ ] runner 为每个 batch 设置显式函数允许列表，拒绝未知 batch；只 dynamic import 当前批次，音频前置/WorldMap/diagnostic 的自定义编辑有独立 AST owner。拒绝 transform 修改名单外 region/节点；保留 LF/CRLF 与未改区域原 bytes。prefix 插入不是全文件重排，必须只处理登记的新增 helper/initializer。
- [ ] 每次 candidate 记录 input/output hash、transform 顺序、唯一 anchor、changed owners。使用 TS parse diagnostics、helper 定义数量、scope/initializer 校验和候选 residual CLI 对照。比较脚本的允许差异必须以精确 node selector、数量、before/after 条件实现，并随行为证据登记；不能简单返回 equal。
- [ ] scratch CLI 负例验证：`--expect-sha` 使用故意错误值、未知 batch、缺 region、重复 region、dry-run 后 input bytes 改变、candidate 在验证后改变；全部非零退出，vendor bytes 不变。记录命令和错误，不把 transient runner 作为最终测试依赖。
- [ ] `--apply-candidate` 再校验 input 和 candidate 两个 hash，解析并检查候选，写同目录临时文件后 rename；目标 path/symlink 必须验证在仓库内且只允许那个 vendor 文件。工具不删任何其他文件，不提供 `--force`。
- [ ] 自审核与本地提交永久的 read-only 工具/测试 helper（temporary runner 不提交）。PASS：所有测试/负例如期、正常 prepare 未引用 runner。FAIL：任意失败路径写了 vendor、宽松全文匹配或忽略全 region 差异。

**Anti-pattern guards:** 不把迁移 runner 放入 prepare/package build，不使用 regex 匹配任意跨 region 正文，不提交一套可重跑已删除 patches 的新构建系统。

### Task 3: 音频永久迁移及必要依赖闭包（c1）

**Exact files:** 修改 `vendor/v2/Online.js`、`scripts/patch-v2-runtime.mjs`、`scripts/patch-v2-runtime.d.mts`、`test/lastro-audio-timing.test.ts`、`test/lastro-bgm-recovery.test.ts`、两个共用 consolidation/runtime 测试；创建 `test/helpers/runtime-patch-fixture.ts`；删除 `scripts/lastro-audio-timing.mjs`/同 stem 声明。必要的 bounded audio fixture 加 provenance。

**Interfaces / dependency:** Task 2；输入 `patchWebAudioPlayback(source)` → `patchRuntimeAudioTiming(source)`。产出实际 `createLastroSoundTiming`、timed installer、BGM/SoundManager/MemoryManager，以及 `installLastROAudioUnlock`、`LastROAudioPlay`、`LastROAudioUnlock`、`LastROAudioRegisterContext`。`patchWebAudioPlayback` 不再是 build/test API。

- [ ] 新增 `vendor audio has one unlock installation and supports failed decode retry`，测试从 vendor 提取 factory、显式依赖，断言 500ms 总 deadline、100ms min gap、global 32/per-file 10 限额、取消 generation、BGM 停止/同图/音量/失败 retry、visibility/pagehide/context cleanup；初始 vendor 缺该完整闭包，预期 FAIL。
- [ ] dry-run `audio` batch：准确复制旧 prefix 的音频支持，应用前置+timed 变换结果，放到 import 后受控区域。保留 `source.startsWith('import ')` 入口契约；不迁入账号/Worker prefix。对初始化 listener 时序和 `LastROWebAudio` 的 const 求值单独检查，不仅靠函数 hoisting。
- [ ] 删除 patcher 音频 prefix、`webAudioRuntime`、`patchWebAudioPlayback` 及其私有专用 host helper（确认无其他调用后）、audio import/call和声明；迁移 v2-runtime 的旧 audio API/negative tests。
- [ ] 同时建立 `buildRuntimePatchFixture`：替换完整链路测试手写的 upstream BGM/SoundManager/createRainAudio/Common CSS、空 WorldMap 和 map-failure 函数；cache 部分取 `src/Core/MemoryItem.js`、`src/Core/MemoryManager.js`、`src/Core/Preferences.js`，音频取 `src/Audio/BGM.js`、`src/Audio/SoundManager.js`、`src/Renderer/Effects/RainWeather.js`，CSS取 `src/UI/Common.css?raw`，WorldMap取 `src/UI/Components/WorldMap/WorldMap.js`，地图失败只取 `onMapComplete(success,error)` 节点。加入 vendor 内唯一的音频 unlock/installer 定义和对应初始化 statements（嵌在 installer 内的 factory 不再次复制），保留原有效副作用顺序。上述 owner 今后随 current vendor 读取自动获得永久实现或仍需 residual patch 的旧源；不重复插入 region、class 或函数。替换仅用于源变换/parse 测试，不执行整合成客户端。
- [ ] 将旧 `installLastROAudioUnlock();\nimport { existing }` 位置字符串断言改为 AST 验证一次初始化及实际作用顺序，继续检查 import 保留和音频注册；保留 audio 行为断言。新增 `synthetic residual fixture uses actual audio owners after audio retirement`，使 Task 3 即可执行完整 `patchV2Runtime(fixture)`；Tasks 4–11 的每批验收都使用该 builder，未出现在合成 fixture 中的核心 owner 由真实 vendor/generated 测试覆盖。
- [ ] 对候选运行 `rtk proxy node scripts/patch-v2-runtime.mjs --input <candidate-absolute-path> --output <scratch-final-absolute-path> --manifest <scratch-manifest-absolute-path>`；对照 `baseline/final-Online.js`，stage `audio` 只允许已登记声明位置差异，初始化副作用顺序须等价；通过后 apply candidate。
- [ ] prepare 后运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/lastro-audio-timing.test.ts test/lastro-bgm-recovery.test.ts test/runtime-core-consolidation.test.ts test/v2-runtime-patch.test.ts`。
- [ ] 自审核、记录 hash 和提交完整本批。PASS：上述行为通过、只有一个 unlock installation/音频 factory、无退休 import/export/call、final 对照无未经登记差异。FAIL：缺 RegisterContext 闭包、重复 listeners、factory 仍从旧 MJS 测试。

**Anti-pattern guards:** 不把 self-contained factory defaults/外部依赖漏掉；不把装入新 bundle 的 `.mjs` 源整个复制进去；不以完全换音频实现代替现有行为迁移。

### Task 4: 时钟、实体、HP 与移动同步（c2）

**Exact files:** vendor/patcher/共用测试；删除以下 MJS/声明：`scripts/lastro-frame-timing.mjs`、`lastro-entity-sync.mjs`、`lastro-monster-hover-hp.mjs`、`lastro-movement-input.mjs`、`lastro-movement-sync.mjs`。修改 `test/lastro-frame-timing.test.ts`、`lastro-entity-sync.test.ts`、`lastro-player-corpse.test.ts`、`lastro-monster-hover-hp.test.ts`、`lastro-movement-input.test.ts`、`lastro-movement-sync.test.ts`、`vending-movement-runtime.test.ts`，以及 `test/lastro-server-walk.test.ts` 的嵌入 parity。

**Interfaces / dependency:** Task 3；顺序 frame → entity sync → hover HP → movement input → movement sync。保留 `scripts/lastro-server-walk.mjs`/声明；输出实际 server clock、route/HP/input/sync helpers。

- [ ] 对上述固定行为测试改取 vendor，新增 `permanent clock route and input compose without retained appearance patches`；真实函数名是 `LastROServerClockNow`、`LastROResetServerTick`、`LastROInvalidateServerTick`、`LastROAdvanceServerTick`。保留 Events 256 处理预算/异常隔离、tick wrap/重新采样、路线最大 32 steps/2048 nodes、corpse/复活、wall/turn/join、HP stale 2 秒和可信 max、输入与 movement epoch 的断言。初始 permanent source 入口预期 FAIL。
- [ ] dry-run `sync` batch，检查 EntityWalk/Renderer/Events/MapEngine/EntityControl/MapControl/MapRenderer/Navigation/NetworkManager 的确切 owners；`findLastroServerWalkPath` 的序列化结果及 movement 私有函数保留 bundle scope，不冻结 retained appearance 数据。
- [ ] 删除本组 import/call，迁移跨测试依赖：movement-input 不再先 patch frame，movement-sync 不再先 patch entity，vending fixture 从 permanent input region开始再应用尚未迁移的 vending patch。
- [ ] 候选 residual CLI、stage `sync` 对照与 apply 按 Task 3 协议；随后 prepare。
- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/lastro-frame-timing.test.ts test/lastro-entity-sync.test.ts test/lastro-player-corpse.test.ts test/lastro-monster-hover-hp.test.ts test/lastro-movement-input.test.ts test/lastro-movement-sync.test.ts test/lastro-server-walk.test.ts test/lastro-entity-appearance.test.ts test/vending-movement-runtime.test.ts test/runtime-core-consolidation.test.ts test/v2-runtime-patch.test.ts`。
- [ ] 自审核、记录 hash并提交本批。PASS：核心路由/时钟与保留 appearance/vending build tests 均绿，helper 只定义一次。FAIL：路径截断/时钟 reset 丢失、旧 transform再次执行、optional tools 接口变成硬依赖。

**Anti-pattern guards:** 不并入 `lastro-entity-appearance.mjs`；不为测试留一份 movement factory 副本；不忽略 damaged receive/MapEngine anchors。

### Task 5: 装备、技能、party 与摆摊（c3）

**Exact files:** vendor/patcher/共用测试；删除 MJS/声明：`scripts/lastro-weapon-view-fallback.mjs`、`lastro-equipment-animation.mjs`、`lastro-equipment-cart.mjs`、`lastro-manual-skill.mjs`、`lastro-skill-cooldown.mjs`、`lastro-party-state.mjs`、`lastro-vending-movement.mjs`。修改 `test/lastro-weapon-view-fallback.test.ts`、`lastro-equipment-animation.test.ts`、`lastro-equipment-cart.test.ts`、`lastro-manual-skill.test.ts`、`lastro-skill-cooldown.test.ts`、`lastro-party-state.test.ts`、`lastro-party-runtime.test.ts`、`vending-movement-runtime.test.ts`、`lastro-costume-loop.test.ts`。

**Interfaces / dependency:** Task 4；顺序 weapon fallback → equipment animation → cart → manual skill → cooldown → party → vending。保留 `scripts/lastro-equipment-view.mjs` 全部三个 transform、`lastro-costume-loop.mjs`/声明。ui-state 尚未迁移时其现有 transform 可在 permanent cooldown 上执行。

- [ ] 改 fixed 测试入口，保留 body/equipment 独立 ACT counts、共同 action/clock 和 costume loop、cart display、玩家 vs companion 手动技能、cooldown deadline/reappend、party lazy init/reset/storeLife ownership、购物移动 gate。新增 `permanent cooldown survives ui-state append wrapping` 与 `permanent fallback composes with modular catalog view appearance`，当前 permanent源预期 FAIL。
- [ ] dry-run `gameplay`，逐函数登记 AST edit；嵌入 `createLastroPartyState`，保留与 WorldMap/minimap 的显式依赖及延迟 init，不复制未授权的 equipment catalog/view/appearance。
- [ ] 删除本组 build imports/calls 和旧测试 imports，仍存在的 ui-state测试调用保留至 Task 10；将两个 retained helper 的 parity纳入 consolidation tests。
- [ ] residual CLI、stage `gameplay` 对照、apply、prepare。
- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/lastro-weapon-view-fallback.test.ts test/lastro-equipment-animation.test.ts test/lastro-equipment-cart.test.ts test/lastro-equipment-appearance.test.ts test/lastro-costume-loop.test.ts test/lastro-manual-skill.test.ts test/lastro-skill-cooldown.test.ts test/lastro-party-state.test.ts test/lastro-party-runtime.test.ts test/vending-movement-runtime.test.ts test/runtime-core-consolidation.test.ts test/v2-runtime-patch.test.ts`。
- [ ] 自审核、证据和提交。PASS：全部行为/retained equipment变换通过，party不引发循环init。FAIL：原 UI/cooldown 方法互相覆盖、同步控制误伤 companion/商人。

**Anti-pattern guards:** 不删除测试数量来躲 anchor failures；不能将工具箱 routecancel 的现有可选调用扩大成工具箱实现内嵌。

### Task 6: 收包恢复与 EOF drain（c4）

**Exact files:** vendor/patcher/共用测试；删除 `scripts/lastro-network-receive-recovery.mjs`/声明。修改 `test/lastro-network-compatibility.test.ts`、`character-switch-network-runtime.test.ts`、`lastro-network-diagnostics.test.ts`。

**Interfaces / dependency:** Task 5；`patchRuntimeNetworkFramingRecovery` → `patchRuntimeNetworkCloseDrain`。保留 item layouts、character-switch、handoff、network diagnostics build transforms。

- [ ] fixed tests从 permanent NetworkManager开始，只应用保留 transforms。新增 `permanent receive state survives malformed chunk and drains EOF batch`，断言 live socket state保留、坏chunk后有效包、32/96帧 drain、ACK及 late old socket不影响新连接；原vendor未修复预期 FAIL。
- [ ] dry-run `receive`、清理两个核心 import/call，保留 diagnostics 对 receive/onClose 的 AST 包装；按 stage `receive` 对照和 apply。
- [ ] prepare 后运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/lastro-network-compatibility.test.ts test/character-switch-network-runtime.test.ts test/lastro-network-diagnostics.test.ts test/runtime-core-consolidation.test.ts test/v2-runtime-patch.test.ts`。
- [ ] 自审核/提交。PASS：badframe recovery、EOF drain 和 retained diagnostics全部通过，未知packet/旧ID行为未扩大。FAIL：receive batch尚未完成被 close清空、diagnostic捕获用户内容或旧连接泄漏。

**Anti-pattern guards:** 不改变 Direct TCP factory，不增加 fallback，不把 diagnostics 改为记录 raw packet/账号/聊天。

### Task 7: 物品 packet layout 模块重命名（d）

**Exact files:** 将 `scripts/lastro-network-security.mjs`/`.d.mts`重命名为 `scripts/lastro-item-packet-layouts.mjs`/`.d.mts`；将 `test/lastro-network-security.test.ts` 重命名为 `test/lastro-item-packet-layouts.test.ts`；修改 `scripts/patch-v2-runtime.mjs`、`test/lastro-network-compatibility.test.ts`、`test/runtime-core-consolidation.test.ts`。只更新当前 docs/config/audit中实际引用旧路径的活跃规则，不改历史记录的原名语义。

**Interfaces / dependency:** Task 6；保持 `patchRuntimeLastROItemLayouts(source: string): string` 导出、build阶段和 `lastroUsesWideItemIds`，六个目标constructor同spec §7。

- [ ] 原子更新所有活跃 imports；不创建兼容wrapper。没有行为改动，不为rename编造 failing behavioral test；增加旧路径不存在和新export可导入的结构断言。
- [ ] 保留 `anchor:network-security:*` 现有错误值及 no-double-apply负例，保留 Configs.lastroProtocol、包长度与PacketVer precedence及旧/宽item ID测试；测试描述改为item layouts。
- [ ] prepare；stage `packet` 新旧最终源预期 token/string相同。
- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/lastro-item-packet-layouts.test.ts test/lastro-network-compatibility.test.ts test/runtime-core-consolidation.test.ts test/v2-runtime-patch.test.ts`；`rtk proxy rg -n 'lastro-network-security\.mjs' scripts src test config` 预期无活跃命中（exit 1表示无匹配）。
- [ ] 自审核/提交。PASS：新路径解析、六包行为不变、旧诊断值保持。FAIL：改了packet constructor/config/error string或留旧wrapper。

**Anti-pattern guards:** 不将packet layouts永久合入vendor，不误把名字含security当成安全审计修复。

### Task 8: 合并显示本地化模块（e）

**Exact files:** 创建 `scripts/lastro-display-localization.mjs`/`.d.mts`；删除 MJS及已有声明：`lastro-localization`、`lastro-skill-localization`、`lastro-ui-text`、`lastro-ui-messages`、`lastro-item-name`、`lastro-emoticons`（均位于 scripts）。修改 `scripts/patch-v2-runtime.mjs`/声明、`scripts/audit-localization.mjs`、`scripts/audit-ui-review.mjs`；修改 `test/lastro-ui-text.test.ts`、`lastro-ui-messages.test.ts`、`localization-lifecycle.test.ts`、`localization-behavior.test.ts`、`lastro-status-tooltips.test.ts`、`lastro-item-name.test.ts`、`emoticons-runtime.test.ts`、`character-resource-localization.test.ts`、两个共用测试。数据输入 `lastro-job-name-aliases.json`、`lastro-skill-data.mjs`、`lastro-skill-extra.mjs`保持独立。

**Interfaces / dependency:** Task 7；新模块保持spec §8所有导出/类型，并迁入orchestrator的 `patchRuntimeLocalization(source)`、`patchRuntimeJobLocalization(source)`、`patchRuntimeSkillLocalization(source)`；patch-v2不提供forwarding exports。

- [ ] 新增 `combined localization preserves public exports and serialization inputs`：校验六patch、factory、tables、tooltip/assert/coordinator导出存在及原声明契约；runtime factory带显式表实参，缺输入造成的闭包问题被测试捕获。新路径不存在时预期 FAIL。
- [ ] 按职责组织内部数据/factory/transform区域，重命名碰撞的私有helpers，删除旧互相imports；不改变data-key过滤、CSV row/id、GBK skill overlays、empty descriptions、附魔实际Lua识别或emoticon packet行为。
- [ ] `patchRuntimeJobLocalization` 从全 UI 的裸匹配改为精确展示 owner 表，仍要求九处：PartyFriendsCommon 的 `Component.renderPartyMember`/`jobName`（1）；Guild 的 `Guild.setMember` 中 `jobCell.textContent`、`jobCell.title`（2）；BasicInfoCommon 的 `Component.update`/`el.textContent`（1）；WriteRodex 的 `WriteRodex.characterInfo`/`text`（1）；CaptchaSelector 的 `CaptchaSelector.setPlayers` 中 `charJob` 与 `_aidInformation` 的 `job`（2）；CharSelectCommon 的 `moveCursorToPaginated`、`moveCursorToGrid` 中 `.job` textContent（2）。每个 region/owner/表达式必须唯一；缺失或重复仍报 `anchor:job-display-lookups`。
- [ ] 提前定义 Task 11 的唯一非展示例外：WorldMap region 内 `createMonsterPortraitLoader` 调用第二实参的 `id => MonsterTable_default[id] ? DB.getBodyPath(id, 0) : null`，这是资源存在性 guard，完整保留原表达式；只有该 call/param/条件/body 形态可排除（当前阶段可以尚未出现）。其他不在九个展示 owner 表或该精确资源 guard 内的 UI lookup 直接报告 drift。增加 `job display selectors preserve portrait resource guard` 和缺/重复展示 owner、未知额外 lookup 的负例；不得改为总数 10 或跳过整个 WorldMap region。
- [ ] 保持早期 coordinator → uiText → uiMessages → mapLocalization → statusTooltips，晚期itemName与emoticons保持原交错位置。新增 `localization sees permanent UI literals without translating resource basenames`，本组先验证已迁移核心区域，Tasks9/11扩展到新永久UI/WorldMap。
- [ ] 原子更新审计/测试imports与声明；prepare；stage `localization`对照预期语义完全相同，不因“合并”允许表值差异。
- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/lastro-ui-text.test.ts test/lastro-ui-messages.test.ts test/localization-lifecycle.test.ts test/localization-behavior.test.ts test/lastro-status-tooltips.test.ts test/lastro-item-name.test.ts test/emoticons-runtime.test.ts test/character-resource-localization.test.ts test/runtime-core-consolidation.test.ts test/v2-runtime-patch.test.ts`；运行 `rtk proxy node scripts/audit-localization.mjs --check-runtime` 和 `rtk proxy node scripts/audit-ui-review.mjs`（后者只输出ignored报告）。
- [ ] 自审核/提交。PASS：全部接口与顺序、实际汉化挂载不变，无旧六文件活跃import。FAIL：合并后使用省略实参的factory、移动latepatch到早期、把skill资源名译成中文。

**Anti-pattern guards:** 不把新MJS加入runtimeFiles或IWA executable列表；不把所有transform换成万能字符串replace，不把额外数据模块一并合并。

### Task 9: 排版、静态布局、BasicInfo、Mail 与 shop titles（f1）

**Exact files:** vendor/patcher/共用测试；删除MJS/声明：`scripts/lastro-typography.mjs`、`lastro-dialog-typography.mjs`、`lastro-ui-layout.mjs`、`lastro-basic-info.mjs`、`lastro-mail.mjs`、`lastro-shop-titles.mjs`。修改 `scripts/preview-ui-review.mjs`；修改 `test/lastro-typography.test.ts`、`lastro-dialog-typography.test.ts`、`lastro-ui-layout.test.ts`、`lastro-basic-info.test.ts`、`lastro-mail.test.ts`、`showshop-runtime.test.ts`、`localization-behavior.test.ts`。

**Interfaces / dependency:** Task 8；顺序 typography → dialogTypography → scopedUiLayout → basicInfo → mail → shopTitles。只退休import alias `patchScopedUiLayout`；orchestrator内的产品 `patchRuntimeUiLayout`继续保留。

- [ ] fixed tests取actual vendor，保留MiSans/font启动、canvas DPR/logical metrics、BasicInfo版本1/3/4/5、Mail逃逸/校验/重量/位置、`/showshop` this绑定。新增 `preview layout uses permanent CSS without reapplying transform` 与Task8文案断言扩展，原路径未迁移预期 FAIL。
- [ ] dry-run `ui-layout`，使用特定HTML/CSS raw region与函数节点，保留这些patch自有文本，不主动改归本地化模块。
- [ ] preview删除ui-layout import与 `patchRuntimeUiLayout(runtime)`；`window.fixedCss`直接取generated已有CSS，before.css仍按组件自己的精确 scoped marker 截取。仅以下 preview path 要求 marker 唯一：`CashShop/CashShop`、`ChatRoomCreate/ChatRoomCreate`、`CartItems/CartItems`、`Storage/StorageV3/Storage`、`SkillList/SkillListV2/SkillListV2`（后三个SkillList窗口共用同一path）；缺失/重复报错。`Inventory/InventoryV3/InventoryV3`、`ChatBoxSettings/ChatBoxSettings`、`GraphicsOption/GraphicsOption` 合法地没有本次marker，before与fixed使用同一已有CSS；这些path意外出现不属于它们的marker则拒绝。测试覆盖两类窗口，不能对全部窗口一律要求marker。
- [ ] 清理本组buildimports/calls（保留同名产品layout），candidate residual CLI、stage `ui-layout` 对照、apply、prepare。
- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/lastro-typography.test.ts test/lastro-dialog-typography.test.ts test/lastro-ui-layout.test.ts test/lastro-basic-info.test.ts test/lastro-mail.test.ts test/showshop-runtime.test.ts test/localization-behavior.test.ts test/runtime-core-consolidation.test.ts test/v2-runtime-patch.test.ts`；运行 `rtk proxy node scripts/audit-localization.mjs --check-runtime`、`rtk proxy node scripts/audit-ui-review.mjs`。preview核心提取路径在单测中以actual CSS验证，不要求下载资源或实战截图。
- [ ] 自审核/提交。PASS：permanentUI、preview和late文本结果等价。FAIL：preview还调用旧patch、误删产品layout、模板二次翻译或DPR改变。

**Anti-pattern guards:** 不能因为preview消费者保留整个已退休patch；不删除before/after演示能力，不引入新字体/样式重设计。

### Task 10: UI state/input、drag、store/count、navigation、NPC buttons（f2）

**Exact files:** vendor/patcher/patcher声明/共用测试；删除MJS/声明：`scripts/lastro-store-scroll.mjs`、`lastro-storage-count.mjs`、`lastro-ui-state.mjs`、`lastro-ui-input.mjs`、`lastro-item-drag.mjs`、`lastro-navigation-ui.mjs`、`lastro-npc-dialog-buttons.mjs`。修改 `test/lastro-store-scroll.test.ts`、`storage-count.test.ts`、`ui-window-state.test.ts`、`ui-nested-window-state.test.ts`、`ui-scaled-input.test.ts`、`storage-filter-ui-state.test.ts`、`shortcut-window-state.test.ts`、`graphics-option-open-runtime.test.ts`、`lastro-item-drag.test.ts`、`lastro-item-drag-native.test.ts`、`lastro-navigation-ui.test.ts`、`npc-dialog-buttons-runtime.test.ts`、`lastro-skill-cooldown.test.ts`、`lastro-preferences-save.test.ts`、`lastro-shortcut-preference-runtime.test.ts`。

**Interfaces / dependency:** Task 9；迁移顺序保持现有相对次序：NPC buttons → navigationUi → storeScroll → storageCount → uiState → uiInput → itemDrag。输出actual installers/UI helpers及Preferences最终get/save；删除被uiState覆盖的 `patchRuntimePreferencesSave` build调用/实现/声明。

- [ ] fixed/sandbox从actual vendor取helper，类型仅转到测试helper或测试本地接口。保留ShadowRoot/native drag、RAF edge scroll/drop/remove、搜索/分类/withdraw/deposit只计一次、嵌套窗口/shortcut/scale/resize、NPC terminal packet与observer cleanup。
- [ ] 新增 `permanent Preferences save can retry after quota or serialization failure`：不临时删除 `_key/save`，异常可观察，重试成功；更新两个旧Preferences测试与cooldown跨wrapper测试。原vendor缺完整最终save预期FAIL。
- [ ] dry-run `ui-state`；检查uiState中Shortcut append最终同时包含cooldown resume；保留Preferences字段，前面被覆盖的try/finally旧patch不再单独迁入。
- [ ] 删除本组import/call和 `patchRuntimePreferencesSave`，保持shortcut settings产品变换；剩余anchor只作针对已修复source的精确适配。candidate residual CLI、stage `ui-state`对照、apply、prepare。
- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/lastro-store-scroll.test.ts test/storage-count.test.ts test/ui-window-state.test.ts test/ui-nested-window-state.test.ts test/ui-scaled-input.test.ts test/storage-filter-ui-state.test.ts test/shortcut-window-state.test.ts test/graphics-option-open-runtime.test.ts test/lastro-item-drag.test.ts test/lastro-item-drag-native.test.ts test/lastro-navigation-ui.test.ts test/npc-dialog-buttons-runtime.test.ts test/lastro-skill-cooldown.test.ts test/lastro-preferences-save.test.ts test/lastro-shortcut-preference-runtime.test.ts test/runtime-core-consolidation.test.ts test/v2-runtime-patch.test.ts`。
- [ ] 自审核/提交。PASS：全部固定入口均来自actualvendor，保存异常/重试、缩放、drag、store count、observer行为不变；settings仍能应用。FAIL：旧savepatch锚点失效仍执行，计数doubleupdate、cooldown遗漏或fixture还读删除模块。

**Anti-pattern guards:** 不因为偏好存储变化修改IndexedDB账号schema；不能复用同名函数全局替换多个Component作用域；不删除只读query和quota失败断言。

### Task 11: WorldMap/portrait、资源 helper 与地图失败（f3）

**Exact files:** 修改 vendor、`scripts/patch-v2-runtime.mjs`/声明、`scripts/extract-worldmap-fixture.mjs`、共用测试；复核并按实际嵌入形态精确适配 `scripts/lastro-display-localization.mjs` 的 Task 8 owner selectors；**保留** `scripts/lastro-worldmap.mjs`/声明、`lastro-monster-portrait.mjs`、`lastro-map-resource-name.mjs`/声明、`lastro-map-load-diagnostic.mjs`/声明及 `scripts/preview-worldmap.mjs`。修改 `test/worldmap-browser.test.ts`、`worldmap-portrait.test.ts`、`worldmap-teleport-runtime.test.ts`、`worldmap-confirmation-runtime.test.ts`、`teleport-route-lifecycle.test.ts`、`lastro-map-resource-name.test.ts`、`map-load-diagnostic.test.ts`、`map-load-failure-recovery.test.ts`、`npc-map-runtime.test.ts`、`lastro-achievement-links.test.ts`、`localization-behavior.test.ts`、`character-resource-localization.test.ts`。

**Interfaces / dependency:** Task 10；永久createWorldMapIndex/WORLD_MAP_HTML/CSS/installLastroWorldMap/createMonsterPortraitLoader、layout、本地loadData、`resolveLastroMapResourceName`、`describeLastroMapLoadFailure`。新的build API `patchRuntimeWorldMapProductActions(source: string): string`替代旧full `patchRuntimeWorldMap`；`teleportResourceLoaderCode(): string`引用永久resolver；退休 `patchMapLoadFailureRecovery`。

- [ ] 新增 `worldmap core initializes with optional actions absent`、`product actions bind once and preserve confirmation cancel preflight`、`embedded helpers match reusable factories and templates`；测试actualvendor/core与generated/product两入口，原source缺这些seams预期FAIL。
- [ ] 单次 `worldmap`候选编辑：唯一WorldMap region换为完整现有display/portrait/index/templates/local data/layout；在GUI创建之后installer之前设置 `lastroWorldMapActions`对象和唯一marker，spread到deps。保留exact monster IDs、search/drop/items/party/window/async stale、portrait并发4/timeout15000/cache128/重试。
- [ ] 从旧fullpatch剥出产品preflight/teleport定义、`_lastroTeleport`、navigate/teleport/cancelTeleport，构建只注入这些；保留65000ms资源超时、profile/confirmation/SameMap/PRIVATE_AIRSHIP目标、Thread与notice/error接口。owner/marker/对象/installer均唯一，重复执行FAIL。新安排若改变GUI与纯factory构造相对位置，按精确node登记并测试构造阶段无GET_FILE/send/timer或遗漏初始化，不放行整个WorldMap。
- [ ] 将resolver/diagnostic永久声明一次；map completion失败分支完整永久落入MapRenderer，保留可选LastROTools取消、Networkclose、限长分类诊断/global/localStorage/errorzIndex；loader改引用resolver。保留产品MJS不复制其实现进核心。
- [ ] 删除worldmap/portrait/diagnostic/resolver构建序列化imports及旧fullpatch/mapfailure接口；保留产品teleportimports。更新所有旧WorldMappatch测试/API、resource sandbox显式resolver/diagnostic依赖及extractor，保持命名functionexpression可提取。WorldMap preview保留纯factoryimports；若提取形态改变只适配AST选择器。
- [ ] candidate residual CLI、stage `worldmap`精确差异报告、apply、prepare；验证factory/template/layout parity以及core和product两套初始化依赖，Task8永久文本断言扩展到WorldMap。
- [ ] 在真实 permanent WorldMap 输入上验证 Task 8 的 portrait guard 排除：九个展示 owner 恰好各被翻译，guard AST及 `DB.getBodyPath(id, 0)` 保持资源语义；从真实输入删/复制一个展示 owner、改变 guard 条件或新增未知 lookup 都 FAIL。直接验证 `patchRuntimeJobLocalization` 以及整个 `patchV2Runtime`，不只检查最终中文存在。
- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/worldmap-browser.test.ts test/worldmap-portrait.test.ts test/worldmap-teleport-runtime.test.ts test/worldmap-confirmation-runtime.test.ts test/teleport-route-lifecycle.test.ts test/lastro-map-resource-name.test.ts test/map-load-diagnostic.test.ts test/map-load-failure-recovery.test.ts test/npc-map-runtime.test.ts test/lastro-achievement-links.test.ts test/lastro-party-runtime.test.ts test/localization-behavior.test.ts test/character-resource-localization.test.ts test/runtime-core-consolidation.test.ts test/v2-runtime-patch.test.ts`。
- [ ] 自审核/提交。PASS：所有动作和preview/factory仍可用，四个保留helper与永久版本一致，finaldiff只有登记差异。FAIL：只迁vanillaWorldMap、丢搜索/掉落/肖像、烘焙产品实现、alias替换AIRSHIP目标或initializer循环。

**Anti-pattern guards:** mapResource/diagnostic没有patchRuntime导出，不能虚构入口；不能删除WorldMap/portrait纯helper，不能在prepare再次toString注入这些核心。

### Task 12: 最终 orchestrator 收敛与防重复门禁（g）

**Exact files:** `scripts/patch-v2-runtime.mjs`/声明、`scripts/check-runtime-consolidation.mjs`/声明、`test/runtime-core-consolidation.test.ts`、`test/v2-runtime-patch.test.ts`；`scripts/prepare-runtime.mjs`原则上不改，仅在发现真实重复入口时最小修正并记录原因。vendor仅在本task发现本任务引入的缺漏时更改，不扩范围。

**Interfaces / dependency:** Tasks3–11已各自清理本批；本task验证最终`patchV2Runtime(source)`只执行residualimports/calls，check-final默认要求全部退休项，不靠阶段参数逃避。

- [ ] AST列举实际imports/calls并对照spec全部31项+audio前置/旧Preferences/oldWorldMap/mapfailurehostAPI；使用 Task 2 的 module/imported/local/callOwner registry，并再次测试保留本地 `patchRuntimeUiLayout`、拒绝 `patchScopedUiLayout` 退休调用。保留tools/settings/teleport/links/appearance/catalog/view及网络诊断/packet/localization；清理只被退休hostfunction使用的私有helper，不清理无关代码。
- [ ] 检查 Task 3 已建立并在每批维护的 synthetic fixture builder 最终状态：actual音频/cache/Preferences/Common CSS/WorldMap/mapfailure owners，无手写upstream核心替身，无重复node。此处不是首次重建fixture；保留residual anchor、localizationassert、最终legacytransport、credentials/plugin/debug/plaintextsinks/TT/CSP审计及负例。
- [ ] 增加 `prepare never applies permanent transforms twice`、`final runtime has one core factory and keeps modular product transforms`、`retained transforms reject malformed source`；不以整个真实文件contains中文代替运行行为。
- [ ] 运行 `rtk proxy node scripts/check-runtime-consolidation.mjs --check-final`；运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/runtime-core-consolidation.test.ts test/v2-runtime-patch.test.ts test/lastro-network-diagnostics.test.ts test/lastro-item-packet-layouts.test.ts test/localization-lifecycle.test.ts`；prepare两次记录finalhash预期相同。
- [ ] 自审核/提交。PASS：退休调用为0、永久定义为1、剩余安全gate和productpatch仍运行、prepare稳定。FAIL：skip-if-already/吞anchor/no-op实现，剩余入口丢失或重复核心序列化。

**Anti-pattern guards:** 不为缩短patcher改source.startsWith/importguard，不清空manifestanchors，不只查一个字符串就判完整所有权。

### Task 13: 完成测试迁移与交叉兼容验证（h）

**Exact files:** `test/helpers/vendor-runtime.ts`、`test/runtime-core-consolidation.test.ts`、`test/v2-runtime-patch.test.ts`、上述Tasks列出的行为tests/必要boundedfixtures与provenance；`test/module-inventory.test.ts`、`test/v2-source-ownership.test.ts`、`test/v2-regression-runner.test.ts`、`test/import-v2-snapshot.test.ts`仅在源所有权预期确有变化时更新，不放宽导入校验。不新增重复行为suite。

**Interfaces / dependency:** Task12；固定行为由actualvendor/generated证明，旧源fixture仅证明历史regression；保留purefactory直接tests加embeddedparity。

- [ ] 对38模块的消费者清单逐项核销；用`rtk proxy rg -n`检索所有已删除旧module路径/exports，活跃scripts/src/test/config不得命中；历史docs旧名仅明确标注历史。特别核对frame/entity在移动测试、ui-state在cooldown、store-scroll在native-drag、WorldMap/API在teleport各suite。
- [ ] 检查每个迁移suite仍有原行为断言：loss/EOF、route/timing/death、ACT、cooldown、party、HP、vending、savefailure、drag/scale/storecount、resourcealias、诊断、WorldMap/portrait、localization late load；不能为通过删case或将fixed入口换bounded旧fixture。
- [ ] 确认缺/重复AST节点负例、residualanchor负例、helperparity故意改单token/模板值时失败；把临时runner负例证据归档，不让最终test依赖ignoredscratch。
- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm typecheck`、`rtk proxy .tools/node_modules/.bin/pnpm lint`、`rtk proxy .tools/node_modules/.bin/pnpm test`。另运行 `rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 test/item-obtain.test.ts test/character-resource-localization.test.ts test/lastro-card-collection.test.ts test/lastro-card-deck-ui.test.ts test/module-inventory.test.ts test/v2-source-ownership.test.ts test/v2-regression-runner.test.ts test/import-v2-snapshot.test.ts`仅当全量test未包含它们或全量日志有需要定位的失败；不无故重复绿测。
- [ ] 自审核/提交。PASS：全部必需checks绿、受限fixtures可溯源、no unresolvedimports，不减弱assertions。FAIL：依赖scratch、未解释case数减少、改allowlisthash令importtest“变绿”。

**Anti-pattern guards:** 不把TS tests塞到inventory的vendor `.test.mjs`列表，不假称静态文本assert证明用户实际IWA画面。

### Task 14: Build / IWA / manifest、来源记录与最终独立 review（i）

**Exact files:** 新增 `docs/superpowers/reports/2026-10-05-lastro-runtime-patch-consolidation.md`；更新 `docs/iwa/source-provenance.md` 中构建所有权说明（只改本次事实，不改历史日期/状态）；`config/lastro-module-inventory.json`、`config/v2-allowlist.json`、`config/core-asset-roots.json`按下述规则核对、默认不改。最终review覆盖所有本任务源码/测试/文档diff。

**Interfaces / dependency:** Task13；长期报告接收baseline/finalvendorhash、source provenance、38-file处置、允许差异、所有命令与review结果。最终reviewer `gpt-6.1-sol`/`high` 独立只读。

- [ ] 运行 `rtk proxy .tools/node_modules/.bin/pnpm build`、`rtk proxy .tools/node_modules/.bin/pnpm audit:iwa`、`rtk proxy node scripts/audit-localization.mjs --check-dist`、`rtk proxy node scripts/check-runtime-consolidation.mjs --check-final`、`rtk git diff --check`；不运行sign/update/deploy。
- [ ] 两次preparehash稳定证据与最终baseline/candidate stage `final`对照归档；清单中Onlinehash与实际bytes一致、所有可执行文件有正确package路径。新displaymodule/read-onlyaudit/preview/temporaryrunner均为host-only，不加runtimeFiles。
- [ ] 保持allowlist reviewedSha256的导入来源语义；inventory仍18个生产源入口/现有vendorregressions（未新增runtime文件则数量不变），必要时只更新Online capability描述/证据。新ownedvendorhash写报告，不覆盖reviewedsourcehash。
- [ ] 写长期报告：音频必要闭包、worldmapactionseam、helperdualmaintenance、source refresh复核规则、rollback配对文件、fixtureprovenance、完整模块处置与generated未提交的状态；记录性能/视觉实际未验证的边界，不宣称已登录实战。
- [ ] task自审核结束后生成全分支reviewpackage（baseline到全部本任务HEAD），dispatch指定FinalReview模型。要求检查spec范围、patch顺序/helper自包含、retiredcall、保留产品、安全/账号/manifest、测试入口和允许差异证据。worker不得自行派发reviewer。
- [ ] reviewer有实质findings时，派发**一个**LunaMax fixworker修复完整清单，跑受影响checks；6.1Sol scopedre-review验证修复diff/未关闭findings。不能把真实load-bearing错误以“review已完成”标记done；留存裁决和未验证项并向用户说明。
- [ ] finalreview通过后提交报告/必要文档修正；执行 `rtk git status --short`、`rtk proxy git ls-files generated dist release .codegraph`，预期本任务未新增tracked生成物；交付用户决定如何整合，不自动push/merge。

**Expected evidence:** build/audit均exit0、executables清单hash匹配、来源字段未误改、runtime deterministic、所有38文件有去向、finalreview报告无未关闭的影响正确性/安全的finding。任一条件未满足则任务未完成。

**Anti-pattern guards:** 不把`generated/runtime/Online.js`提交当回滚，不刷新snapshot覆盖permanentcode，不安装签名工具/创建密钥/公网发布。

## 顺序应用 MJS 的具体结论与回滚

用户提出的“单独执行某个MJS → 得到修复后的Online.js → 覆盖vendor → 下一个MJS”可作为迁移实现基础。当前多数文件只有export，`node scripts/lastro-*.mjs`不会自行读写Online.js；需要一次性runner调用指定 `patchRuntime*(source)`。采用**显式允许列表的串行reduce**，按依赖批次推进，避免递归扫描目录或import全部LastRO功能。

每批流程固定为：冻结本批inputhash → 内存顺序变换 → 输出候选 → 清理本批residualimports/calls并迁移测试 → 候选residualCLI/旧final对照 → 校验两个hash后原子写vendor → prepare/聚焦test → selfreview → 一个完整提交。audio不能跳过前置WebAudio；worldmap/resolver/diagnostic没有独立patchexport，需受控region拆分；它们不能靠“所有MJS跑一遍”解决。

若候选或residual对照失败，vendor不写入；若写入后behaviorchecks失败，在本task修复或仅恢复本task事先记录的文件变更再重新prepare，不能进行下一批。不使用`git reset --hard`/`git clean -fdx`。已提交批次回滚时配对vendor、patcher、MJS/声明、tests和fixtures，按逆序回滚依赖批次，保留用户其他修改。原始MJS可从Git历史恢复，scratch不是长期源码；无需数据migration。

## 计划自审和审查记录

自审对应：31个永久模块分别落在Tasks3–6/9–11；rename为Task7；六文件及orchestratorcoordinator合并为Task8；tools/account/teleport/appearance/catalog未扩范围；所有batch同时处理import/call/声明/测试，Task12只做最终gate；manifest/provenance/rollback见Task14及末节。Task9补充spec中未列明的`preview-ui-review.mjs`消费者；这是删除旧模块的必要消费方迁移，未增加运行时功能。

已完成 `gpt-6.1-sol` 独立只读审查及 scoped 复核：首轮 2 Important/2 Minor 均修正，最终 **Approved**。完整结论与修正记录见 [plan review report](../reports/2026-10-05-lastro-runtime-patch-consolidation-plan-review.md)。用户已授权实施；进度与验证结果记录在本计划专属 ledger，完成后汇总到 implementation report。
