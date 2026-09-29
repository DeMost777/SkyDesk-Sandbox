import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { findBooking } from '@/mocks/bookings'
import { MatrixCell, MatrixTable } from './matrix-table'
import { PassengerHeader, SegmentHeader } from './headers'

// Figma 8014:11342. Flow doc: projects/booking-overview/overview-widget.md.
// The table base only: the cells here hold plain boxes. What a widget puts in a cell (the Overview cards)
// is not documented until the team has approved it.

const reference = findBooking('BBV14Q')!
const wide = findBooking('WIDE55')!

const columnsOf = (booking: typeof reference) =>
  booking.passengers.map((p) => ({ id: p.ref, header: <PassengerHeader passenger={p} /> }))
const rowsOf = (booking: typeof reference) =>
  booking.segments.map((s) => ({ id: s.ref, header: <SegmentHeader segment={s} /> }))

const meta = {
  title: 'Skydesk/Matrix Table',
  component: MatrixTable,
  tags: ['ai-generated'],
  parameters: { layout: 'padded' },
  // 800px: the widest a widget gets (Figma "Widget Max Width")
  decorators: [
    (Story) => (
      <div className="w-[800px]">
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Passengers by segment',
    cornerLabel: 'Segments',
    columns: columnsOf(reference),
    rows: rowsOf(reference),
    renderCell: (row, column) => (
      <MatrixCell>
        <div className="rounded border border-border bg-document px-2.5 py-1 text-sm">
          {column.id} × {row.id}
        </div>
      </MatrixCell>
    ),
  },
} satisfies Meta<typeof MatrixTable>

export default meta
type Story = StoryObj<typeof meta>

const scrollArea = (canvasElement: HTMLElement) => canvasElement.querySelector<HTMLElement>('[role="region"]')!

/** Three passengers fill the 800px exactly; nothing scrolls. */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('table', { name: 'Passengers by segment' })).toBeVisible()
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(4) // corner + 3 passengers
    await expect(canvas.getAllByRole('rowheader')).toHaveLength(2)
    const area = scrollArea(canvasElement)
    await expect(area.scrollWidth).toBeLessThanOrEqual(area.clientWidth)
  },
}

/**
 * More passengers than fit: the passenger columns scroll sideways under the first column, which stays
 * where it is (user recording of the Services widget, 2026-09-29). A column is 172px at least, so the
 * fourth passenger already scrolls.
 */
export const ScrollsSideways: Story = {
  args: { columns: columnsOf(wide), rows: rowsOf(wide) },
  play: async ({ canvas, canvasElement }) => {
    const area = scrollArea(canvasElement)
    await expect(area.scrollWidth).toBeGreaterThan(area.clientWidth)

    const rowHeader = canvas.getAllByRole('rowheader')[0]
    const firstPassenger = canvas.getAllByRole('columnheader')[1]
    const before = { row: rowHeader.getBoundingClientRect().left, pax: firstPassenger.getBoundingClientRect().left }

    area.scrollLeft = 200
    await expect(area.scrollLeft).toBeGreaterThan(0)
    // The segment column did not move; the passenger column did.
    await expect(rowHeader.getBoundingClientRect().left).toBe(before.row)
    await expect(firstPassenger.getBoundingClientRect().left).toBeLessThan(before.pax)
  },
}

/** Four passengers: 140px + 4 × 172px = 828px, wider than 800px, so this is the first count that scrolls. */
export const FourPassengers: Story = {
  args: {
    columns: columnsOf(wide).slice(0, 4),
    rows: rowsOf(wide),
  },
  play: async ({ canvasElement }) => {
    const area = scrollArea(canvasElement)
    await expect(area.scrollWidth).toBeGreaterThan(area.clientWidth)
  },
}

/** An empty cell keeps the Figma minimum height of 59px, so a row of empty cells does not collapse. */
export const EmptyCells: Story = {
  args: { renderCell: () => <MatrixCell /> },
  play: async ({ canvasElement }) => {
    const cell = canvasElement.querySelector('tbody td')!
    await expect(cell.getBoundingClientRect().height).toBeGreaterThanOrEqual(59)
  },
}

/** The scrollable area takes focus, so the keyboard can scroll it. */
export const Keyboard: Story = {
  args: { columns: columnsOf(wide), rows: rowsOf(wide) },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('region', { name: 'Passengers by segment' })).toHaveFocus()
  },
}
