import { axialToWorld, axialKey, clamp, worldToAxial } from './core.js';
import { BIOMES, FEATURES, RESOURCES } from './world.js';
import { CIVS, UNIT_TYPES, BUILDINGS, WONDERS, TECHS, CIVICS } from './game.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const icon = (name) => `<svg class="ic"><use href="#${name}"/></svg>`;

const RES_META = {
  science: { icon: 'i-science', label: 'Science' },
  culture: { icon: 'i-culture', label: 'Culture' },
  gold: { icon: 'i-gold', label: 'Gold' },
  faith: { icon: 'i-faith', label: 'Faith' },
  influence: { icon: 'i-influence', label: 'Influence' },
};
const YIELD_ORDER = ['food', 'production', 'gold', 'science', 'culture', 'faith'];
const YIELD_ICON = { food: 'i-food', production: 'i-production', gold: 'i-gold', science: 'i-science', culture: 'i-culture', faith: 'i-faith', influence: 'i-influence' };

export class UI {
  constructor(game, world) {
    this.game = game;
    this.world = world;
    this.actions = null;
    this.el = {
      resourceBar: $('#resource-bar'),
      civName: $('#player-civ'),
      leader: $('#player-leader'),
      age: $('#player-age'),
      crest: $('#player-crest'),
      eraChip: $('#era-chip'),
      turn: $('#turn-number'),
      researchCard: $('#research-card'),
      currentTech: $('#current-tech'),
      techProgress: $('#tech-progress'),
      techTurns: $('#tech-turns'),
      techBlurb: $('#tech-blurb'),
      sciencePerTurn: $('#science-per-turn'),
      objectiveList: $('#objective-list'),
      leaders: $('#leaders-card'),
      minimap: $('#minimap'),
      minimapCoords: $('#minimap-coords'),
      selection: $('#selection-panel'),
      commandBar: $('#command-bar'),
      endTurn: $('#end-turn'),
      toasts: $('#toasts'),
      tooltip: $('#tooltip'),
      modals: $('#modals'),
      actionHint: $('#action-hint'),
      turnBanner: $('#turn-banner'),
      loading: $('#loading-screen'),
      playerAge: $('#player-age'),
    };
    this.el.modals.classList.add('hidden');
    this.bindStatic();
    this.bindGame();
    this.renderAll();
  }

  bindGame() {
    const g = this.game;
    g.on('change', () => this.renderAll());
    g.on('selection', () => this.renderSelection());
    g.on('notify', (n) => this.toast(n));
    g.on('turnEnd', ({ turn }) => { this.el.turn.textContent = turn; this.renderAll(); });
    g.on('newEra', (era) => this.turnBanner(era));
    g.on('techComplete', ({ civId }) => { if (civId === g.playerId) this.renderResearch(); });
    g.on('meet', (civ) => this.toast({ title: 'First Contact', body: `${civ.leader} of ${civ.name} has found your people.`, kind: 'info', icon: 'i-influence' }));
    g.on('cityFounded', (city) => { this.toast({ title: 'City Founded', body: `${city.name} is founded. May it stand for ages.`, kind: 'good', icon: 'i-city' }); });
    g.on('cityCaptured', ({ city, conqueror }) => this.toast({ title: 'City Captured', body: `${city.name} now flies the banner of ${conqueror.name}.`, kind: 'war', icon: 'i-attack' }));
    g.on('wonderBuilt', ({ city, id }) => this.toast({ title: 'Wonder Complete', body: `${WONDERS[id].name} rises in ${city.name}.`, kind: 'good', icon: 'i-wonder' }));
    g.on('combatFlash', () => this.flash());
    g.on('objectiveDone', (o) => this.toast({ title: 'Legacy Advanced', body: o.text, kind: 'good', icon: 'i-wonder' }));
    g.on('gameOver', (res) => this.gameOver(res));
  }

  bindStatic() {
    this.el.endTurn.addEventListener('click', () => this.actions?.command('endTurn'));
    $('#open-tech').addEventListener('click', () => this.techTree());
    window.addEventListener('resize', () => this.drawMinimap());
    const minimap = this.el.minimap;
    minimap.addEventListener('click', (e) => {
      const rect = minimap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const { minX, maxX, minZ, maxZ } = this.world.bounds;
      const x = minX + px * (maxX - minX);
      const z = minZ + py * (maxZ - minZ);
      const ax = worldToAxial(x, z);
      this.actions?.focusTile(ax.q, ax.r);
    });
  }

  setActions(actions) { this.actions = actions; }

