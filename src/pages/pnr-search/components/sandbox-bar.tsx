// SANDBOX-ONLY: jumps to every state by its address, switches persona, resets demo data.
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { navigate } from '@/hooks/use-sandbox-url'
import type { SandboxParams } from '@/lib/sandbox-url'
import { SCENARIO_PNRS } from '@/mocks/pnr-search.mock'
import { PERSONAS, type PersonaId } from '@/mocks/personas.mock'

export type DisplayState =
  | 'default'
  | 'typing'
  | 'loading'
  | 'gds-required'
  | 'found'
  | 'not-found'
  | 'error'

/** Each state's address. The result states are produced by the real search on mocks. */
const PRESETS: { state: DisplayState; label: string; params: Partial<SandboxParams> }[] = [
  { state: 'default', label: 'Default', params: {} },
  { state: 'typing', label: 'Ready', params: { pnr: SCENARIO_PNRS.known } },
  { state: 'loading', label: 'Loading', params: { pnr: SCENARIO_PNRS.known, state: 'loading' } },
  { state: 'gds-required', label: 'GDS Required', params: { pnr: SCENARIO_PNRS.unknown, state: 'result' } },
  { state: 'found', label: 'Found', params: { pnr: SCENARIO_PNRS.known, state: 'result' } },
  { state: 'not-found', label: 'Not Found', params: { pnr: SCENARIO_PNRS.notFound, state: 'result' } },
  { state: 'error', label: 'Error', params: { pnr: SCENARIO_PNRS.error, state: 'result' } },
]

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded px-2 py-0.5 text-xs font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-background border border-border text-foreground hover:bg-accent',
      )}
    >
      {children}
    </button>
  )
}

export function SandboxBar({
  active,
  current,
  persona,
  onResetDemoData,
}: {
  active: DisplayState
  /** Where the page is now; switching persona keeps it. */
  current: Partial<SandboxParams>
  persona: PersonaId
  onResetDemoData: () => void
}) {
  return (
    <div className="border-b border-border bg-muted px-4 py-2 flex items-center gap-x-4 gap-y-2 flex-wrap shrink-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">State:</span>
        {PRESETS.map((p) => (
          <Chip key={p.state} active={active === p.state} onClick={() => navigate({ ...p.params, persona })}>
            {p.label}
          </Chip>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Persona:</span>
        {PERSONAS.map((p) => (
          <Chip key={p.id} active={persona === p.id} onClick={() => navigate({ ...current, persona: p.id })}>
            {p.label}
          </Chip>
        ))}
        <button
          type="button"
          onClick={onResetDemoData}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Reset demo data
        </button>
      </div>
    </div>
  )
}
