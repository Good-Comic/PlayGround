import { AGES, BOONS, BUILDINGS, DIFFICULTY_LABELS, ENEMIES, META_UNLOCKS, UNITS, WAVES } from './data.js';

const STORAGE_KEY = 'aoe-roguelite-lang';

export const LANGUAGES = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' }
];

let current = 'zh';
const listeners = new Set();

const ZH = {
  'Age of Empires II: Roguelite': '帝國時代 II：Roguelite',
  'A medieval roguelite RTS: build your keep, muster an army, and survive five escalating waves.': '一款中世紀 Roguelite RTS：建造城堡、集結軍隊，撐過五波逐步升級的攻勢。',
  'A Roguelite Chronicle': '輕度 Roguelite 編年史',
  'Age of Empires <span>II</span>': '帝國時代 <span>II</span>',
  'Raise a kingdom from embers. Muster an army.<br>Survive the five nights that follow.': '從餘燼中建立王國。召集軍隊。<br>撐過接下來的五個夜晚。',
  'Play': '開始遊戲',
  'How to Play': '遊戲說明',
  'Options': '選項',
  'Legacy': '傳承',
  'Renown': '聲望',
  'Best: Wave {wave}': '最佳：第 {wave} 波',
  'crown': '王冠',
  'crowns': '王冠',
  'No campaigns survived': '尚無戰役存活',
  '{count} renown until {name}': '再獲得 {count} 聲望即可解鎖{name}',
  'Legacy complete · Build · Gather · Advance · Endure': '傳承圓滿 · 建造 · 採集 · 推進 · 堅守',
  'Build · Gather · Advance · Endure': '建造 · 採集 · 推進 · 堅守',
  'A new map every campaign': '每場戰役都有全新地圖',
  'Toggle sound': '切換音效',
  'The Shattered Crown': '破碎王冠',
  'Campaign I': '戰役 I',
  'Resources': '資源',
  'Food': '食物',
  'Wood': '木材',
  'Gold': '黃金',
  'Stone': '石頭',
  'Population': '人口',
  'Age': '時代',
  'Dark Age': '黑暗時代',
  'Game speed (S)': '遊戲速度 (S)',
  'Help': '說明',
  'Help (H)': '說明 (H)',
  'Pause': '暫停',
  'Pause (Space)': '暫停 (空白鍵)',
  'Campaign': '戰役',
  'Wave I': '第 I 波',
  'The First Night': '第一夜',
  'Bandits gather at the eastern ford.': '盜匪在東邊渡口集結。',
  'Hold the line.': '堅守陣線。',
  'Place {name}': '放置{name}',
  'Wave {wave}': '第 {wave} 波',
  'Sound the Horn': '吹響號角',
  '+75 gold': '+75 黃金',
  'Protect the Town Center. Raise houses, gather resources, and muster a host before the horn sounds.': '保護城鎮中心。建造房屋、採集資源，並在號角響起前集結軍隊。',
  'The Marchland': '邊境沼地',
  'Vesper': '晚禱',
  'Dusk': '黃昏',
  'Nightfall': '入夜',
  'Deep Night': '深夜',
  'Red Moon': '紅月',
  'Click to move your view': '點擊移動視角',
  'Calm': '平靜',
  'Raiders abroad': '掠奪者蠢動',
  'Battle joined': '戰鬥爆發',
  'No command': '無指令',
  'Select a villager, soldier, or building.': '選擇村民、士兵或建築。',
  'Select a unit or building to see its orders.': '選擇單位或建築以查看可用指令。',
  'Place building': '放置建築',
  'Left click to build · Right click to cancel': '左鍵建造 · 右鍵取消',
  'Lighting the hearth...': '點燃爐火……',
  'Isometric medieval battlefield': '等距視角的中世紀戰場',
  'sec': '秒',
  'foe': '敵',
  'foes': '敵',
  'clear': '完成',
  'Stop': '停止',
  'Stop orders': '停止命令',
  'Halt current orders for selected units.': '停止選取單位的當前命令。',
  'Advance': '推進時代',
  'Advance to the {age}': '推進至{age}',
  'Unlocks {list}.': '解鎖{list}。',
  'the next chapter': '下一章',
  'Idle Villager': '閒置村民',
  'Find an idle villager': '尋找閒置村民',
  '{count} villager awaiting orders.': '{count} 名村民等待命令。',
  '{count} villagers awaiting orders.': '{count} 名村民等待命令。',
  'War Band': '戰團',
  'Villagers can construct; soldiers will follow the banner.': '村民可以建造；士兵會跟隨旗幟。',
  'Right-click ground to move · right-click an enemy to attack.': '右鍵點擊地面移動 · 右鍵點擊敵人攻擊。',
  'An enemy of the crown. Right-click with your soldiers to attack.': '王冠之敵。用士兵右鍵點擊以攻擊。',
  'Right-click to move. Select villagers to build and gather.': '右鍵移動。選擇村民來建造與採集。',
  'Free': '免費',
  'Tower': '塔',
  'Requires {age} Age': '需要{age}時代',
  'Attack': '攻擊',
  'Armour': '護甲',
  'Range': '範圍',
  'Under construction': '建造中',
  'Training {name} ({count})': '訓練{name}（{count}）',
  'Awaiting orders': '等待命令',
  '{percent}% built': '已建造 {percent}%',
  'Building': '建築',
  'Moving': '移動中',
  'Engaged': '交戰中',
  'Gathering {resource}': '採集中：{resource}',
  'Gathering': '採集中',
  'Harvesting the field': '收割農田',
  'Returning resources': '運送資源',
  'Constructing': '建造中',
  'Repairing': '修復中',
  'Game speed {speed}×': '遊戲速度 {speed}×',
  "The Warden's horn has not yet sounded. Prepare your village.": '守望者的號角尚未吹響。準備你的村莊。',
  'A new campaign': '新的戰役',
  'A fresh map. A fresh chance to endure.': '全新的地圖。全新的生存機會。',
  'A new campaign begins. The ford is yours to hold.': '新的戰役開始。這處渡口由你守衛。',
  'Select a villager to construct buildings.': '請選擇村民來建造建築。',
  '{name} requires the {age}.': '{name}需要進入{age}。',
  'Not enough resources for {name}.': '資源不足，無法建造{name}。',
  'Not enough resources to train {name}.': '資源不足，無法訓練{name}。',
  'Cannot build there.': '無法在此建造。',
  'Not enough resources.': '資源不足。',
  '{name} under construction.': '{name}正在建造中。',
  'The training queue is full.': '訓練佇列已滿。',
  'Population limit reached. Build more houses.': '人口已達上限。請建造更多房屋。',
  '{name} queued at the {building}.': '{name}已排入{building}的訓練佇列。',
  'Need {cost} to advance.': '需要 {cost} 才能推進時代。',
  'The realm enters the {age}.': '王國進入{age}。',
  'A new age': '新時代',
  'New soldiers and structures are now available.': '新的士兵與建築已解鎖。',
  'The horn sounds. Raiders are crossing the ford!': '號角響起。掠奪者正跨越渡口！',
  'You sound the horn early. The steward rewards your boldness with 75 gold.': '你提前吹響號角。總管以 75 黃金獎勵你的膽識。',
  'Wave {wave} survived. The ford is quiet again.': '第 {wave} 波已堅守。渡口再次歸於平靜。',
  '{name} joins your campaign.': '{name}加入你的戰役。',
  'Wave {wave} approaches': '第 {wave} 波來襲',
  'Use this respite wisely.': '善用這段喘息時間。',
  '{name} has fallen.': '{name}陣亡。',
  '{name} is under attack!': '{name}正遭受攻擊！',
  '{name} completed.': '{name}建造完成。',
  '{name} is ready.': '{name}已訓練完成。',
  '+{gold} gold': '+{gold} 黃金',
  'Warlord fallen': '軍閥已倒下',
  'Rally': '集結',
  'The spoils of survival': '生存的戰利品',
  'Choose a Blessing': '選擇祝福',
  'The ford is quiet. Choose one boon to carry into the next night.': '渡口歸於平靜。選擇一項祝福，帶入下一夜。',
  'Common Blessing': '普通祝福',
  'Rare Blessing': '稀有祝福',
  'Epic Blessing': '史詩祝福',
  'Press {n} to choose': '按 {n} 選擇',
  'The campaign pauses while you choose': '選擇期間戰役暫停',
  'The ford holds': '渡口堅守',
  'The banner falls': '旗幟倒下',
  'Campaign Victorious': '戰役勝利',
  'The Keep Has Fallen': '城堡陷落',
  'The Warlord is slain. The Shattered Crown is yours, for now.': '軍閥已被擊殺。破碎王冠暫且屬於你。',
  "The Warlord's host has taken the keep. Your legacy endures beyond the ashes.": '軍閥的大軍已攻陷城堡。你的傳承將在灰燼之後延續。',
  'Wave Reached': '抵達波次',
  'Raiders Slain': '擊殺掠奪者',
  'Units Muster': '集結單位',
  'Resources Gathered': '採集資源',
  'New legacy unlocked:': '解鎖全新傳承：',
  'New legacy unlocked: <strong>{name}</strong> — {desc}': '解鎖全新傳承：<strong>{name}</strong> — {desc}',
  'You earned': '你獲得了',
  'You earned <strong>{earned} Renown</strong>. Legacy: <strong>{total} Renown</strong>.': '你獲得了 <strong>{earned} 聲望</strong>。傳承：<strong>{total} 聲望</strong>。',
  'Legacy:': '傳承：',
  'Play Again': '再玩一次',
  'Main Menu': '主選單',
  'The realm waits': '王國靜候',
  'Campaign Paused': '戰役暫停',
  'The horn has not sounded. Take stock of your village.': '號角尚未吹響。清點你的村莊。',
  'Resume': '繼續',
  'Restart Campaign': '重新開始戰役',
  'Adjust the experience. Language changes apply immediately.': '調整遊戲體驗。語言變更會立即套用。',
  'The steward awaits': '總管在此候命',
  'Shape the chronicle to your liking. Changes take effect at once.': '依你的喜好塑造這段編年史。變更會立即生效。',
  'Language': '語言',
  'Choose the language for the interface and game content.': '選擇介面與遊戲內容的語言。',
  'Choose the language for the interface, campaign, and all game text.': '選擇介面、戰役與所有遊戲文字的語言。',
  'English': 'English',
  '繁體中文': '繁體中文',
  'Return': '返回',
  'Back': '返回',
  'Close': '關閉',
  "The steward's ledger": '總管的帳冊',
  'A campaign lasts five waves. Protect the Town Center, grow your economy, and raise a host between assaults.': '一場戰役持續五波。保護城鎮中心、發展經濟，並在攻勢之間集結軍隊。',
  'The Village': '村莊',
  'Left click': '左鍵',
  'Select a unit or building. Drag to select soldiers and villagers.': '選擇單位或建築。拖曳以選取士兵與村民。',
  'Right click': '右鍵',
  'Move, gather, attack, build, or set a rally point.': '移動、採集、攻擊、建造或設定集結點。',
  'Pan the camera. Mouse wheel zooms. Middle-drag also pans.': '平移鏡頭。滑鼠滾輪縮放。中鍵拖曳也可平移。',
  'Find the next idle villager.': '尋找下一位閒置村民。',
  'Space': '空白鍵',
  'Pause or resume the campaign.': '暫停或繼續戰役。',
  'Select the Town Center.': '選取城鎮中心。',
  'The Campaign': '戰役',
  'Villagers': '村民',
  'Right-click trees, gold, stone, berries, or sheep to gather. Return goods to the Town Center.': '右鍵點擊樹木、黃金、石頭、莓果或綿羊來採集。將資源送回城鎮中心。',
  'Build': '建造',
  'Select villagers and use the construction cards. Houses raise population.': '選擇村民並使用建造卡牌。房屋可提升人口上限。',
  'Ages': '時代',
  'Advance through Feudal, Castle, and Imperial Ages to unlock new soldiers.': '推進至封建、城堡與帝王時代，解鎖新的士兵。',
  'Waves': '波次',
  'Survive five assaults. After each, choose one of three blessings.': '撐過五波攻勢。每波結束後，從三項祝福中選擇一項。',
  'Horn': '號角',
  'Sound the horn early to earn 75 gold and meet the next wave on your terms.': '提前吹響號角可獲得 75 黃金，並按你的節奏迎戰下一波。',
  'Renown persists between campaigns and unlocks starting bonuses.': '聲望會跨戰役保留，並解鎖起始加成。',
  'Return to the Realm': '返回王國',
  'The chronicle turns': '編年史翻頁',
  'Advance to the {age} to unlock {list}.': '推進至{age}以解鎖{list}。',
  'The final age of your campaign. The realm stands at its height.': '戰役的最終時代。王國正處於巔峰。',
  'Final age': '最終時代',
  'Reached': '已達成',
  'Current': '當前',
  'Advance — {cost}': '推進 — {cost}',
  'Imperial Age reached': '已達帝王時代',
  'Economy': '經濟',
  'Scout': '斥候',
  'Infantry': '步兵',
  'Cavalry': '騎兵',
  'Ranged': '遠程',
  'Raider': '掠奪者',
  'Elite': '精英',
  'Warlord': '軍閥',
  'tree': '樹木',
  'gold': '黃金',
  'stone': '石頭',
  'berry': '莓果',
  'sheep': '綿羊'
};

