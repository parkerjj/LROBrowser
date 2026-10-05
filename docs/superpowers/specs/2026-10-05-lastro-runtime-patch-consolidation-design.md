# LastRO 运行时补丁收敛设计

日期：2026-10-05。状态：待用户审核。本文件只定义迁移设计；当前阶段不修改运行时代码，也不创建 implementation plan。用户确认本 spec 后，才编写 plan、进行独立 subagent 只读 review，并再次交用户审核。

## 1. 目标与边界

把用户指定的客户端修复永久落入 `vendor/v2/Online.js`，让正常构建读取已经修复的客户端源。删除这些修复在 `scripts/patch-v2-runtime.mjs` 中的 import、调用和失去用途的变换实现。保留 LastRO 产品功能的模块化构建入口；将文字、翻译与显示相关的六个模块合为一个 MJS；准确重命名物品 packet layout 模块。

“永久合入”指保存**变换后的运行时代码**，不是把 source-transform 函数复制到浏览器。运行时 factory 的序列化结果属于运行时代码；AST、正则、Node.js 文件读取、测试 fixture 和 preview 入口不进入 Online.js。

本轮不改变协议行为、公开数据字段、资源 origin、账号保存方式或既有功能。`lastro-entity-appearance.mjs`、`lastro-equipment-view.mjs` 内的 catalog/view/appearance 修复没有获得全量合入授权，继续模块化。工具箱、账号、快捷设置、传送、地图链接、成就跳转、卡片、任务和掉落工具等也继续模块化。用户点名的 WorldMap UI 和肖像是明确的合入范围，不能以“属于新增功能”为由缩小为旧版 WorldMap。

不修改 `/run/media/parker/7A9F-F871/ROWeb`。不提交 `generated/`、`dist/`、`release/`、`.codegraph/`，不执行自动更新、生产签名、GitHub Actions、Surge 或公网部署。生产网络只允许 Direct TCP / `TCPSocket`；不新增其他 transport。远程资源仍只允许 `https://game.lastro.cn` 与 `https://rodata.ltsd.ro`，且只能作为被动资源。账号密码仍只经用户自己的 IndexedDB 流程持久化。

## 2. 审查依据与已验证事实

已读取全局、仓库规则、README、构建配置、相关源码、调用方、类型声明、测试、审计及来源文档；先使用本仓库 CodeGraph 定位调用链，再核对当前源码。memory 检索没有提供可替代当前实现的设计证据。本设计以当前代码为准。

审查基线：

| 项目 | 证据 |
| --- | --- |
| Git HEAD | `ffbb99f`，开始审查时工作区干净 |
| `vendor/v2/Online.js` | 324416 行、13209162 bytes |
| 当前 vendor SHA-256 | `9d8cbd73b52dc37b25d136d7c21ea59f157dc3dedffdd9d31bfc5d2e9f8f5b7b` |
| `reviewedSha256.Online.js` | `5525839d71144032bc6f836c40f3ea1bf58db3e672ac8f4becfdd84cdfbc9e3c`；这是导入源审核值，不等同于当前加工后的 vendor hash |
| 准备运行时 | `pnpm prepare:runtime` 成功，报告 `runtimeFiles: 505`；只生成被忽略的本地文件 |
| 聚焦基线 | 两组共 61 个测试文件、1944 个测试通过（56/1766 + 5/178）；覆盖核心补丁、UI、WorldMap、manifest/inventory、源导入契约及保留的 appearance/设置依赖 |
| 独立核心变换可应用性 | 在内存中对当前 vendor 及必要的 WebAudio 前置变换执行 28 个核心 patch 入口，全部成功；没有写入 vendor |

28 个入口的探测只证明当前 anchor 可以匹配，**不证明迁移后的构建已等价**。WorldMap 混合替换、地图失败处理和纯 helper 的迁移另行设计；实施时须重新冻结基线并完成后述等价验证。

当前链路：

```text
vendor/v2/Online.js
  -> prepare-runtime.mjs
     -> patch-v2-runtime.mjs：宿主适配 + 核心修复 + 文案 + 产品功能 + 安全检查
     -> generated/runtime/Online.js + runtime-patch-manifest.json
     -> patch-resource-worker.mjs / PathFindingWorker.js
     -> importCoreAssets()
     -> generated/core/ + executable-assets.json
  -> Vite build -> dist -> audit:iwa
```

`prepare-runtime.mjs` 清理的是 `generated/runtime`、`generated/core`、`generated/v2`、`generated/v2-manifest.json` 等指定入口，并非任意递归删除整个仓库。正常 prepare 不调用 `import-v2-snapshot.mjs`。生成文件只能作为对照，不作为长期编辑入口。

## 3. 目标架构与数据流

```text
vendor/v2/Online.js：永久核心修复、内嵌 runtime factory、核心 UI/资源行为
  -> patchV2Runtime：仍需的宿主适配、协议布局、显示本地化、独立 LastRO 产品功能
  -> 最终 anchor / localization / transport / CSP / DOM 安全检查
  -> generated/runtime/Online.js
  -> 原有 Worker、core assets、Vite 与 IWA manifest 流程
```

仍保留构建脚本，不尝试把剩余所有适配一次性写入 vendor。Direct TCP factory 替换、账号登录接入、Worker/Trusted Types、Lua/CSP 适配、legacy transport 清理和安全审计继续由现有链路负责。原始 vendor 中暂存的旧 transport 代码仍须在剩余构建步骤被清除；本次不得重新引入其运行路径。

永久核心只依赖 Online.js 已有 bundle 符号、显式注入的依赖和浏览器 API。避免新增浏览器模块文件。合并后的本地化 MJS 仍为 Node.js 构建工具，不能因文件合并把它的 `typescript`、`node:vm`、`parse5` 或构建数据读取送入 IWA 浏览器运行时。

迁移完成后的硬条件：

1. 当前 vendor 已含指定修复；构建不再执行对应核心 transform。
2. 产品功能仍有独立模块和修改入口；模块重命名/合并后 import 均可解析。
3. 旧构建最终产物与新链路的行为、字符串内容、注册顺序和生命周期一致。
4. 可执行资产仍由原有清单收集、哈希和审计；不会新增清单之外的 executable。

## 4. 完整文件迁移矩阵

以下路径均相对于仓库根目录。表中的“删除”包含对应 `.d.mts`（如存在），且必须在所有调用方和测试迁移完成后执行。“测试提取”指从实际 vendor source 提取相关函数/region 到测试 sandbox，不在测试目录维护第二份修复实现。

### 4.1 协议、引擎、输入和同步

