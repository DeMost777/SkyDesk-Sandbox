import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { PassengerHeader, RefBadge, SegmentHeader } from './headers'

// Figma 8014:11347 (passenger), 8014:11380 (segment). Flow doc: projects/booking-overview/overview-widget.md.

const meta = {
  title: 'Skydesk/Matrix Table/Headers',
  tags: ['ai-generated'],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Orange for a passenger, blue for a segment. */
export const Badges: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <RefBadge tone="passenger">P1</RefBadge>
      <RefBadge tone="segment">S1</RefBadge>
    </div>
  ),
}

/** With a tooltip the badge says which passenger it is (Passengers widget). */
export const BadgeWithTooltip: Story = {
  render: () => (
    <div className="pt-12">
      <RefBadge tone="passenger" tooltip="Passenger 1">
        P1
      </RefBadge>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.hover(canvas.getByText('P1'))
    await expect(await within(canvasElement.ownerDocument.body).findByRole('tooltip')).toHaveTextContent('Passenger 1')
  },
}

/** Badge and type; the name is only a tooltip. */
export const Passengers: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <PassengerHeader passenger={{ ref: 'P1', type: 'ADT', name: 'MILLER/JOHN LEE MR' }} />
      <PassengerHeader passenger={{ ref: 'P2', type: 'CHD', name: 'MILLER/AMANDA MISS' }} />
      <PassengerHeader passenger={{ ref: 'P3', type: 'INF', name: 'JANSEN/NOAH INF' }} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('INF')).toBeVisible()
    await expect(canvas.getByTitle('MILLER/JOHN LEE MR')).toHaveTextContent('P1ADT')
  },
}

/** Route over date and flight, in the 140px first column. */
export const Segments: Story = {
  render: () => (
    <div className="flex w-[140px] flex-col gap-4 rounded border border-border bg-popover p-4">
      <SegmentHeader segment={{ ref: 'S1', from: 'KBP', to: 'FRA', departureDate: '2026-06-14', flightNumber: 'SK 400' }} />
      <SegmentHeader segment={{ ref: 'S2', from: 'LHR', to: 'JFK', departureDate: '2026-06-14', flightNumber: 'BA 175' }} />
      <SegmentHeader segment={{ ref: 'S10', from: 'SIN', to: 'AMS', departureDate: '2027-01-03', flightNumber: 'KL 836' }} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('KBP–FRA')).toBeVisible() // en dash
    // The year is not shown, only in the tooltip.
    await expect(canvas.getAllByText('14 Jun')).toHaveLength(2)
    await expect(canvas.getByText('3 Jan')).toHaveAttribute('title', '3 Jan 2027')
    // Date and flight stay on one line in the 140px column.
    const date = canvas.getAllByText('14 Jun')[0]
    await expect(date.getBoundingClientRect().top).toBe(canvas.getByText('SK 400').getBoundingClientRect().top)
  },
}