const UNIT_ZH = {
  villager: { name: '村民', desc: '採集食物、木材、黃金與石頭，並建造與修復建築。' },
  scout: { name: '斥候騎兵', desc: '迅捷的騎手，擅長騷擾掠奪者與偵察河渡。' },
  militia: { name: '民兵', desc: '持盾的堅實士兵，是早期軍隊的中堅。' },
  spearman: { name: '長矛兵', desc: '能越過盾牌攻擊，從安全距離懲罰蠻兵。' },
  archer: { name: '弓兵', desc: '從第二排安全位置放箭，近戰時十分脆弱。' },
  knight: { name: '騎士', desc: '重裝騎兵，迅速、耐久，對弓兵極具毀滅性。' },
  crossbow: { name: '弩兵', desc: '較慢但更沉重的弩矢，能穿透鎖甲與獸皮。' },
  champion: { name: '冠軍勇士', desc: '身經百戰的老兵，在一切崩潰時守住陣線。' },
  longbow: { name: '長弓兵', desc: '箭雨足以遮蔽太陽，是王國最精銳的射手。' }
};

const ENEMY_ZH = {
  raider: { name: '掠奪者', desc: '手持缺口斧頭的飢餓掠奪者。' },
  skirmisher: { name: '散兵', desc: '從戰陣邊緣投擲標槍。' },
  brute: { name: '蠻兵', desc: '身披廢鐵的魁梧屠夫。' },
  warlord: { name: '軍閥', desc: '地平線上每一支火把背後的操縱者。' }
};

