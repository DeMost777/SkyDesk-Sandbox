import type { Meta, StoryObj } from '@storybook/react-vite'
import { MOCK_USER } from '@/mocks/user.mock'
import { NewChatButton, SidebarBrand, SidebarUser } from './index'
import { expectAccentFillOn, type InteractionState } from './story-checks'

// Hover / Pressed / Focus are forced with storybook-addon-pseudo-states.

/**
 * App Sidebar parts: header (SidebarBrand), New chat (NewChatButton), footer (SidebarUser).
 * One SidebarMenuButton each, same states as History Item.
 */
const meta = {
  title: 'Skydesk/App Sidebar/Parts',
  component: SidebarBrand,
  subcomponents: { NewChatButton, SidebarUser },
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div className="w-[--sidebar-width] bg-sidebar p-2 text-sidebar-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SidebarBrand>

export default meta
type Story = StoryObj<typeof meta>

const hover = { pseudo: { hover: true } }
const pressed = { pseudo: { active: true } }
const focus = { pseudo: { focusVisible: true } }
const hasAccentFill =
  (state: InteractionState): Story['play'] =>
  async ({ canvas }) => {
    await expectAccentFillOn(canvas.getByRole('button'), state)
  }

export const Header: Story = { render: () => <SidebarBrand /> }
export const HeaderHover: Story = { ...Header, parameters: hover, play: hasAccentFill(':hover') }
export const HeaderPressed: Story = { ...Header, parameters: pressed, play: hasAccentFill(':active') }
export const HeaderFocus: Story = { ...Header, parameters: focus, play: hasAccentFill(':focus-visible') }

export const NewChat: Story = { render: () => <NewChatButton /> }
export const NewChatHover: Story = { ...NewChat, parameters: hover, play: hasAccentFill(':hover') }
export const NewChatPressed: Story = { ...NewChat, parameters: pressed, play: hasAccentFill(':active') }
export const NewChatFocus: Story = { ...NewChat, parameters: focus, play: hasAccentFill(':focus-visible') }

export const Footer: Story = { render: () => <SidebarUser user={MOCK_USER} /> }
export const FooterHover: Story = { ...Footer, parameters: hover, play: hasAccentFill(':hover') }
export const FooterPressed: Story = { ...Footer, parameters: pressed, play: hasAccentFill(':active') }
export const FooterFocus: Story = { ...Footer, parameters: focus, play: hasAccentFill(':focus-visible') }
export const FooterLongName: Story = {
  render: () => (
    <SidebarUser user={{ name: 'Alexandra Konstantinopolskaya', email: 'alexandra.konstantinopolskaya@example.com' }} />
  ),
}
