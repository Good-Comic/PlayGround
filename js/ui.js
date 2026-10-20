import { BUILD_DEFS, UNIT_DEFS, TOTAL_WAVES } from './constants.js';

const RES_KEYS = ['food', 'wood', 'gold', 'stone'];
const BUILD_ORDER = ['house', 'farm', 'barracks', 'range', 'tower'];
const TRAIN_ORDER = ['villager', 'militia', 'archer'];
const GATHER_LABEL = { food: 'Food', wood: 'Wood', gold: 'Gold', stone: 'Stone' };
const NODE_FOR = { food: 'berry', wood: 'tree', gold: 'gold', stone: 'stone' };

export class UI {
  constructor(game) {
    this.game = game;
    this.boonChoices = [];
    this.lastSync = 0;
    this.lastRes = {};
    this.toasts = [];
    this.difficulty = game.difficulty;
    this.el = {};
    const ids = [
      'title-screen', 'hud', 'command-panel', 'wave-clock', 'wave-clock-label', 'wave-clock-value',
      'wave-value', 'wave-status', 'pop-value', 'btn-call-wave', 'btn-start', 'btn-pause',
      'btn-sound', 'btn-help', 'btn-resume', 'btn-quit', 'btn-retry', 'btn-title',
      'boon-overlay', 'boon-cards', 'pause-overlay', 'end-overlay', 'end-icon', 'end-kicker',
      'end-title', 'end-sub', 'end-stats', 'best-wave', 'toasts', 'selection-portrait',
      'selection-name', 'selection-sub', 'selection-hp', 'selection-hp-text', 'selection-actions',
      'queue-items', 'placement-hint', 'placement-text', 'train-cards', 'build-cards', 'difficulty',
      'hint-bar'
    ];
    for (const id of ids) this.el[id] = document.getElementById(id);
    this.res = {};
    for (const k of RES_KEYS) {
      this.res[k] = {
        root: document.getElementById(`res-${k}`),
        value: document.querySelector(`#res-${k} b`),
        rate: document.querySelector(`#res-${k} em`)
      };
    }
    this.bind();
    this.setBest();
    this.syncDifficulty();
    this.updateSoundIcon();
  }

  bind() {
    const g = this.game;
    this.el['btn-start'].addEventListener('click', () => {
      g.startRun(this.difficulty);
    });
    this.el.difficulty.addEventListener('click', e => {
      const btn = e.target.closest('[data-difficulty]');
      if (!btn) return;
      this.difficulty = btn.dataset.difficulty;
      g.difficulty = this.difficulty;
      this.syncDifficulty();
      g.audio.click();
    });
    this.el.hud.addEventListener('click', e => {
      const train = e.target.closest('[data-train]');
      if (train) { g.train(train.dataset.train); return; }
      const build = e.target.closest('[data-build]');
      if (build) { g.beginPlacement(build.dataset.build); return; }
    });
    this.el['command-panel'].addEventListener('click', e => {
      const train = e.target.closest('[data-train]');
      if (train) { g.train(train.dataset.train); return; }
      const build = e.target.closest('[data-build]');
      if (build) { g.beginPlacement(build.dataset.build); return; }
    });
    this.el['btn-call-wave'].addEventListener('click', () => g.callWave());
    this.el['btn-pause'].addEventListener('click', () => g.togglePause());
    this.el['btn-help'].addEventListener('click', () => {
      if (g.state === 'playing' || g.state === 'paused') g.togglePause();
    });
    this.el['btn-sound'].addEventListener('click', () => this.toggleSound());
    this.el['btn-resume'].addEventListener('click', () => {
      if (g.state === 'paused') g.togglePause();
    });
    this.el['btn-quit'].addEventListener('click', () => g.quitRun());
    this.el['btn-retry'].addEventListener('click', () => this.retry());
    this.el['btn-title'].addEventListener('click', () => {
      this.el['end-overlay'].classList.add('hidden');
      g.returnToTitle();
    });
    this.el['boon-cards'].addEventListener('click', e => {
      const card = e.target.closest('[data-index]');
      if (!card) return;
      g.chooseBoon(parseInt(card.dataset.index, 10));
    });
    this.el['selection-actions'].addEventListener('click', e => {
      const btn = e.target.closest('[data-gather]');
      if (btn) this.assignSelected(btn.dataset.gather);
      const stop = e.target.closest('[data-stop]');
      if (stop) {
        for (const u of g.selectedUnits()) {
          u.command = null;
          u.target = null;
          u.task = null;
          u.gatherState = 'idle';
        }
        g.toast('Orders cleared.', '');
      }
    });
  }

