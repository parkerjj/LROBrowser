import ts from 'typescript';
import { runInNewContext } from 'node:vm';
import worldData from '../vendor/core/data/world/world-data.json' with { type: 'json' };
import { BUNDLED_SKILL_NAMES } from './lastro-skill-data.mjs';
import { EXTRA_SKILL_NAMES } from './lastro-skill-extra.mjs';
import { createRequire } from 'node:module';
import jobNameAliases from './lastro-job-name-aliases.json' with { type: 'json' };

// Source: scripts/lastro-localization.mjs




/**
 * LASTRO's localization overlay.
 *
 * Keep this data outside the imported V2 bundle so an upstream runtime refresh
 * only requires updating this small, reviewable overlay when an anchor moves.
 */

export const JOB_NAME_OVERRIDES = {
  NOVICE: '初心者',
  SWORDMAN: '剑士',
  MAGICIAN: '魔法师',
  ARCHER: '弓箭手',
  ACOLYTE: '服事',
  MERCHANT: '商人',
  THIEF: '盗贼',
  KNIGHT: '骑士',
  PRIEST: '牧师',
  WIZARD: '巫师',
  BLACKSMITH: '铁匠',
  HUNTER: '猎人',
  ASSASSIN: '刺客',
  KNIGHT2: '骑士',
  CRUSADER: '十字军',
  MONK: '武僧',
  SAGE: '贤者',
  ROGUE: '流氓',
  ALCHEMIST: '炼金术师',
  BARD: '吟游诗人',
  DANCER: '舞娘',
  CRUSADER2: '十字军',
  NOVICE_H: '进阶初心者',
  SWORDMAN_H: '进阶剑士',
  MAGICIAN_H: '进阶魔法师',
  ARCHER_H: '进阶弓箭手',
  ACOLYTE_H: '进阶服事',
  MERCHANT_H: '进阶商人',
  THIEF_H: '进阶盗贼',
  KNIGHT_H: '骑士领主',
  PRIEST_H: '神官',
  WIZARD_H: '超魔导师',
  BLACKSMITH_H: '神工匠',
  HUNTER_H: '神射手',
  ASSASSIN_H: '十字刺客',
  KNIGHT2_H: '骑士领主',
  CRUSADER_H: '圣殿十字军',
  MONK_H: '武术宗师',
  SAGE_H: '智者',
  ROGUE_H: '神行太保',
  ALCHEMIST_H: '创造者',
  BARD_H: '搞笑艺人',
  DANCER_H: '冷艳舞姬',
  CRUSADER2_H: '圣殿十字军',
  SUPERNOVICE: '超级初心者',
  GUNSLINGER: '神枪手',
  NINJA: '忍者',
  TAEKWON: '跆拳少年',
  STAR: '拳圣',
  STAR2: '拳圣',
  LINKER: '灵媒师',
  MARRIED: '已婚',
  XMAS: '圣诞服装',
  SUMMER: '夏日服装',
  RUNE_KNIGHT: '符文骑士',
  WARLOCK: '咒术师',
  RANGER: '游侠',
  ARCHBISHOP: '大主教',
  MECHANIC: '机械工匠',
  GUILLOTINE_CROSS: '十字斩首者',
  ROYAL_GUARD: '皇家卫士',
  SORCERER: '妖术师',
  MINSTREL: '宫廷乐师',
  WANDERER: '漫游舞者',
  SURA: '修罗',
  GENETIC: '基因学者',
  SHADOW_CHASER: '影子追踪者',
  RUNE_KNIGHT2: '符文骑士',
  ROYAL_GUARD2: '皇家卫士',
  RANGER2: '游侠',
  MECHANIC2: '机械工匠',
  SUPERNOVICE2: '超级初心者',
  KAGEROU: '影狼',
  OBORO: '胧',
  REBELLION: '叛乱者',
  STAR_EMPEROR: '星帝',
  SOUL_REAPER: '灵魂收割者',
  DRAGON_KNIGHT: '龙骑士',
  MEISTER: '机匠大师',
  SHADOW_CROSS: '暗影十字',
  ARCH_MAGE: '大法师',
  CARDINAL: '红衣主教',
  WINDHAWK: '风鹰',
  IMPERIAL_GUARD: '帝国卫士',
  BIOLO: '生物学者',
  ABYSS_CHASER: '深渊追踪者',
  ELEMENTAL_MASTER: '元素大师',
  INQUISITOR: '审判者',
  TROUBADOUR: '吟游诗人',
  TROUVERE: '漫游诗人',
  WINDHAWK2: '风鹰',
  MEISTER2: '机匠大师',
  DRAGON_KNIGHT2: '龙骑士',
  IMPERIAL_GUARD2: '帝国卫士',
  SKY_EMPEROR: '天帝',
  SOUL_ASCETIC: '灵魂修行者',
  SHINKIRO: '真影',
  SHIRANUI: '不知火',
  NIGHT_WATCH: '夜行者',
  HYPER_NOVICE: '超级初心者',
  SPIRIT_HANDLER: '灵兽使',
  SKY_EMPEROR2: '天帝',
  DO_SUMMONER: '召唤师',
  DRUID: '德鲁伊',
  ALITEA: '阿利忒亚',
  KARNOS: '卡诺斯',
  WEREWOLF: '狼人',
  WERERAPTOR: '狼蜥人',
};

