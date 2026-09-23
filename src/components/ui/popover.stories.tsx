import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

const meta = {
  component: Popover,
  tags: ['ai-generated'],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">Booking details</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Booking details">
        <p className="text-sm">LINDQVIST/ANNA MRS · ARN → LHR → JFK</p>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /booking details/i })
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    // PopoverContent renders in a portal on document.body.
    await expect(await within(canvasElement.ownerDocument.body).findByText(/ARN → LHR → JFK/)).toBeVisible()
  },
}
