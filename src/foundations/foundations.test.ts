import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
// @ts-expect-error — plain .mjs script without type declarations
import { buildFoundations, OUT_DIR } from '../../scripts/foundations.mjs'

const root = path.resolve(__dirname, '../..')

async function sourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((e) => {
      const p = path.join(dir, e.name)
      return e.isDirectory() ? sourceFiles(p) : Promise.resolve([p])
    }),
  )
  return files.flat().filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))
}

describe('Storybook Foundations', () => {
  it('generated pages match the tokens — run `npm run foundations` after changing tokens', async () => {
    const pages: Record<string, string> = await buildFoundations()
    for (const [file, content] of Object.entries(pages)) {
      const onDisk = await readFile(path.join(OUT_DIR, file), 'utf8').catch(() => '')
      expect(onDisk, `src/foundations/generated/${file} is stale`).toBe(content)
    }
  })

  it('every layout size outside the spacing scale is listed in Foundations / Layout', async () => {
    const layout = await readFile(path.join(root, 'src/foundations/layout.mdx'), 'utf8')
    const missing: string[] = []
    for (const file of await sourceFiles(path.join(root, 'src'))) {
      const code = await readFile(file, 'utf8')
      for (const [cls] of code.matchAll(/-\[[\d.]+px\]/g)) {
        if (!layout.includes(cls.slice(1))) missing.push(`${path.relative(root, file)}: ${cls.slice(1)}`)
      }
    }
    expect(missing, 'add these sizes to src/foundations/layout.mdx').toEqual([])
  })
})
