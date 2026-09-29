import * as React from 'react'
import { ClipboardList } from 'lucide-react'
import { AppSidebar } from '@/components/skydesk/app-sidebar'
import { BookingHeader } from '@/components/skydesk/booking-header'
import { WidgetSection } from '@/components/skydesk/widget-section'
import { buildOverviewMatrix } from '@/lib/overview-matrix'
import type { SandboxParams } from '@/lib/sandbox-url'
import { findBooking } from '@/mocks/bookings'
import { mockBookingHistory } from '@/mocks/booking-history.mock'
import { MOCK_USER } from '@/mocks/user.mock'
import { SandboxBar } from './components/sandbox-bar'

// Booking Overview: the page that opens a Booking by PNR and lays its widgets out in one centred column.
// Figma 8014:11324, flow doc projects/booking-overview/README.md. The address is
// ?page=booking-overview&pnr=<PNR>; without a booking the page says so (sandbox only).

export default function BookingOverviewPage({ params }: { params: SandboxParams }) {
  const [history] = React.useState(() => mockBookingHistory.recent())
  const booking = findBooking(params.pnr)
  const matrix = booking ? buildOverviewMatrix(booking) : null

  return (
    <div className="flex h-full bg-background">
      <AppSidebar history={history} user={MOCK_USER} />

      <div className="flex min-w-0 flex-1 flex-col">
        <SandboxBar pnr={params.pnr} persona={params.persona} />

        {booking && matrix ? (
          <>
            <BookingHeader
              pnr={booking.pnr}
              gds={booking.gds}
              passengerCount={booking.passengers.length}
              createdAt={booking.createdAt}
            />
            {/* Title strip: Figma "Tabs" 8014:11329, one active tab */}
            <div className="flex h-9 shrink-0 items-center border-b border-border bg-secondary px-4">
              <p className="text-base font-medium">Booking Overview</p>
            </div>
            <main className="min-h-0 flex-1 overflow-auto bg-page">
              <WidgetSection title="Overview" icon={ClipboardList} count={matrix.documentCount}>
                {/* SANDBOX-ONLY placeholder: the Passenger × Segment matrix is ROADMAP 3.1 */}
                <p className="rounded-md border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                  Overview matrix: {matrix.passengers.length} passengers × {matrix.rows.length} segments (ROADMAP 3.1)
                </p>
              </WidgetSection>
            </main>
          </>
        ) : (
          <main className="flex flex-1 items-center justify-center bg-page px-6">
            {/* SANDBOX-ONLY: in the product a Booking arrives from PNR Search, so this never shows */}
            <p className="text-sm text-muted-foreground">
              {params.pnr ? `No mock booking for PNR ${params.pnr}.` : 'No PNR in the address.'} Pick one above.
            </p>
          </main>
        )}
      </div>
    </div>
  )
}
