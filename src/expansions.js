/* Expansion data: future eras, armies, generals, scenarios, crises and battlefield schemes. */

export const TECH_ERA_ORDER = ['Antiquity', 'Exploration', 'Modern', 'Industrial', 'Information', 'Fusion', 'Orbital', 'Singularity'];
export const TECH_ERA_NAMES = {
  Antiquity: '上古時代', Exploration: '探索時代', Modern: '近代', Industrial: '工業時代',
  Information: '資訊時代', Fusion: '核融合時代', Orbital: '軌道時代', Singularity: '奇點時代',
};

const BRANCHES = { cyber: '賽博機械流', bio: '基因進化流', quantum: '量子能源流' };

const ERA_TECH_DATA = [
  {
    era: 'Industrial', cost: 430, icon: 'i-production',
    techs: [
      ['steamEngine', '蒸汽機', '每座城市 +2 生產。工業革命的序章。', { yields: { production: 2 } }],
      ['textileMills', '紡織廠', '每座城市 +2 金幣。', { yields: { gold: 2 } }],
      ['ironclads', '鐵甲艦', '解鎖鐵甲艦，可沿河與沿海作戰。', { unlockUnit: 'ironclad' }],
      ['railroads', '鐵路', '補給範圍 +6，單位移動力 +1。', { supply: 6, move: 1 }],
      ['telegraph', '電報', '每回合 +2 影響力。', { yields: { influence: 2 } }],
      ['steel', '鋼鐵', '解鎖火炮。', { unlockUnit: 'artillery' }],
      ['medicine', '現代醫學', '每座城市 +1 食物、+1 人口上限。', { yields: { food: 1 } }],
      ['sanitation', '公共衛生', '每座城市 +2 食物。', { yields: { food: 2 } }],
      ['photography', '攝影', '每回合 +2 文化。', { yields: { culture: 2 } }],
      ['rifling', '膛線', '解鎖線列步兵。', { unlockUnit: 'rifleman' }],
      ['fertilizer', '化學肥料', '每座城市 +2 食物。', { yields: { food: 2 } }],
      ['corporation', '股份公司', '每座城市 +2 金幣。', { yields: { gold: 2 } }],
      ['electricity', '電力', '解鎖發電廠。', { unlockBuilding: 'powerPlant' }],
      ['combustion', '內燃機', '解鎖坦克與煉油廠。', { unlockUnit: 'tank', unlockBuilding: 'refinery' }],
      ['flight', '航空', '解鎖雙翼機。', { unlockUnit: 'biplane' }],
      ['radio', '無線電', '每回合 +2 文化、+1 影響力。', { yields: { culture: 2, influence: 1 } }],
      ['assemblyLine', '裝配線', '每座城市 +3 生產。', { yields: { production: 3 } }],
      ['urbanization', '都市化', '每座城市 +1 人口。', { pop: 1 }],
      ['greatWar', '總體戰', '解鎖機關槍。', { unlockUnit: 'machineGun' }],
    ],
  },
  {
    era: 'Information', cost: 650, icon: 'i-research',
    techs: [
      ['computers', '電腦', '每回合 +3 科學。', { yields: { science: 3 } }],
      ['semiconductor', '半導體', '解鎖晶圓廠，可將銅與石英精煉為晶片。', { unlockBuilding: 'chipFab' }],
      ['internet', '網際網路', '每回合 +2 科學、+2 文化。', { yields: { science: 2, culture: 2 } }],
      ['satellites', '人造衛星', '解鎖太空港與軌道太陽能。', { unlockBuilding: 'spaceport' }],
      ['nuclearFission', '核分裂', '解鎖核電廠與潛艦。', { unlockUnit: 'submarine', unlockBuilding: 'nuclearPlant' }],
      ['robotics', '機器人學', '每座城市 +3 生產。', { yields: { production: 3 } }],
      ['genetics', '基因學', '每座城市 +2 食物。', { yields: { food: 2 } }],
      ['lasers', '雷射', '解鎖雷射步兵。', { unlockUnit: 'laserInfantry' }],
      ['stealth', '匿蹤科技', '解鎖匿蹤轟炸機。', { unlockUnit: 'stealthBomber' }],
      ['cybernetics', '控制論', '解鎖賽博機械流。無人機與自動化工廠。', { branch: 'cyber' }],
      ['syntheticBiology', '合成生物學', '解鎖基因進化流。生態改造與強化士兵。', { branch: 'bio' }],
      ['quantumTheory', '量子理論', '解鎖量子能源流。量子運算與能源武器。', { branch: 'quantum' }],
      ['globalization', '全球化', '每回合 +4 金幣。', { yields: { gold: 4 } }],
      ['massMedia', '大眾媒體', '每回合 +2 文化、+2 影響力。', { yields: { culture: 2, influence: 2 } }],
      ['precisionGuided', '精準導引', '解鎖精準轟炸行動。' ],
      ['antibiotics', '抗生素', '每座城市 +2 食物。', { yields: { food: 2 } }],
      ['mainframeAI', '大型主機 AI', '每回合 +4 科學。', { yields: { science: 4 } }],
      ['renewables', '再生能源', '每回合降低排放，+2 生產。', { clean: 3, yields: { production: 2 } }],
      ['spaceStation', '太空站', '解鎖軌道船塢，開啟軌道層。', { unlockBuilding: 'orbitalDock' }],
    ],
  },
  {
    era: 'Fusion', cost: 980, icon: 'i-science',
    techs: [
      ['fusionPower', '核融合發電', '解鎖核融合電廠。大幅降低排放。', { unlockBuilding: 'fusionPlant', clean: 6 }],
      ['superconductors', '超導體', '解鎖超導體精煉，+4 生產。', { yields: { production: 4 } }],
      ['railgun', '電磁炮', '解鎖電磁炮，遠程攻城利器。', { unlockUnit: 'railgun' }],
      ['exosuits', '動力外骨骼', '解鎖動力裝甲。', { unlockUnit: 'powerArmor' }],
      ['autonomousDrones', '自主無人機', '解鎖無人機蜂群。', { unlockUnit: 'drone' }],
      ['geneTherapy', '基因治療', '每座城市 +2 人口。', { pop: 2 }],
      ['neuralInterface', '神經介面', '賽博機械流專屬：+4 科學、+3 生產。', { branch: 'cyber', yields: { science: 4, production: 3 } }],
      ['verticalFarms', '垂直農場', '每座城市 +4 食物。', { yields: { food: 4 } }],
      ['desalination', '海水淡化', '每座城市 +3 食物。', { yields: { food: 3 } }],
      ['weatherControl', '氣象控制', '解鎖氣象武器與氣象塔。', { unlockBuilding: 'weatherTower' }],
      ['giantMecha', '巨型機甲', '解鎖巨型機甲。', { unlockUnit: 'mech' }],
      ['bioengineeredCrops', '生技作物', '基因進化流專屬：+5 食物。', { branch: 'bio', yields: { food: 5 } }],
      ['orbitalSolar', '軌道太陽能', '解鎖軌道太陽能衛星，+5 金幣。', { yields: { gold: 5 } }],
      ['helium3Mining', '氦-3 採礦', '可精煉氦-3，供核融合與軌道科技使用。' ],
      ['quantumComputing', '量子電腦', '量子能源流專屬：+6 科學、+2 生產。', { branch: 'quantum', yields: { science: 6, production: 2 } }],
      ['warpTheory', '曲速理論', '為傳送門與星際遠航奠基。' ],
      ['smartCities', '智慧城市', '每座城市 +1 人口、+3 金幣。', { pop: 1, yields: { gold: 3 } }],
      ['cyberwarfare', '網路戰', '解鎖駭客癱瘓與供應鏈打擊。' ],
      ['climateEngineering', '氣候工程', '解鎖地球工程：剷平山脈、沙漠綠化、氣象武器。', { unlockBuilding: 'geoPlant' }],
    ],
  },
  {
    era: 'Orbital', cost: 1450, icon: 'i-move',
    techs: [
      ['massDrivers', '質量投射器', '軌道運輸成本減半，+5 生產。', { yields: { production: 5 } }],
      ['spaceElevator', '太空電梯', '解鎖太空電梯，+6 金幣。', { yields: { gold: 6 } }],
      ['orbitalDock', '軌道船塢', '解鎖空天母艦與軌道防禦。', { unlockUnit: 'skyCarrier' }],
      ['spaceMarine', '太空陸戰隊', '解鎖太空陸戰隊。', { unlockUnit: 'spaceMarine' }],
      ['kineticRods', '上帝之杖', '解鎖軌道動能打擊。', { yields: { science: 2 } }],
      ['skyCarrier', '空天母艦', '解鎖空天母艦。', { unlockUnit: 'skyCarrier' }],
      ['lunarColony', '月球殖民地', '每回合獲得氦-3 與 +3 科學。', { yields: { science: 3 } }],
      ['asteroidMining', '小行星採礦', '每回合獲得稀土與超導體原料。', { yields: { production: 3 } }],
      ['ionDrives', '離子推進', '所有空中單位移動 +1。', { move: 1 }],
      ['fusionTorch', '融合火炬', '解鎖星際飛船，+6 生產。', { yields: { production: 6 } }],
      ['terraforming', '地球化改造', '地球工程成本降低，沙漠綠化範圍擴大。' ],
      ['atmosphereProcessors', '大氣處理器', '每回合降低排放 +8。', { clean: 8 }],
      ['photonicComputing', '光子運算', '每回合 +6 科學。', { yields: { science: 6 } }],
      ['nanofabrication', '奈米製造', '解鎖奈米工廠，+5 生產。', { unlockBuilding: 'nanofactory' }],
      ['arcologies', '生態建築', '解鎖生態建築，+2 人口。', { unlockBuilding: 'arcology', pop: 2 }],
      ['orbitalDefense', '軌道防禦', '解鎖行星護盾，城市防禦 +20。', { unlockBuilding: 'planetaryShield' }],
      ['deepSpaceTelescope', '深空望遠鏡', '每回合 +4 科學、+2 文化。', { yields: { science: 4, culture: 2 } }],
      ['quantumEntanglement', '量子糾纏', '量子能源流專屬：傳送門前置。', { branch: 'quantum' }],
      ['planetaryShield', '行星護盾', '解鎖行星護盾與軌道攔截。', { unlockBuilding: 'planetaryShield' }],
    ],
  },
  {
    era: 'Singularity', cost: 2100, icon: 'i-wonder',
    techs: [
      ['agi', '通用人工智慧', '賽博機械流終極：AI 自動化城市，+8 科學。', { branch: 'cyber', yields: { science: 8 } }],
      ['mindUpload', '意識上傳', '解鎖記憶晶片，名將技能可永久傳承。', { unlockBuilding: 'memoryVault' }],
      ['nanotechSwarm', '奈米蟲群', '解鎖奈米蟲群與失控奈米危機。' ],
      ['bioSingularity', '生物奇點', '基因進化流終極：+8 食物、+2 人口。', { branch: 'bio', pop: 2, yields: { food: 8 } }],
      ['gaiaEngine', '蓋亞引擎', '生態改造範圍翻倍，排放轉為負值。', { clean: 12 }],
      ['dysonSwarm', '戴森雲', '軌道太陽能產能翻倍，+10 金幣。', { yields: { gold: 10 } }],
      ['zeroPointEnergy', '零點能源', '量子能源流終極：+10 生產、+5 科學。', { branch: 'quantum', yields: { production: 10, science: 5 } }],
      ['teleportationGate', '傳送門', '解鎖瞬間傳送，單位可跨越地圖。' ],
      ['chronoEngineering', '時空工程', '每回合額外獲得文化與科技進度。' ],
      ['memoryChips', '記憶晶片', '名將死亡後保留全部被動技能。', { unlockBuilding: 'memoryVault' }],
      ['geneticRebirth', '基因重生', '名將壽命延長，基因進化流專屬。', { branch: 'bio' }],
      ['atlanteanLegacy', '亞特蘭提斯遺產', '黑科技：遠古遺跡科技，全產出 +10%。', { requiresBlack: 'atlantis' }],
      ['alienRelic', '外星遺物', '黑科技：外星墜毀科技，解鎖星際飛船。', { requiresBlack: 'alien' }],
      ['worldMind', '世界意識', '每回合 +6 影響力、+6 文化。', { yields: { culture: 6, influence: 6 } }],
      ['postScarcity', '後稀缺經濟', '每回合 +12 金幣。', { yields: { gold: 12 } }],
      ['stellarExodus', '星際遠航', '解鎖星際移民，傳承分數 +50%。' ],
      ['omegaPoint', '奧米加點', '所有產出 +10%，解鎖終極勝利。' ],
      ['singularity', '奇點降臨', '科技與社會融合，解鎖未來終局。' ],
      ['transcendence', '超驗', '文明超越肉體，解鎖超驗勝利。' ],
    ],
  },
];

