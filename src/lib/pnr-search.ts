// PNR search domain: how Skydesk turns a PNR (+ optional context) into a result.
// Pure module — no React. Flow doc: projects/pnr-search/README.md

import { GDS_LIST, resolveOffice, type DefaultOffices, type GDS, type OfficeSelection, type ResolvedOffice } from './office'

export interface BookingSummary {
  pnr: string
  gds: GDS
  creationOffice: string
  passengers: string[]
  route: string
  departureDate: string // ISO date, fixed in mocks
}

/** Where the search reads from. Mocks implement it now; the real API later. */
export interface PnrDirectory {
  /** GDS of a PNR Skydesk has already processed, if any. */
  knownGds(pnr: string): GDS | undefined
  /**
   * Looks the PNR up in one GDS, working from Office `via` when one is known.
   * Returns null if absent; throws GdsError when the GDS fails or the Office has no access.
   */
  lookup(pnr: string, gds: GDS, via: string | null): BookingSummary | null
}

export type GdsErrorReason = 'unavailable' | 'access-denied'

export class GdsError extends Error {
  constructor(readonly reason: GdsErrorReason) {
    super(reason)
  }
}

export interface SearchInput {
  pnr: string
  /** Office the agent selected explicitly, if any. */
  selected?: OfficeSelection | null
  /** GDS the agent picked in the "GDS Required" step, if any. */
  gds?: GDS | null
  /** GDS already searched in this attempt without finding the PNR. */
  tried?: GDS[]
  defaults: DefaultOffices
}

/** Where the searched GDS came from. Decides what Not Found offers next. */
export type GdsSource = 'office' | 'picked' | 'known'

export type SearchOutcome =
  | { status: 'found'; booking: BookingSummary; resolved: ResolvedOffice }
  | { status: 'pnr-required' }
  | { status: 'gds-required'; pnr: string }
  | {
      status: 'not-found'
      pnr: string
      gds: GDS
      gdsSource: GdsSource
      office: OfficeSelection | null
      /** GDS searched so far, this one included. Empty when an Office set the GDS. */
      tried: GDS[]
    }
  | {
      status: 'error'
      pnr: string
      gds: GDS
      reason: GdsErrorReason
      /** The Office without access, for 'access-denied'. */
      office: OfficeSelection | null
    }

export function normalizePnr(raw: string): string {
  return raw.trim().toUpperCase()
}

/**
 * GDS is taken from, in order: the selected Office, the GDS the agent picked,
 * the GDS Skydesk already knows for this PNR. Only when all three are missing
 * does the agent get asked ("gds-required").
 */
export function searchPnr(input: SearchInput, directory: PnrDirectory): SearchOutcome {
  const pnr = normalizePnr(input.pnr)
  if (!pnr) return { status: 'pnr-required' }

  const selected = input.selected ?? null
  const gdsSource: GdsSource | null = selected ? 'office' : input.gds ? 'picked' : null
  const gds = selected?.gds ?? input.gds ?? directory.knownGds(pnr)

  if (!gds) return { status: 'gds-required', pnr }

  // The Office the search works from, when it is known before the lookup.
  // (Creation office comes from the booking itself, so it never lacks access.)
  const via = selected?.code ?? input.defaults[gds] ?? null

  let booking: BookingSummary | null
  try {
    booking = directory.lookup(pnr, gds, via)
  } catch (e) {
    const reason = e instanceof GdsError ? e.reason : 'unavailable'
    const office = reason === 'access-denied' && via ? { code: via, gds } : null
    return { status: 'error', pnr, gds, reason, office }
  }

  if (!booking) {
    const source = gdsSource ?? 'known'
    // An Office fixes the GDS, so there is nothing else to try without changing the Office.
    const tried = source === 'office' ? [] : addTried(input.tried ?? [], gds)
    return { status: 'not-found', pnr, gds, gdsSource: source, office: selected, tried }
  }

  const resolved = resolveOffice({
    gds,
    selected,
    defaults: input.defaults,
    creationOffice: booking.creationOffice,
  })
  return { status: 'found', booking, resolved }
}

function addTried(tried: GDS[], gds: GDS): GDS[] {
  return tried.includes(gds) ? tried : [...tried, gds]
}

/** True when the PNR was searched in every GDS — nothing is left to offer. */
export function allGdsTried(tried: GDS[]): boolean {
  return GDS_LIST.every((g) => tried.includes(g))
}
