import { clamp } from './utils.js';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.muted = false;
    this.started = false;
    this.scheduler = null;
    this.nextNoteTime = 0;
    this.step = 0;
    this.volume = .55;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.volume;
    this.master.connect(this.ctx.destination);
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = .34;
    this.musicBus.connect(this.master);
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = .72;
    this.sfxBus.connect(this.master);
    this.startMusic();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, .05);
  }

  toggle() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  noise(duration, filterType = 'bandpass', frequency = 800, gain = .2, when = 0) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, t);
    filter.Q.value = .8;
    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(.0001, t + duration);
    source.connect(filter).connect(env).connect(this.sfxBus);
    source.start(t);
    source.stop(t + duration + .02);
  }

  tone(frequency, duration, type = 'sine', gain = .12, when = 0, slide = 0) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, frequency + slide), t + duration);
    env.gain.setValueAtTime(.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + .012);
    env.gain.exponentialRampToValueAtTime(.0001, t + duration);
    osc.connect(env).connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + duration + .03);
  }

  play(name) {
    if (!this.ctx || this.muted) return;
    switch (name) {
      case 'click':
        this.tone(540, .055, 'triangle', .06, 0, -100);
        break;
      case 'select':
        this.tone(430, .06, 'sine', .07, 0, 80);
        this.tone(650, .05, 'sine', .035, .03);
        break;
      case 'command':
        this.tone(220, .1, 'triangle', .08, 0, 50);
        this.noise(.06, 'lowpass', 500, .05);
        break;
      case 'gather':
        this.noise(.07, 'bandpass', 1100, .05);
        this.tone(180, .1, 'triangle', .05, .01, 60);
        break;
      case 'build':
        this.noise(.08, 'bandpass', 420, .09);
        this.tone(95, .16, 'sine', .1, 0, -20);
        break;
      case 'complete':
        this.tone(392, .22, 'sine', .07);
        this.tone(523.25, .3, 'sine', .06, .09);
        this.tone(659.25, .42, 'sine', .045, .18);
        break;
      case 'arrow':
        this.noise(.16, 'highpass', 1900, .07);
        break;
      case 'sword':
        this.noise(.09, 'bandpass', 1300, .1);
        this.tone(290, .1, 'sawtooth', .045, 0, -120);
        break;
      case 'hit':
        this.noise(.09, 'lowpass', 380, .11);
        this.tone(80, .12, 'sine', .08, 0, -25);
        break;
      case 'death':
        this.noise(.2, 'lowpass', 600, .08);
        this.tone(140, .25, 'triangle', .06, 0, -70);
        break;
      case 'horn':
        this.tone(146.83, 1.1, 'sawtooth', .075, 0, 12);
        this.tone(220, 1.0, 'triangle', .055, .06, -4);
        this.noise(.5, 'lowpass', 500, .04, .03);
        break;
      case 'alert':
        this.tone(220, .18, 'triangle', .07);
        this.tone(196, .24, 'triangle', .06, .19);
        break;
      case 'age':
        [261.63, 329.63, 392, 523.25].forEach((f, i) => this.tone(f, .7, 'sine', .055, i * .09));
        this.noise(.4, 'lowpass', 900, .035, .1);
        break;
      case 'boon':
        [392, 493.88, 587.33, 783.99].forEach((f, i) => this.tone(f, .8, 'sine', .05, i * .11));
        break;
      case 'deny':
        this.tone(150, .16, 'square', .035, 0, -30);
        break;
      case 'victory':
        [261.63, 329.63, 392, 523.25, 659.25].forEach((f, i) => this.tone(f, 1.4, 'triangle', .055, i * .18));
        break;
      case 'defeat':
        [196, 174.61, 146.83, 130.81].forEach((f, i) => this.tone(f, 1.6, 'sine', .05, i * .3));
        break;
      case 'raise':
        this.tone(320, .06, 'triangle', .06, 0, 120);
        break;
    }
  }

  startMusic() {
    if (!this.ctx || this.started) return;
    this.started = true;
    this.nextNoteTime = this.ctx.currentTime + .3;
    const schedule = () => {
      if (!this.ctx) return;
      while (this.nextNoteTime < this.ctx.currentTime + 2.2) {
        this.scheduleStep(this.step, this.nextNoteTime);
        this.nextNoteTime += .9;
        this.step++;
      }
    };
    schedule();
    this.scheduler = setInterval(schedule, 1200);
  }

  musicNote(freq, when, duration, gain = .03, type = 'triangle') {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1300;
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(.0001, when);
    env.gain.exponentialRampToValueAtTime(gain, when + .09);
    env.gain.exponentialRampToValueAtTime(.0001, when + duration);
    osc.connect(filter).connect(env).connect(this.musicBus);
    osc.start(when);
    osc.stop(when + duration + .1);
  }

  scheduleStep(step, when) {
    const roots = [146.83, 146.83, 174.61, 130.81, 146.83, 196, 174.61, 130.81];
    const root = roots[step % roots.length];
    if (step % 8 === 0) {
      this.musicNote(root / 2, when, 7.2, .026, 'sine');
      this.musicNote(root * .75, when, 7.2, .014, 'sine');
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = root;
      env.gain.setValueAtTime(.0001, when);
      env.gain.linearRampToValueAtTime(.011, when + 2);
      env.gain.linearRampToValueAtTime(.0001, when + 7);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 360;
      osc.connect(filter).connect(env).connect(this.musicBus);
      osc.start(when);
      osc.stop(when + 7.2);
    }
    const scale = [1, 1.2, 1.5, 1.6, 1.8, 2, 2.4];
    if (step % 4 === 1 || step % 7 === 3) {
      const note = root * 2 * scale[(step * 3) % scale.length];
      this.musicNote(note, when + .2, 2.2, .014, 'sine');
    }
    if (step % 8 === 2) this.musicNote(root * 2 * 1.5, when + .4, 3.4, .012, 'sine');
    if (step % 8 === 6) this.musicNote(root * 2 * 2, when + .5, 2.8, .01, 'sine');
  }
}
