import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { PALETTE, PALETTE_STEPS } from './palette'
import { SEMANTIC_GROUPS } from './semantic-colors'

// Vitest replaces imported CSS with an empty string, so the token files are read from disk.
const read = (file: string) => readFileSync(new URL(file, import.meta.url), 'utf8')
const indexCss = read('./index.css')
const paletteCss = read('./palette.css')

// Resolves `--var: h s% l%` and `--var: var(--other)` chains, then converts to hex.
const lightCss = indexCss.split('.dark {')[0]

function declarations(css: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const m of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) map.set(m[1], m[2].trim())
  return map
}

const palette = declarations(paletteCss)
const light = declarations(lightCss)

function resolve(name: string, vars: Map<string, string>): string {
  let value = vars.get(name) ?? palette.get(name)
  if (value === undefined) throw new Error(`--${name} is not defined`)
  const alias = value.match(/^var\(--([a-z0-9-]+)\)$/)
  return alias ? resolve(alias[1], vars) : value
}

function hslToHex(triplet: string): string {
  const [h, s, l] = triplet.match(/[\d.]+/g)!.map(Number)
  const sat = s / 100, lig = l / 100
  const a = sat * Math.min(lig, 1 - lig)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return lig - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
  }
  return '#' + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
}

const hex = (name: string, vars: Map<string, string>) => hslToHex(resolve(name, vars))

describe('palette', () => {
  it('has 22 scales of 11 steps', () => {
    expect(Object.keys(PALETTE)).toHaveLength(22)
    for (const scale of Object.values(PALETTE)) expect(Object.keys(scale)).toHaveLength(PALETTE_STEPS.length)
  })

  it('palette.css variables reproduce palette.ts hex exactly', () => {
    for (const [scale, steps] of Object.entries(PALETTE)) {
      for (const [step, expected] of Object.entries(steps)) {
        expect(hex(`palette-${scale}-${step}`, palette), `${scale}-${step}`).toBe(expected)
      }
    }
  })
})

describe('semantic colours match Figma', () => {
  // Light theme only; dark values stay in CSS but are not tested (decision 2026-09-29).
  for (const color of SEMANTIC_GROUPS.flatMap((g) => g.colors)) {
    const actual = hex(color.var, light)
    if (color.pending) {
      it(`${color.figma} still differs from Figma — remove "pending" once it is fixed`, () => {
        expect(actual).not.toBe(color.light)
      })
    } else {
      it(color.figma, () => {
        expect(actual).toBe(color.light)
      })
    }
  }
})
