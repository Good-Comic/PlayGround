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
 'zh-Hant':'提案未能執行，已取消本次確認。請檢查村民、時代、人口、預留與施工位置後重試。',
 'zh-Hans':'提案未能执行，已取消本次确认。请检查村民、时代、人口、预留与施工位置后重试。',
 en:'This proposal could not be executed and was cancelled. Check workers, age, population, reserves and build-site access before retrying.',
 ja:'提案を実行できなかったため取り消しました。村人・時代・人口・確保資源・建設場所を確認して再試行してください。'
}))STRINGS[locale]['steward.stalePlan']=text;

const GATHER_PREVIEW_TEXT={
 'zh-Hant':['套用後目標比例預覽','按總和換算；全零使用均衡比例。這是目標，不保證即時人數；手動任務、搬運與資源可達性仍優先。按套用才儲存。'],
 'zh-Hans':['应用后目标比例预览','按总和换算；全零使用均衡比例。这是目标，不保证即时人数；手动任务、搬运与资源可达性仍优先。点击应用才保存。'],
 en:['Target allocation after Apply','Normalized by the total; all zeros use balanced shares. Targets are not immediate headcounts: manual tasks, cargo and reachable resources retain priority. Apply saves changes.'],
 ja:['適用後の目標配分プレビュー','合計で正規化し、すべてゼロならバランス設定の比率を使用。目標値であり即時の人数ではありません。手動作業・運搬・到達可能な資源を優先し、適用で保存します。']
};
for(const[locale,labels]of Object.entries(GATHER_PREVIEW_TEXT))['gatherPreview','gatherPreviewHelp'].forEach((key,i)=>STRINGS[locale]['steward.'+key]=labels[i]);

const WORKER_ALLOCATION_TEXT={
 'zh-Hant':['採集／搬運歸屬','其他工作／未分配','村民總數','手動鎖定','未鎖定','攜帶資源','閒置','每人只計入一項資源或其他類；攜帶資源優先於下一個採集目標。下列狀態可重疊，未鎖定不代表自動經濟已啟用。'],
 'zh-Hans':['采集／搬运归属','其他工作／未分配','村民总数','手动锁定','未锁定','携带资源','闲置','每人只计入一项资源或其他类；携带资源优先于下一个采集目标。下列状态可重叠，未锁定不代表自动经济已启用。'],
 en:['Gathering / cargo allocation','Other work / unassigned','Total workers','Manually locked','Unlocked','Carrying resources','Idle','Each worker counts once in a resource or Other; carried resources take precedence over the next gathering target. Status counts may overlap. Unlocked does not mean auto economy is enabled.'],
 ja:['採集・運搬の配分','その他の作業・未割当','村人の総数','手動ロック','ロックなし','資源を運搬中','待機中','各村人は資源かその他に一度だけ計上。次の採集先より運搬中の資源を優先します。状態の人数は重複し、ロックなしは自動経済が有効という意味ではありません。']
};
for(const[locale,labels]of Object.entries(WORKER_ALLOCATION_TEXT))['allocation','workerOther','worker.total','worker.manual','worker.unlocked','worker.carrying','worker.idle','allocationHelp'].forEach((key,i)=>STRINGS[locale]['steward.'+key]=labels[i]);

