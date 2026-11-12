# 原生安装包（Tauri）与应用内自动更新 设计

日期：2026-11-12
分支：`feat/tauri-native`（从 `Development` 拉出，开发期间不合回 `Development`；完成后按平时流程合入 `Development` 再进 `main`，由 `main` 首次正式发布。不设 beta/测试通道）

## 1. 为什么要做

现在的分发方式是 IWA（Chrome Isolated Web App），玩家侧问题：

- 只能在 Chrome 里装，并且要在开发者模式下打开若干 flag，步骤繁琐，普通玩家很难装上。
- 更新只能去 `chrome://iwa-dev` 手动点 Update，应用自己没法检查和安装新版本。

目标是换成玩家熟悉的安装方式：**下载安装包 → 双击安装 → 之后自动更新**。

## 2. 目标 / 非目标 / 反目标

**目标**

- Windows 提供 `.exe` 安装包（NSIS），macOS 提供 `.dmg`，Android 提供 `.apk`。
- 三个原生版本都能在应用内检查新版本并完成更新，玩家不需要访问任何特殊页面。
- 原生版本的游戏连接、官方登录 HTTP 和资源下载全部由 Rust 实现（以下称“Rust 连接器”），不受浏览器跨域与中转 Origin 白名单限制。三个服务器（App服、二转、三转）都应能用。
- 安装包与现有 swbn 一样上传到 GitHub Release 和 R2。

**非目标**

- iOS 原生应用。iOS 只提供现有网页版 `https://game.ltsd.ro`（版权原因不上架 App Store）。
- Linux 桌面安装包（不在本次范围）。
- Windows 代码签名（没有免费方案，用户决定不签）。
- 游戏 JS 的单独热更新：每次发布都是整包更新（我的决定，见 §7）。
- 从 IWA 迁移已保存的账号：原生版是新的存储来源，玩家需要重新添加账号（我的决定）。
- Android 多开（只做桌面多开）。
- beta / 测试更新通道（用户决定，直接由 `main` 正式发布）。

**反目标（出现即视为失败，即便功能能跑）**

- 改坏或替换现有 IWA 与 web 的构建、发布流程。它们必须原样保留，原生版本是平行新增。
- 引入 Electron（体积大，用户明确否决）。
- 新增自建的中转服务器或网络代理服务。Rust 连接器在玩家本机进程内运行，不是服务器。
- 从远程加载可执行代码（JS/MJS/WASM/Lua/LUB）。可执行文件必须打进安装包，与 IWA 现有规则一致。
- 把签名私钥、keystore、Apple 凭据提交进仓库（仓库是公开的）。

## 3. 约束

- 仓库 `parkerjj/LROBrowser` 是**公开**仓库，没有开源许可证。所有密钥只能放在 GitHub Actions 的 `production` Environment secret 里。公开仓库可以免费使用 GitHub 托管的 macOS 构建机。
- 现有规则依然有效：远程被动资源只允许 `https://game.lastro.cn` 和 `https://rodata.ltsd.ro` 两个来源；可执行文件按 `core/executable-assets.json` 清单打包。
- 官方中转 `wss://port.lastro.cn/<host>:<port>` 只接受 `Origin: https://game.lastro.cn`（或 `https://game.ltsd.ro`）且 UA 像浏览器的握手。IWA 现在的做法是自己在 TLS 上完成 WebSocket 握手，并带官网 Origin 和宿主 UA（见 `src/network/relay-websocket.ts`）。原生版沿用这个已获批准的做法。
- 二转、三转的直连已被 GM 关闭，`0x0AC4` 下发的角色服务器地址是 `127.0.0.1:24322`，只能经由中转连接。所以原生版必须同时支持“直连”和“中转”两种模式，规则与 IWA 相同：App服直连，二转和三转走中转。
- `game.lastro.cn` 不返回任何 CORS 头（2026-11-12 实测：带 `Origin: https://game.ltsd.ro` 请求 `clientinfo.xml` 返回 200 但无 `Access-Control-Allow-Origin`，OPTIONS 预检返回 405）。网页版因此继续使用 `rodata.ltsd.ro` 镜像。原生版由 Rust 下载，不受影响。
- KoreEngine（KE）的常驻 Worker 依赖 `SharedArrayBuffer`，页面必须开启跨源隔离（`Cross-Origin-Opener-Policy: same-origin`、`Cross-Origin-Embedder-Policy: require-corp`），否则 KE 显示不可用。
- 版本号沿用 `scripts/build-release-metadata.mjs` 的格式 `1.<提交数>.<YYMMDD>`，它也是合法的 semver。原生版与同一提交的 IWA 使用相同版本号。

