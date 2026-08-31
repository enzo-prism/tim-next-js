# Operations Runbook

## Purpose

Provide a fast, repeatable response guide for production incidents and routine operations.

## Service Map

- Public site: Next.js app on Vercel
- Contact persistence: Postgres via Drizzle (`contacts` table)
- Appointment relay: `POST /api/appointments` -> internal DB + Formspree relay
- Staff leads dashboard: not served from this public site; `/admin` 404s
- Cron jobs: notification retries and reconciliation under `/api/admin/*`, authenticated with `CRON_SECRET`
- ElevenLabs widget: pinned custom-element embed on public routes only

## Daily and Weekly Checks

### Daily

1. Confirm production homepage and contact page return `200`.
2. Confirm booking page (`/book-appointment`) returns `200`.
3. Submit one synthetic contact in non-production environment.
4. Submit one synthetic appointment request in non-production environment.
5. Verify Vercel deployment logs are clean.
6. Confirm ElevenLabs launcher appears on `/`, `/contact`, `/book-appointment`, and `/blog`.

### Weekly

1. Verify redirect and SEO assets:
   - `/robots.txt`
   - `/sitemap.xml`
   - `/llms.txt`
2. Confirm Vercel Analytics, GA4 Realtime, and Search Console data are flowing.
3. Confirm the ElevenLabs widget still loads from the pinned `0.11.4` embed URL.
4. Review `failed` and `sending` notification rows in the database or the dedicated dashboard.
5. Review CSP report-only logs for new blocked domains before switching to enforcing mode.
6. Compare Google Ads conversions against GA4 `generate_lead` for the same window. A large gap means a primary conversion action is keyed to something that cannot fire, not that leads stopped. See "Google Ads account configuration" in [Analytics Setup](./analytics-setup.md).
7. Confirm GA4 traffic acquisition still shows `google / cpc` for paid visits. A drift back to `(direct)` or `googleads.g.doubleclick.net / referral` means campaign parameters stopped reaching `page_location`.

## ElevenLabs Widget Notes

- Agent ID: `agent_4801kn7ednjse6drbr2cnt62kkp2`
- Bundle URL: `https://unpkg.com/@elevenlabs/convai-widget-embed@0.11.4`
- Route scope: public content pages; excluded from `/admin` and form routes
- Expected placement: bottom-right, collapsed by default, dismissible, text input enabled
- Host-side text overrides are applied with the widget's supported `text-contents` JSON attribute.
- Allowlist hosts must be exact hostnames in ElevenLabs. `localhost:3000`, `127.0.0.1:3000`, and the production domain should always be present.
- Vercel preview hostnames are exact-match only. Add each preview hostname explicitly when a new preview alias needs live widget access.

## Manual ElevenLabs QA

Run these checks before a production release that touches the widget:

1. Desktop Chrome:
   - open the live site
   - confirm the launcher is visible and collapsed on first load
   - open the widget, start a real conversation, and confirm microphone permission flow works
2. iOS Safari:
   - confirm the launcher does not cover the primary CTA on home, contact, or booking
   - confirm microphone permission prompt appears and a voice session can start
3. Chrome on Android:
   - confirm the launcher stays inside safe areas
   - confirm text input and voice start controls are reachable without overlap
4. Form coexistence:
   - trigger a contact or booking form error and confirm the toast remains readable above the widget

## Incident Playbooks

## Incident: Contact form returns 500

Symptoms:

- `POST /api/contacts` fails with `500`

Actions:

1. Check Vercel function logs for storage error.
2. Confirm `DATABASE_URL` is set for production.
3. Confirm database connectivity.
4. Run the read-only schema verifier:
   - `npm run db:verify`
5. If drift is confirmed, inspect the checked-in migrations and apply only the missing migration
   files in numeric order. Never use `npm run db:push` against production.
6. Re-test submit flow without using real patient information.

## Incident: Appointment relay degraded (Formspree down)

Symptoms:

- `POST /api/appointments` returns `202 delivered:false`
- appointments still persist in `contacts` with `requestType=appointment`
- `formspreeStatus` remains `failed` or `sending`

Actions:

1. Confirm DB persistence is still healthy (this is source of truth for lead capture).
2. Check Vercel logs for relay errors from `/api/appointments`.
3. Validate `FORMSPREE_APPOINTMENT_ENDPOINT` in Vercel env.
4. Treat `failed` as a known failed attempt. The same submission can retry after Formspree recovers.
5. Treat `sending` as indeterminate. Check Formspree submission history and Vercel logs before changing it:
   - confirmed delivered -> manually mark the row `delivered`
   - confirmed not delivered -> manually mark the row `failed`, then retry
