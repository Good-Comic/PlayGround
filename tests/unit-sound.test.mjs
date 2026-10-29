import test from 'node:test';
import assert from 'node:assert/strict';
import { Sound } from '../js/audio.js';
globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
const { Game } = await import('../js/game.js');

function audibleSound() {
  const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} });
  const node = () => ({ connect() { return this; }, start() {}, stop() {}, frequency: param(), gain: param() });
  const sound = new Sound();
  sound.ctx = { currentTime: 1, sampleRate: 8000, createOscillator: node, createGain: node, createBiquadFilter: node, createBufferSource: node,
    createBuffer(_, length) { return { getChannelData: () => new Float32Array(length) }; } };
  sound.master = node(); sound.throttle = () => true;
  return sound;
}

test('production unit cues have distinct low impact, wooden launch and bow signatures; mute stops all voices', () => {
  const s = audibleSound(), events = [];
  s.tone = (...a) => events.push(['tone', ...a]); s.noise = (...a) => events.push(['noise', ...a]);
  s.attack('elephant'); const stomp = JSON.stringify(events); assert.ok(events.some(([kind, hz]) => kind === 'tone' && hz < 90));
  events.length = 0; s.arrow('patrol_cart'); const cart = JSON.stringify(events);
  events.length = 0; s.arrow('horse_archer'); const bow = JSON.stringify(events);
  assert.notEqual(cart, stomp); assert.notEqual(bow, cart);
  events.length = 0; s.enabled = false; s.attack('elephant'); s.arrow('patrol_cart'); assert.equal(events.length, 0);
});

test('unit-specific motifs retain shared attack/arrow throttle groups instead of multiplying per-unit voices', () => {
  const s = audibleSound(); s.throttle = Sound.prototype.throttle; let voices = 0;
  s.tone = () => voices++; s.noise = () => voices++;
  s.last.set('attack', performance.now() - 56); s.attack('elephant'); const first = voices;
  s.attack('militia'); assert.equal(voices, first);
  s.last.set('arrow', performance.now() - 66); s.arrow('patrol_cart'); const second = voices;
  s.arrow('horse_archer'); assert.equal(voices, second); assert.ok(first > 0 && second > first);
});

test('real combat with audible noise keeps damage projectiles and simulation RNG identical to silent combat', () => {
  for (const type of ['elephant', 'patrol_cart', 'horse_archer']) {
    const outcomes = [false, true].map(audible => {
      const g = new Game(); g.newRun(42, { civ: 'PER', biome: 'steppe' }); g.units = []; g.world.tile = () => ({ terrain: 'grass' });
      const u = g.spawnUnit(type, 35, 15), e = g.spawnUnit('brute', 36, 15, 'enemy');
      g.sound = audible ? audibleSound() : null; g.attackUnit(u, e);
      return { hp: e.hp, shots: u.shots, cooldown: u.cooldown, rng: g.rng.state, projectiles: g.projectiles.map(p => ({ damage: p.damage, tx: p.tx, ty: p.ty })) };
    });
    assert.deepEqual(outcomes[0], outcomes[1], type);
  }
});
