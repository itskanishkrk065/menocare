/**
 * Universal MenoCare Design System Tokens
 * Directly consumable by Web (Tailwind/CSS) and Future Native Mobile (React Native StyleSheet/Theme).
 */

export const colors = {
  // Brand Warm Palette
  ivory: '#F5F1E9',
  cream: '#FAF8F3',
  oat: '#E9E2D5',
  oatLight: '#F1ECE2',

  // Sage Health Accents
  sage: '#71846A',
  sageDark: '#4A5F43',
  sageSoft: '#EBF0E8',
  sageAccent: '#C4D4BE',
  sageForest: '#526B4D',

  // Clinical Teals
  teal: '#527772',
  tealDark: '#3A5753',
  tealSoft: '#E8F1EF',

  // Neutrals & Typography
  charcoal: '#2E2924',
  charcoalMuted: '#544E45',
  charcoalLight: '#595248',
  espresso: '#2E2925',

  // Tonal Semantic Highlights
  peach: '#8C371D',
  peachSoft: '#FDF3EE',
  lavender: '#654B7C',
  lavenderSoft: '#F4F0F8',
  sand: '#B08E3E',
  sandSoft: '#FAF5E8',
  error: '#A64134',
  errorContainer: '#FAEDE9',

  // Borders & Dividers
  border: '#E2DBD0',
  borderLight: '#EFEAE1',
} as const;

export const spacing = {
  touchMin: 44, // 44px standard mobile minimum touch hit area
  touchPrimary: 48, // 48px primary action touch area
  bottomNavHeight: 64, // 64px standard phone bottom navigation bar
  topHeaderHeight: 56, // 56px phone header bar
  contentMaxDesktop: 1600, // 1600px desktop max-width
} as const;

export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
} as const;

export const shadows = {
  warmSm: '0 1px 3px 0 rgba(46, 41, 36, 0.04)',
  warmMd: '0 4px 16px -2px rgba(46, 41, 36, 0.06)',
  warmLg: '0 12px 32px -6px rgba(46, 41, 36, 0.08)',
} as const;

export const breakpoints = {
  xs: 360,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
