# LastRO 冒险者募集 / 副本集成

## 来源与可信范围

依据用户提供的 LastRO 官方浏览器 `Online.js`（2026-10-12，注意这不是本仓库 vendored V2 运行时）。官方模块包含 `UI/Components/PartyBooking/PartyBooking`、`PartyBookingReg`、`BookingDescription`。**原文件只引用 `DB/AgencyTable`，没有给出这张表的实现或完整 IID 对照表，因此不能从它还原默认副本目录。**

该功能不是标准 Ragnarok Online 募集 UI 的纯样式更换：它是**独立 HTTPS 招募板 + LastRO 扩展游戏封包**的组合。游戏内加入队伍和副本校验仍是游戏服务器负责。

## 原始协议

HTTP: `POST https://game.lastro.cn/{webserver|webserver2}/party/{action}`，`ClientVer===5` 时使用 `webserver2`，否则 `webserver`。全部 multipart FormData，始终发送 `AuthToken`、`AID`、`GDID`、`WorldName`。

| action | 说明 | AID 取值 | 额外数据 |
|---|---|---|---|
| list | 查询全部募集 | `Entity.GID` | 无 |
| get | 查询自己发布的信息 | `Entity.GID` | 无 |
| info | 单条详情 | `Entity.GID` | `QueryAID` |
| search | 按备注搜索 | `SessionStorage.AID` | `GID`, 4种角色各 1, `MinLV`, `MaxLV`, `Memo` |
| add | 新增/更新信息 | `SessionStorage.AID` | `GID`, `CharName`, `IID`, `Type`, 4种角色各 1, 等级区间, `Memo`, `ISTATE` |
| del | 删除募集 | `Entity.GID` | 无 |

普通募集 `Type=0`，副本募集 `Type=1`；`ISTATE=0` 表示招募中，`1` 表示挑战中。原版“创建冒险家募集”按钮已禁用，只允许队长创建副本公告。字符串使用 LastRO `UrlTools` GBK 百分号转义约定。

| 发出封包 | 数值 ID | 响应 | 功能 |
|---|---|---|---|
| `CZ.REQ_CREATE_INSTANCE` | 3057 (0x0BF1) | `ZC.RS_CREATE_INSTANCE` 3058 | 队长创建副本；响应 `rs=1` 后才能向 HTTPS `party/add` 注册 |
| `CZ.REQ_DEL_INSTANCE` | 3059 (0x0BF3) | `ZC.RS_DEL_INSTANCE` 3060 | 关闭副本；`rs=1` 删除对应 HTTP 公告，`rs=2` 服务端已清理 |
| `CZ.REQ_ENTER_INSTANCE` | 3061 (0x0BF5) | `ZC.RS_ENTER_INSTANCE` 3062 | 带目标 `AID`、`CID` 以及**精确副本名称**的进入请求 |

普通募集加入队伍使用 `PARTY_REQ_MASTER_TO_JOIN`，队长已同队时去目标地图使用 `PRIVATE_AIRSHIP_REQUEST`，道具 ID 为 14527。

## 本次移植

- 原生 BasicInfo 顶栏“募”字按钮入口；Shadow DOM 独立深色未来科技风面板。
- 招募中 / 挑战中 / 我的募集三标签、服务端 HTTP 列表及搜索、10 条分页、查看详情、队伍申请/副本进入。
- 已登录队长创建：必须先由游戏服务器响应确认副本建立，才向 HTTP 公告板登记，不伪造成功。
- 编辑、关闭公告及关闭副本：不同公告类型分别使用 HTTP / 游戏封包操作。
- 默认目录来自原版的 `DB/AgencyTable[ClientVer]`；这个源文件**没有这张表的数值数据**。本版因此没有编造选项。支持用户自行维护 `IID`、副本名称和分类的本地目录（按照服务器 profile 分开），不向服务器擅自发布新类型。

## 局限 / 后续联调

1. **真实服游戏封包支持**：本仓库当前 vendor V2 核心能否解析/编码三对 LastRO 扩展封包，尚未通过真实运行时检查。控制器会检查封包构造器和 ACK，缺少时明确报错而不是假成功。全功能移植还需要注册这些结构及对应 `ZC` 回调；仅新增面板还不代表联调完成。
2. **跨域**：独立 IWA `isolated-app://` 和浏览器网页不是 LastRO 官方 `https://game.lastro.cn` 同源环境。服务端是否对其提供 CORS 及 cookie/CSRF 许可无法从 `Online.js` 推出；实际 HTTP 需要登录游戏后验证。遵守仓库限制：未新增代理、bridge、或可执行远程脚本。
3. **缺少官方副本白名单**：从官方发行物中的 `DB/AgencyTable` 补齐 IID–名称表之后才能无缝显示旧版所有副本且直接选择创建。
4. **新增副本的服务端限制**：客户端自定义目录只映射 IID 与名称。若 LastRO 使用类似 rAthena 的实例框架，实际新实例还需要服务器实例数据库、地图/NPC 脚本及服务端校验支持；客户机 Lua 文件 `seekparty/party_booking_config.lub` 只是另一套招募/目标地图资料，不能实现真正的新副本。
5. **禁止声称已联通**：协议/静态检查不等于在官方登录角色上完成端到端测试；必须在测试账号上依次测试查询、详情、创建、关闭、进本、中文备注。

> 安全边界：认证信息仅发送给源码确认的 `game.lastro.cn` 主机；服务器字符串全部通过 `textContent` 写入；不进行自动创建、自动删除或后台轮询。
