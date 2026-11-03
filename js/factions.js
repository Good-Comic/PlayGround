// 固定陣營語義，獨立於文明與模擬數值。 / Fixed faction semantics independent of civilization and simulation.
export const FACTION_MARKS=Object.freeze({player:{color:'#70d9f3',shape:'circle'},enemy:{color:'#ffb27c',shape:'diamond'},neutral:{color:'#e2deca',shape:'square'}});
export function factionMark(team){return FACTION_MARKS[team]||FACTION_MARKS.neutral;}
