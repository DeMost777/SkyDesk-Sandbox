import { Clock, PanelLeft, PanelRight, Users } from 'lucide-react'
import { formatCreated, passengersLabel } from '@/lib/booking'
import type { GDS } from '@/lib/office'
import { cn } from '@/lib/utils'

// Top bar of Booking Overview: what the agent has open. Figma 8014:11426, flow doc
// projects/booking-overview/README.md. The three icon buttons have no behaviour yet.

export interface BookingHeaderProps {
  pnr: string
  gds: GDS
  passengerCount: number
  /** ISO date-time; shown in the agent's local time. */
  createdAt: string
  className?: string
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-7 items-center justify-center rounded-md text-icon transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  )
}

const Divider = () => <span aria-hidden className="h-4 w-px shrink-0 bg-border" />

export function BookingHeader({ pnr, gds, passengerCount, createdAt, className }: BookingHeaderProps) {
  const created = formatCreated(createdAt)
  return (
    <header
      className={cn('flex h-11 shrink-0 items-center gap-1 overflow-hidden border-b border-border bg-background px-4 shadow-header', className)}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <IconButton label="Toggle sidebar">
          <PanelLeft className="size-4" strokeWidth={1.5} />
        </IconButton>
        <Divider />
        <h1 className="shrink-0 text-base font-medium">{pnr}</h1>
        <Divider />
        <span className="shrink-0 text-sm">{gds}</span>
        <Divider />
        <span className="flex shrink-0 items-center gap-2 text-sm">
          <Users aria-hidden className="size-4 text-icon" strokeWidth={1.5} />
          {passengersLabel(passengerCount)}
        </span>
        <Divider />
        {/* A real space, not a flex gap: a screen reader must not read "08/10/202513:44" */}
        <span className="shrink-0 whitespace-nowrap text-sm">
          Created: {created.date} <span className="text-xs text-muted-foreground">{created.time}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <IconButton label="History">
          <Clock className="size-4" strokeWidth={1.5} />
        </IconButton>
        <IconButton label="Toggle chat">
          <PanelRight className="size-4" strokeWidth={1.5} />
        </IconButton>
      </div>
    </header>
  )
}
