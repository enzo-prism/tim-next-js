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

`npm run test` uses Vitest. The current suite covers analytics sanitization and conversion dedupe, booking-step events, form schemas, request guards, notification routing, contact/appointment persistence and lifecycle behavior, concurrent idempotency recovery, GSC opportunity scoring, and admin middleware. Playwright covers key browser-level design and widget behavior in CI.

## ElevenLabs Widget Coverage

- Widget bundle is pinned to `https://unpkg.com/@elevenlabs/convai-widget-embed@0.11.4`
- Agent ID is `agent_4801kn7ednjse6drbr2cnt62kkp2`
- Widget renders on all public routes and is intentionally excluded from `/admin`
- Host-side launcher copy is applied through the widget's supported `text-contents` JSON attribute for `0.11.4`
- Browser coverage lives in Playwright under `tests/e2e/elevenlabs-widget.spec.ts`
- Automated browser tests stub the external widget script so layout, launcher behavior, and coexistence checks stay deterministic in CI
- Manual QA still needs one live pass with the real ElevenLabs script before release

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
- `/?page_id=1073` -> `/patient-info`
- `https://famfirstsmile.com` -> `https://www.famfirstsmile.com`

## 2) API contract validation

### Contact API

- valid new payload returns a PII-safe `201` response after persistence
- repeated submission UUID returns the existing lead without duplicate notification
- malformed payload returns `400` with `errors`
- oversized, non-JSON, and untrusted-browser requests are rejected before persistence
- storage failure returns `500`

### Appointment API

- valid payload returns:
  - `201` with `delivered: true` when Formspree relay succeeds
  - `202` with `delivered: false` when relay fails but DB write succeeds
- malformed payload returns `400` with `errors`
- honeypot-filled payload returns `400`
- unknown service and past preferred date return `400`
- a concurrent duplicate insert resolves to the existing lead without a second relay

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

## Suggested Automated Test Additions

Priority order:

1. Admin contacts API contract tests with a mocked storage boundary.
2. Redirect integration tests beyond the current middleware unit coverage.
3. Metadata snapshot tests for key routes.
4. Playwright smoke tests for the full appointment journey using a mocked API response.
5. A managed cross-instance rate-limit integration test when shared rate-limit storage is introduced.

## Release Readiness Checklist

A release is ready when:

1. CI checks pass on target commit.
2. Preview deployment smoke tests pass.
3. Route and redirect parity checklist passes.
4. Production schema migration is applied and `npm run db:verify` passes against the intended database.
5. A synthetic contact/appointment submission is verified in preview or another non-production environment; production smoke tests use invalid payloads so they cannot create leads.
6. Admin protection and an authorized status-only read are verified without printing patient records.
7. GA4 script and pageview flow verified on preview or production.
8. ElevenLabs widget smoke tests pass across desktop, tablet, and mobile viewports.
