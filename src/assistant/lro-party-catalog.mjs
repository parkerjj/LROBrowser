// Transcribed from LastRO's public DB/AgencyTable.js (2026-10-12).
// Source: https://game.lastro.cn/ro/src/DB/AgencyTable.js
// Only active entries are included; 45 additional official dungeons are
// present upstream but inside a block comment, so MUST NOT be enabled by default.
const OFFICIAL = Object.freeze([{ name: '无尽之塔', iid: 1, category: '官方副本' }]);
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