const BUILDING_ZH = {
  towncenter: { name: '城鎮中心', desc: '王國的核心。訓練村民、接收資源，並射出箭矢。' },
  house: { name: '房屋', desc: '溫暖的爐火與堅固的屋頂。人口上限 +5。' },
  farm: { name: '農田', desc: '大麥田。村民無需離開城牆即可在此採集食物。' },
  barracks: { name: '兵營', desc: '訓練步兵。推進時代以徵召長矛兵、騎士與冠軍勇士。' },
  archery: { name: '射箭場', desc: '訓練弓兵。靶場與製箭師讓天空佈滿箭矢。' },
  tower: { name: '瞭望塔', desc: '樹線之上的石眼，會向接近的掠奪者開火。' }
};

const AGE_ZH = [
  { name: '黑暗時代', short: '黑暗', unlocks: ['長矛兵', '弓兵', '射箭場'] },
  { name: '封建時代', short: '封建', unlocks: ['騎士', '弩兵'] },
  { name: '城堡時代', short: '城堡', unlocks: ['冠軍勇士', '長弓兵'] },
  { name: '帝王時代', short: '帝王', unlocks: [] }
];

const WAVE_ZH = [
  { title: '第一夜', subtitle: '盜匪在東邊渡口集結。', note: '掠奪者正從東邊渡口前來。建造兵營並徵召民兵。' },
  { title: '風中灰燼', subtitle: '燃燒農田的煙霧逐漸逼近。', note: '散兵會投擲標槍。用騎兵拉近距離，或以弓兵還擊。' },
  { title: '鋼鐵貢賦', subtitle: '一名蠻兵率領隊伍涉水而來。', note: '蠻兵能承受箭雨。長矛兵與集中齊射能將他們擊倒。' },
  { title: '紅月升起', subtitle: '渡口在火把映照下翻騰。', note: '敵軍比以往更龐大。瞭望塔與強健的經濟將決定這一夜。' },
  { title: '破碎王冠', subtitle: '軍閥親自前來奪取你的城堡。', note: '軍閥已至。不惜一切代價守住城鎮中心，並將他擊殺。' }
];

