import * as THREE from 'three';
import { GameMasterConfig, ALIEN_KINDS } from './config.js';
import { UNIT_TYPES, TECHS } from './game.js';
import { TECH_ERA_ORDER } from './expansions.js';
import { createCityMesh, createUnitMesh } from './world.js';

const esc = (value) => String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const LANG = {
  zh: {
    newGame: '開始新遊戲', continueGame: '繼續 / 讀取', options: '系統選項', encyclopedia: '萬國與星際百科', gm: 'GM 平台',
    tagline: '從上古到星海，書寫你的文明史詩', taglineHtml: '從上古到星海，<br>書寫你的文明史詩', newCampaign: '新戰役', chooseMode: '選擇時代與世界',
    gameTitle: '文明帝國 <em>VII</em>', menuLead: '十六個歷史文明、三國群雄、四種外星生命型態。從上古陶器到 2100 年的奇點，所有規則皆由 <b>GameMasterConfig</b> 驅動。',
    badgeHistory: '16 歷史文明', badgeTech: '123 項科技', badgeGm: 'GM 平台', badgeLang: '3 語言', noSave: '尚無存檔',
    backToMenu: '返回主選單', modeLegacyDesc: '從上古時代一路走向 2100 年。八個時代、123 項科技、氣候危機與外星異變。',
    mode3kDesc: '曹操、劉備、孫權與呂布爭奪天下。名將、糧道與水軍決定勝負。', modeChronoDesc: '永生三國諸雄跨越時空，從冷兵器研發到機甲、軌道武器與奇點。',
    mapDesc: '種子、海平面、山脈與異變將即時重塑世界。', mapHint: '地圖預覽使用與遊戲相同的種子與海陸比例。重新生成只改變種子。',
    factionDescHist: '歷史文明擁有專屬領袖、城市、科技與三維建築。', factionDesc3k: '選擇魏、蜀、吳或群雄。', previewHint: '3D 資產預覽 · 點擊切換',
    uniqueUnit: '專屬單位', uniqueTech: '專屬科技', alienReady: '已生成 {n} 個外星文明。生成後會加入世界並可作為玩家或對手。',
    factionCount: '目前可選 {n} 個文明；歷史模式收錄 16 個文明與可生成的外星勢力。', factionCount3k: '目前可選 {n} 個文明；三國模式限制為 4 位君主。',
    rivalsDesc: '選擇對手數量與世界規則。所有設定可於 GM 平台即時調整。', shadowOff: '關閉', shadowLow: '低', shadowMedium: '中', shadowHigh: '高',
    reloadNote: '（重新載入後生效）', savedLocally: '選項 · 本機儲存', chronoPool: '三國時空', alienKindsHint: '矽晶 · 蟲群 · 機械 · 靈能',
    next: '下一步', back: '上一步', start: '建立世界', setup: '新遊戲設定', step: '步驟',
    mode: '世界模式', map: '地圖生成', faction: '選擇文明', rivals: '對手與規則', language: '語言',
    standard: '標準文明', threeKingdoms: '三國志', chrono: '時空裂縫 2100',
    historical: '歷史文明', aliens: '外星文明', generateAlien: '生成外星文明',
    opponents: '對手數量', difficulty: '難度', startEra: '起始時代', music: '音樂風格', seed: '世界種子', sea: '海平面', mountain: '山脈比例', mutation: '異變強度',
    regenerate: '重新生成', close: '關閉', apply: '套用', save: '儲存', reset: '重設', export: '匯出', import: '匯入',
    visual: '視覺與資產', stats: '單位與文明', formulas: '公式與數學', terrain: '地形與高程', god: '上帝模式與設定',
    master: '主音量', bgm: '背景音樂', sfx: '音效', uiVolume: '介面音效', renderScale: '解析度縮放', uiScale: '介面縮放',
    fullscreen: '全螢幕', shadows: '陰影品質', antialias: '反鋸齒', camera: '鏡頭靈敏度',
    autoTurn: '自動結束回合', hexEdges: '顯示六角格線', gameplay: '玩法', display: '顯示與效能', audio: '音訊',
    techTree: '科技樹', units: '單位', factions: '文明', search: '搜尋', attackTest: '測試攻擊動畫'
  },
  en: {
    newGame: 'New Game', continueGame: 'Continue / Load', options: 'Options', encyclopedia: 'Factions & Encyclopedia', gm: 'GM Studio',
    tagline: 'From antiquity to the stars, write your civilization epic', taglineHtml: 'From antiquity to the<br>stars, write your epic', newCampaign: 'New Campaign', chooseMode: 'Choose an era and world',
    gameTitle: 'Civilization <em>VII</em>', menuLead: 'Sixteen historical civilizations, the warlords of the Three Kingdoms, and four alien lifeforms. From ancient pottery to the 2100 singularity, every rule is driven by <b>GameMasterConfig</b>.',
    badgeHistory: '16 Civilizations', badgeTech: '123 Technologies', badgeGm: 'GM Studio', badgeLang: '3 Languages', noSave: 'No save data',
    backToMenu: 'Back to Main Menu', modeLegacyDesc: 'Journey from antiquity to 2100. Eight eras, 123 technologies, climate crises, and alien mutations.',
    mode3kDesc: 'Cao Cao, Liu Bei, Sun Quan, and Lu Bu contest the realm. Generals, supply lines, and navies decide victory.', modeChronoDesc: 'The immortal warlords cross time itself, from cold steel to mecha, orbital weapons, and the singularity.',
    mapDesc: 'Seed, sea level, mountains, and mutation reshape the world in real time.', mapHint: 'The preview uses the same seed and land ratio as the game. Regenerate only changes the seed.',
    factionDescHist: 'Historical civilizations include unique leaders, cities, technologies, and 3D architecture.', factionDesc3k: 'Choose Wei, Shu, Wu, or the warlords.', previewHint: '3D ASSET PREVIEW · CLICK TO SWAP',
    uniqueUnit: 'Unique Unit', uniqueTech: 'Unique Tech', alienReady: '{n} alien civilizations generated. Each joins the world as a playable faction or rival.',
    factionCount: '{n} civilizations available; historical mode includes 16 civilizations and generated alien powers.', factionCount3k: '{n} civilizations available; Three Kingdoms mode is limited to 4 rulers.',
    rivalsDesc: 'Choose the number of rivals and world rules. Everything can be changed live in GM Studio.', shadowOff: 'Off', shadowLow: 'Low', shadowMedium: 'Medium', shadowHigh: 'High',
    reloadNote: ' (applies after reload)', savedLocally: 'OPTIONS · SAVED LOCALLY', chronoPool: 'Three Kingdoms Era', alienKindsHint: 'Silicon · Swarm · Machine · Psionic',
    next: 'Next', back: 'Back', start: 'Create World', setup: 'New Game Setup', step: 'Step',
    mode: 'World Mode', map: 'Map Generation', faction: 'Choose Civilization', rivals: 'Rivals & Rules', language: 'Language',
    standard: 'Standard', threeKingdoms: 'Three Kingdoms', chrono: 'Chrono Rift 2100',
    historical: 'Historical', aliens: 'Alien', generateAlien: 'Generate Alien',
    opponents: 'Opponents', difficulty: 'Difficulty', startEra: 'Starting Era', music: 'Music Style', seed: 'World Seed', sea: 'Sea Level', mountain: 'Mountains', mutation: 'Mutation',
    regenerate: 'Regenerate', close: 'Close', apply: 'Apply', save: 'Save', reset: 'Reset', export: 'Export', import: 'Import',
    visual: 'Visual & Asset', stats: 'Units & Factions', formulas: 'Formula Engine', terrain: 'Terrain Matrix', god: 'God Mode & IO',
    master: 'Master', bgm: 'Music', sfx: 'SFX', uiVolume: 'UI Sound', renderScale: 'Render Scale', uiScale: 'UI Scale',
    fullscreen: 'Fullscreen', shadows: 'Shadow Quality', antialias: 'Antialias', camera: 'Camera Sensitivity',
    autoTurn: 'Auto End Turn', hexEdges: 'Show Hex Grid', gameplay: 'Gameplay', display: 'Display & Performance', audio: 'Audio',
    techTree: 'Tech Tree', units: 'Units', factions: 'Factions', search: 'Search', attackTest: 'Test Attack Animation'
  },
  ja: {
    newGame: '新しいゲーム', continueGame: '続きから / ロード', options: 'オプション', encyclopedia: '文明と星間百科', gm: 'GMスタジオ',
    tagline: '古代から星海へ、文明史を刻む', taglineHtml: '古代から星海へ、<br>文明史を刻む', newCampaign: '新キャンペーン', chooseMode: '時代と世界を選択',
    gameTitle: 'シヴィライゼーション <em>VII</em>', menuLead: '16の歴史文明、三国志の群雄、4種の宇宙生命体。古代の土器から2100年のシンギュラリティまで、すべてのルールは <b>GameMasterConfig</b> が駆動します。',
    badgeHistory: '16 文明', badgeTech: '123 技術', badgeGm: 'GMスタジオ', badgeLang: '3 言語', noSave: 'セーブなし',
    backToMenu: 'メインメニューへ', modeLegacyDesc: '古代から2100年へ。8つの時代、123の技術、気候危機、宇宙変異。',
    mode3kDesc: '曹操、劉備、孫権、呂布が天下を争う。名将、兵站、水軍が勝敗を決める。', modeChronoDesc: '不死の群雄が時空を越え、冷兵器から機甲、軌道兵器、シンギュラリティへ。',
    mapDesc: 'シード、海面、山脈、変異が世界をリアルタイムに再構築します。', mapHint: 'プレビューはゲームと同じシードと陸海比を使用します。再生成で変わるのはシードのみです。',
    factionDescHist: '歴史文明には固有の指導者、都市、技術、3D建築があります。', factionDesc3k: '魏・蜀・呉・群雄から選択。', previewHint: '3Dアセットプレビュー · クリックで切替',
    uniqueUnit: '固有ユニット', uniqueTech: '固有技術', alienReady: '{n} の宇宙文明を生成済み。プレイヤーまたは敵として世界に参加します。',
    factionCount: '選択可能な文明は {n}。歴史モードには16文明と生成型宇宙勢力が含まれます。', factionCount3k: '選択可能な文明は {n}。三国志モードは4君主に限定されます。',
    rivalsDesc: '敵対文明数と世界ルールを選択。すべてGMスタジオでリアルタイムに変更できます。', shadowOff: 'オフ', shadowLow: '低', shadowMedium: '中', shadowHigh: '高',
    reloadNote: '（再読み込み後に反映）', savedLocally: 'オプション · ローカル保存', chronoPool: '三国時空', alienKindsHint: '硅晶 · 蟲群 · 機械 · 霊能',
    next: '次へ', back: '戻る', start: '世界を創る', setup: '新ゲーム設定', step: 'ステップ',
    mode: '世界モード', map: 'マップ生成', faction: '文明選択', rivals: '敵対文明とルール', language: '言語',
    standard: '標準文明', threeKingdoms: '三国志', chrono: '時空裂縫 2100',
    historical: '歴史文明', aliens: '宇宙文明', generateAlien: '宇宙文明を生成',
    opponents: '敵対文明数', difficulty: '難易度', startEra: '開始時代', music: '音楽スタイル', seed: '世界シード', sea: '海面', mountain: '山脈', mutation: '変異',
    regenerate: '再生成', close: '閉じる', apply: '適用', save: '保存', reset: 'リセット', export: '書き出し', import: '読み込み',
    visual: 'ビジュアル', stats: 'ユニットと文明', formulas: '計算式', terrain: '地形マトリクス', god: 'ゴッドモードとIO',
    master: 'マスター', bgm: 'BGM', sfx: '効果音', uiVolume: 'UI音', renderScale: '描画倍率', uiScale: 'UI倍率',
    fullscreen: '全画面', shadows: '影の品質', antialias: 'アンチエイリアス', camera: 'カメラ感度',
    autoTurn: 'ターン自動終了', hexEdges: 'ヘックス線', gameplay: 'ゲームプレイ', display: '表示と性能', audio: 'オーディオ',
    techTree: '技術ツリー', units: 'ユニット', factions: '文明', search: '検索', attackTest: '攻撃アニメーション'
  }
};

const MODES = {
  legacy: { scenario: 'legacy', group: 'historical', startEra: 0, mutation: 1, opponents: 5, player: 'rome' },
  threeKingdoms: { scenario: 'threeKingdoms', group: 'threeKingdoms', startEra: 0, mutation: 1, opponents: 3, player: 'wei' },
  chrono: { scenario: 'chrono', group: 'historical', startEra: 5, mutation: 3, opponents: 3, player: 'wei' }
};

const MAPS = {
  continents: '大陸與群島',
  pangaea: '盤古大陸',
  archipelago: '群島世界',
  highlands: '高原山脈'
};

const MUSIC_LABELS = {
  auto: '隨時代自動演進', classical: '古典交響', medieval: '中世紀民謠', chinese: '東方國樂',
  pop: '西方流行', japanese: '和風雅樂', scifi: '2100 科幻電子'
};

const ERA_NAMES = ['上古時代', '探索時代', '近代', '工業時代', '資訊時代', '核融合時代', '軌道時代', '奇點時代'];

const DIFFICULTY_LABELS = { easy: '開拓者', standard: '領主', hard: '君主', immortal: '不朽' };

