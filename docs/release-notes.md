# Release Notes

## 2026-10-12 — "One family, every smile" redesign

### Public experience

- Every public page is redesigned around the logo's four tooth-people: cobalt for actions, ink
  text on warm paper, periwinkle/blush/lime/cloud washes, and a navy closing band and footer.
  Fraunces (display) and Figtree (reading/UI) replace Raleway.
- Motion is CSS-first. Scroll reveals use scroll-driven animations (`animation-timeline: view()`),
  so they cost no JavaScript, never hide server-rendered content, and simply don't run in
  browsers without support or for reduced-motion visitors. Load-in choreography is short and
  never loops; the hero's rotating phrase plays once and rests (WCAG 2.2.2).
- The logo is now a vector pinwheel that gathers on load, turns with scroll, and spins on hover.
  The tooth-people family closes most pages (tap them to make them hop).
- Homepage: masked headline rise with a hand-drawn underline, a once-through audience phrase,
  a scroll-drifting proof ribbon, a "Who's coming in today?" family line-up picker, a first-visit
  timeline, Dr. Chuang's path, straightening review cards, an unclipping office-tour video, and a
  drifting office photo strip.
- Page signatures: a tooth-people intent picker and bento catalog on Services; a shared service
  template with sticky plan-your-visit card, timeline, and sticky decision guide; a TMJ symptom
  checklist; an aligner journey on Invisalign; a one-time scanning beam on iTero; a hopping
  parent-and-baby hero on Baby's First Visit; a filterable review explorer on Testimonials; a
  winding road on Team; phone-framed office tours on About; a brush-along two-minute timer on the
  brushing guide; a self-drawing Highway 17 map on Santa Cruz; generated covers, a reading
  progress bar, and a sticky table of contents on the blog; a pinwheel missing its lime tooth on
  the 404 page.
- Booking and contact keep every label, field, validation rule, tracking call, and focus behavior;
  they gain a calmer two-column layout, a step indicator, 48px controls with 16px text, brick-red
  errors, and lime success panels.
- Content fixes: internal editorial notes and filler reviews no longer show on Testimonials;
  unverified claims (board-certified, visit length, nitrous, CBCT) and an AI infographic with a
  placeholder phone number are gone; duplicate and Christmas-decor office photos are out of
  rotation; footer, contact, and 404 hours now list Saturday and Sunday; the contact page's map
  bar uses `tel:+14083588100`. Guide booking buttons now go to the appointment form.
- The October seasonal layer is re-seated in the new hero, closing band, and footer.

### Performance

- Preloaded fonts: Fraunces (soft axis, no optical-size axis) and Figtree, about 82 KB; the
  Fraunces italic loads on demand.
- Gzipped JavaScript on a typical page grows a few KB (e.g. `/tmj` 217 KB → 225 KB) for the new
  client islands (audience picker, review filter, brush timer, tooth family).

### Design contract and guards

- `DESIGN.md` is rewritten ("One Family, Every Smile") with tokens, a Motion section, and the
  shared toolkit; `generated/` tokens are regenerated.
- `scripts/check-minimal-design.mjs` allows the brand's `lime` token classes; raw warm Tailwind
  palette classes, arbitrary shadows, large arbitrary radii, broad gradients, emoji, and icon
  libraries are still blocked.
- Shared primitives live in `src/components/site`, `src/components/brand`, and
  `src/components/motion`.

## 2026-10-07 — October Halloween seasonal layer

### Public experience

- From October 1 to October 31 (Pacific calendar), the site shows a small Halloween layer that
  switches itself off on November 1 with no redeploy. An inline head script in
  `src/lib/seasonal.ts` sets `<html data-ffsc-season="halloween">` before first paint, and every
  seasonal piece is hidden unless that attribute is set.
- Homepage hero: a "Happy Halloween from Los Gatos" greeting, a pale blue moon behind
  Dr. Chuang's photo, bats that lift off the moon once per session, and a ghost-tooth that peeks
  out from behind the photo on desktop.
- Homepage closing band: a crescent moon and twinkling stars.
- Footer: tooth-grin jack-o'-lanterns with a greeting. A button lights and blows out the candles.
  The patch stays off `/book-appointment`, `/contact`, `/urgent-dental-care`, and
  `/privacy-policy`.
