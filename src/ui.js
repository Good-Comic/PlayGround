import { AGES, BOONS, BUILDINGS, ENEMIES, META_UNLOCKS, UNITS, WAVES } from './data.js';
import { clamp, roman } from './utils.js';
import { LANGUAGES, applyDocumentTranslations, getLang, localizeEntities, onLanguageChange, resourceLabel, resourceShort, setLang, t } from './i18n.js';

const ICON_PATHS = {
  villager: '<circle cx="12" cy="6.5" r="2.6"/><path d="M8 20v-4.6c0-2.4 1.6-3.9 4-3.9s4 1.5 4 3.9V20M7 20h10M16.8 13.5l3.6-4.2M18.2 16.5l2 1.5"/>',
  scout: '<path d="M4 17c0-4 2.7-7 7.3-7h4.4l3.1-3.2 1.5 2.1L22 12l-2.8 2.2v3.3h-2v-2H9v2H7v-3H4z"/><path d="M11 10V7M14 10V7M17 10l1-2"/>',
  militia: '<path d="M12 3l7 2.7v5.1c0 4.6-2.8 7.7-7 9.8-4.2-2.1-7-5.2-7-9.8V5.7z"/><path d="M12 7v7M9.5 10h5"/>',
  spearman: '<path d="M5 20L18 5M18 5l2.6-.5-.6 2.7M8.5 14.5l3 3M6.5 12.5l3 3"/><circle cx="9" cy="9" r="2.2"/>',
  archer: '<path d="M7 4c7 1.5 9 8 5.5 15M7 4c1 7 4.5 12 9.5 14.5"/><path d="M7 4l9.5 14.5M5 9l3-5 1 6z"/>',
  knight: '<path d="M4 17c0-3.7 2.5-6.5 6.5-6.5h4.3L18 7l1.4 2 2.6 1.8-2.5 2.3v3.4h-2v-2H9v2H7v-3H4z"/><path d="M12 10V7M15 10l1-2M17.8 10.5l2.2-1.4"/>',
  crossbow: '<path d="M5 12h14M12 5v14M7 7l10 10M17 7L7 17"/><circle cx="12" cy="12" r="2.2"/>',
  champion: '<path d="M8 3h8l2 6-2 11H8L6 9z"/><path d="M12 3v8M8 3l4 8 4-8M9 16h6"/>',
  longbow: '<path d="M6 3c8 2 10 9 6 17M6 3c1 9 5 14 11 18"/><path d="M16 20L6 3M4 8l4-5 1 7z"/>',
  raider: '<path d="M12 3l7 2.7v5.1c0 4.6-2.8 7.7-7 9.8-4.2-2.1-7-5.2-7-9.8V5.7z"/><path d="M9 10l6 6M15 10l-6 6"/>',
  skirmisher: '<path d="M4 21L19 4M19 4l1 3-3-1M7 16l-3 3M9 9l3-3"/>',
  brute: '<path d="M7 10V6l5-2 5 2v4M5 21l1-8 6-2 6 2 1 8M9 21v-4h6v4M9 8l6 0"/>',
  warlord: '<path d="M6 12V7l3-3 3 3 3-3 3 3v5M5 21l1-7 6-2 6 2 1 7M9 21v-5h6v5"/><path d="M9 8l6 0"/>',
  house: '<path d="M3 11l9-7 9 7M5 10v10h14V10M9 20v-6h6v6"/>',
  farm: '<path d="M3 19h18M5 19V9M9 19V9M13 19V9M17 19V9M21 19V9M3 9l3-4 3 4 3-4 3 4 3-4 3 4"/>',
  barracks: '<path d="M4 20V8l8-4 8 4v12M8 20v-7h8v7M4 20h16M12 4v9"/>',
  archery: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',
  tower: '<path d="M7 21V6h10v15M5 21h14M7 6V3h2v3M11 3v3h2V3M15 3v3h2V6M10 11h4v4h-4z"/>',
  towncenter: '<path d="M3 21V10l9-6 9 6v11M6 21v-7h12v7M8 14h3v3H8zM14 14h3v4h-3zM3 21h18M12 4v6"/>',
  wheat: '<path d="M12 21V8M12 13c-4 0-6-2-6-6 4 0 6 2 6 6zM12 13c4 0 6-2 6-6-4 0-6 2-6 6zM12 18c-3 0-5-2-5-5 3 0 5 2 5 5zM12 18c3 0 5-2 5-5-3 0-5 2-5 5z"/>',
  coin: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="10" r="5"/><path d="M7 11.5a5 5 0 0 1 4.4 7.1M14 8.6a5 5 0 0 1 4.6 7.7"/>',
  heart: '<path d="M12 20S4 15 4 9.5C4 7 6 5 8.4 5c1.6 0 3 .9 3.6 2.1C12.6 5.9 14 5 15.6 5 18 5 20 7 20 9.5 20 15 12 20 12 20z"/>',
  sword: '<path d="M5 19l9-9M14 4l6 2-2 6-7 2-2-7zM4 21l4-4M15 15l4 4"/>',
  bow: '<path d="M7 4c7 1.5 9 8 5.5 15M7 4c1 7 4.5 12 9.5 14.5M7 4l9.5 14.5"/>',
  hammer: '<path d="M4 20l8-8M12 12l5-5M14 3l7 7-3 3-7-7zM3 21l3-1-2-2z"/>',
  drum: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v9c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 11c0 1.7 3.1 3 7 3s7-1.3 7-3M9 9l6 7M15 9l-6 7"/>',
  boot: '<path d="M7 3v9l-3 6c-.5 1 .2 3 2 3h10c3 0 4-2 4-4 0-3-3-4-6-4h-2V3z"/>',
  skull: '<path d="M5 11a7 7 0 1 1 14 0c0 2.7-1.3 4.3-3 5.3V20H8v-3.7C6.3 15.3 5 13.7 5 11z"/><circle cx="9.2" cy="10.5" r="1.2"/><circle cx="14.8" cy="10.5" r="1.2"/><path d="M10 20v-2M14 20v-2M10 16h4"/>',
  flag: '<path d="M5 21V4M5 5c4-3 7 2 12 0v8c-5 2-8-3-12 0"/>',
  horse: '<path d="M5 20c0-4 2.5-7 7-7h3l3-4 2 3 1 2-2 2v4h-2v-2H9v2H7v-3H5z"/><path d="M12 13V9M15 13l1-3"/>',
  crown: '<path d="M4 18l-1-9 5 3 4-7 4 7 5-3-1 9zM4 18h16M7 21h10"/>',
  hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
  flame: '<path d="M12 21c4 0 6-2.8 6-6 0-3-2-5.4-3.2-7C13.5 6.2 13 4.5 13 3c-3.3 2-5 5.4-5 8 0-1.2-.6-2.4-1.4-3.4C5.6 9.6 6 12 6 14c0 4 2 7 6 7z"/><path d="M12 21c-1.8 0-3-1.4-3-3.2 0-1.6 1.2-2.7 2-4 .7 1 2 2 2 3.7 0 1.9-1 3.5-1 3.5z"/>',
  shield: '<path d="M12 3l7 2.7v5.1c0 4.6-2.8 7.7-7 9.8-4.2-2.1-7-5.2-7-9.8V5.7z"/>',
  stone: '<path d="M4 18l2-8 6-4 7 3 1 9z"/><path d="M8 10l3 2 4-3M11 12l-1 6M15 9l2 9"/>',
  tree: '<path d="M12 21v-6M12 15l-5-4M12 13l4-4"/><path d="M12 3l5 6h-2l4 5H5l4-5H7z"/>',
  meat: '<path d="M17 4c3 0 4 2 4 4 0 3-3 5-6 5l-3 3c-1 1-3 1-4 0l-1-1c-1-1-1-3 0-4l3-3c0-3 2-4 4-4z"/><circle cx="7" cy="18" r="2"/><path d="M8.5 16.5L15 10"/>',
  gem: '<path d="M7 4h10l4 6-9 10L3 10z"/><path d="M3 10h18M7 4l5 6 5-6M12 10v10"/>',
  people: '<circle cx="8" cy="7" r="2.6"/><circle cx="16" cy="7" r="2.6"/><path d="M3 21v-3c0-3 2-4.5 5-4.5s5 1.5 5 4.5v3M13 21v-3c0-3 2-4.5 5-4.5s3 1.5 3 4.5v3"/>',
  food: '<path d="M12 21V8M12 13c-4 0-6-2-6-6 4 0 6 2 6 6zM12 13c4 0 6-2 6-6-4 0-6 2-6 6z"/>',
  wood: '<path d="M7 5l10 14M6 9l11 11M9 4l9 10M4 13l8 7M4 20h16"/>',
  gold: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="10" r="5"/>',
  pop: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-4c0-3 2-5 6-5s6 2 6 5v4M16 5a3 3 0 0 1 0 6M18 21v-4c0-2-1-4-3-4.6"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="1"/>',
  age: '<path d="M4 18l-1-9 5 3 4-7 4 7 5-3-1 9z"/>'
};