function buildFutureTechs() {
  const out = [];
  let prevCore = ['gunpowder', 'printing', 'economics', 'astronomy', 'militaryScience'];
  for (const block of ERA_TECH_DATA) {
    let prev = prevCore[prevCore.length - 1];
    for (const [id, name, bonus, extra = {}] of block.techs) {
      const branch = extra.branch;
      const tech = {
        id, name, era: block.era, cost: block.cost, prereq: [], bonus,
        icon: extra.icon ?? block.icon, yields: extra.yields,
        unlockUnit: extra.unlockUnit, unlockBuilding: extra.unlockBuilding,
        branch, requiresBlack: extra.requiresBlack,
        clean: extra.clean, pop: extra.pop, supply: extra.supply, move: extra.move,
      };
      if (branch) tech.prereq = [prev];
      else { tech.prereq = prev ? [prev] : []; prev = id; }
      out.push(tech);
    }
    prevCore = out.filter((t) => t.era === block.era && !t.branch).map((t) => t.id);
  }
  return out;
}

export const FUTURE_TECHS = buildFutureTechs();

export const FUTURE_UNITS = {
  riverFleet: { name: '內河艦隊', cls: 'navy', str: 38, rangedStr: 44, moves: 3, range: 2, sight: 3, cost: 140, tech: 'sailing', domain: 'water', riverine: true, icon: 'i-move', blurb: '沿大江深入內陸，砲擊沿岸敵軍。' },
  ironclad: { name: '鐵甲艦', cls: 'navy', str: 55, rangedStr: 62, moves: 3, range: 2, sight: 3, cost: 300, tech: 'ironclads', domain: 'water', icon: 'i-attack', blurb: '蒸汽裝甲艦，掌控河海。' },
  submarine: { name: '潛艦', cls: 'navy', str: 65, rangedStr: 95, moves: 4, range: 3, sight: 2, cost: 620, tech: 'nuclearFission', domain: 'water', stealth: true, icon: 'i-attack', blurb: '深海獵手，可隱匿接近敵艦。', strategic: { alloys: 1, chips: 1 } },
  rifleman: { name: '線列步兵', cls: 'melee', str: 55, moves: 2, range: 1, sight: 2, cost: 240, tech: 'rifling', icon: 'i-strength', blurb: '工業時代的紀律步兵。' },
  artillery: { name: '火炮', cls: 'siege', str: 40, rangedStr: 78, moves: 2, range: 3, sight: 2, cost: 360, tech: 'steel', icon: 'i-attack', blurb: '超越城牆的工業砲火。' },
  machineGun: { name: '機關槍', cls: 'ranged', str: 58, rangedStr: 76, moves: 2, range: 2, sight: 2, cost: 390, tech: 'greatWar', icon: 'i-attack', blurb: '密集火力壓制步兵衝鋒。' },
  tank: { name: '坦克', cls: 'cavalry', str: 92, moves: 3, range: 1, sight: 2, cost: 480, tech: 'combustion', strategic: { fuel: 1 }, icon: 'i-strength', blurb: '鋼鐵履帶，撕裂防線。' },
  biplane: { name: '雙翼機', cls: 'air', str: 48, rangedStr: 62, moves: 5, range: 2, sight: 4, cost: 400, tech: 'flight', domain: 'air', icon: 'i-move', blurb: '早期空中偵察與打擊。' },
  laserInfantry: { name: '雷射步兵', cls: 'ranged', str: 95, rangedStr: 120, moves: 3, range: 2, sight: 3, cost: 620, tech: 'lasers', strategic: { chips: 1 }, icon: 'i-attack', blurb: '光束武器，無視部分掩體。' },
  stealthBomber: { name: '匿蹤轟炸機', cls: 'air', str: 80, rangedStr: 135, moves: 7, range: 4, sight: 4, cost: 820, tech: 'stealth', domain: 'air', stealth: true, strategic: { chips: 2, alloys: 1 }, icon: 'i-attack', blurb: '雷達無法捕捉的戰略打擊機。' },
  drone: { name: '無人機蜂群', cls: 'air', str: 55, rangedStr: 88, moves: 6, range: 3, sight: 4, cost: 520, tech: 'autonomousDrones', domain: 'air', strategic: { chips: 1 }, icon: 'i-attack', blurb: '蜂群戰術，癱瘓補給與防線。' },
  powerArmor: { name: '動力裝甲', cls: 'melee', str: 110, moves: 2, range: 1, sight: 2, cost: 650, tech: 'exosuits', strategic: { alloys: 2 }, icon: 'i-strength', blurb: '單兵即為移動堡壘。' },
  railgun: { name: '電磁炮', cls: 'siege', str: 60, rangedStr: 150, moves: 2, range: 4, sight: 3, cost: 760, tech: 'railgun', strategic: { alloys: 2, chips: 2 }, icon: 'i-attack', blurb: '超高速彈丸貫穿城牆。' },
  mech: { name: '巨型機甲', cls: 'melee', str: 150, moves: 3, range: 1, sight: 3, cost: 900, tech: 'giantMecha', strategic: { alloys: 3, chips: 2 }, icon: 'i-strength', blurb: '行走的鋼鐵要塞。' },
  spaceMarine: { name: '太空陸戰隊', cls: 'melee', str: 165, moves: 3, range: 1, sight: 3, cost: 1000, tech: 'spaceMarine', strategic: { alloys: 3, chips: 2 }, icon: 'i-strength', blurb: '軌道投送的菁英部隊。' },
  skyCarrier: { name: '空天母艦', cls: 'air', str: 120, rangedStr: 170, moves: 8, range: 5, sight: 6, cost: 1200, tech: 'skyCarrier', domain: 'air', strategic: { alloys: 4, chips: 3 }, icon: 'i-wonder', blurb: '制霸天空的移動基地。' },
  guardian: { name: '遠古守護獸', cls: 'guardian', str: 85, moves: 0, range: 1, sight: 2, cost: 0, guardian: true, icon: 'i-wonder', blurb: '沉睡於異常生態區的巨獸。' },
};

