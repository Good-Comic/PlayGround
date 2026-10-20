const STORAGE_KEY = 'civ7.gamemaster.v1';

const hexToInt = (hex) => Number.parseInt(String(hex).replace('#', ''), 16) || 0xe3bd74;

const DEFAULT_FORMULAS = {
  combat: {
    attackMultiplier: 1,
    defenseMultiplier: 0.55,
    baseDamage: 22,
    randomMin: 0.85,
    randomMax: 1.15,
    minDamage: 8,
    maxDamage: 75,
    cityAttackMultiplier: 1,
    cityDefenseMultiplier: 0.5,
    cityBaseDamage: 10,
    cityMinDamage: 6,
    cityMaxDamage: 60,
    retaliationMultiplier: 0.42,
    highlandBonus: 0.25,
    riverPenalty: 0.9,
    flankBonus: 0.15,
    fortifiedBonus: 0.25,
    antiCavalryBonus: 0.5,
    terrainDefense: 0.12,
  },
  economy: {
    foodMultiplier: 1,
    productionMultiplier: 1,
    goldMultiplier: 1,
    scienceMultiplier: 1,
    cultureMultiplier: 1,
    growthBase: 14,
    growthPerPop: 9,
    riverFood: 1,
    capitalFood: 1,
    capitalProduction: 1,
    capitalGold: 1,
    aiYieldMultiplier: 0.92,
    scienceFlatPerPop: 1,
  },
  tech: {
    costMultiplier: 1,
    eraGrowth: 0.04,
    boost: 1.2,
  },
};

const DEFAULT_TERRAIN = {
  ocean: { yields: { food: 1, gold: 1 }, move: 1, defense: 0, sight: 0, water: true, passable: false },
  coast: { yields: { food: 1, gold: 1 }, move: 1, defense: 0, sight: 0, water: true, passable: false },
  grassland: { yields: { food: 2 }, move: 1, defense: 0, sight: 0, passable: true },
  plains: { yields: { food: 1, production: 1 }, move: 1, defense: 0, sight: 0, passable: true },
  desert: { yields: { gold: 1 }, move: 1, defense: 0, sight: 0, passable: true },
  tundra: { yields: { food: 1 }, move: 1, defense: 0, sight: 0, passable: true },
  snow: { yields: {}, move: 1, defense: 0, sight: 0, passable: true },
  hills: { yields: { production: 2 }, move: 2, defense: 0.15, sight: 1, passable: true, hills: true },
  mountain: { yields: { production: 1 }, move: 0, defense: 0.35, sight: 2, passable: false, mountain: true },
  lake: { yields: { food: 2 }, move: 1, defense: 0, sight: 0, water: true, passable: false },
  lava: { yields: { production: 2 }, move: 0, defense: 0.25, sight: 1, passable: false, mountain: true },
  crystal: { yields: { science: 2, production: 1 }, move: 1, defense: 0.1, sight: 1, passable: true },
};

const DEFAULT_OPTIONS = {
  language: 'zh',
  difficulty: 'standard',
  autoEndTurn: false,
  hexEdges: true,
  volumes: { master: 0.8, bgm: 0.65, sfx: 0.75, ui: 0.7 },
  musicStyle: 'auto',
  renderScale: 1,
  fullscreen: false,
  uiScale: 100,
  shadowQuality: 'medium',
  antialias: true,
  cameraSensitivity: 1,
};

const DIFFICULTY = {
  easy: { label: '開拓者', aiYields: 0.82, aiCombat: 0.9, aiAggression: 0.55 },
  standard: { label: '領主', aiYields: 0.92, aiCombat: 1, aiAggression: 0.72 },
  hard: { label: '君主', aiYields: 1.05, aiCombat: 1.08, aiAggression: 0.86 },
  immortal: { label: '不朽', aiYields: 1.18, aiCombat: 1.16, aiAggression: 1 },
};

const MUSIC_STYLES = {
  auto: { label: '隨時代自動演進' },
  classical: { label: '古典交響', root: 130.81, scale: [0, 2, 4, 7, 9], timbre: 'triangle' },
  medieval: { label: '中世紀民謠', root: 110, scale: [0, 3, 5, 7, 10], timbre: 'sine' },
  chinese: { label: '東方國樂', root: 146.83, scale: [0, 2, 5, 7, 9], timbre: 'triangle' },
  pop: { label: '西方流行', root: 164.81, scale: [0, 2, 4, 7, 11], timbre: 'square' },
  japanese: { label: '和風雅樂', root: 174.61, scale: [0, 1, 5, 7, 10], timbre: 'sine' },
  scifi: { label: '2100 科幻電子', root: 196, scale: [0, 1, 4, 6, 10], timbre: 'sawtooth' },
};

function unit(id, name, cls, str, moves, extra = {}) {
  return {
    name, cls, str, moves, range: 1, sight: 2, cost: 90,
    icon: cls === 'ranged' ? 'i-attack' : cls === 'cavalry' ? 'i-move' : 'i-strength',
    blurb: '專屬精銳單位。', ...extra, id,
  };
}

function tech(id, name, desc, extra = {}) {
  return {
    id, name, era: extra.era ?? 'Antiquity', cost: extra.cost ?? 110, prereq: [],
    bonus: desc, icon: extra.icon ?? 'i-wonder', unique: true, ...extra,
  };
}

