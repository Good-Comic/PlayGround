import test from'node:test';import assert from'node:assert/strict';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const{Game}=await import('../js/game.js');const{UI}=await import('../js/ui.js');
test('unselected hero cooldown cannot invalidate worker and production-building command buttons',()=>{
 const g=new Game();for(const actor of [g.units.find(u=>u.type==='villager'),g.buildings.find(b=>b.type==='barracks')]){
  g.selection=[actor];g.hero.markCd=30;g.hero.aegisCd=60;const before=UI.prototype.commandSignature(g);g.hero.markCd=29;g.hero.aegisCd=59;assert.equal(UI.prototype.commandSignature(g),before);
 }
});
test('selected hero countdown and worker build page still invalidate the command view',()=>{
 const g=new Game();g.selection=[g.hero];g.hero.markCd=30;const before=UI.prototype.commandSignature(g);g.hero.markCd=29;assert.notEqual(UI.prototype.commandSignature(g),before);
 g.selection=[g.units.find(u=>u.type==='villager')];const worker=UI.prototype.commandSignature(g);g.buildPage++;assert.notEqual(UI.prototype.commandSignature(g),worker);
});
