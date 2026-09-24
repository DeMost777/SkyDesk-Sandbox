import { describe, expect, it } from 'vitest'
import { resolveOffice, sortOfficesForPicker, withDefaultFlags, type DefaultOffices } from './office'
import { MOCK_OFFICES } from '@/mocks/offices.mock'

const defaults: DefaultOffices = { Amadeus: 'A2K9', Sabre: '5GW5' }

describe('resolveOffice — priority: selected → default → creation', () => {
  it('1. uses the Office the agent selected', () => {
    const r = resolveOffice({
      gds: 'Amadeus',
      selected: { code: 'E6T8', gds: 'Amadeus' },
      defaults,
      creationOffice: 'B3R7',
    })
    expect(r).toEqual({ office: { code: 'E6T8', gds: 'Amadeus' }, source: 'selected' })
  })

  it('2. falls back to the Default Office for the PNR’s GDS', () => {
    const r = resolveOffice({ gds: 'Amadeus', selected: null, defaults, creationOffice: 'B3R7' })
    expect(r).toEqual({ office: { code: 'A2K9', gds: 'Amadeus' }, source: 'default' })
  })

  it('3. falls back to the Creation PCC when there is no default for that GDS', () => {
    const r = resolveOffice({ gds: 'Galileo', selected: null, defaults, creationOffice: 'C1Z2' })
    expect(r).toEqual({ office: { code: 'C1Z2', gds: 'Galileo' }, source: 'creation' })
  })

  it('ignores a selected Office from another GDS', () => {
    const r = resolveOffice({
      gds: 'Amadeus',
      selected: { code: '5GW5', gds: 'Sabre' },
      defaults,
      creationOffice: 'B3R7',
    })
    expect(r.source).toBe('default')
  })
})

describe('withDefaultFlags', () => {
  it('flags exactly the Default Office of each GDS', () => {
    const flagged = withDefaultFlags(
      [
        { code: 'A2K9', gds: 'Amadeus' },
        { code: 'B3R7', gds: 'Amadeus' },
        { code: 'C1Z2', gds: 'Galileo' },
      ],
      defaults,
    )
    expect(flagged.map((o) => o.isDefault)).toEqual([true, false, false])
  })
})

describe('sortOfficesForPicker — Default Offices first, then the rest, each A→Z by code', () => {
  it('puts every Default Office on top', () => {
    const list = sortOfficesForPicker(withDefaultFlags(MOCK_OFFICES, { Amadeus: 'A2K9', Sabre: '5GW5', Galileo: 'Q8L3' }))
    expect(list.map((o) => o.code)).toEqual([
      '5GW5', 'A2K9', 'Q8L3',
      '7MTR', 'B3R7', 'C1Z2', 'D4M5', 'E6T8', 'F9K1', 'X4PD',
    ])
  })

  it('without defaults, the whole list is alphabetical', () => {
    const list = sortOfficesForPicker(withDefaultFlags(MOCK_OFFICES, {}))
    expect(list.map((o) => o.code)).toEqual([...MOCK_OFFICES.map((o) => o.code)].sort())
  })
})
