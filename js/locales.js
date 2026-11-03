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
  'app.title': 'Age of Empires II: Riftwatch',
  'game.title': 'Age of Empires II: Riftwatch',
  'game.series': 'Age of Empires II:',
  'game.subtitle': 'Riftwatch',
  'game.kicker': 'AGE OF EMPIRES II',
  'brand.short': 'AOE II · RIFTWATCH',
  'a11y.battlefield': 'Age of Empires II: Riftwatch battlefield',
  'menu.lede': 'The Rift has opened. Ten raids stand between your people and the Confluence.',
  'menu.civ': 'Civilization',
  'menu.biome': 'Biome',
  'menu.language': 'Language',
  'menu.seed': 'Seed',
  'menu.seedPlaceholder': 'random',
  'menu.seedHint': 'Same seed, same frontier.',
  "rules.open": "Run rules",
  "rules.title": "This run",
  "rules.objective": "Protect the Town Center and survive all raids. These are the current standard campaign rules.",
  "difficulty.title": "Difficulty",
  "difficulty.easy": "Easy",
  "difficulty.normal": "Normal",
  "difficulty.hard": "Hard",
  "difficulty.hint": "Changes ordinary enemy numbers and preparation time; Boss attributes stay unchanged.",
  "difficulty.values": "Ordinary forces {forces}% · preparation {prep}%",
  "cycle.choose": "New Game+: keep up to 3 cards",
  "cycle.reset": "A new frontier resets resources, buildings and technology. A cavalry flank arrives at 25 seconds each wave.",
  "cycle.start": "Start New Game+",
  "cycle.label": "Cycle {cycle}",
  "cycle.modifier": "Cavalry flank: {count} at 25s",
  "selection.hintResource": "Select a villager, then right-click this resource to gather.",
  "rules.campaign": "Campaign",
  "rules.waves": "{count} raids · Boss raids: {boss}",
  "rules.population": "Population",
  "rules.caps": "Economy: {economic} · Military: {military}",
  "rules.limited": "up to {cap}, also limited by buildings",
  "rules.buildings": "capacity provided by completed buildings",
  "rules.aids": "Auto-stewards",
  "rules.aidValues": "Economy: {economy} · Military: {military}",
  "rules.on": "On",
  "rules.off": "Off",
  'menu.seedRandomize': 'Generate another seed',
  'menu.start': 'Start Game',
  'menu.howto': 'How to Play',
  'menu.continue': 'Continue',
  'menu.settings': 'Settings',
  'menu.gm': 'GM',
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
  'hud.economic': 'Eco',
  'hud.military': 'Mil',
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
  'selection.counter.P': 'Strong against cavalry and elephants',
  'selection.counter.K': 'Strong against archers and horse archers',
  'selection.counter.C': 'Strong against siege and support',
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
  "pause.econDesc": "Assign idle villagers and spend food to train workers; build houses manually.",
  'pause.milTitle': 'War steward',
  'pause.milDesc': 'Auto-train soldiers and keep the barracks busy',
  'pause.resume': 'Resume',
  'pause.restart': 'Restart Run',
  'pause.quit': 'Abandon to Menu',
  'pause.save': 'Save Run',
  'pause.settings': 'Settings',
  'pause.gm': 'GM Tools',
  'settings.kicker': 'THE WAR COUNCIL',
  'settings.title': 'Settings',
  'group.label': "Groups",
  'group.slot': "Group {slot}: {count} units",
  'group.hint': "Click selects; Ctrl+click stores; Shift adds; right-click clears group.",
  'settings.groups': "Control group buttons",
  'settings.groupsDesc': "Show clickable slots; keyboard group shortcuts remain available.",
  'settings.uiScale': 'UI text size',
  'settings.uiScaleDesc': 'Enlarges interface text; game speed and map zoom stay unchanged.',
  'order.attackMove': 'Attack-Move',
  'order.guard': 'Guard',
  'order.patrol': 'Patrol',
  'order.hint': 'Shift+A/G/P then click; Ctrl+1–9 store, Alt+1–9 recall.',
  'settings.flavor': 'Shape the pace of the campaign. Changes are saved for your next run.',
  'settings.speed': 'Game speed',
  'settings.speedDesc': 'Scales simulation time without changing combat math.',
  'settings.speedSlow': '0.75×',
  'settings.speedNormal': '1×',
  'settings.speedFast': '1.25×',
  'settings.speedFastest': '1.5×',
  'settings.reducedMotion': 'Reduce motion',
  'settings.reducedMotionDesc': 'Shorten interface transitions and decorative animation.',
  'settings.close': 'Return',
  'settings.reset': 'Reset to defaults',
  'gm.kicker': 'GAME MASTER',
  'gm.title': 'GM Tools',
  'gm.flavor': 'Testing controls only. GM actions are recorded for this run.',
  'gm.startNote': 'Resource grants apply when the next run starts. Combat controls require an active run.',
  'gm.grant': 'Grant resources',
  'gm.heal': 'Heal all',
  'gm.kill': 'Clear raiders',
  'gm.age': 'Advance age',
  'gm.wave': 'Skip wave',
  'gm.spawn': 'Spawn militia',
  'gm.close': 'Return',
  'boon.kicker': 'THE RAID IS BROKEN',
  'boon.title': 'Choose Your Boon',
  'boon.desc': 'One gift of the old kingdom. It will shape the raids to come.',
  'boon.claim': 'Claim Boon',
  'boon.reroll': 'Reroll · {cost} {gold}',
  'boon.rerollTooltip': 'Spend {cost} gold for a new hand of three cards.',
  'boon.hint': 'Press {keys} to choose',
  'boon.ownedNone': 'None yet',
  'boon.ownedSummary': 'Your boons ({count}/{max}): {names}',
  'boon.key': 'KEY {n}',
  'rarity.COMMON': 'COMMON',
  'rarity.RARE': 'RARE',
  'rarity.LEGENDARY': 'LEGENDARY',
  'rarity.LEGACY': 'LEGACY',
  'end.winKicker': '{biome} IS YOURS',
  'end.winTitle': '{civ} — {game}',
  'end.winDesc': '{count} raids broken beneath the banner of {civ}. The chronicles will remember this stand.',
  'end.lossKicker': 'THE RIFT CLOSES',
  'end.lossTitle': '{game} — The Last Hearth Fails',
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
  'command.buildPage': 'More',
  'command.buildPageTooltip': 'Show the next building page ({page}/{total})',
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
  'toast.midBreak': 'Mid-campaign breather: 75 seconds to rebuild before the next raid.',
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
  'toast.noEligibleAttackers': 'The selected units cannot attack that target.',
  'toast.guardInvalid': 'Choose another allied unit or building to guard.',
  'toast.guardPartial': 'Villagers cannot guard; their current orders continue.',
  'toast.tacticalPartial': 'Villagers cannot follow this tactical order; their current orders continue.',
  'toast.marked': '{name} marked. Your soldiers deal 10% more damage to it for 6s.',
  'toast.aegisCooldown': 'Aegis is ready in {seconds}s.',
  'toast.aegisShields': 'Aegis shields {count} soldiers for 60 for 5s.',
  'toast.heroUnavailable': 'The Riftwarden is unavailable.',
  'toast.heroControl': 'Riftwarden under direct control: WASD move, Q mark, E aegis, Tab release.',
  'toast.controlReleased': 'Direct control released.',
  'toast.retreat': 'The Retreat Standard is raised. Your host is restored.',
  'toast.waveRetreat': 'Enemies begin orderly withdrawal. No kill rewards for retreating units.',
  'toast.waveCleanup': 'Wave cleanup complete. Remaining threats carry over.',
  'toast.bossExtensionWarning': 'The nemesis prepares a final stand. Extension in 30 seconds.',
  'toast.bossExtension': 'The nemesis calls reinforcements! Extension phase begins.',
  'toast.bossReinforcement': 'Reinforcement wave {count} arrives.',
  'toast.bossTimeout': 'The nemesis was not defeated in time.',
  'toast.demolishRefund': 'Building demolished. {pct}% refunded: {name}.',
  'toast.repairDelayed': 'Repair delayed. Wait 3 seconds after taking damage.',
  'toast.repairDelayed': 'Repair delayed. Wait 3 seconds after taking damage.',
  'toast.cancelRefund': 'Construction cancelled. {pct}% refunded: {name}.',
  'toast.cancelRefund': 'Construction cancelled. {pct}% refunded: {name}.',
  'toast.demolishRefund': 'Building demolished. {pct}% refunded: {name}.',
  'toast.saracenRepaid': 'Saracen loan repaid. Credit restored.',
  'toast.saracenDefault': 'Saracen loan defaulted. No further loans available.',
  'toast.saracenLoan': 'Saracen loan granted: 100 gold. Repay 115 next wave.',
  'toast.ottomanAmmo': 'Ammunition supply paid. Gunpowder reloads normal.',
  'toast.ottomanNoAmmo': 'Ammunition unpaid. Gunpowder reloads 15% slower.',
  'toast.spanishStun': 'Villager stuns enemy!',
  'toast.persianElephantTurn': 'War elephant turns slowly.',
  'toast.persianRepairCost': 'War elephant repairs cost more.',
  'toast.japaneseBlock': 'Attack blocked!',
  'biomeEvent.sidewindWarning': 'Crosswind approaching. Arrow speed will be reduced.',
  'biomeEvent.sidewind': 'Crosswind! Arrow speed reduced by 15%.',
  'biomeEvent.regrowthWarning': 'Forest regrowth beginning.',
  'biomeEvent.regrowth': 'Felled trees are regrowing.',
  'biomeEvent.sandstormWarning': 'Sandstorm approaching. Vision will be reduced.',
  'biomeEvent.sandstorm': 'Sandstorm! Vision reduced by 20%.',
  'biomeEvent.floodWarning': 'Flood warning. Lowland farms will pause.',
  'biomeEvent.flood': 'Flood! Lowland farms paused.',
  'biomeEvent.iceWarning': 'Ice cracking imminent.',
  'biomeEvent.iceCrack': 'Ice cracking! Units on ice take damage.',
  'biomeEvent.ashfallWarning': 'Ashfall imminent. Seek shelter.',
  'biomeEvent.ashfall': 'Ashfall! Environmental damage outside core radius.',
  'toast.elephantLocked': 'War elephants require a civilization or card that unlocks them.',
  'toast.notEnough': 'Not enough resources for {name}.',
  'toast.popLimit': 'Population limit reached. Raise more houses.',
  'toast.queueFull': 'Training queue is full.',
  'toast.noIdle': 'No idle villagers.',
  'toast.stewardEnabled': '{name} enabled.',
  'toast.stewardPaused': '{name} paused.',
  'toast.runSaved': 'Run saved.',
  'toast.runSaveFailed': 'Unable to save the run.',
  'toast.runLoaded': 'Run loaded.',
  'toast.noSave': 'No saved run to continue.',
  'toast.runLoadFailed': 'Unable to load the saved run.',
  'toast.gmNeedsRun': 'Start or continue a run to use GM tools.',
  'toast.gmGranted': 'Resources granted.',
  'toast.gmHealed': 'All friendly forces healed.',
  'toast.gmCleared': 'Raiders cleared.',
  'toast.gmAge': 'The realm enters the {age}.',
  'toast.gmWave': 'Wave skipped.',
  'toast.gmNoWave': 'Skip wave is available during a raid.',
  'toast.gmSpawned': 'Five militia have arrived.',
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