## 4. 已定的技术选型

| 项 | 选择 | 定的人 |
| --- | --- | --- |
| 应用名 | 沿用 IWA：显示名“LRO进阶客户端”，安装包文件名用 ASCII 前缀 `LRO-Client` | 我 |
| 永久标识 | Tauri `identifier` 与 Android 包名均为 `ro.ltsd.lroclient`；Android 新生成一把专用 release keystore，不复用 KoreEngine 的 `kore-release.keystore`（两者是不同应用）。这三项发布后不能再改，否则更新链断开、WebView 数据目录变化导致账号丢失 | 我 |
| 外壳 | Tauri 2（系统 WebView：Windows WebView2、macOS WKWebView、Android System WebView） | 用户 |
| 连接器 | Rust 重写（TCP 直连、中转 WebSocket、官方登录 HTTP、资源 HTTP） | 用户 |
| Windows 包 | NSIS `.exe`，按当前用户安装（无需管理员），**不签名** | 用户（不签名）/ 我（按当前用户安装） |
| macOS 包 | `.dmg`，Developer ID 签名并公证，universal（Apple 芯片和 Intel 共用一个包） | 用户（签名）/ 我（universal） |
| Android 包 | `.apk`，release keystore 签名，仅 `arm64-v8a`，最低 Android 8.0 | 我 |
| 桌面自动更新 | `tauri-plugin-updater`，Tauri 更新签名（minisign）校验 | 我 |
| Android 自动更新 | 自研：读清单 → 下载 apk → 校验 → 调起系统安装器（参照 KoreEngine） | 我 |
| 发布位置 | GitHub Release + R2，与 swbn 一致 | 用户 |
| 网页版 | 不变：`game.ltsd.ro`，中转 + `rodata.ltsd.ro` | 用户 |

说明：Rust 编译成 WASM 后在浏览器里同样不能开 TCP，也同样受 CORS 限制，所以 Rust 连接器只服务三个原生版本，对网页版没有帮助。

## 5. 架构

### 5.1 仓库布局（我的决定，构建者可微调）

```text
native/                      Tauri 工程（独立 Cargo workspace）
  src-tauri/
    Cargo.toml / Cargo.lock  固定版本，构建一律 --locked
    tauri.conf.json          产品名、identifier、窗口、bundle、updater 公钥、安全头
    capabilities/            Tauri 权限声明（只开放本项目用到的命令）
    src/
      main.rs / lib.rs
      net/                   Rust 连接器：tcp.rs、relay_ws.rs、http.rs、tls 配置
      resource_protocol.rs   自定义协议：资源下载
      update/                Android 更新逻辑（桌面用插件）
    gen/android/             tauri android init 生成的工程（提交）
rust-toolchain.toml          固定 Rust 版本（与 KoreEngine 一致：1.99.0）
.github/workflows/native-release.yml   新增，独立于 ci-release.yml
```

### 5.2 前端构建目标

`src/runtime/build-target.ts` 的 `ClientBuildTarget` 从 `'iwa' | 'web'` 扩展为 `'iwa' | 'web' | 'native'`。新增 `pnpm build:native`（`LASTRO_BUILD_TARGET=native`，输出到 `dist-native/`），Tauri 以它为前端目录打包。`vite.config.ts` 的 `packageRuntime` 增加 `native` 分支：

- 不输出 IWA 的 `.well-known/manifest.webmanifest`。
- 可执行资源清单与 IWA 相同，全部打进安装包。
- 资源根地址：原生版两个来源都可用（`game.lastro.cn` 优先，`rodata.ltsd.ro` 备用），与 IWA 的 `DEFAULT_RESOURCE_ROOTS` 一致，只是请求走 §5.4 的自定义协议。

