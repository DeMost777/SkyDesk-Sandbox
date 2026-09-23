// SANDBOX-ONLY: jumps to every state by its address, switches persona, resets demo data.
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { navigate } from '@/hooks/use-sandbox-url'
import type { SandboxParams } from '@/lib/sandbox-url'
import { NO_ACCESS_OFFICE, SCENARIO_PNRS } from '@/mocks/pnr-search.mock'
import { PERSONAS, type PersonaId } from '@/mocks/personas.mock'

export type DisplayState =
  | 'default'
  | 'typing'
  | 'pnr-required'
  | 'loading'
  | 'gds-required'
  | 'found'
  | 'not-found'
  | 'error'

/** A DisplayState, split further where one state has several variants worth reviewing. */
export type PresetId = DisplayState | 'not-found-all' | 'not-found-office' | 'error-access'

/** Each state's address. The result states are produced by the real search on mocks. */
const PRESETS: { id: PresetId; label: string; params: Partial<SandboxParams> }[] = [
  { id: 'default', label: 'Default', params: {} },
  { id: 'typing', label: 'Ready', params: { pnr: SCENARIO_PNRS.known } },
  { id: 'pnr-required', label: 'PNR Required', params: { state: 'result' } },
  { id: 'loading', label: 'Loading', params: { pnr: SCENARIO_PNRS.known, state: 'loading' } },
  { id: 'gds-required', label: 'GDS Required', params: { pnr: SCENARIO_PNRS.unknown, state: 'result' } },
  { id: 'found', label: 'Found', params: { pnr: SCENARIO_PNRS.known, state: 'result' } },
  { id: 'not-found', label: 'Not Found', params: { pnr: SCENARIO_PNRS.notFound, gds: 'Amadeus', state: 'result' } },
  {
    id: 'not-found-all',
    label: 'Not Found · all GDS',
    params: { pnr: SCENARIO_PNRS.notFound, tried: ['Amadeus', 'Sabre'], gds: 'Galileo', state: 'result' },
  },
  {
    id: 'not-found-office',
    label: 'Not Found · Office',
    params: { pnr: SCENARIO_PNRS.known, office: '5GW5', state: 'result' },
  },
  { id: 'error', label: 'Error', params: { pnr: SCENARIO_PNRS.error, state: 'result' } },
  {
    id: 'error-access',
    label: 'Error · Office access',
    params: { pnr: SCENARIO_PNRS.noAccess, office: NO_ACCESS_OFFICE, state: 'result' },
  },
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
          ? 'bg-foreground text-background' // sandbox chrome: dark active state (teal + white fails AA at 12px)
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
  active: PresetId
  /** Where the page is now; switching persona keeps it. */
  current: Partial<SandboxParams>
  persona: PersonaId
  onResetDemoData: () => void
}) {
  return (
    <aside
      aria-label="Sandbox controls"
      className="border-b border-border bg-muted px-4 py-2 flex items-center gap-x-4 gap-y-2 flex-wrap shrink-0"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">State:</span>
        {PRESETS.map((p) => (
          <Chip key={p.id} active={active === p.id} onClick={() => navigate({ ...p.params, persona })}>
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
    </aside>
  )
}