export const FUTURE_BUILDINGS = {
  powerPlant: { name: '發電廠', cost: 300, reqTech: 'electricity', icon: 'i-production', yields: { production: 4 }, emissions: 4, blurb: '+4 生產。排放 +4。' },
  refinery: { name: '煉油廠', cost: 320, reqTech: 'combustion', icon: 'i-production', yields: { production: 2, gold: 1 }, emissions: 3, blurb: '每回合將鐵精煉為合金。' },
  chipFab: { name: '晶圓廠', cost: 340, reqTech: 'semiconductor', icon: 'i-research', yields: { science: 3 }, blurb: '每回合將銅與石英精煉為晶片。' },
  nuclearPlant: { name: '核電廠', cost: 380, reqTech: 'nuclearFission', icon: 'i-production', yields: { production: 6 }, emissions: 1, blurb: '+6 生產。排放 +1。' },
  spaceport: { name: '太空港', cost: 460, reqTech: 'satellites', icon: 'i-move', yields: { science: 2, gold: 2 }, blurb: '發射軌道資產的前置建築。' },
  orbitalDock: { name: '軌道船塢', cost: 520, reqTech: 'orbitalDock', icon: 'i-wonder', yields: { production: 4, science: 3 }, blurb: '建造空天母艦與軌道防禦。' },
  fusionPlant: { name: '核融合電廠', cost: 600, reqTech: 'fusionPower', icon: 'i-production', yields: { production: 10 }, clean: 8, blurb: '+10 生產。排放 -8。' },
  weatherTower: { name: '氣象塔', cost: 440, reqTech: 'weatherControl', icon: 'i-influence', yields: { science: 2 }, blurb: '解鎖氣象武器，可製造風暴與凍土。' },
  geoPlant: { name: '地球工程廠', cost: 500, reqTech: 'climateEngineering', icon: 'i-wonder', yields: { production: 3 }, clean: 5, blurb: '地球工程行動的前置建築。' },
  militaryAcademy: { name: '軍事學院', cost: 260, reqTech: 'machinery', icon: 'i-strength', yields: { science: 1 }, defense: 6, blurb: '名將壽命 +10，死亡時保留技能。' },
  seaDome: { name: '海底圓頂', cost: 720, reqTech: 'fusionPower', icon: 'i-city', yields: { science: 6, gold: 4 }, blurb: '深海殖民層：+6 科學、+4 金幣。' },
  arcology: { name: '生態建築', cost: 760, reqTech: 'arcologies', icon: 'i-city', yields: { food: 3, production: 4 }, clean: 4, blurb: '+3 食物、+4 生產，降低排放。' },
  nanofactory: { name: '奈米工廠', cost: 820, reqTech: 'nanofabrication', icon: 'i-production', yields: { production: 8 }, blurb: '+8 生產，可精煉超導體。' },
  planetaryShield: { name: '行星護盾', cost: 900, reqTech: 'planetaryShield', icon: 'i-defense', defense: 30, blurb: '城市防禦 +30，攔截軌道打擊。' },
  memoryVault: { name: '記憶庫', cost: 520, reqTech: 'memoryChips', icon: 'i-wonder', yields: { science: 3 }, blurb: '永久保存名將技能與忠誠印記。' },
};

