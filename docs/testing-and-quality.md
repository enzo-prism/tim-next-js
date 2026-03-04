# Testing and Quality

## Current Quality Gates

CI workflow (`.github/workflows/ci.yml`) runs:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

`npm run test` currently uses Vitest with `--passWithNoTests`, so this repo relies heavily on static checks plus smoke testing.

## Local Developer Workflow

Run before opening a PR:

```bash
npm ci
npm run check
npm run build
```

## Test Strategy (Parity-Focused)

## 1) Route and redirect parity

Validate these return `200`:

- `/`
- `/about`
- `/services`
- `/contact`
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
5. Admin interface remains protected and non-indexable.

## Suggested Automated Test Additions

Priority order:

1. API contract tests for `/api/contacts` and `/api/admin/*`.
2. Redirect integration tests.
3. Metadata snapshot tests for key routes.
4. Playwright smoke tests for primary user journeys.

## Release Readiness Checklist

A release is ready when:

1. CI checks pass on target commit.
2. Preview deployment smoke tests pass.
3. Route and redirect parity checklist passes.
4. Contact submit + admin access verified.
5. GA4 script and pageview flow verified on preview or production.
