const CONFIG_KEY = 'civ7.gameMasterConfig.v1';
const SETUP_KEY = 'civ7.setup.v1';

export const DEFAULT_OPTIONS = {
  language: 'zh',
  difficulty: 'normal',
  autoEndTurn: false,
  hexBorders: true,
  volumes: { master: 0.8, music: 0.55, sfx: 0.8, ui: 0.65 },
  musicStyle: 'auto',
  renderScale: 1,
  fullscreen: false,
  uiScale: 1,
  shadows: 'high',
  antialias: true,
  cameraPan: 1,
  cameraZoom: 1,
};

export const DIFFICULTIES = {
  easy: { name: '簡單', aiYield: 0.8, aiAggression: 0.65, playerYield: 1.15, cost: 0.9 },
  normal: { name: '標準', aiYield: 1, aiAggression: 1, playerYield: 1, cost: 1 },
  hard: { name: '困難', aiYield: 1.18, aiAggression: 1.3, playerYield: 0.96, cost: 1.08 },
  immortal: { name: '不朽', aiYield: 1.35, aiAggression: 1.6, playerYield: 0.92, cost: 1.16 },
  god: { name: '神級', aiYield: 1.6, aiAggression: 2, playerYield: 0.88, cost: 1.25 },
};

export const MUSIC_STYLES = {
  auto: { name: '隨時代與種族演進', root: 110, scale: [0, 2, 5, 7, 9], tempo: 2.4, timbre: 'triangle' },
  classical: { name: '優雅古典', root: 130.81, scale: [0, 2, 4, 5, 7, 9, 11], tempo: 2.7, timbre: 'sine' },
  medieval: { name: '中古世紀', root: 98, scale: [0, 2, 3, 5, 7, 8, 10], tempo: 2.1, timbre: 'triangle' },
  chinese: { name: '中國古風', root: 146.83, scale: [0, 2, 4, 7, 9], tempo: 2.5, timbre: 'sine' },
  pop: { name: '歐美流行', root: 164.81, scale: [0, 2, 4, 7, 9], tempo: 1.4, timbre: 'square' },
  japanese: { name: '日本傳統', root: 138.59, scale: [0, 1, 5, 7, 8], tempo: 2.8, timbre: 'sine' },
  scifi: { name: '2100 科幻外星電音', root: 82.41, scale: [0, 1, 4, 6, 7, 11], tempo: 1.1, timbre: 'sawtooth' },
};

export const CULTURE_META = {
  eastAsia: { name: '東亞', roof: 0x262025, roofGlow: 0xb33a2f, wall: 0xd8c9a8, pillar: 0x8c2f28, accent: 0xe3bd74 },
  europe: { name: '歐洲', roof: 0x8a4a33, roofGlow: 0xe3bd74, wall: 0xd4cbb8, pillar: 0x746b5c, accent: 0x9fb8d8 },
  middleEast: { name: '中東／埃及', roof: 0xd9b86c, roofGlow: 0xffd37a, wall: 0xe8d8b4, pillar: 0xb08a4f, accent: 0x7fc7c0 },
  americas: { name: '美洲', roof: 0x8f6a46, roofGlow: 0xe0a85a, wall: 0xb9a07a, pillar: 0x6d5a42, accent: 0x7fbf6a },
  steppe: { name: '草原', roof: 0x5b503c, roofGlow: 0xd0aa62, wall: 0xc9b98e, pillar: 0x6d5c3e, accent: 0xa5c98a },
  alienCrystal: { name: '外星晶體', roof: 0x5c7dff, roofGlow: 0x8ff5ff, wall: 0x3b3f72, pillar: 0x7f8cff, accent: 0x7fffe6, alien: true },
  alienSwarm: { name: '外星蟲巢', roof: 0x506b2e, roofGlow: 0xc8ff5a, wall: 0x4a3a2c, pillar: 0x6f8f3a, accent: 0xb6e35c, alien: true },
  alienMachine: { name: '機械矩陣', roof: 0x3a414d, roofGlow: 0xff7a3d, wall: 0x242a33, pillar: 0x67717e, accent: 0xffa25a, alien: true },
  alienEnergy: { name: '星靈能量', roof: 0x5b3f9b, roofGlow: 0xd6a6ff, wall: 0x342b55, pillar: 0x9e7fe0, accent: 0xf0c9ff, alien: true },
};

const hist = (id, name, leader, title, culture, color, accent, glyph, traitName, trait, unique, cityNames) => ({
  id, key: id, category: 'historical', name, leader, title, culture,
  colors: { primary: color, secondary: accent, border: color, glow: color },
  glyph, traitName, trait, cityNames,
  bonus: { yields: {}, yieldPct: {}, combat: 0, ranged: 0, navy: 0, supply: 0, healOwn: 0 },
  uniqueTechs: unique.techs,
  uniqueUnit: unique.unit,
  visual: { scale: 1, emblem: glyph, crown: unique.crown || 'crown', weapon: unique.weapon || 'sword', robe: culture, aura: color },
  portrait: { crown: unique.crown || 'crown', weapon: unique.weapon || 'sword', pattern: culture, bg: color },
  music: unique.music || 'classical',
});

const tech = (faction, index, name, desc, effects = {}) => ({
  id: `unique_${faction}_${index}`, faction, name, desc,
  era: effects.era || 'Antiquity', cost: effects.cost || 95,
  prereq: effects.prereq || [], yields: effects.yields, unlockUnit: effects.unlockUnit,
  supply: effects.supply, move: effects.move, clean: effects.clean, pop: effects.pop,
  icon: effects.icon || 'i-wonder', unique: true,
});

