# 原生 Rust 与 IWA WASM 迁移计划

## 目标

逐项迁移适合 Rust 的模块，让 Native 使用系统能力和纯 Rust 算法，让 IWA 通过包内 WASM 复用纯计算代码。按玩家实际感受到的进图时间、切图卡顿、多开内存，以及数据解析的可靠性评价收益。

## 架构

纯计算只收发字节和类型明确的数组。同一份 Rust 核心可编译为原生库和 WASM。浏览器调用沿用现有 Worker，按资源或任务批量跨边界。Native 宿主已有的网络、资源读取和窗口生命周期继续由 Tauri 与 Rust 负责。DOM、输入、浏览器存储、WebGL 状态和帧调度继续在 JS 中编排。

正式代码放在一个 `crates/lro-asset-decode` crate 中。内部按格式划分 `spr`、`act`、`gat`、`gnd`、`rsw`、`rsm` 和 `str` 子模块，共用小端读取、长度检查和分配预算。入口接收文件类型和字节，按格式返回精灵帧、碰撞格、场景记录或模型数据。浏览器 Worker 随客户端加载一份 WASM，每次按完整资源调用。Native 能直接使用 Rust 库，是否走宿主调用取决于完整路径中 IPC 和缓冲区复制的成本。

解析、构网和上传分阶段。GAT 沿用当前 `MAP_ALTITUDE` 回包中的宽高和每格五个数，维持寻路、鼠标落点和高度计算的语义。GND、RSW、RSM 的解析可进入同一库，构网另设入口，GPU 纹理与缓冲仍由现有 WebGL 管理。普通 PNG、JPEG 和音频继续用浏览器内置编解码。

首批上线采用现有 JS 路径与候选 Rust 实现并行对比。同一输入先比输出，再比完整调用链。根据端到端结果，选择 Native 直连 Rust、两端共用 Worker WASM，或保留优化后的 JS。

