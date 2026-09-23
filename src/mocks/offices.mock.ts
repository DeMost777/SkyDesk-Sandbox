import type { Office } from '@/lib/office'

export type { Office, OfficeSelection } from '@/lib/office'

/** Offices the agent can work from. `isDefault` is derived from the persona — see personas.mock.ts. */
export const MOCK_OFFICES: Office[] = [
  { code: '5GW5', gds: 'Sabre' },
  { code: 'A2K9', gds: 'Amadeus' },
  { code: '7MTR', gds: 'Sabre' },
  { code: 'Q8L3', gds: 'Galileo' },
  { code: 'X4PD', gds: 'Sabre' },
  { code: 'B3R7', gds: 'Amadeus' },
  { code: 'C1Z2', gds: 'Galileo' },
  { code: 'D4M5', gds: 'Sabre' },
  { code: 'E6T8', gds: 'Amadeus' },
  { code: 'F9K1', gds: 'Galileo' },
]

