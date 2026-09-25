import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { DEFAULT_PARAMS } from '@/lib/sandbox-url'
import BookingPage from './index'

// Each story is one address from projects/booking-overview/README.md → "States and how to reach them".
// The booking is opened by the real openBooking on mocks, exactly as in the app.
// Addresses that do not open a booking redirect to PNR Search — checked in the app, not here.

const meta = {
  component: BookingPage,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div className="h-screen"><Story /></div>],
  args: { params: { ...DEFAULT_PARAMS, page: 'booking', pnr: 'BBV14Q' } },
} satisfies Meta<typeof BookingPage>

export default meta
type Story = StoryObj<typeof meta>

const at = (params: Partial<typeof DEFAULT_PARAMS>) => ({
  params: { ...DEFAULT_PARAMS, page: 'booking' as const, ...params },
})

/** Figma 7994:305661: BBV14Q, Sabre, 3 passengers; the tab and an empty widget area. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const header = canvas.getByRole('banner')
    await expect(within(header).getByRole('heading', { level: 1 })).toHaveTextContent('BBV14Q')
    await expect(header).toHaveTextContent('Sabre')
    await expect(header).toHaveTextContent('3 passengers')
    await expect(canvas.getByRole('tab', { name: 'Booking Overview' })).toHaveAttribute('aria-selected', 'true')
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('') // no widgets in iteration 1
    // The open booking is Active in History.
    await expect(canvas.getByRole('button', { name: /^BBV14Q, Sabre/ })).toHaveAttribute('aria-current', 'page')
  },
}

export const OnePassenger: Story = {
  args: at({ pnr: 'K2M9QP' }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('banner')).toHaveTextContent('K2M9QPSabre1 passenger')
  },
}

export const SelectedOffice: Story = { args: at({ pnr: '7JRWT4', office: 'E6T8' }) }

export const AfterGdsRequired: Story = {
  args: at({ pnr: 'ABC123', gds: 'Galileo' }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('banner')).toHaveTextContent('Galileo')
  },
}

export const CreationOffice: Story = { args: at({ persona: 'agent-no-defaults', pnr: 'BBV14Q' }) }