6. Never bulk-reset `sending` rows or retry them without provider evidence; the original notification may have succeeded.
7. Manually notify the front desk to call back any lead whose notification is not confirmed.

## Lead lifecycle operating rule

Stored lifecycle fields remain available for a dedicated dashboard outside this repo.

1. Move a new lead to `contacted` after a real outreach attempt.
2. Use `booked` only after the office confirms an appointment; a website request alone is not booked.
3. Use `arrived` after the first confirmed visit occurs.
4. Use `no-show` when the confirmed first visit is missed.
5. Use `lost` only with a short operational reason. Keep clinical details out of staff notes.

## Incident: Legacy redirects broken

Symptoms:

- old URLs no longer resolve to expected targets

Actions:

1. Verify redirect rules in `next.config.ts`.
2. Verify middleware redirects for:
   - apex/noncanonical custom host to `https://www.famfirstsmile.com`
   - `/?page_id=1073` to `/patient-info`
   - `/Book-Appointment` to `/book-appointment`
   - `/Services/Invisalign` to `/services/invisalign`
3. Deploy fix and run redirect smoke tests.

## Incident: Push landed on GitHub but not visible in Vercel

Symptoms:

- latest commit exists on GitHub `main`
- no matching Vercel deployment appears

Actions:

1. Verify GitHub default branch:
   - `gh repo view enzo-prism/tim-next-js --json defaultBranchRef`
2. If not `main`, stop and correct the repository setting as a separate explicit administrative action.
3. Reconnect Vercel Git integration:
   - `vercel git connect https://github.com/enzo-prism/tim-next-js.git`
4. If no deployment for the exact `main` commit appears after reconnecting, run the guarded CLI
   fallback:
   - `npm run release:prod -- --schema-synced`
5. If the guarded release fails on env validation, add the missing production env names in Vercel before retrying.
6. Confirm new production deployment is Ready:
   - `vercel ls tim-next-js`

## Routine Operational Tasks

## Refresh the public Google review snapshot

The website uses a manually verified review snapshot; it does not fetch Google reviews at runtime.

1. Open the direct Google Business Profile for **Tim J Chuang, DDS - Family First Smile Care** and confirm the Los Gatos address before copying any data.
2. Record the live Google review count, displayed average rating, verification date, and the recent public reviews selected for the website. The total includes every rating; the website excerpts remain curated and do not represent every review.
3. Treat Google as the count source of truth. Prefer the authenticated Business Profile API when it is healthy. As of August 19, 2026, the Account Management API quota for project `prism-website-462504` is configured at zero requests per minute, so use the signed-in Google Business Profile UI and record that limitation. Google-synced third-party listings are corroboration only.
4. Update `src/content/testimonials.ts`:
   - `testimonialsPageSummary` controls the Google count on the homepage and Santa Cruz page.
   - `testimonialsReviewLibrarySummary` controls the combined Google and Yelp label on `/testimonials`; change only the Google portion unless Yelp was separately reverified.
   - `publicReviewFeedSections` contains the selected public review excerpts.
   - `verifiedAtLabel` must say exactly what was verified and when.
5. Preserve each selected reviewer's displayed name, rating, meaning, and posted date. Use a short verbatim excerpt instead of silently rewriting the review.
6. Update `src/content/testimonials.test.ts`, then run `npm run quality:all`.
7. Render `/`, `/testimonials`, and `/areas-we-serve/santa-cruz` locally and confirm the count, verification label, reviewer names, ratings, and dates.
8. After deployment, read the same three production pages back and confirm the production deployment commit matches GitHub `main`.

This workflow is read-only on Google. Publishing or deleting a business reply, reporting a review, or editing the Business Profile is a separate external action and is not part of a website refresh.

## Add a new public route to sitemap

1. Add route in `src/content/routes.ts`.
2. Ensure metadata mapping is added if needed.
3. Deploy and verify `/sitemap.xml` includes route.

## Backup and recovery note

- Postgres backup/restore is handled at provider level.
- Before high-risk schema changes, ensure a backup checkpoint exists.

## On-Call Escalation Template

When escalating, include:

1. Incident start time (UTC and local)
2. Blast radius (public routes, form APIs, cron jobs)
3. First failing endpoint and status code
4. Recent deployment SHA
5. Logs excerpt and attempted mitigations
