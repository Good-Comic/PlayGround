// 文明英雄兵器音效：原生戰鬥與實際 Web Audio。 / Civilization hero weapon cues: native combat and actual Web Audio.
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const { chromium } = createRequire(import.meta.url)('playwright-core');
const [url, source, out] = process.argv.slice(2);
if (!url?.startsWith('http://127.0.0.1:') || !/^[a-f0-9]{40}$/.test(source || '') || !out || existsSync(out)) throw Error('Fresh output, local URL and full source SHA required');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: out, size: { width: 1440, height: 900 } } });
const checks = [], errors = [], recordings = [];
const check = (name, pass, detail) => { checks.push({ name, pass: !!pass, detail }); if (!pass) throw Error(name); };
let page;
try {
  for (const [label, type, civ, method, frequency] of [['chn-guandao','commander','CHN','attack',540]]) {
    page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('requestfailed', r => errors.push(r.url() + ':' + r.failure()?.errorText));
    page.on('response', r => { if (r.status() >= 400) errors.push(r.url() + ':' + r.status()); });
    await page.goto(url);
    await page.waitForFunction(() => /^SHA256_MATCH_\d+_FILES$/.test(window.ageOfAsh?.playtestBuild?.resourceVerification || ''));
    check(`${label}: exact artifact`, await page.evaluate(s => ageOfAsh.playtestBuild.commit === s, source));
    await page.locator('#setup-civ').selectOption(civ);
    await page.locator('#setup-seed').fill('CIVILIZATION-HERO-SOUNDS');
    await page.locator('#btn-start').click();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#menu-screen')).visibility === 'hidden');
    await page.waitForFunction(() => ageOfAsh.game.sound?.ctx?.state === 'running');
    const audioContext = await page.evaluate(() => ({ state: ageOfAsh.game.sound.ctx.state, rate: ageOfAsh.game.sound.ctx.sampleRate, enabled: ageOfAsh.game.sound.enabled }));
    check(`${label}: native gesture resumes actual AudioContext`, audioContext.state === 'running' && audioContext.enabled, audioContext);
    const target = await page.evaluate(async ({ type }) => {
      const g = ageOfAsh.game, r = ageOfAsh.renderer, sound = g.sound, ctx = sound.ctx;
      g.paused = true; g.phase = 'prep'; g.prepTimer = 240; g.units = []; g.particles = []; g.projectiles = []; g.selection = [];
      g.world.resources = []; g.world.props = []; g.world.wildlife = [];
      for (const tile of g.world.tiles) tile.terrain = 'grass'; r.terrainKey = '';
      window.actor = g.spawnUnit(type, 29, 33); window.enemy = g.spawnUnit('brute', 30.3, 33, 'enemy');
      enemy.hp = enemy.maxHp = 2000; enemy.cooldown = 999; actor.cooldown = 0; g.hero = null; g.setSelection([actor]);
      g.focusAt(29.5, 33); g.camera.x = g.camera.targetX; g.camera.y = g.camera.targetY; g.camera.zoom = g.camera.targetZoom = 1.7;
      window.initialHP = enemy.hp; window.soundEvents = []; window.voices = [];
      // Tap only tone/noise SFX; ambience/music remain on their original buses.
      const tap = ctx.createGain(), media = ctx.createMediaStreamDestination(), analyser = ctx.createAnalyser();
      tap.gain.value = 1; tap.connect(sound.master); tap.connect(media); tap.connect(analyser); analyser.fftSize = 2048;
      for (const key of ['tone', 'noise']) {
        const original = sound[key].bind(sound);
        sound[key] = (...args) => {
          if (sound.enabled) { voices.push({ kind: key, args, at: ctx.currentTime }); }
          const master = sound.master; sound.master = tap;
          try { return original(...args); } finally { sound.master = master; }
        };
      }
      for (const key of ['attack', 'arrow']) {
        const original = sound[key].bind(sound);
        sound[key] = (...args) => { soundEvents.push({ method: key, type: args[0], civ: args[1], at: ctx.currentTime }); return original(...args); };
      }
      // 音訊執行緒逐樣本量測，避免主執行緒錯過短音效。 / Sample on the audio thread so short cues cannot be missed by main-thread timers.
      window.meterEpoch = 0; window.signal = { sum: 0, count: 0, activeCount: 0, peak: 0, epoch: 0 };
      const moduleURL = URL.createObjectURL(new Blob([`class SfxMeter extends AudioWorkletProcessor {
        constructor(){super();this.epoch=0;this.reset();this.port.onmessage=e=>{this.epoch=e.data;this.reset()}}
        reset(){this.sum=0;this.count=0;this.activeCount=0;this.peak=0;this.blocks=0}
        process(inputs){const d=inputs[0]?.[0];if(d)for(const v of d){this.sum+=v*v;this.count++;if(Math.abs(v)>1e-8)this.activeCount++;this.peak=Math.max(this.peak,Math.abs(v))}if(++this.blocks%16===0)this.port.postMessage({epoch:this.epoch,sum:this.sum,count:this.count,activeCount:this.activeCount,peak:this.peak});return true}
      }registerProcessor('sfx-meter',SfxMeter);`], {type:'text/javascript'}));
      await ctx.audioWorklet.addModule(moduleURL); URL.revokeObjectURL(moduleURL);
      window.meter = new AudioWorkletNode(ctx,'sfx-meter'); const silent = ctx.createGain(); silent.gain.value=0;
      tap.connect(meter); meter.connect(silent).connect(ctx.destination);
      meter.port.onmessage=e=>{if(e.data.epoch===meterEpoch)window.signal=e.data};
      window.audioChunks = []; window.audioRecorder = new MediaRecorder(media.stream, { mimeType: 'audio/webm;codecs=opus' });
      audioRecorder.ondataavailable = e => { if (e.data.size) audioChunks.push(e.data); }; audioRecorder.start(100);
      sound.last.clear(); g.paused = false;
      const p = r.screen(g, enemy.x, enemy.y); return { x: p.x, y: p.y - 18 * g.camera.zoom };
    }, { type });
    await page.mouse.click(target.x, target.y, { button: 'right' });
    await page.waitForFunction(({ type, method }) => soundEvents.some(e => e.type === type && e.method === method) && enemy.hp < initialHP, { type, method }, { timeout: 15000 });
    await page.waitForTimeout(650);
    await page.evaluate(() => { ageOfAsh.game.paused = true; });
    await page.mouse.move(8, 8); await page.screenshot({ path: `${out}/${label}-combat.png` });
    const audible = await page.evaluate(() => ({ totalSamples: signal.count, activeSamples: signal.activeCount, rms: Math.sqrt(signal.sum / Math.max(1, signal.activeCount)), peak: signal.peak, events: [...soundEvents], voices: [...voices], hp: enemy.hp, startHP: initialHP, shots: actor.shots }));
    check(`${label}: native combat routes the weapon cue and records non-silent unclipped SFX`, audible.events.some(e => e.type === type && e.method === method && e.civ === civ) && audible.voices.some(v => v.kind === 'tone' && v.args[0] === frequency) && audible.rms > .0001 && audible.peak < .98 && audible.hp < audible.startHP, audible);
    await page.locator('#btn-sound').click();
    await page.waitForTimeout(400);
    await page.evaluate(() => { window.mutedVoiceCount = voices.length; window.mutedEventCount = soundEvents.length; meterEpoch++; meter.port.postMessage(meterEpoch); signal = { sum: 0, count: 0, activeCount: 0, peak: 0, epoch: meterEpoch }; actor.cooldown = 0; ageOfAsh.game.paused = false; });
    await page.waitForFunction(() => soundEvents.length > mutedEventCount, null, { timeout: 5000 });
    await page.waitForTimeout(350);
    await page.waitForFunction(() => signal.count >= 8192, null, {timeout:5000});
    await page.evaluate(() => { ageOfAsh.game.paused = true; });
    const muted = await page.evaluate(() => ({ enabled: ageOfAsh.game.sound.enabled, voices: voices.length - mutedVoiceCount, requests: soundEvents.length - mutedEventCount, totalSamples: signal.count, activeSamples: signal.activeCount, rms: Math.sqrt(signal.sum / Math.max(1, signal.activeCount)), peak: signal.peak }));
    check(`${label}: native mute suppresses voices during real combat`, muted.totalSamples >= 8192 && !muted.enabled && muted.voices === 0 && muted.requests > 0 && muted.peak < 1e-6, muted);
    await page.locator('#btn-sound').click();
    const throttle = await page.evaluate(({ type, method, civ }) => {
      const s = ageOfAsh.game.sound; s.last.set(method, performance.now() - 1000);
      const before = voices.length; for (let i = 0; i < 100; i++) s[method](type, civ);
      return { enabled: s.enabled, voices: voices.length - before };
    }, { type, method, civ });
    check(`${label}: shared throttle bounds a100-request burst and native unmute restores sound`, throttle.enabled && throttle.voices > 0 && throttle.voices <= 3, throttle);
    await page.waitForTimeout(350);
    const encoded = await page.evaluate(async () => {
      meter.disconnect();
      await new Promise(resolve => { audioRecorder.onstop = resolve; audioRecorder.stop(); });
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      return await new Promise(resolve => { const r = new FileReader(); r.onload = () => resolve(r.result.split(',')[1]); r.readAsDataURL(blob); });
    });
    writeFileSync(`${out}/${label}-sfx.webm`, Buffer.from(encoded, 'base64'));
    const convert = spawnSync('/usr/bin/ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', `${out}/${label}-sfx.webm`, '-ac', '1', '-ar', '24000', `${out}/${label}-sfx.wav`], { encoding: 'utf8' });
    check(`${label}: actual browser SFX recording exports playable PCM`, convert.status === 0, { error: convert.stderr });
    recordings.push({ label, type, civ, audible, muted, throttle, sample: `${label}-sfx.wav` });
    const video = page.video(); await page.close(); copyFileSync(await video.path(), `${out}/${label}-gameplay.webm`);
  }
  check('no page console or resource errors', errors.length === 0, errors);
} catch (e) {
  checks.push({ name: 'browser execution', pass: false, detail: { message: e.message, stack: e.stack } });
  await page?.screenshot({ path: `${out}/failure.png` }).catch(() => {});
} finally { await context.close(); await browser.close(); }
const result = { source_commit: source, mode: 'NEW_CIVILIZATION_HERO_CUES_LOCAL_CONTROLLED_2000HP_TARGET_NATIVE_COMBAT_AND_MUTE', signal_scope: 'AudioWorklet sample-level energy and peak; RMS over nonzero samples (>1e-8); full sample counts retained; muted window resets meter epoch', audio_scope: 'tone/noise SFX tap before master gain; no ambience/music in recordings; software Chromium, not physical speaker acceptance', checks, recordings, errors, pass: checks.length > 0 && checks.every(c => c.pass) };
writeFileSync(`${out}/browser.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ pass: result.pass, checks: checks.map(({ name, pass }) => ({ name, pass })) }));
if (!result.pass) process.exitCode = 1;
