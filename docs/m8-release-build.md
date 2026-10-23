# KE Release 集成与生产发布

RoBrowser 不再 checkout KoreEngine 源码或在 Actions 中编译 KE。生产流程只下载 `parkerjj/KoreEngine` 的最新稳定 GitHub Release；解析一次版本后固定 tag/asset ID，同一个已验证 package 同时进入 IWA 和 Web。

## 创建 KE_REPOSITORY_READ_TOKEN

PAT 在 **GitHub 个人设置**生成，不在 KE 仓库 Settings 中生成：

1. 打开 [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens/new)，或头像 → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token。
2. 名称可设为 `RoBrowser-KE-release-read`，选择适当有效期，例如 90 天，并记录续期时间。
3. Resource owner 选择 `parkerjj`。
4. Repository access 选择 **Only select repositories**，仅选择 **KoreEngine**。
5. Repository permissions 中只设置 **Contents: Read-only**；Metadata 的只读权限由 GitHub 自动附带。无需 Actions、Workflows、Administration 或任何写权限。
6. Generate token，复制一次性显示的完整值。不要发送到聊天、写入代码或保存到仓库文件。
7. 打开 [RoBrowser repository Actions secrets](https://github.com/parkerjj/LROBrowser/settings/secrets/actions) → New repository secret，Name 填 `KE_REPOSITORY_READ_TOKEN`，Secret 填 token，保存。

也可将相同 secret 配置在 RoBrowser Settings → Environments → production；获取 KE 的 job 使用该 Environment，环境同名 secret 优先。建议把 production 和 production-web 的部署分支都限制为 main。

PAT 属于创建者账号，并被限定只能读取 KE。RoBrowser 自带 `GITHUB_TOKEN` 无法通过提高本仓库 permissions 来访问另一个私库。权限依据见 [GitHub token 说明](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)、[Release asset 权限](https://docs.github.com/en/rest/releases/assets#get-a-release-asset)。

RoBrowser **不需要** `KE_CORE_KEY`、license 私钥或 Rust/Binaryen/wasm-bindgen 工具；这些只属于 KE 自身的构建流程。现有 IWA 签名、R2 和 Surge 配置保持原要求。

## 生产 job 顺序

1. `lint`、`test`：现有检查。
2. `fetch-ke`：只在 main push/手动运行并通过检查后进入 production Environment；用只读 PAT 读取 latest 稳定 Release，解析 tag 的真实 commit，下载四个固定附件并验证。
3. 上传 `verified-ke-release` Actions artifact，只包含已验证 package 与 `release.json` 来源记录，不含 PAT。
4. `build-production-iwa`、`build-web`：分别下载同一个 artifact、严格导入 package，再构建 IWA/Web。设置 `KE_REQUIRE_PACKAGE=1`，缺失或损坏不得使用可选 KE 的降级路径；构建后验证实际分发目录的 packageId 与来源一致。IWA 压缩后也必须保持 KE 自身 manifest 有效。
5. `release-iwa`、`deploy-web`：**均依赖两端构建成功**，之后才允许 IWA 签名/R2/GitHub 发布和 Surge 部署。任何 KE 下载、校验、导入或任一端最终校验失败，均阻止两端生产发布。

PR/非 main 分支 push 保留不使用生产 secret 的普通 CI bundle；tag push 不发布生产。非 main 手动运行也不会生产发布。两个发布 job 在写入生产前再次核对 source SHA 仍是当前 main。

## 校验与失败行为

- latest 必须是完整稳定 Release，拒绝 draft/prerelease；tag 必须指向包 manifest 中声明的 commit，而非仅信任 `target_commitish` 字符串。
- 附件固定为 `kore-engine.tar.gz`、`.sha256`、`manifest.json`、`ltsd-build-manifest.json`；检查 GitHub asset digest、archive checksum、packageId、逐文件 hash/长度和完整文件集合。
- package 必须为 release、clean source，且 buildId/commit 与已解析来源一致。
- 限制下载/解压大小；只接受普通文件/目录 USTAR，拒绝链接、路径穿越、特殊条目、重复文件、非法结尾和额外 payload。
- 私库 API 的 PAT 不会转发到不同 origin 的 asset 下载重定向。
- 没有稳定 Release、token 缺失/过期/权限不足、附件不全、包不兼容、导入或最终分发目录损坏：全部失败，不发布无 KE 的客户端，不回退旧包。

Actions summary 的 `release.json` 记录 KE tag、commitSha、buildId、packageId、archiveSha256，便于定位实际集成版本。

## 首次发布与升级

### Web 托管必须提供跨源隔离响应头

2026-10-23 的线上检查发现 `https://game.ltsd.ro/` 缺少以下响应头；KE 的 SharedArrayBuffer Worker 需要跨源隔离。因此 `build-web` 在上传产物前运行 `--verify-web-hosting`，缺少隔离头或 Permissions-Policy 禁用隔离时失败，从而阻止 IWA/Web 两端生产发布。本次没有修改线上响应头。

可在 Cloudflare 的 ltsd.ro zone → Rules → Overview → Create rule → Response Header Transform Rule 中配置：

- 匹配表达式：`http.host eq "game.ltsd.ro"`，覆盖该主机的页面与 Worker 资源。
- 使用 **Set static** 设置 `Cross-Origin-Opener-Policy: same-origin`。
- 使用 **Set static** 设置 `Cross-Origin-Embedder-Policy: require-corp`。
- 不要通过 `Permissions-Policy` 禁用 `cross-origin-isolated`。

`require-corp` 要求跨源资源满足 CORP 或 CORS。门控也接受 `credentialless`，但该值会移除跨源 no-cors 请求携带的凭据，应结合资源加载方式选择，不能盲目替换。配置说明见 [Cloudflare 官方文档](https://developers.cloudflare.com/rules/transform/response-header-modification/create-dashboard/)、[浏览器跨源隔离要求](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)。

配置完成后运行 `node scripts/kore-local.mjs --verify-web-hosting` 确认。响应头检查是托管层预检，不代替真实浏览器中的资源加载与授权验收。

### 上线顺序

1. 先完成 KE main 的生产 Release，确认附件齐全。
2. 新版 KE workflow 在创建 Release 前自动向 LTSD 登记并确认指纹；确认对应 Actions summary 有登记成功回执，无需手工维护 `KE_BUILD_MANIFEST` 或为每次 KE 更新部署 LTSD。
3. 配置本仓库只读 PAT 和 Web 隔离响应头，提交发布流程变更，再 push/手动运行 RoBrowser main。
4. 查看 fetch-ke summary，确认 IWA/Web 使用同一 packageId。

KE Release 不会自动触发本仓库的新构建。RoBrowser main 开始获取 KE 时选择当时最新的**已发布**稳定版本；两仓同时 push 时，正在构建的 KE 不会被当成已发布版本。先等 KE Release 成功，再发布 RoBrowser。

两端共同门控保证所有 KE 集成检查在任何生产写入前完成；R2 和 Surge 是独立发布系统，发布阶段本身没有跨系统原子事务。
