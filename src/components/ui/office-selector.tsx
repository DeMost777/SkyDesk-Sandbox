import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Home, ChevronDown, Search, X, Settings, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sortOfficesForPicker, type Office, type OfficeSelection } from '@/lib/office'

export interface OfficeSelectorProps {
  /** Offices available to the agent, with `isDefault` set for their Default Offices. */
  offices?: Office[]
  /** Selected Office; null — nothing selected, Skydesk decides the Office itself. */
  value?: OfficeSelection | null
  /** Called with the picked Office, or null when the agent clears the selection. */
  onChange?: (value: OfficeSelection | null) => void
  disabled?: boolean
  /** Offices are loading: skeleton rows instead of the list. */
  loading?: boolean
  /** Offices failed to load: message and «Try again». */
  error?: boolean
  onManageDefaults?: () => void
  className?: string
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 rounded-sm">
      <div className="flex flex-col gap-1">
        <div className="h-3.5 w-10 rounded bg-border animate-pulse" />
        <div className="h-2.5 w-12 rounded bg-border animate-pulse opacity-60" />
      </div>
      <div className="h-3.5 w-12 rounded bg-border animate-pulse" />
    </div>
  )
}

export function OfficeSelector({
  offices = [],
  value,
  onChange,
  disabled,
  loading,
  error,
  onManageDefaults,
  className,
}: OfficeSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? offices.filter(
          (o) => o.code.toLowerCase().includes(q) || o.gds.toLowerCase().includes(q),
        )
      : offices
    return sortOfficesForPicker(list)
  }, [offices, query])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const handleSelect = (office: Office) => {
    onChange?.({ code: office.code, gds: office.gds })
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  const triggerLabel = value ? `${value.code} · ${value.gds}` : 'Select office'

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label="Select office"
          className={cn(
            'flex items-center gap-1 h-8 px-3 py-2 rounded-lg transition-colors',
            open ? 'bg-secondary' : 'hover:bg-accent',
            disabled && 'opacity-50 pointer-events-none',
            className,
          )}
        >
          <Home className="size-4 text-foreground shrink-0" strokeWidth={1.5} />
          <span className="text-sm text-foreground leading-5 whitespace-nowrap">{triggerLabel}</span>
          {value ? (
            <span
              className="flex items-center ml-2 rounded hover:bg-border transition-colors"
              onClick={handleClear}
              role="button"
              aria-label="Clear selection"
            >
              <X className="size-3.5 text-muted-foreground" strokeWidth={2} />
            </span>
          ) : (
            <span className="flex items-center ml-2">
              <ChevronDown
                className={cn(
                  'size-4 text-foreground opacity-50 transition-transform duration-150',
                  open && 'rotate-180',
                )}
                strokeWidth={1.5}
              />
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          aria-label="Select office"
          align="start"
          sideOffset={4}
          className={cn(
            // 220px width and 168px list height (below) are Figma layout sizes
            'z-50 w-[220px] rounded-md border border-border bg-popover p-px shadow-popover',
            'outline-none',
          )}
        >
          {/* Search header */}
          <div className="flex items-center h-11 px-3 border-b border-border gap-2">
            <Search className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search office"
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="size-3.5" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Content area */}
          <div className="p-1">
            {loading ? (
              <div className="flex flex-col gap-0.5">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-1.5 py-4 px-2">
                <AlertCircle className="size-4 text-destructive" strokeWidth={1.5} />
                <p className="text-xs text-destructive text-center">Couldn't load offices.</p>
                <button
                  type="button"
                  className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-1 py-4 px-2">
                <p className="text-xs text-foreground text-center">No offices found</p>
                <p className="text-xs text-muted-foreground text-center">Try a different search.</p>
              </div>
            ) : (
              <div
                className="max-h-[168px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
              >
                {filtered.map((office) => {
                  const isSelected = value?.code === office.code && value?.gds === office.gds
                  return (
                    <button
                      key={`${office.gds}-${office.code}`}
                      type="button"
                      onClick={() => handleSelect(office)}
                      className={cn(
                        'w-full flex items-center justify-between px-2 py-1.5 rounded-sm transition-colors text-left',
                        isSelected ? 'bg-accent' : 'hover:bg-accent',
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm leading-5 text-foreground font-medium">{office.code}</span>
                        {office.isDefault && (
                          <span className="text-2xs text-muted-foreground">Default</span>
                        )}
                      </div>
                      <span className="text-xs leading-4 text-muted-foreground">{office.gds}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && !error && (
            <div className="border-t border-border">
              <button
                type="button"
                onClick={onManageDefaults}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors rounded-b-md"
              >
                <Settings className="size-4 shrink-0" strokeWidth={1.5} />
                <span>Manage default offices</span>
              </button>
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