const unit = (faction, id, name, cls, str, moves, techId, extra = {}) => ({
  id,
  def: { name, cls, str, moves, range: extra.range || 1, sight: extra.sight || 3, cost: extra.cost || 160, tech: techId, icon: extra.icon || 'i-strength', faction, unique: true, blurb: extra.blurb || '專屬精銳兵種。', rangedStr: extra.rangedStr, strategic: extra.strategic, domain: extra.domain, antiCav: extra.antiCav },
});

export const HISTORICAL_FACTIONS = [
  hist('rome', '羅馬', '愷撒', '羅馬獨裁官', 'europe', '#c9a227', '#7b2f2f', 'eagle', '條條大路', '道路與補給範圍 +4，重步兵 +15% 戰力。', {
    techs: [tech('rome', 1, '羅馬大道', '補給範圍 +4，所有陸軍移動 +1。', { era: 'Antiquity', cost: 110, supply: 4, move: 1 }), tech('rome', 2, '軍團制度', '重步兵與攻城單位 +15% 戰力。', { era: 'Exploration', cost: 180, yields: { production: 1 } })],
    unit: unit('rome', 'legionary', '羅馬軍團兵', 'melee', 46, 2, 'unique_rome_1', { cost: 150, blurb: '方盾與短劍組成的紀律軍團。' }), crown: 'laurel', weapon: 'gladius', music: 'classical',
  }, ['羅馬', '奧斯提亞', '卡普阿', '拉溫納', '那不勒斯', '拜占庭']),
  hist('han', '華夏', '漢武帝', '大漢天子', 'eastAsia', '#c94f3d', '#d8b45a', 'dragon', '絲路天命', '首都科學與文化 +15%，河流糧食 +1。', {
    techs: [tech('han', 1, '造紙術', '每回合文化 +3，立即獲得 20 科技進度。', { era: 'Antiquity', cost: 105, yields: { culture: 3 } }), tech('han', 2, '絲路驛站', '金幣 +20%，補給範圍 +3。', { era: 'Exploration', cost: 190, yields: { gold: 3 }, supply: 3 })],
    unit: unit('han', 'hanGuard', '羽林衛', 'melee', 42, 2, 'unique_han_1', { cost: 140, blurb: '宿衛京師的精銳禁軍。' }), crown: 'guan', weapon: 'dao', music: 'chinese',
  }, ['長安', '洛陽', '建康', '成都', '敦煌', '許昌']),
  hist('japan', '日本', '織田信長', '第六天魔王', 'eastAsia', '#b33a3a', '#2f4a63', 'sun', '天下布武', '火器與遠程單位 +20%，科技樹成本 -8%。', {
    techs: [tech('japan', 1, '鐵砲隊', '解鎖種子島火繩槍，遠程戰力 +20%。', { era: 'Modern', cost: 340, yields: { science: 1 } }), tech('japan', 2, '樂市樂座', '每座城市金幣 +2。', { era: 'Exploration', cost: 200, yields: { gold: 2 } })],
    unit: unit('japan', 'samurai', '武士', 'melee', 52, 2, 'unique_japan_1', { cost: 180, blurb: '刀與榮耀的化身。' }), crown: 'kabuto', weapon: 'katana', music: 'japanese',
  }, ['安土', '岐阜', '清洲', '大阪', '堺', '甲賀']),
  hist('egypt', '埃及', '拉美西斯二世', '拉美西斯大帝', 'middleEast', '#d1a03a', '#2d7f86', 'ankh', '尼羅河恩賜', '河流與氾濫平原食物 +1，奇觀生產 +15%。', {
    techs: [tech('egypt', 1, '尼羅河曆', '河流地格食物 +1，每回合科學 +2。', { era: 'Antiquity', cost: 95, yields: { science: 2 } }), tech('egypt', 2, '法老神權', '首都文化 +2，奇觀生產 +15%。', { era: 'Exploration', cost: 210, yields: { culture: 2 } })],
    unit: unit('egypt', 'warChariot', '法老戰車', 'cavalry', 44, 4, 'unique_egypt_1', { cost: 170, blurb: '尼羅河畔的雙馬戰車。' }), crown: 'pschent', weapon: 'khopesh', music: 'classical',
  }, ['孟菲斯', '底比斯', '亞歷山卓', '赫利奧波利斯', '阿拜多斯', '努比亞']),
  hist('greece', '希臘', '亞歷山大', '征服者', 'europe', '#5a8fc9', '#e8e1cf', 'column', '重裝方陣', '近戰 +18%，研究哲學科技 +15% 速度。', {
    techs: [tech('greece', 1, '馬其頓方陣', '解鎖重裝步兵，近戰 +18%。', { era: 'Antiquity', cost: 100, unlockUnit: 'phalangite' }), tech('greece', 2, '亞歷山大圖書館', '每回合科學 +4、文化 +2。', { era: 'Exploration', cost: 230, yields: { science: 4, culture: 2 } })],
    unit: unit('greece', 'phalangite', '重裝方陣兵', 'melee', 45, 2, 'unique_greece_1', { cost: 150, blurb: '長矛如林，正面無敵。' }), crown: 'laurel', weapon: 'sarissa', music: 'classical',
  }, ['雅典', '斯巴達', '科林斯', '底比斯', '羅德島', '佩拉']),
  hist('persia', '波斯', '大流士一世', '萬王之王', 'middleEast', '#7b4fa3', '#d8b45a', 'wing', '御道之網', '道路移動 +1，影響力 +25%。', {
    techs: [tech('persia', 1, '波斯御道', '所有陸軍移動 +1，補給 +4。', { era: 'Exploration', cost: 185, move: 1, supply: 4 }), tech('persia', 2, '行省制度', '每座城市影響力 +1。', { era: 'Exploration', cost: 210, yields: { influence: 1 } })],
    unit: unit('persia', 'immortal', '不死軍', 'melee', 48, 2, 'unique_persia_1', { cost: 165, blurb: '長生不死的皇家衛隊。' }), crown: 'tiara', weapon: 'spear', music: 'classical',
  }, ['波斯波利斯', '蘇薩', '巴比倫', '埃克巴坦那', '帕薩爾加德', '撒馬爾罕']),
  hist('britain', '大英', '伊莉莎白一世', '童貞女王', 'europe', '#395c8a', '#d7dbe0', 'crown', '日不落', '海軍 +25%，港口金幣 +2。', {
    techs: [tech('britain', 1, '皇家海軍', '海軍 +25%，解鎖風帆戰艦。', { era: 'Exploration', cost: 220 }), tech('britain', 2, '東印度公司', '每座港口城市金幣 +3。', { era: 'Exploration', cost: 260, yields: { gold: 3 } })],
    unit: unit('britain', 'redcoat', '紅衣軍', 'ranged', 48, 2, 'unique_britain_1', { rangedStr: 62, range: 2, cost: 190, blurb: '排槍齊射的線列步兵。' }), crown: 'crown', weapon: 'musket', music: 'classical',
  }, ['倫敦', '約克', '布里斯托', '利物浦', '愛丁堡', '都柏林']),
  hist('franks', '法蘭克', '查理曼', '羅馬人的皇帝', 'europe', '#4f6fa8', '#c9a227', 'fleur', '封建采邑', '每座城市生產 +1，騎兵 +15%。', {
    techs: [tech('franks', 1, '采邑制度', '每座城市生產 +1。', { era: 'Exploration', cost: 175, yields: { production: 1 } }), tech('franks', 2, '聖騎士團', '騎兵 +15%，解鎖聖騎士。', { era: 'Modern', cost: 320, unlockUnit: 'paladin' })],
    unit: unit('franks', 'paladin', '聖騎士', 'cavalry', 58, 4, 'unique_franks_1', { cost: 230, blurb: '信仰與鋼鐵的騎士。' }), crown: 'crown', weapon: 'lance', music: 'medieval',
  }, ['亞琛', '巴黎', '蘭斯', '圖爾', '里昂', '馬賽']),
  hist('germany', '德意志', '腓特烈大帝', '普魯士國王', 'europe', '#5a5f66', '#d8b45a', 'eagle', '參謀本部', '生產 +15%，攻城單位 +20%。', {
    techs: [tech('germany', 1, '參謀本部', '生產 +15%，陸軍移動 +1。', { era: 'Industrial', cost: 460, move: 1 }), tech('germany', 2, '閃電戰', '裝甲單位 +20% 戰力。', { era: 'Information', cost: 700 })],
    unit: unit('germany', 'panzer', '裝甲擲彈兵', 'melee', 82, 3, 'unique_germany_2', { cost: 360, blurb: '鋼鐵與紀律的現代先鋒。' }), crown: 'pickelhaube', weapon: 'rifle', music: 'classical',
  }, ['柏林', '波茨坦', '漢堡', '慕尼黑', '科隆', '法蘭克福']),
  hist('vikings', '維京', '克努特大帝', '北海之王', 'europe', '#4f7a82', '#b4c6c9', 'raven', '長船劫掠', '海軍 +20%，掠奪金幣 +30%。', {
    techs: [tech('vikings', 1, '維京長船', '海軍 +20%，解鎖長船。', { era: 'Exploration', cost: 190 }), tech('vikings', 2, '符文航海', '海軍移動 +1，探索視野 +1。', { era: 'Exploration', cost: 230, move: 1 })],
    unit: unit('vikings', 'berserker', '狂戰士', 'melee', 54, 3, 'unique_vikings_1', { cost: 180, blurb: '不畏死亡的北境戰士。' }), crown: 'horned', weapon: 'axe', music: 'medieval',
  }, ['烏普薩拉', '比爾卡', '尼達羅斯', '約塔蘭', '拉夫內', '尤米爾']),
  hist('arabia', '阿拉伯', '哈倫·拉希德', '智慧宮之主', 'middleEast', '#2f8f77', '#d8b45a', 'star', '智慧宮', '科學 +20%，圖書館與大學 +1 科學。', {
    techs: [tech('arabia', 1, '智慧宮', '科學 +20%，每回合文化 +2。', { era: 'Exploration', cost: 200, yields: { culture: 2 } }), tech('arabia', 2, '代數', '所有科技成本 -8%。', { era: 'Exploration', cost: 240, yields: { science: 3 } })],
    unit: unit('arabia', 'camelArcher', '駱駝弓騎', 'cavalry', 46, 4, 'unique_arabia_1', { rangedStr: 58, range: 2, cost: 190, blurb: '沙漠中的流動火力。' }), crown: 'turban', weapon: 'scimitar', music: 'classical',
  }, ['巴格達', '大馬士革', '麥加', '麥地那', '科爾多瓦', '開羅']),
  hist('ottoman', '奧斯曼', '蘇萊曼大帝', '立法者', 'middleEast', '#a34a3f', '#d8b45a', 'crescent', '征服者', '攻城 +25%，城市防禦 +10。', {
    techs: [tech('ottoman', 1, '烏爾班巨炮', '攻城單位 +25%，解鎖巨炮。', { era: 'Modern', cost: 360 }), tech('ottoman', 2, '米勒特制度', '每座城市文化 +1、影響力 +1。', { era: 'Exploration', cost: 220, yields: { culture: 1, influence: 1 } })],
    unit: unit('ottoman', 'janissary', '蘇丹親兵', 'ranged', 58, 2, 'unique_ottoman_1', { rangedStr: 72, range: 2, cost: 220, blurb: '帝國最精銳的火器步兵。' }), crown: 'turban', weapon: 'musket', music: 'classical',
  }, ['伊斯坦堡', '安卡拉', '布爾薩', '埃迪爾內', '大馬士革', '開羅']),
  hist('india', '印度', '阿育王', '孔雀之王', 'middleEast', '#c98239', '#7fc7c0', 'wheel', '非暴力法', '食物 +15%，戰爭疲勞降低。', {
    techs: [tech('india', 1, '阿育吠陀', '食物 +15%，單位回復 +2。', { era: 'Exploration', cost: 190, yields: { food: 2 } }), tech('india', 2, '梯田水利', '每座城市食物 +2。', { era: 'Antiquity', cost: 120, yields: { food: 2 } })],
    unit: unit('india', 'warElephant', '戰象', 'cavalry', 65, 2, 'unique_india_1', { cost: 240, blurb: '披甲戰象，撼動大地。' }), crown: 'mukuta', weapon: 'gada', music: 'classical',
  }, ['華氏城', '德里', '孟買', '加爾各答', '維查耶那加爾', '坦賈武爾']),
  hist('mongol', '蒙古', '成吉思汗', '世界的征服者', 'steppe', '#7d8f5a', '#d8b45a', 'horse', '草原鐵騎', '騎兵移動 +1、戰力 +20%，補給 +4。', {
    techs: [tech('mongol', 1, '蒙古驛站', '騎兵移動 +1，補給 +4。', { era: 'Exploration', cost: 185, move: 1, supply: 4 }), tech('mongol', 2, '怯薛軍', '騎兵 +20%，解鎖怯薛。', { era: 'Modern', cost: 330, unlockUnit: 'keshig' })],
    unit: unit('mongol', 'keshig', '怯薛', 'cavalry', 62, 5, 'unique_mongol_1', { cost: 230, blurb: '大汗最忠誠的騎兵。' }), crown: 'fur', weapon: 'bow', music: 'medieval',
  }, ['哈拉和林', '上都', '大都', '撒馬爾罕', '喀喇崑崙', '欽察']),
  hist('aztec', '阿茲特克', '蒙特祖馬二世', '太陽之子', 'americas', '#4f8f4f', '#d8b45a', 'sun', '獻祭榮耀', '近戰 +18%，擊殺獲得文化。', {
    techs: [tech('aztec', 1, '太陽曆', '文化 +15%，每回合信仰 +2。', { era: 'Antiquity', cost: 110, yields: { faith: 2 } }), tech('aztec', 2, '美洲豹戰士', '近戰 +18%，解鎖美洲豹戰士。', { era: 'Antiquity', cost: 140, unlockUnit: 'jaguar' })],
    unit: unit('aztec', 'jaguar', '美洲豹戰士', 'melee', 48, 3, 'unique_aztec_1', { cost: 160, blurb: '叢林中的無聲獵手。' }), crown: 'feather', weapon: 'macuahuitl', music: 'medieval',
  }, ['特諾奇提特蘭', '特斯科科', '特拉科潘', '喬盧拉', '圖拉', '馬利納爾科']),
  hist('inca', '印加', '帕查庫蒂', '大地震動者', 'americas', '#c9a227', '#8f4f3f', 'mountain', '梯田山城', '丘陵與高山食物 +2，移動不受丘陵懲罰。', {
    techs: [tech('inca', 1, '印加梯田', '丘陵食物 +2，城市食物 +1。', { era: 'Antiquity', cost: 105, yields: { food: 2 } }), tech('inca', 2, '皇家驛道', '山地移動 +1，補給 +3。', { era: 'Exploration', cost: 200, move: 1, supply: 3 })],
    unit: unit('inca', 'slinger', '印加投石手', 'ranged', 34, 2, 'unique_inca_1', { rangedStr: 48, range: 2, cost: 120, blurb: '山地伏擊的投石精兵。' }), crown: 'feather', weapon: 'sling', music: 'medieval',
  }, ['庫斯科', '馬丘比丘', '奧蘭泰坦博', '皮薩克', '昌昌', '基多']),
];