| 当前模块（`scripts/`） | 永久进入 Online.js 的入口/结果 | 源文件与 helper 去向 | 理由与主要验证 |
| --- | --- | --- | --- |
| `lastro-network-receive-recovery.mjs` | `patchRuntimeNetworkFramingRecovery`、`patchRuntimeNetworkCloseDrain` | 删除；测试提取 NetworkManager 实际收包与 close 代码 | 丢弃坏 chunk 时保留 live socket receive state；接收 batch 完成后才处理 EOF。验证 network compatibility、character-switch 网络测试 |
| `lastro-frame-timing.mjs` | `patchRuntimeFrameTiming`，包括 `LastROServerClockNow`、`LastROResetServerTick`、`LastROInvalidateServerTick`、`LastROAdvanceServerTick` 和 Events/Renderer/MapEngine 修改 | 删除；测试提取 clocks/Events | 保留 reset/invalidate/advance、ping/pong 时间记录、callback 隔离和预算；验证 frame timing |
| `lastro-audio-timing.mjs` | `patchRuntimeAudioTiming`、`createLastroSoundTiming`、私有 timed WebAudio installer 的序列化结果；同时迁移第 5 节前置闭包 | 删除；测试提取真实 sound timing/音频运行时 | deadline、decode、BGM 恢复、限流、解锁、取消和 cleanup 必须完整；验证 audio timing/BGM recovery |
| `lastro-entity-sync.mjs` | `patchRuntimeEntitySync` 及路线辅助函数，包括序列化 `findLastroServerWalkPath` | 删除本模块；`lastro-server-walk.mjs` 保留为独立算法 helper，增加嵌入一致性验证 | 服务端路线/位置、死亡实体、路线接续；验证 entity sync/player corpse |
| `lastro-movement-input.mjs` | `patchRuntimeMovementInput`、`createLastroMovementInput`、`refreshLastroGroundInput`、私有点击判断 | 删除；测试提取实际 helper 与 MapControl/EntityControl | 保留 bundle 作用域依赖、地图切换输入重置及可选工具箱取消接口；验证 movement input |
| `lastro-movement-sync.mjs` | `patchRuntimeMovementSync` 及七个私有同步 helper | 删除；测试提取实际函数 | epoch、位置校正、受击计时、连接失活/重置；验证 movement sync |
| `lastro-equipment-animation.mjs` | `patchRuntimeEquipmentAnimation` 及 composite frame helper，序列化 `sampleLastroCostumeLoop` | 删除本模块；`lastro-costume-loop.mjs` 保留算法 helper 并校验嵌入一致性 | body/equipment 独立 frame count、共同 action/clock；验证 equipment animation |
| `lastro-equipment-cart.mjs` | `patchRuntimeEquipmentCart` | 删除；测试实际 vendor region | cart 按钮显示修复；验证 equipment cart |
| `lastro-weapon-view-fallback.mjs` | `patchRuntimeWeaponViewFallback` 与 DB/EntityView helper | 删除；测试实际 vendor helper | 保留通用 weapon fallback；不能把 equipment catalog/view/appearance 一并迁入；验证 weapon view fallback |
| `lastro-manual-skill.mjs` | `patchRuntimeManualSkill` | 删除；测试实际 skill handlers | 仅玩家手动目标/地面技能绕过对应 amotion 门槛，伴随实体语义保持；验证 manual skill |
| `lastro-skill-cooldown.mjs` | `patchRuntimeSkillCooldown` | 删除；测试 Shortcut 实际生命周期 | deadline、duration、重新 append 后恢复；必须与 ui-state 的 append wrapper 共存；验证 skill cooldown |
| `lastro-party-state.mjs` | `patchRuntimePartyState`、`createLastroPartyState` | 删除；factory 测试改取 vendor 定义，保留 party runtime 集成测试 | lazy init 避免循环初始化，保留 roster/reset/storeLife ownership/地图标记 |
| `lastro-monster-hover-hp.mjs` | `patchRuntimeMonsterHoverHp`、`createLastroMonsterHoverHp` | 删除；测试取内嵌 factory | factory 依赖均显式传入；保留 WeakMap/Symbol epoch、可信 max HP、2 秒回退，无新增轮询 |
| `lastro-vending-movement.mjs` | `patchRuntimeVendingMovement` 与私有 helper | 删除；测试实际 Network/MapControl/NpcStore 生命周期 | 购物状态移动 gate、mobile/joystick/navigation/reset，保持商人摆摊区别；验证 vending movement runtime |

### 4.2 用户指定的 UI、地图与资源模块

