# 原生核心（Tauri 工程 + Rust 连接器 + 前端接入）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 做出能在 Linux 开发机和 Windows 上运行的原生壳：Tauri 工程、Rust 实现的游戏连接 / 中转 / 官方 HTTPS / 资源下载、新的 `native` 前端构建目标、多窗口，使 `cargo tauri dev` 能登录并进入游戏。

**架构：** Rust 提供四类能力：（1）`net_*` 命令：直连 TCP、TLS 流（只给官方登录站点）、官方中转 WebSocket，数据通过 Tauri Channel 推给前端；（2）`lro` 自定义协议：给 Worker 里的 `fetch` 下载被动资源；（3）窗口生命周期：连接归属于打开它的窗口，窗口关闭则清理；（4）所有目标地址在 Rust 端做白名单校验。前端新增 `native` 构建目标，用一个实现 `LegacyClientSocket` 的 `NativeSocket` 替换 Direct TCP / 中转的 JS 实现，其余游戏逻辑（`Online.js`、各 mjs 模块）不变。

**技术栈：** Tauri 2、Rust 1.99.0（edition 2024）、tokio、tokio-rustls、tokio-tungstenite、reqwest（rustls）、percent-encoding；前端 TypeScript、Vite 6、Vitest 4。

**设计文档：** `docs/superpowers/specs/2026-11-12-tauri-native-packaging-design.md`（重点 §5.2–§5.9、§13）。探针代码在分支 `spike/tauri-native`（`spike/native-probe/`），可参考其中已验证的写法（自定义协议、中转握手、多窗口），但不要整体拷贝：探针是一次性代码。

## 全局约束

- 应用标识与 Android 包名：`com.ioft.lroclient`；产品显示名“LRO进阶客户端”；安装包前缀 `LRO-Client`。
- Rust 工具链固定 `1.99.0`，Edition 2024，所有构建加 `--locked`，`Cargo.lock` 提交。
- 被动资源远程来源只允许 `https://game.lastro.cn/ro/client_re/` 与 `https://rodata.ltsd.ro/ro/client_re/`；另外只允许固定路径 `https://game.lastro.cn/ro/Online.js`（读取服务器地址与封包密钥，只解析不执行）。可执行扩展名（js、mjs、cjs、wasm、lua、lub）永远不得经 `lro` 协议下载，必须在安装包内。
- 官方中转：`wss://port.lastro.cn/<host>:<port>`，握手必须带 `Origin: https://game.lastro.cn`、`Referer: https://game.lastro.cn/` 和统一的 Chrome 标识 `CHROME_UA`（常量见 Task 2；macOS 的 WKWebView 自带标识会被中转拒绝为 403，已实测）。
- 直连 TCP 只允许公网地址，拒绝回环、私网（10/8、172.16/12、192.168/16）、链路本地、组播地址和端口 0。TLS 流模式只允许 `game.lastro.cn:443`。
- 所有 Tauri 命令只能操作调用它的窗口自己打开的连接。
- 不得新增自建代理服务、不得引入 Electron；不得开启 Tauri 的 fs / shell 等插件。
- `iwa` 与 `web` 构建目标的产物不得改变（Task 1 有对比验证）；`ci-release.yml` 不得修改。
- 默认 `keQueueMode` 在 `native` 目标为 `plain`（见计划 2；本计划不依赖计划 2 先完成，KE 在原生版里暂时可能显示不可用，不影响游戏本体）。
- 测试中不得出现真实账号、密码、令牌。联网的“实时”测试必须由环境变量显式开启，默认跳过。

## 本计划与设计文档的差异（计划层面的决定，需要同步回设计文档）

- 设计文档 §5.5 写的是 `http_request` 命令。本计划改为 **TLS 流模式**：Rust 负责 TCP + rustls，把解密后的字节流交给前端，现有的 `lastro-login-http.ts` 里的 HTTP 拼装、Cookie、CSRF 逻辑原样复用。Rust 端仍然只允许 `game.lastro.cn:443`。这样改动最小，也避免在 Rust 里重写一遍登录流程。Task 9 结束时把设计文档同步。

## 重点检查项（计划里没有专门任务覆盖的失败场景）

