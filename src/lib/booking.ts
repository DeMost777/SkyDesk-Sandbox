// Booking domain: what an agent opens in Skydesk by PNR. Pure module — no React.
// One Booking feeds every widget; each widget derives its own view from it.
// Flow doc: projects/booking-overview/README.md, projects/booking-overview/overview-widget.md
import type { GDS } from './office'

/** ADT adult, CHD child, INF infant. */
export type PassengerType = 'ADT' | 'CHD' | 'INF'

/** As the GDS and the Passengers widget say it; no colour (decision of 2026-10-01). */
export type Gender = 'MALE' | 'FEMALE' | 'UNKNOWN'

/** A passport or an ID card. */
export interface TravelDocument {
  /** The Passport indicator is ✓ when this is set (decision of 2026-10-01). */
  number?: string
  /** ISO 3166 alpha-3: 'POL'. */
  countryOfIssue?: string
  /** ISO date. */
  expiresOn?: string
}

/** A loyalty card of one airline. */
export interface FrequentFlyer {
  number: string
  /** Airline code as issued; mocks use IATA: 'SK'. */
  airline: string
}

export interface Passenger {
  /** Position in the PNR: 'P1', 'P2'… Unique within a Booking. */
  ref: string
  type: PassengerType
  /** As in the GDS: 'LINDQVIST/ANNA MRS' (surname, given names, title). */
  name: string
  /** ISO date. Everything below is optional: a missing value is a state of the data, not an error. */
  dateOfBirth?: string
  gender?: Gender
  /** Country name: 'Poland'. */
  nationality?: string
  document?: TravelDocument
  frequentFlyers?: FrequentFlyer[]
}

/** One flight leg A → B; a part of the Itinerary. */
export interface Segment {
  /** Position in the itinerary: 'S1', 'S2'… Unique within a Booking. */
  ref: string
  from: string
  to: string
  /** ISO date, fixed in mocks. */
  departureDate: string
  /** 'SK 400'. */
  flightNumber: string
}

/** Which passengers and segments an entity applies to. */
export interface Coverage {
  passengers: string[]
  segments: string[]
}

export type PricingStatus =
  | 'Active'
  | 'Ticketed'
  | 'Unknown'
  | 'Reprice required'
  | 'Itinerary changed'
  | 'Inactive'
  | 'Deleted'

export type TicketStatus = 'Active' | 'Voided'

/** A price quote. The agent turns it into a Ticket. */
export interface Pricing {
  id: string
  status: PricingStatus
  /** ISO date-time. */
  createdAt: string
  coverage: Coverage
}

/** An issued ticket: the passenger's ticket is bought. */
export interface Ticket {
  id: string
  /** '421-1324311324': 3-digit airline code and 10-digit serial. */
  number: string
  status: TicketStatus
  /** ISO date-time. */
  issuedAt: string
  coverage: Coverage
}

export interface Booking {
  pnr: string
  gds: GDS
  creationOffice: string
  /** ISO date-time. */
  createdAt: string
  /** In PNR order. */
  passengers: Passenger[]
  /** In itinerary order. */
  segments: Segment[]
  pricings: Pricing[]
  tickets: Ticket[]
}

/** A reference to one entity of a Booking — what a click on a card opens. */
export interface EntityRef {
  type: 'pricing' | 'ticket'
  id: string
}

/** Airports in travel order: the start of the first segment, then the end of every segment.
 *  When a segment does not start where the previous one ended (open jaw), its start is added too. */
export function bookingRoute(booking: Pick<Booking, 'segments'>): string[] {
  const route: string[] = []
  for (const segment of booking.segments) {
    if (route[route.length - 1] !== segment.from) route.push(segment.from)
    route.push(segment.to)
  }
  return route
}