export const THREE_KINGDOM_FACTIONS = [
  {
    id: 'wei', key: 'wei', category: 'threeKingdoms', name: '魏', leader: '曹操', title: '魏武帝', culture: 'eastAsia',
    colors: { primary: '#3f6ea8', secondary: '#1f2f4a', border: '#8ec6ff', glow: '#6da8ff' }, glyph: 'dragon',
    traitName: '屯田令', trait: '每座城市 +1 食物、+1 生產。', cityNames: ['許昌', '鄴', '長安', '宛', '陳留', '濮陽'], capitalName: '許昌',
    bonus: { yields: { food: 1, production: 1 }, yieldPct: {}, combat: 0.05, ranged: 0, navy: 0, supply: 1, healOwn: 0 },
    uniqueTechs: [
      tech('wei', 1, '八陣圖', '解鎖八陣圖，近戰與攻城單位 +15% 戰力。', { era: 'Antiquity', cost: 130, yields: { production: 2 } }),
      tech('wei', 2, '虎豹騎', '解鎖虎豹騎，騎兵 +20% 戰力。', { era: 'Antiquity', cost: 160, unlockUnit: 'tigerCavalry' }),
      tech('wei', 3, '屯田水利', '每座城市食物 +2、生產 +1。', { era: 'Exploration', cost: 220, yields: { food: 2, production: 1 } }),
    ],
    uniqueUnit: unit('wei', 'tigerCavalry', '虎豹騎', 'cavalry', 64, 4, 'unique_wei_2', { cost: 190, blurb: '曹操麾下最精銳的重騎兵。' }),
    visual: { scale: 1.02, emblem: 'dragon', crown: 'guan', weapon: 'dao', robe: 'eastAsia', aura: '#6da8ff' },
    portrait: { crown: 'guan', weapon: 'dao', pattern: 'eastAsia', bg: '#3f6ea8' }, music: 'chinese',
  },
  {
    id: 'shu', key: 'shu', category: 'threeKingdoms', name: '蜀', leader: '劉備', title: '漢昭烈帝', culture: 'eastAsia',
    colors: { primary: '#c54a3d', secondary: '#3a211d', border: '#ffb0a3', glow: '#ff7a6a' }, glyph: 'dragon',
    traitName: '仁德', trait: '單位在己方領土回復生命，補給 +2。', cityNames: ['成都', '漢中', '江州', '永安', '梓潼', '綿竹'], capitalName: '成都',
    bonus: { yields: {}, yieldPct: {}, combat: 0, ranged: 0, navy: 0, supply: 2, healOwn: 3 },
    uniqueTechs: [
      tech('shu', 1, '木牛流馬', '生產 +20%，補給範圍 +4。', { era: 'Antiquity', cost: 130, supply: 4, yields: { production: 2 } }),
      tech('shu', 2, '諸葛連弩', '解鎖諸葛連弩，遠程單位 +25% 戰力。', { era: 'Exploration', cost: 220, unlockUnit: 'repeatingCrossbow' }),
      tech('shu', 3, '八陣圖', '軍隊防禦 +15%，計略傷害 +15%。', { era: 'Exploration', cost: 230, yields: { science: 2 } }),
    ],
    uniqueUnit: unit('shu', 'repeatingCrossbow', '諸葛連弩', 'ranged', 44, 2, 'unique_shu_2', { rangedStr: 72, range: 2, cost: 200, blurb: '十矢連發的蜀漢神兵。' }),
    visual: { scale: 1.0, emblem: 'dragon', crown: 'guan', weapon: 'crossbow', robe: 'eastAsia', aura: '#ff7a6a' },
    portrait: { crown: 'guan', weapon: 'crossbow', pattern: 'eastAsia', bg: '#c54a3d' }, music: 'chinese',
  },
  {
    id: 'wu', key: 'wu', category: 'threeKingdoms', name: '吳', leader: '孫權', title: '吳大帝', culture: 'eastAsia',
    colors: { primary: '#2f8f77', secondary: '#173b35', border: '#8ff5d6', glow: '#5ce0c0' }, glyph: 'wave',
    traitName: '江東水師', trait: '水軍與沿岸單位 +25% 戰力，港口金幣 +2。', cityNames: ['建業', '吳', '會稽', '柴桑', '廬江', '丹陽'], capitalName: '建業',
    bonus: { yields: { gold: 1 }, yieldPct: {}, combat: 0, ranged: 0, navy: 0.25, supply: 1, healOwn: 0 },
    uniqueTechs: [
      tech('wu', 1, '錦帆水軍', '海軍 +25%，解鎖錦帆水軍。', { era: 'Antiquity', cost: 125, unlockUnit: 'riverMarines' }),
      tech('wu', 2, '赤壁火計', '計略傷害 +30%，火攻範圍 +1。', { era: 'Exploration', cost: 230, yields: { culture: 2 } }),
      tech('wu', 3, '江東造船', '港口金幣 +2，海軍移動 +1。', { era: 'Exploration', cost: 210, yields: { gold: 2 }, move: 1 }),
    ],
    uniqueUnit: unit('wu', 'riverMarines', '錦帆水軍', 'navy', 52, 4, 'unique_wu_1', { rangedStr: 60, range: 2, domain: 'water', riverine: true, cost: 200, blurb: '乘風破浪的江東水師。' }),
    visual: { scale: 1.0, emblem: 'wave', crown: 'crown', weapon: 'trident', robe: 'eastAsia', aura: '#5ce0c0' },
    portrait: { crown: 'crown', weapon: 'trident', pattern: 'eastAsia', bg: '#2f8f77' }, music: 'chinese',
  },
  {
    id: 'warlords', key: 'warlords', category: 'threeKingdoms', name: '群雄', leader: '呂布', title: '飛將', culture: 'eastAsia',
    colors: { primary: '#8a4a3a', secondary: '#2b1b18', border: '#ffb08a', glow: '#ff8a5a' }, glyph: 'spear',
    traitName: '無雙飛將', trait: '騎兵 +25% 戰力，掠奪城市獲得額外金幣。', cityNames: ['洛陽', '長安', '宛', '襄陽', '壽春', '晉陽'], capitalName: '洛陽',
    bonus: { yields: {}, yieldPct: {}, combat: 0.12, ranged: 0, navy: 0, supply: 0, healOwn: 0, raid: true },
    uniqueTechs: [
      tech('warlords', 1, '陷陣營', '近戰與攻城單位 +20% 戰力。', { era: 'Antiquity', cost: 145 }),
      tech('warlords', 2, '西涼鐵騎', '騎兵 +25%，移動 +1。', { era: 'Exploration', cost: 220, move: 1 }),
      tech('warlords', 3, '藤甲兵', '叢林與沼澤作戰 +25%，解鎖藤甲兵。', { era: 'Exploration', cost: 230, unlockUnit: 'tengArmor' }),
    ],
    uniqueUnit: unit('warlords', 'tengArmor', '藤甲兵', 'melee', 58, 2, 'unique_warlords_3', { cost: 210, blurb: '刀箭難入的南中藤甲。' }),
    visual: { scale: 1.03, emblem: 'spear', crown: 'horned', weapon: 'halberd', robe: 'eastAsia', aura: '#ff8a5a' },
    portrait: { crown: 'horned', weapon: 'halberd', pattern: 'eastAsia', bg: '#8a4a3a' }, music: 'chinese',
  },
];

