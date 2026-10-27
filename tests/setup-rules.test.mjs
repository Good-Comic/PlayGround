import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../js/game.js');
const {setupRulesView}=await import('../js/ui.js');

test('pre-game rules agree with actual population rules without mutating a run',()=>{
  const game=new Game(),settings={gameSpeed:1.25,autoEconomy:false,autoMilitary:true};
  for(const civ of ['FRK','TEU','CHN','AZT']){
    game.newRun(420,{civ,biome:'river'});
    const snapshot=()=>{const value=game.snapshot();delete value.savedAt;return JSON.stringify(value)};
    const before=snapshot();
    const view=setupRulesView({civ,biome:'river',seed:' player-seed '},settings,game.economicPopCap);
    assert.equal(view.civ,game.civ.id);assert.equal(view.biome,game.biome.id);
    assert.equal(view.economicCap,game.economicPopCap);
    assert.equal(view.militaryLimit,game.effects.militaryPopCap||null);
    assert.equal(view.seed,'player-seed');assert.equal(view.speed,1.25);assert.equal(view.autoEconomy,false);
    assert.equal(snapshot(),before,'query does not consume game RNG or modify state (wall-clock export timestamp excluded)');
  }
});

test('standard campaign preview accurately states ten waves and Boss waves five and ten',()=>{
  const view=setupRulesView({civ:'FRK',biome:'ash',seed:'query'},{gameSpeed:1},60);
  assert.equal(view.waves,10);assert.deepEqual(view.bossWaves,[5,10]);assert.equal(view.militaryLimit,40);
});