const LABELS = {
  zh: {
    maps: { continents: '大陸與群島', pangaea: '盤古大陸', archipelago: '群島世界', highlands: '高原山脈' },
    difficulty: DIFFICULTY_LABELS,
    eras: ERA_NAMES,
    music: MUSIC_LABELS
  },
  en: {
    maps: { continents: 'Continents & Isles', pangaea: 'Pangaea', archipelago: 'Archipelago', highlands: 'Highlands' },
    difficulty: { easy: 'Settler', standard: 'Lord', hard: 'Monarch', immortal: 'Immortal' },
    eras: ['Antiquity', 'Exploration', 'Early Modern', 'Industrial', 'Information', 'Fusion', 'Orbital', 'Singularity'],
    music: { auto: 'Evolve by Era', classical: 'Classical', medieval: 'Medieval Folk', chinese: 'Chinese Court', pop: 'Western Pop', japanese: 'Japanese Court', scifi: '2100 Sci-Fi' }
  },
  ja: {
    maps: { continents: '大陸と島嶼', pangaea: 'パンゲア', archipelago: '群島世界', highlands: '高原山脈' },
    difficulty: { easy: '開拓者', standard: '領主', hard: '君主', immortal: '不朽' },
    eras: ['古代', '探検', '近世', '産業', '情報', '核融合', '軌道', 'シンギュラリティ'],
    music: { auto: '時代で自動進化', classical: 'クラシック', medieval: '中世民謡', chinese: '中国宮廷', pop: '洋楽ポップ', japanese: '和風雅楽', scifi: '2100 SF電子' }
  }
};

const GM_LABELS = {
  zh: {
    faction: '文明', previewAsset: '預覽資產', cityModel: '城市建築', unitModel: '單位模型', unit: '單位',
    primary: '主色', secondary: '輔色', modelScale: '模型縮放', animSpeed: '動畫速度',
    roofStyle: '屋頂 / 建築風格', weapon: '武器', mount: '坐騎', blueprint: '資產藍圖',
    leader: '領袖', uniqueUnit: '專屬單位', uniqueTech: '專屬科技', architecture: '建築語彙',
    civBonus: '文明加成', combatCost: '戰鬥與成本', name: '名稱', liveSummary: '即時摘要',
    class: '分類', strength: '戰力', cost: '成本',
    combatFormula: '戰鬥公式', economyGrowth: '經濟與成長', tech: '科技', damageSim: '傷害模擬器',
    attacker: '攻擊方', defender: '防守方', expectedDamage: '預期傷害',
    average: '平均', attack: '攻擊', defense: '防禦',
    formulaHint: '調整上方係數後按「套用」，模擬器會立即重算。戰鬥、城市防禦、經濟與科技成本全部共用這份公式。',
    terrainMatrix: '地形產出與防禦矩陣', terrain: '地形', move: '移動', defenseStat: '防禦', sight: '視野', passable: '可通行',
    applyTerrain: '套用地形矩陣', terrainHint: '套用後會重建地形網格與城市位置。',
    instant: '立即指令', addResources: '＋1000 資源', unlockAllTechs: '解鎖全部科技', revealAll: '揭示全地圖',
    instantHint: '指令直接作用於目前遊戲狀態，不會改寫預設值。',
    spawnUnit: '生成單位', spawn: '生成', reshapeTerrain: '改造地形', reshape: '重塑地格',
    io: '設定 IO', ioHint: '完整匯出 window.GameMasterConfig：文明、公式、地形、單位、選項與資產。匯入後立即套用。',
    footer: '所有變更即時套用至 3D 世界與回合結算', applyWorld: '套用至世界',
    formula: {
      attackMultiplier: '攻擊倍率', defenseMultiplier: '防禦倍率', baseDamage: '基礎傷害', randomMin: '隨機下限', randomMax: '隨機上限',
      minDamage: '最小傷害', maxDamage: '最大傷害', cityAttackMultiplier: '攻城倍率', cityDefenseMultiplier: '城防倍率',
      cityBaseDamage: '城市基礎傷害', cityMinDamage: '城市最小傷害', cityMaxDamage: '城市最大傷害', retaliationMultiplier: '反擊倍率',
      highlandBonus: '高地加成', riverPenalty: '渡河懲罰', flankBonus: '側翼加成', fortifiedBonus: '堅守加成',
      antiCavalryBonus: '反騎兵加成', terrainDefense: '地形防禦', foodMultiplier: '食物倍率', productionMultiplier: '生產倍率',
      goldMultiplier: '金幣倍率', scienceMultiplier: '科學倍率', cultureMultiplier: '文化倍率', growthBase: '基礎成長',
      growthPerPop: '每人口成長', riverFood: '河流食物', capitalFood: '首都食物', capitalProduction: '首都生產',
      capitalGold: '首都金幣', aiYieldMultiplier: 'AI 產出倍率', scienceFlatPerPop: '每人口科學', costMultiplier: '科技成本倍率',
      eraGrowth: '時代成長', boost: '靈感加成'
    },
    bonus: {
      food: '食物', production: '生產', gold: '金幣', science: '科學', culture: '文化', faith: '信仰', combat: '戰鬥', ranged: '遠程',
      cavalry: '騎兵', navy: '海軍', cityAttack: '攻城', cityDefense: '城防', supply: '補給', move: '移動'
    },
    unitStat: { str: '戰力', rangedStr: '遠程戰力', moves: '移動', range: '射程', sight: '視野', cost: '成本', hp: '生命', name: '名稱' },
    unitClass: { civilian: '平民', recon: '偵察', melee: '近戰', ranged: '遠程', cavalry: '騎兵', siege: '攻城', navy: '海軍', air: '空中', guardian: '守護' },
    terrainName: { ocean: '海洋', coast: '近岸', grassland: '草原', plains: '平原', desert: '沙漠', tundra: '凍原', snow: '雪原', hills: '丘陵', mountain: '山脈', lake: '湖泊', lava: '熔岩', crystal: '晶體' },
    assetRoof: { terrace: '梯田式', pagoda: '寶塔', curved: '曲線屋頂', flat: '平頂', pediment: '山牆', dome: '圓頂', gable: '雙坡', spire: '尖塔', longhouse: '長屋', tent: '帳篷', step: '階梯', thatch: '茅草', crystal: '晶體', membrane: '生物膜', antenna: '天線', halo: '光環' },
    assetWeapon: { sword: '劍', katana: '武士刀', axe: '斧', spear: '長矛', halberd: '戟', bow: '弓', crossbow: '弩', rifle: '步槍', cannon: '火砲', sling: '投石索', scimitar: '彎刀', macuahuitl: '黑曜石劍', staff: '法杖', beam: '光束', psiblade: '靈刃', claw: '利爪', railgun: '磁軌砲' },
    assetMount: { none: '無', horse: '馬', camel: '駱駝', llama: '羊駝', elephant: '戰象', chariot: '戰車' },
    architecture: { roman: '羅馬', chinese: '華夏', japanese: '和風', egyptian: '埃及', greek: '希臘', persian: '波斯', british: '不列顛', frankish: '法蘭克', german: '日耳曼', norse: '北歐', arabic: '阿拉伯', ottoman: '鄂圖曼', indian: '印度', steppe: '草原', aztec: '阿茲特克', inca: '印加', alienCrystal: '外星晶體', hive: '蟲巢', machine: '機械', psionic: '靈能' },
    msg: {
      unitUpdated: '單位已更新', unitUpdatedBody: '{name} 的{stat}已套用。', attackTitle: '攻擊測試', attackBody: '單位進入 Attack 狀態並播放揮擊動畫。',
      resourcesTitle: '資源注入', resourcesBody: '國庫、信仰、影響力與戰略資源已增加。', techsTitle: '科技全開', techsBody: '所有可用科技已解鎖。',
      revealTitle: '全圖揭示', revealBody: '戰爭迷霧已移除。', spawnTitle: '單位生成', spawnBody: '{unit} 已部署。',
      spawnFailTitle: '生成失敗', spawnFailBody: '該地格無效。', terrainTitle: '地形重塑', terrainBody: '{terrain} 已套用至 ({q}, {r})。',
      terrainFailTitle: '無效地格', terrainFailBody: '請確認座標。', applyTerrainTitle: '地形矩陣', applyTerrainBody: '產出、移動與防禦已重新套用。',
      applyAllTitle: '設定已套用', applyAllBody: 'GameMasterConfig 已同步至世界。', saveTitle: '設定已儲存', saveBody: '已寫入 localStorage。',
      resetConfirm: '重設所有 GameMasterConfig 設定？', exportTitle: '設定已匯出', exportBody: 'GameMasterConfig JSON 已下載。',
      importTitle: '設定已匯入', importBody: '世界已套用新的設定檔。', importFailTitle: '匯入失敗'
    }
  },
  en: {
    faction: 'Civilization', previewAsset: 'Preview Asset', cityModel: 'City Architecture', unitModel: 'Unit Model', unit: 'Unit',
    primary: 'Primary', secondary: 'Accent', modelScale: 'Model Scale', animSpeed: 'Animation Speed',
    roofStyle: 'Roof / Architecture Style', weapon: 'Weapon', mount: 'Mount', blueprint: 'Asset Blueprint',
    leader: 'Leader', uniqueUnit: 'Unique Unit', uniqueTech: 'Unique Tech', architecture: 'Architecture',
    civBonus: 'Civilization Bonuses', combatCost: 'Combat & Cost', name: 'Name', liveSummary: 'Live Summary',
    class: 'Class', strength: 'Strength', cost: 'Cost',
    combatFormula: 'Combat Formula', economyGrowth: 'Economy & Growth', tech: 'Technology', damageSim: 'Damage Simulator',
    attacker: 'Attacker', defender: 'Defender', expectedDamage: 'Expected Damage',
    average: 'Average', attack: 'Attack', defense: 'Defense',
    formulaHint: 'Adjust the coefficients above and press Apply. The simulator recalculates instantly. Combat, city defense, economy, and technology costs all share this formula engine.',
    terrainMatrix: 'Terrain Yield & Defense Matrix', terrain: 'Terrain', move: 'Move', defenseStat: 'Defense', sight: 'Sight', passable: 'Passable',
    applyTerrain: 'Apply Terrain Matrix', terrainHint: 'Applying rebuilds the terrain grid and city placement.',
    instant: 'Instant Commands', addResources: '+1000 Resources', unlockAllTechs: 'Unlock All Techs', revealAll: 'Reveal Entire Map',
    instantHint: 'Commands act on the current game state and do not rewrite defaults.',
    spawnUnit: 'Spawn Unit', spawn: 'Spawn', reshapeTerrain: 'Reshape Terrain', reshape: 'Reshape Tile',
    io: 'Settings I/O', ioHint: 'Export the complete window.GameMasterConfig: factions, formulas, terrain, units, options, and assets. Imports apply immediately.',
    footer: 'All changes apply live to the 3D world and turn resolution', applyWorld: 'Apply to World',
    formula: {
      attackMultiplier: 'Attack Multiplier', defenseMultiplier: 'Defense Multiplier', baseDamage: 'Base Damage', randomMin: 'Random Min', randomMax: 'Random Max',
      minDamage: 'Minimum Damage', maxDamage: 'Maximum Damage', cityAttackMultiplier: 'City Attack Multiplier', cityDefenseMultiplier: 'City Defense Multiplier',
      cityBaseDamage: 'City Base Damage', cityMinDamage: 'City Minimum Damage', cityMaxDamage: 'City Maximum Damage', retaliationMultiplier: 'Retaliation Multiplier',
      highlandBonus: 'Highland Bonus', riverPenalty: 'River Crossing Penalty', flankBonus: 'Flanking Bonus', fortifiedBonus: 'Fortified Bonus',
      antiCavalryBonus: 'Anti-Cavalry Bonus', terrainDefense: 'Terrain Defense', foodMultiplier: 'Food Multiplier', productionMultiplier: 'Production Multiplier',
      goldMultiplier: 'Gold Multiplier', scienceMultiplier: 'Science Multiplier', cultureMultiplier: 'Culture Multiplier', growthBase: 'Base Growth',
      growthPerPop: 'Growth per Population', riverFood: 'River Food', capitalFood: 'Capital Food', capitalProduction: 'Capital Production',
      capitalGold: 'Capital Gold', aiYieldMultiplier: 'AI Yield Multiplier', scienceFlatPerPop: 'Science per Population', costMultiplier: 'Tech Cost Multiplier',
      eraGrowth: 'Era Cost Growth', boost: 'Eureka Boost'
    },
    bonus: {
      food: 'Food', production: 'Production', gold: 'Gold', science: 'Science', culture: 'Culture', faith: 'Faith', combat: 'Combat', ranged: 'Ranged',
      cavalry: 'Cavalry', navy: 'Navy', cityAttack: 'City Attack', cityDefense: 'City Defense', supply: 'Supply', move: 'Move'
    },
    unitStat: { str: 'Strength', rangedStr: 'Ranged Strength', moves: 'Moves', range: 'Range', sight: 'Sight', cost: 'Cost', hp: 'HP', name: 'Name' },
    unitClass: { civilian: 'Civilian', recon: 'Recon', melee: 'Melee', ranged: 'Ranged', cavalry: 'Cavalry', siege: 'Siege', navy: 'Navy', air: 'Air', guardian: 'Guardian' },
    terrainName: { ocean: 'Ocean', coast: 'Coast', grassland: 'Grassland', plains: 'Plains', desert: 'Desert', tundra: 'Tundra', snow: 'Snow', hills: 'Hills', mountain: 'Mountain', lake: 'Lake', lava: 'Lava', crystal: 'Crystal' },
    assetRoof: { terrace: 'Terraced', pagoda: 'Pagoda', curved: 'Curved Eaves', flat: 'Flat', pediment: 'Pediment', dome: 'Dome', gable: 'Gable', spire: 'Spire', longhouse: 'Longhouse', tent: 'Tent', step: 'Stepped', thatch: 'Thatched', crystal: 'Crystal', membrane: 'Membrane', antenna: 'Antenna', halo: 'Halo' },
    assetWeapon: { sword: 'Sword', katana: 'Katana', axe: 'Axe', spear: 'Spear', halberd: 'Halberd', bow: 'Bow', crossbow: 'Crossbow', rifle: 'Rifle', cannon: 'Cannon', sling: 'Sling', scimitar: 'Scimitar', macuahuitl: 'Macuahuitl', staff: 'Staff', beam: 'Beam', psiblade: 'Psionic Blade', claw: 'Claw', railgun: 'Railgun' },
    assetMount: { none: 'None', horse: 'Horse', camel: 'Camel', llama: 'Llama', elephant: 'War Elephant', chariot: 'Chariot' },
    architecture: { roman: 'Roman', chinese: 'Chinese', japanese: 'Japanese', egyptian: 'Egyptian', greek: 'Greek', persian: 'Persian', british: 'British', frankish: 'Frankish', german: 'German', norse: 'Norse', arabic: 'Arabic', ottoman: 'Ottoman', indian: 'Indian', steppe: 'Steppe', aztec: 'Aztec', inca: 'Inca', alienCrystal: 'Alien Crystal', hive: 'Hive', machine: 'Machine', psionic: 'Psionic' },
    msg: {
      unitUpdated: 'Unit Updated', unitUpdatedBody: '{name} {stat} applied.', attackTitle: 'Attack Test', attackBody: 'The unit enters its Attack state and plays a strike animation.',
      resourcesTitle: 'Resource Injection', resourcesBody: 'Treasury, faith, influence, and strategic resources increased.', techsTitle: 'All Techs Unlocked', techsBody: 'All available technologies are unlocked.',
      revealTitle: 'Map Revealed', revealBody: 'Fog of war removed.', spawnTitle: 'Unit Spawned', spawnBody: '{unit} deployed.',
      spawnFailTitle: 'Spawn Failed', spawnFailBody: 'Invalid tile.', terrainTitle: 'Terrain Reshaped', terrainBody: '{terrain} applied at ({q}, {r}).',
      terrainFailTitle: 'Invalid Tile', terrainFailBody: 'Check the coordinates.', applyTerrainTitle: 'Terrain Matrix', applyTerrainBody: 'Yields, movement, and defense reapplied.',
      applyAllTitle: 'Settings Applied', applyAllBody: 'GameMasterConfig synchronized with the world.', saveTitle: 'Settings Saved', saveBody: 'Written to localStorage.',
      resetConfirm: 'Reset all GameMasterConfig settings?', exportTitle: 'Settings Exported', exportBody: 'GameMasterConfig JSON downloaded.',
      importTitle: 'Settings Imported', importBody: 'The new configuration has been applied.', importFailTitle: 'Import Failed'
    }
  },
  ja: {
    faction: '文明', previewAsset: 'アセットプレビュー', cityModel: '都市建築', unitModel: 'ユニットモデル', unit: 'ユニット',
    primary: 'メインカラー', secondary: 'アクセント', modelScale: 'モデル倍率', animSpeed: 'アニメ速度',
    roofStyle: '屋根 / 建築様式', weapon: '武器', mount: '騎乗', blueprint: 'アセット設計',
    leader: '指導者', uniqueUnit: '固有ユニット', uniqueTech: '固有技術', architecture: '建築語彙',
    civBonus: '文明ボーナス', combatCost: '戦闘とコスト', name: '名称', liveSummary: 'リアルタイム概要',
    class: '分類', strength: '戦力', cost: 'コスト',
    combatFormula: '戦闘計算式', economyGrowth: '経済と成長', tech: '技術', damageSim: 'ダメージシミュレーター',
    attacker: '攻撃側', defender: '防御側', expectedDamage: '予想ダメージ',
    average: '平均', attack: '攻撃', defense: '防御',
    formulaHint: '上の係数を調整して「適用」を押すと、シミュレーターが即時再計算します。戦闘、都市防御、経済、技術コストはすべてこの計算式を共有します。',
    terrainMatrix: '地形産出と防御マトリクス', terrain: '地形', move: '移動', defenseStat: '防御', sight: '視界', passable: '通行可',
    applyTerrain: '地形マトリクスを適用', terrainHint: '適用すると地形グリッドと都市配置を再構築します。',
    instant: '即時コマンド', addResources: '＋1000 資源', unlockAllTechs: '全技術を解放', revealAll: '全マップを開示',
    instantHint: 'コマンドは現在のゲーム状態に作用し、既定値は変更しません。',
    spawnUnit: 'ユニット生成', spawn: '生成', reshapeTerrain: '地形改造', reshape: 'タイル改造',
    io: '設定 IO', ioHint: 'window.GameMasterConfig 全体を書き出します：文明、計算式、地形、ユニット、オプション、アセット。読み込み後すぐに適用されます。',
    footer: '変更は 3D 世界とターン処理に即時反映されます', applyWorld: '世界に適用',
    formula: {
      attackMultiplier: '攻撃倍率', defenseMultiplier: '防御倍率', baseDamage: '基本ダメージ', randomMin: '乱数下限', randomMax: '乱数上限',
      minDamage: '最小ダメージ', maxDamage: '最大ダメージ', cityAttackMultiplier: '攻城倍率', cityDefenseMultiplier: '都市防御倍率',
      cityBaseDamage: '都市基本ダメージ', cityMinDamage: '都市最小ダメージ', cityMaxDamage: '都市最大ダメージ', retaliationMultiplier: '反撃倍率',
      highlandBonus: '高地ボーナス', riverPenalty: '渡河ペナルティ', flankBonus: '側面攻撃ボーナス', fortifiedBonus: '防御固守ボーナス',
      antiCavalryBonus: '対騎兵ボーナス', terrainDefense: '地形防御', foodMultiplier: '食料倍率', productionMultiplier: '生産倍率',
      goldMultiplier: '金倍率', scienceMultiplier: '科学倍率', cultureMultiplier: '文化倍率', growthBase: '基本成長',
      growthPerPop: '人口あたり成長', riverFood: '河川食料', capitalFood: '首都食料', capitalProduction: '首都生産',
      capitalGold: '首都金', aiYieldMultiplier: 'AI 産出倍率', scienceFlatPerPop: '人口あたり科学', costMultiplier: '技術コスト倍率',
      eraGrowth: '時代コスト成長', boost: 'ひらめきボーナス'
    },
    bonus: {
      food: '食料', production: '生産', gold: '金', science: '科学', culture: '文化', faith: '信仰', combat: '戦闘', ranged: '遠距離',
      cavalry: '騎兵', navy: '海軍', cityAttack: '攻城', cityDefense: '都市防御', supply: '補給', move: '移動'
    },
    unitStat: { str: '戦力', rangedStr: '遠距離戦力', moves: '移動力', range: '射程', sight: '視界', cost: 'コスト', hp: 'HP', name: '名称' },
    unitClass: { civilian: '民間', recon: '偵察', melee: '近接', ranged: '遠距離', cavalry: '騎兵', siege: '攻城', navy: '海軍', air: '航空', guardian: '守護' },
    terrainName: { ocean: '海洋', coast: '近岸', grassland: '草原', plains: '平原', desert: '砂漠', tundra: 'ツンドラ', snow: '雪原', hills: '丘陵', mountain: '山脈', lake: '湖', lava: '溶岩', crystal: '結晶' },
    assetRoof: { terrace: 'テラス', pagoda: '塔', curved: '曲線屋根', flat: '平屋根', pediment: '破風', dome: 'ドーム', gable: '切妻', spire: '尖塔', longhouse: 'ロングハウス', tent: 'テント', step: '階段', thatch: '茅葺き', crystal: '結晶', membrane: '生体膜', antenna: 'アンテナ', halo: '光輪' },
    assetWeapon: { sword: '剣', katana: '刀', axe: '斧', spear: '槍', halberd: '戟', bow: '弓', crossbow: '弩', rifle: '小銃', cannon: '大砲', sling: '投石', scimitar: '彎刀', macuahuitl: '黒曜石剣', staff: '杖', beam: 'ビーム', psiblade: '霊刃', claw: '爪', railgun: 'レールガン' },
    assetMount: { none: 'なし', horse: '馬', camel: 'ラクダ', llama: 'リャマ', elephant: '戦象', chariot: '戦車' },
    architecture: { roman: 'ローマ', chinese: '中華', japanese: '和風', egyptian: 'エジプト', greek: 'ギリシャ', persian: 'ペルシャ', british: 'ブリテン', frankish: 'フランク', german: 'ゲルマン', norse: '北欧', arabic: 'アラビア', ottoman: 'オスマン', indian: 'インド', steppe: '草原', aztec: 'アステカ', inca: 'インカ', alienCrystal: '宇宙結晶', hive: '虫巣', machine: '機械', psionic: '霊能' },
    msg: {
      unitUpdated: 'ユニット更新', unitUpdatedBody: '{name} の{stat}を適用しました。', attackTitle: '攻撃テスト', attackBody: 'ユニットが Attack 状態に入り、攻撃アニメーションを再生します。',
      resourcesTitle: '資源注入', resourcesBody: '国庫、信仰、影響力、戦略資源が増加しました。', techsTitle: '全技術解放', techsBody: '利用可能な全技術を解放しました。',
      revealTitle: '全マップ開示', revealBody: '戦争の霧を解除しました。', spawnTitle: 'ユニット生成', spawnBody: '{unit} を配置しました。',
      spawnFailTitle: '生成失敗', spawnFailBody: '無効なタイルです。', terrainTitle: '地形改造', terrainBody: '{terrain} を ({q}, {r}) に適用しました。',
      terrainFailTitle: '無効なタイル', terrainFailBody: '座標を確認してください。', applyTerrainTitle: '地形マトリクス', applyTerrainBody: '産出、移動、防御を再適用しました。',
      applyAllTitle: '設定適用', applyAllBody: 'GameMasterConfig を世界に同期しました。', saveTitle: '設定保存', saveBody: 'localStorage に書き込みました。',
      resetConfirm: 'GameMasterConfig の全設定をリセットしますか？', exportTitle: '設定書き出し', exportBody: 'GameMasterConfig JSON をダウンロードしました。',
      importTitle: '設定読み込み', importBody: '新しい設定を世界に適用しました。', importFailTitle: '読み込み失敗'
    }
  }
};

