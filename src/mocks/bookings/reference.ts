import type { Booking } from '@/lib/booking'
import { cover, passenger, pricing, segment, ticket } from './builders'

// Reference scenario of the spec (§17) and the booking behind the Booking Overview Figma
// (BBV14Q · Sabre · 3 passengers · Created 08/10/2025 13:44).
//
//        S1 CDG–LHR                                   S2 LHR–JFK
// P1 ADT Inactive → Ticketed → Voided → Active ticket  Ticketed → Voided → Active ticket
// P2 ADT Pricing → Ticket                              Pricing
// P3 CHD No document (its only Pricing is Deleted)     No document
export const reference: Booking = {
  pnr: 'BBV14Q',
  gds: 'Sabre',
  creationOffice: '7MTR',
  createdAt: '2025-10-08T13:44:00Z',
  passengers: [
    passenger('P1', 'ADT', 'MILLER/JOHN LEE MR'),
    passenger('P2', 'ADT', 'MILLER/CAMILA BROWN MRS'),
    passenger('P3', 'CHD', 'MILLER/AMANDA MISS'),
  ],
  segments: [
    segment('S1', 'CDG', 'LHR', '2026-06-14', 'AF 1180'),
    segment('S2', 'LHR', 'JFK', '2026-06-14', 'BA 175'),
  ],
  pricings: [
    pricing('PR-1', 'Inactive', '2025-10-08T13:50:00Z', cover(['P1'], ['S1'])),
    pricing('PR-2', 'Ticketed', '2025-10-09T09:10:00Z', cover(['P1'], ['S1', 'S2'])),
    pricing('PR-3', 'Active', '2025-10-08T13:52:00Z', cover(['P2'], ['S1', 'S2'])),
    pricing('PR-4', 'Deleted', '2025-10-08T13:55:00Z', cover(['P3'], ['S1'])),
  ],
  tickets: [
    ticket('TK-1', '421-1324311324', 'Voided', '2025-10-09T10:00:00Z', cover(['P1'], ['S1', 'S2'])),
    ticket('TK-2', '421-1324311325', 'Active', '2025-10-10T11:30:00Z', cover(['P1'], ['S1', 'S2'])),
    ticket('TK-3', '421-1324311326', 'Active', '2025-10-09T12:00:00Z', cover(['P2'], ['S1'])),
  ],
}