  /* ============================ RENDER ============================ */
  renderAll() {
    const g = this.game;
    const world = this.world;
    const player = world.civs.get(g.playerId);
    this.el.civName.textContent = player.name;
    this.el.leader.textContent = player.leader;
    this.el.age.textContent = `Age of ${['Antiquity', 'Exploration', 'Modern', 'Future'][g.eraIndex]}`;
    this.el.crest.innerHTML = crestSVG(player);
    this.el.eraChip.textContent = ['ANTIQUITY', 'EXPLORATION', 'MODERN', 'FUTURE'][g.eraIndex];
    this.el.turn.textContent = g.turn;
    this.renderResources();
    this.renderResearch();
    this.renderObjectives();
    this.renderLeaders();
    this.renderSelection();
    this.renderCommands();
    this.drawMinimap();
    this.updateHint();
  }

  renderResources() {
    const g = this.game;
    const y = g.civYields(g.playerId);
    const stock = g.stocks[g.playerId];
    const items = [
      { kind: 'science', value: y.science, delta: true, icon: 'i-science', title: 'Science per turn' },
      { kind: 'culture', value: y.culture, delta: true, icon: 'i-culture', title: 'Culture per turn' },
      { kind: 'gold', value: stock.gold, delta: y.gold, icon: 'i-gold', title: 'Treasury / Gold per turn' },
      { kind: 'faith', value: stock.faith, delta: y.faith, icon: 'i-faith', title: 'Faith / per turn' },
      { kind: 'influence', value: stock.influence, delta: y.influence, icon: 'i-influence', title: 'Influence / per turn' },
    ];
    this.el.resourceBar.innerHTML = items.map((it) => {
      const delta = typeof it.delta === 'number' ? it.delta : it.value;
      const cls = delta >= 0 ? 'up' : 'down';
      return `<div class="res" data-kind="${it.kind}" title="${esc(it.title)}">
        ${icon(it.icon)}
        <span class="val">${fmt(it.value)}</span>
        ${typeof it.delta === 'number' ? `<span class="delta ${cls}">${delta >= 0 ? '+' : ''}${fmt(delta)}</span>` : ''}
      </div>`;
    }).join('');
  }

  renderResearch() {
    const g = this.game;
    const civId = g.playerId;
    const techId = g.currentTech[civId];
    const tech = TECHS.find((t) => t.id === techId);
    const y = g.civYields(civId);
    this.el.sciencePerTurn.textContent = `+${fmt(y.science)}`;
    if (!tech) {
      this.el.currentTech.textContent = 'All technologies discovered';
      this.el.techProgress.style.width = '100%';
      this.el.techTurns.textContent = '—';
      this.el.techBlurb.textContent = 'Your scholars have mastered the known world.';
      return;
    }
    const progress = g.techProgress[civId] || 0;
    const pct = clamp((progress / tech.cost) * 100, 0, 100);
    this.el.currentTech.textContent = tech.name;
    this.el.techProgress.style.width = `${pct}%`;
    this.el.techTurns.textContent = `${g.researchTurns(civId)}t`;
    this.el.techBlurb.textContent = tech.bonus;
  }

  renderObjectives() {
    const g = this.game;
    g.refreshObjectives();
    this.el.objectiveList.innerHTML = g.objectives.map((o) =>
      `<li class="${o.done ? 'done' : ''}"><span class="tick"></span><span>${esc(o.text)}</span></li>`).join('');
  }

  renderLeaders() {
    const g = this.game;
    this.el.leaders.innerHTML = CIVS.filter((c) => c.id !== g.playerId).map((civ) => {
      const relation = g.leaderRelations(civ);
      const met = g.met.has(civ.id);
      return `<div class="leader-row" data-civ="${civ.id}" style="--c:${civ.colorHex}">
        <div class="av">${leaderSVG(civ)}</div>
        <div class="who"><b>${met ? esc(civ.name) : 'Unknown Power'}</b><span>${met ? esc(civ.leader) : 'unmet'}</span></div>
        <span class="att ${relation.cls}">${relation.label}</span>
      </div>`;
    }).join('');
    $$('.leader-row', this.el.leaders).forEach((row) => {
      row.addEventListener('click', () => {
        const civ = this.world.civs.get(row.dataset.civ);
        if (civ) this.diplomacy(civ);
      });
    });
  }

  renderSelection() {
    const g = this.game;
    const sel = g.selected;
    const panel = this.el.selection;
    if (!sel) { panel.classList.add('hidden'); this.styleEndTurn(); return; }
    if (sel.type === 'unit') this.renderUnitPanel(sel.ref);
    else if (sel.type === 'city') this.renderCityPanel(sel.ref);
    panel.classList.remove('hidden');
    this.styleEndTurn();
  }

