# Testing and Quality

## Current Quality Gates

CI workflow (`.github/workflows/ci.yml`) runs:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`
4. `npm run design:check`
5. `npm run minimal:check`
6. `npm run build`
7. `npm run test:e2e`

`npm run test` uses Vitest. The current suite covers analytics sanitization and conversion dedupe,
booking-step events, form schemas, request guards, atomic notification claims,
contact/appointment persistence and lifecycle behavior, concurrent idempotency recovery, GSC
opportunity scoring, metadata and internal-link contracts, mixed-case Ads redirects, accessibility
source contracts, and admin middleware. Playwright covers key browser-level design, mobile
navigation, widget behavior, and durable-lead conversion behavior in CI.

`npm run test:e2e` now exercises the production runtime instead of `next dev`:

- local runs build first, then serve with `next start`
- CI reuses the earlier build artifact and serves it with `next start`
- route checks use `domcontentloaded` plus explicit page assertions so they do not depend on third-party assets finishing every `load` event

## ElevenLabs Widget Coverage

- Widget bundle is pinned to `https://unpkg.com/@elevenlabs/convai-widget-embed@0.11.4`
- Agent ID is `agent_4801kn7ednjse6drbr2cnt62kkp2`
- Widget renders on all public routes and is intentionally excluded from `/admin`
- The launcher remains hidden until the visitor resolves the analytics consent choice
- Host-side launcher copy is applied through the widget's supported `text-contents` JSON attribute for `0.11.4`
- Browser coverage lives in Playwright under `tests/e2e/elevenlabs-widget.spec.ts`
- Automated browser tests stub the external widget script so layout, launcher behavior, and coexistence checks stay deterministic in CI
- Manual QA still needs one live pass with the real ElevenLabs script before release

## Mobile Menu Coverage

- Browser coverage lives in `tests/e2e/mobile-menu.spec.ts`
- The regression test uses a short `390x568` viewport, confirms the menu has a scrollable region, and verifies the final `Pay Bill` link can be scrolled into view

## Local Developer Workflow

Run before opening a PR:

```bash
npm ci
npm run quality:all
npx playwright install --with-deps chromium
npm run test:e2e
```

## Test Strategy (Parity-Focused)

## 1) Route and redirect parity

Validate these return `200`:

- `/`
- `/about`
- `/services`
- `/contact`
- `/areas-we-serve/santa-cruz`
- `/book-appointment`
- `/team`
- `/patient-info` and child pages
- `/tmj`

Validate these redirect as expected:

- `/hello-world` -> `/`
- `/dental-services/dental-crowns` -> `/services/dental-crowns`
- `/digital-x-ray` -> `/services/dental-exams`
- `/services/tmj` -> `/tmj`
- `/Book-Appointment?utm_source=google` -> `/book-appointment?utm_source=google`
- `/Services/Invisalign?gclid=test` -> `/services/invisalign?gclid=test`
- `/?page_id=1073` -> `/patient-info`
- `https://famfirstsmile.com` -> `https://www.famfirstsmile.com`

## 2) API contract validation

### Contact API

- valid new payload returns a PII-safe `201` response after persistence
- repeated submission UUID returns the existing lead without duplicate notification
- contact accepts the contact-only `"other"` service choice; appointment rejects it
- concurrent requests can claim a notification only once
- a known relay failure releases the claim for retry
- a successful provider call followed by a failed status write does not trigger an automatic resend
- malformed payload returns `400` with `errors`
- oversized, non-JSON, and untrusted-browser requests are rejected before persistence
- best-effort throttling is enforced per server instance and per request fingerprint
- storage failure returns `500`

### Appointment API

- valid payload returns:
  - `201` with `delivered: true` when Formspree relay succeeds
  - `202` with `delivered: false` when relay fails but DB write succeeds
- malformed payload returns `400` with `errors`
- honeypot-filled payload returns `400`
- unknown service and past preferred date return `400`
- a concurrent duplicate insert resolves to the existing lead without a second relay
- a notification claim failure keeps the saved lead and returns the fallback response

### Admin API auth

- no auth returns `401` with `WWW-Authenticate`
- wrong auth returns `401`
- valid auth returns `200` for:
  - `/api/admin/contacts`
  - `/api/admin/changelog`

### Lead lifecycle

- status filtering and source filtering return only matching rows
- lifecycle updates set the relevant timestamp and require a lost reason for `lost`
- source summaries calculate lead, booked, and arrived rates without sending patient data to analytics

### Analytics API behavior

- missing config returns `503` with `missing_config`
- configured state returns expected payload shapes

## 3) SEO and crawl checks

Verify:

- route metadata title/description/canonical
- Santa Cruz route metadata title/description/canonical
- `/robots.txt` reachable and correct
- `/sitemap.xml` includes all canonical routes
- `/llms.txt` reachable
- structured data present on applicable pages

## 4) UX and accessibility checks

Manual checks on desktop and mobile:

1. Skip link works.
2. Keyboard navigation reaches all critical controls.
3. Color contrast and heading hierarchy are sane.
4. Contact form has clear validation messaging.
5. Booking form has accessible two-step progress, keyboard focus management, validation, and clear delivered/fallback success states.
6. Admin interface remains protected and non-indexable.
7. ElevenLabs launcher stays inside the viewport on `/`, `/contact`, `/book-appointment`, and `/blog`.
8. ElevenLabs launcher does not introduce horizontal overflow on any supported viewport.
9. ElevenLabs widget stays below Radix toasts and does not block the sticky header or mobile sheet.
10. On short mobile viewports, every menu item remains reachable by scrolling.

## Suggested Automated Test Additions

Priority order:

1. Admin contacts API contract tests with a mocked storage boundary.
2. Redirect integration tests beyond the current middleware unit coverage.
3. Metadata snapshot tests for key routes.
4. Playwright smoke tests for the full appointment journey using a mocked API response.
5. A managed cross-instance rate-limit integration test when shared rate-limit storage is introduced.

## Security Coverage Notes

- Public form throttling is still best-effort unless a shared store or edge/WAF rate limit is added in front of the app.
- Admin auth throttles repeated failed sign-ins, but it is still one shared password rather than per-person identity.
- CSP is in `report-only` mode first so violations can be observed before enforcement.

## Release Readiness Checklist

A release is ready when:

1. CI checks pass on target commit.
2. Preview deployment smoke tests pass.
3. Route and redirect parity checklist passes.
4. If migration files changed, the new migrations are applied in numeric order; `npm run db:verify`
   always passes against the intended production database.
5. A synthetic contact/appointment submission is verified in preview or another non-production environment; production smoke tests use invalid payloads so they cannot create leads.
6. Admin protection and an authorized status-only read are verified without printing patient records.
7. GA4 script and pageview flow verified on preview or production.
8. ElevenLabs widget smoke tests pass across desktop, tablet, and mobile viewports.
