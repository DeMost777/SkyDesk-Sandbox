import { describe, expect, it } from 'vitest'
import { BOOKING_SCENARIOS, MOCK_BOOKING_DETAILS, findBooking } from '@/mocks/bookings'
import { MOCK_OFFICES } from '@/mocks/offices.mock'
import { bookingRoute, formatSegmentDate, segmentRoute, validateBooking, type Booking } from './booking'
import { summarizeBooking } from './pnr-search'

const bbv14q = findBooking('BBV14Q')!

describe('mock scenarios', () => {
  it.each(BOOKING_SCENARIOS.map((s) => [s.booking.pnr, s.booking] as const))('%s is consistent', (_pnr, booking) => {
    expect(validateBooking(booking)).toEqual([])
  })

  it('has a unique PNR per scenario', () => {
    const pnrs = MOCK_BOOKING_DETAILS.map((b) => b.pnr)
    expect(new Set(pnrs).size).toBe(pnrs.length)
  })

  it('is created in an Office of its own GDS', () => {
    for (const booking of MOCK_BOOKING_DETAILS) {
      const office = MOCK_OFFICES.find((o) => o.code === booking.creationOffice)
      expect(office?.gds, booking.pnr).toBe(booking.gds)
    }
  })

  it('covers all three passenger types', () => {
    const types = new Set(MOCK_BOOKING_DETAILS.flatMap((b) => b.passengers.map((p) => p.type)))
    expect([...types].sort()).toEqual(['ADT', 'CHD', 'INF'])
  })

  it('numbers passengers P1… and segments S1… in order', () => {
    for (const booking of MOCK_BOOKING_DETAILS) {
      expect(booking.passengers.map((p) => p.ref), booking.pnr).toEqual(booking.passengers.map((_, i) => `P${i + 1}`))
      expect(booking.segments.map((s) => s.ref), booking.pnr).toEqual(booking.segments.map((_, i) => `S${i + 1}`))
    }
  })

  it('finds a Booking by PNR, and by GDS when given', () => {
    expect(findBooking('BBV14Q')?.gds).toBe('Sabre')
    expect(findBooking('BBV14Q', 'Sabre')).toBeDefined()
    expect(findBooking('BBV14Q', 'Amadeus')).toBeUndefined()
    expect(findBooking('XYZ789')).toBeUndefined()
  })
})

describe('summarizeBooking — what PNR Search has always shown', () => {
  it('7JRWT4', () => {
    expect(summarizeBooking(findBooking('7JRWT4')!)).toEqual({
      pnr: '7JRWT4',
      gds: 'Amadeus',
      creationOffice: 'B3R7',
      passengers: ['LINDQVIST/ANNA MRS', 'LINDQVIST/ERIK MR'],
      route: 'ARN → LHR → JFK',
      departureDate: '2026-10-15',
    })
  })

  it('K2M9QP', () => {
    expect(summarizeBooking(findBooking('K2M9QP')!)).toEqual({
      pnr: 'K2M9QP',
      gds: 'Sabre',
      creationOffice: '7MTR',
      passengers: ['CHEN/WEI MR'],
      route: 'YYZ → YVR',
      departureDate: '2026-11-02',
    })
  })

  it('ABC123', () => {
    expect(summarizeBooking(findBooking('ABC123')!)).toEqual({
      pnr: 'ABC123',
      gds: 'Galileo',
      creationOffice: 'C1Z2',
      passengers: ['OKAFOR/NGOZI MS'],
      route: 'LHR → LOS',
      departureDate: '2026-10-28',
    })
  })
})

describe('bookingRoute', () => {
  it('lists airports in travel order', () => {
    expect(bookingRoute(bbv14q)).toEqual(['CDG', 'LHR', 'JFK'])
    expect(bookingRoute(findBooking('DEL3T3')!)).toEqual(['MAD', 'LIS', 'MAD'])
  })

  it('adds the start of a segment that does not continue the previous one (open jaw)', () => {
    const seg = (ref: string, from: string, to: string) => ({ ref, from, to, departureDate: '2026-01-01', flightNumber: 'XX 1' })
    expect(bookingRoute({ segments: [seg('S1', 'AMS', 'LIS'), seg('S2', 'MAD', 'AMS')] })).toEqual(['AMS', 'LIS', 'MAD', 'AMS'])
  })
})

describe('formatting', () => {
  it('writes a segment route with an en dash', () => {
    expect(segmentRoute({ from: 'KBP', to: 'FRA' })).toBe('KBP–FRA')
  })

  it('writes a segment date with the year, without a leading zero', () => {
    expect(formatSegmentDate('2026-06-14')).toBe('14 Jun 2026')
    expect(formatSegmentDate('2026-12-03')).toBe('3 Dec 2026')
  })

  it('does not let the time zone move the day', () => {
    expect(formatSegmentDate('2026-06-14T23:59:00Z')).toBe('14 Jun 2026')
  })
})

describe('validateBooking', () => {
  const broken = (change: (b: Booking) => void): string[] => {
    const copy: Booking = structuredClone(bbv14q)
    change(copy)
    return validateBooking(copy)
  }

  it('reports a PNR that is not 6 letters or digits', () => {
    expect(broken((b) => { b.pnr = 'ab12' })).toEqual(['PNR ab12 is not 6 letters/digits'])
  })

  it('reports coverage that points to a missing passenger or segment', () => {
    expect(broken((b) => { b.pricings[0].coverage.passengers = ['P9'] })).toContain('pricing PR-1: unknown passenger P9')
    expect(broken((b) => { b.tickets[0].coverage.segments = ['S9'] })).toContain('ticket TK-1: unknown segment S9')
  })

  it('reports an entity that covers nothing', () => {
    expect(broken((b) => { b.pricings[0].coverage.segments = [] })).toContain('pricing PR-1 covers nothing')
  })

  it('reports duplicate ids and ticket numbers', () => {
    expect(broken((b) => { b.tickets[1].id = 'TK-1' })).toContain('duplicate entity id TK-1')
    expect(broken((b) => { b.tickets[1].number = b.tickets[0].number })).toContain('duplicate ticket number 421-1324311324')
  })

  it('reports a malformed ticket number', () => {
    expect(broken((b) => { b.tickets[0].number = '4211324311324' })).toContain('ticket TK-1: number 4211324311324 is not 421-1234567890')
  })
})
