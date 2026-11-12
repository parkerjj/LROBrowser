# 原生安装包 计划 1：技术验证（spike）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 用一个一次性的最小 Tauri 探针应用，在 Linux、Windows、macOS、Android 上验证设计文档 §9 的 8 项前提，把结论写回设计文档。

**做法：** 探针应用 `native-probe` 自带一个测试页面，启动后自动跑完所有检测项，把结果输出为一行 JSON 报告后退出（Android 输出到 logcat）。Linux 和 Android 模拟器在本机跑；Windows 和 macOS 在 GitHub 托管构建机上跑；只有必须用真机的项目交给用户。

**技术栈：** Tauri 2、Rust 1.99.0、tokio、reqwest（rustls）、tokio-tungstenite（rustls）、cargo-xwin + NSIS（Linux 交叉编译 Windows）、Android SDK/NDK + 模拟器。

**设计文档：** `docs/superpowers/specs/2026-11-12-tauri-native-packaging-design.md`（执行者需同时阅读，尤其是 §5.3–§5.10 与 §9）

**计划拆分：** 正式实现是计划 2，等本计划的结论写回设计文档后再写。原因是 §9 的结论（尤其是 Android 后台在线）可能改变设计。

## 全局约束

- 探针代码是一次性的：放在 `spike/tauri-native` 分支（从 `feat/tauri-native` 拉出）的 `spike/native-probe/` 目录，**永远不合入** `feat/tauri-native`、`Development` 或 `main`。只有结论（设计文档 §9 的更新）提交到 `feat/tauri-native`。
- 不修改仓库根目录的 `package.json`、`vite.config.ts`、`ci-release.yml` 和 `src/`。
- Rust 工具链固定为 `1.99.0`（`rustup` 已装）。所有 crate 在 `Cargo.lock` 中锁定，构建一律加 `--locked`。
- Tauri `identifier`：`com.ioft.lroclient.probe`（探针专用，不能占用正式标识 `com.ioft.lroclient`）。
- 被动资源来源只允许 `https://game.lastro.cn` 与 `https://rodata.ltsd.ro`。
- 中转握手请求头：`Origin: https://game.lastro.cn`，`User-Agent` 用一个固定的标准桌面 Chrome UA 字符串（写成 Rust 常量 `CHROME_UA`）。
- 中转测试地址：`wss://port.lastro.cn/103.8.222.164:26569`（与 `test/direct-tls-live.test.ts` 相同）。
- 资源测试地址：`https://game.lastro.cn/ro/client_re/data/clientinfo.xml`（2026-11-12 实测返回 200）。
- 不提交任何密钥。探针不签名（macOS 用 ad-hoc 签名即可本地启动）。
- 推送 `spike/tauri-native` 会顺带触发现有的 `ci-release.yml`（它对所有分支运行 lint/test/build，但非 `main` 不发布）。这是预期行为。

## 判定标准（所有任务共用）

报告是一行 JSON，以 `PROBE_REPORT ` 开头。各字段的通过条件：

| 字段 | 含义 | 通过条件 |
| --- | --- | --- |
| `coi` | `crossOriginIsolated` | `true` |
| `sab` | Worker 里 `SharedArrayBuffer` + `Atomics.wait` 能用 | `true` |
| `workerFetch` | Worker 内 `fetch` 自定义协议拿到 `clientinfo.xml` | `status === 200` 且 `bytes > 0` |
| `relay` | Rust 中转握手 | `status === 101` |
| `timers` | 定时器节拍检测（见 Task 4、5） | 主线程和 Worker 的 `maxGapMs ≤ 5000`（`setInterval` 间隔 1000ms） |
| `webgl` | WebGL2 可用与简易压测帧率 | 只记录数值，不设门槛 |

---

### Task 1：探针骨架（Linux 可运行并输出报告）

**Files:**
- Create: `spike/native-probe/src-tauri/{Cargo.toml,Cargo.lock,build.rs,tauri.conf.json,capabilities/default.json}`
- Create: `spike/native-probe/src-tauri/src/{main.rs,lib.rs,report.rs}`
- Create: `spike/native-probe/ui/{index.html,probe.js}`
- Create: `spike/native-probe/README.md`（如何在各平台构建运行，中文）

