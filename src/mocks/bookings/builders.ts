import type { Coverage, Passenger, PassengerType, Pricing, PricingStatus, Segment, Ticket, TicketStatus } from '@/lib/booking'

// Short constructors for scenario files: a scenario reads as a table of facts, not as object noise.

export const passenger = (ref: string, type: PassengerType, name: string): Passenger => ({ ref, type, name })

export const segment = (ref: string, from: string, to: string, departureDate: string, flightNumber: string): Segment => ({
  ref,
  from,
  to,
  departureDate,
  flightNumber,
})

/** `cover(['P1', 'P2'], ['S1'])`: passengers × segments the entity applies to. */
export const cover = (passengers: string[], segments: string[]): Coverage => ({ passengers, segments })

export const pricing = (id: string, status: PricingStatus, createdAt: string, coverage: Coverage): Pricing => ({
  id,
  status,
  createdAt,
  coverage,
})

export const ticket = (id: string, number: string, status: TicketStatus, issuedAt: string, coverage: Coverage): Ticket => ({
  id,
  number,
  status,
  issuedAt,
  coverage,
})
