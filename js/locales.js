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

for(const [locale,label]of Object.entries({en:'Assign workers; configure building and age plans in Steward plans.', 'zh-Hant':'分派村民；於總管規劃設定建築與時代升級。','zh-Hans':'分派村民；在总管规划设置建筑与时代升级。',ja:'村人を配置。執事の計画で建設と時代進化を設定。'}))STRINGS[locale]['pause.econDesc']=label;

const CODEX_TEXT={"zh-Hant": {"codex.entry": "科技／圖鑑", "codex.title": "帝國科技與文明圖鑑", "codex.cards": "文明恩賜圖鑑", "codex.tech": "三系統科技樹", "codex.close": "關閉", "codex.viewCiv": "文明說明", "codex.currentCiv": "本局文明：{name}", "codex.theme": "功能", "codex.rarity": "稀有度", "codex.state": "狀態", "codex.all": "全部", "codex.overview": "全覽三張候選", "codex.allCards": "全部卡牌", "codex.zoomIn": "放大卡牌樹", "codex.zoomOut": "縮小卡牌樹", "codex.offered": "本次候選", "codex.owned": "已擁有", "codex.recommended": "文明建議", "codex.legend": "①②③ 本次候選 · ✓ 金色已擁有 · 藍邊文明建議 · 虛線僅為主題關聯，非研究前置；篩選仍保留候選。", "codex.panHelp": "拖曳空白處平移，捲動查看，Ctrl＋滾輪縮放", "codex.sharedPool": "全文明共用隨機池；建議不改機率，也不保證出現或額外疊加。", "codex.economy": "經濟與建設", "codex.infantry": "步兵與徵召", "codex.cavalry": "騎兵與士氣", "codex.ranged": "遠程與彈道", "codex.defense": "攻城與守禦", "codex.rift": "特種與裂境", "codex.military": "軍務總管", "codex.tactics": "戰術 AI", "codex.free": "免費控制，無研究費", "codex.control": "現有控制 · 已開放", "codex.prototype": "設計候選 · 尚未定案", "codex.undecided": "未批准，不能研究", "codex.researched": "已研究／已達成", "codex.researching": "研究中", "codex.available": "可研究", "codex.locked": "尚未滿足條件", "codex.cost": "實際費用", "codex.era": "參考時代分組", "codex.none": "正式開局", "codex.darkReference": "基礎／黑暗（展示層）", "codex.eraNote": "四層展示對照原型；本局正式時代為封建、城堡、帝王。基本控制免費開放，不受展示欄位鎖定；只有上方實線是正式時代前置。", "codex.controlHelp": "無付費研究或額外文明限制；功能沿用正式兵種、建築與視野規則。展示連線不建立新前置。", "codex.prototypeHelp": "僅展示附件設計候選。尚無正式費用、能力及前置批准；不可花費資源，也不會解鎖效果。", "codex.openPlans": "管理現有總管設定", "codex.researchAge": "依正式規則升級時代", "codex.ageDetail": "前置：{age}；需存活城心、足夠資源且沒有其他時代研究。正式研究時間 {seconds} 模擬秒。", "codex.advice.economy": "可配合採集、訓練或建設；請依卡牌的實際作用對象規劃。", "codex.advice.infantry": "步兵構築建議：只對卡牌明列的部隊與效果生效。", "codex.advice.cavalry": "可支援騎兵或部隊續戰；先確認此文明與目前規則可用的兵種。", "codex.advice.ranged": "遠程構築建議：依正式射擊與命中機制運作，不保證額外乘算。", "codex.advice.defense": "可配合守城、建築或攻城部隊；各卡作用範圍以完整效果為準。", "codex.advice.rift": "特殊或英雄構築建議；仍受卡牌所列條件與正式效果限制。", "codex.advice.shared": "這張卡供所有文明抽取；是否適合取決於目前部隊與構築。", "codex.advice.cavalryLimit": "此文明的現行規則限制騎兵；純騎兵增益可能沒有有效對象。", "codex.advice.boltCaution": "中國特性與此卡都涉及副箭；不保證額外疊加，不改既有規則，請依實際效果判斷。", "codex.tech.gather": "採集策略", "codex.tech.workers": "自動村民", "codex.tech.build": "初級建造", "codex.tech.ratios": "四資源配比", "codex.tech.reserves": "資源預留", "codex.tech.conditions": "條件建造", "codex.tech.reassign": "動態轉派", "codex.tech.autoage": "自動升時代", "codex.tech.dispatch": "施工調度", "codex.tech.masterplan": "經濟總規劃", "codex.tech.imperialreserve": "帝國儲備", "codex.tech.smarttown": "智能城鎮", "codex.tech.barracks": "軍營基礎", "codex.tech.range": "靶場管理", "codex.tech.stable": "馬廄管理", "codex.tech.perbuilding": "逐建築設定", "codex.tech.targets": "生產目標", "codex.tech.budget": "軍費預算", "codex.tech.replenish": "戰損補編", "codex.tech.unitupgrade": "兵種升級", "codex.tech.rally": "前線集結", "codex.tech.army": "全軍編制", "codex.tech.counter": "反制生產", "codex.tech.mobilize": "帝國動員", "codex.tech.acquire": "索敵基礎", "codex.tech.factions": "敵我辨識", "codex.tech.manual": "手動優先", "codex.tech.spearcounter": "槍騎克制", "codex.tech.cavalrycounter": "騎射克制", "codex.tech.leash": "有限追擊", "codex.tech.threat": "威脅評分", "codex.tech.formation": "陣型保持", "codex.tech.vision": "戰場視野", "codex.tech.coordination": "目標協同", "codex.tech.presets": "戰術預案", "codex.tech.command": "戰場統御", "codex.desc.gather": "設定四資源分工比例；總管只調派未鎖定工人，先交付攜帶資源。", "codex.desc.ratios": "設定四資源分工比例；總管只調派未鎖定工人，先交付攜帶資源。", "codex.desc.workers": "城心依人口、資源與目標數自動訓練村民，沿用正式費用及佇列。", "codex.desc.build": "設定自動、詢問或停用建築計畫，以及數量、工人、時代與優先級條件。", "codex.desc.conditions": "設定自動、詢問或停用建築計畫，以及數量、工人、時代與優先級條件。", "codex.desc.reserves": "只限制自動支出的實際資源；玩家手動支出優先，自動升級保留費用加庫存底線。", "codex.desc.budget": "只限制自動支出的實際資源；玩家手動支出優先，自動升級保留費用加庫存底線。", "codex.desc.reassign": "逐人重算採集缺額；空手且未鎖定工人採12模擬秒滯後，避免反覆轉派。", "codex.desc.autoage": "手動、先詢問或自動升級；使用正式城心、費用、研究時間及時代規則。", "codex.desc.dispatch": "其他可達村民可接手受困工人；每次最多12次尋路並保存續查位置。", "codex.desc.barracks": "需有完成且可用的對應生產建築；只生產文明與時代允許的正式兵種。", "codex.desc.range": "需有完成且可用的對應生產建築；只生產文明與時代允許的正式兵種。", "codex.desc.stable": "需有完成且可用的對應生產建築；只生產文明與時代允許的正式兵種。", "codex.desc.perbuilding": "逐建築設定合法兵種、權重、存活及排隊目標與佇列上限；手動佇列優先。", "codex.desc.targets": "逐建築設定合法兵種、權重、存活及排隊目標與佇列上限；手動佇列優先。", "codex.desc.replenish": "逐建築設定合法兵種、權重、存活及排隊目標與佇列上限；手動佇列優先。", "codex.desc.rally": "選取生產建築後右鍵設定合法地面或資源集結點；新村民可直接採集。", "codex.desc.army": "均衡、反制可見敵軍、防守與自訂編制；逐建築設定及手動命令優先。", "codex.desc.counter": "均衡、反制可見敵軍、防守與自訂編制；逐建築設定及手動命令優先。", "codex.desc.acquire": "依正式克制、距離、威脅、生命與冷卻評分；保留目標黏著、視野及不可達限制。", "codex.desc.threat": "依正式克制、距離、威脅、生命與冷卻評分；保留目標黏著、視野及不可達限制。", "codex.desc.factions": "友軍青色圓環、敵軍橙色菱形；大型單位有徽記，不改文明服飾或傷害。", "codex.desc.manual": "明確移動／攻擊優先；手動停止的村民保持鎖定，交還總管後才自動調派。", "codex.desc.spearcounter": "槍兵在合理索敵範圍內偏好騎兵，傷害沿用既有克制表，不擅自增加數值。", "codex.desc.cavalrycounter": "騎兵可優先追逐附近弓兵；不為遠方目標無條件離陣，不增加傷害倍率。", "codex.desc.leash": "防禦姿態、護衛、巡邏與攻擊移動沿用既有範圍及手動命令優先規則。", "codex.desc.vision": "玩家可見性與雙方偵測遵守戰爭迷霧；沙暴降低有效視野20%，持續20模擬秒。", "codex.desc.imperialreserve": "附件中的進階設計示意，尚未實作為獨立正式科技。", "codex.desc.mobilize": "附件中的進階設計示意，尚未實作為獨立正式科技。", "codex.desc.presets": "附件中的進階設計示意，尚未實作為獨立正式科技。", "codex.desc.command": "附件中的進階設計示意，尚未實作為獨立正式科技。", "codex.desc.formation": "附件中的進階設計示意，尚未實作為獨立正式科技。", "codex.desc.coordination": "附件中的進階設計示意，尚未實作為獨立正式科技。", "codex.desc.smarttown": "附件中的進階設計示意，尚未實作為獨立正式科技。", "codex.desc.masterplan": "附件中的進階設計示意，尚未實作為獨立正式科技。", "codex.desc.unitupgrade": "附件中的進階設計示意，尚未實作為獨立正式科技。", "codex.keys": "1／2／3 聚焦 · Ctrl＋Enter 明確領取"}, "zh-Hans": {"codex.entry": "科技／图鉴", "codex.title": "帝国科技与文明图鉴", "codex.cards": "文明恩赐图鉴", "codex.tech": "三系统科技树", "codex.close": "关闭", "codex.viewCiv": "文明说明", "codex.currentCiv": "本局文明：{name}", "codex.theme": "功能", "codex.rarity": "稀有度", "codex.state": "状态", "codex.all": "全部", "codex.overview": "全览三张候选", "codex.allCards": "全部卡牌", "codex.zoomIn": "放大卡牌树", "codex.zoomOut": "缩小卡牌树", "codex.offered": "本次候选", "codex.owned": "已拥有", "codex.recommended": "文明建议", "codex.legend": "①②③ 本次候选 · ✓ 金色已拥有 · 蓝边文明建议 · 虚线仅为主题关联，非研究前置；筛选仍保留候选。", "codex.panHelp": "拖曳空白处平移，滚动查看，Ctrl＋滚轮缩放", "codex.sharedPool": "全文明共用随机池；建议不改概率，也不保证出现或额外叠加。", "codex.economy": "经济与建设", "codex.infantry": "步兵与征召", "codex.cavalry": "骑兵与士气", "codex.ranged": "远程与弹道", "codex.defense": "攻城与守御", "codex.rift": "特种与裂境", "codex.military": "军务总管", "codex.tactics": "战术 AI", "codex.free": "免费控制，无研究费", "codex.control": "现有控制 · 已开放", "codex.prototype": "设计候选 · 尚未定案", "codex.undecided": "未批准，不能研究", "codex.researched": "已研究／已达成", "codex.researching": "研究中", "codex.available": "可研究", "codex.locked": "尚未满足条件", "codex.cost": "实际费用", "codex.era": "参考时代分组", "codex.none": "正式开局", "codex.darkReference": "基础／黑暗（展示层）", "codex.eraNote": "四层展示对照原型；本局正式时代为封建、城堡、帝王。基本控制免费开放，不受展示栏位锁定；只有上方实线是正式时代前置。", "codex.controlHelp": "无付费研究或额外文明限制；功能沿用正式兵种、建筑与视野规则。展示连线不建立新前置。", "codex.prototypeHelp": "仅展示附件设计候选。尚无正式费用、能力及前置批准；不可花费资源，也不会解锁效果。", "codex.openPlans": "管理现有总管设置", "codex.researchAge": "依正式规则升级时代", "codex.ageDetail": "前置：{age}；需存活城心、足够资源且没有其他时代研究。正式研究时间 {seconds} 模拟秒。", "codex.advice.economy": "可配合采集、训练或建设；请依卡牌的实际作用对象规划。", "codex.advice.infantry": "步兵构筑建议：只对卡牌明列的部队与效果生效。", "codex.advice.cavalry": "可支援骑兵或部队续战；先确认此文明与当前规则可用的兵种。", "codex.advice.ranged": "远程构筑建议：依正式射击与命中机制运作，不保证额外乘算。", "codex.advice.defense": "可配合守城、建筑或攻城部队；各卡作用范围以完整效果为准。", "codex.advice.rift": "特殊或英雄构筑建议；仍受卡牌所列条件与正式效果限制。", "codex.advice.shared": "这张卡供所有文明抽取；是否适合取决于当前部队与构筑。", "codex.advice.cavalryLimit": "此文明的现行规则限制骑兵；纯骑兵增益可能没有有效对象。", "codex.advice.boltCaution": "中国特性与此卡都涉及副箭；不保证额外叠加，不改既有规则，请依实际效果判断。", "codex.tech.gather": "采集策略", "codex.tech.workers": "自动村民", "codex.tech.build": "初级建造", "codex.tech.ratios": "四资源配比", "codex.tech.reserves": "资源预留", "codex.tech.conditions": "条件建造", "codex.tech.reassign": "动态转派", "codex.tech.autoage": "自动升时代", "codex.tech.dispatch": "施工调度", "codex.tech.masterplan": "经济总规划", "codex.tech.imperialreserve": "帝国储备", "codex.tech.smarttown": "智能城镇", "codex.tech.barracks": "军营基础", "codex.tech.range": "靶场管理", "codex.tech.stable": "马厩管理", "codex.tech.perbuilding": "逐建筑设置", "codex.tech.targets": "生产目标", "codex.tech.budget": "军费预算", "codex.tech.replenish": "战损补编", "codex.tech.unitupgrade": "兵种升级", "codex.tech.rally": "前线集结", "codex.tech.army": "全军编制", "codex.tech.counter": "反制生产", "codex.tech.mobilize": "帝国动员", "codex.tech.acquire": "索敌基础", "codex.tech.factions": "敌我辨识", "codex.tech.manual": "手动优先", "codex.tech.spearcounter": "枪骑克制", "codex.tech.cavalrycounter": "骑射克制", "codex.tech.leash": "有限追击", "codex.tech.threat": "威胁评分", "codex.tech.formation": "阵型保持", "codex.tech.vision": "战场视野", "codex.tech.coordination": "目标协同", "codex.tech.presets": "战术预案", "codex.tech.command": "战场统御", "codex.desc.gather": "设置四资源分工比例；总管只调派未锁定工人，先交付携带资源。", "codex.desc.ratios": "设置四资源分工比例；总管只调派未锁定工人，先交付携带资源。", "codex.desc.workers": "城心依人口、资源与目标数自动训练村民，沿用正式费用及队列。", "codex.desc.build": "设置自动、询问或停用建筑计划，以及数量、工人、时代与优先级条件。", "codex.desc.conditions": "设置自动、询问或停用建筑计划，以及数量、工人、时代与优先级条件。", "codex.desc.reserves": "只限制自动支出的实际资源；玩家手动支出优先，自动升级保留费用加库存底线。", "codex.desc.budget": "只限制自动支出的实际资源；玩家手动支出优先，自动升级保留费用加库存底线。", "codex.desc.reassign": "逐人重算采集缺额；空手且未锁定工人采用12模拟秒滞后，避免反复转派。", "codex.desc.autoage": "手动、先询问或自动升级；使用正式城心、费用、研究时间及时代规则。", "codex.desc.dispatch": "其他可达村民可接手受困工人；每次最多12次寻路并保存续查位置。", "codex.desc.barracks": "需有完成且可用的对应生产建筑；只生产文明与时代允许的正式兵种。", "codex.desc.range": "需有完成且可用的对应生产建筑；只生产文明与时代允许的正式兵种。", "codex.desc.stable": "需有完成且可用的对应生产建筑；只生产文明与时代允许的正式兵种。", "codex.desc.perbuilding": "逐建筑设置合法兵种、权重、存活及排队目标与队列上限；手动队列优先。", "codex.desc.targets": "逐建筑设置合法兵种、权重、存活及排队目标与队列上限；手动队列优先。", "codex.desc.replenish": "逐建筑设置合法兵种、权重、存活及排队目标与队列上限；手动队列优先。", "codex.desc.rally": "选取生产建筑后右键设置合法地面或资源集结点；新村民可直接采集。", "codex.desc.army": "均衡、反制可见敌军、防守与自定义编制；逐建筑设置及手动命令优先。", "codex.desc.counter": "均衡、反制可见敌军、防守与自定义编制；逐建筑设置及手动命令优先。", "codex.desc.acquire": "依正式克制、距离、威胁、生命与冷却评分；保留目标黏着、视野及不可达限制。", "codex.desc.threat": "依正式克制、距离、威胁、生命与冷却评分；保留目标黏着、视野及不可达限制。", "codex.desc.factions": "友军青色圆环、敌军橙色菱形；大型单位有徽记，不改文明服饰或伤害。", "codex.desc.manual": "明确移动／攻击优先；手动停止的村民保持锁定，交还总管后才自动调派。", "codex.desc.spearcounter": "枪兵在合理索敌范围内偏好骑兵，伤害沿用既有克制表，不擅自增加数值。", "codex.desc.cavalrycounter": "骑兵可优先追逐附近弓兵；不为远方目标无条件离阵，不增加伤害倍率。", "codex.desc.leash": "防御姿态、护卫、巡逻与攻击移动沿用既有范围及手动命令优先规则。", "codex.desc.vision": "玩家可见性与双方侦测遵守战争迷雾；沙暴降低有效视野20%，持续20模拟秒。", "codex.desc.imperialreserve": "附件中的进阶设计示意，尚未实作为独立正式科技。", "codex.desc.mobilize": "附件中的进阶设计示意，尚未实作为独立正式科技。", "codex.desc.presets": "附件中的进阶设计示意，尚未实作为独立正式科技。", "codex.desc.command": "附件中的进阶设计示意，尚未实作为独立正式科技。", "codex.desc.formation": "附件中的进阶设计示意，尚未实作为独立正式科技。", "codex.desc.coordination": "附件中的进阶设计示意，尚未实作为独立正式科技。", "codex.desc.smarttown": "附件中的进阶设计示意，尚未实作为独立正式科技。", "codex.desc.masterplan": "附件中的进阶设计示意，尚未实作为独立正式科技。", "codex.desc.unitupgrade": "附件中的进阶设计示意，尚未实作为独立正式科技。", "codex.keys": "1／2／3 聚焦 · Ctrl＋Enter 明确领取"}, "en": {"codex.entry": "Tech / Codex", "codex.title": "Empire Tech & Civilization Codex", "codex.cards": "Boon Codex", "codex.tech": "Three-System Tech Tree", "codex.close": "Close", "codex.viewCiv": "Civilization", "codex.currentCiv": "Playing: {name}", "codex.theme": "Theme", "codex.rarity": "Rarity", "codex.state": "State", "codex.all": "All", "codex.overview": "Fit all three offers", "codex.allCards": "All cards", "codex.zoomIn": "Zoom in", "codex.zoomOut": "Zoom out", "codex.offered": "Current offers", "codex.owned": "Owned", "codex.recommended": "Suggested", "codex.legend": "①②③ Offers · ✓ Gold: owned · Blue edge: suggested · Dashed theme links are not prerequisites. Filters retain offers.", "codex.panHelp": "Drag empty space to pan; scroll; Ctrl+wheel to zoom", "codex.sharedPool": "Shared random pool for every civilization. Advice changes no odds and guarantees neither offers nor extra stacking.", "codex.economy": "Economy & Building", "codex.infantry": "Infantry & Levies", "codex.cavalry": "Cavalry & Morale", "codex.ranged": "Ranged & Projectiles", "codex.defense": "Siege & Defense", "codex.rift": "Special & Rift", "codex.military": "War Steward", "codex.tactics": "Tactical AI", "codex.free": "Free control; no research fee", "codex.control": "Existing control · available", "codex.prototype": "Design candidate · unapproved", "codex.undecided": "Unapproved; cannot research", "codex.researched": "Researched / reached", "codex.researching": "Researching", "codex.available": "Available to research", "codex.locked": "Requirements not met", "codex.cost": "Actual cost", "codex.era": "Reference-era grouping", "codex.none": "Native start", "codex.darkReference": "Foundation / Dark (reference)", "codex.eraNote": "Four display tiers follow the reference. Native ages are Feudal, Castle and Imperial. Basic controls are free regardless of column; only the solid age chain is a real prerequisite.", "codex.controlHelp": "No paid research or extra civilization gate. Native unit, building and sight rules apply. Display associations add no prerequisites.", "codex.prototypeHelp": "Reference design candidate only. No approved fees, abilities or prerequisites; no resource spending or gameplay unlock.", "codex.openPlans": "Manage existing steward plans", "codex.researchAge": "Advance age under native rules", "codex.ageDetail": "Prerequisite: {age}; requires a living town center, enough resources and no ongoing age research. Native duration: {seconds} simulation seconds.", "codex.advice.economy": "May support economy, training or construction; follow the card’s actual affected targets.", "codex.advice.infantry": "Infantry build advice: applies only to the units and effects named on the card.", "codex.advice.cavalry": "May support cavalry or army sustain; check the civilization’s currently legal units.", "codex.advice.ranged": "Ranged build advice follows native firing and hit rules; extra multiplication is not guaranteed.", "codex.advice.defense": "May support defense, buildings or siege; the complete card effect defines its scope.", "codex.advice.rift": "Special/hero build advice remains subject to the card’s native conditions and effects.", "codex.advice.shared": "Available to every civilization; suitability depends on your actual army and build.", "codex.advice.cavalryLimit": "This civilization restricts cavalry; a cavalry-only bonus may have no eligible target.", "codex.advice.boltCaution": "China and this card both involve extra bolts. No extra stacking is promised; existing rules remain unchanged.", "codex.tech.gather": "Gathering strategy", "codex.tech.workers": "Automatic workers", "codex.tech.build": "Basic construction", "codex.tech.ratios": "Resource ratios", "codex.tech.reserves": "Resource reserves", "codex.tech.conditions": "Conditional building", "codex.tech.reassign": "Worker reassignment", "codex.tech.autoage": "Automatic ages", "codex.tech.dispatch": "Builder dispatch", "codex.tech.masterplan": "Economic masterplan", "codex.tech.imperialreserve": "Imperial reserves", "codex.tech.smarttown": "Smart town", "codex.tech.barracks": "Barracks basics", "codex.tech.range": "Archery management", "codex.tech.stable": "Stable management", "codex.tech.perbuilding": "Per-building plans", "codex.tech.targets": "Production targets", "codex.tech.budget": "Military reserves", "codex.tech.replenish": "Replenishment", "codex.tech.unitupgrade": "Unit upgrades", "codex.tech.rally": "Rally points", "codex.tech.army": "Army plans", "codex.tech.counter": "Counter production", "codex.tech.mobilize": "Imperial mobilization", "codex.tech.acquire": "Target acquisition", "codex.tech.factions": "Faction identity", "codex.tech.manual": "Manual priority", "codex.tech.spearcounter": "Spear vs cavalry", "codex.tech.cavalrycounter": "Cavalry vs archers", "codex.tech.leash": "Pursuit limits", "codex.tech.threat": "Threat scoring", "codex.tech.formation": "Formation keeping", "codex.tech.vision": "Battlefield sight", "codex.tech.coordination": "Target coordination", "codex.tech.presets": "Tactical plans", "codex.tech.command": "Battlefield command", "codex.desc.gather": "Configure four-resource ratios. Only unlocked workers are assigned; carried resources are delivered first.", "codex.desc.ratios": "Configure four-resource ratios. Only unlocked workers are assigned; carried resources are delivered first.", "codex.desc.workers": "Town-center worker training respects population, stock, target counts and native fees/queues.", "codex.desc.build": "Set automatic, ask or off building plans with count, worker, age and priority conditions.", "codex.desc.conditions": "Set automatic, ask or off building plans with count, worker, age and priority conditions.", "codex.desc.reserves": "Reserves constrain resources actually spent automatically. Manual spending takes priority; auto ages reserve fee plus stock floor.", "codex.desc.budget": "Reserves constrain resources actually spent automatically. Manual spending takes priority; auto ages reserve fee plus stock floor.", "codex.desc.reassign": "Recompute gathering deficits per worker; empty-handed unlocked workers use12-simulation-second hysteresis.", "codex.desc.autoage": "Manual, ask or automatic ages use native town-center, fee, research-time and age rules.", "codex.desc.dispatch": "Reachable villagers can replace blocked builders; at most12 path searches per call with a saved cursor.", "codex.desc.barracks": "Requires a completed usable producer; trains only units legal for the civilization and current age.", "codex.desc.range": "Requires a completed usable producer; trains only units legal for the civilization and current age.", "codex.desc.stable": "Requires a completed usable producer; trains only units legal for the civilization and current age.", "codex.desc.perbuilding": "Per-building legal units, weights, alive-plus-queued targets and queue caps; manual queues take priority.", "codex.desc.targets": "Per-building legal units, weights, alive-plus-queued targets and queue caps; manual queues take priority.", "codex.desc.replenish": "Per-building legal units, weights, alive-plus-queued targets and queue caps; manual queues take priority.", "codex.desc.rally": "Select a producer and right-click legal ground/resources to set rally; new workers can gather directly.", "codex.desc.army": "Balanced, visible-enemy counter, defense or custom plans; per-building settings and manual orders take priority.", "codex.desc.counter": "Balanced, visible-enemy counter, defense or custom plans; per-building settings and manual orders take priority.", "codex.desc.acquire": "Scores native counters, distance, threat, health and cooldown while preserving stickiness, sight and path limits.", "codex.desc.threat": "Scores native counters, distance, threat, health and cooldown while preserving stickiness, sight and path limits.", "codex.desc.factions": "Cyan allied circles and orange enemy diamonds, with large-unit badges; no outfit or damage change.", "codex.desc.manual": "Explicit movement/attack takes priority. Manually stopped workers stay locked until released to the steward.", "codex.desc.spearcounter": "Spears prefer cavalry within valid acquisition range; damage follows the existing counter table.", "codex.desc.cavalrycounter": "Cavalry can prefer nearby archers without unlimited pursuit or new damage multipliers.", "codex.desc.leash": "Defensive stance, guard, patrol and attack-move retain native ranges and manual-order priority.", "codex.desc.vision": "Player visibility and both teams’ detection obey fog; sandstorms reduce effective sight20% for20simulation seconds.", "codex.desc.imperialreserve": "Advanced reference concept, not implemented as a separate native technology.", "codex.desc.mobilize": "Advanced reference concept, not implemented as a separate native technology.", "codex.desc.presets": "Advanced reference concept, not implemented as a separate native technology.", "codex.desc.command": "Advanced reference concept, not implemented as a separate native technology.", "codex.desc.formation": "Advanced reference concept, not implemented as a separate native technology.", "codex.desc.coordination": "Advanced reference concept, not implemented as a separate native technology.", "codex.desc.smarttown": "Advanced reference concept, not implemented as a separate native technology.", "codex.desc.masterplan": "Advanced reference concept, not implemented as a separate native technology.", "codex.desc.unitupgrade": "Advanced reference concept, not implemented as a separate native technology.", "codex.keys": "1/2/3 focus · Ctrl+Enter explicitly claims"}, "ja": {"codex.entry": "技術・図鑑", "codex.title": "帝国技術・文明図鑑", "codex.cards": "恩恵図鑑", "codex.tech": "三系統技術ツリー", "codex.close": "閉じる", "codex.viewCiv": "文明の説明", "codex.currentCiv": "現在の文明：{name}", "codex.theme": "機能", "codex.rarity": "レア度", "codex.state": "状態", "codex.all": "すべて", "codex.overview": "候補3枚を一覧", "codex.allCards": "全カード", "codex.zoomIn": "拡大", "codex.zoomOut": "縮小", "codex.offered": "今回の候補", "codex.owned": "所持", "codex.recommended": "文明の提案", "codex.legend": "①②③ 候補・✓金色：所持・青枠：提案。点線はテーマの関連で研究条件ではありません。候補はフィルター後も表示。", "codex.panHelp": "余白をドラッグで移動、スクロール、Ctrl＋ホイールで拡大縮小", "codex.sharedPool": "全文明共通のランダムプール。提案で確率は変わらず、出現や追加の重複効果も保証しません。", "codex.economy": "経済・建設", "codex.infantry": "歩兵・徴募", "codex.cavalry": "騎兵・士気", "codex.ranged": "遠隔・弾道", "codex.defense": "攻城・防衛", "codex.rift": "特殊・裂境", "codex.military": "軍事執事", "codex.tactics": "戦術AI", "codex.free": "無料の操作・研究費なし", "codex.control": "実装済み・利用可能", "codex.prototype": "設計候補・未承認", "codex.undecided": "未承認・研究不可", "codex.researched": "研究・到達済み", "codex.researching": "研究中", "codex.available": "研究可能", "codex.locked": "条件未達成", "codex.cost": "実際の費用", "codex.era": "参考時代の分類", "codex.none": "正式な開始状態", "codex.darkReference": "基礎・暗黒（参考表示）", "codex.eraNote": "参考原型の4層表示。正式な時代は領主・城主・帝王です。基本操作は列に関係なく無料。上の実線の時代連鎖のみが正式な前提条件です。", "codex.controlHelp": "有料研究や追加文明制限はありません。正式な兵種・建物・視界規則に従い、表示の関連で新たな条件は追加しません。", "codex.prototypeHelp": "添付の設計候補のみ。費用・能力・前提条件は未承認で、資源消費も効果の解放もありません。", "codex.openPlans": "既存の執事設定を管理", "codex.researchAge": "正式規則で時代を進化", "codex.ageDetail": "前提：{age}。生存中の町の中心、必要資源、他の時代研究がないこと。正式研究時間は{seconds}シミュレーション秒。", "codex.advice.economy": "経済・訓練・建設を支援。実際の効果対象を確認してください。", "codex.advice.infantry": "歩兵構築の提案。カードに記載の部隊と効果にのみ適用。", "codex.advice.cavalry": "騎兵や継戦の支援。現在の文明と規則で利用できる兵種を確認。", "codex.advice.ranged": "遠隔構築の提案。正式な射撃・命中規則に従い、追加乗算は保証しません。", "codex.advice.defense": "防衛・建物・攻城を支援。適用範囲はカード全文を確認。", "codex.advice.rift": "特殊・英雄構築の提案。カード記載の条件と正式効果に従います。", "codex.advice.shared": "全文明が抽選対象。適性は実際の部隊と構築によります。", "codex.advice.cavalryLimit": "この文明は騎兵を制限。騎兵専用の強化は対象がいない場合があります。", "codex.advice.boltCaution": "中国特性とこのカードは追加矢に関係します。重複効果は保証せず、既存規則は変更しません。", "codex.tech.gather": "採集方針", "codex.tech.workers": "村人の自動訓練", "codex.tech.build": "基本建設", "codex.tech.ratios": "四資源の比率", "codex.tech.reserves": "資源確保", "codex.tech.conditions": "条件付き建設", "codex.tech.reassign": "作業員の再配置", "codex.tech.autoage": "時代の自動進化", "codex.tech.dispatch": "建設作業員の配置", "codex.tech.masterplan": "経済総合計画", "codex.tech.imperialreserve": "帝国備蓄", "codex.tech.smarttown": "知的な町", "codex.tech.barracks": "兵舎の基本", "codex.tech.range": "射手育成所管理", "codex.tech.stable": "騎兵育成所管理", "codex.tech.perbuilding": "建物別設定", "codex.tech.targets": "生産目標", "codex.tech.budget": "軍事予算", "codex.tech.replenish": "損耗補充", "codex.tech.unitupgrade": "兵種強化", "codex.tech.rally": "集合地点", "codex.tech.army": "軍全体の編成", "codex.tech.counter": "対抗生産", "codex.tech.mobilize": "帝国動員", "codex.tech.acquire": "索敵の基本", "codex.tech.factions": "敵味方の識別", "codex.tech.manual": "手動命令優先", "codex.tech.spearcounter": "槍と騎兵の相性", "codex.tech.cavalrycounter": "騎兵と射手の相性", "codex.tech.leash": "追撃の制限", "codex.tech.threat": "脅威評価", "codex.tech.formation": "陣形の維持", "codex.tech.vision": "戦場の視界", "codex.tech.coordination": "目標連携", "codex.tech.presets": "戦術計画", "codex.tech.command": "戦場統率", "codex.desc.gather": "四資源の比率を設定。手動固定のない村人のみ再配置し、運搬中の資源は先に納入。", "codex.desc.ratios": "四資源の比率を設定。手動固定のない村人のみ再配置し、運搬中の資源は先に納入。", "codex.desc.workers": "町の中心で人口・資源・目標数に応じ訓練。正式な費用とキューを使用。", "codex.desc.build": "建設を自動・確認・無効に設定し、数・作業員・時代・優先度の条件を指定。", "codex.desc.conditions": "建設を自動・確認・無効に設定し、数・作業員・時代・優先度の条件を指定。", "codex.desc.reserves": "自動支出の対象資源を確保。手動支出を優先し、自動時代進化では費用と最低備蓄を確保。", "codex.desc.budget": "自動支出の対象資源を確保。手動支出を優先し、自動時代進化では費用と最低備蓄を確保。", "codex.desc.reassign": "作業員ごとに不足を再計算。空荷で固定のない村人は12シミュレーション秒の待機で往復を抑制。", "codex.desc.autoage": "時代進化を手動・確認・自動に設定。正式な町の中心・費用・研究時間・時代規則を使用。", "codex.desc.dispatch": "到達できる村人が閉じ込められた作業員を代行。1回最大12経路探索で続行位置を保存。", "codex.desc.barracks": "完成した対応生産施設が必要。文明と時代で許可された正式兵種のみを訓練。", "codex.desc.range": "完成した対応生産施設が必要。文明と時代で許可された正式兵種のみを訓練。", "codex.desc.stable": "完成した対応生産施設が必要。文明と時代で許可された正式兵種のみを訓練。", "codex.desc.perbuilding": "建物別に合法兵種・重み・生存数＋待機数の目標・キュー上限を設定。手動キュー優先。", "codex.desc.targets": "建物別に合法兵種・重み・生存数＋待機数の目標・キュー上限を設定。手動キュー優先。", "codex.desc.replenish": "建物別に合法兵種・重み・生存数＋待機数の目標・キュー上限を設定。手動キュー優先。", "codex.desc.rally": "生産施設を選択し、通行可能地形や資源を右クリックで集合地点を設定。新村人は直接採集可能。", "codex.desc.army": "均衡・見える敵への対抗・防御・カスタム編成。建物別設定と手動命令を優先。", "codex.desc.counter": "均衡・見える敵への対抗・防御・カスタム編成。建物別設定と手動命令を優先。", "codex.desc.acquire": "正式な相性・距離・脅威・体力・待機時間を評価。目標維持・視界・経路制限を保持。", "codex.desc.threat": "正式な相性・距離・脅威・体力・待機時間を評価。目標維持・視界・経路制限を保持。", "codex.desc.factions": "味方は水色の円、敵は橙の菱形。大型ユニットに徽章を追加し、服装やダメージは変更しません。", "codex.desc.manual": "明示した移動・攻撃を優先。手動停止した村人は執事へ戻すまで自動配置されません。", "codex.desc.spearcounter": "有効な索敵範囲で槍兵は騎兵を優先。ダメージは既存の相性表に従います。", "codex.desc.cavalrycounter": "騎兵は近くの射手を優先できます。無制限追撃や新たなダメージ倍率は追加しません。", "codex.desc.leash": "防御姿勢・護衛・巡回・攻撃移動は既存範囲と手動優先規則に従います。", "codex.desc.vision": "表示と双方の索敵は戦場の霧に従い、砂嵐は20シミュレーション秒間、有効視界を20%低下。", "codex.desc.imperialreserve": "添付の上級設計例で、独立した正式技術としては未実装です。", "codex.desc.mobilize": "添付の上級設計例で、独立した正式技術としては未実装です。", "codex.desc.presets": "添付の上級設計例で、独立した正式技術としては未実装です。", "codex.desc.command": "添付の上級設計例で、独立した正式技術としては未実装です。", "codex.desc.formation": "添付の上級設計例で、独立した正式技術としては未実装です。", "codex.desc.coordination": "添付の上級設計例で、独立した正式技術としては未実装です。", "codex.desc.smarttown": "添付の上級設計例で、独立した正式技術としては未実装です。", "codex.desc.masterplan": "添付の上級設計例で、独立した正式技術としては未実装です。", "codex.desc.unitupgrade": "添付の上級設計例で、独立した正式技術としては未実装です。", "codex.keys": "1/2/3で選択・Ctrl+Enterで受領"}};
for(const [locale,labels]of Object.entries(CODEX_TEXT))Object.assign(STRINGS[locale],labels);

