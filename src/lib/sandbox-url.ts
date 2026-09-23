// SANDBOX-ONLY: every screen state has a URL. Delete with the rest of the SANDBOX-ONLY scaffolding.
//
//   ?page=pnr-search&persona=agent-no-defaults&pnr=7JRWT4&office=A2K9&tried=Amadeus,Sabre&gds=Galileo&state=result
//
// Table of addresses: APPLICATION.md → "Адреса состояний".

import { GDS_LIST, type GDS } from './office'

export type SandboxPage = 'pnr-search' | 'office-selector'
/** idle = form only; loading = spinner; result = run the search on load and show its outcome. */
export type SearchView = 'idle' | 'loading' | 'result'

export interface SandboxParams {
  page: SandboxPage
  persona: string | null
  pnr: string
  office: string | null // Office code
  gds: GDS | null       // GDS picked in the "GDS Required" step
  tried: GDS[]          // GDS already searched before `gds` without finding the PNR
  state: SearchView
}

const PAGES: SandboxPage[] = ['pnr-search', 'office-selector']
const VIEWS: SearchView[] = ['idle', 'loading', 'result']

export const DEFAULT_PARAMS: SandboxParams = {
  page: 'pnr-search',
  persona: null,
  pnr: '',
  office: null,
  gds: null,
  tried: [],
  state: 'idle',
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : null
}

export function parseSandboxUrl(search: string): SandboxParams {
  const q = new URLSearchParams(search)
  return {
    page: oneOf(q.get('page'), PAGES) ?? DEFAULT_PARAMS.page,
    persona: q.get('persona') || null,
    pnr: (q.get('pnr') ?? '').trim().toUpperCase(),
    office: q.get('office')?.trim().toUpperCase() || null,
    gds: oneOf(q.get('gds'), GDS_LIST),
    tried: (q.get('tried') ?? '')
      .split(',')
      .map((g) => oneOf(g.trim(), GDS_LIST))
      .filter((g): g is GDS => g !== null),
    state: oneOf(q.get('state'), VIEWS) ?? DEFAULT_PARAMS.state,
  }
}

/** Builds a query string ("" or "?…"), leaving out values equal to the defaults. */
export function buildSandboxUrl(params: Partial<SandboxParams>): string {
  const full = { ...DEFAULT_PARAMS, ...params }
  const q = new URLSearchParams()
  if (full.page !== DEFAULT_PARAMS.page) q.set('page', full.page)
  if (full.persona) q.set('persona', full.persona)
  if (full.pnr) q.set('pnr', full.pnr)
  if (full.office) q.set('office', full.office)
  if (full.tried.length) q.set('tried', full.tried.join(','))
  if (full.gds) q.set('gds', full.gds)
  if (full.state !== DEFAULT_PARAMS.state) q.set('state', full.state)
  const s = q.toString().replace(/%2C/g, ',') // keep "tried=Amadeus,Sabre" readable
  return s ? `?${s}` : ''
}