/** Static fallback text in templates that is not replaced by DB.getMessage. */
export const RUNTIME_TEXT_REPLACEMENTS = [
  ['>Make a Room<', '>创建聊天室<'],
  ['>Title :<', '>标题：<'],
  ['>Limit :<', '>人数上限：<'],
  ['>Type :<', '>类型：<'],
  ['>Chat Room<', '>聊天室<'],
  ['>Restrict :<', '>限制：<'],
  ['>Sign :<', '>密码：<'],
  ['>Roulette<', '>抽奖转盘<'],
  ['>Points:<', '>点数：<'],
  ['>Spin<', '>开始<'],
  ['>Info<', '>说明<'],
  ['>Get Prize<', '>领取奖励<'],
  ['>Result:<', '>结果：<'],
  ['>Pet Info<', '>宠物信息<'],
  ['>Homunculus Info<', '>使魔信息<'],
  ['>Mercenary Info<', '>佣兵信息<'],
  ['>Name<', '>名称<'],
  ['>Level<', '>等级<'],
  ['>Hunger<', '>饥饿度<'],
  ['>Intimacy<', '>亲密度<'],
  ['>Accessory<', '>饰品<'],
  ['>Equipped<', '>已装备<'],
  ['>Auto Feeding<', '>自动喂食<'],
  ['>Feed Pet<', '>喂食宠物<'],
  ['>Performance<', '>动作<'],
  ['>Return to Egg Shell<', '>收回宠物<'],
  ['>Unequip Accessory<', '>卸下饰品<'],
  ['>Time Left<', '>剩余时间<'],
  ['>Kills<', '>击杀数<'],
  ['>Faith<', '>信仰<'],
  ['>Show Equip<', '>显示装备<'],
  ['>Show Costume<', '>显示时装<'],
  ['>Show Monsters<', '>显示魔物<'],
  ['>Show Quest<', '>显示任务<'],
  ['>Skill List<', '>技能列表<'],
  ['>Skill Tree<', '>技能树<'],
  ['>Character Info<', '>角色信息<'],
  ['>Guild Info<', '>公会信息<'],
  ['>Party Window<', '>队伍窗口<'],
  ['>Bank<', '>银行<'],
  ['>Storage<', '>仓库<'],
  ['>Status<', '>状态<'],
  ['>Mail<', '>邮件<'],
  ['>Description<', '>说明<'],
  ['>Position<', '>位置<'],
  ['>Next<', '>下一页<'],
  ['>Previous<', '>上一页<'],
  ['>Close<', '>关闭<'],
  ['>Delete<', '>删除<'],
  ['>Reset<', '>重置<'],
  ['>Read<', '>阅读<'],
  ['>OK<', '>确定<'],
  ['>cancel<', '>取消<'],
  ['>Default<', '>默认<'],
  ['>Left<', '>左侧<'],
  ['>Top<', '>顶部<'],
  ['>Right<', '>右侧<'],
  ['>Color<', '>彩色<'],
  ['>Han<', '>汉化<'],
  ['>Hidden<', '>隐藏<'],
  ['>All on<', '>全部开启<'],
  ['>Public Log<', '>公共记录<'],
  ['>Public Chat<', '>公共聊天<'],
  ['>Whisper<', '>私聊<'],
  ['>Party<', '>队伍<'],
  ['>Guild<', '>公会<'],
  ['>Item<', '>物品<'],
  ['>Equipment on/off<', '>装备开关<'],
  ['>Abnormal Status<', '>异常状态<'],
  ['>Party Item<', '>队伍物品<'],
  ['>Party Status<', '>队伍状态<'],
  ['>Skill Fail<', '>技能失败<'],
  ['>Party Setup<', '>队伍设置<'],
  ['>Equip Damage<', '>装备损坏<'],
  ['>Party Search<', '>队伍搜索<'],
  ['>Battle<', '>战斗<'],
  ['>Party Battle<', '>队伍战斗<'],
  ['>Party EXP<', '>队伍经验<'],
  ['>Quest<', '>任务<'],
  ['>Battlefield<', '>战场<'],
  ['>Clan<', '>氏族<'],
  ['>Achievement Challenges<', '>成就挑战<'],
  ['>Achievement<', '>成就<'],
  ['>Attendance Check<', '>签到<'],
  ['>Available Items<', '>可用物品<'],
  ['>Available Items for Buying<', '>可购买物品<'],
  ['>Available Items for selling<', '>可出售物品<'],
  ['>Available Items for Vending<', '>可摆摊物品<'],
  ['>Basic Info<', '>基本信息<'],
  ['>Basic Information<', '>基本信息<'],
  ['>Battleground<', '>战场<'],
  ['>Cash Point<', '>现金点<'],
  ['>Cart Decoration<', '>手推车装饰<'],
  ['>Cart Window<', '>手推车窗口<'],
  ['>Chat History<', '>聊天记录<'],
  ['>Check Reward<', '>查看奖励<'],
  ['>Clan Info<', '>氏族信息<'],
  ['>Clan level<', '>氏族等级<'],
  ['>Clan mark<', '>氏族标志<'],
  ['>Clan Name<', '>氏族名称<'],
  ['>Clean cache<', '>清理缓存<'],
  ['>Cleaning cache...<', '>正在清理缓存……<'],
  ['>Click anywhere to close<', '>点击任意位置关闭<'],
  ['>Complete<', '>完成<'],
  ['>Contents<', '>内容<'],
  ['>Costume<', '>时装<'],
  ['>Create Party<', '>创建队伍<'],
  ['>Cursor<', '>鼠标指针<'],
  ['>Damage Font<', '>伤害字体<'],
  ['>Day<', '>天<'],
  ['>Details<', '>详情<'],
  ['>Devotion<', '>贡献度<'],
  ['>Disable Virtual Mouse<', '>禁用虚拟鼠标<'],
  ['>Disband<', '>解散<'],
  ['>Display Name<', '>显示名称<'],
  ['>Effect<', '>效果<'],
  ['>Emblem<', '>徽章<'],
  ['>Emotion icon List<', '>表情图标列表<'],
  ['>Emotion List<', '>表情列表<'],
  ['>Enchant<', '>附魔<'],
  ['>Equipment<', '>装备<'],
  ['>Even Share<', '>平均分配<'],
  ['>Expel History<', '>驱逐记录<'],
  ['>FPS Display<', '>显示 FPS<'],
  ['>FPS Limit<', '>FPS 上限<'],
  ['>Free Points<', '>自由点数<'],
  ['>Friend Setup<', '>好友设置<'],
  ['>Friends List<', '>好友列表<'],
  ['>Friends<', '>好友<'],
  ['>General<', '>通用<'],
  ['>Guild Companion<', '>公会助手<'],
  ['>Guild lvl<', '>公会等级<'],
  ['>Guild Master<', '>公会会长<'],
  ['>Guild Name<', '>公会名称<'],
  ['>Guild Notice<', '>公会公告<'],
  ['>Guild Skill<', '>公会技能<'],
  ['>Guildsmen Info<', '>公会成员信息<'],
  ['>Guildsmen<', '>公会成员<'],
  ['>Homunculus State<', '>生命体状态<'],
  ['>Hostile Clan<', '>敌对氏族<'],
  ['>How to share EXP<', '>如何分配 EXP<'],
  ['>How to share Items<', '>如何分配物品<'],
  ['>Incomplete<', '>未完成<'],
  ['>Individual<', '>个人<'],
  ['>Input number<', '>输入数字<'],
  ['>Instant Mode<', '>即时模式<'],
  ['>Interface<', '>界面<'],
  ['>Inventory (Alt + E)<', '>物品栏（Alt + E）<'],
  ['>Inventory<', '>物品栏<'],
  ['>Invitation<', '>邀请<'],
  ['>Item Filter<', '>物品筛选<'],
  ['>Item Sharing type<', '>物品分配方式<'],
  ['>Item Window<', '>物品窗口<'],
  ['>Items wanted<', '>需求物品<'],
  ['>Job Lv. <', '>职业等级：<'],
  ['>Join a guild or start your own!<', '>加入公会，或创建属于自己的公会！<'],
  ['>Leave Party<', '>离开队伍<'],
  ['>Lowest HP<', '>最低 HP<'],
  ['>Mail List<', '>邮件列表<'],
  ['>Master Name<', '>会长名称<'],
  ['>Mercenary State<', '>佣兵状态<'],
  ['>Merchant Shop<', '>商人商店<'],
  ['>Message<', '>消息<'],
  ['>Mouse Move<', '>鼠标移动<'],
  ['>Navigation<', '>导航<'],
  ['>No results found<', '>未找到结果<'],
  ['>Note<', '>备注<'],
  ['>Open 1:1 Chat between Friends<', '>打开好友私聊<'],
  ['>Open 1:1 Chat between Strangers<', '>打开陌生人私聊<'],
  ['>Option (Esc)<', '>选项（Esc）<'],
  ['>Party (Alt + Z)<', '>队伍（Alt + Z）<'],
  ['>Party Invitation<', '>队伍邀请<'],
  ['>Party Name:<', '>队伍名称：<'],
  ['>Party Share<', '>队伍分配<'],
  ['>Point(s)<', '>点数<'],
  ['>Position Title<', '>职位名称<'],
  ['>Price limit: %s Zeny<', '>价格上限：%s Zeny<'],
  ['>Purchase Zeny Limit<', '>购买 Zeny 上限<'],
  ['>Purchase<', '>购买<'],
  ['>Quest Information<', '>任务信息<'],
  ['>Quest List (Alt + U)<', '>任务列表（Alt + U）<'],
  ['>Rank<', '>排名<'],
  ['>Read Mail<', '>阅读邮件<'],
  ['>Reward<', '>奖励<'],
  ['>Screen Resolution<', '>屏幕分辨率<'],
  ['>Select Option<', '>选择选项<'],
  ['>Send Message<', '>发送消息<'],
  ['>Server List<', '>服务器列表<'],
  ['>Short Cuts<', '>快捷栏<'],
  ['>ShortCuts<', '>快捷栏<'],
  ['>Sit/Stand<', '>坐下／站立<'],
  ['>Skill Points: <', '>技能点数：<'],
  ['>SkillTree (Alt + S)<', '>技能树（Alt + S）<'],
  ['>Sound<', '>声音<'],
  ['>Activate lock function<', '>启用锁定<'],
  ['>Deactivate lock function<', '>解除锁定<'],
  ['>Advanced<', '>高级<'],
  ['>Alliance<', '>同盟<'],
  ['>Ally Clan<', '>同盟氏族<'],
  ['>Antagonist<', '>敌对公会<'],
  ['>Attack Target Mode<', '>攻击目标模式<'],
  ['>Auto Hide UI<', '>自动隐藏界面<'],
  ['>Auto Read<', '>自动阅读<'],
  ['>Avg.lvl of Guildsmen<', '>成员平均等级<'],
  ['>Axis Threshold<', '>摇杆阈值<'],
  ['>Bank (Ctrl + B)<', '>银行（Ctrl + B）<'],
  ['>Basic<', '>基本<'],
  ['>Bloom<', '>泛光<'],
  ['>Blur<', '>模糊<'],
  ['>Bookmark<', '>书签<'],
  ['>Buy List<', '>购买列表<'],
  ['>Buying Items<', '>购买物品<'],
  ['>Buying<', '>购买<'],
  ['>CartItems<', '>手推车物品<'],
  ['>ChangeCart<', '>更换手推车<'],
  ['>Chat Bar Size<', '>聊天栏大小<'],
  ['>Closest<', '>最近<'],
  ['>Consumption items are used in the synthesis. Are you sure?<', '>合成将消耗所需物品，确定继续吗？<'],
  ['>create guild<', '>创建公会<'],
  ['>Downgrade<', '>降级<'],
  ['>Each Take<', '>各自取得<'],
  ['>Equip (Alt + Q)<', '>装备（Alt + Q）<'],
  ['>Etc<', '>其他<'],
  ['>Expel from party<', '>移出队伍<'],
  ['>Full Client<', '>完整客户端<'],
  ['>Gamepad<', '>手柄<'],
  ['>Guild (Alt + G)<', '>公会（Alt + G）<'],
  ['>Managed Territory<', '>管理领地<'],
  ['>Normal<', '>普通<'],
  ['>Off<', '>关闭<'],
  ['>Passive<', '>被动<'],
  ['>Perfect<', '>完美<'],
  ['>Pet Evolution<', '>宠物进化<'],
  ['>Player Name:<', '>角色名称：<'],
  ['>Point<', '>点数<'],
  ['>Prev<', '>上一页<'],
  ['>Punish<', '>惩罚<'],
  ['>Quick-Cast Mode<', '>快速施法模式<'],
  ['>Release Mode<', '>松开施放模式<'],
  ['>Replay<', '>回放<'],
  ['>Reputation Status<', '>声望状态<'],
  ['>Resets all enchant slots.<', '>重置所有附魔栏位。<'],
  ['>Resolution Details<', '>分辨率详情<'],
  ['>Resolution<', '>分辨率<'],
  ['>Sell List<', '>出售列表<'],
  ['>Selling Items<', '>出售物品<'],
  ['>Shared<', '>共享<'],
  ['>Shop Items<', '>商店物品<'],
  ['>ShortCut Description<', '>快捷键说明<'],
  ['>Shortcut key setting window<', '>快捷键设置窗口<'],
  ['>Skill Bar Size<', '>技能栏大小<'],
  ['>Skill Bar<', '>技能栏<'],
  ['>Sort Mini Party Window<', '>迷你队伍窗口排序<'],
  ['>Status (Alt + A)<', '>状态（Alt + A）<'],
  ['>Swap L3-R3 Sticks<', '>交换 L3/R3 摇杆<'],
  ['>Target:<', '>目标：<'],
  ['>Tax Point<', '>税率<'],
  ['>Tendency<', '>倾向<'],
  ['>Territory<', '>领地<'],
  ['>The number of members<', '>成员数量<'],
  ['>The Reason of Expulsion<', '>驱逐原因<'],
  ['>Tipbox (Alt + D)<', '>提示（Alt + D）<'],
  ['>Title<', '>标题<'],
  ['>Toggle<', '>切换<'],
  ['>Total : <', '>合计：<'],
  ['>Unknown<', '>未知<'],
  ['>Upgrade<', '>升级<'],
  ['>Use Free Points<', '>使用自由点数<'],
  ['>Uses the next available slot.<', '>使用下一个可用栏位。<'],
  ['>Vending<', '>摆摊<'],
  ['>Version<', '>版本<'],
  ['>Vibrance<', '>自然饱和度<'],
  ['>Weight : <', '>负重：<'],
  ['>Weight:<', '>负重：<'],
  ['>Weigth:<', '>负重：<'],
  ['>Window<', '>窗口<'],
  ['>World Map<', '>世界地图<'],
  ...Array.from({ length: 36 }, (_, index) => {
    const slot = `${Math.floor(index / 9) + 1}-${index % 9 + 1}`;
    return [`>Skill bar ${slot}<`, `>技能栏 ${slot}<`];
  }),
  ['message log settings', '聊天记录设置'],
  ['Sound Settings', '声音设置'],
  ['Graphics Settings', '图像设置'],
  ['>Reset to Default Values<', '>恢复默认设置<'],
  ['>Full Screen</option>', '>全屏</option>'],
  ['>Unlimited</option>', '>无限制</option>'],
  ['&lt; Command &gt;', '&lt; 指令 &gt;'],
  ['>Select slot for <', '>选择技能栏位：<'],
  ['Use L2/R2 to change tab, D-pad to navigate slot, A to select, Select to cancel', '使用 L2/R2 切换页签，方向键选择栏位，A 确定，Select 取消'],
  ['Graphics Context Lost', '图形上下文已丢失'],
  ['The browser lost connection to the GPU.', '浏览器与 GPU 的连接已断开。'],
  ['Attempting to restore automatically...', '正在尝试自动恢复……'],
  ['>Settings<', '>设置<'],
  ['> Save Files</label>', '> 保存文件</label>'],
  ['/> Services </label>', '/> 服务 </label>'],
  ['Show official cursor', '显示系统鼠标指针'],
  ['placeholder="Item Search"', 'placeholder="物品搜索"'],
  ['placeholder="Search..."', 'placeholder="搜索……"'],
  ['placeholder="No file selected"', 'placeholder="未选择文件"'],
  ['data-title="Account Limited"', 'data-title="账号限制"'],
  ['data-title="Permanent Equipment"', 'data-title="永久装备"'],
  ['data-title="Rental Equipment"', 'data-title="租赁装备"'],
  ['data-title="Popular"', 'data-title="热门"'],
  ['data-title="Consumables"', 'data-title="消耗品"'],
  ['data-title="Scrolls"', 'data-title="卷轴"'],
  ['data-title="Armor"', 'data-title="防具"'],
  ['data-title="Weapon"', 'data-title="武器"'],
  ['data-title="Cash"', 'data-title="现金点"'],
  ['data-title="Card"', 'data-title="卡片"'],
  ['data-title="Other"', 'data-title="其他"'],
  ['data-title="Limited Sale"', 'data-title="限时特卖"'],
  ['data-title="New"', 'data-title="新品"'],
  ['>Use<', '>使用<'],
  ['START NOW', '立即开始'],
  ['SAVE SETTINGS', '保存设置'],
  ['Trade : <span', '交易：<span'],
  ['Hello, illegal software is being monitored.', '正在监测非法软件。'],
  ['Please enter the text below within the specified time.', '请在规定时间内输入下方文字。'],
  ['If you enter the text wrong three times, you will get banned', '连续三次输入错误将被封禁。'],
  ['Remaining chance: 3', '剩余次数：3'],
  ['placeholder="Captcha Answer"', 'placeholder="请输入验证码"'],
  ['Saves current chat tab to txt file.', '将当前聊天页签保存为文本文件。'],
];

/** English fallbacks used only when a message-table entry is unavailable. */
export const MESSAGE_FALLBACKS = {
  126: '更改房间设置',
  127: '踢出成员',
  128: '转让队长',
  358: '加为好友',
  375: '你已经加入公会。',
  376: '该公会名称已存在。',
  401: '解散公会失败。',
  402: '公会仍有成员。',
  405: '创建公会需要必要道具。',
  1360: '查看信息 %s',
  1807: '分钟',
  1808: '秒',
  2059: '已收到加入队伍的邀请。',
  2686: '删除称号',
};

// Use the same packaged display names as the world map. This is synchronous at
// runtime, so an arrival banner cannot race a JSON fetch or a later Lua load.
export const MAP_NAME_OVERRIDES = Object.fromEntries(Object.entries(worldData)
  .filter(([, value]) => typeof value.name === 'string' && /[\u3400-\u9fff]/u.test(value.name))
  .map(([id, value]) => [id, value.name]));