1. 路径穿越与编码绕过：`lro` 协议请求 `..%2F`、双重编码、反斜杠、空段、`%00`，必须全部 403（Task 2、5）。
2. 窗口在连接中途关闭：Rust 侧连接任务必须终止，不能泄漏 socket 或让后台任务继续往已销毁的 Channel 发数据（Task 3、8）。
3. 大包与分片：64KB 以上的单次发送、接收端把多个封包粘在一起或把一个封包拆开，字节必须原样保序（Task 3、6）。
4. 中转握手被拒（403）和对端突然断开：前端必须收到“连接失败”或“连接关闭”而不是挂起（Task 4、6）。
5. 同一进程里两个窗口同时连同一服务器：互不干扰，关闭其中一个不影响另一个（Task 8）。

---

### Task 1：Tauri 工程骨架与 `native` 构建目标

**Files:**
- Create: `native/src-tauri/{Cargo.toml,build.rs,tauri.conf.json,capabilities/default.json,src/main.rs,src/lib.rs}`、`native/src-tauri/icons/`（用现有 IWA 图标生成：`cargo tauri icon <源图>`）、`native/rust-toolchain.toml`、`native/.gitignore`
- Modify: `src/runtime/build-target.ts`、`vite.config.ts`、`package.json`、`.gitignore`（忽略 `dist-native/`、`native/src-tauri/target/`、`native/src-tauri/gen/schemas/`）
- Test: `test/native-build-target.test.ts`

**Interfaces:**
- Produces: `src/runtime/build-target.ts`：`export type ClientBuildTarget = 'iwa' | 'web' | 'native'`；`export const IS_NATIVE_BUILD: boolean`；`IS_WEB_BUILD` 语义不变（仅 `web` 为真）。
- Produces: `vite.config.ts`：`packageRuntime(target: 'iwa' | 'web' | 'native', root?)`；环境变量 `LASTRO_BUILD_TARGET=native` 选择 native；`native` 目标：不输出 `.well-known/manifest.webmanifest` 与 `<link rel="manifest">`（与 web 相同）、不生成 `200.html`、不改写 `worldmap/sources.json`（保持 `game.lastro.cn`）、可执行资源清单与 iwa 相同。
- Produces: `package.json` 脚本 `build:native`：`LASTRO_BUILD_TARGET=native pnpm prepare:runtime && LASTRO_BUILD_TARGET=native vite build --outDir dist-native`（写法参照现有 `build:web`）。
- Produces: Tauri 配置：`identifier: "com.ioft.lroclient"`、`productName: "LRO进阶客户端"`、`build.frontendDist: "../../dist-native"`、`app.windows[0]` 带 `useHttpsScheme: true`、`app.security.headers` 设置 `Cross-Origin-Opener-Policy: same-origin` 与 `Cross-Origin-Embedder-Policy: require-corp`、`bundle.active: false`（打包留给计划 4）。
- Produces: `lib.rs` 暴露 `pub fn run()`，`#[cfg_attr(mobile, tauri::mobile_entry_point)]`；crate 名 `lro_client`，`[lib] crate-type = ["staticlib","cdylib","rlib"]`。

- [ ] **Step 1：** 记录改动前的基线：`pnpm build` 与 `pnpm build:web` 后，把 `find dist dist-web -type f | sort | xargs sha256sum` 保存到临时文件（放在本会话 scratchpad 目录）。
- [ ] **Step 2：** 写失败的测试 `test/native-build-target.test.ts`：（a）`CLIENT_BUILD_TARGET` 在未定义 `__LASTRO_BUILD_TARGET__` 时为 `'iwa'`；（b）参照现有覆盖 `packageRuntime('web')` 的测试（用 `grep -ln packageRuntime test` 找到）写 `packageRuntime('native')` 的用例：产物无 `.well-known`、无 `200.html`、`worldmap/sources.json` 仍含 `https://game.lastro.cn/`、`index.html` 不含 `rel="manifest"`；（c）`IS_WEB_BUILD` 在 native 下为 `false`、`IS_NATIVE_BUILD` 为 `true`（用 `vi.stubGlobal('__LASTRO_BUILD_TARGET__', 'native')` + 动态 import 重新加载模块）。运行 `pnpm vitest run test/native-build-target.test.ts`，预期失败。
- [ ] **Step 3：** 实现 `build-target.ts`、`vite.config.ts`、`package.json` 的改动。
- [ ] **Step 4：** 创建 Tauri 工程骨架（参考探针的 `Cargo.toml` / `tauri.conf.json`，去掉所有探针命令，`run()` 里只有 `tauri::Builder::default()` 和 `generate_context!`）。`cd native/src-tauri && cargo +1.99.0 check --locked`。预期：通过。
- [ ] **Step 5：** 再次运行 `pnpm vitest run test/native-build-target.test.ts`，预期通过；运行 `pnpm build && pnpm build:web`，再次计算哈希清单并与 Step 1 对比。预期：完全一致（若有差异必须逐项解释，不能忽略）。运行 `pnpm build:native`，预期生成 `dist-native/`，其中有 `index.html`、`play.html`。
- [ ] **Step 6：** 提交（`feat(native): Tauri 工程骨架与 native 构建目标`）。