**Interfaces:**
- Produces: Tauri 命令 `report(json: String)`：Rust 打印 `PROBE_REPORT <json>` 到 stdout（Android 打印到 logcat，tag `LroProbe`）。如果以 `--probe-auto` 启动，打印后以退出码 0 退出。
- Produces: `probe.js` 导出 `async function runProbes(): Promise<Record<string, unknown>>`，后续任务往里追加检测项，每项是 `results.<字段> = await probeX()`。
- Produces: `--probe-duration-s=<n>` 参数（默认 `60`）传给页面，供 Task 4/5 的定时器检测使用。

- [ ] **Step 1：** 从 `feat/tauri-native` 拉出 `spike/tauri-native` 分支。
- [ ] **Step 2：** 用 `cargo +1.99.0 install tauri-cli --version "^2" --locked --root spike/native-probe/.tools` 安装 CLI，并把 `.tools/`、`target/` 写进 `spike/native-probe/.gitignore`。
- [ ] **Step 3：** 写骨架。`tauri.conf.json` 的前端目录指向 `../ui`（静态文件，不用打包器）；`app.security.headers` 设置 `Cross-Origin-Opener-Policy: same-origin` 和 `Cross-Origin-Embedder-Policy: require-corp`；窗口 `backgroundThrottling` 设为 `disabled`。页面加载后调用 `runProbes()`，再 `invoke('report', { json })`。这一步只放一个检测项 `ua: navigator.userAgent`。
- [ ] **Step 4：验证。** 运行 `cd spike/native-probe/src-tauri && ../.tools/bin/cargo-tauri build --debug --no-bundle && ./target/debug/native-probe --probe-auto`。预期：stdout 出现一行 `PROBE_REPORT {"ua":"…"}`，进程退出码为 0。
- [ ] **Step 5：** 提交（`git add spike/native-probe && git commit -m "spike: Tauri 探针骨架"`）。

### Task 2：跨源隔离与 Worker 访问自定义协议（§9 第 1、2 项）

**Files:**
- Create: `spike/native-probe/src-tauri/src/resource_protocol.rs`
- Create: `spike/native-probe/ui/probe-worker.js`
- Modify: `spike/native-probe/src-tauri/src/lib.rs`（注册协议）、`spike/native-probe/ui/probe.js`

**Interfaces:**
- Consumes: Task 1 的 `runProbes`、`report`。
- Produces: 异步 URI 协议 `lro`。路径格式 `/<root-id>/<逻辑路径>`，`root-id ∈ {lastro, rodata}`，分别映射到 `https://game.lastro.cn/ro/client_re/` 和 `https://rodata.ltsd.ro/ro/client_re/`，其他 `root-id` 返回 403。响应头带 `Access-Control-Allow-Origin: *` 和 `Cross-Origin-Resource-Policy: cross-origin`。上游请求带 `CHROME_UA`、`Origin: https://game.lastro.cn`、`Referer: https://game.lastro.cn/`。
- Produces: 页面侧的地址拼接函数 `lroUrl(rootId, path)`，按平台生成 URL（Windows/Android 为 `http://lro.localhost/…`，macOS/Linux 为 `lro://localhost/…`）。以 Tauri 的 `convertFileSrc(path, 'lro')` 为准，不要手写平台判断。

- [ ] **Step 1：** 实现 `lro` 协议，用 reqwest 共享客户端转发 GET。
- [ ] **Step 2：** 在 `probe-worker.js` 中，收到消息后执行三件事：
  - 创建 `new SharedArrayBuffer(8)`，对一个槽位执行 `Atomics.wait(i32, 0, 0, 10)`，返回值应为 `'timed-out'`，记为 `sab`；
  - `fetch(lroUrl('lastro', 'data/clientinfo.xml'))`，回报 `{ status, bytes }`，记为 `workerFetch`；
  - 再 `fetch(lroUrl('nope', 'data/clientinfo.xml'))`，回报其 status，记为 `workerFetchForbidden`，预期为 403。
- [ ] **Step 3：** `probe.js` 记录 `coi: crossOriginIsolated`，并启动 Worker 收集上面三项。
- [ ] **Step 4：验证（Linux）。** 运行 Task 1 Step 4 的命令。预期报告中 `coi:true`、`sab:true`、`workerFetch.status:200`、`workerFetch.bytes>0`、`workerFetchForbidden:403`。
- [ ] **Step 5：** 提交。

