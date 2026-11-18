# RoBrowserV2 协作规则

- 只在本仓库工作；不要修改 `/run/media/parker/7A9F-F871/ROWeb` 基线目录。
- `generated/`、`dist/`、`dist-web/`、`dist-native/`、`native/src-tauri/target/`、`release/` 和 `.codegraph/` 是本地构建或索引目录，不要提交生成物或测试密钥。
- 游戏连接支持用户显式选择官方 `wss://port.lastro.cn/` 传统模式或 TCP 直连。IWA 使用 `TCPSocket`，Tauri 原生外壳使用进程内 Rust 连接器处理直连、官方中转和官方 HTTPS。当前直连仅 App服可用，二转和三转使用传统模式。禁止其他 proxy、bridge、Electron 或 NodeSocket fallback。
- 可执行 JS/MJS/Worker/WASM/Lua/LUB 必须进入 IWA 或原生安装包的清单。被动资源远程来源限 `https://game.lastro.cn` 和 `https://rodata.ltsd.ro`。
- 账号密码只通过用户自己的 IndexedDB 账号管理流程保存，不复制个人快捷登录、XKore、私人服务器配置、私钥或生产 secret。
- 修改后运行相关聚焦测试，并根据变更范围运行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm audit:iwa` 或 `git diff --check`。
- Phase A 只做本地构建与测试，不执行自动更新、生产签名、GitHub Actions、Surge 或公网部署。原生版的应用内更新在后续发布阶段单独启用，生产签名密钥只存放在 GitHub Actions 的 `production` Environment secrets 中。
- 除非不得以，尽量不要在scripts目录内新增脚本，应优先判断此次修改是否可以直接修改Vendor的Online.js文件以进行永久性修复或者写入已有的mjs模块文件内，例如UI相关修复修改都可以复用同一个有关于UI的mjs模块文件；如果确实需要新增，先在本地测试并在 PR 中说明用途和安全边界。