const BATTLE_ACTION_TEXT={
 'zh-Hant':['作戰指揮','全軍','推進','護衛','可施放','選軍後右鍵移動；推進會沿途接敵。','選取所有戰鬥部隊；不含村民、英雄及非戰鬥單位。','已選全軍：點擊戰場指定攻擊前進位置；Esc 取消。','已選全軍：點擊友軍單位或建築指定護衛對象；Esc 取消。','暫停中／目前無法下令'],
 'zh-Hans':['作战指挥','全军','推进','护卫','可施放','选军后右键移动；推进会沿途接敌。','选择所有战斗部队；不含村民、英雄及非战斗单位。','已选全军：点击战场指定攻击前进位置；Esc 取消。','已选全军：点击友军单位或建筑指定护卫对象；Esc 取消。','暂停中／当前无法下令'],
 en:['Battle command','Army','Advance','Guard','Ready','Select army, then right-click to move. Advance engages enemies en route.','Select combat troops, excluding workers, the hero and noncombat units.','Army selected: click the battlefield to attack-move. Esc cancels.','Army selected: click a friendly unit or building to guard. Esc cancels.','Paused / orders unavailable'],
 ja:['戦闘指揮','全軍','進撃','護衛','使用可能','軍を選び右クリックで移動。進撃は途中の敵と交戦します。','村人・英雄・非戦闘ユニットを除く戦闘部隊を選択。','全軍を選択中：戦場をクリックして攻撃移動。Escで取消。','全軍を選択中：味方ユニットか建物をクリックして護衛。Escで取消。','一時停止中・命令不可']
};
for(const[locale,labels]of Object.entries(BATTLE_ACTION_TEXT))['title','army','advance','guard','ready','hint','armyHelp','advanceHelp','guardHelp','paused'].forEach((key,i)=>STRINGS[locale]['battle.'+key]=labels[i]);

for(const[locale,labels]of Object.entries({
 'zh-Hant':['英雄','直控中','切換英雄直控：WASD 移動、Q 標記、E 神盾；F2 切回全軍指揮。'],
 'zh-Hans':['英雄','直控中','切换英雄直控：WASD 移动、Q 标记、E 神盾；F2 切回全军指挥。'],
 en:['Hero','Direct','Toggle hero control: WASD moves, Q marks, E shields. F2 returns to army command.'],
 ja:['英雄','直接操作','英雄操作を切替：WASD移動、Q標的、Eイージス。F2で軍の指揮に戻ります。']
}))['hero','direct','heroHelp'].forEach((key,i)=>STRINGS[locale]['battle.'+key]=labels[i]);

for(const[locale,labels]of Object.entries({
 'zh-Hant':['等待目標','可護 {count} 人'], 'zh-Hans':['等待目标','可护 {count} 人'],
 en:['No target','Shield {count}'], ja:['対象なし','{count}人を保護']
}))['noTarget','shieldCount'].forEach((key,i)=>STRINGS[locale]['battle.'+key]=labels[i]);

for(const[l,a]of Object.entries({
 'zh-Hant':['遠征：救援工人','已救援 {count}/2。離開防線尋找信號，英雄抵達後工人加入並返回城心。信號不揭露敵軍或地形。','派英雄前往','兩名工人已獲救！','人口含佇列已滿；救援保留，騰出空間後再接應。','救出工人！本次已救援 {count}/2。'],
 'zh-Hans':['远征：救援工人','已救援 {count}/2。离开防线寻找信号，英雄抵达后工人加入并返回城心。信号不揭露敌军或地形。','派英雄前往','两名工人已获救！','人口含队列已满；救援保留，腾出空间后再接应。','救出工人！本次已救援 {count}/2。'],
 en:['Expedition: Rescue workers','Rescued {count}/2. Leave the defense line and reach the signal with your hero. Workers join and head home. The signal reveals no enemies or terrain.','Send hero','Both workers rescued!','Population including queues is full. The rescue waits for room.','Worker rescued! {count}/2 joined.'],
 ja:['遠征：村人の救出','救出 {count}/2。英雄で信号へ向かうと村人が加入し城へ戻ります。信号は敵や地形を明かしません。','英雄を派遣','2人を救出しました！','人口・訓練待ちが上限。空きができるまで救出を保持します。','村人を救出！ {count}/2。']
}))['title','help','go','done','cap','joined'].forEach((k,i)=>STRINGS[l]['rescue.'+k]=a[i]);

