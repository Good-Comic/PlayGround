import * as THREE from 'three'
import { bulletHoleTexture, dotTexture, smokePuffTexture } from './textures.js'

const V = (x, y, z) => new THREE.Vector3(x, y, z)

export function createEffects(scene) {
  const tracers = []
  const particles = []
  const decals = []
  const casings = []
  const flashes = []
  const holeMap = bulletHoleTexture()
  const dotMap = dotTexture()
  const bloodMap = smokePuffTexture()

  const tracerGeo = new THREE.CylinderGeometry(0.012, 0.012, 1, 5, 1, true)
  const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffc97a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })

  function spawnTracer(from, to, color = 0xffc97a, width = 1) {
    const mat = tracerMat.clone()
    mat.color.setHex(color)
    const mesh = new THREE.Mesh(tracerGeo, mat)
    const dir = to.clone().sub(from)
    const len = dir.length()
    mesh.position.copy(from).addScaledVector(dir, 0.5)
    mesh.scale.set(width, len, width)
    mesh.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize())
    scene.add(mesh)
    tracers.push({ mesh, life: 0.09, max: 0.09 })

    const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotMap, color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }))
    flash.position.copy(from)
    flash.scale.set(0.38 * width, 0.38 * width, 1)
    scene.add(flash)
    flashes.push({ sprite: flash, life: 0.07, max: 0.07 })
  }

  function spawnImpact(point, normal, color = 0xffc47a) {
    const count = 12
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const vel = []
    for (let i = 0; i < count; i++) {
      pos[i * 3] = point.x
      pos[i * 3 + 1] = point.y
      pos[i * 3 + 2] = point.z
      const v = normal.clone().multiplyScalar(1.5 + Math.random() * 2)
      v.x += (Math.random() - 0.5) * 4
      v.y += (Math.random() - 0.2) * 4
      v.z += (Math.random() - 0.5) * 4
      vel.push(v)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ map: dotMap, color, size: 0.045, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)
    particles.push({ points: pts, vel, life: 0.55, max: 0.55, gravity: 9 })

    const puff = new THREE.Sprite(new THREE.SpriteMaterial({ map: bloodMap, color: 0xb9a48a, transparent: true, opacity: 0.55, depthWrite: false }))
    puff.position.copy(point).addScaledVector(normal, 0.02)
    puff.scale.set(0.35, 0.35, 1)
    scene.add(puff)
    particles.push({ sprite: puff, life: 0.5, max: 0.5, grow: 1.5, rise: 0.25 })

    const decalMat = new THREE.MeshBasicMaterial({ map: holeMap, transparent: true, opacity: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })
    const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), decalMat)
    decal.position.copy(point).addScaledVector(normal, 0.008)
    decal.lookAt(point.clone().add(normal))
    decal.rotation.z = Math.random() * Math.PI * 2
    scene.add(decal)
    decals.push({ mesh: decal, life: 18 })
    if (decals.length > 36) {
      const old = decals.shift()
      scene.remove(old.mesh)
      old.mesh.material.dispose()
    }
  }

  function spawnBlood(point, dir) {
    const count = 8
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const vel = []
    for (let i = 0; i < count; i++) {
      pos[i * 3] = point.x
      pos[i * 3 + 1] = point.y
      pos[i * 3 + 2] = point.z
      const v = dir.clone().multiplyScalar(0.5 + Math.random())
      v.x += (Math.random() - 0.5) * 1.5
      v.y += Math.random() * 1.8
      v.z += (Math.random() - 0.5) * 1.5
      vel.push(v)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ map: dotMap, color: 0x7e130b, size: 0.07, transparent: true, opacity: 0.9, depthWrite: false })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)
    particles.push({ points: pts, vel, life: 0.5, max: 0.5, gravity: 11 })

    const puff = new THREE.Sprite(new THREE.SpriteMaterial({ map: bloodMap, color: 0x6c0f08, transparent: true, opacity: 0.62, depthWrite: false }))
    puff.position.copy(point)
    puff.scale.set(0.45, 0.45, 1)
    scene.add(puff)
    particles.push({ sprite: puff, life: 0.4, max: 0.4, grow: 1.2, rise: 0.2 })
  }

  function spawnCasing(position, right) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.032, 6), new THREE.MeshStandardMaterial({ color: 0xb98f43, metalness: 0.9, roughness: 0.28 }))
    mesh.position.copy(position)
    scene.add(mesh)
    const vel = right.clone().multiplyScalar(2.2 + Math.random())
    vel.y += 1.6 + Math.random()
    vel.x += (Math.random() - 0.5) * 0.6
    casings.push({ mesh, vel, spin: V(Math.random() * 12, Math.random() * 12, Math.random() * 12), life: 3 })
  }

  function spawnMuzzleLight(position) {
    const light = new THREE.PointLight(0xffa04a, 18, 9, 2)
    light.position.copy(position)
    scene.add(light)
    flashes.push({ light, life: 0.06, max: 0.06 })
  }

  function update(dt) {
    for (let i = tracers.length - 1; i >= 0; i--) {
      const t = tracers[i]
      t.life -= dt
      t.mesh.material.opacity = Math.max(0, t.life / t.max) * 0.9
      if (t.life <= 0) {
        scene.remove(t.mesh)
        t.mesh.material.dispose()
        tracers.splice(i, 1)
      }
    }
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i]
      f.life -= dt
      if (f.sprite) {
        f.sprite.material.opacity = Math.max(0, f.life / f.max) * 0.9
        f.sprite.scale.multiplyScalar(1 + dt * 5)
      }
      if (f.light) f.light.intensity = Math.max(0, f.life / f.max) * 18
      if (f.life <= 0) {
        if (f.sprite) { scene.remove(f.sprite); f.sprite.material.dispose() }
        if (f.light) scene.remove(f.light)
        flashes.splice(i, 1)
      }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.life -= dt
      const k = Math.max(0, p.life / p.max)
      if (p.points) {
        const pos = p.points.geometry.attributes.position
        for (let j = 0; j < p.vel.length; j++) {
          const v = p.vel[j]
          v.y -= (p.gravity || 0) * dt
          pos.array[j * 3] += v.x * dt
          pos.array[j * 3 + 1] += v.y * dt
          pos.array[j * 3 + 2] += v.z * dt
        }
        pos.needsUpdate = true
        p.points.material.opacity = k
      }
      if (p.sprite) {
        p.sprite.material.opacity = Math.min(0.7, k * 0.7)
        const s = 1 + (1 - k) * (p.grow || 1)
        p.sprite.scale.set(0.4 * s, 0.4 * s, 1)
        p.sprite.position.y += (p.rise || 0) * dt
      }
      if (p.life <= 0) {
        if (p.points) { scene.remove(p.points); p.points.geometry.dispose(); p.points.material.dispose() }
        if (p.sprite) { scene.remove(p.sprite); p.sprite.material.dispose() }
        particles.splice(i, 1)
      }
    }
    for (let i = decals.length - 1; i >= 0; i--) {
      const d = decals[i]
      d.life -= dt
      if (d.life <= 0) {
        scene.remove(d.mesh)
        d.mesh.geometry.dispose()
        d.mesh.material.dispose()
        decals.splice(i, 1)
      }
    }
    for (let i = casings.length - 1; i >= 0; i--) {
      const c = casings[i]
      c.life -= dt
      c.vel.y -= 12 * dt
      c.mesh.position.addScaledVector(c.vel, dt)
      c.mesh.rotation.x += c.spin.x * dt
      c.mesh.rotation.y += c.spin.y * dt
      c.mesh.rotation.z += c.spin.z * dt
      if (c.mesh.position.y < 0.035) {
        c.mesh.position.y = 0.035
        c.vel.y *= -0.35
        c.vel.x *= 0.6
        c.vel.z *= 0.6
        c.spin.multiplyScalar(0.5)
      }
      if (c.life <= 0) {
        scene.remove(c.mesh)
        c.mesh.geometry.dispose()
        c.mesh.material.dispose()
        casings.splice(i, 1)
      }
    }
  }

  return { spawnTracer, spawnImpact, spawnBlood, spawnCasing, spawnMuzzleLight, update }
}
