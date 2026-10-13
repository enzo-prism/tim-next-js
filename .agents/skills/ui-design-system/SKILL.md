---
name: ui-design-system
description: Use for UI, styling, component, token, or page-design work in the Family First Smile Care site.
---

# Family First Smile Care UI Design System

Use this skill whenever a task changes website UI, layout, colors, design tokens, page composition, or visual QA.

## Required Context

1. Read `/DESIGN.md` before editing.
2. Check `src/app/globals.css` for the live CSS token mapping.
3. Reuse existing layout, shadcn/ui primitives, and shared components before inventing new UI.

## Brand Rules

- "One family, every smile": warm, bright, quietly playful, and very easy to act on.
- Colors come from the logo: cobalt for actions, ink for text, paper/cream backgrounds, periwinkle/blush/lime/cloud washes for panels and illustration, night for the closing band and footer. Use the semantic tokens, not raw Tailwind palette classes.
- Type: Fraunces (`ff-display`, `ff-h1`, `ff-h2`, `ff-h3`) for display, Figtree for reading and UI.
- Motion is CSS-first and never hides server-rendered content (see `/DESIGN.md` "Motion").
- Build with `src/components/site`, `src/components/brand`, and `src/components/motion` before inventing new patterns.
- Keep text readable on mobile and avoid cramped button rows.

## Token Workflow

- When changing `DESIGN.md`, run `npm run design:check`.
- Keep generated token artifacts in `/generated/` in sync.
- If a new visual rule is needed, add it to `DESIGN.md` instead of scattering one-off raw values through TSX.

## Verification

- Run the repo's relevant checks.
- For page-level UI changes, verify the edited route in a browser.
- For broad style/token changes, spot-check `/`, `/services`, and `/book-appointment`.