for(const[l,a]of Object.entries({
 'zh-Hant':['廢工坊：80木／30秒','英雄抵達後可擇一借用攻城單位；支付80木材、領取即起算30模擬秒，每局一次。仍占軍事人口。','80木：借用{unit}','支援剩餘 {seconds} 秒','本局支援已使用','{unit}已加入，30秒後離隊。'],
 'zh-Hans':['废工坊：80木／30秒','英雄抵达后可择一借用攻城单位；支付80木材、领取即起算30模拟秒，每局一次。仍占军事人口。','80木：借用{unit}','支援剩余 {seconds} 秒','本局支援已使用','{unit}已加入，30秒后离队。'],
 en:['Workshop:80 wood /30s','Reach it with your hero, then borrow one siege unit for80 wood.30 simulation seconds from collection, once per run. Uses military population.','80 wood: Borrow {unit}','Support: {seconds}s left','Support used this run','{unit} joined for30 seconds.'],
 ja:['廃工房：木80／30秒','英雄で到着後、攻城兵器を1台借用。木80、受取から30シミュレーション秒、1回限り。軍事人口を使用。','木80：{unit}を借用','支援の残り {seconds}秒','支援は使用済み','{unit}が30秒間加入しました。']
}))['title','help','borrow','remaining','done','started'].forEach((k,i)=>STRINGS[l]['workshop.'+k]=a[i]);

for(const[l,v]of Object.entries({'zh-Hant':'備戰中：領取就開始倒數，可先抵達工坊、等交戰前夕再付款。','zh-Hans':'备战中：领取就开始倒计时，可先抵达工坊、等交战前夕再付款。',en:'Preparation: collection starts the timer. Reach the workshop now and pay nearer combat.',ja:'準備中：受取と同時に残り時間が減ります。先に到着し、交戦前に購入できます。'}))STRINGS[l]['workshop.prepWarning']=v;

for (const [locale, values] of Object.entries({
  'zh-Hant': ['準備好了？由你決定何時迎戰。', '提前迎戰…', '繼續備戰', '確認迎戰', '放棄剩餘 {seconds} 秒備戰，現在開戰。敵軍、獎勵與波次規則不變；沒有額外獎勵。'],
  'zh-Hans': ['准备好了？由你决定何时迎战。', '提前迎战…', '继续备战', '确认迎战', '放弃剩余 {seconds} 秒备战，现在开战。敌军、奖励与波次规则不变；没有额外奖励。'],
  en: ['Ready? Choose when to face the raid.', 'Call raid early…', 'Keep preparing', 'Confirm raid', 'Give up {seconds}s of preparation and begin now. Same enemies, rewards and wave rules; no bonus.'],
  ja: ['準備完了？開戦の時を選べます。', '早めに迎撃…', '準備を続ける', '迎撃を確定', '残り {seconds} 秒の準備を放棄して開戦。敵・報酬・襲撃ルールは同じで追加報酬はありません。'],
})) ['help', 'arm', 'cancel', 'confirm', 'warning'].forEach((key, i) => STRINGS[locale]['raid.' + key] = values[i]);

