// Browser pass over every flow state: `npm run qa` (all flows) or `npm run qa -- booking`.
// Starts the Vite dev server itself (or uses QA_BASE_URL), runs the checks in scripts/qa/flows/
// in headless Chromium, and writes qa-report/report.md with screenshots and console errors.
// Exit code 1 if any check fails. Used by the qa-tester subagent (.claude/agents/qa-tester.md).
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const outDir = path.join(root, 'qa-report')

const available = (await readdir(path.join(here, 'flows'))).map((f) => f.replace(/\.mjs$/, '')).sort()
const requested = process.argv.slice(2)
const unknown = requested.filter((f) => !available.includes(f))
if (unknown.length) {
  console.error(`Unknown flow: ${unknown.join(', ')}. Available: ${available.join(', ')}`)
  process.exit(2)
}
const flows = requested.length ? requested : available

let server = null
let base = process.env.QA_BASE_URL?.replace(/\/$/, '')
if (!base) {
  const { createServer } = await import('vite')
  server = await createServer({ root, logLevel: 'error', server: { port: 5199, strictPort: false } })
  await server.listen()
  base = server.resolvedUrls.local[0].replace(/\/$/, '')
}

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const results = [] // { flow, id, ok, info }
const consoleErrors = [] // { flow, where, text }
const shots = []

for (const flow of flows) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1115 } })
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push({ flow, where: page.url(), text: m.text() }))
  page.on('pageerror', (e) => consoleErrors.push({ flow, where: page.url(), text: e.message }))

  const qa = {
    page,
    base,
    /** Opens an address relative to the app root ('' or '?page=…') and lets the page settle. */
    go: async (query, settleMs = 600) => {
      await page.goto(`${base}/${query}`)
      await page.waitForTimeout(settleMs)
    },
    /** Current address without the origin: '/?pnr=…'. */
    path: () => page.url().slice(base.length),
    /** Visible text of the first match, whitespace collapsed. */
    text: async (selector) => (await page.locator(selector).first().innerText()).replace(/\s+/g, ' ').trim(),
    check: (id, ok, info = '') => results.push({ flow, id, ok: Boolean(ok), info: ok ? '' : String(info) }),
    shot: async (name) => {
      const file = `${flow}-${name}.png`
      await page.screenshot({ path: path.join(outDir, file) })
      shots.push(file)
    },
  }

  try {
    const { default: run } = await import(path.join(here, 'flows', `${flow}.mjs`))
    await run(qa)
  } catch (e) {
    // A crashed flow is a failed check, not a crashed run: the rest of the flows still report.
    results.push({ flow, id: 'flow crashed', ok: false, info: e.message.split('\n')[0] })
  }
  await page.close()
}

await browser.close()
await server?.close()

const failed = results.filter((r) => !r.ok)
const lines = [
  `# QA report`,
  ``,
  `${new Date().toISOString()} · ${base} · flows: ${flows.join(', ')}`,
  ``,
  `**${results.length - failed.length} / ${results.length} passed**, console errors: ${consoleErrors.length}`,
  ``,
]
for (const flow of flows) {
  lines.push(`## ${flow}`, '', '| Check | Result |', '|---|---|')
  for (const r of results.filter((x) => x.flow === flow)) {
    lines.push(`| ${r.id} | ${r.ok ? '✅' : `❌ ${r.info.replace(/\|/g, '\\|')}`} |`)
  }
  const errs = consoleErrors.filter((c) => c.flow === flow)
  lines.push('', errs.length ? errs.map((c) => `- console: ${c.text} (${c.where})`).join('\n') : 'Console: no errors', '')
}
lines.push('## Screenshots', '', ...shots.map((s) => `- ${s}`), '')
await writeFile(path.join(outDir, 'report.md'), lines.join('\n'))

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} [${r.flow}] ${r.id}${r.ok ? '' : `  — ${r.info}`}`)
console.log(`\n${results.length - failed.length}/${results.length} passed, console errors: ${consoleErrors.length}`)
console.log(`Report: qa-report/report.md`)
process.exit(failed.length || consoleErrors.length ? 1 : 0)