`iwa` 和 `web` 两个目标的产物必须与改动前**逐字节一致**（或差异可解释），作为“不影响现有发布”的验收依据。

### 5.3 游戏连接（主线程）

现在的接入点：`client-bootstrap.ts` 设置 `globalThis.LastRODirectSocketFactory`（IWA 用 `TCPSocket` 实现的 `DirectTcpSocket`）和 `LastRORelaySocketFactory`（IWA 在 TCPSocket + JS TLS 上手工完成 WebSocket 握手）。`Online.js` 只依赖 `LegacyClientSocket` 接口（`src/network/client-socket.ts`）。

原生版新增一个 `NativeSocket implements LegacyClientSocket`，两个工厂在 `native` 目标下都返回它：

- JS 通过 Tauri 命令 `net_open({ mode: 'direct' | 'relay', host, port })` 打开连接，并传入一个 Tauri `Channel` 用于接收数据。Rust 返回连接 id。
- `send(buffer)` → `net_send(id, bytes)`；`close()` → `net_close(id)`。
- Rust 通过 Channel 推送三类事件：`open`、`data(bytes)`、`close(error?)`，分别映射到 `onComplete(true)`、`onMessage`、`onClose`（连接失败映射到 `onComplete(false)`）。
- `direct`：tokio `TcpStream`，关闭 Nagle（`set_nodelay(true)`）。
- `relay`：rustls + `tokio-tungstenite` 连接 `wss://port.lastro.cn/<host>:<port>`，握手带 `Origin: https://game.lastro.cn`、`Referer` 和 UA，与 `relay-websocket.ts` 当前行为一致。UA 用 Rust 内置的一个标准桌面 Chrome UA 字符串，不用 WebView 自带的 UA（我的决定）：WKWebView 的 UA 不含 `Safari/Version`，Android WebView 的 UA 带 `; wv`，可能被中转判为非浏览器而返回 403；IWA 运行在 Chrome 里，实际发出的本来就是 Chrome UA，所以这样与 IWA 效果相同。资源和登录 HTTP 的 UA 同样使用这个字符串；地址白名单规则（只允许 `*.lastro.cn` 的 `wss:`、无用户名密码/查询/片段）也照搬。
- 必须保持 IWA 已经处理好的语义：发送严格保序；`isZone`、`handoffPending` 等字段由 JS 侧维护不变；关闭时先把已收到的数据交付完再报告关闭。现有 `test/direct-tcp-socket.test.ts` 的行为用例应当对 `NativeSocket` 同样成立。

连接模式的选择规则沿用 `lastro-account-login.mjs`：原生版视为“支持直连”（`LastRODirectSocketsSupported = true`），App服直连，二转/三转中转。

### 5.4 资源下载（Worker 内）

资源由 Worker 里的 `runtime-resource-loader` 下载。Tauri 的命令调用只在主窗口可用，Worker 里调用不到，所以资源走**自定义 URI 协议**，Worker 照常用 `fetch()`：

- Rust 注册异步协议 `lro`（各平台实际 URL 形态由 Tauri 决定：Windows/Android 为 `http://lro.localhost/…`，macOS 为 `lro://localhost/…`；JS 用 Tauri 提供的 `convertFileSrc` 同类方法拼地址，不要手写）。
- 请求路径 `/<root-id>/<逻辑路径>`，`root-id` 只能是 `lastro` 或 `rodata`，Rust 映射到两个白名单来源，其余一律 403。逻辑路径照搬 `resource-policy.ts` 的规范化与分类规则，只放行被动资源扩展名。
- Rust 用 `reqwest`（rustls）连接池请求真实地址，请求头与 `officialWebHeaders` 一致（官网 Origin、Referer、UA）；把状态码和响应体（流式）原样返回，并加上 `Access-Control-Allow-Origin: *` 与 `Cross-Origin-Resource-Policy: cross-origin`，使跨源隔离页面可以读取。
- `game.lastro.cn` 对部分不存在的路径返回伪成功 HTML。现有的 `map-binary-validation` 和回退逻辑保留在 JS 侧，Rust 不做内容判断。
- JS 侧 `native` 目标下的 `fetch` 实现只是把真实 URL 改写为 `lro` 协议地址；超时、对冲请求、来源测速、负缓存、地图停滞超时等逻辑保持在 `resource-resolver.ts` 不变。