| 当前模块（`scripts/`） | 永久进入 Online.js 的入口/结果 | 源文件与 helper 去向 | 理由与主要验证 |
| --- | --- | --- | --- |
| `lastro-item-drag.mjs` | `patchRuntimeItemDrag`、`installLastroItemDrag` | 删除；测试提取 installer，迁移关联类型 | DOM/ShadowRoot native drag、光标与 cleanup；验证 item drag/native |
| `lastro-ui-layout.mjs` | 文件导出的 `patchRuntimeUiLayout`（构建中别名 `patchScopedUiLayout`）、`UI_LAYOUT_CSS` 的实际 CSS | 删除；测试取最终 scoped CSS；先迁移 `preview-ui-review.mjs`，直接读取已修复 CSS，保留原有 before/after 展示 | 不与 orchestrator 内另一个同名 UI layout 函数混淆；后者的产品布局继续保留 |
| `lastro-ui-input.mjs` | `patchRuntimeUiInput` 及 `lastroUiInputFrame`、logical pointer、drag bounds helper | 删除；测试提取函数/实际 resize handlers | 保留 GUI/各 resize 组件的逻辑坐标与缩放行为；验证 ui-scaled-input 等实际测试 |
| `lastro-ui-state.mjs` | `patchRuntimeUiState`、`lastroUiWindowAppend`、`lastroBindNestedWindowState`、storage filter helper、Preferences 最终实现 | 删除；测试提取 vendor；一起清理被覆盖的 Preferences build patch（第 5 节） | 窗口、嵌套窗口、快捷栏、存储筛选、持久化失败恢复；不迁移账号存储契约 |
| `lastro-store-scroll.mjs` | `patchRuntimeStoreScroll`、`installLastroStoreScroll` | 删除；测试提取 installer/类型；preview 继续读 generated | drag-edge RAF、drop/remove 释放、setType/setList reset 和转移后刷新；验证 store scroll |
| `lastro-storage-count.mjs` | `patchRuntimeStorageCount` | 删除；`storage-count.test.ts` 改取实际 storage region | clone item record 防止共享引用导致重复计数，保持 search/sort refresh；保留 withdraw/deposit/分类/搜索/排序用例 |
| `lastro-basic-info.mjs` | `patchRuntimeBasicInfoLayout` 的全部 HTML/CSS 结果 | 删除；测试最终 BasicInfo 各版本 | 版本 1/3/4/5 布局和已有文本均永久保留，不额外迁移其私有文本职责 |
| `lastro-dialog-typography.mjs` | `patchRuntimeDialogTypography` | 删除；测试实际 canvas helper | DPR 与逻辑尺寸度量一致；验证 dialog typography |
| `lastro-typography.mjs` | `patchRuntimeTypography` | 删除；测试实际 common CSS/font 初始化 | 字体、MiSans 原生加载处理、ChatBox 字重；验证 typography |
| `lastro-navigation-ui.mjs` | `patchRuntimeNavigationUi`、`getNavigationDockPosition`、`dockLastroNavigation` | 删除；测试提取两个 helper 及 Navigation region | docking、route showWindow、minimap click；不嵌入 teleport/tools 实现 |
| `lastro-npc-dialog-buttons.mjs` | `patchRuntimeNpcDialogButtons` 与私有 installer | 删除；测试实际 dialog 生命周期 | MutationObserver cleanup 和 terminal packet 状态，不能仅按 DOM 可见性判定 |
| `lastro-mail.mjs` | `patchRuntimeMail` 的模板、CSS、`escapeMailText` 等结果 | 删除；测试实际 Mail region | 邮件转义、标题校验、重量与位置重置；保留此补丁自有文案 |
| `lastro-shop-titles.mjs` | `patchRuntimeShopTitles`，`/showshop` command callback 和 Room 方法 | 删除；测试实际 command/Room | `this` 与 bundle 依赖必须保留；只切换对应 shop 类型 |
| `lastro-map-resource-name.mjs` | `resolveLastroMapResourceName` 的自包含定义 | **保留** MJS/声明作为资源与产品可复用 helper；构建中的 loader 改引用已内嵌符号 | 此文件没有 patchRuntime 导出。当前仅用于传送资源预检；不扩大为整个原生 map loader 的 alias 重构。大小写、扩展名、安全过滤与一次 alias 行为保持 |
| `lastro-map-load-diagnostic.mjs` | `describeLastroMapLoadFailure` 与 orchestrator 的 `patchMapLoadFailureRecovery` 核心失败分支 | **保留** MJS/声明作为诊断 helper；删除核心 build transform 的调用/导出 | 此文件没有 patchRuntime 导出。失败状态、断开、错误显示及限长脱敏诊断全部迁入；现有可选 LastROTools 取消调用只是接口，非工具箱实现 |
| `lastro-worldmap.mjs` | `createWorldMapIndex`、`WORLD_MAP_HTML/CSS`、`installLastroWorldMap` 的完整序列化结果与本地 layout；原 WorldMap region 的核心替换结果 | **保留** MJS/声明供 `preview-worldmap.mjs` 和可复用产品 UI；构建不再序列化这些核心内容；增加严格一致性测试 | 完整搜索、地图/掉落展示、缩放、弹窗、party markers 与 async 生命周期进入核心。导航/传送产品绑定保持构建模块化，见第 6 节 |
| `lastro-monster-portrait.mjs` | `createMonsterPortraitLoader`，由永久 WorldMap 初始化 | **保留** MJS 作为可复用肖像 helper，目前无 `.d.mts`；构建不再注入；校验嵌入一致性 | Client SPR/ACT canvas 肖像、并发/缓存/重试进入核心；保持独立 preview/测试可复用入口 |

除 WorldMap/portrait/资源 resolver/diagnostic 的明确保留项外，目前这些指定模块的独立 factory/installer 消费者主要是测试。`preview-ui-review.mjs` 还会对 generated 再调用 scoped layout patch：implementation plan 审查中核对了此调用方，迁移为直接读取已修复 CSS 并保留原有 marker 切分的 before/after 展示；其他相关 preview 从 generated 提取代码。不需要为测试保留已退休的 production patch 模块。若实施时新增消费者，先记录其实际 import、用途及验证，再决定保留纯 helper；不得静默删除。

### 4.3 重命名与合并

| 当前模块（`scripts/`） | 最终去向 | 删除/保留与测试 |
| --- | --- | --- |
| `lastro-network-security.mjs` | `lastro-item-packet-layouts.mjs`；保留 `patchRuntimeLastROItemLayouts` build transform | 原 MJS/声明删除；新增同名 `.d.mts`；测试、import、文档和活跃规则原子更新 |
| `lastro-localization.mjs` | `lastro-display-localization.mjs` | 原 MJS/声明删除；全部 map/job/text/fallback/tooltips 导出进入新模块 |
| `lastro-skill-localization.mjs` | 同上 | 原 MJS 删除（当前无声明）；两张 skill override 表进入新模块 |
| `lastro-ui-text.mjs` | 同上 | 原 MJS/声明删除；保留 AST/HTML 上下文限制与 data-key 排除 |
| `lastro-ui-messages.mjs` | 同上 | 原 MJS/声明删除；factory、override 表与 patch 导出进入新模块 |
| `lastro-item-name.mjs` | 同上 | 原 MJS/声明删除；附魔显示 helper/patch 保留导出 |
| `lastro-emoticons.mjs` | 同上 | 原 MJS/声明删除；输入/宏/ShadowRoot 修复仍在合并模块执行 |

### 4.4 保留模块化的产品与未授权范围

| 模块/范围 | 去向与理由 |
| --- | --- |
| `scripts/lastro-tools-panels.mjs`、`scripts/lastro-tools-style.mjs` | 保留；工具箱逻辑与样式，不迁入核心 |
| `src/runtime/lastro-account-login.mjs`、`src/accounts/account-storage.mjs` | 保留当前真正的账号入口及 IndexedDB 流程；当前仓库没有 `scripts/lastro-account-login.mjs`，不新建其替代副本 |
| `scripts/lastro-shortcut-entry.mjs`、`lastro-shortcut-settings.mjs`、`lastro-teleport-settings.mjs` | 保留功能入口/设置；仅调整适配已永久修复的 Preferences 的构建锚点与测试 |
| `scripts/lastro-teleport-*.mjs` 及 `lastro-worldmap-teleport.mjs` | 保留预检、传送请求、确认、取消、反馈、fade 等产品逻辑；WorldMap 的绑定变换单独保留 |
| `scripts/lastro-chat-map-links.mjs`、`lastro-npc-map-links.mjs`、`lastro-achievement-links.mjs` | 保留；资源 loader 改为引用 vendor resolver，诊断使用永久 helper |
| `scripts/lastro-entity-appearance.mjs`、`lastro-equipment-view.mjs` | 保留现有 entity appearance、equipment catalog/view/appearance transform；不借本次迁移扩大范围 |
| `scripts/lastro-card-*.mjs`、loot/drop 工具、quests、autoloot 等 | 保留，除用户明确指定的 WorldMap 当前完整 UI 外，不合入新增产品工具 |
| `scripts/lastro-network-diagnostics.mjs`、character-switch/handoff 等未点名网络适配 | 保持现有 build 行为；不借“协议修复”分类扩大永久迁移清单 |
| `vendor/v2/lastro-worldmap-details.mjs` 与其他 vendor 模块 | 保持原有独立文件和清单身份；不是 `scripts/lastro-worldmap.mjs` 的重命名目标 |

