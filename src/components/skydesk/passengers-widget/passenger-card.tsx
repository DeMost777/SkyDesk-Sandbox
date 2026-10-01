import * as React from 'react'
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react'
import { RefBadge } from '@/components/skydesk/matrix-table'
import type { Passenger } from '@/lib/booking'
import {
  displayName,
  displayTitle,
  frequentFlyersOf,
  passengerIndicators,
  passengerTooltip,
  personalInformation,
} from '@/lib/passenger'
import { cn } from '@/lib/utils'

// One passenger: name, type and what data is entered; expands to the personal information and the loyalty cards.
// Spec and Figma (Sky Desk Console - Design): projects/booking-overview/passengers-widget.md, node 15:10384 / 1347:120017.

export interface PassengerCardProps {
  passenger: Passenger
  /** Expanded at first. Cards open and close independently. */
  defaultOpen?: boolean
  className?: string
}

const Divider = () => <span aria-hidden className="h-4 w-px shrink-0 bg-border" />

export function PassengerCard({ passenger, defaultOpen = false, className }: PassengerCardProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const id = React.useId()
  const title = displayTitle(passenger)
  const indicators = passengerIndicators(passenger)
  const flyers = frequentFlyersOf(passenger)
  const Chevron = open ? ChevronUp : ChevronDown

  return (
    <li className={cn('flex flex-col gap-2 overflow-clip rounded-xl border border-border bg-card px-4 py-3 shadow-small', className)}>
      {/* The whole top row is the button (screenshot and recording of 2026-10-01); the cursor is its only hover cue */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-details`}
        aria-labelledby={`${id}-name`}
        aria-describedby={`${id}-indicators`}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-4 rounded-md text-left focus-visible:outline-none focus-visible:shadow-focus-ring"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span id={`${id}-name`} className="flex items-start gap-2">
            <RefBadge tone="passenger" tooltip={passengerTooltip(passenger.ref)}>
              {passenger.ref}
            </RefBadge>
            <span className="min-w-0 text-sm leading-5 [overflow-wrap:anywhere]">
              {displayName(passenger)}
              {/* a real space, not a margin: the accessible name reads "Anna Maria Ms", not "MariaMs" */}
              {title && <>{' '}<span className="text-muted-foreground">{title}</span></>}
            </span>
          </span>
          <span id={`${id}-indicators`} className="flex flex-wrap items-center gap-2 text-xs leading-4 text-muted-foreground">
            <span>{passenger.type}</span>
            {indicators.map((indicator) => (
              <React.Fragment key={indicator.id}>
                <Divider />
                <span className="flex items-center gap-1">
                  {indicator.present ? (
                    <Check aria-hidden className="size-3.5 text-success" />
                  ) : (
                    <X aria-hidden className="size-3.5" />
                  )}
                  {/* ✓ and ✗ are pictures: say it in words too */}
                  <span className="sr-only">{indicator.present ? 'Entered: ' : 'Missing: '}</span>
                  {indicator.label}
                </span>
              </React.Fragment>
            ))}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs leading-4 text-muted-foreground">
          {open ? 'Show less' : 'Show more'}
          {/* 28×28: Figma "Button Icon" */}
          <span aria-hidden className="flex size-7 items-center justify-center">
            <Chevron className="size-4" />
          </span>
        </span>
      </button>

      {/* hidden, not unmounted: the content stays in the DOM when the card is closed.
          The `hidden` attribute alone loses to `flex`, so the class hides it too. */}
      <div id={`${id}-details`} hidden={!open} className={cn('flex-col gap-2', open ? 'flex' : 'hidden')}>
        <hr className="border-dashed border-border" />
        <dl className="grid grid-cols-2 gap-x-2 gap-y-2 sm:grid-cols-3">
          {personalInformation(passenger).map((field) => (
            <div key={field.label} className="min-w-0">
              <dt className="text-sm leading-5 text-muted-foreground">{field.label}</dt>
              <dd className="font-mono text-sm uppercase leading-5 [overflow-wrap:anywhere]">{field.value}</dd>
            </div>
          ))}
        </dl>
        {flyers.length > 0 && (
          <>
            <hr className="border-dashed border-border" />
            <div>
              <p className="text-sm leading-5 text-muted-foreground">Frequent flyer</p>
              <ul className="flex flex-wrap items-center gap-y-1">
                {flyers.map((flyer, index) => (
                  <li
                    key={`${flyer.airline}-${flyer.number}`}
                    className={cn(
                      'flex items-center gap-0.5 whitespace-nowrap font-mono text-sm uppercase leading-5',
                      index > 0 && 'ml-2 border-l border-border pl-2',
                    )}
                  >
                    <span>{flyer.number}</span>
                    <span className="text-muted-foreground">({flyer.airline})</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </li>
  )
}
