# LastRO 官方封包对齐记录（1.js）

本文记录 RoBrowser 与 LastRO 官方 `Online.js`（下称 **1.js**，2026-10-23 取得的当前官方文件）在**封包层**的对齐结果：
官方新增了哪些封包、各自做什么、字节怎么解析，以及仓库做了哪些修改。

> 范围只限封包层：注册、长度、字节解析、客户端发包。对应的界面功能（组队申请弹窗、签到界面、自动技能下拉框等）
> 不在本次范围内——封包现在能被收下并解析，但没有挂接界面处理的包会被静默丢弃（与官方对待 `NAVIGATETO` 等包的做法一致）。

## 1. 原则

1. **只多不少**：凡是 1.js 能收、能发的封包，仓库都必须能收、能发；解析结果里 1.js 有的字段，仓库也必须有。
2. **长度以 1.js 的声明为准，但不盲抄**：官方源码里有几处声明与它自己的解析函数矛盾（笔误、重名覆盖），照抄会让原本正确的封包失步。这些见第 8 节，逐个写明了证据。
3. **两种布局都支持**：LastRO 对同一个封包可能出现“官方当前的 32 位布局”和“旧的 16 位布局”。凡是能从帧里剩余字节判断的，一律自动判断，官方布局排在最前；仓库原有的字段和布局保留。
4. **官方解析函数不等于服务器真实帧长**：官方很多结构没有声明长度，由解析函数读多少算多少。仓库的 `LASTRO_PACKET_LENGTH_OVERRIDES` 来自 LastRO/OpenKore 实测，实测值优先于官方解析函数推导出的长度（例如 `0x009d`，见第 8 节）。

## 2. 官方两个版本之间在封包层的变化

用旧版官方文件（约一个多月前）与 1.js 做结构对比，**封包层只有两处变化**：

| 变化 | 内容 |
|---|---|
| 新增 `0x06B2 HC.ACCEPT_ENTER2` | 字符服直接下发唯一的角色，见第 3.1 节 |
| `0x0221 ZC.NOTIFY_WEAPONITEMLIST` | 条目从 13 字节变成 23 字节：物品 ID 与 4 张卡片从 16 位变成 32 位，见第 6 节 |

同一次对比里还看到几处**非封包层**的变化，与封包解析无关，仅作记录：

- 2转服（`ClientVer` 5）包 ID 加密密钥由 `[1205481659, 453065404, 592073252]` 变为 `[1205481642, 453065386, 592073252]`，3转服不变；
- 3转服、2转服的游戏服 IP 都变为 `103.8.222.164`；
- 登录前新增 `mg/check`，返回 3 时提示“登录终端超限”；
- 官方客户端新增了 `game.lastro.cn` 域名校验。

仓库的 `src/servers/server-profiles.ts` 已经使用上述新密钥与新 IP。

> 说明：旧版文件从内容看并非纯官方文件（带 `window.__ROV1Dump` 收发包调试钩子、`/ro/lastro-api/` 接口路径、被去掉的域名校验等，应是 ROWeb 的本地改造），所以“旧版 vs 1.js”的差异里混有本地改造；上表只列确认属于官方封包层的部分。

## 3. 新增的接收封包

下列封包 1.js 注册而仓库此前没有注册。偏移均从帧首（包 ID 的第一个字节）算起；
变长包（长度 `-1`）在偏移 2 处有 2 字节的帧长，数据从偏移 4 开始。整数均为小端。

### 3.1 字符服：`0x06B1` 与 `0x06B2`

官方客户端在字符服连接上为下面三个包都挂了处理函数，它们都是对 `CH.ENTER` 的“进入成功”应答：

| ID | 名称 | 内容 | 仓库处理 |
|---|---|---|---|
| `0x006B` | `HC.ACCEPT_ENTER_NEO_UNION` | 槽位信息 + 角色列表 | 显示选角界面（原有） |
| `0x06B1` | `HC.ACCEPT_ENTER_NEO_UNION2` | 与 `0x006B` **字节布局完全相同** | 复用同一个处理函数，显示选角界面 |
| `0x06B2` | `HC.ACCEPT_ENTER2` | **只带一个角色**，不显示选角 | 记录该角色，等待随后的 `NOTIFY_ZONESVR` 进图 |

`0x06B1` / `0x006B` 布局（变长）：