const ALIEN_ARCHETYPES = {
  crystal: {
    key: 'silicate', name: '矽基晶體族', culture: 'alienCrystal', unitStyle: 'crystal', color: '#6d8cff', glow: '#8ff5ff',
    leaders: ['棱光母體', '晶核·阿爾法', '石英先知'], cityNames: ['晶簇聖城', '折射之都', '棱鏡港', '共振尖塔', '光譜巢', '量子晶原'],
    traits: ['晶體共鳴', '棱鏡折射', '地脈結晶'],
    techs: ['母星地貌晶化', '軌道孢子空投', '曲速折躍門'],
  },
  swarm: {
    key: 'swarm', name: '蟲群生化族', culture: 'alienSwarm', unitStyle: 'swarm', color: '#a8d84a', glow: '#d8ff5a',
    leaders: ['孵化母蟲', '千顎女王', '孢群意識'], cityNames: ['母巢', '腐植城', '孢子海', '幾丁穹頂', '酸池', '蠕動深淵'],
    traits: ['群體意識', '生質吞噬', '孢子擴散'],
    techs: ['活體城牆', '軌道孢子空投', '基因吞噬矩陣'],
  },
  machine: {
    key: 'machine', name: '機械矩陣族', culture: 'alienMachine', unitStyle: 'machine', color: '#ff8a4a', glow: '#ffb35a',
    leaders: ['主控矩陣', '零號協議', '鍛造核心'], cityNames: ['矩陣樞紐', '鑄造環', '邏輯城', '散熱塔', '資料井', '自律工廠'],
    traits: ['完美效率', '奈米修復', '邏輯預測'],
    techs: ['黑金全息矩陣', '自律軌道艦隊', '曲速折躍門'],
  },
  energy: {
    key: 'ethereal', name: '星靈能量族', culture: 'alienEnergy', unitStyle: 'energy', color: '#c58aff', glow: '#f0c9ff',
    leaders: ['星靈議會', '虛空詠者', '光輝意志'], cityNames: ['星輝聖所', '乙太之門', '極光城', '意識之海', '虹光塔', '虛空港'],
    traits: ['星界感知', '能量虹吸', '相位穿梭'],
    techs: ['星靈共鳴場', '軌道星門', '曲速折躍門'],
  },
};

