# LastRO V2 IWA 客户端

KoreEngine M0 为可选本机接入。默认安装、测试、dev 和 Web/IWA 构建无需 KE 源码或 Rust，也不下载 KE 包。显式运行 `pnpm ke:local --source <absolute-path> --mode debug|release` 构建并暂存完整包，再执行普通 dev/build；运行 `pnpm ke:local --disable` 撤销接入。切换后重新加载已打开的客户端。私有路径、源码和生成物只留在被忽略的 `generated/` 中，不进入公开源码。

接入与 prepare 共用 `generated/ke/.staging.lock`。重叠调用会报告未开始，不改变另一调用的结果；进程崩溃留下锁时，查看锁中的 PID，确认进程已停止后才删除该锁并重试。构建失败、坏包或版本不兼容会撤销 KE，后续普通构建仍可继续。宿主只校验并加载当前包的同源 module Worker，初始化和运行故障只关闭 KE，不等待它完成原客户端启动。M0 仅显示运行状态和有界日志，没有 AI、游戏数据或配置功能。

这是独立的 LastRO V2 Isolated Web App 客户端。游戏连接支持在登录面板显式选择官方 WSS 传统模式或 Direct TCP / `TCPSocket` 直连。当前直连仅 App服可用，二转和三转使用传统模式。

连接模式位于服务器选择上方，三个服务器按钮同排显示，只显示当前模式的一行说明。切换模式或服务器即时生效，无需重新载入页面。传统模式下 App服按钮置灰；切到直连自动选择 App服，切回传统自动选择2转。模式和服务器选择保存在本地，刷新后恢复；没有有效记录时默认传统 + 2转。账号仍按服务器 profile 管理，切换连接模式不改变已保存账号信息。

WSS 路由以官方 `Online_new.js` 为准：入口为 `wss://port.lastro.cn/`，二转目标为 `45.248.10.247:26569`，三转目标为 `45.248.10.247:28569`，目标地址和端口放在 URL 路径中。选角、进图及换图也通过同一入口转发到相应端口。

Phase A 支持本地构建、审计、unsigned Web Bundle 和被 Git 忽略的本地 disposable test key 签名。账号密码由用户在 IWA IndexedDB 中按服务器 profile 管理。可用服务器为 `lastro-3x`、`lastro-2x` 和 `lastro-app`。App服使用 `45.248.8.68:27569`，协议参数沿用 2转服，`lastroNid=6`。

## 纯 Web 构建与部署

`pnpm build:web` 生成普通 HTTPS 静态站点到 `dist-web/`。Web 构建只使用 `https://rodata.ltsd.ro/ro/client_re/` 资源源和 `wss://port.lastro.cn/` 传统连接，隐藏 Direct TCP 控件，不输出 IWA manifest；`200.html` 用于 Surge 的深层 URL 回退。现有 `pnpm build` 仍生成 IWA 输出并保留 Direct TCP 能力。

`.github/workflows/ci-release.yml` 统一所有校验与发布：PR、`Development` 和普通分支只运行一次并行的 lint/typecheck 与全量测试，并构建未签名 IWA 包（artifact 保留 14 天，不签名、不外发）；`main` push、`v*` tag 或手动触发时额外构建 `dist-web`，通过 `production-web` Environment 使用固定版本 `surge@0.24.6` 部署到 `game.ltsd.ro`，`main` push 或手动触发时还会签名 IWA 并发布到 R2。仅从 GitHub Secrets 读取可选的 `SURGE_TOKEN`、`SURGE_LOGIN` 及生产发布密钥，仓库不包含任何凭据。Surge 项目约定记录在 `surge.json`。

## 仓库边界

`vendor/v2/` 是本项目固定管理的 V2 runtime、Worker、LastRO 模块和回归测试；`vendor/core/` 是本项目固定管理的 Lua/LUB、WASM、启动数据和 Source Han Sans CN 字体。`Online.js` 及其使用到的 `*.mjs` 都从这些目录进入构建。个人旧配置 `lastro-v2-config.js` 不属于本项目，也不会被复制。

`generated/` 不是源码目录，而是 `pnpm prepare:runtime` 生成的可删除构建中间目录，包含 patched runtime、Worker、核心资源和 executable manifest。删除它后重新运行 `pnpm prepare:runtime`、`pnpm test` 或 `pnpm build` 即可恢复。外部 `/run/media/.../ROWeb` 只属于历史来源，不是本项目的测试、构建或发布依赖。

## 本地命令

Linux 使用 Node 24 和仓库固定的 pnpm：

```bash
rtk proxy env PATH=/home/parker/.nvm/versions/node/v24.11.0/bin:$PATH .tools/node_modules/.bin/pnpm install
rtk proxy env PATH=/home/parker/.nvm/versions/node/v24.11.0/bin:$PATH .tools/node_modules/.bin/pnpm lint
rtk proxy env PATH=/home/parker/.nvm/versions/node/v24.11.0/bin:$PATH .tools/node_modules/.bin/pnpm typecheck
rtk proxy env PATH=/home/parker/.nvm/versions/node/v24.11.0/bin:$PATH .tools/node_modules/.bin/pnpm test
rtk proxy env PATH=/home/parker/.nvm/versions/node/v24.11.0/bin:$PATH .tools/node_modules/.bin/pnpm test:release
rtk proxy env PATH=/home/parker/.nvm/versions/node/v24.11.0/bin:$PATH .tools/node_modules/.bin/pnpm build
rtk proxy env PATH=/home/parker/.nvm/versions/node/v24.11.0/bin:$PATH .tools/node_modules/.bin/pnpm build:web
rtk proxy env PATH=/home/parker/.nvm/versions/node/v24.11.0/bin:$PATH .tools/node_modules/.bin/pnpm audit:iwa
rtk proxy env PATH=/home/parker/.nvm/versions/node/v24.11.0/bin:$PATH .tools/node_modules/.bin/pnpm bundle:iwa
./scripts/build-sign-local.sh
```

PowerShell 使用 Node 24 的 `pnpm` 执行相同脚本；脚本默认使用被 Git 忽略的 `.local/keys/`，也可通过 `LASTRO_IWA_SIGNING_KEY` 指定其他测试 key。

发行审计和本地候选包记录在 `release/`，本地 disposable test key 在 `.local/keys/`，这两个目录都被 Git 忽略。资源源策略、签名边界和手工验收流程见 `docs/iwa/`。IWA Phase A 不配置生产签名身份、`update_manifest_url` 或自动更新；Web Surge 发布由上文独立 workflow 管理，仍不包含 IWA 生产签名或自动更新。