for(const [locale,values] of Object.entries({"zh-Hant": ["戰術布令・時間已暫停", "戰術布令（Shift+Space）", "選取或框選戰士，再選指令、點戰場。同一單位保留最後一項布令；技能在恢復時施放。取消／讀檔捨棄未執行計畫。", "全軍 F2", "英雄 Tab", "選取／框選", "移動 M", "進攻移動 A", "集火敵軍", "護衛 G", "標記 Q", "神盾 E", "清除計畫", "取消・回暫停", "執行並恢復 Space", "選取 {units} 人・{orders} 項布令・{mode}", "布令已記錄，尚未執行", "需有效戰士及合法落點／可見目標", "技能已排定，恢復時才消耗冷卻", "技能尚未就緒或沒有可見目標", "執行 {applied} 項布令；略過 {skipped} 項失效指令。"], "zh-Hans": ["战术布令・时间已暂停", "战术布令（Shift+Space）", "选取或框选战士，再选指令、点战场。同一单位保留最后一项布令；技能在恢复时施放。取消／读档丢弃未执行计划。", "全军 F2", "英雄 Tab", "选取／框选", "移动 M", "进攻移动 A", "集火敌军", "护卫 G", "标记 Q", "神盾 E", "清除计划", "取消・回暂停", "执行并恢复 Space", "选取 {units} 人・{orders} 项布令・{mode}", "布令已记录，尚未执行", "需有效战士及合法落点／可见目标", "技能已排定，恢复时才消耗冷却", "技能尚未就绪或没有可见目标", "执行 {applied} 项布令；略过 {skipped} 项失效指令。"], "en": ["Tactical planning · Time paused", "Tactical planning (Shift+Space)", "Select or drag-select fighters, choose an order, then click the field. Last order per unit wins. Skills cast on resume. Cancel/load discards unissued plans.", "Army F2", "Hero Tab", "Select / drag", "Move M", "Attack-move A", "Focus enemy", "Guard G", "Mark Q", "Aegis E", "Clear plan", "Cancel · Pause", "Execute & resume Space", "{units} selected · {orders} orders · {mode}", "Order staged, not executed", "Choose fighters and a valid point / visible target", "Skill staged; cooldown starts on resume", "Skill unavailable or no visible target", "Executed {applied} orders; skipped {skipped} invalid orders."], "ja": ["戦術指示・時間停止中", "戦術指示（Shift+Space）", "兵士を選択・ドラッグし、指示と地点を選びます。同じ兵士には最後の指示が有効。スキルは再開時発動。取消・読込で未実行の計画を破棄。", "全軍 F2", "英雄 Tab", "選択／ドラッグ", "移動 M", "攻撃移動 A", "敵に集中攻撃", "護衛 G", "標的 Q", "イージス E", "計画を消去", "取消・一時停止", "実行して再開 Space", "選択 {units}人・{orders} 指示・{mode}", "指示を計画しました。未実行です", "兵士と有効な地点／見える目標が必要", "スキルを計画。再開時にクールダウン開始", "スキル使用不可、または目標が見えません", "{applied} 指示を実行。無効な {skipped} 指示を省略。"]})) ["title", "launch", "help", "army", "hero", "select", "move", "attackMove", "attack", "guard", "mark", "aegis", "clear", "cancel", "resume", "status", "staged", "invalid", "skillStaged", "unavailable", "executed"].forEach((key,i)=>STRINGS[locale]["plan."+key]=values[i]);

for(const [locale,note] of Object.entries({'zh-Hant':'標記沿用原生最近可見目標。','zh-Hans':'标记沿用原生最近可见目标。',en:'Mark uses the native nearest visible target.',ja:'標的は従来通り最も近い視認可能な敵です。'})) STRINGS[locale]['plan.help']+=' '+note;

for(const [locale,values] of Object.entries({"zh-Hant": ["復原上一步", "選取兵種", "全部戰士", "步兵", "騎兵", "遠程", "攻城"], "zh-Hans": ["撤销上一步", "选取兵种", "全部战士", "步兵", "骑兵", "远程", "攻城"], "en": ["Undo last", "Select troop group", "All fighters", "Infantry", "Cavalry", "Ranged", "Siege"], "ja": ["一つ戻す", "兵種を選択", "全兵士", "歩兵", "騎兵", "遠隔", "攻城"]})) ["undo","group","group.all","group.infantry","group.cavalry","group.ranged","group.siege"].forEach((key,i)=>STRINGS[locale]["plan."+key]=values[i]);