const CROWN_SHAPES = {
  laurel: '<path d="M30 27C18 20 16 9 26 12M70 27c12-7 14-18 4-15" fill="none" stroke="var(--leaf)" stroke-width="4" stroke-linecap="round"/><path d="M34 24c8-8 24-8 32 0" fill="none" stroke="var(--leaf)" stroke-width="3"/>',
  crown: '<path d="M25 30l4-17 10 9 11-13 11 13 10-9 4 17z" fill="var(--gold)" stroke="var(--dark)" stroke-width="2"/>',
  phoenix: '<path d="M30 28c4-18 18-25 20-10 2-15 16-8 20 10" fill="none" stroke="var(--gold)" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="23" r="4" fill="var(--accent)"/>',
  samurai: '<path d="M24 30l14-17 12 8 12-8 14 17-8 2-6-8-12 5-12-5-6 8z" fill="var(--dark)" stroke="var(--gold)" stroke-width="2"/>',
  nemes: '<path d="M27 34l5-22h36l5 22-10-3-8-8H45l-8 8z" fill="var(--gold)" stroke="var(--dark)" stroke-width="2"/>',
  helmet: '<path d="M28 31c0-15 10-22 22-22s22 7 22 22l-8 8-6-11-8 14-8-14-6 11z" fill="var(--metal)" stroke="var(--dark)" stroke-width="2"/>',
  tiara: '<path d="M26 31l6-15 9 8 9-13 9 13 9-8 6 15z" fill="var(--gold)" stroke="var(--dark)" stroke-width="2"/>',
  pickelhaube: '<path d="M27 32c0-16 10-23 23-23s23 7 23 23l-7 4H34z" fill="var(--dark)" stroke="var(--gold)" stroke-width="2"/><path d="M50 9v-5" stroke="var(--gold)" stroke-width="4"/>',
  horned: '<path d="M28 30c-9-12-14-8-8 5l8 4M72 30c9-12 14-8 8 5l-8 4" fill="none" stroke="var(--bone)" stroke-width="6" stroke-linecap="round"/><path d="M32 30c3-14 33-14 36 0l-6 5H38z" fill="var(--metal)"/>',
  turban: '<path d="M26 30c2-15 14-21 24-21s22 6 24 21c-10-6-38-6-48 0z" fill="var(--cloth)" stroke="var(--gold)" stroke-width="2"/><circle cx="50" cy="18" r="3" fill="var(--gold)"/>',
  mukuta: '<path d="M31 30l4-18 8 9 7-13 7 13 8-9 4 18z" fill="var(--gold)" stroke="var(--dark)" stroke-width="2"/>',
  fur: '<path d="M25 29c4-14 12-20 25-20s21 6 25 20l-9 5H34z" fill="var(--cloth)" stroke="var(--gold)" stroke-width="2"/>',
  feather: '<path d="M28 28c4-19 15-22 22-24 1 13-5 22-17 26M68 28c-4-19-15-22-22-24-1 13 5 22 17 26" fill="none" stroke="var(--gold)" stroke-width="5" stroke-linecap="round"/>',
  inca: '<path d="M27 31l7-20 16 8 16-8 7 20z" fill="var(--gold)" stroke="var(--dark)" stroke-width="2"/><path d="M50 12v22" stroke="var(--accent)" stroke-width="2"/>',
  wei: '<path d="M28 30l7-19 15 10 15-10 7 19z" fill="var(--gold)" stroke="var(--dark)" stroke-width="2"/>',
  shu: '<path d="M29 31c4-17 13-22 21-22s17 5 21 22z" fill="var(--cloth)" stroke="var(--gold)" stroke-width="2"/>',
  wu: '<path d="M27 31l8-18 15 8 15-8 8 18z" fill="var(--gold)" stroke="var(--dark)" stroke-width="2"/>',
  warlord: '<path d="M28 30c3-16 12-22 22-22s19 6 22 22l-8 3-5-10-9 12-9-12-5 10z" fill="var(--dark)" stroke="var(--gold)" stroke-width="2"/>',
  alien: '<path d="M28 29c5-17 16-23 22-23s17 6 22 23l-8 4-7-11-7 14-7-14-7 11z" fill="var(--cloth)" stroke="var(--gold)" stroke-width="2"/><circle cx="50" cy="23" r="4" fill="var(--gold)"/>'
};

