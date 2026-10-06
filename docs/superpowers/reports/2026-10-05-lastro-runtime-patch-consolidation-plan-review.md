# Runtime Patch Consolidation — Implementation Plan 独立审查

日期：2026-10-05。审查结论：**Approved**。这是实施计划的可执行性审查，不代表迁移代码已经实现或验证，也不代替用户审核 implementation plan。

## 审查对象与方式

- Spec：[2026-10-05-lastro-runtime-patch-consolidation-design.md](../specs/2026-10-05-lastro-runtime-patch-consolidation-design.md)，用户已确认。
- Plan：[2026-10-05-lastro-runtime-patch-consolidation.md](../plans/2026-10-05-lastro-runtime-patch-consolidation.md)，含 14 个串行 task，尚待用户实施审核。
- 独立 reviewer：`/root/plan_review`，`gpt-6.1-sol` / `high`，干净上下文 `fork_turns: "none"`。
- reviewer 只读规则、spec、plan、源码、调用方和测试；进行一次不写文件的内存组合探测。没有修改文件、执行实施 task、重跑 tests/build/prepare 或派发其他 agent。
- 主线程修正文档后，将相同 plan 交给 reviewer 做 scoped 只读复核。

用户最终指定的开发模型分工：每个 task 的 implementer 与 task 自审核均为 `gpt-6-luna` / `max`；最终独立 code review 为 `gpt-6.1-sol` / `high`。用户已取消 6 Terra，不派发额外逐 task reviewer。模型安排不改变当前“只有文档与审查”的阶段限制。

## 首轮 findings 与修正

首轮结论 **Needs revisions**：0 Critical、2 Important、2 Minor。

| Finding | 源码证据与影响 | 文档修正 | 复核 |
| --- | --- | --- | --- |
| Important：WorldMap 提前永久合入使 job localization anchor 失败 | 旧 `patchRuntimeJobLocalization` 扫描全 UI 的 `MonsterTable_default[...]` 且要求 9 次；新 portrait 回调增加一个资源存在性 guard。内存探测由 9 变为 10，再执行 job overlay 抛 `anchor:job-display-lookups` | Tasks 8/11 列出九个准确展示 owner；仅按 portrait factory 调用第二实参的准确 AST 形态排除资源 guard，保持 `MonsterTable_default[id] ? DB.getBodyPath(id, 0) : null`；缺/重复/未知 lookup 必须失败。spec 补充该顺序影响 | ADDRESSED |
| Important：退休审计只用函数名，不能区分同名 layout 所有权 | 旧模块 imported 名为 `patchRuntimeUiLayout`、local alias 为 `patchScopedUiLayout`；orchestrator 同名本地产品函数及其调用必须保留 | Task 2 共用接口改为 module/imported/local/callOwner registry，另列 retiredHostExports；Tasks 9/12 共用。加入保留同名本地产品函数、拒绝退休 alias import/call及漏删调用的正/负例 | ADDRESSED |
| Minor：synthetic fixture 的更新时点和构造含糊 | 完整 v2 synthetic 测试手写 upstream BGM/SoundManager/空 WorldMap，移除 transforms 后不能等 Task 12 才重建 | Task 3 创建 `buildRuntimePatchFixture(vendorSource)`，固定 actual audio/cache/Preferences/Common CSS/RainWeather/WorldMap/map completion owners 和音频初始化片段。每批读取当前 vendor；Task 12 仅检查最终状态 | ADDRESSED |
| Minor：preview marker 缺失检查过宽 | preview 包含 InventoryV3/ChatBoxSettings/GraphicsOption，这些不在 scoped CSS 目标中，合法地没有 marker | Task 9 限定五个受影响 path 的唯一 marker；三类其他 path 允许无 marker并保持同 CSS 的 before/after。spec 补充 preview 实际消费者 | ADDRESSED |

## 独立复核结论

reviewer 确认四项 findings 均为 **ADDRESSED**，修订范围内没有新的实质问题，最终判定 **Approved**。

其余检查结论：

- 31 个永久模块、1 个 packet rename、6 个 localization merge 均有去向；四个 reusable helper 的保留边界正确。
- `lastro-item-packet-layouts`、`lastro-display-localization` 名称与原 packet 诊断字符串的兼容安排准确。
- audio 前置闭包、Preferences 配对清理、WorldMap 三 callback seam、preview 消费方、manifest/inventory/provenance 和回滚范围已覆盖。
- 计划没有要求提交生成物、读取外部基线、引入违规 transport/origin 或更改账号存储。

用户提出的逐个 MJS 合并思路已纳入候选迁移机制：现有 MJS 多数只导出 transform，不会由 `node <file>` 自行修改 Online.js；一次性 runner 按明确允许列表调用导出并串行处理。在候选 residual pipeline、源对照和 hash 校验通过后写回 vendor。音频依赖闭包与混合 WorldMap/纯 resource helper 单独处理，不递归执行全部 LastRO 脚本。

## 当前阶段的变更与验证边界

当前只新增 plan、本报告，并对 spec 做两处调用方/顺序事实补充。未修改 `vendor/v2/Online.js`、`scripts/patch-v2-runtime.mjs` 或其他生产/测试/config 源码。vendor SHA-256 仍为 `9d8cbd73b52dc37b25d136d7c21ea59f157dc3dedffdd9d31bfc5d2e9f8f5b7b`。

主线程检查了全部 38 个点名模块覆盖、14 个 task 的 files/interfaces/dependencies/guards、现有 test 路径、无 TODO/TBD 占位及新增文档 whitespace。上阶段已记录 61 个测试文件、1944 个测试通过；本阶段没有生产代码变化，因此没有重新运行这些测试。后续代码迁移仍须执行 plan 中的聚焦测试、lint/typecheck/test/build/audit 全部门槛。

下一步是用户审核 plan。审核通过并授权实施后，才按既定模型与串行 task 开始迁移。
