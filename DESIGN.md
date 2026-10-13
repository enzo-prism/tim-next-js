---
version: beta
name: Family First Smile Care
description: One family, every smile. A warm, bright, quietly playful family-dentist system built from the logo’s four tooth-people, with calm motion that rewards scrolling and never hides content.
colors:
  primary: "#2856C3"
  primary-hover: "#1D409A"
  ink: "#13203B"
  ink-soft: "#46516A"
  paper: "#FBF8F3"
  cream: "#F4EEE4"
  surface: "#FFFFFF"
  night: "#0F1A31"
  periwinkle: "#91B1DF"
  periwinkle-wash: "#EDF2FB"
  blush: "#EBCBBF"
  blush-wash: "#FBF0EB"
  lime: "#D3E27A"
  lime-wash: "#F5F8DF"
  cloud: "#E1E5EC"
  cloud-wash: "#F3F5F8"
  line: "#E7E0D4"
  control-border: "#7F8BA5"
  error: "#B4372B"
typography:
  display:
    fontFamily: "Fraunces"
    fontSize: 84px
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline-lg:
    fontFamily: "Fraunces"
    fontSize: 52px
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  headline-md:
    fontFamily: "Fraunces"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  body-lg:
    fontFamily: "Figtree"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  body-md:
    fontFamily: "Figtree"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  body-sm:
    fontFamily: "Figtree"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
  label-sm:
    fontFamily: "Figtree"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
rounded:
  sm: 8px
  md: 10px
  lg: 14px
  xl: 20px
  xxl: 34px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  section: 112px
components:
  page:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 20px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 20px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 20px
  button-on-night-hover:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 20px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 28px
  section-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.body-md}"
    padding: 112px
  section-night:
    backgroundColor: "{colors.night}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    padding: 112px
  wash-periwinkle:
    backgroundColor: "{colors.periwinkle-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xxl}"
  wash-blush:
    backgroundColor: "{colors.blush-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xxl}"
  wash-lime:
    backgroundColor: "{colors.lime-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xxl}"
  wash-cloud:
    backgroundColor: "{colors.cloud-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xxl}"
  sticker-periwinkle:
    backgroundColor: "{colors.periwinkle}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
  sticker-blush:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
  sticker-lime:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
  sticker-cloud:
    backgroundColor: "{colors.cloud}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
  eyebrow:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary-hover}"
    typography: "{typography.label-sm}"
  divider-line:
    backgroundColor: "{colors.line}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.body-sm}"
    height: 1px
  form-control:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 14px
  form-control-border:
    backgroundColor: "{colors.control-border}"
    textColor: "{colors.ink}"
    height: 1px
  error-state:
    backgroundColor: "{colors.error}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px
---

# Design System: One Family, Every Smile

## Overview

Family First Smile Care is a family dental home in Los Gatos. The site should feel like walking into a bright, friendly office where the whole family is expected: warm, calm, quietly playful, and very easy to act on.

The identity comes straight from the logo: four tooth-people (periwinkle, blush, lime, cloud) hugging in a pinwheel. That pinwheel, its four colors, and the little round "heads" are the brand's graphic language. Real people (Dr. Chuang, the team, real reviews) carry trust; the tooth-people carry delight.

Every page still leads with a clear patient decision: book, call, learn, or meet the team.

## Colors