  retry() {
    this.el['end-overlay'].classList.add('hidden');
    this.game.startRun(this.game.difficulty);
  }

  syncDifficulty() {
    for (const btn of this.el.difficulty.querySelectorAll('[data-difficulty]')) {
      btn.classList.toggle('active', btn.dataset.difficulty === this.difficulty);
    }
  }

  setBest() {
    if (this.el['best-wave']) this.el['best-wave'].textContent = String(this.game.bestWave);
  }

  showGame() {
    this.el['title-screen'].classList.add('hidden');
    this.el.hud.classList.remove('hidden');
    this.el['command-panel'].classList.remove('hidden');
    this.el['wave-clock'].classList.remove('hidden');
    this.el['boon-overlay'].classList.add('hidden');
    this.el['pause-overlay'].classList.add('hidden');
    this.el['end-overlay'].classList.add('hidden');
    this.el['placement-hint'].classList.add('hidden');
    this.el['hint-bar'].classList.add('hidden');
    this.toasts = [];
    this.el.toasts.innerHTML = '';
    document.body.classList.add('in-game');
  }

  showTitle() {
    this.el['title-screen'].classList.remove('hidden');
    this.el.hud.classList.add('hidden');
    this.el['command-panel'].classList.add('hidden');
    this.el['wave-clock'].classList.add('hidden');
    this.el['boon-overlay'].classList.add('hidden');
    this.el['pause-overlay'].classList.add('hidden');
    this.el['end-overlay'].classList.add('hidden');
    this.el['placement-hint'].classList.add('hidden');
    this.el['hint-bar'].classList.add('hidden');
    this.el.toasts.innerHTML = '';
    document.body.classList.remove('in-game');
    this.setBest();
  }

  showPause(show) {
    this.el['pause-overlay'].classList.toggle('hidden', !show);
    if (show) this.el['boon-overlay'].classList.add('hidden');
  }

  showBoons(choices) {
    this.boonChoices = choices;
    this.el['boon-cards'].innerHTML = choices.map((b, i) => `
      <button class="boon-card rarity-${b.rarity.toLowerCase()}" data-index="${i}">
        <div class="boon-icon"><svg><use href="#${b.icon}"/></svg></div>
        <div class="boon-rarity">${b.rarity}</div>
        <div class="boon-name">${b.name}</div>
        <div class="boon-desc">${b.desc}</div>
        <div class="boon-key"><kbd>${i + 1}</kbd> choose</div>
      </button>
    `).join('');
    this.el['boon-overlay'].classList.remove('hidden');
    this.el['pause-overlay'].classList.add('hidden');
  }

  hideBoons() {
    this.el['boon-overlay'].classList.add('hidden');
    this.boonChoices = [];
  }

  showEnd(win, stats) {
    const icon = win ? '#i-trophy' : '#i-skull';
    this.el['end-icon'].innerHTML = `<svg><use href="${icon}"/></svg>`;
    this.el['end-kicker'].textContent = win ? 'THE REALM REMEMBERS' : 'THE TOWN HAS FALLEN';
    this.el['end-title'].textContent = win ? 'Victory' : 'Defeat';
    this.el['end-sub'].textContent = win
      ? 'Ten waves broken. Your name will be sung beside the fire for generations.'
      : 'The raiders broke through. Your story ends here — for now.';
    const mins = Math.floor(stats.time / 60);
    const secs = Math.floor(stats.time % 60);
    this.el['end-stats'].innerHTML = `
      <div class="stat"><b>${stats.wave} / ${TOTAL_WAVES}</b><span>WAVES</span></div>
      <div class="stat"><b>${stats.kills}</b><span>RAIDERS SLAIN</span></div>
      <div class="stat"><b>${stats.gathered}</b><span>RESOURCES GATHERED</span></div>
      <div class="stat"><b>${mins}:${String(secs).padStart(2, '0')}</b><span>TIME SURVIVED</span></div>
    `;
    this.el['end-overlay'].classList.remove('hidden');
    this.el['boon-overlay'].classList.add('hidden');
    this.el['pause-overlay'].classList.add('hidden');
    this.el['wave-clock'].classList.add('hidden');
    const endContent = this.el['end-overlay'].querySelector('.end-content');
    endContent.classList.toggle('win', win);
    this.setBest();
  }

