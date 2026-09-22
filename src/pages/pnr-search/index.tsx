import * as React from 'react'
import { Search, Loader2, AlertCircle, ServerCrash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  GDS_OPTIONS,
  SCENARIO_PNR_MAP,
  type SearchScenario,
  type GDS,
} from '@/mocks/pnr-search.mock'

// Sandbox state switcher — only visible in dev
const SCENARIOS: { value: SearchScenario; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'ready', label: 'Ready' },
  { value: 'loading', label: 'Loading' },
  { value: 'select-gds', label: 'Select GDS' },
  { value: 'not-found', label: 'Not Found' },
  { value: 'error', label: 'Error' },
]

export default function PnrSearchPage() {
  const [pnr, setPnr] = React.useState('')
  const [scenario, setScenario] = React.useState<SearchScenario>('default')
  const [forcedScenario, setForcedScenario] = React.useState<SearchScenario | null>(null)

  const handleSearch = () => {
    if (!pnr.trim()) return
    const mapped = SCENARIO_PNR_MAP[pnr.toUpperCase()]
    if (mapped) {
      setScenario('loading')
      setTimeout(() => setScenario(mapped), 1200)
    } else {
      setScenario('loading')
      setTimeout(() => setScenario('not-found'), 1200)
    }
  }

  const handlePnrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPnr(val)
    if (val.trim()) {
      setScenario('ready')
    } else {
      setScenario('default')
    }
    setForcedScenario(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleGdsSelect = (_gds: GDS) => {
    // In real app: navigate to booking with selected GDS context
    alert(`Opening booking in ${_gds.toUpperCase()}`)
  }

  const handleReset = () => {
    setPnr('')
    setScenario('default')
    setForcedScenario(null)
  }

  const displayScenario = forcedScenario ?? scenario

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sandbox state switcher */}
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium shrink-0">Sandbox:</span>
        {SCENARIOS.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              setForcedScenario(s.value)
              if (s.value === 'ready') setPnr('ABC123')
              if (s.value === 'default') setPnr('')
            }}
            className={[
              'rounded px-2 py-0.5 text-xs font-medium transition-colors',
              displayScenario === s.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-background border border-border text-foreground hover:bg-accent',
            ].join(' ')}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Brand */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Skydesk</h1>
            <p className="text-sm text-muted-foreground">Travel agent workspace</p>
          </div>

          {/* Search card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="pnr-input" className="text-sm font-medium text-foreground">
                Booking reference (PNR)
              </label>
              <div className="flex gap-2">
                <Input
                  id="pnr-input"
                  placeholder="e.g. ABC123"
                  value={pnr}
                  onChange={handlePnrChange}
                  onKeyDown={handleKeyDown}
                  className="font-mono uppercase tracking-widest"
                  disabled={displayScenario === 'loading'}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <Button
                  onClick={handleSearch}
                  disabled={!pnr.trim() || displayScenario === 'loading'}
                  size="icon"
                  aria-label="Search"
                >
                  {displayScenario === 'loading' ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Search />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Try: <code className="bg-muted px-1 rounded text-foreground">ABC123</code> (multi-GDS) ·{' '}
                <code className="bg-muted px-1 rounded text-foreground">XYZ789</code> (not found) ·{' '}
                <code className="bg-muted px-1 rounded text-foreground">ERR000</code> (error)
              </p>
            </div>

            {/* State panels */}
            <StatePanel
              scenario={displayScenario}
              onGdsSelect={handleGdsSelect}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatePanelProps {
  scenario: SearchScenario
  onGdsSelect: (gds: GDS) => void
  onReset: () => void
}

function StatePanel({ scenario, onGdsSelect, onReset }: StatePanelProps) {
  if (scenario === 'default' || scenario === 'ready') return null

  if (scenario === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-muted-foreground">
        <BrailleLoader />
        <span className="text-sm">Looking up booking…</span>
      </div>
    )
  }

  if (scenario === 'select-gds') {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Select booking system</p>
          <p className="text-xs text-muted-foreground">
            This PNR was found in multiple GDS. Choose where to open it.
          </p>
        </div>
        <div className="space-y-2">
          {GDS_OPTIONS.map((gds) => (
            <button
              key={gds.id}
              onClick={() => onGdsSelect(gds.id)}
              className="w-full flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-accent hover:border-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{gds.label}</p>
                <p className="text-xs text-muted-foreground">{gds.description}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0 ml-3">
                Open
              </Badge>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (scenario === 'not-found') {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">Booking not found</p>
          <p className="text-xs text-muted-foreground">
            Check the PNR and try again, or contact support.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="mt-1">
          Try another PNR
        </Button>
      </div>
    )
  }

  if (scenario === 'error') {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <ServerCrash className="h-8 w-8 text-destructive/70" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">Something went wrong</p>
          <p className="text-xs text-muted-foreground">
            Unable to reach the booking system. Please try again.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="mt-1">
          Retry
        </Button>
      </div>
    )
  }

  return null
}

// Braille loading animation — 6 dots cycling through Unicode braille patterns
const BRAILLE_FRAMES = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']

function BrailleLoader() {
  const [frame, setFrame] = React.useState(0)

  React.useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % BRAILLE_FRAMES.length), 80)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="text-2xl leading-none select-none" aria-hidden>
      {BRAILLE_FRAMES[frame]}
    </span>
  )
}
