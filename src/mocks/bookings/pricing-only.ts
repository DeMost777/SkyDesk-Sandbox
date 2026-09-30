import type { Booking } from '@/lib/booking'
import { cover, passenger, pricing, segment } from './builders'

// Pricing only: one passenger, one way, no tickets. Active Pricing has no badge.
export const pricingOnly: Booking = {
  pnr: 'K2M9QP',
  gds: 'Sabre',
  creationOffice: '7MTR',
  createdAt: '2026-10-01T11:40:00Z',
  passengers: [passenger('P1', 'ADT', 'CHEN/WEI MR')],
  segments: [segment('S1', 'YYZ', 'YVR', '2026-11-02', 'AC 101')],
  pricings: [pricing('PR-1', 'Active', '2026-10-01T12:00:00Z', cover(['P1'], ['S1']))],
  tickets: [],
}
