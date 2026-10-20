const ERA_MUSIC = [
  { root: 110.0, scale: [0, 3, 5, 7, 10], tempo: 2.8, timbre: 'sine' },
  { root: 123.47, scale: [0, 2, 5, 7, 9], tempo: 2.5, timbre: 'triangle' },
  { root: 130.81, scale: [0, 2, 4, 7, 9], tempo: 2.2, timbre: 'triangle' },
  { root: 146.83, scale: [0, 2, 3, 7, 8], tempo: 1.9, timbre: 'sawtooth' },
  { root: 164.81, scale: [0, 2, 4, 7, 11], tempo: 1.65, timbre: 'square' },
  { root: 174.61, scale: [0, 1, 5, 7, 10], tempo: 1.5, timbre: 'sawtooth' },
  { root: 196.0, scale: [0, 2, 6, 7, 11], tempo: 1.35, timbre: 'triangle' },
  { root: 220.0, scale: [0, 1, 4, 6, 10], tempo: 1.2, timbre: 'sawtooth' },
];

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.droneGain = null;
    this.sfxGain = null;
    this.drones = [];
    this.on = false;
    this.era = 0;
    this.tension = 0;
    this.timer = null;
    this.step = 0;
  }

  ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.0;
    this.master.connect(this.ctx.destination);
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.16;
    this.droneGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.55;
    this.sfxGain.connect(this.master);
    const cfg = ERA_MUSIC[this.era];
    for (let i = 0; i < 2; i += 1) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i ? 'triangle' : 'sine';
      osc.frequency.value = cfg.root * (i ? 1.5 : 1);
      gain.gain.value = i ? 0.015 : 0.03;
      osc.connect(gain);
      gain.connect(this.droneGain);
      osc.start();
      this.drones.push({ osc, gain });
    }
    this.applyEra();
  }

  get enabled() { return this.on; }

  toggle() {
    this.ensure();
    if (!this.ctx) return false;
    this.on = !this.on;
    if (this.on) {
      this.ctx.resume?.();
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(0.16, this.ctx.currentTime + 0.6);
      this.startLoop();
    } else {
      this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.35);
      this.stopLoop();
    }
    return this.on;
  }

  setEra(index) {
    this.era = Math.max(0, Math.min(ERA_MUSIC.length - 1, index | 0));
    if (this.ctx) this.applyEra();
  }

  applyEra() {
    if (!this.ctx) return;
    const cfg = ERA_MUSIC[this.era];
    const now = this.ctx.currentTime;
    this.drones.forEach(({ osc, gain }, i) => {
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.linearRampToValueAtTime(cfg.root * (i ? 1.5 : 1), now + 1.2);
      osc.type = i ? cfg.timbre : 'sine';
      gain.gain.linearRampToValueAtTime(i ? 0.012 : 0.03, now + 0.8);
    });
  }

  setTension(value) {
    this.tension = Math.max(0, Math.min(1, value));
  }

  startLoop() {
    this.stopLoop();
    const run = () => {
      if (!this.on) return;
      this.playBar();
      const cfg = ERA_MUSIC[this.era];
      this.timer = setTimeout(run, cfg.tempo * 1000 * (1 - this.tension * 0.28));
    };
    run();
  }

  stopLoop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  playBar() {
    if (!this.ctx || !this.on) return;
    const cfg = ERA_MUSIC[this.era];
    const beat = (cfg.tempo * 1000) / 4;
    const density = 0.45 + this.tension * 0.45;
    for (let i = 0; i < 4; i += 1) {
      if (i > 0 && Math.random() > density) continue;
      const degree = cfg.scale[(this.step + i * 2) % cfg.scale.length];
      const octave = Math.random() < 0.28 ? 2 : 1;
      const freq = cfg.root * octave * Math.pow(2, degree / 12);
      this.note(freq, beat / 1000 * (1.4 + Math.random()), cfg.timbre, 0.035 + this.tension * 0.02, i * beat / 1000);
    }
    if (this.tension > 0.55 && this.step % 2 === 0) {
      this.note(cfg.root / 2, beat / 1000 * 2.2, 'sine', 0.06, 0);
      this.note(cfg.root / 2, beat / 1000 * 2.2, 'triangle', 0.025, beat / 4000);
    }
    this.step += 1;
  }

  note(freq, duration, type, volume, delay = 0) {
    if (!this.ctx || !this.on) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900 + this.era * 380;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.droneGain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  event(kind) {
    this.ensure();
    if (!this.ctx || !this.on) return;
    const cfg = ERA_MUSIC[this.era];
    if (kind === 'war') {
      this.note(cfg.root * 0.75, 0.55, 'sawtooth', 0.12, 0);
      this.note(cfg.root * 1.12, 0.32, 'square', 0.06, 0.08);
      this.tension = Math.min(1, this.tension + 0.25);
    } else if (kind === 'good') {
      [0, 4, 7].forEach((d, i) => this.note(cfg.root * 2 * Math.pow(2, d / 12), 0.45, 'sine', 0.07, i * 0.09));
    } else if (kind === 'era') {
      [0, 5, 7, 12].forEach((d, i) => this.note(cfg.root * 2 * Math.pow(2, d / 12), 0.8, 'triangle', 0.08, i * 0.16));
    } else if (kind === 'crisis') {
      this.note(cfg.root * 0.5, 1.1, 'sawtooth', 0.11, 0);
      this.note(cfg.root * 0.66, 1.1, 'sawtooth', 0.07, 0.18);
    } else {
      this.note(cfg.root * 1.5, 0.12, 'sine', 0.035, 0);
    }
  }
}