### Task 2：Rust 校验策略模块 `policy`（纯函数）

**Files:**
- Create: `native/src-tauri/src/policy.rs`（模块内带 `#[cfg(test)] mod tests`）
- Modify: `native/src-tauri/src/lib.rs`（`mod policy;`）

**Interfaces:**
- Produces（全部为纯函数，无 I/O）：
  - `pub const CHROME_UA: &str`（标准桌面 Chrome 标识，使用探针里验证过的字符串）
  - `pub fn validate_tcp_target(host: &str, port: u16) -> Result<(), PolicyError>`：端口不为 0；`host` 是 IP 字面量时必须是公网单播地址；是域名时不得为 `localhost` 或以 `.localhost`、`.local`、`.internal` 结尾（解析后的地址检查在 Task 3 连接前再做一次）
  - `pub fn validate_tls_target(host: &str, port: u16) -> Result<(), PolicyError>`：仅 `("game.lastro.cn", 443)`，主机名大小写不敏感
  - `pub fn validate_relay_url(url: &str) -> Result<RelayTarget, PolicyError>`，`RelayTarget { pub url: String, pub target_host: String, pub target_port: u16 }`：scheme 必须是 `wss`，主机为 `lastro.cn` 或其子域，无用户名、密码、查询、片段，路径形如 `/<host>:<port>`，端口范围 1–65535
  - `pub fn resolve_lro_path(raw_path: &str) -> Result<String, PolicyError>`：返回要请求的上游完整 URL。先对 `raw_path` 做**一次**百分号解码（去掉开头的 `/`），再按 `src/resources/resource-policy.ts` 的 `normalizeResourcePath` 规则校验（含控制字符、`:`、`%`、`?`、`#`、绝对路径、`.`/`..`/空段全部拒绝；反斜杠先换成 `/`），根 id 为第一段：`lastro` → `https://game.lastro.cn/ro/client_re/`，`rodata` → `https://rodata.ltsd.ro/ro/client_re/`，其余拒绝；剩余路径的扩展名必须在被动扩展名白名单内（与 `resource-policy.ts` 的 `passiveExtensions` 完全一致）；特例：`official/ro/Online.js` → `https://game.lastro.cn/ro/Online.js`（仅此一个路径）
  - `#[derive(Debug, PartialEq)] pub enum PolicyError { Forbidden(&'static str) }`

