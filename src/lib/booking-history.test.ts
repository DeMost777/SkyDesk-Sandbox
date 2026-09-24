import { describe, expect, it } from 'vitest'
import { formatInteraction, gdsCode, toItinerary } from './booking-history'

describe('gdsCode', () => {
  it('uses the two-character GDS codes', () => {
    expect(gdsCode('Amadeus')).toBe('1A')
    expect(gdsCode('Sabre')).toBe('1S')
    expect(gdsCode('Galileo')).toBe('1G')
  })
})

describe('toItinerary', () => {
  it('two points are one way', () => {
    expect(toItinerary(['CDG', 'LON'])).toEqual({ kind: 'one-way', stops: ['CDG', 'LON'] })
  })

  it('out and back is a round trip showing both ends once', () => {
    expect(toItinerary(['YYZ', 'LON', 'YYZ'])).toEqual({ kind: 'round-trip', stops: ['YYZ', 'LON'] })
  })

  it('three different points are multi-city', () => {
    expect(toItinerary(['CDG', 'LON', 'JFK'])).toEqual({
      kind: 'multi-city',
      stops: ['CDG', 'LON', 'JFK'],
    })
  })

  it('a longer trip back to the start is multi-city, not round', () => {
    expect(toItinerary(['CDG', 'LON', 'JFK', 'CDG']).kind).toBe('multi-city')
  })
})

describe('formatInteraction', () => {
  const now = new Date(2026, 2, 13, 18, 0)

  it('says Today for the same calendar day', () => {
    expect(formatInteraction(new Date(2026, 2, 13, 15, 12), now)).toEqual({ date: 'Today', time: '15:12' })
  })

  it('uses DD/MM/YY for earlier days, even less than 24 hours ago', () => {
    expect(formatInteraction(new Date(2026, 2, 12, 23, 59), now)).toEqual({
      date: '12/03/26',
      time: '23:59',
    })
  })

  it('pads single digits', () => {
    expect(formatInteraction(new Date(2026, 0, 5, 9, 4), now)).toEqual({ date: '05/01/26', time: '09:04' })
  })

  it('same day and month of another year is not Today', () => {
    expect(formatInteraction(new Date(2025, 2, 13, 10, 0), now).date).toBe('13/03/25')
  })
})