const icon = (name, extra = '') => {
  const path = ICON_PATHS[name] || ICON_PATHS.militia;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" class="${extra}">${path}</svg>`;
};

const COST_CLASS = { food: 'c-food', wood: 'c-wood', gold: 'c-gold', stone: 'c-stone' };

function costMarkup(cost = {}) {
  const entries = Object.entries(cost);
  if (!entries.length) return `<span>${t('Free')}</span>`;
  return entries.map(([type, amount]) => `<span class="${COST_CLASS[type]}">${amount} ${resourceShort(type)}</span>`).join('');
}

function costText(cost = {}) {
  return Object.entries(cost).map(([type, amount]) => `${amount} ${resourceLabel(type)}`).join(', ') || t('Free');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));
}

export class UI {
  constructor(game, renderer, audio, actions) {
    this.game = game;
    this.renderer = renderer;
    this.audio = audio;
    this.actions = actions;
    this.lastHudUpdate = 0;
    this.lastMinimapUpdate = 0;
    this.lastCommandUpdate = 0;
    this.currentCommands = [];
    this.currentBoons = null;
    this.bannerTimeout = null;
    this.previousResources = {};
    this.menuEl = document.getElementById('menu');
    this.hudEl = document.getElementById('hud');
    this.modalRoot = document.getElementById('modalRoot');
    this.tooltip = document.getElementById('tooltip');
    this.minimap = document.getElementById('minimap');
    this.timerRing = document.getElementById('timerRing');
    this.toastRoot = document.getElementById('toasts');
    this.waveBanner = document.getElementById('waveBanner');
    this.placementHint = document.getElementById('placementHint');
    this.helpOpen = false;
    this.pauseOpen = false;
    this.optionsOpen = false;
    this.optionsReturn = 'menu';
    this.ageModalOpen = false;
    this.agePauseReturn = false;
    this.optionsReturnFocus = null;
    this.bind();
    this.registerGameEvents();
    this.updateMenuStats();
    this.updateSoundButtons();
    this.updateSpeed();
    onLanguageChange(() => this.onLanguageChanged());
    window.addEventListener('keydown', event => this.handleGlobalKey(event));
  }

  bind() {
    document.getElementById('playBtn').addEventListener('click', () => this.actions.play());
    document.getElementById('howBtn').addEventListener('click', () => this.openHelp());
    document.getElementById('optionsBtn').addEventListener('click', () => this.openOptions());
    document.getElementById('soundBtnMenu').addEventListener('click', () => this.toggleSound());
    document.getElementById('soundBtn').addEventListener('click', () => this.toggleSound());
    document.getElementById('helpBtn').addEventListener('click', () => this.openHelp());
    document.getElementById('pauseBtn').addEventListener('click', () => this.actions.togglePause());
    document.getElementById('speedBtn').addEventListener('click', () => { this.game.cycleSpeed(); this.updateSpeed(); });
    document.getElementById('ageBlock').addEventListener('click', () => this.openAgeModal());
    document.getElementById('callWaveBtn').addEventListener('click', () => { this.game.callWaveEarly(); this.audio.play('click'); });
    document.getElementById('commandPanel').addEventListener('click', event => {
      const button = event.target.closest('.cmd-btn');
      if (!button || button.disabled) return;
      this.executeCommand(button.dataset);
    });
    document.getElementById('commandPanel').addEventListener('mouseover', event => {
      const button = event.target.closest('.cmd-btn');
      if (button) this.showTooltip(button);
    });
    document.getElementById('commandPanel').addEventListener('mouseout', event => {
      if (event.target.closest('.cmd-btn')) this.hideTooltip();
    });
    document.getElementById('minimap').addEventListener('pointerdown', event => this.minimapPointer(event, true));
    document.getElementById('minimap').addEventListener('pointermove', event => this.minimapPointer(event, false));
    document.getElementById('modalRoot').addEventListener('click', event => {
      const action = event.target.closest('[data-modal-action]');
      if (!action) return;
      this.handleModalAction(action.dataset.modalAction);
    });
    this.modalRoot.addEventListener('change', event => {
      const select = event.target.closest('[data-language-select]');
      if (select) setLang(select.value);
    });
    this.menuEl.addEventListener('animationend', () => {}, { once: true });
  }

