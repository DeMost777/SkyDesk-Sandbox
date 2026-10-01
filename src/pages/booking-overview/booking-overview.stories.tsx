import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { DEFAULT_PARAMS } from '@/lib/sandbox-url'
import BookingOverviewPage from './index'

// Each story is one address: ?page=booking-overview&pnr=<PNR>. Flow doc: projects/booking-overview/README.md.
// The widget column is the Overview frame with a placeholder until ROADMAP 3.1.

const meta = {
  title: 'Pages/booking-overview',
  component: BookingOverviewPage,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
  // The page fills its parent (App: viewport minus the sandbox nav).
  decorators: [(Story) => <div className="h-screen"><Story /></div>],
  args: { params: { ...DEFAULT_PARAMS, page: 'booking-overview', pnr: 'BBV14Q' } },
} satisfies Meta<typeof BookingOverviewPage>

export default meta
type Story = StoryObj<typeof meta>

const at = (pnr: string) => ({ params: { ...DEFAULT_PARAMS, page: 'booking-overview' as const, pnr } })

/** Header from the Booking, the widget column centred, the counter = visible Pricing and Tickets. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'BBV14Q' })).toBeVisible()
    await expect(canvas.getByText('3 passengers')).toBeVisible()
    await expect(canvas.getByText('Booking Overview')).toBeVisible()
    // BBV14Q: 3 Pricing (one Deleted, hidden) + 3 Tickets = 6 visible entities.
    await expect(canvas.getByRole('button', { name: 'Overview' })).toHaveAccessibleDescription('6')
  },
}

export const OnePassenger: Story = {
  args: at('K2M9QP'),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('1 passenger')).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Overview' })).toHaveAccessibleDescription('1')
  },
}

export const Wide: Story = { args: at('WIDE55') }

export const DeletedPricing: Story = {
  args: at('DEL3T3'),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Overview' })).toHaveAccessibleDescription('1')
  },
}

/** Passengers comes after Overview; its counter is the number of passengers, the cards start closed. */
export const Passengers: Story = {
  args: at('PAX7QD'),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('button', { name: 'Passengers' })).toHaveAccessibleDescription('6')
    // a widget title is a heading whose text also carries its counter: "Overview6"
    const headings = canvas.getAllByRole('heading', { level: 2 }).map((h) => h.textContent ?? '')
    await expect(headings.findIndex((t) => t.startsWith('Passengers'))).toBeGreaterThan(headings.findIndex((t) => t.startsWith('Overview')))
    const first = canvas.getByRole('button', { name: /Kallio Anna Maria/ })
    await expect(first).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(first)
    await expect(first).toHaveAttribute('aria-expanded', 'true')
  },
}

/** Sandbox only: in the product a Booking arrives from PNR Search. */
export const NoBooking: Story = {
  args: at('XYZ789'),
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/No mock booking for PNR XYZ789/)).toBeVisible()
  },
}

export const SwitchScenario: Story = {
  play: async ({ canvas, userEvent }) => {
    // The sandbox bar navigates by address; here it only has to offer every scenario.
    await expect(canvas.getAllByRole('button', { pressed: false })).toHaveLength(9)
    await expect(canvas.getByRole('button', { name: 'BBV14Q', pressed: true })).toBeVisible()
    await userEvent.hover(canvas.getByRole('button', { name: 'WIDE55' }))
  },
}