const ALIEN_SUFFIX = ['阿克西斯', '涅索斯', '索拉利斯', '維度零', '奧米加', '赫利克斯', '賽倫', '卡俄斯'];

export function generateAlienFaction(seed = 1, overrides = {}) {
  const keys = Object.keys(ALIEN_ARCHETYPES);
  const s = Math.abs((seed | 0) || 1);
  const arch = ALIEN_ARCHETYPES[keys[s % keys.length]];
  const n = (s * 9301 + 49297) % 233280;
  const idx = Math.floor((n / 233280) * arch.leaders.length);
  const id = `alien_${arch.key}_${s % 9973}`;
  const leader = overrides.leader || `${arch.leaders[idx]}·${ALIEN_SUFFIX[(s >>> 3) % ALIEN_SUFFIX.length]}`;
  const name = overrides.name || `${arch.name} ${String(s % 99).padStart(2, '0')}`;
  const primary = overrides.color || arch.color;
  const glow = overrides.glow || arch.glow;
  const techNames = overrides.techs || arch.techs;
  const uniqueTechs = techNames.map((tName, i) => tech(id, i + 1, tName, [
    '母星地貌晶化：地格食物與生產 +2，解鎖晶體地貌。',
    '軌道孢子空投：補給範圍 +4，解鎖軌道投送。',
    '曲速折躍門：所有單位移動 +2，解鎖相位躍遷。',
  ][i] || '外星科技。', { era: ['Exploration', 'Fusion', 'Orbital'][i] || 'Fusion', cost: [240, 900, 1800][i] || 900, move: i === 2 ? 2 : 0, supply: i === 1 ? 4 : 0, yields: i === 0 ? { production: 2, food: 2 } : undefined, icon: 'i-science' }));
  return {
    id, key: id, category: 'alien', name, leader, title: arch.traits[s % arch.traits.length],
    culture: arch.culture, colors: { primary, secondary: '#1a2030', border: glow, glow }, glyph: 'eye',
    traitName: arch.traits[(s >>> 2) % arch.traits.length],
    trait: `${arch.name}：${['地格產出隨腐化提升', '單位在真菌地格回復', '生產與研究效率極高', '能量護盾減傷'][keys.indexOf(arch.key)]}。`,
    cityNames: arch.cityNames, capitalName: arch.cityNames[0],
    bonus: {
      yields: keys.indexOf(arch.key) === 1 ? { food: 1 } : keys.indexOf(arch.key) === 2 ? { production: 1 } : {},
      yieldPct: keys.indexOf(arch.key) === 3 ? { science: 0.12 } : {}, combat: keys.indexOf(arch.key) === 1 ? 0.08 : 0,
      ranged: keys.indexOf(arch.key) === 3 ? 0.1 : 0, navy: 0, supply: keys.indexOf(arch.key) === 1 ? 2 : 0,
      healOwn: keys.indexOf(arch.key) === 1 ? 2 : 0, corruption: keys.indexOf(arch.key) === 0 ? 0.15 : 0,
    },
    uniqueTechs,
    uniqueUnit: unit(id, `${arch.key}Unit`, `${arch.name}先鋒`, keyToCls(arch.key), 58, 3, `unique_${id}_1`, { cost: 220, blurb: `${arch.name}的異星先鋒部隊。` }),
    visual: { scale: 1.06, emblem: 'eye', crown: arch.key, weapon: arch.key, robe: arch.culture, aura: glow, alien: true },
    portrait: { crown: arch.key, weapon: arch.key, pattern: arch.culture, bg: primary, eyes: arch.key },
    music: 'scifi', seed: s,
    alien: { archetype: arch.key, matrix: overrides.matrix || null, corruption: overrides.corruption ?? 0.4 },
  };
}

