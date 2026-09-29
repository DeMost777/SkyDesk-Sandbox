import type { Booking } from '@/lib/booking'
import { cover, passenger, pricing, segment, ticket } from './builders'

// Same timestamp: three documents created at the same second. The order must not change between
// renders: backend order — Pricing first, then Tickets, each as listed (open question in
// projects/booking-overview/overview-widget.md).
export const sameTimestamp: Booking = {
  pnr: 'TIE5AM',
  gds: 'Sabre',
  creationOffice: '5GW5',
  createdAt: '2026-09-10T10:00:00Z',
  passengers: [passenger('P1', 'ADT', 'NOVAK/PETR MR')],
  segments: [segment('S1', 'PRG', 'AMS', '2026-10-30', 'KL 1342')],
  pricings: [
    pricing('PR-1', 'Active', '2026-09-10T10:00:00Z', cover(['P1'], ['S1'])),
    pricing('PR-2', 'Inactive', '2026-09-10T10:00:00Z', cover(['P1'], ['S1'])),
  ],
  tickets: [ticket('TK-1', '074-2200000001', 'Active', '2026-09-10T10:00:00Z', cover(['P1'], ['S1']))],
}
