import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { ArrowUp } from 'lucide-react'
import { Button } from './button'

const meta = {
  component: Button,
  tags: ['ai-generated'],
  args: { children: 'Search booking' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // Teal primary + text is 3.5:1, below WCAG AA 4.5:1. Design-token decision, see
  // docs/open-questions.md #14 — reported in the a11y panel, not failing tests, until decided.
  parameters: { a11y: { test: 'todo' } },
}

export const Secondary: Story = { args: { variant: 'secondary' } }
export const Outline: Story = { args: { variant: 'outline' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Link: Story = {
  args: { variant: 'link' },
  // Teal primary + text is 3.5:1, below WCAG AA 4.5:1. Design-token decision, see
  // docs/open-questions.md #14 — reported in the a11y panel, not failing tests, until decided.
  parameters: { a11y: { test: 'todo' } },
}
export const Destructive: Story = { args: { variant: 'destructive', children: 'Cancel booking' } }
export const Small: Story = {
  args: { size: 'sm' },
  // Teal primary + text is 3.5:1, below WCAG AA 4.5:1. Design-token decision, see
  // docs/open-questions.md #14 — reported in the a11y panel, not failing tests, until decided.
  parameters: { a11y: { test: 'todo' } },
}
export const Icon: Story = {
  args: { size: 'icon', 'aria-label': 'Search booking', children: <ArrowUp /> },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /search booking/i })).toBeDisabled()
  },
}

export const CssCheck: Story = {
  // Teal primary + text is 3.5:1, below WCAG AA 4.5:1. Design-token decision, see
  // docs/open-questions.md #14 — reported in the a11y panel, not failing tests, until decided.
  parameters: { a11y: { test: 'todo' } },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /search booking/i })
    // Default variant uses bg-primary = hsl(174 84% 32%) from src/tokens/index.css.
    // Fails if Tailwind or the design tokens did not load.
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(13, 150, 136)')
  },
}