  toast(text, type = '') {
    const node = document.createElement('div');
    node.className = 'toast' + (type ? ' ' + type : '');
    node.textContent = text;
    this.el.toasts.appendChild(node);
    while (this.el.toasts.children.length > 4) this.el.toasts.removeChild(this.el.toasts.firstChild);
    setTimeout(() => node.classList.add('fade'), 2600);
    setTimeout(() => node.remove(), 3100);
  }

  toggleSound() {
    const muted = !this.game.audio.muted;
    this.game.audio.setMuted(muted);
    this.updateSoundIcon();
    if (!muted) this.game.audio.click();
  }

  updateSoundIcon() {
    const use = this.el['btn-sound']?.querySelector('use');
    if (use) use.setAttribute('href', this.game.audio.muted ? '#i-mute' : '#i-sound');
  }

  onResize() {}

  setPlacing(type) {
    this.el['placement-hint'].classList.remove('hidden');
    this.el['placement-text'].textContent = `Placing ${BUILD_DEFS[type].name} · click the ground`;
    this.sync(true);
  }

  clearPlacing() {
    this.el['placement-hint'].classList.add('hidden');
    this.sync(true);
  }

  assignSelected(kind) {
    const g = this.game;
    const units = g.selectedUnits().filter(u => u.kind === 'villager');
    if (!units.length) return;
    let assigned = 0;
    for (const u of units) {
      const node = g.world.nearestNode(u.x, u.y, NODE_FOR[kind]);
      if (node) { g.assignGather(u, node); assigned++; }
    }
    if (assigned) {
      g.toast(`${assigned} villager${assigned > 1 ? 's' : ''} sent to gather ${GATHER_LABEL[kind].toLowerCase()}.`, '');
      g.audio.select();
    } else {
      g.toast(`No ${GATHER_LABEL[kind].toLowerCase()} remains.`, 'warn');
    }
    this.sync(true);
  }

  sync(force = false) {
    const g = this.game;
    if (g.state === 'title') return;
    const now = performance.now();
    if (!force && now - this.lastSync < 100) return;
    this.lastSync = now;

    for (const k of RES_KEYS) {
      const value = Math.floor(g.resources[k] || 0);
      if (this.lastRes[k] !== value) {
        this.res[k].value.textContent = value;
        this.lastRes[k] = value;
      }
    }
    const cap = g.popCap();
    const used = g.popUsed();
    this.el['pop-value'].textContent = `${used}/${cap}`;
    this.el['pop-value'].parentElement.classList.toggle('full', used >= cap);

    const counts = { food: 0, wood: 0, gold: 0, stone: 0 };
    for (const u of g.units) {
      if (u.team === 'player' && u.kind === 'villager' && !u.dead && u.task) counts[u.task.node.resource]++;
    }
    for (const k of RES_KEYS) {
      const label = counts[k] ? `+${counts[k]}` : '';
      if (this.res[k].rate.textContent !== label) this.res[k].rate.textContent = label;
    }

    this.el['wave-value'].textContent = String(Math.min(g.wave, TOTAL_WAVES));
    const remaining = g.spawnQueue.length + g.enemies().length;
    let status = '';
    let danger = false;
    if (g.state === 'boon') status = 'Choose a blessing';
    else if (g.state === 'paused') status = 'Paused';
    else if (g.state === 'gameover') status = 'The town has fallen';
    else if (g.state === 'victory') status = 'The realm is safe';
    else if (g.waveActive) { status = `Raiders remaining: ${remaining}`; danger = true; }
    else status = `Next wave in ${Math.max(0, Math.ceil(g.prepTime))}s`;
    this.el['wave-status'].textContent = status;
    this.el['wave-status'].classList.toggle('danger', danger);

    const canCall = g.state === 'playing' && !g.waveActive;
    this.el['btn-call-wave'].disabled = !canCall;
    this.el['btn-call-wave'].classList.toggle('ready', canCall);

    const clock = this.el['wave-clock'];
    if (g.state === 'playing' || g.state === 'boon') {
      clock.classList.remove('hidden');
      if (g.waveActive) {
        this.el['wave-clock-label'].textContent = 'RAIDERS';
        this.el['wave-clock-value'].textContent = String(remaining);
        clock.classList.remove('urgent');
      } else {
        this.el['wave-clock-label'].textContent = 'NEXT WAVE';
        this.el['wave-clock-value'].textContent = String(Math.max(0, Math.ceil(g.prepTime)));
        clock.classList.toggle('urgent', g.prepTime <= 10);
      }
    } else {
      clock.classList.add('hidden');
    }

    this.syncCards();
    this.syncQueue();
    this.syncSelection();
  }

