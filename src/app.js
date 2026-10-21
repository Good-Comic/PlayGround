import {
  GameMasterConfig, DEFAULT_OPTIONS, DIFFICULTIES, MUSIC_STYLES, CULTURE_META,
  loadConfig, saveConfig, saveSetup, loadSetup, playableFactions, ensureAlienOptions,
  exportConfig, importConfig, resetConfig, hashSeed,
} from './config.js';
import { TECHS, UNIT_TYPES } from './game.js';

const ERAS = ['上古', '古典', '中古', '文藝復興', '工業', '現代', '2050', '2100'];
const CATEGORY_LABEL = { historical: '歷史文明', threeKingdoms: '三國', alien: '外星' };
const $ = (sel, root = document) => root.querySelector(sel);

function esc(value) {
  return String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function hexColor(value) {
  if (typeof value === 'number') return `#${value.toString(16).padStart(6, '0')}`;
  return String(value || '#c9a227');
}
function fmtPct(value) { return `${Math.round((Number(value) || 0) * 100)}%`; }

export function portraitSVG(faction, cls = '') {
  const c = faction.colors || {};
  const crown = faction.portrait?.crown || faction.visual?.crown || 'crown';
  const weapon = faction.portrait?.weapon || faction.visual?.weapon || 'sword';
  const bg = hexColor(c.primary);
  const accent = hexColor(c.secondary);
  const glow = hexColor(c.border || c.glow || '#e3bd74');
  const id = String(faction.id || 'f').replace(/[^a-z0-9_-]/gi, '');
  const head = {
    laurel: '<path d="M36 39c0-13 9-20 24-20s24 7 24 20" fill="none" stroke="#e3bd74" stroke-width="4"/><path d="M36 39l7 7 5-10 7 9 5-11 6 11 5-9 7 10 5-7" fill="none" stroke="#7fae69" stroke-width="4" stroke-linecap="round"/>',
    guan: '<path d="M40 36h40l-4-13h-8l-3 5h-10l-3-5h-8z" fill="#2c2521" stroke="#e3bd74" stroke-width="2"/><path d="M49 22V10h22v12" fill="none" stroke="#e3bd74" stroke-width="3"/>',
    kabuto: '<path d="M35 38c2-15 10-22 25-22s23 7 25 22" fill="#2d3138" stroke="#e3bd74" stroke-width="2"/><path d="M60 16c-8 8-14 10-24 10M60 16c8 8 14 10 24 10" fill="none" stroke="#e3bd74" stroke-width="3"/><path d="M60 17V7" stroke="#e3bd74" stroke-width="3"/>',
    pschent: '<path d="M42 33c0-16 8-24 18-24s18 8 18 24" fill="#f2e6c8" stroke="#c9a227" stroke-width="2"/><path d="M48 20c4-8 9-12 12-12s8 4 12 12" fill="#b33a3a"/>',
    tiara: '<path d="M38 38l4-20 8 8 10-14 10 14 8-8 4 20z" fill="#c9a227" stroke="#f5df9b" stroke-width="2"/>',
    crown: '<path d="M38 36l1-16 9 8 12-13 12 13 9-8 1 16z" fill="#c9a227" stroke="#ffe9b0" stroke-width="2"/>',
    horned: '<path d="M36 35c0-15 10-23 24-23s24 8 24 23" fill="#4b4035"/><path d="M38 26C24 12 21 27 32 34M82 26c14-14 17 1 6 8" fill="none" stroke="#e3bd74" stroke-width="4"/>',
    turban: '<path d="M36 36c0-16 10-24 24-24s24 8 24 24" fill="#e8ddc4"/><path d="M36 33h48M41 25h38M47 18h26" stroke="#c9a227" stroke-width="2"/>',
    feather: '<path d="M38 35c0-15 10-23 22-23s22 8 22 23" fill="#6d5a42"/><path d="M48 22c-8-14 3-18 10-9M63 20c0-12 11-13 13-2M75 25c8-10 15-2 8 7" fill="none" stroke="#e3bd74" stroke-width="3"/>',
    fur: '<path d="M35 37c0-17 11-25 25-25s25 8 25 25" fill="#6d5c3e"/><path d="M36 32l8 4 6-9 10 7 10-7 6 9 8-4" fill="none" stroke="#d0aa62" stroke-width="3"/>',
    pickelhaube: '<path d="M36 37c2-15 10-22 24-22s22 7 24 22" fill="#3a3f45" stroke="#c9a227" stroke-width="2"/><path d="M60 15V5" stroke="#e3bd74" stroke-width="4"/>',
    mukuta: '<path d="M39 36l2-17 8 6 11-13 11 13 8-6 2 17z" fill="#c9a227" stroke="#ffe9b0" stroke-width="2"/>',
    eye: '<ellipse cx="60" cy="35" rx="27" ry="15" fill="#111827" stroke="#8ff5ff" stroke-width="2"/><ellipse cx="60" cy="35" rx="8" ry="12" fill="#8ff5ff"/><circle cx="60" cy="35" r="4" fill="#fff"/>',
  }[crown] || '<path d="M38 36l2-15 8 7 12-12 12 12 8-7 2 15z" fill="#c9a227"/>';
  const gear = {
    swordsman: '<path d="M87 74l18-27M99 44l9-9M84 77l-8 9" stroke="#dbe7ef" stroke-width="4"/>',
    crossbow: '<path d="M86 68l20-7M91 52l7 22" stroke="#d8b45a" stroke-width="3"/>',
    trident: '<path d="M89 83V48M81 48h16M83 40l6 8 6-8" stroke="#d8b45a" stroke-width="3" fill="none"/>',
    halberd: '<path d="M88 84V45M88 45l12-9-2 16z" stroke="#dbe7ef" stroke-width="3" fill="none"/>',
    musket: '<path d="M84 76l24-26M105 48l7 8" stroke="#d8b45a" stroke-width="4"/>',
    bow: '<path d="M92 50c16 10 16 24 0 34M92 50l-3 36" fill="none" stroke="#d8b45a" stroke-width="3"/>',
    axe: '<path d="M89 80V47M81 48c11-9 18-4 18 3l-18 5z" stroke="#dbe7ef" stroke-width="3" fill="none"/>',
    spear: '<path d="M88 85V38M84 45l4-9 4 9" stroke="#dbe7ef" stroke-width="3" fill="none"/>',
    gladius: '<path d="M89 78l17-31M86 80l6 4" stroke="#dbe7ef" stroke-width="4"/>',
    katana: '<path d="M87 82c10-18 18-29 25-37M85 84l5 2" stroke="#eef5f8" stroke-width="4"/>',
    dao: '<path d="M88 82c9-15 17-26 24-34M85 82l6 4" stroke="#dbe7ef" stroke-width="4"/>',
    rifle: '<path d="M83 78l26-25M102 49l7 8" stroke="#d8b45a" stroke-width="4"/>',
    lance: '<path d="M87 86L108 43M102 50l8-9" stroke="#dbe7ef" stroke-width="4"/>',
    scimitar: '<path d="M88 80c11-7 18-18 21-31" fill="none" stroke="#dbe7ef" stroke-width="4"/>',
    gada: '<path d="M89 81V56M82 51h14" stroke="#d8b45a" stroke-width="5"/>',
    macuahuitl: '<path d="M88 80l18-24" stroke="#d8b45a" stroke-width="7"/><path d="M92 75l-3 5M97 68l-3 5M102 61l-3 5" stroke="#dbe7ef" stroke-width="2"/>',
    sling: '<path d="M91 73c3-12 13-18 22-12" fill="none" stroke="#d8b45a" stroke-width="3"/>',
  }[weapon] || '<path d="M90 78l14-24" stroke="#dbe7ef" stroke-width="4"/>';
  return `<svg class="portrait ${cls}" viewBox="0 0 120 120" role="img" aria-label="${esc(faction.name)}">
    <defs><radialGradient id="pg${id}" cx="50%" cy="32%" r="75%"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#071018"/></radialGradient></defs>
    <rect width="120" height="120" fill="url(#pg${id})"/>
    <circle cx="60" cy="55" r="45" fill="none" stroke="${glow}" stroke-opacity=".32" stroke-width="1.5"/>
    <circle cx="60" cy="55" r="34" fill="none" stroke="${accent}" stroke-opacity=".24" stroke-width="8"/>
    <path d="M22 120c3-24 17-36 38-36s35 12 38 36z" fill="${accent}"/>
    <path d="M38 108c2-17 9-27 22-27s20 10 22 27" fill="${bg}" stroke="${glow}" stroke-opacity=".45" stroke-width="2"/>
    <circle cx="60" cy="59" r="21" fill="#c99672" stroke="#3a211d" stroke-width="2"/>
    <path d="M44 62c2 12 8 18 16 18s14-6 16-18" fill="none" stroke="#7a4b36" stroke-width="2"/>
    <circle cx="52" cy="58" r="2" fill="#17110e"/><circle cx="68" cy="58" r="2" fill="#17110e"/>
    <path d="M54 68c4 3 8 3 12 0" fill="none" stroke="#5b3024" stroke-width="2"/>
    ${head}
    ${gear}
    <circle cx="99" cy="24" r="8" fill="${glow}" fill-opacity=".18" stroke="${glow}" stroke-width="1"/>
    <text x="99" y="27" text-anchor="middle" font-size="8" fill="${glow}">${esc((faction.glyph || '★').slice(0, 2))}</text>
  </svg>`;
}

function defaultSetup() {
  return {
    mode: 'standard', mapType: 'earth', seed: String(Math.floor(Math.random() * 900000) + 100000),
    mutation: 1, elevation: 1, temperature: 1, moisture: 1, sea: 1, fertility: 1,
    playerFaction: 'rome', opponents: ['han', 'egypt', 'greece'], opponentCount: 3,
    difficulty: 'normal', startEra: 0, musicStyle: 'auto', language: 'zh', category: 'historical',
  };
}

export function createApp({ mode = 'menu', onApplyOptions, onOpenGM, notify } = {}) {
  loadConfig();
  const saved = loadSetup();
  const draft = { ...defaultSetup(), ...(saved || {}) };
  let state = mode === 'inGame' ? 'IN_GAME' : 'MAIN_MENU';
  let setupStep = 0;
  let encTab = 'civ';

  const menuRoot = $('#menu-root');
  const setupRoot = $('#setup-root');
  const optionsRoot = $('#options-root');
  const encRoot = $('#encyclopedia-root');

  const app = {
    get state() { return state; },
    openOptions, openEncyclopedia, openSetup, startGame,
    applyOptions: () => applyOptions(false),
    setMenuMode(on) { state = on ? 'MAIN_MENU' : 'IN_GAME'; syncState(); },
    draft,
  };

  function say(title, body, kind = 'info') {
    if (notify) notify(title, body, kind);
    else if (window.__civ?.ui) window.__civ.ui.toast({ title, body, kind, icon: 'i-wonder' });
  }

  function syncState() {
    const inGame = state === 'IN_GAME';
    document.body.classList.toggle('menu-mode', !inGame);
    menuRoot.classList.toggle('hidden', state !== 'MAIN_MENU');
    setupRoot.classList.toggle('hidden', state !== 'SETUP_WIZARD');
    if (state === 'IN_GAME') {
      optionsRoot.classList.add('hidden');
      encRoot.classList.add('hidden');
    }
    if (inGame) document.body.classList.remove('setup-open');
    else document.body.classList.add('setup-open');
  }

  function setState(next) {
    state = next;
    syncState();
  }

  function buildMenu() {
    const savedInfo = saved ? `${esc(playableFactions().find((f) => f.id === saved.playerFaction)?.name || '未知文明')} · 回合存檔設定` : '尚未建立世界';
    menuRoot.innerHTML = `
      <div class="menu-cinema">
        <div class="menu-vignette"></div>
        <div class="menu-top"><span class="menu-kicker">FIRA / GRAND STRATEGY</span><span class="menu-version">BUILD VII · 8 ERAS</span></div>
        <div class="menu-main">
          <div class="menu-brand">
            <div class="menu-mark">VII</div>
            <h1>文明帝國<span>CIVILIZATION</span></h1>
            <p class="menu-tagline">從上古城邦到 2100 星海，書寫你的文明史詩。</p>
            <div class="menu-rule"></div>
          </div>
          <nav class="menu-actions">
            <button class="menu-btn primary" data-act="new"><span class="mi">✦</span><b>新遊戲</b><small>選擇文明、地圖與對手</small></button>
            <button class="menu-btn" data-act="continue"><span class="mi">↻</span><b>繼續 / 載入</b><small>${savedInfo}</small></button>
            <button class="menu-btn" data-act="options"><span class="mi">⚙</span><b>選項</b><small>語言、音量、畫面與操作</small></button>
            <button class="menu-btn" data-act="encyclopedia"><span class="mi">▤</span><b>百科全書</b><small>文明、單位、科技、地形</small></button>
            <button class="menu-btn" data-act="gm"><span class="mi">⌘</span><b>GM Studio</b><small>即時編輯世界規則與外觀</small></button>
          </nav>
        </div>
        <div class="menu-foot">
          <span><kbd>G</kbd> / <kbd>F12</kbd> GM Studio</span>
          <span>16 歷史文明 · 三國群雄 · 外星勢力</span>
          <span>單人沙盒 · 3D 六角世界</span>
        </div>
      </div>`;
    menuRoot.querySelectorAll('[data-act]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        if (act === 'new') openSetup(0);
        else if (act === 'continue') {
          if (!saved) return say('沒有存檔', '請先建立一個新世界。', 'warn');
          Object.assign(draft, saved);
          startGame();
        } else if (act === 'options') openOptions();
        else if (act === 'encyclopedia') openEncyclopedia();
        else if (act === 'gm') onOpenGM?.('visual');
      });
    });
    menuRoot.querySelector('[data-act="continue"]').classList.toggle('disabled', !saved);
  }

  function openSetup(step = 0) {
    setupStep = Math.max(0, Math.min(3, step));
    setState('SETUP_WIZARD');
    renderSetup();
  }

  function factionGroups() {
    const all = playableFactions();
    return {
      historical: all.filter((f) => f.category === 'historical'),
      threeKingdoms: all.filter((f) => f.category === 'threeKingdoms'),
      alien: all.filter((f) => f.category === 'alien'),
    };
  }

  function poolForMode() {
    const groups = factionGroups();
    if (draft.mode === 'threeKingdoms') return groups.threeKingdoms;
    if (draft.mode === 'alien') {
      ensureAlienOptions(6, hashSeed(draft.seed) % 90000);
      return playableFactions().filter((f) => f.category === 'alien');
    }
    return groups.historical;
  }

  function ensureDraftFaction() {
    const groups = factionGroups();
    const pool = groups[draft.category] || poolForMode();
    if (!pool.some((f) => f.id === draft.playerFaction)) draft.playerFaction = pool[0]?.id || 'rome';
    draft.opponents = (draft.opponents || []).filter((id) => id !== draft.playerFaction && playableFactions().some((f) => f.id === id));
  }

  function renderSetup() {
    ensureDraftFaction();
    const stepNames = ['世界模式', '地圖與變異', '文明與領袖', '對手與規則'];
    setupRoot.innerHTML = `
      <div class="wizard-shell">
        <header class="wizard-head">
          <button class="wizard-back" id="wizard-back">← 主選單</button>
          <div class="wizard-steps">${stepNames.map((n, i) => `<div class="wizard-step ${i === setupStep ? 'active' : ''} ${i < setupStep ? 'done' : ''}"><b>${i + 1}</b><span>${n}</span></div>`).join('')}</div>
          <div class="wizard-brand">VII</div>
        </header>
        <main class="wizard-body" id="wizard-body"></main>
        <footer class="wizard-foot">
          <div class="wizard-hint" id="wizard-hint"></div>
          <div class="wizard-nav">
            <button class="ghost-btn" id="wizard-prev" ${setupStep === 0 ? 'disabled' : ''}>上一步</button>
            <button class="gold-btn" id="wizard-next">${setupStep === 3 ? '開始遊戲' : '下一步'}</button>
          </div>
        </footer>
      </div>`;
    $('#wizard-back', setupRoot).onclick = () => setState('MAIN_MENU');
    $('#wizard-prev', setupRoot).onclick = () => openSetup(setupStep - 1);
    $('#wizard-next', setupRoot).onclick = () => {
      if (setupStep === 3) startGame();
      else openSetup(setupStep + 1);
    };
    const body = $('#wizard-body', setupRoot);
    if (setupStep === 0) renderModeStep(body);
    else if (setupStep === 1) renderMapStep(body);
    else if (setupStep === 2) renderFactionStep(body);
    else renderOpponentStep(body);
  }

  function renderModeStep(body) {
    const modes = [
      { id: 'standard', icon: '☀', title: '歷史模式', sub: '16 個歷史文明', desc: '從上古走向 2100，體驗人類文明的完整八時代旅程。' },
      { id: 'threeKingdoms', icon: '漢', title: '三國模式', sub: '魏 · 蜀 · 吳 · 群雄', desc: '東漢末年群雄並起，名將、專屬科技與江東水戰。' },
      { id: 'alien', icon: '✧', title: '外星模式', sub: '四大異星原型', desc: '晶體、蟲群、機械與星靈文明降臨地球，改寫演化法則。' },
    ];
    body.innerHTML = `
      <div class="step-title"><span>01 / 04</span><h2>選擇世界模式</h2><p>每個模式都有獨立文明陣營、地圖偏好與勝利節奏。</p></div>
      <div class="mode-grid">${modes.map((m) => `
        <button class="mode-card ${draft.mode === m.id ? 'selected' : ''}" data-mode="${m.id}">
          <div class="mode-icon">${m.icon}</div><div class="mode-copy"><small>${m.sub}</small><h3>${m.title}</h3><p>${m.desc}</p></div>
          <span class="mode-check">${draft.mode === m.id ? '已選擇' : '選擇'}</span>
        </button>`).join('')}</div>
      <div class="info-strip"><b>提示</b> 模式會改變可選文明、地圖生成偏向與預設對手組合，之後仍可在 GM Studio 微調。</div>`;
    body.querySelectorAll('[data-mode]').forEach((btn) => btn.onclick = () => {
      draft.mode = btn.dataset.mode;
      draft.category = draft.mode === 'threeKingdoms' ? 'threeKingdoms' : draft.mode === 'alien' ? 'alien' : 'historical';
      draft.opponents = [];
      ensureDraftFaction();
      renderSetup();
    });
  }

  function renderMapStep(body) {
    body.innerHTML = `
      <div class="step-title"><span>02 / 04</span><h2>塑造腳下的世界</h2><p>選擇地圖骨架，再以六個維度雕刻地形。預覽會即時更新。</p></div>
      <div class="map-layout">
        <div class="map-controls">
          <label class="field"><span>地圖類型</span><select id="map-type">
            <option value="earth" ${draft.mapType === 'earth' ? 'selected' : ''}>地球真實起點 / TSL</option>
            <option value="threeKingdoms" ${draft.mapType === 'threeKingdoms' ? 'selected' : ''}>三國九州</option>
            <option value="random" ${draft.mapType === 'random' ? 'selected' : ''}>隨機大陸</option>
            <option value="custom" ${draft.mapType === 'custom' ? 'selected' : ''}>自訂變異世界</option>
          </select></label>
          <div class="field-row"><label class="field"><span>世界種子</span><input id="map-seed" value="${esc(draft.seed)}" maxlength="18"/></label><button class="ghost-btn" id="seed-random">隨機</button></div>
          <div class="slider-grid">${['elevation|海拔|0.4|1.8|0.1','temperature|溫度|-0.4|1.6|0.1','moisture|濕度|0|1.8|0.1','sea|海平面|0|2|0.1','fertility|肥沃度|0.3|1.8|0.1','mutation|異變強度|0|3|0.1'].map((s) => {
            const [key, label, min, max, step] = s.split('|');
            return `<label class="slider"><span>${label}<b id="val-${key}">${Number(draft[key]).toFixed(1)}</b></span><input type="range" data-map="${key}" min="${min}" max="${max}" step="${step}" value="${draft[key]}"/></label>`;
          }).join('')}</div>
          <div class="map-note"><b>地形預覽</b> 顏色代表氣候與海拔；紫色裂紋為異變強度。種子會同步影響對手與外星文明生成。</div>
        </div>
        <div class="map-preview-wrap"><canvas id="map-preview" width="720" height="440"></canvas><div class="preview-badge">HEX WORLD PREVIEW · <span id="preview-seed">${esc(draft.seed)}</span></div><div class="preview-legend"><i class="lg-ocean"></i>海洋 <i class="lg-grass"></i>平原 <i class="lg-forest"></i>森林 <i class="lg-desert"></i>沙漠 <i class="lg-mountain"></i>高山 <i class="lg-alien"></i>異變</div></div>
      </div>`;
    body.querySelectorAll('[data-map]').forEach((input) => input.oninput = () => {
      draft[input.dataset.map] = Number(input.value);
      $(`#val-${input.dataset.map}`, body).textContent = Number(input.value).toFixed(1);
      drawMapPreview();
    });
    $('#map-type', body).onchange = (e) => { draft.mapType = e.target.value; };
    $('#map-seed', body).oninput = (e) => { draft.seed = e.target.value.trim() || '1'; $('#preview-seed', body).textContent = draft.seed; drawMapPreview(); };
    $('#seed-random', body).onclick = () => { draft.seed = String(Math.floor(Math.random() * 900000) + 100000); $('#map-seed', body).value = draft.seed; $('#preview-seed', body).textContent = draft.seed; drawMapPreview(); };
    drawMapPreview();
  }

  function drawMapPreview() {
    const canvas = $('#map-preview', setupRoot);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#071018'); bg.addColorStop(1, '#0d1d27');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    let seed = hashSeed(`${draft.seed}:${draft.mapType}`);
    const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const cols = 19, rows = 10, r = 22, hx = r * 1.52, hy = Math.sqrt(3) * r;
    const x0 = 34, y0 = 54;
    const palette = { ocean: '#173f58', coast: '#28708a', lake: '#2b7c8f', grassland: '#7b9a58', plains: '#a59a61', desert: '#c7aa68', tundra: '#8b948e', snow: '#d7e3e6', hills: '#7f7f54', mountain: '#6f6d63', forest: '#476b48', jungle: '#3f7650', marsh: '#5e6f50', crystal: '#7657b8', lava: '#8c3e2e' };
    const smooth = (arr, passes = 2) => {
      let cur = arr;
      for (let p = 0; p < passes; p++) {
        const next = cur.map((v, i) => {
          const c = i % cols, rr = Math.floor(i / cols);
          let sum = v * 2, n = 2;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = c + dx, ny = rr + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            sum += cur[ny * cols + nx]; n++;
          }
          return sum / n;
        });
        cur = next;
      }
      return cur;
    };
    const rawE = Array.from({ length: cols * rows }, () => rnd());
    const rawM = Array.from({ length: cols * rows }, () => rnd());
    const rawT = Array.from({ length: cols * rows }, () => rnd());
    const eField = smooth(rawE, 3), mField = smooth(rawM, 2), tField = smooth(rawT, 2);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        const x = x0 + col * hx + (row % 2 ? hx / 2 : 0), y = y0 + row * hy;
        const lat = Math.abs(row / (rows - 1) - 0.5) * 1.15;
        const e = (eField[i] - 0.5) * 3.2 * draft.elevation + 0.55;
        const temp = ((tField[i] - 0.5) * 1.5 + 0.72) * draft.temperature - lat * 0.6 - Math.max(0, e - 0.8) * 0.45;
        const moist = ((mField[i] - 0.5) * 2 + 0.82) * (0.72 + draft.fertility * 0.28) + (draft.moisture - 1) * 0.5;
        let t = 'plains';
        if (e < draft.sea * 0.46) t = 'ocean';
        else if (e < draft.sea * 0.52) t = 'coast';
        else if (e > 1.55) t = 'mountain';
        else if (e > 1.22) t = 'hills';
        else if (temp < 0.18) t = 'snow';
        else if (temp < 0.4) t = 'tundra';
        else if (moist < 0.34 && temp > 0.9) t = 'desert';
        else if (moist > 1.02) t = temp > 1.18 ? 'jungle' : 'forest';
        else if (moist > 0.72) t = 'grassland';
        if (t !== 'ocean' && t !== 'coast' && rnd() < draft.mutation * 0.055) t = rnd() < 0.55 ? 'crystal' : 'lava';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 180 * (60 * i - 30);
          const px = x + Math.cos(a) * r * 0.94, py = y + Math.sin(a) * r * 0.94;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = palette[t] || palette.plains;
        ctx.fill();
        ctx.strokeStyle = 'rgba(4,12,18,.45)'; ctx.lineWidth = 1; ctx.stroke();
        if (t !== 'ocean' && rnd() < 0.06) {
          ctx.fillStyle = 'rgba(227,189,116,.8)'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.fillStyle = 'rgba(4,12,18,.62)';
    ctx.fillRect(0, h - 40, w, 40);
    ctx.fillStyle = '#e3bd74'; ctx.font = '600 13px "Noto Sans TC", sans-serif';
    ctx.fillText(`${draft.mapType.toUpperCase()} · SEED ${draft.seed} · MUTATION ${Number(draft.mutation).toFixed(1)}`, 22, h - 16);
  }

  function renderFactionStep(body) {
    const groups = factionGroups();
    const tabs = ['historical', 'threeKingdoms', 'alien'];
    const pool = groups[draft.category] || groups.historical;
    const selected = playableFactions().find((f) => f.id === draft.playerFaction) || pool[0];
    body.innerHTML = `
      <div class="step-title"><span>03 / 04</span><h2>你的文明與領袖</h2><p>每個文明擁有專屬特質、獨特科技、領袖造型與城市美學。</p></div>
      <div class="faction-tabs">${tabs.map((c) => `<button data-cat="${c}" class="${draft.category === c ? 'active' : ''}">${CATEGORY_LABEL[c]}<b>${groups[c].length}</b></button>`).join('')}</div>
      <div class="faction-layout">
        <div class="faction-grid">${pool.map((f) => `
          <button class="faction-card ${f.id === draft.playerFaction ? 'selected' : ''}" data-faction="${esc(f.id)}">
            ${portraitSVG(f)}
            <div class="faction-copy"><b>${esc(f.name)}</b><small>${esc(f.leader)}</small><span>${esc(f.traitName || '')}</span></div>
            <i class="faction-color" style="background:${hexColor(f.colors?.primary)}"></i>
          </button>`).join('')}</div>
        <aside class="leader-detail">
          <div class="leader-portrait">${portraitSVG(selected, 'large')}<div class="leader-flag" style="background:${hexColor(selected.colors?.primary)}"></div></div>
          <div class="leader-title"><small>${esc(selected.title || '')}</small><h3>${esc(selected.leader)}</h3><p>${esc(selected.name)} · ${esc(CULTURE_META[selected.culture]?.name || '')}</p></div>
          <div class="leader-trait"><b>${esc(selected.traitName || '文明特質')}</b><p>${esc(selected.trait || '')}</p></div>
          <div class="leader-stats"><span><b>${esc(selected.uniqueTechs?.[0]?.name || '—')}</b><small>獨特科技</small></span><span><b>${esc(selected.uniqueUnit?.def?.name || '—')}</b><small>獨特單位</small></span></div>
          <div class="leader-cities">${(selected.cityNames || []).slice(0, 5).map((n) => `<i>${esc(n)}</i>`).join('')}</div>
        </aside>
      </div>`;
    body.querySelectorAll('[data-cat]').forEach((btn) => btn.onclick = () => {
      draft.category = btn.dataset.cat;
      const first = factionGroups()[draft.category]?.[0];
      if (first) {
        draft.playerFaction = first.id;
        draft.opponents = (draft.opponents || []).filter((id) => id !== first.id);
      }
      renderSetup();
    });
    body.querySelectorAll('[data-faction]').forEach((btn) => btn.onclick = () => {
      draft.playerFaction = btn.dataset.faction;
      draft.opponents = (draft.opponents || []).filter((id) => id !== draft.playerFaction);
      renderSetup();
    });
  }

  function renderOpponentStep(body) {
    const all = playableFactions().filter((f) => f.id !== draft.playerFaction);
    const groups = factionGroups();
    const categories = draft.mode === 'threeKingdoms' ? ['threeKingdoms'] : draft.mode === 'alien' ? ['alien'] : ['historical', 'threeKingdoms', 'alien'];
    const pool = all.filter((f) => categories.includes(f.category));
    fillOpponents();
    const selected = (draft.opponents || []).filter((id) => id !== draft.playerFaction).slice(0, draft.opponentCount);
    draft.opponents = selected;
    body.innerHTML = `
      <div class="step-title"><span>04 / 04</span><h2>對手與世界規則</h2><p>挑選 AI 文明、難度與起始時代。未選滿時系統會從可用陣營自動補足。</p></div>
      <div class="opponent-layout">
        <div class="opponent-left">
          <div class="opponent-toolbar"><div><b>AI 對手</b><small>已選 <span id="op-count">${selected.length}</span> / ${draft.opponentCount}</small></div><button class="ghost-btn" id="op-auto">自動配對</button></div>
          <label class="slider compact"><span>對手數量<b id="val-count">${draft.opponentCount}</b></span><input id="op-limit" type="range" min="1" max="8" step="1" value="${draft.opponentCount}"/></label>
          <div class="opponent-grid">${pool.map((f) => {
            const on = selected.includes(f.id);
            return `<button class="opponent-card ${on ? 'selected' : ''}" data-opponent="${esc(f.id)}" data-bg="${hexColor(f.colors?.primary)}"><span class="opp-dot" style="background:${hexColor(f.colors?.primary)}"></span><b>${esc(f.name)}</b><small>${esc(f.leader)}</small><i>${on ? '✓' : '+'}</i></button>`;
          }).join('')}</div>
        </div>
        <aside class="rules-panel">
          <label class="field"><span>難度</span><select id="rule-diff">${Object.entries(DIFFICULTIES).map(([id, d]) => `<option value="${id}" ${draft.difficulty === id ? 'selected' : ''}>${d.name}</option>`).join('')}</select></label>
          <label class="field"><span>起始時代</span><select id="rule-era">${ERAS.map((n, i) => `<option value="${i}" ${Number(draft.startEra) === i ? 'selected' : ''}>${n}時代</option>`).join('')}</select></label>
          <label class="field"><span>音樂風格</span><select id="rule-music">${Object.entries(MUSIC_STYLES).map(([id, m]) => `<option value="${id}" ${draft.musicStyle === id ? 'selected' : ''}>${m.name}</option>`).join('')}</select></label>
          <div class="rules-summary"><b>世界摘要</b><p>${esc(draft.mode === 'threeKingdoms' ? '三國' : draft.mode === 'alien' ? '外星' : '歷史')}模式 · ${esc(draft.mapType)} · 異變 ${Number(draft.mutation).toFixed(1)}</p><p>玩家：${esc(playableFactions().find((f) => f.id === draft.playerFaction)?.name || '—')}</p><p>對手：${selected.map((id) => esc(playableFactions().find((f) => f.id === id)?.name || id)).join('、') || '自動配對'}</p></div>
          <div class="rules-note">所有設定之後都能在遊戲內 Options 與 GM Studio 調整；GM 修改會即時套用到目前世界。</div>
        </aside>
      </div>`;
    const countEl = $('#op-count', body);
    const limit = $('#op-limit', body);
    const updateCount = () => { countEl.textContent = draft.opponents.length; };
    const trim = () => {
      draft.opponents = draft.opponents.slice(0, draft.opponentCount);
      body.querySelectorAll('[data-opponent]').forEach((b) => {
        const on = draft.opponents.includes(b.dataset.opponent);
        b.classList.toggle('selected', on);
        b.querySelector('i').textContent = on ? '✓' : '+';
      });
      updateCount();
    };
    body.querySelectorAll('[data-opponent]').forEach((btn) => btn.onclick = () => {
      const id = btn.dataset.opponent;
      if (draft.opponents.includes(id)) draft.opponents = draft.opponents.filter((x) => x !== id);
      else if (draft.opponents.length < draft.opponentCount) draft.opponents.push(id);
      else {
        draft.opponents[draft.opponents.length - 1] = id;
      }
      ensureDraftFaction();
      trim();
    });
    limit.oninput = () => {
      draft.opponentCount = Number(limit.value);
      $('#val-count', body).textContent = draft.opponentCount;
      trim();
      fillOpponents();
    };
    $('#op-auto', body).onclick = () => { draft.opponents = []; fillOpponents(); trim(); };
    $('#rule-diff', body).onchange = (e) => { draft.difficulty = e.target.value; };
    $('#rule-era', body).onchange = (e) => { draft.startEra = Number(e.target.value); };
    $('#rule-music', body).onchange = (e) => { draft.musicStyle = e.target.value; };
  }

  function fillOpponents() {
    const all = playableFactions().filter((f) => f.id !== draft.playerFaction);
    const cats = draft.mode === 'threeKingdoms' ? ['threeKingdoms'] : draft.mode === 'alien' ? ['alien'] : ['historical', 'threeKingdoms', 'alien'];
    const pool = all.filter((f) => cats.includes(f.category));
    let i = 0;
    while (draft.opponents.length < draft.opponentCount && i < pool.length * 2) {
      const f = pool[i % pool.length];
      if (!draft.opponents.includes(f.id)) draft.opponents.push(f.id);
      i++;
    }
  }

  function startGame() {
    fillOpponents();
    draft.opponents = draft.opponents.slice(0, draft.opponentCount);
    if (!draft.opponents.length) fillOpponents();
    GameMasterConfig.options.difficulty = draft.difficulty;
    GameMasterConfig.options.musicStyle = draft.musicStyle;
    GameMasterConfig.options.language = draft.language;
    saveConfig();
    saveSetup(draft);
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('play', '1');
    url.searchParams.set('scenario', draft.mode === 'threeKingdoms' ? 'threeKingdoms' : 'legacy');
    url.searchParams.set('map', draft.mapType);
    url.searchParams.set('seed', draft.seed);
    url.searchParams.set('mutation', String(draft.mutation));
    url.searchParams.set('era', String(draft.startEra));
    window.location.href = url.toString();
  }

  function ensureOptions() {
    GameMasterConfig.options = { ...structuredClone(DEFAULT_OPTIONS), ...(GameMasterConfig.options || {}) };
    GameMasterConfig.options.volumes = { ...DEFAULT_OPTIONS.volumes, ...(GameMasterConfig.options.volumes || {}) };
    return GameMasterConfig.options;
  }

  function buildOptions() {
    const o = ensureOptions();
    optionsRoot.innerHTML = `
      <div class="modal-shell options-shell">
        <header class="modal-head"><div><small>SYSTEM</small><h2>選項</h2></div><button class="modal-close" data-close>✕</button></header>
        <div class="options-body">
          <section class="option-section"><h3>語言與遊戲</h3>
            <label class="field"><span>介面語言</span><select data-opt="language"><option value="zh" ${o.language === 'zh' ? 'selected' : ''}>繁體中文</option><option value="en" ${o.language === 'en' ? 'selected' : ''}>English</option><option value="ja" ${o.language === 'ja' ? 'selected' : ''}>日本語</option></select></label>
            <label class="field"><span>難度</span><select data-opt="difficulty">${Object.entries(DIFFICULTIES).map(([id, d]) => `<option value="${id}" ${o.difficulty === id ? 'selected' : ''}>${d.name}</option>`).join('')}</select></label>
            <label class="check-row"><input type="checkbox" data-opt="autoEndTurn" ${o.autoEndTurn ? 'checked' : ''}/><span>單位全部行動後自動結束回合</span></label>
            <label class="check-row"><input type="checkbox" data-opt="hexBorders" ${o.hexBorders ? 'checked' : ''}/><span>顯示六角格邊界</span></label>
            <label class="check-row"><input type="checkbox" data-opt="antialias" ${o.antialias ? 'checked' : ''}/><span>抗鋸齒（下次啟動生效）</span></label>
          </section>
          <section class="option-section"><h3>音量</h3>
            ${[['master', '總音量'], ['music', '音樂'], ['sfx', '戰鬥音效'], ['ui', '介面音效']].map(([k, n]) => `<label class="slider"><span>${n}<b data-vol-label="${k}">${fmtPct(o.volumes[k])}</b></span><input type="range" min="0" max="1" step="0.01" data-vol="${k}" value="${o.volumes[k]}"/></label>`).join('')}
          </section>
          <section class="option-section"><h3>音樂</h3>
            <label class="field"><span>配樂風格</span><select data-opt="musicStyle">${Object.entries(MUSIC_STYLES).map(([id, m]) => `<option value="${id}" ${o.musicStyle === id ? 'selected' : ''}>${m.name}</option>`).join('')}</select></label>
          </section>
          <section class="option-section"><h3>畫面</h3>
            <label class="slider"><span>渲染比例<b data-val="renderScale">${fmtPct(o.renderScale)}</b></span><input type="range" min="0.6" max="1.5" step="0.05" data-opt="renderScale" value="${o.renderScale}"/></label>
            <label class="slider"><span>介面縮放<b data-val="uiScale">${fmtPct(o.uiScale)}</b></span><input type="range" min="0.8" max="1.25" step="0.05" data-opt="uiScale" value="${o.uiScale}"/></label>
            <label class="field"><span>陰影品質</span><select data-opt="shadows"><option value="off" ${o.shadows === 'off' ? 'selected' : ''}>關閉</option><option value="low" ${o.shadows === 'low' ? 'selected' : ''}>低</option><option value="high" ${o.shadows === 'high' ? 'selected' : ''}>高</option></select></label>
            <label class="check-row"><input type="checkbox" data-opt="fullscreen" ${o.fullscreen ? 'checked' : ''}/><span>全螢幕</span></label>
          </section>
          <section class="option-section"><h3>操作</h3>
            <label class="slider"><span>平移靈敏度<b data-val="cameraPan">${Number(o.cameraPan).toFixed(2)}</b></span><input type="range" min="0.3" max="2" step="0.05" data-opt="cameraPan" value="${o.cameraPan}"/></label>
            <label class="slider"><span>縮放靈敏度<b data-val="cameraZoom">${Number(o.cameraZoom).toFixed(2)}</b></span><input type="range" min="0.3" max="2" step="0.05" data-opt="cameraZoom" value="${o.cameraZoom}"/></label>
          </section>
        </div>
        <footer class="modal-foot"><button class="ghost-btn" id="opt-reset">恢復預設</button><div><button class="ghost-btn" data-close>取消</button><button class="gold-btn" id="opt-save">套用並儲存</button></div></footer>
      </div>`;
    optionsRoot.querySelectorAll('[data-close]').forEach((b) => b.onclick = () => optionsRoot.classList.add('hidden'));
    optionsRoot.querySelectorAll('[data-opt]').forEach((input) => {
      input.oninput = input.onchange = () => {
        const key = input.dataset.opt;
        const value = input.type === 'checkbox' ? input.checked : input.type === 'range' ? Number(input.value) : input.value;
        GameMasterConfig.options[key] = value;
        if (input.type === 'range') {
          const lbl = optionsRoot.querySelector(`[data-val="${key}"]`);
          if (lbl) lbl.textContent = key === 'renderScale' || key === 'uiScale' ? fmtPct(value) : Number(value).toFixed(2);
        }
        if (key === 'fullscreen') toggleFullscreen(value);
        applyOptions(false);
      };
    });
    optionsRoot.querySelectorAll('[data-vol]').forEach((input) => {
      input.oninput = () => {
        const key = input.dataset.vol;
        GameMasterConfig.options.volumes[key] = Number(input.value);
        optionsRoot.querySelector(`[data-vol-label="${key}"]`).textContent = fmtPct(input.value);
        applyOptions(false);
      };
    });
    $('#opt-save', optionsRoot).onclick = () => { applyOptions(true); optionsRoot.classList.add('hidden'); say('選項已儲存', '設定會保留在瀏覽器中。', 'good'); };
    $('#opt-reset', optionsRoot).onclick = () => {
      GameMasterConfig.options = structuredClone(DEFAULT_OPTIONS);
      saveConfig();
      buildOptions();
      applyOptions(false);
      say('已恢復預設', '所有選項回到初始值。', 'info');
    };
  }

  function openOptions() {
    buildOptions();
    optionsRoot.classList.remove('hidden');
  }

  function toggleFullscreen(on) {
    try {
      if (on && !document.fullscreenElement) document.documentElement.requestFullscreen?.();
      if (!on && document.fullscreenElement) document.exitFullscreen?.();
    } catch (e) { /* ignore */ }
  }

  function applyOptions(persist) {
    const o = GameMasterConfig.options;
    document.documentElement.style.setProperty('--ui-scale', o.uiScale);
    document.documentElement.lang = o.language === 'en' ? 'en' : o.language === 'ja' ? 'ja' : 'zh-Hant-TW';
    saveConfig();
    onApplyOptions?.(o);
    if (persist) saveConfig();
  }

  function buildEncyclopedia() {
    encRoot.innerHTML = `
      <div class="modal-shell encyclopedia-shell">
        <header class="modal-head"><div><small>CODEX</small><h2>百科全書</h2></div><button class="modal-close" data-close>✕</button></header>
        <div class="codex-tabs">${[['civ', '文明'], ['unit', '單位'], ['tech', '科技'], ['terrain', '地形']].map(([id, n]) => `<button data-tab="${id}" class="${encTab === id ? 'active' : ''}">${n}</button>`).join('')}</div>
        <div class="codex-search"><input id="codex-filter" placeholder="搜尋名稱、特性、關鍵字…"/><span id="codex-count"></span></div>
        <div class="codex-body" id="codex-body"></div>
      </div>`;
    encRoot.querySelector('[data-close]').onclick = () => encRoot.classList.add('hidden');
    encRoot.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => {
      encTab = b.dataset.tab;
      encRoot.querySelectorAll('[data-tab]').forEach((x) => x.classList.toggle('active', x === b));
      renderCodex();
    });
    $('#codex-filter', encRoot).oninput = renderCodex;
    renderCodex();
  }

  function renderCodex() {
    const root = $('#codex-body', encRoot);
    if (!root) return;
    const q = ($('#codex-filter', encRoot)?.value || '').toLowerCase();
    let rows = [];
    if (encTab === 'civ') {
      rows = playableFactions().map((f) => `<article class="codex-card civ">${portraitSVG(f)}<div><h3>${esc(f.name)} <small>${esc(f.leader)}</small></h3><p>${esc(f.traitName || '')}：${esc(f.trait || '')}</p><span class="tag">${CATEGORY_LABEL[f.category] || ''}</span><span class="tag">${esc(CULTURE_META[f.culture]?.name || '')}</span><ul><li>獨特科技：${(f.uniqueTechs || []).map((t) => esc(t.name)).join('、') || '—'}</li><li>獨特單位：${esc(f.uniqueUnit?.def?.name || '—')}</li></ul></div></article>`);
    } else if (encTab === 'unit') {
      const seen = new Set();
      rows = Object.values(UNIT_TYPES).filter((u) => {
        if (seen.has(u.name)) return false;
        seen.add(u.name); return true;
      }).map((u) => `<article class="codex-row"><b>${esc(u.name)}</b><span>${esc(u.cls || '')}</span><span>戰力 ${u.str ?? '—'}</span><span>射程 ${u.range ?? '—'}</span><span>移動 ${u.moves ?? '—'}</span><p>${esc(u.blurb || u.faction || '')}</p></article>`);
    } else if (encTab === 'tech') {
      rows = TECHS.map((t) => `<article class="codex-row tech"><b>${esc(t.name)}</b><span>${esc(t.era)}</span><span>${t.cost} 科研</span><span>${t.unique ? '獨特' : t.codex ? '精通' : '基礎'}</span><p>${esc(t.bonus || t.desc || '')}</p></article>`);
    } else {
      rows = Object.entries(GameMasterConfig.terrain).map(([id, t]) => `<article class="codex-row terrain" data-t="${id}"><b>${esc(t.name || id)}</b><span>移動 ${t.move}</span><span>防禦 ${fmtPct(t.defense)}</span><span>視野 +${t.sight ?? 0}</span><p>${Object.entries(t.yields || {}).map(([k, v]) => `${k} +${v}`).join(' · ') || '無產出'}</p></article>`);
    }
    const filtered = rows.filter((html) => !q || html.toLowerCase().includes(q));
    root.innerHTML = filtered.join('') || '<div class="empty-note">沒有符合條件的條目。</div>';
    $('#codex-count', encRoot).textContent = `${filtered.length} 條`;
  }

  function openEncyclopedia() {
    buildEncyclopedia();
    encRoot.classList.remove('hidden');
  }

  buildMenu();
  buildOptions();
  buildEncyclopedia();
  syncState();
  applyOptions(false);
  return app;
}
