import test from 'node:test';
import assert from 'node:assert/strict';
import { Sound } from '../js/audio.js';

const param = value => ({
  value,
  setValueAtTime(next) { this.value = next; },
  setTargetAtTime(next) { this.value = next; },
  exponentialRampToValueAtTime(next) { this.value = next; },
});

function audioFixture() {
  const starts = [];
  const node = () => ({ connect() { return this; } });
  const ctx = {
    state: 'running', currentTime: 3,
    createOscillator() { return { ...node(), type: '', frequency: param(0), start(at) { starts.push(at); }, stop() {} }; },
    createBiquadFilter() { return { ...node(), type: '', frequency: param(0) }; },
    createGain() { return { ...node(), gain: param(0) }; },
  };
  const sound = new Sound();
  sound.ctx = ctx;
  sound.master = node();
  sound.musicBus = ctx.createGain();
  return { sound, starts };
}

test('adaptive score changes mode and produces bounded notes without changing gameplay state', () => {
  const { sound, starts } = audioFixture();
  sound.setGameState('prep');
  assert.equal(sound.scoreMode, 'prep');
  sound.scoreTick();
  assert.equal(starts.length, 1);

  sound.setGameState('wave', { boss: true });
  assert.equal(sound.scoreMode, 'boss');
  for (let i = 0; i < 6; i++) sound.scoreTick();
  assert.equal(starts.length, 7);
  assert.equal(sound.scoreNotesPlayed, 7);

  sound.enabled = false;
  sound.scoreTick();
  assert.equal(starts.length, 7);
});
