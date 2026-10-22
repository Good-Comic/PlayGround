import { AGE_NAMES, BIOMES, BOONS, BUILDING_TYPES, CIVILIZATIONS, UNIT_TYPES, WAVES } from './data.js';
import { EVENT_MODULES } from './events.js';
import { content as zhHantContent, ui as zhHantUi } from './locales/zh-Hant.js';
import { content as zhHansContent, ui as zhHansUi } from './locales/zh-Hans.js';
import { content as jaContent, ui as jaUi } from './locales/ja.js';

export const LOCALE_META = {
  en: { label: 'English', short: 'EN' },
  'zh-Hant': { label: '繁體中文', short: '繁' },
  'zh-Hans': { label: '简体中文', short: '简' },
  ja: { label: '日本語', short: '日' },
};

const CAMP_NAMES = ['The Northern Pyres', 'The Red Camp', 'The Broken Causeway', 'The Sunken Fens'];
const TACTIC_LABELS = {
  ranged: 'Screen the Archers',
  cavalry: 'Brace the Line',
  tower: 'Sunder the Towers',
  map: 'Contest the Frontier',
  worker: 'Harry the Villagers',
};

function englishContent() {
  const out = {};
  for (const civ of CIVILIZATIONS) {
    out[`civ.${civ.id}.name`] = civ.name;
    out[`civ.${civ.id}.epithet`] = civ.epithet;
    out[`civ.${civ.id}.trait`] = civ.trait;
  }
  for (const biome of BIOMES) {
    out[`biome.${biome.id}.name`] = biome.name;
    out[`biome.${biome.id}.trait`] = biome.trait;
  }
  AGE_NAMES.forEach((name, index) => {
    if (index) out[`age.${index}`] = name;
  });
  for (const [id, def] of Object.entries(UNIT_TYPES)) {
    out[`unit.${id}.name`] = def.name;
    out[`unit.${id}.role`] = def.role;
    if (def.desc) out[`unit.${id}.desc`] = def.desc;
  }
  for (const [id, def] of Object.entries(BUILDING_TYPES)) {
    out[`building.${id}.name`] = def.name;
    if (def.shortName) out[`building.${id}.shortName`] = def.shortName;
    if (def.desc) out[`building.${id}.desc`] = def.desc;
  }
  BOONS.forEach((boon, index) => {
    out[`boon.${boon.id}.name`] = boon.name;
    out[`boon.${boon.id}.desc`] = boon.desc;
  });
  WAVES.forEach((wave, index) => {
    out[`wave.${index}.name`] = wave.name;
    out[`wave.${index}.sub`] = wave.sub;
  });
  for (const event of Object.values(EVENT_MODULES)) {
    out[`event.${event.id}.name`] = event.name;
    out[`event.${event.id}.desc`] = event.desc;
  }
  CAMP_NAMES.forEach((name, index) => { out[`camp.${index}`] = name; });
  for (const [id, label] of Object.entries(TACTIC_LABELS)) out[`tactic.${id}`] = label;
  return out;
}

