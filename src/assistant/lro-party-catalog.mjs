// Transcribed from LastRO's public DB/AgencyTable.js (2026-10-12).
// Source: https://game.lastro.cn/ro/src/DB/AgencyTable.js
// Only active entries are included; 45 additional official dungeons are
// present upstream but inside a block comment, so MUST NOT be enabled by default.
const OFFICIAL = Object.freeze([ {
					[0] : {
						name:"无尽之塔",
						id:1,
					},
					[1] : {
						name:"封印神殿",
						id:2,
					},
					[2] : {
						name:"兽人的回忆",
						id:3,
					},
					[3] : {
						name:"尼德霍格巢穴",
						id:4,
					},
					[4] : {
						name:"吉芬魔法大赛",
						id:15,
					},
					[5] : {
						name:"古代的克雷斯特汉姆",
						id:12,
					},
					[6] : {
						name:"魔神之塔",
						id:19,
					},
					[7] : {
						name:"莎拉的记忆",
						id:14,
					},
					[8] : {
						name:"幽灵皇宫",
						id:18,
					},
					[9] : {
						name:"拜欧斯之岛",
						id:25,
					},
					[10] : {
						name:"噩梦吉特巴",
						id:24,
					},
					[11] : {
						name:"恐怖玩具工厂",
						id:16,
					},
					[12] : {
						name:"摩尔斯洞穴",
						id:26,
					},
					[13] : {
						name:"魔神殿",
						id:27,
					},
					[14] : {
						name:"人面虫巢穴",
						id:17,
					},
					[15] : {
						name:"查尔斯顿危机",
						id:30,
					},
					[16] : {
						name:"飞空艇袭击",
						id:20,
					},
					[17] : {
						name:"莎拉与芬里尔",
						id:21,
					},
					[18] : {
						name:"尽头的房间",
						id:29,
					},
					[19] : {
						name:"中央实验室",
						id:28,
					},
					[20] : {
						name:"无限空间",
						id:38,
					},
					[21] : {
						name:"迷雾森林",
						id:5,
					},
					[22] : {
						name:"排水沟",
						id:6,
					},
					[23] : {
						name:"八爪鱼巢穴",
						id:7,
					},
					[24] : {
						name:"噩梦医院",
						id:8,
					},
					[25] : {
						name:"宝箱巨鳄之巢",
						id:9,
					},
					[26] : {
						name:"食月暴龙湖泊",
						id:10,
					},
					[27] : {
						name:"生命体研究所",
						id:11,
					},
					[28] : {
						name:"艾卡拉奇",
						id:13,
					},
					[29] : {
						name:"极限挑战 - 森林",
						id:22,
					},
					[30] : {
						name:"极限挑战 - 天空",
						id:23,
					},
					[31] : {
						name:"天使之赐福",
						id:31,
					},
					[32] : {
						name:"过去的仪式之屋",
						id:32,
					},
					[33] : {
						name:"空中要塞",
						id:33,
					},
					[34] : {
						name:"邪心猎人军事基地1",
						id:34,
					},
					[35] : {
						name:"邪心猎人军事基地2",
						id:35,
					},
					[36] : {
						name:"维尔纳研究所1",
						id:36,
					},
					[37] : {
						name:"维尔纳研究所2",
						id:37,
					},
					[38] : {
						name:"周五副本",
						id:46,
					},
					[39] : {
						name:"周末副本",
						id:45,
					},
					[40] : {
						name:"被时间遗忘的饲养场",
						id:55,
					},
					[41] : {
						name:"波利村",
						id:47,
					},
					[42] : {
						name:"水上花园",
						id:56,
					},
					[43] : {
						name:"水上花园困难",
						id:57,
					},
					[44] : {
						name:"秘密花园",
						id:58,
					},
					[45] : {
						name:"白天出来的半月",
						id:44,
					},
				}
			]);
const FEATURED = Object.freeze([
  {
    "name": "黄金虫",
    "iid": 301,
    "category": "特色副本"
  },
  {
    "name": "俄塞里斯",
    "iid": 302,
    "category": "特色副本"
  },
  {
    "name": "死灵",
    "iid": 303,
    "category": "特色副本"
  },
  {
    "name": "巴风特",
    "iid": 304,
    "category": "特色副本"
  },
  {
    "name": "蚁后",
    "iid": 305,
    "category": "特色副本"
  },
  {
    "name": "月夜猫",
    "iid": 306,
    "category": "特色副本"
  },
  {
    "name": "海盗之王",
    "iid": 307,
    "category": "特色副本"
  },
  {
    "name": "黑暗之王",
    "iid": 308,
    "category": "特色副本"
  },
  {
    "name": "德古拉伯爵",
    "iid": 309,
    "category": "特色副本"
  },
  {
    "name": "法老王",
    "iid": 310,
    "category": "特色副本"
  },
  {
    "name": "古埃及王",
    "iid": 311,
    "category": "特色副本"
  },
  {
    "name": "蜂后",
    "iid": 312,
    "category": "特色副本"
  },
  {
    "name": "兽人酋长",
    "iid": 313,
    "category": "特色副本"
  },
  {
    "name": "兽人英雄",
    "iid": 314,
    "category": "特色副本"
  },
  {
    "name": "皮里恩",
    "iid": 315,
    "category": "特色副本"
  },
  {
    "name": "虎王",
    "iid": 316,
    "category": "特色副本"
  },
  {
    "name": "冰暴骑士",
    "iid": 317,
    "category": "特色副本"
  },
  {
    "name": "卡仑",
    "iid": 318,
    "category": "特色副本"
  },
  {
    "name": "死灵骑士",
    "iid": 319,
    "category": "特色副本"
  },
  {
    "name": "墨蛇君",
    "iid": 320,
    "category": "特色副本"
  },
  {
    "name": "元灵武士",
    "iid": 321,
    "category": "特色副本"
  },
  {
    "name": "塔奥群卡",
    "iid": 322,
    "category": "特色副本"
  },
  {
    "name": "乌龟将军",
    "iid": 323,
    "category": "特色副本"
  },
  {
    "name": "阿特罗斯",
    "iid": 324,
    "category": "特色副本"
  },
  {
    "name": "贝思波",
    "iid": 325,
    "category": "特色副本"
  },
  {
    "name": "嗒妮小姐",
    "iid": 326,
    "category": "特色副本"
  },
  {
    "name": "迪塔勒泰晤勒斯",
    "iid": 327,
    "category": "特色副本"
  },
  {
    "name": "基尔",
    "iid": 328,
    "category": "特色副本"
  },
  {
    "name": "影魔",
    "iid": 329,
    "category": "特色副本"
  },
  {
    "name": "寒冰龙",
    "iid": 330,
    "category": "特色副本"
  },
  {
    "name": "堕落大神官",
    "iid": 331,
    "category": "特色副本"
  },
  {
    "name": "贝雷杰",
    "iid": 332,
    "category": "特色副本"
  }
]);
export function getLastROAgencyCatalog(nid) {
  return nid === 3 || nid === 5 ? [...OFFICIAL, ...FEATURED].map(row => ({ ...row })) : [];
}
export const LASTRO_AGENCY_ACTIVE_COUNT = OFFICIAL.length + FEATURED.length;