| 偏移 | 长度 | 字段 |
|---|---|---|
| 4 | 1 | `TotalSlotNum`（packetver ≥ 20100413） |
| 5 | 1 | `PremiumStartSlot` |
| 6 | 1 | `PremiumEndSlot` |
| 7 | 1 | 计费占位 |
| 8 | 4 | `code` |
| 12 | 4 | `time1` |
| 16 | 4 | `time2` |
| 20 | 7 | 计费占位 |
| 27 | n×175 | 角色列表，每个角色一个 175 字节块（见下） |

`0x06B2`（变长，数据 175 字节）就是上表里的**一个**角色块，没有前面的槽位信息：

| 偏移（数据起点=0） | 长度 | 字段 | 偏移 | 长度 | 字段 |
|---|---|---|---|---|---|
| 0 | 4 | `GID` | 82 | 2 | `speed` |
| 4 | 8 | `exp` | 84 | 2 | `job` |
| 12 | 4 | `money` | 86 | 2 | `head` |
| 16 | 8 | `jobexp` | 88 | 2 | `body` |
| 24 | 4 | `joblevel` | 90 | 2 | `weapon` |
| 28 | 4 | `bodyState` | 92 | 2 | `level` |
| 32 | 4 | `healthState` | 94 | 2 | `sppoint` |
| 36 | 4 | `effectState` | 96 | 2 | `accessory` |
| 40 | 4 | `virtue` | 98 | 2 | `shield` |
| 44 | 4 | `honor` | 100 | 2 | `accessory2` |
| 48 | 2 | `jobpoint` | 102 | 2 | `accessory3` |
| 50 | 8 | `hp` | 104 | 2 | `headpalette` |
| 58 | 8 | `maxhp` | 106 | 2 | `bodypalette` |
| 66 | 8 | `sp` | 108 | 24 | `name` |
| 74 | 8 | `maxsp` | 132 | 6 | `Str` `Agi` `Vit` `Int` `Dex` `Luk`（各 1 字节） |
| 138 | 1 | `CharNum` | 139 | 1 | `haircolor` |
| 140 | 2 | `bIsChangedCharName` | 142 | 16 | `lastMap` |
| 158 | 4 | `DeleteDate` | 162 | 4 | `Robe` |
| 166 | 4 | `SlotAddon` | 170 | 4 | `RenameAddon` |
| 174 | 1 | `sex` | | | |

仓库用 `parseCharInfo` 解析这个块，因此字段名与选角列表里的角色完全一致。注意：`parseCharInfo` 对 64 位字段（`exp`、`jobexp`、`hp`、`maxhp`、`sp`、`maxsp`）只保留低 32 位——这是选角列表一直以来的行为，不是本次引入的。

`0x06B2` 的处理（`onConnectionAcceptedSingle`）：建立字符服心跳（`CZ.PING`，与选角流程相同）、清掉加载界面，然后 `SessionStorage.Entity = new Player(entity)`，与手动选角确认时（`onConnectRequest`）一致，之后由字符服下发的 `NOTIFY_ZONESVR` 驱动进图。

### 3.2 其余 13 个接收封包

