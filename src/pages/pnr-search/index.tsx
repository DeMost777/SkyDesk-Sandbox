import * as React from 'react'
import { ArrowUp, Info, AlertCircle } from 'lucide-react'
import {
  GDS_OPTIONS,
  SCENARIO_PNR_MAP,
  type GDS,
} from '@/mocks/pnr-search.mock'
import { OfficeSelector } from '@/components/ui/office-selector'
import { MOCK_OFFICES, type OfficeSelection } from '@/mocks/offices.mock'

type UIState = 'default' | 'typing' | 'loading' | 'select-gds' | 'not-found' | 'error'

const SANDBOX_STATES: { value: UIState; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'typing', label: 'Ready (Type4)' },
  { value: 'loading', label: 'Loading' },
  { value: 'select-gds', label: 'Select GDS' },
  { value: 'not-found', label: 'Not Found' },
  { value: 'error', label: 'Error' },
]

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

export default function PnrSearchPage() {
  const [pnr, setPnr] = React.useState('')
  const [state, setState] = React.useState<UIState>('default')
  const [forcedState, setForcedState] = React.useState<UIState | null>(null)
  const [selectedOffice, setSelectedOffice] = React.useState<OfficeSelection | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const active = forcedState ?? state
  const hasActiveRing = active === 'loading' || active === 'select-gds'
  const displayValue = forcedState && forcedState !== 'default' ? (pnr || '7JRWT4') : pnr

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPnr(val)
    setForcedState(null)
    setState(val.trim() ? 'typing' : 'default')
  }

  const handleSubmit = () => {
    if ((!pnr.trim() && !forcedState) || active === 'loading') return
    setState('loading')
    setForcedState(null)
    const pnrKey = (pnr || '7JRWT4').toUpperCase()
    setTimeout(() => {
      setState((SCENARIO_PNR_MAP[pnrKey] as UIState) ?? 'not-found')
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const handleGdsSelect = (gds: GDS) => {
    // In real app: open booking in selected GDS context
    alert(`Opening booking in ${gds.charAt(0).toUpperCase() + gds.slice(1)}`)
  }

  const forceState = (s: UIState) => {
    setForcedState(s)
    if (s === 'default') setPnr('')
    else setPnr('7JRWT4')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sandbox state switcher */}
      <div className="border-b border-border bg-[#fafaf9] px-4 py-2 flex items-center gap-2 flex-wrap shrink-0">
        <span className="text-xs text-muted-foreground font-medium shrink-0">Sandbox:</span>
        {SANDBOX_STATES.map((s) => (
          <button
            key={s.value}
            onClick={() => forceState(s.value)}
            className={[
              'rounded px-2 py-0.5 text-xs font-medium transition-colors',
              active === s.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-border text-foreground hover:bg-accent',
            ].join(' ')}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main page */}
      <div className="flex-1 flex justify-center pt-[140px] px-6">
        <div className="flex flex-col items-center gap-8 w-full max-w-[838px]">

          {/* Heading — Figma: 30px, weight 500, tracking -0.4px */}
          <h1 className="text-[30px] font-medium leading-8 tracking-[-0.4px] text-foreground text-center w-full">
            How can I help with your reservation today?
          </h1>

          {/* Search widget */}
          <div
            className={[
              'w-full bg-[#fafaf9] rounded-[16px] drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.05)] flex flex-col',
              hasActiveRing ? 'border-2 border-primary' : '',
            ].join(' ')}
          >
            {/* Inner card — always has 1px stone-200 border */}
            <div className="border border-border rounded-[16px] flex flex-col gap-1 pl-4 pr-2 py-2 w-full">

              {/* Row 1: Text input */}
              <div className="flex items-center h-10 pr-3 py-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={displayValue}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a PNR number to find a reservation"
                  disabled={active === 'loading'}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none p-0 text-sm font-normal leading-5 text-foreground placeholder:text-muted-foreground disabled:cursor-default"
                />
              </div>

              {/* Row 2: Office combobox + Submit button */}
              <div className="flex items-center justify-between">

                {/* Office selector */}
                <OfficeSelector
                  offices={MOCK_OFFICES}
                  value={selectedOffice}
                  onChange={setSelectedOffice}
                  disabled={active === 'loading'}
                />

                {/* Submit button — 40×40, rounded-[12px], teal */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={active === 'loading'}
                  aria-label="Search booking"
                  className="bg-primary flex items-center justify-center h-10 w-10 rounded-[12px] shrink-0 hover:bg-primary/90 transition-colors disabled:cursor-default"
                >
                  <ArrowUp className="size-4 text-primary-foreground" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Footer: Loading */}
            {active === 'loading' && (
              <div className="flex items-center px-3 py-2">
                <div className="flex items-center gap-2">
                  <BrailleLoader />
                  <span className="text-sm leading-5 bg-gradient-to-r from-[#78716c] to-[#e5e5e5] bg-clip-text text-transparent whitespace-nowrap">
                    Loading...
                  </span>
                </div>
              </div>
            )}

            {/* Footer: Select GDS */}
            {active === 'select-gds' && (
              <div className="flex items-center gap-4 px-3 py-2">
                <div className="flex items-center gap-2 shrink-0">
                  {GDS_OPTIONS.map((gds) => (
                    <button
                      key={gds.id}
                      type="button"
                      onClick={() => handleGdsSelect(gds.id)}
                      className="bg-[#fafaf9] border border-border rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors whitespace-nowrap"
                    >
                      {gds.label}
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
            )}

            {/* Footer: Not Found */}
            {active === 'not-found' && (
              <div className="flex items-center gap-2 px-3 py-2">
                <Info className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground leading-5">
                  Booking not found. Check the PNR and try again.
                </p>
              </div>
            )}

            {/* Footer: Error */}
            {active === 'error' && (
              <div className="flex items-center gap-2 px-3 py-2">
                <AlertCircle className="size-4 text-destructive shrink-0" strokeWidth={1.5} />
                <p className="text-sm text-destructive leading-5">
                  Something went wrong. Please try again.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
