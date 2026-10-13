# AGENTS.md

## Design Contract

For any task that changes UI, styling, components, marketing pages, design tokens, layout, or visual QA, read `/DESIGN.md` before editing. Treat `/DESIGN.md` as the visual source of truth for the shipped website.

Keep this file operational. Put visual rationale, palette decisions, component tone, and token rules in `/DESIGN.md`.

## Frontend Workflow

- Use `.agents/skills/ui-design-system/SKILL.md` for repeatable UI and design-system work in this repo.
- Prefer existing shadcn/ui primitives, Tailwind tokens, and shared components before creating new styling patterns.
- Do not add raw brand hex colors, new spacing scales, or new radius rules unless `/DESIGN.md` is updated in the same change.
- The brand palette comes from the logo's four tooth-people: cobalt is the one action color; periwinkle, blush, lime, and cloud (and their `-wash` tints) are fills for panels, stickers, and illustration; ink carries text; night is the closing band and footer. Use the semantic Tailwind tokens (`bg-paper`, `bg-cream`, `text-ink`, `bg-lime-wash`, …), never raw palette classes.
- Motion is CSS-first (see `/DESIGN.md` "Motion"): content must be visible in the server HTML (no `style="opacity:0"`, no framer-motion reveal wrappers; `tests/e2e/first-paint.spec.ts` guards this), scroll reveals use `ff-reveal*` scroll-driven classes, and everything settles for `prefers-reduced-motion`.
- Build pages from the shared primitives in `src/components/site` (`PageHero`, `Section`, `SectionHeader`, `CtaBand`, `StepTimeline`, `ReviewCard`/`ReviewRows`, `PhotoStrip`) and `src/components/brand` (`Pinwheel`, `ToothPerson`, `Squiggle`).
- When `/DESIGN.md` changes, run `npm run design:check`.
- For visible UI changes, verify locally in the browser on the relevant routes.

## Local App

The site runs with `npm run dev` and defaults to `http://localhost:3000`. If port `3000` is already in use, run the app on another port and verify the exact route being changed.

## Seasonal layer

- October Halloween decorations live in `src/components/seasonal/` and switch themselves on and off from `src/lib/seasonal.ts` (Oct 1–31, Pacific). Visual rules are in `/DESIGN.md` "Seasonal Layer (October)".
- Preview out of season with `?season=halloween`; opt a browser out with `?season=off`; reset with `?season=auto`.
- Keep seasonal art out of CTAs, forms, the header, and the mobile action bar (`src/lib/seasonal.test.ts` guards this). Pumpkin colors stay inside `src/components/seasonal/` (`npm run minimal:check` guards this).
- After October 31, the layer is inert. Before next October, add a new `SeasonalTheme` with new dates and a new versioned `public/seasonal/<id>/` folder, or set `activeSeason` to `null` to ship no seasonal script.