const HISTORICAL = [
  {
    id: 'rome', name: '羅馬', leader: '凱撒', title: '永恆獨裁官', group: 'historical',
    colorHex: '#d65c4a', accent: '#5b201c', border: '#ffb09f', glyph: 'eagle',
    traitName: '條條大路', trait: '生產 +8%，軍團近戰 +8%。', bonuses: { production: 0.08, combat: 0.08 },
    architecture: 'roman', roof: 'terrace', wall: 'marble', roofColor: '#a9553b', weapon: 'spear', mount: 'none',
    personality: 'conqueror', greeting: '我來，我見，我征服。',
    cityNames: ['羅馬', '奧斯提亞', '安提烏姆', '卡普阿', '拉文納', '米蘭', '拿坡里', '布林迪西'],
    portrait: { crown: 'laurel', hair: '#5b3b2c', skin: '#c9855e', beard: true, eyes: '#2b1c16' },
    unique: {
      unit: unit('ux_rome', '羅馬軍團', 'melee', 42, 2, { cost: 105, tech: 'u_rome_road', blurb: '重盾與短劍，攻城與野戰皆宜。' }),
      tech: tech('u_rome_road', '條條大路通羅馬', '解鎖羅馬軍團；每座城市 +1 生產。', { yields: { production: 1 }, unlockUnit: 'ux_rome' }),
    },
  },
  {
    id: 'china', name: '華夏', leader: '武則天', title: '天命女皇', group: 'historical',
    colorHex: '#74c27a', accent: '#204a2c', border: '#aef0a6', glyph: 'dragon',
    traitName: '天命所歸', trait: '科學 +10%，文化 +8%。', bonuses: { science: 0.1, culture: 0.08 },
    architecture: 'chinese', roof: 'pagoda', wall: 'lacquer', roofColor: '#7b2e2b', weapon: 'crossbow', mount: 'horse',
    personality: 'scholar', greeting: '上天賜你覲見之機，切勿虛度。',
    cityNames: ['長安', '洛陽', '建康', '臨安', '成都', '邯鄲', '曲阜', '蘇州'],
    portrait: { crown: 'phoenix', hair: '#17110f', skin: '#d5a273', beard: false, eyes: '#211511' },
    unique: {
      unit: unit('ux_china', '諸葛連弩', 'ranged', 32, 2, { rangedStr: 52, range: 2, cost: 115, tech: 'u_china_crossbow', blurb: '連發弩機，壓制密集陣形。' }),
      tech: tech('u_china_crossbow', '八陣圖', '解鎖諸葛連弩；遠程單位 +10% 戰力。', { yields: { science: 2 }, unlockUnit: 'ux_china' }),
    },
  },
  {
    id: 'japan', name: '日本', leader: '織田信長', title: '第六天魔王', group: 'historical',
    colorHex: '#d9738f', accent: '#4b1d2b', border: '#ffb4c8', glyph: 'sun',
    traitName: '天下布武', trait: '遠程單位 +12%，金幣 +6%。', bonuses: { ranged: 0.12, gold: 0.06 },
    architecture: 'japanese', roof: 'curved', wall: 'wood', roofColor: '#3f3b42', weapon: 'katana', mount: 'none',
    personality: 'warlord', greeting: '人生五十年，如夢似幻。',
    cityNames: ['安土', '岐阜', '清洲', '大阪', '堺', '甲賀', '京都', '江戶'],
    portrait: { crown: 'samurai', hair: '#151210', skin: '#d7a47b', beard: true, eyes: '#1d1410' },
    unique: {
      unit: unit('ux_japan', '鐵砲隊', 'ranged', 30, 2, { rangedStr: 58, range: 2, cost: 120, tech: 'u_japan_teppo', blurb: '戰國火繩槍齊射，破甲懾敵。' }),
      tech: tech('u_japan_teppo', '鐵砲術', '解鎖鐵砲隊；遠程單位 +10% 戰力。', { era: 'Exploration', unlockUnit: 'ux_japan' }),
    },
  },
  {
    id: 'egypt', name: '埃及', leader: '拉美西斯二世', title: '兩地之主', group: 'historical',
    colorHex: '#49b3a5', accent: '#18494b', border: '#9df2e2', glyph: 'ankh',
    traitName: '尼羅恩賜', trait: '河流地格 +2 食物，建造者 +1 次使用。', bonuses: { food: 0.08, riverFood: 2 },
    architecture: 'egyptian', roof: 'flat', wall: 'sandstone', roofColor: '#b88d4d', weapon: 'staff', mount: 'chariot',
    personality: 'builder', greeting: '河流銘記一切，我們亦然。',
    cityNames: ['孟菲斯', '底比斯', '赫利奧波利斯', '阿拜多斯', '艾德夫', '吉薩', '亞歷山卓', '賽得'],
    portrait: { crown: 'nemes', hair: '#15110d', skin: '#b9784e', beard: true, eyes: '#2a1a10' },
    unique: {
      unit: unit('ux_egypt', '戰車弓手', 'cavalry', 38, 4, { rangedStr: 46, range: 2, cost: 110, tech: 'u_egypt_chariot', blurb: '疾馳的複合弓戰車。' }),
      tech: tech('u_egypt_chariot', '法老戰車', '解鎖戰車弓手；河流與綠洲食物 +1。', { yields: { food: 1 }, unlockUnit: 'ux_egypt' }),
    },
  },
  {
    id: 'greece', name: '希臘', leader: '亞歷山大大帝', title: '征服者', group: 'historical',
    colorHex: '#6da8e8', accent: '#243c63', border: '#b9dbff', glyph: 'column',
    traitName: '哲人與方陣', trait: '科學 +12%，重步兵 +8%。', bonuses: { science: 0.12, combat: 0.08 },
    architecture: 'greek', roof: 'pediment', wall: 'marble', roofColor: '#d8d3c6', weapon: 'spear', mount: 'horse',
    personality: 'conqueror', greeting: '征服的盡頭，便是世界的盡頭。',
    cityNames: ['雅典', '斯巴達', '科林斯', '底比斯', '德爾菲', '奧林匹亞', '米利都', '羅德島'],
    portrait: { crown: 'helmet', hair: '#3a2a1e', skin: '#c78b62', beard: true, eyes: '#1e1712' },
    unique: {
      unit: unit('ux_greece', '馬其頓方陣', 'melee', 46, 2, { cost: 115, antiCav: true, tech: 'u_greece_phalanx', blurb: '長矛如林，正面難破。' }),
      tech: tech('u_greece_phalanx', '方陣戰術', '解鎖馬其頓方陣；長矛兵 +1 移動。', { unlockUnit: 'ux_greece' }),
    },
  },
  {
    id: 'persia', name: '波斯', leader: '居魯士大帝', title: '萬王之王', group: 'historical',
    colorHex: '#b48ad8', accent: '#3c2652', border: '#dcc0f4', glyph: 'wing',
    traitName: '御道馳驛', trait: '移動 +1，影響力 +1。', bonuses: { move: 1, influence: 1 },
    architecture: 'persian', roof: 'dome', wall: 'glazed', roofColor: '#3f7f8f', weapon: 'bow', mount: 'horse',
    personality: 'visionary', greeting: '萬國皆可在我麾下共存。',
    cityNames: ['蘇薩', '波斯波利斯', '帕薩爾加德', '埃克巴坦那', '巴比倫', '泰西封', '伊斯法罕', '設拉子'],
    portrait: { crown: 'tiara', hair: '#221812', skin: '#c0875d', beard: true, eyes: '#1c120c' },
    unique: {
      unit: unit('ux_persia', '不死軍團', 'melee', 44, 3, { cost: 120, tech: 'u_persia_immortal', blurb: '精銳近衛，行軍如風。' }),
      tech: tech('u_persia_immortal', '不死軍團制', '解鎖不死軍團；單位移動 +1。', { unlockUnit: 'ux_persia', move: 1 }),
    },
  },
  {
    id: 'britain', name: '不列顛', leader: '亞瑟王', title: '圓桌之主', group: 'historical',
    colorHex: '#8e6fd0', accent: '#32245b', border: '#c8b4ff', glyph: 'sword',
    traitName: '圓桌誓約', trait: '忠誠 +15%，城防 +6。', bonuses: { loyalty: 0.15, cityDefense: 6 },
    architecture: 'british', roof: 'gable', wall: 'stone', roofColor: '#48566b', weapon: 'sword', mount: 'horse',
    personality: 'honorable', greeting: '以劍立誓，以心守國。',
    cityNames: ['卡美洛', '倫敦', '約克', '溫切斯特', '坎特伯雷', '杜佛', '牛津', '愛丁堡'],
    portrait: { crown: 'crown', hair: '#6b4426', skin: '#d2a17b', beard: true, eyes: '#25201b' },
    unique: {
      unit: unit('ux_britain', '圓桌騎士', 'cavalry', 54, 4, { cost: 150, tech: 'u_britain_round', blurb: '忠勇兼備的重裝騎士。' }),
      tech: tech('u_britain_round', '圓桌誓約', '解鎖圓桌騎士；騎兵 +10% 戰力。', { era: 'Exploration', unlockUnit: 'ux_britain' }),
    },
  },
  {
    id: 'franks', name: '法蘭克', leader: '查理曼', title: '歐洲之父', group: 'historical',
    colorHex: '#d6a54e', accent: '#573d18', border: '#ffe0a0', glyph: 'crown',
    traitName: '加洛林復興', trait: '文化 +10%，信仰 +1。', bonuses: { culture: 0.1, faith: 1 },
    architecture: 'frankish', roof: 'spire', wall: 'stone', roofColor: '#6b4c33', weapon: 'sword', mount: 'horse',
    personality: 'builder', greeting: '以信仰凝聚，以學識照亮。',
    cityNames: ['亞琛', '巴黎', '蘭斯', '圖爾', '梅斯', '科隆', '里昂', '波爾多'],
    portrait: { crown: 'crown', hair: '#7a5532', skin: '#d0a079', beard: true, eyes: '#241b13' },
    unique: {
      unit: unit('ux_franks', '加洛林聖騎', 'cavalry', 50, 3, { cost: 140, tech: 'u_franks_palatine', blurb: '信仰與鋼鐵並行的重騎兵。' }),
      tech: tech('u_franks_palatine', '加洛林復興', '解鎖加洛林聖騎；文化 +2。', { era: 'Exploration', yields: { culture: 2 }, unlockUnit: 'ux_franks' }),
    },
  },
  {
    id: 'germany', name: '日耳曼', leader: '腓特烈大帝', title: '普魯士雄鷹', group: 'historical',
    colorHex: '#7d8b98', accent: '#2b343c', border: '#c5d2dd', glyph: 'eagle',
    traitName: '鐵與血', trait: '生產 +12%，攻城 +10%。', bonuses: { production: 0.12, cityAttack: 0.1 },
    architecture: 'german', roof: 'spire', wall: 'brick', roofColor: '#563f37', weapon: 'rifle', mount: 'none',
    personality: 'warlord', greeting: '秩序與鋼鐵，將塑造新歐洲。',
    cityNames: ['柏林', '波茨坦', '漢堡', '慕尼黑', '科隆', '法蘭克福', '但澤', '柯尼斯堡'],
    portrait: { crown: 'pickelhaube', hair: '#4a3a2d', skin: '#d2a17a', beard: true, eyes: '#25211d' },
    unique: {
      unit: unit('ux_germany', '普魯士擲彈兵', 'melee', 58, 2, { cost: 165, tech: 'u_germany_grenadier', blurb: '紀律嚴明的擲彈兵。' }),
      tech: tech('u_germany_grenadier', '鐵與血', '解鎖普魯士擲彈兵；攻城 +10%。', { era: 'Modern', unlockUnit: 'ux_germany' }),
    },
  },
  {
    id: 'vikings', name: '北歐', leader: '拉格納', title: '北海之王', group: 'historical',
    colorHex: '#c4584c', accent: '#4a1f1d', border: '#ff9182', glyph: 'raven',
    traitName: '瓦爾哈拉', trait: '沿岸與水軍 +15%，掠奪金幣 +10%。', bonuses: { navy: 0.15, raid: 0.1 },
    architecture: 'norse', roof: 'longhouse', wall: 'timber', roofColor: '#4c3424', weapon: 'axe', mount: 'none',
    personality: 'warlord', greeting: '有話快說，南方人。我的斧頭渴了。',
    cityNames: ['斯卡格拉克', '烏普薩拉', '比爾卡', '尼達羅斯', '約塔蘭', '拉夫內', '尤米爾', '赫德比'],
    portrait: { crown: 'horned', hair: '#8b5b2e', skin: '#d5a27e', beard: true, eyes: '#1d1a17' },
    unique: {
      unit: unit('ux_vikings', '狂戰士', 'melee', 48, 3, { cost: 125, tech: 'u_vikings_berserk', blurb: '無畏衝鋒，沿岸作戰更強。' }),
      tech: tech('u_vikings_berserk', '瓦爾哈拉', '解鎖狂戰士；水軍 +10% 戰力。', { era: 'Exploration', unlockUnit: 'ux_vikings' }),
    },
  },
  {
    id: 'arabia', name: '阿拉伯', leader: '哈倫．拉希德', title: '智慧宮之主', group: 'historical',
    colorHex: '#5cc7a2', accent: '#1b4b3d', border: '#a5f0d8', glyph: 'star',
    traitName: '智慧宮', trait: '科學 +15%，商路金幣 +1。', bonuses: { science: 0.15, gold: 0.06 },
    architecture: 'arabic', roof: 'dome', wall: 'sandstone', roofColor: '#b27d4e', weapon: 'scimitar', mount: 'camel',
    personality: 'scholar', greeting: '墨水與星辰，比刀劍更長久。',
    cityNames: ['巴格達', '麥加', '麥地那', '大馬士革', '開羅', '庫法', '巴士拉', '撒馬爾罕'],
    portrait: { crown: 'turban', hair: '#201813', skin: '#b67b51', beard: true, eyes: '#1f140d' },
    unique: {
      unit: unit('ux_arabia', '駱駝弓騎', 'cavalry', 42, 4, { rangedStr: 48, range: 2, cost: 130, tech: 'u_arabia_camel', blurb: '沙漠中的遠程騎兵。' }),
      tech: tech('u_arabia_camel', '智慧宮', '解鎖駱駝弓騎；科學 +2。', { era: 'Exploration', yields: { science: 2 }, unlockUnit: 'ux_arabia' }),
    },
  },
  {
    id: 'ottoman', name: '鄂圖曼', leader: '蘇萊曼大帝', title: '立法者', group: 'historical',
    colorHex: '#d06f5a', accent: '#4f241c', border: '#ffb09c', glyph: 'crescent',
    traitName: '帝國律法', trait: '城防 +8，攻城 +12%。', bonuses: { cityDefense: 8, cityAttack: 0.12 },
    architecture: 'ottoman', roof: 'dome', wall: 'stone', roofColor: '#416b55', weapon: 'cannon', mount: 'horse',
    personality: 'conqueror', greeting: '世界的門扉，將為我敞開。',
    cityNames: ['伊斯坦堡', '安卡拉', '布爾薩', '阿德里安堡', '特拉布宗', '大馬士革', '耶路撒冷', '開羅'],
    portrait: { crown: 'turban', hair: '#2a1c14', skin: '#c38c63', beard: true, eyes: '#1d130e' },
    unique: {
      unit: unit('ux_ottoman', '烏爾班巨砲', 'siege', 36, 1, { rangedStr: 72, range: 3, cost: 180, tech: 'u_ottoman_cannon', blurb: '轟碎城牆的巨型青銅砲。' }),
      tech: tech('u_ottoman_cannon', '巨砲鑄造', '解鎖烏爾班巨砲；攻城 +12%。', { era: 'Modern', unlockUnit: 'ux_ottoman' }),
    },
  },
  {
    id: 'india', name: '印度', leader: '阿育王', title: '孔雀法王', group: 'historical',
    colorHex: '#e0a64f', accent: '#5c3c18', border: '#ffd996', glyph: 'wheel',
    traitName: '法輪常轉', trait: '食物 +10%，信仰 +2。', bonuses: { food: 0.1, faith: 2 },
    architecture: 'indian', roof: 'shikhara', wall: 'sandstone', roofColor: '#b56d43', weapon: 'bow', mount: 'elephant',
    personality: 'builder', greeting: '以法治理，勝過以刀劍征服。',
    cityNames: ['華氏城', '德里', '瓦拉納西', '阿格拉', '孟買', '加爾各答', '坦賈武爾', '邁索爾'],
    portrait: { crown: 'mukuta', hair: '#1e1510', skin: '#b8744d', beard: false, eyes: '#1c120b' },
    unique: {
      unit: unit('ux_india', '戰象', 'cavalry', 62, 2, { cost: 160, tech: 'u_india_elephant', blurb: '披甲戰象，震懾敵陣。' }),
      tech: tech('u_india_elephant', '法輪常轉', '解鎖戰象；食物 +2。', { era: 'Exploration', yields: { food: 2 }, unlockUnit: 'ux_india' }),
    },
  },
  {
    id: 'mongol', name: '蒙古', leader: '成吉思汗', title: '世界征服者', group: 'historical',
    colorHex: '#c9a15c', accent: '#4f3a1a', border: '#ffe0a3', glyph: 'horse',
    traitName: '馬背帝國', trait: '騎兵移動 +1，補給 +4。', bonuses: { cavalryMove: 1, supply: 4 },
    architecture: 'steppe', roof: 'tent', wall: 'felt', roofColor: '#8f7552', weapon: 'bow', mount: 'horse',
    personality: 'warlord', greeting: '凡有青草的地方，皆為我牧場。',
    cityNames: ['哈拉和林', '上都', '大都', '撒馬爾罕', '布哈拉', '喀什', '大都城', '和林'],
    portrait: { crown: 'fur', hair: '#2e241b', skin: '#c28c65', beard: true, eyes: '#1e1710' },
    unique: {
      unit: unit('ux_mongol', '蒙古怯薛', 'cavalry', 56, 5, { cost: 150, tech: 'u_mongol_kheshig', blurb: '來去如風的精銳弓騎。' }),
      tech: tech('u_mongol_kheshig', '馬背帝國', '解鎖蒙古怯薛；騎兵移動 +1。', { era: 'Exploration', unlockUnit: 'ux_mongol', move: 1 }),
    },
  },
  {
    id: 'aztec', name: '阿茲特克', leader: '蒙特祖馬', title: '太陽神代言人', group: 'historical',
    colorHex: '#e0844f', accent: '#542b17', border: '#ffc59d', glyph: 'sun',
    traitName: '太陽獻祭', trait: '近戰 +12%，文化 +6%。', bonuses: { combat: 0.12, culture: 0.06 },
    architecture: 'aztec', roof: 'step', wall: 'obsidian', roofColor: '#4f4a42', weapon: 'macuahuitl', mount: 'none',
    personality: 'warlord', greeting: '太陽需要鮮血，帝國需要勇者。',
    cityNames: ['特諾奇提特蘭', '特斯科科', '特拉科潘', '喬盧拉', '特拉斯卡拉', '庫埃納瓦卡', '圖拉', '米特拉'],
    portrait: { crown: 'feather', hair: '#17110d', skin: '#b8764f', beard: false, eyes: '#20110b' },
    unique: {
      unit: unit('ux_aztec', '美洲豹戰士', 'melee', 46, 3, { cost: 120, tech: 'u_aztec_jaguar', blurb: '叢林中的無聲獵手。' }),
      tech: tech('u_aztec_jaguar', '太陽獻祭', '解鎖美洲豹戰士；近戰 +10%。', { era: 'Exploration', unlockUnit: 'ux_aztec' }),
    },
  },
  {
    id: 'inca', name: '印加', leader: '帕查庫特克', title: '大地震動者', group: 'historical',
    colorHex: '#d8b24c', accent: '#54421a', border: '#ffe59b', glyph: 'mountain',
    traitName: '梯田與驛道', trait: '丘陵食物 +1，移動 +1。', bonuses: { hillFood: 1, move: 1 },
    architecture: 'inca', roof: 'thatch', wall: 'andesite', roofColor: '#8b6a3a', weapon: 'sling', mount: 'llama',
    personality: 'builder', greeting: '山脈是我們的階梯，太陽是我們的父。',
    cityNames: ['庫斯科', '馬丘比丘', '奧揚泰坦博', '薩克塞瓦曼', '皮薩克', '庫拉帕', '昌昌', '蒂瓦納庫'],
    portrait: { crown: 'inca', hair: '#1b1310', skin: '#b97a50', beard: false, eyes: '#1e120c' },
    unique: {
      unit: unit('ux_inca', '投石勇士', 'ranged', 30, 2, { rangedStr: 44, range: 2, cost: 100, tech: 'u_inca_slinger', blurb: '山地游擊的投石精銳。' }),
      tech: tech('u_inca_slinger', '梯田與驛道', '解鎖投石勇士；丘陵食物 +1。', { era: 'Exploration', yields: { food: 1 }, unlockUnit: 'ux_inca' }),
    },
  },
];

