import type { Meta, StoryObj } from '@storybook/react-vite'
import { MOCK_USER } from '@/mocks/user.mock'
import { NewChatButton, SidebarBrand, SidebarUser } from './index'

// Header, New chat and Footer: one SidebarMenuButton each, same states as History Item.
// Hover / Pressed / Focus are forced with storybook-addon-pseudo-states.

const meta = {
  title: 'Skydesk/App Sidebar/Parts',
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div className="w-[--sidebar-width] bg-sidebar p-2 text-sidebar-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const hover = { pseudo: { hover: true } }
const pressed = { pseudo: { active: true } }
const focus = { pseudo: { focusVisible: true } }

export const Header: Story = { render: () => <SidebarBrand /> }
export const HeaderHover: Story = { ...Header, parameters: hover }
export const HeaderPressed: Story = { ...Header, parameters: pressed }
export const HeaderFocus: Story = { ...Header, parameters: focus }

export const NewChat: Story = { render: () => <NewChatButton /> }
export const NewChatHover: Story = { ...NewChat, parameters: hover }
export const NewChatPressed: Story = { ...NewChat, parameters: pressed }
export const NewChatFocus: Story = { ...NewChat, parameters: focus }

export const Footer: Story = { render: () => <SidebarUser user={MOCK_USER} /> }
export const FooterHover: Story = { ...Footer, parameters: hover }
export const FooterPressed: Story = { ...Footer, parameters: pressed }
export const FooterFocus: Story = { ...Footer, parameters: focus }
export const FooterLongName: Story = {
  render: () => (
    <SidebarUser user={{ name: 'Alexandra Konstantinopolskaya', email: 'alexandra.konstantinopolskaya@example.com' }} />
  ),
}