## 5. 核心依赖闭包与构建顺序

### 5.1 音频前置闭包必须一起迁移

`patchRuntimeAudioTiming` 不是可单独直接应用于原始 vendor 的 transform。它要求 `patch-v2-runtime.mjs` 中 `patchWebAudioPlayback` 已生成 `installLastROWebAudio` 与 `LastROWebAudio`。另外，timed installer 会调用现有 prefix 中的 `LastROAudioRegisterContext`。

因此永久迁入的最小闭包包含：

- `patchWebAudioPlayback` 对 BGM、SoundManager、MemoryManager/MemoryItem 的结果，包括 failed music discard。
- `installLastROAudioUnlock`、`LastROAudioPlay`、`LastROAudioUnlock`、`LastROAudioRegisterContext` 的 prefix 运行时代码和原有一次性安装时机。
- `patchRuntimeAudioTiming` 对前述结果的最终修改、`createLastroSoundTiming` 和 timed WebAudio factory。
- visibility/pagehide/context cleanup、autoplay unlock、pending BGM retry、decode 失败缓存淘汰、sound deadline 与取消 generation。

这属于用户指定 audio migration 的必要依赖，并不授权迁移整个 prefix。账号 import、Worker policy 等仍由构建负责。vendor 仍须以 `import ` 开头以满足现有入口校验；音频 helper 放在 import 后的受控区域，初始化副作用时机必须与旧生成产物一致。删除 build 中的音频 prefix 注入、`patchWebAudioPlayback`/`patchRuntimeAudioTiming` 调用及退休 host 实现，不能再次注册 listener/context。

### 5.2 时钟、实体与移动

一次性迁移的逻辑依赖顺序为 WebAudio 前置 → audio → frame timing → entity sync → hover HP → weapon fallback → equipment animation/cart → manual skill/cooldown → movement input → movement sync → receive recovery/close drain。其余 UI 迁移按现有构建相对顺序。

目前真实 build 在其中穿插 entity appearance、equipment catalog/view/appearance、item packet layouts、character switch/handoff 和 network diagnostics。永久核心不能依赖这些保留变换**必须先运行才能找到 anchor**。已完成的内存探测显示上述核心入口可在没有 appearance/catalog/view transform 的 vendor 上成功应用；仍需在实施时验证剩余变换能接受永久核心并生成相同最终代码。

尤其检查：

- `LastROServerClockNow`、`LastROResetServerTick`、`LastROInvalidateServerTick`、`LastROAdvanceServerTick` 所在作用域、uint32 tick wrap、地图/连接生命周期 reset。
- `findLastroServerWalkPath` 自包含，最大 32 步/2048 nodes；不丢失 authoritative route 接续与地图可走性。
- movement helper 在 bundle 内引用的 SessionStorage/MapEngine/Network 等，不应被提取到失去作用域的 ESM。
- equipment body/equipment 各自 frame count 与共同 action/clock，不把 retained appearance/catalog 数据冻结进 vendor。
- Shortcut append 同时包含 cooldown resume 与 ui-state wrapper，不互相覆盖。
- party lazy initialization/storeLife wrapper 的 ownership 和 hover HP epoch 不因新增 initializer 顺序而变化。

### 5.3 两个容易混淆的 UI/Preferences 入口

`scripts/lastro-ui-layout.mjs` 的 `patchRuntimeUiLayout` 在 orchestrator 中叫 `patchScopedUiLayout`；它应退休。orchestrator 自己的同名 `patchRuntimeUiLayout` 还处理产品布局/样式，应保留并给代码阅读者清晰注释，不按名字批量删除。

当前 `patchRuntimePreferencesSave` 先替换旧 Preferences.save，随后 `patchRuntimeUiState` 又替换 get/save，前者的结果在完整构建中被覆盖。永久 ui-state 会使前者旧 anchor 失效，因此必须同时删除该 build 调用、失去用途的导出和 `patch-v2-runtime.d.mts` 声明。保留的是**当前完整 generated 的最终 save 行为**：单独生成可序列化对象，不临时删改 `_key`/`save`，失败异常可观察且下一次 save 能重试。

迁移 `test/lastro-preferences-save.test.ts`、`test/lastro-shortcut-preference-runtime.test.ts` 到实际 vendor Preferences，保留 quota/circular/重试及快捷设置集成断言，不保留一个只为旧测试存在的 build transform。此清理不是账号 schema 迁移。

## 6. WorldMap、肖像、资源与产品绑定

### 6.1 永久的 WorldMap 核心

`lastro-worldmap.mjs` 本身是 factory/模板模块，没有 patchRuntime 导出。真正注入位置是 orchestrator 的 `patchRuntimeWorldMap`：它替换整个 `src/UI/Components/WorldMap/WorldMap.js` region，序列化世界地图、肖像和传送 factory。

永久 WorldMap region 保留 GUIComponent 创建/注册、模板、CSS、index、installer、本地 layout regions、Client/DB/item/currentMap/accountId 依赖，以及包内 `../core/data/world/world-data.json`、`mob-data.json` 的加载。完整保留地图/怪物/物品搜索、掉落列表、party markers、拖拽/resize/zoom、弹窗及异步过期结果处理。保持 exact monster id 规则，不能恢复基于 huntid 的误匹配。

`createMonsterPortraitLoader` 完整内嵌，保留 Client SPR/ACT idle frame、颜色/镜像/旋转、128px canvas、并发 4、timeout 15 秒、cache 128 及失败后重试。它不是实时游戏渲染循环，不给它增加新的 ticker。

### 6.2 产品动作仍由构建注入

WorldMap 的 navigate/teleport/cancelTeleport 当前依赖 `createLastroTeleportPreflight`、`createLastroWorldMapTeleport`、`normalizeLastROTeleportMap`、`buildPrivateAirshipRequest`、confirmation 设置、LastROTools/notice 等保留产品功能。不能把这些函数顺便复制进 vendor。

将 full-region `patchRuntimeWorldMap` 改为范围有限的 `patchRuntimeWorldMapProductActions`：

