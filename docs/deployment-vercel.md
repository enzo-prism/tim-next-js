# Deployment on Vercel

## Goal

Deploy the Next.js app from `main` to Vercel with full production parity:

- public routes and redirects
- admin auth and APIs
- contact persistence (Postgres)
- SEO assets (`robots.txt`, `sitemap.xml`, `llms.txt`)
- Vercel Web Analytics pageview collection on public routes

## Prerequisites

1. Node.js `20.9.0` or newer
2. Access to GitHub repo: `enzo-prism/tim-next-js`
3. Access to the production Vercel project:
   - project name: `tim-next-js`
   - project id: `prj_bzwJ806oFI1FxU70DEIi2iyV0sl1`
   - org id: `team_NbogaPSGlnnTm8RNaeS0B4Pl`
4. CLI tools installed and authenticated:
   - `gh auth status`
   - `vercel whoami`
5. Production secrets available:
   - `DATABASE_URL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - analytics variables from `docs/environment-variables.md`
6. Vercel Web Analytics enabled for the production Vercel project

## Critical Deployment Guardrails

The most common failure mode is branch/config drift:

- GitHub default branch is not `main`
- Vercel project is not connected to the GitHub repo
- local `.vercel/project.json` points at the wrong Vercel project

Verify before release:

```bash
gh repo view enzo-prism/tim-next-js --json defaultBranchRef
cat .vercel/project.json
vercel git connect https://github.com/enzo-prism/tim-next-js.git
```

If the default branch is not `main`, stop and correct the repository setting as a separate, explicit administrative action.
`vercel git connect` is safe to run repeatedly; it will report if already connected.
`.vercel/project.json` must match this production target:

- `projectName`: `tim-next-js`
- `projectId`: `prj_bzwJ806oFI1FxU70DEIi2iyV0sl1`
- `orgId`: `team_NbogaPSGlnnTm8RNaeS0B4Pl`

If it does not match, relink explicitly:

```bash
vercel link --yes --project prj_bzwJ806oFI1FxU70DEIi2iyV0sl1 --team team_NbogaPSGlnnTm8RNaeS0B4Pl
```

## One-Time Project Linking

If not already linked:

```bash
vercel link --yes --project prj_bzwJ806oFI1FxU70DEIi2iyV0sl1 --team team_NbogaPSGlnnTm8RNaeS0B4Pl
```

`.vercel/project.json` is local and intentionally ignored. The guarded release script links this exact project when the checkout is not linked, and it fails fast if the checkout is linked to any other Vercel project.

## Pre-Deploy Local Checks

Run from repo root:

```bash
npm ci
npm run quality:all
npm run test:e2e
```

If any command fails, do not deploy.

## Environment Setup

Set variables in Vercel for `production` (and `preview` where needed):

```bash
vercel env add DATABASE_URL production
vercel env add ADMIN_USERNAME production
vercel env add ADMIN_PASSWORD production
vercel env add CANONICAL_HOST production
vercel env add NEXT_PUBLIC_CANONICAL_HOST production
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_TAG_ID production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT production
vercel env add FORMSPREE_APPOINTMENT_ENDPOINT production
vercel env add FORMSPREE_CONTACT_ENDPOINT production
vercel env add GA4_PROPERTY_ID production
vercel env add GSC_SITE_URL production
vercel env add GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 production
```

Vercel Web Analytics does not require an app env var in this repo. It is controlled from the Vercel project dashboard plus the `@vercel/analytics` component already mounted in the app layout.

Inspect current env values:

```bash
vercel env ls
```

## Database Provisioning and Schema

1. Ensure `DATABASE_URL` points to the intended Vercel Postgres instance.
2. Apply the checked-in migration (preferred for this release) or reconcile with Drizzle:

```bash
psql "$DATABASE_URL" -f drizzle/0001_growth_lead_attribution.sql
psql "$DATABASE_URL" -f drizzle/0002_closed_loop_lead_pipeline.sql
# Or, after reviewing the generated diff:
npm run db:push
```

3. Read the production schema back before deployment:

```bash
npm run db:verify
```

Use production credentials locally only in a controlled release window.

## Deploy Flow

### Recommended guarded production release (fast path)

After applying the migration and verifying its read-back, run one command from clean `main`:

```bash
npm run release:prod -- --schema-synced
```

This script enforces:

1. clean git working tree
2. local `main` aligned with `origin/main`
3. GitHub default branch verified as `main` without changing repository settings
4. `.vercel/project.json` matches the production Vercel project for this repo
5. Vercel Git integration connected to this repo
6. explicit confirmation that the production schema was applied and verified
7. full quality checks (`npm run quality:all`)
8. production deploy via Vercel CLI

### Preview deploy

```bash
vercel
```

Validate preview URL before production promotion.

### Production deploy

```bash
vercel --prod
```

If you already ran `npm run release:prod -- --schema-synced`, do not run `vercel --prod` again unless intentionally creating another deployment.

## Post-Deploy Smoke Tests

Use production domain and preview domain checks.

### Route checks

```bash
curl -I https://www.famfirstsmile.com/
curl -I https://www.famfirstsmile.com/services
curl -I https://www.famfirstsmile.com/contact
curl -I https://www.famfirstsmile.com/book-appointment
curl -I https://www.famfirstsmile.com/tmj
```

### Redirect checks

```bash
curl -I https://www.famfirstsmile.com/hello-world
curl -I "https://www.famfirstsmile.com/?page_id=1073"
curl -I https://famfirstsmile.com/
curl -I https://www.famfirstsmile.com/services/tmj
```

### SEO asset checks

```bash
curl -I https://www.famfirstsmile.com/robots.txt
curl -I https://www.famfirstsmile.com/sitemap.xml
curl -I https://www.famfirstsmile.com/llms.txt
```

### Vercel analytics checks

1. Open the latest production deployment in a browser.
2. Visit at least two public routes such as `/` and `/services`.
3. Wait roughly 30-60 seconds and confirm traffic appears in the Vercel Analytics dashboard.
4. If no data appears, disable content blockers and retry navigation between pages.

### Non-mutating API checks

These deliberately invalid payloads verify the live guards without creating a lead or triggering an office notification. Submit realistic synthetic leads only in preview/non-production.

```bash
curl -i -X POST https://www.famfirstsmile.com/api/contacts \
  -H "Content-Type: application/json" \
  -d '{}'

curl -i -X POST https://www.famfirstsmile.com/api/appointments \
  -H "Content-Type: application/json" \
  -d '{}'
```

Both should return `400` and must not create a database row.

Admin unauthorized check:

```bash
curl -i https://www.famfirstsmile.com/api/admin/contacts
```

Admin authorized check:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  -u "${ADMIN_USERNAME}:${ADMIN_PASSWORD}" \
  "https://www.famfirstsmile.com/api/admin/contacts?limit=1&offset=0"
```

The authorized status-only check should print `200` without placing patient records in terminal output or logs.

## Rollback Strategy

1. In Vercel dashboard, promote previous known-good deployment.
2. If issue is env-related, correct env vars and redeploy.
3. If issue is schema-related, restore DB and redeploy previous commit.
4. Keep a short incident note in release logs.

## GitHub Workflow

Recommended deployment discipline:

1. open PR from `codex/*` -> `main`
2. require CI success (`typecheck`, `lint`, `test`, design/minimal guards, `build`, E2E)
3. squash merge
4. deploy from clean `main`

Useful commands:

```bash
gh pr create
gh pr view --web
gh run list
```
