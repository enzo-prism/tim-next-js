# Architecture

## Overview

This codebase is a Next.js 15 App Router application that preserves behavior from the legacy Replit site while running in a Vercel-native architecture.

Primary design goals:

- Preserve public route and SEO parity
- Turn qualified local traffic into measurable new-patient leads
- Keep admin functionality behind auth
- Persist contacts in production Postgres
- Keep analytics/reporting endpoints explicit, privacy-safe, and debuggable

## Runtime Model

### Public site rendering

1. Next.js route in `src/app/**/page.tsx` is requested.
2. Route-level metadata is generated via `buildRouteMetadata(...)` in `src/lib/metadata.ts`.
3. Most App Router pages delegate rendering to components in `src/legacy-pages/*`.
4. Global layout (`src/app/layout.tsx`) injects site shell, GA script, and LocalBusiness JSON-LD.

### Contact form flow

1. Contact page posts to `POST /api/contacts`.
2. The public-form guard enforces JSON, trusted browser origin, actual streamed body size, honeypot, and a best-effort per-instance rate limit.
3. The shared Zod contract validates contact details, a known service or the contact-only `"other"` choice, consent, submission UUID, and bounded attribution fields.
4. The submission UUID is checked before insert and is protected by a unique database index, preventing duplicate leads. It is also bound to the form type and normalized stored payload. Reusing it with changed data returns `409` instead of changing or relaying a different lead.
5. The lead starts with `formspreeStatus="failed"`. Before relay, the server atomically claims it by changing the state to `sending`, so concurrent requests cannot both notify the office.
6. A known relay failure returns the state to `failed` for a later retry. Success changes it to `delivered`.
7. An indeterminate `sending` state is not retried automatically. It requires manual reconciliation because Formspree does not provide a verified idempotency key and an automatic retry could create a duplicate notification.
8. Storage backend is selected by environment:
   - Production: Postgres-backed `DatabaseStorage` (requires `DATABASE_URL`)
   - Development without DB: in-memory fallback
   - Production without DB: explicit unavailable storage error

### Appointment flow (custom scheduling page)

1. `/book-appointment` uses a two-step client flow: required contact/service details, then optional scheduling preferences and consent.
2. Privacy-safe step-view, step-complete, and abandonment events identify funnel loss without sending form contents.
3. The completed request posts once to `POST /api/appointments`.
4. The same public-form guard, consent, attribution, and idempotency protections used by the contact form run first.
5. `insertAppointmentSchema` additionally requires a known service, valid phone number, and a real preferred calendar date that is not in the past in Los Angeles time and falls on an open Monday-through-Thursday practice day.
6. Request is persisted first in `contacts` with:
   - `requestType="appointment"`
   - `preferredDate` / `preferredTime`
   - initial `formspreeStatus="failed"`
7. The server uses the same atomic `failed` -> `sending` notification claim as the contact endpoint, then relays the canonical stored row to `FORMSPREE_APPOINTMENT_ENDPOINT`. The notification includes the internal lead ID and submission UUID for reconciliation.
8. Relay outcomes:
   - success -> `formspreeStatus` updated to `delivered`, API returns `201`.
   - known failure -> state returns to `failed`, the DB record is retained, and the API returns `202 delivered:false`.
   - indeterminate `sending` -> no automatic resend; staff must reconcile provider and application records before changing the state.

### Admin flow

1. Middleware guards `/admin` and `/api/admin/*` using Basic Auth (`src/middleware.ts`).
2. Admin UI (`src/legacy-pages/admin.tsx`) queries:
   - `/api/admin/changelog`
   - `/api/admin/contacts`
   - `/api/admin/ga4/overview`
   - `/api/admin/gsc/overview`
3. GA4/GSC endpoints use Google service account auth (`src/server/admin/google.ts`) and return `missing_config` (`503`) when setup is incomplete.
4. Office staff can move leads through `new`, `contacted`, `booked`, `arrived`, `no-show`, or `lost`, add private notes/lost reasons, and compare booking/arrival rates by stored acquisition source.
5. Search Console reporting includes query-by-page rows and ranks positions 4-20 by impressions, rank potential, and CTR headroom. The score prioritizes work; it is not a traffic forecast.

