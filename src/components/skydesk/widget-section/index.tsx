import * as React from 'react'
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// The frame every Booking Overview widget lives in: a collapsible section with a title, an optional
// count badge and the widget's content. Figma 8014:11331 (Overview), 8014:11397 (Passengers).
// Flow doc: projects/booking-overview/README.md.

export interface WidgetSectionProps {
  title: string
  /** Icon of the count badge; the entity the count is about. */
  icon: LucideIcon
  /** Number of entities in the widget. No badge without it. */
  count?: number
  /** Expanded by default (decision of 2026-09-29). */
  defaultOpen?: boolean
  className?: string
  children?: React.ReactNode
}

export function WidgetSection({ title, icon: Icon, count, defaultOpen = true, className, children }: WidgetSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const id = React.useId()
  const Chevron = open ? ChevronDown : ChevronRight

  return (
    // 16px around the widget, a 1px line between widgets (Figma: padding p-4, bottom border).
    <section aria-labelledby={`${id}-title`} className={cn('flex flex-col items-center border-b border-border p-4', className)}>
      {/* 800px: Figma "Width/Widget Max Width" */}
      <div className="flex w-full max-w-[800px] flex-col gap-2">
        <h2 className="text-base font-medium">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-body`}
            // The name is the title alone; the count is a description ("Overview", described by "6").
            aria-labelledby={`${id}-title`}
            aria-describedby={count !== undefined ? `${id}-count` : undefined}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-full items-center rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Chevron aria-hidden className="mr-2 size-3.5 shrink-0 text-icon" />
            <span id={`${id}-title`} className="flex-1">{title}</span>
            {count !== undefined && (
              <Badge variant="outline" className="gap-1 rounded-full py-1 font-normal">
                <Icon aria-hidden className="size-4" />
                <span id={`${id}-count`}>{count}</span>
              </Badge>
            )}
          </button>
        </h2>
        <div id={`${id}-body`} hidden={!open}>
          {children}
        </div>
      </div>
    </section>
  )
}