for(const [locale,note] of Object.entries({'zh-Hant':'中鍵拖移鏡頭、滾輪縮放；英雄直控時鏡頭仍跟隨英雄。','zh-Hans':'中键拖移镜头、滚轮缩放；英雄直控时镜头仍跟随英雄。',en:'Middle-drag to pan, wheel to zoom. Hero direct control retains its follow camera.',ja:'中ボタンドラッグで移動、ホイールで拡縮。英雄直接操作中は従来の追従カメラです。'})) STRINGS[locale]['plan.help']+=' '+note;

for(const [locale,values] of Object.entries({"zh-Hant": ["儲存計畫", "計畫與遊戲已儲存；保持暫停，尚未執行。", "儲存失敗；計畫仍保留，請勿關閉。", "已恢復 {restored} 項計畫、略過 {skipped} 項失效資料；保持暫停，請確認後執行。"], "zh-Hans": ["保存计划", "计划与游戏已保存；保持暂停，尚未执行。", "保存失败；计划仍保留，请勿关闭。", "已恢复 {restored} 项计划、略过 {skipped} 项失效数据；保持暂停，请确认后执行。"], "en": ["Save plan", "Plan and run saved. Still paused; no orders executed.", "Save failed. Your plan remains here; keep this window open.", "Restored {restored} planned orders; skipped {skipped} invalid entries. Still paused: review before executing."], "ja": ["計画を保存", "計画とゲームを保存しました。停止中、まだ未実行です。", "保存失敗。計画は保持中です。この画面を閉じないでください。", "計画 {restored} 件を復元、無効な {skipped} 件を省略。停止中です。確認して実行してください。"]})) ["save","saved","saveFailed","restored"].forEach((key,i)=>STRINGS[locale]["plan."+key]=values[i]);

for(const [locale,from,to] of [
 ['zh-Hant','取消／讀檔捨棄未執行計畫。','取消捨棄計畫；儲存計畫後，讀檔會停下來等待確認。'],
 ['zh-Hans','取消／读档丢弃未执行计划。','取消丢弃计划；保存计划后，读档会停下来等待确认。'],
 ['en','Cancel/load discards unissued plans.','Cancel discards plans. Save plan restores paused for review.'],
 ['ja','取消・読込で未実行の計画を破棄。','取消で計画を破棄。保存した計画は読込後、停止して確認を待ちます。']
]) STRINGS[locale]['plan.help']=STRINGS[locale]['plan.help'].replace(from,to);

for(const [locale,values] of Object.entries({"zh-Hant": ["戰線 F", "拖曳戰線", "戰鬥持續進行：拖曳決定戰線寬度，步兵在前、遠程／攻城在後、騎兵兩翼。點一下用預設寬度。落點仍受尋路與碰撞限制。", "接敵模式", "進攻：沿途接敵", "移動：前往落點", "取消 Esc／右鍵", "{count}名戰士。拖曳預覽，放開下令；不增加攻防數值。", "有{blocked}個已知受阻落點，請縮短或移動戰線。", "{unknown}個落點尚未看見；不透露障礙，路徑由原生尋路確認。", "請在開放戰場放開滑鼠。", "已向{count}名戰士下達戰線指令。"], "zh-Hans": ["战线 F", "拖曳战线", "战斗持续进行：拖曳决定战线宽度，步兵在前、远程／攻城在后、骑兵两翼。点一下用默认宽度。落点仍受寻路与碰撞限制。", "接敌模式", "进攻：沿途接敌", "移动：前往落点", "取消 Esc／右键", "{count}名战士。拖曳预览，松开下令；不增加攻防数值。", "有{blocked}个已知受阻落点，请缩短或移动战线。", "{unknown}个落点尚未看见；不透露障碍，路径由原生寻路确认。", "请在开放战场松开鼠标。", "已向{count}名战士下达战线指令。"], "en": ["Battle line F", "Drag a battle line", "Combat stays live. Drag frontage: infantry forward, ranged/siege behind, cavalry on flanks. Click for default width. Native pathfinding and collisions still apply.", "Orders", "Attack-move", "Move only", "Cancel Esc / right-click", "{count} fighters. Drag to preview, release to order. No combat bonuses.", "{blocked} known blocked slots. Shorten or move the line.", "{unknown} unseen slots. Obstacles remain hidden; native pathfinding determines routes.", "Release over the open battlefield.", "Battle-line orders issued to {count} fighters."], "ja": ["戦列 F", "戦列をドラッグ", "戦闘は進行中。幅をドラッグし歩兵は前、遠隔・攻城は後、騎兵は両翼へ。クリックは既定の幅。従来の経路探索と衝突判定を維持。", "指示", "攻撃移動", "移動のみ", "取消 Esc／右クリック", "兵士{count}人。ドラッグで確認、離して指示。戦闘能力の加算なし。", "既知の障害{blocked}地点。幅を縮めるか戦列を移動。", "未視認{unknown}地点。障害は明かさず従来の経路探索に従います。", "操作パネル以外の戦場で離してください。", "{count}人へ戦列指示を出しました。"]})) ["launch","title","help","mode","attackMove","move","cancel","ready","blocked","unknown","onField","issued"].forEach((key,i)=>STRINGS[locale]["line."+key]=values[i]);

