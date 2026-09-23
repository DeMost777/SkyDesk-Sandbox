import type { GDS } from '@/lib/office'
import type { BookingSummary, PnrDirectory } from '@/lib/pnr-search'

// Deterministic fixtures: fixed PNRs, dates and offices. Office codes match offices.mock.ts.

/** Bookings as they exist in each GDS. */
export const MOCK_BOOKINGS: BookingSummary[] = [
  {
    pnr: '7JRWT4',
    gds: 'Amadeus',
    creationOffice: 'B3R7',
    passengers: ['LINDQVIST/ANNA MRS', 'LINDQVIST/ERIK MR'],
    route: 'ARN → LHR → JFK',
    departureDate: '2026-10-15',
  },
  {
    pnr: 'K2M9QP',
    gds: 'Sabre',
    creationOffice: '7MTR',
    passengers: ['CHEN/WEI MR'],
    route: 'YYZ → YVR',
    departureDate: '2026-11-02',
  },
  {
    pnr: 'ABC123',
    gds: 'Galileo',
    creationOffice: 'C1Z2',
    passengers: ['OKAFOR/NGOZI MS'],
    route: 'LHR → LOS',
    departureDate: '2026-10-28',
  },
]

/** PNRs Skydesk has processed before, so it already knows their GDS. ABC123 is new to Skydesk. */
const KNOWN_GDS: Record<string, GDS> = {
  '7JRWT4': 'Amadeus',
  'K2M9QP': 'Sabre',
  'ERR000': 'Amadeus',
}

/** PNRs whose GDS lookup fails with a technical error. */
const FAILING_PNRS = new Set(['ERR000'])

export const mockPnrDirectory: PnrDirectory = {
  knownGds: (pnr) => KNOWN_GDS[pnr],
  lookup: (pnr, gds) => {
    if (FAILING_PNRS.has(pnr)) throw new Error(`${gds} is unavailable`)
    return MOCK_BOOKINGS.find((b) => b.pnr === pnr && b.gds === gds) ?? null
  },
}

/** One PNR per scenario in projects/pnr-search/README.md. */
export const SCENARIO_PNRS = {
  known: '7JRWT4',       // A / D: Skydesk knows the GDS (Amadeus)
  unknown: 'ABC123',     // B: new to Skydesk → GDS Required → exists in Galileo
  notFound: 'XYZ789',    // not in any GDS
  error: 'ERR000',       // GDS lookup fails
} as const
