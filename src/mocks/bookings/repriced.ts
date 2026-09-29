import type { Booking } from '@/lib/booking'
import { cover, passenger, pricing, segment } from './builders'

// Repricing: the first Pricing became Inactive, a newer one is Active. History stays visible.
// Galileo, and new to Skydesk — the scenario that goes through GDS Required.
export const repriced: Booking = {
  pnr: 'ABC123',
  gds: 'Galileo',
  creationOffice: 'C1Z2',
  createdAt: '2026-10-05T09:50:00Z',
  passengers: [passenger('P1', 'ADT', 'OKAFOR/NGOZI MS')],
  segments: [segment('S1', 'LHR', 'LOS', '2026-10-28', 'BA 75')],
  pricings: [
    pricing('PR-1', 'Inactive', '2026-10-05T10:00:00Z', cover(['P1'], ['S1'])),
    pricing('PR-2', 'Active', '2026-10-06T14:20:00Z', cover(['P1'], ['S1'])),
  ],
  tickets: [],
}