- [ ] **Step 1：** 先写表驱动的失败测试（`cargo +1.99.0 test --locked policy`），断言至少包含这些用例：
  - `validate_tcp_target`：`("103.8.222.164", 26569)` 通过；`("127.0.0.1", 80)`、`("10.0.0.5", 80)`、`("192.168.1.2", 80)`、`("172.16.0.1", 80)`、`("169.254.1.1", 80)`、`("224.0.0.1", 80)`、`("::1", 80)`、`("localhost", 80)`、`("x.localhost", 80)`、`("1.2.3.4", 0)` 全部拒绝。
  - `validate_tls_target`：`("game.lastro.cn", 443)`、`("GAME.LASTRO.CN", 443)` 通过；`("game.lastro.cn", 8443)`、`("evil.com", 443)`、`("game.lastro.cn.evil.com", 443)` 拒绝。
  - `validate_relay_url`：`wss://port.lastro.cn/103.8.222.164:26569` 通过并解析出主机与端口；`ws://…`、`wss://evil.com/1.2.3.4:1`、`wss://user:pw@port.lastro.cn/1.2.3.4:1`、`wss://port.lastro.cn/1.2.3.4:1?x=1`、`wss://port.lastro.cn/1.2.3.4:0`、`wss://port.lastro.cn/1.2.3.4:99999` 拒绝。
  - `resolve_lro_path`：`/lastro/data/clientinfo.xml` → `https://game.lastro.cn/ro/client_re/data/clientinfo.xml`；`/rodata/data/sprite/a.spr` → rodata；`/lastro%2Fdata%2Fclientinfo.xml`（convertFileSrc 的整段编码形式）等价于前者；`/official/ro/Online.js` → 固定官方地址；以下全部拒绝：`/nope/x.spr`、`/lastro/../x.spr`、`/lastro/%2e%2e/x.spr`、`/lastro/a%252e%252e/x.spr`、`/lastro/data//x.spr`、`/lastro/data\..\x.spr`、`/lastro/data/x.spr%00`、`/lastro/data/a.js`、`/lastro/data/a.wasm`、`/lastro/data/a.lub`、`/lastro/data/noext`、`/official/ro/other.js`、`//lastro/x.spr`。
- [ ] **Step 2：** 运行，预期全部失败（函数未实现）。
- [ ] **Step 3：** 实现；公网地址判断用 `std::net` 的现有方法加上私网/链路本地手写判断，不引入新依赖。
- [ ] **Step 4：** 再次运行，预期全部通过。
- [ ] **Step 5：** 提交。

### Task 3：连接注册表与 `net_*` 命令（TCP + TLS 流）

**Files:**
- Create: `native/src-tauri/src/net/{mod.rs,registry.rs,tcp.rs}`
- Modify: `native/src-tauri/Cargo.toml`（tokio、tokio-rustls、rustls、webpki-roots、serde、serde_json）、`lib.rs`（注册命令）、`capabilities/default.json`

**Interfaces:**
- Consumes: Task 2 的 `validate_tcp_target` / `validate_tls_target`。
- Produces（Tauri 命令，窗口标签取自命令调用的 `tauri::WebviewWindow`）：
  - `net_open(window, kind: NetKind, host: String, port: u16, on_event: Channel<NetEvent>) -> Result<u64, String>`，`NetKind::{ Tcp, Tls }`，返回连接 id。连接在后台任务里建立；建立成功推 `NetEvent::Open`，失败推 `NetEvent::Failed { message }`；之后 `NetEvent::Data(Vec<u8>)`（实现上要求前端拿到的是 ArrayBuffer，不能走 JSON 数字数组；具体通道方式由构建者选择，如第二个 `Channel<InvokeResponseBody>`）与 `NetEvent::Closed { error: Option<String> }`。
  - `net_send(window, id: u64, bytes: Vec<u8>) -> Result<(), String>`：严格保序；该连接不属于调用窗口则报错。
  - `net_close(window, id: u64) -> Result<(), String>`：幂等。
- Produces: `registry::ConnectionRegistry`（`tauri::State` 管理）：`insert(window_label, conn) -> u64`、`remove(id)`、`close_window(label)`（Task 8 使用）、`owner(id) -> Option<String>`。
- 行为：TCP 打开后立即 `set_nodelay(true)`；解析域名后对每个解析出的地址再做一次公网检查；读取循环把到达的字节原样转发，不做合并拆分假设；TLS 模式用 rustls + `webpki-roots` 校验证书，SNI 取 `host`。

- [ ] **Step 1：** 在 `net/tcp.rs` 的测试里写失败用例（用本机 `tokio::net::TcpListener` 做对端，通过一个**不经策略检查的内部函数** `connect_tcp_unchecked` 避开公网限制；策略检查只在命令层调用）：
  - `echo round trip is byte exact for 64KB and 1-byte payloads`：发送后读到同样的字节。
  - `writes are strictly ordered`：连续发 1000 个带序号的小块，对端读到的拼接结果有序且完整。
  - `peer close is reported once with no error`：对端正常关闭 → 恰好一次 `Closed { error: None }`。
  - `connect refused is reported as Failed, never hangs`：连接一个无人监听的本机端口 → `Failed`。
  - `a connection owned by another window cannot be sent to or closed`：注册表层面断言 `owner` 不匹配时拒绝。
  - `close is idempotent and releases the task`：连续两次 `close` 不报错，且读任务结束。
