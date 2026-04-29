#!/usr/bin/env node
// Generates a multi-resolution Windows icon (build/icon.ico) from build/icons/*.png.
// Run via `npm run gen:icons` whenever the source logo changes.
import pngToIco from 'png-to-ico'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(import.meta.dirname, '..')
const sizes = [16, 24, 32, 48, 64, 128, 256]
const inputs = sizes.map((s) => readFileSync(resolve(root, `build/icons/${s}x${s}.png`)))

const buf = await pngToIco(inputs)
const out = resolve(root, 'build/icon.ico')
writeFileSync(out, buf)
console.log(`wrote ${out} (${buf.length} bytes, ${sizes.length} layers)`)
