import * as React from 'react'
import PnrSearchPage from '@/pages/pnr-search'
import OfficeSelectorShowcase from '@/pages/office-selector-showcase'

type Page = 'pnr-search' | 'office-selector'

const NAV_ITEMS: { value: Page; label: string }[] = [
  { value: 'pnr-search', label: 'PNR Search' },
  { value: 'office-selector', label: 'Office Selector' },
]

export default function App() {
  const [page, setPage] = React.useState<Page>('pnr-search')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <nav className="border-b border-border bg-white px-4 py-2 flex items-center gap-1 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground mr-3">Skydesk</span>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.value}
            onClick={() => setPage(item.value)}
            className={[
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              page === item.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex-1">
        {page === 'pnr-search' && <PnrSearchPage />}
        {page === 'office-selector' && <OfficeSelectorShowcase />}
      </div>
    </div>
  )
}