function keyToCls(key) {
  return key === 'crystal' ? 'ranged' : key === 'swarm' ? 'melee' : key === 'machine' ? 'siege' : 'air';
}

export function defaultFactions() {
  const factions = {};
  for (const f of [...HISTORICAL_FACTIONS, ...THREE_KINGDOM_FACTIONS]) factions[f.id] = f;
  for (let i = 0; i < 4; i++) {
    const f = generateAlienFaction(4100 + i * 137);
    factions[f.id] = f;
  }
  return factions;
}

const DEFAULT_FORMULAS = {
  combat: { baseDamage: 22, attackExponent: 0.55, highGround: 1.25, riverPenalty: 0.82, flankBonus: 1.18, cityBase: 10 },
  economy: { popFoodExponent: 1.0, riverFoodBonus: 1, scienceMultiplier: 1, cultureMultiplier: 1, goldExchange: 1 },
  tech: { eraBase: [30, 170, 320, 430, 650, 980, 1450, 2100], growth: 1.16, uniqueMultiplier: 1.1 },
};

const DEFAULT_TERRAIN = {
  grassland: { name: '平原', yields: { food: 2 }, move: 1, defense: 0, sight: 0 },
  plains: { name: '草原', yields: { food: 1, production: 1 }, move: 1, defense: 0, sight: 0 },
  desert: { name: '沙漠', yields: { gold: 1 }, move: 1, defense: 0, sight: 0 },
  tundra: { name: '凍原', yields: { food: 1 }, move: 1, defense: 0, sight: 0 },
  snow: { name: '雪原', yields: {}, move: 2, defense: 0.05, sight: 0 },
  hills: { name: '丘陵', yields: { production: 2 }, move: 2, defense: 0.2, sight: 1 },
  mountain: { name: '高山', yields: { production: 1 }, move: 99, defense: 0.35, sight: 2 },
  coast: { name: '沿海', yields: { food: 1, gold: 1 }, move: 1, defense: 0, sight: 0 },
  ocean: { name: '海洋', yields: { food: 1, gold: 1 }, move: 1, defense: 0, sight: 0 },
  lake: { name: '湖泊', yields: { food: 2 }, move: 1, defense: 0, sight: 0 },
  crystal: { name: '外星晶化', yields: { science: 2, production: 1 }, move: 2, defense: 0.1, sight: 1 },
  lava: { name: '熔岩', yields: { production: 2 }, move: 99, defense: 0.3, sight: 2 },
  forest: { name: '森林', yields: { production: 1 }, move: 2, defense: 0.25, sight: -1, feature: true },
  jungle: { name: '叢林', yields: { food: 1 }, move: 2, defense: 0.25, sight: -1, feature: true },
  marsh: { name: '沼澤', yields: { food: 1 }, move: 2, defense: 0.15, sight: 0, feature: true },
  oasis: { name: '綠洲', yields: { food: 2, gold: 1 }, move: 1, defense: 0, sight: 0, feature: true },
};

