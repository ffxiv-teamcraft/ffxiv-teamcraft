export const KOREAN_GAME_SERVERS = [
  '초코보',
  '모그리',
  '카벙클',
  '톤베리',
  '펜리르'
];

export const CHINESE_GAME_SERVERS = [
  'HongYuHai',
  'ShenYiZhiDi',
  'LaNuoXiYa',
  'HuanYingQunDao',
  'MengYaChi',
  'YuZhouHeYin',
  'WoXianXiRan',
  'ChenXiWangZuo',
  'BaiYinXiang',
  'BaiJinHuanXiang',
  'ShenQuanHen',
  'ChaoFengTing',
  'LvRenZhanQiao',
  'FuXiaoZhiJian',
  'Longchaoshendian',
  'MengYuBaoJing',
  'ZiShuiZhanQiao',
  'YanXia',
  'JingYuZhuangYuan',
  'MoDuNa',
  'HaiMaoChaWu',
  'RouFengHaiWan',
  'HuPoYuan',
  'ShuiJingTa2',
  'YinLeiHu2',
  'TaiYangHaiAn2',
  'YiXiuJiaDe2',
  'HongChaChuan2'
];

export const TAIWAN_GAME_SERVERS = [
  '伊弗利特',
  '迦樓羅',
  '利維坦',
  '鳳凰',
  '奧汀',
  '巴哈姆特',
  '拉姆',
  '泰坦'
];

export const GAME_SERVERS = [
  'Adamantoise',
  'Aegis',
  'Alexander',
  'Anima',
  'Asura',
  'Atomos',
  'Bahamut',
  'Balmung',
  'Behemoth',
  'Belias',
  'Brynhildr',
  'Cactuar',
  'Carbuncle',
  'Cerberus',
  'Chocobo',
  'Coeurl',
  'Diabolos',
  'Durandal',
  'Excalibur',
  'Exodus',
  'Faerie',
  'Famfrit',
  'Fenrir',
  'Garuda',
  'Gilgamesh',
  'Goblin',
  'Gungnir',
  'Hades',
  'Hyperion',
  'Ifrit',
  'Ixion',
  'Jenova',
  'Kujata',
  'Lamia',
  'Leviathan',
  'Lich',
  'Louisoix',
  'Malboro',
  'Mandragora',
  'Masamune',
  'Mateus',
  'Midgardsormr',
  'Moogle',
  'Odin',
  'Omega',
  'Pandaemonium',
  'Phoenix',
  'Ragnarok',
  'Ramuh',
  'Ridill',
  'Sargatanas',
  'Shinryu',
  'Shiva',
  'Siren',
  'Tiamat',
  'Titan',
  'Tonberry',
  'Typhon',
  'Ultima',
  'Ultros',
  'Unicorn',
  'Valefor',
  'Yojimbo',
  'Zalera',
  'Zeromus',
  'Zodiark',

// New for 5.0
  'Spriggan',
  'Twintania',

// Materia, 6.08, Oceania DC
  'Bismarck',
  'Ravana',
  'Sephirot',
  'Sophia',
  'Zurvan',

  // Dynamis, 6.28, NA DC
  'Halicarnassus',
  'Maduin',
  'Marilith',
  'Seraph',
  'Cuchulainn',
  'Golem',
  'Kraken',
  'Rafflesia',

  // Chinese servers
  ...CHINESE_GAME_SERVERS,

  // Korean servers
  ...KOREAN_GAME_SERVERS,

    // Traditional Chinese servers
  ...TAIWAN_GAME_SERVERS,

  // New for 6.18
  'Alpha',
  'Phantom',
  'Raiden',
  'Sagittarius'
];

export const GAME_SERVERS_PER_DC = {
  // NA
  'Aether':
    [
      'Adamantoise',
      'Cactuar',
      'Faerie',
      'Gilgamesh',
      'Jenova',
      'Midgardsormr',
      'Sargatanas',
      'Siren'
    ],
  'Primal':
    [
      'Behemoth',
      'Excalibur',
      'Exodus',
      'Famfrit',
      'Hyperion',
      'Lamia',
      'Leviathan',
      'Ultros'
    ],
  'Crystal':
    [
      'Balmung',
      'Brynhildr',
      'Coeurl',
      'Diabolos',
      'Goblin',
      'Malboro',
      'Mateus',
      'Zalera'
    ],
  'Dynamis':
    [
      'Halicarnassus',
      'Maduin',
      'Marilith',
      'Seraph',
      'Cuchulainn',
      'Golem',
      'Kraken',
      'Rafflesia'
    ],

  // EU
  'Chaos':
    [
      'Cerberus',
      'Louisoix',
      'Moogle',
      'Omega',
      'Phantom',
      'Ragnarok',
      'Sagittarius',
      'Spriggan'
    ],
  'Light':
    [
      'Alpha',
      'Lich',
      'Odin',
      'Phoenix',
      'Raiden',
      'Shiva',
      'Twintania',
      'Zodiark'
    ],

  // JP
  'Elemental':
    [
      'Aegis',
      'Atomos',
      'Carbuncle',
      'Garuda',
      'Gungnir',
      'Kujata',
      'Tonberry',
      'Typhon'
    ],
  'Gaia':
    [
      'Alexander',
      'Bahamut',
      'Durandal',
      'Fenrir',
      'Ifrit',
      'Ridill',
      'Tiamat',
      'Ultima'
    ],
  'Mana':
    [
      'Anima',
      'Asura',
      'Chocobo',
      'Hades',
      'Ixion',
      'Masamune',
      'Pandaemonium',
      'Titan'
    ],
  'Meteor':
    [
      'Belias',
      'Mandragora',
      'Ramuh',
      'Shinryu',
      'Unicorn',
      'Valefor',
      'Yojimbo',
      'Zeromus'
    ],

  // OC
  'Materia':
    [
      'Bismarck',
      'Ravana',
      'Sephirot',
      'Sophia',
      'Zurvan'
    ],

  // Chinese servers
  '陆行鸟':
    [
      'HongYuHai',
      'ShenYiZhiDi',
      'LaNuoXiYa',
      'HuanYingQunDao',
      'MengYaChi',
      'YuZhouHeYin',
      'WoXianXiRan',
      'ChenXiWangZuo'
    ],
  '莫古力':
    [
      'BaiYinXiang',
      'BaiJinHuanXiang',
      'ShenQuanHen',
      'ChaoFengTing',
      'LvRenZhanQiao',
      'FuXiaoZhiJian',
      'Longchaoshendian',
      'MengYuBaoJing'
    ],
  '猫小胖':
    [
      'ZiShuiZhanQiao',
      'YanXia',
      'JingYuZhuangYuan',
      'MoDuNa',
      'HaiMaoChaWu',
      'RouFengHaiWan',
      'HuPoYuan'
    ],
  '豆豆柴':
    [
      'ShuiJingTa2',
      'YinLeiHu2',
      'TaiYangHaiAn2',
      'YiXiuJiaDe2',
      'HongChaChuan2'
    ],

  // Korean servers don't have datacenters, so we're going to call them "Korea"
  'Korea':
    [
      ...KOREAN_GAME_SERVERS
    ],

    // Taiwan servers don't have datacenters, so we're going to call them "Taiwan"
  'Taiwan':
    [
      ...TAIWAN_GAME_SERVERS
    ]
};