  renderUnitPanel(unit) {
    const g = this.game;
    const def = UNIT_TYPES[unit.type];
    const tile = this.world.tiles.get(axialKey(unit.q, unit.r));
    const y = g.tileYields(tile, unit.civId);
    const hpPct = (unit.hp / unit.maxHp) * 100;
    const pips = Array.from({ length: def.moves }, (_, i) => `<span class="pip ${i < unit.moves ? 'on' : ''}"></span>`).join('');
    this.el.selection.innerHTML = `
      <div class="sel-head">
        <div class="sel-portrait" style="--c:${unit.civ.colorHex}">${icon(def.icon)}</div>
        <div class="sel-titles">
          <div class="sel-kind">UNIT</div>
          <div class="sel-name">${esc(def.name)}</div>
          <div class="sel-sub">${esc(unit.civ.name)} • Lv ${unit.level + 1}${unit.fortified ? ' • Fortified' : ''}</div>
        </div>
        <button class="sel-close" data-close="1">×</button>
      </div>
      <div class="sel-body">
        <div class="stat-row">
          <div class="stat"><div class="k">Strength</div><div class="v">${def.rangedStr ? `${def.str}/${def.rangedStr}` : def.str}</div></div>
          <div class="stat"><div class="k">Health</div><div class="v">${Math.round(unit.hp)}</div></div>
          <div class="stat"><div class="k">Moves</div><div class="v">${unit.moves}</div></div>
        </div>
        <div class="hpbar ${hpPct < 40 ? 'low' : ''}"><i style="width:${hpPct}%"></i></div>
        <div class="pips">${pips}</div>
        <div class="yields">${yieldChips(y, { production: false })}</div>
        <div class="diplo-line">Position: ${terrainName(tile)}${tile.feature ? ` — ${FEATURES[tile.feature].label}` : ''}${tile.resource ? ` • ${RESOURCES[tile.resource].name}` : ''}</div>
      </div>`;
    $('[data-close]', this.el.selection)?.addEventListener('click', () => this.game.select(null));
  }

  renderCityPanel(city) {
    const g = this.game;
    const y = g.civYields(city.civId);
    const growth = 14 + city.population * 9;
    const growthPct = clamp((city.food / growth) * 100, 0, 100);
    const prodPct = city.producing ? clamp((city.produceProgress / city.producing.cost) * 100, 0, 100) : 0;
    this.el.selection.innerHTML = `
      <div class="sel-head">
        <div class="sel-portrait" style="--c:${city.civ.colorHex}">${icon('i-city')}</div>
        <div class="sel-titles">
          <div class="sel-kind">${city.isCapital ? 'CAPITAL' : 'CITY'} • ${city.civ.name}</div>
          <div class="sel-name">${esc(city.name)}</div>
          <div class="sel-sub">Population ${city.population} • ${city.buildings.length} buildings${city.wonders.length ? ` • ${city.wonders.length} wonders` : ''}</div>
        </div>
        <button class="sel-close" data-close="1">×</button>
      </div>
      <div class="sel-body">
        <div class="stat-row">
          <div class="stat"><div class="k">Defence</div><div class="v">${Math.round(city.defense)}</div></div>
          <div class="stat"><div class="k">City HP</div><div class="v">${Math.round(city.hp)}</div></div>
          <div class="stat"><div class="k">Territory</div><div class="v">${this.world.tileList.filter((t) => t.owner === city.civId).length}</div></div>
        </div>
        <div class="hpbar ${city.hp < city.maxHp * 0.4 ? 'low' : ''}"><i style="width:${(city.hp / city.maxHp) * 100}%"></i></div>
        <div class="city-prod">
          <div class="prod-card" data-open-city="1">
            ${icon(city.producing?.icon ?? 'i-production')}
            <div><div class="t">${city.producing ? esc(city.producing.name) : 'Choose production'}</div>
            <div class="s">${city.producing ? `${Math.round(prodPct)}% complete` : 'Production idle'}</div></div>
            <span class="turns">${city.producing ? g.estimateTurns(city, city.producing.cost) + 't' : '—'}</span>
          </div>
        </div>
        <div class="yields">${yieldChips(y)}</div>
        <div class="diplo-line">Growth ${Math.round(growthPct)}% • Producing ${fmt(y.production + city.population)} per turn</div>
      </div>`;
    $('[data-close]', this.el.selection)?.addEventListener('click', () => this.game.select(null));
    $('[data-open-city]', this.el.selection)?.addEventListener('click', () => this.cityModal(city));
  }

