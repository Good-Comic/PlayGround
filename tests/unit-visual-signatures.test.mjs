import test from 'node:test';
import assert from 'node:assert/strict';
import { Renderer, buildingVisualState, unitVisualSignature } from '../js/renderer.js';

const EXPECTED = {
  chu_ko_nu: 'repeating-crossbow',
  skirmisher: 'javelin-buckler',
  guard: 'heavy-guard',
  knight: 'mounted-sword',
  light_cavalry: 'mounted-spear',
  horse_archer: 'mounted-bow',
};

function recordingRenderer() {
  const calls = [];
  const ctx = new Proxy({}, {
    get(target, prop) {
      if (prop in target) return target[prop];
      target[prop] = (...args) => calls.push([prop, ...args.map(v => typeof v === 'number' ? Number(v.toFixed(2)) : v)]);
      return target[prop];
    },
    set(target, prop, value) { calls.push([`set:${String(prop)}`, value]); target[prop] = value; return true; },
  });
  const renderer = Object.create(Renderer.prototype);
  renderer.ctx = ctx;
  renderer.drawInfantryBody = (...args) => calls.push(['infantry-body', ...args.slice(0, 3)]);
  return { renderer, calls };
}

function fingerprint(type) {
  const { renderer, calls } = recordingRenderer();
  const unit = { type, team: 'player', attackAnim: 0.45 };
  const team = { primary: '#5076a0', cloth: '#d0d6d8', trim: '#d7b95b' };
  if (['chu_ko_nu', 'skirmisher', 'archer'].includes(type)) renderer.drawArcherUnit({ x: 80, y: 90 }, unit, 1, team, 0.2, 1, 0);
  else if (['knight', 'light_cavalry', 'horse_archer'].includes(type)) renderer.drawKnightUnit({ x: 80, y: 90 }, unit, 1, team, 0.2, 1, 0);
  else renderer.drawInfantryUnit({ x: 80, y: 90 }, unit, 1, team, 0.2, 1, 0);
  return JSON.stringify(calls);
}

test('battlefield roles expose stable, balance-neutral visual signatures', () => {
  for (const [type, signature] of Object.entries(EXPECTED)) assert.equal(unitVisualSignature(type), signature, type);
  assert.equal(unitVisualSignature('archer'), 'standard');
  assert.equal(unitVisualSignature('militia'), 'standard');
});

test('ranged and mounted battlefield roles produce distinct rendered geometry', () => {
  const ranged = ['archer', 'skirmisher', 'chu_ko_nu'].map(fingerprint);
  const mounted = ['knight', 'light_cavalry', 'horse_archer'].map(fingerprint);
  assert.equal(new Set(ranged).size, ranged.length);
  assert.equal(new Set(mounted).size, mounted.length);
  assert.notEqual(fingerprint('guard'), fingerprint('militia'));
});

test('building visuals expose construction damage and persistent ruin states without simulation timers', () => {
  const base = { alive: true, construction: 1, hp: 100, maxHp: 100 };
  assert.equal(buildingVisualState({ ...base, construction: 0.2 }), 'foundation');
  assert.equal(buildingVisualState({ ...base, construction: 0.7 }), 'scaffolded');
  assert.equal(buildingVisualState(base), 'complete');
  assert.equal(buildingVisualState({ ...base, hp: 70 }), 'damaged');
  assert.equal(buildingVisualState({ ...base, hp: 35 }), 'critical');
  assert.equal(buildingVisualState({ ...base, alive: false, hp: 0 }), 'ruined');
});

test('landmark material clips to both house and barracks isometric wall planes', () => {
  for (const type of ['house', 'barracks']) {
    const { renderer, calls } = recordingRenderer();
    renderer.footprint = () => ({ D:{x:0,y:40}, C:{x:64,y:72}, B:{x:128,y:40}, cx:64, cy:40 });
    const building = { id:1,type,w:type==='house'?2:3,h:type==='house'?2:3 };
    const before = JSON.stringify(building);
    renderer.drawCivilizationBuildingAccent(building,{camera:{zoom:1},civ:{id:'SAR'}},0);
    const transforms = calls.filter(c=>c[0]==='transform');
    assert.equal(transforms.length,2);
    assert.ok(transforms[0][2]>0 && transforms[1][2]<0, 'opposite isometric slopes');
    assert.equal(calls.filter(c=>c[0]==='clip').length,2);
    assert.equal(JSON.stringify(building),before,'rendering never mutates building geometry');
  }
});