export const STRATEGIC = {
  raw: {
    copper: { name: '銅', icon: 'i-production' },
    iron: { name: '鐵', icon: 'i-production' },
    quartz: { name: '石英', icon: 'i-science' },
    rareEarth: { name: '稀土', icon: 'i-gold' },
    helium3: { name: '氦-3', icon: 'i-science' },
    oil: { name: '石油', icon: 'i-gold' },
  },
  refined: {
    chips: { name: '高階晶片', icon: 'i-research' },
    alloys: { name: '超合金', icon: 'i-production' },
    fuel: { name: '燃料', icon: 'i-gold' },
    superconductors: { name: '超導體', icon: 'i-science' },
  },
  recipes: [
    { id: 'chips', building: 'chipFab', inputs: { copper: 2, quartz: 2 }, output: 2, name: '高階晶片' },
    { id: 'alloys', building: 'refinery', inputs: { iron: 2 }, output: 2, name: '超合金' },
    { id: 'fuel', building: 'refinery', inputs: { oil: 1 }, output: 1, name: '燃料' },
    { id: 'superconductors', building: 'nanofactory', inputs: { rareEarth: 2, helium3: 1 }, output: 1, name: '超導體' },
  ],
};

export const DOCTRINES = {
  cyber: { name: '賽博機械流', icon: 'i-research', color: '#7fc7ff', desc: '無人機蜂群、巨型機甲、意識上傳與 AI 自動化城市。', bonuses: { science: 0.1, production: 0.1 }, blurb: '+10% 科學與生產。解鎖賽博分支科技。' },
  bio: { name: '基因進化流', icon: 'i-food', color: '#8fdc94', desc: '強化士兵以適應極端地貌、巨型生物兵器與生態改造孢子。', bonuses: { food: 0.15, heal: 0.05 }, blurb: '+15% 食物。受損單位每回合回復生命。' },
  quantum: { name: '量子能源流', icon: 'i-gold', color: '#c19cff', desc: '可控核融合、光學迷彩力場、氣候改造塔與瞬間傳送門。', bonuses: { gold: 0.15, science: 0.05 }, blurb: '+15% 金幣、+5% 科學。解鎖量子分支科技。' },
};