  renderCommands() {
    const g = this.game;
    const sel = g.selected;
    const bar = this.el.commandBar;
    let cmds = [];
    const player = this.world.civs.get(g.playerId);
    if (sel?.type === 'unit') {
      const unit = sel.ref;
      const def = UNIT_TYPES[unit.type];
      if (def.found) cmds.push({ id: 'found', icon: 'i-settle', label: 'Found', key: 'F' });
      if (def.build) cmds.push({ id: 'improve', icon: 'i-production', label: 'Build', key: 'B' });
      if (!def.civilian) cmds.push({ id: 'fortify', icon: 'i-fortify', label: 'Fortify', key: 'T' });
      cmds.push({ id: 'sleep', icon: 'i-sleep', label: 'Sleep', key: 'Z' });
      cmds.push({ id: 'skip', icon: 'i-skip', label: 'Skip', key: 'S' });
      cmds.push({ id: 'next', icon: 'i-move', label: 'Next', key: 'N' });
    } else if (sel?.type === 'city') {
      cmds.push({ id: 'cityPanel', icon: 'i-city', label: 'Manage', key: 'C' });
      cmds.push({ id: 'next', icon: 'i-move', label: 'Next', key: 'N' });
      cmds.push({ id: 'tech', icon: 'i-research', label: 'Tech', key: 'T' });
    } else {
      cmds.push({ id: 'next', icon: 'i-move', label: 'Next Unit', key: 'N' });
      cmds.push({ id: 'tech', icon: 'i-research', label: 'Tech Tree', key: 'T' });
      cmds.push({ id: 'help', icon: 'i-wonder', label: 'Help', key: 'H' });
    }
    bar.innerHTML = cmds.map((c) =>
      `<button class="cmd" data-id="${c.id}" title="${c.label} (${c.key})">${icon(c.icon)}<small>${c.label}</small><kbd>${c.key}</kbd></button>`).join('');
    bar.classList.toggle('hidden', cmds.length === 0);
    $$('.cmd', bar).forEach((b) => b.addEventListener('click', () => this.actions?.command(b.dataset.id)));
    this.styleEndTurn();
  }

  styleEndTurn() {
    const g = this.game;
    const player = this.world.civs.get(g.playerId);
    const hasActions = player.units.some((u) => u.moves > 0 && !u.asleep);
    this.el.endTurn.classList.toggle('urgent', hasActions && !g.busy);
  }

  updateHint() {
    const g = this.game;
    const sel = g.selected;
    const hint = this.el.actionHint;
    if (g.busy) { hint.textContent = 'Rivals are taking their turn…'; hint.classList.remove('hidden'); return; }
    let text = '';
    if (sel?.type === 'unit') {
      const def = UNIT_TYPES[sel.ref.type];
      if (def.found) text = 'Click a highlighted tile to move, then press Found to establish a city.';
      else if (def.build) text = 'Move onto a tile and press Build to raise a farm or mine.';
      else if (def.civilian) text = 'Use the command bar to act.';
      else text = 'Click a blue tile to move, or a red tile to attack.';
    } else if (sel?.type === 'city') {
      text = 'Open Manage to queue production. The city grows and expands on its own.';
    } else {
      text = 'Drag to orbit, right-drag to pan, scroll to zoom. Select a unit or city to begin.';
    }
    hint.textContent = text;
    hint.classList.remove('hidden');
  }

