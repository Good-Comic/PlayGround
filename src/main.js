import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { createWorld } from './world.js'
import { createWeapon } from './weapon.js'
import { createEffects } from './effects.js'

const canvas = document.getElementById('scene')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', stencil: false })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.99

const scene = new THREE.Scene()

function buildEnvironment() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const x = c.getContext('2d')
  const sky = x.createLinearGradient(0, 0, 0, 256)
  sky.addColorStop(0, '#1c3249')
  sky.addColorStop(0.38, '#88684f')
  sky.addColorStop(0.52, '#d0965f')
  sky.addColorStop(0.58, '#7a6249')
  sky.addColorStop(1, '#33291f')
  x.fillStyle = sky
  x.fillRect(0, 0, 512, 256)
  const sun = x.createRadialGradient(120, 128, 0, 120, 128, 90)
  sun.addColorStop(0, 'rgba(255,244,220,1)')
  sun.addColorStop(0.2, 'rgba(255,196,120,0.7)')
  sun.addColorStop(1, 'rgba(255,150,60,0)')
  x.fillStyle = sun
  x.fillRect(0, 0, 300, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.mapping = THREE.EquirectangularReflectionMapping
  tex.colorSpace = THREE.SRGBColorSpace
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromEquirectangular(tex).texture
  pmrem.dispose()
  tex.dispose()
  scene.environment = env
  scene.environmentIntensity = 0.42
}
buildEnvironment()

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.02, 700)
camera.rotation.order = 'YXZ'
camera.position.set(0, 1.68, 3.4)
scene.add(camera)

const world = createWorld(scene, renderer)
const weapon = createWeapon(camera, scene)
const effects = createEffects(scene)

const composer = new EffectComposer(renderer)
composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
composer.addPass(new RenderPass(scene, camera))
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.37, 0.62, 0.97)
composer.addPass(bloom)
composer.addPass(new SMAAPass())
composer.addPass(new OutputPass())

