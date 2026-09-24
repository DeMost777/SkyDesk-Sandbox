import { cn } from '@/lib/utils'

// Trava mark, 32×32. Redrawn from the Figma render: the Figma asset host is not reachable from
// the build environment. Replace with the exported asset — docs/open-questions.md, App Sidebar.
export function TravaLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground', className)}
    >
      <svg viewBox="0 0 32 32" fill="none" className="size-8 -scale-x-100">
        <path
          d="M10.5 11.2C11.8 9.5 13.8 8.5 16 8.5c4 0 7 3.2 7 7.4H9.2c0 4.3 3 7.6 7 7.6 2.2 0 4.2-1 5.5-2.7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
