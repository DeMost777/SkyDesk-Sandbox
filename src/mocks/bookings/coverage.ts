import type { Booking } from '@/lib/booking'
import { cover, passenger, pricing, segment, ticket } from './builders'

// Coverage: one Ticket spans all three segments of a passenger, so it fills three cells; one Pricing
// covers two passengers at once. All three passenger types: adult, child, infant.
// Multi trip AMS → FRA → SIN → AMS.
export const coverage: Booking = {
  pnr: 'CVR4GE',
  gds: 'Galileo',
  creationOffice: 'C1Z2',
  createdAt: '2026-08-20T07:30:00Z',
  passengers: [
    passenger('P1', 'ADT', 'JANSEN/MARIJKE MRS'),
    passenger('P2', 'CHD', 'JANSEN/EMMA MISS'),
    passenger('P3', 'INF', 'JANSEN/NOAH INF'),
  ],
  segments: [
    segment('S1', 'AMS', 'FRA', '2026-11-20', 'LH 989'),
    segment('S2', 'FRA', 'SIN', '2026-11-20', 'LH 778'),
    segment('S3', 'SIN', 'AMS', '2026-12-05', 'KL 836'),
  ],
  pricings: [
    pricing('PR-1', 'Ticketed', '2026-08-20T07:45:00Z', cover(['P1', 'P2'], ['S1', 'S2', 'S3'])),
    pricing('PR-2', 'Ticketed', '2026-08-20T07:50:00Z', cover(['P3'], ['S1', 'S2', 'S3'])),
  ],
  tickets: [
    ticket('TK-1', '220-4412900001', 'Active', '2026-08-21T09:00:00Z', cover(['P1'], ['S1', 'S2', 'S3'])),
    ticket('TK-2', '220-4412900002', 'Active', '2026-08-21T09:01:00Z', cover(['P2'], ['S1', 'S2', 'S3'])),
    ticket('TK-3', '220-4412900003', 'Active', '2026-08-21T09:02:00Z', cover(['P3'], ['S1', 'S2', 'S3'])),
  ],
}
