# IWA 分发与更新

正式安装包的 `manifest.webmanifest` 包含稳定的 `update_manifest_url`。Chrome 从该 URL 读取 `updates.json`，根据数字版本选择高于当前版本的 `default` channel 包。

版本使用 `0.1.<github.run_number>`；commit SHA 只用于对象路径和审计追踪。不能把 commit hash 直接写入 IWA `version`。

## 下载来源

`updates.json` 的 `src` 指向 GitHub Release 资源经 `gh-proxy.org` 加速后的地址（`https://gh-proxy.org/https://github.com/parkerjj/LROBrowser/releases/download/iwa-<run>/lastro-v2-<sha>.swbn`），解决中国大陆直连 R2 下载慢的问题。`update_manifest_url` 仍是 `https://client.ltsd.ro/updates.json`（已写入用户已安装的包，不能改）。

- `src` 只能是单个 URL，Chrome 不会在多个镜像之间择优或回退。
- 发布流程必须先创建 GitHub Release，再写 R2 和 `updates.json`；否则 `src` 会短暂指向不存在的文件。
- R2 仍保存同一份包，作为手动下载备用，但不再出现在 `updates.json` 里。`IWA_DOWNLOAD_PROXY_URL` 未设置时，`publish-r2.mjs` 回退到 R2 地址。
- 包有签名且与 IWA 身份绑定，代理被篡改只会导致更新失败，不会装上伪造的包。代理不可用时自动更新会失败，需手动下载安装。
- `channels` 的 key（`default`）是已安装应用记住的 channel ID，不能改；`name` 只是显示名。

Chrome IWA 自动更新能力取决于浏览器版本和安装方式。无法自动更新时，用户可以从 GitHub Release 或 R2 下载最新 `.swbn` 手动安装。

同一版本路径不可覆盖不同内容。日常修复通过发布更高版本完成，不使用降级覆盖。签名密钥更换会产生新 IWA 身份，需要重新安装并单独安排迁移。

## 登录页版本提示

登录页右下角显示当前安装版本（读取包内 `/.well-known/manifest.webmanifest` 的 `version`），并请求 `https://client.ltsd.ro/updates.json`。`default` 通道存在更高版本时，徽标变为橙色并提示新版本，点击展开下载链接（仅接受 `client.ltsd.ro`，以及 `gh-proxy.org` 下本仓库 Release 的 HTTPS 地址）和 `chrome://iwa-dev` 地址的复制按钮。

- 这只是提示，不会自动安装；真正的自动更新仍由 Chrome 根据 `update_manifest_url` 完成。网页内容不能打开 `chrome://` 页面，只能让用户复制地址后手动粘贴。
- 页面内请求是跨域读取，`client.ltsd.ro` 必须对 `updates.json` 返回 `Access-Control-Allow-Origin`（Cloudflare/R2 的 CORS 规则）。没有该头时请求失败，页面只显示版本号，不会提示更新。
- 版本为占位值 `0.1.0` 的未发布构建不检查更新；Web 构建不显示该徽标。
- 更新地址已加入 `scripts/audit-iwa-dist.mjs` 的 API 白名单，只允许 `/updates.json` 路径。