### 5.5 官方登录 HTTP

`src/network/lastro-login-http.ts` 现在在 TCPSocket 上用 JS TLS 访问 `https://game.lastro.cn`（`/?r=pc/index` 取 cookie 和 CSRF，再提交登录检查）。原生版新增 Tauri 命令 `http_request({ method, url, headers, body })`，由 Rust 的 reqwest 执行，并只允许 `https://game.lastro.cn`。`lastro-login-http.ts` 增加一个可注入的传输层：`native` 目标走该命令，IWA 保持现状。Cookie 由 JS 侧按现有逻辑自行携带，Rust 不保存 cookie。

`src/servers/online-profile-cache.ts` 从 `https://game.lastro.cn/ro/Online.js` 拉取服务器地址和封包密钥（只解析、不执行，IWA 中是单独审核过的例外）。原生版允许 `http_request` 额外以 GET 访问这一个固定路径，行为与 IWA 相同（我的决定）。`http_request` 的白名单因此是：`game.lastro.cn` 的登录相关路径 + `GET /ro/Online.js`，其余拒绝。

### 5.6 KoreEngine 与跨源隔离

- 在 `tauri.conf.json` 的 `app.security.headers` 里为前端资源设置 COOP `same-origin` 和 COEP `require-corp`，使 `crossOriginIsolated === true`。
- KE 包的引入方式与 IWA 构建一致（`pnpm ke:local` / CI 中下载 KE release），打进安装包。
- §5.4 的资源响应必须带 `Cross-Origin-Resource-Policy`，否则 COEP 会拦截。

### 5.7 安全边界

- Tauri capabilities 只开放：`net_open/net_send/net_close`、`http_request`、更新相关命令、`lro` 协议，以及 `opener` 插件的“用系统浏览器打开 https 链接”。不开启文件系统、shell 等插件。
- 设置 CSP：`script-src 'self'`（加 Tauri 必需项与 `wasm-unsafe-eval`），`connect-src` 含自身、`lro` 协议、Tauri IPC 和 `https://ltsd.ro`。前端现在直接请求 `https://ltsd.ro/api/v1/ke`（KE 授权，`src/kore/kore-ltsd-client.mjs`）和 `https://ltsd.ro/api/v1/market/search`（市场查询，`src/assistant/lro-market-api.mjs`），该站 CORS 为 `*`，保持直连即可，不经过 Rust（我的决定）。
- 前端里的外部链接（`window.open` 打开 `ltsd.ro/ke` 等）在原生版中改为交给 `opener` 插件，用系统默认浏览器打开，只允许 `https:` 链接（我的决定）。
- Rust 端对所有命令参数做白名单校验（主机、端口范围、URL 前缀），拒绝任意主机访问，避免网页侧被注入代码后把应用变成任意端口扫描或代理工具。
- TLS 一律校验证书（rustls + webpki-roots 或平台根证书）。

### 5.8 账号存储

继续使用 IndexedDB 账号管理流程，不改实现。原生版的存储随应用的 WebView 数据目录保存，卸载应用会丢失（与 IWA 卸载行为相同）。不做从 IWA 的迁移。

### 5.9 桌面多开（用户要求支持；方式是我的决定）

采用**一个进程、多个游戏窗口**：

