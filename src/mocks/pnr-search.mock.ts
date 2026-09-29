import type { GDS } from '@/lib/office'
import { GdsError, summarizeBooking, type BookingSummary, type PnrDirectory } from '@/lib/pnr-search'
import { MOCK_BOOKING_DETAILS } from './bookings'

// Deterministic fixtures: fixed PNRs, dates and offices. Office codes match offices.mock.ts.
// The bookings themselves live in bookings/ — one PNR, one Booking for every screen.

/** Bookings as they exist in each GDS: the short form of every Booking scenario (src/mocks/bookings/). */
export const MOCK_BOOKINGS: BookingSummary[] = MOCK_BOOKING_DETAILS.map(summarizeBooking)

/**
 * PNRs Skydesk has processed before, so it already knows their GDS: every scenario Booking except
 * ABC123, which is new to Skydesk and goes through GDS Required.
 */
const KNOWN_GDS: Record<string, GDS> = {
  ...Object.fromEntries(MOCK_BOOKING_DETAILS.filter((b) => b.pnr !== 'ABC123').map((b) => [b.pnr, b.gds])),
  ERR000: 'Amadeus',
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