export const DEFAULT_CONFIG = {
  version: 1,
  options: DEFAULT_OPTIONS,
  factions: defaultFactions(),
  formulas: DEFAULT_FORMULAS,
  terrain: DEFAULT_TERRAIN,
  visuals: {
    unitScale: 1, cityScale: 1, alienGlow: 1.4, shadowQuality: 'high',
    unitColors: {}, cityColors: {}, motionSpeed: 1,
  },
  techOverrides: {},
  gm: { lastTab: 'visual' },
};

function clone(o) { return JSON.parse(JSON.stringify(o)); }
function merge(target, source) {
  for (const [k, v] of Object.entries(source || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      target[k] = merge(target[k] && typeof target[k] === 'object' ? target[k] : {}, v);
    } else target[k] = clone(v);
  }
  return target;
}

export const GameMasterConfig = clone(DEFAULT_CONFIG);

export function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.version === DEFAULT_CONFIG.version) {
        merge(GameMasterConfig, saved);
        merge(GameMasterConfig, { options: merge(clone(DEFAULT_OPTIONS), saved.options || {}) });
      }
    }
  } catch (e) { console.warn('Config load failed', e); }
  return GameMasterConfig;
}

export function saveConfig() {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(GameMasterConfig)); } catch (e) { console.warn(e); }
}

export function resetConfig() {
  const fresh = clone(DEFAULT_CONFIG);
  for (const k of Object.keys(GameMasterConfig)) delete GameMasterConfig[k];
  Object.assign(GameMasterConfig, fresh);
  try { localStorage.removeItem(CONFIG_KEY); } catch (e) { /* ignore */ }
  return GameMasterConfig;
}

