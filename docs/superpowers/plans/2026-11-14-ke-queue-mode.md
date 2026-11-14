# KE 队列模式开关（keQueueMode）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 让 KoreEngine 在没有 SharedArrayBuffer 的环境（Android WebView、macOS WKWebView）里照常运行，同时保留共享队列代码，并用开关 `keQueueMode`（`auto` / `shared` / `plain`）控制使用哪种队列。

**做法：** KE 的 Worker 把队列创建推迟到收到 `residentInit` 之后，按 `queueMode` 选择 `SharedRingQueue` 或普通的 `RingQueue`（两者接口一致，`BridgeQueues` 已有 `shared:false` 路径）；RoBrowser 去掉“无 SAB 即不可用”的拦截，改为按开关和 KE 包的能力判断，并把开关值经 `residentInit` 传给 Worker。唤醒方式不变：`postMessage` 立即唤醒，唯一的定时器是按 Rust 给出的下一个到期时间设置的一次性 `setTimeout`。

**技术栈：** KE 仓库（Node 24 `node:test`、ES 模块）；RoBrowser（Vitest、TypeScript、`.mjs` 模块）。

**设计文档：** `docs/superpowers/specs/2026-11-12-tauri-native-packaging-design.md`（重点 §5.6.1 与 §13）

## 全局约束

- KE 仓库位置：`/home/parker/Development/RO/KoreEngine`（私有）。用户的工作区里有未提交的改动，**不得在该工作区里操作**。在 KE 仓库用 `git worktree add /home/parker/Development/RO/KoreEngine-queue-mode -b feat/ke-queue-mode Development` 建一个独立工作树，所有 KE 改动都在那里提交。不推送、不发布 KE 版本（用户另行决定）。
- 不得读取或使用 `.ke-secrets.local` 里的真实密钥；需要构建时用随机生成的一次性 base64 密钥：`KE_CORE_KEY=$(openssl rand -base64 32) KE_NETWORK_KEY=$(openssl rand -base64 32)`。
- 事件驱动是硬要求：Worker 里不得出现 `setInterval` 或任何固定间隔的 KE 轮询。
- `SharedRingQueue` 及 SAB 相关代码一律保留，不删除。
- `keQueueMode` 取值只有 `auto`、`shared`、`plain`。默认值：IWA 与 web 为 `auto`（行为与现在完全一致），原生版（`native` 构建目标）为 `plain`。
- 向后兼容：KE 包的 `schedulerCapabilities` 新增 `plainQueues`；RoBrowser 遇到不带该能力的旧包且当前环境没有 SAB 时，仍然显示“不可用”。
- 测试里不要提交任何密钥或个人路径。

## 重点检查项（计划里没有专门任务覆盖的失败场景）

1. 输出超过 64KB：SAB 队列会丢弃并报 `queue-record-too-large`，普通队列照常送达。两种模式的行为差异要有测试明确固定（Task 2）。
2. `queueMode: 'shared'` 但环境没有 SAB：必须明确失败并报 `shared-array-buffer-unavailable`，不能静默退回普通队列（Task 1、2）。
3. `queueMode` 传了未知字符串：必须拒绝，不能当成默认值（Task 1）。
4. Worker 重建（崩溃后重启）：重建后队列模式必须与首次相同，不能回到默认值（Task 2）。
5. 旧 KE 包（没有 `plainQueues` 能力）遇到 `keQueueMode: 'plain'`：必须明确提示“不支持”，不能让旧 Worker 收到一个它不认识的字段后悄悄忽略并仍然使用 SAB（Task 4）。

---

### Task 1：`resolveQueueMode`（KE 仓库）

**Files:**
- Modify: `runtime/shared-queue.mjs`（`sharedStorageAvailable` 及导出）
- Test: `tests/shared-queue.test.mjs`