### Attribution and conversion flow

1. `captureLeadAttribution()` stores first-touch landing page, external referrer hostname, CTA source, UTM values, and Google click IDs in session storage.
2. Contact and appointment submissions persist that attribution with the consent version and submission UUID.
3. No analytics or ad tag runs before the visitor opts in. `gtag` consent defaults are set to denied for analytics and ad storage before any tag loads, the GA script and Vercel Analytics mount only after consent is granted, and every event helper re-checks stored consent. A denied or undecided visitor emits nothing. The prompt itself is a low-emphasis bar whose accept and decline actions carry equal visual weight, so the presentation does not nudge the choice; see `docs/analytics-setup.md` for the constraints that keep it that way.
4. Public analytics receives only allow-listed, bounded event properties; names, emails, phone numbers, messages, and health details are excluded. `service_id` is allow-listed because it is a bounded enum of published service slugs.
5. Every analytics URL is reduced by `sanitizeAnalyticsUrl()` to its path plus allow-listed campaign parameters (`utm_*`, `gclid`, `gbraid`, `wbraid`, `dclid`, `msclkid`); the hash and all other query parameters are dropped. The same policy is applied to GA4 `page_location` and to Vercel Web Analytics via `beforeSend`, because GA4 derives session source and campaign from `page_location` and would otherwise report paid traffic as direct.
6. `generate_lead` is emitted after a durable new record is created. The appointment Google Ads event also uses the submission UUID as `transaction_id` for deduplication.
7. A Formspree delivery failure produces a saved-lead fallback state and call prompt instead of losing the lead or claiming full delivery.

## Directory Responsibilities

- `src/app`: Route handlers, pages, metadata routes (`robots.ts`, `sitemap.ts`)
- `src/legacy-pages`: Main page implementations reused by App Router wrappers
- `src/components`: Shared UI and layout components
- `src/content`: Structured content and SEO/schema definitions
- `src/server`: DB schema/storage and admin server helpers
- `src/lib`: Metadata/tracking/internal linking utilities
- `src/types`: Public TypeScript DTO contracts
- `public`: Static assets and `llms.txt`

## Content and SEO Model

- Canonical/meta data:
  - `src/content/seo.ts`
  - `src/lib/metadata.ts`
- LocalBusiness + Service + FAQ schema:
  - `src/content/structured-data.ts`
- Canonical route inventory:
  - `src/content/routes.ts`
- Crawl assets:
  - `src/app/robots.ts`
  - `src/app/sitemap.ts`
  - `public/llms.txt`

## Security Model

- Middleware-enforced Basic Auth for admin routes
- Timing-safe password comparison logic
- `Cache-Control: no-store` on protected responses
- Production hard requirement for both `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- Security headers set in `next.config.ts`:
  - `Strict-Transport-Security`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - restrictive `Permissions-Policy`
- Public forms use validation, streamed size limits, origin checks, honeypots, rate limiting, consent records, and idempotency keys.
- Hotjar/session replay is intentionally not used on patient-facing pages.
- Analytics and ad measurement are opt-in; nothing is loaded or emitted until the visitor consents.
- Admin lead search is sent in a POST body so patient names never enter query strings, access logs, or browser history.

## Key Architectural Decisions

1. App Router wrappers + legacy pages:
   - Keeps migration stable while preserving exact page behavior.
2. Shared Zod form contracts plus Drizzle persistence schema:
   - Browser, API, and persistence expectations stay aligned without shipping the database toolchain to the browser.
3. Explicit missing-config API responses:
   - Admin analytics endpoints fail with actionable diagnostics, not silent zeros.
4. Canonical override for TMJ:
   - `/services/tmj` redirects/canonicalizes to `/tmj`.

## Recommended Next Refactor Milestones

1. Incrementally migrate `src/legacy-pages/*` into colocated App Router components.
2. Add a managed, cross-instance rate-limit store if abuse exceeds the current Vercel-instance guard.
3. Add a provider-supported idempotent notification outbox if manual follow-up on `failed` and `sending` rows becomes operationally expensive.
4. Replace ad-hoc changelog generation with a build artifact step.
