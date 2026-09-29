// SANDBOX-ONLY: jumps between mock Bookings by PNR. Delete with the rest of the SANDBOX-ONLY scaffolding.
import { navigate } from '@/hooks/use-sandbox-url'
import { BOOKING_SCENARIOS } from '@/mocks/bookings'
import { cn } from '@/lib/utils'

export function SandboxBar({ pnr, persona }: { pnr: string; persona: string | null }) {
  return (
    <aside
      aria-label="Sandbox controls"
      className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-muted px-4 py-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Booking:</span>
        {BOOKING_SCENARIOS.map(({ booking, purpose }) => (
          <button
            key={booking.pnr}
            type="button"
            title={purpose}
            aria-pressed={pnr === booking.pnr}
            onClick={() => navigate({ page: 'booking-overview', pnr: booking.pnr, persona })}
            className={cn(
              'rounded px-2 py-0.5 font-mono text-xs transition-colors',
              pnr === booking.pnr
                ? 'bg-foreground text-background' // sandbox chrome: dark active state (teal + white fails AA at 12px)
                : 'border border-border bg-background text-foreground hover:bg-accent',
            )}
          >
            {booking.pnr}
          </button>
        ))}
      </div>
    </aside>
  )
}
