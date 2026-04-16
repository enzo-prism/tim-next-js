# Testing and Quality

## Current Quality Gates

CI workflow (`.github/workflows/ci.yml`) runs:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

`npm run test` currently uses Vitest with `--passWithNoTests`, so this repo relies heavily on static checks plus smoke testing.

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
npm run check
npm run build
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
- `https://www.<domain>` -> `https://<domain>`

## 2) API contract validation

### Contact API

- valid payload returns `201` and persisted object
- malformed payload returns `400` with `errors`
- storage failure returns `500`

### Appointment API

- valid payload returns:
  - `201` with `delivered: true` when Formspree relay succeeds
  - `202` with `delivered: false` when relay fails but DB write succeeds
- malformed payload returns `400` with `errors`
- honeypot-filled payload returns `400`

### Admin API auth

- no auth returns `401` with `WWW-Authenticate`
- wrong auth returns `401`
- valid auth returns `200` for:
  - `/api/admin/contacts`
  - `/api/admin/changelog`

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
5. Booking form has clear delivered/fallback success states.
6. Admin interface remains protected and non-indexable.
7. ElevenLabs launcher stays inside the viewport on `/`, `/contact`, `/book-appointment`, and `/blog`.
8. ElevenLabs launcher does not introduce horizontal overflow on any supported viewport.
9. ElevenLabs widget stays below Radix toasts and does not block the sticky header or mobile sheet.

## Suggested Automated Test Additions

Priority order:

1. API contract tests for `/api/contacts` and `/api/admin/*`.
2. Redirect integration tests.
3. Metadata snapshot tests for key routes.
4. Playwright smoke tests for primary user journeys.
5. Playwright smoke tests for ElevenLabs widget placement, expand/collapse behavior, and toast coexistence.

## Release Readiness Checklist

A release is ready when:

1. CI checks pass on target commit.
2. Preview deployment smoke tests pass.
3. Route and redirect parity checklist passes.
4. Contact submit + admin access verified.
5. GA4 script and pageview flow verified on preview or production.
6. ElevenLabs widget smoke tests pass across desktop, tablet, and mobile viewports.