const THREE_KINGDOMS = [
  {
    id: 'wei', name: '魏', leader: '曹操', title: '魏武帝', group: 'threeKingdoms',
    colorHex: '#5d87c9', accent: '#1d3152', border: '#a8c8ff', glyph: 'dragon',
    traitName: '屯田令', trait: '每座城市 +1 食物、+1 生產。', bonuses: { food: 0.06, production: 0.06, combat: 0.04 },
    architecture: 'chinese', roof: 'pagoda', wall: 'brick', roofColor: '#3d4e63', weapon: 'sword', mount: 'horse',
    personality: 'warlord', greeting: '天下英雄，唯使君與操耳。',
    cityNames: ['許昌', '鄴', '長安', '宛', '陳留', '濮陽', '洛陽', '壽春'],
    portrait: { crown: 'wei', hair: '#1a1511', skin: '#c9926a', beard: true, eyes: '#1b120c' },
    unique: {
      unit: unit('ux_wei', '虎豹騎', 'cavalry', 60, 4, { cost: 160, tech: 'u_wei_tiger', blurb: '曹魏精銳重騎，衝鋒破陣。' }),
      tech: tech('u_wei_tiger', '虎豹騎制', '解鎖虎豹騎；騎兵 +10% 戰力。', { unlockUnit: 'ux_wei' }),
    },
  },
  {
    id: 'shu', name: '蜀', leader: '劉備', title: '漢昭烈帝', group: 'threeKingdoms',
    colorHex: '#74c27a', accent: '#204a2c', border: '#aef0a6', glyph: 'dragon',
    traitName: '仁德', trait: '單位在己方領土回復生命，補給 +3。', bonuses: { heal: 0.05, supply: 3, loyalty: 0.1 },
    architecture: 'chinese', roof: 'pagoda', wall: 'wood', roofColor: '#315a3c', weapon: 'spear', mount: 'horse',
    personality: 'honorable', greeting: '漢室傾頹，願與君共扶社稷。',
    cityNames: ['成都', '漢中', '江州', '永安', '梓潼', '綿竹', '涪城', '劍閣'],
    portrait: { crown: 'shu', hair: '#18130f', skin: '#d1a078', beard: true, eyes: '#1c130d' },
    unique: {
      unit: unit('ux_shu', '無當飛軍', 'melee', 50, 3, { cost: 135, tech: 'u_shu_flying', blurb: '山地精銳，行動如飛。' }),
      tech: tech('u_shu_flying', '木牛流馬', '解鎖無當飛軍；補給範圍 +4。', { supply: 4, unlockUnit: 'ux_shu' }),
    },
  },
  {
    id: 'wu', name: '吳', leader: '孫權', title: '吳大帝', group: 'threeKingdoms',
    colorHex: '#c4584c', accent: '#4a1f1d', border: '#ff9182', glyph: 'raven',
    traitName: '江東水師', trait: '水軍與沿岸單位 +20% 戰力。', bonuses: { navy: 0.2, gold: 0.06 },
    architecture: 'chinese', roof: 'pagoda', wall: 'lacquer', roofColor: '#5e2e2b', weapon: 'bow', mount: 'none',
    personality: 'visionary', greeting: '長江天險，足以拒曹。',
    cityNames: ['建業', '吳', '會稽', '柴桑', '廬江', '丹陽', '豫章', '夷陵'],
    portrait: { crown: 'wu', hair: '#19130f', skin: '#c58f68', beard: true, eyes: '#1d120c' },
    unique: {
      unit: unit('ux_wu', '錦帆水軍', 'navy', 48, 4, { rangedStr: 58, range: 2, domain: 'water', cost: 150, tech: 'u_wu_navy', blurb: '江東水師，火船與強弩並用。' }),
      tech: tech('u_wu_navy', '赤壁火計', '解鎖錦帆水軍；水軍 +15% 戰力。', { unlockUnit: 'ux_wu' }),
    },
  },
  {
    id: 'warlord', name: '群雄', leader: '呂布', title: '飛將', group: 'threeKingdoms',
    colorHex: '#b48ad8', accent: '#3c2652', border: '#dcc0f4', glyph: 'spear',
    traitName: '飛將', trait: '騎兵 +15%，掠奪金幣 +15%。', bonuses: { cavalry: 0.15, raid: 0.15 },
    architecture: 'chinese', roof: 'tent', wall: 'timber', roofColor: '#4d3c58', weapon: 'halberd', mount: 'horse',
    personality: 'warlord', greeting: '轅門射戟，天下誰敢不服？',
    cityNames: ['洛陽', '長安', '宛', '襄陽', '壽春', '晉陽', '下邳', '濮陽'],
    portrait: { crown: 'warlord', hair: '#17110d', skin: '#c58b60', beard: true, eyes: '#1c110b' },
    unique: {
      unit: unit('ux_warlord', '陷陣營', 'melee', 56, 3, { cost: 145, tech: 'u_warlord_guard', blurb: '呂布麾下死士，攻堅陷陣。' }),
      tech: tech('u_warlord_guard', '飛將', '解鎖陷陣營；騎兵 +15% 戰力。', { unlockUnit: 'ux_warlord' }),
    },
  },
];

