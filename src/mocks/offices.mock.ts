export type GDSName = 'Amadeus' | 'Sabre' | 'Galileo'

export interface Office {
  code: string
  gds: GDSName
  isDefault?: boolean
}

export interface OfficeSelection {
  code: string
  gds: GDSName
}

export const MOCK_OFFICES: Office[] = [
  { code: '5GW5', gds: 'Sabre',   isDefault: true  },
  { code: 'A2K9', gds: 'Amadeus', isDefault: true  },
  { code: '7MTR', gds: 'Sabre'                     },
  { code: 'Q8L3', gds: 'Galileo', isDefault: true  },
  { code: 'X4PD', gds: 'Sabre'                     },
  { code: 'B3R7', gds: 'Amadeus'                   },
  { code: 'C1Z2', gds: 'Galileo'                   },
  { code: 'D4M5', gds: 'Sabre'                     },
  { code: 'E6T8', gds: 'Amadeus'                   },
  { code: 'F9K1', gds: 'Galileo'                   },
]
