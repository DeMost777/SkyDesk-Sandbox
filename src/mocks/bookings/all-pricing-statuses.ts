import type { Booking } from '@/lib/booking'
import { cover, passenger, pricing, segment } from './builders'

// Every Pricing status a cell can show, one per cell (Deleted is hidden — see deleted-pricing.ts).
//        S1                  S2
// P1     Active (no badge)   Ticketed
// P2     Unknown             Reprice required
// P3     Itinerary changed   Inactive
export const allPricingStatuses: Booking = {
  pnr: 'PRC5TS',
  gds: 'Amadeus',
  creationOffice: 'A2K9',
  createdAt: '2026-09-10T08:00:00Z',
  passengers: [
    passenger('P1', 'ADT', 'BERGMANN/HANNA MRS'),
    passenger('P2', 'ADT', 'BERGMANN/LUKAS MR'),
    passenger('P3', 'ADT', 'BERGMANN/SOFIA MS'),
  ],
  segments: [
    segment('S1', 'FRA', 'MAD', '2026-12-03', 'LH 1114'),
    segment('S2', 'MAD', 'LIS', '2026-12-08', 'TP 1017'),
  ],
  pricings: [
    pricing('PR-1', 'Active', '2026-09-10T08:10:00Z', cover(['P1'], ['S1'])),
    pricing('PR-2', 'Ticketed', '2026-09-10T08:11:00Z', cover(['P1'], ['S2'])),
    pricing('PR-3', 'Unknown', '2026-09-10T08:12:00Z', cover(['P2'], ['S1'])),
    pricing('PR-4', 'Reprice required', '2026-09-10T08:13:00Z', cover(['P2'], ['S2'])),
    pricing('PR-5', 'Itinerary changed', '2026-09-10T08:14:00Z', cover(['P3'], ['S1'])),
    pricing('PR-6', 'Inactive', '2026-09-10T08:15:00Z', cover(['P3'], ['S2'])),
  ],
  tickets: [],
}
