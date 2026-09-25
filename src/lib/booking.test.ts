import { describe, expect, it } from 'vitest'
import { formatCreated, openBooking, passengerCountLabel } from './booking'
import { mockBookingDirectory } from '@/mocks/bookings.mock'
import { MOCK_BOOKINGS, mockPnrDirectory } from '@/mocks/pnr-search.mock'
import { PERSONAS } from '@/mocks/personas.mock'

describe('passengerCountLabel', () => {
  it('is singular for one passenger', () => {
    expect(passengerCountLabel(1)).toBe('1 passenger')
  })

  it('is plural otherwise', () => {
    expect(passengerCountLabel(3)).toBe('3 passengers')
    expect(passengerCountLabel(0)).toBe('0 passengers')
  })
})

describe('formatCreated', () => {
  it('prints DD/MM/YYYY and HH:mm as in Figma (08/10/2025 13:44)', () => {
    expect(formatCreated(new Date(2025, 9, 8, 13, 44))).toEqual({ date: '08/10/2025', time: '13:44' })
  })

  it('pads single digits', () => {
    expect(formatCreated(new Date(2026, 0, 5, 9, 3))).toEqual({ date: '05/01/2026', time: '09:03' })
  })
})

describe('mock bookings', () => {
  it('every PNR the search finds opens a booking that agrees with the search result', () => {
    for (const found of MOCK_BOOKINGS) {
      const booking = mockBookingDirectory.get(found.pnr, found.gds)
      expect(booking, found.pnr).not.toBeNull()
      expect(booking).toMatchObject({
        pnr: found.pnr,
        gds: found.gds,
        creationOffice: found.creationOffice,
        passengers: found.passengers,
      })
      expect(booking!.createdAt, `${found.pnr} createdAt`).toBeInstanceOf(Date)
    }
  })

  it('BBV14Q matches Figma: Sabre, 3 passengers, created 08/10/2025 13:44', () => {
    const booking = mockBookingDirectory.get('BBV14Q', 'Sabre')!
    expect(passengerCountLabel(booking.passengers.length)).toBe('3 passengers')
    expect(formatCreated(booking.createdAt)).toEqual({ date: '08/10/2025', time: '13:44' })
  })

  it('has no booking for a PNR in another GDS', () => {
    expect(mockBookingDirectory.get('BBV14Q', 'Amadeus')).toBeNull()
    expect(mockBookingDirectory.get('XYZ789', 'Sabre')).toBeNull()
  })
})

describe('openBooking — same rules as PNR Search', () => {
  const withDefaults = PERSONAS[0].defaults
  const open = (pnr: string, extra: object = {}, defaults = withDefaults) =>
    openBooking({ pnr, defaults, ...extra }, mockPnrDirectory, mockBookingDirectory)

  it('opens BBV14Q through the Default Office for Sabre', () => {
    expect(open('BBV14Q')).toMatchObject({
      status: 'opened',
      booking: { pnr: 'BBV14Q', gds: 'Sabre' },
      resolved: { office: { code: '5GW5' }, source: 'default' },
    })
  })

  it('opens through the Creation office when the agent has no Default Office', () => {
    expect(open('BBV14Q', {}, PERSONAS[1].defaults)).toMatchObject({
      status: 'opened',
      resolved: { office: { code: 'D4M5' }, source: 'creation' },
    })
  })

  it('opens through a selected Office and a picked GDS', () => {
    expect(open('7JRWT4', { selected: { code: 'E6T8', gds: 'Amadeus' } })).toMatchObject({
      status: 'opened',
      resolved: { office: { code: 'E6T8' }, source: 'selected' },
    })
    expect(open('ABC123', { gds: 'Galileo' })).toMatchObject({ status: 'opened', booking: { gds: 'Galileo' } })
  })

  it('leaves every other search outcome to PNR Search', () => {
    expect(open('')).toEqual({ status: 'not-opened', search: { status: 'pnr-required' } })
    expect(open('ABC123')).toMatchObject({ status: 'not-opened', search: { status: 'gds-required' } })
    expect(open('XYZ789', { gds: 'Sabre' })).toMatchObject({ status: 'not-opened', search: { status: 'not-found' } })
    expect(open('ERR000')).toMatchObject({ status: 'not-opened', search: { status: 'error' } })
  })
})