- **Cobalt (`primary` #2856C3)** is the one action color: primary buttons, links, focus rings, active states. Hover deepens to `primary-hover` #1D409A.
- **Ink (#13203B)** is the text color. **Ink-soft (#46516A)** is secondary text. Never use pure black.
- **Paper (#FBF8F3)** is the page background; **cream (#F4EEE4)** is the alternate section band; **white** is for cards and controls.
- **The brand quartet** (from the logo): periwinkle #91B1DF, blush #EBCBBF, lime #D3E27A, cloud #E1E5EC. Use them as fills: tooth-people, dots, stickers, illustration, and large soft panels (their `-wash` tints). They are never text colors and never carry body text below 4.5:1.
- **Night (#0F1A31)** is the deep band for the closing CTA and the footer. On night, text is white or white/70, accents are periwinkle and lime, and buttons use the `night` variants.
- **Error (#B4372B)** is reserved for form validation and destructive confirmations.
- Avoid raw Tailwind palette colors (`bg-sky-*`, `text-gray-*`, `bg-red-*` …). Use the semantic tokens and brand utilities: `bg-paper`, `bg-cream`, `bg-night`, `text-ink`, `text-ink-soft`, `bg-cobalt`, `bg-periwinkle(-wash)`, `bg-blush(-wash)`, `bg-lime(-wash)`, `bg-cloud(-wash)`, `border-border`.
- Tints map loosely to audiences when it helps: lime for kids, periwinkle for adults and everyday care, blush for smile/cosmetic and aligners, cloud for prevention and hygiene. This is a guide, not a rule.

## Typography

- **Fraunces** (soft axis on) is the display face: page titles, section titles, pull quotes, big numbers. Classes: `ff-display` (home hero), `ff-h1` (page heroes), `ff-h2` (section titles), `ff-h3` (card and sub-section titles), or `font-display`.
- **Figtree** is the reading and UI face: body, buttons, labels, forms, navigation (default `font-sans`).
- `ff-lead` for intro paragraphs; `ff-eyebrow` (via the `Eyebrow` component) for small uppercase labels above titles.
- Emphasize one word in a headline with `<em className="ff-italic font-normal">` or wrap it in `<Squiggle>` for a hand-drawn lime underline. Once per heading at most, and not on every heading.
- Headings use `text-wrap: balance`; paragraphs use `pretty`. Keep line length to ~65ch for reading text.
- Phone numbers and prices use lining numerals (set globally).

## Layout

- Full-width bands (`Section` component, `tone` = paper, cream, white, night, or a wash) with a constrained inner container (`max-w-7xl`, narrow `max-w-3xl` for reading).
- Section rhythm: `py-16 sm:py-20 lg:py-28`. Alternate paper and cream (or a wash) so the page has a pulse; end pages with a night CTA band where it helps.
- Hero pattern for interior pages: `PageHero` (eyebrow, `ff-h1`, lead, actions, optional media in an arch frame or a brand illustration). Breadcrumbs sit above the hero title.
- Cards for repeated items (services, reviews, steps, resources). Do not box whole sections.
- Phones: one idea per section, CTAs full-width and at least 48px tall, no cramped rows, no horizontal page scroll. Horizontal swipers are allowed only for review rows and photo strips.
- The header is sticky; pages do not add top padding for it.

## Elevation & Depth

- Most surfaces are flat with a 1px `border-border` hairline.
- `shadow-float` (theme token) is for things that sit on top: stickers/chips, popovers, the condensed header.
- `shadow-lift` appears only on hover of clearly interactive cards (`ff-lift`) and on menus.
- No arbitrary `shadow-[...]` values, glows, blur orbs, or mesh gradients.

## Shapes

- Radii: controls `rounded-xl` (14px), cards `rounded-2xl`/`rounded-3xl`, big media and wash panels `rounded-[34px]`-equivalent via `rounded-3xl`, buttons and chips `rounded-full`.
- **Arch frame** (`ff-arch`): rounded top, softly rounded bottom. Use it for portraits and real office photos.
- **Tooth-people** (`ToothPerson`, `Pinwheel`, `BrandDots`): the only decorative shapes. Use them with intent (an eyebrow mark, a hero composition, a step marker, a sticker), never as random confetti.
- Real photography gets a gentle, consistent treatment: arch or `rounded-3xl` frames, `object-cover`, and crops that hide clutter (keyboards, carts, seasonal décor).

## Motion

Motion should feel like the logo: four friends coming together. Things **gather** (rise, converge, settle with a soft overshoot) rather than flash or spin for no reason.

**Hard rules**

1. Content is visible in the server HTML. Never ship `style="opacity:0"` or JS-gated reveals (`tests/e2e/first-paint.spec.ts`). No framer-motion `initial` states, no page-transition wrappers.
2. Scroll reveals are CSS scroll-driven animations (`animation-timeline: view()`), so they cost zero JavaScript and simply don't run where unsupported.
3. Load-in choreography is short (finished by ~1.2s) and never loops. Anything that moves by itself for more than 5s needs a pause control (WCAG 2.2.2); prefer scroll-linked motion instead.
4. `prefers-reduced-motion: reduce` gets the finished state everywhere (the CSS handles this; keep custom motion inside `motion-safe:` or the existing media queries).
5. Animate `translate`, `scale`, `rotate`, `opacity`, `clip-path`, and SVG strokes only. Never animate layout.
6. Wrap scroll-revealed content in `overflow-clip`, not `overflow-hidden`: a hidden-overflow ancestor becomes the view timeline's scroller, so reveals inside it never play.
7. One hero moment per page. Section reveals are gentle (≈2rem rise). Do not reveal-animate body paragraphs one by one.

**Toolkit** (all in `src/app/globals.css` and `src/components/motion`, `src/components/brand`, `src/components/site`)

| Class / component | Use |
| --- | --- |
| `ff-intro`, `ff-intro-scale`, `ff-intro-pop`, `ff-intro-fade` + `style={{"--d": ms}}` | Load-in for above-the-fold hero pieces |
| `ff-words-intro` on a heading + `<Words text=… start={n} />` / `<Word index>` | Headline words rising out of a mask (keeps the accessible name) |
| `<Rotator words={[5 words]} srText=… />` | A once-through rotating word that rests on the last word |
| `<Squiggle draw="load" \| "view">` | Hand-drawn underline that draws itself |
| `ff-reveal`, `ff-reveal-scale`, `ff-reveal-left`, `ff-reveal-right`, `ff-reveal-pop` + `style={{"--i": n}}` | Scroll-driven reveal, `--i` staggers siblings |
| `ff-parallax` (`--ff-parallax`), `ff-drift`, `ff-unclip`, `ff-grow-view`, `ff-draw-view` | Scroll-linked parallax, drift, clip reveal, line growth, stroke drawing |
| `<Pinwheel gather="load" \| "view" spin="page" \| "view" hover blend />` | The logo, alive |
| `ff-lift`, `ff-press`, `ff-arrow` | Hover lift for interactive cards, press feedback, arrow nudge |
| `ff-panel` on tab panels | Panel swap fade-up |
| `ReviewRows`, `StepTimeline`, `AudienceTabs`, `PhotoStrip`, `CtaBand`, `PageHero`, `FaqList` | Section-level patterns (see `src/components/site`) |

**Easing:** `--ease-out-soft` (arrivals), `--ease-spring` (small playful pops), `--ease-in-out-soft` (loops and draws).

## Components

- **Buttons** (`@/components/ui/button`): pill shaped. `default` cobalt for the primary action, `outline` white with ink text for secondary, `night` / `night-outline` on dark bands, `link` for inline. Primary CTAs may carry a trailing arrow in a small circle (`ff-arrow`). Minimum 44px tap targets (48px on phones for page CTAs).
- **Cards** (`ff-card`): white, hairline border, `rounded-2xl`/`3xl`, generous padding. Interactive cards add `ff-lift` and a clear affordance (arrow or underline).
- **Stickers / chips** (`ff-chip`): small rounded-full labels with `shadow-float`, used for proof and friendly facts around hero media.
- **Proof**: text first (rating, review count, verification date), real quotes with names. A short row of five filled stars may accompany the rating; never fake avatars or invented stats.
- **Forms**: calm and roomy. Labels above fields, 48px fields, `border-input` (control-border) with a cobalt focus ring, error text in `text-destructive`. Success states use a lime-wash panel with ink text.
- **FAQ**: `<details>`/`<summary>` or Radix Accordion with the smooth height animation; a plus that turns into a minus.
- **Functional glyphs** (`MinimalGlyph`): only for controls (menu, chevrons, arrows, close, check, play, external link). No icon libraries, no emoji, no generated 3D icons. Brand illustration is the tooth-people, drawn as vectors.

## Do's and Don'ts

- Do let one brand moment per page carry the delight; keep everything else calm.
- Do keep the primary action visible at every step (hero CTA, sticky header CTA, mobile action bar, closing band).
- Do use real names, real photos, and verified facts only. Do not publish visit lengths, prices, plan participation, or same-day promises unless the practice confirmed them.
- Don't use red, orange, yellow, green, or pink Tailwind palette classes; the brand's lime and blush come from tokens.
- Don't use broad multi-color gradients, blur orbs, glows, or decorative noise.
- Don't animate anything that blocks reading, and don't make anything loop forever.
- Don't add a second `<main>`, a second form, or duplicate CTA labels that tests rely on (see AGENTS.md).

## Seasonal Layer (October)

A small, self-expiring Halloween layer sits on top of this system each October. It adds delight; it never re-themes the site.

- **Timing:** on October 1–31 on the practice's Pacific calendar, set before first paint by the head script in `src/lib/seasonal.ts`. It switches off on November 1 with no redeploy. `?season=halloween` previews, `?season=off` opts a browser out, `?season=auto` resets.
- **Palette:** a pale blue moon, ink bats, a white ghost-tooth, and stars on the night band. Pumpkin orange (`--ffsc-pumpkin*`, `--ffsc-lantern-glow`) is the one warm exception, used only for the jack-o'-lanterns and their glow. Those tokens live in `src/components/seasonal/seasonal.css`, and `npm run minimal:check` fails if they appear anywhere outside `src/components/seasonal/`.
- **Placement:** homepage hero greeting, moon, bats, and ghost-tooth; stars on the homepage closing CTA band; the footer pumpkin patch; the 404 page; and the favicon. CTAs, forms, the header, the mobile action bar, and phone links stay undecorated. The pumpkin patch stays off `/book-appointment`, `/contact`, `/urgent-dental-care`, and `/privacy-policy`.
- **Motion:** decorative, `aria-hidden`, transform and opacity only, no layout shift, every one-off animation finishes within 5 seconds, and nothing moves for reduced-motion or Save-Data visitors. The only interactive piece is the footer button that lights the jack-o'-lanterns.

## Implementation Rules

- Keep `src/app/globals.css` variables aligned with the tokens above (`--ff-*` brand variables feed the shadcn semantic tokens and Tailwind colors).
- Prefer shared components (`src/components/site`, `src/components/brand`, `src/components/motion`, shadcn/ui) over one-off markup.
- If a new visual token is needed, update this file in the same change and run `npm run design:check`.
- Run `npm run minimal:check` before committing UI work.
