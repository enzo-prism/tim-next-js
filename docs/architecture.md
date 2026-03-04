# Architecture

## Overview

This codebase is a Next.js 15 App Router application that preserves behavior from the legacy Replit site while running in a Vercel-native architecture.

Primary design goals:

- Preserve public route and SEO parity
- Keep admin functionality behind auth
- Persist contacts in production Postgres
- Keep analytics/reporting endpoints explicit and debuggable

## Runtime Model

### Public site rendering

1. Next.js route in `src/app/**/page.tsx` is requested.
2. Route-level metadata is generated via `buildRouteMetadata(...)` in `src/lib/metadata.ts`.
3. Most App Router pages delegate rendering to components in `src/legacy-pages/*`.
4. Global layout (`src/app/layout.tsx`) injects site shell, GA script, and LocalBusiness JSON-LD.

### Contact form flow

1. Contact page posts to `POST /api/contacts`.
2. Payload is validated using `insertContactSchema` from `src/server/schema.ts`.
3. Persistence is handled through `storage.createContact(...)` in `src/server/storage.ts`.
4. Storage backend is selected by environment:
   - Production: Postgres-backed `DatabaseStorage` (requires `DATABASE_URL`)
   - Development without DB: in-memory fallback
   - Production without DB: explicit unavailable storage error

### Admin flow

1. Middleware guards `/admin` and `/api/admin/*` using Basic Auth (`src/middleware.ts`).
2. Admin UI (`src/legacy-pages/admin.tsx`) queries:
   - `/api/admin/changelog`
   - `/api/admin/contacts`
   - `/api/admin/ga4/overview`
   - `/api/admin/gsc/overview`
3. GA4/GSC endpoints use Google service account auth (`src/server/admin/google.ts`) and return `missing_config` (`503`) when setup is incomplete.

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
- Production hard requirement for `ADMIN_PASSWORD`
- Security headers set in `next.config.ts`:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`

## Key Architectural Decisions

1. App Router wrappers + legacy pages:
   - Keeps migration stable while preserving exact page behavior.
2. Drizzle schema as canonical data contract:
   - Validation and runtime types align across API and persistence.
3. Explicit missing-config API responses:
   - Admin analytics endpoints fail with actionable diagnostics, not silent zeros.
4. Canonical override for TMJ:
   - `/services/tmj` redirects/canonicalizes to `/tmj`.

## Recommended Next Refactor Milestones

1. Incrementally migrate `src/legacy-pages/*` into colocated App Router components.
2. Replace `<img>` usage in critical paths with `next/image`.
3. Add automated route/API smoke tests in CI.
4. Replace ad-hoc changelog generation with a build artifact step.
