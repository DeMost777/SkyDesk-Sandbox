// Fails when UI code styles with raw values instead of design tokens (CLAUDE.md → rule 2).
//   npm run lint:tokens
// Allowed on purpose: layout sizes from Figma (w-[220px], pt-[140px], …) and Tailwind
// selector syntax (data-[state=open]:, [&_svg]:). Everything visual goes through tokens.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SRC = join(ROOT, 'src')

const RULES = [
  { name: 'arbitrary colour', re: /-\[(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()/ },
  { name: 'arbitrary radius', re: /\brounded(-[trblxyse]{1,2})?-\[/ },
  { name: 'arbitrary font size / tracking / leading', re: /\b(text|tracking|leading)-\[\d/ },
  { name: 'arbitrary shadow', re: /\b(shadow|drop-shadow)-\[/ },
  {
    name: 'palette colour instead of a semantic token',
    re: /\b(bg|text|border|ring|from|via|to|fill|stroke|outline|divide)-(white|black|(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/,
  },
  { name: "class list joined with join(' ') — use cn()", re: /\]\.join\(' '\)/ },
]

// Known exceptions: file → substring → reason. Keep this list short.
const ALLOW = {
  'src/components/ui/dialog.tsx': { 'bg-black/80': 'shadcn primitive overlay, kept as generated' },
}

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) yield* files(path)
    else if (/\.(tsx|ts)$/.test(name) && !name.endsWith('.d.ts')) yield path
  }
}

const problems = []
for (const path of files(SRC)) {
  const rel = relative(ROOT, path)
  readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return
    for (const rule of RULES) {
      const m = line.match(rule.re)
      if (!m) continue
      const allowed = Object.keys(ALLOW[rel] ?? {}).some((s) => line.includes(s))
      if (!allowed) problems.push(`${rel}:${i + 1}  ${rule.name}: ${line.trim().slice(0, 120)}`)
    }
  })
}

if (problems.length) {
  console.error(`✗ ${problems.length} hardcoded style value(s) — use tokens from src/tokens/index.css:\n`)
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log('✓ no hardcoded colours, radii, font sizes or shadows')
