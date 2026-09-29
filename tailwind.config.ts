import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          muted: 'hsl(var(--border-muted))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Trava brand color (teal accent used in interactive elements)
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          foreground: 'hsl(var(--brand-foreground))',
        },
        surface: 'hsl(var(--surface))',
        page: 'hsl(var(--page))',
        icon: 'hsl(var(--icon))',
        document: { DEFAULT: 'hsl(var(--document))', muted: 'hsl(var(--document-muted))' },
        pricing: { accent: 'hsl(var(--pricing-accent))', foreground: 'hsl(var(--pricing-foreground))' },
        ticket: { accent: 'hsl(var(--ticket-accent))' },
        'badge-passenger': {
          DEFAULT: 'hsl(var(--badge-passenger))',
          border: 'hsl(var(--badge-passenger-border))',
          foreground: 'hsl(var(--badge-passenger-foreground))',
        },
        'badge-segment': {
          DEFAULT: 'hsl(var(--badge-segment))',
          border: 'hsl(var(--badge-segment-border))',
          foreground: 'hsl(var(--badge-segment-foreground))',
        },
        loading: {
          start: 'hsl(var(--loading-start))',
          end: 'hsl(var(--loading-end))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
      },
      fontSize: {
        heading: [
          'var(--font-size-heading)',
          { lineHeight: 'var(--line-height-heading)', letterSpacing: 'var(--letter-spacing-heading)' },
        ],
        '2xs': ['var(--font-size-2xs)', { lineHeight: 'var(--line-height-2xs)' }],
      },
      backgroundImage: {
        hatch: 'var(--pattern-hatch)',
      },
      boxShadow: {
        popover: 'var(--shadow-popover)',
        header: 'var(--shadow-header)',
        small: 'var(--shadow-small)',
        'focus-ring': 'var(--shadow-focus-ring)',
      },
      dropShadow: {
        card: 'var(--drop-shadow-card)',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        // Figma "Fonts/Font Mono" — History item, Booking Overview tables
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