| ID | 名称 | 长度 | 官方的用途 |
|---|---|---|---|
| `0x08E2` | `ZC.NAVIGATETO` | 27 | 官方只解析、不处理。导航目标：地图、坐标、怪物 |
| `0x097E` | `ZC.UPDATE_RANKING_POINT` | 12 | 官方只解析、不处理。排名点数更新 |
| `0x09E6` | `ZC.UPDATE_ITEM_FROM_BUYING_STORE2` | 24 | 收购商店里某个物品的数量/价格更新 |
| `0x0A78` | `ZC.CAMERA_INFO` | 15 | 官方只解析、不处理。镜头参数 |
| `0x0A82` | `ZC.ACK_BAN_GUILD_SSO2` | 46 | 公会成员被驱逐的通知；若是自己则关闭公会窗口并清除公会状态 |
| `0x0A83` | `ZC.ACK_LEAVE_GUILD2` | 46 | 公会成员离开的通知；处理同上 |
| `0x0ABD` | `ZC.PARTY_JOB_AND_LEVEL` | 10 | 官方只解析、不处理。队员职业与等级 |
| `0x0AD1` | `ZC.ATTACK_SKILLINFO_LIST` | 变长 | 官方用它填充自动技能设置里的 `autoskillid` 下拉框 |
| `0x0AD2` | `ZC.ADDIS_SKILLINFO_LIST` | 变长 | 填充 `addiskillid` 下拉框（默认项文字“请选择”） |
| `0x0AD3` | `ZC.TOUCH_SKILLINFO_LIST` | 变长 | 填充 `touchskillid` 下拉框（默认项文字“请选择”） |
| `0x0AD4` | `ZC.QOATTACK_SKILLINFO_LIST` | 变长 | 填充 `qoautoskillid` 下拉框 |
| `0x0AE7` | `ZC.PARTY_REQ_MASTER_TO_JOIN` | 38 | 队长收到“加入队伍申请”，弹窗询问同意/拒绝，之后回发 `CZ.PARTY_REQ_ACK_MASTER_TO_JOIN`（第 7 节） |
| `0x0AF0` | `ZC.NOTIFY_ATTENDANCE` | 10 | 签到奖励，官方用 `data` 领取 |
| `0x0AF9` | `ZC.SKILL_AUTOSHADOWSPELL` | 变长 | 官方用 `addskillOption2` 处理它，应为自动影子咒语（`AUTOSHADOWSPELL`）可选技能的列表 |
| `0x0AFA` | `ZC.PARTY_JOIN_REQ_ACK_FROM_MASTER` | 58 | 队长对加入申请的回应：`refused` 为 0 表示同意（提示“加入组队”并记录队长 AID），1 表示失败 |
| `0x0B47` | `ZC.CHANGE_GUILD2` | 14 | 玩家所属公会变化：更新 `guild_id` 与公会信息 |
| `0x0B7C` | `ZC.BAN_LIST` | 变长 | 公会驱逐名单。仓库已有同名的 `0x0163` 结构，所以新结构命名为 `ZC.BAN_LIST2` |

字节布局（偏移从帧首算起）：

| 包 | 布局 |
|---|---|
| `0x08E2` | `[2]type u8 · [3]flag u8 · [4]noshow u8 · [5]mapname char[16] · [21]x i16 · [23]y i16 · [25]mobid i16` |
| `0x097E` | `[2]Type i16 · [4]Point i32 · [8]TotalPoint i32` |
| `0x09E6` | `[2]ITID u32 · [6]count i16 · [8]Zeny i32 · [12]limitZeny i32 · [16]GID u32 · [20]Date u32` |
| `0x0A78` | `[2]show i8 · [3]range u32 · [7]rotation u32 · [11]latitude u32` |
| `0x0A82` `0x0A83` | `[2]charID i32 · [6]reasonDesc char[40]` |
| `0x0ABD` | `[2]AID i32 · [6]Job u16 · [8]Level u16` |
| `0x0AD1`–`0x0AD4` | `[2]len u16 · [4…]` 每项 37 字节：`SKID i16 · type i32 · level i16 · spcost i16 · attackRange i16 · skillName char[24] · upgradable i8` |
| `0x0AE7` | `[2]CID u32 · [6]AID u32 · [10]name char[24] · [34]xPos i16 · [36]yPos i16` |
| `0x0AF0` | `[2]unknown u32 · [6]data u32` |
| `0x0AF9` | `[2]len u16 · [4]why i32 · [8…]SKID u16[]` |
| `0x0AFA` | `[2]player_name char[24] · [26]party_name char[24] · [50]AID u32 · [54]refused u32` |
| `0x0B47` | `[2]GDID i32 · [6]emblemVersion u32 · [10]AID u32` |
| `0x0B7C` | `[2]len u16 · [4…]` 每项 68 字节：`AID i32 · reason char[40] · charname char[24]` |

### 3.3 由构建补丁提供的封包（不在 `vendor/v2/Online.js` 里）

下面 4 个 1.js 封包，仓库已经通过 `scripts/` 里的构建期补丁提供，**本次没有重复添加**（重复添加会让补丁的“已安装”检查报错）：

| ID | 名称 | 提供者 |
|---|---|---|
| `0x0A4A` | `ZC.PRIVATE_AIRSHIP_RESPONSE`（6 字节：`[2]response i32`） | `scripts/lastro-teleport-feedback.mjs` |
| `0x0BF2` `0x0BF4` `0x0BF6` | `ZC.RS_CREATE_INSTANCE` `RS_DEL_INSTANCE` `RS_ENTER_INSTANCE`（各 3 字节：`[2]rs u8`） | `scripts/patch-v2-runtime.mjs` 的 `patchLastROInstancePackets` |

## 4. 补齐长度的接收封包