1. 永久 region 内，GUIComponent 创建后、installer 调用前，声明唯一 `const lastroWorldMapActions = {};`，并设唯一 `/* lastro-worldmap-product-actions */` 插入标记。
2. installer 显式 deps 中 spread 此 actions 对象。直接 vendor 的 factory 可以没有这些可选动作；最终构建必须注入与旧产物相同的三个 callback。
3. 剩余 transform 在 AST 确认 `init_WorldMap` 所有权、唯一声明/marker 和 installer 相对顺序后，在该点注入现有 preflight/teleport 实例、`WorldMap._lastroTeleport` 以及 `Object.assign(lastroWorldMapActions, { navigate, teleport, cancelTeleport })`。
4. 仅产品动作需要的 Network/PacketStructure/Thread/Configs/Navigation 初始化保留在该构建插入块；核心需要的依赖初始化保留于 vendor。初始调用顺序按旧链路复核，避免循环初始化。
5. 删除构建中 worldmap 模板/index/installer/portrait 的 imports 和序列化，保留 teleport factory/data imports。调用位置仍处于原 WorldMap 阶段，不新增通用插件框架或事件总线。

保持当前传送资源预检 65000ms 超时、Thread.GET_FILE、用户 profile 缓存隔离、同图处理、确认开关、PRIVATE_AIRSHIP_REQUEST 的原 map 目标值、取消 pending 和错误反馈。native map 目标与资源 alias 不可混用。

### 6.3 资源 resolver 与诊断

`resolveLastroMapResourceName` 永久声明一次。剩余 `teleportResourceLoaderCode()` 返回的 callback 改为调用该符号，不在每个 NPC/achievement/worldmap binding 再 `.toString()` 一份。保持只处理合法 `data/` 下的 gat/gnd/rsw 路径、alias 一次、case/extension、拒绝 traversal/control chars/colon 等当前规则；不额外重构原生 MapRenderer 资源解析。

`describeLastroMapLoadFailure` 永久声明一次。将现有 `patchMapLoadFailureRecovery` 的 `onMapComplete(success,error)` 失败分支完整写入 MapRenderer：清理 loading/currentMap/Mouse 状态、可选取消已有工具箱 route、Network.close、诊断和 error box。工具箱的实现仍独立；此处 `typeof LastROTools` guard 是现有可选集成点。

保留诊断中的字段、map/resource/detail/causes 的长度上限与 timeout/download/invalid/missing/parse 分类、`globalThis.LastROMapLoadFailure`、受 try/catch 保护的同名 localStorage 诊断记录。这里保存的是诊断元数据，不复制密码或改变账号 IndexedDB 流程。删除原核心 build transform；产品 bindings 仍引用永久 diagnostic。

### 6.4 保留 factory 的一致性

WorldMap、portrait、map resolver、diagnostic，以及依赖的 server-walk/costume-loop 保留 MJS 可复用接口，但**不是正常 build 的核心 source transform**。增加从 vendor 提取函数 AST token/模板值与 MJS 导出对照的测试；WorldMap 的 HTML/CSS/layout、嵌入 factory 也检查。忽略源码位置、空白与非语义注释，不忽略函数行为或字符串内容。

未来修改这些 helper 时必须同步调整 permanent vendor 及 reusable export，并由一致性测试检查；不通过 prepare 自动同步 vendor。这里有显式维护成本，但保留 preview/独立使用且避免 build 重复改写核心。没有实际独立消费者的其他 factory 则迁移测试后删除源 patch 文件。

`scripts/extract-worldmap-fixture.mjs` 目前识别命名 function expression 和 GUIComponent render/css；迁移尽量保持该形态。若 actions 拆分影响提取条件，应同步调整 extractor 的明确 AST 查找和 fixture 依赖，不放宽为任意全文正则或静默空结果。

`worldmap-teleport-runtime.test.ts`、`worldmap-confirmation-runtime.test.ts`、`teleport-route-lifecycle.test.ts` 目前直接调用或 AST 提取旧 `patchRuntimeWorldMap`。迁移后改为从永久 WorldMap region 应用 `patchRuntimeWorldMapProductActions` 或提取真实 generated 的绑定；同步更新 `patch-v2-runtime.d.mts` 与 `v2-runtime-patch.test.ts` 的旧 API/anchor 负例。`map-load-failure-recovery.test.ts` 不再调用退休的 `patchMapLoadFailureRecovery`，改取 vendor 分支。`npc-map-runtime.test.ts`、`lastro-achievement-links.test.ts` 的 sandbox 须显式绑定已永久的 resolver/diagnostic，不能继续依赖 loader 字符串偷偷包含 helper。

## 7. 物品 packet layout 命名与兼容

最终名称：`scripts/lastro-item-packet-layouts.mjs`，声明 `scripts/lastro-item-packet-layouts.d.mts`。实现只修改 PacketStructure 中六种物品相关结构，并基于 LastRO config、实际包长度及 PacketVerManager 选择旧/宽 item ID；名称 `network-security` 没有反映职责，`protocol-layout-compat` 则覆盖面过宽。

保留导出 `patchRuntimeLastROItemLayouts`。六个目标 constructor：

- `PACKET_ZC_ITEM_FALL_ENTRY2`
- `PACKET_ZC_PROPERTY_HOMUN2`
- `PACKET_ZC_ACK_ADD_ITEM_RODEX`
- `PACKET_ZC_ADD_ITEM_TO_STORE3`
- `PACKET_ZC_ADD_ITEM_TO_CART3`
- `PACKET_ZC_ITEM_PICKUP_ACK7`

仍在原 build 位置执行，不纳入本次永久核心清单。`lastroUsesWideItemIds` 语义及 PacketVerManager/config/length precedence 不变。保留已有 `anchor:network-security:*` 错误字符串作为旧诊断兼容值，本轮只改文件名和测试描述，不改错误码；不新增双重 marker 或另一个判别逻辑。

同步更新 `patch-v2-runtime.mjs`、两个测试 `lastro-network-security.test.ts` 和 `lastro-network-compatibility.test.ts` 的 import/描述（前者重命名为 `lastro-item-packet-layouts.test.ts`），新声明，以及活跃 docs/audit/grep 规则。保留历史设计记录中的旧名时明确“原名称”；禁止活跃 import 指向旧文件。当前没有外部公共 API 发布证据，不设 compatibility wrapper；不为旧名维持第二个变换路径。

## 8. 单一显示本地化模块

最终名称：`scripts/lastro-display-localization.mjs` 与 `.d.mts`。它覆盖地图/job/skill 名称和描述、UI 文案、message fallback、物品/附魔显示与 emoticon 输入显示。`ui-localization` 不能准确涵盖 DB skill/message/item 数据和地图标题；`display-localization` 更贴近实际职责。

模块按数据表、runtime factory、source-transform 私有辅助函数、公开 patch 接口组织内部区域，不引入配置驱动 patch 框架。原各文件的同名 `replaceOne`/`fail`/`patchRegion` 等私有函数按职责命名，保持各自校验，不统一成放宽 anchor 的“万能替换”。移除彼此旧文件的 imports，避免 self import/cycle。

保留/集中导出：

