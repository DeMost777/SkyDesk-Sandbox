import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Input } from './input'

/**
 * Text field. shadcn/ui Input; `aria-invalid` shows the error state.
 */
const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['ai-generated'],
  args: { placeholder: 'Enter a PNR number', 'aria-label': 'PNR' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Filled: Story = { args: { defaultValue: '7JRWT4' } }

export const Disabled: Story = { args: { defaultValue: '7JRWT4', disabled: true } }

export const Invalid: Story = {
  args: { 'aria-invalid': true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'PNR' })).toHaveAttribute('aria-invalid', 'true')
  },
}
