import type { BookingHistory, HistoryEntry } from '@/lib/booking-history'

// Entries from Figma 548:16649. The first one is always "today" relative to `now`;
// the rest keep the fixed Figma dates (March 2026), so the list reads as in the design.

const at = (y: number, m: number, d: number, hh: number, mm: number) => new Date(y, m - 1, d, hh, mm)

export function createHistoryEntries(now: Date = new Date()): HistoryEntry[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 12)
  return [
    { pnr: 'BBV14Q', gds: 'Sabre', route: ['CDG', 'LON', 'JFK'], lastInteractionAt: today },
    { pnr: 'K7Q2LM', gds: 'Galileo', route: ['YYZ', 'LON', 'YYZ'], lastInteractionAt: at(2026, 3, 12, 12, 45) },
    { pnr: 'P9D3XA', gds: 'Amadeus', route: ['LAX', 'SEA'], lastInteractionAt: at(2026, 3, 12, 12, 4) },
    { pnr: 'H2N8ZT', gds: 'Galileo', route: ['CDG', 'LON', 'CDG'], lastInteractionAt: at(2026, 3, 12, 12, 2) },
    { pnr: 'M5R0QK', gds: 'Sabre', route: ['FRA', 'BCN', 'LIS'], lastInteractionAt: at(2026, 3, 12, 11, 32) },
    { pnr: 'D8C1WF', gds: 'Amadeus', route: ['JFK', 'MAD'], lastInteractionAt: at(2026, 3, 12, 11, 24) },
    { pnr: 'Q1V6SN', gds: 'Sabre', route: ['CDG', 'LON', 'JFK'], lastInteractionAt: at(2026, 3, 11, 15, 12) },
    { pnr: 'T4A9JG', gds: 'Sabre', route: ['CDG', 'LON', 'JFK'], lastInteractionAt: at(2026, 3, 11, 12, 45) },
    { pnr: 'R6K3EP', gds: 'Galileo', route: ['YUL', 'BOS'], lastInteractionAt: at(2026, 3, 11, 12, 43) },
    { pnr: 'N3X7LU', gds: 'Sabre', route: ['CDG', 'LON', 'CDG'], lastInteractionAt: at(2026, 3, 11, 11, 8) },
    { pnr: 'S1J8MP', gds: 'Amadeus', route: ['MIA', 'ORD', 'YYZ'], lastInteractionAt: at(2026, 3, 10, 11, 2) },
  ]
}

export const mockBookingHistory: BookingHistory = {
  recent: () => createHistoryEntries(),
}