  registerGameEvents() {
    const game = this.game;
    game.on('toast', payload => this.toast(payload.text, payload.type));
    game.on('stateChanged', state => this.onStateChanged(state));
    game.on('selectionChanged', () => this.refreshSelection());
    game.on('ageChanged', () => { this.updateAge(); if (this.ageModalOpen) this.openAgeModal(); });
    game.on('banner', payload => this.showBanner(payload));
    game.on('boonOffered', boons => { if (boons && boons.length) this.showBoons(boons); });
    game.on('gameOver', result => this.showResults(result));
    game.on('pauseChanged', paused => this.onPauseChanged(paused));
    game.on('placementChanged', placement => this.onPlacementChanged(placement));
    game.on('waveStarted', () => this.refreshWavePanel());
    game.on('wavePreparing', () => this.refreshWavePanel());
    game.on('speedChanged', () => this.updateSpeed());
  }

  onStateChanged(state) {
    if (state === 'menu') {
      this.menuEl.classList.remove('leaving');
      this.menuEl.style.display = 'flex';
      this.hudEl.classList.add('hidden');
      this.modalRoot.innerHTML = '';
      this.updateMenuStats();
    } else {
      this.menuEl.classList.add('leaving');
      this.menuEl.style.display = 'none';
      this.hudEl.classList.remove('hidden');
      this.remountHud();
    }
    if (state === 'playing') {
      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        if (!overlay.dataset.keep) overlay.remove();
      });
      this.pauseOpen = false;
      this.optionsOpen = false;
      this.helpOpen = false;
      this.ageModalOpen = false;
      this.refreshSelection();
    }
    if (state === 'boon') this.refreshSelection();
  }

  onPauseChanged(paused) {
    if (paused && this.game.state === 'playing') this.showPause();
    else if (!paused && !this.helpOpen && !this.ageModalOpen) this.closeModal();
  }

  onPlacementChanged(placement) {
    if (placement) {
      this.placementHint.classList.remove('hidden');
      const def = BUILDINGS[placement.kind];
      this.placementHint.querySelector('span').textContent = t('Place {name}', { name: def.name });
    } else {
      this.placementHint.classList.add('hidden');
    }
  }

  executeCommand(data) {
    const action = data.action;
    if (action === 'build') {
      this.game.startPlacement(data.kind);
    } else if (action === 'train') {
      const building = this.game.selection.find(entity => entity.w);
      if (building) this.game.queueUnit(building, data.unit);
    } else if (action === 'age') {
      const advanced = this.game.advanceAge();
      if (advanced) this.closeModal();
    } else if (action === 'stop') {
      for (const entity of this.game.selection) {
        if (entity.w) continue;
        entity.task = 'idle';
        entity.combatTarget = null;
        entity.resource = null;
        entity.target = null;
        entity.path = [];
      }
      this.game.emit('selectionChanged');
      this.audio.play('command');
    } else if (action === 'idle-villager') {
      this.game.selectIdleVillager();
    }
  }

  onLanguageChanged() {
    localizeEntities(this.game);
    applyDocumentTranslations();
    this.updateMenuStats();
    this.updateAge();
    this.refreshWavePanel();
    this.refreshSelection();
    if (this.currentBoons) this.renderBoons(this.currentBoons);
    if (this.optionsOpen) this.renderOptions();
    if (this.pauseOpen && !this.optionsOpen) this.showPause();
    if (this.helpOpen && !this.optionsOpen) this.openHelp();
    if (this.ageModalOpen && !this.optionsOpen) this.openAgeModal();
    if (this.game.placement) this.onPlacementChanged(this.game.placement);
    this.remountHud();
  }

  remountHud() {
    const hud = this.hudEl;
    if (!hud || !hud.parentNode) return;
    const parent = hud.parentNode;
    const next = hud.nextSibling;
    hud.remove();
    void parent.offsetHeight;
    parent.insertBefore(hud, next);
  }

  handleGlobalKey(event) {
    if (this.optionsOpen && event.key === 'Escape') {
      event.preventDefault();
      this.closeOptions();
      return;
    }
    if (this.game.state === 'boon' && this.currentBoons) {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < this.currentBoons.length) {
        event.preventDefault();
        this.pickBoon(this.currentBoons[index]);
      }
      return;
    }
    if (this.helpOpen && event.key === 'Escape') {
      event.preventDefault();
      this.closeHelp();
      return;
    }
    if (this.ageModalOpen && event.key === 'Escape') {
      event.preventDefault();
      this.closeAgeModal();
      return;
    }
    if (event.key === 'Escape' && this.game.placement) {
      this.game.cancelPlacement();
      return;
    }
    if (this.modalRoot.querySelector('.modal-overlay')) return;
    const key = event.key.toUpperCase();
    if (!this.game.selection.length || !this.currentCommands.length) return;
    const command = this.currentCommands.find(item => item.hotkey === key);
    if (command && !command.disabled) {
      event.preventDefault();
      this.executeCommand(command.dataset);
    }
  }

  updateMenuStats() {
    const meta = this.game.meta;
    document.getElementById('menuRenown').textContent = `${Math.floor(meta.renown)} ${t('Renown')}`;
    if (meta.bestWave > 0) {
      const crowns = meta.wins ? ` · ${meta.wins} ${t(meta.wins === 1 ? 'crown' : 'crowns')}` : '';
      document.getElementById('menuBest').textContent = `${t('Best: Wave {wave}', { wave: roman(Math.min(meta.bestWave, 5)) })}${crowns}`;
    } else {
      document.getElementById('menuBest').textContent = t('No campaigns survived');
    }
    const menuFooter = document.querySelector('.menu-footer');
    if (menuFooter) {
      const next = META_UNLOCKS.find(item => meta.renown < item.renown);
      menuFooter.querySelector('span:first-child').textContent = next ? t('{count} renown until {name}', { count: Math.round(next.renown - meta.renown), name: next.name }) : t('Legacy complete · Build · Gather · Advance · Endure');
    }
  }

  updateSoundButtons() {
    document.getElementById('soundBtnMenu').classList.toggle('muted', this.audio.muted);
    document.getElementById('soundBtn').classList.toggle('muted', this.audio.muted);
  }

  toggleSound() {
    this.audio.init();
    this.audio.toggle();
    this.updateSoundButtons();
    this.audio.play('click');
  }

  updateSpeed() {
    document.getElementById('speedLabel').textContent = `${this.game.speed}×`;
  }

  toast(text, type = 'info') {
    if (!text) return;
    const element = document.createElement('div');
    element.className = `toast ${type}`;
    element.textContent = text;
    this.toastRoot.appendChild(element);
    while (this.toastRoot.children.length > 4) this.toastRoot.firstElementChild.remove();
    setTimeout(() => {
      element.classList.add('out');
      setTimeout(() => element.remove(), 400);
    }, 3400);
  }

  showBanner({ kicker, title, text }) {
    const banner = this.waveBanner;
    document.getElementById('waveBannerKicker').textContent = kicker || '';
    document.getElementById('waveBannerTitle').textContent = title || '';
    document.getElementById('waveBannerText').textContent = text || '';
    banner.classList.add('show');
    clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => banner.classList.remove('show'), 3400);
  }

  updateMenuState() {
    this.updateMenuStats();
  }

  refreshSelection() {
    const panel = document.getElementById('selectionPanel');
    const info = this.game.selectedInfo();
    panel.classList.toggle('has-selection', Boolean(info));
    if (!info) {
      panel.innerHTML = `<div class="selection-empty"><span class="selection-seal">?</span><div><strong>${t('No command')}</strong><p>${t('Select a villager, soldier, or building.')}</p></div></div>`;
      document.getElementById('commandPanel').innerHTML = `<div class="cmd-empty">${t('Select a unit or building to see its orders.')}</div>`;
      this.currentCommands = [];
      return;
    }
    if (info.multiple) {
      const summary = Object.entries(info.counts).map(([name, count]) => `${count} ${name}`).join(' · ');
      const selectionIcon = info.entities.some(entity => entity.kind === 'villager') ? 'villager' : info.entities[0].w ? 'towncenter' : 'militia';
      panel.innerHTML = `<div class="selection-content"><div class="portrait"><span class="multi">${info.count}</span></div><div class="sel-info"><p class="sel-name">${t('War Band')}</p><p class="sel-sub">${summary}</p><div class="sel-task">${info.entities.some(entity => entity.kind === 'villager') ? t('Villagers can construct; soldiers will follow the banner.') : t('Right-click ground to move · right-click an enemy to attack.')}</div></div></div>`;
      const hasVillagers = info.entities.some(entity => entity.team === 'player' && entity.kind === 'villager');
      const commands = [];
      if (hasVillagers) commands.push(...this.buildCommands());
      commands.push(this.stopCommand());
      this.renderCommands(commands);
      return;
    }
    const entity = info.entity;
    const hpPercent = clamp(info.hp / info.maxHp, 0, 1) * 100;
    const hpClass = entity.team === 'enemy' ? 'enemy' : hpPercent < 35 ? 'low' : '';
    const portrait = entity.w ? entity.kind : (entity.team === 'enemy' ? entity.kind : entity.kind);
    const stats = info.stats.map(stat => `<span>${stat.label} <b>${stat.value}</b></span>`).join('');
    panel.innerHTML = `<div class="selection-content">
      <div class="portrait">${icon(portrait)}</div>
      <div class="sel-info">
        <p class="sel-name">${escapeHtml(info.name)}</p>
        <p class="sel-sub">${escapeHtml(info.subtitle || '')}</p>
        <div class="sel-hp ${hpClass}"><i style="width:${hpPercent}%"></i></div>
        <div class="sel-stats">${stats}</div>
        <div class="sel-task">${escapeHtml(info.task || '')}</div>
      </div>
    </div>`;
    const commands = [];
    if (entity.team === 'player') {
      if (entity.w) {
        commands.push(...this.buildingCommands(entity));
      } else if (entity.kind === 'villager') {
        commands.push(...this.buildCommands());
        commands.push(this.stopCommand());
      } else {
        commands.push(this.stopCommand());
      }
    }
    this.renderCommands(commands);
  }

  stopCommand() {
    return { type: 'stop', hotkey: 'X', label: t('Stop'), icon: 'stop', disabled: false, title: t('Stop orders'), desc: t('Halt current orders for selected units.'), costText: '', dataset: { action: 'stop' } };
  }

  buildCommands() {
    const kinds = ['house', 'farm', 'barracks', 'archery', 'tower'];
    return kinds.map((kind, index) => {
      const def = BUILDINGS[kind];
      const locked = def.age > this.game.age;
      const affordable = this.game.canAfford(def.cost);
      return {
        type: 'build', kind,
        label: kind === 'tower' ? t('Tower') : def.name,
        icon: kind,
        cost: def.cost,
        hotkey: ['Q', 'W', 'E', 'R', 'T'][index],
        disabled: locked || !affordable,
        locked,
        lockText: locked ? AGES[def.age].short : '',
        title: def.name,
        desc: def.desc,
        costText: costText(def.cost),
        dataset: { action: 'build', kind }
      };
    });
  }

  buildingCommands(building) {
    const list = [];
    const unitTypes = Object.values(UNITS).filter(def => def.building === building.kind);
    unitTypes.forEach((def, index) => {
      const type = Object.keys(UNITS).find(key => UNITS[key] === def);
      const locked = def.age > this.game.age;
      const affordable = this.game.canAfford(def.cost);
      const popFull = this.game.popUsed >= this.game.popCap;
      list.push({
        type: 'train', unit: type,
        label: def.name,
        icon: type,
        cost: def.cost,
        hotkey: ['Q', 'W', 'E', 'R'][index],
        disabled: locked || !affordable || popFull || !building.complete || building.queue.length >= 5,
        locked,
        lockText: locked ? AGES[def.age].short : '',
        queue: building.queue.filter(item => item === type).length,
        title: def.name,
        desc: def.desc,
        costText: costText(def.cost),
        dataset: { action: 'train', unit: type }
      });
    });
    if (building.kind === 'towncenter' && this.game.age < AGES.length - 1) {
      const cost = this.game.costForNextAge();
      const affordable = this.game.canAfford(cost);
      const age = AGES[this.game.age + 1];
      list.push({
        type: 'age',
        label: t('Advance'),
        icon: 'crown',
        cost,
        hotkey: 'G',
        disabled: !affordable,
        title: t('Advance to the {age}', { age: age.name }),
        desc: t('Unlocks {list}.', { list: age.unlocks.join(', ') || t('the next chapter') }),
        costText: costText(cost),
        dataset: { action: 'age' }
      });
      const idleVillagers = this.game.units.filter(unit => unit.team === 'player' && unit.kind === 'villager' && unit.task === 'idle').length;
      list.push({
        type: 'idle', label: t('Idle Villager'), icon: 'villager', hotkey: 'Z', disabled: !idleVillagers,
        title: t('Find an idle villager'), desc: idleVillagers === 1 ? t('{count} villager awaiting orders.', { count: idleVillagers }) : t('{count} villagers awaiting orders.', { count: idleVillagers }),
        costText: '', dataset: { action: 'idle-villager' }
      });
    }
    if (list.length) {
      list.push({ type: 'stop', hotkey: 'X', label: t('Stop'), icon: 'stop', disabled: false, title: t('Stop orders'), desc: t('Halt current orders for selected units.'), costText: '', dataset: { action: 'stop' } });
    }
    return list;
  }

  renderCommands(commands) {
    const panel = document.getElementById('commandPanel');
    this.currentCommands = commands.filter(command => command.type !== 'separator');
    if (!commands.length) {
      panel.innerHTML = `<div class="cmd-empty">${this.game.selection.length && this.game.selection[0].team === 'enemy' ? t('An enemy of the crown. Right-click with your soldiers to attack.') : t('Right-click to move. Select villagers to build and gather.')}</div>`;
      return;
    }
    panel.innerHTML = commands.map((command, index) => {
      if (command.type === 'separator') return '<span class="cmd-separator"></span>';
      const cost = command.cost ? `<span class="cmd-cost">${costMarkup(command.cost)}</span>` : `<span class="cmd-cost"></span>`;
      const queue = command.queue ? ` data-queue="${command.queue}"` : '';
      return `<button class="cmd-btn ${command.disabled ? 'is-disabled' : ''} ${command.locked ? 'locked' : ''} ${command.queue ? 'queue' : ''}" ${command.disabled ? 'disabled' : ''}${queue} data-action="${command.dataset?.action || ''}" ${command.dataset?.kind ? `data-kind="${command.dataset.kind}"` : ''} ${command.dataset?.unit ? `data-unit="${command.dataset.unit}"` : ''} data-title="${escapeHtml(command.title || command.label)}" data-desc="${escapeHtml(command.desc || '')}" data-cost="${escapeHtml(command.costText || '')}" data-lock="${escapeHtml(command.locked ? t('Requires {age} Age', { age: command.lockText }) : '')}" data-hotkey="${command.hotkey || ''}">
        <span class="cmd-hot">${command.hotkey || ''}</span>
        <span class="cmd-icon">${icon(command.icon)}</span>
        <span class="cmd-name">${escapeHtml(command.label)}</span>
        ${cost}
        ${command.locked ? `<span class="lock-tag">${escapeHtml(command.lockText)}</span>` : ''}
      </button>`;
    }).join('');
  }

  showTooltip(button) {
    const title = button.dataset.title;
    if (!title) return;
    const desc = button.dataset.desc || '';
    const cost = button.dataset.cost || '';
    const lock = button.dataset.lock || '';
    this.tooltip.innerHTML = `<strong>${escapeHtml(title)}</strong>${escapeHtml(desc)}${cost ? `<div class="tip-costs">${escapeHtml(cost)}</div>` : ''}${lock ? `<div class="tip-lock">${escapeHtml(lock)}</div>` : ''}`;
    const rect = button.getBoundingClientRect();
    this.tooltip.style.left = `${clamp(rect.left + rect.width / 2, 130, window.innerWidth - 130)}px`;
    this.tooltip.style.top = `${rect.top - 10}px`;
    this.tooltip.classList.remove('hidden');
  }

  hideTooltip() {
    this.tooltip.classList.add('hidden');
  }

  minimapPointer(event, down) {
    if (down) this.minimap.dragging = true;
    if (!down && !this.minimap.dragging) return;
    if (event.buttons === 0 && !down) this.minimap.dragging = false;
    const rect = this.minimap.getBoundingClientRect();
    const nx = clamp((event.clientX - rect.left) / rect.width, 0, .999);
    const ny = clamp((event.clientY - rect.top) / rect.height, 0, .999);
    this.actions.centerCamera(nx * 36, ny * 36);
    if (down) {
      this.minimap.setPointerCapture(event.pointerId);
      this.minimap.dragging = true;
    }
  }

  update(dt) {
    if (this.game.state === 'menu') return;
    const now = performance.now();
    if (now - this.lastMinimapUpdate > 100) {
      this.renderer.drawMinimap(this.minimap);
      this.lastMinimapUpdate = now;
    }
    if (now - this.lastHudUpdate < 60) return;
    this.lastHudUpdate = now;
    this.updateResources();
    this.updateAge();
    this.refreshWavePanel();
    this.refreshCommandStates();
    this.refreshSelectionStatus();
  }

  updateResources() {
    const resources = this.game.resources;
    for (const type of ['food', 'wood', 'gold', 'stone']) {
      const element = document.getElementById(`res${type[0].toUpperCase()}${type.slice(1)}`);
      if (!element) continue;
      const value = Math.floor(resources[type]);
      if (this.previousResources[type] !== undefined && value > this.previousResources[type]) {
        const wrapper = element.closest('.resource');
        wrapper.classList.remove('flash');
        void wrapper.offsetWidth;
        wrapper.classList.add('flash');
      }
      element.textContent = value;
      this.previousResources[type] = value;
    }
    document.getElementById('resPop').textContent = this.game.popUsed;
    document.getElementById('resCap').textContent = this.game.popCap;
  }

  updateAge() {
    const age = AGES[this.game.age];
    document.getElementById('ageName').textContent = age.name;
    document.getElementById('ageProgressBar').style.width = `${this.game.age / (AGES.length - 1) * 100}%`;
  }

  refreshWavePanel() {
    const state = this.game.getWaveState();
    const wave = state.wave;
    if (!wave) return;
    document.getElementById('waveOrdinal').textContent = t('Wave {wave}', { wave: roman(state.index + 1) });
    document.getElementById('waveTitle').textContent = wave.title;
    document.getElementById('waveSubtitle').textContent = wave.subtitle;
    document.getElementById('timerRing').classList.toggle('battle', state.phase === 'battle');
    const total = Object.values(wave.composition).reduce((sum, count) => sum + count, 0);
    if (state.phase === 'prepare') {
      document.getElementById('timerValue').textContent = Math.max(0, Math.ceil(state.prepTime));
      document.getElementById('timerRing').querySelector('small').textContent = t('sec');
      const progress = clamp(state.prepTime / state.prepTotal, 0, 1) * 100;
      document.getElementById('timerRing').style.setProperty('--p', progress);
    } else if (state.phase === 'battle') {
      const foes = state.enemies + state.pending;
      document.getElementById('timerValue').textContent = foes;
      document.getElementById('timerRing').querySelector('small').textContent = t(foes === 1 ? 'foe' : 'foes');
      const progress = clamp((total - foes) / total, 0, 1) * 100;
      document.getElementById('timerRing').style.setProperty('--p', progress);
    } else {
      document.getElementById('timerValue').textContent = state.phase === 'cleared' ? '✓' : '—';
      document.getElementById('timerRing').querySelector('small').textContent = state.phase === 'cleared' ? t('clear') : '';
      document.getElementById('timerRing').style.setProperty('--p', 100);
    }
    document.getElementById('callWaveBtn').disabled = state.phase !== 'prepare';
    const pips = document.getElementById('wavePips');
    if (pips.children.length !== WAVES.length) {
      pips.innerHTML = WAVES.map((_, index) => `<span class="wave-pip ${index === 4 ? 'boss' : ''}"></span>`).join('');
    }
    [...pips.children].forEach((pip, index) => {
      pip.classList.toggle('done', index < state.index);
      pip.classList.toggle('current', index === state.index);
    });
    const preview = document.getElementById('enemyPreview');
    const key = `${getLang()}|` + Object.entries(wave.composition).map(([type, count]) => `${type}:${count}`).join('|');
    if (preview.dataset.key !== key) {
      preview.dataset.key = key;
      preview.innerHTML = Object.entries(wave.composition).map(([type, count]) => {
        const gameType = type === 'warlord' ? 'warlord' : type;
        const name = ENEMIES[gameType]?.name || type[0].toUpperCase() + type.slice(1);
        return `<span class="enemy-chip">${icon(gameType)}<b>${count}</b> ${escapeHtml(name)}</span>`;
      }).join('');
    }
    document.getElementById('objectiveNote').innerHTML = `<span class="note-mark">!</span><span>${escapeHtml(wave.note)}</span>`;
    const danger = this.game.phase === 'battle' ? t('Battle joined') : this.game.phase === 'prepare' ? t('Raiders abroad') : t('Calm');
    document.getElementById('mapDanger').textContent = danger;
    document.getElementById('minimapClock').textContent = t(['Vesper', 'Dusk', 'Nightfall', 'Deep Night', 'Red Moon'][state.index] || 'Nightfall');
  }

  refreshCommandStates() {
    if (!this.currentCommands.length) return;
    const buttons = document.querySelectorAll('#commandPanel .cmd-btn');
    let index = 0;
    for (const command of this.currentCommands) {
      if (command.type === 'train') {
        const building = this.game.selection.find(entity => entity.w);
        {
          const def = command.unit ? UNITS[command.unit] : null;
          if (def && building) {
            const locked = def.age > this.game.age;
            const affordable = this.game.canAfford(def.cost);
            const popFull = this.game.popUsed >= this.game.popCap;
            command.disabled = locked || !affordable || popFull || !building.complete || building.queue.length >= 5;
            command.locked = locked;
            const button = buttons[index];
            if (button) button.disabled = command.disabled;
          }
        }
      } else if (command.type === 'age') {
        const cost = this.game.costForNextAge();
        command.disabled = !this.game.canAfford(cost);
        const button = buttons[index];
        if (button) button.disabled = command.disabled;
      }
      index++;
    }
  }

  refreshSelectionStatus() {
    const info = this.game.selectedInfo();
    if (!info || info.multiple) return;
    const hp = document.querySelector('#selectionPanel .sel-hp i');
    if (hp) hp.style.width = `${clamp(info.hp / info.maxHp, 0, 1) * 100}%`;
    const task = document.querySelector('#selectionPanel .sel-task');
    if (task) task.textContent = info.task || '';
  }

  showBoons(boons) {
    this.currentBoons = boons;
    this.renderBoons(boons);
    this.audio.play('boon');
  }

  renderBoons(boons) {
    this.modalRoot.innerHTML = `<div class="modal-overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="boonTitle">
        <div class="modal-head">
          <span class="modal-kicker">${t('The spoils of survival')}</span>
          <h2 class="modal-title" id="boonTitle">${t('Choose a Blessing')}</h2>
          <p class="modal-sub">${t('The ford is quiet. Choose one boon to carry into the next night.')}</p>
          <div class="modal-ornament"></div>
        </div>
        <div class="boon-grid">${boons.map((boon, index) => `<button class="boon-card ${boon.rarity === 'Epic' ? 'rare' : ''}" data-boon="${boon.id}">
          <span class="boon-corner"></span>
          <span class="boon-icon">${icon(boon.icon)}</span>
          <span class="boon-rarity">${t(boon.rarity + ' Blessing')}</span>
          <span class="boon-name">${escapeHtml(boon.name)}</span>
          <span class="boon-desc">${escapeHtml(boon.desc)}</span>
          <span class="boon-key">${t('Press {n} to choose', { n: index + 1 })}</span>
        </button>`).join('')}</div>
        <div class="modal-foot"><span style="color:#7f6f52;font-size:10px;letter-spacing:.12em;text-transform:uppercase">${t('The campaign pauses while you choose')}</span></div>
      </div>
    </div>`;
    this.modalRoot.querySelectorAll('.boon-card').forEach(card => {
      card.addEventListener('click', () => {
        const boon = this.currentBoons.find(item => item.id === card.dataset.boon);
        if (boon) this.pickBoon(boon);
      });
    });
    this.remountHud();
  }

  pickBoon(boon) {
    if (!this.currentBoons) return;
    this.currentBoons = null;
    this.modalRoot.innerHTML = '';
    this.game.chooseBoon(boon);
    this.hudEl.classList.remove('hidden');
    this.remountHud();
    this.refreshSelection();
    this.update();
  }

  showResults(result) {
    this.pauseOpen = false;
    const victory = result.victory;
    const boons = result.boons || [];
    const unlock = META_UNLOCKS.find(item => this.game.meta.renown >= item.renown && this.game.meta.renown - result.renown < item.renown);
    this.modalRoot.innerHTML = `<div class="modal-overlay">
      <div class="modal result-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <span class="modal-kicker">${t(victory ? 'The ford holds' : 'The banner falls')}</span>
          <h2 class="modal-title">${t(victory ? 'Campaign Victorious' : 'The Keep Has Fallen')}</h2>
          <p class="modal-sub">${t(victory ? 'The Warlord is slain. The Shattered Crown is yours, for now.' : 'The Warlord\'s host has taken the keep. Your legacy endures beyond the ashes.')}</p>
          <div class="modal-ornament"></div>
        </div>
        <div class="result-stats">
          <div class="result-stat"><b>${roman(result.wave)}</b><span>${t('Wave Reached')}</span></div>
          <div class="result-stat"><b>${result.kills}</b><span>${t('Raiders Slain')}</span></div>
          <div class="result-stat"><b>${result.trained}</b><span>${t('Units Muster')}</span></div>
          <div class="result-stat"><b>${result.gathered}</b><span>${t('Resources Gathered')}</span></div>
        </div>
        <p class="result-renown">${unlock ? t('New legacy unlocked: <strong>{name}</strong> — {desc}', { name: escapeHtml(unlock.name), desc: escapeHtml(unlock.desc) }) : t('You earned <strong>{earned} Renown</strong>. Legacy: <strong>{total} Renown</strong>.', { earned: result.renown, total: Math.floor(this.game.meta.renown) })}</p>
        ${boons.length ? `<div class="boons-list">${boons.map(boon => `<span class="boon-pill">${escapeHtml(boon.name)}</span>`).join('')}</div>` : ''}
        <div class="modal-foot">
          <button class="button primary" data-modal-action="play-again">${t('Play Again')}</button>
          <button class="button subtle" data-modal-action="main-menu">${t('Main Menu')}</button>
        </div>
      </div>
    </div>`;
    this.remountHud();
    this.updateMenuStats();
  }

  showPause() {
    this.pauseOpen = true;
    this.modalRoot.innerHTML = `<div class="modal-overlay">
      <div class="modal pause-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <span class="modal-kicker">${t('The realm waits')}</span>
          <h2 class="modal-title">${t('Campaign Paused')}</h2>
          <p class="modal-sub">${t('The horn has not sounded. Take stock of your village.')}</p>
          <div class="modal-ornament"></div>
        </div>
        <div class="modal-foot">
          <button class="button primary" data-modal-action="resume">${t('Resume')}</button>
          <button class="button" data-modal-action="help">${t('How to Play')}</button>
          <button class="button" data-modal-action="options">${t('Options')}</button>
          <button class="button" data-modal-action="restart">${t('Restart Campaign')}</button>
          <button class="button subtle" data-modal-action="main-menu">${t('Main Menu')}</button>
        </div>
      </div>
    </div>`;
    this.remountHud();
  }

  openHelp() {
    const wasOpen = this.helpOpen;
    this.helpOpen = true;
    const game = this.game;
    if (!wasOpen) this.helpPauseReturn = game.state === 'playing' && !game.paused;
    if (game.state === 'playing') game.setPaused(true);
    this.modalRoot.innerHTML = `<div class="modal-overlay">
      <div class="modal help-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <span class="modal-kicker">${t("The steward's ledger")}</span>
          <h2 class="modal-title">${t('How to Play')}</h2>
          <p class="modal-sub">${t('A campaign lasts five waves. Protect the Town Center, grow your economy, and raise a host between assaults.')}</p>
          <div class="modal-ornament"></div>
        </div>
        <div class="help-grid">
          <div class="help-section">
            <h4>${t('The Village')}</h4>
            <div class="help-row"><kbd>${t('Left click')}</kbd><span>${t('Select a unit or building. Drag to select soldiers and villagers.')}</span></div>
            <div class="help-row"><kbd>${t('Right click')}</kbd><span>${t('Move, gather, attack, build, or set a rally point.')}</span></div>
            <div class="help-row"><kbd>W A S D</kbd><span>${t('Pan the camera. Mouse wheel zooms. Middle-drag also pans.')}</span></div>
            <div class="help-row"><kbd>Tab</kbd><span>${t('Find the next idle villager.')}</span></div>
            <div class="help-row"><kbd>Space</kbd><span>${t('Pause or resume the campaign.')}</span></div>
            <div class="help-row"><kbd>F</kbd><span>${t('Select the Town Center.')}</span></div>
          </div>
          <div class="help-section">
            <h4>${t('The Campaign')}</h4>
            <div class="help-row"><kbd>${t('Villagers')}</kbd><span>${t('Right-click trees, gold, stone, berries, or sheep to gather. Return goods to the Town Center.')}</span></div>
            <div class="help-row"><kbd>${t('Build')}</kbd><span>${t('Select villagers and use the construction cards. Houses raise population.')}</span></div>
            <div class="help-row"><kbd>${t('Ages')}</kbd><span>${t('Advance through Feudal, Castle, and Imperial Ages to unlock new soldiers.')}</span></div>
            <div class="help-row"><kbd>${t('Waves')}</kbd><span>${t('Survive five assaults. After each, choose one of three blessings.')}</span></div>
            <div class="help-row"><kbd>${t('Horn')}</kbd><span>${t('Sound the horn early to earn 75 gold and meet the next wave on your terms.')}</span></div>
            <div class="help-row"><kbd>${t('Legacy')}</kbd><span>${t('Renown persists between campaigns and unlocks starting bonuses.')}</span></div>
          </div>
        </div>
        <div class="modal-foot"><button class="button primary" data-modal-action="close-help">${t('Return to the Realm')}</button><button class="button subtle" data-modal-action="options">${t('Options')}</button></div>
      </div>
    </div>`;
    this.remountHud();
  }

  closeHelp() {
    this.helpOpen = false;
    this.modalRoot.innerHTML = '';
    this.remountHud();
    if (this.helpPauseReturn) {
      this.game.setPaused(false);
      this.helpPauseReturn = false;
    } else if (this.game.state === 'playing' && this.game.paused) {
      this.showPause();
    }
  }

  openAgeModal() {
    if (this.game.state !== 'playing') return;
    const wasOpen = this.ageModalOpen;
    this.ageModalOpen = true;
    if (!wasOpen) this.agePauseReturn = !this.game.paused;
    if (this.agePauseReturn) this.game.setPaused(true);
    const age = AGES[this.game.age];
    const next = AGES[this.game.age + 1];
    const cost = this.game.costForNextAge();
    const affordable = this.game.canAfford(cost);
    this.modalRoot.innerHTML = `<div class="modal-overlay">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <span class="modal-kicker">${t('The chronicle turns')}</span>
          <h2 class="modal-title">${age.name}</h2>
          <p class="modal-sub">${next ? t('Advance to the {age} to unlock {list}.', { age: next.name, list: next.unlocks.join(', ') }) : t('The final age of your campaign. The realm stands at its height.')}</p>
          <div class="modal-ornament"></div>
        </div>
        <div class="age-modal-grid">
          ${AGES.map((item, index) => `<div class="age-step ${index === this.game.age ? 'current' : ''} ${index < this.game.age ? 'done' : ''}">
            <b>${item.name}</b>
            <span>${item.next ? costText(item.next) : t('Final age')}</span>
            <i>${index < this.game.age ? t('Reached') : index === this.game.age ? t('Current') : item.unlocks[0] || ''}</i>
          </div>`).join('')}
        </div>
        <div class="modal-foot">
          ${next ? `<button class="button primary" data-modal-action="advance-age" ${affordable ? '' : 'disabled style="opacity:.45;cursor:not-allowed"'}>${t('Advance — {cost}', { cost: costText(cost) })}</button>` : `<span class="button subtle" aria-disabled="true">${t('Imperial Age reached')}</span>`}
          <button class="button subtle" data-modal-action="close-age">${t('Close')}</button>
        </div>
      </div>
    </div>`;
    this.remountHud();
  }

  closeAgeModal() {
    this.ageModalOpen = false;
    this.modalRoot.innerHTML = '';
    this.remountHud();
    if (this.agePauseReturn) {
      this.game.setPaused(false);
      this.agePauseReturn = false;
    }
  }

  openOptions() {
    this.optionsReturn = this.helpOpen ? 'help' : this.pauseOpen ? 'pause' : 'menu';
    this.optionsReturnFocus = document.activeElement;
    this.optionsOpen = true;
    this.renderOptions();
  }

  renderOptions() {
    const select = LANGUAGES.map(language => `<option value="${language.code}" ${language.code === getLang() ? 'selected' : ''}>${language.label}</option>`).join('');
    this.modalRoot.innerHTML = `<div class="modal-overlay">
      <div class="modal options-panel" role="dialog" aria-modal="true" aria-labelledby="optionsTitle">
        <div class="modal-head">
          <span class="modal-kicker">${t('The steward awaits')}</span>
          <h2 class="modal-title" id="optionsTitle">${t('Options')}</h2>
          <p class="modal-sub">${t('Shape the chronicle to your liking. Changes take effect at once.')}</p>
          <div class="modal-ornament"></div>
        </div>
        <div class="options-body">
          <div class="option-row">
            <div class="option-copy">
              <b>${t('Language')}</b>
              <span>${t('Choose the language for the interface, campaign, and all game text.')}</span>
            </div>
            <label class="option-select">
              <span class="sr-only">${t('Language')}</span>
              <select data-language-select>${select}</select>
            </label>
          </div>
        </div>
        <div class="modal-foot">
          <button class="button primary" data-modal-action="close-options">${t('Back')}</button>
        </div>
      </div>
    </div>`;
    const selectEl = this.modalRoot.querySelector('[data-language-select]');
    if (selectEl) selectEl.focus({ preventScroll: true });
    this.remountHud();
  }

  closeOptions() {
    this.optionsOpen = false;
    this.modalRoot.innerHTML = '';
    this.remountHud();
    if (this.optionsReturn === 'pause' && this.game.state === 'playing') {
      this.showPause();
    } else if (this.optionsReturn === 'help') {
      this.openHelp();
    } else {
      this.pauseOpen = false;
      if (this.optionsReturnFocus && typeof this.optionsReturnFocus.focus === 'function') {
        this.optionsReturnFocus.focus({ preventScroll: true });
      }
    }
  }

  closeModal() {
    if (this.modalRoot.querySelector('.result-panel')) return;
    this.modalRoot.innerHTML = '';
    this.remountHud();
    this.pauseOpen = false;
    this.optionsOpen = false;
  }

  handleModalAction(action) {
    if (action === 'resume') {
      this.actions.togglePause();
    } else if (action === 'help') {
      this.openHelp();
    } else if (action === 'options') {
      this.openOptions();
    } else if (action === 'close-options') {
      this.closeOptions();
    } else if (action === 'restart') {
      this.actions.restart();
    } else if (action === 'main-menu') {
      this.actions.mainMenu();
    } else if (action === 'play-again') {
      this.actions.playAgain();
    } else if (action === 'close-help') {
      this.closeHelp();
    } else if (action === 'advance-age') {
      const wasPaused = this.agePauseReturn;
      const advanced = this.game.advanceAge();
      if (advanced) {
        this.ageModalOpen = false;
        this.agePauseReturn = false;
        this.modalRoot.innerHTML = '';
        if (wasPaused) this.game.setPaused(false);
        this.refreshSelection();
      } else {
        this.openAgeModal();
      }
    } else if (action === 'close-age') {
      this.closeAgeModal();
    }
  }
}
