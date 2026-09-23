import * as React from 'react'
import { Info, AlertCircle } from 'lucide-react'
import type { GDS, OfficeSource } from '@/lib/office'
import { allGdsTried, type SearchOutcome } from '@/lib/pnr-search'

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

/** GDS buttons + hint. GDS already searched stay in place but are disabled. */
function GdsChoice({
  message,
  tried = [],
  onSelect,
}: {
  message: string
  tried?: GDS[]
  onSelect: (gds: GDS) => void
}) {
  return (
    <div className="flex items-center gap-4 px-3 py-2">
      <div className="flex items-center gap-2 shrink-0">
        {SELECT_GDS_ORDER.map((gds) => {
          const wasTried = tried.includes(gds)
          return (
            <button
              key={gds}
              type="button"
              onClick={() => onSelect(gds)}
              disabled={wasTried}
              title={wasTried ? `Not found in ${gds}` : undefined}
              className="bg-[#fafaf9] border border-border rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              {gds}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Info className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} aria-hidden />
        <p className="text-sm text-muted-foreground leading-5">{message}</p>
      </div>
    </div>
  )
}

export function GdsRequiredFooter({ onSelect }: { onSelect: (gds: GDS) => void }) {
  return (
    <GdsChoice
      message="To continue the search, please select the GDS where this PNR was created."
      onSelect={onSelect}
    />
  )
}

function NotFoundNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Info className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} aria-hidden />
      <p className="text-sm text-muted-foreground leading-5">{children}</p>
    </div>
  )
}

/** "Amadeus", "Amadeus or Sabre" */
const orList = (items: string[]) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`

/**
 * Not Found depends on where the GDS came from:
 * - an Office → only another Office (or no Office) can change the GDS;
 * - picked / known → offer the GDS not searched yet; when none is left, only the PNR can be wrong.
 */
export function NotFoundFooter({
  outcome,
  onSelect,
}: {
  outcome: Extract<SearchOutcome, { status: 'not-found' }>
  onSelect: (gds: GDS) => void
}) {
  const { pnr, gds, gdsSource, office, tried } = outcome

  if (gdsSource === 'office' && office) {
    return (
      <NotFoundNote>
        PNR {pnr} not found in {gds} · {office.code}. Choose another office or clear the office.
      </NotFoundNote>
    )
  }

  if (allGdsTried(tried)) {
    return <NotFoundNote>PNR {pnr} not found in any GDS. Check the PNR.</NotFoundNote>
  }

  return (
    <GdsChoice
      message={`PNR ${pnr} not found in ${orList(tried)}. Select another GDS or check the PNR.`}
      tried={tried}
      onSelect={onSelect}
    />
  )
}

function ErrorNote({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
      <AlertCircle className="size-4 text-destructive shrink-0" strokeWidth={1.5} aria-hidden />
      <p className="text-sm text-destructive leading-5" role="alert">
        {children}
      </p>
      {action}
    </div>
  )
}

function ErrorAction({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm leading-5 text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
    >
      {children}
    </button>
  )
}

/** Search clicked with an empty field. The search button stays enabled on purpose (user rule). */
export function PnrRequiredFooter() {
  return <ErrorNote>Please provide the PNR.</ErrorNote>
}

/**
 * Error depends on the reason:
 * - the GDS failed → the same search can succeed later: "Try again";
 * - the Office has no access → only another Office helps: "Choose another office".
 */
export function ErrorFooter({
  outcome,
  onRetry,
  onChooseOffice,
}: {
  outcome: Extract<SearchOutcome, { status: 'error' }>
  onRetry: () => void
  onChooseOffice: () => void
}) {
  if (outcome.reason === 'access-denied' && outcome.office) {
    return (
      <ErrorNote action={<ErrorAction onClick={onChooseOffice}>Choose another office</ErrorAction>}>
        Office {outcome.office.code} has no access to PNR {outcome.pnr}.
      </ErrorNote>
    )
  }
  return (
    <ErrorNote action={<ErrorAction onClick={onRetry}>Try again</ErrorAction>}>
      Something went wrong. Please try again.
    </ErrorNote>
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
