import { describe, expect, it } from 'vitest'
import { findBooking } from '@/mocks/bookings'
import { buildOverviewMatrix, documentRef, statusBadge, type MatrixCell, type OverviewDocument } from './overview-matrix'

const matrixOf = (pnr: string) => buildOverviewMatrix(findBooking(pnr)!)

/** `P1×S1` → the cell. */
function cell(pnr: string, passenger: string, segment: string): MatrixCell {
  const found = matrixOf(pnr)
    .rows.find((r) => r.segment.ref === segment)!
    .cells.find((c) => c.passenger.ref === passenger)
  if (!found) throw new Error(`${pnr}: no cell ${passenger}×${segment}`)
  return found
}

/** A cell as one readable line: `pricing Inactive, ticket 421-… Voided`. */
const describeDocument = (d: OverviewDocument) =>
  d.type === 'pricing' ? `pricing ${d.status}` : `ticket ${d.number} ${d.status}`
const lines = (c: MatrixCell) => c.documents.map(describeDocument)

describe('matrix structure', () => {
  it('has a row per segment in itinerary order and a cell per passenger in PNR order', () => {
    const m = matrixOf('BBV14Q')
    expect(m.rows.map((r) => r.segment.ref)).toEqual(['S1', 'S2'])
    expect(m.passengers.map((p) => p.ref)).toEqual(['P1', 'P2', 'P3'])
    for (const row of m.rows) expect(row.cells.map((c) => c.passenger.ref)).toEqual(['P1', 'P2', 'P3'])
  })

  it('builds 5 × 4 cells for the wide scenario', () => {
    const m = matrixOf('WIDE55')
    expect(m.passengers).toHaveLength(5)
    expect(m.rows).toHaveLength(4)
    expect(m.rows.flatMap((r) => r.cells)).toHaveLength(20)
  })
})

describe('reference cell of the spec (§17)', () => {
  it('reads oldest to newest: Inactive, Ticketed, Voided ticket, Active ticket', () => {
    expect(lines(cell('BBV14Q', 'P1', 'S1'))).toEqual([
      'pricing Inactive',
      'pricing Ticketed',
      'ticket 421-1324311324 Voided',
      'ticket 421-1324311325 Active',
    ])
  })

  it('keeps Pricing next to Tickets: neither hides the other', () => {
    expect(lines(cell('BBV14Q', 'P2', 'S1'))).toEqual(['pricing Active', 'ticket 421-1324311326 Active'])
  })

  it('shows an entity in every cell it covers', () => {
    expect(lines(cell('BBV14Q', 'P1', 'S2'))).toEqual([
      'pricing Ticketed',
      'ticket 421-1324311324 Voided',
      'ticket 421-1324311325 Active',
    ])
  })

  it('does not cover a segment the entity does not list', () => {
    expect(lines(cell('BBV14Q', 'P2', 'S2'))).toEqual(['pricing Active'])
  })
})

describe('Deleted Pricing and "No document"', () => {
  it('hides Deleted Pricing: a cell with only that has no documents', () => {
    expect(cell('BBV14Q', 'P3', 'S1').documents).toEqual([])
    expect(cell('DEL3T3', 'P1', 'S1').documents).toEqual([])
    expect(cell('DEL3T3', 'P1', 'S2').documents).toEqual([])
  })

  it('leaves an untouched cell empty too', () => {
    expect(cell('BBV14Q', 'P3', 'S2').documents).toEqual([])
  })

  it('shows the Active Pricing next to a Deleted one without the Deleted', () => {
    expect(lines(cell('DEL3T3', 'P2', 'S1'))).toEqual(['pricing Active'])
  })
})

