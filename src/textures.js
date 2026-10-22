import * as THREE from 'three'

export function rng(seed = 1) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canvas(size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  return [c, c.getContext('2d')]
}

function finish(c, repeat = [1, 1], srgb = true) {
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.anisotropy = 8
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}

function noise(ctx, size, amount, alpha, rand = Math.random) {
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * amount
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
    if (alpha !== undefined) d[i + 3] = alpha
  }
  ctx.putImageData(img, 0, 0)
}

function blob(ctx, x, y, r, color, rand, points = 14) {
  ctx.beginPath()
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * Math.PI * 2
    const rr = r * (0.55 + rand() * 0.65)
    const px = x + Math.cos(a) * rr
    const py = y + Math.sin(a) * rr
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

export function sandTexture() {
  const size = 512
  const [c, x] = canvas(size)
  const rand = rng(91)
  x.fillStyle = '#9a7b58'
  x.fillRect(0, 0, size, size)
  for (let i = 0; i < 2600; i++) {
    const r = rand() * 2.4 + 0.3
    x.fillStyle = rand() > 0.5 ? `rgba(${70 + rand() * 50},${52 + rand() * 40},${34 + rand() * 30},${0.1 + rand() * 0.3})` : `rgba(${190 + rand() * 40},${164 + rand() * 35},${132 + rand() * 30},${0.08 + rand() * 0.16})`
    x.beginPath()
    x.arc(rand() * size, rand() * size, r, 0, Math.PI * 2)
    x.fill()
  }
  for (let i = 0; i < 130; i++) blob(x, rand() * size, rand() * size, 4 + rand() * 16, `rgba(120,96,68,${0.05 + rand() * 0.11})`, rand)
  for (let i = 0; i < 26; i++) {
    x.strokeStyle = `rgba(78,60,42,${0.06 + rand() * 0.08})`
    x.lineWidth = 0.7 + rand()
    x.beginPath()
    const y = rand() * size
    x.moveTo(0, y)
    x.bezierCurveTo(size * 0.3, y + rand() * 20 - 10, size * 0.7, y + rand() * 20 - 10, size, y + rand() * 14 - 7)
    x.stroke()
  }
  noise(x, size, 22)
  return finish(c, [22, 22])
}

export function asphaltTexture() {
  const size = 512
  const [c, x] = canvas(size)
  const rand = rng(17)
  x.fillStyle = '#2d2c2a'
  x.fillRect(0, 0, size, size)
  for (let i = 0; i < 9000; i++) {
    const v = 40 + rand() * 60
    x.fillStyle = `rgba(${v},${v - 2},${v - 4},${0.12 + rand() * 0.3})`
    x.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2)
  }
  for (let i = 0; i < 12; i++) {
    x.strokeStyle = `rgba(12,12,12,${0.2 + rand() * 0.25})`
    x.lineWidth = 0.8 + rand() * 1.6
    x.beginPath()
    let px = rand() * size, py = rand() * size
    x.moveTo(px, py)
    for (let j = 0; j < 5; j++) {
      px += rand() * 70 - 35
      py += rand() * 70 - 35
      x.lineTo(px, py)
    }
    x.stroke()
  }
  for (let i = 0; i < 40; i++) blob(x, rand() * size, rand() * size, 8 + rand() * 40, `rgba(110,105,96,${0.02 + rand() * 0.05})`, rand)
  noise(x, size, 18)
  return finish(c, [3, 12])
}

export function concreteTexture(tint = '#8d8a80', dirty = 0.5) {
  const size = 512
  const [c, x] = canvas(size)
  const rand = rng(37)
  x.fillStyle = tint
  x.fillRect(0, 0, size, size)
  for (let i = 0; i < 1600; i++) {
    const v = 90 + rand() * 90
    x.fillStyle = `rgba(${v},${v - 2},${v - 8},${0.04 + rand() * 0.15})`
    x.beginPath()
    x.arc(rand() * size, rand() * size, 1 + rand() * 9, 0, Math.PI * 2)
    x.fill()
  }
  for (let i = 0; i < 20; i++) {
    const x0 = rand() * size
    const grad = x.createLinearGradient(x0, 0, x0, size)
    grad.addColorStop(0, `rgba(40,38,34,${0.18 * dirty})`)
    grad.addColorStop(0.5, `rgba(55,52,46,${0.03 * dirty})`)
    grad.addColorStop(1, `rgba(30,29,26,${0.14 * dirty})`)
    x.fillStyle = grad
    x.fillRect(x0, 0, 2 + rand() * 14, size)
  }
  x.strokeStyle = 'rgba(35,33,30,0.55)'
  x.lineWidth = 2
  x.beginPath()
  x.moveTo(0, size * 0.5)
  x.lineTo(size, size * 0.5)
  x.moveTo(size * 0.5, 0)
  x.lineTo(size * 0.5, size)
  x.stroke()
  noise(x, size, 30)
  return finish(c, [2, 2])
}