  /* ============================ MINIMAP ============================ */
  drawMinimap() {
    const world = this.world;
    const canvas = this.el.minimap;
    if (!canvas) return;
    const g = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const { minX, maxX, minZ, maxZ } = world.bounds;
    const pad = 1;
    const sx = W / (maxX - minX + 2), sz = H / (maxZ - minZ + 2);
    const toX = (x) => (x - minX + pad) * sx;
    const toY = (z) => (z - minZ + pad) * sz;
    g.clearRect(0, 0, W, H);
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#071622'); bg.addColorStop(1, '#03101a');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    for (const tile of world.tileList) {
      const px = toX(tile.x), py = toY(tile.z);
      const r = Math.min(sx, sz) * 1.05;
      if (!tile.explored) {
        g.fillStyle = 'rgba(150,168,182,0.28)';
      } else {
        const bt = BIOMES[tile.terrain];
        g.fillStyle = '#' + new THREE_COLOR(bt.top).multiplyScalar(tile.visible ? 1 : 0.62).getHexString();
      }
      hexPath(g, px, py, r);
      g.fill();
      if (tile.explored && tile.owner) {
        const civ = world.civs.get(tile.owner);
        g.fillStyle = hexA(civ.colorHex, 0.28);
        hexPath(g, px, py, r); g.fill();
      }
    }
    // cities
    for (const city of world.cities) {
      const civ = world.civs.get(city.civId);
      const px = toX(city.tile.x), py = toY(city.tile.z);
      g.fillStyle = civ.colorHex;
      g.beginPath(); g.arc(px, py, city.isCapital ? 4.2 : 3.2, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1; g.stroke();
      if (city.isCapital) { g.fillStyle = '#0a1219'; g.beginPath(); g.arc(px, py, 1.6, 0, Math.PI * 2); g.fill(); }
    }
    // units
    for (const unit of world.units) {
      if (!unit.tile?.explored && unit.civId !== this.game.playerId) continue;
      const civ = world.civs.get(unit.civId);
      const px = toX(unit.tile.x), py = toY(unit.tile.z);
      g.fillStyle = civ.colorHex;
      g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 0.8;
      g.beginPath(); g.arc(px, py, 2.1, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // viewport marker
    if (this.actions?.getCameraTarget) {
      const t = this.actions.getCameraTarget();
      if (t) {
        const ax = worldToAxial(t.x, t.z);
        const tile = world.tiles.get(axialKey(ax.q, ax.r));
        if (tile) {
          const px = toX(tile.x), py = toY(tile.z);
          g.strokeStyle = 'rgba(255,235,190,0.8)'; g.lineWidth = 1.2;
          g.strokeRect(px - 8, py - 6, 16, 12);
        }
      }
    }
  }

  setMinimapCoords(tile) {
    if (!tile) { this.el.minimapCoords.textContent = 'Hex —'; return; }
    this.el.minimapCoords.textContent = `${terrainName(tile)} · ${tile.q},${tile.r}`;
  }

  /* ============================ TOASTS / TOOLTIP ============================ */
  toast({ title, body, kind = 'info', icon: iconName = 'i-research' }) {
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.innerHTML = `${icon(iconName)}<div><div class="tt">${esc(title)}</div><div class="ts">${esc(body)}</div></div>`;
    this.el.toasts.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 520); }, 4200);
  }

  flash() {
    let f = $('#combat-flash');
    if (!f) { f = document.createElement('div'); f.id = 'combat-flash'; $('#app').appendChild(f); }
    f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
  }

  showTooltip(tile, x, y) {
    const g = this.game;
    const world = this.world;
    const tt = this.el.tooltip;
    if (!tile || !tile.explored) { tt.classList.add('hidden'); this.setMinimapCoords(null); return; }
    this.setMinimapCoords(tile);
    const y2 = g.tileYields(tile, g.playerId);
    const owner = tile.owner ? world.civs.get(tile.owner) : null;
    tt.innerHTML = `
      <div class="tt-name">${terrainName(tile)}</div>
      <div class="tt-sub">${tile.q}, ${tile.r}${owner ? ` • ${owner.name} territory` : ''}</div>
      ${tile.feature ? `<span class="tt-feature">${FEATURES[tile.feature].label}</span>` : ''}
      ${tile.resource ? `<span class="tt-feature" style="color:${RESOURCES[tile.resource].color};border-color:${RESOURCES[tile.resource].color}55">${RESOURCES[tile.resource].name}</span>` : ''}
      <div class="tt-yields">${yieldChips(y2, { production: true })}</div>
      ${tile.improvement ? `<div class="tt-note">Improved: ${tile.improvement}</div>` : ''}
      ${tile.city ? `<div class="tt-note">${tile.city.name} — population ${tile.city.population}</div>` : ''}
      ${tile.units.length ? `<div class="tt-note">${tile.units.map((u) => `${UNIT_TYPES[u.type].name} (${u.civ.name})`).join(', ')}</div>` : ''}
    `;
    tt.classList.remove('hidden');
    const pad = 16;
    const w = tt.offsetWidth, h = tt.offsetHeight;
    tt.style.left = `${clamp(x + pad, 8, window.innerWidth - w - 8)}px`;
    tt.style.top = `${clamp(y + pad, 8, window.innerHeight - h - 8)}px`;
  }
  hideTooltip() { this.el.tooltip.classList.add('hidden'); }

  turnBanner(era) {
    const el = this.el.turnBanner;
    el.innerHTML = `<div class="tb"><div class="tb-era">A New Chapter</div><div class="tb-main">Age of ${era.name}</div><div class="tb-sub">Turn ${this.game.turn} — the world turns, and your legend grows</div></div>`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 2700);
  }

  /* ============================ MODALS ============================ */
  openModal(html, cls = '') {
    const m = this.el.modals;
    m.innerHTML = `<div class="modal ${cls}">${html}</div>`;
    m.classList.remove('hidden');
    $$('.close', m).forEach((b) => b.addEventListener('click', () => this.closeModal()));
    m.onclick = (e) => { if (e.target === m) this.closeModal(); };
  }
  closeModal() { this.el.modals.classList.add('hidden'); this.el.modals.innerHTML = ''; }

  techTree() {
    const g = this.game;
    const civId = g.playerId;
    const acquired = g.techStateFor(civId);
    const current = g.currentTech[civId];
    const eras = ['Antiquity', 'Exploration', 'Modern'];
    const body = eras.map((era) => {
      const techs = TECHS.filter((t) => t.era === era);
      return `<div class="tech-era"><h3>${era.toUpperCase()}</h3><div class="tech-grid">${techs.map((t) => {
        const done = acquired.has(t.id);
        const avail = !done && t.prereq.every((p) => acquired.has(p));
        const isCurrent = t.id === current;
        const cls = done ? 'done' : isCurrent ? 'current available' : avail ? 'available' : 'locked';
        const foot = done ? 'Discovered' : isCurrent ? `Researching • ${g.researchTurns(civId)}t` : avail ? 'Click to research' : 'Requires ' + t.prereq.map((p) => TECHS.find((x) => x.id === p).name).join(', ');
        return `<div class="tech-node ${cls}" data-tech="${t.id}">
          <div class="tn-head">${icon(t.icon)}<span class="tn-name">${esc(t.name)}</span></div>
          <div class="tn-cost">${t.cost} science • ${era}</div>
          <div class="tn-desc">${esc(t.bonus)}</div>
          <div class="tn-foot">${foot}</div>
        </div>`;
      }).join('')}</div></div>`;
    }).join('');
    this.openModal(`
      <div class="modal-head">${icon('i-research')}<div><h2>TECHNOLOGY</h2><div class="sub">Chart the path of progress — ${acquired.size} of ${TECHS.length} discovered</div></div><button class="close">×</button></div>
      <div class="modal-body">${body}</div>`);
    $$('.tech-node.available', this.el.modals).forEach((node) => {
      node.addEventListener('click', () => {
        const id = node.dataset.tech;
        if (g.setResearch(civId, id)) { this.closeModal(); this.renderAll(); this.toast({ title: 'Research begun', body: `Scholars turn to ${TECHS.find((t) => t.id === id).name}.`, kind: 'good', icon: 'i-research' }); }
      });
    });
  }

  cityModal(city) {
    const g = this.game;
    const opts = g.productionOptions(city);
    const y = g.civYields(city.civId);
    const growth = 14 + city.population * 9;
    const prod = opts.map((o) => `
      <div class="prod-option" data-kind="${o.kind}" data-id="${o.id}">
        ${icon(o.icon)}
        <div><div class="po-t">${esc(o.name)}</div><div class="po-d">${esc(o.blurb)}</div></div>
        <div class="po-cost"><b>${o.turns}t</b>${o.cost} prod</div>
      </div>`).join('') || '<p class="diplo-line">No options available.</p>';
    const built = [...city.buildings.map((b) => BUILDINGS[b]?.name), ...city.wonders.map((w) => WONDERS[w]?.name)]
      .map((n) => `<span class="building-chip">${icon('i-wonder')}${esc(n)}</span>`).join('') || '<span class="diplo-line">No buildings yet.</span>';
    this.openModal(`
      <div class="modal-head">${icon('i-city')}<div><h2>${esc(city.name)}</h2><div class="sub">${esc(city.civ.name)} ${city.isCapital ? '• Capital' : '• City'} — population ${city.population}</div></div><button class="close">×</button></div>
      <div class="modal-body city-modal" style="display:grid;grid-template-columns:1.1fr 1fr;gap:20px">
        <div class="city-col">
          <h3>PRODUCTION</h3>
          ${prod}
        </div>
        <div class="city-col">
          <h3>CITY SUMMARY</h3>
          <div class="city-stats">
            <div class="city-stat"><div class="k">Food</div><div class="v">${fmt(y.food)}<small>/t</small></div></div>
            <div class="city-stat"><div class="k">Production</div><div class="v">${fmt(y.production + city.population)}<small>/t</small></div></div>
            <div class="city-stat"><div class="k">Gold</div><div class="v">${fmt(y.gold)}<small>/t</small></div></div>
            <div class="city-stat"><div class="k">Science</div><div class="v">${fmt(y.science)}<small>/t</small></div></div>
            <div class="city-stat"><div class="k">Culture</div><div class="v">${fmt(y.culture)}<small>/t</small></div></div>
            <div class="city-stat"><div class="k">Faith</div><div class="v">${fmt(y.faith)}<small>/t</small></div></div>
          </div>
          <h3>GROWTH &amp; DEFENCE</h3>
          <div class="hpbar" style="margin-bottom:8px"><i style="width:${clamp((city.food / growth) * 100, 0, 100)}%"></i></div>
          <div class="diplo-line">Growing to ${city.population + 1} citizens • Defence ${Math.round(city.defense)} • City HP ${Math.round(city.hp)}/${city.maxHp}</div>
          <h3 style="margin-top:16px">BUILDINGS &amp; WONDERS</h3>
          <div>${built}</div>
        </div>
      </div>`);
    $$('.prod-option', this.el.modals).forEach((el) => {
      el.addEventListener('click', () => {
        g.setProduction(city, el.dataset.kind, el.dataset.id);
        this.closeModal();
        this.renderAll();
        this.toast({ title: 'Production set', body: `${city.name} begins work.`, kind: 'good', icon: 'i-production' });
      });
    });
  }

  diplomacy(civ) {
    const g = this.game;
    const relation = g.leaderRelations(civ);
    const quote = civ.id === 'norlund'
      ? 'Your walls look sturdy. We shall test them.'
      : civ.id === 'kemet'
        ? 'The river binds our peoples. Trade would suit us both.'
        : civ.id === 'xian'
          ? 'Heaven watches your deeds, sovereign. Prove yourself worthy.'
          : 'Friendship is the truest conquest.';
    this.openModal(`
      <div class="modal-head">${icon('i-influence')}<div><h2>${esc(civ.name)}</h2><div class="sub">${esc(civ.leader)} — ${esc(civ.title)}</div></div><button class="close">×</button></div>
      <div class="modal-body">
        <div class="diplo-body">
          <div class="diplo-portrait" style="color:${civ.colorHex}">${leaderSVG(civ, true)}</div>
          <div class="diplo-text">
            <p class="diplo-quote">“${esc(quote)}”</p>
            <div class="diplo-line" style="margin-bottom:12px">Status: <b style="color:${relation.cls === 'war' ? '#ff9c8f' : '#a9e8dc'}">${relation.label}</b> · Trait: <b>${esc(civ.traitName)}</b><br/>${esc(civ.trait)}</div>
            <div class="diplo-actions">
              <button class="act-btn" data-act="embassy">Establish Embassy</button>
              <button class="act-btn ghost" data-act="gift">Send Gift</button>
              <button class="act-btn ghost" data-act="close">Leave</button>
            </div>
          </div>
        </div>
      </div>`, 'diplo-modal');
    $$('[data-act]', this.el.modals).forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.act === 'close') return this.closeModal();
      this.closeModal();
      this.toast({ title: b.dataset.act === 'embassy' ? 'Embassy Established' : 'Gift Sent', body: `${civ.leader} acknowledges your gesture.`, kind: 'good', icon: 'i-influence' });
    }));
  }

  helpModal() {
    this.openModal(`
      <div class="modal-head">${icon('i-wonder')}<div><h2>HOW TO RULE</h2><div class="sub">Guide your civilization from the Age of Antiquity to legend</div></div><button class="close">×</button></div>
      <div class="modal-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px">
          <div>
            <h3 style="font-family:var(--display);color:var(--gold);letter-spacing:.2em;font-size:12px">CONTROLS</h3>
            <p class="diplo-line"><b>Left-drag</b> orbit • <b>Right-drag</b> pan • <b>Wheel</b> zoom<br/><b>Click</b> select unit/city or order a move<br/><b>Space</b> end turn • <b>T</b> tech tree • <b>C</b> manage city • <b>N</b> next unit • <b>Esc</b> close<br/><b>F</b> found city • <b>B</b> build improvement • <b>Z</b> sleep</p>
            <h3 style="font-family:var(--display);color:var(--gold);letter-spacing:.2em;font-size:12px;margin-top:16px">THE GOAL</h3>
            <p class="diplo-line">Grow cities, discover technologies, claim territory and command armies. Score the highest legacy by turn ${50}, or conquer every rival capital for a domination victory.</p>
          </div>
          <div>
            <h3 style="font-family:var(--display);color:var(--gold);letter-spacing:.2em;font-size:12px">FIRST MOVES</h3>
            <ul class="objective-list">
              <li><span class="tick"></span><span>Scout with your Scout to reveal the map and meet rivals.</span></li>
              <li><span class="tick"></span><span>Found a second city with your Settler on fertile land.</span></li>
              <li><span class="tick"></span><span>Queue a Warrior in the capital to defend your borders.</span></li>
              <li><span class="tick"></span><span>Improve tiles with your Builder to grow faster.</span></li>
            </ul>
          </div>
        </div>
      </div>`);
  }

  gameOver({ victory, score }) {
    const won = victory === 'domination' || score > 0;
    this.openModal(`
      <div class="modal-head">${icon('i-wonder')}<div><h2>${victory === 'domination' ? 'DOMINATION VICTORY' : 'THE AGE CONCLUDES'}</h2><div class="sub">Legacy Score: ${score}</div></div><button class="close">×</button></div>
      <div class="modal-body" style="text-align:center">
        <p class="diplo-quote" style="font-size:20px">${victory === 'domination' ? 'Every capital answers to your banner. History will remember Aurelia as eternal.' : 'The chronicles close on your reign. Your people\'s story will echo through the ages.'}</p>
        <div class="city-stats" style="max-width:520px;margin:14px auto">
          <div class="city-stat"><div class="k">Legacy</div><div class="v">${score}</div></div>
          <div class="city-stat"><div class="k">Cities</div><div class="v">${this.world.civs.get(this.game.playerId).cities.length}</div></div>
          <div class="city-stat"><div class="k">Technologies</div><div class="v">${this.game.techStateFor(this.game.playerId).size}</div></div>
        </div>
        <button class="act-btn" id="restart">Begin a New Age</button>
      </div>`);
    $('#restart')?.addEventListener('click', () => location.reload());
  }
}