const ALIEN_PHYSIOLOGY = {
  silicon: {
    label: '矽晶生命', names: ['晶裔', '砂海共鳴者', '稜鏡議會'], leader: '稜鏡主腦', glyph: 'crystal',
    architecture: 'alienCrystal', roof: 'crystal', wall: 'crystal', roofColor: '#8fd8ff', weapon: 'beam', mount: 'none',
    traitName: '晶格共振', trait: '科學 +20%，城市防禦 +10。', bonuses: { science: 0.2, cityDefense: 10 },
    unitName: '稜晶巨像', cls: 'melee',
  },
  insect: {
    label: '蟲群意識', names: ['蟲巢', '群星噬者', '孵化庭'], leader: '萬蟲之母', glyph: 'insect',
    architecture: 'hive', roof: 'membrane', wall: 'chitin', roofColor: '#9c7f3c', weapon: 'claw', mount: 'none',
    traitName: '群體增殖', trait: '食物 +25%，單位每回合回復生命。', bonuses: { food: 0.25, heal: 0.06 },
    unitName: '裂顎蟲衛', cls: 'melee',
  },
  machine: {
    label: '機械矩陣', names: ['鐵樞', '無盡演算', '零號艦隊'], leader: '中央節點', glyph: 'gear',
    architecture: 'machine', roof: 'antenna', wall: 'alloy', roofColor: '#6d8ea0', weapon: 'railgun', mount: 'none',
    traitName: '自我複製', trait: '生產 +25%，攻城 +15%。', bonuses: { production: 0.25, cityAttack: 0.15 },
    unitName: '殲滅者機甲', cls: 'siege',
  },
  psionic: {
    label: '靈能生命', names: ['靈潮', '寂靜合唱', '星海夢者'], leader: '大夢者', glyph: 'eye',
    architecture: 'psionic', roof: 'halo', wall: 'resonance', roofColor: '#c9a5ff', weapon: 'psiblade', mount: 'none',
    traitName: '靈能共鳴', trait: '文化 +25%，影響力 +3。', bonuses: { culture: 0.25, influence: 3 },
    unitName: '靈刃行者', cls: 'ranged',
  },
};