**Interfaces:**
- Produces: `export function resolveQueueMode(requested: 'auto' | 'shared' | 'plain' = 'auto', env: { SharedArrayBuffer?: unknown; Atomics?: unknown } = globalThis): 'shared' | 'plain'`
  - `plain` → `'plain'`；`auto` → 有 SAB 和 Atomics 则 `'shared'`，否则 `'plain'`；`shared` → 有则 `'shared'`，没有则抛 `SharedArrayBufferUnavailableError`（`code === 'shared-array-buffer-unavailable'`）；其他值抛 `RangeError('invalid-queue-mode')`。
- Consumes: 现有 `SharedArrayBufferUnavailableError`。
- 内部 `sharedStorageAvailable` 增加参数 `env = globalThis`，原有调用方不变。

- [ ] **Step 1：** 建 KE 独立工作树（见全局约束），后续命令都在 `/home/parker/Development/RO/KoreEngine-queue-mode` 里执行。先运行基线：`node --test tests/shared-queue.test.mjs tests/worker-scheduler.test.mjs tests/kore-worker.test.mjs`。预期：全部通过（约 31 项，5 项跳过）。
- [ ] **Step 2：** 在 `tests/shared-queue.test.mjs` 写失败的测试，名称与断言如下：
  - `resolveQueueMode auto picks shared when SharedArrayBuffer and Atomics exist`：`resolveQueueMode('auto', { SharedArrayBuffer, Atomics }) === 'shared'`
  - `resolveQueueMode auto falls back to plain without SharedArrayBuffer`：`resolveQueueMode('auto', {}) === 'plain'`
  - `resolveQueueMode plain ignores an available SharedArrayBuffer`：`resolveQueueMode('plain', { SharedArrayBuffer, Atomics }) === 'plain'`
  - `resolveQueueMode shared without SharedArrayBuffer throws shared-array-buffer-unavailable`：`assert.throws(() => resolveQueueMode('shared', {}), { code: 'shared-array-buffer-unavailable' })`
  - `resolveQueueMode rejects unknown modes`：`assert.throws(() => resolveQueueMode('fast', globalThis), RangeError)`；`resolveQueueMode(undefined, {})` 等价于 `auto`。
- [ ] **Step 3：** 运行 `node --test tests/shared-queue.test.mjs`。预期：新增 5 项失败，错误为 `resolveQueueMode is not a function`/未导出。
- [ ] **Step 4：** 在 `runtime/shared-queue.mjs` 实现并导出 `resolveQueueMode`，规则见 Interfaces。
- [ ] **Step 5：** 再次运行同一命令。预期：全部通过。
- [ ] **Step 6：** 提交（`feat(queue): resolveQueueMode`，带 `Co-Authored-By` 署名行）。

### Task 2：Worker 按 `queueMode` 选择队列（KE 仓库）

**Files:**
- Modify: `runtime/kore-worker.mjs`（`ensureResidentQueues` 约 610 行；`residentInit` 处理约 729 行；`ready` 消息约 270 行；释放逻辑约 466 行）
- Modify: `tests/worker-scheduler.test.mjs`（`startWorker` 增加参数，新增测试）
- Create: `scripts/bench-queue-latency.mjs`（把本次实测用的延迟基准留下，复用 `worker-scheduler.test.mjs` 的夹具写法）

**Interfaces:**
- Consumes: Task 1 的 `resolveQueueMode`。
- Produces: `residentInit` 消息新增可选字段 `queueMode: 'auto'|'shared'|'plain'`（缺省 `'auto'`）；`ready.capabilities` 新增 `queueMode: 'shared'|'plain'`，现有的 `sharedArrayBuffer: boolean` 保持不变（值与 `queueMode === 'shared'` 一致）。非法 `queueMode` 或 `shared` 但无 SAB 时，Worker 按现有错误路径向主线程报告 `fault`，消息文本含对应错误码。
- 测试夹具：`startWorker(runtimeSessionId, { queueMode, hideSab } = {})`。`queueMode` 默认取环境变量 `KE_TEST_QUEUE_MODE`（缺省 `auto`），写进 `residentInit`；`hideSab` 为真时，harness 在导入 Worker 之前执行 `delete globalThis.SharedArrayBuffer`。

