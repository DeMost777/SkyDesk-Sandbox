import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { passengersData } from '@/mocks/bookings/passengers'
import { PassengerCard, type PassengerCardProps } from './passenger-card'

// Flow doc: projects/booking-overview/passengers-widget.md. The data is the PAX7QD scenario.
const [dateOfBirth, passportOnly, passportAndCards, child, nothing, longName] = passengersData.passengers

/**
 * One passenger: badge, name, type and the indicators of what is entered; the whole top row opens the
 * personal information and the loyalty cards. Date of Birth shows only without a passport; Frequent
 * flyer only when there is a card. Cards open and close independently.
 */
const meta = {
  title: 'Skydesk/Passengers Widget/Passenger Card',
  component: PassengerCard,
  tags: ['ai-generated'],
  args: { passenger: dateOfBirth },
  // The card is a list item: the list is the widget's, here a stand-in 800px wide.
  render: (args) => inList(args),
} satisfies Meta<typeof PassengerCard>

export default meta
type Story = StoryObj<typeof meta>

const inList = (args: PassengerCardProps, width = 'w-[800px] max-w-full') => (
  <ul className={width}>
    <PassengerCard {...args} />
  </ul>
)

const description = (canvas: ReturnType<typeof within>, name: RegExp) => canvas.getByRole('button', { name })

/** `✓ Date of Birth │ ✗ Passport │ ✓ Frequent flyer`: the date is known, there is no passport. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const header = description(canvas, /Kallio Anna Maria Ms/)
    await expect(header).toHaveAttribute('aria-expanded', 'false')
    await expect(header).toHaveAccessibleName('P1 Kallio Anna Maria Ms')
    await expect(header).toHaveAccessibleDescription(/ADT Entered: Date of Birth Missing: Passport Entered: Frequent flyer/)
    await expect(canvas.getByText('Show more')).toBeVisible()
  },
}

/** A passport has the date of birth, so that indicator is not shown. */
export const PassportOnly: Story = {
  args: { passenger: passportOnly },
  play: async ({ canvas }) => {
    const header = description(canvas, /Kallio Matti Juha Mr/)
    await expect(header).toHaveAccessibleDescription('ADT Entered: Passport')
  },
}

export const PassportAndFrequentFlyer: Story = {
  args: { passenger: passportAndCards },
  play: async ({ canvas }) => {
    await expect(description(canvas, /Nordqvist Elsa Mrs/)).toHaveAccessibleDescription(/ADT Entered: Passport Entered: Frequent flyer/)
  },
}

export const Child: Story = {
  args: { passenger: child },
  play: async ({ canvas }) => {
    await expect(description(canvas, /Kallio Oskari Mstr/)).toHaveAccessibleDescription('CHD Entered: Passport')
  },
}

/** Nothing entered: both indicators are ✗ and there is no Frequent flyer. */
export const NothingEntered: Story = {
  args: { passenger: nothing },
  play: async ({ canvas }) => {
    // The GDS infant marker is not a title: the name has none.
    await expect(description(canvas, /^P5 Kallio Aino$/)).toHaveAccessibleDescription('INF Missing: Date of Birth Missing: Passport')
  },
}

/** Long names wrap onto the next line; they are never cut. */
export const LongName: Story = {
  args: { passenger: longName },
  render: (args) => inList(args, 'w-[360px]'),
  play: async ({ canvas }) => {
    await expect(description(canvas, /Van Der Hoeven-lindqvist Maria-antonia Christina Elisabeth Dr/)).toBeVisible()
  },
}

/** The personal information and the cards, in the mono font. */
export const Expanded: Story = {
  args: { defaultOpen: true },
  play: async ({ canvas }) => {
    await expect(description(canvas, /Kallio Anna Maria/)).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText('Show less')).toBeVisible()
    const fields = canvas.getAllByRole('definition').map((d) => d.textContent)
    await expect(fields).toEqual(['12/04/1985', 'FEMALE', 'Finland', '-', '-', '-'])
    // the indicator and the heading of the block
    await expect(canvas.getAllByText('Frequent flyer')).toHaveLength(2)
    await expect(canvas.getByText('4400123456')).toBeVisible()
  },
}

/** An empty value is a dash; with no card the Frequent flyer block is not there at all. */
export const ExpandedEmpty: Story = {
  args: { passenger: nothing, defaultOpen: true },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('definition').map((d) => d.textContent)).toEqual(['-', '-', '-', '-', '-', '-'])
    await expect(canvas.queryByText('Frequent flyer')).toBeNull()
  },
}

/** Many cards keep their order and wrap onto the next line. */
export const ManyFrequentFlyers: Story = {
  args: { passenger: longName, defaultOpen: true },
  render: (args) => inList(args, 'w-[420px]'),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText(/^\((KL|SK|AY|LH|LX)\)$/).map((e) => e.textContent)).toEqual(['(KL)', '(SK)', '(AY)', '(LH)', '(LX)'])
  },
}

export const Toggles: Story = {
  play: async ({ canvas, userEvent }) => {
    const header = description(canvas, /Kallio Anna Maria/)
    const panel = () => document.getElementById(header.getAttribute('aria-controls')!)!
    // toBeVisible trusts the `hidden` attribute; the computed display is what the agent actually sees
    const shown = () => getComputedStyle(panel()).display !== 'none'
    await expect(shown()).toBe(false)
    await userEvent.click(header)
    await expect(header).toHaveAttribute('aria-expanded', 'true')
    await expect(shown()).toBe(true)
    await userEvent.click(header)
    await expect(header).toHaveAttribute('aria-expanded', 'false')
    await expect(shown()).toBe(false)
    // Closed, not removed: the content stays in the DOM.
    await expect(panel()).toBeInTheDocument()
  },
}

/** Tab reaches the card, Enter and Space open and close it. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    const header = description(canvas, /Kallio Anna Maria/)
    await userEvent.tab()
    await expect(header).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(header).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard(' ')
    await expect(header).toHaveAttribute('aria-expanded', 'false')
  },
}

/** The ring goes round the whole top row, as in the product. Reached with Tab, so it is the real :focus-visible. */
export const Focus: Story = {
  play: async ({ canvas, userEvent }) => {
    const header = description(canvas, /Kallio Anna Maria/)
    await userEvent.tab()
    await expect(header).toHaveFocus()
    await expect(getComputedStyle(header).boxShadow).not.toBe('none')
  },
}

/** Hover changes only the cursor. */
export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
  play: async ({ canvas }) => {
    const header = description(canvas, /Kallio Anna Maria/)
    await expect(getComputedStyle(header).cursor).toBe('pointer')
    await expect(getComputedStyle(header).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  },
}

/** The badge says which passenger it is. */
export const BadgeTooltip: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.hover(canvas.getByText('P1'))
    await expect(await within(canvasElement.ownerDocument.body).findByRole('tooltip')).toHaveTextContent('Passenger 1')
  },
}