- [ ] **Step 2：** 运行 `cd native/src-tauri && cargo +1.99.0 test --locked net`，预期失败。
- [ ] **Step 3：** 实现注册表、TCP / TLS 连接任务与三个命令。
- [ ] **Step 4：** 再次运行，预期全部通过；`cargo +1.99.0 clippy --locked --all-targets -- -D warnings` 无警告。
- [ ] **Step 5：** 提交。

### Task 4：官方中转 WebSocket 模式

**Files:**
- Create: `native/src-tauri/src/net/relay.rs`
- Modify: `native/src-tauri/Cargo.toml`（tokio-tungstenite，启用 `rustls-tls-webpki-roots`）、`net/mod.rs`、`net_open` 的 `NetKind` 增加 `Relay`

**Interfaces:**
- Consumes: Task 2 的 `validate_relay_url`、`CHROME_UA`；Task 3 的注册表与事件类型。
- Produces: `NetKind::Relay`：此时 `host` 参数承载完整的 `wss://port.lastro.cn/<host>:<port>` 地址（`port` 参数忽略）。握手头：`Origin: https://game.lastro.cn`、`Referer: https://game.lastro.cn/`、`User-Agent: CHROME_UA`。WebSocket 二进制消息 ↔ `NetEvent::Data` 一一对应，保序；文本消息忽略；对端 Close 帧 → `Closed`。
- Produces: 内部函数 `connect_relay_with(url: &str, headers: &RelayHeaders)`，允许测试时连接本机 `ws://` 服务（生产命令层只接受 `wss`，由 Task 2 的校验保证）。

- [ ] **Step 1：** 失败测试（本机 tokio-tungstenite 服务端）：
  - `handshake carries Origin, Referer and the Chrome user agent`：服务端回调里断言三个请求头的值。
  - `binary frames round trip in order`。
  - `a 403 on handshake is reported as Failed with the status in the message`：服务端拒绝握手 → `Failed`，消息含 `403`。
  - `server close frame is reported as Closed`。
  - 联网测试 `live relay handshake returns 101`：仅在环境变量 `LASTRO_RELAY_LIVE=1` 时运行，连接 `wss://port.lastro.cn/103.8.222.164:26569`，断言握手成功后立即关闭。
- [ ] **Step 2：** 运行 `cargo +1.99.0 test --locked relay`，预期失败。
- [ ] **Step 3：** 实现。
- [ ] **Step 4：** 再次运行，预期通过；`LASTRO_RELAY_LIVE=1 cargo +1.99.0 test --locked live_relay` 预期通过（如中转当前不可用，在报告里写明并跳过，不要因此改实现）。
- [ ] **Step 5：** 提交。

### Task 5：`lro` 自定义协议（被动资源下载）

**Files:**
- Create: `native/src-tauri/src/resource_protocol.rs`
- Modify: `lib.rs`（`register_asynchronous_uri_scheme_protocol("lro", …)`）、`Cargo.toml`（reqwest：`rustls-tls`、`gzip`、`stream`）

**Interfaces:**
- Consumes: Task 2 的 `resolve_lro_path`、`CHROME_UA`。
- Produces: 协议 `lro`。只处理 `GET`（其他方法 405）。响应头带 `Access-Control-Allow-Origin: *` 与 `Cross-Origin-Resource-Policy: cross-origin`。上游请求头：`User-Agent: CHROME_UA`、`Origin: https://game.lastro.cn`、`Referer: https://game.lastro.cn/`。上游状态码与响应体原样返回（含 404）；策略拒绝返回 403；网络错误返回 502。限制：单个响应体上限 256MB（超过返回 502 并中止），防止异常资源撑爆内存。
- Produces: 内部函数 `handle_with_upstream(path: &str, upstream_resolver: impl Fn(&str) -> String)`，测试时把上游基地址替换为本机 HTTP 服务（生产代码固定使用 Task 2 的映射）。

