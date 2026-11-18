/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Stitch Warm Health Design System
        ivory: '#F5F1E9',
        cream: '#FAF8F3',
        oat: '#E9E2D5',
        'oat-light': '#F1ECE2',
        sage: '#8E9F86',
        'sage-dark': '#5B6F54',
        'sage-soft': '#EBF0E8',
        teal: {
          DEFAULT: '#7A9B96',
          dark: '#446460',
          soft: '#E8F1EF',
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        charcoal: {
          DEFAULT: '#2E2924',
          muted: '#665F55',
          light: '#9B958B',
        },
        peach: {
          DEFAULT: '#E0AB95',
          soft: '#FDF3EE',
          container: '#F9ECE6',
        },
        lavender: {
          DEFAULT: '#B8A6C8',
          soft: '#F4F0F8',
        },
        sand: {
          DEFAULT: '#D7B979',
          soft: '#FAF5E8',
        },
        error: {
          DEFAULT: '#B85D51',
          container: '#FAEDE9',
        },
        'outline-variant': '#E2DBD0',

        // Compatibility bindings
        background: "var(--background, #F5F1E9)",
        foreground: "var(--foreground, #2E2924)",
        card: {
          DEFAULT: "var(--card, #FAF8F3)",
          foreground: "var(--card-foreground, #2E2924)",
        },
        popover: {
          DEFAULT: "var(--popover, #FAF8F3)",
          foreground: "var(--popover-foreground, #2E2924)",
        },
        muted: {
          DEFAULT: "var(--muted, #F1ECE2)",
          foreground: "var(--muted-foreground, #665F55)",
        },
        border: "var(--border, #E2DBD0)",
        ring: "var(--ring, #8E9F86)",
      },
      borderRadius: {
        'card': '1.25rem',
        '2xl': '1.125rem',
        '3xl': '1.375rem',
        '4xl': '1.75rem',
      },
      boxShadow: {
        'warm-sm': '0 2px 8px -2px rgba(46, 41, 36, 0.05), 0 1px 3px -1px rgba(46, 41, 36, 0.03)',
        'warm-md': '0 12px 32px -8px rgba(46, 41, 36, 0.08), 0 4px 12px -2px rgba(46, 41, 36, 0.04)',
        'warm-lg': '0 24px 48px -12px rgba(46, 41, 36, 0.12), 0 8px 24px -4px rgba(46, 41, 36, 0.04)',
      }
    },
  },
  plugins: [],
}
