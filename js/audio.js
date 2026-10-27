export class Sound {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.last = new Map();
    this.ambience = null;
    this.musicBus = null;
    this.scoreTimer = null;
    this.scoreMode = 'menu';
    this.scoreStep = 0;
    this.scoreNotesPlayed = 0;
    this.scoreSignature = '';
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.34;
    this.master.connect(this.ctx.destination);
    this.startAmbience();
    this.startScore();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.master) this.master.gain.setTargetAtTime(enabled ? 0.34 : 0, this.ctx.currentTime, 0.05);
  }

  throttle(key, ms) {
    const now = performance.now();
    if ((this.last.get(key) || 0) + ms > now) return false;
    this.last.set(key, now);
    return true;
  }

  tone(freq, duration, type = 'sine', volume = 0.12, slide = null, delay = 0) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  noise(duration, volume = 0.1, frequency = 1200, delay = 0, type = 'lowpass') {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime + delay;
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(this.master);
    source.start(t);
  }

  click() { this.tone(460, 0.06, 'triangle', 0.045, 300); }
  select() { this.tone(320, 0.08, 'triangle', 0.055, 420); }
  command() { this.tone(240, 0.11, 'triangle', 0.06, 340); }
  error() { this.tone(120, 0.18, 'sawtooth', 0.045, 90); }
  gather() { if (this.throttle('gather', 120)) this.tone(660 + Math.random() * 140, 0.055, 'triangle', 0.025, 520); }
  deposit() {
    if (!this.throttle('deposit', 180)) return;
    this.tone(880, 0.06, 'triangle', 0.035, 900);
    this.tone(1180, 0.1, 'sine', 0.025, 1100, 0.04);
  }
  chop() { if (this.throttle('chop', 180)) this.noise(0.08, 0.06, 700); }
  attack() { if (this.throttle('attack', 55)) { this.noise(0.06, 0.055, 1900, 0, 'bandpass'); this.tone(110, 0.08, 'triangle', 0.04, 70); } }
  arrow() { if (this.throttle('arrow', 65)) this.noise(0.13, 0.035, 2700, 0, 'highpass'); }
  hit() { if (this.throttle('hit', 70)) this.noise(0.07, 0.04, 950, 0, 'bandpass'); }
  build() { if (this.throttle('build', 380)) { this.tone(180, 0.05, 'square', 0.025, 120); this.noise(0.06, 0.03, 1500); } }
  complete() {
    [523, 659, 784].forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.045, f, i * 0.07));
  }
  train() { [330, 392].forEach((f, i) => this.tone(f, 0.17, 'triangle', 0.04, f, i * 0.08)); }
  horn() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    [110, 164.8, 220].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 1 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.linearRampToValueAtTime(f * 1.01, t + 0.4);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.045 / (i + 1), t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      osc.connect(gain).connect(this.master);
      osc.start(t);
      osc.stop(t + 1.55);
    });
  }
  boon() { [392, 494, 587, 784].forEach((f, i) => this.tone(f, 0.6, 'sine', 0.04, f, i * 0.1)); }
  prototype() {
    if (!this.ctx || !this.enabled) return;
    this.noise(0.42, 0.045, 520, 0, 'bandpass');
    [82.5, 123.5, 185, 370].forEach((f, i) => this.tone(f, 0.55, i < 2 ? 'sawtooth' : 'triangle', 0.035, f * 1.06, i * 0.09));
  }

  startScore() {
    if (!this.ctx || this.musicBus) return;
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.0001;
    this.musicBus.connect(this.master);
    this.setGameState('menu', { inMenu: true });
    this.scoreTimer = setInterval(() => this.scoreTick(), 520);
    this.scoreTimer?.unref?.();
  }

  setGameState(phase, { boss = false, paused = false, inMenu = false } = {}) {
    if (!this.ctx || !this.musicBus) return;
    const mode = inMenu ? 'menu' : paused ? 'paused' : boss ? 'boss' : phase;
    const next = ['menu', 'prep', 'wave', 'boss', 'boon', 'paused', 'victory', 'defeat'].includes(mode) ? mode : 'prep';
    const signature = `${next}:${this.enabled}`;
    if (signature === this.scoreSignature) return;
    this.scoreSignature = signature;
    this.scoreMode = next;
    this.scoreStep = 0;
    const levels = { menu: 0.016, prep: 0.013, wave: 0.021, boss: 0.027, boon: 0.018, paused: 0.005, victory: 0.0001, defeat: 0.0001 };
    this.musicBus.gain.setTargetAtTime(levels[next], this.ctx.currentTime, 0.35);
  }

  scoreTick() {
    if (!this.ctx || !this.musicBus || !this.enabled || this.ctx.state !== 'running') return;
    const scores = {
      menu:   { notes: [110, 130.81, 164.81, 196], every: 2, duration: 0.95 },
      prep:   { notes: [110, 146.83, 164.81, 220], every: 2, duration: 0.82 },
      wave:   { notes: [110, 146.83, 164.81, 220, 164.81, 146.83], every: 1, duration: 0.46 },
      boss:   { notes: [82.41, 116.54, 123.47, 155.56, 123.47, 116.54], every: 1, duration: 0.42 },
      boon:   { notes: [130.81, 164.81, 196, 261.63], every: 1, duration: 0.7 },
      paused: { notes: [82.41, 110], every: 4, duration: 1.1 },
    };
    const score = scores[this.scoreMode];
    const tick = this.scoreStep++;
    if (!score || tick % score.every) return;
    const frequency = score.notes[Math.floor(tick / score.every) % score.notes.length];
    const now = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    oscillator.type = this.scoreMode === 'boss' ? 'sawtooth' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now);
    filter.type = 'lowpass';
    filter.frequency.value = this.scoreMode === 'boss' ? 720 : 980;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(this.scoreMode === 'boss' ? 0.36 : 0.28, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + score.duration);
    oscillator.connect(filter).connect(gain).connect(this.musicBus);
    oscillator.start(now);
    oscillator.stop(now + score.duration + 0.03);
    this.scoreNotesPlayed++;
  }
  victory() {
    [261.6, 329.6, 392, 523, 659].forEach((f, i) => this.tone(f, 1.2, 'triangle', 0.045, f, i * 0.16));
  }
  defeat() {
    [196, 164.8, 130.8, 98].forEach((f, i) => this.tone(f, 1.0, 'sawtooth', 0.03, f * 0.98, i * 0.25));
  }

  startAmbience() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.05;
    source.connect(filter).connect(gain).connect(this.master);
    source.start(t);
    this.ambience = source;
    [55, 82.5, 110].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const og = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      og.gain.value = 0.007 / (i + 1);
      osc.connect(og).connect(this.master);
      osc.start(t);
    });
  }
}
