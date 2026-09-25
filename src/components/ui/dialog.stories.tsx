import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

/**
 * Modal window: trigger, content with header, description and footer. shadcn/ui Dialog on Radix.
 */
const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['ai-generated'],
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // Teal primary + text is 3.5:1, below WCAG AA 4.5:1. Design-token decision, see
  // docs/open-questions.md #14 — reported in the a11y panel, not failing tests, until decided.
  parameters: { a11y: { test: 'todo' } },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage default offices</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Default offices</DialogTitle>
          <DialogDescription>One default office per GDS. Skydesk opens bookings through it.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /manage default offices/i }))
    // DialogContent renders in a portal on document.body.
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog')
    await expect(within(dialog).getByText('Default offices')).toBeVisible()
  },
}
