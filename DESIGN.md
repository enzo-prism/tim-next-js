---
version: alpha
name: Family First Smile Care
description: A minimal clinical blue visual contract for a family dental website that should feel calm, bright, precise, trustworthy, and easy to use.
colors:
  primary: "#0369A1"
  primary-hover: "#075985"
  secondary: "#38BDF8"
  secondary-soft: "#E0F2FE"
  accent: "#7DD3FC"
  accent-soft: "#F0F9FF"
  accent-foreground: "#082F49"
  background: "#F8FCFF"
  surface: "#FFFFFF"
  surface-soft: "#F0F9FF"
  neutral: "#EFF6FF"
  text: "#0F172A"
  text-muted: "#475569"
  border: "#BAE6FD"
  destructive: "#075985"
typography:
  headline-display:
    fontFamily: "Raleway"
    fontSize: 60px
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0em"
  headline-lg:
    fontFamily: "Raleway"
    fontSize: 42px
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "0em"
  headline-md:
    fontFamily: "Raleway"
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "0em"
  body-lg:
    fontFamily: "Raleway"
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.55
    letterSpacing: "0em"
  body-md:
    fontFamily: "Raleway"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0em"
  body-sm:
    fontFamily: "Raleway"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
  label-sm:
    fontFamily: "Raleway"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 14px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 14px
  surface-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 24px
  soft-section:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 40px
  neutral-resource-card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  divider-line:
    backgroundColor: "{colors.border}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    height: 1px
  proof-badge:
    backgroundColor: "{colors.secondary-soft}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.pill}"
    padding: 8px
  proof-callout:
    backgroundColor: "{colors.secondary-soft}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 24px
  section-eyebrow:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.pill}"
    padding: 8px
  selected-state:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 8px
  accent-rule:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    height: 1px
  destructive-state:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.background}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px
---

# Design System: Minimal Clinical Blue

## Purpose

Family First Smile Care should feel calm, bright, precise, and easy to trust. The visual system should support parents, kids, anxious patients, and practical appointment-seekers with a clean clinical rhythm rather than decorative effects.

The site should be mostly white and pale blue, with restrained slate text and a focused blue action system. Real practice photography, clear copy, appointment paths, local details, and patient proof should carry the brand.

## Color System

- **Primary blue (`#0369A1`)** is the main action and trust color. Use it for primary buttons, active navigation, important links, and core calls to action.
- **Secondary sky (`#38BDF8`)** is a supporting brand color. Use it sparingly for quiet emphasis and selected states.
- **Accent light blue (`#7DD3FC`)** is a small emphasis color. Use it only inside blue-family surfaces where contrast remains strong.
- **Accent foreground (`#082F49`)** is the readable text color on light-blue surfaces.
- **Soft surfaces** should stay close to white, slate, or very pale sky blue.

Do not introduce red, green, orange, amber, yellow, warm accent systems, purple-heavy gradients, beige-heavy warmth, harsh neon, or dark medical-tech aesthetics.

## Typography

Raleway is the brand typeface and should remain the default.

- Use bold Raleway headings for clear hierarchy.
- Keep letter spacing at `0` for headings and body text.
- Use uppercase labels sparingly, with modest positive tracking, for section eyebrows and trust cues.
- Keep compact UI text sized for its container; do not use hero-scale text inside cards or panels.

## Layout

The layout should feel practical and reassuring before it feels decorative.

- Lead pages with a clear patient decision: book, learn, meet the team, or contact.
- Prefer full-width sections with constrained inner content.
- Use cards for repeated service, review, or resource items, not as wrappers around whole page sections.
- Keep mobile pages simple: one strong idea per section, clear tap targets, no cramped button rows.
- Use borders, whitespace, and hierarchy before shadows, gradients, or ornament.

## Components

- **Primary CTAs** use primary blue with white text.
- **Secondary CTAs** use white or transparent backgrounds with primary blue borders/text.
- **Cards and panels** use `bg-card`, `border-border`, and small radii. Avoid hover lift except where an item is clearly interactive.
- **Proof modules** use text, numbers, dividers, and compact labels instead of stars or decorative icon badges.
- **Forms** should feel steady and low-friction: clear labels, large fields, helpful validation, and calm blue confirmation states.
- **Form controls** use the darker blue control border and primary-blue focus ring so fields and keyboard focus remain clearly visible.
- **Assistant/widget UI** should stay inside the blue token family.
- **Functional glyphs** are allowed only for unavoidable controls such as menu, chevrons, close, check, search, arrows, and external-link affordances.

## Icon And Decoration Rules

- Do not use generated 3D icons, generated icon badges, decorative service icons, emoji icons, or social glyphs.
- Do not use icon images as proof, rating, service, or section decoration.
- Do not use blur orbs, bokeh blobs, decorative mesh backgrounds, or gradient-heavy panels.
- Do not use broad `bg-gradient-to-*` treatments except for approved media overlays or primary CTA polish.
- Use `rounded-lg` and `rounded-xl` for most surfaces. Larger radii are reserved for real media.
- Prefer no shadow. `shadow-sm` is allowed for sticky nav, menus, popovers, dialogs, and form overlays.

## Implementation Rules

- Keep `src/app/globals.css` theme variables aligned with the tokens above.
- Prefer shadcn semantic tokens such as `background`, `card`, `foreground`, `muted`, `primary`, `secondary`, `accent`, `border`, `input`, and `ring`.
- Prefer shadcn/ui primitives and local shared components over raw one-off controls.
- If a new visual token is needed, update this file in the same change and run the design sync scripts.
- Future Codex UI work should read this file before editing components or pages.
