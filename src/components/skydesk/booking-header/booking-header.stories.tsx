import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { mockBookingDirectory } from '@/mocks/bookings.mock'
import { BookingHeader } from './index'

// Flow doc: projects/booking-overview/README.md → «Header». Figma 308:12504.

const bbv14q = mockBookingDirectory.get('BBV14Q', 'Sabre')!
const k2m9qp = mockBookingDirectory.get('K2M9QP', 'Sabre')!

const meta = {
  title: 'Skydesk/Booking Header',
  component: BookingHeader,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
  args: { booking: bbv14q, onToggleSidebar: fn(), onTogglePanel: fn() },
} satisfies Meta<typeof BookingHeader>

export default meta
type Story = StoryObj<typeof meta>

/** BBV14Q as in Figma: Sabre, 3 passengers, created 08/10/2025 13:44. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const header = canvas.getByRole('banner')
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('BBV14Q')
    await expect(header).toHaveTextContent('Sabre')
    await expect(header).toHaveTextContent('3 passengers')
    await expect(header).toHaveTextContent('Created: 08/10/2025 13:44')
    // Office is not shown (open question #22): neither the Creation office nor any other.
    await expect(header).not.toHaveTextContent('D4M5')
    await expect(header.getBoundingClientRect().height).toBe(44)
  },
}

export const OnePassenger: Story = {
  args: { booking: k2m9qp },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('banner')).toHaveTextContent('1 passenger')
    await expect(canvas.getByRole('banner')).not.toHaveTextContent('1 passengers')
  },
}

/** Buttons are there with their states, but the screen gives them no behaviour yet. */
export const Buttons: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle sidebar' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle panel' }))
    await expect(args.onToggleSidebar).toHaveBeenCalledOnce()
    await expect(args.onTogglePanel).toHaveBeenCalledOnce()
  },
}

/** Narrow area: items stay on one line and clip; the panel button stays visible. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const header = canvas.getByRole('banner')
    await expect(header.getBoundingClientRect().height).toBe(44)
    const panel = canvas.getByRole('button', { name: 'Toggle panel' }).getBoundingClientRect()
    await expect(panel.right).toBeLessThanOrEqual(header.getBoundingClientRect().right)
  },
}
