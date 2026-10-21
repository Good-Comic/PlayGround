import { BUILDING_TYPES, UNIT_TYPES, TRAINABLE, BOONS, PLAYER_COLORS, ENEMY_COLORS } from './data.js';
import { formatNumber, formatTime, roman, clamp } from './utils.js';

const ICON_FOR = {
  food: 'food', wood: 'wood', gold: 'gold', stone: 'stone',
  villager: 'villager', militia: 'sword', archer: 'bow', knight: 'horse',
  house: 'house', farm: 'farm', barracks: 'sword', tower: 'tower',
  stop: 'stop', hold: 'hold', sword: 'sword', bow: 'bow', horse: 'horse',
  hammer: 'hammer', skull: 'skull', speed: 'speed', hourglass: 'hourglass',
  shield: 'shield', flame: 'flame', coin: 'coin', crown: 'crown', scroll: 'scroll',
};

const shortCost = cost => Object.entries(cost).map(([k, v]) => `${v}${k[0]}`).join(' · ');

export class UI {
  constructor(game, callbacks = {}) {
    this.game = game;
    this.callbacks = callbacks;
    this.sound = callbacks.sound;
    this.lastSignature = '';
    this.lastCommandSignature = '';
    this.toastEls = [];
    this.boonSelection = null;
    this.boonsOpen = false;
    this.pauseOpen = false;
    this.hudUpdate = 0;
    this.minimapCache = null;
    this.menuVisible = true;
    this.$ = id => document.getElementById(id);
    this.cache();
    this.bind();
    this.renderCommands(game);
    this.updateSelection(true);
    this.drawMinimap(game);
  }

  cache() {
    this.el = {
      hud: this.$('hud'), menu: this.$('menu-screen'), howto: this.$('howto-overlay'),
      pause: this.$('pause-overlay'), boon: this.$('boon-overlay'), boonGrid: this.$('boon-grid'),
      claim: this.$('btn-claim'), end: this.$('end-overlay'),
      food: this.$('res-food'), wood: this.$('res-wood'), gold: this.$('res-gold'),
      stone: this.$('res-stone'), pop: this.$('res-pop'), cap: this.$('res-cap'),
      waveKicker: this.$('wave-kicker'), waveTitle: this.$('wave-title'), waveClock: this.$('wave-clock'),
      waveProgress: this.$('wave-progress'), waveBanner: this.$('wave-banner'),
      objectiveWaves: this.$('objective-waves'), objectiveHp: this.$('objective-hp'), objectiveBoons: this.$('objective-boons'),
      selectionName: this.$('selection-name'), selectionSub: this.$('selection-sub'),
      selectionHp: this.$('selection-hp'), selectionHpText: this.$('selection-hp-text'),
      selectionStats: this.$('selection-stats'), selectionCount: this.$('selection-count'),
      commandGrid: this.$('command-grid'), panelHint: this.$('panel-hint'),
      portrait: this.$('portrait'), idleCount: this.$('idle-count'), idleButton: this.$('idle-button'),
      minimap: this.$('minimap'), minimapDay: this.$('minimap-day'), toastStack: this.$('toast-stack'),
      tooltip: this.$('hover-tooltip'), placementHint: this.$('placement-hint'), placementName: this.$('placement-name'),
      soundIcon: this.$('sound-icon'), pauseBtn: this.$('btn-pause'),
      endKicker: this.$('end-kicker'), endTitle: this.$('end-title'), endDesc: this.$('end-desc'),
      endWaves: this.$('end-waves'), endKills: this.$('end-kills'), endGathered: this.$('end-gathered'), endTime: this.$('end-time'),
      endIcon: this.$('end-icon'), selectionPanel: this.$('selection-panel'),
    };
    this.portraitCtx = this.el.portrait.getContext('2d');
    this.miniCtx = this.el.minimap.getContext('2d');
  }

  bind() {
    const clickSound = () => this.sound?.click();
    this.$('btn-start').addEventListener('click', () => { clickSound(); this.callbacks.start?.(); });
    this.$('btn-howto').addEventListener('click', () => { clickSound(); this.openHowTo(); });
    this.$('btn-howto-close').addEventListener('click', () => { clickSound(); this.closeHowTo(); });
    this.$('btn-howto-play').addEventListener('click', () => { clickSound(); this.closeHowTo(); this.callbacks.start?.(); });
    this.$('btn-pause').addEventListener('click', () => { clickSound(); this.callbacks.pause?.(); });
    this.$('btn-resume').addEventListener('click', () => { clickSound(); this.callbacks.resume?.(); });
    this.$('btn-restart').addEventListener('click', () => { clickSound(); this.callbacks.restart?.(); });
    this.$('btn-quit').addEventListener('click', () => { clickSound(); this.callbacks.quit?.(); });
    this.$('btn-new-run').addEventListener('click', () => { clickSound(); this.callbacks.restart?.(); });
    this.$('btn-end-menu').addEventListener('click', () => { clickSound(); this.callbacks.quit?.(); });
    this.$('btn-sound').addEventListener('click', () => {
      const enabled = this.callbacks.toggleSound?.();
      this.setSound(enabled);
    });
    this.el.idleButton.addEventListener('click', () => { clickSound(); this.callbacks.idle?.(); });
    this.el.claim.addEventListener('click', () => this.claimBoon());
    this.el.minimap.addEventListener('pointerdown', e => {
      const rect = this.el.minimap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * 50;
      const y = (e.clientY - rect.top) / rect.height * 50;
      this.callbacks.minimap?.(clamp(x, 1, 49), clamp(y, 1, 49));
      this.sound?.command();
    });
    window.addEventListener('keydown', e => {
      if (this.boonsOpen && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        this.selectBoon(Number(e.key) - 1);
      }
    });
  }

