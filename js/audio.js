import { SOUND_KEY } from './constants.js';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = localStorage.getItem(SOUND_KEY) === '1';
    this.lastGather = 0;
    this.lastHit = 0;
  }

  ensure() {
    if (this.muted) return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem(SOUND_KEY, muted ? '1' : '0');
    if (this.master) this.master.gain.setTargetAtTime(muted ? 0 : 0.22, this.ctx.currentTime, 0.03);
  }

  tone({ freq = 440, freq2 = null, dur = 0.14, type = 'sine', vol = 0.5, delay = 0, attack = 0.008 }) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freq2 !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq2), t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  noise({ dur = 0.12, vol = 0.4, href = 900, lref = 300, delay = 0, type = 'bandpass' }) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const size = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(href, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(80, lref), t + dur);
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t);
  }

  click() { this.tone({ freq: 620, freq2: 480, dur: 0.055, type: 'triangle', vol: 0.3 }); }
  select() { this.tone({ freq: 440, freq2: 620, dur: 0.08, type: 'triangle', vol: 0.25 }); this.tone({ freq: 880, dur: 0.05, vol: 0.12, delay: 0.03 }); }
  error() { this.tone({ freq: 180, freq2: 120, dur: 0.16, type: 'square', vol: 0.16 }); }
  place() {
    this.noise({ dur: 0.22, vol: 0.5, href: 500, lref: 150 });
    this.tone({ freq: 120, freq2: 70, dur: 0.2, vol: 0.5 });
  }
  train() { this.tone({ freq: 330, dur: 0.1, type: 'triangle', vol: 0.3 }); this.tone({ freq: 495, dur: 0.12, type: 'triangle', vol: 0.25, delay: 0.08 }); }
  gather(kind) {
    const now = performance.now();
    if (now - this.lastGather < 95) return;
    this.lastGather = now;
    if (kind === 'wood') this.noise({ dur: 0.06, vol: 0.16, href: 1800, lref: 700, type: 'highpass' });
    else if (kind === 'gold' || kind === 'stone') { this.tone({ freq: 1200, freq2: 900, dur: 0.05, type: 'triangle', vol: 0.1 }); }
    else this.tone({ freq: 720, freq2: 620, dur: 0.05, type: 'sine', vol: 0.09 });
  }
  deposit() { this.tone({ freq: 880, freq2: 1320, dur: 0.09, type: 'triangle', vol: 0.18 }); }
  arrow() { this.noise({ dur: 0.09, vol: 0.13, href: 2600, lref: 900, type: 'highpass' }); }
  hit() {
    const now = performance.now();
    if (now - this.lastHit < 60) return;
    this.lastHit = now;
    this.noise({ dur: 0.09, vol: 0.26, href: 600, lref: 180 });
    this.tone({ freq: 160, freq2: 90, dur: 0.07, vol: 0.18 });
  }
  death() { this.tone({ freq: 220, freq2: 90, dur: 0.26, type: 'sawtooth', vol: 0.12 }); }
  coin() { this.tone({ freq: 1046, dur: 0.07, type: 'triangle', vol: 0.16 }); this.tone({ freq: 1568, dur: 0.1, type: 'triangle', vol: 0.12, delay: 0.05 }); }
  horn() {
    this.tone({ freq: 146.8, dur: 0.7, type: 'sawtooth', vol: 0.16, attack: 0.08 });
    this.tone({ freq: 220, dur: 0.7, type: 'sawtooth', vol: 0.13, attack: 0.1, delay: 0.05 });
    this.tone({ freq: 293.7, dur: 0.9, type: 'sawtooth', vol: 0.1, attack: 0.12, delay: 0.12 });
  }
  boon() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone({ freq: f, dur: 0.32, type: 'triangle', vol: 0.15, delay: i * 0.08 }));
  }
  victory() {
    [392, 523, 659, 784, 1046, 1318].forEach((f, i) => this.tone({ freq: f, dur: 0.6, type: 'triangle', vol: 0.16, delay: i * 0.13 }));
  }
  defeat() {
    [330, 293, 246, 196].forEach((f, i) => this.tone({ freq: f, dur: 0.55, type: 'sawtooth', vol: 0.12, delay: i * 0.17 }));
  }
  waveClear() {
    [523, 659, 784].forEach((f, i) => this.tone({ freq: f, dur: 0.3, type: 'triangle', vol: 0.14, delay: i * 0.09 }));
  }
}