- 每个窗口是一个完整、独立的游戏实例（各自加载页面、各自登录），共用同一份 IndexedDB 账号数据，与 IWA 同时开多个窗口的效果一致。
- 开新窗口的入口：应用内菜单/快捷键“新窗口”；再次双击应用图标时，用 `tauri-plugin-single-instance` 把请求转交给已运行的进程并打开一个新窗口（macOS 默认只聚焦已有实例，这样处理后行为与 Windows 一致）。
- Rust 连接器中的每个连接都记录所属窗口；窗口关闭时关闭它名下的所有连接。命令只能操作本窗口打开的连接。
- 现有的多开优化（后台窗口限 20fps、关闭 MSAA，见 `Online.js` 与 `kore-render-toggle.mjs`）依赖 `document.hasFocus()`，在每个窗口内照常生效，不需改动。
- **未聚焦、被遮挡或最小化的窗口必须继续运行**（定时器、收发包、KE 不能被暂停）。在 Tauri 中关闭 WebView 的后台节流（`backgroundThrottling` 设为 disabled），各平台实际效果需在 §9 验证。
- 自动更新安装前需要退出整个进程。提示条上说明“将关闭所有游戏窗口”，由玩家确认后才执行。

Android 只做单开。

### 5.10 Android 后台保持在线（用户要求）

切到后台或锁屏后，游戏连接和 KE 必须继续运行：

- 应用切到后台时启动一个前台服务，显示常驻通知（例如“LRO进阶客户端 正在保持在线”，可点回应用；断线或玩家主动退出后停止服务）。服务类型用 `specialUse`（apk 不经应用商店审核；`dataSync` 在 Android 15 有每日 6 小时上限，不适合）。
- 需要的权限：`FOREGROUND_SERVICE`、`FOREGROUND_SERVICE_SPECIAL_USE`、`POST_NOTIFICATIONS`（Android 13+ 首次运行时向玩家申请）、`WAKE_LOCK`。另外引导玩家把应用加入“电池优化白名单”（`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`），并在说明里提示部分国产 ROM 还需手动允许“后台运行/自启动”。
- 前台服务只能保证进程不被杀，**不能保证 WebView 里的 JS 继续运行**。还需要：不调用 `WebView.onPause()`/`pauseTimers()`；把 WebView 的渲染进程优先级设为 `RENDERER_PRIORITY_IMPORTANT` 且不随不可见而降低；持有 partial WakeLock。即便如此，Chromium 仍可能节流后台页面的定时器，这是本项目风险最高的一项，必须在 §9 先验证。
- Rust 侧连接本身不受 WebView 暂停影响，但游戏心跳和 KE 决策都在 JS/Worker 里，所以 JS 能否持续运行决定了这项能否成立。

如果 §9 验证证明 WebView 无法在后台可靠运行，需要回来找用户决定替代方案（例如把后台挂机交给 KE 原生 Android 版），不要自行降级。

## 6. 打包与签名

| 平台 | 构建机 | 产物 | 签名 |
| --- | --- | --- | --- |
| Windows | `ubuntu-24.04`，`cargo-xwin` 交叉编译 `x86_64-pc-windows-msvc`，Linux 版 NSIS（KoreEngine 已验证同一套工具链） | `LRO-Client-<版本>-windows-x64-setup.exe` | 不签名。WebView2 用 Tauri 默认的在线引导安装（Win10/11 基本自带） |
| macOS | GitHub 托管 macOS 构建机 | `LRO-Client-<版本>-macos-universal.dmg` | Tauri 内置流程：Developer ID 证书签名 + App Store Connect API Key 公证并装订（stapling） |
| Android | `ubuntu-24.04`，Android SDK/NDK + `tauri android build --apk --target aarch64` | `LRO-Client-<版本>-android-arm64.apk` | release keystore（Actions secret 解码到临时文件，用完删除） |

Android `versionCode` 从提交数推出（例如 `100000000 + 提交数`），保证单调递增，并与 apk 内一致。

macOS 的 Developer ID 证书、App Store Connect API Key 与 KoreEngine 使用的是同一个开发者账号，可以复用同名 secret 的值（`MACOS_CERTIFICATE_P12_BASE64`、`MACOS_CERTIFICATE_PASSWORD`、`MACOS_SIGNING_IDENTITY`、`ASC_KEY_ID`、`ASC_ISSUER_ID`、`ASC_PRIVATE_KEY`），由用户在本仓库的 `production` Environment 里配置。

Windows 不签名的玩家体验：首次运行安装包会出现 SmartScreen“Windows 已保护你的电脑”，需点“更多信息 → 仍要运行”。下载页需写明这一步。自动更新由已安装的应用下载并静默执行安装包，一般不再出现该提示（需在实机上确认，见 §9）。

