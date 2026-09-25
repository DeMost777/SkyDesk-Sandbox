import * as React from 'react'
import { AppSidebar } from '@/components/skydesk/app-sidebar'
import { BookingHeader } from '@/components/skydesk/booking-header'
import { useDefaultOffices } from '@/hooks/use-default-offices'
import { redirect } from '@/hooks/use-sandbox-url'
import { openBooking } from '@/lib/booking'
import type { OfficeSelection } from '@/lib/office'
import type { SandboxParams } from '@/lib/sandbox-url'
import { mockBookingHistory } from '@/mocks/booking-history.mock'
import { mockBookingDirectory } from '@/mocks/bookings.mock'
import { MOCK_OFFICES } from '@/mocks/offices.mock'
import { mockPnrDirectory } from '@/mocks/pnr-search.mock'
import { toPersonaId } from '@/mocks/personas.mock'
import { MOCK_USER } from '@/mocks/user.mock'

// Flow doc: projects/booking-overview/README.md. Figma 7994:305661 (iteration 1: Header,
// the "Booking Overview" tab and an empty widget area). Final view — Figma 4678:125394.

function officeByCode(code: string | null): OfficeSelection | null {
  const office = MOCK_OFFICES.find((o) => o.code === code)
  return office ? { code: office.code, gds: office.gds } : null
}

/**
 * The booking is opened by the same rules as PNR Search (`openBooking`). A PNR that does not
 * open goes to PNR Search with the same address, which shows why (Not Found, Error…).
 */
export default function BookingPage({ params }: { params: SandboxParams }) {
  const { defaults } = useDefaultOffices(toPersonaId(params.persona))
  const [history] = React.useState(() => mockBookingHistory.recent())
  const [outcome] = React.useState(() =>
    openBooking(
      { pnr: params.pnr, selected: officeByCode(params.office), gds: params.gds, defaults },
      mockPnrDirectory,
      mockBookingDirectory,
    ),
  )

  React.useEffect(() => {
    // SANDBOX-ONLY: the address is the only way into this page until Found → Booking (task 2.5).
    if (outcome.status === 'not-opened') redirect({ ...params, page: 'pnr-search', state: 'result' })
  }, [outcome, params])

  if (outcome.status !== 'opened') return null
  const { booking } = outcome

  return (
    <div className="flex h-full bg-background">
      <AppSidebar history={history} user={MOCK_USER} activePnr={booking.pnr} />

      <div className="flex min-w-0 flex-1 flex-col">
        <BookingHeader booking={booking} className="relative z-10 shrink-0" />

        {/* Figma "Widgets overview": secondary background, sidebar-border on the left */}
        <main className="flex min-h-0 flex-1 flex-col border-l border-sidebar-border bg-secondary">
          <BookingTabs />
          <div
            id="booking-overview-panel"
            role="tabpanel"
            aria-labelledby="booking-overview-tab"
            className="flex-1 overflow-auto"
          >
            {/* Widgets go here one under another — Figma 4678:125394: an 800px column, centred.
                Empty in iteration 1, as in the design. */}
            <div className="mx-auto flex w-full max-w-[800px] flex-col gap-4" />
          </div>
        </main>
      </div>
    </div>
  )
}

/** Figma Tabs 5123:368550: one tab, always selected. Switching comes with more tabs. */
function BookingTabs() {
  return (
    <div role="tablist" aria-label="Booking" className="flex shrink-0 border-b border-border bg-secondary">
      <button
        type="button"
        role="tab"
        id="booking-overview-tab"
        aria-selected
        aria-controls="booking-overview-panel"
        className="px-4 py-2 text-base font-medium leading-5 text-foreground"
      >
        Booking Overview
      </button>
    </div>
  )
}
