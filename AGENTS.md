# AGENTS.md

## Design Contract

For any task that changes UI, styling, components, marketing pages, design tokens, layout, or visual QA, read `/DESIGN.md` before editing. Treat `/DESIGN.md` as the visual source of truth for the shipped website.

Keep this file operational. Put visual rationale, palette decisions, component tone, and token rules in `/DESIGN.md`.

## Frontend Workflow

- Use `.agents/skills/ui-design-system/SKILL.md` for repeatable UI and design-system work in this repo.
- Prefer existing shadcn/ui primitives, Tailwind tokens, and shared components before creating new styling patterns.
- Do not add raw brand hex colors, new spacing scales, or new radius rules unless `/DESIGN.md` is updated in the same change.
- The approved brand palette is blue-led. Keep CTAs, icons, status states, cards, section backgrounds, rating icons, and gradients inside the blue token family.
- When `/DESIGN.md` changes, run `npm run design:check`.
- For visible UI changes, verify locally in the browser on the relevant routes.

## Local App

The site runs with `npm run dev` and defaults to `http://localhost:3000`. If port `3000` is already in use, run the app on another port and verify the exact route being changed.

## Seasonal layer

- October Halloween decorations live in `src/components/seasonal/` and switch themselves on and off from `src/lib/seasonal.ts` (Oct 1–31, Pacific). Visual rules are in `/DESIGN.md` "Seasonal Layer (October)".
- Preview out of season with `?season=halloween`; opt a browser out with `?season=off`; reset with `?season=auto`.
- Keep seasonal art out of CTAs, forms, the header, and the mobile action bar (`src/lib/seasonal.test.ts` guards this). Pumpkin colors stay inside `src/components/seasonal/` (`npm run minimal:check` guards this).
- After October 31, the layer is inert. Before next October, add a new `SeasonalTheme` with new dates and a new versioned `public/seasonal/<id>/` folder, or set `activeSeason` to `null` to ship no seasonal script.
