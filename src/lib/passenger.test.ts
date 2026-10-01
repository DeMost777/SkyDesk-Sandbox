import { describe, expect, it } from 'vitest'
import type { Passenger } from './booking'
import {
  displayName,
  displayTitle,
  formatPassengerDate,
  hasPassport,
  parseGdsName,
  passengerIndicators,
  passengerTooltip,
  personalInformation,
} from './passenger'

const adult = (extra: Partial<Passenger> = {}): Passenger => ({ ref: 'P1', type: 'ADT', name: 'LINDQVIST/ANNA MRS', ...extra })
const passport = { number: 'AB123456', countryOfIssue: 'SWE', expiresOn: '2030-04-01' }

describe('parseGdsName', () => {
  it('splits surname, given names and title', () => {
    expect(parseGdsName('LINDQVIST/ANNA MARIA MRS')).toEqual({ surname: 'LINDQVIST', given: 'ANNA MARIA', title: 'MRS' })
  })

  it('has no title when the GDS gives none', () => {
    expect(parseGdsName('LINDQVIST/ANNA')).toEqual({ surname: 'LINDQVIST', given: 'ANNA' })
  })

  it('drops the GDS infant marker: it is not a title', () => {
    expect(parseGdsName('TREMBLAY/ZOE INF')).toEqual({ surname: 'TREMBLAY', given: 'ZOE' })
  })

  it('reads a name without a slash as a surname', () => {
    expect(parseGdsName('MADONNA')).toEqual({ surname: 'MADONNA', given: '' })
  })

  it('knows the usual titles', () => {
    for (const title of ['MR', 'MRS', 'MS', 'MISS', 'MSTR', 'DR']) {
      expect(parseGdsName(`SMITH/JOHN ${title}`).title).toBe(title)
    }
  })
})

describe('displayName and displayTitle', () => {
  it('puts the surname first and capitalises like the product', () => {
    expect(displayName({ name: 'LINDQVIST/ANNA MARIA MRS' })).toBe('Lindqvist Anna Maria')
    expect(displayName({ name: 'VAN DER BERG/MARIE-LOUISE DR' })).toBe('Van Der Berg Marie-louise')
  })

  it('leaves the title out of the name', () => {
    expect(displayName({ name: 'MILLER/JOHN LEE MR' })).not.toMatch(/Mr/)
  })

  it('shows the title as Mr, Mrs, Dr', () => {
    expect(displayTitle({ name: 'MILLER/CAMILA BROWN MRS' })).toBe('Mrs')
    expect(displayTitle({ name: 'MILLER/JOHN LEE MR' })).toBe('Mr')
  })

  it('shows no title when there is none', () => {
    expect(displayTitle({ name: 'MILLER/JOHN' })).toBeUndefined()
    expect(displayTitle({ name: 'TREMBLAY/ZOE INF' })).toBeUndefined()
  })
})

describe('hasPassport', () => {
  it('needs a document number', () => {
    expect(hasPassport(adult({ document: passport }))).toBe(true)
    expect(hasPassport(adult({ document: { countryOfIssue: 'SWE' } }))).toBe(false)
    expect(hasPassport(adult({ document: { number: '  ' } }))).toBe(false)
    expect(hasPassport(adult())).toBe(false)
  })
})

describe('passengerIndicators', () => {
  const show = (p: Passenger) => passengerIndicators(p).map((i) => `${i.present ? '✓' : '✗'} ${i.label}`)

  it('date of birth, no passport, frequent flyer', () => {
    const p = adult({ dateOfBirth: '1980-02-03', frequentFlyers: [{ number: '123', airline: 'SK' }] })
    expect(show(p)).toEqual(['✓ Date of Birth', '✗ Passport', '✓ Frequent flyer'])
  })

  it('date of birth, no passport, no frequent flyer', () => {
    expect(show(adult({ dateOfBirth: '1980-02-03' }))).toEqual(['✓ Date of Birth', '✗ Passport'])
  })

  it('passport hides the date of birth, even when the date is known', () => {
    const p = adult({ dateOfBirth: '1980-02-03', document: passport, frequentFlyers: [{ number: '123', airline: 'SK' }] })
    expect(show(p)).toEqual(['✓ Passport', '✓ Frequent flyer'])
  })

  it('passport only', () => {
    expect(show(adult({ document: passport }))).toEqual(['✓ Passport'])
  })

  it('nothing known: both are ✗ and there is no frequent flyer', () => {
    expect(show(adult())).toEqual(['✗ Date of Birth', '✗ Passport'])
  })

  it('a child without a date of birth is shown like an adult without one', () => {
    expect(show({ ref: 'P2', type: 'CHD', name: 'KALLIO/OSKARI MSTR' })).toEqual(['✗ Date of Birth', '✗ Passport'])
  })

  it('frequent flyer is never ✗', () => {
    expect(passengerIndicators(adult()).some((i) => i.id === 'frequent-flyer')).toBe(false)
  })
})

describe('personalInformation', () => {
  it('lists the six fields in grid order', () => {
    expect(personalInformation(adult()).map((f) => f.label)).toEqual([
      'Date of birth',
      'Gender',
      'Nationality',
      'Passport or ID number',
      'Country of issue',
      'Date of expiration',
    ])
  })

  it('shows a dash for every missing value', () => {
    expect(personalInformation(adult()).map((f) => f.value)).toEqual(['-', '-', '-', '-', '-', '-'])
  })

  it('shows what is known, dates as DD/MM/YYYY', () => {
    const p = adult({ dateOfBirth: '1966-09-30', gender: 'FEMALE', nationality: 'Sweden', document: passport })
    expect(personalInformation(p).map((f) => f.value)).toEqual(['30/09/1966', 'FEMALE', 'Sweden', 'AB123456', 'SWE', '01/04/2030'])
  })

  it('keeps a gender of UNKNOWN: it is a value, not a gap', () => {
    expect(personalInformation(adult({ gender: 'UNKNOWN' }))[1].value).toBe('UNKNOWN')
  })
})

describe('formatPassengerDate', () => {
  it('reads the ISO string, so the time zone cannot move the day', () => {
    expect(formatPassengerDate('2026-01-01')).toBe('01/01/2026')
    expect(formatPassengerDate('2026-12-31T23:30:00Z')).toBe('31/12/2026')
  })
})

describe('passengerTooltip', () => {
  it('says Passenger N', () => {
    expect(passengerTooltip('P1')).toBe('Passenger 1')
    expect(passengerTooltip('P12')).toBe('Passenger 12')
  })

  it('falls back to the reference when it is not P<number>', () => {
    expect(passengerTooltip('X')).toBe('Passenger X')
  })
})