const CODEX_EXTRA={en:{'codex.claimNamed':'Claim: {name}','codex.producerStatus':'Completed producers: {count}. Legal unit list:'},'zh-Hant':{'codex.claimNamed':'領取：{name}','codex.producerStatus':'已完成生產建築：{count}。正式兵種：'},'zh-Hans':{'codex.claimNamed':'领取：{name}','codex.producerStatus':'已完成生产建筑：{count}。正式兵种：'},ja:{'codex.claimNamed':'受領：{name}','codex.producerStatus':'完成した生産施設：{count}。正式兵種：'}};
for(const [locale,labels]of Object.entries(CODEX_EXTRA))Object.assign(STRINGS[locale],labels);

for(const [locale,label]of Object.entries({en:'No cards match this filter. Current reward candidates remain visible.', 'zh-Hant':'沒有符合篩選的卡牌；本次獎勵候選仍會保留。','zh-Hans':'没有符合筛选的卡牌；本次奖励候选仍会保留。',ja:'条件に合うカードはありません。今回の報酬候補は表示を維持します。'}))STRINGS[locale]['codex.noMatches']=label;

export const EN_KEYS = Object.keys(STRINGS.en);

const PRODUCER_STATUS_TEXT={
  'zh-Hant':['自動生產狀態','已停用','手動生產優先','已達自動佇列上限','已達兵種目標（含佇列）','人口不足（含佇列）','等待資源／保留預算','等待下一次自動生產檢查','建築或所選兵種尚不可用'],
  'zh-Hans':['自动生产状态','已停用','手动生产优先','已达自动队列上限','已达兵种目标（含队列）','人口不足（含队列）','等待资源／保留预算','等待下一次自动生产检查','建筑或所选兵种尚不可用'],
  en:['Auto production','Disabled','Manual production has priority','Automatic queue limit reached','Unit targets met (including queues)','Population full (including queues)','Waiting for resources / reserved budget','Waiting for the next automatic production check','Building or selected units unavailable'],
  ja:['自動生産の状態','無効','手動生産を優先','自動キューの上限','兵種の目標数に到達（キュー含む）','人口上限（キュー含む）','資源・確保予算を待機','次の自動生産チェックを待機','建物または選択兵種が利用不可']
};
for(const [locale,labels] of Object.entries(PRODUCER_STATUS_TEXT))['label','off','manual','queue','target','population','budget','ready','unavailable'].forEach((key,i)=>STRINGS[locale]['steward.producer.'+key]=labels[i]);

