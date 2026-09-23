import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { createHistoryEntries } from '@/mocks/booking-history.mock'
import { HistoryItem } from './history-item'

// Figma 4920:69057 — states Default / Hover / Active, itinerary variants One way / Round / Multi trip.
// Pressed and Focus are not in Figma: pressed = hover, focus = sidebar-ring (projects/app-sidebar).

const NOW = new Date(2026, 2, 13, 18, 0)
const entries = createHistoryEntries(NOW)
const byPnr = (pnr: string) => entries.find((e) => e.pnr === pnr)!

const meta = {
  title: 'Skydesk/App Sidebar/History Item',
  component: HistoryItem,
  tags: ['ai-generated'],
  args: { entry: byPnr('BBV14Q'), now: NOW, onSelect: fn() },
  decorators: [
    (Story) => (
      <ul className="w-[213px] bg-sidebar p-2">
        <li>
          <Story />
        </li>
      </ul>
    ),
  ],
} satisfies Meta<typeof HistoryItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const item = canvas.getByRole('button', { name: 'BBV14Q, Sabre, CDG to LON to JFK, Today 15:12' })
    await expect(item).toHaveTextContent('BBV14Q1STodayCDGLONJFK15:12')
    await userEvent.click(item)
    await expect(args.onSelect).toHaveBeenCalledWith(args.entry)
  },
}
export const Hover: Story = { parameters: { pseudo: { hover: true } } }
export const Pressed: Story = { parameters: { pseudo: { active: true } } }
export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } }
export const Active: Story = {
  args: { isActive: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toHaveAttribute('aria-current', 'page')
  },
}

export const OneWay: Story = { args: { entry: byPnr('P9D3XA') } }
export const RoundTrip: Story = {
  args: { entry: byPnr('K7Q2LM') },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toHaveAccessibleName('K7Q2LM, Galileo, YYZ to LON and back, 12/03/26 12:45')
  },
}
export const MultiCity: Story = { args: { entry: byPnr('S1J8MP') } }