/** `KBP–FRA`: segment route with an en dash (spec V1). */
export function segmentRoute(segment: Pick<Segment, 'from' | 'to'>): string {
  return `${segment.from}–${segment.to}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function dateParts(isoDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)
  return { year, month, day }
}

/** `2026-06-14` → `14 Jun`: the date as a segment cell shows it (Figma, decision of 2026-09-30). */
export function formatSegmentDay(isoDate: string): string {
  const { month, day } = dateParts(isoDate)
  return `${day} ${MONTHS[month - 1]}`
}

/** `2026-06-14` → `14 Jun 2026`: the full date, for a tooltip. Read from the ISO string itself, so the time zone cannot shift the day. */
export function formatSegmentDate(isoDate: string): string {
  const { year } = dateParts(isoDate)
  return `${formatSegmentDay(isoDate)} ${year}`
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const TICKET_NUMBER = /^\d{3}-\d{10}$/
const PNR = /^[A-Z0-9]{6}$/

/** Consistency problems of a Booking; an empty list means it is sound. Guards every mock scenario. */
export function validateBooking(booking: Booking): string[] {
  const problems: string[] = []
  if (!PNR.test(booking.pnr)) problems.push(`PNR ${booking.pnr} is not 6 letters/digits`)

  const duplicates = (values: string[]) => values.filter((v, i) => values.indexOf(v) !== i)
  for (const ref of duplicates(booking.passengers.map((p) => p.ref))) problems.push(`duplicate passenger ${ref}`)
  for (const ref of duplicates(booking.segments.map((s) => s.ref))) problems.push(`duplicate segment ${ref}`)
  for (const id of duplicates([...booking.pricings, ...booking.tickets].map((e) => e.id))) {
    problems.push(`duplicate entity id ${id}`)
  }
  for (const number of duplicates(booking.tickets.map((t) => t.number))) problems.push(`duplicate ticket number ${number}`)

  const passengerRefs = new Set(booking.passengers.map((p) => p.ref))
  const segmentRefs = new Set(booking.segments.map((s) => s.ref))
  const entities = [
    ...booking.pricings.map((e) => ({ label: `pricing ${e.id}`, coverage: e.coverage })),
    ...booking.tickets.map((e) => ({ label: `ticket ${e.id}`, coverage: e.coverage })),
  ]
  for (const { label, coverage } of entities) {
    if (coverage.passengers.length === 0 || coverage.segments.length === 0) problems.push(`${label} covers nothing`)
    for (const ref of coverage.passengers) if (!passengerRefs.has(ref)) problems.push(`${label}: unknown passenger ${ref}`)
    for (const ref of coverage.segments) if (!segmentRefs.has(ref)) problems.push(`${label}: unknown segment ${ref}`)
  }
  for (const ticket of booking.tickets) {
    if (!TICKET_NUMBER.test(ticket.number)) problems.push(`ticket ${ticket.id}: number ${ticket.number} is not 421-1234567890`)
  }
  for (const p of booking.passengers) {
    if (p.dateOfBirth && !ISO_DATE.test(p.dateOfBirth)) problems.push(`passenger ${p.ref}: date of birth ${p.dateOfBirth} is not YYYY-MM-DD`)
    const expires = p.document?.expiresOn
    if (expires && !ISO_DATE.test(expires)) problems.push(`passenger ${p.ref}: date of expiration ${expires} is not YYYY-MM-DD`)
    for (const flyer of p.frequentFlyers ?? []) {
      if (!flyer.number || !flyer.airline) problems.push(`passenger ${p.ref}: frequent flyer needs a number and an airline`)
    }
  }
  return problems
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** `08/10/2025` and `13:44` in the agent's local time, as the booking header shows "Created". */
export function formatCreated(isoDateTime: string): { date: string; time: string } {
  const at = new Date(isoDateTime)
  return {
    date: `${pad2(at.getDate())}/${pad2(at.getMonth() + 1)}/${at.getFullYear()}`,
    time: `${pad2(at.getHours())}:${pad2(at.getMinutes())}`,
  }
}

/** `3 passengers`, `1 passenger`. */
export function passengersLabel(count: number): string {
  return `${count} ${count === 1 ? 'passenger' : 'passengers'}`
}
