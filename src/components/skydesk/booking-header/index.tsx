import { Fragment } from 'react'
import { PanelLeft, PanelRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCreated, passengerCountLabel, type Booking } from '@/lib/booking'
import { cn } from '@/lib/utils'

// Flow doc: projects/booking-overview/README.md → «Header». Figma 308:12504.
// Office is not shown (open question #22). Time Limit and the clock button are hidden in the
// page design (Figma 7994:305661), so they are not built. Buttons have no behaviour yet.

/** Figma: a 0-wide, 16px-high line with a centred 1px stroke — takes no room in the 16px gap. */
function Divider() {
  return (
    <span aria-hidden className="relative h-4 w-0 shrink-0">
      <span className="absolute inset-y-0 -left-[0.5px] w-px bg-divider" />
    </span>
  )
}

export interface BookingHeaderProps {
  /** The open booking: PNR, GDS, passengers, creation date. */
  booking: Booking
  /** Left button ◧. The screen passes nothing yet — no behaviour (open question #21). */
  onToggleSidebar?: () => void
  /** Right button ◨. The screen passes nothing yet — no behaviour (open question #21). */
  onTogglePanel?: () => void
  className?: string
}

/**
 * Header of the Booking screen: PNR · GDS · passengers · creation date, sidebar and panel buttons.
 * Office is not shown (open question #22). Figma 308:12504. Flow doc: projects/booking-overview/README.md.
 */
export function BookingHeader({ booking, onToggleSidebar, onTogglePanel, className }: BookingHeaderProps) {
  const created = formatCreated(booking.createdAt)
  const items = [
    <Button
      key="sidebar"
      variant="ghost"
      size="icon"
      aria-label="Toggle sidebar"
      onClick={onToggleSidebar}
      className="size-7 rounded-lg" // Figma: 28×28, radius 8
    >
      <PanelLeft />
    </Button>,
    <h1 key="pnr" className="text-base font-medium leading-5 text-foreground">
      {booking.pnr}
    </h1>,
    <span key="gds">{booking.gds}</span>,
    <span key="passengers" className="flex items-center gap-2">
      <Users className="size-4" aria-hidden />
      {passengerCountLabel(booking.passengers.length)}
    </span>,
    <span key="created" className="flex items-center gap-1">
      Created:{' '}
      <time dateTime={booking.createdAt.toISOString()} className="flex items-center gap-1">
        {created.date}{' '}
        <span className="text-xs text-muted-foreground">{created.time}</span>
      </time>
    </span>,
  ]

  return (
    <header
      className={cn(
        'flex h-11 w-full items-center gap-1 border-b border-border bg-background px-4 py-2 drop-shadow-header', // Figma: 44px high
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 overflow-hidden whitespace-nowrap text-sm text-foreground">
        {items.map((item, i) => (
          <Fragment key={i}>
            {i > 0 && <Divider />}
            {item}
          </Fragment>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle panel"
        onClick={onTogglePanel}
        className="size-7 shrink-0" // Figma: 28×28, radius 6
      >
        <PanelRight />
      </Button>
    </header>
  )
}