- The 404 page gets a ghost-tooth in front of the moon, and the favicon becomes a
  tooth-grin jack-o'-lantern.
- CTAs, forms, the header, the mobile action bar, and phone links are unchanged. Art is
  `aria-hidden`; motion is transform/opacity only, ends within 5 seconds, and is skipped for
  reduced-motion and Save-Data visitors. No layout shift (measured CLS 0).
- `?season=halloween` previews the layer anywhere, `?season=off` opts a browser out, and
  `?season=auto` resets.

### Design contract

- `DESIGN.md` adds "Seasonal Layer (October)". Pumpkin orange is the one warm exception; its
  tokens live in `src/components/seasonal/seasonal.css`, and `npm run minimal:check` now fails if
  they are used outside `src/components/seasonal/`.

### Verification

- `src/lib/seasonal.test.ts` runs the real head script against a fake browser at the Pacific
  date boundaries, with blocked storage, and with the query overrides, and guards that CTAs,
  forms, and the mobile action bar stay undecorated.
- `tests/e2e/seasonal.spec.ts` covers the preview, the lantern button, the quiet routes, the
  opt-out, and the no-JavaScript render.

## 2026-09-27 — Visible-on-first-paint pages and a mobile action bar

### Public experience

- Service, Invisalign, iTero, Baby's First Visit, Testimonials, and Services pages no longer ship
  their headings and calls to action at `opacity:0` waiting for scroll-reveal animations. Content
  is visible in the server HTML, with or without JavaScript.
- Phone-width screens get a bottom bar with Call and Request visit. The call button shows live
  office status ("Open now · until 5 PM" / "Closed · opens Mon 9 AM") in Los Angeles time; outside
  office hours the request button takes the primary style. The bar stays off `/book-appointment`
  and `/contact`, which already lead with a call link.
- The mobile menu now includes the phone number and hours. Closing CTAs on service pages turn the
  plain-text "or call (408) 358-8100" into a tap-to-call link.
- On phones, the analytics prompt spans the width above the bar (two lines instead of four) and
  the assistant launcher sits above the bar.

### Performance

- Legacy pages other than the two form pages render as server components. Click tracking moved
  into small client links (`src/components/tracking/tracked-links.tsx`), and framer-motion is no
  longer loaded. First-load JS: service pages 172 kB → 110 kB, Testimonials 175 kB → 110 kB,
  Invisalign 179 kB → 126 kB, About 168 kB → 123 kB, home 144 kB → 129 kB.

### Analytics

- `phone_click` from the Invisalign closing CTA now uses the shared `trackPhoneClick` payload
  (`destination: "phone"`, plus `service_id`). New CTA sources: `mobile_action_bar`, `mobile_menu`,
  and `*_final` phone links on service pages.

## 2026-09-12 — Persist website leads into the staff pipeline

### Operations

- Website and appointment inserts now set `ingestedVia="website-form"` and enqueue `notification_outbox`.
- The 15-minute cron retries Formspree for `failed` rows and separately drains no-PII staff alerts. Docs no longer claim the outbox is a Formspree retry.
- Reconciliation providers can fetch Formspree and Google Ads lead-form records when credentials exist, then insert missing contacts. Unconfigured providers still fail closed.
- Missing `CRON_SECRET` or `GOOGLE_ADS_WEBHOOK_KEY` still returns 503, now with exact Vercel and Google Ads setup steps.

## 2026-08-31 — Remove On-Site Admin Leads Dashboard

### Public experience

- Patient-facing pages, contact and appointment forms, Formspree office notifications, first-party
  duplicate protection, GA4 `G-L7MH47XYXL`, and Vercel Web Analytics are unchanged.

### Operations

- Removed the password-protected `/admin` leads and performance dashboard from the public website.
- `/admin`, `/admin/login`, and the staff-facing contacts, session, changelog, GA4, and GSC APIs
  now 404 instead of offering a login that could expose patient contact details.
- Form persistence and cron-authenticated notification/reconciliation jobs remain so office
  notifications continue to retry. Staff reporting belongs in a separate dedicated dashboard.

### Verification

- Unit, lint, typecheck, and Playwright coverage confirm the retired dashboard routes 404 and
  public form routes still render.

## 2026-08-30 — Public-Site Usability, Trust, and Release Safety

### Public experience

