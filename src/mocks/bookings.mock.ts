import type { Booking, BookingDirectory } from '@/lib/booking'
import { MOCK_BOOKINGS } from './pnr-search.mock'

// One booking per PNR the search finds. PNR, GDS, Creation office and passengers come from
// MOCK_BOOKINGS, so the search result and the opened booking never disagree.
// Table: projects/booking-overview/README.md → «Mock-бронирования».

const at = (y: number, m: number, d: number, hh: number, mm: number) => new Date(y, m - 1, d, hh, mm)

/** Creation date and time. BBV14Q — from Figma 308:12504; the others are chosen in the sandbox. */
const CREATED_AT: Record<string, Date> = {
  BBV14Q: at(2025, 10, 8, 13, 44),
  '7JRWT4': at(2026, 9, 2, 9, 15),
  K2M9QP: at(2026, 9, 14, 16, 30),
  ABC123: at(2026, 8, 27, 11, 5),
}

const BOOKINGS: Booking[] = MOCK_BOOKINGS.map((b) => ({
  pnr: b.pnr,
  gds: b.gds,
  creationOffice: b.creationOffice,
  passengers: b.passengers,
  createdAt: CREATED_AT[b.pnr],
}))

export const mockBookingDirectory: BookingDirectory = {
  get: (pnr, gds) => BOOKINGS.find((b) => b.pnr === pnr && b.gds === gds) ?? null,
}
