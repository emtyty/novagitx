#!/usr/bin/env node
// Re-center & retighten build/logo-source.png, then regenerate every icon variant.
//
// Why: the source logo had visible canvas padding around the rounded square,
// which made the X glyph look thin at small icon sizes. We detect the actual
// content bounds, crop to them, and re-place on a 1024×1024 transparent canvas
// with Apple-style padding (~10% margin).

import { Jimp } from 'jimp'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs'
import { resolve } from 'path'
import pngToIco from 'png-to-ico'

const root = resolve(import.meta.dirname, '..')
const buildDir = resolve(root, 'build')
const src = resolve(buildDir, 'logo-source.png')

const CANVAS = 1024
const MARGIN_PCT = 0.06 // 6% margin → content occupies ~88% of canvas (punchier at small sizes)
const BG_TOLERANCE = 12 // how close to the corner background a pixel needs to be to count as "empty"
// Alpha keying: pixels with chromatic distance from bg ≤ KEY_INNER are fully transparent;
// ≥ KEY_OUTER are fully opaque; values in between fade linearly. Higher KEY_OUTER = softer halo.
const KEY_INNER = 6
const KEY_OUTER = 28

const img = await Jimp.read(src)
const w = img.bitmap.width
const h = img.bitmap.height
const data = img.bitmap.data // RGBA buffer
const px = (x, y) => {
  const i = (y * w + x) * 4
  return [data[i], data[i + 1], data[i + 2]]
}

// Sample the four corners to identify the background colour.
const corners = [px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1)]
const bg = [0, 1, 2].map((i) => Math.round(corners.reduce((s, c) => s + c[i], 0) / 4))
const isBg = (r, g, b) =>
  Math.abs(r - bg[0]) <= BG_TOLERANCE &&
  Math.abs(g - bg[1]) <= BG_TOLERANCE &&
  Math.abs(b - bg[2]) <= BG_TOLERANCE

// Tight bbox of the actual card (ignoring the source's drop-shadow halo, which we don't want).
let minX = w, minY = h, maxX = 0, maxY = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const [r, g, b] = px(x, y)
    if (!isBg(r, g, b)) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
}

// Apply alpha key on the full buffer: bg-coloured pixels and the rounded-corner anti-aliasing
// inside the bbox fade to transparent so the icon sits on a clean transparent canvas.
const colorDist = (r, g, b) => {
  const dr = r - bg[0], dg = g - bg[1], db = b - bg[2]
  return Math.sqrt(dr * dr + dg * dg + db * db)
}
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    const d = colorDist(data[i], data[i + 1], data[i + 2])
    if (d <= KEY_INNER) data[i + 3] = 0
    else if (d < KEY_OUTER) data[i + 3] = Math.round(((d - KEY_INNER) / (KEY_OUTER - KEY_INNER)) * 255)
  }
}
const cropW = maxX - minX + 1
const cropH = maxY - minY + 1
console.log(`detected content bbox: ${cropW}×${cropH} at (${minX}, ${minY}); bg=rgb(${bg.join(',')})`)

// Crop to bounding box.
const cropped = img.clone().crop({ x: minX, y: minY, w: cropW, h: cropH })

// Compute target content size on the 1024 canvas, preserving aspect ratio.
const usable = CANVAS * (1 - MARGIN_PCT * 2)
const scale = Math.min(usable / cropW, usable / cropH)
const newW = Math.round(cropW * scale)
const newH = Math.round(cropH * scale)
cropped.resize({ w: newW, h: newH })

// Place on a transparent 1024×1024 canvas, perfectly centered.
const canvas = new Jimp({ width: CANVAS, height: CANVAS, color: 0x00000000 })
canvas.composite(cropped, Math.round((CANVAS - newW) / 2), Math.round((CANVAS - newH) / 2))
const masterPath = resolve(buildDir, 'icon.png')
await canvas.write(masterPath)
console.log(`wrote ${masterPath} (${CANVAS}×${CANVAS}, content ${newW}×${newH})`)

// Renderer + dev-mode resources.
await canvas.write(resolve(root, 'src/renderer/public/logo.png'))
const small = canvas.clone().resize({ w: 256, h: 256 })
await small.write(resolve(root, 'resources/icon.png'))

// Linux PNG sizes.
const linuxDir = resolve(buildDir, 'icons')
mkdirSync(linuxDir, { recursive: true })
for (const size of [16, 24, 32, 48, 64, 128, 256, 512, 1024]) {
  const variant = canvas.clone().resize({ w: size, h: size })
  await variant.write(resolve(linuxDir, `${size}x${size}.png`))
}
console.log('wrote build/icons/*.png')

// macOS .iconset → .icns via Apple's iconutil (only available on macOS).
const iconset = resolve(buildDir, 'icon.iconset')
rmSync(iconset, { recursive: true, force: true })
mkdirSync(iconset)
const macSpecs = [
  [16, '16x16'], [32, '16x16@2x'], [32, '32x32'], [64, '32x32@2x'],
  [128, '128x128'], [256, '128x128@2x'], [256, '256x256'], [512, '256x256@2x'],
  [512, '512x512'], [1024, '512x512@2x'],
]
for (const [size, name] of macSpecs) {
  const variant = canvas.clone().resize({ w: size, h: size })
  await variant.write(resolve(iconset, `icon_${name}.png`))
}
if (process.platform === 'darwin') {
  execSync(`iconutil -c icns "${iconset}" -o "${resolve(buildDir, 'icon.icns')}"`)
  console.log('wrote build/icon.icns')
}

// Windows multi-resolution .ico.
const icoBuf = await pngToIco(
  [16, 24, 32, 48, 64, 128, 256].map((s) => readFileSync(resolve(linuxDir, `${s}x${s}.png`)))
)
writeFileSync(resolve(buildDir, 'icon.ico'), icoBuf)
console.log(`wrote build/icon.ico (${icoBuf.length} bytes)`)
