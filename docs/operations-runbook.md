# Operations Runbook

## Purpose

Provide a fast, repeatable response guide for production incidents and routine operations.

## Service Map

- Public site: Next.js app on Vercel
- Contact persistence: Postgres via Drizzle (`contacts` table)
- Appointment relay: `POST /api/appointments` -> internal DB + Formspree relay
- Admin auth: single-password session cookie (`/admin`, `/admin/*`, `/api/admin/*`); sign in at `/admin/login`
- Admin auth throttling: repeated failed attempts return `429` with `Retry-After`
- ElevenLabs widget: pinned custom-element embed on public routes only
- Analytics APIs:
  - GA4: `/api/admin/ga4/overview`
  - GSC: `/api/admin/gsc/overview`

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
2. Verify admin analytics endpoints return healthy payloads.
3. Confirm Vercel Analytics, GA4 Realtime, and Search Console data are flowing.
4. Confirm the ElevenLabs widget still loads from the pinned `0.11.4` embed URL.
5. Review unworked `new` leads, `failed` and `sending` notification rows, source booking rates, and Search Console opportunity candidates.
6. Review CSP report-only logs for new blocked domains before switching to enforcing mode.
7. Compare Google Ads conversions against GA4 `generate_lead` for the same window. A large gap means a primary conversion action is keyed to something that cannot fire, not that leads stopped. See "Google Ads account configuration" in [Analytics Setup](./analytics-setup.md).
8. Confirm GA4 traffic acquisition still shows `google / cpc` for paid visits. A drift back to `(direct)` or `googleads.g.doubleclick.net / referral` means campaign parameters stopped reaching `page_location`.

## ElevenLabs Widget Notes

- Agent ID: `agent_4801kn7ednjse6drbr2cnt62kkp2`
- Bundle URL: `https://unpkg.com/@elevenlabs/convai-widget-embed@0.11.4`
- Route scope: all public pages, excluded from `/admin`
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

## Incident: Admin login suddenly fails

Symptoms:

- `/admin/login` rejects the expected password, or
- authenticated admin API requests return `401`

Actions:

1. Confirm the `ADMIN_PASSWORD` name is present in Vercel production without printing its value.
2. Open `/admin/login` and sign in with the password-manager entry. There is no username or
   browser Basic Auth prompt.
3. Confirm `/admin` loads and a status-only request to `/api/admin/contacts?limit=1` returns `200`
   in the same authenticated browser. Do not copy lead data into logs or screenshots.
4. If the password is still rejected, rotate `ADMIN_PASSWORD`, update the password manager, and
   deploy once so the new runtime receives it.
5. If repeated failures are throttled (`429`), wait for the `Retry-After` window before retrying.

## Admin auth hardening path

The current production control is a shared password plus sign-in throttling. A stronger path requires infrastructure that is not part of this repo today:

1. move admin access behind an identity-aware proxy or SSO-capable edge product
2. issue individual accounts instead of one shared password
3. require MFA at the identity layer
4. keep the current middleware only as a narrow fallback during migration

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
- appointments still appear in admin contacts with `requestType=appointment`
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

## Incident: Admin contacts list fails

Symptoms:

- `/api/admin/contacts` returns `500`

Actions:

1. Verify auth first (401 vs 500).
2. Check Postgres connectivity and table existence.
3. Verify no schema mismatch in `contacts` columns.
4. Confirm environment has correct `DATABASE_URL`.
5. Run `npm run db:verify` to confirm lifecycle columns, constraints, and indexes are present.

## Lead lifecycle operating rule

1. Move a new lead to `contacted` after a real outreach attempt.
2. Use `booked` only after the office confirms an appointment; a website request alone is not booked.
3. Use `arrived` after the first confirmed visit occurs.
4. Use `no-show` when the confirmed first visit is missed.
5. Use `lost` only with a short operational reason. Keep clinical details out of staff notes.

## Incident: GA4/GSC cards show missing config

Symptoms:

- endpoint returns `503` + `missing_config`

Actions:

1. Validate `GA4_PROPERTY_ID` and `GSC_SITE_URL`.
2. On Vercel, validate `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` (preferred) or
   `GOOGLE_SERVICE_ACCOUNT_JSON`. Use `GOOGLE_APPLICATION_CREDENTIALS` only for a local runtime
   where the referenced file actually exists.
3. Confirm service account permissions in:
   - GA4 property access
   - Search Console property access
4. Re-test endpoints.

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

## Rotate admin password

1. Create new strong value for `ADMIN_PASSWORD`.
2. Update Vercel env:
   - `vercel env add ADMIN_PASSWORD production`
3. Redeploy production.
4. Validate with authenticated admin API request.

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
2. Blast radius (public routes, admin only, API only)
3. First failing endpoint and status code
4. Recent deployment SHA
5. Logs excerpt and attempted mitigations
