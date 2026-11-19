# Native 桌面发布实施计划

继续实现原生打包路线图的计划 4。使用独立的 Native GitHub 工作流，IWA 和 Web 继续运行原有发布工作流。Android 安装与更新按路线图计划 5 实施。

1. 在 `.github/workflows/native-release.yml` 中构建 Windows x64 NSIS、macOS universal DMG 和更新归档，以及 Linux x86_64 / aarch64 的 DEB 和 RPM。复用同一版本号、官方 KE 包校验与 Tauri 更新签名。汇总完整构建矩阵后再次检查当前 `main` SHA，再发布。
2. 在 `scripts/publish-native-r2.mjs` 中验证安装包签名及签名版本，向独立的 `native/<version>/` 前缀上传文件及校验值，随后发布桌面和 Linux 更新清单。测试缺失或损坏的文件、版本倒退、重复发布和 R2 条件写冲突。
3. 在 `native/src-tauri/src/updater.rs` 接入 Tauri Updater。签名发布配置指定公钥和清单地址。启动及每六小时检查一次，玩家确认后下载安装。使用固定版本的 Tauri 官方 DEB／RPM 更新支持，替代设计初稿里的自建 Linux 安装流程。
4. 检查 Workflow 语法和发布输入，跑 R2 模拟写入、旧版／新版签名对照，以及有效和篡改签名的本地更新测试。记录能在本机验证的平台和首发后需要实测的步骤。
