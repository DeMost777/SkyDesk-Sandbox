import * as React from 'react'
import { OfficeSelector } from '@/components/ui/office-selector'
import { MOCK_OFFICES, type OfficeSelection } from '@/mocks/offices.mock'

function StateCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="flex items-start">{children}</div>
    </div>
  )
}

export default function OfficeSelectorShowcase() {
  const [selected, setSelected] = React.useState<OfficeSelection | null>(null)

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-border bg-[#fafaf9] px-6 py-3">
        <h2 className="text-sm font-medium text-foreground">Office Selector — All States</h2>
      </div>

      <div className="px-8 py-10">
        <div className="grid grid-cols-2 gap-x-16 gap-y-10 max-w-3xl">

          {/* 1. Default */}
          <StateCard label="1 · Default">
            <OfficeSelector offices={MOCK_OFFICES} value={null} onChange={() => {}} />
          </StateCard>

          {/* 2. Selected */}
          <StateCard label="2 · Selected">
            <OfficeSelector
              offices={MOCK_OFFICES}
              value={{ code: '5GW5', gds: 'Sabre' }}
              onChange={() => {}}
            />
          </StateCard>

          {/* 3. Interactive (live) */}
          <StateCard label="3 · Interactive">
            <OfficeSelector
              offices={MOCK_OFFICES}
              value={selected}
              onChange={setSelected}
              onManageDefaults={() => alert('Manage default offices')}
            />
          </StateCard>

          {/* 4. Open (hint — user clicks to see) */}
          <StateCard label="4 · Open (click to see)">
            <_ForceOpen offices={MOCK_OFFICES} />
          </StateCard>

          {/* 5. Loading */}
          <StateCard label="5 · Loading">
            <OfficeSelector offices={[]} loading value={null} onChange={() => {}} />
          </StateCard>

          {/* 6. Error */}
          <StateCard label="6 · Error">
            <OfficeSelector offices={[]} error value={null} onChange={() => {}} />
          </StateCard>

          {/* 7. No results (search with no match) */}
          <StateCard label="7 · No Results (click, search 'ZZZ')">
            <OfficeSelector offices={MOCK_OFFICES} value={null} onChange={() => {}} />
          </StateCard>

          {/* 8. Disabled (no value) */}
          <StateCard label="8 · Disabled">
            <OfficeSelector offices={MOCK_OFFICES} value={null} onChange={() => {}} disabled />
          </StateCard>

          {/* 9. Disabled (with value) */}
          <StateCard label="9 · Disabled + Selected">
            <OfficeSelector
              offices={MOCK_OFFICES}
              value={{ code: 'A2K9', gds: 'Amadeus' }}
              onChange={() => {}}
              disabled
            />
          </StateCard>
        </div>
      </div>
    </div>
  )
}

// Helper: renders the selector already open for the showcase
function _ForceOpen({ offices }: { offices: typeof MOCK_OFFICES }) {
  const [val, setVal] = React.useState<OfficeSelection | null>(null)
  return (
    <div className="relative">
      <OfficeSelector offices={offices} value={val} onChange={setVal} />
      <p className="mt-2 text-[11px] text-muted-foreground">Click trigger to open dropdown</p>
    </div>
  )
}
