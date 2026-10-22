import * as THREE from 'three'
import {
  sandTexture, asphaltTexture, concreteTexture, containerTexture, metalTexture,
  woodTexture, sandbagTexture, smokeTexture, smokePuffTexture, dotTexture, flashTexture, grungeTexture, stencilTexture, rng
} from './textures.js'

const V = (x, y, z) => new THREE.Vector3(x, y, z)

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function terrainHeight(x, z) {
  const outside = Math.max(Math.abs(x) - 27, -z - 64, z - 20)
  const rim = smoothstep(0, 34, outside)
  const big = Math.sin(x * 0.075) * Math.cos(z * 0.063) * 1.4 + Math.sin(x * 0.021 + z * 0.017) * 2.6
  const detail = Math.sin(x * 0.51 + z * 0.22) * 0.07 + Math.cos(x * 0.33 - z * 0.47) * 0.06
  return rim * (6.5 + big * 1.2) + detail
}

function flagTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const x = c.getContext('2d')
  x.fillStyle = '#381a16'
  x.fillRect(0, 0, 512, 256)
  x.fillStyle = '#160e0c'
  x.beginPath()
  x.moveTo(256, 24)
  x.lineTo(476, 128)
  x.lineTo(256, 232)
  x.lineTo(36, 128)
  x.closePath()
  x.fill()
  x.strokeStyle = '#a8522b'
  x.lineWidth = 5
  x.stroke()
  x.fillStyle = '#b4452c'
  x.beginPath()
  x.moveTo(256, 74)
  x.lineTo(330, 128)
  x.lineTo(256, 182)
  x.lineTo(182, 128)
  x.closePath()
  x.fill()
  x.strokeStyle = 'rgba(255,190,120,0.5)'
  x.lineWidth = 2
  x.stroke()
  for (let i = 0; i < 40; i++) {
    x.fillStyle = `rgba(20,12,10,${Math.random() * 0.3})`
    x.fillRect(Math.random() * 512, Math.random() * 256, Math.random() * 22, Math.random() * 8)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function createWorld(scene, renderer) {
  const colliders = []
  const shootables = []
  const enemies = []
  const actors = []
  const effects = []
  const flags = []
  const clock = { t: 0 }
  const rand = rng(2026)

  scene.fog = new THREE.FogExp2(0xa87a57, 0.0058)
  scene.background = new THREE.Color(0x9b7154)

  const hemi = new THREE.HemisphereLight(0x9fc2e8, 0x7a5a3b, 0.85)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xffb070, 3.15)
  sun.position.set(-52, 34, -76)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -62
  sun.shadow.camera.right = 62
  sun.shadow.camera.top = 62
  sun.shadow.camera.bottom = -62
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 190
  sun.shadow.bias = -0.0006
  sun.shadow.normalBias = 0.035
  scene.add(sun)
  scene.add(sun.target)
  sun.target.position.set(0, 0, -30)
  const fill = new THREE.DirectionalLight(0x6f8fbf, 0.55)
  fill.position.set(40, 20, 50)
  scene.add(fill)
  const bounce = new THREE.DirectionalLight(0xffc79b, 0.85)
  bounce.position.set(30, 16, 48)
  scene.add(bounce)
  const rim = new THREE.DirectionalLight(0x87a6c8, 0.4)
  rim.position.set(-30, 18, 40)
  scene.add(rim)

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(480, 64, 40),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vDir;
        uniform float uTime;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
        float noise(vec2 p){
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), f.x), mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x), f.y);
        }
        float fbm(vec2 p){
          float v = 0.0, a = 0.5;
          for(int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
          return v;
        }
        void main() {
          vec3 d = normalize(vDir);
          float h = max(d.y, 0.0);
          vec3 zenith = vec3(0.035, 0.085, 0.155);
          vec3 mid = vec3(0.22, 0.28, 0.37);
          vec3 horizon = vec3(0.78, 0.46, 0.29);
          vec3 col = mix(horizon, mid, smoothstep(0.0, 0.22, h));
          col = mix(col, zenith, smoothstep(0.15, 0.72, h));
          vec3 sunDir = normalize(vec3(-0.42, 0.155, -0.89));
          float sd = max(dot(d, sunDir), 0.0);
          col += vec3(1.0, 0.62, 0.28) * pow(sd, 12.0) * 0.38;
          col += vec3(1.0, 0.84, 0.58) * pow(sd, 420.0) * 1.05;
          col += vec3(1.0, 0.72, 0.4) * pow(max(1.0 - abs(d.y), 0.0), 8.0) * 0.09;
          vec2 cup = d.xz / (d.y + 0.16) * 1.25;
          cup.x += uTime * 0.004;
          float cl = fbm(cup * 1.1 + vec2(3.1, 1.7));
          cl = smoothstep(0.52, 0.82, cl) * smoothstep(-0.02, 0.22, d.y);
          float lit = pow(sd, 3.0);
          vec3 cloudCol = mix(vec3(0.32, 0.25, 0.26), vec3(1.05, 0.58, 0.31), lit);
          col = mix(col, cloudCol, cl * 0.82);
          float horizonGlow = exp(-abs(d.y) * 9.0);
          col += vec3(0.9, 0.42, 0.16) * horizonGlow * 0.24;
          float ground = smoothstep(0.0, -0.12, d.y);
          col = mix(col, vec3(0.52, 0.36, 0.25), ground * 0.9);
          col *= 0.94 + 0.06 * sin(gl_FragCoord.y * 1.7);
          gl_FragColor = vec4(col, 1.0);
        }
      `
    })
  )
  sky.frustumCulled = false
  scene.add(sky)

  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: 0xffd9a3, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }))
  sunSprite.scale.set(13, 13, 1)
  sunSprite.position.copy(V(-165, 78, -360))
  scene.add(sunSprite)

  const tex = {
    sand: sandTexture(),
    asphalt: asphaltTexture(),
    concrete: concreteTexture(),
    concreteLight: concreteTexture('#a09a8c', 0.35),
    concreteDark: concreteTexture('#6b6961', 0.8),
    metal: metalTexture(),
    wood: woodTexture(),
    sandbag: sandbagTexture(),
    red: containerTexture('#7d3a2b'),
    olive: containerTexture('#4f5338'),
    blue: containerTexture('#33505b'),
    orange: containerTexture('#8a5b2c')
  }

  const grunge = grungeTexture()
  const mat = {
    concrete: new THREE.MeshStandardMaterial({ map: tex.concrete, roughness: 0.94, metalness: 0.02, color: 0xb7b0a4 }),
    concreteLight: new THREE.MeshStandardMaterial({ map: tex.concreteLight, roughness: 0.95, color: 0xc8c1b4 }),
    concreteDark: new THREE.MeshStandardMaterial({ map: tex.concreteDark, roughness: 0.96, color: 0x9a9488 }),
    metal: new THREE.MeshStandardMaterial({ map: tex.metal, roughness: 0.55, metalness: 0.65 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x2b2d2c, roughness: 0.48, metalness: 0.75 }),
    wood: new THREE.MeshStandardMaterial({ map: tex.wood, roughness: 0.9 }),
    sandbag: new THREE.MeshStandardMaterial({ map: tex.sandbag, roughness: 1 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x171817, roughness: 0.92 }),
    rock: new THREE.MeshStandardMaterial({ color: 0x6c5744, roughness: 1, flatShading: true }),
    mountain: new THREE.MeshStandardMaterial({ color: 0x5b4637, roughness: 1, flatShading: true }),
    red: new THREE.MeshStandardMaterial({ map: tex.red, roughness: 0.72, metalness: 0.32 }),
    olive: new THREE.MeshStandardMaterial({ map: tex.olive, roughness: 0.72, metalness: 0.32 }),
    blue: new THREE.MeshStandardMaterial({ map: tex.blue, roughness: 0.72, metalness: 0.32 }),
    orange: new THREE.MeshStandardMaterial({ map: tex.orange, roughness: 0.7, metalness: 0.3 }),
    glowWarm: new THREE.MeshStandardMaterial({ color: 0xffb066, emissive: 0xff7a20, emissiveIntensity: 2.2, roughness: 0.5 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x1b2a30, roughness: 0.15, metalness: 0.8 }),
    tarp: new THREE.MeshStandardMaterial({ color: 0x6c6247, roughness: 1, side: THREE.DoubleSide }),
    stain: new THREE.MeshStandardMaterial({ color: 0x2b2018, roughness: 1, transparent: true, opacity: 0.35, depthWrite: false })
  }

  const geo = {
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
    cyl6: new THREE.CylinderGeometry(1, 1, 1, 6),
    sphere: new THREE.SphereGeometry(1, 16, 12)
  }

  function addBox(w, h, d, material, x, y, z, ry = 0, group = scene, collide = true) {
    const m = new THREE.Mesh(geo.box, material)
    m.scale.set(w, h, d)
    m.position.set(x, y, z)
    m.rotation.y = ry
    m.castShadow = true
    m.receiveShadow = true
    group.add(m)
    shootables.push(m)
    if (collide) {
      const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry))
      const hx = (w * c + d * s) / 2
      const hz = (w * s + d * c) / 2
      colliders.push({ minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz })
    }
    return m
  }

  function addCylinder(rTop, rBottom, h, material, x, y, z, seg = 12) {
    const m = new THREE.Mesh(seg === 6 ? geo.cyl6 : geo.cyl, material)
    m.scale.set(rTop, h, rBottom)
    m.position.set(x, y, z)
    m.castShadow = true
    m.receiveShadow = true
    scene.add(m)
    shootables.push(m)
    return m
  }

  function addCollider(x, z, w, d) {
    colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 })
  }

  const terrainGeo = new THREE.PlaneGeometry(380, 380, 150, 150)
  const pos = terrainGeo.attributes.position
  const colors = []
  const cBase = new THREE.Color(0x9c8463)
  const cDark = new THREE.Color(0x72604a)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = -pos.getY(i)
    const h = terrainHeight(x, z)
    pos.setZ(i, h)
    const shade = 0.82 + (Math.sin(x * 0.14) * Math.cos(z * 0.11) + 1) * 0.09
    const c = cBase.clone().lerp(cDark, 0.24 + Math.sin(x * 0.05 + z * 0.03) * 0.12).multiplyScalar(shade)
    colors.push(c.r, c.g, c.b)
  }
  terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  terrainGeo.computeVertexNormals()
  const terrain = new THREE.Mesh(terrainGeo, new THREE.MeshStandardMaterial({
    map: tex.sand, vertexColors: true, roughness: 1, metalness: 0,
    bumpMap: tex.sand, bumpScale: 0.25
  }))
  terrain.rotation.x = -Math.PI / 2
  terrain.position.y = -0.02
  terrain.receiveShadow = true
  scene.add(terrain)
  shootables.push(terrain)

  const roadTex = tex.sand.clone()
  roadTex.needsUpdate = true
  roadTex.repeat.set(2.2, 14)
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(9.8, 140, 1, 1),
    new THREE.MeshStandardMaterial({ map: roadTex, roughness: 1, metalness: 0, color: 0xb39b77, bumpMap: roadTex, bumpScale: 0.04 })
  )
  road.rotation.x = -Math.PI / 2
  road.position.set(0, 0.035, -16)
  road.receiveShadow = true
  scene.add(road)
  shootables.push(road)

  const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x8a7255, roughness: 1 })
  for (const sx of [-5.8, 5.8]) {
    const shoulder = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 140), shoulderMat)
    shoulder.rotation.x = -Math.PI / 2
    shoulder.position.set(sx, 0.028, -16)
    shoulder.receiveShadow = true
    scene.add(shoulder)
  }
  const trackMat = new THREE.MeshBasicMaterial({ color: 0x42362a, transparent: true, opacity: 0.24, depthWrite: false })
  for (const sx of [-1.65, -1.15, 1.15, 1.65]) {
    const track = new THREE.Mesh(new THREE.PlaneGeometry(sx < 0 ? 0.34 : 0.34, 140), trackMat)
    track.rotation.x = -Math.PI / 2
    track.position.set(sx, 0.045, -16)
    scene.add(track)
  }
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xd8c195, roughness: 0.92, transparent: true, opacity: 0.22 })
  for (let z = 8; z > -82; z -= 9) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 2.2), lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(0, 0.048, z)
    scene.add(line)
  }

  function ridge(radius, height, seed, dark, light, offsetZ) {
    const rr = rng(seed)
    const segments = 220
    const pos = []
    const cols = []
    const idx = []
    const cDark = new THREE.Color(dark)
    const cLight = new THREE.Color(light)
    const phase1 = rr() * 6.28
    const phase2 = rr() * 6.28
    const phase3 = rr() * 6.28
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2
      const profile = 0.46 + Math.sin(a * 3.1 + phase1) * 0.19 + Math.sin(a * 7.3 + phase2) * 0.11 + Math.sin(a * 15.7 + phase3) * 0.06 + Math.sin(a * 31 + phase2 * 2) * 0.025
      const r = radius + Math.sin(a * 5.2 + phase1) * radius * 0.06
      const h = height * Math.max(0.24, profile)
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r + offsetZ
      pos.push(x, -6, z)
      pos.push(x * 0.985, h, z * 0.985)
      const t = Math.min(1, Math.max(0, h / height))
      const c = cDark.clone().lerp(cLight, 0.18 + t * 0.5)
      cols.push(c.r * 0.55, c.g * 0.55, c.b * 0.55)
      cols.push(c.r, c.g, c.b)
    }
    for (let i = 0; i < segments; i++) {
      const a = i * 2
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true, side: THREE.DoubleSide }))
    scene.add(mesh)
  }
  ridge(152, 26, 811, 0x4a382c, 0x8a6248, -24)
  ridge(238, 58, 822, 0x42332b, 0x7d5c46, -30)
  ridge(335, 94, 833, 0x3b302d, 0x6b5144, -40)

  const rockMat = mat.rock
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2
    const r = 20 + rand() * 58
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r - 28
    if (Math.abs(x) < 31 && z > -70 && z < 21) continue
    const s = 0.35 + rand() * 2.4
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat)
    rock.position.set(x, terrainHeight(x, z) + s * 0.3, z)
    rock.rotation.set(rand() * 3, rand() * 3, rand() * 3)
    rock.castShadow = true
    rock.receiveShadow = true
    scene.add(rock)
    shootables.push(rock)
  }

  const compound = new THREE.Group()
  scene.add(compound)

  function wallSegment(x, z, w, ry, h = 2.8) {
    const g = new THREE.Group()
    addBox(w, h, 0.46, mat.concrete, x, h / 2, z, ry, compound)
    addBox(w + 0.16, 0.14, 0.62, mat.concreteLight, x, h + 0.07, z, ry, compound, false)
    const count = Math.max(2, Math.round(w / 3.2))
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1)
      const ox = (t - 0.5) * w
      const px = x + Math.cos(ry) * ox
      const pz = z - Math.sin(ry) * ox
      addBox(0.34, h + 0.22, 0.58, mat.concreteDark, px, (h + 0.22) / 2, pz, ry, compound, false)
    }
    const wireGeo = new THREE.CylinderGeometry(0.012, 0.012, w, 4)
    for (let i = 0; i < 2; i++) {
      const wire = new THREE.Mesh(wireGeo, mat.darkMetal)
      wire.rotation.z = Math.PI / 2
      wire.rotation.y = ry
      wire.position.set(x, h + 0.35 + i * 0.18, z)
      compound.add(wire)
    }
    for (let i = 0; i < Math.floor(w * 2); i++) {
      const t = rand()
      const bx = x + Math.cos(ry) * (t - 0.5) * w
      const bz = z - Math.sin(ry) * (t - 0.5) * w
      const barb = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.012, 4, 8), mat.darkMetal)
      barb.position.set(bx, h + 0.42 + i % 2 * 0.16, bz)
      barb.rotation.set(rand() * 3, rand() * 3, rand() * 3)
      compound.add(barb)
    }
    return g
  }

  wallSegment(-12, -22, 16, 0)
  wallSegment(12, -22, 16, 0)
  wallSegment(-20, -34, 24, Math.PI / 2)
  wallSegment(20, -34, 24, Math.PI / 2)
  wallSegment(-12, -58, 16, 0)
  wallSegment(12, -58, 16, 0)

  addBox(0.5, 4.4, 0.5, mat.concreteDark, -4.2, 2.2, -22, 0, compound)
  addBox(0.5, 4.4, 0.5, mat.concreteDark, 4.2, 2.2, -22, 0, compound)
  addBox(9.4, 0.45, 0.5, mat.concreteDark, 0, 4.25, -22, 0, compound)
  addBox(0.18, 3.4, 0.12, mat.darkMetal, -4.2, 1.7, -21.7, 0, compound, false)
  addBox(0.18, 3.4, 0.12, mat.darkMetal, 4.2, 1.7, -21.7, 0, compound, false)

  const grungeMat = new THREE.MeshBasicMaterial({ map: grunge, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
  for (let i = 0; i < 34; i++) {
    const gx = -19 + rand() * 38
    if (Math.abs(gx) < 4.4) continue
    const gy = 0.35 + rand() * 2.15
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.9 + rand() * 2.4, 1.1 + rand() * 2.4), grungeMat.clone())
    d.position.set(gx, gy, -21.75)
    d.material.opacity = 0.16 + rand() * 0.32
    d.material.rotation = rand() * 6.28
    scene.add(d)
  }
  const driftMat = new THREE.MeshStandardMaterial({ map: tex.sand, color: 0x9b8262, roughness: 1 })
  for (let i = 0; i < 12; i++) {
    const sx = -18 + rand() * 36
    if (Math.abs(sx) < 4.4) continue
    const drift = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 7), driftMat)
    drift.scale.set(1.2 + rand() * 2.4, 0.16 + rand() * 0.2, 0.5 + rand() * 0.5)
    drift.position.set(sx, 0.05, -21.55 + rand() * 0.3)
    drift.receiveShadow = true
    scene.add(drift)
  }
  const stencilA = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.0), new THREE.MeshBasicMaterial({ map: stencilTexture('07', 'RESTRICTED', '#cfc3ae'), transparent: true, opacity: 0.8, depthWrite: false }))
  stencilA.position.set(-14.2, 1.65, -21.73)
  scene.add(stencilA)
  const stencilB = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.95), new THREE.MeshBasicMaterial({ map: stencilTexture('DANGER', 'LIVE FIRE AREA', '#c9bda6'), transparent: true, opacity: 0.7, depthWrite: false }))
  stencilB.position.set(14.6, 1.55, -21.73)
  scene.add(stencilB)

  function acUnit(x, y) {
    const g = new THREE.Group()
    addBox(0.88, 0.62, 0.34, mat.metal, 0, 0, 0, 0, g, false)
    const grill = new THREE.Mesh(new THREE.CircleGeometry(0.19, 20), new THREE.MeshStandardMaterial({ color: 0x141617, roughness: 0.85, metalness: 0.2 }))
    grill.position.set(0, 0, 0.178)
    g.add(grill)
    for (let i = 0; i < 4; i++) addBox(0.72, 0.035, 0.02, mat.darkMetal, 0, -0.22 + i * 0.13, 0.18, 0, g, false)
    addBox(0.92, 0.05, 0.46, mat.darkMetal, 0, 0.34, 0.04, 0, g, false)
    g.position.set(x, y, -21.64)
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } })
    scene.add(g)
  }
  acUnit(-17.4, 1.98)
  acUnit(-8.1, 2.12)
  acUnit(9.2, 2.02)
  acUnit(17.1, 2.1)

  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x585149, roughness: 0.72, metalness: 0.42 })
  for (const [x1, x2, y] of [[-20, -8.6, 2.52], [8.6, 20, 2.52], [-8.6, -4.4, 1.36], [4.4, 8.6, 1.36]]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, x2 - x1, 7), pipeMat)
    p.rotation.z = Math.PI / 2
    p.position.set((x1 + x2) / 2, y, -21.66)
    p.castShadow = true
    scene.add(p)
  }
  for (const jx of [-8.6, 8.6]) {
    addBox(0.26, 0.36, 0.16, mat.darkMetal, jx, 2.18, -21.66, 0, scene, false)
    addBox(0.2, 0.24, 0.14, mat.darkMetal, jx, 1.2, -21.66, 0, scene, false)
    const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.3, 7), pipeMat)
    drop.position.set(jx, 1.78, -21.66)
    drop.castShadow = true
    scene.add(drop)
  }

  for (const bx of [-17.2, 17.2]) {
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 3; i++) {
        addBox(0.6, 0.2, 0.34, mat.sandbag, bx + (i - 1) * 0.6, 3.0 + row * 0.2, -21.9, 0.02, scene, false)
      }
    }
    addBox(0.14, 0.14, 0.14, mat.darkMetal, bx, 3.12, -21.68, 0, scene, false)
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff3820 }))
    lamp.position.set(bx, 3.12, -21.59)
    scene.add(lamp)
    effects.push({ type: 'beacon', mesh: lamp })
  }

  const ammoCrate = new THREE.Group()
  addBox(1.0, 0.54, 0.6, mat.olive, 0, 0.27, 0, 0, ammoCrate, false)
  addBox(1.04, 0.06, 0.64, mat.olive, 0, 0.57, 0, 0, ammoCrate, false)
  addBox(0.18, 0.05, 0.07, mat.darkMetal, -0.3, 0.61, 0.22, 0, ammoCrate, false)
  addBox(0.18, 0.05, 0.07, mat.darkMetal, 0.3, 0.61, -0.22, 0, ammoCrate, false)
  addBox(0.2, 0.16, 0.02, mat.darkMetal, 0, 0.3, 0.305, 0, ammoCrate, false)
  ammoCrate.position.set(-6.3, 0, -2.7)
  ammoCrate.rotation.y = 0.18
  scene.add(ammoCrate)
  shootables.push(ammoCrate.children[0])
  addCollider(-6.3, -2.7, 1.1, 0.72)

  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 4; i++) {
      addBox(0.62, 0.22, 0.36, mat.sandbag, -6.5 + (i - 1.5) * 0.62 + row * 0.18, 0.13 + row * 0.22, -4.1, 0.04, scene, false)
    }
  }
  addCollider(-6.5, -4.1, 2.6, 0.8)

  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc39a55, roughness: 0.3, metalness: 0.92 })
  for (let i = 0; i < 14; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.017, 0.05, 6), brassMat)
    b.position.set(-2.4 + rand() * 4.6, 0.043, -1.6 + rand() * 4.2)
    b.rotation.set(Math.PI / 2, rand() * 6.28, rand() * 6.28)
    b.castShadow = true
    scene.add(b)
  }

  const gate = new THREE.Group()
  for (let i = 0; i < 7; i++) addBox(0.12, 3.1, 0.12, mat.darkMetal, 0, 1.55, -3.4 + i * 0.9, 0, gate, false)
  for (let i = 0; i < 4; i++) addBox(0.12, 0.12, 6.2, mat.darkMetal, 0, 0.5 + i * 0.85, 0, 0, gate, false)
  gate.position.set(-5.2, 0, -22.2)
  gate.rotation.y = 1.05
  compound.add(gate)
  const gate2 = gate.clone()
  gate2.position.x = 5.2
  gate2.rotation.y = -1.05
  compound.add(gate2)

  function hesco(x, z, w = 1.25, h = 1.15, d = 1.05, ry = 0) {
    const m = addBox(w, h, d, mat.sandbag, x, h / 2, z, ry, compound)
    const top = addBox(w * 0.98, 0.08, d * 0.98, mat.concreteDark, x, h + 0.04, z, ry, compound, false)
    top.receiveShadow = true
    return m
  }
  for (let i = 0; i < 7; i++) {
    if (i === 2 || i === 3) continue
    hesco(-8.4 + i * 2.7, -19.1)
  }
  for (let i = 0; i < 5; i++) {
    hesco(-7.6 - i * 1.34, -24.4 - i * 0.1)
    hesco(7.6 + i * 1.34, -24.4 - i * 0.1)
  }
  for (let i = 0; i < 4; i++) {
    hesco(-17.1, -30 - i * 1.3)
    hesco(17.1, -30 - i * 1.3)
  }

  function container(x, z, ry, material, tint) {
    const c = new THREE.Group()
    addBox(6.2, 2.65, 2.5, material, 0, 1.36, 0, 0, c)
    addBox(6.4, 0.14, 2.7, mat.darkMetal, 0, 2.75, 0, 0, c, false)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) addBox(0.14, 2.5, 0.14, mat.darkMetal, sx * 3.05, 1.3, sz * 1.18, 0, c, false)
    const door1 = addBox(0.08, 2.3, 1.1, material, 3.12, 1.3, -0.6, 0, c, false)
    door1.rotation.y = 0.02
    addBox(0.08, 2.3, 1.1, material, 3.12, 1.3, 0.6, 0, c, false)
    addBox(0.1, 0.12, 0.4, mat.darkMetal, 3.17, 1.5, -0.55, 0, c, false)
    addBox(0.1, 0.12, 0.4, mat.darkMetal, 3.17, 1.5, 0.55, 0, c, false)
    c.position.set(x, 0, z)
    c.rotation.y = ry
    compound.add(c)
    addCollider(x, z, 6.6, 3.1)
    return c
  }

  container(-14.5, -31.5, 0.06, mat.red)
  container(12.5, -30.5, -0.08, mat.olive)
  container(-15.2, -51.8, 0.9, mat.blue)
  container(5.5, -54.2, 0, mat.orange)

  function watchtower(x, z) {
    const g = new THREE.Group()
    for (const sx of [-1.2, 1.2]) for (const sz of [-1.2, 1.2]) {
      const leg = addBox(0.22, 8.4, 0.22, mat.darkMetal, x + sx, 4.2, z + sz, 0, g, false)
      leg.rotation.z = sx * 0.025
    }
    for (let i = 1; i < 4; i++) {
      const y = i * 2.1
      addBox(2.7, 0.11, 0.11, mat.darkMetal, x, y, z - 1.2, 0, g, false)
      addBox(2.7, 0.11, 0.11, mat.darkMetal, x, y, z + 1.2, 0, g, false)
      addBox(0.11, 0.11, 2.7, mat.darkMetal, x - 1.2, y, z, 0, g, false)
      addBox(0.11, 0.11, 2.7, mat.darkMetal, x + 1.2, y, z, 0, g, false)
      const brace1 = addBox(0.08, 3.4, 0.08, mat.darkMetal, x, y + 1.05, z - 1.2, 0, g, false)
      brace1.rotation.z = 0.55
      const brace2 = addBox(0.08, 3.4, 0.08, mat.darkMetal, x, y + 1.05, z + 1.2, 0, g, false)
      brace2.rotation.z = -0.55
    }
    addBox(3.6, 0.24, 3.6, mat.wood, x, 8.5, z, 0, g)
    for (const sx of [-1.74, 1.74]) addBox(0.09, 1.1, 3.6, mat.darkMetal, x + sx, 9.15, z, 0, g, false)
    for (const sz of [-1.74, 1.74]) addBox(3.6, 1.1, 0.09, mat.darkMetal, x, 9.15, z + sz, 0, g, false)
    addBox(4.1, 0.16, 4.1, mat.metal, x, 11.0, z, 0, g, false)
    for (const sx of [-1.6, 1.6]) for (const sz of [-1.6, 1.6]) addBox(0.09, 2.4, 0.09, mat.darkMetal, x + sx, 9.7, z + sz, 0, g, false)
    addBox(0.9, 0.55, 0.4, mat.darkMetal, x - 1.2, 8.9, z + 1.2, 0, g, false)
    addBox(0.55, 0.34, 0.34, mat.glowWarm, x - 1.2, 8.95, z + 1.46, 0, g, false)
    const ladder = new THREE.Group()
    for (const sx of [-0.24, 0.24]) addBox(0.06, 8, 0.06, mat.darkMetal, x + sx, 4, z + 1.9, 0, g, false)
    for (let i = 0; i < 14; i++) addBox(0.55, 0.05, 0.05, mat.darkMetal, x, 0.6 + i * 0.55, z + 1.9, 0, g, false)
    g.add(ladder)
    scene.add(g)
    addCollider(x, z, 3.8, 3.8)
    const spot = new THREE.SpotLight(0xffd6a1, 120, 55, 0.52, 0.55, 1.2)
    spot.position.set(x - 1.1, 9.1, z + 1.4)
    spot.target.position.set(x + 8, 0, z - 22)
    scene.add(spot)
    scene.add(spot.target)
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(7.5, 34, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffc47d, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })
    )
    beam.position.set(x + 3.5, 8.4, z - 9)
    beam.rotation.set(1.22, 0, 0.35)
    scene.add(beam)
    effects.push({ type: 'beam', mesh: beam, base: 0.045 })
    return g
  }
  watchtower(-11.5, -44)

  function building(x, z, w, d, h, floors) {
    const g = new THREE.Group()
    addBox(w, h, d, mat.concrete, x, h / 2, z, 0, g)
    addBox(w + 0.3, 0.35, d + 0.3, mat.concreteDark, x, h + 0.16, z, 0, g, false)
    addBox(w + 0.3, 0.4, d + 0.3, mat.concreteDark, x, 0.2, z, 0, g, false)
    for (let f = 0; f < floors; f++) {
      const wy = 1.9 + f * 3.1
      for (let i = 0; i < 3; i++) {
        const wx = x - w / 2 + 1.8 + i * ((w - 3.6) / 2)
        const glass = addBox(1.2, 1.05, 0.08, i === 1 ? mat.glowWarm : mat.glass, wx, wy, z - d / 2 - 0.03, 0, g, false)
        glass.castShadow = false
        addBox(1.42, 1.24, 0.1, mat.concreteDark, wx, wy, z - d / 2 - 0.02, 0, g, false)
        addBox(1.2, 1.05, 0.1, i === 1 ? mat.glowWarm : mat.glass, wx, wy, z - d / 2 - 0.08, 0, g, false)
      }
    }
    addBox(1.6, 2.6, 0.18, mat.darkMetal, x + w * 0.28, 1.3, z - d / 2 - 0.12, 0, g, false)
    addBox(2.2, 0.16, 1.6, mat.metal, x + w * 0.28, 2.85, z - d / 2 - 0.7, 0, g, false)
    addBox(0.12, 2.3, 0.12, mat.darkMetal, x + w * 0.28, 3.9, z - d / 2 - 0.7, 0, g, false)
    for (let i = 0; i < 4; i++) addBox(0.9, 0.32, 0.55, mat.metal, x - w * 0.2 + i * 1.5, 3.2, z + d * 0.28, 0, g, false)
    g.position.set(0, 0, 0)
    scene.add(g)
    addCollider(x, z, w + 0.4, d + 0.4)
    return g
  }
  building(10.5, -47, 12.5, 8.5, 6.6, 2)
  building(-14.5, -55.8, 5.6, 3.8, 3.2, 1)

  const antenna = new THREE.Group()
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2
    const leg = addBox(0.06, 12, 0.06, mat.darkMetal, 16.5 + Math.cos(a) * 0.55, 6, -52 + Math.sin(a) * 0.55, 0, antenna, false)
    leg.rotation.z = Math.cos(a) * 0.1
    leg.rotation.x = Math.sin(a) * 0.1
  }
  for (let i = 1; i <= 6; i++) {
    const w = 1.5 - i * 0.18
    addBox(w, 0.06, w, mat.darkMetal, 16.5, i * 1.8, -52, 0.4, antenna, false)
  }
  addBox(0.1, 2.4, 0.1, mat.darkMetal, 16.5, 13.2, -52, 0, antenna, false)
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff3020 }))
  beacon.position.set(16.5, 14.45, -52)
  antenna.add(beacon)
  scene.add(antenna)
  addCollider(16.5, -52, 1.4, 1.4)
  effects.push({ type: 'beacon', mesh: beacon })

  const dish = new THREE.Group()
  const dishPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.5, 8), mat.darkMetal)
  dishPole.position.set(13.8, 7.35, -47.4)
  dish.add(dishPole)
  const dishBowl = new THREE.Mesh(new THREE.SphereGeometry(1.55, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), new THREE.MeshStandardMaterial({ color: 0x8b877c, roughness: 0.62, metalness: 0.35, side: THREE.DoubleSide }))
  dishBowl.position.set(13.8, 8.35, -47.4)
  dishBowl.rotation.set(-1.0, 0.3, 0.35)
  dish.add(dishBowl)
  const dishHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.8, 8), mat.darkMetal)
  dishHorn.position.set(14.35, 8.85, -46.82)
  dishHorn.rotation.set(-1.0, 0.3, 0.35)
  dish.add(dishHorn)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.85, 4), mat.darkMetal)
    strut.position.set(13.8 + Math.cos(a) * 0.5, 8.35 - 0.1, -47.4 + Math.sin(a) * 0.5)
    dish.add(strut)
  }
  scene.add(dish)

  const heli = new THREE.Group()
  const heliBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.1, 3.6), new THREE.MeshStandardMaterial({ color: 0x262a29, roughness: 0.6, metalness: 0.4 }))
  heliBody.position.y = 0
  heli.add(heliBody)
  const heliNose = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 8), new THREE.MeshStandardMaterial({ color: 0x1f2423, roughness: 0.55, metalness: 0.45 }))
  heliNose.scale.set(1.05, 0.9, 1.4)
  heliNose.position.set(0, 0.02, -1.75)
  heli.add(heliNose)
  const heliTail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 3.1), new THREE.MeshStandardMaterial({ color: 0x232726, roughness: 0.6, metalness: 0.4 }))
  heliTail.position.set(0, 0.18, 3.1)
  heliTail.rotation.x = -0.06
  heli.add(heliTail)
  const heliFin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.7), new THREE.MeshStandardMaterial({ color: 0x232726, roughness: 0.6, metalness: 0.4 }))
  heliFin.position.set(0, 0.7, 4.1)
  heli.add(heliFin)
  const skids = []
  for (const sx of [-0.72, 0.72]) {
    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.8, 6), mat.darkMetal)
    skid.rotation.x = Math.PI / 2
    skid.position.set(sx, -0.75, 0.1)
    heli.add(skid)
    skids.push(skid)
  }
  const rotor = new THREE.Mesh(new THREE.BoxGeometry(9, 0.06, 0.24), new THREE.MeshStandardMaterial({ color: 0x1a1d1c, roughness: 0.5, transparent: true, opacity: 0.72 }))
  rotor.position.set(0, 0.62, 0)
  heli.add(rotor)
  const rotorBlur = new THREE.Mesh(new THREE.CircleGeometry(4.5, 32), new THREE.MeshBasicMaterial({ color: 0x161817, transparent: true, opacity: 0.17, side: THREE.DoubleSide, depthWrite: false }))
  rotorBlur.rotation.x = -Math.PI / 2
  rotorBlur.position.y = 0.64
  heli.add(rotorBlur)
  const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.7, 0.18), new THREE.MeshStandardMaterial({ color: 0x1d201f, roughness: 0.5, transparent: true, opacity: 0.6 }))
  tailRotor.position.set(0.16, 0.7, 4.1)
  heli.add(tailRotor)
  for (const [x, z, c] of [[-0.76, -1.7, 0xff2a1c], [0.76, 3.3, 0x33ff66], [0, 4.5, 0xffffff]]) {
    const nav = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), new THREE.MeshBasicMaterial({ color: c }))
    nav.position.set(x, 0.1, z)
    heli.add(nav)
  }
  heli.scale.setScalar(1.25)
  heli.position.set(-52, 23, -74)
  scene.add(heli)
  effects.push({ type: 'heli', heli, rotor, tailRotor, blur: rotorBlur })

  const signCanvas = document.createElement('canvas')
  signCanvas.width = 512
  signCanvas.height = 96
  const sx = signCanvas.getContext('2d')
  sx.fillStyle = '#2a2822'
  sx.fillRect(0, 0, 512, 96)
  sx.strokeStyle = '#b76934'
  sx.lineWidth = 4
  sx.strokeRect(6, 6, 500, 84)
  sx.fillStyle = '#e8dfcb'
  sx.font = '700 38px monospace'
  sx.textAlign = 'center'
  sx.fillText('KHARZAI  07', 256, 52)
  sx.fillStyle = '#b76934'
  sx.font = '600 14px monospace'
  sx.fillText('RESTRICTED  ·  AUTHORIZED PERSONNEL ONLY', 256, 76)
  const signTex = new THREE.CanvasTexture(signCanvas)
  signTex.colorSpace = THREE.SRGBColorSpace
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.86), new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.85, emissive: 0x241a12, emissiveIntensity: 0.4 }))
  sign.position.set(0, 3.62, -21.94)
  scene.add(sign)
  for (const lx of [-2.9, 2.9]) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff3a22 }))
    bulb.position.set(lx, 4.12, -21.9)
    scene.add(bulb)
    effects.push({ type: 'beacon', mesh: bulb })
  }

  const mg = new THREE.Group()
  for (const a of [0, 2.1, 4.2]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 6), mat.darkMetal)
    leg.position.set(Math.cos(a) * 0.35, 0.52, Math.sin(a) * 0.35)
    leg.rotation.z = Math.cos(a) * 0.63
    leg.rotation.x = Math.sin(a) * 0.63
    mg.add(leg)
  }
  const mgBody = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.85), mat.darkMetal)
  mgBody.position.set(0, 1.02, -0.1)
  mg.add(mgBody)
  const mgBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.95, 8), mat.darkMetal)
  mgBarrel.rotation.x = Math.PI / 2
  mgBarrel.position.set(0, 1.04, -0.95)
  mg.add(mgBarrel)
  const mgBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.3), mat.olive)
  mgBox.position.set(0.18, 0.95, 0.05)
  mg.add(mgBox)
  mg.position.set(-2.7, 0, -20.8)
  mg.rotation.y = 0.25
  scene.add(mg)
  addCollider(-2.7, -20.8, 0.8, 0.8)

  for (const [x, z] of [[-6.6, -4.5], [6.6, -4.5], [-6.4, -12], [6.4, -12], [-6.2, -18], [6.2, -18]]) {
    const b = new THREE.Group()
    addBox(2.5, 0.35, 0.72, mat.concreteDark, 0, 0.18, 0, 0, b, false)
    addBox(2.5, 0.62, 0.42, mat.concrete, 0, 0.62, 0, 0, b, false)
    addBox(2.5, 0.22, 0.24, mat.concreteLight, 0, 1.02, 0, 0, b, false)
    b.position.set(x, 0, z)
    b.rotation.y = x < 0 ? 0.04 : -0.04
    scene.add(b)
    addCollider(x, z, 2.6, 0.9)
  }

  const pole = new THREE.Group()
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a3a29, roughness: 1 })
  const poleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 7.6, 7), poleMat)
  poleMesh.position.set(-11, 3.8, -8.5)
  poleMesh.castShadow = true
  pole.add(poleMesh)
  const cross = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.11, 0.12), poleMat)
  cross.position.set(-11, 6.9, -8.5)
  cross.rotation.z = 0.03
  pole.add(cross)
  for (const sx of [-1.0, 0, 1.0]) {
    const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.16, 6), mat.darkMetal)
    ins.position.set(-11 + sx, 7.02, -8.5)
    pole.add(ins)
  }
  scene.add(pole)
  addCollider(-11, -8.5, 0.4, 0.4)

  const dummy = new THREE.Object3D()
  const shrubGeo = new THREE.IcosahedronGeometry(1, 0)
  const shrubMat = new THREE.MeshStandardMaterial({ color: 0x55513b, roughness: 1, flatShading: true })
  const shrubs = new THREE.InstancedMesh(shrubGeo, shrubMat, 54)
  for (let i = 0; i < 54; i++) {
    let x, z
    do {
      x = (rand() - 0.5) * 56
      z = -62 + rand() * 78
    } while (Math.abs(x) < 6.2 || (Math.abs(x) < 22 && z < -19 && z > -60))
    const s = 0.18 + rand() * 0.5
    dummy.position.set(x, terrainHeight(x, z) + s * 0.22, z)
    dummy.rotation.set(rand() * 2, rand() * 6.28, rand() * 2)
    dummy.scale.set(s * 1.3, s * 0.55, s * 1.1)
    dummy.updateMatrix()
    shrubs.setMatrixAt(i, dummy.matrix)
  }
  shrubs.castShadow = false
  shrubs.receiveShadow = true
  scene.add(shrubs)

  const pebbleGeo = new THREE.DodecahedronGeometry(1, 0)
  const pebbles = new THREE.InstancedMesh(pebbleGeo, mat.rock, 260)
  for (let i = 0; i < 260; i++) {
    let x, z
    do {
      x = (rand() - 0.5) * 52
      z = -64 + rand() * 82
    } while (Math.abs(x) < 5.6 || (Math.abs(x) < 21 && z < -20 && z > -60))
    const s = 0.03 + rand() * 0.12
    dummy.position.set(x, terrainHeight(x, z) + s * 0.6, z)
    dummy.rotation.set(rand() * 3, rand() * 3, rand() * 3)
    dummy.scale.set(s, s * (0.6 + rand() * 0.7), s)
    dummy.updateMatrix()
    pebbles.setMatrixAt(i, dummy.matrix)
  }
  pebbles.castShadow = false
  pebbles.receiveShadow = true
  scene.add(pebbles)

  const tent = new THREE.Group()
  const tentBody = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 4.4, 3, 1, false, 0, Math.PI), mat.tarp)
  tentBody.rotation.z = Math.PI / 2
  tentBody.rotation.y = Math.PI / 2
  tentBody.position.set(-16.2, 1.45, -25.5)
  tentBody.castShadow = true
  tent.add(tentBody)
  scene.add(tent)
  addCollider(-16.2, -25.5, 4.8, 3.8)

  function crate(x, z, s = 1, ry = 0, y = 0) {
    const c = addBox(1.1 * s, 1.02 * s, 1.1 * s, mat.wood, x, y + 0.51 * s, z, ry, compound)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) addBox(0.07, 1.05 * s, 0.07, mat.darkMetal, x + sx * 0.53 * s, y + 0.51 * s, z + sz * 0.53 * s, ry, compound, false)
    return c
  }
  crate(3.8, -30, 1, 0.2)
  crate(5.1, -30.1, 0.85, -0.1)
  crate(4.4, -30.2, 0.7, 0.5, 1.02)
  crate(-6.5, -33, 1.1, 0.1)
  crate(-6.4, -34.4, 1, -0.2)
  crate(12.8, -37, 1.05, 0.7)
  crate(14, -36.4, 0.8, 0.1)

  function barrel(x, z, matb = mat.orange, h = 1.05) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, h, 14), matb)
    b.position.set(x, h / 2, z)
    b.castShadow = true
    b.receiveShadow = true
    scene.add(b)
    shootables.push(b)
    addCollider(x, z, 0.68, 0.68)
    for (const yy of [0.28, h - 0.25]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.325, 0.025, 5, 16), mat.darkMetal)
      ring.rotation.x = Math.PI / 2
      ring.position.set(x, yy, z)
      scene.add(ring)
    }
    return b
  }
  barrel(6.2, -28.2)
  barrel(6.9, -27.6, mat.blue)
  barrel(-7.3, -37.1, mat.red)
  barrel(-7.9, -36.5)
  barrel(14.6, -43.5, mat.olive)

  const burning = barrel(1.6, -27.8, mat.darkMetal, 1.1)
  const fireLight = new THREE.PointLight(0xff6a1a, 30, 16, 1.6)
  fireLight.position.set(1.6, 1.7, -27.8)
  scene.add(fireLight)
  effects.push({ type: 'fireLight', light: fireLight, base: 30 })

  const fireSprites = []
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTexture(), color: new THREE.Color().setHSL(0.06 + Math.random() * 0.04, 1, 0.55), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }))
    s.position.set(1.6 + (Math.random() - 0.5) * 0.35, 1.05 + Math.random() * 0.4, -27.8 + (Math.random() - 0.5) * 0.35)
    s.scale.set(0.6, 0.8, 1)
    scene.add(s)
    fireSprites.push({ sprite: s, phase: Math.random() * 10, base: 0.55 + Math.random() * 0.4 })
  }
  effects.push({ type: 'fire', sprites: fireSprites })

  function humvee(x, z, ry) {
    const g = new THREE.Group()
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4f5540, roughness: 0.66, metalness: 0.38 })
    const body = addBox(2.25, 0.85, 5.1, bodyMat, 0, 1.02, 0, 0, g, false)
    addBox(2.0, 0.68, 2.5, bodyMat, 0, 1.72, -0.55, 0, g, false)
    addBox(1.85, 0.55, 1.5, mat.glass, 0, 1.72, 0.6, 0, g, false)
    addBox(2.0, 0.32, 4.4, mat.darkMetal, 0, 0.72, 0, 0, g, false)
    addBox(1.5, 0.12, 1.25, mat.darkMetal, 0, 2.15, -0.48, 0, g, false)
    addBox(1.1, 0.42, 0.9, bodyMat, 0, 2.4, -0.48, 0, g, false)
    const gun = addBox(0.09, 0.09, 1.5, mat.darkMetal, 0, 2.58, -0.9, 0, g, false)
    gun.rotation.x = -0.16
    addBox(0.65, 0.44, 0.28, mat.darkMetal, 0, 2.48, -1.55, 0, g, false)
    for (const sx of [-1.18, 1.18]) for (const sz of [-1.65, 1.65]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.3, 14), mat.rubber)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(sx, 0.5, sz)
      wheel.castShadow = true
      g.add(wheel)
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.32, 10), mat.metal)
      hub.rotation.z = Math.PI / 2
      hub.position.set(sx, 0.5, sz)
      g.add(hub)
    }
    addBox(0.05, 0.7, 0.05, mat.darkMetal, 0.7, 2.5, 1.2, 0, g, false)
    addBox(0.2, 0.1, 0.1, mat.glowWarm, -0.68, 1.0, 2.56, 0, g, false)
    addBox(0.2, 0.1, 0.1, mat.glowWarm, 0.68, 1.0, 2.56, 0, g, false)
    g.position.set(x, 0, z)
    g.rotation.y = ry
    scene.add(g)
    addCollider(x, z, 3.2, 5.6)
    return g
  }
  humvee(8.1, -25.2, 0.28)
  const technical = humvee(-9.2, -12.4, 1.28)
  technical.scale.setScalar(0.74)
  technical.rotation.z = 0.035

  function lampPost(x, z) {
    addBox(0.09, 4.3, 0.09, mat.darkMetal, x, 2.15, z, 0, compound, false)
    addBox(0.72, 0.1, 0.18, mat.darkMetal, x + 0.3, 4.28, z, 0, compound, false)
    addBox(0.44, 0.12, 0.28, mat.glowWarm, x + 0.55, 4.17, z, 0, compound, false)
    const l = new THREE.PointLight(0xffb56b, 9, 12, 2)
    l.position.set(x + 0.55, 4.05, z)
    scene.add(l)
    effects.push({ type: 'lamp', light: l, phase: Math.random() * 8 })
    addCollider(x, z, 0.25, 0.25)
  }
  lampPost(-8, -24.5)
  lampPost(8, -34)
  lampPost(-8, -49)

  const flag = new THREE.Group()
  addBox(0.08, 6.4, 0.08, mat.darkMetal, 0, 3.2, 0, 0, flag, false)
  addBox(0.2, 0.12, 0.2, mat.darkMetal, 0, 6.4, 0, 0, flag, false)
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.55, 18, 6), new THREE.MeshStandardMaterial({ map: flagTexture(), side: THREE.DoubleSide, roughness: 0.94 }))
  cloth.position.set(1.48, 5.45, 0)
  cloth.castShadow = true
  flag.add(cloth)
  flag.position.set(-2.5, 0, -40)
  flag.rotation.y = 0.2
  scene.add(flag)
  addCollider(-2.5, -40, 0.5, 0.5)
  flags.push({ mesh: cloth, base: cloth.geometry.attributes.position.array.slice(), phase: 0 })

  const cableMat = new THREE.MeshStandardMaterial({ color: 0x181a19, roughness: 0.9 })
  function cable(points) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => V(p[0], p[1], p[2])))
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.022, 4, false), cableMat)
    scene.add(m)
  }
  cable([[9.5, 6.7, -46], [8, 5.6, -40], [7.5, 0.4, -33], [6.4, 0.1, -28.3]])
  cable([[-14.6, 3.2, -55.8], [-14.8, 2.9, -50], [-15, 0.2, -46]])
  cable([[-11, 7.08, -8.5], [-10.4, 5.8, -20], [-9.7, 4.3, -33], [-9.5, 3.9, -46]])
  cable([[-12, 7.08, -8.5], [-14.6, 5.4, -15], [-17.2, 3.6, -22]])


  for (let i = 0; i < 86; i++) {
    const x = (rand() - 0.5) * 38
    const z = -22 - rand() * 34
    if (rand() < 0.35) continue
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.12 + rand() * 0.2, 0.16 + rand() * 0.28), new THREE.MeshStandardMaterial({ color: 0x8d887a, roughness: 1, side: THREE.DoubleSide }))
    paper.rotation.set(-Math.PI / 2 + rand() * 0.2, rand() * 3, rand() * 3)
    paper.position.set(x, 0.06 + rand() * 0.02, z)
    paper.receiveShadow = true
    scene.add(paper)
  }

  const dustGeo = new THREE.BufferGeometry()
  const dustPos = new Float32Array(1400 * 3)
  const dustSeed = []
  for (let i = 0; i < 1400; i++) {
    const x = (rand() - 0.5) * 120
    const z = -68 + rand() * 100
    const y = rand() * 14 + 0.2
    dustPos[i * 3] = x
    dustPos[i * 3 + 1] = y
    dustPos[i * 3 + 2] = z
    dustSeed.push({ x, y, z, s: 0.3 + rand() })
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    map: dotTexture(), color: 0xffd7ab, size: 0.075, transparent: true, opacity: 0.44,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }))
  scene.add(dust)

  const emberGeo = new THREE.BufferGeometry()
  const emberCount = 70
  const emberPos = new Float32Array(emberCount * 3)
  const emberData = []
  for (let i = 0; i < emberCount; i++) {
    emberData.push({ x: 1.6 + (rand() - 0.5) * 0.6, y: 1.2 + rand() * 4, z: -27.8 + (rand() - 0.5) * 0.6, v: 0.3 + rand() * 0.7, phase: rand() * 8 })
    emberPos[i * 3] = emberData[i].x
    emberPos[i * 3 + 1] = emberData[i].y
    emberPos[i * 3 + 2] = emberData[i].z
  }
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3))
  const embers = new THREE.Points(emberGeo, new THREE.PointsMaterial({
    map: dotTexture(), color: 0xff9a40, size: 0.075, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false
  }))
  scene.add(embers)

  const smokeSprites = []
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokePuffTexture(), color: 0x8c8275, transparent: true, opacity: 0.35, depthWrite: false }))
    const sx = 2.0 + (rand() - 0.5) * 2
    const sy = 2 + rand() * 7
    const sz = -27 + (rand() - 0.5) * 2
    s.position.set(sx, sy, sz)
    s.scale.set(1.4, 1.4, 1)
    scene.add(s)
    smokeSprites.push({ sprite: s, phase: rand() * 10, speed: 0.16 + rand() * 0.2, base: 0.25 + rand() * 0.2 })
  }
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTexture(), color: 0x7f7568, transparent: true, opacity: 0.22, depthWrite: false }))
    s.position.set(10.5 + (rand() - 0.5) * 6, 7 + rand() * 12, -47 + (rand() - 0.5) * 5)
    s.scale.set(5 + rand() * 6, 5 + rand() * 6, 1)
    scene.add(s)
    smokeSprites.push({ sprite: s, phase: rand() * 10, speed: 0.1 + rand() * 0.15, base: 0.15 + rand() * 0.18 })
  }
  effects.push({ type: 'smoke', sprites: smokeSprites })

  const muzzleFlashEnemy = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTexture(), color: 0xffc27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }))
  muzzleFlashEnemy.scale.set(1.2, 1.2, 1)
  muzzleFlashEnemy.visible = false
  scene.add(muzzleFlashEnemy)

  const enemyMaterials = {
    cloth: new THREE.MeshStandardMaterial({ color: 0x5a5844, roughness: 0.95 }),
    clothDark: new THREE.MeshStandardMaterial({ color: 0x3c3b2d, roughness: 0.95 }),
    vest: new THREE.MeshStandardMaterial({ color: 0x44432f, roughness: 0.82 }),
    skin: new THREE.MeshStandardMaterial({ color: 0x7d6047, roughness: 0.88 }),
    helmet: new THREE.MeshStandardMaterial({ color: 0x3f402f, roughness: 0.8 }),
    boot: new THREE.MeshStandardMaterial({ color: 0x1d1c17, roughness: 0.94 }),
    gun: new THREE.MeshStandardMaterial({ color: 0x1a1b1b, roughness: 0.52, metalness: 0.6 }),
    accent: new THREE.MeshStandardMaterial({ color: 0x9b2f22, roughness: 0.75 })
  }

  function createSoldier(x, z, heading, variant) {
    const g = new THREE.Group()
    const skin = variant % 2 === 0 ? enemyMaterials.skin : new THREE.MeshStandardMaterial({ color: 0x6a4c35, roughness: 0.9 })
    const torso = new THREE.Group()
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.58, 0.27), enemyMaterials.cloth)
    chest.position.y = 1.2
    chest.castShadow = true
    torso.add(chest)
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.44, 0.33), enemyMaterials.vest)
    vest.position.set(0, 1.25, 0.01)
    vest.castShadow = true
    torso.add(vest)
    for (let i = 0; i < 3; i++) {
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.09), enemyMaterials.clothDark)
      pouch.position.set(-0.15 + i * 0.15, 1.06, 0.19)
      pouch.castShadow = true
      torso.add(pouch)
    }
    const patch = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.01), enemyMaterials.accent)
    patch.position.set(0.12, 1.34, 0.2)
    torso.add(patch)
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.18), enemyMaterials.clothDark)
    backpack.position.set(0, 1.25, -0.2)
    backpack.castShadow = true
    torso.add(backpack)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 12), skin)
    head.position.y = 1.64
    head.castShadow = true
    torso.add(head)
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.58), enemyMaterials.helmet)
    helmet.position.y = 1.665
    helmet.castShadow = true
    torso.add(helmet)
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.025, 16), enemyMaterials.helmet)
    brim.position.y = 1.59
    torso.add(brim)
    const nvg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.07), enemyMaterials.gun)
    nvg.position.set(0, 1.71, 0.12)
    torso.add(nvg)
    const goggle = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.04, 0.02), new THREE.MeshStandardMaterial({ color: 0x6b8f8a, emissive: 0x24443f, emissiveIntensity: 1.4, roughness: 0.3 }))
    goggle.position.set(0, 1.63, 0.13)
    torso.add(goggle)

    const arms = []
    for (const side of [-1, 1]) {
      const arm = new THREE.Group()
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.14), enemyMaterials.cloth)
      upper.position.y = -0.16
      upper.castShadow = true
      arm.add(upper)
      const lower = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.32, 0.12), enemyMaterials.clothDark)
      lower.position.y = -0.46
      lower.castShadow = true
      arm.add(lower)
      const glove = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.13, 0.15), enemyMaterials.boot)
      glove.position.y = -0.66
      arm.add(glove)
      arm.position.set(side * 0.3, 1.43, 0)
      arm.rotation.x = -0.95
      arm.rotation.z = side * 0.15
      torso.add(arm)
      arms.push(arm)
    }

    const rifle = new THREE.Group()
    const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.08, 0.85), enemyMaterials.gun)
    gunBody.castShadow = true
    rifle.add(gunBody)
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.2, 0.1), enemyMaterials.gun)
    mag.position.set(0, -0.13, 0.1)
    mag.rotation.x = 0.2
    rifle.add(mag)
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.42, 8), enemyMaterials.gun)
    barrel.rotation.x = Math.PI / 2
    barrel.position.z = -0.62
    rifle.add(barrel)
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.25), enemyMaterials.gun)
    stock.position.z = 0.46
    rifle.add(stock)
    const scope = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.22), enemyMaterials.gun)
    scope.position.set(0, 0.07, 0)
    rifle.add(scope)
    rifle.position.set(0.03, 1.22, 0.36)
    torso.add(rifle)

    const legs = []
    for (const side of [-1, 1]) {
      const leg = new THREE.Group()
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.48, 0.17), enemyMaterials.cloth)
      upper.position.y = -0.24
      upper.castShadow = true
      leg.add(upper)
      const lower = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.44, 0.15), enemyMaterials.clothDark)
      lower.position.y = -0.68
      lower.castShadow = true
      leg.add(lower)
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.26), enemyMaterials.boot)
      boot.position.set(0, -0.93, 0.04)
      boot.castShadow = true
      leg.add(boot)
      leg.position.set(side * 0.12, 0.94, 0)
      torso.add(leg)
      legs.push(leg)
    }

    g.add(torso)
    g.position.set(x, 0, z)
    g.rotation.y = heading
    scene.add(g)

    const enemy = {
      group: g, torso, legs, arms, head, alive: true, hp: 100, phase: rand() * 8,
      home: V(x, 0, z), heading, alert: false, fireTimer: 5.5 + rand() * 5.5,
      deathTime: 0, variant, hit: 0
    }

    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })
    const hitBoxes = [
      { geo: new THREE.BoxGeometry(0.56, 0.68, 0.44), y: 1.24, part: 'body' },
      { geo: new THREE.BoxGeometry(0.32, 0.34, 0.3), y: 1.64, part: 'head' },
      { geo: new THREE.BoxGeometry(0.36, 0.9, 0.3), y: 0.48, part: 'legs' }
    ]
    for (const hb of hitBoxes) {
      const m = new THREE.Mesh(hb.geo, hitMat)
      m.position.y = hb.y
      m.userData.enemy = enemy
      m.userData.part = hb.part
      g.add(m)
      shootables.push(m)
    }

    enemies.push(enemy)
    actors.push({ type: 'enemy', enemy })
    return enemy
  }

  createSoldier(-1.4, -26.5, 0.15, 0)
  createSoldier(3.1, -20.4, 2.75, 7)
  createSoldier(-6.9, -34.2, 1.2, 1)
  createSoldier(6.4, -36.5, -0.5, 2)
  createSoldier(11.2, -43.8, -1.1, 3)
  createSoldier(-13.6, -49.5, 1.7, 4)
  createSoldier(2.8, -50.6, 0.2, 5)
  const containerGuard = createSoldier(-14.5, -31.4, 0.5, 8)
  containerGuard.group.position.y = 2.78
  containerGuard.home.y = 2.78
  const roofGuard = createSoldier(10.2, -47.2, 0.2, 9)
  roofGuard.group.position.y = 6.8
  roofGuard.home.y = 6.8
  for (const [wx, wz, hv] of [[-10.5, -21.9, 0.1], [10.4, -21.9, -0.15]]) {
    const guard = createSoldier(wx, wz, hv, 10 + Math.round(wx))
    guard.group.position.y = 2.9
    guard.home.y = 2.9
  }

  const towerEnemy = createSoldier(-11.8, -44, 0.9, 6)
  towerEnemy.group.position.y = 8.62
  towerEnemy.home.y = 8.62
  towerEnemy.hitboxes = null

  actors.push({ type: 'enemy', enemy: towerEnemy })

  const birds = []
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Group()
    const matB = new THREE.MeshBasicMaterial({ color: 0x201d1a, side: THREE.DoubleSide })
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.14), matB)
      wing.position.x = side * 0.28
      wing.rotation.z = side * 0.18
      s.add(wing)
    }
    s.position.set(-20 + rand() * 50, 22 + rand() * 16, -50 - rand() * 40)
    s.scale.setScalar(0.8 + rand() * 1.1)
    scene.add(s)
    birds.push({ g: s, phase: rand() * 8, speed: 0.6 + rand() * 0.5, radius: 8 + rand() * 12, cx: s.position.x, cz: s.position.z, y: s.position.y })
  }

  function update(dt, time, playerPos, handlers = {}) {
    clock.t += dt
    sky.position.copy(playerPos)
    sunSprite.position.copy(V(-190, 70, -390)).add(playerPos)

    for (const f of flags) {
      const p = f.mesh.geometry.attributes.position
      const arr = f.base
      for (let i = 0; i < p.count; i++) {
        const x = arr[i * 3]
        const y = arr[i * 3 + 1]
        const wave = Math.sin(x * 2.6 + time * 4.2 + y * 1.4) * 0.11 + Math.sin(x * 1.2 - time * 2.1) * 0.06
        p.setZ(i, wave * (x / 2.9 + 0.6))
        p.setY(i, y + Math.sin(x * 1.9 + time * 2.6) * 0.035)
      }
      p.needsUpdate = true
      f.mesh.geometry.computeVertexNormals()
    }

    for (const e of effects) {
      if (e.type === 'fire') {
        for (const f of e.sprites) {
          const fl = 0.7 + Math.sin(time * 11 + f.phase) * 0.18 + Math.sin(time * 23 + f.phase * 2) * 0.1
          f.sprite.scale.set(f.base * fl, f.base * 1.3 * fl, 1)
          f.sprite.position.y = 1.02 + Math.sin(time * 3 + f.phase) * 0.1
          f.sprite.material.opacity = 0.65 + fl * 0.2
        }
      } else if (e.type === 'fireLight') {
        e.light.intensity = e.base * (0.72 + Math.sin(time * 9.3) * 0.12 + Math.sin(time * 21.7) * 0.08)
      } else if (e.type === 'lamp') {
        e.light.intensity = 9 * (0.9 + Math.sin(time * 5 + e.phase) * 0.05)
      } else if (e.type === 'smoke') {
        for (const s of e.sprites) {
          s.sprite.position.y += dt * s.speed
          s.sprite.position.x += dt * 0.09
          if (s.sprite.position.y > 24) s.sprite.position.y = 1.4
          s.sprite.material.opacity = s.base * (0.5 + 0.5 * Math.sin(time * 0.8 + s.phase)) + 0.04
        }
      } else if (e.type === 'beacon') {
        e.mesh.visible = Math.sin(time * 3) > 0.45
      } else if (e.type === 'beam') {
        e.mesh.material.opacity = e.base * (0.85 + Math.sin(time * 1.4) * 0.15)
      } else if (e.type === 'heli') {
        const t = time * 0.045
        e.heli.position.x = -46 + Math.cos(t) * 34
        e.heli.position.z = -76 + Math.sin(t) * 24
        e.heli.position.y = 22 + Math.sin(t * 2.4) * 2.2
        e.heli.rotation.y = -t + Math.PI / 2
        e.heli.rotation.z = Math.sin(t * 3.1) * 0.06
        e.rotor.rotation.y = time * 32
        e.tailRotor.rotation.x = time * 38
        e.blur.rotation.z = time * 20
        e.blur.material.opacity = 0.12 + Math.sin(time * 12) * 0.03
      }
    }

    for (const b of birds) {
      const t = time * b.speed + b.phase
      b.g.position.x = b.cx + Math.cos(t) * b.radius
      b.g.position.z = b.cz + Math.sin(t) * b.radius
      b.g.position.y = b.y + Math.sin(t * 1.7) * 1.6
      b.g.rotation.y = -t + Math.PI / 2
      b.g.children[0].rotation.z = 0.25 + Math.sin(time * 9 + b.phase) * 0.18
      b.g.children[1].rotation.z = -0.25 - Math.sin(time * 9 + b.phase) * 0.18
    }

    const dustAttr = dust.geometry.attributes.position
    for (let i = 0; i < dustSeed.length; i++) {
      const s = dustSeed[i]
      dustAttr.array[i * 3] = s.x + Math.sin(time * 0.18 * s.s + s.y) * 1.4
      dustAttr.array[i * 3 + 1] = s.y + Math.sin(time * 0.32 + s.x * 0.1) * 0.6
      dustAttr.array[i * 3 + 2] = s.z + Math.cos(time * 0.14 * s.s + s.x) * 1.2
    }
    dustAttr.needsUpdate = true
    for (let i = 0; i < emberData.length; i++) {
      const e = emberData[i]
      e.y += dt * e.v
      e.x += Math.sin(time * 2 + e.phase) * dt * 0.22
      if (e.y > 6) { e.y = 1.1; e.x = 1.6 + (rand() - 0.5) * 0.6; e.z = -27.8 + (rand() - 0.5) * 0.6 }
      emberGeo.attributes.position.array[i * 3] = e.x
      emberGeo.attributes.position.array[i * 3 + 1] = e.y
      emberGeo.attributes.position.array[i * 3 + 2] = e.z
    }
    emberGeo.attributes.position.needsUpdate = true

    for (const a of actors) {
      const en = a.enemy
      if (en.alive) {
        const sway = Math.sin(time * 1.3 + en.phase) * 0.02
        en.group.rotation.y = en.heading + sway
        en.torso.position.y = Math.sin(time * 1.6 + en.phase) * 0.012
        const d = en.group.position.distanceTo(playerPos)
        if (d < 70) en.alert = true
        if (en.alert && handlers.onEnemyFire) {
          en.fireTimer -= dt
          if (en.fireTimer <= 0 && d < 62) {
            en.fireTimer = 5.5 + Math.random() * 5.5
            const origin = en.group.position.clone().add(V(0.03, 1.3, 0.4))
            if (en.group.position.y > 5) origin.y += 0.2
            handlers.onEnemyFire(en, origin)
            muzzleFlashEnemy.position.copy(origin)
            muzzleFlashEnemy.visible = true
            muzzleFlashEnemy.material.opacity = 1
            muzzleFlashEnemy.material.rotation = Math.random() * 6
            muzzleFlashEnemy.scale.setScalar(0.8 + Math.random() * 0.5)
            if (handlers.onEnemyDamage) handlers.onEnemyDamage(en, 3 + Math.random() * 5)
          }
        }
      } else {
        en.deathTime += dt
        const t = Math.min(1, en.deathTime / 1.1)
        en.group.rotation.x = t * 1.35
        en.group.position.y = Math.max(-0.95, en.group.position.y - dt * (en.deathTime > 0.35 ? 0.45 : 0))
        if (en.deathTime > 4) en.group.visible = false
      }
    }
    muzzleFlashEnemy.material.opacity = Math.min(1, Math.max(0, muzzleFlashEnemy.material.opacity - dt * 9))
    if (muzzleFlashEnemy.material.opacity <= 0.01) muzzleFlashEnemy.visible = false

    if (handlers.onEnemyUpdate) handlers.onEnemyUpdate()
  }

  function damageEnemy(enemy, amount, part) {
    if (!enemy.alive) return false
    enemy.hp -= amount
    enemy.hit = 0.12
    enemy.alert = true
    enemy.fireTimer = Math.min(enemy.fireTimer, 1.1)
    if (part === 'head') enemy.hp -= 80
    if (enemy.hp <= 0) {
      enemy.alive = false
      enemy.deathTime = 0
      return true
    }
    return false
  }

  function blocked(x, z, radius = 0.34) {
    for (const c of colliders) {
      if (x + radius > c.minX && x - radius < c.maxX && z + radius > c.minZ && z - radius < c.maxZ) return true
    }
    return false
  }

  function isWalkable(x, z) {
    return x > -24 && x < 24 && z > -62 && z < 16 && !blocked(x, z)
  }

  return {
    update, enemies, shootables, colliders, blocked, isWalkable, damageEnemy,
    sun, sky, terrain, terrainHeight, effects, actors
  }
}
