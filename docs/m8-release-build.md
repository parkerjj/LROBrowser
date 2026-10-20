# M8 KE 发布构建

RoBrowser 的 IWA 生产发布会在 `production` GitHub Environment 中构建 KoreEngine。构建完成后，KE package 会进入同一次 IWA build、审计、签名和发布流程；Pull Request 与非 `main` 分支的 CI 构建不会访问生产密钥。

## Production secrets

在 RoBrowser 仓库的 GitHub `production` Environment 中配置：

- `KE_CORE_KEY`：AES-256-GCM 使用的 32 字节 CoreKey，以 Base64 字符串保存。它只传给 KE 打包步骤。
- `KE_REPOSITORY_READ_TOKEN`：对私有仓库 `parkerjj/KoreEngine` 具有 `Contents: Read-only` 权限的 fine-grained token，用于跨仓库 checkout。不要授予写权限。

现有 IWA 签名和 R2 发布 secrets 仍按 workflow 原有要求配置。Action 在开始编译前检查上述 KE secrets 是否存在，不会输出它们的值。

## 仓库公开配置

KE 仓库的 `config/release-build.json` 保存 `coreKeyVersion` 和 `licensePublicKeys`。这里的 Ed25519 license 公钥不是秘密，会随代码提交；私钥不用于客户端打包。轮换 CoreKey 时更新 CoreKey secret 与 `coreKeyVersion`，轮换 license 验签密钥时在 `licensePublicKeys` 中保留仍需验证的旧 `kid` 并加入新公钥，然后提交 KE 变更。

`build_id` 是字符串，不是递增数字。release builder 从 KE commit 生成 `<7 位 short SHA>-<UTC YYYYMMDDHHmm>`，例如 `3a26c3c-202610200708`。不需要手动设置 `KE_BUILD_ID`。IWA release job checkout 与触发发布的分支同名的 KE 分支，因此两仓需有对应分支。

## 触发行为

- Pull Request 和非 `main` 分支 push：只运行无生产密钥的 CI build。
- `main` push 或手动触发：进入现有 `production` release job，checkout KoreEngine、打包并合并到 IWA，再执行正式审计、签名和发布。
- KE 构建使用仓库固定的 Rust `1.99.0`、`wasm-bindgen` `0.2.129` 与 Binaryen `133`。
