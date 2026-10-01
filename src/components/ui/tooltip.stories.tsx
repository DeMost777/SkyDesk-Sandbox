import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Button } from './button'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

/**
 * A short hint over an element, on hover or keyboard focus. shadcn/ui Tooltip on Radix; `Tooltip` brings
 * its own provider. Text only: anything the agent must read belongs on the page, not in a tooltip.
 */
const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['ai-generated'],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** Open at first, to see it. */
export const Default: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <div className="pt-12">
      <Tooltip {...args}>
        <TooltipTrigger asChild>
          <Button variant="outline">Passenger 1</Button>
        </TooltipTrigger>
        <TooltipContent>Passenger 1</TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // TooltipContent renders in a portal on document.body.
    await expect(await body(canvasElement).findByRole('tooltip')).toHaveTextContent('Passenger 1')
  },
}

export const OnHover: Story = {
  render: () => (
    <div className="pt-12">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Shown on hover</TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(body(canvasElement).queryByRole('tooltip')).toBeNull()
    await userEvent.hover(canvas.getByRole('button', { name: 'Hover me' }))
    await expect(await body(canvasElement).findByRole('tooltip')).toHaveTextContent('Shown on hover')
  },
}

export const OnKeyboardFocus: Story = {
  render: () => (
    <div className="pt-12">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Focus me</Button>
        </TooltipTrigger>
        <TooltipContent>Shown on focus</TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.tab()
    await expect(await body(canvasElement).findByRole('tooltip')).toHaveTextContent('Shown on focus')
  },
}
