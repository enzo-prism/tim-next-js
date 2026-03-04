# Family First Smile Care (Next.js Rebuild)

Full Next.js App Router rebuild of the original Family First Smile Care website, migrated from a Replit Vite/Express stack to Vercel-ready architecture.

## Stack

- Next.js 15 + App Router
- TypeScript (strict)
- Tailwind CSS + shadcn-style UI primitives
- Drizzle ORM + Vercel Postgres
- Basic Auth middleware for `/admin` and `/api/admin/*`

## Route Parity

Public routes implemented:

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
- `/tmj`
- `/privacy-policy`
- `/sitemap`
- `/font-test`
- `/admin`
- custom 404

Legacy redirects implemented:

- `/hello-world` -> `/`
- `/dental-services/dental-crowns` -> `/services/dental-crowns`
- `/digital-x-ray` -> `/services/dental-exams`
- `/articles/premium_education/category/47362` -> `/services`
- `/articles/premium_education/category/47364` -> `/services`
- `/articles/premium_education/category/47367` -> `/services`
- `/?page_id=1073` -> `/patient-info`
- `/services/tmj` -> `/tmj`
- `www.*` host -> apex host (middleware)

## API Parity

- `POST /api/contacts`
- `GET /api/admin/changelog`
- `GET /api/admin/contacts?limit=&offset=&q=`
- `GET /api/admin/ga4/overview?days=7|30|90`
- `GET /api/admin/gsc/overview?days=7|30|90`

## SEO/Crawlers

- Per-route metadata via shared resolver
- LocalBusiness JSON-LD injected globally
- Service + FAQ JSON-LD preserved on service/marketing pages
- `src/app/robots.ts` -> `/robots.txt`
- `src/app/sitemap.ts` -> `/sitemap.xml`
- `public/llms.txt` -> `/llms.txt`
- `/sitemap` human-readable page

## Environment Variables

Copy `.env.example` to `.env.local` and fill values.

Production-critical:

- `DATABASE_URL`
- `ADMIN_PASSWORD`

Optional but recommended:

- `GA4_PROPERTY_ID`
- `GSC_SITE_URL`
- `GOOGLE_SERVICE_ACCOUNT_JSON` (or `_BASE64` / `GOOGLE_APPLICATION_CREDENTIALS`)

## Local Development

```bash
npm ci
npm run dev
```

Checks:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Vercel CLI Workflow

```bash
# authenticate if needed
vercel login

# create and link project
vercel project add tim-next-js
vercel link --yes --project tim-next-js

# inspect envs
vercel env ls
```

Then add env vars in Vercel dashboard (or `vercel env add`), run a preview deploy, and promote after smoke tests pass.

## GitHub

Repo: [enzo-prism/tim-next-js](https://github.com/enzo-prism/tim-next-js)

CI is configured in `.github/workflows/ci.yml` to run:

- typecheck
- lint
- test
- production build