const STANCES = {
  en: ['Aggressive', 'Defensive', 'Hold Position', 'Passive'],
  'zh-Hant': ['積極進攻', '防禦', '堅守位置', '被動'],
  'zh-Hans': ['积极进攻', '防御', '坚守位置', '被动'],
  ja: ['積極攻撃', '防御', '位置を維持', '非攻撃'],
};
for (const [locale, labels] of Object.entries(STANCES)) {
  ['aggressive', 'defensive', 'hold', 'passive'].forEach((key, i) => { STRINGS[locale][`stance.${key}`] = labels[i]; });
}

for (const [locale, label] of Object.entries({en:'Cycle stance: Aggressive / Defensive / Hold Position / Passive', 'zh-Hant':'切換姿態：積極進攻／防禦／堅守位置／被動', 'zh-Hans':'切换姿态：积极进攻／防御／坚守位置／被动', ja:'姿勢を切替：積極攻撃／防御／位置を維持／非攻撃'})) STRINGS[locale]['stance.cycle'] = label;

const CIV_TRAINING_TEXT={"en": ["Chu Ko Nu", "Repeating Crossbow", "Chinese repeating crossbow infantry. Third-shot bonus bolt; Archery Range, Feudal Age.", "Requires {age}", "More Troops"], "zh-Hant": ["諸葛弩兵", "連弩步兵", "中國連弩步兵，每第三次射擊追加弩箭；封建時代於射箭場訓練。", "需要{age}", "更多兵種"], "zh-Hans": ["诸葛弩兵", "连弩步兵", "中国连弩步兵，每第三次射击追加弩箭；封建时代于射箭场训练。", "需要{age}", "更多兵种"], "ja": ["連弩兵", "連弩歩兵", "中国の連弩歩兵。3射ごとに追加矢。封建時代から射手育成所で訓練。", "{age}が必要", "他の兵種"]};
for(const [locale,labels] of Object.entries(CIV_TRAINING_TEXT))['unit.chu_ko_nu.name','unit.chu_ko_nu.role','unit.chu_ko_nu.desc','training.ageRequired','training.page'].forEach((key,i)=>STRINGS[locale][key]=labels[i]);
const RALLY_TEXT={"en": ["Right-click passable ground or a resource to set rally point. New villagers gather at resource rallies.", "Clear Rally", "Choose passable ground or an available resource."], "zh-Hant": ["右鍵點擊可通行地面或資源以設定集結點；新村民會採集指定資源。", "清除集結點", "請選擇可通行地面或可用資源。"], "zh-Hans": ["右键点击可通行地面或资源设置集结点；新村民会采集指定资源。", "清除集结点", "请选择可通行地面或可用资源。"], "ja": ["通行可能な地面か資源を右クリックして集合地点を設定。新しい村人は指定資源を採集します。", "集合地点を解除", "通行可能な地面か利用可能な資源を選んでください。"]};
for(const [locale,labels] of Object.entries(RALLY_TEXT))['hint','clear','invalid'].forEach((key,i)=>STRINGS[locale]['rally.'+key]=labels[i]);

