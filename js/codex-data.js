import { BOONS, CIVILIZATIONS } from './data.js';

export const BOON_THEMES = Object.freeze({
  "economy": [
    "pack_mules",
    "gold_teeth",
    "butcher",
    "citizen_arms",
    "light_axles"
  ],
  "infantry": [
    "levy_rolls",
    "wartime_rotation",
    "hooked_lines",
    "deflecting_shields",
    "zeal"
  ],
  "cavalry": [
    "horse_armor",
    "war_banner",
    "battlefield_care",
    "veteran_honors",
    "elephant_compact"
  ],
  "ranged": [
    "farwatch",
    "bolt_rack",
    "heavy_arrowheads",
    "fire_oil",
    "resonant_strings",
    "black_powder"
  ],
  "defense": [
    "patrol_depot",
    "night_watch",
    "fragment_shells",
    "siege_math",
    "bronze_oath",
    "retreat_standard"
  ],
  "rift": [
    "decoy_cart",
    "shared_oath",
    "rescue_writ",
    "rift_prototype",
    "rift_echo"
  ]
});
export const CIV_ADVICE = Object.freeze({
  "MNG": [
    "horse_armor",
    "war_banner",
    "light_axles",
    "pack_mules",
    "veteran_honors"
  ],
  "TEU": [
    "night_watch",
    "bronze_oath",
    "siege_math",
    "patrol_depot",
    "retreat_standard"
  ],
  "GOT": [
    "levy_rolls",
    "wartime_rotation",
    "zeal",
    "deflecting_shields",
    "battlefield_care"
  ],
  "FRK": [
    "horse_armor",
    "war_banner",
    "battlefield_care",
    "veteran_honors",
    "light_axles"
  ],
  "SAR": [
    "gold_teeth",
    "butcher",
    "pack_mules",
    "siege_math",
    "light_axles"
  ],
  "AZT": [
    "levy_rolls",
    "zeal",
    "shared_oath",
    "wartime_rotation",
    "citizen_arms"
  ],
  "BRI": [
    "farwatch",
    "bolt_rack",
    "heavy_arrowheads",
    "resonant_strings",
    "war_banner"
  ],
  "CHN": [
    "bolt_rack",
    "resonant_strings",
    "heavy_arrowheads",
    "farwatch",
    "gold_teeth"
  ],
  "PER": [
    "elephant_compact",
    "horse_armor",
    "bronze_oath",
    "battlefield_care",
    "war_banner"
  ],
  "KOR": [
    "fragment_shells",
    "siege_math",
    "patrol_depot",
    "night_watch",
    "bronze_oath"
  ],
  "SPA": [
    "citizen_arms",
    "pack_mules",
    "gold_teeth",
    "butcher",
    "battlefield_care"
  ],
  "TUR": [
    "black_powder",
    "fire_oil",
    "heavy_arrowheads",
    "resonant_strings",
    "bolt_rack"
  ],
  "BYZ": [
    "bronze_oath",
    "night_watch",
    "patrol_depot",
    "deflecting_shields",
    "siege_math"
  ],
  "VIK": [
    "zeal",
    "wartime_rotation",
    "battlefield_care",
    "deflecting_shields",
    "hooked_lines"
  ],
  "MAG": [
    "horse_armor",
    "war_banner",
    "light_axles",
    "heavy_arrowheads",
    "battlefield_care"
  ],
  "JPN": [
    "zeal",
    "wartime_rotation",
    "deflecting_shields",
    "hooked_lines",
    "war_banner"
  ]
});

// UI associations only: no card eligibility, weight, RNG or effects are changed.
export function boonTheme(id){return Object.keys(BOON_THEMES).find(k=>BOON_THEMES[k].includes(id)) || 'rift';}
export function codexCards(game,civId=game.civ?.id){
  const owned=new Set((game.boons||[]).map(c=>c.id));
  const offers=game.phase==='boon'?(game.boonChoices||[]).map(c=>c.id):[];
  return BOONS.map(card=>({...card,theme:boonTheme(card.id),owned:owned.has(card.id),offer:offers.indexOf(card.id)+1,recommended:!!CIV_ADVICE[civId]?.includes(card.id)}));
}
export function adviceKind(card,civId){
  const civ=CIVILIZATIONS.find(c=>c.id===civId);
  if(!civ)return 'shared';
  if(civ.bonuses.noCavalry && ['horse_armor'].includes(card.id))return 'cavalryLimit';
  if(civId==='CHN'&&card.id==='bolt_rack')return 'boltCaution';
  return CIV_ADVICE[civId]?.includes(card.id)?boonTheme(card.id):'shared';
}
export const TECH_BRANCHES=['economy','military','tactics'];
export const TECH_KEYS=[
  ['gather','workers','build','ratios','reserves','conditions','reassign','autoage','dispatch','masterplan','imperialreserve','smarttown'],
  ['barracks','range','stable','perbuilding','targets','budget','replenish','unitupgrade','rally','army','counter','mobilize'],
  ['acquire','factions','manual','spearcounter','cavalrycounter','leash','threat','formation','vision','coordination','presets','command']
];
const prototypes=new Set(['masterplan','imperialreserve','smarttown','unitupgrade','mobilize','formation','coordination','presets','command']);
export const TECH_NODES=TECH_KEYS.flatMap((keys,branch)=>keys.map((key,i)=>({id:key,branch:TECH_BRANCHES[branch],tier:Math.floor(i/3),prototype:prototypes.has(key),icon:branch===0?'villager':branch===1?'sword':'shield'})));
export function ageView(game,level){
  const cost=level>1?game.ageCost(level-1):{};
  const status=game.ageLevel>=level?'researched':game.ageResearch?.level===level?'researching':game.ageLevel===level-1&&!!game.getTownCenter()&&game.canAfford(cost)?'available':'locked';
  return {level,cost,status,seconds:level===2?20:level===3?30:0,prerequisite:level>1?level-1:null};
}