/* ============================ helpers ============================ */
function fmt(n) {
  const v = Math.round((n ?? 0) * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
function yieldChips(y, opts = {}) {
  const parts = [];
  for (const k of YIELD_ORDER) {
    if (opts[k] === false) continue;
    const v = y[k] ?? 0;
    if (Math.abs(v) < 0.05) continue;
    parts.push(`<span class="yield">${icon(YIELD_ICON[k])}${fmt(v)}</span>`);
  }
  return parts.join('') || '<span class="yield" style="opacity:.5">No yields</span>';
}
function terrainName(tile) {
  const names = { ocean: 'Open Ocean', coast: 'Coast', lake: 'Lake', grassland: 'Grassland', plains: 'Plains', desert: 'Desert', tundra: 'Tundra', snow: 'Snow', hills: 'Hills', mountain: 'Mountains' };
  return names[tile.terrain] ?? tile.terrain;
}
function roundRectPath(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
function hexPath(g, cx, cy, r) {
  g.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i);
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath();
}
function hexA(hex, a) {
  const c = parseInt(hex.slice(1), 16);
  return `rgba(${(c >> 16) & 255},${(c >> 8) & 255},${c & 255},${a})`;
}
// small local colour helper for minimap without importing THREE
class THREE_COLOR {
  constructor(hex) { this.hex = hex; }
  multiplyScalar(s) { const c = parseInt(this.hex.toString(16).padStart(6, '0'), 16); const r = clamp(((c >> 16) & 255) * s, 0, 255) | 0; const g = clamp(((c >> 8) & 255) * s, 0, 255) | 0; const b = clamp((c & 255) * s, 0, 255) | 0; this._v = (r << 16) | (g << 8) | b; return this; }
  getHexString() { return (this._v ?? this.hex).toString(16).padStart(6, '0'); }
}

export function crestSVG(civ) {
  const c = civ.colorHex;
  return `<svg viewBox="0 0 64 72" width="100%" height="100%">
    <defs><linearGradient id="cg-${civ.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="rgba(0,0,0,0.55)"/>
    </linearGradient></defs>
    <path d="M32 3 L59 12 V38 C59 54 46 64 32 69 C18 64 5 54 5 38 V12 Z" fill="url(#cg-${civ.id})" stroke="#f0dcae" stroke-width="2.4"/>
    <path d="M32 8 L54 15 V37 C54 50 43 59 32 63 C21 59 10 50 10 37 V15 Z" fill="rgba(6,10,15,0.55)"/>
    ${civGlyph(civ.glyph, c)}
  </svg>`;
}
function civGlyph(glyph, color) {
  switch (glyph) {
    case 'sun': return `<circle cx="32" cy="30" r="8" fill="${color}"/><g stroke="${color}" stroke-width="2.4" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r1 = 11, r2 = 16; const ra = a * Math.PI / 180; return `<line x1="${32 + Math.cos(ra) * r1}" y1="${30 + Math.sin(ra) * r1}" x2="${32 + Math.cos(ra) * r2}" y2="${30 + Math.sin(ra) * r2}"/>`; }).join('')}</g><rect x="29" y="42" width="6" height="12" rx="1.5" fill="${color}"/>`;
    case 'ankh': return `<path d="M32 14 C24 14 20 20 20 26 C20 34 27 36 32 44 C37 36 44 34 44 26 C44 20 40 14 32 14 Z" fill="none" stroke="${color}" stroke-width="3"/><line x1="32" y1="24" x2="32" y2="56" stroke="${color}" stroke-width="3"/><line x1="21" y1="38" x2="43" y2="38" stroke="${color}" stroke-width="3"/>`;
    case 'raven': return `<path d="M12 44 L26 22 L34 34 L44 18 L52 44 L38 40 L32 50 L24 40 Z" fill="${color}"/><circle cx="30" cy="24" r="2.2" fill="#0a1219"/>`;
    case 'dragon': return `<path d="M16 46 C22 30 30 34 34 24 C36 18 42 16 48 20 C44 22 42 26 44 30 C50 40 42 50 32 50 C26 50 20 50 16 46 Z" fill="${color}"/><circle cx="40" cy="24" r="1.8" fill="#0a1219"/>`;
    default: return `<circle cx="32" cy="32" r="10" fill="${color}"/>`;
  }
}
export function leaderSVG(civ, big = false) {
  const c = civ.colorHex;
  return `<svg viewBox="0 0 60 80" width="100%" height="100%">
    <path d="M12 76 C12 58 20 50 30 50 C40 50 48 58 48 76 Z" fill="rgba(255,255,255,0.16)"/>
    <path d="M30 50 L18 78 L42 78 Z" fill="${c}" opacity="0.85"/>
    <circle cx="30" cy="34" r="15" fill="#d9a074"/>
    <path d="M15 30 C15 16 22 8 30 8 C38 8 45 16 45 30 C45 22 38 20 30 20 C22 20 15 22 15 30 Z" fill="rgba(20,26,34,0.92)"/>
    <path d="M14 26 L18 12 L24 22 L30 8 L36 22 L42 12 L46 26 Z" fill="${c}" stroke="#f0dcae" stroke-width="1.4"/>
    <circle cx="30" cy="9" r="2.6" fill="${c}"/>
  </svg>`;
}