  setSound(enabled) {
    this.el.soundIcon.innerHTML = `<use href="#${enabled ? 'i-sound' : 'i-muted'}"/>`;
  }

  showMenu() {
    this.menuVisible = true;
    this.el.menu.classList.remove('is-leaving');
    this.el.hud.classList.add('is-hidden');
    this.el.hud.setAttribute('aria-hidden', 'true');
  }

  hideMenu() {
    this.menuVisible = false;
    this.el.menu.classList.add('is-leaving');
    this.el.hud.classList.remove('is-hidden');
    this.el.hud.setAttribute('aria-hidden', 'false');
  }

  openHowTo() { this.el.howto.hidden = false; }
  closeHowTo() { this.el.howto.hidden = true; }

  showPause(show) {
    this.pauseOpen = show;
    this.el.pause.hidden = !show;
  }

  showEnd(victory, stats) {
    this.el.end.hidden = false;
    this.el.end.classList.toggle('defeat', !victory);
    this.el.endKicker.textContent = victory ? 'THE ASHLANDS ARE YOURS' : 'THE FIRE RETURNS';
    this.el.endTitle.textContent = victory ? 'A Crown of Ash' : 'The Last Hearth Fails';
    this.el.endDesc.textContent = victory
      ? 'Five raids broken. The chronicles will remember your name.'
      : 'The Town Center has fallen. Your kingdom returns to embers.';
    this.el.endWaves.textContent = stats.waves;
    this.el.endKills.textContent = formatNumber(stats.kills);
    this.el.endGathered.textContent = formatNumber(stats.gathered);
    this.el.endTime.textContent = formatTime(stats.time);
    this.el.endIcon.innerHTML = `<use href="#${victory ? 'i-crown' : 'i-flame'}"/>`;
    this.el.pause.hidden = true;
    this.pauseOpen = false;
  }

  hideEnd() { this.el.end.hidden = true; }

  showBoons(choices, onChoose) {
    this.boonSelection = null;
    this.boonsOpen = true;
    this.boonChoices = choices;
    this.onBoonChoose = onChoose;
    this.el.claim.disabled = true;
    this.el.boon.hidden = false;
    this.el.boonGrid.innerHTML = '';
    choices.forEach((boon, i) => {
      const card = document.createElement('button');
      card.className = 'boon-card';
      card.dataset.index = i;
      card.innerHTML = `
        <div class="boon-rarity">${boon.rarity}</div>
        <div class="boon-medallion"><svg><use href="#i-${ICON_FOR[boon.icon] || 'shield'}"/></svg></div>
        <div class="boon-name">${boon.name}</div>
        <div class="boon-divider"></div>
        <p class="boon-desc">${boon.desc}</p>
        <span class="boon-key">KEY ${i + 1}</span>
      `;
      card.addEventListener('click', () => { this.sound?.click(); this.selectBoon(i); });
      this.el.boonGrid.appendChild(card);
    });
  }

  selectBoon(index) {
    if (!this.boonsOpen) return;
    this.boonSelection = index;
    [...this.el.boonGrid.children].forEach((c, i) => c.classList.toggle('selected', i === index));
    this.el.claim.disabled = index == null;
    this.sound?.select();
  }

  claimBoon() {
    if (this.boonSelection == null || !this.boonsOpen) return;
    const choice = this.boonChoices[this.boonSelection];
    this.boonsOpen = false;
    this.el.boon.hidden = true;
    this.sound?.boon();
    this.onBoonChoose?.(choice);
    this.boonSelection = null;
  }

  hideBoons() {
    this.boonsOpen = false;
    this.el.boon.hidden = true;
  }

