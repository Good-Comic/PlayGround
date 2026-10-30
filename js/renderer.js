import { TILE_W, TILE_H, HALF_W, HALF_H, iso, isoToWorld, clamp, lerp, hash2, shade, rgba } from './utils.js';
import { PLAYER_COLORS, ENEMY_COLORS, BIOMES } from './data.js';
import { civilizationVisualProfile, directionalAnimationFrame } from './visuals.js';
import { atlasFrame, atlasActionProgress, loadUnitSpriteAtlases, unitSpriteAtlasKey } from './sprite-atlas.js';
import { heroCastVisual, bossStrikeVisual } from './hero-skills.js';

const TERRAIN_COLORS = {
  grass: ['#62753a', '#697d3f', '#5d7037', '#708341'],
  forest: ['#4b5f32', '#506636', '#465b2e', '#576b39'],
  dirt: ['#8a7049', '#90774f', '#826a44', '#967c54'],
  cobble: ['#7a6e57', '#7e725a', '#746953', '#83765e'],
  sand: ['#a68c5b', '#ab935f', '#9e8758', '#b09864'],
  water: ['#2d5b60', '#306066', '#29565b', '#35656a'],
  rock: ['#726d5d', '#787362', '#6b6758', '#7e7866'],
};

const BIOME_COLORS = {
  steppe: {
    grass: ['#7b7c3f', '#848346', '#73753b', '#8c894b'],
    forest: ['#596334', '#606c39', '#535e31', '#68733f'],
    dirt: ['#987b4c', '#a08353', '#8f7447', '#a88b59'],
    sand: ['#b39963', '#baa26b', '#ac925d', '#c0a972'],
    water: ['#3b6769', '#406d6f', '#386265', '#447274'],
  },
  forest: {
    grass: ['#4a5c30', '#506237', '#44562c', '#566836'],
    forest: ['#354625', '#3a4c29', '#314121', '#40522e'],
    dirt: ['#6f5c3b', '#766341', '#685536', '#7d6a47'],
    water: ['#264c50', '#294f54', '#23474b', '#2d555a'],
  },
  dune: {
    grass: ['#a2884f', '#aa9157', '#9a814a', '#b1985f'],
    forest: ['#7b6b3d', '#817144', '#746437', '#887649'],
    dirt: ['#9b7c4b', '#a38451', '#927445', '#aa8b58'],
    sand: ['#c3a36a', '#cbaa71', '#bb9b63', '#d0b077'],
    water: ['#3d6867', '#426e6d', '#396261', '#487572'],
    rock: ['#8c7b5d', '#948265', '#847455', '#9b8869'],
  },
  river: {
    grass: ['#5c793d', '#647f42', '#567339', '#6b8648'],
    forest: ['#425e31', '#486536', '#3e582d', '#4f6b3b'],
    dirt: ['#837048', '#8a774f', '#7b6842', '#917d55'],
    sand: ['#a99261', '#b09867', '#a18a5b', '#b7a06e'],
    water: ['#2e6772', '#326d79', '#2a626c', '#397480'],
  },
  highland: {
    grass: ['#6a6f40', '#717646', '#64693b', '#797e4c'],
    forest: ['#4c5834', '#515f38', '#48532f', '#58653e'],
    dirt: ['#8a7350', '#917a56', '#826b49', '#997f5c'],
    rock: ['#777264', '#7e796a', '#706b5d', '#857f70'],
    water: ['#335c66', '#37616b', '#305762', '#3c6872'],
  },
  fjord: {
    grass: ['#536d4f', '#5a7355', '#4e674a', '#617a5b'],
    forest: ['#3d5940', '#425e44', '#39533c', '#486449'],
    dirt: ['#79705a', '#807762', '#726954', '#867c68'],
    sand: ['#9b9a85', '#a4a28d', '#93927e', '#aca992'],
    water: ['#2b5867', '#2f5e6e', '#285262', '#34707e'],
    rock: ['#70756f', '#777c76', '#696e68', '#80847d'],
  },
  island: {
    grass: ['#587a47', '#60824e', '#527543', '#688a55'],
    forest: ['#3e6239', '#44693e', '#3a5b35', '#4b7044'],
    dirt: ['#85704d', '#8c7753', '#7d6847', '#94805b'],
    sand: ['#b2a171', '#baa879', '#aa996b', '#c1b081'],
    water: ['#2b6a78', '#307180', '#286471', '#377b8a'],
  },
  ash: {
    grass: ['#5a613f', '#616945', '#555c3a', '#687049'],
    forest: ['#414b34', '#465138', '#3d4730', '#4d583c'],
    dirt: ['#7d6949', '#846f4e', '#766244', '#8a7655'],
    sand: ['#8f8058', '#96875f', '#877952', '#9e8f66'],
    water: ['#294d54', '#2c5259', '#274850', '#31585f'],
    rock: ['#666356', '#6d6a5c', '#5f5c50', '#74705f'],
  },
};

function terrainPalette(biome, terrain) {
  return BIOME_COLORS[biome]?.[terrain] || TERRAIN_COLORS[terrain] || TERRAIN_COLORS.grass;
}

// Read-only presentation: a shoreline never adds passable tiles or changes RNG.
export function waterBankEdges(world, x, y) {
  if (world.tiles[y * world.size + x]?.terrain !== 'water') return [];
  return [[0, -1], [1, 0], [0, 1], [-1, 0]].flatMap(([dx, dy], edge) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= world.size || ny >= world.size) return [];
    return world.tiles[ny * world.size + nx]?.terrain !== 'water' ? [edge] : [];
  });
}

// Visual roles are deliberately independent from combat stats.  Keeping this
// small vocabulary explicit lets the renderer make silhouettes readable at
// normal zoom without changing unit balance or simulation state.
export function unitVisualSignature(type) {
  return ({
    chu_ko_nu: 'repeating-crossbow',
    skirmisher: 'javelin-buckler',
    guard: 'heavy-guard',
    knight: 'mounted-sword',
    light_cavalry: 'mounted-spear',
    horse_archer: 'mounted-bow',
  })[type] || 'standard';
}

