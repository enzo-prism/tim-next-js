# Release Notes

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