  toast(text, type = '', duration = 3000) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = text;
    this.el.toastStack.appendChild(el);
    this.toastEls.push(el);
    while (this.toastEls.length > 4) {
      const old = this.toastEls.shift();
      old.remove();
    }
    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 420);
      this.toastEls = this.toastEls.filter(t => t !== el);
    }, duration);
  }

  setPlacement(placement) {
    if (!placement) {
      this.el.placementHint.classList.remove('is-open');
      return;
    }
    this.el.placementName.textContent = BUILDING_TYPES[placement.type]?.name || 'building';
    this.el.placementHint.classList.add('is-open');
  }

  update(game) {
    if (this.menuVisible) return;
    this.hudUpdate += 1;
    const t = performance.now();
    if (t - (this.lastHudPaint || 0) > 90) {
      this.lastHudPaint = t;
      this.paintHUD(game);
      this.drawMinimap(game);
    }
    this.updateSelection();
    this.updateHover(game);
  }

  paintHUD(game) {
    const r = game.resources;
    this.el.food.textContent = formatNumber(r.food);
    this.el.wood.textContent = formatNumber(r.wood);
    this.el.gold.textContent = formatNumber(r.gold);
    this.el.stone.textContent = formatNumber(r.stone);
    this.el.pop.textContent = game.population;
    this.el.cap.textContent = game.popCap;
    this.el.idleCount.textContent = game.idleVillagers;
    this.el.idleButton.classList.toggle('empty', game.idleVillagers === 0);

    const waveNum = Math.min(5, game.waveIndex + 1);
    this.el.objectiveWaves.textContent = `${Math.min(game.waveIndex, 5)} / 5`;
    const tc = game.getTownCenter();
    this.el.objectiveHp.textContent = tc ? `${Math.max(0, Math.round(tc.hp / tc.maxHp * 100))}%` : 'LOST';
    this.el.objectiveBoons.textContent = game.boons.length;
    this.el.minimapDay.textContent = `DAY ${roman(waveNum)}`;

    if (game.phase === 'prep') {
      const remaining = Math.max(0, game.prepTimer);
      this.el.waveKicker.textContent = `WAVE ${roman(waveNum)} OF V`;
      this.el.waveTitle.textContent = game.waveName;
      this.el.waveClock.textContent = formatTime(remaining);
      this.el.waveProgress.style.width = `${(1 - remaining / game.prepTotal) * 100}%`;
      this.el.waveBanner.classList.toggle('is-danger', remaining < 8);
    } else if (game.phase === 'wave') {
      this.el.waveKicker.textContent = 'THE RAID IS UPON YOU';
      this.el.waveTitle.textContent = game.waveName;
      this.el.waveClock.textContent = `${game.enemiesAlive} FOE${game.enemiesAlive === 1 ? '' : 'S'}`;
      const total = Math.max(1, game.waveTotal);
      this.el.waveProgress.style.width = `${clamp((1 - game.enemiesAlive / total) * 100, 0, 100)}%`;
      this.el.waveBanner.classList.toggle('is-danger', game.enemiesAlive > 0 && game.enemyPressure);
    } else if (game.phase === 'boon') {
      this.el.waveKicker.textContent = 'THE RAID IS BROKEN';
      this.el.waveTitle.textContent = 'Choose a boon';
      this.el.waveClock.textContent = '—';
      this.el.waveProgress.style.width = '100%';
    } else if (game.phase === 'victory') {
      this.el.waveKicker.textContent = 'THE ASHLANDS ARE YOURS';
      this.el.waveTitle.textContent = 'A Crown of Ash';
      this.el.waveClock.textContent = 'V / V';
      this.el.waveProgress.style.width = '100%';
    } else if (game.phase === 'defeat') {
      this.el.waveKicker.textContent = 'THE FIRE RETURNS';
      this.el.waveTitle.textContent = 'The Last Hearth Fails';
      this.el.waveClock.textContent = '—';
      this.el.waveProgress.style.width = '0%';
    }
    this.updateCommandAffordability(game);
  }

  updateHover(game) {
    const tooltip = this.el.tooltip;
    const target = game.hoveredResource || game.hovered;
    if (!target || game.grabbing || game.placement || game.inMenu) {
      tooltip.style.display = 'none';
      return;
    }
    tooltip.style.display = 'block';
    const mx = game.mouse.x, my = game.mouse.y;
    let name = '', sub = '';
    if (target.maxAmount !== undefined) {
      name = resourceName(target);
      sub = `${target.resource.toUpperCase()} · ${Math.round(target.amount)} remaining`;
    } else {
      const def = target.w ? BUILDING_TYPES[target.type] : UNIT_TYPES[target.type];
      name = def?.name || target.type;
      if (target.w) sub = `${target.team === 'player' ? 'Your realm' : 'Enemy'} · ${Math.max(0, Math.round(target.hp))} / ${Math.round(target.maxHp)} HP`;
      else sub = `${target.team === 'player' ? 'Your realm' : 'Enemy'} · ${target.hp > 0 ? Math.round(target.hp) : 0} / ${Math.round(target.maxHp)} HP`;
    }
    tooltip.innerHTML = `<b>${name}</b><span>${sub}</span>`;
    const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
    tooltip.style.left = `${Math.min(mx + 16, window.innerWidth - tw - 10)}px`;
    tooltip.style.top = `${Math.min(my + 18, window.innerHeight - th - 10)}px`;
  }

  selectionSignature(game) {
    return game.selection.map(e => `${e.id}:${e.type}:${e.team}`).join('|');
  }

  updateSelection(force = false) {
    const game = this.game;
    const sig = this.selectionSignature(game);
    if (force || sig !== this.lastSignature) {
      this.lastSignature = sig;
      this.renderSelection(game);
      this.renderCommands(game);
    } else {
      const one = game.selection[0];
      if (one) {
        const ratio = clamp(one.hp / one.maxHp, 0, 1);
        this.el.selectionHp.style.width = `${ratio * 100}%`;
        this.el.selectionHp.style.background = one.team === 'enemy' ? 'linear-gradient(90deg,#7c3028,#c06353)' : ratio < 0.3 ? 'linear-gradient(90deg,#7d3328,#b95043)' : 'linear-gradient(90deg,#3f7145,#79a45d)';
        this.el.selectionHpText.textContent = `${Math.max(0, Math.round(one.hp))} / ${Math.round(one.maxHp)}`;
      }
      this.updateCommandAffordability(game);
    }
  }

  renderSelection(game) {
    const sel = game.selection;
    const el = this.el;
    if (!sel.length) {
      el.selectionName.textContent = "Lord's Retinue";
      el.selectionSub.textContent = 'Select a unit or building';
      el.selectionHp.style.width = '100%';
      el.selectionHpText.textContent = '—';
      el.selectionStats.innerHTML = `<span>Click a unit</span><span>·</span><span>drag to select</span>`;
      el.selectionCount.hidden = true;
      el.panelHint.textContent = 'Right-click resources to gather · Right-click enemies to attack';
      this.drawPortrait(null);
      return;
    }
    if (sel.length > 1) {
      const units = sel.filter(e => e.team === 'player');
      const names = [...new Set(units.map(u => UNIT_TYPES[u.type]?.name).filter(Boolean))];
      el.selectionName.textContent = `${sel.length} ${names.length === 1 ? plural(names[0]) : 'warriors'}`;
      el.selectionSub.textContent = names.slice(0, 3).join(' · ') || 'Selected company';
      const hp = units.reduce((s, u) => s + Math.max(0, u.hp), 0);
      const max = units.reduce((s, u) => s + u.maxHp, 0) || 1;
      el.selectionHp.style.width = `${clamp(hp / max, 0, 1) * 100}%`;
      el.selectionHpText.textContent = `${Math.round(hp)} / ${Math.round(max)}`;
      el.selectionStats.innerHTML = `<span><b>${units.length}</b> under arms</span><span><b>${units.filter(u => u.type === 'villager').length}</b> villagers</span>`;
      el.selectionCount.hidden = false;
      el.selectionCount.textContent = String(sel.length);
      el.panelHint.textContent = 'Drag to add more · Right-click to move · 1 stop · 2 hold';
      this.drawPortrait('group', sel);
      return;
    }
    const e = sel[0];
    el.selectionCount.hidden = true;
    if (e.w) {
      const def = BUILDING_TYPES[e.type];
      el.selectionName.textContent = def.name;
      el.selectionSub.textContent = e.construction < 1 ? `Raising · ${Math.round(e.construction * 100)}%` : (e.team === 'player' ? 'Your realm' : 'Enemy stronghold');
      const ratio = clamp(e.hp / e.maxHp, 0, 1);
      el.selectionHp.style.width = `${ratio * 100}%`;
      el.selectionHp.style.background = e.team === 'enemy' ? 'linear-gradient(90deg,#7c3028,#c06353)' : ratio < 0.3 ? 'linear-gradient(90deg,#7d3328,#b95043)' : 'linear-gradient(90deg,#3f7145,#79a45d)';
      el.selectionHpText.textContent = `${Math.max(0, Math.round(e.hp))} / ${Math.round(e.maxHp)}`;
      let stats = `<span><b>${Math.round(e.maxHp)}</b> hp</span>`;
      if (def.pop) stats += `<span><b>+${def.pop}</b> pop</span>`;
      if (def.attack) stats += `<span><b>${Math.round(def.attack * (e.team === 'player' ? game.effects.towerDamageMul : 1))}</b> atk</span>`;
      if (e.queue?.length) stats += `<span><b>Training:</b> ${UNIT_TYPES[e.queue[0].type].name} (${Math.ceil(e.queue[0].remaining)}s)</span>`;
      el.selectionStats.innerHTML = stats;
      el.panelHint.textContent = def.dropoff ? 'Training hall · Right-click raiders to defend' : def.pop ? 'Provides shelter and population' : 'Your command post';
      this.drawPortrait(e);
    } else {
      const def = UNIT_TYPES[e.type];
      el.selectionName.textContent = def.name;
      el.selectionSub.textContent = this.unitStatus(game, e);
      const ratio = clamp(e.hp / e.maxHp, 0, 1);
      el.selectionHp.style.width = `${ratio * 100}%`;
      el.selectionHp.style.background = ratio < 0.3 ? 'linear-gradient(90deg,#7d3328,#b95043)' : 'linear-gradient(90deg,#3f7145,#79a45d)';
      el.selectionHpText.textContent = `${Math.max(0, Math.round(e.hp))} / ${Math.round(e.maxHp)}`;
      el.selectionStats.innerHTML = `<span><b>${Math.round(def.attack * (e.team === 'player' ? game.damageMul(e) : 1))}</b> atk</span><span><b>${def.range > 2 ? def.range + game.effects.archerRange * (e.type === 'archer' ? 1 : 0) : 'melee'}</b> range</span><span><b>${def.role}</b></span>${e.carry > 0 ? `<span><b>${Math.round(e.carry)}</b> ${e.carryType}</span>` : ''}`;
      el.panelHint.textContent = e.type === 'villager'
        ? 'Right-click a resource to gather · Build with the commands above'
        : 'Right-click an enemy to attack · Right-click ground to march';
      this.drawPortrait(e);
    }
    el.selectionPanel.classList.toggle('is-villager', e.type === 'villager');
  }

  unitStatus(game, u) {
    if (u.state === 'gather') return `Gathering ${u.gatherTarget?.resource || 'resources'}`;
    if (u.state === 'return') return 'Hauling to the Town Center';
    if (u.state === 'build') return `Building ${BUILDING_TYPES[u.buildTarget?.type]?.name || 'structure'}`;
    if (u.state === 'attack') return 'In combat';
    if (u.state === 'move') return 'Marching';
    if (u.state === 'hold') return 'Holding ground';
    if (u.team === 'enemy') return 'Raider';
    return 'Awaiting orders';
  }

  renderCommands(game) {
    const sig = this.commandSignature(game);
    this.lastCommandSignature = sig;
    const commands = this.getCommands(game);
    const grid = this.el.commandGrid;
    grid.innerHTML = '';
    commands.slice(0, 6).forEach((cmd, i) => {
      const b = document.createElement('button');
      b.className = 'command-button';
      b.dataset.command = cmd.id;
      b.title = cmd.tooltip || cmd.label;
      b.innerHTML = `<span class="hotkey">${i + 1}</span>${cmd.tag ? `<span class="cmd-tag">${cmd.tag}</span>` : ''}<svg><use href="#i-${ICON_FOR[cmd.icon] || 'sword'}"/></svg><span class="cmd-label">${cmd.label}</span>${cmd.cost ? `<span class="cmd-cost">${cmd.cost}</span>` : ''}`;
      b.addEventListener('click', () => { this.sound?.click(); this.callbacks.command?.(cmd.id); });
      grid.appendChild(b);
    });
    this.updateCommandAffordability(game);
  }

  commandSignature(game) {
    return game.selection.map(e => `${e.id}:${e.type}:${e.team}:${Math.floor(e.construction * 5)}`).join('|') + `:${game.phase}`;
  }

  getCommands(game) {
    const sel = game.selection;
    if (!sel.length) return [];
    const onlyBuildings = sel.every(e => e.w);
    if (onlyBuildings && sel.length === 1) {
      const b = sel[0];
      if (b.team !== 'player' || b.construction < 1) return [];
      const trainable = TRAINABLE[b.type] || [];
      return trainable.map(type => {
        const def = UNIT_TYPES[type];
        return {
          id: `train:${type}`, label: def.name, icon: def.icon,
          cost: shortCost(game.unitCost(type)), hotkey: def.hotkey,
          tooltip: `Train ${def.name} — ${shortCost(game.unitCost(type))} · ${def.trainTime}s`,
        };
      });
    }
    const playerSel = sel.filter(e => e.team === 'player' && !e.w);
    const hasVillager = playerSel.some(u => u.type === 'villager');
    const commands = [];
    if (hasVillager && playerSel.every(u => u.type === 'villager')) {
      for (const type of ['house', 'farm', 'barracks', 'tower']) {
        const def = BUILDING_TYPES[type];
        commands.push({
          id: `build:${type}`, label: def.name, icon: def.icon,
          cost: shortCost(def.cost), tooltip: `Build ${def.name} — ${shortCost(def.cost)} · ${def.buildTime}s`,
        });
      }
    }
    if (playerSel.some(u => u.type !== 'villager')) {
      commands.push({ id: 'stop', label: 'Stop', icon: 'stop', tooltip: 'Halt current orders (1)' });
      commands.push({ id: 'hold', label: 'Hold', icon: 'hold', tooltip: 'Hold ground and defend (2)' });
    } else if (hasVillager) {
      commands.push({ id: 'stop', label: 'Stop', icon: 'stop', tooltip: 'Halt current orders (1)' });
    }
    return commands;
  }

  updateCommandAffordability(game) {
    const buttons = this.el.commandGrid.children;
    for (const b of buttons) {
      const id = b.dataset.command;
      if (!id) continue;
      let cost = null;
      if (id.startsWith('train:')) cost = game.unitCost(id.slice(6));
      else if (id.startsWith('build:')) cost = BUILDING_TYPES[id.slice(6)].cost;
      if (cost) {
        const afford = game.canAfford(cost);
        b.classList.toggle('unaffordable', !afford);
      }
    }
    this.updateCommandProgress();
  }

  updateCommandProgress() {
    const game = this.game;
    const one = game.selection.length === 1 ? game.selection[0] : null;
    if (!one?.w) return;
    const first = one.queue?.[0];
    if (!first) {
      const sub = this.el.selectionSub;
      if (sub && sub.textContent.startsWith('Training:')) this.renderSelection(game);
      return;
    }
    this.el.selectionSub.textContent = `Training ${UNIT_TYPES[first.type].name} · ${Math.ceil(first.remaining)}s`;
  }

  drawPortrait(entity, selection) {
    const ctx = this.portraitCtx;
    const c = this.el.portrait;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    const grad = ctx.createRadialGradient(90, 60, 8, 90, 90, 120);
    grad.addColorStop(0, '#4f5d3d');
    grad.addColorStop(0.65, '#2d3627');
    grad.addColorStop(1, '#161c14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = 'rgba(213,173,88,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(90, 90, 74, 0, 6.3); ctx.stroke();
    if (!entity) {
      ctx.fillStyle = 'rgba(209,180,116,0.32)';
      ctx.font = '700 54px Cinzel, serif'; ctx.textAlign = 'center';
      ctx.fillText('⚜', 90, 108);
      return;
    }
    if (entity === 'group') {
      this.drawPortraitGroup(ctx, selection);
      return;
    }
    if (entity.w) {
      this.drawPortraitBuilding(ctx, entity);
      return;
    }
    this.drawPortraitUnit(ctx, entity);
  }

  drawPortraitUnit(ctx, u) {
    const def = UNIT_TYPES[u.type];
    const team = u.team === 'player' ? PLAYER_COLORS : ENEMY_COLORS;
    ctx.save();
    ctx.translate(90, 96);
    ctx.scale(2.9, 2.9);
    ctx.fillStyle = 'rgba(7,9,5,0.24)';
    ctx.beginPath(); ctx.ellipse(0, 10, 20, 5, 0, 0, 6.3); ctx.fill();
    if (u.type === 'knight') {
      ctx.fillStyle = '#6d4a2e'; ctx.beginPath(); ctx.ellipse(-2, 2, 18, 8, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = team.cloth; ctx.fillRect(-8, -6, 16, 10);
      ctx.fillStyle = '#b9b8ad'; ctx.beginPath(); ctx.arc(0, -15, 6.5, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#77776f'; ctx.beginPath(); ctx.arc(0, -17, 7, Math.PI, 0); ctx.fill();
      ctx.fillStyle = team.trim; ctx.beginPath(); ctx.moveTo(-5, -22); ctx.lineTo(0, -30); ctx.lineTo(5, -22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#d7d5c8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(7, -4); ctx.lineTo(19, -25); ctx.stroke();
    } else {
      ctx.fillStyle = team.cloth;
      ctx.beginPath(); ctx.moveTo(-8, 10); ctx.lineTo(-9, -10); ctx.quadraticCurveTo(0, -16, 9, -10); ctx.lineTo(8, 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = team.primary; ctx.fillRect(-8, -3, 16, 3);
      ctx.fillStyle = '#c79c78'; ctx.beginPath(); ctx.arc(0, -17, 6, 0, 6.3); ctx.fill();
      if (u.type === 'villager') {
        ctx.fillStyle = '#8a673d'; ctx.beginPath(); ctx.ellipse(0, -21, 8, 3.2, 0, 0, 6.3); ctx.fill();
        ctx.strokeStyle = '#5f4829'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(8, -10); ctx.lineTo(15, -26); ctx.stroke();
        ctx.fillStyle = '#8a8172'; ctx.beginPath(); ctx.moveTo(13, -26); ctx.lineTo(19, -24); ctx.lineTo(15, -19); ctx.closePath(); ctx.fill();
      } else if (u.type === 'archer' || u.type === 'marauder') {
        ctx.fillStyle = '#344a31'; ctx.beginPath(); ctx.arc(0, -18, 7, Math.PI, 6.3); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-6, -19); ctx.lineTo(-12, -9); ctx.lineTo(-4, -13); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#8c6937'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(11, -4, 11, -1.4, 1.4); ctx.stroke();
      } else if (u.type === 'brute' || u.type === 'warlord') {
        ctx.fillStyle = '#4a4540'; ctx.beginPath(); ctx.arc(0, -20, 8, Math.PI, 6.3); ctx.fill();
        ctx.fillStyle = u.type === 'warlord' ? '#d1a456' : '#8e897d';
        ctx.beginPath(); ctx.moveTo(-8, -23); ctx.lineTo(-13, -33); ctx.lineTo(-2, -27); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(8, -23); ctx.lineTo(13, -33); ctx.lineTo(2, -27); ctx.closePath(); ctx.fill();
      } else {
        ctx.fillStyle = '#8d8b80'; ctx.beginPath(); ctx.arc(0, -19, 6.5, Math.PI, 0); ctx.fill();
        ctx.fillStyle = team.primary; ctx.beginPath(); ctx.ellipse(-10, -5, 6, 9, 0.1, 0, 6.3); ctx.fill();
        ctx.strokeStyle = '#d5d8cf'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(8, -9); ctx.lineTo(18, -30); ctx.stroke();
      }
    }
    ctx.restore();
    this.portraitCaption(ctx, def.role, team.primary);
  }

  drawPortraitGroup(ctx, selection) {
    ctx.save();
    ctx.translate(90, 103);
    for (let i = 0; i < Math.min(3, selection.length); i++) {
      ctx.save();
      ctx.translate((i - 1) * 27, -6 + Math.abs(i - 1) * 6);
      ctx.scale(1.7, 1.7);
      const u = selection[i];
      const team = u.team === 'player' ? PLAYER_COLORS : ENEMY_COLORS;
      ctx.fillStyle = team.cloth;
      ctx.beginPath(); ctx.moveTo(-6, 12); ctx.lineTo(-7, -9); ctx.quadraticCurveTo(0, -14, 7, -9); ctx.lineTo(6, 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c79c78'; ctx.beginPath(); ctx.arc(0, -16, 5, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#8d8b80'; ctx.beginPath(); ctx.arc(0, -17, 5.5, Math.PI, 0); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    this.portraitCaption(ctx, 'War Party', PLAYER_COLORS.primary);
  }

  drawPortraitBuilding(ctx, b) {
    const def = BUILDING_TYPES[b.type];
    ctx.save();
    ctx.translate(90, 108);
    ctx.fillStyle = 'rgba(7,9,5,0.25)'; ctx.beginPath(); ctx.ellipse(0, 21, 46, 13, 0, 0, 6.3); ctx.fill();
    const wall = '#9d8d6e', roof = b.team === 'player' ? '#6d3b2d' : '#552b25', roofLight = b.team === 'player' ? '#92513c' : '#78372f';
    ctx.fillStyle = wall;
    if (b.type === 'tower') {
      ctx.fillRect(-17, -34, 34, 56);
      ctx.fillStyle = '#7c715a'; ctx.fillRect(2, -34, 15, 56);
      ctx.fillStyle = '#8a8068'; for (let i = -1; i <= 1; i++) ctx.fillRect(i * 12 - 5, -40, 10, 6);
      ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(-25, -40); ctx.lineTo(0, -66); ctx.lineTo(25, -40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = roofLight; ctx.beginPath(); ctx.moveTo(0, -66); ctx.lineTo(25, -40); ctx.lineTo(2, -40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#332616'; ctx.fillRect(-3, -18, 6, 13);
    } else if (b.type === 'towncenter') {
      ctx.fillStyle = wall; ctx.fillRect(-34, -28, 68, 50);
      ctx.fillStyle = '#b6a580'; ctx.fillRect(-34, -28, 38, 50);
      ctx.fillStyle = '#7a6f59'; ctx.fillRect(12, -28, 22, 50);
      ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(-43, -28); ctx.lineTo(0, -60); ctx.lineTo(43, -28); ctx.closePath(); ctx.fill();
      ctx.fillStyle = roofLight; ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(43, -28); ctx.lineTo(2, -28); ctx.closePath(); ctx.fill();
      ctx.fillStyle = wall; ctx.fillRect(-14, -56, 28, 30);
      ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(-20, -56); ctx.lineTo(0, -76); ctx.lineTo(20, -56); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e5b563'; ctx.fillRect(-5, -42, 10, 13);
      ctx.fillStyle = '#3b2a18'; ctx.fillRect(-7, -8, 14, 18);
      ctx.strokeStyle = '#5f4a29'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-34, -7); ctx.lineTo(34, -7); ctx.moveTo(-12, -28); ctx.lineTo(-12, 22); ctx.moveTo(16, -28); ctx.lineTo(16, 22); ctx.stroke();
    } else if (b.type === 'farm') {
      ctx.fillStyle = '#6f5a31'; ctx.beginPath(); ctx.moveTo(-45, 6); ctx.lineTo(-12, -16); ctx.lineTo(45, 6); ctx.lineTo(12, 26); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#b29248'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-40 + i * 13, 9 - i * 4); ctx.lineTo(-8 + i * 13, 25 - i * 4); ctx.stroke(); }
      ctx.strokeStyle = '#5b4324'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-39, 2); ctx.lineTo(-16, -13); ctx.moveTo(33, 4); ctx.lineTo(14, -11); ctx.stroke();
    } else {
      ctx.fillStyle = wall; ctx.fillRect(-30, -18, 60, 40);
      ctx.fillStyle = '#b3a17e'; ctx.fillRect(-30, -18, 32, 40);
      ctx.fillStyle = '#7f7360'; ctx.fillRect(8, -18, 22, 40);
      ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(-38, -18); ctx.lineTo(0, -44); ctx.lineTo(38, -18); ctx.closePath(); ctx.fill();
      ctx.fillStyle = roofLight; ctx.beginPath(); ctx.moveTo(0, -44); ctx.lineTo(38, -18); ctx.lineTo(2, -18); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#382717'; ctx.fillRect(-9, -1, 18, 24);
      ctx.fillStyle = '#e1ab59'; ctx.fillRect(17, -6, 8, 10);
      ctx.strokeStyle = '#5f4a29'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-30, 1); ctx.lineTo(30, 1); ctx.stroke();
    }
    ctx.restore();
    this.portraitCaption(ctx, b.team === 'player' ? 'Your Realm' : 'Raider Camp', b.team === 'player' ? PLAYER_COLORS.primary : ENEMY_COLORS.primary);
  }

  portraitCaption(ctx, text, color) {
    ctx.fillStyle = color;
    ctx.fillRect(58, 161, 64, 2);
    ctx.fillStyle = 'rgba(18,15,10,0.8)';
    ctx.fillRect(32, 149, 116, 15);
    ctx.fillStyle = 'rgba(235,218,176,0.85)';
    ctx.font = '8px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText(text.toUpperCase(), 90, 159);
  }

  drawMinimap(game) {
    const ctx = this.miniCtx;
    const W = this.el.minimap.width, H = this.el.minimap.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#101711'; ctx.fillRect(0, 0, W, H);
    const cellW = W / game.world.size, cellH = H / game.world.size;
    if (!this.minimapCache || this.minimapCacheSeed !== game.world.seed) {
      const cache = document.createElement('canvas');
      cache.width = W; cache.height = H;
      const c = cache.getContext('2d');
      for (let y = 0; y < game.world.size; y++) {
        for (let x = 0; x < game.world.size; x++) {
          const tile = game.world.tiles[y * game.world.size + x];
          const colors = {
            grass: '#4f6030', forest: '#374b27', dirt: '#75603e', cobble: '#6d624d',
            sand: '#8d764d', water: '#2c555b', rock: '#625e50',
          };
          c.fillStyle = colors[tile.terrain] || '#4f6030';
          c.fillRect(x * cellW, y * cellH, Math.ceil(cellW), Math.ceil(cellH));
          if (tile.variant === 2) {
            c.fillStyle = 'rgba(255,240,180,0.025)';
            c.fillRect(x * cellW, y * cellH, cellW, cellH);
          }
        }
      }
      for (const n of game.world.resources) {
        if (!n.alive) continue;
        c.fillStyle = n.resource === 'wood' ? 'rgba(54,83,43,0.65)' : n.resource === 'gold' ? 'rgba(203,164,73,0.7)' : n.resource === 'stone' ? 'rgba(159,156,140,0.7)' : 'rgba(162,113,82,0.7)';
        c.fillRect(n.x * cellW - 1, n.y * cellH - 1, 2.5, 2.5);
      }
      this.minimapCache = cache;
      this.minimapCacheSeed = game.world.seed;
    }
    ctx.drawImage(this.minimapCache, 0, 0, W, H);
    ctx.fillStyle = 'rgba(32, 22, 12, 0.16)';
    ctx.fillRect(0, 0, W, H);

    const toMap = (x, y) => ({ x: x / game.world.size * W, y: y / game.world.size * H });
    for (const b of game.buildings) {
      if (!b.alive) continue;
      const p = toMap(b.x + b.w / 2, b.y + b.h / 2);
      ctx.fillStyle = b.team === 'player' ? '#7fb3c2' : '#a63f35';
      const s = b.type === 'towncenter' ? 7 : 4.5;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      if (b.selected) { ctx.strokeStyle = '#f1d28c'; ctx.lineWidth = 1.5; ctx.strokeRect(p.x - s / 2 - 1, p.y - s / 2 - 1, s + 2, s + 2); }
    }
    for (const u of game.units) {
      if (!u.alive) continue;
      const p = toMap(u.x, u.y);
      ctx.fillStyle = u.team === 'player' ? '#a1d2db' : '#dd6b5a';
      ctx.beginPath(); ctx.arc(p.x, p.y, u.team === 'player' ? 1.5 : 1.7, 0, 6.3); ctx.fill();
      if (u.selected) { ctx.strokeStyle = '#f6dfa3'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, 6.3); ctx.stroke(); }
    }
    for (const camp of game.world.camps) {
      const p = toMap(camp.x, camp.y);
      ctx.fillStyle = '#c14d3e';
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 4); ctx.lineTo(p.x + 4, p.y + 3); ctx.lineTo(p.x - 4, p.y + 3); ctx.closePath(); ctx.fill();
    }
    const corners = [
      this.screenToWorld(game, 0, 64), this.screenToWorld(game, this.el.minimap.ownerDocument.defaultView.innerWidth, 64),
      this.screenToWorld(game, this.el.minimap.ownerDocument.defaultView.innerWidth, this.el.minimap.ownerDocument.defaultView.innerHeight - 200),
      this.screenToWorld(game, 0, this.el.minimap.ownerDocument.defaultView.innerHeight - 200),
    ].map(p => toMap(p.x, p.y));
    ctx.strokeStyle = 'rgba(239,215,159,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    corners.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath(); ctx.stroke();
  }

  screenToWorld(game, sx, sy) {
    const px = (sx - window.innerWidth / 2) / game.camera.zoom + game.camera.x;
    const py = (sy - window.innerHeight / 2) / game.camera.zoom + game.camera.y;
    return { x: px / 64 + py / 32, y: py / 32 - px / 64 };
  }
}

function resourceName(n) {
  if (n.resource === 'wood') return n.kind === 'pine' ? 'Pine Stand' : 'Oak Stand';
  if (n.resource === 'gold') return 'Gold Vein';
  if (n.resource === 'stone') return 'Stone Outcrop';
  if (n.kind === 'berry') return 'Berry Bush';
  if (n.kind === 'sheep') return 'Sheep';
  return 'Resource';
}

function plural(name) {
  if (name.endsWith('man')) return name.slice(0, -2) + 'en';
  if (name.endsWith('s')) return name;
  return name + 's';
}
