import { BUILDING_TYPES, UNIT_TYPES, TRAINABLE, BUILD_OPTIONS, BOONS, WAVES, AGE_COSTS, CIVILIZATIONS, BIOMES, PLAYER_COLORS, ENEMY_COLORS } from './data.js';
import { formatNumber, formatTime, roman, clamp } from './utils.js';
import { applyStaticTranslations, getLocale, localeOptions, setLocale as setAppLocale, t } from './i18n.js';

const ICON_FOR = {
  food: 'food', wood: 'wood', gold: 'gold', stone: 'stone',
  villager: 'villager', militia: 'sword', archer: 'bow', knight: 'horse',
  house: 'house', farm: 'farm', barracks: 'sword', tower: 'tower',
  stop: 'stop', hold: 'hold', sword: 'sword', bow: 'bow', horse: 'horse',
  hammer: 'hammer', skull: 'skull', speed: 'speed', hourglass: 'hourglass',
  shield: 'shield', flame: 'flame', coin: 'coin', crown: 'crown', scroll: 'scroll',
  spear: 'sword', javelin: 'bow', elephant: 'shield', ram: 'hammer', commander: 'crown',
  decoy: 'scroll', age: 'hourglass', aegis: 'shield', mark: 'flame', control: 'speed',
};

const shortCost = cost => Object.entries(cost).map(([k, v]) => `${v}${t(`resourceShort.${k}`)}`).join(' · ');

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
    this.trainingShownFor = null;
    this.hudUpdate = 0;
    this.minimapCache = null;
    this.menuVisible = true;
    this.$ = id => document.getElementById(id);
    applyStaticTranslations();
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
      bossBar: this.$('boss-bar'), bossName: this.$('boss-name'), bossFill: this.$('boss-fill'),
      bossHp: this.$('boss-hp'), ageLabel: this.$('objective-age'), minimapTitle: this.$('minimap-title'),
      intelCard: this.$('intel-card'), intelCountdown: this.$('intel-countdown'),
      intelUnits: this.$('intel-units'), intelGates: this.$('intel-gates'),
      intelHazard: this.$('intel-hazard'), intelAssist: this.$('intel-assist'),
      objectiveAssist: this.$('objective-assist'), objectiveAssistText: this.$('objective-assist-text'),
      civSelect: this.$('setup-civ'), biomeSelect: this.$('setup-biome'), seedInput: this.$('setup-seed'),
      localeSelect: this.$('setup-locale'),
      civBlurb: this.$('setup-civ-blurb'), biomeBlurb: this.$('setup-biome-blurb'),
      autoEcon: this.$('auto-econ'), autoMil: this.$('auto-mil'), boonHint: this.$('boon-hint-text'),
    };
    this.portraitCtx = this.el.portrait.getContext('2d');
    this.miniCtx = this.el.minimap.getContext('2d');
  }

  bind() {
    const clickSound = () => this.sound?.click();
    this.populateSetup();
    this.$('btn-start').addEventListener('click', () => { clickSound(); this.startWithSetup(); });
    this.$('btn-howto').addEventListener('click', () => { clickSound(); this.openHowTo(); });
    this.$('btn-howto-close').addEventListener('click', () => { clickSound(); this.closeHowTo(); });
    this.$('btn-howto-play').addEventListener('click', () => { clickSound(); this.closeHowTo(); this.startWithSetup(); });
    this.$('setup-civ')?.addEventListener('change', () => this.paintSetupBlurbs());
    this.$('setup-biome')?.addEventListener('change', () => this.paintSetupBlurbs());
    this.$('setup-locale')?.addEventListener('change', e => this.changeLocale(e.target.value));
    this.$('auto-econ')?.addEventListener('change', e => {
      this.game.autoEconomy = e.target.checked;
      this.toast(t(e.target.checked ? 'toast.stewardEnabled' : 'toast.stewardPaused', { name: t('steward.economy') }), '', 1800);
    });
    this.$('auto-mil')?.addEventListener('change', e => {
      this.game.autoMilitary = e.target.checked;
      this.toast(t(e.target.checked ? 'toast.stewardEnabled' : 'toast.stewardPaused', { name: t('steward.military') }), '', 1800);
    });
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

  populateSetup() {
    if (!this.el.civSelect || !this.el.biomeSelect) return;
    const civ = this.el.civSelect.value || 'TEU';
    const biome = this.el.biomeSelect.value || 'ashlands';
    this.el.civSelect.innerHTML = CIVILIZATIONS.map(c => `<option value="${c.id}">${t(`civ.${c.id}.name`)} · ${t(`civ.${c.id}.epithet`)}</option>`).join('');
    this.el.biomeSelect.innerHTML = BIOMES.map(b => `<option value="${b.id}">${t(`biome.${b.id}.name`)}</option>`).join('');
    this.el.civSelect.value = civ;
    this.el.biomeSelect.value = biome;
    if (this.el.localeSelect) {
      this.el.localeSelect.innerHTML = localeOptions().map(l => `<option value="${l.id}">${l.label}</option>`).join('');
      this.el.localeSelect.value = getLocale();
    }
    this.paintSetupBlurbs();
  }

  paintSetupBlurbs() {
    const civ = CIVILIZATIONS.find(c => c.id === this.el.civSelect?.value);
    const biome = BIOMES.find(b => b.id === this.el.biomeSelect?.value);
    if (this.el.civBlurb && civ) this.el.civBlurb.textContent = t(`civ.${civ.id}.trait`);
    if (this.el.biomeBlurb && biome) this.el.biomeBlurb.textContent = t(`biome.${biome.id}.trait`);
  }

  changeLocale(locale) {
    setAppLocale(locale);
    applyStaticTranslations();
    this.populateSetup();
    this.lastSignature = '';
    this.lastCommandSignature = '';
    this.renderSelection(this.game);
    this.renderCommands(this.game);
    this.paintHUD(this.game);
  }

  startWithSetup() {
    const seed = this.el.seedInput?.value.trim();
    const setup = {
      civ: this.el.civSelect?.value || 'TEU',
      biome: this.el.biomeSelect?.value || 'ashlands',
      seed: seed || null,
    };
    this.callbacks.start?.(setup);
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
    if (show) {
      if (this.el.autoEcon) this.el.autoEcon.checked = this.game.autoEconomy;
      if (this.el.autoMil) this.el.autoMil.checked = this.game.autoMilitary;
    }
  }

  showEnd(victory, stats) {
    this.el.end.hidden = false;
    this.el.end.classList.toggle('defeat', !victory);
    const civ = CIVILIZATIONS.find(c => c.id === (stats.civId || stats.civ?.id || stats.civ));
    const biome = BIOMES.find(b => b.id === (stats.biomeId || stats.biome?.id || stats.biome));
    this.el.endKicker.textContent = victory
      ? t('end.winKicker', { biome: (biome ? t(`biome.${biome.id}.name`) : t('end.frontier')).toUpperCase() })
      : t('end.lossKicker');
    this.el.endTitle.textContent = victory
      ? t('end.winTitle', { civ: civ ? t(`civ.${civ.id}.name`).replace(/^The /, '') : 'Riftwatch' })
      : t('end.lossTitle');
    this.el.endDesc.textContent = victory
      ? t('end.winDesc', { count: WAVES.length, civ: civ ? t(`civ.${civ.id}.name`) : t('end.yourRealm') })
      : t('end.lossDesc');
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
    if (this.el.boonHint) this.el.boonHint.textContent = t('boon.hint', { keys: '1 / 2 / 3' });
    this.el.boonGrid.innerHTML = '';
    choices.forEach((boon, i) => {
      const card = document.createElement('button');
      card.className = `boon-card rarity-${String(boon.rarity || 'common').toLowerCase()}`;
      card.dataset.index = i;
      card.innerHTML = `
        <div class="boon-rarity">${t(`rarity.${boon.rarity}`)}</div>
        <div class="boon-medallion"><svg><use href="#i-${ICON_FOR[boon.icon] || 'shield'}"/></svg></div>
        <div class="boon-name">${t(`boon.${boon.id}.name`)}</div>
        <div class="boon-divider"></div>
        <p class="boon-desc">${t(`boon.${boon.id}.desc`)}</p>
        <span class="boon-key">${t('boon.key', { n: i + 1 })}</span>
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
    this.el.placementName.textContent = BUILDING_TYPES[placement.type] ? t(`building.${placement.type}.name`) : t('placement.building');
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

    const waveNum = Math.min(WAVES.length, game.waveIndex + 1);
    this.el.objectiveWaves.textContent = `${Math.min(game.waveIndex, WAVES.length)} / ${WAVES.length}`;
    if (this.el.ageLabel) this.el.ageLabel.textContent = game.ageResearch
      ? t('age.researching', { age: t(`age.${game.ageResearch.level}`), seconds: Math.ceil(game.ageResearch.remaining) })
      : t(`age.${game.ageLevel}`);
    if (this.el.minimapTitle) this.el.minimapTitle.textContent = game.biome ? t(`biome.${game.biome.id}.name`) : t('end.frontier');
    const tc = game.getTownCenter();
    this.el.objectiveHp.textContent = tc ? `${Math.max(0, Math.round(tc.hp / tc.maxHp * 100))}%` : t('objective.lost');
    this.el.objectiveBoons.textContent = game.boons.length;
    this.el.minimapDay.textContent = t('minimap.day', { day: roman(waveNum) });

    if (game.phase === 'prep') {
      const remaining = Math.max(0, game.prepTimer);
      this.el.waveKicker.textContent = t('wave.kicker', { wave: roman(waveNum), total: roman(WAVES.length) });
      this.el.waveTitle.textContent = t(`wave.${game.waveIndex}.name`);
      this.el.waveClock.textContent = formatTime(remaining);
      this.el.waveProgress.style.width = `${(1 - remaining / game.prepTotal) * 100}%`;
      this.el.waveBanner.classList.toggle('is-danger', remaining < 8);
    } else if (game.phase === 'wave') {
      this.el.waveKicker.textContent = t('wave.upon');
      this.el.waveTitle.textContent = t(`wave.${game.waveIndex}.name`);
      this.el.waveClock.textContent = t(game.enemiesAlive === 1 ? 'wave.foeOne' : 'wave.foeMany', { count: game.enemiesAlive });
      const total = Math.max(1, game.waveTotal);
      this.el.waveProgress.style.width = `${clamp((1 - game.enemiesAlive / total) * 100, 0, 100)}%`;
      this.el.waveBanner.classList.toggle('is-danger', game.enemiesAlive > 0 && game.enemyPressure);
    } else if (game.phase === 'boon') {
      this.el.waveKicker.textContent = t('boon.kicker');
      this.el.waveTitle.textContent = t('wave.choose');
      this.el.waveClock.textContent = '—';
      this.el.waveProgress.style.width = '100%';
    } else if (game.phase === 'victory') {
      this.el.waveKicker.textContent = t('wave.endures');
      this.el.waveTitle.textContent = t('wave.confluence');
      this.el.waveClock.textContent = `${roman(WAVES.length)} / ${roman(WAVES.length)}`;
      this.el.waveProgress.style.width = '100%';
    } else if (game.phase === 'defeat') {
      this.el.waveKicker.textContent = t('wave.closes');
      this.el.waveTitle.textContent = t('wave.lastHearth');
      this.el.waveClock.textContent = '—';
      this.el.waveProgress.style.width = '0%';
    }
    this.paintIntel(game);
    const boss = game.bossAlive;
    if (this.el.bossBar) {
      this.el.bossBar.hidden = !boss || game.phase !== 'wave';
      if (boss) {
        this.el.bossName.textContent = t(`unit.${boss.type}.name`);
        this.el.bossFill.style.width = `${clamp(boss.hp / boss.maxHp, 0, 1) * 100}%`;
        this.el.bossHp.textContent = `${Math.max(0, Math.ceil(boss.hp))} / ${Math.ceil(boss.maxHp)}`;
      }
    }
    this.updateCommandAffordability(game);
  }

  paintIntel(game) {
    const plan = game.intel;
    const show = game.phase === 'prep' && !!plan;
    if (this.el.intelCard) this.el.intelCard.hidden = !show;
    if (show) {
      this.el.intelCountdown.textContent = formatTime(Math.max(0, game.prepTimer));
      this.el.intelUnits.textContent = plan.units.map(type => UNIT_TYPES[type] ? t(`unit.${type}.name`) : type).join('\u00a0· ') || '—';
      this.el.intelGates.textContent = plan.entrances.map(entry => t(`camp.${entry.gate}`)).join('\u00a0/ ') || '—';
      if (this.el.intelHazard) {
        this.el.intelHazard.hidden = !plan.hazard;
        if (plan.hazard) {
          const gates = plan.hazard.gates.filter(gate => game.world.camps[gate]).map(gate => t(`camp.${gate}`)).join(' · ');
          this.el.intelHazard.textContent = t('intel.hazard', { gates });
        }
      }
      if (this.el.intelAssist) {
        this.el.intelAssist.hidden = !plan.assist;
        this.el.intelAssist.textContent = plan.assist ? t('intel.assistDisabled') : '';
      }
    }
    if (this.el.objectiveAssist) {
      this.el.objectiveAssist.hidden = !game.assistActive;
      this.el.objectiveAssistText.textContent = game.assistActive ? t('objective.assistOff') : '—';
    }
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
      sub = t('tooltip.remaining', { resource: t(`resourceType.${target.resource}`), count: Math.round(target.amount) });
    } else {
      const def = target.w ? BUILDING_TYPES[target.type] : UNIT_TYPES[target.type];
      name = def ? t(`${target.w ? 'building' : 'unit'}.${target.type}.name`) : target.type;
      const side = t(target.team === 'player' ? 'tooltip.teamYou' : 'tooltip.teamEnemy');
      sub = `${side} · ${t('tooltip.hp', { hp: Math.max(0, Math.round(target.hp)), max: Math.round(target.maxHp) })}`;
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
    const cmdSig = this.commandSignature(game);
    if (force || sig !== this.lastSignature || cmdSig !== this.lastCommandSignature) {
      this.lastSignature = sig;
      this.lastCommandSignature = cmdSig;
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
      el.selectionName.textContent = t('selection.title');
      el.selectionSub.textContent = t('selection.emptySub');
      el.selectionHp.style.width = '100%';
      el.selectionHpText.textContent = '—';
      el.selectionStats.innerHTML = `<span>${t('selection.emptyStatClick')}</span><span>·</span><span>${t('selection.emptyStatDrag')}</span>`;
      el.selectionCount.hidden = true;
      el.panelHint.textContent = t('selection.emptyHint');
      this.drawPortrait(null);
      return;
    }
    if (sel.length > 1) {
      const units = sel.filter(e => e.team === 'player');
      const names = [...new Set(units.map(u => UNIT_TYPES[u.type] ? t(`unit.${u.type}.name`) : null).filter(Boolean))];
      el.selectionName.textContent = t('selection.groupTitle', { count: sel.length });
      el.selectionSub.textContent = names.slice(0, 3).join(' · ') || t('selection.groupSelected');
      const hp = units.reduce((s, u) => s + Math.max(0, u.hp), 0);
      const max = units.reduce((s, u) => s + u.maxHp, 0) || 1;
      el.selectionHp.style.width = `${clamp(hp / max, 0, 1) * 100}%`;
      el.selectionHpText.textContent = `${Math.round(hp)} / ${Math.round(max)}`;
      el.selectionStats.innerHTML = `<span><b>${units.length}</b> ${t('selection.groupUnderArms')}</span><span><b>${units.filter(u => u.type === 'villager').length}</b> ${t('selection.groupVillagers')}</span>`;
      el.selectionCount.hidden = false;
      el.selectionCount.textContent = String(sel.length);
      el.panelHint.textContent = t('selection.groupHint');
      this.drawPortrait('group', sel);
      return;
    }
    const e = sel[0];
    el.selectionCount.hidden = true;
    if (e.w) {
      const def = BUILDING_TYPES[e.type];
      el.selectionName.textContent = t(`building.${e.type}.name`);
      el.selectionSub.textContent = e.construction < 1
        ? t('selection.raising', { percent: Math.round(e.construction * 100) })
        : t(e.team === 'player' ? 'selection.yourRealm' : 'selection.enemyStronghold');
      const ratio = clamp(e.hp / e.maxHp, 0, 1);
      el.selectionHp.style.width = `${ratio * 100}%`;
      el.selectionHp.style.background = e.team === 'enemy' ? 'linear-gradient(90deg,#7c3028,#c06353)' : ratio < 0.3 ? 'linear-gradient(90deg,#7d3328,#b95043)' : 'linear-gradient(90deg,#3f7145,#79a45d)';
      el.selectionHpText.textContent = `${Math.max(0, Math.round(e.hp))} / ${Math.round(e.maxHp)}`;
      let stats = `<span><b>${Math.round(e.maxHp)}</b> ${t('selection.hp')}</span>`;
      if (def.pop) stats += `<span><b>+${def.pop}</b> ${t('selection.pop')}</span>`;
      if (def.attack) stats += `<span><b>${Math.round(def.attack * (e.team === 'player' && e.type === 'tower' ? game.effects.towerDamageMul : 1))}</b> ${t('selection.atk')}</span>`;
      if (e.queue?.length) stats += `<span><b>${t('selection.training')}</b> ${t(`unit.${e.queue[0].type}.name`)} (${Math.ceil(e.queue[0].remaining)}s)</span>`;
      el.selectionStats.innerHTML = stats;
      el.panelHint.textContent = def.dropoff ? t('selection.hintDropoff') : def.pop ? t('selection.hintPop') : e.type === 'towncenter' ? t('selection.hintTownCenter') : t('selection.hintBuilding');
      this.drawPortrait(e);
    } else {
      const def = UNIT_TYPES[e.type];
      el.selectionName.textContent = t(`unit.${e.type}.name`);
      el.selectionSub.textContent = this.unitStatus(game, e);
      const ratio = clamp(e.hp / e.maxHp, 0, 1);
      el.selectionHp.style.width = `${ratio * 100}%`;
      el.selectionHp.style.background = ratio < 0.3 ? 'linear-gradient(90deg,#7d3328,#b95043)' : 'linear-gradient(90deg,#3f7145,#79a45d)';
      el.selectionHpText.textContent = `${Math.max(0, Math.round(e.hp))} / ${Math.round(e.maxHp)}`;
      const atk = e.team === 'player' ? game.unitAttack(e) : def.attack;
      const range = e.team === 'player' ? game.unitRange(e) : def.range;
      const carryType = t(`selection.carryType.${e.carryType}`);
      el.selectionStats.innerHTML = `<span><b>${Math.round(atk)}</b> ${t('selection.atk')}</span><span><b>${range > 2 ? range.toFixed(1) : t('selection.melee')}</b> ${t('selection.range')}</span><span><b>${def.armor || 0}</b> ${t('selection.armor')}</span>${e.carry > 0 ? `<span><b>${Math.round(e.carry)}</b> ${carryType}</span>` : ''}`;
      el.panelHint.textContent = e.type === 'villager'
        ? t('selection.hintVillager')
        : e.type === 'commander'
          ? t('selection.hintHero')
          : t('selection.hintUnit');
      this.drawPortrait(e);
    }
    el.selectionPanel.classList.toggle('is-villager', e.type === 'villager');
  }

  unitStatus(game, u) {
    if (u.state === 'gather') return t('status.gathering', { resource: t(`resourceType.${u.gatherTarget?.resource || 'resource'}`) });
    if (u.state === 'return') return t('status.hauling');
    if (u.state === 'build') return t('status.building', { name: u.buildTarget?.type ? t(`building.${u.buildTarget.type}.name`) : t('status.structure') });
    if (u.state === 'attack') return t('status.combat');
    if (u.state === 'move') return t('status.marching');
    if (u.state === 'hold') return t('status.holding');
    if (u.team === 'enemy') return t('status.raider');
    return t('status.awaiting');
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
    const hero = game.hero;
    return game.selection.map(e => `${e.id}:${e.type}:${e.team}:${Math.floor(e.construction * 5)}`).join('|') + `:${game.phase}:a${game.ageLevel}:r${Math.ceil(game.ageResearch?.remaining || 0)}:h${game.heroControl}:${Math.ceil(hero?.markCd || 0)}:${Math.ceil(hero?.aegisCd || 0)}`;
  }

  getCommands(game) {
    const sel = game.selection;
    if (!sel.length) return [];
    const onlyBuildings = sel.every(e => e.w);
    if (onlyBuildings && sel.length === 1) {
      const b = sel[0];
      if (b.team !== 'player' || b.construction < 1) return [];
      const commands = [];
      if (b.type === 'towncenter' && b.team === 'player' && game.ageLevel < 3) {
        const cost = AGE_COSTS[game.ageLevel];
        if (game.ageResearch) {
          commands.push({
            id: 'age:advance', label: t('command.advancing'), icon: 'age', tag: `${Math.ceil(game.ageResearch.remaining)}s`,
            tooltip: t('command.advancingTooltip', { age: t(`age.${game.ageResearch.level}`), seconds: Math.ceil(game.ageResearch.remaining) }),
          });
        } else {
          commands.push({
            id: 'age:advance', label: t('command.advance'), icon: 'age',
            cost: shortCost(cost), tooltip: t('command.advanceTooltip', { age: t(`age.${game.ageLevel + 1}`), cost: shortCost(cost) }),
          });
        }
      }
      const trainable = TRAINABLE[b.type] || [];
      commands.push(...trainable.map(type => {
        const def = UNIT_TYPES[type];
        return {
          id: `train:${type}`, label: t(`unit.${type}.name`), icon: def.icon,
          cost: shortCost(game.unitCost(type)), hotkey: def.hotkey,
          tooltip: t('command.trainTooltip', { unit: t(`unit.${type}.name`), cost: shortCost(game.unitCost(type)), time: def.trainTime }),
        };
      }));
      return commands;
    }
    const playerSel = sel.filter(e => e.team === 'player' && !e.w);
    const hasVillager = playerSel.some(u => u.type === 'villager');
    const commands = [];
    if (hasVillager && playerSel.every(u => u.type === 'villager')) {
      for (const type of BUILD_OPTIONS) {
        const def = BUILDING_TYPES[type];
        commands.push({
          id: `build:${type}`, label: t(`building.${type}.${def.shortName ? 'shortName' : 'name'}`), icon: def.icon,
          cost: shortCost(def.cost), tooltip: t('command.buildTooltip', { name: t(`building.${type}.name`), cost: shortCost(def.cost), time: def.buildTime }),
        });
      }
    }
    const hero = playerSel.find(u => u.type === 'commander');
    if (hero) {
      commands.push({ id: 'hero:control', label: t(game.heroControl ? 'command.release' : 'command.control'), icon: 'control', tag: 'TAB', tooltip: t('command.controlTooltip') });
      commands.push({ id: 'hero:mark', label: t('command.mark'), icon: 'mark', tag: hero.markCd > 0 ? `${Math.ceil(hero.markCd)}s` : 'Q', tooltip: t('command.markTooltip') });
      commands.push({ id: 'hero:aegis', label: t('command.aegis'), icon: 'aegis', tag: hero.aegisCd > 0 ? `${Math.ceil(hero.aegisCd)}s` : 'E', tooltip: t('command.aegisTooltip') });
    }
    if (playerSel.some(u => u.type !== 'villager')) {
      commands.push({ id: 'stop', label: t('command.stop'), icon: 'stop', tooltip: t('command.stopTooltip') });
      commands.push({ id: 'hold', label: t('command.hold'), icon: 'hold', tooltip: t('command.holdTooltip') });
    } else if (hasVillager) {
      commands.push({ id: 'stop', label: t('command.stop'), icon: 'stop', tooltip: t('command.stopTooltip') });
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
      else if (id === 'age:advance') cost = AGE_COSTS[game.ageLevel];
      if (cost) b.classList.toggle('unaffordable', !game.canAfford(cost));
      if (id === 'train:elephant' && !game.effects.elephantUnlocked) b.classList.add('unaffordable');
      if (id === 'hero:mark') b.classList.toggle('is-cooling', game.hero?.markCd > 0);
      if (id === 'hero:aegis') b.classList.toggle('is-cooling', game.hero?.aegisCd > 0);
      if (id === 'hero:control') b.classList.toggle('is-active', game.heroControl);
    }
    this.updateCommandProgress();
  }

  updateCommandProgress() {
    const game = this.game;
    const one = game.selection.length === 1 ? game.selection[0] : null;
    if (!one?.w) return;
    const first = one.queue?.[0];
    if (!first) {
      if (this.trainingShownFor === one) {
        this.trainingShownFor = null;
        this.renderSelection(game);
      }
      return;
    }
    this.trainingShownFor = one;
    this.el.selectionSub.textContent = t('selection.trainingProgress', { unit: t(`unit.${first.type}.name`), seconds: Math.ceil(first.remaining) });
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
    this.portraitCaption(ctx, t(`unit.${u.type}.role`), team.primary);
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
    this.portraitCaption(ctx, t('portrait.warParty'), PLAYER_COLORS.primary);
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
    this.portraitCaption(ctx, t(b.team === 'player' ? 'portrait.yourRealm' : 'portrait.raiderCamp'), b.team === 'player' ? PLAYER_COLORS.primary : ENEMY_COLORS.primary);
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
    const cacheKey = `${game.world.seed}:${game.world.biome || 'ashlands'}`;
    if (!this.minimapCache || this.minimapCacheKey !== cacheKey) {
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
      this.minimapCacheKey = cacheKey;
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
  if (n.resource === 'wood') return t(n.kind === 'pine' ? 'resourceName.pine' : 'resourceName.oak');
  if (n.resource === 'gold') return t('resourceName.gold');
  if (n.resource === 'stone') return t('resourceName.stone');
  if (n.kind === 'berry') return t('resourceName.berry');
  if (n.kind === 'sheep') return t('resourceName.sheep');
  return t('resourceName.resource');
}
