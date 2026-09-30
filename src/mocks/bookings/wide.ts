import type { Booking, Passenger } from '@/lib/booking'
import { cover, passenger, pricing, segment, ticket } from './builders'

// Wide: 5 passengers × 4 segments. Five 172px columns plus the 140px segment column do not fit in
// 800px, so the table scrolls horizontally. Multi trip YYZ → LHR → FRA → LHR → YYZ.
const passengers: Passenger[] = [
  passenger('P1', 'ADT', 'TREMBLAY/MARC MR'),
  passenger('P2', 'ADT', 'TREMBLAY/JULIE MRS'),
  passenger('P3', 'ADT', 'ROY/PAUL MR'),
  passenger('P4', 'CHD', 'TREMBLAY/LEO MSTR'),
  passenger('P5', 'INF', 'TREMBLAY/ZOE INF'),
]
const allSegments = ['S1', 'S2', 'S3', 'S4']

export const wide: Booking = {
  pnr: 'WIDE55',
  gds: 'Sabre',
  creationOffice: 'D4M5',
  createdAt: '2026-07-01T12:00:00Z',
  passengers,
  segments: [
    segment('S1', 'YYZ', 'LHR', '2026-12-18', 'AC 856'),
    segment('S2', 'LHR', 'FRA', '2026-12-22', 'LH 903'),
    segment('S3', 'FRA', 'LHR', '2026-12-29', 'LH 902'),
    segment('S4', 'LHR', 'YYZ', '2027-01-03', 'AC 849'),
  ],
  // Everyone has a Ticketed Pricing and an Active Ticket; P3's first ticket was voided and reissued.
  pricings: passengers.map((p, i) =>
    pricing(`PR-${i + 1}`, 'Ticketed', `2026-07-01T12:${10 + i}:00Z`, cover([p.ref], allSegments)),
  ),
  tickets: passengers.flatMap((p, i) => {
    const serial = 5500000000 + i * 10
    const issued = (minute: number) => `2026-07-02T09:${minute}:00Z`
    const own = cover([p.ref], allSegments)
    return p.ref === 'P3'
      ? [
          ticket(`TK-${i + 1}a`, `016-${serial}`, 'Voided', issued(10 + i), own),
          ticket(`TK-${i + 1}b`, `016-${serial + 1}`, 'Active', issued(30 + i), own),
        ]
      : [ticket(`TK-${i + 1}`, `016-${serial}`, 'Active', issued(10 + i), own)]
  }),
}
