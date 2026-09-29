import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { BookingHeader } from './index'

// Figma 8014:11426. Flow doc: projects/booking-overview/README.md.
// "Created" is written in local time, so the fixture is built from local parts: same text everywhere.

const meta = {
  title: 'Skydesk/Booking Header',
  component: BookingHeader,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
  args: {
    pnr: 'BBV14Q',
    gds: 'Sabre',
    passengerCount: 3,
    createdAt: new Date(2025, 9, 8, 13, 44).toISOString(),
  },
} satisfies Meta<typeof BookingHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'BBV14Q' })).toBeVisible()
    await expect(canvas.getByText('Sabre')).toBeVisible()
    await expect(canvas.getByText('3 passengers')).toBeVisible()
    await expect(canvas.getByText(/Created: 08\/10\/2025/)).toHaveTextContent('Created: 08/10/2025 13:44')
  },
}

export const OnePassenger: Story = {
  args: { pnr: 'K2M9QP', passengerCount: 1 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('1 passenger')).toBeVisible()
  },
}

export const Amadeus: Story = { args: { pnr: '7JRWT4', gds: 'Amadeus', passengerCount: 2 } }

/** The three icon buttons have no behaviour yet; they must be reachable and named. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Toggle sidebar' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'History' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Toggle chat' })).toHaveFocus()
  },
}