## 7. 自动更新

**整包更新**：每次发布都出新安装包，游戏 JS/资源清单随安装包一起更新，不做单独的前端热更新。理由：实现最简单，桌面端 Tauri 更新是后台下载、关闭重启即生效，体验足够；代价是每次小修也要下载完整安装包（预计十几到几十 MB，以实测为准）。

### 7.1 更新清单

R2 上新增 `native/` 前缀（公开地址沿用 `https://client.ltsd.ro/`）：

- `native/latest.json`：Tauri updater 格式，覆盖 `windows-x86_64`、`darwin-aarch64`、`darwin-x86_64` 三个平台键（后两个都指向同一个 universal 更新包）。每项包含 `url` 和 Tauri 更新签名 `signature`。
- `native/android.json`：沿用 KoreEngine `releases.json` 中 android 条目的字段（`version`、`versionCode`、`url`、`sha256`、`size`、`minOs`、`notes`、`publishedAt`），外加 `signature`（用同一把 Tauri 更新私钥对 apk 签出的 minisign 签名），使 Android 与桌面使用同一把更新密钥校验。
- 安装包和更新包放在 `native/<版本>/` 下。

### 7.2 桌面端（Windows / macOS）

- 启动后检查一次，之后每 6 小时检查一次（我的决定）。发现新版本时在登录界面或游戏内用一个非阻塞提示条显示版本号和更新说明，玩家点“立即更新”后下载、安装并重启。正在游戏中不强制打断。
- 公钥写在 `tauri.conf.json`；私钥只在 Actions secret `TAURI_SIGNING_PRIVATE_KEY`（及口令）中。
- Windows NSIS 更新采用 passive 模式（显示进度、无需交互）。

### 7.3 Android

参照 KoreEngine `android/` 的现有实现（清单读取、`versionCode` 比较、大小与 SHA-256 校验）：

1. 拉取 `native/android.json`（只允许 HTTPS），比较 `versionCode`。
2. 下载 apk 到应用私有缓存目录，校验大小、SHA-256 和 minisign 签名。
3. 通过 `FileProvider` 调起系统安装器（需要 `REQUEST_INSTALL_PACKAGES` 权限）。首次会要求玩家授权“允许安装未知应用”，界面上给出引导。
4. 安装器会校验新 apk 与已装 apk 的签名证书一致，因此 release keystore 一旦确定就不能更换。

检查时机与提示方式同桌面端。

## 8. 发布流程

新增 `.github/workflows/native-release.yml`，**不修改** `ci-release.yml`：

- 触发：`main` 分支 push 和手动运行（与 IWA 正式发布条件一致）。其他分支只构建、不发布（便于在 `feat/tauri-native` 上验证）。
- 三个平台各自独立构建，互不等待。
- 发布前像 IWA 一样检查“当前 main 仍是本次提交”，避免旧提交覆盖新版本。
- 每个平台构建成功后：上传到 GitHub Release `native-<版本>`（各平台往同一个 Release 追加文件，附 `.sha256`），并上传到 R2 `native/<版本>/`。
- 三个平台都发布后，由最后一个汇总 job 生成并上传 `native/latest.json` 和 `native/android.json`。清单写入使用 concurrency 锁，避免并发覆盖。某个平台失败时，清单里保留该平台的上一版本条目。
- 新增 secrets（`production` Environment）：`TAURI_SIGNING_PRIVATE_KEY`、`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`、`ANDROID_KEYSTORE_BASE64`、`ANDROID_KEYSTORE_PASSWORD`、`ANDROID_KEY_ALIAS`、`ANDROID_KEY_PASSWORD`，以及 §6 列出的 macOS 证书与 ASC secret。R2 secret 复用现有的。
- 用户需在 `game.ltsd.ro` 或 GitHub Release 说明里提供三个平台的下载链接（下载页的具体形式留给构建者，最小方案是 Release 说明加 R2 固定地址 `native/latest/…` 的重定向或复制）。

## 9. 先做的技术验证（spike）

正式实现前，先用一个最小 Tauri 工程在三个平台上验证以下几点，任何一项不成立都要回来调整设计：

