import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_SKILLS, heroCastVisual, bossStrikeVisual } from '../js/hero-skills.js';

test('cast frames follow actual cooldowns and ignore unavailable dead or expired actions', () => {
  const u = { type: 'commander', alive: true, markCd: 30, aegisCd: 0 };
  const before = JSON.stringify(u);
  assert.equal(heroCastVisual(u).id, 'mark'); assert.equal(heroCastVisual(u).progress, 0);
  assert.equal(JSON.stringify(u), before);
  u.markCd = 29.7; assert.ok(Math.abs(heroCastVisual(u).progress - .5) < 1e-10);
  u.aegisCd = HERO_SKILLS.aegis.cooldown; assert.equal(heroCastVisual(u).id, 'aegis');
  u.alive = false; assert.equal(heroCastVisual(u), null);
  assert.equal(heroCastVisual({ ...u, alive: true, markCd: 0, aegisCd: 59 }), null);
  assert.equal(heroCastVisual({ ...u, alive: true, type: 'militia' }), null);
});

test('boss presentation follows the production warning window and leaves zone damage radius and delay untouched', () => {
  const zone = { kind: 'boss', source: { type: 'warlord' }, elapsed: 1.2, delay: 2.4, r: 2.8, damage: 65, done: false };
  const before = JSON.stringify(zone), first = bossStrikeVisual(zone);
  assert.equal(first.progress, .5); assert.equal(first.spokes, 6);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const x = zone.r * Math.cos(a), y = zone.r * Math.sin(a);
    const ellipse = (32 * (x - y) / first.radiusX) ** 2 + (16 * (x + y) / first.radiusY) ** 2;
    assert.ok(Math.abs(ellipse - 1) < 1e-10, 'visible edge matches actual Euclidean damage radius');
  }
  assert.notEqual(first.tint, bossStrikeVisual({ ...zone, source: { type: 'warlord2' } }).tint);
  assert.equal(bossStrikeVisual({ ...zone, done: true, elapsed: 4 }).fade, 0);
  assert.equal(bossStrikeVisual({ ...zone, elapsed: -5 }).progress, 0);
  assert.equal(bossStrikeVisual({ ...zone, kind: 'smoke' }), null);
  assert.equal(JSON.stringify(zone), before);
});
