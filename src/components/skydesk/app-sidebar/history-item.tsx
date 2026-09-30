import { Fragment } from 'react'
import { ArrowRight, ArrowRightLeft } from 'lucide-react'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { formatInteraction, gdsCode, toItinerary, type HistoryEntry } from '@/lib/booking-history'
import { cn } from '@/lib/utils'

interface HistoryItemProps {
  entry: HistoryEntry
  /** Reference point for "Today". */
  now: Date
  /** The booking open right now. */
  isActive?: boolean
  onSelect?: (entry: HistoryEntry) => void
  className?: string
}

// Figma 4920:69057: PNR · GDS code, interaction date / itinerary, interaction time.
export function HistoryItem({ entry, now, isActive = false, onSelect, className }: HistoryItemProps) {
  const itinerary = toItinerary(entry.route)
  const { date, time } = formatInteraction(entry.lastInteractionAt, now)
  const Arrow = itinerary.kind === 'round-trip' ? ArrowRightLeft : ArrowRight
  const routeLabel =
    itinerary.kind === 'round-trip'
      ? `${itinerary.stops.join(' to ')} and back`
      : itinerary.stops.join(' to ')

  return (
    <SidebarMenuButton
      isActive={isActive}
      onClick={() => onSelect?.(entry)}
      aria-label={`${entry.pnr}, ${entry.gds}, ${routeLabel}, ${date} ${time}`}
      className={cn(
        'h-[54px] flex-col items-stretch justify-center gap-0.5 rounded-sm px-2 py-1.5 font-mono text-xs text-muted-foreground',
        className,
      )}
    >
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <span className="text-sidebar-accent-foreground">{entry.pnr}</span>
          <span aria-hidden className="size-0.5 bg-muted-foreground" />
          <span>{gdsCode(entry.gds)}</span>
        </span>
        <span>{date}</span>
      </span>
      <span className="flex items-center gap-4">
        <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          {itinerary.stops.map((stop, i) => (
            <Fragment key={i}>
              {i > 0 && <Arrow aria-hidden className="size-2.5 shrink-0" />}
              <span>{stop}</span>
            </Fragment>
          ))}
        </span>
        <span className="shrink-0 text-right">{time}</span>
      </span>
    </SidebarMenuButton>
  )
}