### Task 3：Rust 中转握手（§9 第 8 项）

**Files:**
- Create: `spike/native-probe/src-tauri/src/relay.rs`
- Modify: `lib.rs`、`probe.js`

**Interfaces:**
- Produces: Tauri 命令 `relay_probe() -> { status: u16, ms: u64, error: Option<String> }`。用 tokio-tungstenite（rustls）连接全局约束里的中转地址，握手请求头带 `Origin`、`User-Agent: CHROME_UA`。拿到响应状态后立刻关闭连接。

- [ ] **Step 1：** 先用对照组确认中转当前可用：`LASTRO_TLS_LIVE=1 npx vitest run test/direct-tls-live.test.ts`（在仓库根目录跑）。如果对照组本身失败，说明是中转侧的问题。这种情况下在报告备注里写明，不要继续调试 Rust 实现。
- [ ] **Step 2：** 实现 `relay_probe`，`probe.js` 把结果记为 `relay`。
- [ ] **Step 3：** 实现一个反向对照：同一连接改用 WebView 自身的 UA（JS 传入 `navigator.userAgent`），记为 `relayWithWebviewUa`。这一项用于确认设计文档里“改用标准 Chrome UA”的理由是否成立。
- [ ] **Step 4：验证（Linux）。** 预期 `relay.status:101`。`relayWithWebviewUa` 只记录结果，不设门槛。
- [ ] **Step 5：** 提交。

### Task 4：桌面多窗口与后台节流（§9 第 7 项），以及 WebGL 指标（§9 第 3 项的一部分）

**Files:**
- Create: `spike/native-probe/ui/timers.js`、`spike/native-probe/ui/webgl.js`
- Modify: `lib.rs`（新增命令）、`probe.js`

**Interfaces:**
- Produces: `async function measureTimers(durationS: number): Promise<{ mainMaxGapMs: number, workerMaxGapMs: number, durationS: number }>`。主线程和 Worker 各跑一个 `setInterval(…, 1000)`，记录相邻两次回调的最大间隔。
- Produces: Tauri 命令 `open_probe_windows(count: u32)`：再开 `count` 个窗口加载同一页面，以 `?child=1&state=<normal|minimized|hidden>` 区分。子窗口跑完 `measureTimers` 后，通过 `report_child(label, json)` 回报；主窗口等全部子窗口回报后，把结果汇总进 `timers.windows[]`。
- Produces: `async function webglBench(): Promise<{ webgl2: boolean, fpsAvg: number }>`。用 `requestAnimationFrame` 在 5 秒内绘制 2000 个带纹理的四边形，统计平均帧率。只在主窗口运行。

- [ ] **Step 1：** 实现 `measureTimers` 和 `webglBench`。
- [ ] **Step 2：** 实现 `open_probe_windows(3)`：一个窗口保持正常，一个用 `minimize()`，一个用 `hide()`。主窗口自己的定时器检测也同时进行。
- [ ] **Step 3：** 判定：每个窗口都满足 `mainMaxGapMs ≤ 5000` 且 `workerMaxGapMs ≤ 5000`，`timers.pass` 才为 `true`。
- [ ] **Step 4：验证（Linux）。** 运行 `./target/debug/native-probe --probe-auto --probe-duration-s=120`。预期 `timers.pass:true`，`webgl.webgl2:true`。
- [ ] **Step 5：** 提交。

### Task 5：Android 构建与后台保持在线（§9 第 6 项）

**Files:**
- Create: `spike/native-probe/src-tauri/gen/android/`（`cargo tauri android init` 生成后再修改）
- Create: `spike/native-probe/src-tauri/gen/android/app/src/main/java/com/ioft/lroclient/probe/KeepAliveService.kt`
- Modify: 生成的 `MainActivity.kt`、`AndroidManifest.xml`

