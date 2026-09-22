export type GDS = 'amadeus' | 'sabre' | 'galileo'

export interface GDSOption {
  id: GDS
  label: string
  description: string
}

export interface BookingPreview {
  pnr: string
  gds: GDS
  passengers: string[]
  route: string
  date: string
}

export type SearchScenario =
  | 'default'      // No input — empty state
  | 'ready'        // Input filled, ready to search
  | 'loading'      // Search in progress
  | 'select-gds'   // PNR found in multiple GDS, user must choose
  | 'not-found'    // PNR not found in any GDS
  | 'error'        // Network or system error

export const GDS_OPTIONS: GDSOption[] = [
  {
    id: 'amadeus',
    label: 'Amadeus',
    description: 'STO123 · Stockholm',
  },
  {
    id: 'sabre',
    label: 'Sabre',
    description: 'YYZ01 · Toronto',
  },
  {
    id: 'galileo',
    label: 'Galileo',
    description: 'LHR99 · London',
  },
]

export const MOCK_BOOKING: BookingPreview = {
  pnr: 'ABC123',
  gds: 'amadeus',
  passengers: ['SMITH/JOHN MR', 'SMITH/JANE MRS'],
  route: 'STO → LHR → JFK',
  date: '2026-10-15',
}

export const SCENARIO_PNR_MAP: Record<string, SearchScenario> = {
  'ABC123': 'select-gds',   // multi-GDS PNR
  'XYZ789': 'not-found',    // not found
  'ERR000': 'error',        // triggers error
}
