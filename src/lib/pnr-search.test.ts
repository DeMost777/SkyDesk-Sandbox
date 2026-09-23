import { describe, expect, it } from 'vitest'
import { allGdsTried, searchPnr, type PnrDirectory, type SearchInput } from './pnr-search'
import { mockPnrDirectory, SCENARIO_PNRS } from '@/mocks/pnr-search.mock'
import { PERSONAS } from '@/mocks/personas.mock'

const withDefaults = PERSONAS[0].defaults // Amadeus A2K9, Sabre 5GW5, Galileo Q8L3
const noDefaults = PERSONAS[1].defaults

const run = (input: Partial<SearchInput> & { pnr: string }) =>
  searchPnr({ defaults: withDefaults, ...input }, mockPnrDirectory)

describe('searchPnr — scenarios from projects/pnr-search/README.md', () => {
  it('A: known PNR opens in the Default Office without asking for GDS', () => {
    const r = run({ pnr: SCENARIO_PNRS.known })
    expect(r.status).toBe('found')
    if (r.status !== 'found') return
    expect(r.resolved).toEqual({ office: { code: 'A2K9', gds: 'Amadeus' }, source: 'default' })
  })

  it('B: PNR new to Skydesk asks for GDS, then opens after the agent picks one', () => {
    expect(run({ pnr: SCENARIO_PNRS.unknown }).status).toBe('gds-required')

    const r = run({ pnr: SCENARIO_PNRS.unknown, gds: 'Galileo' })
    expect(r.status).toBe('found')
    if (r.status !== 'found') return
    expect(r.resolved.office).toEqual({ code: 'Q8L3', gds: 'Galileo' })
  })

  it('B: picking the wrong GDS gives Not Found in that GDS', () => {
    expect(run({ pnr: SCENARIO_PNRS.unknown, gds: 'Amadeus' })).toMatchObject({
      status: 'not-found',
      gds: 'Amadeus',
    })
  })

  it('C: a selected Office sets the GDS, so the agent is never asked for it', () => {
    const r = run({ pnr: SCENARIO_PNRS.unknown, selected: { code: 'C1Z2', gds: 'Galileo' } })
    expect(r.status).toBe('found')
    if (r.status !== 'found') return
    expect(r.resolved).toEqual({ office: { code: 'C1Z2', gds: 'Galileo' }, source: 'selected' })
  })

  it('C: a selected Office from another GDS searches only that GDS', () => {
    const r = run({ pnr: SCENARIO_PNRS.known, selected: { code: '5GW5', gds: 'Sabre' } })
    expect(r).toMatchObject({ status: 'not-found', gds: 'Sabre', office: { code: '5GW5' } })
  })

  it('D: known PNR, no Default Office → opens through the Creation PCC', () => {
    const r = searchPnr({ pnr: SCENARIO_PNRS.known, defaults: noDefaults }, mockPnrDirectory)
    expect(r.status).toBe('found')
    if (r.status !== 'found') return
    expect(r.resolved).toEqual({ office: { code: 'B3R7', gds: 'Amadeus' }, source: 'creation' })
  })

  it('PNR absent from every GDS the agent tries → Not Found', () => {
    expect(run({ pnr: SCENARIO_PNRS.notFound }).status).toBe('gds-required')
    expect(run({ pnr: SCENARIO_PNRS.notFound, gds: 'Sabre' }).status).toBe('not-found')
  })

  it('technical failure in the GDS → Error, not Not Found', () => {
    expect(run({ pnr: SCENARIO_PNRS.error })).toMatchObject({ status: 'error', gds: 'Amadeus' })
  })

  it('normalizes the PNR (case, spaces)', () => {
    expect(run({ pnr: '  7jrwt4 ' }).status).toBe('found')
  })
})

describe('Not Found — what the agent can do next', () => {
  it('after a picked GDS: records it as tried, so the other GDS can be offered', () => {
    expect(run({ pnr: SCENARIO_PNRS.unknown, gds: 'Amadeus' })).toMatchObject({
      status: 'not-found',
      gdsSource: 'picked',
      tried: ['Amadeus'],
    })
  })

  it('retries accumulate tried GDS without duplicates', () => {
    const second = run({ pnr: SCENARIO_PNRS.notFound, gds: 'Sabre', tried: ['Amadeus'] })
    expect(second).toMatchObject({ status: 'not-found', tried: ['Amadeus', 'Sabre'] })

    const repeat = run({ pnr: SCENARIO_PNRS.notFound, gds: 'Amadeus', tried: ['Amadeus'] })
    expect(repeat).toMatchObject({ tried: ['Amadeus'] })
  })

  it('a retry in the right GDS finds the booking', () => {
    const r = run({ pnr: SCENARIO_PNRS.unknown, gds: 'Galileo', tried: ['Amadeus', 'Sabre'] })
    expect(r.status).toBe('found')
  })

  it('all three GDS tried → nothing left to offer', () => {
    const r = run({ pnr: SCENARIO_PNRS.notFound, gds: 'Galileo', tried: ['Amadeus', 'Sabre'] })
    expect(r.status).toBe('not-found')
    if (r.status !== 'not-found') return
    expect(allGdsTried(r.tried)).toBe(true)
    expect(allGdsTried(['Amadeus', 'Sabre'])).toBe(false)
  })

  it('GDS set by an Office: source "office", no GDS counted as tried', () => {
    const r = run({ pnr: SCENARIO_PNRS.known, selected: { code: '5GW5', gds: 'Sabre' } })
    expect(r).toMatchObject({ status: 'not-found', gdsSource: 'office', tried: [], office: { code: '5GW5' } })
  })

  it('GDS Skydesk knew, but the PNR is gone: source "known", that GDS counts as tried', () => {
    const directory: PnrDirectory = { knownGds: () => 'Amadeus', lookup: () => null }
    const r = searchPnr({ pnr: 'GONE01', defaults: withDefaults }, directory)
    expect(r).toMatchObject({ status: 'not-found', gdsSource: 'known', tried: ['Amadeus'] })
  })
})