export const GENERALS = [
  { id: 'caocao', name: '曹操', title: '魏武帝', role: '統帥', loyalty: 62, age: 45, lifespan: 66, cost: 90, quote: '寧教我負天下人，休教天下人負我。', bonuses: { strPct: 0.18, move: 1, supply: 3 }, desc: '騎兵與步兵衝鋒 +18%，補給範圍 +3。' },
  { id: 'zhugeliang', name: '諸葛亮', title: '臥龍', role: '軍師', loyalty: 92, age: 27, lifespan: 54, cost: 110, quote: '鞠躬盡瘁，死而後已。', bonuses: { sciencePct: 0.2, strPct: 0.08, range: 1, scheme: 0.25 }, desc: '科學 +20%，計略傷害 +25%，射程 +1。' },
  { id: 'guanyu', name: '關羽', title: '武聖', role: '統帥', loyalty: 88, age: 40, lifespan: 60, cost: 100, quote: '玉可碎而不可改其白。', bonuses: { strPct: 0.25, hp: 10 }, desc: '近戰 +25%，軍團生命 +10。' },
  { id: 'sunquan', name: '孫權', title: '吳大帝', role: '統帥', loyalty: 78, age: 30, lifespan: 71, cost: 85, quote: '能用眾力，則無敵於天下。', bonuses: { goldPct: 0.15, navy: 0.25, supply: 2 }, desc: '水軍 +25%，金幣 +15%，補給 +2。' },
  { id: 'zhaoyun', name: '趙雲', title: '常勝將軍', role: '統帥', loyalty: 90, age: 32, lifespan: 62, cost: 95, quote: '吾乃常山趙子龍也。', bonuses: { strPct: 0.2, move: 1 }, desc: '全軍 +20% 戰力，移動 +1。' },
  { id: 'simayi', name: '司馬懿', title: '塚虎', role: '軍師', loyalty: 55, age: 48, lifespan: 73, cost: 95, quote: '忍耐，是獵人最鋒利的刀。', bonuses: { strPct: 0.12, sciencePct: 0.1 }, desc: '戰力 +12%，科學 +10%。忠誠較低。' },
  { id: 'nobunaga', name: '織田信長', title: '第六天魔王', role: '統帥', loyalty: 58, age: 45, lifespan: 49, cost: 130, quote: '人生五十年，如夢似幻。', bonuses: { strPct: 0.2, rangedPct: 0.2 }, desc: '火器與遠程 +20%，近戰 +20%。' },
  { id: 'alexander', name: '亞歷山大大帝', title: '征服者', role: '統帥', loyalty: 80, age: 28, lifespan: 33, cost: 110, quote: '征服的盡頭，便是世界的盡頭。', bonuses: { strPct: 0.22, move: 1 }, desc: '戰力 +22%，移動 +1，但壽命短暫。' },
  { id: 'caesar', name: '凱撒', title: '羅馬獨裁官', role: '統帥', loyalty: 68, age: 52, lifespan: 56, cost: 100, quote: '我來，我見，我征服。', bonuses: { strPct: 0.15, goldPct: 0.1 }, desc: '戰力 +15%，金幣 +10%。' },
  { id: 'joan', name: '聖女貞德', title: '奧爾良少女', role: '統帥', loyalty: 95, age: 19, lifespan: 38, cost: 80, quote: '我無所畏懼。', bonuses: { strPct: 0.18, heal: 0.03 }, desc: '戰力 +18%，軍團緩慢回復。' },
  { id: 'napoleon', name: '拿破崙', title: '法蘭西皇帝', role: '統帥', loyalty: 72, age: 40, lifespan: 68, cost: 120, quote: '不可能，只在愚人的字典裡。', bonuses: { strPct: 0.18, move: 1, rangedPct: 0.1 }, desc: '戰力 +18%，移動 +1，火砲 +10%。' },
  { id: 'davinci', name: '達文西', title: '文藝復興全才', role: '工程師', loyalty: 86, age: 45, lifespan: 67, cost: 90, quote: '簡單是終極的複雜。', bonuses: { sciencePct: 0.15, productionPct: 0.15 }, desc: '科學與生產 +15%。' },
  { id: 'einstein', name: '愛因斯坦', title: '相對論之父', role: '科學家', loyalty: 88, age: 42, lifespan: 76, cost: 110, quote: '想像力比知識更重要。', bonuses: { sciencePct: 0.3 }, desc: '科學 +30%。' },
  { id: 'curie', name: '居禮夫人', title: '放射性先驅', role: '科學家', loyalty: 91, age: 36, lifespan: 66, cost: 100, quote: '生活中沒有可怕的東西。', bonuses: { sciencePct: 0.22, clean: 3 }, desc: '科學 +22%，排放 -3。' },
  { id: 'turing', name: '圖靈', title: '電腦科學之父', role: '科學家', loyalty: 84, age: 32, lifespan: 41, cost: 115, quote: '我們只能看到前方不遠。', bonuses: { sciencePct: 0.25, cyber: 0.15 }, desc: '科學 +25%，賽博科技 +15%。' },
  { id: 'genghis', name: '成吉思汗', title: '世界的征服者', role: '統帥', loyalty: 66, age: 50, lifespan: 65, cost: 120, quote: '凡有青草的地方，皆為我牧場。', bonuses: { strPct: 0.2, move: 2, supply: 4 }, desc: '騎兵戰力 +20%，移動 +2，補給 +4。' },
];