const EN_UI = {
  'app.title': 'Riftwatch — Confluence Empires',
  'a11y.battlefield': 'Riftwatch battlefield',
  'menu.kicker': 'CONFLUENCE EMPIRES',
  'menu.lede': 'The Rift has opened. Ten raids stand between your people and the Confluence.',
  'menu.civ': 'Civilization',
  'menu.biome': 'Biome',
  'menu.language': 'Language',
  'menu.seed': 'Seed',
  'menu.seedPlaceholder': 'random',
  'menu.seedHint': 'Same seed, same frontier.',
  'menu.start': 'Start Game',
  'menu.howto': 'How to Play',
  'menu.factCivs': 'CIVILIZATIONS',
  'menu.factRaids': 'RAIDS',
  'menu.factBoons': 'BOONS',
  'menu.tipMove': 'to march',
  'menu.tipCommand': 'to command',
  'menu.tipHero': 'to lead the hero',
  'menu.seal': 'EST. 1152',
  'menu.quote': '“Where the worlds touch, someone must stand watch.”',
  'menu.quoteSource': '— The Confluence Chronicle',
  'menu.footerLeft': 'An original 2D real-time roguelite',
  'menu.footerRight': 'Stand watch at the Rift',
  'hud.sound': 'Sound',
  'hud.toggleSound': 'Toggle sound',
  'hud.pause': 'Pause',
  'hud.pauseTitle': 'Pause (Space)',
  'resource.food': 'Food',
  'resource.wood': 'Wood',
  'resource.gold': 'Gold',
  'resource.stone': 'Stone',
  'resource.population': 'Population',
  'wave.kicker': 'WAVE {wave} OF {total}',
  'wave.upon': 'THE RAID IS UPON YOU',
  'wave.choose': 'Choose a boon',
  'wave.endures': 'RIFTWATCH ENDURES',
  'wave.confluence': 'The Confluence Is Yours',
  'wave.closes': 'THE RIFT CLOSES',
  'wave.lastHearth': 'The Last Hearth Fails',
  'wave.foeOne': '{count} FOE',
  'wave.foeMany': '{count} FOES',
  'objective.title': 'THE LAST MARCH',
  'objective.survive': 'Survive the raids',
  'objective.defend': 'Defend the Town Center',
  'objective.age': 'Current age',
  'age.researching': '{age} · {seconds}s',
  'objective.boons': 'Boons claimed',
  'objective.assist': 'Difficulty assist',
  'objective.assistOff': 'HAZARD OFF',
  'objective.lost': 'LOST',
  'intel.kicker': 'SCOUT REPORT · NEXT RAID',
  'intel.mainForce': 'Main force',
  'intel.event': 'Raid event',
  'intel.gates': 'Likely gates',
  'intel.hazard': 'Riftfall hazard reported · {gates}',
  'intel.assistDisabled': 'Riftfall hazard disabled at low Town Center health. The announced host is unchanged.',
  'intel.assistToast': 'Difficulty assist: riftfall hazard disabled. The announced host is unchanged.',
  'boss.kicker': 'WARLORD OF THE RIFT',
  'placement.place': 'Place',
  'placement.cancel': 'Cancel',
  'placement.building': 'building',
  'selection.title': "Lord's Retinue",
  'selection.emptySub': 'Select a unit or building',
  'selection.emptyStatClick': 'Click a unit',
  'selection.emptyStatDrag': 'drag to select',
  'selection.emptyHint': 'Right-click resources to gather · Right-click enemies to attack',
  'selection.groupTitle': '{count} warriors',
  'selection.groupSelected': 'Selected company',
  'selection.groupUnderArms': 'under arms',
  'selection.groupVillagers': 'villagers',
  'selection.groupHint': 'Drag to add more · Right-click to move · 1 stop · 2 hold',
  'selection.raising': 'Raising · {percent}%',
  'selection.yourRealm': 'Your realm',
  'selection.enemyStronghold': 'Enemy stronghold',
  'selection.hintDropoff': 'Training hall · Right-click raiders to defend',
  'selection.hintPop': 'Provides shelter and population',
  'selection.hintTownCenter': 'Advance your age here · Right-click raiders to defend',
  'selection.hintBuilding': 'Your command post',
  'selection.hintVillager': 'Right-click a resource to gather · Build with the commands above',
  'selection.hintHero': 'Tab or Control to take direct command · Q mark · E aegis',
  'selection.hintUnit': 'Right-click an enemy to attack · Right-click ground to march',
  'selection.trainingProgress': 'Training {unit} · {seconds}s',
  'selection.hp': 'hp',
  'selection.pop': 'pop',
  'selection.atk': 'atk',
  'selection.range': 'range',
  'selection.armor': 'armor',
  'selection.melee': 'melee',
  'selection.training': 'Training:',
  'selection.carryType.food': 'food',
  'selection.carryType.wood': 'wood',
  'selection.carryType.gold': 'gold',
  'selection.carryType.stone': 'stone',
  'hud.idleWord': 'idle',
  'hud.idleTitle': 'Select idle villager (I)',
  'camera.march': 'march',
  'camera.zoom': 'zoom',
  'minimap.day': 'DAY {day}',
  'minimap.ally': 'Your realm',
  'minimap.foe': 'Raiders',
  'minimap.tip': 'Click to survey',
  'howto.kicker': 'THE WAR COUNCIL',
  'howto.title': 'How to Rule',
  'howto.close': 'Close',
  'howto.gatherTitle': 'Gather',
  'howto.gatherDesc': 'Select villagers and right-click trees, berries, gold, or stone. They haul every load back to the Town Center.',
  'howto.buildTitle': 'Build',
  'howto.buildDesc': 'With villagers selected, choose a structure from the command panel, then place it on open ground.',
  'howto.fightTitle': 'Fight',
  'howto.fightDesc': 'Select your soldiers and right-click a raider to attack. Idle troops defend themselves; towers rain arrows.',
  'howto.endureTitle': 'Endure',
  'howto.endureDesc': 'Survive ten raids. After each victory, claim one of three boons to shape your kingdom’s fate.',
  'howto.pan': 'pan',
  'howto.select': 'select',
  'howto.command': 'command',
  'howto.hero': 'control hero',
  'howto.marks': 'mark / aegis',
  'howto.panSuffix': ' / arrows — pan',
  'howto.selectSuffix': ' — select',
  'howto.commandSuffix': ' — command',
  'howto.heroSuffix': ' — control hero',
  'howto.marksSuffix': ' — mark / aegis',
  'howto.commandKeysSuffix': ' — commands · ',
  'howto.pauseSuffix': ' pause',
  'howto.play': 'To Arms',
  'pause.kicker': 'THE BATTLE WAITS',
  'pause.title': 'Paused',
  'pause.flavor': '“Hold the line. The Rift will settle.”',
  'pause.econTitle': 'Village steward',
  'pause.econDesc': 'Auto-assign idle villagers and maintain houses',
  'pause.milTitle': 'War steward',
  'pause.milDesc': 'Auto-train soldiers and keep the barracks busy',
  'pause.resume': 'Resume',
  'pause.restart': 'Restart Run',
  'pause.quit': 'Abandon to Menu',
  'boon.kicker': 'THE RAID IS BROKEN',
  'boon.title': 'Choose Your Boon',
  'boon.desc': 'One gift of the old kingdom. It will shape the raids to come.',
  'boon.claim': 'Claim Boon',
  'boon.reroll': 'Reroll · {cost} {gold}',
  'boon.rerollTooltip': 'Spend {cost} gold for a new hand of three cards.',
  'boon.hint': 'Press {keys} to choose',
  'boon.key': 'KEY {n}',
  'rarity.COMMON': 'COMMON',
  'rarity.RARE': 'RARE',
  'rarity.LEGENDARY': 'LEGENDARY',
  'rarity.LEGACY': 'LEGACY',
  'end.winKicker': '{biome} IS YOURS',
  'end.winTitle': 'A Crown of {civ}',
  'end.winDesc': '{count} raids broken beneath the banner of {civ}. The chronicles will remember this stand.',
  'end.lossKicker': 'THE RIFT CLOSES',
  'end.lossTitle': 'The Last Hearth Fails',
  'end.lossDesc': 'The Town Center has fallen. Your kingdom returns to embers.',
  'end.raids': 'Raids survived',
  'end.kills': 'Raiders slain',
  'end.gathered': 'Resources gathered',
  'end.reign': 'Reign',
  'end.newRun': 'New Run',
  'end.menu': 'Return to Menu',
  'end.frontier': 'THE FRONTIER',
  'end.yourRealm': 'your realm',
  'status.gathering': 'Gathering {resource}',
  'status.hauling': 'Hauling to the Town Center',
  'status.building': 'Building {name}',
  'status.combat': 'In combat',
  'status.marching': 'Marching',
  'status.holding': 'Holding ground',
  'status.raider': 'Raider',
  'status.awaiting': 'Awaiting orders',
  'status.structure': 'structure',
  'tooltip.remaining': '{resource} · {count} remaining',
  'tooltip.hp': '{hp} / {max} HP',
  'tooltip.teamYou': 'Your realm',
  'tooltip.teamEnemy': 'Enemy',
  'resourceName.pine': 'Pine Stand',
  'resourceName.oak': 'Oak Stand',
  'resourceName.gold': 'Gold Vein',
  'resourceName.stone': 'Stone Outcrop',
  'resourceName.berry': 'Berry Bush',
  'resourceName.sheep': 'Sheep',
  'resourceName.resource': 'Resource',
  'resourceType.food': 'Food',
  'resourceType.wood': 'Wood',
  'resourceType.gold': 'Gold',
  'resourceType.stone': 'Stone',
  'resourceShort.food': 'F',
  'resourceShort.wood': 'W',
  'resourceShort.gold': 'G',
  'resourceShort.stone': 'S',
  'command.advance': 'Advance Age',
  'command.advanceTooltip': 'Advance to the {age} — {cost} · 20s/30s research',
  'command.advancing': 'Advancing',
  'command.advancingTooltip': 'Researching the {age}. Ready in {seconds}s.',
  'command.trainTooltip': 'Train {unit} — {cost} · {time}s',
  'command.buildTooltip': 'Build {name} — {cost} · {time}s',
  'command.control': 'Control',
  'command.release': 'Release',
  'command.controlTooltip': 'Take direct control of the Riftwarden (Tab). WASD move · Q mark · E aegis.',
  'command.mark': 'Mark',
  'command.markTooltip': 'Mark a nearby enemy: your soldiers deal 10% more damage for 6s. Cooldown 30s.',
  'command.aegis': 'Aegis',
  'command.aegisTooltip': 'Shield nearby soldiers for 60 damage for 5s. Cooldown 60s.',
  'command.stop': 'Stop',
  'command.stopTooltip': 'Halt current orders (1)',
  'command.hold': 'Hold',
  'command.holdTooltip': 'Hold ground and defend (2)',
  'portrait.warParty': 'War Party',
  'portrait.yourRealm': 'Your Realm',
  'portrait.raiderCamp': 'Raider Camp',
  'toast.intro': 'Ten raids stand between {civ} and the rift. Hold the Town Center.',
  'toast.heroReady': 'Your Riftwarden is ready. Press Tab for direct control, Q to mark, E for aegis.',
  'toast.stewardActive': 'An auto-steward is active. Your pause menu can turn aid on or off.',
  'toast.prototype': 'A Rift Prototype wakes beneath the keep.',
  'toast.heroGold': 'The Riftwarden waits for 100 gold to return.',
  'toast.heroReturn': 'The Riftwarden returns to the field.',
  'toast.bossStrike': '{name} calls down a rift strike. Move!',
  'toast.bossPhase': '{name} enters phase {stage}.',
  'toast.buildingComplete': '{name} completed.',
  'toast.rescue': 'The Rescue Writ burns. An elite is pulled back from death.',
  'toast.destroyed': '{name} destroyed!',
  'toast.heroFallen': 'The Riftwarden has fallen. They will return in 30 seconds if you hold.',
  'toast.converted': 'A raider rises under your banner.',
  'toast.bossBroken': '{name} is broken.',
  'toast.raidersApproach': 'Raiders approach from {gates}.',
  'toast.bossEntered': '{name} has entered the field.',
  'toast.enraged': 'The raid is enraged. They will not tire.',
  'toast.spoils': 'Raid broken. Spoils: +{food} food, +{wood} wood, +{gold} gold.',
  'toast.boonClaimed': 'Boon claimed: {name}.',
  'toast.rerollNeeds': 'Rerolling needs {cost} gold.',
  'toast.duelWon': "Champion slain. Your hero gains a 60 shield.",
  'toast.notEnoughBuild': 'Not enough resources for {name}.',
  'toast.selectVillager': 'Select a villager to raise this structure.',
  'toast.cannotPlace': 'Cannot raise that structure here.',
  'toast.underConstruction': '{name} under construction.',
  'toast.imperial': 'Your realm has reached the Imperial Age.',
  'toast.advanceNeeds': 'Advancing needs {costs}.',
  'toast.ageResearch': 'Researching the {age} — {seconds}s. Protect the Town Center.',
  'toast.ageResearching': 'The age advance is already in progress ({seconds}s remaining).',
  'toast.ageEntered': 'The realm enters the {age}. Soldiers grow stronger.',
  'toast.heroMissing': 'The Riftwarden is not on the field.',
  'toast.markCooldown': 'Mark is ready in {seconds}s.',
  'toast.noMarkTarget': 'No raider within reach of the mark.',
  'toast.marked': '{name} marked. Your soldiers deal 10% more damage to it for 6s.',
  'toast.aegisCooldown': 'Aegis is ready in {seconds}s.',
  'toast.aegisShields': 'Aegis shields {count} soldiers for 60 for 5s.',
  'toast.heroUnavailable': 'The Riftwarden is unavailable.',
  'toast.heroControl': 'Riftwarden under direct control: WASD move, Q mark, E aegis, Tab release.',
  'toast.controlReleased': 'Direct control released.',
  'toast.retreat': 'The Retreat Standard is raised. Your host is restored.',
  'toast.elephantLocked': 'War elephants require a civilization or card that unlocks them.',
  'toast.notEnough': 'Not enough resources for {name}.',
  'toast.popLimit': 'Population limit reached. Raise more houses.',
  'toast.queueFull': 'Training queue is full.',
  'toast.noIdle': 'No idle villagers.',
  'toast.stewardEnabled': '{name} enabled.',
  'toast.stewardPaused': '{name} paused.',
  'float.raised': '{name} raised',
  'steward.economy': 'Village steward',
  'steward.military': 'War steward',
};

