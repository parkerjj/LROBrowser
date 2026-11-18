# 原生客户端开发与实机测试

## Windows 上开始测试

打开 `native/src-tauri/target/debug/lro_client.exe`。也可以从仓库根目录运行下面的命令。开发窗口会使用 Tauri 自带的应用协议，刷新前端资源后再运行。

```powershell
Set-Location native
pnpm dlx @tauri-apps/cli@2.12.5 dev --no-dev-server -- --locked
```

测试账号由你在原生窗口中添加。每个窗口可单独登录，同一台机器上的原生窗口共用原生客户端的 IndexedDB。

1. 选择 App服与「直连」，登录后进入地图。观察地图、角色和贴图能否正常加载，再切换一次地图。
2. 选择二转服或三转服与「传统」，登录后进入地图，确认官方中转也能进入游戏。
3. 在「窗口」菜单点「新开窗口」，或再次运行同一个可执行文件。用另一个账号登录第二个窗口，关闭第一个窗口后确认第二个窗口仍在线。也可最小化第二个窗口一段时间，再恢复它检查连接与 KE。

## 从源码构建

需要 Node 24、pnpm 12.4.2、Rust 1.99.0。Windows 需要 WebView2 与 Visual Studio C++ Build Tools。Linux 需要图形桌面、WebKitGTK 4.1 开发库和基本 C/C++ 构建工具。Ubuntu 24.04 可安装 `build-essential`、`libwebkit2gtk-4.1-dev`、`libayatana-appindicator3-dev` 和 `librsvg2-dev`。

在仓库根目录安装依赖，构建内置前端，再用 Cargo 生成调试二进制。

```sh
pnpm install --frozen-lockfile
pnpm build:native
cd native/src-tauri
cargo build --locked --features custom-protocol
```

Linux 的二进制在 `native/src-tauri/target/debug/lro_client`，Windows 文件名为 `lro_client.exe`。Tauri CLI 的开发模式同样可用，从 `native/` 运行上面的 `dev --no-dev-server` 命令。使用 `--no-dev-server` 让这些测试覆盖真实的应用协议及 Worker 跨源请求。

## Windows 资源缓存

精灵、贴图和普通游戏地图等从服务器下载后保存在原生 WebView2 的 IndexedDB。当前数据目录是 `%LOCALAPPDATA%\com.ioft.lroclient\EBWebView\Default\IndexedDB\`。多个原生窗口同用这份缓存，关闭程序或换用同一应用标识的新可执行文件后仍可复用。IWA 使用自己的存储来源。

普通游戏资源的缓存有效期自写入起为 30 天。过期文件在下次需要时重新下载。KE 的旧版地图资源使用单独的 IndexedDB 按 fieldpack 版本和校验值复用，新版嵌入地图随 KE 包一起安装。清理 WebView2 用户数据会同时影响资源缓存、账号和设置。

## KE 与排错

- 原生版的 KE 默认使用事件驱动的 `plain` 队列。需要在构建时打入清单声明 `plainQueues` 的正式 KE 包，并使用已授权的 LTSD 账号。已有下载权限的开发环境可先在仓库根目录运行 `pnpm ke:local --sync-release`，再重建原生版。
- 做 KE 实机验收时，构建前设置 `KE_REQUIRE_PACKAGE=1`。可以用 `node scripts/kore-local.mjs --verify-dist dist-native --release-metadata <release.json>` 核验产物包含对应的正式包。若包缺失或与原生队列不兼容，KE 面板会显示具体原因。
- 「打开 LTSD 批准页」会启动系统默认浏览器。批准后返回客户端，等待 KE 完成授权。
- 若窗口提示核心清单加载失败，先在仓库根目录重跑 `pnpm build:native`，再重新生成二进制。`dist-native/` 中应有 `index.html`、`play.html` 和 `core/executable-assets.json`。
- 若登录画面正常但传统模式失败，可在 `native/src-tauri` 运行本机的 Rust 传输测试。在 PowerShell 设 `$env:LASTRO_RELAY_LIVE = '1'` 后运行 `cargo test --locked live_relay`，可单独检查官方中转握手。该测试只连接并关闭，不发送账号数据。
- 若地图或素材加载失败，记录服务器、地图名、资源错误和发生时间。反馈时省略账号、密码、Cookie 和令牌。
