// Semantic colours: Figma "shadcn kit - Trava" → Foundations → Color (Light / Dark) bound to
// our CSS variables in src/tokens/index.css. Figma names verbatim; `var` is the variable,
// `tailwind` the utility suffix (bg-…, text-…, border-…). Hex values are Figma's.
// `kept`: the code deliberately keeps another value, and why (docs/open-questions.md #22).

export interface SemanticColor {
  /** Name in Figma. */
  figma: string
  /** CSS variable without the `--`. */
  var: string
  /** Tailwind colour key: bg-<key>, text-<key>, border-<key>. */
  tailwind: string
  light: string
  dark: string
  kept?: { hex: string; reason: string }
}

export interface SemanticGroup {
  title: string
  colors: SemanticColor[]
}

const c = (
  figma: string, cssVar: string, tailwind: string, light: string, dark: string, kept?: SemanticColor['kept'],
): SemanticColor => ({ figma, var: cssVar, tailwind, light, dark, ...(kept ? { kept } : {}) })

const RING_KEPT = { hex: '#0d9488', reason: 'Kept teal: Figma zinc-400 is 2.56:1 on white, focus needs 3:1' }

export const SEMANTIC_GROUPS: SemanticGroup[] = [
  {
    title: 'Base',
    colors: [
      c('Background', 'background', 'background', '#ffffff', '#09090b'),
      c('Foreground', 'foreground', 'foreground', '#0c0a09', '#fafaf9'),
      c('Card', 'card', 'card', '#ffffff', '#0c0a09'),
      c('Card Foreground', 'card-foreground', 'card-foreground', '#0c0a09', '#fafaf9'),
      c('Popover', 'popover', 'popover', '#fafaf9', '#0c0a09'),
      c('Popover Foreground', 'popover-foreground', 'popover-foreground', '#0c0a09', '#fafaf9'),
    ],
  },
  {
    title: 'Action',
    colors: [
      c('Primary', 'primary', 'primary', '#0d9488', '#0d9488'),
      c('Primary Foreground', 'primary-foreground', 'primary-foreground', '#fafaf9', '#1c1917'),
      c('Secondary', 'secondary', 'secondary', '#f5f5f4', '#292524'),
      c('Secondary Foreground', 'secondary-foreground', 'secondary-foreground', '#1c1917', '#fafaf9'),
      c('Muted', 'muted', 'muted', '#f5f5f4', '#292524'),
      c('Muted Foreground', 'muted-foreground', 'muted-foreground', '#57534e', '#a8a29e'),
      c('Accent', 'accent', 'accent', '#f5f5f4', '#292524'),
      c('Accent Foreground', 'accent-foreground', 'accent-foreground', '#1c1917', '#fafaf9'),
      c('Destructive', 'destructive', 'destructive', '#dc2626', '#fef2f2'),
      c('Destructive Foreground', 'destructive-foreground', 'destructive-foreground', '#fef2f2', '#991b1b', {
        hex: '#fafafa',
        reason: 'Kept #fafafa: Figma red-50 is 4.41:1 on red-600, AA needs 4.5:1',
      }),
    ],
  },
  {
    title: 'Border and ring',
    colors: [
      c('Border', 'border', 'border', '#e7e5e4', '#27272a'),
      c('Border Muted', 'border-muted', 'border-muted', '#f5f5f4', '#27272a'),
      c('Border Primary', 'border-primary', '—', '#0d9488', '#fafafa'),
      c('Border Destructive', 'border-destructive', '—', '#dc2626', '#7f1d1d'),
      c('Input', 'input', 'input', '#e4e4e7', '#27272a'),
      c('Ring', 'ring', 'ring', '#a1a1aa', '#d4d4d8', RING_KEPT),
    ],
  },
  {
    title: 'Sidebar',
    colors: [
      c('Sidebar Background', 'sidebar-background', 'sidebar', '#ffffff', '#1c1917'),
      c('Sidebar Foreground', 'sidebar-foreground', 'sidebar-foreground', '#3f3f46', '#f4f4f5'),
      c('Sidebar Primary', 'sidebar-primary', 'sidebar-primary', '#18181b', '#1d4ed8'),
      c('Sidebar Primary Foreground', 'sidebar-primary-foreground', 'sidebar-primary-foreground', '#fafafa', '#ffffff'),
      c('Sidebar Accent', 'sidebar-accent', 'sidebar-accent', '#f4f4f5', '#27272a'),
      c('Sidebar Accent Foreground', 'sidebar-accent-foreground', 'sidebar-accent-foreground', '#18181b', '#f4f4f5'),
      c('Sidebar Border', 'sidebar-border', 'sidebar-border', '#e5e7eb', '#27272a'),
      c('Sidebar Ring', 'sidebar-ring', 'sidebar-ring', '#a1a1aa', '#d4d4d8', RING_KEPT),
    ],
  },
]

/** Figma colour tokens with an alpha channel. shadcn-kit only: no variable in our code. */
export const UNBOUND_FIGMA_COLORS: { figma: string; light: string; dark: string }[] = [
  { figma: 'Muted 50', light: '#f4f4f580', dark: '#27272a80' },
  { figma: 'Sidebar Foreground 70', light: '#3f3f46b2', dark: '#f4f4f5b2' },
  { figma: 'Border Muted 40', light: '#f4f4f566', dark: '#27272a66' },
  { figma: 'Border Destructive 50', light: '#dc262680', dark: '#7f1d1d80' },
  { figma: 'Border Primary 50', light: '#18181b80', dark: '#27272a80' },
]

/** Chart 1–5 in Figma. Light values are the ones in code. */
export const CHART_COLORS = {
  light: ['#e76e50', '#2a9d90', '#274754', '#e8c468', '#f4a462'],
  dark: ['#2662d9', '#2eb88a', '#e88c30', '#af57db', '#e23670'],
} as const