- [ ] **Step 1：** 改 `startWorker` 如上。写失败的测试：
  - `queueMode plain: ready reports plain and events still wake the Runtime`：`queueMode:'plain'`，`ready.capabilities.queueMode === 'plain'` 且 `sharedArrayBuffer === false`，发一条 `command` 记录后收到 `stubEvent`。
  - `queueMode auto without SharedArrayBuffer falls back to plain`：`hideSab:true`、`queueMode:'auto'` → `queueMode === 'plain'`。
  - `queueMode shared without SharedArrayBuffer is a fault, not a silent fallback`：`hideSab:true`、`queueMode:'shared'` → 收到 `fault`，消息含 `shared-array-buffer-unavailable`。
  - `invalid queueMode is rejected`：`queueMode:'fast'` → 收到 `fault`，消息含 `invalid-queue-mode`。
  - `the queue mode survives a Worker rebuild`：用 `queueMode:'plain'` 启动，触发现有的重建路径（参照该文件里已有的 `dispose` 后重新 `residentInit` 用例），重建后 `ready.capabilities.queueMode` 仍为 `'plain'`（重建时由主线程重新传入同一个值）。
  - 把现有的 `a record that throws a plain error is acknowledged and does not block the queue` 拆为按模式断言：`shared` 模式保持原断言（丢弃并报 `queue-record-too-large`）；`plain` 模式断言**不会**出现 `output-dispatch-failed`，且 `world` 命令的状态输出在 `drainOutputs` 里能取到。
- [ ] **Step 2：** 运行 `node --test tests/worker-scheduler.test.mjs`。预期：新增测试失败（缺少 `queueMode` 支持）。
- [ ] **Step 3：** 实现：在模块级增加 `let residentQueueMode = 'auto'`；`residentInit` 处理里读取并校验 `initMessage.queueMode ?? 'auto'`（先调用 `resolveQueueMode` 以尽早抛错），存入变量；`ensureResidentQueues()` 改为 `new BridgeQueues({ ingressCapacity: 512, actionCapacity: 256, statusCapacity: 256, shared: resolveQueueMode(residentQueueMode) === 'shared' })`；`ready.capabilities` 增加 `queueMode`；释放逻辑里把 `residentQueueMode` 重置为 `'auto'`。注意 `residentQueueModule` 的动态导入保持不变。
- [ ] **Step 4：** 运行 Task 1 Step 1 的完整基线命令，分别在默认和 `KE_TEST_QUEUE_MODE=plain` 下各跑一遍。预期：默认模式全部通过；plain 模式除已按模式拆分的那条外全部通过（之前实测 25/26，拆分后应为全部通过）。
- [ ] **Step 5：** 实现 `scripts/bench-queue-latency.mjs`：参数 `--mode shared|plain --n 3000`，用与测试相同的夹具，输出一行 JSON：`{ mode, n, wakeUs:{p50,p95,p99}, ackUs:{p50,p95,p99} }`，其中 wake 是“主线程发出 → Runtime 收到事件”，ack 是“发出 → `eventAccepted`”。运行 `node scripts/bench-queue-latency.mjs --mode shared` 与 `--mode plain` 各 3 次。预期：plain 的 p50 不高于 shared 的 1.5 倍（2026-11-14 实测 plain 反而更快）；若超出，记录数值并停下来报告，不要继续。
- [ ] **Step 6：** 在 Worker 源码里确认没有 `setInterval`：`grep -n setInterval runtime/kore-worker.mjs`。预期：无输出。
- [ ] **Step 7：** 提交（`feat(worker): queueMode shared|plain|auto`）。

### Task 3：构建声明 `plainQueues` 能力（KE 仓库）

**Files:**
- Modify: `scripts/build-local.mjs`（约第 12 行的 `schedulerCapabilities`）
- Test: `test/build-local.test.mjs`

**Interfaces:**
- Produces: 新构建的包 `manifest.schedulerCapabilities` 为 `['fourQueues', 'oneShotDeadline', 'residentExecutor', 'plainQueues']`（保持该顺序，新增项放最后）。

