import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
globalThis.window={innerWidth:1600,innerHeight:1000};
const {Game,HERO_SKILLS}=await import('../js/game.js');

function arena(){
  const game=new Game();
  game.units=[];game.buildings=[];game.world={size:50,resources:[],props:[],tile:()=>({terrain:'grass'})};
  game.camera={x:0,y:800,targetX:0,targetY:800,zoom:1,targetZoom:1};
  game.toast=()=>{};game.addParticles=()=>{};
  game.commandMarkers=[];game.particles=[];
  game.hero=game.spawnUnit('commander',25,25,'player',{hero:true});
  return game;
}

test('hero skills expose the production radii used by their effects',()=>{
  assert.equal(HERO_SKILLS.mark.radius,9);
  assert.equal(HERO_SKILLS.aegis.radius,5);
  assert.equal(HERO_SKILLS.mark.duration,6);
  assert.equal(HERO_SKILLS.aegis.duration,5);
  assert.ok(Object.isFrozen(HERO_SKILLS));
  assert.ok(Object.isFrozen(HERO_SKILLS.mark));
  assert.ok(Object.isFrozen(HERO_SKILLS.aegis));
});

test('skill preview requires a living hero and reports render metadata',()=>{
  const game=arena();
  assert.equal(game.previewHeroSkill('mark'),true);
  assert.deepEqual(game.heroSkillPreview,{id:'mark',radius:9,rangeColor:'229,160,74'});
  assert.equal(game.previewHeroSkill('aegis'),true);
  assert.deepEqual(game.heroSkillPreview,{id:'aegis',radius:5,rangeColor:'147,197,220'});
  assert.equal(game.previewHeroSkill('unknown'),false);
  assert.equal(game.heroSkillPreview,null);
  game.hero.alive=false;
  assert.equal(game.previewHeroSkill('mark'),false);
  assert.equal(game.heroSkillPreview,null);
});

test('mark applies inside the previewed range and rejects targets outside it',()=>{
  const inside=arena();
  const marked=inside.spawnUnit('militia',33.9,25,'enemy');
  inside.heroMark();
  assert.equal(marked.marked,6);
  assert.equal(inside.hero.markCd,30);

  const outside=arena();
  const distant=outside.spawnUnit('militia',34.1,25,'enemy');
  outside.heroMark();
  assert.equal(distant.marked,0);
  assert.equal(outside.hero.markCd,0);
});

test('aegis shields allies inside the previewed range only',()=>{
  const inside=arena();
  const near=inside.spawnUnit('militia',29.9,25);
  const far=inside.spawnUnit('militia',30.1,25);
  inside.heroAegis();
  assert.equal(near.shield,60);
  assert.equal(near.shieldTime,5);
  assert.equal(far.shield,0);
  assert.equal(inside.hero.aegisCd,60);
});