  syncCards() {
    const g = this.game;
    for (const btn of this.el['train-cards'].querySelectorAll('[data-train]')) {
      const kind = btn.dataset.train;
      const def = UNIT_DEFS[kind];
      const prereq = kind === 'militia' ? g.hasBuilding('barracks') : kind === 'archer' ? g.hasBuilding('range') : true;
      const affordable = g.canAfford(def.cost);
      btn.classList.toggle('disabled', !affordable || !prereq);
      btn.classList.toggle('requires', !prereq);
    }
    for (const btn of this.el['build-cards'].querySelectorAll('[data-build]')) {
      const type = btn.dataset.build;
      const def = BUILD_DEFS[type];
      btn.classList.toggle('disabled', !g.canAfford(def.cost));
      btn.classList.toggle('active', g.placing?.type === type);
    }
  }

  syncQueue() {
    const g = this.game;
    if (!g.queue.length) {
      if (this.el['queue-items'].dataset.empty !== '1') {
        this.el['queue-items'].innerHTML = '<span class="queue-empty">Idle</span>';
        this.el['queue-items'].dataset.empty = '1';
      }
      return;
    }
    this.el['queue-items'].dataset.empty = '0';
    this.el['queue-items'].innerHTML = g.queue.slice(0, 4).map(q => {
      const def = UNIT_DEFS[q.kind];
      const progress = Math.max(0, Math.min(100, (1 - q.time / q.total) * 100));
      return `<div class="queue-item"><svg><use href="#${def.icon}"/></svg><span class="bar"><i style="width:${progress}%"></i></span></div>`;
    }).join('');
  }

  syncSelection() {
    const g = this.game;
    const units = g.selected.filter(s => s.unit && !s.dead);
    const building = g.selected.find(s => s.building && !s.dead);
    const tc = g.townCenter();
    let icon = 'i-crown';
    let name = 'Your Settlement';
    let sub = '';
    let hp = 0;
    let hpText = '';
    let actions = '';

    if (units.length) {
      const u = units[0];
      icon = u.def.icon;
      name = units.length > 1 ? `${u.def.name} ×${units.length}` : u.def.name;
      if (u.team === 'enemy') {
        sub = `Enemy ${u.kind} · ${Math.ceil(u.damage)} attack`;
      } else if (u.kind === 'villager') {
        if (u.task) {
          const res = u.task.node.resource;
          sub = `Gathering ${res} · carrying ${Math.floor(u.carry)}/10`;
        } else if (u.command) sub = 'Moving';
        else sub = 'Idle · gathering automatically';
        actions = RES_KEYS.map(k => `<button class="mini-btn" data-gather="${k}">${GATHER_LABEL[k]}</button>`).join('');
      } else {
        sub = `${Math.ceil(u.damage)} attack · ${u.range.toFixed(1)} range`;
        actions = '<button class="mini-btn" data-stop="1">Stop</button>';
      }
      hp = u.hp / u.maxHp;
      hpText = `${Math.ceil(u.hp)} / ${Math.ceil(u.maxHp)}`;
    } else if (building) {
      icon = building.def.icon;
      name = building.def.name;
      sub = building.def.sub || building.def.desc;
      hp = building.hp / building.maxHp;
      hpText = `${Math.ceil(building.hp)} / ${Math.ceil(building.maxHp)}`;
    } else {
      const villagers = g.units.filter(u => u.team === 'player' && u.kind === 'villager' && !u.dead).length;
      const soldiers = g.units.filter(u => u.team === 'player' && u.kind !== 'villager' && !u.dead).length;
      sub = `${villagers} villagers · ${soldiers} soldiers · ${g.buildings.length} buildings`;
      hp = tc ? tc.hp / tc.maxHp : 0;
      hpText = tc ? `Town Center ${Math.ceil(tc.hp)} / ${Math.ceil(tc.maxHp)}` : 'Town Center destroyed';
    }

    this.el['selection-portrait'].innerHTML = `<svg><use href="#${icon}"/></svg>`;
    this.el['selection-name'].textContent = name;
    this.el['selection-sub'].textContent = sub;
    const fill = this.el['selection-hp'];
    fill.style.width = `${Math.max(0, Math.min(1, hp)) * 100}%`;
    fill.classList.toggle('low', hp < 0.4);
    this.el['selection-hp-text'].textContent = hpText;
    this.el['selection-actions'].innerHTML = actions;
  }
}