实现依据见 [原生客户端设计](../specs/2026-11-12-tauri-native-packaging-design.md) 和仓库约定。基准使用 Node 24、Rust 1.99.0 和 `wasm32-unknown-unknown`。[Rust WASM 平台支持](https://doc.rust-lang.org/rustc/platform-support/wasm32-unknown-unknown.html)

## 已完成的基准

仓库自带 4 个 SPR 2.1 文件，共 55 个索引帧、41,085 个输出像素。每批重复读取这组帧 80 次，共 4,400 帧，采样 21 批。全部像素同现有加载器逐字节一致。Rust 单测覆盖零游程、尾部补零、截断和输出越界。

| 解码方式 | 中位耗时 | P95 耗时 |
| --- | ---: | ---: |
| 现有 JS RLE 循环 | 14.51 ms | 15.98 ms |
| 减少逐像素写入后的 JS | 5.22 ms | 5.67 ms |
| Rust/WASM，包含输入和输出复制 | 2.99 ms | 3.19 ms |
| 原生 Rust 解码，含输出分配 | 1.53 ms | 1.58 ms |

用游戏的普隆德拉和吉芬 GAT 1.2 再做对照，共 179,904 格。每批重复解码两张图 8 次，采样 21 批。四角高度和地形标志与现有 Worker 逐字节一致。内置合成样本还覆盖了高位地形编号、未知编号与负零，同一 Rust 测试入口验证了截断、尺寸溢出和输出不足。

| GAT 解码方式 | 中位耗时 | P95 耗时 |
| --- | ---: | ---: |
| 现有 Worker JS 解析 | 50.06 ms | 52.76 ms |
| Rust/WASM，包含输入和输出复制 | 7.08 ms | 8.52 ms |
| 原生 Rust 解码，含输出分配 | 5.03 ms | 5.16 ms |

复测环境是 Windows、Ryzen 9 9950X3D、Node 24.21.0。两个格式使用同一份约 18.6 KiB 的 WASM 原型，单次实例化约 0.33–0.36 ms。两张 GAT 来自官方被动资源目录。各表只量对应解码阶段，原生数字不含 Tauri IPC。完整 Worker 调度、进图耗时和长会话内存按游戏流程实测。[普隆德拉 GAT](https://game.lastro.cn/ro/client_re/data/prontera.gat) · [吉芬 GAT](https://game.lastro.cn/ro/client_re/data/geffen.gat)

```sh
rustup target add --toolchain 1.99.0 wasm32-unknown-unknown
node test/benchmarks/spr-rle.mjs
node test/benchmarks/gat.mjs
node test/benchmarks/gat.mjs generated/rust-map-benchmark/prontera.gat generated/rust-map-benchmark/geffen.gat
```

## 模块顺序

| 顺序 | 模块 | 实施方向与依据 |
| --- | --- | --- |
| 1 | SPR、GAT 与资源缓冲区归属 | 这两个格式已通过定位实验。先验证完整 Worker 路径和缓冲区复制次数，再开启正式后端。 |
| 2 | GND、RSW、RSM／RSM2 | 分别迁移地表、光照图和水面记录，场景对象、灯光和音效引用，以及模型网格、材质与动画。按版本加对照夹具。 |
| 3 | ACT、调色板、STR、TGA | ACT 对照精灵层、帧索引、偏移和时长。调色板核对透明索引。STR 对照特效层和关键帧，TGA 对照 RLE、行方向和透明通道。根据实测决定默认启用范围。 |
| 4 | 大地图寻路 | 在现有 `PathFindingWorker.js` 的堆队列基线上测试。复用已经装好的碰撞网格，比较一系列查询的实际耗时，并保持路径和同权重顺序。 |
| 5 | Native 资源缓存、协议处理 | 已有 Rust TCP、TLS、官方中转和资源协议。用现有命令验证背压、生命周期和错误语义。根据真实跟踪试验原生文件缓存或批量二进制解析。 |
| JS | 登录与游戏 UI、输入、浏览器存储、WebGL | JS 管理 DOM、账号 IndexedDB、WebGL 资源上下文与设备恢复。Rust 接管有明确边界的解析、网格和其他纯计算。 |

## 第一批可独立验收的工作

### 本地试点进度

正式 Rust 核心位于 `crates/lro-asset-decode`。IWA、Web 和 Native 配置都构建并打包同一个 WASM，在可执行清单中记录字节数和哈希。主线程在启动 `Online.js` 前加载解码器，Worker 在交付对应格式的资源前等待自己的实例就绪。

SPR、GAT、GND、RSW、RSM／RSM2、ACT、STR 和 TGA 已使用 Rust 单一解码实现。GND 的光照、阴影和地表／水面网格以及 RSM 的法线和静态网格也在 Rust 生成。Worker 将地图缓冲区转移给渲染线程。渲染状态、GPU 上传和动画播放调度由客户端现有入口管理。

资源缓存的一次重复复制已删除。4 MiB 缓存命中的全部 JS 整段复制由三次变成两次，两个同时读取同一资源的消费者仍各有可转移的缓冲区。后续再逐段测量其余副本的归属。

已收集普隆德拉和吉芬的 GND 1.7 与 RSW 2.1 文件到忽略的本地测试目录。GND 网格分别为 156×196 和 120×120，可作为下一批地表、光照和网格输出的真实夹具。

### 1. 测量完整 SPR 和 GAT Worker 路径

- [x] 用 `test/benchmarks/spr-rle.mjs` 比较四种实现，并逐字节核对仓库素材。
- [x] 用 `test/benchmarks/gat.mjs` 比较现有 Worker、Rust 原生和 Rust/WASM。两个格式共用 `test/benchmarks/asset-decode.rs`。
- [x] 核对 `vendor/v2/Online.js` 中 `SPR.load` 的同步调用。实际接入在同一同步入口批量交给 Rust，避免改变调用者的等待和返回约定。
- [ ] 扩展测试输入，覆盖现有 raw 索引帧、RGBA 帧、调色板和真实大批精灵。素材使用仓库已有文件或两个获准的被动资源来源。结果保存文件大小和批大小，区分冷启动和热缓存。
- [ ] 记录 Chrome IWA、Windows WebView2 的首批解码耗时、Worker 往返 P50/P95、每批复制字节和进图阶段耗时。同批输入对比现有 JS、优化 JS 和 Rust/WASM。对 Native 宿主 Rust 选项计入 IPC，并验证 Chrome IWA 无 Native API 时能运行。

### 2. 移除可避免的资源复制

- [x] 用 `test/runtime-resource-loader.test.ts` 验证两个共享消费者的行为，并用 `test/resource-resolver.test.ts` 验证 IndexedDB 返回的缓冲区转移后仍可再次读取。
- [ ] 核对 `src/resources/resource-cache.ts`、`src/resources/resource-resolver.ts` 和 `src/resources/runtime-resource-loader.ts` 中数组所有权。删除可避免的缓存命中副本，保留共享读取及转移所需的独立缓冲区。重复 4 MiB 命中的复制跟踪并重跑资源加载、地图校验与损坏缓存重取测试。

### 3. 植入首个共享 Rust 核心

- [x] 从已验证的 SPR 2.1 索引 RLE 开始。Rust 核心实现区分截断和输出越界，测试覆盖零计数和尾部补零、批量帧与下一段文件偏移。
- [x] 本地构建实现 SPR 索引解码和 GAT 的 WASM 适配。原始帧、RGBA 和调色板仍用当前路径。Chrome Worker 已验证 WASM 正常和缺失两条路径，包内 WASM 已通过 `pnpm audit:iwa`。
- [ ] 对照任务 1 的完整路径数据决定默认后端。为 Native、IWA 和 web 跑两种解码路径的回归，本机 Native 实测登录、进图、反复切图和多开，再核对结果和峰值内存。将正式 WASM 与加载胶水同时列入本地可执行资源清单，运行 `pnpm audit:iwa`。

### 4. 按数据推进其他格式与寻路

- [ ] 将 GAT 纳入同一 crate，保留宽高和现有碰撞位标志。利用 `test/map-binary-fixture.ts` 为接入路径补齐尺寸、坡面、截断、未知标志与实际寻路对照。经现有 `LastROThreadEventHandler.js` 入口对照 `vendor/v2/ThreadEventHandler.js` 的地图解析结果。
- [ ] 分别记录 GND、RSW、RSM 的解析、构网和上传耗时。GND 验证贴图索引、光照图内存上限和分区水面。RSW 验证版本相关对象、负坐标和文件引用。RSM／RSM2 验证动画层级、顶点顺序、UV 与索引，再用多次切图验证旧地图资源释放。
- [ ] 将 ACT、调色板、STR、TGA 各自纳入同一格式表。按实际资产文件逐格式做对照，分别覆盖缺帧、透明像素、截断特效帧和 TGA RLE 行方向，按现有调用的等待时间与内存峰值决定迁移顺序。
- [ ] 在 `test/lastro-navigation-worker.test.ts` 扩充同图热查询、连续换图、无路可达和等权路径的样本。沿用当前 Worker 协议，核对同权重顺序、取消和换图后结果隔离，再决定 Rust 版本的启用范围。

## 验收边界

- 每个候选都应有真实输入输出对照和部署目标的端到端数据。已迁移的格式验证包清单、初始化失败提示和 Worker 错误回报。继续记录延迟、内存和长会话行为。
- 原生账号凭据保持现有 IndexedDB 账号流程。沿用既有官方连接模式与两处被动资源来源。IWA 的可执行 JS、Worker、WASM 和 Lua/LUB 随包检验。
- 同一进图实验覆盖高 DPI、多开和重复切图，分别记录 CPU 解码与上下文丢失。浏览器事件与 WebGL 资源恢复按渲染路径验收。[Khronos WebGL 规范](https://registry.khronos.org/webgl/specs/1.0.2/)
- Windows 外，Linux WebKitGTK 和 macOS WKWebView 的实机结果需要各自记录。初次加载、模块加载失败和热更新后的资源清单一致性也在验收中覆盖。
