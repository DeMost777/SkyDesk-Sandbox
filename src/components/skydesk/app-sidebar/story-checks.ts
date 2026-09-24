import { expect } from 'storybook/test'

// Shared checks for App Sidebar stories. Fill rule: projects/app-sidebar/README.md → Decided.

export type InteractionState = ':hover' | ':active' | ':focus-visible'

/** The `sidebar-accent` token as the browser computes it, so the check follows the token. */
function accentFill(): string {
  const probe = document.createElement('div')
  probe.className = 'bg-sidebar-accent'
  document.body.append(probe)
  const color = getComputedStyle(probe).backgroundColor
  probe.remove()
  return color
}

/** Active (a data attribute, not a pseudo-class): the computed fill is `sidebar-accent`. */
export async function expectAccentFill(button: HTMLElement) {
  const fill = accentFill()
  await expect(fill).not.toBe('rgba(0, 0, 0, 0)')
  await expect(getComputedStyle(button).backgroundColor).toBe(fill)
}

function styleRules(): CSSStyleRule[] {
  const walk = (rules: CSSRuleList): CSSStyleRule[] =>
    [...rules].flatMap((rule) => {
      if (rule instanceof CSSStyleRule) return [rule]
      if (rule instanceof CSSGroupingRule) return walk(rule.cssRules)
      return []
    })
  return [...document.styleSheets].flatMap((sheet) => {
    try {
      return walk(sheet.cssRules)
    } catch {
      return [] // cross-origin sheet
    }
  })
}

/**
 * Hover / Pressed / Focus: a stylesheet rule for that pseudo-class applies to the button and
 * sets the `sidebar-accent` fill. Checked through the rules, not the computed colour:
 * storybook-addon-pseudo-states forces states only in the Storybook UI, not under `npm test`.
 */
export async function expectAccentFillOn(button: HTMLElement, state: InteractionState) {
  const applies = styleRules().some((rule) => {
    if (!rule.selectorText.includes(state)) return false
    if (!rule.style.backgroundColor.includes('--sidebar-accent')) return false
    const base = rule.selectorText.split(state).join('')
    try {
      return button.matches(base)
    } catch {
      return false
    }
  })
  await expect(applies, `${state} rule with sidebar-accent fill`).toBe(true)
}
