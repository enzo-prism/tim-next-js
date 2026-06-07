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

- The site should feel gentle, bright, trustworthy, family-friendly, and clinically calm.
- Primary blue, secondary sky, and light-blue accent are the main palette.
- Keep CTAs, icons, status states, cards, section backgrounds, rating icons, and gradients inside the blue token family.
- Use neutral slate and white only for text, borders, and structural surfaces.
- Keep text readable on mobile and avoid cramped button rows.

## Token Workflow

- When changing `DESIGN.md`, run `npm run design:check`.
- Keep generated token artifacts in `/generated/` in sync.
- If a new visual rule is needed, add it to `DESIGN.md` instead of scattering one-off raw values through TSX.

## Verification

- Run the repo's relevant checks.
- For page-level UI changes, verify the edited route in a browser.
- For broad style/token changes, spot-check `/`, `/services`, and `/book-appointment`.
