import { SquareArrowOutUpRight, Ticket, Timer } from 'lucide-react'
import type { EntityRef } from '@/lib/booking'
import { documentRef, statusBadge, type OverviewDocument } from '@/lib/overview-matrix'
import { cn } from '@/lib/utils'

// One Pricing or Ticket in a cell. Figma 7851:67417 (states Default / Hover, Focus 8013:11314).
// EXPERIMENTAL: not approved by the team, so there are no stories yet (projects/booking-overview/overview-widget.md).
//
// The whole card is one button that opens the entity itself. Hover — and Pressed, which looks the same —
// covers the card with "See widget". Focus (keyboard) draws the ring instead and keeps the content visible.

const CARD =
  'group relative flex w-full min-w-[156px] overflow-clip rounded border-l-2 bg-document px-2.5 py-1 text-left shadow-small focus-visible:outline-none focus-visible:shadow-focus-ring'

/** A status badge; nothing for Active — the default state has no badge. */
function StatusBadge({ document }: { document: OverviewDocument }) {
  const status = statusBadge(document)
  if (!status) return null
  return (
    <span className="shrink-0 rounded border border-border bg-document-muted px-1 py-0.5 font-mono text-xs leading-4 text-muted-foreground">
      {status}
    </span>
  )
}

/** Covers the card, left line included (Figma: inset −2px on the left). Shown on hover and press only. */
function SeeWidget() {
  return (
    <span
      aria-hidden
      className="absolute inset-y-0 -left-0.5 right-0 hidden items-center justify-center gap-2 bg-document-muted text-sm leading-5 text-foreground group-hover:flex group-active:flex"
    >
      See widget
      <SquareArrowOutUpRight className="size-4" />
    </span>
  )
}

export function DocumentCard({ document, onOpen }: { document: OverviewDocument; onOpen?: (ref: EntityRef) => void }) {
  const open = () => onOpen?.(documentRef(document))

  if (document.type === 'pricing') {
    return (
      <button type="button" onClick={open} className={cn(CARD, 'items-center gap-1.5 border-pricing-accent')}>
        <Timer aria-hidden className="size-4 shrink-0 text-pricing-foreground" />
        <span className="flex-1 text-sm leading-5 text-pricing-foreground">Pricing</span>
        <StatusBadge document={document} />
        <SeeWidget />
      </button>
    )
  }

  return (
    <button type="button" onClick={open} className={cn(CARD, 'flex-col border-ticket-accent')}>
      <span className="flex min-h-[22px] w-full items-center gap-1.5">
        <Ticket aria-hidden className="size-4 shrink-0 text-icon" />
        <span className="flex-1 text-sm leading-5">Ticket</span>
        <StatusBadge document={document} />
      </span>
      <span className="font-mono text-sm uppercase leading-5 text-muted-foreground">{document.number}</span>
      <SeeWidget />
    </button>
  )
}

/** A cell with no visible Pricing or Ticket. Not an error: an explicit empty state (spec V1, §8). */
export function NoDocument() {
  return (
    <div className="rounded border border-border bg-document bg-hatch px-2.5 py-1 text-sm leading-5 text-muted-foreground">
      No document
    </div>
  )
}
