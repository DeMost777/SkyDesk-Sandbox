import { describe, expect, it } from 'vitest'
import { resolveOffice, withDefaultFlags, type DefaultOffices } from './office'

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