| 导出 | 来源与契约 |
| --- | --- |
| `patchRuntimeMapLocalization`、`patchRuntimeStatusTooltips`、`createLastroMapLocalization`、`setLastroStatusTooltip`、`assertRuntimeLocalizationMount` | 原 localization，语义不变 |
| `JOB_NAME_OVERRIDES`、`MESSAGE_FALLBACKS`、`RUNTIME_TEXT_REPLACEMENTS`、`MAP_NAME_OVERRIDES`、`MAP_TITLE_OVERRIDES` | 原 localization 数据表 |
| `SKILL_NAME_OVERRIDES`、`SKILL_DESCRIPTION_OVERRIDES` | 原 skill-localization；目前 descriptions 空表是现状，保留，不视为待填内容 |
| `patchRuntimeUiText` | 原 ui-text，保留 AST/parse5 上下文与 data key 限制 |
| `patchRuntimeUiMessages`、`createLastroUiMessages`、`UI_MESSAGE_OVERRIDES` | 原 ui-messages，保留 CSV row/id 和已知来源限定 |
| `patchRuntimeItemName`、`lastroItemEnchantName` | 原 item-name，保持实际附魔注册识别与 Late Lua resolution |
| `patchRuntimeEmoticons` | 原 emoticons，保留输入节点/宏/ShadowRoot 分支与非法 index guard |
| `patchRuntimeLocalization`、`patchRuntimeJobLocalization`、`patchRuntimeSkillLocalization` | 从 orchestrator 移入新模块；前者成为统一的早期 coordinator，后两者保持可测试公开导出 |

`patchRuntimeJobLocalization`/`patchRuntimeSkillLocalization` 的类型声明移至新 `.d.mts`，测试直接导入新模块。`patch-v2-runtime.d.mts` 清理退休导出；不保留 forwarding exports 来掩盖内部测试未迁移。

`lastro-job-name-aliases.json` 的 import 跟 coordinator 移动。`lastro-skill-data.mjs`、`lastro-skill-extra.mjs`、世界地图静态数据等继续作为输入数据；不把整个数据加载链强行塞进合并文件。序列化 factory 的 defaults 有模块级表依赖，例如 map tables/UI_MESSAGE_OVERRIDES，**运行时必须继续显式传入已序列化的数据**，不能只复制函数文本再省略实参。

保留处理规则：地图 title/alias 生命周期；job 展示查找而非改资源表；GBK Lua skill 覆盖顺序和 DB SkillName 优先级；CSV UTF-8/quoted/newline/blank id 与 legacy base64/tab fallback；附魔仅由实际 Lua 注册识别而非猜 ID 区间；emoticon packet 行为不变。

### 8.1 固定调用顺序与交错

在剩余 build 中保持当前相对顺序，不能因为合并文件就变成单次“全部本地化”：

```text
（typography/dialog 已在 vendor）
patchRuntimeLocalization
  -> patchRuntimeJobLocalization（适用分支）
  -> RUNTIME_TEXT_REPLACEMENTS / MESSAGE_FALLBACKS
  -> patchRuntimeSkillLocalization
patchRuntimeUiText
patchRuntimeUiMessages
patchRuntimeMapLocalization
patchRuntimeStatusTooltips
... hotkeys/card/product layout/lua/worldmap actions/tools/shortcut 等保留步骤 ...
... navigation/store/storage 已在 vendor，保留产品阶段相对次序 ...
patchRuntimeItemName
... 原 ui-state/ui-input 不再执行 ...
patchRuntimeEmoticons
... 原 item-drag/map-failure 不再执行；保留 teleport fade 与最终审计 ...
```

迁入 vendor 的 BasicInfo/Mail/WorldMap 等原本位于 localization 之后。新的早期 localization 会看见它们的已修复文本/结构；须以最终 HTML/CSS/message/技能表结果比较证明不重复翻译、不误改 resource key。必要时仅调整新模块的精确上下文/已知结果识别，不改变翻译内容或用普遍跳过错误的幂等机制。

独立 plan review 已确认一个具体顺序影响：永久 WorldMap 的 portrait 回调增加 `MonsterTable_default[id]` 资源存在性 guard，旧 job overlay 扫描全部 UI 时匹配会由 9 变为 10。必须按九个原展示 owner 精确本地化，并只排除 `createMonsterPortraitLoader` 第二实参中的该资源 guard；不把它译成展示字符串，也不把期望总数改为 10。implementation plan 列出九个 owner 和缺失/重复/未知 lookup 的负例。

更新消费方：`audit-localization.mjs`、`audit-ui-review.mjs`、localization/UI messages/UI text/item name/emoticons/status tooltips/lifecycle/behavior 测试和 orchestrator。旧六文件全部退休；新声明覆盖原有类型，无静默改名/删字段。

## 9. 安全修改 vendor 的迁移机制

采用一次性、显式允许列表的迁移工具生成候选文件，先 dry-run，验证后原子写入。它只服务实施，不进入 `prepare-runtime`，不是新的每次构建 patch 系统。具体脚本和任务由审核后的 plan 固定。

1. 冻结 Git commit、vendor hash、指定 patch 文件与原完整生成产物 hash；发现工作区或基线漂移立即停止，不能靠宽松 anchor 接着写。
2. 只执行矩阵内的核心 transforms、audio 必要闭包及明确定义的混合拆分。禁止把完整 `patchV2Runtime(source)` 的输出直接当新 vendor；那会烘焙产品、账号、transport 与宿主适配。
3. 对大文件使用 region 名称和 AST 节点（函数名、参数、constructor/赋值所有权、callee）定位唯一修改范围。一次性旧 transform 可用于候选生成，但每个输入 anchor、匹配数量、目标区域和输出结构都记录并校验。
4. 混合 WorldMap/MapRenderer 用唯一 region/函数范围编辑；插入 helper 用明确的 import 后区域或对应 bundle region。应用 edit 从后向前，保留不受影响的字节和行结束方式；禁止全文件格式化和无约束全局替换。
5. 解析候选 JS，校验永久 helper 定义数量、依赖/initializer 顺序、组件注册次数和指定修复结构；不在生成脚本中通过吞异常或 no-op 接受已经合入的 patch。
6. 将候选 vendor 经**已经清理的剩余 pipeline**生成新的 Online.js，与旧完整构建对照。修改 vendor 与移除对应 build import/call 在同一可回滚阶段完成，不留会双重执行的中间可交付状态。
7. 校验成功才写入源码；失败只保留本地候选与诊断，不覆盖 vendor。一次性工具/候选不得作为产物提交；若保留脚本作审计工具，必须只读默认且无 prepare 引用，并由 plan 明确说明必要性。

