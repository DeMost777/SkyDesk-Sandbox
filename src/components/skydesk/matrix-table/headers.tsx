import { formatSegmentDate, segmentRoute, type Passenger, type Segment } from '@/lib/booking'
import { cn } from '@/lib/utils'

// Headers of a Passenger × Segment table. Figma 8014:11347 (passenger), 8014:11380 (segment).

/** `P1` / `S1`: a 30px badge — orange for a passenger, blue for a segment. */
export function RefBadge({ tone, children }: { tone: 'passenger' | 'segment'; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        // 21px: Figma badge height in the header (text trimmed to cap height)
        'inline-flex h-[21px] w-[30px] shrink-0 items-center justify-center rounded border text-xs leading-4',
        tone === 'passenger'
          ? 'border-badge-passenger-border bg-badge-passenger text-badge-passenger-foreground'
          : 'border-badge-segment-border bg-badge-segment text-badge-segment-foreground',
      )}
    >
      {children}
    </span>
  )
}

/** `P1 ADT`. The name is a tooltip: Figma shows the badge and the type only. */
export function PassengerHeader({ passenger }: { passenger: Pick<Passenger, 'ref' | 'type' | 'name'> }) {
  return (
    <span className="flex items-center gap-1.5" title={passenger.name}>
      <RefBadge tone="passenger">{passenger.ref}</RefBadge>
      <span className="text-xs leading-4 text-muted-foreground">{passenger.type}</span>
    </span>
  )
}

/** `S1  KBP–FRA` over `14 Jun 2026  SK 400`. */
export function SegmentHeader({ segment }: { segment: Segment }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-1">
        <RefBadge tone="segment">{segment.ref}</RefBadge>
        <span className="flex-1 text-right font-mono text-sm uppercase leading-5">{segmentRoute(segment)}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-2 font-mono text-xs leading-4 text-muted-foreground">
        <span>{formatSegmentDate(segment.departureDate)}</span>
        <span>{segment.flightNumber}</span>
      </div>
    </div>
  )
}
