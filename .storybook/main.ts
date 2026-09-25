import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
    "storybook-addon-pseudo-states"
  ],
  "framework": "@storybook/react-vite",
  // react-docgen (the default) cannot resolve the "@/…" alias and drops every component that
  // imports through it — no props or description reach Docs or the MCP manifest.
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: { tsconfigPath: './tsconfig.app.json' },
  },
  // Serves /fonts/Geist-Variable.woff2, which src/index.css loads.
  "staticDirs": ["../public"]
};
export default config;