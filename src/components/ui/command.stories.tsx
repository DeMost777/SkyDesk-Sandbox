import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'

/**
 * Searchable list with keyboard navigation (cmdk): input, groups, items, empty state.
 * shadcn/ui Command. Also exports CommandDialog — the same list in a Dialog.
 */
const meta = {
  title: 'UI/Command',
  component: Command,
  tags: ['ai-generated'],
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Command {...args} className="w-72 border">
      <CommandInput placeholder="Search office" />
      <CommandList>
        <CommandEmpty>No offices found</CommandEmpty>
        <CommandGroup heading="Amadeus">
          <CommandItem>A2K9</CommandItem>
          <CommandItem>B3R7</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Sabre">
          <CommandItem>5GW5</CommandItem>
          <CommandItem>7MTR</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByPlaceholderText('Search office'), '5GW')
    await expect(canvas.getByText('5GW5')).toBeVisible()
    await expect(canvas.queryByText('A2K9')).toBeNull()
  },
}