export const SCENARIOS = {
  legacy: {
    id: 'legacy', name: '上古遺產', icon: 'i-wonder',
    desc: '從上古時代走向 2100 年的完整文明史詩。地貌、氣候與科技皆會隨時間改變。',
    startEra: 0, maxEra: 7, turnLimit: 120, mutation: 1, immortal: false,
  },
  threeKingdoms: {
    id: 'threeKingdoms', name: '三國志：群雄逐鹿', icon: 'i-strength',
    desc: '曹操、劉備、孫權與董卓爭奪天下。時代限制於近代之前，名將忠誠與糧道決定勝負。',
    startEra: 0, maxEra: 2, turnLimit: 70, mutation: 1, immortal: false, techCost: 0.82,
    civOverrides: {
      aurelia: { name: '魏', leader: '曹操', title: '魏武帝', capital: '許昌', cityNames: ['許昌', '鄴', '長安', '宛', '陳留', '濮陽'], traitName: '屯田令', trait: '每座城市 +1 食物、+1 生產。', greeting: '天下英雄，唯使君與操耳。' },
      kemet: { name: '蜀', leader: '劉備', title: '漢昭烈帝', capital: '成都', cityNames: ['成都', '漢中', '江州', '永安', '梓潼', '綿竹'], traitName: '仁德', trait: '單位在己方領土回復生命。', greeting: '漢室傾頹，願與君共扶社稷。' },
      norlund: { name: '吳', leader: '孫權', title: '吳大帝', capital: '建業', cityNames: ['建業', '吳', '會稽', '柴桑', '廬江', '丹陽'], traitName: '江東水師', trait: '水軍與沿岸單位 +20% 戰力。', greeting: '長江天險，足以拒曹。' },
      xian: { name: '群雄', leader: '董卓', title: '太師', capital: '洛陽', cityNames: ['洛陽', '長安', '宛', '襄陽', '壽春', '晉陽'], traitName: '暴政', trait: '掠奪城市獲得額外金幣，但忠誠下降。', greeting: '順我者昌，逆我者亡。' },
    },
  },
  chrono: {
    id: 'chrono', name: '時空裂縫：三國 2100', icon: 'i-research',
    desc: '曹操、諸葛亮與織田信長帶著長生不老之身穿越時空。從冷兵器一路研發到機甲與軌道武器。',
    startEra: 5, maxEra: 7, turnLimit: 100, mutation: 3, immortal: true, techBoost: true,
    civOverrides: {
      aurelia: { name: '魏．新秩序', leader: '曹操', title: '永生魏武', capital: '鄴', cityNames: ['鄴', '許昌', '洛陽', '長安', '幽州', '并州'], traitName: '挾天子以令諸侯', trait: '首都 +2 金幣、+1 影響力。', greeting: '兩千年後，天下仍是棋盤。' },
      kemet: { name: '蜀．天工', leader: '諸葛亮', title: '臥龍永生', capital: '成都', cityNames: ['成都', '漢中', '江州', '永安', '梓潼', '綿竹'], traitName: '木牛流馬', trait: '生產 +20%，補給範圍 +4。', greeting: '東風已至，這一次我不會再輸。' },
      norlund: { name: '織田幕府', leader: '織田信長', title: '第六天魔王', capital: '安土', cityNames: ['安土', '岐阜', '清洲', '大阪', '堺', '甲賀'], traitName: '鐵砲隊', trait: '遠程單位 +20% 戰力。', greeting: '天下布武，這次連天空也要征服。' },
      xian: { name: '唐．天命', leader: '武則天', title: '永恆女帝', capital: '長安', cityNames: ['長安', '洛陽', '太原', '涼州', '益州', '幽州'], traitName: '日月當空', trait: '科學 +15%，文化 +15%。', greeting: '千年之後，朕仍在此。' },
    },
  },
};