describe('statuses', () => {
  it('shows every Pricing status, one per cell', () => {
    expect(lines(cell('PRC5TS', 'P1', 'S1'))).toEqual(['pricing Active'])
    expect(lines(cell('PRC5TS', 'P1', 'S2'))).toEqual(['pricing Ticketed'])
    expect(lines(cell('PRC5TS', 'P2', 'S1'))).toEqual(['pricing Unknown'])
    expect(lines(cell('PRC5TS', 'P2', 'S2'))).toEqual(['pricing Reprice required'])
    expect(lines(cell('PRC5TS', 'P3', 'S1'))).toEqual(['pricing Itinerary changed'])
    expect(lines(cell('PRC5TS', 'P3', 'S2'))).toEqual(['pricing Inactive'])
  })

  it('has no badge for Active, a badge with the status for everything else', () => {
    const badges = matrixOf('PRC5TS').rows.flatMap((r) => r.cells.flatMap((c) => c.documents.map(statusBadge)))
    // Row by row: S1 (P1, P2, P3), then S2 (P1, P2, P3).
    expect(badges).toEqual([null, 'Unknown', 'Itinerary changed', 'Ticketed', 'Reprice required', 'Inactive'])
    expect(statusBadge(cell('BBV14Q', 'P1', 'S1').documents[2])).toBe('Voided')
    expect(statusBadge(cell('BBV14Q', 'P1', 'S1').documents[3])).toBeNull()
  })

  it('keeps history: Inactive Pricing before the Active one after repricing', () => {
    expect(lines(cell('ABC123', 'P1', 'S1'))).toEqual(['pricing Inactive', 'pricing Active'])
  })
})

describe('order', () => {
  it('sorts by createdAt for Pricing and issuedAt for Tickets, not by type', () => {
    // WIDE55 P3: the Pricing (12:12) was created before both tickets; the voided one before the reissue.
    expect(lines(cell('WIDE55', 'P3', 'S1'))).toEqual([
      'pricing Ticketed',
      'ticket 016-5500000020 Voided',
      'ticket 016-5500000021 Active',
    ])
  })

  it('keeps backend order for equal timestamps — Pricing first, then Tickets — on every render', () => {
    const expected = ['pricing Active', 'pricing Inactive', 'ticket 074-2200000001 Active']
    expect(lines(cell('TIE5AM', 'P1', 'S1'))).toEqual(expected)
    expect(lines(cell('TIE5AM', 'P1', 'S1'))).toEqual(expected)
  })
})

describe('documentCount', () => {
  it('counts each visible entity once, however many cells it fills', () => {
    // BBV14Q: PR-1, PR-2, PR-3 visible (PR-4 Deleted) + TK-1, TK-2, TK-3.
    expect(matrixOf('BBV14Q').documentCount).toBe(6)
    // CVR4GE: one Ticket fills three cells, still one.
    expect(matrixOf('CVR4GE').documentCount).toBe(5)
  })

  it('does not count Deleted Pricing', () => {
    expect(matrixOf('DEL3T3').documentCount).toBe(1)
  })

  it('counts Voided and Inactive: they stay in the history', () => {
    expect(matrixOf('WIDE55').documentCount).toBe(11)
  })
})

describe('coverage', () => {
  it('puts one Ticket in all three cells of a passenger', () => {
    for (const segment of ['S1', 'S2', 'S3']) {
      expect(lines(cell('CVR4GE', 'P1', segment))).toContain('ticket 220-4412900001 Active')
    }
  })

  it('shows one Pricing in the cells of every passenger it covers', () => {
    expect(lines(cell('CVR4GE', 'P1', 'S1'))).toContain('pricing Ticketed')
    expect(lines(cell('CVR4GE', 'P2', 'S1'))).toContain('pricing Ticketed')
  })
})

describe('documentRef', () => {
  it('points at the exact entity, so a click opens that one', () => {
    const [pricing, , voided] = cell('BBV14Q', 'P1', 'S1').documents
    expect(documentRef(pricing)).toEqual({ type: 'pricing', id: 'PR-1' })
    expect(documentRef(voided)).toEqual({ type: 'ticket', id: 'TK-1' })
  })
})