这些封包仓库**已经注册**，但长度表里没有它们。LastRO 模式下，已注册而无长度的包一到就会触发“已注册包长度未知”，**整个接收块的剩余内容被当作失步丢弃**。长度取自 1.js 的声明，写在 `vendor/v2/lastro-packet-framing.mjs` 的 `LASTRO_PACKET_LENGTH_OVERRIDES`：

| ID | 名称 | 长度 | 备注 |
|---|---|---|---|
| `0x008F` | `ZC.ENTRY_ACK` | 6 | 官方解析函数多读了 2 字节，见第 8 节 |
| `0x0158` | `ZC.ACK_OPEN_MEMBER_INFO` | 2 | 只有包 ID |
| `0x0186` | `ZC.COLLECTORDEAD` | 6 | |
| `0x026E` | `AC.ACK_AUTHEKEY_FAIL_NOTMATCHCARDPASS` | 4 | 登录服 |
| `0x02A3` | `ZC.GAMEGUARD_LINGO_KEY` | 18 | 官方解析函数多读了 2 字节，见第 8 节 |
| `0x02BF` | `ZC.SRPACKETR2_INIT` | 12 | |
| `0x06B1` `0x06B2` | `HC.ACCEPT_ENTER_NEO_UNION2` `HC.ACCEPT_ENTER2` | -1 | 变长 |
| `0x07D0` `0x07D2` `0x07D5` `0x07D6` | `ZC.ES_RESULT` `ES_LIST` `ES_READY` `ES_GOTO` | 6 / 6 / 4 / 4 | |
| `0x07FF` | `ZC.DEFINE_CHECK` | 8 | |
| `0x0826` | `AC.SSO_LOGIN_ACK` | 4 | 登录服 |
| `0x0AEA` | `ZC.CARDCONNECTION_ACTIVATE_UPDATE` | 5 | **这是一个实际影响功能的缺口**：卡片激活更新到达时，整个接收块的后续内容会被丢弃 |

## 5. 已有封包的字段修正

### 5.1 物品 ID 等字段的宽度

LastRO 的这些帧是官方当前的“32 位”布局（帧长表里也是 32 位帧长），但仓库把字段读成了 16 位，读出来的值被截断，后续字段错位。修正后按帧里剩余字节判断：放得下 32 位就读 32 位，否则读 16 位（旧帧）。

| ID | 名称 | 官方布局（偏移从帧首算） |
|---|---|---|
| `0x010A` | `ZC.MVP_GETTING_ITEM`（MVP 奖励物品，6 字节） | `[2]ITID u32` |
| `0x018F` | `ZC.ACK_REQMAKINGITEM`（制作物品应答，8 字节） | `[2]result i16 · [4]ITID u32` |
| `0x01A3` | `ZC.FEED_PET`（喂宠物结果，7 字节） | `[2]cRet i8 · [3]ITID u32` |
| `0x022F` | `ZC.FEED_MER`（官方叫 `FEED_HOM`，喂佣兵/生命体，7 字节） | `[2]cRet i8 · [3]ITID u32` |
| `0x0298` | `ZC.CASH_TIME_COUNTER`（现金道具剩余时间，10 字节） | `[2]ITID u32 · [6]RemainSecond u32`（仓库此前把 `RemainSecond` 读在偏移 4，错位 2 字节） |
| `0x0299` | `ZC.CASH_ITEM_DELETE`（现金道具删除，8 字节） | `[2]index i16 · [4]ITID u32` |
| `0x0824` | `ZC.FAILED_TRADE_BUYING_STORE_TO_SELLER`（收购商店交易失败，8 字节） | `[2]Result i16 · [4]ITID u32` |
| `0x09CD` | `ZC.MSG_COLOR`（带颜色的系统消息，8 字节） | `[2]msg u16 · [4]color i32`（仓库此前只读 16 位颜色） |

### 5.2 布局与官方不同的封包

