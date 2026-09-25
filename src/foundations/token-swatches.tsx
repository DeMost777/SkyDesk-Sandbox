import * as React from 'react'

// Colour swatches for Foundations / Colors, read from the live :root custom properties — so the
// MDX text (what the Storybook MCP gives the agent) stays a single line and the table beside it
// holds the values.

const HSL = /^\s*\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%\s*$/

function rootColourTokens(): string[] {
  const names = new Set<string>()
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue // cross-origin sheet
    }
    const walk = (list: CSSRuleList) => {
      for (const rule of Array.from(list)) {
        if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
          for (const prop of Array.from(rule.style)) {
            if (prop.startsWith('--') && HSL.test(rule.style.getPropertyValue(prop))) names.add(prop)
          }
        } else if (rule instanceof CSSGroupingRule) walk(rule.cssRules)
      }
    }
    walk(rules)
  }
  return [...names]
}

export function TokenSwatches() {
  const [tokens, setTokens] = React.useState<string[]>([])
  React.useEffect(() => setTokens(rootColourTokens()), [])
  return (
    <div className="not-prose grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
      {tokens.map((name) => (
        <figure key={name} className="m-0 flex flex-col gap-1">
          <div className="h-12 rounded-md border border-border" style={{ background: `hsl(var(${name}))` }} />
          <figcaption className="font-mono text-xs text-muted-foreground">{name}</figcaption>
        </figure>
      ))}
    </div>
  )
}
