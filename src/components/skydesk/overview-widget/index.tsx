import * as React from 'react'
import { ClipboardList } from 'lucide-react'
import { MatrixCell, MatrixTable, PassengerHeader, SegmentHeader } from '@/components/skydesk/matrix-table'
import { WidgetSection } from '@/components/skydesk/widget-section'
import type { Booking, EntityRef } from '@/lib/booking'
import { buildOverviewMatrix, type MatrixCell as MatrixCellData } from '@/lib/overview-matrix'
import { DocumentCard, NoDocument } from './document-card'

// Overview: which Pricing and Tickets exist for every Passenger × Segment, and their statuses.
// Spec V1: projects/booking-overview/sources/. Flow doc: projects/booking-overview/overview-widget.md.
// EXPERIMENTAL — no stories for the cards and the widget until the team has seen them.

export interface OverviewWidgetProps {
  booking: Booking
  /** A click on a card: the entity to open. Its widget does not exist yet, so the caller decides. */
  onOpen?: (ref: EntityRef) => void
}

export function OverviewWidget({ booking, onOpen }: OverviewWidgetProps) {
  const matrix = React.useMemo(() => buildOverviewMatrix(booking), [booking])
  const cells = React.useMemo(() => {
    const byKey = new Map<string, MatrixCellData>()
    for (const row of matrix.rows) for (const cell of row.cells) byKey.set(`${cell.segment.ref}|${cell.passenger.ref}`, cell)
    return byKey
  }, [matrix])

  return (
    <WidgetSection title="Overview" icon={ClipboardList} count={matrix.documentCount}>
      <MatrixTable
        label="Pricing and tickets by passenger and segment"
        cornerLabel="Segments"
        columns={matrix.passengers.map((p) => ({ id: p.ref, header: <PassengerHeader passenger={p} /> }))}
        rows={matrix.rows.map(({ segment }) => ({ id: segment.ref, header: <SegmentHeader segment={segment} /> }))}
        renderCell={(row, column) => {
          const documents = cells.get(`${row.id}|${column.id}`)?.documents ?? []
          return (
            <MatrixCell>
              {documents.length === 0 ? (
                <NoDocument />
              ) : (
                documents.map((document) => <DocumentCard key={`${document.type}-${document.id}`} document={document} onOpen={onOpen} />)
              )}
            </MatrixCell>
          )
        }}
      />
    </WidgetSection>
  )
}