function seedRng(seed) {
  let s = Math.abs(Math.floor(seed)) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function alienFaction(opts = {}) {
  const rng = seedRng(opts.seed ?? Date.now());
  const keys = Object.keys(ALIEN_PHYSIOLOGY);
  const kind = ALIEN_PHYSIOLOGY[opts.physiology] ? opts.physiology : keys[Math.floor(rng() * keys.length)];
  const base = ALIEN_PHYSIOLOGY[kind];
  const palette = opts.palette ?? ['#8fd8ff', '#c9a5ff', '#8cffb0', '#ff9c8f', '#ffd37f'][Math.floor(rng() * 5)];
  const names = base.names;
  const suffix = opts.name ?? names[Math.floor(rng() * names.length)];
  const seed = Math.floor(rng() * 900000 + 100000);
  const id = opts.id ?? `alien_${kind}_${seed}`;
  const corruption = Number(opts.corruption ?? rng() * 100);
  const unitId = `ux_${id}`;
  const techId = `u_${id}`;
  return {
    id, name: suffix, leader: opts.leader ?? base.leader, title: `第 ${seed} 航行體`, group: 'alien',
    colorHex: palette, accent: '#182438', border: palette, glyph: base.glyph,
    traitName: base.traitName, trait: `${base.trait} 異化度 ${Math.round(corruption)}%。`,
    bonuses: { ...base.bonuses, corruption },
    architecture: base.architecture, roof: base.roof, wall: base.wall, roofColor: base.roofColor,
    weapon: base.weapon, mount: base.mount, personality: 'alien', greeting: '你們的訊號，我們已接收。',
    cityNames: [`${suffix}．樞一`, `${suffix}．樞二`, `${suffix}．巢三`, `${suffix}．鏡四`, `${suffix}．淵五`, `${suffix}．星六`],
    portrait: { crown: 'alien', hair: palette, skin: '#7f8fa6', beard: false, eyes: palette },
    physiology: kind, corruption,
    unique: {
      unit: unit(unitId, base.unitName, base.cls, kind === 'machine' ? 72 : 62, kind === 'insect' ? 4 : 3, {
        cost: 180, tech: techId, domain: kind === 'machine' ? 'air' : undefined,
        rangedStr: kind === 'psionic' ? 86 : undefined, range: kind === 'psionic' ? 3 : 1,
        blurb: '外星文明的專屬兵種。',
      }),
      tech: tech(techId, `${base.label}．異種兵器`, `解鎖${base.unitName}；${base.traitName}強化。`, {
        era: 'Information', cost: 680, icon: 'i-wonder', unlockUnit: unitId,
      }),
    },
  };
}

function normalizeFaction(def) {
  const colorHex = def.colorHex ?? '#e3bd74';
  return {
    ...def,
    color: hexToInt(colorHex),
    colorHex,
    accent: hexToInt(def.accent ?? '#243040'),
    border: hexToInt(def.border ?? colorHex),
    bonuses: { ...(def.bonuses ?? {}) },
  };
}

function buildDefaults() {
  const factions = {};
  for (const def of [...HISTORICAL, ...THREE_KINGDOMS]) factions[def.id] = normalizeFaction(def);
  return {
    version: 1,
    factions,
    factionOrder: Object.keys(factions),
    aliens: {},
    units: {},
    formulas: structuredClone(DEFAULT_FORMULAS),
    terrain: structuredClone(DEFAULT_TERRAIN),
    options: structuredClone(DEFAULT_OPTIONS),
    difficulty: structuredClone(DIFFICULTY),
    musicStyles: structuredClone(MUSIC_STYLES),
    assets: {},
    runtime: { units: {}, techs: [], buildings: {}, biomes: {}, features: {} },
  };
}

function isObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function merge(base, patch) {
  if (!isObject(patch)) return base;
  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    out[key] = isObject(value) && isObject(base?.[key]) ? merge(base[key], value) : value;
  }
  return out;
}