const CAPACITY_PLAN_TEXT={
 'zh-Hant':['軍事餘額≤','預估可用軍事人口','納入已排隊軍隊與施工中建築的人口供給，仍受文明上限限制。空白不限制；經濟人口另計。','不限','等待人口條件'],
 'zh-Hans':['军事余量≤','预计可用军事人口','计入已排队军队与施工中建筑的人口供给，仍受文明上限限制。空白不限制；经济人口独立计算。','不限','等待人口条件'],
 en:['Military room ≤','Projected free military slots','Includes queued troops and capacity under construction, capped by civilization rules. Blank means unrestricted; economy population is separate.','Any','Waiting for population condition'],
 ja:['軍事余裕 ≤','予測軍事人口の空き','訓練待ち兵と建設中の人口供給を含み、文明の上限は維持。空欄は制限なし。経済人口は別枠です。','指定なし','人口条件を待機']
};
for(const[locale,labels]of Object.entries(CAPACITY_PLAN_TEXT))['room','roomNow','roomHelp','unlimited','capacity'].forEach((key,i)=>STRINGS[locale]['steward.'+key]=labels[i]);

for(const[locale,text]of Object.entries({
 'zh-Hant':'計畫條件已變更，已取消過期提案。請檢查村民、時代、人口與預留後重試。',
 'zh-Hans':'计划条件已变更，已取消过期提案。请检查村民、时代、人口与预留后重试。',
 en:'Plan conditions changed. The stale proposal was cancelled. Check workers, age, population and reserves before retrying.',
 ja:'計画条件が変わったため、古い提案を取り消しました。村人・時代・人口・確保資源を確認して再試行してください。'
}))STRINGS[locale]['steward.stalePlan']=text;