1. **跨源隔离**：设置 COOP/COEP 后，WebView2、WKWebView、Android System WebView 中 `crossOriginIsolated === true`，`SharedArrayBuffer` 可用，KE Worker 能启动。Android WebView 风险最高。
2. **Worker 访问自定义协议**：三个平台的 Dedicated Worker 中 `fetch` 自定义协议地址可用，且在 COEP 下不被拦截。
3. **渲染性能**：WKWebView 与 Android WebView 上 WebGL 地图渲染帧率可接受（以一张大地图为基准，与 Chrome 对比）。
4. **Windows 交叉编译**：Linux 上 `tauri build` 生成可安装、可启动的 NSIS 包（需 Windows 实机验证）。
5. **未签名包的自动更新**：Windows 上由应用触发的更新安装是否还会弹 SmartScreen。
6. **Android 后台保持在线（风险最高）**：按 §5.10 配置后，切到后台并锁屏 30 分钟，游戏连接不断开、心跳正常、KE 持续行动。分别在原生 Android 和至少一款国产 ROM 上测试。
7. **桌面窗口不被节流**：Windows 和 macOS 上，一个窗口最小化或被完全遮挡 30 分钟，期间游戏连接不断开、KE 持续行动；同时开 3 个窗口时资源占用可接受。
8. **中转握手**：Rust 用标准 Chrome UA + 官网 Origin 握手 `wss://port.lastro.cn` 返回 101（可先用现有 `LASTRO_TLS_LIVE=1 npx vitest run test/direct-tls-live.test.ts` 对照）。

spike 代码不进入正式分支历史；结论写入本文档。

## 10. 验收标准

- 三个平台安装包都能在实机上安装、启动、登录 App服（直连）和二转/三转（中转）并进入地图，资源能从 `game.lastro.cn` 加载，失败时回退到 `rodata.ltsd.ro`。
- KE 在三个平台可启动（若 §9-1 验证某平台不可行，该平台显示 KE 不可用，作为已知限制写入下载说明）。
- 从版本 N 安装后发布 N+1，三个平台都能在应用内完成更新并保留账号数据。不设测试通道：首个正式版 N 从 `main` 发布后，以下一次 `main` 发布 N+1 作为更新验收（用户决定；现有用户都在用 IWA，IWA 照常自动更新，原生版是平行发布，不影响他们）。
- 桌面端可同时开至少 3 个窗口分别登录不同账号，最小化或遮挡的窗口保持在线。
- Android 切到后台并锁屏 30 分钟后仍保持在线，常驻通知可见，回到应用画面正常。
- 篡改更新包或清单签名时，客户端拒绝安装。
- `pnpm build`、`pnpm build:web` 的产物与改动前一致；`ci-release.yml` 未改动；现有测试全部通过。
- 新增 Rust 连接器有单元测试（地址白名单、协议路径校验、中转握手请求头），`NativeSocket` 通过与 `DirectTcpSocket` 相同的行为用例。
- 仓库中不存在任何私钥、keystore、口令。

## 11. 需要同步修改的仓库规则

`AGENTS.md` 需更新（由本分支一并提交）：

- 允许 Tauri 原生外壳与其中的 Rust 连接器（直连、中转、HTTP）；依旧禁止 Electron、自建代理服务器、NodeSocket。
- 原生版的可执行文件同样必须打进安装包内清单；远程被动资源来源不变。
- “Phase A 不执行自动更新、生产签名”一条改为：原生版允许应用内自动更新，签名密钥只存在于 Actions secret。

## 12. 留给构建者决定的

- Tauri 插件与 crate 的具体版本（全部锁定、`--locked` 构建）。
- 提示条的具体 UI 与文案（复用现有 UI 相关的 mjs 模块，遵守 `AGENTS.md` 中“优先复用已有模块”的要求）。
- 窗口初始尺寸、是否记住窗口位置、应用图标的来源（可从现有 IWA 图标生成）。
- Android 横屏/全屏策略与软键盘处理。
- R2 上“最新版”固定下载地址的具体实现方式。
- `NativeSocket` 的事件批量合并策略（只要保序、及时交付即可）。