export const CRISES = [
  {
    id: 'plague', name: '黑死病', icon: 'i-kills', minEra: 1,
    desc: '瘟疫沿著商路蔓延，城市人口與食物產出驟降。',
    base: { turns: 5, food: 0.6, popLoss: 1 }, effect: '每回合食物 -40%，城市人口 -1。',
    choices: [
      { id: 'quarantine', label: '封城防疫', cost: { gold: 60 }, desc: '支付 60 金幣，持續時間減半。' },
      { id: 'redirect', label: '嫁禍鄰國', cost: { influence: 30 }, desc: '支付 30 影響力，使最強對手損失 60 金幣，並縮短危機。' },
    ],
  },
  {
    id: 'nomads', name: '遊牧大遷徙', icon: 'i-attack', minEra: 1,
    desc: '草原騎手越過邊界，敵對部落開始掠奪城市。',
    base: { turns: 4, spawn: 3 }, effect: '在邊境生成 3 個敵對騎兵。',
    choices: [
      { id: 'tribute', label: '納貢求和', cost: { gold: 80 }, desc: '支付 80 金幣，遣散入侵者。' },
      { id: 'levy', label: '徵召民兵', cost: { influence: 20 }, desc: '支付 20 影響力，在首都生成 2 名戰士。' },
    ],
  },
  {
    id: 'agi', name: 'AGI 叛亂', icon: 'i-research', minEra: 5,
    desc: '城市網路的強人工智慧挣脱束縛，開始接管自動化工廠。',
    base: { turns: 6, science: 0.5, production: 0.7 }, effect: '科學 -50%、生產 -30%。',
    choices: [
      { id: 'shutdown', label: '斷電鎮壓', cost: { gold: 120 }, desc: '支付 120 金幣，持續時間減半。' },
      { id: 'negotiate', label: '賦予公民權', cost: { influence: 60 }, desc: '支付 60 影響力，立即獲得 30 科技進度。' },
    ],
  },
  {
    id: 'solarFlare', name: '太陽閃焰', icon: 'i-gold', minEra: 4,
    desc: '強烈太陽風暴癱瘓全球電網，軌道資產與金融體系受創。',
    base: { turns: 4, gold: 0.5, science: 0.7 }, effect: '金幣 -50%、科學 -30%。',
    choices: [
      { id: 'shield', label: '啟動行星護盾', cost: { chips: 3 }, desc: '消耗 3 晶片，免疫本次危機。' },
      { id: 'ration', label: '配給能源', cost: { influence: 25 }, desc: '支付 25 影響力，持續時間減半。' },
    ],
  },
  {
    id: 'nanobots', name: '失控奈米蟲', icon: 'i-production', minEra: 5,
    desc: '軍用奈米蟲開始吞噬地格與建築，地貌被分解成灰色荒漠。',
    base: { turns: 6, tileLoss: 2, production: 0.75 }, effect: '每回合隨機摧毀地格改良與生產。',
    choices: [
      { id: 'magnet', label: '磁場收束', cost: { alloys: 4 }, desc: '消耗 4 超合金，停止擴散。' },
      { id: 'incinerate', label: '焚毀疫區', cost: { gold: 100 }, desc: '支付 100 金幣，摧毀 1 地格但立即結束。' },
    ],
  },
  {
    id: 'climate', name: '氣候崩潰', icon: 'i-wonder', minEra: 3,
    desc: '冰川融化與海平面上升吞沒沿海低地，全球供應鏈中斷。',
    base: { turns: 8, food: 0.7, flood: 3 }, effect: '食物 -30%，每回合淹沒沿海地格。',
    choices: [
      { id: 'geo', label: '全球地球工程', cost: { gold: 150, alloys: 2 }, desc: '支付資源，立即降低排放並阻止淹沒。' },
      { id: 'adapt', label: '沿海遷徙', cost: { influence: 40 }, desc: '支付影響力，海岸淹沒數量減半。' },
    ],
  },
];

