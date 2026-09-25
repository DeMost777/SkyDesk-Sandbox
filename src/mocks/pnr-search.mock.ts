import type { GDS } from '@/lib/office'
import { GdsError, type BookingSummary, type PnrDirectory } from '@/lib/pnr-search'

// Deterministic fixtures: fixed PNRs, dates and offices. Office codes match offices.mock.ts.

/** Bookings as they exist in each GDS. */
export const MOCK_BOOKINGS: BookingSummary[] = [
  {
    // From Figma (Booking Header 308:12504, History 548:16649). Passenger names — first three
    // of the Passengers widget in Figma 4678:125394; Creation office and departure — sandbox.
    pnr: 'BBV14Q',
    gds: 'Sabre',
    creationOffice: 'D4M5',
    passengers: ['NGUYEN/DANIEL MR', 'NGUYEN/THI THUY VAN MR', 'NGUYEN/THI THUY NGA MR'],
    route: 'CDG → LON → JFK',
    departureDate: '2026-10-20',
  },
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
  'BBV14Q': 'Sabre', // in History, so Skydesk has opened it before
  '7JRWT4': 'Amadeus',
  'K2M9QP': 'Sabre',
  'ERR000': 'Amadeus',
}

/** PNRs whose GDS lookup always fails with a technical error — a repeated search fails again. */
const FAILING_PNRS = new Set(['ERR000'])

/** Offices the agent can pick, but without rights to open bookings. X4PD is a Sabre Office. */
const NO_ACCESS_OFFICES = new Set(['X4PD'])

export const mockPnrDirectory: PnrDirectory = {
  knownGds: (pnr) => KNOWN_GDS[pnr],
  lookup: (pnr, gds, via) => {
    if (FAILING_PNRS.has(pnr)) throw new GdsError('unavailable')
    const booking = MOCK_BOOKINGS.find((b) => b.pnr === pnr && b.gds === gds) ?? null
    if (booking && via && NO_ACCESS_OFFICES.has(via)) throw new GdsError('access-denied')
    return booking
  },
}

/** One PNR per scenario in projects/pnr-search/README.md. */
export const SCENARIO_PNRS = {
  known: '7JRWT4',       // A / D: Skydesk knows the GDS (Amadeus)
  unknown: 'ABC123',     // B: new to Skydesk → GDS Required → exists in Galileo
  notFound: 'XYZ789',    // not in any GDS
  error: 'ERR000',       // GDS lookup fails
  noAccess: 'K2M9QP',    // exists in Sabre; with Office X4PD → access denied
} as const

/** Sabre Office without access to bookings (see NO_ACCESS_OFFICES). */
export const NO_ACCESS_OFFICE = 'X4PD'
