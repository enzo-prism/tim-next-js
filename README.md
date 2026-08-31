# Family First Smile Care (Next.js)

Production-grade Next.js rebuild of the Family First Smile Care website, migrated from a Replit Vite/Express stack and optimized for Vercel deployment.

## What This Repo Contains

- Full public website route parity
- Contact and appointment persistence using Postgres via Drizzle ORM
- First-party forms with duplicate protection, campaign attribution, consent records, and Formspree office notifications
- Vercel Web Analytics + GA4 public measurement
- No on-site staff leads dashboard; `/admin` is not part of the public site
- Canonical SEO + schema.org JSON-LD + sitemap/robots/llms assets
- Vercel-ready routing, headers, and deployment flow

## Quick Start

Prerequisite: Node.js `20.9.0` or newer.

1. Install dependencies.

```bash
npm ci
```

2. Create local env file.

```bash
cp .env.example .env.local
```

3. Start dev server.

```bash
npm run dev
```

4. Open locally:

- `http://localhost:3000`

5. Run quality checks.

```bash
npm run quality:all
```

## Documentation Index

- [Docs Hub](docs/README.md)
- [Release Notes](docs/release-notes.md)
- [Architecture](docs/architecture.md)
- [Routing and SEO](docs/routing-and-seo.md)
- [API Reference](docs/api-reference.md)
- [Environment Variables](docs/environment-variables.md)
- [Analytics Setup (Vercel + GA4 + Ads + GSC)](docs/analytics-setup.md)
- [Growth and Lead Measurement](docs/growth-and-lead-measurement.md)
- [Deployment on Vercel](docs/deployment-vercel.md)
- [Operations Runbook](docs/operations-runbook.md)
- [Testing and Quality](docs/testing-and-quality.md)
- [Migration Parity Checklist](docs/parity-checklist.md)

## Current Release

The August 31, 2026 release removes the password-protected on-site leads
dashboard from the public website. Staff reporting now lives outside this repo.
Public forms, Formspree office notifications, first-party duplicate protection,
GA4, and Vercel Web Analytics stay in place.

See [Release Notes](docs/release-notes.md) for the complete scope and
verification record, and [Operations Runbook](docs/operations-runbook.md) for
the manual review-refresh procedure.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict)
- Tailwind CSS + component primitives
- React Query (client data fetching for public forms)
- Drizzle ORM + Postgres
- Vercel runtime + middleware

## Core Commands

```bash
# Local app
npm run dev

# Static checks
npm run typecheck
npm run lint
npm run test
npm run build
npm run check
npm run test:e2e

# Local schema prototyping only; never use db:push against production
npm run db:push
# Read-only production schema verification (requires the intended DATABASE_URL)
npm run db:verify
```

## Deployment Summary

1. Keep GitHub default branch set to `main`.
2. Ensure Vercel Git integration is connected to `enzo-prism/tim-next-js`.
3. Ensure required env vars are configured.
4. If the release adds migrations, determine which files are not yet applied and apply only those
   in numeric order. Never replay non-idempotent migrations. Always run `npm run db:verify`
   against production; start with `0000_base_schema.sql` only when bootstrapping a fresh database.
5. Verify the migration succeeded, then push the reviewed commit to `main` and wait for the
   Git-connected Vercel production deployment.
6. If no matching Git deployment appears, run the guarded CLI fallback from clean, aligned
   `main`:

```bash
npm run release:prod -- --schema-synced
```

7. Run smoke tests on public routes, redirects, and form APIs. Confirm `/admin` 404s. Do not run a
   second CLI deployment after the matching Git deployment is `READY`.

See [Deployment on Vercel](docs/deployment-vercel.md) for full details.

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

Checks run on PRs and pushes to `main` / `codex/**`:

- typecheck
- lint
- test
- design contract and minimal design checks
- production build
- Playwright E2E
