import { Users } from 'lucide-react'
import { WidgetSection } from '@/components/skydesk/widget-section'
import type { Booking } from '@/lib/booking'
import { PassengerCard } from './passenger-card'

// Passengers: who flies and how complete their data is. Spec: projects/booking-overview/passengers-widget.md.
// Figma (Sky Desk Console - Design) 121:15017, list 177:25464.

export interface PassengersWidgetProps {
  booking: Pick<Booking, 'passengers'>
  className?: string
}

export function PassengersWidget({ booking, className }: PassengersWidgetProps) {
  return (
    <WidgetSection title="Passengers" icon={Users} count={booking.passengers.length} className={className}>
      {/* 16px between cards: Figma "gap-4" in the list */}
      <ul aria-label="Passengers" className="flex flex-col gap-4">
        {booking.passengers.map((passenger) => (
          <PassengerCard key={passenger.ref} passenger={passenger} />
        ))}
      </ul>
    </WidgetSection>
  )
}

export { PassengerCard, type PassengerCardProps } from './passenger-card'
