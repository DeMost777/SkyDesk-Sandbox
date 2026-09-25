import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { createHistoryEntries } from '@/mocks/booking-history.mock'
import { HistoryItem } from './history-item'
import { expectAccentFill, expectAccentFillOn, type InteractionState } from './story-checks'


const NOW = new Date(2026, 2, 13, 18, 0)
const entries = createHistoryEntries(NOW)
const byPnr = (pnr: string) => entries.find((e) => e.pnr === pnr)!

/**
 * One booking in History: PNR · GDS code, date and time of the last action, Itinerary.
 * States Default / Hover / Pressed / Focus / Active, Itinerary One way / Round / Multi trip.
 * Rules — projects/app-sidebar/README.md.
 */
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

// No click in Default: a click leaves the item focused and hovered, and the story would stop
// showing the default state (no fill). Interaction checks live in SelectsOnClick.
export const Default: Story = {
  play: async ({ canvas }) => {
    const item = canvas.getByRole('button', { name: 'BBV14Q, Sabre, CDG to LON to JFK, Today 15:12' })
    await expect(item).toHaveTextContent('BBV14Q1STodayCDGLONJFK15:12')
    await expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  },
}
// Hover / Pressed / Focus are forced with storybook-addon-pseudo-states; each checks the fill rule.
const hasAccentFill =
  (state: InteractionState): Story['play'] =>
  async ({ canvas }) => {
    await expectAccentFillOn(canvas.getByRole('button'), state)
  }
export const Hover: Story = { parameters: { pseudo: { hover: true } }, play: hasAccentFill(':hover') }
export const Pressed: Story = { parameters: { pseudo: { active: true } }, play: hasAccentFill(':active') }
export const Focus: Story = { parameters: { pseudo: { focusVisible: true } }, play: hasAccentFill(':focus-visible') }
export const Active: Story = {
  args: { isActive: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toHaveAttribute('aria-current', 'page')
    await expectAccentFill(canvas.getByRole('button'))
  },
}

export const SelectsOnClick: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button'))
    await expect(args.onSelect).toHaveBeenCalledWith(args.entry)
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
