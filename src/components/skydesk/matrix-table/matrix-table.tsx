import * as React from 'react'
import { cn } from '@/lib/utils'

// The table base shared by widgets that show something per Passenger × Segment (Overview now,
// Services next). It knows rows, columns and cells — nothing about what a cell holds.
// Figma 8014:11342. Flow doc: projects/booking-overview/overview-widget.md.
//
// The first column stays put; the other columns scroll sideways when they do not fit (user recording,
// 2026-09-29). A column is at least 172px: the card's 156px minimum plus 8px cell padding on both sides.

export interface MatrixColumn {
  id: string
  header: React.ReactNode
}

export interface MatrixRow {
  id: string
  header: React.ReactNode
}

export interface MatrixTableProps {
  /** Name of the table and of its scrollable area. */
  label: string
  /** Text of the top-left cell, above the row headers: "Segments". */
  cornerLabel: string
  columns: MatrixColumn[]
  rows: MatrixRow[]
  renderCell: (row: MatrixRow, column: MatrixColumn) => React.ReactNode
  className?: string
}

// Figma sizes: first column 140px; cell min height 59px.
const FIRST_COLUMN = 'w-[140px] min-w-[140px] max-w-[140px]'

export function MatrixTable({ label, cornerLabel, columns, rows, renderCell, className }: MatrixTableProps) {
  return (
    <div className={cn('overflow-clip rounded-xl border border-border bg-card shadow-small', className)}>
      {/* Focusable, so the keyboard can scroll it even when no cell has anything to focus */}
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <table className="w-full border-separate border-spacing-0 text-left">
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr>
              <th
                scope="col"
                className={cn(FIRST_COLUMN, 'sticky left-0 z-10 border-b border-border bg-popover px-4 py-2 text-sm font-normal')}
              >
                {cornerLabel}
              </th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="min-w-[172px] border-b border-l border-border px-4 py-2 align-middle font-normal"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          {/* No line under the last row: the table's own border closes it */}
          <tbody className="[&>tr:last-child>*]:border-b-0">
            {rows.map((row) => (
              <tr key={row.id}>
                <th
                  scope="row"
                  className={cn(FIRST_COLUMN, 'sticky left-0 z-10 border-b border-border bg-popover px-4 py-3 align-top font-normal')}
                >
                  {row.header}
                </th>
                {columns.map((column) => (
                  <td key={column.id} className="min-w-[172px] border-b border-l border-border p-0 align-top">
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** The inside of one cell: 8px around, 6px between the things in it. */
export function MatrixCell({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn('flex min-h-[59px] flex-col gap-1.5 p-2', className)}>{children}</div>
}
