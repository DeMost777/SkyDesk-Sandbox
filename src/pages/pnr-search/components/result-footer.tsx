import * as React from 'react'
import { Info, AlertCircle } from 'lucide-react'
import type { GDS, OfficeSource } from '@/lib/office'
import type { SearchOutcome } from '@/lib/pnr-search'

const BRAILLE_FRAMES = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']

function BrailleLoader() {
  const [frame, setFrame] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % BRAILLE_FRAMES.length), 80)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="text-base leading-none select-none text-muted-foreground" aria-hidden>
      {BRAILLE_FRAMES[frame]}
    </span>
  )
}

export function LoadingFooter() {
  return (
    <div className="flex items-center px-3 py-2">
      <div className="flex items-center gap-2">
        <BrailleLoader />
        <span className="text-sm leading-5 bg-gradient-to-r from-[#78716c] to-[#e5e5e5] bg-clip-text text-transparent whitespace-nowrap">
          Loading...
        </span>
      </div>
    </div>
  )
}

/** Button order as in Figma. */
const SELECT_GDS_ORDER: GDS[] = ['Amadeus', 'Sabre', 'Galileo']

export function GdsRequiredFooter({ onSelect }: { onSelect: (gds: GDS) => void }) {
  return (
    <div className="flex items-center gap-4 px-3 py-2">
      <div className="flex items-center gap-2 shrink-0">
        {SELECT_GDS_ORDER.map((gds) => (
          <button
            key={gds}
            type="button"
            onClick={() => onSelect(gds)}
            className="bg-[#fafaf9] border border-border rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors whitespace-nowrap"
          >
            {gds}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Info className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground leading-5">
          To continue the search, please select the GDS where this PNR was created.
        </p>
      </div>
    </div>
  )
}

export function NotFoundFooter() {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Info className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground leading-5">
        Booking not found. Check the PNR and try again.
      </p>
    </div>
  )
}

export function ErrorFooter() {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <AlertCircle className="size-4 text-destructive shrink-0" strokeWidth={1.5} />
      <p className="text-sm text-destructive leading-5">
        Something went wrong. Please try again.
      </p>
    </div>
  )
}

const SOURCE_COPY: Record<OfficeSource, (gds: GDS) => string> = {
  selected: () => 'Office you selected',
  default: (gds) => `Your default office for ${gds}`,
  creation: (gds) => `Creation office. You have no default office for ${gds}.`,
}

// No Figma frame yet — placeholder that makes the Office rule visible. See docs/open-questions.md.
export function FoundFooter({
  outcome,
  offerDefault,
  isDefault,
  onToggleDefault,
}: {
  outcome: Extract<SearchOutcome, { status: 'found' }>
  /** Show "Use this as my default office" — only after a manual Office choice. */
  offerDefault: boolean
  isDefault: boolean
  onToggleDefault: (checked: boolean) => void
}) {
  const { booking, resolved } = outcome
  const { gds, code } = resolved.office
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2 flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        <Info className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} aria-hidden />
        <p className="text-sm leading-5 text-foreground">
          Opening <span className="font-medium">{booking.pnr}</span> in {gds} · {code}
        </p>
        <span className="text-sm leading-5 text-muted-foreground">{SOURCE_COPY[resolved.source](gds)}</span>
      </div>
      {offerDefault && (
        <label className="flex items-center gap-2 text-sm leading-5 text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => onToggleDefault(e.target.checked)}
            className="size-4 accent-primary"
          />
          Use this as my default office for {gds}
        </label>
      )}
    </div>
  )
}
