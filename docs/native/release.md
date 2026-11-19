# Native 桌面发布

合入 `main` 后，IWA 与 Web 使用既有工作流。IWA 签名发布成功后，Native 发布复用该次运行的版本和已验证的 KoreEngine 包，构建 Windows x64 NSIS、macOS universal DMG 和 updater 归档，以及 Linux x86_64 和 aarch64 的 DEB／RPM。手动触发 Native 时传入同一提交的 `iwa_run_id`，该次 IWA 运行的产物需仍在保留期内。

四种构建都使用完整的 IWA 版本号，例如 `1.1025.261120`。Windows EXE 的数字版本资源使用 `MMdd`，例如 `1.1025.1120.0`。Native 更新清单、已签名的版本和客户端显示使用完整版本号。

全部平台产物就绪后，发布任务核对 `main` 的提交，验证 Tauri 签名和签名内的版本，再上传 `native/<version>/`。R2 公开地址可读取全部安装包后，任务更新 Native 固定清单并将产物附到 GitHub Release `native-<version>`。构建不齐或校验失败时，沿用上一轮 Native 更新清单。

如果打包完成后发布失败，在原 Native 运行中重跑失败的任务，以复用同版本已签名的安装包。

| 清单 | 客户端 |
| --- | --- |
| `https://client.ltsd.ro/native/latest.json` | Windows 和 macOS 自动更新，以及 IWA 登录页的 EXE／DMG 下载入口 |
| `https://client.ltsd.ro/native/linux.json` | Linux x86_64 和 aarch64，按实际安装的 DEB 或 RPM 选包 |

更新清单采用禁止缓存的响应头，版本目录的安装包保持不可变。若 `client.ltsd.ro` 使用自定义缓存规则，固定清单应走绕过缓存规则。Native 的 GitHub Release 使用独立标签，保留 IWA 的 GitHub 最新版本选择。

## GitHub production 环境

| 类型 | 名称 |
| --- | --- |
| Variable | `NATIVE_UPDATER_PUBLIC_KEY` 为 Tauri signer 生成的 `.pub` 文件内容，随客户端打包 |
| Secrets | `TAURI_SIGNING_PRIVATE_KEY` 和有口令时的 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` |
| macOS Secrets | `MACOS_CERTIFICATE_P12_BASE64`、`MACOS_CERTIFICATE_PASSWORD`、`MACOS_SIGNING_IDENTITY`、`ASC_KEY_ID`、`ASC_ISSUER_ID`、`ASC_PRIVATE_KEY` |
| 既有配置 | `KE_REPOSITORY_READ_TOKEN`，以及 IWA 当前使用的 `R2_ACCOUNT_ID`、`R2_BUCKET`、`R2_ENDPOINT`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY` |

Windows 安装包沿用既定的不做 Authenticode 签名方案，供更新的文件仍写入 Tauri 签名。macOS 安装包还需要 Developer ID 签名和公证。Linux 使用 Tauri Updater 对 DEB／RPM 的安装支持，系统授权由 Linux 软件包安装机制处理。连续版本使用同一个 updater 公钥。

## 验收

- 本地测试使用临时 Tauri 密钥和模拟 R2 验证发布顺序，以及拒绝旧版本和签名不匹配的产物。
- IWA 登录页提示安装桌面客户端，提供 Windows EXE 和 macOS DMG。安装后使用原游戏账号登录。
- Native 登录页可手动检查更新。应用启动时也会检查，运行期间每六小时再检查。找到新版时，应用会提示下载，验签通过后可安装并重启。
- 发布首版 N 后，用每个平台的正式安装包验证启动和游戏。下一版 N+1 发布后，在各平台已安装 N 的电脑上验证检查、下载、更新、重启和账号数据保留。Linux 验收覆盖 DEB 与 RPM。