- Added an intent-led service guide and clearer appointment-request actions across the public site.
- Reduced mobile office-tour media work while keeping the full desktop experience.
- Added visible article authorship and updated dates, strengthened the space-maintainer guide, and
  linked its professional sources directly.
- Improved landmarks, address naming, contrast, reduced-motion behavior, and mobile navigation.

### Release reliability and security

- Removed the obsolete `ADMIN_USERNAME` release requirement; the protected dashboard uses the
  existing password-and-session-cookie flow.
- Removed the built-in admin password fallback so missing production configuration fails closed.
- Made both Formspree production endpoint names explicit and documented the Vercel-safe Google
  service-account credential mode.
- Updated vulnerable transitive production dependencies and made the assistant layout test
  independent from the separately tested consent prompt.
- Clarified that a matching Git-integrated production deployment and a guarded CLI deployment are
  alternative release paths, not two steps to run together.
- Added an exact-commit deployment guard to the CLI fallback: ready releases exit cleanly,
  in-progress releases pause with a retryable status, and failed releases stop for investigation.

### Verification

- 244 Vitest tests passed.
- 109 applicable Playwright checks passed across desktop, tablet, and mobile; 38 project-specific
  checks were skipped as designed.
- The formerly flaky assistant layout check passed 15 consecutive repeated runs.
- Typecheck, lint, design contracts, minimal-design guard, and the 69-page production build passed.
- Production dependency audit reported zero vulnerabilities, and the production lead schema
  read-back passed without modifying data.

## 2026-08-19 — Google Review Snapshot Refresh

### Public experience

- Updated the displayed Google review total from 52 to the 82-review count verified directly on the Google Business Profile.
- Added four recent August 2026 Google review excerpts to the testimonials page.
- Replaced the April snapshot label with a Google-specific August 19 verification label across the homepage, testimonials page, and Santa Cruz page.

### Operations

- Documented the manual review-refresh source of truth, content locations, verification surfaces, and production read-back checks.
- Documented that the total includes every Google rating while the website excerpts remain curated.
- Recorded the current Google Business Profile API quota limitation and signed-in Google UI fallback.
- Added regression coverage for the verified count and newly selected review entries.

### Verification

- `npm run check` (224 tests)
- `npm run build`
- Production-mode rendered checks for `/`, `/testimonials`, and `/areas-we-serve/santa-cruz`

## 2026-07-29 — Conversion, SEO, Accessibility, and Performance

### Public experience

- Shortened the mobile homepage and moved Dr. Tim's credentials and trust signals closer to the
  primary appointment action.
- Reduced the homepage service selection to four featured services with clear routes to the full
  service directory and patient FAQs.
- Made the services-page appointment CTA fully clickable and repaired service heading order.
- Compacted the mobile analytics choice and delayed the assistant launcher until that choice is
  resolved.

### Lead measurement

- GA4 `generate_lead` now fires when an appointment or contact lead is newly persisted, even when
  the office notification relay is delayed.
- The direct Google Ads conversion fires only for a newly persisted appointment lead.
- Notification retries for an already-created lead do not emit duplicate lead events or
  appointment Ads conversions.
- The appointment submission UUID remains the Google Ads transaction ID.

### Search and paid landing routes

- Added exact permanent redirects for historical mixed-case Ads URLs:
  - `/Book-Appointment` -> `/book-appointment`
  - `/Services/Invisalign` -> `/services/invisalign`
- Redirects preserve campaign and click identifiers.
- Tightened key route titles and descriptions, improved the child bad-breath article structure,
  and added related internal links.

### Accessibility and performance

- Removed dangling form `aria-describedby` references.
- Moved the skip link before analytics controls in source order.
- Marked repeated logo images decorative and announced links that open new tabs.
- Loads only the normal Raleway font style globally and prioritizes the homepage tour poster.
- Replaced the Radix umbrella package with direct primitive imports to reduce client bundles.

### Verification

- `npm run quality:all`
- 97 Vitest tests
- 42 focused Playwright checks across desktop, tablet, and mobile
- Production build and redirect smoke checks
- Manual production-mode inspection of the homepage and appointment form at 390x844

### Account-side follow-up

- Confirm the exact Google Ads conversion label and primary action.
- Reconcile GA4 `generate_lead` counts with persisted leads.
- Recheck the changed landing pages and article in Google Search Console after deployment.
