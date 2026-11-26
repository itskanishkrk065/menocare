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
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Stitch Warm Health Design System (Refined for Impeccable contrast >= 4.5:1)
        ivory: '#F5F1E9',
        cream: '#FAF8F3',
        oat: '#E9E2D5',
        'oat-light': '#F1ECE2',
        sage: '#71846A',
        'sage-dark': '#4A5F43',
        'sage-soft': '#EBF0E8',
        teal: {
          DEFAULT: '#527772',
          dark: '#3A5753',
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
          muted: '#544E45',
          light: '#595248',
        },
        peach: {
          DEFAULT: '#C97F63',
          soft: '#FDF3EE',
          container: '#F9ECE6',
        },
        lavender: {
          DEFAULT: '#886C9E',
          soft: '#F4F0F8',
        },
        sand: {
          DEFAULT: '#B08E3E',
          soft: '#FAF5E8',
        },
        error: {
          DEFAULT: '#A64134',
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
          foreground: "var(--muted-foreground, #544E45)",
        },
        border: "var(--border, #E2DBD0)",
        ring: "var(--ring, #4A5F43)",
      },
      borderRadius: {
        'card': '1rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(46, 41, 36, 0.04)',
        'warm-md': '0 4px 16px -2px rgba(46, 41, 36, 0.06)',
        'warm-lg': '0 12px 32px -6px rgba(46, 41, 36, 0.08)',
      }
    },
  },
  plugins: [],
}
