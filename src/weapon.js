import * as THREE from 'three'
import { flashTexture } from './textures.js'

const V = (x, y, z) => new THREE.Vector3(x, y, z)

export function createWeapon(camera, scene) {
  const group = new THREE.Group()
  camera.add(group)
  scene.add(camera)

  const tan = new THREE.MeshStandardMaterial({ color: 0x9c8a62, roughness: 0.55, metalness: 0.2, emissive: 0x1d1810, emissiveIntensity: 0.55 })
  const tanDark = new THREE.MeshStandardMaterial({ color: 0x6c5c3f, roughness: 0.66, metalness: 0.14 })
  const black = new THREE.MeshStandardMaterial({ color: 0x26282a, roughness: 0.44, metalness: 0.62, emissive: 0x0c0d0e, emissiveIntensity: 0.8 })
  const steel = new THREE.MeshStandardMaterial({ color: 0x55595c, roughness: 0.34, metalness: 0.9, emissive: 0x0c0d0e, emissiveIntensity: 0.6 })
  const polymer = new THREE.MeshStandardMaterial({ color: 0x2c2d2a, roughness: 0.82, metalness: 0.08 })
  const glove = new THREE.MeshStandardMaterial({ color: 0x4a4434, roughness: 0.96 })
  const gloveDark = new THREE.MeshStandardMaterial({ color: 0x27251d, roughness: 0.98 })
  const sleeve = new THREE.MeshStandardMaterial({ color: 0x4c4734, roughness: 0.97 })
  const glass = new THREE.MeshStandardMaterial({ color: 0x0e1a1e, roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.72 })
  const reticle = new THREE.MeshBasicMaterial({ color: 0xff2b18, transparent: true, opacity: 0.95 })
  const lens = new THREE.MeshStandardMaterial({ color: 0x2b2a26, roughness: 0.72, metalness: 0.2 })

  function box(w, h, d, m, x, y, z, rx = 0, ry = 0, rz = 0, parent = group) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
    mesh.position.set(x, y, z)
    mesh.rotation.set(rx, ry, rz)
    parent.add(mesh)
    return mesh
  }
  function cyl(r, h, m, x, y, z, axis = 'z', seg = 14, parent = group) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m)
    mesh.position.set(x, y, z)
    if (axis === 'z') mesh.rotation.x = Math.PI / 2
    if (axis === 'x') mesh.rotation.z = Math.PI / 2
    parent.add(mesh)
    return mesh
  }

  const weapon = new THREE.Group()
  group.add(weapon)

  box(0.072, 0.105, 0.3, black, 0, 0, -0.01, 0, 0, 0, weapon)
  box(0.066, 0.055, 0.16, steel, 0, 0.072, -0.09, 0, 0, 0, weapon)
  box(0.076, 0.036, 0.2, black, 0, 0.088, -0.03, 0, 0, 0, weapon)
  for (let i = 0; i < 9; i++) box(0.083, 0.012, 0.012, steel, 0, 0.109, -0.1 + i * 0.022, 0, 0, 0, weapon)

  box(0.066, 0.075, 0.32, tan, 0, 0.005, -0.33, 0, 0, 0, weapon)
  box(0.07, 0.02, 0.32, tanDark, 0, 0.046, -0.33, 0, 0, 0, weapon)
  for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? -1 : 1
    box(0.008, 0.028, 0.065, black, side * 0.034, -0.005, -0.22 - Math.floor(i / 2) * 0.09, 0, 0, 0, weapon)
  }
  box(0.012, 0.012, 0.3, steel, -0.037, 0.012, -0.31, 0, 0, 0, weapon)
  box(0.012, 0.012, 0.3, steel, 0.037, 0.012, -0.31, 0, 0, 0, weapon)

  cyl(0.011, 0.23, steel, 0, 0.008, -0.57, 'z', 10, weapon)
  cyl(0.023, 0.155, black, 0, 0.008, -0.685, 'z', 16, weapon)
  cyl(0.026, 0.014, steel, 0, 0.008, -0.61, 'z', 16, weapon)
  cyl(0.018, 0.012, black, 0, 0.008, -0.766, 'z', 14, weapon)
  cyl(0.012, 0.024, steel, 0, 0.008, -0.778, 'z', 12, weapon)

  box(0.048, 0.028, 0.1, black, 0, 0.104, 0.015, 0, 0, 0, weapon)
  box(0.058, 0.058, 0.115, black, 0, 0.14, 0.006, 0, 0, 0, weapon)
  box(0.062, 0.012, 0.13, steel, 0, 0.162, 0.005, 0, 0, 0, weapon)
  cyl(0.032, 0.13, black, 0, 0.145, 0.006, 'z', 20, weapon)
  const frontGlass = cyl(0.026, 0.004, glass, 0, 0.145, -0.058, 'z', 20, weapon)
  const backGlass = cyl(0.026, 0.004, glass, 0, 0.145, 0.071, 'z', 20, weapon)
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0038, 8, 8), reticle)
  dot.position.set(0, 0.145, 0.062)
  weapon.add(dot)
  const dotGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTexture(), color: 0xff2812, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false }))
  dotGlow.scale.set(0.018, 0.018, 1)
  dotGlow.position.set(0, 0.145, 0.066)
  weapon.add(dotGlow)
  box(0.034, 0.012, 0.08, black, 0, 0.174, 0.005, 0, 0, 0, weapon)
  box(0.022, 0.018, 0.03, steel, 0, 0.19, 0.02, 0, 0, 0, weapon)
  box(0.008, 0.02, 0.008, black, -0.026, 0.126, -0.058, 0, 0, 0, weapon)
  box(0.008, 0.02, 0.008, black, 0.026, 0.126, -0.058, 0, 0, 0, weapon)

  box(0.024, 0.042, 0.085, black, -0.043, 0.03, -0.12, 0, 0, -0.12, weapon)
  box(0.008, 0.015, 0.05, steel, -0.054, 0.03, -0.12, 0, 0, 0, weapon)
  cyl(0.014, 0.03, lens, -0.06, 0.03, -0.148, 'z', 12, weapon)
  box(0.006, 0.038, 0.075, steel, -0.038, 0.012, 0.03, 0, 0, 0, weapon)
  box(0.005, 0.018, 0.05, steel, -0.038, -0.032, 0.09, 0.3, 0, 0, weapon)
  box(0.008, 0.026, 0.026, tanDark, -0.04, -0.038, -0.215, 0, 0, 0, weapon)
  box(0.006, 0.012, 0.05, black, -0.039, 0.022, 0.1, 0, 0, 0, weapon)

  const mag = new THREE.Group()
  box(0.058, 0.17, 0.082, black, 0, -0.125, 0.004, 0.12, 0, 0, mag)
  box(0.06, 0.06, 0.085, polymer, 0, -0.225, 0.024, 0.2, 0, 0, mag)
  mag.position.set(0, 0, 0)
  weapon.add(mag)
  box(0.066, 0.012, 0.09, steel, 0, -0.082, 0.004, 0, 0, 0, weapon)

  const grip = box(0.058, 0.155, 0.075, polymer, 0, -0.115, 0.135, -0.32, 0, 0, weapon)
  box(0.062, 0.02, 0.08, black, 0, -0.185, 0.158, -0.32, 0, 0, weapon)
  for (let i = 0; i < 3; i++) box(0.059, 0.006, 0.05, black, 0, -0.09 - i * 0.025, 0.125 + i * 0.008, -0.32, 0, 0, weapon)

  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.006, 5, 12, Math.PI), steel)
  guard.position.set(0, -0.058, 0.06)
  guard.rotation.set(Math.PI / 2, 0, Math.PI / 2)
  weapon.add(guard)
  box(0.006, 0.03, 0.012, steel, 0, -0.074, 0.042, 0, 0, 0, weapon)

  cyl(0.019, 0.16, black, 0, 0.03, 0.34, 'z', 12, weapon)
  box(0.064, 0.09, 0.17, polymer, 0, -0.002, 0.37, 0, 0, 0, weapon)
  box(0.07, 0.115, 0.04, black, 0, -0.018, 0.47, 0, 0, 0, weapon)
  box(0.05, 0.018, 0.012, steel, -0.02, 0.045, 0.44, 0, 0, 0, weapon)
  box(0.012, 0.055, 0.15, black, 0.038, 0.035, 0.05, 0, 0, 0, weapon)
  box(0.02, 0.02, 0.04, steel, 0.045, 0.055, 0.115, 0, 0, 0, weapon)

  const sling = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    V(-0.035, 0.01, -0.15), V(-0.1, -0.12, -0.05), V(-0.11, -0.2, 0.18), V(-0.03, -0.22, 0.33)
  ]), 16, 0.004, 4, false), new THREE.MeshStandardMaterial({ color: 0x5c5238, roughness: 1 }))
  weapon.add(sling)

  const rightHand = new THREE.Group()
  box(0.095, 0.11, 0.075, glove, 0, -0.15, 0.16, -0.32, 0, 0, rightHand)
  for (let i = 0; i < 4; i++) {
    box(0.022, 0.062, 0.022, gloveDark, 0.042, -0.155 + i * 0.001, 0.128 + i * 0.017, -0.32, 0, -0.1, rightHand)
  }
  box(0.03, 0.03, 0.075, gloveDark, -0.04, -0.115, 0.12, -0.5, 0.3, 0, rightHand)
  box(0.09, 0.07, 0.08, glove, 0, -0.11, 0.21, -0.4, 0, 0, rightHand)
  weapon.add(rightHand)
  const rightFore = new THREE.Group()
  box(0.062, 0.058, 0.22, sleeve, 0.085, -0.27, 0.39, 0.24, -0.24, -0.4, rightFore)
  box(0.064, 0.026, 0.05, gloveDark, 0.04, -0.19, 0.27, 0.1, -0.2, -0.28, rightFore)
  rightFore.visible = false
  weapon.add(rightFore)

  const leftHand = new THREE.Group()
  box(0.1, 0.065, 0.12, glove, -0.02, -0.055, -0.29, 0, 0, 0.08, leftHand)
  for (let i = 0; i < 4; i++) {
    box(0.026, 0.075, 0.026, gloveDark, 0.025 + i * 0.017, -0.038, -0.335 + i * 0.001, 0, 0, 0.08, leftHand)
  }
  box(0.035, 0.04, 0.09, gloveDark, -0.025, -0.02, -0.37, 0.2, 0.2, 0.1, leftHand)
  box(0.11, 0.055, 0.13, glove, -0.005, -0.08, -0.27, 0, 0, 0.08, leftHand)
  weapon.add(leftHand)
  const leftFore = new THREE.Group()
  box(0.082, 0.07, 0.28, sleeve, -0.11, -0.16, -0.07, -0.2, 0.42, 0.34, leftFore)
  box(0.078, 0.03, 0.055, gloveDark, -0.055, -0.105, -0.19, 0, 0.32, 0.2, leftFore)
  leftFore.visible = false
  weapon.add(leftFore)

  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTexture(), color: 0xffc177, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }))
  flash.position.set(0, 0.008, -0.8)
  flash.scale.set(0.2, 0.2, 1)
  weapon.add(flash)
  const flash2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTexture(), color: 0xff8a2a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }))
  flash2.position.set(0, 0.008, -0.82)
  flash2.scale.set(0.1, 0.42, 1)
  flash2.material.rotation = 0.4
  weapon.add(flash2)

  const light = new THREE.PointLight(0xffa050, 0, 8, 2)
  light.position.set(0.15, 0.05, -0.35)
  camera.add(light)
  const viewFill = new THREE.PointLight(0xffd9b8, 1.6, 2.6, 2)
  viewFill.position.set(0.25, 0.15, 0.15)
  camera.add(viewFill)
  const viewRim = new THREE.PointLight(0x9db9d6, 0.5, 2.2, 2)
  viewRim.position.set(0.5, 0.35, 0.5)
  camera.add(viewRim)

  const basePos = V(0.265, -0.325, -0.87)
  const adsPos = V(0, -0.142, -0.74)
  group.position.copy(basePos)
  group.rotation.set(0.012, -0.04, 0.012)

  let recoil = 0
  let recoilRot = 0
  let swayX = 0
  let swayY = 0
  let ads = 0
  let flashTimer = 0
  let reloading = 0
  let reloadDuration = 2.1
  let sprint = 0
  let muzzleTimer = 0

  function fire() {
    recoil = Math.min(1, recoil + 0.65)
    recoilRot = Math.min(1, recoilRot + 0.8)
    flashTimer = 0.055
    flash.material.opacity = 0.98
    flash2.material.opacity = 0.9
    flash.material.rotation = Math.random() * Math.PI * 2
    flash2.material.rotation = Math.random() * Math.PI * 2
    flash.scale.set(0.17 + Math.random() * 0.12, 0.17 + Math.random() * 0.12, 1)
    light.intensity = 22
    muzzleTimer = 0.05
  }

  function startReload(duration = 2.1) {
    if (reloading > 0) return
    reloading = duration
    reloadDuration = duration
  }

  function update(dt, time, state) {
    const targetAds = state.ads ? 1 : 0
    ads += (targetAds - ads) * Math.min(1, dt * 12)
    sprint += ((state.sprinting ? 1 : 0) - sprint) * Math.min(1, dt * 7)
    recoil += (0 - recoil) * Math.min(1, dt * 14)
    recoilRot += (0 - recoilRot) * Math.min(1, dt * 12)
    flashTimer = Math.max(0, flashTimer - dt)
    muzzleTimer = Math.max(0, muzzleTimer - dt)
    if (muzzleTimer <= 0) {
      flash.material.opacity = Math.max(0, flash.material.opacity - dt * 18)
      flash2.material.opacity = Math.max(0, flash2.material.opacity - dt * 18)
      light.intensity = Math.max(0, light.intensity - dt * 300)
    }

    if (reloading > 0) {
      reloading -= dt
      const p = 1 - reloading / reloadDuration
      const dip = Math.sin(Math.min(1, p) * Math.PI)
      group.position.y = basePos.y - dip * 0.13
      group.rotation.z = dip * 0.5
      group.rotation.x = dip * -0.28
      mag.position.y = -dip * 0.16
      mag.rotation.z = dip * 0.5
    } else {
      mag.position.y = 0
      mag.rotation.z = 0
    }

    swayX += ((state.lookX || 0) * -0.035 - swayX) * Math.min(1, dt * 8)
    swayY += ((state.lookY || 0) * 0.028 - swayY) * Math.min(1, dt * 8)
    const speed = state.moving ? (state.sprinting ? 1 : 0.55) : 0
    const bobX = Math.sin(time * (state.sprinting ? 9 : 6.2)) * 0.011 * speed
    const bobY = Math.cos(time * (state.sprinting ? 18 : 12.4)) * 0.009 * speed
    const breathe = Math.sin(time * 1.8) * 0.0025

    const px = basePos.x * (1 - ads) + adsPos.x * ads + swayX + bobX
    const py = basePos.y * (1 - ads) + adsPos.y * ads + swayY + bobY + breathe - sprint * 0.045 - recoil * 0.012
    const pz = basePos.z * (1 - ads) + adsPos.z * ads + recoil * 0.035
    if (reloading <= 0) {
      group.position.x += (px - group.position.x) * Math.min(1, dt * 14)
      group.position.y += (py - group.position.y) * Math.min(1, dt * 14)
      group.position.z += (pz - group.position.z) * Math.min(1, dt * 14)
      group.rotation.x += (0.015 + recoilRot * 0.1 + swayY * 0.7 + sprint * 0.16 - group.rotation.x) * Math.min(1, dt * 12)
      group.rotation.y += (-0.055 + swayX * 0.9 + sprint * 0.22 - group.rotation.y) * Math.min(1, dt * 12)
      group.rotation.z += (0.015 - swayX * 0.5 + sprint * 0.1 - group.rotation.z) * Math.min(1, dt * 12)
      group.position.x -= sprint * 0.03
      group.rotation.x += sprint * 0.12
    } else {
      group.position.x += (basePos.x - group.position.x) * Math.min(1, dt * 8)
      group.position.z += (basePos.z - group.position.z) * Math.min(1, dt * 8)
    }
  }

  function muzzleWorld() {
    const p = V(0, 0.008, -0.8)
    weapon.localToWorld(p)
    return p
  }

  function reloadProgress() {
    return reloading > 0 ? 1 - reloading / reloadDuration : 0
  }

  return { group, weapon, update, fire, startReload, muzzleWorld, reloadProgress, get reloading() { return reloading > 0 }, get ads() { return ads }, flashLight: light }
}
