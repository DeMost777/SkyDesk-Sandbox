// Booking domain: what the agent sees after a PNR is found.
// Pure module — no React. Flow doc: projects/booking-overview/README.md
//
// The model grows with the widgets: iteration 1 holds only what the Booking Header shows.
import type { GDS, ResolvedOffice } from './office'
import { searchPnr, type PnrDirectory, type SearchInput, type SearchOutcome } from './pnr-search'

export interface Booking {
  pnr: string
  gds: GDS
  /** Office where the PNR was created. */
  creationOffice: string
  /** Passenger names as the GDS stores them: 'LINDQVIST/ANNA MRS'. */
  passengers: string[]
  /** When the PNR was created. Shown as stored, without time-zone conversion (open question #27). */
  createdAt: Date
}

/** Where bookings are read from. Mocks implement it now; the real API later. */
export interface BookingDirectory {
  /** The booking of a PNR in one GDS, or null if the GDS has no such PNR. */
  get(pnr: string, gds: GDS): Booking | null
}

/** Header label: '1 passenger', '3 passengers'. */
export function passengerCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'passenger' : 'passengers'}`
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Creation date DD/MM/YYYY and time HH:mm, as in the Header (open question #23). */
export function formatCreated(at: Date): { date: string; time: string } {
  return {
    date: `${pad(at.getDate())}/${pad(at.getMonth() + 1)}/${at.getFullYear()}`,
    time: `${pad(at.getHours())}:${pad(at.getMinutes())}`,
  }
}

export type OpenBookingOutcome =
  | { status: 'opened'; booking: Booking; resolved: ResolvedOffice }
  /** The search did not end in a booking: show its outcome in PNR Search instead. */
  | { status: 'not-opened'; search: SearchOutcome }

/**
 * Opens a booking by the same rules as PNR Search: `searchPnr` picks the GDS and the Office,
 * then the booking is read from `bookings`. Anything but a found PNR stays a search outcome —
 * the Booking page has no "not found" of its own (projects/booking-overview/README.md).
 */
export function openBooking(
  input: SearchInput,
  pnrs: PnrDirectory,
  bookings: BookingDirectory,
): OpenBookingOutcome {
  const search = searchPnr(input, pnrs)
  if (search.status !== 'found') return { status: 'not-opened', search }
  const booking = bookings.get(search.booking.pnr, search.booking.gds)
  if (!booking) return { status: 'not-opened', search }
  return { status: 'opened', booking, resolved: search.resolved }
}
