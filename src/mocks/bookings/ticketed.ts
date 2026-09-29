import type { Booking } from '@/lib/booking'
import { cover, passenger, pricing, segment, ticket } from './builders'

// Ticketed: every passenger has a Ticketed Pricing and an Active Ticket on the whole itinerary.
// Multi trip ARN → LHR → JFK. The passengers, route, Office and date are those PNR Search always had.
export const ticketed: Booking = {
  pnr: '7JRWT4',
  gds: 'Amadeus',
  creationOffice: 'B3R7',
  createdAt: '2026-09-01T09:00:00Z',
  passengers: [passenger('P1', 'ADT', 'LINDQVIST/ANNA MRS'), passenger('P2', 'ADT', 'LINDQVIST/ERIK MR')],
  segments: [
    segment('S1', 'ARN', 'LHR', '2026-10-15', 'SK 501'),
    segment('S2', 'LHR', 'JFK', '2026-10-15', 'BA 117'),
  ],
  pricings: [
    pricing('PR-1', 'Ticketed', '2026-09-01T09:30:00Z', cover(['P1'], ['S1', 'S2'])),
    pricing('PR-2', 'Ticketed', '2026-09-01T09:31:00Z', cover(['P2'], ['S1', 'S2'])),
  ],
  tickets: [
    ticket('TK-1', '421-1324400001', 'Active', '2026-09-02T10:00:00Z', cover(['P1'], ['S1', 'S2'])),
    ticket('TK-2', '421-1324400002', 'Active', '2026-09-02T10:01:00Z', cover(['P2'], ['S1', 'S2'])),
  ],
}