const BOON_ZH = {
  harvest: { name: '收穫什一稅', desc: '糧倉聽從你的號令。立即獲得 180 食物與 80 木材。' },
  'royal-stipend': { name: '王室津貼', desc: '忠誠的商人從首都送來一箱財寶。立即獲得 250 黃金與 100 食物。' },
  hearth: { name: '爐火祝福', desc: '村民採集所有資源的速度 +18%，移動速度 +15%。' },
  wolf: { name: '狼旗', desc: '步兵攻擊力 +25%、生命值 +15%。盾牆向前推進。' },
  fletcher: { name: '製箭師之眼', desc: '弓兵射程 +30%、攻擊力 +20%。每一支箭都能找到縫隙。' },
  mason: { name: '石匠大師', desc: '建築生命值 +30%。推進時代的成本降低 20%。' },
  drums: { name: '戰鼓', desc: '所有士兵攻擊速度 +15%，並獲得 1 點護甲。' },
  march: { name: '強行軍', desc: '所有軍事單位移動速度 +15%。速度贏得側翼。' },
  spoils: { name: '戰利品', desc: '每名被擊殺的掠奪者提供 5 黃金。戰場自給自足。' },
  'twin-watch': { name: '雙子瞭望', desc: '在城鎮中心旁免費建造兩座瞭望塔。' },
  muster: { name: '民兵集結', desc: '兩名民兵立即加入你的軍隊。每波開始時再來一名民兵。' },
  knights: { name: '舊日同盟', desc: '兩名騎士從鄰近領主處趕來，並帶來 100 食物與 100 黃金。' },
  champion: { name: '冠軍誓言', desc: '一名冠軍勇士向你的旗幟宣誓。所有士兵獲得 1 點護甲與 8% 生命值。' },
  'swift-muster': { name: '迅速集結', desc: '單位訓練速度 +30%。增援在塵埃落定前抵達。' },
  granary: { name: '糧倉儲備', desc: '農田食物產量 +50%。在城堡旁獲得兩塊免費農田。' },
  relic: { name: '狂怒聖物', desc: '城鎮中心與瞭望塔多射一支箭，裝填速度 +40%。' },
  iron: { name: '鋼鐵紀律', desc: '每名士兵生命值 +16%，每波結束後恢復 15 生命值。' },
  wall: { name: '石之守護', desc: '城鎮中心生命值 +500，並在波次之間緩慢自我修復。' },
  forest: { name: '伐木權', desc: '伐木工效率 +30%。立即獲得 120 木材。' },
  feast: { name: '獵人盛宴', desc: '覓食者食物採集速度 +30%。立即獲得 150 食物。' },
  gold: { name: '黃金礦脈', desc: '礦工黃金採集速度 +35%。立即獲得 150 黃金。' },
  population: { name: '人民旗幟', desc: '人口上限 +15。無需房屋。' }
};