- [ ] **Step 1：** 在 `test/build-local.test.mjs` 找到断言 `schedulerCapabilities` 的位置（如果没有就新增一条），改为期望上面的四项数组。运行 `node --test test/build-local.test.mjs`。预期：失败，实际值缺 `plainQueues`。
- [ ] **Step 2：** 修改 `scripts/build-local.mjs` 中的常量。
- [ ] **Step 3：** 再次运行同一命令，预期通过；再用一次性密钥构建 debug 包验证：`KE_CORE_KEY=$(openssl rand -base64 32) KE_NETWORK_KEY=$(openssl rand -base64 32) CARGO_TARGET_DIR=<scratch>/target node scripts/build-local.mjs --mode debug --out <scratch>/pkg`，检查 `<scratch>/pkg/manifest.json` 含 `plainQueues`。预期：包含。
- [ ] **Step 4：** 提交（`feat(build): advertise plainQueues capability`）。

### Task 4：RoBrowser 去掉“无 SAB 即不可用”拦截（RoBrowser 仓库）

**Files:**
- Modify: `src/kore/kore-integration.mjs`（`createKoreIntegration` 约第 160 行；拦截逻辑约第 1159 行；`residentInit` 约第 1164 行；`ready` 处理约第 982 行）、`src/kore/kore-integration.d.mts`
- Test: `test/kore-integration.test.ts`

**Interfaces:**
- Produces: `createKoreIntegration` 新增选项 `queueMode?: 'auto' | 'shared' | 'plain'`（缺省 `'auto'`）；`KoreIntegration.state` 新增 `queueMode: 'shared' | 'plain' | null`（`ready` 前为 `null`，之后取 `capabilities.queueMode`，旧 KE 没有该字段时按 `'shared'` 处理）。
- 拦截规则（取代原来的单条判断），设 `hasSab` 为原表达式的结果、`plainCapable = packageInfo.manifest.schedulerCapabilities?.includes('plainQueues') === true`：
  - `shared` 且 `!hasSab` → 不可用，`degradedReason = 'shared-array-buffer-unavailable'`
  - `plain` 且 `!plainCapable` → 不可用，`degradedReason = 'plain-queues-unsupported'`
  - `auto` 且 `!hasSab` 且 `!plainCapable` → 不可用，`degradedReason = 'shared-array-buffer-unavailable'`（与旧行为一致）
  - 其他情况继续启动，并在 `residentInit` 消息中带上 `queueMode`。
- 注意：`ready` 的兼容性检查里 `typeof capabilities.sharedArrayBuffer === 'boolean'` 保持不变。

- [ ] **Step 1：** 阅读 `test/kore-integration.test.ts` 里现有的创建宿主用例（用 `packageFixture` 与假 Worker），在同一风格下写失败的测试：
  - `queueMode is forwarded to the Worker in residentInit`：`queueMode:'plain'`，断言假 Worker 收到的 `residentInit` 消息 `queueMode === 'plain'`。
  - `without SharedArrayBuffer a plainQueues package starts in auto mode`：page `crossOriginIsolated:false` 且全局无 SAB，清单带 `plainQueues` → `state.status !== 'unavailable'`，且发出了 `residentInit`。
  - `without SharedArrayBuffer an old package stays unavailable`：清单无 `plainQueues` → `state.status === 'unavailable'`、`degradedReason === 'shared-array-buffer-unavailable'`。
  - `plain mode on an old package is unsupported, never ignored`：清单无 `plainQueues`、`queueMode:'plain'` → `degradedReason === 'plain-queues-unsupported'`，没有发出 `residentInit`。
  - `state.queueMode follows the ready capabilities`：假 Worker 回复 `capabilities.queueMode:'plain'` → `state.queueMode === 'plain'`。
  - 夹具（`packageFixture`）如不支持设置 `schedulerCapabilities`，先在夹具里加一个可选参数。
- [ ] **Step 2：** 运行 `pnpm vitest run test/kore-integration.test.ts`。预期：新增用例失败。
- [ ] **Step 3：** 实现上面的规则；同步更新 `.d.mts` 类型。`validateKoreManifest` 如对 `schedulerCapabilities` 做了严格枚举校验，改为接受含 `plainQueues` 的数组，同时仍接受旧的三项数组。
- [ ] **Step 4：** 再次运行同一命令；然后运行 `pnpm vitest run test/kore-*.test.ts`。预期：全部通过。
- [ ] **Step 5：** 提交。

