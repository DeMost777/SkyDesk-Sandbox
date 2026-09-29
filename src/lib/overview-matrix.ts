// Overview widget: the Passenger × Segment matrix derived from a Booking. Pure module — no React.
// Rules: projects/booking-overview/overview-widget.md (spec V1 in sources/).
import type { Booking, EntityRef, Passenger, PricingStatus, Segment, TicketStatus } from './booking'

/** A Pricing or Ticket as a cell shows it. `Deleted` Pricing never gets here. */
export type OverviewDocument =
  | { type: 'pricing'; id: string; status: Exclude<PricingStatus, 'Deleted'>; at: string }
  | { type: 'ticket'; id: string; number: string; status: TicketStatus; at: string }

export interface MatrixCell {
  passenger: Passenger
  segment: Segment
  /** Oldest first. Empty means "No document". */
  documents: OverviewDocument[]
}

export interface MatrixRow {
  segment: Segment
  /** One cell per passenger, in PNR order. */
  cells: MatrixCell[]
}

export interface OverviewMatrix {
  passengers: Passenger[]
  rows: MatrixRow[]
  /** Unique visible Pricing and Tickets. An entity that fills several cells counts once. */
  documentCount: number
}

/**
 * Backend order is Pricing first, then Tickets, each as listed. The sort is stable, so entities with
 * the same timestamp keep that order and the UI does not reshuffle between renders.
 */
function visibleDocuments(booking: Booking): OverviewDocument[] {
  const pricings = booking.pricings
    .filter((p) => p.status !== 'Deleted')
    .map((p): OverviewDocument & { coverage: Booking['pricings'][number]['coverage'] } => ({
      type: 'pricing',
      id: p.id,
      status: p.status as Exclude<PricingStatus, 'Deleted'>,
      at: p.createdAt,
      coverage: p.coverage,
    }))
  const tickets = booking.tickets.map((t): OverviewDocument & { coverage: Booking['tickets'][number]['coverage'] } => ({
    type: 'ticket',
    id: t.id,
    number: t.number,
    status: t.status,
    at: t.issuedAt,
    coverage: t.coverage,
  }))
  return [...pricings, ...tickets]
}

type WithCoverage = OverviewDocument & { coverage: { passengers: string[]; segments: string[] } }

export function buildOverviewMatrix(booking: Booking): OverviewMatrix {
  const documents = visibleDocuments(booking) as WithCoverage[]
  const strip = ({ coverage: _coverage, ...document }: WithCoverage): OverviewDocument => document as OverviewDocument

  const rows = booking.segments.map((segment) => ({
    segment,
    cells: booking.passengers.map((passenger) => ({
      passenger,
      segment,
      documents: documents
        .filter((d) => d.coverage.passengers.includes(passenger.ref) && d.coverage.segments.includes(segment.ref))
        .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
        .map(strip),
    })),
  }))

  return { passengers: booking.passengers, rows, documentCount: documents.length }
}

/** Active is the default state and has no badge; every other status does. */
export function statusBadge(document: OverviewDocument): string | null {
  return document.status === 'Active' ? null : document.status
}

/** What a click on the card opens. */
export function documentRef(document: OverviewDocument): EntityRef {
  return { type: document.type, id: document.id }
}