// Building presentation state is derived only from persisted simulation data.
// Rendering can therefore show construction, damage and ruins without adding
// timers or randomness to the gameplay/save model.
export function buildingVisualState(building) {
  if (!building?.alive) return 'ruined';
  const construction = Number.isFinite(building.construction) ? building.construction : 1;
  if (construction < 0.45) return 'foundation';
  if (construction < 1) return 'scaffolded';
  const maxHp = Math.max(1, building.maxHp || 1);
  const health = clamp((building.hp ?? maxHp) / maxHp, 0, 1);
  if (health <= 0.35) return 'critical';
  if (health <= 0.7) return 'damaged';
  return 'complete';
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.w = 0; this.h = 0; this.dpr = 1;
    this.tileSprites = new Map();
    this.terrainLayer = document.createElement('canvas');
    this.terrainCtx = this.terrainLayer.getContext('2d', { alpha: false });
    this.terrainKey = '';
    this.unitSpriteAtlases = loadUnitSpriteAtlases(undefined, undefined, { deferCivilizations: true });
    this.buildTileSprites();
    this.motes = Array.from({ length: 44 }, (_, i) => ({
      x: hash2(i, 2, 9), y: hash2(i, 7, 13), speed: 0.12 + hash2(i, 9, 3) * 0.3,
      size: 0.8 + hash2(i, 4, 8) * 1.7, phase: hash2(i, 6, 1) * 6.28,
    }));
    this.birds = Array.from({ length: 5 }, (_, i) => ({ o: hash2(i, 1, 7), speed: 0.012 + hash2(i, 3, 2) * 0.01, y: 0.12 + hash2(i, 5, 8) * 0.2, size: 7 + hash2(i, 7, 2) * 6 }));
    this.corpses = [];
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    this.dpr = dpr; this.w = w; this.h = h;
    this.canvas.width = Math.max(1, Math.floor(w * dpr));
    this.canvas.height = Math.max(1, Math.floor(h * dpr));
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.terrainLayer.width = this.canvas.width;
    this.terrainLayer.height = this.canvas.height;
    this.terrainKey = '';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.lighting = this.ctx.createLinearGradient(0, 0, w * 0.8, h);
    this.lighting.addColorStop(0, 'rgba(255, 218, 146, 0.055)');
    this.lighting.addColorStop(0.45, 'rgba(255, 235, 185, 0.01)');
    this.lighting.addColorStop(1, 'rgba(12, 18, 10, 0.15)');
  }

  buildTileSprites() {
    for (const biome of BIOMES.map(b => b.id)) {
      for (const terrain of Object.keys(TERRAIN_COLORS)) {
        for (let v = 0; v < 4; v++) {
          const c = document.createElement('canvas');
          c.width = 128; c.height = 64;
          const x = c.getContext('2d');
          x.scale(2, 2);
          this.paintTile(x, terrain, v, biome);
          this.tileSprites.set(`${biome}:${terrain}-${v}`, c);
        }
      }
    }
  }

  paintTile(ctx, terrain, variant, biome = 'ash') {
    const palette = terrainPalette(biome, terrain);
    const base = palette[variant % palette.length];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(32, 0); ctx.lineTo(64, 16); ctx.lineTo(32, 32); ctx.lineTo(0, 16); ctx.closePath();
    ctx.clip();
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 64, 32);
    const grad = ctx.createRadialGradient(29, 12, 2, 32, 16, 34);
    grad.addColorStop(0, 'rgba(255,255,220,0.06)');
    grad.addColorStop(1, 'rgba(0,0,0,0.07)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 32);
    const rand = (a, b) => hash2(a, b, variant + terrain.length * 7);

    if (terrain === 'grass') {
      for (let i = 0; i < 24; i++) {
        const gx = rand(i, 2) * 64, gy = 5 + rand(i, 3) * 23;
        ctx.strokeStyle = rand(i, 4) > 0.55 ? 'rgba(189,205,124,0.2)' : 'rgba(32,45,23,0.25)';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + rand(i, 5) * 2 - 1, gy - 1.2); ctx.stroke();
      }
      if (variant === 1) {
        for (let i = 0; i < 3; i++) {
          const fx = 12 + rand(i, 6) * 40, fy = 9 + rand(i, 7) * 14;
          ctx.fillStyle = i % 2 ? 'rgba(231,216,148,0.5)' : 'rgba(208,179,205,0.35)';
          ctx.beginPath(); ctx.arc(fx, fy, 0.8, 0, 6.3); ctx.fill();
        }
      }
    } else if (terrain === 'forest') {
      for (let i = 0; i < 22; i++) {
        const gx = rand(i, 2) * 64, gy = 5 + rand(i, 3) * 23;
        ctx.fillStyle = rand(i, 4) > 0.6 ? 'rgba(132,137,74,0.16)' : 'rgba(23,33,16,0.25)';
        ctx.beginPath(); ctx.ellipse(gx, gy, 1.1 + rand(i, 5), 0.6, rand(i, 6) * 3, 0, 6.3); ctx.fill();
      }
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = 'rgba(130,90,40,0.28)';
        ctx.beginPath(); ctx.ellipse(rand(i, 8) * 60 + 2, rand(i, 9) * 26 + 4, 1.6, 0.8, 0.3, 0, 6.3); ctx.fill();
      }
    } else if (terrain === 'dirt') {
      for (let i = 0; i < 10; i++) {
        const gx = rand(i, 2) * 64, gy = 5 + rand(i, 3) * 23;
        ctx.fillStyle = rand(i, 4) > 0.5 ? 'rgba(181,157,111,0.32)' : 'rgba(67,49,30,0.25)';
        ctx.beginPath(); ctx.ellipse(gx, gy, 1 + rand(i, 5) * 1.5, 0.55 + rand(i, 6) * 0.5, rand(i, 7) * 3, 0, 6.3); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(57,41,23,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(10, 13); ctx.quadraticCurveTo(30, 8, 53, 21); ctx.stroke();
    } else if (terrain === 'cobble') {
      for (let i = 0; i < 11; i++) {
        const gx = 7 + rand(i, 2) * 50, gy = 7 + rand(i, 3) * 18;
        ctx.fillStyle = rand(i, 4) > 0.45 ? 'rgba(157,146,120,0.35)' : 'rgba(72,66,54,0.3)';
        ctx.beginPath(); ctx.ellipse(gx, gy, 1.8 + rand(i, 5) * 1.7, 1 + rand(i, 6), rand(i, 7) * 3, 0, 6.3); ctx.fill();
      }
    } else if (terrain === 'sand') {
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = rand(i, 3) > 0.5 ? 'rgba(223,199,143,0.25)' : 'rgba(105,84,48,0.18)';
        ctx.fillRect(rand(i, 4) * 62 + 1, rand(i, 5) * 27 + 3, 0.8, 0.8);
      }
    } else if (terrain === 'water') {
      ctx.strokeStyle = 'rgba(151,205,200,0.18)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 4; i++) {
        const wy = 9 + i * 5 + rand(i, 2) * 2;
        ctx.beginPath(); ctx.moveTo(8, wy); ctx.quadraticCurveTo(20, wy - 2, 30, wy); ctx.quadraticCurveTo(43, wy + 2, 56, wy - 1); ctx.stroke();
      }
    } else if (terrain === 'rock') {
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = rand(i, 3) > 0.5 ? 'rgba(119,114,98,0.45)' : 'rgba(57,54,47,0.25)';
        ctx.beginPath(); ctx.ellipse(rand(i, 4) * 60 + 2, rand(i, 5) * 24 + 4, 2 + rand(i, 6) * 2, 1.2, 0.2, 0, 6.3); ctx.fill();
      }
    }
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(32, 0); ctx.lineTo(64, 16); ctx.lineTo(32, 32); ctx.lineTo(0, 16); ctx.closePath();
    ctx.strokeStyle = 'rgba(255,245,205,0.055)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }

  screen(game, x, y) {
    const p = iso(x, y);
    return {
      x: (p.x - game.camera.x) * game.camera.zoom + this.w / 2,
      y: (p.y - game.camera.y) * game.camera.zoom + this.h / 2,
    };
  }

  worldAt(game, sx, sy) {
    const px = (sx - this.w / 2) / game.camera.zoom + game.camera.x;
    const py = (sy - this.h / 2) / game.camera.zoom + game.camera.y;
    return isoToWorld(px, py);
  }

  // 切換文明時釋放舊圖像／裁格引用，不更動遊戲狀態。 / Release old image/crop references on civ changes without changing simulation.
  setSpriteAtlasCivilization(civId) {
    if (this.spriteAtlasCivilization === civId) return;
    this.spriteAtlasCivilization = civId;
    for (const [key, entry] of this.unitSpriteAtlases) {
      if (!key.includes(':')) continue;
      if (civId && key.startsWith(`${civId}:`)) entry.load?.();
      else entry.release?.();
    }
  }

  draw(game, time) {
    this.setSpriteAtlasCivilization(game.inMenu ? null : game.civ?.id);
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#141a10';
    ctx.fillRect(0, 0, this.w, this.h);
    this.drawTerrain(game, time);
    this.drawRallyPoints(game);
    this.drawGroundMarks(game, time);
    this.drawZones(game, time);
    this.drawCommandMarkers(game);
    this.drawSelectionMarks(game, time);

    const drawables = [];
    for (const b of game.buildings) {
      if (!b.alive && (b.construction || 0) < 0.15) continue;
      drawables.push({ kind: b.alive ? 'building' : 'ruin', obj: b, depth: b.x + b.y + b.w * 0.4 + b.h * 0.4 });
    }
    for (const u of game.units) {
      if (!u.alive && !(u.deathAnim > 0)) continue;
      drawables.push({ kind: 'unit', obj: u, depth: u.x + u.y + 0.1 });
    }
    for (const n of game.world.resources) {
      if (!n.alive) continue;
      drawables.push({ kind: 'resource', obj: n, depth: n.x + n.y + 0.2 });
    }
    for (const p of game.world.props) {
      drawables.push({ kind: 'prop', obj: p, depth: p.x + p.y });
    }
    for (const w of game.world.wildlife) {
      drawables.push({ kind: 'wildlife', obj: w, depth: w.x + w.y });
    }
    drawables.sort((a, b) => a.depth - b.depth);
    for (const d of drawables) {
      if (d.kind === 'building') this.drawBuilding(d.obj, game, time);
      else if (d.kind === 'ruin') this.drawBuildingRuin(d.obj, game, time);
      else if (d.kind === 'unit') this.drawUnit(d.obj, game, time);
      else if (d.kind === 'resource') this.drawResource(d.obj, game, time);
      else if (d.kind === 'prop') this.drawProp(d.obj, game, time);
      else this.drawWildlife(d.obj, game, time);
    }

    this.drawProjectiles(game, time);
    this.drawParticles(game, time);
    this.drawBuildGhost(game, time);
    this.drawAtmosphere(game, time);
    this.drawSelectionBox(game);
  }

  visibleBounds(game) {
    const pts = [
      this.worldAt(game, 0, 0), this.worldAt(game, this.w, 0),
      this.worldAt(game, 0, this.h), this.worldAt(game, this.w, this.h),
    ];
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    return {
      x0: Math.max(0, Math.floor(Math.min(...xs)) - 2), x1: Math.min(game.world.size - 1, Math.ceil(Math.max(...xs)) + 2),
      y0: Math.max(0, Math.floor(Math.min(...ys)) - 2), y1: Math.min(game.world.size - 1, Math.ceil(Math.max(...ys)) + 2),
    };
  }

  drawTerrain(game, time) {
    const ctx = this.ctx;
    const layer = this.terrainLayer;
    const lctx = this.terrainCtx;
    const z = game.camera.zoom;
    const key = `${game.world.seed}|${game.world.generationVersion || 1}|${game.world.biome || 'ash'}|${game.camera.x}|${game.camera.y}|${z}|${this.w}|${this.h}|${this.dpr}`;
    if (this.terrainKey !== key) {
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.fillStyle = '#141a10';
      lctx.fillRect(0, 0, layer.width, layer.height);
      lctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      const tw = TILE_W * z, th = TILE_H * z;
      const b = this.visibleBounds(game);
      for (let y = b.y0; y <= b.y1; y++) {
        for (let x = b.x0; x <= b.x1; x++) {
          const tile = game.world.tiles[y * game.world.size + x];
          const p = this.screen(game, x + 0.5, y + 0.5);
          const sprite = this.tileSprites.get(`${game.world.biome || 'ash'}:${tile.terrain}-${tile.variant}`);
          if (sprite) lctx.drawImage(sprite, p.x - tw / 2, p.y - th / 2, tw, th);
          if (tile.terrain === 'water') this.drawWaterBanks(game.world, x, y, lctx, p, z);
        }
      }
      // Lighting is invariant until the terrain/camera/viewport key changes.
      // Bake it into the terrain layer instead of blending the whole screen every frame.
      lctx.fillStyle=this.lighting;lctx.fillRect(0,0,this.w,this.h);
      this.terrainKey = key;
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  }

  drawWaterBanks(world, x, y, ctx, p, z) {
    const edges = waterBankEdges(world, x, y);
    if (!edges.length) return;
    const corners = [[0, -HALF_H], [HALF_W, 0], [0, HALF_H], [-HALF_W, 0]];
    const colors = world.biome === 'fjord' ? ['#8c9f9e', '#c4dbd4']
      : world.biome === 'ash' ? ['#636258', '#aab7a3'] : ['#b5a47b', '#d5d8ad'];
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(z, z);
    for (const edge of edges) {
      const a = corners[edge], b = corners[(edge + 1) % 4];
      // Both the bank and shallow-water strip stay inside the existing water tile.
      ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b);
      ctx.lineTo(b[0] * .7, b[1] * .7); ctx.lineTo(a[0] * .7, a[1] * .7); ctx.closePath();
      ctx.fillStyle = 'rgba(133,181,173,.24)'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b);
      ctx.lineTo(b[0] * .88, b[1] * .88); ctx.lineTo(a[0] * .88, a[1] * .88); ctx.closePath();
      ctx.fillStyle = colors[0]; ctx.fill();
      ctx.beginPath(); ctx.moveTo(a[0] * .87, a[1] * .87);
      ctx.lineTo(b[0] * .87, b[1] * .87); ctx.strokeStyle = colors[1]; ctx.globalAlpha = .55;
      ctx.lineWidth = .65; ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  drawRallyPoints(game) {
    const ctx=this.ctx,z=game.camera.zoom;
    for(const b of game.selection){if(!game.canSetRally(b)||!b.rally)continue;
      const from=this.screen(game,b.x+b.w/2,b.y+b.h/2),p=this.screen(game,b.rally.x,b.rally.y);
      ctx.save();ctx.strokeStyle='#e6ca7d';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.setLineDash([]);
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y-32*z);ctx.stroke();ctx.fillStyle='#77a8ad';ctx.beginPath();ctx.moveTo(p.x,p.y-32*z);ctx.lineTo(p.x+16*z,p.y-27*z);ctx.lineTo(p.x,p.y-22*z);ctx.closePath();ctx.fill();ctx.restore();
    }
  }

  drawGroundMarks(game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    const hero = game.hero;
    if (hero?.alive) {
      const p = this.screen(game, hero.x, hero.y);
      const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
      ctx.save();
      ctx.strokeStyle = `rgba(232,201,126,${0.24 + 0.14 * pulse})`;
      ctx.lineWidth = Math.max(1, 1.2 * z);
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 20 * z, 10 * z, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(244,226,184,${0.4 + 0.2 * pulse})`;
      ctx.lineWidth = Math.max(1, 1.4 * z);
      for (const [x1, y1, x2, y2] of [[-22, 0, -26, 0], [22, 0, 26, 0], [0, -13, 0, -16], [0, 13, 0, 16]]) {
        ctx.beginPath();
        ctx.moveTo(p.x + x1 * z, p.y + y1 * z);
        ctx.lineTo(p.x + x2 * z, p.y + y2 * z);
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(232,201,126,${0.5 + 0.25 * pulse})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 58 * z);
      ctx.lineTo(p.x + 4.5 * z, p.y - 50 * z);
      ctx.lineTo(p.x, p.y - 53 * z);
      ctx.lineTo(p.x - 4.5 * z, p.y - 50 * z);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    for (const u of game.units) {
      if (!u.alive) continue;
      if (u.selected) {
        const p = this.screen(game, u.x, u.y);
        ctx.save();
        ctx.strokeStyle = 'rgba(241,205,123,0.9)';
        ctx.lineWidth = Math.max(1, 1.4 * z);
        ctx.setLineDash([5 * z, 4 * z]);
        ctx.lineDashOffset = -time * 16;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 16 * z + (u.type === 'knight' ? 6 * z : 0), 7 * z, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255,224,151,0.16)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 19 * z, 9 * z, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    for (const b of game.buildings) {
      if (!b.alive || !b.selected) continue;
      const A = this.screen(game, b.x, b.y), B = this.screen(game, b.x + b.w, b.y);
      const C = this.screen(game, b.x + b.w, b.y + b.h), D = this.screen(game, b.x, b.y + b.h);
      ctx.save();
      ctx.strokeStyle = 'rgba(242,207,126,0.9)';
      ctx.lineWidth = Math.max(1, 1.6 * z);
      ctx.setLineDash([7 * z, 5 * z]);
      ctx.lineDashOffset = -time * 14;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.lineTo(D.x, D.y); ctx.closePath(); ctx.stroke();
      ctx.restore();
    }
    if (game.hovered && game.hovered.alive && game.hovered !== game.selected) {
      const obj = game.hovered;
      const isBuilding = obj.w !== undefined;
      const p = this.screen(game, obj.x + (isBuilding ? obj.w / 2 : 0), obj.y + (isBuilding ? obj.h / 2 : 0));
      ctx.save();
      ctx.strokeStyle = 'rgba(244,223,167,0.58)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (isBuilding) ctx.ellipse(p.x, p.y + 10 * z, (obj.w + obj.h) * 14 * z, (obj.w + obj.h) * 7 * z, 0, 0, Math.PI * 2);
      else ctx.ellipse(p.x, p.y, 14 * z, 6 * z, 0, 0, Math.PI * 2);
      ctx.stroke(); ctx.restore();
    }
    if (game.hoveredResource && game.hoveredResource.alive) {
      const n = game.hoveredResource;
      const p = this.screen(game, n.x, n.y);
      ctx.save();
      ctx.strokeStyle = 'rgba(229,204,139,0.42)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 17 * z, 8 * z, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }

  drawZones(game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    for (const zone of game.zones) {
      const p = this.screen(game, zone.x, zone.y);
      const strike = bossStrikeVisual(zone);
      const rx = (strike?.radiusX ?? zone.r * 32) * z, ry = (strike?.radiusY ?? zone.r * 16) * z;
      const persist = !!zone.persist;
      const progress = persist ? 1 : Math.min(1, zone.elapsed / zone.delay);
      const alpha = persist ? 0.18 : zone.done ? Math.max(0, 1 - (zone.elapsed - zone.delay) / 0.9) : 0.12 + progress * 0.2;
      ctx.save();
      const tint = zone.kind === 'smoke' ? '120,120,120' : zone.kind === 'net' ? '150,120,60' : zone.kind === 'drain' ? '90,150,90' : '171,48,35';
      ctx.fillStyle = `rgba(${tint},${alpha * 0.5})`;
      ctx.strokeStyle = persist ? `rgba(${tint},${alpha + 0.25})` : zone.done ? `rgba(255,198,153,${alpha})` : `rgba(224,92,69,${0.45 + progress * 0.45})`;
      ctx.lineWidth = (zone.done ? 2.4 : 1.6) * z;
      ctx.setLineDash(zone.done || persist ? [] : [8 * z, 5 * z]);
      ctx.lineDashOffset = -time * 14;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = `rgba(245,186,135,${0.5 + progress * 0.4})`;
      ctx.lineWidth = 2.2 * z;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, rx * progress, ry * progress, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (strike) this.drawBossStrike(zone, strike, p, z);
      ctx.restore();
    }
  }

  drawBossStrike(zone, visual, p, z) {
    const ctx = this.ctx, rx = visual.radiusX * z, ry = visual.radiusY * z;
    ctx.strokeStyle = `rgba(${visual.tint},${visual.fade * .85})`;
    ctx.fillStyle = `rgba(${visual.tint},${visual.fade * .14})`;
    ctx.lineWidth = (zone.done ? 2.8 : 2) * z;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    // Inward ticks preserve the exact existing damage footprint.
    for (let i = 0; i < visual.spokes; i++) {
      const a = i * Math.PI * 2 / visual.spokes, c = Math.cos(a), s = Math.sin(a);
      ctx.beginPath(); ctx.moveTo(p.x + c * rx, p.y + s * ry);
      ctx.lineTo(p.x + c * rx * .83, p.y + s * ry * .83); ctx.stroke();
    }
    const lift = (zone.done ? 64 * visual.fade : 12 + visual.progress * 35) * z;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - lift); ctx.stroke();
    const cy = p.y - lift, width = (zone.done ? 17 : 8) * z;
    ctx.beginPath(); ctx.moveTo(p.x, cy - width); ctx.lineTo(p.x + width * .7, cy);
    ctx.lineTo(p.x, cy + width); ctx.lineTo(p.x - width * .7, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (!zone.done) {
      ctx.beginPath(); ctx.ellipse(p.x, p.y, rx * .7, ry * .7, 0, -Math.PI / 2, -Math.PI / 2 + visual.progress * Math.PI * 2); ctx.stroke();
    }
  }

  drawCommandMarkers(game) {
    const ctx = this.ctx, z = game.camera.zoom;
    for (const m of game.commandMarkers) {
      const p = this.screen(game, m.x, m.y);
      const t = m.life / m.maxLife;
      ctx.save();
      ctx.strokeStyle = m.hostile ? `rgba(224,106,83,${t * 0.9})` : `rgba(231,205,139,${t * 0.8})`;
      ctx.lineWidth = 1.5 * z;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, (10 + (1 - t) * 13) * z, (5 + (1 - t) * 6) * z, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = m.hostile ? `rgba(224,106,83,${t * 0.7})` : `rgba(245,215,145,${t * 0.7})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5 * z * t, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  drawSelectionMarks(game) {
    const preview = game.heroSkillPreview;
    const hero = game.hero;
    if (!preview || !hero?.alive) return;
    const ctx = this.ctx, z = game.camera.zoom;
    const p = this.screen(game, hero.x, hero.y);
    const rx = preview.radius * 32 * z;
    const ry = preview.radius * 16 * z;
    ctx.save();
    ctx.fillStyle = `rgba(${preview.rangeColor},0.08)`;
    ctx.strokeStyle = `rgba(${preview.rangeColor},0.82)`;
    ctx.lineWidth = Math.max(1, 1.6 * z);
    ctx.setLineDash([8 * z, 5 * z]);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(${preview.rangeColor},0.28)`;
    ctx.lineWidth = Math.max(1, 1 * z);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, rx * 0.55, ry * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawResource(n, game, time) {
    const p = this.screen(game, n.x, n.y);
    const z = game.camera.zoom;
    if (p.x < -150 || p.x > this.w + 150 || p.y < -150 || p.y > this.h + 180) return;
    if (n.kind === 'oak' || n.kind === 'pine') this.drawTree(n, p, z, time);
    else if (n.kind === 'gold') this.drawGold(n, p, z, time);
    else if (n.kind === 'stone') this.drawStone(n, p, z, time);
    else if (n.kind === 'berry') this.drawBerry(n, p, z, time);
    else if (n.kind === 'sheep') this.drawSheep(n, p, z, time);
  }

  drawTree(n, p, z, time) {
    const ctx = this.ctx;
    const sway = Math.sin(time * 0.7 + n.phase) * 1.3 * z;
    const s = z * n.scale;
    ctx.save();
    ctx.fillStyle = 'rgba(7,11,5,0.3)';
    ctx.beginPath(); ctx.ellipse(p.x + 6 * s, p.y + 1.5 * s, 25 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#44301e'; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + sway * 0.4, p.y - 27 * s); ctx.stroke();
    ctx.strokeStyle = '#6f4e2e'; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(p.x - 1 * s, p.y); ctx.lineTo(p.x + sway * 0.4 - 1 * s, p.y - 27 * s); ctx.stroke();
    if (n.kind === 'pine') {
      for (let i = 0; i < 4; i++) {
        const w = (28 - i * 5.5) * s;
        const y = p.y - (20 + i * 12) * s;
        ctx.fillStyle = i % 2 ? '#2f4c2d' : '#3a5b31';
        ctx.beginPath();
        ctx.moveTo(p.x + sway * (0.35 + i * 0.1), y - 16 * s);
        ctx.lineTo(p.x - w, y + 8 * s);
        ctx.lineTo(p.x + w, y + 8 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(155,180,100,0.13)';
        ctx.beginPath();
        ctx.moveTo(p.x + sway * 0.4, y - 15 * s);
        ctx.lineTo(p.x - w * 0.36, y + 5 * s);
        ctx.lineTo(p.x + w * 0.2, y + 2 * s);
        ctx.closePath(); ctx.fill();
      }
    } else {
      const blobs = [
        [-15, -39, 18], [2, -47, 19], [17, -37, 15], [-5, -30, 17], [8, -57, 13], [-17, -50, 12],
      ];
      for (const [ox, oy, r] of blobs) {
        ctx.fillStyle = '#314c28';
        ctx.beginPath(); ctx.arc(p.x + (ox + sway * 0.6) * s, p.y + oy * s, (r + 2) * s, 0, Math.PI * 2); ctx.fill();
      }
      for (const [ox, oy, r] of blobs) {
        ctx.fillStyle = '#496b34';
        ctx.beginPath(); ctx.arc(p.x + (ox + sway * 0.6 - 1) * s, p.y + oy * s - 2 * s, (r - 2) * s, 0, Math.PI * 2); ctx.fill();
      }
      for (const [ox, oy, r] of blobs.slice(0, 4)) {
        ctx.fillStyle = 'rgba(138,167,79,0.4)';
        ctx.beginPath(); ctx.arc(p.x + (ox - r * 0.3 + sway * 0.6) * s, p.y + (oy - r * 0.35) * s, r * 0.33 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (n.amount < n.maxAmount * 0.5) {
      ctx.fillStyle = 'rgba(20,24,13,0.5)';
      ctx.beginPath(); ctx.ellipse(p.x - 8 * s, p.y - 27 * s, 6 * s, 2 * s, -0.4, 0, 6.3); ctx.fill();
    }
    ctx.restore();
  }

  drawGold(n, p, z, time) {
    const ctx = this.ctx;
    const s = z * n.scale;
    const glint = 0.65 + Math.sin(time * 2 + n.phase) * 0.25;
    ctx.save();
    ctx.fillStyle = 'rgba(7,10,4,0.3)';
    ctx.beginPath(); ctx.ellipse(p.x + 4 * s, p.y + 2 * s, 20 * s, 8 * s, 0, 0, 6.3); ctx.fill();
    const rocks = [[-11, -4, 12, 8], [4, -8, 13, 9], [11, -1, 10, 6], [-2, -2, 15, 9]];
    for (const [ox, oy, rw, rh] of rocks) {
      ctx.fillStyle = '#6d6a5d';
      ctx.beginPath(); ctx.ellipse(p.x + ox * s, p.y + oy * s, rw * s, rh * s, -0.15, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#898271';
      ctx.beginPath(); ctx.ellipse(p.x + (ox - 2) * s, p.y + (oy - 2) * s, rw * 0.62 * s, rh * 0.55 * s, -0.15, 0, 6.3); ctx.fill();
    }
    const veins = [[-13, -4], [-7, -8], [2, -7], [8, -4], [13, 0], [-3, -1], [6, -9], [1, -11]];
    for (let i = 0; i < veins.length; i++) {
      const [vx, vy] = veins[i];
      ctx.fillStyle = i % 3 === 0 ? `rgba(255,217,99,${glint})` : '#c49a3e';
      ctx.beginPath(); ctx.arc(p.x + vx * s, p.y + vy * s, (1.2 + (i % 2)) * s, 0, 6.3); ctx.fill();
    }
    if (n.amount <= 0) { ctx.globalAlpha = 0.4; }
    ctx.restore();
  }

  drawStone(n, p, z, time) {
    const ctx = this.ctx;
    const s = z * n.scale;
    ctx.save();
    ctx.fillStyle = 'rgba(7,10,4,0.3)';
    ctx.beginPath(); ctx.ellipse(p.x + 4 * s, p.y + 2 * s, 20 * s, 8 * s, 0, 0, 6.3); ctx.fill();
    for (const [ox, oy, r] of [[-10, -4, 11], [4, -8, 13], [12, -1, 8], [-1, 0, 10]]) {
      ctx.fillStyle = '#686758';
      ctx.beginPath(); ctx.arc(p.x + ox * s, p.y + oy * s, r * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#8b8978';
      ctx.beginPath(); ctx.arc(p.x + (ox - r * 0.2) * s, p.y + (oy - r * 0.3) * s, r * 0.58 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(197,193,170,0.35)';
      ctx.beginPath(); ctx.arc(p.x + (ox - r * 0.35) * s, p.y + (oy - r * 0.45) * s, r * 0.23 * s, 0, 6.3); ctx.fill();
    }
    ctx.restore();
  }

  drawBerry(n, p, z, time) {
    const ctx = this.ctx;
    const s = z * n.scale;
    ctx.save();
    ctx.fillStyle = 'rgba(7,10,4,0.28)';
    ctx.beginPath(); ctx.ellipse(p.x + 3 * s, p.y + 2 * s, 17 * s, 6 * s, 0, 0, 6.3); ctx.fill();
    for (const [ox, oy, r] of [[-9, -10, 10], [1, -14, 11], [10, -9, 9], [-2, -7, 10]]) {
      ctx.fillStyle = '#3e5d2d';
      ctx.beginPath(); ctx.arc(p.x + ox * s, p.y + oy * s, r * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#597d37';
      ctx.beginPath(); ctx.arc(p.x + (ox - 1) * s, p.y + (oy - 2) * s, r * 0.7 * s, 0, 6.3); ctx.fill();
    }
    for (let i = 0; i < 11; i++) {
      const a = hash2(n.id, i, 4) * 6.28, r = (4 + hash2(n.id, i, 6) * 11) * s;
      ctx.fillStyle = i % 3 === 0 ? '#d06856' : '#a83c36';
      ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * r, p.y - 10 * s + Math.sin(a) * r * 0.55, 1.6 * s, 0, 6.3); ctx.fill();
    }
    ctx.restore();
  }

  drawSheep(n, p, z, time) {
    const ctx = this.ctx;
    const s = z * n.scale;
    const bob = Math.sin(time * 1.3 + n.phase) * 0.6;
    ctx.save();
    ctx.fillStyle = 'rgba(7,10,4,0.25)';
    ctx.beginPath(); ctx.ellipse(p.x + 2 * s, p.y + 2 * s, 13 * s, 5 * s, 0, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#4d4031'; ctx.lineWidth = 1.5 * s;
    for (const ox of [-7, -2, 5, 9]) { ctx.beginPath(); ctx.moveTo(p.x + ox * s, p.y - 2 * s); ctx.lineTo(p.x + ox * s, p.y + 1 * s); ctx.stroke(); }
    ctx.fillStyle = '#d5c8aa';
    ctx.beginPath(); ctx.ellipse(p.x, p.y - 9 * s + bob, 12 * s, 8 * s, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#e8ddc5';
    for (const [ox, oy, r] of [[-7, -10], [0, -13], [6, -9], [-2, -7]]) {
      ctx.beginPath(); ctx.arc(p.x + ox * s, p.y + oy * s + bob, r * 0.5 * s, 0, 6.3); ctx.fill();
    }
    ctx.fillStyle = '#403b33';
    ctx.beginPath(); ctx.ellipse(p.x + 12 * s, p.y - 13 * s + bob, 5 * s, 4 * s, 0.2, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#6f665a';
    ctx.beginPath(); ctx.arc(p.x + 14 * s, p.y - 14 * s + bob, 1.2 * s, 0, 6.3); ctx.fill();
    ctx.restore();
  }

  drawBuilding(b, game, time) {
    const p = this.screen(game, b.x + b.w / 2, b.y + b.h / 2);
    if (p.x < -250 || p.x > this.w + 250 || p.y < -250 || p.y > this.h + 250) return;
    if (b.construction < 1) { this.drawConstruction(b, game, time); return; }
    if (b.type === 'core') this.drawTownCenter(b, game, time);
    else if (b.type === 'house') this.drawHouse(b, game, time);
    else if (b.type === 'barracks') this.drawBarracks(b, game, time);
    else if (b.type === 'tower') this.drawTower(b, game, time);
    else if (b.type === 'farm') this.drawFarm(b, game, time);
    else if (b.type === 'range') this.drawArcheryRange(b, game, time);
    else if (b.type === 'stable') this.drawStable(b, game, time);
    else if (b.type === 'wall') this.drawWall(b, game, time);
    else if (b.type === 'gate') this.drawGate(b, game, time);
    else if (b.type === 'fishing_hut') this.drawHouse(b, game, time);
    else this.drawBarracks(b, game, time);
    if (b.team === 'player' && !['farm', 'wall', 'gate'].includes(b.type)) this.drawCivilizationBuildingAccent(b, game, time);
    this.drawBuildingDamageState(b, game, time);
    this.drawBuildingBar(b, game);
  }

  drawBuildingDamageState(b, game, time) {
    const state = buildingVisualState(b);
    if (state !== 'damaged' && state !== 'critical') return;
    const ctx = this.ctx, z = game.camera.zoom, f = this.footprint(game, b);
    const damage = 1 - clamp(b.hp / Math.max(1, b.maxHp), 0, 1);
    const frontX = f.C.x + (hash2(b.id || 1, 3, 19) - 0.5) * 32 * z;
    const frontY = f.C.y - (16 + hash2(b.id || 1, 5, 23) * 18) * z;
    ctx.save();
    ctx.strokeStyle = `rgba(49,35,25,${0.45 + damage * 0.35})`;
    ctx.lineWidth = Math.max(1, 1.25 * z);
    ctx.beginPath();
    ctx.moveTo(frontX, frontY - 13 * z);
    ctx.lineTo(frontX - 4 * z, frontY - 6 * z);
    ctx.lineTo(frontX + 2 * z, frontY);
    ctx.lineTo(frontX - 5 * z, frontY + 8 * z);
    ctx.moveTo(frontX - 3 * z, frontY - 5 * z);
    ctx.lineTo(frontX - 10 * z, frontY - 1 * z);
    ctx.moveTo(frontX + 1 * z, frontY);
    ctx.lineTo(frontX + 9 * z, frontY + 4 * z);
    ctx.stroke();
    if (state === 'critical') {
      const pulse = 0.55 + Math.sin(time * 5 + (b.id || 0)) * 0.2;
      ctx.fillStyle = 'rgba(33,24,20,0.82)';
      ctx.beginPath();
      ctx.moveTo(f.cx - 14 * z, f.cy - 48 * z);
      ctx.lineTo(f.cx - 2 * z, f.cy - 61 * z);
      ctx.lineTo(f.cx + 11 * z, f.cy - 49 * z);
      ctx.lineTo(f.cx + 4 * z, f.cy - 37 * z);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(230,117,52,${pulse})`;
      for (let i = 0; i < 3; i++) {
        const ox = (hash2(b.id || 1, i, 31) - 0.5) * 18 * z;
        const oy = (4 + ((time * (7 + i) + i * 3) % 13)) * z;
        ctx.beginPath(); ctx.arc(f.cx + ox, f.cy - 35 * z - oy, (1.1 + i * 0.25) * z, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  drawCivilizationBuildingAccent(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom, f = this.footprint(game, b);
    const profile = civilizationVisualProfile(game.civ?.id);
    const height = ({ core: 116, tower: 92, monument: 100, house: 57, fishing_hut: 57 }[b.type] || 68) * z;
    const x = f.cx, y = f.cy - height;
    ctx.save();
    ctx.strokeStyle = game.playerColors?.accent || game.civ?.accent || '#c8aa68';
    ctx.fillStyle = game.civ?.accent || '#82643a';
    ctx.lineWidth = Math.max(1, 1.7 * z);
    if (profile.roof === 'swallowtail') {
      ctx.beginPath(); ctx.moveTo(x, y + 15 * z); ctx.lineTo(x, y - 10 * z); ctx.stroke();
      const flutter = Math.sin(time * 2.4 + (b.id || 0)) * 2 * z;
      ctx.beginPath(); ctx.moveTo(x, y - 9 * z); ctx.lineTo(x + 17 * z, y - 4 * z + flutter); ctx.lineTo(x + 11 * z, y + 1 * z); ctx.lineTo(x + 17 * z, y + 5 * z + flutter); ctx.lineTo(x, y + 1 * z); ctx.closePath(); ctx.fill();
    } else if (profile.roof === 'dome') {
      ctx.beginPath(); ctx.arc(x, y + 3 * z, 10 * z, Math.PI, 0); ctx.lineTo(x + 10 * z, y + 7 * z); ctx.lineTo(x - 10 * z, y + 7 * z); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y - 10 * z); ctx.lineTo(x, y + 1 * z); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 3 * z, y - 11 * z, 3 * z, 0.45, Math.PI * 1.7); ctx.stroke();
    } else if (profile.roof === 'upturned') {
      ctx.beginPath(); ctx.moveTo(x - 16 * z, y + 6 * z); ctx.quadraticCurveTo(x - 9 * z, y + 12 * z, x, y + 4 * z); ctx.quadraticCurveTo(x + 9 * z, y + 12 * z, x + 16 * z, y + 6 * z); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 13 * z, y); ctx.quadraticCurveTo(x, y + 8 * z, x + 13 * z, y); ctx.stroke();
    } else if (profile.roof === 'stepped') {
      ctx.beginPath(); ctx.moveTo(x - 13 * z, y + 9 * z); ctx.lineTo(x - 13 * z, y + 3 * z); ctx.lineTo(x - 7 * z, y + 3 * z); ctx.lineTo(x - 7 * z, y - 3 * z); ctx.lineTo(x, y - 3 * z); ctx.lineTo(x, y - 10 * z); ctx.lineTo(x + 7 * z, y - 3 * z); ctx.lineTo(x + 7 * z, y + 3 * z); ctx.lineTo(x + 13 * z, y + 3 * z); ctx.lineTo(x + 13 * z, y + 9 * z); ctx.closePath(); ctx.fill();
    } else {
      for (let i = -2; i <= 2; i++) ctx.fillRect(x + i * 6 * z - 2 * z, y + (Math.abs(i) % 2) * 2 * z, 4 * z, 8 * z);
      ctx.strokeRect(x - 16 * z, y + 7 * z, 32 * z, 5 * z);
    }
    ctx.restore();
    // Apply materials to the actual wall planes instead of a floating roof badge.
    if (b.type === 'house' || b.type === 'barracks') {
      const wallHeight = (b.type === 'house' ? 25 : 33) * z;
      const width = (b.type === 'house' ? 46 : 56) * z;
      for (const [a, c] of [[f.D, f.C], [f.C, f.B]]) {
        ctx.save();
        ctx.transform((c.x - a.x) / width, (c.y - a.y) / width, 0, 1, a.x, a.y);
        ctx.beginPath(); ctx.rect(0, -wallHeight, width, wallHeight); ctx.clip();
        this.drawCivilizationWallMaterial(b, profile, z);
        ctx.restore();
      }
    }
  }

  drawCivilizationWallMaterial(b, profile, z) {
    const ctx = this.ctx;
    const military = ['barracks', 'range', 'stable', 'tower'].includes(b.type);
    const span = (military ? 28 : 23) * z, x = span, base = -7 * z;
    ctx.lineWidth = Math.max(1, z);
    if (profile.id === 'steppe') {
      ctx.fillStyle = '#c5b38b';
      ctx.beginPath(); ctx.moveTo(x-span,base); ctx.lineTo(x,base-21*z); ctx.lineTo(x+span,base); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#60452b';
      for (let i=-2;i<=2;i++) { ctx.beginPath();ctx.moveTo(x+i*span/3,base);ctx.lineTo(x,base-21*z);ctx.stroke(); }
    } else if (profile.id === 'fortress') {
      ctx.fillStyle='#8e8977';ctx.fillRect(x-span,base-16*z,span*2,17*z);
      ctx.strokeStyle='#514d43';
      for(let row=0;row<3;row++){ctx.beginPath();ctx.moveTo(x-span,base-row*6*z);ctx.lineTo(x+span,base-row*6*z);ctx.stroke();}
      for(let i=-2;i<=2;i++)ctx.strokeRect(x+i*9*z,base-16*z,8*z,16*z);
    } else if (profile.id === 'desert') {
      ctx.fillStyle='#cfb88c';ctx.fillRect(x-span,base-18*z,span*2,20*z);
      ctx.fillStyle='#473f31';
      for(let i=-1;i<=1;i++){ctx.beginPath();ctx.arc(x+i*14*z,base-7*z,5*z,Math.PI,0);ctx.lineTo(x+i*14*z+5*z,base+2*z);ctx.lineTo(x+i*14*z-5*z,base+2*z);ctx.fill();}
    } else if (profile.id === 'eastern') {
      ctx.fillStyle='#733f2c';
      for(let i=-1;i<=1;i++)ctx.fillRect(x+i*span-2*z,base-21*z,4*z,24*z);
      ctx.strokeStyle='#c7a45e';ctx.beginPath();ctx.moveTo(x-span-5*z,base-21*z);ctx.quadraticCurveTo(x,base-10*z,x+span+5*z,base-21*z);ctx.stroke();
      ctx.fillStyle='#d1bc87';ctx.fillRect(x-span+4*z,base-11*z,span*2-8*z,5*z);
    } else {
      ctx.fillStyle='#a29a78';
      for(let tier=0;tier<3;tier++)ctx.fillRect(x-span+tier*6*z,base-tier*7*z,span*2-tier*12*z,7*z);
      ctx.strokeStyle='#40544b';ctx.lineWidth=3*z;ctx.strokeRect(x-6*z,base-13*z,12*z,13*z);
    }
    if(military){ctx.strokeStyle='#dbc98f';ctx.beginPath();ctx.moveTo(x-6*z,base-12*z);ctx.lineTo(x+6*z,base);ctx.moveTo(x+6*z,base-12*z);ctx.lineTo(x-6*z,base);ctx.stroke();}
  }

  drawBuildingRuin(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom, f = this.footprint(game, b);
    this.drawPlatform(f, z, '#585346');
    this.prism(f, 5 * z, '#544b3d', '#675d4a', '#716754');
    ctx.save();
    ctx.fillStyle = 'rgba(27,23,18,0.34)';
    ctx.beginPath(); ctx.ellipse(f.cx + 5 * z, f.cy + 5 * z, 39 * z, 13 * z, 0, 0, Math.PI * 2); ctx.fill();
    const colors = ['#786d59', '#95866b', '#5f5748', '#493a2b'];
    for (let i = 0; i < 13; i++) {
      const x = f.cx + (hash2(b.id || 1, i, 41) - 0.5) * 70 * z;
      const y = f.cy + (hash2(b.id || 1, i, 43) - 0.45) * 23 * z;
      const w = (4 + hash2(b.id || 1, i, 47) * 9) * z;
      const h = (2 + hash2(b.id || 1, i, 53) * 5) * z;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h, Math.max(1, z)); ctx.fill();
    }
    ctx.strokeStyle = '#4b3322'; ctx.lineWidth = 3 * z;
    ctx.beginPath(); ctx.moveTo(f.cx - 27 * z, f.cy - 2 * z); ctx.lineTo(f.cx + 20 * z, f.cy - 30 * z); ctx.stroke();
    ctx.lineWidth = 2 * z;
    ctx.beginPath(); ctx.moveTo(f.cx - 12 * z, f.cy - 24 * z); ctx.lineTo(f.cx + 29 * z, f.cy + 1 * z); ctx.stroke();
    ctx.restore();
    this.drawDamageSmoke(f, z, time, 1);
  }

  footprint(game, b) {
    const A = this.screen(game, b.x, b.y);
    const B = this.screen(game, b.x + b.w, b.y);
    const C = this.screen(game, b.x + b.w, b.y + b.h);
    const D = this.screen(game, b.x, b.y + b.h);
    return { A, B, C, D, cx: (A.x + C.x) / 2, cy: (A.y + C.y) / 2 };
  }

  drawPlatform(f, z, fill = '#827c69') {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(8,11,6,0.28)';
    ctx.beginPath();
    ctx.moveTo(f.A.x + 6 * z, f.A.y + 4 * z); ctx.lineTo(f.B.x + 8 * z, f.B.y + 5 * z);
    ctx.lineTo(f.C.x + 6 * z, f.C.y + 8 * z); ctx.lineTo(f.D.x - 2 * z, f.D.y + 5 * z); ctx.closePath(); ctx.fill();
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.moveTo(f.A.x, f.A.y); ctx.lineTo(f.B.x, f.B.y); ctx.lineTo(f.C.x, f.C.y); ctx.lineTo(f.D.x, f.D.y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(41,37,28,0.35)'; ctx.lineWidth = 1 * z; ctx.stroke();
    ctx.fillStyle = 'rgba(255,247,210,0.08)';
    ctx.beginPath(); ctx.moveTo(f.A.x, f.A.y); ctx.lineTo(f.B.x, f.B.y); ctx.lineTo(f.C.x - (f.C.x - f.A.x) * 0.25, f.C.y - (f.C.y - f.A.y) * 0.25); ctx.lineTo(f.D.x + (f.C.x - f.A.x) * 0.25, f.D.y + (f.C.y - f.A.y) * 0.25); ctx.closePath(); ctx.fill();
  }

  prism(f, height, left, right, top = null) {
    const ctx = this.ctx;
    const lift = p => ({ x: p.x, y: p.y - height });
    const A1 = lift(f.A), B1 = lift(f.B), C1 = lift(f.C), D1 = lift(f.D);
    ctx.fillStyle = left;
    ctx.beginPath(); ctx.moveTo(f.D.x, f.D.y); ctx.lineTo(f.C.x, f.C.y); ctx.lineTo(C1.x, C1.y); ctx.lineTo(D1.x, D1.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = right;
    ctx.beginPath(); ctx.moveTo(f.C.x, f.C.y); ctx.lineTo(f.B.x, f.B.y); ctx.lineTo(B1.x, B1.y); ctx.lineTo(C1.x, C1.y); ctx.closePath(); ctx.fill();
    if (top) {
      ctx.fillStyle = top;
      ctx.beginPath(); ctx.moveTo(A1.x, A1.y); ctx.lineTo(B1.x, B1.y); ctx.lineTo(C1.x, C1.y); ctx.lineTo(D1.x, D1.y); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(48,38,24,0.24)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(D1.x, D1.y); ctx.lineTo(C1.x, C1.y); ctx.lineTo(B1.x, B1.y); ctx.stroke();
    return { A1, B1, C1, D1 };
  }

  roof(f, height, roofHeight, color, lightColor, darkColor) {
    const ctx = this.ctx;
    const A1 = { x: f.A.x, y: f.A.y - height }, B1 = { x: f.B.x, y: f.B.y - height };
    const C1 = { x: f.C.x, y: f.C.y - height }, D1 = { x: f.D.x, y: f.D.y - height };
    const apex = { x: f.cx, y: f.cy - height - roofHeight };
    const expand = (p, k) => ({ x: f.cx + (p.x - f.cx) * k, y: f.cy + (p.y - f.cy) * k });
    const A2 = expand(A1, 1.07), B2 = expand(B1, 1.07), C2 = expand(C1, 1.07), D2 = expand(D1, 1.07);
    const apex2 = { x: apex.x, y: apex.y - 2 };
    ctx.fillStyle = darkColor;
    ctx.beginPath(); ctx.moveTo(A2.x, A2.y); ctx.lineTo(D2.x, D2.y); ctx.lineTo(apex2.x, apex2.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(D2.x, D2.y); ctx.lineTo(C2.x, C2.y); ctx.lineTo(apex2.x, apex2.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lightColor;
    ctx.beginPath(); ctx.moveTo(C2.x, C2.y); ctx.lineTo(B2.x, B2.y); ctx.lineTo(apex2.x, apex2.y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(55,28,18,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(D2.x, D2.y); ctx.lineTo(apex2.x, apex2.y); ctx.lineTo(B2.x, B2.y); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,217,153,0.13)';
    ctx.beginPath(); ctx.moveTo(C2.x, C2.y); ctx.lineTo(apex2.x, apex2.y); ctx.stroke();
    return { apex: apex2, A2, B2, C2, D2 };
  }

  drawTownCenter(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    const f = this.footprint(game, b);
    this.drawPlatform(f, z, '#827a66');
    this.prism(f, 10 * z, '#5f5a4c', '#77705d', '#8e866f');
    const walls = this.prism({
      A: { x: f.A.x, y: f.A.y - 10 * z }, B: { x: f.B.x, y: f.B.y - 10 * z },
      C: { x: f.C.x, y: f.C.y - 10 * z }, D: { x: f.D.x, y: f.D.y - 10 * z },
      cx: f.cx, cy: f.cy - 10 * z,
    }, 46 * z, '#978a6e', '#b3a482', '#bdb08d');
    const roof = this.roof({
      A: { x: f.A.x, y: f.A.y - 56 * z }, B: { x: f.B.x, y: f.B.y - 56 * z },
      C: { x: f.C.x, y: f.C.y - 56 * z }, D: { x: f.D.x, y: f.D.y - 56 * z },
      cx: f.cx, cy: f.cy - 56 * z,
    }, 0, 40 * z, '#7d3b2f', '#9c4b39', '#5e2c26');
    this.drawTimberBeams(f, walls, 46 * z, z);
    const wallTop = f.cy - 56 * z;
    const doorY = f.C.y - 10 * z;
    ctx.fillStyle = '#3b2b1c';
    ctx.beginPath();
    ctx.moveTo(f.C.x - 8 * z, doorY); ctx.lineTo(f.C.x + 8 * z, doorY);
    ctx.lineTo(f.C.x + 8 * z, doorY - 20 * z); ctx.quadraticCurveTo(f.C.x, doorY - 30 * z, f.C.x - 8 * z, doorY - 20 * z); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8a6b3c'; ctx.lineWidth = 1.2 * z;
    ctx.beginPath(); ctx.moveTo(f.C.x, doorY); ctx.lineTo(f.C.x, doorY - 24 * z); ctx.stroke();
    this.drawWindow(f.C.x - 35 * z, f.C.y - 34 * z, 7 * z, 10 * z, '#e8b968');
    this.drawWindow(f.C.x + 35 * z, f.C.y - 34 * z, 7 * z, 10 * z, '#d6a353');
    this.drawWindow(f.C.x + 1 * z, f.C.y - 47 * z, 5 * z, 7 * z, '#f0c87a');

    const towerBaseY = roof.apex.y + 2 * z;
    ctx.fillStyle = '#95886d';
    ctx.fillRect(f.cx - 12 * z, towerBaseY - 49 * z, 24 * z, 50 * z);
    ctx.fillStyle = '#716652';
    ctx.fillRect(f.cx + 2 * z, towerBaseY - 49 * z, 10 * z, 50 * z);
    ctx.fillStyle = '#5e2c26';
    ctx.beginPath(); ctx.moveTo(f.cx - 17 * z, towerBaseY - 49 * z); ctx.lineTo(f.cx, towerBaseY - 70 * z); ctx.lineTo(f.cx + 17 * z, towerBaseY - 49 * z); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9c4b39';
    ctx.beginPath(); ctx.moveTo(f.cx, towerBaseY - 70 * z); ctx.lineTo(f.cx + 17 * z, towerBaseY - 49 * z); ctx.lineTo(f.cx + 2 * z, towerBaseY - 49 * z); ctx.closePath(); ctx.fill();
    this.drawWindow(f.cx, towerBaseY - 34 * z, 3.2 * z, 6 * z, '#efc172');
    this.flag(f.cx, towerBaseY - 70 * z, 25 * z, z, time, 0);

    const leftTowerX = f.D.x + (f.A.x - f.D.x) * 0.42;
    const leftTowerY = f.D.y + (f.A.y - f.D.y) * 0.42;
    const rightTowerX = f.B.x + (f.A.x - f.B.x) * 0.42;
    const rightTowerY = f.B.y + (f.A.y - f.B.y) * 0.42;
    this.roundTower(leftTowerX, leftTowerY - 12 * z, 12 * z, 38 * z, z);
    this.roundTower(rightTowerX, rightTowerY - 12 * z, 12 * z, 38 * z, z);

    ctx.fillStyle = 'rgba(28,38,19,0.2)'; ctx.beginPath(); ctx.ellipse(f.cx, f.cy + 8 * z, 50 * z, 16 * z, 0, 0, 6.3); ctx.fill();
    this.smokePlume(f.cx - 18 * z, towerBaseY - 78 * z, z, time, 0.7);
    this.flag(f.D.x + 8 * z, f.D.y - 11 * z, 22 * z, z, time, 1.7);
    this.flag(f.B.x - 8 * z, f.B.y - 11 * z, 19 * z, z, time, 3.2);
    if (b.hp < b.maxHp) this.drawDamageSmoke(f, z, time, 1 - b.hp / b.maxHp);
  }

  drawTimberBeams(f, top, height, z) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(74,50,27,0.62)';
    ctx.lineWidth = 2.2 * z;
    const lines = [
      [f.D, top.D1, 0.12], [f.C, top.C1, 0.12], [f.B, top.B1, 0.12],
    ];
    for (const [base, up] of lines) {
      ctx.beginPath(); ctx.moveTo(base.x, base.y - 10 * z); ctx.lineTo(up.x, up.y); ctx.stroke();
    }
    for (let i = 1; i <= 2; i++) {
      const t = i / 3;
      const x1 = lerp(f.D.x, f.C.x, t), y1 = lerp(f.D.y, f.C.y, t) - 10 * z;
      const x2 = lerp(f.C.x, f.B.x, t), y2 = lerp(f.C.y, f.B.y, t) - 10 * z;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1, y1 - height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2, y2 - height); ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(f.C.x - 30 * z, f.C.y - 14 * z); ctx.lineTo(f.C.x - 30 * z, f.C.y - 52 * z);
    ctx.moveTo(f.C.x + 26 * z, f.C.y - 13 * z); ctx.lineTo(f.C.x + 26 * z, f.C.y - 48 * z);
    ctx.stroke();
  }

  roundTower(x, y, r, h, z) {
    const ctx = this.ctx;
    ctx.fillStyle = '#776d59';
    ctx.fillRect(x - r, y - h, r * 2, h);
    ctx.fillStyle = '#9b8f72';
    ctx.fillRect(x - r, y - h, r * 0.75, h);
    ctx.fillStyle = '#615a4c';
    ctx.fillRect(x + r * 0.3, y - h, r * 0.7, h);
    ctx.fillStyle = '#6d604b';
    for (let i = -1; i <= 1; i++) ctx.fillRect(x + i * r * 0.65 - r * 0.14, y - h - 3 * z, r * 0.28, 3 * z);
    ctx.fillStyle = '#7d3b2f';
    ctx.beginPath(); ctx.moveTo(x - r * 1.2, y - h - 3 * z); ctx.lineTo(x, y - h - 22 * z); ctx.lineTo(x + r * 1.2, y - h - 3 * z); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9c4b39';
    ctx.beginPath(); ctx.moveTo(x, y - h - 22 * z); ctx.lineTo(x + r * 1.2, y - h - 3 * z); ctx.lineTo(x + 1 * z, y - h - 3 * z); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a2919';
    ctx.fillRect(x - 1.5 * z, y - h * 0.55, 3 * z, 8 * z);
  }

  drawWindow(x, y, w, h, color) {
    const ctx = this.ctx;
    ctx.fillStyle = '#3b2a18';
    ctx.beginPath(); ctx.roundRect(x - w / 2 - 1, y - h / 2 - 1, w + 2, h + 2, 1); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 1); ctx.fill();
    ctx.strokeStyle = 'rgba(63,39,16,0.8)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y - h / 2); ctx.lineTo(x, y + h / 2); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.stroke();
  }

  flag(x, y, h, z, time, phase) {
    const ctx = this.ctx;
    const wobble = Math.sin(time * 2.2 + phase) * 2.2 * z;
    ctx.strokeStyle = '#3a2c1b'; ctx.lineWidth = 1.4 * z;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
    ctx.fillStyle = '#4e777b';
    ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + 17 * z + wobble, y - h + 4 * z); ctx.lineTo(x + 14 * z + wobble * 0.5, y - h + 11 * z); ctx.lineTo(x, y - h + 9 * z); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(218,190,120,0.75)';
    ctx.beginPath(); ctx.arc(x + 8 * z + wobble * 0.5, y - h + 5.5 * z, 1.5 * z, 0, 6.3); ctx.fill();
  }

  smokePlume(x, y, z, time, scale = 1) {
    const ctx = this.ctx;
    for (let i = 0; i < 6; i++) {
      const t = ((time * 0.14 + i / 6) % 1 + 1) % 1;
      const yy = y - t * 56 * z;
      const xx = x + Math.sin(t * 5 + i) * 7 * z + t * 11 * z;
      const alpha = (1 - t) * 0.17;
      ctx.fillStyle = `rgba(190,184,164,${alpha})`;
      ctx.beginPath(); ctx.arc(xx, yy, (3 + t * 10) * z * scale, 0, 6.3); ctx.fill();
    }
  }

  drawHouse(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    const f = this.footprint(game, b);
    this.drawPlatform(f, z, '#7f7662');
    const walls = this.prism(f, 25 * z, '#a08c6e', '#baa582', '#a9916e');
    this.roof(f, 25 * z, 23 * z, '#7a3b2c', '#97503b', '#5f2c23');
    const doorX = f.C.x - 9 * z, doorY = f.C.y;
    ctx.fillStyle = '#4b321d'; ctx.fillRect(doorX - 4 * z, doorY - 17 * z, 8 * z, 17 * z);
    ctx.fillStyle = 'rgba(224,178,94,0.75)'; ctx.fillRect(doorX + 2 * z, doorY - 9 * z, 1 * z, 1 * z);
    this.drawWindow(f.C.x + 11 * z, f.C.y - 17 * z, 5 * z, 7 * z, '#d7a952');
    ctx.strokeStyle = 'rgba(79,52,26,0.68)'; ctx.lineWidth = 1.5 * z;
    ctx.beginPath(); ctx.moveTo(f.D.x, f.D.y - 8 * z); ctx.lineTo(f.D.x, f.D.y - 25 * z); ctx.moveTo(f.C.x, f.C.y - 4 * z); ctx.lineTo(f.C.x, f.C.y - 25 * z); ctx.stroke();
    ctx.fillStyle = '#62594a'; ctx.fillRect(f.cx + 7 * z, f.cy - 52 * z, 5 * z, 13 * z);
    this.smokePlume(f.cx + 9 * z, f.cy - 53 * z, z, time, 0.45);
    if (b.hp < b.maxHp) this.drawDamageSmoke(f, z, time, 1 - b.hp / b.maxHp);
  }

  drawBarracks(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    const f = this.footprint(game, b);
    this.drawPlatform(f, z, '#7b7461');
    const walls = this.prism(f, 33 * z, '#857a64', '#9f9275', '#9a8c6d');
    this.roof(f, 33 * z, 26 * z, '#6f342a', '#8b4939', '#512722');
    ctx.strokeStyle = 'rgba(68,46,24,0.75)'; ctx.lineWidth = 2.2 * z;
    ctx.beginPath(); ctx.moveTo(f.D.x + 3 * z, f.D.y - 6 * z); ctx.lineTo(f.D.x + 3 * z, f.D.y - 34 * z); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(f.C.x - 2 * z, f.C.y - 3 * z); ctx.lineTo(f.C.x - 2 * z, f.C.y - 33 * z); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(f.C.x + 24 * z, f.C.y - 3 * z); ctx.lineTo(f.C.x + 24 * z, f.C.y - 29 * z); ctx.stroke();
    ctx.fillStyle = '#3d2a18'; ctx.fillRect(f.C.x - 8 * z, f.C.y - 20 * z, 16 * z, 20 * z);
    ctx.strokeStyle = '#8f703f'; ctx.lineWidth = 1 * z;
    ctx.beginPath(); ctx.moveTo(f.C.x, f.C.y - 19 * z); ctx.lineTo(f.C.x, f.C.y - 2 * z); ctx.stroke();
    this.drawWindow(f.C.x - 28 * z, f.C.y - 21 * z, 6 * z, 8 * z, '#d19b4a');
    this.drawWindow(f.C.x + 32 * z, f.C.y - 21 * z, 6 * z, 8 * z, '#e1ac59');
    this.flag(f.C.x + 8 * z, f.C.y - 55 * z, 22 * z, z, time, 1.1);
    ctx.strokeStyle = '#5a4226'; ctx.lineWidth = 1.2 * z;
    ctx.beginPath(); ctx.moveTo(f.C.x - 35 * z, f.C.y + 3 * z); ctx.lineTo(f.C.x - 35 * z, f.C.y - 13 * z); ctx.moveTo(f.C.x - 27 * z, f.C.y + 4 * z); ctx.lineTo(f.C.x - 27 * z, f.C.y - 14 * z); ctx.stroke();
    this.shieldAt(f.C.x - 35 * z, f.C.y - 15 * z, 5 * z);
    this.shieldAt(f.C.x - 27 * z, f.C.y - 16 * z, 4 * z);
    if (b.hp < b.maxHp) this.drawDamageSmoke(f, z, time, 1 - b.hp / b.maxHp);
  }

  shieldAt(x, y, r) {
    const ctx = this.ctx;
    ctx.fillStyle = '#6a4a26';
    ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y - r * 0.3); ctx.lineTo(x + r * 0.55, y + r); ctx.lineTo(x - r * 0.55, y + r); ctx.lineTo(x - r, y - r * 0.3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c8a965';
    ctx.beginPath(); ctx.arc(x, y + r * 0.1, r * 0.24, 0, 6.3); ctx.fill();
  }

  drawTower(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    const f = this.footprint(game, b);
    this.drawPlatform(f, z, '#797260');
    const base = this.prism(f, 10 * z, '#696353', '#7f7863', '#8a826c');
    const cx = f.cx, cy = f.cy - 10 * z;
    const w = 22 * z, h = 61 * z;
    ctx.fillStyle = '#8f846d'; ctx.fillRect(cx - w / 2, cy - h, w, h);
    ctx.fillStyle = '#a89a7e'; ctx.fillRect(cx - w / 2, cy - h, w * 0.58, h);
    ctx.fillStyle = '#716856'; ctx.fillRect(cx + w * 0.16, cy - h, w * 0.34, h);
    ctx.strokeStyle = 'rgba(61,53,41,0.5)'; ctx.lineWidth = 1 * z;
    for (let i = 1; i < 5; i++) {
      const yy = cy - h * i / 5;
      ctx.beginPath(); ctx.moveTo(cx - w / 2, yy); ctx.lineTo(cx + w / 2, yy); ctx.stroke();
    }
    ctx.fillStyle = '#3a2b1a';
    ctx.fillRect(cx - 2 * z, cy - h * 0.63, 4 * z, 11 * z);
    ctx.fillStyle = '#8f846d';
    for (let i = -2; i <= 2; i++) ctx.fillRect(cx + i * 9 * z - 4 * z, cy - h - 4 * z, 8 * z, 4 * z);
    ctx.fillStyle = '#6f342a';
    ctx.beginPath(); ctx.moveTo(cx - w * 0.68, cy - h - 4 * z); ctx.lineTo(cx, cy - h - 30 * z); ctx.lineTo(cx + w * 0.68, cy - h - 4 * z); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8b4939';
    ctx.beginPath(); ctx.moveTo(cx, cy - h - 30 * z); ctx.lineTo(cx + w * 0.68, cy - h - 4 * z); ctx.lineTo(cx + 1 * z, cy - h - 4 * z); ctx.closePath(); ctx.fill();
    this.flag(cx + 2 * z, cy - h - 30 * z, 17 * z, z, time, 2.4);
    if (b.hp < b.maxHp) this.drawDamageSmoke(f, z, time, 1 - b.hp / b.maxHp);
  }

  drawFarm(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    const f = this.footprint(game, b);
    ctx.fillStyle = 'rgba(8,11,6,0.24)';
    ctx.beginPath(); ctx.moveTo(f.A.x + 4 * z, f.A.y + 3 * z); ctx.lineTo(f.B.x + 5 * z, f.B.y + 3 * z); ctx.lineTo(f.C.x + 4 * z, f.C.y + 6 * z); ctx.lineTo(f.D.x - 2 * z, f.D.y + 4 * z); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6c5732';
    ctx.beginPath(); ctx.moveTo(f.A.x, f.A.y); ctx.lineTo(f.B.x, f.B.y); ctx.lineTo(f.C.x, f.C.y); ctx.lineTo(f.D.x, f.D.y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(69,49,24,0.35)'; ctx.lineWidth = 1 * z;
    const rowCount = 6;
    for (let i = 1; i < rowCount; i++) {
      const t = i / rowCount;
      const x1 = lerp(f.A.x, f.D.x, t), y1 = lerp(f.A.y, f.D.y, t);
      const x2 = lerp(f.B.x, f.C.x, t), y2 = lerp(f.B.y, f.C.y, t);
      ctx.strokeStyle = 'rgba(47,35,18,0.6)'; ctx.lineWidth = 1.4 * z;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      const mx1 = lerp(f.A.x, f.B.x, t), my1 = lerp(f.A.y, f.B.y, t);
      const mx2 = lerp(f.D.x, f.C.x, t), my2 = lerp(f.D.y, f.C.y, t);
      ctx.strokeStyle = 'rgba(193,162,82,0.45)'; ctx.lineWidth = 0.8 * z;
      ctx.beginPath(); ctx.moveTo(mx1, my1); ctx.lineTo(mx2, my2); ctx.stroke();
    }
    for (let i = 0; i < 42; i++) {
      const ix = i % 7, iy = Math.floor(i / 7);
      const x = lerp(lerp(f.A.x, f.B.x, ix / 7), lerp(f.D.x, f.C.x, ix / 7), iy / 6);
      const y = lerp(lerp(f.A.y, f.B.y, ix / 7), lerp(f.D.y, f.C.y, ix / 7), iy / 6);
      const sway = Math.sin(time * 1.2 + i) * 0.8 * z;
      ctx.strokeStyle = i % 4 === 0 ? '#c9a958' : '#a88a43';
      ctx.lineWidth = 1 * z;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sway, y - 4 * z); ctx.stroke();
    }
    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      const x1 = lerp(f.A.x, f.D.x, t), y1 = lerp(f.A.y, f.D.y, t);
      const x2 = lerp(f.B.x, f.C.x, t), y2 = lerp(f.B.y, f.C.y, t);
      ctx.strokeStyle = '#5b4324'; ctx.lineWidth = 1.3 * z;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1, y1 - 5 * z); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2, y2 - 5 * z); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(114,83,40,0.7)'; ctx.lineWidth = 1 * z;
    ctx.beginPath(); ctx.moveTo(f.A.x, f.A.y - 5 * z); ctx.lineTo(f.B.x, f.B.y - 5 * z); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(f.A.x, f.A.y - 5 * z); ctx.lineTo(f.D.x, f.D.y - 5 * z); ctx.stroke();
    if (b.hp < b.maxHp) this.drawBuildingBar(b, game);
  }

  drawArcheryRange(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    const f = this.footprint(game, b);
    this.drawPlatform(f, z, '#766f5c');
    const walls = this.prism(f, 29 * z, '#7d755f', '#968b70', '#92866a');
    this.roof(f, 29 * z, 24 * z, '#3e5a35', '#557344', '#2d4528');
    ctx.fillStyle = '#392817'; ctx.fillRect(f.C.x - 7 * z, f.C.y - 19 * z, 14 * z, 19 * z);
    this.drawWindow(f.C.x - 29 * z, f.C.y - 18 * z, 6 * z, 8 * z, '#d6a354');
    this.drawWindow(f.C.x + 30 * z, f.C.y - 18 * z, 6 * z, 8 * z, '#e1ae5d');
    ctx.strokeStyle = '#9a7740'; ctx.lineWidth = 2 * z;
    ctx.beginPath(); ctx.arc(f.C.x + 36 * z, f.C.y - 28 * z, 8 * z, 0, 6.3); ctx.stroke();
    ctx.strokeStyle = '#d5cba7'; ctx.lineWidth = 1 * z;
    ctx.beginPath(); ctx.arc(f.C.x + 36 * z, f.C.y - 28 * z, 5 * z, 0, 6.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(f.C.x + 36 * z, f.C.y - 33 * z); ctx.lineTo(f.C.x + 36 * z, f.C.y - 23 * z); ctx.stroke();
    ctx.strokeStyle = '#6b512b'; ctx.lineWidth = 1.2 * z;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(f.D.x + (6 + i * 3) * z, f.D.y + 2 * z); ctx.lineTo(f.D.x + (10 + i * 3) * z, f.D.y - 20 * z); ctx.stroke();
    }
    this.flag(f.C.x + 4 * z, f.C.y - 52 * z, 18 * z, z, time, 1.7);
    if (b.hp < b.maxHp) this.drawDamageSmoke(f, z, time, 1 - b.hp / b.maxHp);
  }

  drawStable(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    const f = this.footprint(game, b);
    this.drawPlatform(f, z, '#7b7059');
    const walls = this.prism(f, 27 * z, '#877252', '#a08a64', '#98825e');
    this.roof(f, 27 * z, 21 * z, '#5b412e', '#75563b', '#423023');
    ctx.fillStyle = '#3c2817'; ctx.fillRect(f.C.x - 11 * z, f.C.y - 21 * z, 22 * z, 21 * z);
    ctx.fillStyle = '#624225';
    ctx.beginPath(); ctx.ellipse(f.C.x + 33 * z, f.C.y - 17 * z, 9 * z, 5 * z, 0, 0, 6.3); ctx.fill();
    ctx.fillRect(f.C.x + 27 * z, f.C.y - 17 * z, 3 * z, 10 * z);
    ctx.fillRect(f.C.x + 37 * z, f.C.y - 17 * z, 3 * z, 10 * z);
    ctx.strokeStyle = '#624225'; ctx.lineWidth = 3 * z;
    ctx.beginPath(); ctx.moveTo(f.C.x + 40 * z, f.C.y - 19 * z); ctx.lineTo(f.C.x + 44 * z, f.C.y - 27 * z); ctx.stroke();
    ctx.fillStyle = '#6f4a2b';
    ctx.beginPath(); ctx.ellipse(f.C.x + 45 * z, f.C.y - 28 * z, 4 * z, 2.4 * z, -0.4, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#5d4327'; ctx.lineWidth = 1.2 * z;
    ctx.beginPath(); ctx.moveTo(f.D.x + 4 * z, f.D.y); ctx.lineTo(f.D.x + 4 * z, f.D.y - 23 * z); ctx.lineTo(f.C.x - 20 * z, f.C.y - 12 * z); ctx.stroke();
    this.drawWindow(f.C.x - 27 * z, f.C.y - 18 * z, 5 * z, 7 * z, '#d09f4d');
    if (b.hp < b.maxHp) this.drawDamageSmoke(f, z, time, 1 - b.hp / b.maxHp);
  }


  drawWall(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    const f = this.footprint(game, b);
    this.drawPlatform(f, z, '#6f6755');
    this.prism(f, 34 * z, '#817a68', '#9b927c', '#8d8572');
    ctx.strokeStyle = '#b4ab94'; ctx.lineWidth = 1.2 * z;
    for (let i = 0; i < 4; i++) {
      const x = lerp(f.A.x, f.B.x, (i + 0.5) / 4);
      const y = lerp(f.A.y, f.B.y, (i + 0.5) / 4);
      ctx.beginPath(); ctx.moveTo(x, y - 28 * z); ctx.lineTo(x, y - 38 * z); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(20,24,16,0.45)';
    ctx.beginPath(); ctx.moveTo(f.A.x + 4 * z, f.A.y - 4 * z); ctx.lineTo(f.B.x - 4 * z, f.B.y - 4 * z); ctx.lineTo(f.B.x - 4 * z, f.B.y - 24 * z); ctx.lineTo(f.A.x + 4 * z, f.A.y - 24 * z); ctx.closePath(); ctx.fill();
    if (b.hp < b.maxHp) this.drawDamageSmoke(f, z, time, 1 - b.hp / b.maxHp);
  }

  drawGate(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    const f = this.footprint(game, b);
    this.drawPlatform(f, z, '#706855');
    this.prism(f, 44 * z, '#7e7664', '#9b927c', '#8d8572');
    ctx.fillStyle = '#2d2318';
    ctx.beginPath();
    ctx.moveTo(f.A.x + b.w * 9 * z, f.A.y - 2 * z);
    ctx.lineTo(f.A.x + b.w * 9 * z, f.A.y - 28 * z);
    ctx.quadraticCurveTo(f.cx, f.cy - 42 * z, f.A.x + b.w * 27 * z, f.A.y - 28 * z);
    ctx.lineTo(f.A.x + b.w * 27 * z, f.A.y - 2 * z);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#b4ab94'; ctx.lineWidth = 1.4 * z;
    ctx.beginPath(); ctx.moveTo(f.cx - 9 * z, f.cy - 42 * z); ctx.lineTo(f.cx - 9 * z, f.cy - 54 * z); ctx.lineTo(f.cx + 9 * z, f.cy - 54 * z); ctx.lineTo(f.cx + 9 * z, f.cy - 42 * z); ctx.stroke();
    this.flag(f.cx + 8 * z, f.cy - 55 * z, 15 * z, z, time, 2.1);
    if (b.hp < b.maxHp) this.drawDamageSmoke(f, z, time, 1 - b.hp / b.maxHp);
  }

  drawConstruction(b, game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    const f = this.footprint(game, b);
    this.drawPlatform(f, z, 'rgba(105,93,71,0.6)');
    ctx.save();
    ctx.globalAlpha = 0.36 + b.construction * 0.5;
    if (b.type === 'core') this.prism(f, 46 * b.construction * z, '#877a63', '#9b8c6f', '#a49679');
    else if (b.type === 'tower') this.prism(f, 58 * b.construction * z, '#81765f', '#968a6e');
    else if (b.type === 'farm') {
      ctx.fillStyle = '#6c5732';
      ctx.beginPath(); ctx.moveTo(f.A.x, f.A.y); ctx.lineTo(f.B.x, f.B.y); ctx.lineTo(f.C.x, f.C.y); ctx.lineTo(f.D.x, f.D.y); ctx.closePath(); ctx.fill();
    } else this.prism(f, 30 * b.construction * z, '#8e8068', '#a49576');
    ctx.restore();
    ctx.strokeStyle = '#5a4024'; ctx.lineWidth = 2 * z;
    const posts = [[f.A, -16], [f.B, -16], [f.C, -16], [f.D, -16]];
    for (const [p, h] of posts) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + h * z); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(192,158,86,0.55)'; ctx.lineWidth = 1 * z;
    ctx.beginPath(); ctx.moveTo(f.A.x, f.A.y - 12 * z); ctx.lineTo(f.B.x, f.B.y - 12 * z); ctx.lineTo(f.C.x, f.C.y - 12 * z); ctx.lineTo(f.D.x, f.D.y - 12 * z); ctx.closePath(); ctx.stroke();
    const barW = 48 * z, barY = f.cy - 52 * z;
    ctx.fillStyle = 'rgba(12,10,6,0.72)'; ctx.fillRect(f.cx - barW / 2, barY, barW, 5 * z);
    ctx.fillStyle = '#c6a25d'; ctx.fillRect(f.cx - barW / 2, barY, barW * b.construction, 5 * z);
    ctx.fillStyle = '#ead8ac'; ctx.font = `${9 * z}px Cinzel, serif`; ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(b.construction * 100)}%`, f.cx, barY - 5 * z);
  }

  drawDamageSmoke(f, z, time, amount) {
    if (amount <= 0.2 || Math.sin(time * 1.7 + f.cx) < 0.2) return;
    this.smokePlume(f.cx + 12 * z, f.cy - 35 * z, z, time, 0.8);
  }

  drawBuildingBar(b, game) {
    if (b.selected || b.hp < b.maxHp * 0.999) {
      const p = this.screen(game, b.x + b.w / 2, b.y + b.h / 2);
      const z = game.camera.zoom;
      const w = Math.min(90, (b.w + b.h) * 11) * z;
      const y = p.y - (b.type === 'core' ? 132 : b.type === 'tower' ? 108 : 58) * z;
      this.healthBar(p.x - w / 2, y, w, 4 * z, b.hp / b.maxHp, b.team === 'player' ? '#7aa95d' : '#b25046');
    }
  }

  healthBar(x, y, w, h, ratio, color) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(8,8,5,0.72)'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color; ctx.fillRect(x + 1, y + 1, Math.max(0, (w - 2) * ratio), h - 2);
    ctx.strokeStyle = 'rgba(244,226,184,0.45)'; ctx.lineWidth = 0.7;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  drawUnitShadow(x,y,rx,ry) {
    if(this.shadowCacheEnabled===false){const ctx=this.ctx;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,6.3);ctx.fill();return;}
    if(!this.shadowSprite){
      const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;
      const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(7,9,5,0.34)';ctx.beginPath();ctx.ellipse(64,32,48,24,0,0,6.3);ctx.fill();this.shadowSprite=canvas;
    }
    this.ctx.drawImage(this.shadowSprite,x-rx*4/3,y-ry*4/3,rx*8/3,ry*8/3);
  }

  drawUnit(u, game, time) {
    const p = this.screen(game, u.x, u.y);
    if (p.x < -80 || p.x > this.w + 80 || p.y < -80 || p.y > this.h + 100) return;
    const z = game.camera.zoom;
    const scale = z * (u.typeDef.scale || 1);
    const team = u.team === 'player' ? { ...PLAYER_COLORS, ...game.playerColors, trim: PLAYER_COLORS.trim } : ENEMY_COLORS;
    const moving = u.state === 'move' || u.state === 'return' || u.state === 'build' || u.state === 'gather';
    const walk = moving ? Math.sin(u.walkPhase) : 0;
    const bob = moving ? Math.abs(Math.cos(u.walkPhase)) * 1.2 : Math.sin(time * 2 + u.id) * 0.35;
    ctxSave(this.ctx, () => {
      const ctx = this.ctx;
      const frame = directionalAnimationFrame(u);
      frame.atlasKey = unitSpriteAtlasKey(u, game.civ?.id);
      const entry = this.unitSpriteAtlases?.get(frame.atlasKey);
      const bakedPose = entry?.descriptor.bakedPose && entry.ready && !entry.failed && entry.image?.naturalWidth;
      const casting = heroCastVisual(u);
      if (bakedPose && entry.descriptor.states.cast && casting && !['hit', 'death'].includes(frame.state)) {
        frame.state = 'cast'; frame.progress = casting.progress;
      }
      // New screen-space sheets already contain their directional and fallen poses.
      // Preserve the historical procedural transform when loading fails.
      if (!bakedPose) {
        ctx.translate(p.x, p.y);
        ctx.scale(frame.mirror, frame.depthScale);
        if (frame.state === 'hit') ctx.translate(-2.5 * scale, -1.5 * scale);
        if (frame.state === 'death') {
          const fall = 1 - clamp((u.deathAnim || 0) / 1.2, 0, 1);
          ctx.rotate(frame.mirror * fall * 1.18);
          ctx.globalAlpha = Math.max(0.16, 1 - fall * 0.72);
        }
        ctx.translate(-p.x, -p.y);
      }
      ctx.fillStyle = 'rgba(7,9,5,0.34)';
      const big = ['knight', 'light_cavalry', 'horse_archer', 'elephant', 'ram', 'mangonel', 'patrol_cart', 'prototype'].includes(u.type) ? 19 : 12;
      this.drawUnitShadow(p.x+2*scale,p.y+1.5*scale,big*scale,(big===19?7:4.5)*scale);
      const atlasDrawn = this.drawSpriteAtlasUnit(u, p, scale, frame, time);
      if (atlasDrawn) { /* external atlas replaces this unit's procedural body */ }
      else if (['knight', 'light_cavalry', 'horse_archer'].includes(u.type)) this.drawKnightUnit(p, u, scale, team, walk, time, bob);
      else if (u.typeDef.visual==='archer' || u.type === 'archer' || u.type === 'marauder' || u.type === 'skirmisher' || u.type === 'patrol_cart') this.drawArcherUnit(p, u, scale, team, walk, time, bob);
      else if (u.type === 'mangonel') this.drawMangonelUnit(p, u, scale, team, walk, time, bob);
      else if (u.type === 'villager') this.drawVillagerUnit(p, u, scale, team, walk, time, bob);
      else if (u.type === 'elephant') this.drawElephantUnit(p, u, scale, team, walk, time, bob);
      else if (u.type === 'ram') this.drawRamUnit(p, u, scale, team, walk, time, bob);
      else if (u.type === 'commander') this.drawHeroUnit(p, u, scale, team, walk, time, bob);
      else if (u.type === 'prototype') this.drawPrototypeUnit(p, u, scale, team, walk, time, bob);
      else if (u.type === 'decoy') this.drawDecoyUnit(p, u, scale, team, walk, time, bob);
      else if (u.type === 'spearman') this.drawSpearUnit(p, u, scale, team, walk, time, bob);
      else if (['brute', 'warlord', 'warlord2'].includes(u.type)) this.drawBruteUnit(p, u, scale, team, walk, time, bob);
      else this.drawInfantryUnit(p, u, scale, team, walk, time, bob);
      if (!atlasDrawn && u.team === 'player' && u.type !== 'villager') this.drawCivilizationUnitAccent(u, game, p, scale, bob);
      this.drawChampionFeedback(u, p, scale, time, casting, entry?.descriptor.heroEmblem);
      if (u.type === 'elephant') this.drawElephantTrample(u, game);
      if (u.selected || u.hp < u.maxHp) {
        const wide = ['warlord', 'warlord2', 'elephant', 'prototype', 'ram', 'mangonel'].includes(u.type);
        const w = (wide ? 40 : 24) * scale;
        const high = entry?.descriptor.healthBarHeight ?? (u.type === 'elephant' && bakedPose ? 78 : ['knight', 'light_cavalry', 'horse_archer'].includes(u.type) ? 48 : wide ? 62 : bakedPose ? 54 : 38);
        const y = p.y - high * scale;
        this.healthBar(p.x - w / 2, y, w, 3.6 * scale, Math.max(0, u.hp / u.maxHp), u.team === 'player' ? '#78a95b' : '#b25046');
      }
      if (u.shield > 0) {
        this.ctx.strokeStyle = 'rgba(147,197,220,0.72)';
        this.ctx.lineWidth = 1.4 * scale;
        this.ctx.beginPath(); this.ctx.ellipse(p.x, p.y - 16 * scale, 14 * scale, 18 * scale, 0, 0, 6.3); this.ctx.stroke();
      }
      if (u.carry > 0 && u.type === 'villager') {
        this.ctx.fillStyle = u.carryType === 'gold' ? '#b28b3e' : u.carryType === 'stone' ? '#7f7c70' : u.carryType === 'wood' ? '#6a4829' : '#a27a45';
        this.ctx.fillRect(p.x - 6 * scale, p.y - 24 * scale + bob * scale, 5 * scale, 7 * scale);
      }
      if (u.hitFlash > 0) {
        this.ctx.globalAlpha = u.hitFlash * 0.35;
        this.ctx.fillStyle = '#ffb3a0';
        this.ctx.beginPath(); this.ctx.arc(p.x, p.y - 16 * scale, 12 * scale, 0, 6.3); this.ctx.fill();
        this.ctx.globalAlpha = 1;
      }
    });
  }

  drawChampionFeedback(u, p, s, time, casting, emblem) {
    if (!u.alive) return;
    const ctx = this.ctx;
    if (u.marked > 0) {
      const y = p.y - (u.typeDef.boss ? 69 : 48) * s, r = 7 * s;
      ctx.save(); ctx.strokeStyle = 'rgba(255,190,87,.95)'; ctx.lineWidth = 1.6 * s;
      ctx.beginPath(); ctx.arc(p.x, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x - r * 1.5, y); ctx.lineTo(p.x + r * 1.5, y);
      ctx.moveTo(p.x, y - r * 1.5); ctx.lineTo(p.x, y + r * 1.5); ctx.stroke(); ctx.restore();
    }
    if (u.shield > 0) {
      ctx.save(); ctx.strokeStyle = 'rgba(160,221,246,.75)'; ctx.fillStyle = 'rgba(125,191,228,.08)'; ctx.lineWidth = 1.1 * s;
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 45 * s); ctx.lineTo(p.x + 16 * s, p.y - 32 * s);
      ctx.lineTo(p.x + 11 * s, p.y - 6 * s); ctx.lineTo(p.x, p.y + 2 * s);
      ctx.lineTo(p.x - 11 * s, p.y - 6 * s); ctx.lineTo(p.x - 16 * s, p.y - 32 * s); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    if (casting) {
      ctx.save(); ctx.strokeStyle = `rgba(${casting.color},${1 - casting.progress * .65})`; ctx.lineWidth = 2 * s;
      const r = (11 + casting.progress * 18) * s;
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 27 * s, r, r * .7, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x - r * .4, p.y - 27 * s); ctx.lineTo(p.x, p.y - (casting.id === 'aegis' ? 38 : 34) * s);
      ctx.lineTo(p.x + r * .4, p.y - 27 * s); ctx.stroke(); ctx.restore();
      // 文明施法徽記置於肩側，不遮住英雄臉部。 / Civilization skill emblems sit beside the shoulder, leaving the face readable.
      if (emblem === 'teutonic' || emblem === 'samurai') {
        ctx.save(); ctx.translate(p.x + 32 * s, p.y - 64 * s); ctx.scale(s, s);
        ctx.strokeStyle = casting.id === 'aegis' ? '#b6e4f4' : '#ebc678';
        ctx.fillStyle = 'rgba(25,37,41,.85)'; ctx.lineWidth = 1.5;
        if (emblem === 'samurai') { ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2); ctx.stroke(); }
        ctx.beginPath();
        if (casting.id === 'aegis') {
          ctx.moveTo(-8,-9); ctx.lineTo(8,-9); ctx.lineTo(7,3); ctx.lineTo(0,10); ctx.lineTo(-7,3); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(0,5); ctx.moveTo(-5,-1); ctx.lineTo(5,-1); ctx.stroke();
        } else {
          ctx.arc(0,0,7,0,Math.PI*2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-11,0); ctx.lineTo(11,0); ctx.moveTo(0,-11); ctx.lineTo(0,11); ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  drawSpriteAtlasUnit(u, p, scale, visual, time) {
    const entry = this.unitSpriteAtlases?.get(visual.atlasKey || u.type);
    if (!entry?.ready || entry.failed || !entry.image?.naturalWidth) return false;
    const descriptor = entry.descriptor;
    const progress = visual.progress ?? atlasActionProgress(u, visual.state);
    const frame = atlasFrame(descriptor, visual.direction, visual.state, time, progress);
    if (!frame) return false;
    const drawScale = scale * descriptor.scale;
    const crop = descriptor.cacheFrames && descriptor.frameCrops?.[(frame.sy / frame.sh) * (entry.image.naturalWidth / frame.sw) + frame.sx / frame.sw];
    const [cx, cy, cw, ch] = crop || [0, 0, frame.sw, frame.sh];
    const image = descriptor.cacheFrames ? this.spriteFrameImage(entry, frame) : entry.image;
    this.ctx.drawImage(image, descriptor.cacheFrames ? 0 : frame.sx, descriptor.cacheFrames ? 0 : frame.sy, cw, ch,
      p.x + (descriptor.offset.x - descriptor.anchor.x + cx) * drawScale,
      p.y + (descriptor.offset.y - descriptor.anchor.y + cy) * drawScale,
      cw * drawScale, ch * drawScale);
    return true;
  }

  drawElephantTrample(u, game) {
    if (!u.alive || u.team !== 'player' || !(game.effects?.elephantTrample > 0) || !(u.attackAnim > 0) || !u.target) return;
    const ctx = this.ctx, p = this.screen(game, u.target.x, u.target.y), z = game.camera.zoom;
    const progress = 1 - u.attackAnim, rx = (12 + progress * 24) * z, ry = rx / 2;
    ctx.save(); ctx.strokeStyle = `rgba(212,183,125,${u.attackAnim * .7})`; ctx.lineWidth = (2 - progress) * z;
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, rx, ry, 0, a, a + .8); ctx.stroke();
    }
    ctx.restore();
  }

  spriteFrameImage(entry, frame) {
    // Keep repeated CPU canvas draws on small bitmaps rather than four large sheets.
    // Lazily crop real decoded pixels; at most64frames per asset are retained.
    const cache = entry.frameImages ||= new Map();
    const key = `${frame.sx}:${frame.sy}`;
    if (cache.has(key)) return cache.get(key);
    const canvas = document.createElement('canvas');
    const crop = entry.descriptor?.frameCrops?.[(frame.sy / frame.sh) * (entry.image.naturalWidth / frame.sw) + frame.sx / frame.sw];
    const [cx, cy, cw, ch] = crop || [0, 0, frame.sw, frame.sh];
    canvas.width = cw; canvas.height = ch;
    canvas.getContext('2d').drawImage(entry.image, frame.sx + cx, frame.sy + cy, cw, ch, 0, 0, cw, ch);
    if (cache.size >= 64) cache.delete(cache.keys().next().value);
    cache.set(key, canvas);
    return canvas;
  }

  drawCivilizationUnitAccent(u, game, p, s, bob) {
    const ctx = this.ctx, profile = civilizationVisualProfile(game.civ?.id), x = p.x, y = p.y - bob * s;
    ctx.save();
    ctx.fillStyle = game.civ?.accent || '#8b6a3d';
    ctx.strokeStyle = '#dbc68e'; ctx.lineWidth = Math.max(0.7, 0.9 * s);
    if (profile.kit === 'horsehair') {
      ctx.beginPath(); ctx.moveTo(x - 2 * s, y - 34 * s); ctx.quadraticCurveTo(x - 10 * s, y - 40 * s, x - 7 * s, y - 47 * s); ctx.lineTo(x, y - 37 * s); ctx.closePath(); ctx.fill();
    } else if (profile.kit === 'round') {
      ctx.beginPath(); ctx.arc(x - 9 * s, y - 20 * s, 4.6 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x - 9 * s, y - 20 * s, 1.5 * s, 0, Math.PI * 2); ctx.stroke();
    } else if (profile.kit === 'lamellar') {
      for (let i = -1; i <= 1; i++) { ctx.fillRect(x + (i * 4 - 1.5) * s, y - 25 * s, 3 * s, 8 * s); ctx.strokeRect(x + (i * 4 - 1.5) * s, y - 25 * s, 3 * s, 8 * s); }
    } else if (profile.kit === 'feathered') {
      for (let i = -2; i <= 2; i++) { ctx.save(); ctx.translate(x, y - 34 * s); ctx.rotate(i * 0.28); ctx.beginPath(); ctx.ellipse(0, -7 * s, 1.7 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    } else {
      ctx.beginPath(); ctx.moveTo(x - 14 * s, y - 28 * s); ctx.lineTo(x - 7 * s, y - 20 * s); ctx.lineTo(x - 12 * s, y - 9 * s); ctx.lineTo(x - 18 * s, y - 20 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 15 * s, y - 23 * s); ctx.lineTo(x - 10 * s, y - 18 * s); ctx.lineTo(x - 14 * s, y - 14 * s); ctx.stroke();
    }
    ctx.restore();
  }

  drawVillagerUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y - bob * s;
    ctx.strokeStyle = '#3d3022'; ctx.lineWidth = 1.8 * s;
    ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 9 * s); ctx.lineTo(x - 3 * s - walk * 1.5 * s, y); ctx.moveTo(x + 3 * s, y - 9 * s); ctx.lineTo(x + 3 * s + walk * 1.5 * s, y); ctx.stroke();
    ctx.fillStyle = team.cloth;
    ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 23 * s); ctx.quadraticCurveTo(x, y - 27 * s, x + 6 * s, y - 23 * s); ctx.lineTo(x + 5 * s, y - 9 * s); ctx.lineTo(x - 5 * s, y - 9 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = team.primary; ctx.fillRect(x - 5 * s, y - 17 * s, 10 * s, 2 * s);
    ctx.fillStyle = '#c79c78';
    ctx.beginPath(); ctx.arc(x, y - 29 * s, 3.7 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#8a673d';
    ctx.beginPath(); ctx.ellipse(x, y - 31.5 * s, 5.2 * s, 2.2 * s, 0, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#5f4829'; ctx.lineWidth = 1.1 * s;
    ctx.beginPath(); ctx.moveTo(x + 4 * s, y - 24 * s); ctx.lineTo(x + 10 * s, y - 39 * s); ctx.stroke();
    ctx.fillStyle = '#8a8172';
    ctx.beginPath(); ctx.moveTo(x + 8 * s, y - 39 * s); ctx.lineTo(x + 12 * s, y - 38 * s); ctx.lineTo(x + 9 * s, y - 34 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5a3e22'; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(x - 5 * s, y - 27 * s); ctx.lineTo(x - 8 * s, y - 17 * s); ctx.stroke();
  }

  // Cache only invariant torso/helmet/shield geometry. Legs, sword swing,
  // bobbing, health bars, hit flashes and selection remain live every frame.
  drawInfantryBody(x,y,scale,team) {
    if(this.infantryCacheEnabled===false){this.paintInfantryBody(x,y,scale,team);return;}
    this.infantryBodyCache ||= new Map();
    this.infantrySpriteStats ||= {hits:0,misses:0};
    const resolution=Math.max(2,2*(this.dpr||1));
    let entry=this.infantryBodyCache.get(team);
    if(!entry || entry.resolution!==resolution || entry.primary!==team.primary || entry.cloth!==team.cloth) {
      if(this.infantryBodyCache.size>=16)this.infantryBodyCache.clear();
      const canvas=document.createElement('canvas');canvas.width=canvas.height=48*resolution;
      const ctx=canvas.getContext('2d');ctx.setTransform(resolution,0,0,resolution,0,0);
      const original=this.ctx;
      try{this.ctx=ctx;this.paintInfantryBody(24,48,1,team);}finally{this.ctx=original;}
      entry={canvas,resolution,primary:team.primary,cloth:team.cloth};this.infantryBodyCache.set(team,entry);this.infantrySpriteStats.misses++;
    } else this.infantrySpriteStats.hits++;
    this.ctx.drawImage(entry.canvas,x-24*scale,y-48*scale,48*scale,48*scale);
  }

  paintInfantryBody(x,y,s,team) {
    const ctx=this.ctx;
    ctx.fillStyle = team.cloth;
    ctx.beginPath(); ctx.moveTo(x - 7 * s, y - 25 * s); ctx.lineTo(x + 7 * s, y - 25 * s); ctx.lineTo(x + 6 * s, y - 10 * s); ctx.lineTo(x - 6 * s, y - 10 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = team.primary; ctx.fillRect(x - 7 * s, y - 18 * s, 14 * s, 2.2 * s);
    ctx.fillStyle = '#c69a76'; ctx.beginPath(); ctx.arc(x, y - 30 * s, 3.8 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#8d8b80'; ctx.beginPath(); ctx.arc(x, y - 31.5 * s, 4.3 * s, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#6c6a61'; ctx.fillRect(x - 4.3 * s, y - 32 * s, 8.6 * s, 1.4 * s);
    ctx.fillStyle = team.primary;
    ctx.beginPath(); ctx.ellipse(x - 8 * s, y - 19 * s, 4.2 * s, 6 * s, 0.12, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#c9b884'; ctx.lineWidth = 0.9 * s;
    ctx.beginPath(); ctx.ellipse(x - 8 * s, y - 19 * s, 2.2 * s, 3.4 * s, 0.12, 0, 6.3); ctx.stroke();
  }

  drawInfantryUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y - bob * s;
    ctx.strokeStyle = '#3c3022'; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 10 * s); ctx.lineTo(x - 3 * s - walk * 1.6 * s, y); ctx.moveTo(x + 3 * s, y - 10 * s); ctx.lineTo(x + 3 * s + walk * 1.6 * s, y); ctx.stroke();
    this.drawInfantryBody(x,y,s,team);
    const swing = u.attackAnim > 0 ? Math.sin(u.attackAnim * Math.PI) : 0;
    if (unitVisualSignature(u.type) === 'heavy-guard') {
      // Broad shoulders, a crested helm and a tall kite shield give the guard
      // a heavier outline than ordinary militia, even in a dense formation.
      ctx.fillStyle = '#85877f';
      ctx.beginPath(); ctx.ellipse(x - 7.5 * s, y - 25 * s, 5.2 * s, 3.2 * s, -0.25, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 7.5 * s, y - 25 * s, 5.2 * s, 3.2 * s, 0.25, 0, 6.3); ctx.fill();
      ctx.fillStyle = team.trim;
      ctx.beginPath(); ctx.moveTo(x - 2 * s, y - 35 * s); ctx.lineTo(x, y - 43 * s); ctx.lineTo(x + 3 * s, y - 35 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = team.primary;
      ctx.beginPath(); ctx.moveTo(x - 13 * s, y - 29 * s); ctx.quadraticCurveTo(x - 19 * s, y - 20 * s, x - 12 * s, y - 8 * s); ctx.quadraticCurveTo(x - 5 * s, y - 19 * s, x - 9 * s, y - 29 * s); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#d7c98d'; ctx.lineWidth = 1.2 * s;
      ctx.beginPath(); ctx.moveTo(x - 11 * s, y - 27 * s); ctx.lineTo(x - 13 * s, y - 11 * s); ctx.stroke();
    }
    ctx.strokeStyle = '#70654d'; ctx.lineWidth = 1.6 * s;
    ctx.beginPath(); ctx.moveTo(x + 6 * s, y - 21 * s); ctx.lineTo(x + 11 * s + swing * 5 * s, y - 31 * s - swing * 6 * s); ctx.stroke();
    ctx.strokeStyle = '#d5d8cf'; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(x + 10 * s + swing * 4 * s, y - 30 * s - swing * 5 * s); ctx.lineTo(x + 16 * s + swing * 7 * s, y - 40 * s - swing * 4 * s); ctx.stroke();
  }

  drawArcherUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y - bob * s;
    ctx.strokeStyle = '#3b2f22'; ctx.lineWidth = 1.8 * s;
    ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 10 * s); ctx.lineTo(x - 3 * s - walk * 1.5 * s, y); ctx.moveTo(x + 3 * s, y - 10 * s); ctx.lineTo(x + 3 * s + walk * 1.5 * s, y); ctx.stroke();
    ctx.fillStyle = u.team === 'player' ? '#3f5f50' : '#4d302a';
    ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 24 * s); ctx.lineTo(x + 6 * s, y - 24 * s); ctx.lineTo(x + 5 * s, y - 9 * s); ctx.lineTo(x - 5 * s, y - 9 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = team.primary; ctx.fillRect(x - 6 * s, y - 16 * s, 12 * s, 1.8 * s);
    ctx.fillStyle = '#c69a76'; ctx.beginPath(); ctx.arc(x, y - 29 * s, 3.6 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#344a31';
    ctx.beginPath(); ctx.arc(x, y - 29 * s, 4.4 * s, Math.PI * 0.85, Math.PI * 2.1); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 30 * s); ctx.lineTo(x - 8 * s, y - 23 * s); ctx.lineTo(x - 3 * s, y - 26 * s); ctx.closePath(); ctx.fill();
    const draw = u.attackAnim > 0 ? Math.sin(u.attackAnim * Math.PI) : 0;
    const signature = unitVisualSignature(u.type);
    if (signature === 'javelin-buckler') {
      ctx.fillStyle = team.primary;
      ctx.beginPath(); ctx.arc(x - 8 * s, y - 20 * s, 5.2 * s, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#d2bd7b'; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.arc(x - 8 * s, y - 20 * s, 3.2 * s, 0, 6.3); ctx.stroke();
      ctx.save(); ctx.translate(x + 5 * s, y - 23 * s); ctx.rotate(-0.72 + draw * 0.45);
      ctx.strokeStyle = '#80643c'; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(-5 * s, 0); ctx.lineTo(27 * s, 0); ctx.stroke();
      ctx.fillStyle = '#d8ddd5'; ctx.beginPath(); ctx.moveTo(27 * s, -2.3 * s); ctx.lineTo(35 * s, 0); ctx.lineTo(27 * s, 2.3 * s); ctx.closePath(); ctx.fill();
      ctx.restore();
      return;
    }
    if (signature === 'repeating-crossbow') {
      // A horizontal double-limbed stock and top magazine distinguish the
      // Chinese unique unit from the ordinary long-bow silhouette.
      const recoil = draw * 2.5 * s;
      ctx.save(); ctx.translate(x + 7 * s - recoil, y - 22 * s); ctx.rotate(-0.08);
      ctx.strokeStyle = '#81542d'; ctx.lineWidth = 2.4 * s;
      ctx.beginPath(); ctx.moveTo(-5 * s, 0); ctx.lineTo(18 * s, 0); ctx.stroke();
      ctx.strokeStyle = '#b68b50'; ctx.lineWidth = 1.4 * s;
      for (const ox of [3, 7]) { ctx.beginPath(); ctx.moveTo(ox * s, -8 * s); ctx.lineTo(ox * s, 8 * s); ctx.stroke(); }
      ctx.fillStyle = '#5d3c24'; ctx.fillRect(-1 * s, -7 * s, 9 * s, 4 * s);
      ctx.strokeStyle = '#ded3ad'; ctx.lineWidth = 0.7 * s;
      ctx.beginPath(); ctx.moveTo(3 * s, -8 * s); ctx.lineTo(18 * s, 0); ctx.lineTo(3 * s, 8 * s); ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.strokeStyle = '#8c6937'; ctx.lineWidth = 1.3 * s;
    ctx.beginPath(); ctx.arc(x + 9 * s, y - 22 * s, 8 * s, -Math.PI * 0.46, Math.PI * 0.46); ctx.stroke();
    ctx.strokeStyle = 'rgba(220,211,174,0.85)'; ctx.lineWidth = 0.7 * s;
    ctx.beginPath(); ctx.moveTo(x + 9 * s + Math.cos(-Math.PI * 0.46) * 8 * s, y - 22 * s + Math.sin(-Math.PI * 0.46) * 8 * s); ctx.lineTo(x + 6 * s - draw * 4 * s, y - 22 * s); ctx.lineTo(x + 9 * s + Math.cos(Math.PI * 0.46) * 8 * s, y - 22 * s + Math.sin(Math.PI * 0.46) * 8 * s); ctx.stroke();
  }

  drawKnightUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y;
    const leg = walk * 2.6 * s;
    ctx.strokeStyle = '#4a3625'; ctx.lineWidth = 2.6 * s;
    ctx.beginPath(); ctx.moveTo(x - 7 * s, y - 12 * s); ctx.lineTo(x - 8 * s - leg, y); ctx.moveTo(x + 7 * s, y - 12 * s); ctx.lineTo(x + 8 * s + leg, y); ctx.stroke();
    ctx.fillStyle = '#6f4a2e';
    ctx.beginPath(); ctx.ellipse(x, y - 17 * s, 14 * s, 8 * s, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#885c36';
    ctx.beginPath(); ctx.ellipse(x - 2 * s, y - 19 * s, 11 * s, 5 * s, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = team.primary;
    ctx.beginPath(); ctx.moveTo(x - 11 * s, y - 17 * s); ctx.lineTo(x - 6 * s, y - 24 * s); ctx.lineTo(x + 5 * s, y - 24 * s); ctx.lineTo(x + 10 * s, y - 16 * s); ctx.lineTo(x + 4 * s, y - 14 * s); ctx.lineTo(x - 10 * s, y - 14 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#7e5932'; ctx.lineWidth = 3.4 * s;
    ctx.beginPath(); ctx.moveTo(x + 12 * s, y - 18 * s); ctx.lineTo(x + 18 * s, y - 27 * s); ctx.stroke();
    ctx.fillStyle = '#72472c';
    ctx.beginPath(); ctx.ellipse(x + 19 * s, y - 28 * s, 5 * s, 3 * s, -0.5, 0, 6.3); ctx.fill();
    const riderBob = Math.sin(walk) * 0.8 * s;
    ctx.fillStyle = team.cloth;
    ctx.beginPath(); ctx.moveTo(x - 5 * s, y - 30 * s + riderBob); ctx.lineTo(x + 5 * s, y - 30 * s + riderBob); ctx.lineTo(x + 4 * s, y - 20 * s + riderBob); ctx.lineTo(x - 4 * s, y - 20 * s + riderBob); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b9b8ad';
    ctx.beginPath(); ctx.arc(x, y - 35 * s + riderBob, 3.8 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#77776f'; ctx.beginPath(); ctx.arc(x, y - 36 * s + riderBob, 4.2 * s, Math.PI, 0); ctx.fill();
    ctx.fillStyle = team.trim;
    ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 39 * s + riderBob); ctx.lineTo(x, y - 44 * s + riderBob); ctx.lineTo(x + 3 * s, y - 39 * s + riderBob); ctx.closePath(); ctx.fill();
    const signature = unitVisualSignature(u.type);
    if (signature === 'mounted-bow') {
      ctx.strokeStyle = '#8c6937'; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.arc(x + 10 * s, y - 29 * s + riderBob, 9 * s, -1.2, 1.2); ctx.stroke();
      ctx.strokeStyle = '#e1d6b0'; ctx.lineWidth = 0.7 * s;
      ctx.beginPath(); ctx.moveTo(x + 13.3 * s, y - 37.4 * s + riderBob); ctx.lineTo(x + 5 * s, y - 29 * s + riderBob); ctx.lineTo(x + 13.3 * s, y - 20.6 * s + riderBob); ctx.stroke();
      ctx.fillStyle = '#655036'; ctx.fillRect(x - 11 * s, y - 30 * s + riderBob, 3 * s, 12 * s);
    } else if (signature === 'mounted-spear') {
      ctx.strokeStyle = '#7a603a'; ctx.lineWidth = 1.7 * s;
      ctx.beginPath(); ctx.moveTo(x + 3 * s, y - 27 * s + riderBob); ctx.lineTo(x + 27 * s, y - 44 * s + riderBob); ctx.stroke();
      ctx.fillStyle = '#d9dbd2'; ctx.beginPath(); ctx.moveTo(x + 27 * s, y - 44 * s + riderBob); ctx.lineTo(x + 34 * s, y - 51 * s + riderBob); ctx.lineTo(x + 25 * s, y - 47 * s + riderBob); ctx.closePath(); ctx.fill();
      ctx.fillStyle = team.trim; ctx.beginPath(); ctx.moveTo(x + 18 * s, y - 39 * s + riderBob); ctx.lineTo(x + 12 * s, y - 43 * s + riderBob); ctx.lineTo(x + 15 * s, y - 34 * s + riderBob); ctx.closePath(); ctx.fill();
    } else {
      ctx.strokeStyle = '#d7d5c8'; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(x + 5 * s, y - 27 * s + riderBob); ctx.lineTo(x + 18 * s, y - 42 * s + riderBob); ctx.stroke();
      ctx.fillStyle = '#d7d5c8'; ctx.beginPath(); ctx.moveTo(x + 18 * s, y - 42 * s + riderBob); ctx.lineTo(x + 22 * s, y - 47 * s + riderBob); ctx.lineTo(x + 19 * s, y - 40 * s + riderBob); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = team.primary;
    ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 29 * s + riderBob); ctx.lineTo(x - 4 * s, y - 33 * s + riderBob); ctx.lineTo(x - 3 * s, y - 24 * s + riderBob); ctx.lineTo(x - 7 * s, y - 22 * s + riderBob); ctx.closePath(); ctx.fill();
  }

  drawSpearUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y - bob * s;
    ctx.strokeStyle = '#3c3022'; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 10 * s); ctx.lineTo(x - 4 * s - walk * 1.5 * s, y); ctx.moveTo(x + 3 * s, y - 10 * s); ctx.lineTo(x + 4 * s + walk * 1.5 * s, y); ctx.stroke();
    ctx.fillStyle = team.cloth;
    ctx.beginPath(); ctx.moveTo(x - 7 * s, y - 25 * s); ctx.lineTo(x + 7 * s, y - 25 * s); ctx.lineTo(x + 6 * s, y - 9 * s); ctx.lineTo(x - 6 * s, y - 9 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = team.primary; ctx.fillRect(x - 7 * s, y - 18 * s, 14 * s, 2 * s);
    ctx.fillStyle = '#c69a76'; ctx.beginPath(); ctx.arc(x, y - 30 * s, 3.8 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#777b72'; ctx.beginPath(); ctx.arc(x, y - 31.5 * s, 4.3 * s, Math.PI, 0); ctx.fill();
    ctx.fillStyle = team.primary;
    ctx.beginPath(); ctx.ellipse(x - 8 * s, y - 19 * s, 4 * s, 5.8 * s, 0.1, 0, 6.3); ctx.fill();
    const thrust = u.attackAnim > 0 ? Math.sin(u.attackAnim * Math.PI) : 0;
    ctx.strokeStyle = '#7a603a'; ctx.lineWidth = 1.6 * s;
    ctx.save(); ctx.translate(x + 7 * s, y - 23 * s); ctx.rotate(-0.8 + thrust * 0.75); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(31 * s, 0); ctx.stroke();
    ctx.fillStyle = '#d9dbd2'; ctx.beginPath(); ctx.moveTo(31 * s, -2.4 * s); ctx.lineTo(39 * s, 0); ctx.lineTo(31 * s, 2.4 * s); ctx.closePath(); ctx.fill(); ctx.restore();
  }

  drawElephantUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y - bob * 0.4 * s;
    ctx.strokeStyle = '#554334'; ctx.lineWidth = 4 * s;
    for (const ox of [-12, -4, 7, 14]) {
      const sway = ox < 0 ? walk * 2 * s : -walk * 2 * s;
      ctx.beginPath(); ctx.moveTo(x + ox * s, y - 13 * s); ctx.lineTo(x + ox * s + sway, y); ctx.stroke();
    }
    ctx.fillStyle = '#6c6254';
    ctx.beginPath(); ctx.ellipse(x, y - 22 * s, 20 * s, 11 * s, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#7c7262';
    ctx.beginPath(); ctx.ellipse(x - 2 * s, y - 25 * s, 16 * s, 7 * s, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = team.primary;
    ctx.fillRect(x - 13 * s, y - 25 * s, 26 * s, 5 * s);
    ctx.fillStyle = '#6c6254';
    ctx.beginPath(); ctx.ellipse(x + 20 * s, y - 26 * s, 8 * s, 9 * s, 0.15, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#6c6254'; ctx.lineWidth = 4 * s;
    ctx.beginPath(); ctx.moveTo(x + 24 * s, y - 24 * s); ctx.quadraticCurveTo(x + 31 * s, y - 13 * s, x + 28 * s, y - 4 * s); ctx.stroke();
    ctx.strokeStyle = '#ddd3b8'; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(x + 25 * s, y - 19 * s); ctx.quadraticCurveTo(x + 33 * s, y - 15 * s, x + 34 * s, y - 9 * s); ctx.stroke();
    ctx.fillStyle = '#3f3227'; ctx.beginPath(); ctx.arc(x + 25 * s, y - 29 * s, 1.2 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#8b3d2d';
    ctx.beginPath(); ctx.moveTo(x - 10 * s, y - 34 * s); ctx.lineTo(x + 8 * s, y - 34 * s); ctx.lineTo(x + 6 * s, y - 27 * s); ctx.lineTo(x - 8 * s, y - 27 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#cba875'; ctx.beginPath(); ctx.arc(x, y - 38 * s, 3 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = team.trim; ctx.beginPath(); ctx.arc(x, y - 39 * s, 3.5 * s, Math.PI, 0); ctx.fill();
  }

  drawRamUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y - bob * 0.5 * s;
    ctx.fillStyle = '#4a3827';
    ctx.beginPath(); ctx.ellipse(x, y - 13 * s, 21 * s, 10 * s, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#6d4d2d';
    ctx.beginPath(); ctx.moveTo(x - 22 * s, y - 13 * s); ctx.lineTo(x - 17 * s, y - 32 * s); ctx.lineTo(x + 17 * s, y - 32 * s); ctx.lineTo(x + 22 * s, y - 13 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#855f38';
    for (let i = -2; i <= 2; i++) ctx.fillRect(x + i * 8 * s - 1.5 * s, y - 30 * s, 3 * s, 16 * s);
    ctx.strokeStyle = '#40301f'; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.arc(x - 12 * s, y - 4 * s, 6 * s, 0, 6.3); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 12 * s, y - 4 * s, 6 * s, 0, 6.3); ctx.stroke();
    ctx.strokeStyle = '#5c4026'; ctx.lineWidth = 3.4 * s;
    ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 13 * s); ctx.lineTo(x + 24 * s, y - 13 * s); ctx.stroke();
    ctx.fillStyle = '#8e8a7d'; ctx.beginPath(); ctx.arc(x + 25 * s, y - 13 * s, 4.2 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = team.primary; ctx.fillRect(x - 18 * s, y - 25 * s, 36 * s, 3 * s);
    this.flag(x + 12 * s, y - 32 * s, 18 * s, s, time, 2.1);
  }

  drawMangonelUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y - bob * 0.5 * s;
    ctx.fillStyle = '#4d3a27';
    ctx.beginPath(); ctx.ellipse(x, y - 11 * s, 20 * s, 9 * s, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#74512f';
    ctx.beginPath(); ctx.moveTo(x - 20 * s, y - 11 * s); ctx.lineTo(x - 14 * s, y - 28 * s); ctx.lineTo(x + 14 * s, y - 28 * s); ctx.lineTo(x + 20 * s, y - 11 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3f2d1c'; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.arc(x - 12 * s, y - 3 * s, 5 * s, 0, 6.3); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 12 * s, y - 3 * s, 5 * s, 0, 6.3); ctx.stroke();
    ctx.strokeStyle = '#7a5732'; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 28 * s); ctx.lineTo(x - 18 * s, y - 44 * s); ctx.stroke();
    ctx.fillStyle = '#777366';
    ctx.beginPath(); ctx.arc(x - 20 * s, y - 45 * s, 5 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = team.primary; ctx.fillRect(x - 15 * s, y - 22 * s, 30 * s, 3 * s);
    this.flag(x + 12 * s, y - 30 * s, 16 * s, s, time, 2.1);
  }

  drawHeroUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y - bob * s;
    ctx.fillStyle = 'rgba(232,201,126,0.12)';
    ctx.beginPath(); ctx.arc(x, y - 24 * s, 23 * s + Math.sin(time * 2.4) * 1.5 * s, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#3b2e20'; ctx.lineWidth = 2.2 * s;
    ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 11 * s); ctx.lineTo(x - 5 * s - walk * 1.6 * s, y); ctx.moveTo(x + 4 * s, y - 11 * s); ctx.lineTo(x + 5 * s + walk * 1.6 * s, y); ctx.stroke();
    ctx.fillStyle = '#6d2d27';
    ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 27 * s); ctx.lineTo(x + 8 * s, y - 27 * s); ctx.lineTo(x + 12 * s, y - 8 * s); ctx.lineTo(x - 2 * s, y - 12 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = team.cloth;
    ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 27 * s); ctx.lineTo(x + 8 * s, y - 27 * s); ctx.lineTo(x + 6 * s, y - 12 * s); ctx.lineTo(x - 6 * s, y - 12 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = team.trim; ctx.fillRect(x - 8 * s, y - 20 * s, 16 * s, 2.4 * s);
    ctx.fillStyle = '#c89a72'; ctx.beginPath(); ctx.arc(x, y - 32 * s, 4 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#9b9b90'; ctx.beginPath(); ctx.arc(x, y - 33.5 * s, 4.5 * s, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#d6b15f';
    ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 36 * s); ctx.lineTo(x - 8 * s, y - 44 * s); ctx.lineTo(x - 2 * s, y - 40 * s); ctx.lineTo(x, y - 46 * s); ctx.lineTo(x + 2 * s, y - 40 * s); ctx.lineTo(x + 8 * s, y - 44 * s); ctx.lineTo(x + 4 * s, y - 36 * s); ctx.closePath(); ctx.fill();
    const swing = u.attackAnim > 0 ? Math.sin(u.attackAnim * Math.PI) : 0;
    ctx.strokeStyle = '#dfd7bf'; ctx.lineWidth = 2.2 * s;
    ctx.beginPath(); ctx.moveTo(x + 8 * s, y - 24 * s); ctx.lineTo(x + 15 * s + swing * 7 * s, y - 35 * s - swing * 5 * s); ctx.stroke();
    ctx.strokeStyle = '#a9863d'; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(x + 15 * s + swing * 7 * s, y - 35 * s - swing * 5 * s); ctx.lineTo(x + 19 * s + swing * 8 * s, y - 39 * s - swing * 5 * s); ctx.stroke();
  }

  drawPrototypeUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y - bob * 0.6 * s;
    ctx.fillStyle = 'rgba(216,167,84,0.12)';
    ctx.beginPath(); ctx.arc(x, y - 28 * s, 26 * s + Math.sin(time * 3) * 2 * s, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#37352e'; ctx.lineWidth = 4 * s;
    for (const ox of [-9, 9]) { ctx.beginPath(); ctx.moveTo(x + ox * s, y - 13 * s); ctx.lineTo(x + ox * s + walk * 2 * s, y); ctx.stroke(); }
    ctx.fillStyle = '#69675d';
    ctx.beginPath(); ctx.moveTo(x - 15 * s, y - 13 * s); ctx.lineTo(x - 14 * s, y - 39 * s); ctx.lineTo(x + 14 * s, y - 39 * s); ctx.lineTo(x + 15 * s, y - 13 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8a887c';
    ctx.beginPath(); ctx.moveTo(x - 11 * s, y - 37 * s); ctx.lineTo(x + 3 * s, y - 42 * s); ctx.lineTo(x + 10 * s, y - 36 * s); ctx.lineTo(x - 2 * s, y - 30 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d1a457'; ctx.fillRect(x - 13 * s, y - 27 * s, 26 * s, 3 * s);
    ctx.fillStyle = '#5d5a50';
    ctx.beginPath(); ctx.arc(x, y - 45 * s, 5.5 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#c99c45'; ctx.beginPath(); ctx.arc(x + 1 * s, y - 46 * s, 1.4 * s, 0, 6.3); ctx.fill();
    const swing = u.attackAnim > 0 ? Math.sin(u.attackAnim * Math.PI) : 0;
    ctx.strokeStyle = '#8f7b4f'; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(x + 13 * s, y - 31 * s); ctx.lineTo(x + 20 * s + swing * 6 * s, y - 19 * s - swing * 8 * s); ctx.stroke();
    ctx.fillStyle = '#b8b4a5';
    ctx.beginPath(); ctx.arc(x + 21 * s + swing * 6 * s, y - 19 * s - swing * 8 * s, 5 * s, 0, 6.3); ctx.fill();
  }

  drawDecoyUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y - Math.abs(Math.sin(time * 1.6 + u.id)) * 0.8 * s;
    ctx.strokeStyle = '#6d5430'; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(x, y - 7 * s); ctx.lineTo(x, y - 27 * s); ctx.moveTo(x - 8 * s, y - 20 * s); ctx.lineTo(x + 8 * s, y - 20 * s); ctx.stroke();
    ctx.fillStyle = '#a78b51';
    ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 24 * s); ctx.lineTo(x + 8 * s, y - 24 * s); ctx.lineTo(x + 5 * s, y - 8 * s); ctx.lineTo(x - 5 * s, y - 8 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c0a36a'; ctx.beginPath(); ctx.arc(x, y - 31 * s, 4 * s, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#806336'; ctx.lineWidth = 1.2 * s;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * 2.5 * s, y - 27 * s); ctx.lineTo(x + i * 3 * s, y - 9 * s); ctx.stroke(); }
    ctx.fillStyle = '#7d5f34'; ctx.beginPath(); ctx.ellipse(x, y - 35 * s, 6 * s, 1.8 * s, 0, 0, 6.3); ctx.fill();
  }

  drawBruteUnit(p, u, s, team, walk, time, bob) {
    const ctx = this.ctx;
    const x = p.x, y = p.y - bob * s;
    const boss = !!u.typeDef.boss;
    if (boss) {
      ctx.fillStyle = 'rgba(173,54,36,0.16)';
      ctx.beginPath(); ctx.arc(x, y - 25 * s, 27 * s + Math.sin(time * 3) * 2 * s, 0, 6.3); ctx.fill();
    }
    ctx.fillStyle = boss ? '#3b1f1c' : '#3e2c2a';
    ctx.beginPath(); ctx.moveTo(x - 10 * s, y - 10 * s); ctx.lineTo(x - 8 * s, y - 31 * s); ctx.lineTo(x + 8 * s, y - 31 * s); ctx.lineTo(x + 10 * s, y - 10 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2a211b'; ctx.lineWidth = 3.2 * s;
    ctx.beginPath(); ctx.moveTo(x - 5 * s, y - 10 * s); ctx.lineTo(x - 5 * s - walk * 2 * s, y); ctx.moveTo(x + 5 * s, y - 10 * s); ctx.lineTo(x + 5 * s + walk * 2 * s, y); ctx.stroke();
    ctx.fillStyle = team.cloth;
    ctx.fillRect(x - 8 * s, y - 24 * s, 16 * s, 3 * s);
    ctx.fillStyle = '#b1835f';
    ctx.beginPath(); ctx.arc(x, y - 35 * s, 4.6 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#4a4540';
    ctx.beginPath(); ctx.arc(x, y - 36.5 * s, 5.4 * s, Math.PI, 0); ctx.fill();
    ctx.fillStyle = boss ? '#d2b26e' : '#8e897d';
    ctx.beginPath(); ctx.moveTo(x - 5 * s, y - 39 * s); ctx.lineTo(x - 8 * s, y - 45 * s); ctx.lineTo(x - 2 * s, y - 41 * s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 5 * s, y - 39 * s); ctx.lineTo(x + 8 * s, y - 45 * s); ctx.lineTo(x + 2 * s, y - 41 * s); ctx.closePath(); ctx.fill();
    if (boss) {
      ctx.fillStyle = '#d1a456';
      ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 41 * s); ctx.lineTo(x - 10 * s, y - 48 * s); ctx.lineTo(x - 3 * s, y - 45 * s); ctx.lineTo(x, y - 50 * s); ctx.lineTo(x + 3 * s, y - 45 * s); ctx.lineTo(x + 10 * s, y - 48 * s); ctx.lineTo(x + 6 * s, y - 41 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7a2b22';
      ctx.beginPath(); ctx.moveTo(x - 10 * s, y - 29 * s); ctx.lineTo(x - 16 * s, y - 9 * s); ctx.lineTo(x - 4 * s, y - 15 * s); ctx.lineTo(x, y - 28 * s); ctx.closePath(); ctx.fill();
    }
    const swing = u.attackAnim > 0 ? Math.sin(u.attackAnim * Math.PI) : 0;
    ctx.strokeStyle = '#5b4025'; ctx.lineWidth = 2.4 * s;
    ctx.beginPath(); ctx.moveTo(x + 8 * s, y - 28 * s); ctx.lineTo(x + 13 * s + swing * 8 * s, y - 18 * s - swing * 12 * s); ctx.stroke();
    ctx.fillStyle = '#a9a69b';
    ctx.beginPath();
    ctx.moveTo(x + 11 * s + swing * 8 * s, y - 22 * s - swing * 12 * s);
    ctx.lineTo(x + 21 * s + swing * 9 * s, y - 31 * s - swing * 12 * s);
    ctx.lineTo(x + 18 * s + swing * 8 * s, y - 14 * s - swing * 9 * s);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = boss ? '#b2703a' : '#6a5f51';
    ctx.beginPath(); ctx.arc(x + 15 * s + swing * 8 * s, y - 22 * s - swing * 11 * s, 2.3 * s, 0, 6.3); ctx.fill();
  }

  drawWildlife(w, game, time) {
    if (w.kind !== 'deer') return;
    const p = this.screen(game, w.x, w.y);
    const z = game.camera.zoom;
    if (p.x < -60 || p.x > this.w + 60) return;
    const ctx = this.ctx;
    const graze = Math.sin(time * 0.8 + w.phase);
    const s = z;
    ctx.fillStyle = 'rgba(7,9,5,0.22)'; ctx.beginPath(); ctx.ellipse(p.x + 1 * s, p.y + 1 * s, 13 * s, 5 * s, 0, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#4b3525'; ctx.lineWidth = 1.5 * s;
    for (const ox of [-7, -3, 3, 7]) { ctx.beginPath(); ctx.moveTo(p.x + ox * s, p.y - 8 * s); ctx.lineTo(p.x + ox * s, p.y); ctx.stroke(); }
    ctx.fillStyle = '#8b6038'; ctx.beginPath(); ctx.ellipse(p.x, p.y - 12 * s, 10 * s, 5 * s, 0, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#8b6038'; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(p.x + 7 * s, p.y - 14 * s); ctx.lineTo(p.x + 12 * s, p.y - 24 * s + graze * 2 * s); ctx.stroke();
    ctx.fillStyle = '#9c6c40'; ctx.beginPath(); ctx.ellipse(p.x + 13 * s, p.y - 25 * s + graze * 2 * s, 4 * s, 2.4 * s, -0.3, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#6d4b2d'; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(p.x + 12 * s, p.y - 28 * s); ctx.lineTo(p.x + 10 * s, p.y - 34 * s); ctx.moveTo(p.x + 14 * s, p.y - 28 * s); ctx.lineTo(p.x + 17 * s, p.y - 33 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.x - 6 * s, p.y - 30 * s); ctx.lineTo(p.x - 4 * s, p.y - 36 * s); ctx.moveTo(p.x - 3 * s, p.y - 29 * s); ctx.lineTo(p.x - 1 * s, p.y - 35 * s); ctx.stroke();
  }

  drawProp(prop, game, time) {
    const p = this.screen(game, prop.x, prop.y);
    const z = game.camera.zoom;
    if (p.x < -100 || p.x > this.w + 100 || p.y < -100 || p.y > this.h + 100) return;
    const ctx = this.ctx;
    const s = z * (prop.size || 1);
    if (prop.kind === 'tent') {
      ctx.fillStyle = 'rgba(7,9,5,0.24)'; ctx.beginPath(); ctx.ellipse(p.x + 5 * s, p.y + 2 * s, 22 * s, 8 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#6f3c2e'; ctx.beginPath(); ctx.moveTo(p.x - 22 * s, p.y); ctx.lineTo(p.x, p.y - 30 * s); ctx.lineTo(p.x + 22 * s, p.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a4b38'; ctx.beginPath(); ctx.moveTo(p.x, p.y - 30 * s); ctx.lineTo(p.x + 22 * s, p.y); ctx.lineTo(p.x + 3 * s, p.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(32,19,13,0.55)'; ctx.beginPath(); ctx.moveTo(p.x - 7 * s, p.y); ctx.lineTo(p.x, p.y - 17 * s); ctx.lineTo(p.x + 1 * s, p.y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#4c2e22'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(p.x, p.y - 34 * s); ctx.lineTo(p.x, p.y - 28 * s); ctx.stroke();
    } else if (prop.kind === 'campfire') {
      const flick = Math.sin(time * 8 + prop.phase) * 2 * s;
      ctx.fillStyle = 'rgba(7,9,5,0.2)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 12 * s, 5 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#4a3d2e'; for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(p.x, p.y - 2 * s); ctx.rotate(i * 1.1); ctx.fillRect(-9 * s, -1 * s, 18 * s, 2 * s); ctx.restore(); }
      ctx.fillStyle = 'rgba(243,157,62,0.1)'; ctx.beginPath(); ctx.arc(p.x, p.y - 7 * s, (18 + flick) * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#b84424'; ctx.beginPath(); ctx.moveTo(p.x - 5 * s, p.y - 3 * s); ctx.quadraticCurveTo(p.x - 7 * s, p.y - 16 * s, p.x - 1 * s + flick, p.y - 22 * s); ctx.quadraticCurveTo(p.x + 7 * s, p.y - 12 * s, p.x + 5 * s, p.y - 3 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#efb65c'; ctx.beginPath(); ctx.moveTo(p.x - 2 * s, p.y - 4 * s); ctx.quadraticCurveTo(p.x - 2 * s, p.y - 13 * s, p.x + 1 * s + flick * 0.4, p.y - 16 * s); ctx.quadraticCurveTo(p.x + 4 * s, p.y - 9 * s, p.x + 2 * s, p.y - 4 * s); ctx.closePath(); ctx.fill();
      if (Math.random() < 0.04) this.smokePlume(p.x, p.y - 20 * s, z, time, 0.22);
    } else if (prop.kind === 'warcamp') {
      ctx.fillStyle = 'rgba(6,8,4,0.26)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 68 * s, 25 * s, 0, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#46321f'; ctx.lineWidth = 2 * s;
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; const x = p.x + Math.cos(a) * 60 * s, y = p.y + Math.sin(a) * 22 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - (16 + (i % 3) * 5) * s); ctx.stroke(); }
      this.flag(p.x + 2 * s, p.y - 10 * s, 48 * s, z, time, 4.2);
    } else if (prop.kind === 'palisade') {
      ctx.strokeStyle = '#5a4127'; ctx.lineWidth = 3.2 * s;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(p.x + i * 6 * s, p.y); ctx.lineTo(p.x + i * 6 * s, p.y - (15 + Math.abs(i) * 2) * s); ctx.stroke(); }
      ctx.strokeStyle = '#3f2d1a'; ctx.lineWidth = 1.4 * s;
      ctx.beginPath(); ctx.moveTo(p.x - 14 * s, p.y - 10 * s); ctx.lineTo(p.x + 14 * s, p.y - 10 * s); ctx.stroke();
    } else if (prop.kind === 'cart') {
      ctx.fillStyle = 'rgba(7,9,5,0.24)'; ctx.beginPath(); ctx.ellipse(p.x + 3 * s, p.y + 2 * s, 20 * s, 7 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#624324'; ctx.fillRect(p.x - 13 * s, p.y - 18 * s, 25 * s, 11 * s);
      ctx.strokeStyle = '#3e2b18'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.arc(p.x - 10 * s, p.y - 3 * s, 5 * s, 0, 6.3); ctx.stroke(); ctx.beginPath(); ctx.arc(p.x + 9 * s, p.y - 3 * s, 5 * s, 0, 6.3); ctx.stroke();
      ctx.strokeStyle = '#5b4124'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(p.x + 11 * s, p.y - 13 * s); ctx.lineTo(p.x + 24 * s, p.y - 9 * s); ctx.stroke();
      ctx.fillStyle = '#b08a4e'; ctx.beginPath(); ctx.ellipse(p.x - 3 * s, p.y - 20 * s, 7 * s, 3.6 * s, 0.2, 0, 6.3); ctx.fill();
    } else if (prop.kind === 'hay') {
      ctx.fillStyle = 'rgba(7,9,5,0.22)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 1 * s, 13 * s, 5 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#a98745'; ctx.beginPath(); ctx.ellipse(p.x, p.y - 8 * s, 12 * s, 8 * s, 0, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#c5a45e'; ctx.lineWidth = 0.8 * s; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(p.x - 10 * s + i * 2.6 * s, p.y - 2 * s); ctx.lineTo(p.x - 6 * s + i * 2.2 * s, p.y - 14 * s); ctx.stroke(); }
    } else if (prop.kind === 'crates') {
      ctx.fillStyle = '#7b5831'; ctx.fillRect(p.x - 9 * s, p.y - 13 * s, 10 * s, 11 * s); ctx.fillStyle = '#8e673b'; ctx.fillRect(p.x + 2 * s, p.y - 9 * s, 9 * s, 8 * s);
      ctx.strokeStyle = '#4f371e'; ctx.lineWidth = 1 * s; ctx.strokeRect(p.x - 9 * s, p.y - 13 * s, 10 * s, 11 * s); ctx.strokeRect(p.x + 2 * s, p.y - 9 * s, 9 * s, 8 * s);
      ctx.beginPath(); ctx.moveTo(p.x - 9 * s, p.y - 8 * s); ctx.lineTo(p.x + 1 * s, p.y - 13 * s); ctx.stroke();
    } else if (prop.kind === 'well') {
      ctx.fillStyle = 'rgba(7,9,5,0.22)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 1 * s, 13 * s, 5 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#777261'; ctx.beginPath(); ctx.ellipse(p.x, p.y - 5 * s, 11 * s, 5 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#384c4d'; ctx.beginPath(); ctx.ellipse(p.x, p.y - 6 * s, 6 * s, 2.6 * s, 0, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#5d4325'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(p.x - 8 * s, p.y - 6 * s); ctx.lineTo(p.x - 8 * s, p.y - 22 * s); ctx.moveTo(p.x + 8 * s, p.y - 6 * s); ctx.lineTo(p.x + 8 * s, p.y - 22 * s); ctx.stroke();
      ctx.strokeStyle = '#7b3c2c'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(p.x - 11 * s, p.y - 21 * s); ctx.lineTo(p.x, p.y - 27 * s); ctx.lineTo(p.x + 11 * s, p.y - 21 * s); ctx.stroke();
    } else if (prop.kind === 'stump') {
      ctx.fillStyle = '#5b3e24'; ctx.beginPath(); ctx.ellipse(p.x, p.y - 3 * s, 6 * s, 3 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#7d5a33'; ctx.beginPath(); ctx.ellipse(p.x, p.y - 4 * s, 4 * s, 2 * s, 0, 0, 6.3); ctx.fill();
    } else if (prop.kind === 'ruin') {
      ctx.fillStyle = 'rgba(7,9,5,0.22)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 1 * s, 17 * s, 6 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#77725f'; ctx.fillRect(p.x - 14 * s, p.y - 22 * s, 6 * s, 22 * s); ctx.fillRect(p.x + 7 * s, p.y - 17 * s, 5 * s, 17 * s);
      ctx.strokeStyle = '#8b8570'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(p.x - 12 * s, p.y - 22 * s); ctx.quadraticCurveTo(p.x, p.y - 34 * s, p.x + 10 * s, p.y - 20 * s); ctx.stroke();
      ctx.fillStyle = '#686351'; ctx.fillRect(p.x - 18 * s, p.y - 3 * s, 9 * s, 4 * s);
    } else if (prop.kind === 'banner') {
      ctx.strokeStyle = '#4a3520'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 34 * s); ctx.stroke();
      this.flag(p.x, p.y - 34 * s, 0, z, time, prop.x);
    } else if (prop.kind === 'bush') {
      ctx.fillStyle = 'rgba(7,9,5,0.18)'; ctx.beginPath(); ctx.ellipse(p.x + 2 * s, p.y + 1 * s, 11 * s, 4 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#3e5a2d'; ctx.beginPath(); ctx.arc(p.x - 3 * s, p.y - 6 * s, 7 * s, 0, 6.3); ctx.arc(p.x + 4 * s, p.y - 5 * s, 6 * s, 0, 6.3); ctx.arc(p.x, p.y - 10 * s, 6.5 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(121,150,75,0.35)'; ctx.beginPath(); ctx.arc(p.x - 3 * s, p.y - 9 * s, 2.4 * s, 0, 6.3); ctx.fill();
    } else if (prop.kind === 'rocks') {
      ctx.fillStyle = '#6f6b5b'; ctx.beginPath(); ctx.arc(p.x - 5 * s, p.y - 3 * s, 4.5 * s, 0, 6.3); ctx.arc(p.x + 2 * s, p.y - 4 * s, 5.5 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#8b8673'; ctx.beginPath(); ctx.arc(p.x - 1 * s, p.y - 6 * s, 2.4 * s, 0, 6.3); ctx.fill();
    } else if (prop.kind === 'flowers') {
      for (let i = 0; i < 5; i++) {
        const ox = (hash2(prop.x, i, 3) - 0.5) * 14, oy = (hash2(prop.y, i, 5) - 0.5) * 7;
        ctx.fillStyle = i % 2 ? 'rgba(225,204,135,0.8)' : 'rgba(183,144,177,0.7)';
        ctx.beginPath(); ctx.arc(p.x + ox * s, p.y + oy * s, 1.1 * s, 0, 6.3); ctx.fill();
        ctx.strokeStyle = 'rgba(75,98,50,0.6)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(p.x + ox * s, p.y + oy * s); ctx.lineTo(p.x + ox * s, p.y + oy * s + 2.5 * s); ctx.stroke();
      }
    }
  }

  drawProjectiles(game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    for (const p of game.projectiles) {
      const pos = this.screen(game, p.x, p.y);
      const tgt = this.screen(game, p.tx, p.ty);
      const dx = tgt.x - pos.x, dy = tgt.y - pos.y;
      const angle = Math.atan2(dy, dx);
      const zOff = 17 * z;
      ctx.save();
      ctx.translate(pos.x, pos.y - zOff);
      ctx.rotate(angle);
      ctx.strokeStyle = '#3b2b19'; ctx.lineWidth = 1.2 * z;
      ctx.beginPath(); ctx.moveTo(-10 * z, 0); ctx.lineTo(6 * z, 0); ctx.stroke();
      ctx.fillStyle = '#d5cba9';
      ctx.beginPath(); ctx.moveTo(6 * z, 0); ctx.lineTo(2 * z, -2 * z); ctx.lineTo(2 * z, 2 * z); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(240,229,196,0.6)'; ctx.lineWidth = 0.8 * z;
      ctx.beginPath(); ctx.moveTo(-8 * z, 0); ctx.lineTo(-11 * z, -2 * z); ctx.moveTo(-8 * z, 0); ctx.lineTo(-11 * z, 2 * z); ctx.stroke();
      ctx.restore();
    }
  }

  drawSpark(x,y,radius,color,life) {
    if(this.sparkCacheEnabled===false){this.ctx.fillStyle=color.replace('ALPHA',life);this.ctx.beginPath();this.ctx.arc(x,y,radius,0,6.3);this.ctx.fill();return;}
    this.sparkCache ||= new Map();this.sparkSpriteStats ||= {hits:0,misses:0};
    let canvas=this.sparkCache.get(color);
    if(!canvas) {
      if(this.sparkCache.size>=64)this.sparkCache.clear();
      canvas=document.createElement('canvas');canvas.width=canvas.height=64;
      const ctx=canvas.getContext('2d');ctx.fillStyle=color.replace('ALPHA',1);ctx.beginPath();ctx.arc(32,32,24,0,6.3);ctx.fill();
      this.sparkCache.set(color,canvas);this.sparkSpriteStats.misses++;
    } else this.sparkSpriteStats.hits++;
    const alpha=this.ctx.globalAlpha;
    this.ctx.globalAlpha=alpha*(color.includes('ALPHA')?life:1);
    this.ctx.drawImage(canvas,x-radius*4/3,y-radius*4/3,radius*8/3,radius*8/3);
    this.ctx.globalAlpha=alpha;
  }

  drawParticles(game, time) {
    const ctx = this.ctx, z = game.camera.zoom;
    for (const p of game.particles) {
      const pos = this.screen(game, p.x, p.y);
      const life = p.life / p.maxLife;
      const yy = pos.y - (p.z || 0) * z;
      if (p.kind === 'smoke') {
        ctx.fillStyle = `rgba(${p.color},${life * 0.24})`;
        ctx.beginPath(); ctx.arc(pos.x, yy, (p.size * (2.2 - life)) * z, 0, 6.3); ctx.fill();
      } else if (p.kind === 'text') {
        ctx.font = `${(p.size || 9) * z}px Cinzel, serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = p.color.replace('ALPHA', Math.min(1, life * 1.8));
        ctx.fillText(p.text, pos.x, yy - (1 - life) * 18 * z);
      } else if (p.kind === 'ring') {
        ctx.strokeStyle = p.color.replace('ALPHA', life * 0.65);
        ctx.lineWidth = 1.5 * z;
        ctx.beginPath(); ctx.ellipse(pos.x, yy, (20 + (1 - life) * 30) * z, (10 + (1 - life) * 15) * z, 0, 0, 6.3); ctx.stroke();
      } else if (p.kind === 'spark') {
        this.drawSpark(pos.x,yy,(p.size||1.3)*z*life,p.color,life);
      } else if (p.kind === 'slash') {
        ctx.strokeStyle = p.color.replace('ALPHA', life * 0.7);
        ctx.lineWidth = 2 * z;
        ctx.beginPath(); ctx.arc(pos.x, yy, (12 + (1 - life) * 10) * z, -0.9, 0.6); ctx.stroke();
      }
    }
  }

  drawBuildGhost(game, time) {
    if (!game.placement) return;
    const { type, x, y, valid } = game.placement;
    const bd = game.buildingDefs ? game.buildingDefs[type] : null;
    if (!bd) return;
    const z = game.camera.zoom;
    const ctx = this.ctx;
    const A = this.screen(game, x, y), B = this.screen(game, x + bd.w, y);
    const C = this.screen(game, x + bd.w, y + bd.h), D = this.screen(game, x, y + bd.h);
    ctx.save();
    ctx.fillStyle = valid ? 'rgba(117,170,103,0.27)' : 'rgba(190,78,62,0.29)';
    ctx.strokeStyle = valid ? 'rgba(170,218,143,0.92)' : 'rgba(235,128,106,0.95)';
    ctx.lineWidth = 1.6 * z;
    ctx.setLineDash([6 * z, 4 * z]);
    ctx.lineDashOffset = -time * 12;
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.lineTo(D.x, D.y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.setLineDash([]);
    const p = this.screen(game, x + bd.w / 2, y + bd.h / 2);
    ctx.fillStyle = valid ? 'rgba(228,242,199,0.85)' : 'rgba(255,200,187,0.9)';
    ctx.font = `${14 * z}px Cinzel, serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${bd.name}`, p.x, p.y - 8 * z);
    ctx.font = `${8 * z}px Lato, sans-serif`;
    ctx.fillText(valid ? 'Click to build' : 'Blocked or unaffordable', p.x, p.y + 5 * z);
    ctx.restore();
  }

  drawAtmosphere(game, time) {
    const ctx = this.ctx;
    if (!game.inMenu) {
      for (let i = 0; i < this.motes.length; i++) {
        const m = this.motes[i];
        const x = (m.x * this.w + Math.sin(time * m.speed + m.phase) * 24 + time * 4) % (this.w + 20);
        const y = (m.y * this.h + Math.cos(time * m.speed * 0.7 + m.phase) * 15 - time * 2) % (this.h + 20);
        const a = 0.16 + Math.sin(time * 1.4 + m.phase) * 0.1;
        ctx.fillStyle = `rgba(244,204,118,${a})`;
        ctx.beginPath(); ctx.arc(x, y, m.size, 0, 6.3); ctx.fill();
      }
    }
    for (const bird of this.birds) {
      const x = ((time * bird.speed + bird.o) % 1.2) * (this.w + 200) - 100;
      const y = bird.y * this.h + Math.sin(time * 0.4 + bird.o * 10) * 10;
      ctx.strokeStyle = 'rgba(31,36,26,0.48)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x - bird.size, y);
      ctx.quadraticCurveTo(x - bird.size * 0.4, y - bird.size * 0.55, x, y);
      ctx.quadraticCurveTo(x + bird.size * 0.4, y - bird.size * 0.55, x + bird.size, y);
      ctx.stroke();
    }
  }

  drawSelectionBox(game) {
    if (!game.dragBox) return;
    const { x, y, w, h } = game.dragBox;
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(224,192,124,0.08)';
    ctx.strokeStyle = 'rgba(235,208,146,0.72)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x + 0.5, y + 0.5, w, h);
    ctx.restore();
  }
}

function ctxSave(ctx, fn) {
  ctx.save();
  fn();
  ctx.restore();
}
