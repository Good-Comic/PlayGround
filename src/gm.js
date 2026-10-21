import * as THREE from 'three';
import {
  GameMasterConfig, CULTURE_META, exportConfig, importConfig, resetConfig, saveConfig,
  applyTerrainToWorld, ensureAlienOptions, playableFactions, getFaction,
} from './config.js';

const $ = (sel, root = document) => root.querySelector(sel);
function esc(value) { return String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function colorOf(value) { return typeof value === 'number' ? `#${value.toString(16).padStart(6, '0')}` : String(value || '#c9a227'); }
function toHexNumber(value) { return parseInt(String(value).replace('#', ''), 16) || 0xc9a227; }

export class GMStudio {
  constructor({ onApply, getGame, getWorld, notify } = {}) {
    this.root = document.getElementById('gm-root');
    this.onApply = onApply;
    this.getGame = getGame;
    this.getWorld = getWorld;
    this.notify = notify;
    this.tab = 'visual';
    this.factionId = playableFactions()[0]?.id || 'rome';
    this.preview = null;
    this.previewRAF = 0;
    this.build();
  }

  build() {
    this.root.innerHTML = `
      <div class="gm-shell">
        <aside class="gm-side">
          <div class="gm-brand"><span>⌘</span><div><b>GM Studio</b><small>LIVE WORLD CONSOLE</small></div></div>
          <nav class="gm-tabs">
            <button data-gm-tab="visual" class="active"><i>◈</i><b>外觀與資產</b><small>3D 預覽、城市、單位</small></button>
            <button data-gm-tab="stats"><i>♜</i><b>文明與單位</b><small>數值、特性、領袖</small></button>
            <button data-gm-tab="formula"><i>ƒ</i><b>公式與平衡</b><small>戰鬥、經濟、科技</small></button>
            <button data-gm-tab="terrain"><i>⬡</i><b>地形矩陣</b><small>產出、移動、防禦</small></button>
            <button data-gm-tab="god"><i>✦</i><b>上帝模式</b><small>資源、科技、生成</small></button>
          </nav>
          <div class="gm-side-foot"><span>設定即時寫入 <b>window.GameMasterConfig</b></span><span>F12 / G 關閉</span></div>
        </aside>
        <section class="gm-main">
          <header class="gm-head"><div><small id="gm-kicker">VISUAL EDITOR</small><h2 id="gm-title">外觀與資產</h2></div><div class="gm-head-actions"><button class="ghost-btn" id="gm-save">儲存</button><button class="modal-close" id="gm-close">✕</button></div></header>
          <div class="gm-body" id="gm-body"></div>
        </section>
      </div>`;
    this.root.querySelectorAll('[data-gm-tab]').forEach((btn) => btn.onclick = () => this.open(btn.dataset.gmTab));
    $('#gm-close', this.root).onclick = () => this.close();
    $('#gm-save', this.root).onclick = () => { saveConfig(); this.notify?.('GM 設定已儲存', '所有修改會保留在 localStorage。', 'good'); };
    this.root.addEventListener('pointerdown', (e) => { if (e.target === this.root) this.close(); });
  }

  open(tab = this.tab) {
    this.tab = tab;
    this.root.classList.remove('hidden');
    document.body.classList.add('gm-open');
    this.root.querySelectorAll('[data-gm-tab]').forEach((b) => b.classList.toggle('active', b.dataset.gmTab === tab));
    const meta = { visual: ['VISUAL EDITOR', '外觀與資產'], stats: ['FACTION & UNIT LAB', '文明與單位'], formula: ['MATH ENGINE', '公式與平衡'], terrain: ['TERRAIN MATRIX', '地形矩陣'], god: ['GOD MODE', '上帝模式'] }[tab];
    $('#gm-kicker', this.root).textContent = meta[0];
    $('#gm-title', this.root).textContent = meta[1];
    if (tab === 'visual') this.renderVisual();
    else if (tab === 'stats') this.renderStats();
    else if (tab === 'formula') this.renderFormula();
    else if (tab === 'terrain') this.renderTerrain();
    else this.renderGod();
  }

  close() {
    this.root.classList.add('hidden');
    document.body.classList.remove('gm-open');
    cancelAnimationFrame(this.previewRAF);
    this.preview = null;
  }

  apply(kind = 'all') {
    saveConfig();
    this.onApply?.(kind);
  }

  notifyGame(message, kind = 'good') {
    const game = this.getGame?.();
    const ui = window.__civ?.ui;
    const player = game?.world?.civs?.get(game.playerId);
    this.notify?.(message, player ? `${player.name} · 即時生效` : '世界規則已更新。', kind);
    if (ui) ui.renderAll?.();
  }

  renderVisual() {
    this.stopPreview();
    const factions = playableFactions();
    if (!factions.some((f) => f.id === this.factionId)) this.factionId = factions[0]?.id;
    const f = getFaction(this.factionId);
    const v = GameMasterConfig.visuals;
    $('#gm-body', this.root).innerHTML = `
      <div class="gm-split">
        <div class="gm-panel">
          <div class="panel-title"><b>預覽對象</b><span>即時 3D</span></div>
          <label class="field"><span>文明 / 文化風格</span><select id="gm-faction">${factions.map((x) => `<option value="${esc(x.id)}" ${x.id === f.id ? 'selected' : ''}>${esc(x.name)} · ${esc(x.leader)}</option>`).join('')}</select></label>
          <div class="swatch-row"><label>主色<input type="color" id="gm-color-primary" value="${colorOf(f.colors.primary)}"/></label><label>副色<input type="color" id="gm-color-secondary" value="${colorOf(f.colors.secondary)}"/></label><label>光暈<input type="color" id="gm-color-glow" value="${colorOf(f.colors.border || f.colors.glow)}"/></label></div>
          <div class="slider"><span>城市尺度<b id="gm-city-scale-v">${Number(v.cityScale).toFixed(2)}</b></span><input id="gm-city-scale" type="range" min="0.5" max="2" step="0.05" value="${v.cityScale}"/></div>
          <div class="slider"><span>單位尺度<b id="gm-unit-scale-v">${Number(v.unitScale).toFixed(2)}</b></span><input id="gm-unit-scale" type="range" min="0.5" max="2" step="0.05" value="${v.unitScale}"/></div>
          <div class="slider"><span>外星光暈<b id="gm-glow-v">${Number(v.alienGlow).toFixed(2)}</b></span><input id="gm-glow" type="range" min="0" max="3" step="0.1" value="${v.alienGlow}"/></div>
          <div class="slider"><span>動畫速度<b id="gm-motion-v">${Number(v.motionSpeed).toFixed(2)}</b></span><input id="gm-motion" type="range" min="0.1" max="2.5" step="0.1" value="${v.motionSpeed}"/></div>
          <div class="field"><span>陰影品質</span><select id="gm-shadow"><option value="off" ${v.shadowQuality === 'off' ? 'selected' : ''}>關閉</option><option value="low" ${v.shadowQuality === 'low' ? 'selected' : ''}>低</option><option value="high" ${v.shadowQuality === 'high' ? 'selected' : ''}>高</option></select></div>
          <div class="gm-note">編輯文明色彩後，所有城市、單位旗幟與邊界會在下一次套用時重建。外星文明會依文化原型自動生成晶體、蟲巢、機械或星靈建築幾何。</div>
        </div>
        <div class="gm-panel preview-panel"><div class="panel-title"><b>${esc(f.name)} · ${esc(CULTURE_META[f.culture]?.name || '')}</b><span id="gm-preview-label">CITY + UNIT</span></div><div class="preview-stage"><canvas id="gm-preview" width="720" height="440"></canvas><div class="preview-corner">LIVE MATERIAL PREVIEW</div></div><div class="preview-meta"><span><i style="background:${colorOf(f.colors.primary)}"></i>${esc(f.leader)}</span><span>${esc(f.traitName || '')}</span><span>${esc(f.uniqueUnit?.def?.name || '')}</span></div></div>
      </div>`;
    $('#gm-faction', this.root).onchange = (e) => { this.factionId = e.target.value; this.renderVisual(); };
    $('#gm-color-primary', this.root).oninput = (e) => { f.colors.primary = e.target.value; this.updatePreview(); this.apply('visual'); };
    $('#gm-color-secondary', this.root).oninput = (e) => { f.colors.secondary = e.target.value; this.updatePreview(); this.apply('visual'); };
    $('#gm-color-glow', this.root).oninput = (e) => { f.colors.border = e.target.value; f.colors.glow = e.target.value; this.updatePreview(); this.apply('visual'); };
    const bindVisual = (id, key, label) => {
      $(`#${id}`, this.root).oninput = (e) => {
        const val = Number(e.target.value);
        GameMasterConfig.visuals[key] = val;
        $(`#${id}-v`, this.root).textContent = val.toFixed(2);
        this.updatePreview();
        this.apply('visual');
      };
    };
    bindVisual('gm-city-scale', 'cityScale');
    bindVisual('gm-unit-scale', 'unitScale');
    bindVisual('gm-glow', 'alienGlow');
    bindVisual('gm-motion', 'motionSpeed');
    $('#gm-shadow', this.root).onchange = (e) => { GameMasterConfig.visuals.shadowQuality = e.target.value; this.apply('visual'); };
    this.initPreview($('#gm-preview', this.root), f);
  }

  initPreview(canvas, faction) {
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(1);
      renderer.setSize(720, 440, false);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x071018);
      scene.fog = new THREE.Fog(0x071018, 8, 22);
      const camera = new THREE.PerspectiveCamera(34, 720 / 440, 0.1, 60);
      camera.position.set(5.2, 4.4, 6.4);
      camera.lookAt(0, 0.7, 0);
      const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x3c2a1c, 1.2);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xffe3b0, 2.2);
      key.position.set(5, 8, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(512, 512);
      key.shadow.camera.left = -6; key.shadow.camera.right = 6; key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x8fd6ff, 1.1);
      rim.position.set(-5, 3, -5);
      scene.add(rim);
      const stars = new THREE.Group();
      for (let i = 0; i < 100; i++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 4), new THREE.MeshBasicMaterial({ color: 0x9fd6e8, transparent: true, opacity: Math.random() * 0.7 + 0.1 }));
        dot.position.set((Math.random() - 0.5) * 30, Math.random() * 14 - 1, (Math.random() - 0.5) * 30);
        stars.add(dot);
      }
      scene.add(stars);
      const group = new THREE.Group();
      scene.add(group);
      this.preview = { renderer, scene, camera, group, stars, faction, t: 0 };
      this.updatePreview();
      const loop = () => {
        if (!this.preview) return;
        this.preview.t += 0.006 * (GameMasterConfig.visuals.motionSpeed || 1);
        group.rotation.y = Math.sin(this.preview.t * 0.7) * 0.35;
        group.position.y = Math.sin(this.preview.t * 1.8) * 0.04;
        stars.rotation.y += 0.0004;
        renderer.render(scene, camera);
        this.previewRAF = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      canvas.replaceWith(Object.assign(document.createElement('div'), { className: 'preview-fallback', textContent: '此瀏覽器無法建立 3D 預覽。' }));
    }
  }

  stopPreview() {
    cancelAnimationFrame(this.previewRAF);
    this.preview?.renderer?.dispose();
    this.preview = null;
  }

  updatePreview() {
    if (!this.preview) return;
    const f = getFaction(this.factionId);
    const culture = CULTURE_META[f.culture] || CULTURE_META.europe;
    const color = toHexNumber(f.colors.primary);
    const accent = toHexNumber(f.colors.secondary);
    const glow = toHexNumber(f.colors.border || f.colors.glow);
    const g = this.preview.group;
    g.clear();
    const mat = (c, rough = 0.75, metal = 0.05, emissive = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal, emissive: emissive ? c : 0x000000, emissiveIntensity: emissive, flatShading: true });
    const stone = mat(0x8e8878, 0.9);
    const wall = mat(culture.wall, 0.85);
    const roof = mat(culture.roof, 0.7, 0.05, f.category === 'alien' ? 0.15 : 0);
    const cloth = mat(color, 0.55);
    const accentM = mat(accent, 0.6);
    const glowM = mat(glow, 0.28, 0.45, f.category === 'alien' ? 1.8 : 0.6);
    const add = (geo, material, x, y, z, ry = 0) => {
      const m = new THREE.Mesh(geo, material);
      m.position.set(x, y, z); m.rotation.y = ry;
      m.castShadow = true; m.receiveShadow = true;
      g.add(m); return m;
    };
    add(new THREE.CylinderGeometry(2.5, 2.65, 0.32, 6).rotateY(Math.PI / 6), stone, 0, 0.16, 0);
    add(new THREE.CylinderGeometry(2.35, 2.42, 0.08, 6).rotateY(Math.PI / 6), wall, 0, 0.35, 0);
    const scale = GameMasterConfig.visuals.cityScale || 1;
    const alien = f.category === 'alien';
    if (alien) {
      const arch = f.alien?.archetype || 'crystal';
      if (arch === 'swarm') {
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          const h = 0.7 + (i % 3) * 0.5;
          add(new THREE.CapsuleGeometry(0.35, h, 5, 9), i % 2 ? roof : accentM, Math.cos(a) * 1.1, 0.5 + h / 2, Math.sin(a) * 1.1);
        }
        add(new THREE.SphereGeometry(0.8, 12, 8), glowM, 0, 1.1, 0);
      } else if (arch === 'machine') {
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          add(new THREE.BoxGeometry(0.55, 2 + i * 0.22, 0.55), i % 2 ? cloth : wall, Math.cos(a) * 1.25, 0.6 + i * 0.12, Math.sin(a) * 1.25);
        }
        add(new THREE.TorusGeometry(0.9, 0.08, 8, 28).rotateX(Math.PI / 2), glowM, 0, 1.9, 0);
      } else if (arch === 'energy') {
        add(new THREE.OctahedronGeometry(0.95, 0), glowM, 0, 1.7, 0);
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          add(new THREE.ConeGeometry(0.22, 2.1, 6), i % 2 ? accentM : cloth, Math.cos(a) * 1.35, 0.7, Math.sin(a) * 1.35);
        }
      } else {
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const h = 1.1 + (i % 3) * 0.6;
          add(new THREE.ConeGeometry(0.32, h, 5), i % 2 ? glowM : cloth, Math.cos(a) * 1.15, 0.5 + h / 2, Math.sin(a) * 1.15);
        }
        add(new THREE.IcosahedronGeometry(0.65, 0), glowM, 0, 1.4, 0);
      }
    } else {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        const h = (0.5 + (i % 3) * 0.22) * scale;
        add(new THREE.BoxGeometry(0.55, h, 0.5), wall, Math.cos(a) * 1.35, 0.42 + h / 2, Math.sin(a) * 1.35, -a);
        add(new THREE.ConeGeometry(0.48, 0.34, 4).rotateY(Math.PI / 4), i % 2 ? roof : cloth, Math.cos(a) * 1.35, 0.42 + h + 0.17, Math.sin(a) * 1.35);
      }
      add(new THREE.BoxGeometry(0.9, 1.1 * scale, 0.9), stone, 0, 0.85, 0);
      add(new THREE.ConeGeometry(0.75, 0.65, 4).rotateY(Math.PI / 4), roof, 0, 1.72, 0);
      add(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 4), accentM, 0, 2.6, 0);
      add(new THREE.BoxGeometry(0.55, 0.3, 0.01), cloth, 0.28, 2.95, 0);
    }
    const unitScale = GameMasterConfig.visuals.unitScale || 1;
    const ux = 2.15, uz = 1.6;
    add(new THREE.CylinderGeometry(0.42, 0.46, 0.07, 12), accentM, ux, 0.38, uz);
    add(new THREE.CapsuleGeometry(0.18, 0.48 * unitScale, 4, 8), cloth, ux, 0.95, uz).rotation.y = -0.4;
    add(new THREE.SphereGeometry(0.16, 10, 8), mat(0xd9a074, 0.85), ux, 1.4, uz);
    const head = new THREE.ConeGeometry(0.2, 0.26, 8);
    add(head, f.category === 'alien' ? glowM : mat(0xb9c2c9, 0.35, 0.8), ux, 1.58, uz);
    add(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5), accentM, ux + 0.25, 1.28, uz);
    add(new THREE.BoxGeometry(0.5, 0.3, 0.02), cloth, ux + 0.5, 1.76, uz);
    this.preview.label = `${f.name} · ${CULTURE_META[f.culture]?.name || ''}`;
  }

  renderStats() {
    this.stopPreview();
    const factions = playableFactions();
    if (!factions.some((f) => f.id === this.factionId)) this.factionId = factions[0]?.id;
    const f = getFaction(this.factionId);
    const u = f.uniqueUnit?.def || {};
    $('#gm-body', this.root).innerHTML = `
      <div class="gm-split stats-split">
        <div class="gm-panel"><div class="panel-title"><b>文明資料</b><span>LIVE</span></div>
          <label class="field"><span>選擇文明</span><select id="gm-stat-faction">${factions.map((x) => `<option value="${esc(x.id)}" ${x.id === f.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
          <div class="field-grid"><label class="field"><span>名稱</span><input data-stat="name" value="${esc(f.name)}"/></label><label class="field"><span>領袖</span><input data-stat="leader" value="${esc(f.leader)}"/></label><label class="field"><span>稱號</span><input data-stat="title" value="${esc(f.title || '')}"/></label><label class="field"><span>特質名</span><input data-stat="traitName" value="${esc(f.traitName || '')}"/></label></div>
          <label class="field"><span>文明特性</span><textarea data-stat="trait" rows="3">${esc(f.trait || '')}</textarea></label>
          <div class="field-grid"><label class="field"><span>近戰加成</span><input type="number" step="0.01" data-bonus="combat" value="${Number(f.bonus?.combat || 0)}"/></label><label class="field"><span>遠程加成</span><input type="number" step="0.01" data-bonus="ranged" value="${Number(f.bonus?.ranged || 0)}"/></label><label class="field"><span>海軍加成</span><input type="number" step="0.01" data-bonus="navy" value="${Number(f.bonus?.navy || 0)}"/></label><label class="field"><span>補給範圍</span><input type="number" step="1" data-bonus="supply" value="${Number(f.bonus?.supply || 0)}"/></label><label class="field"><span>己方回復</span><input type="number" step="1" data-bonus="healOwn" value="${Number(f.bonus?.healOwn || 0)}"/></label><label class="field"><span>腐化加成</span><input type="number" step="0.01" data-bonus="corruption" value="${Number(f.bonus?.corruption || 0)}"/></label></div>
        </div>
        <div class="gm-panel"><div class="panel-title"><b>${esc(u.name || '專屬單位')}</b><span>UNIT LAB</span></div>
          <div class="field-grid"><label class="field"><span>單位名稱</span><input data-unit="name" value="${esc(u.name || '')}"/></label><label class="field"><span>兵種</span><select data-unit="cls">${['melee', 'ranged', 'cavalry', 'siege', 'navy', 'air', 'scout'].map((c) => `<option ${u.cls === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label><label class="field"><span>近戰戰力</span><input type="number" data-unit="str" value="${Number(u.str || 40)}"/></label><label class="field"><span>遠程戰力</span><input type="number" data-unit="rangedStr" value="${Number(u.rangedStr || 0)}"/></label><label class="field"><span>射程</span><input type="number" data-unit="range" value="${Number(u.range || 1)}"/></label><label class="field"><span>移動</span><input type="number" data-unit="moves" value="${Number(u.moves || 2)}"/></label><label class="field"><span>造價</span><input type="number" data-unit="cost" value="${Number(u.cost || 100)}"/></label><label class="field"><span>視野</span><input type="number" data-unit="sight" value="${Number(u.sight || 3)}"/></label></div>
          <label class="field"><span>單位描述</span><textarea data-unit="blurb" rows="3">${esc(u.blurb || '')}</textarea></label>
          <div class="gm-note">修改會立即反映在目前遊戲的後續戰鬥與 UI；已存在的單位保留其生命值，但戰力與移動上限會重新計算。</div>
        </div>
      </div>`;
    $('#gm-stat-faction', this.root).onchange = (e) => { this.factionId = e.target.value; this.renderStats(); };
    this.root.querySelectorAll('[data-stat]').forEach((input) => input.oninput = () => { f[input.dataset.stat] = input.value; this.apply('stats'); this.notifyGame('文明資料已更新'); });
    this.root.querySelectorAll('[data-bonus]').forEach((input) => input.oninput = () => { f.bonus[input.dataset.bonus] = Number(input.value) || 0; this.apply('stats'); });
    this.root.querySelectorAll('[data-unit]').forEach((input) => input.oninput = () => {
      const key = input.dataset.unit;
      u[key] = input.type === 'number' ? Number(input.value) || 0 : input.value;
      if (f.uniqueUnit) f.uniqueUnit.def = u;
      this.apply('stats');
    });
  }

  renderFormula() {
    this.stopPreview();
    const groups = GameMasterConfig.formulas;
    const labels = { combat: '戰鬥公式', economy: '經濟公式', tech: '科技公式' };
    $('#gm-body', this.root).innerHTML = `<div class="formula-grid">${Object.entries(groups).map(([group, values]) => `<section class="gm-panel"><div class="panel-title"><b>${labels[group] || group}</b><span>${group.toUpperCase()}</span></div>${Object.entries(values).map(([key, val]) => Array.isArray(val) ? `<div class="formula-array"><b>${esc(key)}</b>${val.map((x, i) => `<input type="number" step="1" data-formula="${group}.${key}.${i}" value="${x}"/>`).join('')}</div>` : `<label class="field inline"><span>${esc(key)}</span><input type="number" step="0.01" data-formula="${group}.${key}" value="${val}"/></label>`).join('')}</section>`).join('')}
      <section class="gm-panel formula-note"><div class="panel-title"><b>即時套用</b><span>NO RELOAD</span></div><p>戰鬥傷害、地形係數、科技成本、AI 與玩家產出倍率皆由這些數值驅動。修改後下一次攻擊、下一回合產出與科技介面會立即使用新公式。</p><div class="formula-preview" id="formula-preview"></div></section></div>`;
    const updatePreview = () => {
      const c = GameMasterConfig.formulas.combat;
      const t = GameMasterConfig.formulas.tech;
      $('#formula-preview', this.root).innerHTML = `<span>基礎傷害 <b>${c.baseDamage}</b></span><span>防禦指數 <b>${c.attackExponent}</b></span><span>高地 <b>×${c.highGround}</b></span><span>渡河 <b>×${c.riverPenalty}</b></span><span>科技成長 <b>×${t.growth}</b></span>`;
    };
    updatePreview();
    this.root.querySelectorAll('[data-formula]').forEach((input) => input.oninput = () => {
      const parts = input.dataset.formula.split('.');
      let target = GameMasterConfig.formulas;
      for (let i = 0; i < parts.length - 1; i++) target = target[parts[i]];
      target[parts[parts.length - 1]] = Number(input.value) || 0;
      updatePreview();
      this.apply('formula');
    });
  }

  renderTerrain() {
    this.stopPreview();
    const biomes = GameMasterConfig.terrain;
    const yieldKeys = ['food', 'production', 'gold', 'science', 'culture', 'faith', 'influence'];
    $('#gm-body', this.root).innerHTML = `<div class="gm-panel terrain-panel"><div class="panel-title"><b>地形與地貌矩陣</b><span>${Object.keys(biomes).length} TYPES</span></div><div class="terrain-scroll"><table class="terrain-table"><thead><tr><th>地形</th><th>名稱</th>${yieldKeys.map((k) => `<th>${k}</th>`).join('')}<th>移動</th><th>防禦</th><th>視野</th></tr></thead><tbody>${Object.entries(biomes).map(([id, t]) => `<tr data-terrain="${id}"><td><code>${esc(id)}</code></td><td><input data-terrain-name value="${esc(t.name || id)}"/></td>${yieldKeys.map((k) => `<td><input type="number" step="0.5" data-yield="${k}" value="${Number(t.yields?.[k] || 0)}"/></td>`).join('')}<td><input type="number" step="1" data-terrain-prop="move" value="${Number(t.move || 1)}"/></td><td><input type="number" step="0.05" data-terrain-prop="defense" value="${Number(t.defense || 0)}"/></td><td><input type="number" step="1" data-terrain-prop="sight" value="${Number(t.sight || 0)}"/></td></tr>`).join('')}</tbody></table></div><div class="gm-note">修改會套用到 BIOMES / FEATURES 並重建領土疊圖；城市與單位所在格的移動消耗、防禦與視野立即改變。</div></div>`;
    this.root.querySelectorAll('[data-terrain]').forEach((row) => {
      const t = biomes[row.dataset.terrain];
      row.querySelector('[data-terrain-name]').oninput = (e) => { t.name = e.target.value; this.apply('terrain'); };
      row.querySelectorAll('[data-yield]').forEach((input) => input.oninput = () => {
        t.yields = t.yields || {};
        t.yields[input.dataset.yield] = Number(input.value) || 0;
        this.apply('terrain');
      });
      row.querySelectorAll('[data-terrain-prop]').forEach((input) => input.oninput = () => {
        t[input.dataset.terrainProp] = Number(input.value) || 0;
        this.apply('terrain');
      });
    });
  }

  renderGod() {
    this.stopPreview();
    const game = this.getGame?.();
    const player = game?.world?.civs?.get(game.playerId);
    const stats = player ? `<span>回合 <b>${game.turn}</b></span><span>城市 <b>${player.cities.length}</b></span><span>單位 <b>${player.units.length}</b></span><span>金幣 <b>${Math.round(game.stocks[player.id]?.gold || 0)}</b></span>` : '<span>主選單模式 · 進入遊戲後可操作世界</span>';
    $('#gm-body', this.root).innerHTML = `<div class="god-grid"><section class="gm-panel"><div class="panel-title"><b>世界狀態</b><span>LIVE</span></div><div class="god-stats">${stats}</div><div class="god-actions"><button data-god="gold">＋500 金幣</button><button data-god="heal">治療所有單位</button><button data-god="reveal">揭示所有文明</button><button data-god="tech">完成當前科技</button><button data-god="spawn">生成精銳單位</button><button data-god="alien">生成外星對手</button><button data-god="supply">補滿補給</button><button data-god="turn">推進一回合</button></div><div class="gm-note">上帝模式僅影響目前世界，不會寫入新遊戲預設；需要永久修改請使用其他分頁。</div></section><section class="gm-panel"><div class="panel-title"><b>設定檔 I/O</b><span>JSON</span></div><textarea id="gm-json" spellcheck="false">${esc(exportConfig())}</textarea><div class="god-actions"><button id="gm-import">匯入 JSON</button><button id="gm-export">複製匯出</button><button data-god="reset" class="danger">重置全部</button></div><div class="gm-note">格式包含 factions、formulas、terrain、visuals、options。重置會立即恢復預設並套用到目前世界。</div></section></div>`;
    this.root.querySelectorAll('[data-god]').forEach((btn) => btn.onclick = () => this.god(btn.dataset.god));
    $('#gm-import', this.root).onclick = () => {
      try {
        importConfig($('#gm-json', this.root).value);
        this.apply('all');
        this.notifyGame('設定已匯入');
        this.open(this.tab);
      } catch (e) { this.notify?.('匯入失敗', e.message, 'warn'); }
    };
    $('#gm-export', this.root).onclick = async () => {
      const text = exportConfig();
      $('#gm-json', this.root).value = text;
      try { await navigator.clipboard.writeText(text); this.notify?.('已複製設定', 'GameMasterConfig JSON 已寫入剪貼簿。', 'good'); } catch (e) { this.notify?.('已匯出', '請從文字框複製 JSON。', 'info'); }
    };
  }

  god(action) {
    if (action === 'reset') {
      resetConfig();
      this.apply('all');
      this.open('god');
      this.notify?.('已重置', 'GameMasterConfig 恢復預設。', 'info');
      return;
    }
    const game = this.getGame?.();
    const world = this.getWorld?.() || game?.world;
    const player = world?.civs?.get(game?.playerId);
    if (!game || !player) { this.notify?.('需要進入遊戲', '上帝模式只能在遊戲世界中操作。', 'warn'); return; }
    if (action === 'gold') { game.stocks[player.id].gold += 500; this.notify?.('資源注入', '+500 金幣', 'good'); }
    else if (action === 'heal') { for (const u of player.units) u.hp = u.maxHp; this.notify?.('全軍治療', '所有單位恢復完整生命。', 'good'); }
    else if (action === 'reveal') { for (const civ of world.civs.values()) if (!civ.isWilds) civ.met = true; game.recomputeVision(); this.notify?.('世界揭示', '所有文明已建立接觸。', 'good'); }
    else if (action === 'tech') { const t = game.availableTechs(player.id)[0]; if (t) game.finishTech(player.id, t); this.notify?.('科技完成', t ? t.name : '沒有可研究科技。', 'good'); }
    else if (action === 'spawn') { const cap = player.capital; const tile = cap?.tile || world.tiles.get(`${cap?.q},${cap?.r}`); if (tile) game.spawnUnit(player, 'swordsman', tile.q, tile.r); this.notify?.('精銳抵達', '首都生成一個劍士。', 'good'); }
    else if (action === 'alien') { const list = ensureAlienOptions(1, Math.floor(Math.random() * 90000) + 1000); this.notify?.('外星訊號', `${list[0]?.name || '外星文明'} 已加入 GameMasterConfig，重新開始世界即可選擇。`, 'info'); }
    else if (action === 'supply') { for (const u of player.units) u.supplied = true; this.notify?.('補給完成', '所有單位補給充足。', 'good'); }
    else if (action === 'turn') { game.endTurn(); this.notify?.('時間推進', '新回合開始。', 'good'); }
    this.apply('god');
    game.emit('change');
    window.__civ?.ui?.renderAll?.();
    this.open('god');
  }
}