export function containerTexture(color = '#7a3d2c') {
  const size = 512
  const [c, x] = canvas(size)
  const rand = rng(63)
  x.fillStyle = color
  x.fillRect(0, 0, size, size)
  for (let i = 0; i < size; i += 16) {
    x.fillStyle = 'rgba(0,0,0,0.22)'
    x.fillRect(i, 0, 3, size)
    x.fillStyle = 'rgba(255,255,255,0.075)'
    x.fillRect(i + 8, 0, 5, size)
  }
  for (let i = 0; i < 80; i++) blob(x, rand() * size, rand() * size, 2 + rand() * 12, `rgba(92,48,24,${0.08 + rand() * 0.25})`, rand)
  for (let i = 0; i < 60; i++) {
    x.strokeStyle = `rgba(58,30,16,${0.18 + rand() * 0.4})`
    x.lineWidth = 0.5 + rand() * 1.5
    x.beginPath()
    const sx = rand() * size, sy = rand() * size
    x.moveTo(sx, sy)
    x.lineTo(sx + rand() * 4 - 2, sy + 8 + rand() * 30)
    x.stroke()
  }
  const grad = x.createLinearGradient(0, size * 0.65, 0, size)
  grad.addColorStop(0, 'rgba(60,40,20,0)')
  grad.addColorStop(1, 'rgba(45,28,12,0.5)')
  x.fillStyle = grad
  x.fillRect(0, 0, size, size)
  noise(x, size, 24)
  return finish(c, [1, 1])
}

export function metalTexture() {
  const size = 512
  const [c, x] = canvas(size)
  const rand = rng(11)
  x.fillStyle = '#3d4142'
  x.fillRect(0, 0, size, size)
  for (let i = 0; i < 900; i++) {
    x.strokeStyle = `rgba(${120 + rand() * 80},${125 + rand() * 80},${125 + rand() * 80},${0.02 + rand() * 0.09})`
    x.lineWidth = 0.5 + rand()
    const y = rand() * size
    x.beginPath()
    x.moveTo(rand() * size, y)
    x.lineTo(rand() * size, y + rand() * 2 - 1)
    x.stroke()
  }
  for (let i = 0; i < 40; i++) blob(x, rand() * size, rand() * size, 3 + rand() * 22, `rgba(70,52,34,${0.04 + rand() * 0.14})`, rand)
  noise(x, size, 14)
  return finish(c, [2, 2])
}

export function woodTexture() {
  const size = 512
  const [c, x] = canvas(size)
  const rand = rng(29)
  x.fillStyle = '#6f5638'
  x.fillRect(0, 0, size, size)
  for (let i = 0; i < 70; i++) {
    const y = rand() * size
    x.strokeStyle = `rgba(${40 + rand() * 35},${28 + rand() * 25},${16 + rand() * 16},${0.2 + rand() * 0.38})`
    x.lineWidth = 0.5 + rand() * 2.2
    x.beginPath()
    x.moveTo(0, y)
    x.bezierCurveTo(size * 0.3, y + rand() * 16 - 8, size * 0.7, y + rand() * 16 - 8, size, y + rand() * 10 - 5)
    x.stroke()
  }
  x.fillStyle = 'rgba(20,16,10,0.5)'
  x.fillRect(0, size * 0.48, size, 3)
  x.fillRect(0, size * 0.94, size, 3)
  noise(x, size, 26)
  return finish(c, [1, 1])
}

export function sandbagTexture() {
  const size = 256
  const [c, x] = canvas(size)
  const rand = rng(53)
  x.fillStyle = '#8b7753'
  x.fillRect(0, 0, size, size)
  for (let i = 0; i < 1000; i++) {
    x.fillStyle = `rgba(${90 + rand() * 80},${78 + rand() * 60},${52 + rand() * 40},${0.12 + rand() * 0.25})`
    x.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 3)
  }
  x.strokeStyle = 'rgba(55,46,30,0.35)'
  x.lineWidth = 1
  for (let i = 0; i < 14; i++) {
    x.beginPath()
    x.moveTo(rand() * size, 0)
    x.lineTo(rand() * size, size)
    x.stroke()
  }
  noise(x, size, 20)
  return finish(c, [1, 1])
}

export function flashTexture() {
  const size = 256
  const [c, x] = canvas(size)
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,240,1)')
  g.addColorStop(0.12, 'rgba(255,226,150,0.98)')
  g.addColorStop(0.32, 'rgba(255,145,40,0.55)')
  g.addColorStop(0.62, 'rgba(255,90,10,0.1)')
  g.addColorStop(1, 'rgba(255,60,0,0)')
  x.fillStyle = g
  x.fillRect(0, 0, size, size)
  x.translate(size / 2, size / 2)
  x.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 9; i++) {
    x.rotate((Math.PI * 2) / 9)
    const sg = x.createLinearGradient(0, 0, size * 0.5, 0)
    sg.addColorStop(0, 'rgba(255,240,200,0.85)')
    sg.addColorStop(1, 'rgba(255,140,30,0)')
    x.fillStyle = sg
    x.beginPath()
    x.moveTo(0, -4)
    x.lineTo(size * (0.28 + Math.random() * 0.22), 0)
    x.lineTo(0, 4)
    x.fill()
  }
  return finish(c, [1, 1])
}