- [ ] **Step 1：** 失败测试（本机 hyper/axum 之外不引入新依赖：用 `tokio::net::TcpListener` 手写最小 HTTP 响应即可）：
  - `forwards status and body bytes unchanged` 含 `404` 与二进制体。
  - `adds CORS and CORP headers`。
  - `sends Origin, Referer and the Chrome user agent upstream`。
  - `policy rejection is 403 without contacting the upstream`（上游计数器保持 0）。
  - `non-GET is 405`。
  - `upstream connection failure is 502`。
- [ ] **Step 2：** 运行 `cargo +1.99.0 test --locked resource_protocol`，预期失败。
- [ ] **Step 3：** 实现。
- [ ] **Step 4：** 再次运行，预期通过。
- [ ] **Step 5：** 提交。

### Task 6：前端 `NativeSocket`

**Files:**
- Create: `src/network/native-socket.ts`
- Test: `test/native-socket.test.ts`

**Interfaces:**
- Consumes: `LegacyClientSocket`（`src/network/client-socket.ts`）；Task 3/4 的命令 `net_open` / `net_send` / `net_close`。
- Produces: `export interface NativeSocketDependencies { invoke(cmd: string, args?: Record<string, unknown>): Promise<unknown>; createChannel(onMessage: (event: NativeNetEvent) => void): unknown; schedule?: (cb: () => void) => void; reportError?: (e: unknown) => void }`；`export type NativeNetEvent = { type: 'open' } | { type: 'failed'; message: string } | { type: 'data'; bytes: ArrayBuffer } | { type: 'closed'; error?: string }`；`export class NativeSocket implements LegacyClientSocket { constructor(target: { kind: 'tcp' | 'tls' | 'relay'; host: string; port: number }, deps?: NativeSocketDependencies) }`；`export function createNativeSocketFactories(deps?): { direct: (host: string, port: number) => LegacyClientSocket; relay: (url: string) => LegacyClientSocket }`。
- 行为（与 `DirectTcpSocket` 一致，参照 `test/direct-tcp-socket.test.ts`）：构造后在下一个微任务才发起 `net_open`（让调用方先装好回调）；`open` → `connected = true` 且 `onComplete(true)`；`failed` → `onComplete(false)` 恰好一次，且之后不再触发 `onClose`；`data` → `onMessage(buffer)`；`closed` → `connected = false` 并触发一次 `onClose`；`send` 拷贝入参缓冲区（调用方可复用）并按调用顺序串行发送；`close()` 幂等，关闭后丢弃尚未发出的数据；`isZone`、`handoffPending` 字段只保存不解释；连接尚未建立时就 `close()`，要在建立后立即关掉，且不触发成功回调。

- [ ] **Step 1：** 失败测试，名称对应现有 Direct TCP 的用例（使用假的 `invoke`/`createChannel`）：
  - `does not open a connection when closed before initialization`
  - `opens once and reports success`
  - `reports open failure once and never calls onClose`
  - `copies the buffer passed to send so the caller can reuse it`
  - `serializes writes in call order`（假 `invoke` 对第一次 `net_send` 延迟完成，断言第二次在其后）
  - `delivers data events as ArrayBuffer to onMessage without reordering`
  - `close is idempotent and drops queued writes`
  - `closes a late open without firing a successful connection callback`
  - `preserves isZone and handoffPending across close`
  - `relay kind forwards the full wss url and ignores the port`
- [ ] **Step 2：** `pnpm vitest run test/native-socket.test.ts`，预期失败。
- [ ] **Step 3：** 实现；默认依赖取自 `window.__TAURI__.core`（`invoke`、`Channel`）。
- [ ] **Step 4：** 再次运行，预期通过；`pnpm typecheck`。
- [ ] **Step 5：** 提交。

### Task 7：前端接入（引导、登录 HTTPS、资源 Worker、官方 Online.js）

