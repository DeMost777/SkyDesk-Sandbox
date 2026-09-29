import type { Meta, StoryObj } from '@storybook/react-vite'
import { ClipboardList, Users } from 'lucide-react'
import { expect } from 'storybook/test'
import { WidgetSection } from './index'

// Figma 8014:11331 (Overview), 8014:11397 (Passengers). Flow doc: projects/booking-overview/README.md.
// The frame only: what a widget puts inside is documented with the widget.

const meta = {
  title: 'Skydesk/Widget Section',
  component: WidgetSection,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <main className="bg-page">
        <Story />
      </main>
    ),
  ],
  args: {
    title: 'Overview',
    icon: ClipboardList,
    count: 4,
    children: <p className="rounded-md border border-dashed border-border bg-background p-8 text-center text-sm">Widget content</p>,
  },
} satisfies Meta<typeof WidgetSection>

export default meta
type Story = StoryObj<typeof meta>

/** Expanded by default (decision of 2026-09-29). */
export const Expanded: Story = {
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Overview' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText('Widget content')).toBeVisible()
    // The name is the title; the count is its description.
    await expect(toggle).toHaveAccessibleDescription('4')
  },
}

export const Collapsed: Story = {
  args: { defaultOpen: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.getByText('Widget content')).not.toBeVisible()
  },
}

/** A click on the header opens and closes the widget; the content stays mounted. */
export const Toggle: Story = {
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: 'Overview' })
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.getByText('Widget content')).not.toBeVisible()
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText('Widget content')).toBeVisible()
  },
}

export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    const toggle = canvas.getByRole('button', { name: 'Overview' })
    await expect(toggle).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  },
}

export const Passengers: Story = { args: { title: 'Passengers', icon: Users, count: 3 } }

export const ZeroCount: Story = {
  args: { count: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Overview' })).toHaveAccessibleDescription('0')
  },
}

export const NoCount: Story = {
  args: { count: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Overview' })).not.toHaveAccessibleDescription()
  },
}
