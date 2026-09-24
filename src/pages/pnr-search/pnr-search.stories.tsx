import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { DEFAULT_PARAMS } from '@/lib/sandbox-url'
import PnrSearchPage from './index'

// Each story is one address from projects/pnr-search/README.md → "States and how to reach them".
// Result states come from the real searchPnr on mocks, exactly as in the app.

const meta = {
  component: PnrSearchPage,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
  // The page fills its parent (App: viewport minus the sandbox nav).
  decorators: [(Story) => <div className="h-screen"><Story /></div>],
  args: { params: DEFAULT_PARAMS },
} satisfies Meta<typeof PnrSearchPage>

export default meta
type Story = StoryObj<typeof meta>

const at = (params: Partial<typeof DEFAULT_PARAMS>) => ({ params: { ...DEFAULT_PARAMS, ...params } })

export const Empty: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Search booking' }))
    await expect(canvas.getByText('Please provide the PNR.')).toBeVisible()
    await expect(canvas.getByRole('textbox', { name: 'PNR' })).toHaveAttribute('aria-invalid', 'true')
  },
}

export const PnrRequired: Story = { args: at({ state: 'result' }) }

export const Loading: Story = { args: at({ pnr: '7JRWT4', state: 'loading' }) }

export const GdsRequired: Story = {
  args: at({ pnr: 'ABC123', state: 'result' }),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Galileo' }))
    await expect(await canvas.findByText(/Opening/, {}, { timeout: 4000 })).toHaveTextContent(
      'Opening ABC123 in Q8L3 · Galileo',
    )
  },
}

export const FoundDefaultOffice: Story = { args: at({ pnr: '7JRWT4', state: 'result' }) }

export const FoundSelectedOffice: Story = { args: at({ pnr: '7JRWT4', office: 'E6T8', state: 'result' }) }

export const FoundCreationOffice: Story = {
  args: at({ persona: 'agent-no-defaults', pnr: '7JRWT4', state: 'result' }),
}

export const NotFoundAfterPickedGds: Story = {
  args: at({ pnr: 'XYZ789', tried: ['Amadeus'], gds: 'Sabre', state: 'result' }),
  play: async ({ canvas }) => {
    // GDS already searched stay in place but are disabled.
    await expect(canvas.getByRole('button', { name: 'Amadeus' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Sabre' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Galileo' })).toBeEnabled()
  },
}

export const NotFoundAllGds: Story = {
  args: at({ pnr: 'XYZ789', tried: ['Amadeus', 'Sabre'], gds: 'Galileo', state: 'result' }),
}

export const NotFoundSelectedOffice: Story = { args: at({ pnr: '7JRWT4', office: '5GW5', state: 'result' }) }

export const ErrorUnavailable: Story = { args: at({ pnr: 'ERR000', state: 'result' }) }

export const ErrorOfficeAccess: Story = { args: at({ pnr: 'K2M9QP', office: 'X4PD', state: 'result' }) }
