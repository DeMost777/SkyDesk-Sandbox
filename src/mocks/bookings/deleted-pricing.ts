import type { Booking } from '@/lib/booking'
import { cover, passenger, pricing, segment } from './builders'

// Deleted Pricing is never shown. P1's only Pricing is Deleted, so its cells read "No document";
// P2 has an Active Pricing next to a Deleted one — only the Active one is visible (counter: 1).
// Round MAD ⇆ LIS.
export const deletedPricing: Booking = {
  pnr: 'DEL3T3',
  gds: 'Amadeus',
  creationOffice: 'E6T8',
  createdAt: '2026-09-15T13:00:00Z',
  passengers: [passenger('P1', 'ADT', 'SOUSA/RUI MR'), passenger('P2', 'ADT', 'SOUSA/INES MRS')],
  segments: [
    segment('S1', 'MAD', 'LIS', '2026-11-12', 'IB 3120'),
    segment('S2', 'LIS', 'MAD', '2026-11-15', 'IB 3127'),
  ],
  pricings: [
    pricing('PR-1', 'Deleted', '2026-09-15T13:10:00Z', cover(['P1'], ['S1', 'S2'])),
    pricing('PR-2', 'Deleted', '2026-09-15T13:11:00Z', cover(['P2'], ['S1', 'S2'])),
    pricing('PR-3', 'Active', '2026-09-15T13:20:00Z', cover(['P2'], ['S1', 'S2'])),
  ],
  tickets: [],
}
