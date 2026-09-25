import BookingPage from '@/pages/booking'
import PnrSearchPage from '@/pages/pnr-search'
import { navigate, useSandboxUrl } from '@/hooks/use-sandbox-url'
import type { SandboxPage } from '@/lib/sandbox-url'
import { cn } from '@/lib/utils'

// Booking opens by PNR; the nav link opens the booking from Figma (projects/booking-overview/README.md).
const NAV_ITEMS: { value: SandboxPage; label: string; pnr?: string }[] = [
  { value: 'pnr-search', label: 'PNR Search' },
  { value: 'booking', label: 'Booking', pnr: 'BBV14Q' },
]

// Storybook: served at /storybook/ on Vercel; `npm run storybook` locally.
const STORYBOOK_URL = import.meta.env.DEV ? 'http://localhost:6006' : '/storybook/'

export default function App() {
  const { params, navKey } = useSandboxUrl()
  const page = params.page

  return (
    <div className="h-screen flex flex-col">
      {/* Top nav */}
      <nav aria-label="Sandbox pages" className="border-b border-border bg-background px-4 py-2 flex items-center gap-1 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground mr-3">Skydesk</span>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.value}
            onClick={() => navigate({ page: item.value, persona: params.persona, pnr: item.pnr })}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              page === item.value
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
        <a
          href={STORYBOOK_URL}
          className="rounded px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          Storybook
        </a>
      </nav>

      <div className="flex-1 min-h-0">
        {/* navKey remounts the page so it re-reads its initial state from the URL */}
        {page === 'pnr-search' && <PnrSearchPage key={navKey} params={params} />}
        {page === 'booking' && <BookingPage key={navKey} params={params} />}
      </div>
    </div>
  )
}