**Files:**
- Create: `src/network/native-tls-streams.ts`、`src/resources/native-resource-fetch.ts`
- Modify: `src/runtime/client-bootstrap.ts`（约 95–125 行的 `!IS_WEB_BUILD` 分支）、`src/network/lastro-login-http.ts`（`LastROLoginHttpOptions` 增加 `openStreams`）、`src/resources/runtime-resource-loader.ts`（选择 fetch 实现）、`src/servers/online-profile-cache.ts`（`refreshOfficialOnlineProfiles` 的默认 `fetcher`）、`src/runtime/client-config.ts`（`remoteClient` 与资源根）
- Test: `test/native-bootstrap.test.ts`、`test/native-resource-fetch.test.ts`、`test/native-tls-streams.test.ts`

**Interfaces:**
- Consumes: Task 6 的 `createNativeSocketFactories`；现有 `openEncryptedHttpStreams` 的返回类型（阅读 `src/resources/direct-http-resource.ts` 第 328 行起，`native-tls-streams.ts` 必须返回同样形状的值）。
- Produces: `openNativeTlsStreams(host: string, port: number, options?): ReturnType<typeof openEncryptedHttpStreams>`：内部用 `NativeSocket({ kind: 'tls', … })` 包成一对 `ReadableStream`/`WritableStream`，背压与关闭语义对齐现有实现。
- Produces: `createNativeResourceFetch(base: URL | string): typeof fetch`：把 `https://game.lastro.cn/ro/client_re/<path>` 与 `https://rodata.ltsd.ro/ro/client_re/<path>` 改写成 `lro` 协议地址并调用全局 `fetch`；其他地址一律抛错。协议基地址在 Worker 中由 `self.location` 推导：`location.protocol` 为 `https:` → `https://lro.localhost/`，`http:` → `http://lro.localhost/`，其余 → `lro://localhost/`；路径用原始（未整段编码）形式拼接。
- Produces: 在 `native` 目标下的引导行为：`LastRODirectSocketsSupported = true`；`LastRODirectSocketFactory = factories.direct`；`LastRORelaySocketFactory = factories.relay`；`sendLastROLoginPost` / `prepareLastROLoginSession` / `requestLastROPartyOverTLS` 使用 `openNativeTlsStreams`；`refreshOfficialOnlineProfiles` 的 `fetcher` 指向 `lro://…/official/ro/Online.js`；`LastROResourceRoots` 使用与 IWA 相同的两个根。`IS_WEB_BUILD` 为真时的分支保持原样不动。

- [ ] **Step 1：** 失败测试：
  - `native-resource-fetch`：两个官方根被改写成预期的 `lro` 地址（三种 `location.protocol` 各一例）；非官方地址、可执行扩展名地址抛错；路径中的空格和中文被正确百分号编码一次（不重复编码）。
  - `native-tls-streams`：用假 `NativeSocket` 验证写入、读取、关闭，以及对端关闭后读端结束。
  - `native-bootstrap`：stub `__LASTRO_BUILD_TARGET__='native'`、假 `window.__TAURI__`，执行引导中受影响的部分，断言上面列出的全局都被设置，且 `iwa` 目标下行为不变（`LastRODirectSocketFactory` 仍是 `createDirectSocket`）。
- [ ] **Step 2：** 运行这三个测试文件，预期失败。
- [ ] **Step 3：** 实现；`lastro-login-http.ts` 的改动只增加一个可选参数并默认使用现有函数。
- [ ] **Step 4：** 运行 `pnpm vitest run test/native-*.test.ts test/direct-tcp-socket.test.ts test/direct-http-resource.test.ts test/chat-map-*.test.ts`，再运行 `pnpm test`。预期：全部通过（基线 4595 项）。`pnpm typecheck`。
- [ ] **Step 5：** 提交。

### Task 8：窗口生命周期与多开

**Files:**
- Modify: `native/src-tauri/src/lib.rs`、`net/registry.rs`、`Cargo.toml`（`tauri-plugin-single-instance`）、`capabilities/default.json`
- Create: `native/src-tauri/src/windows.rs`

**Interfaces:**
- Produces: 命令 `open_game_window(app) -> Result<String, String>`，用递增编号创建标签为 `game-<n>` 的新窗口（加载与主窗口相同的前端入口）；`lib.rs` 在窗口 `Destroyed` 事件里调用 `registry.close_window(label)`；使用 `tauri-plugin-single-instance`：再次启动程序时不另起进程，而是在已运行的进程里调用同一个创建窗口函数。
- 每个窗口的 `webview` 关闭后台节流（探针里 `backgroundThrottling` 的做法，以 Tauri 当前版本支持的配置为准）。