const grade = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignette: { value: 0.78 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    void main(){
      vec2 d = vUv - 0.5;
      float r2 = dot(d, d);
      vec2 offset = d * r2 * 0.012;
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + offset).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - offset).b;
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(l), col, 1.1);
      col = (col - 0.5) * 1.07 + 0.5;
      col *= vec3(1.015, 1.0, 0.975);
      col += vec3(0.012, 0.002, -0.008) * (1.0 - l);
      float vig = smoothstep(0.92, 0.22, length(d * vec2(1.0, 0.92)));
      col *= mix(uVignette, 1.0, vig);
      float n = fract(sin(dot(vUv * vec2(1024.0, 768.0) + uTime * 41.0, vec2(12.9898, 78.233))) * 43758.5453);
      col += (n - 0.5) * 0.018;
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `
})
composer.addPass(grade)

const raycaster = new THREE.Raycaster()
const center = new THREE.Vector2(0, 0)
const forward = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3(0, 1, 0)
const playerEye = new THREE.Vector3()
const moveVec = new THREE.Vector3()

const state = {
  running: false,
  started: false,
  yaw: 0,
  pitch: -0.015,
  recoilPitch: 0,
  recoilYaw: 0,
  shake: 0,
  velocity: new THREE.Vector2(),
  vertical: 0,
  grounded: true,
  crouch: false,
  sprinting: false,
  ads: false,
  moving: false,
  pointerLocked: false,
  health: 100,
  armor: 100,
  mag: 30,
  maxMag: 30,
  reserve: 180,
  grenades: 2,
  fireTimer: 0,
  reloadTimer: 0,
  reloadDuration: 2.05,
  score: 0,
  kills: 0,
  lastDamage: -99,
  time: 0,
  lookX: 0,
  lookY: 0,
  fov: 74,
  hitFlash: 0,
  activeEnemy: null,
  lost: false,
  respawnTimer: 0
}

const totalEnemies = world.enemies.length

const ui = {
  menu: document.getElementById('menu'),
  hud: document.getElementById('hud'),
  start: document.getElementById('start-button'),
  healthFill: document.getElementById('health-fill'),
  healthGhost: document.getElementById('health-ghost'),
  healthValue: document.getElementById('health-value'),
  armor: document.getElementById('armor-segments'),
  ammoMag: document.getElementById('ammo-mag'),
  ammoReserve: document.getElementById('ammo-reserve'),
  grenades: document.getElementById('grenades'),
  score: document.getElementById('score'),
  kills: document.getElementById('kills'),
  timer: document.getElementById('timer'),
  objectiveTitle: document.getElementById('objective-title'),
  objectiveProgress: document.getElementById('objective-progress'),
  compassStrip: document.getElementById('compass-strip'),
  compassDeg: document.getElementById('compass-deg'),
  minimap: document.getElementById('minimap'),
  minimapCoords: document.getElementById('minimap-coords'),
  crosshair: document.getElementById('crosshair'),
  hitmarker: document.getElementById('hitmarker'),
  killFeed: document.getElementById('kill-feed'),
  reloadHint: document.getElementById('reload-hint'),
  reloadFill: document.getElementById('reload-fill'),
  lockHint: document.getElementById('lock-hint'),
  damageFlash: document.getElementById('damage-flash'),
  damageArcs: document.getElementById('damage-arcs'),
  toast: document.getElementById('toast'),
  spotted: document.getElementById('spotted'),
  threat: document.getElementById('threat-text'),
  fireMode: document.getElementById('fire-mode')
}

for (let i = 0; i < 5; i++) {
  const seg = document.createElement('i')
  ui.armor.appendChild(seg)
}

function buildCompass() {
  const frag = document.createDocumentFragment()
  const labels = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' }
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let d = 0; d < 360; d += 5) {
      const tick = document.createElement('div')
      tick.className = 'tick' + (d % 45 === 0 ? ' major' : '')
      tick.style.left = `${cycle * 2160 + d * 6}px`
      frag.appendChild(tick)
    }
    for (let d = 0; d < 360; d += 45) {
      const c = document.createElement('div')
      c.className = 'cardinal' + (d === 0 ? ' n' : '')
      c.textContent = labels[d]
      c.style.left = `${cycle * 2160 + d * 6}px`
      frag.appendChild(c)
    }
  }
  ui.compassStrip.appendChild(frag)
}
buildCompass()

const mmCtx = ui.minimap.getContext('2d')

function updateCompass() {
  const heading = ((-state.yaw * 180) / Math.PI % 360 + 360) % 360
  const x = 2160 + heading * 6
  ui.compassStrip.style.transform = `translateX(${210 - x}px)`
  ui.compassDeg.textContent = String(Math.round(heading) % 360).padStart(3, '0')
}

function drawMinimap() {
  const w = ui.minimap.width
  const h = ui.minimap.height
  const cx = w / 2
  const cy = h / 2
  mmCtx.clearRect(0, 0, w, h)
  mmCtx.save()
  mmCtx.beginPath()
  mmCtx.arc(cx, cy, cx - 3, 0, Math.PI * 2)
  mmCtx.clip()
  const bg = mmCtx.createRadialGradient(cx, cy, 10, cx, cy, cx)
  bg.addColorStop(0, 'rgba(28,36,33,0.95)')
  bg.addColorStop(1, 'rgba(8,12,11,0.98)')
  mmCtx.fillStyle = bg
  mmCtx.fillRect(0, 0, w, h)

  const scale = 2.9
  const px = camera.position.x
  const pz = camera.position.z

  mmCtx.strokeStyle = 'rgba(150,175,155,0.13)'
  mmCtx.lineWidth = 1
  for (let i = -5; i <= 5; i++) {
    mmCtx.beginPath()
    mmCtx.moveTo(cx + i * 22, 0)
    mmCtx.lineTo(cx + i * 22, h)
    mmCtx.stroke()
    mmCtx.beginPath()
    mmCtx.moveTo(0, cy + i * 22)
    mmCtx.lineTo(w, cy + i * 22)
    mmCtx.stroke()
  }

  const toMap = (x, z) => [cx + (x - px) * scale, cy + (z - pz) * scale]

  mmCtx.strokeStyle = 'rgba(210,190,150,0.4)'
  mmCtx.lineWidth = 9
  const a = toMap(0, 20)
  const b = toMap(0, -80)
  mmCtx.beginPath()
  mmCtx.moveTo(a[0], a[1])
  mmCtx.lineTo(b[0], b[1])
  mmCtx.stroke()

  mmCtx.strokeStyle = 'rgba(225,180,110,0.55)'
  mmCtx.lineWidth = 2
  mmCtx.fillStyle = 'rgba(225,180,110,0.08)'
  const compound = [[-20, -22], [20, -22], [20, -58], [-20, -58]]
  mmCtx.beginPath()
  compound.forEach(([x, z], i) => {
    const p = toMap(x, z)
    if (i === 0) mmCtx.moveTo(p[0], p[1])
    else mmCtx.lineTo(p[0], p[1])
  })
  mmCtx.closePath()
  mmCtx.fill()
  mmCtx.stroke()

  mmCtx.fillStyle = 'rgba(230,200,160,0.32)'
  for (const [x, z, ww, dd] of [[10.5, -47, 12, 8], [-14.5, -55.8, 5.5, 4], [-14.5, -31.5, 6, 3], [12.5, -30.5, 6, 3], [-11.5, -44, 3.6, 3.6], [8.1, -25.2, 3, 5]]) {
    const p = toMap(x - ww / 2, z - dd / 2)
    mmCtx.fillRect(p[0], p[1], ww * scale, dd * scale)
  }

  const facing = state.yaw
  for (const en of world.enemies) {
    if (!en.alive) continue
    const p = toMap(en.group.position.x, en.group.position.z)
    if (p[0] < -10 || p[0] > w + 10 || p[1] < -10 || p[1] > h + 10) continue
    mmCtx.fillStyle = en.alert ? '#ff4a34' : 'rgba(255,110,80,0.65)'
    mmCtx.beginPath()
    mmCtx.arc(p[0], p[1], 3.6, 0, Math.PI * 2)
    mmCtx.fill()
    mmCtx.strokeStyle = 'rgba(255,80,50,0.35)'
    mmCtx.lineWidth = 1
    mmCtx.beginPath()
    mmCtx.arc(p[0], p[1], 6.5, 0, Math.PI * 2)
    mmCtx.stroke()
  }

  mmCtx.save()
  mmCtx.translate(cx, cy)
  mmCtx.rotate(-facing)
  mmCtx.fillStyle = '#fff'
  mmCtx.beginPath()
  mmCtx.moveTo(0, -8)
  mmCtx.lineTo(5.5, 6)
  mmCtx.lineTo(0, 3)
  mmCtx.lineTo(-5.5, 6)
  mmCtx.closePath()
  mmCtx.fill()
  mmCtx.restore()

  mmCtx.strokeStyle = 'rgba(255,122,26,0.6)'
  mmCtx.lineWidth = 1.5
  mmCtx.beginPath()
  const heading = ((-state.yaw * 180) / Math.PI % 360 + 360) % 360
  mmCtx.arc(cx, cy, cx - 6, -Math.PI / 2 + (-heading * Math.PI) / 180 - 0.32, -Math.PI / 2 + (-heading * Math.PI) / 180 + 0.32)
  mmCtx.stroke()

  mmCtx.fillStyle = 'rgba(255,255,255,0.35)'
  mmCtx.font = '8px monospace'
  mmCtx.fillText('N', cx - 2, 14)
  mmCtx.restore()
  ui.minimapCoords.textContent = `GRID ${(34.21 + camera.position.x * 0.012).toFixed(2)} / ${(9.67 - camera.position.z * 0.009).toFixed(2)}`
}

let audioCtx = null
function initAudio() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const master = audioCtx.createGain()
    master.gain.value = 0.32
    master.connect(audioCtx.destination)
    audioCtx.master = master
    const wind = audioCtx.createBufferSource()
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 3, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.18
    wind.buffer = buffer
    wind.loop = true
    const filter = audioCtx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 380
    const gain = audioCtx.createGain()
    gain.gain.value = 0.16
    wind.connect(filter).connect(gain).connect(master)
    wind.start()
  } catch (e) { audioCtx = null }
}

function noiseBurst(duration, freq, volume, type = 'lowpass') {
  if (!audioCtx) return
  const t = audioCtx.currentTime
  const len = Math.floor(audioCtx.sampleRate * duration)
  const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = audioCtx.createBufferSource()
  src.buffer = buffer
  const filter = audioCtx.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  const gain = audioCtx.createGain()
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  src.connect(filter).connect(gain).connect(audioCtx.master)
  src.start(t)
  src.stop(t + duration)
}

function gunSound() {
  noiseBurst(0.09, 1800, 0.5)
  if (!audioCtx) return
  const t = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(140, t)
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.12)
  gain.gain.setValueAtTime(0.55, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16)
  osc.connect(gain).connect(audioCtx.master)
  osc.start(t)
  osc.stop(t + 0.18)
}

function enemyGunSound() {
  noiseBurst(0.07, 1100, 0.18)
}

function hitSound(headshot = false) {
  if (!audioCtx) return
  const t = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(headshot ? 1560 : 980, t)
  osc.frequency.exponentialRampToValueAtTime(headshot ? 920 : 620, t + 0.06)
  gain.gain.setValueAtTime(0.16, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
  osc.connect(gain).connect(audioCtx.master)
  osc.start(t)
  osc.stop(t + 0.09)
}

function reloadSound() {
  noiseBurst(0.04, 1400, 0.12, 'bandpass')
  setTimeout(() => noiseBurst(0.05, 800, 0.12, 'bandpass'), 900)
  setTimeout(() => noiseBurst(0.04, 1600, 0.1, 'bandpass'), 1700)
}

function showToast(text, duration = 2200) {
  ui.toast.textContent = text
  ui.toast.classList.remove('hidden')
  ui.toast.style.animation = 'none'
  void ui.toast.offsetWidth
  ui.toast.style.animation = ''
  clearTimeout(showToast.timer)
  showToast.timer = setTimeout(() => ui.toast.classList.add('hidden'), duration)
}

function addKillFeed(name, weaponName, victim, headshot) {
  const el = document.createElement('div')
  el.className = 'feed-item'
  el.innerHTML = `<span class="killer">${name}</span><span class="weapon">${headshot ? 'HEADSHOT · ' : ''}${weaponName}</span><span class="victim">${victim}</span>`
  ui.killFeed.appendChild(el)
  while (ui.killFeed.children.length > 4) ui.killFeed.firstChild.remove()
  setTimeout(() => el.remove(), 5200)
}

function damageArc() {
  const arc = document.createElement('div')
  arc.className = 'dmg-arc'
  arc.style.transform = `rotate(${Math.random() * 360}deg)`
  ui.damageArcs.appendChild(arc)
  setTimeout(() => arc.remove(), 1150)
}

function updateHud() {
  ui.healthFill.style.width = `${Math.max(0, state.health)}%`
  ui.healthGhost.style.width = `${Math.max(0, state.health)}%`
  ui.healthValue.textContent = Math.ceil(Math.max(0, state.health))
  ui.healthFill.parentElement.classList.toggle('low', state.health < 35)
  ui.ammoMag.textContent = String(state.mag).padStart(2, '0')
  ui.ammoMag.classList.toggle('empty', state.mag === 0)
  ui.ammoReserve.textContent = String(state.reserve)
  ui.grenades.textContent = '◆'.repeat(state.grenades) + '◇'.repeat(Math.max(0, 2 - state.grenades))
  ui.score.textContent = String(state.score).padStart(6, '0')
  ui.kills.textContent = String(state.kills).padStart(2, '0')
  const secs = Math.floor(state.time)
  ui.timer.textContent = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
  ui.objectiveProgress.textContent = `${state.kills} / ${totalEnemies}`
  const armor = Math.ceil(state.armor / 20)
  Array.from(ui.armor.children).forEach((el, i) => el.classList.toggle('off', i >= armor))
  const spread = state.ads ? 5 : state.moving ? (state.sprinting ? 19 : 13) : 11
  ui.crosshair.style.setProperty('--spread', `${spread}px`)
  ui.fireMode.textContent = state.ads ? 'ADS' : 'AUTO'
  if (state.reloadTimer > 0) {
    ui.reloadHint.classList.remove('hidden')
    ui.reloadFill.style.width = `${Math.min(100, (1 - state.reloadTimer / state.reloadDuration) * 100)}%`
  } else {
    ui.reloadHint.classList.add('hidden')
  }
}

function startGame() {
  if (state.started) return
  state.started = true
  state.running = true
  initAudio()
  ui.menu.classList.add('closing')
  setTimeout(() => ui.menu.classList.add('hidden'), 560)
  ui.hud.classList.remove('hidden')
  ui.lockHint.classList.remove('hidden')
  setTimeout(() => ui.lockHint.classList.add('hidden'), 3800)
  world.enemies[0].alert = true
  addKillFeed('OVERWATCH', 'RADIO', 'ELEMENT INBOUND', false)
  setTimeout(() => addKillFeed('OVERWATCH', 'SITREP', 'WEAPONS FREE', false), 1100)
  showToast('MISSION ACTIVE · CLEAR THE COMPOUND', 3000)
  setTimeout(() => document.body.requestPointerLock?.(), 120)
}

ui.start.addEventListener('click', startGame)
canvas.addEventListener('click', () => {
  if (state.started && document.pointerLockElement !== canvas) canvas.requestPointerLock?.()
})

document.addEventListener('pointerlockchange', () => {
  state.pointerLocked = document.pointerLockElement === canvas
  ui.lockHint.classList.add('hidden')
})
document.addEventListener('pointerlockerror', () => { state.pointerLocked = false })

document.addEventListener('mousemove', (e) => {
  if (!state.running) return
  if (!state.pointerLocked && !dragLook) return
  const sens = 0.0021 * (state.ads ? 0.62 : 1)
  state.yaw -= e.movementX * sens
  state.pitch -= e.movementY * sens
  state.pitch = Math.max(-1.35, Math.min(1.35, state.pitch))
  state.lookX = THREE.MathUtils.clamp(e.movementX * 0.6, -14, 14)
  state.lookY = THREE.MathUtils.clamp(e.movementY * 0.6, -14, 14)
})

let dragLook = false
canvas.addEventListener('mousedown', (e) => {
  if (!state.running) return
  if (!state.pointerLocked) dragLook = true
  if (e.button === 0) state.firing = true
  if (e.button === 2) state.ads = true
})
window.addEventListener('mouseup', (e) => {
  dragLook = false
  if (e.button === 0) state.firing = false
  if (e.button === 2) state.ads = false
})
canvas.addEventListener('contextmenu', (e) => e.preventDefault())
window.addEventListener('blur', () => { state.firing = false; state.ads = false })

const keys = {}
window.addEventListener('keydown', (e) => {
  keys[e.code] = true
  if (e.code === 'Space') e.preventDefault()
  if (!state.started) return
  if (e.code === 'KeyR') startReload()
  if (e.code === 'KeyG') throwGrenade()
})
window.addEventListener('keyup', (e) => { keys[e.code] = false })

function startReload() {
  if (state.reloadTimer > 0 || state.mag === state.maxMag || state.reserve <= 0) return
  state.reloadTimer = state.reloadDuration
  weapon.startReload(state.reloadDuration)
  reloadSound()
}

function throwGrenade() {
  if (state.grenades <= 0) return
  state.grenades--
  showToast('FRAG OUT', 900)
  state.shake = Math.max(state.shake, 0.4)
  setTimeout(() => {
    state.shake = Math.max(state.shake, 0.9)
    for (const en of world.enemies) {
      if (!en.alive) continue
      if (en.group.position.distanceTo(camera.position) < 8) {
        const killed = world.damageEnemy(en, 160, 'body')
        effects.spawnBlood(en.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)), new THREE.Vector3(0, 1, 0))
        if (killed) onEnemyKilled(en, false)
      }
    }
  }, 850)
}

function attemptShot() {
  if (!state.running || state.firing === false) return
  if (state.fireTimer > 0 || state.reloadTimer > 0) return
  if (state.mag <= 0) {
    startReload()
    return
  }
  state.mag--
  state.fireTimer = 0.093
  weapon.fire()
  gunSound()
  camera.updateMatrixWorld()
  const muzzle = weapon.muzzleWorld()
  const origin = camera.getWorldPosition(playerEye)
  forward.set(0, 0, -1).applyQuaternion(camera.quaternion)
  right.set(1, 0, 0).applyQuaternion(camera.quaternion)
  const spread = state.ads ? 0.0012 : (state.moving ? 0.013 : 0.0055)
  const dir = forward.clone()
  dir.x += (Math.random() - 0.5) * spread
  dir.y += (Math.random() - 0.5) * spread
  dir.z += (Math.random() - 0.5) * spread
  dir.normalize()
  raycaster.set(origin, dir)
  raycaster.far = 220
  const hits = raycaster.intersectObjects(world.shootables, false)
  let target = null
  for (const h of hits) {
    const en = h.object.userData.enemy
    if (en && !en.alive) continue
    target = h
    break
  }
  const end = target ? target.point.clone() : origin.clone().addScaledVector(dir, 160)
  effects.spawnTracer(muzzle, end, 0xffc97a, state.ads ? 0.7 : 1)
  effects.spawnCasing(muzzle.clone().addScaledVector(dir, -0.35).addScaledVector(right, 0.09), right)
  state.recoilPitch += 0.009 + Math.random() * 0.004
  state.recoilYaw += (Math.random() - 0.5) * 0.004
  state.shake = Math.max(state.shake, 0.06)

  if (target) {
    const en = target.object.userData.enemy
    if (en) {
      const part = target.object.userData.part
      const headshot = part === 'head'
      const damage = headshot ? 115 : part === 'legs' ? 32 : 48
      effects.spawnBlood(target.point, dir)
      const killed = world.damageEnemy(en, damage, part)
      ui.hitmarker.classList.remove('show')
      void ui.hitmarker.offsetWidth
      ui.hitmarker.classList.add('show')
      hitSound(headshot)
      if (killed) onEnemyKilled(en, headshot)
    } else {
      let normal = new THREE.Vector3(0, 1, 0)
      if (target.face) {
        normal.copy(target.face.normal).transformDirection(target.object.matrixWorld).normalize()
      }
      effects.spawnImpact(target.point, normal)
    }
  }
}

function onEnemyKilled(enemy, headshot) {
  enemy.alert = false
  state.kills++
  state.score += headshot ? 175 : 100
  addKillFeed('VANCE', headshot ? 'M4A1 · HEADSHOT' : 'M4A1', 'INSURGENT', headshot)
  showToast(headshot ? 'HEADSHOT BONUS +175' : 'HOSTILE NEUTRALIZED +100', 1200)
  if (state.kills >= totalEnemies) {
    state.score += 5000
    ui.objectiveTitle.textContent = 'SECTOR SECURED'
    ui.threat.textContent = 'THREAT LEVEL: NONE'
    showToast('OBJECTIVE COMPLETE · SECTOR SECURED +5000', 5000)
    state.objectiveDone = true
  }
  enemy.group.visible = true
}

function onPlayerDamage(amount, source) {
  if (!state.running) return
  const armorAbsorb = Math.min(state.armor, amount * 0.55)
  state.armor = Math.max(0, state.armor - armorAbsorb)
  state.health = Math.max(0, state.health - (amount - armorAbsorb))
  state.lastDamage = state.time
  state.shake = Math.max(state.shake, 0.24)
  ui.damageFlash.style.opacity = '0.9'
  damageArc()
  setTimeout(() => { ui.damageFlash.style.opacity = '0' }, 110)
  if (source) {
    const dir = source.clone().sub(camera.position).applyAxisAngle(up, -state.yaw)
    const angle = Math.atan2(dir.x, dir.z)
    const arc = document.createElement('div')
    arc.className = 'dmg-arc'
    arc.style.transform = `rotate(${angle}rad)`
    ui.damageArcs.appendChild(arc)
    setTimeout(() => arc.remove(), 1150)
  }
  if (state.health <= 0 && !state.lost) {
    state.lost = true
    state.respawnTimer = 2.2
    showToast('OPERATOR DOWN · REDEPLOYING', 2400)
  }
}

function respawn() {
  camera.position.set(0, 1.68, 3.4)
  state.health = 100
  state.armor = 100
  state.mag = state.maxMag
  state.reserve = 180
  state.lost = false
  state.score = Math.max(0, state.score - 250)
  state.lastDamage = state.time - 10
  state.pitch = -0.015
  state.yaw = 0
  showToast('REDEPLOYED · STAY SHARP', 2000)
}

function updatePlayer(dt) {
  const sprinting = !!keys.ShiftLeft && !state.ads && !!keys.KeyW
  const crouch = !!keys.ControlLeft || !!keys.KeyC
  state.sprinting = sprinting && !crouch
  state.crouch = crouch
  const speed = crouch ? 2.1 : state.ads ? 2.4 : sprinting ? 7.2 : 4.35
  let ix = 0
  let iz = 0
  if (keys.KeyW) iz -= 1
  if (keys.KeyS) iz += 1
  if (keys.KeyA) ix -= 1
  if (keys.KeyD) ix += 1
  const len = Math.hypot(ix, iz)
  if (len > 0) { ix /= len; iz /= len }
  state.moving = len > 0
  const sin = Math.sin(state.yaw)
  const cos = Math.cos(state.yaw)
  const wx = ix * cos + iz * sin
  const wz = -ix * sin + iz * cos
  const targetVx = wx * speed
  const targetVz = wz * speed
  const accel = len > 0 ? 10 : 9
  state.velocity.x += (targetVx - state.velocity.x) * Math.min(1, dt * accel)
  state.velocity.y += (targetVz - state.velocity.y) * Math.min(1, dt * accel)
  const nx = camera.position.x + state.velocity.x * dt
  const nz = camera.position.z + state.velocity.y * dt
  if (world.isWalkable(nx, camera.position.z)) camera.position.x = nx
  else state.velocity.x = 0
  if (world.isWalkable(camera.position.x, nz)) camera.position.z = nz
  else state.velocity.y = 0
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -23, 23)
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -61, 15)

  const ground = world.terrainHeight(camera.position.x, camera.position.z)
  if (keys.Space && state.grounded && !state.lost) {
    state.vertical = 4.7
    state.grounded = false
  }
  state.vertical -= 15 * dt
  let eye = (crouch ? 1.12 : 1.68) + ground
  camera.position.y += state.vertical * dt
  if (camera.position.y <= eye) {
    camera.position.y = eye
    state.vertical = 0
    state.grounded = true
  }
  if (state.lost) {
    state.respawnTimer -= dt
    if (state.respawnTimer <= 0) respawn()
  }
  if (state.time - state.lastDamage > 5 && state.health < 100 && !state.lost) {
    state.health = Math.min(100, state.health + dt * 9)
  }
  if (state.armor < 100 && state.time - state.lastDamage > 7) {
    state.armor = Math.min(100, state.armor + dt * 6)
  }
}

function updateAim(dt) {
  state.recoilPitch *= Math.pow(0.0025, dt)
  state.recoilYaw *= Math.pow(0.0025, dt)
  state.shake *= Math.pow(0.0008, dt)
  state.lookX *= Math.pow(0.001, dt)
  state.lookY *= Math.pow(0.001, dt)
  const shakeX = (Math.random() - 0.5) * state.shake * 0.05
  const shakeY = (Math.random() - 0.5) * state.shake * 0.05
  camera.rotation.y = state.yaw + state.recoilYaw + shakeX
  camera.rotation.x = state.pitch + state.recoilPitch + shakeY
  camera.rotation.z = Math.sin(state.time * 1.1) * 0.0009 + state.velocity.x * 0.0007
  const targetFov = state.ads ? 52 : state.sprinting ? 75 : 70
  state.fov += (targetFov - state.fov) * Math.min(1, dt * 10)
  if (Math.abs(camera.fov - state.fov) > 0.01) {
    camera.fov = state.fov
    camera.updateProjectionMatrix()
  }
}

function updateTargeting(dt) {
  if (!state.running) return
  raycaster.setFromCamera(center, camera)
  raycaster.far = 120
  const hits = raycaster.intersectObjects(world.shootables, false)
  let found = null
  for (const h of hits) {
    const en = h.object.userData.enemy
    if (en && en.alive) { found = en; break }
    if (!en) break
  }
  if (found) {
    if (!found.alert) found.alert = true
    if (!ui.spotted.classList.contains('hidden')) {
      ui.spotted.dataset.t = state.time
    } else {
      ui.spotted.classList.remove('hidden')
      ui.spotted.dataset.t = state.time
    }
    state.activeEnemy = found
  } else {
    state.activeEnemy = null
    if (ui.spotted.dataset.t && state.time - Number(ui.spotted.dataset.t) > 1.1) ui.spotted.classList.add('hidden')
  }
}

let last = performance.now()
let fpsSmooth = 60

function frame(now) {
  requestAnimationFrame(frame)
  const rawDt = (now - last) / 1000
  last = now
  const dt = Math.min(0.05, rawDt)
  fpsSmooth += (1 / Math.max(0.0001, rawDt) - fpsSmooth) * 0.05

  if (state.started) {
    state.time += dt
    if (state.running) {
      updatePlayer(dt)
      if (state.fireTimer > 0) state.fireTimer -= dt
      if (state.reloadTimer > 0) {
        state.reloadTimer -= dt
        if (state.reloadTimer <= 0) {
          const need = state.maxMag - state.mag
          const take = Math.min(need, state.reserve)
          state.mag += take
          state.reserve -= take
          showToast('MAGAZINE READY', 800)
        }
      }
      if (state.firing) attemptShot()
      updateTargeting(dt)
    }
    updateAim(dt)
    weapon.update(dt, state.time, state)
    world.update(dt, state.time, camera.position, {
      onEnemyFire: (en, origin) => {
        const target = camera.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 1.4))
        effects.spawnTracer(origin, target, 0xff7d36, 0.65)
        enemyGunSound()
        if (Math.random() < 0.6) onPlayerDamage(3 + Math.random() * 7, origin)
      },
      onEnemyDamage: () => {},
      onEnemyUpdate: () => {}
    })
    effects.update(dt)
    updateCompass()
    drawMinimap()
    updateHud()
    if (ui.hitmarker.classList.contains('show') && !ui.hitmarker.dataset.t) ui.hitmarker.dataset.t = state.time
    if (ui.hitmarker.dataset.t && state.time - Number(ui.hitmarker.dataset.t) > 0.25) {
      ui.hitmarker.classList.remove('show')
      delete ui.hitmarker.dataset.t
    }
    if (state.objectiveDone && state.time - (state.objectiveDoneAt || (state.objectiveDoneAt = state.time)) > 4) {
      ui.objectiveTitle.textContent = 'REGROUP AT EXTRACTION'
    }
  } else {
    camera.position.y = 1.68 + Math.sin(now * 0.0007) * 0.008
    camera.rotation.y = Math.sin(now * 0.00018) * 0.012
    camera.rotation.x = -0.01 + Math.sin(now * 0.00031) * 0.003
    world.update(dt, now * 0.001, camera.position, {})
    weapon.update(dt, now * 0.001, { ads: false, moving: false, lookX: 0, lookY: 0 })
  }

  grade.uniforms.uTime.value = now * 0.001
  composer.render()
}

window.addEventListener('resize', () => {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  composer.setSize(w, h)
  bloom.setSize(w, h)
})

composer.render()
requestAnimationFrame(frame)

window.__blacksite = { state, world, camera, renderer, weapon, startGame }
