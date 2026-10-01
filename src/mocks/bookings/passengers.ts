import type { Booking } from '@/lib/booking'
import { cover, passenger, pricing, segment } from './builders'

// Passengers widget: every combination of the indicators in one booking, all names invented.
//
//    type  ✓ Date of Birth │ ✗ Passport │ ✓ Frequent flyer   P1  date of birth, 2 cards
//    ADT   ✓ Passport                                        P2  passport only
//    ADT   ✓ Passport │ ✓ Frequent flyer                     P3  passport, 3 cards
//    CHD   ✓ Passport                                        P4  a child with a passport
//    INF   ✗ Date of Birth │ ✗ Passport                      P5  nothing entered: every field is a dash
//    ADT   ✓ Date of Birth │ ✗ Passport │ ✓ Frequent flyer   P6  long name, gender UNKNOWN, 5 cards that wrap
export const passengersData: Booking = {
  pnr: 'PAX7QD',
  gds: 'Amadeus',
  creationOffice: 'A2K9',
  createdAt: '2026-10-01T08:00:00Z',
  passengers: [
    {
      ...passenger('P1', 'ADT', 'KALLIO/ANNA MARIA MS'),
      dateOfBirth: '1985-04-12',
      gender: 'FEMALE',
      nationality: 'Finland',
      frequentFlyers: [
        { number: '4400123456', airline: 'AY' },
        { number: '9810004455', airline: 'SK' },
      ],
    },
    {
      ...passenger('P2', 'ADT', 'KALLIO/MATTI JUHA MR'),
      dateOfBirth: '1983-11-30',
      gender: 'MALE',
      nationality: 'Finland',
      document: { number: 'FIN7203391', countryOfIssue: 'FIN', expiresOn: '2031-06-18' },
    },
    {
      ...passenger('P3', 'ADT', 'NORDQVIST/ELSA MRS'),
      dateOfBirth: '1957-02-02',
      gender: 'FEMALE',
      nationality: 'Sweden',
      document: { number: 'SWE5518204', countryOfIssue: 'SWE', expiresOn: '2029-01-09' },
      frequentFlyers: [
        { number: '7720019981', airline: 'SK' },
        { number: '2250077413', airline: 'LH' },
        { number: '4400765432', airline: 'AY' },
      ],
    },
    {
      ...passenger('P4', 'CHD', 'KALLIO/OSKARI MSTR'),
      dateOfBirth: '2017-08-21',
      gender: 'MALE',
      nationality: 'Finland',
      document: { number: 'FIN7203392', countryOfIssue: 'FIN', expiresOn: '2030-08-20' },
    },
    passenger('P5', 'INF', 'KALLIO/AINO INF'),
    {
      ...passenger('P6', 'ADT', 'VAN DER HOEVEN-LINDQVIST/MARIA-ANTONIA CHRISTINA ELISABETH DR'),
      dateOfBirth: '1972-12-05',
      gender: 'UNKNOWN',
      nationality: 'Netherlands',
      frequentFlyers: [
        { number: '1000234567', airline: 'KL' },
        { number: '3300891122', airline: 'SK' },
        { number: '8800456789', airline: 'AY' },
        { number: '5100223344', airline: 'LH' },
        { number: '6200778899', airline: 'LX' },
      ],
    },
  ],
  segments: [
    segment('S1', 'HEL', 'CPH', '2026-12-04', 'SK 2850'),
    segment('S2', 'CPH', 'HEL', '2026-12-11', 'SK 2851'),
  ],
  pricings: [pricing('PR-1', 'Active', '2026-10-01T08:10:00Z', cover(['P1', 'P2', 'P3', 'P4', 'P5', 'P6'], ['S1', 'S2']))],
  tickets: [],
}