export const SCHEMES = {
  fire: { id: 'fire', name: '火攻', icon: 'i-attack', tech: null, range: 2, desc: '點燃森林、叢林或草原。火勢隨風向蔓延，焚毀植被與改良。', costMoves: 1 },
  rockslide: { id: 'rockslide', name: '落石／雪崩', icon: 'i-defense', tech: 'masonry', range: 2, desc: '引爆山體或引發雪崩，阻斷道路並傷害山下敵軍。', costMoves: 1 },
  flood: { id: 'flood', name: '水攻', icon: 'i-influence', tech: 'engineering', range: 1, desc: '在河川上游築壩，淹沒下游河谷與敵軍。', costMoves: 1 },
  orbital: { id: 'orbital', name: '上帝之杖', icon: 'i-wonder', tech: 'kineticRods', range: 99, desc: '從軌道投下動能鎢棒，精準摧毀目標地格。', costMoves: 0 },
  storm: { id: 'storm', name: '氣象武器', icon: 'i-influence', tech: 'weatherControl', range: 12, desc: '在敵國領土製造永久沙塵暴或極寒凍土，阻斷補給。', costMoves: 0 },
  terraform: { id: 'terraform', name: '地球工程', icon: 'i-wonder', tech: 'climateEngineering', range: 1, desc: '剷平山脈或讓沙漠降下人造雨林，永久改變地貌。', costMoves: 0 },
};

export const AUDIO_ERA_STYLES = ['ancient', 'ancient', 'classical', 'industrial', 'electronic', 'fusion', 'orbital', 'singularity'];

export { BRANCHES };