// Exact display text only. These never apply to map filenames or bitmap names.
export const MAP_TITLE_OVERRIDES = {
  'Prontera': '普隆德拉',
  'Prontera Field': '普隆德拉区域',
  'Prontera Castle': '普隆德拉城堡',
  'Prontera Royal Palace': '普隆德拉王宫',
  'Prontera East Library': '普隆德拉东部图书馆',
  'Rune-Midgarts': '卢恩米德加兹',
  'Rune-Midgarts Kingdom': '卢恩米德加兹王国',
  'Geffen': '吉芬',
  'Geffen Field': '吉芬区域',
  'Payon': '斐扬',
  'Payon Archer Village': '斐扬弓箭手村',
  'Morroc': '梦罗克',
  'Sograt Desert': '苏克拉特沙漠',
  'Alberta': '艾尔贝塔',
  'Izlude': '依斯鲁得',
  'Baylan Island': '海底洞穴',
  'Aldebaran': '艾尔帕兰',
  'Clock Tower': '钟楼',
  'Glastheim': '克雷斯特汉姆',
  'Glastheim Castle': '克雷斯特汉姆城堡',
  'Old Glastheim': '旧克雷斯特汉姆',
  'Comodo': '克魔岛',
  'Umbala': '汶巴拉',
  'Niflheim': '尼夫海姆',
  'Yuno': '朱诺',
  'Lutie': '姜饼城',
  'Rachel': '拉赫',
  'Rachel Temple': '拉赫神殿',
  'Gonryun': '昆仑',
  'Moscovia': '莫斯科',
  'Brasilis': '巴西利斯',
  'Dewata': '德瓦塔',
  'Port Malaya': '马来港',
  'Malangdo': '猫岛',
  'Lasagna': '拉萨纳',
  'Port Town Lasagne': '拉萨纳港口',
  'Nameless Island': '无名岛',
  'Thanatos Tower': '达纳托斯塔',
  'Thanatos Tower Upper Level': '达纳托斯塔上层',
  'Thanatos Memory': '达纳托斯的记忆',
  'Orc Village': '兽人村',
  'Battleground': '战场',
  'Illusion': '幻影',
};

/** Self-contained because the build embeds this resolver into the native DB. */
export function createLastroMapLocalization(names = MAP_NAME_OVERRIDES, titles = MAP_TITLE_OVERRIDES) {
  const remembered = Object.create(null);
  const normalize = value => String(value ?? '').trim().toLowerCase().replace(/\.(gat|rsw)$/i, '');
  const isChinese = value => typeof value === 'string' && /[\u3400-\u9fff]/u.test(value);
  const title = value => typeof value === 'string' && Object.prototype.hasOwnProperty.call(titles, value.trim())
    ? titles[value.trim()] : value;

  function rememberName(mapname, value) {
    const id = normalize(mapname);
    if (id && isChinese(value)) remembered[id] = value;
    return resolveName(mapname, value);
  }

  function resolveName(mapname, fallback) {
    if (isChinese(fallback)) return fallback;
    const id = normalize(mapname);
    if (id && Object.prototype.hasOwnProperty.call(remembered, id)) return remembered[id];
    if (id && Object.prototype.hasOwnProperty.call(names, id)) return names[id];
    return title(fallback);
  }

  function localizeInfo(mapname, info, tableName) {
    if (!info || typeof info !== 'object') return info;
    const fallback = isChinese(info.displayName) ? info.displayName : isChinese(tableName) ? tableName : info.displayName;
    const displayName = resolveName(mapname, fallback);
    const signName = { ...info.signName };
    if (!isChinese(signName.mainTitle)) signName.mainTitle = resolveName(mapname, isChinese(displayName) ? displayName : signName.mainTitle || displayName);
    signName.subTitle = title(signName.subTitle);
    return { ...info, displayName, signName };
  }

  return { normalize, rememberName, resolveName, localizeInfo };
}

function localizationRegion(source, path) {
  const marker = `//#region ${path}`;
  const start = source.indexOf(marker);
  if (start === -1) return null;
  const end = source.indexOf('//#endregion', start);
  if (end === -1 || source.lastIndexOf(marker) !== start) throw new Error('anchor:map-localization-region');
  return { start, end, text: source.slice(start, end) };
}

/** Keep RO formatting at the status-tooltip display boundary, not in shared DB data. */
export function setLastroStatusTooltip(node, value) {
  if (node.matches('#WinStats .desc > .hover[data-text]')) {
    value = String(value ?? '')
      .replace(/\\r\\n|\\[rn]|\r\n?/g, '\n')
      .replace(/\^[0-9a-f]{6}/gi, '');
    node.style.whiteSpace = 'pre-line';
    node.style.width = 'max-content';
    node.style.height = 'auto';
    node.style.maxWidth = 'min(420px, calc(100vw - 24px))';
  }
  node.textContent = value;
}