function portrait(faction, cls = '') {
  const p = faction?.portrait ?? {};
  const crown = CROWN_SHAPES[p.crown] ?? CROWN_SHAPES.crown;
  const skin = p.skin ?? '#c99069';
  const hair = p.hair ?? '#2a1d16';
  const eyes = p.eyes ?? '#20140e';
  const beard = p.beard ? '<path d="M39 57c2 12 20 15 22 0-7 5-15 5-22 0z" fill="' + hair + '" opacity=".9"/>' : '';
  return `<svg class="fg-portrait ${cls}" viewBox="0 0 100 100" style="--gold:${faction.colorHex};--accent:${faction.accent};--cloth:${faction.colorHex};--leaf:#8fbf6a;--metal:#b8c3c9;--bone:#e8ddc4;--dark:#1a1512" role="img" aria-label="${esc(faction.name)}">
    <circle cx="50" cy="50" r="47" fill="rgba(4,8,12,.8)" stroke="${faction.colorHex}" stroke-width="2"/>
    <path d="M15 98c3-23 17-33 35-33s32 10 35 33z" fill="${faction.colorHex}" opacity=".72"/>
    <path d="M38 67h24v11c0 10-24 10-24 0z" fill="${skin}"/>
    <circle cx="50" cy="49" r="24" fill="${skin}"/>
    <path d="M27 45c1-18 11-26 23-26s22 8 23 26c-8-9-14-13-23-13s-15 4-23 13z" fill="${hair}"/>
    ${beard}
    <path d="M39 48c3-3 7-3 9 0M52 48c3-3 7-3 9 0" fill="none" stroke="${eyes}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M46 60c3 2 5 2 8 0" fill="none" stroke="${eyes}" stroke-width="1.8" stroke-linecap="round"/>
    ${crown}
    <path d="M31 84l19 10 19-10" fill="none" stroke="${faction.colorHex}" stroke-width="2" opacity=".8"/>
  </svg>`;
}

function crest(faction) {
  const glyph = faction?.glyph ?? 'sun';
  const map = {
    sun: '<circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    eagle: '<path d="M12 3l4 5 5-2-3 5 3 2-6 1-3 7-3-7-6-1 3-2-3-5 5 2z" fill="none" stroke="currentColor" stroke-width="1.4"/>',
    dragon: '<path d="M5 17c4-1 5-3 7-6s5-5 8-3c-3 0-4 2-4 4 2-1 4 0 4 2s-3 4-6 3-5 1-5 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    ankh: '<path d="M12 21V9M8 13h8M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    column: '<path d="M6 21h12M8 18h8M8 6h8M7 4h10M9 6v12M15 6v12" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    wing: '<path d="M4 18c5 0 7-4 8-9 2 4 3 8 8 9-4-1-6-3-8-6-2 3-4 5-8 6z" fill="currentColor"/>',
    sword: '<path d="M12 3v13M8 13l4 5 4-5M7 21h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    crown: '<path d="M4 18l2-9 4 4 2-7 2 7 4-4 2 9z" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    raven: '<path d="M5 18c4-5 6-11 13-13 1 4-1 8-5 9 3 1 4 2 5 4-5 1-9 0-13 0z" fill="currentColor"/>',
    star: '<path d="M12 3l2.7 6 6.3.5-4.8 4.2 1.5 6.1-5.7-3.3-5.7 3.3 1.5-6.1L3 13.5l6.3-.5z" fill="none" stroke="currentColor" stroke-width="1.4"/>',
    crescent: '<path d="M16 4a9 9 0 1 0 4 16A8 8 0 0 1 16 4z" fill="currentColor"/>',
    wheel: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7" stroke="currentColor" stroke-width="1"/>',
    horse: '<path d="M5 19c2-5 7-9 13-9 0 4-2 6-5 8M15 8l3-4 2 2-2 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    mountain: '<path d="M3 20l6-11 4 6 3-4 5 9z" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    gear: '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" stroke="currentColor" stroke-width="1.4"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
    spear: '<path d="M12 3v18M9 9l3-6 3 6M8 21h8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    insect: '<circle cx="12" cy="13" r="4" fill="currentColor"/><path d="M8 10L4 7M8 13H3M8 16l-4 3M16 10l4-3M16 13h5M16 16l4 3M9 9l1-4M15 9l-1-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
    crystal: '<path d="M12 2l5 8-5 12-5-12z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 10h10" stroke="currentColor" stroke-width="1.2"/>'
  };
  return `<svg viewBox="0 0 24 24" class="fg-crest" style="color:${faction.colorHex}">${map[glyph] ?? map.sun}</svg>`;
}

class Preview {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);
    this.camera.position.set(2.1, 1.7, 2.7);
    this.camera.lookAt(0, 0.45, 0);
    this.scene.add(new THREE.HemisphereLight(0xe6f3ff, 0x3a2b1c, 1.5));
    const sun = new THREE.DirectionalLight(0xffe6b8, 2.2);
    sun.position.set(3, 5, 2);
    this.scene.add(sun);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x162430, roughness: 0.9, metalness: 0.15 }));
    ground.position.y = -0.03;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.model = null;
    this.alive = true;
    this.resize();
    const loop = () => {
      if (!this.alive) return;
      requestAnimationFrame(loop);
      if (!canvas.isConnected || canvas.offsetParent === null) return;
      this.group.rotation.y += 0.006;
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(240, rect.width || 360);
    const height = Math.max(220, rect.height || 320);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
  show(faction, kind = 'city', unitType = 'warrior') {
    this.group.clear();
    const mockWorld = { seed: 7, civs: new Map([[faction.id, faction]]) };
    if (kind === 'unit') {
      const def = UNIT_TYPES[unitType] ?? UNIT_TYPES.warrior;
      const unit = { civId: faction.id, civ: faction, type: unitType, cls: def.cls, mount: def.mount ?? faction.mount, weapon: def.weapon ?? faction.weapon, facing: 0.6, phase: 0 };
      this.model = createUnitMesh(unit, mockWorld);
      this.model.position.y = 0.05;
      this.model.rotation.y = -0.4;
      this.group.add(this.model);
    } else {
      const city = { civId: faction.id, civ: faction, q: 0, r: 1, population: 4, producing: null };
      this.model = createCityMesh(city, mockWorld);
      this.group.add(this.model);
    }
    this.resize();
  }
  attack() {
    this.model?.userData?.playAttack?.();
  }
  dispose() {
    this.alive = false;
    this.renderer.dispose();
  }
}

function previewCanvas() {
  return '<canvas class="fg-3d-preview" width="420" height="330"></canvas>';
}

