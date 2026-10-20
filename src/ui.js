import { axialToWorld, axialKey, clamp, worldToAxial } from './core.js';
import { BIOMES, FEATURES, RESOURCES } from './world.js';
import { CIVS, UNIT_TYPES, BUILDINGS, WONDERS, TECHS, CIVICS } from './game.js';
import {
  GENERALS, DOCTRINES, SCENARIOS, CRISES, SCHEMES, STRATEGIC,
  TECH_ERA_ORDER, TECH_ERA_NAMES,
} from './expansions.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const icon = (name) => `<svg class="ic"><use href="#${name}"/></svg>`;

const RES_META = {
  science: { icon: 'i-science', label: '科學' },
  culture: { icon: 'i-culture', label: '文化' },
  gold: { icon: 'i-gold', label: '金幣' },
  faith: { icon: 'i-faith', label: '信仰' },
  influence: { icon: 'i-influence', label: '影響力' },
};
const ERA_LABELS = TECH_ERA_NAMES;
const ERA_NAMES = TECH_ERA_ORDER.map((era) => ERA_LABELS[era]);
const ERA_CHIPS = [...ERA_NAMES];
const IMPROVEMENT_NAMES = { farm: '農場', mine: '礦場', depot: '補給站' };
const SCHEME_ICON = { fire: 'i-attack', rockslide: 'i-defense', flood: 'i-influence', orbital: 'i-wonder', storm: 'i-influence', terraform: 'i-wonder' };
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
      councilBtn: $('#open-council'),
      weatherStatus: $('#weather-status'),
      climateStatus: $('#climate-status'),
      crisisStatus: $('#crisis-status'),
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
    g.on('meet', (civ) => this.toast({ title: '初次接觸', body: `${civ.name}的${civ.leader}發現了你的子民。`, kind: 'info', icon: 'i-influence' }));
    g.on('cityFounded', (city) => { this.toast({ title: '城市建立', body: `${city.name}已建立。願它屹立千古。`, kind: 'good', icon: 'i-city' }); });
    g.on('cityCaptured', ({ city, conqueror }) => this.toast({ title: '城市陷落', body: `${city.name}如今高懸${conqueror.name}的旗幟。`, kind: 'war', icon: 'i-attack' }));
    g.on('wonderBuilt', ({ city, id }) => this.toast({ title: '奇觀落成', body: `${WONDERS[id].name}在${city.name}拔地而起。`, kind: 'good', icon: 'i-wonder' }));
    g.on('combatFlash', () => this.flash());
    g.on('objectiveDone', (o) => this.toast({ title: '傳承邁進', body: o.text, kind: 'good', icon: 'i-wonder' }));
    g.on('gameOver', (res) => this.gameOver(res));
  }

  setAudio(audio) { this.audio = audio; }

  bindStatic() {
    this.el.endTurn.addEventListener('click', () => this.actions?.command('endTurn'));
    $('#open-tech').addEventListener('click', () => this.techTree());
    this.el.councilBtn.addEventListener('click', () => this.councilModal());
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
    this.el.age.textContent = ERA_NAMES[g.eraIndex];
    this.el.crest.innerHTML = crestSVG(player);
    this.el.eraChip.textContent = ERA_CHIPS[g.eraIndex];
    this.el.turn.textContent = g.turn;
    this.renderResources();
    this.renderResearch();
    this.renderObjectives();
    this.renderLeaders();
    this.renderWorldStatus();
    this.renderSelection();
    this.renderCommands();
    this.drawMinimap();
    this.updateHint();
  }

  renderWorldStatus() {
    const g = this.game;
    if (this.el.weatherStatus) {
      this.el.weatherStatus.textContent = `風：${g.weather?.name ?? '微風'}${g.weather?.stormy ? ' • 風暴' : ''}`;
      this.el.weatherStatus.className = g.weather?.stormy ? 'cold' : '';
    }
    if (this.el.climateStatus) {
      const c = g.climate ?? { emissions: 0, temperature: 0 };
      this.el.climateStatus.textContent = `排放 ${Math.round(c.emissions)} • +${c.temperature}°C`;
      this.el.climateStatus.className = c.emissions > 80 ? 'hot' : c.emissions > 40 ? 'cold' : '';
    }
    if (this.el.crisisStatus) {
      this.el.crisisStatus.textContent = g.activeCrisis ? `危機：${g.activeCrisis.def.name}` : '天下太平';
      this.el.crisisStatus.className = g.activeCrisis ? 'hot' : '';
    }
  }

  renderResources() {
    const g = this.game;
    const y = g.civYields(g.playerId);
    const stock = g.stocks[g.playerId];
    const items = [
      { kind: 'science', value: y.science, delta: true, icon: 'i-science', title: '每回合科學' },
      { kind: 'culture', value: y.culture, delta: true, icon: 'i-culture', title: '每回合文化' },
      { kind: 'gold', value: stock.gold, delta: y.gold, icon: 'i-gold', title: '國庫／每回合金幣' },
      { kind: 'faith', value: stock.faith, delta: y.faith, icon: 'i-faith', title: '信仰／每回合' },
      { kind: 'influence', value: stock.influence, delta: y.influence, icon: 'i-influence', title: '影響力／每回合' },
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
      const capped = g.maxEra < TECH_ERA_ORDER.length - 1;
      this.el.currentTech.textContent = capped ? '此劇本科技已臻上限' : '所有科技已發現';
      this.el.techProgress.style.width = capped ? '0%' : '100%';
      this.el.techTurns.textContent = '—';
      this.el.techBlurb.textContent = capped ? '切換至完整劇本，才能繼續走向未來。' : '你的學者已掌握已知世界。';
      return;
    }
    const progress = g.techProgress[civId] || 0;
    const pct = clamp((progress / tech.cost) * 100, 0, 100);
    this.el.currentTech.textContent = tech.name;
    this.el.techProgress.style.width = `${pct}%`;
    this.el.techTurns.textContent = `${g.researchTurns(civId)} 回合`;
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
    const roster = g.civDefs?.length ? g.civDefs : CIVS;
    this.el.leaders.innerHTML = roster.filter((c) => c.id !== g.playerId).map((civ) => {
      const relation = g.leaderRelations(civ);
      const met = g.met.has(civ.id);
      return `<div class="leader-row" data-civ="${civ.id}" style="--c:${civ.colorHex}">
        <div class="av">${leaderSVG(civ)}</div>
        <div class="who"><b>${met ? esc(civ.name) : '未知勢力'}</b><span>${met ? esc(civ.leader) : '尚未接觸'}</span></div>
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
    const pips = Array.from({ length: Math.max(1, def.moves) }, (_, i) => `<span class="pip ${i < unit.moves ? 'on' : ''}"></span>`).join('');
    const supply = g.supplyInfo(unit);
    const gen = g.generalForUnit(unit);
    const supplied = def.domain === 'air' || supply.ok;
    this.el.selection.innerHTML = `
      <div class="sel-head">
        <div class="sel-portrait" style="--c:${unit.civ.colorHex}">${icon(def.icon)}</div>
        <div class="sel-titles">
          <div class="sel-kind">單位</div>
          <div class="sel-name">${esc(def.name)}</div>
          <div class="sel-sub">${esc(unit.civ.name)} • 等級 ${unit.level + 1}${unit.fortified ? ' • 固守中' : ''}</div>
        </div>
        <button class="sel-close" data-close="1">×</button>
      </div>
      <div class="sel-body">
        <div class="stat-row">
          <div class="stat"><div class="k">戰鬥力</div><div class="v">${Math.round(g.attackStrength(unit))}</div></div>
          <div class="stat"><div class="k">生命</div><div class="v">${Math.round(unit.hp)}</div></div>
          <div class="stat"><div class="k">移動</div><div class="v">${unit.moves}</div></div>
        </div>
        <div class="hpbar ${hpPct < 40 ? 'low' : ''}"><i style="width:${hpPct}%"></i></div>
        <div class="pips">${pips}</div>
        <div class="yields">${yieldChips(y, { production: false })}</div>
        <div class="diplo-line">位置：${terrainName(tile)}${tile.feature ? ` — ${FEATURES[tile.feature].label}` : ''}${tile.resource ? ` • ${RESOURCES[tile.resource].name}` : ''}</div>
        <div class="diplo-line">補給：<b style="color:${supplied ? '#8fdc94' : '#ef8a80'}">${supplied ? '暢通' : '中斷（每回合 -7 生命）'}</b>${def.domain === 'air' ? ' • 空中補給' : ` • 來源距離 ${supply.distance}/${supply.range}`}</div>
        <div class="diplo-line">軍團：${gen ? `<b>${esc(gen.name)}</b> • 忠誠 ${gen.loyalty} • ${{ strPct: '戰力', sciencePct: '科學', move: '移動', supply: '補給' }[Object.keys(gen.bonuses)[0]] ?? '統御'}加成` : '無指揮官 — 可在議會任命'}</div>
        ${tile.effect ? `<div class="diplo-line" style="color:#ffbb87">地貌效應：${tile.effect === 'fire' ? '火災' : tile.effect === 'flood' ? '洪水' : tile.effect === 'storm' ? '風暴' : tile.effect === 'rubble' ? '瓦礫阻斷' : tile.effect === 'scorched' ? '焦土' : tile.effect}</div>` : ''}
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
          <div class="sel-kind">${city.isCapital ? '首都' : '城市'} • ${city.civ.name}</div>
          <div class="sel-name">${esc(city.name)}</div>
          <div class="sel-sub">人口 ${city.population} • ${city.buildings.length} 棟建築${city.wonders.length ? ` • ${city.wonders.length} 座奇觀` : ''}</div>
        </div>
        <button class="sel-close" data-close="1">×</button>
      </div>
      <div class="sel-body">
        <div class="stat-row">
          <div class="stat"><div class="k">防禦</div><div class="v">${Math.round(city.defense)}</div></div>
          <div class="stat"><div class="k">城市生命</div><div class="v">${Math.round(city.hp)}</div></div>
          <div class="stat"><div class="k">領土</div><div class="v">${this.world.tileList.filter((t) => t.owner === city.civId).length}</div></div>
        </div>
        <div class="hpbar ${city.hp < city.maxHp * 0.4 ? 'low' : ''}"><i style="width:${(city.hp / city.maxHp) * 100}%"></i></div>
        <div class="city-prod">
          <div class="prod-card" data-open-city="1">
            ${icon(city.producing?.icon ?? 'i-production')}
            <div><div class="t">${city.producing ? esc(city.producing.name) : '選擇生產'}</div>
            <div class="s">${city.producing ? `完成 ${Math.round(prodPct)}%` : '生產閒置'}</div></div>
            <span class="turns">${city.producing ? g.estimateTurns(city, city.producing.cost) + ' 回合' : '—'}</span>
          </div>
        </div>
        <div class="yields">${yieldChips(y)}</div>
        <div class="diplo-line">成長 ${Math.round(growthPct)}% • 每回合生產 ${fmt(y.production + city.population)}</div>
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
      if (def.found) cmds.push({ id: 'found', icon: 'i-settle', label: '建城', key: 'F' });
      if (def.build) cmds.push({ id: 'improve', icon: 'i-production', label: '建造', key: 'B' });
      if (def.build) cmds.push({ id: 'depot', icon: 'i-influence', label: '補給站', key: 'G' });
      if (!def.civilian) cmds.push({ id: 'scheme', icon: 'i-attack', label: '計略', key: 'Q' });
      if (!def.civilian) cmds.push({ id: 'fortify', icon: 'i-fortify', label: '固守', key: 'V' });
      cmds.push({ id: 'sleep', icon: 'i-sleep', label: '休眠', key: 'Z' });
      cmds.push({ id: 'skip', icon: 'i-skip', label: '跳過', key: 'S' });
      cmds.push({ id: 'next', icon: 'i-move', label: '下一個', key: 'N' });
    } else if (sel?.type === 'city') {
      cmds.push({ id: 'cityPanel', icon: 'i-city', label: '管理', key: 'C' });
      cmds.push({ id: 'next', icon: 'i-move', label: '下一個', key: 'N' });
      cmds.push({ id: 'tech', icon: 'i-research', label: '科技', key: 'T' });
    } else {
      cmds.push({ id: 'next', icon: 'i-move', label: '下一單位', key: 'N' });
      cmds.push({ id: 'tech', icon: 'i-research', label: '科技樹', key: 'T' });
      cmds.push({ id: 'help', icon: 'i-wonder', label: '說明', key: 'H' });
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
    if (g.busy) { hint.textContent = '對手正在行動…'; hint.classList.remove('hidden'); return; }
    let text = '';
    if (sel?.type === 'unit') {
      const def = UNIT_TYPES[sel.ref.type];
      if (def.found) text = '點擊高亮地格移動，然後按「建城」建立城市。';
      else if (def.build) text = '移動到地格並按「建造」，興建農場或礦場。';
      else if (def.civilian) text = '使用指令列執行行動。';
      else text = '點擊藍色地格移動，或點擊紅色地格攻擊。';
    } else if (sel?.type === 'city') {
      text = '開啟「管理」安排生產。城市會自行成長與擴張。';
    } else {
      text = '拖曳環繞、右鍵拖曳平移、滾輪縮放。選擇單位或城市開始。';
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
    if (!tile) { this.el.minimapCoords.textContent = '六角格 —'; return; }
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
      <div class="tt-sub">${tile.q}, ${tile.r}${owner ? ` • ${owner.name}領土` : ''}</div>
      ${tile.feature ? `<span class="tt-feature">${FEATURES[tile.feature].label}</span>` : ''}
      ${tile.resource ? `<span class="tt-feature" style="color:${RESOURCES[tile.resource].color};border-color:${RESOURCES[tile.resource].color}55">${RESOURCES[tile.resource].name}</span>` : ''}
      <div class="tt-yields">${yieldChips(y2, { production: true })}</div>
      ${tile.improvement ? `<div class="tt-note">已改良：${IMPROVEMENT_NAMES[tile.improvement] ?? tile.improvement}</div>` : ''}
      ${tile.city ? `<div class="tt-note">${tile.city.name} — 人口 ${tile.city.population}</div>` : ''}
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
    el.innerHTML = `<div class="tb"><div class="tb-era">新的篇章</div><div class="tb-main">${era.name}</div><div class="tb-sub">第 ${this.game.turn} 回合 — 世界流轉，你的傳奇漸長</div></div>`;
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
    const available = new Set(g.availableTechs(civId).map((t) => t.id));
    const doctrine = g.doctrines[civId];
    const eras = TECH_ERA_ORDER;
    const visibleTechs = TECHS.filter((t) => !t.faction || t.faction === civId);
    const body = eras.map((era) => {
      const techs = visibleTechs.filter((t) => t.era === era);
      const core = techs.filter((t) => !t.branch);
      const branches = techs.filter((t) => t.branch);
      const renderNode = (t) => {
        const done = acquired.has(t.id);
        const isCurrent = t.id === current;
        const avail = available.has(t.id);
        const lockedBranch = t.branch && doctrine && doctrine !== t.branch;
        const blackLocked = t.requiresBlack && !g.blackUnlocks[civId]?.has(t.requiresBlack);
        const eraLocked = TECH_ERA_ORDER.indexOf(t.era) > g.maxEra;
        const cls = done ? 'done' : isCurrent ? 'current available' : avail ? 'available' : 'locked';
        let foot = done ? '已發現' : isCurrent ? `研究中 • ${g.researchTurns(civId)} 回合` : '需要 ' + t.prereq.map((p) => TECHS.find((x) => x.id === p)?.name ?? p).join('、');
        if (avail) foot = t.branch ? `選擇路線 • ${DOCTRINES[t.branch].name}` : '點擊研究';
        if (lockedBranch) foot = `已鎖定 • ${DOCTRINES[doctrine].name}`;
        if (blackLocked) foot = '需要遠古黑科技';
        if (eraLocked) foot = '此劇本時代上限之外';
        return `<div class="tech-node ${cls}${t.branch ? ' branch' : ''}" data-tech="${t.id}">
          <div class="tn-head">${icon(t.icon)}<span class="tn-name">${esc(t.name)}</span>${t.branch ? `<span class="tn-branch" style="color:${DOCTRINES[t.branch].color}">${DOCTRINES[t.branch].name.slice(0, 2)}</span>` : ''}</div>
          <div class="tn-cost">${g.techCost(t)} 科學 • ${ERA_LABELS[era]}</div>
          <div class="tn-desc">${esc(t.bonus)}</div>
          <div class="tn-foot">${foot}</div>
        </div>`;
      };
      const branchBlock = branches.length ? `<div class="tech-branch-label">專屬路線（僅能擇一）</div><div class="tech-grid">${branches.map(renderNode).join('')}</div>` : '';
      return `<div class="tech-era" data-tech-era="${era}"><h3>${ERA_LABELS[era]}</h3><div class="tech-grid">${core.map(renderNode).join('')}</div>${branchBlock}</div>`;
    }).join('');
    this.openModal(`
      <div class="modal-head">${icon('i-research')}<div><h2>科技</h2><div class="sub">八個時代、專屬分支與黑科技 — 已發現 ${acquired.size} / ${visibleTechs.length} 項${doctrine ? ` • 路線：${DOCTRINES[doctrine].name}` : ''}</div></div><button class="close">×</button></div>
      <div class="modal-body"><div class="tech-era-nav">${eras.map((era) => `<button data-tech-jump="${era}">${ERA_LABELS[era]}</button>`).join('')}</div>${body}</div>`);
    $$('[data-tech-jump]', this.el.modals).forEach((button) => button.addEventListener('click', () => {
      this.el.modals.querySelector(`[data-tech-era="${button.dataset.techJump}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    $$('.tech-node.available', this.el.modals).forEach((node) => {
      node.addEventListener('click', () => {
        const id = node.dataset.tech;
        const tech = TECHS.find((t) => t.id === id);
        if (tech?.branch && !g.doctrines[civId]) {
          if (!confirm(`選擇「${DOCTRINES[tech.branch].name}」後，其他兩條未來路線將永久鎖定。確定嗎？`)) return;
        }
        if (g.setResearch(civId, id)) {
          this.closeModal();
          this.renderAll();
          this.toast({ title: '開始研究', body: `學者們投入${tech.name}的研究。`, kind: 'good', icon: 'i-research' });
        }
      });
    });
  }

  councilModal(tab = 'schemes') {
    const g = this.game;
    const player = this.world.civs.get(g.playerId);
    const tabs = [
      ['schemes', '天時'], ['army', '軍團'], ['generals', '名將'],
      ['future', '未來'], ['crisis', '危機'], ['scenario', '劇本'],
    ];
    const body = this.councilBody(tab, player);
    this.openModal(`
      <div class="modal-head">${icon('i-wonder')}<div><h2>帝國議會</h2><div class="sub">${esc(player.name)} • ${ERA_LABELS[TECH_ERA_ORDER[g.eraIndex]] ?? '上古時代'} • 第 ${g.turn} 回合</div></div><button class="close">×</button></div>
      <div class="council-tabs">${tabs.map(([id, label]) => `<button class="council-tab ${id === tab ? 'active' : ''}" data-council-tab="${id}">${label}</button>`).join('')}</div>
      <div class="modal-body council-body">${body}</div>`, 'council-modal');
    $$('[data-council-tab]', this.el.modals).forEach((b) => b.addEventListener('click', () => this.councilModal(b.dataset.councilTab)));
    $$('[data-scheme]', this.el.modals).forEach((b) => b.addEventListener('click', () => {
      const type = b.dataset.scheme;
      const targets = this.actions?.armScheme(type) ?? [];
      if (targets.length) {
        this.closeModal();
        this.toast({ title: `計略：${SCHEMES[type].name}`, body: `請在地圖上選擇目標（${targets.length} 個可行地格）。`, kind: 'info', icon: SCHEME_ICON[type] ?? 'i-attack' });
      } else this.toast({ title: '無法施展', body: '需要選取可行單位、足夠移動力與相應科技。', kind: 'warn', icon: 'i-defense' });
    }));
    $$('[data-recruit]', this.el.modals).forEach((b) => b.addEventListener('click', () => {
      if (g.recruitGeneral(g.playerId, b.dataset.recruit)) { this.councilModal('generals'); }
      else this.toast({ title: '無法招募', body: '國庫金幣不足。', kind: 'warn', icon: 'i-gold' });
    }));
    $$('[data-assign-gen]', this.el.modals).forEach((b) => b.addEventListener('click', () => {
      const unit = g.schemeActor();
      if (!unit) { this.toast({ title: '未選取單位', body: '先在地圖上選取一支我軍。', kind: 'warn', icon: 'i-strength' }); return; }
      if (g.assignGeneral(g.playerId, b.dataset.assignGen, unit)) this.councilModal('generals');
    }));
    $$('[data-detach-unit]', this.el.modals).forEach((b) => b.addEventListener('click', () => {
      const unit = this.world.units.find((u) => u.id === b.dataset.detachUnit);
      if (unit) { g.detachGeneral(unit); this.councilModal('army'); }
    }));
    $$('[data-assign-select]', this.el.modals).forEach((sel) => sel.addEventListener('change', () => {
      const unit = this.world.units.find((u) => u.id === sel.dataset.assignSelect);
      if (!unit) return;
      if (sel.value === 'detach') { g.detachGeneral(unit); this.councilModal('army'); return; }
      if (g.assignGeneral(g.playerId, sel.value, unit)) this.councilModal('army');
    }));
    $$('[data-doctrine]', this.el.modals).forEach((b) => b.addEventListener('click', () => {
      if (g.chooseDoctrine(g.playerId, b.dataset.doctrine)) this.councilModal('future');
    }));
    $$('[data-crisis-choice]', this.el.modals).forEach((b) => b.addEventListener('click', () => {
      if (g.resolveCrisis(b.dataset.crisisChoice)) this.councilModal('crisis');
      else this.toast({ title: '資源不足', body: '無法支付此應對方案。', kind: 'warn', icon: 'i-gold' });
    }));
    $$('[data-scenario]', this.el.modals).forEach((b) => b.addEventListener('click', () => {
      this.actions?.setScenario?.(b.dataset.scenario, b.dataset.mutation ?? '1');
    }));
    $$('[data-audio]', this.el.modals).forEach((b) => b.addEventListener('click', () => {
      this.actions?.toggleAudio?.();
      this.councilModal('scenario');
    }));
  }

  councilBody(tab, player) {
    const g = this.game;
    if (tab === 'army') return this.councilArmy(player);
    if (tab === 'generals') return this.councilGenerals(player);
    if (tab === 'future') return this.councilFuture(player);
    if (tab === 'crisis') return this.councilCrisis(player);
    if (tab === 'scenario') return this.councilScenario(player);
    return this.councilSchemes(player);
  }

  councilSchemes(player) {
    const g = this.game;
    const actor = g.schemeActor();
    const fires = this.world.tileList.filter((t) => t.effect === 'fire').length;
    const storms = this.world.tileList.filter((t) => t.effect === 'storm').length;
    const anomaly = this.world.tileList.filter((t) => t.anomaly).length;
    const schemeCards = Object.values(SCHEMES).map((scheme) => {
      const techOk = !scheme.tech || g.hasTech(g.playerId, scheme.tech);
      const chargeOk = scheme.id !== 'orbital' || (g.orbitals[g.playerId] > 0);
      const targets = techOk && chargeOk && actor ? g.schemeTargets(scheme.id, actor) : [];
      const can = targets.length > 0;
      return `<div class="council-card">
        <h3>${icon(SCHEME_ICON[scheme.id] ?? 'i-attack')} ${esc(scheme.name)}</h3>
        <p>${esc(scheme.desc)}</p>
        <div class="meta"><span>射程 <b>${scheme.range}</b></span>${scheme.tech ? `<span>科技 <b>${esc(TECHS.find((t) => t.id === scheme.tech)?.name ?? scheme.tech)}</b></span>` : '<span>無需科技</span>'}<span>可行 <b>${targets.length}</b></span>${scheme.id === 'orbital' ? `<span>軌道 <b>${g.orbitals[g.playerId]}</b></span>` : ''}</div>
        <div class="council-actions"><button data-scheme="${scheme.id}" ${can ? '' : 'disabled'}>${techOk ? '選定目標' : '尚未解鎖'}</button></div>
      </div>`;
    }).join('');
    return `
      <div class="council-stat-grid">
        <div class="council-stat"><div class="k">風向</div><div class="v">${esc(g.weather.name)} <small>${g.weather.stormy ? '風暴' : '穩定'}</small></div></div>
        <div class="council-stat"><div class="k">全球排放</div><div class="v">${Math.round(g.climate.emissions)} <small>+${g.climate.temperature}°C</small></div></div>
        <div class="council-stat"><div class="k">火場／風暴</div><div class="v">${fires} <small>／${storms}</small></div></div>
        <div class="council-stat"><div class="k">異常生態區</div><div class="v">${anomaly}</div></div>
      </div>
      <div class="climate-bar"><i style="width:${Math.min(100, (g.climate.emissions / g.climate.nextThreshold) * 100)}%"></i></div>
      <div class="diplo-line" style="margin-bottom:12px">升溫門檻：${Math.round(g.climate.emissions)} / ${Math.round(g.climate.nextThreshold)} 排放 • 下一次海岸淹沒將吞沒 ${2 + g.climate.seaLevel} 個地格。</div>
      <div class="diplo-line" style="margin-bottom:12px">${actor ? `目前施術者：<b>${esc(UNIT_TYPES[actor.type].name)}</b> • 移動力 ${actor.moves}` : '先在地圖上選取一支我方單位，才能施展計略。'}<br/>火勢會順風蔓延；落石與洪水會破壞改良與道路；軌道打擊消耗軌道資產；地球工程永久改變地貌並降低排放。</div>
      <div class="council-grid">${schemeCards}</div>`;
  }

  councilArmy(player) {
    const g = this.game;
    const units = player.units.filter((u) => !UNIT_TYPES[u.type].civilian && !u.guardian);
    const owned = g.ownedGenerals(player.id);
    const rows = units.map((u) => {
      const supply = g.supplyInfo(u);
      const gen = g.generalForUnit(u);
      const opts = [`<option value="">— 指派名將 —</option>`, ...owned.map((x) => `<option value="${x.id}" ${gen?.id === x.id ? 'selected' : ''}>${esc(x.name)}</option>`)];
      if (gen) opts.push('<option value="detach">解除指揮</option>');
      return `<div class="unit-row">
        <div><div class="nm">${icon(UNIT_TYPES[u.type].icon)} ${esc(UNIT_TYPES[u.type].name)}</div><div class="sub">${u.hp}/${u.maxHp} 生命 • 等級 ${u.level + 1}${gen ? ` • ${esc(gen.name)}` : ''}</div></div>
        <span class="tag ${supply.ok ? 'ok' : 'bad'}">${supply.ok ? '補給暢通' : '補給中斷'}</span>
        <span class="tag">${supply.ok ? `${supply.distance}/${supply.range}` : `-7 HP/回合`}</span>
        <select data-assign-select="${u.id}" style="background:rgba(0,0,0,.3);color:var(--cream);border:1px solid rgba(255,255,255,.14);border-radius:6px;font-size:10px;padding:4px">${opts.join('')}</select>
      </div>`;
    }).join('') || '<p class="diplo-line">尚無軍事單位。</p>';
    const auraCount = units.filter((u) => g.generalForUnit(u)).length;
    return `
      <div class="council-stat-grid">
        <div class="council-stat"><div class="k">軍團</div><div class="v">${units.length}</div></div>
        <div class="council-stat"><div class="k">受指揮</div><div class="v">${auraCount}</div></div>
        <div class="council-stat"><div class="k">補給中斷</div><div class="v">${units.filter((u) => !g.supplyInfo(u).ok).length}</div></div>
        <div class="council-stat"><div class="k">名將</div><div class="v">${owned.length}</div></div>
      </div>
      <p class="diplo-line" style="margin-bottom:10px">名將提供戰力、射程、移動與補給加成；同一名將 2 格內的友軍獲得軍團光環 +8% 戰力。補給由城市與補給站延伸，中斷的單位每回合損失生命與戰力。</p>
      <div class="council-card">${rows}</div>`;
  }

  councilGenerals(player) {
    const g = this.game;
    const owned = g.ownedGenerals(player.id);
    const selected = g.schemeActor();
    const candidates = g.availableGenerals(player.id);
    const ownedRows = owned.map((gen) => {
      const unit = this.world.units.find((u) => u.generalId === gen.id);
      return `<div class="gen-row">
        <div class="general-portrait">${esc(gen.name.slice(0, 1))}</div>
        <div style="flex:1">
          <div><b style="color:var(--cream)">${esc(gen.name)}</b> <span style="color:var(--muted-2);font-size:11px">${esc(gen.title)} • ${esc(gen.role)}</span></div>
          <div class="quote">“${esc(gen.quote)}”</div>
          <div class="meta" style="font-size:10.5px;color:var(--muted-2);margin-top:4px">忠誠 <b style="color:${gen.loyalty < 30 ? '#ef8a80' : '#8fdc94'}">${gen.loyalty}</b> • 年齡 ${gen.age}/${gen.lifespan} • ${unit ? `率領 ${esc(UNIT_TYPES[unit.type].name)}` : '待命'} • 傳承 ${gen.legacy}</div>
          <div class="council-actions">
            ${unit ? `<button class="alt" data-detach-unit="${unit.id}">解除指揮</button>` : `<button data-assign-gen="${gen.id}" ${selected ? '' : 'disabled'}>${selected ? `指派給${esc(UNIT_TYPES[selected.type].name)}` : '先選取單位'}</button>`}
          </div>
        </div>
      </div>`;
    }).join('') || '<p class="diplo-line">尚未招募名將。名將由金幣招募，死後留下傳承。</p>';
    const recruitRows = candidates.slice(0, 8).map((gen) => `<div class="council-card">
      <h3>${esc(gen.name)} <span style="color:var(--muted-2);font-size:10px">${esc(gen.title)}</span></h3>
      <p>${esc(gen.desc)}</p>
      <div class="meta"><span>金幣 <b>${gen.cost}</b></span><span>忠誠 <b>${gen.loyalty}</b></span><span>壽命 <b>${gen.lifespan}</b></span></div>
      <div class="council-actions"><button data-recruit="${gen.id}">招募</button></div>
    </div>`).join('') || '<p class="diplo-line">所有名將皆已投效或逝去。</p>';
    return `
      <h3 style="font-family:var(--display);color:var(--gold);letter-spacing:.2em;font-size:12px">麾下名將</h3>
      <div class="council-card" style="margin-bottom:16px">${ownedRows}</div>
      <h3 style="font-family:var(--display);color:var(--gold);letter-spacing:.2em;font-size:12px">可招募</h3>
      <div class="council-grid">${recruitRows}</div>`;
  }

  councilFuture(player) {
    const g = this.game;
    const doctrine = g.doctrines[player.id];
    const stock = g.strategic[player.id] ?? {};
    const doctrineCards = Object.entries(DOCTRINES).map(([id, d]) => {
      const chosen = doctrine === id;
      const locked = doctrine && !chosen;
      return `<div class="council-card doctrine-card ${chosen ? 'chosen' : ''} ${locked ? 'locked' : ''}" style="border-color:${d.color}55">
        <h3 style="color:${d.color}">${esc(d.name)}</h3>
        <p>${esc(d.desc)}</p>
        <div class="meta"><span>${esc(d.blurb)}</span></div>
        <div class="council-actions">${chosen ? '<button disabled>已選擇</button>' : `<button data-doctrine="${id}" ${locked ? 'disabled' : ''}>${locked ? '已鎖定' : '確立路線'}</button>`}</div>
      </div>`;
    }).join('');
    const stocks = Object.entries({ ...STRATEGIC.raw, ...STRATEGIC.refined }).map(([id, def]) =>
      `<div class="stock"><span>${esc(def.name)}</span><b>${Math.floor(stock[id] ?? 0)}</b></div>`).join('');
    const recipes = STRATEGIC.recipes.map((r) => `<div class="meta" style="margin-top:4px">${esc(r.name)}：${Object.entries(r.inputs).map(([k, n]) => `${STRATEGIC.raw[k]?.name ?? STRATEGIC.refined[k]?.name ?? k}×${n}`).join(' + ')} → ${r.output}（${esc(BUILDINGS[r.building]?.name ?? r.building)}）</div>`).join('');
    const black = [...(g.blackUnlocks[player.id] ?? [])].map((x) => x === 'atlantis' ? '亞特蘭提斯' : '外星遺物').join('、') || '尚未取得';
    return `
      <div class="council-stat-grid">
        <div class="council-stat"><div class="k">時代</div><div class="v">${ERA_LABELS[TECH_ERA_ORDER[g.eraIndex]] ?? '—'}</div></div>
        <div class="council-stat"><div class="k">科技</div><div class="v">${g.techStateFor(player.id).size}<small>/${TECHS.length}</small></div></div>
        <div class="council-stat"><div class="k">軌道資產</div><div class="v">${g.orbitals[player.id] ?? 0}</div></div>
        <div class="council-stat"><div class="k">黑科技</div><div class="v" style="font-size:12px">${black}</div></div>
      </div>
      <h3 style="font-family:var(--display);color:var(--gold);letter-spacing:.2em;font-size:12px">三條未來路線</h3>
      <div class="council-grid" style="margin-bottom:16px">${doctrineCards}</div>
      <h3 style="font-family:var(--display);color:var(--gold);letter-spacing:.2em;font-size:12px">戰略資源與全球供應鏈</h3>
      <div class="stock-grid">${stocks}</div>
      <div class="council-card" style="margin-top:10px"><p>${recipes}</p><p class="diplo-line" style="margin-top:6px">深海層由「海底圓頂」開啟；軌道層由太空港、軌道船塢與上帝之杖構成；黑科技需擊敗異常生態區的守護獸。</p></div>`;
  }

  councilCrisis(player) {
    const g = this.game;
    const costLabel = (cost) => Object.entries(cost ?? {}).map(([k, n]) => `${STRATEGIC.raw[k]?.name ?? STRATEGIC.refined[k]?.name ?? (k === 'gold' ? '金幣' : k === 'influence' ? '影響力' : k)}×${n}`).join('、');
    if (g.activeCrisis) {
      const c = g.activeCrisis;
      const choices = c.def.choices.map((ch) => `<div class="council-card">
        <h3>${esc(ch.label)}</h3><p>${esc(ch.desc)}</p>
        <div class="meta"><span>代價 <b>${costLabel(ch.cost)}</b></span></div>
        <div class="council-actions"><button data-crisis-choice="${ch.id}">執行</button></div>
      </div>`).join('');
      return `<div class="crisis-banner"><h3>${esc(c.def.name)}</h3><p>${esc(c.def.desc)}<br/>${esc(c.def.effect)} • 剩餘 ${c.turnsLeft} 回合</p></div><div class="council-grid">${choices}</div>`;
    }
    const history = g.crisisHistory.slice(-4).reverse().map((h) => `<div class="unit-row"><div><div class="nm">${esc(h.name)}</div><div class="sub">第 ${h.turn} 回合 • ${esc(h.choice)}</div></div></div>`).join('') || '<p class="diplo-line">尚未經歷重大危機。</p>';
    return `<div class="council-card"><h3>天下大勢</h3><p>下一次危機預計在第 <b>${g.nextCrisisTurn}</b> 回合前後降臨。時代越進步，危機越致命。</p><div class="meta"><span>目前時代 <b>${ERA_LABELS[TECH_ERA_ORDER[g.eraIndex]]}</b></span><span>已發生 <b>${g.crisisHistory.length}</b></span></div></div>
      <h3 style="font-family:var(--display);color:var(--gold);letter-spacing:.2em;font-size:12px;margin-top:16px">危機編年史</h3>
      <div class="council-card">${history}</div>`;
  }

  councilScenario(player) {
    const g = this.game;
    const cards = Object.values(SCENARIOS).map((s) => {
      const active = g.scenarioId === s.id;
      return `<div class="council-card scenario-card ${active ? 'active' : ''}">
        ${active ? '<span class="tag">進行中</span>' : ''}
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.desc)}</p>
        <div class="meta"><span>起始 <b>${ERA_LABELS[TECH_ERA_ORDER[s.startEra]]}</b></span><span>上限 <b>${ERA_LABELS[TECH_ERA_ORDER[s.maxEra]]}</b></span><span>回合 <b>${s.turnLimit}</b></span><span>異變 <b>${s.mutation}</b></span></div>
        <div class="council-actions"><button data-scenario="${s.id}" data-mutation="${s.mutation}" ${active ? 'disabled' : ''}>${active ? '目前劇本' : '切換並重啟'}</button></div>
      </div>`;
    }).join('');
    const audio = this.actions?.audioEnabled?.() ? '音效：開' : '音效：關';
    return `<div class="council-grid">${cards}</div>
      <div class="council-card" style="margin-top:14px"><h3>體驗設定</h3><p>切換劇本會重新載入世界；三國志限制於近代，時空裂縫從核融合時代開始，名將不老，異變生態區更多。</p>
      <div class="council-actions"><button class="alt" data-audio="1">${audio}</button></div></div>`;
  }

  cityModal(city) {
    const g = this.game;
    const opts = g.productionOptions(city);
    const y = g.civYields(city.civId);
    const growth = 14 + city.population * 9;
    const prod = opts.map((o) => `
      <div class="prod-option ${o.afford === false ? 'disabled' : ''}" data-kind="${o.kind}" data-id="${o.id}">
        ${icon(o.icon)}
        <div><div class="po-t">${esc(o.name)}</div><div class="po-d">${esc(o.blurb)}</div></div>
        <div class="po-cost"><b>${o.turns} 回合</b>${o.cost} 生產${o.afford === false ? '<br/><span style="color:#ef8a80">資源不足</span>' : ''}</div>
      </div>`).join('') || '<p class="diplo-line">暫無可選項目。</p>';
    const built = [...city.buildings.map((b) => BUILDINGS[b]?.name), ...city.wonders.map((w) => WONDERS[w]?.name)]
      .map((n) => `<span class="building-chip">${icon('i-wonder')}${esc(n)}</span>`).join('') || '<span class="diplo-line">尚無建築。</span>';
    this.openModal(`
      <div class="modal-head">${icon('i-city')}<div><h2>${esc(city.name)}</h2><div class="sub">${esc(city.civ.name)} ${city.isCapital ? '• 首都' : '• 城市'} — 人口 ${city.population}</div></div><button class="close">×</button></div>
      <div class="modal-body city-modal" style="display:grid;grid-template-columns:1.1fr 1fr;gap:20px">
        <div class="city-col">
          <h3>生產</h3>
          ${prod}
        </div>
        <div class="city-col">
          <h3>城市總覽</h3>
          <div class="city-stats">
            <div class="city-stat"><div class="k">食物</div><div class="v">${fmt(y.food)}<small>/回合</small></div></div>
            <div class="city-stat"><div class="k">生產</div><div class="v">${fmt(y.production + city.population)}<small>/回合</small></div></div>
            <div class="city-stat"><div class="k">金幣</div><div class="v">${fmt(y.gold)}<small>/回合</small></div></div>
            <div class="city-stat"><div class="k">科學</div><div class="v">${fmt(y.science)}<small>/回合</small></div></div>
            <div class="city-stat"><div class="k">文化</div><div class="v">${fmt(y.culture)}<small>/回合</small></div></div>
            <div class="city-stat"><div class="k">信仰</div><div class="v">${fmt(y.faith)}<small>/回合</small></div></div>
          </div>
          <h3>成長與防禦</h3>
          <div class="hpbar" style="margin-bottom:8px"><i style="width:${clamp((city.food / growth) * 100, 0, 100)}%"></i></div>
          <div class="diplo-line">成長至 ${city.population + 1} 名市民 • 防禦 ${Math.round(city.defense)} • 城市生命 ${Math.round(city.hp)}/${city.maxHp}</div>
          <h3 style="margin-top:16px">建築與奇觀</h3>
          <div>${built}</div>
        </div>
      </div>`);
    $$('.prod-option', this.el.modals).forEach((el) => {
      el.addEventListener('click', () => {
        if (el.classList.contains('disabled')) { this.toast({ title: '戰略資源不足', body: '需要更多精煉資源才能生產此單位。', kind: 'warn', icon: 'i-production' }); return; }
        g.setProduction(city, el.dataset.kind, el.dataset.id);
        this.closeModal();
        this.renderAll();
        this.toast({ title: '已設定生產', body: `${city.name}開始動工。`, kind: 'good', icon: 'i-production' });
      });
    });
  }

  diplomacy(civ) {
    const g = this.game;
    const relation = g.leaderRelations(civ);
    const quote = civ.id === 'wu'
      ? '你的城牆看來堅固。我們會好好試一試。'
      : civ.id === 'shu'
        ? '河流連結我們的子民。貿易對彼此都有好處。'
        : civ.id === 'warlord'
          ? '上天正注視你的作為，君主。證明你值得。'
          : '友誼才是最真實的征服。';
    this.openModal(`
      <div class="modal-head">${icon('i-influence')}<div><h2>${esc(civ.name)}</h2><div class="sub">${esc(civ.leader)} — ${esc(civ.title)}</div></div><button class="close">×</button></div>
      <div class="modal-body">
        <div class="diplo-body">
          <div class="diplo-portrait" style="color:${civ.colorHex}">${leaderSVG(civ, true)}</div>
          <div class="diplo-text">
            <p class="diplo-quote">“${esc(quote)}”</p>
            <div class="diplo-line" style="margin-bottom:12px">狀態：<b style="color:${relation.cls === 'war' ? '#ff9c8f' : '#a9e8dc'}">${relation.label}</b> · 特性：<b>${esc(civ.traitName)}</b><br/>${esc(civ.trait)}</div>
            <div class="diplo-actions">
              <button class="act-btn" data-act="embassy">建立大使館</button>
              <button class="act-btn ghost" data-act="gift">贈送禮物</button>
              <button class="act-btn ghost" data-act="close">離開</button>
            </div>
          </div>
        </div>
      </div>`, 'diplo-modal');
    $$('[data-act]', this.el.modals).forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.act === 'close') return this.closeModal();
      this.closeModal();
      this.toast({ title: b.dataset.act === 'embassy' ? '大使館已建立' : '禮物已送出', body: `${civ.leader}感謝你的善意。`, kind: 'good', icon: 'i-influence' });
    }));
  }

  helpModal() {
    this.openModal(`
      <div class="modal-head">${icon('i-wonder')}<div><h2>治國之道</h2><div class="sub">引領你的文明從上古時代走向傳奇</div></div><button class="close">×</button></div>
      <div class="modal-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px">
          <div>
            <h3 style="font-family:var(--display);color:var(--gold);letter-spacing:.2em;font-size:12px">操作</h3>
            <p class="diplo-line"><b>左鍵拖曳</b> 環繞 • <b>右鍵拖曳</b> 平移 • <b>滾輪</b> 縮放<br/><b>點擊</b> 選擇單位／城市或下令移動<br/><b>空白鍵</b> 結束回合 • <b>T</b> 科技樹 • <b>M</b> 帝國議會 • <b>C</b> 管理城市 • <b>N</b> 下一單位 • <b>Esc</b> 關閉<br/><b>F</b> 建城 • <b>B</b> 建造改良 • <b>G</b> 補給站 • <b>Q</b> 計略 • <b>V</b> 固守 • <b>S</b> 跳過 • <b>Z</b> 休眠</p>
            <h3 style="font-family:var(--display);color:var(--gold);letter-spacing:.2em;font-size:12px;margin-top:16px">目標</h3>
            <p class="diplo-line">發展城市、發現科技、開拓領土並統帥大軍。在第 ${this.game.turnLimit} 回合前締造最高的傳承分數，或征服所有對手首都，贏得征服勝利。火攻、落石、水攻、補給線、名將、氣候與八時代科技樹都會改變戰局。</p>
          </div>
          <div>
            <h3 style="font-family:var(--display);color:var(--gold);letter-spacing:.2em;font-size:12px">開局步驟</h3>
            <ul class="objective-list">
              <li><span class="tick"></span><span>用斥候探索地圖，會見對手。</span></li>
              <li><span class="tick"></span><span>用開拓者在肥沃土地上建立第二座城市。</span></li>
              <li><span class="tick"></span><span>在首都排程訓練戰士，守衛邊疆。</span></li>
              <li><span class="tick"></span><span>用建造者改良地格，或建立補給站延伸軍團補給。</span></li>
              <li><span class="tick"></span><span>在議會選擇未來路線，並用天時計略改變地貌。</span></li>
            </ul>
          </div>
        </div>
      </div>`);
  }

  gameOver({ victory, score }) {
    const won = victory === 'domination' || score > 0;
    const leader = this.world.civs.get(this.game.playerId)?.leader ?? '你的君主';
    this.openModal(`
      <div class="modal-head">${icon('i-wonder')}<div><h2>${victory === 'domination' ? '征服勝利' : '時代落幕'}</h2><div class="sub">傳承分數：${score}</div></div><button class="close">×</button></div>
      <div class="modal-body" style="text-align:center">
        <p class="diplo-quote" style="font-size:20px">${victory === 'domination' ? `所有首都都臣服於你的旗幟。歷史將銘記${esc(leader)}，直到永恆。` : '編年史為你的統治畫下句點。你子民的故事將迴盪於千秋萬世。'}</p>
        <div class="city-stats" style="max-width:520px;margin:14px auto">
          <div class="city-stat"><div class="k">傳承</div><div class="v">${score}</div></div>
          <div class="city-stat"><div class="k">城市</div><div class="v">${this.world.civs.get(this.game.playerId).cities.length}</div></div>
          <div class="city-stat"><div class="k">科技</div><div class="v">${this.game.techStateFor(this.game.playerId).size}</div></div>
        </div>
        <button class="act-btn" id="restart">開啟新時代</button>
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
  return parts.join('') || '<span class="yield" style="opacity:.5">無產出</span>';
}
function terrainName(tile) {
  const names = { ocean: '開闊海洋', coast: '海岸', lake: '湖泊', grassland: '草原', plains: '平原', desert: '沙漠', tundra: '苔原', snow: '雪地', hills: '丘陵', mountain: '山地' };
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