对照方法：未变区域字节比较；整体 AST token/结构比较忽略空白/位置/非语义注释；HTML/CSS/数据字符串必须按解码后的真实值比较。WorldMap actions 拆分、resolver 去重和 helper 所在位置改变会产生合法结构差异，只能列入逐项审查的差异允许列表，不能 blanket 忽略整个 WorldMap/MapRenderer region。所有允许差异还需行为测试证明初始化、调用、错误与取消顺序不变。

增加构建契约测试，验证退休核心 patch 的 import/call 不存在、prepare 未引用迁移工具、永久 helper 只定义一次、正常 prepare 两次输出 hash 稳定。MJS 保留的纯 reusable exports 不能被残余 build 重新 `.toString()` 注入核心。剩余 packet/localization/product transforms 仍严格校验 anchor，并保持对损坏源的负例测试。

## 10. 测试迁移与验收

### 10.1 测试源码入口

固定修复后的行为从 `vendor/v2/Online.js` 提取到测试 sandbox；最终组合行为从 `generated/runtime/Online.js` 提取。建议共用 `test/helpers/vendor-runtime.ts`：通过 TypeScript AST/region 唯一定位、绑定显式依赖；缺失、重复或作用域不符直接 throw。避免加载整个 bundle 和真实服务器/账号。

当前许多测试是 `native = vendor` 后再调用核心 patch，也有先断言 upstream bug、再断言 fixed 的案例。不能继续 patch 当前 vendor，也不能直接删除旧行为断言。需要 upstream 对照时只保存**有 provenance/hash 的受限旧 region/函数 fixture**（建议 `test/fixtures/runtime-consolidation/`），不复制 13MB 全文件。修复断言始终测试实际 vendor/generated，fixture 不包含修复实现或凭证。

纯 build transform 的 anchor/no-double-apply 负例：packet/localization/product 部分继续测试；退休 transform 的负例迁为只读迁移校验器/永久核心结构与 residual pipeline drift 检查。删除源文件以后不再维护“运行一次旧 patch 才能得到 fixed”的测试入口。

### 10.2 覆盖映射

| 行为组 | 现有测试与迁移重点 |
| --- | --- |
| 整条链路 | `v2-runtime-patch.test.ts`：重做 synthetic fixture 的永久核心契约，保留最终 transport/security/CSP/anchor 断言；真实 vendor 的 residual build 集成验证 |
| 收包/EOF/协议 | `lastro-network-compatibility.test.ts`、`character-switch-network-runtime.test.ts`、重命名后的 `lastro-item-packet-layouts.test.ts`：六种旧/宽 layout、LastRO 开关和版本/长度优先级、坏帧后有效帧、32/96 帧 close drain、late old socket；不新增 unsupported packet 语义 |
| 时钟/音频 | `lastro-frame-timing.test.ts`、`lastro-audio-timing.test.ts`、`lastro-bgm-recovery.test.ts`：Events 预算/异常、clock reset/wrap、500ms deadline、限流/decode late cancel、BGM retry/stop/same-map/volume、unlock/cleanup |
| 实体/移动 | `lastro-entity-sync.test.ts`、`lastro-player-corpse.test.ts`、`lastro-movement-input.test.ts`、`lastro-movement-sync.test.ts`：路线/墙/转向/wrap、玩家尸体与复活、输入 capture、校正/断线 epoch |
| 装备/技能 | `lastro-equipment-animation.test.ts`、`lastro-equipment-cart.test.ts`、`lastro-weapon-view-fallback.test.ts`、`lastro-manual-skill.test.ts`、`lastro-skill-cooldown.test.ts`；另跑未迁移的 `lastro-equipment-appearance.test.ts`、`lastro-entity-appearance.test.ts` 防剩余 patch 顺序回归 |
| party/HP/摆摊 | `lastro-party-state.test.ts`、`lastro-party-runtime.test.ts`、`lastro-monster-hover-hp.test.ts`、`vending-movement-runtime.test.ts`：lazy init、生命周期、stale/max HP、购物 gate 和取消 |
| 文案/显示 | `lastro-ui-text.test.ts`、`lastro-ui-messages.test.ts`、`localization-lifecycle.test.ts`、`localization-behavior.test.ts`、`lastro-status-tooltips.test.ts`、`lastro-item-name.test.ts`、`emoticons-runtime.test.ts`：import 合并后不改预期语义，保留 late load/alias/id/input 上下文 |
| drag/layout/state/input | `lastro-item-drag.test.ts`、`lastro-item-drag-native.test.ts`、`lastro-ui-layout.test.ts`、`ui-window-state.test.ts`、`ui-nested-window-state.test.ts`、`ui-scaled-input.test.ts`、`storage-filter-ui-state.test.ts`、`shortcut-window-state.test.ts`、`graphics-option-open-runtime.test.ts` |
| UI 生命周期/文字渲染 | `lastro-store-scroll.test.ts`、`storage-count.test.ts`、`lastro-basic-info.test.ts`、`lastro-dialog-typography.test.ts`、`lastro-typography.test.ts`、`lastro-navigation-ui.test.ts`、`npc-dialog-buttons-runtime.test.ts`、`lastro-mail.test.ts`、`showshop-runtime.test.ts`；保留预览 fixture extractor 验证 |
| Preferences | `lastro-preferences-save.test.ts`、`lastro-shortcut-preference-runtime.test.ts`：vendor 最终 save/失败重试，剩余 settings patch 可应用 |
| 资源/WorldMap | `lastro-map-resource-name.test.ts`、`map-load-diagnostic.test.ts`、`map-load-failure-recovery.test.ts`、`worldmap-browser.test.ts`、`worldmap-portrait.test.ts`、`worldmap-teleport-runtime.test.ts`、`worldmap-confirmation-runtime.test.ts`、`teleport-route-lifecycle.test.ts`：core/产品 seam、helper parity、alias/诊断、portrait retry、data load/取消/确认 |
| 保留模块的交叉依赖 | `npc-map-runtime.test.ts`、`lastro-achievement-links.test.ts`、`item-obtain.test.ts`、`character-resource-localization.test.ts`、`lastro-card-collection.test.ts`、`lastro-card-deck-ui.test.ts`、`lastro-server-walk.test.ts`、`lastro-costume-loop.test.ts`：永久 helper 的绑定、文案与 resource basename 区别、产品模块继续工作 |
| 源所有权/清单 | `module-inventory.test.ts`、`v2-source-ownership.test.ts`、`v2-regression-runner.test.ts`、`import-v2-snapshot.test.ts`：vendor 模块和 embedded capability 来源关系、已列 vendor regression suite、导入审核语义 |

不存在用户线索里的 `test/lastro-ui-state.test.ts` 等部分名称时，以本表中的真实行为测试为准，不凭名称新建重复测试。`storage-count.test.ts` 独立覆盖分类/搜索窗口中服务端 withdraw 只扣一次、deposit 刷新、partial/exhausted stack、排序与等待确认时不提前改 count；迁移其 fixed source 入口并保留这些断言。server-walk/costume-loop 的独立测试也继续运行，并新增对应 vendor 嵌入一致性验证。