export function patchRuntimeStatusTooltips(source) {
  const region = localizationRegion(source, 'src/UI/GUIComponent.js');
  if (!region) return source;
  if (source.includes('const LastROStatusTooltipText =')) throw new Error('anchor:status-tooltip-duplicate');
  const anchor = 'node.textContent = _DB?.getMessage(msgId, "");';
  const file = ts.createSourceFile('GUIComponent.js', region.text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const methods = [];
  function visit(node) {
    if (ts.isMethodDeclaration(node) && node.name.getText(file) === 'processDataAttrs') methods.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (methods.length !== 1 || methods[0].parameters.map(node => node.name.getText(file)).join(',') !== 'node'
      || !methods[0].modifiers?.some(node => node.kind === ts.SyntaxKind.StaticKeyword)
      || methods[0].getText(file).split(anchor).length !== 2) throw new Error('anchor:status-tooltip-text');
  const patched = region.text.replace(anchor, 'LastROStatusTooltipText(node, _DB?.getMessage(msgId, ""));');
  return `const LastROStatusTooltipText = (${setLastroStatusTooltip.toString()});\n`
    + source.slice(0, region.start) + patched + source.slice(region.end);
}

function replaceLocalizationAnchor(source, anchor, replacement, label) {
  if (source.split(anchor).length !== 2) throw new Error('anchor:map-localization-' + label);
  return source.replace(anchor, replacement);
}

/** Reapply display translations at each DB lifecycle boundary, never resources. */
export function patchRuntimeMapLocalization(source) {
  const region = localizationRegion(source, 'src/DB/DBManager.js');
  if (!region) return source;
  if (source.includes('const LastROMapLocalization =')) throw new Error('anchor:map-localization-duplicate');
  const file = ts.createSourceFile('DBManager.js', region.text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const declarations = new Map();
  function visit(node) {
    if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) && node.name) {
      const name = node.name.getText(file);
      if (['loadMapTbl', 'updateMapTable', 'getMapName', 'getMapInfo', 'init'].includes(name)) {
        const rows = declarations.get(name) || [];
        rows.push(node);
        declarations.set(name, rows);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  const edits = [];
  function replaceBody(name, transform) {
    const matches = declarations.get(name) || [];
    if (matches.length !== 1 || !matches[0].body) throw new Error('anchor:map-localization-' + name);
    const node = matches[0];
    edits.push({ start: node.body.getStart(file), end: node.body.end, text: transform(node.body.getText(file)) });
  }
  replaceBody('init', body => replaceLocalizationAnchor(body,
    '(MapTable[key] || (MapTable[key] = {})).name = val;',
    '(MapTable[key] || (MapTable[key] = {})).name = LastROMapLocalization.rememberName(key, val);', 'mapname-loader'));
  replaceBody('loadMapTbl', body => replaceLocalizationAnchor(body,
    'lua.doStringSync("main()");',
    'lua.doStringSync("main()");\n        if (typeof callback === "function") callback(MapInfo);', 'mapinfo-callback'));
  replaceBody('updateMapTable', body => {
    if (!body.includes('MapTable[key].name = MapInfo[key].displayName')) throw new Error('anchor:map-localization-update');
    return `{
  for (const key of Object.keys(MapInfo)) {
    const previous = MapTable[key] || (MapTable[key] = {});
    const info = LastROMapLocalization.localizeInfo(key, MapInfo[key], previous.name);
    if (info && info.displayName) previous.name = info.displayName;
  }
}`;
  });
  replaceBody('getMapName', body => {
    if (!body.includes('return MapTable[map].name;')) throw new Error('anchor:map-localization-get-name');
    return `{
      if (!mapname) return typeof defaultName === "undefined" ? DB.getMessage(187) : defaultName;
      const map = LastROMapLocalization.normalize(mapname) + ".rsw";
      const name = LastROMapLocalization.resolveName(mapname, MapTable[map]?.name);
      return name || (typeof defaultName === "undefined" ? DB.getMessage(187) : defaultName);
    }`;
  });
  replaceBody('getMapInfo', body => {
    if (!body.includes('return MapInfo[mapname] || null;')) throw new Error('anchor:map-localization-get-info');
    return `{
      const map = LastROMapLocalization.normalize(mapname) + ".rsw";
      return LastROMapLocalization.localizeInfo(map, MapInfo[map] || null, MapTable[map]?.name);
    }`;
  });
  let patched = region.text;
  for (const edit of edits.sort((a, b) => b.start - a.start)) patched = patched.slice(0, edit.start) + edit.text + patched.slice(edit.end);
  return `/* LASTRO Chinese map-name overlay: arrival banners and DB display only. */
const LastROMapLocalization = (${createLastroMapLocalization.toString()})(${JSON.stringify(MAP_NAME_OVERRIDES)}, ${JSON.stringify(MAP_TITLE_OVERRIDES)});
` + source.slice(0, region.start) + patched + source.slice(region.end);
}

/** Fail the build when a later overlay drops a required localization mount. */
export function assertRuntimeLocalizationMount(source, baseline = source) {
  assertRuntimeItemOptionLocalization(source, baseline);
  const hooks = [
    ['src/DB/DBManager.js', 'LastROMapLocalization.rememberName(key, val)', 'map-text-loader'],
    ['src/DB/DBManager.js', 'LastROMapLocalization.localizeInfo(map, MapInfo[map] || null, MapTable[map]?.name)', 'map-info-display'],
    ['src/DB/DBManager.js', 'LastROMapLocalization.resolveName(mapname, MapTable[map]?.name)', 'map-name-display'],
    ['src/DB/DBManager.js', 'if (typeof callback === "function") callback(MapInfo);', 'map-info-loader'],
    ['src/DB/DBManager.js', 'LastROUiMessages.resolveMessage(id, MsgStringTable[id], defaultText)', 'message-display'],
    ['src/DB/DBManager.js', 'LastROUiMessages.loadCsv(data, targetTable', 'message-loader'],
    ['src/DB/DBManager.js', 'LASTRO Chinese skill-name overlay', 'skill-name-loader'],
    ['src/DB/DBManager.js', 'SkillDescription = _json;', 'skill-description-loader'],
    ['src/UI/Components/MapName/MapName.js', '_mapinfo = DB.getMapInfo(mapname.replace(".gat", ".rsw"))', 'arrival-map-info'],
  ];
  for (const [path, hook, label] of hooks) {
    if (!localizationRegion(baseline, path)) continue;
    const region = localizationRegion(source, path);
    if (!region || region.text.split(hook).length !== 2) throw new Error('localization-mount:' + label);
  }
  if (baseline.includes('JobNameTable')) {
    if (source.split('function lastroJobDisplayName(id)').length !== 2
        || !source.includes('lastroJobDisplayName(info.job)')) throw new Error('localization-mount:job-display');
    for (const path of ['src/DB/Jobs/JobNameTable.js', 'src/DB/Jobs/PalNameTable.js', 'src/DB/Jobs/WeaponJobTable.js']) {
      const original = localizationRegion(baseline, path), current = localizationRegion(source, path);
      if (original && (!current || current.text.replaceAll('\r\n', '\n') !== original.text.replaceAll('\r\n', '\n')))
        throw new Error('localization-mount:resource-identifiers');
    }
  }
  const nativeUi = localizationUiText(baseline), patchedUi = localizationUiText(source);
  for (const [from, to] of RUNTIME_TEXT_REPLACEMENTS) {
    if (!nativeUi.includes(from)) continue;
    // Storage's reviewed sort-label overlay replaces the old generic wording.
    const alternative = from === '>Downgrade<' ? '>名称降序<' : '';
    if (patchedUi.includes(from) || (!patchedUi.includes(to) && (!alternative || !patchedUi.includes(alternative))))
      throw new Error('localization-mount:ui-text:' + from);
  }
}

/** Check the actual item-name getter after every overlay, including import/build. */
function assertRuntimeItemOptionLocalization(source, baseline) {
  function itemNameMethod(text) {
    const region = localizationRegion(text, 'src/DB/DBManager.js');
    if (!region) return null;
    const file = ts.createSourceFile('DBManager.js', region.text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const matches = [];
    function visit(node) {
      if (ts.isMethodDeclaration(node) && node.name.getText(file) === 'getItemName') matches.push(node);
      ts.forEachChild(node, visit);
    }
    visit(file);
    return matches.length === 1 ? matches[0].getText(file) : null;
  }
  if (!itemNameMethod(baseline)) return;
  const method = itemNameMethod(source);
  try {
    if (!method) throw new Error('missing item-name method');
    // No slot records: only exercise option display, with fixed synthetic data.
    // Running the getter detects an overwritten method even if translated text
    // remains in a comment, unused table or unrelated part of the bundle.
    const checks = runInNewContext(`
      const getPreferredItemDisplayName = info => info.identifiedDisplayName;
      class DB { ${method} }
      DB.getItemInfo = () => ({ identifiedDisplayName: '测试装备', slotCount: 0 });
      const item = { ITID: 1, IsIdentified: true };
      const names = [0, 1, 5].map(count => DB.getItemName({ ...item, Options: Array.from({length: count}, (_, index) => ({index: index + 1})) }));
      const hidden = DB.getItemName({ ...item, Options: [{index: 1}] }, {showItemOptions: false});
      const empty = DB.getItemName({ ...item, Options: [{index: 0}] });
      const unknown = DB.getItemName({ ...item, IsIdentified: false, Options: [{index: 1}] });
      JSON.stringify([...names, hidden, empty, unknown]);
    `, {}, { timeout: 100, contextCodeGeneration: { strings: false, wasm: false } });
    const expected = ['测试装备', '测试装备 [1词条]', '测试装备 [5词条]', '测试装备', '测试装备', '测试装备'];
    if (checks !== JSON.stringify(expected)) throw new Error('incorrect item option display');
  } catch {
    throw new Error('localization-mount:item-options-display');
  }
}

function localizationUiText(source) {
  const strings = [];
  // Decode JS literals: serialization may change quote/backslash spelling even
  // when the rendered attribute or label has not changed. Limit the audit to UI
  // regions so localized display words cannot change a data/resource key.
  for (const match of source.matchAll(/\/\/#region src\/UI\/[^\r\n]+\r?\n([\s\S]*?)\/\/#endregion/g)) {
    const file = ts.createSourceFile('localization-ui.js', match[1], ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    function visit(node) {
      if (ts.isStringLiteralLike(node) || [ts.SyntaxKind.TemplateHead, ts.SyntaxKind.TemplateMiddle, ts.SyntaxKind.TemplateTail].includes(node.kind)) strings.push(node.text);
      ts.forEachChild(node, visit);
    }
    visit(file);
  }
  return strings.join('\n');
}


// Source: scripts/lastro-skill-localization.mjs
/**
 * LASTRO skill-data localization overlay.
 *
 * Skill names and skill descriptions are intentionally kept apart from the
 * general UI/job localization table.  The runtime can select either the
 * regular or LastRO skill Lua files, so this overlay is applied after those
 * files have been parsed and works for both sources.
 */

/**
 * Bundled Chinese names, project translations, and reviewed terminology.
 *
 * Keep keys equal to SkillConst names.  Unknown keys are ignored by the
 * runtime overlay, which lets this list remain compatible with older skill
 * tables while the data is being reviewed.
 */



export const SKILL_NAME_OVERRIDES = {
  ...BUNDLED_SKILL_NAMES,
  ...EXTRA_SKILL_NAMES,
  NV_BASIC: '基本技能',

  SM_SWORD: '剑术修炼',
  SM_TWOHAND: '双手剑修炼',
  SM_RECOVERY: 'HP恢复力提升',
  SM_BASH: '狂击',
  SM_PROVOKE: '挑衅',
  SM_MAGNUM: '怒爆',
  SM_ENDURE: '霸体',

  MG_SRECOVERY: '禅心',
  MG_SIGHT: '火狩',
  MG_NAPALMBEAT: '心灵爆破',
  MG_SAFETYWALL: '暗之障壁',
  MG_SOULSTRIKE: '圣灵召唤',
  MG_COLDBOLT: '冰箭术',
  MG_FROSTDIVER: '冰冻术',
  MG_STONECURSE: '石化术',
  MG_FIREBALL: '火球术',
  MG_FIREWALL: '火墙术',
  MG_FIREBOLT: '火箭术',
  MG_LIGHTNINGBOLT: '雷击术',
  MG_THUNDERSTORM: '雷爆术',

  AL_DP: '天使之护',
  AL_DEMONBANE: '天使之击',
  AL_RUWACH: '光猎',
  AL_PNEUMA: '光之障壁',
  AL_TELEPORT: '瞬间移动',
  AL_WARP: '传送之阵',
  AL_HEAL: '治愈术',
  AL_INCAGI: '加速术',
  AL_DECAGI: '缓速术',
  AL_CURE: '复原术',
  AL_BLESSING: '天使之赐福',
  AL_ANGELUS: '天使之障壁',

  TF_DOUBLE: '二刀连击',
  TF_MISS: '残影',
  TF_STEAL: '偷窃',
  TF_HIDING: '隐匿',
  TF_POISON: '施毒',
  TF_DETOXIFY: '解毒',

  AC_OWL: '鸮枭之眼',
  AC_VULTURE: '苍鹰之眼',
  AC_CONCENTRATION: '心神凝聚',
  AC_DOUBLE: '二连矢',
  AC_SHOWER: '箭雨',

  MC_INCCARRY: '负重增加',
  MC_DISCOUNT: '低价买进',
  MC_OVERCHARGE: '高价卖出',
  MC_PUSHCART: '手推车',
  MC_IDENTIFY: '鉴定',
  MC_VENDING: '露天商店',
  MC_MAMMONITE: '金钱攻击',
};

/**
 * SkillDescription is an ID -> newline-separated string table. Keep this map
 * empty until a description needs a correction to the bundled GBK source;
 * names can be shipped independently without replacing a complete tooltip
 * with a partial translation.
 */
export const SKILL_DESCRIPTION_OVERRIDES = {};


// Source: scripts/lastro-ui-text.mjs




const require = createRequire(import.meta.url);
const { parseFragment } = createRequire(require.resolve('jsdom/package.json'))('parse5');
const normalizeText = text => text.trim().replace(/\s+/gu, ' ');
const commonText = new Map(RUNTIME_TEXT_REPLACEMENTS
  .filter(([from, to]) => /^>[^<>]+<$/.test(from) && /^>[^<>]+<$/.test(to))
  .map(([from, to]) => [normalizeText(from.slice(1, -1)), normalizeText(to.slice(1, -1))]));

for (const [from, to] of Object.entries({
  'Púb.': '公开',
  'Priv.': '私密',
  'Num:': '数量：',
  '1:1 Chat': '私聊',
  "Adventurer's Agency": '冒险者招募',
  'Alarm when receive a 1:1 Chat': '收到私聊时提醒',
  'Create Guild': '创建公会',
  'Tax': '税率',
  'on': '开启',
  'Pixel Perfect Sprites': '像素精确精灵',
  'Force nearest neighbor filtering': '使用最近邻过滤',
  'Intensity:': '强度：',
  'Area:': '范围：',
  'Contr. Adapt. Sharp. (CAS)': '对比度自适应锐化（CAS）',
  'Contrast:': '对比度：',
  'Sharpening:': '锐化：',
  'Subpix:': '子像素：',
  'Edge Threshold:': '边缘阈值：',
  'Cartoon': '卡通效果',
  'Power:': '强度：',
  'Edge Slope:': '边缘斜率：',
  'Performance Mode': '性能模式',
  'Culling Area:': '显示范围：',
  'Force nearest neighbor filtering for pixel-perfect sprite rendering': '使用最近邻过滤，保持精灵像素清晰',
  'Add a glowing bloom effect to bright areas': '为明亮区域添加泛光效果',
  'Apply a blur effect to the screen': '为画面添加模糊效果',
  'Contrast Adaptive Sharpening for enhanced details': '通过对比度自适应锐化增强细节',
  'Fast Approximate Anti-Aliasing for smoother edges': '使用快速近似抗锯齿使边缘更平滑',
  'Cartoon rendering effect for stylized visuals': '使用卡通风格渲染效果',
  'Increase color intensity and saturation': '提高颜色强度与饱和度',
  'Hide objects outside the viewing area, enable downsampling rendering and others to improve performance': '隐藏视野外的对象，并使用降低渲染分辨率等方式提高性能',
  'Macros': '宏指令',
  'Sensitivity:': '灵敏度：',
  'Deadline:': '死区阈值：',
  'Define how targets are selected in combat': '设置战斗时选择目标的方式',
  'Choose how skills are cast with gamepad': '设置使用手柄施放技能的方式',
  'Adjust mouse movement sensitivity for R3 stick': '调整 R3 摇杆移动鼠标的灵敏度',
  'Disable mouse input from gamepad for UI interaction': '禁用手柄对界面的虚拟鼠标输入',
  'Swap L3 and R3 stick functions': '交换 L3 与 R3 摇杆的功能',
  'Automatically hide UI during gameplay mouse movement': '游戏中移动鼠标时自动隐藏界面',
  'Set deadzone threshold for analog sticks': '设置模拟摇杆的死区阈值',
  'view skill info': '查看技能信息',
  '1st': '一转',
  '2nd': '二转',
  '3rd': '三转',
  '4th': '四转',
  'Monster': '魔物',
  'monster': '魔物',
  'title': '标题',
  'summary': '摘要',
  'objective': '目标',
  'killed': '已击败',
  'limited': '目标数量',
  'GROUP:': '分组：',
  "World Map (Ctrl + ')": "世界地图（Ctrl + '）",
  "Adventurer's Agency (Ctrl + Z)": '冒险者招募（Ctrl + Z）',
  'Charging': '充值',
  "Don't ask the Quantity of Items": '不询问物品数量',
  "Pincodewindow": '安全码',
  'Sign Up': '注册',
  'Full Screen': '全屏',
  'Unlimited': '无限制',
  'Set 1': '第 1 组',
  'Set 2': '第 2 组',
  'Item Search': '物品搜索',
  'Search...': '搜索……',
  'No file selected': '未选择文件',
  'Captcha Answer': '请输入验证码',
  'Open Source Ragnarok Online Web Client': '开源 RO 网页客户端',
  'Author:': '作者：',
  'Site:': '网站：',
  'Source:': '源码：',
  'roBrowser is an open source project based on the game Ragnarok Online.': 'roBrowser 是基于 Ragnarok Online 的开源项目。',
  "It's not affiliated in any way with Gravity.": '此项目与 Gravity 无关联。',
  'The concept is to reproduce the game using web technologies (HTML5, Javascript, WebGL) to bring it to Web Browsers.': '通过网页技术（HTML5、JavaScript、WebGL）重现游戏，使其能在浏览器中运行。',
  'Cross-platform: runs on Windows, Linux, macOS, and any device with WebGL support.': '支持 Windows、Linux、macOS 及具备 WebGL 支持的设备。',
  '⚙ Settings': '⚙ 设置',
  'Using clientinfo.xml file stored in my FullClient': '使用完整客户端中的 clientinfo.xml 文件',
  'Using servers from the current list:': '使用当前列表中的服务器：',
  'Address': '地址',
  'Langtype': '语言类型',
  'Packet Ver': '封包版本',
  '+ Add Server': '+ 添加服务器',
  'UNOFFICIAL': '非官方',
  'Drop GRF / data files here': '将 GRF / data 文件拖放到这里',
  'or click to browse': '或点击选择文件',
})) commonText.set(from, to);

for (let index = 0; index <= 10; index++) {
  commonText.set(`Macro ${index}`, `宏 ${index}`);
  commonText.set(`Flag ${index}`, `标记 ${index}`);
}

const componentText = {
  'Navigation/Navigation': { ALL: '全部', MOB: '魔物', 'Mouse:': '鼠标：' },
  'PartyFriends/PartyFriendsV1/PartyFriendsV1': { Cap: '人数' },
  'WhisperBox/WhisperBox': { 'With weeeee (Friend) *^.^* [813-338]': '私聊' },
  'Guild/Guild': { R: '正', W: '邪', V: '俗', F: '誉', Job: '职业' },
  'Mail/Mail': { To: '收件人' },
  'Storage/StorageV3/Storage': { Ammo: '弹药' },
  'Enchant/Enchant': { TAX: '费用' },
  'NpcStore/NpcStore': { "]'s Points:": ']的点数：' },
};

// Only reviewed display literals are eligible, and only in their component.
// Identifiers such as Storage/Inventory, action enums, and resource paths must
// keep their original spelling even when the same word is a translated label.
const componentJsText = {
  'ChatBox/ChatBox': {
    'Chat font x1.0': '聊天字号 ×1.0',
    'Chat font x1.2': '聊天字号 ×1.2',
    'Chat font x1.4': '聊天字号 ×1.4',
    'New Tab': '新页签',
    'Chat History [': '聊天记录 [',
    ' can be saved by <a style="color:#F88" download="ChatHistory [': ' 可通过以下链接保存：<a style="color:#F88" download="ChatHistory [',
    '" target="_blank">clicking here</a>.': '" target="_blank">点击保存</a>。',
  },
  'InputBox/InputBox': { 'Input Price': '请输入价格', 'Input your Shop Name': '请输入商店名称' },
  'Navigation/Navigation': { ' (no path found)': '（未找到路线）', 'Map Click': '地图选定位置' },
  'WhisperBox/WhisperBox': { 'With ': '与 ', ' (Friend)': '（好友）' },
  'PartyFriends/PartyMemberExternal/PartyMemberExternal': { 'Remove small party window': '关闭迷你队伍窗口' },
  'PartyFriends/PartyFriendsCommon': { Unknown: '未知' },
  'GuildCompanion/GuildCompanion': {
    'Disband the Guild': '解散公会', 'Enter Guild Name': '请输入公会名称', 'Create Guild': '创建公会', 'Guild Name': '公会名称',
  },
  'Guild/Guild': { 'If you are using a guild storage, all items inside it will disappear.': '若正在使用公会仓库，仓库内的所有物品将会消失。' },
  'GraphicsOption/GraphicsOption': { '[System] Pixel Perfect is disabled. Reload the page (F5) to apply the changes.': '[系统] 已关闭像素精确显示，请刷新页面（F5）使设置生效。' },
  'ShortCutOption/ShortCutOption': { 'N/A': '未设置' },
  'CheckAttendance/CheckAttendance': {
    'Currently there is no attendance check event.': '当前没有签到活动。',
    ' Day attendance success': ' 天签到成功',
    'Event Period: From ': '活动时间：从 ',
    ' ~ Until ': ' 至 ',
    ' (Month/Day) 24:00': '（月／日）24:00',
    'Click the item to claim day ': '点击物品领取第 ',
    ' reward': ' 天奖励',
    ' Day</div></li>': ' 天</div></li>',
  },
  'Achievement/Achievement': { Unknown: '未知', 'Select an achievement': '请选择一项成就' },
  'Enchant/Enchant': {
    Unknown: '未知',
    'Enchant data missing.': '缺少附魔数据。',
    'No enchantable items.': '没有可附魔的物品。',
    'Select an item': '请选择物品',
    'Result: ': '结果：',
    'Slot ': '栏位 ',
    'Enchant data missing for this group.': '缺少此组的附魔数据。',
    'Invalid item.': '无效的物品。',
    'Item must be in inventory.': '物品必须位于背包中。',
    'Item cannot be in equipment switch.': '物品不能放在装备切换栏中。',
    'Item attribute must be normal.': '物品必须处于正常状态。',
    'Item is not valid for this enchant group.': '此物品不适用于这组附魔。',
    'Refine level too low.': '精炼等级不足。',
    'Enchant grade too low.': '附魔等级不足。',
    'Random options not allowed.': '不允许带有随机属性的物品。',
    'Select an item first.': '请先选择物品。',
    'No available enchant slot.': '没有可用的附魔栏位。',
    'Select a perfect enchant.': '请选择完美附魔。',
    'Invalid perfect enchant selection.': '所选完美附魔无效。',
    'Select an upgrade slot.': '请选择升级栏位。',
    'Request sent...': '已发送请求……',
    'Enchant result: ': '附魔结果：',
    'Request in progress...': '正在处理请求……',
    'Enchant data missing for group ': '缺少附魔组的数据：',
  },
  'Storage/StorageCommon': { Search: '搜索结果', Items: '物品' },
  'Equipment/EquipmentCommon': { 'Remove Title': '取消称号' },
  'Captcha/CaptchaSelector': { Unknown: '未知' },
  'Captcha/CaptchaAnswer': { 'Remaining chance: 0': '剩余次数：0' },
  'SkillListMH/SkillListMH': { 'Homunculus Skills': '生命体技能', 'Mercenary Skills': '佣兵技能' },
  'ShortCut/ShortCut': { 'Skill ': '技能 ' },
  'PetInformations/PetInformations': { 'Evolution ': '进化 ', 'Evolution - ': '进化 - ' },
  'PetEvolution/PetEvolution': { 'Item ': '物品 ' },
  'VendingReport/VendingReport': { Unknown: '未知' },
  'ChangeCart/ChangeCart': { 'Change Cart!!': '更换手推车！', 'Close your Room first!!': '请先关闭聊天室！' },
  'CashShop/CashShop': {
    'No items found in auction search': '未找到商品。',
    'Max Quantity 99!': '数量最多为 99！',
    'Minimum Quantity 1!': '数量至少为 1！',
    '8 Items can only be stored in cart!': '购物车最多可放入 8 种商品！',
    'Are you sure you want to buy this items?': '确定购买这些物品吗？',
    'You dont have enough Kafra Points!': '卡普拉点数不足！',
    'No item in cart!': '购物车中没有物品！',
    'Successfully done buying items from cash shop!': '商城购买成功！',
    'Insuficient cash points or kafra points!': '现金点或卡普拉点数不足！',
    "You are over you're weight limit!": '超过负重上限！',
    'You are over youre weight limit!': '超过负重上限！',
    'Something went wrong while using cashshop!': '商城操作失败！',
  },
  'WinLogin/WinLoginCommon': {
    'Please select a Ragnarok replay file (.rrf).': '请选择 RO 回放文件（.rrf）。',
    'Could not load the replay file.\n': '无法读取回放文件。\n',
    'No registration URL was provided.\nIf this server uses simplified registration, then input your new:\n - Username followed by _M for Male and _F for Female account (Eg: MyUser_M)\n - Password.': '未提供注册页面地址。\n如果此服务器支持简易注册，请输入新的账号和密码。\n男性账号在账号名末尾添加 _M，女性账号添加 _F（例如 MyUser_M）。',
  },
  'Intro/Intro': {
    ' files selected': ' 个文件已选择',
    ' GiB saved': ' GiB 空间已释放',
    ' MiB saved': ' MiB 空间已释放',
    ' KiB saved': ' KiB 空间已释放',
  },
};

function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function ownText(table, key) {
  return table && Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;
}

function applyEdits(source, edits) {
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  }
  return source;
}

function localizeTemplate(html, component) {
  const root = parseFragment(html, { sourceCodeLocationInfo: true });
  const scopedText = componentText[component] || {};
  const edits = [];
  function visit(node) {
    if (node.tagName === 'script' || node.tagName === 'style') return;
    // QuestV1's empty title uses msgid, which neither UIText nor the GUI reads.
    // Bind only this display label through the native data-text path and retain
    // the packaged Chinese caption when the message table is unavailable.
    if (component === 'Quest/QuestV1/QuestV1' && node.tagName === 'ui-text'
        && node.attrs.some(attr => attr.name === 'class' && attr.value === 'title')
        && node.attrs.some(attr => attr.name === 'msgid' && attr.value === '1317')
        && !node.attrs.some(attr => attr.name === 'msg' || attr.name === 'data-text')
        && node.childNodes.every(child => child.nodeName === '#text' && !normalizeText(child.value))) {
      const location = node.sourceCodeLocation;
      const binding = location?.attrs?.msgid;
      if (binding && location.startTag && location.endTag) {
        const raw = html.slice(binding.startOffset, binding.endOffset);
        edits.push({ start: binding.startOffset, end: binding.endOffset, text: raw.replace(/^msgid(?=\s*=)/iu, 'data-text') });
        edits.push({ start: location.startTag.endOffset, end: location.endTag.startOffset, text: '任务目录' });
      }
    }
    if (component === 'Intro/Intro' && node.attrs?.some(attr => attr.name === 'class' && attr.value === 'loading-text')) {
      const letters = node.childNodes.filter(child => child.tagName === 'span').flatMap(child => child.childNodes);
      if (letters.length === 10 && letters.every(child => child.nodeName === '#text') && letters.map(child => child.value).join('') === 'Loading...') {
        const translated = ['正', '在', '加', '载', '中', '', '', '.', '.', '.'];
        for (const [index, letter] of letters.entries()) {
          const location = letter.sourceCodeLocation;
          if (location) edits.push({ start: location.startOffset, end: location.endOffset, text: translated[index] });
        }
      }
    }
    if (node.nodeName === '#text' && node.sourceCodeLocation) {
      const original = normalizeText(node.value);
      let translated = ownText(scopedText, original) ?? commonText.get(original);
      // These are alphabetical sort modes, not item upgrade/downgrade actions.
      if (component === 'Storage/StorageV3/Storage' && node.parentNode?.tagName === 'option') {
        translated = { BASE: '默认顺序', UPGRADE: '名称升序', DOWNGRADE: '名称降序' }[
          node.parentNode.attrs.find(attr => attr.name === 'value')?.value
        ] ?? translated;
      }
      if (translated !== undefined && translated !== original) {
        const { startOffset: start, endOffset: end } = node.sourceCodeLocation;
        const raw = html.slice(start, end);
        const leading = raw.match(/^\s*/u)[0];
        const trailing = raw.match(/\s*$/u)[0];
        edits.push({ start, end, text: leading + escapeHtml(translated) + trailing });
      }
    }
    for (const attr of node.attrs || []) {
      if (!['title', 'placeholder', 'alt', 'aria-label', 'data-title'].includes(attr.name)) continue;
      const original = normalizeText(attr.value);
      const translated = ownText(scopedText, original) ?? commonText.get(original);
      const location = node.sourceCodeLocation?.attrs?.[attr.name];
      if (translated === undefined || translated === original || !location) continue;
      const raw = html.slice(location.startOffset, location.endOffset);
      const match = raw.match(/^([^=]+\s*=\s*)(?:"[\s\S]*"|'[\s\S]*'|[^\s]+)$/u);
      if (match) edits.push({ start: location.startOffset, end: location.endOffset, text: match[1] + '"' + escapeHtml(translated) + '"' });
    }
    for (const child of node.childNodes || []) visit(child);
    if (node.content) visit(node.content);
  }
  visit(root);
  return applyEdits(html, edits);
}

function templateToken(node, text) {
  const escaped = text.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${');
  const start = node.kind === ts.SyntaxKind.TemplateHead ? '`' : '}';
  const end = node.kind === ts.SyntaxKind.TemplateTail ? '`' : '${';
  return start + escaped + end;
}

function isDataKey(node) {
  const parent = node.parent;
  if ((ts.isPropertyAssignment(parent) || ts.isMethodDeclaration(parent)) && parent.name === node) return true;
  if (ts.isElementAccessExpression(parent) && parent.argumentExpression === node) return true;
  if (ts.isCaseClause(parent) && parent.expression === node) return true;
  if (ts.isBinaryExpression(parent) && [
    ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken,
    ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken,
  ].includes(parent.operatorToken.kind)) return true;
  if (ts.isCallExpression(parent) && parent.arguments[0] === node && ts.isPropertyAccessExpression(parent.expression)) {
    return ['addEventListener', 'removeEventListener', 'querySelector', 'querySelectorAll', 'getAttribute', 'setAttribute', 'getElementById'].includes(parent.expression.name.text);
  }
  return false;
}

/** Patch parsed UI templates and reviewed display literals; leave other regions unchanged. */
export function patchRuntimeUiText(source) {
  return source.replace(/\/\/#region (src\/UI\/Components\/([^\r\n]+)\.(html\?raw|js))\r?\n([\s\S]*?)\/\/#endregion/g,
    (region, _path, component, kind, body) => {
      // The world map has its own complete Chinese template overlay. Its
      // upstream initializer also removes controls by their English text.
      if (component === 'WorldMap/WorldMap' && kind === 'html?raw') return region;
      const text = componentJsText[component];
      if (kind === 'js' && !text) return region;
      const file = ts.createSourceFile('ui-region.js', body, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
      if (file.parseDiagnostics.length) throw new Error(`anchor:ui-text:${component}`);
      const edits = [];
      function visit(node) {
        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
          if (kind === 'js' && isDataKey(node)) return;
          const translated = kind === 'html?raw' && node.text.includes('<')
            ? localizeTemplate(node.text, component)
            : ownText(text, node.text);
          if (translated !== undefined && translated !== node.text) edits.push({ start: node.getStart(file), end: node.end, text: JSON.stringify(translated) });
        } else if ([ts.SyntaxKind.TemplateHead, ts.SyntaxKind.TemplateMiddle, ts.SyntaxKind.TemplateTail].includes(node.kind)) {
          const translated = ownText(text, node.text);
          if (translated !== undefined && translated !== node.text) edits.push({ start: node.getStart(file), end: node.end, text: templateToken(node, translated) });
        }
        ts.forEachChild(node, visit);
      }
      visit(file);
      const offset = region.indexOf(body);
      return region.slice(0, offset) + applyEdits(body, edits) + region.slice(offset + body.length);
    });
}


// Source: scripts/lastro-ui-messages.mjs


// IDs and source strings are taken from the packaged message table and native UI.
// Preserve unknown values, Chinese TXT translations and RO abbreviations.
export const UI_MESSAGE_OVERRIDES = {
  99: { source: '1:1 Chat', label: '私聊' },
  1259: { source: 'Input Number', label: '输入数值' },
  2209: { source: 'Mob', label: '魔物' },
  2776: { source: '1 z UP', label: '增加1' },
  2777: { source: '1 z Down', label: '减少1' },
  2778: { source: 'Max', label: '最大值' },
  3111: { source: 'CHANGE', label: '切换' },
  3231: { source: 'Cap', label: '队员' },
  3504: { source: "Adventurer's Agency", label: '冒险家中介' },
};

/** Self-contained so the same implementation can be embedded in the native DB. */
export function createLastroUiMessages(overrides = UI_MESSAGE_OVERRIDES) {
  const isChinese = text => typeof text === 'string' && /[\u3400-\u9fff]/u.test(text);

  function parseCsv(text) {
    const rows = [];
    let row = [], value = '', quoted = false;
    for (let index = 0; index < text.length; index++) {
      const character = text[index];
      if (character === '"') {
        if (quoted && text[index + 1] === '"') { value += '"'; index++; }
        else if (quoted || value.length === 0) quoted = !quoted;
        else value += character;
      } else if (!quoted && character === ',') {
        row.push(value); value = '';
      } else if (!quoted && (character === '\r' || character === '\n')) {
        row.push(value); rows.push(row); row = []; value = '';
        if (character === '\r' && text[index + 1] === '\n') index++;
      } else value += character;
    }
    if (quoted) return null;
    if (row.length || value.length) { row.push(value); rows.push(row); }
    return rows;
  }

  function loadCsv(data, targetTable, decode) {
    const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
    const text = decode(bytes).replace(/^\uFEFF/, '');
    // Keep the native legacy Base64/TAB handling outside this narrowly scoped fix.
    if (text.trimEnd().endsWith('=') || !/^MSI_[^,\r\n]+,/.test(text)) return false;
    const rows = parseCsv(text);
    if (!rows || text.includes('\uFFFD')) return false;
    for (let id = 0; id < rows.length; id++) {
      const row = rows[id];
      if (!/^(?:MSI|MIS)_/.test(row[0] || '') || row.length !== 2) continue;
      const value = row[1];
      const previous = targetTable[id];
      // Blank records reserve their ID. Never shift later rows or downgrade TXT Chinese.
      if (isChinese(previous)) continue;
      if (isChinese(value) || typeof previous !== 'string' || !previous.trim()) targetTable[id] = value;
    }
    return true;
  }

  function resolveMessage(id, value, defaultText) {
    if (!Object.prototype.hasOwnProperty.call(overrides, id)) return undefined;
    const entry = overrides[id];
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
      if (defaultText !== undefined && defaultText !== '' && defaultText !== entry.source) return undefined;
      return entry.label;
    }
    if (typeof value === 'string' && value.trim() === entry.source) return entry.label;
    return undefined;
  }
  return { loadCsv, resolveMessage };
}

export function patchRuntimeUiMessages(source) {
  const marker = '//#region src/DB/DBManager.js';
  const start = source.indexOf(marker);
  if (start === -1) return source;
  const end = source.indexOf('//#endregion', start);
  if (end === -1 || source.lastIndexOf(marker) !== start || source.includes('const LastROUiMessages =')) throw new Error('anchor:ui-message-region');
  const section = source.slice(start, end);
  const file = ts.createSourceFile('DBManager.js', section, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const loaders = [], methods = [];
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'loadCSV') loaders.push(node);
    if (ts.isMethodDeclaration(node) && node.name.getText(file) === 'getMessage') methods.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (loaders.length !== 1 || methods.length !== 1) throw new Error('anchor:ui-message-functions');
  const loader = loaders[0], method = methods[0];
  if (loader.parameters.map(node => node.name.getText(file)).join(',') !== 'filename,targetTable,keyIndex,valueIndex,onEnd'
      || method.parameters.map(node => node.name.getText(file)).join(',') !== 'id,defaultText'
      || !method.modifiers?.some(node => node.kind === ts.SyntaxKind.StaticKeyword)
      || !method.body?.getText(file).includes('if (!(id in MsgStringTable))')) throw new Error('anchor:ui-message-signatures');
  const callbacks = [];
  function findCallback(node) {
    if (ts.isCallExpression(node) && node.expression.getText(file) === 'Client.loadFile'
        && node.arguments[0]?.getText(file) === 'filename' && ts.isFunctionExpression(node.arguments[1])) callbacks.push(node.arguments[1]);
    ts.forEachChild(node, findCallback);
  }
  findCallback(loader);
  if (callbacks.length !== 1 || callbacks[0].parameters.map(node => node.name.getText(file)).join(',') !== 'data') throw new Error('anchor:ui-message-loader');
  const insertions = [
    { at: start + callbacks[0].body.getStart(file) + 1, text: '\n      if (filename === "data/msgstringtable.csv" && keyIndex === 0 && valueIndex === 1 && LastROUiMessages.loadCsv(data, targetTable, bytes => CodepageManager.decode(bytes, "utf-8"))) {\n        if (typeof onEnd === "function") onEnd();\n        return;\n      }\n' },
    { at: start + method.body.getStart(file) + 1, text: '\n      const lastroUiMessage = LastROUiMessages.resolveMessage(id, MsgStringTable[id], defaultText);\n      if (lastroUiMessage !== undefined) return lastroUiMessage;\n' },
  ];
  for (const insertion of insertions.sort((a, b) => b.at - a.at)) source = source.slice(0, insertion.at) + insertion.text + source.slice(insertion.at);
  return `const LastROUiMessages = (${createLastroUiMessages.toString()})(${JSON.stringify(UI_MESSAGE_OVERRIDES)});\n` + source;
}


// Source: scripts/lastro-item-name.mjs


/** Enchants share the four card fields but have no normal card affix. */
export function lastroItemEnchantName(info, normalCardResource) {
  if (!info || typeof info !== 'object') return '';
  const clean = value => typeof value === 'string' ? value.replace(/\^[a-f\d]{6}/gi, '').trim() : '';
  const affix = clean(info.prefixName);
  const knownEnchant = info._lastroEnchant === true;
  let name;
  if (/^\[[^[\]]+\]$/.test(affix)) name = affix.slice(1, -1).trim();
  else {
    // The packaged itemInfo tables give enchants their actual name even when
    // unidentified. Normal cards instead use an unidentified "card" label.
    // Do not infer this from a slot position or numeric item-ID range.
    if (affix && !knownEnchant) return '';
    const identified = clean(info.identifiedDisplayName);
    const unidentified = clean(info.unidentifiedDisplayName);
    if (!identified || (!knownEnchant && identified !== unidentified) || /卡片|card|カード|카드|卡$|unknown item/i.test(identified)
      || (normalCardResource && info.identifiedResourceName === normalCardResource)
      || Number(info.slotCount || 0) !== 0 || Number(info.ClassNum || 0) !== 0) return '';
    name = identified;
  }
  if (!name || /[<>[\]]/.test(name)) return '';
  // Keep the resource/display tables untouched; compact only the name suffix.
  name = name.replace(/\s*(?:lv\.?|level)\s*(\d+)\s*$/i, '$1')
    .replace(/(\d+)\s*lv\.?\s*$/i, '$1');
  return name;
}

function replaceOne(source, needle, replacement, label) {
  if (source.split(needle).length !== 2) throw new Error('anchor:item-name:' + label);
  return source.replace(needle, replacement);
}

export function patchRuntimeItemName(source) {
  const marker = '//#region src/DB/DBManager.js';
  const start = source.indexOf(marker);
  if (start < 0) return source;
  const end = source.indexOf('//#endregion', start);
  if (end < 0 || source.indexOf(marker, start + marker.length) >= 0) throw new Error('anchor:item-name:region');
  const region = source.slice(start, end);
  if (region.includes('lastroItemEnchantName')) throw new Error('anchor:item-name:already-patched');
  const file = ts.createSourceFile('DBManager.js', region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const methods = [];
  function visit(node) {
    if (ts.isMethodDeclaration(node) && node.name.getText(file) === 'getItemName') methods.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (methods.length !== 1 || !methods[0].body) throw new Error('anchor:item-name:method');
  const method = methods[0];
  let body = method.body.getText(file).replace(/\r\n/g, '\n');
  body = replaceOne(body, 'if (numOfOptions) str += " [" + numOfOptions + " Option]";',
    'if (numOfOptions) str += " [" + numOfOptions + "词条]";', 'option-label');
  body = replaceOne(body, '        showItemOptions = true,',
    '        showItemOptions = true,\n        showItemEnchants = true,', 'options');
  body = replaceOne(body, '      let prefix = "";',
    '      const enchants = [];\n      let prefix = "";', 'suffix-list');
  body = replaceOne(body, '              if (card) {', `              if (card) {
                const cardInfo = DB.getItemInfo(card);
                const enchantName = lastroItemEnchantName(cardInfo, DB.getItemInfo(4001).identifiedResourceName);
                if (enchantName) { enchants.push(enchantName); continue; }
                // Missing card-name data must not produce an empty Double/Triple.
                if (!cardInfo.prefixName || !cardInfo.prefixName.trim()) continue;`, 'card-classification');
  body = replaceOne(body, '      return str;',
    '      if (showItemEnchants && showItemPostfix) {\n        for (const enchant of enchants) str += " [" + enchant + "]";\n      }\n      return str;', 'suffix-output');
  const changes = [{ start: method.body.getStart(file), end: method.body.end, text: body }];
  const nameRegistrations = [];
  function findNames(node) {
    if (ts.isBinaryExpression(node) && node.left.getText(file) === 'ItemDBNameTbl[decoded_baseItem]'
      && node.right.getText(file) === 'itemID') nameRegistrations.push(node.parent);
    ts.forEachChild(node, findNames);
  }
  findNames(file);
  if (nameRegistrations.length !== 1) throw new Error('anchor:item-name:item-db-names');
  changes.push({ start: nameRegistrations[0].end, end: nameRegistrations[0].end, text: `
          if (lastroEnchantBases.has(decoded_baseItem))
            (ItemTable_default[itemID] || (ItemTable_default[itemID] = {}))._lastroEnchant = true;` });
  const loaders = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === 'loadEnchantListFile');
  if (loaders.length !== 1) throw new Error('anchor:item-name:enchant-loader');
  const registeredHandlers = new Set(['AddEnchantRate', 'AddPerfectEnchant', 'AddPerfectEnchantMaterial', 'AddUpgradeEnchant', 'AddUpgradeEnchantMaterial']);
  const handlers = new Map();
  let resolver;
  function findRegistrations(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === 'resolveItem') {
      if (resolver) throw new Error('anchor:item-name:resolve-item');
      resolver = node.parent.parent;
    }
    if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left) && node.left.expression.getText(file) === 'ctx'
      && registeredHandlers.has(node.left.name.text)) handlers.set(node.left.name.text, node.right);
    ts.forEachChild(node, findRegistrations);
  }
  findRegistrations(loaders[0]);
  if (!resolver || handlers.size !== registeredHandlers.size) throw new Error('anchor:item-name:enchant-registrations');
  changes.push({ start: resolver.end, end: resolver.end, text: `
        const resolveEnchantItem = (baseName) => {
          lastroEnchantBases.add(baseName);
          const item = resolveItem(baseName);
          if (item.id) (ItemTable_default[item.id] || (ItemTable_default[item.id] = {}))._lastroEnchant = true;
          return item;
        };` });
  for (const [name, handler] of handlers) {
    let count = 0;
    function mark(node) {
      if (ts.isCallExpression(node) && node.expression.getText(file) === 'resolveItem'
        && ['baseName', 'resultName'].includes(node.arguments[0]?.getText(file))) {
        changes.push({ start: node.expression.getStart(file), end: node.expression.end, text: 'resolveEnchantItem' });
        count++;
      }
      ts.forEachChild(node, mark);
    }
    mark(handler);
    if (count !== (name.startsWith('AddUpgrade') ? 2 : 1)) throw new Error('anchor:item-name:enchant-' + name);
  }
  let output = region;
  for (const edit of changes.sort((a, b) => b.start - a.start)) output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  // EnchantList and ItemDBNameTbl can finish in either order. Retain the base
  // names so the name-table callback can resolve enchants registered first.
  output = 'const lastroEnchantBases = new Set();\n' + lastroItemEnchantName.toString() + '\n' + output;
  return source.slice(0, start) + output + source.slice(end);
}


// Source: scripts/lastro-emoticons.mjs


const nativeHandlers = `
function onSelectEmoticon(canvas) {
  const idx = canvas.getAttribute("data-index");
  const cmd = Emotions_default.names[idx];
  if (cmd && ShortCuts_default.ui.is(":visible")) {
    if (ShortCuts_default.ui.find(".input_macro_focus").length) {
      ShortCuts_default.ui.find(".input_macro_focus").val("/" + cmd).select();
      return;
    }
  }
  if (cmd) ChatBox_default.ui.find(".input .message").html("/" + cmd).focus();
}
function onPlayEmoticon(canvas) {
  const idx = canvas.getAttribute("data-index");
  const cmd = Emotions_default.names[idx];
  ChatBox_default.ui.find(".input .message").html("/" + cmd);
  ChatBox_default.submit();
}
`;

const repairedHandlers = `
function onSelectEmoticon(canvas) {
  const idx = canvas?.getAttribute?.("data-index");
  if (typeof idx !== "string" || !/^\\d+$/.test(idx) || !Object.hasOwn(Emotions_default.names, idx)) return;
  const cmd = Emotions_default.names[idx];
  if (typeof cmd !== "string" || !cmd) return;
  const shortcuts = typeof ShortCuts_default === "undefined" ? null : ShortCuts_default;
  if (shortcuts?._host?.isConnected && !shortcuts._host.hidden && shortcuts.ui?.is?.(":visible")) {
    const macro = shortcuts.getRoot?.()?.querySelector("input.input_macro_focus");
    if (macro) {
      macro.value = "/" + cmd;
      macro.select();
      return;
    }
  }
  const chat = typeof ChatBox_default === "undefined" ? null : ChatBox_default;
  const input = chat?.getRoot?.()?.querySelector(".input .message");
  if (!input) return;
  input.textContent = "/" + cmd;
  input.focus();
}
function onPlayEmoticon(canvas) {
  const idx = canvas?.getAttribute?.("data-index");
  if (typeof idx !== "string" || !/^\\d+$/.test(idx) || !Object.hasOwn(Emotions_default.names, idx)) return;
  const cmd = Emotions_default.names[idx];
  if (typeof cmd !== "string" || !cmd) return;
  const chat = typeof ChatBox_default === "undefined" ? null : ChatBox_default;
  const input = chat?.getRoot?.()?.querySelector(".input .message");
  if (!input || typeof chat.submit !== "function") return;
  input.textContent = "/" + cmd;
  chat.submit();
}
`;

const parse = source => ts.createSourceFile('Emoticons.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
function bodyText(node, file) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, node.body.getText(file));
  const tokens = [];
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) tokens.push([token, scanner.getTokenText()]);
  return JSON.stringify(tokens);
}
const nativeFile = parse(nativeHandlers), repairedFile = parse(repairedHandlers);
const expected = new Map(nativeFile.statements.map(node => [node.name.text, bodyText(node, nativeFile)]));
const replacements = new Map(repairedFile.statements.map(node => [node.name.text, node]));
const fail = reason => { throw new Error('anchor:emoticons:' + reason); };

/** Repair only the two legacy input operations; keep the native event and packet paths. */
export function patchRuntimeEmoticons(source) {
  const marker = '//#region src/UI/Components/Emoticons/Emoticons.js';
  const start = source.indexOf(marker);
  if (start < 0) return source;
  if (source.indexOf(marker, start + marker.length) >= 0) fail('duplicate-region');
  const end = source.indexOf('//#endregion', start);
  if (end < 0) fail('missing-region-end');
  const region = source.slice(start, end), file = parse(region);
  if (file.parseDiagnostics.length) fail('invalid-source');
  const edits = [];
  for (const [name, replacement] of replacements) {
    const matches = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
    const fn = matches[0];
    if (matches.length !== 1 || !fn.body || fn.parameters.length !== 1 || fn.parameters[0].name.getText(file) !== 'canvas') fail(name);
    const body = bodyText(fn, file);
    if (body === bodyText(replacement, repairedFile)) continue;
    if (body !== expected.get(name)) fail(name + ':body');
    edits.push({ start: fn.body.getStart(file), end: fn.body.end, text: replacement.body.getText(repairedFile) });
  }
  let output = region;
  for (const edit of edits.sort((a, b) => b.start - a.start)) output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return source.slice(0, start) + output + source.slice(end);
}


// Source: localization coordinators moved from patch-v2-runtime.mjs
function localizationFail(code) {
  throw new Error(JSON.stringify({ code }));
}
function localizationCount(source, needle) {
  return source.split(needle).length - 1;
}
function localizationReplaceOnce(source, needle, replacement) {
  if (localizationCount(source, needle) !== 1) localizationFail(`anchor:${needle}`);
  return source.replace(needle, replacement);
}
const JOB_DISPLAY_LOOKUP_SITES = [
  { region: 'src/UI/Components/PartyFriends/PartyFriendsCommon.js', owner: 'renderPartyMember', receiver: 'Component.renderPartyMember', expression: 'MonsterTable_default[job]', target: { kind: 'variable', name: 'jobName' } },
  { region: 'src/UI/Components/Guild/Guild.js', owner: 'setMember', receiver: 'Guild.setMember', expression: 'MonsterTable_default[member.Job]', target: { kind: 'assignment', name: 'jobCell.textContent' } },
  { region: 'src/UI/Components/Guild/Guild.js', owner: 'setMember', receiver: 'Guild.setMember', expression: 'MonsterTable_default[member.Job]', target: { kind: 'assignment', name: 'jobCell.title' } },
  { region: 'src/UI/Components/BasicInfo/BasicInfoCommon.js', owner: 'update', receiver: 'Component.update', expression: 'MonsterTable_default[val1]', target: { kind: 'assignment', name: 'el.textContent' } },
  { region: 'src/UI/Components/Rodex/WriteRodex.js', owner: 'characterInfo', receiver: 'WriteRodex.characterInfo', expression: 'MonsterTable_default[pkt.Job]', target: { kind: 'variable', name: 'text' } },
  { region: 'src/UI/Components/Captcha/CaptchaSelector.js', owner: 'setPlayers', receiver: 'CaptchaSelector.setPlayers', expression: 'MonsterTable_default[charEntity?._job ?? 0]', target: { kind: 'variable', name: 'charJob' } },
  { region: 'src/UI/Components/Captcha/CaptchaSelector.js', owner: 'setPlayers', receiver: 'CaptchaSelector.setPlayers', expression: 'MonsterTable_default[entity?._job ?? 0]', target: { kind: 'property-in-call', name: 'job', call: '_aidInformation.push' } },
  { region: 'src/UI/Components/CharSelect/CharSelectCommon.js', owner: 'moveCursorToPaginated', parentOwner: 'createCharSelect', expression: 'MonsterTable_default[info.job]', target: { kind: 'assignment', name: 'charinfo.querySelector(".job").textContent' } },
  { region: 'src/UI/Components/CharSelect/CharSelectCommon.js', owner: 'moveCursorToGrid', parentOwner: 'createCharSelect', expression: 'MonsterTable_default[info.job]', target: { kind: 'assignment', name: 'charinfo.querySelector(".job").textContent' } },
];

function jobDisplayUiRegions(source) {
  const regions = [];
  for (const marker of source.matchAll(/\/\/#region (src\/UI\/[^\r\n]+)\r?\n/g)) {
    const start = marker.index + marker[0].length;
    const end = source.indexOf('//#endregion', start);
    if (end < 0) localizationFail('anchor:job-display-lookups');
    const text = source.slice(start, end);
    regions.push({ path: marker[1], start, text, file: ts.createSourceFile(marker[1], text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS) });
  }
  return regions;
}

function jobDisplayOwners(file, name, receiver, parentOwner) {
  const owners = new Set();
  function isFunction(node) { return ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node); }
  function hasParentOwner(node) {
    for (let parent = node.parent; parent; parent = parent.parent) {
      if ((ts.isFunctionDeclaration(parent) || ts.isFunctionExpression(parent) || ts.isMethodDeclaration(parent))
          && parent.name?.getText(file) === parentOwner) return true;
    }
    return false;
  }
  function visit(node) {
    const named = isFunction(node) && node.name?.getText(file) === name;
    const assignedReceiver = receiver && named && ts.isFunctionExpression(node) && ts.isBinaryExpression(node.parent)
      && node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && node.parent.right === node
      && node.parent.left.getText(file) === receiver;
    if (named && (!receiver || assignedReceiver) && (!parentOwner || hasParentOwner(node))) owners.add(node);
    if (!receiver && !parentOwner && ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && isFunction(node.initializer))
      owners.add(node.initializer);
    if (!receiver && !parentOwner && ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && isFunction(node.right)
        && ((ts.isPropertyAccessExpression(node.left) && node.left.name.text === name)
          || (ts.isIdentifier(node.left) && node.left.text === name))) owners.add(node.right);
    ts.forEachChild(node, visit);
  }
  visit(file);
  return [...owners];
}

function jobDisplayContains(parent, child, file) {
  return child.getStart(file) >= parent.getStart(file) && child.end <= parent.end;
}

function jobDisplayTargetMatches(node, owner, target, file) {
  for (let current = node.parent; current && current !== owner; current = current.parent) {
    if (target.kind === 'variable' && ts.isVariableDeclaration(current) && current.name.getText(file) === target.name
        && current.initializer && jobDisplayContains(current.initializer, node, file)) return true;
    if (target.kind === 'assignment' && ts.isBinaryExpression(current)
        && current.operatorToken.kind === ts.SyntaxKind.EqualsToken && current.left.getText(file) === target.name
        && jobDisplayContains(current.right, node, file)) return true;
    if (target.kind === 'property' && ts.isPropertyAssignment(current) && current.name.getText(file) === target.name
        && jobDisplayContains(current.initializer, node, file)) return true;
    if (target.kind === 'property-in-call' && ts.isPropertyAssignment(current) && current.name.getText(file) === target.name
        && jobDisplayContains(current.initializer, node, file)) {
      const object = current.parent;
      if (ts.isObjectLiteralExpression(object) && ts.isCallExpression(object.parent)
          && object.parent.arguments.some(argument => argument === object)
          && object.parent.expression.getText(file) === target.call) return true;
    }
  }
  return false;
}

function exactMonsterPortraitLookup(call, region) {
  const file = region.file;
  if (region.path !== 'src/UI/Components/WorldMap/WorldMap.js' || call.arguments.length !== 3
      || call.arguments[0].getText(file) !== 'Client' || call.arguments[2].getText(file) !== 'document') return null;
  const loader = call.arguments[1];
  if (!ts.isArrowFunction(loader) || loader.parameters.length !== 1
      || !ts.isIdentifier(loader.parameters[0].name) || loader.parameters[0].name.text !== 'id'
      || !ts.isConditionalExpression(loader.body)) return null;
  const condition = loader.body.condition, display = loader.body.whenTrue;
  if (!ts.isElementAccessExpression(condition) || condition.questionDotToken
      || condition.expression.getText(file) !== 'MonsterTable_default' || condition.argumentExpression?.getText(file) !== 'id'
      || !ts.isCallExpression(display) || display.expression.getText(file) !== 'DB.getBodyPath'
      || display.arguments.length !== 2 || display.arguments[0].getText(file) !== 'id'
      || display.arguments[1].kind !== ts.SyntaxKind.NumericLiteral || display.arguments[1].text !== '0'
      || loader.body.whenFalse.kind !== ts.SyntaxKind.NullKeyword) return null;
  return condition;
}

export function patchRuntimeJobLocalization(source) {
  // JobNameTable, PalNameTable and WeaponJobTable contain asset basenames,
  // not UI labels. Never translate these or bodies/weapons/palettes disappear.
  const regions = jobDisplayUiRegions(source);
  const lookups = [];
  const edits = [];
  const selected = new Set();
  for (const site of JOB_DISPLAY_LOOKUP_SITES) {
    const matches = regions.filter(region => region.path === site.region);
    if (matches.length !== 1) localizationFail('anchor:job-display-lookups');
    const region = matches[0];
    const owners = jobDisplayOwners(region.file, site.owner, site.receiver, site.parentOwner);
    if (owners.length !== 1) localizationFail('anchor:job-display-lookups');
    const owner = owners[0], body = owner.body;
    if (!body) localizationFail('anchor:job-display-lookups');
    const candidates = [];
    function visit(node) {
      if (ts.isElementAccessExpression(node) && !node.questionDotToken
          && node.expression.getText(region.file) === 'MonsterTable_default') candidates.push(node);
      ts.forEachChild(node, visit);
    }
    visit(body);
    const target = candidates.filter(node => node.getText(region.file) === site.expression
      && jobDisplayTargetMatches(node, owner, site.target, region.file));
    if (target.length !== 1 || selected.has(target[0])) localizationFail('anchor:job-display-lookups');
    selected.add(target[0]);
    lookups.push({ node: target[0], region });
  }

  const loaderCalls = [];
  for (const region of regions) {
    function visit(node) {
      if (ts.isCallExpression(node)) {
        const expression = ts.isParenthesizedExpression(node.expression) ? node.expression.expression : node.expression;
        if ((ts.isIdentifier(expression) && expression.text === 'createMonsterPortraitLoader')
            || (ts.isFunctionExpression(expression) && expression.name?.text === 'createMonsterPortraitLoader'))
          loaderCalls.push({ node, region });
      }
      ts.forEachChild(node, visit);
    }
    visit(region.file);
  }
  if (loaderCalls.length > 1) localizationFail('anchor:job-display-lookups');
  if (loaderCalls.length === 1) {
    const { node, region } = loaderCalls[0], guard = exactMonsterPortraitLookup(node, region);
    if (!guard) localizationFail('anchor:job-display-lookups');
    selected.add(guard);
  }

  for (const region of regions) {
    if (region.file.parseDiagnostics.length) localizationFail('anchor:job-display-lookups');
    function visit(node) {
      if (ts.isElementAccessExpression(node) && node.expression.getText(region.file) === 'MonsterTable_default'
          && !selected.has(node)) localizationFail('anchor:job-display-lookups');
      ts.forEachChild(node, visit);
    }
    visit(region.file);
  }

  for (const { node, region } of lookups) {
    edits.push({ start: region.start + node.getStart(region.file), end: region.start + node.end,
      text: `lastroJobDisplayName(${node.argumentExpression.getText(region.file)})` });
  }
  let output = source;
  for (const edit of edits.sort((a, b) => b.start - a.start)) output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  const labels = { ...JOB_NAME_OVERRIDES };
  function resolveLabel(key, seen = new Set()) {
    if (Object.hasOwn(labels, key)) return labels[key];
    const target = jobNameAliases[key];
    if (typeof target !== 'string' || seen.has(key)) localizationFail('localization:job-alias:' + key);
    const label = resolveLabel(target, new Set([...seen, key]));
    return labels[key] = key.endsWith('_B') && !target.endsWith('_B') ? '宝宝' + label : label;
  }
  for (const key of Object.keys(jobNameAliases)) resolveLabel(key);
  return `/* LASTRO Chinese job-name overlay: display only, never resource paths. */
const lastroJobLabels = ${JSON.stringify(labels)};
let lastroJobLabelsById;
function lastroJobDisplayName(id) {
  if (!lastroJobLabelsById) {
    init_JobConst();
    lastroJobLabelsById = Object.create(null);
    for (const [key, label] of Object.entries(lastroJobLabels)) {
      const job = JobConst_default[key];
      if (Number.isFinite(job)) lastroJobLabelsById[job] = label;
    }
  }
  return lastroJobLabelsById[id] ?? MonsterTable_default[id];
}
` + output;
}
export function patchRuntimeLocalization(source) {
  let output = source;
  const hasLocalizationAnchors = output.includes('JobNameTable')
    || output.includes('function loadSkillInfoList(filename')
    || RUNTIME_TEXT_REPLACEMENTS.some(([from, to]) => output.includes(from) || output.includes(to))
    || /DB\.getMessage\(\s*\d+\s*,\s*"/.test(output);
  if (!hasLocalizationAnchors) return output;

  if (output.includes('JobNameTable')) output = patchRuntimeJobLocalization(output);

  for (const [from, to] of RUNTIME_TEXT_REPLACEMENTS) {
    const occurrences = localizationCount(output, from);
    if (occurrences > 0) output = output.replaceAll(from, to);
  }

  output = output.replace(/DB\.getMessage\(\s*(\d+)\s*,\s*"[^"]*"/g, (match, messageId) => {
    const fallback = MESSAGE_FALLBACKS[messageId];
    return fallback === undefined ? match : `DB.getMessage(${messageId}, ${JSON.stringify(fallback)}`;
  });
  // ui-text calls DB.getMessage again when mounted. Translate known English
  // table values as well as the HTML fallback, without changing Chinese data.
  if (output.includes('static getMessage(id, defaultText)')) {
    const labels = Object.fromEntries(RUNTIME_TEXT_REPLACEMENTS
      .filter(([from, to]) => /^>[^<>]+<$/.test(from) && /^>[^<>]+<$/.test(to))
      .map(([from, to]) => [from.slice(1, -1), to.slice(1, -1)]));
    const anchor = '      return MsgStringTable[id];';
    output = `const lastroUiMessages = ${JSON.stringify(labels)};\n` + localizationReplaceOnce(output, anchor, '      const text = MsgStringTable[id];\n      return Object.prototype.hasOwnProperty.call(lastroUiMessages, text) ? lastroUiMessages[text] : text;');
  }
  output = patchRuntimeSkillLocalization(output);
  return output;
}
export function patchRuntimeSkillLocalization(source) {
  if (!source.includes('SkillInfo')) return source;
  if (!source.includes('function loadSkillInfoList(filename') || !source.includes('main_skillInfoList()'))
    localizationFail('anchor:skill-loader');

  let output = source;
  // Localize built-in fallbacks too: the Lua file may fail or omit a skill.
  output = output.replace(/(SkillInfo\[SkillConst_default\.([A-Z0-9_]+)\]\s*=\s*\{\s*Name:\s*"[^"]*",\s*SkillName:\s*)"[^"]*"/g,
    (match, prefix, key) => SKILL_NAME_OVERRIDES[key] ? prefix + JSON.stringify(SKILL_NAME_OVERRIDES[key]) : match);
  const skillNameEntries = Object.entries(SKILL_NAME_OVERRIDES);
  if (skillNameEntries.length > 0) {
    const skillNameOverlay = [
      '        /* LASTRO Chinese skill-name overlay */',
      `        const lastroSkillNameOverrides = ${JSON.stringify(Object.fromEntries(skillNameEntries))};`,
      '        for (const [skillName, localizedName] of Object.entries(lastroSkillNameOverrides)) {',
      '          const skillId = SkillConst_default[skillName];',
      '          if (Number.isFinite(skillId) && SkillInfo[skillId]) SkillInfo[skillId].SkillName = localizedName;',
      '        }',
    ].join('\n');
    const skillNameAnchor = '      } catch (error) {\n        console.error("[loadSkillInfoList] Error: ", error);';
    if (localizationCount(output, skillNameAnchor) !== 1) localizationFail('anchor:skill-name-overlay');
    output = output.replace(skillNameAnchor, `${skillNameOverlay}\n${skillNameAnchor}`);
  }

  const skillDescriptionEntries = Object.entries(SKILL_DESCRIPTION_OVERRIDES);
  if (skillDescriptionEntries.length > 0) {
    const skillDescriptionOverlay = [
      '              /* LASTRO Chinese skill-description overlay */',
      `              const lastroSkillDescriptionOverrides = ${JSON.stringify(Object.fromEntries(skillDescriptionEntries))};`,
      '              for (const [skillName, description] of Object.entries(lastroSkillDescriptionOverrides)) {',
      '                const skillId = SkillConst_default[skillName];',
      '                if (Number.isFinite(skillId)) SkillDescription[skillId] = description;',
      '              }',
    ].join('\n');
    const skillDescriptionAnchor = '              SkillDescription = _json;';
    if (localizationCount(output, skillDescriptionAnchor) !== 1) localizationFail('anchor:skill-description-overlay');
    output = output.replace(skillDescriptionAnchor, `${skillDescriptionAnchor}\n${skillDescriptionOverlay}`);
  }
  // Learned skill packets may retain an English name; prefer the local DB.
  output = output.replaceAll('skill.SkillName || info?.SkillName || info?.Name', 'info?.SkillName || skill.SkillName || info?.Name');
  return output;
}
