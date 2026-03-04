# Routing and SEO

## Canonical Host

- Primary canonical host is controlled by `CANONICAL_HOST`.
- Public fallback in code is `https://famfirstsmile.com`.
- `NEXT_PUBLIC_CANONICAL_HOST` is used by some client-facing canonical logic.

## Public Routes

Implemented App Router pages:

- `/`
- `/about`
- `/services`
- `/services/[serviceId]`
- `/services/childrens-dentistry/babys-first-visit`
- `/services/invisalign`
- `/technology/itero-digital-scanner`
- `/team`
- `/patient-info`
- `/patient-info/brushing`
- `/patient-info/flossing`
- `/patient-info/nutrition`
- `/contact`
- `/book-appointment`
- `/tmj`
- `/privacy-policy`
- `/sitemap`
- `/font-test`
- `/admin` (auth-protected)
- custom 404

## Service Route Behavior

- Dynamic service detail route: `/services/[serviceId]`
- Static params generated from `src/content/services.ts` in `src/app/services/[serviceId]/page.tsx`.
- Service IDs containing `/` are excluded from dynamic route generation and handled by explicit routes.
- `tmj` is modeled as a service but canonicalized to `/tmj`.

## Legacy Redirects

Configured in `next.config.ts` and middleware:

- `/hello-world` -> `/`
- `/dental-services/dental-crowns` -> `/services/dental-crowns`
- `/digital-x-ray` -> `/services/dental-exams`
- `/articles/premium_education/category/47362` -> `/services`
- `/articles/premium_education/category/47364` -> `/services`
- `/articles/premium_education/category/47367` -> `/services`
- `/services/tmj` -> `/tmj`
- `/?page_id=1073` -> `/patient-info` (middleware)
- `www.*` host -> apex host (middleware)

## Metadata Strategy

- Metadata for each route is built via:
  - `buildRouteMetadata(path)` in `src/lib/metadata.ts`
  - source mapping in `src/content/seo.ts`
- Static route metadata:
  - explicit title and description map in `staticMeta`
- Dynamic service metadata:
  - generated from `src/content/services.ts` when route starts with `/services/`
- Canonical normalization:
  - `resolveCanonicalPath` with TMJ override

## Structured Data

- Global LocalBusiness schema is injected from `src/app/layout.tsx` via:
  - `buildLocalBusinessSchema()` in `src/content/structured-data.ts`
- Service and FAQ schema helpers are provided by:
  - `buildServiceSchema(...)`
  - `buildFaqSchema(...)`
- Legacy pages consume these helpers where needed (for example Invisalign and iTero pages).

## Crawl Assets

- `GET /robots.txt` from `src/app/robots.ts`
  - allows crawling except `/api/` and `/admin`
- `GET /sitemap.xml` from `src/app/sitemap.ts`
  - built from `allCanonicalRoutes`
- `/sitemap` human-readable page
- `/llms.txt` static file in `public/llms.txt`

## Route Inventory Sources

- `src/content/routes.ts`
  - `staticSiteRoutes`
  - `serviceRoutes`
  - `allCanonicalRoutes`
- `src/lib/routes.ts`
  - `getServiceHref(serviceId)` handles TMJ path special-case

## SEO Validation Checklist

1. Check route metadata in page source for title/description/canonical tags.
2. Verify OpenGraph/Twitter image and text values.
3. Confirm `/robots.txt`, `/sitemap.xml`, and `/llms.txt` return `200`.
4. Verify redirect targets and status codes for all legacy routes.
5. Validate JSON-LD snippets with Google Rich Results Test.