class ConfigStore {
  constructor() {
    this.defaults = buildDefaults();
    this.data = this.defaults;
    this.listeners = new Set();
    this.load();
  }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (saved) {
        this.data = merge(this.defaults, saved);
        this.data.factions = { ...this.defaults.factions, ...(saved.factions ?? {}) };
        this.data.aliens = { ...this.defaults.aliens, ...(saved.aliens ?? {}) };
        this.data.factionOrder = [...new Set([...(saved.factionOrder ?? []), ...this.defaults.factionOrder])];
      }
    } catch (err) {
      this.data = this.defaults;
    }
    return this.data;
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (err) {
      return false;
    }
    return true;
  }

  reset() {
    this.data = structuredClone(this.defaults);
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) {}
    this.notify('reset');
    return this.data;
  }

  export() {
    return JSON.stringify(this.data, null, 2);
  }

  import(text) {
    const parsed = JSON.parse(text);
    if (!isObject(parsed)) throw new Error('設定檔格式無效');
    this.data = merge(this.defaults, parsed);
    this.data.factions = { ...this.defaults.factions, ...(parsed.factions ?? {}) };
    this.data.aliens = { ...this.defaults.aliens, ...(parsed.aliens ?? {}) };
    this.save();
    this.notify('import');
    return this.data;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(reason = 'change') {
    for (const fn of this.listeners) fn(this.data, reason);
  }

  allFactions() {
    return [...Object.values(this.data.factions), ...Object.values(this.data.aliens)];
  }

  faction(id) {
    return this.data.factions[id] ?? this.data.aliens[id] ?? null;
  }

  registerAlien(def) {
    this.data.aliens[def.id] = normalizeFaction(def);
    this.save();
    this.notify('alien');
    return this.data.aliens[def.id];
  }

  createAlien(opts = {}) {
    return this.registerAlien(alienFaction(opts));
  }

  resolveFactions(ids, extra = []) {
    const pool = new Map(this.allFactions().map((f) => [f.id, f]));
    for (const def of extra) pool.set(def.id, normalizeFaction(def));
    return ids.map((id) => pool.get(id)).filter(Boolean).map((def) => normalizeFaction(def));
  }

  defaultFactionIds(count = 6) {
    const historical = this.data.factionOrder.filter((id) => this.data.factions[id]?.group === 'historical');
    return historical.slice(0, Math.max(2, count));
  }

  option(path, value) {
    if (value === undefined) return path.split('.').reduce((o, k) => o?.[k], this.data.options);
    const keys = path.split('.');
    let target = this.data.options;
    for (const key of keys.slice(0, -1)) target = target[key] = target[key] ?? {};
    target[keys[keys.length - 1]] = value;
    this.save();
    this.notify('option');
    return value;
  }

  bindRuntime(runtime = {}) {
    const UNIT_TYPES = runtime.UNIT_TYPES ?? runtime.units;
    const TECHS = runtime.TECHS ?? runtime.techs;
    const BUILDINGS = runtime.BUILDINGS ?? runtime.buildings;
    const BIOMES = runtime.BIOMES ?? runtime.biomes;
    const FEATURES = runtime.FEATURES ?? runtime.features;
    this.runtime = { units: UNIT_TYPES, techs: TECHS, buildings: BUILDINGS, biomes: BIOMES, features: FEATURES };
    if (UNIT_TYPES) {
      for (const faction of this.allFactions()) {
        const unique = faction.unique?.unit;
        if (unique && !UNIT_TYPES[unique.id]) UNIT_TYPES[unique.id] = { ...unique, faction: faction.id };
      }
    }
    if (TECHS) {
      for (const faction of this.allFactions()) {
        const unique = faction.unique?.tech;
        if (unique && !TECHS.some((t) => t.id === unique.id)) TECHS.push({ ...unique, faction: faction.id });
      }
    }
    this.applyTerrain();
    this.applyUnits();
    return this;
  }

  applyTerrain() {
    const { biomes: BIOMES, features: FEATURES } = this.runtime;
    for (const [id, cfg] of Object.entries(this.data.terrain)) {
      if (!BIOMES?.[id]) continue;
      BIOMES[id].yields = { ...(BIOMES[id].yields ?? {}), ...(cfg.yields ?? {}) };
      BIOMES[id].move = cfg.move ?? BIOMES[id].move;
      BIOMES[id].defense = cfg.defense ?? BIOMES[id].defense ?? 0;
      BIOMES[id].sight = cfg.sight ?? BIOMES[id].sight ?? 0;
      if (cfg.passable != null) BIOMES[id].passable = cfg.passable;
      if (cfg.water != null) BIOMES[id].water = cfg.water;
    }
    if (FEATURES) {
      for (const [id, cfg] of Object.entries(this.data.features ?? {})) {
        if (!FEATURES[id]) continue;
        FEATURES[id].yields = { ...(FEATURES[id].yields ?? {}), ...(cfg.yields ?? {}) };
        FEATURES[id].move = cfg.move ?? FEATURES[id].move;
        FEATURES[id].defense = cfg.defense ?? FEATURES[id].defense;
      }
    }
    return this;
  }

  applyUnits() {
    const { units: UNIT_TYPES } = this.runtime;
    if (!UNIT_TYPES) return this;
    for (const [id, stats] of Object.entries(this.data.units ?? {})) {
      if (!UNIT_TYPES[id]) continue;
      Object.assign(UNIT_TYPES[id], stats);
    }
    return this;
  }

  terrainRow(id) {
    return this.data.terrain[id] ?? { yields: {}, move: 1, defense: 0, sight: 0 };
  }

  difficultyMods() {
    return this.data.difficulty[this.data.options.difficulty] ?? this.data.difficulty.standard;
  }
}

export const GameMasterConfig = new ConfigStore();
export const ALIEN_KINDS = ALIEN_PHYSIOLOGY;
export const DEFAULT_DIFFICULTY = DIFFICULTY;
export const DIFFICULTY_KEYS = Object.keys(DIFFICULTY);
export const DEFAULT_MUSIC_STYLES = MUSIC_STYLES;
export const DEFAULT_OPTIONS_DATA = DEFAULT_OPTIONS;
export { STORAGE_KEY };

if (typeof window !== 'undefined') window.GameMasterConfig = GameMasterConfig;
