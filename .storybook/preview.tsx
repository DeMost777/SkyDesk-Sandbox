import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import { PERSONAS } from '../src/mocks/personas.mock'

const preview: Preview = {
  // The app reads saved Default Offices per persona (src/hooks/use-default-offices.ts).
  // Seed exactly those keys, so a default saved in one story never leaks into the next.
  beforeEach() {
    for (const persona of PERSONAS) {
      localStorage.setItem(
        `skydesk-sandbox:default-offices:${persona.id}`,
        JSON.stringify(persona.defaults),
      )
    }
  },
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;