const EN_CONTENT = englishContent();

function flattenContent(content) {
  const out = {};
  for (const [id, entry] of Object.entries(content.civ || {})) {
    for (const field of ['name', 'epithet', 'trait']) {
      if (entry[field] != null) out[`civ.${id}.${field}`] = entry[field];
    }
  }
  for (const [id, entry] of Object.entries(content.biome || {})) {
    for (const field of ['name', 'trait']) {
      if (entry[field] != null) out[`biome.${id}.${field}`] = entry[field];
    }
  }
  for (const [level, name] of Object.entries(content.age || {})) out[`age.${level}`] = name;
  for (const [id, entry] of Object.entries(content.unit || {})) {
    for (const field of ['name', 'role', 'desc']) {
      if (entry[field] != null) out[`unit.${id}.${field}`] = entry[field];
    }
  }
  for (const [id, entry] of Object.entries(content.building || {})) {
    for (const field of ['name', 'shortName', 'desc']) {
      if (entry[field] != null) out[`building.${id}.${field}`] = entry[field];
    }
  }
  for (const [id, entry] of Object.entries(content.boon || {})) {
    for (const field of ['name', 'desc']) {
      if (entry[field] != null) out[`boon.${id}.${field}`] = entry[field];
    }
  }
  for (const [index, entry] of Object.entries(content.wave || {})) {
    for (const field of ['name', 'sub']) {
      if (entry[field] != null) out[`wave.${index}.${field}`] = entry[field];
    }
  }
  for (const [id, entry] of Object.entries(content.event || {})) {
    for (const field of ['name', 'desc']) {
      if (entry[field] != null) out[`event.${id}.${field}`] = entry[field];
    }
  }
  (content.camp || []).forEach((name, index) => { out[`camp.${index}`] = name; });
  for (const [id, label] of Object.entries(content.tactic || {})) out[`tactic.${id}`] = label;
  return out;
}

const ZH_HANT_UI = zhHantUi;
const ZH_HANT_CONTENT = flattenContent(zhHantContent);
const ZH_HANS_UI = zhHansUi;
const ZH_HANS_CONTENT = flattenContent(zhHansContent);
const JA_UI = jaUi;
const JA_CONTENT = flattenContent(jaContent);

export const STRINGS = {
  en: { ...EN_UI, ...EN_CONTENT },
  'zh-Hant': { ...ZH_HANT_UI, ...ZH_HANT_CONTENT },
  'zh-Hans': { ...ZH_HANS_UI, ...ZH_HANS_CONTENT },
  ja: { ...JA_UI, ...JA_CONTENT },
};

export const EN_KEYS = Object.keys(STRINGS.en);