function drawMapPreview(canvas, draft) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.round(rect.width || 420));
  const height = Math.max(180, Math.round(rect.height || 240));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#0b2536');
  grad.addColorStop(1, '#06131d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  const seed = Number(draft.seed) || 1;
  let state = seed >>> 0;
  const rnd = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const size = 7;
  const hexH = size * 1.62;
  const sea = (draft.sea ?? 40) / 100;
  const mountains = (draft.mountain ?? 50) / 100;
  for (let row = -2; row < height / hexH + 4; row++) {
    for (let col = -2; col < width / (size * 1.8) + 4; col++) {
      const x = col * size * 1.8 + (row % 2 ? size * 0.9 : 0);
      const y = row * hexH;
      const noise = rnd() * 0.65 + Math.sin((col + seed % 11) * 0.5) * 0.1 + Math.cos((row + seed % 7) * 0.42) * 0.1;
      let color = noise < sea ? (noise < sea * 0.55 ? '#123d50' : '#1b6173') : noise > 0.72 - mountains * 0.22 ? '#7c7d76' : noise > 0.58 ? '#5f8347' : '#9a874e';
      if (rnd() < 0.06 && noise > sea) color = '#6a5aa5';
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 3 * i + Math.PI / 6;
        const px = x + Math.cos(a) * size;
        const py = y + Math.sin(a) * size;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(227,189,116,.12)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
  }
  ctx.fillStyle = 'rgba(4,8,12,.45)';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(227,189,116,.3)';
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
}

export class Frontend {
  constructor(opts) {
    this.game = opts.game;
    this.world = opts.world;
    this.ui = opts.ui;
    this.audio = opts.audio;
    this.renderer = opts.renderer;
    this.camera = opts.camera;
    this.controls = opts.controls;
    this.sun = opts.sun;
    this.onLaunch = opts.onLaunch;
    this.inGame = !!opts.inGame;
    this.config = GameMasterConfig;
    this.state = this.inGame ? 'IN_GAME' : 'MAIN_MENU';
    this.setupStep = 1;
    this.overlay = null;
    this.preview = null;
    this.gmPreview = null;
    this.gmTab = 'visual';
    this.draft = this.defaultDraft();
    this.root = document.createElement('div');
    this.root.id = 'frontend';
    document.getElementById('app').appendChild(this.root);
    this.lang = this.config.data.options.language ?? 'zh';
    this.game.on('notify', (notice) => {
      if (this.inGame && notice?.title) this.flash(notice.title, notice.body, notice.kind);
    });
    this.applyOptions();
    this.render();
  }

  t(key) {
    return LANG[this.lang]?.[key] ?? LANG.zh[key] ?? key;
  }

  gm(key) {
    const lookup = (lang) => key.split('.').reduce((value, part) => value?.[part], GM_LABELS[lang]);
    return lookup(this.lang) ?? lookup('zh') ?? key;
  }

  gmFormat(key, vars = {}) {
    return this.gm(key).replace(/\{(\w+)\}/g, (match, name) => vars[name] ?? '');
  }

  gmValue(group, id) {
    const get = (lang) => GM_LABELS[lang]?.[group]?.[id];
    return get(this.lang) ?? get('zh') ?? id;
  }

  mapLabel(id) {
    return LABELS[this.lang]?.maps[id] ?? MAPS[id] ?? id;
  }

  difficultyLabel(id) {
    return LABELS[this.lang]?.difficulty[id] ?? DIFFICULTY_LABELS[id] ?? id;
  }

  eraLabel(index) {
    return LABELS[this.lang]?.eras?.[index] ?? ERA_NAMES[index] ?? index;
  }

  musicLabel(id) {
    return LABELS[this.lang]?.music[id] ?? MUSIC_LABELS[id] ?? id;
  }

  defaultDraft() {
    const last = this.loadLast();
    const faction = this.config.faction('rome') ? 'rome' : this.config.data.factionOrder[0];
    return {
      mode: 'legacy',
      mapType: 'continents',
      seed: last?.seed ?? Math.floor(Math.random() * 900000 + 100000),
      mutation: 1,
      sea: 40,
      mountain: 50,
      playerFaction: last?.playerFaction ?? faction,
      opponentsCount: 3,
      opponents: [],
      difficulty: this.config.data.options.difficulty ?? 'standard',
      startEra: 0,
      musicStyle: this.config.data.options.musicStyle ?? 'auto',
      aliens: []
    };
  }

  loadLast() {
    try { return JSON.parse(localStorage.getItem('civ7.lastLaunch') ?? 'null'); } catch (err) { return null; }
  }

  start() {
    this.draft = this.defaultDraft();
    this.setupStep = 1;
    this.state = 'SETUP';
    this.render();
    this.audio.ui?.();
  }

  render() {
    document.body.classList.toggle('frontend-menu', !this.inGame);
    document.body.classList.toggle('frontend-ingame', this.inGame);
    if (this.state === 'MAIN_MENU') this.renderMenu();
    else if (this.state === 'SETUP') this.renderSetup();
    else this.renderInGame();
  }

  renderMenu() {
    const last = this.loadLast();
    const options = this.config.data.options;
    this.root.innerHTML = `<div class="fg-menu">
      <div class="fg-menu-glow"></div>
      <header class="fg-menu-head">
        <div class="fg-menu-brand">
          <span class="fg-menu-mark">VII</span>
          <div><h1>${this.t('gameTitle')}</h1><p>${esc(this.t('tagline'))}</p></div>
        </div>
        <div class="fg-lang-switch">
          <button data-lang="zh" class="${this.lang === 'zh' ? 'on' : ''}">繁中</button>
          <button data-lang="en" class="${this.lang === 'en' ? 'on' : ''}">EN</button>
          <button data-lang="ja" class="${this.lang === 'ja' ? 'on' : ''}">日本語</button>
        </div>
      </header>
      <div class="fg-menu-body">
        <div class="fg-menu-copy">
          <div class="fg-eyebrow">SID MEIER'S CIVILIZATION VII · DATA DRIVEN</div>
          <h2>${this.t('taglineHtml')}</h2>
          <p>${this.t('menuLead')}</p>
          <div class="fg-menu-badges"><span>${esc(this.t('badgeHistory'))}</span><span>${esc(this.t('badgeTech'))}</span><span>${esc(this.t('badgeGm'))}</span><span>${esc(this.t('badgeLang'))}</span></div>
        </div>
        <nav class="fg-main-nav">
          <button class="fg-nav-primary" data-menu="new"><span class="nm">${esc(this.t('newGame'))}</span><small>NEW CAMPAIGN · 4-STEP SETUP</small></button>
          <button data-menu="continue" ${last ? '' : 'disabled'}><span class="nm">${esc(this.t('continueGame'))}</span><small>${last ? `${esc(last.playerFaction ?? '')} · ${esc(MODES[last.mode]?.scenario ?? last.mode ?? 'legacy')}` : esc(this.t('noSave'))}</small></button>
          <button data-menu="options"><span class="nm">${esc(this.t('options'))}</span><small>OPTIONS · I18N · AUDIO</small></button>
          <button data-menu="encyclopedia"><span class="nm">${esc(this.t('encyclopedia'))}</span><small>FACTIONS · TECHS · UNITS</small></button>
          <button data-menu="gm" class="fg-nav-gm"><span class="nm"><span class="fg-tool-mark">GM</span> ${esc(this.t('gm'))}</span><small>F12 / G · LIVE GAME MASTER</small></button>
        </nav>
      </div>
      <footer class="fg-menu-foot"><span>GAME MASTER CONFIG v${this.config.data.version}.0</span><span>${esc(options.language.toUpperCase())} · ${esc(this.difficultyLabel(options.difficulty))}</span><span>F12 / G · GM STUDIO</span></footer>
    </div>`;
    this.bindMenu();
  }

  bindMenu() {
    this.root.querySelectorAll('[data-menu]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.menu;
        this.audio.ui?.();
        if (action === 'new') this.start();
        else if (action === 'continue') this.continueGame();
        else if (action === 'options') this.openOptions();
        else if (action === 'encyclopedia') this.openEncyclopedia();
        else if (action === 'gm') this.openGM();
      });
    });
    this.root.querySelectorAll('[data-lang]').forEach((button) => {
      button.addEventListener('click', () => {
        this.lang = button.dataset.lang;
        this.config.option('language', this.lang);
        this.applyLanguage();
        this.renderMenu();
      });
    });
  }

  continueGame() {
    const last = this.loadLast();
    if (!last) return;
    this.audio.ui?.();
    this.onLaunch(last);
  }

  renderSetup() {
    const step = this.setupStep;
    const draft = this.draft;
    const progress = [1, 2, 3, 4].map((n) => `<span class="${n <= step ? 'on' : ''}">${n}</span>`).join('<i></i>');
    this.root.innerHTML = `<div class="fg-setup">
      <header class="fg-setup-head">
        <button class="fg-back-menu" data-setup-action="menu">← ${esc(this.t('backToMenu'))}</button>
        <div class="fg-setup-title"><span>${esc(this.t('setup'))}</span><b>${esc(this.t('step'))} ${step} / 4</b></div>
        <div class="fg-progress">${progress}</div>
      </header>
      <div class="fg-setup-body">${this.setupStepBody(step)}</div>
      <footer class="fg-setup-foot">
        <button class="fg-btn ghost" data-setup-action="back" ${step === 1 ? 'disabled' : ''}>← ${esc(this.t('back'))}</button>
        <div class="fg-foot-note">${esc(MODES[draft.mode].scenario)} · ${esc(this.mapLabel(draft.mapType))}</div>
        ${step < 4 ? `<button class="fg-btn" data-setup-action="next">${esc(this.t('next'))} →</button>` : `<button class="fg-btn primary" data-setup-action="launch">${esc(this.t('start'))} →</button>`}
      </footer>
    </div>`;
    this.bindSetup();
    if (step === 2) drawMapPreview(this.root.querySelector('#fg-map-preview'), draft);
    if (step === 3) {
      const faction = this.selectedFaction();
      const canvas = this.root.querySelector('#fg-faction-preview');
      if (canvas && faction) {
        this.preview?.dispose();
        this.preview = new Preview(canvas);
        this.preview.show(faction, 'city');
        this.root.querySelector('#fg-faction-preview').addEventListener('click', () => {
          if (this.previewKind === 'unit') this.preview.show(faction, 'city');
          else this.preview.show(faction, 'unit', faction.unique?.unit?.id ?? 'warrior');
          this.previewKind = this.previewKind === 'unit' ? 'city' : 'unit';
        });
        this.previewKind = 'city';
      }
    }
  }

  setupStepBody(step) {
    if (step === 1) return this.stepMode();
    if (step === 2) return this.stepMap();
    if (step === 3) return this.stepFaction();
    return this.stepRivals();
  }

  stepMode() {
    const cards = [
      { id: 'legacy', title: this.t('standard'), sub: '16 HISTORICAL CIVILIZATIONS', icon: 'i-wonder', desc: this.t('modeLegacyDesc') },
      { id: 'threeKingdoms', title: this.t('threeKingdoms'), sub: 'WEI · SHU · WU · WARLORDS', icon: 'i-strength', desc: this.t('mode3kDesc') },
      { id: 'chrono', title: this.t('chrono'), sub: 'THREE KINGDOMS × SCI-FI', icon: 'i-research', desc: this.t('modeChronoDesc') }
    ];
    return `<section class="fg-step">
      <div class="fg-step-head"><span>01</span><div><h2>${esc(this.t('mode'))}</h2><p>${esc(this.t('chooseMode'))}</p></div></div>
      <div class="fg-mode-grid">${cards.map((card) => `<button class="fg-mode-card ${this.draft.mode === card.id ? 'on' : ''}" data-mode="${card.id}">
        <svg class="ic"><use href="#${card.icon}"/></svg><b>${esc(card.title)}</b><small>${card.sub}</small><p>${esc(card.desc)}</p>
      </button>`).join('')}</div>
    </section>`;
  }

  stepMap() {
    const draft = this.draft;
    const mapCards = Object.keys(MAPS).map((id) => `<button class="fg-map-chip ${draft.mapType === id ? 'on' : ''}" data-map="${id}">${esc(this.mapLabel(id))}</button>`).join('');
    return `<section class="fg-step fg-map-step">
      <div class="fg-step-head"><span>02</span><div><h2>${esc(this.t('map'))}</h2><p>${esc(this.t('mapDesc'))}</p></div></div>
      <div class="fg-map-layout">
        <div class="fg-map-preview-wrap"><canvas id="fg-map-preview"></canvas><div class="fg-map-caption"><span>${esc(this.mapLabel(draft.mapType))}</span><b>SEED ${draft.seed}</b></div></div>
        <div class="fg-field-stack">
          <div class="fg-map-chips">${mapCards}</div>
          <label class="fg-field"><span>${esc(this.t('seed'))}</span><div class="fg-inline"><input type="number" data-setup-field="seed" value="${draft.seed}"><button data-setup-action="reroll">${esc(this.t('regenerate'))}</button></div></label>
          <label class="fg-field"><span>${esc(this.t('sea'))}<b data-value="sea">${draft.sea}%</b></span><input type="range" min="30" max="60" value="${draft.sea}" data-setup-field="sea"></label>
          <label class="fg-field"><span>${esc(this.t('mountain'))}<b data-value="mountain">${draft.mountain}%</b></span><input type="range" min="20" max="90" value="${draft.mountain}" data-setup-field="mountain"></label>
          <label class="fg-field"><span>${esc(this.t('mutation'))}<b data-value="mutation">${draft.mutation}</b></span><input type="range" min="0" max="3" step="1" value="${draft.mutation}" data-setup-field="mutation"></label>
          <div class="fg-hint">${esc(this.t('mapHint'))}</div>
        </div>
      </div>
    </section>`;
  }

  factionPool() {
    const mode = MODES[this.draft.mode];
    let pool = this.config.allFactions();
    if (mode.group === 'threeKingdoms') pool = pool.filter((f) => f.group === 'threeKingdoms');
    if (this.draft.mode === 'chrono') pool = pool.filter((f) => ['wei', 'shu', 'japan', 'china'].includes(f.id));
    if (this.draft.mode === 'legacy') pool = pool.filter((f) => f.group === 'historical' || f.group === 'alien');
    return pool;
  }

  selectedFaction() {
    return this.config.faction(this.draft.playerFaction) ?? this.factionPool()[0];
  }

  stepFaction() {
    const mode = MODES[this.draft.mode];
    const pool = this.factionPool();
    const selected = this.selectedFaction();
    const chrono = mode.scenario === 'chrono';
    const activeGroup = mode.group === 'threeKingdoms' ? 'threeKingdoms' : chrono ? 'historical' : this.factionTab ?? 'historical';
    const tabs = mode.group === 'threeKingdoms'
      ? [['threeKingdoms', this.t('threeKingdoms')]]
      : chrono ? [['historical', this.t('chronoPool')]] : [['historical', this.t('historical')], ['alien', this.t('aliens')]];
    const groups = this.factionPool().filter((f) => activeGroup === 'alien' ? f.group === 'alien' : f.group !== 'alien');
    const aliens = groups.filter((f) => f.group === 'alien');
    return `<section class="fg-step fg-faction-step">
      <div class="fg-step-head"><span>03</span><div><h2>${esc(this.t('faction'))}</h2><p>${esc(this.t(mode.group === 'threeKingdoms' ? 'factionDesc3k' : 'factionDescHist'))}</p></div></div>
      <div class="fg-faction-tabs">${tabs.map(([id, label]) => `<button data-faction-tab="${id}" class="${activeGroup === id ? 'on' : ''}">${esc(label)}</button>`).join('')}</div>
      <div class="fg-faction-layout">
        <div class="fg-faction-grid">${groups.map((faction) => `<button class="fg-faction-card ${selected?.id === faction.id ? 'on' : ''}" data-faction="${faction.id}" style="--c:${faction.colorHex}">
          ${portrait(faction)}<div><b>${esc(faction.name)}</b><span>${esc(faction.leader)}</span><small>${esc(faction.traitName)}</small></div>
        </button>`).join('')}${activeGroup === 'alien' ? `<button class="fg-faction-card fg-generate-alien" data-setup-action="generate-alien"><span class="plus">＋</span><b>${esc(this.t('generateAlien'))}</b><span>${esc(this.t('alienKindsHint'))}</span></button>` : ''}</div>
        <aside class="fg-faction-detail">
          <div class="fg-faction-portrait-box"><canvas id="fg-faction-preview"></canvas><div class="fg-preview-tag">${esc(this.t('previewHint'))}</div></div>
          <div class="fg-detail-head">${portrait(selected)}<div><h3>${esc(selected?.name ?? '')}</h3><p>${esc(selected?.leader ?? '')} · ${esc(selected?.title ?? '')}</p></div></div>
          <p class="fg-trait"><b>${esc(selected?.traitName ?? '')}</b>${esc(selected?.trait ?? '')}</p>
          <div class="fg-meta-row"><span>${esc(selected?.architecture ?? '')}</span><span>${esc(selected?.weapon ?? '')}</span><span>${esc(selected?.mount ?? 'none')}</span></div>
          <div class="fg-unique"><span>${esc(this.t('uniqueUnit'))}</span><b>${esc(selected?.unique?.unit?.name ?? '—')}</b></div>
          <div class="fg-unique"><span>${esc(this.t('uniqueTech'))}</span><b>${esc(selected?.unique?.tech?.name ?? '—')}</b></div>
        </aside>
      </div>
      <div class="fg-alien-bar">${activeGroup === 'alien' ? esc(this.t('alienReady').replace('{n}', String(aliens.length))) : esc(this.t(mode.group === 'threeKingdoms' ? 'factionCount3k' : 'factionCount').replace('{n}', String(pool.length)))}</div>
    </section>`;
  }

  stepRivals() {
    const draft = this.draft;
    const pool = this.factionPool().filter((f) => f.id !== draft.playerFaction);
    const selected = new Set(draft.opponents);
    const cards = pool.map((faction) => `<button class="fg-rival ${selected.has(faction.id) ? 'on' : ''}" data-rival="${faction.id}" style="--c:${faction.colorHex}">
      ${portrait(faction)}<b>${esc(faction.name)}</b><small>${esc(faction.leader)}</small>
    </button>`).join('');
    return `<section class="fg-step">
      <div class="fg-step-head"><span>04</span><div><h2>${esc(this.t('rivals'))}</h2><p>${esc(this.t('rivalsDesc'))}</p></div></div>
      <div class="fg-rules-grid">
        <div class="fg-rule-panel">
          <label class="fg-field"><span>${esc(this.t('opponents'))}<b>${draft.opponentsCount}</b></span><input type="range" min="1" max="${Math.min(7, Math.max(1, pool.length))}" value="${draft.opponentsCount}" data-setup-field="opponentsCount"></label>
          <div class="fg-rival-grid">${cards}</div>
        </div>
        <div class="fg-rule-panel">
          <label class="fg-field"><span>${esc(this.t('difficulty'))}</span><select data-setup-field="difficulty">${Object.keys(DIFFICULTY_LABELS).map((id) => `<option value="${id}" ${draft.difficulty === id ? 'selected' : ''}>${esc(this.difficultyLabel(id))}</option>`).join('')}</select></label>
          <label class="fg-field"><span>${esc(this.t('startEra'))}</span><select data-setup-field="startEra">${ERA_NAMES.map((era, i) => `<option value="${i}" ${Number(draft.startEra) === i ? 'selected' : ''}>${esc(this.eraLabel(i))}</option>`).join('')}</select></label>
          <label class="fg-field"><span>${esc(this.t('music'))}</span><select data-setup-field="musicStyle">${Object.keys(MUSIC_LABELS).map((id) => `<option value="${id}" ${draft.musicStyle === id ? 'selected' : ''}>${esc(this.musicLabel(id))}</option>`).join('')}</select></label>
          <div class="fg-summary"><span>${esc(this.t('faction'))}</span><b>${esc(this.selectedFaction()?.name ?? '')}</b><span>${esc(this.t('opponents'))}</span><b>${draft.opponentsCount}</b><span>${esc(this.t('map'))}</span><b>${esc(this.mapLabel(draft.mapType))}</b></div>
        </div>
      </div>
    </section>`;
  }

  bindSetup() {
    this.root.querySelectorAll('[data-setup-action]').forEach((button) => button.addEventListener('click', () => {
      const action = button.dataset.setupAction;
      this.audio.ui?.();
      if (action === 'menu') { this.state = 'MAIN_MENU'; this.render(); return; }
      if (action === 'back') { this.setupStep = Math.max(1, this.setupStep - 1); this.render(); return; }
      if (action === 'next') {
        if (this.setupStep === 3 && !this.draft.opponents.length) this.fillOpponents();
        this.setupStep = Math.min(4, this.setupStep + 1);
        this.render();
        return;
      }
      if (action === 'reroll') {
        this.draft.seed = Math.floor(Math.random() * 900000 + 100000);
        this.render();
        return;
      }
      if (action === 'generate-alien') {
        const kinds = Object.keys(ALIEN_KINDS);
        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        const alien = this.config.createAlien({ physiology: kind, corruption: 20 + Math.random() * 70 });
        this.draft.aliens.push(alien);
        this.draft.playerFaction = alien.id;
        this.config.bindRuntime(this.config.runtime);
        this.render();
        return;
      }
      if (action === 'launch') this.launch();
    }));
    this.root.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
      this.draft.mode = button.dataset.mode;
      const mode = MODES[this.draft.mode];
      this.draft.startEra = mode.startEra;
      this.draft.mutation = mode.mutation;
      this.draft.opponentsCount = mode.opponents;
      this.factionTab = mode.group === 'threeKingdoms' ? 'threeKingdoms' : 'historical';
      const pool = this.factionPool();
      this.draft.playerFaction = pool.some((f) => f.id === mode.player) ? mode.player : pool[0]?.id ?? this.draft.playerFaction;
      this.draft.opponents = [];
      this.fillOpponents();
      this.render();
    }));
    this.root.querySelectorAll('[data-map]').forEach((button) => button.addEventListener('click', () => {
      this.draft.mapType = button.dataset.map;
      this.render();
    }));
    this.root.querySelectorAll('[data-faction-tab]').forEach((button) => button.addEventListener('click', () => {
      this.factionTab = button.dataset.factionTab;
      this.render();
    }));
    this.root.querySelectorAll('[data-faction]').forEach((button) => button.addEventListener('click', () => {
      this.draft.playerFaction = button.dataset.faction;
      this.draft.opponents = [];
      this.fillOpponents();
      this.render();
    }));
    this.root.querySelectorAll('[data-rival]').forEach((button) => button.addEventListener('click', () => {
      const id = button.dataset.rival;
      const set = new Set(this.draft.opponents);
      if (set.has(id)) set.delete(id);
      else if (set.size < this.draft.opponentsCount) set.add(id);
      else { set.delete([...set][0]); set.add(id); }
      this.draft.opponents = [...set];
      this.render();
    }));
    this.root.querySelectorAll('[data-setup-field]').forEach((input) => {
      input.addEventListener('input', () => {
        const field = input.dataset.setupField;
        const numeric = ['seed', 'sea', 'mountain', 'mutation', 'opponentsCount', 'startEra'].includes(field);
        this.draft[field] = numeric ? Number(input.value) : input.value;
        if (field === 'seed' || field === 'sea' || field === 'mountain' || field === 'mutation') {
          const label = this.root.querySelector(`[data-value="${field}"]`);
          if (label) label.textContent = field === 'seed' ? input.value : input.value + (field === 'mutation' ? '' : '%');
          drawMapPreview(this.root.querySelector('#fg-map-preview'), this.draft);
        }
      });
      if (input.tagName === 'SELECT') input.addEventListener('change', () => {
        const field = input.dataset.setupField;
        this.draft[field] = field === 'startEra' ? Number(input.value) : input.value;
        if (field === 'opponentsCount') this.render();
      });
    });
  }

  fillOpponents() {
    const pool = this.factionPool().filter((f) => f.id !== this.draft.playerFaction).map((f) => f.id);
    this.draft.opponents = pool.slice(0, clamp(this.draft.opponentsCount, 1, pool.length));
    this.draft.opponentsCount = Math.max(1, this.draft.opponents.length);
  }

  launch() {
    if (!this.draft.opponents.length) this.fillOpponents();
    const payload = {
      mode: this.draft.mode,
      scenario: MODES[this.draft.mode].scenario,
      mapType: this.draft.mapType,
      seed: Number(this.draft.seed),
      mutation: Number(this.draft.mutation),
      sea: Number(this.draft.sea),
      mountain: Number(this.draft.mountain),
      playerFaction: this.draft.playerFaction,
      opponents: [...this.draft.opponents],
      difficulty: this.draft.difficulty,
      startEra: Number(this.draft.startEra),
      musicStyle: this.draft.musicStyle,
      language: this.lang,
      aliens: this.draft.aliens,
      createdAt: Date.now()
    };
    localStorage.setItem('civ7.lastLaunch', JSON.stringify(payload));
    this.onLaunch(payload);
  }

  renderInGame() {
    this.root.innerHTML = '';
  }

  applyOptions() {
    const options = this.config.data.options;
    this.lang = options.language ?? 'zh';
    this.applyLanguage();
    this.audio.setVolumes?.(options.volumes);
    this.audio.setStyle?.(options.musicStyle ?? 'auto');
    if (this.renderer) {
      const scale = clamp(Number(options.renderScale) || 1, 0.5, 2);
      this.renderer.setPixelRatio(clamp((window.devicePixelRatio || 1) * scale, 0.75, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    }
    if (this.controls) {
      const sens = clamp(Number(options.cameraSensitivity) || 1, 0.4, 2);
      this.controls.rotateSpeed = 0.6 * sens;
      this.controls.panSpeed = 0.85 * sens;
      this.controls.zoomSpeed = 0.9 * sens;
    }
    if (this.world) this.world.setHexEdges?.(options.hexEdges !== false);
    const root = document.documentElement;
    root.style.setProperty('--ui-scale', String(clamp(Number(options.uiScale) || 100, 80, 130) / 100));
    if (this.renderer && this.sun) {
      const quality = options.shadowQuality ?? 'medium';
      this.renderer.shadowMap.enabled = quality !== 'off';
      this.sun.castShadow = quality !== 'off';
      const size = quality === 'high' ? 2048 : quality === 'low' ? 512 : 1024;
      if (this.sun.shadow.mapSize.x !== size) {
        this.sun.shadow.mapSize.set(size, size);
        this.sun.shadow.map?.dispose();
        this.sun.shadow.map = null;
      }
    }
    document.documentElement.lang = this.lang === 'zh' ? 'zh-Hant-TW' : this.lang;
  }

  applyLanguage() {
    this.root.dataset.lang = this.lang;
  }

  overlayShell(title, subtitle, body, opts = {}) {
    this.closeOverlay(false);
    this.overlay = document.createElement('div');
    this.overlay.className = `fg-overlay ${opts.cls ?? ''}`;
    this.overlay.innerHTML = `<div class="fg-overlay-card">
      <header class="fg-overlay-head"><div><small>${esc(subtitle)}</small><h2>${esc(title)}</h2></div><button class="fg-close" data-overlay-close>×</button></header>
      <div class="fg-overlay-body">${body}</div>
    </div>`;
    this.root.appendChild(this.overlay);
    this.overlay.querySelector('[data-overlay-close]').addEventListener('click', () => this.closeOverlay());
    this.overlay.addEventListener('click', (event) => { if (event.target === this.overlay) this.closeOverlay(); });
    return this.overlay;
  }

  closeOverlay(render = true) {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.preview?.dispose();
    this.preview = null;
    this.gmPreview?.dispose();
    this.gmPreview = null;
    if (render && this.state === 'SETUP') this.render();
    if (render && this.state === 'MAIN_MENU') this.renderMenu();
  }

  optionsMarkup() {
    const o = this.config.data.options;
    const volume = (key, label) => `<label class="fg-field"><span>${label}<b data-value="vol-${key}">${Math.round(o.volumes[key] * 100)}%</b></span><input type="range" min="0" max="100" value="${Math.round(o.volumes[key] * 100)}" data-opt-volume="${key}"></label>`;
    return `<div class="fg-options-grid">
      <section class="fg-opt-section"><h3>${esc(this.t('gameplay'))}</h3>
        <label class="fg-field"><span>${esc(this.t('language'))}</span><select data-opt="language">${[['zh','繁體中文'],['en','English'],['ja','日本語']].map(([id,label]) => `<option value="${id}" ${o.language===id?'selected':''}>${label}</option>`).join('')}</select></label>
        <label class="fg-field"><span>${esc(this.t('difficulty'))}</span><select data-opt="difficulty">${Object.keys(DIFFICULTY_LABELS).map((id) => `<option value="${id}" ${o.difficulty===id?'selected':''}>${esc(this.difficultyLabel(id))}</option>`).join('')}</select></label>
        <label class="fg-toggle"><input type="checkbox" data-opt="autoEndTurn" ${o.autoEndTurn?'checked':''}><span>${esc(this.t('autoTurn'))}</span></label>
        <label class="fg-toggle"><input type="checkbox" data-opt="hexEdges" ${o.hexEdges!==false?'checked':''}><span>${esc(this.t('hexEdges'))}</span></label>
      </section>
      <section class="fg-opt-section"><h3>${esc(this.t('audio'))}</h3>
        ${volume('master', this.t('master'))}${volume('bgm', this.t('bgm'))}${volume('sfx', this.t('sfx'))}${volume('ui', this.t('uiVolume'))}
        <label class="fg-field"><span>${esc(this.t('music'))}</span><select data-opt="musicStyle">${Object.keys(MUSIC_LABELS).map((id) => `<option value="${id}" ${o.musicStyle===id?'selected':''}>${esc(this.musicLabel(id))}</option>`).join('')}</select></label>
      </section>
      <section class="fg-opt-section"><h3>${esc(this.t('display'))}</h3>
        <label class="fg-field"><span>${esc(this.t('renderScale'))}<b data-value="render">${Number(o.renderScale).toFixed(1)}×</b></span><input type="range" min="50" max="200" step="10" value="${Math.round(o.renderScale*100)}" data-opt="renderScale"></label>
        <label class="fg-field"><span>${esc(this.t('uiScale'))}<b data-value="ui">${o.uiScale}%</b></span><input type="range" min="80" max="130" step="5" value="${o.uiScale}" data-opt="uiScale"></label>
        <label class="fg-field"><span>${esc(this.t('shadows'))}</span><select data-opt="shadowQuality">${[['off','shadowOff'],['low','shadowLow'],['medium','shadowMedium'],['high','shadowHigh']].map(([id,key]) => `<option value="${id}" ${o.shadowQuality===id?'selected':''}>${esc(this.t(key))}</option>`).join('')}</select></label>
        <label class="fg-toggle"><input type="checkbox" data-opt="antialias" ${o.antialias?'checked':''}><span>${esc(this.t('antialias'))}${esc(this.t('reloadNote'))}</span></label>
        <label class="fg-toggle"><input type="checkbox" data-opt="fullscreen" ${o.fullscreen?'checked':''}><span>${esc(this.t('fullscreen'))}</span></label>
        <label class="fg-field"><span>${esc(this.t('camera'))}<b data-value="cam">${Number(o.cameraSensitivity).toFixed(1)}×</b></span><input type="range" min="40" max="200" step="10" value="${Math.round(o.cameraSensitivity*100)}" data-opt="cameraSensitivity"></label>
      </section>
    </div>`;
  }

  openOptions() {
    this.audio.ui?.();
    this.overlayShell(this.t('options'), this.t('savedLocally'), this.optionsMarkup(), { cls: 'fg-options' });
    this.bindOptions(this.overlay);
  }

  bindOptions(root) {
    root.querySelectorAll('[data-opt]').forEach((input) => {
      const key = input.dataset.opt;
      const eventName = input.type === 'range' ? 'input' : 'change';
      input.addEventListener(eventName, () => {
        let value = input.type === 'checkbox' ? input.checked : input.value;
        if (input.type === 'range') value = key === 'renderScale' ? Number(value) / 100 : key === 'cameraSensitivity' ? Number(value) / 100 : Number(value);
        this.config.option(key, value);
        if (key === 'fullscreen') {
          if (value && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
          if (!value && document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
        }
        if (key === 'antialias') {
          this.flash('需要重新載入', '反鋸齒設定將於下一次載入時生效。', 'warn');
          return;
        }
        this.applyOptions();
        this.audio.ui?.();
        if (key === 'language') this.openOptions();
      });
    });
    root.querySelectorAll('[data-opt-volume]').forEach((input) => {
      input.addEventListener('input', () => {
        const key = input.dataset.optVolume;
        this.config.data.options.volumes[key] = Number(input.value) / 100;
        this.config.save();
        const label = root.querySelector(`[data-value="vol-${key}"]`);
        if (label) label.textContent = input.value + '%';
        this.audio.setVolumes(this.config.data.options.volumes);
      });
    });
    this.bindRangeLabels(root);
  }

  bindRangeLabels(root) {
    root.querySelectorAll('input[type="range"]').forEach((input) => {
      input.addEventListener('input', () => {
        if (input.dataset.opt === 'renderScale') { const el = root.querySelector('[data-value="render"]'); if (el) el.textContent = (Number(input.value) / 100).toFixed(1) + '×'; }
        if (input.dataset.opt === 'uiScale') { const el = root.querySelector('[data-value="ui"]'); if (el) el.textContent = input.value + '%'; }
        if (input.dataset.opt === 'cameraSensitivity') { const el = root.querySelector('[data-value="cam"]'); if (el) el.textContent = (Number(input.value) / 100).toFixed(1) + '×'; }
      });
    });
  }

  openEncyclopedia(tab = 'factions') {
    this.audio.ui?.();
    this.encTab = tab;
    this.overlayShell(this.t('encyclopedia'), 'COMPENDIUM · DATA-DRIVEN', this.encyclopediaMarkup(tab), { cls: 'fg-encyclopedia' });
    this.bindEncyclopedia();
  }

  encyclopediaMarkup(tab) {
    const tabs = [['factions', this.t('factions')], ['techTree', this.t('techTree')], ['units', this.t('units')]];
    let body = '';
    if (tab === 'factions') {
      body = `<div class="fg-enc-factions">${this.config.allFactions().map((f) => `<article class="fg-enc-faction" style="--c:${f.colorHex}">${portrait(f)}<div><h3>${esc(f.name)}</h3><p>${esc(f.leader)} · ${esc(f.title)}</p><span>${esc(f.traitName)}</span><small>${esc(f.trait)}</small></div></article>`).join('')}</div>`;
    } else if (tab === 'techTree') {
      body = `<div class="fg-enc-techs">${ERA_NAMES.map((era, i) => {
        const list = TECHS.filter((t) => t.era === TECH_ERA_ORDER[i] && (!t.faction || t.faction === (this.game?.playerId ?? 'rome')));
        if (!list.length) return '';
        return `<section><h3>${esc(this.eraLabel(i))}<span>${list.length} TECH</span></h3><div>${list.map((t) => `<article><b>${esc(t.name)}</b><small>${esc(t.bonus)}</small></article>`).join('')}</div></section>`;
      }).join('')}</div>`;
    } else {
      const units = Object.entries(UNIT_TYPES);
      body = `<div class="fg-enc-units">${units.map(([id, u]) => `<article><div class="fg-enc-icon"><svg class="ic"><use href="#${u.icon ?? 'i-strength'}"/></svg></div><div><h3>${esc(u.name)}</h3><p>${esc(u.blurb)}</p><span>STR ${u.str ?? 0}${u.rangedStr ? ` · RANGE ${u.rangedStr}` : ''} · MOVE ${u.moves ?? 0} · COST ${u.cost ?? 0}</span></div></article>`).join('')}</div>`;
    }
    return `<div class="fg-enc-tabs">${tabs.map(([id, label]) => `<button data-enc-tab="${id}" class="${tab === id ? 'on' : ''}">${label}</button>`).join('')}</div>${body}`;
  }

  bindEncyclopedia() {
    this.overlay.querySelectorAll('[data-enc-tab]').forEach((button) => button.addEventListener('click', () => {
      this.openEncyclopedia(button.dataset.encTab);
    }));
  }

  openGM(tab = 'visual') {
    if (!this.game) return;
    this.audio.ui?.();
    this.gmTab = tab;
    this.closeOverlay(false);
    this.overlay = document.createElement('div');
    this.overlay.className = 'fg-overlay fg-gm';
    const tabs = ['visual', 'stats', 'formulas', 'terrain', 'god'];
    this.overlay.innerHTML = `<div class="fg-gm-card">
      <header class="fg-gm-head">
        <div class="fg-gm-title"><span class="fg-tool-mark">GM</span><div><small>LIVE GAME MASTER · window.GameMasterConfig</small><h2>${esc(this.t('gm'))}</h2></div></div>
        <div class="fg-gm-head-actions"><span class="fg-live"><i></i> LIVE</span><button class="fg-close" data-overlay-close>×</button></div>
      </header>
      <nav class="fg-gm-tabs">${tabs.map((id) => `<button data-gm-tab="${id}" class="${this.gmTab === id ? 'on' : ''}">${esc(this.t(id))}</button>`).join('')}</nav>
      <div class="fg-gm-body">${this.gmMarkup(tab)}</div>
      <footer class="fg-gm-foot"><span>${esc(this.gm('footer'))}</span><button data-gm-action="apply-all">${esc(this.t('apply'))}</button><button data-gm-action="save">${esc(this.t('save'))}</button><button data-gm-action="export">${esc(this.t('export'))}</button><button data-gm-action="import">${esc(this.t('import'))}</button><button class="danger" data-gm-action="reset">${esc(this.t('reset'))}</button></footer>
    </div>`;
    this.root.appendChild(this.overlay);
    this.overlay.querySelector('[data-overlay-close]').addEventListener('click', () => this.closeOverlay());
    this.bindGM();
    if (tab === 'visual') this.mountGMPreview();
  }

  gmFactionId() {
    return this.gmFaction ?? this.game?.playerId ?? 'rome';
  }

  gmMarkup(tab) {
    if (tab === 'visual') return this.gmVisualMarkup();
    if (tab === 'stats') return this.gmStatsMarkup();
    if (tab === 'formulas') return this.gmFormulaMarkup();
    if (tab === 'terrain') return this.gmTerrainMarkup();
    return this.gmGodMarkup();
  }

  gmVisualMarkup() {
    const factions = this.config.allFactions();
    const faction = this.config.faction(this.gmFactionId()) ?? factions[0];
    const asset = this.config.data.assets[faction.id] ?? {};
    const units = Object.entries(UNIT_TYPES);
    const roofOptions = ['terrace','pagoda','curved','flat','pediment','dome','gable','spire','longhouse','tent','step','thatch','crystal','membrane','antenna','halo']
      .map((v) => `<option value="${v}" ${asset.roof === v ? 'selected' : ''}>${esc(this.gmValue('assetRoof', v))}</option>`).join('');
    const weaponOptions = ['sword','katana','axe','spear','halberd','bow','crossbow','rifle','cannon','sling','scimitar','macuahuitl','staff','beam','psiblade','claw','railgun']
      .map((v) => `<option value="${v}" ${asset.weapon === v ? 'selected' : ''}>${esc(this.gmValue('assetWeapon', v))}</option>`).join('');
    const mountOptions = ['none','horse','camel','llama','elephant','chariot']
      .map((v) => `<option value="${v}" ${asset.mount === v ? 'selected' : ''}>${esc(this.gmValue('assetMount', v))}</option>`).join('');
    return `<div class="fg-gm-grid">
      <aside class="fg-gm-panel">
        <label class="fg-field"><span>${esc(this.gm('faction'))}</span><select data-gm-faction>${factions.map((f) => `<option value="${f.id}" ${f.id === faction.id ? 'selected' : ''}>${esc(f.name)} · ${esc(f.leader)}</option>`).join('')}</select></label>
        <label class="fg-field"><span>${esc(this.gm('previewAsset'))}</span><select data-gm-asset-kind><option value="city" ${this.gmAssetKind !== 'unit' ? 'selected' : ''}>${esc(this.gm('cityModel'))}</option><option value="unit" ${this.gmAssetKind === 'unit' ? 'selected' : ''}>${esc(this.gm('unitModel'))}</option></select></label>
        <label class="fg-field"><span>${esc(this.gm('unit'))}</span><select data-gm-unit>${units.map(([id, u]) => `<option value="${id}" ${id === (this.gmUnit ?? faction.unique?.unit?.id ?? 'warrior') ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></label>
        <div class="fg-color-row"><label>${esc(this.gm('primary'))}<input type="color" data-gm-color="colorHex" value="${faction.colorHex}"></label><label>${esc(this.gm('secondary'))}<input type="color" data-gm-color="accent" value="#${Number(faction.accent).toString(16).padStart(6, '0')}"></label></div>
        <label class="fg-field"><span>${esc(this.gm('modelScale'))}<b data-value="scale">${Number(asset.scale ?? 1).toFixed(2)}×</b></span><input type="range" min="50" max="180" step="5" value="${Math.round((asset.scale ?? 1) * 100)}" data-gm-asset="scale"></label>
        <label class="fg-field"><span>${esc(this.gm('animSpeed'))}<b data-value="speed">${Number(asset.speed ?? 1).toFixed(2)}×</b></span><input type="range" min="40" max="200" step="10" value="${Math.round((asset.speed ?? 1) * 100)}" data-gm-asset="speed"></label>
        <label class="fg-field"><span>${esc(this.gm('roofStyle'))}</span><select data-gm-asset="roof">${roofOptions}</select></label>
        <label class="fg-field"><span>${esc(this.gm('weapon'))}</span><select data-gm-asset="weapon">${weaponOptions}</select></label>
        <label class="fg-field"><span>${esc(this.gm('mount'))}</span><select data-gm-asset="mount">${mountOptions}</select></label>
        <button class="fg-btn" data-gm-action="attack">${esc(this.t('attackTest'))}</button>
      </aside>
      <div class="fg-gm-preview"><canvas id="fg-gm-preview"></canvas><div class="fg-portrait-card">${portrait(faction)}<div><b>${esc(faction.name)}</b><span>${esc(faction.leader)}</span><small>${esc(this.gmValue('architecture', faction.architecture))}</small></div></div></div>
      <aside class="fg-gm-panel fg-gm-summary"><h3>${esc(this.gm('blueprint'))}</h3><p>${esc(faction.trait)}</p><div class="fg-kv"><span>${esc(this.gm('leader'))}</span><b>${esc(faction.leader)}</b><span>${esc(this.gm('uniqueUnit'))}</span><b>${esc(faction.unique?.unit?.name ?? '—')}</b><span>${esc(this.gm('uniqueTech'))}</span><b>${esc(faction.unique?.tech?.name ?? '—')}</b><span>${esc(this.gm('architecture'))}</span><b>${esc(this.gmValue('architecture', faction.architecture))}</b></div><div class="fg-swatches"><i style="background:${faction.colorHex}"></i><i style="background:#${Number(faction.accent).toString(16).padStart(6,'0')}"></i><i style="background:${faction.roofColor ?? '#8a4a33'}"></i></div></aside>
    </div>`;
  }

  gmStatsMarkup() {
    const faction = this.config.faction(this.gmFactionId()) ?? this.config.allFactions()[0];
    const unitId = this.gmUnit ?? 'warrior';
    const unit = UNIT_TYPES[unitId] ?? UNIT_TYPES.warrior;
    const b = faction.bonuses ?? {};
    return `<div class="fg-gm-grid">
      <aside class="fg-gm-panel">
        <label class="fg-field"><span>${esc(this.gm('faction'))}</span><select data-gm-faction>${this.config.allFactions().map((f) => `<option value="${f.id}" ${f.id === faction.id ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}</select></label>
        <h3>${esc(this.gm('civBonus'))}</h3>
        ${['food','production','gold','science','culture','combat','ranged','cavalry','navy','cityAttack','cityDefense','supply','move'].map((key) => `<label class="fg-inline-field" title="${esc(this.gmValue('bonus', key))}"><span>${esc(this.gmValue('bonus', key))}</span><input type="number" step="0.01" data-gm-bonus="${key}" value="${Number(b[key] ?? 0)}"></label>`).join('')}
      </aside>
      <div class="fg-gm-panel">
        <label class="fg-field"><span>${esc(this.gm('unit'))}</span><select data-gm-unit>${Object.entries(UNIT_TYPES).map(([id, u]) => `<option value="${id}" ${id === unitId ? 'selected' : ''}>${esc(u.name)} · ${id}</option>`).join('')}</select></label>
        <h3>${esc(this.gm('combatCost'))}</h3>
        ${['str','rangedStr','moves','range','sight','cost','hp'].map((key) => `<label class="fg-inline-field" title="${esc(this.gmValue('unitStat', key))}"><span>${esc(this.gmValue('unitStat', key))}</span><input type="number" step="1" data-gm-unit-stat="${key}" value="${Number(unit[key] ?? 0)}"></label>`).join('')}
        <label class="fg-field"><span>${esc(this.gm('name'))}</span><input type="text" data-gm-unit-stat="name" value="${esc(unit.name)}"></label>
      </div>
      <aside class="fg-gm-panel fg-gm-summary"><h3>${esc(this.gm('liveSummary'))}</h3><div class="fg-kv"><span>${esc(this.gm('faction'))}</span><b>${esc(faction.name)}</b><span>${esc(this.gm('unit'))}</span><b>${esc(unit.name)}</b><span>${esc(this.gm('class'))}</span><b>${esc(this.gmValue('unitClass', unit.cls ?? ''))}</b><span>${esc(this.gm('strength'))}</span><b>${unit.str ?? 0}${unit.rangedStr ? ` / ${unit.rangedStr}` : ''}</b><span>${esc(this.gm('cost'))}</span><b>${unit.cost ?? 0}</b></div><button class="fg-btn primary" data-gm-action="apply-all">${esc(this.t('apply'))}</button></aside>
    </div>`;
  }

  gmFormulaMarkup() {
    const f = this.config.data.formulas;
    const units = Object.keys(UNIT_TYPES);
    const atk = this.gmSimAtk ?? 'warrior';
    const def = this.gmSimDef ?? 'archer';
    const result = this.game?.previewDamage?.(atk, def) ?? { min: 0, average: 0, max: 0 };
    const field = (group, key, value) => {
      const label = this.gmValue('formula', key);
      return `<label class="fg-inline-field" title="${esc(label)}"><span>${esc(label)}</span><input type="number" step="0.01" data-gm-formula="${group}.${key}" value="${Number(value)}"></label>`;
    };
    return `<div class="fg-gm-formula-grid">
      <section class="fg-gm-panel"><h3>${esc(this.gm('combatFormula'))}</h3>${Object.entries(f.combat).map(([k, v]) => field('combat', k, v)).join('')}</section>
      <section class="fg-gm-panel"><h3>${esc(this.gm('economyGrowth'))}</h3>${Object.entries(f.economy).map(([k, v]) => field('economy', k, v)).join('')}<h3>${esc(this.gm('tech'))}</h3>${Object.entries(f.tech).map(([k, v]) => field('tech', k, v)).join('')}</section>
      <section class="fg-gm-panel fg-simulator"><h3>${esc(this.gm('damageSim'))}</h3>
        <label class="fg-field"><span>${esc(this.gm('attacker'))}</span><select data-gm-sim="atk">${units.map((id) => `<option value="${id}" ${id === atk ? 'selected' : ''}>${esc(UNIT_TYPES[id].name)} · ${id}</option>`).join('')}</select></label>
        <label class="fg-field"><span>${esc(this.gm('defender'))}</span><select data-gm-sim="def">${units.map((id) => `<option value="${id}" ${id === def ? 'selected' : ''}>${esc(UNIT_TYPES[id].name)} · ${id}</option>`).join('')}</select></label>
        <div class="fg-sim-result"><small>${esc(this.gm('expectedDamage'))}</small><strong>${result.min}–${result.max}</strong><span>${esc(this.gm('average'))} ${result.average} · ${esc(this.gm('attack'))} ${result.attack} / ${esc(this.gm('defense'))} ${result.defense}</span></div>
        <p class="fg-hint">${esc(this.gm('formulaHint'))}</p>
      </section>
    </div>`;
  }

  gmTerrainMarkup() {
    const rows = Object.keys(this.config.data.terrain);
    const cols = ['food','production','gold','science','culture','faith'];
    return `<div class="fg-gm-panel fg-terrain-panel"><h3>${esc(this.gm('terrainMatrix'))}</h3>
      <div class="fg-table-wrap"><table class="fg-terrain-table"><thead><tr><th>${esc(this.gm('terrain'))}</th>${cols.map((c) => `<th>${esc(this.gmValue('bonus', c))}</th>`).join('')}<th>${esc(this.gm('move'))}</th><th>${esc(this.gm('defenseStat'))}</th><th>${esc(this.gm('sight'))}</th><th>${esc(this.gm('passable'))}</th></tr></thead><tbody>
      ${rows.map((id) => { const row = this.config.terrainRow(id); return `<tr><td>${esc(this.gmValue('terrainName', id))}</td>${cols.map((c) => `<td><input type="number" step="1" data-terrain="${id}" data-terrain-yield="${c}" value="${Number(row.yields?.[c] ?? 0)}"></td>`).join('')}<td><input type="number" step="0.5" data-terrain="${id}" data-terrain-stat="move" value="${Number(row.move ?? 1)}"></td><td><input type="number" step="0.01" data-terrain="${id}" data-terrain-stat="defense" value="${Number(row.defense ?? 0)}"></td><td><input type="number" step="1" data-terrain="${id}" data-terrain-stat="sight" value="${Number(row.sight ?? 0)}"></td><td><input type="checkbox" data-terrain="${id}" data-terrain-stat="passable" ${row.passable ? 'checked' : ''}></td></tr>`; }).join('')}
      </tbody></table></div><div class="fg-gm-actions"><button class="fg-btn primary" data-gm-action="apply-terrain">${esc(this.gm('applyTerrain'))}</button><span>${esc(this.gm('terrainHint'))}</span></div></div>`;
  }

  gmGodMarkup() {
    const units = Object.keys(UNIT_TYPES);
    const terrains = Object.keys(this.config.data.terrain);
    return `<div class="fg-gm-god-grid">
      <section class="fg-gm-panel"><h3>${esc(this.gm('instant'))}</h3><button class="fg-btn" data-gm-action="resources">${esc(this.gm('addResources'))}</button><button class="fg-btn" data-gm-action="techs">${esc(this.gm('unlockAllTechs'))}</button><button class="fg-btn" data-gm-action="reveal">${esc(this.gm('revealAll'))}</button><p class="fg-hint">${esc(this.gm('instantHint'))}</p></section>
      <section class="fg-gm-panel"><h3>${esc(this.gm('spawnUnit'))}</h3><label class="fg-field"><span>${esc(this.gm('unit'))}</span><select id="fg-god-unit">${units.map((id) => `<option value="${id}">${esc(UNIT_TYPES[id].name)} · ${id}</option>`).join('')}</select></label><div class="fg-inline"><label class="fg-field"><span>Q</span><input id="fg-god-q" type="number" value="0"></label><label class="fg-field"><span>R</span><input id="fg-god-r" type="number" value="0"></label></div><button class="fg-btn primary" data-gm-action="spawn">${esc(this.gm('spawn'))}</button></section>
      <section class="fg-gm-panel"><h3>${esc(this.gm('reshapeTerrain'))}</h3><div class="fg-inline"><label class="fg-field"><span>Q</span><input id="fg-god-tq" type="number" value="0"></label><label class="fg-field"><span>R</span><input id="fg-god-tr" type="number" value="0"></label></div><label class="fg-field"><span>${esc(this.gm('terrain'))}</span><select id="fg-god-terrain">${terrains.map((id) => `<option value="${id}">${esc(this.gmValue('terrainName', id))}</option>`).join('')}</select></label><button class="fg-btn primary" data-gm-action="terrain">${esc(this.gm('reshape'))}</button></section>
      <section class="fg-gm-panel"><h3>${esc(this.gm('io'))}</h3><p class="fg-hint">${esc(this.gm('ioHint'))}</p><div class="fg-gm-actions"><button class="fg-btn" data-gm-action="export">${esc(this.t('export'))} JSON</button><button class="fg-btn" data-gm-action="import">${esc(this.t('import'))} JSON</button><button class="fg-btn danger" data-gm-action="reset">${esc(this.t('reset'))}</button></div><input id="fg-import-file" type="file" accept="application/json" hidden></section>
    </div>`;
  }

  bindGM() {
    this.overlay.querySelectorAll('[data-gm-tab]').forEach((button) => button.addEventListener('click', () => {
      this.gmTab = button.dataset.gmTab;
      this.overlay.querySelectorAll('[data-gm-tab]').forEach((b) => b.classList.toggle('on', b === button));
      this.overlay.querySelector('.fg-gm-body').innerHTML = this.gmMarkup(this.gmTab);
      this.bindGM();
      if (this.gmTab === 'visual') this.mountGMPreview();
    }));
    this.overlay.querySelectorAll('[data-gm-faction]').forEach((select) => select.addEventListener('change', () => {
      this.gmFaction = select.value;
      this.refreshGM();
    }));
    this.overlay.querySelectorAll('[data-gm-unit]').forEach((select) => select.addEventListener('change', () => {
      this.gmUnit = select.value;
      this.refreshGM();
    }));
    this.overlay.querySelectorAll('[data-gm-asset-kind]').forEach((select) => select.addEventListener('change', () => {
      this.gmAssetKind = select.value;
      this.mountGMPreview();
    }));
    this.overlay.querySelectorAll('[data-gm-asset]').forEach((input) => input.addEventListener('input', () => {
      const id = this.gmFactionId();
      const asset = this.config.data.assets[id] = this.config.data.assets[id] ?? {};
      asset[input.dataset.gmAsset] = input.type === 'range' ? Number(input.value) / 100 : input.value;
      this.config.save();
      const label = this.overlay.querySelector(`[data-value="${input.dataset.gmAsset}"]`);
      if (label) label.textContent = (Number(input.value) / 100).toFixed(2) + '×';
      this.applyLiveAssets();
    }));
    this.overlay.querySelectorAll('[data-gm-color]').forEach((input) => input.addEventListener('input', () => {
      const faction = this.config.faction(this.gmFactionId());
      if (!faction) return;
      faction[input.dataset.gmColor] = input.value;
      if (input.dataset.gmColor === 'colorHex') faction.color = Number.parseInt(input.value.slice(1), 16);
      this.config.save();
      this.applyLiveAssets();
    }));
    this.overlay.querySelectorAll('[data-gm-bonus]').forEach((input) => input.addEventListener('change', () => {
      const faction = this.config.faction(this.gmFactionId());
      if (!faction) return;
      faction.bonuses[input.dataset.gmBonus] = Number(input.value);
      this.config.save();
      this.applyLiveAssets();
    }));
    this.overlay.querySelectorAll('[data-gm-unit-stat]').forEach((input) => input.addEventListener('change', () => {
      const id = this.gmUnit ?? 'warrior';
      const def = UNIT_TYPES[id];
      if (!def) return;
      const key = input.dataset.gmUnitStat;
      def[key] = key === 'name' ? input.value : Number(input.value);
      this.config.data.units[id] = { ...(this.config.data.units[id] ?? {}), [key]: def[key] };
      this.config.save();
      this.game.refreshFromConfig();
      this.flash(this.gm('msg.unitUpdated'), this.gmFormat('msg.unitUpdatedBody', { name: def.name, stat: this.gmValue('unitStat', key) }), 'good');
    }));
    this.overlay.querySelectorAll('[data-gm-formula]').forEach((input) => input.addEventListener('change', () => {
      const [group, key] = input.dataset.gmFormula.split('.');
      this.config.data.formulas[group][key] = Number(input.value);
      this.config.save();
      this.game.refreshFromConfig();
    }));
    this.overlay.querySelectorAll('[data-gm-sim]').forEach((select) => select.addEventListener('change', () => {
      if (select.dataset.gmSim === 'atk') this.gmSimAtk = select.value;
      else this.gmSimDef = select.value;
      const body = this.overlay.querySelector('.fg-gm-body');
      body.innerHTML = this.gmMarkup('formulas');
      this.bindGM();
    }));
    this.overlay.querySelectorAll('[data-gm-action]').forEach((button) => button.addEventListener('click', () => this.gmAction(button.dataset.gmAction)));
    this.overlay.querySelectorAll('[data-terrain]').forEach((input) => {
      const handler = () => {
        const id = input.dataset.terrain;
        const row = this.config.data.terrain[id];
        if (input.dataset.terrainYield) row.yields[input.dataset.terrainYield] = Number(input.value);
        else {
          const key = input.dataset.terrainStat;
          row[key] = key === 'passable' ? input.checked : Number(input.value);
        }
        this.config.save();
      };
      input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', handler);
    });
  }

  refreshGM() {
    const body = this.overlay.querySelector('.fg-gm-body');
    body.innerHTML = this.gmMarkup(this.gmTab);
    this.bindGM();
    if (this.gmTab === 'visual') this.mountGMPreview();
  }

  mountGMPreview() {
    const canvas = this.overlay?.querySelector('#fg-gm-preview');
    if (!canvas) return;
    const faction = this.config.faction(this.gmFactionId());
    if (!faction) return;
    this.gmPreview?.dispose();
    this.gmPreview = new Preview(canvas);
    const kind = this.gmAssetKind ?? 'city';
    this.gmPreview.show(faction, kind, this.gmUnit ?? faction.unique?.unit?.id ?? 'warrior');
  }

  applyLiveAssets() {
    this.config.bindRuntime(this.config.runtime);
    this.game.refreshFromConfig();
    this.world.refreshCivVisuals();
    const faction = this.config.faction(this.gmFactionId());
    if (faction && this.gmPreview) {
      const kind = this.gmAssetKind ?? 'city';
      this.gmPreview.show(faction, kind, this.gmUnit ?? faction.unique?.unit?.id ?? 'warrior');
    }
  }

  gmAction(action) {
    this.audio.ui?.();
    if (action === 'attack') { this.gmPreview?.attack(); this.flash(this.gm('msg.attackTitle'), this.gm('msg.attackBody'), 'info'); return; }
    if (action === 'resources') { this.game.godAddResources(1000); this.flash(this.gm('msg.resourcesTitle'), this.gm('msg.resourcesBody'), 'good'); return; }
    if (action === 'techs') { this.game.godUnlockTechs(); this.flash(this.gm('msg.techsTitle'), this.gm('msg.techsBody'), 'good'); return; }
    if (action === 'reveal') { this.game.godRevealAll(); this.flash(this.gm('msg.revealTitle'), this.gm('msg.revealBody'), 'good'); return; }
    if (action === 'spawn') {
      const type = this.overlay.querySelector('#fg-god-unit')?.value ?? 'warrior';
      const q = Number(this.overlay.querySelector('#fg-god-q')?.value ?? 0);
      const r = Number(this.overlay.querySelector('#fg-god-r')?.value ?? 0);
      if (this.game.godSpawnUnit(type, q, r)) this.flash(this.gm('msg.spawnTitle'), this.gmFormat('msg.spawnBody', { unit: UNIT_TYPES[type]?.name ?? type }), 'good');
      else this.flash(this.gm('msg.spawnFailTitle'), this.gm('msg.spawnFailBody'), 'warn');
      return;
    }
    if (action === 'terrain') {
      const q = Number(this.overlay.querySelector('#fg-god-tq')?.value ?? 0);
      const r = Number(this.overlay.querySelector('#fg-god-tr')?.value ?? 0);
      const terrain = this.overlay.querySelector('#fg-god-terrain')?.value;
      if (this.game.godSetTerrain(q, r, terrain)) this.flash(this.gm('msg.terrainTitle'), this.gmFormat('msg.terrainBody', { terrain: this.gmValue('terrainName', terrain), q, r }), 'good');
      else this.flash(this.gm('msg.terrainFailTitle'), this.gm('msg.terrainFailBody'), 'warn');
      return;
    }
    if (action === 'apply-terrain') { this.config.applyTerrain(); this.world.rebuildWorldVisuals(); this.game.recomputeVision(); this.flash(this.gm('msg.applyTerrainTitle'), this.gm('msg.applyTerrainBody'), 'good'); return; }
    if (action === 'apply-all') { this.config.applyTerrain(); this.config.applyUnits(); this.config.save(); this.game.refreshFromConfig(); this.world.refreshCivVisuals(); this.flash(this.gm('msg.applyAllTitle'), this.gm('msg.applyAllBody'), 'good'); return; }
    if (action === 'save') { this.config.save(); this.flash(this.gm('msg.saveTitle'), this.gm('msg.saveBody'), 'good'); return; }
    if (action === 'export') { this.exportConfig(); return; }
    if (action === 'import') { this.overlay.querySelector('#fg-import-file')?.click(); const input = this.overlay.querySelector('#fg-import-file'); if (input) input.onchange = () => this.importConfig(input.files?.[0]); return; }
    if (action === 'reset') {
      if (!confirm(this.gm('msg.resetConfirm'))) return;
      this.config.reset();
      window.location.reload();
    }
  }

  exportConfig() {
    const blob = new Blob([this.config.export()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamemaster-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.flash(this.gm('msg.exportTitle'), this.gm('msg.exportBody'), 'good');
  }

  importConfig(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        this.config.import(String(reader.result));
        this.config.bindRuntime(this.config.runtime);
        this.game.refreshFromConfig();
        this.world.refreshCivVisuals();
        this.applyOptions();
        this.refreshGM();
        this.flash(this.gm('msg.importTitle'), this.gm('msg.importBody'), 'good');
      } catch (err) {
        this.flash(this.gm('msg.importFailTitle'), err.message, 'warn');
      }
    };
    reader.readAsText(file);
  }

  handleEscape() {
    if (this.overlay) { this.closeOverlay(); return true; }
    if (this.inGame) { this.openOptions(); return true; }
    return false;
  }

  flash(title, body, kind = 'info') {
    if (this.inGame && this.ui?.toast) {
      this.ui.toast({ title, body, kind, icon: 'i-wonder' });
      return;
    }
    const toast = document.createElement('div');
    toast.className = `fg-toast ${kind}`;
    toast.innerHTML = `<b>${esc(title)}</b><span>${esc(body)}</span>`;
    this.root.appendChild(toast);
    setTimeout(() => toast.classList.add('out'), 3200);
    setTimeout(() => toast.remove(), 3800);
  }
}

