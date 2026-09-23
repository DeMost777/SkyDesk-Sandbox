// Office domain: GDS + Office ID and the rule that picks which Office opens a PNR.
// Pure module — no React. See CLAUDE.md → "Приоритет выбора Office".

export type GDS = 'Amadeus' | 'Sabre' | 'Galileo'

export const GDS_LIST: GDS[] = ['Amadeus', 'Galileo', 'Sabre']

export interface Office {
  code: string
  gds: GDS
  isDefault?: boolean
}

export interface OfficeSelection {
  code: string
  gds: GDS
}

/** The agent's Default Office per GDS. Optional for every GDS. */
export type DefaultOffices = Partial<Record<GDS, string>>

export type OfficeSource = 'selected' | 'default' | 'creation'

export interface ResolvedOffice {
  office: OfficeSelection
  source: OfficeSource
}

/**
 * Picks the Office that opens a PNR stored in `gds`:
 *   1. the Office the agent selected explicitly (only if it belongs to this GDS)
 *   2. the agent's Default Office for this GDS
 *   3. the PNR's Creation PCC
 */
export function resolveOffice(input: {
  gds: GDS
  selected?: OfficeSelection | null
  defaults: DefaultOffices
  creationOffice: string
}): ResolvedOffice {
  const { gds, selected, defaults, creationOffice } = input

  if (selected && selected.gds === gds) {
    return { office: selected, source: 'selected' }
  }

  const defaultCode = defaults[gds]
  if (defaultCode) {
    return { office: { code: defaultCode, gds }, source: 'default' }
  }

  return { office: { code: creationOffice, gds }, source: 'creation' }
}

/** Marks each Office that is the agent's Default Office for its GDS. */
export function withDefaultFlags(offices: Office[], defaults: DefaultOffices): Office[] {
  return offices.map((o) => ({ ...o, isDefault: defaults[o.gds] === o.code }))
}