const META_ZH = [
  { name: '老兵旗幟', desc: '每場戰役開始時多一名村民。' },
  { name: '戰爭寶箱', desc: '每場戰役開始時多 100 木材與食物。' },
  { name: '石之守護', desc: '城鎮中心初始生命值 +20%。' },
  { name: '騎兵巡邏', desc: '每場戰役開始時多一名斥候騎兵。' }
];

const ORIGINALS = {
  ages: AGES.map(age => ({ name: age.name, short: age.short, unlocks: [...age.unlocks] })),
  units: Object.fromEntries(Object.entries(UNITS).map(([id, def]) => [id, { name: def.name, desc: def.desc }])),
  enemies: Object.fromEntries(Object.entries(ENEMIES).map(([id, def]) => [id, { name: def.name, desc: def.desc }])),
  buildings: Object.fromEntries(Object.entries(BUILDINGS).map(([id, def]) => [id, { name: def.name, desc: def.desc }])),
  waves: WAVES.map(wave => ({ title: wave.title, subtitle: wave.subtitle, note: wave.note })),
  boons: Object.fromEntries(BOONS.map(boon => [boon.id, { name: boon.name, desc: boon.desc }])),
  meta: META_UNLOCKS.map(item => ({ name: item.name, desc: item.desc })),
  difficulty: { ...DIFFICULTY_LABELS }
};

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] === undefined ? match : String(vars[key]));
}

export function t(text, vars) {
  if (text === undefined || text === null) return '';
  const template = current === 'zh' ? (ZH[text] ?? text) : text;
  return interpolate(template, vars);
}

export const tr = t;

export function hasTranslation(text) {
  return Object.prototype.hasOwnProperty.call(ZH, text);
}