**Interfaces:**
- Consumes: Task 4 的 `measureTimers`。在 Android 上，`--probe-duration-s` 改为从 Intent extra `probeDurationS` 读取。
- Produces: 前台服务 `KeepAliveService`，类型 `specialUse`，Activity `onStop` 时启动、`onStart` 时保持（以便测试）。另外：
  - Manifest 声明 `FOREGROUND_SERVICE`、`FOREGROUND_SERVICE_SPECIAL_USE`、`POST_NOTIFICATIONS`、`WAKE_LOCK`；
  - 服务持有 partial WakeLock；
  - `MainActivity` 对 WebView 调用 `setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false)`，并且不调用 `onPause()`/`pauseTimers()`（如果 Tauri/wry 默认会调用，需要在本任务里找到并屏蔽）。
- Produces: 定时器检测每 60 秒输出一次中间结果 `PROBE_TICK {"mainMaxGapMs":…,"workerMaxGapMs":…,"elapsedS":…}` 到 logcat，结束时输出 `PROBE_REPORT`。

- [ ] **Step 1：** 设置 `ANDROID_HOME=$HOME/Android/Sdk`、`NDK_HOME=$ANDROID_HOME/ndk/28.2.13676358`，执行 `rustup +1.99.0 target add aarch64-linux-android x86_64-linux-android`，然后运行 `cargo tauri android init`。
- [ ] **Step 2：** 实现上面的服务、权限和 WebView 设置。
- [ ] **Step 3：** 在模拟器上运行（x86_64、API 35 镜像，用 `emulator -avd <名> -no-window` 无界面启动）：
  - 用 `cargo tauri android build --debug --target x86_64 --apk` 构建并 `adb install`；
  - `adb shell am start -n com.ioft.lroclient.probe/.MainActivity --ei probeDurationS 1800`；
  - 10 秒后 `adb shell input keyevent KEYCODE_HOME`，再 `adb shell input keyevent KEYCODE_SLEEP`；
  - 等到 15 分钟时执行 `adb shell dumpsys deviceidle force-idle`，模拟进入 Doze；
  - 用 `adb logcat -s LroProbe` 收集日志。
- [ ] **Step 4：验证。** 预期整个 30 分钟内每分钟都有 `PROBE_TICK`（证明进程和 JS 都还在跑），并且最终 `PROBE_REPORT` 中 `timers.pass:true`。如果失败，记录是从哪个阶段开始出现间隔超标的（切到后台 / 锁屏 / Doze）。
- [ ] **Step 5：** 同一个 APK 不做任何后台设置、再跑一遍作为对照（注释掉服务启动），记录对照组的 `maxGapMs`，用来证明保活措施确实起了作用。
- [ ] **Step 6：** 提交。

### Task 6：Windows / macOS 构建与自动检测（CI，§9 第 1、2、4、7、8 项）

**Files:**
- Create: `.github/workflows/spike-native-probe.yml`（只在 `spike/tauri-native` 分支存在）

**Interfaces:**
- Consumes: Task 1–4 的探针与 `--probe-auto`、`--probe-duration-s`。
- Produces: 工作流产物 `probe-report-windows.json`、`probe-report-macos.json`，以及 Windows 安装包 `native-probe-setup.exe`。

- [ ] **Step 1：** 作业 `windows-build`（`ubuntu-24.04`）：安装 NSIS、LLVM 和 `cargo-xwin`（KoreEngine 已用 0.23.1，安装方式参照 KoreEngine 的 `docs/release-build.md`），设置 `XWIN_ACCEPT_LICENSE=1`，运行 `cargo tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc --bundles nsis`，上传安装包。
- [ ] **Step 2：** 作业 `windows-run`（`windows-latest`，needs `windows-build`）：用 `/S` 静默安装，再以 `--probe-auto --probe-duration-s=600` 运行已安装的程序，把 stdout 中的 `PROBE_REPORT` 行存成 json 上传。Windows GUI 子系统程序默认没有 stdout，所以在 `report` 命令里同时写 `%TEMP%\lro-probe-report.json`，CI 读这个文件。
- [ ] **Step 3：** 作业 `macos-run`（`macos-latest`）：本机构建 `--target universal-apple-darwin` 的 `.app`，用 `codesign -s -` 做 ad-hoc 签名，然后同样参数运行，报告写到 `$TMPDIR/lro-probe-report.json` 并上传。
- [ ] **Step 4：验证。** 推送 `spike/tauri-native`（推送前确认 `git log origin/Development..spike/tauri-native` 只包含 spike 与 spec/plan 提交）。用 `gh run watch` 等待工作流完成，下载两份报告，确认全部字段满足判定标准。Windows 安装包能生成并静默安装，即视为 §9 第 4 项（交叉编译）的 CI 部分通过。
- [ ] **Step 5：** 提交工作流（属于 spike 分支）。

