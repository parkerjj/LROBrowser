# LRO助手集成（0.4.19）

本模块由加藤惠开发维护，集成于LRO 进阶客户端。版本保留在源码与诊断中，游戏界面不展示版本号。基于上游 f7f36ab0f8762c59ab5415ccd0e494f0a70b724b。

## 集成范围

客户端启动器按启动时的服务器 profile 初始化助手，数据存储于自身 IndexedDB。使用原生 GUIComponent、Common 按钮样式、纹理、光标、窗口焦点和滚动条。没有用户脚本加载或远程执行代码。

包含商店记录/搜索/购物清单/店铺标记与引导、当前目标、伤害统计、物品百科与地图、赏金入口、装备对比、物品总览、队伍血条、首领提示、手动物品搬运、自己时装显示、卡册与装备搭配切换。动作类功能调用客户端原生流程；各模块可独立开关。头像预览使用客户端已有功能，不重复提供助手预览。关于窗口保留署名及游戏内邮件反馈，不显示打赏或项目主页。

近期交互修复包括中文 IME 输入节点保留、隐藏元素不被按钮样式重新显示、系统/游戏双光标冲突、空白处浏览器右键菜单、标题栏随内容滚动，以及同名店/同栏位记录对应。

## 源码与维护

`src/assistant/lro-assistant-standard.mjs` 从既有助手标准版适配而来，已纳入仓库，可直接作为模块源码维护，构建无需原插件 TXT 或作者本机转换脚本。原始来源哈希保留在文件头。`scripts/patch-lro-assistant.mjs` 在构建时为固定的客户端 runtime 提供模块、封包订阅与原生组件桥；关键挂载点变化会使构建失败。生成物仍位于 generated/dist，不纳入提交。

## 网站市场

助手直接向 `https://ltsd.ro/api/v1/market/search` 发起只读 GET，请求不携带账号、密码、Cookie 或授权信息。输入搜索词后点击“查询”才发起请求，输入过程不会触发远程查询。关键词通过 `q` 传递；分页时保留 API 返回的 `nextCursor` 并作为下一次请求的 `cursor` 参数。IWA 来源需由 LastROWeb API 的 CORS 配置允许；IWA 分发审计仅允许这个精确 API 路径，不放宽该域名的其他路径或其他来源。

市场搜索仅读取公开列表数据，不参与游戏连接，也不访问客户端账号存储。

## 验证

使用仓库固定 Node/pnpm 环境执行 `pnpm lint`、`pnpm typecheck`、`pnpm prepare:runtime`、`pnpm test:assistant`、`pnpm build`。

针对助手的检查：

```sh
node --test test/lro-assistant.node.mjs test/lro-market-api.node.mjs
pnpm exec vitest run test/lro-assistant-integration.test.ts test/lro-navigation-audit.test.ts
node --test scripts/lro-local/local-market.test.mjs
node --input-type=module -e 'import {auditDist} from "./scripts/audit-iwa-dist.mjs"; await auditDist("dist", "release/lro-assistant-audit.json")'
```

已有 Chrome 离线 UI 验证使用真实 GUIComponent/Common/ScrollBar 和模拟游戏数据；不等于实服全模块验证。还需验收换角色、商店数据和词条、目标怪物资料、队友施法、移动/导航、卡册/装备切换及正式包市场跨域行为。静态怪物参考资料的来源和 GPL-3.0-or-later 许可见 lro-monster-reference.md，维护者需审阅整体许可兼容性。

不包含账号、浏览器配置、个人记录、生产私钥或本机运行环境。

## 0.4.17 上游同步

已合并上游 PR #3（a91ac3c），保留账号加密存储模块、启动检查、界面/移动/动画修复及资源完整性审计。助手补丁在上游补丁全部完成后接入；本地市场服务沿用客户端统一响应头。导航测试使用真实资源哈希和运行时别名验证，不放宽上游审计。正式包市场跨域仍待维护者确认。

同时保留后续 f7f36ab 的发布压缩后资源摘要更新，未覆盖维护者的发布修复。世界地图接口改接新版原生资料加载与传送回调，沿用资源预检与地图/账号状态检查。

## 与当前 Development 整合

按 `Development` 的 `f99602f` 整合 PR #4 的 `c0cd1d2`，结果保存在 `parkerjj:feat/lro-assistant-integration`，供维护者继续手动调整。保留当前 IWA/Web 构建、连接模式选择、账号存储、登录偏好和资源封装流程。助手在现有 runtime 产品补丁完成后接入，不恢复已经迁入 vendor 的旧 host transforms。

原生 VM 测试加载实际助手帮助函数；WorldMap 比较夹具按模块名提取可信 DOM 依赖，不依赖 import 的位置，也不放宽结构检查。助手模块及所有可执行依赖进入包内清单；正式市场代码使用同源请求，外部百科地址仅用于用户导航。

整合验证：170 个 Vitest 文件、4644 项测试，以及 40 项助手/市场/本地服务 Node 测试通过；lint、typecheck、IWA/Web 构建、IWA 审计和本地开发服务入口检查通过。完整测试在同一份源码的临时验证副本中运行，避开隔离工作树路径中的 `.codex` 与 Vite 文件访问禁用规则的冲突；使用 `NODE_OPTIONS=--max-old-space-size=8192` 运行大型 AST 检查。未运行依赖签名发布物的 release smoke 检查。

### 合入 Development 前需要手动处理

PR 原有的助手安装流程只在页面启动时打开一次数据库，而当前登录页允许在同一页面切换服务器。切服不会重新绑定助手数据库，商店记录仍写入启动时的服务器库；跨服相同 AID/GID 的角色资料可能混用。现有测试验证独立数据库实例的隔离，不覆盖同页切服。需要为助手补充服务器切换生命周期及回归验证；在此之前，切服后重新加载页面再使用助手。此次冲突整合保留现有登录页的即时切服流程，不额外引入强制重载。

## 0.4.18 商品详情百科入口

详情窗口保留当前商品记录，百科按钮优先使用该窗口实际显示的商品，兼容网站市场与本地记录。刷新列表不会让已经打开的详情失去百科入口，关闭后清理记录，再打开其他商品不会串用旧物品。新增两项入口回归覆盖网站/本地来源、列表刷新、关闭与切换商品。
