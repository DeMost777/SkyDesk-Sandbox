import * as React from 'react'
import { ArrowUp } from 'lucide-react'
import { OfficeSelector } from '@/components/ui/office-selector'
import { useDefaultOffices } from '@/hooks/use-default-offices'
import { replaceUrl } from '@/hooks/use-sandbox-url'
import { withDefaultFlags, type DefaultOffices, type GDS, type OfficeSelection } from '@/lib/office'
import { searchPnr, type SearchOutcome } from '@/lib/pnr-search'
import type { SandboxParams, SearchView } from '@/lib/sandbox-url'
import { MOCK_OFFICES } from '@/mocks/offices.mock'
import { mockPnrDirectory } from '@/mocks/pnr-search.mock'
import { toPersonaId } from '@/mocks/personas.mock'
import { SandboxBar, type DisplayState } from './components/sandbox-bar'
import {
  ErrorFooter,
  FoundFooter,
  LoadingFooter,
  NotFoundFooter,
  GdsRequiredFooter,
} from './components/result-footer'

const SEARCH_DELAY_MS = 1500

function officeByCode(code: string | null): OfficeSelection | null {
  const office = MOCK_OFFICES.find((o) => o.code === code)
  return office ? { code: office.code, gds: office.gds } : null
}

interface Result {
  outcome: SearchOutcome
  /** The Default Office for the found GDS before this search — decides whether to offer saving. */
  defaultBefore: string | undefined
}

function search(pnr: string, selected: OfficeSelection | null, gds: GDS | null, defaults: DefaultOffices): Result {
  const outcome = searchPnr({ pnr, selected, gds, defaults }, mockPnrDirectory)
  const defaultBefore = outcome.status === 'found' ? defaults[outcome.booking.gds] : undefined
  return { outcome, defaultBefore }
}

function displayState(view: SearchView, pnr: string, result: Result | null): DisplayState {
  if (view === 'loading') return 'loading'
  if (view === 'result' && result) return result.outcome.status
  return pnr ? 'typing' : 'default'
}

/** Initial state is read from the URL (see APPLICATION.md), so every state has an address. */
export default function PnrSearchPage({ params }: { params: SandboxParams }) {
  const persona = toPersonaId(params.persona)
  const { defaults, setDefault, reset } = useDefaultOffices(persona)

  const [pnr, setPnr] = React.useState(params.pnr)
  const [selectedOffice, setSelectedOffice] = React.useState(() => officeByCode(params.office))
  const [pickedGds, setPickedGds] = React.useState<GDS | null>(params.gds)
  const [view, setView] = React.useState<SearchView>(params.pnr ? params.state : 'idle')
  // ?state=result opens straight on the search outcome.
  const [result, setResult] = React.useState<Result | null>(() =>
    view === 'result' ? search(params.pnr, selectedOffice, params.gds, defaults) : null,
  )
  const timer = React.useRef<number>()

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  // Keep the URL equal to what is on screen, so any moment can be shared as a link.
  React.useEffect(() => {
    replaceUrl({
      persona: params.persona,
      pnr,
      office: selectedOffice?.code ?? null,
      gds: pickedGds,
      state: view,
    })
  }, [params.persona, pnr, selectedOffice, pickedGds, view])

  const startSearch = (gds: GDS | null) => {
    if (!pnr.trim() || view === 'loading') return
    setPickedGds(gds)
    setView('loading')
    setResult(null)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setResult(search(pnr, selectedOffice, gds, defaults))
      setView('result')
    }, SEARCH_DELAY_MS)
  }

  const resetToIdle = () => {
    setView('idle')
    setResult(null)
    setPickedGds(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPnr(e.target.value.toUpperCase())
    resetToIdle()
  }

  const handleOfficeChange = (office: OfficeSelection | null) => {
    setSelectedOffice(office)
    resetToIdle()
  }

  const handleResetDemoData = () => {
    reset()
    resetToIdle()
  }

  const active = displayState(view, pnr, result)
  const hasActiveRing = active === 'loading' || active === 'gds-required'
  const outcome = result?.outcome

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SandboxBar
        active={active}
        current={{ pnr, office: selectedOffice?.code ?? null, gds: pickedGds, state: view }}
        persona={persona}
        onResetDemoData={handleResetDemoData}
      />

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
                  type="text"
                  value={pnr}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === 'Enter' && startSearch(null)}
                  placeholder="Enter a PNR number to find a reservation"
                  aria-label="PNR"
                  disabled={active === 'loading'}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none p-0 text-sm font-normal leading-5 text-foreground placeholder:text-muted-foreground disabled:cursor-default"
                />
              </div>

              {/* Row 2: Office combobox + Submit button */}
              <div className="flex items-center justify-between">
                <OfficeSelector
                  offices={withDefaultFlags(MOCK_OFFICES, defaults)}
                  value={selectedOffice}
                  onChange={handleOfficeChange}
                  disabled={active === 'loading'}
                />

                {/* Submit button — 40×40, rounded-[12px], teal */}
                <button
                  type="button"
                  onClick={() => startSearch(null)}
                  disabled={active === 'loading'}
                  aria-label="Search booking"
                  className="bg-primary flex items-center justify-center h-10 w-10 rounded-[12px] shrink-0 hover:bg-primary/90 transition-colors disabled:cursor-default"
                >
                  <ArrowUp className="size-4 text-primary-foreground" strokeWidth={2} />
                </button>
              </div>
            </div>

            {active === 'loading' && <LoadingFooter />}
            {active === 'gds-required' && <GdsRequiredFooter onSelect={startSearch} />}
            {active === 'not-found' && <NotFoundFooter />}
            {active === 'error' && <ErrorFooter />}
            {outcome?.status === 'found' && (
              <FoundFooter
                outcome={outcome}
                offerDefault={
                  outcome.resolved.source === 'selected' &&
                  result?.defaultBefore !== outcome.resolved.office.code
                }
                isDefault={defaults[outcome.resolved.office.gds] === outcome.resolved.office.code}
                onToggleDefault={(checked) =>
                  setDefault(
                    outcome.resolved.office.gds,
                    checked ? outcome.resolved.office.code : result?.defaultBefore ?? null,
                  )
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