| ID | 名称 | 官方布局 | 仓库的做法 |
|---|---|---|---|
| `0x0206` | `ZC.FRIENDS_STATE`（好友状态，35 字节） | `[2]AID u32 · [6]GID u32 · [10]State u8 · [11]Name char[24]` | 补上 `Name`；观察者模式的 11 字节帧没有名字，仍可解析 |
| `0x0849` | `ZC.SE_PC_BUY_CASHITEM_RESULT`（现金商店购买结果，16 字节） | `[2]ITID u32 · [6]result u16 · [8]cashPoints u32 · [12]kafraPoints u32` | 仓库此前按 `kafraPoints u16 · itemId i16 · result i16 · cashPoints u16` 读，点数被截断且字段错位。16 字节帧按官方布局读，字段名沿用仓库的 `itemId` `result` `cashPoints` `kafraPoints`（另给 `ITID`）；旧的 8 字节布局保留 |
| `0x097F` | `ZC.SELECTCART`（选择手推车外观，11 字节） | `[2]identity i16 · [4]AID i32 · [8]CartList u8[3]` | 保留仓库原有的 `identity`（i32）和 `typeList`，**另外**给出官方读法 `cartIdentity` `AID` `CartList`（同一段字节的两种解读，哪种是服务器本意无法仅凭文件判断） |
| `0x0A43` | `ZC.ADD_MEMBER_TO_GROUP3`（队员加入，85 字节） | `[2]AID u32 · [6]Role u32 · [10]Job i16 · [12]Level i16 · [14]xPos i16 · [16]yPos i16 · [18]state u8 · [19]groupName[24] · [43]characterName[24] · [67]mapName[16] · [83]ItemPickupRule · [84]ItemDivisionRule` | 此前仓库在偏移 6 读了一个多余的 `GID`，又在偏移 10 把“职业+等级”读成一个 32 位 `role`，导致 `role` 永远不是 0（队长）。现改为官方布局，并给出 `role/Role`、`class_/Job`、`baseLevel/Level` |
| `0x0AFC` | `ZC.NOTIFY_OFFLINEMSG`（离线挂机结算，30 字节） | `[2]op u8 · [3]endtime i32 · [7]time i32 · [11]cash u16 · [13]baselv u16 · [15]joblv u16 · [17]zeny i32 · [21]equipCount u16 · [23]cardCount u16 · [25]bpower u16 · [27]brepower u16 · [29]feedback u8` | 此前仓库把整段当字符串读。现解析出官方字段，`msg` 保留 |
| `0x09A0` | `HC.CHARLIST_NOTIFY`（角色数量通知） | `[2]TotalCnt i32 · [6]charSlots i32` | 官方在 packetver ≥ 20151001 一律读第二个 32 位；仓库此前只在 20151001–20180103 之间读。现改为帧里放得下就读 |
| `0x008F` `0x02A3` | `ZC.ENTRY_ACK` `ZC.GAMEGUARD_LINGO_KEY` | 见第 8 节 | 解析函数不再越过帧边界 |

### 5.3 实体进入包没有 `shield` 字段

`0x0856` `0x0857` `0x0858`（`ZC.NOTIFY_MOVEENTRY6` `NEWENTRY6` `STANDENTRY6`）：官方这三个包没有 `shield`（武器之后直接是 `accessory`），仓库在 packetver ≥ 20181121 时多读了一个 32 位 `shield`，会让后面所有字段错位 4 字节。

按帧长判断：官方布局的数据长度（含 24 字节名字）分别是 **MOVE 91 / NEW 85 / STAND 84** 字节；等于这个长度时不读 `shield`，否则（比它长 4 字节）读 `shield`。两种都支持。

## 6. 变长列表包：按剩余字节自适应单元长度

这些包的每个条目长度随布局变化。新实现用 `pickLastROListUnit` 选“第一个能整除列表字节数的候选单元”，**官方布局排在最前**；都不能整除时退回原来按 packetver 的选择。

