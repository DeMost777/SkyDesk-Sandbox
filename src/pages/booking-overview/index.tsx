import * as React from 'react'
import { AppSidebar } from '@/components/skydesk/app-sidebar'
import { BookingHeader } from '@/components/skydesk/booking-header'
import { OverviewWidget } from '@/components/skydesk/overview-widget'
import type { EntityRef } from '@/lib/booking'
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
  // SANDBOX-ONLY: the Pricing and Ticket widgets do not exist yet, so a click only leaves a note
  const [opened, setOpened] = React.useState<EntityRef | null>(null)

  return (
    <div className="flex h-full bg-background">
      <AppSidebar history={history} user={MOCK_USER} />

      <div className="flex min-w-0 flex-1 flex-col">
        <SandboxBar pnr={params.pnr} persona={params.persona} />

        {booking ? (
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
              <OverviewWidget booking={booking} onOpen={setOpened} />
              {opened && (
                <p role="status" className="px-4 pb-4 text-center text-xs text-muted-foreground">
                  Sandbox: would open {opened.type} {opened.id} — its widget is not built yet.
                </p>
              )}
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
