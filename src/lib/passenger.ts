// Passengers widget rules: names, indicators and the fields of an expanded card. Pure module — no React.
// Flow doc: projects/booking-overview/passengers-widget.md. The widget calls these, it does not repeat them.
import type { FrequentFlyer, Passenger } from './booking'

/** A value that is not set: `-` (spec). */
export const EMPTY_VALUE = '-'

const TITLES = new Set(['MR', 'MRS', 'MS', 'MISS', 'MSTR', 'DR'])
// A GDS ends an infant's name with INF. It is not a title: the passenger type already says it.
const GDS_MARKERS = new Set(['INF'])

export interface ParsedName {
  surname: string
  given: string
  /** Upper case as in the GDS: 'MRS'. */
  title?: string
}

/** `'LINDQVIST/ANNA MARIA MRS'` → surname `LINDQVIST`, given `ANNA MARIA`, title `MRS`. */
export function parseGdsName(name: string): ParsedName {
  const [surname, ...rest] = name.trim().split('/')
  const words = rest.join('/').trim().split(/\s+/).filter(Boolean)
  let title: string | undefined
  for (let last = words[words.length - 1]?.toUpperCase(); last !== undefined; last = words[words.length - 1]?.toUpperCase()) {
    if (TITLES.has(last)) title ??= last
    else if (!GDS_MARKERS.has(last)) break
    words.pop()
  }
  return { surname: surname.trim(), given: words.join(' '), ...(title ? { title } : {}) }
}

// 'MARIE-LOUISE' → 'Marie-louise': only the first letter of a word is a capital, as in the product.
const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
const capitalizeWords = (text: string) => text.split(/\s+/).filter(Boolean).map(capitalize).join(' ')

/** Surname first, then the given names: `Lindqvist Anna Maria` (decision of 2026-10-01). */
export function displayName(passenger: Pick<Passenger, 'name'>): string {
  const { surname, given } = parseGdsName(passenger.name)
  return capitalizeWords(`${surname} ${given}`)
}

/** `Mrs`; undefined when the GDS gives no title. */
export function displayTitle(passenger: Pick<Passenger, 'name'>): string | undefined {
  const { title } = parseGdsName(passenger.name)
  return title ? capitalize(title) : undefined
}

/** A passport counts as entered when it has a number (decision of 2026-10-01). */
export function hasPassport(passenger: Pick<Passenger, 'document'>): boolean {
  return (passenger.document?.number ?? '').trim() !== ''
}

export function frequentFlyersOf(passenger: Pick<Passenger, 'frequentFlyers'>): FrequentFlyer[] {
  return passenger.frequentFlyers ?? []
}

export interface PassengerIndicator {
  id: 'date-of-birth' | 'passport' | 'frequent-flyer'
  label: string
  /** ✓ when true, ✗ when false. */
  present: boolean
}

/**
 * The indicators after the passenger type, in order:
 * Date of Birth — only without a passport (a passport has the date); Passport — always;
 * Frequent flyer — only when there is a card, and only as ✓.
 */
export function passengerIndicators(passenger: Passenger): PassengerIndicator[] {
  const passport = hasPassport(passenger)
  const indicators: PassengerIndicator[] = []
  if (!passport) indicators.push({ id: 'date-of-birth', label: 'Date of Birth', present: Boolean(passenger.dateOfBirth) })
  indicators.push({ id: 'passport', label: 'Passport', present: passport })
  if (frequentFlyersOf(passenger).length > 0) indicators.push({ id: 'frequent-flyer', label: 'Frequent flyer', present: true })
  return indicators
}

/** `1990-05-07` → `07/05/1990`. Read from the ISO string itself, so the time zone cannot shift the day. */
export function formatPassengerDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

export interface DetailField {
  label: string
  value: string
}

/** The six fields of an expanded card, in the order of its 3 × 2 grid (rows left to right). */
export function personalInformation(passenger: Passenger): DetailField[] {
  const document = passenger.document
  return [
    { label: 'Date of birth', value: passenger.dateOfBirth ? formatPassengerDate(passenger.dateOfBirth) : EMPTY_VALUE },
    { label: 'Gender', value: passenger.gender ?? EMPTY_VALUE },
    { label: 'Nationality', value: passenger.nationality?.trim() || EMPTY_VALUE },
    { label: 'Passport or ID number', value: document?.number?.trim() || EMPTY_VALUE },
    { label: 'Country of issue', value: document?.countryOfIssue?.trim() || EMPTY_VALUE },
    { label: 'Date of expiration', value: document?.expiresOn ? formatPassengerDate(document.expiresOn) : EMPTY_VALUE },
  ]
}

/** The tooltip of the `P1` badge: `Passenger 1`. */
export function passengerTooltip(ref: string): string {
  const number = ref.match(/^P(\d+)$/)?.[1]
  return `Passenger ${number ?? ref}`
}