| ID | 名称 | 候选单元（字节） | 说明 |
|---|---|---|---|
| `0x0221` | `ZC.NOTIFY_WEAPONITEMLIST` | **23**，13 | 23：`index i16 · ITID u32 · RefiningLevel u8 · card1..4 各 u32`；13：全部为 16 位 |
| `0x00C6` | `ZC.PC_PURCHASE_ITEMLIST` | **11**，13 | `price i32 · discountprice i32 · type u8 · ITID`（11：u16；13：u32） |
| `0x0287` | `ZC.PC_CASH_POINT_ITEMLIST` | 20，18，**11**，13 | 头部 8 字节官方读作 `点数 u32 · md_itemcount u16 · md_itemSize u16`，仓库保留 `KafraPoint`/`CashPoint`，并给出 `officialCashPoint` `md_itemcount` `md_itemSize`；18/20 字节条目带 `viewSprite location unused` |
| `0x0252` | `ZC.AUCTION_ITEM_REQ_SEARCH` | **118**，108，83 | 118：32 位物品 ID/卡片 + 5 组随机属性；108：16 位 + 随机属性；83：16 位无随机属性（仓库原有） |
| `0x0800` | `ZC.PC_PURCHASE_ITEMLIST_FROMMC2` | **53**，64，63，47，22 | 53 是官方当前布局（16 位物品 ID/卡片 + 随机属性 + `location u32` + `viewSprite/WearState u16`）；64/63 为 32 位物品 ID/卡片（64 另有 `grade`）；47/22 为更早的布局 |
| `0x0AA5` | `ZC.MEMBERMGR_INFO2` | **108**，34 | 108：官方，带 `Memo char[50]` 与 `CharName char[24]`；34：仓库原有，无字符串。此前遇到 108 字节条目会按 34 切分，成员名为空 |
| `0x08C0` | `ZC.ACK_SE_CASH_ITEM_LIST2` | — | 官方：`[4]tab u32 · [8]count u16 ·` 之后每项 6 字节 `ITID u16 · price i32`。仓库此前根本没有解析条目。现给出官方的 `tab` `count` `itemList`，并保留原有的 `len` `openIdentity` `itemcount`（帧够长时） |

## 7. 新增的客户端封包

1.js 会发、仓库此前没有对应类的客户端封包。字段偏移从帧首算起；“官方用途”一栏，除队伍申请两个有官方处理函数佐证外，其余是按名称推断的：

| ID | 类名 | 长度 | 布局 | 官方用途 |
|---|---|---|---|---|
| `0x0AE6` | `CZ.PARTY_REQ_MASTER_TO_JOIN` | 10 | `[2]CID i32 · [6]AID i32` | 向队长申请加入队伍。**仓库的 `src/assistant/lro-party-booking.mjs` 一直在用这个类，此前会报“当前 RoBrowser 尚未提供 PARTY_REQ_MASTER_TO_JOIN 游戏封包”** |
| `0x0AF8` | `CZ.PARTY_REQ_ACK_MASTER_TO_JOIN` | 11 | `[2]CID i32 · [6]AID i32 · [10]accept u8` | 队长对加入申请的同意(1)/拒绝(0) |
| `0x0B10` | `CZ.USE_SKILL_START` | 10 | `[2]SKID i16 · [4]selectedLevel i16 · [6]targetID u32` | 开始吟唱/使用技能的通知 |
| `0x0B11` | `CZ.USE_SKILL_END` | 4 | `[2]SKID i16` | 结束使用技能的通知 |
| `0x0149` | `CZ.REQ_GIVE_MANNER_POINT` | 9 | `[2]otherAID u32 · [6]type u8 · [7]point i16` | 评价他人（礼仪点数） |
| `0x02BE` | `CZ.REQ_DEL_QUEST` | 6 | `[2]Qid i32` | 放弃任务 |
| `0x0A35` | `CZ.REQ_ONECLICK_ITEMIDENTIFY` | 4 | `[2]result i16` | 一键鉴定 |
| `0x0ACD` | `CZ.AUCTION_CLOSE` | 2 | 仅包 ID | 关闭拍卖窗口 |

## 8. 刻意没有照抄的差异（逐个写明证据）

