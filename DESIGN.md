---
name: MenoCare
description: Calm, compassionate clinical menopause care platform
colors:
  primary: "#5B6F54"
  primary-hover: "#4A5F43"
  accent-sage: "#8E9F86"
  accent-teal: "#7A9B96"
  accent-peach: "#E0AB95"
  accent-lavender: "#B8A6C8"
  neutral-bg: "#F5F1E9"
  neutral-surface: "#FAF8F3"
  neutral-card: "#FAF8F3"
  neutral-border: "#E2DBD0"
  neutral-text: "#2E2924"
  neutral-muted: "#544E45"
  status-error: "#B85D51"
  status-success: "#4A7A50"
  status-warning: "#B07D38"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.2
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1.25
  title:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
---

# Design System: MenoCare

## Overview

**Creative North Star: "The Healing Sanctuary"**

MenoCare is designed to feel like an unhurried, reassuring conversation with a trusted specialist. It departs completely from the cold, neon-accented, hyper-dense dashboards typical of AI healthcare concepts. The atmosphere is warm, tactile, and quiet. Generous whitespace, natural earthy tones, and human typography invite calmness.

Every surface follows three craft commitments:
1. **Zero nested cards:** Information is partitioned using clean typography, deliberate whitespace, and delicate hair-thin dividers rather than cards-within-cards.
2. **Zero artificial kickers:** We refuse uppercase micro-labels floating aimlessly above headings. Headings speak for themselves in plain sentence case.
3. **Inclusive, verified contrast:** All body copy, labels, and interactive states strictly adhere to WCAG AA ($\ge 4.5:1$ contrast ratio).

## Colors

- **Ivory (`#F5F1E9`):** The primary canvas background. Warm, gentle on the eyes, avoiding clinical blue-white glare.
- **Cream (`#FAF8F3`):** Surface and panel containers. Subtle tonal differentiation above the ivory canvas.
- **Oat (`#E9E2D5`) & Border (`#E2DBD0`):** Subtle structural dividing lines and neutral container backgrounds.
- **Deep Sage (`#5B6F54` / `#4A5F43`):** Primary interactive actions, focused states, and active tabs. High-contrast against cream ($\ge 5.2:1$).
- **Sage Light (`#8E9F86`):** Secondary accents, non-critical icons, and subtle badge backgrounds.
- **Muted Teal (`#7A9B96`):** Health indicators, lab test status, and wellness metrics.
- **Warm Charcoal (`#2E2924`):** Primary text and titles ($12.8:1$ contrast against cream).
- **Muted Charcoal (`#544E45`):** Secondary metadata, instructions, and timestamps ($6.2:1$ contrast against cream, well above the 4.5:1 threshold).

## Typography

- **Editorial Serif (Newsreader):** Used for welcoming titles, patient milestone headers, and section names. Instills warmth and human craftsmanship.
- **Interface Sans (Figtree):** Used for high-legibility UI labels, data points, form inputs, and clinical tables. Highly readable numbers and comfortable letterforms.
- **Pixel Floor:** No functional text under 11px anywhere in the application. Standard body text is 14px–16px.
- **Text Wrap:** `text-wrap: pretty` applied on body text to eliminate orphaned stragglers.

## Layout

- **Breathable Grid:** Spacing steps are multiples of 8px (8, 16, 24, 32, 48px).
- **Split-Screen Clinician Workspace:** Preserves the efficient two-pane layout: searchable patient directory on the left (360px), comprehensive clinical dossier on the right, each with independent scrolling.
- **Progressive Disclosure:** Essential daily tasks and health overviews are visible immediately; detailed clinical tables and deep historical trends open cleanly on demand.

## Elevation & Depth

- **Tonal Layering over Shadows:** Interfaces rely on tonal contrast (`#F5F1E9` canvas $\rightarrow$ `#FAF8F3` surface) rather than heavy drop shadows.
- **Subtle Ambient Elevation:** Where elevation is necessary for elevated modals or dropdown menus, we use soft ambient diffusion (`0 4px 16px -2px rgba(46, 41, 36, 0.06)`). No dramatic colored glows or harsh black shadows.

## Shapes

- Containers use a consistent gentle radius: `rounded-xl` (12px) for cards, `rounded-lg` (8px) for inputs and buttons, `rounded-full` for status dots and avatar initials.
- Crisp 1px solid borders using `#E2DBD0`.

## Components

- **Action Buttons:** Deep sage background with crisp cream text. High-contrast hover transition. No bounce or rubberband animations.
- **Forms & Inputs:** Cream background, 1px oat border, clear charcoal text, accessible placeholder contrast.
- **Status Indicators:** Combined with clear text labels (never color alone) for red/amber/green states.
- **Modal Dialogs:** Centered backdrop with subtle warm dimming (`rgba(46, 41, 36, 0.35)`), smooth fade transition, clear dismiss buttons.

## Do's and Don'ts

- **DO** write in clear, comforting, natural English for patients.
- **DO** use sentence case for headings and buttons ("Track your symptoms", "+ Log today's symptoms").
- **DO** ensure all text passes $\ge 4.5:1$ contrast checks.
- **DON'T** nest cards inside other cards.
- **DON'T** use purple-to-blue neon gradients or glowing borders.
- **DON'T** use uppercase kickers/eyebrows over titles.
- **DON'T** use bounce or elastic animation easings.
- **DON'T** use alarmist or overly clinical terminology in patient views.