export function smokeTexture() {
  const size = 256
  const [c, x] = canvas(size)
  const rand = rng(77)
  x.clearRect(0, 0, size, size)
  for (let i = 0; i < 26; i++) {
    const px = size / 2 + (rand() - 0.5) * size * 0.5
    const py = size / 2 + (rand() - 0.5) * size * 0.5
    const r = size * (0.08 + rand() * 0.22)
    const g = x.createRadialGradient(px, py, 0, px, py, r)
    g.addColorStop(0, `rgba(190,180,165,${0.09 + rand() * 0.1})`)
    g.addColorStop(1, 'rgba(150,145,135,0)')
    x.fillStyle = g
    x.beginPath()
    x.arc(px, py, r, 0, Math.PI * 2)
    x.fill()
  }
  return finish(c, [1, 1])
}

export function dotTexture() {
  const size = 128
  const [c, x] = canvas(size)
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.85)')
  g.addColorStop(0.7, 'rgba(255,255,255,0.2)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.fillRect(0, 0, size, size)
  return finish(c, [1, 1])
}

export function bulletHoleTexture() {
  const size = 128
  const [c, x] = canvas(size)
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(8,7,6,0.98)')
  g.addColorStop(0.16, 'rgba(20,18,16,0.95)')
  g.addColorStop(0.34, 'rgba(60,55,48,0.55)')
  g.addColorStop(0.62, 'rgba(40,36,30,0.16)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = g
  x.fillRect(0, 0, size, size)
  x.strokeStyle = 'rgba(20,18,15,0.5)'
  x.lineWidth = 1.5
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * Math.PI * 2
    x.beginPath()
    x.moveTo(size / 2 + Math.cos(a) * 7, size / 2 + Math.sin(a) * 7)
    x.lineTo(size / 2 + Math.cos(a) * (14 + Math.random() * 14), size / 2 + Math.sin(a) * (14 + Math.random() * 14))
    x.stroke()
  }
  return finish(c, [1, 1])
}

export function grungeTexture() {
  const size = 256
  const [c, x] = canvas(size)
  const rand = rng(303)
  x.clearRect(0, 0, size, size)
  for (let i = 0; i < 40; i++) {
    const px = rand() * size
    const py = rand() * size
    const r = 10 + rand() * 52
    const g = x.createRadialGradient(px, py, 0, px, py, r)
    g.addColorStop(0, `rgba(25,22,18,${0.08 + rand() * 0.22})`)
    g.addColorStop(1, 'rgba(20,18,15,0)')
    x.fillStyle = g
    x.beginPath()
    x.arc(px, py, r, 0, Math.PI * 2)
    x.fill()
  }
  for (let i = 0; i < 26; i++) {
    const px = rand() * size
    const g = x.createLinearGradient(0, 0, 0, size)
    g.addColorStop(0, 'rgba(28,24,20,0)')
    g.addColorStop(0.35, `rgba(28,24,20,${0.12 + rand() * 0.28})`)
    g.addColorStop(1, 'rgba(28,24,20,0)')
    x.fillStyle = g
    x.fillRect(px, 0, 1 + rand() * 5, size)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

export function stencilTexture(text, sub, color = '#d8cbb2') {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const x = c.getContext('2d')
  x.clearRect(0, 0, 512, 256)
  x.strokeStyle = 'rgba(200,185,160,0.55)'
  x.lineWidth = 5
  x.strokeRect(18, 18, 476, 220)
  x.fillStyle = color
  x.font = '800 72px monospace'
  x.textAlign = 'center'
  x.fillText(text, 256, 118)
  x.fillStyle = 'rgba(210,150,90,0.85)'
  x.font = '600 22px monospace'
  x.fillText(sub, 256, 162)
  x.fillStyle = 'rgba(210,150,90,0.55)'
  x.fillRect(120, 186, 272, 4)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function smokePuffTexture() {
  const size = 128
  const [c, x] = canvas(size)
  const rand = rng(101)
  for (let i = 0; i < 22; i++) {
    const px = size / 2 + (rand() - 0.5) * size * 0.45
    const py = size / 2 + (rand() - 0.5) * size * 0.45
    const r = size * (0.08 + rand() * 0.22)
    const g = x.createRadialGradient(px, py, 0, px, py, r)
    g.addColorStop(0, `rgba(30,28,26,${0.14 + rand() * 0.12})`)
    g.addColorStop(1, 'rgba(20,18,16,0)')
    x.fillStyle = g
    x.beginPath()
    x.arc(px, py, r, 0, Math.PI * 2)
    x.fill()
  }
  return finish(c, [1, 1])
}