| ID | 1.js 里的值 | 仓库的值 | 为什么不改 |
|---|---|---|---|
| `0x011A` `ZC.USE_SKILL` | 17 字节 | 15 | 官方源码在 `ZC.USE_SKILL.size = 15;` 之后，紧跟着 `ZC.USE_SKILL2` 的定义，又写了一行 `ZC.USE_SKILL.size = 17;`——应是 `USE_SKILL2` 的笔误（USE_SKILL2 的 `ZC.USE_SKILL2` 确实读 17 字节）。标准 `0x011A` 是 15 字节，仓库同时已把 17 正确地放在 `USE_SKILL2`（`0x09CB`）上 |
| `0x01D6` `ZC.NOTIFY_MAPPROPERTY2` | 8 字节 | 4 | 官方对 `ZC.NOTIFY_MAPPROPERTY2` 定义了两次：一次在 `0x01D6`（读 1 个 i16，size 4），一次在 `0x099B`（读 i16 + i32，size 8）。后一个覆盖前一个，所以官方实际把 `0x01D6` 也当 8 字节。标准 `0x01D6` 是 4 字节 |
| `0x0276` `AC.ACCEPT_LOGIN2` | 51 字节 | -1（变长） | 官方的解析函数只读 47 字节数据（加包 ID 共 49），与自己声明的 51 不符；该包带服务器列表，本是变长包。LastRO 的登录走 HTTP，不使用这个包 |
| `0x0823` `AC.OTP_AUTH_ACK` | 6 字节 | -1（变长） | 官方的解析函数只读 2 字节数据（加包 ID 共 4），与声明的 6 不符；同上，不使用 |
| `0x009D` `ZC.ITEM_ENTRY` | 解析 19 字节（32 位物品 ID + `subX` `subY`） | 17 字节（`LASTRO_ITEM_ENTRY`） | 官方没有声明长度，19 是它的解析函数读出来的。仓库的 17 字节来自 LastRO/OpenKore 实测，且有测试固定了抓到的真实帧 |
| `CZ.USE_SKILL_TOGROUNDMoreInfo` | 版本表 `20190828: 871, 长度 31`，`build()` 却要在偏移 10 写 80 字节 | 沿用旧版本表 | 官方这一项自相矛盾：31 字节的缓冲区放不下偏移 10 开始的 80 字节字符串，按它构造会抛异常。无法确定真实线上格式，不照抄 |

另外，以下封包按结构对比看似不同，实际**等价**或仓库是官方的超集，没有改动：

- `0x02B3` `ZC.ADD_QUEST`：官方固定读 3 个任务目标，仓库按 `count` 读，count 为 3 时一致；
- `0x0ACC` `ZC.NOTIFY_EXP2`：官方跳过的 4 字节，仓库读成 `amount2`；
- `0x0A23` `ZC.ALL_ACH_LIST`、`0x02B2` `ZC.ALL_QUEST_MISSION`、`0x097A` `ZC.ALL_QUEST_LIST_V2`、`0x0914` 等：字段偏移一致，或仓库多解析了官方不解析的部分；
- `0x0AC4` `AC.ACCEPT_LOGIN3`：官方把 `lastLoginTime` 读成 24 字节 + 2 字节，仓库读成 26 字节，字节数相同；
- 带“物品随机属性”的一批包（`0x0A05` `0x0A09` `0x0A0A` `0x0A0B` `0x0A0C` `0x0A37` `0x0B3F` `0x0B41`–`0x0B45`）：仓库用 5 字节的 `readStruct`，官方用 3 个字段，总字节一致；
- `0x0836` `ZC.SEARCH_STORE_INFO_ACK`：仓库对 packetver ≥ 20200916 有专门的、经过 LastRO 验证的解析。

## 9. 测试与复核

- `test/fixtures/lastro-official-packets.json`：1.js 的接收封包表快照（685 项：ID、官方名称、官方声明长度）。纯数据，不含官方代码。
- `test/lastro-official-packets.test.ts`：
  - 官方表里的每个 ID 都必须已注册、且有长度；长度必须与官方一致，第 8 节列出的 4 个例外有明确原因；
  - 新增与修正的每个包都有逐字节解析测试（官方布局与旧布局）；
  - 新增的 8 个客户端封包逐字节构造测试。
- 已有的 `test/lastro-network-compatibility.test.ts` 会审计每个已注册定长封包不得读出帧边界——补长度后它抓到了 `0x008F` 与 `0x02A3` 的越界，已修复。

复核方法（对比脚本是一次性的临时工具，没有入库）：把两个文件用 Babel 解析成语法树；对 Closure Compiler 压缩出的局部变量名做归一化后再比差异；对每个包的解析函数，在**沙箱里用记录型 reader 真实执行**，逐包比较字段的偏移与宽度；服务器→客户端方向比较注册 ID、有效长度和字段布局，客户端→服务器方向比较最终线上 ID。

## 10. 尚未验证的事项

- **服务器是否真的下发这些包**无法从文件判断。`0x06B1`/`0x06B2` 是否在 2转/3转/App服 上出现，需要抓包确认。
- 第 3.2 节的“用途”来自官方对这些包的处理函数；标注“官方只解析、不处理”的四个包，官方自己也没有用到。
- 第 5.2 节 `0x097F` 保留了两种读法，没有确定哪种是服务器本意。
- App服使用的是另一套协议配置（`langtype` 4、不同的密钥与客户端哈希），不在 1.js 的覆盖范围内：1.js 只有 `ClientVer` 0–5。本次对齐不涉及 App服 独有的封包。
