import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { findBooking } from '@/mocks/bookings'
import { PassengersWidget } from './index'

// Flow doc: projects/booking-overview/passengers-widget.md.
const booking = (pnr: string) => findBooking(pnr)!

/**
 * The Passengers widget: a WidgetSection with a card for every passenger, in PNR order. The counter is the
 * number of passengers. Every card is closed at first and opens on its own.
 */
const meta = {
  title: 'Skydesk/Passengers Widget',
  component: PassengersWidget,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
  args: { booking: booking('PAX7QD') },
} satisfies Meta<typeof PassengersWidget>

export default meta
type Story = StoryObj<typeof meta>

/** Six passengers: every combination of the indicators. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const widget = canvas.getByRole('button', { name: 'Passengers' })
    await expect(widget).toHaveAccessibleDescription('6')
    const cards = canvas.getByRole('list', { name: 'Passengers' })
    await expect(cards.children).toHaveLength(6)
    for (const header of canvas.getAllByRole('button', { expanded: false })) await expect(header).toBeVisible()
  },
}

/** The reference booking of the page: three passengers with different data. */
export const Reference: Story = {
  args: { booking: booking('BBV14Q') },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Passengers' })).toHaveAccessibleDescription('3')
  },
}

/** A passenger from a scenario that has no personal data at all: ✗ Date of Birth │ ✗ Passport, dashes inside. */
export const NoPersonalData: Story = {
  args: { booking: booking('K2M9QP') },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Passengers' })).toHaveAccessibleDescription('1')
    await expect(canvas.getByRole('list', { name: 'Passengers' }).querySelector('button')).toHaveAccessibleDescription(/Missing: Date of Birth Missing: Passport$/)
  },
}

/** Cards are independent: several can be open at once. */
export const SeveralOpen: Story = {
  play: async ({ canvas, userEvent }) => {
    const headers = canvas.getByRole('list', { name: 'Passengers' }).querySelectorAll('button')
    await userEvent.click(headers[0])
    await userEvent.click(headers[2])
    await expect(headers[0]).toHaveAttribute('aria-expanded', 'true')
    await expect(headers[1]).toHaveAttribute('aria-expanded', 'false')
    await expect(headers[2]).toHaveAttribute('aria-expanded', 'true')
  },
}

/** Closing the widget keeps its cards in the DOM. */
export const WidgetClosed: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Passengers' }))
    await expect(canvas.getByRole('button', { name: 'Passengers' })).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.getByRole('list', { name: 'Passengers', hidden: true })).toBeInTheDocument()
  },
}