for(const [locale,label] of Object.entries({en:'Waiting for clear ground to deploy', 'zh-Hant':'等待可用空間部署', 'zh-Hans':'等待可用空间部署', ja:'配置できる空間を待っています'}))STRINGS[locale]['rally.spawnBlocked']=label;

const PLAYTEST_TEXT={en:['Playtest build','Known issues','Download Bug JSON','Close','Review exported diagnostics before sharing. No automatic upload.'],'zh-Hant':['測試版本','已知問題','下載 Bug JSON','關閉','分享前請檢查匯出資料；不會自動上傳。'],'zh-Hans':['测试版本','已知问题','下载 Bug JSON','关闭','分享前请检查导出数据；不会自动上传。'],ja:['テスト版','既知の問題','Bug JSONを保存','閉じる','共有前に診断情報を確認してください。自動送信しません。']};
for(const [locale,labels] of Object.entries(PLAYTEST_TEXT))['title','known','export','close','privacy'].forEach((key,i)=>STRINGS[locale]['playtest.'+key]=labels[i]);

const READINESS={en:['Verifying {done}/{total}…','Build verification failed'],'zh-Hant':['校驗資源 {done}/{total}…','版本校驗失敗'],'zh-Hans':['校验资源 {done}/{total}…','版本校验失败'],ja:['検証中 {done}/{total}…','ビルド検証に失敗']};
for(const [locale,v]of Object.entries(READINESS)){STRINGS[locale]['playtest.verifying']=v[0];STRINGS[locale]['playtest.blocked']=v[1];}

