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
  // react-docgen-typescript, not the default react-docgen: it expands cva variants (Button
  // variant/size) and inherited props. Autodocs and the components manifest behind addon-mcp
  // both read props from here.
  "typescript": {
    "reactDocgen": "react-docgen-typescript",
    // Setting options replaces Storybook's defaults, so they are repeated here:
    // string unions become select controls, HTML attributes stay out of the props table.
    // tsconfig.json only references the app and node configs; the app one lists the source files.
    "reactDocgenTypescriptOptions": {
      "tsconfigPath": "./tsconfig.app.json",
      "shouldExtractLiteralValuesFromEnum": true,
      "shouldRemoveUndefinedFromOptional": true,
      "propFilter": (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true)
    }
  },
  // Serves /fonts/Geist-Variable.woff2, which src/index.css loads.
  "staticDirs": ["../public"]
};
export default config;