- [ ] **Step 1：** 失败测试（Rust 单元测试，针对注册表）：`close_window drops only that window's connections`（两个窗口各一条连接，关闭其一后另一条仍可发送）；`close_window aborts the read task`（对端连接被关闭）；`a window label can be reused after close`。
- [ ] **Step 2：** 运行 `cargo +1.99.0 test --locked registry`，预期失败。
- [ ] **Step 3：** 实现注册表清理、`open_game_window`、窗口销毁钩子、单实例插件。
- [ ] **Step 4：** 再次运行，预期通过；`cargo +1.99.0 clippy --locked --all-targets -- -D warnings`。
- [ ] **Step 5：** 手工验证（Linux 开发机，需要显示环境）：`pnpm build:native && cd native/src-tauri && cargo +1.99.0 tauri build --debug --no-bundle`（或 `cargo tauri dev`），启动后调用 `open_game_window` 两次，三个窗口同时存在；关闭其中一个，另两个仍然正常；再次执行可执行文件，确认只出现新窗口而没有第二个进程（`pgrep -c lro_client`）。
- [ ] **Step 6：** 提交。

### Task 9：端到端冒烟与 CI 构建检查

**Files:**
- Create: `.github/workflows/native-build.yml`（只构建，不发布）、`docs/native/dev-guide.md`（中文：怎么在本机运行 / 调试原生版、环境变量、排错）
- Modify: `docs/superpowers/specs/2026-11-12-tauri-native-packaging-design.md`（同步 TLS 流模式的差异、命令名、目录）、`AGENTS.md`（按设计文档 §11 更新规则）

**Interfaces:**
- Produces: 工作流 `Native build check`：触发条件为 `pull_request` 中改动 `native/**`、`src/**`、`vite.config.ts` 的情况，以及手动触发；作业：（a）Linux：`pnpm install`、`pnpm build:native`、`cargo test --locked`、`cargo clippy -- -D warnings`、`cargo tauri build --debug --no-bundle`；（b）Windows 交叉编译：参照探针工作流 `spike-native-probe.yml` 里已验证的 `cargo-xwin` + NSIS 步骤，只构建 `x86_64-pc-windows-msvc` 的可执行文件，不上传安装包。不使用任何 secret，不发布。第三方 Action 引用沿用仓库里已有的固定 SHA。

- [ ] **Step 1：** 编写 `docs/native/dev-guide.md`。
- [ ] **Step 2：** 编写并在本机用 `actionlint`（如已安装）或 `python3 -c "import yaml; yaml.safe_load(open(...))"` 校验工作流语法。
- [ ] **Step 3：** 同步设计文档与 `AGENTS.md`：允许 Tauri 原生壳与其中的 Rust 连接器，依旧禁止 Electron、自建代理服务、NodeSocket；原生版可执行文件必须随安装包；原生版允许应用内自动更新、签名密钥只存在于 Actions secret（对应设计文档 §11）。
- [ ] **Step 4：** 全量验证：`pnpm lint`（只确认本计划新增文件没有新增错误，仓库已有基线错误）、`pnpm typecheck`、`pnpm test`、`cd native/src-tauri && cargo +1.99.0 test --locked && cargo +1.99.0 clippy --locked --all-targets -- -D warnings`、`pnpm build && pnpm build:web && pnpm build:native`，并再次与 Task 1 Step 1 的哈希清单对比 `dist`、`dist-web`。预期：全部通过，两份清单一致。`git diff --check`。
- [ ] **Step 5：** **需要用户参与的实机验收**（不要用真实账号自行登录；把步骤交给用户）：在 Linux 开发机运行 `cargo tauri dev`（或调试构建），用户用自己的账号登录 App服（直连）和二转服（中转），确认能进入地图、资源能加载、开第二个窗口可以同时登录另一个账号。把结果记入设计文档 §13。
- [ ] **Step 6：** 提交。推送与否由用户决定。