export function getLang() {
  return current;
}

export function setLang(lang) {
  if (lang !== 'zh' && lang !== 'en') return;
  current = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  applyDataLanguage();
  applyDocumentTranslations();
  for (const listener of listeners) listener(current);
}

export function onLanguageChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initI18n() {
  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch {}
  current = stored === 'en' || stored === 'zh' ? stored : 'zh';
  document.documentElement.lang = current === 'zh' ? 'zh-Hant' : 'en';
  applyDataLanguage();
  applyDocumentTranslations();
}

function applyDataLanguage() {
  const zh = current === 'zh';
  AGES.forEach((age, index) => {
    const source = zh ? AGE_ZH[index] : ORIGINALS.ages[index];
    age.name = source.name;
    age.short = source.short;
    age.unlocks = [...source.unlocks];
  });
  for (const [id, def] of Object.entries(UNITS)) {
    const source = zh ? UNIT_ZH[id] : ORIGINALS.units[id];
    def.name = source.name;
    def.desc = source.desc;
  }
  for (const [id, def] of Object.entries(ENEMIES)) {
    const source = zh ? ENEMY_ZH[id] : ORIGINALS.enemies[id];
    def.name = source.name;
    def.desc = source.desc;
  }
  for (const [id, def] of Object.entries(BUILDINGS)) {
    const source = zh ? BUILDING_ZH[id] : ORIGINALS.buildings[id];
    def.name = source.name;
    def.desc = source.desc;
  }
  WAVES.forEach((wave, index) => {
    const source = zh ? WAVE_ZH[index] : ORIGINALS.waves[index];
    wave.title = source.title;
    wave.subtitle = source.subtitle;
    wave.note = source.note;
  });
  for (const boon of BOONS) {
    const source = zh ? BOON_ZH[boon.id] : ORIGINALS.boons[boon.id];
    boon.name = source.name;
    boon.desc = source.desc;
  }
  META_UNLOCKS.forEach((item, index) => {
    const source = zh ? META_ZH[index] : ORIGINALS.meta[index];
    item.name = source.name;
    item.desc = source.desc;
  });
  DIFFICULTY_LABELS.calm = zh ? '平靜' : ORIGINALS.difficulty.calm;
  DIFFICULTY_LABELS.danger = zh ? '掠奪者蠢動' : ORIGINALS.difficulty.danger;
  DIFFICULTY_LABELS.battle = zh ? '戰鬥爆發' : ORIGINALS.difficulty.battle;
}

export function applyDocumentTranslations(root = document) {
  for (const element of root.querySelectorAll('[data-i18n]')) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of root.querySelectorAll('[data-i18n-html]')) {
    element.innerHTML = t(element.dataset.i18nHtml);
  }
  for (const element of root.querySelectorAll('[data-i18n-title]')) {
    element.title = t(element.dataset.i18nTitle);
  }
  for (const element of root.querySelectorAll('[data-i18n-aria]')) {
    element.setAttribute('aria-label', t(element.dataset.i18nAria));
  }
  document.title = t('Age of Empires II: Roguelite');
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = t('A medieval roguelite RTS: build your keep, muster an army, and survive five escalating waves.');
}

export function roleLabel(role) {
  return t(role);
}

export function resourceLabel(type) {
  const key = { food: 'Food', wood: 'Wood', gold: 'Gold', stone: 'Stone', pop: 'Population' }[type];
  return key ? t(key) : type;
}

export function resourceShort(type) {
  if (current === 'zh') return { food: '食', wood: '木', gold: '金', stone: '石' }[type] || type;
  return { food: 'F', wood: 'W', gold: 'G', stone: 'S' }[type] || type;
}

export function nodeResourceLabel(type) {
  return t(type);
}

export function costText(cost = {}) {
  const entries = Object.entries(cost);
  if (!entries.length) return t('Free');
  return entries.map(([type, amount]) => `${amount} ${resourceLabel(type)}`).join(', ');
}

export function localizeEntities(game) {
  if (!game) return;
  for (const unit of game.units || []) {
    const def = unit.team === 'enemy' ? ENEMIES[unit.kind] : UNITS[unit.kind];
    if (def) unit.name = def.name;
  }
  for (const building of game.buildings || []) {
    const def = BUILDINGS[building.kind];
    if (def) building.name = def.name;
  }
}