### Task 5：开关 `keQueueMode` 的取值与接线（RoBrowser 仓库）

**Files:**
- Create: `src/kore/ke-queue-mode.mjs`、`src/kore/ke-queue-mode.d.mts`
- Modify: `createKoreIntegration` 的生产调用点（用 `codegraph_explore "createKoreIntegration"` 或 `grep -rn "createKoreIntegration" src` 找到；测试之外目前找不到直接调用时，沿 `kore-integration` 的导入链查）
- Test: `test/ke-queue-mode.test.ts`

**Interfaces:**
- Produces: `export function resolveKeQueueMode({ buildTarget, storage }: { buildTarget: 'iwa' | 'web' | 'native'; storage?: { getItem(key: string): string | null } | null }): 'auto' | 'shared' | 'plain'`
  - 先读 `storage.getItem('lro.keQueueMode')`；值为三个合法取值之一则返回它；读取抛异常、为 `null`、或非法值则忽略。
  - 否则按构建目标：`native` → `'plain'`，其余 → `'auto'`。
- Consumes: Task 4 的 `queueMode` 选项；`src/runtime/build-target.ts` 的 `CLIENT_BUILD_TARGET`（此时类型还不含 `native`，由计划 3 扩展；本任务内 `buildTarget` 参数类型写成 `string`，并把 `'native'` 当作字面量处理，避免依赖计划 3）。

- [ ] **Step 1：** 写失败的测试 `test/ke-queue-mode.test.ts`：
  - `defaults to auto for iwa and web`：`resolveKeQueueMode({buildTarget:'iwa'})`、`'web'` 均为 `'auto'`。
  - `defaults to plain for native`。
  - `localStorage overrides the default`：`storage.getItem` 返回 `'shared'`，各目标都返回 `'shared'`。
  - `invalid or throwing storage is ignored`：返回 `'bogus'`、`null`、以及 `getItem` 抛异常三种情况，结果等于该目标的默认值。
- [ ] **Step 2：** 运行 `pnpm vitest run test/ke-queue-mode.test.ts`。预期：失败（模块不存在）。
- [ ] **Step 3：** 实现模块并在生产调用点把 `queueMode: resolveKeQueueMode({ buildTarget: CLIENT_BUILD_TARGET, storage })` 传给 `createKoreIntegration`；`storage` 访问要包在 try/catch 里（无痕窗口会抛异常）。
- [ ] **Step 4：** 运行 `pnpm vitest run test/ke-queue-mode.test.ts test/kore-integration.test.ts`，预期全部通过；再运行 `pnpm typecheck`、`pnpm lint`（lint 在仓库里已有基线错误，只确认本任务新增文件没有新错误：`pnpm exec eslint src/kore/ke-queue-mode.mjs test/ke-queue-mode.test.ts`）。
- [ ] **Step 5：** 提交。

### Task 6：整体验证

- [ ] **Step 1：** RoBrowser 仓库：`pnpm test`。预期：全部通过（改动前基线为 4595 项通过）。
- [ ] **Step 2：** `pnpm build` 与 `pnpm build:web`，然后 `git diff --stat` 确认没有生成物被意外加入；与改动前对比 `dist/` 与 `dist-web/` 的文件清单一致（本计划不改变任何打包输出）。
- [ ] **Step 3：** KE 仓库（独立工作树）：`node --test tests/*.mjs test/build-local.test.mjs` 全部通过；再设置 `KE_TEST_QUEUE_MODE=plain` 重跑 `tests/worker-scheduler.test.mjs tests/kore-worker.test.mjs`，全部通过。
- [ ] **Step 4：** 把两个仓库的提交列表、测试数字和延迟基准数值整理成一段报告写入设计文档 §13（用 `docs(spec)` 提交到 `feat/tauri-native`），并告诉用户：KE 仓库的 `feat/ke-queue-mode` 分支已准备好，是否推送、是否发布新的 KE 版本由用户决定。