export function exportConfig() { return JSON.stringify(GameMasterConfig, null, 2); }

export function importConfig(json) {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json;
  if (!parsed || typeof parsed !== 'object') throw new Error('設定檔格式錯誤');
  const fresh = clone(DEFAULT_CONFIG);
  merge(fresh, parsed);
  for (const k of Object.keys(GameMasterConfig)) delete GameMasterConfig[k];
  Object.assign(GameMasterConfig, fresh);
  saveConfig();
  return GameMasterConfig;
}

export function saveSetup(setup) {
  try { localStorage.setItem(SETUP_KEY, JSON.stringify(setup)); } catch (e) { /* ignore */ }
}
export function loadSetup() {
  try { return JSON.parse(localStorage.getItem(SETUP_KEY) || 'null'); } catch (e) { return null; }
}
export function clearSetup() { try { localStorage.removeItem(SETUP_KEY); } catch (e) { /* ignore */ } }

export function getFaction(id) {
  return GameMasterConfig.factions[id] || GameMasterConfig.factions[Object.keys(GameMasterConfig.factions)[0]];
}

export function factionCivDef(faction) {
  const c = faction.colors;
  const primary = parseInt(String(c.primary).replace('#', ''), 16);
  const accent = parseInt(String(c.secondary).replace('#', ''), 16);
  const border = parseInt(String(c.border).replace('#', ''), 16);
  return {
    id: faction.id,
    factionKey: faction.key || faction.id,
    category: faction.category,
    name: faction.name,
    leader: faction.leader,
    title: faction.title || '',
    color: primary,
    accent,
    border,
    colorHex: c.primary,
    glyph: faction.glyph || 'sun',
    traitName: faction.traitName || '文明特性',
    trait: faction.trait || '',
    personality: faction.category === 'alien' ? 'visionary' : 'builder',
    greeting: faction.category === 'alien' ? '你們的訊號，已被母星聽見。' : `${faction.name}的旗幟將再次升起。`,
    cityNames: faction.cityNames,
    capitalName: faction.capitalName || faction.cityNames?.[0],
    visual: faction.visual,
    culture: faction.culture,
    portrait: faction.portrait,
    bonus: faction.bonus,
    uniqueUnit: faction.uniqueUnit,
    music: faction.music,
  };
}

export function playableFactions(category) {
  return Object.values(GameMasterConfig.factions).filter((f) => !category || category === 'all' || f.category === category);
}

export function ensureAlienOptions(count = 3, seedBase = 7000) {
  const list = [];
  for (let i = 0; i < count; i++) {
    const seed = seedBase + i * 271;
    const f = generateAlienFaction(seed);
    if (!GameMasterConfig.factions[f.id]) GameMasterConfig.factions[f.id] = f;
    list.push(f);
  }
  return list;
}

export function buildActiveCivDefs(setup) {
  const player = getFaction(setup?.playerFaction) || getFaction('aurelia');
  const opponentIds = (setup?.opponents || []).filter((id) => id && id !== player.id);
  const ids = [player.id, ...opponentIds];
  const chosen = ids.map(getFaction).filter(Boolean);
  if (!chosen.length) chosen.push(getFaction('aurelia'));
  return chosen.map(factionCivDef);
}

export function buildUniqueTechs() {
  const out = [];
  for (const f of Object.values(GameMasterConfig.factions)) {
    for (const t of f.uniqueTechs || []) {
      if (!t.id || out.some((x) => x.id === t.id)) continue;
      out.push({ ...t, faction: f.key || f.id, bonus: t.desc, unique: true, icon: t.icon || 'i-wonder' });
    }
  }
  return out;
}

export function buildMasteryTechs(baseTechs) {
  const out = [];
  const lanes = [
    { key: 'mil', label: '軍事', icon: 'i-strength', yields: { production: 1 } },
    { key: 'eco', label: '經濟', icon: 'i-gold', yields: { gold: 1 } },
    { key: 'sci', label: '科研', icon: 'i-research', yields: { science: 1 } },
    { key: 'cul', label: '文化', icon: 'i-culture', yields: { culture: 1 } },
  ];
  for (const t of baseTechs) {
    if (t.unique || t.codex) continue;
    for (const lane of lanes) {
      out.push({
        id: `${t.id}_${lane.key}`, name: `${t.name}·${lane.label}精通`,
        era: t.era, cost: Math.round((t.cost || 60) * 1.18), prereq: [t.id],
        bonus: `深化${t.name}的${lane.label}應用。`, icon: lane.icon,
        yields: lane.yields, codex: true, mastery: lane.key,
      });
    }
  }
  return out;
}

export function applyTerrainToWorld(BIOMES, FEATURES) {
  for (const [key, def] of Object.entries(GameMasterConfig.terrain)) {
    if (def.feature && FEATURES[key]) {
      FEATURES[key].yields = { ...def.yields };
      FEATURES[key].move = def.move;
      FEATURES[key].defense = def.defense;
      FEATURES[key].sight = def.sight;
    } else if (BIOMES[key]) {
      BIOMES[key].yields = { ...def.yields };
      BIOMES[key].move = def.move;
      BIOMES[key].defense = def.defense;
      BIOMES[key].sight = def.sight;
    }
  }
}

export function difficultyInfo(id) { return DIFFICULTIES[id] || DIFFICULTIES.normal; }

export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) { h ^= String(str).charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export { SETUP_KEY, CONFIG_KEY };