for(const [locale,label,note]of[
 ['zh-Hant','翻轉前後 V','先選部隊再按F；沒有選戰士時使用全軍。V可翻轉前後，讓後撤的前排朝向敵軍。'],
 ['zh-Hans','翻转前后 V','先选部队再按F；没有选战士时使用全军。V可翻转前后，让后撤的前排朝向敌军。'],
 ['en','Flip ranks V','Select troops first; no selected fighters uses the army. V flips ranks to keep a retreat facing the enemy.'],
 ['ja','前後反転 V','兵士を選んでF。未選択なら全軍。Vで前後を反転し、退却時も敵側に前衛を配置。']
]){STRINGS[locale]['line.flip']=label;STRINGS[locale]['line.help']+=' '+note;}

for(const [locale,values]of Object.entries({"zh-Hant": ["戰鬥持續進行。選兵後按F拖曳戰線：步兵前、遠程／攻城後、騎兵兩翼。V翻轉前後，右鍵或Esc取消；沒選戰士時使用全軍。", "{count}名戰士。拖曳預覽，放開下令；金色箭頭表示前方。", "{unknown}個灰色落點尚未看見，抵達前可能發現障礙。", "前方", "英雄直控中；先按Tab退出，再選部隊排陣。"], "zh-Hans": ["战斗持续进行。选兵后按F拖曳战线：步兵前、远程／攻城后、骑兵两翼。V翻转前后，右键或Esc取消；没选战士时使用全军。", "{count}名战士。拖曳预览，松开下令；金色箭头表示前方。", "{unknown}个灰色落点尚未看见，抵达前可能发现障碍。", "前方", "英雄直控中；先按Tab退出，再选部队排阵。"], "en": ["Combat stays live. Select troops, press F and drag: infantry forward, ranged/siege behind, cavalry on flanks. V flips ranks; Esc/right-click cancels. No selected fighters uses the army.", "{count} fighters. Drag to preview, release to order. Gold arrow points forward.", "{unknown} gray slots are unseen; obstacles may be discovered on approach.", "Front", "Hero direct control: press Tab to release it before arranging troops."], "ja": ["戦闘は進行中。兵士を選びFで戦列をドラッグ：歩兵は前、遠隔・攻城は後、騎兵は両翼。Vで前後反転、Esc・右クリックで取消。未選択なら全軍。", "兵士{count}人。ドラッグして離すと指示。金の矢印が前方です。", "灰色の未視認地点{unknown}か所。接近時に障害を発見する場合があります。", "前方", "英雄直接操作中。Tabで解除してから兵士を配置してください。"]}))["help","ready","unknown","front","heroHint"].forEach((key,i)=>STRINGS[locale]["line."+key]=values[i]);
