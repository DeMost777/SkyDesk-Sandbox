import type { Booking } from '@/lib/booking'
import type { GDS } from '@/lib/office'
import { allPricingStatuses } from './all-pricing-statuses'
import { coverage } from './coverage'
import { deletedPricing } from './deleted-pricing'
import { pricingOnly } from './pricing-only'
import { reference } from './reference'
import { repriced } from './repriced'
import { sameTimestamp } from './same-timestamp'
import { ticketed } from './ticketed'
import { wide } from './wide'

// Booking scenarios. One PNR, one Booking: PNR Search, the header and every widget read the same data.
// The table of scenarios and what each one checks: projects/booking-overview/overview-widget.md.
// A new widget adds the case it needs here; existing scenarios keep working (booking.test.ts).

export interface BookingScenario {
  /** What the scenario is for, one line. */
  purpose: string
  booking: Booking
}

export const BOOKING_SCENARIOS: BookingScenario[] = [
  { purpose: 'Reference: spec §17 cell, Deleted, No document, ADT ADT CHD', booking: reference },
  { purpose: 'Ticketed: Ticketed Pricing next to an Active Ticket', booking: ticketed },
  { purpose: 'Pricing only: Active Pricing, no badge, no tickets', booking: pricingOnly },
  { purpose: 'Repricing: Inactive then Active; GDS unknown to Skydesk', booking: repriced },
  { purpose: 'Every Pricing status, one per cell', booking: allPricingStatuses },
  { purpose: 'Coverage: one Ticket in several cells; ADT CHD INF', booking: coverage },
  { purpose: 'Deleted Pricing: hidden, No document', booking: deletedPricing },
  { purpose: 'Same timestamp: stable order', booking: sameTimestamp },
  { purpose: 'Wide: 5 passengers × 4 segments, horizontal scroll', booking: wide },
]

export const MOCK_BOOKING_DETAILS: Booking[] = BOOKING_SCENARIOS.map((s) => s.booking)

/** The Booking for a PNR in a GDS, or undefined when it does not exist there. */
export function findBooking(pnr: string, gds?: GDS): Booking | undefined {
  return MOCK_BOOKING_DETAILS.find((b) => b.pnr === pnr && (gds === undefined || b.gds === gds))
}
