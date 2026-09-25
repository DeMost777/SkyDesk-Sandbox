import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { createHistoryEntries } from '@/mocks/booking-history.mock'
import { MOCK_USER } from '@/mocks/user.mock'
import { AppSidebar } from './index'

const NOW = new Date(2026, 2, 13, 18, 0)
const history = createHistoryEntries(NOW)

/**
 * App navigation on the left: Trava Sky Desk, General (New chat), History, the agent in the footer.
 * Figma variant Type=Default; Collapsed is not built. Rules — projects/app-sidebar/README.md.
 *
 * @figma 548:16649
 */
const meta = {
  title: 'Skydesk/App Sidebar',
  component: AppSidebar,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
  args: {
    history,
    user: MOCK_USER,
    now: NOW,
    onBrandClick: fn(),
    onNewChat: fn(),
    onSelect: fn(),
    onUserClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppSidebar>

export default meta
type Story = StoryObj<typeof meta>

// No clicks in Default: they would leave the last clicked button focused and hovered, with a fill.
export const Default: Story = {
  play: async ({ canvas }) => {
    // Group labels are titles, not buttons (user decision, 2026-09-23).
    await expect(canvas.queryByRole('button', { name: 'General' })).toBeNull()
    await expect(canvas.queryByRole('button', { name: 'History' })).toBeNull()
    await expect(canvas.getByRole('list', { name: 'History' }).children).toHaveLength(11)
    // Default state: no fill on any button.
    for (const button of canvas.getAllByRole('button')) {
      await expect(getComputedStyle(button).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    }
  },
}

export const Clicks: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Trava Sky Desk' }))
    await expect(args.onBrandClick).toHaveBeenCalled()
    await userEvent.click(canvas.getByRole('button', { name: 'New chat' }))
    await expect(args.onNewChat).toHaveBeenCalled()
    await userEvent.click(canvas.getByRole('button', { name: /^K7Q2LM/ }))
    await expect(args.onSelect).toHaveBeenCalledWith(history[1])
    await userEvent.click(canvas.getByRole('button', { name: /Alex Pupkin/ }))
    await expect(args.onUserClick).toHaveBeenCalled()
  },
}

export const ActiveItem: Story = { args: { activePnr: 'H2N8ZT' } }

export const EmptyHistory: Story = { args: { history: [] } }

// More bookings than fit: History scrolls, header and footer stay.
export const LongHistory: Story = {
  args: {
    history: [...history, ...history.map((e) => ({ ...e, pnr: `${e.pnr.slice(0, 5)}X` }))],
  },
}
