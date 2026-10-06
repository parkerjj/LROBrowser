# RoBrowserV2 协作规则

- 只在本仓库工作；不要修改 `/run/media/parker/7A9F-F871/ROWeb` 基线目录。
- `generated/`、`dist/`、`release/` 和 `.codegraph/` 是本地构建或索引目录，不要提交生成物或测试密钥。
- 游戏连接支持用户显式选择官方 `wss://port.lastro.cn/` 传统模式或 Direct TCP / `TCPSocket` 直连；当前直连仅 App服可用，二转和三转使用传统模式。不要新增其他 proxy、bridge、Electron 或 NodeSocket fallback。
- 可执行 JS/MJS/Worker/WASM/Lua/LUB 必须进入 IWA 包内清单；远程只允许两个被动资源 origin：`https://game.lastro.cn` 和 `https://rodata.ltsd.ro`。
- 账号密码只通过用户自己的 IndexedDB 账号管理流程保存，不复制个人快捷登录、XKore、私人服务器配置、私钥或生产 secret。
- 修改后运行相关聚焦测试，并根据变更范围运行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm audit:iwa` 或 `git diff --check`。
- Phase A 不执行自动更新、生产签名、GitHub Actions、Surge 或公网部署。
- 除非不得以，尽量不要在scripts目录内新增脚本，应优先判断此次修改是否可以直接修改Vendor的Online.js文件以进行永久性修复或者写入已有的mjs模块文件内，例如UI相关修复修改都可以复用同一个有关于UI的mjs模块文件；如果确实需要新增，先在本地测试并在 PR 中说明用途和安全边界。