const STEWARD_TEXT={"en": ["Steward plans", "Manual orders take priority. Changes apply after saving; opening this panel pauses simulation.", "Reserve", "Idle", "Confirm", "Waiting for budget", "Constructing", "Unavailable / blocked", "Training", "Population limit", "Economy", "Gathering strategy", "Balanced", "Food first", "Wood first", "Gold first", "Stone first", "Custom", "Worker target", "Age advancement", "Manual", "Ask first", "Automatic", "Release idle workers to steward", "Building plans", "Counts include construction. Placement respects terrain, approach lanes and available workers. Zero means no automatic building.", "Building / unit", "Mode", "Target / maximum", "Priority / ratio", "Minimum workers", "Off", "Military production", "Army plan", "Counter visible enemies", "Defense first", "Each building overrides the global plan. Manual queues take priority. Resource reserves apply before automatic spending.", "Queue limit", "Apply changes, resume play, then reopen to confirm eligible proposals.", "Save plans", "Close without saving"], "zh-Hant": ["總管規劃", "手動命令優先。儲存後套用設定；開啟此面板會暫停模擬。", "預留", "待命", "等待確認", "等待預算", "施工中", "不可用／受阻", "訓練中", "人口已滿", "經濟", "採集策略", "均衡", "食物優先", "木材優先", "黃金優先", "石材優先", "自訂", "村民目標數", "時代升級", "手動", "先詢問", "自動", "將閒置村民交還總管", "建築計畫", "數量包含施工中建築。選址避開地形、進攻道路並檢查可用村民；零表示不自動建造。", "建築／兵種", "模式", "目標／上限", "優先級／比例", "最低村民數", "停用", "軍事生產", "全軍方案", "反制已見敵軍", "防守優先", "逐建築設定優先於全軍方案。手動佇列優先；所有自動支出先扣除預留。", "佇列上限", "儲存並繼續遊戲；條件達成後，重新開啟以確認提案。", "儲存規劃", "關閉不儲存"], "zh-Hans": ["总管规划", "手动命令优先。保存后应用设置；打开此面板会暂停模拟。", "预留", "待命", "等待确认", "等待预算", "施工中", "不可用／受阻", "训练中", "人口已满", "经济", "采集策略", "均衡", "食物优先", "木材优先", "黄金优先", "石材优先", "自定义", "村民目标数", "时代升级", "手动", "先询问", "自动", "将闲置村民交还总管", "建筑计划", "数量包含施工中建筑。选址避开地形、进攻道路并检查可用村民；零表示不自动建造。", "建筑／兵种", "模式", "目标／上限", "优先级／比例", "最低村民数", "停用", "军事生产", "全军方案", "反制已见敌军", "防守优先", "逐建筑设置优先于全军方案。手动队列优先；所有自动支出先扣除预留。", "队列上限", "保存并继续游戏；条件达成后，重新打开以确认提案。", "保存规划", "关闭不保存"], "ja": ["執事の計画", "手動命令を優先。保存後に設定を適用。この画面ではシミュレーションを一時停止します。", "確保資源", "待機", "確認待ち", "予算待ち", "建設中", "使用不可／経路障害", "訓練中", "人口上限", "経済", "採集方針", "均衡", "食料優先", "木材優先", "金優先", "石優先", "カスタム", "村人の目標数", "時代進化", "手動", "確認する", "自動", "待機中の村人を執事に戻す", "建設計画", "建設中も数に含みます。地形、進軍路、作業員を確認。ゼロは自動建設なし。", "建物／兵種", "モード", "目標／上限", "優先度／比率", "必要な村人数", "無効", "軍事生産", "軍全体の方針", "見えている敵への対抗", "防御優先", "建物別設定と手動キューを優先。自動支出の前に資源を確保します。", "キュー上限", "保存して再開し、条件達成後に再び開いて提案を確認します。", "計画を保存", "保存せず閉じる"]};
const STEWARD_KEYS=["title", "help", "reserve", "idle", "confirm", "budget", "building", "blocked", "training", "population", "economy", "gather", "balanced", "food", "wood", "gold", "stone", "custom", "villagers", "age", "manual", "ask", "auto", "release", "buildings", "buildHelp", "type", "mode", "max", "priority", "workers", "off", "military", "army", "counter", "defense", "milHelp", "queue", "confirmHelp", "apply", "close"];
for(const [locale,values]of Object.entries(STEWARD_TEXT))STEWARD_KEYS.forEach((key,i)=>STRINGS[locale]["steward."+key]=values[i]);

export const EN_KEYS = Object.keys(STRINGS.en);
