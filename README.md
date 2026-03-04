# Family First Smile Care (Next.js)

Production-grade Next.js rebuild of the Family First Smile Care website, migrated from a Replit Vite/Express stack and optimized for Vercel deployment.

## What This Repo Contains

- Full public website route parity
- Admin dashboard protected with Basic Auth
- Contact form persistence using Postgres via Drizzle ORM
- GA4 + Google Search Console admin reporting APIs
- Canonical SEO + schema.org JSON-LD + sitemap/robots/llms assets
- Vercel-ready routing, headers, and deployment flow

## Quick Start

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
npm run check
```

## Documentation Index

- [Docs Hub](docs/README.md)
- [Architecture](docs/architecture.md)
- [Routing and SEO](docs/routing-and-seo.md)
- [API Reference](docs/api-reference.md)
- [Environment Variables](docs/environment-variables.md)
- [Analytics Setup (GA4 + GSC)](docs/analytics-setup.md)
- [Deployment on Vercel](docs/deployment-vercel.md)
- [Operations Runbook](docs/operations-runbook.md)
- [Testing and Quality](docs/testing-and-quality.md)
- [Migration Parity Checklist](docs/parity-checklist.md)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict)
- Tailwind CSS + component primitives
- React Query (client data fetching in admin)
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

# Database schema push
npm run db:push
```

## Deployment Summary

1. Push to GitHub `main`.
2. Ensure Vercel project framework is `nextjs`.
3. Ensure required env vars are configured.
4. Run `npm run db:push` against production database.
5. Deploy with `vercel --prod`.
6. Run smoke tests on routes, redirects, APIs, and admin auth.

See [Deployment on Vercel](docs/deployment-vercel.md) for full details.

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

Checks run on PRs and pushes to `main` / `codex/**`:

- typecheck
- lint
- test
- build
