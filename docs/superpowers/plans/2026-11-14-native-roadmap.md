# 原生安装包：计划总览与拆分

**设计文档：** `docs/superpowers/specs/2026-11-12-tauri-native-packaging-design.md`（含第 13 节验证结论）

设计覆盖了好几个相互独立的子系统，一份计划装不下。按下面的顺序拆成几份计划，每份单独做完都能得到可运行、可测试的成果。计划 1（技术验证）已完成。

| 计划 | 内容 | 成果 | 状态 |
| --- | --- | --- | --- |
| 1 | 技术验证 spike | 设计文档第 13 节的结论 | 完成 |
| 2 | **KE 队列模式开关** `keQueueMode`（KE 仓库 + RoBrowser） | 没有 SharedArrayBuffer 的环境里 KE 照常运行；IWA 行为不变 | 代码完成（夹具层验证，见设计文档 §13）；真实环境验证要等 KE 正式发布 |
| 3 | **原生核心**：Tauri 工程、Rust 连接器、`native` 构建目标、前端接入、窗口与多开 | Linux 开发机和 Windows 上能 `cargo tauri dev` 玩起来 | 已写：`2026-11-14-native-core.md` |
| 4 | 桌面打包与自动更新：Windows NSIS、macOS dmg（签名+公证）、Linux deb/rpm、更新清单、`native-release.yml` | 三个桌面平台的安装包，应用内自动更新，发布到 GitHub Release 与 R2 | [实施计划](2026-11-19-native-desktop-release.md) |
| 5 | Android：保活前台服务、自更新、apk 签名与发布 | 可安装的 apk，后台保持在线，应用内更新 | 计划 3 完成后再写 |
| 6 | 国产 Linux（麒麟、统信）适配 | deb 在目标系统可装可用，或按用户决定的备选方案 | **被阻塞**：需要一台目标机器（设计文档 §9 第 9 项） |

**为什么后面的计划现在不写：** 计划 4、5 依赖计划 3 里确定下来的命令名、事件格式、目录结构；现在写会写成猜测。计划 2 和计划 3 彼此独立，可以按任意顺序做，建议先做计划 2（改动小、风险低，并且本身对 IWA 也有价值）。

**跨计划的共同约束：**
- 开发分支：`feat/tauri-native`。每份计划的代码改动提交在该分支（计划 2 里 KE 仓库的改动在 KE 仓库自己的分支上）。
- 现有 IWA 与 web 发布流程不得改变：`ci-release.yml` 不动；`pnpm build` 与 `pnpm build:web` 的产物必须与改动前一致。
- 不推送、不发布、不签名，除非用户当场明确要求。

**需要用户亲自处理的事（任何计划都无法代做）：** 在 GitHub 的 `production` Environment 里配置 secrets（计划 4、5 用到）；Windows 真机的 SmartScreen 检查；国产 Linux 机器信息。
