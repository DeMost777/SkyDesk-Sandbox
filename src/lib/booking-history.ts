// Booking history domain: the bookings an agent recently worked with in Skydesk,
// and how the sidebar labels them. Flow doc: projects/app-sidebar/README.md.
import type { GDS } from '@/lib/office'

export interface HistoryEntry {
  pnr: string
  gds: GDS
  /** Airport or city codes in travel order: ['YYZ', 'LON', 'YYZ'] for a round trip. */
  route: string[]
  /** The agent's last action on this booking in Skydesk. */
  lastInteractionAt: Date
}

/** Source of history entries. The mock implements it now; the real API will later. */
export interface BookingHistory {
  /** Most recent interaction first. */
  recent(): HistoryEntry[]
}

const GDS_CODES: Record<GDS, string> = { Amadeus: '1A', Sabre: '1S', Galileo: '1G' }

/** Two-character GDS code shown next to the PNR: Amadeus 1A, Sabre 1S, Galileo 1G. */
export function gdsCode(gds: GDS): string {
  return GDS_CODES[gds]
}

export type ItineraryKind = 'one-way' | 'round-trip' | 'multi-city'

export interface Itinerary {
  kind: ItineraryKind
  /** Points to print: a round trip shows its two ends only (YYZ ⇆ LON). */
  stops: string[]
}

/**
 * Figma variants: One way (A → B), Round (A ⇆ B), Multi trip (A → B → C).
 * A round trip is exactly out and back: three points, the last equal to the first.
 */
export function toItinerary(route: string[]): Itinerary {
  if (route.length === 3 && route[0] === route[2]) {
    return { kind: 'round-trip', stops: [route[0], route[1]] }
  }
  return { kind: route.length > 2 ? 'multi-city' : 'one-way', stops: route }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Interaction date and time in the agent's local time: 'Today' or DD/MM/YY, and HH:mm. */
export function formatInteraction(at: Date, now: Date): { date: string; time: string } {
  const sameDay =
    at.getFullYear() === now.getFullYear() &&
    at.getMonth() === now.getMonth() &&
    at.getDate() === now.getDate()
  const date = sameDay
    ? 'Today'
    : `${pad(at.getDate())}/${pad(at.getMonth() + 1)}/${pad(at.getFullYear() % 100)}`
  return { date, time: `${pad(at.getHours())}:${pad(at.getMinutes())}` }
}