### 10.3 验证命令与证据

实施分组时先跑本表对应的聚焦 suite；最终运行以下命令（本机 pnpm 入口为 `.tools/node_modules/.bin/pnpm`，按 RTK 规则执行）：

```sh
rtk proxy .tools/node_modules/.bin/pnpm prepare:runtime
rtk proxy .tools/node_modules/.bin/pnpm lint
rtk proxy .tools/node_modules/.bin/pnpm typecheck
rtk proxy .tools/node_modules/.bin/pnpm test
rtk proxy .tools/node_modules/.bin/pnpm build
rtk proxy .tools/node_modules/.bin/pnpm audit:iwa
rtk git diff --check
```

聚焦命令格式：`rtk proxy .tools/node_modules/.bin/pnpm exec vitest run --maxWorkers=2 <本组实际 test/*.test.ts 文件>`。不以 TS 测试替代 inventory 中原有 vendor `.test.mjs` regression runner。`pnpm test` 自带 prepare，build 也自带 prepare；两次输出一致性另记录 hash，不为验证提交生成物。

验收证据包括：候选/永久 vendor hash、旧/新 final runtime hash与允许差异报告、全部指定源路径处置清单、退休 import/call 查询结果、原/新 helper parity、最终命令结果、executable 清单和 audit 结果、生产源码 diff 检查。测试通过不能代替最终 IWA manifest/audit。

## 11. 清单、来源与构建安全

`config/lastro-module-inventory.json` 当前记录 vendor source modules、embedded capabilities 和 vendor `.test.mjs` regression tests，不是 `scripts/lastro-*.mjs` 清单。保持其身份语义；仅当真实 embedded capability 描述/证据路径因本次所有权变化而失效时更新对应记录。不把 build MJS 或 `test/*.test.ts` 添加到 vendor regressionTests 来凑覆盖。

`config/v2-allowlist.json` 记录 vendor 模块和导入源审核哈希。迁移 Online.js 不新增 allowlist 模块，也不把 `reviewedSha256.Online.js` 改为迁移后 hash：`import-v2-snapshot.mjs` 校验的是显式 `--source` 的导入 bytes，然后再 sanitize。已有 reviewed hash 与当前 vendor 不同不能解释为新迁移的校验失败。迁移后的 owned runtime hash、region 和退休 patch 来源另记录在迁移证据文档中。

`config/core-asset-roots.json` 的 runtimeFiles 当前含账号登录、trusted DOM、account storage 等真实浏览器模块。本设计没有新增 runtime import，因此不把 localization/preview/test helper 塞入此配置。永久代码由 Online.js 的 executable asset hash覆盖，Worker/WASM/Lua/LUB 继续走既有 IWA 包内清单。若实施发现必须新增浏览器文件，先在 plan 中明确 config、manifest、打包路径和 audit 验证，不允许临时远程加载。

普通 build 不重新导入上游 snapshot。今后刷新 vendor 必须按迁移证据确认 owned regions/修复，不能用上游文件覆盖后直接接受“patch 少了所以修复消失”。保留基线来源 hash、Git 中的旧 transforms 与受限行为 fixture 以便重新审核；本轮不改写整套 snapshot importer 或签名系统。

## 12. 错误处理、风险与回滚

| 风险 | 控制与失败表现 |
| --- | --- |
| 剩余 patch 依赖旧源或已被核心覆盖 | 每批迁移即时跑 residual build；anchor 缺失/重复 fail-fast，修正精确 anchor 和测试，不用全局 try/catch/no-op |
| source transform 顺序从 build 变为 vendor 后变义 | 比较最终 AST/真实字符串及 init/registration 顺序；专测 retained appearance/catalog、localization、新 WorldMap actions 与 settings |
| `.toString()` helper 缺闭包/重复初始化 | 审核自由变量、显式参数、bundle owner；单定义/单安装测试；audio listeners 和 party init 保留原时机 |
| 世界地图完整 UI 或传送能力丢失 | 迁入完整 display factory；产品 actions seam 保留三 callback、确认/预检/取消/反馈；vendor core 与 final generated 分别测试 |
| reusable MJS 与永久代码漂移 | AST token/模板值 parity；未来同步修改两处，不由 build 自动修补 vendor |
| 测试仍只验证旧 patch 的副本 | fixed path 改取 actual vendor/generated；旧源仅 bounded regression fixture，有 provenance |
| upstream refresh 覆盖修复/误改审核 hash | 来源审核与 owned runtime hash分开；迁移证据和源所有权测试；刷新要重新审查 owned regions |
| packet rename 破坏诊断匹配 | 保留 `anchor:network-security:*` 值、导出名和六包行为；更新所有活跃路径 |
| manifests/IWA/账号安全回归 | 保留 runtime module清单入口与安全审计；不加 transport/origin/凭证；build + audit:iwa 为完成门槛 |

没有发现必须暂停用户指定合入范围的严重技术阻塞；目前风险可通过依赖闭包、精确拆分与测试处理。若实施出现协议行为变化、不能保持 IWA policy、账号风险或无法给出等价证据，应停止受影响阶段并报告具体 failing source/test，而不是静默改变迁移范围。

回滚以可独立验证的 Git 阶段为单位：同一阶段回滚 vendor 编辑、退休 import/call、源文件/声明与测试迁移，不能只还原 vendor 或只恢复旧 patch。未提交时只撤回本任务修改，不覆盖用户新增改动。生成文件清理后按旧源码重新 prepare/build；不靠提交 generated 快照回滚，不触及外部基线目录。无需数据库 migration；账号/Preferences 持久化格式与字段不变。

## 13. 本阶段交付与后续审核门槛

本阶段只新增本 spec，进行只读源码审查与本地基线测试；不修改 `vendor/v2/Online.js`、`scripts/patch-v2-runtime.mjs` 或其他生产模块。

自审检查：用户指定 31 个永久模块、1 个重命名模块、6 个合并模块以及保留产品范围均有矩阵条目；helper/preview 边界、audio 依赖、Preferences 覆盖、WorldMap 混合注入和真实测试名称均有处理；没有将 appearance/catalog、账号或传送实现扩入核心；没有待定占位步骤。

用户确认本 spec 后，implementation plan 将按基线冻结、迁移机制、核心批次、packet 重命名、localization 合并、UI/资源合入、orchestrator 清理、测试、build/audit/manifest 分阶段给出 exact files/functions/dependencies/commands/pass-fail evidence/guards。plan 完成后必须交独立 subagent 只读 review，修正发现的问题，再同时交付 spec、plan、review 结论和修正记录。用户审核计划通过后，下一阶段才执行代码迁移。