### Task 7：交给用户的真机检查清单（§9 第 3、5 项，以及第 6 项的国产 ROM 部分）

**Files:**
- Create: `spike/native-probe/MANUAL-CHECKS.md`（中文，每项写清下载哪个产物、怎么操作、看什么、如何把结果回报）

**Interfaces:**
- Consumes: Task 5 的 arm64 APK（另外用 `--target aarch64` 构建一份 release-unsigned、debug 签名的 APK）、Task 6 的 Windows 安装包和 macOS `.app`（打成 zip 作为产物）。
- Produces: 新增 Tauri 命令 `download_and_run_installer(url: String)`（只在 Windows 生效）：用 Rust 把安装包下载到 `%TEMP%` 后直接启动。用于检查“应用自己下载的安装包会不会弹 SmartScreen”（§9 第 5 项）。

清单内容：
1. Windows 实机：从浏览器下载 `native-probe-setup.exe` 安装，记录是否出现 SmartScreen；打开探针，点“下载并运行安装包”（URL 用 GitHub Actions 产物或 Release 的直链），记录这一次是否出现 SmartScreen。
2. macOS 实机：运行探针，记录报告中的 `webgl.fpsAvg`；在同一台机器的 Chrome 里打开同一个 `ui/index.html` 的 WebGL 压测作对比。
3. Android 实机（一台原生系统，一台国产 ROM）：安装 arm64 APK，按 Task 5 的流程手动切到后台并锁屏 30 分钟，然后用“分享日志”按钮（探针里加一个按钮，把最近的 `PROBE_TICK` 行复制到剪贴板）把结果发回来。

- [ ] **Step 1：** 实现 `download_and_run_installer` 和 Android 上的“复制日志”按钮。
- [ ] **Step 2：** 编写 `MANUAL-CHECKS.md`。
- [ ] **Step 3：验证。** 在本机 Linux 和模拟器上把这两个按钮各点一次：Linux 上 `download_and_run_installer` 应返回“不支持的平台”；模拟器上剪贴板里应出现 `PROBE_TICK` 行。
- [ ] **Step 4：** 提交并推送 spike 分支，然后把清单发给用户。

### Task 8：把结论写回设计文档

**Files:**
- Modify: `docs/superpowers/specs/2026-11-12-tauri-native-packaging-design.md` 的 §9（在 `feat/tauri-native` 分支上修改，不在 spike 分支上改）

- [ ] **Step 1：** 在 §9 每一项后面写上结论：通过/不通过、在哪个平台、关键数值、报告或产物链接（Actions run URL）。
- [ ] **Step 2：** 如果有不通过的项，标出受影响的设计章节，并写明需要用户决定的问题。尤其是 Android 后台在线：按设计文档 §5.10 的约定回来找用户，不要自行降级。
- [ ] **Step 3：** 提交到 `feat/tauri-native`（`docs(spec): 记录原生壳技术验证结论`）。

## 重点检查项

1. **Worker 访问自定义协议被 COEP 拦截**：如果协议响应缺少 `Cross-Origin-Resource-Policy`，在 COEP 页面下会直接报网络错误，而不是返回 403。Task 2 的 `workerFetchForbidden` 检测项要求拿到明确的 403，以此区分“协议拒绝”和“被浏览器拦截”。
2. **Android 的 wry 默认可能在 Activity `onPause` 时暂停 WebView**：Task 5 的对照组（Step 5）就是为了证明保活措施生效，而不只是模拟器恰好没有节流。
3. **Windows GUI 程序没有 stdout**：Task 6 Step 2 要求报告同时写入临时文件，避免 CI 拿到空报告却误判为通过。CI 拿不到报告文件时必须让作业失败。
4. **中转被拒可能是运营方又收紧了，而不是我们的实现问题**：Task 3 Step 1 先跑对照组，避免在实现上空转。
5. **隐藏窗口在 macOS 上可能完全停止渲染和定时器**：Task 4 对 `hidden` 状态的窗口单独记录数值；它不通过时，设计中的“被遮挡窗口保持在线”需要拿出具体数据再讨论。
